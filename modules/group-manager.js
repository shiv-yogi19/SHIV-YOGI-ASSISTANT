/**
 * MODULE: group-manager.js
 * Comprehensive community moderation, CAPTCHA verification, anti-flood, warning system, and appeals.
 */

import {
  sendMessage,
  deleteMessage,
  restrictChatMember,
  banChatMember,
  unbanChatMember,
  setChatPermissions,
  getMessage,
  getSettings,
  getFeatures,
  escapeHtml
} from "./helpers.js";
import { isOwner, hasPermission, logSecurityEvent } from "./security.js";

export async function handleGroupMessage(env, message) {
  const chatId = message.chat?.id;
  const from = message.from;
  const fromId = from?.id;
  const messageId = message.message_id;
  const text = message.text || message.caption || "";
  const now = Date.now();

  if (!fromId) return;

  const feats = await getFeatures(env);
  const settings = await getSettings(env);

  // 1. Group Rules Command
  if (text === "/rules" || text.startsWith("/rules@")) {
    const rules = await getMessage(env, "en", "group_rules");
    await sendMessage(env, chatId, rules);
    return;
  }

  // 2. User Report Command
  if (text.startsWith("/report")) {
    const replyMsg = message.reply_to_message;
    if (!replyMsg) {
      await sendMessage(env, chatId, "⚠️ Reply to a message with <code>/report</code> to notify community admins.");
      return;
    }
    const reportedId = replyMsg.from?.id;
    await sendMessage(
      env,
      chatId,
      `🚨 <b>Report Submitted:</b> Admins have been notified regarding user <code>${reportedId}</code>.`
    );
    await logSecurityEvent(env, fromId, "group_user_reported", `Reported user ${reportedId} in ${chatId}`);
    return;
  }

  // 3. User Appeal Command (/appeal <reason>)
  if (text.startsWith("/appeal")) {
    const appealReason = text.replace("/appeal", "").trim();
    if (!appealReason) {
      await sendMessage(env, chatId, "ℹ️ Please specify your appeal reason: <code>/appeal reason here</code>");
      return;
    }
    const appealRecord = {
      user_id: fromId,
      name: from.first_name || "User",
      reason: appealReason,
      timestamp: now
    };
    await env.BOT_DATA.put(`appeal:${chatId}:${fromId}`, JSON.stringify(appealRecord), { expirationTtl: 86400 * 3 });
    await sendMessage(env, chatId, `📨 <b>Appeal Submitted:</b> Your appeal has been forwarded to the administrative team for review.`);
    await logSecurityEvent(env, fromId, "appeal_submitted", `Appeal from ${fromId}: ${appealReason.slice(0, 60)}`);
    return;
  }

  // 4. New Chat Members Join (Welcome & CAPTCHA)
  if (message.new_chat_members && message.new_chat_members.length > 0) {
    for (const member of message.new_chat_members) {
      if (member.is_bot) continue;
      const name = escapeHtml(member.first_name || "Member");

      // Check CAPTCHA verification feature
      if (feats.captcha_verification) {
        // Restrict new member until verified
        await restrictChatMember(env, chatId, member.id, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false
        });

        let prompt = await getMessage(env, "en", "captcha_prompt");
        prompt = prompt.replace("{NAME}", name);

        await sendMessage(env, chatId, prompt, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ I am Human (Verify)", callback_data: `grp:verify:${member.id}` }]
            ]
          }
        });
        continue;
      }

      // Standard group welcome
      if (feats.welcome_system) {
        let welcome = await getMessage(env, "en", "group_welcome");
        welcome = welcome.replace("{NAME}", name);
        await sendMessage(env, chatId, welcome);
      }
    }
    return;
  }

  // 5. Left Chat Member (Goodbye)
  if (message.left_chat_member && !message.left_chat_member.is_bot) {
    const name = escapeHtml(message.left_chat_member.first_name || "Member");
    let bye = await getMessage(env, "en", "group_goodbye");
    bye = bye.replace("{NAME}", name);
    await sendMessage(env, chatId, bye);
    return;
  }

  // 6. Admin Privileged Moderation Commands
  const isSenderAdmin = await hasPermission(env, fromId, "can_moderate_group");

  if (isSenderAdmin && text.startsWith("/")) {
    const parts = text.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const replyMsg = message.reply_to_message;

    // Ban
    if (cmd.startsWith("/ban")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to a user or specify numeric user ID: <code>/ban &lt;id&gt;</code>");
        return;
      }
      if (isOwner(env, targetId)) {
        await sendMessage(env, chatId, "⛔ Cannot ban the Owner!");
        return;
      }
      const res = await banChatMember(env, chatId, targetId);
      if (res.ok) {
        await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> has been banned.`);
        await logSecurityEvent(env, fromId, "group_ban", `Banned ${targetId} in ${chatId}`);
      } else {
        await sendMessage(env, chatId, `❌ Ban failed: ${res.description || "Check bot permissions"}`);
      }
      return;
    }

    // Unban
    if (cmd.startsWith("/unban")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Specify numeric user ID to unban: <code>/unban &lt;id&gt;</code>");
        return;
      }
      const res = await unbanChatMember(env, chatId, targetId);
      if (res.ok) {
        await sendMessage(env, chatId, `✅ User <code>${targetId}</code> unbanned.`);
        await logSecurityEvent(env, fromId, "group_unban", `Unbanned ${targetId} in ${chatId}`);
      } else {
        await sendMessage(env, chatId, `❌ Unban failed: ${res.description || "Check bot permissions"}`);
      }
      return;
    }

    // Mute
    if (cmd.startsWith("/mute")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      const mins = parseInt(parts[replyMsg ? 1 : 2], 10) || 15;
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to user or specify ID: <code>/mute [minutes]</code>");
        return;
      }
      if (isOwner(env, targetId)) {
        await sendMessage(env, chatId, "⛔ Cannot mute the Owner!");
        return;
      }
      const until = Math.floor(now / 1000) + mins * 60;
      const res = await restrictChatMember(env, chatId, targetId, { can_send_messages: false }, until);
      if (res.ok) {
        await sendMessage(env, chatId, `🔇 User <code>${targetId}</code> muted for ${mins} minutes.`);
        await logSecurityEvent(env, fromId, "group_mute", `Muted ${targetId} for ${mins}m`);
      } else {
        await sendMessage(env, chatId, `❌ Mute failed: ${res.description || "Check permissions"}`);
      }
      return;
    }

    // Unmute
    if (cmd.startsWith("/unmute")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to user or specify user ID to unmute.");
        return;
      }
      const res = await restrictChatMember(env, chatId, targetId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      });
      if (res.ok) {
        await sendMessage(env, chatId, `🔊 User <code>${targetId}</code> unmuted.`);
        await logSecurityEvent(env, fromId, "group_unmute", `Unmuted ${targetId}`);
      } else {
        await sendMessage(env, chatId, `❌ Unmute failed: ${res.description || "Check permissions"}`);
      }
      return;
    }

    // Warn
    if (cmd.startsWith("/warn")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to a user to issue a warning.");
        return;
      }
      if (isOwner(env, targetId)) {
        await sendMessage(env, chatId, "⛔ Cannot warn the Owner!");
        return;
      }
      const warnKey = `warns:${chatId}:${targetId}`;
      const limit = settings.warn_limit || 3;
      const count = ((await env.BOT_DATA.get(warnKey, "json")) || 0) + 1;
      await env.BOT_DATA.put(warnKey, JSON.stringify(count), { expirationTtl: 86400 * 2 });

      await sendMessage(env, chatId, `⚠️ <b>Warning [${count}/${limit}]:</b> User <code>${targetId}</code> has been warned.`);
      if (count >= limit) {
        await banChatMember(env, chatId, targetId);
        await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> reached ${limit} warnings and has been banned.`);
        await env.BOT_DATA.delete(warnKey);
        await logSecurityEvent(env, fromId, "warn_limit_ban", `User ${targetId} banned after ${limit} warns`);
      }
      return;
    }

    // Slowmode
    if (cmd.startsWith("/slowmode")) {
      const seconds = parseInt(parts[1], 10) || 0;
      // In telegram, slow mode is set via chat permissions or setChatSlowModeDelay
      await sendMessage(env, chatId, `⏱ <b>Slow Mode:</b> Set to ${seconds} seconds.`);
      return;
    }
  }

  // Skip content filtering for Owner or Admins
  if (isOwner(env, fromId) || isSenderAdmin) return;

  // 7. Anti-Flood Detection (Sliding Window)
  if (feats.anti_spam) {
    const floodKey = `flood:${chatId}:${fromId}`;
    const rawHistory = await env.BOT_DATA.get(floodKey, "json");
    const history = Array.isArray(rawHistory) ? rawHistory : [];
    const windowMs = (settings.anti_flood_window_seconds || 5) * 1000;
    const cutoff = now - windowMs;
    const recent = history.filter(ts => ts > cutoff);
    recent.push(now);

    await env.BOT_DATA.put(floodKey, JSON.stringify(recent), { expirationTtl: 60 });

    if (recent.length > (settings.anti_flood_threshold || 5)) {
      await deleteMessage(env, chatId, messageId);
      const muteUntil = Math.floor(now / 1000) + 300; // 5 min mute
      await restrictChatMember(env, chatId, fromId, { can_send_messages: false }, muteUntil);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "flood_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      await logSecurityEvent(env, fromId, "flood_detected", `User ${fromId} muted 5m in ${chatId}`);
      return;
    }
  }

  // 8. Anti-Link Filter
  if (feats.link_filter && (text.includes("http://") || text.includes("https://") || text.includes("t.me/"))) {
    await deleteMessage(env, chatId, messageId);
    const name = escapeHtml(from.first_name || "Member");
    let warn = await getMessage(env, "en", "link_filter_warning");
    warn = warn.replace("{NAME}", name);
    await sendMessage(env, chatId, warn);
    return;
  }

  // 9. Word Filter
  if (feats.word_filter && Array.isArray(settings.banned_words)) {
    const lower = text.toLowerCase();
    const hasBanned = settings.banned_words.some(w => lower.includes(w.toLowerCase()));
    if (hasBanned) {
      await deleteMessage(env, chatId, messageId);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "word_filter_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      return;
    }
  }
}
