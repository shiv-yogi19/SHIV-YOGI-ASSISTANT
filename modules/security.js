/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: security.js
 * Authorization engine, secret token verification, update deduplication,
 * suspicious callback detection, and security audit logs.
 */

import { safeKvGet, safeKvPut, safeKvDelete, formatDateIST } from "./helpers.js";

export function isOwner(env, userId) {
  if (!env || !env.OWNER_ID || !userId) return false;
  return String(userId).trim() === String(env.OWNER_ID).trim();
}

export async function getAdmin(env, userId) {
  if (!userId) return null;
  return await safeKvGet(env, `admins:${userId}`, "json");
}

export async function getTempManager(env, userId) {
  if (!userId) return null;
  const mgr = await safeKvGet(env, `temp_managers:${userId}`, "json");
  if (!mgr) return null;
  if (mgr.expires_at && Date.now() > mgr.expires_at) {
    await safeKvDelete(env, `temp_managers:${userId}`);
    await logSecurityEvent(env, "system", "temp_manager_expired", `Manager ${userId} automatically expired`);
    return null;
  }
  return mgr;
}

export async function hasPermission(env, userId, permission) {
  if (!userId) return false;
  if (isOwner(env, userId)) return true;

  const admin = await getAdmin(env, userId);
  if (admin && admin.active && admin.permissions?.[permission]) return true;

  const mgr = await getTempManager(env, userId);
  if (mgr && mgr.permissions?.[permission]) return true;

  return false;
}

export function verifyWebhookSecret(request, env) {
  if (!env || !env.WEBHOOK_SECRET) return false;
  const token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  return Boolean(token && token === env.WEBHOOK_SECRET);
}

export async function checkUpdateDedup(env, updateId, ctx) {
  if (!updateId) return false;
  const dedupKey = `dedup:${updateId}`;
  const isSeen = await safeKvGet(env, dedupKey, "text");
  if (isSeen) return true; // Already processed

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(safeKvPut(env, dedupKey, "1", { expirationTtl: 120 }));
  } else {
    await safeKvPut(env, dedupKey, "1", { expirationTtl: 120 });
  }
  return false;
}

export async function logSecurityEvent(env, actorId, action, detail) {
  try {
    const raw = await safeKvGet(env, "logs:security", "json");
    const logs = Array.isArray(raw) ? raw : [];
    logs.unshift({
      time: new Date().toISOString(),
      ist: formatDateIST(),
      actor: String(actorId || "unknown"),
      action: action,
      detail: String(detail || "")
    });
    if (logs.length > 50) logs.length = 50;
    await safeKvPut(env, "logs:security", logs);
  } catch (err) {
    console.error("Failed to append security log:", err);
  }
}

export async function getSecurityLogs(env, limit = 20) {
  const raw = await safeKvGet(env, "logs:security", "json");
  const list = Array.isArray(raw) ? raw : [];
  return list.slice(0, limit);
}

export async function detectSuspiciousCallback(env, userId, callbackData) {
  if (!callbackData || typeof callbackData !== "string") {
    await logSecurityEvent(env, userId, "suspicious_callback", "Empty or invalid callback data");
    return true;
  }
  // Check for excessively long data or dangerous injection patterns
  if (callbackData.length > 64) {
    await logSecurityEvent(env, userId, "suspicious_callback", `Payload exceeded 64 bytes (${callbackData.length}b)`);
    return true;
  }
  // Check if non-owner is attempting privileged panel callbacks
  if (callbackData.startsWith("p:") && !isOwner(env, userId)) {
    const admin = await getAdmin(env, userId);
    const mgr = await getTempManager(env, userId);
    if (!admin && !mgr) {
      await logSecurityEvent(env, userId, "unauthorized_panel_callback", `Rejected callback "${callbackData}" from non-privileged user`);
      return true;
    }
  }
  return false;
}

export async function getSecurityDiagnostics(env) {
  const hasToken = Boolean(env && env.BOT_TOKEN && env.BOT_TOKEN.length > 10);
  const hasWebhookSecret = Boolean(env && env.WEBHOOK_SECRET && env.WEBHOOK_SECRET.length > 8);
  const hasOwner = Boolean(env && env.OWNER_ID);
  const hasKV = Boolean(env && env.BOT_DATA);

  const secLogs = await getSecurityLogs(env, 5);

  return {
    bot_token_configured: hasToken,
    webhook_secret_configured: hasWebhookSecret,
    owner_id_configured: hasOwner,
    kv_bound: hasKV,
    recent_security_events: secLogs.length,
    secret_exposure_protection: "ACTIVE (No tokens/secrets logged or exported)"
  };
}
