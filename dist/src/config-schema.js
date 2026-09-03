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
    type: "object",
    additionalProperties: false,
    properties: {
        enabled: { type: "boolean" },
        corpId: { type: "string", description: "WeCom Corp ID (企业ID)" },
        appSecret: {
            type: "string",
            description: "Self-built app secret authorized for WeCom Customer Service API",
        },
        token: { type: "string", description: "Webhook callback token" },
        encodingAESKey: {
            type: "string",
            description: "43-character base64 AES key",
            minLength: 43,
            maxLength: 43,
        },
        webhookPath: { type: "string", default: DEFAULT_WEBHOOK_PATH },
        dmPolicy: {
            type: "string",
            enum: ["open", "pairing", "allowlist", "disabled"],
            default: "open",
        },
        allowFrom: { type: "array", items: { type: "string" } },
        allowedKfIds: {
            type: "array",
            items: { type: "string" },
            description: "Allowed customer-service account IDs; omitted or empty allows all discovered accounts",
        },
        groupAllowFrom: {
            type: "array",
            items: { type: "string" },
            description: "Legacy setting retained for compatibility; this channel supports direct messages only",
        },
        debounceMs: {
            type: "number",
            description: "Inbound message debounce window in milliseconds (0 = disabled)",
            minimum: 0,
            maximum: 10000,
        },
    },
};
//# sourceMappingURL=config-schema.js.map