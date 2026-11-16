// THE GARAGE's sound: the recorded kit (data/drums/), a take chosen by how hard and where you hit, played the instant the stick lands
const HEADS = { snare: 1, tom1: 1, tom2: 1, floor: 1 };
// how loud each piece sits in the room, and how low a rim knock sounds on its shell
const MIX = { kick: 1.05, snare: 1, stick: 1, tom1: 1, tom2: 1, floor: 1, hatc: 0.85, hato: 0.8, crash1: 0.8, crash2: 0.8, ride: 0.8, bell: 0.8 };
const RIM = { snare: 1, tom1: 0.86, tom2: 0.78, floor: 0.62 };
const POLY = 7;

export class Sound {
  constructor(base = '/drums-assets/') {
    this.base = base;
    this.ctx = null;
    this.kit = null;
    this.ready = false;
    this.loaded = 0;
    this.hat = 0; // 0 closed .. 1 open
    this.voices = {};
    this.last = {};
    this.stats = { hits: 0, last: null };
    this.offset = 0; // seconds a hit is asked to sound ahead of now (0: the next audio block)
  }

  // the context must be made inside a tap or key press; 'interactive' asks the device for its shortest buffer
  start() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC({ latencyHint: 'interactive' });
    const c = this.ctx;
    this.out = c.createGain();
    this.out.gain.value = 0.9;
    // a soft ceiling instead of a compressor: a compressor looks ahead, and that is delay
    const clip = c.createWaveShaper(), curve = new Float32Array(1025);
    for (let i = 0; i < 1025; i++) { const x = (i - 512) / 512 * 1.6; curve[i] = Math.tanh(x * 1.1) / Math.tanh(1.76) * (Math.abs(x) < 0.5 ? 1 : 1); }
    for (let i = 0; i < 1025; i++) { const x = (i - 512) / 512 * 1.6, a = Math.abs(x); curve[i] = a < 0.6 ? x : Math.sign(x) * (0.6 + 0.4 * Math.tanh((a - 0.6) / 0.4)); }
    clip.curve = curve;
    const pre = c.createGain(); pre.gain.value = 1 / 1.6;
    const post = c.createGain(); post.gain.value = 1.6;
    this.out.connect(pre).connect(clip).connect(post).connect(c.destination);
    this.room = c.createConvolver();
    this.room.buffer = this._roomIR();
    this.send = c.createGain();
    this.send.gain.value = 0.16;
    this.send.connect(this.room).connect(this.out);
    this.bus = c.createGain();
    this.bus.connect(this.out);
    this.bus.connect(this.send);
    this.clickBuf = this._stickBuf();
    c.resume?.();
  }

  get latency() { const c = this.ctx; return c ? (c.baseLatency || 0) + (c.outputLatency || 0) : 0; }

  // a small wood live room: a few first echoes off the floor, glass and walls, then a short tail that darkens as it dies
  _roomIR() {
    const c = this.ctx, sr = c.sampleRate, n = Math.floor(sr * 0.7), b = c.createBuffer(2, n, sr);
    let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch); let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr, k = Math.min(1, 0.16 + t * 9);
        lp += (rnd() - lp) * Math.max(0.12, 0.75 - t * 1.1);
        d[i] = lp * Math.exp(-t / 0.11) * k * 0.5;
      }
      for (const [ms, g] of ch ? [[4.1, 0.5], [9.7, 0.36], [14.9, 0.3], [23.1, 0.22], [31.3, 0.16]] : [[3.6, 0.5], [8.3, 0.38], [16.4, 0.28], [21.2, 0.24], [34.8, 0.15]]) {
        const i = Math.floor(ms / 1000 * sr); d[i] += g; d[i + 1] -= g * 0.4;
      }
    }
    return b;
  }

  // two sticks knocked together: hickory's own few ringing notes and the knock
  _stickBuf() {
    const c = this.ctx, sr = c.sampleRate, n = Math.floor(sr * 0.09), b = c.createBuffer(1, n, sr), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      d[i] = (Math.sin(t * 6.283 * 1840) * Math.exp(-t * 70) + 0.6 * Math.sin(t * 6.283 * 3320) * Math.exp(-t * 110) + 0.35 * Math.sin(t * 6.283 * 5470) * Math.exp(-t * 160)
        + (Math.random() * 2 - 1) * Math.exp(-t * 900) * 0.8) * 0.5;
    }
    return b;
  }

  async load(onProgress) {
    const c = this.ctx, kit = await (await fetch(this.base + 'kit.json')).json(), keys = Object.keys(kit.pieces);
    let done = 0;
    await Promise.all(keys.map(async (k) => {
      const raw = await (await fetch(this.base + k + '.mp3')).arrayBuffer();
      const buf = await new Promise((res, rej) => { const p = c.decodeAudioData(raw, res, rej); if (p && p.catch) p.catch(rej); });
      // where the bake's click really landed in what was decoded
      const d = buf.getChannelData(0), end = Math.min(d.length, Math.floor(buf.sampleRate * 0.075));
      let at = 0, top = 0;
      for (let i = 0; i < end; i++) { const a = Math.abs(d[i]); if (a > top) { top = a; at = i; } }
      const P = kit.pieces[k];
      P.buf = buf;
      P.shift = top > 0.05 ? at / buf.sampleRate - kit.click : 0;
      this.voices[k] = [];
      this.loaded = ++done / keys.length;
      onProgress?.(this.loaded);
    }));
    this.kit = kit;
    this.credit = kit.credit;
    this.ready = true;
  }

  // which take: its place in the piece's soft-to-loud run follows the hit's strength; one of its neighbours, never the last one again
  _take(key, vel) {
    const P = this.kit.pieces[key], S = P.s, n = S.length, pos = Math.pow(Math.min(1, Math.max(0, vel)), 0.85) * (n - 1);
    let i = Math.round(pos + (Math.random() - 0.5) * Math.min(2.2, n / 6));
    i = Math.max(0, Math.min(n - 1, i));
    if (i === this.last[key] && n > 1) i = i + 1 < n ? i + 1 : i - 1;
    this.last[key] = i;
    const a = Math.floor(pos), f = pos - a, want = S[a][2] + (S[Math.min(n - 1, a + 1)][2] - S[a][2]) * f;
    return { P, s: S[i], gain: Math.min(2.2, Math.max(0.45, want / S[i][2])) };
  }

  _play(key, vel, o = {}) {
    const c = this.ctx, { P, s, gain } = this._take(key, vel), t = c.currentTime + this.offset;
    const src = c.createBufferSource();
    src.buffer = P.buf;
    src.playbackRate.value = (o.rate || 1) * (1 + (Math.random() - 0.5) * 0.006);
    const g = c.createGain(), level = gain * (MIX[key] || 1) * (o.gain ?? 1);
    g.gain.value = level;
    let node = src;
    for (const f of o.filters || []) {
      const b = c.createBiquadFilter();
      b.type = f[0]; b.frequency.value = f[1]; if (f[2] !== undefined) b.gain.value = f[2]; if (f[3] !== undefined) b.Q.value = f[3];
      node.connect(b); node = b;
    }
    node.connect(g).connect(o.dry ? this.out : this.bus);
    const skip = o.skip || 0, dur = s[1] - skip;
    if (o.decay) { g.gain.setValueAtTime(level, t); g.gain.setTargetAtTime(0, t + 0.012, o.decay); }
    src.start(t, Math.max(0, s[0] + P.shift + skip), dur);
    const v = { src, g, t, end: t + dur / src.playbackRate.value };
    const list = this.voices[o.group || key];
    list.push(v);
    src.onended = () => { const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); g.disconnect(); };
    if (list.length > POLY) this._fade(list[0], 0.03);
    return v;
  }

  _fade(v, tc) {
    if (v.dead) return;
    v.dead = true;
    const t = this.ctx.currentTime;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setTargetAtTime(0, t, tc);
    try { v.src.stop(t + tc * 6); } catch (e) { /* already stopped */ }
  }

  // a cymbal grabbed, or the hi-hat shut on itself
  choke(piece, tc = 0.03) {
    const keys = piece === 'hat' ? ['hato'] : piece === 'ride' ? ['ride', 'bell'] : [piece];
    for (const k of keys) for (const v of [...(this.voices[k] || [])]) this._fade(v, tc);
  }

  // the hi-hat's pedal: 0 shut .. 1 open. Shutting it chokes what rings and gives the pedal's own chick.
  setHat(open, speed = 0) {
    const was = this.hat;
    this.hat = Math.min(1, Math.max(0, open));
    if (!this.ready) return;
    if (was > 0.12 && this.hat <= 0.12) {
      this.choke('hat', 0.012);
      this._play('hatc', Math.min(0.5, 0.12 + speed * 0.05), { gain: 0.7, filters: [['highpass', 380]] });
      this.stats.hits++; this.stats.last = { piece: 'hat', zone: 'pedal', vel: 0.2 };
    }
  }

  // piece: kick snare tom1 tom2 floor hat crash1 crash2 ride. zone: head rimshot cross rim | bell bow edge. r: 0 the middle .. 1 the edge.
  hit(piece, vel, zone = 'head', r = 0.3) {
    if (!this.ready) return;
    vel = Math.min(1, Math.max(0.02, vel));
    this.stats.hits++;
    this.stats.last = { piece, zone, vel, r };
    if (piece === 'kick') {
      this._play('kick', vel);
      this._wires(vel * 0.5);
    } else if (HEADS[piece]) {
      if (zone === 'cross' || zone === 'rim') {
        const k = RIM[piece];
        this._play('stick', vel, { rate: k, gain: zone === 'rim' ? 0.55 : 1, filters: zone === 'rim' ? [['highpass', 420 * k]] : [] });
      } else {
        // off the middle a head loses its thump and rings: less low end, a little more top
        const e = r * r, f = [];
        if (e > 0.08) f.push(['lowshelf', piece === 'snare' ? 240 : 150, -9 * e], ['peaking', piece === 'snare' ? 950 : 520, 4 * e, 1.2]);
        if (zone === 'rimshot') {
          this._play(piece, Math.min(1, vel * 1.1 + 0.08), { filters: [['highshelf', 3500, 3]], gain: 1.12 });
          this._play('stick', Math.min(1, vel + 0.1), { rate: RIM[piece] * 1.04, gain: 0.8 });
        } else this._play(piece, vel, { filters: f, gain: 1 - 0.22 * e });
        if (piece !== 'snare') this._wires(vel * 0.35);
      }
    } else if (piece === 'hat') {
      const o = this.hat, edge = zone === 'edge', g = edge ? 1.08 : zone === 'bell' ? 0.7 : 0.95;
      const f = zone === 'bell' ? [['highpass', 1500]] : edge ? [] : [['highshelf', 6000, -1.5]];
      if (o <= 0.12) { this.choke('hat', 0.01); this._play('hatc', vel, { gain: g, filters: f }); }
      else if (o >= 0.8) this._play('hato', vel, { gain: g, filters: f });
      else {
        // part open: the open hat's sound, dying sooner the nearer the cymbals are, over the closed hat's tick
        this.choke('hat', 0.02);
        this._play('hato', vel, { gain: g * (0.75 + 0.25 * o), filters: f, decay: 0.045 + o * o * 0.5 });
        this._play('hatc', vel, { gain: g * (1 - o) * 0.8, filters: f });
      }
    } else {
      const ride = piece === 'ride';
      if (zone === 'bell') {
        if (ride) this._play('bell', vel);
        else this._play(piece, vel * 0.6, { gain: 0.8, filters: [['highpass', 1100], ['peaking', 3200, 5, 2]], decay: 1.4 });
      } else if (zone === 'edge') {
        if (ride) this._play('ride', Math.min(1, vel * 1.15 + 0.2), { gain: 1.15, filters: [['lowshelf', 500, 4]] });
        else this._play(piece, vel);
      } else if (ride) this._play('ride', vel * 0.85, { filters: [['highshelf', 5000, 1.5]] });
      else this._play(piece, vel * 0.55, { gain: 0.85, filters: [['highpass', 300]] });
    }
  }

  // the snare's wires answering a drum struck beside them: the snare's own softest ring, without its attack
  _wires(v) {
    if (v < 0.12) return;
    this._play('snare', 0.05, { skip: 0.035, gain: Math.min(0.5, v * 0.45), filters: [['highpass', 1800]], group: 'stick', decay: 0.12 });
  }

  click(vel) {
    if (!this.ctx) return;
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = this.clickBuf;
    s.playbackRate.value = 0.96 + Math.random() * 0.08;
    g.gain.value = Math.min(1, 0.15 + vel * 0.7);
    s.connect(g).connect(this.bus);
    s.start();
    this.stats.hits++; this.stats.last = { piece: 'sticks', zone: 'click', vel };
  }

  // the metronome's tick at an exact time on the audio clock
  tick(when, accent) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.value = accent ? 1760 : 1320;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(accent ? 0.3 : 0.2, when + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0005, when + 0.05);
    o.connect(g).connect(this.out);
    o.start(when);
    o.stop(when + 0.06);
  }
}
