# Milestone Reset 0 - Material UI Baseline Reset

## 1. Root cause

The mixed UI came from three overlapping layers: a MUI shell, Tailwind feature pages, and decorative global CSS. Shared labels also existed outside the active `next-intl` message flow. Locale is now read from the existing server cookie flow, applied to `html`, passed to `NextIntlClientProvider`, and used to build the MUI theme direction.

## 2. Files created

- `UI-UX/MILESTONE_RESET_0_REPORT.md`

## 3. Files changed

- `src/app/globals.css`
- `src/app/(auth)/login/login-form.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/empty-state.tsx`
- `src/components/layout/application-shell.tsx`
- `src/components/layout/logout-button.tsx`
- `src/components/layout/navbar.tsx`
- `src/components/layout/sidebar-item.tsx`
- `src/components/layout/sidebar.tsx`
- `src/features/inventory/components/inventory-movements-mui-page.tsx`
- `src/shared/theme/mui-theme.ts`
- `src/shared/ui/app-data-grid.tsx`
- `src/shared/ui/app-drawer.tsx`
- `src/shared/ui/app-page-header.tsx`
- `src/shared/ui/filter-toolbar.tsx`
- `src/shared/ui/metric-card.tsx`

## 4. MUI versions and mode support

- `@mui/material`: 9.1.2.
- `@mui/x-data-grid`: 9.7.0.
- The installed versions support CSS variables, `colorSchemes`, light/dark modes, and direction-aware themes.
- Emotion remains the installed MUI styling engine.
- No dependency upgrade or new UI package was required.

## 5. Theme architecture

`src/shared/theme/mui-theme.ts` is the single MUI visual source. It defines light and dark semantic palettes, locale-aware direction and fonts, restrained radius/elevation, and global defaults for the migrated MUI components. Page components consume palette and theme values rather than defining separate themes.

## 6. Light, dark, and system behavior

MUI CSS variables and `InitColorSchemeScript` provide `light`, `dark`, and `system`. Preference is stored under `pharmacy-crm:theme`, avoiding a Tailwind or page-specific dark-mode implementation. The authenticated navbar exposes the three appearance choices.

## 7. Locale persistence and direction

- English verified with `lang=en`, `dir=ltr`, and computed body direction `ltr`.
- Arabic verified with `lang=ar`, `dir=rtl`, and computed body direction `rtl`.
- Arabic login labels were verified after switching locale.
- Arabic remained selected after a full refresh.
- Protected routes redirected unauthenticated access to `/login` without console errors.
- No second translation system was introduced.

## 8. Shared components reset

The app shell, Sidebar, AppBar, page header, filter toolbar, metric cards, DataGrid wrapper, drawer, empty state, and existing loading/error/unauthorized states now follow restrained MUI composition. Fake search, fake notifications, decorative shell footer, floating mobile control, gradients, and oversized hero treatment were removed from the migrated layer.

## 9. Dashboard proof page

The page is MUI-only and keeps `getDashboardStats()` unchanged. It displays four real metrics, real quick-action links, and only non-zero real alerts. A recent-activity table was intentionally not fabricated because the current dashboard service does not return activity rows.

## 10. Inventory Movements proof page

The workspace remains audit-only. Its existing server query, URL filters, permissions, pagination, print, and export contracts remain intact. The page now uses compact MUI metrics, filters, DataGrid, responsive table handling, translated controls, and a direction-aware details drawer. No create, edit, or delete movement action was added.

## 11. Tailwind removed from touched UI

The migrated shell, shared UI wrappers, Dashboard proof page, and Inventory Movements proof page contain no Tailwind utility classes. `globals.css` retains only the Tailwind import required by active legacy pages; its decorative global visual rules were removed.

## 12. Dependencies removable now

No additional package is safe to remove in this milestone. `next-themes` had already been removed and has no remaining usage.

## 13. Dependencies remaining temporarily

- Tailwind: active legacy pages.
- Radix Dialog: `src/components/confirm-dialog.tsx`.
- Sonner: login and the existing toast provider/helper.
- TanStack React Table: legacy Products, Parties, Batches, and recent inventory tables.
- Lucide: active legacy screens outside this reset.

## 14. Lint result

`npm run lint` passed with 0 errors and 44 pre-existing warnings. Warnings are concentrated in legacy unused imports and React Compiler compatibility notices for React Hook Form and TanStack Table.

## 15. Build result

- `npx tsc --noEmit`: passed.
- `npm run build`: passed after stopping a concurrently running Next dev server that was mutating `.next`.
- Production `/login`: HTTP 200.
- Browser console: no errors during locale and redirect verification.
- MUI 9 compatibility fix: the login password adornment now uses `slotProps.input` instead of removed `InputProps`.

## 16. Known limitations

- Dashboard and Inventory Movements require an authenticated session, so their internal light/dark and responsive visuals were not browser-inspected in the unauthenticated verification session.
- Dark-mode persistence is implemented through the centralized MUI mechanism but was not interactively toggled through the protected navbar in that session.
- Legacy pages still mix Tailwind and non-MUI libraries until migrated.
- The app logs the existing `NEXTAUTH_URL` configuration warning in local production startup.

## 17. Recommended next milestone

Review the shell and proof pages in an authenticated session first. After approval, migrate one operational domain at a time. Batches is the smallest useful next target because its legacy table and form still carry the main overlapping UI dependencies.

## Safety confirmation

No Prisma schema, server query contract, server action, validation schema, permission key, route, stock calculation, invoice behavior, return behavior, ledger behavior, party balance calculation, or production data was changed.
