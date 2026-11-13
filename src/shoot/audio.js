// Fully synthesised spatial audio (WebAudio, HRTF panning, per-map convolution reverb).
export class AudioSys {
  constructor() {
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.2;
    this.master.connect(comp); comp.connect(c.destination);
    this.reverb = c.createConvolver(); this.revGain = c.createGain(); this.revGain.gain.value = 0.35;
    this.reverb.connect(this.revGain); this.revGain.connect(this.master);
    this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.setReverb(1.5);
    this.amb = null;
  }
  resume() { if (this.ctx.state !== 'running') this.ctx.resume(); }
  setReverb(seconds) {
    const c = this.ctx, len = Math.floor(c.sampleRate * seconds), b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * (i < 400 ? i / 400 : 1); }
    this.reverb.buffer = b;
  }
  listener(pos, fwd, up) {
    const l = this.ctx.listener;
    if (l.positionX) { l.positionX.value = pos.x; l.positionY.value = pos.y; l.positionZ.value = pos.z; l.forwardX.value = fwd.x; l.forwardY.value = fwd.y; l.forwardZ.value = fwd.z; l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z; }
    else { l.setPosition(pos.x, pos.y, pos.z); l.setOrientation(fwd.x, fwd.y, fwd.z, up.x, up.y, up.z); }
  }
  // output node for a one-shot at world position (null = non-spatial)
  out(pos, vol = 1, wet = 0.5, ref = 2.5) {
    const c = this.ctx, g = c.createGain(); g.gain.value = vol;
    let last = g;
    if (pos) {
      const p = c.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = 1.2; p.maxDistance = 100;
      p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
      g.connect(p); last = p;
    }
    last.connect(this.master);
    if (wet > 0) { const w = c.createGain(); w.gain.value = wet; last.connect(w); w.connect(this.reverb); }
    return g;
  }
  nz(dest, { type = 'lowpass', f0 = 2000, f1 = f0, q = 0.7, a = 0.002, dur = 0.2, vol = 1, delay = 0, rate = 1 }) {
    const c = this.ctx, t = c.currentTime + delay, s = c.createBufferSource(); s.buffer = this.noise; s.loop = true; s.playbackRate.value = rate;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  tone(dest, { wave = 'sine', f0 = 200, f1 = f0, a = 0.002, dur = 0.2, vol = 1, delay = 0 }) {
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(); o.type = wave;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  shot(kind, pos) {
    const o = this.out(pos, 1, 0.7, 6);
    if (kind === 'pistol') { this.nz(o, { f0: 6000, f1: 700, dur: 0.16, vol: 1.1 }); this.nz(o, { type: 'bandpass', f0: 1800, f1: 900, q: 1.2, dur: 0.07, vol: 0.9 }); this.tone(o, { f0: 190, f1: 55, dur: 0.11, vol: 0.9 }); }
    else if (kind === 'rifle') { this.nz(o, { f0: 9000, f1: 500, dur: 0.2, vol: 1.2 }); this.nz(o, { type: 'bandpass', f0: 2600, f1: 1200, q: 1.5, dur: 0.05, vol: 1 }); this.tone(o, { f0: 150, f1: 45, dur: 0.13, vol: 1.1 }); this.nz(o, { f0: 900, f1: 200, dur: 0.5, vol: 0.2 }); }
    else { this.nz(o, { f0: 5000, f1: 250, dur: 0.38, vol: 1.4 }); this.tone(o, { f0: 120, f1: 32, dur: 0.24, vol: 1.4 }); this.nz(o, { f0: 600, f1: 120, dur: 0.8, vol: 0.3 }); }
  }
  click(pos, pitch = 1, vol = 0.5) {
    const o = this.out(pos, vol, 0.15, 1);
    this.nz(o, { type: 'bandpass', f0: 3200 * pitch, f1: 1800 * pitch, q: 4, dur: 0.035, vol: 1 });
    this.tone(o, { wave: 'square', f0: 900 * pitch, f1: 500 * pitch, dur: 0.02, vol: 0.25 });
  }
  rack(pos) { this.click(pos, 0.7, 0.7); const o = this.out(pos, 0.5, 0.15, 1); this.nz(o, { type: 'bandpass', f0: 1500, f1: 2600, q: 2, dur: 0.07, vol: 0.8, delay: 0.02 }); }
  dry(pos) { this.click(pos, 1.6, 0.35); }
  step(pos, vol = 0.25) { const o = this.out(pos, vol, 0.3, 1.5); this.nz(o, { f0: 500 + Math.random() * 300, f1: 120, dur: 0.09, vol: 1 }); this.tone(o, { f0: 90, f1: 50, dur: 0.06, vol: 0.5 }); }
  impact(pos, surf) {
    const o = this.out(pos, 0.5, 0.4, 1.5);
    if (surf === 'metal') { this.tone(o, { wave: 'triangle', f0: 2200 + Math.random() * 1800, f1: 1800, dur: 0.18, vol: 0.5 }); this.nz(o, { type: 'bandpass', f0: 5000, f1: 3000, q: 3, dur: 0.05, vol: 1 }); }
    else if (surf === 'body') { this.nz(o, { f0: 900, f1: 200, dur: 0.09, vol: 1.2 }); this.tone(o, { f0: 140, f1: 60, dur: 0.08, vol: 0.8 }); }
    else { this.nz(o, { f0: 3500, f1: 400, dur: 0.1, vol: 1 }); this.nz(o, { type: 'bandpass', f0: 1200, q: 2, dur: 0.18, vol: 0.3, delay: 0.03 }); }
  }
  casing(pos) { const o = this.out(pos, 0.12, 0.3, 1); for (let i = 0; i < 2; i++) this.tone(o, { wave: 'triangle', f0: 5200 + Math.random() * 1500, dur: 0.05, vol: 1, delay: i * 0.07 }); }
  whiz(pos) { const o = this.out(pos, 0.5, 0.2, 1); this.nz(o, { type: 'bandpass', f0: 3800, f1: 900, q: 6, a: 0.03, dur: 0.22, vol: 1 }); }
  explode(pos) {
    const o = this.out(pos, 1.6, 0.9, 8);
    this.nz(o, { f0: 4000, f1: 60, dur: 1.4, vol: 1.6 }); this.tone(o, { f0: 90, f1: 22, dur: 0.9, vol: 1.6 }); this.nz(o, { type: 'bandpass', f0: 400, f1: 80, q: 0.8, dur: 2.2, vol: 0.5, delay: 0.1 });
  }
  hurt() { const o = this.out(null, 0.7, 0); this.nz(o, { f0: 700, f1: 120, dur: 0.16, vol: 1 }); this.tone(o, { f0: 110, f1: 48, dur: 0.2, vol: 1 }); }
  hitmark(head) { const o = this.out(null, 0.35, 0); this.tone(o, { wave: 'triangle', f0: head ? 2400 : 1500, dur: 0.06, vol: 1 }); if (head) this.tone(o, { wave: 'triangle', f0: 3200, dur: 0.09, vol: 0.8, delay: 0.05 }); }
  beep(f = 880, dur = 0.12, vol = 0.3) { const o = this.out(null, vol, 0.2); this.tone(o, { wave: 'square', f0: f, dur, vol: 0.5 }); this.tone(o, { f0: f * 2, dur, vol: 0.4 }); }
  fanfare(win) { const n = win ? [523, 659, 784, 1047] : [392, 330, 262, 196]; n.forEach((f, i) => { const o = this.out(null, 0.3, 0.5); this.tone(o, { wave: 'sawtooth', f0: f, dur: 0.35, vol: 0.4, delay: i * 0.16 }); this.tone(o, { f0: f / 2, dur: 0.4, vol: 0.5, delay: i * 0.16 }); }); }
  pinBeep(pos) { const o = this.out(pos, 0.3, 0.1, 1); this.tone(o, { wave: 'square', f0: 2400, dur: 0.05, vol: 0.6 }); }

  ambience(kind) {
    const c = this.ctx;
    if (this.amb) { const old = this.amb; old.g.gain.linearRampToValueAtTime(0, c.currentTime + 1); setTimeout(() => old.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* not a source */ } }), 1200); this.amb = null; }
    if (!kind) return;
    const g = c.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(1, c.currentTime + 2);
    g.connect(this.master);
    const nodes = [];
    const layer = (type, freq, q, vol, lfoRate = 0, lfoDepth = 0) => {
      const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const v = c.createGain(); v.gain.value = vol;
      s.connect(f); f.connect(v); v.connect(g); s.start(0, Math.random()); nodes.push(s);
      if (lfoRate) { const l = c.createOscillator(); l.frequency.value = lfoRate; const lg = c.createGain(); lg.gain.value = lfoDepth; l.connect(lg); lg.connect(f.frequency); l.start(); nodes.push(l); }
    };
    const drone = (freq, vol, wave = 'sine') => { const o = c.createOscillator(); o.type = wave; o.frequency.value = freq; const v = c.createGain(); v.gain.value = vol; o.connect(v); v.connect(g); o.start(); nodes.push(o); };
    if (kind === 'station') { drone(48, 0.14); drone(96.7, 0.05); drone(144, 0.012, 'sawtooth'); layer('lowpass', 180, 0.5, 0.12); layer('bandpass', 2400, 8, 0.01, 0.07, 900); }
    if (kind === 'rain') { layer('highpass', 2500, 0.3, 0.07); layer('bandpass', 900, 0.5, 0.06, 0.13, 250); layer('lowpass', 120, 0.5, 0.2, 0.05, 40); drone(60, 0.02); }
    if (kind === 'wind') { layer('bandpass', 420, 1.2, 0.14, 0.09, 220); layer('bandpass', 900, 2.5, 0.04, 0.05, 400); layer('lowpass', 90, 0.5, 0.2); layer('bandpass', 3000, 1, 0.015, 3.1, 1500); }
    this.amb = { g, nodes };
  }
}
