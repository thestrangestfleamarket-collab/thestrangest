// DEAD END's ears: recorded sounds (data/hide/snd, credits in docs/hide-sounds.md) placed in the alley around your head, the rain and the city under everything
import { ASSET, camera, THREE, clamp } from './core.js';

const NAMES = ['rain', 'city', 'step1', 'step2', 'step3', 'step4', 'heavy1', 'heavy2', 'metal1', 'metal2', 'lid', 'gate', 'cardboard', 'wood', 'glass', 'growl1', 'growl2', 'roar', 'breath', 'heart', 'drip', 'splash', 'cloth', 'rat', 'thunder'];
const A = { ctx: null, buf: {}, out: null, loops: {}, ready: false, heard: [] };
const _p = new THREE.Vector3(), _f = new THREE.Vector3(), _u = new THREE.Vector3();
A.load = async onp => { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; A.ctx = new C(); A.out = A.ctx.createGain(); A.out.gain.value = .9; A.bed = A.ctx.createGain(); A.bed.connect(A.out); A.low = A.ctx.createBiquadFilter(); A.low.type = 'lowpass'; A.low.frequency.value = 20000; A.raw = A.ctx.createGain(); const comp = A.ctx.createDynamicsCompressor(); A.out.connect(A.low).connect(comp).connect(A.ctx.destination); A.raw.connect(A.ctx.destination);
  const nb = A.ctx.createBuffer(1, A.ctx.sampleRate * 2, A.ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; A.noise = nb;
  await Promise.all(NAMES.map(n => fetch(ASSET + 'snd/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => A.ctx.decodeAudioData(b)).then(b => { A.buf[n] = b; }).catch(() => {}))); A.ready = true; };
A.resume = () => { if (A.ctx && A.ctx.state !== 'running') A.ctx.resume(); };
A.loop = (name, vol) => { if (!A.buf[name] || A.loops[name]) return A.loops[name]; const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); s.buffer = A.buf[name]; s.loop = true; g.gain.value = vol; s.connect(g).connect(A.bed); s.start(); return A.loops[name] = { s, g }; };
// a sound at a place: name may be a list to pick from; rate bends its pitch
A.at = (name, pos, vol = 1, rate = 1) => { if (Array.isArray(name)) name = name[Math.floor(Math.random() * name.length)]; const b = A.buf[name]; if (!b || !A.ctx || A.ctx.state !== 'running') return null;
  const s = A.ctx.createBufferSource(), g = A.ctx.createGain(), p = A.ctx.createPanner(); s.buffer = b; s.playbackRate.value = rate * (.94 + Math.random() * .12); g.gain.value = vol; p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1.2; p.rolloffFactor = 1.5; p.maxDistance = 60;
  p.positionX.value = pos.x; p.positionY.value = pos.y ?? 1; p.positionZ.value = pos.z; s.connect(g).connect(p).connect(A.out); s.start(); return { s, g, p }; };
A.flat = (name, vol = 1, rate = 1) => { const b = A.buf[name]; if (!b || !A.ctx || A.ctx.state !== 'running') return null; const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g).connect(A.out); s.start(); return { s, g }; };
A.buzz = pos => { if (!A.ctx) return; const o = A.ctx.createOscillator(), o2 = A.ctx.createOscillator(), g = A.ctx.createGain(), p = A.ctx.createPanner(), f = A.ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 120; o2.type = 'square'; o2.frequency.value = 240.7; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .7; g.gain.value = .05;
  p.panningModel = 'HRTF'; p.refDistance = 1; p.rolloffFactor = 2.2; p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; o.connect(f); o2.connect(f); f.connect(g).connect(p).connect(A.out); o.start(); o2.start(); return g; };
// dread you can hear: a low drone and a thin high cluster that rise as it nears you, and wind that comes and goes
function drone() { if (A.dr || !A.ctx) return; const c = A.ctx, lo = c.createGain(), hi = c.createGain(), f = c.createBiquadFilter(); lo.gain.value = hi.gain.value = 0; f.type = 'lowpass'; f.frequency.value = 160; lo.connect(f).connect(A.out); hi.connect(A.out);
  for (const hz of [41, 43.5, 61.7]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz; o.connect(lo); o.start(); } for (const hz of [1244, 1318, 1397, 2637]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = hz; g.gain.value = .25; o.connect(g).connect(hi); o.start(); }
  const w = c.createBufferSource(), wf = c.createBiquadFilter(), wg = c.createGain(); w.buffer = A.noise; w.loop = true; wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = .6; wg.gain.value = 0; w.connect(wf).connect(wg).connect(A.bed); w.start(); A.dr = { lo, hi, wg, wf }; }
A.tension = v => { if (!A.dr) return; const t = A.ctx.currentTime; A.dr.lo.gain.setTargetAtTime(.02 + v * .2, t, .4); A.dr.hi.gain.setTargetAtTime(v * v * .05, t, .25); };
A.wind = v => { if (!A.dr) return; const t = A.ctx.currentTime; A.dr.wg.gain.setTargetAtTime(v * .22, t, 1.2); A.dr.wf.frequency.setTargetAtTime(300 + v * 500, t, 1.5); };
// shut in a box, the world goes dull
A.muffle = v => { if (A.low) A.low.frequency.setTargetAtTime(20000 * Math.pow(.03, v), A.ctx.currentTime, .12); };
A.hush = sec => { if (!A.bed) return; const t = A.ctx.currentTime; A.bed.gain.cancelScheduledValues(t); A.bed.gain.setValueAtTime(A.bed.gain.value, t); A.bed.gain.linearRampToValueAtTime(0, t + .05); A.bed.gain.setValueAtTime(0, t + sec); A.bed.gain.linearRampToValueAtTime(1, t + sec + 2.5); if (A.dr) { A.dr.lo.gain.setTargetAtTime(0, t, .02); A.dr.hi.gain.setTargetAtTime(0, t, .02); } };
// the scare: everything at once, straight to the ears, past the muffling and the limiter
A.scare = () => { if (!A.ctx || A.ctx.state !== 'running') return; const c = A.ctx, t = c.currentTime, shot = (name, vol, rate) => { const b = A.buf[name]; if (!b) return; const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g).connect(A.raw); s.start(t); };
  shot('roar', 2.6, .85); shot('roar', 1.6, 1.45); shot('growl2', 1.8, 1.7); shot('metal1', 1.5, .6); shot('lid', 1.2, .8);
  const n = c.createBufferSource(), ng = c.createGain(), nf = c.createBiquadFilter(); n.buffer = A.noise; nf.type = 'highpass'; nf.frequency.value = 1800; ng.gain.setValueAtTime(1.1, t); ng.gain.exponentialRampToValueAtTime(.001, t + .9); n.connect(nf).connect(ng).connect(A.raw); n.start(t); n.stop(t + 1);
  const o = c.createOscillator(), og = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(70, t + .7); og.gain.setValueAtTime(.5, t); og.gain.exponentialRampToValueAtTime(.001, t + 1.2); o.connect(og).connect(A.raw); o.start(t); o.stop(t + 1.3); };
// far off, a siren that comes and goes
A.siren = () => { if (!A.ctx || A.ctx.state !== 'running') return; const c = A.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = 'triangle'; for (let i = 0; i < 9; i++) { o.frequency.setValueAtTime(620, t + i); o.frequency.linearRampToValueAtTime(900, t + i + .5); o.frequency.linearRampToValueAtTime(620, t + i + 1); }
  f.type = 'lowpass'; f.frequency.value = 700; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035, t + 3); g.gain.linearRampToValueAtTime(0, t + 9); o.connect(f).connect(g).connect(A.bed); o.start(t); o.stop(t + 9.2); };
A.start = () => { A.resume(); A.loop('rain', .34); A.loop('city', .16); drone(); };
A.frame = () => { if (!A.ctx) return; const l = A.ctx.listener; camera.getWorldPosition(_p); camera.getWorldDirection(_f); _u.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));
  if (l.positionX) { l.positionX.value = _p.x; l.positionY.value = _p.y; l.positionZ.value = _p.z; l.forwardX.value = _f.x; l.forwardY.value = _f.y; l.forwardZ.value = _f.z; l.upX.value = _u.x; l.upY.value = _u.y; l.upZ.value = _u.z; } else { l.setPosition(_p.x, _p.y, _p.z); l.setOrientation(_f.x, _f.y, _f.z, _u.x, _u.y, _u.z); } };
// what each kind of thing sounds like when struck, and how far the noise carries (1 = a shout)
const HIT = { metal: [['metal1', 'metal2'], 1, 1], drum: [['metal1', 'metal2'], .62, 1], lid: ['lid', .7, 1.2], card: ['cardboard', 1, .3], wood: ['wood', 1, .6], soft: ['cloth', .8, .12], rubber: ['cardboard', .6, .25], glass: ['glass', 1, .7], stone: ['step1', .6, .2] };
A.hit = (kind, pos, force) => { const h = HIT[kind] || HIT.wood, v = clamp(force, .05, 1.4); A.at(h[0], pos, v, h[1]); return h[2] * clamp(force, 0, 1); };
export { A };
