/**
 * MODULE: backup.js
 * Safe JSON backup export, validation, and selective restoration (credentials excluded).
 */

import { getSettings, saveSettings, getFeatures, saveFeatures, getTemplates, formatDateIST } from "./helpers.js";
import { logSecurityEvent } from "./security.js";

export async function createFullBackup(env) {
  const settings = await getSettings(env);
  const features = await getFeatures(env);
  const templates = await getTemplates(env);

  const adminsList = await env.BOT_DATA.list({ prefix: "admins:" });
  const admins = {};
  for (const k of adminsList.keys) {
    admins[k.name] = await env.BOT_DATA.get(k.name, "json");
  }

  const customMsgs = {};
  const msgsList = await env.BOT_DATA.list({ prefix: "messages:" });
  for (const k of msgsList.keys) {
    customMsgs[k.name] = await env.BOT_DATA.get(k.name);
  }

  const backupData = {
    version: "2.0.0",
    exported_at: new Date().toISOString(),
    exported_ist: formatDateIST(),
    bot: "SHIV YOGI ASSISTANT",
    settings,
    features,
    templates,
    admins,
    custom_messages: customMsgs
  };

  return JSON.stringify(backupData, null, 2);
}

export async function restoreBackup(env, jsonString, actorId) {
  const data = JSON.parse(jsonString);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup payload format");
  }

  // Security sanitize: Never allow credentials to be imported
  delete data.BOT_TOKEN;
  delete data.WEBHOOK_SECRET;
  delete data.OWNER_ID;

  if (data.settings && typeof data.settings === "object") {
    await saveSettings(env, data.settings);
  }

  if (data.features && typeof data.features === "object") {
    await saveFeatures(env, data.features);
  }

  if (data.templates && typeof data.templates === "object") {
    await env.BOT_DATA.put("settings:templates", JSON.stringify(data.templates));
  }

  if (data.admins && typeof data.admins === "object") {
    for (const [k, v] of Object.entries(data.admins)) {
      if (k.startsWith("admins:")) {
        await env.BOT_DATA.put(k, JSON.stringify(v));
      }
    }
  }

  if (data.custom_messages && typeof data.custom_messages === "object") {
    for (const [k, v] of Object.entries(data.custom_messages)) {
      if (k.startsWith("messages:")) {
        await env.BOT_DATA.put(k, String(v));
      }
    }
  }

  await logSecurityEvent(env, actorId, "backup_restored", `Restored backup from ${data.exported_at || "unknown"}`);
  return true;
}
