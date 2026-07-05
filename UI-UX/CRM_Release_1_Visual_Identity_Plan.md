# CRM Release 1 — Visual Identity Plan & Color Reference

**Project:** Pharmacy CRM  
**Version:** Release 1 visual direction  
**Status:** Design reference for post-QA visual polish  
**Design name:** **Sapphire Clinical Glass**

---

## 1. Visual Goal

Create a calm, premium, trustworthy operational interface that feels like:

- Linear-level precision
- Stripe-style clarity
- Modern healthcare trust
- Subtle premium glass surfaces
- Fast, dense, readable business workflows

This is **not** a marketing website and not a traditional heavy ERP.

The product must remain:

- Fast to scan
- Easy to operate
- Safe for financial and stock workflows
- Strong in Arabic RTL and English LTR
- Excellent in light, dark, and system modes
- Visually consistent across all domains

---

## 2. Non-Negotiable Design Principles

1. **MUI remains the visual engine.** Do not introduce a second design system.
2. **Use semantic theme tokens, not route-level hardcoded colors.** Components must consume theme values.
3. **Glass is an accent, not the main layout.** Use it only for premium overview surfaces.
4. **Operational surfaces remain solid and readable.** Tables, invoice lines, ledger rows, dense forms, and destructive actions must not use glass.
5. **One primary action per page.** Keep visual hierarchy immediate and calm.
6. **No decorative noise.** No gradients on every card, no rainbow chips, no giant heroes, no fake charts, no pastel card walls.
7. **Dark mode is designed, not inverted.** Every surface, divider, status, input, table, drawer, and dialog must be intentional.

---

## 3. Brand Palette

### 3.1 Primary Brand Colors

| Token | Hex | Use |
|---|---:|---|
| `primary.main` | `#3957FF` | Main primary actions, active navigation, links, focus accents |
| `primary.hover` | `#2747E8` | Hover / active state |
| `primary.light` | `#5B6DFF` | Controlled highlights and brand gradient |
| `primary.soft` | `#E9EDFF` | Light selected backgrounds / soft primary state |
| `secondary.main` | `#11B7A3` | Secondary accent, controlled positive emphasis |
| `secondary.hover` | `#099583` | Hover / active secondary state |
| `secondary.soft` | `#DDF9F4` | Light soft teal state |

### 3.2 Semantic Status Colors

| Meaning | Light Main | Light Soft | Dark Main | Use |
|---|---:|---:|---:|---|
| Success | `#0A9B72` | `#E7F8F2` | `#35C799` | Posted, completed, healthy, active |
| Warning | `#D98912` | `#FFF4DE` | `#F6B84A` | Near expiry, review needed, low stock |
| Error | `#DC3F52` | `#FDECEF` | `#F06C7A` | Expired, failed, inactive, destructive warning |
| Info | `#3B82F6` | `#EAF3FF` | `#69A7FF` | Draft, informational, ongoing process |
| Neutral | `#667085` | `#F2F4F7` | `#A7B0C0` | Secondary metadata, muted neutral state |

### 3.3 Light Mode Foundations

| Token | Hex | Use |
|---|---:|---|
| `background.default` | `#F5F7FC` | Application canvas |
| `background.paper` | `#FFFFFF` | Operational surfaces and main cards |
| `surface.subtle` | `#F8FAFC` | Hover areas, secondary sections |
| `text.primary` | `#111827` | Main reading text |
| `text.secondary` | `#667085` | Metadata and supporting labels |
| `divider` | `#E5EAF2` | Soft borders and row separation |
| `action.hover` | `#F0F4FF` | Hover row / menu state |
| `action.selected` | `#E9EDFF` | Selected state |

### 3.4 Dark Mode Foundations

| Token | Hex | Use |
|---|---:|---|
| `background.default` | `#0A1020` | Application canvas |
| `background.paper` | `#111A2D` | Primary operational surface |
| `surface.elevated` | `#17223A` | Elevated drawer / panel surface |
| `surface.subtle` | `#10192B` | Secondary quiet surface |
| `text.primary` | `#F6F8FC` | Main reading text |
| `text.secondary` | `#A7B0C0` | Metadata and supporting labels |
| `divider` | `#26344F` | Soft borders |
| `action.hover` | `rgba(91, 109, 255, 0.10)` | Hover row / menu state |
| `action.selected` | `rgba(91, 109, 255, 0.18)` | Selected state |

---

## 4. Gradient System

Gradients are used only as subtle ambient identity, never as the default component paint.

### Brand Flow Gradient

Use only in Login, Dashboard ambient areas, controlled launch/overview surfaces, or a subtle Settings intro surface.

```css
linear-gradient(
  135deg,
  #3957FF 0%,
  #5B6DFF 42%,
  #11B7A3 100%
)
```

### Light Ambient Background

```css
radial-gradient(
  circle at 15% 0%,
  rgba(57, 87, 255, 0.15) 0%,
  transparent 34%
),
radial-gradient(
  circle at 85% 8%,
  rgba(17, 183, 163, 0.11) 0%,
  transparent 30%
)
```

### Dark Ambient Background

```css
radial-gradient(
  circle at 12% 0%,
  rgba(72, 96, 255, 0.22) 0%,
  transparent 34%
),
radial-gradient(
  circle at 88% 5%,
  rgba(17, 183, 163, 0.15) 0%,
  transparent 28%
)
```

### Gradient Rules

Never use gradients on:

- DataGrid rows
- Invoice line rows
- Dense operational forms
- Stock movements
- Ledger entries
- Report result tables
- Backup restore surfaces
- Destructive confirmation dialogs
- Status chips
- Primary save/submit buttons

Primary buttons remain solid `primary.main`.

---

## 5. Glass Surface System

### Where Glass Is Allowed

Use glass only for:

- Login panel
- Dashboard KPI cards
- Dashboard attention strip
- Top-level summary cards
- Settings intro surface
- Quick-action / command surfaces
- A small selected overview panel where it adds hierarchy

### Where Glass Is Forbidden

Do not use glass on:

- DataGrid and table rows
- Invoice item lines
- Stock entry line items
- Ledger rows
- Reports result tables
- Dense forms
- Backup restore area
- Dangerous actions
- Destructive confirmation dialogs
- Full sidebar
- Full application background

### Light Glass Card

```css
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.82),
  rgba(255, 255, 255, 0.56)
);

backdrop-filter: blur(18px) saturate(135%);
-webkit-backdrop-filter: blur(18px) saturate(135%);

border: 1px solid rgba(255, 255, 255, 0.68);

box-shadow:
  0 18px 52px rgba(15, 23, 42, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.72);
```

### Dark Glass Card

```css
background: linear-gradient(
  135deg,
  rgba(23, 34, 58, 0.78),
  rgba(17, 26, 45, 0.62)
);

backdrop-filter: blur(18px) saturate(125%);
-webkit-backdrop-filter: blur(18px) saturate(125%);

border: 1px solid rgba(255, 255, 255, 0.10);

box-shadow:
  0 22px 60px rgba(0, 0, 0, 0.30),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### Glass Geometry

| Property | Standard |
|---|---|
| Glass card radius | `20px` |
| Glass card padding | `20px–24px` |
| Standard card radius | `16px` |
| Input / table radius | `12px` |
| Border | Thin, low-contrast, theme-aware |
| Shadows | Wide and soft; never harsh black |
| Accent | One small icon tile or top-level visual accent only |

---

## 6. Layout, Typography & Spacing

### Spacing Rhythm

| Token | Value | Typical use |
|---|---:|---|
| `space.1` | `8px` | Tight icon / field spacing |
| `space.2` | `12px` | Small grouped controls |
| `space.3` | `16px` | Normal card and form grouping |
| `space.4` | `24px` | Main page section separation |
| `space.5` | `32px` | Large workspace separation |
| `space.6` | `40px` | Rare only for top-level composition |

Avoid arbitrary spacing values. Use the 8px rhythm.

### Type Hierarchy

| Element | Intent |
|---|---|
| Page title | Compact, strong, operational; never oversized |
| Page description | One short sentence only when useful |
| Section heading | Clear but quieter than page title |
| Body text | Calm and readable |
| Metadata | Smaller, muted, never too tiny |
| Numeric values | Strong, consistently aligned |
| Table headers | Clear, low-noise, scan-friendly |

### Page Composition

```text
Breadcrumbs when useful
→ Compact page title + one primary action maximum
→ Filter / command toolbar when applicable
→ Main operational workspace
→ Secondary detail / summary area
→ Pagination or totals footer
```

Do not duplicate a page title inside a card after it appears in the header.

---

## 7. Component Reference

### Sidebar

**Light mode**
- Almost-white / cool gray solid surface
- Selected item: `primary.soft`
- Selected icon and label: `primary.main`
- Compact command-rail feeling

**Dark mode**
- Deep navy solid surface
- Selected item: translucent sapphire selected state
- No glass sidebar
- No huge logo block

### App Bar

Contains only:
- Navigation toggle where relevant
- Context / lightweight breadcrumb
- Locale selector
- Appearance selector
- Real user menu
- Real global search only if fully working

Do not add decorative notification icons.

### Buttons

| Action type | MUI direction |
|---|---|
| Main action | `contained`, `primary` |
| Secondary workflow | `outlined` |
| Supporting action | `text` |
| Dangerous action | `outlined` or controlled error treatment |
| Disabled state | Theme-native disabled styling |

Do not make more than one header action visually dominant.

### Status Chips

Use semantic meaning only:

- Success: posted, active, completed, healthy
- Warning: near expiry, low stock, needs review
- Error: expired, failed, inactive, critical
- Info: draft, informational, in progress
- Neutral: secondary metadata

No rainbow category colors.

### DataGrid / Tables

- Solid `Paper` surface only
- Clean low-noise header
- Soft row hover
- Quiet dividers
- Strong numeric alignment
- Semantic status chips
- No glass rows
- No gradients
- No excessive row height

### Drawers & Dialogs

- Theme-aware surface
- Clear title / close action
- Correct RTL/LTR anchoring
- Standardized width on desktop
- Full-screen or sheet behavior on mobile
- Sticky primary action only when it does not cover content

---

## 8. Route-Level Visual Intent

### Dashboard

```text
Soft ambient canvas
→ 3–4 compact glass KPI cards
→ real attention / alert area
→ real quick actions
→ recent activity in solid operational surface
→ small data-backed analytics only where useful
```

### Login

```text
Ambient Sapphire + Teal background
→ one focused glass sign-in panel
→ clear pharmacy identity
→ accessible inputs and calm primary action
```

### Products / Batches / Parties

```text
Compact header
→ search + filters
→ optional compact metrics
→ DataGrid as main focus
→ read-only details drawer
→ create/edit drawer or responsive form
```

### Stock / Purchases / Sales / Payments / Returns

```text
Solid operational workspace
→ clear workflow order
→ item lines / fields as main focus
→ quiet totals / review surface
→ one obvious confirmation action
```

### Inventory Movements / Ledger / Reports / Expiry Alerts

```text
Audit or analysis first
→ compact filters
→ trusted summaries
→ table / results primary
→ drawer for details
→ export remains secondary
```

### Settings / Backup / Users

```text
Clear administrative sections
→ calm solid forms / tables
→ glass only for top-level intro if useful
→ destructive behavior isolated and visually controlled
```

---

## 9. Responsive Rules

Verify visual direction at:

- 1440px desktop
- 1280px laptop
- 1024px small laptop
- 768px tablet
- 390px mobile

### Tablet
- Sidebar collapses appropriately
- Toolbars wrap or use controlled overflow
- Cards move from 4 → 2 → 1 columns logically
- Tables scroll only inside their surface

### Mobile
- Navigation becomes an overlay drawer
- Header stacks
- Primary action remains reachable
- Forms use mobile-aware or full-screen composition
- Dense tables become compact rows or controlled horizontal areas
- No full page horizontal overflow
- No tiny icon-only essential action

---

## 10. Release 1 Visual Identity Sprint

Run only after final browser QA confirms the underlying routes are stable.

### Phase A — Central Tokens
1. Add color tokens to central MUI theme.
2. Add semantic light/dark surfaces.
3. Normalize typography, radii, shadows, spacing.
4. Build reusable `GlassSurface` / `AmbientCanvas` primitives.

### Phase B — Signature Surfaces
1. Login glass panel.
2. Dashboard ambient background.
3. Dashboard KPI glass surfaces.
4. Refined selected sidebar state.
5. Shared DataGrid, Drawer, Dialog, and Empty State polish.

### Phase C — Route Application
1. Apply shared tokens route by route.
2. Preserve operational density in stock, invoices, and financial workspaces.
3. Do not add glass where it reduces clarity.
4. Fix dark-mode contrast as components are touched.

### Phase D — Release Proof
1. Capture light and dark screenshots.
2. Verify Arabic RTL and English LTR.
3. Verify desktop, tablet, mobile.
4. Run lint, type-check, and production build.
5. Produce a visual release acceptance report.

---

## 11. Acceptance Checklist

Release 1 visual identity is approved only when:

- [ ] All colors come from the centralized MUI theme.
- [ ] No hardcoded page-level color systems exist.
- [ ] Light mode is calm, readable, and premium.
- [ ] Dark mode has deliberate surfaces and readable contrast.
- [ ] Glass is used only on approved premium overview surfaces.
- [ ] Tables, forms, invoices, and ledgers remain solid and operational.
- [ ] Arabic RTL is correct in all shared patterns.
- [ ] English LTR is correct in all shared patterns.
- [ ] Desktop, tablet, and mobile are verified.
- [ ] No visual regression harms business workflows.
- [ ] No Tailwind or second visual system is introduced.
- [ ] No business logic, permissions, auth, or posting logic changes.
- [ ] Screenshot evidence exists for Dashboard, Login, Stock, Purchases, Sales, Ledger, Reports, Settings, and Backup.
- [ ] `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.

---

## 12. Implementation Guardrails

- Prefer shared-theme and shared-component fixes over page-specific overrides.
- Do not imitate a screenshot literally at the cost of usability.
- Do not use visual styling to hide poor layout hierarchy.
- Keep data-heavy screens more neutral than overview screens.
- Preserve MUI accessibility defaults.
- Use MUI icons only; do not mix icon libraries.
- Do not translate user-entered product names, emails, codes, barcodes, batch numbers, invoice references, or notes.
- Do not change existing stock, financial, invoice, return, ledger, report, backup, permission, or authentication logic.

---

## 13. First Design Sample to Approve

The first visual sample should be the **Dashboard**, shown side-by-side in:

1. Arabic RTL Light Mode
2. Arabic RTL Dark Mode

The sample must demonstrate:

- Ambient Sapphire + Teal background treatment
- 3–4 compact glass KPI cards
- Solid operational alert / activity areas
- Premium selected sidebar state
- Controlled semantic status chips
- Proper Arabic spacing and RTL alignment
- Strong readability without excess decoration

Once this is approved, apply the same shared token system to Login and then to the rest of the app.
