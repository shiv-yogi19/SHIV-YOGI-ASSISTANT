/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: helpers.js
 * Comprehensive Telegram Bot API wrapper, KV access layers,
 * HTML safety escaping, IST date/time utilities, and state machine persistence.
 */

export const DEFAULT_CONTENT = {
  version: "4.0.0",
  bot_name: "SHIV YOGI ASSISTANT",
  bot_username: "shiv_yogi_assist_bot",
  default_language: "en",
  languages_supported: ["en", "hi"],
  features: {
    welcome_system: true,
    repeat_replies: true,
    random_welcome: true,
    random_replies: true,
    button_layouts: true,
    contact_button: true,
    channel_management: true,
    group_management: true,
    admin_system: true,
    temp_managers: true,
    anti_spam: true,
    link_filter: false,
    word_filter: false,
    anti_forward: false,
    anti_bot: true,
    captcha_verification: false,
    scheduled_posts: true,
    automation: true,
    notifications: true,
    statistics: true,
    maintenance_mode: false
  },
  settings: {
    owner_name: "Shiv Yogi",
    owner_id: "8226363418",
    contact_username: "shiv_yogi_19",
    wallpaper_channel_url: "https://t.me/the_endless_playback",
    discussion_group_url: "https://t.me/the_endless_playback_chat",
    channel_id: "",
    group_id: "",
    channels: [
      {
        id: "",
        title: "The Endless Playback",
        url: "https://t.me/the_endless_playback",
        is_primary: true
      }
    ],
    repeat_cooldown_seconds: 60,
    timezone: "Asia/Kolkata",
    banned_words: [
      "spam",
      "free crypto",
      "t.me/joinchat",
      "scam",
      "earn money fast",
      "airdrop",
      "t.me/"
    ],
    anti_flood_threshold: 5,
    anti_flood_window_seconds: 5,
    warn_limit: 3,
    slow_mode_seconds: 0
  },
  templates: {
    daily_wallpaper: "🎨 <b>Daily Wallpaper Drop!</b>\n\nEnjoy today's exclusive visual masterpiece.\n\n🔗 <b>Channel:</b> @the_endless_playback\n💬 <b>Community:</b> @the_endless_playback_chat",
    community_update: "📢 <b>Community Announcement</b>\n━━━━━━━━━━━━━━━━━━━━\n{TEXT}\n━━━━━━━━━━━━━━━━━━━━\n💬 Stay connected with @the_endless_playback_chat",
    rules_reminder: "📜 <b>Community Reminder</b>\n\nRespect all members, avoid spam or unverified links, and maintain friendly discussions.",
    important_notice: "⚠️ <b>Important Notice:</b>\n━━━━━━━━━━━━━━━━━━━━\n{TEXT}\n━━━━━━━━━━━━━━━━━━━━\n👑 Managed by Shiv Yogi",
    welcome_banner: "🌟 <b>Welcome to {CHANNEL}!</b>\n\nEnjoy wallpapers, discussions, and updates directly from Shiv Yogi.",
    event_announcement: "🎉 <b>Special Event Announcement!</b>\n\n{TEXT}\n\nStay tuned with @the_endless_playback!"
  },
  messages: {
    en: {
      welcome: "꧁༺ 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ༻꧂\n𓆩👑𓆪 𝑺𝑯𝑰𝑽 𝒀𝑶𝑮𝑰 𓆩👑𓆪\n\nWelcome to <b>Shiv Yogi Assistant</b>!\nYour premier assistant for channel updates and community care.\n\n✨ <i>Explore our wallpapers and join our conversations.</i>\n\n༺ 𝑪𝒓𝒆𝒂𝒕𝒆𝒅 𝑩𝒚 𝑺𝒉𝒊𝒗 𝒀𝒐𝒈𝒊 ༻",
      repeat: "꧁༺ 𝑻𝑯𝑨𝑵𝑲 𝒀𝑶𝑼 ༻꧂\n\nFor queries, partnerships, or assistance, contact the Owner directly.",
      contact: "✨ <b>Shiv Yogi Support & Enquiries</b>\n\nReach out to the Owner for assistance, requests, or collaborations.",
      help: "📖 <b>Shiv Yogi Assistant — Advanced Command Guide</b>\n\n<b>User Commands:</b>\n• /start — Start bot & open main menu\n• /help — Show this command reference\n• /about — Information & bot architecture\n• /contact — Official owner support\n• /language — Change interface language\n• /ping — Check system responsiveness\n• /id — Get your numeric Telegram ID\n\n<b>Community Commands:</b>\n• /rules — Read group guidelines\n• /report — Report replied message to admins\n• /appeal — Submit appeal if muted/banned\n\n<b>Owner & Admin Commands:</b>\n• /panel — Owner Management Panel\n• /post &lt;text&gt; — Publish announcement\n• /schedule — View scheduled posts\n• /stats — Real-time bot analytics\n• /warn &lt;reply&gt; — Issue warning to user\n• /mute &lt;reply&gt; [min] — Mute user\n• /unmute &lt;reply&gt; — Restore user speaking rights\n• /ban &lt;reply&gt; — Ban user from group\n• /unban &lt;id&gt; — Unban user by ID\n• /slowmode [sec] — Set chat slowmode",
      about: "ℹ️ <b>About Shiv Yogi Assistant</b>\n\nOfficial Telegram Channel & Community Management System.\n\n👑 <b>Owner:</b> Shiv Yogi (@shiv_yogi_19)\n⚡ <b>Engine:</b> Cloudflare Workers (ES Modules)\n💾 <b>Storage:</b> Cloudflare KV (Edge Distributed)\n🛡 <b>Security:</b> Strict Secret Token & Update Deduplication\n🌐 <b>Timezone:</b> Asia/Kolkata",
      maintenance: "🛠 <b>Under Scheduled Maintenance</b>\n\nShiv Yogi Assistant is undergoing brief scheduled maintenance. Please check back shortly!",
      channel_join_invite: "🎉 <b>Welcome to The Endless Playback!</b>\n\nJoin our official Discussion Group to connect with members and request themes!",
      group_welcome: "👋 Welcome to our community, <b>{NAME}</b>! Please review our rules with /rules.",
      group_goodbye: "👋 Goodbye <b>{NAME}</b>, thank you for being with us!",
      group_rules: "📜 <b>The Endless Playback — Community Rules</b>\n\n1. Be polite and respectful to everyone.\n2. No spam, advertising, or unauthorized self-promotion.\n3. Keep conversations constructive and friendly.\n4. Admin moderation decisions are final.",
      link_filter_warning: "⚠️ <b>Warning:</b> External links are prohibited in this group, {NAME}!",
      word_filter_warning: "⚠️ <b>Warning:</b> Restricted words or profanity are not permitted, {NAME}!",
      flood_warning: "⚠️ <b>Flood Alert:</b> Messages sent too quickly! You have been muted for 5 minutes, {NAME}.",
      captcha_prompt: "🛡 <b>Verification Required:</b> Welcome {NAME}! Please tap the button below to confirm you are human.",
      captcha_verified: "✅ Verification successful! Welcome to the group, {NAME}."
    },
    hi: {
      welcome: "꧁༺ स्वागतम् ༻꧂\n𓆩👑𓆪 शिव योगी 𓆩👑𓆪\n\n<b>शिव योगी असिस्टेंट</b> में आपका हार्दिक स्वागत है!\nचैनल अपडेट्स और कम्युनिटी प्रबंधन का आपका विश्वसनीय साथी।\n\n✨ <i>हमारे वॉलपेपर्स देखें और चर्चा में शामिल हों।</i>\n\n༺ निर्मित: शिव योगी ༻",
      repeat: "꧁༺ धन्यवाद ༻꧂\n\nकिसी भी सहायता या जानकारी के लिए कृपया सीधे ऑनर से संपर्क करें।",
      contact: "✨ <b>शिव योगी सहायता एवं संपर्क</b>\n\nसहायता या पूछताछ के लिए सीधे ऑनर से संपर्क करें।",
      help: "📖 <b>शिव योगी असिस्टेंट — कमांड मार्गदर्शिका</b>\n\n<b>यूजर कमांड्स:</b>\n• /start — बॉट शुरू करें\n• /help — सहायता निर्देश\n• /about — बॉट की जानकारी\n• /contact — ऑनर सपोर्ट\n• /language — भाषा बदलें\n• /ping — लेटेंसी जांचें\n• /id — अपना टेलीग्राम आईडी देखें\n\n<b>ग्रुप कमांड्स:</b>\n• /rules — ग्रुप के नियम\n• /report — एडमिन को रिपोर्ट भेजें\n• /appeal — अपील दर्ज करें\n\n<b>ऑनर एवं एडमिन कमांड्स:</b>\n• /panel — ऑनर कंट्रोल पैनल\n• /post &lt;text&gt; — चैनल पर पोस्ट करें\n• /schedule — शेड्यूल्ड पोस्ट्स देखें\n• /stats — बॉट आंकड़े\n• /warn — चेतावनी दें\n• /mute — म्यूट करें\n• /unmute — अनम्यूट करें\n• /ban — बैन करें\n• /unban — अनबैन करें",
      about: "ℹ️ <b>शिव योगी असिस्टेंट के बारे में</b>\n\nआधिकारिक चैनल एवं कम्युनिटी मैनेजमेंट सिस्टम।\n\n👑 <b>ऑनर:</b> शिव योगी (@shiv_yogi_19)\n⚡ <b>इंजन:</b> क्लाउडफ्लेयर वर्कर्स\n💾 <b>स्टोरेज:</b> क्लाउडफ्लेयर केवी\n🛡 <b>सुरक्षा:</b> टोकन और वेबहुक वेरिफिकेशन\n🌐 <b>टाइमजोन:</b> Asia/Kolkata",
      maintenance: "🛠 <b>रखरखाव जारी है</b>\n\nबॉट पर निर्धारित रखरखाव चल रहा है। कृपया कुछ समय बाद पुनः प्रयास करें!",
      channel_join_invite: "🎉 <b>The Endless Playback में आपका स्वागत है!</b>\n\nकम्युनिटी से जुड़ने और सुझाव साझा करने के लिए हमारे डिस्कशन ग्रुप में शामिल हों!",
      group_welcome: "👋 डिस्कशन ग्रुप में आपका स्वागत है, <b>{NAME}</b>! कृपया नियमों का पालन करें।",
      group_goodbye: "👋 अलविदा <b>{NAME}</b>, हमारे साथ जुड़ने के लिए धन्यवाद!",
      group_rules: "📜 <b>The Endless Playback — कम्युनिटी नियम</b>\n\n1. सभी सदस्यों का सम्मान करें।\n2. स्पैम या अनधिकृत लिंक भेजना वर्जित है।\n3. बातचीत शालीन और प्रासंगिक रखें।\n4. एडमिन के निर्णयों का सम्मान करें।",
      link_filter_warning: "⚠️ <b>चेतावनी:</b> इस ग्रुप में लिंक भेजना प्रतिबंधित है, {NAME}!",
      word_filter_warning: "⚠️ <b>चेतावनी:</b> प्रतिबंधित शब्दों का प्रयोग वर्जित है, {NAME}!",
      flood_warning: "⚠️ <b>फ्लड अलर्ट:</b> संदेश बहुत तेज़ी से भेजे जा रहे हैं! आपको 5 मिनट के लिए म्यूट किया गया है, {NAME}।",
      captcha_prompt: "🛡 <b>सत्यापन आवश्यक:</b> {NAME}, कृपया पुष्टि करने के लिए नीचे दिए गए बटन पर टैप करें।",
      captcha_verified: "✅ सत्यापन सफल हुआ! ग्रुप में आपका स्वागत है, {NAME}।"
    }
  },
  buttons: {
    en: {
      wallpaper_channel: "🖼 The Endless Playback",
      discussion_group: "💬 Discussion Group",
      contact_owner: "✉ Contact Owner",
      help: "📖 Help Guide",
      change_language: "🌐 Language"
    },
    hi: {
      wallpaper_channel: "🖼 The Endless Playback",
      discussion_group: "💬 डिस्कशन ग्रुप",
      contact_owner: "✉ ऑनर से संपर्क करें",
      help: "📖 सहायता",
      change_language: "🌐 भाषा बदलें"
    }
  }
};

// ==========================================
// 1. TELEGRAM BOT API CLIENT
// ==========================================

export async function callTelegram(env, method, payload = {}) {
  if (!env || !env.BOT_TOKEN) {
    return { ok: false, error_code: 401, description: "Unauthorized: BOT_TOKEN is missing" };
  }
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      if (data && data.description && data.description.includes("message is not modified")) {
        return { ok: true, result: true, not_modified: true };
      }
      return {
        ok: false,
        error_code: data.error_code || res.status,
        description: data.description || `HTTP ${res.status} Error`,
        parameters: data.parameters
      };
    }
    return data;
  } catch (err) {
    return { ok: false, error_code: 500, description: `Network Exception: ${err.message}` };
  }
}

export async function sendMessage(env, chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup,
    disable_web_page_preview: options.disable_web_page_preview !== false
  };
  let res = await callTelegram(env, "sendMessage", payload);
  if (!res.ok && res.description && res.description.includes("can't parse entities")) {
    delete payload.parse_mode;
    res = await callTelegram(env, "sendMessage", payload);
  }
  return res;
}

export async function editMessageText(env, chatId, messageId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup,
    disable_web_page_preview: options.disable_web_page_preview !== false
  };
  let res = await callTelegram(env, "editMessageText", payload);
  if (!res.ok && res.description && res.description.includes("can't parse entities")) {
    delete payload.parse_mode;
    res = await callTelegram(env, "editMessageText", payload);
  }
  return res;
}

export async function answerCallbackQuery(env, callbackQueryId, text = "", showAlert = false) {
  return await callTelegram(env, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text,
    show_alert: showAlert
  });
}

export async function deleteMessage(env, chatId, messageId) {
  return await callTelegram(env, "deleteMessage", { chat_id: chatId, message_id: messageId });
}

export async function pinChatMessage(env, chatId, messageId, disableNotification = false) {
  return await callTelegram(env, "pinChatMessage", {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: disableNotification
  });
}

export async function unpinChatMessage(env, chatId, messageId = null) {
  const payload = { chat_id: chatId };
  if (messageId) payload.message_id = messageId;
  return await callTelegram(env, "unpinChatMessage", payload);
}

export async function sendPhoto(env, chatId, photo, caption = "", options = {}) {
  return await callTelegram(env, "sendPhoto", {
    chat_id: chatId,
    photo: photo,
    caption: caption,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup
  });
}

export async function sendVideo(env, chatId, video, caption = "", options = {}) {
  return await callTelegram(env, "sendVideo", {
    chat_id: chatId,
    video: video,
    caption: caption,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup
  });
}

export async function sendDocument(env, chatId, document, caption = "", options = {}) {
  return await callTelegram(env, "sendDocument", {
    chat_id: chatId,
    document: document,
    caption: caption,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup
  });
}

export async function restrictChatMember(env, chatId, userId, permissions, untilDate = 0) {
  return await callTelegram(env, "restrictChatMember", {
    chat_id: chatId,
    user_id: userId,
    permissions: permissions,
    until_date: untilDate
  });
}

export async function banChatMember(env, chatId, userId, untilDate = 0) {
  return await callTelegram(env, "banChatMember", {
    chat_id: chatId,
    user_id: userId,
    until_date: untilDate
  });
}

export async function unbanChatMember(env, chatId, userId, onlyIfBanned = true) {
  return await callTelegram(env, "unbanChatMember", {
    chat_id: chatId,
    user_id: userId,
    only_if_banned: onlyIfBanned
  });
}

export async function setChatPermissions(env, chatId, permissions) {
  return await callTelegram(env, "setChatPermissions", {
    chat_id: chatId,
    permissions: permissions
  });
}

export async function getChatMember(env, chatId, userId) {
  return await callTelegram(env, "getChatMember", { chat_id: chatId, user_id: userId });
}

export async function getChat(env, chatId) {
  return await callTelegram(env, "getChat", { chat_id: chatId });
}

export async function getMe(env) {
  return await callTelegram(env, "getMe");
}

export async function getWebhookInfo(env) {
  return await callTelegram(env, "getWebhookInfo");
}

export async function setWebhook(env, url, secretToken = null) {
  const payload = { url: url };
  if (secretToken) payload.secret_token = secretToken;
  return await callTelegram(env, "setWebhook", payload);
}

// ==========================================
// 2. SAFE KV STORAGE WRAPPERS
// ==========================================

export async function safeKvGet(env, key, type = "json") {
  if (!env || !env.BOT_DATA) return null;
  try {
    if (type === "json") {
      const res = await env.BOT_DATA.get(key, "json");
      return res;
    }
    return await env.BOT_DATA.get(key, "text");
  } catch (err) {
    console.error(`KV Get Error for key "${key}":`, err);
    return null;
  }
}

export async function safeKvPut(env, key, value, options = {}) {
  if (!env || !env.BOT_DATA) return false;
  try {
    const val = typeof value === "object" ? JSON.stringify(value) : String(value);
    await env.BOT_DATA.put(key, val, options);
    return true;
  } catch (err) {
    console.error(`KV Put Error for key "${key}":`, err);
    return false;
  }
}

export async function safeKvDelete(env, key) {
  if (!env || !env.BOT_DATA) return false;
  try {
    await env.BOT_DATA.delete(key);
    return true;
  } catch (err) {
    console.error(`KV Delete Error for key "${key}":`, err);
    return false;
  }
}

export async function safeKvList(env, prefix = "") {
  if (!env || !env.BOT_DATA) return { keys: [] };
  try {
    return await env.BOT_DATA.list({ prefix });
  } catch (err) {
    console.error(`KV List Error for prefix "${prefix}":`, err);
    return { keys: [] };
  }
}

// ==========================================
// 3. INTERACTIVE USER STATE MACHINE
// ==========================================

export async function getUserState(env, userId) {
  return await safeKvGet(env, `state:${userId}`, "json");
}

export async function setUserState(env, userId, state, ttlSeconds = 600) {
  const payload = {
    ...state,
    user_id: String(userId),
    updated_at: Date.now()
  };
  return await safeKvPut(env, `state:${userId}`, payload, { expirationTtl: ttlSeconds });
}

export async function clearUserState(env, userId) {
  return await safeKvDelete(env, `state:${userId}`);
}

// ==========================================
// 4. ACTIVITY & AUDIT LOGS
// ==========================================

export async function addActivityLog(env, actorId, action, detail) {
  try {
    const raw = await safeKvGet(env, "logs:activity", "json");
    const logs = Array.isArray(raw) ? raw : [];
    logs.unshift({
      time: new Date().toISOString(),
      ist: formatDateIST(),
      actor: String(actorId),
      action: action,
      detail: detail
    });
    if (logs.length > 50) logs.length = 50;
    await safeKvPut(env, "logs:activity", logs);
  } catch (err) {
    console.error("Failed to append activity log:", err);
  }
}

export async function getActivityLogs(env, limit = 20) {
  const raw = await safeKvGet(env, "logs:activity", "json");
  const list = Array.isArray(raw) ? raw : [];
  return list.slice(0, limit);
}

// ==========================================
// 5. HTML ESCAPING & UTILITIES
// ==========================================

export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==========================================
// 6. TIMEZONE & DATE UTILITIES (ASIA/KOLKATA)
// ==========================================

export function formatDateIST(timestamp = Date.now()) {
  try {
    const d = new Date(timestamp);
    return (
      d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }) + " IST"
    );
  } catch (e) {
    return new Date(timestamp).toISOString();
  }
}

export function parseDateIST(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const regex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
  const match = dateStr.trim().match(regex);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const isoWithOffset = `${y}-${m}-${d}T${hh}:${mm}:00+05:30`;
  const parsed = new Date(isoWithOffset).getTime();
  return isNaN(parsed) ? null : parsed;
}

export function getISTDateString(timestamp = Date.now()) {
  const d = new Date(timestamp);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

export function getISTHour(timestamp = Date.now()) {
  const d = new Date(timestamp);
  return parseInt(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false
    }).format(d),
    10
  );
}
