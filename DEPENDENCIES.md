# Dependencies

| Package | Purpose | Used In |
|----------|---------|---------|
| `@prisma/client` | Prisma runtime client | Database, auth, inventory, products, batches, parties |
| `prisma` | Prisma CLI and schema tooling | Database, migrations, seed |
| `next` | App framework | All routes |
| `react` / `react-dom` | UI runtime | All UI |
| `next-auth` | Authentication | Login, sessions |
| `@auth/prisma-adapter` | Auth.js Prisma adapter | Authentication backend |
| `@prisma/adapter-pg` | Prisma PostgreSQL adapter | Database connection |
| `pg` | PostgreSQL driver | Database connection |
| `tailwindcss` / `@tailwindcss/postcss` | Styling pipeline | All UI |
| `clsx` | Class name composition | Shared UI helpers |
| `tailwind-merge` | Tailwind class deduplication | Shared UI helpers |
| `class-variance-authority` | Variant-based component styling | UI foundation |
| `lucide-react` | Icons | App chrome, forms, actions |
| `framer-motion` | Subtle UI motion | Login and future UI polish |
| `react-hook-form` | Form state | Login, inventory, CRUD forms |
| `zod` | Validation | All forms and actions |
| `@hookform/resolvers` | RHF/Zod integration | All forms |
| `@tanstack/react-table` | Data tables | Products, batches, parties, inventory |
| `@tanstack/react-query` | Server cache / async state | Future server-heavy views |
| `zustand` | Small global state | UI and app state |
| `cmdk` | Command/search UX | Future searchable pickers |
| `sonner` | Toast notifications | UI feedback |
| `react-error-boundary` | Safe UI error handling | Client-side error boundaries |
| `date-fns` | Date utilities | Expiry, movement dates, formatting |
| `exceljs` | Excel export | Reports and exports |
| `bcrypt` | Password hashing | Authentication |
| `recharts` | Charts | Dashboard and reporting UI |
| `next-themes` | Theme switching | App chrome |

## Audit Notes

- `@prisma/client` was missing and has been added.
- `autoprefixer` was removed because the project is using Tailwind CSS 4 with `@tailwindcss/postcss`.
- `exceljs` is now the only Excel library in the stack.
- `shadcn/ui` is initialized at the configuration level via `components.json`, with `src/components/ui` reserved for generated components.
- No duplicate runtime packages were found at the top level.
- `sonner`, `date-fns`, `cmdk`, `@tanstack/react-query`, `react-error-boundary`, `clsx`, and `tailwind-merge` are now consumed through `src/shared/`.
