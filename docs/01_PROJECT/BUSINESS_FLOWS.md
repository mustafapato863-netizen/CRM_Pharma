# Business Flows

## Purpose

This document describes the operational flows for the internal Pharmacy CRM MVP. It stays focused on business behavior only and avoids implementation details, schema design, or enterprise scope.

## Core Rule

Any piece of information should be entered by the user only once.

The system should reuse already captured data across screens, flows, exports, and backups. For example:

- A product is created once and reused in stock movements.
- A party is created once and reused for balances and due payments.
- A stock movement is recorded once and reused for reports and dashboard totals.
- A ledger entry is recorded once and reused for balances, due dates, and reports.
- A backup log is written once and reused for audit visibility.

## 1. Login Flow

### Goal

Allow a user to sign in with email and password and enter only the parts of the system they are allowed to access.

### Flow

1. User opens the login page.
2. User enters email and password.
3. Auth.js validates the credentials.
4. The system creates a session.
5. The system loads the user's permissions.
6. The user is redirected to the dashboard.

### Permission Checks

- Login page is public.
- Dashboard and all internal routes require a valid session.
- If the user has no permission for a module, the sidebar item and route are hidden or blocked.

### One-Entry Rule

- Email and password are entered once at login.
- The session should carry the permission set so the user does not re-enter access details on every page.

## 2. Product Creation Flow

### Goal

Capture product data once and reuse it across stock and reports.

### Flow

1. Authorized user opens Products.
2. User enters product name, unit, category or type, and optional stock threshold.
3. System validates the product.
4. System saves the product once.
5. Product becomes available for stock movements and reports.

### Permission Checks

- `products` permission is required.
- Save, edit, and deactivate actions require server-side permission checks.
- Products with batches or stock history cannot be physically deleted; they must be deactivated instead.

### One-Entry Rule

- Product details are typed once and reused everywhere else.
- Stock flows should select existing products instead of retyping product information.

## 3. Batch Creation Flow

### Goal

Capture batch-specific information once so expiry and stock tracking stay accurate.

### Flow

1. Authorized user selects an existing product.
2. User enters batch number, expiry date, purchase cost, and initial quantity if applicable.
3. System validates the batch.
4. System stores the batch once.
5. Batch becomes available for stock movements.

### Permission Checks

- `stock` permission is required.
- Batch creation and batch edits require server-side checks.
- Batches with stock movements cannot be physically deleted; corrections must create stock movements and the batch should be deactivated instead.

### One-Entry Rule

- Batch number and expiry date are entered once per batch.
- Later stock movements reuse the same batch record.

## 4. Stock IN Flow

### Goal

Increase stock by recording the incoming movement once.

### Flow

1. Authorized user opens Stock IN.
2. User selects product and batch.
3. User enters quantity and reason for stock in.
4. System validates the movement.
5. System stores one stock movement with a positive quantity.
6. System updates current stock balance from the movement.

### Permission Checks

- `stock` permission is required.
- Server-side checks must block unauthorized stock updates.

### One-Entry Rule

- Product, batch, quantity, and reason are entered once.
- Current stock is derived from the movement, not re-entered elsewhere.

## 5. Stock OUT Flow Using FEFO

### Goal

Reduce stock by automatically consuming the earliest expiring available batch first.

### Flow

1. Authorized user opens Stock OUT.
2. User selects product and quantity.
3. System looks up available batches ordered by nearest expiry date.
4. System allocates quantities from the first available batch, then the next if needed.
5. System stores the stock out movement and the batch allocation result.
6. System updates current stock balance from the movement.

### Permission Checks

- `stock` permission is required.
- FEFO allocation is enforced server-side.

### One-Entry Rule

- The user enters the product and quantity once.
- The system reuses stored batch data to choose the correct stock source.

## 6. Manual Batch Selection Flow

### Goal

Allow manual selection of a batch when FEFO is not the right choice.

### Flow

1. Authorized user opens Stock OUT.
2. User selects product and chooses a specific batch.
3. User enters quantity and reason.
4. System validates that the batch has enough available stock.
5. System stores the movement against the selected batch.
6. System updates stock balance.

### Permission Checks

- `stock` permission is required.
- The system should block manual batch selection when the batch is expired or unavailable.

### One-Entry Rule

- Product and quantity are entered once.
- Batch selection is a choice against existing data, not a second capture of the same information.

## 7. Damaged Stock Flow

### Goal

Remove unusable stock without pretending it is a normal stock out.

### Flow

1. Authorized user opens Damaged Stock.
2. User selects product, batch, and quantity.
3. User enters the reason for damage.
4. System validates that enough stock exists.
5. System stores a damaged stock movement.
6. System updates current stock balance.

### Permission Checks

- `stock` permission is required.
- Damaged stock actions require server-side checks.

### One-Entry Rule

- Product, batch, quantity, and reason are entered once.
- The damaged movement feeds reports and balances without re-entry.

## 8. Adjustment Flow

### Goal

Correct stock when the physical count and system count differ.

### Flow

1. Authorized user opens Adjustment.
2. User selects product and batch.
3. User enters the adjustment quantity and reason.
4. System compares the adjustment against the current balance.
5. System stores one adjustment movement.
6. System updates the stock balance.

### Permission Checks

- `stock` permission is required.
- Adjustments should be limited to trusted users.

### One-Entry Rule

- The difference is entered once.
- The system recalculates stock instead of asking the user to restate the full balance.

## 9. Party Creation Flow

### Goal

Capture a person or company once and reuse it for balances and due payments.

### Flow

1. Authorized user opens Parties.
2. User enters name, contact details, and party type.
3. User selects whether the party is Customer, Supplier, or Both.
4. System saves the party once.
5. Party becomes available for balances and reports.

### Permission Checks

- `parties` permission is required.
- Party create and edit actions require server-side checks.
- Parties with transactions cannot be physically deleted; they must be deactivated instead.

### One-Entry Rule

- The name and contact details are entered once.
- The same party record is reused for customer balances and supplier balances when needed.

## 10. Customer Balance Flow

### Goal

Track what customers owe the business without a separate invoice system.

### Flow

1. Authorized user selects a party with Customer or Both type.
2. User creates a ledger entry that increases the customer balance.
3. The entry includes amount, due date if applicable, and status.
4. System updates the party's current balance.
5. Dashboard and reports reuse the same ledger entry.

### Permission Checks

- `ledger` permission is required.
- Balance updates require server-side checks.

### One-Entry Rule

- Customer balance is entered once as a ledger entry.
- The same entry powers balances, due lists, and reports.

## 11. Supplier Balance Flow

### Goal

Track what the business owes suppliers without a separate accounting module.

### Flow

1. Authorized user selects a party with Supplier or Both type.
2. User creates a ledger entry that increases the supplier balance owed.
3. The entry may include a due date and payment status.
4. System updates the party's current balance.
5. Dashboard and reports reuse the same ledger entry.

### Permission Checks

- `ledger` permission is required.
- Balance updates require server-side checks.

### One-Entry Rule

- Supplier balance is entered once as a ledger entry.
- The same data is reused for due payments and balance reports.

## 12. Due Payments Flow

### Goal

Show overdue and upcoming balances without a separate payments module.

### Flow

1. System scans ledger entries with due dates and open status.
2. Dashboard shows due today and overdue items.
3. Reports list due customer balances and due supplier balances.
4. Authorized users review the list and update the existing ledger entry status when a balance is resolved.

### Permission Checks

- `ledger` permission is required to change status.
- `reports` permission is required to view reports.

### One-Entry Rule

- Due dates are stored once in the ledger entry.
- The same ledger record drives dashboard cards and reports.

## 13. Expiry Alerts Flow

### Goal

Surface stock that is near expiry or already expired before it becomes a problem.

### Flow

1. System checks batch expiry dates.
2. Near-expiry and expired batches are listed in Expiry Alerts.
3. Dashboard shows expiring soon counts.
4. Reports can include expiry details for review.
5. Users act on the same batch record through stock movements if stock needs to be removed.

### Permission Checks

- `expiryAlerts` permission is required to view the page.
- `stock` permission is required to take action on stock.

### One-Entry Rule

- Expiry date is stored once on the batch.
- Alert views reuse that batch data instead of asking the user to re-enter expiry information.

## 14. Excel Export Flow

### Goal

Let users export report data without retyping or rebuilding it in spreadsheets.

### Flow

1. Authorized user opens a report.
2. User filters the report.
3. User clicks Excel export.
4. System generates the spreadsheet from existing stored records.
5. User downloads the file.

### Permission Checks

- `reports` permission is required.
- Export should honor the same access rules as the underlying report.

### One-Entry Rule

- Data already stored in the system is exported directly.
- No duplicate manual spreadsheet entry is required.

## 15. Full JSON ZIP Backup Flow

### Goal

Create a portable full backup of the system data and log the backup event.

### Flow

1. Authorized user opens Backup.
2. User requests a full backup.
3. System gathers JSON copies of the current entities.
4. System packages the data as a ZIP file.
5. System writes a backup log entry.
6. User downloads the ZIP file.

### Permission Checks

- Backup access should be limited to trusted users.
- The system must block backup creation for unauthorized users.

### One-Entry Rule

- Backup is generated from already stored records.
- Backup logs are created once and reused for audit visibility.

## 16. Permission Checks for Every Flow

### Permission Model

The MVP uses permission-based access, not role-based access. Each user may have one or more permissions such as:

- `dashboard`
- `products`
- `stock`
- `parties`
- `ledger`
- `reports`
- `expiryAlerts`
- `users`
- `settings`
- `backupExport`

### Enforcement Rules

- Sidebar visibility must follow permissions.
- Route access must be checked on the server.
- Server Actions must reject unauthorized requests.
- UI hiding is only a convenience; server checks are the real protection.

### Flow-to-Permission Map

| Flow | Required Permission |
| --- | --- |
| Login | None |
| Product creation | `products` |
| Batch creation | `stock` |
| Stock IN | `stock` |
| Stock OUT using FEFO | `stock` |
| Manual batch selection | `stock` |
| Damaged stock | `stock` |
| Adjustment | `stock` |
| Party creation | `parties` |
| Customer balance | `ledger` |
| Supplier balance | `ledger` |
| Due payments | `ledger`, `reports` for viewing |
| Expiry alerts | `expiryAlerts` |
| Excel export | `reports` |
| Full JSON ZIP backup | trusted backup access only |

## 17. Soft Delete and Archive Rules

### Principle

Historical records must remain intact.

If an entity already appears in stock history, ledger history, or audit history, the app should not physically delete it.

### Rules

- Products with batches or stock movements must be deactivated, not deleted.
- Batches with stock movements must be deactivated, not deleted.
- Parties with ledger or stock transactions must be deactivated, not deleted.
- Inactive records stay visible in history and reports.
- User management should follow the same archive-first rule whenever user administration is implemented.

### UI Behavior

- If deletion is blocked, show a clear dialog explaining why.
- Offer the correct alternative action such as Deactivate, Return, Adjustment, or Archive.
- Never allow a destructive action to remove history from the system.

## Summary

This MVP keeps every piece of information entered once and reused everywhere else. That means one product record, one batch record, one party record, one stock movement record, and one ledger entry record are enough to power the dashboard, alerts, reports, and backups without introducing invoices, payments, accounting journals, warehouses, or enterprise overhead.
