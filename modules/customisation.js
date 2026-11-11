/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: customisation.js
 * Full Bot Customisation System & Content Management
 *
 * Capabilities:
 * - Dynamic overrides for Welcome, About, Help, Contact, Rules, and Footer text
 * - Dual Language support (English & Hindi)
 * - Safe HTML validation and live previews
 * - BotFather vs Bot API Technical Boundary Disclosures
 */

import { safeKvGet, safeKvPut, safeKvDelete, escapeHtml } from "./helpers.js";
import { validateSafeHtml, getMessage, saveCustomMessage, resetCustomMessage } from "./localization.js";

export const EDITABLE_MESSAGE_KEYS = [
  { key: "welcome", label: "Start Welcome Message", description: "Bilingual welcome displayed on /start" },
  { key: "about", label: "About Message", description: "Bot specifications, owner details, edge runtime info" },
  { key: "help", label: "Help Guide", description: "Command reference and instructions for users" },
  { key: "contact", label: "Contact Message", description: "Official owner contact information and support link" },
  { key: "group_rules", label: "Community Rules", description: "Rules text displayed on /rules in group chats" },
  { key: "footer", label: "Global Message Footer", description: "Optional branding line attached to announcements" }
];

export const BOTFATHER_SPECIFICATIONS = {
  bot_api_customizable: [
    "Welcome messages (English & Hindi)",
    "Help messages & command guides",
    "About texts (/about command)",
    "Contact & support instructions",
    "Group rules & moderation warnings",
    "Global message footers",
    "Inline button text, URLs, order & layouts",
    "Random welcome message variants",
    "Random reply triggers & pools",
    "Command enable/disable flags",
    "Feature toggles & moderation settings"
  ],
  botfather_required: [
    "Bot Display Name (Header in Telegram)",
    "Bot Username (@shiv_yogi_assist_bot)",
    "Bot Profile Description (Profile preview before /start)",
    "Bot Profile About Text (Short bio in Telegram profile)",
    "Bot Profile Picture / Avatar",
    "Telegram Command Menu Autocomplete (/setcommands list)"
  ]
};

export async function getCustomFooter(env) {
  const footer = await safeKvGet(env, "custom:footer", "text");
  return footer || "༺ 𝑴𝒂𝒏𝒂𝒈𝒆𝒅 𝒃𝒚 𝑺𝒉𝒊𝒗 𝒀𝒐𝒈𝒊 ༻";
}

export async function setCustomFooter(env, text) {
  const check = validateSafeHtml(text);
  if (!check.valid) return { ok: false, error: check.error };
  await safeKvPut(env, "custom:footer", text.trim());
  return { ok: true };
}

export async function previewCustomMessage(env, key, lang = "en") {
  const text = await getMessage(env, lang, key);
  const footer = await getCustomFooter(env);
  return `${text}\n\n${footer}`;
}

export function formatCustomisationHomeHTML() {
  return (
    `🎨 <b>FULL BOT CUSTOMISATION SYSTEM</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Modify bot messaging, button layouts, and branding in real-time.\n` +
    `All customisations persist securely in Cloudflare KV.\n\n` +
    `<i>Select an option below to customize:</i>`
  );
}

export function formatBotFatherGuideHTML() {
  let html =
    `ℹ️ <b>TELEGRAM BOT CUSTOMISATION CAPABILITIES</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🟢 <b>Customizable via Bot Panel / Bot API:</b>\n`;
  for (const item of BOTFATHER_SPECIFICATIONS.bot_api_customizable) {
    html += `• ${item}\n`;
  }
  html += `\n🔵 <b>Requires Official @BotFather:</b>\n`;
  for (const item of BOTFATHER_SPECIFICATIONS.botfather_required) {
    html += `• ${item}\n`;
  }
  html +=
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Note: Telegram Bot API enforces strict separation between client-side profile assets (BotFather) and bot message interactions (Cloudflare Worker).</i>`;
  return html;
}
