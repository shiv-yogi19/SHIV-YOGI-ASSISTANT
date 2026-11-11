/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: command-manager.js
 * Central Command Registry & Dispatcher
 *
 * Exactly 100 Unique Commands across 5 Categories:
 * 1. Bot & User Commands: 20
 * 2. Group Management Commands: 25
 * 3. Channel Management Commands: 20
 * 4. Owner & Admin Commands: 20
 * 5. Bot Customisation Commands: 15
 * TOTAL: EXACTLY 100 UNIQUE COMMANDS
 */

import { isOwner, hasPermission, logSecurityEvent } from "./security.js";
import { sendMessage, escapeHtml } from "./helpers.js";
import { incrementStat } from "./statistics.js";
import * as handlers from "./command-handlers.js";

/**
 * Command Definition Schema:
 * {
 *   name: string (without slash, lowercase, unique),
 *   description: string,
 *   category: "user" | "group" | "channel" | "admin" | "custom",
 *   permission: string | null, // null for public, "owner" for owner only, or granular permission key
 *   allowedChatTypes: string[], // ["private", "group", "supergroup", "channel"]
 *   handler: Function,
 *   enabled: boolean
 * }
 */

export const COMMAND_REGISTRY = new Map();

export function registerCommand(cmdDef) {
  if (!cmdDef || !cmdDef.name) {
    throw new Error("Invalid command definition: name is required");
  }
  const name = cmdDef.name.toLowerCase().trim().replace(/^\//, "");
  if (COMMAND_REGISTRY.has(name)) {
    throw new Error(`Duplicate command registration detected: /${name}`);
  }
  COMMAND_REGISTRY.set(name, {
    name,
    description: cmdDef.description || "",
    category: cmdDef.category || "user",
    permission: cmdDef.permission || null,
    allowedChatTypes: cmdDef.allowedChatTypes || ["private", "group", "supergroup"],
    handler: cmdDef.handler,
    enabled: cmdDef.enabled !== false
  });
}

// ============================================================
// 1. BOT & USER COMMANDS (EXACTLY 20 COMMANDS)
// ============================================================
registerCommand({
  name: "start",
  description: "Initialize bot, register profile, and render main menu",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdStart
});

registerCommand({
  name: "help",
  description: "Comprehensive command guide and usage reference",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdHelp
});

registerCommand({
  name: "about",
  description: "Bot specifications, architecture, and creator details",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdAbout
});

registerCommand({
  name: "contact",
  description: "Official contact button and support channel for the Owner",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdContact
});

registerCommand({
  name: "language",
  description: "Switch interface language between English and Hindi",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdLanguage
});

registerCommand({
  name: "ping",
  description: "Measure edge runtime latency and IST timestamp",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdPing
});

registerCommand({
  name: "id",
  description: "Display numeric Telegram User ID, Chat ID, and Message ID",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdId
});

registerCommand({
  name: "rules",
  description: "View community guidelines for The Endless Playback",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdRules
});

registerCommand({
  name: "info",
  description: "Detailed system, community, and runtime summary",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdInfo
});

registerCommand({
  name: "profile",
  description: "View your user profile, trust status, and message stats",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdProfile
});

registerCommand({
  name: "privacy",
  description: "Read data privacy policy and retention disclosures",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdPrivacy
});

registerCommand({
  name: "terms",
  description: "Read official community terms and usage rules",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdTerms
});

registerCommand({
  name: "status",
  description: "Check bot service operational status and health",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdStatus
});

registerCommand({
  name: "feedback",
  description: "Submit feedback or suggestions to bot administration",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdFeedback
});

registerCommand({
  name: "links",
  description: "Official wallpaper channel, discussion, and web portals",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdLinks
});

registerCommand({
  name: "faq",
  description: "Frequently Asked Questions about wallpapers & features",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdFaq
});

registerCommand({
  name: "time",
  description: "Display current Asia/Kolkata (IST) time and date",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdTime
});

registerCommand({
  name: "uptime",
  description: "Display bot engine version and edge availability",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdUptime
});

registerCommand({
  name: "version",
  description: "Display bot version (V4.0.0 Advanced Edition)",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdVersion
});

registerCommand({
  name: "cancel",
  description: "Cancel active interactive operation or draft prompt",
  category: "user",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdCancel
});

// ============================================================
// 2. GROUP MANAGEMENT COMMANDS (EXACTLY 25 COMMANDS)
// ============================================================
registerCommand({
  name: "warn",
  description: "Issue a moderation warning to a user (reply or ID)",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdWarn
});

registerCommand({
  name: "unwarn",
  description: "Decrement warnings or remove most recent warning",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdUnwarn
});

registerCommand({
  name: "warns",
  description: "Check active warning count and infractions for a user",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdWarns
});

registerCommand({
  name: "resetwarns",
  description: "Reset warning count to zero for a specific member",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdResetWarns
});

registerCommand({
  name: "mute",
  description: "Mute a user for specified minutes (default 15m)",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdMute
});

registerCommand({
  name: "unmute",
  description: "Restore speaking permissions to a muted member",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdUnmute
});

registerCommand({
  name: "ban",
  description: "Ban a user from the group community",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdBan
});

registerCommand({
  name: "unban",
  description: "Unban a user by numeric Telegram ID",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdUnban
});

registerCommand({
  name: "kick",
  description: "Remove member from group without permanent ban",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdKick
});

registerCommand({
  name: "slowmode",
  description: "Set bot slow mode delay in seconds (0 to disable)",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdSlowmode
});

registerCommand({
  name: "captcha",
  description: "Toggle CAPTCHA challenge for joining members",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdCaptcha
});

registerCommand({
  name: "antispam",
  description: "Toggle anti-flood and rapid message protection",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdAntispam
});

registerCommand({
  name: "antilink",
  description: "Toggle automatic external link filtering",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdAntilink
});

registerCommand({
  name: "antiforward",
  description: "Toggle restriction on forwarded channel posts in group",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdAntiforward
});

registerCommand({
  name: "antibot",
  description: "Toggle automatic banning of unauthorized user-added bots",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdAntibot
});

registerCommand({
  name: "wordfilter",
  description: "Toggle profanity and banned word enforcement",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdWordfilter
});

registerCommand({
  name: "filterword",
  description: "Add or remove a keyword from the group banned list",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdFilterword
});

registerCommand({
  name: "del",
  description: "Delete replied-to offending message instantly",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdDel
});

registerCommand({
  name: "purge",
  description: "Delete recent messages up to replied message",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdPurge
});

registerCommand({
  name: "pin",
  description: "Pin a replied message in the community chat",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdPin
});

registerCommand({
  name: "unpin",
  description: "Unpin a replied message or latest pin in group",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdUnpin
});

registerCommand({
  name: "report",
  description: "Submit replied message to community moderators",
  category: "group",
  permission: null,
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdReport
});

registerCommand({
  name: "appeal",
  description: "Submit a moderation appeal for admin review",
  category: "group",
  permission: null,
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdAppeal
});

registerCommand({
  name: "groupstats",
  description: "View moderation actions and chatter activity stats",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdGroupstats
});

registerCommand({
  name: "setrules",
  description: "Update community rules text for the current group",
  category: "group",
  permission: "can_moderate_group",
  allowedChatTypes: ["group", "supergroup"],
  handler: handlers.cmdSetrules
});

// ============================================================
// 3. CHANNEL MANAGEMENT COMMANDS (EXACTLY 20 COMMANDS)
// ============================================================
registerCommand({
  name: "post",
  description: "Publish an instant text announcement to primary channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdPost
});

registerCommand({
  name: "postphoto",
  description: "Publish photo announcement with caption to channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdPostphoto
});

registerCommand({
  name: "postvideo",
  description: "Publish video announcement with caption to channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdPostvideo
});

registerCommand({
  name: "postdoc",
  description: "Publish document or file announcement to channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdPostdoc
});

registerCommand({
  name: "schedule",
  description: "View pending, published, and failed scheduled posts",
  category: "channel",
  permission: "can_manage_scheduled_posts",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSchedule
});

registerCommand({
  name: "schedpost",
  description: "Schedule announcement for future IST date/time",
  category: "channel",
  permission: "can_manage_scheduled_posts",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSchedpost
});

registerCommand({
  name: "cancelsched",
  description: "Cancel a pending scheduled post by numeric ID",
  category: "channel",
  permission: "can_manage_scheduled_posts",
  allowedChatTypes: ["private"],
  handler: handlers.cmdCancelsched
});

registerCommand({
  name: "retrypost",
  description: "Retry publication of a failed scheduled post by ID",
  category: "channel",
  permission: "can_manage_scheduled_posts",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRetrypost
});

registerCommand({
  name: "channelstats",
  description: "View broadcast counts, subscriber info, and metrics",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdChannelstats
});

registerCommand({
  name: "channels",
  description: "List all connected broadcasting channels",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdChannels
});

registerCommand({
  name: "addchannel",
  description: "Connect a new channel by username or numeric ID",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAddchannel
});

registerCommand({
  name: "removechannel",
  description: "Disconnect a channel from broadcast registry",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRemovechannel
});

registerCommand({
  name: "setprimary",
  description: "Set a connected channel as the primary broadcast target",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetprimary
});

registerCommand({
  name: "checkchannel",
  description: "Audit bot administrator privileges in connected channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdCheckchannel
});

registerCommand({
  name: "channelhistory",
  description: "View recent channel publication history and IDs",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdChannelhistory
});

registerCommand({
  name: "delpost",
  description: "Delete a published message in primary channel by ID",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdDelpost
});

registerCommand({
  name: "editpost",
  description: "Edit text or caption of published channel message",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdEditpost
});

registerCommand({
  name: "pinchannel",
  description: "Pin a specific message in primary channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdPinchannel
});

registerCommand({
  name: "unpinchannel",
  description: "Unpin a specific message in primary channel",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdUnpinchannel
});

registerCommand({
  name: "broadcast",
  description: "Broadcast an announcement across all connected channels",
  category: "channel",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdBroadcast
});

// ============================================================
// 4. OWNER & ADMIN COMMANDS (EXACTLY 20 COMMANDS)
// ============================================================
registerCommand({
  name: "panel",
  description: "Open the 8-Section Master Owner Control Panel",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdPanel
});

registerCommand({
  name: "dashboard",
  description: "View real-time system metrics, DAU, and KV health",
  category: "admin",
  permission: "can_view_stats",
  allowedChatTypes: ["private"],
  handler: handlers.cmdDashboard
});

registerCommand({
  name: "stats",
  description: "Real-time message tallies, commands, and active users",
  category: "admin",
  permission: "can_view_stats",
  allowedChatTypes: ["private", "group", "supergroup"],
  handler: handlers.cmdStats
});

registerCommand({
  name: "backup",
  description: "Create and export full sanitized JSON configuration backup",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdBackup
});

registerCommand({
  name: "restore",
  description: "Import and apply a valid JSON configuration backup",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRestore
});

registerCommand({
  name: "setwebhook",
  description: "Register or refresh Cloudflare Worker webhook URL",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetwebhook
});

registerCommand({
  name: "webhookinfo",
  description: "Query active Telegram webhook configuration & status",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdWebhookinfo
});

registerCommand({
  name: "health",
  description: "Run system diagnostics: Worker, KV, Telegram API",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdHealth
});

registerCommand({
  name: "security",
  description: "View security diagnostics and recent security logs",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSecurity
});

registerCommand({
  name: "admins",
  description: "List all configured bot administrators & permissions",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAdmins
});

registerCommand({
  name: "addadmin",
  description: "Promote a user to bot admin with granular permissions",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAddadmin
});

registerCommand({
  name: "removeadmin",
  description: "Revoke administrator privileges from a user",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRemoveadmin
});

registerCommand({
  name: "tempmanager",
  description: "Grant time-limited management privileges in minutes",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdTempmanager
});

registerCommand({
  name: "revokemanager",
  description: "Revoke temporary manager privileges immediately",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRevokemanager
});

registerCommand({
  name: "logs",
  description: "View recent administrative and security audit events",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdLogs
});

registerCommand({
  name: "maintenance",
  description: "Toggle global emergency maintenance mode",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdMaintenance
});

registerCommand({
  name: "broadcastusers",
  description: "Send direct broadcast notification to all private users",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdBroadcastusers
});

registerCommand({
  name: "resetstats",
  description: "Reset message and command execution counters",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdResetstats
});

registerCommand({
  name: "clearcache",
  description: "Purge temporary cache keys and expired state records",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdClearcache
});

registerCommand({
  name: "restart",
  description: "Perform edge state refresh and verify environment health",
  category: "admin",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRestart
});

// ============================================================
// 5. BOT CUSTOMISATION COMMANDS (EXACTLY 15 COMMANDS)
// ============================================================
registerCommand({
  name: "customize",
  description: "Open the Bot Message & Customisation Center",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdCustomize
});

registerCommand({
  name: "setwelcome",
  description: "Update default or group welcome message text",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetwelcome
});

registerCommand({
  name: "setabout",
  description: "Update the /about info message text in KV",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetabout
});

registerCommand({
  name: "sethelp",
  description: "Update the /help reference guide text in KV",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSethelp
});

registerCommand({
  name: "setcontact",
  description: "Update the /contact support message text in KV",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetcontact
});

registerCommand({
  name: "setfooter",
  description: "Update global message footer text in KV",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdSetfooter
});

registerCommand({
  name: "layout",
  description: "Open the Advanced Button Layout Manager",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdLayout
});

registerCommand({
  name: "addbutton",
  description: "Add an interactive button to a menu layout",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAddbutton
});

registerCommand({
  name: "delbutton",
  description: "Remove a button from an interactive layout",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdDelbutton
});

registerCommand({
  name: "editbutton",
  description: "Edit text, URL, or action of an interactive button",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdEditbutton
});

registerCommand({
  name: "randomwelcome",
  description: "Open the Random Welcome Message Manager",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRandomwelcome
});

registerCommand({
  name: "addwelcome",
  description: "Add a new variant to random welcome pool",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAddwelcome
});

registerCommand({
  name: "randomreply",
  description: "Open the Advanced Random Reply Engine Manager",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdRandomreply
});

registerCommand({
  name: "addreply",
  description: "Add a trigger keyword and reply text to reply pool",
  category: "custom",
  permission: "owner",
  allowedChatTypes: ["private"],
  handler: handlers.cmdAddreply
});

registerCommand({
  name: "templates",
  description: "View and manage reusable post announcement templates",
  category: "custom",
  permission: "can_post_channel",
  allowedChatTypes: ["private"],
  handler: handlers.cmdTemplates
});

/**
 * Dispatch an incoming command message through the registry.
 */
export async function dispatchCommand(env, message) {
  const text = (message.text || message.caption || "").trim();
  if (!text.startsWith("/")) return false;

  const parts = text.split(/\s+/);
  const rawCmd = parts[0].toLowerCase();
  // Strip bot username if mentioned (e.g. /ping@shiv_yogi_assist_bot -> ping)
  const cmdName = rawCmd.split("@")[0].replace(/^\//, "");

  const command = COMMAND_REGISTRY.get(cmdName);
  if (!command) return false;

  const fromId = message.from?.id;
  const chatId = message.chat?.id;
  const chatType = message.chat?.type || "private";

  // 1. Check enabled status
  if (!command.enabled) {
    await sendMessage(env, chatId, `⚠️ Command <code>/${escapeHtml(cmdName)}</code> is currently disabled.`);
    return true;
  }

  // 2. Check allowed chat types
  if (!command.allowedChatTypes.includes(chatType)) {
    if (chatType !== "private" && command.allowedChatTypes.includes("private")) {
      await sendMessage(env, chatId, `ℹ️ <code>/${escapeHtml(cmdName)}</code> is only available in private chat with the bot.`);
      return true;
    }
    return false;
  }

  // 3. Permission checks
  if (command.permission === "owner") {
    if (!isOwner(env, fromId)) {
      await sendMessage(env, chatId, "⛔ <b>Access Denied:</b> This command is restricted to the bot Owner.");
      await logSecurityEvent(env, fromId, "unauthorized_command_attempt", `Attempted /${cmdName}`);
      return true;
    }
  } else if (command.permission) {
    const allowed = await hasPermission(env, fromId, command.permission);
    if (!allowed) {
      await sendMessage(env, chatId, `⛔ <b>Unauthorized:</b> You lack the required permission (<code>${command.permission}</code>).`);
      return true;
    }
  }

  // 4. Increment commands executed counter
  await incrementStat(env, "commands_used");

  // 5. Invoke command handler
  try {
    await command.handler(env, message, parts.slice(1));
  } catch (err) {
    console.error(`Error executing command /${cmdName}:`, err);
    await sendMessage(env, chatId, `⚠️ Error executing <code>/${escapeHtml(cmdName)}</code>: ${escapeHtml(err.message)}`);
  }

  return true;
}

export function getCommandsByCategory(category) {
  const result = [];
  for (const cmd of COMMAND_REGISTRY.values()) {
    if (cmd.category === category) result.push(cmd);
  }
  return result;
}

export function getAllCommands() {
  return Array.from(COMMAND_REGISTRY.values());
}
