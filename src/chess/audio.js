// Sound: recorded one-shots (CC0) plus synthesized whooshes, wind and reverb, all positioned in 3D.
const FILES = ['select', 'end', 'turn', 'win', 'lose', 'heal1', 'heal2', 'step0', 'step1', 'step2', 'step3', 'step4',
  'swing1', 'swing2', 'swing3', 'bow', 'drop', 'flesh0', 'flesh1', 'flesh2', 'armor0', 'armor1', 'armor2',
  'block0', 'block1', 'block2', 'thud0', 'thud1', 'fall0', 'fall1', 'boom0', 'boom1', 'rumble', 'snare0', 'snare1'];

export class Sound {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.refDistance = 14;
    this.muted = false;
    try { this.muted = localStorage.getItem('muted') === '1'; } catch { /* storage blocked */ }
  }

  // Must be called from a click/tap: browsers only allow audio to start on a user gesture.
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    this.master.connect(comp).connect(ctx.destination);
    // Reverb from a generated impulse: decaying, darkening stereo noise (a stone hall).
    const len = Math.floor(ctx.sampleRate * 1.8), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        lp += ((Math.random() * 2 - 1) - lp) * (0.6 - 0.5 * t);
        d[i] = lp * (1 - t) ** 3;
      }
    }
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    this.reverb.connect(wet).connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;
    for (const name of FILES) {
      fetch(`/chess-assets/sfx/${name}.mp3`).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b))
        .then(buf => { this.buffers[name] = buf; }).catch(() => {});
    }
    this.startWind();
    if (this.want) this.ambience(this.want);
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('muted', m ? '1' : '0'); } catch { /* storage blocked */ }
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  // Keep the listener at the viewer's head so sounds come from the board's real position.
  setListener(position, forward, up) {
    if (!this.ctx) return;
    const l = this.ctx.listener;
    if (l.positionX) {
      l.positionX.value = position.x; l.positionY.value = position.y; l.positionZ.value = position.z;
      l.forwardX.value = forward.x; l.forwardY.value = forward.y; l.forwardZ.value = forward.z;
      l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z;
    } else {
      l.setPosition(position.x, position.y, position.z);
      l.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  // Route a source through gain -> 3D panner -> master, with a reverb send.
  out(pos, vol, send = 0.35) {
    const ctx = this.ctx, g = ctx.createGain();
    g.gain.value = vol;
    let tail = g;
    if (pos) {
      const p = ctx.createPanner();
      p.panningModel = 'HRTF'; p.distanceModel = 'inverse';
      p.refDistance = this.refDistance; p.rolloffFactor = 1;
      p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
      g.connect(p);
      tail = p;
    }
    tail.connect(this.master);
    const s = ctx.createGain();
    s.gain.value = send;
    tail.connect(s).connect(this.reverb);
    return g;
  }

  // name may end in '*' to pick a random numbered variant, e.g. 'flesh*'.
  play(name, { pos = null, vol = 1, rate = 1, delay = 0, send } = {}) {
    if (!this.ctx) return;
    if (name.endsWith('*')) {
      const opts = Object.keys(this.buffers).filter(k => k.startsWith(name.slice(0, -1)));
      if (!opts.length) return;
      name = opts[Math.floor(Math.random() * opts.length)];
    }
    const buf = this.buffers[name];
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
    src.connect(this.out(pos, vol, send));
    src.start(this.ctx.currentTime + delay);
  }

  // Synthesized swoosh: band-passed noise with a pitch sweep.
  whoosh({ pos = null, dur = 0.35, from = 400, to = 2400, vol = 0.5, q = 1.2, delay = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1, t + dur * 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(env).connect(this.out(pos, vol));
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  // Quiet room tone: low rumbling wind that swells slowly, plus the odd fire crackle.
  startWind() {
    const ctx = this.ctx, src = ctx.createBufferSource();
    src.buffer = this.noise; src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 0.7;
    this.wind = ctx.createGain();
    this.wind.gain.value = 0.1;
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 0.07; depth.gain.value = 0.05;
    lfo.connect(depth).connect(this.wind.gain);
    src.connect(lp).connect(this.wind).connect(this.master);
    this.wind.connect(this.reverb);
    src.start(); lfo.start();
  }

  // The map's standing sounds, each at its place in the room (null: silent): a river (shaped noise), birds (a recording), leaves in the wind;
  // and the three worlds' own: a high wind (a recording) over a low one, lava (a recorded fire, slowed, over a rumble), a cavern's hollow air.
  // Called again whenever the board moves; quiet by design.
  ambience(want) {
    this.want = want;
    if (!this.ctx) return;
    const ctx = this.ctx, A = this.amb || (this.amb = {});
    const node = (name, vol, build) => {
      const pos = want[name];
      if (!A[name]) {
        if (!pos) return;
        const g = ctx.createGain(), p = ctx.createPanner();
        g.gain.value = 0; p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.rolloffFactor = 1;
        g.connect(p).connect(this.master);
        A[name] = { g, p };
        build(g);
      }
      const { g, p } = A[name];
      g.gain.setTargetAtTime(pos ? vol : 0, ctx.currentTime, 0.6);
      if (pos) { p.refDistance = this.refDistance; p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; }
    };
    const noise = (to, type, freq, q, lfoHz, depth) => {
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), d = ctx.createGain();
      src.buffer = this.noise; src.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.value = 1 - depth; lfo.frequency.value = lfoHz; d.gain.value = depth;
      lfo.connect(d).connect(g.gain); src.connect(f).connect(g).connect(to);
      src.start(0, Math.random()); lfo.start();
    };
    node('river', 0.16, g => { noise(g, 'bandpass', 900, 0.5, 0.11, 0.2); noise(g, 'lowpass', 300, 0.7, 0.07, 0.3); });
    node('leaves', 0.05, g => noise(g, 'highpass', 3200, 0.4, 0.09, 0.7));
    const loop = (g, file, rate = 1) => this.fetch(file).then(buf => { const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = rate; src.connect(g); src.start(); }).catch(() => {});
    node('birds', 0.3, g => loop(g, 'birds'));
    node('wind', 0.42, g => { loop(g, 'wind'); noise(g, 'lowpass', 220, 0.6, 0.05, 0.4); });
    node('lava', 0.3, g => { loop(g, 'fire', 0.6); noise(g, 'lowpass', 90, 0.8, 0.04, 0.3); });
    node('cave', 0.2, g => { noise(g, 'lowpass', 150, 0.9, 0.03, 0.35); noise(g, 'bandpass', 420, 4, 0.05, 0.6); });
    if (want.drips && !this.buffers.drip) this.fetch('drip').then(buf => { this.buffers.drip = buf; }).catch(() => {});
  }
  // a landscaped map's own recording (data/chess/land/snd/), fetched when first wanted
  fetch(name) { return fetch(`/chess-assets/land/snd/${name}.mp3`).then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b)); }
  // one drop falling somewhere in a cavern, with a long tail
  drip(pos) { if (this.ctx && this.ctx.state === 'running' && this.buffers.drip) this.play('drip', { pos, vol: 0.5, rate: 0.8 + Math.random() * 0.5, send: 1.3 }); }

  crackle(pos) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1800 + Math.random() * 3000;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.5 + Math.random() * 0.5, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
    src.connect(hp).connect(env).connect(this.out(pos, 0.12, 0.2));
    src.start(t, Math.random() * 1.5, 0.08);
  }
}
