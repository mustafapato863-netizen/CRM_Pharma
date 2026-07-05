"use client";

import { useMemo } from "react";
import { hasPermission } from "@/lib/permissions";

/**
 * Checks whether a permission exists on the current permissions map.
 */
export function usePermission(permissions: unknown, key: Parameters<typeof hasPermission>[1]) {
  return useMemo(() => hasPermission(permissions, key), [permissions, key]);
}
