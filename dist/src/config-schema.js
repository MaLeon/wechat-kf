/**
 * JSON Schema for wechat-kf channel config
 *
 * Authoritative source: openclaw.plugin.json → configSchema.
 * This runtime copy must stay in sync with the manifest.
 *
 * Flat enterprise-level credentials. No per-account config needed —
 * kfids are discovered dynamically from webhook callbacks.
 */
import { DEFAULT_WEBHOOK_PATH } from "./constants.js";
export const wechatKfConfigSchema = {
    type: "object",
    properties: {
        enabled: { type: "boolean" },
        corpId: { type: "string", description: "WeCom Corp ID (企业ID)" },
        appSecret: { type: "string", description: "Self-built app secret (应用密钥)" },
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
        debounceMs: {
            type: "number",
            description: "Inbound message debounce window in milliseconds (0 = disabled)",
            minimum: 0,
            maximum: 10000,
        },
    },
};
//# sourceMappingURL=config-schema.js.map