# 📖 SHIV YOGI ASSISTANT (v4.0.0) — COMPLETE 100 COMMANDS REFERENCE
**SHIV YOGI ASSISTANT V4.0.0 ADVANCED EDITION**
*Engineered for Cloudflare Workers (ES Modules) & Cloudflare KV*

This document provides the authoritative, exhaustive registry of **EXACTLY 100 UNIQUE TELEGRAM SLASH COMMANDS** across 5 functional categories. Every single command listed below is backed by a fully implemented, production-ready handler in `modules/command-handlers.js` and registered in `modules/command-manager.js`.

---

## 📊 Summary by Category
| Category | Total Commands | Scope | Authorization Level |
| :--- | :---: | :--- | :--- |
| **1. Bot & User Commands** | 20 | Private & Groups | Public (All Registered Users) |
| **2. Group Management Commands** | 25 | Groups & Supergroups | Public / Group Admins (`can_moderate_group`) |
| **3. Channel Management Commands** | 20 | Private & Admin Chat | Channel Admins (`can_post_channel`) |
| **4. Owner & Admin Commands** | 20 | Private Chat | **Bot Owner Only** (`8226363418`) / Super Admins |
| **5. Bot Customisation Commands** | 15 | Private Chat | **Bot Owner Only** (`8226363418`) |
| **TOTAL** | **100** | **All Supported Scopes** | **Strict Multi-Tier Access Control** |

---

## 🌐 1. Bot & User Commands (Exactly 20 Commands)

| # | Command | Scope | Permission Required | Usage & Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `/start` | Private / Groups | None (Public) | Initializes bot, registers user profile in KV, and displays interactive main menu. |
| 2 | `/help` | Private / Groups | None (Public) | Comprehensive bilingual command reference and user guidance. |
| 3 | `/about` | Private / Groups | None (Public) | Architecture overview, creator biography, and edge runtime details. |
| 4 | `/contact` | Private / Groups | None (Public) | Direct contact button to the bot Owner ([@shiv_yogi_19](https://t.me/shiv_yogi_19)). |
| 5 | `/language` | Private / Groups | None (Public) | Opens inline keyboard selector to switch between English and Hindi. |
| 6 | `/ping` | Private / Groups | None (Public) | Measures edge network round-trip latency and returns formatted IST time. |
| 7 | `/id` | Private / Groups | None (Public) | Displays sender's Telegram numeric User ID, Chat ID, and Message ID. |
| 8 | `/rules` | Private / Groups | None (Public) | Displays official community guidelines for The Endless Playback. |
| 9 | `/info` | Private / Groups | None (Public) | Detailed system identity, community links, and edge architecture summary. |
| 10 | `/profile` | Private / Groups | None (Public) | Displays your profile card, message counters, trust status, and language. |
| 11 | `/privacy` | Private / Groups | None (Public) | View data protection policies, retention disclosures, and privacy rights. |
| 12 | `/terms` | Private / Groups | None (Public) | View official community terms of service and acceptable usage guidelines. |
| 13 | `/status` | Private / Groups | None (Public) | Real-time operational health check across Worker, KV, and Telegram API. |
| 14 | `/feedback` | Private / Groups | None (Public) | `[text]` Submit suggestions or bug reports directly to the management team. |
| 15 | `/links` | Private / Groups | None (Public) | Official directory of wallpapers channel, chat group, and portals. |
| 16 | `/faq` | Private / Groups | None (Public) | Frequently Asked Questions regarding wallpapers, requests, and schedules. |
| 17 | `/time` | Private / Groups | None (Public) | Displays real-time Asia/Kolkata (IST, UTC+05:30) date and timestamp. |
| 18 | `/uptime` | Private / Groups | None (Public) | Displays edge serverless availability, uptime metrics, and version. |
| 19 | `/version` | Private / Groups | None (Public) | Displays current bot release (v4.0.0 Advanced Edition) and module specs. |
| 20 | `/cancel` | Private / Groups | None (Public) | Aborts any active multi-step interactive conversation prompt or wizard. |

---

## 👥 2. Group Management Commands (Exactly 25 Commands)

| # | Command | Scope | Permission Required | Usage & Description |
| :-: | :--- | :--- | :--- | :--- |
| 21 | `/warn` | Groups | Admin (`can_moderate_group`) | `[reply/id] [reason]` Issue an official infraction warning. Reaching limit triggers auto-ban. |
| 22 | `/unwarn` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Decrement warning counter by 1 for the target member. |
| 23 | `/warns` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Check current warning count and infractions for target user. |
| 24 | `/resetwarns` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Reset warnings to 0 for the specified community member. |
| 25 | `/mute` | Groups | Admin (`can_moderate_group`) | `[reply/id] [mins]` Restrict speaking rights for specified minutes (default 15m). |
| 26 | `/unmute` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Restore speaking, media, and link permissions to a muted user. |
| 27 | `/ban` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Ban member from group community and prevent re-joining. |
| 28 | `/unban` | Groups | Admin (`can_moderate_group`) | `<user_id>` Unban previously banned member by numeric Telegram ID. |
| 29 | `/kick` | Groups | Admin (`can_moderate_group`) | `[reply/id]` Remove member from group without permanent ban restriction. |
| 30 | `/slowmode` | Groups | Admin (`can_moderate_group`) | `<seconds>` Configure bot-enforced delay between consecutive messages (0 = off). |
| 31 | `/captcha` | Groups | Admin (`can_moderate_group`) | Toggle automated CAPTCHA button verification for new members. |
| 32 | `/antispam` | Groups | Admin (`can_moderate_group`) | Toggle sliding-window anti-flood detection and automated mute enforcement. |
| 33 | `/antilink` | Groups | Admin (`can_moderate_group`) | Toggle automated deletion of unauthorized external links and ads. |
| 34 | `/antiforward` | Groups | Admin (`can_moderate_group`) | Toggle restrictions preventing forwarded channel posts in discussion. |
| 35 | `/antibot` | Groups | Admin (`can_moderate_group`) | Toggle automated banning of unauthorized bot accounts added by users. |
| 36 | `/wordfilter` | Groups | Admin (`can_moderate_group`) | Toggle profanity and banned keyword auto-deletion filter. |
| 37 | `/filterword` | Groups | Admin (`can_moderate_group`) | `<word>` Add or remove a keyword from the community banned words filter. |
| 38 | `/del` | Groups | Admin (`can_moderate_group`) | `[reply]` Delete replied-to offending message and clean command. |
| 39 | `/purge` | Groups | Admin (`can_moderate_group`) | `[reply]` Delete batch of messages between replied target and command. |
| 40 | `/pin` | Groups | Admin (`can_moderate_group`) | `[reply]` Pin important message in community with optional notification. |
| 41 | `/unpin` | Groups | Admin (`can_moderate_group`) | `[reply]` Unpin replied message or top pinned message in group. |
| 42 | `/report` | Groups | Any Member | `[reply] [reason]` Report offending message to community moderators. |
| 43 | `/appeal` | All | Any Member | `<reason>` Submit formal appeal if restricted by community auto-moderation. |
| 44 | `/groupstats` | Groups | Admin (`can_moderate_group`) | View moderation action tallies, active limits, and group configurations. |
| 45 | `/setrules` | Groups | Admin (`can_moderate_group`) | `<HTML rules>` Update group community guidelines text directly in KV. |

---

## 📢 3. Channel Management Commands (Exactly 20 Commands)

| # | Command | Scope | Permission Required | Usage & Description |
| :-: | :--- | :--- | :--- | :--- |
| 46 | `/post` | Private | Admin (`can_post_channel`) | `<text>` Publish an instant formatted text announcement to primary channel. |
| 47 | `/postphoto` | Private | Admin (`can_post_channel`) | `<url> [caption]` Publish photo announcement with caption to channel. |
| 48 | `/postvideo` | Private | Admin (`can_post_channel`) | `<url> [caption]` Publish video announcement with caption to channel. |
| 49 | `/postdoc` | Private | Admin (`can_post_channel`) | `<url> [caption]` Publish file or document announcement to channel. |
| 50 | `/schedule` | Private | Admin (`can_manage_scheduled_posts`) | View paginated queue of pending, published, and failed scheduled posts. |
| 51 | `/schedpost` | Private | Admin (`can_manage_scheduled_posts`) | `YYYY-MM-DD HH:mm \| text` Schedule channel announcement for future IST time. |
| 52 | `/cancelsched` | Private | Admin (`can_manage_scheduled_posts`) | `<post_id>` Cancel a pending scheduled channel post. |
| 53 | `/retrypost` | Private | Admin (`can_manage_scheduled_posts`) | `<post_id>` Retry publication of a failed scheduled post. |
| 54 | `/channelstats` | Private | Admin (`can_post_channel`) | View publication metrics, post counts, and broadcast summaries. |
| 55 | `/channels` | Private | Admin (`can_post_channel`) | List all connected broadcasting channels with primary status. |
| 56 | `/addchannel` | Private | Admin (`can_post_channel`) | `<@username/-100id> [title]` Register new channel in bot database. |
| 57 | `/removechannel` | Private | Admin (`can_post_channel`) | `<channel_id>` Disconnect channel from bot registry. |
| 58 | `/setprimary` | Private | Admin (`can_post_channel`) | `<channel_id>` Designate connected channel as primary broadcast target. |
| 59 | `/checkchannel` | Private | Admin (`can_post_channel`) | `[@channel]` Audit bot administrator privileges and permissions in channel. |
| 60 | `/channelhistory`| Private | Admin (`can_post_channel`) | View audit log of recent channel publications and message IDs. |
| 61 | `/delpost` | Private | Admin (`can_post_channel`) | `<msg_id>` Delete a published post from the primary channel. |
| 62 | `/editpost` | Private | Admin (`can_post_channel`) | `<msg_id> <new_text>` Edit text or caption of published channel post. |
| 63 | `/pinchannel` | Private | Admin (`can_post_channel`) | `<msg_id>` Pin published announcement in primary channel. |
| 64 | `/unpinchannel` | Private | Admin (`can_post_channel`) | `[msg_id]` Unpin message in primary channel. |
| 65 | `/broadcast` | Private | Admin (`can_post_channel`) | `<text>` Broadcast announcement across all connected channels simultaneously. |

---

## 👑 4. Owner & Admin Commands (Exactly 20 Commands)

| # | Command | Scope | Permission Required | Usage & Description |
| :-: | :--- | :--- | :--- | :--- |
| 66 | `/panel` | Private | **Owner Only** (`8226363418`) | Open the 8-Section Master Owner Control Panel with inline navigation. |
| 67 | `/dashboard` | Private | Admin (`can_view_stats`) | View real-time system metrics, DAU, KV storage status, and recent activity. |
| 68 | `/stats` | Private / Groups | Admin (`can_view_stats`) | Real-time counters: messages processed, commands, active users, posts. |
| 69 | `/backup` | Private | **Owner Only** (`8226363418`) | Create and export full sanitized JSON configuration backup snapshot. |
| 70 | `/restore` | Private | **Owner Only** (`8226363418`) | Import and apply valid JSON backup snapshot with strict schema validation. |
| 71 | `/setwebhook` | Private | **Owner Only** (`8226363418`) | Register or refresh Cloudflare Worker webhook URL with Telegram API. |
| 72 | `/webhookinfo` | Private | **Owner Only** (`8226363418`) | Inspect active Telegram webhook URL, certificate, and pending updates. |
| 73 | `/health` | Private | **Owner Only** (`8226363418`) | Run end-to-end component diagnostics across Worker, KV, and Telegram API. |
| 74 | `/security` | Private | **Owner Only** (`8226363418`) | View secret exposure protection, diagnostics, and recent security logs. |
| 75 | `/admins` | Private | **Owner Only** (`8226363418`) | List all configured administrators, granular rights, and temporary managers. |
| 76 | `/addadmin` | Private | **Owner Only** (`8226363418`) | `<user_id>` Grant administrative management rights to specified user. |
| 77 | `/removeadmin`| Private | **Owner Only** (`8226363418`) | `<user_id>` Revoke administrative management rights from user. |
| 78 | `/tempmanager`| Private | **Owner Only** (`8226363418`) | `<user_id> <mins>` Grant time-limited moderation privileges with auto-expiry. |
| 79 | `/revokemanager`| Private | **Owner Only** (`8226363418`) | `<user_id>` Immediately revoke temporary manager privileges. |
| 80 | `/logs` | Private | **Owner Only** (`8226363418`) | View recent administrative audit events and security action logs. |
| 81 | `/maintenance` | Private | **Owner Only** (`8226363418`) | Toggle global emergency maintenance mode restricting non-owner usage. |
| 82 | `/broadcastusers`| Private | **Owner Only** (`8226363418`) | `<text>` Broadcast announcement directly to all registered bot users in private. |
| 83 | `/resetstats` | Private | **Owner Only** (`8226363418`) | Reset execution metrics and message analytics counters to zero. |
| 84 | `/clearcache` | Private | **Owner Only** (`8226363418`) | Purge temporary memory caches, GitHub content cache, and expired records. |
| 85 | `/restart` | Private | **Owner Only** (`8226363418`) | Perform soft edge runtime reload and verify environment binding health. |

---

## 🎨 5. Bot Customisation Commands (Exactly 15 Commands)

| # | Command | Scope | Permission Required | Usage & Description |
| :-: | :--- | :--- | :--- | :--- |
| 86 | `/customize` | Private | **Owner Only** (`8226363418`) | Open Message & UI Customisation Center to edit texts and layouts. |
| 87 | `/setwelcome` | Private | **Owner Only** (`8226363418`) | `<HTML text>` Update default bilingual welcome message in KV. |
| 88 | `/setabout` | Private | **Owner Only** (`8226363418`) | `<HTML text>` Update bot /about specifications and creator bio. |
| 89 | `/sethelp` | Private | **Owner Only** (`8226363418`) | `<HTML text>` Update /help reference guide content. |
| 90 | `/setcontact` | Private | **Owner Only** (`8226363418`) | `<HTML text>` Update /contact support instructions and links. |
| 91 | `/setfooter` | Private | **Owner Only** (`8226363418`) | `<text>` Update global branding footer appended to broadcasts. |
| 92 | `/layout` | Private | **Owner Only** (`8226363418`) | Open Advanced Button Layout Manager (1-4 per row, mixed layouts). |
| 93 | `/addbutton` | Private | **Owner Only** (`8226363418`) | `<menu> \| <id> \| <label> \| <target>` Add button to specified layout. |
| 94 | `/delbutton` | Private | **Owner Only** (`8226363418`) | `<menu> <button_id>` Remove interactive button from layout. |
| 95 | `/editbutton` | Private | **Owner Only** (`8226363418`) | `<menu> \| <id> \| <label> [\| target]` Edit button text, action, or URL. |
| 96 | `/randomwelcome`| Private | **Owner Only** (`8226363418`) | Open Random Welcome Message Manager to configure greeting pools. |
| 97 | `/addwelcome` | Private | **Owner Only** (`8226363418`) | `<text>` Add new variant to random welcome pool with `{NAME}` interpolation. |
| 98 | `/randomreply` | Private | **Owner Only** (`8226363418`) | Open Advanced Random Reply Engine Manager with zero-repetition cycle. |
| 99 | `/addreply` | Private | **Owner Only** (`8226363418`) | `<keyword> \| <reply>` Add keyword trigger and reply variant to reply pool. |
| 100 | `/templates` | Private | Admin (`can_post_channel`) | View, create, and manage reusable channel announcement templates. |

---

## 📋 BotFather Registration List (`/setcommands`)

Copy and paste the block below into **[@BotFather](https://t.me/BotFather)** under `/setcommands` to enable auto-completion for users:

```
start - Initialize bot and open main menu
help - Command reference and user guide
about - Bot architecture and creator details
contact - Official owner contact and support
language - Switch interface language (EN / HI)
ping - Check edge network latency & IST time
id - Show your numeric Telegram ID
rules - View community guidelines
info - System summary & community links
profile - View your user profile card
privacy - Read data privacy policy
terms - View community terms of service
status - Check bot operational status
feedback - Submit suggestions or feedback
links - Official channels & community links
faq - Frequently asked questions
time - Current Asia/Kolkata date and time
uptime - Edge availability & engine version
version - Version details (V4.0.0 Advanced)
cancel - Cancel active multi-step operation
report - Report replied message to moderators
appeal - Submit moderation appeal
warn - Issue warning to user (Admin)
unwarn - Remove warning from user (Admin)
warns - Check user warning count (Admin)
resetwarns - Reset user warnings to zero (Admin)
mute - Mute user in community (Admin)
unmute - Unmute user in community (Admin)
ban - Ban user from community (Admin)
unban - Unban user by ID (Admin)
kick - Kick user from community (Admin)
slowmode - Configure chat slow mode (Admin)
captcha - Toggle member CAPTCHA (Admin)
antispam - Toggle anti-flood protection (Admin)
antilink - Toggle link filter (Admin)
antiforward - Toggle forward filter (Admin)
antibot - Toggle anti-bot protection (Admin)
wordfilter - Toggle banned word filter (Admin)
filterword - Add/remove banned word (Admin)
del - Delete replied message (Admin)
purge - Delete recent message batch (Admin)
pin - Pin message in chat (Admin)
unpin - Unpin message in chat (Admin)
groupstats - View moderation statistics (Admin)
setrules - Update community rules (Admin)
post - Publish announcement to channel (Admin)
postphoto - Publish photo to channel (Admin)
postvideo - Publish video to channel (Admin)
postdoc - Publish document to channel (Admin)
schedule - View scheduled posts queue (Admin)
schedpost - Schedule channel post (Admin)
cancelsched - Cancel scheduled post (Admin)
retrypost - Retry failed post (Admin)
channelstats - Channel broadcast statistics (Admin)
channels - List connected channels (Admin)
addchannel - Connect channel to bot (Admin)
removechannel - Disconnect channel (Admin)
setprimary - Set primary broadcast channel (Admin)
checkchannel - Audit bot channel permissions (Admin)
channelhistory - Recent post publication logs (Admin)
delpost - Delete published channel post (Admin)
editpost - Edit published channel post (Admin)
pinchannel - Pin message in channel (Admin)
unpinchannel - Unpin message in channel (Admin)
broadcast - Broadcast across all channels (Admin)
panel - Master Owner Control Panel (Owner)
dashboard - Real-time metrics & DAU (Admin)
stats - Execution & message statistics (Admin)
backup - Export sanitized JSON backup (Owner)
restore - Import JSON configuration backup (Owner)
setwebhook - Register Telegram webhook URL (Owner)
webhookinfo - Inspect active webhook status (Owner)
health - Run system health diagnostics (Owner)
security - Security diagnostics & logs (Owner)
admins - List configured administrators (Owner)
addadmin - Promote user to administrator (Owner)
removeadmin - Revoke administrator rights (Owner)
tempmanager - Grant time-limited admin (Owner)
revokemanager - Revoke temporary manager (Owner)
logs - View administrative activity logs (Owner)
maintenance - Toggle maintenance mode (Owner)
broadcastusers - Broadcast to all users (Owner)
resetstats - Reset analytics counters (Owner)
clearcache - Purge system memory caches (Owner)
restart - Edge soft reload & diagnostics (Owner)
customize - Open UI Customisation Center (Owner)
setwelcome - Update start welcome message (Owner)
setabout - Update /about info message (Owner)
sethelp - Update /help guide message (Owner)
setcontact - Update /contact support message (Owner)
setfooter - Update global message footer (Owner)
layout - Button Layout Manager (Owner)
addbutton - Add button to menu layout (Owner)
delbutton - Remove button from layout (Owner)
editbutton - Edit button label or action (Owner)
randomwelcome - Random Welcome Manager (Owner)
addwelcome - Add welcome variant to pool (Owner)
randomreply - Random Reply Engine Manager (Owner)
addreply - Add keyword trigger & reply (Owner)
templates - Post announcement templates (Admin)
```
