// The rest of the B&B's kitchen, at human size (1 unit is about 5 cm: the counter is 19 units off the floor): a breakfast table and
'use strict';
// chairs, a dresser of plates, the range, the fridge's clutter, a second window with the moon in it, pictures, a rug.
// Only for show: built once per home, merged by material so it costs a few draw calls. Plus the lens: depth of field on a screen.
(function () {
const { V3, col } = MC, W = MC.world, M = MC.M;
const FLOOR = -19;
let parts;   // [geometry, material] pairs, merged at the end
function add(geo, mat, x, y, z, ry = 0, rx = 0, rz = 0) { const m = new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(1, 1, 1)); const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m); for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k); parts.push([g, mat]); }
const box = (x0, x1, y0, y1, z0, z1, mat, r = 0.15, uv = 0.06) => add(MC.rboxGeo(x1 - x0, y1 - y0, z1 - z0, Math.min(r, (x1 - x0) / 2.2, (y1 - y0) / 2.2, (z1 - z0) / 2.2), uv), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
const cyl = (x, y0, y1, z, r0, r1, mat, seg = 20) => add(new THREE.CylinderGeometry(r1, r0, y1 - y0, seg), mat, x, (y0 + y1) / 2, z);
const lathe = (pts, mat, x, y, z, seg = 28) => add(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), mat, x, y, z);
function picture(x, y, z, w, h, ry, seed) {   // a framed print: a little landscape painted on a canvas
  const c = document.createElement('canvas'); c.width = 128; c.height = 96; const g = c.getContext('2d'), r = MC.rng(seed), sky = g.createLinearGradient(0, 0, 0, 96);
  sky.addColorStop(0, ['#9db7c9', '#d9b48a', '#8aa3a0'][seed % 3]); sky.addColorStop(1, '#e8dcc0'); g.fillStyle = sky; g.fillRect(0, 0, 128, 96);
  for (let k = 0; k < 4; k++) { g.fillStyle = ['#5f7a52', '#48603f', '#7a6a4a', '#3d5240'][k]; g.beginPath(); g.moveTo(0, 96); for (let x2 = 0; x2 <= 128; x2 += 8) g.lineTo(x2, 50 + k * 10 + Math.sin(x2 * 0.05 + r() * 6) * 8 * r()); g.lineTo(128, 96); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.position.set(x, y, z); m.rotation.y = ry; W.group.add(m);
  const fr = new THREE.Mesh(MC.rboxGeo(w + 0.8, h + 0.8, 0.3, 0.1), M.wood); fr.position.set(x - Math.sin(ry) * 0.18, y, z - Math.cos(ry) * 0.18); fr.rotation.y = ry; W.group.add(fr);
}
function chair(x, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  for (const [dx, dz] of [[-3.6, -3.6], [3.6, -3.6], [-3.6, 3.6], [3.6, 3.6]]) { const [px, pz] = P(dx, dz); cyl(px, FLOOR, dz < 0 ? FLOOR + 19 : FLOOR + 9, pz, 0.38, 0.45, M.wood, 10); }
  add(MC.rboxGeo(8.6, 0.7, 8.6, 0.25, 0.05), M.wood, x, FLOOR + 9.2, z, ry);
  add(MC.rboxGeo(8.2, 0.9, 8.2, 0.4, 0.05), M.towel || M.felt, x, FLOOR + 9.9, z, ry);   // seat pad
  for (const h of [13, 16, 18.6]) { const [px, pz] = P(0, -3.6); add(MC.rboxGeo(7.6, 1.1, 0.5, 0.2, 0.05), M.wood, px, FLOOR + h, pz, ry); }
}
function build() {
  parts = []; const wood = M.wood, white = M.white, pal = W.home.pal || {};
  // ----- breakfast table, laid for the morning -----
  const tx = 2, tz = 37, ty = FLOOR + 15;
  for (const [dx, dz] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) cyl(tx + dx, FLOOR, ty - 0.8, tz + dz, 0.55, 0.75, wood, 12);
  box(tx - 11, tx + 11, ty - 0.9, ty, tz - 8, tz + 8, wood, 0.3, 0.05);
  box(tx - 9.5, tx + 9.5, ty - 2.2, ty - 0.9, tz - 6.6, tz + 6.6, wood, 0.2, 0.05);            // apron
  add(new THREE.BoxGeometry(12, 0.06, 16.6), M.felt, tx, ty + 0.04, tz, Math.PI / 2);           // runner
  for (const [dx, dz] of [[-6, -4.5], [6, -4.5], [-6, 4.5], [6, 4.5]]) { lathe([[0, 0], [1.6, 0], [2.4, 0.25], [2.5, 0.32], [0, 0.2]], white, tx + dx, ty + 0.05, tz + dz); lathe([[0, 0], [0.55, 0], [0.75, 1.3], [0.7, 1.3], [0.5, 0.1], [0, 0.1]], M.ceramic, tx + dx + 2.6, ty + 0.05, tz + dz - 1.2, 16); }
  lathe([[0, 0], [1.1, 0], [1.6, 1.2], [1.2, 3.4], [0.7, 4.4], [0.9, 5], [0.8, 5], [0.55, 4.4], [0, 4.4]], M.glass, tx, ty + 0.1, tz);   // vase
  for (let k = 0; k < 5; k++) { const a = k * 1.3; cyl(tx + Math.cos(a) * 0.3, ty + 3, ty + 8 + (k % 2), tz + Math.sin(a) * 0.3, 0.06, 0.06, M.pea, 5); add(new THREE.SphereGeometry(0.75, 10, 8), [M.cheese, M.plastic, M.white, M.crust, M.pink][k], tx + Math.cos(a) * 0.9, ty + 8.4 + (k % 2), tz + Math.sin(a) * 0.9); }
  lathe([[0, 0], [1.4, 0], [2.6, 0.9], [2.8, 1.6], [2.6, 1.6], [2.3, 1.0], [0, 0.3]], wood, tx + 6.5, ty + 0.05, tz);   // fruit bowl
  for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(0.95, 12, 10), [M.plastic, M.cheese, M.pea, M.crust][k], tx + 6.5 + Math.cos(k * 1.7) * 1.1, ty + 1.7, tz + Math.sin(k * 1.7) * 1.1);
  chair(tx - 6, tz - 11, 0); chair(tx + 6, tz - 11, 0.25); chair(tx - 6, tz + 11, Math.PI); chair(tx + 6, tz + 11, Math.PI - 0.15); chair(tx - 15, tz, Math.PI / 2 + 0.4);
  add(new THREE.BoxGeometry(40, 0.12, 30), M.felt, tx, FLOOR + 0.07, tz);                         // rug
  // ----- dresser against the far wall: plates stood on edge, jugs, drawers -----
  const dx0 = 22, dx1 = 44, dz = 52.6;
  box(dx0, dx1, FLOOR, FLOOR + 17, dz - 4.6, dz + 1, M.cab, 0.3, 0.05); box(dx0 - 0.5, dx1 + 0.5, FLOOR + 17, FLOOR + 17.8, dz - 5, dz + 1, wood, 0.25, 0.05);
  for (let k = 0; k < 3; k++) { box(dx0 + 1 + k * 7, dx0 + 7 + k * 7, FLOOR + 11.5, FLOOR + 15.8, dz - 4.8, dz - 4.5, wood, 0.1, 0.05); add(new THREE.SphereGeometry(0.35, 8, 6), M.brass, dx0 + 4 + k * 7, FLOOR + 13.6, dz - 5); box(dx0 + 1 + k * 7, dx0 + 7 + k * 7, FLOOR + 1.5, FLOOR + 10.5, dz - 4.8, dz - 4.5, wood, 0.1, 0.05); }
  box(dx0, dx0 + 0.9, FLOOR + 17.8, FLOOR + 40, dz - 2.4, dz + 1, M.cab, 0.2, 0.05); box(dx1 - 0.9, dx1, FLOOR + 17.8, FLOOR + 40, dz - 2.4, dz + 1, M.cab, 0.2, 0.05); box(dx0, dx1, FLOOR + 40, FLOOR + 41.2, dz - 3, dz + 1, wood, 0.25, 0.05);
  for (const sy of [25, 32.5]) { box(dx0, dx1, FLOOR + sy, FLOOR + sy + 0.6, dz - 2.4, dz + 1, wood, 0.15, 0.05); for (let k = 0; k < 5; k++) add(new THREE.CylinderGeometry(2.3, 2.3, 0.25, 28), k % 2 ? white : M.ceramic, dx0 + 2.8 + k * 4.1, FLOOR + sy + 3, dz - 0.2, 0, Math.PI / 2 - 0.2); }
  for (let k = 0; k < 3; k++) lathe([[0, 0], [1.2, 0], [1.6, 1.4], [1.3, 3.2], [1.0, 3.6], [1.2, 4.2], [1.05, 4.2], [0, 3.4]], [white, M.ceramic, M.paint][k], dx0 + 4 + k * 6.5, FLOOR + 17.8, dz - 2.2);
  // ----- the range to the right of the counter: burners, a pan, a kettle, the hood -----
  for (const [bx, bz] of [[21, -2.5], [28, -2.5], [21, 3], [28, 3]]) { add(new THREE.TorusGeometry(2.1, 0.22, 8, 28), M.black, bx, -0.25, bz, 0, Math.PI / 2); add(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 16), M.black, bx, -0.3, bz); }
  lathe([[0, 0], [3.2, 0], [3.6, 1.6], [3.4, 1.6], [3.0, 0.25], [0, 0.25]], M.black, 28, -0.1, 3); add(new THREE.CylinderGeometry(0.35, 0.35, 6, 8), M.black, 28 + 4.6, 1.2, 3 + 2.6, 0.5, 0, Math.PI / 2);   // frying pan and handle
  lathe([[0, 0], [2.6, 0], [3.0, 1.2], [2.4, 4.2], [1.0, 5], [0, 5]], M.steel, 21, -0.1, -2.5); add(new THREE.TorusGeometry(2.0, 0.22, 6, 20, Math.PI), M.black, 21, 5, -2.5);
  for (let k = 0; k < 5; k++) add(new THREE.CylinderGeometry(0.7, 0.7, 0.9, 14), M.black, 19 + k * 3, -3.2, 6.6, 0, Math.PI / 2);   // knobs
  box(18, 33.5, -17, -5.5, 6.3, 6.5, M.black, 0.1); add(new THREE.CylinderGeometry(0.3, 0.3, 13, 8), M.chrome, 25.7, -4.6, 6.9, 0, 0, Math.PI / 2);   // oven door and rail
  box(17.5, 34, 20, 26, -6, 4, M.steel, 0.4, 0.05);                                                // hood
  // ----- fridge clutter: handle, magnets, a list -----
  for (let k = 0; k < 6; k++) add(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12), [M.plastic, M.cheese, M.pea, M.paint, M.brass, M.pink][k], -16.05, 6 + (k % 3) * 3.3 + (k % 2), -2 + k * 1.7, 0, 0, Math.PI / 2);
  // ----- skirting, door frame and coat hooks on the right wall, a wall clock, shelf of jars on the left of the far wall -----
  box(-34, 62, FLOOR, FLOOR + 2.2, 53.4, 54, white, 0.1, 0.05); box(61.4, 62, FLOOR, FLOOR + 2.2, -8, 54, white, 0.1, 0.05);
  box(61.2, 62, FLOOR, FLOOR + 42, 22, 23.4, white, 0.1, 0.05); box(61.2, 62, FLOOR, FLOOR + 42, 36.6, 38, white, 0.1, 0.05); box(61.2, 62, FLOOR + 40.6, FLOOR + 42, 22, 38, white, 0.1, 0.05);
  box(-30, -8, FLOOR + 30, FLOOR + 30.8, 50.5, 54, wood, 0.2, 0.05); for (let k = 0; k < 6; k++) { lathe([[0, 0], [1.3, 0], [1.4, 0.2], [1.4, 3.2], [1.1, 3.6], [1.1, 4.1], [0, 4.1]], M.glass, -28 + k * 3.6, FLOOR + 30.8, 52.3, 16); cyl(-28 + k * 3.6, FLOOR + 31, FLOOR + 32.2 + (k % 3) * 0.7, 52.3, 1.15, 1.15, [M.pea, M.crust, M.cheese, M.cork, M.pink, M.white][k], 14); }
  lathe([[0, 0], [3.4, 0], [3.6, 0.3], [3.4, 0.6], [0, 0.6]], white, 10, FLOOR + 36, 53.6); add(new THREE.CylinderGeometry(3.0, 3.0, 0.1, 30), M.white, 10, FLOOR + 36.5, 53.3);
  // ----- far window: a deep frame, curtains drawn back, the moon in it -----
  const wx = 4, wy = FLOOR + 30, ww = 13, wh = 15;
  for (const sx of [-1, 1]) box(wx + sx * ww / 2 - 0.5, wx + sx * ww / 2 + 0.5, wy - wh / 2, wy + wh / 2, 53.2, 54, white, 0.15, 0.05);
  for (const sy of [-1, 0, 1]) box(wx - ww / 2, wx + ww / 2, wy + sy * wh / 2 - 0.4, wy + sy * wh / 2 + 0.4, 53.2, 54, white, 0.15, 0.05);
  box(wx - 0.35, wx + 0.35, wy - wh / 2, wy + wh / 2, 53.3, 54, white, 0.1, 0.05); box(wx - ww / 2 - 1, wx + ww / 2 + 1, wy - wh / 2 - 0.9, wy - wh / 2, 52.4, 54, white, 0.2, 0.05);
  for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) add(new THREE.CylinderGeometry(0.75, 0.9, wh + 4, 8), M.paint, wx + sx * (ww / 2 + 0.6 + k * 0.9), wy - 0.5, 53.1 - (k % 2) * 0.5);   // curtain folds
  add(new THREE.CylinderGeometry(0.25, 0.25, ww + 12, 8), M.brass, wx, wy + wh / 2 + 2, 52.9, 0, 0, Math.PI / 2);
  // merge by material
  const by = new Map(); for (const [g, m] of parts) { if (!by.has(m)) by.set(m, []); by.get(m).push(g); }
  for (const [m, gs] of by) { const g = THREE.BufferGeometryUtils.mergeGeometries(gs, false); if (!g) continue; const me = new THREE.Mesh(g, m); me.castShadow = true; me.receiveShadow = true; me.userData.room = true; W.group.add(me); for (const x of gs) x.dispose(); }
  // the glass and the night outside the far window (the same sky the near window shows), and its moonlight across the table and floor
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: W.sky.material.map, fog: false })); sky.position.set(wx, wy, 53.95); sky.rotation.y = Math.PI; W.group.add(sky); W.sky2 = sky;
  const sp = new THREE.SpotLight(col(0xb9c9ff), 6, 0, 0.45, 0.4, 0); sp.position.set(wx, wy + 5, 52.8); sp.target.position.set(tx - 2, FLOOR, tz - 4); W.group.add(sp, sp.target); W.roomSpot = sp;   // moonlight falls in through the far window onto the table and floor, and nowhere else
  if (MC.opt.quality > 1) { sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.camera.near = 3; sp.shadow.camera.far = 80; sp.shadow.bias = -0.002; sp.shadow.radius = 3; }
  // its shaft in the air
  const bm = new THREE.MeshBasicMaterial({ color: col(0x8fa8ff), transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }); W.beams2 = [];
  for (let i = 0; i < 6; i++) { const x = wx - ww / 2 + 1 + i * (ww - 2) / 5, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([x, wy + wh / 2, 53, x, wy - wh / 2, 53, x - 5, FLOOR, 53 - (wy - wh / 2 - FLOOR) * 0.75, x - 5, FLOOR, 53 - (wy + wh / 2 - FLOOR) * 0.75], 3)); g.setIndex([0, 1, 2, 0, 2, 3]); const b = new THREE.Mesh(g, bm); W.group.add(b); W.beams2.push(b); }
  picture(-20, FLOOR + 36, 53.9, 9, 7, Math.PI, 1); picture(50, FLOOR + 34, 53.9, 7, 9, Math.PI, 2); picture(61.9, FLOOR + 34, 8, 10, 7, -Math.PI / 2, 3);
}
MC.on('world:built', () => { try { build(); W.captureEnv(); MC.scene.environment = W.envNight; } catch (e) { console.error('room', e); } });

// ---------- the lens: depth of field on a screen (not in a headset: your own eyes focus there) ----------
const R = MC.renderer; let rt = null, quad = null, qs = null, qc = null, focus = 6;
const FS = `uniform sampler2D tC; uniform sampler2D tD; uniform vec2 px; uniform float near; uniform float far; uniform float focus; uniform float amt; varying vec2 vUv;
float lin(float d) { float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
void main() { float d = lin(texture2D(tD, vUv).x); float coc = clamp(abs(d - focus) / max(focus, 1.5) - 0.35, 0.0, 1.0) * amt; if (d < focus) coc *= 0.6;
  vec3 c = texture2D(tC, vUv).rgb; float w = 1.0;
  for (int i = 0; i < 16; i++) { float a = float(i) * 2.39996, r = sqrt((float(i) + 0.5) / 16.0); vec2 o = vec2(cos(a), sin(a)) * r * coc * 9.0 * px; float d2 = lin(texture2D(tD, vUv + o).x); float k = d2 > focus * 0.8 || d2 >= d - 0.5 ? 1.0 : 0.15; c += texture2D(tC, vUv + o).rgb * k; w += k; }
  gl_FragColor = vec4(c / w, 1.0); }`;
function setup() {
  const s = R.getDrawingBufferSize(new THREE.Vector2());
  if (rt) { rt.dispose(); rt.depthTexture.dispose(); }
  rt = new THREE.WebGLRenderTarget(s.x, s.y, { samples: MC.opt.quality > 1 ? 4 : 0, type: THREE.HalfFloatType }); rt.depthTexture = new THREE.DepthTexture(s.x, s.y); rt.depthTexture.type = THREE.UnsignedIntType;
  if (!quad) { qs = new THREE.Scene(); qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, tD: { value: null }, px: { value: new THREE.Vector2() }, near: { value: 0.1 }, far: { value: 100 }, focus: { value: 6 }, amt: { value: 1 } }, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FS.replace('gl_FragColor = vec4(c / w, 1.0); }', 'gl_FragColor = vec4(c / w, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'), depthTest: false, depthWrite: false }));
    quad.frustumCulled = false; qs.add(quad); }
  quad.material.uniforms.px.value.set(1 / s.x, 1 / s.y);
}
const _o = new V3(), _d = new V3();
// draw the frame: through the lens on a screen at Medium and up, straight otherwise
MC.draw = function (dt = 0.016) {
  const on = !MC.isXR() && MC.opt.quality > 0 && MC.opt.dof !== false && MC.game.mode !== 'menu';
  if (!on) { R.render(MC.scene, MC.camera); return; }
  const s = R.getDrawingBufferSize(new THREE.Vector2()); if (!rt || rt.width !== s.x || rt.height !== s.y) setup();
  // focus where you are looking, eased, never closer than your paws
  MC.camera.getWorldPosition(_o); MC.camera.getWorldDirection(_d); const hit = MC.phys.ray(_o, _d, 80), want = Math.max(2.2, hit ? hit.t : 30); focus += (want - focus) * Math.min(1, dt * 4);
  const u = quad.material.uniforms; u.tC.value = rt.texture; u.tD.value = rt.depthTexture; u.near.value = MC.camera.near; u.far.value = MC.camera.far; u.focus.value = focus; u.amt.value = 1;
  R.setRenderTarget(rt); R.render(MC.scene, MC.camera); R.setRenderTarget(null); R.render(qs, qc);
};
})();
