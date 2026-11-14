// EYES DOWN's city through the window: 1985, thirty-one floors up, raining under a low overcast lit orange from the streets; towers at their real distances, traffic far below, signs, beacons, lightning
import { THREE, scene, rnd, pick, clamp, LOW } from './core.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const FLOOR = 3.4, STREET = -96;   // the 31st floor: the avenue is 96 m below the window
const CITY = { neon: [], flash: 0, lightning: rnd(15, 40), t: 0, flashT: -1, thunder: -1 };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LIT = ['#ffd49a', '#ffc27a', '#ffe7c4', '#fff3dd', '#d9ecff', '#ffb46a', '#f2d7a8', '#c9e2ff'];

// a facade's picture and its lit windows: every window a different life
function facade(cols, rows, o = {}) {
  const cw = 32, ch = 36, W = cols * cw, H = rows * ch, c = canvas(W, H), e = canvas(W, H), g = c.getContext('2d'), k = e.getContext('2d');
  g.fillStyle = o.wall || '#3a2b26'; g.fillRect(0, 0, W, H); k.fillStyle = '#000'; k.fillRect(0, 0, W, H);
  if (o.brick) for (let y = 0; y < H; y += 3) { g.fillStyle = `rgba(${rnd(0, 30) | 0},${rnd(0, 15) | 0},0,${rnd(.05, .18)})`; g.fillRect(0, y, W, 1); }
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2 + (Math.random() * 6 | 0)) { g.fillStyle = `rgba(0,0,0,${rnd(0, .12)})`; g.fillRect(x, y, 2, 2); }
  for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
    const x = cI * cw + 7, y = r * ch + 8, w = cw - 14, h = ch - 14;
    g.fillStyle = '#0b0d10'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(160,170,190,.08)'; g.fillRect(x, y, w, 2);
    if (o.ledge) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 3, y + h, w + 6, 3); g.fillStyle = 'rgba(255,235,210,.08)'; g.fillRect(x - 3, y + h, w + 6, 1); }
    if (Math.random() < (o.lit ?? .3)) {
      const col = pick(LIT), dim = rnd(.35, 1);
      k.globalAlpha = dim; k.fillStyle = col; k.fillRect(x, y, w, h); g.globalAlpha = .5 * dim; g.fillStyle = col; g.fillRect(x, y, w, h); g.globalAlpha = 1; k.globalAlpha = 1;
      const kind = Math.random();
      if (kind < .3) for (let s = y; s < y + h; s += 3) { k.fillStyle = 'rgba(0,0,0,.45)'; k.fillRect(x, s, w, 1); }
      else if (kind < .5) { k.fillStyle = 'rgba(30,10,5,.65)'; k.fillRect(x, y, w * rnd(.25, .45), h); k.fillRect(x + w * rnd(.6, .8), y, w, h); }
      else if (kind < .58) { k.fillStyle = 'rgba(0,0,0,.8)'; const px = x + rnd(3, w - 9); k.fillRect(px, y + h * .35, 6, h * .65); k.beginPath(); k.arc(px + 3, y + h * .3, 3, 0, 7); k.fill(); }
    } else if (Math.random() < .06) { k.fillStyle = 'rgba(90,140,255,.5)'; k.fillRect(x, y, w, h); }
  }
  const t = new THREE.CanvasTexture(c), te = new THREE.CanvasTexture(e); for (const x of [t, te]) { x.wrapS = x.wrapT = THREE.RepeatWrapping; x.anisotropy = 8; x.colorSpace = THREE.SRGBColorSpace; }
  return { t, te, cols, rows, cw: 3.1, ch: FLOOR };
}
// a box with window UVs in metres
function tower(x0, x1, z0, z1, y0, y1, F) {
  const w = x1 - x0, d = z1 - z0, h = y1 - y0, g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, S = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], ox = Math.random(), oy = Math.random();
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, ox + uv.getX(k) * S[f][0] / (F.cols * F.cw), oy + uv.getY(k) * S[f][1] / (F.rows * F.ch)); }
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return g;
}
let DOT; function dot() { if (DOT) return DOT; const c = canvas(64, 64), g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.18, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); DOT = new THREE.CanvasTexture(c); return DOT; }

function sky() {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { t: { value: 0 }, flash: { value: 0 } },
    vertexShader: 'varying vec3 vp; void main(){ vp = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }',
    fragmentShader: `varying vec3 vp; uniform float t, flash;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a*n(p); p = p*2.03 + 7.1; a *= .5; } return v; }
      void main(){ vec3 d = normalize(vp); float el = d.y;
        vec2 uv = d.xz / max(.06, d.y + .1) * 1.4; float c = fbm(uv + vec2(t*.01, t*.004)), c2 = fbm(uv*2.3 - vec2(t*.016, 0.));
        float low = smoothstep(.5, -.02, el);
        vec3 col = mix(vec3(.03,.028,.035), vec3(.34,.18,.09), low*.85 + c*.2) * (.5 + .75*c*c2);
        col = mix(col, vec3(.15,.1,.07), smoothstep(.02, -.15, el));
        col += flash * vec3(.55,.6,.78) * (.3 + c*1.3) * smoothstep(-.1,.25,el);
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  const s = new THREE.Mesh(new THREE.SphereGeometry(3500, 32, 16), m); s.frustumCulled = false; s.renderOrder = -10; scene.add(s); CITY.skyM = m;
}

// a neon sign: letters on a dark board, each with its own temper
function neon(text, x, y, z, size, color, vertical) {
  const ch = vertical ? text.split('') : [text], W = vertical ? 160 : 110 * text.length + 60, H = vertical ? 150 * text.length : 200, c = canvas(W, H), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.font = 'bold 120px "Arial Narrow",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 28; g.fillStyle = color; g.strokeStyle = '#fff';
  ch.forEach((s, i) => { const py = vertical ? 75 + i * 150 : H / 2; g.lineWidth = 3; g.fillText(s, W / 2, py); g.globalAlpha = .7; g.strokeText(s, W / 2, py); g.globalAlpha = 1; });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const w = size * W / Math.max(W, H), h = size * H / Math.max(W, H), mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); mesh.position.set(x, y, z); scene.add(mesh);
  const board = new THREE.Mesh(new THREE.BoxGeometry(w + .5, h + .5, .3), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .6 })); board.position.set(x, y, z - .4); scene.add(board);
  const N = { m, on: 1, k: 1, next: rnd(2, 9), color: new THREE.Color(color), bad: Math.random() < .45 }; CITY.neon.push(N); return N;
}

function traffic() {
  const N = LOW ? 160 : 340, m = new THREE.MeshBasicMaterial({ map: dot(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const I = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), m, N); I.frustumCulled = false; const cars = [];
  const S = STREET + 1, lanes = [
    { a: [-800, S, -24], b: [800, S, -24], col: 0xfff1d8 }, { a: [800, S, -30], b: [-800, S, -30], col: 0xff2a1a },
    { a: [62, S, -20], b: [62, S, -2800], col: 0xff2a1a }, { a: [70, S, -2800], b: [70, S, -20], col: 0xfff1d8 },
    { a: [-160, S, -40], b: [-160, S, -2800], col: 0xff2a1a }, { a: [-152, S, -2800], b: [-152, S, -40], col: 0xfff1d8 },
    { a: [-1500, S, -420], b: [1500, S, -420], col: 0xfff1d8 }, { a: [1500, S, -428], b: [-1500, S, -428], col: 0xff2a1a }];
  for (let i = 0; i < N; i++) { const L = lanes[i % lanes.length], len = Math.hypot(L.b[0] - L.a[0], L.b[2] - L.a[2]); cars.push({ L, u: Math.random(), v: rnd(9, 15) / len }); I.setColorAt(i, new THREE.Color(L.col)); }
  scene.add(I); CITY.cars = { I, cars };
  const road = new THREE.Mesh(new THREE.PlaneGeometry(3400, 3400), new THREE.MeshStandardMaterial({ color: 0x0a0909, roughness: .3, metalness: .3 })); road.rotation.x = -Math.PI / 2; road.position.set(0, STREET, -1200); scene.add(road);
  const lamps = []; for (let x = -800; x < 800; x += 28) lamps.push([x, STREET + 9, -18], [x + 14, STREET + 9, -36]); for (let z = -40; z > -2800; z -= 30) lamps.push([56, STREET + 9, z], [76, STREET + 9, z - 15], [-146, STREET + 9, z], [-166, STREET + 9, z - 15]);
  const LI = new THREE.InstancedMesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: dot(), color: 0xffa040, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), lamps.length), M = new THREE.Matrix4();
  lamps.forEach((p, i) => LI.setMatrixAt(i, M.makeTranslation(p[0], p[1], p[2]))); scene.add(LI);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1600, 34), new THREE.MeshBasicMaterial({ color: 0x4a2a10, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, STREET + .3, -27); scene.add(pool);
}

function rain() {
  const N = LOW ? 400 : 900, m = new THREE.MeshBasicMaterial({ color: 0x8c96a6, transparent: true, opacity: .12, depthWrite: false, blending: THREE.AdditiveBlending });
  const I = new THREE.InstancedMesh(new THREE.PlaneGeometry(.01, .65), m, N); I.frustumCulled = false; const drops = []; for (let i = 0; i < N; i++) drops.push({ x: rnd(-6, 14), y: rnd(-30, 14), z: -rnd(.7, 30), v: rnd(8, 11) });
  scene.add(I); CITY.rain = { I, drops };
}

function build() {
  sky();
  // the hotel across the avenue: brick, its windows a few dozen lives
  const near = facade(26, 44, { wall: '#4a302a', brick: true, lit: .3, ledge: true });
  scene.add(new THREE.Mesh(mergeGeometries([tower(-78, -14, -66, -40, STREET, 26, near), tower(-70, -22, -62, -46, 26, 31, near)]), new THREE.MeshStandardMaterial({ map: near.t, emissiveMap: near.te, emissive: 0xffffff, emissiveIntensity: 1.3, roughness: .9 })));
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a1d16, roughness: .9 }), wt = new THREE.Group(), tank = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 6, 18), wood); tank.position.y = 8; wt.add(tank);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(3.7, 2.6, 18), wood); cap.position.y = 12.3; wt.add(cap); for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.3, 5, .3), wood); leg.position.set(a, 2.5, b); wt.add(leg); }
  wt.position.set(-50, 31, -52); scene.add(wt);
  CITY.signs = [neon('HOTEL', -16, 4, -39.4, 18, '#ff3b7a', true), neon('ARGYLE', -46, 22, -39.4, 16, '#59e8ff'), neon('LIQUORS', -60, -10, -39.4, 9, '#ff5a2a'), neon('CHECKS CASHED', -36, -40, -39.4, 14, '#ffd84a'), neon('DINER', -50, -80, -39.4, 9, '#59ffa6')];
  // a hundred and thirty towers out to two and a half kilometres, stepped back the way the zoning law made them
  const sets = [[facade(32, 48, { wall: '#2a2a2e', lit: .22 }), []], [facade(32, 48, { wall: '#3b3130', lit: .28, brick: true }), []], [facade(32, 48, { wall: '#14181e', lit: .4 }), []]], beacons = [];
  for (let i = 0; i < 140; i++) {
    const a = rnd(-1.25, 1.25), r = i < 22 ? rnd(110, 300) : rnd(260, 2400), cx = Math.sin(a) * r, cz = -Math.cos(a) * r - 40;
    if ((cx > -90 && cx < 40 && cz > -110) || Math.abs(cx - 66) < 18 || Math.abs(cx + 156) < 18 || Math.abs(cz + 424) < 16) continue;
    const w = rnd(18, 46), d = rnd(18, 46); let top = rnd(-75, 30); if (Math.random() < .16) top = rnd(50, 200); if (Math.random() < .04) top = rnd(220, 330);
    const S = pick(sets), F = S[0]; let y0 = STREET, tw = w, td = d; const tiers = 1 + (top > 20 ? (Math.random() * 3 | 0) : 0);
    for (let k = 0; k < tiers; k++) { const y1 = k === tiers - 1 ? top : y0 + (top - y0) * rnd(.55, .8); S[1].push(tower(cx - tw / 2, cx + tw / 2, cz - td / 2, cz + td / 2, y0, y1, F)); y0 = y1; tw *= rnd(.6, .82); td *= rnd(.6, .82); }
    if (top > 140 && Math.random() < .5) { const sp = new THREE.ConeGeometry(Math.min(tw, td) * .3, top * .18, 4); sp.rotateY(Math.PI / 4); sp.translate(cx, top + top * .09, cz); S[1].push(sp); beacons.push([cx, top + top * .18 + 1, cz]); }
    else if (top > 30) beacons.push([cx, top + 1.5, cz]);
    if (r < 900 && Math.random() < .3) { const tk = new THREE.CylinderGeometry(2.6, 2.6, 5, 10); tk.translate(cx + rnd(-4, 4), top + 2.5, cz + rnd(-4, 4)); S[1].push(tk); }
  }
  for (const [F, gs] of sets) if (gs.length) scene.add(new THREE.Mesh(mergeGeometries(gs), new THREE.MeshStandardMaterial({ map: F.t, emissiveMap: F.te, emissive: 0xffffff, emissiveIntensity: 1.5, roughness: .85 })));
  const BI = new THREE.InstancedMesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: dot(), color: 0xff1a10, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), beacons.length);
  BI.userData.p = beacons; BI.userData.ph = beacons.map(() => Math.random()); BI.frustumCulled = false; scene.add(BI); CITY.beaconI = BI;
  const far = facade(40, 60, { wall: '#16141a', lit: .18 }), fg = [];
  for (let i = 0; i < 90; i++) { const a = rnd(-1.4, 1.4), r = rnd(2700, 3300), w = rnd(30, 90), h = rnd(-40, 120), p = new THREE.PlaneGeometry(w, h - STREET), uv = p.attributes.uv, ox = Math.random();
    for (let k = 0; k < 4; k++) uv.setXY(k, ox + uv.getX(k) * w / (far.cols * far.cw), uv.getY(k) * (h - STREET) / (far.rows * far.ch)); p.rotateY(-a); p.translate(Math.sin(a) * r, (h + STREET) / 2, -Math.cos(a) * r); fg.push(p); }
  scene.add(new THREE.Mesh(mergeGeometries(fg), new THREE.MeshBasicMaterial({ map: far.te })));
  traffic(); rain();
}

const _M = new THREE.Matrix4(), _p = new THREE.Vector3();
function update(dt, cam) {
  CITY.t += dt; const t = CITY.t; CITY.skyM.uniforms.t.value = t;
  // lightning: a flash, a second flicker, thunder a few seconds after
  CITY.lightning -= dt; if (CITY.lightning < 0) { CITY.lightning = rnd(25, 75); CITY.flashT = 0; CITY.thunder = rnd(1.5, 6); }
  if (CITY.flashT >= 0) { CITY.flashT += dt; const f = CITY.flashT; CITY.flash = f < .08 ? 1 : f < .16 ? .1 : f < .26 ? .75 : f < .5 ? .25 * (1 - (f - .26) / .24) : 0; if (f > 1) { CITY.flashT = -1; CITY.flash = 0; } }
  if (CITY.thunder > 0) { CITY.thunder -= dt; if (CITY.thunder <= 0 && CITY.onThunder) CITY.onThunder(); }
  CITY.skyM.uniforms.flash.value = CITY.flash;
  for (const N of CITY.neon) { N.next -= dt; if (N.next < 0) { N.next = N.bad ? rnd(.04, 1.6) : rnd(4, 20); N.on = N.bad ? (Math.random() < .7 ? 1 : 0) : (Math.random() < .93 ? 1 : .2); } N.k += (N.on - N.k) * Math.min(1, dt * 30); N.m.opacity = .12 + .88 * N.k; }
  const BI = CITY.beaconI, p = BI.userData.p, ph = BI.userData.ph; for (let i = 0; i < p.length; i++) { const s = ((t * .5 + ph[i]) % 1) < .45 ? 1 : .001; _M.makeScale(s, s, s).setPosition(p[i][0], p[i][1], p[i][2]); BI.setMatrixAt(i, _M); } BI.instanceMatrix.needsUpdate = true;
  const C = CITY.cars; for (let i = 0; i < C.cars.length; i++) { const c = C.cars[i], L = c.L; c.u += c.v * dt; if (c.u > 1) c.u -= 1;
    _p.set(L.a[0] + (L.b[0] - L.a[0]) * c.u, L.a[1], L.a[2] + (L.b[2] - L.a[2]) * c.u); const s = clamp(_p.distanceTo(cam) * .004, .9, 7); _M.makeScale(s * 1.7, s * .8, 1).setPosition(_p); C.I.setMatrixAt(i, _M); }
  C.I.instanceMatrix.needsUpdate = true;
  const R = CITY.rain; for (let i = 0; i < R.drops.length; i++) { const d = R.drops[i]; d.y -= d.v * dt; d.x += 1.2 * dt; if (d.y < -30) { d.y = rnd(10, 14); d.x = rnd(-6, 14); } _M.makeRotationZ(-.12).setPosition(d.x, d.y, d.z); R.I.setMatrixAt(i, _M); } R.I.instanceMatrix.needsUpdate = true;
}

export { CITY, STREET, build, update, dot };
