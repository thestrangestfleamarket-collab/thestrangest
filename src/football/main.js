// FOURTH & LONG's page: the headset (passthrough or a stadium), the controllers, the table view of the whole game and the life-size view from inside a player, the pointer that picks plays and gives orders, the throw
import * as THREE from 'three';
import { Game, Remote, FIELD, LEVELS } from './sim.js';
import { Net } from './net.js';
import { OFFENSE, DEFENSE } from './plays.js';
import { View } from './view.js';
import { Panel } from './panel.js';
import { Sound } from './audio.js';
import { buildWorld, WEATHER, HOURS } from './world.js';

const qs = new URLSearchParams(location.search), $ = (id) => document.getElementById(id), YD = 0.9144; let USER = 0;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.03, 9000), view = new View(scene), W = view.W, panel = new Panel(), snd = new Sound(), LEAN = /OculusBrowser|Quest|Pico/i.test(navigator.userAgent) || qs.has('lean'), world = buildWorld(scene, W, { lean: LEAN }); scene.add(panel.mesh);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const OPT = { lvl: Math.min(2, Math.max(0, +(qs.get('lvl') ?? 1))), mode: ['game', 'drill', 'practice'].includes(qs.get('mode')) ? qs.get('mode') : 'game', qlen: +(qs.get('q') || 180) }, make = (seed, more = {}) => new Game({ seed, qlen: OPT.qlen, lvl: OPT.lvl, mode: OPT.mode, ...(qs.has('noko') ? { ko: false } : {}), ...more });
let sim = make(+(qs.get('seed') || (Date.now() % 1e6)));
const G = { mode: 'table', xr: false, room: !qs.has('stadium'), auto: true, tab: 'RUN', sel: -1, hover: -1, spot: null, body: -1, started: false, tpos: new THREE.Vector3(0, 0.75, -0.85), tyaw: 0, tscale: 0.016, anchor: new THREE.Vector3(), fwd: new THREE.Vector3(0, 0, -1), yaw: 0, look: { x: 0, y: 0 }, aim: null, hist: [], t: 0 };
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), q1 = new THREE.Quaternion(), m1 = new THREE.Matrix4(), ray = new THREE.Raycaster();

// ---- the controllers ----
const hands = [0, 1].map(i => { const c = renderer.xr.getController(i), h = { c, src: null, prev: {} }; scene.add(c); c.addEventListener('connected', e => { h.src = e.data; }); c.addEventListener('disconnected', () => { h.src = null; }); return h; });
const hand = (side) => hands.find(h => h.src && h.src.handedness === side && h.src.gamepad);
const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: 0x40e0ff, transparent: true, opacity: 0.8 })); beam.frustumCulled = false; beam.visible = false; scene.add(beam);
const keys = new Set(), tapped = new Set(), mouse = { x: 0, y: 0, down: false, in: false }, virt = {}, I = { sx: 0, sy: 0, rx: 0, ry: 0, b: {}, p: {} };
addEventListener('keydown', e => { if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); keys.add(e.code); tapped.add(e.code); }); addEventListener('keyup', e => keys.delete(e.code)); addEventListener('blur', () => keys.clear());
renderer.domElement.addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; mouse.in = true; });
renderer.domElement.addEventListener('pointerdown', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; mouse.down = true; mouse.hit = true; snd.start(); }); addEventListener('pointerup', () => { mouse.down = false; });
function readInput() {
  const b = {}, L = hand('left'), R = hand('right'), k = (c) => keys.has(c) || tapped.has(c); I.sx = I.sy = I.rx = I.ry = 0;
  if (G.xr) { if (L) { const g = L.src.gamepad; I.sx = g.axes[2] || 0; I.sy = -(g.axes[3] || 0); b.sprint = g.buttons[0]?.pressed; b.lgrip = g.buttons[1]?.pressed; b.lclick = g.buttons[3]?.pressed; b.x = g.buttons[4]?.pressed; b.y = g.buttons[5]?.pressed; }
    if (R) { const g = R.src.gamepad; I.rx = g.axes[2] || 0; I.ry = -(g.axes[3] || 0); b.trig = g.buttons[0]?.pressed; b.rgrip = g.buttons[1]?.pressed; b.rclick = g.buttons[3]?.pressed; b.a = g.buttons[4]?.pressed; b.b = g.buttons[5]?.pressed; } }
  else { I.sx = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0); I.sy = (k('KeyW') ? 1 : 0) - (k('KeyS') ? 1 : 0); I.rx = (k('ArrowRight') ? 1 : 0) - (k('ArrowLeft') ? 1 : 0); I.ry = (k('ArrowUp') ? 1 : 0) - (k('ArrowDown') ? 1 : 0);
    b.sprint = k('ShiftLeft') || k('ShiftRight'); b.trig = mouse.down || mouse.hit; mouse.hit = false; b.a = k('Space'); b.b = k('KeyE'); b.x = k('KeyQ'); b.y = k('KeyR'); b.rclick = k('KeyV'); b.lclick = k('KeyP'); tapped.clear(); }
  if (virt.stick) { I.sx = virt.stick[0]; I.sy = virt.stick[1]; } for (const n in virt.hold || {}) if (virt.hold[n]) b[n] = true; for (const n of virt.tap || []) b[n] = true; virt.tap = null;
  b.fl = I.rx < -0.7; b.fr = I.rx > 0.7; b.fu = I.ry > 0.7; b.fd = I.ry < -0.7; I.p = {}; I.r = {}; for (const n in b) { if (b[n] && !I.b[n]) I.p[n] = true; } for (const n in I.b) if (I.b[n] && !b[n]) I.r[n] = true; I.b = b;
}

// ---- where the field is: a table in front of you, or life size around the player you are ----
function headPose(pos, fwd) { const c = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera; c.getWorldPosition(pos); c.getWorldDirection(fwd); fwd.y = 0; if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, -1); fwd.normalize(); }
function place() {
  if (G.mode === 'table') { W.position.copy(G.tpos); W.rotation.y = G.tyaw; W.scale.setScalar(G.tscale); panel.mesh.position.set(0, 0.72, -0.62).applyAxisAngle(v1.set(0, 1, 0), G.tyaw).add(G.tpos); panel.mesh.rotation.set(0, G.tyaw, 0); if (!G.xr) { panel.mesh.scale.setScalar(1.3); panel.mesh.position.y += 0.06; } else panel.mesh.scale.setScalar(1); }
  else { const p = sim.P[G.body] || sim.P[sim.qb] || sim.P[0]; W.scale.setScalar(YD); W.rotation.y = G.yaw; W.position.set(0, 0, 0); W.updateMatrix(); v1.set(p.x, 0, p.z).applyMatrix4(W.matrix); W.position.set(G.anchor.x - v1.x, 0, G.anchor.z - v1.z);
    panel.mesh.position.copy(G.anchor).addScaledVector(G.fwd, 1.5); panel.mesh.position.y = 1.25; panel.mesh.rotation.set(0, Math.atan2(-G.fwd.x, -G.fwd.z), 0); }
  W.updateMatrixWorld(true);
  if (!G.xr && !G.free) { if (G.mode === 'table') { camera.position.set(0, 1.95, 0.62); camera.lookAt(0, 1.0, -0.95); } else { camera.position.set(G.anchor.x, 1.75, G.anchor.z); camera.rotation.set(-0.06, 0, 0, 'YXZ'); } const f = G.mode === 'table' ? 62 : 84; if (camera.fov !== f) { camera.fov = f; camera.updateProjectionMatrix(); } }
}
function setMode(m) {
  if (m === G.mode) return; if (m === 'first') { const mine = sim.ctl >= 0 ? sim.ctl : sim.poss === USER && sim.qb != null && sim.phase !== 'call' ? sim.qb : -1; if (mine < 0) return; G.body = mine;
    if (G.xr) headPose(G.anchor, G.fwd); else { G.anchor.set(0, 0, 0); G.fwd.set(0, 0, -1); G.look.x = G.look.y = 0; } G.anchor.y = 0; const d = sim.dir(sim.P[mine].team); G.yaw = Math.atan2(-G.fwd.z * d, G.fwd.x * d); }
  G.mode = m; view.table = m === 'table'; place();
}
function env() { const shown = !G.room; scene.background = G.xr ? null : BACK; sim.wx.wet = Math.max(world.wx.rain, world.wx.snow * 0.8); sim.wx.wind = world.wx.wind; snd.base = shown ? 0.035 : 0.012; snd.crowd(snd.base); }
const BACK = new THREE.Color(0x0b0e14);
function sky(kind, hour) { world.set(kind, hour); env(); }
// a stick's push, as a direction on the field: forward is the way you face
function simDir(sx, sy) { if (G.xr || G.mode === 'first') { if (G.xr) headPose(v1, v2); else v2.set(-Math.sin(G.look.x), 0, -Math.cos(G.look.x)); } else v2.set(0, 0, -1);
  const wx = v2.x * sy - v2.z * sx, wz = v2.z * sy + v2.x * sx, c = Math.cos(W.rotation.y), s = Math.sin(W.rotation.y); return [wx * c - wz * s, wx * s + wz * c]; }

// ---- the pointer: the board, a player, a spot on the grass ----
function pointer() {
  const out = { btn: null, player: -1, ground: null, on: false }, R = hand('right');
  if (G.xr) { if (!R) return out; R.c.updateMatrixWorld(); ray.ray.origin.setFromMatrixPosition(R.c.matrixWorld); ray.ray.direction.set(0, 0, -1).transformDirection(R.c.matrixWorld); } else { if (!mouse.in) return out; ray.setFromCamera(mouse, camera); }
  out.on = true; let len = 6; if (virt.point != null) { out.player = virt.point; return out; }
  if (panel.mesh.visible) { const h = ray.intersectObject(panel.mesh)[0]; if (h) { out.btn = panel.at(h.uv); out.len = h.distance; return out; } }
  m1.copy(W.matrixWorld).invert(); const o = v1.copy(ray.ray.origin).applyMatrix4(m1), d = v2.copy(ray.ray.direction).transformDirection(m1); let best = 1;
  const pass = sim.poss === USER && sim.ctl === sim.qb && sim.canThrow(); let bo = 1, opp = -1, lo = 6;   // one of yours is picked before an opponent standing over him, unless you are giving an order
  for (const p of sim.P) { if (p.id === G.body && G.mode === 'first') continue; v3.set(p.x - o.x, 1.2 - o.y, p.z - o.z); const t = v3.dot(d); if (t < 0) continue; const e = v3.addScaledVector(d, -t).length() / (G.mode === 'table' ? 1.7 + t * 0.008 : 1.3 + t * 0.07);
    if (p.team === USER) { if (pass && !p.elig) continue; if (e < best) { best = e; out.player = p.id; len = t * W.scale.x; } } else if (e < bo) { bo = e; opp = p.id; lo = t * W.scale.x; } }
  if (opp >= 0 && (out.player < 0 || G.sel >= 0 && bo < best)) { out.player = opp; len = lo; }
  if (d.y < -1e-3) { const t = -o.y / d.y, x = o.x + d.x * t, z = o.z + d.z * t; if (Math.abs(x) < 62 && Math.abs(z) < FIELD.W + 3) { out.ground = { x, z }; if (out.player < 0) len = t * W.scale.x; } }
  out.len = len; return out;
}
function click(id) {
  const [k, a] = id.split(':'); snd.start();
  if (k === 'tab') { G.tab = a; G.page = 0; } else if (k === 'more') G.page = (G.page || 0) + 1; else if (k === 'play') { sim.pick(USER, +a); } else if (k === 'auto') G.auto = !G.auto; else if (k === 'room') { G.room = !G.room; env(); } else if (k === 'wx') { const K = Object.keys(WEATHER); sky(K[(K.indexOf(world.kind) + 1) % K.length], world.hour); } else if (k === 'hour') { const K = Object.keys(HOURS); sky(world.kind, K[(K.indexOf(world.hour) + 1) % K.length]); }
  else if (k === 'view') setMode(G.mode === 'table' ? 'first' : 'table'); else if (k === 'again') newGame(); else if (k === 'snap') sim.snap(); else if (k === 'audible') { sim.audible(); view.showRoutes(sim, false); }
  else if (k === 'menu') G.menu = !G.menu; else if (k === 'timeout') { if (sim.timeout(USER)) snd.whistle(); } else if (k === 'lvl') { OPT.lvl = (OPT.lvl + 1) % LEVELS.length; sim.lvl = OPT.lvl; sim.K = LEVELS[OPT.lvl]; } else if ((k === 'gmode' || k === 'qlen') && VS.role !== 'solo') snd.tone(220, 0.1); else if (k === 'gmode') { OPT.mode = { game: 'drill', drill: 'practice', practice: 'game' }[OPT.mode]; newGame(); G.menu = true; } else if (k === 'qlen') { OPT.qlen = { 60: 180, 180: 300, 300: 60 }[OPT.qlen] || 180; newGame(); G.menu = true; }
  else if (k === 'hot' && G.sel >= 0) { sim.order(G.sel, { route: a }); view.showRoutes(sim, true); }
}
function newGame() { if (VS.role === 'guest') return; sim = make(Date.now() % 1e6, VS.role === 'host' ? { human: [true, true], names: ['YOU', 'RIVAL'], mode: 'game' } : {}); G.menu = false; fresh(); }
function fresh() { VS.ev.length = 0; VS.ph = ''; env(); G.sel = -1; G.mode = ''; setMode('table'); view.showRoutes(sim, false); }

// ---- 1 v 1: everyone at /football is in its one public room; the first in runs the game, the second takes the other side; alone, or when the other leaves, you play the computer ----
const VS = { role: 'solo', slot: 0, ev: [], at: 0, ph: '', phT: 0 }, say = (t) => { if ($('status')) $('status').textContent = t; if ($('vs')) { $('vs').textContent = t; $('vs').hidden = !t; } };
function pair() { if (VS.slot === 0) { VS.role = 'host'; USER = 0; newGame(); } else { VS.role = 'guest'; USER = 1; sim = new Remote({ qlen: +(qs.get('q') || 180), names: ['RIVAL', 'YOU'] }, (c, a) => net.send({ t: 'c', c, a })); fresh(); } say('1 v 1: another player is on the field against you.'); snd.tone(880, 0.12); }
function unpair() { if (VS.role === 'solo') return; const was = VS.role; VS.role = 'solo'; say('Your rival left: the computer plays the other side.');
  if (was === 'host') { sim.human = [true, false]; sim.ctls[1] = -1; sim.names = ['HOME', 'AWAY']; if (sim.phase === 'call') sim.pick(0, -1); } else { USER = 0; newGame(); } }
const net = new Net({ welcome: (m) => { VS.slot = m.slot | 0; if (m.peers && m.peers.length) pair(); }, 'peer-join': () => pair(), 'peer-leave': () => unpair(), down: () => unpair(), full: () => say('Two are already playing here: you play the computer.'),
  s: (m) => { if (VS.role === 'guest') { sim.read(m.s); events(); } }, c: (m) => { if (VS.role === 'host' && typeof m.c === 'string') sim.cmd(m.c, Array.isArray(m.a) ? m.a : []); } });
function versus(dt) { if (VS.role === 'solo') return; VS.at += dt;
  if (VS.role === 'guest') { if (VS.at >= 0.05) { VS.at = 0; const I = sim.in; net.send({ t: 'c', c: 'in', a: [+I.x.toFixed(2), +I.z.toFixed(2), I.sprint ? 1 : 0] }); } return; }
  if (sim.phase !== VS.ph) { VS.ph = sim.phase; VS.phT = 0; } VS.phT += dt;   // nobody is kept waiting: a call left 25 s is made for them, a snap left 20 s is taken
  if (sim.phase === 'call' && VS.phT > 25) { for (const t of [0, 1]) if (sim.call[t] < 0) sim.call[t] = t === sim.poss ? sim.cpuOff() : sim.cpuDef(); sim.pick(0, -1); } else if (sim.phase === 'pre' && VS.phT > 20) sim.snap();
  if (VS.at >= 0.05) { VS.at = 0; net.send({ t: 's', s: sim.snapshot(VS.ev.splice(0)) }); } }
function buzz(side, v = 0.6, ms = 40) { for (const h of hands) { if (!h.src || (side && h.src.handedness !== side)) continue; const a = h.src.gamepad && h.src.gamepad.hapticActuators && h.src.gamepad.hapticActuators[0]; if (a && a.pulse) a.pulse(v, ms).catch(() => {}); } }
function tabFix() { const off = sim.poss === USER, ok = off ? ['RUN', 'SHORT', 'DEEP', 'KICK'] : ['ZONE', 'MAN', 'BLITZ']; if (!ok.includes(G.tab)) { G.tab = ok[0]; G.page = 0; } }
function juke(p, side) { const s = Math.hypot(p.vx, p.vz) || 1, lx = p.vz / s, lz = -p.vx / s; return side[0] * lx + side[1] * lz > 0 ? 'jukeL' : 'jukeR'; }

function controls(dt) {
  const off = sim.poss === USER, ph = sim.phase, me = sim.ctl >= 0 ? sim.P[sim.ctl] : null, car = me && me.id === sim.carrier, P = I.p;
  const [mx, mz] = simDir(I.sx, I.sy); sim.in.x = mx; sim.in.z = mz; sim.in.sprint = !!I.b.sprint;
  const hit = pointer(), canPass = off && sim.canThrow() && sim.ctl === sim.qb; panel.hover = hit.btn ? hit.btn.id : '';
  G.hover = hit.player >= 0 && (sim.P[hit.player].team === USER || G.sel >= 0) && (ph === 'pre' || ph === 'live') ? hit.player : -1; G.spot = G.sel >= 0 && hit.player < 0 && !hit.btn ? hit.ground : null;
  beam.visible = G.xr && hit.on; if (beam.visible) { beam.position.copy(ray.ray.origin); beam.quaternion.setFromUnitVectors(v3.set(0, 0, -1), ray.ray.direction); beam.scale.set(1, 1, hit.len || 6); }
  // the trigger: a button, a throw, a pick, an order
  if (P.trig) { buzz('right', 0.3, 15); if (hit.btn) click(hit.btn.id);
    else if (ph === 'pre' || ph === 'live') { const p = hit.player >= 0 ? sim.P[hit.player] : null;
      if (canPass && p && p.team === USER && p.elig) G.aim = { id: p.id, t: G.t };
      else if (p && p.team === USER && p.id !== sim.ctl) G.sel = G.sel === p.id ? -1 : p.id;
      else if (G.sel >= 0 && p && p.team !== USER) { if (sim.order(G.sel, { target: p.id })) snd.tone(660, 0.08); G.sel = -1; }
      else if (G.sel >= 0 && hit.ground) { if (sim.order(G.sel, hit.ground)) snd.tone(660, 0.08); if (ph === 'pre' && off) view.showRoutes(sim, true); G.sel = -1; } } }
  if (G.aim && (I.r.trig || G.t - G.aim.t > 0.3)) { sim.throwTo(G.aim.id, G.t - G.aim.t < 0.22, handAt()); G.aim = null; }
  // a throw by hand: hold the grip, swing, let go
  const R = hand('right'); if (G.xr && R) { R.c.getWorldPosition(v1); G.hist.push({ x: v1.x, y: v1.y, z: v1.z, t: G.t }); if (G.hist.length > 14) G.hist.shift(); }
  if (G.xr && G.mode === 'first' && canPass && I.r.rgrip && G.hist.length > 2) { const H = G.hist, end = H[H.length - 1].t; let wx = 0, wy = 0, wz = 0, top = 0;   // the hand's travel over 0.07 s, as BALL measures a throw; the fastest such moment of the last quarter second, so letting go a little late still throws
    for (let j = H.length - 1; j > 0 && end - H[j].t < 0.25; j--) { const b = H[j]; let a = b; for (let i = j; i >= 0; i--) { a = H[i]; if (b.t - a.t > 0.07) break; } const T = Math.max(b.t - a.t, 1 / 120), x = (b.x - a.x) / T, y = (b.y - a.y) / T, z = (b.z - a.z) / T, m = Math.hypot(x, y, z); if (m > top) { top = m; wx = x; wy = y; wz = z; } }
    if (top > 1.2) { const c = Math.cos(G.yaw), s = Math.sin(G.yaw), k = 2.6 / YD; if (sim.throwVel(handAt(), { vx: (wx * c - wz * s) * k, vy: wy * k, vz: (wx * s + wz * c) * k })) buzz('right', 0.8, 60); } }
  if (G.xr && G.mode === 'table') grab(I.b.lgrip, I.b.rgrip);
  if (P.rclick) setMode(G.mode === 'table' ? 'first' : 'table'); if (P.lclick) { G.room = !G.room; env(); }
  if (ph === 'pre') { if (P.a) off ? sim.snap() : sim.hurry(); if (P.b) { if (off) { sim.audible(); view.showRoutes(sim, false); } else sim.switchCtl(); } }
  else if (ph === 'dead') { if (P.a) sim.skip(); }
  else if (ph === 'live' && me) {
    if (canPass && P.b) sim.throwAway();
    if (car && !(me.id === sim.qb && sim.canThrow() && !sim.past)) { let near = null, nd = 99; for (const q of sim.team(1 - USER)) { const e = Math.hypot(q.x - me.x, q.z - me.z); if (q.st === 'up' && e < nd) { nd = e; near = q; } }
      if (P.a) sim.act(near ? (juke(me, [near.x - me.x, near.z - me.z]) === 'jukeL' ? 'jukeR' : 'jukeL') : 'jukeL'); if (P.b || P.fd) sim.act('spin'); if (P.x) sim.act('dive'); if (P.y) sim.act('hurdle'); if (P.fu) sim.act('stiff');
      if (P.fl || P.fr) sim.act(juke(me, simDir(P.fl ? -1 : 1, 0))); }
    else if (!car && me.team !== sim.carrierTeam()) { if (P.a) sim.act('dive'); if (P.b) sim.switchCtl(); if (P.x) sim.act('hit'); if (P.y) sim.act('jump'); }
    else if (P.y) sim.act('jump');
  }
}
// the hand that throws, in yards on the field
function handAt() { const R = hand('right'); if (!G.xr || !R || G.mode !== 'first') return null; R.c.getWorldPosition(v3); W.worldToLocal(v3); return { x: v3.x, y: Math.max(1, v3.y), z: v3.z }; }
// the table held by a grip is dragged; by both, sized and turned
let gr = null;
function grab(l, r) {
  const L = hand('left'), R = hand('right'), a = l && L ? L.c.getWorldPosition(new THREE.Vector3()) : null, b = r && R ? R.c.getWorldPosition(new THREE.Vector3()) : null, n = (a ? 1 : 0) + (b ? 1 : 0); if (!n) { gr = null; return; }
  const mid = n === 2 ? a.clone().add(b).multiplyScalar(0.5) : (a || b).clone(), span = n === 2 ? a.distanceTo(b) : 0, ang = n === 2 ? Math.atan2(b.x - a.x, b.z - a.z) : 0;
  if (!gr || gr.n !== n) { gr = { n, mid, span, ang, pos: G.tpos.clone(), sc: G.tscale, yaw: G.tyaw }; return; }
  if (n === 2) { const k = THREE.MathUtils.clamp(span / Math.max(0.05, gr.span), 0.3, 4); G.tscale = THREE.MathUtils.clamp(gr.sc * k, 0.006, 0.08); G.tyaw = gr.yaw + (ang - gr.ang); const kk = G.tscale / gr.sc; G.tpos.copy(gr.pos).sub(gr.mid).multiplyScalar(kk).applyAxisAngle(v1.set(0, 1, 0), ang - gr.ang).add(mid); }
  else G.tpos.copy(gr.pos).add(mid).sub(gr.mid);
}

function events() {
  for (const e of sim.ev) { const off = sim.poss === USER; view.event(e, sim);
    if (e.t === 'lineup') { G.sel = -1; view.showRoutes(sim, off && !sim.isKO); }
    else if (e.t === 'snap') { snd.snap(); view.showRoutes(sim, false); G.sel = -1; if (G.auto && off && !sim.run && !sim.play.sneak) setMode('first'); }
    else if (e.t === 'throw') { snd.swish(); if (G.auto) setMode('table'); } else if (e.t === 'handoff') { if (G.auto) setMode('table'); }
    else if (e.t === 'catch') { snd.catch(); snd.cheer(0.12, 1); world.cheer(0.25); if (off) buzz('', 0.5, 50); } else if (e.t === 'tackle' || e.t === 'miss') { snd.hit(); if (e.t === 'tackle' || e.id === sim.ctl) buzz('', e.t === 'tackle' ? 1 : 0.5, 120); } else if (e.t === 'kick' || e.t === 'kickoff') { snd.kick(); view.showRoutes(sim, false); if (e.t === 'kickoff') world.cheer(0.4); } else if (e.t === 'flag' || e.t === 'timeout') snd.whistle(); else if (e.t === 'int' || e.t === 'swat') snd.catch();
    else if (e.t === 'td' || e.t === 'fgood') { snd.cheer(0.5, 4); world.cheer(1); } else if (e.t === 'first') { snd.cheer(0.2, 1.5); world.cheer(0.45); } else if (e.t === 'int') { world.cheer(0.6); snd.cheer(0.3, 2); } else if (e.t === 'whistle') { snd.whistle(); if (G.auto) setMode('table'); } }
  if (VS.role === 'host') VS.ev.push(...sim.ev); sim.ev.length = 0;
}
let acc = 0, last = 0; const FRUST = new THREE.Frustum(), EYE = new THREE.Vector3(), COST = { n: 0, ms: 0 };
function advance(dt) { acc += dt; let n = 0; while (acc >= 1 / 60 && n++ < 6) { sim.step(1 / 60); acc -= 1 / 60; events(); } if (n > 5) acc = 0; }
function frame(ms) {
  const dt = Math.min(0.05, (ms - last) / 1000 || 0.016); last = ms; G.t += dt; if (!G.started) { place(); renderer.render(scene, camera); return; }
  const t0 = performance.now(); place(); readInput(); if (sim.phase === 'call') tabFix(); controls(dt); advance(dt); versus(dt); place();
  const first = G.mode === 'first', mine = sim.P[G.body]; if (first) { const c = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera; c.updateMatrixWorld(); m1.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse); FRUST.setFromProjectionMatrix(m1); }
  const hold = first && G.xr && mine && mine.id === sim.carrier ? handAt() : null;
  view.update(sim, dt, { hide: first ? G.body : -1, sel: G.sel, hover: G.hover, spot: G.spot, targets: sim.poss === USER && sim.canThrow() && sim.ctl === sim.qb, far: first && mine ? mine : null, frustum: first && !G.free ? FRUST : null, eye: EYE, wind: G.aim && sim.ctl === sim.qb ? sim.qb : (sim.windId ?? -1), ballAt: hold ? v3.set(hold.x, hold.y, hold.z) : null });
  { const c = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera; c.getWorldPosition(v1); EYE.copy(v1); world.update(dt, v1, !G.room, G.mode === 'table', mine || sim.ball); }
  panel.mesh.visible = sim.phase !== 'live'; panel.draw({ sim, user: USER, page: G.page, wx: world.kind, hour: world.hour, menu: G.menu, lvlName: LEVELS[OPT.lvl].name, qlen: OPT.qlen, tab: G.tab, sel: G.sel, selRoute: G.sel >= 0 && sim.P[G.sel].elig && sim.P[G.sel].team === sim.poss, auto: G.auto, room: G.room, xr: G.xr, mode: G.mode });
  if ($('hint')) $('hint').textContent = hint();
  COST.ms += performance.now() - t0; COST.n++; renderer.render(scene, camera);
}
function hint() { if (G.xr) return ''; const ph = sim.phase, off = sim.poss === USER, me = sim.ctl >= 0 ? sim.P[sim.ctl] : null;
  if (ph === 'call') return 'Click a play.  V: table / field view'; if (ph === 'pre') return off ? 'SPACE snap   E other play   click a player, then a spot, a defender or a route' : 'E switch player   WASD move   click a player, then a spot or an opponent';
  if (ph !== 'live' || !me) return ''; if (me.id === sim.qb && sim.canThrow()) return 'Click a receiver to throw (hold for a bullet)   E throw it away   WASD move   SHIFT sprint   V view';
  return me.id === sim.carrier ? 'WASD run   SHIFT sprint   SPACE juke   E spin   Q dive   R hurdle   arrows: juke left/right, up stiff arm' : 'WASD move   SHIFT sprint   SPACE dive tackle   Q hit   R jump   E switch player'; }

// ---- starting ----
async function enter() {
  snd.start(); let kind = 'immersive-ar'; if (!(await navigator.xr.isSessionSupported(kind).catch(() => false))) kind = 'immersive-vr';
  let session; try { session = await navigator.xr.requestSession(kind, { requiredFeatures: ['local-floor'] }); } catch (e) { $('status').textContent = 'The headset did not start: ' + e.message; return; }
  G.xr = true; G.ar = kind === 'immersive-ar'; scene.background = null; renderer.setClearColor(0, 0); renderer.xr.setFoveation(1); await renderer.xr.setSession(session); begin();
  session.addEventListener('end', () => { G.xr = false; G.started = false; setMode('table'); $('lobby').classList.remove('hidden'); env(); });
}
function begin() { G.started = true; $('lobby').classList.add('hidden'); $('hint').hidden = G.xr; setMode('table'); env(); }
sky(qs.get('wx') in WEATHER ? qs.get('wx') : 'CLEAR', qs.get('hour') in HOURS ? qs.get('hour') : 'DAY'); place(); renderer.setAnimationLoop(frame); view.people().then(ok => { G.people = ok; if (ok) world.staff(); });
$('screen').onclick = () => { snd.start(); begin(); };
(async () => { const ok = navigator.xr && ((await navigator.xr.isSessionSupported('immersive-ar').catch(() => false)) || (await navigator.xr.isSessionSupported('immersive-vr').catch(() => false))); const b = $('enter'); b.disabled = !ok; b.textContent = ok ? 'ENTER HEADSET' : 'No headset found'; if (ok) b.onclick = enter; if (qs.has('screen')) begin(); })();
if (qs.has('local')) net.connect({ local: true, slot: +(qs.get('slot') || 0) }); else if (!qs.has('solo') && location.protocol !== 'file:') net.connect();
window.__fb = { VS, net, get user() { return USER; }, pointer, mouse, world, sky, COST, OPT, get sim() { return sim; }, G, view, W, camera, scene, renderer, panel, hands, THREE, OFFENSE, DEFENSE, setMode, click, enter,
  simulate(s) { for (let i = 0, n = Math.round(s * 60); i < n; i++) { sim.step(1 / 60); events(); } }, tap(...n) { virt.tap = n; }, hold(n, on) { (virt.hold ||= {})[n] = on; }, stick(x, y) { virt.stick = x || y ? [x, y] : null; }, point(id) { virt.point = id; },
  spot(id) { panel.draw({ sim, user: USER, page: G.page, wx: world.kind, hour: world.hour, menu: G.menu, lvlName: LEVELS[OPT.lvl].name, qlen: OPT.qlen, tab: G.tab, sel: G.sel, selRoute: false, auto: G.auto, room: G.room, xr: G.xr, mode: G.mode }); const b = panel.btns.find(b => b.id === id); return b ? panel.mesh.localToWorld(new THREE.Vector3(((b.x + b.w / 2) / 1024 - 0.5) * 0.9, (0.5 - (b.y + b.h / 2) / 640) * 0.5625, 0)) : null; },
  screenOf(id) { const p = sim.P[id]; v1.set(p.x, 1.2, p.z); W.localToWorld(v1).project(camera); return [(v1.x + 1) / 2 * innerWidth, (1 - v1.y) / 2 * innerHeight]; } };
