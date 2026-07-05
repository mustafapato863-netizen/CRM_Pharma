# Milestone Fix 1 - Localization Audit

## 1. Root cause

`next-intl` was configured at the request and root-provider levels, but most feature components never consumed it. They rendered hardcoded English strings. The obsolete `LocaleProvider` also duplicated locale state through local storage while the active server flow used a cookie.

## 2. Files changed

- `src/shared/config/translations.ts`
- `src/shared/hooks/use-locale.ts`
- `src/shared/ui/app-data-grid.tsx`
- `src/shared/providers/LocaleProvider.tsx` (removed because it was unused)
- `src/features/products/components/products-workspace.tsx`
- `src/features/products/components/product-form-mui.tsx`
- `src/features/products/components/product-editor-mui.tsx`
- `src/features/parties/components/parties-workspace.tsx`
- `src/features/parties/components/party-form-mui.tsx`
- `src/features/parties/components/party-editor-mui.tsx`
- `src/features/parties/components/party-profile-workspace.tsx`
- `src/features/settings/components/settings-center.tsx`
- `src/app/(dashboard)/parties/new/page.tsx`
- `src/app/(dashboard)/parties/[id]/edit/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/components/confirm-dialog.tsx`
- `src/components/refresh-button.tsx`
- `src/components/back-button.tsx`
- `src/components/coming-soon.tsx`
- `src/app/not-found.tsx`

## 3. Shared components updated

Confirmation cancel action, refresh, back, coming-soon, not-found, shared locale access, and shared DataGrid localization now use the active `next-intl` provider.

## 4. Pages updated

- Products list, details drawer, filters, actions, create form, and edit form.
- Parties list, details drawer, profile, create/edit forms, duplicate dialog, tables, and actions.
- Settings header, sections, fields, actions, and feedback.

## 5. Translation namespaces

Added or expanded `actions`, `common`, `states`, `products`, `parties`, and `settings` in both English and Arabic.

## 6. Remaining hardcoded UI

This milestone is not yet globally complete. Active legacy components under Batches, Stock In/Out, Purchases, Sales, Payments, Returns, Ledger, Reports, Expiry Alerts, Users, and Backup still contain hardcoded English UI. Server-side Zod/action error strings also remain English. These were not silently relabeled as complete.

## 7. DataGrid, dates, and pagination

`AppDataGrid` now applies MUI's `arSD` locale text in Arabic. Products and Parties format displayed dates with the active locale. Native date inputs retain browser locale behavior.

## 8. Arabic RTL

The existing root cookie flow continues to set `lang=ar`, `dir=rtl`, and the MUI theme direction. Products, Parties, and Settings now resolve their visible interface labels from Arabic message keys.

## 9. English LTR

The existing root flow continues to set `lang=en`, `dir=ltr`, and the MUI theme direction. The same components resolve English from the matching namespaces.

## 10. Lint

`npm run lint` passed with zero errors. Existing warnings remain in legacy files and React Compiler compatibility checks.

## 11. Build

`npx tsc --noEmit` passed. `npm run build` passed after stopping a concurrently running Next dev server that was mutating `.next` during production builds.

## 12. Recommended next milestone

Complete localization domain-by-domain without visual migration: Batches and Stock first, then invoices and finance, then reports/users/backup. Add a translation-key parity check after the legacy strings are removed.
