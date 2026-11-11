/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: health.js
 * Comprehensive system diagnostics, real-time API latency,
 * KV read/write probes, and honest operational status reporting.
 */

import { getMe, getWebhookInfo, safeKvGet, safeKvPut, safeKvDelete, formatDateIST } from "./helpers.js";

export async function runHealthCheck(env) {
  const now = Date.now();
  const report = {
    timestamp: new Date(now).toISOString(),
    ist_time: formatDateIST(now),
    worker_status: "ACTIVE",
    kv_status: "UNKNOWN",
    telegram_api_status: "UNKNOWN",
    bot_username: null,
    bot_id: null,
    webhook_status: "UNKNOWN",
    webhook_url: null,
    pending_updates: 0,
    last_webhook_error: null,
    cron_last_run: null,
    scheduled_failures: 0,
    recent_api_errors: 0,
    overall_status: "HEALTHY",
    errors: []
  };

  // 1. KV Storage Probe (Read/Write/Delete)
  if (!env || !env.BOT_DATA) {
    report.kv_status = "FAILED";
    report.errors.push("KV namespace BOT_DATA is not bound");
    report.overall_status = "DOWN";
  } else {
    try {
      const probeKey = `probe:health_${now}`;
      const probeVal = `test_${now}`;
      await env.BOT_DATA.put(probeKey, probeVal, { expirationTtl: 60 });
      const readVal = await env.BOT_DATA.get(probeKey);
      await env.BOT_DATA.delete(probeKey);

      if (readVal === probeVal) {
        report.kv_status = "HEALTHY";
      } else {
        report.kv_status = "DEGRADED";
        report.errors.push("KV probe read mismatch");
        report.overall_status = "DEGRADED";
      }
    } catch (kvErr) {
      report.kv_status = "FAILED";
      report.errors.push(`KV Probe Exception: ${kvErr.message}`);
      report.overall_status = "DOWN";
    }
  }

  // 2. Telegram API Connectivity & Identity Probe
  try {
    const meRes = await getMe(env);
    if (meRes && meRes.ok && meRes.result) {
      report.telegram_api_status = "CONNECTED";
      report.bot_username = meRes.result.username || "shiv_yogi_assist_bot";
      report.bot_id = meRes.result.id;
    } else {
      report.telegram_api_status = "DISCONNECTED";
      report.errors.push(`Telegram API getMe failed: ${meRes?.description || "Unknown error"}`);
      report.overall_status = "DOWN";
    }
  } catch (apiErr) {
    report.telegram_api_status = "ERROR";
    report.errors.push(`Telegram API Exception: ${apiErr.message}`);
    report.overall_status = "DOWN";
  }

  // 3. Telegram Webhook Status Probe
  try {
    const hookRes = await getWebhookInfo(env);
    if (hookRes && hookRes.ok && hookRes.result) {
      report.webhook_status = hookRes.result.url ? "REGISTERED" : "NOT_REGISTERED";
      report.webhook_url = hookRes.result.url || null;
      report.pending_updates = hookRes.result.pending_update_count || 0;
      report.last_webhook_error = hookRes.result.last_error_message || null;

      if (report.last_webhook_error) {
        report.overall_status = report.overall_status === "DOWN" ? "DOWN" : "DEGRADED";
      }
    } else {
      report.webhook_status = "QUERY_FAILED";
    }
  } catch (hookErr) {
    report.webhook_status = "QUERY_EXCEPTION";
  }

  // 4. Cron & Scheduler Heartbeat
  const cronInfo = await safeKvGet(env, "cron:last_run", "json");
  if (cronInfo) {
    report.cron_last_run = cronInfo.ist || formatDateIST(cronInfo.timestamp);
    report.scheduled_failures = cronInfo.errors || 0;
  } else {
    report.cron_last_run = "Never (Waiting for first 1-minute trigger)";
  }

  return report;
}

export function formatHealthHTML(report) {
  const badge =
    report.overall_status === "HEALTHY" ? "🟢 HEALTHY" :
    report.overall_status === "DEGRADED" ? "🟡 DEGRADED" : "🔴 DOWN";

  let html = `🏥 <b>SYSTEM HEALTH REPORT</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  html += `Status: <b>${badge}</b>\n`;
  html += `Worker: <code>${report.worker_status}</code>\n`;
  html += `KV Storage: <code>${report.kv_status}</code>\n`;
  html += `Telegram API: <code>${report.telegram_api_status}</code>\n`;
  html += `Bot Username: <code>@${report.bot_username || "Unknown"}</code>\n`;
  html += `Webhook: <code>${report.webhook_status}</code> (Pending: ${report.pending_updates})\n`;
  html += `Last Cron Run: <i>${report.cron_last_run}</i>\n`;
  html += `Current IST: <i>${report.ist_time}</i>\n`;

  if (report.last_webhook_error) {
    html += `\n⚠️ <b>Webhook Error:</b>\n<code>${report.last_webhook_error}</code>\n`;
  }

  if (report.errors.length > 0) {
    html += `\n🚨 <b>Issues Detected:</b>\n`;
    report.errors.forEach(e => {
      html += `• ${e}\n`;
    });
  }

  return html;
}
