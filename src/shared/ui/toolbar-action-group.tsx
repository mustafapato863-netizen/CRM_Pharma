"use client";

import type { ReactNode } from "react";
import { Stack } from "@mui/material";

export function ToolbarActionGroup({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
      {children}
    </Stack>
  );
}
