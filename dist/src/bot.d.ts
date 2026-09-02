/**
 * Message processing — pull messages via sync_msg and dispatch to OpenClaw agent.
 *
 * Architecture:
 * - Each openKfId is an independent account with its own cursor and session
 * - sync_msg is called with open_kfid filter to only pull messages for that kf account
 * - Plugin layer: download media, save via MediaPaths/MediaTypes
 * - OpenClaw runner: handles media understanding (transcription, vision, etc.)
 */
import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { ChannelLogSink } from "openclaw/plugin-sdk/channel-runtime";
import type { ResolvedWechatKfAccount, WechatKfMessage } from "./types.js";
/** Minimal runtime shape used only for error logging in the reply dispatcher. */
export type RuntimeErrorLogger = {
    error?: (...args: unknown[]) => void;
    [key: string]: unknown;
};
export type BotContext = {
    cfg: OpenClawConfig;
    runtime?: RuntimeErrorLogger;
    stateDir: string;
    log?: ChannelLogSink;
};
declare function isDuplicate(msgid: string): boolean;
/** Exposed for testing only — do not use in production code. */
export declare const _testing: {
    kfLocks: Map<string, Promise<void>>;
    processedMsgIds: Set<string>;
    isDuplicate: typeof isDuplicate;
    DEDUP_MAX_SIZE: number;
    handleEvent: typeof handleEvent;
    resetState(): void;
};
declare function handleEvent(ctx: BotContext, _account: ResolvedWechatKfAccount, msg: WechatKfMessage): Promise<void>;
export declare function handleWebhookEvent(ctx: BotContext, openKfId: string, syncToken: string): Promise<void>;
export {};
