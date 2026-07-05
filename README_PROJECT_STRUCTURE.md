# Project Structure Reference

## Purpose

This document explains the repository layout for the Pharmacy CRM MVP.

## Responsibilities

- Define the root folders that should exist in the project.
- Explain how application code, features, docs, Prisma, tests, and scripts are separated.
- Keep the structure small, explicit, and easy to maintain.

## What Should Be Documented Here

- Root project tree.
- `src/` feature-based architecture.
- `app/` route organization.
- `features/` module organization.
- `docs/` reference architecture.
- `prisma/` database workflow.
- `tests/` testing layout.
- `scripts/` maintenance scripts.

## Actual Project Architecture

### `src/`

Application source code for the Next.js app, shared UI, and feature modules.

### `src/features/auth/`

Authentication flows, login/logout logic, and permission helpers.

### `src/features/dashboard/`

Dashboard-specific components and data preparation.

### `src/features/products/`

Product catalog UI, forms, server actions, validation, and exports.

### `src/features/batches/`

Batch management UI, server actions, validation, quantities, and exports.

### `src/features/parties/`

Party management for customers, suppliers, combined records, and derived financial summaries/statement views.

### `src/features/stock/`

Inventory movement logic and stock entry or exit workflows.

### `src/features/ledger/`

Customer and supplier balance tracking logic.

### `src/features/invoices/`

Purchase and sales invoice workflows, invoice forms, server actions, validation, and invoice totals.

### `src/features/parties/services/`

Shared party financial helpers for derived balances, last transaction dates, and statement snapshots.

### `src/features/reports/`

Read-only reporting views and export helpers.

### `src/features/backup/`

Backup and export workflows.

### `src/features/shared/`

Reusable utilities shared across features.

### `src/app/`

Next.js App Router structure and route groups.

### `src/app/(dashboard)/purchases/`

Purchase invoice workspace route.

### `src/app/(dashboard)/sales/`

Sales invoice workspace route.

### `prisma/`

Schema, seed data, and migrations for PostgreSQL.

### `docs/`

Project, database, module, architecture, and status documentation.

### `tests/`

Future test organization for unit, integration, and end-to-end coverage.

### `scripts/`

Operational scripts such as seed helpers, backups, and maintenance tasks.
