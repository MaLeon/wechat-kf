/**
 * WeChat KF directive parser
 *
 * Parses [[wechat_*: ...]] directives embedded in agent text replies.
 * The framework doesn't recognize these directives, so the text arrives
 * intact for plugin-level interception.
 *
 * Supported directives:
 *   [[wechat_link: title | desc | url | thumbUrl]]
 *   [[wechat_location: name | address | lat | lng]]
 *   [[wechat_miniprogram: appid | title | pagepath | thumbUrl]]
 *   [[wechat_menu: header | Option1, Option2, Option3 | footer]]
 *   [[wechat_business_card: USERID]]
 *   [[wechat_ca_link: https://work.weixin.qq.com/ca/...]]
 */
export type WechatLinkDirective = {
    title: string;
    desc?: string;
    url: string;
    thumbUrl?: string;
};
export type WechatLocationDirective = {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
};
export type WechatMenuItemDirective = {
    type: "click";
    id?: string;
    content: string;
} | {
    type: "view";
    url: string;
    content: string;
} | {
    type: "miniprogram";
    appid: string;
    pagepath: string;
    content: string;
} | {
    type: "text";
    content: string;
    noNewline?: boolean;
};
export type WechatMenuDirective = {
    headContent?: string;
    items: WechatMenuItemDirective[];
    tailContent?: string;
};
export type WechatMiniprogramDirective = {
    appid: string;
    title: string;
    pagepath: string;
    thumbUrl?: string;
};
export type WechatBusinessCardDirective = {
    userid: string;
};
export type WechatCaLinkDirective = {
    link_url: string;
};
export type WechatRawDirective = {
    msgtype: string;
    payload: Record<string, unknown>;
};
export type WechatDirectiveResult = {
    text: string;
    link?: WechatLinkDirective;
    location?: WechatLocationDirective;
    miniprogram?: WechatMiniprogramDirective;
    menu?: WechatMenuDirective;
    businessCard?: WechatBusinessCardDirective;
    caLink?: WechatCaLinkDirective;
    raw?: WechatRawDirective;
};
export type ProtectedRange = {
    start: number;
    end: number;
};
/**
 * Scan text left-to-right and collect ranges that should be treated as
 * "protected" — i.e. directive syntax inside them must be ignored.
 *
 * Three zone types (checked in priority order):
 *  1. Fenced code blocks (``` or ~~~, with optional 0-3 leading spaces + lang tag)
 *  2. Inline code spans (backtick sequences, matching equal-length closer)
 *  3. Blockquote lines (line starting with optional whitespace + `>`)
 */
export declare function findProtectedRanges(text: string): ProtectedRange[];
/**
 * Quick check whether text contains a `[[wechat_link:...]]` directive
 * outside of markdown code blocks, inline code, and blockquotes.
 */
export declare function hasWechatLinkDirective(text: string): boolean;
/**
 * Extract the first `[[wechat_link:...]]` directive from text.
 *
 * Returns the remaining text (with directive stripped and trimmed)
 * plus the parsed link fields. If parsing fails (e.g. invalid URL),
 * returns the original text unchanged with no link.
 */
export declare function parseWechatLinkDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
export declare function parseWechatLocationDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
export declare function parseWechatMiniprogramDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
export declare function parseWechatMenuDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
/**
 * Convert a parsed WechatMenuDirective into the API `msgmenu` payload.
 *
 * Click items get auto-incrementing IDs (only among click items that lack
 * an explicit `id`). Explicit IDs are preserved as-is.
 */
export declare function buildMsgMenuPayload(menu: WechatMenuDirective): {
    head_content?: string;
    list: Array<{
        type: "click";
        click: {
            id: string;
            content: string;
        };
    } | {
        type: "view";
        view: {
            url: string;
            content: string;
        };
    } | {
        type: "miniprogram";
        miniprogram: {
            appid: string;
            pagepath: string;
            content: string;
        };
    } | {
        type: "text";
        text: {
            content: string;
            no_newline?: number;
        };
    }>;
    tail_content?: string;
};
export declare function parseWechatBusinessCardDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
export declare function parseWechatCaLinkDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
export declare function parseWechatRawDirective(text: string, protectedRanges?: ProtectedRange[]): WechatDirectiveResult;
/**
 * Quick check whether text contains any `[[wechat_*:...]]` directive
 * outside of markdown code blocks, inline code, and blockquotes.
 */
export declare function hasWechatDirective(text: string): boolean;
/**
 * Parse the first matching directive from text.
 * Tries parsers in order: link → location → miniprogram → menu → business_card → ca_link → raw.
 * Returns the first successful parse result.
 * Directives inside markdown code blocks, inline code, or blockquotes are ignored.
 */
export declare function parseWechatDirective(text: string): WechatDirectiveResult;
