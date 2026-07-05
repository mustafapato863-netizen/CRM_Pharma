import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { getProducts } from "@/features/products/queries/get-products";
import { ProductsWorkspace } from "@/features/products/components/products-workspace";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "products")) return <Unauthorized />;

  const resolved = (await searchParams) ?? {};
  const data = await getProducts({
    q: getParam(resolved, "q"),
    type: getParam(resolved, "type"),
    status: getParam(resolved, "status"),
    sortField: getParam(resolved, "sortField") || "updatedAt",
    sortDir: getParam(resolved, "sortDir") === "asc" ? "asc" : "desc",
    page: Number(getParam(resolved, "page") || "1"),
    pageSize: Number(getParam(resolved, "pageSize") || "10"),
  });

  return (
    <PageShell>
      <ProductsWorkspace
        rows={data.rows}
        totalCount={data.totalCount}
        catalogTotalCount={data.catalogTotalCount}
        activeCount={data.activeCount}
        inactiveCount={data.inactiveCount}
        withoutBatchCount={data.withoutBatchCount}
        page={data.page}
        pageSize={data.pageSize}
        canCreate={hasPermission(session.user.permissions, "productsCreate")}
        canEdit={hasPermission(session.user.permissions, "productsEdit")}
      />
    </PageShell>
  );
}
