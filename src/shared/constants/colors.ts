import { sapphireClinicalColors } from "@/theme/sapphire-clinical-colors";

export const colors = {
  primary: sapphireClinicalColors.brand.primary.main,
  secondary: sapphireClinicalColors.brand.secondary.main,
  success: sapphireClinicalColors.semantic.success.light,
  warning: sapphireClinicalColors.semantic.warning.light,
  danger: sapphireClinicalColors.semantic.error.light,
} as const;
