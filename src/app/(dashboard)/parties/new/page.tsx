import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PartyType } from "@prisma/client";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { Stack } from "@mui/material";
import { PartyEditorMUI } from "@/features/parties/components/party-editor-mui";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/shared/config/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parties");
  return createPageMetadata(t("new"), t("newDescription"));
}

export default async function NewPartyPage() {
  const t = await getTranslations("parties");
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "partiesCreate"))
    return <Unauthorized />;

  return (
    <Stack spacing={2.25}>
      <AppPageHeader
        title={t("new")}
        description={t("newDescription")}
        breadcrumbs={[{ label: t("title"), href: "/parties" }, { label: t("new") }]}
      />
      <PartyEditorMUI
        mode="create"
        defaultValues={{
          code: "",
          name: "",
          nameEn: "",
          type: PartyType.CUSTOMER,
          mobile: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          taxNumber: "",
          commercialRegister: "",
          notes: "",
          openingBalance: "0",
          isActive: true,
        }}
      />
    </Stack>
  );
}
