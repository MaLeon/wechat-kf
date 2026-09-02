import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { claimMessage, completeMessages, pendingMessages, resetMessageLedgers } from "./message-ledger.js";
import type { WechatKfMessage } from "./types.js";

const dirs: string[] = [];

async function stateDir(): Promise<string> {
  const dir = join(tmpdir(), `wechat-kf-ledger-test-${randomUUID()}`);
  dirs.push(dir);
  await mkdir(dir, { recursive: true });
  return dir;
}

afterEach(async () => {
  resetMessageLedgers();
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("message ledger", () => {
  const message = (msgid: string): WechatKfMessage => ({
    msgid,
    open_kfid: "wkExample",
    external_userid: "external-user",
    send_time: 1,
    origin: 3,
    msgtype: "text",
    text: { content: "hello" },
  });

  it("does not claim a completed message after process state is reloaded", async () => {
    const dir = await stateDir();
    await expect(claimMessage(dir, "wkExample", message("incoming-1"))).resolves.toBe(true);
    await completeMessages(dir, "wkExample", ["incoming-1"]);

    resetMessageLedgers();
    await expect(claimMessage(dir, "wkExample", message("incoming-1"))).resolves.toBe(false);
  });

  it("allows a pending message to be retried after a restart", async () => {
    const dir = await stateDir();
    await claimMessage(dir, "wkExample", message("incoming-2"));

    resetMessageLedgers();
    await expect(pendingMessages(dir, "wkExample")).resolves.toEqual([message("incoming-2")]);
    await expect(claimMessage(dir, "wkExample", message("incoming-2"))).resolves.toBe(true);
  });

  it("keeps ledgers separate for different customer-service accounts", async () => {
    const dir = await stateDir();
    await claimMessage(dir, "wkSales", message("same-id"));
    await completeMessages(dir, "wkSales", ["same-id"]);

    await expect(claimMessage(dir, "wkSupport", message("same-id"))).resolves.toBe(true);
  });
});
