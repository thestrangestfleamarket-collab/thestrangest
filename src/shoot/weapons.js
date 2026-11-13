// Weapon models (built from extruded profiles) and firearm mechanics: magazines, chambering, slide lock,
// racking, pump action, recoil springs. Gun space: -Z is forward, +Y up, origin where the hand grips.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const DEFS = {
  pistol: { id: 1, name: 'P-9', dmg: 28, interval: 0.1, auto: false, cap: 15, reserve: 45, pellets: 1, spread: 0.005, kick: 5.5, back: 0.5, sound: 'pistol', twoHand: false, rackMax: 0.035, flash: 0.8 },
  rifle: { id: 2, name: 'AR-K', dmg: 21, interval: 0.095, auto: true, cap: 30, reserve: 90, pellets: 1, spread: 0.008, kick: 2.6, back: 0.35, sound: 'rifle', twoHand: true, rackMax: 0.05, flash: 1 },
  shotgun: { id: 3, name: 'M-12', dmg: 12, interval: 0.25, auto: false, cap: 6, reserve: 18, pellets: 8, spread: 0.045, kick: 9, back: 0.9, sound: 'shotgun', twoHand: true, pump: true, rackMax: 0.09, flash: 1.5 },
};
export const TYPE_BY_ID = { 1: 'pistol', 2: 'rifle', 3: 'shotgun' };

let MAT = null;
function mats() {
  if (MAT) return MAT;
  MAT = {
    steel: new THREE.MeshStandardMaterial({ color: 0x25272b, metalness: 0.95, roughness: 0.38 }),
    worn: new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 1, roughness: 0.3 }),
    poly: new THREE.MeshStandardMaterial({ color: 0x0e0f10, metalness: 0.05, roughness: 0.72 }),
    tan: new THREE.MeshStandardMaterial({ color: 0x5a4a34, metalness: 0.05, roughness: 0.75 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x4a2c14, metalness: 0, roughness: 0.55 }),
    glowG: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 3, 0.6) }),
    lens: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 2.2) }),
    olive: new THREE.MeshStandardMaterial({ color: 0x2f3a22, metalness: 0.3, roughness: 0.6 }),
    red: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.2, 0.1) }),
  };
  return MAT;
}

// extrude a side profile given as [forward, up] pairs
function ext(pts, thick, bevel = 0.0025) {
  const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: thick - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, steps: 1 });
  g.translate(0, 0, -(thick - bevel * 2) / 2); g.rotateY(Math.PI / 2);
  return g;
}
const cylZ = (r, len, f, up, seg = 10) => { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateX(Math.PI / 2); g.translate(0, up, -(f + len / 2)); return g; };
const bx = (w, h, len, f, up, x = 0) => { const g = new THREE.BoxGeometry(w, h, len); g.translate(x, up, -f); return g; };
// collapse a group's direct child meshes into one mesh per material (far fewer draw calls per weapon)
function compact(group) {
  const by = new Map();
  for (const c of [...group.children]) {
    if (!c.isMesh || c.children.length || c.material.isShaderMaterial || !c.geometry.attributes.normal) continue;
    c.updateMatrix(); const g = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(c.matrix);
    if (!by.has(c.material)) by.set(c.material, []); by.get(c.material).push(g); group.remove(c);
  }
  for (const [mat, geos] of by) { const m = new THREE.Mesh(mergeGeometries(geos, false), mat); m.castShadow = true; group.add(m); }
}
function part(parent, geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; }
function pt(parent, f, up, x = 0) { const o = new THREE.Object3D(); o.position.set(x, up, -f); parent.add(o); return o; }

// red-dot reflex sight: the dot is collimated (drawn along the bore direction regardless of eye position)
function reflexMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uFwd: { value: new THREE.Vector3(0, 0, -1) } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uFwd; varying vec3 vW; void main(){ vec3 d = normalize(vW - cameraPosition); float a = length(cross(d, normalize(uFwd))); float dotc = 1.0 - smoothstep(0.0012, 0.0022, a); float ring = (1.0 - smoothstep(0.0006, 0.0014, abs(a - 0.011))) * 0.55; float k = max(dotc, ring); gl_FragColor = vec4(vec3(4.0,0.25,0.15) * k + vec3(0.05,0.12,0.14) * 0.3, max(k, 0.07)); }',
  });
}

export function magazineMesh(type) {
  const M = mats();
  if (type === 'pistol') { const g = new THREE.Group(); part(g, bx(0.018, 0.105, 0.03, 0, -0.045), M.worn); part(g, bx(0.024, 0.01, 0.036, 0.002, -0.1), M.poly); return g; }
  if (type === 'rifle') { const g = new THREE.Group(); part(g, ext([[-0.025, 0.03], [0.025, 0.03], [0.045, -0.13], [-0.002, -0.14]], 0.022), M.poly); return g; }
  const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0xa01810, roughness: 0.5 })); s.rotation.x = Math.PI / 2; g.add(s);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0098, 0.0098, 0.012, 8), new THREE.MeshStandardMaterial({ color: 0xc9a23f, metalness: 1, roughness: 0.3 })); b.rotation.x = Math.PI / 2; b.position.z = 0.025; g.add(b); return g;
}

// returns {group, model, slide, mag, muzzle, fore, magwell, rack, port, eject, lightMount, counter, reflex}
export function buildModel(type) {
  const M = mats(), group = new THREE.Group(), model = new THREE.Group(); group.add(model);
  const P = { group, model };
  if (type === 'pistol') {
    model.position.set(0, 0.03, -0.045);
    part(model, ext([[-0.045, 0.012], [0.115, 0.012], [0.115, 0.034], [-0.05, 0.034]], 0.026), M.poly);
    part(model, ext([[-0.05, 0.03], [-0.012, 0.03], [-0.03, -0.085], [-0.072, -0.08]], 0.03, 0.004), M.poly);
    part(model, ext([[0.0, 0.012], [0.055, 0.012], [0.05, -0.022], [0.0, -0.026], [0.0, -0.02], [0.044, -0.017], [0.048, 0.006], [0.0, 0.006]], 0.008, 0.001), M.poly);
    part(model, bx(0.005, 0.02, 0.006, 0.02, 0.0), M.steel);
    part(model, bx(0.018, 0.014, 0.05, 0.085, 0.004), M.steel); // rail
    P.slide = new THREE.Group(); model.add(P.slide);
    part(P.slide, ext([[-0.055, 0.034], [0.118, 0.034], [0.118, 0.06], [-0.05, 0.063]], 0.028), M.steel);
    part(P.slide, bx(0.004, 0.006, 0.004, 0.11, 0.065), M.glowG);
    part(P.slide, bx(0.004, 0.007, 0.005, -0.04, 0.066, 0.006), M.steel); part(P.slide, bx(0.004, 0.007, 0.005, -0.04, 0.066, -0.006), M.steel);
    part(model, cylZ(0.0058, 0.16, -0.04, 0.05), M.worn);
    P.magwell = pt(model, -0.045, -0.035); P.magwell.rotation.x = -0.2;
    P.muzzle = pt(model, 0.122, 0.05); P.rack = pt(model, -0.03, 0.05); P.eject = pt(model, 0.02, 0.06, 0.016);
    P.lightMount = pt(model, 0.1, -0.004); P.fore = null;
    P.counterAt = [-0.056, 0.048, 0.024, 0.012];
  } else if (type === 'rifle') {
    model.position.set(0, 0.02, -0.06);
    part(model, ext([[-0.08, 0.02], [0.14, 0.02], [0.14, 0.078], [-0.08, 0.078]], 0.04), M.steel);
    part(model, ext([[-0.065, 0.024], [-0.03, 0.024], [-0.05, -0.072], [-0.092, -0.064]], 0.03, 0.004), M.poly);
    part(model, ext([[-0.01, 0.02], [0.03, 0.02], [0.028, -0.012], [-0.01, -0.016], [-0.01, -0.011], [0.022, -0.008], [0.024, 0.016], [-0.01, 0.016]], 0.008, 0.001), M.steel);
    part(model, ext([[0.14, 0.024], [0.42, 0.03], [0.42, 0.072], [0.14, 0.078]], 0.042, 0.004), M.tan);
    for (let i = 0; i < 6; i++) part(model, bx(0.046, 0.012, 0.022, 0.18 + i * 0.04, 0.05), M.poly);
    part(model, ext([[-0.08, 0.035], [-0.08, 0.074], [-0.3, 0.074], [-0.32, 0.064], [-0.32, -0.03], [-0.29, -0.036], [-0.2, 0.03]], 0.034, 0.004), M.tan);
    part(model, cylZ(0.009, 0.15, 0.42, 0.052), M.steel); part(model, cylZ(0.013, 0.045, 0.54, 0.052, 8), M.steel);
    part(model, bx(0.022, 0.008, 0.36, 0.2, 0.082), M.steel); // top rail
    const vg = new THREE.CylinderGeometry(0.014, 0.012, 0.075, 8); vg.translate(0, -0.012, -0.3); part(model, vg, M.poly); // vertical foregrip
    // reflex sight
    part(model, bx(0.036, 0.008, 0.05, 0.04, 0.09), M.steel);
    part(model, bx(0.004, 0.038, 0.012, 0.06, 0.113, 0.017), M.steel); part(model, bx(0.004, 0.038, 0.012, 0.06, 0.113, -0.017), M.steel); part(model, bx(0.038, 0.004, 0.012, 0.06, 0.133), M.steel);
    P.reflex = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.036), reflexMaterial()); P.reflex.position.set(0, 0.113, -0.06); P.reflex.material.side = THREE.DoubleSide; model.add(P.reflex);
    P.slide = new THREE.Group(); model.add(P.slide);
    part(P.slide, bx(0.012, 0.012, 0.03, 0.05, 0.062, 0.024), M.worn);
    P.magwell = pt(model, 0.06, 0.0);
    P.muzzle = pt(model, 0.59, 0.052); P.rack = pt(model, 0.05, 0.062, 0.03); P.eject = pt(model, 0.07, 0.06, 0.024);
    P.fore = pt(model, 0.3, 0.02); P.lightMount = pt(model, 0.4, 0.05, -0.03);
    P.counterAt = [-0.082, 0.056, 0.03, 0.015];
  } else if (type === 'shotgun') {
    model.position.set(0, 0.02, -0.06);
    part(model, ext([[-0.06, 0.02], [0.17, 0.02], [0.17, 0.078], [-0.06, 0.078]], 0.042), M.steel);
    part(model, ext([[-0.062, 0.03], [-0.062, 0.074], [-0.34, 0.05], [-0.36, -0.045], [-0.33, -0.052], [-0.14, 0.012], [-0.1, -0.07], [-0.062, -0.062], [-0.04, 0.03]], 0.036, 0.005), M.wood);
    part(model, ext([[-0.01, 0.02], [0.03, 0.02], [0.028, -0.012], [-0.01, -0.016], [-0.01, -0.011], [0.022, -0.008], [0.024, 0.016], [-0.01, 0.016]], 0.008, 0.001), M.steel);
    part(model, cylZ(0.012, 0.47, 0.17, 0.064), M.steel); part(model, cylZ(0.0115, 0.4, 0.17, 0.036), M.steel);
    part(model, cylZ(0.004, 0.006, 0.625, 0.08, 6), M.glowG);
    P.slide = new THREE.Group(); model.add(P.slide);
    const pg = new THREE.CylinderGeometry(0.023, 0.023, 0.16, 10); pg.rotateX(Math.PI / 2); pg.scale(1, 0.9, 1); pg.translate(0, 0.034, -0.4); part(P.slide, pg, M.wood);
    for (let i = 0; i < 5; i++) part(P.slide, bx(0.05, 0.03, 0.006, 0.34 + i * 0.03, 0.03), M.poly);
    P.magwell = null; P.port = pt(model, 0.07, 0.012);
    P.muzzle = pt(model, 0.645, 0.064); P.eject = pt(model, 0.08, 0.06, 0.024);
    P.fore = pt(model, 0.4, 0.03); P.rack = null; P.lightMount = pt(model, 0.5, 0.045, -0.03);
    P.counterAt = [-0.063, 0.058, 0.03, 0.015];
  }
  compact(model); compact(P.slide);
  if (P.magwell) { P.mag = magazineMesh(type); P.magwell.add(P.mag); }
  P.flash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), null); P.flash.visible = false; P.muzzle.add(P.flash);
  P.flash2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), null); P.flash2.rotation.y = Math.PI / 2; P.flash.add(P.flash2);
  return P;
}

export function grenadeMesh() {
  const M = mats(), g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.033, 12, 8), M.olive); b.scale.y = 1.2; b.castShadow = true; g.add(b);
  for (const y of [-0.012, 0.012]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.003, 4, 12), M.olive); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.022, 8), M.steel); top.position.y = 0.046; g.add(top);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.05, 0.004), M.worn); lever.position.set(0, 0.022, 0.03); lever.rotation.x = 0.35; g.add(lever);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 4), M.red); led.position.y = 0.06; led.visible = false; g.add(led); g.userData.led = led;
  return g;
}

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
let flashMat = null;

export class Weapon {
  constructor(type, fx, audio) {
    this.type = type; this.def = DEFS[type]; this.fx = fx; this.audio = audio;
    Object.assign(this, buildModel(type));
    if (!flashMat) flashMat = new THREE.MeshBasicMaterial({ map: fx.flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    this.flash.material = flashMat; this.flash2.material = flashMat;
    // rear ammo counter
    const [f, up, w, h] = this.counterAt;
    this.cv = document.createElement('canvas'); this.cv.width = 64; this.cv.height = 32;
    this.ctex = new THREE.CanvasTexture(this.cv); this.ctex.colorSpace = THREE.SRGBColorSpace;
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: this.ctex, fog: false }));
    cm.position.set(0, up, -f + 0.0005); this.model.add(cm);
    // aim line used for two-handed alignment (grip origin -> foregrip), in group space
    if (this.fore) this.foreLocal = this.fore.position.clone().add(this.model.position);
    this.state = 'holster'; this.hand = -1; this.support = -1;
    this.rp = 0; this.ryaw = 0; this.rb = 0; this.vp = 0; this.vy = 0; this.vb = 0;
    this.slidePos = 0; this.pull = 0; this.kickT = 0; this.flashT = 0; this.cool = 0;
    this.pumpBack = false; this.spent = false; this.reloadT = 0;
    this.refill();
  }
  refill() {
    this.mag = this.def.cap; this.magIn = true; this.chambered = true; this.locked = false;
    this.reserve = this.def.reserve; this.spent = false; this.pumpBack = false; this.reloadT = 0;
    this.setMagVisible(true);
    this.drawCounter();
  }
  setMagVisible(v) { if (this.magwell) this.magwell.visible = v; }
  get rounds() { return (this.chambered ? 1 : 0) + (this.magIn ? this.mag : 0); }
  get needsRack() { return !this.chambered && this.magIn && this.mag > 0; }

  drawCounter() {
    const x = this.cv.getContext('2d'), n = this.rounds, low = n <= Math.ceil(this.def.cap * 0.25);
    x.fillStyle = '#020405'; x.fillRect(0, 0, 64, 32);
    x.fillStyle = !this.chambered ? '#ff3020' : low ? '#ffb020' : '#30ffb0'; x.font = 'bold 26px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(n).padStart(2, '0'), 32, 17);
    this.ctex.needsUpdate = true;
  }
  worldPoint(obj, out) { return obj.getWorldPosition(out); }
  forward(out) { return out.set(0, 0, -1).applyQuaternion(this.group.quaternion); }

  // position the weapon from the gripping hand (+ optional support hand position)
  place(pos, quat, supportPos) {
    _q.copy(quat);
    if (supportPos && this.foreLocal) {
      _a.copy(this.foreLocal).normalize().applyQuaternion(_q);
      _b.subVectors(supportPos, pos);
      if (_b.lengthSq() > 0.0025) { _b.normalize(); _q2.setFromUnitVectors(_a, _b); _q.premultiply(_q2); }
    }
    _e.set(this.rp, this.ryaw, 0); _q2.setFromEuler(_e); _q.multiply(_q2);
    this.group.quaternion.copy(_q);
    this.group.position.copy(pos).add(_a.set(0, this.rp * 0.12, this.rb).applyQuaternion(_q));
    this.group.updateMatrixWorld(true);
  }

  // returns array of shot directions if a round was fired, else null
  trigger(edge, held) {
    if (this.reloadT > 0) return null;
    if (!(this.def.auto ? held : edge)) return null;
    if (this.cool > 0) return null;
    if (!this.chambered || (this.def.pump && this.slidePos > 0.012)) { if (edge) this.audio.dry(this.group.position); return null; }
    this.chambered = false; this.cool = this.def.interval;
    if (this.def.pump) this.spent = true;
    else {
      this.ejectCasing();
      if (this.magIn && this.mag > 0) { this.mag--; this.chambered = true; } else this.locked = true;
    }
    this.kickT = 0.06; this.flashT = 0.045;
    const two = this.support >= 0 ? 0.45 : 1;
    this.vp += this.def.kick * two * (0.85 + Math.random() * 0.3); this.vy += (Math.random() - 0.5) * this.def.kick * 0.5 * two; this.vb += this.def.back * two;
    this.flash.visible = true; this.flash.rotation.z = Math.random() * 6.28; this.flash.scale.setScalar(this.def.flash * (0.8 + Math.random() * 0.4));
    this.drawCounter();
    const o = this.muzzle.getWorldPosition(new THREE.Vector3()), f = this.forward(new THREE.Vector3());
    const dirs = [];
    _a.set(1, 0, 0).applyQuaternion(this.group.quaternion); _b.set(0, 1, 0).applyQuaternion(this.group.quaternion);
    for (let i = 0; i < this.def.pellets; i++) {
      const r = Math.sqrt(Math.random()) * this.def.spread, a = Math.random() * 6.283;
      dirs.push(f.clone().addScaledVector(_a, Math.cos(a) * r).addScaledVector(_b, Math.sin(a) * r).normalize());
    }
    return { origin: o, dirs, fwd: f };
  }
  ejectCasing() {
    this.eject.getWorldPosition(_a);
    _b.set(1.6 + Math.random(), 1.5 + Math.random(), 0.4 * Math.random()).applyQuaternion(this.group.quaternion);
    this.fx.casing(_a, _b, !!this.def.pump);
  }
  ejectMag() {
    if (!this.magwell || !this.magIn) return false;
    this.magIn = false; this.reserve += this.mag; this.mag = 0; this.setMagVisible(false);
    const m = magazineMesh(this.type); this.magwell.getWorldPosition(_a); this.magwell.getWorldQuaternion(_q);
    this.fx.drop(m, _a, _q, _b.set(0, -0.6, 0));
    this.audio.click(_a, 0.8, 0.6); this.drawCounter(); return true;
  }
  insertMag() {
    if (!this.magwell || this.magIn || this.reserve <= 0) return false;
    this.magIn = true; this.mag = Math.min(this.def.cap, this.reserve); this.reserve -= this.mag; this.setMagVisible(true);
    this.audio.rack(this.group.position); this.drawCounter(); return true;
  }
  rackSlide() {
    if (this.chambered) this.chambered = false; // live round ejected
    if (this.magIn && this.mag > 0) { this.mag--; this.chambered = true; }
    this.locked = false;
    this.audio.rack(this.group.position); this.drawCounter();
  }
  boltRelease() { if (this.locked && this.magIn && this.mag > 0) { this.rackSlide(); return true; } return false; }
  loadShell() {
    if (!this.def.pump || this.mag >= this.def.cap || this.reserve <= 0) return false;
    this.mag++; this.reserve--; this.audio.click(this.group.position, 0.9, 0.6); this.drawCounter(); return true;
  }
  // pump travel 0..rackMax driven by the support hand (or scripted)
  setPump(p) {
    this.pull = Math.max(0, Math.min(this.def.rackMax, p));
    if (!this.pumpBack && this.pull > this.def.rackMax * 0.8) {
      this.pumpBack = true; this.audio.rack(this.group.position);
      if (this.spent) { this.ejectCasing(); this.spent = false; } else if (this.chambered) { this.chambered = false; }
    } else if (this.pumpBack && this.pull < this.def.rackMax * 0.15) {
      this.pumpBack = false; this.audio.click(this.group.position, 0.6, 0.7);
      if (!this.chambered && this.mag > 0) { this.mag--; this.chambered = true; }
      this.drawCounter(); return true;
    }
    return false;
  }
  // rack gesture for pistol / rifle: pull is hand travel along the bore
  setRackPull(p) {
    const max = this.def.rackMax; this.pull = Math.max(0, Math.min(max, p));
    if (!this.pumpBack && this.pull > max * 0.8) { this.pumpBack = true; this.rackSlide(); return true; }
    if (this.pumpBack && this.pull < max * 0.2) this.pumpBack = false;
    return false;
  }
  // desktop / assisted reload: timed animation, returns true when started
  autoReload() {
    if (this.reloadT > 0 || this.reserve <= 0) return false;
    if (this.def.pump) { if (this.mag >= this.def.cap) return false; this.reloadT = 0.5; return true; }
    if (this.mag >= this.def.cap && this.chambered) return false;
    this.ejectMag(); this.reloadT = 1.5; return true;
  }

  update(dt) {
    this.cool -= dt;
    // recoil springs (critically damped-ish)
    const K = 260, D = 22;
    this.vp += (-K * this.rp - D * this.vp) * dt; this.rp += this.vp * dt;
    this.vy += (-K * this.ryaw - D * this.vy) * dt; this.ryaw += this.vy * dt;
    this.vb += (-K * this.rb - D * this.vb) * dt; this.rb += this.vb * dt;
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flash.visible = false; }
    if (this.kickT > 0) this.kickT -= dt;
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.def.pump) {
        if (this.reloadT <= 0) { if (this.mag < this.def.cap && this.reserve > 0) { this.mag++; this.reserve--; this.audio.click(this.group.position, 0.9, 0.6); this.reloadT = 0.45; } if (this.reloadT <= 0 && !this.chambered) this.autoPump = 0.35; this.drawCounter(); }
      } else if (this.reloadT <= 0) { this.insertMag(); if (!this.chambered) this.rackSlide(); }
    }
    if (this.autoPump > 0) { this.autoPump -= dt; const k = 1 - Math.abs(this.autoPump / 0.35 * 2 - 1); this.setPump(this.autoPump > 0 ? k * this.def.rackMax * 1.05 : 0); }
    // slide / pump visual
    const max = this.def.rackMax;
    let target = this.pull;
    if (!this.def.pump) { if (this.locked) target = Math.max(target, max * 0.85); if (this.kickT > 0) target = Math.max(target, max * 0.9); }
    this.slidePos += (target - this.slidePos) * Math.min(1, dt * 45);
    this.slide.position.z = this.slidePos;
    if (this.reflex) this.forward(this.reflex.material.uniforms.uFwd.value);
  }
}
