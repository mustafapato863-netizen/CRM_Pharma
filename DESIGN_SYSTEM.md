# Design System Reference — Pharmacy CRM

> Clean · Light · Modern · Professional · Blue/Purple Accents · Glassmorphism

**Stack:** Tailwind CSS + shadcn/ui

---

## 1. Purpose

Define the visual language, colors, typography, components, spacing, shadows, and UI patterns to be used across the Pharmacy CRM application.

---

## 2. Color Palette

### Primary (Purple)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-600` | `#6366F1` | Primary actions, CTA buttons |
| `primary-400` | `#8B5CF6` | Hover states, accents |
| `primary-300` | `#A78BFA` | Light accents |
| `primary-200` | `#C4B5FD` | Subtle highlights |
| `primary-100` | `#EDE9FE` | Backgrounds, badges |

### Secondary (Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-500` | `#0EA5E9` | Secondary actions |
| `blue-400` | `#38BDF8` | Info states |
| `blue-300` | `#7DD3FC` | Light blue accents |
| `blue-200` | `#BAE6FD` | Subtle info backgrounds |
| `blue-100` | `#E0F2FE` | Info backgrounds |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10B981` | Success states |
| `warning` | `#F59E0B` | Warning states |
| `danger` | `#EF4444` | Error/Danger states |

### Neutral (Grayscale)

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-900` | `#0F172A` | Body text, headings |
| `gray-700` | `#334155` | Secondary text |
| `gray-500` | `#64748B` | Muted text, icons |
| `gray-400` | `#94A3B8` | Placeholder text |
| `gray-300` | `#CBD5E1` | Borders, dividers |
| `gray-200` | `#E2E8F0` | Input borders |
| `gray-100` | `#F1F5F9` | Page backgrounds |
| `gray-50`  | `#F8FAFC` | Card backgrounds |
| `white`    | `#FFFFFF` | Surfaces |

---

## 3. Gradients

```css
/* Primary Gradient */
background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);

/* Blue Gradient */
background: linear-gradient(90deg, #38BDF8 0%, #636CF1 100%);

/* Glass Gradient (Cards & Panels) */
background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));

/* Soft Background */
background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
```

---

## 4. Typography

**Font Family:** [Inter](https://fonts.google.com/specimen/Inter) — all weights

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

| Role | Weight | Size | Line Height | Usage |
|------|--------|------|-------------|-------|
| H1 | 700 (Bold) | 32px | 40px | Page Titles |
| H2 | 600 (SemiBold) | 24px | 32px | Section Titles |
| H3 | 600 (SemiBold) | 20px | 28px | Card Titles |
| Body (Base) | 400 (Regular) | 14px | 20px | Paragraphs, Content |
| Small | 400 (Regular) | 12px | 16px | Helper Text, Meta |
| Caption | 400 (Regular) | 11px | 14px | Captions, Notes |

---

## 5. Spacing Scale (Tailwind-based)

| Class | Value |
|-------|-------|
| `space-0` | 0px |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-10` (alias `16`) | 40px — used for `space-10` |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

---

## 6. Shadows

```css
/* sm — Soft */
box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);

/* md — Elevated */
box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);

/* lg — Floating */
box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);

/* xl — Strong */
box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
```

---

## 7. Glassmorphism

Used for cards, modals, sidebars, and panels.

```css
.glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

---

## 8. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Tags, badges |
| `rounded-md` | 10px | Inputs, small cards |
| `rounded-lg` | 14px | Cards |
| `rounded-xl` | 20px | Panels, modals |
| `rounded-2xl` | 24px | Large containers |
| `rounded-3xl` | 32px | Hero sections |
| `rounded-full` | 9999px | Avatars, pills |

---

## 9. Components (shadcn/ui-based)

### Buttons

```tsx
// Primary
<Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90">
  Button
</Button>

// Secondary
<Button variant="secondary">Button</Button>

// Outline
<Button variant="outline">Button</Button>

// Ghost
<Button variant="ghost" className="text-primary">Button</Button>

// Danger
<Button className="bg-red-500 text-white hover:bg-red-600">Button</Button>
```

**States:**
- `Default` — full color, normal cursor
- `Hover` — slightly elevated shadow, 90% opacity
- `Disabled` — 40% opacity, `cursor-not-allowed`

---

### Inputs

```tsx
// Default
<Input placeholder="Enter something" />

// Focused
<Input placeholder="Enter something" className="ring-2 ring-indigo-400 border-indigo-400" />

// Disabled
<Input placeholder="Enter something" disabled className="opacity-50 bg-gray-50" />
```

---

### Select / Date Picker / Search

```tsx
// Select
<Select>
  <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
  ...
</Select>

// Date Picker — with calendar icon
<DatePicker placeholder="Select date" />

// Search — with magnifier icon prefix
<Input placeholder="Search..." className="pl-9" prefix={<SearchIcon />} />
```

---

## 10. Cards

### Simple Card

```tsx
<div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
  <h3 className="font-semibold text-gray-900">Card Title</h3>
  <p className="text-sm text-gray-500 mt-1">This is a simple card description.</p>
</div>
```

### Glass Card

```tsx
<div className="glass rounded-xl p-5">
  <h3 className="font-semibold text-gray-900">Card Title</h3>
  <p className="text-sm text-gray-500 mt-1">Glass background with blur effect.</p>
</div>
```

### Gradient Card

```tsx
<div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
  <h3 className="font-semibold">Card Title</h3>
  <p className="text-sm text-white/80 mt-1">With gradient background.</p>
</div>
```

---

## 11. Charts Style

Charts use the blue/purple palette with soft fills.

```ts
// Area / Line Chart
const chartColors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  fill: 'rgba(99,102,241,0.12)',
  grid: '#E2E8F0',
  label: '#64748B',
};

// Donut Chart — segment colors
const donutColors = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B'];
```

**Chart guidelines:**
- Grid lines: `#E2E8F0`, 1px, dashed
- Tooltips: white background, `shadow-md`, `rounded-lg`
- Labels: `text-sm`, `text-gray-500`
- Donut center: show total value in `font-bold text-2xl`

---

## 12. UI/UX Guidelines

| Principle | Description |
|-----------|-------------|
| **Consistency** | Use the same components, colors, and spacing throughout |
| **Clarity** | Keep the UI clean, simple, and easy to scan |
| **Feedback** | Always provide loading states and toast notifications |
| **Accessibility** | Follow contrast ratios, use focus states and aria labels |
| **Responsive** | Mobile-first approach for all screens |

---

## 13. Notes

- Use **light mode** as the default theme.
- **Blue / Purple** are the main brand colors.
- **Glassmorphism** is used for cards and panels.
- Keep **performance** and **readability** in mind.
- Follow **Tailwind CSS utility classes** conventions.
- All interactive elements must have visible **focus rings** (`ring-2 ring-indigo-400`).
- Toast notifications: use `sonner` or shadcn `Toast` component.
- Icons: use `lucide-react` library throughout.

---

*Last updated: June 2026 — Pharmacy CRM v1.0*

## 14. Page States and Shell

Every page should use the shared foundation for loading, access control, empty, and error states.

### Shared Page Components

- `PageShell` for consistent page spacing and width
- `PageHeader` for icon, title, description, breadcrumbs, and actions
- `PageSkeleton` for loading state placeholders
- `Unauthorized` for permission-denied states
- `ComingSoon` for unimplemented features
- `EmptyState` for empty list or no-data states
- `ErrorState` for retryable page failures
- `SectionCard` for reusable elevated page sections
- `HeaderIcon` for the canonical lucide page icon mapping

### Navbar Style

The application navbar should stay light and premium with a subtle glass treatment:

`bg-gradient-to-r from-sky-50/80 via-white/75 to-indigo-50/80`
`backdrop-blur-xl`
`border-b border-white/60`
`shadow-[0_8px_24px_rgba(15,23,42,0.04)]`

## 15. Internal UI Kit and Page Layout Pattern

Preferred reusable primitives live under `src/components/ui/`:

- `GlassCard`
- `PageSection`
- `PageToolbar`
- `AppCard`
- `SectionTitle`
- shared button token classes

Use this order for CRUD and data pages:

1. `PageHeader`
2. Optional stats row
3. `PageToolbar`
4. `GlassCard` or `SectionCard`
5. Table
6. Pagination

The goal is visual consistency, not more abstraction.

## 15. Maintenance and 404 States

- Use `app/not-found.tsx` for the branded 404 page.
- Use `app/maintenance/page.tsx` for temporary maintenance mode.
- Use `ComingSoon` for unfinished feature routes instead of exposing the default Next.js error screen.

## 16. PWA Foundation

The app should be installable on desktop and mobile.

### Manifest

Use `public/site.webmanifest` with branded app identity, standalone display mode, and pharmacy/productivity/medical categories.

### Icons

Use icons under `public/icons/` for favicon, Apple touch icon, and maskable PWA sizes.

### Install Experience

Use the shared `InstallAppButton` to expose the browser install prompt when supported.

### Mobile Polish

- Support safe area insets
- Fill the viewport with the app background
- Avoid default white flashes
- Keep standalone mode visually clean
