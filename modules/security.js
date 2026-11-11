/**
 * MODULE: security.js
 * Authorization engine, secret verification, deduplication, and security audit logs.
 */

export function isOwner(env, userId) {
  if (!env.OWNER_ID || !userId) return false;
  return String(userId).trim() === String(env.OWNER_ID).trim();
}

export async function getAdmin(env, userId) {
  return await env.BOT_DATA.get(`admins:${userId}`, "json");
}

export async function getTempManager(env, userId) {
  const mgr = await env.BOT_DATA.get(`temp_managers:${userId}`, "json");
  if (!mgr) return null;
  if (mgr.expires_at && Date.now() > mgr.expires_at) {
    await env.BOT_DATA.delete(`temp_managers:${userId}`);
    await logSecurityEvent(env, "system", "temp_manager_expired", `Manager ${userId} automatically expired`);
    return null;
  }
  return mgr;
}

export async function hasPermission(env, userId, permission) {
  if (isOwner(env, userId)) return true;
  const admin = await getAdmin(env, userId);
  if (admin && admin.active && admin.permissions?.[permission]) return true;
  const mgr = await getTempManager(env, userId);
  if (mgr && mgr.permissions?.[permission]) return true;
  return false;
}

export function verifyWebhookSecret(request, env) {
  if (!env.WEBHOOK_SECRET) return false;
  const token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  return Boolean(token && token === env.WEBHOOK_SECRET);
}

export async function checkUpdateDedup(env, updateId, ctx) {
  if (!updateId) return false;
  const dedupKey = `dedup:${updateId}`;
  const isSeen = await env.BOT_DATA.get(dedupKey);
  if (isSeen) return true;
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(env.BOT_DATA.put(dedupKey, "1", { expirationTtl: 120 }));
  } else {
    await env.BOT_DATA.put(dedupKey, "1", { expirationTtl: 120 });
  }
  return false;
}

export async function logSecurityEvent(env, actorId, action, detail) {
  try {
    const raw = await env.BOT_DATA.get("logs:recent", "json");
    const logs = Array.isArray(raw) ? raw : [];
    logs.unshift({
      time: new Date().toISOString(),
      actor: String(actorId),
      action: action,
      detail: detail
    });
    if (logs.length > 50) logs.length = 50;
    await env.BOT_DATA.put("logs:recent", JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to write security log:", err);
  }
}
