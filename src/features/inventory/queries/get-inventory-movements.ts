import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type InventoryMovementFilters = {
  search?: string;
  from?: string;
  to?: string;
  type?: string;
  productId?: string;
  batchId?: string;
  partyId?: string;
  userId?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getInventoryMovements(filters: InventoryMovementFilters = {}) {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const search = filters.search?.trim();

  const where: Prisma.StockMovementWhereInput = {
    ...(filters.type ? { type: filters.type as StockMovementType } : {}),
    ...(filters.productId ? { productId: filters.productId } : {}),
    ...(filters.batchId ? { batchId: filters.batchId } : {}),
    ...(filters.partyId ? { partyId: filters.partyId } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.from || filters.to
      ? {
          movementAt: {
            ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
            ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { reference: { contains: search, mode: "insensitive" } },
            { reason: { contains: search, mode: "insensitive" } },
            { product: { code: { contains: search, mode: "insensitive" } } },
            { product: { name: { contains: search, mode: "insensitive" } } },
            { batch: { batchNumber: { contains: search, mode: "insensitive" } } },
            { party: { name: { contains: search, mode: "insensitive" } } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const sortField = filters.sortField ?? "movementAt";
  const sortDir = filters.sortDir ?? "desc";
  const orderBy =
    sortField === "product"
      ? [{ product: { code: sortDir } }, { movementAt: "desc" as const }]
      : sortField === "party"
        ? [{ party: { name: sortDir } }, { movementAt: "desc" as const }]
        : sortField === "batch"
          ? [{ batch: { batchNumber: sortDir } }, { movementAt: "desc" as const }]
          : [{ [sortField]: sortDir } as Prisma.StockMovementOrderByWithRelationInput, { id: "desc" as const }];

  const [totalCount, rows, aggregates] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, code: true, name: true } },
        batch: { select: { id: true, batchNumber: true, expiryDate: true, purchaseCost: true } },
        party: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.stockMovement.aggregate({
      where,
      _count: { _all: true },
      _sum: { quantity: true },
    }),
  ]);

  const mappedRows = rows.map((row) => ({
    id: row.id,
    movementId: row.id,
    dateValue: row.movementAt.toISOString(),
    date: row.movementAt.toISOString(),
    type: row.type,
    movementType: row.type,
    productId: row.productId,
    batchId: row.batchId ?? "",
    partyId: row.partyId ?? "",
    userId: row.userId,
    productCode: row.product.code,
    product: `${row.product.code} - ${row.product.name}`,
    batch: row.batch?.batchNumber ?? "",
    batchExpiryDate: row.batch?.expiryDate?.toISOString() ?? "",
    party: row.party?.name ?? "",
    partyCode: row.party?.code ?? "",
    quantity: row.quantity.toString(),
    unitPrice: row.batch?.purchaseCost?.toString() ?? "",
    total: row.batch?.purchaseCost ? (Number(row.quantity) * Number(row.batch.purchaseCost)).toFixed(2) : "",
    reference: row.reference ?? "",
    reason: row.reason ?? "",
    user: row.user.name ?? row.user.email,
    userEmail: row.user.email,
  }));

  return {
    rows: mappedRows,
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    metrics: {
      count: aggregates._count._all,
      totalQuantity: aggregates._sum.quantity?.toString() ?? "0",
    },
  };
}
