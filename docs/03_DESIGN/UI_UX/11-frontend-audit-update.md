# Frontend Audit Update

Date: 2026-07-03

This is the updated truth snapshot after the frontend recovery cleanup.

## Current Stack

- UI stack: Material UI only
- Translation stack: `next-intl`
- Locale behavior: Arabic RTL and English LTR
- Appearance modes: light, dark, system

## Verified Clean Areas

- `/login`
- `/dashboard`
- `/inventory/movements`
- `/users`
- `/settings`
- `/backup`
- `/maintenance`

These areas are the current baseline for the shell, layout, and shared UI behavior.

## MUI-Based Areas Still Requiring Final Closure

- `/products`
- `/batches`
- `/parties`
- `/stock`

These routes are already on the MUI path, but they still need a final browser verification pass before being treated as fully closed.

## Remaining Legacy / Closure Areas

- `/purchases`
- `/sales`
- `/payments`
- `/returns`
- `/ledger`
- `/reports`
- `/expiry-alerts`
- `/`

These route families still need the last consistency pass.

## Old UI Stack Status

- Tailwind CSS: removed from active source and dependencies
- Radix Dialog: removed from migrated surfaces
- Sonner: removed from migrated surfaces
- TanStack React Table: removed from migrated surfaces
- lucide-react: removed from newly migrated surfaces

## Current Reality

The app is no longer split by UI stack in the active frontend.

What remains is route-family closure and visual verification, not another framework migration.

