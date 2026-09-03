import type { WechatKfConfig } from "./types.js";
/** Match the original, case-sensitive WeCom account ID after account resolution. */
export declare function isKfIdAllowed(config: WechatKfConfig, openKfId: string): boolean;
export declare function assertKfIdAllowed(config: WechatKfConfig, openKfId: string): void;
