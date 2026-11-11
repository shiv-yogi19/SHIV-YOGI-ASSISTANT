# 🛡 SHIV YOGI ASSISTANT V4.0.0 – SECURITY MODEL & SAFEGUARDS

This document details the complete security architecture, threat model, authorization controls, input validation, and data protection mechanisms implemented in **SHIV YOGI ASSISTANT V4.0.0 – ADVANCED EDITION**.

---

## 1. Threat Model & Operational Environment

SHIV YOGI ASSISTANT runs as an asynchronous, event-driven serverless application on Cloudflare Workers edge runtimes. It ingests incoming updates from Telegram via HTTP POST webhooks and communicates outbound with the Telegram Bot API over TLS 1.3.

### Threat Vectors Addressed:
1. **Unauthenticated Webhook Spoofing:** Attackers attempting to spoof Telegram updates by sending fabricated HTTP POST requests directly to the worker URL.
2. **Privilege Escalation via Callback Tampering:** Unauthorized users forging or manipulating inline button `callback_data` payloads to invoke privileged administrative actions.
3. **Replay & Duplicate Updates:** Telegram webhook retries causing duplicate messages, duplicate post broadcasts, or repeated welcome actions.
4. **Credential Leakage in Backups & Logs:** Accidental exposure of the Telegram Bot Token or Webhook Secret in activity logs, diagnostic endpoints, or backup JSON files.
5. **Eventual Consistency Races in Cloudflare KV:** Cloudflare KV replication latency causing race conditions in cron processing, scheduled posts, or state machines.
6. **Cross-User Interactive State Pollution:** One user hijacking or continuing another user's active configuration prompt.
7. **HTML / Script Injection via Customization:** Malicious HTML payload injection inside welcome messages, templates, or auto-replies.
8. **Telegram Payload Buffer Overflows:** Callback data exceeding Telegram's strict 64-byte payload limitation, causing silent button drop errors.

---

## 2. Webhook Secret Token Authentication

- Cloudflare Workers verify the `X-Telegram-Bot-Api-Secret-Token` header on every incoming `POST /` request before any update processing occurs.
- If the header is missing or does not strictly match `env.WEBHOOK_SECRET`, the request is immediately terminated with **HTTP 403 Forbidden**, and a security event is recorded in the activity log.
- Webhook registration is conducted securely via HTTPS POST using the `setWebhook` method with the secret token parameter.

```javascript
// Verification implementation in worker.js
const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
if (!env.WEBHOOK_SECRET || secretToken !== env.WEBHOOK_SECRET) {
  return new Response('Unauthorized webhook source', { status: 403 });
}
```

---

## 3. Server-Side Authorization Matrix

Authentication is strictly enforced on the server runtime:
- **Zero Client Trust:** The bot never trusts client-supplied callback data or the visibility of inline keyboards as proof of authorization.
- **Strict Owner Verification:** All administrative routes (`/panel`, `/backup`, `/migrate`, `/setwebhook`, and callbacks prefixed with `p:`) independently verify that `from.id === env.OWNER_ID` (`8226363418`).
- **Granular Admin Permissions:** Appointed administrators are assigned explicit permission flags (`can_post_channel`, `can_moderate_group`, `can_view_stats`, `can_manage_scheduled_posts`, `can_manage_reports`). Permissions are validated before every privileged action.
- **Strict Guardrails:** Secondary administrators and temporary managers are strictly barred from accessing secrets, global security settings, backup restoration, or system reset operations.

---

## 4. Button Layout & Callback Data Security (64-Byte Guard)

Telegram Bot API enforces a hard ceiling of **64 bytes** on inline keyboard `callback_data` strings. Exceeding this limit causes Telegram API requests to fail with `BUTTON_DATA_INVALID`.

### Safeguards Implemented:
1. **Namespace Compression:** All callback actions use compact prefixes:
   - `p:` – Master Owner Panel actions (`p:dash`, `p:rrep:add`, `p:bset:lang`)
   - `cb:` – Public / User callbacks (`cb:lang:hi`, `cb:help:cat`)
   - `grp:` – Group management actions (`grp:warn:123`, `grp:mute:123`)
2. **Internal Action IDs:** Button labels and display positions are completely separated from their execution IDs. Renaming a button or reordering rows never alters the verified action ID.
3. **Automated Validation:** The `ButtonManager` and test suite (`test/audit.test.js`) validate that every compiled inline keyboard row and button strictly conforms to $\le 64$ bytes before dispatch.

---

## 5. Concurrency & Cloudflare KV Reality

Cloudflare KV is a globally distributed key-value store optimized for ultra-high-volume reads. **Cloudflare KV is eventually consistent and does not offer atomic multi-key transactions.**

To safely accommodate this architecture:
1. **Cron Concurrency Locks:** The scheduled queue processor sets an optimistic lock key (`cron:processing_lock`) with an automatic 30-second TTL before executing scheduled posts, mitigating overlapping cron worker invocations.
2. **Update Deduplication:** Update IDs are tracked in KV (`dedup:<update_id>`) with a 120-second expiration TTL. If an update ID has already been recorded, processing halts immediately.
3. **Sliding-Window Rate Limiting:** Anti-flood counters store lightweight arrays of millisecond timestamps per user with short TTLs (60s), ensuring accurate flood detection without unbounded storage growth.
4. **Random Reply Cycle Isolation:** Reply cycles are tracked independently per user and trigger key (`rreply:cycle:<trigger>:<user_id>`). In the event of near-simultaneous triggers, KV eventually converges without corrupting the message pool.

---

## 6. Credential Sanitization & Secret Redaction

- **Environment Secrets:** `BOT_TOKEN` and `WEBHOOK_SECRET` are managed exclusively via Cloudflare Worker Secrets (`wrangler secret put`). They are never stored in `wrangler.toml`, `content.json`, or Git repositories.
- **Safe Backups:** Full configuration backups exported via `/backup` or the control panel explicitly omit all sensitive credentials.
- **Sanitized Restoration:** The backup restoration engine (`validateBackupSchema`) strips any incoming `BOT_TOKEN`, `WEBHOOK_SECRET`, or `OWNER_ID` keys before applying changes to KV, preventing credential overrides from imported files.
- **Safe Error Reporting:** Errors logged or sent to the Owner are sanitized to prevent token leakage in stack traces.

---

## 7. Interactive State Machine Isolation

- Multi-step interactive prompts (e.g. drafting posts, adding channels, updating settings) are bound to a composite key `state:<userId>` with an automatic 10-minute TTL (600 seconds).
- A pending state can only be satisfied by a message sent by the exact user who initiated it in their private chat.
- All states support explicit cancellation via the `/cancel` command or "Cancel" inline buttons.

---

## 8. HTML Sanitization & Input Validation

- All user-supplied input rendered in outgoing messages is passed through `escapeHtml()` to neutralize `<`, `>`, `&`, and `"` characters.
- Custom template and message editing undergoes structural HTML validation (`validateSafeHtml()`), ensuring only supported Telegram formatting tags (`<b>`, `<i>`, `<code>`, `<pre>`, `<a>`, `<u>`, `<s>`, `<tg-spoiler>`) are accepted with properly balanced closing tags.
- Dangerous HTML tags (such as `<script>`, `<iframe>`, `<object>`, `<embed>`) and arbitrary attributes are strictly rejected.

---

## 9. Security Audit Checklist

| Security Control | Implementation Module | Verification Status |
| :--- | :--- | :---: |
| Webhook Secret Verification | `worker.js` | Verified (HTTP 403 on mismatch) |
| Owner Authorization Boundary | `modules/security.js`, `modules/command-manager.js` | Verified (Strict ID 8226363418) |
| 64-Byte Callback Data Constraint | `modules/button-manager.js`, `test/audit.test.js` | Verified (Max byte length < 30) |
| Update Deduplication | `modules/security.js` | Verified (120s TTL) |
| Concurrency Lock | `modules/scheduled-posts.js` | Verified (30s TTL) |
| Anti-Flood Rate Limiting | `modules/group-manager.js` | Verified (Sliding window) |
| Credential Redaction in Backups | `modules/backup.js` | Verified (Secrets stripped) |
| Safe HTML Parsing | `modules/helpers.js`, `modules/random-welcome.js` | Verified (Tag whitelist & balance) |
