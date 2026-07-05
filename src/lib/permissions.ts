import type { PermissionMap, PermissionKey } from "./auth";

const aliases: Record<string, PermissionKey[]> = {
  productsView: ["products"],
  productsCreate: ["products"],
  productsEdit: ["products"],
  productsDelete: ["products"],
  batchView: ["batchView"],
  batchCreate: ["batchCreate"],
  batchEdit: ["batchEdit"],
  batchDelete: ["batchDelete"],
  partiesView: ["parties"],
  partiesCreate: ["parties"],
  partiesEdit: ["parties"],
  partiesDelete: ["parties"],
  partiesFinancials: ["parties", "ledger"],
  partiesStatement: ["parties", "ledger"],
  partiesExport: ["partiesExport"],
  partiesPrint: ["parties", "ledger", "reports"],
  stockInView: ["stock", "stockInView"],
  stockInCreate: ["stock", "stockInCreate"],
  stockOutView: ["stock", "stockOutView"],
  stockOutCreate: ["stock", "stockOutCreate"],
  backupExport: ["backupExport"],
};

export function hasPermission(
  permissions: unknown,
  key:
    | PermissionKey
    | "productsView"
    | "productsCreate"
    | "productsEdit"
    | "productsDelete"
    | "batchView"
    | "batchCreate"
    | "batchEdit"
    | "batchDelete"
    | "partiesView"
    | "partiesCreate"
    | "partiesEdit"
    | "partiesDelete"
    | "partiesFinancials"
    | "partiesStatement"
    | "partiesExport"
    | "partiesPrint"
    | "stockInView"
    | "stockInCreate"
    | "stockOutView"
    | "stockOutCreate"
): boolean {
  if (!permissions || typeof permissions !== "object") return false;

  const map = permissions as PermissionMap;
  const candidateKeys = aliases[key] ?? [key as PermissionKey];

  return candidateKeys.some((candidate) => Boolean(map[candidate]));
}

export async function requirePermission(
  session: { user?: { permissions?: unknown } | null } | null,
  key:
    | PermissionKey
    | "productsView"
    | "productsCreate"
    | "productsEdit"
    | "productsDelete"
    | "batchView"
    | "batchCreate"
    | "batchEdit"
    | "batchDelete"
    | "partiesView"
    | "partiesCreate"
    | "partiesEdit"
    | "partiesDelete"
    | "partiesFinancials"
    | "partiesStatement"
    | "partiesExport"
    | "partiesPrint"
    | "stockInView"
    | "stockInCreate"
    | "stockOutView"
    | "stockOutCreate"
) {
  const permissions = session?.user?.permissions;

  if (!permissions || !hasPermission(permissions, key)) {
    throw new Error("Forbidden");
  }

  return session;
}
