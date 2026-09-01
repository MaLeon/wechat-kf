/**
 * WeChat KF ChannelPlugin implementation
 *
 * Dynamically discovers kfids from webhook callbacks.
 * Each kfid = one accountId = one independent session.
 *
 * Architecture:
 * - "default" account: enterprise-level shared infra (loads kfIds, validates token, sets shared context)
 * - Per-kfId accounts: wait for shared context, then start 30s polling loop
 * - Webhook handler: registered on framework's shared gateway server (no self-managed HTTP server)
 */
import type { ChannelPlugin } from "openclaw/plugin-sdk";
import type { ResolvedWechatKfAccount } from "./types.js";
export declare const wechatKfPlugin: ChannelPlugin<ResolvedWechatKfAccount>;
