# Release 1 Visual Preflight

Date: 2026-07-04

This is a baseline audit for the Release 1 visual identity work.
It does not approve any route visually.

## Theme Architecture

- Central theme file: [`src/shared/theme/mui-theme.ts`](D:/Projects/CRM_Sys/src/shared/theme/mui-theme.ts)
- Theme provider: [`src/shared/providers/MuiThemeProvider.tsx`](D:/Projects/CRM_Sys/src/shared/providers/MuiThemeProvider.tsx)
- App cache/provider wrapper: [`src/shared/providers/Providers.tsx`](D:/Projects/CRM_Sys/src/shared/providers/Providers.tsx)
- Root locale/provider bridge: [`src/app/layout.tsx`](D:/Projects/CRM_Sys/src/app/layout.tsx)
- Direction is derived from locale and passed into the MUI theme.
- MUI cache provider is already in place to reduce SSR/hydration style mismatch risk.
- Current theme is a solid MUI baseline, but it is not yet the Sapphire Clinical Glass identity.

## Shared Components Reviewed

- App shell: [`src/components/layout/application-shell.tsx`](D:/Projects/CRM_Sys/src/components/layout/application-shell.tsx)
- Sidebar: [`src/components/layout/sidebar.tsx`](D:/Projects/CRM_Sys/src/components/layout/sidebar.tsx)
- Navbar: [`src/components/layout/navbar.tsx`](D:/Projects/CRM_Sys/src/components/layout/navbar.tsx)
- Page shell: [`src/components/page-shell.tsx`](D:/Projects/CRM_Sys/src/components/page-shell.tsx)
- Page header: [`src/shared/ui/app-page-header.tsx`](D:/Projects/CRM_Sys/src/shared/ui/app-page-header.tsx)
- DataGrid wrapper: [`src/shared/ui/app-data-grid.tsx`](D:/Projects/CRM_Sys/src/shared/ui/app-data-grid.tsx)
- Drawer wrapper: [`src/shared/ui/app-drawer.tsx`](D:/Projects/CRM_Sys/src/shared/ui/app-drawer.tsx)
- Filter toolbar: [`src/shared/ui/filter-toolbar.tsx`](D:/Projects/CRM_Sys/src/shared/ui/filter-toolbar.tsx)
- Search field: [`src/shared/ui/search-field.tsx`](D:/Projects/CRM_Sys/src/shared/ui/search-field.tsx)
- Date range filter: [`src/shared/ui/date-range-filter.tsx`](D:/Projects/CRM_Sys/src/shared/ui/date-range-filter.tsx)
- Status chip: [`src/shared/ui/status-chip.tsx`](D:/Projects/CRM_Sys/src/shared/ui/status-chip.tsx)
- Metric card: [`src/shared/ui/metric-card.tsx`](D:/Projects/CRM_Sys/src/shared/ui/metric-card.tsx)
- Toolbar action group: [`src/shared/ui/toolbar-action-group.tsx`](D:/Projects/CRM_Sys/src/shared/ui/toolbar-action-group.tsx)
- Empty state: [`src/components/empty-state.tsx`](D:/Projects/CRM_Sys/src/components/empty-state.tsx)
- Error state: [`src/components/error-state.tsx`](D:/Projects/CRM_Sys/src/components/error-state.tsx)
- Unauthorized state: [`src/components/unauthorized.tsx`](D:/Projects/CRM_Sys/src/components/unauthorized.tsx)
- Loading state: [`src/components/loading-spinner.tsx`](D:/Projects/CRM_Sys/src/components/loading-spinner.tsx)

## Raw Visual Overrides Found

### Hardcoded color sources

- [`src/shared/constants/colors.ts`](D:/Projects/CRM_Sys/src/shared/constants/colors.ts)
- [`src/shared/config/metadata.ts`](D:/Projects/CRM_Sys/src/shared/config/metadata.ts)
- [`src/shared/theme/mui-theme.ts`](D:/Projects/CRM_Sys/src/shared/theme/mui-theme.ts)

### Notes

- `src/shared/constants/colors.ts` still contains a small hardcoded color palette.
- `src/shared/config/metadata.ts` still contains a hardcoded `browserThemeColor`.
- `src/shared/theme/mui-theme.ts` still contains the current generic blue/gray palette and several component-specific geometry overrides.
- These are theme-level or metadata-level constants, not Tailwind utilities.

### Theme override patterns already present

- Border radius values are hardcoded at theme level: `10`, `12`, `16`, `999`.
- Spacing is set globally to `8`.
- Button, chip, drawer, dialog, table cell, and DataGrid defaults are already overridden centrally.
- The current theme is coherent, but it is not yet branded to the Release 1 visual system.

## Light / Dark Risks

- Current light and dark palettes are functional, but they do not yet match the Sapphire Clinical Glass palette.
- Dark mode needs deliberate surface separation; current dark values are still a baseline implementation.
- Some pages may still depend on the existing generic blue/gray theme tokens rather than the new release palette.

## RTL / LTR Risks

- Locale direction is wired through the app shell and theme.
- Drawer anchor and DataGrid direction are already locale-aware.
- Risk remains where route-level layout code may still assume left-to-right spacing or fixed alignment.
- Arabic typography is currently handled through theme font-family switching, but it has not been visually verified against the new release references yet.

## Responsive Risks

- Sidebar, header, filters, and dense tables are already structured for responsive behavior.
- The biggest remaining risk is page-specific layout density on:
  - Dashboard
  - Master data tables
  - Operational forms
  - Admin pages with dialogs and drawers
- Mobile and tablet behavior still needs browser verification against the new visual guide.

## Recommended Primitives

Build or refine these shared primitives first:

- `AmbientCanvas`
- `GlassSurface`
- `MetricGlassCard`
- `SoftIconTile`
- `SectionPaper`
- `DangerZoneSurface`

Keep operational data surfaces solid:

- DataGrid
- dense forms
- invoice lines
- ledger rows
- restore areas
- destructive dialogs

## Proposed Implementation Order

1. Update the central theme tokens to the Sapphire Clinical Glass palette.
2. Add/upgrade the shared glass and ambient primitives.
3. Align Login and Dashboard to the signature visual language.
4. Apply the shared structure to master data pages.
5. Keep operations solid and dense.
6. Polish audit and admin pages last.
7. Capture browser evidence and freeze the release only after all checks pass.

## Route Polish Waves

- Wave 1: `/login`, `/dashboard`
- Wave 2: `/products`, `/products/new`, `/products/[id]/edit`, `/batches`, `/batches/new`, `/batches/[id]/edit`, `/parties`, `/parties/new`, `/parties/[id]`, `/parties/[id]/edit`
- Wave 3: `/stock`, `/stock/in`, `/stock/out`, `/purchases`, `/sales`, `/payments`, `/returns`
- Wave 4: `/inventory/movements`, `/ledger`, `/reports`, `/expiry-alerts`
- Wave 5: `/users`, `/settings`, `/backup`, `/maintenance`
- Wave 6: `/` cleanup and final release freeze

## Business-Logic Risks

- None of the theme or shell findings require business-logic changes.
- High-risk workflows remain stock, invoices, payments, returns, ledger, and backup/restore.
- Visual work must stay away from schema, server actions, and posting semantics.

## Blockers

- No browser screenshots were captured in this preflight phase.
- The Sapphire Clinical Glass identity is not yet implemented in the shared theme.
- Residual hardcoded visual constants still exist in the shared color/metadata layer.
- A final browser QA pass is still required before any release approval.

## Recommended Next Prompt

Prompt 1: Final browser visual QA and P0/P1 repair.
