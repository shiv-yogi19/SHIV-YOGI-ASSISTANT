# 🔄 SHIV YOGI ASSISTANT — V3.0.0 TO V4.0.0 MIGRATION GUIDE

This document provides a comprehensive, step-by-step roadmap for upgrading an existing **SHIV YOGI ASSISTANT** deployment from **V2.0.0 / V3.0.0** to **V4.0.0 – ADVANCED EDITION** without service disruption, message loss, or KV corruption.

---

## 1. Migration Overview & Compatibility Principles

### Core Guarantees:
- **Zero Data Loss:** All existing member records (`user:*`), channel lists (`chan:*`), scheduled posts (`chan:scheduled_list`), moderation logs (`mod:log`), and administrator roles (`admin:*`) remain 100% intact.
- **Backward-Compatible Schema:** `modules/backup.js` and `modules/migration.js` support reading and restoring snapshots created in schemas `2.0.0`, `3.0.0`, and `4.0.0`.
- **Automated Execution:** The Cloudflare Worker automatically executes migration checks during the scheduled 1-minute cron cycle or immediately upon owner invocation via `/migrate`.

---

## 2. Key Architectural Differences Between V3 and V4.0.0

| Feature Domain | V3.0.0 Architecture | V4.0.0 Advanced Edition Architecture |
| :--- | :--- | :--- |
| **Command System** | Static `switch-case` in `worker.js` (~22 commands) | Central registry of **exactly 100 unique commands** with chat-type validation, permission scopes, and metadata in `modules/command-manager.js`. |
| **Owner Control Panel** | Single mixed inline menu | Exactly **8 dedicated home sections** (`Dashboard`, `Bot Settings`, `User Management`, `Group Management`, `Channel Management`, `Message Customisation`, `Random Welcome Manager`, `Random Reply Manager`). |
| **Button Layouts** | Hardcoded inline keyboards | **Advanced Button Layout Manager**: custom 1–4 per row, mixed layouts, stable action IDs, JSON export/import via `modules/button-manager.js`. |
| **Welcome Messages** | Single static text from `content.json` | **Multi-variant Random Welcome Manager**: group pools, HTML validation, `{NAME}` and `{GROUP}` placeholders. |
| **Auto-Replies** | Basic keyword map | **Advanced Random Reply Engine**: per-user cycle state in KV, zero immediate repetition until pool exhausted, automatic reshuffle. |
| **User Directory** | Basic KV member lookup | **User Management Suite**: paginated member directory, profile inspection, individual block/unblock, direct user broadcast. |
| **Plugin Architecture** | Monolithic module imports | Dynamic **Plugin Registry** with runtime lifecycle hooks and toggles. |

---

## 3. KV Storage Key Schema Mapping

| Key Pattern | V3.0.0 Usage | V4.0.0 Advanced Usage | Action During Migration |
| :--- | :--- | :--- | :--- |
| `schema:version` | Absent or `"3.0.0"` | `"4.0.0"` | Updated to `"4.0.0"` |
| `config:settings` | General bot settings | Extended with V4 flags (`enable_random_replies`, etc.) | Merged with V4 defaults; existing values preserved |
| `btn:layout:*` | Not present | Stored layout configurations for menus | Initialized with default 1–4 row layouts |
| `rwelcome:pool:*` | Not present | Array of active greeting templates | Seeded with Hindi & English greeting variants |
| `rreply:pool:*` | Not present | Array of random response pools | Seeded with default trigger pools (`hello`, `rules`, etc.) |
| `rreply:cycle:*` | Not present | Per-user non-repeating cycle indices | Created dynamically on user interaction |
| `members:index` | Array of registered user IDs | Preserved identical structure | Untouched (100% backward compatible) |
| `chan:scheduled_list`| Array of scheduled posts | Preserved identical structure | Untouched (100% backward compatible) |
| `mod:warnings:*` | Per-user warning tallies | Preserved identical structure | Untouched (100% backward compatible) |

---

## 4. Step-by-Step Upgrade Procedure

### Step 1: Pre-Upgrade Configuration Backup
Before deploying V4.0.0 code, take a snapshot of your existing KV storage:
1. Open Telegram and send `/backup` to `@shiv_yogi_assist_bot` in private chat.
2. Save the exported JSON backup file (`shiv_yogi_backup_v3.json`) to your local machine.

### Step 2: Update Source Files
Ensure all V4.0.0 files are present in your workspace:
- `worker.js` (Updated entry point with 8-section panel and 100-command router)
- `modules/*.js` (All 28 modular components)
- `content.json` (Updated with V4 translations and templates)
- `wrangler.toml` (Configured with binding `BOT_DATA` and 1-minute cron)

### Step 3: Run Local Syntax & Integration Verification
Verify the code locally prior to deployment:
```bash
npm run check
npm test
```
*All 39 JavaScript files must pass syntax check and all 162 tests must pass.*

### Step 4: Deploy to Cloudflare Workers
Deploy the new worker to Cloudflare:
```bash
wrangler deploy
```

### Step 5: Execute Migration
The automated migration routine runs in one of two ways:
- **Automatic:** Within 60 seconds of deployment, the Cloudflare Workers Cron trigger calls `runAutomatedMigration(env)` in `worker.js`.
- **Manual (Immediate):** Send `/migrate` in private chat to `@shiv_yogi_assist_bot` as the Owner (`8226363418`). The bot will confirm:
  ```
  ✅ V4.0.0 Migration Complete!
  - Schema updated to v4.0.0
  - 8-Section Owner Panel initialized
  - Button Layout Manager initialized
  - Random Welcome & Reply pools initialized
  ```

### Step 6: Update BotFather Slash Commands
To reflect all 100 unique commands in the Telegram client auto-complete:
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/setcommands`.
3. Select `@shiv_yogi_assist_bot`.
4. Paste the 100-command list documented in [COMMANDS.md](file:///data/user/0/com.termux/files/home/projects/SHIV-YOGI-BOT/COMMANDS.md).

---

## 5. Safe Rollback Procedure

If you must revert to V3.0.0 for any operational reason:

1. **Checkout V3 Source:** Check out the previous V3 git tag or archive.
2. **Deploy V3 Worker:**
   ```bash
   wrangler deploy
   ```
3. **Restore KV Snapshot (Optional):**
   If KV state needs to be restored to the pre-upgrade state:
   - Send `/restore` to the bot in private chat.
   - Reply with your pre-migration backup JSON (`shiv_yogi_backup_v3.json`).
   - The backup engine will restore all records cleanly without touching your active `BOT_TOKEN` or `WEBHOOK_SECRET`.
