/**
 * MODULE: admin-manager.js
 * Admin appointment, granular permissions, temporary managers, and activity auditing.
 */

import { escapeHtml, formatDateIST } from "./helpers.js";
import { logSecurityEvent } from "./security.js";

export async function listAdmins(env) {
  const list = await env.BOT_DATA.list({ prefix: "admins:" });
  const result = [];
  for (const k of list.keys) {
    const data = await env.BOT_DATA.get(k.name, "json");
    if (data) result.push(data);
  }
  return result;
}

export async function addAdmin(env, userId, permissions = {}) {
  const idStr = String(userId).trim();
  const defaultPerms = {
    can_post_channel: true,
    can_moderate_group: true,
    can_view_stats: true,
    can_view_logs: true,
    can_manage_schedule: false,
    can_manage_templates: false,
    ...permissions
  };
  const record = {
    user_id: idStr,
    added_at: Date.now(),
    active: true,
    permissions: defaultPerms
  };
  await env.BOT_DATA.put(`admins:${idStr}`, JSON.stringify(record));
  await logSecurityEvent(env, "owner", "admin_added", `Appointed admin ID: ${idStr}`);
  return record;
}

export async function removeAdmin(env, userId) {
  const idStr = String(userId).trim();
  await env.BOT_DATA.delete(`admins:${idStr}`);
  await logSecurityEvent(env, "owner", "admin_removed", `Removed admin ID: ${idStr}`);
  return true;
}

export async function listTempManagers(env) {
  const list = await env.BOT_DATA.list({ prefix: "temp_managers:" });
  const result = [];
  const now = Date.now();
  for (const k of list.keys) {
    const data = await env.BOT_DATA.get(k.name, "json");
    if (data && data.expires_at) {
      if (now > data.expires_at) {
        await env.BOT_DATA.delete(k.name);
      } else {
        result.push(data);
      }
    }
  }
  return result;
}

export async function addTempManager(env, userId, durationMinutes, permissions = {}) {
  const idStr = String(userId).trim();
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  const record = {
    user_id: idStr,
    added_at: Date.now(),
    expires_at: expiresAt,
    permissions: {
      can_post_channel: true,
      can_moderate_group: true,
      can_view_stats: false,
      can_view_logs: false,
      can_manage_schedule: false,
      can_manage_templates: false,
      ...permissions
    }
  };
  await env.BOT_DATA.put(`temp_managers:${idStr}`, JSON.stringify(record));
  await logSecurityEvent(env, "owner", "temp_manager_added", `Appointed manager ${idStr} for ${durationMinutes}m`);
  return record;
}

export async function revokeTempManager(env, userId) {
  const idStr = String(userId).trim();
  await env.BOT_DATA.delete(`temp_managers:${idStr}`);
  await logSecurityEvent(env, "owner", "temp_manager_revoked", `Revoked temporary manager ${idStr}`);
  return true;
}
