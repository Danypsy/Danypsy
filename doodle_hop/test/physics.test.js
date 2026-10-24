const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sandbox = { console, Math, globalThis: null };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "../js/physics.js"), "utf8"),
  sandbox
);

const Physics = sandbox.DoodlePhysics;
const { CONFIG } = Physics;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function idle() {
  return { left: false, right: false, shoot: false, power: 1 };
}

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log("ok  " + name);
}

test("la hauteur de saut laisse une marge pour atterrir", () => {
  assert.ok(Physics.JUMP_REACH > 120, "reach " + Physics.JUMP_REACH);
  assert.ok(Physics.JUMP_REACH < 230, "reach " + Physics.JUMP_REACH);
});

test("le parcours garanti reste atteignable", () => {
  for (const seed of [1, 2, 7, 42, 99]) {
    const world = Physics.createWorld(mulberry32(seed));
    let previous = world.platforms.find((platform) => platform.route);
    // Le premier est la plateforme de départ ; on enchaîne via routeTip après génération.
    const route = world.platforms.filter((platform) => platform.route).sort((a, b) => b.y - a.y);
    for (let i = 1; i < route.length; i++) {
      const gap = route[i - 1].y - route[i].y;
      const limit = route[i - 1].type === "spring" ? Physics.SPRING_REACH : Physics.JUMP_REACH;
      const dx = Math.abs(route[i - 1].x + route[i - 1].w / 2 - (route[i].x + route[i].w / 2));
      assert.ok(gap >= 40, "gap trop petit " + gap + " seed " + seed);
      assert.ok(gap <= limit + 0.01, "gap impossible " + gap + " limit " + limit + " type " + route[i - 1].type);
      assert.ok(dx <= 260, "écart horizontal " + dx + " seed " + seed);
      assert.ok(route[i].x >= 4 && route[i].x + route[i].w <= CONFIG.VIEW_W - 4);
      assert.ok(route[i].type === "static" || route[i].type === "moving" || route[i].type === "spring");
    }
    previous = world.routeTip;
    for (let i = 0; i < 250; i++) {
      const before = previous;
      const step = Physics.addRouteStep(world);
      assert.ok(step.gap <= Physics.JUMP_REACH + 0.01);
      assert.ok(step.gap >= 40);
      assert.ok(step.dx <= 260, "dx " + step.dx);
      assert.notStrictEqual(before.id, world.routeTip.id);
      previous = world.routeTip;
    }
  }
});

test("atterrir sur une plateforme renvoie vers le haut", () => {
  const world = Physics.createWorld(mulberry32(3));
  const start = world.platforms.find((platform) => platform.y === CONFIG.START_Y);
  world.player.x = start.x + 20;
  world.player.y = start.y - CONFIG.PLAYER_H - 1;
  world.player.vy = 2;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.ok(events.includes("jump"), events.join(","));
  assert.ok(world.player.vy < 0);
});

test("on traverse une plateforme en montant", () => {
  const world = Physics.createWorld(mulberry32(3));
  const start = world.platforms.find((platform) => platform.y === CONFIG.START_Y);
  world.player.x = start.x + 20;
  world.player.y = start.y + 4;
  world.player.vy = -8;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.ok(!events.includes("jump"));
  assert.ok(world.player.y < start.y);
});

test("une plateforme cassante ne fait pas rebondir", () => {
  const world = Physics.createWorld(mulberry32(5));
  world.platforms = [
    {
      id: 99,
      x: 100,
      y: 400,
      w: 90,
      h: 16,
      type: "break",
      route: false,
      originX: 100,
      range: 0,
      speed: 0,
      phase: 0,
      broken: false,
      used: false,
      alpha: 1,
      fallVy: 0,
      rot: 0,
      springAnim: 0,
      hasMonster: false,
      dead: false,
    },
  ];
  world.player.x = 120;
  world.player.y = 400 - CONFIG.PLAYER_H - 1;
  world.player.vy = 3;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.ok(events.includes("break"), events.join(","));
  assert.ok(!events.includes("jump"));
  assert.ok(world.player.vy > 0);
  assert.strictEqual(world.platforms[0].broken, true);
});

test("le ressort propulse plus fort qu'un saut normal", () => {
  const world = Physics.createWorld(mulberry32(4));
  world.platforms = [
    {
      id: 50,
      x: 140,
      y: 420,
      w: 80,
      h: 16,
      type: "spring",
      route: true,
      originX: 140,
      range: 0,
      speed: 0,
      phase: 0,
      broken: false,
      used: false,
      alpha: 1,
      fallVy: 0,
      rot: 0,
      springAnim: 0,
      hasMonster: false,
      dead: false,
    },
  ];
  world.monsters = [];
  world.player.x = 155;
  world.player.y = 420 - CONFIG.PLAYER_H - 1;
  world.player.vy = 2;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.ok(events.includes("spring"), events.join(","));
  assert.ok(world.player.vy <= CONFIG.SPRING_VY + 0.01);
  assert.ok(world.player.vy < CONFIG.JUMP_VY);
});

test("tomber sous l'écran termine la partie", () => {
  const world = Physics.createWorld(mulberry32(8));
  for (const platform of world.platforms) platform.dead = true;
  world.player.y = world.cameraY + CONFIG.VIEW_H + 40;
  world.player.vy = 4;
  const events = Physics.step(world, idle());
  assert.strictEqual(world.alive, false);
  assert.ok(events.includes("die"));
  assert.strictEqual(world.deathReason, "fall");
});

test("sortir d'un côté ramène de l'autre", () => {
  const world = Physics.createWorld(mulberry32(8));
  world.player.x = -CONFIG.PLAYER_W - 2;
  world.player.vx = 0;
  Physics.step(world, idle());
  assert.ok(world.player.x > CONFIG.VIEW_W - CONFIG.PLAYER_W - 5);
  assert.ok(world.player.x < CONFIG.VIEW_W);
});

test("le jetpack ignore la gravité et monte", () => {
  const world = Physics.createWorld(mulberry32(8));
  world.player.flight = "jetpack";
  world.player.flightTimer = 8;
  world.player.vy = 6;
  const y = world.player.y;
  Physics.step(world, idle());
  assert.ok(world.player.y < y);
  assert.ok(world.player.vy < 0);
  assert.strictEqual(world.player.flight, "jetpack");
});

test("le score augmente quand on grimpe", () => {
  const world = Physics.createWorld(mulberry32(8));
  world.player.y -= 640;
  Physics.step(world, idle());
  assert.ok(world.score >= 64, "score " + world.score);
});

test("tirer détruit une bestiole et donne des points", () => {
  const world = Physics.createWorld(mulberry32(9));
  world.monsters.push({
    id: 500,
    platformId: null,
    w: 40,
    h: 32,
    x: world.player.x,
    y: world.player.y - 80,
    vy: 0,
    falling: true,
    alive: true,
    bob: 0,
  });
  world.shotCd = 0;
  const events = Physics.step(world, { left: false, right: false, shoot: true, power: 1 });
  assert.ok(events.includes("shoot"));
  let guard = 0;
  while (world.monsters.some((monster) => monster.alive) && guard < 40) {
    Physics.step(world, idle());
    guard++;
  }
  assert.ok(guard < 40, "la bestiole est toujours là");
  assert.ok(world.bonus >= CONFIG.MONSTER_BONUS);
});

test("écraser une bestiole par au-dessus la détruit", () => {
  const world = Physics.createWorld(mulberry32(11));
  world.monsters = [
    {
      id: 7,
      platformId: null,
      w: 40,
      h: 32,
      x: 180,
      y: 360,
      vy: 0,
      falling: true,
      alive: true,
      bob: 0,
    },
  ];
  world.player.x = 176;
  world.player.y = 360 - CONFIG.PLAYER_H - 2;
  world.player.vy = 6;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.ok(events.includes("monster"), events.join(","));
  assert.strictEqual(world.alive, true);
  assert.ok(world.player.vy < 0);
});

test("une bestiole touchée par le côté fait perdre", () => {
  const world = Physics.createWorld(mulberry32(12));
  world.monsters = [
    {
      id: 8,
      platformId: null,
      w: 40,
      h: 32,
      x: 180,
      y: 300,
      vy: 0,
      falling: true,
      alive: true,
      bob: 0,
    },
  ];
  world.player.x = 176;
  world.player.y = 300 - 10;
  world.player.vy = -4;
  world.player.vx = 0;
  const events = Physics.step(world, idle());
  assert.strictEqual(world.alive, false);
  assert.strictEqual(world.deathReason, "monster");
  assert.ok(events.includes("die"));
});

function platformCenter(platform, time) {
  if (platform.type === "moving") {
    return platform.originX + Math.sin(time * platform.speed + platform.phase) * platform.range + platform.w / 2;
  }
  return platform.x + platform.w / 2;
}

test("un saut aligné atteint la plateforme suivante du parcours", () => {
  for (const seed of [1, 4, 5, 12]) {
    const world = Physics.createWorld(mulberry32(seed));
    for (let extra = 0; extra < 40; extra++) Physics.addRouteStep(world);
    const route = world.platforms.filter((platform) => platform.route).sort((a, b) => b.y - a.y);
    for (let i = 0; i < route.length - 1 && i < 45; i++) {
      const from = route[i];
      const to = route[i + 1];
      world.platforms = [from, to];
      world.monsters = [];
      world.pickups = [];
      world.bullets = [];
      world.alive = true;
      world.routeTip = { y: -1e9 };
      world.player.flight = null;
      world.player.flightTimer = 0;
      world.player.vx = 0;
      world.player.rot = 0;
      world.player.x = platformCenter(from, world.time) - CONFIG.PLAYER_W / 2;
      world.player.y = from.y - CONFIG.PLAYER_H;
      world.player.vy = from.type === "spring" ? CONFIG.SPRING_VY : CONFIG.JUMP_VY;
      world.cameraY = to.y - 200;
      let landed = false;
      for (let frame = 0; frame < 160 && world.alive; frame++) {
        const center = platformCenter(to, world.time + 8);
        const dx = center - (world.player.x + world.player.w / 2);
        const events = Physics.step(world, {
          left: dx < -3,
          right: dx > 3,
          shoot: false,
          power: 1,
        });
        const feet = world.player.y + world.player.h;
        if ((events.includes("jump") || events.includes("spring")) && Math.abs(feet - to.y) < 3) {
          landed = true;
          break;
        }
        if (feet > from.y + 24) break;
      }
      assert.ok(
        landed,
        "raté seed " + seed + " index " + i + " " + from.type + " -> " + to.type + " gap " + Math.round(from.y - to.y)
      );
    }
  }
});

console.log(passed + " tests passés");
