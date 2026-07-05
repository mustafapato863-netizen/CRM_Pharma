# Authentication and Permission-Based Access

## Purpose

This document defines the implementation plan for authentication and authorization in the Pharmacy CRM MVP.

The system uses Auth.js for login and session management, and it uses permission-based access control stored on the user record as JSON.

## Goals

- Support username and password login.
- Keep the permission model simple.
- Remove roles entirely.
- Use permissions to control sidebar visibility, route access, and Server Actions.
- Keep the solution aligned with the MVP and the one-entry rule.

## Authentication Model

### Login Method

- Auth.js handles authentication.
- Users sign in with username and password.
- The login form is the only place where credentials are entered.
- After sign-in, the session should carry the minimal user identity and permission data needed by the app.

### Session Behavior

- Sessions should identify the current user.
- Sessions should expose the user's permissions for UI rendering and access checks.
- Sessions should not duplicate business data.
- Sessions should not become a second source of truth for inventory or ledger data.

### Password Handling

- Passwords must be hashed before storage.
- Plain passwords must never be stored.
- Password verification should happen only during sign-in.

## Permission Model

### Principle

Permissions are stored as JSON on the `User` record.

The app should read permissions once and reuse them consistently for:

- sidebar visibility
- route guards
- Server Action guards
- page-level access decisions

### Recommended Permission Keys

Use a small fixed set of permission keys:

- `dashboard`
- `products`
- `batchView`
- `batchCreate`
- `batchEdit`
- `batchDelete`
- `stock`
- `parties`
- `partiesExport`
- `stockInView`
- `stockInCreate`
- `stockOutView`
- `stockOutCreate`
- `stockMovementsView` and `stockMovementsExport` are not separate keys in the current MVP; the inventory movement sheet reuses `reports`.
- `ledger`
- `reports`
- `expiryAlerts`
- `users`
- `settings`
- `backupExport`

### Rule

No roles should be introduced.

Each user gets only the permissions they need.

## Access Control Rules

### Sidebar Visibility

- Show only the navigation items allowed by the current user's permissions.
- Hide items the user cannot access.
- Do not rely on the sidebar for security.

### Route Protection

- Every protected route must validate permissions on the server.
- If a user lacks permission, deny the request before rendering sensitive data.
- Client-side hiding is only a convenience layer.

### Server Actions

- Every mutating Server Action must check the user's permission before writing data.
- Permission checks must happen before validation-heavy work when possible.
- Unauthorized requests should fail cleanly and predictably.

## Permission Mapping by Module

| Module | Permission |
| --- | --- |
| Dashboard | `dashboard` |
| Products | `products` |
| Batches | `batchView`, `batchCreate`, `batchEdit`, `batchDelete` |
| Stock | `stock` |
| Stock IN | `stockInView`, `stockInCreate` |
| Stock OUT | `stockOutView`, `stockOutCreate` |
| Inventory Movements | `reports` (reused permission) |
| Parties | `parties` |
| Parties Export | `partiesExport` |
| Ledger | `ledger` |
| Reports | `reports` |
| Expiry Alerts | `expiryAlerts` |
| Users | `users` |
| Settings | `settings` |
| Backup | `backupExport` |

## Recommended Permission Objects

Use JSON arrays or JSON objects consistently. The exact storage format should be chosen once and reused everywhere.

### Owner

```json
{
  "dashboard": true,
  "products": true,
  "batchView": true,
  "batchCreate": true,
  "batchEdit": true,
  "batchDelete": true,
  "stock": true,
  "parties": true,
  "partiesExport": true,
  "stockInView": true,
  "stockInCreate": true,
  "stockOutView": true,
  "stockOutCreate": true,
  "ledger": true,
  "reports": true,
  "expiryAlerts": true,
  "users": true,
  "settings": true,
  "backupExport": true
}
```

### Partner

```json
{
  "dashboard": true,
  "products": true,
  "batchView": true,
  "batchCreate": true,
  "batchEdit": true,
  "batchDelete": true,
  "stock": true,
  "parties": true,
  "partiesExport": true,
  "stockInView": true,
  "stockInCreate": true,
  "stockOutView": true,
  "stockOutCreate": true,
  "ledger": true,
  "reports": true,
  "expiryAlerts": true,
  "users": false,
  "settings": false,
  "backupExport": false
}
```

### Stock-Only User

```json
{
  "dashboard": true,
  "products": false,
  "batchView": false,
  "batchCreate": false,
  "batchEdit": false,
  "batchDelete": false,
  "stock": true,
  "parties": false,
  "partiesExport": false,
  "stockInView": true,
  "stockInCreate": true,
  "stockOutView": true,
  "stockOutCreate": false,
  "ledger": false,
  "reports": false,
  "expiryAlerts": true,
  "users": false,
  "settings": false,
  "backupExport": false
}
```

### Viewer

```json
{
  "dashboard": true,
  "products": false,
  "batchView": false,
  "batchCreate": false,
  "batchEdit": false,
  "batchDelete": false,
  "stock": false,
  "parties": false,
  "partiesExport": false,
  "stockInView": false,
  "stockInCreate": false,
  "stockOutView": false,
  "stockOutCreate": false,
  "ledger": false,
  "reports": true,
  "expiryAlerts": true,
  "users": false,
  "settings": false,
  "backupExport": false
}
```

## Implementation Phases

### Phase 1

- Add Auth.js email/password authentication.
- Load permissions from the user record.
- Protect application routes.

### Phase 2

- Drive sidebar visibility from permissions.
- Add helper functions for route and action checks.
- Keep the permission model consistent across the app.

### Phase 3

- Wrap all mutating Server Actions with permission guards.
- Add predictable unauthorized responses.
- Keep permission evaluation centralized.

## Data Flow

1. User signs in with username and password.
2. Auth.js validates credentials.
3. The app loads the user record.
4. The app reads JSON permissions from the user.
5. The session and server checks reuse the same permission data.
6. Sidebar, routes, and Server Actions all enforce the same access model.

## Security Notes

- Never trust client-side hidden UI as a security boundary.
- Never expose password hashes to the client.
- Never store duplicate permission sources that can drift apart.
- Keep permission checks server-side for all protected operations.

## Out of Scope

- Roles.
- Role hierarchies.
- Enterprise permission matrices.
- Multi-branch access control.
- Audit-complete RBAC engines.

## Summary

The MVP uses one simple access model: a user logs in once, receives a session, and the app enforces permissions from the JSON stored on that user. That keeps the system small, avoids role complexity, and supports the one-entry rule across the entire app.

## Route and Action Checklist

- Protected routes: authenticate first, then authorize.
- Read-only users: can view only the pages granted by their permissions.
- Create actions: require the specific create permission.
- Edit actions: require the specific edit permission.
- Delete actions: require the specific delete permission.
- Export actions: require the specific export permission where applicable.
- Restore/import actions: require `backupExport` until a separate import permission exists.
- Inventory movement sheet: uses `reports` as the closest existing read/export permission.
- Unauthorized states: must use the shared `Unauthorized` component.
