# Pharmacy CRM

## Purpose

This repository contains a small internal Pharmacy CRM focused on stock, parties, balances, due payments, and expiry tracking.

## What This Repo Is For

- A lightweight business system for 2 to 3 internal users.
- A simple, maintainable codebase built with Next.js, Prisma, and PostgreSQL.
- Documentation that matches the MVP instead of an ERP.

## Reference Documents

- [Database Schema Reference](./DATABASE_SCHEMA.md)
- [Project Structure Reference](./README_PROJECT_STRUCTURE.md)
- [System Status](./SYSTEM_STATUS.md)
- [Changelog](./CHANGELOG.md)
- [Architecture Decisions](./ARCHITECTURE_DECISIONS.md)

## Current State

- Next.js foundation is installed.
- MVP documentation has been simplified.
- Phase 1 is the Prisma database foundation for the MVP entities only.
- Authentication UI now uses username + password for internal users.
- Parties now act as the single source of truth for customers, suppliers, balances, statements, and related financial activity.
- Purchase Invoices and Sales Invoices now use `parties` as the single source of truth for customer and supplier references.

## CRM Development Principles

### 1. Business First

Build only what the business needs today.

Design the architecture for tomorrow.

### 2. Single Source of Truth

Every piece of information must be entered only once.

Products are created once.

Batches are created once.

Parties are created once.

Balances are derived from ledger entries, not stored manually.

Stock movements only reference existing data.

### 3. Keep the MVP Small

Never build enterprise features before they are actually needed.

### 4. Feature Isolation

Every feature should be independent.

One feature should never directly modify another feature's business data.

Examples:

- Stock In updates inventory.
- Stock Out decreases inventory.
- Ledger manages balances.
- Reports only read data.
- Backup never modifies data.

### 5. Database Evolution

Never redesign the database.

Only extend it when the business grows.

### 6. Production Ready

Every completed feature must include:

- Validation
- Permission checks
- Loading states
- Error handling
- Empty states
- Export support when applicable

### 7. Performance

Avoid duplicated data.

Avoid unnecessary queries.

Search must be fast.

### 8. User Experience

Users should never manually type information that already exists.

Everything should be searchable.

Everything should be selectable.

### 9. Incremental Development

The project grows through versions.

Each version delivers real business value.

## Version Roadmap

### Version 1.0

Foundation

- Authentication
- Dashboard
- Products
- Batches
- Parties

### Version 1.1

Inventory

- Stock IN
- Stock OUT

### Version 1.2

Financial

- Ledger
- Customer Balances
- Supplier Balances
- Party Statements
- Party balance previews in selectors and details
- Purchase Invoices
- Sales Invoices

### Version 1.3

Reports

- Inventory Reports
- Expiry Reports
- Balance Reports

### Version 1.4

Backup

- JSON Backup
- ZIP Backup
- Excel Export

### Version 2.x

Future Features

Possible future additions:

- Barcode Printing
- Barcode Scanner
- Multi Warehouse
- Mobile Application
- Notifications

Only implement them when required by the business.
