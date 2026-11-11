/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: random-welcome.js
 * Advanced Random Welcome Message Manager
 *
 * Capabilities:
 * - Dynamic pool of English & Hindi welcome messages
 * - Per-group custom pools and fallback to global pool
 * - Randomized selection strictly from active/enabled variants
 * - HTML safety validation & placeholder interpolation ({NAME}, {GROUP})
 * - Welcome statistics, history tracking, and preview engine
 */

import { safeKvGet, safeKvPut, formatDateIST, escapeHtml } from "./helpers.js";
import { validateSafeHtml } from "./localization.js";
import { incrementStat } from "./statistics.js";

const DEFAULT_WELCOME_POOL = [
  {
    id: "welc_v1",
    lang: "en",
    text: "꧁༺ 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ༻꧂\n𓆩👑𓆪 𝑺𝑯𝑰𝑽 𝒀𝑶𝑮𝑰 𓆩👑𓆪\n\nWelcome to <b>{GROUP}</b>, <b>{NAME}</b>!\nYour premier sanctuary for aesthetic wallpapers and peaceful discussions.\n\n✨ <i>Please review community guidelines with /rules.</i>\n༺ 𝑴𝒂𝒏𝒂𝒈𝒆𝒅 𝒃𝒚 𝑺𝒉𝒊𝒗 𝒀𝒐𝒈𝒊 ༻",
    enabled: true,
    created_at: 1731300000000
  },
  {
    id: "welc_v2",
    lang: "en",
    text: "🌟 <b>Welcome to The Endless Playback, {NAME}!</b>\n\nWe are delighted to have you with us. Enjoy exclusive daily wallpaper drops, community themes, and polite discussions!\n\n👑 <i>Shiv Yogi Community Care</i>",
    enabled: true,
    created_at: 1731300000000
  },
  {
    id: "welc_v3",
    lang: "hi",
    text: "꧁༺ स्वागतम् ༻꧂\n𓆩👑𓆪 शिव योगी 𓆩👑𓆪\n\n<b>{GROUP}</b> में आपका हार्दिक स्वागत है, <b>{NAME}</b>!\nदैनिक वॉलपेपर्स और शांत चर्चाओं का आनंद लें।\n\n✨ <i>नियमों की जानकारी हेतु /rules देखें।</i>\n༺ निर्मित: शिव योगी ༻",
    enabled: true,
    created_at: 1731300000000
  },
  {
    id: "welc_v4",
    lang: "hi",
    text: "🌸 <b>The Endless Playback परिवार में आपका स्वागत है, {NAME}!</b>\n\nनये सदस्य के रूप में आपके जुड़ने पर हमें प्रसन्नता है। शिष्टाचार बनाए रखें और सुंदर वॉलपेपर्स का आनंद लें।",
    enabled: true,
    created_at: 1731300000000
  }
];

export async function getWelcomePool(env, groupId = null) {
  const key = groupId ? `rwelc:pool:${groupId}` : "rwelc:pool:global";
  const custom = await safeKvGet(env, key, "json");
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  return DEFAULT_WELCOME_POOL;
}

export async function saveWelcomePool(env, pool, groupId = null) {
  const key = groupId ? `rwelc:pool:${groupId}` : "rwelc:pool:global";
  return await safeKvPut(env, key, pool);
}

export async function addWelcomeVariant(env, text, lang = "en", groupId = null) {
  const check = validateSafeHtml(text);
  if (!check.valid) return { ok: false, error: check.error };

  const pool = await getWelcomePool(env, groupId);
  const newId = `welc_${Date.now()}`;
  pool.push({
    id: newId,
    lang: lang === "hi" ? "hi" : "en",
    text: text.trim(),
    enabled: true,
    created_at: Date.now()
  });

  await saveWelcomePool(env, pool, groupId);
  return { ok: true, id: newId };
}

export async function editWelcomeVariant(env, variantId, text, lang = null, groupId = null) {
  const check = validateSafeHtml(text);
  if (!check.valid) return { ok: false, error: check.error };

  const pool = await getWelcomePool(env, groupId);
  const v = pool.find(item => item.id === variantId);
  if (!v) return { ok: false, error: `Variant "${variantId}" not found.` };

  v.text = text.trim();
  if (lang) v.lang = lang === "hi" ? "hi" : "en";
  v.updated_at = Date.now();

  await saveWelcomePool(env, pool, groupId);
  return { ok: true };
}

export async function deleteWelcomeVariant(env, variantId, groupId = null) {
  const pool = await getWelcomePool(env, groupId);
  const orig = pool.length;
  const filtered = pool.filter(item => item.id !== variantId);
  if (filtered.length === orig) return { ok: false, error: "Variant not found." };

  await saveWelcomePool(env, filtered, groupId);
  return { ok: true };
}

export async function toggleWelcomeVariant(env, variantId, groupId = null) {
  const pool = await getWelcomePool(env, groupId);
  const v = pool.find(item => item.id === variantId);
  if (!v) return { ok: false, error: "Variant not found." };

  v.enabled = !v.enabled;
  await saveWelcomePool(env, pool, groupId);
  return { ok: true, enabled: v.enabled };
}

export async function getRandomWelcomeMessage(env, memberName = "Member", groupTitle = "The Endless Playback", lang = "en", groupId = null) {
  const pool = await getWelcomePool(env, groupId);
  const langKey = lang === "hi" ? "hi" : "en";

  // Filter for enabled messages matching language, fallback to any enabled
  let candidates = pool.filter(v => v.enabled && v.lang === langKey);
  if (candidates.length === 0) {
    candidates = pool.filter(v => v.enabled);
  }
  if (candidates.length === 0) {
    // Ultimate fallback if all disabled
    return `👋 Welcome to <b>${escapeHtml(groupTitle)}</b>, <b>${escapeHtml(memberName)}</b>!`;
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  let formatted = selected.text
    .replace(/\{NAME\}/gi, escapeHtml(memberName))
    .replace(/\{GROUP\}/gi, escapeHtml(groupTitle));

  // Record history
  await recordWelcomeHistory(env, selected.id, memberName, groupTitle);
  await incrementStat(env, "welcome_sent");

  return formatted;
}

export async function recordWelcomeHistory(env, variantId, memberName, groupTitle) {
  try {
    const raw = await safeKvGet(env, "rwelc:history", "json");
    const list = Array.isArray(raw) ? raw : [];
    list.unshift({
      variant_id: variantId,
      member: memberName,
      group: groupTitle,
      time: new Date().toISOString(),
      ist: formatDateIST()
    });
    if (list.length > 20) list.length = 20;
    await safeKvPut(env, "rwelc:history", list);
  } catch (err) {
    console.error("Failed to append welcome history:", err);
  }
}

export async function getWelcomeHistory(env) {
  const raw = await safeKvGet(env, "rwelc:history", "json");
  return Array.isArray(raw) ? raw : [];
}

export function formatWelcomePoolHTML(pool, groupId = null) {
  let html =
    `👋 <b>RANDOM WELCOME POOL ${groupId ? `(${groupId})` : "(GLOBAL)"}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Variants: <b>${pool.length}</b> | Enabled: <b>${pool.filter(p => p.enabled).length}</b>\n\n`;

  if (pool.length === 0) {
    html += `<i>No welcome variants configured. Tap Add to create one.</i>\n`;
  } else {
    pool.forEach((v, i) => {
      const status = v.enabled ? "🟢" : "🔴";
      const preview = v.text.length > 70 ? v.text.slice(0, 70) + "..." : v.text;
      html += `${i + 1}. ${status} [${v.lang.toUpperCase()}] <code>${v.id}</code>\n   <i>${escapeHtml(preview)}</i>\n\n`;
    });
  }

  html += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>Placeholders available: {NAME}, {GROUP}</i>`;
  return html;
}
