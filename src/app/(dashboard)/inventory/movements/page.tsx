import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { getInventoryMovements } from "@/features/inventory/queries/get-inventory-movements";
import { InventoryMovementsMuiPage } from "@/features/inventory/components/inventory-movements-mui-page";
import { translations } from "@/shared/config/translations";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale].movements;

  return { title: t.title, description: t.description };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function InventoryMovementsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "reports")) {
    return <Unauthorized />;
  }

  const resolved = (await searchParams) ?? {};
  const data = await getInventoryMovements({
    search: getParam(resolved, "search"),
    from: getParam(resolved, "from"),
    to: getParam(resolved, "to"),
    type: getParam(resolved, "type"),
    productId: getParam(resolved, "productId"),
    batchId: getParam(resolved, "batchId"),
    partyId: getParam(resolved, "partyId"),
    userId: getParam(resolved, "userId"),
    sortField: getParam(resolved, "sortField") || "movementAt",
    sortDir: getParam(resolved, "sortDir") === "asc" ? "asc" : "desc",
    page: Number(getParam(resolved, "page") || "1"),
    pageSize: Number(getParam(resolved, "pageSize") || "10"),
  });

  return (
    <PageShell>
      <InventoryMovementsMuiPage
        rows={data.rows}
        canExport={hasPermission(session.user.permissions, "reports")}
        page={data.page}
        totalCount={data.totalCount}
        metrics={data.metrics}
        filters={{
          search: getParam(resolved, "search"),
          from: getParam(resolved, "from"),
          to: getParam(resolved, "to"),
          type: getParam(resolved, "type"),
          productId: getParam(resolved, "productId"),
          batchId: getParam(resolved, "batchId"),
          partyId: getParam(resolved, "partyId"),
          userId: getParam(resolved, "userId"),
          sortField: getParam(resolved, "sortField"),
          sortDir: getParam(resolved, "sortDir") === "asc" ? "asc" : "desc",
        }}
      />
    </PageShell>
  );
}
