#!/usr/bin/env node
// Assert asteroid scoring stays finite and follows size brackets.
// Run: node tests/test_points.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "asteroids_vcs2600/js/utils.js"), "utf8");
const sandbox = { window: {}, console };
vm.runInNewContext(src, sandbox);

const fn = sandbox.window.AsteroidsUtils && sandbox.window.AsteroidsUtils.pointsForAsteroidSize;
if (typeof fn !== "function") {
  console.error(
    "[score-finite] asteroids_vcs2600/js/utils.js\n" +
      "  pointsForAsteroidSize is missing.\n" +
      "  How to fix: score asteroids by size in AsteroidsUtils.pointsForAsteroidSize " +
      "and use it from Game.destroyAsteroid. Do not compute Math.floor(100 / splitCount): " +
      "splitCount starts at 0, which turns the HUD into Infinity."
  );
  process.exit(1);
}

const cases = [
  [80, 20],
  [61, 20],
  [60, 50],
  [41, 50],
  [40, 100],
  [30, 100],
  [0, 0],
  [-4, 0],
  [Number.NaN, 0],
  [Number.POSITIVE_INFINITY, 0],
];

let failed = 0;
for (const [size, expected] of cases) {
  const got = fn(size);
  const ok = Number.isFinite(got) && got === expected;
  if (!ok) {
    failed += 1;
    console.error(
      `[score-finite] pointsForAsteroidSize(${size}) => ${got}, expected ${expected}\n` +
        "  How to fix: return a finite point value from size brackets " +
        "(>60 → 20, >40 → 50, otherwise 100; non-finite or <= 0 → 0). " +
        "Never divide by splitCount or any field that can be 0."
    );
  }
}

if (failed) {
  process.exit(1);
}

// Also reject the old Infinity formula if it is still in game.js
const game = fs.readFileSync(path.join(root, "asteroids_vcs2600/js/game.js"), "utf8");
if (/100\s*\/\s*asteroid\.splitCount/.test(game)) {
  console.error(
    "[score-finite] asteroids_vcs2600/js/game.js\n" +
      "  Scoring still divides 100 by asteroid.splitCount.\n" +
      "  How to fix: replace it with AsteroidsUtils.pointsForAsteroidSize(asteroid.size). " +
      "splitCount starts at 0, so this expression yields Infinity and the HUD shows 'Infinity'."
  );
  process.exit(1);
}

console.log("test_points.js: all assertions passed");
