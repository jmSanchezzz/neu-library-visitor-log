import { ADMIN_EMAILS } from "./constants";

export const LOGIN_PERSISTENCE = "session" as const;

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}

export function shouldClearExistingAuthOnLoginRoute(): boolean {
  return LOGIN_PERSISTENCE === "session";
}
