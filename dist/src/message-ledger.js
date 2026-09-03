/** Durable inbound delivery state, partitioned by WeCom customer-service ID. */
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { atomicWriteFile } from "./fs-utils.js";
const MAX_RECORDS = 10_000;
const ledgers = new Map();
function ledgerPath(stateDir, openKfId) {
    return join(stateDir, `wechat-kf-message-ledger-${encodeURIComponent(openKfId)}.json`);
}
function normalizeRecord(value) {
    // Keep records written by the first 0.4.0 prerelease readable.
    if (value === "completed")
        return { state: "completed" };
    if (value === "pending")
        return { state: "pending" };
    if (!value || typeof value !== "object")
        return undefined;
    const record = value;
    if (record.state === "completed")
        return { state: "completed" };
    if (record.state === "pending" || record.state === "dispatching") {
        return { state: record.state, message: record.message };
    }
    return undefined;
}
async function load(stateDir, openKfId) {
    const path = ledgerPath(stateDir, openKfId);
    const cached = ledgers.get(path);
    if (cached)
        return cached;
    const ledger = { schemaVersion: 1, records: {} };
    try {
        const parsed = JSON.parse(await readFile(path, "utf8"));
        if (parsed.schemaVersion === 1 && parsed.records && typeof parsed.records === "object") {
            for (const [msgid, value] of Object.entries(parsed.records)) {
                const record = normalizeRecord(value);
                if (!record)
                    continue;
                // A new process owns a message left in flight by the old process.
                if (record.state === "dispatching")
                    record.state = "pending";
                ledger.records[msgid] = record;
            }
        }
    }
    catch {
        // Missing state is normal on the first callback. The saved sync cursor
        // remains intact, so the upstream API can still provide a replay.
    }
    ledgers.set(path, ledger);
    return ledger;
}
async function save(stateDir, openKfId, ledger) {
    await mkdir(stateDir, { recursive: true });
    await atomicWriteFile(ledgerPath(stateDir, openKfId), JSON.stringify(ledger));
}
function trim(ledger) {
    const ids = Object.keys(ledger.records);
    if (ids.length <= MAX_RECORDS)
        return;
    for (const id of ids.slice(0, ids.length - MAX_RECORDS))
        delete ledger.records[id];
}
/** Claims a message before dispatch. Completed and in-flight messages are not claimed twice. */
export async function claimMessage(stateDir, openKfId, message) {
    const ledger = await load(stateDir, openKfId);
    const existing = ledger.records[message.msgid];
    if (existing?.state === "completed" || existing?.state === "dispatching")
        return false;
    ledger.records[message.msgid] = { state: "dispatching", message };
    trim(ledger);
    await save(stateDir, openKfId, ledger);
    return true;
}
/** Lists messages left unfinished by a prior process. */
export async function pendingMessages(stateDir, openKfId) {
    const ledger = await load(stateDir, openKfId);
    return Object.values(ledger.records)
        .filter((record) => record.state === "pending" && record.message)
        .map((record) => record.message);
}
/** Makes an un-dispatched message available for a later callback in this process. */
export async function releaseMessage(stateDir, openKfId, msgid) {
    const ledger = await load(stateDir, openKfId);
    const record = ledger.records[msgid];
    if (!record || record.state === "completed")
        return;
    record.state = "pending";
    await save(stateDir, openKfId, ledger);
}
export async function completeMessages(stateDir, openKfId, msgids) {
    const ledger = await load(stateDir, openKfId);
    for (const msgid of msgids)
        ledger.records[msgid] = { state: "completed" };
    trim(ledger);
    await save(stateDir, openKfId, ledger);
}
export function resetMessageLedgers() {
    ledgers.clear();
}
//# sourceMappingURL=message-ledger.js.map