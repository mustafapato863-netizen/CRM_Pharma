# CRM Stock — Quick Entry Refactor

## Place all files in the same stock component directory

This package contains the original 16 stock UI files plus one new shared type file:

```text
stock-ui.types.ts
```

The existing relative imports assume this directory layout:

```text
src/features/stock/
├─ actions/
├─ schemas/
├─ types/
└─ components/
   ├─ batch-selector.tsx
   ├─ create-batch-dialog.tsx
   ├─ inventory-movements-mui-page.tsx
   ├─ movement-summary.tsx
   ├─ product-search.tsx
   ├─ recent-stock-in-table.tsx
   ├─ recent-stock-out-table.tsx
   ├─ stock-in-form.tsx
   ├─ stock-in-page-client.tsx
   ├─ stock-movement-quick-entry.tsx
   ├─ stock-out-batch-selector.tsx
   ├─ stock-out-form.tsx
   ├─ stock-out-page-client.tsx
   ├─ stock-out-product-search.tsx
   ├─ stock-out-summary.tsx
   ├─ supplier-selector.tsx
   └─ stock-ui.types.ts
```

## What changed

### New `stock-ui.types.ts`
Centralizes shared UI contracts for:
- product, batch, supplier, and party lookup objects
- quick-entry rows and movement types
- quick-entry props and copy
- Stock In / Stock Out form and page props
- selector, summary, and recent table props
- inventory movements rows, filters, and page props

Business/domain types remain in the existing:
- `../types`
- `../types/stock-out`

### `stock-movement-quick-entry.tsx`
Rebuilt around the cashier quick-entry reference:
- compact operational header and actions
- four compact KPI cards with color-coded icon tiles
- one-row session defaults layout
- small automation notice inside the same workspace
- dense editable MUI DataGrid
- toolbar actions, add-new-row control, and summary footer inside the grid workspace
- dynamic grid height to avoid giant empty surfaces when there are only a few lines
- compact recent-movements DataGrid

### `inventory-movements-mui-page.tsx`
Refactored as a dense audit/history workspace:
- shared types import
- compact grid height based on current row count
- stronger DataGrid header/cell hierarchy
- clearer product code details
- compact detail drawer grid

## Intentionally unchanged
- authentication
- permissions
- backend actions
- database schema and migrations
- existing Stock In / Stock Out routes
- automatic purchase / sales / returns movement generation
- localization behavior
- theme provider architecture

## Validate in the project

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Then check:
- `/stock` in Light and Dark
- `/inventory/movements`
- Arabic RTL and English LTR
- Stock In and Stock Out posting with existing authorized users
