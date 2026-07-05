import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PartiesWorkspace } from "@/features/parties/components/parties-workspace";
import { getParties } from "@/features/parties/queries/get-parties";
import { createPageMetadata } from "@/shared/config/metadata";
import { PageShell } from "@/components/page-shell";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parties");
  return createPageMetadata(t("title"), t("description"));
}

export default async function PartiesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "partiesView")) return <Unauthorized />;

  const params = (await searchParams) ?? {};
  const parties = await getParties({
    q: typeof params.q === "string" ? params.q : undefined,
    type: typeof params.type === "string" ? params.type : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    sortField: typeof params.sortField === "string" ? params.sortField : undefined,
    sortDir: params.sortDir === "asc" || params.sortDir === "desc" ? params.sortDir : undefined,
    page: typeof params.page === "string" ? Number(params.page) : undefined,
    pageSize: typeof params.pageSize === "string" ? Number(params.pageSize) : undefined,
  });

  return (
    <PageShell>
      <PartiesWorkspace
        rows={parties.rows}
        totalCount={parties.totalCount}
        activeCount={parties.activeCount}
        page={parties.page}
        pageSize={parties.pageSize}
        totalPages={parties.totalPages}
        canCreate={hasPermission(session.user.permissions, "partiesCreate")}
        canEdit={hasPermission(session.user.permissions, "partiesEdit")}
        canDelete={hasPermission(session.user.permissions, "partiesDelete")}
        canExport={hasPermission(session.user.permissions, "partiesExport")}
      />
    </PageShell>
  );
}
