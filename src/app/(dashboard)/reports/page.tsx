import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { createPageMetadata } from "@/shared/config/metadata";
import { ReportsCenter } from "@/features/reports/components/reports-center";
import {
  getReportCategory,
  getReportsSummary,
} from "@/features/reports/queries/get-report-category";

export async function generateMetadata() {
  const t = await getTranslations("reports");
  return createPageMetadata(t("title"), t("description"));
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "reports"))
    return <Unauthorized />;

  const tab = getParam(resolvedSearchParams, "tab") || "stock";
  const search = getParam(resolvedSearchParams, "search");
  const from = getParam(resolvedSearchParams, "from");
  const to = getParam(resolvedSearchParams, "to");
  const page = resolvedSearchParams.page
    ? Number(getParam(resolvedSearchParams, "page"))
    : 1;
  const pageSize = resolvedSearchParams.pageSize
    ? Number(getParam(resolvedSearchParams, "pageSize"))
    : 50;

  const [summaries, categoryData] = await Promise.all([
    getReportsSummary(),
    getReportCategory({
      category: tab,
      search,
      from,
      to,
      page,
      pageSize,
    }),
  ]);

  const initialFilters = {
    tab,
    search,
    from,
    to,
    page,
    pageSize,
  };

  return (
    <PageShell>
      <ReportsCenter
        summaries={summaries}
        rows={categoryData.rows}
        totalCount={categoryData.totalCount}
        initialFilters={initialFilters}
      />
    </PageShell>
  );
}
