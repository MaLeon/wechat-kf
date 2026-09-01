/**
 * Shared context manager for WeChat KF plugin
 *
 * Provides a rendezvous point between the "default" account (which sets up
 * enterprise-level shared infrastructure) and per-kfId accounts (which need
 * the shared crypto config and BotContext to start polling).
 */
import type { BotContext } from "./bot.js";
export type SharedContext = {
    callbackToken: string;
    encodingAESKey: string;
    corpId: string;
    appSecret: string;
    webhookPath: string;
    botCtx: BotContext;
};
export declare function setPairingKfId(externalUserId: string, openKfId: string): void;
export declare function getPairingKfId(externalUserId: string): string | undefined;
/** Set the shared context. Resolves any pending waitForSharedContext calls. */
export declare function setSharedContext(ctx: SharedContext): void;
/** Get the shared context, or null if not yet set. */
export declare function getSharedContext(): SharedContext | null;
/**
 * Wait until the shared context is set.
 * Rejects if the signal aborts before the context is ready.
 */
export declare function waitForSharedContext(signal?: AbortSignal): Promise<SharedContext>;
/** Clear the shared context (used during shutdown). */
export declare function clearSharedContext(): void;
/** Reset all module-level state. @internal For testing only. */
export declare function _reset(): void;
