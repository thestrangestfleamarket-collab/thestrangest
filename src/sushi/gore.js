// blood and wounds, uncensored but brief: a spray and drops where a blow lands, pools on the ground, wounds left on the body, and a head or limb cut off at its bone (hidden from the body by bone weight) and fallen as a weighted thing of its own; capped for a headset, nothing flashes, and under EASY ON THE EYES the blood is darker and sprays shorter
import * as THREE from 'three';
import { G, V3, rand } from './ctx.js';
import { Prop } from './items.js';

export const GORE = { heads: true }; // (owner's setting still open: a head can be cut off, on unless he says)
const ND = 140, NS = 60, NP = 18, NC = 8; // drops in the air, spots where they landed, pools, cut-off pieces lying about
// what each cut-off part weighs (kg), and the joint it leaves
const PART = { head: [4.5, 'neck'], upperArmL: [3, 'shoulder'], upperArmR: [3, 'shoulder'], forearmL: [1.6, 'elbow'], forearmR: [1.6, 'elbow'], handL: [0.4, 'wrist'], handR: [0.4, 'wrist'], shinL: [3.6, 'knee'], shinR: [3.6, 'knee'] };
export function buildGore(scene) {
  const easy = () => !!(G.set && G.set.easy), col = () => (easy() ? 0x2e0303 : 0x5a0606);
  const root = new THREE.Group(); root.userData.nopick = true; scene.add(root);
  const dropM = new THREE.MeshLambertMaterial({ color: 0x5a0606 }), spotM = new THREE.MeshBasicMaterial({ color: 0x2a0202, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), dropM, ND), spots = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 8).rotateX(-Math.PI / 2), spotM, NS);
  for (const m of [drops, spots]) { m.frustumCulled = false; m.userData.nopick = true; m.castShadow = false; root.add(m); }
  const D = Array.from({ length: ND }, () => ({ p: new V3(), v: new V3(), s: 0, life: 0 })), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3(), _z = new V3(0, 0, 0);
  const hide = (m, i) => { _m.makeScale(0, 0, 0); m.setMatrixAt(i, _m); };
  for (let i = 0; i < ND; i++) hide(drops, i); for (let i = 0; i < NS; i++) hide(spots, i);
  let di = 0, si = 0; const pools = [], pieces = [];
  const poolGeo = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
  const surfaceAt = (p) => { let y = 0; for (const s of G.surfaces) if (p.x > s.minX && p.x < s.maxX && p.z > s.minZ && p.z < s.maxZ && s.y <= p.y + 0.02 && s.y > y) y = s.y; return y; };
  const spot = (p, r) => { const i = si++ % NS; _m.compose(_s.set(p.x, p.y + 0.003, p.z), _q.setFromAxisAngle(_s.set(0, 1, 0), rand(6)), new V3(r * rand(0.7, 1.3), 1, r * rand(0.7, 1.3))); spots.setMatrixAt(i, _m); spots.instanceMatrix.needsUpdate = true; };
  const gore = {
    n: 0, cuts: 0,
    // a spray from where a blow landed, along the way it went (k: how hard, 0..1+)
    spray(at, dir, k = 1) {
      const e = easy(), n = Math.round(Math.min(26, 5 + k * 12) * (e ? 0.55 : 1)), sp = (0.9 + Math.min(1.5, k) * 1.6) * (e ? 0.5 : 1); dropM.color.set(col());
      for (let i = 0; i < n; i++) { const d = D[di++ % ND]; d.p.copy(at); d.v.copy(dir).multiplyScalar(sp * rand(0.3, 1)).add(_s.set(rand(-0.7, 0.7), rand(0, 0.9), rand(-0.7, 0.7)).multiplyScalar(sp * 0.5)); d.s = rand(0.004, 0.011); d.life = 1.6; }
      gore.n += n;
    },
    // blood pooling where someone lies or bleeds: grows to r over a few seconds
    pool(at, r = 0.35) {
      let P = pools.find((o) => o.m.position.distanceTo(_s.set(at.x, o.m.position.y, at.z)) < o.r * 0.6); if (P) { P.r = Math.min(0.9, Math.max(P.r, r) + 0.05); return P; }
      if (pools.length >= NP) { P = pools.shift(); } else { P = { m: new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({ color: 0x220202, transparent: true, opacity: 0.88, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })) }; P.m.userData.nopick = true; P.m.renderOrder = 2; root.add(P.m); }
      P.m.material.color.set(easy() ? 0x160101 : 0x2a0303); P.m.position.set(at.x, surfaceAt(at) + 0.004, at.z); P.r = r; P.k = 0.02; P.m.scale.setScalar(0.02); P.m.rotation.y = rand(6); pools.push(P); return P;
    },
    // a wound left on them where it landed (it stays with the limb)
    wound(p, at, r = 0.04) { if (p.stain) { const m = p.stain(at, easy() ? 0x2a0202 : 0x4a0404, r); if (m) m.userData.wound = true; } },
    // a hard edge through a neck, forearm or shin: the part leaves the body and falls as a body of its own; what it was cut from bleeds
    sever(p, bone, dir, sp = 3) {
      if (!p.sever || !PART[bone] || (bone === 'head' && !GORE.heads)) return null; const cut = p.sever(bone); if (!cut) return null;
      const g = new THREE.Group(), m = new THREE.Mesh(cut.geo, p.mesh.material); m.castShadow = true; g.add(m); g.position.copy(cut.center);
      const bb = cut.geo.boundingBox || (cut.geo.computeBoundingBox(), cut.geo.boundingBox), h = bb.getSize(new V3()).multiplyScalar(0.5);
      m.position.set(0, h.y - (bb.max.y + bb.min.y) / 2 + 0.002, 0); g.position.y -= h.y - (bb.max.y + bb.min.y) / 2;   // (the body's frame at its bottom, as a prop's is)
      const it = new Prop(g, { name: bone === 'head' ? 'a head' : 'a severed limb', col: { t: 'box', hx: Math.max(0.03, h.x), hy: Math.max(0.03, h.y), hz: Math.max(0.03, h.z) }, mass: PART[bone][0], radius: Math.max(h.x, h.y, h.z), mat: 'soft' });
      it.pick = true; it.gore = true; it.drop(dir.clone().setLength(Math.min(3.5, sp * 0.45)).add(_s.set(0, 1.2, 0)), new V3(rand(-6, 6), rand(-3, 3), rand(-6, 6)));
      pieces.push({ it, t: 0 }); if (pieces.length > NC) { const o = pieces.shift(); o.it.remove(); }
      // the stump: dark, wet, where the joint was
      const st = new THREE.Mesh(new THREE.SphereGeometry(bone === 'head' ? 0.055 : 0.04, 8, 6), new THREE.MeshLambertMaterial({ color: 0x3a0404 })); st.scale.set(1, 0.45, 1); st.position.copy(cut.joint); st.userData.nopick = true; cut.parent.attach(st);
      gore.spray(cut.joint, _s.copy(dir).normalize().add(new V3(0, 1, 0)).normalize(), 1.4); gore.spray(cut.center, dir.clone().normalize(), 0.8); gore.cuts++;
      return it;
    },
    pieces, pools,
    update(dt) {
      let any = false;
      for (let i = 0; i < ND; i++) { const d = D[i]; if (d.life <= 0) continue; any = true; d.life -= dt; d.v.y -= 9.8 * dt; const y0 = d.p.y; d.p.addScaledVector(d.v, dt); const fl = surfaceAt(_s.set(d.p.x, y0, d.p.z));
        if (d.p.y <= fl) { d.p.y = fl; d.life = 0; if (Math.random() < 0.5) spot(d.p, d.s * rand(2.5, 5)); }
        if (d.life <= 0) hide(drops, i); else { _m.compose(d.p, _q.identity(), _s.set(d.s, d.s * (1 + Math.min(2, d.v.length() * 0.25)), d.s)); drops.setMatrixAt(i, _m); } }
      if (any) drops.instanceMatrix.needsUpdate = true;
      for (const P of pools) if (P.k < P.r) { P.k = Math.min(P.r, P.k + dt * 0.12); P.m.scale.set(P.k, 1, P.k * 0.85); }
      for (let i = pieces.length - 1; i >= 0; i--) { const o = pieces[i]; o.t += dt; if (o.t > 1.5 && !o.pooled && !o.it.free && !o.it.held) { o.pooled = true; gore.pool(o.it.obj.position, 0.16); } if (o.it.dead) pieces.splice(i, 1); }
    },
  };
  G.gore = gore; return gore;
}
