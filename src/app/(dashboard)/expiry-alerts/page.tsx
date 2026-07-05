import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { Unauthorized } from "@/components/unauthorized";
import { createPageMetadata } from "@/shared/config/metadata";
import { getExpiryAlerts } from "@/features/expiry-alerts/queries/get-expiry-alerts";
import { ExpiryAlertsCenter } from "@/features/expiry-alerts/components/expiry-alerts-center";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("expiryAlerts");
  return createPageMetadata(t("title"), t("description"));
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ExpiryAlertsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "reports"))
    return <Unauthorized />;

  const search = getParam(resolvedSearchParams, "search");
  const windowParam = getParam(resolvedSearchParams, "window") as any;
  const stock = getParam(resolvedSearchParams, "stock") || "all";
  const productId = getParam(resolvedSearchParams, "productId");
  const sortField = (getParam(resolvedSearchParams, "sortField") ||
    "expiryDate") as any;
  const sortDirection = (getParam(resolvedSearchParams, "sortDirection") ||
    "asc") as any;
  const page = resolvedSearchParams.page
    ? Number(getParam(resolvedSearchParams, "page"))
    : 1;
  const pageSize = resolvedSearchParams.pageSize
    ? Number(getParam(resolvedSearchParams, "pageSize"))
    : 50;

  const initialFilters = {
    search,
    window: windowParam || "at-risk",
    stock: stock as "available" | "all",
    productId,
    sortField,
    sortDirection,
    page,
    pageSize,
  };

  const [products, expiryData, t] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, code: true },
      orderBy: [{ name: "asc" }],
    }),
    getExpiryAlerts(initialFilters),
    getTranslations("expiryAlerts"),
  ]);

  return (
    <PageShell>
      <AppPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[{ label: t("title") }]}
      />
      <ExpiryAlertsCenter
        products={products}
        rows={expiryData.rows}
        totalCount={expiryData.totalCount}
        summaries={expiryData.summaries}
        initialFilters={initialFilters}
      />
    </PageShell>
  );
}
