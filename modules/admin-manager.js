/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: admin-manager.js
 * Administrator appointments, granular permission assignments,
 * temporary manager lifecycles with auto-expiration, and security guardrails.
 */

import { safeKvGet, safeKvPut, safeKvDelete, safeKvList, formatDateIST } from "./helpers.js";
import { logSecurityEvent } from "./security.js";

export const PERMISSION_KEYS = [
  "can_post_channel",
  "can_moderate_group",
  "can_view_stats",
  "can_view_logs",
  "can_manage_scheduled_posts",
  "can_manage_reports",
  "can_manage_content"
];

export async function listAdmins(env) {
  const list = await safeKvList(env, "admins:");
  const result = [];
  for (const k of list.keys) {
    const data = await safeKvGet(env, k.name, "json");
    if (data) result.push(data);
  }
  return result;
}

export async function addAdmin(env, userId, permissions = {}) {
  const idStr = String(userId).trim();
  const perms = {};
  for (const pk of PERMISSION_KEYS) {
    perms[pk] = Boolean(permissions[pk] !== undefined ? permissions[pk] : true);
  }

  const record = {
    user_id: idStr,
    added_at: Date.now(),
    added_ist: formatDateIST(),
    active: true,
    permissions: perms
  };

  await safeKvPut(env, `admins:${idStr}`, record);
  await logSecurityEvent(env, "owner", "admin_added", `Appointed admin ID: ${idStr}`);
  return record;
}

export async function removeAdmin(env, userId) {
  const idStr = String(userId).trim();
  await safeKvDelete(env, `admins:${idStr}`);
  await logSecurityEvent(env, "owner", "admin_removed", `Removed admin ID: ${idStr}`);
  return true;
}

export async function updateAdminPermissions(env, userId, permissions) {
  const idStr = String(userId).trim();
  const admin = await safeKvGet(env, `admins:${idStr}`, "json");
  if (!admin) return null;

  admin.permissions = { ...admin.permissions, ...permissions };
  await safeKvPut(env, `admins:${idStr}`, admin);
  await logSecurityEvent(env, "owner", "admin_perms_updated", `Updated permissions for ${idStr}`);
  return admin;
}

export async function listTempManagers(env) {
  const list = await safeKvList(env, "temp_managers:");
  const result = [];
  const now = Date.now();

  for (const k of list.keys) {
    const data = await safeKvGet(env, k.name, "json");
    if (data && data.expires_at) {
      if (now > data.expires_at) {
        await safeKvDelete(env, k.name);
      } else {
        result.push(data);
      }
    }
  }
  return result;
}

export async function addTempManager(env, userId, durationMinutes = 60, permissions = {}) {
  const idStr = String(userId).trim();
  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;

  const perms = {};
  for (const pk of PERMISSION_KEYS) {
    // Default temporary managers to channel and moderation perms
    const def = pk === "can_post_channel" || pk === "can_moderate_group";
    perms[pk] = Boolean(permissions[pk] !== undefined ? permissions[pk] : def);
  }

  const record = {
    user_id: idStr,
    added_at: now,
    added_ist: formatDateIST(now),
    expires_at: expiresAt,
    expires_ist: formatDateIST(expiresAt),
    duration_minutes: durationMinutes,
    permissions: perms
  };

  await safeKvPut(env, `temp_managers:${idStr}`, record);
  await logSecurityEvent(env, "owner", "temp_manager_added", `Appointed manager ${idStr} for ${durationMinutes}m`);
  return record;
}

export async function revokeTempManager(env, userId) {
  const idStr = String(userId).trim();
  await safeKvDelete(env, `temp_managers:${idStr}`);
  await logSecurityEvent(env, "owner", "temp_manager_revoked", `Revoked temporary manager ${idStr}`);
  return true;
}

export async function cleanExpiredTempManagers(env) {
  const list = await safeKvList(env, "temp_managers:");
  const now = Date.now();
  let cleaned = 0;

  for (const k of list.keys) {
    const data = await safeKvGet(env, k.name, "json");
    if (data && data.expires_at && now > data.expires_at) {
      await safeKvDelete(env, k.name);
      cleaned++;
    }
  }
  return cleaned;
}
