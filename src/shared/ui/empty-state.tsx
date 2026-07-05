"use client";

import type { ReactNode } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}>
        <Stack spacing={1.25} sx={{ alignItems: "center", py: { xs: 2, sm: 3 }, textAlign: "center" }}>
          {icon ?? <InboxOutlined color="disabled" sx={{ fontSize: 48 }} />}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          {description ? <Typography variant="body2" color="text.secondary">{description}</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
