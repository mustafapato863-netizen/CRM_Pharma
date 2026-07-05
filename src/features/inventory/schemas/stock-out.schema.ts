import { z } from "zod";

export const stockOutSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  batchId: z.string().min(1, "Batch is required."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  reference: z.string().optional().default(""),
  movementAt: z.string().min(1, "Movement date is required."),
  notes: z.string().optional().default(""),
  confirmSave: z.boolean().optional().default(false),
});
