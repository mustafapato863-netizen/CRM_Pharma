import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { prisma } from "@/lib/prisma";
import { PartyEditorMUI } from "@/features/parties/components/party-editor-mui";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { Stack } from "@mui/material";
import { createPageMetadata } from "@/shared/config/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parties");
  return createPageMetadata(t("edit"), t("editDescription"));
}

export default async function EditPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("parties");
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "partiesEdit"))
    return <Unauthorized />;

  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) return notFound();

  return (
    <Stack spacing={2.25}>
      <AppPageHeader
        title={t("edit")}
        description={t("editDescription")}
        breadcrumbs={[
          { label: t("title"), href: "/parties" },
          { label: party.name, href: `/parties/${party.id}` },
          { label: t("edit") },
        ]}
      />
      <PartyEditorMUI
        mode="edit"
        partyId={party.id}
        defaultValues={{
          code: party.code,
          name: party.name,
          nameEn: party.nameEn ?? "",
          type: party.type,
          mobile: party.mobile ?? "",
          phone: party.phone ?? "",
          email: party.email ?? "",
          address: party.address ?? "",
          city: party.city ?? "",
          taxNumber: party.taxNumber ?? "",
          commercialRegister: party.commercialRegister ?? "",
          notes: party.notes ?? "",
          openingBalance: party.openingBalance.toString(),
          isActive: party.isActive,
        }}
      />
    </Stack>
  );
}
