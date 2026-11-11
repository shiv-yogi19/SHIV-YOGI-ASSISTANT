# 🚀 SHIV YOGI ASSISTANT — CHANGELOG

All notable changes and architectural upgrades are documented here.

---

## [2.0.0] — Advanced Channel & Community Management System (2026-11-11)

### 🌟 Major Upgrades & New Architecture
* **Modular ES Module Structure:** Refactored project into dedicated single-responsibility modules (`channel-manager.js`, `scheduled-posts.js`, `group-manager.js`, `admin-manager.js`, `automation.js`, `statistics.js`, `security.js`, `backup.js`, `helpers.js`).
* **Multi-Channel Management:** Added multi-channel support allowing multiple wallpaper channels alongside the primary channel (`The Endless Playback`).
* **Advanced Scheduling Engine:** Native Cloudflare Worker `scheduled()` cron handler supporting relative and exact date/time scheduling in **Asia/Kolkata (IST)** with recurrence (`daily`, `weekly`, `monthly`) and temporary failure retries.
* **Community CAPTCHA Button:** Added interactive new-member verification to prevent spambots from flooding the discussion group.
* **Sliding-Window Anti-Flood:** Replaced basic throttling with rolling velocity tracking in KV that automatically mutes flooding users for 5 minutes.
* **Configurable Admin & Temp Manager Permissions:** Owner can customize permissions for admins and temporary managers using interactive checkboxes.
* **Automation Center:** Added automated daily broadcast announcements, automatic KV daily snapshot backups, and scheduled unpin tasks.
* **Updated Identities:** Configured official Owner `@shiv_yogi_19`, channel `https://t.me/the_endless_playback`, and group `https://t.me/the_endless_playback_chat`.
* **System Health Dashboard:** Added live diagnostics covering worker health, KV binding, Telegram connectivity, and last cron execution IST.
* **Update Deduplication:** 120-second sliding-window update deduplication to eliminate Telegram retry duplicates.

---

## [1.0.0] — Initial Production Release (2026-11-10)
* Base Cloudflare Workers serverless deployment on Telegram Bot API.
* Owner Control Panel (`/panel`) with 18 submodules.
* Cloudflare KV (`BOT_DATA`) integration.
* GitHub raw `content.json` synchronization and fallbacks.
* Unicode styled welcome messages and repeat message cooldowns.
* Group link filter and word filter.
