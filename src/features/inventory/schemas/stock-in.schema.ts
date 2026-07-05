import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  batchId: z.string().optional().default(""),
  batchNumber: z.string().optional().default(""),
  useNewBatch: z.boolean(),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  purchasePrice: z.coerce.number().min(0, "Purchase price cannot be negative."),
  expiryDate: z.string().optional().default(""),
  reference: z.string().optional().default(""),
  movementAt: z.string().min(1, "Movement date is required."),
  partyId: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  confirmSave: z.boolean().optional().default(false),
});

export const stockInSearchSchema = z.object({
  q: z.string().optional().default(""),
});
