/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * TEST SUITE 7: v4-advanced.test.js
 * Comprehensive automated testing for V4 Advanced Edition additions:
 * - Exactly 100 Unique Commands & Registry
 * - 8-Section Master Owner Panel
 * - Button Layout Manager (1-4 per row, mutations, stable IDs, validation)
 * - Random Welcome Manager (active selection, {NAME} interpolation)
 * - Non-Repeating Random Reply Engine (KV cycle state, reshuffle)
 * - Modular Plugin Architecture
 * - User Management & V4 Migration Engine
 */

import { MockTelegramApi, MockKV } from "./fixtures/mock-telegram.js";
import { COMMAND_REGISTRY, dispatchCommand, getAllCommands, getCommandsByCategory } from "../modules/command-manager.js";
import { getLayout, saveLayout, resetLayout, addButtonToLayout, editButtonInLayout, deleteButtonFromLayout, moveButtonInLayout, buildTelegramKeyboard, validateButton, exportLayoutJSON, importLayoutJSON } from "../modules/button-manager.js";
import { getWelcomePool, getRandomWelcomeMessage, addWelcomeVariant, toggleWelcomeVariant } from "../modules/random-welcome.js";
import { getTriggersList, matchAndGetRandomReply, addTrigger, addReplyToTrigger } from "../modules/random-replies.js";
import { getRemainingReplyIds, markReplyUsed } from "../modules/reply-history.js";
import { getPluginRegistryDetails, togglePlugin, isPluginEnabled } from "../modules/plugin-manager.js";
import { getUserListPaginated, blockUser, unblockUser, isUserBlocked, formatUserProfileHTML } from "../modules/user-management.js";
import { runV4Migration, checkSchemaHealth } from "../modules/migration.js";
import { getDashboardData, formatDashboardHTML, buildDashboardKeyboard } from "../modules/dashboard.js";
import { renderMainPanel } from "../worker.js";
import { DEFAULT_CONTENT } from "../modules/helpers.js";
import { registerOrUpdateMember } from "../modules/member-manager.js";

console.log("==================================================");
console.log("🚀 STARTING V4.0.0 ADVANCED EDITION TEST SUITE");
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

const mockApi = new MockTelegramApi();
mockApi.installGlobalFetch();

const env = {
  OWNER_ID: "8226363418",
  BOT_TOKEN: "777888999:AAFakeTokenForLocalTestingOnly12345",
  WEBHOOK_SECRET: "SecretToken_XYZ_987",
  BOT_DATA: new MockKV()
};

// Seed default settings into MockKV
await env.BOT_DATA.put("settings:config", DEFAULT_CONTENT.settings);
await env.BOT_DATA.put("settings:features", DEFAULT_CONTENT.features);

// ============================================================
// PART 1: EXACTLY 100 UNIQUE COMMANDS & REGISTRY
// ============================================================
assert(COMMAND_REGISTRY.size === 100, "COMMAND_REGISTRY contains exactly 100 unique commands");

const userCmds = getCommandsByCategory("user");
const groupCmds = getCommandsByCategory("group");
const chanCmds = getCommandsByCategory("channel");
const adminCmds = getCommandsByCategory("admin");
const customCmds = getCommandsByCategory("custom");

assert(userCmds.length === 20, "Category Bot & User Commands count = 20");
assert(groupCmds.length === 25, "Category Group Management Commands count = 25");
assert(chanCmds.length === 20, "Category Channel Management Commands count = 20");
assert(adminCmds.length === 20, "Category Owner & Admin Commands count = 20");
assert(customCmds.length === 15, "Category Bot Customisation Commands count = 15");

// Check command naming compliance
const commandRegex = /^[a-z0-9_]{1,32}$/;
let allNamesValid = true;
for (const cmd of getAllCommands()) {
  if (!commandRegex.test(cmd.name)) {
    allNamesValid = false;
    console.error(`Invalid command name: ${cmd.name}`);
  }
}
assert(allNamesValid, "All 100 command names comply with Telegram Bot API naming standards");

// Test command dispatcher execution
mockApi.resetCalls();
const pingMsg = {
  message_id: 1,
  chat: { id: 123456, type: "private" },
  from: { id: 123456, first_name: "Tester" },
  text: "/ping"
};
const handledPing = await dispatchCommand(env, pingMsg);
assert(handledPing === true, "dispatchCommand successfully processed /ping");
assert(mockApi.calls.length > 0, "Handler /ping executed and called Telegram API");

// Test permission check on owner command from non-owner
mockApi.resetCalls();
const nonOwnerPanelMsg = {
  message_id: 2,
  chat: { id: 999999, type: "private" },
  from: { id: 999999, first_name: "Intruder" },
  text: "/panel"
};
const handledPanel = await dispatchCommand(env, nonOwnerPanelMsg);
assert(handledPanel === true, "dispatchCommand intercepted unauthorized /panel");
const lastMsg = mockApi.getLastCall("sendMessage");
assert(lastMsg.payload.text.includes("Access Denied"), "Unauthorized /panel received Access Denied message");

// ============================================================
// PART 2: OWNER PANEL (EXACTLY 8 MAIN SECTIONS)
// ============================================================
const panel = await renderMainPanel(env);
assert(Boolean(panel.text), "renderMainPanel returns formatted panel text");
assert(panel.reply_markup?.inline_keyboard?.length === 5, "Owner Panel has exactly 5 keyboard rows");

// Count main buttons excluding Close Panel
const allButtons = panel.reply_markup.inline_keyboard.flat();
const mainButtons = allButtons.filter(b => b.callback_data !== "p:close");
assert(mainButtons.length === 8, "Owner Home Menu contains exactly 8 functional sections");

const sectionCallbacks = mainButtons.map(b => b.callback_data);
assert(sectionCallbacks.includes("p:dash"), "Section 1: Dashboard present");
assert(sectionCallbacks.includes("p:settings"), "Section 2: Bot Settings present");
assert(sectionCallbacks.includes("p:users"), "Section 3: User Management present");
assert(sectionCallbacks.includes("p:grp"), "Section 4: Group Management present");
assert(sectionCallbacks.includes("p:chan"), "Section 5: Channel Management present");
assert(sectionCallbacks.includes("p:custom"), "Section 6: Message Customisation present");
assert(sectionCallbacks.includes("p:rwelc"), "Section 7: Random Welcome present");
assert(sectionCallbacks.includes("p:rreply"), "Section 8: Random Reply present");

// ============================================================
// PART 3: ADVANCED BUTTON LAYOUT MANAGER
// ============================================================
// Test layout fetching & default fallback
const startLayout = await getLayout(env, "start");
assert(Array.isArray(startLayout.buttons), "getLayout returns layout with buttons array");

// Test rendering 1 per row
const layout1 = { layout_type: "1_per_row", buttons: [
  { id: "b1", text: "Button 1", type: "callback", target: "cb1", enabled: true },
  { id: "b2", text: "Button 2", type: "callback", target: "cb2", enabled: true }
] };
const kb1 = buildTelegramKeyboard(layout1);
assert(kb1.inline_keyboard.length === 2 && kb1.inline_keyboard[0].length === 1, "buildTelegramKeyboard rendered 1 button per row correctly");

// Test rendering 2 per row
const layout2 = { layout_type: "2_per_row", buttons: [
  { id: "b1", text: "B1", type: "callback", target: "cb1", enabled: true },
  { id: "b2", text: "B2", type: "callback", target: "cb2", enabled: true },
  { id: "b3", text: "B3", type: "callback", target: "cb3", enabled: true }
] };
const kb2 = buildTelegramKeyboard(layout2);
assert(kb2.inline_keyboard.length === 2 && kb2.inline_keyboard[0].length === 2, "buildTelegramKeyboard rendered 2 buttons per row correctly");

// Test button validation: 64 byte callback limit
const validBtn = { id: "test_btn", text: "Valid Button", type: "callback", target: "valid_action" };
assert(validateButton(validBtn).valid === true, "validateButton accepts valid button configuration");

const overLimitBtn = { id: "bad_btn", text: "Bad", type: "callback", target: "a".repeat(70) };
assert(validateButton(overLimitBtn).valid === false, "validateButton rejects callback data exceeding 64 bytes");

// Test button addition, editing, moving, deletion
await addButtonToLayout(env, "test_menu", { id: "tb1", text: "Test 1", type: "url", target: "https://t.me/test" });
let curLayout = await getLayout(env, "test_menu");
assert(curLayout.buttons.some(b => b.id === "tb1"), "addButtonToLayout successfully appended button to menu");

await editButtonInLayout(env, "test_menu", "tb1", { text: "Updated Label" });
curLayout = await getLayout(env, "test_menu");
assert(curLayout.buttons.find(b => b.id === "tb1").text === "Updated Label", "editButtonInLayout updated label without breaking target");

await deleteButtonFromLayout(env, "test_menu", "tb1");
curLayout = await getLayout(env, "test_menu");
assert(!curLayout.buttons.some(b => b.id === "tb1"), "deleteButtonFromLayout removed button cleanly");

// Test Layout Export and Import
const exportJson = exportLayoutJSON(startLayout);
assert(typeof exportJson === "string" && exportJson.includes("buttons"), "exportLayoutJSON exports serialized layout");
const importRes = await importLayoutJSON(env, "imported_menu", exportJson);
assert(importRes.ok === true, "importLayoutJSON validates and restores layout JSON");

// ============================================================
// PART 4: RANDOM WELCOME MESSAGE MANAGER
// ============================================================
const welcomePool = await getWelcomePool(env);
assert(welcomePool.length >= 4, "getWelcomePool returns configured welcome variants");

const randomWelc = await getRandomWelcomeMessage(env, "Aman", "The Endless Playback", "en");
assert(randomWelc.includes("Aman") && randomWelc.includes("The Endless Playback"), "getRandomWelcomeMessage interpolates {NAME} and {GROUP}");

// Test adding a variant
const addWelcRes = await addWelcomeVariant(env, "Namaste {NAME}, welcome to {GROUP}!", "hi");
assert(addWelcRes.ok === true, "addWelcomeVariant validated and added Hindi variant");

// ============================================================
// PART 5: ADVANCED RANDOM REPLY ENGINE (ZERO REPETITION CYCLE)
// ============================================================
const triggers = await getTriggersList(env);
assert(triggers.length >= 3, "getTriggersList loads active reply triggers");

const helloTrigger = triggers.find(t => t.keyword === "hello");
assert(Boolean(helloTrigger), "Trigger 'hello' exists in triggers list");

const activeReplyIds = helloTrigger.replies.map(r => r.id);
const testUserId = 777123;

// Test cycle state: consume all replies one by one
const servedReplies = new Set();
for (let i = 0; i < activeReplyIds.length; i++) {
  const remaining = await getRemainingReplyIds(env, helloTrigger.id, testUserId, activeReplyIds);
  assert(remaining.length === activeReplyIds.length - i, `Cycle state correctly reports ${activeReplyIds.length - i} remaining replies`);
  const picked = remaining[0];
  servedReplies.add(picked);
  await markReplyUsed(env, helloTrigger.id, testUserId, picked, activeReplyIds);
}

assert(servedReplies.size === activeReplyIds.length, "Zero repetition: All distinct replies served exactly once before repetition");

// After full cycle, next call must reset/reshuffle
const resetRemaining = await getRemainingReplyIds(env, helloTrigger.id, testUserId, activeReplyIds);
assert(resetRemaining.length === activeReplyIds.length, "Cycle automatically resets/reshuffles after exhausting all pool replies");

// Test matchAndGetRandomReply execution
const replyMatch = await matchAndGetRandomReply(env, "hello there!", 888999, "private");
assert(Boolean(replyMatch), "matchAndGetRandomReply successfully matched trigger and returned text");

// ============================================================
// PART 6: MODULAR PLUGIN ARCHITECTURE
// ============================================================
const plugins = await getPluginRegistryDetails(env);
assert(plugins.length >= 5, "Plugin registry contains all 5 core modules");

const rwPlugin = plugins.find(p => p.id === "random_welcome");
assert(rwPlugin && rwPlugin.enabled === true, "Plugin 'random_welcome' registered and active by default");

const tglRes = await togglePlugin(env, "random_welcome");
assert(tglRes.ok === true && tglRes.enabled === false, "togglePlugin successfully disabled plugin in KV");

const tglBack = await togglePlugin(env, "random_welcome");
assert(tglBack.ok === true && tglBack.enabled === true, "togglePlugin successfully re-enabled plugin");

// ============================================================
// PART 7: USER MANAGEMENT & DATABASE MIGRATION
// ============================================================
// Register mock user
await registerOrUpdateMember(env, { id: 555444, first_name: "Rahul", username: "rahul_dev" }, 555444);
const userList = await getUserListPaginated(env, 1, 5);
assert(userList.total >= 1, "getUserListPaginated retrieves registered users");

// Block and unblock
await blockUser(env, 555444, "Spam abuse", "owner");
assert(await isUserBlocked(env, 555444) === true, "blockUser successfully marked user as blocked in KV");

await unblockUser(env, 555444, "owner");
assert(await isUserBlocked(env, 555444) === false, "unblockUser successfully restored user access");

// Migration test
const migRes = await runV4Migration(env);
assert(migRes.toVersion === "4.0.0", "runV4Migration upgraded schema version to 4.0.0");

const schemaHealth = await checkSchemaHealth(env);
assert(schemaHealth.is_latest === true, "checkSchemaHealth reports schema is at latest V4.0.0");

// Dashboard data test
const dashData = await getDashboardData(env);
assert(dashData.version === "4.0.0", "Dashboard aggregates system version 4.0.0");
assert(dashData.owner_id === "8226363418", "Dashboard correctly identifies configured Owner ID");

console.log("==================================================");
console.log(`📊 V4 ADVANCED TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
