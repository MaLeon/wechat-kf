/**
 * WeChat KF (微信客服) OpenClaw Channel Plugin
 */
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { pluginConfigSchema } from "./src/plugin-bootstrap.js";
export { sendBusinessCardMessage, sendCaLinkMessage, sendLocationMessage, sendMiniprogramMessage, sendMsgMenuMessage, sendTextMessage, syncMessages, } from "./src/api.js";
export { wechatKfPlugin } from "./src/channel.js";
export { computeSignature, decrypt, encrypt, verifySignature } from "./src/crypto.js";
export { getAccessToken } from "./src/token.js";
declare const plugin: {
    id: string;
    name: string;
    description: string;
    configSchema: typeof pluginConfigSchema;
    register: (api: OpenClawPluginApi) => void;
};
export default plugin;
