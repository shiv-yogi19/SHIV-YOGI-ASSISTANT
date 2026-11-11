# 👑 SHIV YOGI ASSISTANT — ADVANCED BOT UPGRADE (v2.0.0)

A high-performance, serverless, zero-dependency Telegram Channel and Community Management Bot running on **Cloudflare Workers**, **Cloudflare KV**, **GitHub**, and the **Telegram Bot API**.

[![Bot](https://img.shields.io/badge/Telegram-@shiv__yogi__assist__bot-blue?logo=telegram)](https://t.me/shiv_yogi_assist_bot)
[![Engine](https://img.shields.io/badge/Engine-Cloudflare%20Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![Storage](https://img.shields.io/badge/Storage-Cloudflare%20KV-brightgreen)](https://dash.cloudflare.com/)
[![Timezone](https://img.shields.io/badge/Timezone-Asia%2FKolkata-yellow)](#)

---

## 📌 Project Information

* **Bot Username:** [@shiv_yogi_assist_bot](https://t.me/shiv_yogi_assist_bot)
* **Owner Name:** Shiv Yogi
* **Owner Contact:** [@shiv_yogi_19](https://t.me/shiv_yogi_19)
* **Owner Telegram Numeric ID:** `8226363418`
* **Official Wallpaper Channel:** [The Endless Playback](https://t.me/the_endless_playback)
* **Official Discussion Community:** [The Endless Playback Chat](https://t.me/the_endless_playback_chat)
* **Default Timezone:** `Asia/Kolkata` (IST)
* **Repository:** [shiv-yogi19/SHIV-YOGI-ASSISTANT](https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT)
* **Live Worker URL:** `https://shiv-yogi-assistant.shivyogi-x19.workers.dev/`

---

## 📂 Project Architecture

```text
SHIV-YOGI-ASSISTANT/
├── worker.js                 # Central Cloudflare Worker entry point
├── content.json              # Default static content, messages & templates
├── config.example.json       # Example configuration schema
├── wrangler.toml             # Cloudflare Wrangler deployment configuration
├── package.json              # ES Module declaration and test scripts
├── README.md                 # Setup and deployment documentation
├── CHANGELOG.md              # Version and feature change history
├── FEATURES.md               # Complete directory of all bot features
├── COMMANDS.md               # Command reference and @BotFather block
├── SECURITY.md               # Zero-trust security and authorization model
└── modules/
    ├── helpers.js            # Telegram Bot API wrapper, KV, and date utils
    ├── security.js           # Auth guards, secret token, and dedup
    ├── channel-manager.js    # Multi-channel manager, post drafting, history
    ├── scheduled-posts.js    # Scheduling engine, recurrence, cron handler
    ├── group-manager.js      # Moderation, CAPTCHA, flood guard, appeals
    ├── admin-manager.js      # Admins, temporary managers, granular rights
    ├── automation.js         # Daily announcements, automated backups
    ├── statistics.js         # Metrics, DAU tracking, and JSON export
    └── backup.js             # Sanitized JSON backup export & restore
```

---

## 🚀 Setup & Cloudflare Deployment Guide

### Step 1: Push Code to GitHub
1. Commit and push all files to your GitHub repository:
   `https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT`
2. Obtain the Raw URL for `content.json`:
   `https://raw.githubusercontent.com/shiv-yogi19/SHIV-YOGI-ASSISTANT/main/content.json`

---

### Step 2: Create Cloudflare KV Namespace
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages → KV**.
3. Click **Create Namespace**, name it `BOT_DATA`, and click **Add**.
4. Note your KV Namespace ID.

---

### Step 3: Deploy Worker
#### Option A: Deploy via Wrangler CLI (Recommended)
```bash
# Update wrangler.toml with your KV ID
wrangler deploy
```

#### Option B: Deploy via Cloudflare Web Dashboard
1. Go to **Workers & Pages → Create Application → Create Worker**.
2. Name it `shiv-yogi-assistant`.
3. In **Settings → Variables & Secrets**, add the following:

| Name | Type | Value / Description |
| :--- | :--- | :--- |
| `BOT_TOKEN` | **Secret** | Your Bot Token from @BotFather |
| `WEBHOOK_SECRET` | **Secret** | A secure random string (e.g. `ShivYogiSecret_987654321_SecToken`) |
| `OWNER_ID` | **Variable** | `8226363418` |
| `GITHUB_CONTENT_URL` | **Variable** | The Raw URL of your `content.json` |

4. In **Settings → KV Namespace Bindings**:
   * **Variable name:** `BOT_DATA`
   * **KV namespace:** Choose `BOT_DATA`

---

### Step 4: Configure Cloudflare Cron Trigger (For Scheduled Posts)
1. Go to **Workers & Pages → shiv-yogi-assistant → Settings → Triggers**.
2. Under **Cron Triggers**, click **Add Cron Trigger**.
3. Set Cron Schedule:
   * **Every minute:** `* * * * *`
4. Click **Add Trigger**. The native `scheduled()` worker function will now automatically process scheduled and recurring posts.

---

### Step 5: Register Telegram Webhook
Run the following curl command in your terminal or browser:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://shiv-yogi-assistant.shivyogi-x19.workers.dev/",
       "secret_token": "<YOUR_WEBHOOK_SECRET>",
       "allowed_updates": ["message", "callback_query", "chat_member", "my_chat_member"],
       "drop_pending_updates": false
     }'
```

*Alternatively:* Send `/panel` in Telegram, navigate to **🛡 Security Center → Register Webhook** for one-tap automated setup.

---

## 🛡️ Telegram Permissions Checklist

### In Wallpaper Channel:
Make `@shiv_yogi_assist_bot` an **Administrator** with:
* ✅ Post Messages
* ✅ Edit Messages of Others
* ✅ Delete Messages of Others
* ✅ Pin Messages

### In Community Discussion Group:
Make `@shiv_yogi_assist_bot` an **Administrator** with:
* ✅ Delete Messages
* ✅ Ban Users
* ✅ Pin Messages
* ✅ Restrict Members (Required for CAPTCHA & Anti-Flood)
