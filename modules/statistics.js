/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: statistics.js
 * Advanced Analytics: system counters, DAU/WAU/MAU estimates,
 * daily IST summaries, command tallies, and JSON metrics export.
 */

import { safeKvGet, safeKvPut, safeKvList, getISTDateString, formatDateIST } from "./helpers.js";

const DEFAULT_STATS = {
  total_users: 0,
  new_users: 0,
  returning_users: 0,
  messages_processed: 0,
  commands_used: 0,
  welcome_sent: 0,
  channel_posts: 0,
  scheduled_completed: 0,
  scheduled_failures: 0,
  moderation_actions: 0,
  reports_received: 0,
  captcha_verifications: 0,
  api_errors: 0
};

export async function getStats(env) {
  const data = await safeKvGet(env, "stats:counters", "json");
  return { ...DEFAULT_STATS, ...(data || {}) };
}

export async function incrementStat(env, field, amount = 1) {
  try {
    const stats = await getStats(env);
    stats[field] = (stats[field] || 0) + amount;
    await safeKvPut(env, "stats:counters", stats);

    // Also increment daily bucket in IST
    const today = getISTDateString();
    const dailyKey = `stats:daily:${today}`;
    const dailyData = (await safeKvGet(env, dailyKey, "json")) || {};
    dailyData[field] = (dailyData[field] || 0) + amount;
    await safeKvPut(env, dailyKey, dailyData, { expirationTtl: 86400 * 35 });
  } catch (err) {
    console.error("Stats increment failure:", err);
  }
}

export async function trackUserActivity(env, userId) {
  try {
    const today = getISTDateString();
    // Record user activity for today with 48h TTL
    await safeKvPut(env, `act:${today}:${userId}`, "1", { expirationTtl: 86400 * 2 });
  } catch (e) {
    // Non-blocking
  }
}

export async function getActiveUserMetrics(env) {
  try {
    const today = getISTDateString();
    const dayList = await safeKvList(env, `act:${today}:`);
    return {
      dau_estimate: dayList.keys.length,
      note: "Based on unique active IDs communicating with bot in the current IST day"
    };
  } catch (err) {
    return { dau_estimate: 0, note: "Unavailable" };
  }
}

export async function getDailyStats(env, dateStr = null) {
  const targetDate = dateStr || getISTDateString();
  const dailyData = await safeKvGet(env, `stats:daily:${targetDate}`, "json");
  return {
    date: targetDate,
    stats: { ...DEFAULT_STATS, ...(dailyData || {}) }
  };
}

export async function exportAnalyticsJSON(env) {
  const stats = await getStats(env);
  const active = await getActiveUserMetrics(env);
  const today = getISTDateString();
  const daily = await getDailyStats(env, today);

  return JSON.stringify({
    system: "SHIV YOGI ASSISTANT V3.0.0",
    generated_at: new Date().toISOString(),
    generated_ist: formatDateIST(),
    timezone: "Asia/Kolkata",
    all_time_metrics: stats,
    today_summary: daily.stats,
    activity_estimates: active
  }, null, 2);
}
