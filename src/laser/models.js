// LASER TAG's gear, made in code: the plastic armour pack (front and back sensors, back panel), the two-handed gun (side and barrel sensors, extension, strap, coiled cord), the beam
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const TEAM = [
  { name: 'RED', shell: 0xa80c12, glow: 0xff2a1a, beam: 0xff2418 },
  { name: 'GREEN', shell: 0x0b6e27, glow: 0x2bff5a, beam: 0x31ff4f },
];

// hit spheres (sensor) and blocking boxes (plastic, body): what a beam meets first decides
const BEAM_R = 0.015;
export const SENSORS = ['front', 'back', 'gunL', 'gunR', 'barrel'];

// ---- seven-segment LED digits -----------------------------------------------------------------
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', U: 'bcdef', '-': 'g', ' ': '' };
function digit(ctx, ch, x, y, w, h, on, off) {
  const t = w * 0.2, lit = SEG[ch] ?? '', g = t * 0.25, hh = h / 2;
  const bar = (s, sx, sy, sw, sh) => { ctx.fillStyle = lit.includes(s) ? on : off; ctx.beginPath();
    if (sw > sh) { ctx.moveTo(sx + g, sy + sh / 2); ctx.lineTo(sx + sh / 2 + g, sy); ctx.lineTo(sx + sw - sh / 2 - g, sy); ctx.lineTo(sx + sw - g, sy + sh / 2); ctx.lineTo(sx + sw - sh / 2 - g, sy + sh); ctx.lineTo(sx + sh / 2 + g, sy + sh); }
    else { ctx.moveTo(sx + sw / 2, sy + g); ctx.lineTo(sx + sw, sy + sw / 2 + g); ctx.lineTo(sx + sw, sy + sh - sw / 2 - g); ctx.lineTo(sx + sw / 2, sy + sh - g); ctx.lineTo(sx, sy + sh - sw / 2 - g); ctx.lineTo(sx, sy + sw / 2 + g); }
    ctx.closePath(); ctx.fill(); };
  const sk = w * 0.08; ctx.save(); ctx.transform(1, 0, -sk / h, 1, sk, 0);
  bar('a', x, y, w, t); bar('g', x, y + hh - t / 2, w, t); bar('d', x, y + h - t, w, t);
  bar('f', x - t / 2 + t / 2, y + t / 2, t, hh - t / 2); bar('b', x + w - t, y + t / 2, t, hh - t / 2);
  bar('e', x, y + hh, t, hh - t / 2); bar('c', x + w - t, y + hh, t, hh - t / 2);
  ctx.restore();
}
function digits(ctx, str, x, y, w, h, gap, on, off) { for (let i = 0; i < str.length; i++) digit(ctx, str[i], x + i * (w + gap), y, w, h, on, off); }
const two = n => String(Math.max(0, Math.min(99, n | 0))).padStart(2, ' ');

class Screen {
  constructor(w, h, pw, ph) {
    this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false }));
    this.key = '';
  }
}

// ---- materials -----------------------------------------------------------------------------
const plastic = (c, r = 0.42) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
const MAT = {
  charcoal: plastic(0x232528, 0.55), black: plastic(0x0f1011, 0.7), rubber: plastic(0x141516, 0.9),
  grey: plastic(0x4a4e54, 0.5), metal: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.3, metalness: 0.9 }),
  webbing: new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.95 }), bezel: plastic(0x0a0a0b, 0.3),
  hidden: new THREE.MeshBasicMaterial({ visible: false }),
};
const dome = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.82, emissive: color, emissiveIntensity: 0.25 });

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent?.add(m); return m; }
function proxy(parent, geo, kind, x, y, z) { const m = mesh(geo, MAT.hidden, x, y, z, parent); m.userData.kind = kind; return m; }

// ---- the pack: front armour with the big sensor, back armour with the small sensor and the panel; origin mid-chest, +z the way the wearer faces
function plateShape(w, top, bottom, neck) {
  const s = new THREE.Shape(), hw = w / 2;
  s.moveTo(-hw, top - 0.02); s.lineTo(-neck - 0.01, top);
  s.quadraticCurveTo(0, top - 0.085, neck + 0.01, top);
  s.lineTo(hw, top - 0.02); s.quadraticCurveTo(hw + 0.012, top - 0.12, hw - 0.005, bottom + 0.09);
  s.quadraticCurveTo(hw - 0.02, bottom + 0.01, hw - 0.075, bottom); s.lineTo(-hw + 0.075, bottom);
  s.quadraticCurveTo(-hw + 0.02, bottom + 0.01, -hw + 0.005, bottom + 0.09); s.quadraticCurveTo(-hw - 0.012, top - 0.12, -hw, top - 0.02);
  return s;
}
function plate(shape, mat) {
  let g = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 10 });
  g = new TessellateModifier(0.025, 6).modify(g); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 1e-5);   // fine and smooth, so the curve shades evenly
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) - x * x * 1.6); }   // curved round the chest
  g.computeVertexNormals(); return new THREE.Mesh(g, mat);
}
function sensorDome(r, glowMat, parent, x, y, z, faceBack) {
  const g = new THREE.Group(); g.position.set(x, y, z); if (faceBack) g.rotation.y = Math.PI; parent.add(g);
  const base = mesh(new THREE.CylinderGeometry(r * 1.32, r * 1.4, 0.016, 32), MAT.charcoal, 0, 0, 0.004, g); base.rotation.x = Math.PI / 2;
  const ring = mesh(new THREE.TorusGeometry(r * 1.18, r * 0.16, 10, 40), MAT.grey, 0, 0, 0.013, g);
  const d = mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glowMat, 0, 0, 0.012, g); d.rotation.x = Math.PI / 2; d.scale.set(1, 0.55, 1);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new THREE.SphereGeometry(r * 0.09, 8, 6), MAT.metal, Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18, 0.02, g); }
  void ring; return g;
}

function makeVest(team, slot) {
  const T = TEAM[team], group = new THREE.Group(), shell = plastic(T.shell, 0.38), glow = dome(T.glow);
  const front = plate(plateShape(0.33, 0.165, -0.215, 0.065), shell); front.position.z = 0.112; group.add(front);
  const back = plate(plateShape(0.34, 0.175, -0.235, 0.06), shell); back.rotation.y = Math.PI; back.position.z = -0.118; group.add(back);
  for (const sx of [-1, 1]) {   // shoulder bridges joining front and back
    const sh = mesh(new RoundedBoxGeometry(0.085, 0.028, 0.25, 3, 0.012), shell, sx * 0.118, 0.172, 0, group); sh.rotation.z = -sx * 0.32;
    const pad = mesh(new RoundedBoxGeometry(0.07, 0.012, 0.2, 2, 0.005), MAT.rubber, sx * 0.124, 0.19, 0, group); pad.rotation.z = -sx * 0.32;
  }
  // waist strap round the body, side buckles
  const strap = new THREE.EllipseCurve(0, 0, 0.178, 0.132, 0, Math.PI * 2), pts = strap.getPoints(48).map(p => new THREE.Vector3(p.x, 0, p.y));
  const belt = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.011, 4, true), MAT.webbing, 0, -0.17, 0, group); belt.scale.set(1, 2.2, 1);
  for (const sx of [-1, 1]) mesh(new RoundedBoxGeometry(0.014, 0.05, 0.05, 2, 0.004), MAT.black, sx * 0.182, -0.17, 0.0, group);
  // front: the big sensor, the pack number plate, the speaker grille
  sensorDome(0.058, glow, group, 0, 0.035, 0.136);
  const plateN = new Screen(128, 64, 0.075, 0.037); plateN.mesh.position.set(0, -0.06, 0.1395); group.add(plateN.mesh);
  { const c = plateN.ctx; c.fillStyle = '#111'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#e9e9e9'; c.font = 'bold 50px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(slot + 1).padStart(2, '0'), 64, 34); plateN.tex.needsUpdate = true; }
  const grille = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 24), MAT.black, 0, -0.135, 0.137, group); grille.rotation.x = Math.PI / 2;
  for (let i = -2; i <= 2; i++) mesh(new THREE.BoxGeometry(0.044 - Math.abs(i) * 0.008, 0.003, 0.002), MAT.grey, 0, -0.135 + i * 0.009, 0.1405, group);
  // back: the panel (lives, shots, score, the run of good shots), the small sensor
  const bezel = mesh(new RoundedBoxGeometry(0.2, 0.105, 0.016, 2, 0.006), MAT.bezel, 0, 0.075, -0.148, group);
  const panel = new Screen(512, 256, 0.18, 0.09); panel.mesh.rotation.y = Math.PI; panel.mesh.position.set(0, 0.075, -0.1565); group.add(panel.mesh);
  sensorDome(0.04, glow, group, 0, -0.07, -0.141, true);
  void bezel;
  // what a beam can meet
  proxy(group, new THREE.SphereGeometry(0.075 + BEAM_R, 12, 8), 'front', 0, 0.035, 0.165);
  proxy(group, new THREE.SphereGeometry(0.052 + BEAM_R, 12, 8), 'back', 0, -0.07, -0.168);
  proxy(group, new THREE.BoxGeometry(0.36, 0.64, 0.25), 'block', 0, -0.12, 0);
  proxy(group, new THREE.SphereGeometry(0.12, 12, 8), 'block', 0, 0.33, 0.0);
  return { group, glow, panel, neck: new THREE.Vector3(0, 0.23, -0.05), shoulderL: new THREE.Vector3(-0.09, 0.2, 0.06), shoulderR: new THREE.Vector3(0.09, 0.2, 0.06), port: new THREE.Vector3(0.1, -0.12, 0.13) };
}

// ---- the gun: two hands, a top display (lives over shots), side sensors, barrel and extension with the barrel sensor; origin in the hand, firing down -z
function makeGun(team) {
  const T = TEAM[team], group = new THREE.Group(), shell = plastic(T.shell, 0.38), glow = dome(T.glow);
  const body = mesh(new RoundedBoxGeometry(0.072, 0.085, 0.3, 4, 0.02), MAT.charcoal, 0, 0.045, -0.09, group);
  for (const sx of [-1, 1]) mesh(new RoundedBoxGeometry(0.006, 0.06, 0.22, 2, 0.003), shell, sx * 0.037, 0.045, -0.1, group);
  mesh(new RoundedBoxGeometry(0.03, 0.022, 0.17, 2, 0.008), shell, 0, 0.094, -0.11, group);      // top rail
  const grip = mesh(new RoundedBoxGeometry(0.034, 0.115, 0.052, 3, 0.012), MAT.rubber, 0, -0.035, 0.012, group); grip.rotation.x = -0.28;
  const fore = mesh(new RoundedBoxGeometry(0.03, 0.095, 0.044, 3, 0.012), MAT.rubber, 0, -0.03, -0.205, group); fore.rotation.x = 0.12;
  const guard = mesh(new THREE.TorusGeometry(0.026, 0.004, 6, 16, Math.PI), MAT.black, 0, 0.004, -0.04, group); guard.rotation.set(0, Math.PI / 2, Math.PI);
  mesh(new RoundedBoxGeometry(0.008, 0.022, 0.01, 1, 0.003), MAT.grey, 0, -0.002, -0.036, group);   // trigger
  const barrel = mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.1, 20), MAT.charcoal, 0, 0.05, -0.29, group); barrel.rotation.x = Math.PI / 2;
  const ext = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.11, 20), MAT.black, 0, 0.05, -0.395, group); ext.rotation.x = Math.PI / 2;
  for (const z of [-0.36, -0.395, -0.43]) mesh(new THREE.TorusGeometry(0.018, 0.0035, 6, 20), MAT.grey, 0, 0.05, z, group);
  mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 24), shell, 0, 0.05, -0.452, group);
  const lens = mesh(new THREE.CircleGeometry(0.015, 20), glow, 0, 0.05, -0.453, group); lens.rotation.y = Math.PI;
  for (const sx of [-1, 1]) { const d = sensorDome(0.017, glow, group, sx * 0.04, 0.05, -0.13); d.rotation.y = sx * Math.PI / 2; }
  // the display on the back of the top, tilted to the holder's eye
  const bz = mesh(new RoundedBoxGeometry(0.066, 0.05, 0.014, 2, 0.005), MAT.bezel, 0, 0.098, 0.035, group); bz.rotation.x = -1.05;
  const screen = new Screen(160, 120, 0.054, 0.04); screen.mesh.position.set(0, 0.1045, 0.039); screen.mesh.rotation.x = -1.05; group.add(screen.mesh);
  for (const z of [0.055, -0.215]) { const sw = mesh(new THREE.TorusGeometry(0.008, 0.0022, 6, 12), MAT.metal, 0.039, 0.07, z, group); sw.rotation.y = Math.PI / 2; }
  mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.02, 10), MAT.black, 0, 0.012, 0.062, group).rotation.x = Math.PI / 2;   // cord port
  void body;
  proxy(group, new THREE.SphereGeometry(0.03 + BEAM_R, 10, 8), 'gunL', -0.05, 0.05, -0.13);
  proxy(group, new THREE.SphereGeometry(0.03 + BEAM_R, 10, 8), 'gunR', 0.05, 0.05, -0.13);
  proxy(group, new THREE.SphereGeometry(0.028 + BEAM_R, 10, 8), 'barrel', 0, 0.05, -0.47);
  proxy(group, new THREE.BoxGeometry(0.09, 0.22, 0.52), 'block', 0, 0.02, -0.17);
  return { group, glow, screen, muzzle: new THREE.Vector3(0, 0.05, -0.47), swivelF: new THREE.Vector3(0.039, 0.07, -0.215), swivelR: new THREE.Vector3(0.039, 0.07, 0.055), port: new THREE.Vector3(0, 0.012, 0.07) };
}

// ---- one player's kit: pack, gun, neck strap, coiled cord, and how its lights and displays read ----------------
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _f = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
export class Kit {
  constructor(parent, slot) {
    this.parent = parent; this.slot = slot; this.team = slot % 2;
    this.vest = makeVest(this.team, slot); this.gun = makeGun(this.team);
    parent.add(this.vest.group, this.gun.group);
    this.cord = mesh(new THREE.BufferGeometry(), MAT.black); this.strap = mesh(new THREE.BufferGeometry(), MAT.webbing);
    this.cord.frustumCulled = this.strap.frustumCulled = false;
    parent.add(this.cord, this.strap);
    this.hits = []; for (const g of [this.vest.group, this.gun.group]) g.traverse(o => { if (o.userData.kind) this.hits.push(o); });
    this.view = { ph: 'u', l: 0, s: 0, sc: 0, k: 0, su: 0 }; this.flash = 0; this.cableT = 0;
    this.draw();
  }

  set visible(v) { for (const o of [this.vest.group, this.gun.group, this.cord, this.strap]) o.visible = v; }
  get visible() { return this.vest.group.visible; }

  // the pack sits on the chest under the head, turned the way the head faces
  place(head, headQ, gunP, gunQ) {
    _f.set(0, 0, -1).applyQuaternion(headQ); _f.y = 0; if (_f.lengthSq() < 1e-6) _f.set(0, 0, -1); _f.normalize();
    const v = this.vest.group; v.position.copy(head).addScaledVector(_up, -0.31).addScaledVector(_f, -0.02);
    v.rotation.set(0, Math.atan2(_f.x, _f.z), 0);
    this.gun.group.position.copy(gunP); this.gun.group.quaternion.copy(gunQ);
  }

  // muzzle and firing direction in world space
  aim(origin, dir) {
    this.gun.group.updateMatrixWorld(true);
    origin.copy(this.gun.muzzle).applyMatrix4(this.gun.group.matrixWorld);
    dir.set(0, 0, -1).transformDirection(this.gun.group.matrixWorld);
  }

  setView(v) { this.view = { ...this.view, ...v }; this.draw(); }

  draw() {
    const v = this.view, on = '#ff2a20', off = 'rgba(255,42,32,0.07)';
    const gk = v.ph + v.l + '|' + v.s; const s = this.gun.screen;
    if (s.key !== gk) { s.key = gk; const c = s.ctx; c.fillStyle = '#050505'; c.fillRect(0, 0, 160, 120);
      const top = v.ph === 'u' ? two(this.slot + 1) : two(v.l), bot = v.ph === 'u' ? '-U' : v.ph === 'o' ? '--' : two(v.s);
      digits(c, top, 38, 8, 34, 48, 12, on, off); digits(c, bot, 38, 64, 34, 48, 12, on, off); s.tex.needsUpdate = true; }
    const p = this.vest.panel, pk = JSON.stringify(v);
    if (p.key !== pk) { p.key = pk; const c = p.ctx; c.fillStyle = '#070707'; c.fillRect(0, 0, 512, 256);
      c.fillStyle = '#9a9a9a'; c.font = 'bold 22px Arial, sans-serif'; c.textAlign = 'center';
      c.fillText('LIVES', 92, 30); c.fillText('SHOTS', 256, 30); c.fillText('SCORE', 420, 30);
      digits(c, v.ph === 'u' ? '--' : two(v.l), 32, 44, 48, 92, 14, on, off);
      digits(c, v.ph === 'u' || v.ph === 'o' ? '--' : two(v.s), 196, 44, 48, 92, 14, on, off);
      const sc = String(Math.max(0, Math.min(99999, Math.abs(v.sc)))).padStart(5, ' ');
      if (v.sc < 0) { c.fillStyle = on; c.fillRect(326, 88, 14, 6); }
      digits(c, sc, 344, 56, 22, 42, 7, on, off);
      for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(354 + i * 28, 134, 9, 0, Math.PI * 2); c.fillStyle = v.su || i < v.k ? '#ffb020' : 'rgba(255,176,32,0.12)'; c.fill(); }
      const word = { u: 'NOT ENERGIZED', r: 'TAGGED', s: 'DEFENSE SHIELD', w: 'WARNING', o: 'GAME OVER' }[v.ph] || (v.su ? 'SUPERCHARGED' : '');
      c.font = 'bold 34px Arial, sans-serif'; c.fillStyle = v.ph === 'w' || v.ph === 'r' ? '#ff4030' : v.su ? '#ffb020' : '#d8d8d8';
      c.fillText(word, 256, 210); p.tex.needsUpdate = true; }
  }

  // sensor lights: flashing when tagged, steady under the shield, blinking in the warning, racing when supercharged, dim when off
  lights(t) {
    const ph = this.view.ph; let k;
    if (ph === 'u' || ph === 'o') k = 0.08;
    else if (ph === 'r') k = (t * 14 | 0) % 2 ? 2.6 : 0.1;
    else if (ph === 's') k = 1.4;
    else if (ph === 'w') k = (t * 3.5 | 0) % 2 ? 1.8 : 0.15;
    else if (this.view.su) k = 1.2 + Math.sin(t * 30) * 0.9;
    else k = 0.55;
    k += this.flash * 2.5; this.flash = Math.max(0, this.flash - 0.08);
    this.vest.glow.emissiveIntensity = this.gun.glow.emissiveIntensity = k;
  }

  // the neck strap and the coiled cord follow the gun, rebuilt a few times a second
  cables(t) {
    if (t - this.cableT < 0.066) return; this.cableT = t;
    const P = this.parent, vw = this.vest.group, gw = this.gun.group; P.updateMatrixWorld(true);
    const L = (o, v) => P.worldToLocal(o.localToWorld(v.clone()));
    const gp = L(gw, this.gun.port), vp = L(vw, this.vest.port);
    _a.copy(gp).lerp(vp, 0.5); _a.y = Math.min(gp.y, vp.y) - 0.08 - gp.distanceTo(vp) * 0.12;
    const base = new THREE.CatmullRomCurve3([gp, _a.clone(), vp]), pts = [], N = 150, turns = Math.max(14, base.getLength() / 0.016);
    for (let i = 0; i <= N; i++) { const u = i / N, p = base.getPoint(u), tg = base.getTangent(u);
      _b.crossVectors(tg, _up); if (_b.lengthSq() < 1e-4) _b.set(1, 0, 0); _b.normalize(); _c.crossVectors(tg, _b).normalize();
      const a = u * turns * Math.PI * 2, r = u < 0.04 || u > 0.96 ? 0.002 : 0.011;
      pts.push(p.addScaledVector(_b, Math.cos(a) * r).addScaledVector(_c, Math.sin(a) * r)); }
    this.cord.geometry.dispose(); this.cord.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N * 2, 0.0035, 5, false);
    const sf = L(gw, this.gun.swivelF), sr = L(gw, this.gun.swivelR), sl = L(vw, this.vest.shoulderL), sR = L(vw, this.vest.shoulderR), nk = L(vw, this.vest.neck);
    const sag = (a, b) => a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.04, 0));
    this.strap.geometry.dispose(); this.strap.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([sf, sag(sf, sl), sl, nk, sR, sag(sr, sR), sr]), 60, 0.007, 4, false);
  }
}

// ---- the visible laser that goes with each shot ---------------------------------------------------------------
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
export class Beams {
  constructor(scene) { this.scene = scene; this.live = []; }
  shoot(from, to, team) {
    const col = TEAM[team].beam, len = from.distanceTo(to);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    const g = new THREE.Group(); g.add(core, halo); g.position.copy(from).lerp(to, 0.5); g.scale.set(1, len, 1);
    g.quaternion.setFromUnitVectors(_up, _a.copy(to).sub(from).normalize());
    const mk = (p, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.position.copy(p); sp.scale.setScalar(s); return sp; };
    const a = mk(from, 0.07), b = mk(to, 0.09);
    this.scene.add(g, a, b); this.live.push({ objs: [g, a, b], t: 0 });
  }
  update(dt) {
    for (let i = 0; i < this.live.length; i++) { const L = this.live[i]; L.t += dt; const k = Math.max(0, 1 - L.t / 0.14);
      for (const o of L.objs) o.traverse(m => { if (m.material) m.material.opacity = (m.material.color.getHex() === 0xffffff ? 1 : 0.6) * k; });
      if (L.t > 0.14) { for (const o of L.objs) { this.scene.remove(o); o.traverse(m => { m.geometry?.dispose(); m.material?.dispose(); }); } this.live.splice(i--, 1); } }
  }
}
