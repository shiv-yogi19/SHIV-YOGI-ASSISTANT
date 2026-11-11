/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 2: integration.test.js
 * End-to-end integration tests using MockTelegramApi and MockKV.
 * Tests HTTP fetch(), webhook routing, callback state transitions,
 * group moderation, channel publishing, and cron scheduler execution.
 */

import worker from "../worker.js";
import { MockTelegramApi, MockKV } from "./fixtures/mock-telegram.js";
import { DEFAULT_CONTENT } from "../modules/helpers.js";

console.log("==================================================");
console.log("🚀 STARTING V3.0.0 INTEGRATION & E2E TEST SUITE");
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

// 1. Initialize Mock Telegram API & Mock KV Environment
const mockApi = new MockTelegramApi();
mockApi.installGlobalFetch();

const mockEnv = {
  BOT_TOKEN: "777888999:AAFakeTokenForLocalTestingOnly12345",
  WEBHOOK_SECRET: "SecretToken_XYZ_987",
  OWNER_ID: "8226363418",
  BOT_DATA: new MockKV(),
  GITHUB_CONTENT_URL: ""
};

// Seed default settings into MockKV
await mockEnv.BOT_DATA.put("settings:config", DEFAULT_CONTENT.settings);
await mockEnv.BOT_DATA.put("settings:features", DEFAULT_CONTENT.features);

// TEST 1: GET /health Returns HTTP 200
const healthReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/health", { method: "GET" });
const healthRes = await worker.fetch(healthReq, mockEnv, {});
assert(healthRes.status === 200, "GET /health returns HTTP 200");

const healthJson = await healthRes.json();
assert(healthJson.ok === true && healthJson.health.worker_status === "ACTIVE", "Health JSON reports worker_status ACTIVE");
assert(healthJson.health.kv_status === "HEALTHY", "Health JSON reports kv_status HEALTHY");
assert(healthJson.health.telegram_api_status === "CONNECTED", "Health JSON reports telegram_api_status CONNECTED");

// TEST 2: Webhook Secret Token Verification
const invalidSecretReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "WrongSecret"
  },
  body: JSON.stringify({ update_id: 100 })
});
const invalidRes = await worker.fetch(invalidSecretReq, mockEnv, {});
assert(invalidRes.status === 403, "Invalid webhook secret returns HTTP 403 Forbidden");

// TEST 3: Valid Webhook /start Command
const startUpdate = {
  update_id: 1001,
  message: {
    message_id: 50,
    from: { id: 11223344, first_name: "Aman", username: "aman_tester" },
    chat: { id: 11223344, type: "private" },
    text: "/start"
  }
};
const startReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(startUpdate)
});
const startRes = await worker.fetch(startReq, mockEnv, {});
assert(startRes.status === 200, "Valid webhook /start returns HTTP 200 OK");

// Check user was registered in KV
const registeredUser = await mockEnv.BOT_DATA.get("user:11223344", "json");
assert(registeredUser !== null && registeredUser.first_name === "Aman", "New member registered in KV");

// Check Telegram sendMessage was invoked
const sendCalls = mockApi.getCallsForMethod("sendMessage");
assert(sendCalls.length > 0, "Bot sent welcome message via Telegram API");

// TEST 4: Update Deduplication
mockApi.resetCalls();
const dupReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(startUpdate) // same update_id: 1001
});
const dupRes = await worker.fetch(dupReq, mockEnv, {});
const dupText = await dupRes.text();
assert(dupText.includes("Duplicate Skipped"), "Duplicate update_id successfully detected and skipped");
assert(mockApi.calls.length === 0, "No duplicate Telegram API calls made during dedup skip");

// TEST 5: Owner Authorization on /panel Command
const nonOwnerUpdate = {
  update_id: 1002,
  message: {
    message_id: 51,
    from: { id: 99999999, first_name: "Intruder" },
    chat: { id: 99999999, type: "private" },
    text: "/panel"
  }
};
const nonOwnerReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(nonOwnerUpdate)
});
await worker.fetch(nonOwnerReq, mockEnv, {});
const nonOwnerMsg = mockApi.getLastCall("sendMessage");
assert(nonOwnerMsg.payload.text.includes("Access Denied"), "Non-owner /panel attempt strictly rejected with Access Denied");

// TEST 6: Owner Opening /panel
mockApi.resetCalls();
const ownerUpdate = {
  update_id: 1003,
  message: {
    message_id: 52,
    from: { id: 8226363418, first_name: "Shiv Yogi" },
    chat: { id: 8226363418, type: "private" },
    text: "/panel"
  }
};
const ownerReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(ownerUpdate)
});
await worker.fetch(ownerReq, mockEnv, {});
const ownerMsg = mockApi.getLastCall("sendMessage");
assert(ownerMsg.payload.text.includes("SHIV YOGI ASSISTANT — ADVANCED CONTROL PANEL"), "Owner ID 8226363418 successfully opened /panel");
assert(ownerMsg.payload.reply_markup?.inline_keyboard?.length >= 10, "Owner panel rendered with full navigation keyboard");

// TEST 7: Feature Toggle Callback Query
const toggleCbUpdate = {
  update_id: 1004,
  callback_query: {
    id: "cb_toggle_1",
    from: { id: 8226363418 },
    message: { chat: { id: 8226363418 }, message_id: 105 },
    data: "p:ftgl:captcha_verification"
  }
};
const toggleReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(toggleCbUpdate)
});
await worker.fetch(toggleReq, mockEnv, {});
const updatedFeats = await mockEnv.BOT_DATA.get("settings:features", "json");
assert(updatedFeats.captcha_verification === true, "Callback toggle updated captcha_verification to true in KV");

// TEST 8: Anti-Flood Triggering in Group Chat
const flooderId = 556677;
const groupChatId = -1001234567890;
mockApi.resetCalls();

for (let i = 0; i < 7; i++) {
  const floodUpdate = {
    update_id: 2000 + i,
    message: {
      message_id: 200 + i,
      from: { id: flooderId, first_name: "Flooder" },
      chat: { id: groupChatId, type: "supergroup" },
      text: `Spam flood message #${i}`
    }
  };
  const floodReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify(floodUpdate)
  });
  await worker.fetch(floodReq, mockEnv, {});
}

const delCalls = mockApi.getCallsForMethod("deleteMessage");
assert(delCalls.length > 0, "Anti-flood triggered: offending message deleted");

const restrictCalls = mockApi.getCallsForMethod("restrictChatMember");
assert(restrictCalls.length > 0, "Anti-flood triggered: flooding user muted via restrictChatMember");

// TEST 9: Unauthorized Link Filtering
// Enable link filter first
const feats = await mockEnv.BOT_DATA.get("settings:features", "json");
feats.link_filter = true;
await mockEnv.BOT_DATA.put("settings:features", feats);

mockApi.resetCalls();
const linkUpdate = {
  update_id: 3001,
  message: {
    message_id: 310,
    from: { id: 778899, first_name: "Spammer" },
    chat: { id: groupChatId, type: "supergroup" },
    text: "Check out this free crypto: https://scam-site.org"
  }
};
const linkReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
  },
  body: JSON.stringify(linkUpdate)
});
await worker.fetch(linkReq, mockEnv, {});
const linkDels = mockApi.getCallsForMethod("deleteMessage");
assert(linkDels.length > 0, "Link filter caught and deleted unauthorized external link");

// TEST 10: Scheduled Post Execution via Cron Trigger
const duePost = {
  id: 888888,
  text: "🌟 Exclusive Scheduled Wallpaper Drop!",
  media_type: "text",
  media_id: null,
  channel_id: "@the_endless_playback",
  post_at: Date.now() - 5000, // Due 5 seconds ago
  pin: false,
  status: "pending",
  retries: 0
};
await mockEnv.BOT_DATA.put("chan:scheduled_list", [duePost]);

mockApi.resetCalls();
await worker.scheduled({}, mockEnv, {});

const postPubCalls = mockApi.getCallsForMethod("sendMessage");
const channelBroadcast = postPubCalls.find(c => c.payload.chat_id === "@the_endless_playback");
assert(Boolean(channelBroadcast), "Cloudflare Worker scheduled() handler successfully published due post");

const cronRun = await mockEnv.BOT_DATA.get("cron:last_run", "json");
assert(cronRun !== null && cronRun.ist.includes("IST"), "Cron execution recorded heartbeat with IST timestamp in KV");

console.log("==================================================");
console.log(`📊 INTEGRATION TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
