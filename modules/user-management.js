/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: user-management.js
 * Comprehensive User Profile, Permissions, and Broadcast Operations
 *
 * Privacy-respecting profile persistence, trust/blacklist management,
 * user search, and batched user announcements.
 */

import { safeKvGet, safeKvPut, safeKvDelete, safeKvList, formatDateIST, escapeHtml, sendMessage } from "./helpers.js";
import { getMember, getMemberFullProfile, listMembers, searchMember } from "./member-manager.js";
import { isBlacklistedUser, addBlacklistedUser, removeBlacklistedUser, isTrustedUser, addTrustedUser, removeTrustedUser } from "./moderation.js";
import { logSecurityEvent } from "./security.js";

export async function getUserListPaginated(env, page = 1, pageSize = 5) {
  const result = await listMembers(env, page, pageSize);
  return result;
}

export async function blockUser(env, userId, reason = "Blocked by Administrator", actorId = "owner") {
  await addBlacklistedUser(env, userId, reason, actorId);
  await safeKvPut(env, `user:blocked:${userId}`, {
    blocked: true,
    reason,
    blocked_at: Date.now(),
    actor: actorId
  });
  await logSecurityEvent(env, actorId, "user_blocked", `Blocked user ${userId}: ${reason}`);
  return true;
}

export async function unblockUser(env, userId, actorId = "owner") {
  await removeBlacklistedUser(env, userId);
  await safeKvDelete(env, `user:blocked:${userId}`);
  await logSecurityEvent(env, actorId, "user_unblocked", `Unblocked user ${userId}`);
  return true;
}

export async function isUserBlocked(env, userId) {
  const blocked = await safeKvGet(env, `user:blocked:${userId}`, "json");
  if (blocked && blocked.blocked) return true;
  return await isBlacklistedUser(env, userId);
}

export async function broadcastToUsers(env, messageText, photoUrl = null) {
  const listRaw = await safeKvGet(env, "members:index", "json");
  const list = Array.isArray(listRaw) ? listRaw : [];
  let successCount = 0;
  let failCount = 0;

  for (const id of list) {
    try {
      const res = await sendMessage(env, id, messageText);
      if (res.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  return {
    total: list.length,
    success: successCount,
    failed: failCount
  };
}

export function formatUserProfileHTML(profile) {
  const trustBadge = profile.is_trusted ? "⭐ <b>Trusted Whitelist</b>" : "Standard User";
  const blacklistBadge = profile.is_blacklisted ? "🚫 <b>BLACKLISTED / BLOCKED</b>" : "Active / Permitted";

  return (
    `👤 <b>USER PROFILE: ${escapeHtml(profile.first_name)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>User ID:</b> <code>${profile.id}</code>\n` +
    `• <b>Username:</b> ${profile.username}\n` +
    `• <b>Account Status:</b> ${blacklistBadge}\n` +
    `• <b>Trust Level:</b> ${trustBadge}\n` +
    `• <b>Language:</b> <code>${(profile.language || "en").toUpperCase()}</code>\n` +
    `• <b>Total Messages:</b> <code>${profile.message_count}</code>\n` +
    `• <b>Active Warnings:</b> <code>${profile.warnings}</code>\n` +
    `• <b>First Registered:</b> <i>${profile.first_seen}</i>\n` +
    `• <b>Last Activity:</b> <i>${profile.last_seen}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );
}
