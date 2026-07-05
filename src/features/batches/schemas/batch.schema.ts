import { z } from "zod";

export const batchSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  batchNumber: z.string().min(1, "Batch number is required."),
  expiryDate: z.string().optional().default(""),
  purchaseCost: z.string().optional().default(""),
  openingQty: z.string().optional().default("0"),
});

export const batchSearchSchema = z.object({
  q: z.string().optional().default(""),
  productId: z.string().optional().default("all"),
});

