import { logTag } from "./constants.js";
import type { WechatKfConfig } from "./types.js";

/** Match the original, case-sensitive WeCom account ID after account resolution. */
export function isKfIdAllowed(config: WechatKfConfig, openKfId: string): boolean {
  const allowed = config.allowedKfIds;
  return !allowed?.length || allowed.includes(openKfId);
}

export function assertKfIdAllowed(config: WechatKfConfig, openKfId: string): void {
  if (!isKfIdAllowed(config, openKfId)) {
    throw new Error(`${logTag(openKfId)} account is not in allowedKfIds`);
  }
}
