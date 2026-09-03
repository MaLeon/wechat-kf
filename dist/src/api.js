/**
 * WeCom Customer Service API wrapper
 */
import { extname } from "node:path";
import { API_POST_TIMEOUT_MS, logTag, MEDIA_TIMEOUT_MS, TOKEN_EXPIRED_CODES } from "./constants.js";
import { getSharedContext } from "./monitor.js";
import { clearAccessToken, getAccessToken } from "./token.js";
const MIME_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".amr": "audio/amr",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".silk": "audio/silk",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
};
const BASE = "https://qyapi.weixin.qq.com/cgi-bin";
/**
 * Check whether a WeCom API response indicates a business error.
 * Successful responses have errcode === 0 or omit errcode entirely (undefined).
 * Using a truthy check so that both 0 and undefined are treated as success.
 */
function hasApiError(errcode) {
    return !!errcode;
}
async function apiPost(path, token, body) {
    const resp = await fetch(`${BASE}${path}?access_token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(API_POST_TIMEOUT_MS),
    });
    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`${logTag()} API ${path} HTTP ${resp.status}: ${text.slice(0, 200)}`);
    }
    return (await resp.json());
}
/**
 * Call apiPost with automatic token refresh on token-expired errors.
 * Detects errcode 40014/42001/40001, clears the cached token, fetches a
 * new one and retries exactly once.
 */
async function apiPostWithTokenRetry(path, corpId, appSecret, body) {
    let token = await getAccessToken(corpId, appSecret);
    const data = await apiPost(path, token, body);
    const result = data;
    if (typeof result.errcode === "number" && TOKEN_EXPIRED_CODES.has(result.errcode)) {
        getSharedContext()?.botCtx.log?.info(`${logTag()} token expired (errcode=${result.errcode}), refreshing and retrying ${path}`);
        clearAccessToken(corpId, appSecret);
        token = await getAccessToken(corpId, appSecret);
        return apiPost(path, token, body);
    }
    return data;
}
/** Pull messages from WeChat KF */
export async function syncMessages(corpId, appSecret, params) {
    const data = await apiPostWithTokenRetry("/kf/sync_msg", corpId, appSecret, params);
    if (hasApiError(data.errcode)) {
        throw new Error(`${logTag()} sync_msg failed: ${data.errcode} ${data.errmsg}`);
    }
    return data;
}
async function sendMessage(corpId, appSecret, toUser, openKfId, msgtype, payload) {
    const body = {
        ...payload,
        // Raw directives may supply message content, but cannot change the
        // account or recipient selected and authorized by the caller.
        touser: toUser,
        open_kfid: openKfId,
        msgtype,
    };
    const data = await apiPostWithTokenRetry("/kf/send_msg", corpId, appSecret, body);
    if (hasApiError(data.errcode)) {
        throw new Error(`${logTag()} send_msg failed: ${data.errcode} ${data.errmsg}`);
    }
    return data;
}
/** Send a text message to a WeChat user */
export function sendTextMessage(corpId, appSecret, toUser, openKfId, content) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "text", { text: { content } });
}
/** Download media file from WeChat */
export async function downloadMedia(corpId, appSecret, mediaId) {
    const attemptDownload = async (token) => {
        const resp = await fetch(`${BASE}/media/get?access_token=${token}&media_id=${mediaId}`, {
            signal: AbortSignal.timeout(MEDIA_TIMEOUT_MS),
        });
        if (!resp.ok) {
            throw new Error(`${logTag()} download media failed: ${resp.status} ${resp.statusText}`);
        }
        const contentType = resp.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            const data = (await resp.json());
            return { buffer: Buffer.alloc(0), contentType, errcode: data.errcode, errmsg: data.errmsg };
        }
        return { buffer: Buffer.from(await resp.arrayBuffer()), contentType };
    };
    let token = await getAccessToken(corpId, appSecret);
    const result = await attemptDownload(token);
    if (result.errcode !== undefined) {
        // Token-expired error: clear and retry once
        if (TOKEN_EXPIRED_CODES.has(result.errcode)) {
            getSharedContext()?.botCtx.log?.info(`${logTag()} token expired (errcode=${result.errcode}), refreshing and retrying media download`);
            clearAccessToken(corpId, appSecret);
            token = await getAccessToken(corpId, appSecret);
            const retry = await attemptDownload(token);
            if (retry.errcode !== undefined) {
                throw new Error(`${logTag()} download media failed: ${retry.errcode} ${retry.errmsg}`);
            }
            return { buffer: retry.buffer, contentType: retry.contentType };
        }
        throw new Error(`${logTag()} download media failed: ${result.errcode} ${result.errmsg}`);
    }
    return { buffer: result.buffer, contentType: result.contentType };
}
/** Upload media file to WeChat */
export async function uploadMedia(corpId, appSecret, type, buffer, filename) {
    const doUpload = async (token) => {
        const formData = new FormData();
        const ext = extname(filename).toLowerCase();
        const mime = MIME_MAP[ext] ?? "application/octet-stream";
        const blob = new Blob([new Uint8Array(buffer)], { type: mime });
        formData.append("media", blob, filename);
        const resp = await fetch(`${BASE}/media/upload?access_token=${token}&type=${type}`, {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(MEDIA_TIMEOUT_MS),
        });
        if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(`${logTag()} upload media HTTP ${resp.status}: ${text.slice(0, 200)}`);
        }
        return (await resp.json());
    };
    let token = await getAccessToken(corpId, appSecret);
    let data = await doUpload(token);
    if (TOKEN_EXPIRED_CODES.has(data.errcode)) {
        getSharedContext()?.botCtx.log?.info(`${logTag()} token expired (errcode=${data.errcode}), refreshing and retrying media upload`);
        clearAccessToken(corpId, appSecret);
        token = await getAccessToken(corpId, appSecret);
        data = await doUpload(token);
    }
    if (hasApiError(data.errcode)) {
        throw new Error(`${logTag()} upload media failed: ${data.errcode} ${data.errmsg}`);
    }
    return data;
}
/** Send an image message to a WeChat user */
export function sendImageMessage(corpId, appSecret, toUser, openKfId, mediaId) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "image", { image: { media_id: mediaId } });
}
/** Send a voice message to a WeChat user */
export function sendVoiceMessage(corpId, appSecret, toUser, openKfId, mediaId) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "voice", { voice: { media_id: mediaId } });
}
/** Send a video message to a WeChat user */
export function sendVideoMessage(corpId, appSecret, toUser, openKfId, mediaId) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "video", { video: { media_id: mediaId } });
}
/** Send a file message to a WeChat user */
export function sendFileMessage(corpId, appSecret, toUser, openKfId, mediaId) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "file", { file: { media_id: mediaId } });
}
/** Send a link message to a WeChat user */
export function sendLinkMessage(corpId, appSecret, toUser, openKfId, link) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "link", { link });
}
/** Send a location message to a WeChat user */
export function sendLocationMessage(corpId, appSecret, toUser, openKfId, location) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "location", { location });
}
/** Send a miniprogram message to a WeChat user */
export function sendMiniprogramMessage(corpId, appSecret, toUser, openKfId, miniprogram) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "miniprogram", { miniprogram });
}
/** Send a menu message to a WeChat user */
export function sendMsgMenuMessage(corpId, appSecret, toUser, openKfId, msgmenu) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "msgmenu", { msgmenu });
}
/** Send a business card message to a WeChat user */
export function sendBusinessCardMessage(corpId, appSecret, toUser, openKfId, businessCard) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "business_card", { business_card: businessCard });
}
/** Send an acquisition link (获客链接) message to a WeChat user */
export function sendCaLinkMessage(corpId, appSecret, toUser, openKfId, caLink) {
    return sendMessage(corpId, appSecret, toUser, openKfId, "ca_link", { ca_link: caLink });
}
/** Send a raw message with arbitrary msgtype — for testing undocumented message types. */
export function sendRawMessage(corpId, appSecret, toUser, openKfId, msgtype, payload) {
    return sendMessage(corpId, appSecret, toUser, openKfId, msgtype, payload);
}
//# sourceMappingURL=api.js.map