/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: dashboard.js
 * High-performance System Dashboard & Analytics Engine
 *
 * Efficiently computes and aggregates:
 * - Registered & Active Users (DAU)
 * - Group & Channel Counts
 * - Messages & Command Statistics
 * - Scheduled Posts & Broadcast Tallies
 * - Random Welcome & Reply Tallies
 * - KV Health, Error Counts, and Recent Activities
 */

import { getStats, getActiveUserMetrics } from "./statistics.js";
import { getChannelsList } from "./channel-manager.js";
import { getScheduledPostsByStatus } from "./scheduled-posts.js";
import { getActivityLogs, formatDateIST, safeKvGet, escapeHtml } from "./helpers.js";
import { runHealthCheck } from "./health.js";
import { getBackupHistory } from "./backup.js";
import { getSettings, getFeatures } from "./settings.js";

export async function getDashboardData(env) {
  // Parallel fetch of indexed metrics to avoid blocking
  const [
    stats,
    activeMetrics,
    channels,
    scheduled,
    logs,
    health,
    backups,
    settings,
    features
  ] = await Promise.all([
    getStats(env),
    getActiveUserMetrics(env),
    getChannelsList(env),
    getScheduledPostsByStatus(env, "pending", 1, 1),
    getActivityLogs(env, 5),
    runHealthCheck(env),
    getBackupHistory(env),
    getSettings(env),
    getFeatures(env)
  ]);

  const lastBackup = backups.length > 0 ? backups[0] : null;

  return {
    bot_name: "SHIV YOGI ASSISTANT",
    version: "4.0.0",
    owner_id: env.OWNER_ID || "8226363418",
    owner_name: settings.owner_name || "Shiv Yogi",
    status: features.maintenance_mode ? "MAINTENANCE" : health.overall_status === "HEALTHY" ? "ONLINE" : "DEGRADED",
    total_users: stats.total_users || 0,
    dau_estimate: activeMetrics.dau_estimate || 0,
    total_groups: settings.group_id ? 1 : 0,
    connected_channels: channels.length,
    messages_processed: stats.messages_processed || 0,
    commands_executed: stats.commands_used || 0,
    channel_posts: stats.channel_posts || 0,
    pending_scheduled_posts: scheduled.total || 0,
    welcome_sent: stats.welcome_sent || 0,
    random_replies_sent: stats.repeat_sent || stats.random_replies_sent || 0,
    moderation_actions: stats.moderation_actions || 0,
    api_errors: stats.api_errors || 0,
    kv_health: health.kv_status,
    telegram_status: health.telegram_api_status,
    last_backup_time: lastBackup ? lastBackup.ist : "None recorded",
    recent_activities: logs
  };
}

export function formatDashboardHTML(data) {
  const statusIcon = data.status === "ONLINE" ? "🟢" : data.status === "MAINTENANCE" ? "🟡" : "🔴";
  const kvIcon = data.kv_health === "HEALTHY" ? "✅" : "⚠️";
  const tgIcon = data.telegram_status === "CONNECTED" ? "✅" : "⚠️";

  let html =
    `📊 <b>SHIV YOGI ASSISTANT — MASTER DASHBOARD (v4.0.0)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👑 <b>Owner:</b> ${escapeHtml(data.owner_name)} (<code>${data.owner_id}</code>)\n` +
    `🚦 <b>System Status:</b> ${statusIcon} <b>${data.status}</b>\n` +
    `💾 <b>KV Storage:</b> ${kvIcon} ${data.kv_health} | <b>Telegram:</b> ${tgIcon} ${data.telegram_status}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 <b>Registered Users:</b> <code>${data.total_users.toLocaleString()}</code>\n` +
    `🔥 <b>Est. Active Users (DAU):</b> <code>${data.dau_estimate.toLocaleString()}</code>\n` +
    `👥 <b>Configured Groups:</b> <code>${data.total_groups}</code>\n` +
    `📢 <b>Connected Channels:</b> <code>${data.connected_channels}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Messages Processed:</b> <code>${data.messages_processed.toLocaleString()}</code>\n` +
    `⚡ <b>Commands Executed:</b> <code>${data.commands_executed.toLocaleString()}</code>\n` +
    `📢 <b>Channel Posts:</b> <code>${data.channel_posts.toLocaleString()}</code>\n` +
    `⏳ <b>Pending Scheduled:</b> <code>${data.pending_scheduled_posts}</code>\n` +
    `👋 <b>Welcomes Delivered:</b> <code>${data.welcome_sent.toLocaleString()}</code>\n` +
    `🔁 <b>Random Replies:</b> <code>${data.random_replies_sent.toLocaleString()}</code>\n` +
    `⚖️ <b>Moderation Actions:</b> <code>${data.moderation_actions.toLocaleString()}</code>\n` +
    `⚠️ <b>Recent Errors:</b> <code>${data.api_errors}</code>\n` +
    `💾 <b>Last Backup:</b> <i>${escapeHtml(data.last_backup_time)}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📜 <b>Recent Activity Log:</b>\n`;

  if (!data.recent_activities || data.recent_activities.length === 0) {
    html += `<i>No recent activity logged.</i>\n`;
  } else {
    data.recent_activities.slice(0, 4).forEach(act => {
      html += `• <b>${escapeHtml(act.action)}:</b> ${escapeHtml(act.detail || "")} (<i>${act.ist || act.time}</i>)\n`;
    });
  }

  html += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n🕒 <b>IST Time:</b> <code>${formatDateIST()}</code>`;
  return html;
}

export function buildDashboardKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Refresh Metrics", callback_data: "p:dash:refresh" },
        { text: "📈 Export Analytics", callback_data: "p:stats:export" }
      ],
      [
        { text: "🏥 Health Diagnostics", callback_data: "p:health" },
        { text: "📜 Activity Logs", callback_data: "p:logs" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
}
