import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { Unauthorized } from "@/components/unauthorized";
import { LedgerPageClient } from "@/features/ledger/components/ledger-page-client";
import type { LedgerPartyRow } from "@/features/ledger/types";
import { getPartyFinancialSummaries } from "@/features/parties/services/party-financial.service";
import { getLedgerWorkspace } from "@/features/ledger/queries/get-ledger-workspace";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ledger");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LedgerPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "ledger"))
    return <Unauthorized />;

  const initialFilters = {
    partyId: getParam(resolvedSearchParams, "partyId"),
    partyType:
      getParam(resolvedSearchParams, "partyType") ||
      getParam(resolvedSearchParams, "type"),
    movementType:
      getParam(resolvedSearchParams, "movementType") ||
      getParam(resolvedSearchParams, "status"),
    status: getParam(resolvedSearchParams, "status"),
    reference: getParam(resolvedSearchParams, "reference"),
    search: getParam(resolvedSearchParams, "search"),
    from: getParam(resolvedSearchParams, "from"),
    to: getParam(resolvedSearchParams, "to"),
    page: resolvedSearchParams.page
      ? Number(getParam(resolvedSearchParams, "page"))
      : 1,
    pageSize: resolvedSearchParams.pageSize
      ? Number(getParam(resolvedSearchParams, "pageSize"))
      : 50,
  };

  const [parties, workspaceData] = await Promise.all([
    prisma.party.findMany({
      select: {
        id: true,
        name: true,
        searchName: true,
        type: true,
        isActive: true,
        openingBalance: true,
      },
      orderBy: [{ name: "asc" }],
    }),
    getLedgerWorkspace(initialFilters),
  ]);

  const financialSummaries = await getPartyFinancialSummaries(
    parties.map((party) => ({
      id: party.id,
      openingBalance: party.openingBalance,
    })),
  );

  const visibleParties: LedgerPartyRow[] = parties.map((party) => {
    const summary = financialSummaries.get(party.id);
    return {
      id: party.id,
      name: party.name,
      searchName: party.searchName,
      type: party.type,
      isActive: party.isActive,
      openingBalance: party.openingBalance.toString(),
      currentBalance:
        summary?.currentBalance ?? party.openingBalance.toString(),
      balanceType: summary?.balanceType ?? "Settled",
      lastTransactionAt: summary?.lastTransactionAt ?? null,
    };
  });

  const canExport = hasPermission(session.user.permissions, "ledger");
  const t = await getTranslations("ledger");

  return (
    <PageShell>
      <AppPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[{ label: t("title") }]}
      />
      <LedgerPageClient
        parties={visibleParties}
        rows={workspaceData.rows}
        totalCount={workspaceData.totalCount}
        totals={workspaceData.totals}
        initialFilters={initialFilters}
        canExport={canExport}
      />
    </PageShell>
  );
}
