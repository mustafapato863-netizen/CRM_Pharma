# Products, Add Product & Batches — UI/UX Redesign

## What is included

This package is a complete updated copy of the files you sent, with a focused redesign of:

- **Products workspace**
  - Native MUI DataGrid preserved: server pagination, column-header sorting, responsive horizontal scrolling, and row actions.
  - Functional category/status filters persisted in the URL.
  - Four accurate catalog metrics: total, active, inactive, and products without batches.
  - Product details drawer with direct links to the related batch view and edit form.
  - Export of the currently loaded product page to Excel.

- **Add / Edit Product**
  - Clear identity, classification, lookup, and availability sections.
  - Uses only fields that truly exist in the current Prisma `Product` model.
  - Keeps the “enter data once” rule visible: the product is created once; batches and movements attach to it.
  - Responsive two-column desktop layout that becomes one column on tablet/mobile.

- **Batches workspace**
  - Native MUI DataGrid preserved with client-side filtering and correct client pagination.
  - Product, status, and expiry-window filters.
  - Metrics for total, available, expiring soon, and empty batches.
  - Details drawer, direct edit/deactivate actions, export, and contextual product filtering via `/batches?productId=...`.
  - The product table can now open the batches page already filtered to the selected product.

- **Add / Edit Batch**
  - Product, batch identity, opening stock/cost, and expiry are grouped into operational sections.
  - Adding a batch from a product can preselect that product via `/batches/new?productId=...`.
  - The screen explicitly reinforces that later quantity changes must be recorded in Stock Movement, not by overwriting batch opening quantity.

## Important functional correction

The original Product list calculation treated `DAMAGED` and `ADJUSTMENT` movements as additions, while the Batch calculation treated them as deductions. The redesigned `get-products.ts` uses the same movement direction logic as the batch utility, so Product stock now matches the sum of its batches.

## Intentionally not added to the database

The visual mockup includes fields such as barcode, supplier, manufacturer, selling price, reorder level, category tables, and product images. Those fields are **not present in the current Prisma source of truth**. They were intentionally not faked in the forms or tables.

Add them later through a deliberate Prisma migration when the business actually needs them. This keeps the MVP clean and respects the project rule that each piece of information is entered once.

## Files changed

1. `src/shared/ui/app-data-grid.tsx`
2. `src/shared/ui/metric-card.tsx`
3. `src/shared/config/translations.ts`
4. `src/features/products/types/index.ts`
5. `src/features/products/queries/get-products.ts`
6. `src/features/products/components/products-workspace.tsx`
7. `src/features/products/components/product-form-mui.tsx`
8. `src/app/(dashboard)/products/page.tsx`
9. `src/app/(dashboard)/products/new/page.tsx`
10. `src/app/(dashboard)/products/[id]/edit/page.tsx`
11. `src/features/batches/components/batches-toolbar.tsx`
12. `src/features/batches/components/batches-table.tsx`
13. `src/features/batches/components/batch-form.tsx`
14. `src/app/(dashboard)/batches/page.tsx`
15. `src/app/(dashboard)/batches/new/page.tsx`
16. `src/app/(dashboard)/batches/[id]/edit/page.tsx`

## Validation performed

- All redesigned `.ts` and `.tsx` files passed a TypeScript syntax transpilation check.
- A complete `tsc --noEmit` cannot be completed inside this package alone because the upload did not contain `node_modules`; the resulting module-resolution errors are expected in that isolated environment.

Run these checks after copying the package into the real repository:

```bash
npm install
npx prisma generate
npm run lint
npx tsc --noEmit
npm run build
```
