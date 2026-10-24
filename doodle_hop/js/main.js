// Point d'entrée : boucle, boutons, clavier et tactile.
(function () {
  const config = () => DoodlePhysics.CONFIG;

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game");
    const audio = new DoodleAudio();
    const game = new DoodleGame(canvas, audio);
    const ui = {
      menu: document.getElementById("screen-menu"),
      pause: document.getElementById("screen-pause"),
      over: document.getElementById("screen-over"),
      hud: document.getElementById("hud"),
      shoot: document.getElementById("btn-shoot"),
      best: document.getElementById("menu-best"),
      overScore: document.getElementById("over-score"),
      overBest: document.getElementById("over-best"),
      overMsg: document.getElementById("over-msg"),
      record: document.getElementById("over-record"),
      mute: document.getElementById("btn-mute"),
    };

    let muted = game.loadMute();
    audio.setMuted(muted);
    syncMute();
    window.doodleHop = game;

    function syncMute() {
      ui.mute.textContent = muted ? "Son coupé" : "Son";
      ui.mute.setAttribute("aria-pressed", muted ? "true" : "false");
    }

    function pointerToView(event) {
      const rect = canvas.getBoundingClientRect();
      const view = config();
      return {
        x: ((event.clientX - rect.left) / rect.width) * view.VIEW_W,
        y: ((event.clientY - rect.top) / rect.height) * view.VIEW_H,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function syncScreens() {
      ui.menu.classList.toggle("hidden", game.mode !== "menu");
      ui.pause.classList.toggle("hidden", game.mode !== "pause");
      ui.over.classList.toggle("hidden", game.mode !== "over");
      const playing = game.mode === "play" || game.mode === "dying" || game.mode === "pause";
      ui.hud.classList.toggle("hidden", game.mode === "menu");
      ui.shoot.classList.toggle("hidden", !playing);
      ui.best.textContent = String(game.best);
      if (game.mode === "over") {
        ui.overScore.textContent = String(game.score());
        ui.overBest.textContent = String(game.best);
        ui.overMsg.textContent = game.deathMessage();
        ui.record.classList.toggle("hidden", !game.newRecord);
      }
    }

    function startGame() {
      audio.resume();
      game.start();
      syncScreens();
    }

    document.getElementById("btn-play").addEventListener("click", startGame);
    document.getElementById("btn-again").addEventListener("click", startGame);
    document.getElementById("btn-retry").addEventListener("click", startGame);
    document.getElementById("btn-resume").addEventListener("click", () => {
      audio.resume();
      if (game.mode === "pause") game.mode = "play";
      syncScreens();
    });
    document.getElementById("btn-pause").addEventListener("click", () => {
      audio.resume();
      game.pause();
      syncScreens();
    });
    ui.mute.addEventListener("click", () => {
      audio.resume();
      muted = !muted;
      game.setMuted(muted);
      syncMute();
    });

    const steerPointers = new Map();
    const shootPointers = new Set();

    function updateSteer() {
      const first = steerPointers.values().next().value;
      if (!first) game.setPointer(0, 0, false);
      else game.setPointer(first.x, first.y, true);
    }

    function rememberSteer(event) {
      steerPointers.set(event.pointerId, pointerToView(event));
      updateSteer();
    }

    canvas.addEventListener("pointerdown", (event) => {
      const point = pointerToView(event);
      const view = config();
      if (point.x > view.VIEW_W - 120 && point.y > view.VIEW_H - 130) {
        event.preventDefault();
        audio.resume();
        game.armShot();
        return;
      }
      event.preventDefault();
      audio.resume();
      canvas.setPointerCapture(event.pointerId);
      rememberSteer(event);
    }, { passive: false });
    canvas.addEventListener("pointermove", (event) => {
      if (!steerPointers.has(event.pointerId)) return;
      rememberSteer(event);
    });
    function releaseSteer(event) {
      steerPointers.delete(event.pointerId);
      updateSteer();
    }
    canvas.addEventListener("pointerup", releaseSteer);
    canvas.addEventListener("pointercancel", releaseSteer);

    function setShoot(event, down) {
      event.preventDefault();
      event.stopPropagation();
      audio.resume();
      if (down) {
        shootPointers.add(event.pointerId);
        game.armShot();
      } else shootPointers.delete(event.pointerId);
      game.shootHeld = shootPointers.size > 0;
    }
    ui.shoot.addEventListener("pointerdown", (event) => setShoot(event, true));
    ui.shoot.addEventListener("pointerup", (event) => setShoot(event, false));
    ui.shoot.addEventListener("pointercancel", (event) => setShoot(event, false));
    ui.shoot.addEventListener("mousedown", (event) => {
      event.preventDefault();
      game.armShot();
      game.shootHeld = true;
    });
    ui.shoot.addEventListener("click", () => game.armShot());
    ui.shoot.addEventListener("mouseup", () => {
      game.shootHeld = shootPointers.size > 0;
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", " ", "escape"].includes(event.key.toLowerCase()) || event.code === "Space") {
        event.preventDefault();
      }
      if (event.key === "ArrowLeft" || key === "q" || key === "a") game.keys.left = true;
      if (event.key === "ArrowRight" || key === "d") game.keys.right = true;
      const shootDown = event.code === "Space" || event.code === "KeyZ" || event.code === "KeyW" || event.code === "KeyX" || key === " " || key === "spacebar" || key === "z" || key === "w" || key === "x" || event.key === "ArrowUp";
      if (shootDown) {
        game.keys.shoot = true;
        game.armShot();
      }
      if (event.key === "Escape") {
        game.pause();
        syncScreens();
      }
      if (key === "m") {
        muted = !muted;
        game.setMuted(muted);
        syncMute();
      }
      if (event.key === "Enter") {
        if (game.mode === "menu" || game.mode === "over") startGame();
        else if (game.mode === "pause") {
          game.mode = "play";
          syncScreens();
        }
      }
      audio.resume();
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (event.key === "ArrowLeft" || key === "q" || key === "a") game.keys.left = false;
      if (event.key === "ArrowRight" || key === "d") game.keys.right = false;
      if (event.code === "Space" || event.code === "KeyZ" || event.code === "KeyW" || event.code === "KeyX" || key === " " || key === "spacebar" || key === "z" || key === "w" || key === "x" || event.key === "ArrowUp") game.keys.shoot = false;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && game.mode === "play") {
        game.mode = "pause";
        syncScreens();
      }
    });

    window.addEventListener("resize", resize);
    resize();

    let last = performance.now();
    let acc = 0;
    const frame = 1000 / 60;

    function loop(now) {
      resize();
      acc += Math.min(48, now - last);
      last = now;
      while (acc >= frame) {
        game.update();
        acc -= frame;
      }
      game.draw();
      syncScreens();
      requestAnimationFrame(loop);
    }

    syncScreens();
    requestAnimationFrame(loop);
  });
})();
