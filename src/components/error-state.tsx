"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useLocale } from "@/shared/hooks/use-locale";

export function ErrorState({ title, description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  const { messages } = useLocale();
  return (
    <Alert
      severity="error"
      action={onRetry ? <Button color="inherit" startIcon={<Refresh />} onClick={onRetry}>{messages.states.retry}</Button> : undefined}
      sx={{ alignItems: "flex-start" }}
    >
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title ?? messages.states.errorTitle}</Typography>
        {description ? <Typography variant="body2" color="text.secondary">{description}</Typography> : null}
      </Stack>
    </Alert>
  );
}
