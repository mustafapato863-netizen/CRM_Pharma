import { Prisma } from "@prisma/client";

export function calculateBatchQuantity(batch: {
  openingQty: Prisma.Decimal;
  stockMovements: Array<{ type: string; quantity: Prisma.Decimal }>;
}) {
  const movementTotal = batch.stockMovements.reduce((total, movement) => {
    const quantity = new Prisma.Decimal(movement.quantity);
    switch (movement.type) {
      case "STOCK_IN":
      case "RETURN":
        return total.plus(quantity);
      case "STOCK_OUT":
      case "DAMAGED":
      case "ADJUSTMENT":
        return total.minus(quantity);
      default:
        return total;
    }
  }, new Prisma.Decimal(0));

  return new Prisma.Decimal(batch.openingQty).plus(movementTotal);
}

export function getBatchStatus(row: {
  expiryDate: Date | null;
  currentQuantity: Prisma.Decimal | string | number;
}) {
  const currentQuantity = new Prisma.Decimal(row.currentQuantity);
  if (currentQuantity.lte(0)) return "Empty" as const;
  if (row.expiryDate && row.expiryDate < new Date()) return "Expired" as const;
  return "Active" as const;
}
