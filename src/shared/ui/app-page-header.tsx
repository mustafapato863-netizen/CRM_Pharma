"use client";

import type { ReactNode } from "react";
import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export function AppPageHeader({
  title,
  description,
  action,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <Paper
      component="header"
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2, md: 2.25 },
        borderColor:
          "color-mix(in srgb, var(--mui-palette-primary-main) 16%, var(--mui-palette-divider))",
        bgcolor:
          "color-mix(in srgb, var(--mui-palette-background-paper) 88%, transparent)",
        backgroundImage:
          "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 5%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 3%, transparent))",
        backdropFilter: "blur(14px) saturate(126%)",
        WebkitBackdropFilter: "blur(14px) saturate(126%)",
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)",
      }}
    >
      <Stack spacing={1.25}>
        {breadcrumbs?.length ? (
          <Breadcrumbs sx={{ color: "text.secondary" }}>
            {breadcrumbs.map((crumb) =>
              crumb.href ? (
                <MuiLink
                  key={crumb.label}
                  href={crumb.href}
                  underline="hover"
                  color="inherit"
                >
                  {crumb.label}
                </MuiLink>
              ) : (
                <Typography
                  key={crumb.label}
                  variant="body2"
                  color="text.secondary"
                >
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        ) : null}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 850, letterSpacing: "-0.03em" }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 760 }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
          {action ? <Box>{action}</Box> : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
