/**
 * JSON Schema for wechat-kf channel config
 *
 * Authoritative source: openclaw.plugin.json → channelConfigs.wechat-kf.schema.
 * This runtime copy must stay in sync with the manifest.
 *
 * Flat enterprise-level credentials. No per-account config needed —
 * kfids are discovered dynamically from webhook callbacks.
 */

import { DEFAULT_WEBHOOK_PATH } from "./constants.js";

export const wechatKfConfigSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    enabled: { type: "boolean" as const },
    corpId: { type: "string" as const, description: "WeCom Corp ID (企业ID)" },
    appSecret: {
      type: "string" as const,
      description: "Self-built app secret authorized for WeCom Customer Service API",
    },
    token: { type: "string" as const, description: "Webhook callback token" },
    encodingAESKey: {
      type: "string" as const,
      description: "43-character base64 AES key",
      minLength: 43,
      maxLength: 43,
    },
    webhookPath: { type: "string" as const, default: DEFAULT_WEBHOOK_PATH },
    dmPolicy: {
      type: "string" as const,
      enum: ["open", "pairing", "allowlist", "disabled"] as const,
      default: "open",
    },
    allowFrom: { type: "array" as const, items: { type: "string" as const } },
    allowedKfIds: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Allowed customer-service account IDs; omitted or empty allows all discovered accounts",
    },
    groupAllowFrom: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Legacy setting retained for compatibility; this channel supports direct messages only",
    },
    debounceMs: {
      type: "number" as const,
      description: "Inbound message debounce window in milliseconds (0 = disabled)",
      minimum: 0,
      maximum: 10000,
    },
  },
};
