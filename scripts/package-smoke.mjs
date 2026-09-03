// Copied into an extracted npm package by check-package.mjs.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { validateJsonSchemaValue } from "openclaw/plugin-sdk/json-schema-runtime";

const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("./openclaw.plugin.json", import.meta.url), "utf8"));
assert.equal(pkg.version, manifest.version);
const require = createRequire(import.meta.url);

// Exercise Node's ESM and CommonJS package resolution on the actual exports.
const plugin = (await import(pkg.name)).default;
assert.equal(plugin.id, "wechat-kf");
assert.equal(require(pkg.name).default.id, "wechat-kf");
for (const subpath of ["api", "crypto"]) {
  assert(Object.keys(await import(`${pkg.name}/${subpath}`)).length > 0);
  assert(Object.keys(require(`${pkg.name}/${subpath}`)).length > 0);
}

// Use the host's installed jiti as well as native Node loading. The entry
// must work with OpenClaw's synchronous loader without a source-tree fallback.
const hostRequire = createRequire(require.resolve("openclaw"));
const { createJiti } = hostRequire("jiti");
const jiti = createJiti(import.meta.url, { interopDefault: true, moduleCache: false });
const loaded = jiti(fileURLToPath(new URL(pkg.openclaw.extensions[0], import.meta.url)));
assert.equal((loaded.default ?? loaded).id, "wechat-kf");

const channels = [];
const routes = [];
const config = {
  enabled: true,
  corpId: "test-corp",
  appSecret: "test-secret",
  token: "test-token",
  encodingAESKey: "a".repeat(43),
  webhookPath: "wechat-kf",
  allowedKfIds: ["wkExample"],
  groupAllowFrom: ["legacy-user"],
};
plugin.register({
  config: { channels: { "wechat-kf": config } },
  runtime: {},
  registerChannel: (channel) => channels.push(channel.plugin),
  registerHttpRoute: (route) => routes.push(route),
});
assert.equal(channels.length, 1);
assert.equal(routes.length, 1);
assert.equal(routes[0].path, "/wechat-kf");
assert.equal(typeof routes[0].handler, "function");
for (const schema of [manifest.channelConfigs["wechat-kf"].schema, channels[0].configSchema.schema]) {
  const result = validateJsonSchemaValue({ schema, value: config, cacheKey: "package-smoke", cache: false });
  assert(result.ok, JSON.stringify(result));
}
console.log(`Package ${pkg.version}: ESM, require, jiti, registration, and legacy config passed on ${process.version}`);
