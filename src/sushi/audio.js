// every sound of the night, made in the browser (rain, wind, traffic, the pots, the tools), and the boombox: real stations off the air, its own tape when none will play
import { G } from './ctx.js';

export class GameAudio {
  constructor() { this.ctx = null; this.ready = false; this.radioOn = false; this.station = 0; this.tape = false; this.bad = new Set(); this.step = 0; this.nextT = 0; }

  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain(); this.master.gain.value = 1.0; this.master.connect(c.destination);
    // shared noise buffer
    const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = b;
    // rain + city bed
    this.loopNoise(5200, 0.7, 0.05, 'highpass');
    this.loopNoise(160, 0.8, 0.09, 'lowpass');
    // boil bed (gain driven by game)
    this.boilGain = this.loopNoise(900, 1.4, 0.0, 'bandpass');
    this.windGain = this.loopNoise(420, 0.5, 0.0, 'bandpass');
    this.trainGain = this.loopNoise(95, 0.7, 0.0, 'lowpass');
    this.carPan = c.createStereoPanner ? c.createStereoPanner() : c.createGain(); this.carPan.connect(this.master);
    this.carGain = this.loopNoise(330, 0.6, 0.0, 'bandpass', this.carPan);
    this.far = c.createStereoPanner ? c.createStereoPanner() : c.createGain(); if (this.far.pan) this.far.pan.value = 0.6; this.far.connect(this.master);
    // radio chain -> small speaker, panned left where the boombox sits
    this.radioGain = c.createGain(); this.radioGain.gain.value = 0;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.25;
    const pan = c.createPanner(); pan.panningModel = 'HRTF'; pan.refDistance = 1.6; pan.rolloffFactor = 0.6;
    pan.positionX.value = -1.0; pan.positionY.value = 1.45; pan.positionZ.value = -0.5;
    this.radioGain.connect(bp); bp.connect(pan); pan.connect(this.master); this.radioPan = pan;
    this.ready = true;
    if (c.state === 'suspended') c.resume();
  }

  loopNoise(freq, q, gain, type, dest) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(dest || this.master); s.start(); g.filter = f;
    return g;
  }

  tone(freq, dur, o = {}) {
    if (!this.ready) return;
    const c = this.ctx, t = c.currentTime + (o.delay || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.2, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || this.master); osc.start(t); osc.stop(t + dur + 0.05);
  }

  burst(freq, dur, o = {}) {
    if (!this.ready) return;
    const c = this.ctx, t = c.currentTime + (o.delay || 0), s = c.createBufferSource(); s.buffer = this.noise;
    s.playbackRate.value = o.rate || 1;
    const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = o.q || 1;
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(o.vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(o.dest || this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  play(name) {
    if (!this.ready) return;
    switch (name) {
      case 'patter': this.burst(3500 + Math.random() * 3500, 0.025, { vol: 0.035 + Math.random() * 0.04, q: 2 }); break;
      case 'step': this.burst(260, 0.07, { vol: 0.09, q: 1.2 }); this.burst(2200, 0.03, { vol: 0.03, delay: 0.01 }); break;
      case 'chirp': this.tone(2350, 0.11, { vol: 0.02, to: 1850, dest: this.far }); this.tone(1850, 0.13, { vol: 0.02, to: 2250, delay: 0.16, dest: this.far }); break;
      case 'grab': this.burst(2500, 0.05, { vol: 0.12 }); break;
      case 'place': this.tone(190, 0.08, { vol: 0.25, to: 90 }); this.burst(1800, 0.04, { vol: 0.15 }); break;
      case 'clink': this.tone(2100, 0.12, { vol: 0.12 }); this.tone(3150, 0.09, { vol: 0.07 }); break;
      case 'chop': this.burst(1200, 0.05, { vol: 0.5 }); this.tone(140, 0.07, { vol: 0.4, to: 70 }); break;
      case 'pour': this.burst(700, 0.55, { vol: 0.3, to: 1700, q: 2 }); break;
      case 'splash': this.burst(500, 0.3, { vol: 0.3, to: 200 }); break;
      case 'plop': this.tone(420, 0.09, { vol: 0.2, to: 160 }); break;
      case 'click': this.tone(900, 0.03, { type: 'square', vol: 0.12 }); this.burst(3000, 0.02, { vol: 0.2 }); break;
      case 'ignite': this.burst(300, 0.5, { vol: 0.35, to: 1200, q: 0.6 }); break;
      case 'bell': this.tone(1568, 0.9, { vol: 0.22 }); this.tone(2349, 0.7, { vol: 0.1 }); break;
      case 'cash': this.tone(1318, 0.12, { vol: 0.18 }); this.tone(1760, 0.3, { vol: 0.18, delay: 0.09 }); this.burst(6000, 0.12, { vol: 0.12, delay: 0.02 }); break;
      case 'bad': this.tone(196, 0.3, { type: 'sawtooth', vol: 0.12, to: 140 }); break;
      case 'break': this.burst(3500, 0.35, { vol: 0.5, q: 0.5 }); this.tone(1200, 0.2, { vol: 0.15 }); break;
      case 'bottle': this.burst(4000, 0.08, { vol: 0.25 }); this.tone(600, 0.1, { vol: 0.1, to: 300, delay: 0.03 }); break;
      case 'voice': for (let i = 0; i < 4; i++) this.tone(180 + Math.random() * 120, 0.09, { type: 'triangle', vol: 0.12, delay: i * 0.1 }); break;
      case 'slurp': this.burst(900, 0.35, { vol: 0.08, to: 2600, q: 3 }); break;
      case 'done': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.35, { vol: 0.15, delay: i * 0.12 })); break;
    }
  }

  // the boombox: a real station streamed through its little speaker; if none will play (no network), the cassette in it
  setRadio(on) { this.radioOn = on; if (this.ready && on) this.burst(3000, 0.25, { vol: 0.2, dest: this.radioGain }); this.stream(); }
  get stations() { return REAL.length; }
  live() { return this.tape ? null : REAL[this.station % REAL.length]; }
  label() { return !this.radioOn ? 'OFF' : this.tape ? 'TAPE' : (REAL[this.station].fm ? 'FM ' + REAL[this.station].fm + ' ' : '') + REAL[this.station].name; }
  stream() {
    clearTimeout(this.wait); const L = this.radioOn ? this.live() : null;
    if (this.ready) { this.radioGain.gain.value = this.radioOn && !L ? 1.6 : 0; this.nextT = this.ctx.currentTime + 0.05; this.step = 0; }
    if (!L) { if (this.el) { this.el.pause(); this.el.removeAttribute('src'); this.el.load(); } return; }
    const el = this.el || (this.el = Object.assign(new Audio(), { crossOrigin: 'anonymous', preload: 'none' }));
    if (this.ready && !this.elGain) { try { const c = this.ctx, src = c.createMediaElementSource(el), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 110; this.elGain = c.createGain(); this.elGain.gain.value = 0.8; src.connect(hp); hp.connect(this.elGain); this.elGain.connect(this.radioPan); } catch (e) { this.elGain = null; } }   // from the boombox itself, not the room
    const fail = () => { if (this.el !== el || !this.radioOn || this.live() !== L || el.src !== L.url) return; this.bad.add(L.url); const next = REAL.findIndex((r, i) => i > this.station && !this.bad.has(r.url)), any = next >= 0 ? next : REAL.findIndex((r) => !this.bad.has(r.url)); if (any >= 0 && any !== this.station) this.station = any; else this.tape = true; this.stream(); };
    el.onerror = fail; this.wait = setTimeout(() => { if (el.readyState < 2 && !(el.currentTime > 0)) fail(); }, 25000);
    if (el.src !== L.url) el.src = L.url; el.play().catch((e) => { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') fail(); });
  }
  tune() { this.station = (this.station + 1) % REAL.length; this.tape = false; this.bad.delete(REAL[this.station].url); this.step = 0; if (this.ready && this.radioOn) this.burst(2000, 0.3, { vol: 0.25, to: 5000, dest: this.master }); this.stream(); }

  update(boil, env) {
    if (!this.ready) return;
    const c = this.ctx;
    this.boilGain.gain.value = 0.05 * boil;
    if (env) {
      this.windGain.gain.value = 0.02 + env.wind * 0.07; this.windGain.filter.frequency.value = 300 + env.wind * 380;
      this.carGain.gain.value = env.car * 0.42; this.carGain.filter.frequency.value = 220 + env.car * 500; if (this.carPan.pan) this.carPan.pan.value = env.carPan;
      this.trainGain.gain.value = env.train * 0.5; if (env.train > 0.25 && Math.random() < 0.09) this.tone(70, 0.06, { vol: 0.12 * env.train, type: 'square' }); // wheel clack
    }
    const L = G.camera, l = c.listener;
    if (L && l.positionX) {
      const p = L.getWorldPosition(_p), f = L.getWorldDirection(_f);
      l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z;
      l.forwardX.value = f.x; l.forwardY.value = f.y; l.forwardZ.value = f.z;
      l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0;
    }
    if (this.el && !this.elGain && !this.el.paused) { const d = Math.hypot(_p.x + 1.0, _p.z + 0.46); this.el.volume = Math.max(0.05, Math.min(1, 0.55 / Math.max(0.6, d))) * Math.min(1, this.master.gain.value); }
    if (!this.radioOn || this.live()) return;
    const S = STATIONS[this.station % STATIONS.length], spb = 60 / S.bpm / 4;
    while (this.nextT < c.currentTime + 0.12) { this.seq(S, this.step, this.nextT - c.currentTime, spb); this.step++; this.nextT += spb; }
  }

  seq(S, step, delay, spb) {
    delay = Math.max(0, delay);
    const d = this.radioGain, s16 = step % 16, bar = Math.floor(step / 16) % S.chords.length, ch = S.chords[bar];
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
    if (S.kick.includes(s16)) this.tone(130, 0.16, { to: 42, vol: 0.5, delay, dest: d });
    if (S.snare.includes(s16)) { this.burst(1900, 0.16, { vol: 0.32, delay, dest: d, q: 0.6 }); this.tone(200, 0.08, { vol: 0.15, delay, dest: d }); }
    if (s16 % 2 === 0) this.burst(8000, 0.03, { vol: s16 % 4 === 2 ? 0.1 : 0.05, delay, dest: d, type: 'highpass' });
    if (S.bass[s16] !== null && S.bass[s16] !== undefined) this.tone(hz(ch[0] - 24 + S.bass[s16]), spb * 1.7, { type: 'sawtooth', vol: 0.16, delay, dest: d });
    if (s16 === 0 || s16 === S.stab) ch.forEach((n) => this.tone(hz(n), spb * (s16 === 0 ? 7 : 3), { type: S.pad, vol: 0.045, delay, dest: d }));
    const a = S.arp[step % S.arp.length];
    if (a !== null) this.tone(hz(ch[a % ch.length] + 12 * Math.floor(a / ch.length) + 12), spb * 1.5, { type: S.lead, vol: 0.06, delay, dest: d });
  }
}

// the dial: real stations streaming live (https, open to any page): New York's own on their FM numbers, then SomaFM's (listener-supported)
export const REAL = [
  { name: 'WBGO Jazz', fm: '88.3', url: 'https://ais-sa8.cdnstream1.com/3629_128.mp3' },
  { name: 'WWOZ New Orleans', fm: '90.7', url: 'https://wwoz-sc.streamguys1.com/wwoz-hi.mp3' },
  { name: 'WNYC News', fm: '93.9', url: 'https://fm939.wnyc.org/wnycfm-web' },
  { name: 'WQXR Classical', fm: '105.9', url: 'https://stream.wqxr.org/wqxr-web' },
  { name: 'SomaFM Seven Inch Soul', url: 'https://ice1.somafm.com/7soul-128-mp3' },
  { name: 'SomaFM Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { name: 'SomaFM Underground 80s', url: 'https://ice1.somafm.com/u80s-128-mp3' },
];
// the cassette: original loops in the spirit of the era (city-pop, synthwave, slow jam), played when no station will
const STATIONS = [
  { bpm: 108, pad: 'triangle', lead: 'square', stab: 10, kick: [0, 6, 8], snare: [4, 12], bass: [0, null, 0, null, 12, null, 0, 7, 0, null, 0, null, 10, null, 12, null],
    chords: [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [67, 71, 74, 77]], arp: [0, null, 2, 3, null, 2, 4, null, 3, null, 2, null, 1, null, 2, null] },
  { bpm: 118, pad: 'sawtooth', lead: 'sawtooth', stab: 8, kick: [0, 4, 8, 12], snare: [4, 12], bass: [0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 12, 0, 12],
    chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], arp: [0, 1, 2, 3, 4, 3, 2, 1] },
  { bpm: 84, pad: 'sine', lead: 'triangle', stab: 6, kick: [0, 10], snare: [4, 12], bass: [0, null, null, 0, null, null, 7, null, 0, null, null, null, 5, null, 7, null],
    chords: [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]], arp: [null, null, 3, null, 2, null, null, 4, null, 3, null, null, 2, null, 1, null] },
];

import * as THREE from 'three';
const _p = new THREE.Vector3(), _f = new THREE.Vector3();
