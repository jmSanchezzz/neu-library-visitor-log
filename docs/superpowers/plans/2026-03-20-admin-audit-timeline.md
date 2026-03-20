# Admin Audit Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an append-only admin audit trail that records key dashboard actions and security-sensitive access events, then expose them in a dedicated admin timeline page with filtering.

**Architecture:** Introduce a dedicated `auditLogs` Firestore collection plus a small shared audit model/helper layer so event creation stays consistent. Wire audit writes into existing admin actions and auth/access-control flows, then render the entries in a new `/admin/audit` page with summary cards and filters.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Firebase Firestore/Auth, shadcn/ui, date-fns, Node test/TypeScript compile workflow already used in this repo

---

## File Structure

**Create:**
- `src/lib/audit.ts`
- `src/app/admin/audit/page.tsx`
- `tests/audit.test.ts`
- `tests/audit-filters.test.ts`

**Modify:**
- `src/lib/store.ts`
- `src/app/admin/users/page.tsx`
- `src/app/admin/reports/page.tsx`
- `src/components/layout/AdminLayout.tsx`

**Responsibilities:**
- `src/lib/audit.ts`: audit event types, categories, display helpers, filter helpers
- `src/lib/store.ts`: Firestore read/write helpers for `auditLogs` and audit write entry points
- `src/app/admin/users/page.tsx`: create block/unblock audit events
- `src/app/admin/reports/page.tsx`: create CSV export audit events
- `src/components/layout/AdminLayout.tsx`: create non-admin access and admin sign-in audit events, add nav entry
- `src/app/admin/audit/page.tsx`: render summary cards, filters, and timeline/table
- `tests/audit.test.ts`: audit model/event helper tests
- `tests/audit-filters.test.ts`: filter and summary calculation tests

### Task 1: Add Shared Audit Model And Event Definitions

**Files:**
- Create: `src/lib/audit.ts`
- Test: `tests/audit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  AUDIT_EVENT_TYPES,
  getAuditCategoryForType,
  formatAuditEventLabel
} from "../src/lib/audit";

test("maps security.blocked_user_login_attempt to the security category", () => {
  assert.equal(getAuditCategoryForType("security.blocked_user_login_attempt"), "security");
});

test("formats report export events into readable labels", () => {
  assert.equal(formatAuditEventLabel("reports.export_csv"), "CSV Report Export");
});

test("exposes the required first-release audit event types", () => {
  assert.equal(AUDIT_EVENT_TYPES.includes("user.blocked"), true);
  assert.equal(AUDIT_EVENT_TYPES.includes("user.unblocked"), true);
  assert.equal(AUDIT_EVENT_TYPES.includes("admin.sign_in"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit.test.ts src/lib/audit.ts`

Expected: FAIL with `File 'src/lib/audit.ts' not found` or missing export errors.

- [ ] **Step 3: Write minimal implementation**

```ts
export const AUDIT_EVENT_TYPES = [
  "admin.sign_in",
  "user.blocked",
  "user.unblocked",
  "reports.export_csv",
  "security.blocked_user_login_attempt",
  "security.non_admin_admin_access_attempt"
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];
export type AuditCategory = "auth" | "user-management" | "reports" | "security";

const CATEGORY_BY_TYPE: Record<AuditEventType, AuditCategory> = {
  "admin.sign_in": "auth",
  "user.blocked": "user-management",
  "user.unblocked": "user-management",
  "reports.export_csv": "reports",
  "security.blocked_user_login_attempt": "security",
  "security.non_admin_admin_access_attempt": "security"
};

const LABEL_BY_TYPE: Record<AuditEventType, string> = {
  "admin.sign_in": "Admin Sign-In",
  "user.blocked": "User Blocked",
  "user.unblocked": "User Unblocked",
  "reports.export_csv": "CSV Report Export",
  "security.blocked_user_login_attempt": "Blocked User Login Attempt",
  "security.non_admin_admin_access_attempt": "Non-Admin Access Attempt"
};

export function getAuditCategoryForType(type: AuditEventType): AuditCategory {
  return CATEGORY_BY_TYPE[type];
}

export function formatAuditEventLabel(type: AuditEventType): string {
  return LABEL_BY_TYPE[type];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
- `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit.test.ts src/lib/audit.ts`
- `node .tmp-tests/tests/audit.test.js`

Expected: PASS with all subtests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/audit.ts tests/audit.test.ts
git commit -m "feat: add audit event definitions"
```

### Task 2: Add Firestore Audit Log Read/Write Helpers

**Files:**
- Modify: `src/lib/store.ts`
- Modify: `src/lib/audit.ts`
- Test: `tests/audit.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify:
- creating an audit input resolves the correct category from the event type
- audit entries always receive an ISO timestamp when persisted payload is built

```ts
import { buildAuditLogInput } from "../src/lib/audit";

test("builds an audit payload with derived category and timestamp", () => {
  const entry = buildAuditLogInput({
    type: "user.blocked",
    actorEmail: "admin@neu.edu.ph",
    targetEmail: "student@neu.edu.ph"
  });

  assert.equal(entry.category, "user-management");
  assert.equal(typeof entry.timestamp, "string");
  assert.equal(entry.targetEmail, "student@neu.edu.ph");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
- `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit.test.ts src/lib/audit.ts`
- `node .tmp-tests/tests/audit.test.js`

Expected: FAIL with missing `buildAuditLogInput` or assertion failure.

- [ ] **Step 3: Write minimal implementation**

Add to `src/lib/audit.ts`:

```ts
export type AuditLog = {
  id: string;
  type: AuditEventType;
  category: AuditCategory;
  actorEmail: string;
  actorName?: string;
  targetEmail?: string;
  targetName?: string;
  details?: string;
  metadata?: Record<string, string | number | boolean | null>;
  timestamp: string;
};

export type AuditLogInput = Omit<AuditLog, "id" | "category" | "timestamp"> & {
  timestamp?: string;
};

export function buildAuditLogInput(input: AuditLogInput) {
  return {
    ...input,
    category: getAuditCategoryForType(input.type),
    timestamp: input.timestamp ?? new Date().toISOString()
  };
}
```

Add to `src/lib/store.ts`:

```ts
import { AuditLog, AuditLogInput, buildAuditLogInput } from "./audit";

logAuditEvent: async (input: AuditLogInput) => {
  const auditCol = collection(db, "auditLogs");
  const payload = buildAuditLogInput(input);
  const docRef = await withTimeout(addDoc(auditCol, payload), 10000);
  return { id: docRef.id, ...payload } as AuditLog;
},
getAuditLogs: async (): Promise<AuditLog[]> => {
  const auditCol = collection(db, "auditLogs");
  const q = query(auditCol, orderBy("timestamp", "desc"));
  const snapshot = await withTimeout(getDocs(q), 10000);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
},
```

- [ ] **Step 4: Run test to verify it passes**

Run:
- `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit.test.ts src/lib/audit.ts`
- `node .tmp-tests/tests/audit.test.js`

Expected: PASS with all audit helper tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/audit.ts src/lib/store.ts tests/audit.test.ts
git commit -m "feat: add audit log storage helpers"
```

### Task 3: Audit User Access Management Events

**Files:**
- Modify: `src/app/admin/users/page.tsx`
- Modify: `src/lib/store.ts`
- Test: `tests/audit.test.ts`

- [ ] **Step 1: Write the failing test**

Add a pure helper test for describing block/unblock actions so the UI can produce stable audit text without inline duplication.

```ts
import { describeUserAccessAuditAction } from "../src/lib/audit";

test("describes a block action for the timeline", () => {
  assert.equal(
    describeUserAccessAuditAction(true),
    "Admin blocked a user account"
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run the same compile-and-node test flow for `tests/audit.test.ts`.

Expected: FAIL with missing helper export.

- [ ] **Step 3: Write minimal implementation**

Add helper:

```ts
export function describeUserAccessAuditAction(isBlocked: boolean): string {
  return isBlocked ? "Admin blocked a user account" : "Admin unblocked a user account";
}
```

Update `src/app/admin/users/page.tsx` so after `await mockStore.saveUser(updatedUser);` it calls:

```ts
await mockStore.logAuditEvent({
  type: updatedUser.isBlocked ? "user.blocked" : "user.unblocked",
  actorEmail: adminUser.email,
  actorName: adminUser.name,
  targetEmail: updatedUser.email,
  targetName: updatedUser.name,
  details: describeUserAccessAuditAction(updatedUser.isBlocked)
});
```

Also make the page load the current admin user once via `mockStore.getCurrentUser()` and skip writing if unavailable.

- [ ] **Step 4: Run test to verify it passes**

Run the audit helper test flow and then run `npm run typecheck`.

Expected: PASS with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/users/page.tsx src/lib/audit.ts tests/audit.test.ts src/lib/store.ts
git commit -m "feat: audit user access changes"
```

### Task 4: Audit Report Exports

**Files:**
- Modify: `src/app/admin/reports/page.tsx`
- Modify: `src/lib/audit.ts`
- Test: `tests/audit.test.ts`

- [ ] **Step 1: Write the failing test**

Add a helper test for report export details:

```ts
import { buildReportExportAuditDetails } from "../src/lib/audit";

test("includes filtered record count in export audit details", () => {
  assert.equal(
    buildReportExportAuditDetails(18),
    "Exported CSV report with 18 records"
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run the same compile-and-node test flow.

Expected: FAIL with missing export.

- [ ] **Step 3: Write minimal implementation**

Add helper:

```ts
export function buildReportExportAuditDetails(recordCount: number): string {
  return `Exported CSV report with ${recordCount} records`;
}
```

Update `exportToCSV` in `src/app/admin/reports/page.tsx` to call `mockStore.logAuditEvent` after the download link is triggered:

```ts
const currentAdmin = mockStore.getCurrentUser();
if (currentAdmin?.role === "Admin") {
  void mockStore.logAuditEvent({
    type: "reports.export_csv",
    actorEmail: currentAdmin.email,
    actorName: currentAdmin.name,
    details: buildReportExportAuditDetails(filteredLogs.length),
    metadata: { recordCount: filteredLogs.length }
  });
}
```

Use `void` plus `catch` logging if you want export success to remain non-blocking.

- [ ] **Step 4: Run test to verify it passes**

Run the audit helper tests and `npm run typecheck`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/reports/page.tsx src/lib/audit.ts tests/audit.test.ts
git commit -m "feat: audit report exports"
```

### Task 5: Audit Admin Sign-In And Unauthorized Admin Access

**Files:**
- Modify: `src/components/layout/AdminLayout.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/lib/audit.ts`
- Test: `tests/audit.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests for simple guard helpers:

```ts
import {
  shouldLogAdminSignIn,
  shouldLogUnauthorizedAdminAccess
} from "../src/lib/audit";

test("logs admin sign-in only when an admin reaches the admin area", () => {
  assert.equal(shouldLogAdminSignIn("Admin", "/admin/dashboard"), true);
  assert.equal(shouldLogAdminSignIn("Student", "/admin/dashboard"), false);
});

test("logs unauthorized admin access for signed-in non-admin users", () => {
  assert.equal(shouldLogUnauthorizedAdminAccess("Student", "/admin/users"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run the same compile-and-node test flow.

Expected: FAIL with missing helper exports.

- [ ] **Step 3: Write minimal implementation**

Add helpers:

```ts
export function shouldLogAdminSignIn(role: string, pathname: string): boolean {
  return role === "Admin" && pathname.startsWith("/admin");
}

export function shouldLogUnauthorizedAdminAccess(role: string, pathname: string): boolean {
  return role !== "Admin" && pathname.startsWith("/admin");
}
```

Update `src/components/layout/AdminLayout.tsx`:
- add a new nav item for `/admin/audit`
- track whether the current page load already logged `admin.sign_in`
- when a non-admin user hits the layout, write `security.non_admin_admin_access_attempt` before redirecting
- when an admin first lands in the layout, write `admin.sign_in` once per mount

Update `src/app/login/page.tsx`:
- when a blocked user is detected after sign-in, write `security.blocked_user_login_attempt`
- include actor/target details from the blocked user record

- [ ] **Step 4: Run test to verify it passes**

Run the audit helper tests and `npm run typecheck`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AdminLayout.tsx src/app/login/page.tsx src/lib/audit.ts tests/audit.test.ts
git commit -m "feat: audit admin access events"
```

### Task 6: Add Audit Filtering And Summary Helpers

**Files:**
- Modify: `src/lib/audit.ts`
- Test: `tests/audit-filters.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  filterAuditLogs,
  summarizeAuditLogs
} from "../src/lib/audit";

const logs = [
  {
    id: "1",
    type: "user.blocked",
    category: "user-management",
    actorEmail: "admin@neu.edu.ph",
    timestamp: "2026-03-20T08:00:00.000Z"
  },
  {
    id: "2",
    type: "security.blocked_user_login_attempt",
    category: "security",
    actorEmail: "student@neu.edu.ph",
    timestamp: "2026-03-20T09:00:00.000Z"
  }
];

test("filters audit logs by category and actor search", () => {
  const result = filterAuditLogs(logs, {
    category: "security",
    actorSearch: "student"
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "2");
});

test("summarizes counts by key audit categories", () => {
  const summary = summarizeAuditLogs(logs);

  assert.equal(summary.total, 2);
  assert.equal(summary.security, 1);
  assert.equal(summary.userManagement, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
- `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit-filters.test.ts src/lib/audit.ts`
- `node .tmp-tests/tests/audit-filters.test.js`

Expected: FAIL with missing helper exports.

- [ ] **Step 3: Write minimal implementation**

Add to `src/lib/audit.ts`:

```ts
export function filterAuditLogs(logs: AuditLog[], filters: {
  category?: string;
  type?: string;
  actorSearch?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  // apply straightforward filtering only
}

export function summarizeAuditLogs(logs: AuditLog[]) {
  return {
    total: logs.length,
    security: logs.filter((log) => log.category === "security").length,
    reports: logs.filter((log) => log.category === "reports").length,
    userManagement: logs.filter((log) => log.category === "user-management").length
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run the compile-and-node flow for `tests/audit-filters.test.ts`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/audit.ts tests/audit-filters.test.ts
git commit -m "feat: add audit filter helpers"
```

### Task 7: Build The Admin Audit Timeline Page

**Files:**
- Create: `src/app/admin/audit/page.tsx`
- Modify: `src/components/layout/AdminLayout.tsx`
- Modify: `src/lib/store.ts`
- Modify: `src/lib/audit.ts`
- Test: `tests/audit-filters.test.ts`

- [ ] **Step 1: Write the failing test**

Expand `tests/audit-filters.test.ts` to cover display-oriented helper output used by the page, such as badge tone or empty-state summary text.

```ts
import { getAuditCategoryBadgeClass } from "../src/lib/audit";

test("uses stronger styling for security events", () => {
  assert.match(getAuditCategoryBadgeClass("security"), /destructive|red|amber/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run the audit filter compile-and-node flow.

Expected: FAIL with missing helper export.

- [ ] **Step 3: Write minimal implementation**

Implement the page with:
- `useEffect` fetch from `mockStore.getAuditLogs()`
- local filter state
- summary cards from `summarizeAuditLogs`
- filtered display from `filterAuditLogs`
- table columns for timestamp, category, event label, actor, target, details
- empty state when no entries match

Also add a nav item in `AdminLayout`:

```ts
{ label: "Audit Timeline", icon: Shield, href: "/admin/audit" }
```

Keep the first release simple and consistent with the current admin visual style.

- [ ] **Step 4: Run test to verify it passes**

Run:
- audit helper test flow
- audit filter test flow
- `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/audit/page.tsx src/components/layout/AdminLayout.tsx src/lib/audit.ts src/lib/store.ts tests/audit-filters.test.ts
git commit -m "feat: add admin audit timeline page"
```

### Task 8: Final Verification And Cleanup

**Files:**
- Modify: any touched files only if verification exposes issues

- [ ] **Step 1: Run the focused audit tests**

Run:
- `node "C:\Users\Sanchez\Documents\Projects\neu-library-visitor-log\node_modules\typescript\bin\tsc" --module commonjs --target es2020 --moduleResolution node --esModuleInterop --outDir .tmp-tests tests/audit.test.ts tests/audit-filters.test.ts src/lib/audit.ts`
- `node .tmp-tests/tests/audit.test.js`
- `node .tmp-tests/tests/audit-filters.test.js`

Expected: PASS with all subtests green.

- [ ] **Step 2: Run the project typecheck**

Run: `npm run typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Remove temporary compiled test artifacts**

Run: `Remove-Item -Recurse -Force '.tmp-tests'`

Expected: `.tmp-tests` no longer exists.

- [ ] **Step 4: Review the spec against the finished diff**

Check that the implementation covers:
- append-only `auditLogs`
- block/unblock audit events
- CSV export audit event
- blocked-user login attempt audit event
- non-admin admin access audit event
- admin sign-in audit event
- `/admin/audit` page with summary cards and filters

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/audit/page.tsx src/components/layout/AdminLayout.tsx src/lib/audit.ts src/lib/store.ts src/app/admin/users/page.tsx src/app/admin/reports/page.tsx src/app/login/page.tsx tests/audit.test.ts tests/audit-filters.test.ts
git commit -m "feat: add admin audit timeline"
```

## Inline Review Notes

Because subagent review is not authorized in this session, perform plan review inline before execution:

- verify each task maps cleanly to the approved spec
- keep audit writes non-blocking for successful admin actions
- avoid duplicate sign-in audit entries from repeated auth-state callbacks
- keep timeline filtering logic in shared helpers instead of burying it in the page component
