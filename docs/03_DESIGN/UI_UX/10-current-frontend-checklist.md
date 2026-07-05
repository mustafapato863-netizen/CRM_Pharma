# Current Frontend Checklist

Date: 2026-07-03

This is the current truth snapshot for the Pharmacy CRM frontend recovery.

## Stack Status

- Active UI stack: Material UI
- Translation system: `next-intl`
- Locale behavior: Arabic RTL, English LTR
- Appearance modes: light, dark, system
- Tailwind in active source: no
- Tailwind in active dependencies: no

## Verified Complete

- `/login`
- `/dashboard`
- `/inventory/movements`
- `/users`
- `/settings`
- `/backup`
- `/maintenance`

These areas are the current reference implementation for the app shell, translation flow, and MUI presentation.

## MUI-Based But Still Needs Ongoing Verification

- `/products`
- `/batches`
- `/parties`

These areas are already on the MUI path, but they still need browser-grade visual verification and final consistency checks before being treated as fully closed everywhere.

## Remaining Route Families Still Needing Closure

- `/stock`
- `/purchases`
- `/sales`
- `/payments`
- `/returns`
- `/ledger`
- `/reports`
- `/expiry-alerts`
- `/`

These are not part of the confirmed clean core yet.

## What Was Removed From The Active Stack

- Tailwind CSS
- Tailwind PostCSS integration
- Tailwind utility styling from migrated active surfaces
- Radix dialog usage in migrated surfaces
- Sonner toast usage
- TanStack React Table usage in migrated surfaces
- lucide-react usage in newly migrated surfaces

## What Still Remains

- Route-family closure work
- Visual consistency cleanup
- RTL/LTR browser verification
- light/dark/system verification
- mobile and tablet verification
- warning cleanup from untouched legacy code paths

## Checklist

- [x] Central app shell on MUI
- [x] Locale flow on `next-intl`
- [x] RTL/LTR direction handling
- [x] Appearance switch with light/dark/system
- [x] Removed Tailwind from active source and deps
- [x] Removed legacy toast stack from migrated surfaces
- [x] Verified build passes
- [ ] Close `/products`
- [ ] Close `/batches`
- [ ] Close `/parties`
- [ ] Close `/stock`
- [ ] Close `/purchases`
- [ ] Close `/sales`
- [ ] Close `/payments`
- [ ] Close `/returns`
- [ ] Close `/ledger`
- [ ] Close `/reports`
- [ ] Close `/expiry-alerts`
- [ ] Close `/`

## Next Phase Plan

1. Finish browser verification for `Products`, `Batches`, and `Parties`.
2. Close the remaining operational domains one by one, without changing business logic.
3. Keep the stack single-source: MUI for UI, `next-intl` for copy.
4. Clean remaining warnings only where they block quality or correctness.
5. Re-run build and lint after each domain closure.

