# 📖 SHIV YOGI ASSISTANT (v3.0.0) — COMMANDS REFERENCE

This document lists every command implemented in **SHIV YOGI ASSISTANT V3.0.0**, along with scope, usage examples, and required authorization levels.

---

## 🌐 Public Commands (Direct & Groups)

| Command | Scope | Description |
| :--- | :--- | :--- |
| `/start` | Private | Initializes the bot, registers user profile, and renders bilingual welcome with official community links. |
| `/help` | All | Displays command reference guide according to the user's selected language. |
| `/about` | All | Shows bot architecture, system details, owner contact, and edge runtime specifications. |
| `/contact` | All | Provides direct contact button to the bot Owner ([@shiv_yogi_19](https://t.me/shiv_yogi_19)). |
| `/language` | Private | Opens inline keyboard selector to switch user interface between English and Hindi. |
| `/ping` | All | Measures end-to-end network latency and responds with current IST timestamp. |
| `/id` | All | Displays the sender's Telegram User ID, Chat ID, and Message ID. |
| `/rules` | All | Displays the official community rules and guidelines for The Endless Playback. |

---

## 👥 Community & Group Moderation Commands

| Command | Permission Required | Usage & Description |
| :--- | :--- | :--- |
| `/report` | Any member | Reply to an offending message: `[reply] /report [reason]` to alert admins with anti-duplicate protection. |
| `/appeal` | Any member | In private or group: `/appeal <reason>` to submit a moderation appeal for administrative review. |
| `/warn` | Admin (`can_moderate_group`) | Reply to user or specify ID: `[reply] /warn [reason]`. Issues a warning; bans user when warning limit is reached. |
| `/mute` | Admin (`can_moderate_group`) | Reply to user or specify ID: `[reply] /mute [minutes]`. Restricts speaking permissions for the specified duration. |
| `/unmute` | Admin (`can_moderate_group`) | Reply to user or specify ID: `[reply] /unmute`. Restores speaking and media rights. |
| `/ban` | Admin (`can_moderate_group`) | Reply to user or specify ID: `[reply] /ban`. Removes user from the group and prevents rejoin. |
| `/unban` | Admin (`can_moderate_group`) | Specify user ID: `/unban <user_id>`. Removes ban restriction from the chat. |
| `/slowmode` | Admin (`can_moderate_group`) | Usage: `/slowmode <seconds>`. Configures bot-enforced delay between consecutive messages (0 disables). |

---

## 👑 Owner & Privileged Admin Commands

| Command | Authorization Required | Usage & Description |
| :--- | :--- | :--- |
| `/panel` | **Owner Only** (`8226363418`) | Opens the full interactive Owner Control Panel with inline navigation keyboards across 22 submodules. |
| `/post` | Admin (`can_post_channel`) | Usage: `/post <text>`. Publishes an instant announcement to the configured primary channel. |
| `/schedule` | Admin (`can_manage_scheduled_posts`) | Displays pending, published, and failed scheduled announcements with pagination. |
| `/stats` | Admin (`can_view_stats`) | Renders real-time message tallies, commands executed, daily IST metrics, and DAU estimates. |
| `/backup` | **Owner Only** (`8226363418`) | Exports a sanitized JSON snapshot of all KV settings, features, templates, and admins (credentials omitted). |
| `/cancel` | Owner / Admin | Aborts any active multi-step prompt or draft state in private chat. |
| `/setwebhook` | **Owner Only** (`8226363418`) | Registers the Cloudflare Worker URL with Telegram Bot API along with the secret token. |

---

## 📋 BotFather Registration List

```
about - Information and bot architecture
appeal - Submit community appeal if restricted
backup - Export bot configuration backup (Owner)
cancel - Cancel active multi-step operation
contact - Official owner contact and support
help - Command reference and assistance guide
id - Show your numeric Telegram ID
language - Switch interface language
mute - Mute user in community (Admin)
panel - Open interactive Owner Control Panel (Owner)
ping - Check system responsiveness and latency
post - Publish announcement to channel (Admin)
report - Report replied message to admins
rules - Read official community rules
schedule - Manage scheduled announcements (Admin)
setwebhook - Register Telegram webhook URL (Owner)
slowmode - Enforce chat slow mode delay (Admin)
start - Start bot and access main menu
stats - Real-time statistics and analytics (Admin)
unban - Unban user from community (Admin)
unmute - Unmute user in community (Admin)
warn - Issue moderation warning to user (Admin)
```
