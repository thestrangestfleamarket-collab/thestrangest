// what makes the room look used and the air look thick: grime and wear on the floor and walls, shade under everything that stands, smoke that hangs under the lamps and dust in their light, the things left about, the street outside at night with the moon through the windows, the room's own reflections, and on a screen a darker, grainier picture
import * as THREE from 'three';
import { G } from '../sushi/ctx.js';
import { R } from './room.js';
import { pbr, plain, brass, slab, tube, model, canvasTex, glow } from './kit.js';

const rnd = (() => { let s = 91; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

export function buildLook(scene, room, renderer, camera) {
  const { W, L, B, H } = R, g = new THREE.Group(); scene.add(g);
  const mul = (map, o = 1) => new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, opacity: o, fog: false });
  const blot = (x, cx, cy, r, a, sx = 1) => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(cx, cy); x.scale(sx, 1); x.translate(-cx, -cy); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore(); };

  // ---- the floor: dark along the walls and under whatever stands, worn pale where boots go, stained where things were spilt
  { const S = 1024, FW = 2 * W, FL = L + B, px = (x) => (x + W) / FW * S, pz = (z) => (z + L) / FL * S, k = S / FW;
    const t = canvasTex(S, S, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
      for (const [x0, y0, x1, y1] of [[0, 0, 0, 90], [0, S, 0, S - 90], [0, 0, 90, 0], [S, 0, S - 90, 0]]) { const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, S, S); }
      for (let i = 0; i < 260; i++) blot(x, rnd() * S, rnd() * S, 6 + rnd() * 46, 0.05 + rnd() * 0.16, 0.5 + rnd() * 2.5);
      for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.07})`; x.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 8 + rnd() * 50); }
      for (const s of room.solids) { if (s.step) continue; const cx = px((s.x0 + s.x1) / 2), cy = pz((s.z0 + s.z1) / 2), r = Math.max(s.x1 - s.x0, s.z1 - s.z0) * k * 0.75; blot(x, cx, cy, Math.min(r, 150), s.low ? 0.5 : 0.62, Math.max(0.3, Math.min(3.5, (s.x1 - s.x0) / (s.z1 - s.z0)))); }
      for (const s of room.seats) blot(x, px(s.x), pz(s.z), 30, 0.5);
      { const gr = x.createLinearGradient(0, pz(R.barZ0 - 0.9), 0, pz(R.barZ0)); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = gr; x.fillRect(px(-R.barX), pz(R.barZ0 - 0.9), 2 * R.barX * k, 0.9 * k); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(px(-W), pz(R.barZ1), S, S); }
      x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const f = i / 25; blot2(x, px(Math.sin(f * 5) * 0.5), pz(-L + 0.8 + f * (L - 2.4)), 70, 0.05); } for (let i = 0; i < 14; i++) blot2(x, px(-R.barX + i * 0.5), pz(R.barZ0 - 0.55), 44, 0.045); });
    function blot2(x, cx, cy, r, a) { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(FW, FL).rotateX(-Math.PI / 2), mul(t)); m.position.set(0, 0.004, (B - L) / 2); m.renderOrder = 1; m.userData.nopick = true; g.add(m); }

  // ---- the walls: smoke-dark toward the ceiling, damp-dark at the skirting, hand-dark at the corners, pale squares where pictures hung
  { const t = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); let gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,.72)'); gr.addColorStop(0.35, 'rgba(0,0,0,.12)'); gr.addColorStop(0.7, 'rgba(0,0,0,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.1})`; const sx = rnd() * w; x.fillRect(sx, 0, 2 + rnd() * 5, 30 + rnd() * 160); } for (let i = 0; i < 40; i++) blot(x, rnd() * w, rnd() * h, 10 + rnd() * 40, 0.06 + rnd() * 0.1, 1 + rnd() * 2); }); t.wrapS = THREE.RepeatWrapping;
    const wallG = (w, x, z, ry) => { const gm = new THREE.PlaneGeometry(w, H); gm.attributes.uv.array.forEach((v, i, a) => { if (i % 2 === 0) a[i] = v * w / 7; }); const m = new THREE.Mesh(gm, mul(t)); m.position.set(x, H / 2, z); m.rotation.y = ry; m.renderOrder = 1; m.userData.nopick = true; g.add(m); };
    wallG(2 * W, 0, B - 0.02, Math.PI); wallG(L + B, -W + 0.02, (B - L) / 2, Math.PI / 2); wallG(L + B, W - 0.02, (B - L) / 2, -Math.PI / 2); }

  // ---- the air: smoke lying in sheets under the lamps, a cone of lit haze below each wheel, dust turning in it
  const smokeT = canvasTex(256, 256, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { const cx = rnd() * 256, cy = rnd() * 256, r = 14 + rnd() * 50, gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,220,170,${0.05 + rnd() * 0.09})`); gr.addColorStop(1, 'rgba(255,220,170,0)'); x.fillStyle = gr; for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { x.beginPath(); x.arc(cx + ox, cy + oy, r, 0, 7); x.fill(); } } }); smokeT.wrapS = smokeT.wrapT = THREE.RepeatWrapping;
  const sheets = []; for (let i = 0; i < 5; i++) { const t = smokeT.clone(); t.needsUpdate = true; t.repeat.set(1.6 + i * 0.3, 1.4 + i * 0.2); t.offset.set(rnd(), rnd()); const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * W - 0.4, L + B - 0.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(0, 1.9 + i * 0.36, (B - L) / 2); m.userData.nopick = true; m.renderOrder = 6; g.add(m); sheets.push({ t, vx: (rnd() - 0.5) * 0.006, vz: 0.003 + rnd() * 0.004 }); }
  const coneT = canvasTex(64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,190,110,.5)'); gr.addColorStop(0.5, 'rgba(255,180,100,.14)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
  for (const o of room.lamps) if (o.wheel) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 3.0, o.y - 0.1, 32, 1, true), new THREE.MeshBasicMaterial({ map: coneT, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, fog: false })); c.position.set(o.x, (o.y - 0.1) / 2 + 0.05, o.z); c.userData.nopick = true; c.renderOrder = 7; g.add(c); o.cone = c; }
  const N = 260, mp = new Float32Array(N * 3), mv = []; for (let i = 0; i < N; i++) { const o = room.lamps[i % 3]; mp[i * 3] = o.x + (rnd() - 0.5) * 3.4; mp[i * 3 + 1] = 0.4 + rnd() * 2.4; mp[i * 3 + 2] = o.z + (rnd() - 0.5) * 3.4; mv.push(rnd() * 6.3); }
  const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(mp, 3)), new THREE.PointsMaterial({ color: 0xffc890, size: 0.012, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })); motes.userData.nopick = true; motes.frustumCulled = false; g.add(motes);

  // ---- the street outside, built: the far side's fronts with porches and a few lit windows, a hitching rail, a trough, the sky and the moon; no painted distance
  { const st = new THREE.Group(); st.position.set(0, -0.12, -L); g.add(st); const sid = pbr('siding', { tile: 2.2, color: 0x6a5e52 }), pl = pbr('planks', { tile: 1.6, color: 0x5a4c40 }), win = plain(0x2a1c0c, { glow: 0xff9a3a, glowK: 0.9 }), dark = plain(0x05060a, { rough: 0.2 });
    let x = -17; for (const [w, h, lit, sign] of [[6.5, 6.2, [1, 0, 1], 'GENERAL STORE'], [5, 5, [0, 1], 'ASSAY'], [7.5, 7, [1, 1, 0, 1], 'PALACE HOTEL'], [5.5, 5.4, [0, 0], 'LIVERY'], [6, 6, [1, 0], 'UNDERTAKER']]) { const cx = x + w / 2, z = -15.5;
      slab(w - 0.2, h, 6, sid, cx, h / 2, z - 3, st); slab(w - 0.2, 1.3, 0.2, sid, cx, h + 0.65, z + 0.1, st); slab(w, 0.16, 2.2, pl, cx, 0.3, z + 1.1, st); slab(w, 0.12, 2.4, pl, cx, 3.1, z + 1.2, st);
      for (let k = 0; k <= 2; k++) slab(0.14, 2.8, 0.14, pl, x + 0.2 + k * (w - 0.4) / 2, 1.7, z + 2.1, st);
      lit.forEach((on, k) => { const wx = x + (k + 0.5) * w / lit.length; slab(1.0, 1.5, 0.06, on ? win : dark, wx, 1.75, z + 0.04, st); slab(1.0, 1.3, 0.06, k % 2 ? dark : win, wx, 4.4, z + 0.04, st).visible = h > 5.2; });
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 0.7), new THREE.MeshBasicMaterial({ map: canvasTex(512, 96, (c, cw, ch) => { c.fillStyle = '#2a2018'; c.fillRect(0, 0, cw, ch); c.fillStyle = '#8a7a5a'; c.font = 'bold 54px Georgia'; c.textAlign = 'center'; c.fillText(sign, cw / 2, 68); }), color: 0x555555 })); sg.position.set(cx, h + 0.65, z + 0.22); st.add(sg); x += w; }
    for (const s of [-1, 1]) { const rx = s * 3.4; const rail = tube(0.045, 0.045, 2.6, pl, rx, 1.0, -2.4, st, 8); rail.rotation.z = Math.PI / 2; for (const d of [-1.2, 1.2]) tube(0.055, 0.055, 1.1, pl, rx + d, 0.55, -2.4, st, 8); }
    slab(2.2, 0.5, 0.7, pl, -6.2, 0.25, -3, st); slab(2 * W + 4, 0.16, 2.0, pl, 0, 0.04, -1.0, st); for (let k = -3; k <= 3; k++) if (k) slab(0.14, 2.9, 0.14, pl, k * 2.3, 1.5, -1.9, st); slab(2 * W + 4, 0.12, 2.3, pl, 0, 3.0, -1.1, st);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: canvasTex(1024, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02030a'); gr.addColorStop(0.75, '#0a1124'); gr.addColorStop(1, '#16203a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const b = rnd(); c.fillStyle = `rgba(${200 + b * 55 | 0},${210 + b * 45 | 0},255,${0.25 + b * 0.75})`; const s = b > 0.96 ? 2 : 1; c.fillRect(rnd() * w, rnd() * h * 0.92, s, s); } }) })); sky.position.y = -2; g.add(sky);
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xcfdcff, fog: false, depthWrite: false })); moon.scale.setScalar(9); moon.position.set(-22, 30, -L - 60); g.add(moon);
    const ml = new THREE.SpotLight(0x8fa8ff, 420, 40, 0.42, 0.5, 1.4); ml.position.set(-9, 9, -L - 12); ml.target.position.set(-3.6, 0, -L + 4.5); ml.castShadow = true; ml.shadow.mapSize.set(1024, 1024); ml.shadow.bias = -0.002; ml.shadow.camera.near = 6; ml.shadow.camera.far = 34; scene.add(ml, ml.target); g.userData.moon = ml;
    model('wooden_lantern_01', 1.5, 2.2, -L - 2.2, 0, { h: 0.4 }, g); }

  // ---- what people leave about: lamps and cards on the tables, sacks and a broom, a ladder, a trunk by the door, pegs with hats, pictures, a rug by the stove
  { const flame = (x, y, z) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffa040, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.22); s.position.set(x, y, z); s.userData.nopick = true; g.add(s); };
    for (const t of room.tables) { if (t.name !== 'poker') { model('wooden_candlestick', t.x + 0.05, 0.76, t.z - 0.04, 0, { h: 0.22 }, g); flame(t.x + 0.05, 1.02, t.z - 0.04); } }
    const cardM = plain(0xe8e0cc, { rough: 0.8 }), back = plain(0x7a1818, { rough: 0.8 }), chip = [plain(0xb02020), plain(0x1a3a8a), plain(0xe8e4d8)];
    for (let i = 0; i < 16; i++) { const a = rnd() * 6.3, r = 0.08 + rnd() * 0.3, c = slab(0.057, 0.0012, 0.088, i % 3 ? back : cardM, R.poker.x + Math.cos(a) * r, 0.768 + i * 0.0003, R.poker.z + Math.sin(a) * r, g); c.rotation.y = rnd() * 6.3; c.castShadow = false; }
    for (let i = 0; i < 9; i++) { const a = i * 0.7, n = 2 + (i * 5 % 6); tube(0.019, 0.019, 0.0035 * n, chip[i % 3], R.poker.x + Math.cos(a) * 0.3, 0.767 + 0.00175 * n, R.poker.z + Math.sin(a) * 0.3, g, 10).castShadow = false; }
    model('wooden_broom', 6.75, 0, -0.9, 0.4, { h: 1.35 }, g).rotation.z = 0.16; model('wooden_ladder', -6.7, 0, -10.6, 0.3, { h: 2.6 }, g).rotation.x = -0.2; model('vintage_suitcase', 1.6, 0, -11.0, 0.5, { h: 0.42 }, g); model('vintage_suitcase', -6.5, 0, -2.0, 1.4, { h: 0.5 }, g);
    model('wooden_barrels_01', -6.2, 0, -11.0, 0.3, { w: 1.5 }, g); model('vintage_cabinet_01', 6.6, 0, -4.2, -Math.PI / 2, { h: 1.9 }, g); model('jug_01', 6.5, 1.0, 0.9, 0, { h: 0.28 }, g); model('brass_vase_03', -6.6, 0, -6.6, 0, { h: 0.34 }, g);
    for (let i = 0; i < 5; i++) { const z = -6.6 - i * 0.34; tube(0.012, 0.012, 0.11, pbr('walnut', { tile: 0.4 }), W - 0.06, 1.72, z, g, 6).rotation.z = Math.PI / 2; if (i % 2 === 0) { const hat = new THREE.Group(); hat.position.set(W - 0.2, 1.72, z); hat.rotation.z = 1.2; g.add(hat); const fm = pbr('leather', { tile: 0.5, color: [0x4a3a2a, 0x2a2420, 0x6a5a48][i >> 1] }); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.012, 20), fm); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 16), fm); cr.position.y = 0.06; hat.add(br, cr); br.castShadow = cr.castShadow = true; } }
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5).rotateX(-Math.PI / 2), pbr('velvet', { tile: 0.6, color: 0x4a1a14 })); rug.position.set(-5.4, 0.008, -4.9); rug.rotation.y = 0.3; rug.receiveShadow = true; g.add(rug);
    for (let i = 0; i < 3; i++) { const sk = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), pbr('leather', { tile: 0.6, color: 0x8a7a5a, rough: 1 })); sk.scale.set(1, 0.55, 0.7); sk.position.set(5.2 + i * 0.5, 0.17 + (i === 1 ? 0.3 : 0), 1.2 - (i === 1 ? 0 : 0.05)); sk.castShadow = true; g.add(sk); } }

  // ---- the room seen in its own glass and brass: one look round from the middle, kept (taken again when the lamps change)
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType }), cube = new THREE.CubeCamera(0.1, 60, cubeRT); cube.position.set(0, 1.7, -3.2); scene.add(cube);
  const pm = new THREE.PMREMGenerator(renderer); let envRT = null;
  const reflect = () => { const was = scene.environment; scene.environment = null; g.visible = true; cube.update(renderer, scene); const rt = pm.fromCubemap(cubeRT.texture); scene.environment = rt.texture; scene.environmentIntensity = 1; if (envRT) envRT.dispose(); envRT = rt; if (room.mirror) { room.mirror.material.envMap = cubeRT.texture; room.mirror.material.needsUpdate = true; } void was; };

  // ---- on a screen: the picture darkened at its edges, pulled warm, with grain (a headset gets the room as it is)
  let rt = null; const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tD: { value: null }, t: { value: 0 }, hurt: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tD; uniform float t, hurt; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + t) * 43758.5453); }
      void main(){ vec3 c = texture2D(tD, vUv).rgb; vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 0.82)));
        c *= 0.9; c = clamp((c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14), 0.0, 1.0); float l = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(vec3(l), c, 0.86); c *= vec3(1.04, 0.99, 0.9); c = c * (0.62 + 0.38 * v); c = c * c * (3.0 - 2.0 * c) * 0.6 + c * 0.4;
        c += (h(gl_FragCoord.xy) - 0.5) * 0.018; c = mix(c, vec3(0.5, 0.0, 0.0), hurt * (1.0 - v) * 0.8);
        gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0); }` }));
  const qs = new THREE.Scene(), qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); qs.add(quad); quad.frustumCulled = false;
  const size = () => { const r = renderer.getPixelRatio(); rt?.dispose(); rt = new THREE.WebGLRenderTarget(Math.round(innerWidth * r), Math.round(innerHeight * r), { type: THREE.HalfFloatType, samples: 4 }); quad.material.uniforms.tD.value = rt.texture; }; size(); addEventListener('resize', size);

  let frames = 0;
  return { group: g, reflect, moon: g.userData.moon,
    update(dt, t) { for (const s of sheets) { s.t.offset.x += s.vx * dt; s.t.offset.y += s.vz * dt; } const p = motes.geometry.attributes.position; for (let i = 0; i < N; i++) { p.array[i * 3] += Math.sin(t * 0.21 + mv[i]) * 0.012 * dt; p.array[i * 3 + 1] += Math.sin(t * 0.13 + mv[i] * 2) * 0.01 * dt; p.array[i * 3 + 2] += Math.cos(t * 0.17 + mv[i]) * 0.012 * dt; } p.needsUpdate = true; for (const o of room.lamps) if (o.cone) o.cone.visible = o.on; },
    render() { if (++frames === 3 || frames === 40) reflect(); if (renderer.xr.isPresenting) return renderer.render(scene, camera);
      const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping; renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); quad.material.uniforms.t.value = (G.t * 60 | 0) % 97; quad.material.uniforms.hurt.value = Math.max(0, G.hurtT || 0); renderer.render(qs, qc); renderer.toneMapping = tm; } };
}
