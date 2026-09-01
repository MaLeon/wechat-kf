/**
 * JSON Schema for wechat-kf channel config
 *
 * Authoritative source: openclaw.plugin.json → configSchema.
 * This runtime copy must stay in sync with the manifest.
 *
 * Flat enterprise-level credentials. No per-account config needed —
 * kfids are discovered dynamically from webhook callbacks.
 */
export declare const wechatKfConfigSchema: {
    type: "object";
    properties: {
        enabled: {
            type: "boolean";
        };
        corpId: {
            type: "string";
            description: string;
        };
        appSecret: {
            type: "string";
            description: string;
        };
        token: {
            type: "string";
            description: string;
        };
        encodingAESKey: {
            type: "string";
            description: string;
            minLength: number;
            maxLength: number;
        };
        webhookPath: {
            type: "string";
            default: string;
        };
        dmPolicy: {
            type: "string";
            enum: readonly ["open", "pairing", "allowlist", "disabled"];
            default: string;
        };
        allowFrom: {
            type: "array";
            items: {
                type: "string";
            };
        };
        debounceMs: {
            type: "number";
            description: string;
            minimum: number;
            maximum: number;
        };
    };
};
