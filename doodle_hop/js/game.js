// Orchestration : entrées, audio, états d'écran.
(function (root) {
  const STORAGE_BEST = "doodlehop-best";
  const STORAGE_MUTED = "doodlehop-muted";

  function readNumber(key) {
    try {
      const value = localStorage.getItem(key);
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    } catch (error) {
      return 0;
    }
  }

  function writeValue(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      // Navigation privée : le jeu continue sans sauvegarde.
    }
  }

  function Game(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audio = audio;
    this.mode = "menu";
    this.world = null;
    this.menuTime = 0;
    this.deathAnim = 0;
    this.best = readNumber(STORAGE_BEST);
    this.newRecord = false;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.keys = { left: false, right: false, shoot: false };
    this.pointer = { down: false, x: 0, y: 0 };
    this.shootHeld = false;
    this.shootQueued = false;
    this.shootBurst = 0;
  }

  Game.prototype.start = function () {
    this.audio.resume();
    this.world = root.DoodlePhysics.createWorld(Math.random);
    this.mode = "play";
    this.deathAnim = 0;
    this.newRecord = false;
    this.keys.shoot = false;
    this.shootQueued = false;
    this.shootBurst = 0;
  };

  Game.prototype.pause = function () {
    if (this.mode === "play") this.mode = "pause";
    else if (this.mode === "pause") this.mode = "play";
  };

  Game.prototype.readInput = function () {
    const config = root.DoodlePhysics.CONFIG;
    let left = this.keys.left;
    let right = this.keys.right;
    let power = 1;
    if (!left && !right && this.pointer.down && (this.mode === "play" || this.mode === "dying")) {
      const dx = this.pointer.x - config.VIEW_W / 2;
      if (dx < -16) left = true;
      if (dx > 16) right = true;
      power = root.DoodlePhysics.clamp(Math.abs(dx) / (config.VIEW_W * 0.42), 0.35, 1);
    }
    const shoot = this.keys.shoot || this.shootHeld || this.shootQueued;
    return { left, right, shoot, power };
  };

  Game.prototype.rememberBest = function () {
    if (!this.world) return;
    if (this.world.score > this.best) {
      this.best = this.world.score;
      this.newRecord = true;
      writeValue(STORAGE_BEST, this.best);
    }
  };

  Game.prototype.armShot = function () {
    this.shootQueued = true;
    this.shootBurst = Math.max(this.shootBurst, 36);
  };

  Game.prototype.update = function () {
    this.menuTime++;
    if (this.mode !== "play" && this.mode !== "dying") return;
    if (this.shootBurst > 0) {
      this.shootQueued = true;
      this.shootBurst--;
    }
    const events = root.DoodlePhysics.step(this.world, this.readInput());
    if (!this.keys.shoot && !this.shootHeld && this.shootBurst <= 0) this.shootQueued = false;
    for (let i = 0; i < events.length; i++) this.audio.play(events[i]);
    if (this.mode === "play" && !this.world.alive) {
      this.mode = "dying";
      this.deathAnim = 52;
      this.rememberBest();
      if (navigator.vibrate) navigator.vibrate(40);
    }
    if (this.mode === "dying") {
      this.deathAnim--;
      if (this.deathAnim <= 0) this.mode = "over";
    }
  };

  Game.prototype.draw = function () {
    const config = root.DoodlePhysics.CONFIG;
    const ctx = this.ctx;
    ctx.setTransform(this.canvas.width / config.VIEW_W, 0, 0, this.canvas.height / config.VIEW_H, 0, 0);
    ctx.clearRect(0, 0, config.VIEW_W, config.VIEW_H);
    if (this.mode === "menu" || !this.world) {
      root.DoodleDraw.drawMenu(ctx, this.menuTime);
    } else {
      root.DoodleDraw.drawWorld(ctx, this.world, { reduceMotion: this.reduceMotion });
    }
  };

  Game.prototype.score = function () {
    return this.world ? this.world.score : 0;
  };

  Game.prototype.deathMessage = function () {
    if (!this.world) return "";
    if (this.world.deathReason === "monster") return "Une bestiole t'a croqué.";
    return "Tu es tombé du cahier.";
  };

  Game.prototype.setPointer = function (x, y, down) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.down = down;
  };

  Game.prototype.setMuted = function (muted) {
    this.audio.setMuted(muted);
    writeValue(STORAGE_MUTED, muted ? 1 : 0);
  };

  Game.prototype.loadMute = function () {
    return readNumber(STORAGE_MUTED) === 1;
  };

  root.DoodleGame = Game;
})(typeof globalThis !== "undefined" ? globalThis : this);
