// Midnight Crumbs — core: namespace, utils, persistence, renderer, scene.
'use strict';
(function () {
const MC = window.MC = {};
const V3 = MC.V3 = THREE.Vector3;
MC.Y = new V3(0, 1, 0);
MC.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
MC.lerp = (a, b, t) => a + (b - a) * t;
MC.sstep = (a, b, x) => { const t = MC.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
MC.rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
MC.hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
MC.col = h => new THREE.Color(h);   // colour management converts sRGB hex to linear
MC.params = new URLSearchParams(location.search);
MC.$ = id => document.getElementById(id);
MC.money = v => (v < 0 ? '-$' : '$') + Math.abs(Math.round(v));
MC.pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

// tiny event bus
const hs = {};
MC.on = (n, f) => { (hs[n] = hs[n] || []).push(f); };
MC.emit = (n, a) => { (hs[n] || []).forEach(f => f(a)); };

// persistence (options + save)
function load(k, d) { try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } }
MC.opt = load('mc_opt', { keys: null, gripToggle: false, climbAssist: false, climbSens: 1, vrOneHand: false, pace: 'standard', uiScale: 1, plainFont: false, bigCross: false, cues: true, shake: 1, flash: 'full', captions: 'float', quality: 2, turn: 'snap30', vigLevel: 2, vrHeight: true, vignette: true, volume: 0.8, sens: 1, invertY: false, music: true, bob: true });
MC.save = load('mc_save', { tips: 0, stars: {}, upgrades: {}, regulars: {}, daily: {}, longBest: 0, hints: {} });
MC.persist = () => { try { localStorage.setItem('mc_opt', JSON.stringify(MC.opt)); localStorage.setItem('mc_save', JSON.stringify(MC.save)); } catch (e) {} };
// repair damaged saves: any field that should be an object but is not becomes empty
{ const S = MC.save; for (const k of ['stars', 'upgrades', 'regulars', 'daily', 'hints', 'upgOff', 'friends']) if (S[k] != null && (typeof S[k] !== 'object' || Array.isArray(S[k]))) S[k] = {}; for (const k of ['stars', 'upgrades', 'regulars', 'daily', 'hints']) if (!S[k]) S[k] = {};
  if (typeof S.tips !== 'number' || !isFinite(S.tips)) S.tips = 0; if (S.longBest == null || (typeof S.longBest !== 'number' && typeof S.longBest !== 'object')) S.longBest = 0;
  for (const k in S.stars) S.stars[k] = Math.max(0, Math.min(3, S.stars[k] | 0)); }
if (MC.params.has('fresh')) { MC.save = { tips: 0, stars: {}, upgrades: {}, regulars: {}, daily: {}, longBest: 0, hints: {} }; }
MC.KEYDEF = { fwd: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD', hop: 'Space', pack: 'KeyE', pawL: 'KeyQ', pawR: 'KeyF', pause: 'KeyP' };
MC.opt.keys = Object.assign({}, MC.KEYDEF, MC.opt.keys || {});
// respect the system 'reduce motion' setting the first time the game runs
try { if (!localStorage.getItem('mc_opt') && matchMedia('(prefers-reduced-motion: reduce)').matches) Object.assign(MC.opt, { shake: 0, flash: 'dim', bob: false }); } catch (e) {}
if (!MC.opt.capFloat) { if (MC.opt.captions === 'left') MC.opt.captions = 'float'; MC.opt.capFloat = 1; }   // the note left the wrist for a floating card (players asked)
if (MC.params.has('q')) MC.opt.quality = +MC.params.get('q');

// renderer
const canvas = MC.canvas = MC.$('c');
const R = MC.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
R.setPixelRatio(1);   // the picture is drawn small and scaled up (room.js), so the canvas itself need not be dense
R.outputColorSpace = THREE.SRGBColorSpace;
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 1.0;
R.shadowMap.enabled = MC.opt.quality > 0;
R.shadowMap.type = THREE.PCFShadowMap;
R.xr.enabled = true;
MC.isXR = () => R.xr.isPresenting;

const scene = MC.scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);
scene.fog = new THREE.FogExp2(0x03050c, 0.011);
const camera = MC.camera = new THREE.PerspectiveCamera(74, 1, 0.04, 400);
camera.rotation.order = 'YXZ';
const rig = MC.rig = new THREE.Group();
rig.add(camera); scene.add(rig);
MC.toWorld = v => new V3(v.x, v.y, v.z).multiplyScalar(rig.scale.x).applyAxisAngle(MC.Y, rig.rotation.y).add(rig.position);

MC.resize = () => {
  if (MC.isXR()) return;
  R.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
};
addEventListener('resize', MC.resize); MC.resize();

// geometry helpers -----------------------------------------------------------
// Rounded box with box-projected UVs (uvS = texture repeats per world unit).
MC.rboxGeo = (w, h, d, r = 0.08, uvS = 0.25, c = 3) => {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const n = 2 * c + 1, g = new THREE.BoxGeometry(w, h, d, n, n, n);
  const p = g.attributes.position, nm = g.attributes.normal, uv = g.attributes.uv, half = [w / 2, h / 2, d / 2];
  const remap = (v, hf) => {
    const i = Math.round((v + hf) / (2 * hf) * n);
    if (i <= c) return -hf + r * (i / c); if (i >= n - c) return hf - r * ((n - i) / c); return v < 0 ? -hf + r : hf - r; // middle segment spans the flat
  };
  const v = new V3(), inner = new V3(), dir = new V3();
  for (let i = 0; i < p.count; i++) {
    const ox = nm.getX(i), oy = nm.getY(i), oz = nm.getZ(i);
    // which grid index is this vertex on each axis
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    const q = [remap(v.x, half[0]), remap(v.y, half[1]), remap(v.z, half[2])];
    // vertices on the middle segment boundaries: keep exact flat extents
    inner.set(MC.clamp(q[0], -half[0] + r, half[0] - r), MC.clamp(q[1], -half[1] + r, half[1] - r), MC.clamp(q[2], -half[2] + r, half[2] - r));
    // face vertices sit on the outer shell: push the face coordinate out fully
    const fx = Math.abs(ox) > 0.5 ? Math.sign(ox) * half[0] : q[0], fy = Math.abs(oy) > 0.5 ? Math.sign(oy) * half[1] : q[1], fz = Math.abs(oz) > 0.5 ? Math.sign(oz) * half[2] : q[2];
    dir.set(fx - inner.x, fy - inner.y, fz - inner.z);
    if (dir.lengthSq() > 1e-10) { dir.normalize(); v.copy(inner).addScaledVector(dir, r); } else { v.set(fx, fy, fz); dir.set(ox, oy, oz); }
    p.setXYZ(i, v.x, v.y, v.z); nm.setXYZ(i, dir.x, dir.y, dir.z);
    if (Math.abs(ox) > 0.5) uv.setXY(i, v.z * uvS, v.y * uvS); else if (Math.abs(oy) > 0.5) uv.setXY(i, v.x * uvS, v.z * uvS); else uv.setXY(i, v.x * uvS, v.y * uvS);
  }
  return g;
};
MC.shadow = (o, cast = true, recv = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
})();
