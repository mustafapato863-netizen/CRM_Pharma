"use server";

import { InvoiceType, LedgerEntryType, LedgerStatus, Prisma, StockMovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";

type ReturnType = "SALES_RETURN" | "PURCHASE_RETURN";

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function ensureAccess() {
  const session = await auth();
  await requirePermission(session, "ledger");
  return session;
}

export async function createReturnAction(type: ReturnType, _: unknown, formData: FormData) {
  const session = await ensureAccess();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const date = parseDate(String(formData.get("date") ?? ""));
  const reference = String(formData.get("reference") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const linePayload = JSON.parse(String(formData.get("lines") ?? "[]")) as Array<{ lineId: string; quantity: string }>;

  if (!invoiceId) return { error: "Invoice is required." };
  if (!date) return { error: "Date is invalid." };
  if (date > new Date()) return { error: "Date cannot be in the future." };
  if (!linePayload.length) return { error: "At least one line is required." };

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      party: { select: { id: true, type: true, isActive: true, name: true, code: true } },
      lines: {
        include: {
          product: { select: { id: true, code: true, name: true, unit: true } },
          batch: {
            select: {
              id: true,
              productId: true,
              openingQty: true,
              expiryDate: true,
              stockMovements: { select: { type: true, quantity: true } },
            },
          },
        },
      },
    },
  });

  if (!invoice) return { error: "Invoice not found." };
  if (!invoice.party.isActive) return { error: "Selected party is inactive." };
  if (type === "SALES_RETURN" && invoice.type !== InvoiceType.SALES) return { error: "Select a sales invoice." };
  if (type === "PURCHASE_RETURN" && invoice.type !== InvoiceType.PURCHASE) return { error: "Select a purchase invoice." };

  const lineMap = new Map(invoice.lines.map((line) => [line.id, line]));
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized." };

  const result = await prisma.$transaction(async (tx) => {
    for (const payloadLine of linePayload) {
      const sourceLine = lineMap.get(payloadLine.lineId);
      if (!sourceLine) return { error: "Invoice line not found." };
      const quantity = new Prisma.Decimal(payloadLine.quantity);
      if (quantity.lte(0)) return { error: "Quantity must be greater than zero." };
      if (quantity.gt(sourceLine.quantity)) return { error: "Return quantity cannot exceed original invoice quantity." };

      if (!sourceLine.batchId) return { error: "Original invoice line is missing batch information." };

      if (type === "SALES_RETURN") {
        const batch = await tx.batch.findUnique({
          where: { id: sourceLine.batchId },
          select: { id: true, openingQty: true, stockMovements: { select: { type: true, quantity: true } } },
        });
        if (!batch) return { error: "Batch not found." };
        const available = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
        if (available.lt(0)) return { error: "Batch stock is invalid." };

        await tx.stockMovement.create({
          data: {
            productId: sourceLine.productId,
            batchId: batch.id,
            userId,
            partyId: invoice.partyId,
            type: StockMovementType.STOCK_IN,
            quantity,
            reason: `Sales return for invoice ${invoice.invoiceNumber}`,
            reference: reference.trim() || invoice.invoiceNumber,
            movementAt: date,
          },
        });
      } else {
        const batch = await tx.batch.findUnique({
          where: { id: sourceLine.batchId },
          select: { id: true, openingQty: true, stockMovements: { select: { type: true, quantity: true } } },
        });
        if (!batch) return { error: "Batch not found." };
        const available = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
        if (quantity.gt(available)) return { error: "Return quantity cannot exceed available stock." };

        await tx.stockMovement.create({
          data: {
            productId: sourceLine.productId,
            batchId: batch.id,
            userId,
            partyId: invoice.partyId,
            type: StockMovementType.STOCK_OUT,
            quantity,
            reason: `Purchase return for invoice ${invoice.invoiceNumber}`,
            reference: reference.trim() || invoice.invoiceNumber,
            movementAt: date,
          },
        });
      }
    }

    const amount = linePayload.reduce((sum, payloadLine) => {
      const sourceLine = lineMap.get(payloadLine.lineId);
      if (!sourceLine) return sum;
      return sum.plus(new Prisma.Decimal(payloadLine.quantity).times(sourceLine.unitPrice));
    }, new Prisma.Decimal(0));

    await tx.ledgerEntry.create({
      data: {
        partyId: invoice.partyId,
        userId,
        type: LedgerEntryType.DUE_PAYMENT,
        status: LedgerStatus.PAID,
        amount,
        notes: notes.trim() || `Return against ${invoice.invoiceNumber}`,
        dueDate: date,
        paidAt: date,
      },
    });

    return { success: true };
  });

  if ("error" in result) return result;

  revalidatePath("/ledger");
  revalidatePath("/reports");
  revalidatePath("/parties");
  revalidatePath(`/parties/${invoice.partyId}`);
  return result;
}
