# UI Page States & Shell Rules

Every page must use the same page foundation.

## Required Page States

Each page must support:

1. Loading State
- Use a clean skeleton.
- Never show empty white space while data is loading.

2. Unauthorized State
- If user has no permission, show a shared Unauthorized component.
- Do not render partial page content.

3. Not Found / Missing Feature State
- If page or feature is not implemented yet, show a shared ComingSoon / NotFound component.

4. Empty State
- If data exists but list is empty, show a friendly EmptyState with icon, title, description, and optional CTA.

5. Error State
- Show a shared ErrorState with retry action.

## Page Header

Every page must have a consistent PageHeader.

PageHeader includes:

- Icon representing the page
- Page title
- Short description
- Optional primary action
- Optional breadcrumbs

Icons should use lucide-react.

Examples:

Dashboard: LayoutDashboard
Products: Package
Batches: Boxes
Parties: Users
Stock IN: ArrowDownToLine
Stock OUT: ArrowUpFromLine
Ledger: WalletCards
Reports: BarChart3
Backup: DatabaseBackup
Settings: Settings

## Navbar / Header Visual Style

The top navbar should be slightly more visible than the current one.

Use:

- glass background
- subtle baby-blue gradient
- soft border
- backdrop blur
- light shadow

Recommended style:

bg-gradient-to-r from-sky-50/80 via-white/75 to-indigo-50/80
backdrop-blur-xl
border-b border-white/60
shadow-[0_8px_24px_rgba(15,23,42,0.04)]

The navbar must remain light, clean, and SaaS-like.

## Shared Components Required

Create or standardize:

- PageHeader
- PageShell
- PageSkeleton
- Unauthorized
- ComingSoon
- EmptyState
- ErrorState
- SectionCard
- HeaderIcon

## Premium Page Layout Pattern

Preferred order for data pages:

1. `PageHeader`
2. Optional stat cards row
3. `PageToolbar`
4. `SectionCard` or `GlassCard`
5. Table
6. Pagination

This pattern keeps CRUD pages visually consistent without redesigning them.
## Shared Page Components

- `PageShell`
- `PageHeader`
- `PageSkeleton`
- `Unauthorized`
- `ComingSoon`
- `EmptyState`
- `ErrorState`
- `SectionCard`
- `HeaderIcon`

## Page Icon Map

Use this canonical mapping with lucide-react:

- Dashboard: `LayoutDashboard`
- Products: `Package`
- Batches: `Boxes`
- Parties: `Users`
- Stock IN: `ArrowDownToLine`
- Stock OUT: `ArrowUpFromLine`
- Ledger: `WalletCards`
- Reports: `BarChart3`
- Backup: `DatabaseBackup`
- Settings: `Settings`
