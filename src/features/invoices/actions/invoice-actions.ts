"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import {
  InvoiceType,
  InvoicePaymentStatus,
  StockMovementType,
  LedgerEntryType,
  LedgerStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreateInvoiceInput = {
  type: "SALES" | "PURCHASE";
  partyId: string;
  invoiceDate: string;
  dueDate: string;
  reference?: string;
  notes?: string;
  paymentMethod?: string;
  warehouseId?: string;
  currency?: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  lines: Array<{
    productId: string;
    batchNumber?: string;
    batchId?: string | null;
    expiryDate?: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    lineTotal: number;
  }>;
};

export async function createInvoiceAction(input: CreateInvoiceInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check permissions
  const requiredPermission =
    input.type === "PURCHASE" ? "stockInCreate" : "stockOutCreate";
  if (!hasPermission(session.user.permissions, requiredPermission)) {
    return { success: false, error: "Permission Denied" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate invoice number
      let invoiceNumber = input.reference?.trim();
      
      if (input.type === "SALES" || !invoiceNumber) {
        const prefix = input.type === "SALES" ? "SI" : "PI";
        const year = new Date(input.invoiceDate).getFullYear();
        const count = await tx.invoice.count({
          where: {
            type: input.type as InvoiceType,
            invoiceNumber: { startsWith: `${prefix}-${year}-` },
          },
        });
        invoiceNumber = `${prefix}-${year}-${String(count + 1).padStart(6, "0")}`;
      }

      // Verify invoice number uniqueness
      const existing = await tx.invoice.findUnique({
        where: { invoiceNumber },
      });
      if (existing) {
        if (input.type === "PURCHASE") {
          throw new Error(`Invoice reference "${invoiceNumber}" already exists.`);
        } else {
          // Regenerate with random suffix
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          invoiceNumber = `${invoiceNumber}-${randomSuffix}`;
        }
      }

      // 2. Resolve batches (especially for purchase where new batches are defined)
      const linesWithResolvedBatches = [];
      for (const line of input.lines) {
        let lineBatchId = line.batchId;

        if (input.type === "PURCHASE" && line.batchNumber && !lineBatchId) {
          // Find or create batch
          let batch = await tx.batch.findFirst({
            where: {
              productId: line.productId,
              batchNumber: line.batchNumber,
            },
          });

          if (!batch) {
            batch = await tx.batch.create({
              data: {
                productId: line.productId,
                batchNumber: line.batchNumber,
                expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
                purchaseCost: new Prisma.Decimal(line.unitPrice),
                openingQty: new Prisma.Decimal(0),
              },
            });
          }
          lineBatchId = batch.id;
        }

        linesWithResolvedBatches.push({
          ...line,
          batchId: lineBatchId,
        });
      }

      // 3. Create the Invoice record
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          type: input.type as InvoiceType,
          partyId: input.partyId,
          createdById: session.user.id,
          paymentStatus: input.paymentStatus as InvoicePaymentStatus,
          invoiceDate: new Date(input.invoiceDate),
          reference: input.reference || null,
          notes: input.notes || null,
          subtotal: new Prisma.Decimal(input.subtotal),
          discountTotal: new Prisma.Decimal(input.discountTotal),
          taxTotal: new Prisma.Decimal(input.taxTotal),
          grandTotal: new Prisma.Decimal(input.grandTotal),
          paidAmount: new Prisma.Decimal(input.paidAmount),
          remainingAmount: new Prisma.Decimal(input.remainingAmount),
        },
      });

      // 4. Create the InvoiceLine records
      for (const line of linesWithResolvedBatches) {
        await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            productId: line.productId,
            batchId: line.batchId || null,
            expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
            unit: line.unit,
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            discount: new Prisma.Decimal(line.discount),
            tax: new Prisma.Decimal(line.tax),
            lineTotal: new Prisma.Decimal(line.lineTotal),
          },
        });

        // 5. Create the corresponding StockMovement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            batchId: line.batchId || null,
            partyId: input.partyId,
            userId: session.user.id,
            type:
              input.type === "PURCHASE"
                ? StockMovementType.STOCK_IN
                : StockMovementType.STOCK_OUT,
            quantity: new Prisma.Decimal(line.quantity),
            reference: invoiceNumber,
            reason:
              input.type === "PURCHASE"
                ? `Purchase Invoice ${invoiceNumber}`
                : `Sales Invoice ${invoiceNumber}`,
            movementAt: new Date(input.invoiceDate),
          },
        });
      }

      // 6. Create LedgerEntry if remaining balance > 0
      if (input.remainingAmount > 0) {
        await tx.ledgerEntry.create({
          data: {
            partyId: input.partyId,
            userId: session.user.id,
            type:
              input.type === "SALES"
                ? LedgerEntryType.CUSTOMER_BALANCE
                : LedgerEntryType.SUPPLIER_BALANCE,
            status:
              input.paymentStatus === "PARTIAL"
                ? LedgerStatus.PARTIAL
                : LedgerStatus.PENDING,
            amount: new Prisma.Decimal(input.remainingAmount),
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            notes: `Remaining balance for Invoice ${invoiceNumber}`,
          },
        });
      }

      return invoice;
    });

    revalidatePath("/stock");
    revalidatePath("/batches");
    revalidatePath("/ledger");
    revalidatePath("/reports");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to save invoice:", error);
    return { success: false, error: error.message || "Failed to save invoice" };
  }
}
