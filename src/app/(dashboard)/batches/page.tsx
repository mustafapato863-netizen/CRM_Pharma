import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { BatchesToolbar } from "@/features/batches/components/batches-toolbar";
import { BatchesTable } from "@/features/batches/components/batches-table";
import type { BatchRow } from "@/features/batches/types";
import { calculateBatchQuantity, getBatchStatus } from "@/features/batches/utils/quantity";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("batches");
  return { title: t("title"), description: t("description") };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function BatchesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "batchView")) return <Unauthorized />;

  const [t, batches, resolvedSearchParams] = await Promise.all([
    getTranslations("batches"),
    prisma.batch.findMany({
      include: {
        product: { select: { id: true, code: true, name: true, searchName: true } },
        stockMovements: { select: { type: true, quantity: true } },
      },
      orderBy: [{ expiryDate: "asc" }, { createdAt: "desc" }],
    }),
    searchParams ?? Promise.resolve({}),
  ]);

  const rows: BatchRow[] = batches.map((batch) => {
    const currentQuantity = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
    return {
      id: batch.id,
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate?.toISOString() ?? null,
      purchaseCost: batch.purchaseCost?.toString() ?? null,
      openingQty: batch.openingQty.toString(),
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      product: batch.product,
      stockMovements: batch.stockMovements.map((movement) => ({ type: movement.type, quantity: movement.quantity.toString() })),
      currentQuantity: currentQuantity.toString(),
      status: getBatchStatus({ expiryDate: batch.expiryDate, currentQuantity }),
      movementCount: batch.stockMovements.length,
    };
  });

  return (
    <PageShell>
      <AppPageHeader
        title={t("title")}
        description={t("description")}
        action={<BatchesToolbar batches={rows} canCreate={hasPermission(session.user.permissions, "batchCreate")} />}
      />
      <BatchesTable
        data={rows}
        canEdit={hasPermission(session.user.permissions, "batchEdit")}
        canDelete={hasPermission(session.user.permissions, "batchDelete")}
        initialProductId={getParam(resolvedSearchParams, "productId") || undefined}
      />
    </PageShell>
  );
}
