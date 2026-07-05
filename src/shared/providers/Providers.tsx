"use client";

import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";
import { PharmacyMuiThemeProvider } from "./MuiThemeProvider";

// Sapphire Clinical Glass uses Inter as its typeface. It's loaded once here
// and exposed as --font-sans, which mui-theme.ts's typography.fontFamily
// reads — so every themed component picks it up automatically.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * App-wide provider tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <div className={inter.variable} style={{ height: "100%" }}>
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
