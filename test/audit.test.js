/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 1: audit.test.js
 * Validates syntax, module imports, callback data lengths (<= 64 bytes),
 * state routing coverage, IST date engine, and secret leak prevention.
 */

import fs from "fs";
import path from "path";
import { DEFAULT_CONTENT, formatDateIST, parseDateIST } from "../modules/helpers.js";
import { isOwner } from "../modules/security.js";

console.log("==================================================");
console.log("🧪 RUNNING SHIV YOGI ASSISTANT AUDIT & INTEGRITY SUITE");
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

// 1. JSON Configuration Validations
try {
  const content = JSON.parse(fs.readFileSync("./content.json", "utf8"));
  assert(content.version === "3.0.0", "content.json version is 3.0.0");
  assert(content.settings.timezone === "Asia/Kolkata", "content.json timezone is Asia/Kolkata");
  assert(content.settings.contact_username === "shiv_yogi_19", "content.json contact_username is shiv_yogi_19");
  assert(content.settings.owner_id === "8226363418", "content.json owner_id is 8226363418");
  assert(content.features.captcha_verification !== undefined, "content.json has captcha_verification feature");
  assert(content.features.anti_spam !== undefined, "content.json has anti_spam feature");
  assert(content.templates.daily_wallpaper !== undefined, "content.json has daily_wallpaper template");
} catch (e) {
  assert(false, `content.json parse error: ${e.message}`);
}

try {
  const cfg = JSON.parse(fs.readFileSync("./config.example.json", "utf8"));
  assert(cfg.vars.OWNER_ID === "8226363418", "config.example.json has OWNER_ID 8226363418");
  assert(cfg.kv_namespaces[0].id === "55e587063e784c8192292da4f653c7c1", "config.example.json has KV namespace ID 55e587063e784c8192292da4f653c7c1");
} catch (e) {
  assert(false, `config.example.json parse error: ${e.message}`);
}

// 2. Wrangler TOML Validation
try {
  const toml = fs.readFileSync("./wrangler.toml", "utf8");
  assert(toml.includes('name = "shiv-yogi-assistant"'), "wrangler.toml worker name is shiv-yogi-assistant");
  assert(toml.includes('binding = "BOT_DATA"'), "wrangler.toml binding is BOT_DATA");
  assert(toml.includes('id = "55e587063e784c8192292da4f653c7c1"'), "wrangler.toml has namespace ID 55e587063e784c8192292da4f653c7c1");
  assert(toml.includes('crons = ["* * * * *"]'), "wrangler.toml has 1-minute cron trigger");
} catch (e) {
  assert(false, `wrangler.toml read error: ${e.message}`);
}

// 3. Worker Code Inspection (Callback Data Length & State Actions)
const workerCode = fs.readFileSync("./worker.js", "utf8");

// Callback length checks (Telegram maximum limit is 64 bytes)
const cbMatches = [...workerCode.matchAll(/callback_data:\s*["`\x27]([^"`\x27]+)["`\x27]/g)].map(m => m[1]);
let maxLen = 0;
for (const cb of cbMatches) {
  if (cb.length > maxLen) maxLen = cb.length;
  assert(cb.length <= 64, `callback_data "${cb}" <= 64 bytes (length: ${cb.length})`);
}
console.log(`ℹ️ Audited ${cbMatches.length} callback_data instances (max length: ${maxLen} bytes).`);

// State Actions Coverage
const requiredStates = [
  "add_channel",
  "draft_channel_post",
  "schedule_draft_post",
  "add_admin",
  "remove_admin",
  "add_temp_mgr",
  "edit_message",
  "set_setting",
  "import_backup",
  "create_template",
  "search_member"
];

for (const act of requiredStates) {
  assert(workerCode.includes(`state.action === "${act}"`), `State action "${act}" handled in handleMessage()`);
}

// 4. Date & Timezone Engine (Asia/Kolkata)
const formattedDate = formatDateIST(1731300000000);
assert(formattedDate.includes("IST"), `formatDateIST outputs IST timestamp: ${formattedDate}`);

const parsedTs = parseDateIST("2026-11-15 14:30");
assert(parsedTs !== null, "parseDateIST correctly parses YYYY-MM-DD HH:mm in IST");

// 5. Owner Authorization Logic
assert(isOwner({ OWNER_ID: "8226363418" }, "8226363418"), "isOwner returns true for configured OWNER_ID");
assert(!isOwner({ OWNER_ID: "8226363418" }, "9999999999"), "isOwner returns false for unauthorized ID");

// 6. Message Keys in Default Content
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

// 7. Secret Leak Prevention Audit
const secretCheckFiles = ["./worker.js", "./content.json", "./config.example.json", "./wrangler.toml"];
for (const f of secretCheckFiles) {
  const content = fs.readFileSync(f, "utf8");
  assert(!content.includes("bot123456:ABC-DEF"), `No fake test token in ${f}`);
  assert(!/bot\d{8,12}:[A-Za-z0-9_-]{30,}/.test(content), `No live Telegram bot token embedded in ${f}`);
}

console.log("==================================================");
if (failed) {
  console.error("❌ AUDIT TEST SUITE FAILED");
  process.exit(1);
} else {
  console.log("🌟 ALL AUDIT CHECKS COMPLETED WITH 100% SUCCESS!");
  process.exit(0);
}
