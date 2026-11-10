/**
 * SHIV YOGI ASSISTANT - TELEGRAM BOT
 * Cloudflare Workers (ES Module Syntax) + Cloudflare KV + Telegram Bot API
 *
 * Repository Files:
 *  - worker.js (Complete Cloudflare Worker Application)
 *  - content.json (Static Defaults & Localization)
 *
 * Required Cloudflare Bindings:
 *  - Secrets: BOT_TOKEN, WEBHOOK_SECRET
 *  - Variables: OWNER_ID, GITHUB_CONTENT_URL
 *  - KV Binding: BOT_DATA
 */

// ==========================================
// 1. EMBEDDED DEFAULT CONTENT (FALLBACK)
// ==========================================
const DEFAULT_CONTENT = {
  version: "1.0.0",
  bot_name: "SHIV YOGI ASSISTANT",
  default_language: "en",
  languages_supported: ["en", "hi"],
  features: {
    welcome_system: true,
    repeat_replies: true,
    contact_button: true,
    channel_management: true,
    group_management: true,
    admin_system: true,
    temp_managers: true,
    anti_spam: true,
    link_filter: false,
    word_filter: false,
    notifications: true,
    statistics: true,
    maintenance_mode: false
  },
  settings: {
    owner_name: "Shiv Yogi",
    contact_username: "shiv_yogi",
    wallpaper_channel_url: "https://t.me/shiv_yogi_wallpapers",
    discussion_group_url: "https://t.me/shiv_yogi_discussion",
    channel_id: "",
    group_id: "",
    repeat_cooldown_seconds: 60,
    timezone: "Asia/Kolkata",
    banned_words: ["spam", "free crypto", "t.me/joinchat", "scam", "earn money fast"],
    anti_flood_threshold: 5,
    anti_flood_window_seconds: 5
  },
  messages: {
    en: {
      welcome: "꧁༺ 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ༻꧂\n𓆩👑𓆪 𝑺𝑯𝑰𝑽 𝒀𝑶𝑮𝑰 𓆩👑𓆪\n\nWelcome to <b>Shiv Yogi Assistant</b>!\nA place for helpful assistance and useful updates.\nExplore our wallpaper collection and stay connected.\n\n༺ 𝑪𝒓𝒆𝒂𝒕𝒆𝒅 𝑩𝒚 𝑺𝒉𝒊𝒗 𝒀𝒐𝒈𝒊 ༻",
      repeat: "꧁༺ 𝑻𝑯𝑨𝑵𝑲 𝒀𝑶𝑼 ༻꧂\n\nFor assistance or enquiries, please contact the Owner.",
      contact: "✨ <b>Shiv Yogi Support & Enquiries</b>\n\nFeel free to reach out directly to the Owner for assistance or inquiries.",
      help: "📖 <b>Shiv Yogi Assistant - Help Guide</b>\n\n• /start - Start the bot & welcome menu\n• /help - Display this assistance message\n• /contact - Contact the Owner / Support\n• /language - Change bot language\n• /panel - Owner Control Panel (Owner only)\n\n<i>Group Commands:</i>\n• /rules - View group rules\n• /report - Report an issue to group admins",
      about: "ℹ️ <b>About Shiv Yogi Assistant</b>\n\nOfficial assistant bot for Shiv Yogi community and wallpaper channel.\n\n👑 <b>Owner:</b> Shiv Yogi\n⚡ <b>Engine:</b> Cloudflare Workers & Telegram Bot API\n🛡 <b>Security:</b> Full Token & Webhook Verification",
      maintenance: "🛠 <b>Under Scheduled Maintenance</b>\n\nShiv Yogi Assistant is currently undergoing scheduled maintenance. Please check back shortly!",
      channel_join_invite: "🎉 <b>Welcome to our Wallpaper Channel!</b>\n\nJoin our Discussion Group to connect with the community, request wallpapers, and share feedback!",
      group_welcome: "👋 Welcome to the discussion group, <b>{NAME}</b>! Please follow the community rules and enjoy your stay.",
      group_goodbye: "👋 Goodbye <b>{NAME}</b>, thank you for being part of our community!",
      group_rules: "📜 <b>Group Rules & Guidelines:</b>\n\n1. Be respectful to all members.\n2. No spam, unauthorized promotional links, or self-promotion.\n3. Keep discussions polite and relevant.\n4. Admin decisions are final.",
      link_filter_warning: "⚠️ <b>Warning:</b> Links are prohibited in this group, {NAME}!",
      word_filter_warning: "⚠️ <b>Warning:</b> Restricted words or profanity are not allowed, {NAME}!",
      flood_warning: "⚠️ <b>Flood Alert:</b> Messages sent too quickly! You have been temporarily muted for 5 minutes, {NAME}."
    },
    hi: {
      welcome: "꧁༺ स्वागतम् ༻꧂\n𓆩👑𓆪 शिव योगी 𓆩👑𓆪\n\n<b>शिव योगी असिस्टेंट</b> में आपका हार्दिक स्वागत है!\nसहायता और उपयोगी अपडेट के लिए आपका विश्वसनीय साथी।\nहमारे वॉलपेपर संग्रह को देखें और जुड़े रहें।\n\n༺ निर्मित: शिव योगी ༻",
      repeat: "꧁༺ धन्यवाद ༻꧂\n\nसहायता या पूछताछ के लिए कृपया सीधे ऑनर से संपर्क करें।",
      contact: "✨ <b>शिव योगी सहायता एवं पूछताछ</b>\n\nकिसी भी सहायता या जानकारी के लिए नीचे दिए गए बटन से सीधे ऑनर से संपर्क करें।",
      help: "📖 <b>शिव योगी असिस्टेंट - सहायता मार्गदर्शिका</b>\n\n• /start - बॉट शुरू करें और स्वागत मेनू देखें\n• /help - यह सहायता संदेश देखें\n• /contact - ऑनर से संपर्क करें\n• /language - भाषा बदलें\n• /panel - ऑनर कंट्रोल पैनल (केवल ऑनर)\n\n<i>ग्रुप कमांड्स:</i>\n• /rules - ग्रुप के नियम देखें\n• /report - एडमिन को रिपोर्ट करें",
      about: "ℹ️ <b>शिव योगी असिस्टेंट के बारे में</b>\n\nशिव योगी कम्युनिटी और वॉलपेपर चैनल का आधिकारिक असिस्टेंट बॉट।\n\n👑 <b>ऑनर:</b> शिव योगी\n⚡ <b>इंजन:</b> क्लाउडफ्लेयर वर्कर्स एवं टेलीग्राम बॉट एपीआई\n🛡 <b>सुरक्षा:</b> सुरक्षित टोकन और वेबहुक वेरिफिकेशन",
      maintenance: "🛠 <b>रखरखाव जारी है</b>\n\nशिव योगी असिस्टेंट पर वर्तमान में निर्धारित रखरखाव कार्य चल रहा है। कृपया कुछ समय बाद पुनः प्रयास करें!",
      channel_join_invite: "🎉 <b>वॉलपेपर चैनल में आपका स्वागत है!</b>\n\nकम्युनिटी से जुड़ने, नए वॉलपेपर का अनुरोध करने और बातचीत के लिए हमारे डिस्कशन ग्रुप में शामिल हों!",
      group_welcome: "👋 डिस्कशन ग्रुप में आपका स्वागत है, <b>{NAME}</b>! कृपया नियमों का पालन करें।",
      group_goodbye: "👋 अलविदा <b>{NAME}</b>, हमारे साथ जुड़ने के लिए धन्यवाद!",
      group_rules: "📜 <b>ग्रुप के नियम एवं दिशानिर्देश:</b>\n\n1. सभी सदस्यों का सम्मान करें।\n2. स्पैम, अनधिकृत लिंक या प्रचार की सख्त मनाही है।\n3. बातचीत शालीन और प्रासंगिक रखें।\n4. एडमिन के निर्देशों का पालन करें।",
      link_filter_warning: "⚠️ <b>चेतावनी:</b> इस ग्रुप में लिंक भेजना प्रतिबंधित है, {NAME}!",
      word_filter_warning: "⚠️ <b>चेतावनी:</b> अनुचित शब्द या प्रतिबंधित शब्दावली की अनुमति नहीं है, {NAME}!",
      flood_warning: "⚠️ <b>फ्लड अलर्ट:</b> संदेश बहुत तेज़ी से भेजे जा रहे हैं! आपको 5 मिनट के लिए म्यूट कर दिया गया है, {NAME}।"
    }
  },
  buttons: {
    en: {
      wallpaper_channel: "🖼 Wallpaper Channel",
      discussion_group: "💬 Discussion Group",
      contact_owner: "✉ Contact Us",
      help: "📖 Help",
      change_language: "🌐 Language"
    },
    hi: {
      wallpaper_channel: "🖼 वॉलपेपर चैनल",
      discussion_group: "💬 डिस्कशन ग्रुप",
      contact_owner: "✉ संपर्क करें",
      help: "📖 सहायता",
      change_language: "🌐 भाषा बदलें"
    }
  }
};

// ==========================================
// 2. TELEGRAM BOT API CLIENT
// ==========================================
async function callTelegram(env, method, payload = {}) {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) {
      // Gracefully handle harmless Telegram notification "message is not modified"
      if (data.description && data.description.includes("message is not modified")) {
        return { ok: true, not_modified: true };
      }
      console.warn(`Telegram API [${method}] warning:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`Telegram API Network Exception [${method}]:`, err);
    return { ok: false, error: err.message };
  }
}

async function sendMessage(env, chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: options.parse_mode !== undefined ? options.parse_mode : "HTML",
    reply_markup: options.reply_markup,
    disable_web_page_preview: options.disable_web_page_preview !== false
  };
  let res = await callTelegram(env, "sendMessage", payload);
  // Safe HTML fallback: if Telegram rejects due to malformed entity parsing, retry as plain text
  if (!res.ok && res.description && res.description.includes("can't parse entities")) {
    delete payload.parse_mode;
    res = await callTelegram(env, "sendMessage", payload);
  }
  return res;
}

async function editMessageText(env, chatId, messageId, text, options = {}) {
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

async function answerCallbackQuery(env, callbackQueryId, text = "", showAlert = false) {
  return await callTelegram(env, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text,
    show_alert: showAlert
  });
}

async function deleteMessage(env, chatId, messageId) {
  return await callTelegram(env, "deleteMessage", {
    chat_id: chatId,
    message_id: messageId
  });
}

async function pinChatMessage(env, chatId, messageId, disableNotification = false) {
  return await callTelegram(env, "pinChatMessage", {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: disableNotification
  });
}

async function unpinChatMessage(env, chatId, messageId = null) {
  const payload = { chat_id: chatId };
  if (messageId) payload.message_id = messageId;
  return await callTelegram(env, "unpinChatMessage", payload);
}

async function restrictChatMember(env, chatId, userId, permissions, untilDate = 0) {
  return await callTelegram(env, "restrictChatMember", {
    chat_id: chatId,
    user_id: userId,
    permissions: permissions,
    until_date: untilDate
  });
}

async function banChatMember(env, chatId, userId, untilDate = 0) {
  return await callTelegram(env, "banChatMember", {
    chat_id: chatId,
    user_id: userId,
    until_date: untilDate
  });
}

async function unbanChatMember(env, chatId, userId, onlyIfBanned = true) {
  return await callTelegram(env, "unbanChatMember", {
    chat_id: chatId,
    user_id: userId,
    only_if_banned: onlyIfBanned
  });
}

async function getChatMember(env, chatId, userId) {
  return await callTelegram(env, "getChatMember", {
    chat_id: chatId,
    user_id: userId
  });
}

// ==========================================
// 3. GITHUB CONTENT LOADER & KV STORAGE
// ==========================================
async function loadGitHubDefaults(env) {
  if (!env.GITHUB_CONTENT_URL) {
    return DEFAULT_CONTENT;
  }
  try {
    const cached = await env.BOT_DATA.get("cache:github_content", "json");
    if (cached) return cached;

    const res = await fetch(env.GITHUB_CONTENT_URL, {
      headers: { "User-Agent": "Shiv-Yogi-Assistant-Worker" }
    });
    if (!res.ok) {
      console.warn(`GitHub content fetch failed (${res.status}), using embedded fallback.`);
      return DEFAULT_CONTENT;
    }
    const data = await res.json();
    if (data && data.version && data.messages) {
      // Cache in KV for 30 minutes to stay within free-tier limits
      await env.BOT_DATA.put("cache:github_content", JSON.stringify(data), { expirationTtl: 1800 });
      return data;
    }
    return DEFAULT_CONTENT;
  } catch (err) {
    console.error("Error loading GitHub defaults:", err);
    return DEFAULT_CONTENT;
  }
}

async function getFeatures(env) {
  const defaults = await loadGitHubDefaults(env);
  const custom = await env.BOT_DATA.get("settings:features", "json");
  return { ...DEFAULT_CONTENT.features, ...(defaults?.features || {}), ...(custom || {}) };
}

async function saveFeatures(env, features) {
  await env.BOT_DATA.put("settings:features", JSON.stringify(features));
}

async function getSettings(env) {
  const defaults = await loadGitHubDefaults(env);
  const custom = await env.BOT_DATA.get("settings:config", "json");
  return { ...DEFAULT_CONTENT.settings, ...(defaults?.settings || {}), ...(custom || {}) };
}

async function saveSettings(env, settings) {
  await env.BOT_DATA.put("settings:config", JSON.stringify(settings));
}

async function getMessage(env, lang, key) {
  const langKey = lang === "hi" ? "hi" : "en";
  // 1. Check Owner KV customized message
  const custom = await env.BOT_DATA.get(`messages:${langKey}:${key}`);
  if (custom) return custom;

  // 2. Check GitHub defaults
  const defaults = await loadGitHubDefaults(env);
  if (defaults?.messages?.[langKey]?.[key]) {
    return defaults.messages[langKey][key];
  }
  // 3. Fallback to embedded defaults
  return DEFAULT_CONTENT.messages[langKey]?.[key] || DEFAULT_CONTENT.messages.en[key] || "";
}

async function saveCustomMessage(env, lang, key, text) {
  const langKey = lang === "hi" ? "hi" : "en";
  await env.BOT_DATA.put(`messages:${langKey}:${key}`, text);
}

async function resetCustomMessage(env, lang, key) {
  const langKey = lang === "hi" ? "hi" : "en";
  await env.BOT_DATA.delete(`messages:${langKey}:${key}`);
}

async function getButtons(env, lang) {
  const langKey = lang === "hi" ? "hi" : "en";
  const defaults = await loadGitHubDefaults(env);
  return defaults?.buttons?.[langKey] || DEFAULT_CONTENT.buttons[langKey] || DEFAULT_CONTENT.buttons.en;
}

// ==========================================
// 4. STATS & LOGGING SYSTEM
// ==========================================
async function logActivity(env, actorId, action, detail) {
  try {
    const raw = await env.BOT_DATA.get("logs:recent", "json");
    const logs = Array.isArray(raw) ? raw : [];
    logs.unshift({
      time: new Date().toISOString(),
      actor: String(actorId),
      action: action,
      detail: detail
    });
    if (logs.length > 30) logs.length = 30;
    await env.BOT_DATA.put("logs:recent", JSON.stringify(logs));
  } catch (err) {
    console.error("Logging failure:", err);
  }
}

async function getStats(env) {
  const data = await env.BOT_DATA.get("stats:counters", "json");
  return {
    total_users: data?.total_users || 0,
    messages_processed: data?.messages_processed || 0,
    welcome_sent: data?.welcome_sent || 0,
    failed_messages: data?.failed_messages || 0
  };
}

async function incrementStat(env, field) {
  try {
    const stats = await getStats(env);
    stats[field] = (stats[field] || 0) + 1;
    await env.BOT_DATA.put("stats:counters", JSON.stringify(stats));
  } catch (err) {
    console.error("Stats increment failure:", err);
  }
}

// ==========================================
// 5. AUTHORIZATION & ROLE VERIFICATION
// ==========================================
function isOwner(env, userId) {
  if (!env.OWNER_ID || !userId) return false;
  return String(userId).trim() === String(env.OWNER_ID).trim();
}

async function getAdmin(env, userId) {
  return await env.BOT_DATA.get(`admins:${userId}`, "json");
}

async function getTempManager(env, userId) {
  const mgr = await env.BOT_DATA.get(`temp_managers:${userId}`, "json");
  if (!mgr) return null;
  // Strict automatic expiration check
  if (mgr.expires_at && Date.now() > mgr.expires_at) {
    await env.BOT_DATA.delete(`temp_managers:${userId}`);
    await logActivity(env, "system", "temp_manager_expired", `Manager ${userId} expired automatically`);
    return null;
  }
  return mgr;
}

async function hasPermission(env, userId, permission) {
  if (isOwner(env, userId)) return true;
  const admin = await getAdmin(env, userId);
  if (admin && admin.active && admin.permissions?.[permission]) return true;
  const mgr = await getTempManager(env, userId);
  if (mgr && mgr.permissions?.[permission]) return true;
  return false;
}

// ==========================================
// 6. OWNER CONTROL PANEL INTERFACE
// ==========================================
function buildMainPanelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "⚙️ Bot Settings", callback_data: "p:settings" },
        { text: "🎛 Feature Controls", callback_data: "p:feat" }
      ],
      [
        { text: "👋 Welcome Message", callback_data: "p:welc" },
        { text: "🔁 Repeat Message", callback_data: "p:rep" }
      ],
      [
        { text: "📢 Channel Manager", callback_data: "p:chan" },
        { text: "👥 Group Manager", callback_data: "p:grp" }
      ],
      [
        { text: "👮 Admin Control", callback_data: "p:adm" },
        { text: "⏳ Temp Managers", callback_data: "p:tm" }
      ],
      [
        { text: "📊 Statistics", callback_data: "p:stats" },
        { text: "📜 Activity Logs", callback_data: "p:logs" }
      ],
      [
        { text: "🌐 Languages", callback_data: "p:lang" },
        { text: "✉️ Contact Settings", callback_data: "p:cont" }
      ],
      [
        { text: "🛡 Security Status", callback_data: "p:sec" },
        { text: "💾 Backup / Restore", callback_data: "p:backup" }
      ],
      [
        { text: "🔄 Reset Defaults", callback_data: "p:reset" },
        { text: "❌ Close Panel", callback_data: "p:close" }
      ]
    ]
  };
}

async function renderMainPanel(env) {
  const stats = await getStats(env);
  const feats = await getFeatures(env);
  const activeFeatCount = Object.values(feats).filter(Boolean).length;
  const totalFeats = Object.keys(feats).length;

  const text =
    `👑 <b>SHIV YOGI ASSISTANT - OWNER PANEL</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Owner ID:</b> <code>${env.OWNER_ID}</code>\n` +
    `🛡 <b>Bot Engine:</b> Cloudflare Workers (Edge)\n` +
    `🎛 <b>Active Features:</b> ${activeFeatCount}/${totalFeats}\n` +
    `👥 <b>Total Users Recorded:</b> ${stats.total_users}\n` +
    `✉️ <b>Messages Processed:</b> ${stats.messages_processed}\n` +
    `🚀 <b>Welcome Sent:</b> ${stats.welcome_sent}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Select an administrative module below to configure your bot:</i>`;

  return { text, reply_markup: buildMainPanelKeyboard() };
}

// Features Submenu
async function renderFeaturesMenu(env) {
  const feats = await getFeatures(env);
  const fKeys = [
    { key: "welcome_system", label: "Welcome System" },
    { key: "repeat_replies", label: "Repeat Replies" },
    { key: "contact_button", label: "Contact Button" },
    { key: "channel_management", label: "Channel System" },
    { key: "group_management", label: "Group Moderation" },
    { key: "admin_system", label: "Admin System" },
    { key: "temp_managers", label: "Temp Managers" },
    { key: "anti_spam", label: "Anti-Spam & Flood" },
    { key: "link_filter", label: "Group Link Filter" },
    { key: "word_filter", label: "Word Filter" },
    { key: "statistics", label: "Stats Recording" },
    { key: "maintenance_mode", label: "Maintenance Mode" }
  ];

  const buttons = [];
  for (let i = 0; i < fKeys.length; i += 2) {
    const item1 = fKeys[i];
    const item2 = fKeys[i + 1];
    const row = [
      {
        text: `${feats[item1.key] ? "✅" : "❌"} ${item1.label}`,
        callback_data: `p:ftgl:${item1.key}`
      }
    ];
    if (item2) {
      row.push({
        text: `${feats[item2.key] ? "✅" : "❌"} ${item2.label}`,
        callback_data: `p:ftgl:${item2.key}`
      });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  const text =
    `🎛 <b>FEATURE CONTROLS (ON / OFF)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Tap any feature button below to toggle its status in real-time.\n` +
    `Settings persist automatically into Cloudflare KV.`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// Bot Settings Submenu
async function renderSettingsMenu(env) {
  const settings = await getSettings(env);
  const text =
    `⚙️ <b>BOT GENERAL SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Owner Name:</b> ${settings.owner_name}\n` +
    `• <b>Contact Username:</b> @${settings.contact_username}\n` +
    `• <b>Wallpaper Channel:</b> ${settings.wallpaper_channel_url || "Not configured"}\n` +
    `• <b>Discussion Group:</b> ${settings.discussion_group_url || "Not configured"}\n` +
    `• <b>Channel ID:</b> <code>${settings.channel_id || "None"}</code>\n` +
    `• <b>Group ID:</b> <code>${settings.group_id || "None"}</code>\n` +
    `• <b>Repeat Cooldown:</b> ${settings.repeat_cooldown_seconds}s\n` +
    `• <b>Anti-Flood:</b> ${settings.anti_flood_threshold} msgs in ${settings.anti_flood_window_seconds}s\n` +
    `• <b>Timezone:</b> ${settings.timezone}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Note: Bot username is managed via @BotFather on Telegram.</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✏️ Set Channel ID", callback_data: "p:set:chan_id" },
        { text: "✏️ Set Group ID", callback_data: "p:set:grp_id" }
      ],
      [
        { text: "✏️ Set Contact @username", callback_data: "p:set:contact_user" },
        { text: "✏️ Set Channel URL", callback_data: "p:set:chan_url" }
      ],
      [
        { text: "⏱ Change Cooldown", callback_data: "p:set:cooldown" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Message Customizer Menu
async function renderMessageMenu(env, key, title) {
  const msgEn = await getMessage(env, "en", key);
  const text =
    `📝 <b>MESSAGE EDITOR: ${title}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Current Live Content (Preview):</b>\n\n` +
    `${msgEn}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Select an option below to update or restore this message:`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "✏️ Edit Message Text", callback_data: `p:edit_msg:${key}` }],
      [{ text: "🔄 Restore Default Content", callback_data: `p:reset_msg:${key}` }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Channel Management Menu
async function renderChannelMenu(env) {
  const settings = await getSettings(env);
  const text =
    `📢 <b>CHANNEL MANAGEMENT & POSTING</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Channel ID:</b> <code>${settings.channel_id || "Not Set"}</code>\n` +
    `• <b>Channel URL:</b> ${settings.wallpaper_channel_url}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Features Supported:</b>\n` +
    `• <b>Draft & Approval:</b> Preview post before publishing to channel\n` +
    `• <b>Pin / Unpin:</b> Automatically or manually pin published posts\n` +
    `• <b>Post History:</b> View past 10 bot-published announcements\n` +
    `• <b>Scheduling:</b> Schedule posts via Cloudflare Cron Triggers\n` +
    `• <b>Channel Join:</b> Greet new channel subscribers with group invite\n\n` +
    `<i>To draft a post, click below:</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✍️ Draft New Post", callback_data: "p:chan:draft" },
        { text: "📜 Post History", callback_data: "p:chan:hist" }
      ],
      [
        { text: "⏰ Scheduled Posts", callback_data: "p:chan:sched_list" },
        { text: "🔍 Test Admin Status", callback_data: "p:chan:check_admin" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Group Management Menu
async function renderGroupMenu(env) {
  const settings = await getSettings(env);
  const feats = await getFeatures(env);
  const text =
    `👥 <b>GROUP MANAGEMENT & MODERATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Group ID:</b> <code>${settings.group_id || "Not Set"}</code>\n` +
    `• <b>Anti-Spam & Flood:</b> ${feats.anti_spam ? "✅ Active" : "❌ Disabled"}\n` +
    `• <b>Link Filter:</b> ${feats.link_filter ? "✅ Active" : "❌ Disabled"}\n` +
    `• <b>Word Filter:</b> ${feats.word_filter ? "✅ Active" : "❌ Disabled"}\n` +
    `• <b>Flood Threshold:</b> ${settings.anti_flood_threshold} msgs in ${settings.anti_flood_window_seconds}s (5m mute)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Group Moderation Commands:</b>\n` +
    `• <code>/warn &lt;reply&gt;</code> - Warn user (3 warns = ban)\n` +
    `• <code>/mute &lt;reply&gt; [mins]</code> - Mute user\n` +
    `• <code>/unmute &lt;reply&gt;</code> - Unmute user\n` +
    `• <code>/ban &lt;reply&gt;</code> - Ban user\n` +
    `• <code>/unban &lt;id&gt;</code> - Unban user\n` +
    `• <code>/rules</code> - Display group rules`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: feats.link_filter ? "Disable Link Filter" : "Enable Link Filter", callback_data: "p:ftgl:link_filter" },
        { text: feats.word_filter ? "Disable Word Filter" : "Enable Word Filter", callback_data: "p:ftgl:word_filter" }
      ],
      [
        { text: feats.anti_spam ? "Disable Anti-Flood" : "Enable Anti-Flood", callback_data: "p:ftgl:anti_spam" },
        { text: "📜 Edit Group Rules", callback_data: "p:welc_rules" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Admin Management Menu
async function renderAdminMenu(env) {
  const list = await env.BOT_DATA.list({ prefix: "admins:" });
  const adminIds = list.keys.map(k => k.name.replace("admins:", ""));

  let details = "";
  if (adminIds.length === 0) {
    details = "<i>No additional admins appointed yet.</i>\n";
  } else {
    for (const id of adminIds) {
      const data = await env.BOT_DATA.get(`admins:${id}`, "json");
      details += `• <b>ID:</b> <code>${id}</code> (${data?.active ? "Active" : "Inactive"})\n`;
    }
  }

  const text =
    `👮 <b>ADMINISTRATOR MANAGEMENT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Current Admins:</b>\n${details}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Admins can be granted modular permissions (Channel Posting, Group Moderation, Viewing Logs).\n` +
    `<i>Note: Admins can NEVER access Owner Panel or modify bot secrets.</i>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Add Admin by ID", callback_data: "p:adm:prompt_add" }],
      [{ text: "🗑 Remove Admin", callback_data: "p:adm:prompt_rm" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Temporary Managers Menu
async function renderTempManagerMenu(env) {
  const list = await env.BOT_DATA.list({ prefix: "temp_managers:" });
  let details = "";
  const now = Date.now();
  const activeMgrButtons = [];

  if (list.keys.length === 0) {
    details = "<i>No active temporary managers.</i>\n";
  } else {
    for (const k of list.keys) {
      const id = k.name.replace("temp_managers:", "");
      const data = await env.BOT_DATA.get(k.name, "json");
      if (data && data.expires_at) {
        if (now > data.expires_at) {
          await env.BOT_DATA.delete(k.name);
        } else {
          const minutesLeft = Math.round((data.expires_at - now) / 60000);
          const perms = Object.entries(data.permissions || {})
            .filter(([, v]) => v)
            .map(([p]) => p.replace("can_", ""))
            .join(", ") || "none";
          details += `• <code>${id}</code> — ⏳ <b>${minutesLeft}m left</b> [${perms}]\n`;
          activeMgrButtons.push([{ text: `🗑 Revoke ${id}`, callback_data: `p:tm:rm_direct:${id}` }]);
        }
      }
    }
    if (!details) details = "<i>No active temporary managers.</i>\n";
  }

  const text =
    `⏳ <b>TEMPORARY MANAGER SYSTEM</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Active Temporary Managers:</b>\n${details}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Configure custom duration and select modular permissions interactively.\n` +
    `Managers lose access immediately upon expiration or revocation.`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Add Temporary Manager", callback_data: "p:tm:prompt_add" }],
      ...activeMgrButtons,
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Activity Logs Menu
async function renderLogsMenu(env) {
  const raw = await env.BOT_DATA.get("logs:recent", "json");
  const logs = Array.isArray(raw) ? raw : [];

  let text = `📜 <b>RECENT ACTIVITY LOGS</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (logs.length === 0) {
    text += "<i>No activity recorded yet.</i>\n";
  } else {
    const displayLogs = logs.slice(0, 10);
    for (const log of displayLogs) {
      const time = log.time ? log.time.substring(11, 19) : "--:--:--";
      text += `• <code>[${time}]</code> <b>${escapeHtml(log.action)}</b>\n  Actor: <code>${log.actor}</code> | ${escapeHtml(log.detail || "")}\n`;
    }
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>Logs are maintained in a secure circular KV buffer.</i>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 Refresh Logs", callback_data: "p:logs" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Backup & Restore Menu
async function renderBackupMenu(env) {
  const text =
    `💾 <b>BACKUP AND RESTORE SYSTEM</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Securely export or restore all customized messages, settings, admin lists, and feature flags.\n\n` +
    `🔒 <b>Security Guarantee:</b> Private credentials (BOT_TOKEN and WEBHOOK_SECRET) are <b>NEVER</b> included in backups.\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Select an operation:`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📤 Export Full Backup (JSON)", callback_data: "p:bk:export" }],
      [{ text: "📥 Import / Restore Backup", callback_data: "p:bk:prompt_import" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Reset Settings Confirmation
function renderResetPrompt() {
  const text =
    `⚠️ <b>CONFIRM SYSTEM RESET</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Are you sure you want to reset all customized messages and feature flags back to default?\n\n` +
    `• All custom messages will revert to GitHub defaults.\n` +
    `• All feature switches will return to their default state.\n` +
    `• Admin permissions will NOT be deleted.\n\n` +
    `<b>This action cannot be undone!</b>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔴 Yes, Reset Everything to Defaults", callback_data: "p:reset:confirm" }],
      [{ text: "❌ Cancel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Security Status Menu
function renderSecurityMenu(env) {
  const text =
    `🛡 <b>SECURITY AND VERIFICATION STATUS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Webhook Secret Verification:</b> Active (Strict)\n` +
    `• <b>Configured Owner ID:</b> <code>${env.OWNER_ID}</code>\n` +
    `• <b>Authorization Model:</b> Independent server-side check per request\n` +
    `• <b>Header Verified:</b> <code>X-Telegram-Bot-Api-Secret-Token</code>\n` +
    `• <b>Duplicate Dedup Window:</b> Active (120s TTL)\n` +
    `• <b>Data Isolation:</b> Dedicated KV Namespace bound\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Admins and Managers cannot alter Owner or Security settings.</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 Register Webhook", callback_data: "p:sec:setup_webhook" },
        { text: "🔍 Webhook Info", callback_data: "p:sec:webhook_info" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Language Settings Menu
async function renderLanguageMenu(env) {
  const settings = await getSettings(env);
  const text =
    `🌐 <b>LANGUAGE SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Current Default Language:</b> ${settings.default_language === "hi" ? "Hindi (हिन्दी)" : "English"}\n` +
    `• <b>Supported Languages:</b> English (en), Hindi (hi)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Choose default language for users who haven't selected a preference:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🇬🇧 English", callback_data: "p:lang_set:en" },
        { text: "🇮🇳 हिन्दी (Hindi)", callback_data: "p:lang_set:hi" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==========================================
// 7. INLINE CALLBACK QUERY HANDLER
// ==========================================
async function handleCallbackQuery(env, query) {
  const data = query.data || "";
  const fromId = query.from?.id;
  const messageId = query.message?.message_id;
  const chatId = query.message?.chat?.id;

  // 1. Language selector from public welcome message
  if (data.startsWith("lang:user:")) {
    const selectedLang = data.split(":")[2];
    const userKey = `user:${fromId}`;
    const user = (await env.BOT_DATA.get(userKey, "json")) || {};
    user.lang = selectedLang;
    await env.BOT_DATA.put(userKey, JSON.stringify(user));
    await answerCallbackQuery(env, query.id, selectedLang === "hi" ? "भाषा बदलकर हिन्दी कर दी गई है।" : "Language changed to English.", true);
    return;
  }

  // 2. All "p:" callbacks are Owner Panel ONLY
  if (data.startsWith("p:")) {
    if (!isOwner(env, fromId)) {
      await answerCallbackQuery(env, query.id, "⛔ Access Denied: Owner Only!", true);
      return;
    }

    // Main Panel Home
    if (data === "p:main") {
      const { text, reply_markup } = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Close Panel
    if (data === "p:close") {
      await editMessageText(env, chatId, messageId, "🔒 <i>Control Panel closed. Type /panel anytime to reopen.</i>", { reply_markup: { inline_keyboard: [] } });
      await answerCallbackQuery(env, query.id, "Panel closed");
      return;
    }

    // Feature Toggles Submenu
    if (data === "p:feat") {
      const { text, reply_markup } = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Toggle specific feature
    if (data.startsWith("p:ftgl:")) {
      const featKey = data.replace("p:ftgl:", "");
      const feats = await getFeatures(env);
      feats[featKey] = !feats[featKey];
      await saveFeatures(env, feats);
      await logActivity(env, fromId, "toggle_feature", `${featKey} -> ${feats[featKey]}`);
      const { text, reply_markup } = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id, `${featKey} toggled ${feats[featKey] ? "ON" : "OFF"}`);
      return;
    }

    // Settings Submenu
    if (data === "p:settings") {
      const { text, reply_markup } = await renderSettingsMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Welcome Message Editor Submenu
    if (data === "p:welc") {
      const { text, reply_markup } = await renderMessageMenu(env, "welcome", "Welcome Message");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Repeat Message Editor Submenu
    if (data === "p:rep") {
      const { text, reply_markup } = await renderMessageMenu(env, "repeat", "Repeat Reply Message");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Contact Settings Submenu
    if (data === "p:cont") {
      const { text, reply_markup } = await renderMessageMenu(env, "contact", "Contact Us Message");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Group Rules Message
    if (data === "p:welc_rules") {
      const { text, reply_markup } = await renderMessageMenu(env, "group_rules", "Group Rules");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Channel Submenu
    if (data === "p:chan") {
      const { text, reply_markup } = await renderChannelMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Channel Post Drafting Prompt
    if (data === "p:chan:draft") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "draft_channel_post" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `✍️ <b>Channel Post Drafter:</b>\n\nSend the text announcement you want to post. You can include HTML formatting (<b>bold</b>, <i>italic</i>, links, etc.).\n\nYou will be able to review, approve, pin, or schedule it before it is published.`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Channel Publish Draft Immediately
    if (data === "p:chd:pub" || data === "p:chd:pub_pin") {
      const shouldPin = data === "p:chd:pub_pin";
      const draft = await env.BOT_DATA.get("chan:current_draft", "json");
      const settings = await getSettings(env);
      if (!draft || !draft.text) {
        await answerCallbackQuery(env, query.id, "No active draft found or expired!", true);
        return;
      }
      if (!settings.channel_id) {
        await answerCallbackQuery(env, query.id, "Channel ID is not configured in Bot Settings!", true);
        return;
      }
      const res = await sendMessage(env, settings.channel_id, draft.text, {
        reply_markup: settings.discussion_group_url ? {
          inline_keyboard: [[{ text: "💬 Discussion Group", url: settings.discussion_group_url }]]
        } : undefined
      });
      if (res.ok) {
        const pubMsgId = res.result?.message_id;
        if (shouldPin && pubMsgId) {
          await pinChatMessage(env, settings.channel_id, pubMsgId);
        }
        // Save to channel history
        const rawHist = await env.BOT_DATA.get("chan:history", "json");
        const hist = Array.isArray(rawHist) ? rawHist : [];
        hist.unshift({
          id: pubMsgId,
          text: draft.text.slice(0, 80),
          pinned: shouldPin,
          date: new Date().toISOString()
        });
        if (hist.length > 10) hist.length = 10;
        await env.BOT_DATA.put("chan:history", JSON.stringify(hist));
        await env.BOT_DATA.delete("chan:current_draft");
        await logActivity(env, fromId, "channel_post_published", `Post #${pubMsgId} published (Pinned: ${shouldPin})`);
        await editMessageText(env, chatId, messageId, `✅ <b>Post Successfully Published!</b>\n\nMessage ID: <code>${pubMsgId}</code>\nPinned: ${shouldPin ? "Yes 📌" : "No"}`, {
          reply_markup: {
            inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]]
          }
        });
        await answerCallbackQuery(env, query.id, "Post published successfully!");
      } else {
        await answerCallbackQuery(env, query.id, `Publish failed: ${res.description || "Check channel admin permissions"}`, true);
      }
      return;
    }

    // Channel Discard Draft
    if (data === "p:chd:discard") {
      await env.BOT_DATA.delete("chan:current_draft");
      await editMessageText(env, chatId, messageId, "🗑 Draft discarded.", {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]]
        }
      });
      await answerCallbackQuery(env, query.id, "Draft discarded");
      return;
    }

    // Channel Schedule Draft Prompt
    if (data === "p:chd:sched") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "schedule_draft_post" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `⏰ <b>Schedule Channel Post:</b>\n\nEnter the delay in minutes from now when this post should be published (e.g. <code>30</code>, <code>60</code>, <code>1440</code>):`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Channel Post History View
    if (data === "p:chan:hist") {
      const rawHist = await env.BOT_DATA.get("chan:history", "json");
      const hist = Array.isArray(rawHist) ? rawHist : [];
      let histText = `📜 <b>RECENT CHANNEL POST HISTORY</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const buttons = [];
      if (hist.length === 0) {
        histText += `<i>No published channel posts recorded yet.</i>\n`;
      } else {
        for (const item of hist) {
          const dStr = item.date ? item.date.slice(0, 16).replace("T", " ") : "";
          histText += `• <b>Post ID:</b> <code>${item.id}</code> [${item.pinned ? "📌 Pinned" : "Regular"}] (${dStr})\n  "${escapeHtml(item.text)}..."\n\n`;
          buttons.push([
            { text: `📌 Pin #${item.id}`, callback_data: `p:chpin:${item.id}` },
            { text: `📍 Unpin #${item.id}`, callback_data: `p:chunpin:${item.id}` }
          ]);
        }
      }
      histText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>You can pin or unpin recent posts using the buttons below:</i>`;
      buttons.push([{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]);
      await editMessageText(env, chatId, messageId, histText, { reply_markup: { inline_keyboard: buttons } });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Pin or Unpin Specific Post from History
    if (data.startsWith("p:chpin:") || data.startsWith("p:chunpin:")) {
      const isPin = data.startsWith("p:chpin:");
      const targetMsgId = parseInt(data.replace(isPin ? "p:chpin:" : "p:chunpin:", ""), 10);
      const settings = await getSettings(env);
      if (!settings.channel_id || !targetMsgId) {
        await answerCallbackQuery(env, query.id, "Invalid post ID or channel ID missing", true);
        return;
      }
      const res = isPin
        ? await pinChatMessage(env, settings.channel_id, targetMsgId)
        : await unpinChatMessage(env, settings.channel_id, targetMsgId);
      if (res.ok) {
        await answerCallbackQuery(env, query.id, isPin ? `Post #${targetMsgId} pinned!` : `Post #${targetMsgId} unpinned!`, true);
        await logActivity(env, fromId, isPin ? "channel_post_pinned" : "channel_post_unpinned", `Message ID ${targetMsgId}`);
      } else {
        await answerCallbackQuery(env, query.id, `Action failed: ${res.description || "Bot lacks channel admin permissions"}`, true);
      }
      return;
    }

    // Scheduled Posts List View
    if (data === "p:chan:sched_list") {
      const rawSched = await env.BOT_DATA.get("chan:scheduled_list", "json");
      const sched = Array.isArray(rawSched) ? rawSched : [];
      let schedText = `⏰ <b>SCHEDULED CHANNEL POSTS</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const buttons = [];
      const now = Date.now();
      if (sched.length === 0) {
        schedText += `<i>No scheduled posts currently queued.</i>\n\n`;
      } else {
        for (const item of sched) {
          const diffMins = Math.round((item.post_at - now) / 60000);
          schedText += `• <b>ID:</b> <code>${item.id}</code> — ⏳ <b>Due in ${diffMins} min</b>\n  "${escapeHtml(item.text.slice(0, 60))}..."\n\n`;
          buttons.push([{ text: `🗑 Cancel Sched #${item.id}`, callback_data: `p:chsched_del:${item.id}` }]);
        }
      }
      schedText +=
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `ℹ️ <i>Cloudflare Cron Triggers: Scheduled tasks run when a Cron Trigger fires. Configure <code>* * * * *</code> in Cloudflare Dashboard.</i>`;
      buttons.push([{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]);
      await editMessageText(env, chatId, messageId, schedText, { reply_markup: { inline_keyboard: buttons } });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Delete a Scheduled Post
    if (data.startsWith("p:chsched_del:")) {
      const schedId = data.replace("p:chsched_del:", "");
      const rawSched = await env.BOT_DATA.get("chan:scheduled_list", "json");
      const sched = Array.isArray(rawSched) ? rawSched.filter(s => String(s.id) !== String(schedId)) : [];
      await env.BOT_DATA.put("chan:scheduled_list", JSON.stringify(sched));
      await answerCallbackQuery(env, query.id, "Scheduled post cancelled", true);
      // Re-render
      const { text, reply_markup } = await renderChannelMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Test Channel Admin
    if (data === "p:chan:check_admin") {
      const settings = await getSettings(env);
      if (!settings.channel_id) {
        await answerCallbackQuery(env, query.id, "Channel ID is not configured yet!", true);
        return;
      }
      const me = await callTelegram(env, "getMe");
      const check = await getChatMember(env, settings.channel_id, me.result?.id);
      if (check.ok && ["administrator", "creator"].includes(check.result?.status)) {
        await answerCallbackQuery(env, query.id, `✅ Bot is verified Administrator in channel!`, true);
      } else {
        await answerCallbackQuery(env, query.id, `❌ Bot is NOT an admin in channel or channel ID is wrong.`, true);
      }
      return;
    }

    // Group Submenu
    if (data === "p:grp") {
      const { text, reply_markup } = await renderGroupMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Admin Submenu
    if (data === "p:adm") {
      const { text, reply_markup } = await renderAdminMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Temp Manager Submenu
    if (data === "p:tm") {
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Revoke Temp Manager Directly from button
    if (data.startsWith("p:tm:rm_direct:")) {
      const targetId = data.replace("p:tm:rm_direct:", "");
      await env.BOT_DATA.delete(`temp_managers:${targetId}`);
      await logActivity(env, fromId, "revoke_temp_manager", `Revoked manager: ${targetId}`);
      await answerCallbackQuery(env, query.id, `Manager ${targetId} revoked!`, true);
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Toggle Permission in Draft Temp Manager
    if (data.startsWith("p:tmp:")) {
      const parts = data.split(":");
      const targetId = parts[2];
      const permKey = parts[3];
      const draftKey = `state:draft_tm:${targetId}`;
      const draft = await env.BOT_DATA.get(draftKey, "json");
      if (draft && draft.permissions) {
        draft.permissions[permKey] = !draft.permissions[permKey];
        await env.BOT_DATA.put(draftKey, JSON.stringify(draft), { expirationTtl: 300 });

        const kb = buildTempManagerPermsKeyboard(targetId, draft.permissions);
        await editMessageText(
          env,
          chatId,
          messageId,
          `⏳ <b>Configure Permissions for User:</b> <code>${targetId}</code>\n<b>Duration:</b> ${draft.duration_minutes} minutes\n\nTap buttons to toggle permissions, then click Save:`,
          { reply_markup: kb }
        );
      }
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Save and Activate Configured Temp Manager
    if (data.startsWith("p:tmsave:")) {
      const targetId = data.replace("p:tmsave:", "");
      const draftKey = `state:draft_tm:${targetId}`;
      const draft = await env.BOT_DATA.get(draftKey, "json");
      if (!draft) {
        await answerCallbackQuery(env, query.id, "Setup session expired. Please start over.", true);
        return;
      }
      const expiresAt = Date.now() + (draft.duration_minutes || 60) * 60 * 1000;
      await env.BOT_DATA.put(
        `temp_managers:${targetId}`,
        JSON.stringify({
          user_id: targetId,
          added_at: Date.now(),
          expires_at: expiresAt,
          permissions: draft.permissions
        })
      );
      await env.BOT_DATA.delete(draftKey);
      await logActivity(env, fromId, "add_temp_manager", `Appointed ${targetId} for ${draft.duration_minutes}m with custom permissions`);
      await answerCallbackQuery(env, query.id, `Temporary Manager ${targetId} activated!`, true);
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Activity Logs
    if (data === "p:logs") {
      const { text, reply_markup } = await renderLogsMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Statistics
    if (data === "p:stats") {
      const stats = await getStats(env);
      const text =
        `📊 <b>LIVE BOT STATISTICS</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>Total Users Recorded:</b> ${stats.total_users}\n` +
        `• <b>Total Messages Handled:</b> ${stats.messages_processed}\n` +
        `• <b>Welcome Messages Sent:</b> ${stats.welcome_sent}\n` +
        `• <b>Failed Delivery Attempts:</b> ${stats.failed_messages}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `<i>Counters update atomically in Cloudflare KV.</i>`;
      await editMessageText(env, chatId, messageId, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Refresh", callback_data: "p:stats" }],
            [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
          ]
        }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Language Submenu
    if (data === "p:lang") {
      const { text, reply_markup } = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Set Default Language
    if (data.startsWith("p:lang_set:")) {
      const lang = data.replace("p:lang_set:", "");
      const settings = await getSettings(env);
      settings.default_language = lang;
      await saveSettings(env, settings);
      await logActivity(env, fromId, "change_default_language", lang);
      await answerCallbackQuery(env, query.id, `Default language set to ${lang.toUpperCase()}`, true);
      const { text, reply_markup } = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Security Status Submenu
    if (data === "p:sec") {
      const { text, reply_markup } = renderSecurityMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Register Webhook via Telegram API
    if (data === "p:sec:setup_webhook") {
      const webhookUrl = `${new URL(query.message?.chat?.id ? "https://api.telegram.org" : "https://dummy").origin}`;
      // In Worker context, we query telegram directly:
      const workerDomain = env.WORKER_DOMAIN || "your-worker.workers.dev";
      const targetWebhookUrl = `https://${workerDomain}/`;
      const res = await callTelegram(env, "setWebhook", {
        url: targetWebhookUrl,
        secret_token: env.WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
        drop_pending_updates: false
      });
      await answerCallbackQuery(
        env,
        query.id,
        res.ok ? "✅ Webhook registered successfully!" : `❌ ${res.description || "Webhook setup failed"}`,
        true
      );
      return;
    }

    // View Webhook Info
    if (data === "p:sec:webhook_info") {
      const info = await callTelegram(env, "getWebhookInfo");
      const d = info.result || {};
      const infoText =
        `🔍 <b>TELEGRAM WEBHOOK DIAGNOSTICS</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>URL:</b> <code>${escapeHtml(d.url || "None")}</code>\n` +
        `• <b>Has Custom Cert:</b> ${d.has_custom_certificate}\n` +
        `• <b>Pending Updates:</b> ${d.pending_update_count || 0}\n` +
        `• <b>Last Error Date:</b> ${d.last_error_date ? new Date(d.last_error_date * 1000).toISOString() : "None"}\n` +
        `• <b>Last Error Message:</b> <code>${escapeHtml(d.last_error_message || "None")}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      await sendMessage(env, chatId, infoText, {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Security Menu", callback_data: "p:sec" }]]
        }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Backup & Restore Submenu
    if (data === "p:backup") {
      const { text, reply_markup } = await renderBackupMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Export Backup
    if (data === "p:bk:export") {
      const settings = await getSettings(env);
      const features = await getFeatures(env);
      const adminsList = await env.BOT_DATA.list({ prefix: "admins:" });
      const admins = {};
      for (const k of adminsList.keys) {
        admins[k.name] = await env.BOT_DATA.get(k.name, "json");
      }
      const customMsgs = {};
      const msgsList = await env.BOT_DATA.list({ prefix: "messages:" });
      for (const k of msgsList.keys) {
        customMsgs[k.name] = await env.BOT_DATA.get(k.name);
      }

      const backupData = {
        exported_at: new Date().toISOString(),
        version: "1.0.0",
        settings,
        features,
        admins,
        custom_messages: customMsgs
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      await sendMessage(
        env,
        chatId,
        `📦 <b>SHIV YOGI ASSISTANT - BACKUP EXPORT</b>\n\n<code>${escapeHtml(jsonStr)}</code>\n\n<i>Copy this JSON and save it in a safe place. Private tokens are strictly excluded.</i>`
      );
      await answerCallbackQuery(env, query.id, "Backup exported to chat");
      return;
    }

    // Prompt Import Backup
    if (data === "p:bk:prompt_import") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "import_backup" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `📥 <b>RESTORE BACKUP</b>\n\nPlease send the exported backup JSON in your next message.\n\n⚠️ <i>Warning: This will overwrite current custom settings and messages with the backup contents.</i>`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Reset Confirmation
    if (data === "p:reset") {
      const { text, reply_markup } = renderResetPrompt();
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Confirm Reset
    if (data === "p:reset:confirm") {
      await saveFeatures(env, DEFAULT_CONTENT.features);
      await saveSettings(env, DEFAULT_CONTENT.settings);
      const msgs = ["welcome", "repeat", "contact", "help", "about", "maintenance", "group_rules", "flood_warning"];
      for (const m of msgs) {
        await resetCustomMessage(env, "en", m);
        await resetCustomMessage(env, "hi", m);
      }
      await logActivity(env, fromId, "system_reset", "Settings and messages reset to defaults");
      await answerCallbackQuery(env, query.id, "System reset completed!", true);
      const { text, reply_markup } = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Prompt Message Edit
    if (data.startsWith("p:edit_msg:")) {
      const msgKey = data.replace("p:edit_msg:", "");
      await env.BOT_DATA.put(
        `state:owner_action`,
        JSON.stringify({ action: "edit_message", key: msgKey, lang: "en" }),
        { expirationTtl: 300 }
      );
      await sendMessage(
        env,
        chatId,
        `✏️ <b>Editing Message:</b> <code>${msgKey}</code>\n\n` +
        `Send the new text in your next message. You can use standard HTML formatting (<b>bold</b>, <i>italic</i>, <code>code</code>, <a href="...">link</a>).\n\n` +
        `To cancel, type /cancel or click below:`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel Edit", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Reset Specific Message
    if (data.startsWith("p:reset_msg:")) {
      const msgKey = data.replace("p:reset_msg:", "");
      await resetCustomMessage(env, "en", msgKey);
      await resetCustomMessage(env, "hi", msgKey);
      await logActivity(env, fromId, "reset_message", msgKey);
      await answerCallbackQuery(env, query.id, `Reset ${msgKey} to default`, true);
      const { text, reply_markup } = await renderMessageMenu(env, msgKey, msgKey);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Prompt Interactive Settings
    if (data.startsWith("p:set:")) {
      const settingType = data.replace("p:set:", "");
      await env.BOT_DATA.put(
        `state:owner_action`,
        JSON.stringify({ action: "set_setting", field: settingType }),
        { expirationTtl: 300 }
      );
      let promptText = `✏️ Send the new value for <code>${settingType}</code> in your next message:`;
      if (settingType === "chan_id") promptText = "✏️ Send the numeric Telegram Channel ID (e.g. <code>-1001234567890</code>):";
      if (settingType === "grp_id") promptText = "✏️ Send the numeric Telegram Group ID (e.g. <code>-1009876543210</code>):";
      if (settingType === "contact_user") promptText = "✏️ Send the contact username without @ symbol (e.g. <code>shiv_yogi</code>):";
      if (settingType === "chan_url") promptText = "✏️ Send the wallpaper channel public link (e.g. <code>https://t.me/your_channel</code>):";
      if (settingType === "cooldown") promptText = "✏️ Send repeat message cooldown in seconds (e.g. <code>60</code>):";

      await sendMessage(env, chatId, promptText, {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
        }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Prompt Add Admin
    if (data === "p:adm:prompt_add") {
      await env.BOT_DATA.put(`state:owner_action`, JSON.stringify({ action: "add_admin" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `👮 <b>Add New Administrator:</b>\n\nPlease send the numeric Telegram User ID of the user you want to appoint as Admin:`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Prompt Remove Admin
    if (data === "p:adm:prompt_rm") {
      await env.BOT_DATA.put(`state:owner_action`, JSON.stringify({ action: "remove_admin" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `🗑 <b>Remove Administrator:</b>\n\nPlease send the numeric Telegram User ID of the admin you wish to remove:`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Prompt Add Temp Manager
    if (data === "p:tm:prompt_add") {
      await env.BOT_DATA.put(`state:owner_action`, JSON.stringify({ action: "add_temp_mgr" }), { expirationTtl: 300 });
      await sendMessage(
        env,
        chatId,
        `⏳ <b>Add Temporary Manager:</b>\n\nSend the User ID and duration in minutes separated by a space.\n<i>Example:</i> <code>123456789 60</code> (for 60 minutes)`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]]
          }
        }
      );
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Cancel State
    if (data === "p:cancel_state") {
      await env.BOT_DATA.delete(`state:owner_action`);
      await editMessageText(env, chatId, messageId, "❌ Action cancelled.", { reply_markup: { inline_keyboard: [] } });
      await answerCallbackQuery(env, query.id, "Action cancelled");
      return;
    }
  }

  // Fallback for any unhandled callback to avoid hanging
  await answerCallbackQuery(env, query.id);
}

function buildTempManagerPermsKeyboard(targetId, permissions) {
  return {
    inline_keyboard: [
      [
        {
          text: `${permissions.can_post_channel ? "✅" : "❌"} Channel Posting`,
          callback_data: `p:tmp:${targetId}:can_post_channel`
        }
      ],
      [
        {
          text: `${permissions.can_moderate_group ? "✅" : "❌"} Group Moderation`,
          callback_data: `p:tmp:${targetId}:can_moderate_group`
        }
      ],
      [
        {
          text: `${permissions.can_view_stats ? "✅" : "❌"} View Statistics`,
          callback_data: `p:tmp:${targetId}:can_view_stats`
        }
      ],
      [
        {
          text: `${permissions.can_view_logs ? "✅" : "❌"} View Activity Logs`,
          callback_data: `p:tmp:${targetId}:can_view_logs`
        }
      ],
      [
        { text: "💾 Save & Activate Manager", callback_data: `p:tmsave:${targetId}` },
        { text: "❌ Cancel", callback_data: "p:tm" }
      ]
    ]
  };
}

// ==========================================
// 8. PRIVATE & GROUP MESSAGE HANDLER
// ==========================================
async function handleMessage(env, message) {
  const chatId = message.chat?.id;
  const chatType = message.chat?.type;
  const from = message.from;
  const fromId = from?.id;
  const text = message.text || message.caption || "";
  const now = Date.now();

  if (!fromId) return;

  // Track global messages processed
  await incrementStat(env, "messages_processed");

  // Check Maintenance Mode
  const feats = await getFeatures(env);
  if (feats.maintenance_mode && !isOwner(env, fromId)) {
    if (chatType === "private") {
      const maintMsg = await getMessage(env, "en", "maintenance");
      await sendMessage(env, chatId, maintMsg);
    }
    return;
  }

  // ----------------------------------------
  // A. PRIVATE CHAT HANDLING
  // ----------------------------------------
  if (chatType === "private") {
    // 1. Check if Owner is in an interactive state
    if (isOwner(env, fromId) && text !== "/cancel") {
      const state = await env.BOT_DATA.get("state:owner_action", "json");
      if (state) {
        await env.BOT_DATA.delete("state:owner_action");

        // Action: Edit Message
        if (state.action === "edit_message") {
          await saveCustomMessage(env, state.lang || "en", state.key, text);
          await logActivity(env, fromId, "edited_message", `Key: ${state.key}`);
          await sendMessage(
            env,
            chatId,
            `✅ <b>Message Updated Successfully!</b>\n\n<b>Preview:</b>\n\n${text}`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: "🔙 Back to Control Panel", callback_data: "p:main" }]]
              }
            }
          );
          return;
        }

        // Action: Set General Setting
        if (state.action === "set_setting") {
          const settings = await getSettings(env);
          if (state.field === "chan_id") settings.channel_id = text.trim();
          else if (state.field === "grp_id") settings.group_id = text.trim();
          else if (state.field === "contact_user") settings.contact_username = text.trim().replace("@", "");
          else if (state.field === "chan_url") settings.wallpaper_channel_url = text.trim();
          else if (state.field === "cooldown") settings.repeat_cooldown_seconds = parseInt(text.trim(), 10) || 60;

          await saveSettings(env, settings);
          await logActivity(env, fromId, "updated_setting", `${state.field} -> ${text.trim()}`);
          await sendMessage(env, chatId, `✅ <b>Setting Updated!</b>\n\n<code>${state.field}</code> is now set to <code>${escapeHtml(text.trim())}</code>`, {
            reply_markup: {
              inline_keyboard: [[{ text: "🔙 Back to Settings", callback_data: "p:settings" }]]
            }
          });
          return;
        }

        // Action: Add Admin
        if (state.action === "add_admin") {
          const targetId = text.trim();
          if (!/^\d+$/.test(targetId)) {
            await sendMessage(env, chatId, "❌ Invalid Telegram ID format. Must be numeric digits.");
            return;
          }
          await env.BOT_DATA.put(
            `admins:${targetId}`,
            JSON.stringify({
              user_id: targetId,
              added_at: now,
              added_by: fromId,
              active: true,
              permissions: {
                can_post_channel: true,
                can_moderate_group: true,
                can_view_stats: true,
                can_view_logs: true
              }
            })
          );
          await logActivity(env, fromId, "add_admin", `Appointed admin: ${targetId}`);
          await sendMessage(env, chatId, `✅ <b>Admin Successfully Added!</b>\nUser ID <code>${targetId}</code> is now an Administrator.`, {
            reply_markup: {
              inline_keyboard: [[{ text: "🔙 Admin Management", callback_data: "p:adm" }]]
            }
          });
          return;
        }

        // Action: Remove Admin
        if (state.action === "remove_admin") {
          const targetId = text.trim();
          await env.BOT_DATA.delete(`admins:${targetId}`);
          await logActivity(env, fromId, "remove_admin", `Removed admin: ${targetId}`);
          await sendMessage(env, chatId, `🗑 <b>Admin Removed!</b>\nUser ID <code>${targetId}</code> has been removed.`, {
            reply_markup: {
              inline_keyboard: [[{ text: "🔙 Admin Management", callback_data: "p:adm" }]]
            }
          });
          return;
        }

        // Action: Add Temp Manager (Prompt Configurable Permissions)
        if (state.action === "add_temp_mgr") {
          const parts = text.trim().split(/\s+/);
          const targetId = parts[0];
          const durationMinutes = parseInt(parts[1], 10) || 60;
          if (!/^\d+$/.test(targetId)) {
            await sendMessage(env, chatId, "❌ Invalid User ID. Must be numeric.");
            return;
          }

          const defaultPerms = {
            can_post_channel: true,
            can_moderate_group: true,
            can_view_stats: false,
            can_view_logs: false
          };

          await env.BOT_DATA.put(
            `state:draft_tm:${targetId}`,
            JSON.stringify({
              id: targetId,
              duration_minutes: durationMinutes,
              permissions: defaultPerms
            }),
            { expirationTtl: 300 }
          );

          const kb = buildTempManagerPermsKeyboard(targetId, defaultPerms);
          await sendMessage(
            env,
            chatId,
            `⏳ <b>Configure Permissions for Temporary Manager:</b> <code>${targetId}</code>\n<b>Duration:</b> ${durationMinutes} minutes\n\nTap buttons below to customize permissions:`,
            { reply_markup: kb }
          );
          return;
        }

        // Action: Draft Channel Post (Approval Workflow)
        if (state.action === "draft_channel_post") {
          await env.BOT_DATA.put(
            "chan:current_draft",
            JSON.stringify({
              text: text,
              created_at: now
            }),
            { expirationTtl: 1800 }
          );

          const approvalKeyboard = {
            inline_keyboard: [
              [
                { text: "🚀 Publish Now", callback_data: "p:chd:pub" },
                { text: "📌 Publish & Pin", callback_data: "p:chd:pub_pin" }
              ],
              [
                { text: "⏰ Schedule Post", callback_data: "p:chd:sched" },
                { text: "🗑 Discard Draft", callback_data: "p:chd:discard" }
              ],
              [{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]
            ]
          };

          await sendMessage(
            env,
            chatId,
            `📝 <b>CHANNEL POST APPROVAL PREVIEW</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${text}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>Approve publication, pin, schedule or discard:</i>`,
            { reply_markup: approvalKeyboard }
          );
          return;
        }

        // Action: Schedule Draft Post
        if (state.action === "schedule_draft_post") {
          const delayMinutes = parseInt(text.trim(), 10);
          if (isNaN(delayMinutes) || delayMinutes <= 0) {
            await sendMessage(env, chatId, "❌ Invalid number of minutes. Please send a positive number (e.g. 30).");
            return;
          }
          const draft = await env.BOT_DATA.get("chan:current_draft", "json");
          if (!draft || !draft.text) {
            await sendMessage(env, chatId, "❌ Draft expired. Please draft the post again.");
            return;
          }

          const rawSched = await env.BOT_DATA.get("chan:scheduled_list", "json");
          const schedList = Array.isArray(rawSched) ? rawSched : [];
          const postAt = now + delayMinutes * 60 * 1000;
          schedList.push({
            id: Date.now(),
            text: draft.text,
            post_at: postAt,
            pin: false,
            status: "pending"
          });
          await env.BOT_DATA.put("chan:scheduled_list", JSON.stringify(schedList));
          await env.BOT_DATA.delete("chan:current_draft");
          await logActivity(env, fromId, "channel_post_scheduled", `Scheduled post in ${delayMinutes}m`);

          await sendMessage(
            env,
            chatId,
            `⏰ <b>Post Scheduled Successfully!</b>\n\nWill be published in <b>${delayMinutes} minutes</b>.\n\n<i>Note: Ensure Cloudflare Cron Trigger is configured (e.g. <code>* * * * *</code>).</i>`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]]
              }
            }
          );
          return;
        }

        // Action: Restore / Import Backup
        if (state.action === "import_backup") {
          try {
            const data = JSON.parse(text);
            if (!data || typeof data !== "object") throw new Error("Invalid JSON object");

            // Strictly filter out any credentials
            delete data.BOT_TOKEN;
            delete data.WEBHOOK_SECRET;
            delete data.OWNER_ID;

            if (data.settings) await saveSettings(env, data.settings);
            if (data.features) await saveFeatures(env, data.features);
            if (data.admins && typeof data.admins === "object") {
              for (const [k, v] of Object.entries(data.admins)) {
                if (k.startsWith("admins:")) await env.BOT_DATA.put(k, JSON.stringify(v));
              }
            }
            if (data.custom_messages && typeof data.custom_messages === "object") {
              for (const [k, v] of Object.entries(data.custom_messages)) {
                if (k.startsWith("messages:")) await env.BOT_DATA.put(k, String(v));
              }
            }

            await logActivity(env, fromId, "backup_restored", "Settings and messages restored from backup JSON");
            await sendMessage(
              env,
              chatId,
              `✅ <b>Backup Restored Successfully!</b>\n\nAll settings, features, and custom messages from the backup have been applied.`,
              {
                reply_markup: {
                  inline_keyboard: [[{ text: "🔙 Backup Menu", callback_data: "p:backup" }]]
                }
              }
            );
          } catch (err) {
            await sendMessage(env, chatId, `❌ <b>Failed to restore backup:</b> ${escapeHtml(err.message)}`);
          }
          return;
        }
      }
    }

    // Cancel state command
    if (text === "/cancel") {
      await env.BOT_DATA.delete("state:owner_action");
      await sendMessage(env, chatId, "❌ Any active operation has been cancelled.");
      return;
    }

    // Owner-only Webhook Setup Command
    if (text === "/setwebhook") {
      if (!isOwner(env, fromId)) {
        await sendMessage(env, chatId, "⛔ Access Denied.");
        return;
      }
      await sendMessage(
        env,
        chatId,
        `🔗 <b>Webhook Registration:</b> Open /panel → 🛡 Security Status → Register Webhook, or set via curl with your Worker URL.`
      );
      return;
    }

    // 2. Owner-only /panel command
    if (text === "/panel") {
      if (!isOwner(env, fromId)) {
        await sendMessage(env, chatId, "⛔ <b>Access Restricted:</b> This command is strictly reserved for the Bot Owner.");
        await logActivity(env, fromId, "unauthorized_panel_attempt", "Access denied to /panel");
        return;
      }
      const { text: panelText, reply_markup } = await renderMainPanel(env);
      await sendMessage(env, chatId, panelText, { reply_markup });
      return;
    }

    // 3. /start command & User Lifecycle
    const userKey = `user:${fromId}`;
    const userRecord = await env.BOT_DATA.get(userKey, "json");
    const settings = await getSettings(env);
    const userLang = userRecord?.lang || settings.default_language || "en";
    const buttons = await getButtons(env, userLang);

    if (text === "/start" || !userRecord) {
      if (!userRecord) {
        await env.BOT_DATA.put(
          userKey,
          JSON.stringify({
            id: fromId,
            first_name: from.first_name || "",
            username: from.username || "",
            first_seen: now,
            last_seen: now,
            last_reply_at: now,
            lang: userLang,
            msg_count: 1
          })
        );
        await incrementStat(env, "total_users");
      } else {
        userRecord.last_seen = now;
        userRecord.msg_count = (userRecord.msg_count || 1) + 1;
        await env.BOT_DATA.put(userKey, JSON.stringify(userRecord));
      }

      if (feats.welcome_system) {
        const welcomeText = await getMessage(env, userLang, "welcome");
        const inlineKeyboard = [];

        if (settings.wallpaper_channel_url) {
          inlineKeyboard.push([{ text: buttons.wallpaper_channel, url: settings.wallpaper_channel_url }]);
        }
        if (settings.discussion_group_url) {
          inlineKeyboard.push([{ text: buttons.discussion_group, url: settings.discussion_group_url }]);
        }
        const subRow = [];
        if (feats.contact_button && settings.contact_username) {
          subRow.push({ text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` });
        }
        subRow.push({ text: "🌐 English / हिन्दी", callback_data: `lang:user:${userLang === "en" ? "hi" : "en"}` });
        inlineKeyboard.push(subRow);

        await sendMessage(env, chatId, welcomeText, {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
        await incrementStat(env, "welcome_sent");
      }
      return;
    }

    // 4. Other Standard User Commands
    if (text === "/help") {
      const helpMsg = await getMessage(env, userLang, "help");
      await sendMessage(env, chatId, helpMsg);
      return;
    }

    if (text === "/about") {
      const aboutMsg = await getMessage(env, userLang, "about");
      await sendMessage(env, chatId, aboutMsg);
      return;
    }

    if (text === "/contact") {
      const contactMsg = await getMessage(env, userLang, "contact");
      const keyboard = settings.contact_username
        ? {
            inline_keyboard: [
              [{ text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` }]
            ]
          }
        : undefined;
      await sendMessage(env, chatId, contactMsg, { reply_markup: keyboard });
      return;
    }

    if (text === "/language") {
      await sendMessage(env, chatId, "🌐 <b>Select your preferred language:</b>", {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🇬🇧 English", callback_data: "lang:user:en" },
              { text: "🇮🇳 हिन्दी (Hindi)", callback_data: "lang:user:hi" }
            ]
          ]
        }
      });
      return;
    }

    // 5. Subsequent Messages: Repeat / Contact System
    if (feats.repeat_replies) {
      const lastReply = userRecord.last_reply_at || 0;
      const cooldownMs = (settings.repeat_cooldown_seconds || 60) * 1000;

      if (now - lastReply >= cooldownMs) {
        userRecord.last_reply_at = now;
        userRecord.last_seen = now;
        await env.BOT_DATA.put(userKey, JSON.stringify(userRecord));

        const repeatMsg = await getMessage(env, userLang, "repeat");
        const replyMarkup = (feats.contact_button && settings.contact_username)
          ? {
              inline_keyboard: [
                [{ text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` }]
              ]
            }
          : undefined;

        await sendMessage(env, chatId, repeatMsg, { reply_markup: replyMarkup });
      } else {
        userRecord.last_seen = now;
        await env.BOT_DATA.put(userKey, JSON.stringify(userRecord));
      }
    }
    return;
  }

  // ----------------------------------------
  // B. GROUP & SUPERGROUP HANDLING
  // ----------------------------------------
  if (chatType === "group" || chatType === "supergroup") {
    if (!feats.group_management) return;

    const messageId = message.message_id;

    // 1. Group Rules Command
    if (text === "/rules" || text.startsWith("/rules@")) {
      const rules = await getMessage(env, "en", "group_rules");
      await sendMessage(env, chatId, rules);
      return;
    }

    // 2. Report Command
    if (text.startsWith("/report")) {
      const replyMsg = message.reply_to_message;
      if (!replyMsg) {
        await sendMessage(env, chatId, "⚠️ Reply to a message with <code>/report</code> to notify admins.");
        return;
      }
      await sendMessage(
        env,
        chatId,
        `🚨 <b>Report Submitted:</b> Admins alerted regarding message from <code>${replyMsg.from?.id}</code>.`
      );
      await logActivity(env, fromId, "user_report", `Reported message ${replyMsg.message_id} from ${replyMsg.from?.id}`);
      return;
    }

    // 3. New Chat Members Join
    if (message.new_chat_members && message.new_chat_members.length > 0) {
      for (const newMember of message.new_chat_members) {
        if (newMember.is_bot) continue;
        const name = escapeHtml(newMember.first_name || "Member");
        let welcome = await getMessage(env, "en", "group_welcome");
        welcome = welcome.replace("{NAME}", name);
        await sendMessage(env, chatId, welcome);
      }
      return;
    }

    // 4. Left Chat Member
    if (message.left_chat_member && !message.left_chat_member.is_bot) {
      const name = escapeHtml(message.left_chat_member.first_name || "Member");
      let bye = await getMessage(env, "en", "group_goodbye");
      bye = bye.replace("{NAME}", name);
      await sendMessage(env, chatId, bye);
      return;
    }

    // 5. Admin Moderation Commands
    const isSenderAdmin = await hasPermission(env, fromId, "can_moderate_group");

    if (isSenderAdmin && text.startsWith("/")) {
      const parts = text.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const replyMsg = message.reply_to_message;

      // Ban Command
      if (cmd.startsWith("/ban")) {
        const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
        if (!targetId) {
          await sendMessage(env, chatId, "⚠️ Reply to a user or specify user ID to ban.");
          return;
        }
        if (isOwner(env, targetId)) {
          await sendMessage(env, chatId, "⛔ Cannot ban the Owner!");
          return;
        }
        const res = await banChatMember(env, chatId, targetId);
        if (res.ok) {
          await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> has been banned.`);
          await logActivity(env, fromId, "group_ban", `Banned user ${targetId}`);
        } else {
          await sendMessage(env, chatId, `❌ Ban failed: ${res.description || "Bot lacks ban permissions."}`);
        }
        return;
      }

      // Unban Command
      if (cmd.startsWith("/unban")) {
        const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
        if (!targetId) {
          await sendMessage(env, chatId, "⚠️ Reply to a user or specify user ID to unban.");
          return;
        }
        const res = await unbanChatMember(env, chatId, targetId);
        if (res.ok) {
          await sendMessage(env, chatId, `✅ User <code>${targetId}</code> has been unbanned.`);
          await logActivity(env, fromId, "group_unban", `Unbanned user ${targetId}`);
        } else {
          await sendMessage(env, chatId, `❌ Unban failed: ${res.description || "Bot lacks permissions."}`);
        }
        return;
      }

      // Mute Command
      if (cmd.startsWith("/mute")) {
        const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
        const durationMins = parseInt(parts[replyMsg ? 1 : 2], 10) || 15;
        if (!targetId) {
          await sendMessage(env, chatId, "⚠️ Reply to a user or specify user ID and minutes: <code>/mute [minutes]</code>");
          return;
        }
        if (isOwner(env, targetId)) {
          await sendMessage(env, chatId, "⛔ Cannot mute the Owner!");
          return;
        }
        const untilDate = Math.floor(now / 1000) + durationMins * 60;
        const res = await restrictChatMember(env, chatId, targetId, { can_send_messages: false }, untilDate);
        if (res.ok) {
          await sendMessage(env, chatId, `🔇 User <code>${targetId}</code> muted for ${durationMins} minutes.`);
          await logActivity(env, fromId, "group_mute", `Muted ${targetId} for ${durationMins}m`);
        } else {
          await sendMessage(env, chatId, `❌ Mute failed: ${res.description || "Bot lacks permissions."}`);
        }
        return;
      }

      // Unmute Command
      if (cmd.startsWith("/unmute")) {
        const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
        if (!targetId) {
          await sendMessage(env, chatId, "⚠️ Reply to a user or specify user ID to unmute.");
          return;
        }
        const res = await restrictChatMember(env, chatId, targetId, {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true
        });
        if (res.ok) {
          await sendMessage(env, chatId, `🔊 User <code>${targetId}</code> has been unmuted.`);
          await logActivity(env, fromId, "group_unmute", `Unmuted ${targetId}`);
        } else {
          await sendMessage(env, chatId, `❌ Unmute failed: ${res.description || "Bot lacks permissions."}`);
        }
        return;
      }

      // Warn Command
      if (cmd.startsWith("/warn")) {
        const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
        if (!targetId) {
          await sendMessage(env, chatId, "⚠️ Reply to a user or specify user ID to issue a warning.");
          return;
        }
        const warnKey = `warns:${chatId}:${targetId}`;
        const count = ((await env.BOT_DATA.get(warnKey, "json")) || 0) + 1;
        await env.BOT_DATA.put(warnKey, JSON.stringify(count), { expirationTtl: 86400 });
        await sendMessage(env, chatId, `⚠️ <b>Warning [${count}/3]:</b> User <code>${targetId}</code> has been warned!`);
        if (count >= 3) {
          await banChatMember(env, chatId, targetId);
          await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> reached 3 warnings and has been banned.`);
          await env.BOT_DATA.delete(warnKey);
        }
        return;
      }
    }

    // Skip filter checks for Owner or Admins
    if (isOwner(env, fromId) || isSenderAdmin) return;

    // 6. Anti-Flood Detection and Enforcement
    if (feats.anti_spam) {
      const settings = await getSettings(env);
      const floodKey = `flood:${chatId}:${fromId}`;
      const rawHistory = await env.BOT_DATA.get(floodKey, "json");
      const history = Array.isArray(rawHistory) ? rawHistory : [];
      const windowMs = (settings.anti_flood_window_seconds || 5) * 1000;
      const cutoff = now - windowMs;
      const recentTimestamps = history.filter(ts => ts > cutoff);
      recentTimestamps.push(now);

      await env.BOT_DATA.put(floodKey, JSON.stringify(recentTimestamps), { expirationTtl: 60 });

      if (recentTimestamps.length > (settings.anti_flood_threshold || 5)) {
        await deleteMessage(env, chatId, messageId);
        // Automatically mute flooder for 5 minutes
        const muteUntil = Math.floor(now / 1000) + 300;
        await restrictChatMember(env, chatId, fromId, { can_send_messages: false }, muteUntil);
        const name = escapeHtml(from.first_name || "Member");
        let warn = await getMessage(env, "en", "flood_warning");
        warn = warn.replace("{NAME}", name);
        await sendMessage(env, chatId, warn);
        await logActivity(env, fromId, "flood_detected", `User ${fromId} flooded group ${chatId} - muted for 5m`);
        return;
      }
    }

    // 7. Link Filter
    if (feats.link_filter && (text.includes("http://") || text.includes("https://") || text.includes("t.me/"))) {
      await deleteMessage(env, chatId, messageId);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "link_filter_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      return;
    }

    // 8. Word Filter
    const settings = await getSettings(env);
    if (feats.word_filter && Array.isArray(settings.banned_words)) {
      const lower = text.toLowerCase();
      const hasBannedWord = settings.banned_words.some(w => lower.includes(w.toLowerCase()));
      if (hasBannedWord) {
        await deleteMessage(env, chatId, messageId);
        const name = escapeHtml(from.first_name || "Member");
        let warn = await getMessage(env, "en", "word_filter_warning");
        warn = warn.replace("{NAME}", name);
        await sendMessage(env, chatId, warn);
        return;
      }
    }
  }
}

// ==========================================
// 9. CHAT MEMBER UPDATES (CHANNEL JOIN INVITE)
// ==========================================
async function handleChatMemberUpdate(env, update) {
  const chatMember = update.chat_member;
  if (!chatMember) return;

  const chat = chatMember.chat;
  const newMember = chatMember.new_chat_member;
  const oldMember = chatMember.old_chat_member;
  const settings = await getSettings(env);
  const feats = await getFeatures(env);

  if (
    feats.channel_management &&
    settings.channel_id &&
    String(chat.id) === String(settings.channel_id) &&
    newMember &&
    newMember.status === "member" &&
    oldMember?.status !== "member"
  ) {
    const userId = newMember.user?.id;
    if (userId && !newMember.user.is_bot) {
      const inviteMsg = await getMessage(env, "en", "channel_join_invite");
      const replyMarkup = settings.discussion_group_url ? {
        inline_keyboard: [
          [{ text: "💬 Join Discussion Group", url: settings.discussion_group_url }]
        ]
      } : undefined;

      const res = await sendMessage(env, userId, inviteMsg, { reply_markup: replyMarkup });
      if (!res.ok) {
        await logActivity(env, "system", "channel_join_dm_skipped", `User ${userId} joined channel but hasn't started bot private chat.`);
      } else {
        await logActivity(env, "system", "channel_join_dm_sent", `Sent group invitation DM to user ${userId}`);
      }
    }
  }
}

// ==========================================
// 10. CLOUDFLARE CRON TRIGGER SCHEDULED HANDLER
// ==========================================
async function handleScheduled(controller, env, ctx) {
  try {
    const rawSched = await env.BOT_DATA.get("chan:scheduled_list", "json");
    if (!Array.isArray(rawSched) || rawSched.length === 0) return;

    const settings = await getSettings(env);
    if (!settings.channel_id) return;

    const now = Date.now();
    const remaining = [];

    for (const item of rawSched) {
      if (item.status === "pending" && item.post_at <= now) {
        const res = await sendMessage(env, settings.channel_id, item.text, {
          reply_markup: settings.discussion_group_url ? {
            inline_keyboard: [[{ text: "💬 Discussion Group", url: settings.discussion_group_url }]]
          } : undefined
        });

        if (res.ok) {
          const pubMsgId = res.result?.message_id;
          if (item.pin && pubMsgId) {
            await pinChatMessage(env, settings.channel_id, pubMsgId);
          }
          const rawHist = await env.BOT_DATA.get("chan:history", "json");
          const hist = Array.isArray(rawHist) ? rawHist : [];
          hist.unshift({
            id: pubMsgId,
            text: item.text.slice(0, 80),
            pinned: Boolean(item.pin),
            date: new Date().toISOString()
          });
          if (hist.length > 10) hist.length = 10;
          await env.BOT_DATA.put("chan:history", JSON.stringify(hist));
          await logActivity(env, "cron_trigger", "scheduled_channel_post_published", `Published post #${pubMsgId}`);
        } else {
          // If failed, keep in list for retry
          remaining.push(item);
        }
      } else {
        remaining.push(item);
      }
    }

    await env.BOT_DATA.put("chan:scheduled_list", JSON.stringify(remaining));
  } catch (err) {
    console.error("Scheduled cron task failed:", err);
  }
}

// ==========================================
// 11. CLOUDFLARE WORKER EXPORT
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Diagnostics & Health Check Route
    if (request.method === "GET") {
      if (url.pathname === "/" || url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "online",
            bot: "SHIV YOGI ASSISTANT",
            version: "1.0.0",
            engine: "Cloudflare Workers",
            kv_connected: Boolean(env.BOT_DATA),
            owner_configured: Boolean(env.OWNER_ID)
          }, null, 2),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Secure Webhook Setup endpoint via HTTP
      if (url.pathname === "/setup-webhook") {
        const secretParam = url.searchParams.get("secret");
        if (!secretParam || secretParam !== env.WEBHOOK_SECRET) {
          return new Response(JSON.stringify({ error: "Invalid secret parameter" }), { status: 403 });
        }
        const targetUrl = `${url.origin}/`;
        const res = await callTelegram(env, "setWebhook", {
          url: targetUrl,
          secret_token: env.WEBHOOK_SECRET,
          allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
          drop_pending_updates: false
        });
        return new Response(JSON.stringify(res, null, 2), {
          status: res.ok ? 200 : 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("Not Found", { status: 404 });
    }

    // 2. Validate Worker Environment Configuration
    if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.OWNER_ID || !env.BOT_DATA) {
      console.error("Critical: Incomplete Cloudflare Environment configuration.");
      return new Response(
        JSON.stringify({
          error: "Worker configuration incomplete. Ensure BOT_TOKEN, WEBHOOK_SECRET, OWNER_ID, and BOT_DATA KV are bound."
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Webhook Secret Token Verification
    const incomingSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!incomingSecret || incomingSecret !== env.WEBHOOK_SECRET) {
      console.warn("Unauthorized webhook request rejected: Secret token mismatch.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Parse Telegram Webhook Update
    let update;
    try {
      update = await request.json();
    } catch (err) {
      console.error("Invalid JSON body received:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    // 5. Update Deduplication Protection (120s TTL)
    if (update && update.update_id) {
      const dedupKey = `dedup:${update.update_id}`;
      const isDuplicate = await env.BOT_DATA.get(dedupKey);
      if (isDuplicate) {
        return new Response(JSON.stringify({ ok: true, note: "duplicate_skipped" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      ctx.waitUntil(env.BOT_DATA.put(dedupKey, "1", { expirationTtl: 120 }));
    }

    // 6. Dispatch Update to Specialized Handlers
    try {
      if (update.message) {
        await handleMessage(env, update.message);
      } else if (update.callback_query) {
        await handleCallbackQuery(env, update.callback_query);
      } else if (update.chat_member) {
        await handleChatMemberUpdate(env, update);
      }
    } catch (handlerErr) {
      console.error("Exception processing update:", handlerErr);
      await incrementStat(env, "failed_messages");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },

  // Cloudflare Cron Trigger scheduled task
  async scheduled(controller, env, ctx) {
    await handleScheduled(controller, env, ctx);
  }
};
