/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: moderation.js
 * Advanced Moderation Center: warning history, user moderation profiles,
 * trusted whitelist, blacklist, manual override, and action audit logging.
 */

import {
  restrictChatMember,
  banChatMember,
  unbanChatMember,
  safeKvGet,
  safeKvPut,
  safeKvDelete,
  formatDateIST
} from "./helpers.js";
import { isOwner, hasPermission } from "./security.js";
import { getSettings } from "./settings.js";

// ==========================================
// 1. TRUSTED & BLACKLISTED USERS
// ==========================================

export async function isTrustedUser(env, userId) {
  if (!userId) return false;
  const val = await safeKvGet(env, `trusted:${userId}`, "json");
  return Boolean(val);
}

export async function addTrustedUser(env, userId, name = "", note = "") {
  const idStr = String(userId).trim();
  const record = {
    user_id: idStr,
    name: name,
    note: note,
    added_at: Date.now(),
    added_ist: formatDateIST()
  };
  await safeKvPut(env, `trusted:${idStr}`, record);
  return record;
}

export async function removeTrustedUser(env, userId) {
  const idStr = String(userId).trim();
  return await safeKvDelete(env, `trusted:${idStr}`);
}

export async function listTrustedUsers(env) {
  const list = await env.BOT_DATA.list({ prefix: "trusted:" });
  const result = [];
  for (const k of list.keys) {
    const data = await safeKvGet(env, k.name, "json");
    if (data) result.push(data);
  }
  return result;
}

export async function isBlacklistedUser(env, userId) {
  if (!userId) return false;
  const val = await safeKvGet(env, `blacklist:${userId}`, "json");
  return Boolean(val);
}

export async function addBlacklistedUser(env, userId, reason = "") {
  const idStr = String(userId).trim();
  const record = {
    user_id: idStr,
    reason: reason,
    added_at: Date.now(),
    added_ist: formatDateIST()
  };
  await safeKvPut(env, `blacklist:${idStr}`, record);
  return record;
}

export async function removeBlacklistedUser(env, userId) {
  const idStr = String(userId).trim();
  return await safeKvDelete(env, `blacklist:${idStr}`);
}

export async function listBlacklistedUsers(env) {
  const list = await env.BOT_DATA.list({ prefix: "blacklist:" });
  const result = [];
  for (const k of list.keys) {
    const data = await safeKvGet(env, k.name, "json");
    if (data) result.push(data);
  }
  return result;
}

// ==========================================
// 2. USER WARNINGS & AUTO-ACTION
// ==========================================

export async function getUserWarnings(env, chatId, userId) {
  const warnKey = `warns:${chatId}:${userId}`;
  const data = await safeKvGet(env, warnKey, "json");
  return typeof data === "number" ? data : (data?.count || 0);
}

export async function warnUser(env, chatId, userId, reason = "Rule violation", actorId = "system") {
  if (isOwner(env, userId)) {
    return { ok: false, error: "Cannot warn bot Owner" };
  }
  if (await isTrustedUser(env, userId)) {
    return { ok: false, error: "User is in the trusted whitelist" };
  }

  const settings = await getSettings(env);
  const warnLimit = settings.warn_limit || 3;
  const warnKey = `warns:${chatId}:${userId}`;

  const currentCount = await getUserWarnings(env, chatId, userId);
  const newCount = currentCount + 1;

  await safeKvPut(env, warnKey, { count: newCount, updated_at: Date.now() }, { expirationTtl: 86400 * 3 });
  await logModerationAction(env, "warn", chatId, userId, actorId, `${reason} [${newCount}/${warnLimit}]`);

  let autoAction = null;
  if (newCount >= warnLimit) {
    // Ban user upon reaching limit
    const banRes = await banChatMember(env, chatId, userId);
    if (banRes.ok) {
      autoAction = "banned";
      await safeKvDelete(env, warnKey);
      await logModerationAction(env, "auto_ban_warn_limit", chatId, userId, "system", `Reached ${warnLimit} warnings`);
    } else {
      autoAction = "ban_failed";
    }
  }

  return {
    ok: true,
    warnings: newCount,
    limit: warnLimit,
    autoAction: autoAction
  };
}

export async function resetWarnings(env, chatId, userId, actorId = "system") {
  const warnKey = `warns:${chatId}:${userId}`;
  await safeKvDelete(env, warnKey);
  await logModerationAction(env, "reset_warnings", chatId, userId, actorId, "Warnings cleared");
  return { ok: true };
}

// ==========================================
// 3. MUTE & BAN CONTROLS
// ==========================================

export async function muteUser(env, chatId, userId, durationMinutes = 15, reason = "Moderation", actorId = "admin") {
  if (isOwner(env, userId)) return { ok: false, error: "Cannot mute the Owner" };
  if (await isTrustedUser(env, userId)) return { ok: false, error: "User is trusted" };

  const untilDate = Math.floor(Date.now() / 1000) + durationMinutes * 60;
  const res = await restrictChatMember(
    env,
    chatId,
    userId,
    {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false
    },
    untilDate
  );

  if (res.ok) {
    await safeKvPut(env, `muted:${chatId}:${userId}`, { untilDate, reason }, { expirationTtl: durationMinutes * 60 + 60 });
    await logModerationAction(env, "mute", chatId, userId, actorId, `${reason} (${durationMinutes}m)`);
  }
  return res;
}

export async function unmuteUser(env, chatId, userId, actorId = "admin") {
  const res = await restrictChatMember(env, chatId, userId, {
    can_send_messages: true,
    can_send_media_messages: true,
    can_send_other_messages: true,
    can_add_web_page_previews: true
  });

  if (res.ok) {
    await safeKvDelete(env, `muted:${chatId}:${userId}`);
    await logModerationAction(env, "unmute", chatId, userId, actorId, "Restrictions removed");
  }
  return res;
}

export async function banUser(env, chatId, userId, reason = "Moderation", actorId = "admin") {
  if (isOwner(env, userId)) return { ok: false, error: "Cannot ban the Owner" };
  if (await isTrustedUser(env, userId)) return { ok: false, error: "User is trusted" };

  const res = await banChatMember(env, chatId, userId);
  if (res.ok) {
    await logModerationAction(env, "ban", chatId, userId, actorId, reason);
  }
  return res;
}

export async function unbanUser(env, chatId, userId, actorId = "admin") {
  const res = await unbanChatMember(env, chatId, userId);
  if (res.ok) {
    await logModerationAction(env, "unban", chatId, userId, actorId, "Unbanned");
  }
  return res;
}

// ==========================================
// 4. USER MODERATION PROFILE & AUDIT LOGS
// ==========================================

export async function getModerationProfile(env, chatId, userId) {
  const warnings = await getUserWarnings(env, chatId, userId);
  const isTrusted = await isTrustedUser(env, userId);
  const isBlacklisted = await isBlacklistedUser(env, userId);
  const mutedData = await safeKvGet(env, `muted:${chatId}:${userId}`, "json");

  return {
    user_id: String(userId),
    chat_id: String(chatId),
    warnings: warnings,
    is_trusted: isTrusted,
    is_blacklisted: isBlacklisted,
    is_muted: Boolean(mutedData && mutedData.untilDate > Math.floor(Date.now() / 1000)),
    muted_until: mutedData?.untilDate || null
  };
}

export async function logModerationAction(env, action, chatId, targetId, actorId, reason = "") {
  try {
    const raw = await safeKvGet(env, "logs:moderation", "json");
    const logs = Array.isArray(raw) ? raw : [];
    logs.unshift({
      time: new Date().toISOString(),
      ist: formatDateIST(),
      action: action,
      chat_id: String(chatId),
      target_id: String(targetId),
      actor_id: String(actorId),
      reason: String(reason)
    });
    if (logs.length > 50) logs.length = 50;
    await safeKvPut(env, "logs:moderation", logs);
  } catch (err) {
    console.error("Failed to append moderation log:", err);
  }
}

export async function getModerationHistory(env, limit = 20) {
  const raw = await safeKvGet(env, "logs:moderation", "json");
  const list = Array.isArray(raw) ? raw : [];
  return list.slice(0, limit);
}
