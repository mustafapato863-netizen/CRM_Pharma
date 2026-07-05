import type { Product } from "@prisma/client";
import { batchSchema } from "../schemas/batch.schema";

export type BatchRow = {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string | null;
  purchaseCost: string | null;
  openingQty: string;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, "id" | "code" | "name" | "searchName">;
  stockMovements: Array<{ type: string; quantity: string }>;
  currentQuantity: string;
  status: "Active" | "Expired" | "Empty";
  movementCount: number;
};

export type BatchFormValues = import("zod").input<typeof batchSchema>;
