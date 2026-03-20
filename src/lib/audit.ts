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

export type AuditLogInput = Omit<AuditLog, "id" | "category" | "timestamp">;

export type AuditLogFilters = {
  category?: string;
  type?: string;
  actorSearch?: string;
  startDate?: Date;
  endDate?: Date;
};

const CATEGORY_BY_TYPE: Record<AuditEventType, AuditCategory> = {
  "admin.sign_in": "auth",
  "user.blocked": "user-management",
  "user.unblocked": "user-management",
  "reports.export_csv": "reports",
  "security.blocked_user_login_attempt": "security",
  "security.non_admin_admin_access_attempt": "security"
};

const LABEL_BY_TYPE: Record<AuditEventType, string> = {
  "admin.sign_in": "Admin Sign In",
  "user.blocked": "User Blocked",
  "user.unblocked": "User Unblocked",
  "reports.export_csv": "CSV Report Export",
  "security.blocked_user_login_attempt": "Blocked User Login Attempt",
  "security.non_admin_admin_access_attempt": "Non-Admin Admin Access Attempt"
};

export function getAuditCategoryForType(type: AuditEventType): AuditCategory {
  return CATEGORY_BY_TYPE[type];
}

export function formatAuditEventLabel(type: AuditEventType): string {
  return LABEL_BY_TYPE[type];
}

export function buildAuditLogInput(input: AuditLogInput): Omit<AuditLog, "id" | "timestamp"> {
  return {
    ...input,
    category: getAuditCategoryForType(input.type)
  };
}

export function describeUserAccessAuditAction(isBlocked: boolean): string {
  return isBlocked
    ? "Admin blocked a user account"
    : "Admin unblocked a user account";
}

export function buildReportExportAuditDetails(recordCount: number): string {
  return `Exported CSV report with ${recordCount} records`;
}

export function shouldLogAdminSignIn(role: string, pathname: string): boolean {
  return role === "Admin" && pathname.startsWith("/admin");
}

export function shouldLogUnauthorizedAdminAccess(role: string, pathname: string): boolean {
  return role !== "Admin" && pathname.startsWith("/admin");
}

export function filterAuditLogs(logs: AuditLog[], filters: AuditLogFilters): AuditLog[] {
  return logs.filter((log) => {
    if (filters.category && filters.category !== "all" && log.category !== filters.category) {
      return false;
    }

    if (filters.type && filters.type !== "all" && log.type !== filters.type) {
      return false;
    }

    if (
      filters.actorSearch &&
      !log.actorEmail.toLowerCase().includes(filters.actorSearch.toLowerCase())
    ) {
      return false;
    }

    const logDate = new Date(log.timestamp);
    if (filters.startDate && logDate < filters.startDate) {
      return false;
    }

    if (filters.endDate && logDate > filters.endDate) {
      return false;
    }

    return true;
  });
}

export function summarizeAuditLogs(logs: AuditLog[]) {
  return {
    total: logs.length,
    security: logs.filter((log) => log.category === "security").length,
    reports: logs.filter((log) => log.category === "reports").length,
    userManagement: logs.filter((log) => log.category === "user-management").length
  };
}

export function getAuditCategoryBadgeClass(category: AuditCategory): string {
  if (category === "security") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (category === "reports") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (category === "user-management") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}
