import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type { Locale } from "@/shared/config/translations";
import { translations } from "@/shared/config/translations";

const SUPPORTED_LOCALES: Locale[] = ["en", "ar"];

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("pharmacy-crm:locale")?.value as Locale | undefined;
  const resolvedLocale =
    (hasLocale(SUPPORTED_LOCALES, requestedLocale) ? requestedLocale : undefined) ??
    (hasLocale(SUPPORTED_LOCALES, cookieLocale) ? cookieLocale : undefined) ??
    "en";

  return {
    locale: resolvedLocale,
    messages: translations[resolvedLocale],
  };
});
