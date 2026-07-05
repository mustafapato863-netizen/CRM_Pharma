"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { batchSchema } from "../schemas/batch.schema";

async function ensureBatchAccess(
  permission: "batchView" | "batchCreate" | "batchEdit" | "batchDelete"
) {
  const session = await auth();
  await requirePermission(session, permission);
  return session;
}

function toDecimal(value: string) {
  const normalized = value.trim();
  return normalized ? new Prisma.Decimal(normalized) : new Prisma.Decimal(0);
}

export async function createBatchAction(_: unknown, formData: FormData) {
  await ensureBatchAccess("batchCreate");
  const parsed = batchSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    batchNumber: String(formData.get("batchNumber") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    purchaseCost: String(formData.get("purchaseCost") ?? ""),
    openingQty: String(formData.get("openingQty") ?? ""),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid batch data." };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });

  if (!product) return { error: "Product not found." };

  try {
    await prisma.batch.create({
      data: {
        productId: parsed.data.productId,
        batchNumber: parsed.data.batchNumber.trim(),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
        purchaseCost: parsed.data.purchaseCost ? toDecimal(parsed.data.purchaseCost) : null,
        openingQty: toDecimal(parsed.data.openingQty),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Batch number must be unique per product." };
    }
    throw error;
  }

  revalidatePath("/batches");
  return { success: true };
}

export async function updateBatchAction(_: unknown, formData: FormData) {
  await ensureBatchAccess("batchEdit");
  const id = String(formData.get("id") ?? "");
  const parsed = batchSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    batchNumber: String(formData.get("batchNumber") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    purchaseCost: String(formData.get("purchaseCost") ?? ""),
    openingQty: String(formData.get("openingQty") ?? ""),
  });

  if (!id) return { error: "Batch id is required." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid batch data." };

  try {
    await prisma.batch.update({
      where: { id },
      data: {
        productId: parsed.data.productId,
        batchNumber: parsed.data.batchNumber.trim(),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
        purchaseCost: parsed.data.purchaseCost ? toDecimal(parsed.data.purchaseCost) : null,
        openingQty: toDecimal(parsed.data.openingQty),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Batch number must be unique per product." };
    }
    throw error;
  }

  revalidatePath("/batches");
  revalidatePath(`/batches/${id}/edit`);
  return { success: true };
}

export async function deactivateBatchAction(formData: FormData) {
  await ensureBatchAccess("batchDelete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Batch id is required." };

  await prisma.batch.update({
    where: { id },
    data: { openingQty: new Prisma.Decimal(0) },
  });

  revalidatePath("/batches");
  return { success: true };
}

