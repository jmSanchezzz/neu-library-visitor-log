# Admin Audit Timeline Design

**Date:** 2026-03-20

## Goal

Add a professional audit trail for administrator and security-sensitive activity so staff can review who performed important actions, who attempted restricted access, and when those events happened.

## Scope

The first release of the Admin Audit Timeline will cover:

- Admin blocks a user
- Admin unblocks a user
- Admin exports visitor reports
- Admin signs in to the dashboard
- Blocked user attempts to sign in
- Non-admin user attempts to access an admin route

This version will not include advanced notification workflows, retention rules, or edits/deletes for audit entries. Audit records are append-only.

## Current Context

The app already has:

- Firebase Authentication for login state
- Firestore-backed `users` and `visitLogs` data
- Admin dashboard, reports, and user-management pages
- Route-level admin checks in the admin layout

That makes the feature a good fit for a dedicated Firestore collection instead of overloading existing visitor logs.

## Architecture

### Storage

Create a new Firestore collection named `auditLogs`.

Each record should be append-only and shaped to support both timeline display and filtering:

```ts
type AuditCategory = "user-management" | "reports" | "security" | "auth";

type AuditLog = {
  id: string;
  type: string;
  category: AuditCategory;
  actorEmail: string;
  actorName?: string;
  targetEmail?: string;
  targetName?: string;
  details?: string;
  metadata?: Record<string, string | number | boolean | null>;
  timestamp: string;
};
```

### Responsibilities

- `store.ts` remains the place for Firestore access helpers
- a small audit helper layer should create consistent log entries
- admin pages trigger audit writes after successful actions
- auth and access-control flows write security audit entries when sensitive events occur

This keeps audit logic close to the real event source while avoiding repeated inline Firestore code across pages.

## Event Definitions

Suggested event types for the first release:

- `admin.sign_in`
- `user.blocked`
- `user.unblocked`
- `reports.export_csv`
- `security.blocked_user_login_attempt`
- `security.non_admin_admin_access_attempt`

Suggested category mapping:

- `admin.sign_in` -> `auth`
- `user.blocked` -> `user-management`
- `user.unblocked` -> `user-management`
- `reports.export_csv` -> `reports`
- `security.blocked_user_login_attempt` -> `security`
- `security.non_admin_admin_access_attempt` -> `security`

## Data Flow

### Admin-Initiated Actions

When an admin successfully performs an action such as block/unblock or CSV export:

1. the main feature action completes first
2. the app writes an audit log entry
3. if audit logging fails, the main action still stands
4. the failure is surfaced through console logging and can optionally show a non-blocking warning toast

This avoids breaking core admin work because of audit-write issues.

### Security Events

Security-related entries should be written automatically from the auth/access layer:

- when a blocked user signs in and is redirected to denied access
- when a signed-in non-admin user reaches an admin-protected route
- when an admin successfully reaches the dashboard after sign-in

This ensures the timeline reflects actual access behavior, not just button clicks.

## UI Design

Add a new admin page at `/admin/audit`.

### Page Layout

- summary cards for total audit events, security events, report exports, and user-management actions
- filter bar with category, event type, actor email, target email, and date range
- reverse-chronological table or timeline list
- exact timestamps and readable event descriptions

### Presentation

Each row should show:

- category badge
- event label
- actor
- target, if present
- concise details
- exact date and time

Security events should feel more serious through stronger badge styling.

## Filtering

First-release filters should include:

- category
- event type
- actor email text search
- date range

Target-email filtering is optional if the page starts feeling crowded, but the data model should support it.

## Error Handling

- audit logging failures must not roll back successful admin actions
- timeline page should fail gracefully with an error toast and empty-state fallback
- unknown or partially populated audit entries should still render with safe fallback labels

## Testing

The implementation should verify:

- blocking a user creates a `user.blocked` entry
- unblocking a user creates a `user.unblocked` entry
- exporting CSV creates a `reports.export_csv` entry
- blocked-user sign-in attempts create a security entry
- non-admin admin-route access attempts create a security entry
- audit timeline filters narrow results correctly

## Open Notes

- The current repo does not yet have a dedicated audit type/model file, so introducing one can help keep event names centralized.
- Because subagent review is not available in this session workflow, spec review will be handled inline before implementation planning.
