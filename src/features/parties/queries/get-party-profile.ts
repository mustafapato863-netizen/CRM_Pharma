import { LedgerEntryType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPartyFinancialSummaries } from "../services/party-financial.service";

function toNumber(value: Prisma.Decimal | string | number) {
  return Number(value);
}

function formatAmount(value: Prisma.Decimal | string | number) {
  return toNumber(value).toFixed(2);
}

function ledgerSignedAmount(type: LedgerEntryType, amount: number) {
  if (type === "SUPPLIER_BALANCE" || type === "DUE_PAYMENT") return -amount;
  return amount;
}

export async function getPartyProfile(partyId: string) {
  const [party, recentInvoices, recentLedgerEntries] = await Promise.all([
    prisma.party.findUnique({
      where: { id: partyId },
      select: {
        id: true,
        code: true,
        name: true,
        nameEn: true,
        searchName: true,
        type: true,
        mobile: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        taxNumber: true,
        commercialRegister: true,
        isActive: true,
        notes: true,
        openingBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { partyId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ invoiceDate: "desc" }],
      take: 5,
    }),
    prisma.ledgerEntry.findMany({
      where: { partyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
  ]);

  if (!party) return null;

  const summaryMap = await getPartyFinancialSummaries([{ id: party.id, openingBalance: party.openingBalance }]);
  const summary = summaryMap.get(party.id) ?? {
    currentBalance: formatAmount(party.openingBalance),
    balanceType: "Settled" as const,
    lastTransactionAt: null,
    ledgerEntryCount: 0,
  };

  const invoices = recentInvoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    invoiceDate: invoice.invoiceDate.toISOString(),
    paymentStatus: invoice.paymentStatus,
    grandTotal: formatAmount(invoice.grandTotal),
    paidAmount: formatAmount(invoice.paidAmount),
    remainingAmount: formatAmount(invoice.remainingAmount),
    reference: invoice.reference,
    notes: invoice.notes,
    createdBy: invoice.createdBy.name ?? invoice.createdBy.email,
  }));

  const ledger = recentLedgerEntries.map((entry) => {
    const amount = toNumber(entry.amount);
    return {
      id: entry.id,
      createdAt: entry.createdAt.toISOString(),
      type: entry.type,
      status: entry.status,
      amount: formatAmount(amount),
      signedAmount: formatAmount(ledgerSignedAmount(entry.type, amount)),
      reference: entry.notes ?? "",
      notes: entry.notes,
      user: entry.user.name ?? entry.user.email,
    };
  });

  const payments = ledger.filter((entry) => entry.type === "DUE_PAYMENT");

  return {
    party: {
      id: party.id,
      code: party.code,
      name: party.name,
      nameEn: party.nameEn,
      searchName: party.searchName,
      type: party.type,
      mobile: party.mobile,
      phone: party.phone,
      email: party.email,
      address: party.address,
      city: party.city,
      taxNumber: party.taxNumber,
      commercialRegister: party.commercialRegister,
      isActive: party.isActive,
      notes: party.notes,
      openingBalance: party.openingBalance.toString(),
      createdAt: party.createdAt.toISOString(),
      updatedAt: party.updatedAt.toISOString(),
    },
    summary,
    invoices,
    payments,
    ledger,
  };
}
