"use client";

import { useMemo, type ReactNode } from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createPharmacyTheme } from "@/shared/theme/mui-theme";
import { useLocale } from "@/shared/hooks/use-locale";

export function PharmacyMuiThemeProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const theme = useMemo(() => createPharmacyTheme(direction), [direction]);

  return (
    <MuiThemeProvider theme={theme} defaultMode="system" modeStorageKey="pharmacy-crm:theme">
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
