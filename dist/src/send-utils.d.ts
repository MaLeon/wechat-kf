/**
 * Shared outbound utilities for WeChat KF
 *
 * Extracted helpers used by both outbound paths:
 *   - outbound.ts      (framework-driven direct delivery)
 *   - reply-dispatcher.ts (typing-aware streaming replies)
 *
 * Centralises Markdown formatting, media-type detection, and the
 * upload-then-send media workflow so changes only need to happen once.
 */
/**
 * Split text into chunks that each fit within `byteLimit` UTF-8 bytes.
 *
 * Iterates by code point (safe for surrogate pairs / emoji) and prefers
 * breaking at newline or space boundaries.  When no natural break point
 * exists the chunk is split at the byte-limit boundary (still on a code
 * point edge, never mid-surrogate).
 */
export declare function chunkTextByUtf8Bytes(text: string, byteLimit: number): string[];
/** Markdown to Unicode text formatting (shared by both outbound paths) */
export declare function formatText(text: string): string;
export declare function contentTypeToExt(contentType: string): string;
/** Detect image MIME type from magic bytes (file header) */
export declare function detectImageMime(buffer: Buffer): string | null;
/** Map framework MediaKind to WeChat media type */
export declare function mediaKindToWechatType(kind: string): "image" | "voice" | "video" | "file";
/** Map file extension to WeChat media type */
export declare function detectMediaType(ext: string): "image" | "voice" | "video" | "file";
/** Upload media to WeChat and send via the appropriate message type */
export declare function uploadAndSendMedia(corpId: string, appSecret: string, toUser: string, openKfId: string, buffer: Buffer, filename: string, mediaType: "image" | "voice" | "video" | "file"): Promise<{
    msgid: string;
}>;
/**
 * Download media from an HTTP/HTTPS URL and return the buffer + filename.
 *
 * WeChat does not accept external URLs directly — media must be uploaded to
 * the temporary media store first.  This helper fetches the remote resource
 * so the caller can then pass the buffer through `uploadAndSendMedia`.
 */
export declare function downloadMediaFromUrl(url: string): Promise<{
    buffer: Buffer;
    filename: string;
    ext: string;
}>;
/**
 * Resolve a thumbnail reference to a WeChat thumb_media_id.
 *
 * Accepts three kinds of input:
 *   - URL (http://, https://) or local path (/, ~, file://, data:) → loadWebMedia + uploadMedia
 *   - media_id string (anything else) → used directly
 */
export declare function resolveThumbMediaId(thumbRef: string, corpId: string, appSecret: string): Promise<string>;
