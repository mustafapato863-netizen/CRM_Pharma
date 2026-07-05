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
import { ReturnsCenter } from "@/features/returns/components/returns-center";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("returns");
  return createPageMetadata(t("title"), t("description"));
}

export default async function ReturnsPage() {
  const t = await getTranslations("returns");
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "ledger")) return <Unauthorized />;

  const [salesInvoices, purchaseInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { type: InvoiceType.SALES },
      include: {
        party: { select: { id: true, name: true, type: true } },
        lines: {
          include: {
            product: { select: { id: true, name: true } },
            batch: { select: { id: true, batchNumber: true } },
          },
        },
      },
      orderBy: [{ invoiceDate: "desc" }],
    }),
    prisma.invoice.findMany({
      where: { type: InvoiceType.PURCHASE },
      include: {
        party: { select: { id: true, name: true, type: true } },
        lines: {
          include: {
            product: { select: { id: true, name: true } },
            batch: { select: { id: true, batchNumber: true } },
          },
        },
      },
      orderBy: [{ invoiceDate: "desc" }],
    }),
  ]);

  const mapInvoice = (invoice: typeof salesInvoices[number]) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    partyId: invoice.partyId,
    partyName: invoice.party.name,
    partyType: invoice.party.type,
    type: invoice.type,
    invoiceDate: invoice.invoiceDate.toISOString(),
    lines: invoice.lines.map((line) => ({
      id: line.id,
      productId: line.productId,
      batchId: line.batchId,
      productName: line.product.name,
      batchNumber: line.batch?.batchNumber ?? null,
      quantity: line.quantity.toString(),
      unitPrice: line.unitPrice.toString(),
    })),
  });

  return (
    <PageShell>
      <AppPageHeader title={t("title")} description={t("description")} />
      <ReturnsCenter salesInvoices={salesInvoices.map(mapInvoice)} purchaseInvoices={purchaseInvoices.map(mapInvoice)} />
    </PageShell>
  );
}
