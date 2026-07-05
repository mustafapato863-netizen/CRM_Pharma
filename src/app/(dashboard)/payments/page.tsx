import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/shared/config/metadata";
import { PageShell } from "@/components/page-shell";
import { Unauthorized } from "@/components/unauthorized";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { getPartyFinancialSummaries } from "@/features/parties/services/party-financial.service";
import { PaymentsCenter } from "@/features/payments/components/payments-center";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("payments");
  return createPageMetadata(t("title"), t("description"));
}

export default async function PaymentsPage() {
  const t = await getTranslations("payments");
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "ledger")) return <Unauthorized />;

  const [parties, invoices] = await Promise.all([
    prisma.party.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true, nameEn: true, type: true, isActive: true, openingBalance: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.invoice.findMany({
      where: { type: { in: [InvoiceType.PURCHASE, InvoiceType.SALES] } },
      include: {
        party: { select: { id: true, name: true, type: true } },
      },
      orderBy: [{ invoiceDate: "desc" }],
    }),
  ]);

  const summaries = await getPartyFinancialSummaries(parties.map((party) => ({ id: party.id, openingBalance: party.openingBalance })));
  const partyRows = parties.map((party) => ({
    id: party.id,
    code: party.code,
    name: party.name,
    nameEn: party.nameEn,
    type: party.type,
    isActive: party.isActive,
    currentBalance: summaries.get(party.id)?.currentBalance ?? party.openingBalance.toString(),
    balanceType: summaries.get(party.id)?.balanceType ?? "Settled",
    lastTransactionAt: summaries.get(party.id)?.lastTransactionAt ?? null,
  }));

  const customerInvoices = invoices
    .filter((invoice) => invoice.type === InvoiceType.SALES)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      partyId: invoice.partyId,
      partyName: invoice.party.name,
      type: invoice.type,
      remainingAmount: invoice.remainingAmount.toString(),
      paymentStatus: invoice.paymentStatus,
    }));

  const supplierInvoices = invoices
    .filter((invoice) => invoice.type === InvoiceType.PURCHASE)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      partyId: invoice.partyId,
      partyName: invoice.party.name,
      type: invoice.type,
      remainingAmount: invoice.remainingAmount.toString(),
      paymentStatus: invoice.paymentStatus,
    }));

  return (
    <PageShell>
      <AppPageHeader title={t("title")} description={t("description")} />
      <PaymentsCenter parties={partyRows} customerInvoices={customerInvoices} supplierInvoices={supplierInvoices} />
    </PageShell>
  );
}
