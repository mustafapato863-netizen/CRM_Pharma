import { z } from "zod";

export const partyTypes = ["CUSTOMER", "SUPPLIER", "BOTH"] as const;
export type PartyType = (typeof partyTypes)[number];

export const partySchema = z.object({
  code: z.string().optional().default(""),
  name: z.string().min(1, "Arabic name is required."),
  nameEn: z.string().optional().default(""),
  type: z.enum(partyTypes, { message: "Select a valid party type." }),
  mobile: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z
    .union([z.string().email("Enter a valid email address."), z.literal("")])
    .optional()
    .default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  taxNumber: z.string().optional().default(""),
  commercialRegister: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  openingBalance: z.coerce.number().min(0, "Opening balance must be 0 or more."),
  isActive: z.boolean(),
});

export const partySearchSchema = z.object({
  q: z.string().optional().default(""),
  type: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
});
