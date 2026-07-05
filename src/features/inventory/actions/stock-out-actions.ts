"use server";

import { Prisma, StockMovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";
import { stockOutSchema } from "../schemas/stock-out.schema";

async function ensureAccess(permission: "stockInView" | "stockInCreate" | "stockOutView" | "stockOutCreate") {
  const session = await auth();
  await requirePermission(session, permission);
  return session;
}

function parseDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createStockOutAction(_: unknown, formData: FormData) {
  const session = await ensureAccess("stockOutCreate");
  const parsed = stockOutSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    batchId: String(formData.get("batchId") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    reference: String(formData.get("reference") ?? ""),
    movementAt: String(formData.get("movementAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    confirmSave: formData.get("confirmSave") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid stock out data." };
  if (!parsed.data.confirmSave) return { error: "Please confirm save before submitting." };

  const movementAt = parseDateTime(parsed.data.movementAt);
  if (!movementAt) return { error: "Movement date is invalid." };
  if (movementAt > new Date()) return { error: "Movement date cannot be in the future." };

  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized." };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, code: true, name: true, isActive: true },
  });
  if (!product) return { error: "Product not found." };
  if (!product.isActive) return { error: "Selected product is inactive." };

  const batch = await prisma.batch.findUnique({
    where: { id: parsed.data.batchId },
    select: {
      id: true,
      productId: true,
      batchNumber: true,
      expiryDate: true,
      openingQty: true,
      stockMovements: {
        select: { type: true, quantity: true },
      },
    },
  });
  if (!batch) return { error: "Batch not found." };
  if (batch.productId !== product.id) return { error: "Selected batch does not belong to the selected product." };

  const availableQuantity = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
  const quantity = new Prisma.Decimal(parsed.data.quantity);
  if (quantity.lte(0)) return { error: "Quantity must be greater than zero." };
  if (availableQuantity.lte(0)) return { error: "Selected batch has no available quantity." };
  if (quantity.gt(availableQuantity)) return { error: "Quantity cannot exceed available stock." };

  const result = await prisma.$transaction(async (tx) => {
    const lockedBatch = await tx.batch.findUnique({
      where: { id: batch.id },
      select: {
        id: true,
        productId: true,
        openingQty: true,
        stockMovements: {
          select: { type: true, quantity: true },
        },
      },
    });

    if (!lockedBatch) return { error: "Batch not found." };
    const remaining = calculateBatchQuantity({ openingQty: lockedBatch.openingQty, stockMovements: lockedBatch.stockMovements });
    if (remaining.lte(0)) return { error: "Selected batch has no available quantity." };
    if (quantity.gt(remaining)) return { error: "Quantity cannot exceed available stock." };

    const movement = await tx.stockMovement.create({
      data: {
        productId: product.id,
        batchId: lockedBatch.id,
        userId,
        type: StockMovementType.STOCK_OUT,
        quantity,
        reason: parsed.data.notes.trim() || null,
        reference: parsed.data.reference.trim() || null,
        movementAt,
      },
      select: { id: true },
    });

    return { success: true, movementId: movement.id };
  });

  if (result && typeof result === "object" && "error" in result && result.error) return result;

  revalidatePath("/stock/out");
  revalidatePath("/stock");
  return { success: true };
}
