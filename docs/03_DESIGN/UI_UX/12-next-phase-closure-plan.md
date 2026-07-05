# Next Phase Closure Plan

Date: 2026-07-03

This plan closes the remaining route families without touching business logic.

## Rules

- Keep Material UI as the only active UI system.
- Keep `next-intl` as the only translation system.
- Do not change Prisma schema.
- Do not change stock, invoice, payment, return, ledger, report, permission, or auth logic.
- Do not introduce new frameworks or decorative redesigns.

## Order

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
12. `/`

## Per-Route Checklist

For each route family:

- verify the route tree uses MUI only
- verify all user-facing strings come from `next-intl`
- verify Arabic RTL and English LTR
- verify light, dark, and system appearance
- verify desktop, tablet, and mobile layouts
- verify loading, empty, error, unauthorized, and not-found states
- verify no page is split between old and new UI layers
- run `npm run lint`
- run `npm run build`

## Finish Criteria

The phase is done when:

- all active routes are on one UI stack
- no active route depends on legacy visual composition
- remaining warnings are either removed or explicitly documented

