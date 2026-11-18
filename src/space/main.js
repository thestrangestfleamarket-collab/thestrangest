// SPACE FLEET: a fleet battle on a field that floats in your room (passthrough) or in open space, for a Quest headset in its browser; two players, or one against the bot. This file is the headset, the hands, the lights and the glue; the battle is sim.js, its picture view.js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sim, read, table, NAVY, TYPES, DT, MOTHER, FIGHTER, FRIGATE, CRUISER, MINE, BX, BY, BZ } from './sim.js';
import { Bot } from './bot.js';
import { View, loadModels, BASE, LEN } from './view.js';
import { Panel, Banner, Guide } from './hud.js';
import { Post } from './post.js';
import { buildCosmos } from './cosmos.js';
import { Net } from './net.js';
import { initAudio, sfx, loop, listen } from './audio.js';

const $ = (id) => document.getElementById(id), Q = new URLSearchParams(location.search), SIM = Q.has('sim'), FAST = SIM ? +Q.get('fast') || 1 : 1;   // ?sim: the check's way in, no headset; ?fast=n runs the battle n times as fast
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(0.7);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.02, 5000); scene.add(camera);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// the field: everything of the battle is inside this group, which your grips move, turn and size
const arena = new THREE.Group(); scene.add(arena);
// space light: one hard sun, fixed in the sky (turn the field and the shadows turn on the hulls); the side away from it is near black, with only a trace of fill and of light off the galaxy, and nothing is lit past white
const SUN = new THREE.Vector3(0.55, 0.62, 0.56).normalize(), sun = new THREE.DirectionalLight(0xfff4e6, 3.8), fill = new THREE.HemisphereLight(0x8fa8d0, 0x1a1410, 0.05);
const rim = new THREE.DirectionalLight(0x6f9cff, 0.22); scene.add(rim, rim.target); sun.castShadow = true; sun.shadow.mapSize.set(SIM ? 2048 : 1024, SIM ? 2048 : 1024); scene.add(sun, sun.target, fill);
let shadowS = 0;
function fitLight() { const s = arena.scale.x; sun.target.position.copy(arena.position); rim.target.position.copy(arena.position); rim.position.copy(arena.position).addScaledVector(SUN, -3 * s); rim.position.y += 1.5 * s; sun.position.copy(arena.position).addScaledVector(SUN, 3 * s);
  if (s !== shadowS) { shadowS = s; const c = sun.shadow.camera; c.left = c.bottom = -1.75 * s; c.right = c.top = 1.75 * s; c.near = 0.8 * s; c.far = 5.2 * s; c.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.004 * s; } }
// open space: built all round you in three dimensions (cosmos.js); behind it a plain black shell, so your room is not seen through it. In passthrough none of it is drawn and your room is there
const space = new THREE.Group(); scene.add(space);
const shell = new THREE.Mesh(new THREE.SphereGeometry(4200, 24, 12), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, depthWrite: false, toneMapped: false })); shell.renderOrder = -10; space.add(shell);
let cosmos = null;
fetch(BASE + 'stars.json').then(r => r.json()).then(cat => { cosmos = buildCosmos(cat, SUN); space.add(cosmos); }).catch(() => {});
// what the hulls' metal mirrors: a plain lit room, dim in open space so the sun does the work
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); }
const panel = new Panel(), banner = new Banner(), guide = new Guide(), post = new Post(renderer), HUD = 3; scene.add(banner.mesh, guide.mesh, panel.mesh);
for (const m of [panel.mesh, banner.mesh, guide.mesh]) m.layers.set(HUD); camera.layers.enable(HUD);   // what the lens must leave sharp is on its own layer, drawn after it
const G = { state: 'load', me: 0, sim: null, bots: [], view: null, net: null, host: false, peer: false, acc: 0, ar: false, canAR: false, over: false, placed: -1, alarm: 0, last: 0, paused: false, tOff: 0, mode: 0, fx: Q.has('fx') || (() => { try { return localStorage.getItem('spaceLens') === '1'; } catch (e) { return false; } })(), fwd: new THREE.Vector3(0, 0, -1), fac: Q.get('navy') === '1' ? 1 : 0, peerFac: 1 };
const gnow = () => performance.now() - G.tOff;   // the battle's own clock: it stands still while the battle is paused
function setView(ar) { post.rest(); G.ar = ar && G.canAR; space.visible = !G.ar; fill.intensity = G.ar ? 0.45 : 0.05; scene.environmentIntensity = G.ar ? 0.45 : 0.16; if (SIM) scene.background = null; }
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _d = new THREE.Vector3(), _o = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _up = new THREE.Vector3();
const world = (p) => arena.localToWorld(_w.copy(p));

// ---- the battle: run here (alone, or as the host of two) or followed from the host's pictures --------------
// the bot's admiral: Claude Haiku through the website, asked every four seconds; silent (the bot's own instinct commands) in the check or when the website cannot answer
const mind = SIM || !/^https?:/.test(location.protocol) ? null : (obs) => fetch('/space/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(obs) }).then(r => r.json());
function newGame() { G.sim = new Sim(G.peer ? (G.me ? [G.peerFac, G.fac] : [G.fac, G.peerFac]) : G.me ? [1 - G.fac, G.fac] : [G.fac, 1 - G.fac]); G.view.reset(); G.view.me = G.me; G.state = 'play'; G.over = false; G.paused = false; G.acc = 0; place(); banner.set('BATTLE STATIONS', '#ffffff', 2.5); firstGuide(); }
function firstGuide() { if (SIM && !Q.has('guide')) return; let seen = false; try { seen = !!localStorage.getItem('spaceGuide'); } catch (e) {} if (!seen || Q.has('guide')) guide.start(); }
// pause: the battle stops for both players; you can still look round, move the field and give orders
function setPause(on) { if (G.state !== 'play' || G.over) on = false; G.paused = on; if (G.net && G.host && G.peer) G.net.send({ t: 'ps', on: on ? 1 : 0 }); banner.set(on ? 'PAUSED\nclick a thumbstick to go on' : ''); if (on) guide.mark('paused'); sfx('ui_click', null, 0.6); }
function solo(note) { if (G.net) { G.net.close(); G.net = null; } G.host = false; G.peer = false; G.me = 0; newGame(); G.bots = [new Bot(G.sim, 1, mind)]; if (note) banner.set(note, '#ffd766', 3); }
function online() {
  G.state = 'wait'; G.sim = null; G.bots = []; G.view.reset(); banner.set('WAITING FOR AN OPPONENT\nthe battle starts when they join');
  G.net = new Net({
    welcome: (m) => { G.host = m.slot === 0; G.me = m.slot ? 1 : 0; G.view.me = G.me; place(); if (!G.host) G.net.send({ t: 'f', f: G.fac }); },
    'peer-join': () => { if (!G.host) G.net.send({ t: 'f', f: G.fac }); },
    f: (m) => { if (!G.host || (G.peer && G.sim && !G.over)) return; G.peer = true; G.peerFac = m.f ? 1 : 0; G.bots = []; newGame(); },   // the other player is in, flying this navy: the battle starts
    'peer-leave': () => { if (G.host) { G.peer = false; if (G.sim && !G.over) { G.bots = [new Bot(G.sim, 1, mind)]; banner.set('OPPONENT LEFT\nthe bot takes their fleet', '#ffd766', 4); } } else takeover(); },
    s: (m) => { if (G.host) return; const o = read(m.a); if (!o) return; if (G.state !== 'play') { G.view.reset(); G.view.me = G.me; G.state = 'play'; G.over = false; place(); banner.set('BATTLE STATIONS', '#ffffff', 2.5); firstGuide(); } if (G.over && o.winner < 0) { G.over = false; G.view.reset(); } G.view.apply(o, gnow()); },
    p: () => { if (G.host && G.peer) setPause(!G.paused); },
    ps: (m) => { if (G.host) return; G.paused = !!m.on; banner.set(G.paused ? 'PAUSED\nclick a thumbstick to go on' : ''); },
    o: (m) => { if (G.host && G.sim && G.peer) G.sim.order(1, m.ids, m.k, m.p, m.tid, m.a, m.m); },
    m: (m) => { if (G.host && G.sim && G.peer) G.sim.stance(1, m.ids, m.m); },
    b: (m) => { if (G.host && G.sim && G.peer) G.sim.build(1, m.u); },
    again: () => { if (G.host && G.over) newGame(); },
    full: () => solo('THE ROOM IS FULL\nyou play the bot'),
    down: () => { if (G.state === 'wait') solo('NO LINE TO THE ROOM\nyou play the bot'); else if (!G.host) takeover(); else if (G.sim && G.peer) { G.peer = false; G.bots = [new Bot(G.sim, 1, mind)]; } },
  });
  G.net.connect({ local: Q.has('local'), slot: Q.get('slot') });
}
// the host is gone: carry the battle on here from the last picture, the bot in their place
function takeover() { G.paused = false; if (G.sim) return; const n = G.net; G.net = null; n && n.close(); if (G.state !== 'play' || G.over) return solo('OPPONENT LEFT\nyou play the bot'); G.sim = Sim.from(G.view); G.bots = [new Bot(G.sim, 1 - G.me, mind)]; banner.set('OPPONENT LEFT\nthe bot takes their fleet', '#ffd766', 4); }
function step(dt, now) {
  if (!G.sim || G.paused) return; G.acc = Math.min(G.acc + dt * FAST, DT * 3 * FAST); const hold = guide.on && guide.i < 6 && !G.peer;   // the bot waits while you are shown the first things
  while (G.acc >= DT) { G.acc -= DT; if (!hold) for (const b of G.bots) b.step(); G.sim.step(); const a = G.sim.snap(); G.view.apply(read(a), now); if (G.net && G.host && G.peer) G.net.send({ t: 's', a }); }
}
const cmd = {
  // add: after what those ships are already doing (their mission grows); without it, in its place
  order(ids, k, p, tid, add, mode = G.mode) { if (!ids.length || G.state !== 'play' || G.over) return; const P = p ? [p.x, p.y, p.z] : [0, 0, 0]; if (G.sim) G.sim.order(G.me, ids, k, P, tid | 0, add, mode); else G.net && G.net.send({ t: 'o', ids: ids.slice(0, 40), k, p: P, tid: tid | 0, a: add ? 1 : 0, m: mode });
    const tg = k ? G.view.units.get(tid) : null, at = tg ? tg.pos : p; if (at) { G.view.order(ids, at, !!tg, add, tid | 0, gnow()); sfx('order', world(at), 0.5, 1, 120); } guide.mark(k ? 'attacked' : 'ordered'); },
  // how you want ships to go about their orders from now on (0 attack, 1 defend, 2 sneak); the ships you have picked take it up at once
  stance(m) { G.mode = m; guide.mark('mode'); const ids = [...G.view.sel]; if (!ids.length || G.state !== 'play' || G.over) return; if (G.sim) G.sim.stance(G.me, ids, m); else G.net && G.net.send({ t: 'm', ids: ids.slice(0, 40), m }); },
  // pull ships out of the fight: the ones you have picked (all your warships when none are) go back to your mothership and hold there
  home() { const V = G.view; if (!V.sel.size) cmd.all(); let mz = 0; for (const u of V.units.values()) if (u.type === MOTHER && u.side === G.me) mz = u.pos.z; cmd.order([...V.sel], 0, new THREE.Vector3(0, 0, mz * 0.6), 0, false, 1); guide.mark('mode'); },
  // drop a ship's mission: it holds where it is
  stop(ids) { for (const id of ids) { const u = G.view.units.get(id); if (u && u.type !== MOTHER) cmd.order([id], 0, u.pos.clone(), 0, false, u.m === 3 ? 2 : u.m); } },
  build(t) { const T = table(G.view.fac[G.me])[t]; if (G.state !== 'play' || G.over || G.view.credits[G.me] < T.cost) return sfx('ui_deny', null, 0.5); if (G.sim) { if (!G.sim.build(G.me, t)) return sfx('ui_deny', null, 0.5); } else G.net && G.net.send({ t: 'b', u: t }); guide.mark('built'); sfx('ui_click', null, 0.6); },
  pause() { if (G.state !== 'play' || G.over) return; if (G.net && !G.host) G.net.send({ t: 'p' }); else setPause(!G.paused); },
  again() { if (!G.over) return; if (G.sim && (!G.net || G.host)) { const b = G.bots.length; newGame(); if (b || !G.peer) G.bots = [new Bot(G.sim, 1 - G.me, mind)]; } else G.net && G.net.send({ t: 'again' }); },
  all() { G.view.sel.clear(); for (const u of G.view.units.values()) if (u.side === G.me && (u.type === FIGHTER || u.type === FRIGATE || u.type === CRUISER)) G.view.sel.add(u.id); if (G.view.sel.size > 1) guide.mark('multi'); sfx('select', null, 0.5); },
};


// ---- where the field sits: an arm's length in front of you, your mothership nearest -------------------------
function place() {
  if (G.placed === G.me) return; G.placed = G.me;
  if (SIM) { arena.position.set(0, 0, 0); arena.rotation.set(0, G.me ? Math.PI : 0, 0); arena.scale.setScalar(1); camera.position.set(1.5, 1.05, 2.35); camera.lookAt(0, -0.1, 0); return fitLight(); }
  camera.getWorldPosition(_v); camera.getWorldDirection(_d); _d.y = 0; if (_d.lengthSq() < 1e-4) _d.set(0, 0, -1); _d.normalize();
  arena.scale.setScalar(0.55); arena.position.copy(_v).addScaledVector(_d, 1.05); arena.position.y = Math.max(0.75, _v.y - 0.4); arena.rotation.set(0, Math.atan2(-_d.x, -_d.z) + (G.me ? Math.PI : 0), 0); fitLight();
}

// ---- hands -------------------------------------------------------------------------------------------------
const ray = new THREE.Raycaster(); ray.layers.enableAll();   // the console is on the lens's sharp layer; the pointer must still reach it
const hands = [0, 1].map((i) => {
  const c = renderer.xr.getController(i), g = renderer.xr.getControllerGrip(i); scene.add(c, g);
  const pos = new Float32Array(18), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false })); lines.frustumCulled = false; lines.visible = false; scene.add(lines);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0x66ff99, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false })); dot.visible = false; scene.add(dot);
  const bub = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.14, depthWrite: false, toneMapped: false })); bub.visible = false; scene.add(bub);
  // a few words at the pointer's end: what you are pointing at and what the trigger will do there
  const tc = document.createElement('canvas'); tc.width = 640; tc.height = 72; const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const tip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.0225), new THREE.MeshBasicMaterial({ map: tt, transparent: true, depthTest: false, toneMapped: false })); tip.renderOrder = 28; tip.visible = false; scene.add(tip);
  for (const m of [lines, dot, bub, tip]) m.layers.set(HUD);
  const h = { i, c, g, pos, lines, dot, bub, tip, tc, tt, said: '', src: null, on: false, mode: null, d: 0.4, t0: 0, id: 0, ui: -1, grip: false, g0: new THREE.Vector3(), o: new THREE.Vector3(), dir: new THREE.Vector3(), cur: new THREE.Vector3(), c0: new THREE.Vector3(), start: new THREE.Vector3(), lo: new THREE.Vector3(), ld: new THREE.Vector3(), lc: new THREE.Vector3(), btn: [false, false, false], onPanel: false, carry: false, off: new THREE.Matrix4() };
  c.addEventListener('connected', (e) => { h.src = e.data; h.on = true; lines.visible = true;  });
  c.addEventListener('disconnected', () => { h.src = null; h.on = false; lines.visible = dot.visible = bub.visible = tip.visible = false; h.mode = null; h.grip = false; regrab(); });
  c.addEventListener('selectstart', () => press(h)); c.addEventListener('selectend', () => release(h));
  // a grip on the console carries the console; anywhere else it takes hold of the field
  c.addEventListener('squeezestart', () => { if (h.onPanel) { h.carry = true; c.updateMatrixWorld(); panel.mesh.updateMatrixWorld(); h.off.copy(c.matrixWorld).invert().multiply(panel.mesh.matrixWorld); buzz(h); return; } h.grip = true; regrab(); });
  c.addEventListener('squeezeend', () => { if (h.carry) { h.carry = false; panel.pinned = true; return; } h.grip = false; regrab(); });
  return h; });
const KIND = ['MOTHERSHIP', 'FIGHTER', 'FRIGATE', 'CRUISER', 'TURRET', 'MINE'], GO = ['GO AND FIGHT', 'GO AND HOLD', 'SNEAK THERE'];
function say(h, text, color) { h.tip.visible = !!text; if (!text) { h.said = ''; return; } h.tip.position.copy(h.cur); h.tip.position.y += 0.028; h.tip.quaternion.copy(camera.getWorldQuaternion(_q)); const d = Math.max(0.5, h.cur.distanceTo(_o)); h.tip.scale.setScalar(d * 1.15);
  if (text === h.said) return; h.said = text; const x = h.tc.getContext('2d'); x.clearRect(0, 0, 640, 72); x.font = 'bold 34px system-ui,sans-serif'; const w = Math.min(620, x.measureText(text).width + 36); x.fillStyle = 'rgba(6,10,18,0.82)'; x.beginPath(); x.roundRect(320 - w / 2, 6, w, 60, 16); x.fill(); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color || '#ffffff'; x.fillText(text, 320, 38, 610); h.tt.needsUpdate = true; }
const buzz = (h, a = 0.4, ms = 25) => { try { h.src?.gamepad?.hapticActuators?.[0]?.pulse(a, ms); } catch {} };
const M0 = new THREE.Matrix4();
function regrab() { arena.updateMatrix(); M0.copy(arena.matrix); for (const h of hands) h.c.getWorldPosition(h.g0); }
function grabWorld() {
  const a = hands.filter(h => h.grip && h.on); if (!a.length) return;
  if (a.length === 1) { a[0].c.getWorldPosition(_v).sub(a[0].g0); _m.makeTranslation(_v.x, _v.y, _v.z).multiply(M0); }
  else { const [p, q] = a; p.c.getWorldPosition(_v); q.c.getWorldPosition(_w); const m0x = (p.g0.x + q.g0.x) / 2, m0y = (p.g0.y + q.g0.y) / 2, m0z = (p.g0.z + q.g0.z) / 2;
    const d0 = Math.max(0.05, p.g0.distanceTo(q.g0)), d1 = Math.max(0.05, _v.distanceTo(_w)), s0 = _d.setFromMatrixScale(M0).x, s = THREE.MathUtils.clamp(s0 * d1 / d0, 0.15, 14) / s0, yaw = Math.atan2(_w.x - _v.x, _w.z - _v.z) - Math.atan2(q.g0.x - p.g0.x, q.g0.z - p.g0.z);
    _m.makeTranslation((_v.x + _w.x) / 2, (_v.y + _w.y) / 2, (_v.z + _w.z) / 2).multiply(_m2.makeRotationY(yaw)).multiply(_m2.makeScale(s, s, s)).multiply(_m2.makeTranslation(-m0x, -m0y, -m0z)).multiply(M0); }
  _m.decompose(arena.position, arena.quaternion, arena.scale); fitLight(); if (_v.copy(arena.position).applyMatrix4(_m2.copy(M0).invert()).lengthSq() > 0.0004) guide.mark('moved');
}
function press(h) {
  if (h.onPanel && h.ui < 0) return;   // on the console but between its buttons: nothing, and not a bubble behind it
  if (h.ui >= 0) { const b = panel.btn[h.ui]; buzz(h, 0.8, 40); panel.press(h.ui); G.last = 0; if (!b) return; if (b.id === 'ar') { if (G.canAR) { setView(!G.ar); sfx('ui_click', null, 0.6); } else sfx('ui_deny', null, 0.5); } else if (b.id === 'all') cmd.all(); else if (b.id === 'pause') cmd.pause(); else if (b.id[0] === 'm') { cmd.stance(+b.id[1]); sfx('ui_click', null, 0.6); } else if (b.id === 'home') cmd.home(); else if (b.id === 'guide') { sfx('ui_click', null, 0.6); if (guide.on) guide.stop(); else guide.start(); } else if (b.id === 'fx') { G.fx = !G.fx; try { localStorage.setItem('spaceLens', G.fx ? '1' : '0'); } catch (e) {} post.rest(); sfx('ui_click', null, 0.6); } else if (b.id === 'x') { sfx('ui_click', null, 0.6); if (G.state === 'wait') solo(); else cmd.again(); } else cmd.build(+b.id.slice(1)); return; }
  guide.mark('go'); if (G.state !== 'play') return; const V = G.view, u = V.units.get(V.hover[h.i]);
  if (u && u.side === G.me) { if (h.tap === u.id && performance.now() - h.t0 < 450) { h.tap = 0; cmd.stop(V.sel.has(u.id) ? [...V.sel] : [u.id]); buzz(h, 0.8, 60); return; } h.tap = u.id; if (!V.sel.has(u.id)) { V.sel.clear(); V.sel.add(u.id); } h.mode = 'drag'; h.id = u.id; h.d = world(u.pos).distanceTo(h.o); h.t0 = performance.now(); h.c0.copy(h.o).addScaledVector(h.dir, h.d); buzz(h); sfx('select', world(u.pos), 0.6); }
  else if (u && V.sel.size) { cmd.order([...V.sel], 1, null, u.id, true); buzz(h, 0.7, 40); }
  else { h.mode = 'marq'; h.d = THREE.MathUtils.clamp(_v.copy(arena.position).sub(h.o).dot(h.dir), 0.25, 3); h.start.copy(h.o).addScaledVector(h.dir, h.d); arena.worldToLocal(h.start); }
}
function release(h) {

  const V = G.view, mode = h.mode; h.mode = null; h.dot.visible = h.bub.visible = false; if (!mode || G.state !== 'play') return;
  if (mode === 'drag') { if (performance.now() - h.t0 < 300 && h.cur.distanceTo(h.c0) < 0.04) return; const ids = [...V.sel], foe = V.near(h.lc, 1 - G.me, 0.03 / arena.scale.x);
    if (foe) cmd.order(ids, 1, null, foe, true); else cmd.order(ids, 0, h.lc.clone(), 0, true); buzz(h, 0.7, 40); }
  else { const r = h.lc.distanceTo(h.start) / 2; V.sel.clear(); if (r * arena.scale.x < 0.03) return; _v.addVectors(h.lc, h.start).multiplyScalar(0.5);
    for (const u of V.units.values()) if (u.side === G.me && u.type !== MOTHER && u.pos.distanceTo(_v) < r + TYPES[u.type].r) V.sel.add(u.id); if (V.sel.size) { sfx('select', null, 0.6); buzz(h); if (V.sel.size > 1) guide.mark('multi'); } }
}
function hand(h, dt) {
  if (!h.on) return; const V = G.view, s = arena.scale.x, P = h.pos; h.c.getWorldPosition(h.o); h.c.getWorldQuaternion(_q); h.dir.set(0, 0, -1).applyQuaternion(_q);
  const gp = h.src && h.src.gamepad; if (gp) { const a = !!(gp.buttons[4] && gp.buttons[4].pressed), b = !!(gp.buttons[5] && gp.buttons[5].pressed); if (a && !h.btn[0]) { if (G.canAR) setView(!G.ar); } if (b && !h.btn[1]) cmd.all(); const k = !!(gp.buttons[3] && gp.buttons[3].pressed); if (k && !h.btn[2]) cmd.pause(); h.btn[0] = a; h.btn[1] = b; h.btn[2] = k;
    // thumbsticks when not holding a ship: the right one zooms on what you point at (up/down) and turns the field (left/right), the left one flies you through it
    if (!h.mode && gp.axes.length > 3 && G.state !== 'lobby') { const ax = Math.abs(gp.axes[2]) > 0.2 ? gp.axes[2] : 0, ay = Math.abs(gp.axes[3]) > 0.2 ? gp.axes[3] : 0;
      if (ax || ay) { if (h.src.handedness === 'left') { const sp = 0.7 * Math.max(1, s) * dt; arena.position.x += (G.fwd.x * ay + G.fwd.z * ax) * sp; arena.position.z += (G.fwd.z * ay - G.fwd.x * ax) * sp; }
        else { const s1 = THREE.MathUtils.clamp(s * Math.exp(-ay * dt * 1.5), 0.15, 14), f = s1 / s; arena.position.sub(h.cur).multiplyScalar(f).add(h.cur); arena.scale.setScalar(s1); arena.rotateY(-ax * dt * 1.2); }
        fitLight(); guide.mark('moved'); if (hands.some(x => x.grip)) regrab(); } }
    if (h.mode && gp.axes.length > 3 && Math.abs(gp.axes[3]) > 0.15) h.d = THREE.MathUtils.clamp(h.d - gp.axes[3] * dt * 1.3, 0.08, 5); }
  // the panel, then the field
  h.ui = -1; h.onPanel = false; let len = 0.35;
  if (h.carry) { h.c.updateMatrixWorld(); _m.multiplyMatrices(h.c.matrixWorld, h.off).decompose(panel.mesh.position, panel.mesh.quaternion, _v); panel.t.copy(panel.mesh.position); }
  else if (!h.mode) { ray.set(h.o, h.dir); ray.far = 2.5; const hit = ray.intersectObject(panel.mesh, false)[0]; if (hit && hit.uv) { h.onPanel = true; h.ui = panel.at(hit.uv); len = hit.distance; } }
  arena.worldToLocal(h.lo.copy(h.o)); _q.copy(arena.quaternion).invert(); h.ld.copy(h.dir).applyQuaternion(_q);
  V.hover[h.i] = !h.mode && !h.onPanel && !h.carry && G.state === 'play' ? V.pick(h.lo, h.ld, s, 4 / s) : 0;
  if (V.hover[h.i] && !h.mode) { const u = V.units.get(V.hover[h.i]); len = world(u.pos).distanceTo(h.o); if (u.side === G.me) guide.mark('hover'); }
  h.cur.copy(h.o).addScaledVector(h.dir, h.mode ? h.d : len); arena.worldToLocal(h.lc.copy(h.cur));
  P[0] = h.o.x; P[1] = h.o.y; P[2] = h.o.z; P[3] = h.cur.x; P[4] = h.cur.y; P[5] = h.cur.z; for (let k = 6; k < 18; k++) P[k] = 0;
  if (h.mode === 'drag') { const u = V.units.get(h.id); if (!u) { h.mode = null; h.dot.visible = false; } else {
      h.lc.set(THREE.MathUtils.clamp(h.lc.x, -BX, BX), THREE.MathUtils.clamp(h.lc.y, -BY, BY), THREE.MathUtils.clamp(h.lc.z, -BZ, BZ)); world(h.lc); const foe = V.near(h.lc, 1 - G.me, 0.03 / s); V.hover[h.i] = foe;
      h.dot.visible = true; h.dot.position.copy(_w); h.dot.scale.setScalar(0.008); h.dot.material.color.set(foe ? 0xff4030 : [0x66ff99, 0x66aaff, 0xc080ff][G.mode]);
      P[6] = _w.x; P[7] = _w.y; P[8] = _w.z; world(u.pos); P[9] = _w.x; P[10] = _w.y; P[11] = _w.z;
      world(h.lc); P[12] = _w.x; P[13] = _w.y; P[14] = _w.z; world(_v.set(h.lc.x, 0, h.lc.z)); P[15] = _w.x; P[16] = _w.y; P[17] = _w.z; } }
  else if (h.onPanel) { h.dot.visible = true; h.dot.position.copy(h.cur); h.dot.scale.setScalar(0.007); h.dot.material.color.set(h.ui >= 0 ? 0xffffff : 0x8090a8); }
  else if (h.mode === 'marq') { _v.addVectors(h.lc, h.start).multiplyScalar(0.5); const r = h.lc.distanceTo(h.start) / 2; world(_v); h.bub.visible = r * s > 0.01; h.bub.position.copy(_w); h.bub.scale.setScalar(r * s); }
  if (!h.mode && !h.onPanel) h.dot.visible = false;
  // the words
  if (G.state !== 'play' || G.over || h.onPanel || h.carry) say(h, '');
  else if (h.mode === 'drag') { const foe = V.units.get(V.hover[h.i]); say(h, foe ? 'LET GO: ATTACK THE ' + KIND[foe.type] : 'LET GO: ' + GO[G.mode], foe ? '#ff7a66' : ['#7dffae', '#8cc0ff', '#d0a0ff'][G.mode]); }
  else if (h.mode === 'marq') say(h, h.bub.visible ? 'LET GO: PICK WHAT IS INSIDE' : 'DRAG TO PICK SHIPS', '#8cd8ff');
  else { const u = V.units.get(V.hover[h.i]); if (!u) say(h, ''); else if (u.side === G.me) say(h, u.type === MOTHER ? 'YOUR MOTHERSHIP ' + Math.round(u.hp * 100) + '%' : KIND[u.type] + ' ' + Math.round(u.hp * 100) + '%  \u2014  HOLD AND DRAG TO SEND' + (V.sel.size > 1 && V.sel.has(u.id) ? ' ALL ' + V.sel.size : ''), '#ffffff');
    else say(h, V.sel.size ? 'TRIGGER: ATTACK THE ' + KIND[u.type] : 'ENEMY ' + KIND[u.type] + '  \u2014  PICK YOUR SHIPS FIRST', '#ff7a66'); }
  h.lines.geometry.attributes.position.needsUpdate = true;
}

// ---- what the battle's happenings sound and feel like ---------------------------------------------------------
function wire(V) { V.onEvent = (kind, a, b) => {
  if (kind === 'shot') sfx(b === 0 ? (Math.random() < 0.5 ? 'gun' : 'gun2') : b === 1 ? 'cannon' : 'beam', world(a.pos), b === 0 ? 0.35 : b === 1 ? 0.5 : 0.8, 1, b === 0 ? 60 : 90);
  else if (kind === 'hit') sfx(Math.random() < 0.5 ? 'hit' : 'hit2', world(a), b === 2 ? 0.5 : 0.25, 1, 110);
  else if (kind === 'boom') { sfx(['boom_s', 'boom_m', 'boom_l', 'boom_xl', 'mine'][b], world(a.pos), 0.7 + Math.min(b, 3) * 0.2, 1, 60); if (b >= 2) for (const h of hands) buzz(h, b === 3 ? 1 : 0.6, b === 3 ? 400 : 120); }
  else if (kind === 'field') sfx('hit2', world(a), 0.3, 1.7, 120);
  else if (kind === 'warp') sfx('build', world(a), 0.6, 1.3, 100);
  else if (kind === 'pop') sfx('boom_s', world(a), 0.6, 0.8, 80);
  else if (kind === 'relay') { sfx(a === G.me ? 'capture' : 'lost', null, 0.55); banner.set(a === G.me ? 'RELAY TAKEN' : 'RELAY LOST', a === G.me ? '#6fe0a0' : '#ff8a6a', 1.8); } }; }

// ---- every frame -------------------------------------------------------------------------------------------------
let prev = 0;
function frame(time) {
  const real = performance.now(), dt = Math.min(0.05, (time - prev) / 1000 || 0.011); if (G.paused) G.tOff += Math.max(0, time - prev) || 0; prev = time; const now = gnow(), V = G.view; if (!V) return renderer.render(scene, camera);
  if (G.state !== 'lobby') { step(dt, now); { grabWorld(); for (const h of hands) hand(h, dt); panel.hot = hands[0].on ? hands[0].ui : -1; panel.hot2 = hands[1].on ? hands[1].ui : -1; } }
  V.draw(now, G.paused ? 0 : dt, camera);
  // the end, the alarm, the engines' voice
  if (G.state === 'play' && V.winner >= 0 && !G.over) { G.over = true; const won = V.winner === G.me; banner.set(V.winner === 2 ? 'DRAW' : won ? 'VICTORY' : 'DEFEAT', won ? '#6fe0a0' : '#ff6a5a'); sfx(won ? 'win' : 'lose', null, 0.8); }
  let thr = 0, n = 0, mine = 0; for (const u of V.units.values()) { thr += u.thr; n++; if (u.side === G.me && u.type !== MOTHER) mine++; if (u.type === MOTHER && u.side === G.me && now - u.hit < 300 && now - G.alarm > 14000 && !G.over) { G.alarm = now; sfx('alarm', null, 0.5); banner.set('MOTHERSHIP UNDER ATTACK', '#ff6a5a', 2.5); } }
  loop('engine', n ? 0.06 + 0.2 * thr / n : 0); loop('ambience', G.state === 'lobby' ? 0 : 0.3);
  camera.getWorldPosition(_o); camera.getWorldDirection(_d); _up.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(_q)); listen({ position: _o }, _d, _up);
  shell.position.copy(_o); G.fwd.copy(_d).setY(0); if (G.fwd.lengthSq() < 1e-4) G.fwd.set(0, 0, -1); G.fwd.normalize(); guide.tick(real, _o, G.fwd); panel.mesh.visible = G.state !== 'lobby'; if (G.state !== 'lobby' && !hands.some(h => h.carry)) panel.follow(_o, G.fwd, dt, hands.some(h => h.on && h.onPanel));
  banner.tick(real); banner.mesh.position.copy(arena.position); banner.mesh.position.y += 0.62 * arena.scale.x; banner.mesh.scale.setScalar(Math.max(0.6, arena.scale.x * 1.6)); banner.mesh.lookAt(_o);
  if (real - G.last > 150) { G.last = real; panel.draw({ credits: V.credits[G.me], income: V.income[G.me], count: mine, queue: V.queue[G.me] || [], me: G.me, col: V.ci(G.me), mode: G.mode, picked: V.sel.size, ar: G.ar, canAR: G.canAR, state: G.over ? 'over' : G.state, costs: table(V.fac[G.me]), paused: G.paused, fx: G.fx, guide: guide.on, extra: G.state === 'wait' ? 'PLAY THE BOT' : G.over ? 'PLAY AGAIN' : '' }); }
  // open space goes through the lens, focused on the ship nearest the middle of your sight (the field's middle when there is none); your room does not
  if (!G.ar && G.fx) { let best = 0.9, f = Math.max(0.3, _v.copy(arena.position).sub(_o).length()); for (const u of V.units.values()) { world(u.pos).sub(_o); const d = _w.length(), c = _w.dot(_d) / (d || 1); if (c > best) { best = c; f = d; } } post.render(scene, camera, f); }
  else renderer.render(scene, camera);
}

// ---- the page, and into the headset -------------------------------------------------------------------------------
async function enter(two) {
  const st = $('status'); initAudio(BASE); let kind = 'immersive-ar';
  if (!(await navigator.xr.isSessionSupported(kind).catch(() => false))) kind = 'immersive-vr';
  let session; try { session = await navigator.xr.requestSession(kind, { requiredFeatures: ['local-floor'] }); } catch (e) { st.textContent = 'The headset did not start: ' + e.message; return; }
  G.canAR = kind === 'immersive-ar'; setView(G.canAR); await renderer.xr.setSession(session); $('lobby').classList.add('hidden');
  try { const r = session.supportedFrameRates; if (r && session.updateTargetFrameRate) session.updateTargetFrameRate(Array.from(r).includes(90) ? 90 : Math.max(...r)); } catch {}
  G.placed = -1; G.state = 'wait'; setTimeout(() => { if (!renderer.xr.isPresenting) return; place(); if (two) online(); else solo(); }, 350);
  session.addEventListener('end', () => { if (G.net) { G.net.close(); G.net = null; } G.sim = null; G.bots = []; G.state = 'lobby'; G.paused = false; guide.on = false; guide.mesh.visible = false; post.rest(); G.view.reset(); banner.set(''); $('lobby').classList.remove('hidden'); });
}
(async () => {
  const st = $('status'), two = $('two'), bot = $('bot'); let models;
  try { models = await loadModels((f) => { st.textContent = 'Loading the fleet... ' + Math.round(f * 100) + '%'; }); } catch (e) { st.textContent = 'The fleet did not load: ' + e.message; return; }
  G.view = new View(arena, models, scene); wire(G.view); G.state = 'lobby'; fitLight(); setView(false); renderer.setAnimationLoop(frame);
  if (SIM) { $('lobby').classList.add('hidden'); G.state = 'wait'; G.placed = -1; if (Q.has('local')) online(); else { solo(); if (Q.has('watch')) G.bots.push(new Bot(G.sim, 0)); } window.__space = { G, cmd, arena, camera, hands, panel, banner, guide, post, setView, setPause, TYPES, LEN, sun, scene, renderer, cosmos: () => cosmos}; return; }
  const ok = navigator.xr && ((await navigator.xr.isSessionSupported('immersive-ar').catch(() => false)) || (await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)));
  if (!ok) { st.textContent = 'Open this page in the browser of a Meta Quest headset.'; return; }
  for (const f of [0, 1]) $('navy' + f).onclick = () => { G.fac = f; $('navy0').classList.toggle('on', !f); $('navy1').classList.toggle('on', !!f); }; $('navy' + G.fac).click();
  st.textContent = ''; two.disabled = bot.disabled = false; two.onclick = () => enter(true); bot.onclick = () => enter(false); window.__space = { G, cmd, arena, camera, hands, panel, banner, guide, post, setView, setPause};
})();
