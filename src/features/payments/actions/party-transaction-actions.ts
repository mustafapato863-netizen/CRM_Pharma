"use server";

import { InvoicePaymentStatus, LedgerEntryType, LedgerStatus, Prisma, PartyType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type TransactionKind = "RECEIPT" | "PAYMENT";

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function updateInvoicePayment(tx: Prisma.TransactionClient, invoiceId: string, amount: Prisma.Decimal) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, paidAmount: true, grandTotal: true, paymentStatus: true },
  });
  if (!invoice) return null;

  const paidAmount = new Prisma.Decimal(invoice.paidAmount).plus(amount);
  const remainingAmount = new Prisma.Decimal(invoice.grandTotal).minus(paidAmount);
  const paymentStatus =
    remainingAmount.lte(0)
      ? InvoicePaymentStatus.PAID
      : paidAmount.gt(0)
        ? InvoicePaymentStatus.PARTIAL
        : InvoicePaymentStatus.UNPAID;

  await tx.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount, remainingAmount, paymentStatus },
  });

  return { paidAmount, remainingAmount, paymentStatus };
}

async function ensureAccess() {
  const session = await auth();
  await requirePermission(session, "ledger");
  return session;
}

export async function recordPartyTransactionAction(kind: TransactionKind, _: unknown, formData: FormData) {
  const session = await ensureAccess();
  const partyId = String(formData.get("partyId") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amount = new Prisma.Decimal(String(formData.get("amount") ?? "0"));
  const paymentDate = parseDate(String(formData.get("date") ?? ""));
  const reference = String(formData.get("reference") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!partyId) return { error: "Party is required." };
  if (amount.lte(0)) return { error: "Amount must be greater than zero." };
  if (!paymentDate) return { error: "Date is invalid." };
  if (paymentDate > new Date()) return { error: "Date cannot be in the future." };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { id: true, type: true, isActive: true },
  });
  if (!party || !party.isActive) return { error: "Selected party is invalid or inactive." };
  if (kind === "RECEIPT" && party.type === PartyType.SUPPLIER) return { error: "Receipts require a customer party." };
  if (kind === "PAYMENT" && party.type === PartyType.CUSTOMER) return { error: "Payments require a supplier party." };

  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized." };

  const result = await prisma.$transaction(async (tx) => {
    if (invoiceId) {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, partyId: true, remainingAmount: true, paidAmount: true, paymentStatus: true, type: true, grandTotal: true },
      });
      if (!invoice) return { error: "Invoice not found." };
      if (invoice.partyId !== party.id) return { error: "Invoice does not belong to selected party." };

      const remaining = new Prisma.Decimal(invoice.remainingAmount);
      if (amount.gt(remaining)) return { error: "Cannot overpay invoice unless explicitly allowed by business rules." };
      const updated = await updateInvoicePayment(tx, invoice.id, amount);
      if (!updated) return { error: "Invoice not found." };
    }

    const entry = await tx.ledgerEntry.create({
      data: {
        partyId: party.id,
        userId,
        type: LedgerEntryType.DUE_PAYMENT,
        status: amount.gte(0) ? LedgerStatus.PAID : LedgerStatus.PENDING,
        amount,
        notes: notes.trim() || `${kind === "RECEIPT" ? "Receipt" : "Payment"} ${reference || ""}`.trim(),
        dueDate: paymentDate,
        paidAt: paymentDate,
      },
      select: { id: true },
    });

    return { success: true, id: entry.id };
  });

  if ("error" in result) return result;

  revalidatePath("/ledger");
  revalidatePath("/reports");
  revalidatePath("/parties");
  if (invoiceId) revalidatePath(`/parties/${partyId}`);
  return result;
}
