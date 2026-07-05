import type { Metadata } from "next";
import { sapphireClinicalColors } from "@/theme/sapphire-clinical-colors";

export const siteName = "Pharmacy CRM";
export const siteDescription = "Premium pharmacy inventory and business management system.";
export const siteKeywords = [
  "Pharmacy CRM",
  "inventory management",
  "pharmacy software",
  "stock in",
  "stock out",
  "ledger",
  "reports",
];

export const browserThemeColor = sapphireClinicalColors.brand.primary.main;

export function createPageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description: description ?? siteDescription,
  };
}
