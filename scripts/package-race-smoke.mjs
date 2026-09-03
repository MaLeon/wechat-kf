// Runs in a fresh process against the extracted package, with the real host SDK.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const [sdk = "openclaw/plugin-sdk/channel-plugin-common", mode = "jiti"] = process.argv.slice(2);
const sdkUrl = import.meta.resolve(sdk);
const entry = fileURLToPath(new URL(pkg.openclaw.extensions[0], import.meta.url));
const hostRequire = createRequire(require.resolve("openclaw"));
const { createJiti } = hostRequire("jiti");
const load =
  mode === "native"
    ? require
    : createJiti(import.meta.url, {
        interopDefault: true,
        moduleCache: false,
        tryNative: false,
        nativeModules: ["openclaw"],
      });

let scheduled = false;
let raceCode;
const check = Promise.withResolvers();
const timeout = setTimeout(() => check.reject(new Error("SDK race checkpoint was not reached")), 10_000);
const hook = registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (url === sdkUrl && !scheduled) {
      scheduled = true;
      // Run after Node has cached the asynchronous job, before its module is
      // ready. This creates the incident's timing without sleeps or fake SDKs.
      queueMicrotask(() => {
        try {
          assert.throws(
            () => require(sdk),
            (error) => {
              raceCode = error.code;
              return error.code === "ERR_REQUIRE_ESM_RACE_CONDITION" || error.code === "ERR_INTERNAL_ASSERTION";
            },
            "Negative control must confirm that the SDK cannot yet be required",
          );
          const loaded = load(entry);
          const plugin = loaded.default ?? loaded;
          const channels = [];
          const routes = [];
          const cfg = { channels: { "wechat-kf": { allowedKfIds: ["wkAllowed"], groupAllowFrom: [] } } };
          assert.equal(
            plugin.register({
              config: cfg,
              runtime: {},
              registerChannel: ({ plugin: channel }) => channels.push(channel),
              registerHttpRoute: (route) => routes.push(route),
            }),
            undefined,
            "OpenClaw requires synchronous plugin registration",
          );
          assert.equal(channels.length, 1);
          assert.equal(routes[0].path, "/wechat-kf");
          assert.equal(plugin.configSchema.safeParse({}).success, true);
          assert.equal(plugin.configSchema.safeParse({ unknown: true }).success, false);
          assert.match(channels[0].security.resolveDmPolicy({ cfg }).approveHint, /pairing approve wechat-kf/);
          check.resolve();
        } catch (error) {
          check.reject(error);
        }
      });
    }
    return result;
  },
});

try {
  // Deliberately overlap the host's async import with synchronous plugin load.
  await Promise.all([import(sdk), check.promise]);
  console.log(`Package race: ${mode}, ${sdk}, control=${raceCode}, passed on ${process.version}`);
} finally {
  clearTimeout(timeout);
  hook.deregister();
}
