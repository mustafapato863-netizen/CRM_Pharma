"use client";

import { useState, type ReactNode } from "react";
import { Box } from "@mui/material";
import type { PermissionMap } from "@/lib/auth";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { AIAssistantWidget } from "@/features/assistant/components/ai-assistant-widget";

const drawerWidth = 232;

type ApplicationShellProps = {
  children: ReactNode;
  permissions: PermissionMap;
  userName?: string | null;
};

export function ApplicationShell({
  children,
  permissions,
  userName,
}: ApplicationShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        overflowX: "clip",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Sidebar
        permissions={permissions}
        mobileOpen={navigationOpen}
        onMobileClose={() => setNavigationOpen(false)}
        width={drawerWidth}
      />

      <Box
        sx={{
          minWidth: 0,
          minHeight: "100dvh",
          marginInlineStart: { lg: `${drawerWidth}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          userName={userName}
          onMenuClick={() => setNavigationOpen(true)}
        />

        <Box
          component="main"
          sx={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            minHeight: {
              xs: "calc(100dvh - 56px)",
              md: "calc(100dvh - 64px)",
            },
          }}
        >
          {children}
          <AIAssistantWidget />
        </Box>
      </Box>
    </Box>
  );
}
