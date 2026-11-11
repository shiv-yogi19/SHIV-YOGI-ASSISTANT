/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: member-manager.js
 * Registered member profiles, activity tracking, ID lookup,
 * and privacy-respecting member analytics.
 */

import { safeKvGet, safeKvPut, formatDateIST } from "./helpers.js";
import { getUserWarnings, isTrustedUser, isBlacklistedUser } from "./moderation.js";
import { getUserLanguage } from "./localization.js";

export async function registerOrUpdateMember(env, user) {
  if (!user || !user.id) return null;
  const userId = String(user.id);
  const now = Date.now();

  const existing = await safeKvGet(env, `user:${userId}`, "json");
  let member;

  if (existing) {
    member = {
      ...existing,
      first_name: user.first_name || existing.first_name || "User",
      username: user.username || existing.username || null,
      last_seen: now,
      last_seen_ist: formatDateIST(now),
      message_count: (existing.message_count || 0) + 1
    };
  } else {
    member = {
      id: userId,
      first_name: user.first_name || "User",
      username: user.username || null,
      first_seen: now,
      first_seen_ist: formatDateIST(now),
      last_seen: now,
      last_seen_ist: formatDateIST(now),
      message_count: 1
    };

    // Update index list (cap at 200 to keep within free-tier limits)
    const listRaw = await safeKvGet(env, "members:index", "json");
    const list = Array.isArray(listRaw) ? listRaw : [];
    if (!list.includes(userId)) {
      list.unshift(userId);
      if (list.length > 200) list.length = 200;
      await safeKvPut(env, "members:index", list);
    }
  }

  await safeKvPut(env, `user:${userId}`, member);
  return member;
}

export async function getMember(env, userId) {
  if (!userId) return null;
  return await safeKvGet(env, `user:${String(userId).trim()}`, "json");
}

export async function getMemberFullProfile(env, chatId, userId) {
  const basic = await getMember(env, userId);
  const warns = await getUserWarnings(env, chatId, userId);
  const trusted = await isTrustedUser(env, userId);
  const blacklisted = await isBlacklistedUser(env, userId);
  const lang = await getUserLanguage(env, userId);

  return {
    id: String(userId),
    first_name: basic?.first_name || "Unknown",
    username: basic?.username ? `@${basic.username}` : "None",
    first_seen: basic?.first_seen_ist || "Unknown",
    last_seen: basic?.last_seen_ist || "Unknown",
    message_count: basic?.message_count || 0,
    warnings: warns,
    is_trusted: trusted,
    is_blacklisted: blacklisted,
    language: lang
  };
}

export async function searchMember(env, query) {
  if (!query) return null;
  const clean = String(query).trim().replace(/^@/, "");

  // Try direct ID lookup
  if (/^\d+$/.test(clean)) {
    const direct = await getMember(env, clean);
    if (direct) return direct;
  }

  // Search by username or name in index
  const listRaw = await safeKvGet(env, "members:index", "json");
  const list = Array.isArray(listRaw) ? listRaw : [];

  for (const id of list) {
    const m = await getMember(env, id);
    if (!m) continue;
    if (m.username && m.username.toLowerCase() === clean.toLowerCase()) {
      return m;
    }
    if (m.first_name && m.first_name.toLowerCase().includes(clean.toLowerCase())) {
      return m;
    }
  }

  return null;
}

export async function listMembers(env, page = 1, pageSize = 8) {
  const listRaw = await safeKvGet(env, "members:index", "json");
  const list = Array.isArray(listRaw) ? listRaw : [];

  const total = list.length;
  const start = (page - 1) * pageSize;
  const ids = list.slice(start, start + pageSize);

  const members = [];
  for (const id of ids) {
    const m = await getMember(env, id);
    if (m) members.push(m);
  }

  return {
    items: members,
    total: total,
    page: page,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function exportMembersStats(env) {
  const listRaw = await safeKvGet(env, "members:index", "json");
  const list = Array.isArray(listRaw) ? listRaw : [];
  return {
    total_indexed_members: list.length,
    timestamp: new Date().toISOString(),
    ist: formatDateIST()
  };
}
