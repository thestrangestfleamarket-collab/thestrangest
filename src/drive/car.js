// Visual car: model loading, materials, operable parts, lamps, live screens/cameras, and interaction hotspots.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { SPEC } from './vehicle.js';

const A = '/drive-assets/car/';
let metaP = null; const gltfP = {};
export function loadCarAssets(lod, onProgress) {
  if (!metaP) metaP = fetch(A + 'car.json').then(r => r.json());
  if (!gltfP[lod]) gltfP[lod] = new Promise((res, rej) => { const l = new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder); l.load(A + (lod === 'hi' ? 'car_hi.glb' : 'car_lo.glb'), res, (e) => onProgress && e.total && onProgress(e.loaded / e.total), rej); });
  return Promise.all([metaP, gltfP[lod]]);
}

export const SEATS = [
  { name: 'Driver seat', eye: [-0.335, 1.215, 0.17], door: 'door_FL', exit: [-1.55, 0, 0.0] },
  { name: 'Front passenger seat', eye: [0.335, 1.215, 0.17], door: 'door_FR', exit: [1.55, 0, 0.0] },
  { name: 'Rear left seat', eye: [-0.31, 1.15, 1.02], door: 'door_RL', exit: [-1.55, 0, 0.95] },
  { name: 'Rear right seat', eye: [0.31, 1.15, 1.02], door: 'door_RR', exit: [1.55, 0, 0.95] },
];
const GLASS = { Cristal: [0x1c2a2e, 0.14], CristalTintado: [0x05080a, 0.62], CamerasCristal: [0x000000, 0.25], RearLampGlasses: [0x200404, 0.35], HeadLampGlasses: [0x10141a, 0.22], CenterBigScreen: [0, 0.0] };
const _box = new THREE.Box3(), _ray = new THREE.Ray(), _inv = new THREE.Matrix4(), _hit = new THREE.Vector3(), _v = new THREE.Vector3(), _q = new THREE.Quaternion();

export class Car {
  constructor(meta, gltf, opts = {}) {
    this.meta = meta; this.opts = opts; this.root = new THREE.Group(); this.root.name = 'car';
    const src = gltf.scene.getObjectByName('car') || gltf.scene; this.model = src.clone(true); this.root.add(this.model);
    this.nodes = {}; this.model.traverse(o => { if (meta.groups[o.name]) this.nodes[o.name] = o; });
    this.mats = {}; this.setupMaterials(opts.color);
    this.anim = { doors: [0, 0, 0, 0], windows: [0, 0, 0, 0], tailgate: 0, hood: 0, visors: [0, 0], glovebox: 0, stalkL: 0, stalkR: 0, wiper: 0, press: {} };
    this.target = { doors: [0, 0, 0, 0], windows: [0, 0, 0, 0], tailgate: 0, hood: 0, visors: [0, 0], glovebox: 0 };
    this.lights = { power: false, head: 0, high: false, sigL: false, sigR: false, hazard: false, brake: false, reverse: false, dome: false, wiper: 0 };
    this.blink = false; this.blinkT = 0; this.wiperPhase = 0;
    this.baseQ = {}; for (const k in this.nodes) this.baseQ[k] = this.nodes[k].quaternion.clone(); this.basePos = {}; for (const k in this.nodes) this.basePos[k] = this.nodes[k].position.clone();
    this.buildLamps(); this.buildWipers(); this.buildScreens(); this.buildHotspots();
    if (opts.shadows) this.model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }
  part(name, i = 0) { const p = this.meta.parts[name]; return p ? p[i] : null; }

  setupMaterials(color) {
    const seen = new Map();
    this.model.traverse(o => {
      if (!o.isMesh) return; let m = o.material; const name = m.name;
      if (!seen.has(m)) { m = m.clone(); m.name = name; seen.set(o.material, m);
        const base = name.replace(/_(L|R)$/, '');
        if (GLASS[name] || GLASS[base]) { const [c, op] = GLASS[name] || GLASS[base]; m.transparent = true; m.opacity = op; m.color.set(c); m.depthWrite = false; if ('transmission' in m) m.transmission = 0; m.roughness = 0.03; m.metalness = 0; m.side = THREE.DoubleSide; m.envMapIntensity = 1.4; if (name === 'CenterBigScreen') m.visible = false; }
        if (name === 'CarPaintWhite') { m.color.set(color || 0xf2f1ec); m.roughness = 0.42; m.metalness = 0.0; m.clearcoat = 1; m.clearcoatRoughness = 0.04; m.envMapIntensity = 1.2; }
        if (name === 'CarPaintBlack') { m.color.set(0x050506); m.roughness = 0.12; }
        if (name === 'RetroGlass' || /^SigMirror/.test(name)) { m.color.set(0x8a6a2a); m.roughness = 0.15; }
        if (/^(DRL|Beam|Tail|RearSig|Reverse|SigMirror|Dome)/.test(name)) { m.emissive = new THREE.Color(0, 0, 0); m.emissiveIntensity = 1; if (/^RearSig/.test(name)) { m.transparent = true; m.opacity = 0.5; m.depthWrite = false; m.color.set(0x2a0606); } }
        if (/^Buttons-Detail/.test(name)) { m.emissiveIntensity = 0; this.mats.buttons = m; }
        if (name === 'Matricula') { m.emissive = new THREE.Color(0x222222); m.emissiveMap = m.map; m.emissiveIntensity = 0; }
        this.mats[name] = m; }
      o.material = seen.get(o.material);
    });
  }
  setColor(c) { if (this.mats.CarPaintWhite) this.mats.CarPaintWhite.color.set(c); }

  // ---------------------------------------------------------------- lamps
  buildLamps() {
    const P = (n) => { const p = this.part(n); return p ? new THREE.Vector3((p.min[0] + p.max[0]) / 2, (p.min[1] + p.max[1]) / 2, (p.min[2] + p.max[2]) / 2) : new THREE.Vector3(); };
    const o = this.opts; this.lamp = {};
    const hl = P('LUZ_circuloLuzFarosDelanteros_LedFrontLight_0_L'), hr = P('LUZ_circuloLuzFarosDelanteros_LedFrontLight_0_R');
    if (o.headlights !== false) {
      const cookie = makeBeamCookie(); this.lamp.spots = [];
      const n = o.lightCount === 1 ? [new THREE.Vector3(0, hl.y, hl.z)] : [hl, hr];
      n.forEach((p, i) => { const s = new THREE.SpotLight(0xfff1dc, 0, 140, 0.62, 0.75, 1.25); s.position.copy(p).add(_v.set(0, 0, 0.12)); s.target.position.set(p.x * 0.6, p.y - 0.62, p.z - 10); if (o.spotShadows && i === 0) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.camera.near = 0.6; s.shadow.camera.far = 70; s.shadow.bias = -0.0008; s.shadow.focus = 1; }
        if (o.spotShadows) { s.castShadow = true; s.map = cookie; if (i > 0) { s.shadow.mapSize.set(512, 512); s.shadow.camera.near = 0.6; s.shadow.camera.far = 60; s.shadow.bias = -0.0008; } }
        this.root.add(s, s.target); this.lamp.spots.push(s); });
      const hb = new THREE.SpotLight(0xf4f6ff, 0, 260, 0.30, 0.6, 1.1); hb.position.set(0, hl.y, hl.z + 0.1); hb.target.position.set(0, hl.y - 0.1, hl.z - 20); this.root.add(hb, hb.target); this.lamp.high = hb;
    }
    const tl = P('LUZ_circuloLuzFarosTrasero_LedRearLight_0_L');
    if (o.tailLight !== false) { const t = new THREE.PointLight(0xff1a0a, 0, 9, 1.6); t.position.set(0, tl.y, tl.z + 0.35); this.root.add(t); this.lamp.tail = t;
      const r = new THREE.PointLight(0xffffff, 0, 12, 1.5); r.position.set(0, tl.y, tl.z + 0.4); this.root.add(r); this.lamp.rev = r; }
    if (!o.remote) { const d = new THREE.PointLight(0xfff0dc, 0, 2.6, 1.4); d.position.set(0, 1.4, 0.5); this.root.add(d); this.lamp.dome = d;
      const g = new THREE.PointLight(0x9fc4ff, 0, 1.6, 1.6); g.position.set(0, 1.0, -0.3); this.root.add(g); this.lamp.dash = g; }
    this.headPos = [hl, hr]; this.tailPos = tl;
  }
  buildWipers() {
    const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 }); this.wipers = [];
    const u = new THREE.Vector3(0, 0.46, 0.82).normalize(), x = new THREE.Vector3(1, 0, 0), n = new THREE.Vector3().crossVectors(x, u); const basis = new THREE.Matrix4().makeBasis(x, u, n);
    for (const [px, len, park] of [[-0.42, 0.56, 0.06], [0.1, 0.5, 0.04]]) { const piv = new THREE.Group(); piv.position.set(px, 1.012, -1.085); piv.quaternion.setFromRotationMatrix(basis);
      const arm = new THREE.Group(); const a = new THREE.Mesh(new THREE.BoxGeometry(len, 0.016, 0.012), mat); a.position.set(len / 2, 0, -0.03); const b = new THREE.Mesh(new THREE.BoxGeometry(len * 0.85, 0.008, 0.022), mat); b.position.set(len * 0.56, 0, -0.016); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 10), mat); c.rotation.x = Math.PI / 2; c.position.z = -0.02;
      arm.add(a, b, c); arm.rotation.z = park; piv.add(arm); g.add(piv); this.wipers.push({ arm, park }); }
    this.model.add(g);
  }

  // ---------------------------------------------------------------- screens
  buildScreens() {
    const an = this.meta.anchors; this.screens = {};
    const mk = (a, tex, w, h, flip) => { const g = new THREE.PlaneGeometry(w || a.w, h || a.h); const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); const mesh = new THREE.Mesh(g, m);
      const R = new THREE.Vector3(...a.right), U = new THREE.Vector3(...a.up), N = new THREE.Vector3(...a.normal); mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(R, U, N)); mesh.position.set(...a.center).addScaledVector(N, 0.0015); this.model.add(mesh); return mesh; };
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g: c.getContext('2d'), t }; };
    const bezel = an['PantallaBlack_ScreenTexture_0']; if (bezel) { const b = cv(8, 8); b.g.fillStyle = '#020203'; b.g.fillRect(0, 0, 8, 8); b.t.needsUpdate = true; const m = mk(bezel, b.t); m.position.addScaledVector(new THREE.Vector3(...bezel.normal), -0.001); }
    const ia = an['Plane.040_ScreenTexture_0'], ca = an['Plane.024_ScreenTexture_0'];
    this.screens.inst = cv(512, 256); this.screens.instMesh = mk(ia, this.screens.inst.t);
    this.screens.center = cv(2048, 388); this.screens.centerMesh = mk(ca, this.screens.center.t);
    this._mk = mk; this.cams = []; this.camIndex = 0; this.bootT = 0;
  }
  // live camera-mirror feeds are only created for the car the local player sits in
  ensureCams() {
    if (this.cams.length) return; const an = this.meta.anchors, mk = this._mk;
    // camera mirrors
    const rtOpt = { colorSpace: THREE.SRGBColorSpace, depthBuffer: true }; const s = this.opts.camRes || 320;
    const add = (key, anchor, pos, look, fov, w, h) => { if (!anchor) return; const rt = new THREE.WebGLRenderTarget(w, h, rtOpt); rt.texture.wrapS = THREE.RepeatWrapping; rt.texture.repeat.x = -1; rt.texture.offset.x = 1; const mesh = mk(anchor, rt.texture); mesh.material.color.setScalar(0.9);
      const cam = new THREE.PerspectiveCamera(fov, w / h, 0.15, 400); cam.position.copy(pos); cam.lookAt(look); const holder = new THREE.Group(); holder.add(cam); this.cams.push({ key, rt, cam, holder, mesh }); return holder; };
    const pl = this.part('Camera.003_CameraPlasticMaterial1_0', 0), pr = this.part('Camera.003_CameraPlasticMaterial1_0', 1);
    const cpos = (p) => new THREE.Vector3((p.min[0] + p.max[0]) / 2, (p.min[1] + p.max[1]) / 2, p.max[2] + 0.02);
    for (const [key, p, akey, door] of [['L', pl, 'PantallasRetrovisores_RetroScreens_0_L', 'door_FL'], ['R', pr, 'PantallasRetrovisores_RetroScreens_0_R', 'door_FR']]) { if (!p) continue; const c = cpos(p); const sgn = Math.sign(c.x); c.x += sgn * 0.03; const h = add(key, an[akey], c, new THREE.Vector3(c.x + sgn * 2.2, c.y - 0.9, c.z + 12), 46, s, Math.round(s * 0.64)); if (h) { const dn = this.nodes[door]; h.position.copy(dn.position).multiplyScalar(-1); dn.add(h); } }
    const ma = an['CristalRetrovisorCentral_RetroScreens_0']; const mh = add('M', ma, new THREE.Vector3(0, 1.33, 1.1), new THREE.Vector3(0, 1.12, 14), 30, s, Math.round(s * 0.26)); if (mh) this.model.add(mh);
  }
  renderCams(renderer, scene, n = 1) {
    if (!this.cams || !this.cams.length || !this.lights.power) return;
    const xr = renderer.xr.enabled; renderer.xr.enabled = false; const old = renderer.getRenderTarget();
    for (let k = 0; k < n; k++) { const c = this.cams[this.camIndex++ % this.cams.length]; c.mesh.visible = false; renderer.setRenderTarget(c.rt); renderer.render(scene, c.cam); c.mesh.visible = true; }
    renderer.setRenderTarget(old); renderer.xr.enabled = xr;
  }
  drawInstrument(d) {
    const { c, g, t } = this.screens.inst; const W = c.width, H = c.height; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (!d.power) { t.needsUpdate = true; return; }
    if (this.bootT < 1.6) { g.fillStyle = `rgba(255,255,255,${Math.min(1, this.bootT)})`; g.font = '300 64px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('e', W / 2, 140); g.font = '16px Helvetica, Arial'; g.fillText('Welcome', W / 2, 180); t.needsUpdate = true; return; }
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '600 104px Helvetica, Arial'; g.fillText(String(Math.round(Math.abs(d.mph))), W / 2, 150);
    g.font = '18px Helvetica, Arial'; g.fillStyle = '#9aa'; g.fillText('mph', W / 2, 176); g.fillText(Math.round(Math.abs(d.mph) * 1.609) + ' km/h', W / 2, 200);
    // gear
    g.font = '600 26px Helvetica, Arial'; ['P', 'R', 'N', 'D'].forEach((s, i) => { g.fillStyle = d.gear === s ? '#fff' : '#445'; g.fillText(s, W / 2 - 60 + i * 40, 238); if (d.gear === s) { g.fillRect(W / 2 - 72 + i * 40, 244, 24, 3); } });
    // power / regen arc (left)
    const pw = Math.max(-1, Math.min(1, d.powerKw / 113)); g.lineWidth = 10; g.lineCap = 'round'; g.strokeStyle = '#223'; g.beginPath(); g.arc(96, 130, 70, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
    g.strokeStyle = pw >= 0 ? '#e8f0ff' : '#35d07f'; g.beginPath(); const a0 = Math.PI * 1.2; if (pw >= 0) g.arc(96, 130, 70, a0, a0 + pw * Math.PI * 1.05); else g.arc(96, 130, 70, a0 + pw * Math.PI * 1.4, a0); g.stroke();
    g.fillStyle = '#9aa'; g.font = '14px Helvetica, Arial'; g.fillText(pw >= 0 ? 'POWER' : 'CHARGE', 96, 128); g.fillStyle = '#fff'; g.font = '600 22px Helvetica, Arial'; g.fillText(Math.round(d.powerKw) + ' kW', 96, 154);
    // battery (right)
    g.strokeStyle = '#223'; g.beginPath(); g.arc(W - 96, 130, 70, Math.PI * 0.75, Math.PI * 2.25); g.stroke(); g.strokeStyle = d.soc < 0.15 ? '#ff6a3d' : '#59b8ff'; g.beginPath(); g.arc(W - 96, 130, 70, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * d.soc)); g.stroke();
    g.fillStyle = '#fff'; g.font = '600 26px Helvetica, Arial'; g.fillText(Math.round(d.soc * 100) + '%', W - 96, 132); g.fillStyle = '#9aa'; g.font = '14px Helvetica, Arial'; g.fillText(Math.round(d.soc * 137) + ' mi', W - 96, 156);
    // tell-tales
    const tri = (x, dir, on) => { g.fillStyle = on ? '#2bdc59' : '#16241a'; g.beginPath(); g.moveTo(x + dir * 18, 30); g.lineTo(x, 14); g.lineTo(x, 22); g.lineTo(x - dir * 16, 22); g.lineTo(x - dir * 16, 38); g.lineTo(x, 38); g.lineTo(x, 46); g.closePath(); g.fill(); };
    tri(170, -1, d.blink && (d.sigL || d.hazard)); tri(W - 170, 1, d.blink && (d.sigR || d.hazard));
    g.font = '600 15px Helvetica, Arial'; let x = 214; const tell = (txt, col, on) => { if (!on) return; g.fillStyle = col; g.fillText(txt, x, 36); x += g.measureText(txt).width + 14; };
    g.textAlign = 'left'; tell(d.head === 2 ? 'LOW' : d.head === 1 ? 'PARK' : '', '#2bdc59', d.head > 0); tell('HIGH', '#4aa3ff', d.high); tell('(P)', '#ff3b30', d.epb); tell('DOOR', '#ff3b30', d.doorOpen); tell('BELT', '#ff3b30', !d.belt); tell('ABS', '#ffb020', d.abs); tell('TC', '#ffb020', d.tc); tell('1-PEDAL', '#9fd0ff', d.singlePedal); tell('SPORT', '#ff7a59', d.sport); tell('READY', '#2bdc59', d.gear !== 'P' && Math.abs(d.mph) < 0.5);
    g.textAlign = 'left'; g.fillStyle = '#778'; g.font = '13px Helvetica, Arial'; g.fillText(d.clock, 14, 248); g.textAlign = 'right'; g.fillText((d.odo / 1609.34).toFixed(1) + ' mi', W - 14, 248);
    if (d.limit) { g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillRect(W / 2 + 96, 92, 40, 50); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(W / 2 + 99, 95, 34, 44); g.fillStyle = '#000'; g.font = '8px Arial'; g.fillText('SPEED', W / 2 + 116, 106); g.fillText('LIMIT', W / 2 + 116, 115); g.font = '700 20px Arial'; g.fillText(d.limit, W / 2 + 116, 135); }
    t.needsUpdate = true;
  }
  drawCenter(d, world) {
    const { c, g, t } = this.screens.center; const W = c.width, H = c.height; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (!d.power || this.bootT < 1.6) { t.needsUpdate = true; return; }
    const half = W / 2;
    // ---- left: heading-up map
    g.save(); g.beginPath(); g.rect(0, 0, half - 4, H); g.clip(); g.fillStyle = d.night ? '#10151c' : '#e9e6df'; g.fillRect(0, 0, half, H);
    const scale = d.mapScale || 1.6; const cx = half / 2, cy = H * 0.68; g.translate(cx, cy); g.rotate(d.yaw); g.scale(scale, scale); g.translate(-d.x, -d.z);
    const R = 330 / scale + 80; const seen = new Set(); const ci = Math.floor(d.x / world.RC), cj = Math.floor(d.z / world.RC), n = Math.ceil(R / world.RC);
    const pass = [[], [], []];
    for (let a = -n; a <= n; a += 1) for (let b = -n; b <= n; b += 1) { const l = world.rh.get((ci + a) * 4096 + cj + b); if (!l) continue; for (const s of l) { if (seen.has(s.r)) continue; seen.add(s.r); const k = s.r.c >= 9 ? 2 : s.r.c >= 3 ? 1 : 0; pass[k].push(s.r); } }
    const cols = d.night ? ['#3a4350', '#7d8795', '#d9a441'] : ['#ffffff', '#f6d27a', '#e8924a'];
    g.lineCap = 'round'; g.lineJoin = 'round';
    pass.forEach((list, k) => { g.strokeStyle = cols[k]; for (const r of list) { if (r.c === 0 && r.d === 'driveway') continue; g.lineWidth = Math.max(r.w, k ? 9 : 5) * (k === 0 ? 1 : 1.3); g.beginPath(); const p = r.p; g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); } });
    g.restore();
    g.save(); g.translate(cx, cy); g.fillStyle = '#3aa0ff'; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -20); g.lineTo(13, 14); g.lineTo(0, 7); g.lineTo(-13, 14); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, half - 4, 54); g.fillStyle = '#fff'; g.font = '600 30px Helvetica, Arial'; g.textAlign = 'left'; g.fillText(d.street || 'Off road', 24, 38);
    g.textAlign = 'right'; g.font = '22px Helvetica, Arial'; g.fillStyle = '#9ab'; g.fillText(d.heading, half - 28, 37);
    // ---- right: status tiles
    const x0 = half + 4; g.fillStyle = '#0b0e13'; g.fillRect(x0, 0, half, H);
    g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '300 64px Helvetica, Arial'; g.fillText(d.clock, x0 + 40, 108); g.font = '24px Helvetica, Arial'; g.fillStyle = '#8fa0b3'; g.fillText(d.dateStr, x0 + 44, 158);
    const tile = (x, y, w, h, title, val, sub, on) => { g.fillStyle = on ? '#16324a' : '#141a22'; rr(g, x, y, w, h, 14); g.fill(); g.fillStyle = '#8fa0b3'; g.font = '18px Helvetica, Arial'; g.fillText(title, x + 16, y + 28); g.fillStyle = '#fff'; g.font = '600 32px Helvetica, Arial'; g.fillText(val, x + 16, y + 68); if (sub) { g.fillStyle = '#8fa0b3'; g.font = '16px Helvetica, Arial'; g.fillText(sub, x + 16, y + 92); } };
    const tx = x0 + 330, tw = 215, th = 104;
    tile(tx, 24, tw, th, 'Battery', Math.round(d.soc * 100) + '%', Math.round(d.soc * 137) + ' mi range'); tile(tx + tw + 14, 24, tw, th, 'Trip', (d.trip / 1609.34).toFixed(2) + ' mi', (d.odo / 1609.34).toFixed(1) + ' mi total'); tile(tx + (tw + 14) * 2, 24, tw, th, 'Outside', d.temp, d.weather);
    tile(tx, 24 + th + 14, tw, th, 'Drive mode', d.sport ? 'Sport' : 'Normal', d.singlePedal ? 'Single pedal on' : 'Single pedal off', d.sport); tile(tx + tw + 14, 24 + th + 14, tw, th, 'Lights', ['Off', 'Parking', 'Low beam'][d.head] + (d.high ? ' + High' : ''), d.dome ? 'Cabin light on' : '', d.head > 0); tile(tx + (tw + 14) * 2, 24 + th + 14, tw, th, 'Players', String(d.players), d.room);
    if (d.radio) { g.fillStyle = '#fff'; g.font = '600 20px Helvetica, Arial'; g.fillText(d.radio.call + ' · ' + d.radio.name, x0 + 44, H - 196); g.fillStyle = '#8fa0b3'; g.font = '16px Helvetica, Arial'; wrap(g, d.radio.title + ' (' + d.radio.year + ')', x0 + 44, H - 172, 270, 19); } else { g.fillStyle = '#5d6b7c'; g.font = '16px Helvetica, Arial'; g.fillText('Radio off (turn the knob)', x0 + 44, H - 186); }
    g.fillStyle = '#8fa0b3'; g.font = '18px Helvetica, Arial'; g.fillText(d.tip || '', x0 + 44, H - 110); g.fillStyle = '#5d6b7c'; g.font = '15px Helvetica, Arial'; wrap(g, 'Map © OpenStreetMap · Imagery/lidar USGS & USDA NAIP · Car model "Honda E (Detailed Interior) 2021" by Xlay3D, CC BY 4.0 · Textures: Poly Haven CC0', x0 + 44, H - 70, 270, 19);
    // door status diagram
    const dx = x0 + 330, dy = 268; g.fillStyle = '#141a22'; rr(g, dx, dy, (tw + 14) * 3 - 14, 100, 14); g.fill(); g.fillStyle = '#8fa0b3'; g.font = '18px Helvetica, Arial'; g.fillText('Doors & windows', dx + 16, dy + 28);
    const names = ['FL', 'FR', 'RL', 'RR']; names.forEach((nm, i) => { const open = d.doors[i] > 0.02, win = d.windows[i] > 0.05; g.fillStyle = open ? '#ff5b4d' : win ? '#ffb020' : '#2bdc59'; g.font = '600 22px Helvetica, Arial'; g.fillText(nm + (open ? ' open' : win ? ' window' : ' closed'), dx + 16 + i * 165, dy + 68); });
    g.fillStyle = d.tailgate > 0.02 ? '#ff5b4d' : '#55606e'; g.font = '16px Helvetica, Arial'; g.fillText(d.tailgate > 0.02 ? 'Tailgate open' : 'Tailgate closed', dx + 16, dy + 90); g.fillStyle = d.hood > 0.02 ? '#ff5b4d' : '#55606e'; g.fillText(d.hood > 0.02 ? 'Hood open' : 'Hood closed', dx + 180, dy + 90);
    t.needsUpdate = true;
  }

  // ---------------------------------------------------------------- hotspots
  buildHotspots() {
    this.hot = []; const G = this.meta.groups;
    const add = (id, label, partName, idx, opt = {}) => { const p = typeof partName === 'string' ? this.part(partName, idx) : partName; if (!p) return; const grp = opt.group || p.group; let pv = G[grp].pivot; if (G[grp].parent) pv = [0, 0, 0]; const pad = opt.pad ?? 0.012;
      const min = new THREE.Vector3(p.min[0] - pv[0] - pad, p.min[1] - pv[1] - pad, p.min[2] - pv[2] - pad), max = new THREE.Vector3(p.max[0] - pv[0] + pad, p.max[1] - pv[1] + pad, p.max[2] - pv[2] + pad);
      this.hot.push({ id, label, node: this.nodes[grp], box: new THREE.Box3(min, max), inside: opt.inside, outside: opt.outside, prio: opt.prio || 0, arg: opt.arg }); };
    const sub = (p, axis, i, n) => { const o = { group: p.group, min: p.min.slice(), max: p.max.slice() }; const a = p.min[axis], b = p.max[axis]; o.min[axis] = a + (b - a) * i / n; o.max[axis] = a + (b - a) * (i + 1) / n; return o; };
    const sideIdx = (name) => { const ps = this.meta.parts[name] || []; const l = ps.findIndex(p => (p.min[0] + p.max[0]) < 0), r = ps.findIndex(p => (p.min[0] + p.max[0]) >= 0); return [l, r]; };
    const dn = ['door_FL', 'door_FR', 'door_RL', 'door_RR'], dl = ['Driver door', 'Passenger door', 'Rear left door', 'Rear right door'];
    // exterior + interior door handles
    for (const [name, base, lab] of [['Chasis_Manetas_CarPaintWhite_0', 0, 'handle'], ['ManetaPuertasTraseras_CarPaintBlack_0', 2, 'handle'], ['ManetaPuertaDelantera_BlackPlasticShiny_0', 0, 'inside handle'], ['ManetaPuertaTrasera_BlackPlasticShiny_0', 2, 'inside handle']]) { const [l, r] = sideIdx(name); [l, r].forEach((ix, s) => { if (ix >= 0) add('door', dl[base + s] + ' ' + lab, name, ix, { arg: base + s, pad: 0.03, prio: 2 }); }); }
    // door skins (from outside) open the door too
    for (const [name, base] of [['Chasis_PuertasDelanteras_CarPaintWhite_0', 0], ['Chasis_PuertasTraseras_CarPaintWhite_0', 2]]) { const [l, r] = sideIdx(name); [l, r].forEach((ix, s) => { if (ix >= 0) add('door', dl[base + s], name, ix, { arg: base + s, pad: 0, outside: true }); }); }
    // window switches
    const wl = ['BottonsPuertasDelanterasIzquierda5.001_Buttons-Detail(text)_0', 'BottonsPuertasDelanterasIzquierda5_Buttons-Detail(text)_0', 'BottonsPuertasDelanterasIzquierda3_Buttons-Detail(text)_0', 'BottonsPuertasDelanterasIzquierda4_Buttons-Detail(text)_0'];
    wl.forEach((n, i) => add('window', ['Driver window', 'Passenger window', 'Rear left window', 'Rear right window'][i] + ' switch', n, 0, { arg: i, prio: 3 }));
    add('lock', 'Door lock switch', 'BottonsPuertasDelanterasIzquierda1_Buttons-Detail(text)_0', 0, { prio: 3 }); add('click', 'Mirror adjust', 'BottonsPuertasDelanterasIzquierda2_Buttons-Detail(text)_0', 0, { prio: 3 });
    add('window', 'Passenger window switch', 'Cube.147_Buttons-Detail(text)_0', 0, { arg: 1, prio: 3 }); add('click', 'Door lock', 'Cube.148_Buttons-Detail(text)_0', 0, { prio: 3 });
    { const [l, r] = sideIdx('BottonPuertasTraserasInterior_Buttons-Detail(text)_0'); if (l >= 0) add('window', 'Rear left window switch', 'BottonPuertasTraserasInterior_Buttons-Detail(text)_0', l, { arg: 2, prio: 3 }); if (r >= 0) add('window', 'Rear right window switch', 'BottonPuertasTraserasInterior_Buttons-Detail(text)_0', r, { arg: 3, prio: 3 }); }
    // driving controls
    add('start', 'POWER button', 'BotonStartCar_Buttons-Detail(text)_0', 0, { prio: 14 });
    const gp = this.part('ConsolaCentralZonaBotonesSuperior_Buttons-Detail(text)_0'); if (gp) ['P', 'R', 'N', 'D'].forEach((gname, i) => add('gear', 'Gear: ' + gname, sub(gp, 2, i, 4), 0, { arg: gname, prio: 3, group: 'body', pad: 0.006 }));
    add('epb', 'Electric parking brake', 'BotonConsolaCentral1_Buttons-Detail(text)_0', 0, { prio: 4, pad: 0.003 }); add('mode', 'Drive mode (Normal / Sport)', 'BotonCOnsolaCentral2_Buttons-Detail(text)_0', 0, { prio: 4, pad: 0.003 });
    add('pedalmode', 'Single-pedal control', 'ConsolaCentralZonaBotonesInferior_Buttons-Detail(text)_0', 0, { prio: 2 });
    add('horn', 'Horn', 'CentroVolanteClaxon_SteeringWheel_0', 0, { prio: 2, pad: 0 });
    const st = this.meta.parts['Intermitentes_SteeringWheel_0'] || []; for (const p of st) { const left = p.group === 'stalk_L'; const tip = sub(p, 0, left ? 0 : 2, 3), stem = { group: p.group, min: p.min.slice(), max: p.max.slice() }; if (left) stem.min[0] = tip.max[0]; else stem.max[0] = tip.min[0];
      if (left) { add('lights', 'Headlight switch (turn)', tip, 0, { prio: 3 }); add('signal', 'Turn signal stalk', stem, 0, { prio: 3 }); } else { add('wiper', 'Wiper switch', tip, 0, { prio: 3 }); add('highbeam', 'High beam / flash', stem, 0, { prio: 3 }); } }
    const bd = this.part('BotonesDashvarios_Buttons-Detail(text)_0'); if (bd) { const labels = ['Climate: auto', 'Fan', 'Hazard lights', 'Defrost', 'Rear defrost', 'A/C']; labels.forEach((lb, i) => add(i === 2 ? 'hazard' : 'click', lb, sub(bd, 0, i, labels.length), 0, { prio: 3, group: 'body', pad: 0.002 })); }
    add('volume', 'Radio: next station / off', 'RueditaDashboard_Buttons-Detail(text)_0', 0, { prio: 4 });
    add('dome', 'Cabin light', 'RoofConsoleLightButtons_Buttons-Detail(text)_0', 0, { prio: 3 }); add('click', 'SOS (inactive)', 'RoofConsoleEmergencyButton_Buttons-Detail(text)_0', 0, { prio: 4 });
    add('glovebox', 'Glovebox', 'PlasticGuantera_DashPatternPlastic_0', 0, { prio: 1, pad: 0 });
    { const ps = this.meta.parts['ParasolTecho_RoofCloth_0'] || []; ps.forEach(p => add('visor', 'Sun visor', 'ParasolTecho_RoofCloth_0', ps.indexOf(p), { arg: p.group === 'visor_L' ? 0 : 1, prio: 1 })); }
    add('hood', 'Hood release', 'PalancaAbrirCapo_Plastic45_0', 0, { prio: 3, pad: 0.02 }); add('hood', 'Hood', 'Chassis_Capo_CarPaintWhite_0', 0, { outside: true, pad: 0 });
    add('tailgate', 'Tailgate', 'PlasticoNegroTrasero_CarPaintBlack_0', 0, { outside: true, pad: 0.02 }); add('tailgate', 'Tailgate', 'CristalTrasero_CristalTintado_0', 0, { outside: true, pad: 0 });
    add('belt', 'Seat belt buckle', 'EngancheCinturonesAsientosDelanteros_Buttons-Detail(text)_0', 0, { prio: 3, pad: 0.03 });
    add('mirrordim', 'Rear-view mirror', 'RetrovisorCentral_Plastic45_0', 0, { prio: 1 });
    add('screen', 'Centre display (map zoom)', { group: 'body', min: [-0.18, 1.0, -0.57], max: [0.45, 1.115, -0.55] }, 0, { prio: 1, pad: 0 });
    // seats
    const seatBoxes = [[-0.56, 0.47, -0.37, -0.1, 0.72, 0.2], [0.1, 0.47, -0.37, 0.56, 0.72, 0.2], [-0.58, 0.42, 0.56, -0.02, 0.76, 1.0], [0.02, 0.42, 0.56, 0.58, 0.76, 1.0]];
    seatBoxes.forEach((b, i) => add('seat', 'Sit: ' + SEATS[i].name, { group: 'body', min: b.slice(0, 3), max: b.slice(3) }, 0, { arg: i, pad: 0, prio: -1 }));
  }
  // origin/dir in world space. Returns the best hotspot within maxDist.
  pick(origin, dir, maxDist, inside, skipSeat = -1) {
    let best = null, bd = maxDist;
    for (const h of this.hot) { if (h.outside && inside) continue; if (h.id === 'seat' && h.arg === skipSeat) continue; if (h.inside && !inside) continue; _inv.copy(h.node.matrixWorld).invert(); _ray.origin.copy(origin).applyMatrix4(_inv); _ray.direction.copy(dir).transformDirection(_inv);
      const p = _ray.intersectBox(h.box, _hit); if (!p) continue; let d = p.distanceTo(_ray.origin); if (h.box.containsPoint(_ray.origin)) d = 0.01; d -= h.prio * 0.012; if (d < bd) { bd = d; best = h; } }
    return best;
  }
  press(id) { this.anim.press[id] = 1; }

  // ---------------------------------------------------------------- per-frame
  // v: {wheels:[{comp,spin,steer}], steer(-1..1), throttle, brake}
  update(dt, v) {
    const N = this.nodes, a = this.anim, t = this.target, S = SPEC; const L = this.lights;
    const ease = (cur, tgt, sp) => cur + Math.max(-sp * dt, Math.min(sp * dt, tgt - cur));
    for (let i = 0; i < 4; i++) { a.doors[i] = ease(a.doors[i], t.doors[i], 1.4); a.windows[i] = ease(a.windows[i], t.windows[i], 0.42); }
    a.tailgate = ease(a.tailgate, t.tailgate, 0.8); a.hood = ease(a.hood, t.hood, 0.9); a.glovebox = ease(a.glovebox, t.glovebox, 2.5); for (let i = 0; i < 2; i++) a.visors[i] = ease(a.visors[i], t.visors[i], 2.5);
    const sm = (x) => x * x * (3 - 2 * x);
    const names = ['FL', 'FR', 'RL', 'RR'];
    names.forEach((n, i) => { const d = N['door_' + n]; if (d) d.rotation.y = (i % 2 ? 1 : -1) * sm(a.doors[i]) * (i < 2 ? 1.12 : 1.2); const w = N['window_' + n]; if (w) { const k = sm(a.windows[i]); w.position.copy(this.basePos['window_' + n]).add(_v.set((i % 2 ? -1 : 1) * 0.035 * k, -0.47 * k, 0)); } });
    if (N.tailgate) N.tailgate.rotation.x = -sm(a.tailgate) * 1.32; if (N.hood) N.hood.rotation.x = sm(a.hood) * 0.85; if (N.glovebox) N.glovebox.rotation.x = sm(a.glovebox) * 0.9;
    if (N.visor_L) N.visor_L.rotation.x = -sm(a.visors[0]) * 1.9; if (N.visor_R) N.visor_R.rotation.x = -sm(a.visors[1]) * 1.9;
    if (v) {
      const wn = ['wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR'];
      for (let i = 0; i < 4; i++) { const n = N[wn[i]]; if (!n) continue; const w = v.wheels[i]; n.position.copy(this.basePos[wn[i]]); n.position.y += w.comp; n.rotation.set(0, 0, 0); n.rotation.order = 'YXZ'; n.rotation.y = w.steer || 0; n.rotation.x = -w.spin; }
      if (N.steering) { const ax = _v.fromArray(this.meta.groups.steering.axis); _q.setFromAxisAngle(ax, -v.steer * S.steerRatioTurns * Math.PI); N.steering.quaternion.copy(_q); }
      if (N.pedal_accel) N.pedal_accel.rotation.x = -0.22 * (v.throttle || 0); if (N.pedal_brake) N.pedal_brake.rotation.x = -0.2 * (v.brake || 0);
    }
    const sig = L.hazard ? 0 : L.sigL ? 1 : L.sigR ? -1 : 0; a.stalkL = ease(a.stalkL, sig, 6); if (N.stalk_L) N.stalk_L.rotation.z = a.stalkL * 0.14; if (N.stalk_R) N.stalk_R.rotation.z = -ease(a.stalkR, L.wiper ? 1 : 0, 6) * 0.1;
    for (const k in a.press) { a.press[k] = Math.max(0, a.press[k] - dt * 5); const n = N[k]; if (n) n.position.copy(this.basePos[k]).y -= 0.003 * Math.sin(a.press[k] * Math.PI); }
    // wipers
    if (L.wiper || this.wiperPhase > 0) { const speed = L.wiper === 3 ? 1.5 : L.wiper === 2 ? 1.0 : 0.9; this.wiperWait = (this.wiperWait || 0) - dt; if (this.wiperPhase === 0 && L.wiper === 1 && this.wiperWait > 0) { /* intermittent pause */ } else { const prev = this.wiperPhase; this.wiperPhase += dt * speed; if (this.wiperPhase >= 1) { this.wiperPhase = 0; this.wiperWait = L.wiper === 1 ? 2.5 : 0; this.onWiper && L.wiper && this.onWiper(); } if (prev === 0) this.onWiper && this.onWiper(); } }
    const wp = Math.sin(this.wiperPhase * Math.PI); this.wipers.forEach(w => w.arm.rotation.z = w.park + wp * 1.62);
    // lamps
    this.blinkT += dt; const blinking = L.sigL || L.sigR || L.hazard; if (!blinking) { this.blinkT = 0; this.blink = false; } else { const b = (this.blinkT % 0.74) < 0.37; if (b !== this.blink) { this.blink = b; this.onBlink && this.onBlink(b); } }
    const M = this.mats, on = L.power || L.head > 0; const amber = [1, 0.42, 0.02];
    const setE = (m, r, g, b, k) => { if (m) m.emissive.setRGB(r * k, g * k, b * k); };
    for (const s of ['L', 'R']) { const sg = this.blink && (L.hazard || (s === 'L' ? L.sigL : L.sigR)); const sgActive = L.hazard || (s === 'L' ? L.sigL : L.sigR);
      if (sgActive) setE(M['DRL_' + s], ...amber, sg ? 9 : 0); else setE(M['DRL_' + s], 1, 0.97, 0.92, on ? (L.head === 2 ? 2.2 : 5) : 0);
      setE(M['Beam_' + s], 1, 0.96, 0.9, L.head === 2 ? (L.high ? 26 : 14) : L.high ? 20 : 0);
      setE(M['Tail_' + s], 1, 0.03, 0.01, L.brake ? 9 : L.head > 0 ? 1.6 : on ? 0.35 : 0);
      setE(M['RearSig_' + s], ...amber, sg ? 7 : 0); if (M['RearSig_' + s]) M['RearSig_' + s].opacity = sg ? 0.95 : 0.5;
      setE(M['SigMirror_' + s], ...amber, sg ? 6 : 0); }
    setE(M.Reverse, 1, 1, 1, L.reverse ? 7 : 0); setE(M.Dome, 1, 0.92, 0.8, L.dome ? 4 : 0);
    if (M.buttons) M.buttons.emissiveIntensity = L.power ? (L.head > 0 ? 1.1 : 0.7) : 0; if (M.Matricula) M.Matricula.emissiveIntensity = L.head > 0 ? 0.6 : 0;
    const lp = this.lamp; const k = this.opts.lightScale || 1;
    if (lp.spots) for (const s of lp.spots) s.intensity = L.head === 2 ? 240 * k * (lp.spots.length === 1 ? 1.8 : 1) : 0; if (lp.high) lp.high.intensity = L.high ? 900 * k : 0;
    if (lp.tail) lp.tail.intensity = L.brake ? 3.2 : L.head > 0 ? 0.7 : 0; if (lp.rev) lp.rev.intensity = L.reverse ? 5 : 0;
    if (lp.dome) lp.dome.intensity = ease(lp.dome.intensity, L.dome ? 1.5 : 0, 4); if (lp.dash) lp.dash.intensity = L.power ? 0.22 : 0;
    if (L.power) this.bootT += dt; else this.bootT = 0;
  }
  dispose() { if (this.cams) for (const c of this.cams) c.rt.dispose(); if (this.screens) { this.screens.inst.t.dispose(); this.screens.center.t.dispose(); } }
}

function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(g, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = t; } if (line) g.fillText(line, x, y); }
function makeBeamCookie() { // low-beam pattern: bright below a sharp cut-off, kick-up to the right
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  const img = g.createImageData(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const u = (x - 128) / 128, v = (y - 128) / 128; const cut = -0.02 + (u > 0.05 ? -Math.min(0.12, (u - 0.05) * 0.35) : 0); const below = v - cut; let i = below > 0 ? Math.exp(-below * 2.4) * Math.exp(-u * u * 1.9) : Math.exp(below * 26) * 0.9 * Math.exp(-u * u * 1.9); i += 0.035 * Math.exp(-(u * u + v * v) * 2); const r = Math.hypot(u, v); i *= Math.max(0, Math.min(1, (1 - r) * 6)); const k = (y * 256 + x) * 4; const val = Math.min(255, i * 255); img.data[k] = img.data[k + 1] = img.data[k + 2] = val; img.data[k + 3] = 255; }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
