"use client";

import type { ReactNode } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { useLocale } from "@/shared/hooks/use-locale";

export function Unauthorized({ action, children }: { action?: ReactNode; children?: ReactNode }) {
  const { messages } = useLocale();
  return (
    <Alert severity="warning" icon={<Lock />}>
      <Stack spacing={1}>
        <Typography variant="h6">{messages.states.unauthorizedTitle}</Typography>
        <Typography variant="body2">{messages.states.unauthorizedDescription}</Typography>
        {children}<Box>{action}</Box>
      </Stack>
    </Alert>
  );
}
