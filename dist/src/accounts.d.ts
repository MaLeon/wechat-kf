/**
 * Account resolution for WeChat KF
 *
 * Accounts are dynamically discovered from webhook callbacks.
 * Each openKfId becomes an independent accountId (like Telegram chat groups).
 * Enterprise credentials (corpId, appSecret, token, encodingAESKey) are shared.
 */
import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { ResolvedWechatKfAccount, WechatKfConfig } from "./types.js";
export declare function setStateDir(dir: string): void;
export declare function getChannelConfig(cfg: OpenClawConfig): WechatKfConfig;
/** Register a dynamically discovered kfid */
export declare function registerKfId(kfId: string): Promise<void>;
/** Get all known kfids */
export declare function getKnownKfIds(): string[];
/** Get all known kfids that are currently enabled */
export declare function getEnabledKfIds(): string[];
/** Check whether a kfid is enabled (not in the disabled set) */
export declare function isKfIdEnabled(kfId: string): boolean;
/** Disable a kfid (add to disabled set). Returns true if the state changed. */
export declare function disableKfId(kfId: string): Promise<boolean>;
/** Enable a previously disabled kfid. Returns true if the state changed. */
export declare function enableKfId(kfId: string): Promise<boolean>;
/**
 * Delete a kfid entirely — removes from discovered set and adds to disabled set
 * so it won't be re-activated if the webhook delivers it again before restart.
 * Returns true if the kfid was known (and thus actually removed).
 */
export declare function deleteKfId(kfId: string): Promise<boolean>;
/** Load persisted kfids from state dir */
export declare function loadKfIds(dir: string): Promise<void>;
export declare function listAccountIds(_cfg: OpenClawConfig): string[];
/**
 * Reset all module-level mutable state.
 * @internal Exposed for testing only — allows test isolation between runs.
 */
export declare function _reset(): void;
export declare function resolveAccount(cfg: OpenClawConfig, accountId?: string): ResolvedWechatKfAccount;
