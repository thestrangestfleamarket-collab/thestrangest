// everything in the saloon as a real thing: chairs and stools are weighted bodies you can shove, lift, throw and smash to planks; tables break; the mirror, the windows and the bottles on the shelves break when shot or struck; the back bar's cupboards and the bedroom door open on their hinges; the batwing doors swing as someone passes
import * as THREE from 'three';
import { G, V3, clamp, rand } from '../sushi/ctx.js';
import { Prop, Item } from '../sushi/items.js';
import { PH } from '../sushi/physics.js';
import { R } from './room.js';
import { pbr, plain, model, canvasTex } from './kit.js';

const _a = new V3(), _b = new V3(), _c = new V3();
class Plank extends Item {
  constructor(l, w, t, m) { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(w, t, l), m); b.position.y = t / 2; b.castShadow = false; g.add(b); super('plank', g, { radius: Math.max(0.06, l * 0.4), cy: t / 2, lift: 0.05, name: 'a broken piece of wood' }); this.col = { t: 'box', hx: w / 2, hy: t / 2, hz: l / 2 }; this.mass = 0.4 + l; this.life = 240; }
  update(dt) { if (!this.held && (this.life -= dt) < 0) this.remove(); } onGround() { } onLand() { G.audio.play('place'); } hint() { return this.name; }
}
class Shard extends Item {
  constructor(m) { const s = 0.03 + Math.random() * 0.06, g = new THREE.Group(), geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0.002, -s, s * 0.8, 0.002, s * 0.5, -s * 0.7, 0.002, s * 0.6], 3)); geo.computeVertexNormals(); const b = new THREE.Mesh(geo, m); b.castShadow = false; g.add(b); super('bit', g, { radius: 0.02, cy: 0.002, name: 'glass' }); this.col = { t: 'box', hx: s * 0.5, hy: 0.002, hz: s * 0.5 }; this.mass = 0.02; this.life = 90; this.locked = true; }
  update(dt) { if ((this.life -= dt) < 0) this.remove(); } onGround() { } onLand() { }
}
const SHAPE = { chair: { col: { t: 'box', hx: 0.21, hy: 0.44, hz: 0.21 }, mass: 4.5, hp: 2, breakAt: 6, planks: 7 }, stool: { col: { t: 'cyl', hh: 0.38, r: 0.17 }, mass: 3.2, hp: 2, breakAt: 6.5, planks: 5 } };
class Furn extends Prop {
  constructor(d, wood) { const S = SHAPE[d.kind], obj = model(d.model, 0, 0, 0, 0, { h: d.h }); if (d.tint) obj.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.set(d.tint); } });
    super(obj, { col: S.col, mass: S.mass, name: d.kind === 'stool' ? 'a bar stool' : 'a chair', radius: 0.32, cy: S.col.hy ?? S.col.hh, lift: 0.1 }); this.kind = 'furn'; this.d = d; this.S = S; this.hp = S.hp; this.wood = wood; this.home(); }
  home() { this.obj.position.set(this.d.x, this.d.y, this.d.z); this.obj.rotation.set(0, this.d.ry, 0); this.hp = this.S.hp; this.d.seat.gone = false; this.stirred = false; if (PH.ready) PH.rest(this); }
  stir() { if (!this.stirred) { this.stirred = true; this.d.seat.gone = true; } }
  onGrab() { this.stir(); }
  drop(v, w) { this.stir(); super.drop(v, w); }
  smash(v) { if (this.dead) return; this.stir(); G.audio.play('crack'); const p = this.worldCenter(_a).clone(); for (let i = 0; i < this.S.planks; i++) { const k = new Plank(rand(0.22, 0.55), rand(0.03, 0.07), rand(0.018, 0.03), this.wood); k.obj.position.set(p.x + rand(-0.15, 0.15), p.y + rand(-0.2, 0.3), p.z + rand(-0.15, 0.15)); k.obj.rotation.set(rand(6), rand(6), rand(6)); k.drop(new V3((v ? v.x * 0.4 : 0) + rand(-1.6, 1.6), rand(0.6, 2.6), (v ? v.z * 0.4 : 0) + rand(-1.6, 1.6)), new V3(rand(-8, 8), rand(-8, 8), rand(-8, 8))); } G.story?.event?.('smashed', { what: this.name }); this.remove(); }
  // a bullet (the guns call this with 10) splinters it; two and it is in pieces. A hard enough landing breaks it outright
  onImpact(sp) { if (sp === 10) { G.audio.play('crack', 0.6); if (--this.hp <= 0) { this.smash(this.vel); return true; } return false; } if (sp > this.S.breakAt) { this.smash(this.vel); return true; } return false; }
  onLand() { G.audio.play('thunk', 0.7); } onGround() { } hint() { return this.name; }
}

export function buildFurn(scene, room) {
  const furn = { list: [], broken: 0 }, wood = pbr('planks', { tile: 0.6, color: 0x7a6450 });
  const spawn = () => { for (const f of furn.list) if (!f.dead) f.remove(); furn.list = room.loose.map((d) => new Furn(d, wood)); };
  spawn();

  // ---- tables: fixed and heavy, but four bullets or a hard enough blow and they are firewood; what stood on them falls
  for (const t of room.tables) { t.hp = 4; t.alive = true; }
  const breakTable = (t) => { if (!t.alive) return; t.alive = false; t.obj.visible = false; G.audio.play('crack'); const i = room.solids.indexOf(t.solid); if (i >= 0) room.solids.splice(i, 1); const j = G.surfaces.indexOf(t.top.s); if (j >= 0) G.surfaces.splice(j, 1); if (PH.ready) { if (t.top.c) PH.world.removeCollider(t.top.c, true); if (t.cyl) PH.world.removeCollider(t.cyl, true); t.top.c = t.cyl = null; }
    for (let k = 0; k < 9; k++) { const p = new Plank(rand(0.3, 0.7), rand(0.06, 0.14), 0.03, wood); p.obj.position.set(t.x + rand(-0.3, 0.3), 0.3 + rand(0, 0.5), t.z + rand(-0.3, 0.3)); p.obj.rotation.set(rand(6), rand(6), rand(6)); p.drop(new V3(rand(-1.5, 1.5), rand(0.5, 2), rand(-1.5, 1.5)), new V3(rand(-6, 6), rand(-6, 6), rand(-6, 6))); }
    for (const it of G.items) if (!it.dead && !it.held && !it.free && Math.abs(it.obj.position.y - 0.76) < 0.08 && Math.hypot(it.obj.position.x - t.x, it.obj.position.z - t.z) < 0.5) it.drop(new V3(rand(-0.5, 0.5), 0, rand(-0.5, 0.5))); for (const s of t.seats) s.table = false; furn.broken++; G.story?.event?.('smashed', { what: 'a table' }); };
  furn.breakTable = breakTable;

  // ---- glass in the wall: the mirror and the street windows crack, then fall out in pieces
  const shardM = new THREE.MeshStandardMaterial({ color: 0xc8d4d0, transparent: true, opacity: 0.45, roughness: 0.05, envMapIntensity: 1.5, side: THREE.DoubleSide });
  const crackT = canvasTex(256, 256, (x) => { x.clearRect(0, 0, 256, 256); x.strokeStyle = 'rgba(230,240,240,.85)'; x.lineWidth = 1.2; for (let i = 0; i < 18; i++) { const a = i * 0.35 + Math.random() * 0.2; x.beginPath(); x.moveTo(128, 128); let px = 128, py = 128; for (let k = 0; k < 6; k++) { px += Math.cos(a + (Math.random() - 0.5) * 0.5) * 24; py += Math.sin(a + (Math.random() - 0.5) * 0.5) * 24; x.lineTo(px, py); } x.stroke(); } for (let r = 20; r < 120; r += 26) { x.beginPath(); for (let i = 0; i <= 18; i++) { const a = i * 0.35, rr = r + Math.random() * 8; x.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } x.stroke(); } });
  const breakPane = (p, at) => { if (p.state === 2) return; G.audio.play('break'); const n = p.state ? 16 : 7;
    for (let i = 0; i < n; i++) { const s = new Shard(shardM); s.obj.position.set(at.x + rand(-0.25, 0.25), at.y + rand(-0.25, 0.25), p.z + (p.name === 'mirror' ? -0.05 : 0.08)); s.obj.rotation.set(rand(6), rand(6), rand(6)); s.drop(new V3(rand(-1, 1), rand(-0.5, 1.5), p.name === 'mirror' ? rand(-1.5, -0.3) : rand(0.3, 1.5)), new V3(rand(-9, 9), rand(-9, 9), rand(-9, 9))); }
    if (!p.state) { p.state = 1; const c = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: crackT, transparent: true, depthWrite: false })); c.position.set(at.x, at.y, p.z + (p.name === 'mirror' ? -0.012 : 0.012)); if (p.name === 'mirror') c.rotation.y = Math.PI; c.userData.nopick = true; scene.add(c); p.crack = c; }
    else { p.state = 2; p.m.visible = false; if (p.crack) p.crack.visible = false; if (p.name === 'mirror') { const bk = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), plain(0x1a1612, { rough: 1 })); bk.position.copy(p.m.position); bk.rotation.y = Math.PI; scene.add(bk); p.back = bk; } } G.story?.event?.('smashed', { what: 'the ' + p.name }); };
  const paneAt = (pt) => room.panes.find((p) => p.state !== 2 && Math.abs(pt.z - p.z) < 0.14 && Math.abs(pt.x - p.x) < p.w / 2 && Math.abs(pt.y - p.y) < p.h / 2);
  furn.breakPane = breakPane;

  // ---- a shot: besides what the guns already do, it breaks glass in the wall, a bottle on the shelf, a table in its way
  const fire0 = G.guns && G.guns.fire;
  if (fire0) G.guns.fire = (o) => { const r = fire0(o), dir = o.dir, from = o.from; if (r && r.point) { const p = paneAt(r.point); if (p) breakPane(p, r.point); }
    const far = r && r.dist ? r.dist + 0.2 : 30; for (const sl of G.bar.shelf) { if (!sl.on) continue; _a.set(sl.x, sl.y + 0.14, sl.z).sub(from); const t = _a.dot(dir); if (t < 0 || t > far) continue; if (_b.copy(dir).multiplyScalar(t).sub(_a).length() < 0.05) { const b = G.sources.find((q) => q.pos.x === sl.x && q.pos.z === sl.z && q.can()); if (b) { const it = b.take(); it.obj.position.set(sl.x, sl.y, sl.z); it.onImpact(10) || it.drop(dir.clone().multiplyScalar(3)); } break; } }
    for (const t of room.tables) { if (!t.alive) continue; _a.set(t.x, 0.6, t.z).sub(from); const tt = _a.dot(dir); if (tt < 0 || tt > far) continue; if (_b.copy(dir).multiplyScalar(tt).sub(_a).length() < 0.4) { G.audio.play('crack', 0.5); if (--t.hp <= 0) breakTable(t); break; } }
    return r; };

  // ---- hinges: the cupboards under the back bar and the bedroom door open and shut by their knobs; the batwing doors swing when someone goes through
  const doors = [...room.cupboards, ...room.hinges.filter((h) => !h.swing)], swing = room.hinges.filter((h) => h.swing);
  for (const d of doors) { let km = d.knobM; if (!km) { km = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), plain(0x000000, { opacity: 0.01 })); km.position.set(...d.knob); d.g.add(km); } const b = { name: d.name, r: 0.07, getPos: () => km.getWorldPosition(new V3()), press: () => { d.to = Math.abs(d.to) > 0.01 && d.to === d.open ? 0 : d.open; G.audio.play('creak'); } }; d.to = d.a; d.btn = b; G.buttons.push(b); d.g.traverse((o) => { if (o.isMesh) o.userData.button = b; }); }
  { const it = [['jug_01', 0.26], ['brass_pot_01', 0.16], ['wooden_bucket_01', 0.2]]; room.cupboards.forEach((c, i) => { const [m, h] = it[i % 3]; model(m, c.x + 0.1, 0.11, c.z, i, { h }, scene); if (i % 2) model('jug_01', c.x - 0.12, 0.49, c.z, i * 2, { h: 0.2 }, scene); }); }

  const pushV = new V3();
  furn.reset = () => { spawn(); for (const t of room.tables) if (!t.alive) { t.alive = true; t.hp = 4; t.obj.visible = true; room.solids.push(t.solid); G.surfaces.push(t.top.s); if (PH.ready) { t.top.c = PH.box(t.x, 0.73, t.z, 0.38, 0.03, 0.38); t.cyl = PH.cyl(t.x, 0.38, t.z, 0.36, 0.1); } } for (const p of room.panes) if (p.state) { p.state = 0; p.m.visible = true; if (p.crack) { scene.remove(p.crack); p.crack = null; } if (p.back) { scene.remove(p.back); p.back = null; } } furn.broken = 0; };
  furn.update = (dt) => {
    for (const d of doors) if (Math.abs(d.to - d.a) > 0.002) { d.a += (d.to - d.a) * Math.min(1, dt * 6); d.g.rotation.y = d.a; }
    // the batwings: pushed by whoever is in the doorway, then swinging back
    { let push = 0; const near = (x, z, vz) => { if (Math.abs(x) < 0.95 && Math.abs(z + R.L) < 0.55) push += Math.sign(vz || -(z + R.L)) * 2.4; }; const c = G.camera.getWorldPosition(_a); near(c.x, c.z, 0); for (const p of G.folk.people) if (p.here && p.alive && p.state === 'walk') near(p.root.position.x, p.root.position.z, p.tgt ? p.tgt.z - p.root.position.z : 0);
      for (const h of swing) { h.v += (-h.a * 22 - h.v * 2.2 + push * 6) * dt; h.a = clamp(h.a + h.v * dt, -1.35, 1.35); h.g.rotation.y = -h.s * h.a; } }
    // you walk into a chair: it goes over
    const cam = G.camera.getWorldPosition(_a), lv = room.state.lv, vel = G.rig.position; pushV.set(vel.x - (furn.px ?? vel.x), 0, vel.z - (furn.pz ?? vel.z)).divideScalar(Math.max(dt, 1e-3)); furn.px = vel.x; furn.pz = vel.z;
    const sp = pushV.length();
    for (const f of furn.list) { if (f.dead || f.held) continue; const p = f.obj.position;
      if (!f.free && lv === 0 && sp > 0.5 && Math.hypot(p.x - cam.x, p.z - cam.z) < 0.42 && p.y < 0.3) f.drop(new V3(pushV.x * 0.9 + (p.x - cam.x) * 2, 0.6, pushV.z * 0.9 + (p.z - cam.z) * 2), new V3(rand(-2, 2), 0, rand(-2, 2)));
      if (!f.free) for (const it of G.items) { if (!it.free || it === f || it.kind === 'bit' || it.vel.lengthSq() < 5 || (it.mass || 0.1) < 0.3) continue; if (it.worldCenter(_b).distanceTo(f.worldCenter(_c)) < 0.34 + (it.radius || 0.05)) { f.drop(it.vel.clone().multiplyScalar(Math.min(1, (it.mass || 0.3) / f.S.mass) * 1.4)); break; } } }
    // something thrown hard at glass in the wall, or at a table
    for (const it of G.items) { if (!it.free || it.dead || it.kind === 'bit' || it.vel.lengthSq() < 9) continue; const c = it.worldCenter(_b); const p = paneAt(c); if (p && (it.mass || 0.1) > 0.1) { breakPane(p, c.clone()); if (p.state === 1 && (it.mass || 0) > 0.8) breakPane(p, c.clone()); }
      if ((it.mass || 0) > 2.5) for (const t of room.tables) if (t.alive && c.y < 1.1 && Math.hypot(c.x - t.x, c.z - t.z) < 0.5) { breakTable(t); break; } }
  };
  return furn;
}
