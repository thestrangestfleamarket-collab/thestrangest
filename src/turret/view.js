// SWIVEL's picture: the sky, your gunship and its ball turret, the guns that follow your aim, the other ships, bolts, blasts, the console and the head-up marks
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TYPES, RULES } from './sim.js';

const BASE = '/turret-assets/', MODEL = { fighter: 'fighter2', ace: 'fighter', bomber: 'frigate2', torp: 'mine', cruiser: 'mother2', pod: 'turret' };
const NAMES = ['cruiser', 'fighter', 'fighter2', 'frigate2', 'mother2', 'turret', 'mine', 'rock1', 'rock2', 'rock3'];
const UP = new THREE.Vector3(0, 1, 0), ZERO = new THREE.Vector3(), SUN = new THREE.Vector3(-0.55, 0.42, 0.72).normalize(), CRUISE = 42;
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3(), _c = new THREE.Color(), FWD = new THREE.Vector3(0, 0, 1);
const V = a => _v.set(a[0], a[1], a[2]);

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const glow = (inner, mid) => canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, inner); r.addColorStop(0.25, mid); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
const mark = (draw) => canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; draw(g); });

// the far sky as one picture: gas clouds along a band and faint stars, all soft
function sky() {
  let seed = 11; const rnd = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  const t = canvasTex(2048, 1024, (g, W, H) => { g.fillStyle = '#020309'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 90; i++) { const x = rnd() * W, y = H * (0.5 + (rnd() - 0.5) * 0.55 + Math.sin(x / W * 6.283) * 0.12), r = 50 + rnd() * 230, hue = [205, 225, 265, 300, 18][Math.floor(rnd() * 5)], a = 0.05 + rnd() * 0.08;
      for (const dx of [-W, 0, W]) { const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, `hsla(${hue},70%,55%,${a})`); gr.addColorStop(1, 'hsla(0,0%,0%,0)'); g.fillStyle = gr; g.fillRect(x + dx - r, y - r, r * 2, r * 2); } }
    for (let i = 0; i < 2600; i++) { const x = rnd() * W, y = Math.acos(rnd() * 2 - 1) / Math.PI * H, r = 0.4 + rnd() * rnd() * 0.7; g.fillStyle = `hsla(${200 + rnd() * 60},40%,${75 + rnd() * 25}%,${0.15 + rnd() * 0.4})`; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); } });
  t.mapping = THREE.EquirectangularReflectionMapping; return t;
}

export class World {
  constructor(scene, camera, renderer) {
    this.scene = scene; this.camera = camera; this.ships = new Map(); this.t = 0; this.msgT = 0; this.hurtT = 0; this.kick = 0; this.flash = [];
    scene.background = sky();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
    scene.add(new THREE.HemisphereLight(0x9fb2ff, 0x2a1c3a, 1.1)); const sun = new THREE.DirectionalLight(0xfff0dd, 2.6); sun.position.copy(SUN); scene.add(sun);
    this.tex = { soft: glow('rgba(255,255,255,1)', 'rgba(255,255,255,0.35)'), fire: glow('rgba(255,250,220,1)', 'rgba(255,140,40,0.55)'), blue: glow('rgba(230,250,255,1)', 'rgba(60,160,255,0.5)') };
    const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow('rgba(255,255,245,1)', 'rgba(255,220,170,0.3)'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sunS.position.copy(SUN).multiplyScalar(6000); sunS.scale.setScalar(2600); scene.add(sunS);
    this.stars(); this.cockpit(); this.marks(); this.pools(); this.dust();
  }

  // the near stars: soft points, the same size however far you look
  stars() {
    let seed = 3; const rnd = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; }, N = 1400, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const z = rnd() * 2 - 1, a = rnd() * 6.283, r = Math.sqrt(1 - z * z), b = 0.25 + rnd() * rnd() * 0.75, w = rnd(); pos.set([Math.cos(a) * r * 7000, z * 7000, Math.sin(a) * r * 7000], i * 3); col.set([b * (0.8 + w * 0.2), b * 0.9, b * (1 - w * 0.25)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ map: this.tex.soft, size: 3.5, sizeAttenuation: false, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); p.frustumCulled = false; this.scene.add(p);
  }

  // ---- models ----
  async load(onStep) {
    const L = new GLTFLoader(), P = this.parts = {}; let n = 0;
    await Promise.all(NAMES.map(async name => { const g = await L.loadAsync(BASE + 'm/' + name + '.glb'), parts = []; g.scene.updateMatrixWorld(true);
      g.scene.traverse(o => { if (o.isMesh) { const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); parts.push({ geo, mat: o.material }); } }); P[name] = parts; onStep && onStep(++n / NAMES.length); }));
    // your ship under the turret: its back found by a ray, the seat set just above it
    const own = this.make('cruiser', 78); own.updateMatrixWorld(true); const hit = new THREE.Raycaster(new THREE.Vector3(0, 60, 0), new THREE.Vector3(0, -1, 0)).intersectObject(own, true)[0];
    own.rotation.y = Math.PI; own.position.y = -3.4 - (hit ? hit.point.y : 7); this.scene.add(own); this.own = own;
    this.rocks();
  }
  make(name, length) { const g = new THREE.Group(); for (const p of this.parts[name]) g.add(new THREE.Mesh(p.geo, p.mat)); g.scale.setScalar(length); return g; }

  // ---- the turret you sit in: a ring, glazing bars and a floor fixed to the ship; the yoke (guns, console) turns with your aim ----
  cockpit() {
    const steel = new THREE.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.8, roughness: 0.45 }), dark = new THREE.MeshStandardMaterial({ color: 0x14171c, metalness: 0.5, roughness: 0.7 });
    const fix = new THREE.Group(); this.scene.add(fix);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.12, 40), dark); floor.position.y = -1.26; fix.add(floor);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 2.1, 2.6, 40), steel); foot.position.y = -2.62; fix.add(foot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.045, 10, 64), steel); ring.rotation.x = Math.PI / 2; ring.position.y = -0.75; fix.add(ring);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(1.31, 1.4, 0.5, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x1b1f26, metalness: 0.6, roughness: 0.6, side: THREE.DoubleSide })); skirt.position.y = -1.0; fix.add(skirt);
    for (let i = 0; i < 3; i++) { const bar = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.016, 6, 48, Math.PI * 4 / 3), steel); bar.rotation.set(0, i * Math.PI / 3 + 0.26, -Math.PI / 6, 'YXZ'); fix.add(bar); }
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), steel); cap.position.y = 1.5; fix.add(cap);
    const yoke = this.yoke = new THREE.Group(); this.scene.add(yoke); this.pods = []; this.muzzles = [];
    for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.16), steel); arm.position.set(sx * 1.52, -0.6, 0); yoke.add(arm);
      const pod = new THREE.Group(); pod.position.set(sx * 1.78, -0.6, 0); yoke.add(pod); this.pods.push(pod);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.9), dark); body.position.z = -0.1; pod.add(body);
      for (const sy of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.9, 10), steel); b.rotation.x = Math.PI / 2; b.position.set(0, sy * 0.11, -1.4); pod.add(b);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 10), dark); tip.rotation.x = Math.PI / 2; tip.position.set(0, sy * 0.11, -2.3); pod.add(tip);
        const mz = new THREE.Object3D(); mz.position.set(0, sy * 0.11, -2.45); pod.add(mz); this.muzzles.push(mz);
        const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.blue, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); f.scale.setScalar(0.9); mz.add(f); this.flash.push(f); } }
    // the console: a slanted screen low in front of your aim
    const c = this.hudC = document.createElement('canvas'); c.width = 512; c.height = 256; this.hudT = new THREE.CanvasTexture(c); this.hudT.colorSpace = THREE.SRGBColorSpace; this.hudKey = '';
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.06), dark), scr = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.28), new THREE.MeshBasicMaterial({ map: this.hudT, toneMapped: false }));
    scr.position.z = 0.032; box.add(scr); box.position.set(0, -0.62, -1.02); box.rotation.x = -0.75; yoke.add(box);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), steel); post.position.set(0, -0.95, -1.08); yoke.add(post);
  }

  // ---- marks: the sight, boxes on ships, where to shoot, arrows to what is out of view, words ----
  marks() {
    const flat = (map, color, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true, toneMapped: false })); s.scale.setScalar(size); s.renderOrder = 20; s.visible = false; this.scene.add(s); return s; };
    const sight = mark(g => { g.beginPath(); g.arc(64, 64, 44, 0, 6.3); g.stroke(); for (const [x, y] of [[64, 6], [64, 122], [6, 64], [122, 64]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(64 + (x - 64) * 0.55, 64 + (y - 64) * 0.55); g.stroke(); } g.beginPath(); g.arc(64, 64, 4, 0, 6.3); g.fill(); });
    const box = mark(g => { for (const [x, y] of [[10, 10], [118, 10], [10, 118], [118, 118]]) { g.beginPath(); g.moveTo(x, y + (y < 64 ? 30 : -30)); g.lineTo(x, y); g.lineTo(x + (x < 64 ? 30 : -30), y); g.stroke(); } });
    const pip = mark(g => { g.lineWidth = 12; g.beginPath(); g.arc(64, 64, 40, 0, 6.3); g.stroke(); });
    this.sight = flat(sight, 0x7dffd8, 0.075); this.boxes = Array.from({ length: 18 }, () => flat(box, 0xff5548, 0.05)); this.pips = Array.from({ length: 18 }, () => flat(pip, 0xffd24a, 0.016));
    const tri = new THREE.Shape(); tri.moveTo(0, 0.035); tri.lineTo(0.022, -0.012); tri.lineTo(0, -0.002); tri.lineTo(-0.022, -0.012); const tg = new THREE.ShapeGeometry(tri);
    this.arrows = Array.from({ length: 6 }, () => { const a = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0xff5548, transparent: true, opacity: 0.9, depthTest: false, toneMapped: false })); a.renderOrder = 30; a.visible = false; this.camera.add(a); return a; });
    const mc = this.msgC = document.createElement('canvas'); mc.width = 1024; mc.height = 320; this.msgTex = new THREE.CanvasTexture(mc); this.msgTex.colorSpace = THREE.SRGBColorSpace;
    this.msg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.47), new THREE.MeshBasicMaterial({ map: this.msgTex, transparent: true, depthTest: false, toneMapped: false })); this.msg.renderOrder = 40; this.msg.position.set(0, 0.32, -2.2); this.msg.visible = false; this.camera.add(this.msg);
    const edge = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 26, 64, 64, 64); r.addColorStop(0, 'rgba(255,40,20,0)'); r.addColorStop(1, 'rgba(255,40,20,1)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
    this.red = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: edge, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })); this.red.position.z = -1; this.red.renderOrder = 35; this.red.visible = false; this.camera.add(this.red);
  }
  say(big, small = '', secs = 3) {
    const g = this.msgC.getContext('2d'); g.clearRect(0, 0, 1024, 320); g.textAlign = 'center'; g.shadowColor = '#000'; g.shadowBlur = 16;
    g.fillStyle = '#eafff8'; g.font = '800 110px system-ui, sans-serif'; g.fillText(big, 512, 150, 1000); g.fillStyle = '#9fd6c8'; g.font = '600 50px system-ui, sans-serif'; g.fillText(small, 512, 240, 1000);
    this.msgTex.needsUpdate = true; this.msgT = secs; this.msg.visible = !!(big || small); this.said = big;
  }
  hud(sim) {
    const key = [Math.round(sim.shield), Math.round(sim.hull), Math.round(sim.heat * 25), sim.hot, sim.msl, sim.score, sim.wave, sim.streak].join(); if (key === this.hudKey) return; this.hudKey = key;
    const g = this.hudC.getContext('2d'); g.fillStyle = '#06100f'; g.fillRect(0, 0, 512, 256); g.font = '700 26px ui-monospace, monospace'; g.textBaseline = 'middle';
    const bar = (y, name, v, col) => { g.fillStyle = '#7fb8aa'; g.textAlign = 'left'; g.fillText(name, 18, y); g.fillStyle = '#12302b'; g.fillRect(140, y - 13, 350, 26); g.fillStyle = col; g.fillRect(140, y - 13, 350 * Math.max(0, Math.min(1, v)), 26); };
    bar(34, 'SHIELD', sim.shield / 100, '#46c8ff'); bar(76, 'HULL', sim.hull / 100, sim.hull < 30 ? '#ff4a3a' : '#5dffa0'); bar(118, sim.hot ? 'TOO HOT' : 'HEAT', sim.heat, sim.hot ? '#ff4a3a' : sim.heat > 0.7 ? '#ffb03a' : '#ffe27a');
    g.fillStyle = '#7fb8aa'; g.fillText('MISSILE', 18, 160); for (let i = 0; i < RULES.missiles; i++) { g.fillStyle = i < sim.msl ? '#ffd24a' : '#12302b'; g.fillRect(140 + i * 59, 147, 50, 26); }
    g.fillStyle = '#eafff8'; g.font = '800 40px ui-monospace, monospace'; g.fillText(String(sim.score).padStart(6, '0'), 18, 218); g.textAlign = 'right'; g.fillStyle = '#7fb8aa'; g.font = '700 28px ui-monospace, monospace';
    g.fillText((sim.streak > 1 ? 'x' + Math.min(5, 1 + (sim.streak - 1) * 0.25).toFixed(2) + '   ' : '') + 'WAVE ' + sim.wave, 494, 220); this.hudT.needsUpdate = true;
  }

  // ---- bolts, sparks, blasts, missiles ----
  pools() {
    const N = this.NB = 260, bm = this.boltM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }), N);
    bm.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bm.setColorAt(0, _c.set(1, 1, 1)); bm.frustumCulled = false; bm.count = 0; this.scene.add(bm);
    const NP = this.NP = 1400, pos = new Float32Array(NP * 3), col = new Float32Array(NP * 3); this.pv = new Float32Array(NP * 3); this.pl = new Float32Array(NP); this.pc = new Float32Array(NP * 4); this.pn = 0;
    const pg = this.pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: this.tex.soft, size: 3.2, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); pts.frustumCulled = false; this.scene.add(pts);
    this.blasts = Array.from({ length: 28 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.fire, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); s.visible = false; s.userData = { t: 0, life: 1, v: new THREE.Vector3() }; this.scene.add(s); return s; }); this.bn = 0;
    this.rings = Array.from({ length: 4 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.955, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffc890, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide, toneMapped: false })); r.visible = false; r.userData = { t: 0 }; this.scene.add(r); return r; }); this.rn = 0;
    this.mslG = new THREE.ConeGeometry(0.5, 3.2, 8).rotateX(Math.PI / 2); this.mslM = new THREE.MeshStandardMaterial({ color: 0xd8dde6, metalness: 0.6, roughness: 0.4, emissive: 0x442200 }); this.msls = new Map();
  }
  spark(p, v, n, speed, life, r, g, b) {
    for (let i = 0; i < n; i++) { const k = this.pn = (this.pn + 1) % this.NP, a = Math.random() * 6.283, z = Math.random() * 2 - 1, s = Math.sqrt(1 - z * z) * speed * (0.3 + Math.random() * 0.7), P = this.pg.attributes.position.array;
      P[k * 3] = p.x; P[k * 3 + 1] = p.y; P[k * 3 + 2] = p.z; this.pv[k * 3] = v.x + Math.cos(a) * s; this.pv[k * 3 + 1] = v.y + z * speed * (0.3 + Math.random() * 0.7); this.pv[k * 3 + 2] = v.z + Math.sin(a) * s;
      this.pl[k] = life * (0.5 + Math.random() * 0.5); this.pc[k * 4] = r; this.pc[k * 4 + 1] = g; this.pc[k * 4 + 2] = b; this.pc[k * 4 + 3] = this.pl[k]; }
  }
  blast(p, v, size, life, map) { const s = this.blasts[this.bn = (this.bn + 1) % this.blasts.length]; s.material.map = map || this.tex.fire; s.position.copy(p); s.userData.v.copy(v); s.userData.t = 0; s.userData.life = life; s.userData.size = size; s.visible = true; }
  ring(p, size) { const r = this.rings[this.rn = (this.rn + 1) % this.rings.length]; r.position.copy(p); r.lookAt(ZERO); r.userData.t = 0; r.userData.size = size; r.visible = true; }

  // what the fight just did, shown
  fx(e) {
    const p = e.p ? new THREE.Vector3(e.p[0], e.p[1], e.p[2]) : null, v = e.v ? new THREE.Vector3(e.v[0], e.v[1], e.v[2]) : new THREE.Vector3();
    if (e.t === 'fire') { this.kick = 1; this.flash[this.shot = ((this.shot | 0) + 1) % 4].material.opacity = 1; }
    else if (e.t === 'hit') this.spark(p, v, 6, 30, 0.4, 1, 0.8, 0.4);
    else if (e.t === 'shield') { this.blast(p, v, 14, 0.35, this.tex.blue); this.hurtT = Math.max(this.hurtT, 0.25); }
    else if (e.t === 'hull') { this.blast(p, v, 12, 0.5); this.spark(p, v, 24, 25, 0.9, 1, 0.6, 0.2); this.hurtT = 0.7; }
    else if (e.t === 'boom') { const big = { cruiser: 190, bomber: 60, pod: 34, fighter: 36, ace: 38, torp: 16, missile: 14 }[e.type] || 20; v.multiplyScalar(0.5);
      this.blast(p, v, big, big > 100 ? 2.6 : 0.9); this.blast(p, v, big * 0.5, 0.4, this.tex.soft); this.spark(p, v, Math.min(160, big * 2.5), big * 1.8, 1.6, 1, 0.75, 0.35); this.spark(p, v, 30, big * 0.7, 2.4, 1, 0.35, 0.1);
      if (big > 40) this.ring(p, big * 2.2); if (e.type === 'cruiser') for (let i = 0; i < 7; i++) this.blast(p.clone().add(_w.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.3, Math.random() - 0.5).multiplyScalar(260)), v, 60 + Math.random() * 60, 1 + Math.random() * 1.5); }
    else if (e.t === 'over') { this.blast(new THREE.Vector3(0, -4, 6), v, 40, 2.5); this.hurtT = 2; }
  }

  rocks() {
    this.rockM = [1, 2, 3].map(i => { const p = this.parts['rock' + i][0], m = new THREE.InstancedMesh(p.geo, p.mat, 14); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; this.scene.add(m); return m; });
    let seed = 5; const rnd = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    this.rockD = Array.from({ length: 42 }, () => { const a = rnd() * 6.283, r = 170 + rnd() * 900; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.6 - 60, z: (rnd() * 2 - 1) * 1500, s: 14 + rnd() * rnd() * 110, ax: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), w: (rnd() - 0.5) * 0.3, a: rnd() * 6 }; });
  }
  dust() {
    const N = 500, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 260; pos[i * 3 + 1] = (Math.random() - 0.5) * 200; pos[i * 3 + 2] = Math.random() * 400; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dustM = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'uniform float uT; varying float vA; void main(){ vec3 p = position; p.z = mod(p.z + uT, 400.0) - 200.0; vec4 mv = modelViewMatrix * vec4(p, 1.0); float d = length(p); vA = smoothstep(200.0, 90.0, d) * smoothstep(3.0, 12.0, d) * 0.55; gl_PointSize = clamp(220.0 / -mv.z, 1.0, 5.0); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying float vA; void main(){ float r = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.75, 0.85, 1.0, vA * smoothstep(0.5, 0.1, r)); }' });
    const pts = new THREE.Points(g, this.dustM); pts.frustumCulled = false; this.scene.add(pts);
  }

  // where the n-th barrel's mouth is, in the world
  muzzle(i, out) { return this.muzzles[i & 3].getWorldPosition(out); }

  // ---- every frame ----
  sync(sim, dt, aim, head) {
    this.t += dt; const play = sim.state === 'play';
    // the yoke swings to the aim, the guns lift to it
    const yaw = Math.atan2(-aim.d.x, -aim.d.z), pitch = Math.asin(Math.max(-1, Math.min(1, aim.d.y)));
    this.yoke.rotation.y = yaw; this.kick = Math.max(0, this.kick - dt * 9); for (const p of this.pods) { p.rotation.x = Math.max(-0.5, pitch); p.position.z = this.kick * 0.05; }
    for (const f of this.flash) f.material.opacity = Math.max(0, f.material.opacity - dt * 14);
    this.sight.visible = sim.state !== 'ready'; this.sight.position.copy(aim.o).addScaledVector(aim.d, 500); this.sight.material.color.setHex(sim.hot ? 0xff4a3a : sim.heat > 0.7 ? 0xffb03a : 0x7dffd8);
    this.hud(sim);

    // ships
    const live = new Set(); let bi = 0; const lock = play && sim.msl > 0 ? sim.lock([aim.o.x, aim.o.y, aim.o.z], [aim.d.x, aim.d.y, aim.d.z]) : null; const threats = [];
    for (const s of sim.ships) { live.add(s.id); let o = this.ships.get(s.id);
      if (!o) { const T = TYPES[s.type]; o = { g: this.make(MODEL[s.type], T.len), d: new THREE.Vector3(s.d[0], s.d[1], s.d[2]), bank: 0 }; this.scene.add(o.g); this.ships.set(s.id, o);
        if (s.type !== 'cruiser' && s.type !== 'pod') { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: s.type === 'torp' ? this.tex.fire : this.tex.blue, color: s.type === 'torp' ? 0xff8855 : 0xff9a70, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); e.scale.setScalar(s.type === 'torp' ? 2.2 : 0.42); e.position.z = s.type === 'torp' ? 0 : -0.5; o.g.add(e); } }
      const nd = V(s.d), yr = (o.d.z * nd.x - o.d.x * nd.z) / Math.max(dt, 1e-3); o.bank += (Math.max(-1.1, Math.min(1.1, -yr * 0.55)) - o.bank) * Math.min(1, dt * 4); o.d.copy(nd);
      o.g.position.set(s.p[0], s.p[1], s.p[2]); _m.lookAt(o.d, ZERO, UP); o.g.quaternion.setFromRotationMatrix(_m).multiply(_q2.setFromAxisAngle(FWD, o.bank)); if (s.type === 'torp') o.g.rotateZ(this.t * 3);
      const dist = o.g.position.length();
      if (s.type !== 'cruiser' && dist < 1300 && bi < this.boxes.length) { const b = this.boxes[bi], pp = this.pips[bi++]; b.visible = true; b.position.copy(o.g.position); b.material.color.setHex(lock === s ? 0xffd24a : s.type === 'torp' ? 0xff9a3a : 0xff5548); b.scale.setScalar(lock === s ? 0.062 : 0.05);
        let tt = dist / RULES.bolt; _w.set(s.p[0] + s.v[0] * tt, s.p[1] + s.v[1] * tt, s.p[2] + s.v[2] * tt); tt = _w.length() / RULES.bolt; pp.position.set(s.p[0] + s.v[0] * tt, s.p[1] + s.v[1] * tt, s.p[2] + s.v[2] * tt); pp.visible = play && dist < RULES.bolt * RULES.boltLife && s.type !== 'pod'; }
      if (s.type !== 'pod') threats.push({ p: o.g.position, d: dist - (s.type === 'torp' ? 400 : 0), torp: s.type === 'torp' }); }
    for (; bi < this.boxes.length; bi++) this.boxes[bi].visible = this.pips[bi].visible = false;
    for (const [id, o] of this.ships) if (!live.has(id)) { this.scene.remove(o.g); this.ships.delete(id); }

    // arrows round the middle of your view to the nearest ships you are not looking at
    threats.sort((a, b) => a.d - b.d); let ai = 0; head.getWorldQuaternion(_q).invert(); head.getWorldPosition(_s);
    for (const th of threats) { if (ai >= this.arrows.length) break; _w.copy(th.p).sub(_s).applyQuaternion(_q); const off = Math.acos(Math.max(-1, Math.min(1, -_w.z / (_w.length() || 1)))); if (off < 0.6 || !play) continue;
      const l = Math.hypot(_w.x, _w.y) || 1, a = this.arrows[ai++]; a.visible = true; a.position.set(_w.x / l * 0.3, _w.y / l * 0.3, -1); a.rotation.z = Math.atan2(_w.y, _w.x) - Math.PI / 2; a.material.color.setHex(th.torp ? 0xffa53a : 0xff5548); a.material.opacity = th.d < 300 ? 0.55 + 0.45 * Math.sin(this.t * 14) : 0.85; }
    for (; ai < this.arrows.length; ai++) this.arrows[ai].visible = false;

    // bolts
    let n = 0; for (const b of sim.bolts) { if (n >= this.NB) break; V(b.v); const sp = _v.length(); _m.lookAt(_v, ZERO, UP); _q.setFromRotationMatrix(_m); const w = b.mine ? 0.32 : b.heavy ? 1.5 : 0.8, L = b.mine ? 18 : b.heavy ? 12 : 9;
      _m.compose(_w.set(b.p[0], b.p[1], b.p[2]).addScaledVector(_v, -L * 0.5 / sp), _q, _s.set(w, w, L)); this.boltM.setMatrixAt(n, _m); this.boltM.setColorAt(n++, b.mine ? _c.setRGB(0.35, 1, 0.8) : b.heavy ? _c.setRGB(1, 0.25, 0.9) : _c.setRGB(1, 0.32, 0.18)); }
    this.boltM.count = n; this.boltM.instanceMatrix.needsUpdate = true; if (this.boltM.instanceColor) this.boltM.instanceColor.needsUpdate = true;

    // missiles
    const ml = new Set(); for (const m of sim.missiles) { ml.add(m.id); let o = this.msls.get(m.id); if (!o) { o = new THREE.Mesh(this.mslG, this.mslM); this.scene.add(o); this.msls.set(m.id, o); }
      o.position.set(m.p[0], m.p[1], m.p[2]); _m.lookAt(V(m.d), ZERO, UP); o.quaternion.setFromRotationMatrix(_m); this.spark(o.position, _w.set(-m.d[0] * 30, -m.d[1] * 30, -m.d[2] * 30), 2, 4, 0.5, 1, 0.7, 0.3); }
    for (const [id, o] of this.msls) if (!ml.has(id)) { this.scene.remove(o); this.msls.delete(id); }

    // sparks
    const P = this.pg.attributes.position.array, C = this.pg.attributes.color.array;
    for (let k = 0; k < this.NP; k++) { if (this.pl[k] <= 0) continue; this.pl[k] -= dt; const f = Math.max(0, this.pl[k] / this.pc[k * 4 + 3]); P[k * 3] += this.pv[k * 3] * dt; P[k * 3 + 1] += this.pv[k * 3 + 1] * dt; P[k * 3 + 2] += this.pv[k * 3 + 2] * dt;
      C[k * 3] = this.pc[k * 4] * f; C[k * 3 + 1] = this.pc[k * 4 + 1] * f; C[k * 3 + 2] = this.pc[k * 4 + 2] * f; if (this.pl[k] <= 0) P[k * 3 + 1] = -1e5; }
    this.pg.attributes.position.needsUpdate = true; this.pg.attributes.color.needsUpdate = true;
    for (const s of this.blasts) { if (!s.visible) continue; const u = s.userData; u.t += dt; const f = u.t / u.life; if (f >= 1) { s.visible = false; continue; } s.position.addScaledVector(u.v, dt); s.scale.setScalar(u.size * (0.5 + 1.8 * Math.sqrt(f))); s.material.opacity = (1 - f) * (1 - f); }
    for (const r of this.rings) { if (!r.visible) continue; const u = r.userData; u.t += dt; const f = u.t / 1.1; if (f >= 1) { r.visible = false; continue; } r.scale.setScalar(u.size * (0.2 + f * 2)); r.material.opacity = (1 - f) * (1 - f) * 0.5; }

    // the rocks drift back past you: you are under way
    if (this.rockD) { this.rockD.forEach((r, i) => { r.z += CRUISE * dt; if (r.z > 1500) r.z -= 3000; r.a += r.w * dt; _m.compose(_w.set(r.x, r.y, r.z), _q.setFromAxisAngle(r.ax, r.a), _s.setScalar(r.s)); this.rockM[i % 3].setMatrixAt(Math.floor(i / 3), _m); }); for (const m of this.rockM) m.instanceMatrix.needsUpdate = true; }
    this.dustM.uniforms.uT.value = this.t * CRUISE;

    if (this.msgT > 0 && (this.msgT -= dt) <= 0) this.msg.visible = false; if (this.msg.visible) this.msg.material.opacity = Math.min(1, this.msgT * 2);
    this.hurtT = Math.max(0, this.hurtT - dt); this.red.visible = this.hurtT > 0; this.red.material.opacity = Math.min(0.32, this.hurtT * 0.8);
  }
}
