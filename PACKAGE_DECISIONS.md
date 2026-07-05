# Package Decisions

## Chosen Stack

### Prisma over Drizzle

Prisma fits this CRM well because the schema is explicit, the team already uses it, and the data model is relational with clear business entities.

### React Hook Form over Formik

React Hook Form is smaller, faster, and already used across the codebase. It pairs cleanly with Zod and avoids extra rerenders.

### Zod for validation

Zod gives shared schema validation for client forms and server actions without duplicating rules.

### Zustand over Redux

This project does not need Redux's ceremony. Zustand is enough for lightweight client state and keeps the stack lean.

### Tailwind CSS over Bootstrap

Tailwind matches the design system, supports the glassy premium look, and avoids opinionated ERP-style UI defaults.

### shadcn/ui over Material UI

shadcn/ui gives composable, accessible primitives without heavyweight component opinions or bundle cost.

### lucide-react for icons

Lucide is already a good fit for the visual style and keeps the icon set consistent.

### Framer Motion for subtle animation

It is suitable for restrained fades, slides, and scale transitions in the login and future premium UI surfaces.

### sonner for notifications

Sonner is lightweight, modern, and a good fit for small SaaS-style toast feedback.

### date-fns for date handling

`date-fns` is a practical utility library for date formatting and comparison without the weight of older date stacks.

### exceljs for exports

`exceljs` is the single Excel library in the stack. It is better suited for workbook creation, formatting, and future report exports.

### React Query for async cache

React Query is reserved for future server-heavy screens where cache, retries, and background refresh are valuable.

### cmdk for searchable command surfaces

`cmdk` is a good fit for fast searchable pickers and command-style UX in the CRM.

### react-error-boundary

This gives a clean recovery path for client-side UI failures without hand-rolling error wrappers everywhere.

### Shared infrastructure layer

Common dependencies are now accessed through `src/shared/` so features do not import third-party libraries directly when a shared wrapper exists.

## Rejected Alternatives

### Redux

Too much ceremony for the current state of the app.

### Formik

Heavier than necessary and less aligned with the current RHF-based pattern.

### Axios

Unnecessary because the app uses server actions and native `fetch` patterns where needed.

### Moment

Deprecated style and too heavy for new work.

### Bootstrap

Conflicts with the product's premium SaaS visual direction.

### Material UI / Ant Design

Too opinionated for this design system and too visually close to a generic admin panel.

### jQuery

Not relevant for a modern Next.js app.

### React Router

Next.js App Router already handles routing.

## Notes

- The current codebase now uses `exceljs` for all workbook exports.
- `autoprefixer` was removed during the audit because Tailwind 4 no longer needs the old setup here.
- `components.json` now anchors the shadcn/ui structure for future component generation.
- `src/shared/` is the integration layer for shared providers, utilities, and reusable UI primitives.
