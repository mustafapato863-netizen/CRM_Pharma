import { getServerSession } from "next-auth";
import authOptions from "../../auth";

export type PermissionKey =
  | "dashboard"
  | "products"
  | "batchView"
  | "batchCreate"
  | "batchEdit"
  | "batchDelete"
  | "parties"
  | "partiesFinancials"
  | "partiesStatement"
  | "partiesExport"
  | "partiesPrint"
  | "stock"
  | "stockInView"
  | "stockInCreate"
  | "stockOutView"
  | "stockOutCreate"
  | "ledger"
  | "reports"
  | "expiryAlerts"
  | "users"
  | "settings"
  | "backupExport";

export type PermissionMap = Partial<Record<PermissionKey, boolean>>;

export async function auth() {
  return getServerSession(authOptions);
}

export function hasPermission(
  permissions: unknown,
  key: PermissionKey
): boolean {
  if (!permissions || typeof permissions !== "object") return false;
  return Boolean((permissions as PermissionMap)[key]);
}

export async function requirePermission(key: PermissionKey) {
  const session = await auth();

  if (!session?.user?.permissions) {
    throw new Error("Unauthorized");
  }

  if (!hasPermission(session.user.permissions, key)) {
    throw new Error("Forbidden");
  }

  return session;
}
