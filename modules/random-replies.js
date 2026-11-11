/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: random-replies.js
 * Advanced Random Reply Engine
 *
 * Requirements & Features:
 * - Multiple replies per trigger
 * - Random reply selection from active/enabled variants
 * - No immediate consecutive repetition: does not reuse an enabled reply until all enabled replies have been served to the user
 * - Automatic reshuffle after completing a cycle
 * - Independent reply pools per trigger
 * - Per-user cycle persistence in Cloudflare KV
 * - Bilingual support (English & Hindi)
 * - Exact keyword, case-insensitive, and phrase matching modes
 * - Cooldown enforcement in private and group chats
 *
 * NOTE ON CONCURRENCY:
 * Cloudflare KV is eventually consistent and lacks atomic compare-and-set transactions.
 * This implementation achieves the strongest practical zero-repetition guarantee on KV
 * by persisting user cycle state and clearing it on cycle completion.
 */

import { safeKvGet, safeKvPut, safeKvDelete, escapeHtml } from "./helpers.js";
import { getRemainingReplyIds, markReplyUsed } from "./reply-history.js";
import { validateSafeHtml } from "./localization.js";
import { incrementStat } from "./statistics.js";

const DEFAULT_TRIGGERS = [
  {
    id: "trig_hello",
    keyword: "hello",
    match_mode: "contains", // "exact" | "contains"
    enabled: true,
    cooldown_seconds: 30,
    replies: [
      { id: "rep_h1", lang: "en", text: "Hello! Welcome to <b>SHIV YOGI ASSISTANT</b>.", enabled: true },
      { id: "rep_h2", lang: "hi", text: "नमस्ते! <b>शिव योगी असिस्टेंट</b> में आपका स्वागत है।", enabled: true },
      { id: "rep_h3", lang: "en", text: "Namaste! How may we assist you today?", enabled: true },
      { id: "rep_h4", lang: "en", text: "Greetings! Have a wonderful day exploring our wallpapers.", enabled: true }
    ]
  },
  {
    id: "trig_hi",
    keyword: "hi",
    match_mode: "exact",
    enabled: true,
    cooldown_seconds: 30,
    replies: [
      { id: "rep_hi1", lang: "en", text: "Hi there! Welcome to The Endless Playback.", enabled: true },
      { id: "rep_hi2", lang: "hi", text: "नमस्ते! हम आपकी क्या सहायता कर सकते हैं?", enabled: true },
      { id: "rep_hi3", lang: "en", text: "Hello friend! Check our latest drops with /start.", enabled: true }
    ]
  },
  {
    id: "trig_wallpaper",
    keyword: "wallpaper",
    match_mode: "contains",
    enabled: true,
    cooldown_seconds: 45,
    replies: [
      { id: "rep_w1", lang: "en", text: "🎨 Check our official collection at @the_endless_playback!", enabled: true },
      { id: "rep_w2", lang: "hi", text: "🎨 नए वॉलपेपर्स के लिए @the_endless_playback देखें!", enabled: true },
      { id: "rep_w3", lang: "en", text: "Looking for wallpapers? Join @the_endless_playback for daily releases!", enabled: true }
    ]
  }
];

export async function getTriggersList(env) {
  const custom = await safeKvGet(env, "rreply:triggers", "json");
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  return DEFAULT_TRIGGERS;
}

export async function saveTriggersList(env, list) {
  return await safeKvPut(env, "rreply:triggers", list);
}

export async function addTrigger(env, keyword, matchMode = "contains", cooldown = 30) {
  const cleanKeyword = String(keyword).trim().toLowerCase();
  if (!cleanKeyword) return { ok: false, error: "Trigger keyword is required." };

  const list = await getTriggersList(env);
  const exists = list.find(t => t.keyword === cleanKeyword);
  if (exists) return { ok: false, error: `Trigger for "${cleanKeyword}" already exists.` };

  const newId = `trig_${Date.now()}`;
  list.push({
    id: newId,
    keyword: cleanKeyword,
    match_mode: matchMode === "exact" ? "exact" : "contains",
    enabled: true,
    cooldown_seconds: Math.max(5, parseInt(cooldown, 10) || 30),
    replies: []
  });

  await saveTriggersList(env, list);
  return { ok: true, id: newId };
}

export async function deleteTrigger(env, triggerId) {
  const list = await getTriggersList(env);
  const filtered = list.filter(t => t.id !== triggerId);
  if (filtered.length === list.length) return { ok: false, error: "Trigger not found." };

  await saveTriggersList(env, filtered);
  return { ok: true };
}

export async function toggleTrigger(env, triggerId) {
  const list = await getTriggersList(env);
  const t = list.find(item => item.id === triggerId);
  if (!t) return { ok: false, error: "Trigger not found." };

  t.enabled = !t.enabled;
  await saveTriggersList(env, list);
  return { ok: true, enabled: t.enabled };
}

export async function addReplyToTrigger(env, triggerId, text, lang = "en") {
  const check = validateSafeHtml(text);
  if (!check.valid) return { ok: false, error: check.error };

  const list = await getTriggersList(env);
  const t = list.find(item => item.id === triggerId);
  if (!t) return { ok: false, error: `Trigger "${triggerId}" not found.` };

  const replyId = `rep_${Date.now()}`;
  if (!Array.isArray(t.replies)) t.replies = [];

  t.replies.push({
    id: replyId,
    lang: lang === "hi" ? "hi" : "en",
    text: text.trim(),
    enabled: true
  });

  await saveTriggersList(env, list);
  return { ok: true, id: replyId };
}

export async function deleteReplyFromTrigger(env, triggerId, replyId) {
  const list = await getTriggersList(env);
  const t = list.find(item => item.id === triggerId);
  if (!t || !Array.isArray(t.replies)) return { ok: false, error: "Trigger not found." };

  const origLen = t.replies.length;
  t.replies = t.replies.filter(r => r.id !== replyId);
  if (t.replies.length === origLen) return { ok: false, error: "Reply not found." };

  await saveTriggersList(env, list);
  return { ok: true };
}

export async function toggleReplyInTrigger(env, triggerId, replyId) {
  const list = await getTriggersList(env);
  const t = list.find(item => item.id === triggerId);
  if (!t || !Array.isArray(t.replies)) return { ok: false, error: "Trigger not found." };

  const r = t.replies.find(item => item.id === replyId);
  if (!r) return { ok: false, error: "Reply not found." };

  r.enabled = !r.enabled;
  await saveTriggersList(env, list);
  return { ok: true, enabled: r.enabled };
}

/**
 * Match incoming text against active triggers and pick a non-repeating random reply.
 */
export async function matchAndGetRandomReply(env, text, userId, chatType = "private") {
  if (!text || typeof text !== "string") return null;
  const clean = text.trim().toLowerCase();

  const list = await getTriggersList(env);
  const activeTriggers = list.filter(t => t.enabled);

  for (const trigger of activeTriggers) {
    let matches = false;
    if (trigger.match_mode === "exact") {
      matches = clean === trigger.keyword;
    } else {
      matches = clean.includes(trigger.keyword);
    }

    if (matches) {
      // 1. Check cooldown
      const cooldownKey = `rreply:cd:${trigger.id}:${userId}`;
      const inCooldown = await safeKvGet(env, cooldownKey, "text");
      if (inCooldown) {
        return null; // Silent skip during cooldown
      }

      // 2. Filter enabled replies in pool
      const enabledReplies = (trigger.replies || []).filter(r => r.enabled !== false);
      if (enabledReplies.length === 0) return null;

      const activeIds = enabledReplies.map(r => r.id);

      // 3. Select non-repeating candidate using cycle state
      const candidates = await getRemainingReplyIds(env, trigger.id, userId, activeIds);
      const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
      const chosenReply = enabledReplies.find(r => r.id === chosenId) || enabledReplies[0];

      // 4. Mark chosen reply as used in user's cycle
      await markReplyUsed(env, trigger.id, userId, chosenReply.id, activeIds);

      // 5. Set cooldown
      const cdSeconds = trigger.cooldown_seconds || 30;
      await safeKvPut(env, cooldownKey, "1", { expirationTtl: cdSeconds });

      await incrementStat(env, "repeat_sent");
      return chosenReply.text;
    }
  }

  return null;
}

export function formatTriggersSummaryHTML(triggers) {
  let html =
    `🔁 <b>RANDOM REPLY ENGINE MANAGER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Configured Triggers: <b>${triggers.length}</b>\n\n`;

  if (triggers.length === 0) {
    html += `<i>No reply triggers configured. Tap Add Trigger to start.</i>\n`;
  } else {
    triggers.forEach((t, i) => {
      const status = t.enabled ? "🟢" : "🔴";
      const totalReplies = (t.replies || []).length;
      const activeReplies = (t.replies || []).filter(r => r.enabled).length;
      html += `${i + 1}. ${status} <b>/${t.keyword}/</b> (${t.match_mode})\n   Replies: <b>${activeReplies}/${totalReplies}</b> | Cooldown: ${t.cooldown_seconds}s\n   ID: <code>${t.id}</code>\n\n`;
    });
  }

  html += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>Guarantees zero consecutive repetition until cycle completes.</i>`;
  return html;
}
