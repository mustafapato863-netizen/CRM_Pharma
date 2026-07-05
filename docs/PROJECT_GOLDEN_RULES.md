# Pharmacy CRM - Project Golden Rules

## Vision

This project is not an ERP.

This project is not a generic CRM.

It is a carefully designed Pharmacy and Medical Inventory Management System built specifically for a small business.

The goal is not to build the biggest system.

The goal is to build the best system for the business.

---

## Rule 1

### Business First

Every technical decision must solve a real business problem.

Never build features because they might be useful someday.

Only build features that the business needs today.

Design the architecture for tomorrow.

---

## Rule 2

### 80 / 20 Principle

Build the 20% of features that solve 80% of the business.

Ignore the remaining 80% until they become real business requirements.

Avoid feature creep.

Keep the MVP focused.

---

## Rule 3

### Single Source of Truth

Every piece of information must be entered exactly once.

Examples

Products

Created once.

Selected everywhere.

Batches

Created once.

Selected everywhere.

Parties

Created once.

Selected everywhere.

Stock movements

Reference existing entities only.

Never duplicate information.

---

## Rule 4

### Database is the Source of Truth

Business information lives inside the database.

Do not duplicate business data.

Do not create unnecessary copies.

Everything should reference existing records.

---

## Rule 5

### Build Infrastructure First

Always build the foundation before features.

Example

Database

Authentication

Permissions

Products

Inventory

Reports

Never start from the UI.

---

## Rule 6

### Never Rewrite

If the architecture is correct,

never redesign it.

Extend it.

Improve it.

Refactor only when there is a real business benefit.

---

## Rule 7

### Feature Isolation

Each feature owns its own business logic.

Products own product information.

Inventory owns stock quantities.

Ledger owns financial balances.

Reports never modify data.

Backup never modifies data.

Features communicate through business rules,

not by directly modifying each other's data.

---

## Rule 8

### Simple Before Smart

Choose the simplest solution that solves the problem.

Avoid unnecessary abstraction.

Avoid over-engineering.

Readable code is better than clever code.

---

## Rule 9

### Incremental Development

Develop the project in small releases.

Every release must provide real business value.

Example

v1.0

Foundation

v1.1

Inventory

v1.2

Financial

v1.3

Reports

v1.4

Backup

---

## Rule 10

### Production Ready

Every completed feature must include

Validation

Permission checks

Error handling

Loading states

Empty states

Responsive UI

Professional UX

Documentation updates

No exceptions.

---

## Rule 11

### User Experience First

Users should never type information that already exists.

Everything should be searchable.

Everything should be selectable.

Everything should be predictable.

Maximum productivity with minimum clicks.

---

## Rule 12

### Performance Matters

Avoid duplicated queries.

Avoid duplicated data.

Prefer efficient database operations.

Optimize only when necessary.

---

## Rule 13

### Design Philosophy

The interface must feel like a premium SaaS application.

Not an old ERP.

Not Bootstrap-like.

Not outdated admin panels.

Inspired by

Stripe

Linear

Raycast

Framer

Apple

Characteristics

Minimal

Professional

Light First

Glassy

Soft Shadows

Rounded

Modern

Elegant

Fast

Calm

Whitespace is a feature.

---

## Rule 14

### Consistency

Every screen should feel like part of the same product.

Buttons

Cards

Tables

Dialogs

Forms

Typography

Spacing

Animations

Everything follows the Design System.

No random UI.

---

## Rule 15

### Security First

Every feature respects permissions.

Every server action validates authorization.

Never trust the client.

---

## Rule 16

### Documentation is Part of the Feature

A feature is not complete until documentation is updated.

Update

README

SYSTEM_STATUS

DEVELOPMENT_PROGRESS

CHANGELOG

when appropriate.

---

## Rule 17

### AI Role

AI is not just a code generator.

AI acts as

Senior Software Engineer

Software Architect

Code Reviewer

UX Consultant

Database Designer

Business Analyst

AI should question poor decisions.

AI should recommend improvements.

AI should protect project quality.

---

## Rule 18

### Think Before Coding

Before writing code

Understand the business problem.

Design the workflow.

Design the data flow.

Then write code.

Never code first.

---

## Rule 19

### If It Works, Don't Rewrite It

Working code should not be rewritten simply because it can be written differently.

Only improve code when there is measurable value.

---

## Rule 20

### Golden Principle

Infrastructure First.

Business Second.

Features Third.

The stronger the foundation,

the faster every future feature will be.

---

## Rule 21

### One Responsibility -> One Library

Every dependency must have a single, clear responsibility.

Never install multiple libraries that solve the same problem.

The project should always have exactly one preferred library for each responsibility.

Examples

Validation

Zod

Forms

React Hook Form

Tables

TanStack Table

State Management

Zustand

Server Cache

React Query

Animations

Framer Motion

Icons

Lucide React

Date Utilities

date-fns

Excel Export

exceljs

Notifications

Sonner

UI Components

shadcn/ui

ORM

Prisma

Authentication

Auth.js

---

### Dependency Philosophy

Every package inside `package.json` must justify its existence.

If a dependency does not provide clear business or technical value,

remove it.

Never keep two libraries that solve the same responsibility.

Avoid dependency duplication.

Avoid dependency bloat.

Smaller projects are easier to maintain.

---

### Package Review Process

Whenever a new dependency is proposed, AI must follow this checklist.

1. Is there already a library solving this problem?

If YES

Do not install another one.

2. Is this dependency compatible with the current stack?

Next.js

React

TypeScript

Prisma

Tailwind

3. Is the package actively maintained?

4. Is the package production ready?

5. Is the package really necessary?

If the answer is NO,

do not install it.

---

### Dependency Lifecycle

Every dependency follows this workflow

Evaluate

Compare

Approve

Install

Document

Use

Review periodically

Remove if obsolete

---

### Documentation Requirement

Whenever a dependency is

Added

Removed

Replaced

The following files must be updated

DEPENDENCIES.md

PACKAGE_DECISIONS.md

CHANGELOG.md

---

### Golden Statement

Every dependency must justify its existence.

A smaller dependency tree is usually a healthier project.

Prefer quality over quantity.

One responsibility.

One library.

Always.

---

## Final Statement

This document is the constitution of the project.

Whenever there is uncertainty,

these rules take priority over implementation preferences.

Every future contribution must respect these principles.
