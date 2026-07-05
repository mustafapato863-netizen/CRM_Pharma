import { format, isBefore, differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Formats a date for display.
 */
export function formatDate(value: Date | string | number) {
  return format(new Date(value), "yyyy-MM-dd");
}

/**
 * Formats a date-time for display.
 */
export function formatDateTime(value: Date | string | number, locale?: "en" | "ar") {
  if (locale) return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return format(new Date(value), "yyyy-MM-dd HH:mm");
}

/**
 * Formats an expiry date.
 */
export function formatExpiry(value: Date | string | number, locale?: "en" | "ar") {
  if (locale) return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(new Date(value));
  return format(new Date(value), "dd MMM yyyy");
}

/**
 * Returns whether a date is in the past.
 */
export function isExpired(value: Date | string | number) {
  return isBefore(new Date(value), startOfDay(new Date()));
}

/**
 * Returns the number of days until expiry.
 */
export function daysUntilExpiry(value: Date | string | number) {
  return differenceInCalendarDays(new Date(value), startOfDay(new Date()));
}

/**
 * Returns today's date.
 */
export function today() {
  return startOfDay(new Date());
}
