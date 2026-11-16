// SPACE FLEET: a fleet battle on a field that floats in your room (passthrough) or in open space, for a Quest headset in its browser; two players, or one against the bot. This file is the headset, the hands, the lights and the glue; the battle is sim.js, its picture view.js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sim, read, table, NAVY, TYPES, DT, MOTHER, FIGHTER, FRIGATE, CRUISER, BX, BY, BZ } from './sim.js';
import { Bot } from './bot.js';
import { View, loadModels, BASE, LEN } from './view.js';
import { Panel, Banner } from './hud.js';
import { buildCosmos } from './cosmos.js';
import { Net } from './net.js';
import { initAudio, sfx, loop, listen } from './audio.js';

const $ = (id) => document.getElementById(id), Q = new URLSearchParams(location.search), SIM = Q.has('sim'), FAST = SIM ? +Q.get('fast') || 1 : 1;   // ?sim: the check's way in, no headset; ?fast=n runs the battle n times as fast
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(0.7);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.02, 5000); scene.add(camera);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// the field: everything of the battle is inside this group, which your grips move, turn and size
const arena = new THREE.Group(); scene.add(arena);
// one hard sun, fixed in the sky (turn the field and the shadows turn on the hulls), and a little fill
const SUN = new THREE.Vector3(0.55, 0.62, 0.56).normalize(), sun = new THREE.DirectionalLight(0xfff4e6, 3.6), fill = new THREE.HemisphereLight(0x8fa8d0, 0x1a1410, 0.1);
const rim = new THREE.DirectionalLight(0x6f9cff, 0.55); scene.add(rim, rim.target); sun.castShadow = true; sun.shadow.mapSize.set(SIM ? 2048 : 1024, SIM ? 2048 : 1024); scene.add(sun, sun.target, fill);
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
const panel = new Panel(), banner = new Banner(); scene.add(banner.mesh);
const G = { state: 'load', me: 0, sim: null, bots: [], view: null, net: null, host: false, peer: false, acc: 0, ar: false, canAR: false, over: false, placed: -1, alarm: 0, last: 0, fac: Q.get('navy') === '1' ? 1 : 0, peerFac: 1 };
function setView(ar) { G.ar = ar && G.canAR; space.visible = !G.ar; fill.intensity = G.ar ? 0.7 : 0.1; scene.environmentIntensity = G.ar ? 0.8 : 0.4; if (SIM) scene.background = null; }
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _d = new THREE.Vector3(), _o = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _up = new THREE.Vector3();
const world = (p) => arena.localToWorld(_w.copy(p));

// ---- the battle: run here (alone, or as the host of two) or followed from the host's pictures --------------
// the bot's admiral: Claude Haiku through the website, asked every four seconds; silent (the bot's own instinct commands) in the check or when the website cannot answer
const mind = SIM || !/^https?:/.test(location.protocol) ? null : (obs) => fetch('/space/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(obs) }).then(r => r.json());
function newGame() { G.sim = new Sim(G.peer ? (G.me ? [G.peerFac, G.fac] : [G.fac, G.peerFac]) : G.me ? [1 - G.fac, G.fac] : [G.fac, 1 - G.fac]); G.view.reset(); G.view.me = G.me; G.state = 'play'; G.over = false; G.acc = 0; place(); banner.set('BATTLE STATIONS', '#ffffff', 2.5); }
function solo(note) { if (G.net) { G.net.close(); G.net = null; } G.host = false; G.peer = false; G.me = 0; newGame(); G.bots = [new Bot(G.sim, 1, mind)]; if (note) banner.set(note, '#ffd766', 3); }
function online() {
  G.state = 'wait'; G.sim = null; G.bots = []; G.view.reset(); banner.set('WAITING FOR AN OPPONENT\nthe battle starts when they join');
  G.net = new Net({
    welcome: (m) => { G.host = m.slot === 0; G.me = m.slot ? 1 : 0; G.view.me = G.me; place(); if (!G.host) G.net.send({ t: 'f', f: G.fac }); },
    'peer-join': () => { if (!G.host) G.net.send({ t: 'f', f: G.fac }); },
    f: (m) => { if (!G.host || (G.peer && G.sim && !G.over)) return; G.peer = true; G.peerFac = m.f ? 1 : 0; G.bots = []; newGame(); },   // the other player is in, flying this navy: the battle starts
    'peer-leave': () => { if (G.host) { G.peer = false; if (G.sim && !G.over) { G.bots = [new Bot(G.sim, 1, mind)]; banner.set('OPPONENT LEFT\nthe bot takes their fleet', '#ffd766', 4); } } else takeover(); },
    s: (m) => { if (G.host) return; const o = read(m.a); if (!o) return; if (G.state !== 'play') { G.view.reset(); G.view.me = G.me; G.state = 'play'; G.over = false; place(); banner.set('BATTLE STATIONS', '#ffffff', 2.5); } if (G.over && o.winner < 0) { G.over = false; G.view.reset(); } G.view.apply(o, performance.now()); },
    o: (m) => { if (G.host && G.sim && G.peer) G.sim.order(1, m.ids, m.k, m.p, m.tid); },
    b: (m) => { if (G.host && G.sim && G.peer) G.sim.build(1, m.u); },
    again: () => { if (G.host && G.over) newGame(); },
    full: () => solo('THE ROOM IS FULL\nyou play the bot'),
    down: () => { if (G.state === 'wait') solo('NO LINE TO THE ROOM\nyou play the bot'); else if (!G.host) takeover(); else if (G.sim && G.peer) { G.peer = false; G.bots = [new Bot(G.sim, 1, mind)]; } },
  });
  G.net.connect({ local: Q.has('local'), slot: Q.get('slot') });
}
// the host is gone: carry the battle on here from the last picture, the bot in their place
function takeover() { if (G.sim) return; const n = G.net; G.net = null; n && n.close(); if (G.state !== 'play' || G.over) return solo('OPPONENT LEFT\nyou play the bot'); G.sim = Sim.from(G.view); G.bots = [new Bot(G.sim, 1 - G.me, mind)]; banner.set('OPPONENT LEFT\nthe bot takes their fleet', '#ffd766', 4); }
function step(dt, now) {
  if (!G.sim) return; G.acc = Math.min(G.acc + dt * FAST, DT * 3 * FAST);
  while (G.acc >= DT) { G.acc -= DT; for (const b of G.bots) b.step(); G.sim.step(); const a = G.sim.snap(); G.view.apply(read(a), now); if (G.net && G.host && G.peer) G.net.send({ t: 's', a }); }
}
const cmd = {
  order(ids, k, p, tid) { if (!ids.length || G.state !== 'play' || G.over) return; const P = p ? [p.x, p.y, p.z] : [0, 0, 0]; if (G.sim) G.sim.order(G.me, ids, k, P, tid | 0); else G.net && G.net.send({ t: 'o', ids: ids.slice(0, 40), k, p: P, tid: tid | 0 });
    const tg = k ? G.view.units.get(tid) : null; G.view.order(ids, tg ? tg.pos : p, !!tg); sfx('order', world(tg ? tg.pos : p), 0.5, 1, 120); },
  build(t) { const T = table(G.view.fac[G.me])[t]; if (G.state !== 'play' || G.over || G.view.credits[G.me] < T.cost) return sfx('ui_deny', null, 0.5); if (G.sim) { if (!G.sim.build(G.me, t)) return sfx('ui_deny', null, 0.5); } else G.net && G.net.send({ t: 'b', u: t }); sfx('ui_click', null, 0.6); },
  again() { if (!G.over) return; if (G.sim && (!G.net || G.host)) { const b = G.bots.length; newGame(); if (b || !G.peer) G.bots = [new Bot(G.sim, 1 - G.me, mind)]; } else G.net && G.net.send({ t: 'again' }); },
  all() { G.view.sel.clear(); for (const u of G.view.units.values()) if (u.side === G.me && (u.type === FIGHTER || u.type === FRIGATE || u.type === CRUISER)) G.view.sel.add(u.id); sfx('select', null, 0.5); },
};

// ---- where the field sits: an arm's length in front of you, your mothership nearest -------------------------
function place() {
  if (G.placed === G.me) return; G.placed = G.me;
  if (SIM) { arena.position.set(0, 0, 0); arena.rotation.set(0, G.me ? Math.PI : 0, 0); arena.scale.setScalar(1); camera.position.set(1.5, 1.05, 2.35); camera.lookAt(0, -0.1, 0); return fitLight(); }
  camera.getWorldPosition(_v); camera.getWorldDirection(_d); _d.y = 0; if (_d.lengthSq() < 1e-4) _d.set(0, 0, -1); _d.normalize();
  arena.scale.setScalar(0.55); arena.position.copy(_v).addScaledVector(_d, 1.05); arena.position.y = Math.max(0.75, _v.y - 0.4); arena.rotation.set(0, Math.atan2(-_d.x, -_d.z) + (G.me ? Math.PI : 0), 0); fitLight();
}

// ---- hands -------------------------------------------------------------------------------------------------
const ray = new THREE.Raycaster(), hands = [0, 1].map((i) => {
  const c = renderer.xr.getController(i), g = renderer.xr.getControllerGrip(i); scene.add(c, g);
  const pos = new Float32Array(18), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false })); lines.frustumCulled = false; lines.visible = false; scene.add(lines);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0x66ff99, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false })); dot.visible = false; scene.add(dot);
  const bub = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.14, depthWrite: false, toneMapped: false })); bub.visible = false; scene.add(bub);
  const h = { i, c, g, pos, lines, dot, bub, src: null, on: false, mode: null, d: 0.4, t0: 0, id: 0, ui: -1, grip: false, g0: new THREE.Vector3(), o: new THREE.Vector3(), dir: new THREE.Vector3(), cur: new THREE.Vector3(), c0: new THREE.Vector3(), start: new THREE.Vector3(), lo: new THREE.Vector3(), ld: new THREE.Vector3(), lc: new THREE.Vector3(), btn: [false, false] };
  c.addEventListener('connected', (e) => { h.src = e.data; h.on = true; lines.visible = true; if (e.data.handedness === 'left') g.add(panel.mesh); });
  c.addEventListener('disconnected', () => { h.src = null; h.on = false; lines.visible = dot.visible = bub.visible = false; h.mode = null; h.grip = false; regrab(); });
  c.addEventListener('selectstart', () => press(h)); c.addEventListener('selectend', () => release(h));
  c.addEventListener('squeezestart', () => { h.grip = true; regrab(); }); c.addEventListener('squeezeend', () => { h.grip = false; regrab(); });
  return h; });
const buzz = (h, a = 0.4, ms = 25) => { try { h.src?.gamepad?.hapticActuators?.[0]?.pulse(a, ms); } catch {} };
const M0 = new THREE.Matrix4();
function regrab() { arena.updateMatrix(); M0.copy(arena.matrix); for (const h of hands) h.c.getWorldPosition(h.g0); }
function grabWorld() {
  const a = hands.filter(h => h.grip && h.on); if (!a.length) return;
  if (a.length === 1) { a[0].c.getWorldPosition(_v).sub(a[0].g0); _m.makeTranslation(_v.x, _v.y, _v.z).multiply(M0); }
  else { const [p, q] = a; p.c.getWorldPosition(_v); q.c.getWorldPosition(_w); const m0x = (p.g0.x + q.g0.x) / 2, m0y = (p.g0.y + q.g0.y) / 2, m0z = (p.g0.z + q.g0.z) / 2;
    const d0 = Math.max(0.05, p.g0.distanceTo(q.g0)), d1 = Math.max(0.05, _v.distanceTo(_w)), s0 = _d.setFromMatrixScale(M0).x, s = THREE.MathUtils.clamp(s0 * d1 / d0, 0.2, 5) / s0, yaw = Math.atan2(_w.x - _v.x, _w.z - _v.z) - Math.atan2(q.g0.x - p.g0.x, q.g0.z - p.g0.z);
    _m.makeTranslation((_v.x + _w.x) / 2, (_v.y + _w.y) / 2, (_v.z + _w.z) / 2).multiply(_m2.makeRotationY(yaw)).multiply(_m2.makeScale(s, s, s)).multiply(_m2.makeTranslation(-m0x, -m0y, -m0z)).multiply(M0); }
  _m.decompose(arena.position, arena.quaternion, arena.scale); fitLight();
}
function press(h) {
  if (h.ui >= 0) { const b = panel.btn[h.ui]; buzz(h); if (!b) return; if (b.id === 'ar') { if (G.canAR) { setView(!G.ar); sfx('ui_click', null, 0.6); } else sfx('ui_deny', null, 0.5); } else if (b.id === 'all') cmd.all(); else if (b.id === 'x') { sfx('ui_click', null, 0.6); if (G.state === 'wait') solo(); else cmd.again(); } else cmd.build(+b.id.slice(1)); return; }
  if (G.state !== 'play') return; const V = G.view, u = V.units.get(V.hover[h.i]);
  if (u && u.side === G.me) { if (!V.sel.has(u.id)) { V.sel.clear(); V.sel.add(u.id); } h.mode = 'drag'; h.id = u.id; h.d = world(u.pos).distanceTo(h.o); h.t0 = performance.now(); h.c0.copy(h.o).addScaledVector(h.dir, h.d); buzz(h); sfx('select', world(u.pos), 0.6); }
  else if (u && V.sel.size) { cmd.order([...V.sel], 1, null, u.id); buzz(h, 0.7, 40); }
  else { h.mode = 'marq'; h.d = THREE.MathUtils.clamp(_v.copy(arena.position).sub(h.o).dot(h.dir), 0.25, 3); h.start.copy(h.o).addScaledVector(h.dir, h.d); arena.worldToLocal(h.start); }
}
function release(h) {
  const V = G.view, mode = h.mode; h.mode = null; h.dot.visible = h.bub.visible = false; if (!mode || G.state !== 'play') return;
  if (mode === 'drag') { if (performance.now() - h.t0 < 300 && h.cur.distanceTo(h.c0) < 0.04) return; const ids = [...V.sel], foe = V.near(h.lc, 1 - G.me, 0.03 / arena.scale.x);
    if (foe) cmd.order(ids, 1, null, foe); else cmd.order(ids, 0, h.lc.clone()); buzz(h, 0.7, 40); }
  else { const r = h.lc.distanceTo(h.start) / 2; V.sel.clear(); if (r * arena.scale.x < 0.03) return; _v.addVectors(h.lc, h.start).multiplyScalar(0.5);
    for (const u of V.units.values()) if (u.side === G.me && u.type !== MOTHER && u.pos.distanceTo(_v) < r + TYPES[u.type].r) V.sel.add(u.id); if (V.sel.size) { sfx('select', null, 0.6); buzz(h); } }
}
function hand(h, dt) {
  if (!h.on) return; const V = G.view, s = arena.scale.x, P = h.pos; h.c.getWorldPosition(h.o); h.c.getWorldQuaternion(_q); h.dir.set(0, 0, -1).applyQuaternion(_q);
  const gp = h.src && h.src.gamepad; if (gp) { const a = !!(gp.buttons[4] && gp.buttons[4].pressed), b = !!(gp.buttons[5] && gp.buttons[5].pressed); if (a && !h.btn[0]) { if (G.canAR) setView(!G.ar); } if (b && !h.btn[1]) cmd.all(); h.btn[0] = a; h.btn[1] = b;
    if (h.mode && gp.axes.length > 3 && Math.abs(gp.axes[3]) > 0.15) h.d = THREE.MathUtils.clamp(h.d - gp.axes[3] * dt * 1.3, 0.08, 5); }
  // the panel, then the field
  h.ui = -1; let len = 0.35;
  if (!h.mode && panel.mesh.parent && panel.mesh.parent !== h.g) { ray.set(h.o, h.dir); ray.far = 1.5; const hit = ray.intersectObject(panel.mesh, false)[0]; if (hit && hit.uv) { h.ui = panel.at(hit.uv); len = hit.distance; } }
  if (panel.mesh.parent && panel.mesh.parent !== h.g) panel.hot = h.ui;
  arena.worldToLocal(h.lo.copy(h.o)); _q.copy(arena.quaternion).invert(); h.ld.copy(h.dir).applyQuaternion(_q);
  V.hover[h.i] = !h.mode && h.ui < 0 && G.state === 'play' ? V.pick(h.lo, h.ld, s, 4 / s) : 0;
  if (V.hover[h.i] && !h.mode) len = world(V.units.get(V.hover[h.i]).pos).distanceTo(h.o);
  h.cur.copy(h.o).addScaledVector(h.dir, h.mode ? h.d : len); arena.worldToLocal(h.lc.copy(h.cur));
  P[0] = h.o.x; P[1] = h.o.y; P[2] = h.o.z; P[3] = h.cur.x; P[4] = h.cur.y; P[5] = h.cur.z; for (let k = 6; k < 18; k++) P[k] = 0;
  if (h.mode === 'drag') { const u = V.units.get(h.id); if (!u) { h.mode = null; h.dot.visible = false; } else {
      h.lc.set(THREE.MathUtils.clamp(h.lc.x, -BX, BX), THREE.MathUtils.clamp(h.lc.y, -BY, BY), THREE.MathUtils.clamp(h.lc.z, -BZ, BZ)); world(h.lc); const foe = V.near(h.lc, 1 - G.me, 0.03 / s); V.hover[h.i] = foe;
      h.dot.visible = true; h.dot.position.copy(_w); h.dot.scale.setScalar(0.008); h.dot.material.color.set(foe ? 0xff4030 : 0x66ff99);
      P[6] = _w.x; P[7] = _w.y; P[8] = _w.z; world(u.pos); P[9] = _w.x; P[10] = _w.y; P[11] = _w.z;
      world(h.lc); P[12] = _w.x; P[13] = _w.y; P[14] = _w.z; world(_v.set(h.lc.x, 0, h.lc.z)); P[15] = _w.x; P[16] = _w.y; P[17] = _w.z; } }
  else if (h.mode === 'marq') { _v.addVectors(h.lc, h.start).multiplyScalar(0.5); const r = h.lc.distanceTo(h.start) / 2; world(_v); h.bub.visible = r * s > 0.01; h.bub.position.copy(_w); h.bub.scale.setScalar(r * s); }
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
  const now = performance.now(), dt = Math.min(0.05, (time - prev) / 1000 || 0.011); prev = time; const V = G.view; if (!V) return renderer.render(scene, camera);
  if (G.state !== 'lobby') { step(dt, now); grabWorld(); for (const h of hands) hand(h, dt); }
  V.draw(now, dt, camera);
  // the end, the alarm, the engines' voice
  if (G.state === 'play' && V.winner >= 0 && !G.over) { G.over = true; const won = V.winner === G.me; banner.set(V.winner === 2 ? 'DRAW' : won ? 'VICTORY' : 'DEFEAT', won ? '#6fe0a0' : '#ff6a5a'); sfx(won ? 'win' : 'lose', null, 0.8); }
  let thr = 0, n = 0, mine = 0; for (const u of V.units.values()) { thr += u.thr; n++; if (u.side === G.me && u.type !== MOTHER) mine++; if (u.type === MOTHER && u.side === G.me && now - u.hit < 300 && now - G.alarm > 14000 && !G.over) { G.alarm = now; sfx('alarm', null, 0.5); banner.set('MOTHERSHIP UNDER ATTACK', '#ff6a5a', 2.5); } }
  loop('engine', n ? 0.06 + 0.2 * thr / n : 0); loop('ambience', G.state === 'lobby' ? 0 : 0.3);
  camera.getWorldPosition(_o); camera.getWorldDirection(_d); _up.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(_q)); listen({ position: _o }, _d, _up);
  shell.position.copy(_o); if (cosmos) cosmos.tick(now / 1000);
  banner.tick(now); banner.mesh.position.copy(arena.position); banner.mesh.position.y += 0.62 * arena.scale.x; banner.mesh.scale.setScalar(Math.max(0.6, arena.scale.x * 1.6)); banner.mesh.lookAt(_o);
  if (now - G.last > 200) { G.last = now; panel.draw({ credits: V.credits[G.me], income: V.income[G.me], count: mine, queue: V.queue[G.me] || [], me: G.me, ar: G.ar, canAR: G.canAR, state: G.over ? 'over' : G.state, costs: table(V.fac[G.me]), extra: G.state === 'wait' ? 'PLAY THE BOT' : G.over ? 'PLAY AGAIN' : '' }); }
  renderer.render(scene, camera);
}

// ---- the page, and into the headset -------------------------------------------------------------------------------
async function enter(two) {
  const st = $('status'); initAudio(BASE); let kind = 'immersive-ar';
  if (!(await navigator.xr.isSessionSupported(kind).catch(() => false))) kind = 'immersive-vr';
  let session; try { session = await navigator.xr.requestSession(kind, { requiredFeatures: ['local-floor'] }); } catch (e) { st.textContent = 'The headset did not start: ' + e.message; return; }
  G.canAR = kind === 'immersive-ar'; setView(G.canAR); await renderer.xr.setSession(session); $('lobby').classList.add('hidden');
  try { const r = session.supportedFrameRates; if (r && session.updateTargetFrameRate) session.updateTargetFrameRate(Array.from(r).includes(90) ? 90 : Math.max(...r)); } catch {}
  G.placed = -1; G.state = 'wait'; setTimeout(() => { if (!renderer.xr.isPresenting) return; place(); if (two) online(); else solo(); }, 350);
  session.addEventListener('end', () => { if (G.net) { G.net.close(); G.net = null; } G.sim = null; G.bots = []; G.state = 'lobby'; G.view.reset(); banner.set(''); $('lobby').classList.remove('hidden'); });
}
(async () => {
  const st = $('status'), two = $('two'), bot = $('bot'); let models;
  try { models = await loadModels((f) => { st.textContent = 'Loading the fleet... ' + Math.round(f * 100) + '%'; }); } catch (e) { st.textContent = 'The fleet did not load: ' + e.message; return; }
  G.view = new View(arena, models, scene); wire(G.view); G.state = 'lobby'; fitLight(); setView(false); renderer.setAnimationLoop(frame);
  if (SIM) { $('lobby').classList.add('hidden'); G.state = 'wait'; G.placed = -1; if (Q.has('local')) online(); else { solo(); if (Q.has('watch')) G.bots.push(new Bot(G.sim, 0)); } window.__space = { G, cmd, arena, camera, hands, panel, banner, setView, TYPES, LEN, sun, scene, renderer }; return; }
  const ok = navigator.xr && ((await navigator.xr.isSessionSupported('immersive-ar').catch(() => false)) || (await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)));
  if (!ok) { st.textContent = 'Open this page in the browser of a Meta Quest headset.'; return; }
  for (const f of [0, 1]) $('navy' + f).onclick = () => { G.fac = f; $('navy0').classList.toggle('on', !f); $('navy1').classList.toggle('on', !!f); }; $('navy' + G.fac).click();
  st.textContent = ''; two.disabled = bot.disabled = false; two.onclick = () => enter(true); bot.onclick = () => enter(false); window.__space = { G, cmd, arena, camera, hands, panel, banner, setView };
})();
