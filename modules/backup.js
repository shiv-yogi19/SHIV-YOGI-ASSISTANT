/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: backup.js
 * Backup & Restore Center: schema validation, safe configuration export,
 * strict credential redaction, and restoration auditing.
 */

import { safeKvGet, safeKvPut, safeKvList, formatDateIST } from "./helpers.js";
import { getSettings, saveSettings, getFeatures, saveFeatures } from "./settings.js";
import { getTemplates } from "./templates.js";
import { getNotificationSettings, saveNotificationSettings } from "./notifications.js";
import { getAutomationSettings, saveAutomationSettings } from "./automation.js";
import { logSecurityEvent } from "./security.js";

export async function createFullBackup(env) {
  const settings = await getSettings(env);
  const features = await getFeatures(env);
  const templates = await getTemplates(env);
  const notifs = await getNotificationSettings(env);
  const automation = await getAutomationSettings(env);

  const adminsList = await safeKvList(env, "admins:");
  const admins = {};
  for (const k of adminsList.keys) {
    admins[k.name] = await safeKvGet(env, k.name, "json");
  }

  const customMsgs = {};
  const msgsList = await safeKvList(env, "messages:");
  for (const k of msgsList.keys) {
    customMsgs[k.name] = await safeKvGet(env, k.name, "text");
  }

  // Backup ID
  const backupId = `bk_${Date.now()}`;

  const backupData = {
    backup_id: backupId,
    version: "4.0.0",
    compatible_versions: ["2.0.0", "3.0.0", "4.0.0"],
    exported_at: new Date().toISOString(),
    exported_ist: formatDateIST(),
    bot: "SHIV YOGI ASSISTANT",
    settings: settings,
    features: features,
    templates: templates,
    notifications: notifs,
    automation: automation,
    admins: admins,
    custom_messages: customMsgs
  };

  // Record into backup history
  await recordBackupHistory(env, backupId, "manual", "Full configuration export created");

  return JSON.stringify(backupData, null, 2);
}

export function validateBackupSchema(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Backup data must be a valid JSON object" };
  }

  if (!data.version) {
    return { valid: false, error: "Missing version identifier in backup schema" };
  }

  // Version compatibility check
  const supported = ["2.0.0", "3.0.0", "4.0.0"];
  if (!supported.includes(data.version)) {
    return { valid: false, error: `Incompatible backup version: ${data.version}. Supported versions: ${supported.join(", ")}` };
  }

  // Ensure no sensitive credentials ever exist in backup
  delete data.BOT_TOKEN;
  delete data.WEBHOOK_SECRET;
  delete data.OWNER_ID;

  if (data.settings && typeof data.settings !== "object") {
    return { valid: false, error: "Malformed 'settings' structure" };
  }

  if (data.features && typeof data.features !== "object") {
    return { valid: false, error: "Malformed 'features' structure" };
  }

  return { valid: true, sanitized: data };
}

export async function restoreBackup(env, jsonString, actorId = "owner") {
  let rawData;
  try {
    rawData = JSON.parse(jsonString);
  } catch (err) {
    return { ok: false, error: `JSON Parse Error: ${err.message}` };
  }

  const check = validateBackupSchema(rawData);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }

  const data = check.sanitized;

  // Restore settings
  if (data.settings) {
    await saveSettings(env, data.settings);
  }

  // Restore features
  if (data.features) {
    await saveFeatures(env, data.features);
  }

  // Restore templates
  if (data.templates) {
    await safeKvPut(env, "settings:templates", data.templates);
  }

  // Restore notifications
  if (data.notifications) {
    await saveNotificationSettings(env, data.notifications);
  }

  // Restore automation
  if (data.automation) {
    await saveAutomationSettings(env, data.automation);
  }

  // Restore admins
  if (data.admins && typeof data.admins === "object") {
    for (const [k, v] of Object.entries(data.admins)) {
      if (k.startsWith("admins:")) {
        await safeKvPut(env, k, v);
      }
    }
  }

  // Restore custom messages
  if (data.custom_messages && typeof data.custom_messages === "object") {
    for (const [k, v] of Object.entries(data.custom_messages)) {
      if (k.startsWith("messages:")) {
        await safeKvPut(env, k, String(v));
      }
    }
  }

  await recordBackupHistory(env, data.backup_id || "unknown", actorId, "Backup restoration successfully applied");
  await logSecurityEvent(env, actorId, "backup_restored", `Restored backup payload (version: ${data.version})`);

  return { ok: true, version: data.version, exported_at: data.exported_at };
}

export async function recordBackupHistory(env, backupId, actorId, details) {
  try {
    const raw = await safeKvGet(env, "logs:backups", "json");
    const list = Array.isArray(raw) ? raw : [];
    list.unshift({
      id: backupId,
      time: new Date().toISOString(),
      ist: formatDateIST(),
      actor: String(actorId),
      details: details
    });
    if (list.length > 20) list.length = 20;
    await safeKvPut(env, "logs:backups", list);
  } catch (err) {
    console.error("Failed to append backup history:", err);
  }
}

export async function getBackupHistory(env) {
  const raw = await safeKvGet(env, "logs:backups", "json");
  return Array.isArray(raw) ? raw : [];
}
