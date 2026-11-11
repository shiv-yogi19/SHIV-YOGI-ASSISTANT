/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: templates.js
 * Template management library for channel broadcasts,
 * community notices, and dynamic variable interpolation.
 */

import { DEFAULT_CONTENT, safeKvGet, safeKvPut, formatDateIST } from "./helpers.js";
import { getSettings } from "./settings.js";

export async function getTemplates(env) {
  const custom = await safeKvGet(env, "settings:templates", "json");
  return { ...DEFAULT_CONTENT.templates, ...(custom || {}) };
}

export async function getTemplate(env, name) {
  const templates = await getTemplates(env);
  return templates[name] || null;
}

export async function saveTemplate(env, name, text) {
  const templates = await getTemplates(env);
  templates[name] = text;
  return await safeKvPut(env, "settings:templates", templates);
}

export async function deleteTemplate(env, name) {
  const templates = await getTemplates(env);
  delete templates[name];
  return await safeKvPut(env, "settings:templates", templates);
}

export async function renderTemplate(env, templateText, variables = {}) {
  let rendered = String(templateText || "");
  const settings = await getSettings(env);

  const defaults = {
    DATE: formatDateIST(),
    TIME: formatDateIST(),
    CHANNEL: settings.channel_id || "@the_endless_playback",
    GROUP: settings.group_id || "@the_endless_playback_chat",
    OWNER: settings.owner_name || "Shiv Yogi",
    CONTACT: settings.contact_username || "shiv_yogi_19",
    ...variables
  };

  for (const [k, v] of Object.entries(defaults)) {
    const reg = new RegExp(`\\{${k}\\}`, "gi");
    rendered = rendered.replace(reg, String(v));
  }

  return rendered;
}
