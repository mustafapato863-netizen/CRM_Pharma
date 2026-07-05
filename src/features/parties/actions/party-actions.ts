"use server";

import { PartyType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { partySchema } from "../schemas/party.schema";

async function ensurePartiesAccess(
  permission: "partiesView" | "partiesCreate" | "partiesEdit" | "partiesDelete"
) {
  const session = await auth();
  await requirePermission(session, permission);
  return session;
}

function normalize(text: string) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function buildSearchName(name: string) {
  return normalize(name);
}

function formatPartyCode(value: number) {
  return `PAR-${String(value).padStart(6, "0")}`;
}

async function nextPartyCode() {
  const latest = await prisma.party.findFirst({
    orderBy: [{ code: "desc" }],
    select: { code: true },
  });

  const match = latest?.code?.match(/^PAR-(\d+)$/);
  const nextValue = match ? Number(match[1]) + 1 : 1;
  return formatPartyCode(nextValue);
}

async function ensureUniquePartyName(name: string, type: PartyType, id?: string) {
  const existing = await prisma.party.findFirst({
    where: {
      type,
      searchName: buildSearchName(name),
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return "A party with the same Arabic name and type already exists.";
  }

  return null;
}

async function findPossibleDuplicate(
  data: {
    name: string;
    nameEn?: string;
    mobile?: string;
    taxNumber?: string;
  },
  id?: string
) {
  const where = {
    ...(id ? { NOT: { id } } : {}),
    OR: [
      { searchName: buildSearchName(data.name) },
      data.nameEn ? { nameEn: { equals: data.nameEn.trim(), mode: "insensitive" as const } } : undefined,
      data.mobile ? { mobile: data.mobile.trim() } : undefined,
      data.taxNumber ? { taxNumber: data.taxNumber.trim() } : undefined,
    ].filter(Boolean) as Prisma.PartyWhereInput[],
  } satisfies Prisma.PartyWhereInput;

  const existing = await prisma.party.findFirst({
    where,
    select: { id: true, code: true, name: true, nameEn: true, mobile: true, taxNumber: true },
  });

  return existing;
}

export async function createPartyAction(_: unknown, formData: FormData) {
  await ensurePartiesAccess("partiesCreate");
  const parsed = partySchema.safeParse({
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    nameEn: String(formData.get("nameEn") ?? ""),
    type: String(formData.get("type") ?? ""),
    mobile: String(formData.get("mobile") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    taxNumber: String(formData.get("taxNumber") ?? ""),
    commercialRegister: String(formData.get("commercialRegister") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    openingBalance: String(formData.get("openingBalance") ?? "0"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid party data." };
  const duplicateError = await ensureUniquePartyName(parsed.data.name, parsed.data.type);
  if (duplicateError) return { error: duplicateError };

  const allowPotentialDuplicate = formData.get("allowPotentialDuplicate") === "on";
  const possibleDuplicate = await findPossibleDuplicate(parsed.data);
  if (possibleDuplicate && !allowPotentialDuplicate) {
    return {
      warning: "This party may already exist.",
      duplicate: possibleDuplicate,
    };
  }

  const code = await nextPartyCode();

  const created = await prisma.party.create({
    data: {
      code,
      name: parsed.data.name.trim(),
      nameEn: parsed.data.nameEn.trim() || null,
      searchName: buildSearchName(parsed.data.name),
      type: parsed.data.type,
      mobile: parsed.data.mobile.trim() || null,
      phone: parsed.data.phone.trim() || null,
      email: parsed.data.email.trim() || null,
      address: parsed.data.address.trim() || null,
      city: parsed.data.city.trim() || null,
      taxNumber: parsed.data.taxNumber.trim() || null,
      commercialRegister: parsed.data.commercialRegister.trim() || null,
      notes: parsed.data.notes.trim() || null,
      openingBalance: new Prisma.Decimal(parsed.data.openingBalance),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/parties");
  return { success: true, id: created.id, code: created.code };
}

export async function updatePartyAction(_: unknown, formData: FormData) {
  await ensurePartiesAccess("partiesEdit");
  const id = String(formData.get("id") ?? "");
  const parsed = partySchema.safeParse({
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    nameEn: String(formData.get("nameEn") ?? ""),
    type: String(formData.get("type") ?? ""),
    mobile: String(formData.get("mobile") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    taxNumber: String(formData.get("taxNumber") ?? ""),
    commercialRegister: String(formData.get("commercialRegister") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    openingBalance: String(formData.get("openingBalance") ?? "0"),
    isActive: formData.get("isActive") === "on",
  });

  if (!id) return { error: "Party id is required." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid party data." };
  const duplicateError = await ensureUniquePartyName(parsed.data.name, parsed.data.type, id);
  if (duplicateError) return { error: duplicateError };

  const allowPotentialDuplicate = formData.get("allowPotentialDuplicate") === "on";
  const possibleDuplicate = await findPossibleDuplicate(parsed.data, id);
  if (possibleDuplicate && !allowPotentialDuplicate) {
    return {
      warning: "This party may already exist.",
      duplicate: possibleDuplicate,
    };
  }

  await prisma.party.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      nameEn: parsed.data.nameEn.trim() || null,
      searchName: buildSearchName(parsed.data.name),
      type: parsed.data.type,
      mobile: parsed.data.mobile.trim() || null,
      phone: parsed.data.phone.trim() || null,
      email: parsed.data.email.trim() || null,
      address: parsed.data.address.trim() || null,
      city: parsed.data.city.trim() || null,
      taxNumber: parsed.data.taxNumber.trim() || null,
      commercialRegister: parsed.data.commercialRegister.trim() || null,
      notes: parsed.data.notes.trim() || null,
      openingBalance: new Prisma.Decimal(parsed.data.openingBalance),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/parties");
  revalidatePath(`/parties/${id}/edit`);
  return { success: true };
}

export async function deletePartyAction(formData: FormData) {
  await ensurePartiesAccess("partiesDelete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Party id is required." };

  const [stockMovementCount, ledgerEntryCount] = await Promise.all([
    prisma.stockMovement.count({ where: { partyId: id } }),
    prisma.ledgerEntry.count({ where: { partyId: id } }),
  ]);

  if (stockMovementCount + ledgerEntryCount > 0) {
    return { error: "This party has linked transactions and cannot be deleted. Deactivate it instead." };
  }

  await prisma.party.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/parties");
  return { success: true };
}

export async function setPartyStatusAction(_: unknown, formData: FormData) {
  await ensurePartiesAccess("partiesEdit");
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!id) return { error: "Party id is required." };

  await prisma.party.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/parties");
  revalidatePath(`/parties/${id}`);
  return { success: true };
}
