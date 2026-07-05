import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { PartyProfileWorkspace } from "@/features/parties/components/party-profile-workspace";
import { getPartyProfile } from "@/features/parties/queries/get-party-profile";
import { createPageMetadata } from "@/shared/config/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parties");
  return createPageMetadata(t("detailsTitle"), t("profileDescription"));
}

export default async function PartyViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "partiesView")) return <Unauthorized />;

  const profile = await getPartyProfile(id);
  if (!profile) return notFound();

  return (
    <PageShell>
      <PartyProfileWorkspace
        profile={profile}
        canEdit={hasPermission(session.user.permissions, "partiesEdit")}
        canViewLedger={hasPermission(session.user.permissions, "ledger")}
      />
    </PageShell>
  );
}
