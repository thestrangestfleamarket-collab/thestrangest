// Builds a playable hole (render meshes + physics world) from a compact definition.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { World, SURF } from './physics.js';

export const BALL_R = 0.0213;
export const CUP_R = 0.062;
const WALL_H = 0.1, WALL_T = 0.07, SKIRT = 0.28;
const V3 = THREE.Vector3;
const UP = new V3(0, 1, 0);
const rad = (d) => d * Math.PI / 180;

class Bucket {
  constructor(world, surf) { this.world = world; this.surf = surf; this.pos = []; this.uv = []; }
  tri(a, b, c, ua, ub, uc, hint, phys = true) {
    const n = new V3().subVectors(b, a).cross(new V3().subVectors(c, a));
    if (n.dot(hint) < 0) { let t = b; b = c; c = t; t = ub; ub = uc; uc = t; }
    this.pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    this.uv.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
    if (phys && this.world) this.world.addTri(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, this.surf, hint.x, hint.y, hint.z);
  }
  quad(a, b, c, d, ua, ub, uc, ud, hint, phys = true) {
    this.tri(a, b, c, ua, ub, uc, hint, phys); this.tri(a, c, d, ua, uc, ud, hint, phys);
  }
  // Oriented box from centre + three half-extent vectors.
  obb(c, ax, ay, az, phys = true) {
    const P = (sx, sy, sz) => c.clone().addScaledVector(ax, sx).addScaledVector(ay, sy).addScaledVector(az, sz);
    const lx = ax.length() * 2, ly = ay.length() * 2, lz = az.length() * 2;
    const face = (u, v, w, lu, lv) => { // face at +w spanned by u,v
      for (const s of [1, -1]) {
        const o = c.clone().addScaledVector(w, s);
        const p = (su, sv) => o.clone().addScaledVector(u, su).addScaledVector(v, sv);
        this.quad(p(-1, -1), p(1, -1), p(1, 1), p(-1, 1), [0, 0], [lu, 0], [lu, lv], [0, lv], w.clone().multiplyScalar(s), phys);
      }
    };
    face(ax, ay, az, lx, ly); face(az, ay, ax, lz, ly); face(ax, az, ay, lx, lz);
    return P;
  }
  mesh(material, smooth = false) {
    if (!this.pos.length) return null;
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    if (smooth) g = mergeVertices(g, 1e-4);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, material);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
}

function signTexture(num, name, par) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = '#f3ead6'; g.fillRect(0, 0, 512, 320);
  g.strokeStyle = '#3b2a1a'; g.lineWidth = 14; g.strokeRect(7, 7, 498, 306);
  g.fillStyle = '#2b2118'; g.textAlign = 'center';
  g.font = 'bold 150px Georgia, serif'; g.fillText(String(num), 256, 160);
  g.font = 'bold 44px Georgia, serif'; g.fillText(name, 256, 222);
  g.font = '36px Georgia, serif'; g.fillStyle = '#7a3b1c'; g.fillText('PAR ' + par, 256, 280);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function buildPart(part, xf, B, isFirst, isLast) {
  const pts = part.path.map(p => new V3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  const wcurve = new THREE.CatmullRomCurve3(part.path.map(p => new V3(p[3], 0, 0)), false, 'catmullrom', 0.5);
  const len = curve.getLength();
  const N = Math.max(8, Math.ceil(len / 0.1));
  const wMax = Math.max(...part.path.map(p => p[3]));
  const M = Math.min(26, Math.max(8, Math.ceil(wMax / 0.13)));
  const bump = part.bump || (() => 0);
  const st = [];
  let arc = 0, prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const c = curve.getPoint(t).applyMatrix4(xf);
    const tan = curve.getTangent(t).transformDirection(xf);
    const flat = new V3(tan.x, 0, tan.z).normalize();
    const right = new V3(-flat.z, 0, flat.x);
    const w = wcurve.getPoint(t).x;
    if (prev) arc += c.distanceTo(prev);
    prev = c;
    const row = [];
    for (let j = 0; j <= M; j++) {
      const v = -1 + 2 * j / M, x = v * w / 2;
      row.push(c.clone().addScaledVector(right, x).addScaledVector(UP, bump(t, x, v)));
    }
    st.push({ t, c, tan: flat, right, w, arc, row });
  }
  const inR = (list, t) => !!list && list.some(g => t >= g[0] && t <= g[1]);
  const rowOn = (i) => i >= 0 && i < N && !inR(part.gaps, (i + 0.5) / N);
  const wallOn = (s, i) => rowOn(i) && !(part.wallGaps || []).some(g => (g[0] === 0 || g[0] === s) && (i + 0.5) / N >= g[1] && (i + 0.5) / N <= g[2]);
  const zoneOf = (i) => { const z = (part.zones || []).find(z => (i + 0.5) / N >= z[0] && (i + 0.5) / N <= z[1]); return z ? z[2] : 'green'; };
  const down = new V3(0, -1, 0);
  const lift = (p, dy) => new V3(p.x, p.y + dy, p.z);
  const samples = [], pillars = [];

  for (let i = 0; i < N; i++) {
    if (!rowOn(i)) continue;
    const a = st[i], b = st[i + 1];
    const bk = B[zoneOf(i)];
    for (let j = 0; j < M; j++) {
      const x0 = (-1 + 2 * j / M) * a.w / 2, x1 = (-1 + 2 * (j + 1) / M) * a.w / 2;
      bk.quad(a.row[j], a.row[j + 1], b.row[j + 1], b.row[j], [x0, a.arc], [x1, a.arc], [x1, b.arc], [x0, b.arc], UP);
    }
    for (const s of [-1, 1]) {
      const ea = a.row[s < 0 ? 0 : M], eb = b.row[s < 0 ? 0 : M];
      const oa = a.right.clone().multiplyScalar(s), ob = b.right.clone().multiplyScalar(s);
      const o = oa.clone().add(ob).normalize(), inward = o.clone().negate();
      const Da = lift(ea, -SKIRT).addScaledVector(oa, WALL_T), Db = lift(eb, -SKIRT).addScaledVector(ob, WALL_T);
      if (wallOn(s, i)) {
        const Aa = lift(ea, -0.03), Ab = lift(eb, -0.03), Ba = lift(ea, WALL_H), Bb = lift(eb, WALL_H);
        const Ca = Ba.clone().addScaledVector(oa, WALL_T), Cb = Bb.clone().addScaledVector(ob, WALL_T);
        B.wall.quad(Aa, Ba, Bb, Ab, [a.arc, 0], [a.arc, 0.12], [b.arc, 0.12], [b.arc, 0], inward);
        B.wall.quad(Ba, Ca, Cb, Bb, [a.arc, 0.13], [a.arc, 0.24], [b.arc, 0.24], [b.arc, 0.13], UP);
        B.wall.quad(Ca, Da, Db, Cb, [a.arc, 0.26], [a.arc, 0.74], [b.arc, 0.74], [b.arc, 0.26], o, false);
        // wall ends where a wall gap begins/ends
        for (const [k, e, dir] of [[i - 1, a, -1], [i + 1, b, 1]]) {
          if (wallOn(s, k) || !rowOn(k)) continue;
          const E = e.row[s < 0 ? 0 : M], oo = e.right.clone().multiplyScalar(s);
          const p0 = lift(E, -0.03), p1 = lift(E, WALL_H), p2 = p1.clone().addScaledVector(oo, WALL_T), p3 = p0.clone().addScaledVector(oo, WALL_T);
          B.wall.quad(p0, p1, p2, p3, [0, 0], [0, 0.12], [0.07, 0.12], [0.07, 0], e.tan.clone().multiplyScalar(dir));
        }
      } else {
        const Ea = ea.clone().addScaledVector(oa, WALL_T), Eb = eb.clone().addScaledVector(ob, WALL_T);
        B.wall.quad(ea, Ea, Eb, eb, [a.arc, 0.13], [a.arc, 0.24], [b.arc, 0.24], [b.arc, 0.13], UP);
        B.wall.quad(Ea, Da, Db, Eb, [a.arc, 0.26], [a.arc, 0.74], [b.arc, 0.74], [b.arc, 0.26], o, false);
      }
    }
    // underside
    const dl = (s) => lift(s.row[0], -SKIRT).addScaledVector(s.right, -WALL_T), dr = (s) => lift(s.row[M], -SKIRT).addScaledVector(s.right, WALL_T);
    B.under.quad(dl(a), dr(a), dr(b), dl(b), [0, a.arc / 2], [a.w / 2, a.arc / 2], [b.w / 2, b.arc / 2], [0, b.arc / 2], down, false);
    // end caps
    for (const [k, e, dir] of [[i - 1, a, -1], [i + 1, b, 1]]) {
      if (rowOn(k)) continue;
      const d = e.tan.clone().multiplyScalar(dir);
      const isEnd = (k < 0 && !part.openStart) || (k >= N && !part.openEnd);
      const c = e.c.clone();
      if (isEnd) {
        B.wall.obb(c.clone().addScaledVector(d, WALL_T / 2).addScaledVector(UP, (WALL_H - SKIRT) / 2),
          e.right.clone().multiplyScalar(e.w / 2 + WALL_T), UP.clone().multiplyScalar((WALL_H + SKIRT) / 2), d.clone().multiplyScalar(WALL_T / 2));
      } else {
        const l = e.row[0].clone().addScaledVector(e.right, -WALL_T), r = e.row[M].clone().addScaledVector(e.right, WALL_T);
        for (let j = 0; j < M; j++) B.under.quad(e.row[j], e.row[j + 1], lift(e.row[j + 1], -SKIRT), lift(e.row[j], -SKIRT), [j * 0.1, 0], [j * 0.1 + 0.1, 0], [j * 0.1 + 0.1, 0.28], [j * 0.1, 0.28], d, false);
        B.under.quad(l, e.row[0], lift(e.row[0], -SKIRT), lift(l, -SKIRT), [0, 0], [0.07, 0], [0.07, 0.28], [0, 0.28], d, false);
        B.under.quad(e.row[M], r, lift(r, -SKIRT), lift(e.row[M], -SKIRT), [0, 0], [0.07, 0], [0.07, 0.28], [0, 0.28], d, false);
      }
    }
    samples.push([a.c.x, a.c.z, a.c.y, a.w / 2 + 0.3, a.right.x, a.right.z]);
    if (i % 24 === 12) pillars.push({ x: a.c.x, z: a.c.z, y: a.c.y - SKIRT });
  }
  const at = (t, v = 0) => {
    const s = st[Math.round(THREE.MathUtils.clamp(t, 0, 1) * N)];
    const x = v * s.w / 2;
    return { s, pos: s.c.clone().addScaledVector(s.right, x).addScaledVector(UP, bump(s.t, x, v)) };
  };
  const atArc = (d) => st.find(s => s.arc >= d) || st[N];
  return { st, N, len, at, atArc, samples, pillars };
}

export function buildHole(def, index, mats) {
  const xf = new THREE.Matrix4().makeRotationY(rad(def.rot || 0)).setPosition(def.at[0], def.at[1], def.at[2]);
  const world = new World();
  const group = new THREE.Group();
  const animators = [], rocks = [];
  const B = {
    green: new Bucket(world, SURF.GREEN), sand: new Bucket(world, SURF.SAND), ice: new Bucket(world, SURF.ICE),
    wall: new Bucket(world, SURF.WOOD), under: new Bucket(null, 0), obst: new Bucket(world, SURF.WOOD),
  };
  const partDefs = def.parts || [def];
  const parts = partDefs.map((p, i) => buildPart(p, xf, B, i === 0, i === partDefs.length - 1));

  // ---- tee & cup ----
  const first = parts[0], last = parts[parts.length - 1];
  const teeS = first.atArc(def.teeArc || 0.45);
  const tee = first.at(teeS.t, def.teeV || 0).pos;
  const cupS = def.cupT != null ? last.at(def.cupT).s : last.atArc(last.len - (def.cupBack || 0.5));
  const cup = last.at(cupS.t, def.cupV || 0).pos;
  world.cup = { x: cup.x, y: cup.y, z: cup.z, r: CUP_R, depth: 0.11 };

  // ---- obstacles ----
  const basis = (r, u, f, p) => new THREE.Matrix4().makeBasis(r, u, f).setPosition(p);
  for (const o of def.obstacles || []) {
    const part = parts[o.part || 0];
    const { s, pos } = part.at(o.t, o.v || 0);
    const ax = s.right.clone().applyAxisAngle(UP, rad(o.rot || 0));
    const az = s.tan.clone().applyAxisAngle(UP, rad(o.rot || 0));
    if (o.type === 'block') {
      const [sx, sy, sz] = o.size;
      B.obst.obb(pos.clone().addScaledVector(UP, sy / 2 - 0.01), ax.multiplyScalar(sx / 2), UP.clone().multiplyScalar(sy / 2 + 0.01), az.multiplyScalar(sz / 2));
    } else if (o.type === 'post' || o.type === 'bumper') {
      const bump = o.type === 'bumper';
      const r = o.r || (bump ? 0.1 : 0.05), h = o.h || (bump ? 0.09 : 0.16);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * (bump ? 1.12 : 1), h, 24), bump ? mats.bumper : mats.metal);
      m.position.copy(pos).y += h / 2; m.castShadow = m.receiveShadow = true; group.add(m);
      if (bump) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, 0.012, 24), mats.glow);
        cap.position.copy(pos).y += h + 0.004; group.add(cap);
      }
      world.cyls.push({ x: pos.x, z: pos.z, y0: pos.y - 0.02, y1: pos.y + h, r, e: bump ? 1.0 : 0.7, kind: bump ? 'bumper' : 'obstacle' });
    } else if (o.type === 'rock') {
      const r = o.r || 0.16;
      rocks.push({ pos: pos.clone(), r, seed: rocks.length });
      world.cyls.push({ x: pos.x, z: pos.z, y0: pos.y - 0.02, y1: pos.y + r * 0.9, r: r * 0.82, e: 0.55, kind: 'obstacle' });
    } else if (o.type === 'spinner') {
      const g = new THREE.Group(); g.position.copy(pos).y += 0.05; group.add(g);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(o.len, 0.075, 0.05), mats.obst);
      bar.castShadow = true; g.add(bar);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 20), mats.metal);
      hub.position.y = 0.015; hub.castShadow = true; g.add(hub);
      world.cyls.push({ x: pos.x, z: pos.z, y0: pos.y - 0.02, y1: pos.y + 0.13, r: 0.05, e: 0.6, kind: 'obstacle' });
      world.boxes.push({ mesh: bar, half: [o.len / 2, 0.0375, 0.025], e: 0.6 });
      animators.push((t) => { g.rotation.y = (o.phase || 0) + t * (o.speed || 1.2); g.updateMatrixWorld(true); });
    } else if (o.type === 'slider') {
      const [sx, sy, sz] = o.size;
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mats.obst);
      m.castShadow = m.receiveShadow = true; group.add(m);
      const base = pos.clone().addScaledVector(UP, sy / 2 + 0.002), right = s.right.clone();
      m.quaternion.setFromRotationMatrix(basis(s.right, UP, s.tan.clone().negate(), base));
      world.boxes.push({ mesh: m, half: [sx / 2, sy / 2, sz / 2], e: 0.6 });
      animators.push((t) => { m.position.copy(base).addScaledVector(right, Math.sin(t * (o.speed || 1.5) + (o.phase || 0)) * o.range); m.updateMatrixWorld(true); });
    } else if (o.type === 'windmill' || o.type === 'pendulum') {
      const L = o.len || 0.45, swing = o.type === 'pendulum';
      const hubH = L + (swing ? 0.1 : 0.035);
      const c = s.c.clone();
      const off = s.w / 2 + WALL_T + 0.05, ph = hubH + 0.12 + SKIRT;
      for (const sd of [-1, 1]) B.obst.obb(c.clone().addScaledVector(s.right, sd * off).addScaledVector(UP, ph / 2 - SKIRT),
        s.right.clone().multiplyScalar(0.04), UP.clone().multiplyScalar(ph / 2), s.tan.clone().multiplyScalar(0.04), false);
      B.obst.obb(c.clone().addScaledVector(UP, hubH + 0.1), s.right.clone().multiplyScalar(off + 0.04), UP.clone().multiplyScalar(0.035), s.tan.clone().multiplyScalar(0.045), false);
      const hub = new THREE.Group();
      hub.applyMatrix4(basis(s.right, UP, s.tan.clone().negate(), c.clone().addScaledVector(UP, hubH)));
      group.add(hub);
      const rotor = new THREE.Group(); hub.add(rotor);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16), mats.metal);
      axle.rotation.x = Math.PI / 2; rotor.add(axle);
      if (swing) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 8), mats.metal);
        rod.position.y = -L / 2; rotor.add(rod);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.1), mats.obst);
        head.position.y = -L; head.castShadow = true; rotor.add(head);
        world.boxes.push({ mesh: head, half: [0.1, 0.07, 0.05], e: 0.5 });
        animators.push((t) => { rotor.rotation.z = Math.sin(t * (o.speed || 1.8) + (o.phase || 0)) * (o.amp || 1.0); hub.updateMatrixWorld(true); });
      } else {
        for (let k = 0; k < 4; k++) {
          const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; rotor.add(arm);
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.11, L, 0.035), mats.obst);
          blade.position.y = -L / 2; blade.castShadow = true; arm.add(blade);
          world.boxes.push({ mesh: blade, half: [0.055, L / 2, 0.0175], e: 0.5 });
        }
        animators.push((t) => { rotor.rotation.z = (o.phase || 0) + t * (o.speed || 1.2); hub.updateMatrixWorld(true); });
      }
    }
  }
  world.finalize();

  // ---- meshes ----
  const greenMat = mats.green.clone();
  greenMat.stencilWrite = true; greenMat.stencilRef = index + 1; greenMat.stencilFunc = THREE.NotEqualStencilFunc;
  const add = (b, mat, smooth, order) => { const m = b.mesh(mat, smooth); if (m) { if (order != null) m.renderOrder = order; group.add(m); } return m; };
  const gm = add(B.green, greenMat, true, -5); if (gm) gm.castShadow = false;
  add(B.sand, mats.sand, true); add(B.ice, mats.ice, true);
  add(B.wall, mats.wall, false); add(B.under, mats.under, false); add(B.obst, mats.obst, false);

  // cup: stencil-cut hole, liner, rim, flag
  const disk = new THREE.Mesh(new THREE.CircleGeometry(CUP_R, 40), new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilRef: index + 1,
    stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp,
  }));
  disk.rotation.x = -Math.PI / 2; disk.position.copy(cup); disk.renderOrder = -10; group.add(disk);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(CUP_R, CUP_R, 0.11, 40, 1, true), mats.cup);
  liner.position.copy(cup).y -= 0.055; group.add(liner);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(CUP_R, 40), mats.cupBottom);
  bottom.rotation.x = -Math.PI / 2; bottom.position.copy(cup).y -= 0.11; group.add(bottom);
  const rim = new THREE.Mesh(new THREE.RingGeometry(CUP_R, CUP_R + 0.005, 40), mats.rim);
  rim.rotation.x = -Math.PI / 2; rim.position.copy(cup).y += 0.0015; group.add(rim);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.25, 8), mats.rim);
  pole.position.copy(cup).y += 0.625 - 0.1; pole.castShadow = true; group.add(pole);
  const flagG = new THREE.PlaneGeometry(0.3, 0.18, 10, 4); flagG.translate(0.15, 0, 0);
  const flag = new THREE.Mesh(flagG, mats.flag); flag.position.copy(cup).y += 1.04; flag.castShadow = true; group.add(flag);
  const fp = flagG.attributes.position, fx = Float32Array.from(fp.array);
  animators.push((t) => {
    for (let i = 0; i < fp.count; i++) { const x = fx[i * 3]; fp.setZ(i, Math.sin(x * 22 - t * 6 + index) * 0.02 * (x / 0.3)); }
    fp.needsUpdate = true; flag.rotation.y = 0.5 + Math.sin(t * 0.4 + index) * 0.25;
  });
  // tee mat
  const teeM = new THREE.Mesh(new THREE.CircleGeometry(0.07, 32), mats.tee);
  teeM.rotation.x = -Math.PI / 2; teeM.position.copy(tee).y += 0.0025; teeM.renderOrder = -4; group.add(teeM);
  // sign
  const sg = new THREE.Group();
  const sp = teeS.c.clone().addScaledVector(teeS.right, -(teeS.w / 2 + 0.35)).addScaledVector(teeS.tan, 0.5);
  sg.applyMatrix4(basis(teeS.right, UP, teeS.tan.clone().negate(), sp)); group.add(sg);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.05), mats.wall); post.position.y = 0.35; post.castShadow = true; sg.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.02), mats.wall); board.position.set(0, 1.0, 0.03); board.castShadow = true; sg.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.23), new THREE.MeshStandardMaterial({ map: signTexture(index + 1, def.name, def.par), roughness: 0.8 }));
  face.position.set(0, 1.0, 0.041); sg.add(face);

  group.updateMatrixWorld(true);
  const samples = parts.flatMap(p => p.samples), pillars = parts.flatMap(p => p.pillars);
  const center = new V3(); samples.forEach(s => center.add(new V3(s[0], s[2], s[1]))); center.multiplyScalar(1 / samples.length);
  let radius = 0; samples.forEach(s => radius = Math.max(radius, Math.hypot(s[0] - center.x, s[1] - center.z)));
  const update = (t) => { for (const a of animators) a(t); };
  update(0);
  return { def, index, name: def.name, par: def.par, group, world, tee, cup, teeDir: teeS.tan.clone(), center, radius: radius + 1.5,
    samples, pillars, rocks, update, signPos: sp, lamp: teeS.c.clone().addScaledVector(teeS.right, teeS.w / 2 + 0.3) };
}
