# Frontend Recovery Master Plan

Date: 2026-07-03

This is the final closure plan for moving the Pharmacy CRM frontend to one visual policy:

- Material UI only for the final active frontend
- `next-intl` only for UI text
- no new Tailwind usage in any route being repaired

## Current Truth

The app is not fully single-stack yet.

What is already cleanest:
- `/login`
- `/dashboard`
- `/inventory/movements`
- `/users`
- `/settings`
- `/backup`
- `/maintenance`

What still needs work:
- `/products`
- `/batches`
- `/parties`
- `/stock`
- `/purchases`
- `/sales`
- `/payments`
- `/returns`
- `/ledger`
- `/reports`
- `/expiry-alerts`
- `/`

## Closure Rules

1. No new feature migration until the current route family is clean.
2. No route is “complete” if any active component in that route still uses Tailwind utility classes.
3. No route is “complete” if it still has hardcoded user-facing strings.
4. No route is “complete” if RTL/LTR, light/dark, or empty/loading/error states are not verified.
5. No business logic, schema, auth, permissions, or server-action behavior changes.

## Page-by-Page Closure Order

1. `Products`
2. `Batches`
3. `Parties`
4. `Stock`
5. `Purchases`
6. `Sales`
7. `Payments`
8. `Returns`
9. `Ledger`
10. `Reports`
11. `Expiry Alerts`
12. `Users`
13. `Settings`
14. `Backup`
15. `Maintenance`
16. `/` showcase cleanup

## Per-Route Finish Checklist

For every route:

- replace remaining Tailwind UI with MUI
- remove hardcoded labels, placeholders, titles, and empty states
- verify Arabic RTL and English LTR
- verify light, dark, and system appearance
- verify desktop, tablet, and mobile layout
- verify loading, empty, error, and unauthorized states
- verify build and type safety
- keep permissions and business behavior unchanged

## Shared Cleanup Order

Before removing Tailwind globally, finish these shared leftovers:

- legacy shell helpers
- legacy confirm dialogs
- legacy dashboard cards and skeletons
- legacy surface helpers
- legacy search / loading / empty components
- legacy product table/form/toolbars
- legacy parties management and financial tabs

## Tailwind Removal Gate

Tailwind dependencies and globals have now been removed.

This gate was satisfied when:

- `rg "className=" src` returns no active Tailwind UI in the active frontend
- no active route imports legacy Tailwind helpers
- no active route depends on `tailwind-merge`
- `src/app/globals.css` no longer needs Tailwind directives
- build passes after the cleanup

## Final Exit Criteria

The frontend is done only when:

- all active routes are MUI complete
- no pages are split between old and new systems
- no Tailwind utility classes remain in active UI
- no hardcoded UI strings remain in active UI
- Arabic and English both render correctly
- light, dark, and system modes work
- Tailwind can be removed safely
