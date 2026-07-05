import type { Batch, Product, StockMovement, User } from "@prisma/client";
import { stockOutSchema } from "../schemas/stock-out.schema";

export type StockOutBatchRow = Pick<Batch, "id" | "batchNumber" | "expiryDate" | "openingQty">;

export type StockOutProductRow = Pick<Product, "id" | "code" | "name" | "searchName" | "isActive">;

export type StockOutRow = StockMovement & {
  product: Pick<Product, "id" | "code" | "name" | "searchName">;
  batch: Pick<Batch, "id" | "batchNumber" | "expiryDate"> | null;
  user: Pick<User, "id" | "name" | "email">;
};

export type StockOutFormValues = import("zod").input<typeof stockOutSchema>;
