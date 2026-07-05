import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { Inbox } from "@mui/icons-material";

export function EmptyState({ icon, title, description, ctaLabel, ctaHref, children }: { icon?: ReactNode; title: string; description?: string; ctaLabel?: string; ctaHref?: string; children?: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
        {icon ?? <Inbox color="disabled" fontSize="large" />}
        <Typography variant="h6">{title}</Typography>
        {description ? <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>{description}</Typography> : null}
        {children}
        {ctaLabel && ctaHref ? <Button component={Link} href={ctaHref} variant="contained">{ctaLabel}</Button> : null}
      </Stack>
    </Paper>
  );
}
