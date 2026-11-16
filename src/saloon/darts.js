// THE LAST CHANCE's darts: the board in its cabinet on the left wall, six darts thrown by hand and flown here (no physics engine), a real board's scoring, 301 against a townsman for a stake
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { G, V3, Q, UP, clamp, lerp, mergeStatic } from '../sushi/ctx.js';
import { Item } from '../sushi/items.js';
import { R } from './room.js';
import { model, pbr, plain, slab, canvasTex } from './kit.js';

const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const RB = 0.2254, K = 1, ROLL = 0;                        // the board as placed: its radius, its scale against a regulation board, how far its picture is turned
const BULL = 0.00635 * K, OUTER = 0.0159 * K, T0 = 0.099 * K, T1 = 0.107 * K, D0 = 0.162 * K, D1 = 0.17 * K;
const GR = 9.81, DRAG = 0.22, TIP = 0.08, STEP = 1 / 120, SEG = Math.PI / 10;
const _v = new V3(), _t = new V3(), _d = new V3(), _f = new V3(), _o = new V3(), _q = new Q(), _m = new THREE.Matrix4(), _from = new V3(), _to = new V3();
const look = (dir, q) => q.setFromRotationMatrix(_m.lookAt(_o, dir, UP));

function dartGeo(feather) {
  const u = (g, i) => { const a = g.attributes.uv; for (let k = 0; k < a.count; k++) a.setXY(k, (i + 0.5) / 5, 0.5); return g; };
  const fin = (ry) => { const g = new THREE.PlaneGeometry(0.038, 0.052, 2, 1), p = g.attributes.position; for (let k = 0; k < 3; k++) p.setX(k, p.getX(k) * 0.2); return u(g.translate(0, -0.054, 0).rotateY(ry), feather); };
  return mergeGeometries([
    u(new THREE.CylinderGeometry(0.0003, 0.0013, 0.03, 6).translate(0, 0.065, 0), 1),
    u(new THREE.CylinderGeometry(0.0022, 0.0038, 0.012, 8).translate(0, 0.044, 0), 0), u(new THREE.CylinderGeometry(0.0038, 0.0034, 0.038, 8).translate(0, 0.019, 0), 0),
    u(new THREE.CylinderGeometry(0.0022, 0.0018, 0.036, 6).translate(0, -0.018, 0), 2), fin(0), fin(Math.PI / 2)]).rotateX(-Math.PI / 2);
}

class Dart extends Item {
  constructor(i, mesh, D) { super('dart', mesh, { name: 'dart', radius: 0.05, lift: -0.07, aim: new V3(-0.1, 0, 0) }); this.i = i; this.D = D; this.st = 'rack'; this.col = { hx: 0.008, hy: 0.008, hz: 0.07, cy: 0 };
    this.tip = new V3(); this.ax = new V3(0, 0, 1); this.w = 0; this.t = 0; this.pull = 0; this.snap = false; this.live = false; this.by = 'you'; this.pts = 0; this.label = ''; this.hy = 0; this.hz = 0; this.hp = new V3(); this.hq = new Q(); this.sp = new V3(); this.sq = new Q(); }
  onGrab(h) { this.st = 'held'; this.live = false; this.pull = 0; this.aim.z = 0; this.label = ''; if (h.xr) { this.obj.quaternion.copy(h.quat); this.obj.position.copy(h.pos); if (!h.source?.hand) this.obj.position.add(_v.set(0, 0, -0.06).applyQuaternion(h.quat)); } }
  onHeld(dt, h) { if (h.xr) return; if (h.use) { this.pull += dt; this.aim.z = -0.11 * Math.min(1, this.pull / 0.7) + (this.pull > 1.4 ? Math.sin(this.pull * 31) * 0.006 : 0); } else if (this.pull > 0) { h.held = null; this.held = null; this.D.loose(this); } }
  onRelease(h) { this.D.let(this, h); return true; }
  onGround() { }
  hint() { return this.pull > 0 ? 'let go to throw' : 'hold RMB/E to draw back, let go to throw'; }
}

export function buildDarts(scene, room) {
  const CY = R.darts.y, CZ = R.darts.z, XP = -R.W - 0.01, XD = XP + 0.025, XK = XP + 0.04, XB = XP + 0.08, XF = XP + 0.11, SURF = [XF, XB, XK, XD, XP];
  const oche = room.spots.darts, hand = new V3(oche.x, 1.6, oche.z);
  let rnd = Math.random;
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd() * 0.999999)) * Math.cos(6.2831853 * rnd());

  // ---- the board, its cabinet, the chalk
  const cab = new THREE.Group(); cab.position.set(XP, CY, CZ); cab.rotation.y = Math.PI / 2; scene.add(cab);
  const wal = pbr('walnut', { tile: 0.7, color: 0x7a5238 }), dark = pbr('dark', { tile: 0.6 });
  slab(0.92, 0.92, 0.04, dark, 0, 0, 0.02, cab);
  for (const s of [-1, 1]) { slab(1, 0.04, 0.11, wal, 0, s * 0.48, 0.055, cab); slab(0.04, 0.92, 0.11, wal, s * 0.48, 0, 0.055, cab, true); slab(0.46, 1, 0.025, wal, s * 0.73, 0, 0.0125, cab, true); slab(0.4, 0.035, 0.085, wal, s * 0.73, -0.4775, 0.0675, cab); }
  mergeStatic(cab);
  const board = model('dartboard', XB - 0.0199, CY, CZ, 0, { h: RB * 2 }, scene); board.rotation.set(0, Math.PI / 2, ROLL, 'YXZ'); if (board.children[0]) board.children[0].position.y -= RB;
  const slate = canvasTex(256, 352, () => { }), ctx = slate.image.getContext('2d');
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.495), plain(0xffffff, { rough: 0.95, env: 0.2 })); m.material.map = slate; m.position.set(0.73, 0.1, 0.0265); m.receiveShadow = true; cab.add(m); }

  // ---- scoring
  function scoreAt(y, z) {
    const dy = y - CY, dz = z - CZ, r = Math.hypot(dy, dz);
    if (r <= BULL) return { n: 25, mult: 2, pts: 50, label: 'BULL' };
    if (r <= OUTER) return { n: 25, mult: 1, pts: 25, label: '25' };
    if (r > D1) return { n: 0, mult: 0, pts: 0, label: 'MISS' };
    const n = ORDER[((Math.floor((Math.atan2(-dz, dy) + ROLL) / SEG + 0.5) % 20) + 20) % 20], mult = r >= D0 ? 2 : r >= T0 && r <= T1 ? 3 : 1;
    return { n, mult, pts: n * mult, label: (mult === 3 ? 'T' : mult === 2 ? 'D' : '') + n };
  }
  function aimAt(n, mult = 1) { if (n === 25 || n === 50) return { y: CY, z: CZ + (n === 25 && mult !== 2 ? (BULL + OUTER) / 2 : 0) };
    const a = ORDER.indexOf(n) * SEG - ROLL, r = mult === 3 ? (T0 + T1) / 2 : mult === 2 ? (D0 + D1) / 2 : (T1 + D0) / 2; return { y: CY + Math.cos(a) * r, z: CZ - Math.sin(a) * r }; }
  const depth = (y, z) => { const ly = y - CY, lx = CZ - z, ax = Math.abs(lx), ay = Math.abs(ly); return ly * ly + lx * lx <= RB * RB ? XB : ay > 0.5 || ax > 0.96 ? XP : ax > 0.5 ? XD : ax > 0.46 || ay > 0.46 ? XF : XK; };

  // ---- the darts
  const pal = new THREE.DataTexture(new Uint8Array([176, 138, 58, 255, 200, 204, 210, 255, 92, 62, 34, 255, 168, 26, 22, 255, 30, 110, 44, 255]), 5, 1), orm = new THREE.DataTexture(new Uint8Array([255, 80, 255, 255, 255, 60, 255, 255, 255, 190, 0, 255, 255, 220, 0, 255, 255, 220, 0, 255]), 5, 1);
  pal.colorSpace = THREE.SRGBColorSpace; pal.magFilter = pal.minFilter = orm.magFilter = orm.minFilter = THREE.NearestFilter; pal.needsUpdate = orm.needsUpdate = true;
  const dm = new THREE.MeshStandardMaterial({ map: pal, roughnessMap: orm, metalnessMap: orm, roughness: 1, metalness: 1, envMapIntensity: 1.1, side: THREE.DoubleSide }), geos = [dartGeo(3), dartGeo(4)];
  const S = { on: false, over: false, won: false, turn: 'you', you: 301, them: 301, stake: 0, who: null, name: '', left: 3, start: 301, marks: [], sum: 0, pause: 0, wait: 0, skill: 0.5, auto: true, robot: -1, good: false, last: null };
  const N = { n: 0, t: 0, by: 'them', skill: 0.5 };
  const D = { loose, let: letGo }, darts = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(geos[i < 3 ? 0 : 1], dm), d = new Dart(i, m, D), lx = (i < 3 ? -0.73 : 0.73) + ((i % 3) - 1) * 0.08;
    d.hp.set(XP + 0.07, CY - 0.46 + TIP - 0.014, CZ - lx); d.hq.setFromAxisAngle(_v.set(1, 0, 0), -Math.PI / 2).premultiply(_q.setFromAxisAngle(_v.set(0, 0, 1), -0.14)); m.receiveShadow = true; m.position.copy(d.hp); m.quaternion.copy(d.hq); darts.push(d); }

  const home = (d) => { if (d.held || d.st === 'rack' || d.st === 'home') return; d.st = 'home'; d.t = 0; d.live = false; d.locked = true; d.label = ''; d.sp.copy(d.obj.position); d.sq.copy(d.obj.quaternion); };
  const collect = () => { for (const d of darts) home(d); };
  function fall(d, w) { d.st = 'fall'; d.locked = true; d.w = w; d.ax.set(rnd() - 0.5, rnd() * 0.3, rnd() - 0.5).normalize(); }
  // let go on a screen after drawing back: toward the crosshair, truer for a full unhurried draw
  function loose(d) {
    const p = clamp(d.pull / 0.7, 0, 1), sig = 0.005 + Math.max(0, 0.5 - d.pull) * 0.11 + clamp((d.pull - 1.4) * 0.03, 0, 0.06); d.pull = 0; d.aim.z = 0;
    G.camera.getWorldPosition(_from); G.camera.getWorldDirection(_d); const k = _d.x < -0.05 ? (XB - _from.x) / _d.x : 0, far = k > 0.3 && k < 14 ? k : 4;
    _to.copy(_from).addScaledVector(_d, far); _f.crossVectors(_d, UP).normalize(); _to.addScaledVector(_f, gauss() * sig * far); _to.y += gauss() * sig * far;
    launch(d, d.obj.position, _to, 4 + 3.6 * p, 'you');
  }
  function letGo(d, h) {
    d.pull = 0; d.aim.z = 0;
    if (h && h.xr && h.vs.length() > 1.2) { d.vel.copy(h.vs); d.snap = false; go(d, 'you'); } else { d.vel.set(0, 0, 0); if (h && h.xr) d.vel.copy(h.vs); fall(d, 0); }
  }
  function go(d, by) { d.st = 'fly'; d.locked = true; d.live = true; d.by = by; d.t = 0; d.label = ''; d.tip.set(0, 0, -TIP).applyQuaternion(d.obj.quaternion).add(d.obj.position); }
  // the throw that carries the point from one place to another at a speed, drag and all
  function launch(d, from, to, s, by) {
    const dx = to.x - from.x, dz = to.z - from.z, len = Math.hypot(dx, dz) || 1e-6, h = to.y - from.y; let aim = h, c = 1, sn = 0;
    for (let k = 0; k < 5; k++) {
      const disc = s * s * s * s - GR * (GR * len * len + 2 * aim * s * s), th = disc > 0 ? Math.atan((s * s - Math.sqrt(disc)) / (GR * len)) : Math.PI / 4; c = Math.cos(th); sn = Math.sin(th);
      let u = 0, y = 0, vu = s * c, vy = s * sn, tu = TIP * c, ty = TIP * sn, n = 0;
      while (n++ < 600 && y > -6) { const pu = tu, py = ty, f = 1 - DRAG * STEP; vy = (vy - GR * STEP) * f; vu *= f; u += vu * STEP; y += vy * STEP; const l = Math.hypot(vu, vy); tu = u + TIP * vu / l; ty = y + TIP * vy / l; if (tu >= len) { ty = py + (ty - py) * (len - pu) / (tu - pu); break; } }
      aim += h - ty;
    }
    d.held = null; d.obj.position.copy(from); d.vel.set(dx / len * c * s, sn * s, dz / len * c * s); d.snap = true; look(_v.copy(d.vel).normalize(), d.obj.quaternion); go(d, by);
  }
  // a thrown dart has come to something: what it scored, and whose turn that leaves
  function out(d, sc) {
    if (!d.live) return; d.live = false; d.pts = sc ? sc.pts : 0; d.label = sc ? sc.label : 'MISS';
    if (!S.on) { if (S.over || S.marks.length >= 3) { S.marks.length = 0; S.sum = 0; S.over = false; } S.marks.push(d.label); S.sum += d.pts; chalk(); return; }
    if (d.by !== S.turn || S.left <= 0) return;
    const k = S.turn; S.left--; S.marks.push(d.label); S.sum += d.pts; S[k] -= d.pts;
    if (S[k] === 0) return end(k === 'you');
    if (S[k] < 0) { S[k] = S.start; S.left = 0; S.marks.push('BUST'); N.n = 0; }
    else if (k === 'you' && d.pts >= 40 && !S.good) { S.good = true; G.folk?.say?.(S.who, 'darts-good'); }
    if (S.left === 0) S.pause = 1.5;
    chalk();
  }
  function end(won) {
    S.on = false; S.over = true; S.won = won; S.pause = 2.5; S.wait = 0; N.n = 0; S.last = { won, stake: S.stake, who: S.who }; chalk();
    G.story?.onGame?.('darts', { won, stake: S.stake, who: S.who }); G.folk?.say?.(S.who, won ? 'darts-lose' : 'darts-win');
  }
  function turn(k) { S.turn = k; S.left = 3; S.start = S[k]; S.marks.length = 0; S.sum = 0; S.pause = 0; S.good = false; S.wait = k === 'them' ? (S.auto ? 4 : 0) : S.robot >= 0 ? 1.5 : 0; chalk(); }
  function want(r) { return r > 62 ? [20, 3] : r === 50 ? [25, 2] : r === 25 ? [25, 1] : r <= 20 ? [r, 1] : r <= 40 ? (r % 2 ? [r - 20, 1] : [r / 2, 2]) : r <= 60 && r % 3 === 0 ? [r / 3, 3] : [20, 1]; }
  function free(by) { const a = by === 'you' ? 0 : 3; let any = null; for (let i = 0; i < 6; i++) { const d = darts[(a + i) % 6]; if (d.held || d.st === 'fly' || d.st === 'home' || d.st === 'held') continue; if (d.st === 'rack') return d; any ||= d; } return any; }
  function toss(by, skill) {
    const d = free(by); if (!d) return false; const [n, m] = S.on ? want(S[by]) : [20, 3], a = aimAt(n, m), sig = lerp(0.09, 0.007, clamp(skill, 0, 1));
    launch(d, hand, _to.set(XB, a.y + gauss() * sig, a.z + gauss() * sig), 6 + rnd() * 0.8, by); return true;
  }
  function begin(by, skill) { if (N.n > 0 || (S.on && (S.turn !== by || S.left <= 0 || S.pause > 0))) return false; N.n = S.on ? S.left : 3; N.t = 0.5; N.by = by; N.skill = skill; S.wait = 0; return true; }

  function chalk() {
    const x = ctx, T = (s, px, X, Y, a = 0.92) => { x.globalAlpha = a; x.font = `${px}px Georgia, serif`; x.fillText(s, X, Y); };
    x.globalAlpha = 1; x.fillStyle = '#191b1a'; x.fillRect(0, 0, 256, 352); x.fillStyle = '#e9e6da'; x.strokeStyle = '#e9e6da'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (S.on || S.over) {
      T('301', 30, 128, 30, 0.7); T('YOU', 26, 66, 78); T(S.name, S.name.length > 6 ? 18 : 26, 190, 78); T(String(S.you), 54, 66, 134); T(String(S.them), 54, 190, 134);
      x.globalAlpha = 0.6; x.fillRect(127, 60, 2, 110); x.fillRect(14, 100, 228, 2); if (S.on) x.fillRect(S.turn === 'you' ? 26 : 150, 166, 80, 3);
      T(S.over ? (S.won ? 'YOU WIN' : S.name + ' WINS') : S.marks.join('  '), S.over ? 30 : 26, 128, 222); if (S.on && S.marks.length) T(String(S.sum), 34, 128, 268, 0.75);
      T('$' + (S.stake / 100).toFixed(2) + ' a side', 20, 128, 322, 0.65);
    } else { T('DARTS', 30, 128, 34, 0.7); x.globalAlpha = 0.6; x.fillRect(14, 62, 228, 2); for (let i = 0; i < S.marks.length; i++) T(S.marks[i], 44, 128, 112 + i * 56); if (S.marks.length) { x.globalAlpha = 0.6; x.fillRect(70, 268, 116, 2); T(String(S.sum), 44, 128, 308); } }
    x.globalAlpha = 1; slate.needsUpdate = true;
  }
  chalk();

  // ---- flight
  function edge(d) { const p = d.obj.position; let hit = false;
    if (p.x < XP + 0.02) { p.x = XP + 0.02; d.vel.x = Math.abs(d.vel.x) * 0.2; hit = true; } else if (p.x > R.W - 0.03) { p.x = R.W - 0.03; d.vel.x = -Math.abs(d.vel.x) * 0.2; hit = true; }
    if (p.z < -R.L + 0.03) { p.z = -R.L + 0.03; d.vel.z = Math.abs(d.vel.z) * 0.2; hit = true; } else if (p.z > R.B - 0.03) { p.z = R.B - 0.03; d.vel.z = -Math.abs(d.vel.z) * 0.2; hit = true; }
    if (p.y > R.H - 0.05) { p.y = R.H - 0.05; d.vel.y = -Math.abs(d.vel.y) * 0.2; hit = true; } return hit; }
  function lands(d, py) { const p = d.obj.position; let y = p.y <= 0.012 ? 0 : -1;
    if (y < 0 && d.vel.y < 0) for (const s of G.surfaces) if (p.x > s.minX && p.x < s.maxX && p.z > s.minZ && p.z < s.maxZ && py >= s.y + 0.012 && p.y <= s.y + 0.012) { y = s.y; break; }
    if (y < 0) return false;
    p.y = y + 0.012; _d.set(0, 0, -1).applyQuaternion(d.obj.quaternion); _d.y = 0; if (_d.lengthSq() < 1e-4) _d.set(0, 0, -1); look(_d.normalize(), d.obj.quaternion);
    d.vel.set(0, 0, 0); d.st = 'down'; d.t = 0; d.locked = false; G.audio.play('place', 0.5); out(d, null); return true; }
  function strike(d, X, y, z) {
    const p = d.obj.position, sp = -d.vel.x; _f.set(0, 0, -1).applyQuaternion(d.obj.quaternion);
    if (X !== XP && sp >= 1.8 && -_f.x >= 0.55) { p.set(X, y, z).addScaledVector(_f, 0.008 - TIP); d.vel.set(0, 0, 0); d.st = 'stuck'; d.locked = false; d.hy = y; d.hz = z; G.audio.play('dart'); out(d, X === XB ? scoreAt(y, z) : null); return; }
    p.set(X + 0.05, y, z); d.vel.set(0.4 + sp * 0.08, 0.5, d.vel.z * 0.2); fall(d, 7); G.audio.play('thunk', 0.4); out(d, null);
  }
  function fly(d, h) {
    const p = d.obj.position, v = d.vel, q = d.obj.quaternion, py = p.y;
    v.y -= GR * h; v.multiplyScalar(1 - DRAG * h); p.addScaledVector(v, h);
    look(_d.copy(v).normalize(), _q); if (d.snap) q.copy(_q); else q.slerp(_q, 1 - Math.exp(-9 * h));
    _t.set(0, 0, -TIP).applyQuaternion(q).add(p); const a = d.tip;
    if (_t.x < XF && a.x > _t.x) for (let i = 0; i < 5; i++) { const X = SURF[i]; if (a.x > X && _t.x <= X) { const f = (a.x - X) / (a.x - _t.x), y = lerp(a.y, _t.y, f), z = lerp(a.z, _t.z, f); if (depth(y, z) >= X - 1e-6) return strike(d, X, y, z); } }
    if (_t.x <= XP) return strike(d, XP, _t.y, _t.z);
    a.copy(_t); if (edge(d)) { fall(d, 6); G.audio.play('thunk', 0.3); return out(d, null); }
    lands(d, py);
  }
  function tumble(d, h) { const p = d.obj.position, py = p.y; d.vel.y -= GR * h; p.addScaledVector(d.vel, h); if (d.w > 0.05) { d.obj.quaternion.premultiply(_q.setFromAxisAngle(d.ax, d.w * h)); } edge(d); lands(d, py); }

  function update(dt) {
    for (let i = 0; i < 6; i++) { const d = darts[i];
      if (d.st === 'fly' || d.st === 'fall') { const n = Math.min(8, Math.ceil(dt / STEP - 1e-6)) || 1, h = dt / n; for (let k = 0; k < n && (d.st === 'fly' || d.st === 'fall'); k++) (d.st === 'fly' ? fly : tumble)(d, h); if ((d.st === 'fly' || d.st === 'fall') && (d.t += dt) > 6) { d.obj.position.y = 0.012; lands(d, 1); } }
      else if (d.st === 'home') { d.t = Math.min(1, d.t + dt * 2.2); const k = d.t * d.t * (3 - 2 * d.t); d.obj.position.lerpVectors(d.sp, d.hp, k); d.obj.position.x += Math.sin(k * Math.PI) * 0.12; d.obj.quaternion.slerpQuaternions(d.sq, d.hq, k); if (d.t >= 1) { d.st = 'rack'; d.locked = false; } }
      else if (d.st === 'down' && !S.on && (d.t += dt) > 10) home(d);
    }
    if (S.pause > 0 && (S.pause -= dt) <= 0) { collect(); if (S.on) turn(S.turn === 'you' ? 'them' : 'you'); }
    if (S.wait > 0 && S.on && (S.wait -= dt) <= 0) begin(S.turn, S.turn === 'you' ? S.robot : S.skill);
    if (N.n > 0) { if (S.on && (S.turn !== N.by || S.left <= 0)) N.n = 0; else if ((N.t -= dt) <= 0) { if (toss(N.by, N.skill)) { N.n--; N.t = 1.2; } else N.t = 0.3; } }
  }

  const state = () => ({ on: S.on, turn: S.turn, you: S.you, them: S.them, stake: S.stake, who: S.who, dartsLeft: S.left });
  function challenge(personId, stakeCents = 0, o = {}) {
    if (S.on) return false; if (typeof o === 'number') o = { skill: o };
    Object.assign(S, { on: true, over: false, you: 301, them: 301, stake: stakeCents | 0, who: personId, name: String(o.name ?? personId ?? 'THEM').toUpperCase().slice(0, 9), skill: o.skill ?? 0.5, auto: o.auto ?? true }); N.n = 0;
    collect(); turn(o.first === 'them' ? 'them' : 'you'); return true;
  }
  return {
    update, scoreAt, aimAt, challenge, state, darts, collect,
    npcTurn(skill) { if (skill !== undefined) S.skill = skill; return begin('them', S.skill); },
    quit() { if (!S.on) return; S.on = false; S.marks.length = 0; S.sum = 0; S.pause = 0; S.wait = 0; N.n = 0; collect(); chalk(); },
    board: { x: XB, y: CY, z: CZ, r: RB, k: K, oche: hand },
    // for tests: a dart thrown from the oche (or o.from) so its point arrives at (y, z) on the board's face (o.x another plane), where the darts are, a whole game at once
    throwAt(y, z, o = {}) { const d = o.i !== undefined ? darts[o.i] : free(o.by || 'you'); if (!d || d.held) return -1; launch(d, o.from ? _from.copy(o.from) : hand, _to.set(o.x ?? XB, y, z), o.speed ?? 6.4, o.by || 'you'); return d.i; },
    list: () => darts.map((d) => ({ i: d.i, flight: d.i < 3 ? 'red' : 'green', st: d.st, by: d.by, x: d.obj.position.x, y: d.obj.position.y, z: d.obj.position.z, hy: d.hy, hz: d.hz, pts: d.pts, label: d.label })),
    seed(n) { let a = n >>> 0; rnd = n === undefined ? Math.random : () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
    play(o = {}) { if (!challenge(o.who ?? 'test', o.stake ?? 0, { skill: o.them ?? 0.6 })) return null; S.robot = o.you ?? 0.6; turn('you'); let n = 0; while (S.on && n++ < 200000) update(1 / 60); S.robot = -1; return { steps: n, you: S.you, them: S.them, ...S.last }; },
  };
}
