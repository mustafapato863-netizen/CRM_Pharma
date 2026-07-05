import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/shared/config/metadata";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { UsersPageClient } from "@/features/users/components/users-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return createPageMetadata(t("title"), t("description"));
}

function roleLabel(permissions: Record<string, boolean>, t: (key: "owner" | "partner" | "staff" | "viewer") => string) {
  if (permissions.users && permissions.settings && permissions.backupExport) return t("owner");
  if (permissions.reports && permissions.ledger && permissions.stock) return t("partner");
  if (permissions.stock) return t("staff");
  return t("viewer");
}

function lastActivityFromHistory(createdAt: Date, updatedAt: Date, name: string, t: (key: "updatedSettings" | "createdUser", values?: { name?: string }) => string) {
  if (updatedAt.getTime() > createdAt.getTime()) return t("updatedSettings");
  return t("createdUser", { name });
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "users")) return <Unauthorized />;

  const users = await prisma.user.findMany({
    include: {
      stockMovements: { select: { id: true } },
      ledgerEntries: { select: { id: true } },
      backupLogs: { select: { id: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const t = await getTranslations("users");
  const rows = users.map((user) => {
    const permissions = (user.permissions && typeof user.permissions === "object" ? user.permissions : {}) as Record<string, boolean>;
    return {
      id: user.id,
      name: user.name ?? user.email,
      email: user.email,
      isActive: user.isActive,
      permissions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: null,
      activity: lastActivityFromHistory(user.createdAt, user.updatedAt, user.name ?? user.email, t),
      sessionCount: 0,
      roleLabel: roleLabel(permissions, t),
    };
  });

  return (
    <PageShell>
      <AppPageHeader title={t("title")} description={t("description")} />
      <UsersPageClient users={rows} />
    </PageShell>
  );
}
