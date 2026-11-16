// the bar's working things, as a barkeep has them to hand: corked bottles that pour by the wrist and run dry, shot glasses and mugs that fill, get dirty and are washed, a glass slid down the bar, the keg and its tap with a head on the beer, the cash drawer with its coins and making change, cigars and matches, the rag for spills, the bung mallet, the bell; how a served glass is judged
import * as THREE from 'three';
import { G, V3, clamp, pick, rand } from '../sushi/ctx.js';
import { Prop, Item, Rag } from '../sushi/items.js';
import { PH } from '../sushi/physics.js';
import { DRINKS } from './cast.js';
import { R } from './room.js';
import { plain, brass, canvasTex, model, tube, slab, pbr, glow } from './kit.js';

const glassM = (c, o = 0.42) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: 0.05, metalness: 0, envMapIntensity: 2.2 });
const lathe = (pts, seg = 18) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const GEO = {}, geo = (k, f) => (GEO[k] ||= f()), MAT = {}, matOf = (k, f) => (MAT[k] ||= f());
const _v = new V3(), _w = new V3();
// on a screen a bottle or a glass tips by the trigger, as the ramen cart's ladles do; in the headset by your wrist
const deskTilt = (C) => { Object.defineProperty(C.prototype, 'tool', { get() { return G.mode === 'desktop'; }, set() { } }); C.prototype.useMode = 'tilt'; };

const LABEL = { whiskey: ['OLD', 'CROW', 'KENTUCKY BOURBON', '#d8c9a0', '#2a1608'], rye: ['PURE OLD', 'RYE', 'MONONGAHELA', '#cdb880', '#4a1408'], gin: ['OLD TOM', 'GIN', 'LONDON DRY', '#c9d0c4', '#143024'], brandy: ['COGNAC', 'BRANDY', 'V.S.O.P.', '#1c140e', '#c8a050'], sarsaparilla: ['SARSA-', 'PARILLA', 'ROOT TONIC', '#9a3622', '#ead8b8'] };
const BODY = { whiskey: [0x2a1804, 0.82], rye: [0x341c04, 0.82], gin: [0x3a4a42, 0.5], brandy: [0x0c140a, 0.92], sarsaparilla: [0x1a0c06, 0.92] };
const labelT = (type) => matOf('lab' + type, () => { const L = LABEL[type]; return new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(256, 128, (x, w, h) => { x.fillStyle = L[3]; x.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(60,40,20,${Math.random() * 0.12})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  x.strokeStyle = L[4]; x.lineWidth = 3; x.strokeRect(7, 7, w - 14, h - 14); x.lineWidth = 1; x.strokeRect(12, 12, w - 24, h - 24); x.fillStyle = L[4]; x.textAlign = 'center'; x.font = 'bold 28px Georgia'; x.fillText(L[0], w / 2, 46); x.font = 'bold 36px Georgia'; x.fillText(L[1], w / 2, 84); x.font = 'italic 14px Georgia'; x.fillText(L[2], w / 2, 108); x.fillStyle = 'rgba(40,24,10,.25)'; x.fillRect(0, h - 16, w, 16); }) }); });

export class Bottle extends Prop {
  constructor(type, level = 1) {
    const g = new THREE.Group(), D = DRINKS[type], [bc, bo] = BODY[type];
    const body = new THREE.Mesh(geo('bottle', () => lathe([[0, 0.004], [0.03, 0.002], [0.037, 0.008], [0.038, 0.02], [0.038, 0.165], [0.034, 0.185], [0.022, 0.215], [0.0145, 0.24], [0.0135, 0.285], [0.017, 0.29], [0.017, 0.302], [0.012, 0.305]])), matOf('bg' + type, () => glassM(bc, bo))); body.castShadow = true; g.add(body);
    const liq = new THREE.Mesh(geo('bliq', () => new THREE.CylinderGeometry(0.0345, 0.0345, 0.17, 14).translate(0, 0.095, 0)), matOf('liq' + type, () => plain(new THREE.Color(D[3]).multiplyScalar(0.3), { rough: 0.2 }))); liq.scale.y = level; g.add(liq);
    const lab = new THREE.Mesh(geo('label', () => new THREE.CylinderGeometry(0.0386, 0.0386, 0.08, 18, 1, true, -1.25, 2.5)), labelT(type)); lab.position.y = 0.1; g.add(lab);
    const cork = new THREE.Mesh(geo('cork', () => new THREE.CylinderGeometry(0.0115, 0.0095, 0.03, 10).translate(0, 0.315, 0)), matOf('cork', () => plain(0xa07a4a, { rough: 0.95 }))); g.add(cork);
    super(g, { col: { t: 'cyl', hh: 0.152, r: 0.038 }, mass: 0.95, fragile: bc, top: 0.305, name: D[0], radius: 0.075, cy: 0.14, lift: 0.04, pour: { color: D[3], pay: { type }, r: 0.0045, rate: 1.25, lip: 0.012, can: (q) => { if (this.corked || this.level <= 0) return false; this.level = Math.max(0, this.level - q * 0.04); liq.scale.y = Math.max(0.01, this.level); liq.visible = this.level > 0.01; if (G.t - (this.pt || 0) > 0.14) { this.pt = G.t; G.audio.play('pour'); } return true; } } });
    this.kind = 'bottle'; this.drink = type; this.level = level; this.corked = true; this.cork = cork; this.handles = [new V3(0, 0.11, 0)];
  }
  onGrab() { if (this.corked) { this.corked = false; G.audio.play('cork'); const c = new Loose(this.cork.geometry.clone().translate(0, -0.315, 0), this.cork.material, 'a cork', 0.012, 0.004); this.cork.getWorldPosition(c.obj.position); c.obj.position.y += 0.32; this.cork.visible = false; c.drop(new V3(rand(-0.4, 0.4), 1.4, rand(-0.4, 0.4))); } }
  hint() { return this.level <= 0.01 ? `${this.name}: empty` : `${this.name} (${Math.round(this.level * 100)}%): tip it over a glass`; }
}
deskTilt(Bottle);
// a small loose thing that only falls and lies there a while
class Loose extends Item { constructor(g0, m, name, r, mass) { const g = new THREE.Group(); g.add(new THREE.Mesh(g0, m)); super('bit', g, { radius: 0.02, cy: 0.01, name }); this.col = { t: 'cyl', hh: 0.012, r }; this.mass = mass; this.life = 90; } update(dt) { if ((this.life -= dt) < 0) this.remove(); } onGround() { } onLand() { } }

const SHAPE = { shot: { r: 0.0255, h: 0.064, in: 0.0205, fill: 0.9, mass: 0.14, sip: 0.5, pts: [[0, 0], [0.0205, 0], [0.0215, 0.004], [0.0265, 0.064], [0.0245, 0.064], [0.0195, 0.016], [0, 0.016]] }, mug: { r: 0.044, h: 0.14, in: 0.0375, fill: 0.46, mass: 0.5, sip: 0.2, pts: [[0, 0], [0.044, 0], [0.045, 0.006], [0.043, 0.14], [0.0385, 0.14], [0.0375, 0.014], [0, 0.014]] } };
export class Glass extends Prop {
  constructor(shape) {
    const S = SHAPE[shape], g = new THREE.Group(), gm = glassM(0x8a9692, 0.16);
    const b = new THREE.Mesh(geo('g' + shape, () => lathe(S.pts, 20)), gm); b.castShadow = true; g.add(b);
    if (shape === 'mug') g.add(new THREE.Mesh(geo('mhandle', () => new THREE.TorusGeometry(0.034, 0.0075, 6, 14, Math.PI).rotateZ(-Math.PI / 2).translate(0.043, 0.072, 0)), gm));
    const liq = new THREE.Mesh(geo('l' + shape, () => new THREE.CylinderGeometry(S.in, S.in * (shape === 'shot' ? 0.82 : 1), 1, 14).translate(0, 0.5, 0)), plain(0xffffff)); liq.position.y = S.pts[5][1]; liq.visible = false; g.add(liq);
    const foam = shape === 'mug' ? new THREE.Mesh(geo('foam', () => new THREE.CylinderGeometry(S.in, S.in, 1, 14).translate(0, 0.5, 0)), matOf('foam', () => plain(0xf2e8d2, { rough: 0.95 }))) : null; if (foam) { foam.visible = false; g.add(foam); }
    super(g, { col: { t: 'cyl', hh: S.h / 2, r: S.r }, mass: S.mass, fragile: 0xdfeae6, top: S.h, name: shape === 'shot' ? 'shot glass' : 'beer mug', radius: shape === 'shot' ? 0.045 : 0.068, cy: S.h / 2, lift: 0.04 });
    this.kind = 'glass'; this.shape = shape; this.S = S; this.vol = 0; this.head = 0; this.mix = {}; this.liq = liq; this.foam = foam; this.gm = gm; this.dirty = false; this.takes = { h: S.h, r: S.r + 0.004 }; this.owner = null; this.slide = null; this.handles = shape === 'mug' ? [new V3(0.07, 0.07, 0)] : null;
  }
  // what is poured in: a beer that falls straight down a mug's middle foams; one run down a tilted side does not
  receive(pay, q) { if (!pay || !pay.type) return; if (this.vol + this.head >= 1) { if (Math.random() < 0.3) { G.fx.drops(this.worldCenter(_v).setY(this.obj.position.y + this.S.h), DRINKS[pay.type] ? DRINKS[pay.type][3] : 0x8a6a3a, 1); G.bar.wet += 0.004; } return; } const a = Math.min(1 - this.vol - this.head, q * this.S.fill);
    if (pay.type === 'beer') { const f = clamp(0.46 - this.tilt() * 1.1, 0.08, 0.46); this.head += a * f; this.vol += a * (1 - f); this.mix.beer = (this.mix.beer || 0) + a * (1 - f); } else { this.vol += a; this.mix[pay.type] = (this.mix[pay.type] || 0) + a; } this.refresh(); }
  what() { let best = null, bv = 0; for (const k in this.mix) if (this.mix[k] > bv) { bv = this.mix[k]; best = k; } return best; }
  pure() { const w = this.what(); return w ? this.mix[w] / Math.max(1e-6, this.vol) : 0; }
  refresh() { const w = this.what(), v = this.vol, H = this.S.h - this.S.pts[5][1] - 0.004; this.liq.visible = v > 0.02; if (this.foam) this.foam.visible = false; if (!this.liq.visible) return; this.liq.scale.y = H * v; this.liq.material = Glass.liqM(w); if (this.foam && this.head > 0.01) { this.foam.visible = true; this.foam.position.y = this.S.pts[5][1] + H * v; this.foam.scale.y = H * this.head; } }
  static liqM(w) { return matOf('gl' + w, () => plain(DRINKS[w] ? DRINKS[w][3] : 0x8a6a3a, { rough: 0.12, opacity: w === 'gin' ? 0.5 : 0.92 })); }
  empty(used) { this.vol = 0; this.head = 0; this.mix = {}; this.refresh(); if (used) this.soil(true); }
  soil(on) { this.dirty = on; this.gm.color.set(on ? 0x8a8068 : 0x8a9692); this.gm.opacity = on ? 0.4 : 0.16; this.gm.roughness = on ? 0.5 : 0.05; this.name = (on ? 'dirty ' : '') + (this.shape === 'shot' ? 'shot glass' : 'beer mug'); }
  tick(dt) {
    if (this.head > 0 && !this.owner) { const d = Math.min(this.head, dt * 0.03); this.head -= d; this.vol = Math.min(1, this.vol + d * 0.25); if (this.foam) this.refresh(); }   // the head settles
    if (this.vol > 0.02 && (this.held || this.free) && this.tilt() > 1.45) { G.fx.drops(this.worldCenter(_v), Glass.liqM(this.what()).color.getHex(), 7); G.audio.play('splash'); G.bar.wet += this.vol * 0.3; this.empty(false); }
    const s = this.slide; if (s) { const p = this.obj.position, sp = Math.hypot(s.x, s.z); if (this.held || sp < 0.05) { this.slide = null; if (!this.held && PH.ready) PH.rest(this); return; } const k = Math.max(0, sp - 1.9 * dt) / sp; s.x *= k; s.z *= k; p.x += s.x * dt; p.z += s.z * dt; p.y = R.barY; this.obj.quaternion.identity(); if (G.t - (s.st || 0) > 0.09) { s.st = G.t; G.audio.play('slide', Math.min(1, sp / 3)); }
      for (const o of G.bar.glasses) if (o !== this && !o.dead && !o.held && Math.abs(o.obj.position.y - p.y) < 0.05 && Math.hypot(o.obj.position.x - p.x, o.obj.position.z - p.z) < this.S.r + o.S.r) { G.audio.play('clink'); o.slide = { x: s.x * 0.6, z: s.z * 0.6 }; if (PH.ready) PH.drop(o); s.x *= 0.3; s.z *= 0.3; break; }
      if (Math.abs(p.x) > R.barX + 0.16 || p.z < R.barZ0 - 0.13 || p.z > R.barZ1 + 0.07) { this.slide = null; this.drop(new V3(s.x, 0, s.z)); } } }
  // let go low over the bar top with some push along it: it slides, upright, as far as the push carries it
  onRelease(h) { if (this.owner) return false; const p = this.obj.position, v = h.xr ? h.vs : _w.set(0, 0, 0); if (h.xr && Math.abs(p.y - R.barY) < 0.05 && this.tilt() < 0.35 && Math.abs(v.y) < 0.9 && Math.hypot(v.x, v.z) > 0.5 && Math.abs(p.x) < R.barX + 0.15 && p.z > R.barZ0 - 0.13 && p.z < R.barZ1 + 0.07) { this.slide = { x: v.x, z: v.z * 0.35 }; if (PH.ready) PH.drop(this); return true; } return false; }
  hint() { const w = this.what(); return this.vol < 0.05 ? (this.dirty ? `${this.name}: into the wash tub` : `clean ${this.name}`) : `${this.name} of ${w}${this.vol < 0.6 ? ' (short)' : ''}${this.dirty ? ' (in a dirty glass)' : ''}: set it in front of whoever asked`; }
}
deskTilt(Glass);

const COIN = { 2000: ['a double eagle', 0.017, 0xd8a830], 100: ['a silver dollar', 0.019, 0xc8c8c8], 25: ['a quarter', 0.0121, 0xc0c0c4], 10: ['a dime', 0.009, 0xc4c4c8], 5: ['a nickel', 0.0106, 0xa8a4a0] };
export class Coin extends Item {
  constructor(cents) { const [name, r, c] = COIN[cents], g = new THREE.Group(), m = new THREE.Mesh(geo('coin' + cents, () => new THREE.CylinderGeometry(r, r, 0.0022, 16).translate(0, 0.0011, 0)), matOf('coin' + c, () => plain(c, { rough: 0.32, metal: 1, env: 1.4 }))); m.castShadow = true; g.add(m);
    super('coin', g, { radius: 0.03, cy: 0.002, lift: 0.03, name }); this.cents = cents; this.col = { t: 'cyl', hh: 0.0011, r }; this.mass = 0.02; this.forWho = null; }
  onGrab() { this.forWho = null; } onLand() { G.audio.play('coin'); } onGround() { } hint() { return `${this.name}: into the cash drawer, or on the bar as change`; }
}
export const coinsFor = (cents) => { const out = []; for (const c of [2000, 100, 25, 10, 5]) while (cents >= c && out.length < 9) { out.push(c); cents -= c; } return out; };
// what a customer would put down for a bill of that size: sometimes the exact coins, sometimes a bigger one
export const tender = (cents) => (cents >= 100 || Math.random() < 0.45 ? cents : cents <= 25 ? pick([25, 100, 100]) : 100);

class Cigar extends Item { constructor() { const g = new THREE.Group(); const b = new THREE.Mesh(geo('cigar', () => new THREE.CylinderGeometry(0.0075, 0.0065, 0.12, 8).rotateZ(Math.PI / 2)), matOf('cigar', () => pbr('leather', { tile: 0.1, color: 0x4a2c16, rough: 0.9 }))); b.position.y = 0.0075; g.add(b); const band = new THREE.Mesh(geo('band', () => new THREE.CylinderGeometry(0.0079, 0.0079, 0.012, 8).rotateZ(Math.PI / 2)), matOf('band', () => plain(0xb02018, { rough: 0.6 }))); band.position.set(-0.025, 0.0075, 0); g.add(band);
    super('cigar', g, { radius: 0.04, cy: 0.0075, lift: 0.03, name: 'a cigar' }); this.col = { t: 'box', hx: 0.06, hy: 0.0075, hz: 0.0075 }; this.mass = 0.02; this.lit = false; } onGround() { } hint() { return 'a cigar: set it in front of whoever asked for one'; } }
class Match extends Item { constructor() { const g = new THREE.Group(); const s = new THREE.Mesh(geo('match', () => new THREE.BoxGeometry(0.05, 0.0022, 0.0022)), matOf('mwood', () => plain(0xd8c8a0))); const hd = new THREE.Mesh(geo('mhead', () => new THREE.SphereGeometry(0.0024, 6, 5)), matOf('mhead', () => plain(0x8a1810))); hd.position.x = 0.025; g.add(s, hd);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffa040, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })); fl.scale.setScalar(0.07); fl.position.set(0.028, 0.012, 0); fl.visible = false; g.add(fl);
    super('match', g, { radius: 0.03, cy: 0.002, lift: 0.03, name: 'a match' }); this.col = { t: 'box', hx: 0.025, hy: 0.0015, hz: 0.0015 }; this.mass = 0.005; this.fl = fl; this.burn = 0; this.light = null; }
  // struck by a quick drag of the hand (or the trigger): it burns ten seconds and lights what its head is brought to
  onHeld(dt, h) { if (!this.burn && !this.spent && (h.useDown || (h.xr && h.vel.length() > 1.6))) { this.burn = 10; this.fl.visible = true; G.audio.play('match'); } }
  update(dt) { if (this.burn > 0) { this.burn -= dt; const p = this.fl.getWorldPosition(_v); for (const o of G.room.lamps) if (!o.on && o.l && Math.hypot(o.x - p.x, o.y - p.y, o.z - p.z) < 0.3) { o.on = true; o.l.intensity = o.k; o.s.visible = true; G.audio.play('match'); } G.folk?.lightFor?.(p); if (this.burn <= 0) { this.fl.visible = false; this.spent = true; this.life = 20; } } else if (this.spent && (this.life -= dt) < 0) this.remove(); }
  onGround() { } onLand() { } hint() { return this.burn > 0 ? 'a lit match: hold it to a cigar or a dark lamp' : this.spent ? 'a spent match' : 'a match: strike it (a quick drag, or the trigger)'; } }
class Mallet extends Item { constructor() { const g = new THREE.Group(), w = pbr('walnut', { tile: 0.3, color: 0x8a6a4a }); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.13, 12).rotateZ(Math.PI / 2), w); hd.position.set(0, 0.045, -0.22); const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.3, 8).rotateX(Math.PI / 2), w); hl.position.set(0, 0.045, -0.06); hd.castShadow = hl.castShadow = true; g.add(hd, hl);
    super('mallet', g, { radius: 0.08, cy: 0.045, lift: 0.06, name: 'the bung mallet' }); this.col = { t: 'box', hx: 0.065, hy: 0.045, hz: 0.16 }; this.mass = 0.9; this.handles = [new V3(0, 0.045, 0.02)]; this.head = new V3(0, 0.045, -0.22); }
  onHeld(dt, h) { const p = _v.copy(this.head).applyQuaternion(this.obj.quaternion).add(this.obj.position); if (h.vel.length() > 1.8 && G.t - (this.ht || 0) > 0.4) { const k = G.bar.keg; if (!k.tapped && p.distanceTo(k.bung) < 0.14) { this.ht = G.t; k.tap(); h.pulse?.(1, 60); return; } const hit = G.folk?.people.find((q) => q.here && q.alive && Math.hypot(q.root.position.x - p.x, q.root.position.z - p.z) < 0.28 && p.y > 0.6 && p.y < 1.9); if (hit) { this.ht = G.t; G.audio.play('hit'); hit.P.hit(h.vel.clone().normalize(), p.clone(), 1); G.story?.event?.('struck', { id: hit.id, with: 'mallet' }); h.pulse?.(1, 80); } } }
  onGround() { } hint() { return 'the bung mallet: drives the tap into a fresh keg, and settles arguments'; } }

export function buildBar(scene, room) {
  const bar = { bottles: [], glasses: [], till: 0, taken: 0, open: false, served: 0, wet: 0, float: 0, Glass, Bottle, Coin };
  const put = (it, x, y, z, ry = 0) => { it.obj.position.set(x, y, z); it.obj.rotation.y = ry; if (PH.ready && it.col) PH.rest(it); return it; };
  const bz = R.backZ, cy = R.backY, wal = pbr('walnut', { tile: 0.6, color: 0x5a3828, rough: 0.5 });

  // ---- bottles: the working row on the back counter (opened, part used), the stock on the shelves (corked, full)
  ['whiskey', 'rye', 'gin', 'brandy', 'sarsaparilla'].forEach((t, i) => bar.bottles.push(put(new Bottle(t, 0.45 + (i * 37 % 50) / 100), -1.95 + i * 0.15, cy, bz + 0.2 + (i % 2) * 0.05, 2.6 + i)));
  const ROW = [['whiskey', 'whiskey', 'whiskey', 'rye', 'rye', 'whiskey', 'brandy', 'whiskey'], ['rye', 'whiskey', 'gin', 'gin', 'whiskey', 'brandy', 'rye'], ['brandy', 'gin', 'sarsaparilla', 'sarsaparilla', 'whiskey', 'rye']];
  room.shelves.forEach((s, si) => { const row = ROW[[1.42, 1.86, 2.3].indexOf(s.y)] || ROW[0], n = row.length, sp = (s.x1 - s.x0) / n; row.forEach((t, k) => { if ((k + si) % 7 === 6) return; bar.bottles.push(put(new Bottle(t), s.x0 + sp * (k + 0.5) + ((k * 13 + si * 7) % 5 - 2) * 0.006, s.y, s.z + ((k + si) % 3 - 1) * 0.02, Math.PI + ((k * 31 + si * 17) % 9 - 4) * 0.12)); }); });

  // ---- glasses: a fixed stock, stood mouth-down on a cloth; a used one must be washed before it goes out again
  { const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36).rotateX(-Math.PI / 2), plain(0x8a8272, { rough: 1 })); cloth.position.set(-0.55, cy + 0.003, bz + 0.36); cloth.receiveShadow = true; scene.add(cloth);
    for (let i = 0; i < 12; i++) bar.glasses.push(put(new Glass('shot'), -0.82 + (i % 6) * 0.068, cy, bz + 0.27 + ((i / 6) | 0) * 0.075));
    for (let i = 0; i < 6; i++) bar.glasses.push(put(new Glass('mug'), -0.36 + (i % 3) * 0.105, cy, bz + 0.26 + ((i / 3) | 0) * 0.11, 0.6)); }

  // ---- the keg on its cradle: a spigot in its head, opened and closed by its handle; it holds sixty mugs, then a fresh one must be tapped with the mallet
  { const kx = 0.75, kz = bz + 0.4, ky = cy + 0.3, grp = new THREE.Group(); grp.position.set(kx, ky, kz); scene.add(grp);
    const kg = model('wine_barrel_01', 0, 0, 0, 0, { h: 0.62 }, grp); kg.rotation.x = Math.PI / 2; kg.position.set(0, 0.02, 0.31);
    for (const s of [-1, 1]) { slab(0.05, 0.09, 0.5, wal, s * 0.17, -0.255, 0, grp); slab(0.4, 0.12, 0.05, wal, 0, -0.2, s * 0.2, grp); }
    const sp = tube(0.011, 0.009, 0.1, brass(), 0, -0.1, -0.36, grp, 8); sp.rotation.x = Math.PI / 2; tube(0.008, 0.008, 0.04, brass(), 0, -0.125, -0.4, grp, 8);
    const hd = new THREE.Group(); hd.position.set(0, -0.085, -0.37); grp.add(hd); const hm = slab(0.014, 0.075, 0.014, brass(), 0, 0.04, 0, hd), kn = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), wal); kn.position.y = 0.082; hd.add(kn);
    const spout = new V3(kx, ky - 0.15, kz - 0.4), pay = { type: 'beer' }, keg = (bar.keg = { level: 60, open: false, tapped: true, bung: new V3(kx, ky, kz - 0.33) });
    keg.tap = () => { keg.tapped = true; keg.level = 60; G.audio.play('thunk'); G.hint = ''; };
    const b = { name: 'the beer tap', r: 0.055, getPos: () => kn.getWorldPosition(_w), press: () => { keg.open = !keg.open; G.audio.play('click'); } }; hm.userData.button = b; kn.userData.button = b; G.pickRoot.add(grp); G.buttons.push(b);
    const drip = new V3(0, -0.5, -0.03);
    G.updaters.push((dt) => { hd.rotation.x += ((keg.open ? -1.1 : 0) - hd.rotation.x) * Math.min(1, dt * 14); if (!keg.open) return; if (!keg.tapped || keg.level <= 0) { if (keg.tapped) { keg.tapped = false; G.hint = 'The keg is dry. Knock the tap into a fresh one with the mallet.'; G.audio.play('click'); } keg.open = false; return; }
      keg.level -= dt * 0.72; G.fx.pour(spout, drip, DRINKS.beer[3], 1.5 * dt, pay, b, 0.0065); if (G.t - (b.pt || 0) > 0.14) { b.pt = G.t; G.audio.play('pour'); }
      const under = bar.glasses.some((gl) => !gl.dead && Math.hypot(gl.obj.position.x - spout.x, gl.obj.position.z - spout.z) < 0.05 && gl.obj.position.y < spout.y && gl.vol + gl.head < 1); if (!under) bar.wet += dt * 0.05; });
    const tray = slab(0.2, 0.012, 0.16, plain(0x3a342c, { metal: 0.8, rough: 0.5 }), kx, cy + 0.006, kz - 0.4, scene); tray.castShadow = false; }

  // ---- the wash tub: a dirty glass held under its water a moment comes out clean
  { const x = -2.45, z = bz + 0.38; model('wooden_bucket_01', x, cy, z, 0, { h: 0.24 }, scene); const water = new THREE.Mesh(new THREE.CircleGeometry(0.125, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4a5a58, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.85, envMapIntensity: 2 })); water.position.set(x, cy + 0.19, z); scene.add(water);
    G.updaters.push((dt) => { for (const gl of bar.glasses) { if (gl.dead || !gl.held) { gl.wash = 0; continue; } const p = gl.obj.position; if (Math.hypot(p.x - x, p.z - z) < 0.13 && p.y < cy + 0.2 && p.y > cy - 0.02) { if (!gl.wash) G.audio.play('splash'); gl.wash = (gl.wash || 0) + dt; if (gl.vol > 0) gl.empty(false); if (gl.dirty && gl.wash > 0.8) { gl.soil(false); G.audio.play('plop'); gl.held.pulse?.(0.5, 40); } } else gl.wash = 0; } }); }

  // ---- the cash drawer under the back counter: pull the knob and it runs out; five wells of coin to take change from; coins let go over it are banked
  { const dx = 0.8, dw = 0.74, dz0 = bz - 0.02, grp = new THREE.Group(); grp.position.set(dx, cy - 0.2, dz0); scene.add(grp); G.pickRoot.add(grp);
    slab(dw, 0.1, 0.02, wal, 0, 0, 0, grp); slab(dw - 0.04, 0.012, 0.36, pbr('planks', { tile: 0.5, color: 0x6a4a36 }), 0, -0.04, 0.19, grp); for (const s of [-1, 1]) slab(0.012, 0.08, 0.36, wal, s * (dw / 2 - 0.02), 0, 0.19, grp); for (let i = 1; i < 5; i++) slab(0.008, 0.06, 0.34, wal, -dw / 2 + 0.02 + i * (dw - 0.04) / 5, -0.01, 0.19, grp);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), brass()); knob.position.set(0, 0, -0.025); grp.add(knob);
    const dr = (bar.drawer = { open: false, wells: {} }); let slideZ = 0;
    const b = { name: 'the cash drawer', r: 0.05, getPos: () => knob.getWorldPosition(_w), press: () => { dr.open = !dr.open; G.audio.play(dr.open ? 'till' : 'thunk'); } }; knob.userData.button = b; G.buttons.push(b);
    [2000, 100, 25, 10, 5].forEach((c, i) => { const wx = -dw / 2 + 0.02 + (i + 0.5) * (dw - 0.04) / 5, pile = new THREE.Group(); pile.position.set(wx, -0.032, 0.12); grp.add(pile); const w = (dr.wells[c] = { n: [0, 6, 12, 14, 14][i], pile, pos: new V3() });
      const redraw = () => { while (pile.children.length) pile.remove(pile.children[0]); const r = COIN[c][1]; for (let k = 0; k < Math.min(w.n, 16); k++) { const m = new THREE.Mesh(geo('coin' + c), matOf('coin' + COIN[c][2])); m.position.set(((k * 7) % 3 - 1) * r * 0.9, 0.0023 * ((k / 3) | 0), ((k * 5) % 4 - 1.5) * r * 0.9 + 0.1); m.rotation.y = k; pile.add(m); } }; new Coin(c).remove(); redraw(); w.redraw = redraw;
      G.sources.push({ get pos() { return pile.getWorldPosition(w.pos).setZ(w.pos.z + 0.1); }, r: 0.045, name: COIN[c][0], can: () => dr.open && w.n > 0, take: () => { w.n--; bar.till -= c; redraw(); return new Coin(c); } }); });
    bar.float = 6 * 100 + 12 * 25 + 14 * 10 + 14 * 5; bar.till = bar.float;
    G.targets.push({ r: 0.4, prio: 3, getPos: () => grp.getWorldPosition(new V3()).setZ(grp.position.z + 0.2), accepts: (it) => it.kind === 'coin' && dr.open, receive: (it) => { bar.till += it.cents; if (it.paid) bar.taken += it.cents; dr.wells[it.cents].n++; dr.wells[it.cents].redraw(); G.audio.play('coin'); it.remove(); } });
    G.updaters.push((dt) => { slideZ += ((dr.open ? -0.34 : 0) - slideZ) * Math.min(1, dt * 10); grp.position.z = dz0 + slideZ; }); }

  // ---- cigars and matches on the back counter
  { const x = 1.95, z = bz + 0.3, box = slab(0.2, 0.05, 0.13, pbr('walnut', { tile: 0.3, color: 0x7a5234 }), x, cy + 0.025, z, scene), lid = slab(0.2, 0.008, 0.13, pbr('walnut', { tile: 0.3, color: 0x7a5234 }), x, cy + 0.1, z + 0.075, scene); lid.rotation.x = -1.25; for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(geo('cigar', () => new THREE.CylinderGeometry(0.0075, 0.0065, 0.12, 8).rotateZ(Math.PI / 2)), matOf('cigar', () => pbr('leather', { tile: 0.1, color: 0x4a2c16, rough: 0.9 }))); c.position.set(x, cy + 0.056, z - 0.05 + i * 0.0125); scene.add(c); }
    const src = { pos: new V3(x, cy + 0.06, z), r: 0.07, name: 'a cigar', can: () => true, take: () => new Cigar() }; box.userData.source = src; G.pickRoot.add(box); G.sources.push(src);
    const mx = 2.25, mb = slab(0.055, 0.02, 0.038, plain(0x8a2a1a, { rough: 0.8 }), mx, cy + 0.01, z, scene), ms = { pos: new V3(mx, cy + 0.02, z), r: 0.04, name: 'a match', can: () => true, take: () => new Match() }; mb.userData.source = ms; G.pickRoot.add(mb); G.sources.push(ms); }

  // ---- the rag, the mallet under the bar, the bell
  bar.rag = new Rag(-1.2, R.barY + 0.01, R.barZ1 - 0.08); bar.mallet = put(new Mallet(), 2.3, 0.64, (R.barZ0 + R.barZ1) / 2 + 0.06, 0.4);
  { const x = -1.35, z = bz + 0.2, dome = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), brass()); dome.position.set(x, cy + 0.014, z); dome.castShadow = true; const knob = tube(0.007, 0.007, 0.022, brass(), x, cy + 0.068, z, scene, 8); slab(0.11, 0.014, 0.11, wal, x, cy + 0.007, z, scene);
    const b = { name: 'the bell', r: 0.06, getPos: () => knob.position, press: () => { G.audio.play('bell'); G.story?.bell?.(); } }; dome.userData.button = b; knob.userData.button = b; G.pickRoot.add(dome, knob); G.buttons.push(b); }

  // a glass standing on the bar top near x (a place at the bar), not in your hand or sliding: what is in front of that customer
  bar.glassAt = (x, z, r = 0.34, y = R.barY) => { let best = null, bd = r; for (const gl of bar.glasses) { if (gl.dead || gl.held || gl.free || gl.owner || gl.slide) continue; const p = gl.obj.position; if (Math.abs(p.y - y) > 0.06) continue; const d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; best = gl; } } return best; };
  bar.thingAt = (kind, x, z, r = 0.3, y = R.barY) => G.items.find((it) => it.kind === kind && !it.dead && !it.held && !it.free && Math.abs(it.obj.position.y - y) < 0.06 && Math.hypot(it.obj.position.x - x, it.obj.position.z - z) < r) || null;
  // what a customer makes of the glass: right drink, in the right glass, clean, a fair measure, not half froth
  bar.judge = (gl, want) => { const D = DRINKS[want], w = gl.what(); if (gl.vol < 0.25) return { ok: false, why: 'empty' }; if (w !== want) return { ok: false, why: 'wrong', got: w }; if (gl.shape !== D[2]) return { ok: false, why: 'glass' }; if (gl.pure() < 0.75) return { ok: false, why: 'mixed' }; if (gl.dirty) return { ok: false, why: 'dirty' }; if (gl.head > 0.42) return { ok: false, why: 'froth' }; return { ok: true, short: gl.vol + gl.head * 0.5 < 0.62 }; };
  // a customer's money on the bar in front of them, and the change of yours that lies there for them
  bar.pay = (cents, x, who, z = R.barZ0 + 0.14) => { coinsFor(cents).forEach((c, i) => { const k = new Coin(c); k.paid = true; k.from = who; k.obj.position.set(x + (i - 1) * 0.045 + rand(-0.01, 0.01), R.barY + 0.04 + i * 0.012, z + rand(-0.02, 0.02)); k.drop(new V3(0, -0.2, 0)); }); };
  bar.changeAt = (x, who, z = R.barZ0 + 0.2) => { const L = G.items.filter((it) => it.kind === 'coin' && !it.dead && !it.held && !it.free && !it.paid && Math.abs(it.obj.position.y - R.barY) < 0.05 && Math.hypot(it.obj.position.x - x, it.obj.position.z - z) < 0.3); return { coins: L, cents: L.reduce((a, c) => a + c.cents, 0) }; };
  bar.sweep = () => { let n = 0; for (const it of [...G.items]) if (it.kind === 'coin' && !it.dead && !it.held) { if (it.paid) { n += it.cents; bar.taken += it.cents; } bar.till += it.cents; const w = bar.drawer.wells[it.cents]; w.n++; w.redraw(); it.remove(); } return n; };   // the night's end: what lies on the bar goes in the drawer
  bar.restock = () => { for (const gl of bar.glasses) if (!gl.dead && !gl.held) { gl.owner = null; gl.locked = false; if (gl.vol > 0 || gl.dirty) gl.empty(true); } bar.wet = 0; };
  bar.update = (dt) => { for (let i = bar.glasses.length - 1; i >= 0; i--) if (bar.glasses[i].dead) bar.glasses.splice(i, 1); for (let i = bar.bottles.length - 1; i >= 0; i--) if (bar.bottles[i].dead) bar.bottles.splice(i, 1); bar.wet = Math.max(0, bar.wet - dt * 0.002); };
  bar.stock = () => { const o = {}; for (const b of bar.bottles) o[b.drink] = (o[b.drink] || 0) + b.level; o.beer = bar.keg.tapped ? bar.keg.level / 60 : 0; o.shots = bar.glasses.filter((g) => g.shape === 'shot').length; o.mugs = bar.glasses.filter((g) => g.shape === 'mug').length; return o; };
  return bar;
}
