# 📜 SHIV YOGI ASSISTANT — CHANGELOG

All notable changes to the **SHIV YOGI ASSISTANT** project are documented in this file.

---

## [3.0.0] — 2026-11-11

### 🚀 Complete Architectural Rebuild
- **Zero-Dependency Modular Architecture:** Completely rebuilt the entire codebase from scratch into 17 specialized modules within `modules/`.
- **Cloudflare Workers ESM Standard:** Native ES Modules entry point with strictly separated `fetch` and `scheduled` handlers.
- **Strict Telegram API Wrapper:** Comprehensive Telegram Bot API client in `helpers.js` checking both HTTP status and payload `res.ok`, with graceful handling of Telegram rate limits (429) and "message is not modified" notifications.

### 👑 Owner Control Panel (22 Submodules)
- Overhauled `/panel` with clean inline keyboard navigation, back/cancel routing, and strict server-side authorization on every `p:` callback.
- Added dedicated centers for **Moderation**, **Member Profiles**, **Community Reports**, and **Templates**.
- Implemented state machine with 600s TTL for multi-step prompts (drafting posts, scheduling, adding administrators, editing settings).

### ⚖️ Advanced Moderation & Reports Center
- **Warning System:** Progressive warning counts (`[1/3]`, `[2/3]`, `[3/3]`) with automatic ban execution upon reaching the warning limit.
- **Immunity System:** Guaranteed immunity for the bot Owner, bot administrators, and whitelisted trusted users.
- **Trusted & Blacklist Whitelists:** Interactive management of trusted users and malicious bad actors in KV.
- **Community Reporting Workflow:** `/report` command with 24-hour duplicate prevention, admin alert notifications, and review actions (Approve, Reject, Notes).

### ⏰ Scheduling & Automation Engine
- **IST Date Parser:** Reliable parser for `YYYY-MM-DD HH:mm` in `Asia/Kolkata` (+05:30 offset).
- **Multimedia Post Scheduling:** Support for text, photos, videos, and documents with captions.
- **Recurring Post Intervals:** Support for `daily`, `weekly`, and `monthly` repeating announcements.
- **Concurrency Protection:** Optimistic lock mechanism (`cron:processing_lock`) preventing overlapping cron invocations.
- **Automatic Retries:** 3-attempt retry backoff with automatic failure alert notifications dispatched to the Owner.
- **Automated Daily Tasks:** Daily wallpaper announcement publication at configured IST hour; daily automated KV backup snapshots.

### 🛡 Security & System Health Center
- **Strict Secret Verification:** Webhook authentication via `X-Telegram-Bot-Api-Secret-Token`.
- **Update Deduplication:** Automatic caching of `update_id` (120s TTL) preventing duplicated updates during network retries.
- **Live Health Diagnostics:** Real-time KV read/write/delete probes, Telegram API `getMe` queries, webhook info, and cron heartbeat checks.
- **Zero Credential Leakage:** Complete redaction of bot tokens and secrets from diagnostics, backups, and logs.

### 🧪 Comprehensive Testing Suite
- **Strict Mock System:** Created `test/fixtures/mock-telegram.js` validating method names, required payloads, and simulating API/network failures.
- **6 Dedicated Test Suites:**
  - `test/audit.test.js`: 111 callback lengths (<=64b), state coverage, configuration integrity.
  - `test/integration.test.js`: End-to-end webhook, /start, panel, moderation, cron execution.
  - `test/security.test.js`: Authorization matrix, secret verification, HTML escaping, diagnostics.
  - `test/moderation.test.js`: Warnings, auto-actions, immunity, whitelists, reports.
  - `test/scheduling.test.js`: Multimedia scheduling, IST parser, recurring queues, retries.
  - `test/storage.test.js`: KV CRUD, malformed JSON resilience, credential-free backups.
- **Cross-Platform Syntax Checker:** Built `scripts/check-syntax.js` validating all JS files reliably without shell glob assumptions.

---

## [2.0.0] — Previous Legacy Version
- Initial Cloudflare Worker implementation.
- Basic channel post publishing and rudimentary anti-flood.
- Basic inline panel interface.
