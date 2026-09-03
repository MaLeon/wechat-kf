import { logTag } from "./constants.js";
/** Match the original, case-sensitive WeCom account ID after account resolution. */
export function isKfIdAllowed(config, openKfId) {
    const allowed = config.allowedKfIds;
    return !allowed?.length || allowed.includes(openKfId);
}
export function assertKfIdAllowed(config, openKfId) {
    if (!isKfIdAllowed(config, openKfId)) {
        throw new Error(`${logTag(openKfId)} account is not in allowedKfIds`);
    }
}
//# sourceMappingURL=kf-policy.js.map