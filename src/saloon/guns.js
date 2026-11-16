// the guns under the bar: a Colt Single Action Army and a double-barrel coach gun, the box of cartridges, and the one path every shot in the room takes (yours and the town's): who and what it hits, the holes, the flash and the smoke
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
import { G } from '../sushi/ctx.js';
import { Item, Prop } from '../sushi/items.js';
import { plain, brass, pbr, canvasTex, glow } from './kit.js';

const V3 = THREE.Vector3, V2 = THREE.Vector2;
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3(), _n = new V3(), _u = new V3(), _w = new V3(), _fd = new V3(), _rd = new V3(), _vel = new V3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _e = new THREE.Euler(), _s = new V3();
const FWD = new V3(0, 0, 1), UPV = new V3(0, 1, 0), TURN = new THREE.Quaternion().setFromAxisAngle(UPV, Math.PI);
const TINT = { steel: 0x2b3340, frame: 0x4a4947, wood: 0x4e3424, brass: 0xb08a3a, dark: 0x040404 };

// ---------- shapes: u runs forward along the barrel, v up; a gun points down -z
const ext = (pts, t, bevel = 0, hole, off = -bevel) => {
  const s = new THREE.Shape(pts.map(([u, v]) => new V2(u, v))); if (hole) s.holes.push(new THREE.Path(hole.map(([u, v]) => new V2(u, v))));
  const d = t - bevel * 2, g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: off, bevelSegments: 2, curveSegments: 4 });
  return g.translate(0, 0, -d / 2).rotateY(Math.PI / 2);
};
const ell = (cu, cv, ru, rv, n = 28) => Array.from({ length: n }, (_, i) => [cu + Math.cos(i / n * Math.PI * 2) * ru, cv + Math.sin(i / n * Math.PI * 2) * rv]);
const rod = (r0, r1, u0, u1, x, v, seg = 20) => new THREE.CylinderGeometry(r0, r1, u1 - u0, seg).rotateX(Math.PI / 2).translate(x, v, -(u0 + u1) / 2);
const disc = (r, u, x, v, back, seg = 16) => { const g = new THREE.CircleGeometry(r, seg); if (!back) g.rotateY(Math.PI); return g.translate(x, v, -u); };
const join = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));
const side = (g, x) => g.translate(x, 0, 0);

const sm = (pts, n = 4, closed = false) => { const l = new THREE.CatmullRomCurve3(pts.map(([u, v]) => new V3(u, v, 0)), closed, 'centripetal').getPoints(pts.length * n).map((q) => [q.x, q.y]); if (closed) l.pop(); return l; };

function revolverParts() {
  const P = [], add = (g, m, part = 'body') => P.push({ g, m, part }), B = 0.068, C = 0.0545;
  add(ext([[0.022, 0.0835], [0.086, 0.0835], [0.088, 0.06], [0.086, 0.04], [0.078, 0.024], [0.04, 0.021], [0.016, 0.0215],
    ...sm([[0.012, 0.021], [0.006, 0.014], [-0.001, 0.002], [-0.006, -0.014], [-0.006, -0.03], [-0.003, -0.046], [-0.005, -0.055]]).reverse(), [-0.03, -0.0585], [-0.05, -0.0545],
    ...sm([[-0.004, 0.058], [-0.012, 0.042], [-0.024, 0.026], [-0.034, 0.008], [-0.043, -0.012], [-0.051, -0.03], [-0.056, -0.047]]).reverse(), [0, 0.068], [0.006, 0.077], [0.014, 0.082]], 0.016, 0.0012,
    [[0.029, 0.0325], [0.072, 0.0325], [0.072, 0.0765], [0.029, 0.0765]]), 'frame');
  add(rod(0.0215, 0.0215, 0.021, 0.029, 0, C, 24), 'frame');
  add(ext(sm([[-0.001, 0.011], [-0.0075, 0], [-0.0125, -0.014], [-0.0125, -0.03], [-0.0095, -0.044], [-0.013, -0.0495], [-0.03, -0.052], [-0.046, -0.0485], [-0.0495, -0.043], [-0.0455, -0.03], [-0.0375, -0.012], [-0.0285, 0.007], [-0.019, 0.024]], 3, true), 0.034, 0.004, null, 0), 'wood');
  add(rod(0.0098, 0.0088, 0.086, 0.226, 0, B, 20), 'steel');
  add(rod(0.0048, 0.0048, 0.088, 0.176, 0.0088, B - 0.0108, 10), 'steel'); add(new THREE.SphereGeometry(0.0048, 10, 6).translate(0.0088, B - 0.0108, -0.176), 'steel');
  add(rod(0.0032, 0.0032, 0.086, 0.098, 0, C, 8), 'steel'); add(rod(0.0046, 0.0046, 0.098, 0.1015, 0, C, 10), 'steel');
  add(ext([[0.205, B + 0.008], [0.222, B + 0.008], [0.2195, B + 0.0145], [0.2125, B + 0.0165], [0.207, B + 0.012]], 0.0022), 'steel');
  add(ext(ell(0.034, 0.008, 0.027, 0.019), 0.011, 0.0008, ell(0.034, 0.008, 0.0238, 0.0158)), 'steel');
  add(ext(sm([[0.031, 0.022], [0.0355, 0.022], [0.0345, 0.012], [0.031, 0.004], [0.028, 0.0035], [0.0305, 0.012]], 3, true), 0.005), 'steel');
  for (const [u, v] of [[0.058, 0.03], [0.014, 0.036], [0.02, 0.026]]) for (const s of [-1, 1]) add(rod(0.0022, 0.0022, 0, 0.0006, 0, 0, 8).rotateY(Math.PI / 2).translate(s * 0.0082, v, -u), 'steel');
  add(disc(0.0058, 0.2262, 0, B), 'dark'); for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + i * Math.PI / 3; add(disc(0.0058, 0.0713, Math.cos(a) * 0.0135, C + Math.sin(a) * 0.0135, false, 10), 'dark'); }
  // the cylinder: six flutes between its chambers
  const fl = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, w = Math.max(0, (Math.cos(6 * a) - 0.25) / 0.75), r = 0.0208 - 0.0036 * w * w * (3 - 2 * w); fl.push(new V2(Math.cos(a) * r, Math.sin(a) * r)); }
  add(new THREE.ExtrudeGeometry(new THREE.Shape(fl), { depth: 0.026, bevelEnabled: false }).translate(0, C, -0.071), 'steel', 'cyl'); add(rod(0.0208, 0.0208, 0.03, 0.045, 0, C, 28), 'steel', 'cyl');
  add(ext(sm([[0.006, 0.046], [0.0155, 0.064], [0.0135, 0.083], [0.007, 0.0905], [-0.001, 0.092], [-0.009, 0.097], [-0.017, 0.1045], [-0.0215, 0.1035], [-0.02, 0.099], [-0.012, 0.09], [-0.006, 0.079], [-0.004, 0.064], [-0.005, 0.05]], 3, true), 0.0075, 0.0008), 'frame', 'ham0');
  return { P, grip: [-0.024, -0.012], muzzle: [0.228, B], box: [-0.056, 0.226, -0.0585, 0.105, 0.017], pivots: { cyl: [0, C, 0], ham0: [0, 0.05, -0.004] }, cockA: 0.72 };
}

function shotgunParts() {
  const P = [], add = (g, m, part = 'body') => P.push({ g, m, part }), B = 0.034, X = 0.0118;
  add(ext([[0.02, 0.044], [0.05, 0.048], [0.085, 0.048], [0.085, 0.021], [0.126, 0.021], [0.129, 0.008], [0.124, -0.003], [0.06, -0.01], [0.02, -0.012], [0.014, 0.016]], 0.046, 0.003), 'frame');
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.0128, 14, 10).translate(s * X, B + 0.003, -0.079), 'frame');
    add(side(ext(sm([[0.085, 0.045], [0.086, 0.018], [0.06, 0.004], [0.02, 0.001], [-0.012, 0.007], [-0.022, 0.016], [-0.01, 0.027], [0.02, 0.037], [0.05, 0.045]], 3, true), 0.004, 0.0008), s * 0.0235), 'frame');
    add(rod(0.0024, 0.0024, 0, 0.0006, 0, 0, 8).rotateY(Math.PI / 2).translate(s * 0.0258, 0.012, 0.004), 'steel'); }
  add(ext([[0.022, 0.04], [0, 0.022], [-0.035, 0.015], [-0.062, 0.02], [-0.08, 0.026], [-0.305, 0.006], [-0.31, 0], [-0.3, -0.12], [-0.2, -0.076], [-0.08, -0.03], [-0.03, -0.022], [0, -0.02], [0.022, -0.012]], 0.042, 0.009), 'wood');
  add(ext([[-0.309, 0.005], [-0.314, 0], [-0.304, -0.121], [-0.299, -0.121]], 0.036, 0.001), 'frame');
  add(ext(ell(0.045, -0.022, 0.036, 0.019), 0.013, 0.0008, ell(0.045, -0.022, 0.0328, 0.0158)), 'steel');
  for (const [du, x] of [[0, 0.005], [-0.014, -0.005]]) add(side(ext(sm([[0.05, -0.01], [0.056, -0.01], [0.0545, -0.022], [0.0495, -0.032], [0.0465, -0.032], [0.05, -0.022]].map(([u, v]) => [u + du, v]), 3, true), 0.004), x), 'steel');
  for (const s of [-1, 1]) { add(rod(0.0118, 0.0104, 0.085, 0.593, s * X, B, 16), 'steel', 'brl'); add(disc(0.0088, 0.5932, s * X, B, false, 12), 'dark', 'brl'); add(disc(0.0105, 0.0848, s * X, B, true, 14), 'brass', 'brl'); add(disc(0.003, 0.0846, s * X, B, true, 8), 'dark', 'brl'); }
  add(new THREE.BoxGeometry(0.007, 0.004, 0.506).translate(0, B + 0.0095, -0.339), 'steel', 'brl'); add(new THREE.BoxGeometry(0.007, 0.004, 0.46).translate(0, B - 0.0095, -0.362), 'steel', 'brl');
  add(new THREE.SphereGeometry(0.0026, 8, 6).translate(0, B + 0.0125, -0.585), 'brass', 'brl');
  add(ext([[0.131, 0.028], [0.34, 0.0265], [0.348, 0.018], [0.33, 0.008], [0.15, 0.002], [0.131, 0.007]], 0.048, 0.008), 'wood', 'brl');
  const ham = sm([[0.031, 0.022], [0.047, 0.02], [0.054, 0.03], [0.062, 0.04], [0.076, 0.046], [0.078, 0.052], [0.072, 0.058], [0.06, 0.056], [0.05, 0.058], [0.042, 0.068], [0.032, 0.082], [0.024, 0.084], [0.022, 0.08], [0.031, 0.066], [0.034, 0.052], [0.03, 0.04], [0.027, 0.03]], 3, true);
  add(side(ext(ham, 0.006, 0.0008), 0.0285), 'frame', 'ham0'); add(side(ext(ham, 0.006, 0.0008), -0.0285), 'frame', 'ham1');
  return { P, grip: [-0.005, 0], muzzle: [0.6, B], box: [-0.314, 0.593, -0.122, 0.085, 0.03], pivots: { brl: [0, 0.014, -0.126], ham0: [0, 0.03, -0.04], ham1: [0, 0.03, -0.04] }, cockA: 0.7 };
}

let MAT = null, cheapMat = null;
const mats = () => (MAT ||= { steel: plain(TINT.steel, { rough: 0.34, metal: 0.8, env: 1.4 }), frame: plain(TINT.frame, { rough: 0.4, metal: 0.8, env: 1.3 }), wood: pbr('walnut', { color: 0x705848, rough: 0.55, env: 0.9 }), brass: brass(), dark: plain(TINT.dark, { rough: 0.95 }) });
// one moving piece of a gun (or its still body): a group at its pivot, one mesh a material
function piece(D, part, parent) {
  const g = new THREE.Group(), pv = D.pivots[part] || [0, 0, 0], M = mats(); g.position.set(pv[0], pv[1], pv[2]);
  for (const m in M) { const list = D.P.filter((p) => p.part === part && p.m === m); if (!list.length) continue; const geo = join(list.map((p) => p.g)).translate(-pv[0], -pv[1], -pv[2]);
    if (m === 'wood') { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 5, uv.getY(i) * 5); }
    g.add(new THREE.Mesh(geo, M[m])); }
  parent.add(g); return g;
}
// the whole gun as one mesh, coloured by the corner, its grip at the origin: what a townsman carries
function cheap(D) {
  const col = new THREE.Color(), list = D.P.map((p) => { const g = p.g.index ? p.g.toNonIndexed() : p.g.clone(), n = g.attributes.position.count, c = new Float32Array(n * 3); col.setHex(TINT[p.m]); for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g; });
  const geo = mergeGeometries(list).translate(0, -D.grip[1], D.grip[0]); geo.deleteAttribute('uv');
  return { geo, muzzle: new V3(0, D.muzzle[1] - D.grip[1], -(D.muzzle[0] - D.grip[0])) };
}

export function buildGuns(scene, room) {
  const SHELF = 0.64, shot = { from: new V3(), dir: new V3(), by: 'you', kind: 'revolver', gun: null }, how = { by: 'you', dmg: 0, kind: 'revolver', head: false };
  const last = { person: null, you: false, point: new V3(), dist: 0, wall: false };
  let shots = 0, holes = 0, box = null;

  // ---------- flash, smoke, holes: made once, used again
  const flashTex = canvasTex(128, 128, (x) => { x.translate(64, 64); const g = x.createRadialGradient(0, 0, 0, 0, 0, 62); g.addColorStop(0, 'rgba(255,250,230,1)'); g.addColorStop(0.25, 'rgba(255,200,110,.8)'); g.addColorStop(1, 'rgba(255,120,30,0)'); x.fillStyle = g;
    x.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, r = i % 2 ? 16 + Math.random() * 10 : 40 + Math.random() * 22; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); });
  const smokeTex = canvasTex(64, 64, (x) => { for (let i = 0; i < 14; i++) { const cx = 32 + (Math.random() - 0.5) * 22, cy = 32 + (Math.random() - 0.5) * 22, r = 9 + Math.random() * 11, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); } });
  const fxRoot = new THREE.Group(); scene.add(fxRoot);
  const flashes = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; s.userData.nopick = true; fxRoot.add(s); return { s, life: 0 }; });
  const puffs = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; s.userData.nopick = true; fxRoot.add(s); return { s, v: new V3(), life: 0, span: 1, k: 1, grow: 0 }; });
  const light = new THREE.PointLight(0xffc27a, 0, 8, 1.8); scene.add(light);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffc890, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); halo.visible = false; halo.userData.nopick = true; fxRoot.add(halo);
  let fi = 0, pi = 0, lightT = 0;
  const puff = (p, v, size, span, k, color) => { const o = puffs[pi++ % puffs.length]; o.s.visible = true; o.s.position.copy(p); o.v.copy(v); o.life = o.span = span; o.k = k; o.grow = size * 1.6; o.s.scale.setScalar(size); o.s.material.color.setHex(color); o.s.material.rotation = Math.random() * 6.28; o.s.material.opacity = 0; };
  function flash(from, dir, big) {
    const f = flashes[fi++ % flashes.length], sz = big ? 0.6 : 0.36; f.s.visible = true; f.life = 0.07; f.s.position.copy(from).addScaledVector(dir, sz * 0.25); f.s.scale.setScalar(sz * (0.85 + Math.random() * 0.3)); f.s.material.rotation = Math.random() * 6.28;
    light.position.copy(from).addScaledVector(dir, 0.15); light.intensity = big ? 46 : 30; lightT = 0.09; halo.visible = true; halo.position.copy(light.position); halo.scale.setScalar(big ? 1.7 : 1.1);
    for (let i = 0, n = big ? 5 : 3; i < n; i++) puff(_a.copy(from).addScaledVector(dir, 0.08 + i * 0.07), _b.copy(dir).multiplyScalar(0.9 - i * 0.12).add(_c.set((Math.random() - 0.5) * 0.25, 0.1 + Math.random() * 0.15, (Math.random() - 0.5) * 0.25)), big ? 0.2 : 0.13, 1.8 + Math.random() * 0.8, big ? 0.34 : 0.28, 0xd8d4cc);
  }
  const HOLES = 40, holeTex = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.36, 'rgba(6,4,3,1)'); g.addColorStop(0.5, 'rgba(40,28,18,.75)'); g.addColorStop(1, 'rgba(60,44,30,0)'); x.fillStyle = g; x.beginPath(); for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = i % 2 ? 19 + Math.random() * 6 : 26 + Math.random() * 6; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.fill(); });
  const decals = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), HOLES);
  decals.count = 0; decals.frustumCulled = false; decals.userData.nopick = true; decals.renderOrder = 2; fxRoot.add(decals);
  function hole(p, n, r) { _q.setFromUnitVectors(FWD, n); _m.compose(_a.copy(p).addScaledVector(n, 0.004), _q.multiply(_qz.setFromAxisAngle(FWD, Math.random() * 6.28)), _s.setScalar(r)); decals.setMatrixAt(holes % HOLES, _m); holes++; decals.count = Math.min(holes, HOLES); decals.instanceMatrix.needsUpdate = true; }
  const _qz = new THREE.Quaternion();

  // ---------- the room as something a ball can strike: its still meshes, each given a tree of its triangles a few a frame
  const rc = new THREE.Raycaster(), hits = [], todo = []; rc.firstHitOnly = true; let scanned = false;
  const seen = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

  // one ball (or one pellet) from `from` along `dir`
  function ray(from, dir, by, sg, i, gun) {
    let far = 40, wall = null; last.person = null; last.you = false; last.wall = false;
    rc.set(from, dir); rc.far = far; hits.length = 0; rc.intersectObject(room.group, true, hits);
    for (const h of hits) if (seen(h.object)) { wall = h; far = h.distance; break; }
    let who = G.folk?.rayHit?.(from, dir, far, by) || null;
    if (who && (who.person === by || (who.person && who.person.id === by) || !(who.dist < far))) who = null;
    if (who) far = who.dist;
    let you = false, head = false;
    if (by !== 'you' && G.camera) { // you: a post from the floor to the top of your head
      G.camera.getWorldPosition(_a); const ox = from.x - _a.x, oz = from.z - _a.z, A = dir.x * dir.x + dir.z * dir.z, Bq = ox * dir.x + oz * dir.z, Cq = ox * ox + oz * oz - 0.0484, D = Bq * Bq - A * Cq;
      if (A > 1e-9 && D > 0) { const t = (-Bq - Math.sqrt(D)) / A, y = from.y + dir.y * t; if (t > 0 && t < far && y > 0 && y < _a.y + 0.13) { you = true; head = y > _a.y - 0.2; far = t; who = null; } } }
    for (let k = G.items.length - 1; k >= 0; k--) { // loose things in the way: glass breaks, the rest is knocked flying
      const it = G.items[k]; if (!it || it.dead || it === gun || it.kind === 'debris' || (it.held && it.kind === 'gun')) continue;
      it.worldCenter(_b).sub(from); const t = _b.dot(dir); if (t < 0 || t > far || _b.lengthSq() - t * t > it.radius * it.radius) continue;
      if (it.onImpact(10) === true || it.dead || it.held || it.locked) continue;
      it.drop(_vel.copy(dir).multiplyScalar(sg ? 1.6 : 3).setY(1 + Math.random())); }
    for (const l of room.lamps) { if (!l.on || l === room.fire || !l.s.visible) continue; _b.set(l.x, l.y, l.z).sub(from); const t = _b.dot(dir); if (t < 0 || t > far || _b.lengthSq() - t * t > 0.0625) continue;
      room.lampOut(l); G.audio?.play('break'); G.fx?.drops?.(_b.set(l.x, l.y, l.z), 0xffd9a0, 8); }
    last.dist = far; last.point.copy(from).addScaledVector(dir, far);
    if (you) { last.you = true; G.audio?.play('hit'); G.story?.youShot?.(sg ? 22 : head ? 100 : 60, by); }
    else if (who) { last.person = who.person; if (who.point) last.point.copy(who.point); how.by = by; how.kind = sg ? 'shotgun' : 'revolver'; how.head = !!who.head; how.dmg = sg ? 22 : who.head ? 100 : 60; if (i === 0) G.audio?.play('hit'); G.folk?.shot?.(who.person, last.point, dir, how); }
    else if (wall) { last.wall = true; last.point.copy(wall.point);
      if (wall.face && wall.object.material.isMeshStandardMaterial) { _n.copy(wall.face.normal).transformDirection(wall.object.matrixWorld); if (_n.dot(dir) > 0) _n.negate(); hole(wall.point, _n, sg ? 0.011 : 0.02);
        if (i < 2) puff(_a.copy(wall.point).addScaledVector(_n, 0.03), _b.copy(_n).multiplyScalar(0.35).setY(_n.y * 0.35 + 0.12), 0.07, 0.9, 0.5, 0xa89070); }
      if (!sg && Math.random() < 0.22) G.audio?.play('ricochet'); }
  }

  // every shot fired in the room, by anyone
  function fire(o) {
    const sg = o.kind === 'shotgun', by = o.by ?? 'you', n = sg ? 9 : 1, sp = o.spread ?? (sg ? 0.055 : 0);
    _fd.copy(o.dir).normalize(); flash(o.from, _fd, sg); G.audio?.play(sg ? 'boom' : 'shot'); shots++;
    _u.crossVectors(_fd, UPV); if (_u.lengthSq() < 1e-4) _u.set(1, 0, 0); _u.normalize(); _w.crossVectors(_fd, _u);
    for (let i = 0; i < n; i++) { _rd.copy(_fd); if (sp) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * sp; _rd.addScaledVector(_u, Math.cos(a) * r).addScaledVector(_w, Math.sin(a) * r).normalize(); } ray(o.from, _rd, by, sg, i, o.gun); }
    G.folk?.heard?.('shot', o.from, by);
    return last;
  }

  // ---------- a gun you hold
  class Gun extends Item {
    constructor(type, D, o) {
      const obj = new THREE.Group(), [u0, u1, v0, v1, hx] = D.box, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, at = (u, v, out) => out.set(0, v - cv, -(u - cu));
      super('gun', obj, { name: o.name, radius: o.radius, cy: 0, base: hx, lift: 0 });
      this.type = type; this.col = { t: 'box', hx, hy: (v1 - v0) / 2, hz: (u1 - u0) / 2, cy: 0 }; this.mass = o.mass;
      this.grip = at(D.grip[0], D.grip[1], new V3()); this.muzzle = at(D.muzzle[0], D.muzzle[1], new V3()); this.view = o.view; this.handles = [this.grip];
      this.kickG = new THREE.Group(); this.kickG.position.copy(this.grip); obj.add(this.kickG);
      const body = new THREE.Group(); body.position.set(0, -cv, cu).sub(this.grip); this.kickG.add(body);
      piece(D, 'body', body); this.cyl = D.pivots.cyl ? piece(D, 'cyl', body) : null; this.brl = D.pivots.brl ? piece(D, 'brl', body) : null;
      this.hams = ['ham0', 'ham1'].filter((k) => D.pivots[k]).map((k) => piece(D, k, body)); this.hamV = this.hams.map(() => 0); this.cockA = D.cockA;
      this.cap = this.rounds = o.cap; this.armed = false; this.cockT = 0; this.rec = 0; this.cylA = 0; this.cylT = 0; this.loadT = 0; this.downT = 0; this.open = 0; this.loading = false; this.kickK = o.kick;
    }
    onGround() { }
    upright() { _e.setFromQuaternion(this.obj.quaternion, 'YXZ'); this.obj.quaternion.setFromEuler(_e.set(0, _e.y, Math.PI / 2, 'YXZ')); }
    onGrab(h) { if (h.xr) { this.obj.quaternion.copy(h.quat); this.obj.position.copy(this.grip).applyQuaternion(h.quat).negate().add(h.pos); } if (!this.armed) this.cockT = 0.12; this.downT = 0; }
    onRelease() { this.loading = false; return false; }
    hint() { return this.loading ? 'loading' : this.rounds ? `${this.rounds} of ${this.cap}: RMB or E fires` : 'empty: point it at the floor, or hold it to the cartridges'; }
    aim(from, dir) { from.copy(this.muzzle).applyQuaternion(this.obj.quaternion).add(this.obj.position); dir.set(0, 0, -1).applyQuaternion(this.obj.quaternion); }
    // the trigger: 'shot', 'click' on an empty chamber, 'wait' while the hammer is not back
    pull(h) {
      if (this.loading || !this.armed || this.cockT > 0) return 'wait';
      if (this.type === 'revolver') { this.armed = false; this.cockT = 0.16; this.hamV[0] = 0; } else this.cockT = 0.2;
      if (this.rounds <= 0) { G.audio?.play('click'); h?.pulse?.(0.3, 20); return 'click'; }
      if (this.type === 'shotgun') this.hamV[this.cap - this.rounds] = 0;
      this.rounds--; this.aim(shot.from, shot.dir); shot.kind = this.type; shot.gun = this; fire(shot);
      this.rec = 1; h?.pulse?.(1, 80); if (h && !h.xr && G.desk) G.desk.pitch = Math.min(1.2, G.desk.pitch + this.kickK * 0.09);
      return 'shot';
    }
    onHeld(dt, h) {
      const o = this.obj;
      if (!h.xr) { // on a screen: carried low at the right, levelled where you look
        G.camera.getWorldPosition(_a); G.camera.getWorldQuaternion(_q); _b.copy(this.view).applyQuaternion(_q).add(_a); _c.set(0, 0, -9).applyQuaternion(_q).add(_a);
        _m.lookAt(_b, _c, _d.set(0, 1, 0).applyQuaternion(_q)); o.quaternion.setFromRotationMatrix(_m); o.position.copy(this.grip).applyQuaternion(o.quaternion).negate().add(_b); }
      _b.copy(this.grip).applyQuaternion(o.quaternion).add(o.position); _d.set(0, 0, -1).applyQuaternion(o.quaternion);
      this.downT = _d.y < -0.75 ? this.downT + dt : 0;
      const near = box && !box.dead && (box.worldCenter(_c).distanceTo(_b) < 0.3 || (!h.xr && _c.distanceTo(h.pos) < 0.2));
      this.loading = this.rounds < this.cap && (near || this.downT > 2 || (this.loading && this.downT > 0));
      if (this.loading) { this.loadT += dt; const step = this.type === 'revolver' ? 0.22 : 0.55;
        if (this.loadT >= step) { this.loadT = 0; this.rounds = this.type === 'revolver' ? this.rounds + 1 : this.cap; if (this.type === 'revolver') this.cylT += Math.PI / 3; G.audio?.play('click'); h.pulse(0.4, 20);
          if (this.rounds >= this.cap) { this.loading = false; this.downT = 0; if (this.type === 'shotgun') this.armed = false; if (!this.armed) this.cockT = 0.25; } } }
      else this.loadT = 0;
      if (h.useDown) this.pull(h);
    }
    update(dt) {
      if (this.held && !this.armed && !this.loading && (this.cockT -= dt) <= 0) { this.armed = true; this.cockT = 0; this.cylT += this.cyl ? Math.PI / 3 : 0; G.audio?.play('cock'); }
      else if (this.armed && this.cockT > 0) this.cockT -= dt;
      for (let i = 0; i < this.hams.length; i++) { const want = this.armed && (this.type === 'revolver' || i >= this.cap - this.rounds) ? 1 : 0; this.hamV[i] = want ? Math.min(1, this.hamV[i] + dt * 12) : 0; this.hams[i].rotation.x = this.hamV[i] * this.cockA; }
      if (this.cyl && this.cylA !== this.cylT) { this.cylA = Math.min(this.cylT, this.cylA + dt * 9); this.cyl.rotation.z = this.cylA; }
      if (this.brl) { const w = this.loading ? 1 : 0; if (this.open !== w) { this.open += Math.sign(w - this.open) * Math.min(Math.abs(w - this.open), dt * 7); this.brl.rotation.x = -this.open * 0.5; } }
      if (this.rec > 0) { this.rec = Math.max(0, this.rec - dt * (this.rec > 0.6 ? 14 : 4.5)); const k = this.rec * this.rec * this.kickK; this.kickG.rotation.x = k * 0.42; this.kickG.position.copy(this.grip); this.kickG.position.z += k * 0.035; }
    }
  }

  const RV = revolverParts(), SG = shotgunParts(), CHEAP = { revolver: cheap(RV), shotgun: cheap(SG) };
  const rest = (it, x, z, ry) => { it.obj.quaternion.setFromEuler(_e.set(0, ry, Math.PI / 2, 'YXZ')); it.obj.position.set(x, SHELF + it.base, z); };
  const revolver = new Gun('revolver', RV, { name: 'Colt revolver', radius: 0.11, mass: 1.05, cap: 6, kick: 1, view: new V3(0.15, -0.16, -0.42) }); rest(revolver, 0.36, -0.42, 1.25);
  const shotgun = new Gun('shotgun', SG, { name: 'coach gun', radius: 0.17, mass: 3.2, cap: 2, kick: 1.5, view: new V3(0.13, -0.17, -0.2) }); rest(shotgun, -0.62, -0.5, Math.PI / 2 + 0.04);
  { // the box of cartridges: fifty to the box, the lid off
    const tex = canvasTex(256, 256, (x) => { x.fillStyle = '#6a2a1c'; x.fillRect(0, 0, 256, 128); for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { const cx = 20 + c * 31, cy = 19 + r * 30; x.fillStyle = '#7a5a1c'; x.beginPath(); x.arc(cx, cy, 13, 0, 7); x.fill(); x.fillStyle = '#c8a040'; x.beginPath(); x.arc(cx, cy, 11.5, 0, 7); x.fill(); x.fillStyle = '#8a6a2a'; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); }
      x.fillStyle = '#c9b68a'; x.fillRect(0, 128, 256, 128); x.strokeStyle = '#3a1a10'; x.lineWidth = 5; x.strokeRect(8, 136, 240, 112); x.fillStyle = '#3a1a10'; x.textAlign = 'center'; x.font = 'bold 34px Georgia'; x.fillText('50 CARTRIDGES', 128, 180, 220); x.font = 'bold 26px Georgia'; x.fillText('.45 COLT', 128, 212); x.font = '15px Georgia'; x.fillText('UNION METALLIC CARTRIDGE CO.', 128, 236, 220); });
    const g = new THREE.BoxGeometry(0.105, 0.036, 0.068).translate(0, 0.018, 0), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, (i >> 2) === 2 ? 0.5 + uv.getY(i) * 0.5 : uv.getY(i) * 0.5);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })), grp = new THREE.Group(); grp.add(m);
    box = new Prop(grp, { col: { t: 'box', hx: 0.0525, hy: 0.018, hz: 0.034 }, mass: 0.9, name: 'cartridges', radius: 0.055, lift: 0.06 }); box.kind = 'cartridges'; box.pick = true; grp.position.set(0.66, SHELF, -0.42); grp.rotation.y = -0.2; box.last.copy(grp.position); }

  // a gun in a townsman's right hand, along his forearm: one mesh; .userData.muzzle is its muzzle in its own space
  function giveGun(P, kind = 'revolver') {
    const bones = P?.bones, hand = bones?.find((b) => b.name === 'handR'), C = CHEAP[kind] || CHEAP.revolver; if (!hand) return null;
    cheapMat ||= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.6, envMapIntensity: 1 });
    const m = new THREE.Mesh(C.geo, cheapMat), fore = bones.find((b) => b.name === 'forearmR'); m.userData.nopick = true; m.userData.muzzle = C.muzzle; m.userData.kind = kind;
    const d = new V3(0, -1, 0); if (fore) { d.copy(hand.position).sub(fore.position).applyQuaternion(_q.copy(fore.quaternion).invert()); if (d.lengthSq() < 1e-6) d.set(0, -1, 0); d.normalize(); }
    m.quaternion.setFromUnitVectors(d, FWD).invert().multiply(TURN); m.position.copy(d).multiplyScalar(0.07); hand.add(m); return m;
  }
  // where such a gun's muzzle is and where it points, in the world
  function muzzleOf(m, from, dir) { m.updateWorldMatrix(true, false); from.copy(m.userData.muzzle).applyMatrix4(m.matrixWorld); dir.set(0, 0, -1).transformDirection(m.matrixWorld); return from; }

  function update(dt) {
    if (!scanned) { scanned = true; room.group.traverse((o) => { if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && o.geometry.attributes.position) todo.push(o); }); todo.sort((p, q) => p.geometry.attributes.position.count - q.geometry.attributes.position.count); }
    for (let n = 0; todo.length && n < 4000; ) { const o = todo.pop(), g = o.geometry; n += g.attributes.position.count; if (!g.boundsTree) { try { g.boundsTree = new MeshBVH(g, { maxLeafTris: 10 }); } catch (e) { continue; } } o.raycast = acceleratedRaycast; }
    for (const f of flashes) if (f.life > 0 && (f.life -= dt) <= 0) f.s.visible = false;
    if (lightT > 0) { lightT -= dt; if (lightT <= 0) { light.intensity = 0; halo.visible = false; } else { light.intensity *= Math.max(0, 1 - dt * 22); halo.material.opacity = lightT / 0.09; } }
    for (const p of puffs) if (p.life > 0) { p.life -= dt; if (p.life <= 0) { p.s.visible = false; continue; } const a = 1 - p.life / p.span; p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(Math.max(0, 1 - dt * 3)); p.v.y += dt * 0.05; p.s.scale.addScalar(p.grow * dt / p.span); p.s.material.opacity = p.k * Math.min(1, a * 12) * (1 - a) * (1 - a); }
  }

  const guns = { revolver, shotgun };
  return { update, fire, giveGun, muzzleOf, revolver, shotgun, box, last,
    get holes() { return holes; }, get shots() { return shots; },
    // for a test: the gun into the screen's hand by the hand code's own grab; the trigger; what is left
    take(kind = 'revolver', h = G.desk?.hand) { const g = guns[kind]; if (h.held && h.held !== g) G.debug.input.release(h); if (g.held !== h) G.debug.input.grab(h, g); return g; },
    pull(kind = 'revolver') { const g = guns[kind]; return g.pull(g.held); },
    state() { return { revolver: { rounds: revolver.rounds, armed: revolver.armed, held: !!revolver.held, loading: revolver.loading }, shotgun: { rounds: shotgun.rounds, armed: shotgun.armed, held: !!shotgun.held, loading: shotgun.loading }, holes, shown: decals.count, shots, bvhLeft: todo.length }; } };
}
