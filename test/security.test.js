/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 3: security.test.js
 * Validates security boundaries: Owner authorization, admin permissions,
 * temp manager automatic expiry, webhook secret token checks,
 * callback abuse detection, and HTML sanitization.
 */

import {
  isOwner,
  hasPermission,
  verifyWebhookSecret,
  detectSuspiciousCallback,
  getSecurityDiagnostics,
  logSecurityEvent,
  getSecurityLogs
} from "../modules/security.js";
import { addAdmin, addTempManager } from "../modules/admin-manager.js";
import { validateSafeHtml } from "../modules/localization.js";
import { escapeHtml } from "../modules/helpers.js";
import { MockKV } from "./fixtures/mock-telegram.js";

console.log("==================================================");
console.log("🛡 STARTING SECURITY & AUTHORIZATION TEST SUITE");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? "- " + details : ""}`);
    testsFailed++;
  }
}

const env = {
  OWNER_ID: "8226363418",
  WEBHOOK_SECRET: "SecretToken_XYZ_987",
  BOT_TOKEN: "777888999:AAFakeTokenForLocalTestingOnly12345",
  BOT_DATA: new MockKV()
};

// 1. Strict Owner Authorization
assert(isOwner(env, "8226363418"), "isOwner returns true for configured Owner ID");
assert(isOwner(env, 8226363418), "isOwner handles numeric user ID cleanly");
assert(!isOwner(env, "123456789"), "isOwner returns false for arbitrary user ID");
assert(!isOwner(env, null), "isOwner returns false for null user ID");
assert(!isOwner(env, ""), "isOwner returns false for empty string");

// 2. Admin Permission Verification
await addAdmin(env, 223344, { can_post_channel: true, can_moderate_group: false });
assert(await hasPermission(env, 223344, "can_post_channel"), "Admin has granted permission can_post_channel");
assert(!(await hasPermission(env, 223344, "can_moderate_group")), "Admin denied ungranted permission can_moderate_group");
assert(await hasPermission(env, "8226363418", "can_moderate_group"), "Owner inherently possesses all permissions");

// 3. Temporary Manager Expiration
// Add active manager (valid for 60 minutes)
await addTempManager(env, 334455, 60, { can_moderate_group: true });
assert(await hasPermission(env, 334455, "can_moderate_group"), "Active temp manager has can_moderate_group");

// Add expired manager (already expired 10 minutes ago)
const expiredRecord = {
  user_id: "445566",
  added_at: Date.now() - 3600000,
  expires_at: Date.now() - 600000,
  permissions: { can_moderate_group: true }
};
await env.BOT_DATA.put("temp_managers:445566", expiredRecord);
assert(!(await hasPermission(env, 445566, "can_moderate_group")), "Expired temporary manager denied permission");
const expiredInKv = await env.BOT_DATA.get("temp_managers:445566");
assert(expiredInKv === null, "Expired manager was automatically evicted from KV");

// 4. Webhook Secret Token Verification
const validReq = new Request("https://localhost/", {
  headers: { "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987" }
});
assert(verifyWebhookSecret(validReq, env), "Valid webhook secret token accepted");

const invalidReq = new Request("https://localhost/", {
  headers: { "X-Telegram-Bot-Api-Secret-Token": "WrongSecret" }
});
assert(!verifyWebhookSecret(invalidReq, env), "Invalid webhook secret token rejected");

const missingReq = new Request("https://localhost/", { headers: {} });
assert(!verifyWebhookSecret(missingReq, env), "Missing webhook secret token rejected");

// 5. Suspicious Callback Detection
assert(await detectSuspiciousCallback(env, "999999", "p:settings"), "Non-owner attempting p:settings detected as suspicious");
assert(await detectSuspiciousCallback(env, "8226363418", "a".repeat(70)), "Callback data exceeding 64 bytes detected as suspicious");
assert(!(await detectSuspiciousCallback(env, "8226363418", "p:settings")), "Valid Owner p:settings callback accepted");

// 6. HTML Escaping and Validation
const rawDangerous = "<script>alert('xss')</script><b>Hello</b>";
const checkDisallowed = validateSafeHtml(rawDangerous);
assert(!checkDisallowed.valid, "validateSafeHtml strictly rejects <script> tags");

const validTelegramHtml = "<b>Bold</b> <i>Italic</i> <code>Code</code> <a href=\"https://t.me\">Link</a>";
const checkValid = validateSafeHtml(validTelegramHtml);
assert(checkValid.valid, "validateSafeHtml accepts valid Telegram HTML tags");

const unclosedHtml = "<b>Unclosed tag";
const checkUnclosed = validateSafeHtml(unclosedHtml);
assert(!checkUnclosed.valid, "validateSafeHtml rejects unclosed HTML tag");

// 7. Security Diagnostics (Zero Credential Leakage)
const diag = await getSecurityDiagnostics(env);
assert(diag.bot_token_configured === true, "Diagnostics indicates bot token is present");
assert(diag.webhook_secret_configured === true, "Diagnostics indicates webhook secret is present");
assert(!JSON.stringify(diag).includes(env.BOT_TOKEN), "Diagnostics NEVER leaks BOT_TOKEN");
assert(!JSON.stringify(diag).includes(env.WEBHOOK_SECRET), "Diagnostics NEVER leaks WEBHOOK_SECRET");

// 8. Security Event Logging
await logSecurityEvent(env, "8226363418", "test_audit_event", "Audit check passed");
const secLogs = await getSecurityLogs(env, 5);
assert(secLogs.length > 0 && secLogs[0].action === "test_audit_event", "Security events properly recorded and retrieved");

console.log("==================================================");
console.log(`📊 SECURITY TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
