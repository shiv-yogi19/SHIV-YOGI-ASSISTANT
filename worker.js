/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * Complete Production-Ready Rebuild
 * Cloudflare Workers (ES Modules) + Cloudflare KV + Telegram Bot API
 *
 * Engine:
 *  - modules/helpers.js
 *  - modules/security.js
 *  - modules/settings.js
 *  - modules/channel-manager.js
 *  - modules/scheduled-posts.js
 *  - modules/group-manager.js
 *  - modules/moderation.js
 *  - modules/reports.js
 *  - modules/member-manager.js
 *  - modules/admin-manager.js
 *  - modules/automation.js
 *  - modules/statistics.js
 *  - modules/notifications.js
 *  - modules/templates.js
 *  - modules/backup.js
 *  - modules/health.js
 *  - modules/localization.js
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
  sendPhoto,
  sendVideo,
  sendDocument,
  getMe,
  getWebhookInfo,
  setWebhook,
  getUserState,
  setUserState,
  clearUserState,
  getActivityLogs,
  escapeHtml,
  formatDateIST,
  parseDateIST,
  safeKvGet,
  safeKvPut,
  safeKvDelete
} from "./modules/helpers.js";

import {
  isOwner,
  getAdmin,
  getTempManager,
  hasPermission,
  verifyWebhookSecret,
  checkUpdateDedup,
  logSecurityEvent,
  getSecurityLogs,
  detectSuspiciousCallback,
  getSecurityDiagnostics
} from "./modules/security.js";

import {
  getSettings,
  saveSettings,
  updateSetting,
  getFeatures,
  saveFeatures,
  toggleFeature,
  resetAllSettings
} from "./modules/settings.js";

import {
  getMessage,
  saveCustomMessage,
  resetCustomMessage,
  getButtons,
  getUserLanguage,
  setUserLanguage,
  validateSafeHtml
} from "./modules/localization.js";

import {
  getChannelsList,
  addChannel,
  removeChannel,
  setPrimaryChannel,
  verifyChannelAdmin,
  publishPost,
  broadcastToAllChannels,
  getChannelHistory,
  deleteChannelPost
} from "./modules/channel-manager.js";

import {
  getScheduledList,
  addScheduledPost,
  cancelScheduledPost,
  deleteScheduledPost,
  retryFailedScheduledPost,
  getScheduledPostsByStatus,
  processScheduledQueue
} from "./modules/scheduled-posts.js";

import {
  handleGroupMessage,
  handleCaptchaVerification
} from "./modules/group-manager.js";

import {
  warnUser,
  muteUser,
  unmuteUser,
  banUser,
  unbanUser,
  getUserWarnings,
  resetWarnings,
  isTrustedUser,
  addTrustedUser,
  removeTrustedUser,
  listTrustedUsers,
  isBlacklistedUser,
  addBlacklistedUser,
  removeBlacklistedUser,
  listBlacklistedUsers,
  getModerationProfile,
  getModerationHistory
} from "./modules/moderation.js";

import {
  submitReport,
  getReport,
  getReportsList,
  updateReportStatus,
  addReportNote
} from "./modules/reports.js";

import {
  registerOrUpdateMember,
  getMember,
  getMemberFullProfile,
  searchMember,
  listMembers
} from "./modules/member-manager.js";

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
  getDailyStats,
  exportAnalyticsJSON
} from "./modules/statistics.js";

import {
  getNotificationSettings,
  saveNotificationSettings,
  toggleNotification,
  sendNotification
} from "./modules/notifications.js";

import {
  getTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
  renderTemplate
} from "./modules/templates.js";

import {
  createFullBackup,
  restoreBackup,
  getBackupHistory
} from "./modules/backup.js";

import {
  runHealthCheck,
  formatHealthHTML
} from "./modules/health.js";

// ==========================================
// 1. OWNER CONTROL PANEL INTERFACE & MENUS
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
        { text: "👋 Welcome Editor", callback_data: "p:welc" },
        { text: "🔁 Repeat Editor", callback_data: "p:rep" }
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
        { text: "🔔 Notifications", callback_data: "p:notif" }
      ],
      [
        { text: "📝 Template Library", callback_data: "p:tpls" },
        { text: "🚨 Reports Center", callback_data: "p:reports" }
      ],
      [
        { text: "👤 Member Manager", callback_data: "p:members" },
        { text: "⚖️ Moderation Center", callback_data: "p:mod" }
      ],
      [
        { text: "💾 Backup & Restore", callback_data: "p:backup" },
        { text: "🔄 Reset Defaults", callback_data: "p:reset" }
      ],
      [
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
    `👑 <b>SHIV YOGI ASSISTANT — ADVANCED CONTROL PANEL (v3.0.0)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Owner ID:</b> <code>${env.OWNER_ID}</code>\n` +
    `📢 <b>Configured Channels:</b> ${channels.length}\n` +
    `🎛 <b>Active Features:</b> ${activeFeatCount}/${totalFeats}\n` +
    `👥 <b>Total Registered:</b> ${stats.total_users} | <b>Est. DAU:</b> ${activeMetrics.dau_estimate}\n` +
    `✉️ <b>Messages:</b> ${stats.messages_processed} | <b>Commands:</b> ${stats.commands_used}\n` +
    `📢 <b>Posts Published:</b> ${stats.channel_posts}\n` +
    `🕒 <b>Timezone:</b> Asia/Kolkata (IST)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Select an administrative module below to manage your bot:</i>`;

  return { text, reply_markup: buildMainPanelKeyboard() };
}

// 1. Submenu: Bot Settings
async function renderSettingsMenu(env) {
  const settings = await getSettings(env);
  const text =
    `⚙️ <b>BOT GENERAL SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Owner Name:</b> ${escapeHtml(settings.owner_name)}\n` +
    `• <b>Contact Username:</b> @${escapeHtml(settings.contact_username)}\n` +
    `• <b>Wallpaper Channel:</b> ${escapeHtml(settings.wallpaper_channel_url)}\n` +
    `• <b>Discussion Group:</b> ${escapeHtml(settings.discussion_group_url)}\n` +
    `• <b>Primary Channel ID:</b> <code>${escapeHtml(settings.channel_id || "Not Set")}</code>\n` +
    `• <b>Group ID:</b> <code>${escapeHtml(settings.group_id || "Not Set")}</code>\n` +
    `• <b>Repeat Cooldown:</b> ${settings.repeat_cooldown_seconds}s\n` +
    `• <b>Flood Threshold:</b> ${settings.anti_flood_threshold} msgs in ${settings.anti_flood_window_seconds}s\n` +
    `• <b>Warning Limit:</b> ${settings.warn_limit || 3} warnings\n` +
    `• <b>Timezone:</b> ${escapeHtml(settings.timezone)}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Tap an option to modify bot configuration:</i>`;

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

// 2. Submenu: Feature Controls
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
    `All toggles persist automatically to Cloudflare KV.`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// 3. Submenu: Channel Management
async function renderChannelMenu(env) {
  const channels = await getChannelsList(env);
  let text =
    `📢 <b>CHANNEL MANAGEMENT CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Configured Channels: <b>${channels.length}</b>\n\n`;

  if (channels.length === 0) {
    text += `<i>No channels configured yet. Tap "Add Channel" below.</i>\n`;
  } else {
    channels.forEach((c, i) => {
      text += `${i + 1}. <b>${escapeHtml(c.title)}</b> (${c.is_primary ? "⭐ Primary" : "Connected"})\n   ID: <code>${c.id}</code>\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Add Channel", callback_data: "p:chan:add_prompt" },
        { text: "📝 Draft Post", callback_data: "p:chan:draft" }
      ],
      [
        { text: "🔍 Audit Bot Permissions", callback_data: "p:chan:check_admin" },
        { text: "📜 Post History", callback_data: "p:chan:hist" }
      ],
      [
        { text: "📡 Broadcast to All", callback_data: "p:chan:broadcast_prompt" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 4. Submenu: Group Management
async function renderGroupMenu(env) {
  const feats = await getFeatures(env);
  const settings = await getSettings(env);
  const text =
    `👥 <b>COMMUNITY & GROUP MANAGEMENT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Configured Group ID:</b> <code>${settings.group_id || "Not Configured"}</code>\n` +
    `• <b>Discussion URL:</b> ${settings.discussion_group_url}\n` +
    `• <b>CAPTCHA Verification:</b> ${feats.captcha_verification ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Anti-Flood Protection:</b> ${feats.anti_spam ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Link Filter:</b> ${feats.link_filter ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Banned Word Filter:</b> ${feats.word_filter ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Bot Slow Mode:</b> ${settings.slow_mode_seconds > 0 ? settings.slow_mode_seconds + "s" : "Off"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${feats.captcha_verification ? "🛡 Disable" : "🛡 Enable"} CAPTCHA`, callback_data: "p:ftgl:captcha_verification" },
        { text: `${feats.anti_spam ? "🚫 Disable" : "🚫 Enable"} Anti-Spam`, callback_data: "p:ftgl:anti_spam" }
      ],
      [
        { text: "📜 View Group Rules", callback_data: "p:welc_rules" },
        { text: "⚖️ Moderation Center", callback_data: "p:mod" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 5. Submenu: Scheduled Posts
async function renderScheduledMenu(env, page = 1) {
  const { items, total, totalPages } = await getScheduledPostsByStatus(env, "all", page, 4);

  let text =
    `⏰ <b>SCHEDULED ANNOUNCEMENTS & POSTS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total In Queue: <b>${total}</b> (Page ${page}/${totalPages})\n\n`;

  if (items.length === 0) {
    text += `<i>No scheduled posts in queue. Draft a post from Channel Manager to schedule.</i>\n`;
  } else {
    items.forEach(p => {
      const statusIcon = p.status === "published" ? "✅" : p.status === "failed" ? "❌" : p.status === "cancelled" ? "🚫" : "⏳";
      text += `${statusIcon} <b>#${p.id}</b> [${p.status.toUpperCase()}]\n`;
      text += `📅 Time: <i>${p.post_at_ist || formatDateIST(p.post_at)}</i>\n`;
      text += `📝 Preview: <i>${escapeHtml(p.text.slice(0, 50))}...</i>\n`;
      if (p.last_error) text += `⚠️ Error: <code>${escapeHtml(p.last_error)}</code>\n`;
      text += `\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const actionButtons = [];
  // Add quick delete button for the first pending item if present
  const pendingItem = items.find(p => p.status === "pending");
  if (pendingItem) {
    actionButtons.push({ text: `🚫 Cancel #${pendingItem.id}`, callback_data: `p:sched:del:${pendingItem.id}` });
  }
  const failedItem = items.find(p => p.status === "failed");
  if (failedItem) {
    actionButtons.push({ text: `🔄 Retry #${failedItem.id}`, callback_data: `p:sched:retry:${failedItem.id}` });
  }

  const navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️ Prev", callback_data: `p:sched:p:${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: "Next ➡️", callback_data: `p:sched:p:${page + 1}` });
  }

  const keyboard = {
    inline_keyboard: [
      actionButtons.length > 0 ? actionButtons : [],
      navRow.length > 0 ? navRow : [],
      [
        { text: "📝 New Draft", callback_data: "p:chan:draft" },
        { text: "🔄 Refresh", callback_data: `p:sched:p:${page}` }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ].filter(r => r.length > 0)
  };

  return { text, reply_markup: keyboard };
}

// 6. Submenu: Automation Center
async function renderAutomationMenu(env) {
  const auto = await getAutomationSettings(env);
  const text =
    `🤖 <b>AUTOMATION CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Daily Post Drop:</b> ${auto.daily_announcement_enabled ? "✅ Active" : "❌ Disabled"}\n` +
    `• <b>Post Drop Time:</b> ${auto.daily_announcement_hour}:00 AM IST\n` +
    `• <b>Daily Template:</b> <code>${auto.daily_announcement_template}</code>\n` +
    `• <b>Automated Daily Backup:</b> ${auto.auto_backup_enabled ? "✅ Active" : "❌ Disabled"}\n` +
    `• <b>Manager Expiration Sweep:</b> Automatic on Cron\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Automated tasks execute on Cloudflare 1-minute Cron Triggers.</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${auto.daily_announcement_enabled ? "❌ Disable" : "✅ Enable"} Daily Post`, callback_data: "p:auto:toggle_daily" },
        { text: `${auto.auto_backup_enabled ? "❌ Disable" : "✅ Enable"} Auto Backup`, callback_data: "p:auto:toggle_backup" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 7. Submenu: Admin Control
async function renderAdminMenu(env) {
  const admins = await listAdmins(env);
  let text =
    `👮 <b>ADMINISTRATOR MANAGEMENT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Appointed Admins: <b>${admins.length}</b>\n\n`;

  if (admins.length === 0) {
    text += `<i>No additional administrators appointed. Bot Owner possesses master authorization.</i>\n`;
  } else {
    admins.forEach((a, i) => {
      text += `${i + 1}. User ID: <code>${a.user_id}</code>\n   Appointed: <i>${a.added_ist || formatDateIST(a.added_at)}</i>\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Add Admin", callback_data: "p:adm:prompt_add" },
        { text: "➖ Remove Admin", callback_data: "p:adm:prompt_rm" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 8. Submenu: Temporary Managers
async function renderTempManagerMenu(env) {
  const managers = await listTempManagers(env);
  let text =
    `⏳ <b>TEMPORARY MANAGERS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Active Managers: <b>${managers.length}</b>\n\n`;

  if (managers.length === 0) {
    text += `<i>No temporary managers active currently.</i>\n`;
  } else {
    managers.forEach((m, i) => {
      const remainingMins = Math.max(0, Math.round((m.expires_at - Date.now()) / 60000));
      text += `${i + 1}. ID: <code>${m.user_id}</code> (Expires in ~${remainingMins}m)\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const rows = [];
  if (managers.length > 0) {
    rows.push([{ text: `🚫 Revoke ${managers[0].user_id}`, callback_data: `p:tm:rm_direct:${managers[0].user_id}` }]);
  }
  rows.push([{ text: "➕ Appoint Temp Manager", callback_data: "p:tm:prompt_add" }]);
  rows.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  return { text, reply_markup: { inline_keyboard: rows } };
}

// 9. Submenu: Welcome Editor
async function renderWelcomeMenu(env) {
  const enMsg = await getMessage(env, "en", "welcome");
  const text =
    `👋 <b>WELCOME MESSAGE EDITOR</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Current English Welcome:</b>\n\n` +
    enMsg +
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✏️ Edit English Welcome", callback_data: "p:edit_msg:welcome" },
        { text: "🔄 Restore Default", callback_data: "p:reset_msg:welcome" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 10. Submenu: Repeat Message Editor
async function renderRepeatMenu(env) {
  const enMsg = await getMessage(env, "en", "repeat");
  const text =
    `🔁 <b>REPEAT MESSAGE EDITOR</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Current English Repeat Reply:</b>\n\n` +
    enMsg +
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✏️ Edit Repeat Message", callback_data: "p:edit_msg:repeat" },
        { text: "🔄 Restore Default", callback_data: "p:reset_msg:repeat" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 11. Submenu: Statistics & Analytics
async function renderStatsMenu(env) {
  const stats = await getStats(env);
  const activeMetrics = await getActiveUserMetrics(env);
  const todayStats = await getDailyStats(env);

  const text =
    `📊 <b>STATISTICS & ANALYTICS CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 <b>Total Users Indexed:</b> ${stats.total_users}\n` +
    `📈 <b>Estimated DAU (Today):</b> ${activeMetrics.dau_estimate}\n` +
    `✉️ <b>Messages Processed:</b> ${stats.messages_processed}\n` +
    `⌨️ <b>Commands Executed:</b> ${stats.commands_used}\n` +
    `👋 <b>Welcomes Delivered:</b> ${stats.welcome_sent}\n` +
    `📢 <b>Channel Posts Published:</b> ${stats.channel_posts}\n` +
    `⏰ <b>Scheduled Posts Completed:</b> ${stats.scheduled_completed}\n` +
    `🛡 <b>Moderation Actions:</b> ${stats.moderation_actions}\n` +
    `🚨 <b>User Reports Received:</b> ${stats.reports_received}\n` +
    `🤖 <b>CAPTCHA Solved:</b> ${stats.captcha_verifications}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 <i>Today's Counts (${todayStats.date}):</i>\n` +
    `Messages: ${todayStats.stats.messages_processed} | Posts: ${todayStats.stats.channel_posts}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔄 Refresh Metrics", callback_data: "p:stats" },
        { text: "📥 Export JSON", callback_data: "p:stats:export" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 12. Submenu: Activity Logs
async function renderLogsMenu(env) {
  const logs = await getActivityLogs(env, 6);
  let text =
    `📜 <b>RECENT BOT ACTIVITY LOGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (logs.length === 0) {
    text += `<i>No recent activity logged yet.</i>\n`;
  } else {
    logs.forEach(l => {
      text += `• <b>[${l.action}]</b> by <code>${l.actor}</code>\n  <i>${escapeHtml(l.detail)}</i>\n  ⏱ ${l.ist || l.time}\n\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔄 Refresh Logs", callback_data: "p:logs" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 13. Submenu: Security Center
async function renderSecurityMenu(env) {
  const diag = await getSecurityDiagnostics(env);
  const secLogs = await getSecurityLogs(env, 4);

  let text =
    `🛡 <b>SECURITY & WEBHOOK CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Bot Token:</b> ${diag.bot_token_configured ? "✅ Configured (Secret)" : "❌ Missing"}\n` +
    `• <b>Webhook Secret:</b> ${diag.webhook_secret_configured ? "✅ Active Token" : "⚠️ Not Set"}\n` +
    `• <b>Update Deduplication:</b> ✅ Active (120s TTL)\n` +
    `• <b>Owner Authorization:</b> ✅ Enforced (ID: <code>${env.OWNER_ID}</code>)\n` +
    `• <b>Credential Redaction:</b> ${diag.secret_exposure_protection}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Recent Security Events:</b>\n`;

  if (secLogs.length === 0) {
    text += `<i>No security incidents recorded. System secure.</i>\n`;
  } else {
    secLogs.forEach(s => {
      text += `• <b>${s.action}</b> (${s.actor}): <i>${escapeHtml(s.detail)}</i>\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 Set Webhook URL", callback_data: "p:sec:setup_webhook" },
        { text: "ℹ️ Query Webhook Info", callback_data: "p:sec:webhook_info" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 14. Submenu: System Health
async function renderHealthMenu(env) {
  const report = await runHealthCheck(env);
  const text = formatHealthHTML(report);

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔄 Refresh Health", callback_data: "p:health" },
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 15. Submenu: Language Settings
async function renderLanguageMenu(env) {
  const settings = await getSettings(env);
  const text =
    `🌐 <b>LANGUAGE CONFIGURATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Default System Language: <b>${settings.default_language === "hi" ? "हिंदी (Hindi)" : "English"}</b>\n\n` +
    `Supported bot languages:\n` +
    `• 🇬🇧 English (en)\n` +
    `• 🇮🇳 हिंदी (hi)\n\n` +
    `<i>Users can switch individual preferences with /language</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${settings.default_language === "en" ? "⭐ " : ""}English`, callback_data: "p:lang_set:en" },
        { text: `${settings.default_language === "hi" ? "⭐ " : ""}हिंदी`, callback_data: "p:lang_set:hi" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 16. Submenu: Backup & Restore
async function renderBackupMenu(env) {
  const history = await getBackupHistory(env);
  let text =
    `💾 <b>BACKUP & RESTORATION CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Cloudflare KV Snapshot Exporter\n` +
    `• Strict Credential Redaction (Never exports BOT_TOKEN or Secrets)\n` +
    `• JSON Schema Validation on Import\n\n` +
    `<b>Recent Backup History:</b>\n`;

  if (history.length === 0) {
    text += `<i>No backups exported yet.</i>\n`;
  } else {
    history.slice(0, 3).forEach(h => {
      text += `• <b>${h.id}</b> (${h.actor}): <i>${h.details}</i>\n  ⏱ ${h.ist || h.time}\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📤 Export Full Backup", callback_data: "p:bk:export" },
        { text: "📥 Import / Restore Backup", callback_data: "p:bk:prompt_import" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 17. Submenu: Notification Settings
async function renderNotificationMenu(env) {
  const notifs = await getNotificationSettings(env);
  const items = [
    { key: "scheduled_success", label: "Scheduled Success" },
    { key: "scheduled_failure", label: "Scheduled Failure" },
    { key: "new_reports", label: "New Member Reports" },
    { key: "security_alerts", label: "Security Alerts" },
    { key: "backup_success", label: "Backup Notifications" },
    { key: "automation_events", label: "Automation Status" }
  ];

  const buttons = [];
  for (let i = 0; i < items.length; i += 2) {
    const item1 = items[i];
    const item2 = items[i + 1];
    const row = [
      { text: `${notifs[item1.key] ? "🔔" : "🔕"} ${item1.label}`, callback_data: `p:notif_tgl:${item1.key}` }
    ];
    if (item2) {
      row.push({ text: `${notifs[item2.key] ? "🔔" : "🔕"} ${item2.label}`, callback_data: `p:notif_tgl:${item2.key}` });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  const text =
    `🔔 <b>OWNER NOTIFICATION SETTINGS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Toggle real-time alerts sent to your Telegram private chat:\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

// 18. Submenu: Template Library
async function renderTemplatesMenu(env) {
  const tpls = await getTemplates(env);
  const names = Object.keys(tpls);

  let text =
    `📝 <b>TEMPLATE LIBRARY</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Saved Broadcast Templates: <b>${names.length}</b>\n\n`;

  names.forEach((n, i) => {
    text += `${i + 1}. <b>${n}</b>\n`;
  });
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n<i>Templates support {DATE}, {CHANNEL}, {GROUP}, and {OWNER} tags.</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Create Template", callback_data: "p:tpl:add_prompt" }
      ],
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 19. Submenu: Reports Center
async function renderReportsMenu(env, page = 1) {
  const { items, total, totalPages } = await getReportsList(env, null, page, 4);

  let text =
    `🚨 <b>COMMUNITY REPORTS CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Reports: <b>${total}</b> (Page ${page}/${totalPages})\n\n`;

  if (items.length === 0) {
    text += `<i>No pending reports. Community is clean.</i>\n`;
  } else {
    items.forEach(r => {
      text += `• <b>#${r.id}</b> [${r.status.toUpperCase()}]\n  User: <code>${r.reported_user_id}</code> | By: <code>${r.reporter_id}</code>\n  Reason: <i>${escapeHtml(r.reason)}</i>\n\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const rows = [];
  const pendingReport = items.find(r => r.status === "pending");
  if (pendingReport) {
    rows.push([
      { text: `✅ Approve #${pendingReport.id}`, callback_data: `p:rep:app:${pendingReport.id}` },
      { text: `❌ Reject #${pendingReport.id}`, callback_data: `p:rep:rej:${pendingReport.id}` }
    ]);
  }

  const navRow = [];
  if (page > 1) navRow.push({ text: "⬅️ Prev", callback_data: `p:reports:p:${page - 1}` });
  if (page < totalPages) navRow.push({ text: "Next ➡️", callback_data: `p:reports:p:${page + 1}` });
  if (navRow.length > 0) rows.push(navRow);

  rows.push([{ text: "🔙 Back to Main Panel", callback_data: "p:main" }]);

  return { text, reply_markup: { inline_keyboard: rows } };
}

// 20. Submenu: Member Management
async function renderMembersMenu(env, page = 1) {
  const { items, total, totalPages } = await listMembers(env, page, 5);

  let text =
    `👤 <b>MEMBER MANAGEMENT CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Indexed Members: <b>${total}</b> (Page ${page}/${totalPages})\n\n`;

  if (items.length === 0) {
    text += `<i>No members indexed yet. Members register automatically on interaction.</i>\n`;
  } else {
    items.forEach(m => {
      text += `• <b>${escapeHtml(m.first_name)}</b> (<code>${m.id}</code>)\n  Last Seen: <i>${m.last_seen_ist || formatDateIST(m.last_seen)}</i>\n  Messages: ${m.message_count || 1}\n\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const rows = [];
  const navRow = [];
  if (page > 1) navRow.push({ text: "⬅️ Prev", callback_data: `p:members:p:${page - 1}` });
  if (page < totalPages) navRow.push({ text: "Next ➡️", callback_data: `p:members:p:${page + 1}` });
  if (navRow.length > 0) rows.push(navRow);

  rows.push([
    { text: "🔍 Search Member", callback_data: "p:mem:s" },
    { text: "🔙 Back to Main Panel", callback_data: "p:main" }
  ]);

  return { text, reply_markup: { inline_keyboard: rows } };
}

// 21. Submenu: Moderation Center
async function renderModerationMenu(env) {
  const history = await getModerationHistory(env, 4);
  const trusted = await listTrustedUsers(env);
  const banned = await listBlacklistedUsers(env);

  let text =
    `⚖️ <b>ADVANCED MODERATION CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Trusted Whitelist:</b> ${trusted.length} users\n` +
    `• <b>User Blacklist:</b> ${banned.length} users\n\n` +
    `<b>Recent Moderation Actions:</b>\n`;

  if (history.length === 0) {
    text += `<i>No moderation actions recorded yet.</i>\n`;
  } else {
    history.forEach(h => {
      text += `• <b>${h.action}</b> on <code>${h.target_id}</code>: <i>${escapeHtml(h.reason)}</i>\n  ⏱ ${h.ist || h.time}\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔙 Back to Main Panel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// 22. Submenu: Reset Defaults
async function renderResetMenu() {
  const text =
    `⚠️ <b>RESET & RECOVERY CONFIRMATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Are you sure you want to restore default configuration?\n\n` +
    `This action will reset custom feature toggles, channels, and settings to factory defaults.\n\n` +
    `<i>Note: Bot credentials and Cloudflare KV keys are safely preserved.</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔴 Confirm Full Reset", callback_data: "p:reset:confirm" },
        { text: "🔙 Cancel", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// ==========================================
// 2. WEBHOOK & INCOMING MESSAGE HANDLER
// ==========================================

async function handleMessage(env, message) {
  const chatId = message.chat?.id;
  const from = message.from;
  const fromId = from?.id;
  const text = (message.text || message.caption || "").trim();
  const isPrivate = message.chat?.type === "private";

  if (!fromId) return;

  // Track member activity and update profile in KV
  await registerOrUpdateMember(env, from);
  await trackUserActivity(env, fromId);
  await incrementStat(env, "messages_processed");

  // Route group chat messages to community group manager
  if (!isPrivate) {
    await handleGroupMessage(env, message);
    return;
  }

  // Retrieve user language preference
  const userLang = await getUserLanguage(env, fromId);
  const settings = await getSettings(env);
  const feats = await getFeatures(env);

  // Check Maintenance Mode
  if (feats.maintenance_mode && !isOwner(env, fromId)) {
    const maintMsg = await getMessage(env, userLang, "maintenance");
    await sendMessage(env, chatId, maintMsg);
    return;
  }

  // ----------------------------------------------------
  // Interactive State Handling (Multi-step Prompts)
  // ----------------------------------------------------
  const state = await getUserState(env, fromId);

  if (state && text === "/cancel") {
    await clearUserState(env, fromId);
    await sendMessage(env, chatId, "❌ Current operation cancelled.");
    return;
  }

  if (state && isOwner(env, fromId)) {
    // 1. Add Channel State
    if (state.action === "add_channel") {
      const parts = text.split(/\s+/);
      const chId = parts[0];
      const chTitle = parts.slice(1).join(" ") || `Channel ${chId}`;

      const adminCheck = await verifyChannelAdmin(env, chId);
      if (!adminCheck.ok) {
        await sendMessage(
          env,
          chatId,
          `❌ <b>Channel Verification Failed:</b>\n${adminCheck.error}\n\n<i>Make sure the bot has been added as an Administrator to ${chId} with posting permissions.</i>`
        );
        await clearUserState(env, fromId);
        return;
      }

      await addChannel(env, chId, chTitle);
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ <b>Channel Successfully Added & Verified:</b>\n<b>${escapeHtml(chTitle)}</b> (<code>${chId}</code>)`);
      return;
    }

    // 2. Draft Channel Post State
    if (state.action === "draft_channel_post") {
      const draftPost = {
        text: text,
        type: message.photo ? "photo" : message.video ? "video" : message.document ? "document" : "text",
        media: message.photo ? message.photo[message.photo.length - 1].file_id :
               message.video ? message.video.file_id :
               message.document ? message.document.file_id : null
      };

      await setUserState(env, fromId, { action: "preview_post", post: draftPost });

      const previewKeyboard = {
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

      await sendMessage(
        env,
        chatId,
        `📝 <b>POST DRAFT PREVIEW:</b>\n━━━━━━━━━━━━━━━━━━━━\n${escapeHtml(text)}\n━━━━━━━━━━━━━━━━━━━━\n<i>Select publication action:</i>`,
        { reply_markup: previewKeyboard }
      );
      return;
    }

    // 3. Schedule Post State
    if (state.action === "schedule_draft_post") {
      const parsedTime = parseDateIST(text);
      if (!parsedTime || parsedTime <= Date.now()) {
        await sendMessage(
          env,
          chatId,
          `⚠️ <b>Invalid Date/Time:</b> Please specify a future date/time formatted as <code>YYYY-MM-DD HH:mm</code> in Asia/Kolkata (IST).\n\nExample: <code>2026-11-15 14:30</code>`
        );
        return;
      }

      await addScheduledPost(env, {
        text: state.draft?.text || "",
        media_type: state.draft?.type || "text",
        media_id: state.draft?.media || null,
        post_at: parsedTime,
        pin: Boolean(state.pin)
      });

      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ <b>Post Scheduled Successfully:</b>\nWill publish at <b>${formatDateIST(parsedTime)}</b>.`);
      return;
    }

    // 4. Add Administrator State
    if (state.action === "add_admin") {
      const targetId = parseInt(text.trim(), 10);
      if (isNaN(targetId) || targetId <= 0) {
        await sendMessage(env, chatId, "⚠️ Please provide a valid numeric Telegram User ID.");
        return;
      }
      await addAdmin(env, targetId);
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ User <code>${targetId}</code> appointed as Administrator.`);
      return;
    }

    // 5. Remove Administrator State
    if (state.action === "remove_admin") {
      const targetId = parseInt(text.trim(), 10);
      if (isNaN(targetId)) {
        await sendMessage(env, chatId, "⚠️ Please provide a valid numeric Telegram User ID.");
        return;
      }
      await removeAdmin(env, targetId);
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ Admin <code>${targetId}</code> removed.`);
      return;
    }

    // 6. Add Temporary Manager State
    if (state.action === "add_temp_mgr") {
      const parts = text.split(/\s+/);
      const targetId = parseInt(parts[0], 10);
      const durationMins = parseInt(parts[1], 10) || 60;

      if (isNaN(targetId) || targetId <= 0) {
        await sendMessage(env, chatId, "⚠️ Format: <code>&lt;user_id&gt; &lt;duration_minutes&gt;</code>\nExample: <code>123456789 120</code>");
        return;
      }

      await addTempManager(env, targetId, durationMins);
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ Temporary Manager appointed: User <code>${targetId}</code> for ${durationMins} minutes.`);
      return;
    }

    // 7. Edit Message State
    if (state.action === "edit_message") {
      const key = state.key;
      const lang = state.lang || "en";
      const saveRes = await saveCustomMessage(env, lang, key, text);
      if (!saveRes.ok) {
        await sendMessage(env, chatId, `❌ <b>Save Failed:</b> ${saveRes.error}`);
        return;
      }
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ Custom message for <b>${key}</b> (${lang}) successfully updated!`);
      return;
    }

    // 8. Update Setting State
    if (state.action === "set_setting") {
      const key = state.key;
      const res = await updateSetting(env, key, text);
      if (!res.ok) {
        await sendMessage(env, chatId, `❌ <b>Update Failed:</b> ${res.error}`);
        return;
      }
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ Setting <b>${key}</b> updated to: <code>${res.value}</code>`);
      return;
    }

    // 9. Import / Restore Backup State
    if (state.action === "import_backup") {
      const restoreRes = await restoreBackup(env, text, fromId);
      await clearUserState(env, fromId);
      if (restoreRes.ok) {
        await sendMessage(env, chatId, `✅ <b>Backup Restored Successfully!</b>\nRestored version: <b>${restoreRes.version}</b>`);
      } else {
        await sendMessage(env, chatId, `❌ <b>Restore Failed:</b> ${restoreRes.error}`);
      }
      return;
    }

    // 10. Create Template State
    if (state.action === "create_template") {
      const firstLineBreak = text.indexOf("\n");
      let name, content;
      if (firstLineBreak > 0) {
        name = text.slice(0, firstLineBreak).trim().replace(/\s+/g, "_").toLowerCase();
        content = text.slice(firstLineBreak + 1).trim();
      } else {
        name = "tpl_" + Date.now();
        content = text;
      }
      await saveTemplate(env, name, content);
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, `✅ Template <b>${escapeHtml(name)}</b> created successfully!`);
      return;
    }

    // 11. Search Member State
    if (state.action === "search_member") {
      const member = await searchMember(env, text);
      await clearUserState(env, fromId);
      if (!member) {
        await sendMessage(env, chatId, `❌ Member not found matching: <code>${escapeHtml(text)}</code>`);
      } else {
        const full = await getMemberFullProfile(env, settings.group_id || 0, member.id);
        const card =
          `👤 <b>MEMBER PROFILE</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• <b>Name:</b> ${escapeHtml(full.first_name)}\n` +
          `• <b>ID:</b> <code>${full.id}</code>\n` +
          `• <b>Username:</b> ${full.username}\n` +
          `• <b>First Seen:</b> ${full.first_seen}\n` +
          `• <b>Last Seen:</b> ${full.last_seen}\n` +
          `• <b>Messages:</b> ${full.message_count}\n` +
          `• <b>Warnings:</b> ${full.warnings}\n` +
          `• <b>Trusted:</b> ${full.is_trusted ? "Yes" : "No"}\n` +
          `• <b>Blacklisted:</b> ${full.is_blacklisted ? "Yes" : "No"}\n` +
          `• <b>Language:</b> ${full.language.toUpperCase()}\n` +
          `━━━━━━━━━━━━━━━━━━━━`;
        await sendMessage(env, chatId, card);
      }
      return;
    }
  }

  // ----------------------------------------------------
  // Public Bot Commands
  // ----------------------------------------------------

  // /start
  if (text === "/start" || text.startsWith("/start ")) {
    await incrementStat(env, "commands_used");
    if (feats.welcome_system) {
      const welcomeMsg = await getMessage(env, userLang, "welcome");
      const buttons = await getButtons(env, userLang);

      const inlineKeyboard = [
        [
          { text: buttons.wallpaper_channel, url: settings.wallpaper_channel_url },
          { text: buttons.discussion_group, url: settings.discussion_group_url }
        ],
        [
          { text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` },
          { text: buttons.help, callback_data: "lang:help" }
        ],
        [
          { text: buttons.change_language, callback_data: "lang:selector" }
        ]
      ];

      await sendMessage(env, chatId, welcomeMsg, { reply_markup: { inline_keyboard: inlineKeyboard } });
      await incrementStat(env, "welcome_sent");
      return;
    }
  }

  // /help
  if (text === "/help" || text.startsWith("/help ")) {
    await incrementStat(env, "commands_used");
    const helpMsg = await getMessage(env, userLang, "help");
    await sendMessage(env, chatId, helpMsg);
    return;
  }

  // /about
  if (text === "/about") {
    await incrementStat(env, "commands_used");
    const aboutMsg = await getMessage(env, userLang, "about");
    await sendMessage(env, chatId, aboutMsg);
    return;
  }

  // /contact
  if (text === "/contact") {
    await incrementStat(env, "commands_used");
    const contactMsg = await getMessage(env, userLang, "contact");
    const kb = {
      inline_keyboard: [
        [{ text: "✉ Contact @shiv_yogi_19", url: `https://t.me/${settings.contact_username}` }]
      ]
    };
    await sendMessage(env, chatId, contactMsg, { reply_markup: kb });
    return;
  }

  // /language
  if (text === "/language") {
    await incrementStat(env, "commands_used");
    const kb = {
      inline_keyboard: [
        [
          { text: "🇬🇧 English", callback_data: "lang:user:en" },
          { text: "🇮🇳 हिंदी", callback_data: "lang:user:hi" }
        ]
      ]
    };
    await sendMessage(env, chatId, "🌐 <b>Select your interface language:</b>\nअपनी पसंदीदा भाषा चुनें:", { reply_markup: kb });
    return;
  }

  // /ping
  if (text === "/ping") {
    await incrementStat(env, "commands_used");
    const startMs = Date.now();
    const sent = await sendMessage(env, chatId, "🏓 Pinging...");
    const latency = Date.now() - startMs;
    if (sent.ok) {
      await editMessageText(
        env,
        chatId,
        sent.result.message_id,
        `🏓 <b>Pong!</b>\n⏱ <b>Latency:</b> <code>${latency}ms</code>\n🕒 <b>IST Time:</b> <code>${formatDateIST()}</code>`
      );
    }
    return;
  }

  // /id
  if (text === "/id") {
    await incrementStat(env, "commands_used");
    const info =
      `🆔 <b>TELEGRAM IDENTIFIERS</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Your User ID:</b> <code>${fromId}</code>\n` +
      `💬 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `📨 <b>Message ID:</b> <code>${message.message_id}</code>`;
    await sendMessage(env, chatId, info);
    return;
  }

  // /rules
  if (text === "/rules") {
    await incrementStat(env, "commands_used");
    const rules = await getMessage(env, userLang, "group_rules");
    await sendMessage(env, chatId, rules);
    return;
  }

  // ----------------------------------------------------
  // Privileged Owner Commands
  // ----------------------------------------------------

  // /panel (Owner only)
  if (text === "/panel") {
    await incrementStat(env, "commands_used");
    if (!isOwner(env, fromId)) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied:</b> This command is restricted to the bot Owner.");
      await logSecurityEvent(env, fromId, "unauthorized_panel_command", "Non-owner attempted /panel");
      return;
    }
    const panel = await renderMainPanel(env);
    await sendMessage(env, chatId, panel.text, { reply_markup: panel.reply_markup });
    return;
  }

  // /post <text> (Admin / Owner)
  if (text.startsWith("/post")) {
    await incrementStat(env, "commands_used");
    const canPost = await hasPermission(env, fromId, "can_post_channel");
    if (!canPost) {
      await sendMessage(env, chatId, "⛔ <b>Unauthorized:</b> You lack permission to publish channel posts.");
      return;
    }
    const postBody = text.replace(/^\/post\s*/i, "").trim();
    if (!postBody) {
      await sendMessage(env, chatId, "⚠️ Format: <code>/post Your announcement here</code>");
      return;
    }
    if (!settings.channel_id) {
      await sendMessage(env, chatId, "⚠️ Primary channel ID is not configured. Please set it in /panel.");
      return;
    }
    const res = await publishPost(env, settings.channel_id, { type: "text", text: postBody });
    if (res.ok) {
      await incrementStat(env, "channel_posts");
      await sendMessage(env, chatId, `✅ Announcement published to <code>${settings.channel_id}</code>!`);
    } else {
      await sendMessage(env, chatId, `❌ Post failed: ${res.description || "Unknown error"}`);
    }
    return;
  }

  // /schedule
  if (text === "/schedule") {
    await incrementStat(env, "commands_used");
    if (!isOwner(env, fromId) && !(await hasPermission(env, fromId, "can_manage_scheduled_posts"))) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied.</b>");
      return;
    }
    const schedView = await renderScheduledMenu(env, 1);
    await sendMessage(env, chatId, schedView.text, { reply_markup: schedView.reply_markup });
    return;
  }

  // /stats
  if (text === "/stats") {
    await incrementStat(env, "commands_used");
    if (!isOwner(env, fromId) && !(await hasPermission(env, fromId, "can_view_stats"))) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied.</b>");
      return;
    }
    const statsView = await renderStatsMenu(env);
    await sendMessage(env, chatId, statsView.text, { reply_markup: statsView.reply_markup });
    return;
  }

  // /backup
  if (text === "/backup") {
    await incrementStat(env, "commands_used");
    if (!isOwner(env, fromId)) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied:</b> Owner only.");
      return;
    }
    const bkJson = await createFullBackup(env);
    await sendMessage(env, chatId, `💾 <b>Bot Configuration Backup:</b>\n\n<code>${bkJson}</code>`);
    return;
  }

  // /setwebhook
  if (text.startsWith("/setwebhook")) {
    await incrementStat(env, "commands_used");
    if (!isOwner(env, fromId)) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied.</b>");
      return;
    }
    const workerUrl = "https://shiv-yogi-assistant.shivyogi-x19.workers.dev/";
    const res = await setWebhook(env, workerUrl, env.WEBHOOK_SECRET);
    if (res.ok) {
      await sendMessage(env, chatId, `✅ Webhook successfully registered to: <code>${workerUrl}</code>`);
    } else {
      await sendMessage(env, chatId, `❌ Webhook registration failed: ${res.description}`);
    }
    return;
  }

  // ----------------------------------------------------
  // Repeat Reply System
  // ----------------------------------------------------
  if (feats.repeat_replies && !text.startsWith("/")) {
    const cooldownKey = `cooldown:${fromId}`;
    const isInCooldown = await safeKvGet(env, cooldownKey, "text");
    if (!isInCooldown) {
      const cooldownSecs = settings.repeat_cooldown_seconds || 60;
      await safeKvPut(env, cooldownKey, "1", { expirationTtl: cooldownSecs });
      const repeatMsg = await getMessage(env, userLang, "repeat");
      await sendMessage(env, chatId, repeatMsg);
    }
  }
}

// ==========================================
// 3. CALLBACK QUERY ROUTER
// ==========================================

async function handleCallback(env, query) {
  const queryId = query.id;
  const from = query.from;
  const fromId = from?.id;
  const data = query.data || "";
  const message = query.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;

  if (!fromId) return;

  // Suspicious callback detection
  if (await detectSuspiciousCallback(env, fromId, data)) {
    await answerCallbackQuery(env, queryId, "⛔ Access Rejected.", true);
    return;
  }

  // 1. CAPTCHA Verification Callback
  if (data.startsWith("grp:verify:")) {
    await handleCaptchaVerification(env, query);
    return;
  }

  // 2. User Language Selection Callback
  if (data.startsWith("lang:user:")) {
    const lang = data.split(":")[2];
    await setUserLanguage(env, fromId, lang);
    await answerCallbackQuery(env, queryId, `Language updated to ${lang === "hi" ? "हिंदी" : "English"}!`);
    await editMessageText(
      env,
      chatId,
      messageId,
      `✅ <b>Language set:</b> ${lang === "hi" ? "हिंदी (Hindi)" : "English"}.\nType /start to continue.`
    );
    return;
  }

  if (data === "lang:selector") {
    const kb = {
      inline_keyboard: [
        [
          { text: "🇬🇧 English", callback_data: "lang:user:en" },
          { text: "🇮🇳 हिंदी", callback_data: "lang:user:hi" }
        ]
      ]
    };
    await editMessageText(env, chatId, messageId, "🌐 <b>Select your interface language:</b>", { reply_markup: kb });
    await answerCallbackQuery(env, queryId);
    return;
  }

  if (data === "lang:help") {
    const userLang = await getUserLanguage(env, fromId);
    const helpMsg = await getMessage(env, userLang, "help");
    await editMessageText(env, chatId, messageId, helpMsg, {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Back", callback_data: "p:user_back_start" }]]
      }
    });
    await answerCallbackQuery(env, queryId);
    return;
  }

  if (data === "p:user_back_start") {
    const userLang = await getUserLanguage(env, fromId);
    const welcomeMsg = await getMessage(env, userLang, "welcome");
    const settings = await getSettings(env);
    const buttons = await getButtons(env, userLang);

    const inlineKeyboard = [
      [
        { text: buttons.wallpaper_channel, url: settings.wallpaper_channel_url },
        { text: buttons.discussion_group, url: settings.discussion_group_url }
      ],
      [
        { text: buttons.contact_owner, url: `https://t.me/${settings.contact_username}` },
        { text: buttons.help, callback_data: "lang:help" }
      ],
      [
        { text: buttons.change_language, callback_data: "lang:selector" }
      ]
    ];
    await editMessageText(env, chatId, messageId, welcomeMsg, { reply_markup: { inline_keyboard: inlineKeyboard } });
    await answerCallbackQuery(env, queryId);
    return;
  }

  // ----------------------------------------------------
  // OWNER CONTROL PANEL CALLBACK ROUTING
  // ----------------------------------------------------
  if (data.startsWith("p:")) {
    // Strict Owner Authorization Check
    if (!isOwner(env, fromId)) {
      await answerCallbackQuery(env, queryId, "⛔ Access Denied: Owner only.", true);
      await logSecurityEvent(env, fromId, "unauthorized_panel_callback", `Rejected ${data}`);
      return;
    }

    await answerCallbackQuery(env, queryId);

    // Cancel interactive state
    if (data === "p:cancel_state") {
      await clearUserState(env, fromId);
      const panel = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, panel.text, { reply_markup: panel.reply_markup });
      return;
    }

    // Close Panel
    if (data === "p:close") {
      await clearUserState(env, fromId);
      await editMessageText(env, chatId, messageId, "🔒 <i>Owner Control Panel closed. Type /panel to reopen.</i>");
      return;
    }

    // Main Panel Navigation
    if (data === "p:main") {
      await clearUserState(env, fromId);
      const panel = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, panel.text, { reply_markup: panel.reply_markup });
      return;
    }

    // Settings Menu
    if (data === "p:settings") {
      const v = await renderSettingsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Feature Controls Menu
    if (data === "p:feat") {
      const v = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Toggle Feature Flag
    if (data.startsWith("p:ftgl:")) {
      const featKey = data.split(":")[2];
      await toggleFeature(env, featKey);
      const v = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Channel Manager Menu
    if (data === "p:chan") {
      const v = await renderChannelMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Group Manager Menu
    if (data === "p:grp") {
      const v = await renderGroupMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Scheduled Posts Menu
    if (data === "p:sched" || data.startsWith("p:sched:p:")) {
      const page = data.startsWith("p:sched:p:") ? parseInt(data.split(":")[3], 10) || 1 : 1;
      const v = await renderScheduledMenu(env, page);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Cancel Scheduled Post
    if (data.startsWith("p:sched:del:")) {
      const postId = data.split(":")[3];
      await cancelScheduledPost(env, postId);
      const v = await renderScheduledMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Retry Scheduled Post
    if (data.startsWith("p:sched:retry:")) {
      const postId = data.split(":")[3];
      await retryFailedScheduledPost(env, postId);
      const v = await renderScheduledMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Automation Menu
    if (data === "p:auto") {
      const v = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Toggle Daily Post
    if (data === "p:auto:toggle_daily") {
      const auto = await getAutomationSettings(env);
      auto.daily_announcement_enabled = !auto.daily_announcement_enabled;
      await saveAutomationSettings(env, auto);
      const v = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Toggle Auto Backup
    if (data === "p:auto:toggle_backup") {
      const auto = await getAutomationSettings(env);
      auto.auto_backup_enabled = !auto.auto_backup_enabled;
      await saveAutomationSettings(env, auto);
      const v = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Admin Control Menu
    if (data === "p:adm") {
      const v = await renderAdminMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Temporary Managers Menu
    if (data === "p:tm") {
      const v = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Revoke Temp Manager Direct
    if (data.startsWith("p:tm:rm_direct:")) {
      const targetId = data.split(":")[3];
      await revokeTempManager(env, targetId);
      const v = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Welcome Editor Menu
    if (data === "p:welc") {
      const v = await renderWelcomeMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Repeat Editor Menu
    if (data === "p:rep") {
      const v = await renderRepeatMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Statistics Menu
    if (data === "p:stats") {
      const v = await renderStatsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Export Analytics JSON
    if (data === "p:stats:export") {
      const json = await exportAnalyticsJSON(env);
      await sendMessage(env, chatId, `📊 <b>ANALYTICS EXPORT:</b>\n\n<code>${json}</code>`);
      return;
    }

    // Activity Logs Menu
    if (data === "p:logs") {
      const v = await renderLogsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Security Menu
    if (data === "p:sec") {
      const v = await renderSecurityMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // System Health Menu
    if (data === "p:health") {
      const v = await renderHealthMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Language Menu
    if (data === "p:lang") {
      const v = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Change System Language
    if (data.startsWith("p:lang_set:")) {
      const lang = data.split(":")[2];
      await updateSetting(env, "default_language", lang);
      const v = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Backup Menu
    if (data === "p:backup") {
      const v = await renderBackupMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Export Backup JSON
    if (data === "p:bk:export") {
      const bkJson = await createFullBackup(env);
      await sendMessage(env, chatId, `💾 <b>BACKUP SNAPSHOT CREATED:</b>\n\n<code>${bkJson}</code>`);
      return;
    }

    // Notification Settings Menu
    if (data === "p:notif") {
      const v = await renderNotificationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Toggle Notification
    if (data.startsWith("p:notif_tgl:")) {
      const key = data.split(":")[2];
      await toggleNotification(env, key);
      const v = await renderNotificationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Template Library Menu
    if (data === "p:tpls") {
      const v = await renderTemplatesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Reports Center Menu
    if (data === "p:reports" || data.startsWith("p:reports:p:")) {
      const page = data.startsWith("p:reports:p:") ? parseInt(data.split(":")[3], 10) || 1 : 1;
      const v = await renderReportsMenu(env, page);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Approve Report
    if (data.startsWith("p:rep:app:")) {
      const repId = data.split(":")[3];
      await updateReportStatus(env, repId, "approved", fromId, "Report approved by Owner");
      const v = await renderReportsMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Reject Report
    if (data.startsWith("p:rep:rej:")) {
      const repId = data.split(":")[3];
      await updateReportStatus(env, repId, "rejected", fromId, "Report rejected by Owner");
      const v = await renderReportsMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Member Management Menu
    if (data === "p:members" || data.startsWith("p:members:p:")) {
      const page = data.startsWith("p:members:p:") ? parseInt(data.split(":")[3], 10) || 1 : 1;
      const v = await renderMembersMenu(env, page);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Moderation Center Menu
    if (data === "p:mod") {
      const v = await renderModerationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Reset Menu
    if (data === "p:reset") {
      const v = await renderResetMenu();
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Confirm Reset
    if (data === "p:reset:confirm") {
      await resetAllSettings(env);
      await editMessageText(env, chatId, messageId, "✅ <b>Settings Successfully Reset to Defaults!</b>\nType /panel to open.");
      return;
    }

    // ----------------------------------------------------
    // State Machine Prompt Launchers
    // ----------------------------------------------------
    if (data === "p:chan:add_prompt") {
      await setUserState(env, fromId, { action: "add_channel" });
      await sendMessage(
        env,
        chatId,
        "➕ <b>Add Channel:</b>\nSend the channel @username or ID, followed optionally by a title:\n\nExample: <code>@the_endless_playback The Endless Playback</code>\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:chan:draft") {
      await setUserState(env, fromId, { action: "draft_channel_post" });
      await sendMessage(
        env,
        chatId,
        "📝 <b>Draft Channel Post:</b>\nSend the message (text, photo with caption, or video) you wish to publish or schedule:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:adm:prompt_add") {
      await setUserState(env, fromId, { action: "add_admin" });
      await sendMessage(
        env,
        chatId,
        "👮 <b>Add Administrator:</b>\nSend the numeric Telegram User ID of the new admin:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:adm:prompt_rm") {
      await setUserState(env, fromId, { action: "remove_admin" });
      await sendMessage(
        env,
        chatId,
        "👮 <b>Remove Administrator:</b>\nSend the numeric Telegram User ID of the admin to remove:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:tm:prompt_add") {
      await setUserState(env, fromId, { action: "add_temp_mgr" });
      await sendMessage(
        env,
        chatId,
        "⏳ <b>Add Temporary Manager:</b>\nSend the User ID and duration in minutes:\n\nExample: <code>123456789 60</code>\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data.startsWith("p:edit_msg:")) {
      const key = data.split(":")[2];
      await setUserState(env, fromId, { action: "edit_message", key: key, lang: "en" });
      await sendMessage(
        env,
        chatId,
        `✏️ <b>Edit Message (${key}):</b>\nSend your new message text in Telegram HTML formatting:\n\n<i>Type /cancel to abort.</i>`
      );
      return;
    }

    if (data.startsWith("p:reset_msg:")) {
      const key = data.split(":")[2];
      await resetCustomMessage(env, "en", key);
      await sendMessage(env, chatId, `🔄 Message <b>${key}</b> restored to default.`);
      return;
    }

    if (data.startsWith("p:set:")) {
      const keyMap = {
        chan_id: "channel_id",
        grp_id: "group_id",
        contact_user: "contact_username",
        chan_url: "wallpaper_channel_url",
        cooldown: "repeat_cooldown_seconds"
      };
      const shortKey = data.split(":")[2];
      const fullKey = keyMap[shortKey] || shortKey;
      await setUserState(env, fromId, { action: "set_setting", key: fullKey });
      await sendMessage(
        env,
        chatId,
        `⚙️ <b>Update Setting (${fullKey}):</b>\nSend the new value for this setting:\n\n<i>Type /cancel to abort.</i>`
      );
      return;
    }

    if (data === "p:bk:prompt_import") {
      await setUserState(env, fromId, { action: "import_backup" });
      await sendMessage(
        env,
        chatId,
        "📥 <b>Import / Restore Backup:</b>\nPaste the full JSON backup text in chat to validate and restore:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:tpl:add_prompt") {
      await setUserState(env, fromId, { action: "create_template" });
      await sendMessage(
        env,
        chatId,
        "📝 <b>Create Template:</b>\nSend template name on line 1, followed by template body:\n\nExample:\n<code>promo_drop\n🔥 Special Wallpaper Drop!\nCheck @the_endless_playback</code>\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:mem:s") {
      await setUserState(env, fromId, { action: "search_member" });
      await sendMessage(
        env,
        chatId,
        "🔍 <b>Search Member:</b>\nSend numeric Telegram User ID or username to inspect:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    // Draft Post Actions: Publish / Pin / Schedule / Discard
    if (data === "p:chd:pub" || data === "p:chd:pub_pin") {
      const curState = await getUserState(env, fromId);
      const draft = curState?.post;
      if (!draft) {
        await sendMessage(env, chatId, "⚠️ No active draft found.");
        return;
      }
      const settings = await getSettings(env);
      if (!settings.channel_id) {
        await sendMessage(env, chatId, "⚠️ Primary channel ID is not configured.");
        return;
      }
      const pin = data === "p:chd:pub_pin";
      const res = await publishPost(env, settings.channel_id, draft, pin);
      await clearUserState(env, fromId);
      if (res.ok) {
        await incrementStat(env, "channel_posts");
        await sendMessage(env, chatId, `✅ Post published${pin ? " and pinned" : ""} in <code>${settings.channel_id}</code>!`);
      } else {
        await sendMessage(env, chatId, `❌ Publish failed: ${res.description || "Unknown error"}`);
      }
      return;
    }

    if (data === "p:chd:sched") {
      const curState = await getUserState(env, fromId);
      if (!curState?.post) {
        await sendMessage(env, chatId, "⚠️ No active draft found.");
        return;
      }
      await setUserState(env, fromId, { action: "schedule_draft_post", draft: curState.post });
      await sendMessage(
        env,
        chatId,
        "⏰ <b>Schedule Post Time:</b>\nSend the publication date/time in Asia/Kolkata (IST):\n\nFormat: <code>YYYY-MM-DD HH:mm</code>\nExample: <code>2026-11-15 14:30</code>"
      );
      return;
    }

    if (data === "p:chd:discard") {
      await clearUserState(env, fromId);
      await sendMessage(env, chatId, "🗑 Draft discarded.");
      return;
    }

    if (data === "p:welc_rules") {
      const rules = await getMessage(env, "en", "group_rules");
      await sendMessage(env, chatId, rules);
      return;
    }

    if (data === "p:chan:check_admin") {
      const settings = await getSettings(env);
      if (!settings.channel_id) {
        await sendMessage(env, chatId, "⚠️ Primary channel ID not set.");
        return;
      }
      const check = await verifyChannelAdmin(env, settings.channel_id);
      let rep = `🔍 <b>ADMIN PERMISSIONS AUDIT (${settings.channel_id}):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      rep += `• Member Status: <b>${check.status || "Unknown"}</b>\n`;
      rep += `• Can Post Messages: ${check.can_post_messages ? "✅ Yes" : "❌ No"}\n`;
      rep += `• Can Edit Messages: ${check.can_edit_messages ? "✅ Yes" : "❌ No"}\n`;
      rep += `• Can Delete Messages: ${check.can_delete_messages ? "✅ Yes" : "❌ No"}\n`;
      rep += `• Can Pin Messages: ${check.can_pin_messages ? "✅ Yes" : "❌ No"}\n`;
      rep += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (!check.ok) rep += `⚠️ Issue: <i>${check.error}</i>`;
      await sendMessage(env, chatId, rep);
      return;
    }

    if (data === "p:chan:hist") {
      const hist = await getChannelHistory(env);
      let rep = `📜 <b>RECENT PUBLISHED POST HISTORY:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      if (hist.length === 0) {
        rep += `<i>No post history recorded yet.</i>\n`;
      } else {
        hist.slice(0, 5).forEach(h => {
          rep += `• Post #${h.id} (${h.channel_id})\n  Type: ${h.type} | Pinned: ${h.pinned ? "Yes" : "No"}\n  Text: <i>${escapeHtml(h.text)}</i>\n  ⏱ ${h.ist || h.date}\n\n`;
        });
      }
      await sendMessage(env, chatId, rep);
      return;
    }

    if (data === "p:chan:broadcast_prompt") {
      await setUserState(env, fromId, { action: "draft_channel_post" });
      await sendMessage(
        env,
        chatId,
        "📡 <b>Broadcast Announcement:</b>\nSend the message to broadcast to all configured channels:\n\n<i>Type /cancel to abort.</i>"
      );
      return;
    }

    if (data === "p:sec:setup_webhook") {
      const workerUrl = "https://shiv-yogi-assistant.shivyogi-x19.workers.dev/";
      const res = await setWebhook(env, workerUrl, env.WEBHOOK_SECRET);
      if (res.ok) {
        await sendMessage(env, chatId, `✅ Webhook registered successfully to: <code>${workerUrl}</code>`);
      } else {
        await sendMessage(env, chatId, `❌ Webhook registration failed: ${res.description}`);
      }
      return;
    }

    if (data === "p:sec:webhook_info") {
      const info = await getWebhookInfo(env);
      if (info.ok) {
        const rep =
          `ℹ️ <b>WEBHOOK TELEGRAM INFO:</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
          `• URL: <code>${info.result.url || "None"}</code>\n` +
          `• Has Custom Certificate: ${info.result.has_custom_certificate ? "Yes" : "No"}\n` +
          `• Pending Updates: <b>${info.result.pending_update_count}</b>\n` +
          `• Last Error: <i>${info.result.last_error_message || "None"}</i>\n` +
          `• Max Connections: ${info.result.max_connections || 40}`;
        await sendMessage(env, chatId, rep);
      } else {
        await sendMessage(env, chatId, `❌ Failed to query webhook info: ${info.description}`);
      }
      return;
    }
  }
}

// ==========================================
// 4. CLOUDFLARE WORKER EXPORT (FETCH & CRON)
// ==========================================

export default {
  /**
   * HTTP Request Fetch Handler
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health Check Endpoint (GET / or GET /health)
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      const healthData = await runHealthCheck(env);
      const statusCode = healthData.overall_status === "DOWN" ? 503 : 200;
      return new Response(JSON.stringify({ ok: statusCode === 200, health: healthData }, null, 2), {
        status: statusCode,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Telegram Webhook Handler (POST /)
    if (request.method === "POST") {
      // Secret token verification
      if (!verifyWebhookSecret(request, env)) {
        await logSecurityEvent(env, "unknown", "invalid_webhook_secret", `Rejected request from ${request.headers.get("CF-Connecting-IP") || "unknown"}`);
        return new Response("Forbidden: Invalid Webhook Secret", { status: 403 });
      }

      let update;
      try {
        update = await request.json();
      } catch (err) {
        return new Response("Bad Request: Malformed JSON", { status: 400 });
      }

      // Update deduplication
      if (update.update_id) {
        const isDuplicate = await checkUpdateDedup(env, update.update_id, ctx);
        if (isDuplicate) {
          return new Response("OK (Duplicate Skipped)", { status: 200 });
        }
      }

      try {
        if (update.message) {
          await handleMessage(env, update.message);
        } else if (update.callback_query) {
          await handleCallback(env, update.callback_query);
        }
      } catch (handlerErr) {
        console.error("Webhook processing error:", handlerErr);
        await incrementStat(env, "api_errors");
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  },

  /**
   * Cloudflare Cron Trigger Handler
   * Runs every minute (* * * * *)
   */
  async scheduled(event, env, ctx) {
    try {
      // 1. Process Scheduled Post Queue
      await processScheduledQueue(env);

      // 2. Run Automation Routines (Daily posts, Backups, Expirations)
      await runAutomationCycle(env);
    } catch (cronErr) {
      console.error("Cron Handler Exception:", cronErr);
    }
  }
};
