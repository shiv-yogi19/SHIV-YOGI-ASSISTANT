# 🚀 SHIV YOGI ASSISTANT V4.0.0 – PRODUCTION DEPLOYMENT GUIDE

This document provides complete instructions for deploying and configuring **SHIV YOGI ASSISTANT V4.0.0 – ADVANCED EDITION** on Cloudflare Workers and Cloudflare KV.

---

## 📋 Deployment Summary

- **Bot Username:** [@shiv_yogi_assist_bot](https://t.me/shiv_yogi_assist_bot)
- **Worker Name:** `shiv-yogi-assistant`
- **Compatibility Date:** `2024-09-23`
- **KV Binding:** `BOT_DATA` (Namespace ID: `55e587063e784c8192292da4f653c7c1`)
- **Owner Telegram ID:** `8226363418`
- **Timezone:** `Asia/Kolkata` (IST, UTC+5:30)
- **Cron Trigger:** `* * * * *` (Every 1 minute)

---

## 🛠 Step-by-Step Deployment Instructions

### Step 1: Install Wrangler CLI & Login
Ensure Node.js (v20+) is installed, then install the Cloudflare Wrangler CLI:
```bash
npm install -g wrangler
```
Authenticate with your Cloudflare account:
```bash
wrangler login
```

---

### Step 2: Configure Secrets in Cloudflare Workers
Sensitive tokens must **never** be committed to Git or stored in `wrangler.toml`. Store them securely in Cloudflare's encrypted secret store:

```bash
# 1. Store your Telegram Bot Token (obtained from @BotFather)
wrangler secret put BOT_TOKEN
# Paste your bot token when prompted (e.g. 7123456789:AAH...)

# 2. Store a strong, random secret token for webhook verification
wrangler secret put WEBHOOK_SECRET
# Enter a secure string (16-64 alphanumeric characters, e.g. a4f8b9c2d1e0f3...)
```

---

### Step 3: Verify KV Namespace Configuration
Open [wrangler.toml](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/wrangler.toml) and verify that the KV binding matches your Cloudflare account:

```toml
name = "shiv-yogi-assistant"
main = "worker.js"
compatibility_date = "2024-09-23"

[vars]
OWNER_ID = "8226363418"
GITHUB_CONTENT_URL = "https://raw.githubusercontent.com/shiv-yogi19/SHIV-YOGI-ASSISTANT/main/content.json"

[[kv_namespaces]]
binding = "BOT_DATA"
id = "55e587063e784c8192292da4f653c7c1"

[triggers]
crons = ["* * * * *"]
```

*(If you are deploying to a brand-new KV namespace instead of the production one, create it with `wrangler kv namespace create BOT_DATA` and update the `id` in `wrangler.toml`).*

---

### Step 4: Deploy the Worker
Deploy the codebase to Cloudflare's worldwide edge network:
```bash
wrangler deploy
```

Upon successful deployment, Wrangler will print your live worker URL:
```
Uploaded shiv-yogi-assistant (x.xx sec)
Deployed shiv-yogi-assistant triggers (x.xx sec)
  https://shiv-yogi-assistant.<your-subdomain>.workers.dev
```

---

### Step 5: Register Telegram Webhook
Register your deployed Cloudflare Worker URL with Telegram using your `WEBHOOK_SECRET`:

```bash
curl -F "url=https://shiv-yogi-assistant.<your-subdomain>.workers.dev/" \
     -F "secret_token=<YOUR_WEBHOOK_SECRET>" \
     -F "allowed_updates=[\"message\",\"edited_message\",\"callback_query\",\"chat_member\",\"my_chat_member\"]" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

Telegram should respond with:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

#### Webhook Status Verification:
Check your registered webhook health at any time:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

---

### Step 6: Register Bot Commands in BotFather
To register all 100 unique slash commands into Telegram's auto-complete menu:
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/setcommands`.
3. Select `@shiv_yogi_assist_bot`.
4. Copy and paste the complete 100-command block found at the bottom of [COMMANDS.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/COMMANDS.md).

---

### Step 7: Post-Deployment Smoke Test
1. **Send `/start`** to `@shiv_yogi_assist_bot` in private chat. Verify the rich welcome greeting and interactive inline buttons render.
2. **Send `/ping`** to verify response latency and system status.
3. **Send `/panel`** as the Owner (`8226363418`). Verify that the 8-Section Master Owner Panel displays.
4. **Click `[📊 Dashboard]`** to verify real-time KV health and metric counters.
5. **Send `/migrate`** (or wait for the 1-minute cron) to ensure all V4 default layouts and pools are initialized.

---

## 🔍 Live Monitoring & Troubleshooting

### Real-Time Live Logs:
Stream live incoming requests, executions, and errors:
```bash
wrangler tail
```

### Common Issues & Solutions:

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **HTTP 403 Forbidden** | `WEBHOOK_SECRET` mismatch or missing header | Check that `secret_token` supplied to Telegram `setWebhook` exactly matches `wrangler secret put WEBHOOK_SECRET`. |
| **`/panel` Access Denied** | Telegram User ID is not `8226363418` | Only Owner ID `8226363418` can access `/panel`. Use `/id` to check your user ID. |
| **Scheduled Posts Not Firing** | Cron triggers disabled | Ensure `[triggers] crons = ["* * * * *"]` is in `wrangler.toml` and verify `cron:last_run` in KV. |
| **Button Click Ignored** | Callback payload exceeds 64 bytes | V4 compresses all callbacks to under 30 bytes. If custom buttons are added, verify length. |
