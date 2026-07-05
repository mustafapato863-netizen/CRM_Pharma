"use server";

import { revalidatePath } from "next/cache";
import { Prisma, ProductType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { productSchema } from "../schemas/product.schema";
import { nextProductCode } from "../utils/code";

async function ensureProductsAccess(
  permission: "productsView" | "productsCreate" | "productsEdit" | "productsDelete"
) {
  const session = await auth();
  await requirePermission(session, permission);
  return session;
}

export async function createProductAction(_: unknown, formData: FormData) {
  await ensureProductsAccess("productsCreate");
  const parsed = productSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    searchName: String(formData.get("searchName") ?? ""),
    type: String(formData.get("type") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }

  const code = parsed.data.code || nextProductCode(await getNextProductCode());
  const searchName = (parsed.data.searchName || parsed.data.name).trim().replace(/\s+/g, " ").toLowerCase();

  try {
    await prisma.product.create({
      data: {
        code,
        name: parsed.data.name,
        searchName,
        type: parsed.data.type as ProductType,
        unit: parsed.data.unit,
        isActive: parsed.data.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Product code must be unique." };
    }
    throw error;
  }

  revalidatePath("/products");
  return { success: true };
}

export async function updateProductAction(_: unknown, formData: FormData) {
  await ensureProductsAccess("productsEdit");
  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    searchName: String(formData.get("searchName") ?? ""),
    type: String(formData.get("type") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    isActive: formData.get("isActive") === "on",
  });

  if (!id) return { error: "Product id is required." };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        searchName: (parsed.data.searchName || parsed.data.name).trim().replace(/\s+/g, " ").toLowerCase(),
        type: parsed.data.type as ProductType,
        unit: parsed.data.unit,
        isActive: parsed.data.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Product code must be unique." };
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}/edit`);
  return { success: true };
}

export async function deleteProductAction(formData: FormData) {
  await ensureProductsAccess("productsDelete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Product id is required." };

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/products");
  return { success: true };
}

async function getNextProductCode() {
  const latest = await prisma.product.findFirst({
    orderBy: { code: "desc" },
    select: { code: true },
  });
  return latest?.code;
}
