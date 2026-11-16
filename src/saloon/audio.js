// the saloon's sounds, made in the browser for now: glass, pours, coins, the doors, a shot and its ring, the room's murmur, the wind outside, the piano's tune
import { G } from '../sushi/ctx.js';

export class SaloonAudio {
  constructor() { this.ctx = null; this.crowd = 0; this.piano = false; this.pt = 0; this.pi = 0; }
  init() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const c = (this.ctx = new (window.AudioContext || window.webkitAudioContext)()); this.out = c.createGain(); this.out.gain.value = 0.9; this.out.connect(c.destination);
    const n = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = n;
    const loop = (f, q, g) => { const s = c.createBufferSource(); s.buffer = n; s.loop = true; const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; const a = c.createGain(); a.gain.value = g; s.connect(b).connect(a).connect(this.out); s.start(); return { b, a }; };
    this.wind = loop(240, 0.6, 0.035); this.murmur = loop(420, 0.9, 0);
  }
  tone(f, t, o = {}) { const c = this.ctx; if (!c) return; const at = c.currentTime + (o.at || 0), s = c.createOscillator(), a = c.createGain(); s.type = o.type || 'sine'; s.frequency.setValueAtTime(f, at); if (o.to) s.frequency.exponentialRampToValueAtTime(o.to, at + t);
    a.gain.setValueAtTime(0, at); a.gain.linearRampToValueAtTime(o.v ?? 0.2, at + (o.a ?? 0.004)); a.gain.exponentialRampToValueAtTime(0.0008, at + t); s.connect(a).connect(this.out); s.start(at); s.stop(at + t + 0.02); }
  hiss(t, f, q, v, o = {}) { const c = this.ctx; if (!c) return; const at = c.currentTime + (o.at || 0), s = c.createBufferSource(); s.buffer = this.noise; s.loop = true; const b = c.createBiquadFilter(); b.type = o.type || 'bandpass'; b.frequency.setValueAtTime(f, at); if (o.to) b.frequency.exponentialRampToValueAtTime(o.to, at + t); b.Q.value = q;
    const a = c.createGain(); a.gain.setValueAtTime(v, at); a.gain.exponentialRampToValueAtTime(0.0008, at + t); s.connect(b).connect(a).connect(this.out); s.start(at, Math.random()); s.stop(at + t + 0.02); }
  play(name, k = 1) {
    if (!this.ctx) return; const r = 0.92 + Math.random() * 0.16;
    switch (name) {
      case 'grab': this.hiss(0.05, 1800, 1, 0.05); break;
      case 'place': this.tone(150 * r, 0.09, { v: 0.16 * k, type: 'triangle' }); this.hiss(0.04, 900, 1, 0.07 * k); break;
      case 'clink': case 'bottle': this.tone(2300 * r, 0.22, { v: 0.09 * k }); this.tone(3550 * r, 0.16, { v: 0.05 * k }); break;
      case 'pour': this.hiss(0.16, 2600 * r, 3, 0.035); break;
      case 'plop': case 'splash': this.tone(420, 0.1, { to: 150, v: 0.1 }); this.hiss(0.12, 1500, 1, 0.05); break;
      case 'break': for (let i = 0; i < 6; i++) this.tone(1800 + Math.random() * 3800, 0.12 + Math.random() * 0.2, { v: 0.08, at: i * 0.012 }); this.hiss(0.25, 5200, 0.7, 0.2); break;
      case 'chop': case 'thunk': this.tone(120 * r, 0.1, { v: 0.3 * k, type: 'triangle', to: 60 }); this.hiss(0.03, 700, 1, 0.12 * k); break;
      case 'coin': this.tone(4100 * r, 0.3, { v: 0.07 }); this.tone(6150 * r, 0.22, { v: 0.04 }); break;
      case 'till': this.tone(1900, 0.5, { v: 0.12 }); this.tone(2850, 0.5, { v: 0.06 }); this.hiss(0.12, 600, 1, 0.12, { at: 0.02 }); break;
      case 'bell': this.tone(1320, 1.6, { v: 0.2 }); this.tone(2650, 1.1, { v: 0.09 }); this.tone(3990, 0.7, { v: 0.05 }); break;
      case 'door': this.tone(95, 0.3, { v: 0.14, type: 'sawtooth', to: 70 }); this.hiss(0.35, 320, 2, 0.05); this.tone(88, 0.28, { v: 0.1, type: 'sawtooth', to: 64, at: 0.42 }); break;
      case 'step': this.tone(70 * r, 0.07, { v: 0.14 * k, type: 'triangle' }); this.hiss(0.05, 380, 1, 0.05 * k); break;
      case 'cock': this.tone(1250, 0.03, { v: 0.14, type: 'square' }); this.tone(820, 0.04, { v: 0.14, type: 'square', at: 0.07 }); break;
      case 'click': this.tone(1500, 0.025, { v: 0.12, type: 'square' }); break;
      case 'shot': this.hiss(0.5, 1400, 0.3, 1.0 * k, { type: 'lowpass', to: 180 }); this.tone(160, 0.3, { v: 0.7 * k, type: 'triangle', to: 40 }); this.hiss(1.4, 700, 0.5, 0.12 * k, { at: 0.08, type: 'lowpass', to: 200 }); break;
      case 'boom': this.hiss(0.8, 900, 0.3, 1.2, { type: 'lowpass', to: 120 }); this.tone(110, 0.5, { v: 0.9, type: 'triangle', to: 30 }); this.hiss(1.8, 500, 0.5, 0.16, { at: 0.1, type: 'lowpass', to: 150 }); break;
      case 'ricochet': this.tone(2600, 0.5, { v: 0.1, to: 700 }); break;
      case 'hit': this.tone(90, 0.12, { v: 0.4, type: 'triangle', to: 50 }); this.hiss(0.08, 500, 1, 0.2); break;
      case 'fall': this.tone(60, 0.25, { v: 0.5, type: 'triangle', to: 35 }); this.hiss(0.2, 300, 1, 0.2); break;
      case 'ball': this.tone(1700 * r, 0.05, { v: 0.2 * k, type: 'triangle' }); this.tone(2900 * r, 0.03, { v: 0.1 * k }); break;
      case 'cushion': this.tone(180 * r, 0.07, { v: 0.14 * k, type: 'triangle' }); break;
      case 'pocket': this.tone(140, 0.18, { v: 0.25, type: 'triangle', to: 70 }); this.tone(900, 0.06, { v: 0.08, at: 0.16 }); break;
      case 'dart': this.tone(220, 0.07, { v: 0.3, type: 'triangle', to: 110 }); this.hiss(0.04, 1200, 1, 0.14); break;
      case 'card': this.hiss(0.05, 3200, 1.5, 0.07); break;
      case 'cork': this.tone(520, 0.07, { v: 0.22, to: 180, type: 'triangle' }); this.hiss(0.05, 1400, 1, 0.1); break;
      case 'slide': this.hiss(0.1, 2400, 2, 0.03 * k); break;
      case 'match': this.hiss(0.3, 4200, 1, 0.08, { to: 1500 }); break;
    }
  }
  // a piano note: three strings a little apart, as an upright left in the desert sounds
  note(m, at, len = 0.5, v = 0.07) { const f = 440 * Math.pow(2, (m - 69) / 12); for (const d of [-7, 0, 9]) this.tone(f * Math.pow(2, d / 1200), len, { v: v / 2, at, type: 'triangle', a: 0.006 }); this.tone(f * 2, len * 0.5, { v: v / 5, at }); }
  update(dt, crowd = 0) {
    if (!this.ctx) return; const c = this.ctx.currentTime;
    this.crowd += (crowd - this.crowd) * Math.min(1, dt); this.murmur.a.gain.setTargetAtTime(Math.min(0.11, this.crowd * 0.012), c, 0.5); this.murmur.b.frequency.setTargetAtTime(380 + Math.sin(G.t * 0.7) * 90, c, 0.3);
    this.wind.a.gain.setTargetAtTime(0.03 + Math.sin(G.t * 0.13) * 0.015, c, 1);
    if (this.piano && (this.pt -= dt) <= 0) { // a slow rag in C: stride left hand, a wandering right
      const bar = [[48, 64, 67], [43, 62, 65], [45, 64, 69], [41, 60, 65], [48, 64, 67], [50, 65, 69], [43, 62, 67], [48, 64, 72]][(this.pi >> 2) % 8], b = this.pi % 4, sc = [72, 74, 76, 79, 81, 84, 79, 76];
      if (b % 2 === 0) this.note(bar[0] - (b ? 5 : 0), 0, 0.5, 0.09); else { this.note(bar[1], 0, 0.3, 0.05); this.note(bar[2], 0, 0.3, 0.05); }
      this.note(sc[(this.pi * 3 + (this.pi >> 3)) % 8], 0, 0.35, 0.07); if (Math.random() < 0.5) this.note(sc[(this.pi * 5 + 2) % 8], 0.16, 0.25, 0.05);
      this.pi++; this.pt = 0.32;
    }
  }
}
