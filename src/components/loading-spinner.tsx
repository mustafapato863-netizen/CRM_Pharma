"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import { useLocale } from "@/shared/hooks/use-locale";

export function LoadingSpinner() {
  const { messages } = useLocale();
  return <Stack spacing={1.5} sx={{ alignItems: "center", justifyContent: "center", py: 5 }}><CircularProgress size={24} /><Typography variant="body2" color="text.secondary">{messages.states.loading}</Typography></Stack>;
}
