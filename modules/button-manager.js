/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: button-manager.js
 * Advanced Button Layout Manager
 *
 * Full Customisation of Telegram Menus:
 * - 1, 2, 3, 4 per row, vertical, horizontal, custom mixed layouts
 * - Stable Action IDs preventing text or position changes from breaking routing
 * - Strict 64-byte callback validation and URL safety checks
 * - Layout Export, Import, Reset, and Live Previews
 */

import { DEFAULT_LAYOUTS } from "./menu-layouts.js";
import { safeKvGet, safeKvPut, safeKvDelete, escapeHtml } from "./helpers.js";

const LAYOUT_KEY_PREFIX = "layout:menu:";

export async function getLayout(env, menuKey = "start") {
  const custom = await safeKvGet(env, `${LAYOUT_KEY_PREFIX}${menuKey}`, "json");
  if (custom && Array.isArray(custom.buttons)) {
    return custom;
  }
  return DEFAULT_LAYOUTS[menuKey] || { name: menuKey, layout_type: "custom", buttons: [] };
}

export async function saveLayout(env, menuKey, layoutData) {
  if (!layoutData || !Array.isArray(layoutData.buttons)) {
    return { ok: false, error: "Invalid layout data: buttons array is required." };
  }
  await safeKvPut(env, `${LAYOUT_KEY_PREFIX}${menuKey}`, layoutData);
  return { ok: true };
}

export async function resetLayout(env, menuKey) {
  await safeKvDelete(env, `${LAYOUT_KEY_PREFIX}${menuKey}`);
  return { ok: true, layout: DEFAULT_LAYOUTS[menuKey] || { name: menuKey, layout_type: "custom", buttons: [] } };
}

export function validateButton(button) {
  if (!button || typeof button !== "object") {
    return { valid: false, error: "Button must be an object." };
  }
  if (!button.text || typeof button.text !== "string" || button.text.trim().length === 0) {
    return { valid: false, error: "Button text is required." };
  }
  if (!button.id || typeof button.id !== "string") {
    return { valid: false, error: "Stable button ID is required." };
  }

  const allowedTypes = ["url", "callback", "web_app", "switch_inline"];
  const type = button.type || "callback";
  if (!allowedTypes.includes(type)) {
    return { valid: false, error: `Invalid button type "${type}". Allowed: ${allowedTypes.join(", ")}` };
  }

  if (type === "url") {
    if (!button.target || !button.target.startsWith("http")) {
      return { valid: false, error: "URL button target must begin with http:// or https://" };
    }
  }

  if (type === "callback") {
    if (!button.target || typeof button.target !== "string") {
      return { valid: false, error: "Callback button target action is required." };
    }
    if (button.target.length > 64) {
      return { valid: false, error: `Callback data exceeds Telegram limit of 64 bytes (${button.target.length}b).` };
    }
  }

  return { valid: true };
}

export function buildTelegramKeyboard(layout) {
  if (!layout || !Array.isArray(layout.buttons)) {
    return { inline_keyboard: [] };
  }

  const activeButtons = layout.buttons.filter(b => b.enabled !== false);
  const layoutType = layout.layout_type || "custom";

  const rows = [];

  if (layoutType === "1_per_row" || layoutType === "vertical") {
    for (const b of activeButtons) {
      rows.push([createTelegramButton(b)]);
    }
  } else if (layoutType === "2_per_row") {
    for (let i = 0; i < activeButtons.length; i += 2) {
      const row = [createTelegramButton(activeButtons[i])];
      if (activeButtons[i + 1]) row.push(createTelegramButton(activeButtons[i + 1]));
      rows.push(row);
    }
  } else if (layoutType === "3_per_row") {
    for (let i = 0; i < activeButtons.length; i += 3) {
      const row = [createTelegramButton(activeButtons[i])];
      if (activeButtons[i + 1]) row.push(createTelegramButton(activeButtons[i + 1]));
      if (activeButtons[i + 2]) row.push(createTelegramButton(activeButtons[i + 2]));
      rows.push(row);
    }
  } else if (layoutType === "4_per_row") {
    for (let i = 0; i < activeButtons.length; i += 4) {
      const row = [createTelegramButton(activeButtons[i])];
      if (activeButtons[i + 1]) row.push(createTelegramButton(activeButtons[i + 1]));
      if (activeButtons[i + 2]) row.push(createTelegramButton(activeButtons[i + 2]));
      if (activeButtons[i + 3]) row.push(createTelegramButton(activeButtons[i + 3]));
      rows.push(row);
    }
  } else {
    // Custom layout: grouped by button.row and sorted by button.order
    const rowMap = new Map();
    for (const b of activeButtons) {
      const r = b.row !== undefined ? b.row : 0;
      if (!rowMap.has(r)) rowMap.set(r, []);
      rowMap.get(r).push(b);
    }

    const sortedRowIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);
    for (const rIdx of sortedRowIndices) {
      const bList = rowMap.get(rIdx);
      bList.sort((a, b) => (a.order || 0) - (b.order || 0));
      rows.push(bList.map(createTelegramButton));
    }
  }

  return { inline_keyboard: rows };
}

function createTelegramButton(b) {
  const btn = { text: b.text };
  if (b.type === "url") {
    btn.url = b.target;
  } else if (b.type === "web_app") {
    btn.web_app = { url: b.target };
  } else if (b.type === "switch_inline") {
    btn.switch_inline_query = b.target || "";
  } else {
    btn.callback_data = b.target || b.id;
  }
  return btn;
}

export async function addButtonToLayout(env, menuKey, button) {
  const check = validateButton(button);
  if (!check.valid) return { ok: false, error: check.error };

  const layout = await getLayout(env, menuKey);
  const existingIdx = layout.buttons.findIndex(b => b.id === button.id);
  if (existingIdx >= 0) {
    return { ok: false, error: `Button with ID "${button.id}" already exists.` };
  }

  layout.buttons.push({
    id: button.id,
    text: button.text,
    type: button.type || "callback",
    target: button.target,
    row: button.row !== undefined ? button.row : layout.buttons.length,
    order: button.order !== undefined ? button.order : 0,
    enabled: button.enabled !== false
  });

  await saveLayout(env, menuKey, layout);
  return { ok: true, layout };
}

export async function editButtonInLayout(env, menuKey, buttonId, updates) {
  const layout = await getLayout(env, menuKey);
  const btn = layout.buttons.find(b => b.id === buttonId);
  if (!btn) {
    return { ok: false, error: `Button "${buttonId}" not found in layout.` };
  }

  if (updates.text !== undefined) btn.text = updates.text;
  if (updates.target !== undefined) btn.target = updates.target;
  if (updates.type !== undefined) btn.type = updates.type;
  if (updates.row !== undefined) btn.row = updates.row;
  if (updates.order !== undefined) btn.order = updates.order;
  if (updates.enabled !== undefined) btn.enabled = updates.enabled;

  const check = validateButton(btn);
  if (!check.valid) return { ok: false, error: check.error };

  await saveLayout(env, menuKey, layout);
  return { ok: true, layout };
}

export async function deleteButtonFromLayout(env, menuKey, buttonId) {
  const layout = await getLayout(env, menuKey);
  const origLen = layout.buttons.length;
  layout.buttons = layout.buttons.filter(b => b.id !== buttonId);
  if (layout.buttons.length === origLen) {
    return { ok: false, error: `Button "${buttonId}" not found.` };
  }

  await saveLayout(env, menuKey, layout);
  return { ok: true, layout };
}

export async function moveButtonInLayout(env, menuKey, buttonId, direction = "up") {
  const layout = await getLayout(env, menuKey);
  const idx = layout.buttons.findIndex(b => b.id === buttonId);
  if (idx === -1) return { ok: false, error: "Button not found." };

  if (direction === "up" && idx > 0) {
    const temp = layout.buttons[idx];
    layout.buttons[idx] = layout.buttons[idx - 1];
    layout.buttons[idx - 1] = temp;
  } else if (direction === "down" && idx < layout.buttons.length - 1) {
    const temp = layout.buttons[idx];
    layout.buttons[idx] = layout.buttons[idx + 1];
    layout.buttons[idx + 1] = temp;
  }

  await saveLayout(env, menuKey, layout);
  return { ok: true, layout };
}

export function exportLayoutJSON(layout) {
  return JSON.stringify(layout, null, 2);
}

export async function importLayoutJSON(env, menuKey, jsonStr) {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { ok: false, error: `JSON Parse error: ${e.message}` };
  }

  if (!parsed || !Array.isArray(parsed.buttons)) {
    return { ok: false, error: "Invalid layout JSON: missing buttons array." };
  }

  for (const b of parsed.buttons) {
    const check = validateButton(b);
    if (!check.valid) return { ok: false, error: `Invalid button (${b.id || "unnamed"}): ${check.error}` };
  }

  await saveLayout(env, menuKey, parsed);
  return { ok: true, layout: parsed };
}

export function formatLayoutSummaryHTML(menuKey, layout) {
  let html =
    `📐 <b>BUTTON LAYOUT: ${escapeHtml(layout.name || menuKey)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Layout Type: <code>${layout.layout_type || "custom"}</code>\n` +
    `• Total Configured Buttons: <b>${layout.buttons.length}</b>\n` +
    `• Active Buttons: <b>${layout.buttons.filter(b => b.enabled !== false).length}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Buttons Configuration:</i>\n`;

  if (layout.buttons.length === 0) {
    html += `<i>No buttons configured in this menu.</i>\n`;
  } else {
    layout.buttons.forEach((b, i) => {
      const status = b.enabled !== false ? "🟢" : "🔴";
      html += `${i + 1}. ${status} <b>${escapeHtml(b.text)}</b>\n   ID: <code>${escapeHtml(b.id)}</code> | Type: <code>${b.type}</code>\n   Target: <code>${escapeHtml(b.target)}</code>\n`;
    });
  }

  return html;
}
