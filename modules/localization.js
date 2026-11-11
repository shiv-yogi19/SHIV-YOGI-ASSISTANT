/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: localization.js
 * Multi-language system (English & Hindi), custom content editor,
 * HTML validator, and per-user language preference storage.
 */

import { DEFAULT_CONTENT, safeKvGet, safeKvPut, safeKvDelete } from "./helpers.js";

export async function loadGitHubDefaults(env) {
  if (!env || !env.GITHUB_CONTENT_URL) return DEFAULT_CONTENT;
  try {
    const cached = await safeKvGet(env, "cache:github_content", "json");
    if (cached) return cached;

    const res = await fetch(env.GITHUB_CONTENT_URL, {
      headers: { "User-Agent": "Shiv-Yogi-Assistant-Worker" }
    });
    if (!res.ok) return DEFAULT_CONTENT;

    const data = await res.json();
    if (data && data.version && data.messages) {
      await safeKvPut(env, "cache:github_content", data, { expirationTtl: 1800 });
      return data;
    }
    return DEFAULT_CONTENT;
  } catch (err) {
    return DEFAULT_CONTENT;
  }
}

export async function getMessage(env, lang = "en", key = "", params = {}) {
  const langKey = lang === "hi" ? "hi" : "en";
  let text = "";

  // 1. Check custom override in KV
  const custom = await safeKvGet(env, `messages:${langKey}:${key}`, "text");
  if (custom) {
    text = custom;
  } else {
    // 2. Check GitHub defaults or fallback to DEFAULT_CONTENT
    const defaults = await loadGitHubDefaults(env);
    if (defaults?.messages?.[langKey]?.[key]) {
      text = defaults.messages[langKey][key];
    } else if (DEFAULT_CONTENT.messages[langKey]?.[key]) {
      text = DEFAULT_CONTENT.messages[langKey][key];
    } else if (DEFAULT_CONTENT.messages.en[key]) {
      text = DEFAULT_CONTENT.messages.en[key];
    } else {
      text = `[Message key "${key}" not found]`;
    }
  }

  // 3. Interpolate parameters: {PARAM_NAME}
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      const reg = new RegExp(`\\{${k}\\}`, "gi");
      text = text.replace(reg, String(v));
    }
  }

  return text;
}

export function validateSafeHtml(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, error: "Text cannot be empty" };
  }

  // Allowed Telegram Bot HTML tags: b, strong, i, em, u, ins, s, strike, del, span, tg-spoiler, a, code, pre
  const allowedTags = /^(b|strong|i|em|u|ins|s|strike|del|span|tg-spoiler|a|code|pre)$/i;
  const tagRegex = /<\/?([a-zA-Z0-9\-_]+)(\s+[^>]*)?>/g;
  const stack = [];
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith("</");

    if (!allowedTags.test(tagName)) {
      return { valid: false, error: `Disallowed HTML tag <${tagName}>. Only standard Telegram formatting tags allowed.` };
    }

    if (isClosing) {
      if (stack.length === 0 || stack[stack.length - 1] !== tagName) {
        return { valid: false, error: `Mismatched closing tag </${tagName}>.` };
      }
      stack.pop();
    } else {
      // Telegram self-closing tags aren't standard, push opening tag
      if (!fullTag.endsWith("/>")) {
        stack.push(tagName);
      }
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: `Unclosed HTML tag <${stack[stack.length - 1]}>.` };
  }

  return { valid: true };
}

export async function saveCustomMessage(env, lang = "en", key = "", text = "") {
  const langKey = lang === "hi" ? "hi" : "en";
  const validation = validateSafeHtml(text);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }
  await safeKvPut(env, `messages:${langKey}:${key}`, text);
  return { ok: true };
}

export async function resetCustomMessage(env, lang = "en", key = "") {
  const langKey = lang === "hi" ? "hi" : "en";
  await safeKvDelete(env, `messages:${langKey}:${key}`);
  return { ok: true };
}

export async function getButtons(env, lang = "en") {
  const langKey = lang === "hi" ? "hi" : "en";
  const defaults = await loadGitHubDefaults(env);
  return (
    defaults?.buttons?.[langKey] ||
    DEFAULT_CONTENT.buttons[langKey] ||
    DEFAULT_CONTENT.buttons.en
  );
}

export async function getUserLanguage(env, userId) {
  if (!userId) return "en";
  const saved = await safeKvGet(env, `user:lang:${userId}`, "text");
  return saved === "hi" ? "hi" : "en";
}

export async function setUserLanguage(env, userId, lang) {
  if (!userId) return false;
  const langKey = lang === "hi" ? "hi" : "en";
  return await safeKvPut(env, `user:lang:${userId}`, langKey);
}
