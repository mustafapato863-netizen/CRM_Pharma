import type { Batch, Party, Product, Prisma, StockMovement, User } from "@prisma/client";
import { stockInSchema } from "../schemas/stock-in.schema";

export type StockInRow = StockMovement & {
  product: Pick<Product, "id" | "code" | "name" | "searchName">;
  batch: Pick<Batch, "id" | "batchNumber" | "expiryDate" | "openingQty" | "purchaseCost"> | null;
  party: Pick<Party, "id" | "name" | "type"> | null;
  user: Pick<User, "id" | "name" | "email">;
};

export type StockInFormValues = import("zod").input<typeof stockInSchema>;

export type StockInSummary = {
  quantity: Prisma.Decimal;
  purchasePrice: Prisma.Decimal;
  totalCost: Prisma.Decimal;
};
