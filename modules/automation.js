/**
 * MODULE: automation.js
 * Automated daily announcements, automated backups, pin management, and task automation.
 */

import { sendMessage, getSettings, getTemplates, formatDateIST } from "./helpers.js";
import { publishPost, getChannelsList } from "./channel-manager.js";
import { logSecurityEvent } from "./security.js";

export async function getAutomationSettings(env) {
  const custom = await env.BOT_DATA.get("settings:automation", "json");
  return {
    daily_announcement_enabled: false,
    daily_announcement_hour: 9, // 9 AM IST
    daily_announcement_template: "daily_wallpaper",
    auto_backup_enabled: true,
    auto_unpin_hours: 0, // 0 = disabled
    ...(custom || {})
  };
}

export async function saveAutomationSettings(env, config) {
  await env.BOT_DATA.put("settings:automation", JSON.stringify(config));
}

export async function runAutomationCycle(env) {
  const autoConfig = await getAutomationSettings(env);
  const now = new Date();
  // Compute current hour in Asia/Kolkata
  const istHour = parseInt(
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(now),
    10
  );

  const results = [];

  // 1. Daily Announcement Check
  if (autoConfig.daily_announcement_enabled && istHour === autoConfig.daily_announcement_hour) {
    const todayKey = `auto:daily_done:${now.toISOString().slice(0, 10)}`;
    const alreadyDone = await env.BOT_DATA.get(todayKey);
    if (!alreadyDone) {
      const templates = await getTemplates(env);
      const text = templates[autoConfig.daily_announcement_template] || templates.daily_wallpaper;
      const settings = await getSettings(env);
      if (settings.channel_id && text) {
        const r = await publishPost(env, settings.channel_id, { type: "text", text: text });
        if (r.ok) {
          await env.BOT_DATA.put(todayKey, "1", { expirationTtl: 86400 });
          results.push("daily_announcement_published");
          await logSecurityEvent(env, "automation", "daily_announcement_published", `Sent at ${formatDateIST()}`);
        }
      }
    }
  }

  // 2. Automated Daily Backup Snapshot
  if (autoConfig.auto_backup_enabled) {
    const todayBackupKey = `auto:backup_done:${now.toISOString().slice(0, 10)}`;
    const alreadyBackedUp = await env.BOT_DATA.get(todayBackupKey);
    if (!alreadyBackedUp) {
      const settings = await getSettings(env);
      const features = await env.BOT_DATA.get("settings:features", "json");
      const adminsList = await env.BOT_DATA.list({ prefix: "admins:" });
      const admins = {};
      for (const k of adminsList.keys) {
        admins[k.name] = await env.BOT_DATA.get(k.name, "json");
      }
      const snapshot = {
        date: new Date().toISOString(),
        ist: formatDateIST(),
        settings,
        features,
        admins
      };
      await env.BOT_DATA.put("backup:auto_latest", JSON.stringify(snapshot));
      await env.BOT_DATA.put(todayBackupKey, "1", { expirationTtl: 86400 });
      results.push("auto_backup_created");
      await logSecurityEvent(env, "automation", "auto_backup_created", "Created daily KV snapshot");
    }
  }

  return results;
}
