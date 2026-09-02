/**
 * Outbound message adapter for WeChat KF  (framework-driven direct delivery)
 *
 * Responsibility:
 *   This module implements the OpenClaw `ChannelPlugin.outbound` interface and
 *   is called by the framework when the agent produces a final reply.
 *
 *   Text is first converted from markdown to Unicode formatting (formatText),
 *   then chunked by UTF-8 byte length via `chunkTextByUtf8Bytes` (WeChat API
 *   enforces a 2048-byte limit on text.content).  Framework auto-chunking is
 *   disabled (`chunker: null`) because it would chunk *before* formatting,
 *   causing post-format expansion to exceed the limit.
 *
 *   For media, the framework's `loadWebMedia` handles all URL formats
 *   (HTTP, file://, local paths, MEDIA: prefix, ~), then the buffer is
 *   uploaded to WeChat and sent using `uploadAndSendMedia` from `send-utils.ts`.
 *
 * WeChat KF session limits:
 *   The API enforces a 48-hour / 5-message limit per session window.
 *   Once a customer sends a message, the agent may reply with up to 5 messages
 *   within 48 hours.  After that, sending returns errcode 95026.
 *   This module detects that error and logs a clear warning rather than
 *   propagating a generic failure.
 *
 * Counterpart:
 *   `reply-dispatcher.ts` handles the *other* outbound path: typing-aware
 *   streaming replies dispatched internally by `bot.ts`.
 *
 * accountId = openKfId (dynamically discovered)
 */
import type { ChannelOutboundAdapter } from "openclaw/plugin-sdk/channel-runtime";
export declare const wechatKfOutbound: ChannelOutboundAdapter;
