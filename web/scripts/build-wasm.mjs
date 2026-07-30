// Build a wasm package via wasm-pack, but skip the whole thing (wasm-bindgen +
// wasm-opt, ~1 min) when the inputs are unchanged since the last successful build.
// cargo already caches compilation; wasm-pack does not skip its post-processing, so
// this content-hash guard is what makes repeated `npm run dev` startups fast.
//
//   node scripts/build-wasm.mjs single    # stable, single-threaded  -> public/wasm-pkg
//   node scripts/build-wasm.mjs threads   # nightly, CPU threads     -> public/wasm-pkg-threads

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const engineDir = join(here, "..", "..", "engine");
const variant = process.argv[2];
if (variant !== "single" && variant !== "threads") {
  console.error("usage: build-wasm.mjs <single|threads>");
  process.exit(2);
}

const outName = variant === "threads" ? "wasm-pkg-threads" : "wasm-pkg";
const outDir = join(here, "..", "public", outName);
const wasmFile = join(outDir, "engine_bg.wasm");
// Stamp lives under engine/target (gitignored, never touched by wasm-pack).
const stampFile = join(engineDir, "target", `.wasm-build-${variant}.hash`);

// Every input that can change the emitted wasm: sources, shaders, manifests, and the
// threaded build's extra cargo config. The variant is folded in so the two packages
// keep independent stamps.
function walk(dir, exts, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "target") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, acc);
    else if (exts.some((x) => e.name.endsWith(x))) acc.push(p);
  }
  return acc;
}

const inputs = [
  ...walk(join(engineDir, "src"), [".rs", ".wgsl"]),
  join(engineDir, "Cargo.toml"),
  join(engineDir, "Cargo.lock"),
  join(engineDir, "wasm-threads.cargo.toml"),
]
  .filter(existsSync)
  .sort();

const h = createHash("sha256").update(variant);
for (const f of inputs) h.update(readFileSync(f));
const hash = h.digest("hex");

// wasm-bindgen-rayon's worker re-imports the package via `../../..` — a bundler-only
// directory resolution. We serve the pkg as raw ES modules from public/, where a static
// server 404s on the bare directory and the worker never boots (initThreadPool hangs).
// Rewrite it to the real entry file. Idempotent, and applied on the cached path too so a
// regenerated/reverted worker file is re-fixed without a full rebuild.
function patchThreadedWorker() {
  if (variant !== "threads" || !existsSync(outDir)) return;
  for (const wh of walk(outDir, ["workerHelpers.js"])) {
    const cur = readFileSync(wh, "utf8");
    const fixed = cur.replace("import('../../..')", "import('../../../engine.js')");
    if (fixed !== cur) writeFileSync(wh, fixed);
  }
}

if (existsSync(wasmFile) && existsSync(stampFile) && readFileSync(stampFile, "utf8").trim() === hash) {
  patchThreadedWorker();
  console.log(`wasm (${variant}) unchanged — using cached build`);
  process.exit(0);
}

const cmd =
  variant === "threads"
    ? `RUSTUP_TOOLCHAIN=nightly CARGO_UNSTABLE_BUILD_STD="panic_abort,std" wasm-pack build --target web --out-dir ../web/public/wasm-pkg-threads --out-name engine -- --config wasm-threads.cargo.toml --features wasm-threads`
    : `wasm-pack build --target web --out-dir ../web/public/wasm-pkg --out-name engine`;

console.log(`building wasm (${variant})…`);
execSync(cmd, { cwd: engineDir, stdio: "inherit", shell: "/bin/bash" });
patchThreadedWorker();
writeFileSync(stampFile, hash);
