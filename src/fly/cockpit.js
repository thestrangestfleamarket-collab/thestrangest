// Interactive cockpit, built per era around the pilot's eye point. Every switch, lever, button and screen is live:
// it reads from / writes to the aircraft systems. Static geometry is merged per material to keep draw calls low.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FaceAtlas, LabelAtlas, canvasTex, drawADI, drawRadarCRT, drawThreatCRT, drawMFD, drawUFC, drawHUD, makeMapCanvas, MFD_PAGES, MS2KT, M2FT } from './displays.js';
import { loadPart } from './assets.js';

const D2R = Math.PI / 180, clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
let mapCanvas = null;

// collects transformed geometry per material and merges at the end
class Batch {
  constructor() { this.map = new Map(); }
  add(mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    g.applyMatrix4(_m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(sx, sy, sz))); if (!this.map.has(mat)) this.map.set(mat, []); this.map.get(mat).push(g); return g; }
  addM(mat, geo, matrix) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(matrix); if (!this.map.has(mat)) this.map.set(mat, []); this.map.get(mat).push(g); }
  build(parent, noShadow = new Set()) { for (const [mat, list] of this.map) { const mesh = new THREE.Mesh(mergeGeometries(list), mat); const ns = noShadow.has(mat); mesh.castShadow = !ns; mesh.receiveShadow = !ns && !mat.transparent; if (mat.transparent) mesh.renderOrder = 3; parent.add(mesh); } }
}
const uvRect = (geo, r) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, r[0] + uv.getX(i) * (r[2] - r[0]), r[1] + uv.getY(i) * (r[3] - r[1])); return geo; };
const scaleUV = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
const box = (w, h, d, su = 1, sv = 1) => scaleUV(new THREE.BoxGeometry(w, h, d), su, sv);
const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);

export class Cockpit {
  constructor(game, plane, tex) {
    this.game = game; this.plane = plane; this.tex = tex; const spec = plane.spec, kit = spec.kit; this.kit = kit;
    this.group = new THREE.Group(); this.controls = []; this.needles = []; this.screens = []; this.anim = []; this.lamps = [];
    const m = plane.meta; let eye = spec.eye;
    if (!eye) { if (m.pilot) eye = [0, m.pilot.max[1] - 0.1, m.pilot.max[2] - 0.3]; else if (m.glass) eye = [0, m.glass.max[1] - 0.28, (m.glass.min[2] + m.glass.max[2]) / 2]; else eye = [0, 0.7, 0]; }
    this.eye = new THREE.Vector3(...eye); this.group.position.copy(this.eye);
    this.sys = { battery: true, avionics: true, hud: true, hudBright: 1, panelLight: game.night > 0.3, flood: false, radarRange: 20000, mfd: ['RDR', 'MAP', 'ENG'], ufc: 0, sightDim: 1, caution: false, ejectArmed: false };
    this.t = 0; this.screenTick = 0; this.build(kit, spec);
    if (plane.clipU) { const ww1 = kit === 'ww1'; plane.clipU.uCkC.value.set(this.eye.x, this.eye.y + (ww1 ? -0.6 : -0.2), this.eye.z + (ww1 ? -0.02 : -0.12)); plane.clipU.uCkS.value.set(ww1 ? 0.4 : this.dims.W + 0.22, ww1 ? 0.62 : 1.25, ww1 ? 0.62 : 1.05); }
  }

  mats(kit, spec) {
    const t = this.tex, soviet = spec.nation === 'USSR'; const S = (o) => new THREE.MeshStandardMaterial(o);
    const rep = (tx, r) => { if (!tx) return null; const c = tx.clone(); c.repeat.set(r, r); c.needsUpdate = true; return c; };
    const M = {};
    M.panel = S({ map: rep(t.metal, 2), normalMap: rep(t.metalN, 2), roughnessMap: rep(t.metalR, 2), color: kit === 'ww1' ? 0xffffff : kit === 'ww2' ? 0x2c2d2c : kit === 'jet4' ? 0x45484b : 0x34373a, roughness: 0.75, metalness: 0.35 });
    if (kit === 'ww1') M.panel = S({ map: rep(t.wood, 1.5), normalMap: rep(t.woodN, 1.5), color: 0xb9895a, roughness: 0.55 });
    M.wall = kit === 'ww1' ? S({ map: rep(t.canvas, 3), normalMap: rep(t.canvasN, 3), color: 0xd9c9a0, roughness: 0.95 })
      : S({ map: rep(t.concrete, 1.2), normalMap: rep(t.rustN, 1.5), roughnessMap: rep(t.rustR, 1.5), color: soviet ? 0x3fb0ac : kit === 'ww2' ? (spec.nation === 'US' ? 0x8f9a4c : spec.nation === 'UK' ? 0x86a078 : 0x77837d) : 0x70767a, roughness: 1, metalness: 0.15 });
    M.frame = kit === 'ww1' ? S({ map: rep(t.wood, 1), normalMap: rep(t.woodN, 1), color: 0x9a6f45, roughness: 0.6 }) : S({ map: rep(t.rust, 2), normalMap: rep(t.rustN, 2), color: 0x3a3d3f, roughness: 0.7, metalness: 0.6 });
    M.leather = S({ map: rep(t.leather, 2), normalMap: rep(t.leatherN, 2), color: kit === 'ww1' ? 0xa5754a : 0x4a3a2e, roughness: 0.7 });
    M.bezel = kit === 'ww1' ? S({ color: 0xb8923e, metalness: 1, roughness: 0.32 }) : S({ color: 0x17181a, metalness: 0.7, roughness: 0.45 });
    M.steel = S({ color: 0xa9adb0, metalness: 1, roughness: 0.3 }); M.black = S({ color: 0x0e0e0f, roughness: 0.55, metalness: 0.2 }); M.rubber = S({ color: 0x131313, roughness: 0.9 });
    M.red = S({ color: 0xc41a12, roughness: 0.5 }); M.yellow = S({ color: 0xe6b800, roughness: 0.55 }); M.white = S({ color: 0xe9e9e4, roughness: 0.5 });
    M.glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0, envMapIntensity: 1.3, depthWrite: false });
    M.scrGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.04, roughness: 0.25, envMapIntensity: 0.12, depthWrite: false });
    M.floor = M.panel;
    M.sightGlass = new THREE.MeshPhysicalMaterial({ color: 0xa8c8b8, transparent: true, opacity: 0.07, roughness: 0.03, envMapIntensity: 0.25, depthWrite: false, side: THREE.DoubleSide });
    return M;
  }

  build(kit, spec) {
    const B = new Batch(), M = this.M = this.mats(kit, spec), g = this.group, W0 = kit === 'ww1' ? 0.34 : kit === 'ww2' ? 0.37 : 0.45; const gm = this.plane.meta.glass;
    const W = gm && gm.max[0] - gm.min[0] < 1.3 ? clamp((gm.max[0] - gm.min[0]) / 2 + 0.035, 0.31, W0) : W0, PK = W / W0;
    const floorY = -1.02, sillY = kit === 'ww1' ? -0.3 : kit === 'ww2' ? -0.31 : kit === 'jet4' ? -0.43 : -0.37, frontZ = -0.74, rearZ = 0.34, wallH = sillY - floorY;
    this.dims = { W, floorY, sillY, frontZ };
    const faces = this.faces = new FaceAtlas(kit === 'ww1'); const labels = this.labels = new LabelAtlas();
    const faceMat = this.faceMat = new THREE.MeshStandardMaterial({ map: faces.tex, emissiveMap: faces.tex, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.8 });
    const labelMat = new THREE.MeshStandardMaterial({ map: labels.tex, transparent: true, alphaTest: 0.25, roughness: 0.8, emissiveMap: labels.tex, emissive: kit === 'jet4' ? 0x88ffaa : 0xffe0a0, emissiveIntensity: 0, polygonOffset: true, polygonOffsetFactor: -2 }); this.labelMat = labelMat;
    const noShadow = new Set([M.glass, M.sightGlass, M.scrGlass, labelMat, faceMat]);

    // ---- tub: floor, walls, bulkheads, ribs, stringers
    B.add(kit === 'ww1' ? M.panel : M.floor, scaleUV(new THREE.PlaneGeometry(2 * W, rearZ - frontZ), 1, 1.5), 0, floorY, (frontZ + rearZ) / 2, -Math.PI / 2);
    for (const s of [-1, 1]) { B.add(M.wall, scaleUV(new THREE.PlaneGeometry(rearZ - frontZ, wallH), 1.5, 1), s * W, floorY + wallH / 2, (frontZ + rearZ) / 2, 0, -s * Math.PI / 2);
      for (let z = frontZ + 0.12; z < rearZ; z += 0.2) B.add(M.frame, box(0.018, wallH, 0.03), s * (W - 0.01), floorY + wallH / 2, z);            // ribs
      for (const y of [sillY - 0.02, sillY - 0.22, floorY + 0.12]) B.add(M.frame, box(0.022, 0.022, rearZ - frontZ), s * (W - 0.012), y, (frontZ + rearZ) / 2); // longerons
      if (kit === 'ww1') for (let z = frontZ + 0.12; z < rearZ - 0.2; z += 0.2) { B.add(M.steel, cyl(0.0015, 0.0015, 0.7, 4), s * (W - 0.02), floorY + wallH / 2, z + 0.1, 0.3, 0, 0); B.add(M.steel, cyl(0.0015, 0.0015, 0.7, 4), s * (W - 0.02), floorY + wallH / 2, z + 0.1, -0.3, 0, 0); } // bracing wires
      else { B.add(M.black, cyl(0.008, 0.008, rearZ - frontZ - 0.1, 6), s * (W - 0.03), sillY - 0.12, (frontZ + rearZ) / 2, Math.PI / 2); B.add(M.steel, cyl(0.005, 0.005, rearZ - frontZ - 0.2, 6), s * (W - 0.03), sillY - 0.15, (frontZ + rearZ) / 2, Math.PI / 2); } // cable looms / lines
      B.add(M.leather, box(0.05, 0.035, rearZ - frontZ), s * (W + 0.005), sillY, (frontZ + rearZ) / 2, 0, 0, 0, 1, 1, 1); }                                      // padded sill
    B.add(M.wall, new THREE.PlaneGeometry(2 * W, wallH + 0.5), 0, floorY + wallH / 2 + 0.25, rearZ, 0, Math.PI);        // rear bulkhead
    B.add(M.wall, new THREE.PlaneGeometry(2 * W, wallH), 0, floorY + wallH / 2, frontZ - 0.02);                           // firewall
    // rudder pedals
    for (const s of [-1, 1]) { B.add(M.steel, box(0.1, 0.12, 0.012), s * 0.15, floorY + 0.2, frontZ + 0.14, -0.35); B.add(M.frame, cyl(0.008, 0.008, 0.3, 6), s * 0.15, floorY + 0.1, frontZ + 0.1, 0.2); }

    // ---- seat
    if (kit === 'ww1' || kit === 'ww2') { const sm = kit === 'ww1' ? M.leather : M.wall; B.add(sm, box(0.42, 0.03, 0.4), 0, -0.86, 0.1); B.add(sm, box(0.42, 0.62, 0.03), 0, -0.56, 0.3, 0.12); for (const s of [-1, 1]) B.add(sm, box(0.02, 0.16, 0.4), s * 0.21, -0.79, 0.1);
      B.add(M.leather, box(0.36, 0.05, 0.34), 0, -0.83, 0.09); B.add(M.leather, box(0.3, 0.16, 0.05), 0, -0.1, 0.33); for (const s of [-1, 1]) B.add(M.leather, box(0.045, 0.5, 0.008), s * 0.1, -0.5, 0.275, 0.12); }

    // ---- instrument panel + coaming
    const pw = 2 * W0 - 0.03, ph = kit === 'ww1' ? 0.3 : kit === 'ww2' ? 0.4 : 0.48, pz = -0.66, py = kit === 'ww1' ? -0.3 : kit === 'jet4' ? -0.36 : -0.34, tilt = 0.1;
    this.panel = new THREE.Group(); this.panel.position.set(0, py, pz); this.panel.rotation.x = -tilt; this.panel.scale.setScalar(PK); g.add(this.panel);
    this.panel.updateMatrix(); const PM = this.panel.matrix;
    const P = (mat, geo, u, v, d = 0, rx = 0, ry = 0, rz = 0) => { B.addM(mat, geo, _m.compose(_p.set(u, v, d), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(1, 1, 1)).premultiply(PM)); };
    const toCockpit = (u, v, d = 0) => new THREE.Vector3(u, v, d).applyMatrix4(PM);
    P(M.panel, box(pw, ph, 0.012, 2, 1.2), 0, 0, -0.006);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) P(M.steel, cyl(0.006, 0.006, 0.004, 8), sx * (pw / 2 - 0.02), sy * (ph / 2 - 0.02), 0.002, Math.PI / 2); // panel screws
    if (kit !== 'ww1') { // glareshield hood
      const hood = new THREE.CylinderGeometry(W + 0.01, W + 0.01, 0.34, 20, 1, true, Math.PI - 0.9, 1.8); hood.rotateX(Math.PI / 2); hood.scale(1, 0.34, 1); const hm = M.leather.clone(); hm.side = THREE.DoubleSide; hm.color.set(0x121212); B.add(hm, hood, 0, py + ph / 2 - 0.115, pz - 0.05);
    } else B.add(M.leather, new THREE.TorusGeometry(W, 0.03, 8, 20, Math.PI), 0, sillY, pz + 0.02, 0, 0, 0, 1, 0.5, 1);

    // ---- gauges
    const gauge = (u, v, r, face, value, o = {}) => {
      const rect = faces.dial(face); P(faceMat, uvRect(new THREE.CircleGeometry(r, 28), rect), u, v, 0.004);
      P(M.bezel, new THREE.TorusGeometry(r + 0.004, 0.005, 8, 28), u, v, 0.006); P(M.bezel, cyl(r + 0.008, r + 0.008, 0.008, 28), u, v, -0.001, Math.PI / 2);
      for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; P(M.steel, cyl(0.0028, 0.0028, 0.004, 6), u + Math.cos(a) * (r + 0.011), v + Math.sin(a) * (r + 0.011), 0.004, Math.PI / 2); }
      P(M.glass, new THREE.CircleGeometry(r, 24), u, v, 0.011);
      if (value) { const a0 = (face.a0 ?? -225), sw = face.sweep ?? 270; const mk = (len, wd, col, fn) => { const n = new THREE.Mesh(new THREE.BoxGeometry(len, wd, 0.0015).translate(len * 0.36, 0, 0), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0, roughness: 0.6 })); n.position.set(u, v, 0.0075); this.panel.add(n); this.needles.push({ n, fn, a0, sw, min: face.min, max: face.max, cur: face.min, wrap: face.sweep === 360 }); };
        mk(r * 0.92, r * 0.07, this.kit === 'ww1' ? 0x16130f : 0xf2f2ee, value); if (o.second) mk(r * 0.55, r * 0.11, this.kit === 'ww1' ? 0x16130f : 0xf2f2ee, o.second);
        P(M.black, cyl(r * 0.12, r * 0.12, 0.004, 12), u, v, 0.009, Math.PI / 2); }
      return toCockpit(u, v, 0.01);
    };
    const fm = this.plane.fm, pl = this.plane, kt = () => fm.ias * MS2KT, ft = () => fm.alt * M2FT;
    const live = (u, v, r, size, draw) => { const o = canvasTex(size, size); const mat = new THREE.MeshBasicMaterial({ map: o.t, toneMapped: false }); const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 28), mat); mesh.position.set(u, v, 0.004); this.panel.add(mesh);
      P(M.bezel, new THREE.TorusGeometry(r + 0.004, 0.005, 8, 28), u, v, 0.006); P(M.bezel, cyl(r + 0.008, r + 0.008, 0.008, 28), u, v, -0.001, Math.PI / 2); P(M.glass, new THREE.CircleGeometry(r, 24), u, v, 0.011); this.screens.push({ ...o, mat, draw, rate: 1 }); return o; };
    const adi = (u, v, r) => live(u, v, r, 128, (g2, S) => drawADI(g2, S, Math.asin(clamp(pl.fwd.y, -1, 1)), Math.atan2(-pl.right.y, pl.up.y), false));
    const hdgFace = { min: 0, max: 360, a0: -90, sweep: 360, major: 30, minor: 10, div: 10, fs: 22, label: '', custom: (g2) => { g2.fillStyle = '#ffb300'; g2.beginPath(); g2.moveTo(0, -30); g2.lineTo(-9, 12); g2.lineTo(9, 12); g2.fill(); g2.fillRect(-30, -3, 60, 6); } };
    const hdgVal = () => 360 - ((Math.atan2(pl.fwd.x, -pl.fwd.z) / D2R + 360) % 360);

    // ---- control factories
    const mkLabel = (text, u, v, w = 0.05, h = 0.0125, o) => P(labelMat, uvRect(new THREE.PlaneGeometry(w, h), labels.label(text, o)), u, v, 0.0015);
    const ctl = (name, pos, r, press, extra = {}) => { const c = { name, pos, r, press, ...extra }; this.controls.push(c); return c; };
    // toggle switch on the panel face (u,v). get() -> bool
    const toggle = (name, u, v, get, set, o = {}) => { P(M.steel, cyl(0.007, 0.007, 0.006, 6), u, v, 0.003, Math.PI / 2); const lev = new THREE.Group(); const st = new THREE.Mesh(cyl(0.0022, 0.0034, 0.024, 8).translate(0, 0.012, 0), M.steel); st.rotation.x = Math.PI / 2; lev.add(st); const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0048, 8, 6), o.red ? M.red : M.steel); tip.position.z = 0.025; lev.add(tip);
      lev.position.set(u, v, 0.005); this.panel.add(lev); mkLabel(name, u, v + 0.021, 0.042, 0.0105); if (o.guard) P(M.red, box(0.02, 0.004, 0.02), u, v - 0.014, 0.012);
      this.anim.push(() => { const t = get() ? -0.5 : 0.5; lev.rotation.x += (t - lev.rotation.x) * 0.35; });
      return ctl(name, toCockpit(u, v, 0.02), 0.022, () => { set(!get()); this.game.audio?.ui('switch'); }, { state: get }); };
    const button = (name, u, v, press, lit, o = {}) => { const w = o.w || 0.026, col = o.color || 0x1c1e20; const mat = new THREE.MeshStandardMaterial({ color: col, emissive: o.glow || 0xffb020, emissiveIntensity: 0, roughness: 0.6 }); const b = new THREE.Mesh(box(w, o.h || w * 0.72, 0.008), mat); b.position.set(u, v, 0.004); b.castShadow = true; this.panel.add(b);
      P(labelMat, uvRect(new THREE.PlaneGeometry(w * 0.92, (o.h || w * 0.72) * 0.6), labels.label(name, { fs: 44 })), u, v, 0.0105); P(M.black, box(w + 0.006, (o.h || w * 0.72) + 0.006, 0.004), u, v, 0.001);
      const c = ctl(name, toCockpit(u, v, 0.012), Math.max(0.018, w * 0.6), () => { press(); c.down = 0.12; this.game.audio?.ui('button'); }); this.anim.push((dt) => { c.down = Math.max(0, (c.down || 0) - dt); b.position.z = c.down > 0 ? 0.001 : 0.004; if (lit) mat.emissiveIntensity = lit() ? 1.4 - 1.05 * this.game.night : 0; }); return c; };
    const lamp = (name, u, v, on, color = 0xff3020, w = 0.034) => { const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: color, emissiveIntensity: 0, roughness: 0.4 }); const b = new THREE.Mesh(box(w, 0.016, 0.004), mat); b.position.set(u, v, 0.003); this.panel.add(b); P(labelMat, uvRect(new THREE.PlaneGeometry(w * 0.94, 0.011), labels.label(name, { fs: 40, fg: '#1a1a1a' })), u, v, 0.0056); this.lamps.push({ mat, on, labelDark: true }); };
    // big lever pivoting on a side wall / console. pos = pivot (cockpit space); get() 0..1; travel in radians about X
    const lever = (name, x, y, z, len, get, set, o = {}) => { const piv = new THREE.Group(); piv.position.set(x, y, z); const arm = new THREE.Mesh(box(0.012, len, 0.006).translate(0, len / 2, 0), M.steel); arm.castShadow = true; piv.add(arm);
      const knob = new THREE.Mesh(o.wheel ? cyl(0.022, 0.022, 0.018, 16).rotateZ(Math.PI / 2) : o.ball ? new THREE.SphereGeometry(0.018, 12, 10) : cyl(0.014, 0.014, 0.06, 12).rotateZ(Math.PI / 2), o.mat || M.black); knob.position.y = len; knob.castShadow = true; piv.add(knob); g.add(piv);
      const a0 = o.a0 ?? 0.55, a1 = o.a1 ?? -0.55; const c = ctl(name, new THREE.Vector3(), 0.05, () => { if (o.step) set(o.step(get())); else set(get() > 0.5 ? 0 : 1); this.game.audio?.ui('lever'); }, { lever: true, noTouch: true, get, set, grabAxis: o.grab });
      this.anim.push(() => { const t = a0 + (a1 - a0) * clamp(get(), 0, 1); piv.rotation.x += (t - piv.rotation.x) * 0.3; c.pos.set(0, len, 0).applyEuler(piv.rotation).add(piv.position); }); return c; };

    // ---- engine / flight controls common to all kits
    const sideX = -(W - 0.045);
    B.add(M.frame, box(0.03, 0.05, 0.24), sideX - 0.01, sillY - 0.2, -0.32);                                                   // throttle quadrant body
    this.throttleCtl = lever('THROTTLE', sideX + 0.012, sillY - 0.2, -0.32, 0.11, () => fm.ctl.throttle, v => { this.game.input.setThrottle(v); }, { ball: kit === 'ww1', mat: kit === 'ww1' ? M.bezel : M.black, a0: 0.6, a1: -0.6, grab: true, step: v => v > 0.9 ? 0 : Math.min(1, v + 0.25) });
    if (kit !== 'ww1') { lever('FLAPS', sideX + 0.012, sillY - 0.2, -0.12, 0.08, () => fm.flapsTarget, v => { fm.flapsTarget = v; }, { a0: 0.4, a1: -0.4, step: v => v >= 0.99 ? 0 : v + 0.5 });
      B.add(labelMat, uvRect(new THREE.PlaneGeometry(0.06, 0.015), labels.label('FLAPS')), sideX - 0.022, sillY - 0.1, -0.12, 0, Math.PI / 2); }
    B.add(labelMat, uvRect(new THREE.PlaneGeometry(0.08, 0.018), labels.label('THROTTLE')), sideX - 0.022, sillY - 0.1, -0.32, 0, Math.PI / 2);
    if (!spec.fixedGear) { lever('GEAR', -sideX - 0.012, sillY - 0.22, -0.4, 0.1, () => fm.gearDown ? 1 : 0, v => { if (!fm.onGround) { fm.gearDown = v > 0.5; this.game.audio?.ui('gear'); } }, { wheel: true, mat: M.red, a0: 0.5, a1: -0.5 });
      B.add(labelMat, uvRect(new THREE.PlaneGeometry(0.07, 0.018), labels.label('GEAR  UP / DN', { bg: '#101010', border: true })), -sideX + 0.022, sillY - 0.1, -0.4, 0, -Math.PI / 2); }
    // control column
    const stick = this.stick = new THREE.Group(); stick.position.set(0, floorY + 0.06, -0.3); g.add(stick);
    const col = new THREE.Mesh(cyl(0.011, 0.014, 0.44, 10).translate(0, 0.22, 0), kit === 'ww1' ? M.frame : M.steel); col.castShadow = true; stick.add(col);
    const boot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 12, 1, true).translate(0, 0.05, 0), M.leather); stick.add(boot);
    if (kit === 'ww1') { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 18), M.frame); ring.position.y = 0.48; stick.add(ring); const blip = new THREE.Mesh(cyl(0.008, 0.008, 0.01, 8), M.bezel); blip.position.set(0, 0.525, 0); stick.add(blip); }
    else { const grip = new THREE.Mesh(cyl(0.017, 0.02, 0.13, 12).translate(0, 0.5, 0), M.rubber); grip.castShadow = true; stick.add(grip); const trg = new THREE.Mesh(box(0.008, 0.03, 0.02), M.red); trg.position.set(0, 0.52, -0.024); stick.add(trg); this.gripMesh = grip;
      if (kit !== 'ww2') loadPart('stick').then(s => { if (!s) return; const part = s.clone(); part.traverse(o => { o.userData.shared = true; }); const bb = new THREE.Box3().setFromObject(part), sz = bb.getSize(new THREE.Vector3()); const k = 0.2 / sz.y; part.scale.setScalar(k); part.position.set(-(bb.min.x + bb.max.x) / 2 * k, 0.4 - bb.min.y * k, -(bb.min.z + bb.max.z) / 2 * k); part.rotation.y = Math.PI / 2; part.traverse(o => { if (o.isMesh) { o.castShadow = true; const m = o.material = o.material.clone(); m.transparent = false; m.opacity = 1; m.depthWrite = true; m.alphaTest = 0; if ('transmission' in m) m.transmission = 0; m.side = THREE.FrontSide; m.metalness = Math.min(m.metalness, 0.25); m.roughness = Math.max(m.roughness, 0.7); m.metalnessMap = null; m.roughnessMap = null; m.envMapIntensity = 0.4; if (!m.map) m.color.set(0x161616); } }); stick.add(part); grip.visible = false; trg.visible = false; }); }

    // ---- per-era instrument layout
    const sw = []; // bottom switch row entries
    const arm = () => sw.push(['GUNS', () => pl.masterArm, v => { pl.masterArm = v; }, { red: true, guard: true }]);
    const lights = () => { sw.push(['NAV LT', () => pl.lights.nav, v => { pl.lights.nav = v; }], ['PANEL', () => this.sys.panelLight, v => { this.sys.panelLight = v; }], ['FLOOD', () => this.sys.flood, v => { this.sys.flood = v; }]); if (kit !== 'ww1') sw.push(['LAND LT', () => pl.lights.landing, v => { pl.lights.landing = v; }]); };
    const ign = (n = 'MAGNETO') => sw.push([n, () => fm.engineOn, v => { fm.engineOn = v; if (v) this.game.audio?.ui(spec.engine === 'jet' ? 'jet_start' : 'prop_start'); }]);
    const rpmMax = kit === 'ww1' ? 1400 : 3000;
    if (kit === 'ww1') {
      gauge(-0.19, 0.055, 0.045, { min: 0, max: 160, major: 20, minor: 10, label: 'AIR SPEED', sub: 'M.P.H.', fs: 22 }, () => fm.ias * 2.237);
      gauge(0, 0.06, 0.05, { min: 0, max: 16, major: 2, minor: 1, label: 'REVS', sub: 'x100', arcs: [[12, 14, '#2a7a2a'], [14, 16, '#a81d12']] }, () => fm.rpm * rpmMax / 100);
      gauge(0.19, 0.055, 0.045, { min: 0, max: 20, major: 2, minor: 1, a0: -90, sweep: 360, label: 'HEIGHT', sub: '1000 FT' }, () => (ft() / 1000) % 20);
      gauge(-0.2, -0.065, 0.032, { min: 0, max: 10, major: 2, minor: 1, label: 'OIL', sub: 'LB', fs: 30, a0: -210, sweep: 240 }, () => fm.engineOn ? 2 + fm.rpm * 5 * (1 - fm.damage.engine) : 0);
      gauge(-0.075, -0.07, 0.04, hdgFace, hdgVal);
      gauge(0.075, -0.07, 0.036, { min: 0, max: 12, major: 1, minor: 0.2, a0: -90, sweep: 360, label: '', fs: 24 }, () => (new Date().getHours() % 12) + new Date().getMinutes() / 60, { second: () => new Date().getMinutes() / 5 });
      gauge(0.2, -0.065, 0.032, { min: 0, max: 1, major: 0.5, minor: 0.25, label: 'PETROL', fs: 26, a0: -210, sweep: 240 }, () => fm.fuel);
      // spirit-level inclinometer
      P(M.bezel, box(0.12, 0.022, 0.006), 0, -0.132, 0.003); P(M.white, box(0.11, 0.012, 0.002), 0, -0.132, 0.007); const bub = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), M.black); bub.position.set(0, -0.132, 0.009); this.panel.add(bub); this.anim.push(() => { bub.position.x = clamp(-fm.beta * 0.35 + Math.atan2(-pl.right.y, pl.up.y) * 0.0, -0.045, 0.045); });
      ign('MAG 1'); sw.push(['MAG 2', () => fm.engineOn, v => { fm.engineOn = v; }]); arm(); lights();
      // small windscreen
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), M.sightGlass); ws.position.set(0, -0.06, -0.7); ws.rotation.x = -0.45; g.add(ws); B.add(M.bezel, box(0.35, 0.008, 0.008), 0, -0.135, -0.665);
    } else {
      const six = (cx, cy, r, dx, dy) => { // classic six-pack
        gauge(cx - dx, cy + dy, r, kit === 'ww2' ? { min: 0, max: 500, major: 50, minor: 10, label: 'AIRSPEED', sub: 'MPH', fs: 18, a0: -90, sweep: 340 } : { min: 0, max: spec.supersonic ? 1500 : 700, major: spec.supersonic ? 250 : 100, minor: 50, label: 'AIRSPEED', sub: 'KNOTS', fs: 18, a0: -90, sweep: 340 }, kit === 'ww2' ? () => fm.ias * 2.237 : kt);
        adi(cx, cy + dy, r);
        gauge(cx + dx, cy + dy, r, { min: -6, max: 6, major: 2, minor: 1, a0: -180 - 150, sweep: 300, label: 'CLIMB', sub: '1000 FT/MIN', fs: 22, ly: 50 }, () => clamp(fm.vs * M2FT * 60 / 1000, -6, 6));
        gauge(cx - dx, cy - dy, r, { min: 0, max: 10, major: 1, minor: 0.2, a0: -90, sweep: 360, label: 'ALT', sub: 'FEET x1000', fs: 24 }, () => (ft() / 1000) % 10, { second: () => (ft() / 10000) % 10 });
        gauge(cx, cy - dy, r, hdgFace, hdgVal);
        gauge(cx + dx, cy - dy, r, { min: -1, max: 1, a0: -150, sweep: 120, label: 'TURN & SLIP', ly: 60, custom: (g2, R) => { g2.fillStyle = '#e9e9e2'; g2.fillRect(-4, -R, 8, 26); g2.fillRect(-R * 0.62, -R * 0.78, 8, 22); g2.fillRect(R * 0.62 - 8, -R * 0.78, 8, 22); g2.strokeStyle = '#e9e9e2'; g2.lineWidth = 3; g2.strokeRect(-48, 12, 96, 24); g2.fillRect(-13, 12, 3, 24); g2.fillRect(10, 12, 3, 24); } }, () => clamp(-fm.omega.y * 2.2, -1, 1));
        const ball = new THREE.Mesh(new THREE.SphereGeometry(r * 0.09, 10, 8), M.black); ball.position.set(cx + dx, cy - dy - r * 0.19, 0.008); this.panel.add(ball); this.anim.push(() => { ball.position.x = cx + dx + clamp(-fm.beta * 2.2, -1, 1) * r * 0.3; });
      };
      if (kit === 'ww2' || kit === 'jet1') {
        six(0, 0.03, 0.05, 0.115, 0.06);
        const jet = kit === 'jet1';
        gauge(-0.27, 0.095, 0.042, jet ? { min: 0, max: 110, major: 20, minor: 5, label: 'RPM', sub: '%', arcs: [[100, 110, '#a81d12']] } : { min: 0, max: 40, major: 5, minor: 1, label: 'RPM', sub: 'x100', arcs: [[30, 40, '#a81d12']] }, () => jet ? fm.rpm * 100 : fm.rpm * 30);
        gauge(-0.27, -0.01, 0.042, jet ? { min: 0, max: 10, major: 2, minor: 1, label: 'EXH TEMP', sub: 'C x100', arcs: [[7.5, 10, '#a81d12']] } : { min: 10, max: 70, major: 10, minor: 5, label: 'MANIFOLD', sub: 'IN.HG', fs: 20 }, () => jet ? 2 + fm.rpm * 5 + fm.damage.engine * 3 : 12 + fm.ctl.throttle * 50 * fm.rpm);
        gauge(0.27, 0.095, 0.036, jet ? { min: 0, max: 1.2, major: 0.2, minor: 0.1, label: 'MACH', fs: 22 } : { min: 0, max: 120, major: 20, minor: 10, label: 'OIL', sub: 'TEMP C', fs: 22, arcs: [[95, 120, '#a81d12']] }, () => jet ? fm.mach : 40 + fm.rpm * 42 + fm.damage.engine * 40);
        gauge(0.27, 0.0, 0.036, { min: -4, max: 10, major: 2, minor: 1, label: 'ACCEL', sub: 'G', fs: 22 }, () => clamp(fm.gLoad, -4, 10));
        gauge(0.27, -0.09, 0.034, { min: 0, max: 1, major: 0.5, minor: 0.25, label: 'FUEL', fs: 26, a0: -210, sweep: 240, arcs: [[0, 0.15, '#a81d12']] }, () => fm.fuel);
        gauge(-0.27, -0.105, 0.032, { min: 0, max: 12, major: 1, minor: 0.2, a0: -90, sweep: 360, label: '', fs: 24 }, () => (new Date().getHours() % 12) + new Date().getMinutes() / 60, { second: () => new Date().getMinutes() / 5 });
        ign(jet ? 'ENGINE' : 'MAGNETO'); arm(); lights(); sw.push(['SIGHT', () => this.sys.hud, v => { this.sys.hud = v; }]); if (spec.airbrake) sw.push(['SPD BRK', () => fm.airbrake, v => { fm.airbrake = v; }]);
        lamp('GEAR', -0.12, 0.165, () => fm.gearPos > 0.05 && fm.gearPos < 0.95 || fm.gearDown && !fm.onGround && fm.ias > 120, 0xff3020); lamp('FUEL', -0.04, 0.165, () => fm.fuel < 0.15, 0xffa020); lamp('FIRE', 0.04, 0.165, () => fm.damage.engine > 0.5, 0xff2010); lamp('STALL', 0.12, 0.165, () => fm.aoaStall > 0.3 && !fm.onGround, 0xffa020);
      } else if (kit === 'jet3') {
        six(-0.02, -0.06, 0.047, 0.105, 0.055);
        // radar scope + threat scope (CRTs)
        const crt = (u, v, r, size, draw, rate) => { const o = live(u, v, r, size, (g2, S) => draw(g2, S, pl, this.game, { power: this.sys.battery && this.sys.avionics, range: this.sys.radarRange })); this.screens[this.screens.length - 1].rate = rate; this.screens[this.screens.length - 1].crt = true; };
        crt(-0.02, 0.145, 0.078, 256, drawRadarCRT, 1); crt(0.27, 0.15, 0.05, 128, drawThreatCRT, 3);
        button('RNG', -0.125, 0.19, () => { this.sys.radarRange = this.sys.radarRange >= 40000 ? 10000 : this.sys.radarRange * 2; }, null, { w: 0.03 });
        gauge(-0.29, 0.02, 0.04, { min: 0, max: 110, major: 20, minor: 5, label: 'RPM', sub: '%', arcs: [[100, 110, '#a81d12']] }, () => fm.rpm * 100);
        gauge(-0.29, -0.075, 0.04, { min: 0, max: 10, major: 2, minor: 1, label: 'EGT', sub: 'C x100', arcs: [[8, 10, '#a81d12']] }, () => 2 + fm.rpm * 5 + fm.ab * 1.5 + fm.damage.engine * 2);
        gauge(0.27, 0.035, 0.038, { min: 0, max: 2.4, major: 0.4, minor: 0.1, label: 'MACH', fs: 22 }, () => fm.mach);
        gauge(0.27, -0.055, 0.036, { min: -4, max: 10, major: 2, minor: 1, label: 'ACCEL', sub: 'G', fs: 22 }, () => clamp(fm.gLoad, -4, 10));
        gauge(0.27, -0.14, 0.034, { min: 0, max: 1, major: 0.5, minor: 0.25, label: 'FUEL', fs: 26, a0: -210, sweep: 240, arcs: [[0, 0.15, '#a81d12']] }, () => fm.fuel);
        gauge(0.165, 0.16, 0.034, { min: 0, max: 30, major: 5, minor: 1, label: 'AOA', sub: 'UNITS', fs: 24, arcs: [[18, 30, '#a81d12']] }, () => clamp(fm.alpha / D2R, 0, 30));
        const ann = [['MASTER CAUTION', () => this.sys.caution, 0xffa020], ['ENG FIRE', () => fm.damage.engine > 0.5, 0xff2010], ['FUEL LOW', () => fm.fuel < 0.15, 0xffa020], ['HYD PRESS', () => fm.damage.ctl > 0.3, 0xffa020], ['STALL', () => fm.aoaStall > 0.3 && !fm.onGround, 0xff2010], ['A/B', () => fm.ab > 0.5, 0x30ff60], ['GEAR', () => fm.gearPos > 0.05, 0x30ff60], ['SPD BRK', () => fm.airbrakePos > 0.1, 0x30ff60]];
        ann.forEach((a, i) => lamp(a[0], -0.3 + (i % 2) * 0.05, 0.2 - Math.floor(i / 2) * 0.021, a[1], a[2], 0.046));
        button('RESET', -0.195, 0.14, () => { this.sys.caution = false; }, () => this.sys.caution, { w: 0.03, glow: 0xffa020 }); button('GUN', -0.21, -0.19, () => { pl.weapon = 'gun'; }, () => pl.weapon === 'gun', { w: 0.032, glow: 0x30ff60 }); button('RKT', -0.17, -0.19, () => { if (pl.spec.rockets) pl.weapon = 'rocket'; }, () => pl.weapon === 'rocket', { w: 0.032, glow: 0x30ff60 }); button('A/P', 0.19, -0.19, () => { fm.autopilot = !fm.autopilot; fm.apAlt = fm.alt; }, () => fm.autopilot, { w: 0.032, glow: 0x30ff60 });
        ign('ENGINE'); sw.push(['BATT', () => this.sys.battery, v => { this.sys.battery = v; }], ['RADAR', () => this.sys.avionics, v => { this.sys.avionics = v; }]); arm(); lights(); sw.push(['HUD', () => this.sys.hud, v => { this.sys.hud = v; }], ['SPD BRK', () => fm.airbrake, v => { fm.airbrake = v; }]);
      } else { // glass cockpit
        const mfd = (idx, u, v, s) => { const o = canvasTex(384, 384); const mat = new THREE.MeshBasicMaterial({ map: o.t, toneMapped: false }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mat); scr.position.set(u, v, 0.008); this.panel.add(scr);
          P(M.black, box(s + 0.034, s + 0.05, 0.012), u, v - 0.006, 0.0); P(M.scrGlass, new THREE.PlaneGeometry(s, s), u, v, 0.009);
          this.screens.push({ ...o, mat, rate: 2, phase: idx, draw: (g2, S) => drawMFD(g2, S, this.sys.mfd[idx], pl, this.game, { power: this.sys.battery && this.sys.avionics, range: this.sys.radarRange }, mapCanvas) });
          MFD_PAGES.forEach((pg, i) => { const bu = u - s / 2 + s * (0.1 + 0.2 * i), bv = v - s / 2 - 0.016; const b = new THREE.Mesh(box(0.02, 0.012, 0.006), M.steel); b.position.set(bu, bv, 0.008); this.panel.add(b); const c = ctl(`MFD${idx + 1} ${pg}`, toCockpit(bu, bv, 0.012), 0.014, () => { this.sys.mfd[idx] = pg; c.down = 0.12; this.game.audio?.ui('button'); }); this.anim.push(dt => { c.down = Math.max(0, (c.down || 0) - dt); b.position.z = c.down > 0 ? 0.005 : 0.008; }); });
          for (const sd of [-1, 1]) { const bu = u + sd * (s / 2 + 0.009), bv = v + s * 0.3; const b = new THREE.Mesh(box(0.01, 0.02, 0.006), M.steel); b.position.set(bu, bv, 0.008); this.panel.add(b); ctl(`MFD${idx + 1} RANGE ${sd > 0 ? '+' : '-'}`, toCockpit(bu, bv, 0.012), 0.013, () => { this.sys.radarRange = clamp(this.sys.radarRange * (sd > 0 ? 2 : 0.5), 5000, 80000); this.game.audio?.ui('button'); }); } };
        mfd(0, -0.27, 0.05, 0.17); mfd(1, 0, -0.105, 0.17); mfd(2, 0.27, 0.05, 0.17);
        // up-front control with LCD + keypad
        { const o = canvasTex(256, 80); const mat = new THREE.MeshBasicMaterial({ map: o.t, toneMapped: false }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.045), mat); scr.position.set(0, 0.185, 0.0085); this.panel.add(scr); P(M.black, box(0.2, 0.125, 0.014), 0, 0.14, 0.0); this.screens.push({ ...o, mat, rate: 4, draw: (g2, S, Hh) => drawUFC(g2, 256, 80, this.sys.ufc, pl, this.game, this.sys.battery) });
          ['DATA', 'A/P', 'GUN', 'RKT', 'HUD', 'RNG'].forEach((n, i) => button(n, -0.075 + (i % 3) * 0.075 - 0.0 + 0.0, 0.135 - Math.floor(i / 3) * 0.032, [() => { this.sys.ufc++; }, () => { fm.autopilot = !fm.autopilot; fm.apAlt = fm.alt; }, () => { pl.weapon = 'gun'; }, () => { if (pl.spec.rockets) pl.weapon = 'rocket'; }, () => { this.sys.hud = !this.sys.hud; }, () => { this.sys.radarRange = this.sys.radarRange >= 80000 ? 10000 : this.sys.radarRange * 2; }][i], [null, () => fm.autopilot, () => pl.weapon === 'gun', () => pl.weapon === 'rocket', () => this.sys.hud, null][i], { w: 0.05, h: 0.022, glow: 0x30ff60 })); }
        // standby instruments
        adi(-0.125, -0.05, 0.03); gauge(-0.125, -0.13, 0.03, { min: 0, max: 800, major: 200, minor: 50, label: 'KT', fs: 28, a0: -90, sweep: 340 }, kt);
        gauge(0.125, -0.05, 0.03, { min: 0, max: 10, major: 2, minor: 0.5, a0: -90, sweep: 360, label: 'ALT', fs: 28 }, () => (ft() / 1000) % 10, { second: () => (ft() / 10000) % 10 }); gauge(0.125, -0.13, 0.03, { min: 0, max: 1, major: 0.5, minor: 0.25, label: 'FUEL', fs: 28, a0: -210, sweep: 240, arcs: [[0, 0.15, '#a81d12']] }, () => fm.fuel);
        const ann = [['MASTER CAUTION', () => this.sys.caution, 0xffa020], ['ENG FIRE', () => fm.damage.engine > 0.5, 0xff2010], ['FUEL LOW', () => fm.fuel < 0.15, 0xffa020], ['HYD/FLCS', () => fm.damage.ctl > 0.3, 0xffa020], ['STALL', () => fm.aoaStall > 0.3 && !fm.onGround, 0xff2010], ['AB', () => fm.ab > 0.5, 0x30ff60], ['GEAR', () => fm.gearPos > 0.05, 0x30ff60], ['SPD BRK', () => fm.airbrakePos > 0.1, 0x30ff60]];
        ann.forEach((a, i) => lamp(a[0], (i < 4 ? -1 : 1) * 0.305 + ((i % 4) % 2 ? 0.05 : 0) * (i < 4 ? 1 : -1), 0.215 - Math.floor((i % 4) / 2) * 0.02, a[1], a[2], 0.046));
        button('RESET', -0.14, 0.2, () => { this.sys.caution = false; }, () => this.sys.caution, { w: 0.034, glow: 0xffa020 });
        ign('ENGINE'); sw.push(['BATT', () => this.sys.battery, v => { this.sys.battery = v; }], ['AVIONICS', () => this.sys.avionics, v => { this.sys.avionics = v; }]); arm(); lights(); sw.push(['SPD BRK', () => fm.airbrake, v => { fm.airbrake = v; }]);
      }
      // side consoles for jets
      if (kit !== 'ww2') for (const s of [-1, 1]) { B.add(M.panel, box(0.19, 0.2, 0.75, 1, 2), s * (W - 0.095), sillY - 0.22, -0.2); for (let i = 0; i < 4; i++) { B.add(M.black, box(0.15, 0.004, 0.11), s * (W - 0.095), sillY - 0.118, -0.48 + i * 0.16); for (let k = 0; k < 3; k++) { B.add(M.steel, cyl(0.005, 0.005, 0.014, 8), s * (W - 0.14 + k * 0.045), sillY - 0.11, -0.5 + i * 0.16); B.add(M.white, cyl(0.008, 0.008, 0.008, 10), s * (W - 0.14 + k * 0.045), sillY - 0.112, -0.455 + i * 0.16); } } }
      // ejection handle (jets) — pull twice to eject
      if (kit !== 'ww2') { const tx = canvasTex(64, 64); for (let i = -64; i < 128; i += 22) { tx.g.fillStyle = '#e6b800'; tx.g.fillRect(0, 0, 64, 64); } tx.g.fillStyle = '#e6b800'; tx.g.fillRect(0, 0, 64, 64); tx.g.strokeStyle = '#111'; tx.g.lineWidth = 9; for (let i = -64; i < 128; i += 22) { tx.g.beginPath(); tx.g.moveTo(i, 0); tx.g.lineTo(i + 64, 64); tx.g.stroke(); } tx.t.needsUpdate = true; tx.t.wrapS = tx.t.wrapT = THREE.RepeatWrapping; tx.t.repeat.set(6, 1);
        const h = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.009, 8, 20), new THREE.MeshStandardMaterial({ map: tx.t, roughness: 0.6 })); h.position.set(0, -0.72, -0.02); h.rotation.x = -0.5; h.castShadow = true; g.add(h);
        ctl('EJECT (press twice)', new THREE.Vector3(0, -0.69, -0.03), 0.06, () => { if (this.sys.ejectArmed) this.game.eject(); else { this.sys.ejectArmed = true; this.game.say('EJECTION ARMED — pull again to eject'); setTimeout(() => { this.sys.ejectArmed = false; }, 4000); } this.game.audio?.ui('lever'); }, { noTouch: true }); }
      // windscreen frame + reflector sight / HUD unit
      B.add(M.black, new THREE.TorusGeometry(W + 0.02, 0.011, 6, 28, Math.PI), 0, sillY, -0.8, -0.35, 0, 0, 1, kit === 'ww2' ? 1.5 : 1.35, 1);
      if (kit === 'ww2' || kit === 'jet1') { B.add(M.black, box(0.07, 0.07, 0.1), 0, py + ph / 2 + 0.035, -0.6); B.add(M.steel, cyl(0.022, 0.022, 0.012, 16), 0, py + ph / 2 + 0.075, -0.6); const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.08), M.sightGlass); gl.position.set(0, py + ph / 2 + 0.125, -0.6); gl.rotation.x = -0.75; g.add(gl); for (const s of [-1, 1]) B.add(M.black, box(0.004, 0.09, 0.008), s * 0.037, py + ph / 2 + 0.12, -0.6, -0.75); }
      else loadPart('hud').then(s => { if (!s) return; const part = s.clone(); part.traverse(o => { o.userData.shared = true; }); const bb = new THREE.Box3().setFromObject(part), sz = bb.getSize(new THREE.Vector3()); const k = 0.11 / sz.y; part.scale.setScalar(k); part.position.set(-(bb.min.x + bb.max.x) / 2 * k, py + ph / 2 * PK - 0.012 - bb.min.y * k, -0.63 - (bb.min.z + bb.max.z) / 2 * k); part.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material.transparent || o.material.opacity < 1) { o.material = M.sightGlass; o.castShadow = false; } } }); g.add(part); this.hudUnit = part; });
      // ejection seat (real scanned Martin-Baker seat) for jets
      if (kit !== 'ww2') loadPart('seatmb').then(s => { if (!s) return; const part = s.clone(); part.traverse(o => { o.userData.shared = true; }); const bb = new THREE.Box3().setFromObject(part), sz = bb.getSize(new THREE.Vector3()); const k = 1.25 / sz.y; part.scale.setScalar(k); part.position.set(-(bb.min.x + bb.max.x) / 2 * k, floorY - bb.min.y * k, 0.16 - (bb.min.z + bb.max.z) / 2 * k); part.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); this.seat = part; g.add(part); });
    }
    // bottom switch row
    const n = sw.length, step = Math.min(0.062, (pw - 0.1) / Math.max(n - 1, 1)), v0 = -ph / 2 + (kit === 'ww1' ? 0.028 : 0.03);
    sw.forEach((s, i) => toggle(s[0], (i - (n - 1) / 2) * step, v0, s[1], s[2], s[3] || {}));
    // placards
    mkLabel(spec.name.toUpperCase(), 0, ph / 2 - 0.012, 0.2, 0.014, { fs: 34 });
    B.add(labelMat, uvRect(new THREE.PlaneGeometry(0.14, 0.03), labels.label(kit === 'ww1' ? 'SWITCH OFF BEFORE LANDING' : 'DO NOT EXCEED LIMIT G', { bg: '#7a1410', border: true, fs: 26 })), W - 0.004, sillY - 0.3, -0.1, 0, -Math.PI / 2);
    B.add(labelMat, uvRect(new THREE.PlaneGeometry(0.12, 0.028), labels.label(`${spec.year}  ${spec.nation}`, { bg: '#101010', border: true })), -(W - 0.004), sillY - 0.36, 0.05, 0, Math.PI / 2);

    B.build(g, noShadow);
    this.panel.traverse(o => { if (o.isMesh && o.material !== faceMat) o.receiveShadow = !o.material.transparent && !o.material.isMeshBasicMaterial; });

    // ---- cockpit lighting
    this.flood = new THREE.PointLight(kit === 'jet4' ? 0xbfffd0 : 0xff5a30, 0, 2.2, 1.6); this.flood.position.set(0, -0.05, -0.2); g.add(this.flood);
    // ---- collimated sight / HUD symbology, focused far ahead
    const simple = kit === 'ww2' || kit === 'jet1'; if (kit !== 'ww1') { const fov = simple ? 5 * D2R : 11 * D2R, dist = 60, o = canvasTex(512, 512); const mat = new THREE.MeshBasicMaterial({ map: o.t, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false, fog: false });
      const q = new THREE.Mesh(new THREE.PlaneGeometry(2 * dist * Math.tan(fov), 2 * dist * Math.tan(fov)), mat); q.position.set(0, simple ? 0 : 0, -dist); q.renderOrder = 20; g.add(q); this.hud = { ...o, mat, mesh: q, fov, simple, qi: new THREE.Quaternion(), v: new THREE.Vector3(), v2: new THREE.Vector3() }; }
    if (kit === 'jet4' && !mapCanvas) mapCanvas = makeMapCanvas(this.game.world);
  }

  update(dt, visible) {
    this.t += dt; const pl = this.plane, fm = pl.fm, sys = this.sys, game = this.game; if (!visible) return;
    const power = sys.battery || this.kit === 'ww1' || this.kit === 'ww2';
    // needles
    for (const n of this.needles) { let v = n.fn(); if (!n.wrap) v = clamp(v, n.min, n.max); else { const span = n.max - n.min; let d = v - n.cur; d -= Math.round(d / span) * span; v = n.cur + d; } n.cur += (v - n.cur) * Math.min(1, dt * 9); n.n.rotation.z = -(n.a0 + n.sw * (n.cur - n.min) / (n.max - n.min)) * D2R; }
    for (const a of this.anim) a(dt);
    // stick follows the commanded deflection
    this.stick.rotation.x += (-fm.ctl.pitch * -0.22 - this.stick.rotation.x) * 0.4; this.stick.rotation.z += (-fm.ctl.roll * 0.22 - this.stick.rotation.z) * 0.4;
    // lamps, lighting
    const blink = this.t % 0.5 < 0.25; for (const l of this.lamps) l.mat.emissiveIntensity = power && l.on() ? (blink || l.mat.emissive.g > 0.5 ? 2.2 : 0.6) : 0;
    if (fm.damage.engine > 0.5 || fm.fuel < 0.15 || fm.damage.ctl > 0.3) { if (!this._cau) { sys.caution = true; this._cau = true; } } else this._cau = false;
    const lit = power && sys.panelLight ? 1 : 0; this.faceMat.emissiveIntensity = lit * 0.5; this.labelMat.emissiveIntensity = lit * 0.7; for (const n of this.needles) n.n.material.emissiveIntensity = lit * 0.6;
    this.flood.intensity = power && sys.flood ? 0.5 : 0;
    // screens (staggered refresh)
    this.screenTick++; const dark = 0.55 + 0.45 * (1 - game.night);
    for (const s of this.screens) { if ((this.screenTick + (s.phase || 0)) % (s.rate * 3) === 0) { s.draw(s.g, s.c.width, s.c.height); s.t.needsUpdate = true; } s.mat.color.setScalar(s.crt || s.rate > 1 ? dark : (0.07 + 0.93 * (1 - game.night)) + lit * 0.45 * game.night); }
    if (this.hud) { const h = this.hud, on = sys.hud && power && game.view === 'cockpit'; h.mesh.visible = on; if (on && this.screenTick % 3 === 0) { h.qi.copy(fm.quat).invert(); let warn = null; if (!h.simple) { if (fm.agl < 300 && fm.vs < -fm.agl / 6 && !fm.onGround && fm.gearPos < 0.5) warn = 'PULL UP'; else if (fm.aoaStall > 0.3 && !fm.onGround) warn = 'STALL'; }
        drawHUD(h.g, 512, pl, game, h.simple ? { power: true, simple: true, fov: h.fov, ring: this.kit === 'ww2' ? 0.028 : 0.022, dep: 0.0, lead: this.kit === 'jet1', color: '#ffb84a', lw: 4 } : { power: true, fov: h.fov, qi: h.qi, v: h.v, v2: h.v2, warn }); h.t.needsUpdate = true; h.mat.opacity = 1; } }
  }

  dispose() { const seen = new Set(); this.group.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { if (seen.has(m)) continue; seen.add(m); for (const k of ['map', 'emissiveMap']) { const t = m[k]; if (t && t.isCanvasTexture) t.dispose(); } m.dispose(); } });
    for (const m of Object.values(this.M)) { for (const k of ['map', 'normalMap', 'roughnessMap']) if (m[k]) m[k].dispose(); m.dispose(); } this.faces.tex.dispose(); this.labels.tex.dispose(); this.group.parent?.remove(this.group); }
  // nearest control to a point in cockpit space (VR finger) or along a ray (mouse / laser)
  nearest(pLocal, maxD = 0.05) { let best = null, bd = maxD; for (const c of this.controls) { if (c.noTouch) continue; const d = c.pos.distanceTo(pLocal) - c.r * 0.5; if (d < bd) { bd = d; best = c; } } return best; }
  pick(ray) { // ray in cockpit space
    let best = null, bt = 3; for (const c of this.controls) { _v.copy(c.pos).sub(ray.origin); const t = _v.dot(ray.direction); if (t < 0.1 || t > bt) continue; const d2 = _v.lengthSq() - t * t; const r = c.r + 0.006; if (d2 < r * r) { bt = t; best = c; } } return best; }
}
