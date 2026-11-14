// COLD BORE's sounds: real recordings (data/sniper/snd/, credits in docs/sniper-sounds.md) played through an open-air echo, the same sounds made in the page until they arrive
const SND = ['shot', 'shot_far', 'bolt_open', 'bolt_close', 'mag_out', 'mag_in', 'dry', 'ding', 'impact', 'crack', 'wind', 'city', 'sea', 'rain', 'heli', 'heart', 'radio', 'scream'];
// a game sound: its recording, level, speed, how much echo ('' = part of another recording)
const REC = { shot: ['shot', 1.5, 1, 0.5], dry: ['dry', 0.7], boltUp: [''], boltBack: ['bolt_open', 0.9], boltFwd: ['bolt_close', 0.9], boltDown: [''], magOut: ['mag_out', 0.9], magIn: ['mag_in', 0.9], ding: ['ding', 0.9, 1.45, 0.4], thud: ['impact', 1, 1, 0.3], report: ['shot_far', 1.2, 1, 0.4], crack: ['crack', 1.3, 1, 0.3], heart: ['heart', 1.2], radio: ['radio', 0.5], scream: ['scream', 1.6, 1, 0.5] };
export class AudioSys {
  constructor() { this.ctx = null; this.loops = {}; this.voice = true; this.raw = {}; this.buf = {}; }
  // the recordings: fetched at once, decoded when the sound may start
  load(base) { for (const n of SND) fetch(base + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).then((b) => { if (b) { this.raw[n] = b; this.decode(n); } }).catch(() => {}); }
  decode(n) { if (this.ctx && this.raw[n] && !this.buf[n]) { const b = this.raw[n]; delete this.raw[n]; this.ctx.decodeAudioData(b).then((d) => { this.buf[n] = d; }).catch(() => {}); } }
  sample(n, t, gain, rate = 1, wet = 0) { const c = this.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = this.buf[n]; s.playbackRate.value = rate; g.gain.value = gain; s.connect(g); g.connect(this.out); if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(this.verb); } s.start(t); }
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = this.ctx = new C(); this.out = c.createGain(); this.out.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; this.out.connect(comp); comp.connect(c.destination);
    const n = c.sampleRate * 2, buf = this.noiseBuf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    // the open air: a long thin tail with a few hard slaps off far walls
    const L = c.sampleRate * 2.6, ir = c.createBuffer(2, L, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const x = ir.getChannelData(ch); for (let i = 0; i < L; i++) { const t = i / c.sampleRate; x[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2.4) * 0.5; }
      for (const [t, a] of [[0.31, 0.7], [0.58, 0.5], [0.93, 0.4], [1.4, 0.25]]) { const s = Math.floor((t + ch * 0.013) * c.sampleRate); for (let i = 0; i < 900; i++) x[s + i] += (Math.random() * 2 - 1) * a * Math.exp(-i / 260); } }
    for (const n in this.raw) this.decode(n);
    this.verb = c.createConvolver(); this.verb.buffer = ir; this.wet = c.createGain(); this.wet.gain.value = 0.55; this.verb.connect(this.wet); this.wet.connect(this.out);
  }
  noise(t, dur, f0, f1, gain, type = 'lowpass', q = 0.7, wet = 0) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out); if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(this.verb); }
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  tone(t, dur, f0, f1, gain, type = 'sine', wet = 0) {
    const c = this.ctx, o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(this.verb); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  play(name, a = 0, b = 0) {
    const c = this.ctx; if (!c || c.state !== 'running') return; const t = c.currentTime + 0.005 + (name === 'ding' || name === 'thud' || name === 'report' ? a : 0);
    const R = REC[name]; if (R && this.buf[R[0]]) { if (R[0]) this.sample(R[0], t, R[1] * (name === 'ding' ? Math.max(0.08, 1 - b / 1400) : name === 'thud' ? Math.max(0.06, 0.7 - b / 2400) : name === 'report' ? Math.max(0.15, 1 - b / 1600) : name === 'heart' || name === 'scream' ? a : 1), R[2] || 1, R[3] || 0); if (name === 'shot') this.tone(t, 0.3, 120, 30, 0.9, 'sine', 0.3); return; }
    if (R && R[0] === '' && this.buf.bolt_open) return;
    switch (name) {
      case 'shot': this.noise(t, 0.09, 9000, 900, 1.6, 'lowpass', 0.5, 1.2); this.noise(t, 0.5, 2400, 120, 1.1, 'lowpass', 0.6, 0.9); this.tone(t, 0.32, 150, 32, 1.5, 'sine', 0.5); this.noise(t + 0.02, 1.6, 700, 90, 0.35, 'lowpass', 0.4, 0.8); break;
      case 'dry': this.noise(t, 0.03, 5000, 2500, 0.25, 'bandpass', 4); this.tone(t, 0.05, 1900, 900, 0.08, 'square'); break;
      case 'boltUp': this.noise(t, 0.05, 3200, 1600, 0.3, 'bandpass', 3); this.tone(t, 0.06, 1300, 800, 0.07, 'triangle'); break;
      case 'boltBack': this.noise(t, 0.12, 1800, 4200, 0.3, 'bandpass', 2); this.tone(t + 0.1, 0.05, 900, 500, 0.12, 'triangle'); this.tone(t + 0.16, 0.25, 3900, 3700, 0.035); break;
      case 'boltFwd': this.noise(t, 0.12, 4200, 1500, 0.3, 'bandpass', 2); this.tone(t + 0.11, 0.05, 700, 380, 0.16, 'triangle'); break;
      case 'boltDown': this.noise(t, 0.04, 2600, 1300, 0.35, 'bandpass', 3); this.tone(t, 0.07, 520, 300, 0.16, 'triangle'); break;
      case 'magOut': this.noise(t, 0.06, 2000, 900, 0.3, 'bandpass', 2); this.tone(t, 0.08, 420, 240, 0.12, 'triangle'); break;
      case 'magIn': this.noise(t, 0.05, 1500, 2600, 0.3, 'bandpass', 2); this.tone(t + 0.04, 0.07, 340, 200, 0.2, 'triangle'); this.noise(t + 0.05, 0.03, 4200, 3000, 0.25, 'bandpass', 5); break;
      case 'click': this.noise(t, 0.012, 5200, 4200, 0.16, 'bandpass', 8); this.tone(t, 0.02, 2400, 1900, 0.04, 'square'); break;
      case 'zoom': this.noise(t, 0.03, 900, 700, 0.07, 'bandpass', 3); break;
      case 'laser': this.tone(t, 0.07, 2100, 2100, 0.06); this.tone(t + 0.09, 0.09, 2800, 2800, 0.06); break;
      case 'grab': this.noise(t, 0.05, 700, 300, 0.2); break;
      case 'bipod': this.noise(t, 0.05, 1200, 500, 0.3, 'bandpass', 2); this.tone(t, 0.08, 220, 120, 0.2, 'triangle'); break;
      case 'ding': { const v = Math.max(0.05, 0.9 - b / 1400); for (const [f, g, d] of [[1830, 0.3, 0.9], [2755, 0.22, 0.7], [4120, 0.16, 0.45], [5390, 0.1, 0.3], [690, 0.12, 0.5]]) this.tone(t, d, f, f * 0.995, g * v, 'sine', 0.5); this.noise(t, 0.03, 6000, 3000, 0.2 * v, 'bandpass', 2); break; }
      case 'thud': { const v = Math.max(0.04, 0.5 - b / 2400); this.noise(t, 0.14, 900, 180, v, 'lowpass', 0.7, 0.3); break; }
      case 'report': { const v = Math.max(0.12, 0.8 - b / 1600); this.noise(t, 0.6, 1200, 110, v, 'lowpass', 0.6, 0.9); this.tone(t, 0.3, 110, 40, v, 'sine', 0.4); break; }
      case 'crack': this.noise(t, 0.05, 9000, 5000, 1.3, 'highpass', 1, 0.5); this.noise(t + 0.01, 0.18, 3000, 600, 0.6, 'bandpass', 1, 0.5); break;
      case 'hurt': this.noise(t, 0.3, 500, 80, 1.2); this.tone(t, 0.5, 90, 40, 0.9); break;
      case 'heart': this.tone(t, 0.11, 62, 40, 0.5 * a); this.tone(t + 0.17, 0.1, 54, 36, 0.35 * a); break;
      case 'radio': this.noise(t, 0.07, 2400, 2400, 0.12, 'bandpass', 6); this.tone(t + 0.05, 0.05, 1250, 1250, 0.04, 'square'); break;
      case 'ui': this.tone(t, 0.05, 880, 880, 0.05, 'triangle'); break;
      case 'win': [523, 659, 784].forEach((f, i) => this.tone(t + i * 0.12, 0.5, f, f, 0.09, 'triangle', 0.4)); break;
      case 'fail': [330, 262, 196].forEach((f, i) => this.tone(t + i * 0.16, 0.6, f, f, 0.1, 'sawtooth', 0.3)); break;
      case 'scream': this.tone(t, 0.5, 900 + Math.random() * 400, 600, 0.04 * a, 'sawtooth', 0.6); break;
      case 'alarm': for (let i = 0; i < 6; i++) this.tone(t + i * 0.5, 0.45, 760, 980, 0.035, 'square', 0.5); break;
    }
  }
  // a held bed of filtered noise (wind, the far city, rotors): level 0 stops it
  loop(name, level, freq = 400, q = 0.5, pulse = 0) {
    const c = this.ctx; if (!c) return; let l = this.loops[name]; const rec = this.buf[name];
    if (l && rec && !l.rec) { l.g.gain.value = 0; l.s.stop(); l = this.loops[name] = null; }
    if (!l && rec) { if (level <= 0) return; const s = c.createBufferSource(); s.buffer = rec; s.loop = true; const g = c.createGain(); g.gain.value = 0; s.connect(g); g.connect(this.out); s.start(); l = this.loops[name] = { s, g, rec: true }; }
    if (l && l.rec) { l.g.gain.setTargetAtTime(Math.min(1, level * 4), c.currentTime, 0.4); return; }
    if (name === 'city' || name === 'sea') return;
    if (!l) { if (level <= 0) return; const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; const g = c.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(this.out); s.start(); l = this.loops[name] = { s, f, g };
      if (pulse) { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = pulse; og.gain.value = 0; o.connect(og); og.connect(g.gain); o.start(); l.o = o; l.og = og; } }
    l.f.frequency.setTargetAtTime(freq, c.currentTime, 0.4); l.f.Q.value = q; l.g.gain.setTargetAtTime(level, c.currentTime, 0.3); if (l.og) l.og.gain.setTargetAtTime(level * 0.8, c.currentTime, 0.3);
  }
  quiet() { for (const k in this.loops) this.loop(k, 0); }
  say(text) {
    this.play('radio'); if (!this.voice || !window.speechSynthesis) return;
    try { const u = new SpeechSynthesisUtterance(text); u.rate = 1.08; u.pitch = 0.8; u.volume = 0.8; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { this.voice = false; }
  }
}
