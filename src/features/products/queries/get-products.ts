import { Prisma, ProductType, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductStockState } from "../types";

export type ProductListFilters = {
  q?: string;
  type?: string;
  status?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function movementDelta(type: StockMovementType, quantity: number) {
  switch (type) {
    case StockMovementType.STOCK_IN:
    case StockMovementType.RETURN:
      return quantity;
    case StockMovementType.STOCK_OUT:
    case StockMovementType.DAMAGED:
    case StockMovementType.ADJUSTMENT:
      return -quantity;
    default:
      return 0;
  }
}

export async function getProducts(filters: ProductListFilters = {}) {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const q = filters.q?.trim();

  const where: Prisma.ProductWhereInput = {
    ...(filters.type && filters.type !== "all" ? { type: filters.type as ProductType } : {}),
    ...(filters.status && filters.status !== "all" ? { isActive: filters.status === "active" } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { searchName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const sortField = filters.sortField ?? "updatedAt";
  const sortDir = filters.sortDir ?? "desc";
  const orderBy =
    sortField === "name"
      ? [{ name: sortDir }, { code: "asc" as const }]
      : sortField === "code"
        ? [{ code: sortDir }, { name: "asc" as const }]
        : sortField === "type"
          ? [{ type: sortDir }, { name: "asc" as const }]
          : [{ [sortField]: sortDir } as Prisma.ProductOrderByWithRelationInput];

  const [totalCount, products, batchCounts, movementCounts, catalogTotalCount, catalogActiveCount, withoutBatchCount] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        batches: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            openingQty: true,
            stockMovements: { select: { type: true, quantity: true } },
          },
        },
        stockMovements: { select: { id: true, type: true, quantity: true, movementAt: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.batch.groupBy({
      by: ["productId"],
      _count: { _all: true },
    }),
    prisma.stockMovement.groupBy({
      by: ["productId"],
      _count: { _all: true },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { batches: { none: {} } } }),
  ]);

  const batchCountMap = new Map(batchCounts.map((item) => [item.productId, item._count._all]));
  const movementCountMap = new Map(movementCounts.map((item) => [item.productId, item._count._all]));

  const rows = products.map((product) => {
    const currentStock = product.batches.reduce((productTotal, batch) => {
      const batchMovementTotal = batch.stockMovements.reduce(
        (batchTotal, movement) => batchTotal + movementDelta(movement.type, Number(movement.quantity)),
        0
      );
      return productTotal + Number(batch.openingQty) + batchMovementTotal;
    }, 0);

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      searchName: product.searchName,
      type: product.type,
      unit: product.unit,
      isActive: product.isActive,
      batchCount: batchCountMap.get(product.id) ?? product.batches.length,
      movementCount: movementCountMap.get(product.id) ?? product.stockMovements.length,
      currentStock: currentStock.toFixed(3),
      stockState: (currentStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK") as ProductStockState,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  });

  return {
    rows,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    catalogTotalCount,
    activeCount: catalogActiveCount,
    inactiveCount: Math.max(catalogTotalCount - catalogActiveCount, 0),
    withoutBatchCount,
  };
}
