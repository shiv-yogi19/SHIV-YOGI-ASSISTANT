/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: reports.js
 * Community message report management: submission, duplicate prevention,
 * admin review workflows (approve/reject/resolve), and status history.
 */

import { safeKvGet, safeKvPut, formatDateIST } from "./helpers.js";
import { sendNotification } from "./notifications.js";

export async function submitReport(env, {
  chatId,
  reportedUserId,
  reporterId,
  messageId = null,
  text = "",
  reason = "Spam / Inappropriate"
}) {
  // Prevent duplicate report for the same message by the same user within 24h
  const dedupKey = `rep_dedup:${chatId}:${messageId || reportedUserId}:${reporterId}`;
  const seen = await safeKvGet(env, dedupKey, "text");
  if (seen) {
    return { ok: false, duplicate: true, error: "You have already reported this item." };
  }
  await safeKvPut(env, dedupKey, "1", { expirationTtl: 86400 });

  const reportId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const record = {
    id: reportId,
    chat_id: String(chatId),
    reported_user_id: String(reportedUserId),
    reporter_id: String(reporterId),
    message_id: messageId,
    text: (text || "").slice(0, 200),
    reason: (reason || "").slice(0, 100),
    status: "pending", // "pending" | "approved" | "rejected" | "resolved"
    created_at: Date.now(),
    created_ist: formatDateIST(),
    resolved_by: null,
    resolved_at: null,
    notes: []
  };

  await safeKvPut(env, `report:${reportId}`, record);

  // Update index list
  const listRaw = await safeKvGet(env, "reports:list", "json");
  const list = Array.isArray(listRaw) ? listRaw : [];
  list.unshift(reportId);
  if (list.length > 100) list.length = 100;
  await safeKvPut(env, "reports:list", list);

  // Send admin notification
  await sendNotification(
    env,
    "new_report",
    `New Report (#${reportId})`,
    `Reported User: <code>${reportedUserId}</code>\nReporter: <code>${reporterId}</code>\nReason: <i>${record.reason}</i>`
  );

  return { ok: true, report: record };
}

export async function getReport(env, reportId) {
  return await safeKvGet(env, `report:${reportId}`, "json");
}

export async function getReportsList(env, statusFilter = null, page = 1, pageSize = 5) {
  const listRaw = await safeKvGet(env, "reports:list", "json");
  const idList = Array.isArray(listRaw) ? listRaw : [];

  const reports = [];
  for (const id of idList) {
    const r = await getReport(env, id);
    if (!r) continue;
    if (!statusFilter || r.status === statusFilter) {
      reports.push(r);
    }
  }

  const total = reports.length;
  const start = (page - 1) * pageSize;
  const paged = reports.slice(start, start + pageSize);

  return {
    items: paged,
    total: total,
    page: page,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function updateReportStatus(env, reportId, status, adminId, note = null) {
  const report = await getReport(env, reportId);
  if (!report) return { ok: false, error: "Report not found" };

  report.status = status;
  report.resolved_by = String(adminId);
  report.resolved_at = Date.now();
  report.resolved_ist = formatDateIST();

  if (note) {
    report.notes.push({
      author: String(adminId),
      text: String(note),
      time: formatDateIST()
    });
  }

  await safeKvPut(env, `report:${reportId}`, report);
  return { ok: true, report: report };
}

export async function addReportNote(env, reportId, adminId, noteText) {
  const report = await getReport(env, reportId);
  if (!report) return { ok: false, error: "Report not found" };

  report.notes = report.notes || [];
  report.notes.push({
    author: String(adminId),
    text: String(noteText),
    time: formatDateIST()
  });

  await safeKvPut(env, `report:${reportId}`, report);
  return { ok: true, report: report };
}
