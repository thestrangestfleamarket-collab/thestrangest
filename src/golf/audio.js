// All sound is synthesised with WebAudio — no asset files.
export class GameAudio {
  constructor() { this.ctx = null; this.vol = { master: 0.8, ambience: 0.6, music: 0.3 }; this.kind = null; this.nextBird = 2; this.nextNote = 1; this.nextCricket = 0; }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = this.ctx = new C();
    this.master = ctx.createGain(); this.master.connect(ctx.destination);
    this.sfx = ctx.createGain(); this.sfx.connect(this.master);
    this.amb = ctx.createGain(); this.amb.connect(this.master);
    this.mus = ctx.createGain();
    const delay = ctx.createDelay(1); delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.45;
    this.mus.connect(this.master); this.mus.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(this.master);
    const len = ctx.sampleRate * 2; this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolumes();
    if (this.kind) { const k = this.kind; this.kind = null; this.setAmbience(k); }
  }
  applyVolumes() {
    if (!this.ctx) return;
    this.master.gain.value = this.vol.master; this.amb.gain.value = this.vol.ambience; this.mus.gain.value = this.vol.music * 0.5;
  }

  _tone(freq, dur, gain, { type = 'sine', to = null, dest = null, delay = 0 } = {}) {
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.02);
  }
  _noise(dur, gain, freq, q = 1, { type = 'bandpass', delay = 0, to = null } = {}) {
    const c = this.ctx, t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }

  putt(v) { if (!this.ctx) return; const g = Math.min(1, 0.15 + v / 6);
    this._noise(0.035, g * 0.7, 2600, 1.2); this._tone(950, 0.05, g * 0.35, { to: 500 }); this._tone(190, 0.09, g * 0.5, { to: 90 }); }
  knock(v, kind) {
    if (!this.ctx) return; const g = Math.min(1, v / 4);
    if (kind === 'bumper') { this._tone(520, 0.16, 0.35, { to: 1150, type: 'triangle' }); this._tone(1560, 0.1, 0.12); }
    else if (kind === 'ground') { this._tone(140, 0.08, g * 0.5, { to: 70 }); this._noise(0.03, g * 0.2, 900); }
    else if (kind === 'cup') { this._noise(0.04, g * 0.5 + 0.1, 1400, 3); this._tone(620, 0.06, g * 0.2 + 0.05); }
    else { this._tone(kind === 'obstacle' ? 310 : 430, 0.07, g * 0.5 + 0.03, { to: 240, type: 'triangle' }); this._noise(0.025, g * 0.45, 1900, 1.5); }
  }
  cupDrop() { if (!this.ctx) return;
    for (let i = 0; i < 5; i++) { this._noise(0.05, 0.4 / (i + 1), 1100 + i * 90, 4, { delay: i * 0.075 + i * i * 0.004 }); this._tone(540 - i * 20, 0.05, 0.2 / (i + 1), { delay: i * 0.075 }); } }
  splash() { if (!this.ctx) return; this._noise(0.7, 0.6, 2400, 0.6, { type: 'lowpass', to: 300 }); this._tone(240, 0.25, 0.25, { to: 60 }); }
  click() { if (!this.ctx) return; this._tone(880, 0.04, 0.12, { type: 'triangle' }); }
  whoosh() { if (!this.ctx) return; this._noise(0.25, 0.18, 500, 0.8, { to: 2400 }); }
  bell(freq, gain = 0.25, delay = 0, dest = null) {
    this._tone(freq, 1.6, gain, { delay, dest }); this._tone(freq * 2.76, 0.7, gain * 0.25, { delay, dest }); this._tone(freq * 5.4, 0.3, gain * 0.1, { delay, dest });
  }
  result(diff, ace) { // diff = strokes - par
    if (!this.ctx) return;
    const seq = ace ? [523, 659, 784, 1047, 1319, 1568] : diff < 0 ? [523, 659, 784, 1047] : diff === 0 ? [523, 659, 784] : diff === 1 ? [440, 523] : [330, 294];
    seq.forEach((f, i) => this.bell(f, 0.22, 0.25 + i * 0.13));
  }

  setAmbience(kind) {
    if (kind === this.kind) return; this.kind = kind;
    if (!this.ctx) return;
    if (this.ambNodes) this.ambNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch { } });
    const c = this.ctx, nodes = this.ambNodes = [];
    const layer = (type, freq, q, gain, lfoHz, depth) => {
      const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = gain;
      const l = c.createOscillator(); l.frequency.value = lfoHz; const lg = c.createGain(); lg.gain.value = depth;
      l.connect(lg); lg.connect(g.gain); s.connect(f); f.connect(g); g.connect(this.amb); s.start(); l.start();
      nodes.push(s, l, g);
    };
    if (kind === 'sea') { layer('lowpass', 520, 0.3, 0.16, 0.11, 0.11); layer('bandpass', 1900, 0.5, 0.03, 0.17, 0.025); }
    else if (kind === 'alpine') { layer('bandpass', 380, 0.6, 0.09, 0.07, 0.05); layer('highpass', 3000, 0.3, 0.012, 0.13, 0.008); }
    else { layer('lowpass', 260, 0.4, 0.1, 0.05, 0.05); }
  }

  update(dt) {
    if (!this.ctx || !this.kind) return;
    if ((this.nextBird -= dt) < 0 && this.kind !== 'night') {
      this.nextBird = 2 + Math.random() * (this.kind === 'alpine' ? 5 : 9);
      const f = 2200 + Math.random() * 1800, n = 2 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) this._tone(f, 0.09, 0.035, { to: f * (1.2 + Math.random() * 0.4), delay: i * 0.14, dest: this.amb });
    }
    if ((this.nextCricket -= dt) < 0 && this.kind !== 'alpine') {
      this.nextCricket = 0.75 + Math.random() * 0.3;
      for (let i = 0; i < 4; i++) this._tone(4300, 0.03, this.kind === 'night' ? 0.03 : 0.012, { delay: i * 0.055, dest: this.amb });
    }
    if ((this.nextNote -= dt) < 0 && this.vol.music > 0.01) {
      this.nextNote = 1.6 + Math.random() * 2.6;
      const scale = this.kind === 'night' ? [220, 261.6, 293.7, 329.6, 392, 440, 523.3] : [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
      const f = scale[Math.random() * scale.length | 0];
      this.bell(f, 0.16, 0, this.mus);
      if (Math.random() < 0.4) this.bell(f * 1.5, 0.09, 0.3, this.mus);
      this._tone(f / 2, 3.5, 0.07, { dest: this.mus });
    }
  }
}
