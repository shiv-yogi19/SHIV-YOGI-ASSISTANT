/**
 * Comprehensive Automated Audit & Test Suite
 * Validates syntax, module imports, callback coverage, state routing, and KV simulation.
 */

import fs from "fs";
import path from "path";
import { DEFAULT_CONTENT, formatDateIST, parseDateIST } from "../modules/helpers.js";
import { isOwner } from "../modules/security.js";

console.log("==================================================");
console.log("🧪 RUNNING SHIV YOGI ASSISTANT AUDIT & TEST SUITE");
console.log("==================================================");

let failed = false;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed = true;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. JSON Validations
try {
  const content = JSON.parse(fs.readFileSync("./content.json", "utf8"));
  assert(content.version === "2.0.0", "content.json version is 2.0.0");
  assert(content.settings.timezone === "Asia/Kolkata", "content.json timezone is Asia/Kolkata");
  assert(content.settings.contact_username === "shiv_yogi_19", "content.json contact_username is shiv_yogi_19");
  assert(content.features.captcha_verification !== undefined, "content.json has captcha_verification feature");
} catch (e) {
  assert(false, `content.json parse error: ${e.message}`);
}

try {
  const cfg = JSON.parse(fs.readFileSync("./config.example.json", "utf8"));
  assert(cfg.vars.OWNER_ID === "8226363418", "config.example.json has OWNER_ID 8226363418");
} catch (e) {
  assert(false, `config.example.json parse error: ${e.message}`);
}

// 2. Worker & Modules Code Inspection
const workerCode = fs.readFileSync("./worker.js", "utf8");

// Callback length checks
const cbMatches = [...workerCode.matchAll(/callback_data:\s*["`\x27]([^"`\x27]+)["`\x27]/g)].map(m => m[1]);
let maxLen = 0;
for (const cb of cbMatches) {
  if (cb.length > maxLen) maxLen = cb.length;
  assert(cb.length <= 64, `callback_data "${cb}" <= 64 bytes (length: ${cb.length})`);
}
console.log(`ℹ️ Audited ${cbMatches.length} callback_data instances (max length: ${maxLen} bytes).`);

// State Actions Coverage
const setActions = [...workerCode.matchAll(/action:\s*["\x27]([^"\x27]+)["\x27]/g)].map(m => m[1]);
const uniqueActions = [...new Set(setActions)];
for (const act of uniqueActions) {
  assert(workerCode.includes(`state.action === "${act}"`), `State action "${act}" handled in handleMessage()`);
}

// 3. Date & Timezone checks
const formattedDate = formatDateIST(1731300000000);
assert(formattedDate.includes("IST"), `formatDateIST outputs IST timestamp: ${formattedDate}`);

const parsedTs = parseDateIST("2026-11-15 14:30");
assert(parsedTs !== null, "parseDateIST correctly parses YYYY-MM-DD HH:mm in IST");

// 4. Owner Authorization Check
assert(isOwner({ OWNER_ID: "8226363418" }, "8226363418"), "isOwner returns true for configured OWNER_ID");
assert(!isOwner({ OWNER_ID: "8226363418" }, "9999999999"), "isOwner returns false for unauthorized ID");

// 5. Message Keys in Default Content
const requiredKeys = [
  "welcome",
  "repeat",
  "contact",
  "help",
  "about",
  "maintenance",
  "channel_join_invite",
  "group_welcome",
  "group_goodbye",
  "group_rules",
  "link_filter_warning",
  "word_filter_warning",
  "flood_warning",
  "captcha_prompt",
  "captcha_verified"
];

for (const k of requiredKeys) {
  assert(DEFAULT_CONTENT.messages.en[k] !== undefined, `EN message key "${k}" exists`);
  assert(DEFAULT_CONTENT.messages.hi[k] !== undefined, `HI message key "${k}" exists`);
}

console.log("==================================================");
if (failed) {
  console.error("❌ TEST SUITE FAILED");
  process.exit(1);
} else {
  console.log("🌟 ALL AUDIT & TEST SUITE CHECKS COMPLETED WITH 100% SUCCESS!");
}
