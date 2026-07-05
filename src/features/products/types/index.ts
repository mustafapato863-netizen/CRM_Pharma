import type { ProductType } from "@prisma/client";

export type ProductFormValues = {
  code: string;
  name: string;
  searchName?: string;
  type: ProductType;
  unit: string;
  isActive: boolean;
};

export type ProductStockState = "IN_STOCK" | "OUT_OF_STOCK";

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  searchName: string;
  type: ProductType;
  unit: string;
  isActive: boolean;
  batchCount: number;
  movementCount: number;
  currentStock?: string;
  stockState?: ProductStockState;
  createdAt: Date;
  updatedAt: Date;
};
