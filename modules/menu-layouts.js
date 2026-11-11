/**
 * SHIV YOGI ASSISTANT - V4.0.0 ADVANCED EDITION
 * MODULE: menu-layouts.js
 * Default and dynamic menu layout specifications
 *
 * Supported Layout Contexts:
 * - start: Start Menu
 * - help: Help Guide Menu
 * - owner: Owner Home Panel
 * - group: Group Moderation Menu
 * - channel: Channel Management Menu
 * - custom: User-defined custom menus
 */

export const DEFAULT_LAYOUTS = {
  // Start Menu Layout
  start: {
    name: "Start Menu",
    description: "Primary welcoming keyboard shown on /start",
    layout_type: "custom", // 2x2 + 1
    buttons: [
      { id: "btn_start_channel", text: "🖼 The Endless Playback", type: "url", target: "https://t.me/the_endless_playback", row: 0, order: 0, enabled: true },
      { id: "btn_start_group", text: "💬 Discussion Group", type: "url", target: "https://t.me/the_endless_playback_chat", row: 0, order: 1, enabled: true },
      { id: "btn_start_contact", text: "✉ Contact Owner", type: "url", target: "https://t.me/shiv_yogi_19", row: 1, order: 0, enabled: true },
      { id: "btn_start_help", text: "📖 Help Guide", type: "callback", target: "lang:help", row: 1, order: 1, enabled: true },
      { id: "btn_start_lang", text: "🌐 Change Language", type: "callback", target: "lang:selector", row: 2, order: 0, enabled: true }
    ]
  },

  // Help Menu Layout
  help: {
    name: "Help Menu",
    description: "Command and assistance navigation",
    layout_type: "2_per_row",
    buttons: [
      { id: "btn_help_rules", text: "📜 Community Rules", type: "callback", target: "p:welc_rules", row: 0, order: 0, enabled: true },
      { id: "btn_help_about", text: "ℹ️ About Bot", type: "callback", target: "u:about", row: 0, order: 1, enabled: true },
      { id: "btn_help_lang", text: "🌐 Language", type: "callback", target: "lang:selector", row: 1, order: 0, enabled: true },
      { id: "btn_help_contact", text: "✉ Support", type: "url", target: "https://t.me/shiv_yogi_19", row: 1, order: 1, enabled: true },
      { id: "btn_help_back", text: "🔙 Back", type: "callback", target: "p:user_back_start", row: 2, order: 0, enabled: true }
    ]
  },

  // Owner Panel Home Menu (Exactly 8 Sections + Close)
  owner: {
    name: "Owner Control Panel",
    description: "Master administrative navigation with exactly 8 core sections",
    layout_type: "2_per_row",
    buttons: [
      { id: "btn_p_dash", text: "📊 Dashboard", type: "callback", target: "p:dash", row: 0, order: 0, enabled: true },
      { id: "btn_p_settings", text: "⚙️ Bot Settings", type: "callback", target: "p:settings", row: 0, order: 1, enabled: true },
      { id: "btn_p_users", text: "👤 User Management", type: "callback", target: "p:users", row: 1, order: 0, enabled: true },
      { id: "btn_p_group", text: "👥 Group Management", type: "callback", target: "p:grp", row: 1, order: 1, enabled: true },
      { id: "btn_p_channel", text: "📢 Channel Management", type: "callback", target: "p:chan", row: 2, order: 0, enabled: true },
      { id: "btn_p_custom", text: "🎨 Message Customisation", type: "callback", target: "p:custom", row: 2, order: 1, enabled: true },
      { id: "btn_p_rwelcome", text: "👋 Random Welcome", type: "callback", target: "p:rwelc", row: 3, order: 0, enabled: true },
      { id: "btn_p_rreply", text: "🔁 Random Replies", type: "callback", target: "p:rreply", row: 3, order: 1, enabled: true },
      { id: "btn_p_close", text: "❌ Close Panel", type: "callback", target: "p:close", row: 4, order: 0, enabled: true }
    ]
  },

  // Group Management Menu
  group: {
    name: "Group Moderation Menu",
    description: "Community moderation and filter configuration",
    layout_type: "2_per_row",
    buttons: [
      { id: "btn_grp_captcha", text: "🛡 CAPTCHA Settings", type: "callback", target: "p:ftgl:captcha_verification", row: 0, order: 0, enabled: true },
      { id: "btn_grp_spam", text: "🚫 Anti-Spam / Flood", type: "callback", target: "p:ftgl:anti_spam", row: 0, order: 1, enabled: true },
      { id: "btn_grp_link", text: "🔗 Link Filter", type: "callback", target: "p:ftgl:link_filter", row: 1, order: 0, enabled: true },
      { id: "btn_grp_words", text: "🤬 Banned Words", type: "callback", target: "p:ftgl:word_filter", row: 1, order: 1, enabled: true },
      { id: "btn_grp_mod", text: "⚖️ Moderation Center", type: "callback", target: "p:mod", row: 2, order: 0, enabled: true },
      { id: "btn_grp_rules", text: "📜 Community Rules", type: "callback", target: "p:welc_rules", row: 2, order: 1, enabled: true },
      { id: "btn_grp_back", text: "🔙 Back to Home", type: "callback", target: "p:main", row: 3, order: 0, enabled: true }
    ]
  },

  // Channel Management Menu
  channel: {
    name: "Channel Management Menu",
    description: "Broadcast, draft composition, and scheduled post management",
    layout_type: "2_per_row",
    buttons: [
      { id: "btn_chan_add", text: "➕ Add Channel", type: "callback", target: "p:chan:add_prompt", row: 0, order: 0, enabled: true },
      { id: "btn_chan_draft", text: "📝 Draft Post", type: "callback", target: "p:chan:draft", row: 0, order: 1, enabled: true },
      { id: "btn_chan_sched", text: "⏰ Scheduled Posts", type: "callback", target: "p:sched", row: 1, order: 0, enabled: true },
      { id: "btn_chan_audit", text: "🔍 Audit Permissions", type: "callback", target: "p:chan:check_admin", row: 1, order: 1, enabled: true },
      { id: "btn_chan_hist", text: "📜 Post History", type: "callback", target: "p:chan:hist", row: 2, order: 0, enabled: true },
      { id: "btn_chan_bcast", text: "📡 Broadcast All", type: "callback", target: "p:chan:broadcast_prompt", row: 2, order: 1, enabled: true },
      { id: "btn_chan_back", text: "🔙 Back to Home", type: "callback", target: "p:main", row: 3, order: 0, enabled: true }
    ]
  },

  // Custom Menus
  custom: {
    name: "Custom Menus",
    description: "User-defined custom keyboard layouts",
    layout_type: "vertical",
    buttons: []
  }
};
