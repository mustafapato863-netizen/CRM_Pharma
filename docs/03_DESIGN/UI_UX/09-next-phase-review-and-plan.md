# Phase Review & Next Development Plan

Date: 2026-07-03

This document is a factual review of the frontend recovery state and a practical plan for the next development phase.

## 1. Current State Review

### What is now clean

The following areas are the strongest and should be treated as the reference implementation:

- `/login`
- `/dashboard`
- `/inventory/movements`
- `/users`
- `/settings`
- `/backup`
- `/maintenance`

These areas now represent the current target standard:

- Material UI is the visual stack
- `next-intl` is the translation source
- Arabic and English are routed through one locale flow
- RTL/LTR behavior is centralized
- Tailwind is no longer part of the active frontend stack

### What is still not fully finished

The remaining route families still need cleanup, finish work, or full visual verification:

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

### Important technical reality

The app no longer has Tailwind in the active stack, but it still has unfinished route families and a few legacy visual patterns that need finish work.

The next phase is therefore **not** a Tailwind migration.
It is a **legacy-route closure and quality pass**.

## 2. What Was Successfully Completed

### Platform-level wins

- One locale flow through `next-intl`
- One MUI theme system
- MUI-only app shell
- MUI-only toast system
- Tailwind removed from active source and dependencies

### Domain wins

- `Login`, `Dashboard`, `Inventory Movements`, `Users`, `Settings`, `Backup`, and `Maintenance` are the cleanest areas
- `Products` is improved and mostly aligned, but still needs final review
- `Parties` is structurally MUI-based, but still needs final closure on the remaining route-family details
- `Batches`, `Parties`, `Stock`, and the finance/reporting routes still need closure work

## 3. Current Gaps

### Remaining route gaps

- `Batches` still needs full route-family closure and visual cleanup
- `Stock` still needs a final operational polish pass
- `Parties` still needs a finish pass on consistency and route-family closure
- `Purchases` and `Sales` are still the largest hybrid-risk surfaces
- `Payments`, `Returns`, `Ledger`, `Reports`, and `Expiry Alerts` still need route consistency and verification

### Remaining code-quality gaps

There are still warnings that should be cleared in the next phase:

- unused variables in some query/components
- `react-hook-form` compiler warnings on watched fields
- a few legacy route-level surfaces still need a final pass

### Residual review gaps

The following checks still need to be done carefully on all remaining route families:

- browser verification on Arabic RTL
- browser verification on English LTR
- light/dark/system appearance
- desktop/tablet/mobile behavior
- empty, loading, error, unauthorized, and not-found states

## 4. Recommended Next Phase

The next phase should be:

**Legacy Route Closure Phase**

Goal:
- finish the remaining route families without changing business logic
- make the app visually consistent end-to-end
- clear technical debt that blocks confidence

### Phase order

1. `Batches`
2. `Parties`
3. `Stock`
4. `Purchases`
5. `Sales`
6. `Payments`
7. `Returns`
8. `Ledger`
9. `Reports`
10. `Expiry Alerts`
11. Root `/` cleanup last

## 5. Development Plan for the Next Phase

### Phase A: Route completion and verification

For each route family:

- confirm the active route tree uses MUI only
- remove leftover legacy visual composition
- keep the existing business logic untouched
- ensure translations are complete
- verify RTL/LTR and theme behavior
- verify mobile and tablet layout

### Phase B: Shared quality cleanup

After the route work, clean the remaining warnings:

- remove unused variables
- simplify code paths that only exist for legacy support
- remove dead route siblings and dead helpers
- keep only the shared components that still have active callers

### Phase C: Visual consistency pass

Once the routes are closed:

- normalize spacing and density
- normalize headings, breadcrumbs, cards, and tables
- make error and empty states feel consistent
- keep the UI operational, not decorative

### Phase D: Final verification

Before any final “done” statement:

- run `npm run build`
- run `npm run lint`
- verify the remaining routes manually in the browser
- confirm no page is split between old and new systems

## 6. Risk Management Rules

Do not change:

- Prisma schema
- authentication
- permission keys
- stock logic
- invoice logic
- return logic
- ledger logic
- server-action contracts

Do not add:

- new feature scope
- mock records
- decorative UI experiments
- additional UI frameworks

## 7. Recommended Success Criteria for the Next Phase

The next phase is done when:

- the remaining route families are closed or explicitly marked legacy
- the active frontend behaves as one MUI application
- no active route depends on old visual systems
- the remaining build warnings are reduced or intentionally documented
- the app is ready for final cleanup and polish rather than structural repair

## 8. Short Summary

The foundation is now in good shape.

The next phase should focus on **closing the remaining route families** and **removing the last pockets of legacy behavior** without touching the business layer.
