/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * MODULE: scheduled-posts.js
 * Scheduling engine: exact IST / relative scheduling, recurring intervals,
 * lock-protected cron queue processor, and delivery retries.
 */

import { sendMessage, safeKvGet, safeKvPut, escapeHtml, formatDateIST } from "./helpers.js";
import { publishPost } from "./channel-manager.js";
import { getSettings } from "./settings.js";
import { logSecurityEvent } from "./security.js";
import { sendNotification } from "./notifications.js";

export async function getScheduledList(env) {
  const raw = await safeKvGet(env, "chan:scheduled_list", "json");
  return Array.isArray(raw) ? raw : [];
}

export async function saveScheduledList(env, list) {
  await safeKvPut(env, "chan:scheduled_list", list);
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
    post_at_ist: formatDateIST(post_at),
    pin: Boolean(pin),
    recurring: recurring, // "daily" | "weekly" | "monthly" | null
    status: "pending", // "pending" | "published" | "failed" | "cancelled"
    retries: 0,
    created_at: Date.now(),
    created_ist: formatDateIST(Date.now()),
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

export async function deleteScheduledPost(env, postId) {
  const list = await getScheduledList(env);
  const updated = list.filter(p => String(p.id) !== String(postId));
  await saveScheduledList(env, updated);
  await logSecurityEvent(env, "owner", "scheduled_post_deleted", `Deleted post #${postId}`);
  return true;
}

export async function retryFailedScheduledPost(env, postId) {
  const list = await getScheduledList(env);
  const target = list.find(p => String(p.id) === String(postId));
  if (!target) return false;
  target.status = "pending";
  target.post_at = Date.now(); // execute on next tick
  target.post_at_ist = formatDateIST(Date.now());
  target.last_error = null;
  target.retries = 0;
  await saveScheduledList(env, list);
  return true;
}

export async function getScheduledPostsByStatus(env, status = "pending", page = 1, pageSize = 5) {
  const list = await getScheduledList(env);
  const filtered = status === "all" ? list : list.filter(p => p.status === status);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    items: paged,
    total: total,
    page: page,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function processScheduledQueue(env) {
  // Concurrency lock using KV with short TTL to prevent overlapping cron execution
  const lockKey = "cron:processing_lock";
  const isLocked = await safeKvGet(env, lockKey, "text");
  if (isLocked) {
    return { skipped: true, reason: "Queue processor already active" };
  }
  await safeKvPut(env, lockKey, "1", { expirationTtl: 30 });

  try {
    const list = await getScheduledList(env);
    if (list.length === 0) {
      await recordHeartbeat(env, 0, 0, 0);
      return { processed: 0, published: 0, errors: 0 };
    }

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
          await sendNotification(
            env,
            "scheduled_post_failure",
            "Scheduled Post Failed",
            `Post #${post.id} failed: Channel not configured.`
          );
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
          post.published_ist = formatDateIST(now);
          published++;

          await sendNotification(
            env,
            "scheduled_post_success",
            "Post Published Successfully",
            `Post #${post.id} published to <code>${targetChannel}</code>.`
          );

          // If recurring, calculate and append next run
          if (post.recurring) {
            let intervalMs = 24 * 60 * 60 * 1000; // daily
            if (post.recurring === "weekly") intervalMs = 7 * 24 * 60 * 60 * 1000;
            if (post.recurring === "monthly") intervalMs = 30 * 24 * 60 * 60 * 1000;

            const nextPostAt = now + intervalMs;
            list.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              text: post.text,
              media_type: post.media_type,
              media_id: post.media_id,
              channel_id: post.channel_id,
              post_at: nextPostAt,
              post_at_ist: formatDateIST(nextPostAt),
              pin: post.pin,
              recurring: post.recurring,
              status: "pending",
              retries: 0,
              created_at: now,
              created_ist: formatDateIST(now),
              last_error: null
            });
          }
        } else {
          post.retries = (post.retries || 0) + 1;
          post.last_error = res.description || "Publishing failed";

          if (post.retries >= 3) {
            post.status = "failed";
            errors++;
            await sendNotification(
              env,
              "scheduled_post_failure",
              "Scheduled Post Exceeded Max Retries",
              `Post #${post.id} failed after 3 attempts.\nError: <code>${escapeHtml(post.last_error)}</code>`
            );
          } else {
            // Re-schedule for retry in 5 minutes
            post.post_at = now + 5 * 60 * 1000;
            post.post_at_ist = formatDateIST(post.post_at);
          }
        }
      }
    }

    await recordHeartbeat(env, processed, published, errors);

    // Keep active and recent 50 posts
    const activeAndRecent = list.slice(-50);
    await saveScheduledList(env, activeAndRecent);

    return { processed, published, errors };
  } finally {
    // Release lock
    await env.BOT_DATA.delete(lockKey);
  }
}

async function recordHeartbeat(env, processed, published, errors) {
  const now = Date.now();
  await safeKvPut(env, "cron:last_run", {
    timestamp: now,
    iso: new Date(now).toISOString(),
    ist: formatDateIST(now),
    processed,
    published,
    errors
  });
}
