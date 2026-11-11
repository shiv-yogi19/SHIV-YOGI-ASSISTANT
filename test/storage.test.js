/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 6: storage.test.js
 * Validates Cloudflare KV storage resilience: safe getters/setters,
 * malformed JSON handling, backup creation & strict schema validation,
 * credential stripping on import, and statistics metrics counters.
 */

import {
  safeKvGet,
  safeKvPut,
  safeKvDelete,
  safeKvList,
  DEFAULT_CONTENT
} from "../modules/helpers.js";
import {
  createFullBackup,
  validateBackupSchema,
  restoreBackup,
  getBackupHistory
} from "../modules/backup.js";
import {
  getStats,
  incrementStat,
  getDailyStats,
  exportAnalyticsJSON
} from "../modules/statistics.js";
import { MockKV } from "./fixtures/mock-telegram.js";

console.log("==================================================");
console.log("💾 STARTING KV STORAGE & BACKUP VALIDATION TEST SUITE");
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
  BOT_TOKEN: "777888999:AAFakeTokenForLocalTestingOnly12345",
  WEBHOOK_SECRET: "SecretToken_XYZ_987",
  BOT_DATA: new MockKV()
};

// Seed initial settings
await safeKvPut(env, "settings:config", DEFAULT_CONTENT.settings);
await safeKvPut(env, "settings:features", DEFAULT_CONTENT.features);

// 1. Safe KV Operations
await safeKvPut(env, "test:key1", { hello: "world" });
const readJson = await safeKvGet(env, "test:key1", "json");
assert(readJson !== null && readJson.hello === "world", "safeKvPut and safeKvGet correctly serialized and parsed JSON");

const missing = await safeKvGet(env, "non:existent:key", "json");
assert(missing === null, "safeKvGet gracefully returns null for nonexistent keys");

// Test malformed JSON resilience
await env.BOT_DATA.put("corrupt:key", "{ this is not valid json }");
const corruptResult = await safeKvGet(env, "corrupt:key", "json");
assert(corruptResult === null, "safeKvGet safely catches JSON syntax errors and returns null");

// Delete
await safeKvDelete(env, "test:key1");
const deletedRead = await safeKvGet(env, "test:key1");
assert(deletedRead === null, "safeKvDelete successfully removed key from KV");

// 2. Backup Creation & Integrity
const backupJson = await createFullBackup(env);
const parsedBackup = JSON.parse(backupJson);

assert(parsedBackup.version === "3.0.0", "Backup schema contains version 3.0.0");
assert(Boolean(parsedBackup.settings), "Backup includes settings payload");
assert(Boolean(parsedBackup.features), "Backup includes features payload");
assert(parsedBackup.BOT_TOKEN === undefined, "Backup NEVER includes BOT_TOKEN");
assert(parsedBackup.WEBHOOK_SECRET === undefined, "Backup NEVER includes WEBHOOK_SECRET");

// 3. Backup Schema Validation
const validCheck = validateBackupSchema(parsedBackup);
assert(validCheck.valid === true, "validateBackupSchema accepts generated backup");

// Incompatible version rejection
const incompatible = { version: "9.9.9", settings: {} };
const incompCheck = validateBackupSchema(incompatible);
assert(!incompCheck.valid && incompCheck.error.includes("Incompatible"), "validateBackupSchema rejects incompatible version 9.9.9");

// Malicious credential injection attempt during restore
const hostilePayload = {
  version: "3.0.0",
  BOT_TOKEN: "HACKER_ATTEMPTED_TOKEN",
  WEBHOOK_SECRET: "HACKER_SECRET",
  settings: { owner_name: "Shiv Yogi Restored" }
};
const hostileCheck = validateBackupSchema(hostilePayload);
assert(hostileCheck.valid === true, "validateBackupSchema proceeds after sanitizing");
assert(hostileCheck.sanitized.BOT_TOKEN === undefined, "Sanitizer stripped hostile BOT_TOKEN");
assert(hostileCheck.sanitized.WEBHOOK_SECRET === undefined, "Sanitizer stripped hostile WEBHOOK_SECRET");

// 4. Backup Restoration Execution
const restoreRes = await restoreBackup(env, JSON.stringify(hostilePayload), "owner_test");
assert(restoreRes.ok === true, "restoreBackup completed successfully");

const updatedSettings = await safeKvGet(env, "settings:config", "json");
assert(updatedSettings.owner_name === "Shiv Yogi Restored", "Restored settings reflected in KV");

const backupLogs = await getBackupHistory(env);
assert(backupLogs.length > 0, "Backup restoration recorded in audit history");

// 5. Statistics Counters and Reporting
await incrementStat(env, "messages_processed", 5);
await incrementStat(env, "commands_used", 2);

const stats = await getStats(env);
assert(stats.messages_processed >= 5, "Statistics counter correctly incremented messages_processed");
assert(stats.commands_used >= 2, "Statistics counter correctly incremented commands_used");

const daily = await getDailyStats(env);
assert(daily.stats.messages_processed >= 5, "Daily stats bucket correctly recorded today's messages");

const analyticsExport = await exportAnalyticsJSON(env);
const parsedAnalytics = JSON.parse(analyticsExport);
assert(parsedAnalytics.system === "SHIV YOGI ASSISTANT V3.0.0", "exportAnalyticsJSON includes system identity");
assert(parsedAnalytics.all_time_metrics.messages_processed >= 5, "exportAnalyticsJSON accurately outputs metrics");

console.log("==================================================");
console.log(`📊 STORAGE & BACKUP TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
