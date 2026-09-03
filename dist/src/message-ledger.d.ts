/** Durable inbound delivery state, partitioned by WeCom customer-service ID. */
import type { WechatKfMessage } from "./types.js";
/** Claims a message before dispatch. Completed and in-flight messages are not claimed twice. */
export declare function claimMessage(stateDir: string, openKfId: string, message: WechatKfMessage): Promise<boolean>;
/** Lists messages left unfinished by a prior process. */
export declare function pendingMessages(stateDir: string, openKfId: string): Promise<WechatKfMessage[]>;
/** Makes an un-dispatched message available for a later callback in this process. */
export declare function releaseMessage(stateDir: string, openKfId: string, msgid: string): Promise<void>;
export declare function completeMessages(stateDir: string, openKfId: string, msgids: string[]): Promise<void>;
export declare function resetMessageLedgers(): void;
