import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "wechat-kf-package-"));

try {
  // Use only files Git can publish. Copying the whole local dist/ would hide
  // the original bug: ignored build output present locally but absent on GitHub.
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const metadata = new Set(["package.json", "openclaw.plugin.json", "README.md", "LICENSE", ".npmignore"]);
  const checkout = join(temporary, "checkout");
  for (const file of new Set(files.filter((file) => file.startsWith("dist/") || metadata.has(file)))) {
    const target = join(checkout, file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(root, file), target);
  }

  // Pack without running a build or installation hook, exactly as a consumer
  // of the committed distribution receives it. No network access is needed.
  const packed = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--ignore-scripts",
        "--offline",
        "--json",
        "--cache",
        join(temporary, "npm-cache"),
        "--pack-destination",
        temporary,
      ],
      { cwd: checkout, encoding: "utf8" },
    ),
  );
  const [entry] = packed;
  assert(entry?.filename, "npm pack did not produce a package");
  const contents = new Set(entry.files.map((file) => file.path));
  assert(contents.has("dist/src/message-ledger.js"), "Package is missing the inbound ledger module");
  assert(contents.has("dist/src/kf-policy.js"), "Package is missing the KF account policy module");
  assert(!entry.files.some((file) => file.path.startsWith("src/")), "Package check must use dist, not source fallback");

  const unpacked = join(temporary, "unpacked");
  await mkdir(unpacked);
  execFileSync("tar", ["-xzf", join(temporary, entry.filename), "-C", unpacked]);
  const installed = join(unpacked, "package");
  await mkdir(join(installed, "node_modules"));
  // Only provide the host SDK; do not expose the repository's other modules.
  await symlink(await realpath(join(root, "node_modules/openclaw")), join(installed, "node_modules/openclaw"), "dir");
  const race = join(installed, "check-race.mjs");
  await copyFile(join(root, "scripts/package-race-smoke.mjs"), race);
  for (const sdk of ["openclaw/plugin-sdk/channel-plugin-common", "openclaw/plugin-sdk"]) {
    for (const mode of ["native", "jiti"]) {
      execFileSync(process.execPath, [race, sdk, mode], { cwd: installed, stdio: "inherit", timeout: 30_000 });
    }
  }
  const smoke = join(installed, "check-entry.mjs");
  await copyFile(join(root, "scripts/package-smoke.mjs"), smoke);
  execFileSync(process.execPath, [smoke], { cwd: installed, stdio: "inherit" });
} finally {
  await rm(temporary, { recursive: true, force: true });
}
