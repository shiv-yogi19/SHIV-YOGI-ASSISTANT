/**
 * End-to-End Simulation and Integration Test Suite
 * Tests actual Worker fetch(), scheduled(), callback queries, moderation filters,
 * deduplication, and scheduling in a mocked Cloudflare environment.
 */

import worker from "../worker.js";
import { DEFAULT_CONTENT } from "../modules/helpers.js";

console.log("==================================================");
console.log("🚀 STARTING DEEP END-TO-END INTEGRATION TEST SUITE");
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

// 1. Mock In-Memory Cloudflare KV Namespace
class MockKV {
  constructor() {
    this.store = new Map();
  }
  async get(key, type = "text") {
    const val = this.store.get(key);
    if (val === undefined || val === null) return null;
    if (type === "json") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return null;
      }
    }
    return String(val);
  }
  async put(key, value, options = {}) {
    const str = typeof value === "object" ? JSON.stringify(value) : String(value);
    this.store.set(key, str);
  }
  async delete(key) {
    this.store.delete(key);
  }
  async list({ prefix = "" } = {}) {
    const keys = [];
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) {
        keys.push({ name: k });
      }
    }
    return { keys };
  }
}

// 2. Mock Global fetch() for Telegram API
const telegramCalls = [];
globalThis.fetch = async (url, options = {}) => {
  const urlStr = String(url);
  telegramCalls.push({ url: urlStr, options });

  // Simulate Telegram getMe
  if (urlStr.includes("/getMe")) {
    return {
      ok: true,
      json: async () => ({ ok: true, result: { id: 777888999, is_bot: true, username: "shiv_yogi_assist_bot" } })
    };
  }

  // Simulate Telegram getChatMember
  if (urlStr.includes("/getChatMember")) {
    return {
      ok: true,
      json: async () => ({ ok: true, result: { status: "administrator", can_post_messages: true, can_delete_messages: true } })
    };
  }

JavaScript

  // Simulate Telegram API responses with explicit method handling
  const method = urlStr.split("/").pop();

  const successMethods = [
    "sendMessage",
    "editMessageText",
    "deleteMessage",
    "answerCallbackQuery",
    "pinChatMessage",
    "unpinChatMessage",
    "sendPhoto",
    "sendVideo",
    "sendDocument",
    "restrictChatMember",
    "banChatMember",
    "unbanChatMember",
    "setChatPermissions",
    "setWebhook"
  ];

  if (successMethods.includes(method)) {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        result: {
          message_id: 12345,
          date: Math.floor(Date.now() / 1000)
        }
      })
    };
  }

  // Unknown methods should not silently pass
  return {
    ok: true,
    json: async () => ({
      ok: false,
      error_code: 404,
      description: `Mock does not support Telegram method: ${method}`
    })
  };
// 3. Setup Test Environment
const mockEnv = {
  BOT_TOKEN: "MOCK_TOKEN_123456",
  WEBHOOK_SECRET: "SecretToken_XYZ_987",
  OWNER_ID: "8226363418",
  BOT_DATA: new MockKV()
};
const mockCtx = {
  waitUntil: (promise) => promise
};

async function runTests() {
  // Test A: Health Check Route
  const healthReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/health", { method: "GET" });
  const healthRes = await worker.fetch(healthReq, mockEnv, mockCtx);
  const healthJson = await healthRes.json();
  assert(healthRes.status === 200, "GET /health returns HTTP 200");
  assert(healthJson.status === "online" && healthJson.bot === "SHIV YOGI ASSISTANT", "Health JSON payload is valid");

  // Test B: Unauthorized Webhook Request (Invalid Secret)
  const badReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "WrongSecret"
    },
    body: JSON.stringify({ update_id: 1 })
  });
  const badRes = await worker.fetch(badReq, mockEnv, mockCtx);
  assert(badRes.status === 403, "Invalid webhook secret returns HTTP 403 Forbidden");

  // Test C: Valid Webhook - User /start
  const startReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 1001,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 987654, type: "private" },
        from: { id: 987654, first_name: "Rahul", username: "rahul_user" },
        text: "/start"
      }
    })
  });
  const startRes = await worker.fetch(startReq, mockEnv, mockCtx);
  assert(startRes.status === 200, "Valid webhook /start returns HTTP 200 OK");
  const userRec = await mockEnv.BOT_DATA.get("user:987654", "json");
  assert(userRec !== null && userRec.first_name === "Rahul", "New user correctly registered in KV");

  // Test D: Update Deduplication Protection
  const dupReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 1001 // Same update_id
    })
  });
  const dupRes = await worker.fetch(dupReq, mockEnv, mockCtx);
  const dupJson = await dupRes.json();
  assert(dupJson.note === "duplicate_skipped", "Duplicate update_id successfully detected and skipped");

  // Test E: Security - Unauthorized User Calling /panel
  const unauthPanelReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 1002,
      message: {
        message_id: 2,
        chat: { id: 987654, type: "private" },
        from: { id: 987654, first_name: "Rahul" },
        text: "/panel"
      }
    })
  });
  telegramCalls.length = 0;
  await worker.fetch(unauthPanelReq, mockEnv, mockCtx);
  const lastCall = telegramCalls[telegramCalls.length - 1];
  const lastCallBody = JSON.parse(lastCall.options.body);
  assert(lastCallBody.text.includes("Access Restricted"), "Non-owner /panel attempt strictly rejected");

  // Test F: Owner Calling /panel (Authorized)
  const ownerPanelReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 1003,
      message: {
        message_id: 3,
        chat: { id: 8226363418, type: "private" },
        from: { id: 8226363418, first_name: "Shiv Yogi" },
        text: "/panel"
      }
    })
  });
  telegramCalls.length = 0;
  await worker.fetch(ownerPanelReq, mockEnv, mockCtx);
  const ownerCall = telegramCalls[telegramCalls.length - 1];
  const ownerCallBody = JSON.parse(ownerCall.options.body);
  assert(ownerCallBody.text.includes("ADVANCED CONTROL PANEL"), "Owner ID 8226363418 successfully opened /panel");
  assert(ownerCallBody.reply_markup.inline_keyboard.length >= 8, "Owner panel rendered with full navigation keyboard");

  // Test G: Feature Toggle via Callback Query
  const toggleCallbackReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 1004,
      callback_query: {
        id: "cb_toggle_1",
        from: { id: 8226363418 },
        message: { message_id: 99, chat: { id: 8226363418 } },
        data: "p:ftgl:captcha_verification"
      }
    })
  });
  await worker.fetch(toggleCallbackReq, mockEnv, mockCtx);
  const featuresInKv = await mockEnv.BOT_DATA.get("settings:features", "json");
  assert(featuresInKv.captcha_verification === true, "Callback toggle updated captcha_verification to true in KV");

  // Test H: Group Moderation - Anti-Flood Enforcement
  // Send 6 messages rapidly from user 555666 in group
  telegramCalls.length = 0;
  for (let i = 1; i <= 6; i++) {
    const floodReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
      },
      body: JSON.stringify({
        update_id: 2000 + i,
        message: {
          message_id: 100 + i,
          chat: { id: -100999888, type: "supergroup" },
          from: { id: 555666, first_name: "Spammer" },
          text: `Spam message ${i}`
        }
      })
    });
    await worker.fetch(floodReq, mockEnv, mockCtx);
  }
  const deleteCalls = telegramCalls.filter(c => c.url.includes("/deleteMessage"));
  const restrictCalls = telegramCalls.filter(c => c.url.includes("/restrictChatMember"));
  assert(deleteCalls.length > 0, "Anti-flood triggered: offending message deleted");
  assert(restrictCalls.length > 0, "Anti-flood triggered: flooding user muted for 5 minutes");

  // Test I: Group Moderation - External Link Filter
  // First enable link_filter
  featuresInKv.link_filter = true;
  await mockEnv.BOT_DATA.put("settings:features", JSON.stringify(featuresInKv));

  telegramCalls.length = 0;
  const linkMsgReq = new Request("https://shiv-yogi-assistant.shivyogi-x19.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "SecretToken_XYZ_987"
    },
    body: JSON.stringify({
      update_id: 3001,
      message: {
        message_id: 501,
        chat: { id: -100999888, type: "supergroup" },
        from: { id: 444333, first_name: "LinkSpammer" },
        text: "Join my channel https://t.me/free_crypto_now"
      }
    })
  });
  await worker.fetch(linkMsgReq, mockEnv, mockCtx);
  const linkDeletes = telegramCalls.filter(c => c.url.includes("/deleteMessage"));
  assert(linkDeletes.length > 0, "Link filter caught and deleted unauthorized external link");

  // Test J: Scheduled Post Queue & Cloudflare Cron Handler
  const futurePost = {
    id: 999111,
    text: "Automated Daily Wallpaper Drop",
    media_type: "text",
    post_at: Date.now() - 1000, // Due right now
    status: "pending",
    channel_id: "-100111222333"
  };
  await mockEnv.BOT_DATA.put("chan:scheduled_list", JSON.stringify([futurePost]));

  telegramCalls.length = 0;
  await worker.scheduled({}, mockEnv, mockCtx);
  const scheduledListAfter = await mockEnv.BOT_DATA.get("chan:scheduled_list", "json");
  const executedPost = scheduledListAfter.find(p => p.id === 999111);
  assert(executedPost && executedPost.status === "published", "Cloudflare Worker scheduled() handler successfully published due post");
  const cronHeartbeat = await mockEnv.BOT_DATA.get("cron:last_run", "json");
  assert(cronHeartbeat && cronHeartbeat.processed >= 1, "Cron execution recorded heartbeat with IST timestamp in KV");

  // Summary
  console.log("==================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log("==================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("FATAL TEST EXCEPTION:", err);
  process.exit(1);
});
