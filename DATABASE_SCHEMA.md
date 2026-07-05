# Database Schema Reference

## Purpose

This file is the root-level reference for the MVP database model. It explains the real schema boundaries for the Pharmacy CRM and keeps the database story aligned with Prisma migrations.

## Responsibilities

- Describe the database model at a high level.
- Explain which tables belong to each business area.
- Clarify that Prisma migrations are the source of truth.
- Keep the database plan easy to find from the repository root.

## What Should Be Documented Here

- Core entities and relationships.
- Audit and lifecycle rules.
- Migration strategy.
- Indexing and uniqueness decisions.
- Rules that affect stock, balances, reports, and backup.

## Current MVP Scope

- PostgreSQL
- Prisma Schema
- Prisma Migrations
- Initial Admin Seed
- Authentication Foundation
- Permission-based access
- Products
- Batches
- Parties
- Stock Movements
- Ledger
- Reports
- Backup

## Core Entities

- Users
- Products
- Batches
- Parties
- Stock Movements
- Ledger Entries
- Backup Logs

## Business Rules

- Product Code is unique.
- Batch Number is unique per Product.
- Every stock movement references existing entities.
- Information is entered only once.
- Reports never modify data.
- Backup never modifies data.

## Notes

- This repository is not an ERP.
- There are no roles, warehouses, purchase orders, or sales orders in the MVP scope.
- The schema should only evolve when the business requires it.
