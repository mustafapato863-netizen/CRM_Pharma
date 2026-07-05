import { PartyType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPartyFinancialSummaries } from "../services/party-financial.service";

export type PartyListFilters = {
  q?: string;
  type?: string;
  status?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getParties(filters: PartyListFilters = {}) {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const q = filters.q?.trim();

  const where: Prisma.PartyWhereInput = {
    ...(filters.type && filters.type !== "all" ? { type: filters.type as PartyType } : {}),
    ...(filters.status && filters.status !== "all" ? { isActive: filters.status === "active" } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { searchName: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const sortField = filters.sortField ?? "createdAt";
  const sortDir = filters.sortDir ?? "desc";
  const orderBy =
    sortField === "name"
      ? [{ name: sortDir }, { code: "asc" as const }]
      : sortField === "code"
        ? [{ code: sortDir }, { name: "asc" as const }]
        : sortField === "type"
          ? [{ type: sortDir }, { name: "asc" as const }]
          : [{ [sortField]: sortDir } as Prisma.PartyOrderByWithRelationInput];

  const [totalCount, activeCount, parties] = await Promise.all([
    prisma.party.count({ where }),
    prisma.party.count({ where: { ...where, isActive: true } }),
    prisma.party.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  const financialSummaries = await getPartyFinancialSummaries(
    parties.map((party) => ({
      id: party.id,
      openingBalance: party.openingBalance,
    }))
  );

  const rows = parties.map((party) => ({
    id: party.id,
    code: party.code,
    name: party.name,
    nameEn: party.nameEn,
    searchName: party.searchName,
    type: party.type,
    mobile: party.mobile,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: party.city,
    taxNumber: party.taxNumber,
    commercialRegister: party.commercialRegister,
    notes: party.notes,
    isActive: party.isActive,
    openingBalance: party.openingBalance.toString(),
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
    status: party.isActive ? ("Active" as const) : ("Inactive" as const),
    stockMovementCount: 0,
    ledgerEntryCount: financialSummaries.get(party.id)?.ledgerEntryCount ?? 0,
    currentBalance: financialSummaries.get(party.id)?.currentBalance ?? party.openingBalance.toString(),
    balanceType: financialSummaries.get(party.id)?.balanceType ?? "Settled",
    lastTransactionAt: financialSummaries.get(party.id)?.lastTransactionAt ?? null,
  }));

  return {
    rows,
    totalCount,
    activeCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}
