# 🌟 SHIV YOGI ASSISTANT (v4.0.0) — FEATURES SPECIFICATION
**SHIV YOGI ASSISTANT V4.0.0 ADVANCED EDITION**
*Serverless Edge Telegram Management System on Cloudflare Workers & Cloudflare KV*

---

## 🏛 1. System Architecture & Edge Runtime
- **Edge Deployment**: Cloudflare Workers running pure ES Modules (`worker.js` + `modules/`).
- **Distributed KV Persistence**: Storage using Cloudflare KV namespace `BOT_DATA`.
- **1-Minute Cron Trigger**: Continuous background processing queue (`* * * * *`).
- **Sub-10ms Global Latency**: Millisecond-level request handling across Cloudflare's global edge points.
- **Zero External Dependencies**: Pure native fetch API, zero vulnerable npm packages.

---

## 👑 2. Master Owner Control Panel (Exactly 8 Sections)
1. **Dashboard (`p:dash`)**:
   - Total registered users & Estimated DAU.
   - Channel post tallies, messages processed, and command executions.
   - Scheduled post queue status & recent activity logs.
   - Real-time KV storage health & Telegram Bot API latency.
2. **Bot Settings (`p:settings`)**:
   - Live feature flag toggling (16 toggles).
   - Core identifiers (Channel ID, Group ID, Contact Username).
   - Cooldown configurations and slow mode limits.
   - Administrator and Temporary Manager promotion/revocation.
   - Emergency maintenance mode and defaults reset.
3. **User Management (`p:users`)**:
   - Paginated user list with search by ID or username.
   - Detailed user profiles (message count, trust level, warnings, first/last seen).
   - User blocking and unblocking with audit logging.
   - Direct broadcast announcements to all registered private chat users.
4. **Group Management (`p:grp`)**:
   - Automated member verification via interactive CAPTCHA buttons.
   - Sliding-window anti-flood protection with auto-mute.
   - Unauthorized external link deletion.
   - Banned words and profanity enforcement.
   - Forwarded channel message restrictions.
   - Automated rogue bot detection and immediate eviction.
   - Moderation center (warn, unwarn, mute, unmute, ban, unban, kick, slowmode).
5. **Channel Management (`p:chan`)**:
   - Multi-channel registry with primary channel target selection.
   - Rich post composer for text, photo, video, and document announcements.
   - Instant publication with optional automatic pinning.
   - 1-minute cron queue for future scheduled and recurring announcements.
   - Channel post editing and remote message deletion.
   - Automated channel administrator permission audit.
6. **Message Customisation (`p:custom`)**:
   - Full live overrides for Welcome, About, Help, Contact, Rules, and Footer messages.
   - Dual-language support (English & Hindi) with safe HTML validator.
   - Live message previews before saving.
   - Clear technical documentation distinguishing Bot API vs BotFather capabilities.
7. **Random Welcome Manager (`p:rwelc`)**:
   - Multi-variant greeting pools with randomized selection.
   - Safe HTML placeholder interpolation (`{NAME}`, `{GROUP}`).
   - Variant enable/disable toggles and greeting history.
   - Per-group custom welcome message pools.
8. **Random Reply Manager (`p:rreply`)**:
   - Advanced keyword trigger matching with custom reply pools.
   - **Zero Immediate Repetition Guarantee**: KV cycle state tracking ensures all enabled replies in a pool are exhausted before any reply is repeated.
   - Automatic cycle reshuffling.
   - Cooldown enforcement in private and group chats.

---

## 📐 3. Advanced Button Layout Manager
- **Layout Types**:
  - 1 button per row (vertical stack)
  - 2 buttons per row (compact grid)
  - 3 buttons per row (dense keyboard)
  - 4 buttons per row (action grid)
  - Custom mixed rows & columns
- **Button Types**:
  - URL buttons (links to channels, groups, websites)
  - Callback buttons (interactive state triggers)
  - Web App buttons (Telegram Mini Apps)
  - Switch Inline buttons
- **Layout Operations**:
  - Add button, edit button, delete button, reorder button (move up/down).
  - Enable / disable individual buttons.
  - Reset layout to factory defaults.
  - Export layout as structured JSON snapshot.
  - Import layout from JSON.
- **Action Stability**: Stable internal action IDs prevent text renaming from breaking callback routing.
- **Safety Checks**: Enforces 64-byte Telegram callback data limit and validates URL schemas.

---

## 🛡 4. Multi-Layer Security Engine
- **Secret Verification**: Validates `X-Telegram-Bot-Api-Secret-Token` on every incoming webhook update.
- **Update Deduplication**: Prevents duplicate executions during network retries using KV TTL deduplication keys.
- **Strict Owner Authorization**: Only Owner ID `8226363418` can access master panel and privileged tools.
- **Granular Permissions**: Admins are granted specific capabilities (`can_post_channel`, `can_moderate_group`, `can_manage_scheduled_posts`, `can_view_stats`).
- **Temporary Manager Expiration**: Automated TTL eviction of time-limited managers.
- **Sanitized HTML Validator**: Rejects `<script>`, `<iframe>`, and unclosed tags, allowing only safe Telegram tags.
- **Zero Secret Exposure**: `BOT_TOKEN` and `WEBHOOK_SECRET` are never logged, exported in backups, or transmitted to clients.

---

## 🧩 5. Modular Plugin Architecture
- Pre-reviewed, trusted ES modules compiled into the Worker.
- Runtime plugin registry with versioning, dependency trees, and compatibility verification.
- Owner can enable or disable plugins dynamically from the Owner Panel.
- Isolated error handling prevents faulty submodules from disrupting core routing.
- Safe schema migrations and rollback support.
