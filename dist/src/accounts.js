/**
 * Account resolution for WeChat KF
 *
 * Accounts are dynamically discovered from webhook callbacks.
 * Each openKfId becomes an independent accountId (like Telegram chat groups).
 * Enterprise credentials (corpId, appSecret, token, encodingAESKey) are shared.
 */
import { readFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CHANNEL_ID, DEFAULT_WEBHOOK_PATH, DISABLED_KFIDS_FILE, defaultStateDir, formatError, KFIDS_FILE, logTag, } from "./constants.js";
import { atomicWriteFile } from "./fs-utils.js";
import { isKfIdAllowed } from "./kf-policy.js";
import { getSharedContext } from "./monitor.js";
/** In-memory set of discovered kfids */
const discoveredKfIds = new Set();
/** In-memory set of disabled kfids (persisted to disk) */
const disabledKfIds = new Set();
let stateDir = null;
let kfIdsPreloaded = false;
/** Synchronously preload persisted kfIds so listAccountIds returns them before loadKfIds runs */
function preloadKfIdsSync() {
    if (kfIdsPreloaded)
        return;
    kfIdsPreloaded = true;
    const dir = stateDir ?? defaultStateDir();
    try {
        const data = readFileSync(join(dir, KFIDS_FILE), "utf8");
        const ids = JSON.parse(data);
        if (Array.isArray(ids)) {
            for (const id of ids)
                discoveredKfIds.add(id);
        }
    }
    catch (err) {
        if (!(err instanceof Error && "code" in err && err.code === "ENOENT")) {
            console.warn(`${logTag()} failed to preload kfids: ${formatError(err)}`);
        }
    }
    try {
        const data = readFileSync(join(dir, DISABLED_KFIDS_FILE), "utf8");
        const ids = JSON.parse(data);
        if (Array.isArray(ids)) {
            for (const id of ids)
                disabledKfIds.add(id);
        }
    }
    catch (err) {
        if (!(err instanceof Error && "code" in err && err.code === "ENOENT")) {
            console.warn(`${logTag()} failed to preload disabled kfids: ${formatError(err)}`);
        }
    }
}
export function setStateDir(dir) {
    stateDir = dir;
}
export function getChannelConfig(cfg) {
    return (cfg.channels?.[CHANNEL_ID] ?? {});
}
/** Register a dynamically discovered kfid */
export async function registerKfId(kfId) {
    if (!kfId || discoveredKfIds.has(kfId))
        return;
    discoveredKfIds.add(kfId);
    await persistKfIds();
}
/** Get all known kfids */
export function getKnownKfIds() {
    return Array.from(discoveredKfIds);
}
/** Get all known kfids that are currently enabled */
export function getEnabledKfIds() {
    return Array.from(discoveredKfIds).filter((id) => !disabledKfIds.has(id));
}
/** Check whether a kfid is enabled (not in the disabled set) */
export function isKfIdEnabled(kfId) {
    return !disabledKfIds.has(resolveKfId(kfId));
}
/** Disable a kfid (add to disabled set). Returns true if the state changed. */
export async function disableKfId(kfId) {
    if (!kfId)
        return false;
    const resolved = resolveKfId(kfId);
    if (disabledKfIds.has(resolved))
        return false;
    disabledKfIds.add(resolved);
    await persistDisabledKfIds();
    return true;
}
/** Enable a previously disabled kfid. Returns true if the state changed. */
export async function enableKfId(kfId) {
    if (!kfId)
        return false;
    const resolved = resolveKfId(kfId);
    if (!disabledKfIds.has(resolved))
        return false;
    disabledKfIds.delete(resolved);
    await persistDisabledKfIds();
    return true;
}
/**
 * Delete a kfid entirely — removes from discovered set and adds to disabled set
 * so it won't be re-activated if the webhook delivers it again before restart.
 * Returns true if the kfid was known (and thus actually removed).
 */
export async function deleteKfId(kfId) {
    if (!kfId)
        return false;
    const resolved = resolveKfId(kfId);
    const wasKnown = discoveredKfIds.has(resolved);
    discoveredKfIds.delete(resolved);
    disabledKfIds.add(resolved);
    await persistKfIds();
    await persistDisabledKfIds();
    return wasKnown;
}
/**
 * Resolve a potentially lowercased kfId to its original-case form.
 * Falls back to the input if no match is found in the discovered set.
 */
function resolveKfId(kfId) {
    // Direct match — fast path
    if (discoveredKfIds.has(kfId) || disabledKfIds.has(kfId))
        return kfId;
    // Case-insensitive lookup in discovered set
    for (const id of discoveredKfIds) {
        if (id.toLowerCase() === kfId.toLowerCase())
            return id;
    }
    // Case-insensitive lookup in disabled set
    for (const id of disabledKfIds) {
        if (id.toLowerCase() === kfId.toLowerCase())
            return id;
    }
    return kfId;
}
/** Load persisted kfids from state dir */
export async function loadKfIds(dir) {
    stateDir = dir;
    kfIdsPreloaded = true;
    try {
        const data = await readFile(join(dir, KFIDS_FILE), "utf8");
        const ids = JSON.parse(data);
        if (Array.isArray(ids)) {
            for (const id of ids)
                discoveredKfIds.add(id);
        }
    }
    catch (err) {
        if (!(err instanceof Error && "code" in err && err.code === "ENOENT")) {
            console.warn(`${logTag()} failed to load kfids: ${formatError(err)}`);
        }
    }
    try {
        const data = await readFile(join(dir, DISABLED_KFIDS_FILE), "utf8");
        const ids = JSON.parse(data);
        if (Array.isArray(ids)) {
            for (const id of ids)
                disabledKfIds.add(id);
        }
    }
    catch (err) {
        if (!(err instanceof Error && "code" in err && err.code === "ENOENT")) {
            console.warn(`${logTag()} failed to load disabled kfids: ${formatError(err)}`);
        }
    }
}
/** Persist kfids to state dir */
async function persistKfIds() {
    if (!stateDir)
        return;
    try {
        await mkdir(stateDir, { recursive: true });
        await atomicWriteFile(join(stateDir, KFIDS_FILE), JSON.stringify(Array.from(discoveredKfIds)));
    }
    catch (err) {
        getSharedContext()?.botCtx.log?.warn(`${logTag()} failed to persist kfids: ${formatError(err)}`);
    }
}
/** Persist disabled kfids to state dir */
async function persistDisabledKfIds() {
    if (!stateDir)
        return;
    try {
        await mkdir(stateDir, { recursive: true });
        await atomicWriteFile(join(stateDir, DISABLED_KFIDS_FILE), JSON.stringify(Array.from(disabledKfIds)));
    }
    catch (err) {
        getSharedContext()?.botCtx.log?.warn(`${logTag()} failed to persist disabled kfids: ${formatError(err)}`);
    }
}
export function listAccountIds(cfg) {
    // "default" is always first — represents enterprise-level shared infrastructure.
    // Real kfIds follow. When no kfIds are discovered yet, returns ["default"].
    preloadKfIdsSync();
    const config = getChannelConfig(cfg);
    const ids = getEnabledKfIds().filter((id) => isKfIdAllowed(config, id));
    return ["default", ...ids];
}
/**
 * Recover the original case-sensitive kfId from the normalized (lowercased) accountId.
 * OpenClaw core normalizes accountIds to lowercase, but WeChat KF API requires
 * the original case-sensitive openKfId.
 */
function recoverOriginalKfId(normalizedId, configuredIds = []) {
    if (normalizedId === "default")
        return undefined;
    if (discoveredKfIds.has(normalizedId) || configuredIds.includes(normalizedId))
        return normalizedId;
    // Look up the original-case kfId from our discovered set
    for (const kfId of discoveredKfIds) {
        if (kfId.toLowerCase() === normalizedId.toLowerCase())
            return kfId;
    }
    for (const kfId of configuredIds) {
        if (kfId.toLowerCase() === normalizedId.toLowerCase())
            return kfId;
    }
    // Fallback: return as-is (may fail if case matters)
    return normalizedId;
}
/**
 * Reset all module-level mutable state.
 * @internal Exposed for testing only — allows test isolation between runs.
 */
export function _reset() {
    discoveredKfIds.clear();
    disabledKfIds.clear();
    stateDir = null;
    kfIdsPreloaded = false;
}
export function resolveAccount(cfg, accountId) {
    const config = getChannelConfig(cfg);
    const id = accountId ?? "default";
    const corpId = config.corpId;
    const appSecret = config.appSecret;
    const token = config.token;
    const encodingAESKey = config.encodingAESKey;
    const openKfId = recoverOriginalKfId(id, config.allowedKfIds);
    const kfIdDisabled = id !== "default" && (!isKfIdEnabled(id) || !isKfIdAllowed(config, openKfId ?? id));
    const enabled = kfIdDisabled ? false : (config.enabled ?? false);
    const configured = !!(corpId && appSecret && token && encodingAESKey);
    return {
        accountId: id,
        enabled,
        configured,
        corpId,
        appSecret,
        token,
        encodingAESKey,
        openKfId,
        webhookPath: config.webhookPath ?? DEFAULT_WEBHOOK_PATH,
        config,
    };
}
//# sourceMappingURL=accounts.js.map