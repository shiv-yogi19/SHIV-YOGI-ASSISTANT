# ✨ SHIV YOGI ASSISTANT — COMPLETE FEATURE DIRECTORY (v2.0.0)

This document provides a comprehensive inventory of all features implemented in **SHIV YOGI ASSISTANT** and their operational mechanics.

---

## 1. 📢 Advanced Channel Manager
* **Multi-Channel Management:** Supports a primary channel (`The Endless Playback`) plus secondary channels stored in KV.
* **Permission Verification:** Proactively checks bot administrator status (`can_post_messages`, `can_edit_messages`, `can_delete_messages`, `can_pin_messages`).
* **Post Drafting & Preview Workflow:**
  * Draft an announcement in private chat.
  * Preview formatted HTML layout.
  * Interactive action buttons: `[ 🚀 Publish Now ]`, `[ 📌 Publish & Pin ]`, `[ ⏰ Schedule Post ]`, `[ 🗑 Discard Draft ]`.
* **Multi-Media Support:** Supports text posts, photos (`sendPhoto`), videos (`sendVideo`), and documents (`sendDocument`).
* **Post History & Deletion:** Logs the last 20 published posts with message IDs; allows one-click pinning or deletion directly from the panel.
* **Broadcast Mode:** Option to broadcast single announcements simultaneously to all configured channels.
* **Channel Join Community Invitation:** Detects channel joins via `chat_member` updates and delivers an invite to the official Discussion Group.

---

## 2. ⏰ Advanced Scheduled Post System
* **Timezone-Aware:** Default time processing calibrated for **Asia/Kolkata (IST)**.
* **Flexible Scheduling:** Schedule by relative minutes (e.g. `30`, `60`, `1440`) or exact date-time (`YYYY-MM-DD HH:mm`).
* **Recurring Posts:** Native support for recurring intervals:
  * `daily` (+24 hours)
  * `weekly` (+7 days)
  * `monthly` (+30 days)
* **Automatic Cloudflare Cron Processing:** Handled via native `scheduled()` worker handler triggered by Cloudflare Cron Triggers (`* * * * *`).
* **Fault-Tolerant Retries:** Automatically retries temporary Telegram failures up to 3 times before marking as failed and alerting the Owner.
* **Queue Management:** Cancel, review, or re-run scheduled tasks from the `/panel` dashboard.

---

## 3. 👥 Advanced Community & Group Manager
* **Interactive CAPTCHA Verification:** Restricts newly joined members from sending messages or media until they tap the `[ ✅ I am Human (Verify) ]` button.
* **Sliding-Window Anti-Flood:** Monitors user message velocities in groups (default: 5 messages in 5 seconds). Over-speed messages are deleted and the flooder is automatically muted for 5 minutes (`300s`).
* **External Link Filter:** Automatically detects and removes unauthorized URLs, Telegram invites, and external links from non-admins.
* **Custom Banned Word Filter:** Scans and eliminates profane, abusive, or crypto/scam keywords.
* **Warning Engine:** Issues warnings (`/warn`). When a member reaches the limit (default: 3 warnings), the bot executes an automatic ban.
* **Moderation Toolkit:** `/mute`, `/unmute`, `/ban`, `/unban`, `/slowmode`, `/rules`.
* **Member Appeal & Report System:**
  * `/report` notifies admins of flagged content.
  * `/appeal <reason>` logs member appeals for Owner review.

---

## 4. 🤖 Automation Center
* **Daily Automated Announcements:** Broadcasts scheduled morning wallpapers or updates at a configurable hour (e.g. `9:00 AM IST`) using custom templates.
* **Automated Daily Backups:** Generates automatic daily snapshots of settings, channels, and admin privileges stored in KV.
* **Automated Pin Management:** Supports unpinning announcements after specified durations.
* **Independent Controls:** Each automated task can be enabled or disabled independently.

---

## 5. 📊 Statistics & Analytics Dashboard
* **User Growth Tracking:** Total recorded users, new registrations, and returning users.
* **Activity Velocity (DAU):** Daily Active User estimates calculated via rolling date activity markers.
* **Message & Command Counters:** Exact atomic counts of processed messages, commands executed, channel broadcasts, and moderation penalties.
* **JSON Export:** Download full bot analytics in structured JSON format directly in Telegram.

---

## 6. 👮 Admin & Temporary Manager Control
* **Granular Role Permissions:**
  * `can_post_channel`
  * `can_moderate_group`
  * `can_view_stats`
  * `can_view_logs`
* **Temporary Managers:** Appoint temporary managers with custom durations (e.g. 60m, 24h, 7d). Privileges terminate immediately upon expiry.
* **Interactive Toggles:** Checkbox-style inline buttons to assign or revoke permissions on the fly.
* **Owner Sovereignty:** Admins can never access the Owner Control Panel or view bot tokens.

---

## 7. 📝 Message & Content Customizer
* **Live In-Chat Message Editor:** Edit Welcome greetings, Repeat replies, Contact messages, Group Rules, Captcha prompts, and Maintenance alerts.
* **Safe HTML Formatting:** Full support for `<b>`, `<i>`, `<code>`, and `<a>` hyperlinks.
* **One-Click Reset:** Instantly restore default content from GitHub `content.json`.
* **Template Storage:** Manage reusable announcement and wallpaper drop templates.

---

## 8. 🌐 Dual-Language Localization
* **Full Support:** English (`en`) and Hindi (`hi`).
* **Persistent User Preferences:** Users can switch their preferred language via `/language` or the welcome menu; preferences are saved in KV.
* **Localized Fallbacks:** Dynamic fallback ensures no missing strings.

---

## 9. 🏥 System Health & Monitoring
* **Diagnostics Dashboard:** Displays worker status, KV connectivity, Telegram API latency, and last cron execution IST timestamp.
* **Webhook Diagnostics:** Displays pending update counts, registered URL, and last error dates.
* **Emergency Maintenance Mode:** Allows the Owner to lock user interactions with a maintenance banner while retaining full control panel access.
