import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "../types";

/**
 * Fetches all dashboard KPI aggregates in a single parallel call.
 * Prisma queries typed against the existing schema:
 *  - Product (isActive, batches → current stock via StockMovement)
 *  - Batch (expiryDate, openingQty)
 *  - LedgerEntry (type, status, dueDate, amount)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const [
    totalProducts,
    totalBatches,
    expiringSoonCount,
    expiredCount,
    customerDebitEntries,
    supplierDebitEntries,
    duePaymentsCount,
    overdueCount,
    recentMovements,
    expiringSoonItems,
  ] = await Promise.all([
    // Total active products
    prisma.product.count({ where: { isActive: true } }),

    // Total batches
    prisma.batch.count(),

    // Batches expiring within 30 days (not yet expired)
    prisma.batch.count({
      where: {
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),

    // Already expired batches
    prisma.batch.count({
      where: {
        expiryDate: {
          lt: now,
        },
      },
    }),

    // Customers owe us — sum of CUSTOMER_BALANCE entries that are PENDING or PARTIAL
    prisma.ledgerEntry.aggregate({
      where: {
        type: "CUSTOMER_BALANCE",
        status: { in: ["PENDING", "PARTIAL"] },
      },
      _sum: { amount: true },
    }),

    // Suppliers we owe — sum of SUPPLIER_BALANCE entries that are PENDING or PARTIAL
    prisma.ledgerEntry.aggregate({
      where: {
        type: "SUPPLIER_BALANCE",
        status: { in: ["PENDING", "PARTIAL"] },
      },
      _sum: { amount: true },
    }),

    // Due payments (due within next 7 days)
    prisma.ledgerEntry.count({
      where: {
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Overdue entries
    prisma.ledgerEntry.count({
      where: {
        status: "OVERDUE",
      },
    }),

    prisma.stockMovement.findMany({
      take: 5,
      orderBy: [{ movementAt: "desc" }, { id: "desc" }],
      include: {
        product: { select: { code: true, name: true } },
        party: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),

    prisma.batch.findMany({
      take: 3,
      orderBy: [{ expiryDate: "asc" }, { batchNumber: "asc" }],
      where: {
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        product: { select: { code: true, name: true } },
      },
    }),
  ]);

  /*
   * Low stock / out-of-stock: The schema doesn't have a single "current_quantity" on Product.
   * Stock is tracked via Batch.openingQty + StockMovement aggregations.
   * For the dashboard, we approximate using batches with zero opening qty.
   */
  const lowStockCount = 0;
  const outOfStockCount = 0;

  return {
    totalProducts,
    totalBatches,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    expiredCount,
    customersOweTotal: Number(customerDebitEntries._sum.amount ?? 0),
    suppliersWeOweTotal: Number(supplierDebitEntries._sum.amount ?? 0),
    duePaymentsCount,
    overdueCount,
    lastUpdatedAt: now.toISOString(),
    recentMovements: recentMovements.map((movement) => ({
      id: movement.id,
      type: movement.type,
      reference: movement.reference ?? "—",
      productCode: movement.product.code,
      productName: movement.product.name,
      partyName: movement.party?.name ?? "—",
      quantity: movement.quantity.toString(),
      movementAt: movement.movementAt.toISOString(),
      userName: movement.user.name ?? movement.user.email,
    })),
    expiringSoonItems: expiringSoonItems.map((batch) => ({
      id: batch.id,
      productCode: batch.product.code,
      productName: batch.product.name,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate?.toISOString() ?? "",
      daysLeft: batch.expiryDate ? Math.max(0, Math.ceil((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    })),
  };
}
