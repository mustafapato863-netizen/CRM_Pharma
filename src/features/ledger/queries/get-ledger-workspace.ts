import { Prisma, LedgerEntryType, PartyType, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LedgerTimelineRow } from "../types";

export interface LedgerWorkspaceFilters {
  partyId?: string;
  partyType?: string;
  movementType?: string;
  status?: string;
  reference?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  noLimit?: boolean;
}

function signedLedgerAmount(type: LedgerEntryType, amount: number) {
  return type === "SUPPLIER_BALANCE" || type === "DUE_PAYMENT" ? -amount : amount;
}

function signedStockAmount(type: StockMovementType, total: number) {
  if (type === "STOCK_OUT") return -total;
  if (type === "STOCK_IN") return total;
  return 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

export async function getLedgerWorkspace(filters: LedgerWorkspaceFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const ledgerWhere: Prisma.LedgerEntryWhereInput = {};
  if (filters.partyId) {
    ledgerWhere.partyId = filters.partyId;
  }
  if (filters.partyType) {
    ledgerWhere.party = { type: filters.partyType as PartyType };
  }
  if (filters.status) {
    ledgerWhere.status = filters.status as any;
  }
  if (filters.movementType) {
    const isStockType = ["STOCK_IN", "STOCK_OUT"].includes(filters.movementType);
    if (isStockType) {
      ledgerWhere.id = "00000000-0000-0000-0000-000000000000";
    } else {
      ledgerWhere.type = filters.movementType as LedgerEntryType;
    }
  }
  if (filters.from) {
    ledgerWhere.createdAt = {
      gte: new Date(`${filters.from}T00:00:00.000Z`),
      ...(ledgerWhere.createdAt as any),
    };
  }
  if (filters.to) {
    ledgerWhere.createdAt = {
      lte: new Date(`${filters.to}T23:59:59.999Z`),
      ...(ledgerWhere.createdAt as any),
    };
  }
  if (filters.reference) {
    ledgerWhere.notes = {
      contains: filters.reference,
      mode: "insensitive",
    };
  }
  if (filters.search) {
    ledgerWhere.OR = [
      { notes: { contains: filters.search, mode: "insensitive" } },
      { party: { name: { contains: filters.search, mode: "insensitive" } } },
      { party: { searchName: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const stockWhere: Prisma.StockMovementWhereInput = {};
  if (filters.partyId) {
    stockWhere.partyId = filters.partyId;
  }
  if (filters.partyType) {
    stockWhere.party = { type: filters.partyType as PartyType };
  }
  if (filters.status) {
    if (filters.status !== "POSTED") {
      stockWhere.id = "00000000-0000-0000-0000-000000000000";
    }
  }
  if (filters.movementType) {
    const isLedgerType = ["CUSTOMER_BALANCE", "SUPPLIER_BALANCE", "DUE_PAYMENT"].includes(filters.movementType);
    if (isLedgerType) {
      stockWhere.id = "00000000-0000-0000-0000-000000000000";
    } else {
      stockWhere.type = filters.movementType as StockMovementType;
    }
  }
  if (filters.from) {
    stockWhere.movementAt = {
      gte: new Date(`${filters.from}T00:00:00.000Z`),
      ...(stockWhere.movementAt as any),
    };
  }
  if (filters.to) {
    stockWhere.movementAt = {
      lte: new Date(`${filters.to}T23:59:59.999Z`),
      ...(stockWhere.movementAt as any),
    };
  }
  if (filters.reference) {
    stockWhere.reference = {
      contains: filters.reference,
      mode: "insensitive",
    };
  }
  if (filters.search) {
    stockWhere.OR = [
      { reference: { contains: filters.search, mode: "insensitive" } },
      { reason: { contains: filters.search, mode: "insensitive" } },
      { product: { name: { contains: filters.search, mode: "insensitive" } } },
      { product: { code: { contains: filters.search, mode: "insensitive" } } },
      { party: { name: { contains: filters.search, mode: "insensitive" } } },
      { party: { searchName: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [lightweightLedgers, lightweightStocks] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: ledgerWhere,
      select: {
        id: true,
        createdAt: true,
        type: true,
        amount: true,
      },
    }),
    prisma.stockMovement.findMany({
      where: stockWhere,
      select: {
        id: true,
        movementAt: true,
        type: true,
        quantity: true,
        batch: {
          select: {
            purchaseCost: true,
          },
        },
      },
    }),
  ]);

  const combined = [
    ...lightweightLedgers.map((entry) => {
      const amount = Number(entry.amount);
      const signedTotal = signedLedgerAmount(entry.type, amount);
      return {
        id: entry.id,
        source: "ledger" as const,
        date: entry.createdAt.toISOString(),
        signedTotal,
        movementType: entry.type,
      };
    }),
    ...lightweightStocks.map((movement) => {
      const unitPrice = Number(movement.batch?.purchaseCost ?? 0);
      const quantity = Number(movement.quantity);
      const total = quantity * unitPrice;
      const signedTotal = signedStockAmount(movement.type, total);
      return {
        id: movement.id,
        source: "stock" as const,
        date: movement.movementAt.toISOString(),
        signedTotal,
        movementType: movement.type,
      };
    }),
  ];

  const stockInValue = combined.filter((row) => row.source === "stock" && row.movementType === "STOCK_IN").reduce((sum, row) => sum + row.signedTotal, 0);
  const stockOutValue = combined.filter((row) => row.source === "stock" && row.movementType === "STOCK_OUT").reduce((sum, row) => sum + Math.abs(row.signedTotal), 0);
  const movementCount = combined.length;
  
  const sorted = combined.sort((a, b) => b.date.localeCompare(a.date));
  const lastMovementDate = sorted[0]?.date ?? "";

  const sliced = filters.noLimit ? sorted : sorted.slice(skip, skip + pageSize);

  const ledgerIds = sliced.filter((r) => r.source === "ledger").map((r) => r.id);
  const stockIds = sliced.filter((r) => r.source === "stock").map((r) => r.id);

  const [fullLedgers, fullStocks] = await Promise.all([
    ledgerIds.length
      ? prisma.ledgerEntry.findMany({
          where: { id: { in: ledgerIds } },
          include: {
            party: { select: { id: true, name: true, searchName: true, type: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        })
      : [],
    stockIds.length
      ? prisma.stockMovement.findMany({
          where: { id: { in: stockIds } },
          include: {
            product: { select: { id: true, code: true, name: true, searchName: true } },
            batch: { select: { id: true, batchNumber: true, expiryDate: true, purchaseCost: true } },
            party: { select: { id: true, name: true, searchName: true, type: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        })
      : [],
  ]);

  const ledgerMap = new Map(fullLedgers.map((l) => [l.id, l]));
  const stockMap = new Map(fullStocks.map((s) => [s.id, s]));

  const rows: LedgerTimelineRow[] = sliced.map((item) => {
    if (item.source === "ledger") {
      const entry = ledgerMap.get(item.id)!;
      const amount = Number(entry.amount);
      const signedTotal = signedLedgerAmount(entry.type, amount);
      return {
        id: `ledger-${entry.id}`,
        source: "ledger" as const,
        date: entry.createdAt.toISOString(),
        reference: entry.notes ?? "",
        movementType: entry.type,
        partyId: entry.party.id,
        partyName: entry.party.name,
        partyType: entry.party.type,
        productName: "",
        batchNumber: "",
        quantity: "1",
        unitPrice: formatAmount(amount),
        total: formatAmount(signedTotal),
        runningBalance: "0.00",
        createdBy: entry.user.name ?? entry.user.email,
        notes: entry.notes ?? "",
        signedTotal,
        status: entry.status,
        searchText: "",
      };
    } else {
      const movement = stockMap.get(item.id)!;
      const unitPrice = Number(movement.batch?.purchaseCost ?? 0);
      const quantity = Number(movement.quantity);
      const total = quantity * unitPrice;
      const signedTotal = signedStockAmount(movement.type, total);
      return {
        id: `stock-${movement.id}`,
        source: "stock" as const,
        date: movement.movementAt.toISOString(),
        reference: movement.reference ?? "",
        movementType: movement.type,
        partyId: movement.partyId,
        partyName: movement.party?.name ?? "Unassigned",
        partyType: (movement.party?.type ?? "UNKNOWN") as "UNKNOWN" | PartyType,
        productName: `${movement.product.code} - ${movement.product.name}`,
        batchNumber: movement.batch?.batchNumber ?? "",
        quantity: quantity.toFixed(3),
        unitPrice: formatAmount(unitPrice),
        total: formatAmount(signedTotal),
        runningBalance: "0.00",
        createdBy: movement.user.name ?? movement.user.email,
        notes: movement.reason ?? "",
        signedTotal,
        status: "POSTED",
        searchText: "",
      };
    }
  });

  return {
    rows,
    totalCount: movementCount,
    totals: {
      stockInValue,
      stockOutValue,
      movementCount,
      lastMovementDate,
    },
  };
}
