# 👑 SHIV YOGI ASSISTANT V4.0.0 – ADVANCED EDITION

[![Engine: Cloudflare Workers](https://img.shields.io/badge/Engine-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com/)
[![Storage: Cloudflare KV](https://img.shields.io/badge/Storage-Cloudflare%20KV-blue.svg)](https://developers.cloudflare.com/kv/)
[![Tests: 162 Passing](https://img.shields.io/badge/Tests-162%20Passing-brightgreen.svg)](test/)
[![Commands: Exactly 100](https://img.shields.io/badge/Commands-100%20Unique-purple.svg)](COMMANDS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Enterprise-Grade Telegram Management System Architected on Cloudflare Workers & Cloudflare KV.**  
> Powered by pure JavaScript ES Modules, zero external server dependencies, edge-distributed KV storage, 1-minute Cron automation, and deep security safeguards.

---

## 📌 Project Identity & Metadata

- **Project Name:** SHIV YOGI ASSISTANT V4.0.0 – ADVANCED EDITION
- **Version:** `4.0.0`
- **Telegram Bot Username:** [@shiv_yogi_assist_bot](https://t.me/shiv_yogi_assist_bot)
- **Owner Name:** Shiv Yogi
- **Owner Telegram ID:** `8226363418`
- **Owner Contact:** [@shiv_yogi_19](https://t.me/shiv_yogi_19)
- **Official Channel:** [https://t.me/the_endless_playback](https://t.me/the_endless_playback)
- **Official Discussion Group:** [https://t.me/the_endless_playback_chat](https://t.me/the_endless_playback_chat)
- **Timezone:** `Asia/Kolkata` (IST, UTC+5:30)
- **Hosting Engine:** Cloudflare Workers (`shiv-yogi-assistant`)
- **Storage:** Cloudflare KV (`BOT_DATA`, namespace ID: `55e587063e784c8192292da4f653c7c1`)
- **Compatibility Date:** `2024-09-23`
- **Repository:** [https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT](https://github.com/shiv-yogi19/SHIV-YOGI-ASSISTANT)

---

## 🚀 Key V4.0.0 Architecture Highlights

1. **Exactly 100 Unique Slash Commands:**
   - 20 Bot & User Commands
   - 25 Group Management Commands
   - 20 Channel Management Commands
   - 20 Owner & Admin Commands
   - 15 Bot Customisation Commands
   - Every command possesses a real, production-ready handler, strict permission enforcement, and chat-type constraints in [modules/command-manager.js](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/modules/command-manager.js).

2. **Owner Panel with Exactly 8 Main Home Sections:**
   - `📊 Dashboard` – System status, DAU metrics, real-time counters, KV health, error logs.
   - `⚙️ Bot Settings` – Maintenance mode, language toggles, anti-flood thresholds, webhook info.
   - `👥 User Management` – Member registry, paginated search, ban/unban, profile inspection, direct broadcast.
   - `🛡️ Group Management` – CAPTCHA gates, anti-bot shields, anti-link filters, slow mode, warnings.
   - `📢 Channel Management` – Broadcast publisher, scheduled announcements queue, template picker.
   - `🎨 Message Customisation` – Start greetings, help text, footers, localized Hindi/English templates.
   - `👋 Random Welcome Manager` – Multi-variant greetings, group pools, HTML validator, `{NAME}` / `{GROUP}` variables.
   - `🤖 Random Reply Manager` – Per-user KV cycle tracking, zero immediate repetition until pool exhaustion, automatic reshuffle.

3. **Advanced Button Layout Manager:**
   - Supports 1, 2, 3, 4 buttons per row, custom columns, mixed layouts, and nested submenus.
   - Stable internal action IDs decoupled from user-facing text labels.
   - Strict 64-byte Telegram `callback_data` limitation enforcement.
   - Complete JSON layout import/export functionality with full schema validation.

4. **Modular Plugin Architecture:**
   - Extensible plugin system ([modules/plugin-manager.js](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/modules/plugin-manager.js)) allowing dynamic registration, runtime toggles, and hot updates without redeploying.

5. **Automated Migration & Safe Rollback:**
   - Upgrades V2/V3 KV records to V4.0.0 format seamlessly via scheduled Cron or manual `/migrate` command.
   - Full backward compatibility with existing `BOT_DATA` key structures.
   - Sanitized backup and restore routines with secret redaction.

6. **100% Free-Tier Compliant & Serverless:**
   - Native V8 execution on Cloudflare Workers edge runtimes.
   - Automatic KV key TTLs, efficient pagination, and optimistic locking for concurrency mitigation.

---

## 📂 Project Directory Structure

```
SHIV-YOGI-BOT/
├── worker.js                     # Main Worker entry point (fetch webhook & scheduled cron)
├── content.json                  # Default localized messages, templates, and UI configuration
├── config.example.json           # Sanitized deployment configuration sample
├── package.json                  # Project scripts, dependencies, and test runner
├── wrangler.toml                 # Cloudflare Workers configuration (KV binding, cron)
├── README.md                     # Master project documentation
├── FEATURES.md                   # Detailed feature specifications & architectural breakdown
├── COMMANDS.md                   # Complete 100-command documentation & BotFather import block
├── SECURITY.md                   # Security model, threat analysis, authentication, and safeguards
├── MIGRATION.md                  # Comprehensive V3 to V4.0.0 migration & rollback guide
├── TESTING.md                    # Test suite overview, mocking guide, and test commands
├── DEPLOYMENT.md                 # Production deployment and Cloudflare setup instructions
├── CHANGELOG.md                  # Detailed version release notes
├── LICENSE                       # MIT License
│
├── modules/
│   ├── command-manager.js        # Central registry of exactly 100 commands & dispatcher
│   ├── command-handlers.js       # Real working handlers for all 100 commands
│   ├── menu-layouts.js           # Core layout definitions (Start, Help, Owner 8-Section, Group, Channel)
│   ├── button-manager.js         # Layout compiler, button CRUD, 64-byte validator, JSON import/export
│   ├── dashboard.js              # Aggregated analytics, DAU tracker, KV health, error logging
│   ├── random-welcome.js         # Greeting pools, HTML tag validator, variable interpolation
│   ├── random-replies.js         # Trigger matcher, keyword/phrase modes, cooldowns, pool dispatcher
│   ├── reply-history.js          # Per-user KV cycle tracker, zero repetition until exhausted, reshuffle
│   ├── customisation.js          # Dynamic text overrides, footers, Bot API vs BotFather boundary guide
│   ├── plugin-manager.js         # Extensible plugin lifecycle manager & hooks
│   ├── user-management.js        # Paginated member directory, block/unblock, profile cards, user broadcast
│   ├── migration.js              # Automatic schema upgrade from V2/V3 to V4.0.0 & rollback routines
│   ├── helpers.js                # Telegram API client, KV helpers, HTML escaping, IST dates
│   ├── security.js               # Webhook secret verification, dedup, permissions, rate limiter
│   ├── settings.js               # Configuration persistence, feature toggles, validation
│   ├── channel-manager.js        # Channel broadcasting, admin verification, drafts
│   ├── scheduled-posts.js        # Exact IST scheduling, daily/weekly/monthly recurring queue
│   ├── group-manager.js          # CAPTCHA verification, anti-flood, word filter, anti-forward, anti-bot
│   ├── moderation.js             # Warnings, auto-actions, mute/unmute/ban, trusted whitelist
│   ├── reports.js                # User report submissions, duplicate prevention, admin notes
│   ├── member-manager.js         # User registration, profile search, activity metrics
│   ├── admin-manager.js          # Granular admin permissions & temporary manager lifecycles
│   ├── automation.js             # Daily wallpaper announcement, automated KV backups
│   ├── statistics.js             # System metrics, analytics JSON exporter
│   ├── notifications.js          # Centralized alert dispatcher with per-event toggles
│   ├── templates.js              # Broadcast template library & variable interpolation
│   ├── backup.js                 # Snapshot exporter, schema validation & safe restore
│   ├── health.js                 # Real-time operational diagnostics (KV, Telegram API, Cron)
│   └── localization.js           # English & Hindi language engine, custom content editor
│
├── test/
│   ├── fixtures/
│   │   └── mock-telegram.js      # Mock Telegram Bot API & Mock Cloudflare KV simulator
│   ├── audit.test.js             # Configuration, 64-byte callback length, state coverage
│   ├── integration.test.js       # End-to-end webhook, /start, panel, moderation, cron
│   ├── security.test.js          # Permission boundaries, secret tokens, HTML safety
│   ├── moderation.test.js        # Warnings, auto-bans, trusted protection, report workflows
│   ├── scheduling.test.js        # Multimedia scheduling, IST parser, retries, recurring
│   ├── storage.test.js           # KV CRUD, malformed JSON resilience, backup validation
│   └── v4-advanced.test.js       # 100 commands registry, 8-section panel, button layouts, random replies/welcome
│
└── scripts/
    └── check-syntax.js           # Cross-platform JavaScript syntax validator (node -c)
```

---

## ⚡ Command Distribution Matrix (100 Unique Commands)

| Category | Count | Primary Roles | Example Commands |
| :--- | :---: | :--- | :--- |
| **Bot & User** | 20 | General interaction, info, profiles, support | `/start`, `/help`, `/about`, `/ping`, `/id`, `/profile`, `/rules`, `/appeal`, `/report` |
| **Group Management** | 25 | Moderation, filters, verification, sanctions | `/ban`, `/unban`, `/mute`, `/unmute`, `/warn`, `/slowmode`, `/antiflood`, `/captcha`, `/antiforward` |
| **Channel Management** | 20 | Broadcasting, scheduling, draft publishing | `/post`, `/schedule`, `/draft`, `/autopost`, `/channelinfo`, `/analytics`, `/templates` |
| **Owner & Admin** | 20 | System control, panel, backups, migrations | `/panel`, `/backup`, `/restore`, `/migrate`, `/maintenance`, `/addadmin`, `/setwebhook`, `/auditlog` |
| **Bot Customisation** | 15 | UI layouts, greetings, random replies, menus | `/customise`, `/welcome`, `/buttons`, `/replies`, `/footer`, `/menuconfig`, `/setlang` |
| **TOTAL** | **100** | **Complete coverage across all management domains** | **Zero duplicate names; all handlers implemented** |

*For complete command descriptions, permission levels, scopes, and BotFather `/setcommands` formatting, see [COMMANDS.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/COMMANDS.md).*

---

## 🎛️ Master Owner Panel (8 Main Home Sections)

Access via `/panel` (restricted strictly to Telegram ID `8226363418`):

```
+-------------------------------------------------------+
|        👑 MASTER OWNER CONTROL PANEL (v4.0.0)         |
| System: ONLINE | Mode: PRODUCTION | Time: 12:45:00 IST |
+-------------------------------------------------------+
|  [📊 Dashboard]            [⚙️ Bot Settings]           |
|  [👥 User Management]      [🛡️ Group Management]       |
|  [📢 Channel Management]   [🎨 Message Customisation]  |
|  [👋 Random Welcome Mgr]   [🤖 Random Reply Manager]   |
+-------------------------------------------------------+
|            [🔄 Refresh]     [❌ Close]                 |
+-------------------------------------------------------+
```

Every main section navigates to a dedicated submenu equipped with:
- Standardized navigation (`« Back`, `🏠 Home`, `🔄 Refresh`).
- Paginated item browsing (`◀ Prev` / `Next ▶`).
- Two-step confirmation for destructive actions (e.g., reset, clear history, unban all).
- Real-time feedback alerts on all inline button clicks.

---

## 🛠 Cloudflare Workers Setup & Deployment

### 1. Prerequisites
- **Node.js**: v20+ recommended
- **Wrangler CLI**:
  ```bash
  npm install -g wrangler
  ```
- **Login to Cloudflare**:
  ```bash
  wrangler login
  ```

### 2. Configure Required Secrets
Sensitive credentials must **never** be stored in source code or `wrangler.toml`. Set them securely using Wrangler:
```bash
# Set your Telegram Bot Token (from @BotFather)
wrangler secret put BOT_TOKEN

# Set a strong, random secret string for webhook authentication
wrangler secret put WEBHOOK_SECRET
```

### 3. Deploy Worker
```bash
wrangler deploy
```

### 4. Register Telegram Webhook
Register your Cloudflare Worker URL with Telegram using your webhook secret:
```bash
curl -F "url=https://shiv-yogi-assistant.shivyogi-x19.workers.dev/" \
     -F "secret_token=YOUR_WEBHOOK_SECRET" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
*(Or simply execute `/setwebhook` in private chat with the bot as Owner).*

---

## 🧪 Testing & Quality Assurance

Run the comprehensive automated test suite (162 automated tests covering all modules):

```bash
# 1. Syntax check all 39 JavaScript source files
npm run check

# 2. Run the complete test suite
npm test
```

### Test Suite Summary:
- `test/audit.test.js`: Verifies configuration integrity, 64-byte callback length, and state TTLs.
- `test/integration.test.js`: Validates webhook routing, `/start`, `/panel`, moderation flows, and cron triggers.
- `test/security.test.js`: Asserts permission boundaries, secret token rejection, rate limiting, and HTML escaping.
- `test/moderation.test.js`: Tests warning thresholds, auto-bans, report handling, and administrator actions.
- `test/scheduling.test.js`: Verifies IST announcement parser, retry logic, and recurring posts.
- `test/storage.test.js`: Tests KV CRUD operations, malformed JSON recovery, and backup restoration.
- `test/v4-advanced.test.js`: Verifies all 100 unique commands, 8-section panel, button manager, random replies, and random welcome pools.

---

## 🛡 Security Safeguards

- **Strict Webhook Authentication:** Rejects any incoming HTTP request missing the valid `X-Telegram-Bot-Api-Secret-Token` header with HTTP 403 Forbidden.
- **Callback Data Safety:** Telegram strictly caps `callback_data` at 64 bytes. All V4 callback IDs are compressed (e.g. `p:dash`, `p:rrep:add`) ensuring 100% compliance.
- **Eventual Consistency Mitigation:** Uses optimistic concurrency locks (`cron:processing_lock`, TTL 30s) and deduplication keys (`dedup:<update_id>`, TTL 120s).
- **Credential Redaction:** Exported backup snapshots and diagnostic logs completely strip `BOT_TOKEN`, `WEBHOOK_SECRET`, and `OWNER_ID`.

---

## 📄 Documentation Links

- [COMMANDS.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/COMMANDS.md) – Comprehensive reference for all 100 slash commands.
- [FEATURES.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/FEATURES.md) – In-depth architectural feature specification.
- [SECURITY.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/SECURITY.md) – Threat modeling, authentication, and safeguards.
- [MIGRATION.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/MIGRATION.md) – V2/V3 to V4.0.0 migration and rollback guide.
- [DEPLOYMENT.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/DEPLOYMENT.md) – Production deployment walkthrough.
- [TESTING.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/TESTING.md) – Test suite documentation and coverage details.
- [CHANGELOG.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/CHANGELOG.md) – Version release notes.

---

## ⚖️ License

This project is licensed under the [MIT License](LICENSE) — Created by Shiv Yogi.
