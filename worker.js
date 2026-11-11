/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * Complete Production-Ready Upgrade
 * Cloudflare Workers (ES Modules) + Cloudflare KV + Telegram Bot API
 *
 * Integrated Architecture:
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
 *  - modules/command-manager.js
 *  - modules/command-handlers.js
 *  - modules/dashboard.js
 *  - modules/button-manager.js
 *  - modules/menu-layouts.js
 *  - modules/random-welcome.js
 *  - modules/random-replies.js
 *  - modules/reply-history.js
 *  - modules/customisation.js
 *  - modules/plugin-manager.js
 *  - modules/user-management.js
 *  - modules/migration.js
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

import { dispatchCommand } from "./modules/command-manager.js";
import { getDashboardData, formatDashboardHTML, buildDashboardKeyboard } from "./modules/dashboard.js";
import { getLayout, buildTelegramKeyboard, formatLayoutSummaryHTML, resetLayout } from "./modules/button-manager.js";
import { getWelcomePool, addWelcomeVariant, formatWelcomePoolHTML, getRandomWelcomeMessage } from "./modules/random-welcome.js";
import { getTriggersList, addTrigger, formatTriggersSummaryHTML, matchAndGetRandomReply } from "./modules/random-replies.js";
import { getGlobalReplyHistory } from "./modules/reply-history.js";
import { getCustomFooter, setCustomFooter, formatBotFatherGuideHTML } from "./modules/customisation.js";
import { getPluginRegistryDetails, formatPluginsSummaryHTML, togglePlugin } from "./modules/plugin-manager.js";
import { getUserListPaginated, blockUser, unblockUser, isUserBlocked, broadcastToUsers, formatUserProfileHTML } from "./modules/user-management.js";
import { runV4Migration } from "./modules/migration.js";

// ============================================================
// 1. OWNER CONTROL PANEL INTERFACE & MENUS (EXACTLY 8 SECTIONS)
// ============================================================

export function buildMainPanelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📊 Dashboard", callback_data: "p:dash" },
        { text: "⚙️ Bot Settings", callback_data: "p:settings" }
      ],
      [
        { text: "👤 User Management", callback_data: "p:users" },
        { text: "👥 Group Management", callback_data: "p:grp" }
      ],
      [
        { text: "📢 Channel Management", callback_data: "p:chan" },
        { text: "🎨 Message Customisation", callback_data: "p:custom" }
      ],
      [
        { text: "👋 Random Welcome", callback_data: "p:rwelc" },
        { text: "🔁 Random Replies", callback_data: "p:rreply" }
      ],
      [
        { text: "❌ Close Panel", callback_data: "p:close" }
      ]
    ]
  };
}

export async function renderMainPanel(env) {
  const data = await getDashboardData(env);
  const statusIcon = data.status === "ONLINE" ? "🟢" : data.status === "MAINTENANCE" ? "🟡" : "🔴";

  const text =
    `👑 <b>SHIV YOGI ASSISTANT — MASTER CONTROL PANEL (v4.0.0)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Owner:</b> ${escapeHtml(data.owner_name)} (<code>${data.owner_id}</code>)\n` +
    `🚦 <b>Status:</b> ${statusIcon} <b>${data.status}</b> | <b>Version:</b> 4.0.0\n` +
    `👥 <b>Users:</b> <code>${data.total_users.toLocaleString()}</code> | <b>DAU:</b> <code>${data.dau_estimate.toLocaleString()}</code>\n` +
    `📢 <b>Channels:</b> <code>${data.connected_channels}</code> | <b>Groups:</b> <code>${data.total_groups}</code>\n` +
    `💬 <b>Messages:</b> <code>${data.messages_processed.toLocaleString()}</code> | <b>Commands:</b> <code>${data.commands_executed.toLocaleString()}</code>\n` +
    `🕒 <b>Timezone:</b> Asia/Kolkata (IST)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Select one of the 8 main administrative sections below:</i>`;

  return { text, reply_markup: buildMainPanelKeyboard() };
}

// Submenu 1: Dashboard
export async function renderDashboardMenu(env) {
  const data = await getDashboardData(env);
  const text = formatDashboardHTML(data);
  const reply_markup = buildDashboardKeyboard();
  return { text, reply_markup };
}

// Submenu 2: Bot Settings
export async function renderSettingsMenu(env) {
  const settings = await getSettings(env);
  const feats = await getFeatures(env);
  const text =
    `⚙️ <b>BOT SETTINGS & CONFIGURATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Owner Name:</b> ${escapeHtml(settings.owner_name)}\n` +
    `• <b>Contact Username:</b> @${escapeHtml(settings.contact_username)}\n` +
    `• <b>Channel ID:</b> <code>${escapeHtml(settings.channel_id || "Not Set")}</code>\n` +
    `• <b>Group ID:</b> <code>${escapeHtml(settings.group_id || "Not Set")}</code>\n` +
    `• <b>Reply Cooldown:</b> ${settings.repeat_cooldown_seconds || 30}s\n` +
    `• <b>Slow Mode:</b> ${settings.slow_mode_seconds > 0 ? settings.slow_mode_seconds + "s" : "Off"}\n` +
    `• <b>Warning Limit:</b> ${settings.warn_limit || 3} warnings\n` +
    `• <b>Emergency Maintenance:</b> ${feats.maintenance_mode ? "🟡 ACTIVE" : "🟢 Inactive"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Tap an option below to manage configuration:</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🎛 Feature Controls", callback_data: "p:feat" },
        { text: "👮 Admins & Managers", callback_data: "p:adm" }
      ],
      [
        { text: "🛡 Security Center", callback_data: "p:sec" },
        { text: "🏥 System Health", callback_data: "p:health" }
      ],
      [
        { text: "💾 Backup & Restore", callback_data: "p:backup" },
        { text: "🧩 Plugin Manager", callback_data: "p:plugins" }
      ],
      [
        { text: "✏️ Set Channel ID", callback_data: "p:set:chan_id" },
        { text: "✏️ Set Group ID", callback_data: "p:set:grp_id" }
      ],
      [
        { text: "✏️ Set Contact @user", callback_data: "p:set:contact_user" },
        { text: "⏱ Cooldown Seconds", callback_data: "p:set:cooldown" }
      ],
      [
        { text: "🌐 Default Language", callback_data: "p:lang" },
        { text: "🔔 Notifications", callback_data: "p:notif" }
      ],
      [
        { text: "🔄 Reset Defaults", callback_data: "p:reset" },
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 3: User Management
export async function renderUserMenu(env, page = 1) {
  const { items, total, totalPages } = await getUserListPaginated(env, page, 4);
  let text =
    `👤 <b>USER MANAGEMENT CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Registered Users: <b>${total}</b> (Page ${page}/${totalPages})\n\n`;

  if (items.length === 0) {
    text += `<i>No users registered in database yet.</i>\n`;
  } else {
    items.forEach((u, i) => {
      text += `${i + 1}. <b>${escapeHtml(u.first_name || "User")}</b> (<code>${u.id}</code>)\n   Username: @${u.username || "none"} | Msgs: ${u.message_count || 1}\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔍 Search Member", callback_data: "p:mem:s" },
        { text: "📡 Broadcast Users", callback_data: "p:usr:bcast_prompt" }
      ],
      [
        { text: "⭐ Trusted Whitelist", callback_data: "p:mod:white" },
        { text: "⛔ Blacklist / Block", callback_data: "p:mod:black" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 4: Group Management
export async function renderGroupMenu(env) {
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
    `• <b>Anti-Forward Filter:</b> ${feats.anti_forward ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Anti-Bot Protection:</b> ${feats.anti_bot ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• <b>Bot Slow Mode:</b> ${settings.slow_mode_seconds > 0 ? settings.slow_mode_seconds + "s" : "Off"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${feats.captcha_verification ? "🛡 Disable" : "🛡 Enable"} CAPTCHA`, callback_data: "p:ftgl:captcha_verification" },
        { text: `${feats.anti_spam ? "🚫 Disable" : "🚫 Enable"} Anti-Spam`, callback_data: "p:ftgl:anti_spam" }
      ],
      [
        { text: `${feats.link_filter ? "🔗 Disable" : "🔗 Enable"} Links`, callback_data: "p:ftgl:link_filter" },
        { text: `${feats.word_filter ? "🤬 Disable" : "🤬 Enable"} Words`, callback_data: "p:ftgl:word_filter" }
      ],
      [
        { text: `${feats.anti_forward ? "⏩ Disable" : "⏩ Enable"} Forwards`, callback_data: "p:ftgl:anti_forward" },
        { text: `${feats.anti_bot ? "🤖 Disable" : "🤖 Enable"} Anti-Bot`, callback_data: "p:ftgl:anti_bot" }
      ],
      [
        { text: "📜 View Group Rules", callback_data: "p:welc_rules" },
        { text: "⚖️ Moderation Center", callback_data: "p:mod" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 5: Channel Management
export async function renderChannelMenu(env) {
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
        { text: "⏰ Scheduled Posts", callback_data: "p:sched" },
        { text: "🔍 Audit Permissions", callback_data: "p:chan:check_admin" }
      ],
      [
        { text: "📜 Post History", callback_data: "p:chan:hist" },
        { text: "📡 Broadcast All", callback_data: "p:chan:broadcast_prompt" }
      ],
      [
        { text: "📝 Post Templates", callback_data: "p:tpls" },
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 6: Message Customisation
export async function renderCustomisationMenu(env) {
  const footer = await getCustomFooter(env);
  const text =
    `🎨 <b>MESSAGE & UI CUSTOMISATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Current Message Footer: <i>${escapeHtml(footer)}</i>\n\n` +
    `Select a message or layout to customize in real-time:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "👋 Welcome Message", callback_data: "p:edit_msg:welcome" },
        { text: "ℹ️ About Message", callback_data: "p:edit_msg:about" }
      ],
      [
        { text: "📖 Help Message", callback_data: "p:edit_msg:help" },
        { text: "✉ Contact Message", callback_data: "p:edit_msg:contact" }
      ],
      [
        { text: "📜 Group Rules", callback_data: "p:edit_msg:group_rules" },
        { text: "✍️ Global Footer", callback_data: "p:edit_msg:footer" }
      ],
      [
        { text: "📐 Button Layout Manager", callback_data: "p:layout" },
        { text: "ℹ️ BotFather Guide", callback_data: "p:bf_guide" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 7: Random Welcome Manager
export async function renderRandomWelcomeMenu(env) {
  const feats = await getFeatures(env);
  const pool = await getWelcomePool(env);
  const activeCount = pool.filter(p => p.enabled).length;

  const text =
    `👋 <b>RANDOM WELCOME MANAGER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• System Status: ${feats.welcome_system ? "🟢 ACTIVE" : "🔴 DISABLED"}\n` +
    `• Total Variants: <b>${pool.length}</b> (Active: <b>${activeCount}</b>)\n` +
    `• Dual Language: English & Hindi supported\n` +
    `• Placeholders: <code>{NAME}</code>, <code>{GROUP}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${feats.welcome_system ? "🔴 Disable" : "🟢 Enable"} Welcomes`, callback_data: "p:ftgl:welcome_system" },
        { text: "➕ Add Variant", callback_data: "p:rwelc:add_prompt" }
      ],
      [
        { text: "👁 Preview Random", callback_data: "p:rwelc:preview" },
        { text: "📜 Welcome History", callback_data: "p:rwelc:hist" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Submenu 8: Random Reply Manager
export async function renderRandomReplyMenu(env) {
  const feats = await getFeatures(env);
  const triggers = await getTriggersList(env);
  const activeCount = triggers.filter(t => t.enabled).length;

  const text =
    `🔁 <b>ADVANCED RANDOM REPLY ENGINE</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Engine Status: ${feats.repeat_replies ? "🟢 ACTIVE" : "🔴 DISABLED"}\n` +
    `• Total Triggers: <b>${triggers.length}</b> (Active: <b>${activeCount}</b>)\n` +
    `• Non-Repetition: <b>Guaranteed Per-User Cycle Persistence</b>\n` +
    `• KV Concurrency: Practical zero-repetition cycle on Cloudflare KV\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${feats.repeat_replies ? "🔴 Disable" : "🟢 Enable"} Replies`, callback_data: "p:ftgl:repeat_replies" },
        { text: "➕ Add Trigger", callback_data: "p:rreply:add_prompt" }
      ],
      [
        { text: "📋 View Triggers", callback_data: "p:rreply:list" },
        { text: "📜 Reply History", callback_data: "p:rreply:hist" }
      ],
      [
        { text: "🔙 Back to Home", callback_data: "p:main" }
      ]
    ]
  };
  return { text, reply_markup: keyboard };
}

// Existing Submenus preserved
export async function renderFeaturesMenu(env) {
  const feats = await getFeatures(env);
  const fKeys = [
    { key: "welcome_system", label: "Welcome System" },
    { key: "repeat_replies", label: "Random Replies" },
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
    { key: "anti_forward", label: "Anti-Forward Filter" },
    { key: "anti_bot", label: "Anti-Bot Protection" },
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
  buttons.push([{ text: "🔙 Back to Settings", callback_data: "p:settings" }]);

  const text =
    `🎛 <b>FEATURE CONTROLS (ON / OFF)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Tap any feature to toggle its operational state.\n` +
    `Persists automatically in Cloudflare KV.`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

export async function renderScheduledMenu(env, page = 1) {
  const { items, total, totalPages } = await getScheduledPostsByStatus(env, "all", page, 4);
  let text =
    `⏰ <b>SCHEDULED ANNOUNCEMENTS & POSTS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total In Queue: <b>${total}</b> (Page ${page}/${totalPages})\n\n`;

  if (items.length === 0) {
    text += `<i>No scheduled posts in queue.</i>\n`;
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

  const navRow = [];
  if (page > 1) navRow.push({ text: "⬅️ Prev", callback_data: `p:sched:p:${page - 1}` });
  if (page < totalPages) navRow.push({ text: "Next ➡️", callback_data: `p:sched:p:${page + 1}` });

  const keyboard = {
    inline_keyboard: [
      navRow.length > 0 ? navRow : [],
      [{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]
    ].filter(r => r.length > 0)
  };
  return { text, reply_markup: keyboard };
}

export async function renderAutomationMenu(env) {
  const auto = await getAutomationSettings(env);
  const text =
    `🤖 <b>AUTOMATION CENTER & BACKGROUND CRON</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Cron Frequency: <b>Every 1 Minute (* * * * *)</b>\n` +
    `• Daily Announcement: ${auto.daily_announcement_enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• Daily Scheduled Hour: <b>${auto.daily_announcement_hour_ist}:00 IST</b>\n` +
    `• Automatic Daily Backup: ${auto.auto_backup_enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
    `• Backup Retention: <b>${auto.backup_retention_days} Days</b>\n` +
    `• Last Daily Post Run: <i>${auto.last_daily_post_date || "Never"}</i>\n` +
    `• Last Auto Backup Run: <i>${auto.last_backup_date || "Never"}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${auto.daily_announcement_enabled ? "Disable" : "Enable"} Daily Post`, callback_data: "p:auto:toggle_daily" },
        { text: `${auto.auto_backup_enabled ? "Disable" : "Enable"} Auto Backup`, callback_data: "p:auto:toggle_backup" }
      ],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderAdminMenu(env) {
  const admins = await listAdmins(env);
  let text =
    `👮 <b>ADMINISTRATOR MANAGEMENT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Configured Admins: <b>${admins.length}</b>\n\n`;

  if (admins.length === 0) {
    text += `<i>Only Owner ID ${env.OWNER_ID} is registered.</i>\n`;
  } else {
    admins.forEach((a, i) => {
      text += `${i + 1}. User ID: <code>${a.id}</code> (Active: ${a.active ? "Yes" : "No"})\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Add Administrator", callback_data: "p:adm:prompt_add" },
        { text: "➖ Remove Admin", callback_data: "p:adm:prompt_rm" }
      ],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderTempManagerMenu(env) {
  const managers = await listTempManagers(env);
  let text =
    `⏳ <b>TEMPORARY MANAGERS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Active Managers: <b>${managers.length}</b>\n\n`;

  if (managers.length === 0) {
    text += `<i>No temporary managers active.</i>\n`;
  } else {
    managers.forEach((m, i) => {
      text += `${i + 1}. User ID: <code>${m.id}</code>\n   Expires: <i>${m.expires_ist}</i>\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Add Temp Manager", callback_data: "p:tm:prompt_add" }],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderStatsMenu(env) {
  const stats = await getStats(env);
  const activeMetrics = await getActiveUserMetrics(env);
  const daily = await getDailyStats(env);

  const text =
    `📊 <b>STATISTICS & ANALYTICS CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Total Users:</b> <code>${stats.total_users || 0}</code>\n` +
    `• <b>Est. Active Users (DAU):</b> <code>${activeMetrics.dau_estimate || 0}</code>\n` +
    `• <b>Messages Processed:</b> <code>${stats.messages_processed || 0}</code>\n` +
    `• <b>Commands Used:</b> <code>${stats.commands_used || 0}</code>\n` +
    `• <b>Channel Posts:</b> <code>${stats.channel_posts || 0}</code>\n` +
    `• <b>Welcomes Delivered:</b> <code>${stats.welcome_sent || 0}</code>\n` +
    `• <b>Random Replies:</b> <code>${stats.repeat_sent || 0}</code>\n` +
    `• <b>Moderation Actions:</b> <code>${stats.moderation_actions || 0}</code>\n` +
    `• <b>Today Messages (IST):</b> <code>${daily.messages_today || 0}</code>\n` +
    `• <b>API Errors:</b> <code>${stats.api_errors || 0}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📥 Export Analytics JSON", callback_data: "p:stats:export" }],
      [{ text: "🔙 Back to Dashboard", callback_data: "p:dash" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderLogsMenu(env) {
  const logs = await getActivityLogs(env, 8);
  let text = `📜 <b>RECENT ACTIVITY AUDIT LOGS</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  if (logs.length === 0) {
    text += `<i>No recent activity logged.</i>\n`;
  } else {
    logs.forEach(l => {
      text += `• <b>${escapeHtml(l.action)}</b> by <code>${l.actor}</code>\n  <i>${escapeHtml(l.detail || "")}</i>\n  ⏱ ${l.ist}\n\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  const keyboard = {
    inline_keyboard: [[{ text: "🔙 Back to Dashboard", callback_data: "p:dash" }]]
  };
  return { text, reply_markup: keyboard };
}

export async function renderSecurityMenu(env) {
  const diag = await getSecurityDiagnostics(env);
  const logs = await getSecurityLogs(env, 5);
  let text =
    `🛡 <b>SECURITY CENTER & DIAGNOSTICS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Bot Token:</b> ${diag.bot_token_configured ? "✅ Configured" : "❌ Missing"}\n` +
    `• <b>Webhook Secret:</b> ${diag.webhook_secret_configured ? "✅ Configured" : "❌ Missing"}\n` +
    `• <b>Owner ID:</b> ${diag.owner_id_configured ? "✅ Bound" : "❌ Unbound"}\n` +
    `• <b>Cloudflare KV:</b> ${diag.kv_bound ? "✅ Connected" : "❌ Unbound"}\n` +
    `• <b>Secret Protection:</b> ${diag.secret_exposure_protection}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Recent Security Events:</b>\n`;

  if (logs.length === 0) {
    text += `<i>No suspicious events recorded.</i>\n`;
  } else {
    logs.forEach(l => {
      text += `• <b>${escapeHtml(l.action)}:</b> <code>${l.actor}</code> (<i>${l.ist}</i>)\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔄 Register Webhook", callback_data: "p:sec:setup_webhook" },
        { text: "ℹ️ Webhook Info", callback_data: "p:sec:webhook_info" }
      ],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderHealthMenu(env) {
  const data = await runHealthCheck(env);
  const text = formatHealthHTML(data);
  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 Re-run Diagnostics", callback_data: "p:health" }],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderLanguageMenu(env) {
  const settings = await getSettings(env);
  const text =
    `🌐 <b>SYSTEM LANGUAGE CONFIGURATION</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Default System Language: <b>${settings.default_language === "hi" ? "🇮🇳 हिंदी (Hindi)" : "🇬🇧 English"}</b>\n\n` +
    `Tap below to toggle default system fallback:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `${settings.default_language === "en" ? "⭐ " : ""}English`, callback_data: "p:lang_set:en" },
        { text: `${settings.default_language === "hi" ? "⭐ " : ""}हिंदी (Hindi)`, callback_data: "p:lang_set:hi" }
      ],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderBackupMenu(env) {
  const history = await getBackupHistory(env);
  let text =
    `💾 <b>BACKUP & RESTORE CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Recorded Snapshots: <b>${history.length}</b>\n\n`;

  if (history.length === 0) {
    text += `<i>No backups recorded. Tap Export Backup to generate one.</i>\n`;
  } else {
    history.slice(0, 3).forEach(b => {
      text += `• <b>${b.id}</b>\n  ${b.details} (<i>${b.ist}</i>)\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📤 Export Backup JSON", callback_data: "p:bk:export" },
        { text: "📥 Import / Restore", callback_data: "p:bk:prompt_import" }
      ],
      [{ text: "🔙 Back to Settings", callback_data: "p:settings" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderNotificationMenu(env) {
  const notifs = await getNotificationSettings(env);
  const nList = [
    { key: "welcome_notifications", label: "New Member Joins" },
    { key: "error_alerts", label: "Runtime Error Alerts" },
    { key: "scheduled_post_published", label: "Scheduled Post Notice" },
    { key: "security_alerts", label: "Security & Abuse Alerts" }
  ];

  const buttons = [];
  nList.forEach(n => {
    buttons.push([
      { text: `${notifs[n.key] ? "🔔" : "🔕"} ${n.label}`, callback_data: `p:notif_tgl:${n.key}` }
    ]);
  });
  buttons.push([{ text: "🔙 Back to Settings", callback_data: "p:settings" }]);

  const text =
    `🔔 <b>OWNER NOTIFICATION PREFERENCES</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Configure automated direct messages delivered to the Owner:`;

  return { text, reply_markup: { inline_keyboard: buttons } };
}

export async function renderTemplatesMenu(env) {
  const tpls = await getTemplates(env);
  let text =
    `📝 <b>POST TEMPLATE LIBRARY</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Total Templates: <b>${Object.keys(tpls).length}</b>\n\n`;

  Object.entries(tpls).forEach(([name, content], i) => {
    text += `${i + 1}. <b>${escapeHtml(name)}</b>\n   <i>${escapeHtml(content.slice(0, 50))}...</i>\n\n`;
  });
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Create Template", callback_data: "p:tpl:add_prompt" }],
      [{ text: "🔙 Back to Channel Menu", callback_data: "p:chan" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderReportsMenu(env) {
  const reports = await getReportsList(env, "pending");
  let text =
    `🚨 <b>COMMUNITY REPORTS CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Pending Reports: <b>${reports.length}</b>\n\n`;

  if (reports.length === 0) {
    text += `<i>No pending reports awaiting moderation.</i>\n`;
  } else {
    reports.slice(0, 5).forEach(r => {
      text += `• <b>#${r.id}</b> | User: <code>${r.reported_user_id}</code>\n  Reason: <i>${escapeHtml(r.reason)}</i>\n\n`;
    });
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔙 Back to User Management", callback_data: "p:users" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderModerationMenu(env) {
  const settings = await getSettings(env);
  const text =
    `⚖️ <b>COMMUNITY MODERATION CENTER</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Warning Limit Before Ban: <b>${settings.warn_limit || 3}</b>\n` +
    `• Auto-Action on Max Warnings: <b>Permanent Ban</b>\n` +
    `• Default Mute Duration: <b>15 Minutes</b>\n` +
    `• Slow Mode Rate Limiting: <b>${settings.slow_mode_seconds > 0 ? settings.slow_mode_seconds + "s" : "Disabled"}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "⭐ Trusted Whitelist", callback_data: "p:mod:white" },
        { text: "⛔ Blacklist", callback_data: "p:mod:black" }
      ],
      [{ text: "🔙 Back to Group Menu", callback_data: "p:grp" }]
    ]
  };
  return { text, reply_markup: keyboard };
}

export async function renderPluginsMenu(env) {
  const plugins = await getPluginRegistryDetails(env);
  const text = formatPluginsSummaryHTML(plugins);
  const buttons = [];
  plugins.forEach(p => {
    buttons.push([
      { text: `${p.enabled ? "✅" : "❌"} ${p.name}`, callback_data: `p:plugin:tgl:${p.id}` }
    ]);
  });
  buttons.push([{ text: "🔙 Back to Settings", callback_data: "p:settings" }]);
  return { text, reply_markup: { inline_keyboard: buttons } };
}

// ============================================================
// 2. INCOMING MESSAGE HANDLER (Commands, States, Replies)
// ============================================================

export async function handleMessage(env, message) {
  const chatId = message.chat?.id;
  const from = message.from;
  const fromId = from?.id;
  const text = (message.text || message.caption || "").trim();
  const chatType = message.chat?.type || "private";
  const isPrivate = chatType === "private";

  if (!fromId) return;

  // Track global user activity & count
  await trackUserActivity(env, fromId);
  await incrementStat(env, "messages_processed");

  // Check blocked status
  if (await isUserBlocked(env, fromId)) {
    if (isPrivate) {
      await sendMessage(env, chatId, "⛔ <b>Access Restricted:</b> Your account is currently suspended from accessing this bot.");
    }
    return;
  }

  const feats = await getFeatures(env);
  const settings = await getSettings(env);
  const userLang = await getUserLanguage(env, fromId);

  // 1. Group Messages Moderation & Processing
  if (!isPrivate) {
    await handleGroupMessage(env, message);
  }

  // 2. Command Dispatching (All 100 Commands)
  if (text.startsWith("/")) {
    const wasHandled = await dispatchCommand(env, message);
    if (wasHandled) return;
  }

  // 3. Interactive State Handling (Private Chat Wizards)
  if (isPrivate) {
    const state = await getUserState(env, fromId);
    if (state && state.action) {
      // Abort
      if (text === "/cancel") {
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, "🚫 Operation aborted.");
        return;
      }

      // Add Channel State
      if (state.action === "add_channel") {
        await addChannel(env, text, `Channel ${text}`);
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ Channel <code>${escapeHtml(text)}</code> added to connected channels.`);
        return;
      }

      // Draft Post State
      if (state.action === "draft_channel_post") {
        let postObj = { type: "text", text: text };
        if (message.photo && message.photo.length > 0) {
          postObj = { type: "photo", photo: message.photo[message.photo.length - 1].file_id, text: message.caption || "" };
        } else if (message.video) {
          postObj = { type: "video", video: message.video.file_id, text: message.caption || "" };
        } else if (message.document) {
          postObj = { type: "document", document: message.document.file_id, text: message.caption || "" };
        }
        await setUserState(env, fromId, { action: "draft_preview", post: postObj });

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
        await sendMessage(env, chatId, `📝 <b>DRAFT PREVIEW:</b>\n\n${escapeHtml(postObj.text || "[Media Attached]")}`, { reply_markup: kb });
        return;
      }

      // Schedule Draft Time State
      if (state.action === "schedule_draft_post") {
        const parsedTime = parseDateIST(text);
        if (!parsedTime) {
          await sendMessage(env, chatId, "❌ Invalid IST date format. Please send in format: <code>YYYY-MM-DD HH:mm</code>\nExample: <code>2026-11-15 14:30</code>");
          return;
        }
        if (parsedTime < Date.now()) {
          await sendMessage(env, chatId, "⚠️ Scheduled time must be in the future. Please try again:");
          return;
        }
        const postData = state.draft || { type: "text", text: "Scheduled announcement" };
        postData.channel_id = settings.channel_id;
        postData.post_at = parsedTime;
        postData.post_at_ist = text + " IST";

        const res = await addScheduledPost(env, postData);
        await clearUserState(env, fromId);
        if (res.ok) {
          await sendMessage(env, chatId, `✅ Announcement <b>#${res.id}</b> successfully scheduled for <b>${text} IST</b>!`);
        } else {
          await sendMessage(env, chatId, `❌ Failed to schedule: ${res.error}`);
        }
        return;
      }

      // Add Admin State
      if (state.action === "add_admin") {
        const targetId = parseInt(text.trim(), 10);
        if (!targetId) {
          await sendMessage(env, chatId, "❌ Invalid numeric User ID.");
          return;
        }
        await addAdmin(env, targetId, {
          can_post_channel: true,
          can_manage_scheduled_posts: true,
          can_moderate_group: true,
          can_view_stats: true
        });
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ Administrator <code>${targetId}</code> successfully added.`);
        return;
      }

      // Remove Admin State
      if (state.action === "remove_admin") {
        const targetId = parseInt(text.trim(), 10);
        await removeAdmin(env, targetId);
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ Administrator <code>${targetId}</code> removed.`);
        return;
      }

      // Add Temp Manager State
      if (state.action === "add_temp_mgr") {
        const parts = text.trim().split(/\s+/);
        const targetId = parseInt(parts[0], 10);
        const mins = parseInt(parts[1], 10) || 60;
        if (!targetId) {
          await sendMessage(env, chatId, "❌ Invalid format. Send: <code>userId minutes</code>");
          return;
        }
        await addTempManager(env, targetId, mins);
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ User <code>${targetId}</code> granted temporary rights for <b>${mins} minutes</b>.`);
        return;
      }

      // Edit Message State
      if (state.action === "edit_message") {
        const check = validateSafeHtml(text);
        if (!check.valid) {
          await sendMessage(env, chatId, `❌ Invalid Telegram HTML: ${check.error}\nPlease send valid HTML:`);
          return;
        }
        await saveCustomMessage(env, state.lang || "en", state.key, text);
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ Message for <b>${escapeHtml(state.key)}</b> updated successfully!`);
        return;
      }

      // Set Setting State
      if (state.action === "set_setting") {
        const res = await updateSetting(env, state.key, text);
        await clearUserState(env, fromId);
        if (res.ok) {
          await sendMessage(env, chatId, `✅ Setting <b>${state.key}</b> updated to: <code>${escapeHtml(String(res.value))}</code>`);
        } else {
          await sendMessage(env, chatId, `❌ Invalid value: ${res.error}`);
        }
        return;
      }

      // Import Backup State
      if (state.action === "import_backup") {
        const res = await restoreBackup(env, text, fromId);
        await clearUserState(env, fromId);
        if (res.ok) {
          await sendMessage(env, chatId, `✅ <b>Backup Restored Successfully!</b>\nRestored Schema Version: <b>${res.version}</b>`);
        } else {
          await sendMessage(env, chatId, `❌ Restoration failed: ${res.error}`);
        }
        return;
      }

      // Create Template State
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

      // Search Member State
      if (state.action === "search_member") {
        const member = await searchMember(env, text);
        await clearUserState(env, fromId);
        if (!member) {
          await sendMessage(env, chatId, `❌ Member not found matching: <code>${escapeHtml(text)}</code>`);
        } else {
          const full = await getMemberFullProfile(env, settings.group_id || 0, member.id);
          const card = formatUserProfileHTML(full);
          await sendMessage(env, chatId, card);
        }
        return;
      }

      // Add Welcome Variant State
      if (state.action === "add_welcome_variant") {
        const res = await addWelcomeVariant(env, text, state.lang || "en");
        await clearUserState(env, fromId);
        if (res.ok) {
          await sendMessage(env, chatId, `✅ Welcome variant created (ID: <code>${res.id}</code>)!`);
        } else {
          await sendMessage(env, chatId, `❌ Failed to add variant: ${res.error}`);
        }
        return;
      }

      // Add Reply Trigger State
      if (state.action === "add_reply_trigger") {
        const parts = text.split("|").map(s => s.trim());
        if (parts.length < 2) {
          await sendMessage(env, chatId, "⚠️ Format: <code>keyword | reply text</code>");
          return;
        }
        const [keyword, repText] = parts;
        const trigRes = await addTrigger(env, keyword, "contains", 30);
        const { addReplyToTrigger } = await import("./modules/random-replies.js");
        await addReplyToTrigger(env, trigRes.id || `trig_${keyword}`, repText, "en");
        await clearUserState(env, fromId);
        await sendMessage(env, chatId, `✅ Trigger <b>/${escapeHtml(keyword)}/</b> configured!`);
        return;
      }
    }
  }

  // 4. Random Reply Engine Matching (Private and Group)
  if (feats.repeat_replies && !text.startsWith("/")) {
    const randomReply = await matchAndGetRandomReply(env, text, fromId, chatType);
    if (randomReply) {
      await sendMessage(env, chatId, randomReply);
      return;
    }

    // Fallback cooldown repeat reply if in private chat
    if (isPrivate) {
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
}

// ============================================================
// 3. CALLBACK QUERY ROUTER (8 Sections & Submodules)
// ============================================================

export async function handleCallback(env, query) {
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
    const layout = await getLayout(env, "help");
    const keyboard = buildTelegramKeyboard(layout);
    await editMessageText(env, chatId, messageId, helpMsg, { reply_markup: keyboard });
    await answerCallbackQuery(env, queryId);
    return;
  }

  if (data === "u:about") {
    const userLang = await getUserLanguage(env, fromId);
    const aboutMsg = await getMessage(env, userLang, "about");
    await editMessageText(env, chatId, messageId, aboutMsg, {
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
    const layout = await getLayout(env, "start");
    const keyboard = buildTelegramKeyboard(layout);
    await editMessageText(env, chatId, messageId, welcomeMsg, { reply_markup: keyboard });
    await answerCallbackQuery(env, queryId);
    return;
  }

  // ----------------------------------------------------
  // OWNER CONTROL PANEL CALLBACK ROUTING (Strict Auth)
  // ----------------------------------------------------
  if (data.startsWith("p:")) {
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

    // Main Panel Home Menu
    if (data === "p:main") {
      await clearUserState(env, fromId);
      const panel = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, panel.text, { reply_markup: panel.reply_markup });
      return;
    }

    // 1. Dashboard Section
    if (data === "p:dash" || data === "p:dash:refresh") {
      const v = await renderDashboardMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 2. Settings Section
    if (data === "p:settings") {
      const v = await renderSettingsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 3. User Management Section
    if (data === "p:users" || data.startsWith("p:usr:list:")) {
      const page = data.startsWith("p:usr:list:") ? parseInt(data.split(":")[3], 10) || 1 : 1;
      const v = await renderUserMenu(env, page);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 4. Group Management Section
    if (data === "p:grp") {
      const v = await renderGroupMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 5. Channel Management Section
    if (data === "p:chan") {
      const v = await renderChannelMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 6. Message Customisation Section
    if (data === "p:custom") {
      const v = await renderCustomisationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 7. Random Welcome Section
    if (data === "p:rwelc") {
      const v = await renderRandomWelcomeMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // 8. Random Reply Section
    if (data === "p:rreply") {
      const v = await renderRandomReplyMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Layout Manager Menu
    if (data === "p:layout" || data.startsWith("p:lay:edit:")) {
      const menuKey = data.startsWith("p:lay:edit:") ? data.split(":")[3] : "start";
      const layout = await getLayout(env, menuKey);
      const text = formatLayoutSummaryHTML(menuKey, layout);
      const kb = {
        inline_keyboard: [
          [
            { text: "✏️ Start Menu Layout", callback_data: "p:lay:edit:start" },
            { text: "✏️ Help Menu Layout", callback_data: "p:lay:edit:help" }
          ],
          [
            { text: "🔄 Reset Layout to Default", callback_data: `p:lay:reset:${menuKey}` },
            { text: "🔙 Back to Customisation", callback_data: "p:custom" }
          ]
        ]
      };
      await editMessageText(env, chatId, messageId, text, { reply_markup: kb });
      return;
    }

    if (data.startsWith("p:lay:reset:")) {
      const menuKey = data.split(":")[3];
      await resetLayout(env, menuKey);
      await answerCallbackQuery(env, queryId, "✅ Layout reset to default!");
      const layout = await getLayout(env, menuKey);
      const text = formatLayoutSummaryHTML(menuKey, layout);
      await editMessageText(env, chatId, messageId, text, {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Back to Layouts", callback_data: "p:layout" }]]
        }
      });
      return;
    }

    // BotFather Guide
    if (data === "p:bf_guide") {
      const text = formatBotFatherGuideHTML();
      await editMessageText(env, chatId, messageId, text, {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Back to Customisation", callback_data: "p:custom" }]]
        }
      });
      return;
    }

    // Feature Controls Toggle
    if (data === "p:feat") {
      const v = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data.startsWith("p:ftgl:")) {
      const featKey = data.split(":")[2];
      await toggleFeature(env, featKey);
      const v = await renderFeaturesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Scheduled Posts
    if (data === "p:sched" || data.startsWith("p:sched:p:")) {
      const page = data.startsWith("p:sched:p:") ? parseInt(data.split(":")[3], 10) || 1 : 1;
      const v = await renderScheduledMenu(env, page);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data.startsWith("p:sched:del:")) {
      const postId = data.split(":")[3];
      await cancelScheduledPost(env, postId);
      const v = await renderScheduledMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data.startsWith("p:sched:retry:")) {
      const postId = data.split(":")[3];
      await retryFailedScheduledPost(env, postId);
      const v = await renderScheduledMenu(env, 1);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Plugins Menu & Toggle
    if (data === "p:plugins") {
      const v = await renderPluginsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data.startsWith("p:plugin:tgl:")) {
      const pId = data.split(":")[3];
      await togglePlugin(env, pId);
      const v = await renderPluginsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Automation Menu
    if (data === "p:auto") {
      const v = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data === "p:auto:toggle_daily") {
      const auto = await getAutomationSettings(env);
      auto.daily_announcement_enabled = !auto.daily_announcement_enabled;
      await saveAutomationSettings(env, auto);
      const v = await renderAutomationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

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

    // Temp Managers Menu
    if (data === "p:tm") {
      const v = await renderTempManagerMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Statistics Menu
    if (data === "p:stats") {
      const v = await renderStatsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data === "p:stats:export") {
      const json = await exportAnalyticsJSON(env);
      await sendMessage(env, chatId, `📊 <b>ANALYTICS EXPORT:</b>\n\n<code>${json}</code>`);
      return;
    }

    // Activity Logs
    if (data === "p:logs") {
      const v = await renderLogsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Security Center
    if (data === "p:sec") {
      const v = await renderSecurityMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // System Health
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

    if (data.startsWith("p:lang_set:")) {
      const lang = data.split(":")[2];
      await updateSetting(env, "default_language", lang);
      const v = await renderLanguageMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Backup Center
    if (data === "p:backup") {
      const v = await renderBackupMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data === "p:bk:export") {
      const bkJson = await createFullBackup(env);
      await sendMessage(env, chatId, `💾 <b>BACKUP SNAPSHOT CREATED:</b>\n\n<code>${bkJson}</code>`);
      return;
    }

    // Notifications Menu
    if (data === "p:notif") {
      const v = await renderNotificationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    if (data.startsWith("p:notif_tgl:")) {
      const notifKey = data.split(":")[2];
      await toggleNotification(env, notifKey);
      const v = await renderNotificationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Templates Menu
    if (data === "p:tpls") {
      const v = await renderTemplatesMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Reports Menu
    if (data === "p:reports") {
      const v = await renderReportsMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Moderation Menu
    if (data === "p:mod") {
      const v = await renderModerationMenu(env);
      await editMessageText(env, chatId, messageId, v.text, { reply_markup: v.reply_markup });
      return;
    }

    // Reset Defaults Confirmation
    if (data === "p:reset") {
      const kb = {
        inline_keyboard: [
          [{ text: "⚠️ Yes, Reset All to Defaults", callback_data: "p:reset:confirm" }],
          [{ text: "🔙 Cancel", callback_data: "p:settings" }]
        ]
      };
      await editMessageText(env, chatId, messageId, "⚠️ <b>CONFIRM RESET:</b> Are you sure you want to restore default configuration?", { reply_markup: kb });
      return;
    }

    if (data === "p:reset:confirm") {
      await resetAllSettings(env);
      await sendMessage(env, chatId, "🔄 Configuration restored to initial defaults.");
      const panel = await renderMainPanel(env);
      await editMessageText(env, chatId, messageId, panel.text, { reply_markup: panel.reply_markup });
      return;
    }

    // Interactive Prompts
    if (data === "p:chan:add_prompt") {
      await setUserState(env, fromId, { action: "add_channel" });
      await sendMessage(env, chatId, "📢 <b>Add Channel:</b> Send the @username or numeric ID:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:chan:draft") {
      await setUserState(env, fromId, { action: "draft_channel_post" });
      await sendMessage(env, chatId, "📝 <b>Draft Announcement:</b> Send your text, photo, or video to preview:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:adm:prompt_add") {
      await setUserState(env, fromId, { action: "add_admin" });
      await sendMessage(env, chatId, "👮 <b>Add Admin:</b> Send the numeric User ID:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:adm:prompt_rm") {
      await setUserState(env, fromId, { action: "remove_admin" });
      await sendMessage(env, chatId, "👮 <b>Remove Admin:</b> Send numeric User ID:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:tm:prompt_add") {
      await setUserState(env, fromId, { action: "add_temp_mgr" });
      await sendMessage(env, chatId, "⏳ <b>Add Temp Manager:</b> Send: <code>userId minutes</code>\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data.startsWith("p:edit_msg:")) {
      const key = data.split(":")[2];
      await setUserState(env, fromId, { action: "edit_message", key: key, lang: "en" });
      await sendMessage(env, chatId, `✏️ <b>Edit Message (${key}):</b> Send your new message in HTML format:\n\n<i>Type /cancel to abort.</i>`);
      return;
    }

    if (data.startsWith("p:set:")) {
      const shortKey = data.split(":")[2];
      const keyMap = { chan_id: "channel_id", grp_id: "group_id", contact_user: "contact_username", cooldown: "repeat_cooldown_seconds" };
      const fullKey = keyMap[shortKey] || shortKey;
      await setUserState(env, fromId, { action: "set_setting", key: fullKey });
      await sendMessage(env, chatId, `⚙️ <b>Update Setting (${fullKey}):</b> Send the new value:\n\n<i>Type /cancel to abort.</i>`);
      return;
    }

    if (data === "p:bk:prompt_import") {
      await setUserState(env, fromId, { action: "import_backup" });
      await sendMessage(env, chatId, "📥 <b>Import / Restore Backup:</b> Paste JSON backup text in chat:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:tpl:add_prompt") {
      await setUserState(env, fromId, { action: "create_template" });
      await sendMessage(env, chatId, "📝 <b>Create Template:</b> Send name on line 1, then body on line 2+:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:mem:s") {
      await setUserState(env, fromId, { action: "search_member" });
      await sendMessage(env, chatId, "🔍 <b>Search Member:</b> Send numeric User ID or username:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:usr:bcast_prompt") {
      await setUserState(env, fromId, { action: "broadcast_users_prompt" });
      await sendMessage(env, chatId, "📡 <b>Broadcast to Users:</b> Send message text to broadcast to all registered bot users:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:rwelc:add_prompt") {
      await setUserState(env, fromId, { action: "add_welcome_variant" });
      await sendMessage(env, chatId, "👋 <b>Add Welcome Variant:</b> Send welcome text with {NAME} and {GROUP}:\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:rreply:add_prompt") {
      await setUserState(env, fromId, { action: "add_reply_trigger" });
      await sendMessage(env, chatId, "🔁 <b>Add Reply Trigger:</b> Send in format: <code>keyword | reply text</code>\n\n<i>Type /cancel to abort.</i>");
      return;
    }

    if (data === "p:rwelc:preview") {
      const preview = await getRandomWelcomeMessage(env, "Shiv Yogi", "The Endless Playback", "en");
      await sendMessage(env, chatId, `👁 <b>SAMPLE WELCOME PREVIEW:</b>\n\n${preview}`);
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
        "⏰ <b>Schedule Post Time:</b>\nSend publication date/time in Asia/Kolkata (IST):\n\nFormat: <code>YYYY-MM-DD HH:mm</code>\nExample: <code>2026-11-15 14:30</code>"
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

// ============================================================
// 4. CLOUDFLARE WORKER EXPORT (FETCH & CRON)
// ============================================================

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
      // 1. Automatic Schema Check
      await runV4Migration(env);

      // 2. Process Scheduled Post Queue
      await processScheduledQueue(env);

      // 3. Run Automation Routines (Daily posts, Backups, Expirations)
      await runAutomationCycle(env);
    } catch (cronErr) {
      console.error("Cron Handler Exception:", cronErr);
    }
  }
};
