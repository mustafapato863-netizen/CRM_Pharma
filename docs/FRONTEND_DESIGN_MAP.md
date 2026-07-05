# Frontend Design Map

## Purpose

This document explains where the frontend design system lives in the repository, which files control the global look and feel, and which shared components are responsible for visual consistency across the app.

## Design Ownership Model

The UI should follow one visual language:

- `globals.css` defines the global surface, background, typography, and motion baseline.
- `shared/` holds reusable design tokens, helpers, providers, and UI infrastructure.
- `components/layout/` owns the application shell, navigation, and top-level chrome.
- `components/` contains shared UI patterns used across multiple pages.
- `features/*/components/` contains feature-specific UI that must still conform to the shared system.
- `app/` pages should assemble layout and feature components, not define new visual rules.

## Global Styling Files

### `src/app/globals.css`

Primary source of global visual behavior.

Responsibilities:

- App background and ambient gradients
- Base font family
- Global color scheme
- Shared motion/keyframe behavior
- Cross-app selection styling

Use this file when changing:

- Page background
- Global light/dark baseline
- Ambient blobs or motion
- Default body typography

### `src/app/layout.tsx`

Root application layout.

Responsibilities:

- Global providers
- Root HTML/body structure
- Theme provider wiring
- Font and document-level wrappers

Use this file when changing:

- Global shell composition
- Provider order
- Hydration-sensitive root attributes

## Shared Design Tokens

### `src/shared/constants/colors.ts`

Central color token list for the app.

Use it when:

- A feature needs the canonical brand colors
- A component should not hardcode a random palette

### `src/shared/config/theme.ts`

Theme defaults and global theme preferences.

Use it when:

- Changing the default theme behavior
- Aligning app-wide theme decisions

### `src/shared/lib/cn.ts`

Utility for safe Tailwind class merging.

Use it when:

- Building reusable UI components
- Combining conditional class names

## Shared UI Infrastructure

### `src/shared/providers/Providers.tsx`

Top-level provider composition.

Usually responsible for:

- React Query
- Toasts
- Theme context

### `src/shared/providers/ThemeProvider.tsx`

Theme state and theme persistence.

### `src/shared/providers/ToastProvider.tsx`

Toast container and visual toast behavior.

### `src/shared/providers/QueryProvider.tsx`

Server cache and client cache integration.

## Layout and Shell

### `src/components/layout/application-shell.tsx`

Main application frame.

Responsibilities:

- Sidebar + navbar composition
- Page framing
- Global content spacing
- Footer placement

### `src/components/layout/sidebar.tsx`

Primary navigation container.

Responsibilities:

- Section grouping
- Shell background and surface treatment
- Mobile open/close behavior

### `src/components/layout/sidebar-item.tsx`

Navigation item styling.

Responsibilities:

- Active state
- Hover state
- Radius and spacing consistency

### `src/components/layout/navbar.tsx`

Top bar chrome.

Responsibilities:

- Search trigger
- Notifications
- Account menu
- Header surface styling

### `src/components/layout/logout-button.tsx`

Logout action styling and behavior.

## Shared Page Components

### `src/components/page-header.tsx`

Standard page heading block.

Use it for:

- Section titles
- Supporting descriptions
- Consistent page spacing
- Optional page icon, breadcrumbs, and header action

### `src/components/header-icon.tsx`

Lucide-backed page icon mapping used by shared headers.

### `src/components/page-shell.tsx`

Shared page width and spacing wrapper for standard pages.

### `src/components/page-skeleton.tsx`

Shared loading skeleton for page-level states.

### `src/components/coming-soon.tsx`

Shared placeholder for unimplemented or hidden features.

### `src/components/error-state.tsx`

Shared retryable error state for page-level failures.

### `src/components/dashboard-card.tsx`

Reusable metric and summary card.

Use it for:

- Dashboard counters
- Inventory summaries
- Lightweight CTA cards

### `src/components/dashboard-card-skeleton.tsx`

Loading placeholder for dashboard cards.

### `src/components/empty-state.tsx`

Shared empty state visual pattern.

### `src/components/unauthorized.tsx`

Shared permission-denied UI.

### `src/components/loading-spinner.tsx`

Shared loading indicator.

### `src/app/(dashboard)/users/page.tsx`

Premium user management center route.

### `src/features/users/components/users-page-client.tsx`

Client-side user management table, drawer, filters, and invite modal.

### `src/features/users/actions/user-actions.ts`

Server actions for creating, updating, and deactivating users.

### `src/components/content-container.tsx`

Page content width and spacing wrapper.

### `src/components/section-card.tsx`

Shared elevated card container for page sections.

### `src/components/page-state.tsx`

Convenience barrel for page-state shared components.

### `src/components/ui/surface.tsx`

Internal UI tokens and shared wrappers for glass cards, floating cards, page sections, toolbars, and button primitives.

### `src/components/ui/index.ts`

Barrel export for the internal UI kit.

### `src/components/ui/app-card.tsx`

Reusable glass card alias for app sections.

### `src/components/ui/section-title.tsx`

Reusable section heading with optional action.

## Feature UI

Feature-level UI must inherit the shared system.

Examples:

- `src/features/products/components/*`
- `src/features/batches/components/*`
- `src/features/parties/components/*`
- `src/features/inventory/components/*`

Rule:

- Feature components may define layout details for their workflow.
- They should not invent a new palette, radius system, or shadow system.
- They should reuse shared buttons, cards, tables, and inputs when possible.

## Inventory UI Map

### `src/features/inventory/components/stock-in-page-client.tsx`

Stock IN page composition.

Responsible for:

- Section layout
- Read/write mode
- Toasts and confirmations
- Empty-state handling

### `src/features/inventory/components/stock-in-form.tsx`

Main Stock IN form shell.

### `src/features/inventory/components/product-search.tsx`

Product search input.

### `src/features/inventory/components/batch-selector.tsx`

Batch selection UI.

### `src/features/inventory/components/supplier-selector.tsx`

Supplier selection UI.

### `src/features/inventory/components/movement-summary.tsx`

Live summary panel.

### `src/features/inventory/components/recent-stock-in-table.tsx`

Recent movements table.

### `src/app/(dashboard)/inventory/movements/page.tsx`

Inventory movement workspace with spreadsheet-style history plus inline Stock IN / Stock OUT operations.

### `src/shared/lib/export/inventoryMovementsExport.ts`

Shared Excel export helper for the inventory movement sheet.

## Design Source of Truth

When something looks inconsistent, check this order:

1. `src/app/globals.css`
2. `src/shared/constants/colors.ts`
3. `src/shared/config/theme.ts`
4. `src/components/layout/*`
5. `src/components/*`
6. `src/features/*/components/*`

## Frontend Rules

- Do not hardcode random colors in feature components.
- Do not create a second shadow system.
- Do not create a second radius system.
- Do not use dark surfaces for forms, tables, or selection controls unless the design system explicitly asks for it.
- Prefer shared components over duplicate UI patterns.
- Keep all screens visually aligned with the same premium light SaaS language.

## Quick Reference

| Area | File |
|---|---|
| Global background and motion | `src/app/globals.css` |
| Theme defaults | `src/shared/config/theme.ts` |
| Brand colors | `src/shared/constants/colors.ts` |
| Shell layout | `src/components/layout/application-shell.tsx` |
| Sidebar | `src/components/layout/sidebar.tsx` |
| Navbar | `src/components/layout/navbar.tsx` |
| Page header | `src/components/page-header.tsx` |
| Page icon map | `src/components/header-icon.tsx` |
| Page shell | `src/components/page-shell.tsx` |
| Page skeleton | `src/components/page-skeleton.tsx` |
| UI tokens and wrappers | `src/components/ui/surface.tsx` |
| UI kit barrel | `src/components/ui/index.ts` |
| App card | `src/components/ui/app-card.tsx` |
| Section title | `src/components/ui/section-title.tsx` |
| Dashboard cards | `src/components/dashboard-card.tsx` |
| Empty state | `src/components/empty-state.tsx` |
| Unauthorized state | `src/components/unauthorized.tsx` |
| Coming soon state | `src/components/coming-soon.tsx` |
| Error state | `src/components/error-state.tsx` |
| Section card | `src/components/section-card.tsx` |
| Toasts | `src/shared/lib/toast.ts` |
| Class merging | `src/shared/lib/cn.ts` |

## Missing and Maintenance States

### `src/app/not-found.tsx`

Custom branded 404 page.

### `src/app/maintenance/page.tsx`

Reusable maintenance / coming soon page.

### Unfinished Feature Routes

The following routes should use `ComingSoon` instead of exposing a default Next.js error screen:

- `src/app/(dashboard)/ledger/page.tsx`
- `src/app/(dashboard)/reports/page.tsx`
- `src/app/(dashboard)/backup/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/stock/out/page.tsx`

## PWA Foundation

- `src/components/install-app-button.tsx` exposes the install prompt when the browser supports it.
- `src/app/layout.tsx` now declares the manifest, icons, Apple web app metadata, and viewport settings.
- `public/site.webmanifest` and `public/icons/*` provide installable branded app assets.
