/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: automation.js
 * Automation Center: automated daily announcements, scheduled daily backups,
 * temporary manager expiration sweeps, and session garbage collection.
 */

import { safeKvGet, safeKvPut, getISTHour, getISTDateString, formatDateIST } from "./helpers.js";
import { getTemplates } from "./templates.js";
import { getSettings } from "./settings.js";
import { publishPost } from "./channel-manager.js";
import { cleanExpiredTempManagers } from "./admin-manager.js";
import { createFullBackup } from "./backup.js";
import { logSecurityEvent } from "./security.js";
import { sendNotification } from "./notifications.js";

export async function getAutomationSettings(env) {
  const custom = await safeKvGet(env, "settings:automation", "json");
  return {
    daily_announcement_enabled: false,
    daily_announcement_hour: 9, // 9 AM IST
    daily_announcement_template: "daily_wallpaper",
    auto_backup_enabled: true,
    ...(custom || {})
  };
}

export async function saveAutomationSettings(env, config) {
  return await safeKvPut(env, "settings:automation", config);
}

export async function runAutomationCycle(env) {
  const autoConfig = await getAutomationSettings(env);
  const now = Date.now();
  const istHour = getISTHour(now);
  const todayDateStr = getISTDateString(now);

  const results = [];

  // 1. Daily Wallpaper Announcement Routine
  if (autoConfig.daily_announcement_enabled && istHour === autoConfig.daily_announcement_hour) {
    const todayKey = `auto:daily_done:${todayDateStr}`;
    const alreadyDone = await safeKvGet(env, todayKey, "text");
    if (!alreadyDone) {
      const templates = await getTemplates(env);
      const text = templates[autoConfig.daily_announcement_template] || templates.daily_wallpaper;
      const settings = await getSettings(env);
      if (settings.channel_id && text) {
        const res = await publishPost(env, settings.channel_id, { type: "text", text: text });
        if (res.ok) {
          await safeKvPut(env, todayKey, "1", { expirationTtl: 86400 * 2 });
          results.push("daily_announcement_published");
          await logSecurityEvent(env, "automation", "daily_announcement_published", `Sent at ${formatDateIST(now)}`);
          await sendNotification(
            env,
            "automation_status",
            "Automation: Daily Post",
            `Daily announcement was automatically published to <code>${settings.channel_id}</code>.`
          );
        }
      }
    }
  }

  // 2. Automated Daily KV Backup Snapshot
  if (autoConfig.auto_backup_enabled) {
    const todayBackupKey = `auto:backup_done:${todayDateStr}`;
    const alreadyBackedUp = await safeKvGet(env, todayBackupKey, "text");
    if (!alreadyBackedUp) {
      try {
        const backupJson = await createFullBackup(env);
        await safeKvPut(env, "backup:auto_latest", backupJson);
        await safeKvPut(env, todayBackupKey, "1", { expirationTtl: 86400 * 2 });
        results.push("auto_backup_created");
        await logSecurityEvent(env, "automation", "auto_backup_created", "Created daily automated snapshot");
        await sendNotification(
          env,
          "backup_completed",
          "Automated Backup Complete",
          `Daily automated backup successfully captured at ${formatDateIST(now)}.`
        );
      } catch (err) {
        console.error("Auto backup failure:", err);
      }
    }
  }

  // 3. Clean Expired Temporary Managers
  const cleanedManagers = await cleanExpiredTempManagers(env);
  if (cleanedManagers > 0) {
    results.push(`cleaned_${cleanedManagers}_expired_managers`);
  }

  return results;
}
