# Domain Completion Checklist

Tracks completed domains and verification checklist markers.

## Redesigned Domains Status

- [x] **Login** — `MUI_COMPLETE`
- [x] **Dashboard** — `MUI_COMPLETE`
- [x] **Inventory Movements** — `MUI_COMPLETE`
- [x] **Ledger** — `MUI_COMPLETE`
- [x] **Reports** — `MUI_COMPLETE`
- [x] **Products** — `MUI_COMPLETE`
- [x] **Batches** — `MUI_COMPLETE`
- [x] **Parties** — `MUI_COMPLETE`
- [x] **Stock** — `MUI_COMPLETE`
- [x] **Purchases** — `MUI_COMPLETE`
- [x] **Sales** — `MUI_COMPLETE`
- [x] **Payments** — `MUI_COMPLETE`
- [x] **Returns** — `MUI_COMPLETE`
- [x] **Expiry Alerts** — `MUI_COMPLETE`
- [x] **Users** — `MUI_COMPLETE`
- [x] **Settings** — `MUI_COMPLETE`
- [x] **Backup** — `MUI_COMPLETE`

---

## Ledger Completion Verification

The `/ledger` review workspace is verified against the following constraints:

### 1. Running Balance Safety
- Verified that running balance is **not** calculated in the client/UI layer.
- Running balance columns and calculations have been removed completely from both the UI tables and Excel/CSV export workbooks because they are not provided as a trusted historical ledger value from the database services.

### 2. Data Access & Constraints
- **Ledger Entries & Stock movements queries**: Integrated inside `getLedgerWorkspace` to execute database-level where clauses based on active filters (party, dates, transaction type, search, reference).
- **Party/account balance source:** `getPartyFinancialSummaries` service layer.
- **Debit/credit convention:** Retained signed math `SUPPLIER_BALANCE` and `DUE_PAYMENT` are negative entries; all other movements are positive. Stock out is negative; stock in is positive.
- **Filtering & Pagination:** Performed server-side inside `getLedgerWorkspace` via an ID-only lightweight query chronological merge, in-memory sort/slice, and hydrated relational page fetching.
- **URL state:** Filter query parameters (`partyId`, `page`, `pageSize`, `search`, etc.) are synchronized to URL search params.

### 3. Verification Metrics
- **Arabic RTL:** Fully aligned using Noto Noto Sans Arabic fonts under RTL layouts.
- **English LTR:** English LTR styling fully verified.
- **Theme support:** System, Dark, and Light modes inherit theme overrides perfectly.
- **Lint/Build:** Passed without errors.

---

## Reports Completion Verification

The `/reports` workspace is verified against the following constraints:

### 1. Data Access & Constraints
- **Data queries:** Category-specific server queries resolve only the requested active tab category inside `get-report-category.ts`. Preloads metrics summaries only.
- **Filtering & Pagination:** Evaluated server-side at the query level using Prisma where clauses, page offsets, and limit offsets.
- **Tab navigation:** Triggered via URL search parameters (`?tab=...`), loading category table data on-demand.

### 2. Verification Metrics
- **Arabic RTL:** RTL styling aligned under Arabic locale with localized text and dates.
- **English LTR:** English LTR layout is functional.
- **Theme support:** Light and Dark themes verified.
- **Lint/Build:** Verification runs successfully with zero errors.

---

## Purchases & Sales Completion Verification

The `/purchases` and `/sales` workspaces are verified against the following constraints:

### 1. Data Access & Constraints
- **Workspace query:** Page preloads suppliers/customers, active products, and existing stock batches to support inline selection and auto-generations.
- **Form validation:** Standard Zod schema checks (`invoiceSchema`) executed via `react-hook-form` to ensure code integrity, non-negative amounts, and positive stock numbers.
- **Financial posting:** Integrates standard server actions (`createPurchaseInvoiceAction`, `createSalesInvoiceAction`) that write transactions, stock movements, and ledger balances inside atomic SQL database transactions.

### 2. Verification Metrics
- **Arabic RTL:** Fully aligned Arabic RTL layout.
- **English LTR:** English LTR layout fully verified.
- **Theme support:** Light and Dark schemes inherited correctly.
- **Lint/Build:** Verification compiles and bundles without errors.

---

## Payments & Returns Completion Verification

The `/payments` and `/returns` workspaces are verified against the following constraints:

### 1. Data Access & Constraints
- **Party autocomplete:** Autocomplete fields filter suppliers and customers dynamically based on type (CUSTOMER/SUPPLIER/BOTH) and pre-fill existing account balances.
- **Invoice linking:** Filters invoices dynamically by selected party to prevent cross-account posting.
- **Transaction posting:** Implements standard transactional server actions (`recordPartyTransactionAction`, `createReturnAction`) to post payments, receipts, and invoice returns atomically.

### 2. Verification Metrics
- **Arabic RTL:** Fully aligned Arabic RTL layout.
- **English LTR:** English LTR layout fully verified.
- **Theme support:** Light and Dark themes inherit colors correctly.
- **Lint/Build:** Verification compiles and bundles without errors.

---

## Expiry Alerts Completion Verification

The `/expiry-alerts` workspace is verified against the following constraints:

### 1. Data Access & Constraints
- **Data queries:** Category-specific queries resolve expired and near-expiry stock dynamically inside `get-expiry-alerts.ts` on the server.
- **Filtering & Pagination:** Performed at the query level inside the database using search keywords, window filters, product filter, stock availability, sorting fields, and pagination skip/take limits.
- **Batch Details Drawer:** Clicking a row opens a details drawer containing product name, code, batch number, expiry date, days remaining, quantity, related supplier name, purchase reference, and direct links to product/batch/movements.

### 2. Verification Metrics
- **Arabic RTL:** Fully aligned Arabic RTL layout using next-intl translations.
- **English LTR:** English LTR layout fully verified.
- **Theme support:** Light and Dark schemes inherited correctly.
- **Lint/Build:** Compiled successfully with zero TypeScript and ESLint problems.

---

## Users Completion Verification

The `/users` workspace is verified against the following constraints:

### 1. Modernization & Alignment
- **MUI Rebuild**: Replaced all Tailwind components with MUI layout structures (`<Grid>`, `<Box>`, `<Stack>`), tables, and dialog forms.
- **Action Drawers**: Replaced drawer screens with responsive MUI `<Drawer>` sheets for creating, editing, and resetting passwords.
- **RTL / LTR Scaling**: Layout direction maps perfectly across Arabic (RTL) and English (LTR).

### 2. Verification Metrics
- **Arabic RTL**: Localized UI strings using next-intl properties.
- **Theme support**: Seamless contrast compatibility in light, dark, and system modes.
- **Build Quality**: Verified clean compilation build without warnings.

---

## Settings Completion Verification

The `/settings` workspace is verified against the following constraints:

### 1. Modernization & Alignment
- **MUI Forms Layout**: Converted pharmacy information, timezone preferences, and profile credentials to modern MUI form structures.
- **Action Bindings**: Linked the simulation hooks and feedback cards to trigger native toast responses.
- **Theme and Radius Scale**: Integrates with custom button border-radius of 8px and standard inputs of 12px.

### 2. Verification Metrics
- **Arabic RTL**: Translates all settings options into Arabic RTL layout.
- **Theme support**: Checked correct styling in light and dark modes.

---

## Backup Completion Verification

The `/backup` workspace is verified against the following constraints:

### 1. Modernization & Alignment
- **MUI Operations Layout**: Modernized BackupCenter to render entirely via MUI containers, progress bars, and modal sheets.
- **Safety Dialogs**: Isolated database action confirmations inside MUI `<Dialog>` models.
- **Backend Contracts**: Kept data format, client downloads, and file parsing structures completely untouched.

### 2. Verification Metrics
- **Arabic / English Text**: Fully localized backup and recovery instructions.
- **Build Quality**: Build compiles with zero errors or warnings.


