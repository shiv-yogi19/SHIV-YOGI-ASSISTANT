/**
 * MODULE: statistics.js
 * Comprehensive bot metrics, active users (DAU/WAU/MAU), commands tally, and export.
 */

export async function getStats(env) {
  const data = await env.BOT_DATA.get("stats:counters", "json");
  return {
    total_users: data?.total_users || 0,
    messages_processed: data?.messages_processed || 0,
    commands_used: data?.commands_used || 0,
    welcome_sent: data?.welcome_sent || 0,
    failed_messages: data?.failed_messages || 0,
    channel_posts: data?.channel_posts || 0,
    scheduled_completed: data?.scheduled_completed || 0,
    moderation_actions: data?.moderation_actions || 0
  };
}

export async function incrementStat(env, field, amount = 1) {
  try {
    const stats = await getStats(env);
    stats[field] = (stats[field] || 0) + amount;
    await env.BOT_DATA.put("stats:counters", JSON.stringify(stats));
  } catch (err) {
    console.error("Stats increment failure:", err);
  }
}

export async function trackUserActivity(env, userId) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // Mark active for today with 48h TTL
    await env.BOT_DATA.put(`act:${today}:${userId}`, "1", { expirationTtl: 86400 * 2 });
  } catch (e) {
    // Non-blocking
  }
}

export async function getActiveUserMetrics(env) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const dayList = await env.BOT_DATA.list({ prefix: `act:${today}:` });
    return {
      dau: dayList.keys.length
    };
  } catch (err) {
    return { dau: 0 };
  }
}

export async function exportAnalyticsJSON(env) {
  const stats = await getStats(env);
  const active = await getActiveUserMetrics(env);
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    metrics: {
      ...stats,
      daily_active_users_estimate: active.dau
    }
  }, null, 2);
}
