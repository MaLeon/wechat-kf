/**
 * Reply dispatcher for WeChat KF  (typing-aware streaming replies)
 *
 * Responsibility:
 *   This module is used internally by `bot.ts` when the agent streams tokens
 *   back to the user. It wraps OpenClaw's `createReplyDispatcherWithTyping` to
 *   batch tokens into natural-looking messages with simulated human typing
 *   delay, then delivers them through the WeChat KF API.
 *
 *   Text chunking is performed at delivery time via `chunkTextByUtf8Bytes`
 *   (UTF-8 byte-aware, NOT the framework auto-chunker), because streaming
 *   replies accumulate text incrementally.
 *
 * Counterpart:
 *   `outbound.ts` handles the *other* outbound path: framework-driven direct
 *   delivery where the framework itself pre-chunks text via the declared
 *   `chunker` function.
 *
 * accountId = openKfId (dynamically discovered)
 */
import type { OpenClawConfig, PluginRuntime } from "openclaw/plugin-sdk";
/** Minimal runtime shape used only for error logging in the reply dispatcher. */
type RuntimeErrorLogger = {
    error?: (...args: unknown[]) => void;
    [key: string]: unknown;
};
export type CreateReplyDispatcherParams = {
    cfg: OpenClawConfig;
    agentId: string;
    runtime: RuntimeErrorLogger;
    externalUserId: string;
    openKfId: string;
    accountId: string;
};
export declare function createReplyDispatcher(params: CreateReplyDispatcherParams): ReturnType<PluginRuntime["channel"]["reply"]["createReplyDispatcherWithTyping"]>;
export {};
