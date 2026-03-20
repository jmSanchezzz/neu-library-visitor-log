import test from "node:test";
import assert from "node:assert/strict";

import {
  LOGIN_PERSISTENCE,
  isAdminEmail,
  shouldClearExistingAuthOnLoginRoute
} from "../src/lib/auth-policy";

test("treats jcesperanza@neu.edu.ph as an admin email", () => {
  assert.equal(isAdminEmail("jcesperanza@neu.edu.ph"), true);
});

test("uses session auth persistence for fresh login behavior", () => {
  assert.equal(LOGIN_PERSISTENCE, "session");
});

test("clears existing auth state when the login route opens", () => {
  assert.equal(shouldClearExistingAuthOnLoginRoute(), true);
});
