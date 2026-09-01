/**
 * Plugin runtime reference
 * Stores the PluginRuntime provided by OpenClaw gateway at startup.
 */
import type { PluginRuntime } from "openclaw/plugin-sdk";
export declare function setRuntime(next: PluginRuntime): void;
export declare function getRuntime(): PluginRuntime;
/**
 * Reset the module-level runtime reference to null.
 * @internal Exposed for testing only — allows test isolation between runs.
 */
export declare function _reset(): void;
