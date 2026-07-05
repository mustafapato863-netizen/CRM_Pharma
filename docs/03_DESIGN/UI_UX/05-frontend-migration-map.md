# Frontend Migration Map

Date: 2026-07-03

This map reflects the current honest state of the frontend recovery.
It is now superseded by [`14-frontend-final-status.md`](D:/Projects/CRM_Sys/docs/03_DESIGN/UI_UX/14-frontend-final-status.md) for the current active state.

## Status Legend

- `MUI_COMPLETE`: active route tree is MUI-only, localized, RTL/LTR safe, and build-verified
- `MUI_PARTIAL`: MUI exists, but the domain still has legacy siblings, unfinished states, or incomplete visual verification
- `LEGACY_TAILWIND`: Tailwind remains the primary active UI layer
- `HYBRID`: MUI and Tailwind are both used in the active route tree or within the same domain

## Route Map

| Route | Status | Notes |
| --- | --- | --- |
| `/` | `LEGACY_TAILWIND` | Showcase shell still uses legacy visual composition. |
| `/login` | `MUI_COMPLETE` | Shared auth shell is MUI and localized. |
| `/dashboard` | `MUI_COMPLETE` | Shared shell and dashboard cards are MUI. |
| `/products` | `MUI_PARTIAL` | Active product workspace is MUI, but legacy product files still remain in the repo and must be retired. |
| `/products/new` | `MUI_PARTIAL` | New-product flow is MUI, but route-family cleanup is not finished. |
| `/products/[id]/edit` | `MUI_PARTIAL` | Edit flow is MUI, but the products domain still has legacy residue. |
| `/batches` | `LEGACY_TAILWIND` | Old batch screen is still visible in the repository and needs a full rebuild. |
| `/batches/new` | `LEGACY_TAILWIND` | Legacy batch create flow. |
| `/batches/[id]/edit` | `LEGACY_TAILWIND` | Legacy batch edit flow. |
| `/parties` | `MUI_PARTIAL` | Main parties workspace is improved, but legacy party screens and table/tabs code still exist. |
| `/parties/new` | `MUI_PARTIAL` | Create flow is partially migrated. |
| `/parties/[id]` | `MUI_PARTIAL` | Profile route still needs full cleanup and visual verification. |
| `/parties/[id]/edit` | `MUI_PARTIAL` | Edit flow still needs finish pass. |
| `/stock` | `LEGACY_TAILWIND` | Visual state remains old in the active workflow screenshots. |
| `/stock/in` | `LEGACY_TAILWIND` | Operational stock-in flow still needs full rebuild. |
| `/stock/out` | `LEGACY_TAILWIND` | Operational stock-out flow still needs full rebuild. |
| `/inventory/movements` | `MUI_COMPLETE` | Verified audit-only workspace. |
| `/purchases` | `HYBRID` | Shell is modernized, but legacy invoice composition still exists. |
| `/sales` | `HYBRID` | Same pattern as purchases. |
| `/payments` | `LEGACY_TAILWIND` | Legacy financial screen. |
| `/returns` | `LEGACY_TAILWIND` | Legacy return workflow. |
| `/ledger` | `LEGACY_TAILWIND` | Legacy ledger surface. |
| `/reports` | `LEGACY_TAILWIND` | Legacy reports surface. |
| `/expiry-alerts` | `LEGACY_TAILWIND` | Legacy alert screen still visible in the repo. |
| `/users` | `MUI_COMPLETE` | MUI admin workspace was migrated in the scoped pass. |
| `/settings` | `MUI_COMPLETE` | MUI settings center is in place. |
| `/backup` | `MUI_COMPLETE` | MUI backup workspace is in place. |
| `/maintenance` | `MUI_COMPLETE` | MUI maintenance page is in place. |

## Shared Component Status

| Component | Status | Notes |
| --- | --- | --- |
| App shell | `MUI only` | Central shell is MUI-based. |
| Sidebar | `MUI only` | RTL-aware and localized. |
| Navbar | `MUI only` | Locale and theme aware. |
| Page shell / header primitives | `Hybrid` | MUI exists, but older shell helpers still remain. |
| Dialogs | `Hybrid` | MUI dialogs exist, legacy confirm dialogs still remain. |
| Tables / grids | `Hybrid` | `AppDataGrid` is MUI, but legacy tables still exist in several domains. |
| Forms | `Hybrid` | MUI forms exist, legacy forms still remain in products/parties/legacy screens. |
| Search / filters | `Hybrid` | Mixed implementation across the repo. |
| Empty / loading / error / unauthorized states | `Hybrid` | Shared MUI states exist, but legacy states still remain. |
| Language switcher | `MUI only` | Centralized locale flow. |
| Theme switcher | `MUI only` | Centralized color-mode flow. |

## What Is Still Old

The repo still contains active Tailwind or Tailwind-styled files in these areas:

- shared shell helpers
- legacy dashboard visuals
- legacy products table and form siblings
- legacy parties management and financial tabs
- legacy stock and batch screens
- legacy financial/reporting screens

## Hard Truth

The frontend is **not** fully single-stack yet.

The app shell has been modernized, but the old system still exists in the repository and some routes still use it.

## What To Trust Now

- Login, Dashboard, Inventory Movements, Users, Settings, Backup, and Maintenance are the cleanest MUI areas.
- Products is improved, but still needs full repo cleanup around it.
- Batches, Stock, Payments, Returns, Ledger, Reports, and Expiry Alerts are still legacy-heavy.
- Parties is in between and still needs finish work.
