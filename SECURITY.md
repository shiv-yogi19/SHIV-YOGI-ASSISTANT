# 🛡 SHIV YOGI ASSISTANT (v3.0.0) — SECURITY MODEL & SAFEGUARDS

This document details the real security architecture, threat model, authorization controls, and data protection mechanisms implemented in **SHIV YOGI ASSISTANT V3.0.0**.

---

## 1. Threat Model & Operational Environment

SHIV YOGI ASSISTANT operates as an asynchronous, event-driven serverless application on Cloudflare Workers edge runtimes. It receives inbound updates from Telegram via HTTP POST webhooks and communicates outbound with the Telegram Bot API over TLS 1.3.

### Threat Vectors Addressed:
1. **Unauthenticated Webhook Ingestion:** Attackers attempting to spoof Telegram updates by sending fabricated HTTP POST requests directly to the worker URL.
2. **Privilege Escalation via Callback Tampering:** Unauthorized users forging or manipulating inline button `callback_data` payloads to execute privileged actions.
3. **Replay & Duplicate Updates:** Telegram webhook retries causing duplicate messages, duplicate post broadcasts, or repeated welcome actions.
4. **Credential Leakage in Backups & Logs:** Accidental exposure of the Telegram Bot Token or Webhook Secret in activity logs, diagnostic endpoints, or backup JSON files.
5. **Eventual Consistency Races in Cloudflare KV:** Cloudflare KV replication latency causing race conditions in cron processing or state machines.
6. **Cross-User Interactive State Pollution:** One user hijacking or continuing another user's active configuration prompt.

---

## 2. Webhook Secret Token Authentication

- Cloudflare Workers verify the `X-Telegram-Bot-Api-Secret-Token` header on every incoming `POST /` request before any update processing occurs.
- If the header is missing or does not strictly match `env.WEBHOOK_SECRET`, the request is immediately terminated with **HTTP 403 Forbidden**, and a security event is recorded.
- Webhook registration is conducted securely via HTTPS POST using the `setWebhook` method with the secret token parameter.

---

## 3. Server-Side Authorization Matrix

Authentication is strictly enforced on the server runtime:
- **Zero Client Trust:** The bot never trusts client-supplied callback data or the visibility of inline keyboards as proof of authorization.
- **Strict Owner Verification:** All administrative routes (`/panel`, `/backup`, `/setwebhook`, and callbacks prefixed with `p:`) independently verify that `from.id === env.OWNER_ID` (`8226363418`).
- **Granular Admin Permissions:** Appointed administrators are assigned explicit permission flags (`can_post_channel`, `can_moderate_group`, `can_view_stats`, `can_manage_scheduled_posts`, `can_manage_reports`). Permissions are validated before every privileged action.
- **Strict Guardrails:** Secondary administrators and temporary managers are strictly barred from accessing secrets, global security settings, backup restoration, or system reset operations.

---

## 4. Concurrency & Cloudflare KV Reality

Cloudflare KV is a globally distributed key-value store optimized for high-volume reads. **Cloudflare KV is eventually consistent and does not offer atomic multi-key transactions.**

To safely accommodate this architecture:
1. **Cron Concurrency Locks:** The scheduled queue processor sets an optimistic lock key (`cron:processing_lock`) with an automatic 30-second TTL before executing scheduled posts, mitigating overlapping cron worker invocations.
2. **Update Deduplication:** Update IDs are tracked in KV (`dedup:<update_id>`) with a 120-second expiration TTL. If an update ID has already been recorded, processing halts immediately.
3. **Sliding-Window Rate Limiting:** Anti-flood counters store lightweight arrays of millisecond timestamps per user with short TTLs (60s), ensuring accurate flood detection without unbounded storage growth.

---

## 5. Credential Sanitization & Secret Redaction

- **Environment Secrets:** `BOT_TOKEN` and `WEBHOOK_SECRET` are managed exclusively via Cloudflare Worker Secrets (`wrangler secret put`). They are never stored in `wrangler.toml`, `content.json`, or Git repositories.
- **Safe Backups:** Full configuration backups exported via `/backup` or the control panel explicitly omit all sensitive credentials.
- **Sanitized Restoration:** The backup restoration engine (`validateBackupSchema`) strips any incoming `BOT_TOKEN`, `WEBHOOK_SECRET`, or `OWNER_ID` keys before applying changes to KV, preventing credential overrides from imported files.
- **Safe Error Reporting:** Errors logged or sent to the Owner are sanitized to prevent token leakage in stack traces.

---

## 6. Interactive State Machine Isolation

- Multi-step interactive prompts (e.g. drafting posts, adding channels, updating settings) are bound to a composite key `state:<userId>` with an automatic 10-minute TTL (600 seconds).
- A pending state can only be satisfied by a message sent by the exact user who initiated it in their private chat.
- All states support explicit cancellation via the `/cancel` command or "Cancel" inline buttons.

---

## 7. HTML Sanitization & Input Validation

- All user-supplied input rendered in outgoing messages is passed through `escapeHtml()` to neutralize `<`, `>`, `&`, and `"` characters.
- Custom template and message editing undergoes structural HTML validation (`validateSafeHtml()`), ensuring only supported Telegram formatting tags (`<b>`, `<i>`, `<code>`, `<pre>`, `<a>`, `<u>`, `<s>`, `<tg-spoiler>`) are accepted with properly balanced closing tags.
