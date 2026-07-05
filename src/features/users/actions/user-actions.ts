"use server";

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function normalizePermissions(formData: FormData) {
  const permissions = [
    "dashboard",
    "products",
    "batchView",
    "batchCreate",
    "batchEdit",
    "batchDelete",
    "parties",
    "partiesExport",
    "stockInView",
    "stockInCreate",
    "stockOutView",
    "stockOutCreate",
    "stock",
    "ledger",
    "reports",
    "expiryAlerts",
    "users",
    "settings",
    "backupExport",
  ] as const;

  return permissions.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = formData.get(key) === "on";
    return acc;
  }, {});
}

async function ensureUsersAccess() {
  const session = await auth();
  await requirePermission(session, "users");
  return session;
}

export async function createUserAction(_: unknown, formData: FormData) {
  await ensureUsersAccess();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!name || !email || !password) return { error: "Name, email, and password are required." };

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        permissions: normalizePermissions(formData) as unknown as Prisma.InputJsonValue,
        isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Email must be unique." };
    }
    throw error;
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(_: unknown, formData: FormData) {
  await ensureUsersAccess();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!id) return { error: "User id is required." };
  if (!name || !email) return { error: "Name and email are required." };

  const data: Record<string, unknown> = {
    name,
    email,
    permissions: normalizePermissions(formData) as unknown as Prisma.InputJsonValue,
    isActive,
  };

  if (password.trim()) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Email must be unique." };
    }
    throw error;
  }

  revalidatePath("/users");
  revalidatePath(`/users?selected=${id}`);
  return { success: true };
}

export async function deactivateUserAction(formData: FormData) {
  await ensureUsersAccess();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "User id is required." };

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/users");
  return { success: true };
}
