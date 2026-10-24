// Sons synthétiques, sans fichiers externes.
(function (root) {
  function AudioManager() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.ready = false;
  }

  AudioManager.prototype.ensure = function () {
    if (this.ready) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.22;
    this.master.connect(this.ctx.destination);
    this.ready = true;
  };

  AudioManager.prototype.resume = function () {
    this.ensure();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  };

  AudioManager.prototype.setMuted = function (muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.22;
  };

  AudioManager.prototype.tone = function (freq, dur, type, gain, slide) {
    if (!this.ready || this.muted) return;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), this.ctx.currentTime + dur);
    amp.gain.setValueAtTime(gain || 0.8, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + dur + 0.02);
  };

  AudioManager.prototype.noise = function (dur, gain) {
    if (!this.ready || this.muted) return;
    const length = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    const amp = this.ctx.createGain();
    amp.gain.value = gain || 0.4;
    src.connect(filter);
    filter.connect(amp);
    amp.connect(this.master);
    src.start();
  };

  AudioManager.prototype.play = function (event) {
    if (event === "jump") this.tone(520, 0.07, "sine", 0.5, 760);
    else if (event === "spring") {
      this.tone(420, 0.08, "triangle", 0.6, 680);
      this.tone(760, 0.12, "sine", 0.45, 1100);
    } else if (event === "break") this.noise(0.12, 0.55);
    else if (event === "shoot") this.tone(880, 0.06, "square", 0.18, 420);
    else if (event === "monster") this.tone(320, 0.12, "triangle", 0.55, 90);
    else if (event === "jetpack") {
      this.tone(180, 0.18, "sawtooth", 0.25, 90);
      this.tone(660, 0.1, "square", 0.15, 990);
    } else if (event === "propeller") this.tone(540, 0.14, "triangle", 0.4, 880);
    else if (event === "milestone") {
      this.tone(523, 0.1, "sine", 0.4);
      setTimeout(() => this.tone(659, 0.1, "sine", 0.4), 90);
      setTimeout(() => this.tone(784, 0.16, "sine", 0.45), 180);
    } else if (event === "die") {
      this.tone(440, 0.16, "sawtooth", 0.3, 220);
      setTimeout(() => this.tone(220, 0.28, "triangle", 0.4, 80), 140);
    }
  };

  root.DoodleAudio = AudioManager;
})(typeof globalThis !== "undefined" ? globalThis : this);
