# 🛡️ SHIV YOGI ASSISTANT — SECURITY ARCHITECTURE

**SHIV YOGI ASSISTANT** is engineered with a strict **Zero-Trust Edge Security Model** designed specifically for the serverless Cloudflare Workers runtime and the Telegram Bot API.

---

## 1. 🔐 Core Security Pillars

### A. Strict Owner Authorization
* **Single Authoritative Owner:** Configured strictly via the environment variable `OWNER_ID` (`8226363418`).
* **Independent Verification:** Every privileged endpoint, command (`/panel`), and callback query starting with `p:` independently verifies the sender's Telegram numeric ID on the server side:
  $$\text{senderId} === \text{env.OWNER_ID}$$
* **Hiding is Not Security:** Unauthorized users attempting to trigger callback queries receive immediate rejection notifications (`⛔ Access Denied`), and their activity is permanently recorded in `logs:recent`.

### B. Admin & Temporary Manager Privilege Separation
* Admins and Temporary Managers are granted modular, granular permissions:
  * `can_post_channel`
  * `can_moderate_group`
  * `can_view_stats`
  * `can_view_logs`
* **Forbidden Actions for Admins & Managers:**
  * Cannot access `/panel` or any Owner settings.
  * Cannot change `OWNER_ID`, `BOT_TOKEN`, or `WEBHOOK_SECRET`.
  * Cannot grant themselves or others additional rights.
  * Cannot export or import system backups.
  * Cannot toggle global feature flags.
* **Automatic Expiration Enforcement:** Temporary manager records (`temp_managers:<id>`) contain an explicit `expires_at` timestamp. When `Date.now() > record.expires_at`, their access is purged immediately on their very next action.

### C. Webhook Secret Token Verification
* Telegram sends webhook updates with the header:
  `X-Telegram-Bot-Api-Secret-Token`
* Incoming requests are compared against `env.WEBHOOK_SECRET`. Any request lacking or failing this header is immediately rejected with `HTTP 403 Forbidden` without consuming processing cycles or reading database state.

### D. Update Deduplication Window
* To protect against network retries or Telegram duplicate deliveries, every incoming `update_id` is tracked in KV (`dedup:<update_id>`) with a 120-second TTL.
* Duplicate updates return `200 OK` instantly, preventing duplicate replies, duplicate welcome greetings, or double channel broadcasts.

### E. Zero-Secret Exposure Guarantee
* `BOT_TOKEN` and `WEBHOOK_SECRET` are stored strictly as encrypted **Cloudflare Secrets** (`wrangler secret put`).
* Backups exported via `/backup` or the Owner Panel strictly filter out and purge all authentication tokens and IDs.
* Diagnostic endpoints (`/health`, `/ping`) display status flags without outputting raw credentials.

### F. Safe HTML Handling & Anti-Flood Velocity Defense
* All user-provided names, reasons, and text previews are safely sanitized via `escapeHtml()`.
* If a post contains unclosed or invalid HTML tags, the sender helper catches Telegram's entity parsing error and automatically falls back to plain-text delivery to prevent silent message drops.
* The anti-flood engine tracks message frequency in groups using a rolling sliding window (`flood:<chatId>:<userId>`). Exceeding the threshold automatically deletes the message and mutes the user for 5 minutes (`300` seconds).
