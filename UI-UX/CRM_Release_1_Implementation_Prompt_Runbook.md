# CRM Release 1 — Implementation Prompt Runbook
## Sequential Prompts for Browser QA, Visual Identity, Release Polish & Future Stock Consolidation

**Project:** Pharmacy CRM  
**Purpose:** This file contains the exact prompts to send to the coding assistant, in the correct sequence.  
**Companion files to attach whenever relevant:**
- `CRM_Release_1_Visual_Identity_Plan.md`
- `CRM_Release_1_Page_Design_Blueprint.md`
- `Visual Design Reference`

---

# 0. Operating Rules for Every Prompt

Use these rules for every milestone.

```text
- MUI is the only active UI system.
- next-intl is the only translation source.
- Arabic is RTL.
- English is LTR.
- Light, Dark, and System modes must remain supported.
- Do not reintroduce Tailwind.
- Do not introduce another UI library or another icon library.
- Use MUI icons only.
- Do not change Prisma schema, database data, routes, auth, permissions, server actions, validation, or operational business logic unless a prompt explicitly says so.
- Do not create mock data, test users, or destructive transactions for visual testing.
- Do not claim browser verification without actual browser evidence.
- Run lint, type-check, and production build at the end of every milestone.
```

---

# 1. Execution Sequence

Do not send all prompts at once.

```text
Prompt 0 — Create visual baseline and delivery plan
Prompt 1 — Final browser visual QA and P0/P1 repair
Prompt 2 — Central Sapphire Clinical Glass theme and shared primitives
Prompt 3 — Login + Dashboard signature implementation
Prompt 4 — Master Data polish: Products, Batches, Parties
Prompt 5 — Operations polish: Stock, Purchases, Sales, Payments, Returns
Prompt 6 — Audit and analysis polish: Movements, Ledger, Reports, Expiry Alerts
Prompt 7 — Administration polish: Users, Settings, Backup, Maintenance
Prompt 8 — Release-wide browser evidence and release acceptance
Prompt 9 — Future functional milestone: Stock Operations Consolidation
```

Prompt 9 is intentionally **not part of the visual release work**. Run it only after Release 1 visual acceptance is complete.

---

# Prompt 0 — Visual Baseline and Delivery Plan

```text
# Release 1 Visual Identity — Preflight and Baseline Plan

You are preparing the Pharmacy CRM for Release 1 visual polish.

Read and treat these attachments as mandatory references:

1. CRM_Release_1_Visual_Identity_Plan.md
2. CRM_Release_1_Page_Design_Blueprint.md
3. Visual Design Reference

Do not write broad UI changes yet.

## Goal

Create an accurate implementation plan and a visual baseline before any visual identity work begins.

## Strict Scope

Inspect only:

- MUI theme and theme provider
- Color mode provider
- RTL/LTR direction setup
- Shared application shell
- Sidebar
- Navbar
- Page header
- AppDataGrid
- AppDrawer
- Dialogs / confirmation dialogs
- Buttons
- Inputs
- Autocomplete/select controls
- Tabs
- Chips
- Alerts
- Snackbars
- Shared loading, empty, error, unauthorized, and not-found states
- Existing style overrides and hardcoded colors

Do not:

- Change Prisma schema
- Change database data
- Change business logic
- Change routes
- Change auth or permissions
- Reintroduce Tailwind
- Add a component library
- Add visual polish yet
- Replace working workflow structure

## Required Inspection Findings

Identify:

1. Theme files and providers
2. Existing palette and typography configuration
3. Existing light/dark/system behavior
4. Existing Arabic RTL / English LTR setup
5. Raw hex colors outside theme files
6. One-off shadows, border radii, and spacing patterns
7. Shared components that need theme-level treatment
8. Components that do not react correctly to dark mode
9. Components that may have RTL/LTR direction issues
10. Routes with unique layout patterns that will require page-specific visual work
11. Any current hard blocker that makes visual release polish unsafe

## Required Output

Create:

docs/03_DESIGN/UI_UX/16-release-1-visual-preflight.md

Include:

- Theme architecture
- Shared component inventory
- Existing token inventory
- Raw color / style override findings
- Risk assessment
- Recommended shared primitives
- Proposed implementation order
- Routes grouped by polish wave
- No claims that UI is already visually approved

Return only:

Preflight document:
Theme architecture:
Shared components reviewed:
Raw visual overrides found:
Light/Dark risks:
RTL/LTR risks:
Responsive risks:
Recommended primitives:
Route polish waves:
Business-logic risks:
Blockers:
Recommended next prompt:
```

---

# Prompt 1 — Final Browser Visual QA and P0/P1 Repair

```text
# Milestone — Final Browser Visual QA and P0/P1 Repair

Read and follow the attached references:

1. CRM_Release_1_Visual_Identity_Plan.md
2. CRM_Release_1_Page_Design_Blueprint.md
3. Visual Design Reference

This milestone is browser QA and defect repair only.

Do not add the Sapphire Clinical Glass visual identity yet.
Do not redesign pages.
Do not add decorative effects.
Do not perform broad styling changes unless required to repair a proven defect.

## Routes to Review

- /
- /login
- /dashboard
- /products
- /products/new
- /products/[id]/edit
- /batches
- /batches/new
- /batches/[id]/edit
- /parties
- /parties/new
- /parties/[id]
- /parties/[id]/edit
- /stock
- /stock/in
- /stock/out
- /purchases
- /sales
- /payments
- /returns
- /inventory/movements
- /ledger
- /reports
- /expiry-alerts
- /users
- /settings
- /backup
- /maintenance

## Mandatory Browser Checks

Use real browser inspection or available browser automation.

Verify every route at:

- 1440px
- 1280px
- 1024px
- 768px
- 390px

Verify all major routes in:

- Arabic Light
- Arabic Dark
- English Light
- English Dark
- System mode behavior

Do not report evidence that was not actually captured.

## Acceptance Checks

Check and repair P0/P1 defects only:

- Route 500 or runtime error
- next-intl locale error
- Hydration error
- Arabic ???? / mojibake / missing glyphs
- Translation key appearing in UI
- Wrong RTL/LTR direction
- Wrong drawer anchor
- Wrong pagination direction
- Page-wide horizontal overflow
- Unreadable mobile form
- Dialog/drawer clipped outside viewport
- Unreadable dark-mode text or surface
- White-only card in dark mode
- Broken filter or primary action layout
- DataGrid/table that prevents operational use
- Broken responsive sidebar
- Broken essential interaction caused by UI layout

Do not:

- Change business logic
- Create test transactions
- Run restore
- Reintroduce Tailwind
- Start visual identity styling
- Start Stock consolidation

## Documentation

Create:

docs/03_DESIGN/UI_UX/17-release-1-browser-qa.md

For every route, record:

Route:
Desktop checked:
Tablet checked:
Mobile checked:
Arabic Light:
Arabic Dark:
English Light:
English Dark:
System mode:
RTL:
LTR:
Console clean:
P0/P1 defects:
Fixes:
Deferred P2/P3:
Screenshot paths:
Status:

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Browser QA document:
Routes reviewed:
Routes repaired:
P0 issues fixed:
P1 issues fixed:
Deferred P2/P3:
Arabic issues fixed:
RTL/LTR issues fixed:
Dark mode issues fixed:
Responsive issues fixed:
Files changed:
Screenshot evidence path:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Tailwind reintroduction check:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 2 — Central Theme and Shared Primitives

```text
# Milestone — Sapphire Clinical Glass Central Theme and Shared Primitives

Read and follow the attached references:

1. CRM_Release_1_Visual_Identity_Plan.md
2. CRM_Release_1_Page_Design_Blueprint.md
3. Visual Design Reference
4. docs/03_DESIGN/UI_UX/16-release-1-visual-preflight.md
5. docs/03_DESIGN/UI_UX/17-release-1-browser-qa.md

This milestone changes the centralized Material UI visual foundation only.

Do not broadly restyle individual routes in this milestone except the shared shell components needed to prove the tokens work.

## Main Goal

Implement the Sapphire Clinical Glass visual identity in the centralized MUI theme and shared primitives.

## Required Brand Palette

Primary:
- #3957FF
- hover #2747E8
- light #5B6DFF
- soft #E9EDFF

Secondary:
- #11B7A3
- hover #099583
- soft #DDF9F4

Light:
- background.default #F5F7FC
- background.paper #FFFFFF
- surface.subtle #F8FAFC
- text.primary #111827
- text.secondary #667085
- divider #E5EAF2
- action.hover #F0F4FF
- action.selected #E9EDFF

Dark:
- background.default #0A1020
- background.paper #111A2D
- surface.elevated #17223A
- surface.subtle #10192B
- text.primary #F6F8FC
- text.secondary #A7B0C0
- divider #26344F
- action.hover rgba(91, 109, 255, 0.10)
- action.selected rgba(91, 109, 255, 0.18)

Semantic:
- success / warning / error / info / neutral as defined in the attached Visual Identity Plan

## Required Shared Primitives

Create or improve reusable theme-aware primitives:

- AmbientCanvas
- GlassSurface
- MetricGlassCard
- SoftIconTile
- SectionPaper
- DangerZoneSurface

Rules:

- Use MUI theme values and types.
- Do not scatter raw hex values through routes.
- Glass must be reusable and theme-aware.
- Glass is only for overview-level premium surfaces.
- Data tables, invoices, ledger, reports, dense forms, backup restore, and destructive dialogs remain solid Paper.
- Do not add gradients to buttons, tables, or status chips.
- Main primary button remains solid Sapphire Blue.

## Shared Components to Upgrade

- Application shell
- Sidebar
- Navbar
- Page header
- AppDataGrid
- AppDrawer
- Dialogs and confirmation dialogs
- Button defaults
- Input / select / autocomplete defaults
- Tabs
- Status chip
- Alerts
- Snackbars
- Empty/loading/error/unauthorized/not-found states

## Required Typography / Geometry

- 8px spacing rhythm
- Inputs/tables small geometry: 12px radius
- Normal cards/papers: 16px radius
- Glass overview cards only: 20px radius
- Soft wide shadows, no harsh black
- Compact title hierarchy
- No giant headers
- No decorative card walls

## Strict No-Go

Do not:

- Rewrite route workflows
- Change data queries
- Change business logic
- Change permissions/auth
- Reintroduce Tailwind
- Add another UI/icon library
- Use page-level hardcoded palette systems
- Apply Glass globally
- Change purchase/sale/stock/ledger/backup behavior

## Documentation

Create:

docs/03_DESIGN/UI_UX/18-release-1-theme-foundation.md

Include:

- Theme files changed
- Tokens added
- Component defaults changed
- New primitives
- Light/Dark behavior
- RTL/LTR safety
- Components intentionally left solid
- Any low-risk route shell changes
- Known limitations

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Theme foundation document:
Theme files changed:
Tokens added:
Shared primitives created:
Shared components upgraded:
Light mode result:
Dark mode result:
RTL/LTR result:
Routes touched:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Tailwind reintroduction check:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 3 — Signature Screens: Login, Dashboard, Shell

```text
# Milestone — Sapphire Clinical Glass Signature Screens

Read the attached references and the completed theme foundation document.

Scope only:

- /login
- /dashboard
- shared App Shell
- Sidebar
- Navbar
- shared Page Header
- shared AppDataGrid
- shared AppDrawer
- shared Dialog / Confirmation Dialog

Do not visually restyle all routes yet.

## Main Goal

Make Login and Dashboard the visual signature of Release 1 while preserving a clean operational UI system for every later route.

## Login Direction

Use:

Ambient Sapphire + Teal canvas
→ focused Glass login panel
→ calm pharmacy identity
→ readable solid inputs
→ solid Sapphire sign-in action

Rules:

- No marketing sections
- No fake testimonial
- No giant illustration
- No gradient primary button
- Mobile panel must be practical and unclipped
- Light and dark versions must both feel intentional

## Dashboard Direction

Use:

Compact header
→ 3–4 compact Glass KPI cards
→ real attention / alert section in solid Paper
→ real quick actions
→ recent activity in solid table/list
→ data-backed analytics only if already supported

Rules:

- No giant welcome hero
- No fake trends
- No decorative metric wall
- No Glass DataGrid/table
- Use semantic status chips carefully
- Zero-data states must still look intentional

## Shell Direction

Sidebar:
- solid command rail
- compact selected Sapphire state
- no Glass sidebar
- no giant logo block

Navbar:
- only working controls
- locale selector
- appearance selector
- user menu
- no fake notifications

## Browser Proof

Capture:

- Login: Arabic Light desktop, Arabic Dark mobile, English Light desktop
- Dashboard: Arabic Light desktop, Arabic Dark desktop, English Light desktop, Arabic Light mobile
- Shell: desktop, tablet, mobile in Arabic and English

## Documentation

Create:

docs/03_DESIGN/UI_UX/19-release-1-signature-screens.md

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Signature screen document:
Login improvements:
Dashboard improvements:
Shell improvements:
Shared components improved:
Arabic RTL verification:
English LTR verification:
Light verification:
Dark verification:
System verification:
Desktop verification:
Tablet verification:
Mobile verification:
Screenshot evidence path:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 4 — Master Data Polish

```text
# Milestone — Release 1 Master Data Visual Polish

Read and follow:

- CRM_Release_1_Visual_Identity_Plan.md
- CRM_Release_1_Page_Design_Blueprint.md
- Visual Design Reference
- Completed theme and signature-screen documents

Scope only:

- /products
- /products/new
- /products/[id]/edit
- /batches
- /batches/new
- /batches/[id]/edit
- /parties
- /parties/new
- /parties/[id]
- /parties/[id]/edit

## Main Goal

Apply the approved Release 1 visual identity to master-data routes using the catalog/master-data page template.

Target layout:

Compact header + one primary action
→ compact search/filter toolbar
→ optional factual metrics
→ DataGrid/table as main surface
→ details drawer
→ create/edit workflow
→ pagination

## Products

- Product list stays dense and readable.
- Name is primary; code/barcode secondary.
- No rainbow categories.
- DataGrid remains solid Paper.
- Create/edit form uses clear grouped sections.
- Mobile list/form must remain practical.

## Batches

- Expiry date, days remaining, quantity, batch number, and product remain scan-first.
- Expired / urgent statuses use semantic chips.
- Do not turn expiry states into decorative color walls.
- Drawer links only to real related workflows.

## Parties

- Balance and account context remain clear but not dashboard-like.
- Profile is not a wall of cards.
- Tabs only where existing information is meaningful.
- Do not change financial semantics or party actions.

## Strict No-Go

Do not change:

- Queries
- Forms validation
- Server actions
- Stock/business rules
- Financial calculations
- Party data semantics
- Route paths
- Permissions
- Auth

Do not:

- Reintroduce Tailwind
- Use Glass on DataGrid rows or dense forms
- Convert useful tables into decorative cards
- Add fake data or fake analytics

## Browser Proof

For Products, Batches, Parties capture:

- Arabic Light desktop
- Arabic Dark desktop
- English Light desktop
- Arabic Light mobile
- Tablet check at 768px

## Documentation

Create:

docs/03_DESIGN/UI_UX/20-release-1-master-data-polish.md

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Master data document:
Products polished:
Batches polished:
Parties polished:
Shared components reused:
Arabic RTL verification:
English LTR verification:
Light/Dark verification:
Desktop/Tablet/Mobile verification:
Screenshot evidence path:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 5 — Operations Polish

```text
# Milestone — Release 1 Operations Visual Polish

Read and follow the attached Visual Identity Plan and Page Design Blueprint.

Scope only:

- /stock
- /stock/in
- /stock/out
- /purchases
- /sales
- /payments
- /returns

Do not start Stock Operations Consolidation.
Do not merge Stock, Stock In, or Stock Out.
Do not change any posting, stock, invoice, payment, or return behavior.

## Main Goal

Apply the operational-entry page template:

Context / party / source
→ entry fields or invoice lines
→ review / validation summary
→ one confirmation action
→ optional compact recent activity

All operational workspaces must remain solid, dense, fast, and readable.

## Stock

Verify separately:

- /stock
- /stock/in
- /stock/out

Visual requirements:

- Product selection prominent
- Batch selection clear
- Available stock obvious in Stock Out
- Quantity and reference/reason logically grouped
- Validation readable
- Recent activity secondary
- No full audit history here
- No Glass line items

## Purchases

Visual requirements:

Supplier
→ invoice metadata
→ line items
→ batch context when needed
→ totals/review
→ confirm purchase

- Main line item area dominates.
- Side review remains narrow and factual.
- Do not use tiny dialogs for complex batch workflows.
- Mobile must use a usable sectioned composition.

## Sales

Visual requirements:

Customer
→ product / barcode search
→ batch/availability context
→ line items
→ totals/payment context
→ confirm sale

- Product entry must remain fast.
- Do not hide stock availability.
- Do not make totals more visually important than item lines.

## Payments

- Direction / party / amount visually clear.
- Form and history use solid Paper.
- Amount gets proper hierarchy without looking like a dashboard KPI.
- Mobile confirmation stays reachable.

## Returns

Original source
→ source context
→ returnable lines / quantity
→ reason
→ review
→ confirm

- Original transaction context stays visible.
- Returnable quantity unmistakable.
- No generic free-form returns appearance.

## Strict No-Go

Do not change:

- Posting behavior
- Stock updates
- Ledger updates
- Atomic actions
- Invoice validation
- Return validation
- Payment semantics
- Permissions
- Auth
- Routes

No Glass tables.
No gradients in forms.
No fake transaction data.
No reintroduced Tailwind.

## Browser Proof

For each in-scope route:

- Arabic Light desktop
- Arabic Dark desktop
- English Light desktop
- Arabic Light mobile
- Tablet check

Do not submit real transactions for visual verification.

## Documentation

Create:

docs/03_DESIGN/UI_UX/21-release-1-operations-polish.md

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Operations polish document:
Stock improvements:
Purchases improvements:
Sales improvements:
Payments improvements:
Returns improvements:
Arabic RTL verification:
English LTR verification:
Light/Dark verification:
Desktop/Tablet/Mobile verification:
Screenshot evidence path:
Business logic preserved:
Posting logic preserved:
Permissions preserved:
Authentication preserved:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 6 — Audit & Analysis Polish

```text
# Milestone — Release 1 Audit and Analysis Visual Polish

Read and follow the attached references.

Scope only:

- /inventory/movements
- /ledger
- /reports
- /expiry-alerts

## Main Goal

Apply the audit/review page template:

Compact header
→ compact filters
→ trusted summary values
→ result table / DataGrid as main focus
→ read-only detail drawer
→ pagination
→ export secondary

Keep these screens operational, calm, and highly scannable.

## Inventory Movements

- Audit-only workspace.
- No movement creation action.
- No edit/delete posted movement action.
- Solid DataGrid primary.
- Read-only details drawer.
- Filters compact and easy to scan.

## Ledger

- Trusted summary values only.
- Do not introduce running balance.
- Debit/credit presentation consistent.
- Financial values align correctly.
- No color noise.
- Export label must be truthful.

## Reports

- Category/tab selection clear.
- Filters not overwhelming.
- Results primary.
- Charts only when current data supports them.
- Export/print secondary.
- No fake charts.

## Expiry Alerts

- Risk status is the focus.
- Expired / 7 days / 30 days counters can be subtle premium summary surfaces.
- Alert table remains solid.
- No fake resolve action.
- Links go only to real Product, Batch, Purchase, or Movement workflows.

## Strict No-Go

Do not change:

- Query behavior
- Pagination semantics
- Export semantics
- Ledger calculation
- Reporting calculation
- Batch expiry logic
- Permissions
- Auth
- Routes

No Glass data rows.
No gradient tables.
No fake trend numbers.
No reintroduced Tailwind.

## Browser Proof

For every in-scope route:

- Arabic Light desktop
- Arabic Dark desktop
- English Light desktop
- Arabic Light mobile
- Tablet check

## Documentation

Create:

docs/03_DESIGN/UI_UX/22-release-1-audit-analysis-polish.md

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Audit and analysis document:
Inventory Movements improvements:
Ledger improvements:
Reports improvements:
Expiry Alerts improvements:
Arabic RTL verification:
English LTR verification:
Light/Dark verification:
Desktop/Tablet/Mobile verification:
Screenshot evidence path:
Business logic preserved:
Export behavior preserved:
Permissions preserved:
Authentication preserved:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 7 — Administration Polish

```text
# Milestone — Release 1 Administration Visual Polish

Read and follow the attached references.

Scope only:

- /users
- /settings
- /backup
- /maintenance

## Main Goal

Apply calm, security-aware, controlled premium polish to administration pages.

Use:

Compact header
→ focused content
→ clear forms/tables
→ explicit save/confirmation behavior
→ danger zones visually separated only when real

## Users

- Conservative security-first tone.
- No sensitive data exposed.
- Permission summaries readable, not raw JSON.
- Account action confirmation clear.
- User list/table practical on mobile.
- Do not create or modify user capability behavior.

## Settings

- Sections grouped by real business meaning.
- Optional small Glass introduction only if it improves hierarchy.
- Forms remain solid.
- Save/reset behavior clear.
- Do not turn settings into a Dashboard.

## Backup

- Normal backup area: solid Paper.
- Restore area: isolated danger zone.
- Restore never becomes the visual primary action.
- Warning dialog must be direct and localized.
- Do not trigger restore.
- Do not create fake backup history.

## Maintenance

- Minimal localized status surface.
- No second visual system.
- Full dark-mode safety.
- No excessive decoration.

## Strict No-Go

Do not change:

- Authentication
- Roles or permissions
- User actions
- Backup/restore behavior
- Settings behavior
- Server actions
- Routes
- Database data
- Tailwind status

## Browser Proof

For each route capture:

- Arabic Light desktop
- Arabic Dark desktop
- English Light desktop
- Arabic Light mobile
- Tablet check where applicable

## Documentation

Create:

docs/03_DESIGN/UI_UX/23-release-1-administration-polish.md

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Administration polish document:
Users improvements:
Settings improvements:
Backup improvements:
Maintenance improvements:
Arabic RTL verification:
English LTR verification:
Light/Dark verification:
Desktop/Tablet/Mobile verification:
Screenshot evidence path:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Backup/restore behavior preserved:
Lint:
TypeScript:
Build:
Recommended next prompt:
```

---

# Prompt 8 — Release Acceptance and Screenshot Proof

```text
# Milestone — Release 1 Final Acceptance, Screenshot Evidence and Visual Freeze

Read and use all completed Release 1 design documents.

Do not introduce new visual features in this milestone.
Do not redesign routes.
Do not change business logic.

## Main Goal

Perform final browser acceptance for the full Pharmacy CRM and prepare a visual freeze report for Release 1.

## Routes to Verify

- /login
- /dashboard
- /products
- /products/new
- /products/[id]/edit
- /batches
- /batches/new
- /batches/[id]/edit
- /parties
- /parties/new
- /parties/[id]
- /parties/[id]/edit
- /stock
- /stock/in
- /stock/out
- /purchases
- /sales
- /payments
- /returns
- /inventory/movements
- /ledger
- /reports
- /expiry-alerts
- /users
- /settings
- /backup
- /maintenance

## Required Browser Matrix

At minimum:

- Arabic Light Desktop
- Arabic Dark Desktop
- English Light Desktop
- Arabic Light Mobile

Additionally verify:

- Tablet at 768px
- Small laptop at 1024px
- System mode
- Browser console clean
- No hydration errors
- No locale errors
- No route 500 errors
- No global horizontal overflow

## Required Screenshot Set

Capture and organize screenshots for:

- Login
- Dashboard
- Products
- Batches
- Parties
- Stock
- Purchases
- Sales
- Payments
- Returns
- Inventory Movements
- Ledger
- Reports
- Expiry Alerts
- Users
- Settings
- Backup

## Acceptance Rules

No unresolved P0/P1 issue may remain.

P2 items may remain only if:

- They do not hurt usability.
- They are documented clearly.
- They have a defined post-release priority.

P3 polish items are documented, not endlessly churned.

## Documentation

Create:

docs/03_DESIGN/UI_UX/24-release-1-final-acceptance.md

Include:

- Full route acceptance matrix
- Screenshot paths
- Arabic RTL status
- English LTR status
- Light/Dark/System status
- Desktop/Tablet/Mobile status
- Shared component acceptance
- P0/P1 closure
- Deferred P2/P3
- Release readiness decision
- Git commit/tag recommendation

## Validation

Run:

npm run lint
npx tsc --noEmit
npm run build

Return only:

Final acceptance document:
Routes approved:
Routes approved with deferred P3:
Routes blocked:
P0 closure:
P1 closure:
P2 deferred:
P3 deferred:
Arabic RTL:
English LTR:
Light mode:
Dark mode:
System mode:
Desktop:
Tablet:
Mobile:
Screenshot evidence path:
Console/runtime result:
Business logic preserved:
Permissions preserved:
Authentication preserved:
Tailwind reintroduction check:
Lint:
TypeScript:
Build:
Release readiness:
Recommended git commit:
Recommended git tag:
Recommended next milestone:
```

---

# Prompt 9 — Future Functional Milestone: Stock Operations Consolidation

> Run this only after Prompt 8 marks Release 1 visually ready.

```text
# Milestone — Stock Operations Consolidation

Read and follow:

- CRM_Release_1_Page_Design_Blueprint.md
- CRM_Release_1_Visual_Identity_Plan.md
- Current Release 1 final acceptance document

## Main Goal

Consolidate the operational entry experience currently split across:

- /stock
- /stock/in
- /stock/out

into one unified operational workspace called:

Stock Movement

Modes:

- Inbound
- Outbound
- Adjustment

Keep:

- /inventory/movements

as a separate audit/history workspace only.

## User Experience Principle

The user should think:

“What kind of movement am I recording?”

Not:

“Which old stock route should I use?”

## Strict Business Rules

Do not change:

- Prisma schema unless an unavoidable requirement is documented and explicitly approved before coding
- Existing stock calculation logic
- Existing validation rules
- Purchase posting logic
- Sales posting logic
- Return logic
- Ledger logic
- Permissions
- Authentication
- Existing transaction semantics

Do not make invoice workflows duplicate stock entry:

- Purchase invoice continues to generate stock movement automatically.
- Sales invoice continues to generate stock movement automatically.
- Return continues to generate stock movement automatically.
- Stock Movement workspace is for non-invoice movement and adjustment workflows only.

## Required Information Architecture

Sidebar target:

Operations
- Purchases
- Sales
- Stock Movement
- Payments
- Returns

Audit & Analysis
- Inventory Movements
- Ledger
- Reports
- Expiry Alerts

## Unified Workspace

Header:

Stock Movement

[ Inbound ] [ Outbound ] [ Adjustment ]

### Inbound

Product / barcode
→ select or create batch only through supported behavior
→ expiry if needed
→ quantity
→ date
→ reference / reason
→ confirm

### Outbound

Product / barcode
→ select available batch
→ show available quantity
→ quantity
→ reason / reference
→ confirm

### Adjustment

Product / batch
→ current quantity context
→ adjustment quantity/direction according to existing supported model
→ mandatory reason
→ confirm

Suggested adjustment reasons only if current business model supports them:

- Damage
- Expiry
- Stock count correction
- Internal use
- Free sample
- Other

## Visual Rules

- Follow Release 1 Sapphire Clinical Glass system.
- This is an operational solid-paper workspace.
- No Glass item lines.
- No fake charts.
- No full audit table inside this workspace.
- Small recent activity panel may exist only as secondary context.
- Product search and keyboard operation must be fast.
- Mobile uses full-screen, sectioned interaction.

## Migration Safety

Before deleting or redirecting legacy routes:

1. Map all existing links, navigation items, actions, and bookmarks.
2. Preserve route compatibility or add safe redirects.
3. Preserve permissions.
4. Preserve backend actions.
5. Verify Inbound, Outbound, and Adjustment each map to real current logic.
6. Do not invent adjustment mechanics that current data model cannot support.

## Required Acceptance

- One unified Stock Movement entry workspace.
- Inbound, Outbound, Adjustment modes clear.
- No duplicate entry for Purchase/Sale/Return workflows.
- Inventory Movements remains audit-only.
- Arabic RTL / English LTR / Light/Dark / System.
- Desktop/Tablet/Mobile.
- Existing stock logic unchanged.
- Existing permissions unchanged.
- Browser screenshots and safe interaction checks completed.
- npm run lint, npx tsc --noEmit, npm run build pass.

## Documentation

Create:

docs/03_DESIGN/UI_UX/25-stock-operations-consolidation.md

Return only:

Consolidation document:
Routes migrated:
Navigation changes:
Compatibility / redirect strategy:
Inbound behavior:
Outbound behavior:
Adjustment behavior:
Purchase/Sales/Returns duplication prevention:
Inventory Movements boundary:
Business logic preserved:
Permissions preserved:
Arabic RTL:
English LTR:
Light/Dark/System:
Desktop/Tablet/Mobile:
Screenshot evidence path:
Lint:
TypeScript:
Build:
Known limitations:
```

---

# 2. Git Checkpoints

Use a checkpoint after every accepted milestone.

```bash
git status
git diff --check
git add .
git commit -m "feat(ui): <milestone-name>"
```

Suggested tags:

```bash
git tag release-1-visual-baseline
git tag release-1-theme-foundation
git tag release-1-signature-screens
git tag release-1-visual-polish-complete
git tag release-1-visual-accepted
```

Do not tag a milestone until:

- Browser proof exists where required
- Lint passes
- TypeScript passes
- Build passes
- Any deferred items are documented honestly

---

# 3. Release 1 Definition of Done

Release 1 visual delivery is complete only when:

- [ ] Theme foundation is centralized.
- [ ] Shared MUI components look coherent.
- [ ] Login and Dashboard establish the visual signature.
- [ ] Master Data, Operations, Audit, and Administration pages follow their page blueprints.
- [ ] Arabic RTL is native-feeling.
- [ ] English LTR is native-feeling.
- [ ] Light, Dark, and System look deliberate.
- [ ] Desktop, tablet, and mobile are usable.
- [ ] Glass is subtle and limited.
- [ ] Data-heavy workflows remain solid and readable.
- [ ] No Tailwind or second visual system is reintroduced.
- [ ] No business logic, permissions, auth, or posting behavior changes.
- [ ] Screenshot evidence exists.
- [ ] Final acceptance document exists.
- [ ] The only major next product milestone is Stock Operations Consolidation.
