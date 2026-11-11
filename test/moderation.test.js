/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 4: moderation.test.js
 * Validates Moderation Center: warning counts & auto-ban, Owner immunity,
 * trusted whitelist protection, blacklist management, mute/unmute lifecycles,
 * and user reporting workflows with duplicate prevention.
 */

import {
  warnUser,
  getUserWarnings,
  resetWarnings,
  muteUser,
  unmuteUser,
  banUser,
  unbanUser,
  isTrustedUser,
  addTrustedUser,
  removeTrustedUser,
  isBlacklistedUser,
  addBlacklistedUser,
  removeBlacklistedUser,
  getModerationProfile
} from "../modules/moderation.js";
import { submitReport, getReport, updateReportStatus, addReportNote } from "../modules/reports.js";
import { MockTelegramApi, MockKV } from "./fixtures/mock-telegram.js";
import { DEFAULT_CONTENT } from "../modules/helpers.js";

console.log("==================================================");
console.log("⚖️ STARTING MODERATION & REPORTS TEST SUITE");
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
  BOT_DATA: new MockKV()
};

await env.BOT_DATA.put("settings:config", DEFAULT_CONTENT.settings);
const chatId = -1001234567890;
const targetUser = 998877;

// 1. Warning System Progression & Auto-Ban at Limit (3)
const warn1 = await warnUser(env, chatId, targetUser, "Spam message 1", "admin_1");
assert(warn1.ok === true && warn1.warnings === 1, "First warning successfully issued (1/3)");
assert(warn1.autoAction === null, "No auto-action on first warning");

const warn2 = await warnUser(env, chatId, targetUser, "Spam message 2", "admin_1");
assert(warn2.ok === true && warn2.warnings === 2, "Second warning successfully issued (2/3)");

const warn3 = await warnUser(env, chatId, targetUser, "Spam message 3", "admin_1");
assert(warn3.ok === true && warn3.warnings === 3, "Third warning successfully issued (3/3)");
assert(warn3.autoAction === "banned", "Auto-ban triggered upon reaching warning limit");

const banCalls = mockApi.getCallsForMethod("banChatMember");
assert(banCalls.length > 0 && banCalls[0].payload.user_id === targetUser, "banChatMember called by auto-action");

// Reset warnings
await resetWarnings(env, chatId, targetUser, "admin_1");
const postResetWarns = await getUserWarnings(env, chatId, targetUser);
assert(postResetWarns === 0, "Warnings successfully reset to 0");

// 2. Owner Immunity Protection
const ownerWarn = await warnUser(env, chatId, "8226363418", "Attempt to warn owner", "intruder");
assert(!ownerWarn.ok && ownerWarn.error.includes("Cannot warn bot Owner"), "Owner immune to warnings");

const ownerMute = await muteUser(env, chatId, "8226363418", 10, "Attempt mute owner", "intruder");
assert(!ownerMute.ok && ownerMute.error.includes("Cannot mute the Owner"), "Owner immune to mutes");

const ownerBan = await banUser(env, chatId, "8226363418", "Attempt ban owner", "intruder");
assert(!ownerBan.ok && ownerBan.error.includes("Cannot ban the Owner"), "Owner immune to bans");

// 3. Trusted User Whitelist
const trustedId = 554433;
await addTrustedUser(env, trustedId, "Shiv Friend", "VIP Member");
assert(await isTrustedUser(env, trustedId), "User recognized in trusted whitelist");

const trustedWarn = await warnUser(env, chatId, trustedId, "Attempt warn trusted", "mod");
assert(!trustedWarn.ok && trustedWarn.error.includes("trusted"), "Trusted user protected from warnings");

const trustedMute = await muteUser(env, chatId, trustedId, 15, "Attempt mute trusted", "mod");
assert(!trustedMute.ok && trustedMute.error.includes("trusted"), "Trusted user protected from mutes");

await removeTrustedUser(env, trustedId);
assert(!(await isTrustedUser(env, trustedId)), "User successfully removed from trusted whitelist");

// 4. Blacklist Management
const blacklistedId = 443322;
await addBlacklistedUser(env, blacklistedId, "Known spam bot operator");
assert(await isBlacklistedUser(env, blacklistedId), "User recognized in blacklist");
await removeBlacklistedUser(env, blacklistedId);
assert(!(await isBlacklistedUser(env, blacklistedId)), "User removed from blacklist");

// 5. Mute and Unmute Controls
mockApi.resetCalls();
const muteRes = await muteUser(env, chatId, 771122, 30, "Excessive caps", "admin_1");
assert(muteRes.ok === true, "User successfully muted for 30 minutes");
const restrictCalls = mockApi.getCallsForMethod("restrictChatMember");
assert(restrictCalls.length > 0 && restrictCalls[0].payload.permissions.can_send_messages === false, "restrictChatMember revoked message permissions");

const unmuteRes = await unmuteUser(env, chatId, 771122, "admin_1");
assert(unmuteRes.ok === true, "User successfully unmuted");

// 6. User Moderation Profile Audit
const profile = await getModerationProfile(env, chatId, 771122);
assert(profile.user_id === "771122", "Profile returns correct user ID");
assert(profile.warnings === 0, "Profile accurately reflects 0 warnings");

// 7. Community Reports Workflow & Duplicate Prevention
const reportRes1 = await submitReport(env, {
  chatId: chatId,
  reportedUserId: "665544",
  reporterId: "112233",
  messageId: 8899,
  text: "Malicious phishing link",
  reason: "Phishing"
});
assert(reportRes1.ok === true && reportRes1.report.status === "pending", "New report created with status pending");

// Attempt duplicate report
const reportRes2 = await submitReport(env, {
  chatId: chatId,
  reportedUserId: "665544",
  reporterId: "112233",
  messageId: 8899,
  text: "Malicious phishing link",
  reason: "Phishing"
});
assert(!reportRes2.ok && reportRes2.duplicate === true, "Duplicate report correctly rejected");

// Update status to approved
const reportId = reportRes1.report.id;
const updateRes = await updateReportStatus(env, reportId, "approved", "admin_1", "Verified scam content");
assert(updateRes.ok === true && updateRes.report.status === "approved", "Report updated to approved status");

// Add internal admin note
const noteRes = await addReportNote(env, reportId, "admin_2", "User also removed from linked channel");
assert(noteRes.ok === true && noteRes.report.notes.length >= 2, "Internal admin note added to report history");

console.log("==================================================");
console.log(`📊 MODERATION TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
