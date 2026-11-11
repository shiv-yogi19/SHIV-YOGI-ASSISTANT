/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: group-manager.js
 * Community moderation engine: CAPTCHA verification, anti-flood sliding window,
 * link filtering, banned words, media restrictions, bot-enforced slowmode,
 * report workflows, and admin moderation commands.
 */

import {
  sendMessage,
  deleteMessage,
  restrictChatMember,
  banChatMember,
  unbanChatMember,
  answerCallbackQuery,
  editMessageText,
  safeKvGet,
  safeKvPut,
  safeKvDelete,
  escapeHtml,
  formatDateIST
} from "./helpers.js";
import { isOwner, hasPermission, logSecurityEvent } from "./security.js";
import { getSettings } from "./settings.js";
import { getFeatures } from "./settings.js";
import { getMessage } from "./localization.js";
import { warnUser, muteUser, unmuteUser, banUser, unbanUser, isTrustedUser } from "./moderation.js";
import { submitReport } from "./reports.js";
import { incrementStat } from "./statistics.js";

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

  // 1. Group Rules Command (/rules)
  if (text === "/rules" || text.startsWith("/rules@")) {
    const rules = await getMessage(env, "en", "group_rules");
    await sendMessage(env, chatId, rules);
    await incrementStat(env, "commands_used");
    return;
  }

  // 2. User Message Reporting (/report [reply])
  if (text.startsWith("/report")) {
    const replyMsg = message.reply_to_message;
    if (!replyMsg) {
      await sendMessage(env, chatId, "⚠️ Reply to a message with <code>/report</code> to notify community admins.");
      return;
    }
    const reportedId = replyMsg.from?.id;
    const reportedText = replyMsg.text || replyMsg.caption || "[Media message]";
    const repReason = text.replace(/^\/report(@\w+)?/i, "").trim() || "Spam / Community violation";

    const repRes = await submitReport(env, {
      chatId,
      reportedUserId: reportedId,
      reporterId: fromId,
      messageId: replyMsg.message_id,
      text: reportedText,
      reason: repReason
    });

    if (repRes.duplicate) {
      await sendMessage(env, chatId, `ℹ️ <b>Notice:</b> This message has already been submitted for admin review.`);
    } else {
      await sendMessage(
        env,
        chatId,
        `🚨 <b>Report Submitted:</b> Admins have been alerted regarding user <code>${reportedId}</code>.`
      );
      await incrementStat(env, "reports_received");
      await logSecurityEvent(env, fromId, "group_report_submitted", `Reported ${reportedId} in ${chatId}`);
    }
    return;
  }

  // 3. User Appeal Command (/appeal <reason>)
  if (text.startsWith("/appeal")) {
    const appealReason = text.replace(/^\/appeal(@\w+)?/i, "").trim();
    if (!appealReason) {
      await sendMessage(env, chatId, "ℹ️ Please specify your appeal reason: <code>/appeal reason here</code>");
      return;
    }
    const appealRecord = {
      user_id: String(fromId),
      name: from.first_name || "User",
      reason: appealReason,
      timestamp: now,
      ist: formatDateIST(now)
    };
    await safeKvPut(env, `appeal:${chatId}:${fromId}`, appealRecord, { expirationTtl: 86400 * 3 });
    await sendMessage(env, chatId, `📨 <b>Appeal Submitted:</b> Your appeal has been logged for review.`);
    await logSecurityEvent(env, fromId, "appeal_submitted", `Appeal from ${fromId}: ${appealReason.slice(0, 60)}`);
    return;
  }

  // 4. New Chat Members Join (Welcome & CAPTCHA)
  if (message.new_chat_members && message.new_chat_members.length > 0) {
    for (const member of message.new_chat_members) {
      if (member.is_bot) continue;
      const name = escapeHtml(member.first_name || "Member");

      if (feats.captcha_verification) {
        // Restrict new member until verified
        await restrictChatMember(env, chatId, member.id, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false
        });

        // Store captcha challenge state with 5-minute timeout
        const captchaKey = `captcha:${chatId}:${member.id}`;
        await safeKvPut(env, captchaKey, { created_at: now }, { expirationTtl: 300 });

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
        await incrementStat(env, "welcome_sent");
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

    // /ban
    if (cmd === "/ban" || cmd.startsWith("/ban@")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to a user or specify numeric user ID: <code>/ban &lt;id&gt;</code>");
        return;
      }
      const res = await banUser(env, chatId, targetId, "Admin /ban command", fromId);
      if (res.ok) {
        await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> has been banned.`);
        await incrementStat(env, "moderation_actions");
      } else {
        await sendMessage(env, chatId, `❌ Ban failed: ${res.description || res.error || "Check permissions"}`);
      }
      return;
    }

    // /unban
    if (cmd === "/unban" || cmd.startsWith("/unban@")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Specify numeric user ID to unban: <code>/unban &lt;id&gt;</code>");
        return;
      }
      const res = await unbanUser(env, chatId, targetId, fromId);
      if (res.ok) {
        await sendMessage(env, chatId, `✅ User <code>${targetId}</code> unbanned.`);
        await incrementStat(env, "moderation_actions");
      } else {
        await sendMessage(env, chatId, `❌ Unban failed: ${res.description || "Check permissions"}`);
      }
      return;
    }

    // /mute
    if (cmd === "/mute" || cmd.startsWith("/mute@")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      const mins = parseInt(parts[replyMsg ? 1 : 2], 10) || 15;
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to user or specify ID: <code>/mute [minutes]</code>");
        return;
      }
      const res = await muteUser(env, chatId, targetId, mins, "Admin /mute command", fromId);
      if (res.ok) {
        await sendMessage(env, chatId, `🔇 User <code>${targetId}</code> muted for ${mins} minutes.`);
        await incrementStat(env, "moderation_actions");
      } else {
        await sendMessage(env, chatId, `❌ Mute failed: ${res.description || res.error || "Check permissions"}`);
      }
      return;
    }

    // /unmute
    if (cmd === "/unmute" || cmd.startsWith("/unmute@")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to user or specify user ID to unmute.");
        return;
      }
      const res = await unmuteUser(env, chatId, targetId, fromId);
      if (res.ok) {
        await sendMessage(env, chatId, `🔊 User <code>${targetId}</code> unmuted.`);
        await incrementStat(env, "moderation_actions");
      } else {
        await sendMessage(env, chatId, `❌ Unmute failed: ${res.description || "Check permissions"}`);
      }
      return;
    }

    // /warn
    if (cmd === "/warn" || cmd.startsWith("/warn@")) {
      const targetId = replyMsg ? replyMsg.from?.id : parseInt(parts[1], 10);
      if (!targetId) {
        await sendMessage(env, chatId, "⚠️ Reply to a user to issue a warning: <code>/warn [reason]</code>");
        return;
      }
      const reason = parts.slice(replyMsg ? 1 : 2).join(" ") || "Community rule violation";
      const res = await warnUser(env, chatId, targetId, reason, fromId);
      if (res.ok) {
        await sendMessage(env, chatId, `⚠️ <b>Warning [${res.warnings}/${res.limit}]:</b> User <code>${targetId}</code> warned.\nReason: <i>${escapeHtml(reason)}</i>`);
        await incrementStat(env, "moderation_actions");
        if (res.autoAction === "banned") {
          await sendMessage(env, chatId, `🔨 User <code>${targetId}</code> reached the warning limit (${res.limit}) and has been banned.`);
        }
      } else {
        await sendMessage(env, chatId, `❌ Warning failed: ${res.error || "Unknown error"}`);
      }
      return;
    }

    // /slowmode [seconds]
    if (cmd === "/slowmode" || cmd.startsWith("/slowmode@")) {
      const sec = parseInt(parts[1], 10);
      if (isNaN(sec) || sec < 0) {
        await sendMessage(env, chatId, "⚠️ Specify slow mode duration in seconds (0 to disable): <code>/slowmode 30</code>");
        return;
      }
      settings.slow_mode_seconds = sec;
      await safeKvPut(env, "settings:config", settings);
      await sendMessage(env, chatId, `⏱ <b>Bot-Enforced Slow Mode:</b> Set to ${sec} seconds.`);
      return;
    }
  }

  // Exempt Owner, admins, and trusted users from group moderation filters
  if (isOwner(env, fromId) || isSenderAdmin || (await isTrustedUser(env, fromId))) {
    return;
  }

  // 7. Bot-Enforced Slow Mode Rate Limiter
  if (settings.slow_mode_seconds && settings.slow_mode_seconds > 0) {
    const slowKey = `slowmode:${chatId}:${fromId}`;
    const lastMsgTime = await safeKvGet(env, slowKey, "json");
    if (lastMsgTime && now - lastMsgTime < settings.slow_mode_seconds * 1000) {
      await deleteMessage(env, chatId, messageId);
      return;
    }
    await safeKvPut(env, slowKey, now, { expirationTtl: settings.slow_mode_seconds + 5 });
  }

  // 8. Anti-Flood Detection (Sliding Window)
  if (feats.anti_spam) {
    const floodKey = `flood:${chatId}:${fromId}`;
    const rawHistory = await safeKvGet(env, floodKey, "json");
    const history = Array.isArray(rawHistory) ? rawHistory : [];
    const windowMs = (settings.anti_flood_window_seconds || 5) * 1000;
    const cutoff = now - windowMs;
    const recent = history.filter(ts => ts > cutoff);
    recent.push(now);

    await safeKvPut(env, floodKey, recent, { expirationTtl: 60 });

    if (recent.length > (settings.anti_flood_threshold || 5)) {
      await deleteMessage(env, chatId, messageId);
      const muteUntil = Math.floor(now / 1000) + 300; // 5 min mute
      await restrictChatMember(env, chatId, fromId, { can_send_messages: false }, muteUntil);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "flood_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      await incrementStat(env, "moderation_actions");
      await logSecurityEvent(env, fromId, "flood_detected", `User ${fromId} muted 5m in ${chatId}`);
      return;
    }
  }

  // 9. Unauthorized Link Filtering
  if (feats.link_filter && (text.includes("http://") || text.includes("https://") || text.includes("t.me/"))) {
    // Check if the link matches official allowed domains
    const allowed = ["t.me/the_endless_playback", "t.me/the_endless_playback_chat"];
    const isAllowed = allowed.some(a => text.includes(a));

    if (!isAllowed) {
      await deleteMessage(env, chatId, messageId);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "link_filter_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      await incrementStat(env, "moderation_actions");
      return;
    }
  }

  // 10. Banned Word Filter
  if (feats.word_filter && Array.isArray(settings.banned_words)) {
    const lower = text.toLowerCase();
    const hasBanned = settings.banned_words.some(w => lower.includes(w.toLowerCase()));
    if (hasBanned) {
      await deleteMessage(env, chatId, messageId);
      const name = escapeHtml(from.first_name || "Member");
      let warn = await getMessage(env, "en", "word_filter_warning");
      warn = warn.replace("{NAME}", name);
      await sendMessage(env, chatId, warn);
      await incrementStat(env, "moderation_actions");
      return;
    }
  }
}

export async function handleCaptchaVerification(env, query) {
  const queryId = query.id;
  const from = query.from;
  const fromId = from?.id;
  const data = query.data || "";
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;

  // Format: grp:verify:<targetUserId>
  const parts = data.split(":");
  const targetId = parseInt(parts[2], 10);

  if (targetId && fromId !== targetId) {
    return await answerCallbackQuery(env, queryId, "❌ This verification button is not for you!", true);
  }

  // Unrestrict member
  await restrictChatMember(env, chatId, fromId, {
    can_send_messages: true,
    can_send_media_messages: true,
    can_send_other_messages: true,
    can_add_web_page_previews: true
  });

  // Cleanup captcha challenge key
  await safeKvDelete(env, `captcha:${chatId}:${fromId}`);

  await answerCallbackQuery(env, queryId, "✅ Verification successful! Welcome to the group.");
  await incrementStat(env, "captcha_verifications");

  const name = escapeHtml(from.first_name || "Member");
  let verifiedMsg = await getMessage(env, "en", "captcha_verified");
  verifiedMsg = verifiedMsg.replace("{NAME}", name);

  if (messageId) {
    await editMessageText(env, chatId, messageId, verifiedMsg, { reply_markup: { inline_keyboard: [] } });
  }

  return true;
}
