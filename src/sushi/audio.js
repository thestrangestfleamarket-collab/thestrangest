// every sound of the night: recorded ones (data/sushi/snd, CC0) and ones made in the browser, each from where it is through one chain (spatial: direction, distance by its kind, the air dulling what is far, the alley's brick answering, the counter in the way); the rain and the street as a bed that changes as you move; and the boombox: real stations off the air, its own tape when none will play
import * as THREE from 'three';
import { G } from './ctx.js';

// the recordings (tools/sushi-assets.py snd; credits in docs/sushi-sounds.md)
export const SNDS = ['boil', 'simmer', 'steam', 'rain', 'eaves', 'drip', 'traffic', 'pour', 'drain', 'chop1', 'chop2', 'chop3', 'ceramic1', 'ceramic2', 'metal1', 'metal2', 'clank', 'wood1', 'wood2', 'glass1', 'glass2', 'shatter', 'crash', 'cloth1', 'cloth2', 'coin1', 'coin2', 'plop1', 'plop2', 'ignite', 'knob'];
// how each kind of source carries: the distance at which it is at full level (ref) and how fast it falls after (roll); far is where it stops
const KIND = { item: { ref: 0.35, roll: 1.4, far: 30 }, pot: { ref: 0.45, roll: 1.3, far: 30 }, voice: { ref: 1, roll: 1.2, far: 40 }, radio: { ref: 0.8, roll: 1.1, far: 40 }, tv: { ref: 0.7, roll: 1.2, far: 40 },
  car: { ref: 3, roll: 1, far: 90 }, street: { ref: 7, roll: 0.9, far: 140 }, eaves: { ref: 0.6, roll: 1.5, far: 25, flat: true }, roof: { ref: 1, roll: 1.4, far: 25, flat: true } };
// what each thing is made of, for how it sounds when it is taken, set down or knocked
const MAT = { ceramic: ['ceramic1', 'ceramic2', 0.85, 1.05], metal: ['metal1', 'metal2', 0.9, 1.1], glass: ['glass1', 'glass2', 0.95, 1.1], wood: ['wood1', 'wood2', 0.9, 1.15], cloth: ['cloth1', 'cloth2', 0.9, 1.1], soft: ['cloth1', 'cloth2', 1.3, 1.6], paper: ['cloth2', 'cloth1', 1.5, 1.8], plastic: ['wood1', 'wood2', 1.5, 1.8], coin: ['coin1', 'coin2', 0.95, 1.08] };
export const matOf = (it) => it.mat || (it.kind === 'bowl' ? 'ceramic' : it.kind === 'drink' ? 'glass' : it.tool ? 'metal' : it.kind === 'sticks' ? 'wood' : it.kind === 'rag' ? 'cloth' : it.kind === 'cash' ? (it.value >= 100 ? 'paper' : 'coin') : it.kind === 'food' || it.kind === 'raw' ? 'soft' : 'wood');
// one-shot sounds by name: which recordings, how loud, how much the pitch may wander
const SHOT = { chop: [['chop1', 'chop2', 'chop3'], 0.75, 0.94, 1.06], plop: [['plop1', 'plop2'], 0.35, 0.85, 1.15], splash: [['drain'], 0.4, 1.1, 1.3], drain: [['drain'], 0.55, 0.95, 1.05], ignite: [['ignite'], 0.6, 0.97, 1.03], knob: [['knob'], 0.5, 0.95, 1.05],
  shatter: [['shatter'], 0.8, 0.92, 1.05], crash: [['crash'], 0.8, 0.9, 1.05], clank: [['clank'], 0.6, 0.9, 1.05], coin: [['coin1', 'coin2'], 0.5, 0.95, 1.05] };
// the alley: listener and sources between two brick backs (3.4 m behind the cart, 5.6 m across); a short slap off each and a small tail, open to the sky
function alleyIR(c) {
  const n = (c.sampleRate * 1.1) | 0, b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch), at = (ms, a) => { const i = ((ms + ch * 1.3) * c.sampleRate / 1000) | 0; for (let k = 0; k < 40; k++) d[i + k] += a * Math.exp(-k / 6) * (k % 2 ? -0.4 : 1); };
    let lp = 0; for (let i = 0; i < n; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.22; const t = i / c.sampleRate; d[i] = lp * 0.5 * Math.exp(-t * 6.5) * Math.min(1, t / 0.03); }
    at(19, 0.5); at(33, 0.42); at(52, 0.28); at(67, 0.2); at(88, 0.14); at(104, 0.1);
  }
  return b;
}
const _l = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3();
// the cart's own body stands between the cook and what is low on the far side of it (a box each: min, max)
const SOLID = [[[-1.15, 0, -0.6], [1.15, 0.95, -0.14]], [[-0.7, 0, 1.43], [0.7, 0.9, 1.81]], [[-1.15, 0, -0.15], [-0.7, 0.82, 1.0]], [[0.7, 0, -0.15], [1.15, 0.88, 1.0]]];
function blocked(a, b) { // does the straight line from a to b pass through one of SOLID's boxes
  for (const [lo, hi] of SOLID) {
    let t0 = 0, t1 = 1, ok = true;
    for (const k of ['x', 'y', 'z']) { const i = { x: 0, y: 1, z: 2 }[k], d = b[k] - a[k]; if (Math.abs(d) < 1e-6) { if (a[k] < lo[i] || a[k] > hi[i]) { ok = false; break; } continue; } let u = (lo[i] - a[k]) / d, v = (hi[i] - a[k]) / d; if (u > v) [u, v] = [v, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) { ok = false; break; } }
    if (ok && t1 > 0.02 && t0 < 0.98) return true;
  }
  return false;
}

export class GameAudio {
  constructor() { this.ctx = null; this.ready = false; this.radioOn = false; this.station = 0; this.tape = false; this.bad = new Set(); this.step = 0; this.nextT = 0; this.buf = {}; this.loaded = 0; this.emit = new Set(); this.hitT = new WeakMap(); this.flows = []; this.shots = 0; }

  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain(); this.master.gain.value = (G.set && G.set.volume) || 1.0; this.master.connect(c.destination);
    this.dry = c.createGain(); this.dry.gain.value = 0.9; this.dry.connect(this.master);
    this.verb = c.createConvolver(); this.verb.buffer = alleyIR(c); this.verbIn = c.createGain(); this.verbIn.connect(this.verb); const vr = c.createGain(); vr.gain.value = 0.55; this.verb.connect(vr); vr.connect(this.master);
    const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = b;
    // the city's low hum, and the wind (made here); the rest of the bed is recorded and set going as it arrives
    this.loopNoise(160, 0.8, 0.035, 'lowpass');
    this.windGain = this.loopNoise(420, 0.5, 0.0, 'bandpass');
    this.trainGain = this.loopNoise(95, 0.7, 0.0, 'lowpass');
    this.bed = c.createGain(); this.bed.gain.value = 0.2; const bl = c.createBiquadFilter(); bl.type = 'lowpass'; bl.frequency.value = 7000; this.bed.connect(bl); bl.connect(this.master);
    // the boombox: its little speaker, from where it stands
    this.radioGain = c.createGain(); this.radioGain.gain.value = 0;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.25;
    const rd = this.spatial('radio', () => (G.cart && G.cart.radio ? G.cart.radio.getWorldPosition(this._rp || (this._rp = new THREE.Vector3())) : _s.set(-1.0, 1.42, -0.46)));
    this.radioGain.connect(bp); bp.connect(rd.input); this.radioPan = rd.input;
    this.ready = true;
    if (c.state === 'suspended') c.resume();
    this.load();
  }

  load(base = '/sushi-assets/snd/') {
    return Promise.all(SNDS.map((n) => fetch(base + n + '.mp3').then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))).then((ab) => this.ctx.decodeAudioData(ab)).then((bf) => { this.buf[n] = bf; this.loaded++; }).catch(() => { this.missing = (this.missing || 0) + 1; })))
      .then(() => this.beds());
  }

  // ---- one chain for every source: gain -> distance -> air (a low-pass that closes with distance, more behind the counter or glass) -> direction; a send to the alley's brick that grows as it goes further
  spatial(kind, at, o = {}) {
    const c = this.ctx, K = KIND[kind] || KIND.item, e = { kind, K, at, o, input: c.createGain(), dist: c.createGain(), air: c.createBiquadFilter(), pan: c.createPanner(), send: c.createGain(), d: 0, alive: o.alive, glass: o.glass || 0 };
    e.air.type = 'lowpass'; e.air.Q.value = 0.5; e.air.frequency.value = 18000;
    e.pan.panningModel = K.flat ? 'equalpower' : 'HRTF'; e.pan.distanceModel = 'linear'; e.pan.rolloffFactor = 0; e.pan.refDistance = 1; e.pan.maxDistance = 10000;
    e.input.connect(e.dist); e.dist.connect(e.air); e.air.connect(e.pan); e.pan.connect(o.out || this.dry); e.air.connect(e.send); e.send.connect(this.verbIn);
    e.free = () => { if (e.dead) return; e.dead = true; this.emit.delete(e); try { e.pan.disconnect(); e.send.disconnect(); } catch (x) { /* gone */ } };
    this.emit.add(e); this.place(e); return e;
  }
  // where a source is, what reaches the ear from there: called each frame for what lasts, once for a short sound
  place(e) {
    const p = typeof e.at === 'function' ? e.at() : e.at || _s.set(e.pan.positionX.value, e.pan.positionY.value, e.pan.positionZ.value), L = this.ear();
    if (e.at) { e.pan.positionX.value = p.x; e.pan.positionY.value = p.y; e.pan.positionZ.value = p.z; }
    const d = (e.d = L.distanceTo(p)), K = e.K, g = d >= K.far ? 0 : K.ref / (K.ref + K.roll * Math.max(0, d - K.ref)) * (d > K.far * 0.7 ? (K.far - d) / (K.far * 0.3) : 1);
    let f = Math.max(700, Math.min(19000, 22000 / (1 + 0.25 * d)));
    if (e.glass) f = Math.min(f, 900); else if (d > 0.6 && blocked(L, p)) f = Math.min(f, 1400);
    e.dist.gain.value = g; e.air.frequency.value = f; e.send.gain.value = 0.16 * (0.4 + 0.6 * Math.min(1, d / 9)) * (e.o.wet ?? 1);
    return e;
  }
  ear() { return this.earAt || (G.camera ? G.camera.getWorldPosition(_l) : _l.set(0, 1.6, 0.3)); }

  // a recording once, from a place (or from nowhere: near the ear)
  shot(name, pos, vol = 1, rate = 1, kind = 'item') {
    const bf = this.buf[name]; if (!bf || !this.ready || this.shots > 18) return null;
    const c = this.ctx, s = c.createBufferSource(); s.buffer = bf; s.playbackRate.value = rate;
    if (!pos) { const g = c.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.dry); s.start(); return s; }
    const e = this.spatial(kind, pos.clone ? pos.clone() : pos); e.input.gain.value = vol; s.connect(e.input); this.shots++; s.onended = () => { this.shots--; e.free(); }; s.start(); return s;
  }
  // a loop that lasts, from a place that may move (at: a vector or a function giving one); its level is set by the caller (e.level)
  loop(name, kind, at, o = {}) {
    const e = this.spatial(kind, at, o), bf = this.buf[name]; e.input.gain.value = 0; e.level = (v) => { e.input.gain.setTargetAtTime(v, this.ctx.currentTime, 0.12); };
    if (bf) { const s = this.ctx.createBufferSource(); s.buffer = bf; s.loop = true; s.loopStart = 0.05; s.loopEnd = bf.duration - 0.05; s.playbackRate.value = o.rate || 1; s.connect(e.input); s.start(0, Math.random() * bf.duration * 0.9); e.src = s; }
    return e;
  }
  // a thing taken, set down or knocked: its own material's sound, as hard as it came (k 0..1)
  touch(it, pos, k) {
    const m = MAT[it ? matOf(it) : 'wood'] || MAT.wood, v = Math.min(1, k); if (v < 0.02) return;
    const heavy = it && (it.mass || 0) > 2 && matOf(it) === 'metal';
    this.shot(heavy && v > 0.35 ? 'clank' : m[Math.random() < 0.5 ? 0 : 1], pos || (it && it.obj.position), 0.12 + 0.75 * Math.pow(v, 1.3), m[2] + Math.random() * (m[3] - m[2]) - (heavy ? 0.15 : 0));
  }
  // physics says something struck at speed dv (m/s)
  hit(it, dv) {
    if (!this.ready || !it || it.kind === 'cash') return;   // the till's money sounds for itself const t = this.ctx.currentTime, last = this.hitT.get(it) || 0; if (t - last < 0.08 || dv < 0.45) return; this.hitT.set(it, t);
    this.touch(it, it.obj.position, (dv - 0.2) / 3);
  }
  // liquid running out of something into something: one stream's sound per pour, as loud as it runs
  flow(key, pos, rate) {
    if (!this.ready || !this.buf.pour) return; let f = this.flows.find((x) => x.key === key) || this.flows.find((x) => x.idle > 0.4);
    if (!f) { if (this.flows.length >= 2) return; f = { key, e: this.loop('pour', 'item', new THREE.Vector3()), idle: 0 }; this.flows.push(f); }
    f.key = key; f.idle = 0; f.e.at.copy(pos); f.e.level(Math.min(0.5, 0.12 + rate * 6));
  }

  // the bed: rain over the alley (louder out from under the roof), on the cart's sheet roof and running off its edges into puddles, the street's traffic at the open end, the pots
  beds() {
    if (this.bedOn || !this.buf.rain) return; this.bedOn = true; const c = this.ctx;
    const r = c.createBufferSource(); r.buffer = this.buf.rain; r.loop = true; r.loopStart = 0.05; r.loopEnd = r.buffer.duration - 0.05; r.connect(this.bed); r.start(0, Math.random() * 10);
    this.edges = [[-0.9, 2.62, -1.86], [0.9, 2.62, -1.86], [-0.9, 2.62, 2.14], [0.9, 2.62, 2.14]].map(([x, y, z], i) => this.loop(i % 2 ? 'drip' : 'eaves', 'eaves', new THREE.Vector3(x, i % 2 ? 0.1 : y, z), { rate: 0.94 + i * 0.04 }));
    this.edges.forEach((e) => e.level(0.5));
    this.roof = this.loop('eaves', 'roof', new THREE.Vector3(0, 3.1, 0.15), { rate: 1.12, wet: 0.3 }); this.roof.level(0.22);
    this.street = this.loop('traffic', 'street', new THREE.Vector3(35, 1.5, -1), { wet: 1.6 }); this.street.level(0.9);
    this.pots = [];
  }

  play(name, at, k = 1) {
    if (!this.ready) return;
    const it = at && at.obj ? at : null, pos = it ? it.obj.position : at && at.isVector3 ? at : null;
    if (name === 'grab') return this.touch(it, pos, 0.22 * k);
    const SET = { place: 'paper', clink: 'coin', bottle: 'glass' };
    if ((name === 'set' || SET[name]) && this.buf.wood1) return this.touch(it || { mat: SET[name] || 'wood', obj: { position: pos } }, pos, 0.35 * k);
    if (name === 'break') name = it && matOf(it) === 'glass' ? 'shatter' : 'crash';
    if (name === 'pour' && this.buf.pour) return this.flow('p' + (pos ? pos.x.toFixed(1) : ''), pos || this.ear(), 0.02);
    const S = SHOT[name]; if (S && this.buf[S[0][0]]) return this.shot(S[0][(Math.random() * S[0].length) | 0], pos, S[1] * k, S[2] + Math.random() * (S[3] - S[2]));
    let dest; if (pos) { const e = this.spatial('item', pos.clone()); setTimeout(e.free, 1500); dest = e.input; }   // made here, still from where it happens
    switch (name) {
      case 'patter': break;   // the rain is recorded now
      case 'step': this.burst(260, 0.07, { vol: 0.06, q: 1.2, dest }); this.burst(2200, 0.03, { vol: 0.02, delay: 0.01, dest }); break;
      case 'chirp': break;
      case 'grab': this.burst(2500, 0.05, { vol: 0.06, dest }); break;
      case 'place': this.tone(190, 0.08, { vol: 0.12, to: 90, dest }); this.burst(1800, 0.04, { vol: 0.08, dest }); break;
      case 'clink': this.tone(2100, 0.12, { vol: 0.06, dest }); this.tone(3150, 0.09, { vol: 0.035, dest }); break;
      case 'chop': this.burst(1200, 0.05, { vol: 0.3, dest }); this.tone(140, 0.07, { vol: 0.2, to: 70, dest }); break;
      case 'pour': this.burst(700, 0.55, { vol: 0.15, to: 1700, q: 2, dest }); break;
      case 'splash': this.burst(500, 0.3, { vol: 0.15, to: 200, dest }); break;
      case 'plop': this.tone(420, 0.09, { vol: 0.1, to: 160, dest }); break;
      case 'click': this.tone(900, 0.03, { type: 'square', vol: 0.05, dest }); this.burst(3000, 0.02, { vol: 0.08, dest }); break;
      case 'ignite': this.burst(300, 0.5, { vol: 0.2, to: 1200, q: 0.6, dest }); break;
      case 'bell': this.tone(1568, 0.9, { vol: 0.14, dest }); this.tone(2349, 0.7, { vol: 0.06, dest }); break;
      case 'cash': this.tone(1318, 0.12, { vol: 0.12, dest }); this.tone(1760, 0.3, { vol: 0.12, delay: 0.09, dest }); if (this.buf.coin1) this.shot('coin1', pos, 0.4); else this.burst(6000, 0.12, { vol: 0.08, delay: 0.02, dest }); break;
      case 'bad': this.tone(196, 0.3, { type: 'sawtooth', vol: 0.08, to: 140 }); break;
      case 'break': this.burst(3500, 0.35, { vol: 0.3, q: 0.5, dest }); this.tone(1200, 0.2, { vol: 0.08, dest }); break;
      case 'bottle': this.burst(4000, 0.08, { vol: 0.12, dest }); this.tone(600, 0.1, { vol: 0.05, to: 300, delay: 0.03, dest }); break;
      case 'voice': for (let i = 0; i < 4; i++) this.tone(180 + Math.random() * 120, 0.09, { type: 'triangle', vol: 0.08, delay: i * 0.1, dest }); break;
      case 'slurp': this.burst(900, 0.35, { vol: 0.05, to: 2600, q: 3, dest }); break;
      case 'done': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.35, { vol: 0.1, delay: i * 0.12 })); break;
    }
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
    const c = this.ctx, now = c.currentTime, dt = Math.min(0.1, now - (this.lastT ?? now)); this.lastT = now;
    if (env) {
      this.windGain.gain.value = 0.015 + env.wind * 0.05; this.windGain.filter.frequency.value = 300 + env.wind * 380;
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
    // out from under the cart's roof the open sky's rain grows
    const e0 = this.ear(), out = Math.max(0, Math.abs(e0.x) - 1.75, -1.86 - e0.z, e0.z - 2.14); this.bed.gain.setTargetAtTime(0.1 + 0.22 * Math.min(1, out / 1.5), now, 0.3);
    if (this.bedOn && G.cart) {
      // the pots: the noodle water at a rolling boil, the stocks at a simmer, a faint hiss of steam off the hottest
      if (!this.pots.length) { this.pots = G.cart.pots.map((pt) => ({ pt, e: this.loop(pt.type ? 'simmer' : 'boil', 'pot', () => _q.set(pt.x, pt.liqY > 0 ? pt.liqY : pt.baseY + 0.1, pt.z), { rate: 0.95 + Math.random() * 0.1 }) })); this.hiss = this.loop('steam', 'pot', () => { const pt = G.cart.pots[0]; return _q.set(pt.x, pt.rimY + 0.15, pt.z); }, { rate: 0.8 }); }
      let top = 0; for (const q of this.pots) { const k = Math.max(0, Math.min(1, (q.pt.heat - 0.55) / 0.45)) * (q.pt.liqY > 0 ? 1 : 0); q.e.level((q.pt.type ? 0.3 : 0.45) * k * k); if (!q.pt.type) top = k; }
      this.hiss.level(0.05 * top * top);
    }
    // a car going by the street's end: its tyres on the wet
    for (const g of G.passing || []) { if (!g.userData.lead) continue; if (!g.userData.snd) { const e = (g.userData.snd = this.spatial('car', () => g.position)), n = this.loopNoise(420, 0.4, 1, 'bandpass', e.input); e.n = n; n.gain.value = 0; } const s = g.userData.snd, v = g.userData.v || 0; s.n.gain.setTargetAtTime(v ? 0.5 : 0, now, 0.2); s.n.filter.frequency.value = 300 + v * 30; }
    for (const f of this.flows) { f.idle += dt; if (f.idle > 0.15) f.e.level(0); }
    for (const e of this.emit) { if (e.alive && !e.alive()) { e.free(); continue; } this.place(e); }
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

const _p = new THREE.Vector3(), _f = new THREE.Vector3(), _q = new THREE.Vector3();
