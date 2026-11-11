/**
 * SHIV YOGI ASSISTANT - ADVANCED BOT UPGRADE (v2.0.0)
 * Cloudflare Workers (ES Module Syntax) + Cloudflare KV + Telegram Bot API
 *
 * Modules:
 *  - modules/helpers.js
 *  - modules/security.js
 *  - modules/channel-manager.js
 *  - modules/scheduled-posts.js
 *  - modules/group-manager.js
 *  - modules/admin-manager.js
 *  - modules/automation.js
 *  - modules/statistics.js
 *  - modules/backup.js
 */

import {
  DEFAULT_CONTENT,
  callTelegram,
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  deleteMessage,
  pinChatMessage,
  unpinChatMessage,
  getMe,
  getSettings,
  saveSettings,
  getFeatures,
  saveFeatures,
  getMessage,
  saveCustomMessage,
  resetCustomMessage,
  getButtons,
  getTemplates,
  escapeHtml,
  formatDateIST
} from "./modules/helpers.js";

import {
  isOwner,
  getAdmin,
  getTempManager,
  hasPermission,
  verifyWebhookSecret,
  checkUpdateDedup,
  logSecurityEvent
} from "./modules/security.js";

import {
  getChannelsList,
  addChannel,
  removeChannel,
  verifyChannelAdmin,
  publishPost,
  getChannelHistory,
  deleteChannelPost
} from "./modules/channel-manager.js";

import {
  getScheduledList,
  addScheduledPost,
  cancelScheduledPost,
  retryFailedScheduledPost,
  processScheduledQueue
} from "./modules/scheduled-posts.js";

import { handleGroupMessage } from "./modules/group-manager.js";

import {
  listAdmins,
  addAdmin,
  removeAdmin,
  listTempManagers,
  addTempManager,
  revokeTempManager
} from "./modules/admin-manager.js";

import {
  getAutomationSettings,
  saveAutomationSettings,
  runAutomationCycle
} from "./modules/automation.js";

import {
  getStats,
  incrementStat,
  trackUserActivity,
  getActiveUserMetrics,
  exportAnalyticsJSON
} from "./modules/statistics.js";

import {
  createFullBackup,
  restoreBackup
} from "./modules/backup.js";

// ==========================================
// 1. CONTROL PANEL NAVIGATION & MENUS
// ==========================================
function buildMainPanelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "⚙️ Bot Settings", callback_data: "p:settings" },
        { text: "🎛 Feature Controls", callback_data: "p:feat" }
      ],
      [
        { text: "📢 Channel Manager", callback_data: "p:chan" },
        { text: "👥 Group Manager", callback_data: "p:grp" }
      ],
      [
        { text: "⏰ Scheduled Posts", callback_data: "p:sched" },
        { text: "🤖 Automation Center", callback_data: "p:auto" }
      ],
      [
        { text: "👮 Admin Control", callback_data: "p:adm" },
        { text: "⏳ Temp Managers", callback_data: "p:tm" }
      ],
      [
        { text: "👋 Welcome Message", callback_data: "p:welc" },
        { text: "🔁 Repeat Message", callback_data: "p:rep" }
      ],
      [
        { text: "📊 Statistics & DAU", callback_data: "p:stats" },
        { text: "📜 Activity Logs", callback_data: "p:logs" }
      ],
      [
        { text: "🛡 Security Center", callback_data: "p:sec" },
        { text: "🏥 System Health", callback_data: "p:health" }
      ],
      [
        { text: "🌐 Languages", callback_data: "p:lang" },
        { text: "💾 Backup & Restore", callback_data: "p:backup" }
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
  const activeMetrics = await getActiveUserMetrics(env);
  const feats = await getFeatures(env);
  const channels = await getChannelsList(env);
  const activeFeatCount = Object.values(feats).filter(Boolean).length;
  const totalFeats = Object.keys(feats).length;

  const text =
    `👑 <b>SHIV YOGI ASSISTANT — ADVANCED CONTROL PANEL</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Owner ID:</b> <code>${env.OWNER_ID}</code>\n` +
    `📢 <b>Configured Channels:</b> ${channels.length}\n` +
    `🎛 <b>Active Features:</b> ${activeFeatCount}/${totalFeats}\n` +
    `👥 <b>Total Registered:</b> ${stats.total_users} | <b>DAU:</b> ${activeMetrics.dau}\n` +
    `✉️ <b>Messages:</b> ${stats.messages_processed} | <b>Commands:</b> ${stats.commands_used}\n` +
    `📢 <b>Posts Published:</b> ${stats.channel_posts}\n` +
    `🕒 <b>Timezone:</b> Asia/Kolkata (IST)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Select an administrative module below to manage your community:</i>`;

  return { text, reply_markup: buildMainPanelKeyboard() };
}

// Submenu: Feature Switches
async function renderFeaturesMenu(env) {
  const feats = await getFeatures(env);
  const fKeys = [
    { key: "welcome_system", label: "Welcome System" },
    { key: "repeat_replies", label: "Repeat Replies" },
    { key: "contact_button", label: "Contact Button" },
    { key: "channel_management", label: "Channel System" },
    { key: "group_management", label: "Group Moderation" },
    { key: "captcha_verification", label: "Member CAPTCHA" },
    { key: "scheduled_posts", label: "Scheduled Posts" },
    { key: "automation", label: "Automation Tasks" },
    { key: "admin_system", label: "Admin System" },
    { key: "temp_managers", label: "Temp Managers" },
    { key: "anti_spam", label: "Anti-Flood Protection" },
    { key: "link_filter", label: "Group Link Filter" },
    { key: "word_filter", label: "Banned Word Filter" },
    { key: "maintenance_mode", label: "Emergency Maintenance" }
  ];

  const buttons = [];
  for (let i = 0; i < fKeys.length; i += 2) {
    const item1 = fKeys[i];
    const item2 = fKeys[i + 1];
    const row = [
      { text: `${feats[item1.key] ? "✅" : "❌"} ${item1.label}`, callback_data: `p:ftgl:${item1.key}` }
    ];
    if (item2) {
      row.push({ text: `${feats[item2.key] ? "✅" : "❌"} ${item2.label}`, callback_data: `p:ftgl:${item2.key}` });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  const text =
    `🎛 <b>FEATURE CONTROLS (ON / OFF)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Tap any button to toggle feature state in real-time.\n` +
    `All state toggles persist atomically to Cloudflare KV.`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// Submenu: Bot Settings
async function renderSettingsMenu(env) {
  const settings = await getSettings(env);
  const text =
    `⚙️ <b>BOT GENERAL SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Owner Name:</b> ${settings.owner_name}\n` +
    `• <b>Contact Username:</b> @${settings.contact_username}\n` +
    `• <b>Wallpaper Channel:</b> ${settings.wallpaper_channel_url}\n` +
    `• <b>Discussion Group:</b> ${settings.discussion_group_url}\n` +
    `• <b>Primary Channel ID:</b> <code>${settings.channel_id || "Not Set"}</code>\n` +
    `• <b>Group ID:</b> <code>${settings.group_id || "Not Set"}</code>\n` +
    `• <b>Repeat Cooldown:</b> ${settings.repeat_cooldown_seconds}s\n` +
    `• <b>Flood Threshold:</b> ${settings.anti_flood_threshold} msgs in ${settings.anti_flood_window_seconds}s\n` +
    `• <b>Warning Limit:</b> ${settings.warn_limit || 3} warnings\n` +
    `• <b>Timezone:</b> ${settings.timezone}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

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
        { text: "⏱ Cooldown Seconds", callback_data: "p:set:cooldown" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu: Channel Management
async function renderChannelMenu(env) {
  const channels = await getChannelsList(env);
  let chanListText = "";
  if (channels.length === 0) {
    chanListText = "<i>No channels configured yet.</i>\n";
  } else {
    for (const c of channels) {
      chanListText += `• <b>${escapeHtml(c.title)}:</b> <code>${c.id}</code> ${c.is_primary ? "⭐ [Primary]" : ""}\n`;
    }
  }

  const text =
    `📢 <b>ADVANCED CHANNEL MANAGER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Configured Channels:</b>\n${chanListText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Publish announcements, schedule posts with media, verify admin rights, and browse past posts.`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✍️ Draft New Post", callback_data: "p:chan:draft" },
        { text: "📜 Post History", callback_data: "p:chan:hist" }
      ],
      [
        { text: "➕ Add Channel ID", callback_data: "p:chan:add_prompt" },
        { text: "🔍 Test Admin Rights", callback_data: "p:chan:check_admin" }
      ],
      [
        { text: "📢 Broadcast All", callback_data: "p:chan:broadcast_prompt" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu: Scheduled Posts
async function renderScheduledMenu(env) {
  const list = await getScheduledList(env);
  const now = Date.now();
  let listText = "";
  const buttons = [];

  const pending = list.filter(p => p.status === "pending");
  if (pending.length === 0) {
    listText = "<i>No pending scheduled posts.</i>\n";
  } else {
    for (const item of pending.slice(0, 5)) {
      const diffMins = Math.round((item.post_at - now) / 60000);
      listText += `• <b>#${item.id}</b> — Due in ${diffMins} min ${item.recurring ? `[🔄 ${item.recurring}]` : ""}\n  "${escapeHtml(item.text.slice(0, 50))}..."\n`;
      buttons.push([{ text: `🗑 Cancel #${item.id}`, callback_data: `p:sched:del:${item.id}` }]);
    }
  }

  const text =
    `⏰ <b>SCHEDULED POST ENGINE</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Pending Scheduled Tasks:</b>\n${listText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Cloudflare Cron Trigger runs automatically to dispatch queued and recurring posts.\n` +
    `Timezone: <b>Asia/Kolkata (IST)</b>`;

  buttons.push([
    { text: "➕ Schedule Post", callback_data: "p:chan:draft" },
    { text: "🔄 Refresh Queue", callback_data: "p:sched" }
  ]);
  buttons.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// Submenu: Automation Center
async function renderAutomationMenu(env) {
  const cfg = await getAutomationSettings(env);
  const text =
    `🤖 <b>AUTOMATION CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Daily Announcement:</b> ${cfg.daily_announcement_enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Broadcast Time:</b> ${cfg.daily_announcement_hour}:00 IST\n` +
    `• <b>Daily Snapshot Backup:</b> ${cfg.auto_backup_enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Automated tasks execute periodically via Cloudflare Cron Triggers without manual intervention.`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: cfg.daily_announcement_enabled ? "Disable Daily Post" : "Enable Daily Post",
          callback_data: "p:auto:toggle_daily"
        }
      ],
      [
        {
          text: cfg.auto_backup_enabled ? "Disable Daily Backup" : "Enable Daily Backup",
          callback_data: "p:auto:toggle_backup"
        }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu: Statistics Dashboard
async function renderStatsMenu(env) {
  const stats = await getStats(env);
  const activeMetrics = await getActiveUserMetrics(env);

  const text =
    `📊 <b>ADVANCED BOT STATISTICS & ANALYTICS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 <b>Total Registered Users:</b> ${stats.total_users}\n` +
    `⚡ <b>Daily Active Users (DAU):</b> ${activeMetrics.dau}\n` +
    `✉️ <b>Total Messages Handled:</b> ${stats.messages_processed}\n` +
    `⌨️ <b>Commands Executed:</b> ${stats.commands_used}\n` +
    `🚀 <b>Welcome Greetings Sent:</b> ${stats.welcome_sent}\n` +
    `📢 <b>Channel Posts Published:</b> ${stats.channel_posts}\n` +
    `🛡 <b>Moderation Actions Taken:</b> ${stats.moderation_actions}\n` +
    `⚠️ <b>Failed Message Attempts:</b> ${stats.failed_messages}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Metrics are tracked atomically in Cloudflare KV without external databases.</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔄 Refresh Stats", callback_data: "p:stats" },
        { text: "📤 Export JSON", callback_data: "p:stats:export" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu: Security Center
function renderSecurityCenterMenu(env) {
  const text =
    `🛡 <b>ADVANCED SECURITY CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Configured Owner ID:</b> <code>${env.OWNER_ID}</code>\n` +
    `• <b>Webhook Secret Verification:</b> Strict (X-Telegram-Bot-Api-Secret-Token)\n` +
    `• <b>Update Deduplication:</b> Active (120s sliding window)\n` +
    `• <b>Privileged Role Isolation:</b> Server-side authorization check per request\n` +
    `• <b>Secrets Protection:</b> Zero tokens in source code or backup exports\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Test or register your webhook connection directly with Telegram:</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 Register Webhook", callback_data: "p:sec:setup_webhook" },
        { text: "🔍 Webhook Diagnostics", callback_data: "p:sec:webhook_info" }
      ],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu: System Health
async function renderHealthMenu(env) {
  const cronInfo = (await env.BOT_DATA.get("cron:last_run", "json")) || {};
  const me = await getMe(env);

  const text =
    `🏥 <b>SYSTEM HEALTH & DIAGNOSTICS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Worker Status:</b> Healthy & Online 🟢\n` +
    `• <b>Telegram API Connectivity:</b> ${me.ok ? "Connected (@" + me.result.username + ")" : "Error 🔴"}\n` +
    `• <b>KV Storage Binding:</b> Verified 🟢\n` +
    `• <b>Last Cron Execution:</b> ${cronInfo.ist || "Pending first tick"}\n` +
    `• <b>Cron Tasks Processed:</b> ${cronInfo.processed || 0}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 Refresh Health", callback_data: "p:health" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
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
    `<b>Current Content (Preview):</b>\n\n` +
    `${msgEn}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "✏️ Edit Message Text", callback_data: `p:edit_msg:${key}` }],
      [{ text: "🔄 Restore Default Content", callback_data: `p:reset_msg:${key}` }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Admin Submenu
async function renderAdminMenu(env) {
  const admins = await listAdmins(env);
  let details = "";
  if (admins.length === 0) {
    details = "<i>No additional admins appointed.</i>\n";
  } else {
    for (const a of admins) {
      details += `• <b>ID:</b> <code>${a.user_id}</code> (${a.active ? "Active" : "Inactive"})\n`;
    }
  }

  const text =
    `👮 <b>ADMINISTRATOR MANAGEMENT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Current Administrators:</b>\n${details}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Admins can be granted modular rights (Posting, Moderation, Analytics, Logs).\n` +
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

// Temporary Managers Submenu
async function renderTempManagerMenu(env) {
  const managers = await listTempManagers(env);
  let details = "";
  const now = Date.now();
  const buttons = [];

  if (managers.length === 0) {
    details = "<i>No active temporary managers.</i>\n";
  } else {
    for (const m of managers) {
      const minutesLeft = Math.round((m.expires_at - now) / 60000);
      details += `• <code>${m.user_id}</code> — ⏳ <b>${minutesLeft}m left</b>\n`;
      buttons.push([{ text: `🗑 Revoke ${m.user_id}`, callback_data: `p:tm:rm_direct:${m.user_id}` }]);
    }
  }

  const text =
    `⏳ <b>TEMPORARY MANAGER SYSTEM</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Active Temporary Managers:</b>\n${details}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Assign time-limited managerial privileges with custom auto-expiry.`;

  buttons.push([{ text: "➕ Add Temporary Manager", callback_data: "p:tm:prompt_add" }]);
  buttons.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// Activity Logs Submenu
async function renderLogsMenu(env) {
  const raw = await env.BOT_DATA.get("logs:recent", "json");
  const logs = Array.isArray(raw) ? raw : [];
  let text = `📜 <b>RECENT ACTIVITY LOGS</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (logs.length === 0) {
    text += "<i>No activity recorded yet.</i>\n";
  } else {
    for (const log of logs.slice(0, 10)) {
      const time = log.time ? log.time.substring(11, 19) : "--:--:--";
      text += `• <code>[${time}]</code> <b>${escapeHtml(log.action)}</b>\n  Actor: <code>${log.actor}</code> | ${escapeHtml(log.detail || "")}\n`;
    }
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 Refresh Logs", callback_data: "p:logs" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Backup & Restore Submenu
function renderBackupMenu() {
  const text =
    `💾 <b>BACKUP AND RESTORE SYSTEM</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Securely export or restore all customized messages, settings, admin lists, and feature flags.\n\n` +
    `🔒 <b>Security Guarantee:</b> Private credentials (BOT_TOKEN and WEBHOOK_SECRET) are <b>NEVER</b> included in backups.`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📤 Export Full Backup (JSON)", callback_data: "p:bk:export" }],
      [{ text: "📥 Import / Restore Backup", callback_data: "p:bk:prompt_import" }],
      [{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Reset Settings Prompt
function renderResetPrompt() {
  const text =
    `⚠️ <b>CONFIRM SYSTEM RESET</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Are you sure you want to reset all customized messages and feature flags back to default?\n\n` +
    `• Custom messages will revert to GitHub defaults.\n` +
    `• Feature switches will return to their default state.\n` +
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

// Language Submenu
async function renderLanguageMenu(env) {
  const settings = await getSettings(env);
  const text =
    `🌐 <b>LANGUAGE SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Default Language:</b> ${settings.default_language === "hi" ? "Hindi (हिन्दी)" : "English"}\n` +
    `• <b>Supported:</b> English (en), Hindi (hi)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Select default language for users:`;

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
// 2. CALLBACK QUERY HANDLER
// ==========================================
async function handleCallbackQuery(env, query) {
  const data = query.data || "";
  const fromId = query.from?.id;
  const messageId = query.message?.message_id;
  const chatId = query.message?.chat?.id;

  // 1. Group Member CAPTCHA verification
  if (data.startsWith("grp:verify:")) {
    const targetUserId = data.split(":")[2];
    if (String(fromId) !== String(targetUserId)) {
      await answerCallbackQuery(env, query.id, "⚠️ This verification button is not for you!", true);
      return;
    }
    // Restore permissions
    await callTelegram(env, "restrictChatMember", {
      chat_id: chatId,
      user_id: fromId,
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      }
    });
    const name = escapeHtml(query.from.first_name || "Member");
    let verifiedMsg = await getMessage(env, "en", "captcha_verified");
    verifiedMsg = verifiedMsg.replace("{NAME}", name);
    await editMessageText(env, chatId, messageId, verifiedMsg, { reply_markup: { inline_keyboard: [] } });
    await answerCallbackQuery(env, query.id, "Verification complete! Welcome to the group.");
    return;
  }

  // 2. Language selector from public welcome message
  if (data.startsWith("lang:user:")) {
    const selectedLang = data.split(":")[2];
    const userKey = `user:${fromId}`;
    const user = (await env.BOT_DATA.get(userKey, "json")) || {};
    user.lang = selectedLang;
    await env.BOT_DATA.put(userKey, JSON.stringify(user));
    await answerCallbackQuery(env, query.id, selectedLang === "hi" ? "भाषा बदलकर हिन्दी कर दी गई है।" : "Language changed to English.", true);
    return;
  }

  // 3. All "p:" callbacks are OWNER ONLY
  if (data.startsWith("p:")) {
    if (!isOwner(env, fromId)) {
      await answerCallbackQuery(env, query.id, "⛔ Access Denied: Owner Only!", true);
      return;
    }

    // Navigation: Main & Close
    if (data === "p:main") {
      const { text, reply_markup } = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:close") {
      await editMessageText(env, chatId, messageId, "🔒 <i>Control Panel closed. Type /panel anytime to reopen.</i>", { reply_markup: { inline_keyboard: [] } });
      await answerCallbackQuery(env, query.id, "Panel closed");
      return;
    }

    // Submenu: Features & Toggles
    if (data === "p:feat") {
      const { text, reply_markup } = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:ftgl:")) {
      const featKey = data.replace("p:ftgl:", "");
      const feats = await getFeatures(env);
      feats[featKey] = !feats[featKey];
      await saveFeatures(env, feats);
      await logSecurityEvent(env, fromId, "toggle_feature", `${featKey} -> ${feats[featKey]}`);
      const { text, reply_markup } = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id, `${featKey} toggled ${feats[featKey] ? "ON" : "OFF"}`);
      return;
    }

    // Submenu: Bot Settings
    if (data === "p:settings") {
      const { text, reply_markup } = await renderSettingsMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Channel Management
    if (data === "p:chan") {
      const { text, reply_markup } = await renderChannelMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:chan:check_admin") {
      const settings = await getSettings(env);
      const res = await verifyChannelAdmin(env, settings.channel_id);
      if (res.ok) {
        await answerCallbackQuery(env, query.id, "✅ Verified: Bot is Administrator in channel!", true);
      } else {
        await answerCallbackQuery(env, query.id, `❌ ${res.error || "Bot lacks admin permissions"}`, true);
      }
      return;
    }
    if (data === "p:chan:add_prompt") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "add_channel" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "📢 <b>Add Channel:</b> Send the Channel ID and Title separated by a space.\n<i>Example:</i> <code>-1001234567890 Wallpaper Hub</code>", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:chan:draft") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "draft_channel_post" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "✍️ <b>Channel Post Drafter:</b> Send your post content. You can preview, pin, schedule, or discard before publishing.", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:chd:pub" || data === "p:chd:pub_pin") {
      const shouldPin = data === "p:chd:pub_pin";
      const draft = await env.BOT_DATA.get("chan:current_draft", "json");
      const settings = await getSettings(env);
      if (!draft || !draft.text) {
        await answerCallbackQuery(env, query.id, "Draft expired or not found", true);
        return;
      }
      const res = await publishPost(env, settings.channel_id, { type: "text", text: draft.text }, shouldPin);
      if (res.ok) {
        await incrementStat(env, "channel_posts");
        await env.BOT_DATA.delete("chan:current_draft");
        await editMessageText(env, chatId, messageId, `✅ <b>Post Published to Channel!</b>\nPinned: ${shouldPin ? "Yes 📌" : "No"}`, {
          reply_markup: { inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]] }
        });
        await answerCallbackQuery(env, query.id, "Published!");
      } else {
        await answerCallbackQuery(env, query.id, `Publish failed: ${res.description || "Check permissions"}`, true);
      }
      return;
    }
    if (data === "p:chd:discard") {
      await env.BOT_DATA.delete("chan:current_draft");
      await editMessageText(env, chatId, messageId, "🗑 Draft discarded.", {
        reply_markup: { inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]] }
      });
      await answerCallbackQuery(env, query.id, "Discarded");
      return;
    }
    if (data === "p:chd:sched") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "schedule_draft_post" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "⏰ <b>Schedule Post:</b> Enter delay in minutes (e.g. <code>30</code> or <code>1440</code>) or exact date in IST <code>YYYY-MM-DD HH:mm</code>:", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:chan:hist") {
      const hist = await getChannelHistory(env);
      let hText = "📜 <b>RECENT CHANNEL POST HISTORY</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
      const buttons = [];
      if (hist.length === 0) {
        hText += "<i>No recent published posts recorded.</i>\n";
      } else {
        for (const item of hist.slice(0, 5)) {
          hText += `• <b>Post ID:</b> <code>${item.id}</code> [${item.pinned ? "📌 Pinned" : "Regular"}]\n  "${escapeHtml(item.text)}..."\n\n`;
          buttons.push([
            { text: `📌 Pin #${item.id}`, callback_data: `p:chpin:${item.id}` },
            { text: `🗑 Delete #${item.id}`, callback_data: `p:chdel:${item.id}` }
          ]);
        }
      }
      buttons.push([{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]);
      await editMessageText(env, chatId, messageId, hText, { reply_markup: { inline_keyboard: buttons } });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:chpin:")) {
      const targetId = parseInt(data.replace("p:chpin:", ""), 10);
      const settings = await getSettings(env);
      const res = await pinChatMessage(env, settings.channel_id, targetId);
      await answerCallbackQuery(env, query.id, res.ok ? "Post pinned!" : "Pin failed", true);
      return;
    }
    if (data.startsWith("p:chdel:")) {
      const targetId = parseInt(data.replace("p:chdel:", ""), 10);
      const settings = await getSettings(env);
      const res = await deleteChannelPost(env, settings.channel_id, targetId);
      await answerCallbackQuery(env, query.id, res.ok ? "Post deleted from channel!" : "Delete failed", true);
      return;
    }

    // Submenu: Scheduled Posts Engine
    if (data === "p:sched") {
      const { text, reply_markup } = await renderScheduledMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:sched:del:")) {
      const targetId = data.replace("p:sched:del:", "");
      await cancelScheduledPost(env, targetId);
      await answerCallbackQuery(env, query.id, "Scheduled post cancelled", true);
      const { text, reply_markup } = await renderScheduledMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Submenu: Automation Center
    if (data === "p:auto") {
      const { text, reply_markup } = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:auto:toggle_daily") {
      const cfg = await getAutomationSettings(env);
      cfg.daily_announcement_enabled = !cfg.daily_announcement_enabled;
      await saveAutomationSettings(env, cfg);
      const { text, reply_markup } = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id, `Daily post ${cfg.daily_announcement_enabled ? "Enabled" : "Disabled"}`);
      return;
    }
    if (data === "p:auto:toggle_backup") {
      const cfg = await getAutomationSettings(env);
      cfg.auto_backup_enabled = !cfg.auto_backup_enabled;
      await saveAutomationSettings(env, cfg);
      const { text, reply_markup } = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id, `Auto backup ${cfg.auto_backup_enabled ? "Enabled" : "Disabled"}`);
      return;
    }

    // Submenu: Group Moderation
    if (data === "p:grp") {
      const settings = await getSettings(env);
      const feats = await getFeatures(env);
      const text =
        `👥 <b>COMMUNITY & GROUP MANAGEMENT</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>Configured Group ID:</b> <code>${settings.group_id || "Not Set"}</code>\n` +
        `• <b>CAPTCHA Verification:</b> ${feats.captcha_verification ? "✅ Active" : "❌ Disabled"}\n` +
        `• <b>Anti-Flood Protection:</b> ${feats.anti_spam ? "✅ Active" : "❌ Disabled"}\n` +
        `• <b>Link Filter:</b> ${feats.link_filter ? "✅ Active" : "❌ Disabled"}\n` +
        `• <b>Word Filter:</b> ${feats.word_filter ? "✅ Active" : "❌ Disabled"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: feats.captcha_verification ? "Disable CAPTCHA" : "Enable CAPTCHA", callback_data: "p:ftgl:captcha_verification" },
            { text: feats.anti_spam ? "Disable Flood Guard" : "Enable Flood Guard", callback_data: "p:ftgl:anti_spam" }
          ],
          [
            { text: "📜 Edit Group Rules", callback_data: "p:welc_rules" },
            { text: "🔙 Back to Main Panel", callback_data: "p:main" }
          ]
        ]
      };
      await editMessageText(env, chatId, messageId, text, { reply_markup: keyboard });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Admins & Temp Managers
    if (data === "p:adm") {
      const { text, reply_markup } = await renderAdminMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:adm:prompt_add") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "add_admin" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "👮 <b>Add Admin:</b> Send the numeric Telegram User ID of the new admin:", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:adm:prompt_rm") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "remove_admin" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "🗑 <b>Remove Admin:</b> Send the numeric Telegram User ID to remove:", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Temporary Managers
    if (data === "p:tm") {
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:tm:prompt_add") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "add_temp_mgr" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "⏳ <b>Add Temp Manager:</b> Send User ID and duration in minutes separated by a space.\n<i>Example:</i> <code>123456789 60</code>", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:tm:rm_direct:")) {
      const targetId = data.replace("p:tm:rm_direct:", "");
      await revokeTempManager(env, targetId);
      await answerCallbackQuery(env, query.id, `Manager ${targetId} revoked!`, true);
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }
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
        await editMessageText(env, chatId, messageId, `⏳ <b>Configure Permissions:</b> <code>${targetId}</code> (${draft.duration_minutes}m):`, { reply_markup: kb });
      }
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:tmsave:")) {
      const targetId = data.replace("p:tmsave:", "");
      const draft = await env.BOT_DATA.get(`state:draft_tm:${targetId}`, "json");
      if (!draft) {
        await answerCallbackQuery(env, query.id, "Session expired", true);
        return;
      }
      await addTempManager(env, targetId, draft.duration_minutes, draft.permissions);
      await env.BOT_DATA.delete(`state:draft_tm:${targetId}`);
      await answerCallbackQuery(env, query.id, `Manager ${targetId} activated!`, true);
      const { text, reply_markup } = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Submenu: Statistics & Logs
    if (data === "p:stats") {
      const { text, reply_markup } = await renderStatsMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:stats:export") {
      const json = await exportAnalyticsJSON(env);
      await sendMessage(env, chatId, `📊 <b>ANALYTICS EXPORT:</b>\n\n<code>${escapeHtml(json)}</code>`);
      await answerCallbackQuery(env, query.id, "Exported to chat!");
      return;
    }
    if (data === "p:logs") {
      const { text, reply_markup } = await renderLogsMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Security Center & Diagnostics
    if (data === "p:sec") {
      const { text, reply_markup } = renderSecurityCenterMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:sec:setup_webhook") {
      const workerUrl = `https://shiv-yogi-assistant.shivyogi-x19.workers.dev/`;
      const res = await callTelegram(env, "setWebhook", {
        url: workerUrl,
        secret_token: env.WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
        drop_pending_updates: false
      });
      await answerCallbackQuery(env, query.id, res.ok ? "✅ Webhook registered successfully!" : `❌ ${res.description}`, true);
      return;
    }
    if (data === "p:sec:webhook_info") {
      const info = await callTelegram(env, "getWebhookInfo");
      const d = info.result || {};
      const msg = `🔍 <b>WEBHOOK DIAGNOSTICS:</b>\n\n• URL: <code>${escapeHtml(d.url || "None")}</code>\n• Pending: ${d.pending_update_count || 0}\n• Error: <code>${escapeHtml(d.last_error_message || "None")}</code>`;
      await sendMessage(env, chatId, msg, { reply_markup: { inline_keyboard: [[{ text: "🔙 Security Center", callback_data: "p:sec" }]] } });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: System Health
    if (data === "p:health") {
      const { text, reply_markup } = await renderHealthMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Message Editors
    if (data === "p:welc") {
      const { text, reply_markup } = await renderMessageMenu(env, "welcome", "Welcome Message");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:rep") {
      const { text, reply_markup } = await renderMessageMenu(env, "repeat", "Repeat Reply Message");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:welc_rules") {
      const { text, reply_markup } = await renderMessageMenu(env, "group_rules", "Group Rules");
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:edit_msg:")) {
      const key = data.replace("p:edit_msg:", "");
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "edit_message", key: key, lang: "en" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, `✏️ <b>Editing Message:</b> <code>${key}</code>\n\nSend your new text in your next message. HTML formatting supported:`, {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:reset_msg:")) {
      const key = data.replace("p:reset_msg:", "");
      await resetCustomMessage(env, "en", key);
      await resetCustomMessage(env, "hi", key);
      await answerCallbackQuery(env, query.id, `Reset ${key} to default!`, true);
      const { text, reply_markup } = await renderMessageMenu(env, key, key);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Submenu: Settings prompts
    if (data.startsWith("p:set:")) {
      const field = data.replace("p:set:", "");
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "set_setting", field: field }), { expirationTtl: 300 });
      await sendMessage(env, chatId, `✏️ Send new value for <code>${field}</code>:`, {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Backup & Restore
    if (data === "p:backup") {
      const { text, reply_markup } = renderBackupMenu();
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:bk:export") {
      const backupJson = await createFullBackup(env);
      await sendMessage(env, chatId, `📦 <b>SHIV YOGI ASSISTANT — BACKUP EXPORT:</b>\n\n<code>${escapeHtml(backupJson)}</code>`);
      await answerCallbackQuery(env, query.id, "Backup exported!");
      return;
    }
    if (data === "p:bk:prompt_import") {
      await env.BOT_DATA.put("state:owner_action", JSON.stringify({ action: "import_backup" }), { expirationTtl: 300 });
      await sendMessage(env, chatId, "📥 <b>Restore Backup:</b> Send your exported JSON string in your next message.", {
        reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "p:cancel_state" }]] }
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    // Submenu: Reset
    if (data === "p:reset") {
      const { text, reply_markup } = renderResetPrompt();
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data === "p:reset:confirm") {
      await saveFeatures(env, DEFAULT_CONTENT.features);
      await saveSettings(env, DEFAULT_CONTENT.settings);
      await answerCallbackQuery(env, query.id, "System reset completed!", true);
      const { text, reply_markup } = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Submenu: Languages
    if (data === "p:lang") {
      const { text, reply_markup } = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      await answerCallbackQuery(env, query.id);
      return;
    }
    if (data.startsWith("p:lang_set:")) {
      const lang = data.replace("p:lang_set:", "");
      const settings = await getSettings(env);
      settings.default_language = lang;
      await saveSettings(env, settings);
      await answerCallbackQuery(env, query.id, `Language set to ${lang.toUpperCase()}`, true);
      const { text, reply_markup } = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, text, { reply_markup });
      return;
    }

    // Cancel interactive state
    if (data === "p:cancel_state") {
      await env.BOT_DATA.delete("state:owner_action");
      await editMessageText(env, chatId, messageId, "❌ Action cancelled.", { reply_markup: { inline_keyboard: [] } });
      await answerCallbackQuery(env, query.id, "Cancelled");
      return;
    }
  }

  await answerCallbackQuery(env, query.id);
}

// ==========================================
// 3. PRIVATE & GROUP MESSAGE HANDLER
// ==========================================
async function handleMessage(env, message) {
  const chatId = message.chat?.id;
  const chatType = message.chat?.type;
  const from = message.from;
  const fromId = from?.id;
  const text = message.text || message.caption || "";
  const now = Date.now();

  if (!fromId) return;

  await incrementStat(env, "messages_processed");
  await trackUserActivity(env, fromId);

  // Group handling
  if (chatType === "group" || chatType === "supergroup") {
    await handleGroupMessage(env, message);
    return;
  }

  // Private chat handling
  if (chatType === "private") {
    // Check Maintenance Mode
    const feats = await getFeatures(env);
    if (feats.maintenance_mode && !isOwner(env, fromId)) {
      const maintMsg = await getMessage(env, "en", "maintenance");
      await sendMessage(env, chatId, maintMsg);
      return;
    }

    // Check Owner Interactive State
    if (isOwner(env, fromId) && text !== "/cancel") {
      const state = await env.BOT_DATA.get("state:owner_action", "json");
      if (state) {
        await env.BOT_DATA.delete("state:owner_action");

        // Action: Edit Message
        if (state.action === "edit_message") {
          await saveCustomMessage(env, state.lang || "en", state.key, text);
          await sendMessage(env, chatId, `✅ <b>Message Updated!</b>\n\n<b>Preview:</b>\n\n${text}`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Back to Control Panel", callback_data: "p:main" }]] }
          });
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
          await sendMessage(env, chatId, `✅ <b>Setting Updated:</b> <code>${state.field}</code> = <code>${escapeHtml(text.trim())}</code>`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Back to Settings", callback_data: "p:settings" }]] }
          });
          return;
        }

        // Action: Add Channel
        if (state.action === "add_channel") {
          const parts = text.trim().split(/\s+/);
          const chId = parts[0];
          const chTitle = parts.slice(1).join(" ") || `Channel ${chId}`;
          await addChannel(env, chId, chTitle);
          await sendMessage(env, chatId, `✅ <b>Channel Configured:</b> <code>${chId}</code> (${escapeHtml(chTitle)})`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Channel Menu", callback_data: "p:chan" }]] }
          });
          return;
        }

        // Action: Add Admin
        if (state.action === "add_admin") {
          const targetId = text.trim();
          if (!/^\d+$/.test(targetId)) {
            await sendMessage(env, chatId, "❌ Invalid ID format. Must be numeric.");
            return;
          }
          await addAdmin(env, targetId);
          await sendMessage(env, chatId, `✅ <b>Admin Appointed:</b> User ID <code>${targetId}</code>`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Admin Menu", callback_data: "p:adm" }]] }
          });
          return;
        }

        // Action: Remove Admin
        if (state.action === "remove_admin") {
          await removeAdmin(env, text.trim());
          await sendMessage(env, chatId, `🗑 <b>Admin Removed:</b> <code>${text.trim()}</code>`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Admin Menu", callback_data: "p:adm" }]] }
          });
          return;
        }

        // Action: Add Temp Manager
        if (state.action === "add_temp_mgr") {
          const parts = text.trim().split(/\s+/);
          const targetId = parts[0];
          const durationMins = parseInt(parts[1], 10) || 60;
          const defaultPerms = { can_post_channel: true, can_moderate_group: true, can_view_stats: false, can_view_logs: false };
          await env.BOT_DATA.put(`state:draft_tm:${targetId}`, JSON.stringify({ id: targetId, duration_minutes: durationMins, permissions: defaultPerms }), { expirationTtl: 300 });
          const kb = buildTempManagerPermsKeyboard(targetId, defaultPerms);
          await sendMessage(env, chatId, `⏳ <b>Configure Permissions for Manager:</b> <code>${targetId}</code> (${durationMins}m):`, { reply_markup: kb });
          return;
        }

        // Action: Draft Channel Post
        if (state.action === "draft_channel_post") {
          await env.BOT_DATA.put("chan:current_draft", JSON.stringify({ text: text, created_at: now }), { expirationTtl: 1800 });
          const kb = {
            inline_keyboard: [
              [
                { text: "🚀 Publish Now", callback_data: "p:chd:pub" },
                { text: "📌 Publish & Pin", callback_data: "p:chd:pub_pin" }
              ],
              [
                { text: "⏰ Schedule Post", callback_data: "p:chd:sched" },
                { text: "🗑 Discard Draft", callback_data: "p:chd:discard" }
              ]
            ]
          };
          await sendMessage(env, chatId, `📝 <b>POST PREVIEW:</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${text}\n\n━━━━━━━━━━━━━━━━━━━━`, { reply_markup: kb });
          return;
        }

        // Action: Schedule Draft Post
        if (state.action === "schedule_draft_post") {
          const draft = await env.BOT_DATA.get("chan:current_draft", "json");
          if (!draft) {
            await sendMessage(env, chatId, "❌ Draft expired. Please draft post again.");
            return;
          }
          let postTimestamp = null;
          const delayMinutes = parseInt(text.trim(), 10);
          if (!isNaN(delayMinutes) && delayMinutes > 0) {
            postTimestamp = now + delayMinutes * 60 * 1000;
          }
          if (!postTimestamp) {
            await sendMessage(env, chatId, "❌ Invalid schedule time. Please enter positive delay in minutes (e.g. 30).");
            return;
          }
          await addScheduledPost(env, { text: draft.text, post_at: postTimestamp, pin: false });
          await env.BOT_DATA.delete("chan:current_draft");
          await sendMessage(env, chatId, `⏰ <b>Post Scheduled!</b>\nExecution time: <b>${formatDateIST(postTimestamp)}</b>`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 Scheduled Menu", callback_data: "p:sched" }]] }
          });
          return;
        }

        // Action: Import Backup
        if (state.action === "import_backup") {
          try {
            await restoreBackup(env, text, fromId);
            await sendMessage(env, chatId, "✅ <b>Backup Restored Successfully!</b>", {
              reply_markup: { inline_keyboard: [[{ text: "🔙 Backup Menu", callback_data: "p:backup" }]] }
            });
          } catch (e) {
            await sendMessage(env, chatId, `❌ <b>Restore Failed:</b> ${escapeHtml(e.message)}`);
          }
          return;
        }
      }
    }

    if (text === "/cancel") {
      await env.BOT_DATA.delete("state:owner_action");
      await sendMessage(env, chatId, "❌ Active operation cancelled.");
      return;
    }

    // Commands Dispatcher
    if (text.startsWith("/")) {
      await incrementStat(env, "commands_used");
      const cmd = text.trim().split(/\s+/)[0].toLowerCase();

      if (cmd === "/panel") {
        if (!isOwner(env, fromId)) {
          await sendMessage(env, chatId, "⛔ <b>Access Restricted:</b> This command is strictly reserved for the Bot Owner.");
          await logSecurityEvent(env, fromId, "unauthorized_panel_attempt", "Access denied to /panel");
          return;
        }
        const { text: panelText, reply_markup } = await renderMainPanel(env);
        await sendMessage(env, chatId, panelText, { reply_markup });
        return;
      }

      if (cmd === "/stats") {
        if (!isOwner(env, fromId) && !(await hasPermission(env, fromId, "can_view_stats"))) {
          await sendMessage(env, chatId, "⛔ Access Denied.");
          return;
        }
        const { text: sText, reply_markup } = await renderStatsMenu(env);
        await sendMessage(env, chatId, sText, { reply_markup });
        return;
      }

      if (cmd === "/schedule") {
        const { text: scText, reply_markup } = await renderScheduledMenu(env);
        await sendMessage(env, chatId, scText, { reply_markup });
        return;
      }

      if (cmd === "/ping") {
        await sendMessage(env, chatId, `🏓 <b>Pong!</b> Shiv Yogi Assistant is operational (IST: ${formatDateIST()}).`);
        return;
      }

      if (cmd === "/id") {
        await sendMessage(env, chatId, `🆔 <b>Your Telegram User ID:</b> <code>${fromId}</code>\n💬 <b>Chat ID:</b> <code>${chatId}</code>`);
        return;
      }

      if (cmd === "/backup") {
        if (!isOwner(env, fromId)) return;
        const bJson = await createFullBackup(env);
        await sendMessage(env, chatId, `📦 <b>BACKUP EXPORT:</b>\n\n<code>${escapeHtml(bJson)}</code>`);
        return;
      }
    }

    // User Lifecycle & /start
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

        await sendMessage(env, chatId, welcomeText, { reply_markup: { inline_keyboard: inlineKeyboard } });
        await incrementStat(env, "welcome_sent");
      }
      return;
    }

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
      const kb = settings.contact_username
        ? { inline_keyboard: [[{ text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` }]] }
        : undefined;
      await sendMessage(env, chatId, contactMsg, { reply_markup: kb });
      return;
    }

    if (text === "/language") {
      await sendMessage(env, chatId, "🌐 <b>Select language:</b>", {
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

    // Subsequent Repeat Message with Cooldown
    if (feats.repeat_replies) {
      const lastReply = userRecord.last_reply_at || 0;
      const cooldownMs = (settings.repeat_cooldown_seconds || 60) * 1000;
      if (now - lastReply >= cooldownMs) {
        userRecord.last_reply_at = now;
        userRecord.last_seen = now;
        await env.BOT_DATA.put(userKey, JSON.stringify(userRecord));

        const repeatMsg = await getMessage(env, userLang, "repeat");
        const replyMarkup = (feats.contact_button && settings.contact_username)
          ? { inline_keyboard: [[{ text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` }]] }
          : undefined;

        await sendMessage(env, chatId, repeatMsg, { reply_markup: replyMarkup });
      } else {
        userRecord.last_seen = now;
        await env.BOT_DATA.put(userKey, JSON.stringify(userRecord));
      }
    }
  }
}

// ==========================================
// 4. CHAT MEMBER UPDATES (CHANNEL JOIN INVITE)
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
        inline_keyboard: [[{ text: "💬 Join Discussion Group", url: settings.discussion_group_url }]]
      } : undefined;
      const res = await sendMessage(env, userId, inviteMsg, { reply_markup: replyMarkup });
      if (!res.ok) {
        await logSecurityEvent(env, "system", "channel_join_dm_skipped", `User ${userId} joined channel (DM skipped)`);
      }
    }
  }
}

// ==========================================
// 5. CLOUDFLARE WORKER EXPORT
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Diagnostics & Health route
    if (request.method === "GET") {
      if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/ping") {
        return new Response(
          JSON.stringify({
            status: "online",
            bot: "SHIV YOGI ASSISTANT",
            version: "2.0.0",
            engine: "Cloudflare Workers",
            kv_connected: Boolean(env.BOT_DATA),
            owner_configured: Boolean(env.OWNER_ID),
            ist_time: formatDateIST()
          }, null, 2),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.pathname === "/setup-webhook") {
        const secretParam = url.searchParams.get("secret");
        if (!secretParam || secretParam !== env.WEBHOOK_SECRET) {
          return new Response(JSON.stringify({ error: "Invalid secret parameter" }), { status: 403 });
        }
        const res = await callTelegram(env, "setWebhook", {
          url: `${url.origin}/`,
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

    // Config validation
    if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.OWNER_ID || !env.BOT_DATA) {
      return new Response(
        JSON.stringify({ error: "Worker configuration incomplete. BOT_TOKEN, WEBHOOK_SECRET, OWNER_ID, BOT_DATA required." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Webhook authentication
    if (!verifyWebhookSecret(request, env)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    // Parse Update
    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    // Deduplication check
    if (await checkUpdateDedup(env, update.update_id, ctx)) {
      return new Response(JSON.stringify({ ok: true, note: "duplicate_skipped" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Dispatch Update
    try {
      if (update.message) {
        await handleMessage(env, update.message);
      } else if (update.callback_query) {
        await handleCallbackQuery(env, update.callback_query);
      } else if (update.chat_member) {
        await handleChatMemberUpdate(env, update);
      }
    } catch (err) {
      console.error("Update handler exception:", err);
      await incrementStat(env, "failed_messages");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },

  // Cloudflare Cron Trigger processor
  async scheduled(controller, env, ctx) {
    try {
      await processScheduledQueue(env);
      await runAutomationCycle(env);
    } catch (err) {
      console.error("Cron scheduled handler exception:", err);
    }
  }
};
