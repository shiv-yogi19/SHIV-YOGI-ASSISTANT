# 📜 SHIV YOGI ASSISTANT — COMMAND REFERENCE

This document details all supported bot commands and provides the exact text to copy-paste into [@BotFather](https://t.me/BotFather) on Telegram.

---

## 1. 👤 Public User Commands

| Command | Arguments | Scope | Description |
| :--- | :--- | :--- | :--- |
| `/start` | None | Private | Start the bot, display the Unicode welcome greeting, channel links, and language options. |
| `/help` | None | All | Display the comprehensive command and usage guide. |
| `/about` | None | All | View bot architecture, hosting engine, version, and owner attribution. |
| `/contact` | None | Private | Display direct support links to reach the Owner (@shiv_yogi_19). |
| `/language` | None | Private | Open the interactive language selector (English / हिन्दी). |
| `/ping` | None | All | Test bot responsiveness, edge latency, and current IST time. |
| `/id` | None | All | Retrieve your numeric Telegram User ID and the current Chat ID. |

---

## 2. 👥 Community & Group Moderation Commands

These commands work inside configured Telegram groups/supergroups. Moderation commands require the sender to be the **Owner** or an **Admin** with `can_moderate_group` permission.

| Command | Arguments | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `/rules` | None | Anyone | Display the community rules and behavioral guidelines. |
| `/report` | Reply to message | Anyone | Alert group administrators regarding the replied message. |
| `/appeal` | `<reason>` | Anyone | Submit a formal appeal to the Owner if muted or restricted. |
| `/warn` | Reply or `<user_id>` | Admin / Owner | Issue an official warning. Reaching limit (default: 3) triggers automatic ban. |
| `/mute` | Reply or `<user_id> [mins]` | Admin / Owner | Temporarily restrict user from sending messages (default: 15 mins). |
| `/unmute` | Reply or `<user_id>` | Admin / Owner | Restore full speaking and media rights to a muted user. |
| `/ban` | Reply or `<user_id>` | Admin / Owner | Permanently remove and ban a user from the community group. |
| `/unban` | `<user_id>` | Admin / Owner | Remove ban restriction, allowing user to rejoin. |
| `/slowmode` | `[seconds]` | Admin / Owner | Guide or set message rate-limiting interval. |

---

## 3. 👑 Owner & Channel Commands

Strictly protected commands accessible only by the configured `OWNER_ID` (`8226363418`):

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `/panel` | None | Open the interactive Owner Control Dashboard with 18 submodules. |
| `/post` | `<text>` | Quick announcement publisher to primary channel. |
| `/schedule`| None | View scheduled and recurring post queue in real-time. |
| `/stats` | None | Display live bot metrics (DAU, messages, commands, posts). |
| `/backup` | None | Export a sanitized full JSON configuration backup directly to chat. |
| `/cancel` | None | Abort any active interactive prompt (message editing, setting input). |
| `/setwebhook`| None | Diagnostics and manual webhook registration guidance. |

---

## 4. 🤖 Copy-Paste for @BotFather (`/setcommands`)

Send `/setcommands` to [@BotFather](https://t.me/BotFather), choose `@shiv_yogi_assist_bot`, and paste the following block:

```text
start - Start bot and show welcome menu
help - View command guide and assistance
about - Bot information and architecture
contact - Contact official Owner support
language - Switch bot language (EN / HI)
rules - Display community guidelines
report - Report an inappropriate message
appeal - Submit a moderation appeal
panel - Owner Control Panel (Authorized Only)
stats - View bot performance analytics
schedule - View scheduled post queue
id - Show your Telegram User ID
ping - Check bot response time and IST
cancel - Cancel active interactive operation
```
