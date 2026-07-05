"use client";

import type { ReactNode } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

type MetricTone = "info" | "success" | "warning" | "error";

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "info",
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: MetricTone;
}) {
  const toneVar = `--mui-palette-${tone}-main`;

  return (
    <Card
      variant="glass"
      sx={{
        minWidth: 0,
        height: "100%",
        minHeight: 160,
        transition:
          "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: `color-mix(in srgb, var(${toneVar}) 38%, var(--mui-palette-divider))`,
          boxShadow: `0 18px 36px color-mix(in srgb, var(${toneVar}) 14%, transparent)`,
        },
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          p: 2.25,
          "&:last-child": { pb: 2.25 },
        }}
      >
        <Stack
          spacing={2.5}
          sx={{ minHeight: 112, justifyContent: "space-between" }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontWeight: 800,
                  letterSpacing: "0.075em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.875,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {value}
              </Typography>
            </Box>
            {icon ? (
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.75,
                  color: `${tone}.main`,
                  background: `linear-gradient(135deg, color-mix(in srgb, var(${toneVar}) 26%, transparent), color-mix(in srgb, var(${toneVar}) 10%, transparent))`,
                  border: `1px solid color-mix(in srgb, var(${toneVar}) 26%, transparent)`,
                  boxShadow: `0 10px 20px color-mix(in srgb, var(${toneVar}) 16%, transparent)`,
                }}
              >
                {icon}
              </Avatar>
            ) : null}
          </Stack>
          {detail ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.55 }}
            >
              {detail}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
