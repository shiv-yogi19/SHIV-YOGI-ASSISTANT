/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: settings.js
 * Persistent configuration management, feature flags toggling,
 * and strict setting validation.
 */

import { DEFAULT_CONTENT, safeKvGet, safeKvPut, safeKvDelete } from "./helpers.js";

export async function getSettings(env) {
  const custom = await safeKvGet(env, "settings:config", "json");
  return { ...DEFAULT_CONTENT.settings, ...(custom || {}) };
}

export async function saveSettings(env, settings) {
  return await safeKvPut(env, "settings:config", settings);
}

export function validateSetting(key, rawValue) {
  if (rawValue === undefined || rawValue === null) {
    return { valid: false, error: "Value cannot be empty" };
  }
  const str = String(rawValue).trim();

  switch (key) {
    case "owner_name":
      if (str.length < 2 || str.length > 64) {
        return { valid: false, error: "Owner display name must be between 2 and 64 characters" };
      }
      return { valid: true, sanitizedValue: str };

    case "contact_username": {
      const username = str.replace(/^@/, "");
      if (!/^[a-zA-Z0-9_]{4,32}$/.test(username)) {
        return { valid: false, error: "Invalid Telegram username (4-32 alphanumeric characters and underscores)" };
      }
      return { valid: true, sanitizedValue: username };
    }

    case "channel_id":
      if (!str.startsWith("@") && !/^-\d+$/.test(str)) {
        return { valid: false, error: "Channel ID must be a @username or negative numeric ID (e.g. -1001234567890)" };
      }
      return { valid: true, sanitizedValue: str };

    case "group_id":
      if (!str.startsWith("@") && !/^-\d+$/.test(str)) {
        return { valid: false, error: "Group ID must be a @username or negative numeric ID (e.g. -1001234567890)" };
      }
      return { valid: true, sanitizedValue: str };

    case "wallpaper_channel_url":
    case "channel_url":
      if (!str.startsWith("https://t.me/")) {
        return { valid: false, error: "Channel URL must begin with https://t.me/" };
      }
      return { valid: true, sanitizedValue: str };

    case "repeat_cooldown_seconds":
    case "cooldown": {
      const num = parseInt(str, 10);
      if (isNaN(num) || num < 5 || num > 3600) {
        return { valid: false, error: "Repeat reply cooldown must be an integer between 5 and 3600 seconds" };
      }
      return { valid: true, sanitizedValue: num };
    }

    case "anti_flood_threshold": {
      const num = parseInt(str, 10);
      if (isNaN(num) || num < 2 || num > 50) {
        return { valid: false, error: "Anti-flood threshold must be an integer between 2 and 50 messages" };
      }
      return { valid: true, sanitizedValue: num };
    }

    case "anti_flood_window_seconds": {
      const num = parseInt(str, 10);
      if (isNaN(num) || num < 1 || num > 60) {
        return { valid: false, error: "Anti-flood time window must be an integer between 1 and 60 seconds" };
      }
      return { valid: true, sanitizedValue: num };
    }

    case "warn_limit":
    case "warning_limit": {
      const num = parseInt(str, 10);
      if (isNaN(num) || num < 1 || num > 20) {
        return { valid: false, error: "Warning limit must be an integer between 1 and 20" };
      }
      return { valid: true, sanitizedValue: num };
    }

    case "default_language":
      if (str !== "en" && str !== "hi") {
        return { valid: false, error: "Supported languages are 'en' (English) and 'hi' (Hindi)" };
      }
      return { valid: true, sanitizedValue: str };

    case "timezone":
      try {
        new Intl.DateTimeFormat("en", { timeZone: str }).format(new Date());
        return { valid: true, sanitizedValue: str };
      } catch (e) {
        return { valid: false, error: "Invalid IANA timezone identifier (e.g. Asia/Kolkata)" };
      }

    case "maintenance_mode": {
      const boolVal = str === "true" || str === "1";
      return { valid: true, sanitizedValue: boolVal };
    }

    default:
      return { valid: true, sanitizedValue: str };
  }
}

export async function updateSetting(env, key, rawValue) {
  const check = validateSetting(key, rawValue);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }
  const settings = await getSettings(env);
  settings[key] = check.sanitizedValue;
  await saveSettings(env, settings);
  return { ok: true, value: check.sanitizedValue };
}

export async function getFeatures(env) {
  const custom = await safeKvGet(env, "settings:features", "json");
  return { ...DEFAULT_CONTENT.features, ...(custom || {}) };
}

export async function saveFeatures(env, features) {
  return await safeKvPut(env, "settings:features", features);
}

export async function toggleFeature(env, featureKey) {
  const feats = await getFeatures(env);
  if (feats[featureKey] === undefined) {
    feats[featureKey] = true;
  } else {
    feats[featureKey] = !feats[featureKey];
  }
  await saveFeatures(env, feats);
  return feats[featureKey];
}

export async function resetAllSettings(env) {
  await safeKvDelete(env, "settings:config");
  await safeKvDelete(env, "settings:features");
  return true;
}
