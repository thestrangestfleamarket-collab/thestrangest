// DEAD END's alley: the walls, the wet ground, the lamps, the rain, the false street beyond the gate, and the twenty places to hide, each a real thing with weight
import { THREE, RAPIER, LOW, G, ALL, grp, clamp, rnd, scene, P, mat, wbox, boxMesh, quat, stat, dyn, sBox, sCyl, sBall, model } from './core.js';
import { makeCloth } from './cloth.js';

const W = 2.6, LEN = 34, HI = 11;
const GEO = {   // where the thing stands to look (at), what it looks at (look), and where its eyes go when it searches properly (eye)
  bins: { at: [.4, -3.1], look: [2.15, .5, -3.1], eye: [1.9, 1.5, -4.3] }, dumpster1: { at: [-.75, -6.5], look: [-1.95, .5, -6.5], eye: [-1.55, 1.75, -6.5] },
  fridgebox: { at: [.9, -9.6], look: [1.9, .4, -8], eye: [1.9, .45, -9.4] }, boxes: { at: [.2, -10.7], look: [2.15, .5, -10.7], eye: [2.15, 1.4, -11.85] },
  pallets: { at: [-.5, -11.9], look: [-2.2, .4, -11.9], eye: [-2.2, .5, -13.25] }, doorway: { at: [.6, -13.5], look: [3.05, 1, -13.5], eye: [2.3, 1.6, -13.5] },
  blankets: { at: [-.1, -14.9], look: [-1.55, .2, -14.85], eye: [-.9, 1.5, -14.9] }, sofa: { at: [-.3, -16.9], look: [-2.27, .35, -16.9], eye: [-2.27, 1.3, -18.15] },
  car: { at: [-.55, -21.9], look: [2.33, .5, -19.2], eye: [2.33, 1.2, -21.6] }, stairwell: { at: [-.75, -18.2], look: [-2.05, -.8, -20.8], eye: [-2.05, .5, -18.8] },
  tyres: { at: [.3, -22.7], look: [2.2, .5, -22.65], eye: [2.25, 1.3, -23.7] }, barrels: { at: [-.4, -23.6], look: [-2.2, .5, -23.6], eye: [-2.3, 1.4, -24.6] },
  locker: { at: [.5, -25.1], look: [2.2, 1, -25], eye: [1.5, 1.6, -25.2] }, tarp: { at: [-.9, -27.7], look: [-2.15, .4, -26.5], eye: [-2.15, .45, -27.5] },
  plywood: { at: [.7, -27], look: [2.25, .4, -27], eye: [2.25, .5, -25.72] }, crates: { at: [-.3, -28.6], look: [-2.25, .5, -28.6], eye: [-2.25, 1.4, -27.8] },
  trashbags: { at: [.4, -29], look: [2.25, .4, -29.1], eye: [2.15, 1.55, -28.5] }, dumpster2: { at: [.75, -30.6], look: [1.95, .5, -30.6], eye: [1.55, 1.75, -30.6] },
  shutter: { at: [-1.5, -31.2], look: [-3.7, .4, -31.2], eye: [-2.97, .45, -31.2] }, mattress: { at: [0, -32.5], look: [0, .4, -33.6], eye: [-1.2, .6, -33.62] } };
const WORLD = { W, LEN, GEO, cloth: null, puddles: [], lamps: [], blocked: [[-2.6, -1.3, -21.85, -18.45]], updaters: [], gate: null, rain: null, lit: null, wallLamp: null };

function canvasTex(w, h, draw, o = {}) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (o.rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = 4; return t; }
const speck = (g, w, h, n, col, a, s = 2) => { for (let i = 0; i < n; i++) { g.fillStyle = col; g.globalAlpha = Math.random() * a; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * s, 1 + Math.random() * s); } g.globalAlpha = 1; };

function build() {
  const brickA = mat('red_brick_03', { tile: 1.15, color: 0x8c8782 }), brickB = mat('dark_brick_wall', { tile: 1.2, color: 0xa09a94 }), asphalt = mat('asphalt_02', { tile: 3, rough: .62, color: 0x6e6e72, env: 2.2 }), conc = mat('dirty_concrete', { tile: 2.4, color: 0x77746f }),
    green = mat('green_metal_rust', { tile: 1.4, metal: true, color: 0x9aa59a }), rust = mat('rusty_metal_02', { tile: 1.3, metal: true, color: 0x9a9a9a }), corr = mat('corrugated_iron_02', { tile: 1.1, metal: true, color: 0x8d8f92 }), wood = mat('weathered_planks', { tile: 1.1, color: 0x9a9088 }),
    carpet = mat('dirty_carpet', { tile: 1, side: THREE.DoubleSide, color: 0xc9c0b0 }), hess = mat('hessian_230', { tile: .8, side: THREE.DoubleSide, color: 0x3d4a40 }), dark = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .9 }), iron = new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: .55, metalness: .8 });
  const card = new THREE.MeshStandardMaterial({ roughness: .92, map: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#7d623f'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 5) { g.fillStyle = 'rgba(0,0,0,' + (.03 + Math.random() * .05) + ')'; g.fillRect(x, 0, 2, h); }
    for (let i = 0; i < 26; i++) { const r = 20 + Math.random() * 90, x = Math.random() * w, y = Math.random() * h, gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(30,20,10,.5)'); gr.addColorStop(1, 'rgba(30,20,10,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    g.fillStyle = 'rgba(160,140,100,.5)'; g.fillRect(0, 240, w, 26); g.fillStyle = 'rgba(15,10,5,.7)'; g.font = 'bold 44px sans-serif'; g.fillText('THIS SIDE UP', 90, 150); g.fillText('FRAGILE', 240, 420); speck(g, w, h, 3000, '#000', .2); }, { rep: 1 }) }); card.userData.tile = 1.4;
  const ticking = new THREE.MeshStandardMaterial({ roughness: .95, map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9a917d'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = '#4d5560'; g.fillRect(x, 0, 3, h); }
    for (let i = 0; i < 12; i++) { const r = 20 + Math.random() * 60, x = Math.random() * w, y = Math.random() * h, gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(60,40,15,.55)'); gr.addColorStop(1, 'rgba(60,40,15,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } }, { rep: 1 }) }); ticking.userData.tile = 1;

  /* the ground: one sheet of wet asphalt, cut where the cellar steps go down */
  stat(4.1, 2, LEN + 12.2, .55, -1, -LEN / 2 + 5.9, asphalt); stat(1.1, 2, 28.6, -2.05, -1, -4.3, asphalt); stat(1.1, 2, 12.6, -2.05, -1, -27.9, asphalt);
  stat(12, .16, 3.2, 0, .08, 1.9, conc, { ghost: true });   // the pavement outside the gate
  for (let i = 0; i < 5; i++) { const h = 1.3 - (i + 1) * 1.3 / 6; stat(1.1, h, .3, -2.05, -1.3 + h / 2, -18.75 - i * .3, conc, { ghost: true }); }   // steps to see, a slope to walk
  stat(1.1, .2, 2.22, -2.05, -.731, -19.44, null, { rx: -.626 });
  stat(1.1, .1, 1.5, -2.05, -1.35, -20.85, conc); stat(1.1, .05, 1.0, -2.05, .03, -21.1, corr, { rz: .03 });   // the landing, and the iron sheet over half of it
  const door = (x, y, z, ry) => { const d = boxMesh(.92, 2.05, .06, rust); d.position.set(x, y, z); d.rotation.y = ry; scene.add(d); const k = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), iron); k.position.set(.36, 0, .05); d.add(k); return d; };
  door(-2.05, -.28, -21.57, 0).scale.set(1, .98, 1);
  for (const [x0, z0, x1, z1] of [[-1.5, -18.95, -1.5, -21.6], [-1.5, -21.6, -2.6, -21.6]]) { const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0);   // the rail round the stairwell
    stat(.05, .95, len, (x0 + x1) / 2, .475, (z0 + z1) / 2, null, { ry, see: true }); for (const y of [.5, .93]) { const r = boxMesh(.04, .04, len, iron); r.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.y = ry; scene.add(r); }
    for (let i = 0; i <= Math.round(len / .55); i++) { const t = i / Math.round(len / .55), p = boxMesh(.035, .95, .035, iron); p.position.set(x0 + (x1 - x0) * t, .475, z0 + (z1 - z0) * t); scene.add(p); } }

  /* the walls: two buildings and a dead end, 11 m of brick; a door alcove on the right, a loading bay on the left */
  const T = .2, wl = (z0, z1, y0, y1, side, m) => stat(T, y1 - y0, Math.abs(z1 - z0), side * (W + T / 2), (y0 + y1) / 2, (z0 + z1) / 2, m);
  wl(2.6, -30.4, 0, HI, -1, brickA); wl(-32, -34.2, 0, HI, -1, brickA); wl(-30.4, -32, 2.5, HI, -1, brickA);
  wl(2.6, -12.9, 0, HI, 1, brickB); wl(-14.1, -34.2, 0, HI, 1, brickB); wl(-12.9, -14.1, 2.3, HI, 1, brickB);
  stat(2 * W + 2 * T, HI, T, 0, HI / 2, -LEN - T / 2, brickA);
  stat(.9, 2.3, T, 3.05, 1.15, -12.8, brickB); stat(.9, 2.3, T, 3.05, 1.15, -14.2, brickB); stat(T, 2.5, 1.6, 3.6, 1.25, -13.5, brickB); stat(1.1, T, 1.6, 3.15, 2.4, -13.5, conc); stat(.9, .1, 1.2, 3.05, -.05, -13.5, conc); door(3.47, 1.03, -13.5, -Math.PI / 2);
  stat(2.1, .2, 3.4, -3.75, -.1, -31.2, conc); stat(T, 2.8, 3.4, -4.8, 1.3, -31.2, conc); stat(2.1, 2.8, T, -3.75, 1.3, -29.6, conc); stat(2.1, 2.8, T, -3.75, 1.3, -32.8, conc); stat(2.1, T, 3.4, -3.75, 2.7, -31.2, conc);
  stat(.06, 1.75, 1.6, -2.7, 1.625, -31.2, corr); const lip = boxMesh(.09, .07, 1.6, iron); lip.position.set(-2.7, .76, -31.2); scene.add(lip);
  // the lit and unlit windows high up, the pipes, the wires: the city goes on above you
  const winT = canvasTex(64, 96, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e9b96a'); gr.addColorStop(1, '#8a5a22'); g.fillStyle = gr; g.fillRect(5, 5, w - 10, h - 10); g.fillStyle = 'rgba(40,20,5,.55)'; g.fillRect(5, 5, 20, h - 10); g.fillRect(w - 22, 5, 17, h - 10); g.fillStyle = '#111'; g.fillRect(w / 2 - 2, 0, 4, h); g.fillRect(0, h / 2 - 2, w, 4); });
  const winG = new THREE.PlaneGeometry(.95, 1.5), lit = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: winT, emissiveIntensity: 1.3 }), unlit = new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: .15, metalness: .6 }), wins = [[], []];
  for (const side of [-1, 1]) for (let fl = 0; fl < 3; fl++) for (let z = -2; z > -33; z -= 3.1) { if (side > 0 && fl === 0 && z < -11 && z > -15.5) continue; wins[Math.random() < .14 ? 0 : 1].push([side * (W - .012), 3.7 + fl * 2.7, z + rnd(-.3, .3), -side * Math.PI / 2]); }
  wins.forEach((L, i) => { const im = new THREE.InstancedMesh(winG, i ? unlit : lit, L.length), o = new THREE.Object3D(); L.forEach((w, k) => { o.position.set(w[0], w[1], w[2]); o.rotation.y = w[3]; o.updateMatrix(); im.setMatrixAt(k, o.matrix); }); scene.add(im); });
  const pipe = (x, z, h, r = .055) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), iron); m.position.set(x, h / 2, z); m.castShadow = true; scene.add(m); };
  pipe(-W + .09, -4.6, HI); pipe(W - .09, -16.2, HI); pipe(W - .09, -24.1, HI, .04); pipe(-W + .09, -25.2, HI);
  for (const [z, y] of [[-5, 7.5], [-13, 8.6], [-21, 7.1], [-28, 9]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 2 * W, 4), dark); c.rotation.z = Math.PI / 2 + rnd(-.06, .06); c.position.set(0, y, z); scene.add(c); }
  for (const [z, y] of [[-9.5, 3.1], [-20, 5.6]]) { const a = model('exterior_aircon_unit', { long: 1.9, noShadow: true }); a.position.set(W - .32, y, z); a.rotation.y = -Math.PI / 2; scene.add(a); }
  const ub = model('utility_box_01', { h: 1.5 }); ub.position.set(W - .22, 0, -15.3); ub.rotation.y = -Math.PI / 2; scene.add(ub); stat(.4, 1.5, .8, W - .2, .75, -15.3, null);

  /* the gate you came through, wire on iron; the thing opens it when the minute is up */
  const wire = canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#8d9499'; g.lineWidth = 5; for (let i = -1; i < 3; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i * 64 + 128, 0); g.lineTo(i * 64, 128); g.stroke(); } }, { rep: 1 });
  wire.colorSpace = THREE.SRGBColorSpace; const wireM = new THREE.MeshStandardMaterial({ map: wire, alphaTest: .4, side: THREE.DoubleSide, metalness: .7, roughness: .5 });
  const gate = { leaves: [], a: 0, to: 0 };
  for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * W, 0, 0); scene.add(piv); const pg = new THREE.PlaneGeometry(W, 2.7), uv = pg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 22, uv.getY(i) * 23);
    const m = new THREE.Mesh(pg, wireM); m.position.set(-s * W / 2, 1.4, 0); piv.add(m); for (const [w, h, x, y] of [[W, .05, -s * W / 2, .06], [W, .05, -s * W / 2, 2.75], [.05, 2.75, -s * .03, 1.4], [.05, 2.75, -s * (W - .03), 1.4]]) { const b = boxMesh(w, h, .05, iron); b.position.set(x, y, 0); piv.add(b); } gate.leaves.push([piv, s]); }
  WORLD.gate = gate; WORLD.updaters.push(dt => { gate.a += clamp(gate.to - gate.a, -dt * .55, dt * .55); for (const [p, s] of gate.leaves) p.rotation.y = s * gate.a * 1.35; });
  P.world.createCollider(RAPIER.ColliderDesc.cuboid(W, 3, .05).setTranslation(0, 3, .3).setCollisionGroups(grp(G.SEE, G.PLAYER | G.SOLID)));

  /* beyond the gate nothing is real, but it is built and lit like the rest: the house fronts across a street, a street lamp, headlights that pass */
  const glowT = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }); WORLD.glowT = glowT;
  const glow = (c, k) => new THREE.MeshStandardMaterial({ color: 0, emissive: c, emissiveIntensity: k }), bulbG = new THREE.SphereGeometry(.05, 10, 8);   // a bulb is the one thing that shines by itself
  stat(60, 17, .4, 0, 8.5, 13.2, brickA, { ghost: true, noShadow: true }); stat(19, HI, .3, -12.3, HI / 2, 2.6, brickA, { ghost: true }); stat(19, HI, .3, 12.3, HI / 2, 2.6, brickB, { ghost: true }); stat(60, .16, 2.4, 0, .08, 11.9, conc, { ghost: true, noShadow: true });
  { const sw = [[], []]; for (let fl = 0; fl < 5; fl++) for (let x = -19; x < 19; x += 2.4) sw[Math.random() < .16 ? 0 : 1].push([x + rnd(-.2, .2), 2.2 + fl * 2.9, 12.98, Math.PI]);
    sw.forEach((Lw, i) => { const im = new THREE.InstancedMesh(winG, i ? unlit : lit, Lw.length), o = new THREE.Object3D(); Lw.forEach((w, k) => { o.position.set(w[0], w[1], w[2]); o.rotation.y = w[3]; o.scale.set(1.2, 1.2, 1); o.updateMatrix(); im.setMatrixAt(k, o.matrix); }); scene.add(im); }); }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 7, 8), iron); pole.position.set(3.9, 3.5, 7.6); scene.add(pole); const arm = boxMesh(1, .08, .08, iron); arm.position.set(3.45, 7, 7.6); scene.add(arm); const stB = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), glow(0xe8ecf5, 9)); stB.position.set(3, 6.93, 7.6); scene.add(stB);
  const car = new THREE.Group(); for (const x of [-.6, .6]) { const s = new THREE.Mesh(bulbG, glow(0xeef2ff, 12)); s.position.set(x, .7, 0); car.add(s); } const carBody = boxMesh(1.7, 1.2, 4, dark); carBody.position.set(0, .7, 0); carBody.rotation.y = Math.PI / 2; car.add(carBody);
  car.position.set(-30, 0, 7); scene.add(car); const carL = new THREE.SpotLight(0xe6e9f0, 0, 22, .6, .7, 1.8); carL.position.set(1, .8, 0); carL.target.position.set(12, 0, -1); car.add(carL, carL.target);
  let carT = 6; WORLD.updaters.push(dt => { carT -= dt; if (carT < 0) { carT = rnd(14, 34); car.userData.dir = Math.random() < .5 ? 1 : -1; car.rotation.y = car.userData.dir > 0 ? 0 : Math.PI; car.position.x = -26 * car.userData.dir; car.userData.on = true; }
    if (car.userData.on) { car.position.x += car.userData.dir * 13 * dt; carL.intensity = 160 * clamp(1 - Math.abs(car.position.x) / 16, 0, 1); if (Math.abs(car.position.x) > 27) car.userData.on = false; } });

  /* light: every one a lamp you can find. A sodium lamp over the dumpster, a dying lamp that swings by the door, the street lamp beyond the gate, a bulkhead lamp at the far end, the lit windows; and the storm */
  const sky = new THREE.HemisphereLight(0x1a2130, 0x000000, .15); scene.add(sky);
  const sod = new THREE.SpotLight(0xffc592, 150, 19, 1.0, .7, 1.8); sod.position.set(-W + .55, 5.6, -8.2); sod.target.position.set(-.3, 0, -8.6); sod.castShadow = true; sod.shadow.mapSize.setScalar(LOW ? 512 : 1024); sod.shadow.camera.near = .5; sod.shadow.camera.far = 14; sod.shadow.bias = -.0015; sod.shadow.normalBias = .03; scene.add(sod, sod.target);
  const head = model('security_light', { long: .5, noShadow: true }); head.position.set(-W + .28, 5.5, -8.2); head.rotation.y = Math.PI / 2; scene.add(head);
  const bulb = new THREE.Mesh(bulbG, glow(0xffc592, 14)); bulb.scale.setScalar(1.6); bulb.position.set(-W + .55, 5.5, -8.2); scene.add(bulb);
  const wlm = model('industrial_wall_lamp', { long: .42, noShadow: true }); wlm.position.set(W - .14, 2.75, -13.5); wlm.rotation.y = -Math.PI / 2; scene.add(wlm);
  const dl = new THREE.SpotLight(0xffe9c4, 34, 10, 1.25, .8, 1.8); dl.position.set(W - .3, 2.72, -13.5); dl.target.position.set(.6, 0, -13.5); if (!LOW) { dl.castShadow = true; dl.shadow.mapSize.setScalar(512); dl.shadow.camera.near = .2; dl.shadow.camera.far = 9; dl.shadow.bias = -.002; dl.shadow.normalBias = .03; } scene.add(dl, dl.target); const dB = new THREE.Mesh(bulbG, glow(0xffe9c4, 10)); dB.position.copy(dl.position); scene.add(dB);
  const far = new THREE.PointLight(0xcdd6e2, 9, 11, 1.8); far.position.set(-W + .4, 2.85, -29.2); scene.add(far); const fm = model('industrial_wall_lamp', { long: .36, noShadow: true }); fm.position.set(-W + .13, 2.9, -29.2); fm.rotation.y = Math.PI / 2; scene.add(fm); const fB = new THREE.Mesh(bulbG, glow(0xcdd6e2, 5)); fB.position.set(-W + .2, 2.88, -29.2); scene.add(fB);
  const mid = new THREE.PointLight(0xe8dcc4, 7, 10, 1.8); mid.position.set(W - .4, 3.1, -21.6); scene.add(mid); const mm = model('industrial_wall_lamp', { long: .36, noShadow: true }); mm.position.set(W - .13, 3.15, -21.6); mm.rotation.y = -Math.PI / 2; scene.add(mm); const mB = new THREE.Mesh(bulbG, glow(0xe8dcc4, 5)); mB.position.set(W - .2, 3.13, -21.6); scene.add(mB);
  // the lamps falter when it is near them (WORLD.dread, 0 to 1, set by the round), and the door's lamp swings on its bracket so the shadows move
  let fl = 1, flT = 0, sf = 1, sfT = 3, sw = 0; WORLD.updaters.push(dt => { const dr = WORLD.dread || 0; flT -= dt; if (flT < 0) { flT = Math.random() < .2 + dr * .5 ? rnd(.03, .12) : rnd(.2, 2.6 - dr * 2); fl = Math.random() < .3 + dr * .4 ? rnd(0, .25) : 1; }
    sfT -= dt; if (sfT < 0) { const dip = Math.random() < .12 + dr * .5; sfT = dip ? rnd(.04, .18) : rnd(.6, 5 - dr * 4); sf = dip ? rnd(.15, .6) : 1; }
    sw += dt; const a = Math.sin(sw * 1.9) * .1 + Math.sin(sw * .7) * .05; dl.position.set(W - .3, 2.72, -13.5 + a); dB.position.copy(dl.position); dl.intensity = 34 * fl * (.92 + Math.random() * .08); dB.material.emissiveIntensity = 10 * fl; WORLD.wallLamp = fl;
    sod.intensity = 150 * sf; bulb.material.emissiveIntensity = 14 * sf; WORLD.sodium = sf; bolt.intensity = (WORLD.flash || 0) * 2.2; sky.intensity = .15 + (WORLD.flash || 0) * .5; });
  const stL = new THREE.SpotLight(0xd9dde6, 120, 24, .7, .9, 1.8); stL.position.set(3, 6.9, 7.6); stL.target.position.set(-.6, 0, -3); if (!LOW) { stL.castShadow = true; stL.shadow.mapSize.setScalar(512); stL.shadow.camera.near = 1; stL.shadow.camera.far = 24; stL.shadow.bias = -.002; stL.shadow.normalBias = .04; } scene.add(stL, stL.target);
  const bolt = new THREE.DirectionalLight(0xc8d4ff, 0); bolt.position.set(4, 30, -10); bolt.target.position.set(0, 0, -17); scene.add(bolt, bolt.target);
  for (const w of wins[0].filter(w => w[1] < 7).slice(0, LOW ? 1 : 3)) { const s = new THREE.SpotLight(0xf0c078, 14, 11, .85, .9, 1.8), side = Math.sign(w[0]); s.position.set(w[0] - side * .1, w[1], w[2]); s.target.position.set(-side * W, w[1] - 3.2, w[2]); scene.add(s, s.target); }
  WORLD.lamps = [{ x: -.3, z: -8.5, r: 5.2, k: 1, sod: true }, { x: 2, z: -13.5, r: 3.6, k: .7, flick: true }, { x: 0, z: 1.5, r: 5.5, k: .6 }, { x: -2, z: -29.2, r: 3.2, k: .3 }, { x: 2, z: -21.6, r: 3, k: .28 }];
  // how brightly a place on the ground is lit, 0 (black) to 1 (under the lamp): the thing sees you sooner in the light
  WORLD.lit = (x, z) => { let v = .04; for (const l of WORLD.lamps) v = Math.max(v, l.k * (l.flick ? (WORLD.wallLamp ?? 1) : l.sod ? (WORLD.sodium ?? 1) : 1) * clamp(1 - Math.hypot(x - l.x, z - l.z) / l.r, 0, 1)); return v; };

  /* puddles: flat water that throws the lamps back at you, and wets your soles */
  const pm = new THREE.MeshStandardMaterial({ color: 0x06080a, roughness: .03, metalness: 0, transparent: true, opacity: .6, envMapIntensity: 9, depthWrite: false });
  for (const [x, z, r] of [[-.4, -8.2, 1.15], [.9, -5, .7], [-.9, -12.6, .6], [.3, -15.4, .95], [-.6, -17.4, .5], [-.5, -24.6, .9], [.6, -26.2, .55], [0, -30.3, 1.1], [.3, -1.4, .8], [-1.2, -32.6, .6]]) {
    const g = new THREE.CircleGeometry(r, 22), p = g.attributes.position; for (let i = 1; i < p.count; i++) { const a = i / 22 * 6.283, k = 1 + .16 * Math.sin(a * 2 + x) + .09 * Math.sin(a * 3 + z); p.setXY(i, p.getX(i) * k, p.getY(i) * k * .8); }
    const m = new THREE.Mesh(g, pm); m.rotation.x = -Math.PI / 2; m.rotation.z = rnd(6); m.position.set(x, .006, z); m.receiveShadow = true; m.renderOrder = 1; scene.add(m); WORLD.puddles.push({ x, z, r: r * .85 }); }

  /* rain: streaks that fall through the lamps' light, cheap */
  const N = LOW ? 700 : 1600, rg = new THREE.BufferGeometry(), rp = new Float32Array(N * 6), rs = new Float32Array(N * 2); for (let i = 0; i < N; i++) { const x = rnd(-W, W), y = rnd(0, 9), z = rnd(4, -LEN); rp.set([x, y, z, x, y, z], i * 6); rs[i * 2] = 0; rs[i * 2 + 1] = 1; }
  rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('end', new THREE.BufferAttribute(rs, 1));
  const rm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, lamp: { value: new THREE.Vector3(-1.2, 3.2, -8.3) }, torch: { value: new THREE.Vector3(0, -50, 0) } },
    vertexShader: 'attribute float end;uniform float t;uniform vec3 lamp;uniform vec3 torch;varying float a;void main(){vec3 p=position;float sp=7.5+fract(p.x*13.7+p.z*7.3)*3.;p.y=mod(p.y-t*sp,9.)+end*.17;p.x+=end*.012;float d=distance(p,lamp),e=distance(p,torch);a=(.05+.75*exp(-d*d*.06)+.55*exp(-e*e*.16))*(1.-end*.6);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
    fragmentShader: 'varying float a;void main(){gl_FragColor=vec4(vec3(.85,.8,.72)*a,a);}' });
  const rain = new THREE.LineSegments(rg, rm); rain.frustumCulled = false; scene.add(rain); WORLD.rain = rm; WORLD.updaters.push(dt => { rm.uniforms.t.value += dt; });

  /* ───────── the twenty places ───────── */
  const lid = (id, hx, hy, hz, axis, a0, open, w, h, d, ox, oy, oz, m, mass) => {   // a hinged leaf on a fixed frame: a dumpster's lid, a locker's door
    const mesh = boxMesh(w, h, d, m), holder = new THREE.Group(); mesh.position.set(ox, oy, oz); holder.add(mesh);
    const q0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), a0), Tn = dyn(holder, [sBox(w, h, d, ox, oy, oz)], { x: hx, y: hy, z: hz, mass, kind: 'lid', spot: id, name: 'lid', ad: 1.2 }); Tn.b.setRotation(q0, true); Tn.home.q = { x: q0.x, y: q0.y, z: q0.z, w: q0.w };
    const j = P.world.createImpulseJoint(RAPIER.JointData.revolute({ x: hx, y: hy, z: hz }, { x: 0, y: 0, z: 0 }, { x: axis[0], y: axis[1], z: axis[2] }), P.anchor, Tn.b, true); j.setLimits(0, open + .1);
    const L = { T: Tn, j, axis, open, was: a0 > .35, want: a0 > .35, a0, home() { L.want = L.was; j.configureMotorPosition(a0, 38, 8.5); Tn.b.wakeUp(); }, set(v) { L.want = v; j.configureMotorPosition(v ? open : 0, 38, 8.5); Tn.b.wakeUp(); }, angle() { const q = Tn.b.rotation(); return 2 * Math.atan2(q.x * axis[0] + q.y * axis[1] + q.z * axis[2], q.w); }, isOpen() { return L.angle() > .35; } };
    j.configureMotorPosition(a0, 38, 8.5); Tn.lid = L; P.lids[id] = L; return L; };
  const dumpster = (id, side, cz, open) => { const cx = side * 1.95, m = green;   // steel, 1.9 long, 1.2 high, hollow; side -1 is the left wall
    stat(1.15, .06, 1.9, cx, .15, cz, m, { kind: 'metal' }); stat(.04, 1.05, 1.9, cx - side * .555, .675, cz, m, { kind: 'metal' }); stat(.04, 1.05, 1.9, cx + side * .555, .675, cz, m, { kind: 'metal' }); stat(1.15, 1.05, .04, cx, .675, cz + .93, m, { kind: 'metal' }); stat(1.15, 1.05, .04, cx, .675, cz - .93, m, { kind: 'metal' });
    for (const dz of [-.7, .7]) for (const dx of [-.4, .4]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .05, 10), dark); wh.rotation.x = Math.PI / 2; wh.position.set(cx + dx, .07, cz + dz); scene.add(wh); }
    for (const dz of [-.96, .96]) { const b = boxMesh(.5, .06, .05, iron); b.position.set(cx, .95, cz + dz); scene.add(b); }
    lid(id, cx + side * .585, 1.215, cz, [0, 0, -side], open ? 1.68 : 0, 1.68, 1.19, .03, 1.94, -side * .595, 0, 0, m, 13); };
  dumpster('dumpster1', -1, -6.5, true); dumpster('dumpster2', 1, -30.6, false);

  const prop = (name, o) => { const g = model(name, o), s = g.userData.size, sh = o.cyl ? [sCyl(o.cyl === true ? Math.max(s.x, s.z) / 2 * .92 : o.cyl, s.y, 0, s.y / 2, 0)] : o.ball ? [sBall(o.ball, 0, o.ball, 0)] : [sBox(s.x * .96, s.y * .98, s.z * .96, 0, s.y / 2, 0)]; return dyn(g, sh, o); };
  for (const [x, z, ry] of [[1.5, -2.45, .3], [1.38, -3.1, 2], [1.55, -3.75, 4.1]]) prop('metal_trash_can', { h: .98, x, y: .01, z, ry, mass: 7, kind: 'metal', spot: 'bins', name: 'a trash can', cyl: .27, fr: .6, asleep: true });
  prop('trashbag', { h: .55, x: 1.0, y: .02, z: -3.9, mass: 3, kind: 'soft', spot: 'bins', name: 'a trash bag', ball: .27, ld: 1.5, ad: 3, asleep: true });

  { // the refrigerator carton: light, hollow, open at its far end
    const g = new THREE.Group(), w = .86, len = 1.9, t = .025, parts = [[w, t, len, 0, t / 2, 0], [w, t, len, 0, w - t / 2, 0], [t, w, len, -w / 2 + t / 2, w / 2, 0], [t, w, len, w / 2 - t / 2, w / 2, 0], [w, w, t, 0, w / 2, len / 2 - t / 2]];
    for (const [a, b, c, x, y, z] of parts) { const m = boxMesh(a, b, c, card); m.position.set(x, y, z); g.add(m); } for (const s of [-1, 1]) { const f = boxMesh(t, w * .98, .4, card); f.position.set(s * (w / 2 + .12), w / 2, -len / 2 - .12); f.rotation.y = s * .7; g.add(f); }
    dyn(g, parts.map(p => sBox(...p)), { x: 1.92, y: .01, z: -8.05, ry: .04, mass: 8, kind: 'card', spot: 'fridgebox', name: 'the carton', ld: 2.2, ad: 3.5, fr: 1, asleep: true }); }
  for (const [x, y, z, ry, k] of [[1.35, 0, -10.1, .1, .62], [1.3, 0, -10.75, -.15, .66], [1.36, 0, -11.4, .2, .6], [1.36, .5, -10.4, .5, .56], [1.34, .52, -11.1, -.3, .58], [1.4, .98, -10.75, .2, .5], [.75, 0, -11.2, 1, .45]])
    prop('cardboard_box_01', { long: k, x, y: y + .01, z, ry, mass: 1.4 + k * 2, kind: 'card', spot: 'boxes', name: 'a box', fr: .9, ld: .6, ad: 1.5, asleep: true });

  const pallet = (x, y, z, o) => { const g = new THREE.Group(), sh = []; const add = (w, h, d, px, py, pz) => { const m = boxMesh(w, h, d, wood); m.position.set(px, py, pz); g.add(m); sh.push(sBox(w, h, d, px, py, pz)); };   // slats with gaps: you can be seen between them
    for (let i = 0; i < 6; i++) add(1.2, .022, .1, 0, .061, -.575 + i * .23); for (const px of [-.55, 0, .55]) add(.09, .1, 1.25, px, 0, 0); for (const pz of [-.575, 0, .575]) add(1.2, .022, .1, 0, -.061, pz);
    return dyn(g, sh, { x, y, z, mass: 17, kind: 'wood', spot: 'pallets', name: 'a pallet', fr: 1.1, asleep: true, ...o }); };
  pallet(-2.18, .6, -11.5, { ry: Math.PI / 2, rx: 1.0 }); pallet(-2.17, .6, -12.75, { ry: Math.PI / 2 + .03, rx: 1.02 }); pallet(-1.2, .075, -10.3, { ry: .3 });

  WORLD.cloth = makeCloth(16, 15, 2.1, 1.95, -2.5, -13.9, carpet);
  stat(1.5, .05, .6, -1.7, .025, -15.45, card, { ghost: true, noShadow: true });

  { const g = model('sofa_02', { long: 2.05 }), s = g.userData.size, deep = Math.min(s.x, s.z), inner = g.children[0]; if (s.x > s.z) inner.rotation.y = Math.PI / 2;   // long side along the alley, its back to the wall
    dyn(g, [sBox(deep * .95, .42, 2, 0, .21, 0), sBox(.22, s.y - .42, 2, -deep / 2 + .13, .42 + (s.y - .42) / 2, 0)], { x: -1.5, y: .01, z: -16.9, ry: .06, mass: 48, kind: 'soft', spot: 'sofa', name: 'the sofa', fr: 1.1, ld: 1, ad: 2, asleep: true }); }

  { const g = model('covered_car', { long: 4.3 }), s = g.userData.size, inner = g.children[0]; if (s.x > s.z) inner.rotation.y = Math.PI / 2; g.position.set(1.15, 0, -19.15); scene.add(g); const wd = Math.min(s.x, s.z);
    stat(wd * .92, s.y * .6, 4.15, 1.15, s.y * .3, -19.15, null, { kind: 'soft' }); stat(wd * .8, s.y * .4, 2.2, 1.15, s.y * .8, -19.3, null, { kind: 'soft' }); }

  for (const [x, z, n] of [[1.45, -22.3, 5], [1.5, -23.0, 4]]) for (let i = 0; i < n; i++) { const g = model('old_tyre', { long: .66, mid: true }), s = g.userData.size, inner = g.children[0]; if (s.y > s.x * .9) inner.rotation.x = Math.PI / 2; else if (s.y > s.z * .9) inner.rotation.z = Math.PI / 2;
    dyn(g, [sCyl(.32, .2)], { x: x + rnd(-.02, .02), y: .11 + i * .205, z: z + rnd(-.02, .02), ry: rnd(6), mass: 8, kind: 'rubber', spot: 'tyres', name: 'a tyre', fr: 1.2, re: .2, ld: .4, asleep: true }); }
  for (const [n, x, z] of [['barrel_01', -1.5, -22.95], ['barrel_03', -1.42, -23.62], ['barrel_01', -1.52, -24.3], ['barrel_03', -2.22, -22.7]]) prop(n, { h: .9, x, y: .01, z, ry: rnd(6), mass: 16, kind: 'drum', spot: 'barrels', name: 'a drum', cyl: .29, fr: .7, asleep: true });

  { const x = 2.2, z = -25, m = rust; stat(.04, 1.95, .75, x + .3, .975, z, m, { kind: 'metal' }); stat(.64, 1.95, .04, x, .975, z + .355, m, { kind: 'metal' }); stat(.64, 1.95, .04, x, .975, z - .355, m, { kind: 'metal' }); stat(.64, .04, .75, x, 1.93, z, m, { kind: 'metal' }); stat(.64, .04, .75, x, .02, z, m, { kind: 'metal' });
    lid('locker', x - .32, .98, z + .34, [0, 1, 0], .45, 1.65, .025, 1.84, .68, 0, 0, -.34, m, 9); }

  { const x = -2.15, z = -26.5; stat(.78, .05, 1.7, x, .88, z, wood); for (const [dx, dz] of [[-.33, -.8], [.33, -.8], [-.33, .8], [.33, .8]]) stat(.07, .86, .07, x + dx, .43, z + dz, wood);   // a workbench with a tarp hung to the ground: cloth hides you but does not stop you
    const veil = (w, h, px, pz, ry) => { stat(w, h, .02, px, h / 2, pz, null, { ry, veil: true }); const g = new THREE.PlaneGeometry(w, h, 10, 6), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * .035 * (1 - (p.getY(i) + h / 2) / h * .7)); g.computeVertexNormals();
      const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / .8, uv.getY(i) * h / .8); const m = new THREE.Mesh(g, hess); m.position.set(px, h / 2, pz); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m); };
    veil(1.78, .93, x + .42, z, Math.PI / 2); veil(.86, .93, x, z + .88, 0); const top = new THREE.Mesh(wbox(.84, .012, 1.78, .8), hess); top.position.set(x, .912, z); scene.add(top); }

  { const g = boxMesh(2.2, .018, 1.22, wood); dyn(g, [sBox(2.2, .018, 1.22)], { x: 2.27, y: .49, z: -27, ry: Math.PI / 2, rx: -.93, mass: 13, kind: 'wood', spot: 'plywood', name: 'the plywood', fr: 1.2, asleep: true }); }
  for (const [x, y, z, ry] of [[-1.55, 0, -28.25, .05], [-1.5, 0, -28.95, -.1], [-1.55, .62, -28.6, .3]]) prop('wooden_crate_02', { long: .68, x, y: y + .01, z, ry, mass: 11, kind: 'wood', spot: 'crates', name: 'a crate', fr: 1, asleep: true });
  for (const [x, y, z] of [[1.35, 0, -28.75], [1.3, 0, -29.3], [1.85, 0, -28.6], [1.6, .42, -29.0], [2.3, 0, -28.55], [1.1, 0, -29.75]]) prop('trashbag', { h: rnd(.5, .68), x, y: y + .02, z, ry: rnd(6), mass: 3.5, kind: 'soft', spot: 'trashbags', name: 'a trash bag', ball: .28, ld: 1.5, ad: 3, fr: 1.2, asleep: true });
  { const g = boxMesh(1.9, 1.35, .2, ticking); dyn(g, [sBox(1.9, 1.35, .2)], { x: 0, y: .66, z: -33.52, rx: -.42, mass: 15, kind: 'soft', spot: 'mattress', name: 'the mattress', fr: 1.3, ld: .8, ad: 2, asleep: true }); }

  /* loose rubbish that gives you away if you kick it */
  const glass = new THREE.MeshStandardMaterial({ color: 0x1d3a22, roughness: .1, metalness: 0, transparent: true, opacity: .8 });
  for (const [x, z] of [[.5, -4.4], [-1.9, -9.6], [.2, -13], [-.8, -19.5], [.9, -24], [-.3, -27.2], [-1.4, -31.6], [1, -32.8]]) { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.CylinderGeometry(.033, .033, .18, 10), glass), nk = new THREE.Mesh(new THREE.CylinderGeometry(.013, .028, .1, 8), glass); nk.position.y = .14; g.add(b, nk); b.castShadow = true; g.rotation.z = Math.PI / 2;
    dyn(g, [sCyl(.033, .26, 0, .03, 0)], { x, y: .04, z, ry: rnd(6), rz: Math.PI / 2, mass: .45, kind: 'glass', name: 'a bottle', fr: .4, ad: .25, ld: .15, ccd: true, asleep: true }); }
  for (const [x, z] of [[-1.7, -4], [1.9, -15.9]]) prop('cement_bag', { long: .7, x, y: .01, z, ry: rnd(6), mass: 25, kind: 'soft', name: 'a cement bag', fr: 1.3, ld: 2, ad: 4, asleep: true });
  prop('industrial_pastic_container', { long: .62, x: -1.9, y: .01, z: -2.3, ry: .4, mass: 2.5, kind: 'card', name: 'a tub', asleep: true });
  return WORLD;
}
export { WORLD, build };
