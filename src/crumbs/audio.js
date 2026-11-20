// Procedural audio: everything is synthesized. A damped 3.2 s reverb sells the "tiny creature in a huge room" scale.
'use strict';
// Mix: one-shots -> dry/reverb -> master; steady loops -> an ambience bus that ducks under important cues and thunder.
(function () {
const A = MC.audio = { ctx: null, loops: {}, pans: {} };
let ctx, master, rev, revRet, dry, amb, nbuf;
A.init = function () {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = A.ctx = new AC();
  master = A.out = ctx.createGain(); master.gain.value = MC.opt.volume;
  const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  dry = ctx.createGain(); dry.connect(master);
  amb = ctx.createGain(); amb.gain.value = 1; amb.connect(dry);
  rev = ctx.createConvolver(); revRet = ctx.createGain(); revRet.gain.value = 0.55; rev.connect(revRet); revRet.connect(master);
  // impulse response with high-frequency damping: bright at first (~8 kHz), dull by the tail (~1.5 kHz)
  const sr = ctx.sampleRate, len = sr * 3.2, ir = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let y = 0; for (let i = 0; i < len; i++) { const k = i / len, fc = 8000 * Math.pow(1500 / 8000, k), a = 1 - Math.exp(-2 * Math.PI * fc / sr); y += a * ((Math.random() * 2 - 1) - y); d[i] = y * Math.pow(1 - k, 2.6) * (i < 600 ? i / 600 : 1) * 1.6; } }
  rev.buffer = ir;
  nbuf = ctx.createBuffer(1, sr * 2, sr); const nd = nbuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  startLoops();
};
A.setVolume = v => { if (master) master.gain.value = v; };
A.setWet = v => { if (revRet) revRet.gain.setTargetAtTime(v, ctx.currentTime, 0.3); };
// duck the ambience bus to `level`, then recover over `rel` seconds
A.duck = function (level, rel = 0.4, hold = 0) { if (!ctx) return; const t = ctx.currentTime, g = amb.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(Math.min(g.value, level), t + 0.03); g.setValueAtTime(Math.min(g.value, level), t + 0.03 + hold); g.linearRampToValueAtTime(A.ambBase || 1, t + 0.03 + hold + rel); };
A.setAmbBase = v => { A.ambBase = v; if (ctx) amb.gain.setTargetAtTime(v, ctx.currentTime, 0.4); };
function panner(pos) { const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 2; p.rolloffFactor = 1.2; if (pos) p.setPosition(pos.x, pos.y, pos.z); return p; }
// route: optional world position -> panner; wet amount; bus (dry by default)
function out(pos, wet, bus) {
  const g = ctx.createGain(); let node = g;
  if (pos) { const p = panner(pos); g.connect(p); node = p; }
  node.connect(bus || dry); if (wet) { const w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(rev); }
  return g;
}
function tone(f, dur, o = {}) {
  if (!ctx) return; const t = ctx.currentTime + (o.delay || 0), osc = ctx.createOscillator(), g = out(o.pos, o.wet == null ? 0.3 : o.wet);
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  const v = o.vol == null ? 0.1 : o.vol; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + (o.att || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); osc.start(t); osc.stop(t + dur + 0.05);
}
function noise(dur, o = {}) {
  if (!ctx) return; const t = ctx.currentTime + (o.delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = out(o.pos, o.wet == null ? 0.3 : o.wet);
  s.buffer = nbuf; s.loop = true; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 800, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur); f.Q.value = o.q || 1;
  const v = o.vol == null ? 0.1 : o.vol; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + (o.att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
A.tone = tone; A.noise = noise;
// loops: each has a gain (A.loops[name]) and an optional panner (A.pans[name]) placed with A.loopPos
function loop(name, build, o = {}) {
  const g = ctx.createGain(); g.gain.value = 0; let node = g;
  if (o.positional) { const p = panner(); g.connect(p); node = p; A.pans[name] = p; }
  node.connect(o.bus === 'dry' ? dry : amb); if (o.wet) { const w = ctx.createGain(); w.gain.value = o.wet; node.connect(w); w.connect(rev); }
  build(g); A.loops[name] = g; return g;
}
const noiseSrc = (filt, dest) => { const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; s.connect(filt); filt.connect(dest); s.start(0, Math.random()); return s; };
const biq = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
function startLoops() {
  // the pub's murmur: three bands of voice-shaped noise, each swelling and falling on its own, heard from the room's middle
  loop('murmur', g => { for (const [f, q, r] of [[320, 3, 0.31], [540, 4, 0.23], [900, 5, 0.41]]) { const b = biq('bandpass', f, q), gg = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(); gg.gain.value = 0.5; l.frequency.value = r; lg.gain.value = 0.35; l.connect(lg); lg.connect(gg.gain); l.start(); noiseSrc(b, gg); gg.connect(g); } }, { positional: true, wet: 0.5 });
  // fridge: 50 Hz fundamental plus 100-300 Hz partials and a compressor whine, so it still reads on small speakers
  loop('hum', g => { for (const [f, v] of [[50, 0.45], [100, 0.25], [150, 0.1], [200, 0.08], [300, 0.04]]) { const o = ctx.createOscillator(), gg = ctx.createGain(); o.frequency.value = f; gg.gain.value = v; o.connect(gg); gg.connect(g); o.start(); }
    const w = ctx.createOscillator(), lp = biq('lowpass', 450), wg = ctx.createGain(); w.type = 'sawtooth'; w.frequency.value = 100; wg.gain.value = 0.06; w.connect(lp); lp.connect(wg); wg.connect(g); w.start(); }, { positional: true, wet: 0.4 });
  // pan sizzle: soft hiss (high-passed and low-passed) under random crackle pops added in A.update
  loop('sizzle', g => { const hp = biq('highpass', 4200, 0.5), lp = biq('lowpass', 9000); noiseSrc(hp, lp); lp.connect(g); A.sizzleLP = lp; }, { positional: true, wet: 0.1 });
  loop('bubble', g => { const bp = biq('bandpass', 420, 3); noiseSrc(bp, g); A.bubbleBP = bp; }, { positional: true, wet: 0.2 });
  loop('rain', g => { const lp = biq('lowpass', 2500, 0.5); noiseSrc(lp, g); }, { wet: 0.5 });
  // noise drone: two close sines that beat, rising with the noise meter
  loop('wind', g => { for (const f of [110, 110.7, 220.4]) { const o = ctx.createOscillator(), gg = ctx.createGain(); o.frequency.value = f; gg.gain.value = f > 200 ? 0.3 : 0.5; o.connect(gg); gg.connect(g); o.start(); } }, { bus: 'dry', wet: 0.6 });
  loop('purr', g => { const lp = biq('lowpass', 220), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 24; lg.gain.value = 0.5; am.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain); noiseSrc(lp, am); am.connect(g); lfo.start(); }, { positional: true, wet: 0.5, bus: 'dry' });
  // phone: a pulsing 150 Hz rattle-buzz; the low-pass drops when you stand on it
  loop('buzz', g => { const o = ctx.createOscillator(), lp = biq('lowpass', 1200), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), rat = ctx.createOscillator(), rg = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 150; am.gain.value = 0.5; lfo.type = 'square'; lfo.frequency.value = 2.2; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
    rat.type = 'square'; rat.frequency.value = 10; rg.gain.value = 0.25; rat.connect(rg); rg.connect(am.gain);
    o.connect(lp); lp.connect(am); am.connect(g); o.start(); lfo.start(); rat.start(); A.buzzLP = lp; }, { positional: true, wet: 0.4, bus: 'dry' });
  // ants: a skitter (band-passed noise with a fast flutter)
  loop('skitter', g => { const bp = biq('bandpass', 6500, 2), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(); am.gain.value = 0.5; lfo.frequency.value = 35; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain); noiseSrc(bp, am); am.connect(g); lfo.start(); }, { positional: true, wet: 0.2, bus: 'dry' });
  // the big ceiling light: a faint 120 Hz buzz while it is on
  loop('bulb', g => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = 120; o2.frequency.value = 240; g2.gain.value = 0.4; o.connect(g); o2.connect(g2); g2.connect(g); o.start(); o2.start(); }, { positional: true, wet: 0.3, bus: 'dry' });
  A.loops.hum.gain.value = 0.08;
  A.loopPos('hum', new MC.V3(-19, 6, 0)); A.loopPos('bulb', new MC.V3(8, 34, 20));
}
A.setLoop = (name, v, tc = 0.3) => { const g = A.loops[name]; if (g && ctx) g.gain.setTargetAtTime(v, ctx.currentTime, tc); };
A.loopPos = (name, p) => { const pn = A.pans[name]; if (pn && p) pn.setPosition(p.x, p.y, p.z); };
A.setBuzzMuffle = on => { if (A.buzzLP) A.buzzLP.frequency.setTargetAtTime(on ? 300 : 1200, ctx.currentTime, 0.05); };
A.listener = (p, f) => { if (!ctx) return; const l = ctx.listener; if (l.setPosition) { l.setPosition(p.x, p.y, p.z); l.setOrientation(f.x, f.y, f.z, 0, 1, 0); } };

// named effects
const S = MC.sfx = {};
const cue = () => A.duck(0.5, 0.4);   // important cues push the ambience down for a moment
S.step = (pos, v = 1) => noise(0.05, { type: 'lowpass', f: 900 * (0.8 + Math.random() * 0.4), q: 0.6, vol: 0.05 * v, pos, wet: 0.15 });
S.grab = pos => noise(0.09, { f: 900, q: 0.8, vol: 0.06, pos, wet: 0.1 });
S.pick = pos => tone(620, 0.07, { vol: 0.05, pos, to: 780 });
S.tink = pos => { tone(2650, 0.35, { vol: 0.05, pos, wet: 0.4 }); tone(3970, 0.25, { vol: 0.025, pos, wet: 0.4 }); };   // food set on a plate
S.stash = () => { noise(0.12, { f: 500, q: 1, vol: 0.06 }); tone(330, 0.08, { vol: 0.04, to: 240 }); };
S.thunk = (pos, v, kind) => { // v = impact strength 0..1+
  const vv = MC.clamp(v, 0.05, 1.4);
  if (kind === 'metal') { tone(520 + Math.random() * 300, 0.5, { type: 'triangle', vol: 0.09 * vv, pos, wet: 0.7 }); tone(1370, 0.35, { vol: 0.04 * vv, pos, wet: 0.7 }); }
  tone(70 + Math.random() * 30, 0.22, { type: 'sine', vol: 0.28 * vv, to: 38, pos, wet: 0.6 });
  tone(160 + Math.random() * 40, 0.12, { type: 'triangle', vol: 0.08 * vv, to: 110, pos, wet: 0.5 });   // audible on small speakers
  noise(0.06, { f: kind === 'soft' ? 300 : 1400, q: 0.7, vol: (kind === 'soft' ? 0.05 : 0.12) * vv, pos, wet: 0.5 });
};
S.land = (pos, v) => { tone(55, 0.3, { vol: 0.3 * v, to: 30, pos, wet: 0.5 }); tone(140, 0.18, { type: 'triangle', vol: 0.1 * v, to: 90, pos }); noise(0.1, { f: 400, vol: 0.1 * v, pos }); };
S.clunk = pos => { tone(120, 0.12, { type: 'square', vol: 0.16, to: 60, pos, wet: 0.6 }); noise(0.05, { f: 2000, vol: 0.12, pos, wet: 0.6 }); };
S.tick = pos => tone(1500, 0.025, { type: 'square', vol: 0.018, pos, wet: 0.2 });
S.pop = pos => { tone(260, 0.3, { type: 'sawtooth', vol: 0.16, to: 980, pos, wet: 0.7 }); tone(1900, 0.6, { vol: 0.05, pos, wet: 0.8, delay: 0.05 }); noise(0.08, { f: 3000, vol: 0.14, pos, wet: 0.6 }); cue(); };
S.ding = pos => { tone(1320, 0.9, { vol: 0.09, pos, wet: 0.6 }); tone(1980, 0.7, { vol: 0.04, pos, wet: 0.6 }); cue(); };            // pan ready
S.potDing = pos => { tone(990, 1.0, { vol: 0.09, pos, wet: 0.6 }); tone(1485, 0.8, { vol: 0.04, pos, wet: 0.6 }); cue(); };          // pot ready: lower
S.coin = pos => { tone(1180, 0.12, { type: 'triangle', vol: 0.08, pos }); tone(1570, 0.3, { type: 'triangle', vol: 0.08, pos, delay: 0.08 }); cue(); };
S.nope = pos => { tone(210, 0.16, { type: 'square', vol: 0.05, to: 150, pos }); tone(160, 0.2, { type: 'square', vol: 0.05, to: 110, pos, delay: 0.14 }); cue(); };
S.burnt = pos => { noise(0.6, { type: 'bandpass', f: 2000, to: 200, q: 0.8, vol: 0.14, pos, wet: 0.5 }); tone(90, 0.3, { vol: 0.25, to: 50, pos, wet: 0.5, delay: 0.1 }); cue(); };
S.blup = pos => tone(200 + Math.random() * 180, 0.09, { vol: 0.06, to: 520, pos, wet: 0.3 });
S.crackle = pos => noise(0.012, { type: 'highpass', f: 3000 + Math.random() * 3000, vol: 0.05 + Math.random() * 0.05, pos, wet: 0.05 });
S.puff = pos => noise(0.25, { f: 900, to: 300, q: 0.5, vol: 0.06, pos });
S.cut = pos => { noise(0.07, { f: 5200, q: 2, vol: 0.12, pos, wet: 0.4 }); tone(2400, 0.12, { vol: 0.03, pos, to: 3200, wet: 0.5 }); };
S.hop = () => tone(210, 0.12, { vol: 0.05, to: 340 });
S.zip = () => noise(0.6, { f: 1800, to: 3600, q: 4, vol: 0.05 });
S.drip = (pos, metal) => { const k = 0.85 + Math.random() * 0.3; tone(880 * k, 0.09, { vol: 0.07, to: 1500 * k, pos, wet: 0.95 }); if (metal) tone(1900 * k, 0.4, { type: 'triangle', vol: 0.03, pos, wet: 0.9 }); tone(64 * k, 0.4, { vol: 0.07, to: 40, pos, wet: 0.9, delay: 0.02 }); };
S.clock = pos => tone(300, 0.04, { type: 'square', vol: 0.02, pos, wet: 0.5 });
S.stomp = (v = 1, pos) => { tone(42, 0.55, { vol: 0.75 * v, to: 24, wet: 0.5, pos }); tone(95, 0.35, { type: 'triangle', vol: 0.3 * v, to: 60, wet: 0.5, pos }); tone(350, 0.18, { type: 'sawtooth', vol: 0.03 * v, to: 300, wet: 0.6, pos, delay: 0.05 }); noise(0.22, { type: 'lowpass', f: 180, vol: 0.4 * v, wet: 0.5, pos }); };
S.switch = () => { noise(0.03, { f: 3000, vol: 0.25, wet: 0.6 }); tone(180, 0.06, { type: 'square', vol: 0.12, wet: 0.6 }); };
S.gasp = () => { noise(0.5, { f: 900, to: 2200, q: 2, vol: 0.3, wet: 0.7, att: 0.15 }); tone(180, 0.5, { type: 'sawtooth', vol: 0.12, to: 330, wet: 0.6 }); };
S.creak = pos => { tone(90, 1.1, { type: 'sawtooth', vol: 0.07, to: 150, wet: 0.8, att: 0.3, pos }); };
S.bedsprings = pos => { for (let i = 0; i < 3; i++) tone(420 + i * 60, 0.25, { type: 'triangle', vol: 0.03, to: 380 + i * 50, wet: 0.9, pos, delay: i * 0.18 }); };
S.cough = pos => { for (let i = 0; i < 2; i++) { noise(0.16, { type: 'bandpass', f: 500, q: 1.2, vol: 0.12, wet: 0.9, pos, delay: i * 0.32, att: 0.01 }); tone(140, 0.14, { type: 'sawtooth', vol: 0.04, to: 110, wet: 0.9, pos, delay: i * 0.32 }); } };
S.heart = v => { tone(60, 0.12, { vol: 0.35 * v, to: 40, wet: 0 }); tone(120, 0.08, { vol: 0.12 * v, to: 90, wet: 0 }); tone(55, 0.12, { vol: 0.25 * v, to: 38, wet: 0, delay: 0.16 }); tone(110, 0.08, { vol: 0.08 * v, to: 85, wet: 0, delay: 0.16 }); };
S.thunder = () => { A.duck(0.35, 2.5, 0.3); noise(3.2, { type: 'lowpass', f: 220, to: 60, vol: 0.9, wet: 0.9, att: 0.05 }); noise(1.2, { type: 'bandpass', f: 400, to: 150, q: 0.6, vol: 0.25, wet: 0.9 }); noise(0.25, { f: 2400, vol: 0.3, wet: 0.8 }); };
S.meow = pos => { tone(520, 0.55, { type: 'sawtooth', vol: 0.07, to: 760, wet: 0.8, att: 0.1, pos }); tone(760, 0.4, { type: 'sawtooth', vol: 0.05, to: 430, wet: 0.8, delay: 0.5, pos }); };
S.chirp = pos => { tone(2800, 0.06, { vol: 0.05, pos, wet: 0.5 }); tone(3400, 0.06, { vol: 0.05, pos, delay: 0.09, wet: 0.5 }); cue(); };   // a customer arrives
S.skit = pos => noise(0.12, { f: 6500, q: 2, vol: 0.06, pos, wet: 0.2 });
S.bird = pos => { const f = 2200 + Math.random() * 1400; for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) tone(f * (1 + (i % 2) * 0.18), 0.08, { vol: 0.025, to: f * 1.3, pos, wet: 0.6, delay: i * 0.11 }); };
S.star = i => tone([660, 880, 1320][i] || 660, 0.6, { type: 'triangle', vol: 0.12, wet: 0.7, delay: i * 0.35 });
S.fail = () => { tone(330, 0.4, { type: 'triangle', vol: 0.1, to: 220, wet: 0.6 }); tone(220, 0.7, { type: 'triangle', vol: 0.1, to: 130, wet: 0.6, delay: 0.3 }); };

// ---------- music box: a lullaby phrase per home, in its own mode ----------
const MODES = [[0, 2, 4, 7, 9, 12, 14, 16], [0, 2, 4, 6, 7, 9, 11, 12, 14], [0, 2, 3, 5, 7, 9, 10, 12, 14]];   // pentatonic, lydian, dorian
const ROOT = [523.25, 466.16, 440];
function box(f, t, vol) {   // fundamental + inharmonic tine partial + a tiny pluck click
  tone(f, 1.6, { vol, wet: 1, delay: t }); tone(f * 5.9, 0.25, { vol: vol * 0.25, wet: 1, delay: t }); noise(0.012, { f: 4000, q: 1, vol: vol * 0.6, wet: 0.8, delay: t });
}
function phrase(home) {
  const r = MC.rng(31 + home * 17), sc = MODES[home % 3], out = []; let i = 2;
  for (let n = 0; n < 16; n++) { i = Math.max(0, Math.min(sc.length - 1, i + [-2, -1, -1, 0, 1, 1, 2][r() * 7 | 0])); if (n === 15) i = 0; out.push(sc[i]); }
  return out;
}
let mus = { t: 2, n: 0, ph: null, home: -1 };
A.update = function (dt, ev, o = {}) {
  if (!ctx) return;
  // pan crackle and boil-over blups
  if (o.sizzle > 0 && Math.random() < dt * (2 + 12 * o.sizzle)) S.crackle(o.panPos);
  if (o.boil > 0 && Math.random() < dt * (3 + 10 * o.boil)) S.blup(o.potPos);
  if (!MC.opt.music) return;
  const home = MC.world.home ? MC.HOMES.indexOf(MC.world.home) : 0; if (home !== mus.home) { mus = { t: 2, n: 0, ph: phrase(home), home }; }
  if (ev === 'snacker' || ev === 'cat') return;                 // only the watchers silence it
  const slow = ev === 'storm' || ev === 'outage', oct = slow ? 0.5 : 1;
  mus.t -= dt; if (mus.t > 0) return;
  const semi = mus.ph[mus.n], f = ROOT[home % 3] * Math.pow(2, semi / 12) * oct; box(f, 0, 0.022);
  mus.n++;
  if (mus.n >= mus.ph.length) { mus.n = 0; mus.t = Math.max(1.5, 6 - (o.busy || 0) * 1.5); }   // gaps shrink as orders pile up
  else mus.t = (mus.n % 4 === 0 ? 0.62 : 0.42) * (slow ? 1.6 : 1);
};
A.cadence = function () { if (!ctx) return; const home = mus.home < 0 ? 0 : mus.home, r = ROOT[home % 3]; [7, 4, 2, 0].forEach((s, i) => box(r * Math.pow(2, s / 12), i * 0.5, 0.03)); box(r / 2, 2.0, 0.03); box(r, 2.0, 0.025); };
})();
