"use client";

import { Chip } from "@mui/material";

export function StatusChip({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "warning" | "error" | "info" }) {
  return <Chip size="small" label={label} color={tone === "default" ? undefined : tone} variant="outlined" />;
}
