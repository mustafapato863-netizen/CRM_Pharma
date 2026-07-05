# Frontend Recovery Report

Date: 2026-07-03

This document records what actually happened during the frontend recovery and localization repair work.

It is a factual report, not a marketing summary.

## What Was Repaired

### Global shell and locale flow

- The app now uses a single `next-intl`-based locale flow.
- Root `html lang` and `dir` are set from the active locale.
- The shared app shell reacts correctly to Arabic and English.
- The MUI theme direction follows the locale.
- The language switcher persists the selected locale.

### MUI foundation

- The shared app shell is MUI-based.
- Sidebar and navbar are MUI-based and translated.
- Shared primitives like page headers, filter bars, drawers, and DataGrid wrappers now use MUI.
- The appearance selector supports light, dark, and system modes.

### Verified MUI-complete domains

- `/login`
- `/dashboard`
- `/inventory/movements`

These domains now use:
- MUI-only active UI in the migrated route tree
- translated user-facing UI strings
- RTL/LTR-safe layout behavior
- localized metadata where applied
- build-verified route output

### Provisional repaired domains

- `/products`
- `/batches`
- `/parties`
- `/stock`

These route families have been moved onto the shared MUI + `next-intl` path, but they still need one final browser verification pass to be treated as fully closed. The remaining check is not Tailwind removal anymore; it is visual consistency, RTL/LTR correctness, and state coverage.

Users, Settings, Backup, and Maintenance are now on the shared MUI + `next-intl` path as well. They were repaired in the same recovery wave and should be treated as part of the unified frontend stack.

## What Was Not Fully Finished

The application is not globally complete yet.

The following areas still need closure or final browser verification outside the verified domains:

- `/purchases` and `/sales` remain the main unfinished operational surfaces
- `/payments`, `/returns`, `/ledger`, `/reports`, and `/expiry-alerts` still need route-family closure work
- some older shared components still exist in the repository for untouched routes

## What Changed In Practice

- Hardcoded UI strings were moved into the shared translation system for the repaired domains.
- Route metadata for the repaired Products routes was localized.
- Product stock-state and action copy were localized.
- The damaged Arabic Products translation block that rendered as `????` was replaced.
- The global not-found state and Products loading state were converted to MUI.
- Batches active routes were converted to the shared MUI pattern.
- Stock active routes were converted to the shared MUI pattern while preserving stock actions and validation rules.
- Users, Settings, Backup, and Maintenance were converted to the shared MUI + `next-intl` pattern.
- Product and shell verification passed through `npm run lint` and `npm run build`.

## What Did Not Change

- Prisma schema
- database data
- stock logic
- invoice logic
- return logic
- ledger logic
- permission keys
- authentication logic
- route paths

## Important Clarification

There is no Tailwind left in the active frontend stack.

There are still route families that need the last verification and closure pass.

So the correct current statement is:

- the repaired domains are MUI-based and localized
- the whole application is not yet fully migrated
- old Tailwind pages have not all been removed

## Recommended Next Step

Visually verify Products, Batches, Stock, Users, Settings, Backup, and Maintenance, then migrate Purchases/Sales because they are the next visible hybrid operational areas.
