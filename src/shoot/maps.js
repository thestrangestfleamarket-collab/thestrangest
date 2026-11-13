// The three arenas. Everything visible is real geometry: window and door openings are cut into walls,
// rooms have floors and ceilings, and the surroundings are modelled out to the horizon and hazed by the atmosphere.
import * as THREE from 'three';
import { World, lightCone, particles, FOG_SUN } from './world.js';

const CYL = (r, h, seg = 12) => new THREE.CylinderGeometry(r, r, h, seg);
const WHEEL = (r, t) => new THREE.CylinderGeometry(r, r, t, 14).rotateX(Math.PI / 2);
const SUN = new THREE.Vector3(...FOG_SUN).normalize();

function flicker(light, base, speed = 1) {
  const s = Math.random() * 100;
  return (dt, t) => { const n = Math.sin(t * 13 * speed + s) * Math.sin(t * 7.3 * speed + s * 2) * Math.sin(t * 2.1 + s); light.intensity = base * (n > 0.55 ? 0.15 : 0.85 + 0.15 * Math.sin(t * 40 + s)); };
}
function sunLight(w, color, intensity, span = 24) {
  const l = w.light(new THREE.DirectionalLight(color, intensity), true);
  l.position.copy(SUN).multiplyScalar(70); l.target.position.set(0, 0, 0);
  Object.assign(l.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 5, far: 150 });
  l.shadow.bias = -0.0003; l.shadow.normalBias = 0.04;
  return l;
}

// ================= DERELICT: orbital station ring section =================
function derelict(w) {
  const M = w.mats, q = w.q;
  w.name = 'DERELICT'; w.ambience = 'station'; w.reverb = 2.6;
  w.sky({ sunCol: [1.0, 0.92, 0.8], zenith: [0.0008, 0.001, 0.002], horizon: [0.0008, 0.001, 0.002], ground: [0, 0, 0], stars: 1.6, nebula: 0.05, disc: 0.99985, discI: 60, fog: 0x05090d, density: 0.02, env: 0.5 });
  const plate = M.get('plate'), panel = M.get('panel'), dark = M.get('panel', 0x8899aa), rust = M.get('rust'), crate = M.get('rust', 0xb0b8a0);
  const cyan = M.glow(0x40e0ff, 3), red = M.glow(0xff2a10, 4), white = M.glow(0xcfe8ff, 3), amber = M.glow(0xffa030, 3);
  const glass = M.flat(0x88aabb, 0.04, 0, { transparent: true, opacity: 0.12, depthWrite: false });
  w.box(plate, 0, -0.2, 0, 31, 0.2, 31, { collide: false });
  w.box(dark, 0, 4.2, 0, 31, 0.3, 31, { tile: 3 });
  // hull walls. The sun-side (-x) and the +z wall carry real viewports onto space.
  const ports = [-11, -5.5, 0, 5.5, 11].map((c) => ({ c, w: 3.6, b: 0.9, t: 3.4 }));
  w.wall(panel, 'z', -15.25, -15.5, 15.5, 0, 4.2, 0.5, ports, { surf: 'metal' });
  w.wall(panel, 'x', 15.25, -15.5, 15.5, 0, 4.2, 0.5, ports, { surf: 'metal' });
  w.box(panel, 15.25, 0, 0, 0.5, 4.2, 31, { surf: 'metal' }); w.box(panel, 0, 0, -15.25, 31, 4.2, 0.5, { surf: 'metal' });
  for (const p of ports) {
    w.box(glass, -15.3, 0.9, p.c, 0.06, 2.5, 3.6, { surf: 'metal' }); w.box(glass, p.c, 0.9, 15.3, 3.6, 2.5, 0.06, { surf: 'metal' });
    for (const dz of [-1.85, 1.85]) { w.box(rust, -15.25, 0.9, p.c + dz, 0.62, 2.5, 0.12, { collide: false }); w.box(rust, p.c + dz, 0.9, 15.25, 0.12, 2.5, 0.62, { collide: false }); }
    w.box(rust, -15.25, 0.82, p.c, 0.66, 0.1, 3.8, { collide: false }); w.box(rust, p.c, 0.82, 15.25, 3.8, 0.1, 0.66, { collide: false });
  }
  // exterior structure seen through the viewports: hull ribs, truss, solar wings, antenna
  for (let i = -40; i <= 40; i += 8) { w.box(dark, -16.4, -6, i, 1.6, 16, 0.5, { collide: false }); w.box(dark, i, -6, 16.4, 0.5, 16, 1.6, { collide: false }); }
  w.box(dark, -17.5, -2, 0, 0.6, 0.6, 120, { collide: false }); w.box(dark, 0, -2, 17.5, 120, 0.6, 0.6, { collide: false });
  const solar = M.flat(0x0a1430, 0.25, 0.8), foil = M.flat(0xb89040, 0.35, 1);
  for (const [x, z, ry] of [[-60, -14, 0], [-60, 22, 0], [-16, 70, Math.PI / 2], [26, 70, Math.PI / 2]]) {
    w.box(rust, x, -1, z, ry ? 0.4 : 70, 0.4, ry ? 70 : 0.4, { collide: false });
    for (let k = -3; k <= 3; k++) { const ox = ry ? 0 : k * 9, oz = ry ? k * 9 : 0; w.box(solar, x + ox, -0.9, z + oz, ry ? 22 : 8, 0.12, ry ? 8 : 22, { collide: false, rx: ry ? 0 : 0.35, rz: ry ? 0.35 : 0 }); }
  }
  w.mesh(foil, CYL(5, 26, 24), -70, 6, -55, 0, 0, Math.PI / 2); w.mesh(dark, CYL(5.4, 3, 24), -70, 6, -55, 0, 0, Math.PI / 2);
  w.mesh(dark, new THREE.SphereGeometry(7, 20, 12, 0, 6.3, 0, 1.2), -40, 14, 90, 2.2, 0, 0); w.mesh(rust, CYL(0.3, 16, 8), -40, 6, 86);
  // interior trim + pipes
  for (const s of [-1, 1]) {
    w.mesh(rust, CYL(0.09, 30), 0, 3.75, s * 14.8, 0, 0, Math.PI / 2); w.mesh(rust, CYL(0.06, 30), 0, 3.95, s * 14.82, 0, 0, Math.PI / 2);
    w.mesh(rust, CYL(0.09, 30), s * 14.8, 3.75, 0, Math.PI / 2, 0, 0);
  }
  for (let i = -12; i <= 12; i += 6) { w.box(cyan, i, 2.2, -14.97, 1.6, 0.06, 0.04, { collide: false }); w.box(cyan, 14.97, 2.2, i, 0.04, 0.06, 1.6, { collide: false }); }
  // reactor core
  w.collider(0, 0, 0, 2.6, 4.2, 2.6, 'metal');
  w.mesh(dark, CYL(1.3, 0.5, 20), 0, 0.25, 0); w.mesh(dark, CYL(1.3, 0.5, 20), 0, 3.95, 0);
  w.mesh(cyan, CYL(0.55, 3.2, 16), 0, 2.1, 0);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; w.mesh(rust, CYL(0.07, 3.2, 8), Math.cos(a) * 1.05, 2.1, Math.sin(a) * 1.05); }
  for (const y of [1.2, 2.1, 3.0]) w.mesh(rust, new THREE.TorusGeometry(1.05, 0.05, 6, 20), 0, y, 0, Math.PI / 2);
  // inner ring walls with doorways and observation slots
  const slot = [{ c: -4.2, w: 1.6, b: 1.1, t: 2.0 }, { c: 4.2, w: 1.6, b: 1.1, t: 2.0 }], door = { c: 0, w: 2.4, b: 0, t: 2.6 };
  for (const s of [-1, 1]) {
    w.wall(panel, 'z', s * 6, -6.2, 6.2, 0, 4.2, 0.4, [door, ...slot], { surf: 'metal' });
    w.wall(panel, 'x', s * 6, -5.8, 5.8, 0, 4.2, 0.4, [door, ...slot], { surf: 'metal' });
    w.box(amber, s * 5.78, 2.62, 0, 0.04, 0.08, 2.2, { collide: false }); w.box(amber, 0, 2.62, s * 5.78, 2.2, 0.08, 0.04, { collide: false });
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    w.box(panel, sx * 10.5, 0, sz * 10.5, 2.4, 4.2, 2.4, { surf: 'metal' });
    w.box(red, sx * 10.5, 3.2, sz * 9.28, 0.5, 0.1, 0.04, { collide: false });
    w.box(crate, sx * 12.6, 0, sz * 3.2, 1.2, 1.2, 1.2, { surf: 'metal', tile: 1.2 });
    w.box(crate, sx * 3.4, 0, sz * 12.4, 1.2, 1.2, 1.2, { surf: 'metal', tile: 1.2 });
    w.box(crate, sx * 3.4, 1.2, sz * 12.5, 1.0, 0.9, 1.0, { surf: 'metal', tile: 1.0 });
    w.box(rust, sx * 9.2, 0, sz * 1.6, 0.35, 1.05, 2.2, { surf: 'metal' });
    w.box(rust, sx * 1.6, 0, sz * 9.2, 2.2, 1.05, 0.35, { surf: 'metal' });
    for (const [ox, oz] of [[7.6, 7.6], [8.5, 7.3]]) { w.mesh(rust, CYL(0.42, 1.1, 14), sx * ox, 0.55, sz * oz); w.collider(sx * ox, 0, sz * oz, 0.8, 1.1, 0.8, 'metal'); }
    w.box(dark, sx * 3.6, 0, sz * 3.6, 1.4, 1.0, 1.4, { surf: 'metal' }); w.box(cyan, sx * 3.6, 1.0, sz * 3.6, 1.0, 0.03, 1.0, { collide: false });
  }
  const strips = [[9, 9], [9, -9], [-9, -9], [-9, 9]];
  for (const [x, z] of strips) w.box(white, x, 4.16, z, 1.8, 0.05, 0.25, { collide: false });
  w.finish();
  // planet: a real lit sphere far outside
  const pc = document.createElement('canvas'); pc.width = 512; pc.height = 256; const px = pc.getContext('2d');
  for (let y = 0; y < 256; y++) { const v = y / 256, n = Math.sin(v * 40) * 0.5 + Math.sin(v * 97 + 2) * 0.3 + Math.sin(v * 13) * 0.6; px.fillStyle = `rgb(${150 + n * 40},${110 + n * 30},${80 + n * 18})`; px.fillRect(0, y, 512, 1); }
  for (let i = 0; i < 260; i++) { px.fillStyle = `rgba(${200 + Math.random() * 55},${170 + Math.random() * 50},140,0.07)`; px.beginPath(); px.ellipse(Math.random() * 512, Math.random() * 256, 20 + Math.random() * 90, 2 + Math.random() * 6, 0, 0, 6.3); px.fill(); }
  const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace;
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1500, 64, 40), new THREE.MeshStandardMaterial({ map: pt, roughness: 1, fog: false }));
  planet.position.set(-2300, -900, 2600); planet.rotation.set(0.4, 0, 0.3); w.group.add(planet);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1535, 48, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.45, 0.8), transparent: true, opacity: 0.12, side: THREE.BackSide, fog: false, depthWrite: false }));
  halo.position.copy(planet.position); w.group.add(halo);
  w.onUpdate((dt) => { planet.rotation.y += dt * 0.004; });

  w.light(new THREE.HemisphereLight(0x33485a, 0x08090c, 0.7));
  sunLight(w, 0xfff0dc, 5.5, 26);  // hard sunlight raking in through the viewports
  const core = w.light(new THREE.PointLight(0x40e0ff, 40, 18, 1.5)); core.position.set(0, 2.2, 0);
  w.onUpdate((dt, t) => { core.intensity = 38 + Math.sin(t * 2.2) * 9 + Math.sin(t * 17) * 2; });
  strips.slice(0, q.tier > 0 ? 4 : 2).forEach(([x, z], i) => { const l = w.light(new THREE.PointLight(0xbfdcff, 30, 16, 1.5)); l.position.set(x, 3.6, z); if (i % 2 === 0) w.onUpdate(flicker(l, 30)); });
  for (const [x, z] of [[13, -6], [6, -13]].slice(0, q.tier > 0 ? 2 : 1)) {
    const s = w.light(new THREE.SpotLight(0xff2a10, 70, 18, 0.5, 0.6, 1.4)); s.position.set(x, 3.6, z);
    const cone = lightCone(w, x, 3.6, z, 2.2, 9, 0xff2a10, 0.05);
    w.onUpdate((dt, t) => { const a = t * 2.4 + x; s.target.position.set(x + Math.cos(a) * 5, 1.2, z + Math.sin(a) * 5); cone.lookAt(s.target.position); cone.rotateX(-Math.PI / 2); });
  }
  particles(w, { count: q.tier > 0 ? 600 : 220, box: [14, 4, 14], size: 0.016, color: 0xd8e8ff, opacity: 0.45, vel: [0.03, 0.015, 0.02], jitter: 0.15 });
  w.spawns = [[12.5, -12.5], [-12.5, 12.5], [12.5, 12.5], [-12.5, -12.5], [-12.5, 0], [12.5, 0], [0, -12.5], [0, 12.5]]; w.orbit = [8.5, 2.4];
}

// ================= COMPOUND: rainy night freight yard =================
function compound(w) {
  const M = w.mats, q = w.q;
  w.name = 'COMPOUND'; w.ambience = 'rain'; w.reverb = 1.1;
  w.sky({ sunCol: [0.55, 0.66, 1.0], zenith: [0.004, 0.007, 0.016], horizon: [0.03, 0.045, 0.075], ground: [0.004, 0.005, 0.007], stars: 1.2, clouds: 0.62, cloudCol: [0.11, 0.14, 0.2], cloudDark: [0.008, 0.01, 0.016], disc: 0.99972, discI: 14, fog: 0x0b131f, density: 0.016, env: 1.2 });
  const asphalt = M.get('asphalt'), conc = M.get('concrete'), rust = M.get('rust'), wood = M.get('wood'), shed = M.get('corrugated', 0x6a7078), roof = M.get('corrugated', 0x3a3f46);
  const cont = [0x7a3226, 0x27486a, 0x35603f, 0x86702e, 0x5a5f66].map((c) => M.get('corrugated', c));
  const lamp = M.glow(0xdfeaff, 5), warm = M.glow(0xffc070, 4), sodium = M.glow(0xffa040, 3), glass = M.flat(0x0a1016, 0.05, 0.9);
  w.box(asphalt, 0, -0.2, 0, 420, 0.2, 420, { collide: false, tile: 5 });
  // perimeter wall with a real gate opening (barred) on two sides
  const gate = [{ c: 0, w: 5, b: 0, t: 3.0 }];
  w.wall(conc, 'x', -15.25, -15.5, 15.5, 0, 3.6, 0.5, gate); w.wall(conc, 'x', 15.25, -15.5, 15.5, 0, 3.6, 0.5, gate);
  w.box(conc, -15.25, 0, 0, 0.5, 3.6, 30); w.box(conc, 15.25, 0, 0, 0.5, 3.6, 30);
  for (const s of [-1, 1]) {
    for (let x = -2.4; x <= 2.41; x += 0.3) w.mesh(rust, CYL(0.025, 3, 6), x, 1.5, s * 15.25);
    w.box(rust, 0, 1.4, s * 15.25, 5, 0.08, 0.06, { collide: false }); w.box(rust, 0, 2.7, s * 15.25, 5, 0.08, 0.06, { collide: false }); w.collider(0, 0, s * 15.25, 5, 3, 0.12, 'metal');
    for (let x = -15; x <= 15; x += 2.5) { w.mesh(rust, CYL(0.03, 0.9, 6), x, 4.0, s * 15.25, 0, 0, s * 0.5); w.mesh(rust, CYL(0.03, 0.9, 6), s * 15.25, 4.0, x, s * 0.5, 0, 0); }
  }
  const container = (x, z, rot, ci, y = 0, col = true) => {
    const [wx, wz] = rot ? [6.06, 2.44] : [2.44, 6.06];
    w.box(cont[ci], x, y, z, wx, 2.6, wz, { surf: 'metal', tile: 2.6, collide: col });
    w.box(rust, x, y, z, wx + 0.06, 0.14, wz + 0.06, { collide: false }); w.box(rust, x, y + 2.5, z, wx + 0.06, 0.12, wz + 0.06, { collide: false });
  };
  container(-9, -8, 0, 0); container(-9, -8, 0, 1, 2.6); container(-6.2, -9.8, 0, 2);
  container(9, 8, 0, 1); container(9, 8, 0, 3, 2.6); container(6.2, 9.8, 0, 0);
  container(-3.2, 4.2, 1, 3); container(3.2, -4.2, 1, 2); container(10.5, -9.5, 1, 4); container(-10.5, 9.5, 1, 4);
  // an open container you can walk through (real interior)
  for (const [cx, cz] of [[0, -11.6], [0, 11.6]]) {
    w.box(cont[1], cx, 0, cz - 1.19, 6.06, 2.6, 0.06, { surf: 'metal', tile: 2.6 }); w.box(cont[1], cx, 0, cz + 1.19, 6.06, 2.6, 0.06, { surf: 'metal', tile: 2.6 });
    w.box(cont[1], cx, 2.54, cz, 6.06, 0.06, 2.44, { surf: 'metal', tile: 2.6 }); w.box(wood, cx, 0, cz, 6.0, 0.04, 2.3, { collide: false });
    for (const sx of [-1, 1]) w.box(cont[1], cx + sx * 3.2, 0, cz + sx * 1.9, 0.06, 2.5, 1.2, { surf: 'metal', ry: sx * 0.9 });
  }
  const barrier = (x, z, rot) => { const [wx, wz] = rot ? [0.5, 2.4] : [2.4, 0.5]; w.box(conc, x, 0, z, wx, 0.95, wz, { tile: 1.5 }); };
  barrier(0, 0, 0); barrier(-1.4, 7.6, 1); barrier(1.4, -7.6, 1); barrier(-8, 1.5, 0); barrier(8, -1.5, 0); barrier(-12, -1.5, 0); barrier(12, 1.5, 0); barrier(4.5, 3.5, 1); barrier(-4.5, -3.5, 1);
  // guard huts: real rooms with door and window openings, lit from inside
  const hut = (cx, cz, s) => {
    const win = { w: 1.3, b: 1.0, t: 2.0 };
    w.wall(conc, 'x', cz - 2 * s, cx - 2, cx + 2, 0, 2.8, 0.22, [{ c: cx, ...win }]);
    w.wall(conc, 'x', cz + 2 * s, cx - 2, cx + 2, 0, 2.8, 0.22, [{ c: cx - s * 0.9, w: 1.1, b: 0, t: 2.15 }]);
    w.wall(conc, 'z', cx - 2 * s, cz - 2, cz + 2, 0, 2.8, 0.22, [{ c: cz, ...win }]);
    w.wall(conc, 'z', cx + 2 * s, cz - 2, cz + 2, 0, 2.8, 0.22, [{ c: cz + s * 0.8, w: 1.1, b: 0, t: 2.15 }]);
    w.box(rust, cx, 2.8, cz, 4.8, 0.16, 4.8, { surf: 'metal' });
    w.box(wood, cx + s * 1.1, 0, cz - s * 1.3, 1.3, 0.85, 0.7, { tile: 1, surf: 'wood' }); w.box(rust, cx - s * 1.5, 0, cz - s * 1.4, 0.6, 1.8, 0.5, { surf: 'metal' });
    w.box(warm, cx, 2.74, cz, 0.9, 0.05, 0.16, { collide: false });
    const l = w.light(new THREE.PointLight(0xffb060, 16, 10, 1.6)); l.position.set(cx, 2.5, cz);
  };
  hut(11.5, -3.5, 1); hut(-11.5, 3.5, -1);
  for (const [x, z, s] of [[-2.5, -13.6, 1.1], [2.5, 13.6, 1.1], [5.5, -12, 0.9], [-5.5, 12, 0.9], [-13, -12.5, 1.2], [13, 12.5, 1.2], [0.2, 6.2, 1.0], [-0.2, -6.2, 1.0]]) {
    w.box(wood, x, 0, z, s, s, s, { surf: 'wood', tile: s }); if (s > 1) w.box(wood, x + 0.1, s, z - 0.05, s * 0.7, s * 0.7, s * 0.7, { surf: 'wood', tile: s * 0.7 });
  }
  for (const [x, z] of [[-13.5, -5], [-13.2, -5.9], [13.5, 5], [13.2, 5.9], [5, -8.6], [-5, 8.6]]) { w.mesh(rust, CYL(0.3, 0.9, 14), x, 0.45, z); w.collider(x, 0, z, 0.58, 0.9, 0.58, 'metal'); }
  const towers = [[-13.8, -13.8, 1], [13.8, 13.8, 1], [13.8, -13.8, 0], [-13.8, 13.8, 0]];
  for (const [x, z] of towers) { w.mesh(rust, CYL(0.09, 7, 8), x, 3.5, z); w.box(rust, x, 6.9, z, 0.9, 0.35, 0.3, { collide: false, ry: Math.atan2(-x, -z) }); w.box(lamp, x * 0.985, 6.95, z * 0.985, 0.7, 0.24, 0.24, { collide: false, ry: Math.atan2(-x, -z) }); }
  // ---- the rest of the port, all real geometry ----
  const shedAt = (x, z, wx, wz, h) => {
    w.box(shed, x, 0, z, wx, h, wz, { collide: false, tile: 4 });
    const along = wx > wz, span = along ? wz : wx, len = along ? wx : wz, pitch = 0.3, half = span / 2 / Math.cos(pitch) + 0.5;
    for (const sd of [-1, 1]) { const off = sd * span / 4; w.box(roof, x + (along ? 0 : off), h + span / 4 * Math.tan(pitch) - 0.1, z + (along ? off : 0), along ? len + 1 : half, 0.2, along ? half : len + 1, { collide: false, tile: 4, rx: along ? sd * pitch : 0, rz: along ? 0 : -sd * pitch }); }
    for (let k = -len / 2 + 5; k < len / 2 - 3; k += 9) { const dx = along ? k : (x > 0 ? -wx / 2 - 0.05 : wx / 2 + 0.05), dz = along ? (z > 0 ? -wz / 2 - 0.05 : wz / 2 + 0.05) : k; w.box(roof, x + dx, 0, z + dz, along ? 5 : 0.12, 5, along ? 0.12 : 5, { collide: false, tile: 1.2 }); w.box(sodium, x + dx * (along ? 1 : 1.004), 5.6, z + dz * (along ? 1.004 : 1), along ? 0.5 : 0.14, 0.14, along ? 0.14 : 0.5, { collide: false }); }
  };
  shedAt(-52, 4, 30, 70, 13); shedAt(56, -10, 34, 80, 15); shedAt(-6, -62, 90, 30, 12); shedAt(10, 70, 110, 36, 14);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (const [bx, bz, rot, n] of [[-26, -30, 0, 5], [-30, 30, 0, 4], [28, 34, 0, 5], [30, -36, 1, 4], [-24, -6, 0, 3], [26, 8, 0, 3]]) {
    for (let i = 0; i < n; i++) for (let st = 0; st < 1 + Math.floor(rnd() * 3.2); st++) container(bx + (rot ? 0 : i * 2.7), bz + (rot ? i * 2.7 : 0), rot, Math.floor(rnd() * 5), st * 2.6, false);
  }
  const crane = (x, z) => {
    for (const sx of [-9, 9]) for (const sz of [-5, 5]) w.box(rust, x + sx, 0, z + sz, 1, 30, 1, { collide: false });
    for (const sz of [-5, 5]) w.box(rust, x, 30, z + sz, 46, 1.6, 1.2, { collide: false });
    for (const sx of [-9, 9]) { w.box(rust, x + sx, 14, z, 0.6, 0.6, 10, { collide: false }); w.box(rust, x + sx, 30, z, 1, 1.4, 11, { collide: false }); }
    w.box(M.get('corrugated', 0x86702e), x + 4, 26.5, z, 4, 3.4, 5, { collide: false }); w.box(lamp, x + 4, 26.3, z, 2, 0.15, 2, { collide: false });
    for (const k of [-1, 1]) w.mesh(rust, CYL(0.05, 14, 5), x + 4 + k, 19.5, z);
    w.box(M.glow(0xff2010, 6), x - 20, 31.7, z, 0.4, 0.4, 0.4, { collide: false });
  };
  crane(-34, 62); crane(44, -58);
  for (const [x, z, r, h] of [[-80, -50, 9, 26], [-98, -44, 9, 26], [-88, -66, 9, 22], [90, 60, 11, 20], [112, 52, 11, 20]]) { w.mesh(shed, CYL(r, h, 28), x, h / 2, z); w.mesh(roof, new THREE.ConeGeometry(r + 0.4, 3, 28), x, h + 1.5, z); }
  w.mesh(conc, new THREE.CylinderGeometry(2.2, 3.4, 70, 16), 130, 35, -90); w.box(M.glow(0xff2010, 6), 130, 70.4, -90, 0.6, 0.6, 0.6, { collide: false });
  for (const [x, z] of [[-30, -18], [-30, 16], [30, -20], [30, 22], [-10, 36], [14, -38], [-60, 46], [64, 40], [70, -52], [-70, -30]]) { w.mesh(rust, CYL(0.12, 11, 6), x, 5.5, z); w.box(sodium, x, 10.9, z, 0.9, 0.12, 0.35, { collide: false }); w.box(rust, x, 11.02, z, 1.1, 0.1, 0.5, { collide: false }); }
  w.finish();

  w.light(new THREE.HemisphereLight(0x3a5278, 0x0c0e12, 0.7));
  sunLight(w, 0x9fbcff, 1.1);
  towers.forEach(([x, z, main], i) => {
    if (!main && q.tier === 0) return;
    const s = w.light(new THREE.SpotLight(0xdfeaff, 170, 36, 0.62, 0.5, 1.5), main && q.tier > 0);
    s.position.set(x, 6.9, z); s.target.position.set(x * 0.25, 0, z * 0.25);
    if (s.castShadow) { s.shadow.camera.near = 1; s.shadow.camera.far = 36; }
    const cone = lightCone(w, x, 6.9, z, 6.5, 12, 0xbfd4ff, 0.04); cone.lookAt(s.target.position); cone.rotateX(-Math.PI / 2);
    if (i === 3) w.onUpdate(flicker(s, 170, 0.6));
  });
  particles(w, { count: q.tier > 0 ? 1600 : 600, box: [18, 9, 18], color: 0x9fb4d8, opacity: 0.3, vel: [1.2, -13, 0.5], streak: 0.035, additive: true });
  w.spawns = [[-13, -10.5], [13, 10.5], [13, -12.8], [-13, 12.8], [-12.8, 6.8], [12.8, -6.8], [-4, -13.6], [4, 13.6]]; w.orbit = [11.5, 6.5];
}

// ================= OUTBREAK: ruined city block at dusk =================
function outbreak(w) {
  const M = w.mats, q = w.q;
  w.name = 'OUTBREAK'; w.ambience = 'wind'; w.reverb = 1.5;
  w.sky({ sunCol: [1.0, 0.5, 0.2], zenith: [0.035, 0.05, 0.13], horizon: [0.75, 0.3, 0.11], ground: [0.03, 0.022, 0.02], stars: 0.1, clouds: 0.52, cloudCol: [1.0, 0.46, 0.24], cloudDark: [0.09, 0.06, 0.1], disc: 0.9996, discI: 30, fog: 0x8a4a2c, density: 0.0085, env: 1.0 });
  const asphalt = M.get('asphalt', 0xc8b8b0), conc = M.get('concrete'), brick = M.get('brick'), brick2 = M.get('brick', 0xb0a8a0), plaster = M.get('plaster'), rust = M.get('rust'), wood = M.get('wood');
  const sand = M.get('plaster', 0xa89878), inner = M.get('plaster', 0xb8b0a0), glass = M.flat(0x0a0d12, 0.06, 0.9), fire = M.glow(0xff7a20, 5), tube = M.glow(0xdfeaff, 4);
  const paint = [0x7a1f18, 0x1f3c5c, 0x8a8f94, 0x2c2e31].map((c) => M.flat(c, 0.35, 0.7)), tyre = M.flat(0x0a0a0a, 0.9, 0);
  const FH = 3.3, FRONT = 6, BACK = 14;
  w.box(asphalt, 0, -0.2, 0, 320, 0.2, 9, { collide: false, tile: 5 });
  for (const s of [-1, 1]) { w.box(conc, 0, -0.2, s * 5.25, 320, 0.28, 1.5, { collide: false, tile: 3 }); w.box(asphalt, s * 78, -0.2, 0, 9, 0.2, 300, { collide: false, tile: 5 }); }
  w.box(conc, 0, -0.32, 0, 900, 0.1, 900, { collide: false, tile: 6 });                                  // city ground
  for (const s of [-1, 1]) w.box(M.get('wood', 0x8a8078), 0, -0.2, s * 10.2, 31, 0.2, 8.6, { collide: false, tile: 2.5 }); // shop floors
  for (let x = -150; x <= 150; x += 4) w.box(M.flat(0xb8b090, 0.9), x, 0, 0, 1.8, 0.004, 0.14, { collide: false });

  // enterable buildings: cut openings, floor slabs, interior partitions, roofs with parapets
  const building = (x0, x1, s, floors, mat, doorAt) => {
    const zf = s * FRONT, zb = s * BACK, zm = (zf + zb) / 2, cx = (x0 + x1) / 2, bw = x1 - x0, H = floors * FH, t = 0.35;
    const n = Math.max(2, Math.round((bw - 1) / 2.5)), pitch = bw / n;
    for (let f = 0; f < floors; f++) {
      const y = f * FH, ops = [];
      for (let i = 0; i < n; i++) {
        const c = x0 + pitch * (i + 0.5);
        if (f === 0) ops.push(i === doorAt ? { c, w: 1.3, b: 0, t: 2.3 } : { c, w: 1.8, b: 0.7, t: 2.5 }); else ops.push({ c, w: 1.15, b: 0.95, t: 2.45 });
        const op = ops[i];
        w.box(conc, c, y + op.b - 0.1, zf + s * 0.12, op.w + 0.2, 0.1, t + 0.14, { collide: false });        // sill
        w.box(conc, c, y + op.t, zf - s * 0.03, op.w + 0.3, 0.16, t + 0.1, { collide: false });              // lintel
        if (f > 0 && (i + f) % 3 === 0) w.box(wood, c, y + op.b, zf + s * 0.05, op.w, (op.t - op.b) * 0.55, 0.05, { surf: 'wood', rz: 0.04 }); // boarded
      }
      w.wall(mat, 'x', zf + s * t / 2, x0, x1, y, FH, t, ops, { tile: 2.5 });
      w.box(conc, cx, y + FH - 0.24, zm + s * t / 2, bw - 0.5, 0.24, BACK - FRONT - t, { tile: 3 });      // slab = ceiling here, floor above
      if (f > 0) { w.wall(inner, 'x', zm, x0 + 0.3, x1 - 0.3, y, FH - 0.24, 0.14, [{ c: cx + 1, w: 1.0, b: 0, t: 2.1 }], { tile: 3 }); w.box(wood, cx, y, zm - s * 2, bw - 0.6, 0.03, 3.6, { collide: false, tile: 2 }); }
    }
    w.wall(mat, 'z', x0 + t / 2, Math.min(zf, zb), Math.max(zf, zb), 0, H, t, [{ c: zm + s * 1.5, w: 1.3, b: 0, t: 2.3 }], { tile: 2.5 });
    w.wall(mat, 'z', x1 - t / 2, Math.min(zf, zb), Math.max(zf, zb), 0, H, t, [{ c: zm + s * 1.5, w: 1.3, b: 0, t: 2.3 }], { tile: 2.5 });
    w.box(mat, cx, 0, zb + s * t / 2, bw, H, t, { tile: 2.5 });
    for (const [px, pz, pw, pd] of [[cx, zf + s * 0.2, bw + 0.2, 0.4], [cx, zb + s * 0.2, bw + 0.2, 0.4], [x0 + 0.2, zm, 0.4, 8.4], [x1 - 0.2, zm, 0.4, 8.4]]) w.box(conc, px, H, pz, pw, 0.7, pd, { collide: false });
    w.box(rust, cx - bw * 0.2, H, zm, 1.6, 1.3, 1.2, { collide: false }); w.mesh(rust, CYL(0.12, 2.2, 8), cx + bw * 0.25, H + 1.1, zm + s);
    // ground-floor interior: plaster back wall, counter, shelving, columns
    w.box(inner, cx, 0, zb - s * 0.02, bw - 0.8, FH - 0.24, 0.05, { collide: false, tile: 3 });
    w.box(wood, cx - bw * 0.18, 0, zm + s * 1.2, Math.min(3, bw * 0.4), 1.05, 0.6, { surf: 'wood', tile: 1.5 });
    w.box(rust, x1 - 1.1, 0, zm - s * 0.5, 0.5, 1.9, 2.4, { surf: 'metal' }); w.box(conc, cx + bw * 0.22, 0, zm, 0.4, FH - 0.24, 0.4);
    return { cx, zm, H };
  };
  const north = [[-15.5, -8, 4, brick, 1], [-8, 0.5, 3, plaster, 2], [0.5, 8.5, 5, brick2, 0], [8.5, 15.5, 3, brick, 1]];
  const south = [[-15.5, -6.5, 3, plaster, 2], [-6.5, 2, 5, brick, 0], [2, 9, 3, brick2, 1], [9, 15.5, 4, plaster, 1]];
  const rooms = [];
  north.forEach((b) => rooms.push(building(b[0], b[1], 1, b[2], b[3], b[4]))); south.forEach((b) => rooms.push(building(b[0], b[1], -1, b[2], b[3], b[4])));
  // street barricades closing the block (the street visibly carries on beyond them)
  for (const s of [-1, 1]) {
    for (let z = -4.8; z <= 4.81; z += 2.4) { w.box(conc, s * 15.4, 0, z, 0.6, 1.0, 2.35, { tile: 1.5 }); w.box(conc, s * 15.4, 1.0, z, 0.5, 1.0, 2.35, { tile: 1.5 }); }
    for (let z = -5; z <= 5; z += 2.5) w.mesh(rust, CYL(0.04, 3.2, 6), s * 15.4, 1.6, z);
    w.box(rust, s * 15.4, 2.9, 0, 0.05, 0.05, 10.4, { collide: false }); w.collider(s * 15.4, 2, 0, 0.2, 1.3, 11, 'metal');
  }
  // vehicles
  const car = (x, z, ry, pi, van = false, col = true) => {
    const L = van ? 5.2 : 4.3, W = 1.85, H = van ? 1.25 : 0.72, cabH = van ? 0.95 : 0.62;
    const c = Math.cos(ry), s = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    w.box(paint[pi], x, 0.32, z, L, H, W, { ry, surf: 'metal', collide: col });
    const [cx, cz] = P(van ? -0.5 : -0.25, 0), cl = van ? L * 0.78 : L * 0.5;
    w.box(paint[pi], cx, 0.32 + H + cabH * 0.78, cz, cl, cabH * 0.22, W * 0.92, { ry, surf: 'metal', collide: false });      // roof
    w.box(glass, cx, 0.32 + H, cz, cl - 0.12, cabH * 0.8, W * 0.86, { ry, surf: 'metal', collide: col });                    // glazing
    for (const e of [-1, 1]) for (const sd of [-1, 1]) { const [qx, qz] = P((van ? -0.5 : -0.25) + e * cl / 2, sd * W * 0.44); w.box(paint[pi], qx, 0.32 + H, qz, 0.07, cabH * 0.8, 0.07, { ry, collide: false }); }
    for (const lx of [-L * 0.32, L * 0.32]) for (const lz of [-W / 2, W / 2]) { const [tx, tz] = P(lx, lz); w.mesh(tyre, WHEEL(0.34, 0.24), tx, 0.34, tz, 0, ry, 0); }
  };
  car(-9.5, -2.2, 0.25, 0); car(-4.2, 2.6, -0.5, 1); car(8.2, 1.8, 1.35, 2); car(4.2, -2.8, 0.1, 3); car(12, -2.6, -0.2, 0, true); car(-12.4, 2.6, 0.12, 2, true);
  w.box(M.flat(0x9a7a18, 0.4, 0.6), 0.4, 0.45, 0, 2.5, 2.7, 7.6, { ry: 0.5, surf: 'metal' }); w.box(glass, 0.4, 1.7, 0, 2.54, 0.95, 6.8, { ry: 0.5, collide: false });
  for (const dz of [-2.6, 2.6]) for (const dx of [-1.2, 1.2]) w.mesh(tyre, WHEEL(0.5, 0.3), 0.4 + dx + dz * 0.5, 0.5, dz, 0, 0.5 + Math.PI / 2, 0);
  const bags = (x, z, len, rot) => { for (let r = 0; r < 3; r++) { const [wx, wz] = rot ? [0.5, len - r * 0.3] : [len - r * 0.3, 0.5]; w.box(sand, x, r * 0.32, z, wx, 0.34, wz, { surf: 'dirt', tile: 0.8 }); } };
  bags(-6.5, -4.6, 2.6, 0); bags(6.5, 4.6, 2.6, 0); bags(-11.5, -0.5, 2.4, 1); bags(11.2, 0.6, 2.4, 1);
  for (const [x, z, k] of [[-13.6, -4.4, 0.8], [13.6, 4.2, 0.9], [-1.8, 4.6, 0.7], [2.4, -4.8, 0.7]]) {
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = (i % 3) * 0.45 * k, h = (0.25 + ((i * 37) % 5) * 0.12) * k; w.box(i % 2 ? conc : brick, x + Math.cos(a) * r, 0, z + Math.sin(a) * r, 0.6 * k + (i % 3) * 0.2, h, 0.5 * k + (i % 2) * 0.3, { ry: a, rx: (i % 4) * 0.08, collide: false, tile: 1.5 }); }
    w.collider(x, 0, z, 1.5 * k, 0.6 * k, 1.5 * k, 'hard');
  }
  for (const [x, z] of [[-9, 5.6], [3, 5.6], [-3, -5.6], [9, -5.6]]) { w.mesh(rust, CYL(0.07, 5.5, 8), x, 2.75, z); w.box(rust, x, 5.4, z - Math.sign(z) * 0.6, 0.14, 0.1, 1.3, { collide: false }); w.collider(x, 0, z, 0.2, 5.5, 0.2, 'metal'); }
  const barrels = [[-6.2, 0.6], [6, -0.8]];
  for (const [x, z] of barrels) { w.mesh(rust, new THREE.CylinderGeometry(0.3, 0.28, 0.9, 14, 1, true), x, 0.45, z); w.collider(x, 0, z, 0.58, 0.9, 0.58, 'metal'); w.mesh(fire, CYL(0.26, 0.02, 12), x, 0.8, z); }

  // ---- the city beyond: real massing with glazing, continuing streets, towers on the skyline ----
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const mass = (x0, x1, z0, z1, h, mat, face) => { // face: +1 glazing on -z side, -1 on +z side, 2/-2 on x sides
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, dist = Math.hypot(cx, cz), proud = 0.05 + dist * 0.0012;
    w.box(mat, cx, 0, cz, x1 - x0, h, z1 - z0, { collide: false, tile: 2.5 });
    w.box(conc, cx, h, cz, x1 - x0 + 0.3, 0.6, z1 - z0 + 0.3, { collide: false });
    if (rnd() > 0.4) w.box(rust, cx + (rnd() - 0.5) * 3, h + 0.6, cz, 2.5, 1.8 + rnd() * 2, 2.5, { collide: false });
    if (rnd() > 0.7) { w.mesh(rust, CYL(1.3, 2.6, 12), cx - 1, h + 3.4, cz + 1); for (const k of [[-0.9, -0.9], [0.9, 0.9], [-0.9, 0.9], [0.9, -0.9]]) w.mesh(rust, CYL(0.06, 2.2, 5), cx - 1 + k[0], h + 1.1, cz + 1 + k[1]); }
    const alongX = Math.abs(face) === 1, len = alongX ? x1 - x0 : z1 - z0, n = Math.floor(len / 2.6);
    for (let f = 0; f < Math.floor(h / FH); f++) for (let i = 0; i < n; i++) {
      const c = (alongX ? x0 : z0) + (len / n) * (i + 0.5), y = f * FH + 0.95;
      if (alongX) { const zz = face > 0 ? z0 : z1; w.box(glass, c, y, zz, 1.2, 1.5, proud * 2, { collide: false }); w.box(conc, c, y - 0.1, zz - Math.sign(face) * proud, 1.45, 0.1, 0.3, { collide: false }); }
      else { const xx = face > 0 ? x0 : x1; w.box(glass, xx, y, c, proud * 2, 1.5, 1.2, { collide: false }); }
    }
  };
  const mats = [brick, plaster, brick2];
  for (const s of [-1, 1]) for (const dir of [-1, 1]) {
    let x = 15.5;
    while (x < 150) { const bw = 7 + rnd() * 7; if (Math.abs(x + bw / 2 - 78) < 9) { x = 83; continue; } const h = FH * (3 + Math.floor(rnd() * 4)); const a = dir * x, b = dir * (x + bw); mass(Math.min(a, b), Math.max(a, b), s > 0 ? FRONT : -BACK - rnd() * 4, s > 0 ? BACK + rnd() * 4 : -FRONT, h, mats[Math.floor(rnd() * 3)], s); x += bw; }
  }
  for (const s of [-1, 1]) for (let x = -150; x < 150;) { const bw = 10 + rnd() * 12, h = FH * (3 + Math.floor(rnd() * 6)); if (Math.abs(Math.abs(x + bw / 2) - 78) > 12) mass(x, x + bw - 1.5, s > 0 ? 22 : -34 - rnd() * 6, s > 0 ? 34 + rnd() * 6 : -22, h, mats[Math.floor(rnd() * 3)], s); x += bw; }
  const tower = M.get('concrete', 0x9aa4b0), tglass = M.flat(0x101820, 0.08, 1);
  for (let i = 0; i < 34; i++) {
    const a = i / 34 * 6.283 + rnd() * 0.15, r = 170 + rnd() * 240, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z) < 30) continue;
    const bw = 16 + rnd() * 22, bd = 16 + rnd() * 22, h = 30 + rnd() * 110;
    w.box(tower, x, 0, z, bw, h, bd, { collide: false, tile: 6 });
    for (let y = 4; y < h - 3; y += 4) { w.box(tglass, x, y, z, bw + 0.8, 2.2, bd - 2, { collide: false }); w.box(tglass, x, y, z, bw - 2, 2.2, bd + 0.8, { collide: false }); }
    if (rnd() > 0.5) w.box(tower, x, h, z, bw * 0.5, 6 + rnd() * 10, bd * 0.5, { collide: false, tile: 6 });
    if (rnd() > 0.6) w.mesh(rust, CYL(0.3, 22, 5), x, h + 11, z);
  }
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) car(s * (22 + i * 13 + rnd() * 5), (rnd() - 0.5) * 5, rnd() * 6.3, Math.floor(rnd() * 4), rnd() > 0.7, false);
  for (const s of [-1, 1]) for (let x = 24; x < 150; x += 24) for (const sz of [-1, 1]) { w.mesh(rust, CYL(0.07, 5.5, 6), s * x, 2.75, sz * 5.6); w.box(rust, s * x, 5.4, sz * 5, 0.14, 0.1, 1.3, { collide: false }); }
  w.finish();

  w.light(new THREE.HemisphereLight(0x8a7a98, 0x2a1e18, 0.9));
  sunLight(w, 0xff9a50, 3.2, 26);
  const flameTex = M.flameTex;
  barrels.slice(0, q.tier > 0 ? 2 : 1).forEach(([x, z], i) => {
    const l = w.light(new THREE.PointLight(0xff7a28, 14, 11, 1.7)); l.position.set(x, 1.3, z);
    const sprites = [];
    for (let k = 0; k < 3; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.set(x, 1.0 + k * 0.2, z); w.group.add(sp); sprites.push(sp); }
    w.onUpdate((dt, t) => {
      const f = 0.75 + 0.25 * Math.sin(t * 11 + i) * Math.sin(t * 23.7 + i * 2) + 0.1 * Math.sin(t * 47 + i);
      l.intensity = 14 * f; l.position.y = 1.3 + Math.sin(t * 9 + i) * 0.05;
      sprites.forEach((sp, k) => { const s = (0.55 - k * 0.13) * (0.8 + 0.3 * Math.sin(t * (13 + k * 5) + i + k)); sp.scale.set(s, s * 1.9, 1); sp.position.x = x + Math.sin(t * (9 + k * 3) + k) * 0.04; });
    });
  });
  // working fluorescent tubes inside two of the shops, casting real light out through the openings
  [rooms[1], rooms[5]].slice(0, q.tier > 0 ? 2 : 1).forEach((r, i) => {
    const tb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.1), tube); tb.position.set(r.cx, FH - 0.3, r.zm); w.group.add(tb);
    const l = w.light(new THREE.PointLight(0xdfeaff, 22, 13, 1.5)); l.position.set(r.cx, FH - 0.5, r.zm);
    if (i === 0) w.onUpdate(flicker(l, 22, 0.7));
  });
  particles(w, { count: q.tier > 0 ? 260 : 100, box: [20, 7, 12], size: 0.03, color: 0xff8a30, opacity: 0.8, vel: [0.5, 0.7, 0.15], jitter: 0.5 });
  particles(w, { count: q.tier > 0 ? 500 : 180, box: [16, 5, 16], size: 0.018, color: 0xffd0a0, opacity: 0.35, vel: [0.25, -0.03, 0.05], jitter: 0.2 });
  w.spawns = [[-13.5, -2.4], [13.5, 2.4], [13, -10], [-13, 10], [-2, 12.5], [7, -12.5], [-9, -12.5], [13, 12.5]]; w.orbit = [3.6, 7];
}

export const MAPS = [
  { id: 'derelict', name: 'Derelict', blurb: 'Orbital station: sunlight through viewports, reactor glow', build: derelict },
  { id: 'compound', name: 'Compound', blurb: 'Rain-soaked freight yard under moonlit cloud', build: compound },
  { id: 'outbreak', name: 'Outbreak', blurb: 'Ruined city block at dusk, fight through the shops', build: outbreak },
];

export function buildMap(index, scene, mats, quality) {
  const w = new World(scene, mats, quality);
  MAPS[index].build(w);
  w.index = index;
  return w;
}
