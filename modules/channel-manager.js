/**
 * MODULE: channel-manager.js
 * Multi-channel management, post publishing, drafting, templates, history, and admin verification.
 */

import {
  sendMessage,
  sendPhoto,
  sendVideo,
  sendDocument,
  pinChatMessage,
  unpinChatMessage,
  getChatMember,
  getChat,
  getMe,
  getSettings,
  saveSettings,
  getTemplates,
  escapeHtml,
  formatDateIST
} from "./helpers.js";
import { logSecurityEvent } from "./security.js";

export async function getChannelsList(env) {
  const settings = await getSettings(env);
  let channels = settings.channels;
  if (!Array.isArray(channels)) {
    channels = [];
    if (settings.channel_id) {
      channels.push({
        id: settings.channel_id,
        title: "Primary Channel",
        url: settings.wallpaper_channel_url || "",
        is_primary: true
      });
    }
  }
  return channels;
}

export async function addChannel(env, channelId, title, url = "") {
  const settings = await getSettings(env);
  if (!Array.isArray(settings.channels)) settings.channels = [];
  const cleanId = String(channelId).trim();
  const existing = settings.channels.find(c => c.id === cleanId);
  if (existing) {
    existing.title = title || existing.title;
    existing.url = url || existing.url;
  } else {
    settings.channels.push({
      id: cleanId,
      title: title || `Channel ${cleanId}`,
      url: url || "",
      is_primary: settings.channels.length === 0
    });
  }
  if (!settings.channel_id && settings.channels.length > 0) {
    settings.channel_id = settings.channels[0].id;
  }
  await saveSettings(env, settings);
  await logSecurityEvent(env, "owner", "channel_added", `Configured channel ${cleanId} (${title})`);
  return true;
}

export async function removeChannel(env, channelId) {
  const settings = await getSettings(env);
  if (!Array.isArray(settings.channels)) return false;
  settings.channels = settings.channels.filter(c => c.id !== String(channelId).trim());
  if (settings.channel_id === String(channelId).trim()) {
    settings.channel_id = settings.channels[0]?.id || "";
  }
  await saveSettings(env, settings);
  await logSecurityEvent(env, "owner", "channel_removed", `Removed channel ${channelId}`);
  return true;
}

export async function verifyChannelAdmin(env, channelId) {
  if (!channelId) return { ok: false, error: "Channel ID not configured" };
  const me = await getMe(env);
  if (!me.ok) return { ok: false, error: "Unable to retrieve bot user information" };
  const check = await getChatMember(env, channelId, me.result.id);
  if (!check.ok) return { ok: false, error: check.description || "Bot is not a member of this channel" };
  const status = check.result?.status;
  const isAdm = ["administrator", "creator"].includes(status);
  return {
    ok: isAdm,
    status: status,
    can_post_messages: check.result?.can_post_messages !== false,
    can_edit_messages: check.result?.can_edit_messages !== false,
    can_delete_messages: check.result?.can_delete_messages !== false,
    can_pin_messages: check.result?.can_pin_messages !== false
  };
}

export async function publishPost(env, channelId, postData, pin = false) {
  let res;
  const text = postData.text || postData.caption || "";
  const replyMarkup = postData.reply_markup || undefined;

  if (postData.type === "photo") {
    res = await sendPhoto(env, channelId, postData.media, text, { reply_markup: replyMarkup });
  } else if (postData.type === "video") {
    res = await sendVideo(env, channelId, postData.media, text, { reply_markup: replyMarkup });
  } else if (postData.type === "document") {
    res = await sendDocument(env, channelId, postData.media, text, { reply_markup: replyMarkup });
  } else {
    res = await sendMessage(env, channelId, text, { reply_markup: replyMarkup });
  }

  if (res.ok) {
    const pubId = res.result?.message_id;
    if (pin && pubId) {
      await pinChatMessage(env, channelId, pubId);
    }
    // Save to history
    await recordChannelPostHistory(env, channelId, pubId, text, pin, postData.type || "text");
  }
  return res;
}

export async function broadcastToAllChannels(env, postData, pin = false) {
  const channels = await getChannelsList(env);
  const results = [];
  for (const ch of channels) {
    if (!ch.id) continue;
    const r = await publishPost(env, ch.id, postData, pin);
    results.push({ channel_id: ch.id, title: ch.title, ok: r.ok, error: r.description });
  }
  return results;
}

export async function recordChannelPostHistory(env, channelId, messageId, text, pinned, type = "text") {
  try {
    const raw = await env.BOT_DATA.get("chan:history", "json");
    const hist = Array.isArray(raw) ? raw : [];
    hist.unshift({
      id: messageId,
      channel_id: channelId,
      text: (text || "").slice(0, 100),
      type: type,
      pinned: Boolean(pinned),
      date: new Date().toISOString()
    });
    if (hist.length > 20) hist.length = 20;
    await env.BOT_DATA.put("chan:history", JSON.stringify(hist));
  } catch (err) {
    console.error("Failed to write channel history:", err);
  }
}

export async function getChannelHistory(env) {
  const raw = await env.BOT_DATA.get("chan:history", "json");
  return Array.isArray(raw) ? raw : [];
}

export async function deleteChannelPost(env, channelId, messageId) {
  const r = await unpinChatMessage(env, channelId, messageId);
  const del = await deleteMessage(env, channelId, messageId);
  if (del.ok) {
    const hist = await getChannelHistory(env);
    const updated = hist.filter(h => !(String(h.id) === String(messageId) && String(h.channel_id) === String(channelId)));
    await env.BOT_DATA.put("chan:history", JSON.stringify(updated));
    await logSecurityEvent(env, "owner", "channel_post_deleted", `Deleted post ${messageId} in ${channelId}`);
  }
  return del;
}
