/**
 * Shared context manager for WeChat KF plugin
 *
 * Provides a rendezvous point between the "default" account (which sets up
 * enterprise-level shared infrastructure) and per-kfId accounts (which need
 * the shared crypto config and BotContext to start polling).
 */
// ── Module-level state ──
let sharedCtx = null;
let readyResolve = null;
let readyPromise = null;
/** Cache: externalUserId → openKfId for pairing approval notifications. */
const pairingKfIdCache = new Map();
export function setPairingKfId(externalUserId, openKfId) {
    pairingKfIdCache.set(externalUserId, openKfId);
}
export function getPairingKfId(externalUserId) {
    return pairingKfIdCache.get(externalUserId);
}
function ensureReadyPromise() {
    if (!readyPromise) {
        readyPromise = new Promise((resolve) => {
            readyResolve = resolve;
        });
    }
    return readyPromise;
}
/** Set the shared context. Resolves any pending waitForSharedContext calls. */
export function setSharedContext(ctx) {
    sharedCtx = ctx;
    // Resolve waiting callers
    if (readyResolve) {
        readyResolve();
        readyResolve = null;
    }
}
/** Get the shared context, or null if not yet set. */
export function getSharedContext() {
    return sharedCtx;
}
/**
 * Wait until the shared context is set.
 * Rejects if the signal aborts before the context is ready.
 */
export function waitForSharedContext(signal) {
    // Already available — fast path
    if (sharedCtx)
        return Promise.resolve(sharedCtx);
    // Already aborted
    if (signal?.aborted) {
        return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
    }
    const ready = ensureReadyPromise();
    return new Promise((resolve, reject) => {
        const onReady = () => {
            signal?.removeEventListener("abort", onAbort);
            resolve(sharedCtx);
        };
        const onAbort = () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        ready.then(onReady);
    });
}
/** Clear the shared context (used during shutdown). */
export function clearSharedContext() {
    sharedCtx = null;
    readyPromise = null;
    readyResolve = null;
    pairingKfIdCache.clear();
}
/** Reset all module-level state. @internal For testing only. */
export function _reset() {
    sharedCtx = null;
    readyResolve = null;
    readyPromise = null;
    pairingKfIdCache.clear();
}
//# sourceMappingURL=monitor.js.map