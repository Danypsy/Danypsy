// Rendu papier millimétré de Doodle Hop.
(function (root) {
  const P = () => root.DoodlePhysics;
  const INK = "#243038";

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawPaper(ctx, cameraY) {
    const { VIEW_W: W, VIEW_H: H } = P().CONFIG;
    ctx.fillStyle = "#f7f2e6";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#d5e3f4";
    ctx.lineWidth = 1;
    const spacing = 28;
    let y = Math.floor(cameraY / spacing) * spacing;
    for (; y < cameraY + H + spacing; y += spacing) {
      const sy = Math.round(y - cameraY) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
    }

    ctx.strokeStyle = "#f3b7b7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 0);
    ctx.lineTo(36, H);
    ctx.stroke();

    const holeSpacing = 92;
    let hy = Math.floor((cameraY - 20) / holeSpacing) * holeSpacing;
    for (; hy < cameraY + H + holeSpacing; hy += holeSpacing) {
      const sy = hy - cameraY;
      ctx.fillStyle = "#efe7d6";
      ctx.beginPath();
      ctx.arc(16, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e0d5c0";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawDecor(ctx, decor, sy) {
    ctx.save();
    ctx.translate(decor.x, sy);
    ctx.rotate(decor.rot || 0);
    ctx.strokeStyle = decor.color;
    ctx.fillStyle = decor.color;
    ctx.lineWidth = 1.6;
    if (decor.kind === "star") {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](Math.cos(angle) * 7, Math.sin(angle) * 7);
        const inner = angle + Math.PI / 5;
        ctx.lineTo(Math.cos(inner) * 3, Math.sin(inner) * 3);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (decor.kind === "heart") {
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-8, -4, -3, -8, 0, -3);
      ctx.bezierCurveTo(3, -8, 8, -4, 0, 3);
      ctx.fill();
    } else if (decor.kind === "spiral") {
      ctx.beginPath();
      for (let a = 0; a < 9; a += 0.4) {
        const radius = 1 + a * 0.7;
        const method = a === 0 ? "moveTo" : "lineTo";
        ctx[method](Math.cos(a) * radius, Math.sin(a) * radius);
      }
      ctx.stroke();
    } else if (decor.kind === "banner") {
      ctx.font = "700 12px Trebuchet MS, sans-serif";
      ctx.fillStyle = "rgba(36,48,56,0.45)";
      ctx.textAlign = "left";
      ctx.fillText(decor.label + " pts", 0, 4);
    } else {
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlatform(ctx, platform, sy) {
    ctx.save();
    ctx.translate(platform.x + platform.w / 2, sy + platform.h / 2);
    if (platform.rot) ctx.rotate(platform.rot);
    ctx.translate(-platform.w / 2, -platform.h / 2);
    ctx.globalAlpha = Math.max(0, platform.alpha);

    const styles = {
      static: ["#63c56f", "#2f8d45"],
      moving: ["#5eb4e4", "#2b79a8"],
      spring: ["#63c56f", "#2f8d45"],
      break: ["#d39a58", "#8d5a28"],
      vanish: ["#fbf7ee", "#c9c1b2"],
    };
    const [top, edge] = styles[platform.type] || styles.static;

    ctx.fillStyle = "rgba(36,48,56,0.08)";
    roundRect(ctx, 2, 4, platform.w, platform.h, 7);
    ctx.fill();

    ctx.fillStyle = edge;
    roundRect(ctx, 0, 3, platform.w, platform.h, 7);
    ctx.fill();
    ctx.fillStyle = top;
    roundRect(ctx, 0, 0, platform.w, platform.h - 2, 7);
    ctx.fill();

    if (platform.type === "static" || platform.type === "spring") {
      ctx.fillStyle = "#8fe09a";
      roundRect(ctx, 6, 3, platform.w - 12, 4, 2);
      ctx.fill();
    }
    if (platform.type === "moving") {
      const dir = platform.dir || 1;
      const mid = platform.h / 2 - 1;
      const tip = dir > 0 ? platform.w - 14 : 14;
      const back = dir > 0 ? platform.w - 24 : 24;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.moveTo(back, mid - 4);
      ctx.lineTo(tip, mid);
      ctx.lineTo(back, mid + 4);
      ctx.closePath();
      ctx.fill();
    }
    if (platform.type === "break") {
      ctx.strokeStyle = "rgba(90,40,10,0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(platform.w * 0.35, 2);
      ctx.lineTo(platform.w * 0.48, platform.h / 2);
      ctx.lineTo(platform.w * 0.4, platform.h - 2);
      ctx.moveTo(platform.w * 0.62, 3);
      ctx.lineTo(platform.w * 0.7, platform.h - 3);
      ctx.stroke();
    }
    if (platform.type === "vanish") {
      ctx.strokeStyle = "#b7ad9d";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      roundRect(ctx, 1.5, 1.5, platform.w - 3, platform.h - 4, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    if (platform.type === "spring" && !platform.broken) {
      const coil = 22 * (1 - 0.45 * (platform.springAnim || 0));
      const cx = platform.x + platform.w / 2;
      ctx.strokeStyle = "#d53333";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const turns = 4;
      for (let i = 0; i <= turns * 8; i++) {
        const t = i / (turns * 8);
        const px = cx + Math.sin(t * turns * Math.PI * 2) * 7;
        const py = sy - coil * (1 - t);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = "#ffd1d1";
      ctx.beginPath();
      ctx.arc(cx, sy - coil, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d53333";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawMonster(ctx, monster, sy) {
    const x = monster.x;
    const y = sy;
    ctx.save();
    ctx.translate(x + monster.w / 2, y + monster.h / 2);
    ctx.fillStyle = "#8b6cf6";
    ctx.strokeStyle = "#4c1d95";
    ctx.lineWidth = 2;
    roundRect(ctx, -monster.w / 2, -monster.h / 2 + 2, monster.w, monster.h - 2, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#6d28d9";
    ctx.beginPath();
    ctx.moveTo(-10, -monster.h / 2 + 4);
    ctx.lineTo(-6, -monster.h / 2 - 6);
    ctx.lineTo(-2, -monster.h / 2 + 4);
    ctx.moveTo(2, -monster.h / 2 + 4);
    ctx.lineTo(6, -monster.h / 2 - 6);
    ctx.lineTo(10, -monster.h / 2 + 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-8, -1, 5, 0, Math.PI * 2);
    ctx.arc(8, -1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-7, 0, 2.2, 0, Math.PI * 2);
    ctx.arc(9, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(-4, -5);
    ctx.moveTo(12, -8);
    ctx.lineTo(4, -5);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-3, 12);
    ctx.lineTo(0, 8);
    ctx.lineTo(3, 12);
    ctx.lineTo(6, 8);
    ctx.fill();
    ctx.restore();
  }

  function drawPickup(ctx, pickup, sy) {
    ctx.save();
    ctx.translate(pickup.x, sy);
    if (pickup.kind === "jetpack") {
      ctx.fillStyle = "#f4f4f5";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      roundRect(ctx, -12, -8, 8, 16, 2);
      roundRect(ctx, 4, -8, 8, 16, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fb8500";
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-4, 16);
      ctx.lineTo(-12, 16);
      ctx.moveTo(8, 8);
      ctx.lineTo(12, 16);
      ctx.lineTo(4, 16);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#db2777";
      ctx.fillStyle = "#fbcfe8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-10, 2, 10, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(10, 2, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer(ctx, world, px, py) {
    const player = world.player;
    const squash = player.squash || 0;
    ctx.save();
    ctx.translate(px + player.w / 2, py + player.h / 2 + 2);
    const tilt = Math.max(-0.4, Math.min(0.4, player.vx / 16));
    ctx.rotate(tilt + (player.rot || 0));
    ctx.scale(1 + squash * 0.28, 1 - squash * 0.22);

    if (player.flight === "jetpack") {
      const flame = 8 + Math.sin(world.time * 0.9) * 4;
      ctx.fillStyle = world.time % 4 < 2 ? "#ffb703" : "#fb8500";
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-4, 8 + flame);
      ctx.lineTo(0, 8);
      ctx.moveTo(4, 8);
      ctx.lineTo(8, 8 + flame);
      ctx.lineTo(12, 8);
      ctx.fill();
      ctx.fillStyle = "#e5e7eb";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.4;
      roundRect(ctx, -16, -2, 8, 14, 2);
      roundRect(ctx, 8, -2, 8, 14, 2);
      ctx.fill();
      ctx.stroke();
    }

    const step = Math.sin(world.time * 0.35) * Math.min(1, Math.abs(player.vx) / 3);
    ctx.fillStyle = "#1f8a55";
    ctx.beginPath();
    ctx.ellipse(-10, 16, 7, 4, -0.4 + step * 0.3, 0, Math.PI * 2);
    ctx.ellipse(10, 16, 7, 4, 0.4 - step * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1f8a55";
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#146b40";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = "#b6f3d2";
    ctx.beginPath();
    ctx.ellipse(0, 8, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#14784a";
    ctx.beginPath();
    ctx.ellipse(-6, -12, 4, 6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(7, -13, 3.5, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    const blink = world.time % 190 > 182;
    ctx.fillStyle = "#fff";
    if (!blink) {
      ctx.beginPath();
      ctx.ellipse(-7, -1, 5.2, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(7, -1, 5.2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      const look = player.facing * 1.6;
      ctx.beginPath();
      ctx.arc(-7 + look, -1, 2.3, 0, Math.PI * 2);
      ctx.arc(7 + look, -1, 2.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-12, -1);
      ctx.quadraticCurveTo(-7, 2, -2, -1);
      ctx.moveTo(2, -1);
      ctx.quadraticCurveTo(7, 2, 12, -1);
      ctx.stroke();
    }

    ctx.strokeStyle = "#146b40";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    if (player.flight === "propeller") {
      const spin = world.time * 0.45;
      ctx.save();
      ctx.translate(0, -18);
      ctx.strokeStyle = "#9d174d";
      ctx.fillStyle = "#f9a8d4";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(spin);
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlayerWrapped(ctx, world) {
    const player = world.player;
    const sy = player.y - world.cameraY;
    drawPlayer(ctx, world, player.x, sy);
    if (player.x < 0) drawPlayer(ctx, world, player.x + P().CONFIG.VIEW_W, sy);
    if (player.x + player.w > P().CONFIG.VIEW_W) drawPlayer(ctx, world, player.x - P().CONFIG.VIEW_W, sy);
  }

  function drawHud(ctx, world) {
    const { VIEW_W: W } = P().CONFIG;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "800 30px Trebuchet MS, sans-serif";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(247,242,230,0.92)";
    ctx.fillStyle = INK;
    const label = world.score + "";
    ctx.strokeText(label, W / 2, 46);
    ctx.fillText(label, W / 2, 46);
    ctx.font = "700 13px Trebuchet MS, sans-serif";
    ctx.fillStyle = "rgba(36,48,56,0.62)";
    ctx.fillText("SCORE", W / 2, 64);
    ctx.restore();
  }

  function drawWorld(ctx, world, options) {
    const { VIEW_W: W, VIEW_H: H } = P().CONFIG;
    ctx.save();
    if (!options.reduceMotion && world.shake) {
      ctx.translate(
        Math.sin(world.time * 1.7) * world.shake,
        Math.cos(world.time * 2.1) * world.shake * 0.65
      );
    }
    drawPaper(ctx, world.cameraY);

    for (const decor of world.decors) {
      const sy = decor.y - world.cameraY;
      if (sy < -30 || sy > H + 30) continue;
      drawDecor(ctx, decor, sy);
    }
    for (const platform of world.platforms) {
      const sy = platform.y - world.cameraY;
      if (sy < -40 || sy > H + 40) continue;
      drawPlatform(ctx, platform, sy);
    }
    for (const pickup of world.pickups) {
      if (pickup.taken) continue;
      const sy = pickup.y - world.cameraY;
      if (sy < -40 || sy > H + 40) continue;
      drawPickup(ctx, pickup, sy);
    }
    for (const monster of world.monsters) {
      if (!monster.alive) continue;
      const sy = monster.y - world.cameraY;
      if (sy < -40 || sy > H + 40) continue;
      drawMonster(ctx, monster, sy);
    }
    for (const particle of world.particles) {
      const sy = particle.y - world.cameraY;
      ctx.globalAlpha = Math.max(0, particle.life / particle.max);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, sy, particle.size, particle.size);
      ctx.globalAlpha = 1;
    }
    drawPlayerWrapped(ctx, world);
    for (const bullet of world.bullets) {
      const sy = bullet.y - world.cameraY;
      ctx.fillStyle = "rgba(36,48,56,0.28)";
      ctx.beginPath();
      ctx.ellipse(bullet.x, sy + 16, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(bullet.x, sy, 7, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f4f7fb";
      ctx.beginPath();
      ctx.arc(bullet.x - 2, sy - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const text of world.texts) {
      const sy = text.y - world.cameraY;
      ctx.globalAlpha = Math.max(0, text.life / text.max);
      ctx.fillStyle = text.color;
      ctx.font = "800 16px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text.text, text.x, sy);
      ctx.globalAlpha = 1;
    }
    drawHud(ctx, world);
    ctx.restore();
  }

  function drawMenu(ctx, time) {
    const { VIEW_W: W, VIEW_H: H } = P().CONFIG;
    const cameraY = 80 + Math.sin(time * 0.01) * 10;
    drawPaper(ctx, cameraY);
    const platforms = [
      { x: 70, y: cameraY + H - 210, w: 100, h: 16, type: "static", alpha: 1, rot: 0 },
      { x: 230, y: cameraY + H - 300, w: 90, h: 16, type: "moving", alpha: 1, rot: 0, phase: 0 },
      { x: 48, y: cameraY + H - 390, w: 84, h: 16, type: "spring", alpha: 1, rot: 0, springAnim: (Math.sin(time * 0.08) + 1) / 2 },
      { x: 250, y: cameraY + H - 470, w: 76, h: 16, type: "break", alpha: 1, rot: 0 },
    ];
    for (const platform of platforms) drawPlatform(ctx, platform, platform.y - cameraY);

    const bounce = Math.abs(Math.sin(time * 0.045));
    const world = {
      time,
      cameraY,
      player: {
        x: 70 + 50 - 23 + Math.sin(time * 0.02) * 16,
        y: cameraY + H - 210 - 42 - bounce * 120,
        w: 46,
        h: 42,
        vx: Math.cos(time * 0.02) * 2,
        squash: bounce < 0.08 ? 1 : bounce * 0.15,
        facing: Math.cos(time * 0.02) > 0 ? 1 : -1,
        rot: 0,
        flight: null,
      },
    };
    drawPlayerWrapped(ctx, world);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#8b6cf6";
    ctx.beginPath();
    ctx.arc(292, H - 330, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(286, H - 332, 3, 0, Math.PI * 2);
    ctx.arc(298, H - 332, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  root.DoodleDraw = {
    drawWorld,
    drawMenu,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
