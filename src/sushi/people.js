// plain made figures, used only if the Rocketbox people fail to load
import * as THREE from 'three';
import { mat, lerp } from './ctx.js';
import { faceTex, rng } from './tex.js';

const SKINS = ['#e8b894', '#d9a47c', '#f0c8a4', '#c98f68', '#e2ad86'];
const HAIRS = ['#15110e', '#1d1612', '#2a1c12', '#0d0d0f'];
const geo = {
  head: new THREE.SphereGeometry(0.105, 24, 18),
  hand: new THREE.SphereGeometry(0.04, 10, 8),
  upper: new THREE.CylinderGeometry(0.05, 0.043, 0.28, 10),
  fore: new THREE.CylinderGeometry(0.042, 0.035, 0.26, 10),
  thigh: new THREE.CylinderGeometry(0.078, 0.06, 0.44, 10),
  shin: new THREE.CylinderGeometry(0.058, 0.045, 0.44, 10),
  shoe: new THREE.BoxGeometry(0.09, 0.06, 0.24),
    neck: new THREE.CylinderGeometry(0.045, 0.05, 0.08, 10),
  stick: new THREE.CylinderGeometry(0.003, 0.002, 0.22, 5),
};
[geo.upper, geo.fore, geo.thigh, geo.shin].forEach((g) => g.translate(0, -g.parameters.height / 2, 0)); // pivot at top

const STYLES = [
  { name: 'salaryman', top: ['#1b2130', '#26282e', '#33373f', '#2a2622'], bottom: 'same', shirt: '#dfdfd8', tie: ['#6e1a1a', '#1c2f5e', '#4e4420'], wide: 1.04, hair: 'short', glasses: 0.5 },
  { name: 'office', top: ['#6e2440', '#1f5a5e', '#8a7a52', '#3d3a5a', '#7a4630'], bottom: ['#16161c', '#3a342e'], shirt: '#e6e0d4', wide: 1.08, hair: 'perm', skirt: true, lip: '#a02a3e' },
  { name: 'yankii', top: ['#121214', '#17171b'], bottom: ['#263a5a', '#1c2a42'], shirt: '#c8c8c4', wide: 1.05, hair: 'regent', leather: true },
  { name: 'casual', top: ['#5a6e4a', '#7a5a3a', '#3e5a7a', '#7a3a34', '#b0a888'], bottom: ['#34507a', '#4a4438'], shirt: '#d8d4c8', wide: 1.0, hair: 'short' },
  { name: 'oldman', top: ['#7a6f5a', '#5e6250', '#4e4842'], bottom: ['#33302b'], shirt: '#cfcfc8', wide: 0.98, hair: 'grey', stache: 0.6 },
];
const torsoGeo = new THREE.LatheGeometry([[0.0, -0.02], [0.135, -0.02], [0.138, 0.06], [0.128, 0.16], [0.142, 0.28], [0.165, 0.39], [0.168, 0.45], [0.14, 0.5], [0.075, 0.535], [0.05, 0.56], [0, 0.56]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
const jointGeo = new THREE.SphereGeometry(1, 12, 10);

export function makePerson(seed = (Math.random() * 1e6) | 0) {
  const R = rng(seed);
  const pk = (a) => a[(R() * a.length) | 0];
  const st = STYLES[(R() * STYLES.length) | 0];
  const skin = pk(SKINS), hairCol = st.hair === 'grey' ? '#8a8a88' : pk(HAIRS);
  const topCol = pk(st.top), botCol = st.bottom === 'same' ? topCol : pk(st.bottom);
  const mSkin = mat({ color: skin, roughness: 0.62 });
  const mTop = mat({ color: topCol, roughness: st.leather ? 0.38 : 0.92, metalness: st.leather ? 0.15 : 0 });
  const mBot = mat({ color: botCol, roughness: 0.95 });
  const mHair = mat({ color: hairCol, roughness: 0.78 });
  const mShoe = mat({ color: '#141210', roughness: 0.45 });
  const mShirt = mat({ color: st.shirt, roughness: 0.85 });
  const H = 0.94 + R() * 0.1; // height variation

  const root = new THREE.Group(); root.scale.setScalar(H);
  const hips = new THREE.Group(); hips.position.y = 0.92; root.add(hips);
  const upper = new THREE.Group(); hips.add(upper);
  const M = (g, m, p, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };

  const torso = M(torsoGeo, mTop, upper); torso.scale.set(st.wide, 1, 0.62);
  // open collar / shirt front + tie, wrapped on the chest
  const vShape = new THREE.Shape(); vShape.moveTo(-0.05, 0.1); vShape.lineTo(0.05, 0.1); vShape.lineTo(0, -0.1); vShape.closePath();
  const chest = M(new THREE.ShapeGeometry(vShape), mShirt, upper, 0, 0.415, 0.094); chest.rotation.x = -0.1; chest.castShadow = false;
  if (st.tie) { const tie = M(new THREE.PlaneGeometry(0.028, 0.17), mat({ color: pk(st.tie), roughness: 0.6 }), upper, 0, 0.41, 0.098); tie.rotation.x = -0.1; tie.castShadow = false; }
  M(geo.neck, mSkin, upper, 0, 0.575, 0.005);

  const head = new THREE.Group(); head.position.set(0, 0.705, 0.012); upper.add(head);
  const fm = mat({ map: faceTex(skin, { hair: hairCol, glasses: st.glasses && R() < st.glasses, stache: st.stache && R() < st.stache, lip: st.lip, smile: 0.5 + R() * 2, brow: (R() - 0.5) * 3 }), roughness: 0.6 });
  const skull = M(geo.head, fm, head); skull.scale.set(0.86, 1.1, 0.96);
  const jaw = M(jointGeo, mSkin, head, 0, -0.055, 0.012); jaw.scale.set(0.07, 0.055, 0.075);
  for (const s of [-1, 1]) M(jointGeo, mSkin, head, s * 0.09, -0.008, -0.005).scale.set(0.012, 0.024, 0.016);
  if (st.hair === 'perm') {
    const h = M(new THREE.IcosahedronGeometry(0.128, 2), mHair, head, 0, 0.03, -0.03); h.scale.set(1.02, 1.0, 0.98);
    M(jointGeo, mHair, head, 0, 0.088, 0.062).scale.set(0.085, 0.035, 0.05);
    M(jointGeo, mHair, head, 0, -0.07, -0.06).scale.set(0.11, 0.09, 0.06);
  } else {
    const cap = M(new THREE.SphereGeometry(0.108, 22, 14, 0, Math.PI * 2, 0, 1.7), mHair, head, 0, 0.012, -0.012);
    cap.rotation.x = -0.5; cap.scale.set(0.9, 1.1, 1.0);
    if (st.hair === 'grey') { cap.rotation.x = -0.85; cap.scale.set(0.9, 0.98, 1.0); }
    if (st.hair === 'regent') M(jointGeo, mHair, head, 0, 0.105, 0.07).scale.set(0.06, 0.04, 0.085);
  }

  const mkArm = (s) => {
    const a = new THREE.Group(); a.position.set(s * 0.19 * st.wide, 0.445, 0); upper.add(a);
    M(jointGeo, mTop, a).scale.setScalar(0.062);
    M(geo.upper, mTop, a);
    const f = new THREE.Group(); f.position.y = -0.28; a.add(f);
    M(jointGeo, mTop, f).scale.setScalar(0.046);
    M(geo.fore, mTop, f);
    M(new THREE.CylinderGeometry(0.037, 0.037, 0.02, 10), mShirt, f, 0, -0.255, 0);
    const hand = M(geo.hand, mSkin, f, 0, -0.285, 0); hand.scale.set(0.85, 1.2, 0.6);
    return { a, f, hand };
  };
  const armL = mkArm(-1), armR = mkArm(1);
  const sticks = new THREE.Group(); sticks.visible = false; armR.hand.add(sticks);
  const mStick = mat({ color: '#d8c49a', roughness: 0.6 });
  for (const s of [-1, 1]) { const c = M(geo.stick, mStick, sticks, s * 0.008, 0.02, 0.1); c.rotation.x = Math.PI / 2 - 0.5; }

  const mLeg = st.skirt ? mat({ color: '#2a2422', roughness: 0.7 }) : mBot;
  const P0 = {};
  const mkLeg = (s) => {
    const l = new THREE.Group(); l.position.set(s * 0.09, 0, 0); hips.add(l);
    M(geo.thigh, mLeg, l);
    const k = new THREE.Group(); k.position.y = -0.44; l.add(k);
    M(geo.shin, mLeg, k);
    M(jointGeo, mLeg, k).scale.setScalar(0.06);
    M(geo.shoe, mShoe, k, 0, -0.45, 0.05);
    return { l, k };
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  if (st.skirt) { const sk = M(new THREE.CylinderGeometry(0.14, 0.17, 0.4, 16), mBot, hips, 0, -0.2, 0); sk.scale.z = 0.72; P0.sk = sk; }
  else { const pelvis = M(jointGeo, mBot, hips, 0, -0.03, 0); pelvis.scale.set(0.15, 0.1, 0.1); }

  const P = {
    root, hips, upper, head, armL, armR, legL, legR, sticks, seed, style: st.name, pose: 'stand', phase: R() * 10, eatT: 0, skirt: st.skirt,
    update(dt, t) {
      const H = root.scale.y;
      const k = Math.min(1, dt * 8), ph = t * 6.2 + this.phase;
      let hy = 0.92, th = [0, 0], sh = [0, 0], ua = [0.05, 0.05], fa = [-0.15, -0.15], lean = 0, hx = 0;
      if (this.pose === 'walk') {
        const s = Math.sin(ph);
        th = [s * 0.5, -s * 0.5]; sh = [Math.max(0, -s) * 0.8 + 0.05, Math.max(0, s) * 0.8 + 0.05];
        ua = [-s * 0.4, s * 0.4]; fa = [-0.3, -0.3]; hy = 0.92 + Math.abs(Math.cos(ph)) * 0.02; lean = 0.04;
      } else if (this.pose === 'sit' || this.pose === 'eat') {
        hy = 0.75 / H; th = [-1.5, -1.5]; sh = [1.3, 1.3]; ua = [-0.72, -0.72]; fa = [-0.86, -0.86]; lean = 0.1;
        if (this.pose === 'eat') {
          this.eatT += dt;
          const c = (Math.sin(this.eatT * 2.6) + 1) / 2; // 0 bowl .. 1 mouth
          ua[1] = lerp(-0.6, -0.95, c); fa[1] = lerp(-0.95, -1.75, c); lean = 0.22 + c * 0.08; hx = 0.28;
        } else { hx = Math.sin(t * 0.7 + this.phase) * 0.05; }
      }
      hips.position.y = lerp(hips.position.y, hy, k);
      legL.l.rotation.x = lerp(legL.l.rotation.x, th[0], k); legR.l.rotation.x = lerp(legR.l.rotation.x, th[1], k);
      legL.k.rotation.x = lerp(legL.k.rotation.x, sh[0], k); legR.k.rotation.x = lerp(legR.k.rotation.x, sh[1], k);
      armL.a.rotation.x = lerp(armL.a.rotation.x, ua[0], k); armR.a.rotation.x = lerp(armR.a.rotation.x, ua[1], k);
      armL.f.rotation.x = lerp(armL.f.rotation.x, fa[0], k); armR.f.rotation.x = lerp(armR.f.rotation.x, fa[1], k);
      upper.rotation.x = lerp(upper.rotation.x, lean, k);
      head.rotation.x = lerp(head.rotation.x, hx, k);
      sticks.visible = this.pose === 'eat';
      if (P0.sk) { const sit = this.pose === 'sit' || this.pose === 'eat'; P0.sk.rotation.x = sit ? -1.2 : 0; P0.sk.position.set(0, sit ? -0.06 : -0.2, sit ? 0.16 : 0); }
    },
  };
  return P;
}
