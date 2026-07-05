"use client";

import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

type ComingSoonProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  children?: ReactNode;
};

export function ComingSoon({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: ComingSoonProps) {
  const states = useTranslations("states");

  const resolvedTitle = title ?? states("comingSoon");
  const resolvedDescription = description ?? states("comingSoonDescription");

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth: 760,
        mx: "auto",
        borderRadius: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.25, sm: 3 },
          "&:last-child": {
            pb: { xs: 2.25, sm: 3 },
          },
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 2.25 }}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {icon ? (
            <Box
              aria-hidden="true"
              sx={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "action.hover",
                color: "primary.main",

                "& > svg": {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>
          ) : null}

          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {resolvedTitle}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              {resolvedDescription}
            </Typography>
          </Stack>

          {children ? (
            <Box
              sx={{
                width: "100%",
                maxWidth: 620,
              }}
            >
              {children}
            </Box>
          ) : null}

          {primaryAction || secondaryAction ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                "& > *": {
                  width: { xs: "100%", sm: "auto" },
                },
              }}
            >
              {primaryAction}
              {secondaryAction}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
