# Legacy UI and Localization Inventory

Date: 2026-07-03

This is an audit-only map of the current frontend surface.
It is historical now; the active-state summary lives in [`14-frontend-final-status.md`](D:/Projects/CRM_Sys/docs/03_DESIGN/UI_UX/14-frontend-final-status.md).

Scope:
- Active routes
- Shared UI components
- Hardcoded user-facing strings
- Localization coverage
- MUI/Tailwind composition
- Sensitive workflows

Non-goals:
- No redesign
- No business logic changes
- No Prisma/schema changes
- No dependency removal
- No new UI components

## Summary

Current state:
- `Login`, `Dashboard`, `Inventory Movements`, and `Products` are the clearest migrated surfaces that are already behaving with the locale switch.
- Most other active routes are still legacy Tailwind-first pages or mixed hybrid pages.
- Several shared shell components are MUI-based, but a large legacy UI layer still exists alongside them.
- Sensitive operational flows remain in place in stock, invoice, return, ledger, payments, and batch screens.

## Route Map

Legend:
- `MUI_COMPLETE`: MUI-only, localized, RTL/LTR safe, dark-mode safe
- `MUI_PARTIAL`: MUI used, but localization or shared-system coverage is incomplete
- `LEGACY_TAILWIND`: Tailwind is still the primary visual layer
- `HYBRID`: MUI and Tailwind are mixed in the same route or component tree
- `NOT_REVIEWED`: not verified

| Route | Class | Notes |
| --- | --- | --- |
| `/` | `LEGACY_TAILWIND` | UI-UX showcase shell uses Tailwind tokens and hardcoded marketing copy. |
| `/login` | `MUI_COMPLETE` | Login form and shell react to locale switch and theme system. |
| `/dashboard` | `MUI_COMPLETE` | MUI shell and translated dashboard content are in place. |
| `/products` | `MUI_COMPLETE` | MUI workspace is in place and verified. |
| `/products/new` | `MUI_COMPLETE` | MUI create flow is localized and verified. |
| `/products/[id]/edit` | `MUI_COMPLETE` | MUI edit flow is localized and verified. |
| `/batches` | `LEGACY_TAILWIND` | Tailwind-first table/workspace with hardcoded labels. |
| `/batches/new` | `LEGACY_TAILWIND` | Legacy batch form flow. |
| `/batches/[id]/edit` | `LEGACY_TAILWIND` | Legacy batch editor flow. |
| `/parties` | `MUI_PARTIAL` | MUI workspace exists, but legacy sibling profile page remains. |
| `/parties/new` | `MUI_PARTIAL` | MUI create flow exists; verify copy coverage. |
| `/parties/[id]` | `LEGACY_TAILWIND` | Older party profile/detail experience. |
| `/parties/[id]/edit` | `MUI_PARTIAL` | MUI edit flow exists. |
| `/stock` | `LEGACY_TAILWIND` | Legacy operational workspace. |
| `/stock/in` | `LEGACY_TAILWIND` | Legacy stock-in workflow. |
| `/stock/out` | `LEGACY_TAILWIND` | Legacy stock-out workflow. |
| `/inventory/movements` | `MUI_COMPLETE` | Audit/review workspace with server-side query, translated shell, and DataGrid localization. |
| `/purchases` | `HYBRID` | Invoice workspace is business-sensitive and still Tailwind-heavy. |
| `/sales` | `HYBRID` | Invoice workspace is business-sensitive and still Tailwind-heavy. |
| `/payments` | `LEGACY_TAILWIND` | Legacy financial surface. |
| `/returns` | `LEGACY_TAILWIND` | Legacy return workflow with hardcoded labels. |
| `/ledger` | `LEGACY_TAILWIND` | Legacy ledger page and client workspace. |
| `/reports` | `LEGACY_TAILWIND` | Legacy reports center. |
| `/expiry-alerts` | `LEGACY_TAILWIND` | Legacy alert surface. |
| `/users` | `LEGACY_TAILWIND` | Legacy admin surface. |
| `/settings` | `MUI_PARTIAL` | MUI settings center exists, but route metadata and surrounding shell still need final audit. |
| `/backup` | `LEGACY_TAILWIND` | Legacy backup/restore center. |
| `/maintenance` | `LEGACY_TAILWIND` | Tailwind-based temporary shell. |

## Shared Component Audit

### MUI-only shared components

| Component | Status | Notes |
| --- | --- | --- |
| `src/components/layout/application-shell.tsx` | `MUI only` | Shell is MUI-based and direction-aware. |
| `src/components/layout/sidebar.tsx` | `MUI only` | Uses translated labels, locale-aware anchor, and permission filtering. |
| `src/components/layout/navbar.tsx` | `MUI only` | Uses translated labels plus language/theme controls. |
| `src/shared/ui/app-page-header.tsx` | `MUI only` | Shared header primitive. |
| `src/shared/ui/filter-toolbar.tsx` | `MUI only` | Shared filter container. |
| `src/shared/ui/search-field.tsx` | `MUI only` | Uses translations via `useLocale`. |
| `src/shared/ui/date-range-filter.tsx` | `MUI only` | Uses translations via `useLocale`. |
| `src/shared/ui/status-chip.tsx` | `MUI only` | MUI chip wrapper. |
| `src/shared/ui/metric-card.tsx` | `MUI only` | MUI card metric primitive. |
| `src/shared/ui/app-data-grid.tsx` | `MUI only` | Centralized DataGrid wrapper with Arabic locale text. |
| `src/shared/ui/app-drawer.tsx` | `MUI only` | RTL/LTR-aware drawer anchor. |
| `src/shared/ui/toolbar-action-group.tsx` | `MUI only` | Layout primitive only. |
| `src/components/confirm-dialog.tsx` | `MUI only` | Uses MUI dialog with translated cancel button. |
| `src/components/back-button.tsx` | `MUI only` | Translated action label. |
| `src/components/refresh-button.tsx` | `MUI only` | Translated action label. |
| `src/components/coming-soon.tsx` | `MUI only` | MUI-based state component with translated defaults. |
| `src/app/not-found.tsx` | `MUI only` | Translated not-found state. |
| `src/components/unauthorized.tsx` | `MUI only` | Translated unauthorized state. |

### Legacy or hybrid shared components

| Component | Status | Notes |
| --- | --- | --- |
| `src/components/page-shell.tsx` | `Hybrid` | Wraps MUI `ContentContainer`, but still part of a legacy composition layer. |
| `src/components/page-header.tsx` | `Legacy Tailwind` | Older page header wrapper. |
| `src/components/empty-state.tsx` | `Legacy Tailwind` | Legacy empty state styling. |
| `src/components/error-state.tsx` | `Legacy Tailwind` | Legacy error presentation. |
| `src/components/page-state.tsx` | `Legacy Tailwind` | Legacy generic state wrapper. |
| `src/components/page-skeleton.tsx` | `Legacy Tailwind` | Legacy loading skeleton. |
| `src/components/loading-spinner.tsx` | `Legacy Tailwind` | Legacy loader. |
| `src/components/content-container.tsx` | `Legacy Tailwind` | Legacy spacing/layout helper. |
| `src/components/layout/language-switcher.tsx` | `MUI only` | Uses central locale hook, but still needs final route-wide verification. |
| `src/components/layout/theme-toggle.tsx` | `MUI only` | Uses centralized color-scheme hook. |
| `src/shared/components/*` | `Hybrid` | Older shared utilities still contain Tailwind UI strings and styles. |

## Hardcoded String Audit

Only user-facing UI strings are listed below. Business data fields, codes, invoice numbers, batch numbers, and user-entered notes are excluded.

### 1. Shared shell labels

Likely hardcoded or duplicated in legacy components:
- `Maintenance mode`
- `This area is temporarily unavailable while we improve the system.`
- `Go to Dashboard`
- `Open the app`
- `Continue to sign in`
- `New UI-UX foundation`
- `Pharmacy CRM with a modern experience`

### 2. Navigation labels

Mostly centralized, but verify all legacy shell surfaces:
- Sidebar labels in `src/components/layout/sidebar.tsx`
- Route labels in `src/components/layout/navbar.tsx`
- Language labels in `src/components/layout/language-switcher.tsx`
- Theme labels in `src/components/layout/theme-toggle.tsx`

### 3. Buttons and actions

Still hardcoded in legacy surfaces:
- `Retry`
- `Refresh`
- `Print`
- `Export`
- `Back`
- `Save`
- `Cancel`
- `Go back`
- `Go to Dashboard`
- `Open Backup`
- `Load Dashboard`
- `Restore`
- `Preview`

### 4. Form labels and placeholders

Legacy heavy areas with hardcoded labels:
- Stock in/out forms
- Batch forms
- Return forms
- Backup restore input
- Search inputs in legacy tables and selectors

Examples found in active source:
- `Search...`
- `Original invoice`
- `Reference`
- `Notes`
- `Batch`
- `Quantity`
- `Movement Date`
- `Supplier`
- `Product`
- `Expiry Date`

### 5. Table column headers

Legacy tables still contain hardcoded headers in:
- Batches
- Parties legacy tables
- Products legacy tables
- Ledger
- Payments
- Reports
- Recent stock tables

### 6. Empty / loading / error / unauthorized messages

Hardcoded or legacy strings still present in older components:
- `No items found`
- `No records found`
- `Something went wrong`
- `Loading...`
- `Access restricted`
- `You do not have permission to view this page.`
- `Page not found`

### 7. Dialog and confirmation messages

Legacy dialog copy still exists in:
- Backup confirm flow
- Stock in/out confirmations
- Return confirmations
- Delete/disable dialogs in legacy CRUD screens

Examples:
- `Confirm`
- `Are you sure?`
- `Selected file`
- `Restore backup`
- `No batch`
- `None selected`

### 8. Validation messages

Validation messaging is still mixed across legacy forms:
- Zod/RHF errors in stock, products, parties, invoices, and returns
- English-only field-level validation still appears in legacy workflows

### 9. Page titles and descriptions

Still hardcoded in many route metadata exports:
- Batches
- Purchase Invoices
- Sales Invoices
- Payments
- Returns
- Ledger
- Reports
- Expiry Alerts
- Users
- Backup
- Maintenance

### 10. Toasts and notifications

Likely still mixed in legacy flows:
- Success/error toasts from stock, invoice, backup, and CRUD workflows
- Any `toast.*` output that is not routed through `next-intl`

## Sensitive Business Workflows

These routes should be treated as high-risk and modified only with care:
- `/stock`
- `/stock/in`
- `/stock/out`
- `/purchases`
- `/sales`
- `/returns`
- `/ledger`
- `/payments`
- `/batches`

Reason:
- They affect stock valuation, invoice posting, receivables/payables, and transaction history.

## Why Mixed UI Still Exists

The current frontend has two parallel layers:

1. A newer MUI/next-intl shell and a few migrated workspaces.
2. A large legacy Tailwind layer that still powers most operational pages.

That split explains why the locale switch works in some places but not everywhere.

## Migration Priority Map

Recommended next order:

1. Finish `MUI_PARTIAL` routes that already have a shell but may still have incomplete copy or nested legacy pages.
2. Convert `LEGACY_TAILWIND` operational pages one by one.
3. Leave high-risk business flows for the end of each domain.

## Existing Audit Files

Related docs already present in the repo:
- [`docs/03_DESIGN/UI_UX/04-implementation-audit.md`](D:/Projects/CRM_Sys/docs/03_DESIGN/UI_UX/04-implementation-audit.md)
- [`UI-UX/LOCALE_THEME_VISUAL_RESET_AUDIT.md`](D:/Projects/CRM_Sys/UI-UX/LOCALE_THEME_VISUAL_RESET_AUDIT.md)
- [`UI-UX/MILESTONE_RESET_0_REPORT.md`](D:/Projects/CRM_Sys/UI-UX/MILESTONE_RESET_0_REPORT.md)

## Bottom Line

The app is not globally localized yet.

The safe conclusion is:
- MUI shell foundation is established.
- `Login`, `Dashboard`, and `Inventory Movements` are the clearest localized surfaces.
- Most of the remaining app is still legacy Tailwind or hybrid.
- The next migration work should follow the route map above, not a global rewrite.
