import type { LedgerEntryType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PartyBalanceType, PartyFinancialSummary } from "../types";

type PartyFinancialInput = {
  id: string;
  openingBalance: Prisma.Decimal | string | number;
};

type PartyFinancialEntry = {
  partyId: string;
  type: LedgerEntryType;
  amount: Prisma.Decimal | string | number;
  createdAt: Date;
};

function formatAmount(value: number) {
  return value.toFixed(2);
}

function signedLedgerAmount(type: LedgerEntryType, amount: number) {
  if (type === "SUPPLIER_BALANCE" || type === "DUE_PAYMENT") return -amount;
  return amount;
}

function getBalanceType(balance: number): PartyBalanceType {
  if (balance > 0) return "Receivable";
  if (balance < 0) return "Payable";
  return "Settled";
}

function toNumber(value: Prisma.Decimal | string | number) {
  return Number(value);
}

function createSummary(openingBalance: number, entries: PartyFinancialEntry[]): PartyFinancialSummary {
  let balance = openingBalance;
  for (const entry of entries) {
    balance += signedLedgerAmount(entry.type, toNumber(entry.amount));
  }

  const lastTransactionAt = entries.length ? entries[entries.length - 1].createdAt.toISOString() : null;

  return {
    currentBalance: formatAmount(balance),
    balanceType: getBalanceType(balance),
    lastTransactionAt,
    ledgerEntryCount: entries.length,
  };
}

export async function getPartyFinancialSummaries(partyInputs: PartyFinancialInput[]) {
  const partyIds = partyInputs.map((party) => party.id);
  if (!partyIds.length) return new Map<string, PartyFinancialSummary>();

  const entries = await prisma.ledgerEntry.findMany({
    where: { partyId: { in: partyIds } },
    select: { partyId: true, type: true, amount: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }],
  });

  const grouped = new Map<string, PartyFinancialEntry[]>();
  for (const entry of entries) {
    const list = grouped.get(entry.partyId) ?? [];
    list.push(entry);
    grouped.set(entry.partyId, list);
  }

  return new Map(
    partyInputs.map((party) => {
      const summary = createSummary(toNumber(party.openingBalance), grouped.get(party.id) ?? []);
      return [party.id, summary] as const;
    })
  );
}

export async function getPartyFinancialSnapshot(partyId: string, openingBalance: Prisma.Decimal | string | number) {
  const [entries, invoices] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: { partyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        party: { select: { id: true, name: true, type: true, code: true } },
      },
      orderBy: [{ createdAt: "asc" }],
    }),
    prisma.invoice.findMany({
      where: { partyId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ invoiceDate: "asc" }],
    }),
  ]);

  const summary = createSummary(toNumber(openingBalance), entries);

  const normalizedInvoices = invoices.map((invoice) => ({
    id: `invoice-${invoice.id}`,
    date: invoice.invoiceDate.toISOString(),
    reference: `${invoice.type === "PURCHASE" ? "Purchase" : "Sales"} invoice ${invoice.invoiceNumber}`,
    type: invoice.type === "PURCHASE" ? "PURCHASE_INVOICE" : "SALES_INVOICE",
    amount: formatAmount(toNumber(invoice.grandTotal)),
    signedAmount: formatAmount(invoice.type === "PURCHASE" ? -toNumber(invoice.grandTotal) : toNumber(invoice.grandTotal)),
    runningBalance: "0.00",
    status: invoice.paymentStatus,
    notes: invoice.notes ?? "",
    createdBy: invoice.createdBy.name ?? invoice.createdBy.email,
    partyName: "",
    partyCode: "",
    partyType: "",
  }));

  const normalizedLedger = entries.map((entry) => {
    const amount = toNumber(entry.amount);
    const signedAmount = signedLedgerAmount(entry.type, amount);
    return {
      id: entry.id,
      date: entry.createdAt.toISOString(),
      reference: entry.notes ?? "",
      type: entry.type,
      amount: formatAmount(amount),
      signedAmount: formatAmount(signedAmount),
      runningBalance: "0.00",
      status: entry.status,
      notes: entry.notes ?? "",
      createdBy: entry.user.name ?? entry.user.email,
      partyName: entry.party.name,
      partyCode: entry.party.code,
      partyType: entry.party.type,
    };
  });

  const timeline = [...normalizedInvoices, ...normalizedLedger].sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = toNumber(openingBalance);
  const statement = timeline.map((entry) => {
    const signedAmount = toNumber(entry.signedAmount);
    runningBalance += signedAmount;
    return {
      ...entry,
      runningBalance: formatAmount(runningBalance),
    };
  });

  return { summary, statement };
}
