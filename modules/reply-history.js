/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: reply-history.js
 * Per-User Reply History & Cycle State Tracker for Non-Repeating Reply Engine
 *
 * Implements persistent cycle state tracking in Cloudflare KV:
 * - Tracks which reply IDs in a trigger's pool have already been served to a user
 * - Guarantees all enabled replies in a pool are exhausted before any reply is reused
 * - Reshuffles automatically upon completing a cycle
 * - Maintains recent reply execution history
 */

import { safeKvGet, safeKvPut, safeKvDelete, formatDateIST } from "./helpers.js";

const CYCLE_KEY_PREFIX = "rreply:cycle:";
const USER_HISTORY_PREFIX = "rreply:hist:user:";
const GLOBAL_HISTORY_KEY = "rreply:hist:global";

/**
 * Get remaining unused reply IDs for a specific user and trigger.
 */
export async function getRemainingReplyIds(env, triggerId, userId, activeReplyIds) {
  if (!activeReplyIds || activeReplyIds.length === 0) return [];
  if (activeReplyIds.length === 1) return activeReplyIds; // Only 1 available, repetition unavoidable

  const cycleKey = `${CYCLE_KEY_PREFIX}${triggerId}:${userId}`;
  const usedIds = (await safeKvGet(env, cycleKey, "json")) || [];

  // Filter out replies that are no longer enabled or already used
  const remaining = activeReplyIds.filter(id => !usedIds.includes(id));

  if (remaining.length === 0) {
    // Full cycle completed! Reshuffle / reset cycle state
    await safeKvDelete(env, cycleKey);
    return activeReplyIds;
  }

  return remaining;
}

/**
 * Mark a reply ID as used in the user's current cycle for this trigger.
 */
export async function markReplyUsed(env, triggerId, userId, replyId, activeReplyIds) {
  const cycleKey = `${CYCLE_KEY_PREFIX}${triggerId}:${userId}`;
  const usedIds = (await safeKvGet(env, cycleKey, "json")) || [];

  if (!usedIds.includes(replyId)) {
    usedIds.push(replyId);
  }

  // If all active replies have now been used, reset cycle
  if (activeReplyIds.every(id => usedIds.includes(id))) {
    await safeKvDelete(env, cycleKey);
  } else {
    // Persist cycle with 7-day expiration
    await safeKvPut(env, cycleKey, usedIds, { expirationTtl: 86400 * 7 });
  }

  // Record user history
  await recordUserReplyHistory(env, userId, triggerId, replyId);
}

/**
 * Record user reply event into per-user and global history.
 */
export async function recordUserReplyHistory(env, userId, triggerId, replyId) {
  const timestamp = Date.now();
  const entry = {
    trigger_id: triggerId,
    reply_id: replyId,
    time: new Date(timestamp).toISOString(),
    ist: formatDateIST(timestamp)
  };

  try {
    // User history (last 10)
    const uKey = `${USER_HISTORY_PREFIX}${userId}`;
    const uList = (await safeKvGet(env, uKey, "json")) || [];
    uList.unshift(entry);
    if (uList.length > 10) uList.length = 10;
    await safeKvPut(env, uKey, uList, { expirationTtl: 86400 * 7 });

    // Global recent history (last 30)
    const gList = (await safeKvGet(env, GLOBAL_HISTORY_KEY, "json")) || [];
    gList.unshift({ ...entry, user_id: userId });
    if (gList.length > 30) gList.length = 30;
    await safeKvPut(env, GLOBAL_HISTORY_KEY, gList);
  } catch (err) {
    console.error("Failed to append reply history:", err);
  }
}

export async function getUserReplyHistory(env, userId) {
  const uKey = `${USER_HISTORY_PREFIX}${userId}`;
  return (await safeKvGet(env, uKey, "json")) || [];
}

export async function getGlobalReplyHistory(env, limit = 20) {
  const list = (await safeKvGet(env, GLOBAL_HISTORY_KEY, "json")) || [];
  return list.slice(0, limit);
}

export async function clearUserReplyHistory(env, userId) {
  await safeKvDelete(env, `${USER_HISTORY_PREFIX}${userId}`);
  return true;
}

export async function clearAllReplyCycles(env, triggerId) {
  // Clears trigger specific global cycle indicator if stored
  await safeKvDelete(env, `rreply:cycles_reset:${triggerId}`);
  return true;
}
