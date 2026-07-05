import type { ReactNode } from "react";
import { Box, Stack } from "@mui/material";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { ContentContainer } from "./content-container";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ContentContainer>
      <Box
        sx={{
          position: "relative",
          isolation: "isolate",

          "&::before": {
            content: '""',
            position: "fixed",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--mui-palette-primary-main) 9%, transparent), transparent 30%), radial-gradient(circle at 86% 6%, color-mix(in srgb, var(--mui-palette-secondary-main) 7%, transparent), transparent 28%)",
          },
        }}
      >
        <Stack spacing={2.25}>
          <AppBreadcrumbs />
          {children}
        </Stack>
      </Box>
    </ContentContainer>
  );
}
