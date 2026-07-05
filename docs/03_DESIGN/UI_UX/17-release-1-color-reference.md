# Release 1 Color Reference

Date: 2026-07-04

This file is the color and surface reference for the Release 1 visual identity.
It is a design spec, not an implementation record.

## Reference Image

![Release 1 visual reference](/D:/Projects/CRM_Sys/UI-UX/Reference.png)

## Design Name

- Sapphire Clinical Glass

## Core Goal

- Calm premium healthcare UI
- Trustworthy operational surfaces
- Clear light and dark mode behavior
- Subtle glass only where it helps hierarchy
- Solid readable surfaces for data-heavy workflows

## Brand Palette

### Primary

- `#3957FF` - primary actions, links, active navigation
- `#2747E8` - hover / active primary state
- `#5B6DFF` - controlled highlight
- `#E9EDFF` - light selected background

### Secondary

- `#11B7A3` - secondary accent, positive emphasis
- `#099583` - hover / active secondary state
- `#DDF9F4` - soft teal background

## Semantic Colors

### Light Mode

- Success: `#0A9B72`
- Success soft: `#E7F8F2`
- Warning: `#D98912`
- Warning soft: `#FFF4DE`
- Error: `#DC3F52`
- Error soft: `#FDECEF`
- Info: `#3B82F6`
- Info soft: `#EAF3FF`
- Neutral: `#667085`
- Neutral soft: `#F2F4F7`

### Dark Mode

- Success: `#35C799`
- Warning: `#F6B84A`
- Error: `#F06C7A`
- Info: `#69A7FF`
- Neutral: `#A7B0C0`

## Light Surfaces

- App canvas: `#F5F7FC`
- Paper: `#FFFFFF`
- Subtle surface: `#F8FAFC`
- Primary text: `#111827`
- Secondary text: `#667085`
- Divider: `#E5EAF2`
- Hover: `#F0F4FF`
- Selected: `#E9EDFF`

## Dark Surfaces

- App canvas: `#0A1020`
- Paper: `#111A2D`
- Elevated surface: `#17223A`
- Subtle surface: `#10192B`
- Primary text: `#F6F8FC`
- Secondary text: `#A7B0C0`
- Divider: `#26344F`
- Hover: `rgba(91, 109, 255, 0.10)`
- Selected: `rgba(91, 109, 255, 0.18)`

## Glass Surfaces

Glass is allowed only on premium overview surfaces.

### Light Glass

- Soft white translucent surface
- Wide soft shadow
- Thin cool border
- Use on Login panel and Dashboard KPI cards

### Dark Glass

- Deep navy translucent surface
- Controlled border and shadow
- Use only where it improves hierarchy

## Gradient Rule

Gradients are accents only.

Allowed:

- Login ambient canvas
- Dashboard ambient canvas
- Small premium intro surfaces

Not allowed:

- Tables
- Dense forms
- Ledger rows
- Invoice lines
- Backup restore areas
- Destructive dialogs
- Status chips
- Primary buttons

## Status Usage

- Success: healthy, active, completed, posted
- Warning: near expiry, low stock, review needed
- Error: expired, failed, inactive, destructive warning
- Info: draft, ongoing, informational
- Neutral: metadata, supporting labels

## Geometry

- Spacing rhythm: `8px`
- Small inputs / tables: `12px` radius
- Normal cards / papers: `16px` radius
- Glass overview cards: `20px` radius
- Buttons / chips: pill or soft-rounded, not sharp

## Typography Intent

- Page titles: compact and strong
- Descriptions: short and operational
- Section headings: clear, not oversized
- Body copy: calm and readable
- Numeric values: strong and aligned

## Usage Notes

- Use theme tokens instead of page-level hardcoded colors.
- Keep operational surfaces solid.
- Do not use glass on dense transactional rows.
- Do not add a second visual language.

