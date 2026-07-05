# Architecture Decisions

## Core Principles

- Business First
- Single Source of Truth
- Feature Isolation
- Database Evolution
- Incremental Development
- Small MVP
- Release Early
- Improve Continuously

## Golden Rule

Any piece of information should be entered only once.

## Feature Rules

- Products own product information.
- Batches own inventory batches.
- Stock owns inventory quantities.
- Ledger owns financial balances.
- Reports never write data.
- Backup never modifies data.

## Future Strategy

- Never redesign the database.
- Only extend it.
- Never build future features before they are needed.
- Keep the codebase simple.
