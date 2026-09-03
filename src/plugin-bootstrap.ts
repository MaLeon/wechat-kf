import type { OpenClawPluginConfigSchema } from "openclaw/plugin-sdk";

// Keep bootstrap helpers local: OpenClaw registers plugins synchronously while
// its ESM SDK may still be loading. A runtime SDK import here can be transformed
// into require() by jiti and fail with ERR_REQUIRE_ESM_RACE_CONDITION.
// Contract tests compare these small helpers with the pinned host SDK.
export const pluginConfigSchema: OpenClawPluginConfigSchema = {
  safeParse(value: unknown) {
    if (value === undefined) return { success: true, data: undefined };
    const message =
      !value || typeof value !== "object" || Array.isArray(value)
        ? "expected config object"
        : Object.keys(value).length > 0
          ? "config must be empty"
          : undefined;
    if (message) return { success: false, error: { issues: [{ path: [], message }] } };
    return { success: true, data: value };
  },
  jsonSchema: { type: "object", additionalProperties: false, properties: {} },
};

export const PAIRING_APPROVED_MESSAGE = "✅ OpenClaw access approved. Send a message to start chatting.";

export function formatPairingApproveHint(channelId: string): string {
  let command = "openclaw";
  const container = process.env.OPENCLAW_CONTAINER_HINT?.trim();
  const profile = process.env.OPENCLAW_PROFILE?.trim();
  // Preserve the active host context in the displayed approval commands.
  if (container && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(container)) {
    command += ` --container ${container}`;
  } else if (profile && profile.toLowerCase() !== "default" && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(profile)) {
    command += ` --profile ${profile}`;
  }
  return `Approve via: ${command} pairing list ${channelId} / ${command} pairing approve ${channelId} <code>`;
}
