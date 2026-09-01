/**
 * HTTP webhook handler for WeChat KF callbacks
 *
 * Handles:
 * - GET: URL verification (echostr decrypt)
 * - POST: Event notification (decrypt XML → trigger sync_msg)
 *
 * Designed to be registered on the framework's shared gateway server
 * via api.registerHttpRoute({ path, handler }).
 */
import type { IncomingMessage, ServerResponse } from "node:http";
export declare function parseQuery(url: string): Record<string, string>;
export declare function readBody(req: IncomingMessage, maxSize?: number): Promise<string>;
/** Extract a tag value from XML string */
export declare function xmlTag(xml: string, tag: string): string | undefined;
/**
 * Framework-compatible HTTP handler for WeChat KF webhooks.
 *
 * The framework routes requests by path, so this handler only needs
 * to process the request — no path matching required.
 */
export declare function handleWechatKfWebhook(req: IncomingMessage, res: ServerResponse): Promise<void>;
