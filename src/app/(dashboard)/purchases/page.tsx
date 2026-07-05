import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PartyType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/shared/config/metadata";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { InvoiceWorkspace } from "@/features/invoices/components/invoice-workspace";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";
import { getPartyFinancialSummaries } from "@/features/parties/services/party-financial.service";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invoices");
  return createPageMetadata(t("purchaseTitle"), t("purchaseDescription"));
}

export default async function PurchaseInvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "stockInView")) return <Unauthorized />;
  const canCreate = hasPermission(session.user.permissions, "stockInCreate");
  const t = await getTranslations("invoices");

  const [parties, products, batches] = await Promise.all([
    prisma.party.findMany({
      where: { isActive: true, type: { in: [PartyType.SUPPLIER, PartyType.BOTH] } },
      select: { id: true, code: true, name: true, nameEn: true, type: true, isActive: true, openingBalance: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true, searchName: true, unit: true, isActive: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.batch.findMany({
      include: { stockMovements: { select: { type: true, quantity: true } } },
      orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const summaries = await getPartyFinancialSummaries(parties.map((party) => ({ id: party.id, openingBalance: party.openingBalance })));

  const batchRows = batches.reduce<Record<string, Array<{ id: string; productId: string; batchNumber: string; expiryDate: string | null; currentQuantity: string; purchaseCost?: string | null }>>>((acc, batch) => {
    const currentQuantity = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
    acc[batch.productId] ??= [];
    acc[batch.productId].push({
      id: batch.id,
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate?.toISOString() ?? null,
      currentQuantity: currentQuantity.toString(),
      purchaseCost: batch.purchaseCost?.toString() ?? null,
    });
    return acc;
  }, {});

  return (
    <PageShell>
      <AppPageHeader title={t("purchaseTitle")} description={t("purchaseDescription")} />
      <InvoiceWorkspace
        mode="purchase"
        title={t("purchaseWorkspaceTitle")}
        description={t("purchaseWorkspaceDescription")}
        parties={parties.map((party) => ({
          id: party.id,
          code: party.code,
          name: party.name,
          nameEn: party.nameEn,
          type: party.type,
          isActive: party.isActive,
          currentBalance: summaries.get(party.id)?.currentBalance ?? party.openingBalance.toString(),
          balanceType: summaries.get(party.id)?.balanceType ?? "Settled",
          lastTransactionAt: summaries.get(party.id)?.lastTransactionAt ?? null,
        }))}
        products={products}
        batchesByProduct={batchRows}
        canCreate={canCreate}
      />
    </PageShell>
  );
}
