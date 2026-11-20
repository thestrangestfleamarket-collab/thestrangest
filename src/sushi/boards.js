// the boards that float by the cook (the guide's card with the stock, the settings, the dawn card): each has its own place, none over another; any of them is taken by a grip in the headset or a held click on a screen and stays where it is left (kept in the browser, per viewer); a board that is called up comes before you, moved aside if another is there
import * as THREE from 'three';
import { G, V3, Q } from './ctx.js';

const KEY = 'ramen-boards', _a = new V3(), _b = new V3(), _q = new Q(), _m = new THREE.Matrix4(), _pl = new THREE.Plane(), _n = new V3();
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
const write = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* not kept */ } };
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function buildBoards() {
  const B = { list: [], held: null }, saved = read();
  // a board: its mesh (a plane w by h metres, facing +z), where it stands unless moved
  B.add = (id, mesh, w, h, o = {}) => { const r = { id, mesh, w, h, def: { p: mesh.position.clone(), q: mesh.quaternion.clone() }, moved: false, by: null, rel: new THREE.Matrix4(), keep: o.keep !== false }; B.list.push(r);
    const s = r.keep && saved[id]; if (Array.isArray(s) && s.length === 7 && s.every(Number.isFinite)) { mesh.position.fromArray(s); mesh.quaternion.fromArray(s, 3); r.moved = true; } return r; };
  B.drop = (r) => { const i = B.list.indexOf(r); if (i >= 0) B.list.splice(i, 1); if (B.held === r) B.held = null; };
  B.save = (r) => { r.moved = true; if (!r.keep) return; saved[r.id] = [...r.mesh.position.toArray(), ...r.mesh.quaternion.toArray()].map((v) => +v.toFixed(4)); write(saved); };
  B.reset = () => { for (const r of B.list) { r.mesh.position.copy(r.def.p); r.mesh.quaternion.copy(r.def.q); r.moved = false; delete saved[r.id]; } write(saved); };
  const shown = (r) => { for (let o = r.mesh; o; o = o.parent) if (!o.visible) return false; return true; };
  // what a rectangle takes of the view from an eye: its corners as angles (az to the right of straight ahead along -z, el up)
  B.rect = (p, q, w, h, eye) => { let a0 = 9, a1 = -9, e0 = 9, e1 = -9, mid = 0; _a.copy(p).sub(eye); mid = Math.atan2(_a.x, -_a.z);
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { _a.set(sx * w / 2, sy * h / 2, 0).applyQuaternion(q).add(p).sub(eye); const az = mid + wrap(Math.atan2(_a.x, -_a.z) - mid), el = Math.atan2(_a.y, Math.hypot(_a.x, _a.z)); a0 = Math.min(a0, az); a1 = Math.max(a1, az); e0 = Math.min(e0, el); e1 = Math.max(e1, el); }
    return { a0, a1, e0, e1 }; };
  B.of = (r, eye) => { r.mesh.updateWorldMatrix(true, false); return B.rect(r.mesh.getWorldPosition(new V3()), r.mesh.getWorldQuaternion(new Q()), r.w, r.h, eye); };
  B.over = (x, y, pad = 0) => { const d = wrap((x.a0 + x.a1) / 2 - (y.a0 + y.a1) / 2); return Math.abs(d) < (x.a1 - x.a0 + y.a1 - y.a0) / 2 + pad && x.e0 < y.e1 + pad && y.e0 < x.e1 + pad; };
  // call a board up: before the eyes at dist, upright, turned aside past any other board that is in its way
  B.summon = (r, dist = 0.6, low = 0.1) => { const c = G.camera, eye = c.getWorldPosition(new V3()), d = c.getWorldDirection(new V3()); d.y = 0; if (d.lengthSq() < 1e-4) d.set(0, 0, -1); d.normalize();
    if (r.moved) return;
    const y = Math.max(1.15, eye.y - low), at = (az) => { r.mesh.position.set(eye.x + Math.sin(az) * dist, y, eye.z - Math.cos(az) * dist); r.mesh.lookAt(eye.x, y, eye.z); r.mesh.updateMatrixWorld(true); };
    const az0 = Math.atan2(d.x, -d.z), others = B.list.filter((o) => o !== r && shown(o)).map((o) => B.of(o, eye)), free = (az) => { at(az); const me = B.of(r, eye); return !others.some((o) => B.over(me, o, 0.03)); };
    for (let k = 0; k <= 36; k++) { const s = (k + 1) >> 1, az = az0 + (k % 2 ? -1 : 1) * s * 0.07; if (free(az)) break; }
    r.def.p.copy(r.mesh.position); r.def.q.copy(r.mesh.quaternion); };
  // where a ray meets a shown board: { r, u, v (0..1 from its left and top), d }
  B.hit = (origin, dir, only) => { let best = null;
    for (const r of only ? [only] : B.list) { if (!shown(r)) continue; r.mesh.updateWorldMatrix(true, false); _n.set(0, 0, 1).transformDirection(r.mesh.matrixWorld); _pl.setFromNormalAndCoplanarPoint(_n, _a.setFromMatrixPosition(r.mesh.matrixWorld));
      const den = _n.dot(dir); if (Math.abs(den) < 1e-5) continue; const t = -(_n.dot(origin) + _pl.constant) / den; if (t < 0.02 || t > 4 || (best && t > best.d)) continue;
      r.mesh.worldToLocal(_b.copy(dir).multiplyScalar(t).add(origin)); if (Math.abs(_b.x) > r.w / 2 || Math.abs(_b.y) > r.h / 2) continue; best = { r, u: _b.x / r.w + 0.5, v: 0.5 - _b.y / r.h, d: t }; }
    return best; };
  const take = (r, by, m) => { r.by = by; B.held = r; r.rel.copy(m).invert().multiply(r.mesh.matrixWorld); };
  const carry = (r, m) => { _m.copy(m).multiply(r.rel).decompose(r.mesh.position, r.mesh.quaternion, _a); if (r.mesh.parent && r.mesh.parent !== G.scene) { r.mesh.parent.updateWorldMatrix(true, false); r.mesh.parent.worldToLocal(r.mesh.position); r.mesh.quaternion.premultiply(r.mesh.parent.getWorldQuaternion(_q).invert()); } r.mesh.updateMatrixWorld(true); };
  const hm = new THREE.Matrix4(), one = new V3(1, 1, 1);
  // on a screen (input.js, before the hand acts): a click held on a board carries it at the crosshair; one let go at once is a press on it
  B.desk = (ray, aim, h) => { const r = B.held; aim.board = null;
    if (r && r.by === h) { if (h.grip) { hm.compose(_a.copy(ray.direction).multiplyScalar(r.dist).add(ray.origin), G.camera.getWorldQuaternion(_q), one); if (G.t - r.t0 > 0.22) { carry(r, hm); r.dragged = true; } aim.cand = aim.button = null; aim.board = r; return true; }
      r.by = null; B.held = null; if (r.dragged) B.save(r); else if (r.press) r.press(B.hit(ray.origin, ray.direction, r)); r.dragged = false; return false; }
    const hit = B.hit(ray.origin, ray.direction); if (!hit || hit.d > aim.dist + 0.02 || h.held) return false;
    aim.cand = aim.button = null; aim.board = hit.r; aim.dist = hit.d; if (hit.r.hover) hit.r.hover(hit);
    if (h.gripDown) { hit.r.dist = hit.d; hit.r.t0 = G.t; hit.r.dragged = false; hm.compose(_a.copy(ray.direction).multiplyScalar(hit.d).add(ray.origin), G.camera.getWorldQuaternion(_q), one); take(hit.r, h, hm); h.gripDown = false; }
    return true; };
  // in the headset (input.js, each hand before it acts): a grip closed on a board (within a hand's breadth of it) carries it; a controller pointed at one shows where (r.hover) and its trigger presses there (r.press); true while the hand is busy with a board
  B.xr = (h, cand) => { hm.compose(h.pos, h.quat, one);
    if (h.board) { if (h.grip) { carry(h.board, hm); return true; } B.save(h.board); h.board.by = null; h.board = null; B.held = null; return true; }
    if (h.held) return false;
    if (h.gripDown && !cand()) { let best = null, bd = 0.1; for (const r of B.list) { if (!shown(r) || r.by) continue; r.mesh.updateWorldMatrix(true, false); r.mesh.worldToLocal(_b.copy(h.pos)); const dx = Math.max(0, Math.abs(_b.x) - r.w / 2), dy = Math.max(0, Math.abs(_b.y) - r.h / 2), d = Math.hypot(dx, dy, _b.z); if (d < bd) { bd = d; best = r; } }
      if (best) { take(best, h, hm); h.board = best; h.pulse(0.5, 30); return true; } }
    if (h.source?.hand) return false; _a.set(0, 0, -1).applyQuaternion(h.quat); const hit = B.hit(h.pos, _a); if (hit && hit.r.hover) { hit.r.hover(hit, h); if (h.useDown && hit.r.press) { hit.r.press(hit); h.pulse(0.6, 30); h.useDown = false; } }
    return false; };
  B.update = () => { for (const h of G.hands) if (h.xr && !h.active && h.board) { B.save(h.board); h.board.by = null; h.board = null; B.held = null; } };
  G.boards = B; return B;
}
