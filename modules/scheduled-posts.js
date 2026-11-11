/**
 * MODULE: scheduled-posts.js
 * Comprehensive scheduling engine with Cron Trigger processor, media support, recurring posts, and retries.
 */

import { sendMessage, getSettings, getFeatures, escapeHtml, formatDateIST } from "./helpers.js";
import { publishPost, getChannelsList } from "./channel-manager.js";
import { logSecurityEvent } from "./security.js";

export async function getScheduledList(env) {
  const raw = await env.BOT_DATA.get("chan:scheduled_list", "json");
  return Array.isArray(raw) ? raw : [];
}

export async function saveScheduledList(env, list) {
  await env.BOT_DATA.put("chan:scheduled_list", JSON.stringify(list));
}

export async function addScheduledPost(env, {
  text,
  media_type = "text",
  media_id = null,
  channel_id = null,
  post_at,
  pin = false,
  recurring = null
}) {
  const list = await getScheduledList(env);
  const newPost = {
    id: Date.now(),
    text: text || "",
    media_type: media_type,
    media_id: media_id,
    channel_id: channel_id,
    post_at: post_at,
    pin: Boolean(pin),
    recurring: recurring, // "daily" | "weekly" | "monthly" | null
    status: "pending", // "pending" | "published" | "failed" | "cancelled"
    retries: 0,
    created_at: Date.now(),
    last_error: null
  };
  list.push(newPost);
  await saveScheduledList(env, list);
  await logSecurityEvent(env, "owner", "scheduled_post_added", `Scheduled post #${newPost.id} for ${formatDateIST(post_at)}`);
  return newPost;
}

export async function cancelScheduledPost(env, postId) {
  const list = await getScheduledList(env);
  const target = list.find(p => String(p.id) === String(postId));
  if (!target) return false;
  target.status = "cancelled";
  await saveScheduledList(env, list);
  await logSecurityEvent(env, "owner", "scheduled_post_cancelled", `Cancelled post #${postId}`);
  return true;
}

export async function retryFailedScheduledPost(env, postId) {
  const list = await getScheduledList(env);
  const target = list.find(p => String(p.id) === String(postId));
  if (!target) return false;
  target.status = "pending";
  target.post_at = Date.now(); // execute on next tick
  target.last_error = null;
  await saveScheduledList(env, list);
  return true;
}

export async function processScheduledQueue(env) {
  const list = await getScheduledList(env);
  if (list.length === 0) return { processed: 0, published: 0, errors: 0 };

  const now = Date.now();
  const settings = await getSettings(env);
  let processed = 0;
  let published = 0;
  let errors = 0;

  for (const post of list) {
    if (post.status === "pending" && post.post_at <= now) {
      processed++;
      const targetChannel = post.channel_id || settings.channel_id;

      if (!targetChannel) {
        post.status = "failed";
        post.last_error = "Target channel not configured";
        errors++;
        continue;
      }

      const postData = {
        type: post.media_type || "text",
        media: post.media_id,
        text: post.text,
        caption: post.text,
        reply_markup: settings.discussion_group_url ? {
          inline_keyboard: [[{ text: "💬 Discussion Group", url: settings.discussion_group_url }]]
        } : undefined
      };

      const res = await publishPost(env, targetChannel, postData, post.pin);

      if (res.ok) {
        post.status = "published";
        post.published_at = now;
        published++;

        // If recurring, schedule the next occurrence
        if (post.recurring) {
          let intervalMs = 24 * 60 * 60 * 1000; // daily default
          if (post.recurring === "weekly") intervalMs = 7 * 24 * 60 * 60 * 1000;
          if (post.recurring === "monthly") intervalMs = 30 * 24 * 60 * 60 * 1000;

          list.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            text: post.text,
            media_type: post.media_type,
            media_id: post.media_id,
            channel_id: post.channel_id,
            post_at: now + intervalMs,
            pin: post.pin,
            recurring: post.recurring,
            status: "pending",
            retries: 0,
            created_at: now,
            last_error: null
          });
        }
      } else {
        post.retries = (post.retries || 0) + 1;
        post.last_error = res.description || "Publishing failed";
        if (post.retries >= 3) {
          post.status = "failed";
          errors++;
          // Notify owner if notifications enabled
          const feats = await getFeatures(env);
          if (feats.notifications && env.OWNER_ID) {
            await sendMessage(
              env,
              env.OWNER_ID,
              `⚠️ <b>Scheduled Post Failed (#${post.id}):</b>\n\nChannel: <code>${targetChannel}</code>\nError: <code>${escapeHtml(post.last_error)}</code>`
            );
          }
        } else {
          // Retry in 5 minutes
          post.post_at = now + 5 * 60 * 1000;
        }
      }
    }
  }

  // Record heartbeat
  await env.BOT_DATA.put("cron:last_run", JSON.stringify({
    timestamp: now,
    iso: new Date(now).toISOString(),
    ist: formatDateIST(now),
    processed,
    published,
    errors
  }));

  // Retain only last 50 items in list to prevent KV bloat
  const activeAndRecent = list.slice(-50);
  await saveScheduledList(env, activeAndRecent);

  return { processed, published, errors };
}
