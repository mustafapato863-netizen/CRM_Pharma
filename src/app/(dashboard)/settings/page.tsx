import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/shared/config/metadata";
import { SettingsCenter } from "@/features/settings/components/settings-center";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return createPageMetadata(t("title"), t("description"));
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "settings")) return <Unauthorized />;

  return (
    <PageShell>
      <AppPageHeader title={t("title")} description={t("description")} />
      <SettingsCenter
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        appVersion="v1.0"
      />
    </PageShell>
  );
}
