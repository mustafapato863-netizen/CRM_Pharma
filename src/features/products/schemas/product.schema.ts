import { z } from "zod";
import { ProductType } from "@prisma/client";

export const productSchema = z.object({
  code: z.string().min(1, "Product code is required."),
  name: z.string().min(1, "Product name is required."),
  searchName: z.string().optional().default(""),
  type: z.nativeEnum(ProductType, {
    message: "Select a valid product type.",
  }),
  unit: z.string().min(1, "Unit is required."),
  isActive: z.boolean(),
});

export const productSearchSchema = z.object({
  q: z.string().optional().default(""),
  type: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
});
