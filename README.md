# 👑 SHIV YOGI ASSISTANT (v3.0.0)

[![Test Suite & Code Quality](https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT/actions/workflows/tests.yml/badge.svg)](https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT)
[![Engine: Cloudflare Workers](https://img.shields.io/badge/Engine-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com/)
[![Storage: Cloudflare KV](https://img.shields.io/badge/Storage-Cloudflare%20KV-blue.svg)](https://developers.cloudflare.com/kv/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Complete Production-Ready Telegram Bot for Channel Broadcasts & Community Management**  
> Architected on Cloudflare Workers (ES Modules) with zero external server dependencies, edge-distributed Cloudflare KV storage, 1-minute Cron automation, and deep security safeguards.

---

## 📌 Project Identity

- **Project Name:** SHIV YOGI ASSISTANT
- **Version:** `3.0.0`
- **Telegram Bot Username:** [@shiv_yogi_assist_bot](https://t.me/shiv_yogi_assist_bot)
- **Owner Name:** Shiv Yogi
- **Owner Telegram ID:** `8226363418`
- **Owner Contact:** [@shiv_yogi_19](https://t.me/shiv_yogi_19)
- **Official Wallpaper Channel:** [https://t.me/the_endless_playback](https://t.me/the_endless_playback)
- **Official Discussion Group:** [https://t.me/the_endless_playback_chat](https://t.me/the_endless_playback_chat)
- **Timezone:** `Asia/Kolkata` (IST)
- **Worker URL:** `https://shiv-yogi-assistant.shivyogi-x19.workers.dev/`
- **KV Binding:** `BOT_DATA` (`55e587063e784c8192292da4f653c7c1`)

---

## 🚀 Key Architectural Highlights

1. **Zero-Dependency Architecture:** Pure JavaScript ES Modules executing natively on Cloudflare Workers V8 edge runtimes.
2. **Free-Tier Compliant:** Designed specifically within Cloudflare's free-tier limits, utilizing KV key expiration (`expirationTtl`), capped list sizes, and batching to avoid resource bloat.
3. **Strict Concurrency Protection:** Lock-guarded scheduled queues and sliding-window rate limiters designed specifically for Cloudflare KV's eventual consistency model.
4. **Secret-Free Backups & Diagnostics:** All JSON exports and health reports strictly redact credentials (`BOT_TOKEN`, `WEBHOOK_SECRET`).
5. **Interactive State Machine:** 10-minute session TTL for multi-step prompts (drafting posts, adding admins, updating settings, scheduling dates in IST).

---

## 📂 Project Structure

```
SHIV-YOGI-ASSISTANT/
├── worker.js                 # Cloudflare Worker entry point (fetch & scheduled)
├── content.json              # Default localized messages, templates, and UI configuration
├── config.example.json       # Sanitized deployment configuration sample
├── package.json              # Project scripts and metadata
├── wrangler.toml             # Cloudflare Workers deployment configuration
├── README.md                 # Primary project guide and setup instructions
├── FEATURES.md               # Detailed feature specifications and implementations
├── COMMANDS.md               # Complete command reference & permission matrix
├── SECURITY.md               # Threat model, token validation, and security safeguards
├── CHANGELOG.md              # Historical version progression to v3.0.0
├── LICENSE                   # MIT License
│
├── modules/
│   ├── helpers.js            # Telegram API client, KV helpers, HTML escaping, IST dates
│   ├── security.js           # Secret token checks, dedup, permissions, suspicious callbacks
│   ├── settings.js           # Configuration persistence, feature toggles, validation
│   ├── channel-manager.js    # Multi-channel broadcasting, admin verification, drafts
│   ├── scheduled-posts.js    # Exact IST scheduling, daily/weekly/monthly recurring queue
│   ├── group-manager.js      # CAPTCHA verification, anti-flood, word filter, slowmode
│   ├── moderation.js         # Warnings, auto-actions, mute/unmute/ban, trusted whitelist
│   ├── reports.js            # User report submissions, duplicate prevention, admin notes
│   ├── member-manager.js     # User registration, profile search, activity metrics
│   ├── admin-manager.js      # Granular admin permissions & temporary manager lifecycles
│   ├── automation.js         # Daily wallpaper announcement, automated KV backups
│   ├── statistics.js         # System metrics, DAU estimation, analytics JSON export
│   ├── notifications.js      # Centralized alert dispatcher with per-event toggles
│   ├── templates.js          # Broadcast template library & variable interpolation
│   ├── backup.js             # Snapshot exporter, schema validation & safe restore
│   ├── health.js             # Real-time operational diagnostics (KV, Telegram API, Cron)
│   └── localization.js       # English & Hindi language engine, custom content editor
│
├── test/
│   ├── fixtures/
│   │   └── mock-telegram.js  # Strict Telegram Bot API mock and in-memory KV simulator
│   ├── audit.test.js         # Configuration, 64-byte callback length, state coverage
│   ├── integration.test.js   # End-to-end webhook, /start, panel, moderation, cron
│   ├── security.test.js      # Permission boundaries, secret tokens, HTML safety
│   ├── moderation.test.js    # Warnings, auto-bans, trusted protection, report workflows
│   ├── scheduling.test.js    # Multimedia scheduling, IST parser, retries, recurring
│   └── storage.test.js       # KV CRUD, malformed JSON resilience, backup validation
│
├── scripts/
│   └── check-syntax.js       # Cross-platform syntax checker verifying all JS files
│
└── .github/
    └── workflows/
        └── tests.yml         # CI workflow running syntax checks and test suite
```

---

## 🛠 Cloudflare & Deployment Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
  ```bash
  npm install -g wrangler
  ```
- Authenticate with Cloudflare:
  ```bash
  wrangler login
  ```

### 2. Configure Cloudflare Secrets

Sensitive credentials must **NEVER** be committed to source code or `wrangler.toml`. Set them securely using Wrangler secrets:

```bash
# Set your Telegram Bot Token (obtained from @BotFather)
wrangler secret put BOT_TOKEN

# Set a strong, random secret token for webhook verification
wrangler secret put WEBHOOK_SECRET
```

### 3. Verify KV Namespace Binding

Ensure your `wrangler.toml` references the existing KV namespace:

```toml
[[kv_namespaces]]
binding = "BOT_DATA"
id = "55e587063e784c8192292da4f653c7c1"
```

If deploying to a new Cloudflare account, generate a new KV namespace:
```bash
wrangler kv namespace create BOT_DATA
```

### 4. Deploy to Cloudflare Workers

Deploy the worker to the Cloudflare edge network:

```bash
wrangler deploy
```

### 5. Register Telegram Webhook

Once deployed, register your webhook with Telegram using the secret token:

```bash
curl -F "url=https://shiv-yogi-assistant.shivyogi-x19.workers.dev/" \
     -F "secret_token=YOUR_WEBHOOK_SECRET" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

Alternatively, message the bot `/setwebhook` in private chat as the Owner.

---

## 🧪 Running Tests Locally

All tests run locally using the built-in strict `MockTelegramApi` and `MockKV` without requiring live Telegram tokens:

```bash
# Run syntax validation across all files
npm run check

# Run complete test suite (all 6 test files)
npm test
```

---

## ⚙️ Cron Triggers & Scheduled Tasks

Cloudflare Workers automatically invoke the `scheduled(event, env, ctx)` handler every minute (`* * * * *` configured in `wrangler.toml`). The cron cycle performs:

1. **Queue Processor:** Scans `chan:scheduled_list` for due announcements (`post_at <= Date.now()`), publishes them to configured channels, handles recurring schedules (daily/weekly/monthly), and manages retries on failure.
2. **Daily Announcement Drop:** Automatically publishes the configured wallpaper announcement template at the designated IST hour.
3. **Automated Daily Backups:** Creates a full configuration snapshot in KV daily.
4. **Maintenance Sweep:** Automatically cleans expired temporary managers and stale session locks.
5. **Heartbeat Record:** Writes last execution timestamp with IST formatting to `cron:last_run`.

---

## 📜 BotFather Command List

Copy and paste this list directly into [@BotFather](https://t.me/BotFather) (`/setcommands`):

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

---

## 🛡 Security & Concurrency Summary

- **Owner-Only Control Panel:** Non-owners attempting `/panel` or sending `p:` callback data are strictly denied with security event logging.
- **Webhook Token Authentication:** Every incoming request must provide the exact `X-Telegram-Bot-Api-Secret-Token`.
- **Update Deduplication:** Updates are cached by `update_id` in KV with a 120-second TTL to avoid duplicate handling during Telegram retries.
- **KV Concurrency Protection:** Scheduler queue processing uses a short-lived concurrency lock (`cron:processing_lock`) with an automatic 30-second TTL.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — Created by Shiv Yogi.
