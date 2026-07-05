import type { PermissionMap } from "@/lib/auth";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  permissions: PermissionMap;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  activity: string;
  sessionCount: number;
  roleLabel: string;
};

export type UserPermissionKey = keyof PermissionMap;
