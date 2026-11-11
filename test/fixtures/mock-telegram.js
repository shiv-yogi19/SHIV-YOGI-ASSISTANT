/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST FIXTURE: mock-telegram.js
 * Strict Telegram API Mock and In-Memory Cloudflare KV Simulator.
 * Explicitly validates methods, required parameters, and failure modes.
 */

export const SUPPORTED_TELEGRAM_METHODS = new Set([
  "getMe",
  "sendMessage",
  "editMessageText",
  "answerCallbackQuery",
  "deleteMessage",
  "pinChatMessage",
  "unpinChatMessage",
  "sendPhoto",
  "sendVideo",
  "sendDocument",
  "restrictChatMember",
  "banChatMember",
  "unbanChatMember",
  "setChatPermissions",
  "getChatMember",
  "getChat",
  "getWebhookInfo",
  "setWebhook"
]);

export class MockTelegramApi {
  constructor() {
    this.calls = [];
    this.simulatedFailures = new Map();
    this.networkErrors = new Set();
    this.botInfo = {
      id: 8226363418,
      is_bot: true,
      first_name: "SHIV YOGI ASSISTANT",
      username: "shiv_yogi_assist_bot",
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false
    };
    this.webhookInfo = {
      url: "https://shiv-yogi-assistant.shivyogi-x19.workers.dev/",
      has_custom_certificate: false,
      pending_update_count: 0,
      last_error_message: null,
      max_connections: 40
    };
  }

  simulateFailure(method, errorCode = 400, description = "Simulated API Failure") {
    this.simulatedFailures.set(method, { errorCode, description });
  }

  simulateNetworkError(method) {
    this.networkErrors.add(method);
  }

  clearSimulations() {
    this.simulatedFailures.clear();
    this.networkErrors.clear();
  }

  resetCalls() {
    this.calls = [];
  }

  getCallsForMethod(method) {
    return this.calls.filter(c => c.method === method);
  }

  getLastCall(method = null) {
    if (method) {
      const calls = this.getCallsForMethod(method);
      return calls[calls.length - 1] || null;
    }
    return this.calls[this.calls.length - 1] || null;
  }

  async handleCall(method, payload = {}) {
    this.calls.push({ method, payload, timestamp: Date.now() });

    // Check for simulated network crash
    if (this.networkErrors.has(method)) {
      throw new Error(`ECONNRESET: Network failure connecting to Telegram API [${method}]`);
    }

    // Check for simulated API failure
    if (this.simulatedFailures.has(method)) {
      const sim = this.simulatedFailures.get(method);
      return {
        ok: false,
        error_code: sim.errorCode,
        description: sim.description
      };
    }

    // Strictly reject unknown methods
    if (!SUPPORTED_TELEGRAM_METHODS.has(method)) {
      return {
        ok: false,
        error_code: 404,
        description: `Not Found: method ${method} does not exist in Telegram Bot API`
      };
    }

    // Method-specific parameter validation and realistic responses
    switch (method) {
      case "getMe":
        return { ok: true, result: this.botInfo };

      case "getWebhookInfo":
        return { ok: true, result: this.webhookInfo };

      case "setWebhook":
        if (!payload.url) {
          return { ok: false, error_code: 400, description: "Bad Request: url parameter is missing" };
        }
        this.webhookInfo.url = payload.url;
        return { ok: true, result: true, description: "Webhook was set" };

      case "sendMessage":
        if (!payload.chat_id || payload.text === undefined) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and text are required" };
        }
        return {
          ok: true,
          result: {
            message_id: 1000 + this.calls.length,
            date: Math.floor(Date.now() / 1000),
            chat: { id: payload.chat_id, type: "private" },
            text: payload.text
          }
        };

      case "editMessageText":
        if (!payload.chat_id || !payload.message_id || payload.text === undefined) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id, message_id and text required" };
        }
        return {
          ok: true,
          result: {
            message_id: payload.message_id,
            date: Math.floor(Date.now() / 1000),
            chat: { id: payload.chat_id, type: "private" },
            text: payload.text
          }
        };

      case "sendPhoto":
        if (!payload.chat_id || !payload.photo) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and photo required" };
        }
        return {
          ok: true,
          result: {
            message_id: 1000 + this.calls.length,
            photo: [{ file_id: payload.photo }],
            caption: payload.caption || ""
          }
        };

      case "sendVideo":
        if (!payload.chat_id || !payload.video) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and video required" };
        }
        return {
          ok: true,
          result: {
            message_id: 1000 + this.calls.length,
            video: { file_id: payload.video },
            caption: payload.caption || ""
          }
        };

      case "sendDocument":
        if (!payload.chat_id || !payload.document) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and document required" };
        }
        return {
          ok: true,
          result: {
            message_id: 1000 + this.calls.length,
            document: { file_id: payload.document },
            caption: payload.caption || ""
          }
        };

      case "answerCallbackQuery":
        if (!payload.callback_query_id) {
          return { ok: false, error_code: 400, description: "Bad Request: callback_query_id required" };
        }
        return { ok: true, result: true };

      case "deleteMessage":
        if (!payload.chat_id || !payload.message_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and message_id required" };
        }
        return { ok: true, result: true };

      case "pinChatMessage":
        if (!payload.chat_id || !payload.message_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and message_id required" };
        }
        return { ok: true, result: true };

      case "unpinChatMessage":
        if (!payload.chat_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id required" };
        }
        return { ok: true, result: true };

      case "restrictChatMember":
        if (!payload.chat_id || !payload.user_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and user_id required" };
        }
        return { ok: true, result: true };

      case "banChatMember":
        if (!payload.chat_id || !payload.user_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and user_id required" };
        }
        return { ok: true, result: true };

      case "unbanChatMember":
        if (!payload.chat_id || !payload.user_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and user_id required" };
        }
        return { ok: true, result: true };

      case "getChatMember":
        if (!payload.chat_id || !payload.user_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id and user_id required" };
        }
        return {
          ok: true,
          result: {
            status: "administrator",
            can_post_messages: true,
            can_edit_messages: true,
            can_delete_messages: true,
            can_pin_messages: true,
            can_restrict_members: true
          }
        };

      case "getChat":
        if (!payload.chat_id) {
          return { ok: false, error_code: 400, description: "Bad Request: chat_id required" };
        }
        return {
          ok: true,
          result: {
            id: payload.chat_id,
            title: "The Endless Playback",
            type: "channel"
          }
        };

      default:
        return { ok: true, result: true };
    }
  }

  /**
   * Installs this mock as the global fetch handler
   */
  installGlobalFetch() {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.includes("api.telegram.org/bot")) {
        const parts = urlStr.split("/");
        const method = parts[parts.length - 1];
        let payload = {};
        if (options.body) {
          try {
            payload = JSON.parse(options.body);
          } catch (e) {
            payload = {};
          }
        }
        const result = await this.handleCall(method, payload);
        return {
          ok: result.ok,
          status: result.ok ? 200 : result.error_code || 400,
          json: async () => result,
          text: async () => JSON.stringify(result)
        };
      }
      return originalFetch(url, options);
    };
  }
}

export class MockKV {
  constructor() {
    this.store = new Map();
  }

  async get(key, type = "text") {
    const val = this.store.get(key);
    if (val === undefined || val === null) return null;
    if (type === "json") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return null;
      }
    }
    return String(val);
  }

  async put(key, value, options = {}) {
    const str = typeof value === "object" ? JSON.stringify(value) : String(value);
    this.store.set(key, str);
  }

  async delete(key) {
    this.store.delete(key);
  }

  async list({ prefix = "" } = {}) {
    const keys = [];
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) {
        keys.push({ name: k });
      }
    }
    return { keys };
  }
}
