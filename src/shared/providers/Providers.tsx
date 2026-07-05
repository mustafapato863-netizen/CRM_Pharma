"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";
import { PharmacyMuiThemeProvider } from "./MuiThemeProvider";

/**
 * App-wide provider tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100%" }}>
      <AppRouterCacheProvider options={{ key: "mui" }}>
        <PharmacyMuiThemeProvider>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </PharmacyMuiThemeProvider>
      </AppRouterCacheProvider>
    </div>
  );
}
