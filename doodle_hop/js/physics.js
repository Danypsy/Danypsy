// Simulation pure de Doodle Hop : physique, plateformes, score.
// Aucune dépendance DOM, pour pouvoir la tester hors navigateur.
(function (root) {
  const CONFIG = {
    VIEW_W: 400,
    VIEW_H: 680,
    GRAVITY: 0.4,
    JUMP_VY: -12.8,
    SPRING_VY: -18.6,
    MAX_FALL: 16,
    MOVE_ACCEL: 1.05,
    MAX_VX: 6.6,
    FRICTION: 0.76,
    PLAYER_W: 46,
    PLAYER_H: 42,
    PLATFORM_H: 16,
    BULLET_VY: -7.2,
    BULLET_LIFE: 70,
    SHOT_COOLDOWN: 16,
    JETPACK_VY: -13.2,
    JETPACK_TIME: 130,
    PROP_VY: -6.6,
    PROP_TIME: 250,
    START_Y: 520,
    MONSTER_BONUS: 250,
    PICKUP_BONUS: 150,
  };

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function jumpReach() {
    let y = 0;
    let vy = CONFIG.JUMP_VY;
    let peak = 0;
    for (let i = 0; i < 500; i++) {
      vy = Math.min(CONFIG.MAX_FALL, vy + CONFIG.GRAVITY);
      y += vy;
      if (-y > peak) peak = -y;
      if (vy > 0 && y >= 0) break;
    }
    // On ne peut atterrir qu'en descendant, donc un peu sous l'apogée.
    return peak - 18;
  }

  const JUMP_REACH = jumpReach();

  function impulseReach(initialVy) {
    let y = 0;
    let vy = initialVy;
    let peak = 0;
    for (let i = 0; i < 500; i++) {
      vy = Math.min(CONFIG.MAX_FALL, vy + CONFIG.GRAVITY);
      y += vy;
      if (-y > peak) peak = -y;
      if (vy > 0 && y >= 0) break;
    }
    return peak - 22;
  }

  const SPRING_REACH = impulseReach(CONFIG.SPRING_VY);

  function computeScore(world) {
    return Math.floor(world.maxClimb / 10) + world.bonus;
  }

  function makePlatform(world, spec) {
    const platform = {
      id: world.nextId++,
      x: spec.x,
      y: spec.y,
      w: spec.w,
      h: CONFIG.PLATFORM_H,
      type: spec.type,
      route: !!spec.route,
      originX: spec.originX ?? spec.x,
      range: spec.range || 0,
      speed: spec.speed || 0.045,
      phase: spec.phase || 0,
      broken: false,
      used: false,
      alpha: 1,
      fallVy: 0,
      rot: spec.rot || 0,
      springAnim: 0,
      hasMonster: false,
      dead: false,
    };
    world.platforms.push(platform);
    return platform;
  }

  function burst(world, x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = world.rng() * Math.PI * 2;
      const vel = speed * (0.35 + world.rng());
      world.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 1.2,
        life: 18 + world.rng() * 16,
        max: 34,
        color,
        size: 2 + world.rng() * 3,
        g: 0.14,
      });
    }
    if (world.particles.length > 180) {
      world.particles.splice(0, world.particles.length - 180);
    }
  }

  function floatText(world, text, x, y, color) {
    world.texts.push({ text, x, y, vy: -0.55, life: 52, max: 52, color });
    if (world.texts.length > 14) world.texts.shift();
  }

  function addMonster(world, platform) {
    const monster = {
      id: world.nextId++,
      platformId: platform.id,
      w: 40,
      h: 32,
      x: platform.x + platform.w / 2 - 20,
      y: platform.y - 32,
      vy: 0,
      falling: false,
      alive: true,
      bob: world.rng() * Math.PI * 2,
    };
    platform.hasMonster = true;
    world.monsters.push(monster);
    return monster;
  }

  function addPickup(world, platform, kind) {
    world.pickups.push({
      id: world.nextId++,
      platformId: platform.id,
      kind,
      x: platform.x + platform.w / 2,
      y: platform.y - 28,
      bob: world.rng() * Math.PI * 2,
      taken: false,
    });
  }

  function addRouteStep(world) {
    const tip = world.routeTip;
    const climb = Math.max(0, world.startFeet - tip.y);
    const t = clamp(climb / 14000, 0, 1);
    const early = clamp(climb / 1600, 0, 1);
    const rng = world.rng;

    const minGap = lerp(54, lerp(62, 92, t), early);
    let maxGap = lerp(80, JUMP_REACH, early);
    if (maxGap < minGap + 6) maxGap = minGap + 6;
    if (maxGap > JUMP_REACH) maxGap = JUMP_REACH;
    const gap = minGap + (maxGap - minGap) * rng();

    const maxShift = lerp(22, lerp(68, 140, t), early);
    const w = Math.round(lerp(92, lerp(78, 64, t), early));
    const y = tip.y - gap;

    const roll = rng();
    const movingChance = lerp(0.02, 0.32, t) * early;
    const springChance = lerp(0.1, 0.2, t);
    let type = "static";
    if (roll < movingChance) type = "moving";
    else if (roll < movingChance + springChance) type = "spring";

    let range = 0;
    let originX = tip.x + tip.w / 2 - w / 2 + (rng() * 2 - 1) * maxShift;
    let speed = 0.04 + rng() * 0.025;
    let phase = rng() * Math.PI * 2;

    if (type === "moving") {
      range = lerp(24, 46, t) + rng() * 12;
      const minO = 8 + range;
      const maxO = CONFIG.VIEW_W - w - 8 - range;
      originX = clamp(originX, minO, Math.max(minO, maxO));
    } else {
      originX = clamp(originX, 8, CONFIG.VIEW_W - w - 8);
    }

    const platform = makePlatform(world, {
      x: originX,
      y,
      w,
      type,
      route: true,
      originX,
      range,
      speed,
      phase,
    });
    if (type === "moving") {
      const angle = world.time * speed + phase;
      platform.x = originX + Math.sin(angle) * range;
      platform.dir = Math.cos(angle) >= 0 ? 1 : -1;
    }
    world.routeTip = platform;
    placeExtra(world, platform, climb);
    placeDecor(world, platform, climb);
    if (type === "spring") {
      const catchW = 124;
      const center = platform.x + platform.w / 2;
      const catchX = clamp(center - catchW / 2, 8, CONFIG.VIEW_W - catchW - 8);
      const catchGap = SPRING_REACH * 0.62;
      const landing = makePlatform(world, {
        x: catchX,
        y: platform.y - catchGap,
        w: catchW,
        type: "static",
        route: true,
        originX: catchX,
      });
      world.routeTip = landing;
      placeDecor(world, landing, climb + catchGap);
    }
    return { gap, dx: Math.abs(platform.x + platform.w / 2 - (tip.x + tip.w / 2)), platform };
  }

  function placeExtra(world, anchor, climb) {
    if (world.rng() > lerp(0.35, 0.72, clamp(climb / 8000, 0, 1))) return;

    const w = 66;
    const side = world.rng() < 0.5 ? -1 : 1;
    const gap = 36 + world.rng() * 28;
    const fits = (value) => value >= 8 && value + w <= CONFIG.VIEW_W - 8;
    let x = side < 0 ? anchor.x - w - gap : anchor.x + anchor.w + gap;
    if (!fits(x)) x = side < 0 ? anchor.x + anchor.w + gap : anchor.x - w - gap;
    if (!fits(x)) return;
    if (anchor.type === "moving") {
      const sweepL = anchor.originX - anchor.range;
      const sweepR = anchor.originX + anchor.w + anchor.range;
      if (x + w > sweepL - 20 && x < sweepR + 20) return;
    }

    const y = anchor.y + (world.rng() * 16 - 8);
    const roll = world.rng();
    let type = "static";
    if (roll < 0.42) type = "break";
    else if (roll < 0.68) type = "vanish";

    const platform = makePlatform(world, { x, y, w, type, route: false, originX: x });

    const monsterChance = climb > 1800 ? lerp(0.12, 0.4, clamp((climb - 1800) / 8000, 0, 1)) : 0;
    if (type === "static" && world.rng() < monsterChance) {
      addMonster(world, platform);
      return;
    }

    if (type === "break" || platform.hasMonster) return;
    const pickupChance = climb > 2400 ? 0.1 : 0;
    if (world.rng() < pickupChance) {
      const kind = climb > 6500 && world.rng() < 0.4 ? "jetpack" : "propeller";
      addPickup(world, platform, kind);
    }
  }

  function placeDecor(world, anchor, climb) {
    if (world.rng() < 0.75) {
      const kinds = ["star", "heart", "spiral", "box"];
      const colors = ["#e07a7a", "#6aa2d8", "#e2b04a", "#7a6ad8", "#5cba78"];
      const left = world.rng() < 0.5;
      world.decors.push({
        kind: kinds[Math.floor(world.rng() * kinds.length)],
        color: colors[Math.floor(world.rng() * colors.length)],
        x: left ? 8 + world.rng() * 14 : CONFIG.VIEW_W - 26 - world.rng() * 8,
        y: anchor.y - world.rng() * 36,
        rot: world.rng() * Math.PI,
      });
    }

    const bannerEvery = 900;
    const reached = world.startFeet - anchor.y;
    if (reached >= world.nextBanner) {
      world.decors.push({
        kind: "banner",
        color: "#2c3338",
        x: 46,
        y: anchor.y,
        rot: 0,
        label: Math.floor(reached / 10) + "",
      });
      world.nextBanner += bannerEvery;
    }

    if (world.decors.length > 80) {
      world.decors.splice(0, world.decors.length - 80);
    }
  }

  function fillPlatforms(world, targetY, limit) {
    let count = 0;
    while (world.routeTip.y > targetY && count < limit) {
      addRouteStep(world);
      count++;
    }
    return count;
  }

  function createWorld(rng) {
    const random = rng || Math.random;
    const startW = 132;
    const world = {
      rng: random,
      nextId: 1,
      platforms: [],
      monsters: [],
      pickups: [],
      bullets: [],
      particles: [],
      texts: [],
      decors: [],
      cameraY: 0,
      startFeet: CONFIG.START_Y,
      maxClimb: 0,
      bonus: 0,
      score: 0,
      alive: true,
      deathReason: "",
      time: 0,
      shotCd: 0,
      shake: 0,
      intro: 200,
      nextBanner: 900,
      routeTip: null,
    };

    const start = makePlatform(world, {
      x: (CONFIG.VIEW_W - startW) / 2,
      y: CONFIG.START_Y,
      w: startW,
      type: "static",
      route: true,
      originX: (CONFIG.VIEW_W - startW) / 2,
    });
    world.routeTip = start;
    world.player = {
      x: start.x + start.w / 2 - CONFIG.PLAYER_W / 2,
      y: start.y - CONFIG.PLAYER_H,
      w: CONFIG.PLAYER_W,
      h: CONFIG.PLAYER_H,
      vx: 0,
      vy: CONFIG.JUMP_VY,
      prevX: 0,
      prevY: start.y - CONFIG.PLAYER_H,
      squash: 0,
      facing: 1,
      rot: 0,
      flight: null,
      flightTimer: 0,
      blink: 0,
    };
    world.player.prevX = world.player.x;
    world.cameraY = world.player.y - CONFIG.VIEW_H * 0.62;
    fillPlatforms(world, world.cameraY - CONFIG.VIEW_H * 2.2, 400);
    world.score = 0;
    return world;
  }

  function horizOverlap(player, platform) {
    const left = player.x + player.w * 0.1;
    const right = player.x + player.w * 0.9;
    return right > platform.x - 8 && left < platform.x + platform.w + 8;
  }

  function updateMoving(world) {
    for (const platform of world.platforms) {
      if (platform.dead || platform.broken) continue;
      if (platform.type === "moving") {
        const angle = world.time * platform.speed + platform.phase;
        platform.x = platform.originX + Math.sin(angle) * platform.range;
        platform.dir = Math.cos(angle) >= 0 ? 1 : -1;
      }
      if (platform.springAnim > 0) platform.springAnim *= 0.86;
      if (platform.type === "vanish" && platform.used) {
        platform.alpha -= 0.07;
        if (platform.alpha <= 0) platform.dead = true;
      }
    }
    for (const platform of world.platforms) {
      if (!platform.broken) continue;
      platform.fallVy += 0.45;
      platform.y += platform.fallVy;
      platform.rot += 0.12;
    }
  }

  function landOn(world, platform, events) {
    const player = world.player;
    if (platform.type === "break") {
      platform.broken = true;
      platform.fallVy = 2.2;
      events.push("break");
      world.shake = Math.max(world.shake, 3);
      burst(world, player.x + player.w / 2, platform.y, "#a56b32", 10, 2.4);
      return;
    }

    player.y = platform.y - player.h;
    player.squash = 1;
    if (platform.type === "spring") {
      player.vy = CONFIG.SPRING_VY;
      platform.springAnim = 1;
      events.push("spring");
      world.shake = Math.max(world.shake, 5);
      burst(world, player.x + player.w / 2, platform.y, "#e23d3d", 12, 3.2);
      floatText(world, "BOING", player.x + player.w / 2, player.y, "#e23d3d");
    } else {
      player.vy = CONFIG.JUMP_VY;
      events.push("jump");
      burst(world, player.x + player.w / 2, platform.y, "#c9d7c4", 6, 1.6);
    }
    if (platform.type === "vanish") platform.used = true;
    if (platform.type === "moving") {
      const push =
        Math.cos(world.time * platform.speed + platform.phase) *
        platform.speed *
        platform.range;
      player.vx += push * 0.12;
    }
  }

  function collidePlatforms(world, events) {
    const player = world.player;
    if (player.flight || player.vy <= 0) return;
    const prevFeet = player.prevY + player.h;
    const feet = player.y + player.h;
    let best = null;
    for (const platform of world.platforms) {
      if (platform.dead || platform.broken || platform.alpha <= 0) continue;
      if (platform.type === "vanish" && platform.used) continue;
      if (!horizOverlap(player, platform)) continue;
      if (prevFeet <= platform.y && feet >= platform.y) {
        const safeBias = platform.type === "break" ? 1 : 0;
        if (!best || platform.y < best.platform.y - 0.5 || (Math.abs(platform.y - best.platform.y) <= 0.5 && safeBias < best.bias)) {
          best = { platform, bias: safeBias };
        }
      }
    }
    if (best) landOn(world, best.platform, events);
  }

  function syncRiders(world) {
    for (const monster of world.monsters) {
      if (!monster.alive || monster.falling) continue;
      const platform = world.platforms.find((item) => item.id === monster.platformId);
      if (!platform || platform.dead || platform.broken) {
        monster.falling = true;
        continue;
      }
      monster.x = platform.x + platform.w / 2 - monster.w / 2;
      monster.y = platform.y - monster.h + Math.sin(world.time * 0.08 + monster.bob) * 2;
    }
    for (const pickup of world.pickups) {
      if (pickup.taken) continue;
      const platform = world.platforms.find((item) => item.id === pickup.platformId);
      if (!platform || platform.dead || platform.broken) {
        pickup.taken = true;
        continue;
      }
      pickup.x = platform.x + platform.w / 2;
      pickup.y = platform.y - 30 + Math.sin(world.time * 0.09 + pickup.bob) * 3;
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function killMonster(world, monster, events, bounced) {
    monster.alive = false;
    world.bonus += CONFIG.MONSTER_BONUS;
    world.shake = Math.max(world.shake, 4);
    events.push("monster");
    burst(world, monster.x + monster.w / 2, monster.y + monster.h / 2, "#b9a6ff", 14, 3);
    floatText(world, "+" + CONFIG.MONSTER_BONUS, monster.x + monster.w / 2, monster.y, "#6d28d9");
    if (bounced) world.player.vy = CONFIG.JUMP_VY * 0.92;
  }

  function collideMonsters(world, events) {
    const player = world.player;
    const prevFeet = player.prevY + player.h;
    for (const monster of world.monsters) {
      if (!monster.alive) continue;
      const box = {
        x: monster.x + 6,
        y: monster.y + 2,
        w: monster.w - 12,
        h: monster.h - 4,
      };
      if (!rectsOverlap(player, box)) continue;
      if (player.flight) {
        killMonster(world, monster, events, false);
        continue;
      }
      const feet = player.y + player.h;
      const stomp = player.vy > 0 && prevFeet <= monster.y + 14 && feet >= monster.y - 2;
      if (stomp) {
        player.y = monster.y - player.h;
        player.squash = 0.85;
        killMonster(world, monster, events, true);
      } else {
        die(world, events, "monster");
        return;
      }
    }
  }

  function collidePickups(world, events) {
    const player = world.player;
    for (const pickup of world.pickups) {
      if (pickup.taken) continue;
      const box = { x: pickup.x - 16, y: pickup.y - 16, w: 32, h: 32 };
      if (!rectsOverlap(player, box)) continue;
      pickup.taken = true;
      if (pickup.kind === "jetpack") {
        player.flight = "jetpack";
        player.flightTimer = CONFIG.JETPACK_TIME;
        events.push("jetpack");
        floatText(world, "JETPACK", player.x + player.w / 2, player.y - 10, "#e09a18");
      } else {
        player.flight = "propeller";
        player.flightTimer = CONFIG.PROP_TIME;
        events.push("propeller");
        floatText(world, "HÉLICE", player.x + player.w / 2, player.y - 10, "#d6457a");
      }
      world.bonus += CONFIG.PICKUP_BONUS;
      world.shake = Math.max(world.shake, 3);
    }
  }

  function updateBullets(world, events) {
    for (const bullet of world.bullets) {
      bullet.y += bullet.vy;
      bullet.life--;
      if (bullet.life <= 0) bullet.dead = true;
      for (const monster of world.monsters) {
        if (!monster.alive || bullet.dead) continue;
        const cx = monster.x + monster.w / 2;
        const cy = monster.y + monster.h / 2;
        const dx = bullet.x - cx;
        const dy = bullet.y - cy;
        if (dx * dx + dy * dy < 24 * 24) {
          bullet.dead = true;
          killMonster(world, monster, events, false);
        }
      }
    }
    world.bullets = world.bullets.filter((bullet) => !bullet.dead && bullet.y > world.cameraY - 80);
  }

  function tryShoot(world, events) {
    const player = world.player;
    if (world.shotCd > 0) return;
    world.shotCd = CONFIG.SHOT_COOLDOWN;
    const noseX = player.x + player.w / 2 + player.facing * 6;
    world.bullets.push({
      x: noseX,
      y: player.y - 4,
      vy: CONFIG.BULLET_VY,
      r: 7,
      life: CONFIG.BULLET_LIFE,
      dead: false,
    });
    burst(world, noseX, player.y - 2, "#243038", 6, 2.2);
    if (world.bullets.length > 4) world.bullets.splice(0, world.bullets.length - 4);
    events.push("shoot");
  }

  function die(world, events, reason) {
    if (!world.alive) return;
    world.alive = false;
    world.deathReason = reason;
    world.shake = Math.max(world.shake, 7);
    events.push("die");
  }

  function updateParticles(world) {
    for (const particle of world.particles) {
      particle.vy += particle.g;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
    }
    world.particles = world.particles.filter((particle) => particle.life > 0);
    for (const text of world.texts) {
      text.y += text.vy;
      text.life--;
    }
    world.texts = world.texts.filter((text) => text.life > 0);
  }

  function cull(world) {
    const bottom = world.cameraY + CONFIG.VIEW_H + 140;
    world.platforms = world.platforms.filter((platform) => !platform.dead && platform.y < bottom);
    world.monsters = world.monsters.filter((monster) => monster.alive && monster.y < bottom);
    world.pickups = world.pickups.filter((pickup) => !pickup.taken && pickup.y < bottom + 40);
    world.decors = world.decors.filter((decor) => decor.y < bottom && decor.y > world.cameraY - 200);
  }

  function wrapPlayer(player) {
    if (player.x < -player.w) player.x += CONFIG.VIEW_W;
    else if (player.x > CONFIG.VIEW_W) player.x -= CONFIG.VIEW_W;
  }

  function step(world, input) {
    const events = [];
    const player = world.player;
    const controls = input || { left: false, right: false, shoot: false, power: 1 };

    if (!world.alive) {
      player.vy = Math.min(CONFIG.MAX_FALL, player.vy + CONFIG.GRAVITY);
      player.y += player.vy;
      player.rot += 0.18 * (player.facing || 1);
      updateParticles(world);
      world.time++;
      world.shake *= 0.9;
      if (world.shake < 0.25) world.shake = 0;
      return events;
    }

    player.prevX = player.x;
    player.prevY = player.y;
    const power = controls.power == null ? 1 : controls.power;

    if (controls.left && !controls.right) {
      player.vx -= CONFIG.MOVE_ACCEL * power;
      player.facing = -1;
    } else if (controls.right && !controls.left) {
      player.vx += CONFIG.MOVE_ACCEL * power;
      player.facing = 1;
    } else {
      player.vx *= CONFIG.FRICTION;
      if (Math.abs(player.vx) < 0.04) player.vx = 0;
    }
    player.vx = clamp(player.vx, -CONFIG.MAX_VX, CONFIG.MAX_VX);

    if (player.flight) {
      player.flightTimer--;
      player.vy = player.flight === "jetpack" ? CONFIG.JETPACK_VY : CONFIG.PROP_VY;
      if (player.flight === "jetpack" && world.time % 2 === 0) {
        burst(world, player.x + player.w / 2, player.y + player.h - 4, world.time % 4 === 0 ? "#ffb703" : "#fb8500", 1, 1.2);
      }
      if (player.flightTimer <= 0) {
        player.flight = null;
        player.vy = -3.2;
        events.push("flight-end");
      }
    } else {
      player.vy = Math.min(CONFIG.MAX_FALL, player.vy + CONFIG.GRAVITY);
    }

    player.x += player.vx;
    player.y += player.vy;
    wrapPlayer(player);
    if (player.squash > 0) player.squash *= 0.82;

    updateMoving(world);
    syncRiders(world);
    if (world.alive) collideMonsters(world, events);
    if (world.alive) collidePlatforms(world, events);
    if (world.alive) collidePickups(world, events);

    if (world.shotCd > 0) world.shotCd--;
    if (world.alive && controls.shoot) tryShoot(world, events);
    updateBullets(world, events);

    for (const monster of world.monsters) {
      if (!monster.falling || !monster.alive) continue;
      monster.vy += 0.45;
      monster.y += monster.vy;
    }

    const desired = player.y - CONFIG.VIEW_H * 0.4;
    if (desired < world.cameraY) {
      world.cameraY += (desired - world.cameraY) * 0.2;
    }

    const climb = world.startFeet - (player.y + player.h);
    if (climb > world.maxClimb) world.maxClimb = climb;
    const previousScore = world.score;
    world.score = computeScore(world);
    if (Math.floor(world.score / 1000) > Math.floor(previousScore / 1000) && world.score >= 1000) {
      events.push("milestone");
      floatText(world, world.score + "", CONFIG.VIEW_W / 2, world.cameraY + 120, "#234");
    }

    const feet = player.y + player.h;
    const fellOff = feet > world.cameraY + CONFIG.VIEW_H + 28 && player.vy > 0;
    if (fellOff) die(world, events, "fall");

    fillPlatforms(world, world.cameraY - CONFIG.VIEW_H * 1.6, 16);
    cull(world);
    updateParticles(world);

    if (world.intro > 0) world.intro--;
    world.time++;
    world.shake *= 0.88;
    if (world.shake < 0.25) world.shake = 0;
    return events;
  }

  root.DoodlePhysics = {
    CONFIG,
    JUMP_REACH,
    SPRING_REACH,
    clamp,
    lerp,
    jumpReach,
    computeScore,
    createWorld,
    addRouteStep,
    fillPlatforms,
    step,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
