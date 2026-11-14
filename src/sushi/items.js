// what you hold at the cart: bowls, ladles, noodle baskets, the knife, raw things and toppings, drinks; how dropped things fall
import * as THREE from 'three';
import { G, V3, Q, UP, mat, clamp, lerp, rand } from './ctx.js';
import * as T from './tex.js';
import { PH } from './physics.js';

const _v = new V3(), _v2 = new V3(), _vt = new V3(), _q = new Q();

export const TOPPINGS = {
  chashu: { label: 'CHASHU', jp: 'チャーシュー' }, egg: { label: 'EGG', jp: '味玉' }, negi: { label: 'NEGI', jp: 'ネギ' },
  nori: { label: 'NORI', jp: 'のり' }, menma: { label: 'MENMA', jp: 'メンマ' }, naruto: { label: 'NARUTO', jp: 'なると' }, corn: { label: 'CORN', jp: 'コーン' },
};
export const TARE = { shoyu: { color: 0x3a1c0a, label: 'SHOYU', jp: '醤油' }, miso: { color: 0xa8651e, label: 'MISO', jp: '味噌' }, shio: { color: 0xe8d9a0, label: 'SHIO', jp: '塩' } };
export const BROTH = { chicken: { color: 0xc99a3c, label: 'CHICKEN', jp: '鶏ガラ', opacity: 0.9 }, tonkotsu: { color: 0xe9dcc2, label: 'TONKOTSU', jp: '豚骨', opacity: 1 } };

function mergeGeos(list) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of list) {
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); }
    const ix = g.index; if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off); else for (let i = 0; i < p.count; i++) idx.push(i + off);
    off += p.count;
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); o.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); o.setIndex(idx);
  return o;
}
function scatter(geo, n, r, h, seed, rot = true) {
  const R = T.rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const g = geo.clone(), a = R() * 6.28, d = Math.sqrt(R()) * r;
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(R() * 3, R() * 3, R() * 3)));
    g.translate(Math.cos(a) * d, R() * h, Math.sin(a) * d); out.push(g);
  }
  return mergeGeos(out);
}

let S = null; // shared geometry/material cache
function shared() {
  if (S) return S;
  const R = T.rng(42);
  const pts = []; for (let i = 0; i < 110; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * 0.062; pts.push(new V3(Math.cos(a) * d, 0.004 + R() * 0.022, Math.sin(a) * d)); }
  const steel = mat({ color: 0xc9ccd0, roughness: 0.32, metalness: 0.9, map: T.steelTex(), envMapIntensity: 2.2 });
  const meshT = T.canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = '#d0d3d6'; g.lineWidth = 3; for (let i = 0; i <= 64; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } }, { repeat: [6, 2] });
  S = {
    steel,
    steelDS: Object.assign(steel.clone(), { side: THREE.DoubleSide }),
    wire: new THREE.MeshStandardMaterial({ map: meshT, alphaTest: 0.4, side: THREE.DoubleSide, metalness: 0.9, roughness: 0.35, color: 0xd8dade }),
    handle: mat({ color: 0x2a1a10, roughness: 0.6 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xf1ede2, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.15, side: THREE.DoubleSide }),
    band: new THREE.MeshPhysicalMaterial({ map: T.bowlTex(), roughness: 0.2, clearcoat: 0.6 }),
    bowlGeo: new THREE.LatheGeometry([[0, 0], [0.042, 0], [0.045, 0.012], [0.06, 0.03], [0.085, 0.06], [0.103, 0.085], [0.106, 0.088], [0.1, 0.085], [0.082, 0.058], [0.057, 0.03], [0.04, 0.016], [0, 0.014]].map(([x, y]) => new THREE.Vector2(x, y)), 40),
    bandGeo: new THREE.CylinderGeometry(0.1042, 0.0885, 0.024, 40, 1, true),
    disc: new THREE.CircleGeometry(1, 36).rotateX(-Math.PI / 2),
    nest: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 640, 0.0025, 5, true),
    noodleCooked: mat({ color: 0xf0d58a, roughness: 0.45 }), noodleRaw: mat({ color: 0xeadfb8, roughness: 0.9 }),
    brothMap: T.brothTex('b'),
    chashuTop: mat({ map: T.swirlTex('chashu'), roughness: 0.5 }), chashuSide: mat({ color: 0x7a4a2e, roughness: 0.5 }),
    narutoTop: mat({ map: T.swirlTex('naruto'), roughness: 0.55 }), narutoSide: mat({ color: 0xf6f0e8, roughness: 0.6 }),
    eggTop: mat({ map: T.swirlTex('egg'), roughness: 0.35 }), eggShell: mat({ color: 0xc89860, roughness: 0.45 }),
    negi: mat({ color: 0x5fae3a, roughness: 0.5 }), negiWhite: mat({ color: 0xe8efd8, roughness: 0.5 }), nori: mat({ color: 0x0c1a12, roughness: 0.5, side: THREE.DoubleSide }),
    menma: mat({ color: 0xb58a4a, roughness: 0.6 }), corn: mat({ color: 0xf2c21c, roughness: 0.35 }),
    negiGeo: scatter(new THREE.TorusGeometry(0.0055, 0.0022, 5, 9), 16, 0.017, 0.008, 3),
    cornGeo: scatter(new THREE.SphereGeometry(0.0052, 6, 5), 18, 0.018, 0.007, 4),
    menmaGeo: scatter(new THREE.BoxGeometry(0.045, 0.004, 0.011), 5, 0.01, 0.008, 5, false),
    sliceGeo: new THREE.CylinderGeometry(0.037, 0.037, 0.007, 20), narutoGeo: new THREE.CylinderGeometry(0.021, 0.021, 0.005, 12),
    eggGeo: new THREE.SphereGeometry(0.024, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(1, 0.75, 1.3),
    glassBrown: new THREE.MeshPhysicalMaterial({ color: 0x4a2408, roughness: 0.08, transmission: 0.5, thickness: 0.02, metalness: 0 }),
    glassDark: new THREE.MeshPhysicalMaterial({ color: 0x1a0c06, roughness: 0.06, transmission: 0.35, thickness: 0.02 }),
    bottleGeo: new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.031, 0.13], [0.026, 0.16], [0.013, 0.2], [0.012, 0.235], [0.014, 0.24], [0, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), 18),
  };
  return S;
}
const M = (g, m, p, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; if (p) p.add(o); return o; };

export function toppingMesh(type) {
  const s = shared(), g = new THREE.Group();
  if (type === 'chashu') M(s.sliceGeo, [s.chashuSide, s.chashuTop, s.chashuTop], g, 0, 0.0035, 0);
  else if (type === 'naruto') M(s.narutoGeo, [s.narutoSide, s.narutoTop, s.narutoTop], g, 0, 0.0025, 0);
  else if (type === 'egg') { const e = M(s.eggGeo, s.narutoSide, g, 0, 0.018, 0); const y = M(new THREE.CircleGeometry(0.024, 18).rotateX(-Math.PI / 2), s.eggTop, g, 0, 0.0185, 0); y.scale.z = 1.3; }
  else if (type === 'negi') M(s.negiGeo, s.negi, g);
  else if (type === 'corn') M(s.cornGeo, s.corn, g);
  else if (type === 'menma') M(s.menmaGeo, s.menma, g);
  else if (type === 'nori') M(new THREE.BoxGeometry(0.058, 0.001, 0.07), s.nori, g, 0, 0.001, 0);
  return g;
}

// ------------------------------------------------------------------ base
export class Item {
  constructor(kind, obj, o = {}) {
    this.kind = kind; this.obj = obj; this.name = o.name || kind;
    this.radius = o.radius ?? 0.05; this.base = o.base ?? 0; this.center = new V3(0, o.cy ?? 0, 0);
    this.lift = o.lift ?? 0.09; this.aim = o.aim || new V3();
    this.vel = new V3(); this.held = null; this.free = false; this.locked = false; this.tool = false; this.dead = false; this.grounded = -1;
    obj.userData.item = this; G.items.push(this); G.itemRoot.add(obj);
  }
  worldCenter(out) { return out.copy(this.center).applyQuaternion(this.obj.quaternion).add(this.obj.position); }
  tilt() { return _vt.copy(UP).applyQuaternion(this.obj.quaternion).angleTo(UP); }
  remove() { if (this.dead) return; this.dead = true; if (PH.ready) PH.drop(this); if (this.held) this.held.held = null; this.held = null; this.obj.removeFromParent(); const i = G.items.indexOf(this); if (i >= 0) G.items.splice(i, 1); this.onRemove(); }
  drop(vel) { this.free = true; this.grounded = -1; if (vel) this.vel.copy(vel); else this.vel.set(0, 0, 0); if (PH.ready) PH.spawn(this, vel); }
  upright() { const e = new THREE.Euler().setFromQuaternion(this.obj.quaternion, 'YXZ'); this.obj.quaternion.setFromEuler(new THREE.Euler(0, e.y, 0)); }
  onGrab() { } onRelease() { return false; } onHeld() { } update() { } onRemove() { } onLand() { G.audio.play('place'); }
  onGround() { this.grounded = 0; }
  hint() { return ''; }
}

export function updateItems(dt) {
  for (const it of [...G.items]) {
    if (it.dead) continue;
    it.update(dt);
    if (it.grounded >= 0 && !it.held) { it.grounded += dt; if (it.grounded > 1.6) { it.remove(); continue; } }
    if (it.held || !it.free || PH.ready) continue;
    const p = it.obj.position, prevB = p.y - it.base;
    it.vel.y -= 9.8 * dt; p.addScaledVector(it.vel, dt);
    const newB = p.y - it.base;
    let land = null;
    for (const s of G.surfaces) if (p.x > s.minX && p.x < s.maxX && p.z > s.minZ && p.z < s.maxZ && prevB >= s.y - 0.045 && newB <= s.y && (!land || s.y > land.y)) land = s;
    if (land) {
      p.y = land.y + it.base;
      if (it.vel.y < -1.1 && !it.bounced) { it.bounced = true; it.vel.y *= -0.28; it.vel.x *= 0.45; it.vel.z *= 0.45; it.onLand(land); } // one small, damped bounce
      else { it.vel.set(0, 0, 0); it.free = false; it.bounced = false; it.upright(); it.onLand(land); }
    }
    else if (newB <= 0) { p.y = it.base; it.vel.set(0, 0, 0); it.free = false; it.upright(); it.onGround(); }
  }
  if (PH.ready) PH.step(dt);
}

export function findBowlUnder(p, r = 0.105) {
  let best = null, bd = 1e9;
  for (const it of G.items) {
    if (it.kind !== 'bowl' || it.dirty || it.locked) continue;
    const b = it.obj.position, d = Math.hypot(p.x - b.x, p.z - b.z), dy = p.y - b.y;
    if (d < r && dy > 0.0 && dy < 0.5 && d < bd) { best = it; bd = d; }
  }
  return best;
}

// ------------------------------------------------------------------ bowl
export class Bowl extends Item {
  constructor() {
    const s = shared(), g = new THREE.Group();
    M(s.bowlGeo, s.ceramic, g); M(s.bandGeo, s.band, g, 0, 0.0735, 0);
    super('bowl', g, { radius: 0.11, cy: 0.05, lift: 0.07, name: 'ramen bowl' });
    this.liqMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: s.brothMap, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.95 });
    this.liq = M(s.disc, this.liqMat, g); this.liq.castShadow = false; this.liq.visible = false;
    this.nest = M(s.nest, s.noodleCooked, g); this.nest.visible = false;
    this.tops = new THREE.Group(); g.add(this.tops);
    this.tare = null; this.brothType = null; this.broth = 0; this.noodles = null; this.toppings = []; this.temp = 0; this.dirty = false; this.eaten = 0; this.served = false;
    this.target = { getPos: () => _v2.copy(this.obj.position).setY(this.obj.position.y + 0.06), r: 0.115, accepts: (it) => it.kind === 'food' && it.topping && !this.dirty && !this.locked && it !== this, receive: (it) => this.addTopping(it) };
    G.targets.push(this.target);
  }
  onRemove() { const i = G.targets.indexOf(this.target); if (i >= 0) G.targets.splice(i, 1); }
  get empty() { return !this.tare && !this.broth && !this.noodles && !this.toppings.length; }
  level() { return clamp((this.tare ? 0.12 : 0) + this.broth * 0.44, 0, 1) * (1 - this.eaten * 0.85); }
  liquidY() { return 0.017 + this.level() * 0.05; }
  refresh() {
    const L = this.level(), y = this.liquidY(), r = 0.04 + ((y - 0.016) / 0.069) * 0.058;
    this.liq.visible = L > 0.01; this.liq.position.y = y; this.liq.scale.set(r, 1, r);
    const c = new THREE.Color(this.brothType ? BROTH[this.brothType].color : 0x000000);
    if (this.tare) { const tc = new THREE.Color(TARE[this.tare].color); this.brothType ? c.lerp(tc, this.tare === 'shio' ? 0.25 : this.brothType === 'tonkotsu' ? 0.3 : 0.6) : c.copy(tc); }
    this.liqMat.color.copy(c); this.liqMat.opacity = this.brothType === 'tonkotsu' || this.tare === 'miso' ? 1 : 0.93;
    this.nest.visible = !!this.noodles && this.eaten < 0.75;
    this.nest.position.y = Math.max(0.012, y - 0.016); const ns = clamp(r / 0.075, 0.6, 1.15); this.nest.scale.set(ns, 1 - this.eaten * 0.6, ns);
    this.tops.position.y = Math.max(0.02, y + 0.003);
    this.tops.children.forEach((t, i) => { t.visible = this.eaten < (i + 1) / (this.tops.children.length + 1); });
  }
  addTare(type) { this.tare = this.tare && this.tare !== type ? 'mixed' : type; if (this.tare === 'mixed') this.tare = type, (this.mixed = true); this.refresh(); G.audio.play('pour'); }
  addBroth(type, heat) {
    if (this.brothType && this.brothType !== type) this.mixed = true;
    this.brothType = type; this.broth = Math.min(3, this.broth + 1); this.temp = Math.max(this.temp, heat); this.over = this.broth > 2; this.refresh(); G.audio.play('pour');
  }
  addNoodles(cook) { this.noodles = { cook }; this.refresh(); G.audio.play('plop'); }
  addTopping(it) {
    const type = it.topping, n = this.toppings.filter((t) => t === type).length; this.toppings.push(type);
    const lay = { chashu: [3.6, 0.047, 0.62], egg: [5.6, 0.05, 0.6], negi: [0, 0.0, 2.2], nori: [1.57, 0.066, 0.3], menma: [0.55, 0.05, 0.45], naruto: [2.5, 0.05, 0.5], corn: [4.75, 0.045, 0.5] }[type];
    const a = lay[0] + n * lay[2], r = type === 'negi' ? n * 0.022 : lay[1];
    const o = toppingMesh(type); o.position.set(Math.cos(a) * r, type === 'negi' || type === 'corn' ? 0.006 : 0.002 + n * 0.003, -Math.sin(a) * r);
    o.rotation.y = a + 1.57 + rand(-0.3, 0.3);
    if (type === 'nori') { o.rotation.set(0, a + 1.57, 0); o.rotateX(-0.8); o.position.y = 0.018; }
    else if (type === 'chashu' || type === 'naruto') { o.rotateX(0.18); }
    this.tops.add(o); it.remove(); this.refresh(); G.audio.play('plop');
  }
  spill() { if (this.empty) return; this.tare = this.brothType = this.noodles = null; this.broth = 0; this.toppings = []; this.tops.clear(); this.temp = 0; this.mixed = this.over = false; this.dirty = true; this.eaten = 0; this.refresh(); G.audio.play('splash'); G.fx.drops(this.obj.position, 0xc99a3c, 14); }
  makeDirty() { this.dirty = true; this.locked = false; this.eaten = 1; this.tops.clear(); this.refresh(); this.liq.visible = true; this.liq.position.y = 0.019; this.liq.scale.set(0.035, 1, 0.035); }
  update(dt) {
    if (this.temp > 0) { this.temp = Math.max(0, this.temp - dt / 110); if (this.temp > 0.45 && !this.dirty && Math.random() < dt * 5) G.fx.steam(_v.copy(this.obj.position).setY(this.obj.position.y + 0.08), 0.5); }
    if (this.held && !this.empty && !this.dirty && this.tilt() > 1.25) this.spill();
  }
  onGround() { G.audio.play('break'); G.fx.drops(this.obj.position, 0xf1ede2, 12); this.remove(); }
  onLand() { G.audio.play('clink'); }
  hint() { return this.dirty ? 'dirty bowl → bus tub (right)' : this.empty ? 'empty bowl → set on the mat' : 'ramen → serve on a customer placemat'; }
}

// ------------------------------------------------------------------ food
export class Food extends Item {
  constructor(type, servings = 1) {
    const s = shared(); let g, o = { radius: 0.035, lift: 0.07, cy: 0.01 };
    if (type === 'noodle') { g = new THREE.Group(); const n = M(s.nest, s.noodleRaw, g); n.scale.set(0.8, 1.4, 0.8); o.name = 'fresh noodles'; o.radius = 0.06; }
    else { g = toppingMesh(type); o.name = TOPPINGS[type].label.toLowerCase(); }
    super('food', g, o);
    if (type === 'noodle') this.noodle = true; else this.topping = type;
    this.servings = servings;
  }
  hint() { return this.noodle ? 'noodles → drop into a basket in the boiling pot' : `${this.name} → drop on a bowl (or back in its bin)`; }
}

export const RAW = {
  chashu: { n: 8, product: 'chashu', per: 1, name: 'chashu pork roll', len: 0.2, r: 0.04 },
  naruto: { n: 10, product: 'naruto', per: 1, name: 'narutomaki log', len: 0.16, r: 0.022 },
  negi: { n: 6, product: 'negi', per: 2, name: 'green onion', len: 0.3, r: 0.012 },
  egg: { n: 1, product: 'egg', per: 1, name: 'marinated egg', len: 0.06, r: 0.024 },
};
export class Raw extends Item {
  constructor(type) {
    const s = shared(), d = RAW[type], g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    if (type === 'chashu') {
      const c = M(new THREE.CylinderGeometry(d.r, d.r, d.len, 20).rotateZ(Math.PI / 2).translate(d.len / 2, 0, 0), [s.chashuSide, s.chashuTop, s.chashuTop], body);
      for (let i = 1; i < 5; i++) M(new THREE.TorusGeometry(d.r + 0.001, 0.0015, 4, 20).rotateY(Math.PI / 2), mat({ color: 0xe8dcc0 }), body, i * 0.04, 0, 0);
    } else if (type === 'naruto') M(new THREE.CylinderGeometry(d.r, d.r, d.len, 12).rotateZ(Math.PI / 2).translate(d.len / 2, 0, 0), [s.narutoSide, s.narutoTop, s.narutoTop], body);
    else if (type === 'negi') for (const z of [-0.011, 0.011]) { M(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 8).rotateZ(Math.PI / 2).translate(0.1, 0, 0), s.negi, body, 0, 0, z); M(new THREE.CylinderGeometry(0.0095, 0.008, 0.1, 8).rotateZ(Math.PI / 2).translate(0.25, 0, 0), s.negiWhite, body, 0, 0, z); }
    else M(new THREE.SphereGeometry(0.024, 16, 12).scale(1.3, 1, 1), s.eggShell, body, 0.03, 0, 0);
    super('raw', g, { radius: 0.07, base: d.r, lift: 0.08, name: d.name });
    this.center.set(d.len / 2, 0, 0); this.aim.copy(this.center); this.raw = type; this.def = d; this.left = d.n; this.body = body; this.board = null;
  }
  onGrab() { if (this.board) { this.board.item = null; this.board = null; } }
  slice() {
    const d = this.def, b = this.board; this.left--;
    this.body.scale.x = Math.max(0.02, this.left / d.n);
    const k = d.n - this.left;
    for (let i = 0; i < (this.raw === 'egg' ? 2 : 1); i++) {
      const f = new Food(d.product, d.per);
      f.obj.position.set(b.x + 0.085 + ((k + i) % 3) * 0.03 + rand(-0.008, 0.008), b.y + 0.05, b.z + (((k + i) % 4) - 1.5) * 0.04);
      f.obj.rotation.y = rand(6); f.drop();
    }
    G.audio.play('chop');
    if (this.left <= 0) { b.item = null; this.board = null; this.remove(); }
  }
  hint() { return this.board ? 'on the board — chop it with the knife' : `${this.name} → put on the cutting board`; }
}

export class Drink extends Item {
  constructor(type) {
    const s = shared(), g = new THREE.Group();
    M(s.bottleGeo, type === 'beer' ? s.glassBrown : s.glassDark, g);
    const lt = T.labelTex(type === 'beer' ? ['麒 BEER', 'ビール'] : ['COLA', 'コーラ'], { bg: type === 'beer' ? '#f1e3b0' : '#c8201c', fg: type === 'beer' ? '#7a1c12' : '#fff', w: 256, h: 128, fs: 44 });
    lt.wrapS = THREE.RepeatWrapping; lt.repeat.x = 2;
    M(new THREE.CylinderGeometry(0.0315, 0.0315, 0.06, 18, 1, true), mat({ map: lt, roughness: 0.6 }), g, 0, 0.075, 0);
    M(new THREE.CylinderGeometry(0.0145, 0.0145, 0.008, 12), mat({ color: type === 'beer' ? 0xd8b030 : 0xc8c8c8, metalness: 0.8, roughness: 0.3 }), g, 0, 0.242, 0);
    super('drink', g, { radius: 0.06, cy: 0.12, lift: 0.05, name: type === 'beer' ? 'beer' : 'cola' });
    this.drink = type;
  }
  onLand() { G.audio.play('bottle'); }
  onGround() { G.audio.play('break'); this.remove(); }
  hint() { return `${this.name} → set at the customer who ordered it`; }
}

// ------------------------------------------------------------------ tools
export class Tool extends Item {
  constructor(kind, obj, o) { super(kind, obj, o); this.tool = true; this.home = { pos: new V3(), quat: new Q() }; this.homing = false; this.atHome = true; this.useMode = 'tilt'; this.armed = true; }
  setHome(pos, quat) { this.home.pos.copy(pos); this.home.quat.copy(quat); this.obj.position.copy(pos); this.obj.quaternion.copy(quat); this.atHome = true; this.homing = false; this.onHome(); }
  onGrab() { this.atHome = false; this.homing = false; }
  onRelease() { this.homing = true; return true; }
  onHome() { }
  point(local, out) { return out.copy(local).applyQuaternion(this.obj.quaternion).add(this.obj.position); }
  update(dt) {
    if (this.homing && !this.held) {
      const k = Math.min(1, dt * 9); this.obj.position.lerp(this.home.pos, k); this.obj.quaternion.slerp(this.home.quat, k);
      if (this.obj.position.distanceTo(this.home.pos) < 0.006) { this.obj.position.copy(this.home.pos); this.obj.quaternion.copy(this.home.quat); this.homing = false; this.atHome = true; this.onHome(); G.audio.play('clink'); }
    }
    this.tick(dt);
  }
  tick() { }
}

function ladleMesh(L, r, liquidColor) {
  const s = shared(), g = new THREE.Group(), big = r > 0.03;
  M(new THREE.CylinderGeometry(0.0045, 0.0045, L + 0.02, 8).rotateX(Math.PI / 2), s.steel, g, 0, 0, -L / 2 + 0.02);
  M(new THREE.CylinderGeometry(big ? 0.011 : 0.0075, big ? 0.012 : 0.008, big ? 0.13 : 0.09, 10).rotateX(Math.PI / 2), s.handle, g, 0, 0, 0.0);
  M(new THREE.CylinderGeometry(0.004, 0.004, r * 0.9, 6), s.steel, g, 0, -r * 0.3, -L);
  const cup = M(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), s.steelDS, g, 0, -r * 0.2, -L - r * 0.9);
  const liq = M(new THREE.CircleGeometry(r * 0.95, 18).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: liquidColor, roughness: 0.08, clearcoat: 1 }), g, 0, -r * 0.28, -L - r * 0.9); liq.castShadow = false;
  return { g, liq, cup: new V3(0, -r * 0.3, -L - r * 0.9) };
}

export class Ladle extends Tool {
  // mode 'tare' (fixed type, refills from its crock) or 'broth' (fills from whichever pot it is dipped in)
  constructor(mode, type, vessel) {
    const big = mode === 'broth', m = ladleMesh(big ? 0.27 : 0.15, big ? 0.045 : 0.021, big ? BROTH[type].color : TARE[type].color);
    super('ladle', m.g, { radius: 0.07, lift: big ? 0.15 : 0.12, aim: m.cup, name: big ? `${BROTH[type].label.toLowerCase()} broth ladle` : `${TARE[type].label.toLowerCase()} tare ladle` });
    this.mode = mode; this.type = type; this.vessel = vessel; this.liq = m.liq; this.cup = m.cup; this.filled = false; this.heat = 1; this.center.set(0, 0, -0.03);
  }
  setFilled(f, type) { this.filled = f; this.liq.visible = f; if (type) { this.type = type; this.liq.material.color.set(BROTH[type].color); } }
  onHome() { this.setFilled(true, this.mode === 'broth' ? this.vessel.type : null); this.heat = this.vessel.heat ?? 1; this.armed = true; }
  vessels() { return this.mode === 'broth' ? G.cart.pots.filter((p) => p.type) : [this.vessel]; }
  onHeld(dt, h) {
    const c = this.point(this.cup, _v), tilt = this.tilt();
    if (!h.use && tilt < 0.6) this.armed = true;
    for (const v of this.vessels()) {
      if (Math.hypot(c.x - v.x, c.z - v.z) < v.r && c.y < v.rimY + 0.25) {
        if (!this.filled && (c.y < v.liqY + 0.025 || h.useDown)) { this.setFilled(true, this.mode === 'broth' ? v.type : null); this.heat = v.heat ?? 1; this.armed = false; G.audio.play('plop'); }
        return; // never pour while over a vessel
      }
    }
    if (!this.filled || !this.armed) return;
    const bowl = findBowlUnder(c);
    if (bowl && (tilt > 0.95 || (h.xr && h.useDown))) {
      if (this.mode === 'tare') bowl.addTare(this.type); else bowl.addBroth(this.type, this.heat);
      G.fx.drops(c, this.liq.material.color.getHex(), 8); this.setFilled(false); this.armed = false;
    } else if (!bowl && tilt > 1.8) { this.setFilled(false); this.armed = false; G.audio.play('splash'); G.fx.drops(c, this.liq.material.color.getHex(), 10); }
  }
  hint() { return this.filled ? 'hold over a bowl and tilt to pour' : 'empty — dip it back in the pot'; }
}

export class Basket extends Tool {
  constructor(pot, idx) {
    const s = shared(), g = new THREE.Group(), L = 0.3;
    M(new THREE.CylinderGeometry(0.005, 0.005, L, 8).rotateX(Math.PI / 2), s.steel, g, 0, 0, -L / 2 + 0.03);
    M(new THREE.CylinderGeometry(0.012, 0.013, 0.14, 10).rotateX(Math.PI / 2), s.handle, g, 0, 0, 0.02);
    const bc = new V3(0, -0.05, -L - 0.045);
    M(new THREE.CylinderGeometry(0.062, 0.04, 0.12, 20, 1, true), s.wire, g, bc.x, bc.y, bc.z);
    M(new THREE.CircleGeometry(0.04, 16).rotateX(Math.PI / 2), s.wire, g, bc.x, bc.y - 0.06, bc.z);
    M(new THREE.TorusGeometry(0.062, 0.004, 6, 24).rotateX(Math.PI / 2), s.steel, g, bc.x, bc.y + 0.06, bc.z);
    super('basket', g, { radius: 0.07, lift: 0.2, aim: bc, name: 'noodle basket' });
    this.nest = M(s.nest, s.noodleRaw, g, bc.x, bc.y - 0.05, bc.z); this.nest.scale.set(0.62, 2.2, 0.62); this.nest.visible = false;
    this.cup = bc; this.pot = pot; this.idx = idx; this.noodles = null; this.center.set(0, 0, -0.02);
    this.target = { getPos: () => this.point(this.cup, _v2), r: 0.1, accepts: (it) => it.kind === 'food' && it.noodle && !this.noodles, receive: (it) => { this.noodles = { cook: 0 }; this.nest.visible = true; this.nest.material = s.noodleRaw; it.remove(); G.audio.play('plop'); } };
    G.targets.push(this.target);
  }
  inWater() { const c = this.point(this.cup, _v), p = this.pot; return Math.hypot(c.x - p.x, c.z - p.z) < p.r && c.y < p.rimY; }
  tick(dt) {
    if (this.noodles && this.pot.hot && this.inWater()) {
      this.noodles.cook += dt;
      if (this.noodles.cook > 9 && this.nest.material !== shared().noodleCooked) this.nest.material = shared().noodleCooked;
    }
  }
  onHeld(dt, h) {
    const c = this.point(this.cup, _v), tilt = this.tilt();
    if (!h.use && tilt < 0.6) this.armed = true;
    if (!this.noodles || !this.armed || this.inWater()) return;
    const bowl = findBowlUnder(c, 0.12);
    if (bowl && !bowl.noodles && (tilt > 0.95 || (h.xr && h.useDown))) { bowl.addNoodles(this.noodles.cook); this.noodles = null; this.nest.visible = false; this.armed = false; G.fx.drops(c, 0xf0e8c8, 6); }
    else if (!bowl && tilt > 1.8) { this.noodles = null; this.nest.visible = false; this.armed = false; G.audio.play('splash'); }
  }
  hint() { return this.noodles ? `noodles ${doneness(this.noodles.cook).label} — tilt over a bowl with broth` : 'empty basket — drop fresh noodles in it'; }
}

export function doneness(c) {
  if (c < 9) return { key: 'raw', label: 'RAW' };
  if (c < 14) return { key: 'firm', label: 'FIRM' };
  if (c < 23) return { key: 'regular', label: 'PERFECT' };
  if (c < 29) return { key: 'soft', label: 'SOFT' };
  return { key: 'over', label: 'MUSHY' };
}

export class Knife extends Tool {
  constructor() {
    const s = shared(), g = new THREE.Group();
    M(new THREE.BoxGeometry(0.018, 0.028, 0.115), s.handle, g, 0, 0, 0);
    const blade = new THREE.Shape(); blade.moveTo(0.058, 0.014); blade.lineTo(0.25, 0.008); blade.lineTo(0.235, -0.04); blade.lineTo(0.058, -0.04); blade.closePath();
    const bg = new THREE.ExtrudeGeometry(blade, { depth: 0.002, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-0.001, 0, 0);
    M(bg, mat({ color: 0xdfe2e6, metalness: 1, roughness: 0.18 }), g);
    super('knife', g, { radius: 0.07, lift: 0.19, aim: new V3(0, -0.04, -0.15), name: 'knife' });
    this.blade = new V3(0, -0.04, -0.15); this.useMode = 'chop'; this.center.set(0, 0, -0.04); this.armedCut = false;
  }
  onHeld(dt, h) {
    const b = G.cart.board, raw = b.item; if (!raw) return;
    const p = this.point(this.blade, _v), top = b.y + raw.def.r * 2;
    const over = Math.abs(p.x - (b.x - 0.05)) < 0.16 && Math.abs(p.z - b.z) < 0.09;
    if (!over) { this.armedCut = false; return; }
    if (p.y > top + 0.045) this.armedCut = true;
    else if ((this.armedCut && p.y < top + 0.012) || (h.xr && h.useDown && p.y < top + 0.2)) { this.armedCut = false; raw.slice(); h.pulse?.(0.6, 40); }
  }
  hint() { return G.cart.board.item ? 'chop: bring the blade down on the board' : 'put a pork roll / naruto / negi / egg on the board first'; }
}
