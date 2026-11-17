// The kitchen: static geometry, props, lights, atmosphere. Everything is built at "mouse scale" (about 21x).
'use strict';
(function () {
const { V3, col, clamp, lerp } = MC, P = MC.phys, M = MC.M;
const W = MC.world = { group: null, grips: [], flames: [], pins: [], seats: [], sources: [], cookies: [], st: {}, t: 0 };
const scene = MC.scene;
const CX0 = -16, CX1 = 16, CZ0 = -6, CZ1 = 6;
W.bounds = { x0: -34, x1: CX1, z0: -26, z1: CZ1 };   // the counter and the pub behind its wall

// ---------- builders ----------
function mesh(geo, mat, x, y, z, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false; (o.parent || W.group).add(m); return m;
}
function rbox(x0, x1, y0, y1, z0, z1, mat, o = {}) {
  const m = mesh(MC.rboxGeo(x1 - x0, y1 - y0, z1 - z0, o.r == null ? 0.08 : o.r, o.uv || 0.25), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, o);
  if (o.solid !== false) m.solid = P.addBox(x0, x1, y0, y1, z0, z1, o.flags || {});
  return m;
}
function cyl(x, z, r, y0, y1, mat, o = {}) {
  const m = mesh(new THREE.CylinderGeometry(o.rt == null ? r : o.rt, r, y1 - y0, o.seg || 32), mat, x, (y0 + y1) / 2, z, o);
  if (o.solid !== false) m.solid = P.addCyl(x, z, o.cr || r, y0, y1, o.flags || {});
  return m;
}
function lathe(pts, mat, x, y, z, o = {}) { return mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), o.seg || 40), mat, x, y, z, o); }
function grip(x0, x1, y0, y1, z0, z1, o = {}) {
  const m = mesh(MC.rboxGeo(x1 - x0, y1 - y0, z1 - z0, 0.03, 0.5), M.grip, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, { cast: false });
  const g = Object.assign({ min: new V3(x0, y0, z0), max: new V3(x1, y1, z1), mesh: m }, o); W.grips.push(g);
  if (y1 - y0 > 1 && !o.lever) { const wide = x1 - x0 > z1 - z0, n = 9, fm = M.flat(0xf2e6cc, 1); for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, fx = wide ? x0 + (x1 - x0) * t : (x0 + x1) / 2, fz = wide ? (z0 + z1) / 2 : z0 + (z1 - z0) * t; mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.2, 4), fm, fx, y0 - 0.09, fz, { cast: false, rz: (i % 2 - 0.5) * 0.2 }); } }
  return g;
}
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
let GLOW, FLAME; const MOON_C = col(0xb9c9ff), SUN_C = col(0xffb070), DAWN_C = col(0xffc9a0);
function flameTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 92, 2, 32, 78, 54); gr.addColorStop(0, 'rgba(255,255,235,1)'); gr.addColorStop(0.25, 'rgba(255,214,120,0.95)'); gr.addColorStop(0.6, 'rgba(255,120,30,0.5)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(46, 44, 58, 70, 54, 96); g.bezierCurveTo(52, 118, 12, 118, 10, 96); g.bezierCurveTo(6, 70, 18, 44, 32, 4); g.fill();
  const b = g.createRadialGradient(32, 108, 1, 32, 108, 16); b.addColorStop(0, 'rgba(120,160,255,0.8)'); b.addColorStop(1, 'rgba(60,90,255,0)'); g.fillStyle = b; g.fillRect(8, 90, 48, 34);
  return new THREE.CanvasTexture(c);
}
function glow(x, y, z, s, color, parent) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col(color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.38, fog: false }));
  sp.position.set(x, y, z); sp.scale.set(s * 0.8, s * 0.8, 1); (parent || W.group).add(sp); return sp;
}
W.glow = glow;
function flame(x, y, z, o = {}) {
  const s = o.s || 1, fm = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLAME, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  fm.position.set(x, y + 0.14 * s, z); fm.center.set(0.5, 0.12); W.group.add(fm);
  const g = glow(x, y + 0.16 * s, z, 1.1 * s, 0xff8a2a);
  const L = new THREE.PointLight(col(0xff9a48), o.I || 18, o.dist || 0, 2); L.position.set(x, y + 0.62 * s, z);
  if (o.shadow && MC.opt.quality > 0) { L.castShadow = true; L.shadow.mapSize.set(MC.opt.quality > 1 ? 1024 : 512, MC.opt.quality > 1 ? 1024 : 512); L.shadow.bias = -0.004; L.shadow.radius = 4; L.shadow.camera.near = 0.2; L.shadow.camera.far = 40; }
  W.group.add(L);
  const f = { mesh: fm, glow: g, light: L, I: o.I || 18, s, wild: 0, ph: Math.random() * 10, y: y + 0.14 * s }; W.flames.push(f); return f;
}

// ---------- room shell ----------
function shell(pal) {
  // counter slab + cabinets below + floor far below (scale cue when you look over the edge)
  rbox(CX0, CX1 + 0.4, -1.4, 0, CZ0, CZ1 + 0.35, M.wood, { r: 0.3, uv: 0.09 });
  P.addBox(CX1, CX1 + 1, -2, 60, CZ0, CZ1 + 1, { playerOnly: true }); P.addBox(CX0, CX1 + 1, -2, 60, CZ1, CZ1 + 1, { playerOnly: true });
  rbox(CX0 - 8, CX1 + 0.2, -19, -1.4, CZ0, CZ1, M.cab, { r: 0.05, uv: 0.06, solid: false });
  for (let i = 0; i < 4; i++) { mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.2, 12), M.chrome, CX0 + 4 + i * 8, -4.6, CZ1 + 0.45, { rz: Math.PI / 2 }); mesh(MC.rboxGeo(7.4, 5.2, 0.12, 0.05), M.cab, CX0 + 4 + i * 8, -5, CZ1 + 0.05, { cast: false }); }
  const fl = mesh(new THREE.PlaneGeometry(140, 110), M.floor, 6, -19, 26, { rx: -Math.PI / 2, cast: false }); fl.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * 5; });
  // back wall: tiled backsplash below, plaster above, with a window opening
  const WX0 = -2.5, WX1 = 6.5, WY0 = 7, WY1 = 15.5;
  const hx = W.hole.x, hx0 = hx - 0.8, hx1 = hx + 0.8, HH = 2.3;   // the mousehole through to the pub
  holedWall(-26, 30, -1.4, WY0, -8, CZ0, M.tile, hx, 0.2); holeTrim(hx, CZ0 + 0.01, 1); holeTrim(hx, -8.01, -1);
  rbox(-26, WX0, WY0, 34, -8, CZ0, M.plaster, { r: 0.02, uv: 0.08, solid: false }); rbox(WX1, 30, WY0, 34, -8, CZ0, M.plaster, { r: 0.02, uv: 0.08, solid: false });
  rbox(WX0, WX1, WY1, 34, -8, CZ0, M.plaster, { r: 0.02, uv: 0.08, solid: false });
  P.addBox(-26, hx0, -2, 60, -8, CZ0); P.addBox(hx1, 30, -2, 60, -8, CZ0); P.addBox(hx0, hx1, HH, 60, -8, CZ0); P.addBox(hx0, hx1, -2, 0, -8.6, CZ0 + 0.2);   // walls either side, above, and a floor through the hole
  rbox(WX0 - 0.5, WX1 + 0.5, WY0 - 0.35, WY0, -6.4, -5.3, M.white, { r: 0.08, solid: false });                       // sill
  for (const x of [WX0, (WX0 + WX1) / 2, WX1]) rbox(x - 0.22, x + 0.22, WY0, WY1, -6.6, -6.2, M.white, { r: 0.04, solid: false });
  for (const y of [WY0 + 0.2, (WY0 + WY1) / 2, WY1 - 0.2]) rbox(WX0, WX1, y - 0.22, y + 0.22, -6.6, -6.2, M.white, { r: 0.04, solid: false });
  mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), M.glass, (WX0 + WX1) / 2, (WY0 + WY1) / 2, -6.4, { cast: false, recv: false });
  // night sky
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 512; const g = sc.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#060b22'); gr.addColorStop(1, pal.sky || '#1c2a52'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  const r = MC.rng(7); for (let i = 0; i < 220; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.7) + ')'; g.fillRect(r() * 512, r() * 400, 1 + r() * 1.6, 1 + r() * 1.6); }
  const mg = g.createRadialGradient(330, 150, 0, 330, 150, 120); mg.addColorStop(0, 'rgba(255,250,225,1)'); mg.addColorStop(0.22, 'rgba(255,250,225,1)'); mg.addColorStop(0.26, 'rgba(190,205,255,0.35)'); mg.addColorStop(1, 'rgba(150,170,255,0)'); g.fillStyle = mg; g.fillRect(0, 0, 512, 512);
  const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
  W.sky = mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: st, fog: false }), 2, 16, -40, { cast: false, recv: false });
  // fridge (left), range (right), upper cabinets + microwave with the clock
  rbox(-30, CX0, -19, 34, -8, 9, M.white, { r: 0.4, uv: 0.05, solid: false }); P.addBox(-30, CX0, -2, 60, -8, 9);
  mesh(new THREE.CylinderGeometry(0.3, 0.3, 14, 12), M.chrome, CX0 + 0.5, 8, 7.5);
  rbox(CX1 + 1.2, 34, -19, -0.6, CZ0, CZ1 + 0.3, M.white, { r: 0.2, solid: false }); rbox(CX1 + 1.2, 34, -0.6, -0.4, CZ0, CZ1 + 0.3, M.black, { r: 0.05, solid: false });
  rbox(-26, WX0 - 1.2, 9, 34, CZ0, -2.2, M.cab, { r: 0.1, uv: 0.06, solid: false });
  rbox(WX1 + 1.2, 30, 14.2, 34, CZ0, -2.2, M.cab, { r: 0.1, uv: 0.06, solid: false });
  rbox(WX1 + 1.2, 17.5, 9, 14.2, CZ0, -2.4, M.black, { r: 0.15, solid: false }); rbox(WX1 + 1.6, 13.4, 9.5, 13.7, -2.42, -2.36, M.flat(0x11161c, 0.08), { r: 0.02, solid: false, cast: false });
  W.st.clock = new V3(15.3, 11.6, -2.33);
  // the rest of the room (only really visible when the big light comes on)
  const room = mesh(new THREE.BoxGeometry(96, 55, 62), M.plaster.clone(), 14, 8.5, 23, { cast: false }); room.material.side = THREE.BackSide; room.material.normalMap = null; room.geometry.setDrawRange(0, 30);   // no face behind the kitchen wall: the mousehole opens into the pub
  { const u = room.geometry.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 6, u.getY(i) * 4); }
  W.lamp = mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 24), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, fog: false }), 8, 35.4, 20, { cast: false, recv: false });
  // hallway door (far right): its glow is the "someone is coming" tell
  W.door = mesh(new THREE.PlaneGeometry(14, 40), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, fog: false }), 61.6, 1, 30, { ry: -Math.PI / 2, cast: false, recv: false });
}

// one wall with the mousehole's arch cut clean through it; the cut faces are dark, sooty and unlit-looking
function holedWall(x0, x1, y0, y1, z0, z1, mat, hx, uv) {
  const sh = new THREE.Shape(); sh.moveTo(x0, y0); sh.lineTo(x1, y0); sh.lineTo(x1, y1); sh.lineTo(x0, y1); sh.closePath();
  const h = new THREE.Path(); h.moveTo(hx - 0.8, Math.max(0, y0)); h.lineTo(hx - 0.8, 1.5); h.absarc(hx, 1.5, 0.8, Math.PI, 0, true); h.lineTo(hx + 0.8, Math.max(0, y0)); h.closePath(); sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 20 }), u = g.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * uv, u.getY(i) * uv);
  if (!W.sootM) W.sootM = new THREE.MeshStandardMaterial({ color: 0x0b0806, roughness: 1 });
  return mesh(g, [mat, W.sootM], 0, 0, z0, { cast: true });
}
// a gnawed arch round the mousehole, on one face of the wall (side: +1 faces the kitchen, -1 the pub)
function holeTrim(x, z, side) {
  const sh = new THREE.Shape(); sh.moveTo(-1.05, 0); sh.lineTo(-1.05, 1.5); sh.absarc(0, 1.5, 1.05, Math.PI, 0, true); sh.lineTo(1.05, 0); sh.lineTo(0.8, 0); sh.lineTo(0.8, 1.5); sh.absarc(0, 1.5, 0.8, 0, Math.PI, false); sh.lineTo(-0.8, 0); sh.closePath();
  const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 18 }), M.stud, x, 0, z, { cast: false }); if (side < 0) m.rotation.y = Math.PI;
}

// ---------- the pub: a room inside the B&B's wall, behind the kitchen's backsplash, at counter height ----------
const PX0 = -34, PX1 = -4.5, PZ0 = -26, PZ1 = -8, PH = 12;
function pub(pal) {
  const hx = W.hole.x;
  // floor (old boards), brick back wall, lath-and-plaster sides, the kitchen wall's back as the front, joists overhead
  rbox(PX0 - 1, PX1 + 1, -0.8, 0, PZ0 - 1, PZ1, M.stud, { r: 0.02, uv: 0.12 });
  for (let x = PX0; x < PX1; x += 2.2) rbox(x + 0.02, x + 2.18, -0.02, 0.02, PZ0, PZ1, M.stud, { r: 0.04, uv: 0.15, solid: false, cast: false });   // board seams
  rbox(PX0 - 1, PX1 + 1, 0, PH + 1, PZ0 - 1, PZ0, M.brick, { r: 0.02, uv: 0.09 });
  rbox(PX0 - 1, PX0, 0, PH + 1, PZ0, PZ1, M.lath, { r: 0.02, uv: 0.12 }); rbox(PX1, PX1 + 1, 0, PH + 1, PZ0, PZ1, M.lath, { r: 0.02, uv: 0.12 });
  holedWall(PX0, PX1, 0, PH + 1, PZ1 - 0.02, PZ1 + 0.6, M.lath, hx, 0.12);
  P.addBox(PX0 - 1, -26, -2, 60, PZ1, -6);   // the pub's front wall where the kitchen wall does not reach
  rbox(PX0 - 1, PX1 + 1, PH, PH + 1.2, PZ0 - 1, PZ1 + 0.6, M.stud, { r: 0.02, uv: 0.1 });
  for (let x = PX0 + 1; x < PX1; x += 4.2) rbox(x, x + 0.9, PH - 1.6, PH, PZ0, PZ1, M.stud, { r: 0.06, uv: 0.15, solid: false });   // joists
  for (const x of [PX0 + 0.1, PX1 - 0.7]) for (let z = PZ0 + 2; z < PZ1 - 1; z += 5) rbox(x, x + 0.6, 0, PH, z, z + 0.9, M.stud, { r: 0.05, uv: 0.15, solid: false });   // studs
  // a wire and an old porcelain insulator along the joists: the house's own wiring
  const wire = new THREE.CatmullRomCurve3([new V3(PX0, PH - 1.7, PZ0 + 3), new V3((PX0 + PX1) / 2, PH - 2.1, PZ0 + 3.4), new V3(PX1, PH - 1.7, PZ0 + 3)]); mesh(new THREE.TubeGeometry(wire, 30, 0.06, 6), M.rubber, 0, 0, 0, { cast: false });
  // the bar against the brick, the kitchen along the side wall
  diner(-27.5, PZ0);
  toaster(-31.6, -15.5, { pub: true });
  stoves(-22.8, -13.6, PZ1 - 0.1);
  cuttingBoard(-17.5, -15.8);
  // larder shelves on the brick: jars, a cork, buttons, a sugar cube
  for (const y of [3.2, 6.2]) { rbox(-16, -6.5, y - 0.18, y, PZ0, PZ0 + 1.6, M.stud, { r: 0.04, uv: 0.2, solid: false }); for (const x of [-15.6, -7]) mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), M.chrome, x, y - 0.6, PZ0 + 0.8, { rz: 0.5, cast: false }); }
  for (let i = 0; i < 6; i++) { const x = -15 + i * 1.5, j = lathe([[0, 0], [0.42, 0], [0.45, 0.06], [0.44, 0.9], [0.36, 1.0], [0.36, 1.15], [0, 1.15]], M.glass, x, 3.2, PZ0 + 0.8); void j; cyl(x, PZ0 + 0.8, 0.36, 3.25, 3.25 + 0.3 + (i % 3) * 0.2, [M.pea, M.crust, M.cheese][i % 3], { solid: false }); }
  for (let i = 0; i < 4; i++) cyl(-14 + i * 2.2, PZ0 + 0.8, 0.5, 6.2, 6.5 + i * 0.05, [M.cork, M.white, M.paint, M.brass][i], { solid: false, seg: 24 });
  // tables: jar lids on cork legs, bottle-cap stools, a stub of candle on each
  for (const [tx, tz] of [[-12.5, -20.5], [-8, -15.5], [-9, -10.5]]) {
    cyl(tx, tz, 0.32, 0, 1.6, M.cork, { seg: 16 }); cyl(tx, tz, 1.25, 1.6, 1.78, M.brass, { seg: 36, solid: true });
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + tx, sx = tx + Math.cos(a) * 1.9, sz = tz + Math.sin(a) * 1.9; lathe([[0, 0], [0.5, 0], [0.55, 0.12], [0.5, 0.12], [0.45, 0.04], [0, 0.04]], M.paint, sx, 0.75, sz); cyl(sx, sz, 0.2, 0, 0.75, M.cork, { solid: false, seg: 10 }); }
    cyl(tx, tz, 0.16, 1.78, 2.05, M.wax, { solid: false, seg: 12 }); flameLite(tx, 2.08, tz);
  }
  // barrels (thimbles on their sides), a dartboard (a coat button), a chalk menu (a matchbook), a rug (a felt offcut)
  for (const [bx, bz, by] of [[-6.4, -24.6, 0.55], [-6.4, -23.2, 0.55], [-6.4, -23.9, 1.6]]) mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.2, 20), M.brass, bx, by, bz, { rz: Math.PI / 2 });
  const btn = mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.16, 32), M.flat(0x2a5a3a, 0.6), PX1 - 0.1, 5.2, -17, { rz: Math.PI / 2, cast: false }); void btn;
  for (const [dy, dz] of [[0.35, 0.35], [0.35, -0.35], [-0.35, 0.35], [-0.35, -0.35]]) mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 10), M.black, PX1 - 0.12, 5.2 + dy, -17 + dz, { rz: Math.PI / 2, cast: false });
  mesh(new THREE.BoxGeometry(0.04, 3.8, 6), M.felt, -10, 0.03, -16, { rz: Math.PI / 2, cast: false });
  label('TONIGHT: ask the cook', -18.5, 8.3, PZ0 + 0.05, 5, '#f4efe2', '#1d2a22');
  // two hanging lanterns (bottle caps with candle stubs) and a warm haze of light round the room
  for (const [lx, lz] of [[-25, -19], [-11, -17]]) { mesh(new THREE.CylinderGeometry(0.01, 0.01, PH - 1.6 - 7.4, 4), M.black, lx, (PH - 1.6 + 7.4) / 2, lz, { cast: false }); lathe([[0, 0], [0.45, 0], [0.5, 0.12], [0.45, 0.12], [0.4, 0.04], [0, 0.04]], M.tin, lx, 7.3, lz); cyl(lx, lz, 0.18, 7.34, 7.6, M.wax, { solid: false }); flame(lx, 7.62, lz, { I: 16, dist: 30, s: 0.9, shadow: lx < -20 }); }
  const amb = new THREE.PointLight(col(0xffb070), 0.6, 40, 1.6); amb.position.set((PX0 + PX1) / 2, PH - 3, (PZ0 + PZ1) / 2); W.group.add(amb); W.pubAmb = amb;
  W.st.pub = { x0: PX0, x1: PX1, z0: PZ0, z1: PZ1, h: PH, hole: new V3(hx, 0, PZ1 - 0.6), out: new V3(hx, 0, CZ0 + 0.8) };
}
// a candle on a table: a flame and its glow, no light of its own (the lanterns light the room)
function flameLite(x, y, z) { const f = flame(x, y, z, { I: 0.0001, s: 0.6 }); f.light.visible = false; return f; }
function label(text, x, y, z, w, fg = '#3a2414', bg = '#f2e6c8') {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 512, 128); g.fillStyle = fg; g.font = 'bold 54px Georgia,serif'; g.textAlign = 'center'; g.fillText(text, 256, 84);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }), x, y, z, { cast: false });
}

// ---------- lights + atmosphere ----------
function lights(pal) {
  const q = MC.opt.quality;
  W.hemi = new THREE.HemisphereLight(col(pal.hemiSky || 0x6f86d8), col(0x0a0b12), 0.07); W.group.add(W.hemi); W.hemiC = W.hemi.color.clone(); W.dawn = 0;
  // the moon is outside: its light only gets in through the window, as a shaft that lands on the counter
  const moon = W.moon = new THREE.SpotLight(col(0xb9c9ff), 2.6, 0, 0.14, 0.35, 0); moon.position.set(2, 50.9, -36.9); moon.target.position.set(2, 11.25, -6.4); W.group.add(moon, moon.target);
  const ceil = W.ceil = new THREE.DirectionalLight(col(0xffe2b8), 0); ceil.position.set(8, 40, 22); ceil.target.position.set(0, 0, -1); ceil.visible = false; W.group.add(ceil, ceil.target);
  if (q > 0) { moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.camera.near = 25; moon.shadow.camera.far = 120; moon.shadow.bias = -0.0008; moon.shadow.normalBias = 0.03; moon.shadow.radius = 2.5; }
  for (const L of [ceil]) if (q > 0) {
    L.castShadow = true; L.shadow.mapSize.set(q > 1 ? 4096 : 2048, q > 1 ? 4096 : 2048); const c = L.shadow.camera; c.left = -40; c.right = 22; c.top = 30; c.bottom = -30; c.near = 2; c.far = 80; L.shadow.bias = -0.0006; L.shadow.normalBias = 0.03; L.shadow.radius = 2.5;
  }
  W.roomFill = new THREE.HemisphereLight(col(0xfff0d8), col(0x5a4a3a), 0); W.group.add(W.roomFill);
  W.playerGlow = new THREE.PointLight(col(0xb9c4e6), 0.5, 7, 2);   // night eyes: just enough to see your own paws scene.add(W.playerGlow);
  // moonbeam shafts + drifting dust
  const beamMat = new THREE.MeshBasicMaterial({ color: col(0x8fa8ff), transparent: true, opacity: 0.028, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  W.beams = [];
  for (let i = 0; i < 8; i++) {
    const x = -2.2 + i * 1.2, k = 18.5 / 24, g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x, 15.2, -6.2, x, 7.2, -6.2, x, 0.02, -6.2 + 7.2 * k, x, 0.02, -6.2 + 15.2 * k], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const bm = new THREE.Mesh(g, beamMat); W.group.add(bm); W.beams.push(bm);
  }
  const dn = 260, dp = new Float32Array(dn * 3), r = MC.rng(99); for (let i = 0; i < dn; i++) { dp[i * 3] = -2.5 + r() * 9; dp[i * 3 + 1] = 0.3 + r() * 9; dp[i * 3 + 2] = -5 + r() * 9; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  W.dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: GLOW, color: col(0xaebcff), size: 0.05, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })); W.group.add(W.dust);
}
// reflections: render the built kitchen itself into a cube map, so metal and chitin reflect the real lights
W.captureEnv = function () {
  const R = MC.renderer, rt = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const cc = new THREE.CubeCamera(0.2, 120, rt); cc.position.set(1, 2.6, 1.5); scene.add(cc);
  const was = scene.environment, xr = R.xr.enabled; scene.environment = W.envNight0; R.xr.enabled = false;
  try { cc.update(R, scene); const pm = new THREE.PMREMGenerator(R); if (W.envCap) W.envCap.dispose(); W.envCap = pm.fromCubemap(rt.texture).texture; pm.dispose(); W.envNight = W.envCap; } catch (e) { W.envNight = W.envNight0; }
  R.xr.enabled = xr; scene.environment = was; scene.remove(cc); rt.dispose();
};
function buildEnv() {
  if (W.envNight0) return;
  const pm = new THREE.PMREMGenerator(MC.renderer), mk = (bg, win, warm) => {
    const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.BoxGeometry(60, 40, 60), new THREE.MeshBasicMaterial({ color: bg, side: THREE.BackSide })));
    const w = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshBasicMaterial({ color: win })); w.position.set(2, 8, -29); s.add(w);
    const c = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), new THREE.MeshBasicMaterial({ color: warm })); c.position.set(-12, 0, -8); s.add(c);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: new THREE.Color(bg).multiplyScalar(0.5) })); f.rotation.x = -Math.PI / 2; f.position.y = -6; s.add(f);
    return pm.fromScene(s, 0.02).texture;
  };
  W.envNight = W.envNight0 = mk(new THREE.Color(0.012, 0.016, 0.035), new THREE.Color(0.5, 0.62, 1.1), new THREE.Color(1.6, 0.8, 0.3));
  W.envLit = mk(new THREE.Color(0.5, 0.42, 0.32), new THREE.Color(0.2, 0.25, 0.4), new THREE.Color(3, 2.6, 2));
  pm.dispose();
}

// ---------- props ----------
function toaster(x0, z0, o = {}) {
  const x1 = x0 + 6, z1 = z0 + 3.5, H = 4.4, zc = (z0 + z1) / 2;
  rbox(x0, x1, 0.18, H, z0, z1, M.steel, { r: 0.55, uv: 0.2 }); rbox(x0 + 0.3, x1 - 0.3, 0, 0.3, z0 + 0.3, z1 - 0.3, M.black, { r: 0.1, solid: false });
  for (const dz of [-0.62, 0.62]) rbox(x0 + 0.9, x1 - 0.9, H - 0.02, H + 0.015, zc + dz - 0.27, zc + dz + 0.27, M.slot, { r: 0.01, solid: false, cast: false });
  rbox(x0 - 0.03, x0 + 0.02, 1.0, H - 0.3, zc - 0.1, zc + 0.1, M.black, { r: 0.01, solid: false, cast: false });
  mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 24), M.black, x0 + 1.3, 1.5, z1 + 0.06, { rx: Math.PI / 2 });       // browning dial
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), M.white, x0 + 1.3, 1.78, z1 + 0.2, { rx: Math.PI / 2, cast: false });
  rbox(x0 + 2.4, x0 + 4.6, 1.9, 2.5, z1 - 0.02, z1 + 0.04, M.chrome, { r: 0.02, solid: false, cast: false });         // brand plate
  // cord to the wall
  if (!o.pub) {
  const curve = new THREE.CatmullRomCurve3([new V3(x1 - 0.6, 0.5, z0 + 0.1), new V3(x1 - 0.2, 0.18, z0 - 0.5), new V3(x1 + 0.9, 0.2, z0 - 0.2), new V3(x1 + 1.2, 1.6, -5.95), new V3(x1 + 1.2, 3.2, -5.95)]);
  mesh(new THREE.TubeGeometry(curve, 40, 0.11, 8), M.rubber, 0, 0, 0); rbox(x1 + 0.7, x1 + 1.7, 2.9, 4.1, -6.0, -5.9, M.white, { r: 0.04, solid: false });
  }
  const g1 = grip(x0 - 0.12, x0 - 0.02, 0.3, H + 0.05, z1 - 1.25, z1 - 0.45), g2 = grip(x0 - 0.1, x0 + 0.9, H, H + 0.07, z1 - 1.25, z1 - 0.45); void g1; void g2;
  const knob = grip(x0 - 0.7, x0, 3.9 - 0.13, 3.9 + 0.13, zc - 0.3, zc + 0.3, { lever: true });
  W.st.toaster = { slot: { min: new V3(x0 + 0.8, H, zc - 1.0), max: new V3(x1 - 0.8, H + 0.6, zc + 1.0) }, lever: knob, top: 3.9, bot: 1.25, ejectFrom: new V3(x0 + 1.6, H + 0.35, zc), slotMat: M.slot, pos: new V3((x0 + x1) / 2, H, zc), light: null, standTop: new V3(x0 + 0.5, H, z1 - 0.85), base: new V3(x0 - 0.55, 0, z1 - 0.85), leverStand: new V3(x0 + 0.2, H, zc) };
  const L = new THREE.PointLight(col(0xff5a1a), 0, 9, 2); L.position.set((x0 + x1) / 2, H + 0.5, zc); W.group.add(L); W.st.toaster.light = L;
  W.pins.push({ pos: new V3(x0 + 1.3, H - 0.02, z1 - 0.12), dir: 'up', name: 'toasterL' }, { pos: new V3(x1 - 0.4, H - 0.02, z1 - 0.12), dir: 'up', name: 'toasterR' });   // on the front lip of the toaster, so lines leave it cleanly
  if (!o.pub) nightLight(x0 - 1.3);
}
// plug-in night light on the backsplash: keeps the climbing side of things readable
function nightLight(nx) {
  rbox(nx - 0.35, nx + 0.35, 2.3, 3.5, -6.0, -5.82, M.flat(0x6e675c, 0.7), { r: 0.05, solid: false });
  mesh(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.6, 0.26), fog: false }), nx, 3.0, -5.8, { cast: false, recv: false }).scale.set(1, 1.3, 0.5);
  const nl = new THREE.PointLight(col(0xffc890), 3.2, 14, 2); nl.position.set(nx, 3.0, -5.3); if (MC.opt.quality > 1) { nl.castShadow = true; nl.shadow.mapSize.set(512, 512); nl.shadow.bias = -0.004; nl.shadow.radius = 4; nl.shadow.camera.near = 0.3; nl.shadow.camera.far = 16; } W.group.add(nl); W.nightLight = nl;   // no halo: a dim frosted lamp, its light falling off across the tiles
}
function breadBox(x0, z0) {
  const x1 = x0 + 7, z1 = z0 + 3.3, H = 4.4;
  rbox(x0, x1, 0, H, z0, z1, M.paint, { r: 0.5, uv: 0.25 }); rbox(x0 + 0.4, x1 - 0.4, 2.4, 2.52, z1 - 0.01, z1 + 0.04, M.black, { r: 0.01, solid: false, cast: false });
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 10), M.wood, (x0 + x1) / 2 + 1.2, 2.95, z1 + 0.22, { rz: Math.PI / 2 });
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#f3ead0'; g.font = 'bold 64px Georgia,serif'; g.textAlign = 'center'; g.fillText('BREAD', 128, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(2.6, 1), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5 }), x0 + 2.2, 1.4, z1 + 0.012, { cast: false });
  grip(x0 + 4.4, x0 + 5.3, 0.3, H + 0.05, z1 + 0.02, z1 + 0.12); grip(x0 + 4.4, x0 + 5.3, H, H + 0.07, z1 - 0.9, z1 + 0.1);
  W.st.boxTop = { stand: new V3(x0 + 4.85, H, z1 - 0.5), base: new V3(x0 + 4.85, 0, z1 + 0.6), y: H };
  // saucer + cheese wedge on top
  const sx = x0 + 2.2, sz = z0 + 1.6; cyl(sx, sz, 1.5, H, H + 0.1, M.white, { rt: 1.7, solid: false });
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.9, 0.35); sh.lineTo(1.9, -0.35); sh.closePath();
  const cg = new THREE.ExtrudeGeometry(sh, { depth: 0.95, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }); cg.rotateX(-Math.PI / 2);
  const cu = cg.attributes.uv; for (let i = 0; i < cu.count; i++) cu.setXY(i, cu.getX(i) * 0.5, cu.getY(i) * 0.5);
  mesh(cg, M.cheese, sx - 0.9, H + 0.1, sz + 0.1, { ry: 0.5 });
  P.addBox(sx - 1.0, sx + 0.9, H, H + 1.05, sz - 0.9, sz + 0.5);
  W.sources.push({ type: 'cheese', min: new V3(sx - 1.1, H, sz - 1.0), max: new V3(sx + 1.0, H + 1.15, sz + 0.6), out: new V3(sx + 1.3, H + 0.4, sz + 0.9), stand: new V3(sx + 1.4, H, sz + 1.1), high: true });
  W.pins.push({ pos: new V3(x0 + 0.5, H - 0.02, z1 - 0.12), dir: 'up', name: 'breadboxL' }, { pos: new V3(x1 - 0.5, H - 0.02, z1 - 0.12), dir: 'up', name: 'breadboxR' });
}
function diner(x0, wz = -6) {   // wz: the wall the bar stands against
  const x1 = x0 + 5.2, z0 = wz + 1.5, z1 = wz + 2.3, Z = d => wz + 6 + d;
  const lc = document.createElement('canvas'); lc.width = 512; lc.height = 128; const g = lc.getContext('2d');
  g.fillStyle = '#b3392b'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#f6e7c4'; g.fillRect(8, 8, 496, 112); g.fillStyle = '#1e2a4a'; g.fillRect(14, 14, 484, 100);
  g.fillStyle = '#f6c95a'; g.font = 'bold 44px Georgia,serif'; g.textAlign = 'center'; g.fillText('MIDNIGHT CRUMBS', 256, 62); g.font = '22px Georgia,serif'; g.fillStyle = '#f6e7c4'; g.fillText('· pub & kitchen · open till dawn ·', 256, 98);
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  rbox(x0, x1, 0, 0.9, z0, z1, M.card, { r: 0.04, uv: 0.5 });
  mesh(new THREE.PlaneGeometry(x1 - x0 - 0.1, 0.8), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.8 }), (x0 + x1) / 2, 0.45, z1 + 0.012, { cast: false });
  for (const x of [x0 + 0.08, x1 - 0.08]) mesh(new THREE.CylinderGeometry(0.035, 0.045, 3.4, 8), M.wood, x, 2.5, z0 + 0.1);
  mesh(new THREE.CylinderGeometry(0.012, 0.012, x1 - x0, 6), M.white, (x0 + x1) / 2, 4.1, z0 + 0.1, { rz: Math.PI / 2, cast: false });
  const bulbCols = [0xffd27a, 0xff8f6b, 0x8fd6ff, 0xb6ff9a];
  W.bulbs = [];
  for (let i = 0; i < 9; i++) { const bx = x0 + 0.3 + i * (x1 - x0 - 0.6) / 8, b = mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: col(bulbCols[i % 4]), fog: false }), bx, 4.02 - Math.sin(i / 8 * Math.PI) * 0.12, z0 + 0.1, { cast: false, recv: false }); W.bulbs.push(b); glow(bx, b.position.y, z0 + 0.12, 0.5, bulbCols[i % 4]); }
  const fl = new THREE.PointLight(col(0xffc98a), 5, 12, 2); fl.position.set((x0 + x1) / 2, 3.2, z0 + 2.2); W.group.add(fl); W.fairy = fl;
  const capProfile = [[0, 0], [0.44, 0], [0.5, 0.1], [0.46, 0.1], [0.4, 0.035], [0, 0.035]];
  for (let i = 0; i < 3; i++) {
    const sx = x0 + 0.8 + i * 1.45; lathe(capProfile, M.tin, sx, 0.9, Z(-4.1));
    W.seats.push({ i, x: sx, plate: new V3(sx, 0.94, Z(-4.1)), zone: { min: new V3(sx - 0.55, 0.9, z0 - 0.05), max: new V3(sx + 0.55, 1.75, z1 + 0.15) }, ticket: new V3(sx, 2.7, z0 + 0.2), cust: new V3(sx, 1.25, Z(-4.98)), serve: new V3(sx, 0, z1 + 0.75) });
  }
  rbox(x0 + 0.05, x1 - 0.05, 0, 1.25, Z(-5.98), z0 - 0.12, M.card, { r: 0.04, uv: 0.5, solid: false });   // the customers' bench: a second matchbox behind the bar
  for (const s of W.seats) {   // twine + clothespin holding each ticket under the light string
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 4), M.flat(0xc9b48a, 1), s.x, 3.74, z0 + 0.13, { cast: false, rx: -0.15 });
    const cp = new THREE.Group(); cp.position.set(s.x, 3.45, z0 + 0.18); cp.rotation.x = 0.28; W.group.add(cp);
    for (const sd of [-1, 1]) { const j = mesh(MC.rboxGeo(0.07, 0.3, 0.035, 0.012), M.wood, sd * 0.03, 0, 0, { parent: cp }); j.rotation.z = sd * 0.08; }
    mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 12), M.chrome, 0, 0.02, 0.025, { parent: cp, cast: false });
  }
  // cool back-light over the seats, so dark critters separate from the counter
  const bl = new THREE.DirectionalLight(col(0x9fb4ff), 1.2); bl.position.set((x0 + x1) / 2, 6, Z(-9)); bl.target.position.set((x0 + x1) / 2, 1, Z(-3.5)); W.group.add(bl, bl.target);
  // candle = the noise meter
  const cx = x1 - 0.42; lathe([[0, 0], [0.3, 0], [0.32, 0.26], [0.29, 0.26], [0.28, 0.03], [0, 0.03]], M.tin, cx, 0.9, Z(-4.1)); cyl(cx, Z(-4.1), 0.27, 0.93, 1.13, M.wax, { solid: false });
  W.candle = flame(cx, 1.16, Z(-4.1), { I: 7, shadow: true, s: 1.1 });
  // mouse hole in the backsplash
  const hs = new THREE.Shape(); hs.moveTo(-0.7, 0); hs.lineTo(-0.7, 0.8); hs.absarc(0, 0.8, 0.7, Math.PI, 0, true); hs.lineTo(0.7, 0); hs.closePath();
  mesh(new THREE.ShapeGeometry(hs, 16), new THREE.MeshBasicMaterial({ color: 0x050302 }), (x0 + x1) / 2, 0, Z(-5.985), { cast: false, recv: false });
  glow((x0 + x1) / 2, 0.5, Z(-5.9), 1.6, 0x6a3510);
  W.st.board = { pos: new V3((x0 + x1) / 2, 5.45, Z(-5.9)), w: 4.6, h: 1.7 };
  W.st.diner = { x0, x1, z0, z1, hole: new V3((x0 + x1) / 2, 0, Z(-5.6)) };
  const ko = P.addBox(x0 - 0.1, x1 + 0.1, 0, 6, wz, z0, { playerOnly: true }); W.keepOut.push(ko);   // the customers' side of the counter
  W.pins.push({ pos: new V3(x1 + 0.9, 2.2, Z(-5.9)), dir: 'wall', name: 'diner' });
}
function stoves(x, z, wz = -6) {
  cyl(x + 1, z, 2.3, 0, 0.1, M.cork, { solid: false, seg: 40 });
  const cup = [[0, 0], [0.55, 0], [0.57, 0.36], [0.53, 0.36], [0.52, 0.04], [0, 0.04]];
  const mk = (sx, name) => {
    lathe(cup, M.tin, sx, 0.1, z); cyl(sx, z, 0.51, 0.13, 0.36, M.wax, { solid: false });
    const f = flame(sx, 0.4, z, { I: 3.2, dist: 12, s: 0.9 });
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 6), M.chrome, sx + Math.cos(a) * 0.62, 0.55, z + Math.sin(a) * 0.62); }
    mesh(new THREE.TorusGeometry(0.62, 0.03, 6, 28), M.chrome, sx, 1.02, z, { rx: Math.PI / 2 });
    return f;
  };
  const f1 = mk(x, 'pan'), f2 = mk(x + 2, 'pot');
  lathe([[0, 0], [0.5, 0], [0.57, 0.17], [0.53, 0.17], [0.47, 0.05], [0, 0.05]], M.tin, x, 1.05, z, { rx: 0.22 });   // tipped toward the cook so you can see what is in it
  P.addCyl(x, z, 0.66, 0, 1.08); P.addCyl(x + 2, z, 0.66, 0, 1.8);
  lathe([[0, 0], [0.36, 0], [0.42, 0.08], [0.38, 0.78], [0.33, 0.78], [0.36, 0.1], [0, 0.06]], M.tin, x + 2, 1.05, z);
  // the thimble's water is a live surface: drops ripple it, heat bubbles it
  const water = MC.makeWater(0.33, new THREE.MeshPhysicalMaterial({ color: col(0x9fc3d6), roughness: 0.05, transparent: true, opacity: 0.85, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2 }), { n: 32 });
  const soup = water.mesh; soup.position.set(x + 2, 1.62, z); W.group.add(soup); W.water = water;
  W.st.pan = { pos: new V3(x, 1.12, z), zone: { min: new V3(x - 0.75, 1.0, z - 0.75), max: new V3(x + 0.75, 1.9, z + 0.75) }, flame: f1, stand: new V3(x, 0, z + 1.85) };
  W.st.pot = { pos: new V3(x + 2, 1.62, z), zone: { min: new V3(x + 1.25, 1.3, z - 0.75), max: new V3(x + 2.75, 2.6, z + 0.75) }, box: { min: new V3(x + 1.28, 0.9, z - 0.72), max: new V3(x + 2.72, 1.95, z + 0.72) }, soup, flame: f2, stand: new V3(x + 2, 0, z + 1.85) };
  W.pins.push({ pos: new V3(x + 3.6, 1.15, wz + 0.1), dir: 'wall', name: 'stoves' });
}
function cuttingBoard(x0, z0) {
  const x1 = x0 + 4.4, z1 = z0 + 3;
  rbox(x0, x1, 0, 0.3, z0, z1, M.wood, { r: 0.1, uv: 0.22 });
  const bx = x0 + 2.2, bz = z0 + 1.0;
  cyl(bx, bz - 0.95, 0.42, 0.3, 0.75, M.cork, { cr: 0.42 });
  mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.035, 48), M.chrome, bx, 1.45, bz, { rz: Math.PI / 2 }); P.addBox(bx - 0.05, bx + 0.05, 0.45, 2.45, bz - 1.0, bz + 1.0);
  W.st.blade = { zone: { min: new V3(bx - 0.3, 0.5, bz - 1.05), max: new V3(bx + 0.3, 2.6, bz + 1.05) }, pos: new V3(bx, 1.5, bz), stand: new V3(bx + 1.2, 0.3, bz + 0.3) };
  W.pins.push({ pos: new V3(x1 - 0.35, 0.3, z1 - 0.35), dir: 'up', name: 'board' });
}
function breadSlice(x, z) {
  cyl(x, z, 1.9, 0, 0.09, M.white, { rt: 2.05, solid: false, seg: 40 });
  const s = new THREE.Shape(); s.moveTo(-1.1, -1.15); s.lineTo(1.1, -1.15); s.lineTo(1.12, 0.45); s.bezierCurveTo(1.6, 0.6, 1.5, 1.35, 0.75, 1.25); s.bezierCurveTo(0.4, 1.45, -0.4, 1.45, -0.75, 1.25); s.bezierCurveTo(-1.5, 1.35, -1.6, 0.6, -1.12, 0.45); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.26, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 10 }); g.rotateX(-Math.PI / 2);
  const u = g.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 0.45, u.getY(i) * 0.45);
  mesh(g, [M.bread, M.crust], x, 0.12, z, { ry: 0.25 });
  P.addBox(x - 1.15, x + 1.15, 0, 0.42, z - 1.3, z + 1.2);
  // loose decorative crumbs around the plate (no physics: pure texture for the scene)
  const cg = new THREE.IcosahedronGeometry(1, 1); { const p = cg.attributes.position, r0 = MC.rng(3); for (let i = 0; i < p.count; i++) { const k = 0.75 + r0() * 0.45; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); } cg.computeVertexNormals(); }
  const im = new THREE.InstancedMesh(cg, M.crumbGold, 46), dm = new THREE.Object3D(), rr = MC.rng(31 + Math.round(x * 7));
  for (let i = 0; i < 46; i++) { const a = rr() * 6.283, d = 1.3 + rr() * 2.6, s = 0.02 + rr() * 0.045; dm.position.set(x + Math.cos(a) * d, s * 0.7, z + Math.sin(a) * d); dm.rotation.set(rr() * 3, rr() * 3, rr() * 3); dm.scale.set(s, s * 0.8, s); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); }
  im.castShadow = true; im.receiveShadow = true; W.group.add(im);
  W.sources.push({ type: 'crumb', min: new V3(x - 1.3, 0, z - 1.45), max: new V3(x + 1.3, 0.6, z + 1.35), out: new V3(x, 0.7, z), stand: new V3(x, 0, z + 2.0) });
}
function peaLid(x, z) {
  lathe([[0, 0], [1.0, 0], [1.06, 0.34], [1.0, 0.34], [0.96, 0.06], [0, 0.06]], M.brass, x, 0, z);
  // containment ring (cannon only) so peas stay in the lid; the player simply steps over it
  P.addRing(x, z, 1.02, 0.34); P.addBox(x - 0.7, x + 0.7, 0, 0.06, z - 0.7, z + 0.7);
  const pod = mesh(new THREE.SphereGeometry(0.5, 14, 10), M.pea, x - 1.9, 0.2, z - 0.6, { ry: 0.7 }); pod.scale.set(2.6, 0.38, 0.75);
  W.sources.push({ type: 'pea', lid: new V3(x, 0.3, z), r: 0.75, stand: new V3(x, 0, z + 1.6) });
}
function mug(x, z) {
  lathe([[0, 0], [1.2, 0], [1.3, 0.12], [1.3, 3.3], [1.24, 3.4], [1.14, 3.36], [1.14, 0.3], [0, 0.3]], M.ceramic, x, 0, z);
  mesh(new THREE.TorusGeometry(0.85, 0.2, 10, 24, Math.PI), M.ceramic, x + 1.25, 1.75, z, { rz: -Math.PI / 2 });
  P.addCyl(x, z, 1.3, 0, 3.4, { unreachable: true });
  const sp = new THREE.Group(); sp.position.set(x - 0.2, 3.2, z + 0.3); sp.rotation.set(0.5, 0.4, 0.35); W.group.add(sp);
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.2, 8), M.chrome, 0, 0.6, 0, { parent: sp }); const bowl = mesh(new THREE.SphereGeometry(0.42, 14, 10), M.chrome, 0, 2.5, 0, { parent: sp }); bowl.scale.set(1, 1.5, 0.35);
}
function kettle(x, z) {
  lathe([[0, 0], [1.5, 0], [1.75, 0.5], [1.8, 1.6], [1.5, 3.0], [1.05, 3.5], [0.7, 3.62], [0, 3.66]], M.paint, x, 0, z);   // enamel kettle, coloured per home
  mesh(new THREE.SphereGeometry(0.28, 12, 10), M.black, x, 3.85, z); mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.0, 12), M.steel, x - 1.9, 2.4, z + 0.9, { rz: 0.9, ry: -0.44 });
  mesh(new THREE.TorusGeometry(1.25, 0.16, 8, 24, Math.PI), M.black, x, 3.5, z, { ry: 1.1 });
  P.addCyl(x, z, 1.8, 0, 3.7, { unreachable: true });
}
function shaker(x, z, cap) {
  lathe([[0, 0], [0.62, 0], [0.7, 0.3], [0.55, 2.3], [0.45, 2.45], [0, 2.45]], M.flat(cap ? 0x2a2622 : 0xf3f1ea, 0.15, 0, { transparent: true, opacity: 0.92 }), x, 0, z);
  lathe([[0, 0], [0.47, 0], [0.5, 0.25], [0.3, 0.5], [0, 0.52]], M.chrome, x, 2.45, z); P.addCyl(x, z, 0.7, 0, 2.95, { unreachable: true });
}
function cookiePlate(x, z) {
  cyl(x, z, 2.0, 0, 0.1, M.white, { rt: 2.2, solid: false, seg: 40 });
  const r = MC.rng(5);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4, cx = x + Math.cos(a) * 0.85, cz = z + Math.sin(a) * 0.85, y = 0.1 + i * 0.02;
    const c = new THREE.Group(); c.position.set(cx, y, cz); W.group.add(c);
    mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.26, 24), M.crust, 0, 0.13, 0, { parent: c });
    for (let k = 0; k < 9; k++) { const ca = r() * 6.28, cr = r() * 0.75; mesh(new THREE.SphereGeometry(0.09 + r() * 0.05, 6, 5), M.flat(0x2b1608, 0.5), Math.cos(ca) * cr, 0.26, Math.sin(ca) * cr, { parent: c, cast: false }); }
    W.cookies.push({ group: c, pos: new V3(cx, y + 0.2, cz), taken: false });
  }
  P.addCyl(x, z, 1.75, 0, 0.36);
}
function sponge(x0, z0) { rbox(x0, x0 + 1.9, 0, 0.5, z0, z0 + 1.9, M.sponge, { r: 0.12, uv: 0.5, flags: { soft: true } }); rbox(x0, x0 + 1.9, 0.5, 0.7, z0, z0 + 1.9, M.flat(0x2f7d4f, 1), { r: 0.08, flags: { soft: true } }); }

function noodles(x, z) {   // a few dry spaghetti strands: "logs" you snap pieces off
  const mat = M.flat(0xe9cf8a, 0.55);
  for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.075, 0.075, 5.2, 8), mat, x + (i - 1.5) * 0.1, 0.08 + (i % 2) * 0.13, z + (i - 1.5) * 0.16, { rz: Math.PI / 2, ry: 0.12 * (i - 1.5) });
  P.addBox(x - 2.6, x + 2.6, 0, 0.26, z - 0.4, z + 0.4);
  W.sources.push({ type: 'noodle', min: new V3(x - 2.7, 0, z - 0.5), max: new V3(x + 2.7, 0.45, z + 0.5), out: new V3(x, 0.6, z), stand: new V3(x, 0, z + 1.3) });
}
function eggStand(x, z) {  // an egg you cannot lift: push it off the ledge to crack it
  rbox(x - 1.6, x + 1.6, 0, 1.5, z - 1.3, z + 1.3, M.card, { r: 0.06, uv: 0.4 });
  lathe([[0, 0], [0.7, 0], [0.95, 0.35], [0.9, 0.35], [0.66, 0.06], [0, 0.06]], M.white, x - 0.2, 1.5, z);
  W.st.egg = { home: new V3(x - 0.2, 2.4, z), stand: new V3(x - 2.7, 0, z), pushDir: new V3(1, 0, 0), land: new V3(x + 2.7, 0, z) };
}
function phone(x, z) {
  const pb = rbox(x - 0.85, x + 0.85, 0, 0.18, z - 1.65, z + 1.65, M.black, { r: 0.08 });
  const scr = mesh(new THREE.PlaneGeometry(1.5, 3.05), new THREE.MeshBasicMaterial({ color: 0x05070a, fog: false }), x, 0.185, z, { rx: -Math.PI / 2, cast: false, recv: false });
  const L = new THREE.PointLight(col(0xbfd4ff), 0, 26, 2); L.position.set(x, 1.4, z); W.group.add(L);
  W.st.phone = { pos: new V3(x, 0.2, z), scr, light: L, solid: pb.solid, box: { min: new V3(x - 0.85, 0, z - 1.65), max: new V3(x + 0.85, 3, z + 1.65) } };
}
// signature climbs: a cookbook stack (Family Kitchen) and a tall flour canister (Baker's House), each with a ribbon to climb and a pushpin on top
function cookbooks(x, z) {
  const cols = [0x8a2f2a, 0x2f5a8a, 0x3f7a4a, 0xc9a14a], hs = [0.62, 0.5, 0.58, 0.5]; let y = 0;
  for (let i = 0; i < 4; i++) { const ox = (i % 2 ? 0.12 : -0.1), w = 2.6 - i * 0.12; rbox(x - w / 2 + ox, x + w / 2 + ox, y, y + hs[i], z - 0.9, z + 0.9, M.flat(cols[i], 0.75), { r: 0.06 }); rbox(x - w / 2 + ox + 0.05, x + w / 2 + ox - 0.05, y + 0.06, y + hs[i] - 0.06, z + 0.88, z + 0.92, M.paper, { r: 0.01, solid: false, cast: false }); y += hs[i]; }
  grip(x - 0.35, x + 0.35, 0.25, y + 0.05, z + 0.9, z + 1.0); grip(x - 0.35, x + 0.35, y, y + 0.07, z + 0.1, z + 1.0);   // a cloth bookmark ribbon down the front
  W.pins.push({ pos: new V3(x + 0.8, y - 0.02, z + 0.75), dir: 'up', name: 'books' });
}
function canister(x, z) {
  const H = 6.0; cyl(x, z, 1.2, 0, H, M.flat(0xe9e3d4, 0.3), { seg: 40 }); cyl(x, z, 1.26, H - 0.5, H + 0.08, M.tin, { solid: false, seg: 40 });
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#e9e3d4'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#7a3b1a'; g.font = 'bold 54px Georgia,serif'; g.textAlign = 'center'; g.fillText('FLOUR', 128, 82); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.CylinderGeometry(1.205, 1.205, 1.2, 40, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, transparent: true }), x, 3.2, z, { cast: false });
  grip(x + 0.75, x + 1.35, 0.3, H + 0.05, z + 0.55, z + 1.15); grip(x + 0.6, x + 1.3, H, H + 0.07, z - 0.1, z + 1.15);   // a twine ribbon wrapped down one side
  W.pins.push({ pos: new V3(x - 0.2, H - 0.02, z + 0.9), dir: 'up', name: 'canister' });
}
// a wooden skewer stuck upright near the diner, with a pushpin on top: a landing for ziplines
function skewer(x, z, h, name) { cyl(x, z, 0.06, 0, h, M.wood, { seg: 8, cr: 0.12 }); W.pins.push({ pos: new V3(x, h - 0.05, z), dir: 'up', name }); }
W.jam = function (x, z, r) { const m = cyl(x, z, r, 0, 0.03, M.flat(0xa3152e, 0.08), { seg: 28, flags: { sticky: true }, cast: false }); return m; };
// a little wall-mounted tap that drips onto whatever is below it
function tap(at) {
  const [x, z] = at, y = 6.2; mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 14), M.chrome, x, y, z + 0.2, { rx: Math.PI / 2 }); mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 12), M.chrome, x, y - 0.3, z + 0.45);
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 14), M.chrome, x, y + 0.25, z + 0.2); const hit = P.ray(new V3(x, y - 0.7, z + 0.45), new V3(0, -1, 0), 10);
  W.st.tap = { from: new V3(x, y - 0.7, z + 0.45), land: hit ? hit.point : new V3(x, 0, z + 0.45), metal: !!(hit && hit.solid && hit.solid.unreachable) };
  const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), M.glass.clone()); d.material.opacity = 0.6; d.scale.y = 1.4; d.visible = false; W.group.add(d); W.st.tap.drop = d; W.st.tap.t = -1;
}
W.drip = function () { const t = W.st.tap; if (!t) return; t.t = 0; t.drop.visible = true; t.drop.position.copy(t.from); };
function pinMesh(p) {
  const g = new THREE.Group(); g.position.copy(p.pos); if (p.dir === 'wall') g.rotation.x = Math.PI / 2; W.group.add(g);
  mesh(new THREE.CylinderGeometry(0.02, 0.008, 0.5, 6), M.chrome, 0, 0.1, 0, { parent: g }); mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.22, 12), M.plastic, 0, 0.42, 0, { parent: g }); mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), M.plastic, 0, 0.55, 0, { parent: g });
  p.head = p.dir === 'wall' ? new V3(p.pos.x, p.pos.y, p.pos.z + 0.45) : new V3(p.pos.x, p.pos.y + 0.45, p.pos.z); p.mesh = g;
}

// ---------- home layouts ----------
const HOMES = MC.HOMES = [
  { name: 'The Flat', hole: -5.5, blurb: 'A student flat. Small, quiet, forgiving.', pal: {}, build() { breadBox(-14.5, -4.7); sponge(4.6, -5.6); breadSlice(2.5, 3.3); peaLid(-9.6, 3.4); mug(5.8, 3.4); kettle(14.4, -0.1); shaker(13.2, 4.2, 0); shaker(14.6, 3.6, 1); cookiePlate(9.6, 3.2); phone(-13.2, 1.2); W.spawn = new V3(0, 0, 0.2); } },   // toaster and bread box stand 1.0 off the wall: mouse alleys behind them
  { name: 'The Family Kitchen', hole: -9, blurb: 'Bright tiles, spaghetti night leftovers, and a cat.', pal: { woodA: 0xd9c8a8, woodB: 0xb39a72, tileA: 0x86b9b5, tileB: 0x6fa5a1, grout: 0xe9e5da, enamel: 0xc2463a, mugC: 0xf0c040, cab: 0xe6dfcf, sky: '#27376a', hemiSky: 0x7f94e0, towelA: 0x3f74c9, towelB: 0xf4f1e6 },
    build() { sponge(-15.5, -5.1); kettle(0.4, -4.1); breadBox(9, -4.7); breadSlice(-8.2, 3.3); noodles(-4.2, 0.4); peaLid(6.6, 3.6); mug(11.6, 3.0); shaker(14.2, 2.2, 0); shaker(15.1, 3.7, 1); cookiePlate(-13.0, 2.4); phone(-0.6, -0.6); cookbooks(6.3, -0.2); skewer(8.9, -0.9, 2.0, 'skewer'); W.spawn = new V3(-1, 0, 0.4); } },
  { name: "The Baker's House", blurb: 'Dark slate, eggs on the counter, a flour canister to scale, ants in the walls, and the cat is never far.', pal: { woodA: 0x5a4c40, woodB: 0x3a302a, tileA: 0x46505d, tileB: 0x3a434f, grout: 0x20242a, enamel: 0xd9a441, mugC: 0x3f7d5a, cab: 0x34454a, sky: '#1a2450', hemiSky: 0x8a9ce6, towelA: 0x4f8a3a, towelB: 0xefe3c4 },
    build() { kettle(-14.1, -0.6); breadBox(-4.2, -4.7); sponge(3.4, -5.1); breadSlice(4.2, 2.6); peaLid(0.6, 4.4); eggStand(-6.4, 2.4); noodles(-1.8, 1.2); mug(12.2, 3.2); shaker(-8.6, -1.7, 0); shaker(-7.1, -0.6, 1); cookiePlate(-12.6, 3.4); phone(2.0, 0.4); canister(14.6, 0.0); skewer(-5.4, -2.0, 2.0, 'skewer'); W.spawn = new V3(0, 0, -0.6); } },
];
W.build = function (homeId = 0, seed = 1) {
  if (W.group) { scene.remove(W.group); W.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  P.clear(); W.group = new THREE.Group(); scene.add(W.group);
  W.grips = []; W.flames = []; W.pins = []; W.seats = []; W.sources = []; W.cookies = []; W.st = {}; W.lines = []; W.keepOut = [];
  const home = HOMES[homeId % HOMES.length]; W.home = home; W.seed = seed;
  if (!GLOW) { GLOW = glowTex(); FLAME = flameTex(); }
  if (W.palKey !== homeId) { MC.buildMaterials(home.pal); W.palKey = homeId; }
  W.hole = new V3(home.hole == null ? -9 : home.hole, 0, -7);
  shell(home.pal); pub(home.pal); lights(home.pal); home.build(MC.rng(seed)); nightLight(W.hole.x + 1.9);
  W.spawn = new V3(-19, 0, -18.5);   // the night starts at home, in the pub
  W.pins.forEach(pinMesh); tap(home.tap || [15.2, -5.95]);
  buildEnv(); W.captureEnv(); scene.environment = W.envNight;
  P.buildGrid(PX0, CX1, PZ0, CZ1, 0.5);
  W.lit = 0; W.litTarget = 0; W.power = 1; W.flash = 0; W.clockDead = false; W.moonI = null; W.hemiI = null;
  MC.emit('world:built');
};

// ---------- per-frame ----------
W.setLit = v => { W.litTarget = v; };
W.update = function (dt, head) {
  if (W.water) W.water.update(dt);
  W.t += dt; const t = W.t;
  for (const f of W.flames) {
    const n = Math.sin(t * 11 + f.ph) * 0.5 + Math.sin(t * 23.7 + f.ph * 2) * 0.3 + Math.sin(t * 5.1 + f.ph) * 0.2, k = 1 + n * (0.08 + f.wild * 0.5);
    f.mesh.scale.set(0.2 * f.s * (1 - n * 0.08), 0.44 * f.s * (1 + n * 0.14 + f.wild * 0.7), 1); f.mesh.material.rotation = n * 0.06 * (1 + f.wild * 5);
    f.light.intensity = f.I * k * (f.on === false ? 0 : 1); f.glow.material.opacity = (0.3 + n * 0.08) * (f.on === false ? 0 : 1); f.mesh.visible = f.on !== false;
  }
  // lights-on blend (human in the kitchen)
  const d = W.litTarget - W.lit; if (Math.abs(d) > 1e-3) W.lit += d * Math.min(1, dt * (d > 0 ? 14 : 3)); else W.lit = W.litTarget;
  W.ceil.visible = W.lit > 0.01; W.ceil.intensity = 3.4 * W.lit; W.roomFill.intensity = 1.5 * W.lit; W.lamp.material.color.setRGB(0.02 + W.lit * 1.6, 0.02 + W.lit * 1.45, 0.02 + W.lit * 1.1);
  MC.scene.environment = W.lit > 0.5 ? W.envLit : W.envNight;
  MC.renderer.toneMappingExposure = lerp(W.baseExposure || 0.95, 0.8, W.lit); MC.scene.environmentIntensity = lerp(0.22, 0.8, W.lit);
  MC.scene.fog.density = lerp(0.011, 0.004, W.lit);
  if (W.flash > 0) W.flash = Math.max(0, W.flash - dt * (W.flash > 0.6 ? 9 : 2.2));
  // dawn: the moonlight warms into sunrise through the window
  const G0 = MC.game, pre = G0.mode === 'play' && G0.cfg && !G0.cfg.long && G0.t < 60 ? 0.35 * (1 - G0.t / 60) : 0;   // the sky starts warming in the last minute
  const dw = W.dawn = (W.dawn || 0) + ((G0.mode === 'dawn' ? 1 : pre) - (W.dawn || 0)) * Math.min(1, dt * 0.6);
  const tp = W.st.tap; if (tp && tp.t >= 0) { tp.t += dt; const fy = tp.from.y - 9.8 * tp.t * tp.t; if (fy <= tp.land.y) { tp.t = -1; tp.drop.visible = false; MC.sfx.drip(tp.land, tp.metal); } else tp.drop.position.y = fy; }
  W.moon.color.copy(MOON_C).lerp(SUN_C, dw); W.hemi.color.copy(W.hemiC).lerp(DAWN_C, dw); W.sky.material.color.setRGB(1 + dw * 2.2, 1 + dw * 1.1, 1 + dw * 0.5);
  const fl = (W.flash || 0) * ({ full: 1, dim: 0.3, off: 0 }[MC.opt.flash] ?? 1); W.moon.intensity = ((W.moonI == null ? 2.6 : W.moonI) + dw * 2.2) * (1 - W.lit * 0.8) * (1 + fl * 7); W.hemi.intensity = ((W.hemiI || 0.07) + dw * 0.9) * (1 + fl * 5);
  const pw = W.power == null ? 1 : W.power; if (W.nightLight) W.nightLight.intensity = 10 * pw; if (W.fairy) W.fairy.intensity = 5 * pw; if (W.bulbs) for (const b of W.bulbs) b.visible = pw > 0.5;
  for (const b of W.beams) b.material.opacity = 0.028 * (1 - W.lit) * (W.moonI == null ? 1 : W.moonI / 2.6);
  W.dust.material.opacity = 0.35 * (1 - W.lit * 0.7);
  const dp = W.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i += 1) { let y = dp.getY(i) - dt * 0.03 * (1 + (i % 5) * 0.2); if (y < 0.2) y = 9; dp.setY(i, y); dp.setX(i, dp.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.02); } dp.needsUpdate = true;
  if (head) W.playerGlow.position.set(head.x, head.y + 2.4, head.z + 0.6);
  if (W.bulbs) for (let i = 0; i < W.bulbs.length; i++) W.bulbs[i].scale.setScalar(1 + 0.15 * Math.sin(t * 2 + i * 1.7));
};
})();
