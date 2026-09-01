/** Channel identifier — single source of truth for the plugin ID string. */
export declare const CHANNEL_ID: "wechat-kf";
/** Default webhook path registered on the framework's shared gateway. */
export declare const DEFAULT_WEBHOOK_PATH: string;
/** Config key prefix for this channel in OpenClaw config. */
export declare const CONFIG_KEY: string;
/** Build a log-tag prefix: `[wechat-kf]` or `[wechat-kf:kfId]`. */
export declare function logTag(kfId?: string): string;
/** Default state directory for cursor and kfid persistence. */
export declare function defaultStateDir(): string;
/** Cursor file name for a given kfId. */
export declare function cursorFileName(kfId: string): string;
/** Persisted file name for discovered kfids. */
export declare const KFIDS_FILE: string;
/** Persisted file name for disabled kfids. */
export declare const DISABLED_KFIDS_FILE: string;
/** WeChat KF text message byte limit (API enforces 2048 UTF-8 bytes) */
export declare const WECHAT_TEXT_CHUNK_LIMIT = 2048;
/** Safety margin subtracted from WECHAT_TEXT_CHUNK_LIMIT for chunking */
export declare const WECHAT_TEXT_CHUNK_BYTE_SAFETY_MARGIN = 48;
/** Timeout for token fetch requests (ms) */
export declare const TOKEN_FETCH_TIMEOUT_MS = 15000;
/** Timeout for API POST requests (ms) */
export declare const API_POST_TIMEOUT_MS = 30000;
/** Timeout for media download/upload requests (ms) */
export declare const MEDIA_TIMEOUT_MS = 60000;
/** WeChat errcode values that indicate an expired or invalid access token */
export declare const TOKEN_EXPIRED_CODES: Set<number>;
/**
 * WeChat KF errcode indicating the 48-hour / 5-message session limit has
 * been exceeded. When a customer service session is inactive for 48 hours,
 * or the agent has already sent 5 messages without a customer reply, the
 * API returns this error.
 */
export declare const WECHAT_MSG_LIMIT_ERRCODE = 95026;
/** Timeout for downloading media from external HTTP URLs (ms) */
export declare const MEDIA_DOWNLOAD_TIMEOUT_MS = 60000;
/** Max age (seconds) for inbound messages. Messages older than this are skipped. */
export declare const MAX_MESSAGE_AGE_S = 300;
/** Format an unknown caught value for log messages (no stack traces). */
export declare function formatError(err: unknown): string;
