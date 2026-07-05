# Changelog

## v1.0.9

Added

- Purchase Invoices workspace with supplier selection, inline line editing, and automatic stock receipt posting
- Sales Invoices workspace with customer selection, FEFO batch selection, and automatic stock removal posting
- Shared invoice actions for posting invoice stock and ledger effects from a single source of truth

Changed

- Parties remain the only customer and supplier reference source through `party_id`
- Invoices now update batches, stock movements, and ledger entries automatically
- Main docs now include invoice modules in the implemented financial foundation

Fixed

- Prisma schema relations for invoice models and generated client support

## v1.0.4

Added

- Shared page states foundation
- Page header icon mapping
- Page shell and section card components

Changed

- Navbar/header glass polish
- Page header, empty state, unauthorized, and error/coming soon shared UI

## v1.0.1

Added

- Dependency audit
- Production dependency cleanup
- shadcn/ui foundation config

Changed

- Tailwind/PostCSS setup
- Global utility foundation

## v1.0.2

Added

- Authentication UI with username and password login
- Toast feedback and remember-last-username behavior

Changed

- Credentials flow now uses username instead of email

## v1.0.3

Added

- Shared infrastructure layer under `src/shared/`
- App-wide providers for theme, query, and toast
- Shared date, export, search, hook, config, and constant utilities

## v1.0.0

Added

- Project Foundation
- Prisma
- Authentication
- Dashboard Shell
- Products
- Batches
- Parties

## v1.1.0

Inventory

- Stock IN
- Stock IN UI
- Stock OUT

## v1.1.1

Added

- Phase 7.2 Stock OUT workflow
- Stock OUT product search, FEFO batch selection, validation, summary, and recent movements table

Changed

- Inventory permissions now include Stock OUT view/create access
- Sidebar navigation now includes Stock OUT

## v1.1.2

## v1.1.3

Added

- Premium User Management Center
- User list, summary cards, filters, invite modal, detail drawer, and deactivate flow

Changed

- Users page now matches the shared premium shell and design system

## v1.1.4

Changed

- Inventory Movements refactored from a reporting page into an operational workspace
- Added inline Stock IN and Stock OUT quick-entry cards beside movement history

Added

- Phase 8 Ledger activity timeline
- Party filters, date range filters, movement filters, and instant search
- Balance summary cards and print/export support

Changed

- Ledger now behaves as a business activity timeline derived from movement history
- Dashboard links to ledger filters now resolve to the new timeline view

## v1.1.3

Added

- Phase 10 UX polish and micro interactions
- Shared confirm dialog system with motion and accessibility
- Premium empty and error state refinements
- Navbar, sidebar, and page header interaction polish

Changed

- Confirmation flows now use one reusable dialog across the app
- Page surfaces feel more consistent and premium across screens

## v1.1.4

Added

- Phase 8.5 Inventory Movement Sheet with Excel-like filtering, pagination, export, and print view
- Phase 9 Reports center with stock, inventory, low stock, expiry, movement, parties, and ledger summary views
- Shared reports export utilities and report loading state
- Phase 10 Settings Center with pharmacy information, application settings, user profile, and version information
- Backup and restore workflow with confirmation dialog, progress indicator, and toast feedback

Changed

- Inventory Movements route now appears in the sidebar under Inventory
- Reports page now reuses shared UI foundation and export patterns
- Settings and backup routes now reuse the shared premium UI foundation
- Backup page now exposes a branded export/import experience instead of a bare placeholder

## v1.2.0 (Planned)

Financial

- Ledger
- Customer Balances
- Supplier Balances

## v1.3.0 (Planned)

Reports

- Inventory Reports
- Expiry Reports
- Financial Reports

## v1.4.0 (Planned)

Backup

- JSON Backup
- ZIP Backup
- Excel Export

## v2.x (Ideas)

- Barcode Printing
- Barcode Scanner
- Multi Warehouse
- Notifications
- Mobile Application

These are ideas only.
Do not implement them until the business requires them.

## v1.0.5

Added

- Internal UI kit primitives under `src/components/ui/`
- Shared page toolbar and glass card wrappers
- Premium CRUD page layout pattern

Changed

- Navbar height and fallback polish
- PageHeader sizing and readable description width
- EmptyState and Unauthorized shared states
- Products, Parties, and Batches toolbars/tables now use shared primitives

## v1.0.6

Added

- Custom branded 404 page
- Reusable maintenance page
- Branded ComingSoon placeholders for unfinished feature routes

Changed

- Shared ComingSoon component upgraded for icon and actions
- Not-found and maintenance states aligned to the premium light SaaS system

## v1.0.7

Added

- PWA manifest and branded icons
- Shared install-app button
- Apple and mobile app metadata

Changed

- Root metadata and viewport for installable standalone experience
- Safe-area and app background polish for mobile

## v1.0.8

Added

- Parties financial summaries derived from ledger entries
- Party statement snapshot and balance previews
- Duplicate-review warning flow for Party create/edit

Changed

- Parties list, selector, details page, and ledger page now show current balance, balance type, and last transaction
- Main docs now describe Parties as the customer/supplier single source of truth for balances and statements
