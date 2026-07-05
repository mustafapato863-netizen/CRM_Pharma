import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Breadcrumbs, Paper, Stack, Typography } from "@mui/material";

export function PageHeader({
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
      variant="outlined"
      sx={{ borderRadius: 3, p: { xs: 1.75, sm: 2.25 } }}
    >
      <Stack spacing={1.5}>
        {breadcrumbs?.length ? (
          <Breadcrumbs sx={{ color: "text.secondary" }}>
            {breadcrumbs.map((crumb) =>
              crumb.href ? (
                <Box
                  key={crumb.label}
                  component={Link}
                  href={crumb.href}
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {crumb.label}
                </Box>
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
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "start", sm: "center" },
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 720, lineHeight: 1.55 }}
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
