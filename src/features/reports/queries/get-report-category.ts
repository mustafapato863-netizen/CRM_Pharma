import {
  Prisma,
  LedgerEntryType,
  StockMovementType,
  InvoiceType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  calculateBatchQuantity,
  getBatchStatus,
} from "@/features/batches/utils/quantity";
import type { ReportRow } from "../types";
import { getPartyFinancialSummaries } from "@/features/parties/services/party-financial.service";

export interface ReportCategoryFilters {
  category: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  noLimit?: boolean;
}

function createSearchText(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function toIsoDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function signedLedgerAmount(type: LedgerEntryType, amount: number) {
  return type === "SUPPLIER_BALANCE" || type === "DUE_PAYMENT"
    ? -amount
    : amount;
}

function buildRow(row: Omit<ReportRow, "searchText">): ReportRow {
  return {
    ...row,
    searchText: createSearchText([
      row.date,
      row.reference,
      row.title,
      row.category,
      row.party,
      row.product,
      row.batch,
      row.quantity,
      row.amount,
      row.balance,
      row.status,
    ]),
  };
}

export async function getReportCategory(filters: ReportCategoryFilters) {
  const category = filters.category ?? "stock";
  const search = filters.search?.trim().toLowerCase() ?? "";
  const from = filters.from ?? "";
  const to = filters.to ?? "";
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  let rows: ReportRow[] = [];
  let totalCount = 0;

  if (category === "stock" || category === "movements") {
    const where: Prisma.StockMovementWhereInput = {};
    if (category === "stock") {
      where.type = {
        in: [StockMovementType.STOCK_IN, StockMovementType.STOCK_OUT],
      };
    }
    if (from) {
      where.movementAt = {
        gte: new Date(`${from}T00:00:00.000Z`),
        ...(where.movementAt as any),
      };
    }
    if (to) {
      where.movementAt = {
        lte: new Date(`${to}T23:59:59.999Z`),
        ...(where.movementAt as any),
      };
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { reason: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { product: { code: { contains: search, mode: "insensitive" } } },
        { party: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    totalCount = await prisma.stockMovement.count({ where });
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { id: true, code: true, name: true, searchName: true },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            purchaseCost: true,
          },
        },
        party: {
          select: { id: true, name: true, searchName: true, type: true },
        },
      },
      orderBy: [{ movementAt: "desc" }],
      ...(filters.noLimit ? {} : { skip, take: pageSize }),
    });

    rows = movements.map((movement) =>
      buildRow({
        id: `stock-${movement.id}`,
        date: movement.movementAt.toISOString(),
        reference: movement.reference ?? "",
        title: `${movement.type.replaceAll("_", " ")}`,
        category: category === "stock" ? "Stock" : "Movement",
        party: movement.party?.name ?? "Unassigned",
        product: `${movement.product.code} - ${movement.product.name}`,
        batch: movement.batch?.batchNumber ?? "",
        quantity: Number(movement.quantity).toFixed(3),
        amount: formatAmount(
          Number(movement.quantity) * Number(movement.batch?.purchaseCost ?? 0),
        ),
        balance: "-",
        status: movement.type,
      }),
    );
  } else if (
    category === "inventory" ||
    category === "low-stock" ||
    category === "near-expiry" ||
    category === "expired"
  ) {
    const where: Prisma.BatchWhereInput = {};
    if (search) {
      where.OR = [
        { batchNumber: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { product: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (from || to) {
      const dateField =
        category === "inventory"
          ? "createdAt"
          : category === "low-stock"
            ? "updatedAt"
            : "expiryDate";

      const dateRange: any = {};
      if (from) dateRange.gte = new Date(`${from}T00:00:00.000Z`);
      if (to) dateRange.lte = new Date(`${to}T23:59:59.999Z`);

      where[dateField] = dateRange;
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        product: {
          select: { id: true, code: true, name: true, searchName: true },
        },
        stockMovements: { select: { type: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = batches
      .map((batch) => {
        const currentQuantity = calculateBatchQuantity({
          openingQty: batch.openingQty,
          stockMovements: batch.stockMovements,
        });
        const status = getBatchStatus({
          expiryDate: batch.expiryDate,
          currentQuantity,
        });
        return { batch, currentQuantity, status };
      })
      .filter((item) => {
        if (category === "low-stock") {
          return item.currentQuantity.lte(10);
        }
        if (category === "near-expiry") {
          return (
            item.batch.expiryDate &&
            item.batch.expiryDate <=
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
            item.currentQuantity.gt(0)
          );
        }
        if (category === "expired") {
          return (
            item.batch.expiryDate &&
            item.batch.expiryDate < new Date() &&
            item.currentQuantity.gt(0)
          );
        }
        return true;
      });

    totalCount = mapped.length;
    const paginated = filters.noLimit
      ? mapped
      : mapped.slice(skip, skip + pageSize);

    rows = paginated.map(({ batch, currentQuantity, status }) => {
      const date =
        category === "inventory"
          ? batch.createdAt.toISOString()
          : category === "low-stock"
            ? batch.updatedAt.toISOString()
            : (batch.expiryDate?.toISOString() ??
              batch.updatedAt.toISOString());

      const balance =
        category === "near-expiry" || category === "expired"
          ? toIsoDate(batch.expiryDate)
          : currentQuantity.toString();

      return buildRow({
        id: batch.id,
        date,
        reference: batch.batchNumber,
        title: batch.product.name,
        category:
          category === "inventory"
            ? "Current Inventory"
            : category === "low-stock"
              ? "Low Stock"
              : category === "near-expiry"
                ? "Near Expiry"
                : "Expired",
        party: "-",
        product: `${batch.product.code} - ${batch.product.name}`,
        batch: batch.batchNumber,
        quantity: currentQuantity.toString(),
        amount: formatAmount(
          Number(currentQuantity) * Number(batch.purchaseCost ?? 0),
        ),
        balance,
        status,
      });
    });
  } else if (category === "parties") {
    const where: Prisma.PartyWhereInput = {};
    if (from) {
      where.createdAt = {
        gte: new Date(`${from}T00:00:00.000Z`),
        ...(where.createdAt as any),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(`${to}T23:59:59.999Z`),
        ...(where.createdAt as any),
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { searchName: { contains: search, mode: "insensitive" } },
      ];
    }

    totalCount = await prisma.party.count({ where });
    const parties = await prisma.party.findMany({
      where,
      select: {
        id: true,
        name: true,
        searchName: true,
        type: true,
        isActive: true,
        openingBalance: true,
        createdAt: true,
      },
      orderBy: [{ name: "asc" }],
      ...(filters.noLimit ? {} : { skip, take: pageSize }),
    });

    const financialSummaries = await getPartyFinancialSummaries(
      parties.map((party) => ({
        id: party.id,
        openingBalance: party.openingBalance,
      })),
    );

    rows = parties.map((party) => {
      const summary = financialSummaries.get(party.id);
      const balance = Number(summary?.currentBalance ?? party.openingBalance);
      return buildRow({
        id: party.id,
        date: party.createdAt.toISOString(),
        reference: "",
        title: party.name,
        category: party.type,
        party: party.name,
        product: "-",
        batch: "-",
        quantity: summary?.lastTransactionAt ? "1" : "0",
        amount: formatAmount(balance),
        balance: formatAmount(balance),
        status: party.isActive ? "Active" : "Inactive",
      });
    });
  } else if (category === "ledger") {
    const where: Prisma.LedgerEntryWhereInput = {};
    if (from) {
      where.createdAt = {
        gte: new Date(`${from}T00:00:00.000Z`),
        ...(where.createdAt as any),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(`${to}T23:59:59.999Z`),
        ...(where.createdAt as any),
      };
    }
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: "insensitive" } },
        { party: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    totalCount = await prisma.ledgerEntry.count({ where });
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        party: {
          select: { id: true, name: true, searchName: true, type: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      ...(filters.noLimit ? {} : { skip, take: pageSize }),
    });

    rows = ledgerEntries.map((entry) => {
      const amount = Number(entry.amount);
      const signed = signedLedgerAmount(entry.type, amount);

      return buildRow({
        id: entry.id,
        date: entry.createdAt.toISOString(),
        reference: entry.notes ?? "",
        title: entry.type.replaceAll("_", " "),
        category: "Ledger",
        party: entry.party.name,
        product: "-",
        batch: "-",
        quantity: "1",
        amount: formatAmount(amount),
        balance: formatAmount(signed),
        status: entry.status,
      });
    });
  }

  return {
    rows,
    totalCount,
  };
}

export async function getReportsSummary() {
  const [salesTotal, purchasesTotal, totalProducts, batches] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: { type: InvoiceType.SALES },
        _sum: { grandTotal: true },
      }),
      prisma.invoice.aggregate({
        where: { type: InvoiceType.PURCHASE },
        _sum: { grandTotal: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.batch.findMany({
        select: {
          openingQty: true,
          purchaseCost: true,
          expiryDate: true,
          stockMovements: {
            select: {
              type: true,
              quantity: true,
            },
          },
        },
      }),
    ]);

  const currentInventory = batches.map((batch) => {
    const currentQuantity = calculateBatchQuantity({
      openingQty: batch.openingQty,
      stockMovements: batch.stockMovements,
    });
    return {
      currentQuantity,
      purchaseCost: Number(batch.purchaseCost ?? 0),
      expiryDate: batch.expiryDate,
    };
  });

  const lowStockCount = currentInventory.filter((item) =>
    item.currentQuantity.lte(10),
  ).length;
  const expiredCount = currentInventory.filter(
    (item) =>
      item.expiryDate &&
      item.expiryDate < new Date() &&
      item.currentQuantity.gt(0),
  ).length;
  const sales = Number(salesTotal._sum.grandTotal ?? 0);
  const purchases = Number(purchasesTotal._sum.grandTotal ?? 0);

  return [
    {
      title: "Total Sales",
      value: sales.toFixed(2),
      helper: "Sales invoice total",
    },
    {
      title: "Total Purchases",
      value: purchases.toFixed(2),
      helper: "Purchase invoice total",
    },
    {
      title: "Gross Profit",
      value: (sales - purchases).toFixed(2),
      helper: "Sales minus purchase value",
    },
    {
      title: "Products",
      value: String(totalProducts),
      helper: "Active product records",
    },
    {
      title: "Low Stock",
      value: String(lowStockCount),
      helper: "Batches at or below threshold",
    },
    {
      title: "Expired Items",
      value: String(expiredCount),
      helper: "Expired stock batches",
    },
  ];
}
