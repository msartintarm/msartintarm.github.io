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
    blurb: "Large-scale traffic simulator to study how traffic works.",
    status: "live",
    tag: "Rust · WASM · WebGPU",
  },
  {
    title: "Plant",
    href: "/plant/",
    blurb: "Houseplant simulator to study how to grow plants.",
    status: "live",
    tag: "Rust · WASM",
  },
  {
    title: "Chaos Snake",
    href: "/snake/",
    blurb: "Duel against opponents to become the largest of them all.",
    status: "live",
    tag: "TypeScript · WASM",
  },
  {
    title: "New Game",
    href: "/new-game/",
    blurb: "An early study.",
    status: "live",
    tag: "React · Canvas · JS",
  },
  {
    title: "The Game",
    href: "/TheGame/",
    blurb: "Textured 3D maze romp.",
    status: "live",
    tag: "WebGL · JS",
  },
  {
    title: "Online Game",
    href: "/online_game/",
    blurb: "Maze game with audio.",
    status: "live",
    tag: "WebGL · JS · Audio",
  },
  {
    title: "WebGL Demo (legacy)",
    href: "/webgl-demo/",
    blurb: "Shapes, environments, and shading playground.",
    status: "live",
    tag: "WebGL · JS",
  },
];
