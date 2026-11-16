// what makes the room look used and the air look thick: grime and wear on the floor and walls, shade under everything that stands, smoke that hangs under the lamps and dust in their light, the things left about, the street outside at night with the moon through the windows, the room's own reflections, and on a screen a darker, grainier picture
import * as THREE from 'three';
import { G } from '../sushi/ctx.js';
import { R } from './room.js';
import { pbr, plain, brass, slab, tube, model, canvasTex, glow } from './kit.js';
import { buildTown } from './town.js';

const _cam = new THREE.Vector3();
const rnd = (() => { let s = 91; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

export function buildLook(scene, room, renderer, camera) {
  const { W, E, L, B, H } = R, LX = W + E, LZ = L + B, CX = (E - W) / 2, CZ = (B - L) / 2, g = new THREE.Group(); scene.add(g);
  const mul = (map, o = 1) => new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, opacity: o, fog: false });
  const blot = (x, cx, cy, r, a, sx = 1) => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(cx, cy); x.scale(sx, 1); x.translate(-cx, -cy); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore(); };

  // ---- the floor: dark along the walls and under whatever stands, worn pale where boots go, stained where things were spilt
  { const S = 1024, FW = LX, FL = LZ, px = (x) => (x + W) / FW * S, pz = (z) => (z + L) / FL * S, k = S / FW;
    const t = canvasTex(S, S, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
      for (const [x0, y0, x1, y1] of [[0, 0, 0, 90], [0, S, 0, S - 90], [0, 0, 90, 0], [S, 0, S - 90, 0]]) { const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, S, S); }
      for (let i = 0; i < 260; i++) blot(x, rnd() * S, rnd() * S, 6 + rnd() * 46, 0.05 + rnd() * 0.16, 0.5 + rnd() * 2.5);
      for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.07})`; x.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 8 + rnd() * 50); }
      for (const s of room.solids) { if (s.step) continue; const cx = px((s.x0 + s.x1) / 2), cy = pz((s.z0 + s.z1) / 2), r = Math.max(s.x1 - s.x0, s.z1 - s.z0) * k * 0.75; blot(x, cx, cy, Math.min(r, 150), s.low ? 0.5 : 0.62, Math.max(0.3, Math.min(3.5, (s.x1 - s.x0) / (s.z1 - s.z0)))); }
      for (const s of room.seats) blot(x, px(s.x), pz(s.z), 30, 0.5);
      { const gr = x.createLinearGradient(0, pz(R.barZ0 - 0.9), 0, pz(R.barZ0)); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = gr; x.fillRect(px(-R.barX), pz(R.barZ0 - 0.9), 2 * R.barX * k, 0.9 * k); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(px(-W), pz(R.barZ1), S, S); }
      x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const f = i / 25; blot2(x, px(Math.sin(f * 5) * 0.5), pz(-L + 0.8 + f * (L - 2.4)), 64, 0.05); } for (let i = 0; i < 14; i++) blot2(x, px(-R.barX + i * 0.5), pz(R.barZ0 - 0.55), 44, 0.045); });
    function blot2(x, cx, cy, r, a) { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(FW, FL).rotateX(-Math.PI / 2), mul(t)); m.position.set(CX, 0.004, CZ); m.renderOrder = 1; m.userData.nopick = true; g.add(m); }

  // ---- the moon through the street windows: its panes laid pale on the floor (no lamp spent on it)
  { const t = canvasTex(128, 128, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const gr = x.createLinearGradient(0, j * 62, 0, j * 62 + 60); gr.addColorStop(0, 'rgba(120,140,190,.55)'); gr.addColorStop(1, 'rgba(120,140,190,.2)'); x.fillStyle = gr; x.fillRect(4 + i * 41, 4 + j * 62, 37, 56); } });
    for (const sx of [-4.4, 4.4]) { const gm = new THREE.PlaneGeometry(2.3, 2.9).rotateX(-Math.PI / 2), p = gm.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0) p.setX(i, p.getX(i) + 1.1); const m = new THREE.Mesh(gm, new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5, fog: false })); m.position.set(sx + 0.3, 0.007, -L + 2.2); m.renderOrder = 2; m.userData.nopick = true; g.add(m); } }

  // ---- the air: smoke lying in sheets under the lamps, a cone of lit haze below each wheel, dust turning in it
  const smokeT = canvasTex(256, 256, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { const cx = rnd() * 256, cy = rnd() * 256, r = 14 + rnd() * 50, gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,220,170,${0.05 + rnd() * 0.09})`); gr.addColorStop(1, 'rgba(255,220,170,0)'); x.fillStyle = gr; for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { x.beginPath(); x.arc(cx + ox, cy + oy, r, 0, 7); x.fill(); } } }); smokeT.wrapS = smokeT.wrapT = THREE.RepeatWrapping;
  const sheets = []; for (let i = 0; i < 2; i++) { const t = smokeT.clone(); t.needsUpdate = true; t.repeat.set(1.6 + i * 0.3, 1.4 + i * 0.2); t.offset.set(rnd(), rnd()); const m = new THREE.Mesh(new THREE.PlaneGeometry(LX - 0.4, LZ - 0.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.085, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(CX, 2.0 + i * 0.7, CZ); m.userData.nopick = true; m.renderOrder = 6; g.add(m); sheets.push({ t, m, vx: (rnd() - 0.5) * 0.006, vz: 0.003 + rnd() * 0.004 }); }
  const coneT = canvasTex(64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,190,110,.5)'); gr.addColorStop(0.5, 'rgba(255,180,100,.14)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
  for (const o of room.lamps) if (o.wheel) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 3.0, o.y - 0.1, 32, 1, true), new THREE.MeshBasicMaterial({ map: coneT, transparent: true, opacity: 0.012, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, fog: false })); c.position.set(o.x, (o.y - 0.1) / 2 + 0.05, o.z); c.userData.nopick = true; c.renderOrder = 7; g.add(c); o.cone = c; }
  const N = 260, mp = new Float32Array(N * 3), mv = []; for (let i = 0; i < N; i++) { const o = room.lamps[i % 3]; mp[i * 3] = o.x + (rnd() - 0.5) * 3.4; mp[i * 3 + 1] = 0.4 + rnd() * 2.4; mp[i * 3 + 2] = o.z + (rnd() - 0.5) * 3.4; mv.push(rnd() * 6.3); }
  const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(mp, 3)), new THREE.PointsMaterial({ color: 0xffc890, size: 0.006, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })); motes.userData.nopick = true; motes.frustumCulled = false; g.add(motes);

  // ---- what people leave about: lamps and cards on the tables, sacks and a broom, a ladder, a trunk by the door, pegs with hats, pictures, a rug by the stove
  { const flame = (x, y, z) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffb060, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.12); s.position.set(x, y, z); s.userData.nopick = true; g.add(s); };
    for (const t of room.tables) { if (t.name !== 'poker') { model('wooden_candlestick', t.x + 0.05, 0.76, t.z - 0.04, 0, { h: 0.22 }, g); flame(t.x + 0.05, 1.02, t.z - 0.04); } }
    const cardM = plain(0xe8e0cc, { rough: 0.8 }), back = plain(0x7a1818, { rough: 0.8 }), chip = [plain(0xb02020), plain(0x1a3a8a), plain(0xe8e4d8)];
    for (let i = 0; i < 16; i++) { const a = rnd() * 6.3, r = 0.08 + rnd() * 0.3, c = slab(0.057, 0.0012, 0.088, i % 3 ? back : cardM, R.poker.x + Math.cos(a) * r, 0.768 + i * 0.0003, R.poker.z + Math.sin(a) * r, g); c.rotation.y = rnd() * 6.3; c.castShadow = false; }
    for (let i = 0; i < 9; i++) { const a = i * 0.7, n = 2 + (i * 5 % 6); tube(0.019, 0.019, 0.0035 * n, chip[i % 3], R.poker.x + Math.cos(a) * 0.3, 0.767 + 0.00175 * n, R.poker.z + Math.sin(a) * 0.3, g, 10).castShadow = false; }
    model('wooden_broom', 5.75, 0, 1.35, 0.4, { h: 1.35 }, g).rotation.z = 0.16; model('vintage_suitcase', 5.3, 0, -9.5, 0.5, { h: 0.42 }, g); model('wooden_crate_01', 5.3, 0, 1.2, 0.3, { h: 0.5 }, g); model('jug_01', 5.3, 0.5, 1.2, 0, { h: 0.28 }, g);
    for (let i = 0; i < 5; i++) { const x = 1.6 + i * 0.34; tube(0.012, 0.012, 0.11, pbr('walnut', { tile: 0.4 }), x, 1.72, -L + 0.06, g, 6).rotation.x = Math.PI / 2; if (i % 2 === 0) { const hat = new THREE.Group(); hat.position.set(x, 1.72, -L + 0.2); hat.rotation.x = 1.25; g.add(hat); const fm = plain([0x3e3226, 0x24201c, 0x574b3e][i >> 1]); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.012, 20), fm); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 16), fm); cr.position.y = 0.06; hat.add(br, cr); br.castShadow = cr.castShadow = true; } } }

  const town = buildTown(scene, room); g.userData.moon = town.moon;

  // ---- the room seen in its own glass and brass: one look round from the middle, kept (taken again when the lamps change)
  const moonS = g.children.find((o) => o.isSprite && o.scale.x > 5) || null;
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType }), cube = new THREE.CubeCamera(0.1, 60, cubeRT); cube.position.set(0, 1.7, -3.2); scene.add(cube);
  const pm = new THREE.PMREMGenerator(renderer); let envRT = null;
  const reflect = () => { const mv = moonS ? moonS.visible : 0; if (moonS) moonS.visible = false; scene.environment = null; const mr = room.mirror, mrv = mr ? mr.visible : 0; if (mr) mr.visible = false; cube.update(renderer, scene); if (mr) mr.visible = mrv; if (moonS) moonS.visible = mv; const rt = pm.fromCubemap(cubeRT.texture); scene.environment = rt.texture; scene.environmentIntensity = 1; if (envRT) envRT.dispose(); envRT = rt;
    if (room.mirror && !room.mirror.userData.rich) { room.mirror.userData.rich = true; room.mirror.material = new THREE.MeshBasicMaterial({ envMap: cubeRT.texture, color: 0x8a867c }); } };

  // ---- on a screen: the picture darkened at its edges, pulled warm, with grain (a headset gets the room as it is)
  // 480i: each frame draws one field of 240 lines, a line lower than the last; the two are woven into 480
  const LINES = 480, F = [null, null]; let field = 0, fresh = 0; const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tA: { value: null }, tB: { value: null }, res: { value: new THREE.Vector2(640, LINES) }, hurt: { value: 0 }, bright: { value: 1 }, sat: { value: 0.8 }, warm: { value: 0.05 }, vig: { value: 0.3 }, grain: { value: 0.012 }, contrast: { value: 0.25 }, t: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tA, tB; uniform vec2 res; uniform float t, hurt, bright, sat, warm, vig, grain, contrast; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + t) * 43758.5453); }
      void main(){ vec2 px = floor(vUv * res); float odd = mod(px.y, 2.0); vec2 uv = vec2((px.x + 0.5) / res.x, (floor(px.y * 0.5) + 0.5) / (res.y * 0.5)); vec3 c = odd < 0.5 ? texture2D(tA, uv).rgb : texture2D(tB, uv).rgb; vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 0.82)));
        c *= bright; c = clamp((c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14), 0.0, 1.0); float l = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(vec3(l), c, sat); c *= vec3(1.0 + warm * 0.3, 1.0, 1.0 - warm * 0.7); c = c * (1.0 - vig + vig * v); c = mix(c, c * c * (3.0 - 2.0 * c), contrast);
        c = mix(c, vec3(0.5, 0.0, 0.0), hurt * (1.0 - v) * 0.8); c = pow(c, vec3(1.0 / 2.2)) + (h(px) - 0.5) * grain;
        gl_FragColor = vec4(c, 1.0); }` }));
  const qs = new THREE.Scene(), qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); qs.add(quad); quad.frustumCulled = false;
  const size = () => { const w = Math.max(64, Math.round(LINES * innerWidth / innerHeight)); for (let i = 0; i < 2; i++) { F[i]?.dispose(); F[i] = new THREE.WebGLRenderTarget(w, LINES / 2, { type: THREE.HalfFloatType, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter }); } quad.material.uniforms.res.value.set(w, LINES); quad.material.uniforms.tA.value = F[0].texture; quad.material.uniforms.tB.value = F[1].texture; fresh = 0; }; size(); addEventListener('resize', size);
  const drawField = (f) => { const w = F[f].width; camera.setViewOffset(w, LINES, 0, f, w, LINES); renderer.setRenderTarget(F[f]); renderer.render(scene, camera); camera.clearViewOffset(); };

  let frames = 0;
  const look = { group: g, reflect, moon: g.userData.moon, town, grade: quad.material.uniforms, smoke: sheets, motes,
    update(dt, t) { town.update(dt, t); const low = camera.getWorldPosition(_cam).y < 2.5; for (const s of sheets) s.m.visible = low; for (const s of sheets) { s.t.offset.x += s.vx * dt; s.t.offset.y += s.vz * dt; } const p = motes.geometry.attributes.position; for (let i = 0; i < N; i++) { p.array[i * 3] += Math.sin(t * 0.21 + mv[i]) * 0.012 * dt; p.array[i * 3 + 1] += Math.sin(t * 0.13 + mv[i] * 2) * 0.01 * dt; p.array[i * 3 + 2] += Math.cos(t * 0.17 + mv[i]) * 0.012 * dt; } p.needsUpdate = true; for (const o of room.lamps) if (o.cone) o.cone.visible = o.on; },
    render() { renderer.info.autoReset = false; renderer.info.reset(); renderer.shadowMap.autoUpdate = false; if (frames < 8 || frames === 60 || frames === 240 || look.relight) { renderer.shadowMap.needsUpdate = true; look.relight = false; }   // the lamps' shadows are laid once, of what stands still (people have their own shade under them)
      if (++frames === 3 || frames === 40 || (town.baked && !look.env2)) { if (town.baked) look.env2 = true; reflect(); } if (renderer.xr.isPresenting) return renderer.render(scene, camera);
      const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping; if (fresh < 2 || G.frozen) { drawField(0); drawField(1); fresh = 2; } else { field ^= 1; drawField(field); } renderer.setRenderTarget(null); quad.material.uniforms.t.value = (G.t * 30 | 0) % 61; quad.material.uniforms.hurt.value = Math.max(0, G.hurtT || 0); renderer.render(qs, qc); renderer.toneMapping = tm; } };
  return look;
}
