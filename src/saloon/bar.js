// the bar's own things: bottles that pour by the wrist, shot glasses and mugs that fill, the beer keg's tap, the wash tub, coins and the cash drawer, the bell that opens the night and calls last orders; how a served glass is judged
import * as THREE from 'three';
import { G, V3, clamp, pick } from '../sushi/ctx.js';
import { Prop, Item } from '../sushi/items.js';
import { PH } from '../sushi/physics.js';
import { DRINKS } from './cast.js';
import { R } from './room.js';
import { plain, brass, canvasTex, model, tube, slab, pbr } from './kit.js';

const glassM = (c, o = 0.42) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: 0.06, metalness: 0, envMapIntensity: 1.6, depthWrite: false });
const lathe = (pts, seg = 16) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const GEO = {}, geo = (k, f) => (GEO[k] ||= f());
// on a screen a bottle or a glass tips by the trigger, as the ramen cart's ladles do; in the headset by your wrist
const deskTilt = (C) => { Object.defineProperty(C.prototype, 'tool', { get() { return G.mode === 'desktop'; }, set() { } }); C.prototype.useMode = 'tilt'; };

const LABEL = { whiskey: ['OLD', 'CROW', 'KENTUCKY WHISKEY', '#e8dcb8', '#2a1608'], rye: ['MONONGAHELA', 'RYE', 'PURE OLD', '#d8c890', '#4a1408'], gin: ['OLD TOM', 'GIN', 'LONDON', '#e4e8e0', '#143024'], brandy: ['COGNAC', 'BRANDY', 'V.S.O.P.', '#201810', '#d8b060'], sarsaparilla: ['SARSA-', 'PARILLA', 'TONIC', '#b8402a', '#f4e8d0'] };
const BODY = { whiskey: 0x3a2206, rye: 0x4a2a08, gin: 0x9ab8a8, brandy: 0x1a2a12, sarsaparilla: 0x2a1408 };

export class Bottle extends Prop {
  constructor(type) {
    const g = new THREE.Group(), D = DRINKS[type], L = LABEL[type];
    const body = new THREE.Mesh(geo('bottle', () => lathe([[0, 0], [0.036, 0], [0.038, 0.01], [0.038, 0.17], [0.03, 0.2], [0.014, 0.235], [0.013, 0.29], [0.016, 0.295], [0.016, 0.305], [0.011, 0.305]])), glassM(BODY[type], type === 'gin' ? 0.4 : 0.78)); body.castShadow = true; g.add(body);
    const liq = new THREE.Mesh(geo('bliq', () => new THREE.CylinderGeometry(0.034, 0.034, 0.16, 12).translate(0, 0.09, 0)), plain(D[3], { rough: 0.2 })); g.add(liq);
    const lt = canvasTex(256, 128, (x, w, h) => { x.fillStyle = L[3]; x.fillRect(0, 0, w, h); x.strokeStyle = L[4]; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = L[4]; x.textAlign = 'center'; x.font = 'bold 30px Georgia'; x.fillText(L[0], w / 2, 44); x.font = 'bold 38px Georgia'; x.fillText(L[1], w / 2, 84); x.font = '15px Georgia'; x.fillText(L[2], w / 2, 110); });
    const lab = new THREE.Mesh(geo('label', () => new THREE.CylinderGeometry(0.0386, 0.0386, 0.075, 16, 1, true, -1.2, 2.4)), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.85 })); lab.position.y = 0.105; g.add(lab);
    super(g, { col: { t: 'cyl', hh: 0.15, r: 0.038 }, mass: 0.9, fragile: BODY[type], top: 0.305, name: D[0], radius: 0.07, cy: 0.14, lift: 0.04, pour: { color: D[3], pay: { type }, r: 0.005, rate: 1.3, lip: 0.012, can: (q) => { if (this.level <= 0) return false; this.level = Math.max(0, this.level - q * 0.035); liq.scale.y = Math.max(0.02, this.level); if (G.t - (this.pt || 0) > 0.14) { this.pt = G.t; G.audio.play('pour'); } return true; } } });
    this.kind = 'bottle'; this.drink = type; this.level = 1; this.handles = [new V3(0, 0.12, 0)];
  }
  hint() { return this.level <= 0 ? `${this.name}: empty` : `${this.name}: tip it over a glass`; }
}
deskTilt(Bottle);

const SHAPE = { shot: { r: 0.024, h: 0.062, in: 0.02, fill: 0.9, mass: 0.12, pts: [[0, 0], [0.02, 0], [0.026, 0.062], [0.0235, 0.062], [0.018, 0.012], [0, 0.012]] }, mug: { r: 0.043, h: 0.135, in: 0.037, fill: 0.5, mass: 0.45, pts: [[0, 0], [0.043, 0], [0.043, 0.135], [0.038, 0.135], [0.037, 0.012], [0, 0.012]] } };
export class Glass extends Prop {
  constructor(shape) {
    const S = SHAPE[shape], g = new THREE.Group();
    const b = new THREE.Mesh(geo('g' + shape, () => lathe(S.pts, 18)), glassM(0xdfeae6, 0.3)); b.castShadow = true; g.add(b);
    if (shape === 'mug') { const hd = new THREE.Mesh(geo('mhandle', () => new THREE.TorusGeometry(0.032, 0.007, 6, 12, Math.PI).rotateZ(-Math.PI / 2).translate(0.043, 0.07, 0)), b.material); g.add(hd); }
    const liq = new THREE.Mesh(geo('l' + shape, () => new THREE.CylinderGeometry(S.in, S.in * (shape === 'shot' ? 0.8 : 1), 1, 14).translate(0, 0.5, 0)), plain(0xffffff, { rough: 0.15 })); liq.position.y = 0.013; liq.visible = false; g.add(liq);
    const foam = shape === 'mug' ? new THREE.Mesh(geo('foam', () => new THREE.CylinderGeometry(S.in, S.in, 0.012, 14)), plain(0xf4ecd8, { rough: 0.9 })) : null; if (foam) { foam.visible = false; g.add(foam); }
    super(g, { col: { t: 'cyl', hh: S.h / 2, r: S.r }, mass: S.mass, fragile: 0xdfeae6, top: S.h, name: shape === 'shot' ? 'shot glass' : 'beer mug', radius: shape === 'shot' ? 0.045 : 0.065, cy: S.h / 2, lift: 0.04 });
    this.kind = 'glass'; this.shape = shape; this.S = S; this.vol = 0; this.mix = {}; this.liq = liq; this.foam = foam; this.takes = { h: S.h, r: S.r + (G.mode === 'desktop' ? 0.02 : 0.004) }; this.owner = null;
  }
  receive(pay, q) { if (this.vol >= 1 || !pay || !pay.type) return; const a = Math.min(1 - this.vol, q * this.S.fill); this.vol += a; this.mix[pay.type] = (this.mix[pay.type] || 0) + a; this.refresh(); }
  what() { let best = null, bv = 0; for (const k in this.mix) if (this.mix[k] > bv) { bv = this.mix[k]; best = k; } return best; }
  pure() { const w = this.what(); return w ? this.mix[w] / Math.max(1e-6, this.vol) : 0; }
  refresh() { const w = this.what(), v = this.vol; this.liq.visible = v > 0.02; if (!this.liq.visible) { if (this.foam) this.foam.visible = false; return; } this.liq.scale.y = (this.S.h - 0.016) * v; this.liq.material = Glass.liqM(w); if (this.foam) { this.foam.visible = w === 'beer' && v > 0.3; this.foam.position.y = 0.013 + (this.S.h - 0.016) * v + 0.004; } }
  static liqM(w) { Glass.M ||= {}; return (Glass.M[w] ||= plain(DRINKS[w] ? DRINKS[w][3] : 0x8a6a3a, { rough: 0.15, opacity: w === 'gin' ? 0.55 : 0.9 })); }
  empty() { this.vol = 0; this.mix = {}; this.refresh(); }
  tick() { if (this.vol > 0.02 && (this.held || this.free) && this.tilt() > 1.5) { G.fx.drops(this.worldCenter(new V3()), Glass.liqM(this.what()).color.getHex(), 6); G.audio.play('splash'); this.empty(); } }
  hint() { const w = this.what(); return this.vol < 0.05 ? `empty ${this.name}` : `${this.name} of ${w}${this.vol < 0.6 ? ' (short)' : ''}: set it in front of whoever asked`; }
}
deskTilt(Glass);

const COIN = { 100: ['a silver dollar', 0.019, 0xc8c8c8], 25: ['a quarter', 0.0121, 0xc0c0c4], 10: ['a dime', 0.009, 0xc4c4c8], 5: ['a nickel', 0.0106, 0xa8a4a0], 2000: ['a double eagle', 0.017, 0xd8a830] };
export class Coin extends Item {
  constructor(cents) { const [name, r, c] = COIN[cents], g = new THREE.Group(), m = new THREE.Mesh(geo('coin' + cents, () => new THREE.CylinderGeometry(r, r, 0.0022, 14).translate(0, 0.0011, 0)), Coin.mat(c)); m.castShadow = true; g.add(m);
    super('coin', g, { radius: 0.03, cy: 0.002, lift: 0.03, name }); this.cents = cents; this.col = { t: 'cyl', hh: 0.0011, r }; this.mass = 0.02; }
  static mat(c) { Coin.M ||= {}; return (Coin.M[c] ||= plain(c, { rough: 0.3, metal: 1, env: 1.3 })); }
  onLand() { G.audio.play('coin'); } onGround() { } hint() { return `${this.name}: into the cash drawer`; }
}
export const coinsFor = (cents) => { const out = []; for (const c of [2000, 100, 25, 10, 5]) while (cents >= c && out.length < 9) { out.push(c); cents -= c; } return out; };

export function buildBar(scene, room) {
  const bar = { bottles: [], glasses: [], till: 0, taken: 0, open: false, lastCall: false, served: 0 };
  const put = (it, x, y, z, ry = 0) => { it.obj.position.set(x, y, z); it.obj.rotation.y = ry; if (PH.ready && it.col) PH.rest(it); return it; };
  // ---- the bottles on the back bar's shelves and the working ones on the back counter
  const stock = ['whiskey', 'whiskey', 'rye', 'brandy', 'gin', 'sarsaparilla'];
  stock.forEach((t, i) => bar.bottles.push(put(new Bottle(t), -1.05 + i * 0.26 + (i > 2 ? 0.9 : 0) - 0.5, R.backY, R.backZ + 0.16, 0.2 * i)));
  for (const s of room.shelves) for (let x = s.x0 + 0.1, k = 0; x < s.x1; x += 0.19, k++) if ((k * 7 + Math.round(s.y * 10)) % 5 !== 0) bar.bottles.push(put(new Bottle(pick(['whiskey', 'rye', 'brandy', 'gin', 'whiskey'])), x, s.y, s.z, k));
  // ---- clean glasses: a tray of shots and a row of mugs that never runs out (new ones come up from under the bar)
  const tray = (shape, x, z, n, name) => { const pos = new V3(x, R.backY + 0.05, z); for (let i = 0; i < n; i++) { const gl = put(new Glass(shape), x - 0.12 + (i % 4) * (shape === 'shot' ? 0.07 : 0.11), R.backY, z + ((i / 4) | 0) * 0.09 - 0.04); bar.glasses.push(gl); }
    G.sources.push({ pos: pos.clone().setX(x + 0.3), r: 0.07, name, can: () => true, take: () => { const gl = new Glass(shape); bar.glasses.push(gl); return gl; } });
    const mk = model('wooden_crate_01', x + 0.3, R.backY, z, 0, { h: 0.09 }, scene); mk.userData.source = G.sources[G.sources.length - 1]; G.pickRoot.add(mk); };
  tray('shot', -0.25, R.backZ + 0.42, 8, 'a clean shot glass'); tray('mug', 0.15, R.backZ + 0.44, 4, 'a clean mug');
  // ---- the keg and its tap: press it and beer runs for a moment
  { const kx = 0.95, kz = R.backZ + 0.42, keg = model('wine_barrel_01', kx, R.backY, kz, 0, { h: 0.5 }, scene); const sp = tube(0.008, 0.008, 0.09, brass(), kx, R.backY + 0.2, kz - 0.26, scene, 8); sp.rotation.x = Math.PI / 2; const hd = slab(0.02, 0.07, 0.02, brass(), kx, R.backY + 0.245, kz - 0.29, scene);
    const spout = new V3(kx, R.backY + 0.19, kz - 0.31); let run = 0; const pay = { type: 'beer' };
    const b = { name: 'the beer tap', r: 0.05, getPos: () => hd.position, press: () => { run = 2.3; G.audio.play('click'); } }; hd.userData.button = b; G.pickRoot.add(hd); G.buttons.push(b);
    G.updaters.push((dt) => { if (run > 0) { run -= dt; hd.rotation.x = -0.9; G.fx.pour(spout, new V3(0, -0.3, -0.02), DRINKS.beer[3], 1.6 * dt, pay, b, 0.007); if (G.t - (b.pt || 0) > 0.14) { b.pt = G.t; G.audio.play('pour'); } } else hd.rotation.x = 0; }); }
  // ---- the wash tub: an empty or a dirty glass dropped in is gone
  { const x = -2.3, z = R.backZ + 0.36; model('wooden_bucket_01', x, R.backY, z, 0, { h: 0.2 }, scene); G.targets.push({ r: 0.2, prio: 1, getPos: () => new V3(x, R.backY + 0.1, z), accepts: (it) => it.kind === 'glass', receive: (it) => { G.audio.play('splash'); const i = bar.glasses.indexOf(it); if (i >= 0) bar.glasses.splice(i, 1); it.remove(); } }); }
  // ---- the cash drawer: coins let go over the register are taken
  { const x = 1.55, z = R.backZ + 0.3; G.targets.push({ r: 0.3, prio: 2, getPos: () => new V3(x, R.backY + 0.2, z), accepts: (it) => it.kind === 'coin', receive: (it) => { bar.till += it.cents; bar.taken += it.cents; G.audio.play('till'); it.remove(); G.story?.onMoney?.(it.cents); } }); }
  // ---- the bell
  { const x = -0.75, z = R.backZ + 0.2, bell = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), brass()); bell.position.set(x, R.backY + 0.012, z); const knob = tube(0.008, 0.008, 0.02, brass(), x, R.backY + 0.065, z, scene, 8); slab(0.11, 0.012, 0.11, pbr('walnut', { tile: 0.3 }), x, R.backY + 0.006, z, scene);
    const b = { name: 'the bell', r: 0.06, getPos: () => knob.position, press: () => { G.audio.play('bell'); G.story?.bell?.(); } }; bell.userData.button = b; knob.userData.button = b; G.pickRoot.add(bell, knob); G.buttons.push(b); }

  // a glass standing on the bar top near x (a place at the bar), not in your hand: what is in front of that customer
  const _c = new V3();
  bar.glassAt = (x, z, r = 0.34, y = R.barY) => { let best = null, bd = r; for (const gl of bar.glasses) { if (gl.dead || gl.held || gl.free || gl.owner) continue; const p = gl.obj.position; if (Math.abs(p.y - y) > 0.06) continue; const d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; best = gl; } } return best; };
  // what a customer makes of the glass: right drink, in the right glass, a fair measure
  bar.judge = (gl, want) => { const D = DRINKS[want], w = gl.what(); if (gl.vol < 0.25) return { ok: false, why: 'empty' }; if (w !== want) return { ok: false, why: 'wrong', got: w }; if (gl.shape !== D[2]) return { ok: false, why: 'glass' }; if (gl.pure() < 0.75) return { ok: false, why: 'mixed' }; return { ok: true, short: gl.vol < 0.6 }; };
  // a customer's money on the bar in front of them
  bar.pay = (cents, x, z = R.barZ0 + 0.16) => { coinsFor(cents).forEach((c, i) => { const k = new Coin(c); k.obj.position.set(x + (i - 1) * 0.045 + (Math.random() - 0.5) * 0.02, R.barY + 0.05 + i * 0.012, z + (Math.random() - 0.5) * 0.04); k.drop(new V3(0, -0.2, 0)); }); };
  bar.sweep = () => { let n = 0; for (const it of [...G.items]) if (it.kind === 'coin' && !it.dead && !it.held) { n += it.cents; it.remove(); } bar.till += n; bar.taken += n; return n; };   // the night's end: what lies on the bar goes in the drawer
  bar.restock = () => { for (const b of bar.bottles) if (!b.dead && b.level < 0.35) { b.level = 1; b.pours.can(0); } };
  bar.update = () => { for (let i = bar.glasses.length - 1; i >= 0; i--) if (bar.glasses[i].dead) bar.glasses.splice(i, 1); };
  bar.Glass = Glass; bar.Bottle = Bottle; bar.Coin = Coin;
  return bar;
}
