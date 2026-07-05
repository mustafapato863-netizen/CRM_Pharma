import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";

export interface ExpiryAlertsFilters {
  search?: string;
  window?: "expired" | "within-7-days" | "within-30-days" | "at-risk" | "all";
  stock?: "available" | "all";
  productId?: string;
  sortField?: "expiryDate" | "batchNumber" | "productName" | "currentQuantity" | "expiryDays";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export async function getExpiryAlerts(filters: ExpiryAlertsFilters) {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const windowFilter = filters.window ?? "at-risk";
  const stock = filters.stock ?? "all";
  const productId = filters.productId ?? "";
  const sortField = filters.sortField ?? "expiryDate";
  const sortDirection = filters.sortDirection ?? "asc";
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const now = new Date();
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Construct database-level filters
  const where: Prisma.BatchWhereInput = {};

  if (productId) {
    where.productId = productId;
  }

  // Handle search parameter
  if (search) {
    where.OR = [
      { batchNumber: { contains: search, mode: "insensitive" } },
      { product: { name: { contains: search, mode: "insensitive" } } },
      { product: { code: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Handle Expiry Window
  if (windowFilter === "expired") {
    where.expiryDate = { lt: now };
  } else if (windowFilter === "within-7-days") {
    where.expiryDate = { gte: now, lte: day7 };
  } else if (windowFilter === "within-30-days") {
    where.expiryDate = { gte: now, lte: day30 };
  } else if (windowFilter === "at-risk") {
    // Both expired and soon (within 30 days)
    where.expiryDate = { lte: day30 };
  } else {
    // "all" - only batches with expiryDate
    where.expiryDate = { not: null };
  }

  // Query database
  const batches = await prisma.batch.findMany({
    where,
    include: {
      product: { select: { id: true, code: true, name: true, searchName: true } },
      stockMovements: { select: { type: true, quantity: true } },
      invoiceLines: {
        where: {
          invoice: { type: "PURCHASE" },
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              party: { select: { id: true, name: true } },
            },
          },
        },
        take: 1,
      },
    },
  });

  // Process in-memory for dynamic aggregates & stock availability filtering
  const processed = batches
    .map((batch) => {
      const currentQuantity = calculateBatchQuantity({
        openingQty: batch.openingQty,
        stockMovements: batch.stockMovements,
      });

      const expiryDays = batch.expiryDate ? daysUntil(batch.expiryDate) : null;
      const isExpired = !!batch.expiryDate && batch.expiryDate < now;
      const isSoon = !!batch.expiryDate && batch.expiryDate >= now && batch.expiryDate <= day30;

      // Extract purchase info if available
      const purchaseLine = batch.invoiceLines[0];
      const supplierName = purchaseLine?.invoice?.party?.name ?? "";
      const supplierId = purchaseLine?.invoice?.party?.id ?? "";
      const purchaseRef = purchaseLine?.invoice?.invoiceNumber ?? "";

      return {
        id: batch.id,
        productId: batch.productId,
        productName: batch.product.name,
        productCode: batch.product.code,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate?.toISOString() ?? "",
        expiryDays,
        currentQuantity: currentQuantity.toNumber(),
        isExpired,
        isSoon,
        supplierName,
        supplierId,
        purchaseRef,
        progress: batch.expiryDate ? Math.max(0, Math.min(100, 100 - Math.min(100, Math.abs(expiryDays ?? 0) * 3))) : 0,
      };
    })
    .filter((row) => {
      if (stock === "available" && row.currentQuantity <= 0) {
        return false;
      }
      return true;
    });

  // Calculate metrics summaries
  const totalAtRisk = processed.length;
  const expiredCount = processed.filter((r) => r.isExpired).length;
  const expiringSoonCount = processed.filter((r) => r.isSoon).length;
  const summaries = [
    { title: "Expired", value: String(expiredCount), type: "expired" },
    { title: "Expiring within 7 Days", value: String(processed.filter((r) => r.expiryDays !== null && r.expiryDays >= 0 && r.expiryDays <= 7).length), type: "7days" },
    { title: "Expiring within 30 Days", value: String(expiringSoonCount), type: "30days" },
    { title: "Total At Risk", value: String(totalAtRisk), type: "total" },
  ];

  // Sort results
  processed.sort((a, b) => {
    let result = 0;
    if (sortField === "expiryDate") {
      result = a.expiryDate.localeCompare(b.expiryDate);
    } else if (sortField === "batchNumber") {
      result = a.batchNumber.localeCompare(b.batchNumber);
    } else if (sortField === "productName") {
      result = a.productName.localeCompare(b.productName);
    } else if (sortField === "currentQuantity") {
      result = a.currentQuantity - b.currentQuantity;
    } else if (sortField === "expiryDays") {
      result = (a.expiryDays ?? 999999) - (b.expiryDays ?? 999999);
    }

    return sortDirection === "asc" ? result : -result;
  });

  // Slice results for active page
  const sliced = processed.slice(skip, skip + pageSize);

  return {
    rows: sliced,
    totalCount: processed.length,
    summaries,
  };
}
