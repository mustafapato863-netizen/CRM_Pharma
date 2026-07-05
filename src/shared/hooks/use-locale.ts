"use client";

import { useLocale as useNextIntlLocale, useMessages } from "next-intl";
import { useMemo } from "react";
import type { Locale } from "@/shared/config/translations";

export function useLocale() {
  const locale = useNextIntlLocale() as Locale;
  const messages = useMessages() as Record<string, any>;

  const setLocale = (next: Locale) => {
    window.localStorage.setItem("pharmacy-crm:locale", next);
    document.cookie = `pharmacy-crm:locale=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  return useMemo(
    () => ({ locale, setLocale, messages }),
    [locale, messages],
  );
}
