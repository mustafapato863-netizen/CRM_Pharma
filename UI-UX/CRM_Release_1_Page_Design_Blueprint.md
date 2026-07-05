# CRM Release 1 — Page Design Blueprint
## Sapphire Clinical Glass — Page-by-Page Layout, Hierarchy & Responsive Reference

**Project:** Pharmacy CRM  
**Release:** Release 1  
**Purpose:** The practical design reference for every active page after the MUI migration and before release polish.  
**Companion references:**
- `CRM_Release_1_Visual_Identity_Plan.md` — colors, dark/light tokens, glass rules, spacing, radii, elevation
- `Visual Design Reference` — visual North Star only; do not pixel-copy it

---

# 0. How to Use This Blueprint

This document defines:

- What each page is for
- What must be visually primary
- What must be secondary
- Which surfaces can use Glass
- Which surfaces must remain solid operational Paper
- Which actions belong in the page header
- How each page should behave on desktop, tablet, and mobile
- What must not be added

It does **not** authorize changes to:

- Prisma schema
- Database data
- Authentication
- Permissions
- Route paths
- Server actions
- Validation schemas
- Stock, invoice, payment, return, ledger, report, backup, or restore logic

The guiding principle:

> The system should look premium, but every operational workflow must remain faster and clearer than the design.

---

# 1. Shared App Architecture

## 1.1 Shell

```text
App Shell
├── Sidebar / command rail
├── Compact AppBar
└── Content canvas
    ├── Breadcrumbs when useful
    ├── Compact page header
    ├── Filter / command toolbar when needed
    ├── Main workspace
    ├── Secondary details / summary
    └── Pagination / totals footer when applicable
```

## 1.2 Sidebar Navigation

### Current navigation grouping

```text
Dashboard

Master Data
- Products
- Batches
- Parties

Operations
- Purchases
- Sales
- Stock
- Stock In
- Stock Out
- Payments
- Returns

Audit & Analysis
- Inventory Movements
- Ledger
- Reports
- Expiry Alerts

Administration
- Users
- Settings
- Backup
```

### Sidebar visual rules

- Desktop: permanent, compact, solid surface.
- Tablet: collapsed or temporary drawer.
- Mobile: overlay drawer only.
- No Glass sidebar.
- No large logo banner.
- One clearly selected item only.
- Use soft sapphire selected state; never loud neon.
- Respect RTL/LTR icon and drawer direction.
- Menu visibility must continue to respect existing permissions.

### Future navigation change — do not implement during Release 1 polish

After release visual polish is stable:

```text
Stock + Stock In + Stock Out
→ one operational workspace: “Stock Movement”
  - Inbound
  - Outbound
  - Adjustment

Inventory Movements
→ stays separate for audit/history only
```

Do not merge these routes in the current visual identity work.

---

# 2. Shared Visual Structure

## 2.1 Page Header

Use this order:

```text
Breadcrumbs — only when useful
Page title + short operational description
One primary action maximum
Secondary actions grouped / overflowed
```

Examples of primary actions:

| Page | Primary action |
|---|---|
| Products | Add Product |
| Batches | Add Batch |
| Parties | Add Party |
| Stock | Record Movement |
| Purchases | Create Purchase Invoice |
| Sales | Create Sales Invoice |
| Payments | Record Payment |
| Returns | Create Return |
| Users | Add User, only if supported |
| Settings | Save Changes |
| Backup | Create Backup |

Rules:

- Do not repeat the title inside the first card.
- Do not create a giant hero.
- Do not place three contained primary buttons in the same header.
- Mobile: header stacks; primary action stays visible.

## 2.2 Surface Hierarchy

| Surface | Use |
|---|---|
| Ambient canvas | Login and Dashboard only, subtle |
| Glass Surface | Login panel, Dashboard KPI cards, top-level summary / intro cards |
| Solid Paper | Tables, forms, invoices, ledger, reports, operational content |
| Elevated Paper | Controlled review panels, side summaries, drawer sections |
| Danger Zone Surface | Restore / destructive administrative actions only |

## 2.3 Standard Desktop Grid

```text
1440px:
- Content max width: practical workspace width, not a narrow marketing column
- KPI rows: up to 4 compact cards
- Main + side panel: 8/4 or 9/3 only when the side panel adds real value

1280px:
- Same hierarchy, fewer wide gutters

1024px:
- Sidebar collapses
- 2-column card groups where logical
- Secondary panels move beneath or into drawers

768px:
- Header stacks
- Filter toolbar wraps or moves into “More filters”
- Dense data stays inside controlled table scroll surfaces

390px:
- Full mobile recomposition
- Drawer/full-screen forms
- No global horizontal overflow
```

---

# 3. Page Templates

## 3.1 Template A — Catalog / Master Data List

Used by:

- Products
- Batches
- Parties
- Users

```text
Compact Header + one primary action
→ compact filter toolbar
→ optional compact metrics row
→ DataGrid / table primary surface
→ details drawer
→ create/edit form workflow
→ pagination
```

Rules:

- Table is the main workspace.
- Metrics are small and factual.
- Do not make a card wall.
- Details drawer should add context, not duplicate the row.
- Mobile: a compact list or controlled horizontal table; no unreadable 10-column squeeze.

## 3.2 Template B — Operational Entry Workspace

Used by:

- Stock
- Stock In
- Stock Out
- Purchases
- Sales
- Payments
- Returns

```text
Context / party / source selection
→ operational fields or line items
→ review / validation summary
→ one confirmation action
→ optional compact recent activity
```

Rules:

- Solid paper surfaces.
- No Glass line items.
- Inputs and product lines are visually primary.
- Context fields appear before line entry.
- Summary is secondary and should not take more space than line items.
- Mobile: use full-screen form composition or sectioned flow.

## 3.3 Template C — Audit / Review Workspace

Used by:

- Inventory Movements
- Ledger
- Reports
- Expiry Alerts

```text
Compact Header
→ filters
→ trusted summary metrics
→ DataGrid / result table
→ read-only detail drawer
→ pagination
→ export / print secondary
```

Rules:

- No create action in Inventory Movements.
- No posted-entry edit / delete action in Ledger.
- Avoid fake charts.
- Table and filtering must be the focus.
- Use status chips only when meaningful.

## 3.4 Template D — Administration

Used by:

- Users
- Settings
- Backup
- Maintenance

```text
Compact Header
→ controlled sections or filters
→ security-aware content
→ clear save / confirmation behavior
→ visible danger zone when real
```

Rules:

- Calm and conservative.
- Use Glass sparingly, mainly optional intro surface.
- Dangerous actions are isolated.
- No decorative metrics unless factual and useful.

---

# 4. Page-by-Page Blueprint

## 4.1 Root Route `/`

### Purpose
Entry decision only.

### Desired behavior
- Authenticated user: redirect to `/dashboard`.
- Unauthenticated user: redirect to `/login`.

### Visual rules
- No separate marketing showcase.
- No legacy landing page.
- No second visual system.

---

## 4.2 Login `/login`

### Purpose
Fast, trustworthy sign-in.

### Desktop composition

```text
Ambient Sapphire + Teal canvas
→ centered Glass login panel
   ├── pharmacy identity / logo
   ├── concise title
   ├── credentials fields
   ├── clear sign-in button
   └── quiet language / appearance controls if supported
```

### Light / Dark
- The canvas gets the ambient effect.
- The panel is Glass.
- Inputs remain solid/readable.
- Main button remains solid Sapphire.

### Mobile
- Full-width panel with safe gutters.
- Do not use a tiny floating card.
- Avoid any clipped background or vertical scroll trap.

### Do not add
- Marketing blocks
- Fake testimonial
- Decorative giant illustrations
- Multiple competing buttons

---

## 4.3 Dashboard `/dashboard`

### Purpose
Show current business health and direct the user to the next real action.

### Desktop composition

```text
Compact Header
→ 3–4 compact Glass KPI cards
→ two-column attention / quick-actions area
→ recent activity in solid operational Paper
→ small real analytics only when data-backed
```

### KPI card contents
- Small label
- Strong numeric value
- One real supporting context line
- Soft icon tile
- No fake trend percentage

### Attention section
- Expiry, low stock, overdue, or other real alerts only.
- Links go to real routes.

### Quick actions
- 4–6 real actions maximum.
- Do not make them the page’s visual focus above business signals.

### Mobile
- KPI cards stack 1 per row or compact 2-up only if readable.
- Quick actions become clear mobile buttons.
- Recent activity becomes a list or controlled table region.

### Glass
Allowed:
- KPI cards
- Optional compact attention strip

Not allowed:
- Recent activity table
- Deep workflow cards
- Every section

---

## 4.4 Products `/products`, `/products/new`, `/products/[id]/edit`

### Purpose
Catalog search and product management.

### List page

```text
Header + Add Product
→ Search / barcode / category / status filters
→ optional factual summary row
→ Products DataGrid
→ Product details drawer
→ pagination
```

### Suggested DataGrid order
1. Product name
2. Product code / barcode
3. Category / unit where real
4. Stock state only if trustworthy
5. Status
6. Actions

### Details drawer
Show:
- Name
- Code / barcode
- Category
- Unit
- Relevant stock summary if supported
- Edit action
- Links to related batches / movements if real and supported

### Create/Edit form
Sections:
1. Basic product identity
2. Packaging / unit
3. Product organization fields
4. Optional controlled stock / reference metadata only if existing model supports it

### Mobile
- List remains scan-friendly.
- Create/edit uses full-screen drawer/page.
- Do not squeeze every DataGrid column.

### Do not add
- Rainbow categories
- Glass product table
- Fake image gallery
- Product cards replacing a useful table

---

## 4.5 Batches `/batches`, `/batches/new`, `/batches/[id]/edit`

### Purpose
Expiry-aware batch management.

### List page

```text
Header + Add Batch
→ Search + Product + Expiry window + availability filters
→ compact expiry metrics
→ Batch DataGrid
→ Batch details drawer
→ pagination
```

### Suggested DataGrid order
1. Product
2. Batch number
3. Expiry date
4. Days remaining
5. Available quantity
6. Expiry status
7. Actions

### Expiry visual rules
- Expired: Error semantic chip
- Near expiry: Warning semantic chip
- Healthy/later: Neutral or Success only when useful
- Never rely on color alone; labels must be clear.

### Drawer
Show:
- Product
- Batch number
- Expiry date
- Days remaining
- Quantity
- Related purchase/supplier only if real
- Links to product and movements

### Create/Edit
- Keep expiry and batch identity highly visible.
- Do not bury quantity / expiry inside advanced accordion sections.

### Mobile
- Batch cards or compact rows may replace a wide grid presentation.
- Dates and quantity must remain visible without expansion.

---

## 4.6 Parties `/parties`, `/parties/new`, `/parties/[id]`, `/parties/[id]/edit`

### Purpose
Manage customers/suppliers and review their account-related activity.

### List page

```text
Header + Add Party
→ Search + type + status + balance filters
→ compact party metrics
→ Party DataGrid
→ Party details drawer or profile link
→ pagination
```

### Suggested DataGrid order
1. Party name
2. Type
3. Contact summary
4. Balance / financial state only when trusted
5. Status
6. Actions

### Profile page

```text
Compact Party Header
→ balance summary in a controlled top section
→ quick real actions
→ meaningful tabs:
   Overview / Invoices / Payments / Ledger
```

### Profile visual rules
- Balance must be easy to read but not visually louder than all other data.
- Tabs only if each contains enough real information.
- Avoid a wall of cards.
- Use solid Paper for financial details.

### Mobile
- Tabs become scrollable or a controlled selector.
- Important balance/action summary stays near the top.
- Tables within tabs use mobile-aware layouts.

### Do not add
- Fake CRM timeline
- Decorative profile hero
- Raw ledger JSON
- Multiple bold balance cards

---

## 4.7 Stock `/stock`, `/stock/in`, `/stock/out`

### Purpose
Fast non-invoice stock operations.

### Important boundary
- These pages remain separate during Release 1 visual work.
- Inventory Movements remains the audit/history page.
- Do not duplicate movements generated by Purchase/Sale/Return workflows.

### Stock overview

```text
Contextual header
→ direct links to supported stock directions
→ short explanation / status only if useful
→ compact recent activity
```

### Stock In

```text
Context fields
→ product / batch entry
→ quantity / date / reference
→ validation summary
→ confirm stock-in action
→ compact recent activity
```

### Stock Out

```text
Context fields
→ product search
→ available batch selection
→ available quantity shown clearly
→ quantity / reason / reference
→ validation summary
→ confirm stock-out action
```

### Visual rules
- Product selection is primary.
- Available quantity must be visible for Stock Out.
- Reason/reference fields must be clearly grouped.
- Keep operational entry denser than Dashboard.
- No Glass line items.
- Recent history is secondary only.

### Mobile
- Full-screen form flow.
- Product/batch selectors must be touch-friendly.
- Sticky confirmation action only if it does not cover fields.
- Do not use a tiny table to enter a movement.

---

## 4.8 Inventory Movements `/inventory/movements`

### Purpose
Read-only audit trail.

### Composition

```text
Compact header
→ compact filters
→ trusted summary values
→ DataGrid as primary workspace
→ read-only movement drawer
→ pagination
→ export/print secondary
```

### Rules
- No Add Movement action.
- No edit/delete action for posted movement.
- Drawer remains read-only.
- Filters should not consume most of the viewport.
- Use solid DataGrid surface.
- Date, type, product, batch, quantity, reference, and actor should be highly scannable.

### Mobile
- Compact list or controlled horizontal table.
- Details drawer becomes full-screen.
- Do not hide movement type and quantity simultaneously.

---

## 4.9 Purchases `/purchases`

### Purpose
Record purchase invoice, receive stock, and preserve traceability.

### Composition

```text
Supplier selection
→ invoice metadata
→ invoice item lines
→ batch creation/selection where real
→ totals / review
→ one confirm purchase action
```

### Desktop layout
- Main line-items workspace: dominant.
- Right/side review panel: narrow and factual.
- Supplier and invoice context appear before lines.
- Batch-related control opens in a roomy drawer or dedicated area, not a tiny dialog.

### Visual rules
- Solid operational Paper.
- Do not use Glass invoice rows.
- Product lines must be readable and keyboard-friendly.
- Totals should not overpower the workflow.
- Confirm action is obvious but not prematurely always sticky.

### Mobile
- Use sectioned full-screen form flow.
- Line item add/edit interaction must remain practical.
- Totals review is below lines, then a reachable confirmation action.

---

## 4.10 Sales `/sales`

### Purpose
Fast, safe sale invoice workflow.

### Composition

```text
Customer selection
→ product search / barcode
→ batch selection and availability context
→ invoice lines
→ totals / payment context
→ review / confirm sale
```

### Visual rules
- Product search is visually prominent.
- Availability / suggested batch must be clear but not noisy.
- Customer and payment context are secondary to line entry.
- Solid operational paper only.
- No fake success metrics.

### Mobile
- Barcode/product entry stays primary.
- Item lines use compact line cards or controlled table area.
- Avoid hidden availability information.

---

## 4.11 Payments `/payments`

### Purpose
Record receipts/payments safely and review financial activity.

### Composition

```text
Header + Record Payment
→ clear receipt/payment direction control if supported
→ filter toolbar
→ payments history table
→ form drawer / full-screen form
```

### Form emphasis
1. Party
2. Amount
3. Direction
4. Method
5. Date / reference
6. Notes only when supported

### Visual rules
- Financial direction must be obvious.
- Amount field is prominent without looking like marketing metric.
- Keep payment methods calm and readable.
- Do not overuse green/red; semantic chips only where useful.

### Mobile
- Drawer becomes full-screen.
- Amount and party remain above fold.
- Primary confirmation stays reachable.

---

## 4.12 Returns `/returns`

### Purpose
Reverse valid previous transactions safely.

### Composition

```text
Find original transaction
→ original transaction context
→ returnable lines / quantities
→ mandatory reason
→ review impact
→ confirm return
```

### Visual rules
- Source transaction context stays visible.
- Returnable quantity must be unmistakable.
- Reason is required visually and semantically.
- Danger/irreversibility should be communicated using controlled warning copy, not exaggerated design.
- Do not use a generic free-form return screen without source reference.

### Mobile
- Original transaction summary sticks near top or remains accessible.
- Lines use a compact sectioned flow.
- Confirmation is distinct and clear.

---

## 4.13 Ledger `/ledger`

### Purpose
Review trusted financial timeline and summaries.

### Composition

```text
Party/account filter
→ date/type/status filters
→ trusted summary values
→ ledger timeline/table
→ read-only detail drawer
→ pagination
→ truthful export
```

### Rules
- Do not show untrusted running balance.
- Debit/credit treatment must be consistent.
- Financial values align consistently.
- No broad “green means good/red means bad” coloring for every amount.
- No posted-entry edits.
- The export label must truthfully reflect filtered/all rows behavior.

### Mobile
- Show core date, description, debit/credit or signed amount first.
- More metadata enters detail drawer.
- Preserve financial meaning in compact layout.

---

## 4.14 Reports `/reports`

### Purpose
Answer operational questions from real data.

### Composition

```text
Report category / tabs
→ focused filters
→ compact summary
→ result table or real data-backed visual
→ export / print secondary
```

### Visual rules
- Category selector comes before results.
- Do not show empty generic tables with no selected report context.
- Results table is primary.
- Charts only where backed by real data and useful.
- Keep filters compact and understandable.

### Mobile
- Tabs scroll horizontally or become selector.
- Export is available but secondary.
- Result table uses controlled mobile treatment.

---

## 4.15 Expiry Alerts `/expiry-alerts`

### Purpose
Identify batches that need attention due to expiry risk.

### Composition

```text
Compact header
→ counters: Expired / 7 days / 30 days / Total at Risk
→ alert filters
→ at-risk batch DataGrid
→ batch detail drawer
→ pagination
```

### Visual rules
- Expiry risk is the focus.
- Counter cards can use compact Glass only if they remain factual and subtle.
- The table remains solid.
- No “Resolve Alert” fake action.
- Links must route to real product, batch, purchase, or movement pages.

### Mobile
- Counters stack intelligently.
- Critical status/date/quantity remain visible.
- Drawer becomes full-screen.

---

## 4.16 Users `/users`

### Purpose
Manage accounts and access safely.

### Composition

```text
Header + Add User only if supported
→ search / status / role filters
→ user list DataGrid
→ read-only detail drawer
→ create/edit workflow where backend supports it
```

### Visual rules
- Conservative, security-first.
- No colorful profile card walls.
- Permission summary uses readable labels, not raw JSON.
- Status actions require clear confirmation.
- No sensitive data, tokens, hashes, or session information.

### Mobile
- Compact user list / controlled columns.
- Detail drawer full-screen.
- Account actions remain explicit.

---

## 4.17 Settings `/settings`

### Purpose
Configure real system settings without making users hunt.

### Composition

```text
Compact settings header
→ optional small Glass introduction surface
→ settings section navigation
→ focused solid form sections
→ explicit Save / Reset behavior
```

### Section model
Use only sections that exist in current app:

```text
Pharmacy Profile
Invoice Defaults
Inventory Rules
Language & Appearance
Security Preferences
```

### Visual rules
- Not one massive 50-field page.
- Group fields by business meaning.
- Save state is explicit.
- Danger/security sections use controlled separation.
- Do not use Dashboard-style metrics.

### Mobile
- Section navigation becomes tabs, a select, or drawer.
- Save action remains reachable.
- Forms are not overly nested.

---

## 4.18 Backup `/backup`

### Purpose
Create/download backup and expose restore safely.

### Composition

```text
Protection status / latest backup summary
→ normal backup actions
→ backup history only if real
→ isolated restore danger zone
```

### Visual rules
- Normal backup area: solid clean Paper.
- Restore area: clearly separated warning/danger zone.
- Restore is never the page’s primary visual action.
- Confirmation dialog explicitly explains consequences using real behavior.
- Do not use Glass in restore area.
- No fake history.

### Mobile
- Danger zone remains clearly distinct.
- Destructive confirmation dialog must fit and read well.

---

## 4.19 Maintenance `/maintenance`

### Purpose
Communicate limited availability with minimum friction.

### Composition

```text
Centered status surface
→ concise explanation
→ supported action only: retry / sign in / dashboard
```

### Visual rules
- Minimal.
- No app shell if it is not appropriate for current state.
- No decoration necessary.
- Fully localized and dark-mode-safe.

---

# 5. Global State Patterns

Every major domain should use shared MUI patterns for:

```text
Loading
Empty
Error
Unauthorized
Not found
Confirmation
Success / failure feedback
```

## Required state behavior

### Loading
- Skeleton reflects actual page structure.
- No spinner floating alone in a giant blank page.

### Empty
- Explain what is empty.
- Provide one real next action only when supported.

### Error
- Clear concise message.
- Retry only when it works.

### Unauthorized
- Do not reveal hidden data or unsupported actions.

### Not Found
- Concise, localized, direction-safe.

---

# 6. Glass & Gradient Placement Matrix

| Page / Component | Ambient Canvas | Glass Allowed | Solid Required |
|---|---|---|---|
| Login | Yes | Login panel | Inputs, actions |
| Dashboard | Yes | KPI cards, optional attention strip | Activity, tables |
| Products | No | Optional compact metric only | Grid, forms |
| Batches | No | Optional compact metric only | Grid, forms |
| Parties | No | Optional top summary only | Profile, financial detail |
| Stock | No | No | All operations |
| Purchases | No | No | All invoice workflow |
| Sales | No | No | All invoice workflow |
| Payments | No | No | Table and form |
| Returns | No | No | Source and return workflow |
| Inventory Movements | No | No | Grid and drawer |
| Ledger | No | No | Financial table / drawer |
| Reports | No | No | Results / filters |
| Expiry Alerts | Optional subtle | Counters only, optional | Alert grid |
| Users | No | Optional top intro only | Table / forms |
| Settings | No | Optional intro only | Form sections |
| Backup | No | No | Normal and danger surfaces |
| Maintenance | Optional subtle | Optional centered surface | Action controls |

---

# 7. Release Design Acceptance Checklist

A page is visually approved only when:

- [ ] It follows its page template and hierarchy.
- [ ] It uses centralized MUI tokens.
- [ ] It has no random hardcoded visual system.
- [ ] It behaves correctly in Arabic RTL and English LTR.
- [ ] It behaves correctly in Light, Dark, and System mode.
- [ ] It is practical at 1440px, 1280px, 1024px, 768px, and 390px.
- [ ] No full-page horizontal overflow exists.
- [ ] Glass is used only where permitted.
- [ ] Data-heavy operational areas remain solid and readable.
- [ ] One primary action maximum is visually dominant.
- [ ] Empty/loading/error/unauthorized states match the design system.
- [ ] No business behavior, permissions, routes, or data semantics changed.

---

# 8. Implementation Order

```text
1. Final Browser Visual QA and P0/P1 repair
2. Central MUI theme + shared primitive upgrade
3. Login + Dashboard visual signature
4. Master Data visual application
5. Operational entry visual application
6. Audit/reporting visual application
7. Administration visual application
8. Full release screenshot pass
9. Stock Operations Consolidation — later functional milestone
```

The order is intentional:

> Theme and shared patterns first.  
> Signature screens second.  
> Operational pages last, with usability protected.
