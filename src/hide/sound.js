// DEAD END's ears: recorded sounds (data/hide/snd, credits in docs/hide-sounds.md) placed in the alley around your head, the rain and the city under everything
import { ASSET, camera, THREE, clamp } from './core.js';

const NAMES = ['rain', 'city', 'step1', 'step2', 'step3', 'step4', 'heavy1', 'heavy2', 'metal1', 'metal2', 'lid', 'gate', 'cardboard', 'wood', 'glass', 'growl1', 'growl2', 'roar', 'breath', 'heart', 'drip', 'splash', 'cloth', 'rat', 'thunder'];
const A = { ctx: null, buf: {}, out: null, loops: {}, ready: false, heard: [] };
const _p = new THREE.Vector3(), _f = new THREE.Vector3(), _u = new THREE.Vector3();
A.load = async onp => { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; A.ctx = new C(); A.out = A.ctx.createGain(); A.out.gain.value = .9; const comp = A.ctx.createDynamicsCompressor(); A.out.connect(comp).connect(A.ctx.destination);
  await Promise.all(NAMES.map(n => fetch(ASSET + 'snd/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => A.ctx.decodeAudioData(b)).then(b => { A.buf[n] = b; }).catch(() => {}))); A.ready = true; };
A.resume = () => { if (A.ctx && A.ctx.state !== 'running') A.ctx.resume(); };
A.loop = (name, vol) => { if (!A.buf[name] || A.loops[name]) return A.loops[name]; const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); s.buffer = A.buf[name]; s.loop = true; g.gain.value = vol; s.connect(g).connect(A.out); s.start(); return A.loops[name] = { s, g }; };
// a sound at a place: name may be a list to pick from; rate bends its pitch
A.at = (name, pos, vol = 1, rate = 1) => { if (Array.isArray(name)) name = name[Math.floor(Math.random() * name.length)]; const b = A.buf[name]; if (!b || !A.ctx || A.ctx.state !== 'running') return null;
  const s = A.ctx.createBufferSource(), g = A.ctx.createGain(), p = A.ctx.createPanner(); s.buffer = b; s.playbackRate.value = rate * (.94 + Math.random() * .12); g.gain.value = vol; p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1.2; p.rolloffFactor = 1.5; p.maxDistance = 60;
  p.positionX.value = pos.x; p.positionY.value = pos.y ?? 1; p.positionZ.value = pos.z; s.connect(g).connect(p).connect(A.out); s.start(); return { s, g, p }; };
A.flat = (name, vol = 1, rate = 1) => { const b = A.buf[name]; if (!b || !A.ctx || A.ctx.state !== 'running') return null; const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g).connect(A.out); s.start(); return { s, g }; };
A.buzz = pos => { if (!A.ctx) return; const o = A.ctx.createOscillator(), o2 = A.ctx.createOscillator(), g = A.ctx.createGain(), p = A.ctx.createPanner(), f = A.ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 120; o2.type = 'square'; o2.frequency.value = 240.7; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .7; g.gain.value = .05;
  p.panningModel = 'HRTF'; p.refDistance = 1; p.rolloffFactor = 2.2; p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; o.connect(f); o2.connect(f); f.connect(g).connect(p).connect(A.out); o.start(); o2.start(); return g; };
A.start = () => { A.resume(); A.loop('rain', .34); A.loop('city', .16); };
A.frame = () => { if (!A.ctx) return; const l = A.ctx.listener; camera.getWorldPosition(_p); camera.getWorldDirection(_f); _u.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));
  if (l.positionX) { l.positionX.value = _p.x; l.positionY.value = _p.y; l.positionZ.value = _p.z; l.forwardX.value = _f.x; l.forwardY.value = _f.y; l.forwardZ.value = _f.z; l.upX.value = _u.x; l.upY.value = _u.y; l.upZ.value = _u.z; } else { l.setPosition(_p.x, _p.y, _p.z); l.setOrientation(_f.x, _f.y, _f.z, _u.x, _u.y, _u.z); } };
// what each kind of thing sounds like when struck, and how far the noise carries (1 = a shout)
const HIT = { metal: [['metal1', 'metal2'], 1, 1], drum: [['metal1', 'metal2'], .62, 1], lid: ['lid', .7, 1.2], card: ['cardboard', 1, .3], wood: ['wood', 1, .6], soft: ['cloth', .8, .12], rubber: ['cardboard', .6, .25], glass: ['glass', 1, .7], stone: ['step1', .6, .2] };
A.hit = (kind, pos, force) => { const h = HIT[kind] || HIT.wood, v = clamp(force, .05, 1.4); A.at(h[0], pos, v, h[1]); return h[2] * clamp(force, 0, 1); };
export { A };
