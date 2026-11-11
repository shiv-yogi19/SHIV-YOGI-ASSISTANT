/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: notifications.js
 * Centralized notification engine for Owner and Admins,
 * with per-event toggles and deduplication protection.
 */

import { sendMessage, safeKvGet, safeKvPut, escapeHtml, formatDateIST } from "./helpers.js";

const DEFAULT_NOTIFICATIONS = {
  scheduled_success: true,
  scheduled_failure: true,
  new_reports: true,
  security_alerts: true,
  captcha_expiry: false,
  backup_success: true,
  automation_events: true
};

export async function getNotificationSettings(env) {
  const custom = await safeKvGet(env, "settings:notifications", "json");
  return { ...DEFAULT_NOTIFICATIONS, ...(custom || {}) };
}

export async function saveNotificationSettings(env, settings) {
  return await safeKvPut(env, "settings:notifications", settings);
}

export async function toggleNotification(env, key) {
  const settings = await getNotificationSettings(env);
  if (settings[key] === undefined) {
    settings[key] = true;
  } else {
    settings[key] = !settings[key];
  }
  await saveNotificationSettings(env, settings);
  return settings[key];
}

export async function sendNotification(env, type, title, messageText, extra = {}) {
  if (!env || !env.OWNER_ID) return false;

  const settings = await getNotificationSettings(env);

  // Check if type is enabled
  const mapping = {
    scheduled_post_success: "scheduled_success",
    scheduled_post_failure: "scheduled_failure",
    new_report: "new_reports",
    security_alert: "security_alerts",
    captcha_expired: "captcha_expiry",
    backup_completed: "backup_success",
    automation_status: "automation_events"
  };

  const configKey = mapping[type];
  if (configKey && settings[configKey] === false) {
    return false; // Silenced by user preference
  }

  // Deduplication check: prevent same notification from being spammed within 60 seconds
  const dedupContent = `${type}:${title}:${messageText}`.slice(0, 100);
  const dedupKey = `notif_dedup:${dedupContent.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const seen = await safeKvGet(env, dedupKey, "text");
  if (seen) return false;
  await safeKvPut(env, dedupKey, "1", { expirationTtl: 60 });

  const formattedMsg = `🔔 <b>${escapeHtml(title)}</b>\n━━━━━━━━━━━━━━━━━━━━\n${messageText}\n━━━━━━━━━━━━━━━━━━━━\n⏱ <i>${formatDateIST()}</i>`;

  return await sendMessage(env, env.OWNER_ID, formattedMsg, {
    disable_web_page_preview: true
  });
}
