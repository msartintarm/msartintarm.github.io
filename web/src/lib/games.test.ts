import { test } from "node:test";
import assert from "node:assert/strict";
import { GAMES } from "./games.ts";

test("every game has an absolute, cross-app href", () => {
  for (const g of GAMES) {
    assert.match(g.href, /^\/[a-z0-9-]+\/$/i, `${g.title} href is an absolute trailing-slash path`);
    assert.ok(g.title && g.blurb && g.tag, `${g.title} has title/blurb/tag`);
    assert.ok(g.status === "live" || g.status === "soon", `${g.title} has a valid status`);
  }
});

test("titles are unique", () => {
  const titles = GAMES.map((g) => g.title);
  assert.equal(new Set(titles).size, titles.length, "no duplicate titles");
});
