# msartintarm.github.io

The site root: a small **games hub** that links to the browser games hosted at
subpaths of `msartintarm.github.io`, and is *itself* a bare-bones technical demo — a
Rust/WASM particle simulation rendered to a `<canvas>`, with a switchable **CPU-serial**
vs **CPU-threads** compute backend. Architecture is lifted from the sibling
[`traffic`](https://github.com/msartintarm/traffic) game, minus the GPU path.

## Layout

```
engine/   Rust crate → WebAssembly. Pure particle sim in src/sim.rs (native cargo test),
          browser bridge in src/bridge.rs (#[wasm_bindgen] Simulation), gated to wasm32.
web/      Next.js static export. The hub UI: ParticlesCanvas (the demo) + GameLinks
          (DOM link cards). Builds two wasm packages: single-threaded + CPU-threads.
```

The compute backend picks *which wasm module loads* (the threaded build is a separate
nightly/atomics artifact), so it can't be swapped at runtime — the `Compute` dropdown
reloads with `?compute=serial|threads`. CPU threads need cross-origin isolation, which a
COOP/COEP service-worker shim (`web/public/coi-serviceworker.js`) supplies on GitHub
Pages; browsers that can't isolate fall back to serial automatically.

## Develop

```bash
cd engine && cargo test              # sim core (energy bounded; serial == parallel)
cd ../web && npm install
npm run dev                          # http://localhost:3000/  (serial)
npm run dev:threads                  # then open ?compute=threads
npm run build                        # static export to web/out/
npm test                             # link-data invariants
```

## Adding a game link

Games are separate repos, each deployed to its own subpath. Add a card in
[`web/src/lib/games.ts`](web/src/lib/games.ts) — `href` is an absolute site path
(e.g. `/snake/`), and `status: "live"` once the repo actually serves (probe
`https://msartintarm.github.io/<path>/` for a 200). `status: "soon"` renders the card
dimmed and non-clickable.

Currently live: **`/traffic`**, **`/plant`**, **`/snake`**.

## Deploy

Push to `main`; `.github/workflows/deploy.yml` builds both wasm packages + the static
export and publishes to Pages (set the repo's Pages source to **GitHub Actions**). No
`basePath` is set — this deploys at the domain root.

## Relocating the old root "WebGL Demo"

The root previously served a hand-rolled WebGL demo. To keep it reachable while this hub
takes the root, move it to its own repo served at `/webgl-demo`:

1. Create `msartintarm/webgl-demo` (or rename/repurpose the existing `webgl` repo, whose
   `master` already holds the demo's `demo.html` + assets).
2. Add an `index.html` entry (redirect to `demo.html`), enable Pages, so it serves at
   `https://msartintarm.github.io/webgl-demo/`.
3. Flip its card in `games.ts` from `"soon"` to `"live"`.

### Backlog: other game repos not yet serving

`webgl`, `TheGame`, `online_game` are client-side and just need Pages enabled + an
`index.html` entry point. `new-game` (React/browserify) needs a build workflow like this
one. `UnityGame` needs a Unity WebGL export; `cool-thing` is a backend server (not
Pages-hostable as-is). Revive each, then add its card.
