/**
 * Plugin runtime reference
 * Stores the PluginRuntime provided by OpenClaw gateway at startup.
 */
import { logTag } from "./constants.js";
let runtime = null;
export function setRuntime(next) {
    runtime = next;
}
export function getRuntime() {
    if (!runtime) {
        throw new Error(`${logTag()} runtime not initialized — plugin not started via gateway?`);
    }
    return runtime;
}
/**
 * Reset the module-level runtime reference to null.
 * @internal Exposed for testing only — allows test isolation between runs.
 */
export function _reset() {
    runtime = null;
}
//# sourceMappingURL=runtime.js.map