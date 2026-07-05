# Locale, Theme and Visual Reset Audit

## Scope

This audit freezes new workspace migration until locale consistency and the shared Material UI foundation are stable. No routes, permissions, Prisma models, or business rules are in scope.

## Pre-fix locale findings

- Locale had three competing owners: the server cookie, `next-intl`, and a legacy client `LocaleProvider`/localStorage state.
- MUI direction was read once from `document.documentElement.dir`, so changing language did not rebuild the theme.
- The sidebar labels, navigation heading, footer, install action, date labels, search fallback, error state, loading state, and unauthorized state were hardcoded.
- Inventory Movements labels, DataGrid columns, filters, empty state, and drawer fields were hardcoded in English.
- Arabic strings in `translations.ts` were mojibake, so valid locale selection still rendered corrupted text.
- Drawer anchors, mobile navigation placement, breadcrumb arrows, and DataGrid direction were not locale-aware.

Missing keys found before replacement:

- `common.appName`, `common.version`, `common.navigation`, `common.copyright`, `common.installApp`, `common.from`, `common.to`
- `appearance.light`, `appearance.dark`, `appearance.system`
- `states.errorTitle`, `states.retry`, `states.unauthorizedTitle`, `states.unauthorizedDescription`, `states.loading`
- Inventory Movements header, metrics, filters, columns, empty state, actions, export notice, and drawer labels
- Dashboard section, action, metric, helper, empty, error, and timestamp labels

## Locale flow after hardening

The `pharmacy-crm:locale` cookie is the server source of truth. The root layout sets `html.lang`, `html.dir`, and the `NextIntlClientProvider` from it. The language selector writes the same cookie and refreshes the current route. MUI derives direction from the `next-intl` locale, so server HTML and client theme use the same value.

## Current theme and overrides

The centralized theme is `src/shared/theme/mui-theme.ts`. It defines light/dark semantic palettes, typography, spacing, radius, elevation, and defaults for Button, TextField, Autocomplete, Chip, Drawer, DataGrid, Tooltip, Skeleton, Alert, Dialog, Menu, Paper, and Card.

The old `next-themes` provider is no longer in the active provider tree. MUI owns `light`, `dark`, and `system` mode through `pharmacy-crm:theme` local storage and `InitColorSchemeScript`.

## Hardcoded visual values still present

- Legacy Dashboard and `DashboardCard` still contain Tailwind color, radius, spacing, shadow, and gradient utilities.
- `AppPageHeader`, `FilterToolbar`, `MetricCard`, and a few legacy page components still contain local radius/spacing values that should become component variants in the reset.
- Legacy pages outside migrated MUI workspaces still depend on `surface.tsx` utility classes and light-only Tailwind colors.
- App shell dimensions currently use a 260 px desktop sidebar and 76 px navbar. These are stable layout constants but are not yet named theme tokens.

## Mixed MUI and Tailwind patterns

- The shared app shell, locale selector, appearance selector, install action, and shared states are now MUI-only.
- Dashboard presentation remains transitional: MUI shell around Tailwind cards and sections.
- Products, Parties, and Inventory Movements migrated workspaces are primarily MUI; their legacy sibling components remain in the repository for routes not yet switched or safe rollback.
- Tailwind cannot be removed until all active pages and loading/error routes are migrated.

## Typography

- English: `Segoe UI`, then `Inter`, system UI, sans-serif.
- Arabic: `Noto Sans Arabic`, then `Segoe UI`, Tahoma, sans-serif.
- `Noto Sans Arabic` is currently a fallback name only; bundling a local/web font is deferred until the visual references approve the final type family.

## Current scales

- Sidebar: 260 px desktop; temporary drawer up to 320 px mobile.
- Page widths: inconsistent; several legacy pages use their own max widths.
- Spacing: MUI base unit 8 px; legacy Tailwind pages also use Tailwind spacing.
- Radius: MUI base 12 px; legacy components range roughly from 12 px to 32 px.
- Shadows: centralized MUI elevation now uses restrained operational shadows; legacy cards retain custom blue/gray shadows.

## Dashboard hierarchy gaps

The current dashboard gives nearly equal emphasis to headers, actions, and every metric card. Decorative gradients and large rounded cards consume space without improving scan speed. Financial, inventory, and exception metrics do not have a clear priority order, and mobile composition is a reduced grid rather than an operational summary. The reset should establish one primary summary band, one exception band, compact actions, and denser activity/reporting sections.

## Proposed token system

- Typography: 12/14/15 px body scale, 18/22/28/32 px heading scale, 600-700 emphasis, locale-aware family.
- Spacing: 4 px primitive with 8/12/16/24/32/40 px semantic steps.
- Elevation: none, surface, raised, overlay; avoid decorative shadows.
- Borders: semantic divider plus strong/interactive variants derived per color scheme.
- Radius: 8 px controls, 12 px surfaces, 16 px feature cards, circular only for avatars/status dots.
- Light palette: neutral blue-gray background, white surfaces, calm blue primary, accessible semantic colors.
- Dark palette: deep neutral background, lifted blue-gray surfaces, reduced-glare text, brighter semantic colors.
- Statuses: success, warning, error, info use theme palette and shared chip/alert variants only.

## Visual System Reset files

Expected first reset changes:

- `src/shared/theme/mui-theme.ts`
- `src/shared/providers/MuiThemeProvider.tsx`
- `src/components/layout/application-shell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/navbar.tsx`
- `src/shared/ui/app-page-header.tsx`
- `src/shared/ui/filter-toolbar.tsx`
- `src/shared/ui/metric-card.tsx`
- `src/shared/ui/app-data-grid.tsx`
- `src/shared/ui/app-drawer.tsx`
- `src/components/dashboard-card.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/globals.css`

## Deferred work

- Full Dashboard MUI conversion and hierarchy redesign waits for visual approval.
- Remaining feature-page hardcoded strings must be migrated domain by domain; the shared shell and Inventory Movements pilot are covered here.
- `next-themes` can be removed from dependencies after confirming no legacy imports remain.
- Tailwind remains until all active legacy pages are migrated.
