import type { OpenClawPluginConfigSchema } from "openclaw/plugin-sdk";
export declare const pluginConfigSchema: OpenClawPluginConfigSchema;
export declare const PAIRING_APPROVED_MESSAGE = "\u2705 OpenClaw access approved. Send a message to start chatting.";
export declare function formatPairingApproveHint(channelId: string): string;
