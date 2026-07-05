import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/shared/providers/Providers";
import { browserThemeColor, siteDescription, siteKeywords, siteName } from "@/shared/config/metadata";
import type { Locale } from "@/shared/config/translations";
import { translations } from "@/shared/config/translations";

export const metadata: Metadata = {
  metadataBase: new URL("https://pharmacy-crm.local"),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  creator: "Pharmacy CRM",
  robots: {
    index: false,
    follow: false,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/favicon.ico",
    other: [{ rel: "mask-icon", url: "/icons/mask-icon.svg", color: browserThemeColor }],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: browserThemeColor,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("pharmacy-crm:locale")?.value as Locale | undefined;
  const locale = storedLocale === "ar" ? "ar" : "en";
  const messages = translations[locale];
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="system" modeStorageKey="pharmacy-crm:theme" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
