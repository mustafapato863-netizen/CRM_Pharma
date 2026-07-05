import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/shared/config/metadata";
import { BackupCenter } from "@/features/backup/components/backup-center";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("backup");
  return createPageMetadata(t("title"), t("description"));
}

export default async function BackupPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.permissions, "backupExport")) {
    return <Unauthorized />;
  }

  const t = await getTranslations("backup");

  return (
    <PageShell>
      <AppPageHeader title={t("title")} description={t("description")} />
      <BackupCenter version="v1.0" />
    </PageShell>
  );
}
