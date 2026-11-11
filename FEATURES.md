# 🌟 SHIV YOGI ASSISTANT (v3.0.0) — FEATURES SPECIFICATION

This document details every feature implemented in **SHIV YOGI ASSISTANT V3.0.0**, its architectural implementation, and its real operational behavior.

---

## 1. 👑 Interactive Owner Control Panel (`/panel`)

- **Strict Access Control:** Accessible exclusively by Owner Telegram ID `8226363418`. Unauthorized users receive access denied alerts with security logging.
- **Callback Data Guard:** Every callback payload prefixed with `p:` independently verifies the caller's ID on the server side.
- **19 Interactive Sections:**
  1. **⚙️ Bot Settings:** Manage display names, contact handles, primary channel ID, group ID, channel URLs, repeat cooldowns, anti-flood thresholds, and warning limits.
  2. **🎛 Feature Controls:** Toggle 14 discrete feature flags atomically in KV.
  3. **📢 Channel Manager:** Audit bot permissions, draft posts, preview formatting, pin announcements, and broadcast to all connected channels.
  4. **👥 Group Manager:** View group configuration, toggle CAPTCHA verification, and control anti-spam.
  5. **⏰ Scheduled Posts:** Inspect scheduled queue with pagination, cancel pending posts, and trigger immediate retries on failed deliveries.
  6. **🤖 Automation Center:** Configure daily wallpaper announcement automation (IST hour check) and daily KV snapshots.
  7. **👮 Admin Control:** Appoint secondary administrators with granular permissions; remove admins.
  8. **⏳ Temporary Managers:** Appoint temporary managers with auto-expiration durations (e.g. 60m).
  9. **👋 Welcome Message Editor:** Edit English and Hindi welcome text with live HTML validation; restore defaults.
  10. **🔁 Repeat Message Editor:** Customize the automatic reply dispatched to private messages; restore defaults.
  11. **📊 Statistics & DAU:** View real-time counters, daily IST summaries, and export complete analytics in JSON format.
  12. **📜 Activity Logs:** Inspect the last 50 privileged administrative operations with IST timestamps.
  13. **🛡 Security Center:** Review token configuration, pending webhook updates, and inspect recent security incidents.
  14. **🏥 System Health:** Real-time diagnostics with live KV probes, Telegram API connectivity, and cron status.
  15. **🌐 Language Settings:** Switch bot default language between English and Hindi.
  16. **🔔 Notification Settings:** Toggle alerts for post success, post failures, member reports, security incidents, and backups.
  17. **📝 Template Library:** Create, edit, and preview reusable broadcast templates.
  18. **🚨 Reports Center:** Review community user reports, approve/reject violations, and log admin notes.
  19. **👤 Member Management:** Search member profiles, inspect warnings, and review activity history.
  20. **⚖️ Moderation Center:** Manage trusted user whitelists, blacklists, and review moderation action logs.
  21. **💾 Backup & Restore:** Export complete KV snapshot; safely restore backups with schema validation.
  22. **🔄 Reset Defaults:** Restore system defaults with confirmation prompt.
  23. **❌ Close Panel:** Safely dismisses the inline control interface.

---

## 2. 📢 Multi-Channel Management & Publishing

- **Multiple Channel Connections:** Supports multiple connected channels with designated primary channel (`is_primary`).
- **Bot Permission Auditing (`verifyChannelAdmin`):** Queries Telegram's `getChatMember` API to explicitly verify `can_post_messages`, `can_edit_messages`, `can_delete_messages`, and `can_pin_messages`.
- **Multimedia Publishing:** Supports text announcements, photos with captions, videos with captions, and documents.
- **Draft & Preview State Machine:** Posts can be sent as drafts to preview inline formatting before choosing to Publish Now, Publish & Pin, Schedule, or Discard.
- **Selective & Global Broadcasting:** Broadcast announcements to the primary channel or iterate through all connected channels.
- **Published Post History:** Stores last 25 channel publications in KV with message ID, type, pin status, and IST timestamp.
- **Remote Editing & Deletion:** Delete or unpin bot-published messages from channels via administrative actions.

---

## 3. ⏰ Scheduling Engine & Cron Queue Processor

- **Exact & Relative Timing:** Accepts timestamps in `YYYY-MM-DD HH:mm` format parsed into Asia/Kolkata (IST).
- **Recurring Intervals:** Supports `daily`, `weekly`, and `monthly` repeating posts. When a recurring post is published, the next interval is automatically calculated and queued.
- **Cloudflare Cron Processor:** Executes every minute (`* * * * *`) via Cloudflare Cron Triggers without requiring active user sessions.
- **Concurrency Locking:** Employs a short-lived lock in KV (`cron:processing_lock`, 30s TTL) to prevent overlapping cron runs.
- **Delivery Retries & Notification:** If publishing fails, retries up to 3 times (5-minute backoff). Exceeding max retries marks the post as failed and dispatches a failure notification to the Owner.

---

## 4. 👥 Community Moderation & Group Protection

- **Bilingual Welcome & Goodbye:** Sends customized greetings when users join or depart groups, with variable replacement (`{NAME}`).
- **Member CAPTCHA Verification:** Automatically restricts new members (`can_send_messages: false`) until they tap the verification button. Verification state is secured in KV with a 5-minute timeout.
- **Sliding-Window Anti-Flood:** Tracks timestamps of recent messages per user in KV with a sliding window. Exceeding the threshold automatically deletes the message and mutes the user for 5 minutes.
- **Unauthorized Link Filter:** Detects external URLs and Telegram invite links (`t.me/joinchat`, `t.me/+`). Whitelisted official domains (`t.me/the_endless_playback`, `t.me/the_endless_playback_chat`) are permitted.
- **Banned Word Filter:** Case-insensitive substring matching against customizable prohibited keywords.
- **Warning System & Auto-Ban:** Tracks warnings per user in KV (`warns:<chatId>:<userId>`). Automatically issues a ban when the configured limit (default: 3) is reached.
- **Bot-Enforced Slow Mode:** Rate-limits user messages within groups based on the configured slow-mode delay without modifying chat permissions.
- **Privilege Exemption:** Owner, appointed administrators, and users on the trusted whitelist are exempt from flood, link, and word filters.

---

## 5. 🚨 Report Management Center

- **Reply-to-Report Command:** Members report offending messages using `/report [reason]`.
- **Anti-Spam Duplicate Prevention:** Enforces a 24-hour deduplication key per reported message and reporter ID to prevent report flooding.
- **Admin Alerting:** Automatically alerts the Owner and authorized admins via the notification dispatcher.
- **Review Workflows:** Paginated review interface in the Owner Panel allowing admins to Approve, Reject, Resolve, or record internal notes.

---

## 6. 👤 Member Management & Profile Auditing

- **Automatic Registration:** Registers member profiles on interaction (`/start`, group activity).
- **Profile Stored Data:** Stores Telegram User ID, first name, username, first seen date (IST), last seen date (IST), and total message counts.
- **Privacy Compliance:** Stores only standard metadata provided by the Telegram Bot API. Does not claim access to phone numbers, emails, or hidden data.
- **User Lookup:** Search member records by numeric User ID or username.

---

## 7. 🛡 Security, Token Verification & Diagnostics

- **Secret-Token Webhook Verification:** Verifies the `X-Telegram-Bot-Api-Secret-Token` header on every incoming webhook POST.
- **Update Deduplication:** Dedupes incoming `update_id` values using KV with a 120-second TTL to avoid re-processing Telegram webhook retries.
- **Suspicious Callback Detection:** Blocks callbacks exceeding 64 bytes or privileged `p:` actions from unauthorized IDs.
- **Zero-Credential Exposure:** Bot tokens and webhook secrets are strictly excluded from diagnostics, activity logs, backups, and error messages.
- **Live System Health Probes:** Performs live read/write/delete probes on the `BOT_DATA` KV binding and queries `getMe` to verify operational status.
