# 🧪 SHIV YOGI ASSISTANT — TESTING & QUALITY ASSURANCE

This document details the test framework, mock architecture, test suites, and instructions for verifying **SHIV YOGI ASSISTANT V4.0.0 – ADVANCED EDITION**.

---

## 1. Testing Philosophy & Mock Architecture

The test framework operates with **zero external testing dependencies**, running directly on Node.js using native `node:test` and `node:assert/strict`. This ensures instant execution in any environment—from local development and Termux to GitHub Actions CI runners.

### Key Mock Fixtures (`test/fixtures/mock-telegram.js`):
1. **`MockKV`:** A high-fidelity in-memory simulator of Cloudflare KV:
   - Supports `get()`, `put()`, `delete()`, and `list()`.
   - Emulates Cloudflare KV options including `expirationTtl` and metadata.
   - Simulates JSON deserialization errors and key miss scenarios.
2. **`MockTelegramApi`:** A deterministic interceptor for Telegram Bot API calls:
   - Records sent messages (`sendMessage`, `editMessageText`, `deleteMessage`, `sendPhoto`).
   - Simulates member queries (`getChatMember`, `getChatAdministrators`).
   - Tracks chat restrictions (`restrictChatMember`, `banChatMember`, `unbanChatMember`).
   - Validates that outgoing inline keyboards do not violate Telegram API limits (e.g., callback data $\le 64$ bytes).

---

## 2. Test Suites Overview

The test suite comprises **7 specialized test files** with **162 automated tests**:

```
test/
├── fixtures/
│   └── mock-telegram.js      # Mock Telegram Bot API & in-memory Cloudflare KV
├── audit.test.js             # Configuration, 64-byte callback length, state TTL
├── integration.test.js       # End-to-end webhook, /start, panel, moderation, cron
├── security.test.js          # Permission boundaries, secret tokens, HTML safety
├── moderation.test.js        # Warnings, auto-bans, trusted protection, report workflows
├── scheduling.test.js        # Multimedia scheduling, IST parser, retries, recurring
├── storage.test.js           # KV CRUD, malformed JSON resilience, backup validation
└── v4-advanced.test.js       # 100 commands registry, 8-section panel, button layouts, random replies/welcome
```

### Breakdown of Test Suites:

| Test File | Focus & Coverage | Test Count |
| :--- | :--- | :---: |
| **`test/audit.test.js`** | Configuration verification, file structure audits, 64-byte callback length constraint, interactive state TTLs. | 14 |
| **`test/integration.test.js`** | Full webhook flow, `/start` menu rendering, `/panel` authorization, moderation actions, and 1-minute cron scheduled execution. | 18 |
| **`test/security.test.js`** | Webhook secret token authentication, update deduplication, sliding-window rate limiting, and HTML injection prevention. | 22 |
| **`test/moderation.test.js`** | Warning escalation to mute/ban, auto-moderation filters, trusted user protection, and user reporting lifecycle. | 24 |
| **`test/scheduling.test.js`** | Exact IST datetime parsing, daily/weekly/monthly recurring posts, queue ordering, and error retry backoff. | 20 |
| **`test/storage.test.js`** | KV CRUD operations, resilience against corrupted/malformed JSON, backup export and sanitized restore routines. | 22 |
| **`test/v4-advanced.test.js`** | Exact 100 unique slash commands registry, 8-section Master Owner Panel submenus, Button Layout Manager compiler, Random Welcome pools, and non-repeating Random Reply KV cycles. | 42 |
| **TOTAL** | **Comprehensive Full-System Verification** | **162 Passed** |

---

## 3. Running the Tests

### Run All Tests
Execute all 7 test suites concurrently using the built-in test runner:
```bash
npm test
```

### Run Syntax Validation Only
Validate that all 39 JavaScript source and test files have 100% valid JavaScript syntax:
```bash
npm run check
# or directly:
node scripts/check-syntax.js
```

### Run a Specific Test Suite
To run an individual test suite for isolated debugging:
```bash
node --test test/v4-advanced.test.js
node --test test/security.test.js
node --test test/audit.test.js
```

---

## 4. Continuous Integration (GitHub Actions)

The repository includes an automated CI workflow at `.github/workflows/tests.yml` that runs on every push and pull request against Node.js 20 and Node.js 22 runtimes:
- Runs `npm run check` (JavaScript syntax verification across all 39 files).
- Runs `npm test` (All 162 unit and integration tests).
- Fails immediately if any test fails or syntax error is discovered.
