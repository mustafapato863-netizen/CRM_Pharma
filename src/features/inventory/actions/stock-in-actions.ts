"use server";

import { PartyType, Prisma, StockMovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { stockInSchema } from "../schemas/stock-in.schema";

async function ensureAccess(permission: "stockInView" | "stockInCreate") {
  const session = await auth();
  await requirePermission(session, permission);
  return session;
}

function parseDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createStockInAction(_: unknown, formData: FormData) {
  const session = await ensureAccess("stockInCreate");
  const parsed = stockInSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    batchId: String(formData.get("batchId") ?? ""),
    batchNumber: String(formData.get("batchNumber") ?? ""),
    useNewBatch: formData.get("useNewBatch") === "on",
    quantity: String(formData.get("quantity") ?? ""),
    purchasePrice: String(formData.get("purchasePrice") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    reference: String(formData.get("reference") ?? ""),
    movementAt: String(formData.get("movementAt") ?? ""),
    partyId: String(formData.get("partyId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    confirmSave: formData.get("confirmSave") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid stock in data." };
  }

  if (!parsed.data.confirmSave) return { error: "Please confirm save before submitting." };

  const movementAt = parseDateTime(parsed.data.movementAt);
  if (!movementAt) return { error: "Movement date is invalid." };
  if (movementAt > new Date()) return { error: "Movement date cannot be in the future." };

  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized." };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, code: true, name: true },
  });
  if (!product) return { error: "Product not found." };

  const quantity = new Prisma.Decimal(parsed.data.quantity);
  const purchasePrice = new Prisma.Decimal(parsed.data.purchasePrice);

  const result = await prisma.$transaction(async (tx) => {
    let batchId = parsed.data.batchId || null;

    if (parsed.data.useNewBatch || !batchId) {
      const batchNumber = parsed.data.batchNumber.trim() || "DEFAULT";

      const existingBatch = await tx.batch.findUnique({
        where: {
          productId_batchNumber: {
            productId: product.id,
            batchNumber,
          },
        },
        select: { id: true },
      });

      batchId = existingBatch?.id ?? null;

      if (!batchId) {
        const created = await tx.batch.create({
          data: {
            productId: product.id,
            batchNumber,
            expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
            purchaseCost: purchasePrice,
            openingQty: new Prisma.Decimal(0),
          },
          select: { id: true },
        });
        batchId = created.id;
      }
    } else {
      const selectedBatch = await tx.batch.findUnique({
        where: { id: batchId },
        select: { id: true, productId: true },
      });

      if (!selectedBatch) return { error: "Batch not found." };
      if (selectedBatch.productId !== product.id) {
        return { error: "Selected batch does not belong to the selected product." };
      }
    }

    const partyId = parsed.data.partyId || null;
    if (partyId) {
      const party = await tx.party.findUnique({
        where: { id: partyId },
        select: { id: true, type: true },
      });
      if (!party) return { error: "Supplier not found." };
      if (party.type !== PartyType.SUPPLIER && party.type !== PartyType.BOTH) {
        return { error: "Selected party must be a supplier." };
      }
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId: product.id,
        batchId,
        partyId,
        userId,
        type: StockMovementType.STOCK_IN,
        quantity,
        reason: parsed.data.notes.trim() || null,
        reference: parsed.data.reference.trim() || null,
        movementAt,
      },
      select: { id: true },
    });

    return { success: true, movementId: movement.id };
  });

  if (result && typeof result === "object" && "error" in result && result.error) {
    return result;
  }

  revalidatePath("/stock/in");
  revalidatePath("/stock");
  return { success: true };
}
