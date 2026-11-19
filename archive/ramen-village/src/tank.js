// the cart's goldfish (owner, 16 Nov 2026: "big tank but era appropriate, you have to feed"; its water and swimming real, as THE MARKET's tank: "No fake things"): a big glazed kingyo-bachi basin on a wooden stand behind the left wing, water, weed and stones, one goldfish (Polyfork's koi, gilded); a pot of fish food beside it: take a pinch and let it go over the water, the flakes float and sink and the fish rises to eat; fed, it swims calmly, left hungry it slows, hangs low and sulks, and left the whole run it dies
import * as THREE from 'three';
import { G, V3, mat, box, mesh, cyl } from './ctx.js';
import * as T from './tex.js';
import { Item } from './items.js';
import { makeWater } from './ripple.js';

const B64 = (s) => { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };
const HUNGRY = 0.3, DEAD = 0.75;   // a share of the run unfed: hungry from 0.3, dead at 0.75 (the owner's "doesn't die in one run unless it's left all game")

// a pinch of fish food between the fingers: dropped over the basin it is scattered on the water
class Pinch extends Item { constructor() { const g = new THREE.Group(); mesh(new THREE.IcosahedronGeometry(0.008, 0), mat({ color: 0xa0602a }), 0, 0, 0, g).castShadow = false; super('pinch', g, { radius: 0.03, name: 'pinch of fish food' }); }
  hint() { return 'let it go over the goldfish basin'; } onGround() { this.remove(); } }

export function buildTank(scene) {
  const tank = { ready: false, hunger: 0.12, fed: 0, dead: false, flakes: [] };
  const X = -1.45, Z = 1.25, TOP = 0.74, R = 0.32, H = 0.26, WATER = TOP + H - 0.05;
  const root = new THREE.Group(); scene.add(root); tank.root = root;
  const wood = T.surface(mat({ map: T.photo('wood_dark'), color: 0x9a8070 }), { grime: 0.4 });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.05, TOP - 0.04, 0.05, wood, X + dx * 0.27, (TOP - 0.04) / 2, Z + dz * 0.27, root);
  box(0.62, 0.04, 0.62, wood, X, TOP - 0.02, Z, root); box(0.58, 0.03, 0.03, wood, X, 0.18, Z - 0.27, root); box(0.58, 0.03, 0.03, wood, X, 0.18, Z + 0.27, root);
  // the basin: thick glazed stoneware, white with indigo waves round it, its lip rolled
  const glaze = T.canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a3a78'; g.lineWidth = 6; for (let y = 34; y < h; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 6) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 7); g.stroke(); } g.fillStyle = '#2a3a78'; g.fillRect(0, 0, w, 14); });
  const bowlM = T.surface(mat({ map: glaze, side: THREE.DoubleSide }), { grime: 0.15, bomb: 0 });
  mesh(new THREE.LatheGeometry([[0, 0], [R * 0.6, 0], [R * 0.85, H * 0.3], [R, H * 0.8], [R + 0.02, H], [R - 0.01, H + 0.012], [R - 0.025, H], [R * 0.82, H * 0.3], [R * 0.58, 0.02], [0, 0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 32), bowlM, X, TOP, Z, root);
  // the bed: river stones, weed
  const peb = T.surface(mat({ map: T.photo('stone_wall'), color: 0x9a948a }), { grime: 0.2 }); for (let i = 0; i < 14; i++) { const a = i * 2.39, d = 0.04 + (i % 5) * 0.045, s = mesh(new THREE.IcosahedronGeometry(0.018 + (i % 3) * 0.008, 0), peb, X + Math.cos(a) * d, TOP + 0.03, Z + Math.sin(a) * d, root); s.scale.y = 0.6; s.castShadow = false; }
  const weed = mat({ color: 0x3c6a2c, side: THREE.DoubleSide }), blades = [];
  for (let i = 0; i < 9; i++) { const h = 0.1 + (i % 4) * 0.03, g = new THREE.PlaneGeometry(0.014, h, 1, 4); g.translate(0, h / 2, 0); const a = i * 0.7 + 2, b = mesh(g, weed, X + Math.cos(a) * 0.17, TOP + 0.025, Z + Math.sin(a) * 0.17, root); b.rotation.y = i * 0.9; b.castShadow = false; blades.push(b); }
  // the water: a tinted body, its live surface (ripple.js) and the light that surface focuses on the bed
  const body = mesh(new THREE.CylinderGeometry(R - 0.03, R * 0.6, WATER - TOP - 0.02, 28), new THREE.MeshLambertMaterial({ color: 0x5a8a86, transparent: true, opacity: 0.22, depthWrite: false }), X, (WATER + TOP + 0.02) / 2, Z, root); body.castShadow = false; body.renderOrder = 2;
  const water = makeWater(R - 0.022, new THREE.MeshLambertMaterial({ color: 0x9ac0b8, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }), { n: 28, caustics: true, damp: 0.994 });
  water.mesh.position.set(X, WATER, Z); water.mesh.renderOrder = 2; root.add(water.mesh); water.mesh.material.alphaTest = 0.5; water.mesh.material.transparent = true;
  const ca = mesh(new THREE.CircleGeometry(R * 0.62, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: water.caustics, color: 0x6a9a90, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }), X, TOP + 0.024, Z, root); ca.castShadow = false;
  tank.water = water;
  // the pot of food at the stand's corner, nearest the cook, and the pinch it gives
  const potM = T.surface(mat({ color: 0x7a5232 }), { grime: 0.3 }), pot = new V3(X + 0.24, TOP + 0.05, Z - 0.24);
  cyl(0.035, 0.03, 0.06, potM, pot.x, TOP + 0.03, pot.z, root, 12); cyl(0.032, 0.032, 0.006, mat({ color: 0x8a6a3a }), pot.x, TOP + 0.058, pot.z, root, 12);
  const src = { pos: pot, r: 0.06, name: 'fish food (a pinch)', can: () => !tank.dead, take: () => new Pinch() }; G.sources.push(src);
  const over = new V3(X, WATER + 0.06, Z);
  G.targets.push({ getPos: () => over, r: R + 0.12, prio: 2, accepts: (it) => it.kind === 'pinch', receive: (it) => { it.remove(); tank.feed(); } });
  // the flakes on the water
  const fm = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat({ color: 0xa0602a }), 16); fm.count = 0; fm.castShadow = false; fm.frustumCulled = false; root.add(fm);
  tank.feed = (n = 6) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, d = Math.random() * 0.1, f = { x: X + Math.cos(a) * d, y: WATER, z: Z + Math.sin(a) * d, vx: 0, vy: 0, vz: 0, t: 0, soak: 2 + Math.random() * 4 }; tank.flakes.push(f); water.poke(f.x - X, f.z - Z, 0.0012, 0.02); } tank.flakes.splice(0, Math.max(0, tank.flakes.length - 16)); G.audio?.play('plop', over); G.talk?.seen?.('feed the goldfish'); };
  // the fish: Polyfork's koi, small and gilded into a goldfish
  const fish = { g: null, t: Math.random() * 10, x: X, z: Z, y: TOP + 0.1, vx: 0, vy: 0, vz: 0, yaw: 0, sw: null, wan: 0, scare: 0, goal: new V3(X, TOP + 0.1, Z), goalT: 0 }; tank.fish = fish;
  fetch('/sushi-assets/koi.json').then((r) => r.json()).then((d) => {
    const p = new Float32Array(B64(d.p).buffer), c = B64(d.c), n = c.length / 3, C = new Float32Array(n * 3), q = new THREE.Color(), gold = new THREE.Color(0xff7a18), pale = new THREE.Color(0xffd070);
    for (let i = 0; i < n; i++) { const l = (c[i * 3] + c[i * 3 + 1] + c[i * 3 + 2]) / 765; q.copy(gold).lerp(pale, l * 0.6); C[i * 3] = q.r; C[i * 3 + 1] = q.g; C[i * 3 + 2] = q.b; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.computeVertexNormals(); g.computeBoundingBox();
    const bb = g.boundingBox, L = bb.max.x - bb.min.x; g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), sw = { value: 0 };
    m.onBeforeCompile = (sh) => { sh.uniforms.uSw = sw; sh.vertexShader = 'uniform float uSw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { float w = clamp(0.5 - position.x / ${L.toFixed(4)}, 0., 1.); transformed.z += (0.012 + w * w * 0.08) * ${L.toFixed(4)} * sin(uSw + position.x / ${L.toFixed(4)} * 7.); }`); };
    m.customProgramCacheKey = () => 'goldfish';
    const k = new THREE.Mesh(g, m); k.scale.setScalar(0.09 / L); k.castShadow = false; k.userData.nopick = true; fish.sw = sw;
    fish.g = new THREE.Group(); fish.g.add(k); root.add(fish.g); tank.ready = true;
  }).catch(() => { });
  const _f = new V3(), _sl = new V3(), _hp = new V3(), seen = new Map();
  // the fish swims by its own forces: tail thrust toward where it wants to be, drag, the wall felt and turned from; it rises to food that is really sinking, darts from a splash or a hand; the flakes float, soak and sink, drifting with the ripples
  tank.update = (dt) => {
    const t = (fish.t += dt), K = G.clock, run = K && K.running ? (dt * K.speed) / K.run : 0; dt = Math.min(dt, 0.05);
    for (let i = 0; i < blades.length; i++) blades[i].rotation.z = Math.sin(t * 0.7 + i) * 0.08 + water.at(blades[i].position.x - X, blades[i].position.z - Z) * 20;
    if (!tank.dead) { tank.hunger = Math.min(1, tank.hunger + run / DEAD); if (tank.hunger >= 1) tank.dead = true; }
    // what enters the water: a dropped thing, a hand
    for (const it of G.items) { if (it.dead || it.kind === 'pinch') continue; const p = it.obj.position, inX = Math.hypot(p.x - X, p.z - Z) < R - 0.03, was = seen.get(it) ?? 9; seen.set(it, p.y); if (inX && was > WATER && p.y <= WATER + 0.02) { water.poke(p.x - X, p.z - Z, Math.min(0.006, 0.002 + Math.abs(it.vel.y) * 0.0015), 0.03); fish.scare = 1.2; G.audio?.play('plop', p); } }
    for (const h of G.hands || []) { if (!h.active && G.mode !== 'vr') continue; const hp = h.pos; if (Math.hypot(hp.x - X, hp.z - Z) < R - 0.03 && hp.y < WATER + 0.01 && hp.y > TOP) { const v = h.vs ? h.vs.length() : 0.5; if (Math.random() < dt * 20) water.poke(hp.x - X, hp.z - Z, Math.min(0.006, 0.0006 + v * 0.002), 0.025); if (v > 0.3) fish.scare = Math.max(fish.scare, 0.8); } }
    water.update(dt);
    let n = 0; for (let i = tank.flakes.length - 1; i >= 0; i--) { const f = tank.flakes[i]; f.t += dt; water.slope(f.x - X, f.z - Z, _sl);
      if (f.t < f.soak) { f.vx += -_sl.x * 2 * dt; f.vz += -_sl.z * 2 * dt; f.y = WATER + water.at(f.x - X, f.z - Z); }   // afloat: riding the surface, pushed down its slopes
      else { f.vy += (-0.012 - f.vy) * Math.min(1, dt * 3); f.y = Math.max(TOP + 0.035, f.y + f.vy * dt); }   // soaked through: sinking slowly, slowed by the water
      f.vx *= 1 - Math.min(1, dt * 1.5); f.vz *= 1 - Math.min(1, dt * 1.5); f.x += f.vx * dt; f.z += f.vz * dt; const rr = Math.hypot(f.x - X, f.z - Z); if (rr > R - 0.04) { f.x = X + (f.x - X) * (R - 0.04) / rr; f.z = Z + (f.z - Z) * (R - 0.04) / rr; }
      if (f.t > 70) { tank.flakes.splice(i, 1); continue; } }
    for (const f of tank.flakes) { _m.compose(_f.set(f.x, f.y, f.z), _q, _s.setScalar(0.005)); fm.setMatrixAt(n++, _m); } fm.count = n; fm.instanceMatrix.needsUpdate = true;
    if (!fish.g) return;
    const hungry = Math.max(0, (tank.hunger - HUNGRY) / (1 - HUNGRY)), vigor = tank.dead ? 0 : 1 - hungry * 0.75; fish.scare = Math.max(0, fish.scare - dt);
    const f = !tank.dead && fish.scare <= 0 && tank.flakes.reduce((b, q) => (!b || Math.hypot(q.x - fish.x, q.y - fish.y, q.z - fish.z) < Math.hypot(b.x - fish.x, b.y - fish.y, b.z - fish.z) ? q : b), null);
    if (f) fish.goal.set(f.x, f.y - 0.008, f.z);
    else if ((fish.goalT -= dt) <= 0 || fish.scare > 1) { fish.goalT = 3 + Math.random() * 4; const a = Math.random() * 6.28, d = Math.random() * (R - 0.1); fish.goal.set(X + Math.cos(a) * d, tank.dead ? WATER - 0.01 : TOP + 0.05 + (1 - hungry) * Math.random() * 0.1, Z + Math.sin(a) * d); }   // a new place to idle toward now and then: low when hungry
    const dx = fish.goal.x - fish.x, dy = fish.goal.y - fish.y, dz = fish.goal.z - fish.z, dist = Math.hypot(dx, dy, dz) || 1, want = tank.dead ? 0.01 : (f ? 0.16 : fish.scare > 0 ? 0.3 : 0.05) * Math.max(0.25, vigor);
    let ax = (dx / dist) * want * 2.5, ay = (dy / dist) * want * 2.5, az = (dz / dist) * want * 2.5;
    const rr = Math.hypot(fish.x - X, fish.z - Z), wall = R - 0.06; if (rr > wall - 0.05) { const k = (rr - (wall - 0.05)) * 40; ax -= ((fish.x - X) / rr) * k; az -= ((fish.z - Z) / rr) * k; }   // the wall, felt before it is reached
    if (fish.scare > 0.9) { ax += Math.cos(fish.yaw) * 1.5; az -= Math.sin(fish.yaw) * 1.5; }   // the dart
    const drag = 3; fish.vx += (ax - fish.vx * drag) * dt; fish.vy += (ay - fish.vy * drag) * dt; fish.vz += (az - fish.vz * drag) * dt;
    fish.x += fish.vx * dt; fish.y = Math.min(WATER - 0.008, Math.max(TOP + 0.04, fish.y + fish.vy * dt)); fish.z += fish.vz * dt;
    const v = Math.hypot(fish.vx, fish.vz); if (v > 0.004) { const yaw = Math.atan2(-fish.vz, fish.vx); let dd = yaw - fish.yaw; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); fish.yaw += dd * Math.min(1, dt * 5); }
    if (f && Math.hypot(f.x - fish.x, f.y - fish.y, f.z - fish.z) < 0.022) { tank.flakes.splice(tank.flakes.indexOf(f), 1); tank.hunger = Math.max(0, tank.hunger - 0.12); tank.fed++; if (f.y > WATER - 0.02) water.poke(f.x - X, f.z - Z, 0.002, 0.02); }   // a snap at the surface rings it
    fish.g.position.set(fish.x, fish.y, fish.z); fish.g.rotation.set(tank.dead ? Math.PI : 0, fish.yaw, 0); fish.sw.value += dt * (3 + Math.hypot(v, fish.vy) * 60);   // the body's wave runs with its speed
  };
  tank.state = () => (tank.dead ? 'dead' : tank.hunger > HUNGRY + 0.25 ? 'sulking' : tank.hunger > HUNGRY ? 'hungry' : 'fed');
  G.clock?.on('reset', () => { tank.hunger = 0.12; tank.dead = false; tank.flakes.length = 0; tank.fed = 0; });
  G.tank = tank; return tank;
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
