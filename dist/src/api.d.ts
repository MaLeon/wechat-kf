/**
 * WeCom Customer Service API wrapper
 */
import type { WechatKfSendMsgRequest, WechatKfSendMsgResponse, WechatKfSyncMsgRequest, WechatKfSyncMsgResponse, WechatMediaUploadResponse } from "./types.js";
/** Pull messages from WeChat KF */
export declare function syncMessages(corpId: string, appSecret: string, params: WechatKfSyncMsgRequest): Promise<WechatKfSyncMsgResponse>;
/** Send a text message to a WeChat user */
export declare function sendTextMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, content: string): Promise<WechatKfSendMsgResponse>;
/** Download media file from WeChat */
export declare function downloadMedia(corpId: string, appSecret: string, mediaId: string): Promise<{
    buffer: Buffer;
    contentType: string;
}>;
type WechatMediaType = "image" | "voice" | "video" | "file";
/** Upload media file to WeChat */
export declare function uploadMedia(corpId: string, appSecret: string, type: WechatMediaType, buffer: Buffer, filename: string): Promise<WechatMediaUploadResponse>;
/** Send an image message to a WeChat user */
export declare function sendImageMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, mediaId: string): Promise<WechatKfSendMsgResponse>;
/** Send a voice message to a WeChat user */
export declare function sendVoiceMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, mediaId: string): Promise<WechatKfSendMsgResponse>;
/** Send a video message to a WeChat user */
export declare function sendVideoMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, mediaId: string): Promise<WechatKfSendMsgResponse>;
/** Send a file message to a WeChat user */
export declare function sendFileMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, mediaId: string): Promise<WechatKfSendMsgResponse>;
/** Send a link message to a WeChat user */
export declare function sendLinkMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, link: {
    title: string;
    desc?: string;
    url: string;
    thumb_media_id: string;
}): Promise<WechatKfSendMsgResponse>;
/** Send a location message to a WeChat user */
export declare function sendLocationMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, location: {
    name?: string;
    address?: string;
    latitude: number;
    longitude: number;
}): Promise<WechatKfSendMsgResponse>;
/** Send a miniprogram message to a WeChat user */
export declare function sendMiniprogramMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, miniprogram: {
    appid: string;
    title?: string;
    thumb_media_id: string;
    pagepath: string;
}): Promise<WechatKfSendMsgResponse>;
/** Send a menu message to a WeChat user */
export declare function sendMsgMenuMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, msgmenu: WechatKfSendMsgRequest["msgmenu"]): Promise<WechatKfSendMsgResponse>;
/** Send a business card message to a WeChat user */
export declare function sendBusinessCardMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, businessCard: {
    userid: string;
}): Promise<WechatKfSendMsgResponse>;
/** Send an acquisition link (获客链接) message to a WeChat user */
export declare function sendCaLinkMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, caLink: {
    link_url: string;
}): Promise<WechatKfSendMsgResponse>;
/** Send a raw message with arbitrary msgtype — for testing undocumented message types. */
export declare function sendRawMessage(corpId: string, appSecret: string, toUser: string, openKfId: string, msgtype: string, payload: Record<string, unknown>): Promise<WechatKfSendMsgResponse>;
export {};
