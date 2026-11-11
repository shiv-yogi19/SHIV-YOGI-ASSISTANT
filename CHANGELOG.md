# 📝 CHANGELOG — SHIV YOGI ASSISTANT

All notable changes to the **SHIV YOGI ASSISTANT** project are documented in this file.

---

## [4.0.0] — 2026-11-11 (ADVANCED EDITION)

### 🚀 Major Highlights
- **100 Unique Registered Commands**: Expanded command catalog from 22 to exactly 100 unique slash commands across 5 functional categories with real working handlers.
- **8-Section Master Owner Panel**: Re-architected Owner Home Menu into exactly 8 functional sections (Dashboard, Bot Settings, User Management, Group Management, Channel Management, Message Customisation, Random Welcome Manager, Random Reply Manager).
- **Advanced Button Layout Manager**: Full dynamic control over keyboard structures (1-4 per row, mixed layouts, stable action IDs, export/import JSON).
- **Zero-Repetition Random Reply Engine**: Advanced cycle state tracking in Cloudflare KV guaranteeing no immediate repetition until all replies in a trigger pool are served.
- **Random Welcome Manager**: Pool of randomized bilingual greetings with dynamic `{NAME}` and `{GROUP}` placeholder interpolation and per-group pools.
- **User Management Center**: Profile cards, search by ID/username, block/unblock tools, and batched user announcements.
- **Modular Plugin Registry**: Pluggable architecture allowing runtime toggling of submodules with dependency validation.
- **Automated V4 Migration Engine**: Non-destructive schema migration from V2/V3 to V4.0.0.

### ➕ Added
- `modules/command-manager.js`: Central command registry and permission dispatcher for 100 commands.
- `modules/command-handlers.js`: Complete implementations for all 100 slash commands.
- `modules/dashboard.js`: Aggregates real-time metrics, active user estimates, and system health.
- `modules/button-manager.js`: Custom layout engine with Telegram keyboard compiler and mutation tools.
- `modules/menu-layouts.js`: Default layout definitions for Start, Help, Owner, Group, and Channel menus.
- `modules/random-welcome.js`: Welcome message pool manager with HTML safety validation.
- `modules/random-replies.js`: Trigger matcher and random reply generator.
- `modules/reply-history.js`: Per-user reply cycle tracker in KV.
- `modules/customisation.js`: Message overrides, footers, and BotFather technical disclosures.
- `modules/plugin-manager.js`: Modular plugin registry with dependency checking.
- `modules/user-management.js`: User profiles, paginated lists, block/unblock, and broadcasts.
- `modules/migration.js`: Schema versioning, upgrade routines, and health checks.
- `test/v4-advanced.test.js`: 55 automated integration tests for V4 systems.
- `MIGRATION.md`, `TESTING.md`, `DEPLOYMENT.md`: Exhaustive architectural guides.

### 🔄 Changed
- `worker.js`: Updated to route incoming commands via `dispatchCommand()`, render compact 8-section Owner Panel, and run auto-migration on scheduled cron triggers.
- `modules/group-manager.js`: Integrated random welcome greetings, anti-bot protection, and anti-forward filters.
- `modules/backup.js`: Upgraded schema version to 4.0.0 with backward compatibility for versions 2.0.0, 3.0.0, and 4.0.0.
- `content.json` & `modules/helpers.js`: Updated defaults to version 4.0.0 with V4 feature flags.
- `test/audit.test.js`: Added 100-command registry audit and V4 schema validation.
- `test/storage.test.js`: Updated backup version verification to 4.0.0.
- `package.json`: Updated version to 4.0.0 and added `v4-advanced.test.js` to test suite.

### 🛡 Preserved
- 100% of all existing V3 commands, group moderation rules, channel broadcast pipelines, admin roles, and KV record structures.

---

## [3.0.0] — 2026-11-11
- Production-Ready Rebuild on Cloudflare Workers and Cloudflare KV.
- Modular ES Modules architecture inside `modules/`.
- 22 core commands covering group moderation, channel broadcasting, and owner management.
- Multi-tier security engine (secret token verification, update deduplication, HTML validation).
- Automated cron queue for scheduled announcements and daily backups.

---

## [2.0.0] — 2026-11-09
- Monolithic Worker implementation.
- Basic group rules and broadcast channel posting.
