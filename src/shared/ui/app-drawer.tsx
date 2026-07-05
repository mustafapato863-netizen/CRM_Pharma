"use client";

import type { ReactNode } from "react";
import { Box, Drawer } from "@mui/material";
import { useLocale } from "@/shared/hooks/use-locale";

export function AppDrawer({ open, onClose, children, width = 420 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number; }) {
  const { locale } = useLocale();
  return (
    <Drawer
      anchor={locale === "ar" ? "left" : "right"}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: width },
            borderRadius: 0,
            bgcolor: "background.paper",
            borderInlineStart: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, height: "100%", overflow: "auto" }}>{children}</Box>
    </Drawer>
  );
}
