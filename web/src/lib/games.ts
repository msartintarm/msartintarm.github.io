// Single source of truth for the hub's link cards. `href`s are absolute *site*
// paths (each game is its own repo deployed to a subpath of msartintarm.github.io),
// so they are intentionally NOT prefixed with basePath() — they point across apps.
//
// Flip a card on by setting `status: "live"` once its repo is actually serving
// (probe https://msartintarm.github.io/<path>/ returns 200). "soon" cards render
// dimmed and non-clickable; see the repo README for the backlog of repos to revive.

export type GameStatus = "live" | "soon";

export type Game = {
  title: string;
  href: string;
  blurb: string;
  status: GameStatus;
  tag: string; // short tech label shown on the card
};

export const GAMES: Game[] = [
  {
    title: "Traffic",
    href: "/traffic/",
    blurb: "Tick-based micro traffic simulation of Millbrae, CA — real OSM roads, signals, and car-following, with serial / CPU-threads / GPU compute backends.",
    status: "live",
    tag: "Rust · WASM · WebGPU",
  },
  {
    title: "Plant",
    href: "/plant/",
    blurb: "A growing-plant simulator rendered in the browser from a Rust core.",
    status: "live",
    tag: "Rust · WASM",
  },
  {
    title: "Snake",
    href: "/snake/",
    blurb: "The classic, done in WebAssembly — a small, fast take on Snake.",
    status: "live",
    tag: "TypeScript · WASM",
  },
  {
    title: "WebGL Demo (legacy)",
    href: "/webgl-demo/",
    blurb: "The original hand-rolled WebGL playground that used to live at the site root — shapes, environments, and shading knobs. Relocated here.",
    status: "soon",
    tag: "WebGL · JS",
  },
];
