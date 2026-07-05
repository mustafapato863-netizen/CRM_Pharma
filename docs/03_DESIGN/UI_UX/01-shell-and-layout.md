# Shell and Layout

## Global App Shell

Every screen should inherit the same shell:
- Sidebar
- Top navbar
- Content canvas

The shell must remain light and airy across all pages.

## Page Order

Preferred page sequence:
1. Page Header
2. Toolbar or command row
3. Primary workspace
4. Secondary information
5. Footer or pagination

## Shared States

Every page must support:
- Loading
- Unauthorized
- Empty
- Error
- Coming soon / not implemented

These states must use the shared UI components and not unique one-off layouts.

## Responsive Behavior

- Desktop: permanent sidebar
- Laptop: same shell, tighter spacing
- Tablet: collapsible sidebar
- Mobile: overlay sidebar or drawer

Never shrink a desktop layout into a cramped mobile copy.
Recompose the layout instead.

## Tables

Tables should be:
- Reusable
- Searchable
- Sortable
- Filterable
- Pagination-ready
- Responsive

## Forms

Forms should be:
- Fast to scan
- Grouped by workflow
- Drawer-based on desktop when heavy
- Full-screen or near-full-screen on mobile

Tiny dialogs should be avoided for operational tasks.
