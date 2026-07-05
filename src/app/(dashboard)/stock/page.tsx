import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/shared/config/metadata";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";
import { StockMovementQuickEntry } from "@/features/inventory/components/stock-movement-quick-entry";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("stock");
  return createPageMetadata(t("title"), t("description"));
}

export default async function StockPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "stockInView") && !hasPermission(session.user.permissions, "stockOutView")) return <Unauthorized />;

  const params = await searchParams;
  const mode = params?.mode === "out" ? "out" : "in";
  const canCreateIn = hasPermission(session.user.permissions, "stockInCreate");
  const canCreateOut = hasPermission(session.user.permissions, "stockOutCreate");

  const [products, parties, batches, movements] = await Promise.all([
    prisma.product.findMany({ select: { id: true, code: true, name: true, searchName: true, unit: true }, orderBy: [{ code: "asc" }] }),
    prisma.party.findMany({ select: { id: true, code: true, name: true, nameEn: true, mobile: true, phone: true, type: true, isActive: true, openingBalance: true }, orderBy: [{ name: "asc" }] }),
    prisma.batch.findMany({ include: { stockMovements: { select: { type: true, quantity: true } } }, orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }] }),
    prisma.stockMovement.findMany({
      include: {
        product: { select: { id: true, code: true, name: true, searchName: true, unit: true } },
        batch: { select: { id: true, batchNumber: true, expiryDate: true, openingQty: true, purchaseCost: true } },
        party: { select: { id: true, code: true, name: true, type: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ movementAt: "desc" }],
      take: 20,
    }),
  ]);

  let lowStockCount = 0;

  const batchesByProduct = batches.reduce<Record<string, Array<{ id: string; batchNumber: string; expiryDate?: string | null; currentQuantity: string }>>>((acc, batch) => {
    const currentQuantity = calculateBatchQuantity({ openingQty: batch.openingQty, stockMovements: batch.stockMovements });
    if (currentQuantity.gt(0) && currentQuantity.lte(10)) lowStockCount += 1;
    acc[batch.productId] ??= [];
    acc[batch.productId].push({
      id: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate?.toISOString() ?? null,
      currentQuantity: currentQuantity.toString(),
    });
    return acc;
  }, {});

  const rows = movements.map((movement) => ({
    id: movement.id,
    type: movement.type,
    productLabel: `${movement.product.code} - ${movement.product.name}`,
    batchNumber: movement.batch?.batchNumber ?? "-",
    quantity: `${movement.quantity.toString()} ${movement.product.unit}`,
    reference: movement.reference ?? "",
    movementAt: movement.movementAt.toISOString().slice(0, 16).replace("T", " "),
    userName: movement.user.name ?? movement.user.email,
  }));

  return (
    <PageShell>
      <StockMovementQuickEntry
        products={products}
        batchesByProduct={batchesByProduct}
        parties={parties.map((party) => ({
          ...party,
          openingBalance: party.openingBalance.toString(),
        }))}
        rows={rows}
        canCreateIn={canCreateIn}
        canCreateOut={canCreateOut}
        initialMode={mode}
        lowStockCount={lowStockCount}
      />
    </PageShell>
  );
}
