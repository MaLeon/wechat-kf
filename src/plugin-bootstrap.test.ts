import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import {
  formatPairingApproveHint as sdkPairingHint,
  PAIRING_APPROVED_MESSAGE as sdkPairingMessage,
} from "openclaw/plugin-sdk/channel-plugin-common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPairingApproveHint, PAIRING_APPROVED_MESSAGE, pluginConfigSchema } from "./plugin-bootstrap.js";

afterEach(() => vi.unstubAllEnvs());

describe("bootstrap compatibility with the pinned OpenClaw SDK", () => {
  it("preserves the empty plugin schema, including validation errors", () => {
    const sdkSchema = emptyPluginConfigSchema();
    expect(pluginConfigSchema.jsonSchema).toEqual(sdkSchema.jsonSchema);
    for (const value of [undefined, {}, null, [], "", 0, false, { unknown: true }]) {
      expect(pluginConfigSchema.safeParse?.(value)).toEqual(sdkSchema.safeParse?.(value));
    }
  });

  it("preserves the pairing approval message", () => {
    expect(PAIRING_APPROVED_MESSAGE).toBe(sdkPairingMessage);
  });

  it.each([
    [undefined, undefined],
    ["work", undefined],
    [" DEFAULT ", undefined],
    ["invalid profile", undefined],
    ["work", "gateway-prod"],
    [" work ", " gateway.prod "],
    ["work", "invalid container"],
    ["a".repeat(65), "a".repeat(129)],
  ])("preserves approval commands for profile=%s and container=%s", (profile, container) => {
    vi.stubEnv("OPENCLAW_PROFILE", profile);
    vi.stubEnv("OPENCLAW_CONTAINER_HINT", container);
    expect(formatPairingApproveHint("wechat-kf")).toBe(sdkPairingHint("wechat-kf"));
  });
});
