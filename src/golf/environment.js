// Halcyon Greens' world: a misty dusk vale (Poly Haven sky, scans and textures, CC0), hills to the horizon in thick air, a stream and waterfall, the garden (garden.js), trees
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tree } from '@dgreenheck/ez-tree';
import { fbm, mulberry32, smoothstep, lerp, clamp } from './util.js';
import { PLAN, gardenGround, gardenKeep, gardenMask, tended, buildGarden } from './garden.js';

const V3 = THREE.Vector3, UP = new V3(0, 1, 0);
// The sky is turned so its low sun (3° up in the photo) sits ahead of the tee; the light is lifted to 8° so shadows stay usable.
const ROT = 2.492;
const SUN_SKY = new V3(0.814, 0.058, 0.577).normalize().applyAxisAngle(UP, ROT);
const SUN = new V3(SUN_SKY.x, 0, SUN_SKY.z).normalize().multiplyScalar(Math.cos(0.14)).setY(Math.sin(0.14));
const AIR = new THREE.Color('#626e83'), GLOW = new THREE.Color('#bcb0a8');
const f3 = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`, c3 = (c) => `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;

// Thick air for every built-in material: distance haze that never quite closes, mist that pools low in the vale,
// and a warm glow toward the sun. Done before tone mapping so the sky photo and the hazed hills meet without a seam.
{
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying vec3 vFogWorld;\n#endif';
  C.fog_vertex = '#ifdef USE_FOG\n vFogDepth = - mvPosition.z; vFogWorld = transpose( mat3( viewMatrix ) ) * ( mvPosition.xyz - viewMatrix[ 3 ].xyz );\n#endif';
  C.fog_pars_fragment = '#ifdef USE_FOG\n uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogWorld;\n #ifdef FOG_EXP2\n  uniform float fogDensity;\n #else\n  uniform float fogNear; uniform float fogFar;\n #endif\n#endif';
  C.fog_fragment = '';
  if (!C.tonemapping_fragment.includes('vFogWorld')) C.tonemapping_fragment = `
#ifdef USE_FOG
{
  vec3 rd = vFogWorld - cameraPosition; float d = length( rd ); vec3 vd = rd / max( d, 1e-4 );
  float aer = 1.0 - exp( - d * 0.00145 );
  const float b = 0.16; float dy = rd.y;
  float hb = 0.011 * exp( - b * ( cameraPosition.y + 0.5 ) );
  float hf = hb * d * ( abs( b * dy ) > 0.01 ? ( 1.0 - exp( - b * dy ) ) / ( b * dy ) : 1.0 );
  float f = min( 1.0 - ( 1.0 - aer ) * exp( - hf ), 0.985 );
  float s = pow( max( dot( vd, ${f3(SUN_SKY)} ), 0.0 ), 5.0 );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, mix( fogColor, ${c3(GLOW)}, s * 0.85 ), f );
}
#endif
` + C.tonemapping_fragment;
}

export async function loadAssets(renderer, onProgress = () => { }) {
  let done = 0; const total = 10;
  const tick = (p) => p.then((v) => { onProgress(++done / total); return v; });
  const tl = new THREE.TextureLoader(), gl = new GLTFLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (url, srgb, rep = 1) => tick(tl.loadAsync(url)).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = Math.min(16, maxAniso);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  const model = (n) => tick(gl.loadAsync(`golf-assets/models/${n}/${n}.json`));
  const [hdr, sky, gd, gn, ga, wd, wn, wa, rocks, fern] = await Promise.all([
    tick(fetch('golf-assets/sky/dusk_1k.hdr.txt').then(r => r.text()).then((b64) => {
      // The sky's light ships base64 in a text file so any static host serves it.
      const bin = atob(b64.trim()), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const d = new HDRLoader().parse(buf.buffer);
      const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
      t.colorSpace = THREE.LinearSRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = true; t.needsUpdate = true;
      return t;
    })),
    tick(tl.loadAsync('golf-assets/sky/dusk_4k.jpg')),
    tex('golf-assets/tex/leafy_grass_diff.jpg', true), tex('golf-assets/tex/leafy_grass_nor.jpg'), tex('golf-assets/tex/leafy_grass_arm.jpg'),
    tex('golf-assets/tex/wood_planks_diff.jpg', true, 0.6), tex('golf-assets/tex/wood_planks_nor.jpg', false, 0.6), tex('golf-assets/tex/wood_planks_arm.jpg', false, 0.6),
    model('rock_moss_set_01'), model('fern_02'),
  ]);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(hdr).texture; pm.dispose(); hdr.dispose();
  sky.colorSpace = THREE.SRGBColorSpace; sky.anisotropy = Math.min(8, maxAniso);
  // Split a glTF into meshes, each re-centred so its base sits on the origin.
  const pieces = (g) => {
    const out = []; g.scene.updateMatrixWorld(true);
    g.scene.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry.clone().applyMatrix4(o.matrixWorld); geo.computeBoundingBox();
      const b = geo.boundingBox, c = b.getCenter(new V3());
      geo.translate(-c.x, -b.min.y, -c.z); geo.computeBoundingBox(); geo.computeBoundingSphere();
      out.push({ geo, mat: o.material, r: Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2, h: b.max.y - b.min.y });
    });
    return out;
  };
  return {
    env, sky, grass: { map: gd, normalMap: gn, arm: ga }, wood: { map: wd, normalMap: wn, arm: wa },
    rocks: pieces(rocks), ferns: pieces(fern),
  };
}

// ------------------------------------------------------------------ small generated textures
function canvasTex(size, fn, srgb = false) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = fn(x / size, y / size), i = (y * size + x) * 4;
    img.data[i] = o[0] * 255; img.data[i + 1] = o[1] * 255; img.data[i + 2] = o[2] * 255; img.data[i + 3] = (o[3] ?? 1) * 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const waterNormal = () => {
  const N = 256, H = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) H[y * N + x] = fbm(x / N * 6, y / N * 6, 5, 6) + 0.35 * fbm(x / N * 18 + 4, y / N * 18, 3, 18);
  const at = (x, y) => H[((y + N) % N) * N + ((x + N) % N)];
  return canvasTex(N, (u, v) => {
    const x = Math.round(u * N), y = Math.round(v * N), dx = (at(x + 1, y) - at(x - 1, y)) * 5, dy = (at(x, y + 1) - at(x, y - 1)) * 5, l = 1 / Math.hypot(dx, dy, 1);
    return [-dx * l * 0.5 + 0.5, dy * l * 0.5 + 0.5, l * 0.5 + 0.5, 1];
  });
};
const streakTex = () => canvasTex(256, (u, v) => { // falling water: long streaks, brighter in clumps
  const s = fbm(u * 24, v * 2.2, 4, 24) * 0.75 + fbm(u * 60, v * 5, 2, 60) * 0.35;
  const a = clamp((s - 0.42) * 3.4, 0, 1);
  return [1, 1, 1, a];
});
const puffTex = () => canvasTex(128, (u, v) => { // a soft cloud of mist or spray
  const d = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u * 5, v * 5, 4, 5);
  const a = clamp(1 - d, 0, 1) ** 1.6 * (0.55 + n * 0.7);
  return [1, 1, 1, a];
});
const glowTex = () => canvasTex(64, (u, v) => { const d = Math.hypot(u - 0.5, v - 0.5) * 2; const a = clamp(1 - d, 0, 1) ** 2.2; return [1, 1, 1, a]; });

function bladeGeometry() {
  const SEG = 4, pos = [], col = [], nor = [], idx = [];
  for (let i = 0; i <= SEG; i++) {
    const y = i / SEG, hw = 0.5 * (1 - Math.pow(y, 1.6) * 0.92), z = 0.32 * y * y;
    const c = 0.25 + 0.75 * Math.pow(y, 0.8);
    if (i === SEG) { pos.push(0, y, z); col.push(c, c, c); nor.push(0, 1, 0); }
    else { pos.push(-hw, y, z, hw, y, z); col.push(c, c, c, c, c, c); nor.push(0, 1, 0, 0, 1, 0); }
  }
  for (let i = 0; i < SEG - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
  const a = (SEG - 1) * 2; idx.push(a, a + 1, a + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx); return g;
}

// ------------------------------------------------------------------ the stream: two runs joined by a waterfall
// [x, z, water level, width]. The upper run comes down out of the hills to the lip of a ledge; the lower run
// leaves the plunge pool, passes the course on its right and wanders off toward the far hills.
const UPPER = [[120, -150, 15, 2.6], [78, -96, 12.2, 2.6], [46, -56, 9.4, 2.5], [28, -33, 7.2, 2.4], [19.6, -24.3, 6.5, 2.3], [16.6, -20.6, 6.35, 2.2]];
const LOWER = [[14.3, -17.6, -0.38, 5.4], [11.2, -12.4, -0.42, 2.9], [8.4, -5, -0.46, 2.4], [7.1, 3, -0.5, 2.5], [4, 12, -0.56, 2.7], [-6, 25, -0.72, 3], [-30, 48, -1.1, 3.3], [-75, 88, -2, 3.8], [-150, 140, -3.4, 4.5], [-260, 190, -5, 5]];
const LIP = new V3(16.3, 6.35, -20.25), POOL = new V3(14.3, -0.38, -17.6), PLATEAU = [19.9, -24.7];

function sampleRun(pts, step) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new V3(p[0], p[2], p[1])), false, 'centripetal');
  const wc = new THREE.CatmullRomCurve3(pts.map(p => new V3(p[3], 0, 0)), false, 'centripetal');
  const n = Math.ceil(curve.getLength() / step), out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new V3(-tan.z, 0, tan.x).normalize();
    out.push({ p, w: wc.getPointAt(t).x, side, s: 0 });
  }
  for (let i = 1; i < out.length; i++) out[i].s = out[i - 1].s + out[i].p.distanceTo(out[i - 1].p);
  return out;
}

export function buildEnvironment(e, renderer, scene, holes, mats, quality, A) {
  const group = new THREE.Group();
  const rnd = mulberry32(90210);
  const updaters = [];
  const uTime = { value: 0 };
  const hole = holes[0], center = hole.center;

  // ---------- sky + light ----------
  const domeGeo = new THREE.SphereGeometry(4500, 64, 32); domeGeo.scale(-1, 1, 1);
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ map: A.sky, fog: false, depthWrite: false }));
  dome.rotation.y = Math.PI + ROT; dome.renderOrder = -100; dome.frustumCulled = false; group.add(dome);
  scene.environment = A.env; scene.environmentIntensity = 0.42; scene.environmentRotation.set(0, ROT, 0);
  scene.fog = new THREE.FogExp2(AIR.getHex(), 0.001);
  renderer.toneMappingExposure = 1.18;

  const sun = new THREE.DirectionalLight(0xffcfa6, 1.65);
  sun.castShadow = quality.shadows;
  sun.shadow.mapSize.setScalar(Math.min(4096, quality.shadowSize * 2));
  const SB = 34; Object.assign(sun.shadow.camera, { left: -SB, right: SB, top: SB, bottom: -SB, near: 1, far: 260 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  group.add(sun, sun.target);
  group.add(new THREE.HemisphereLight(0x8b98b4, 0x2c2a20, 0.55));
  const focus = (c) => { sun.target.position.copy(c); sun.position.copy(c).addScaledVector(SUN, 120); sun.target.updateMatrixWorld(); };

  // ---------- the stream's course (needed by the ground) ----------
  const upper = sampleRun(UPPER, 1.0), lower = sampleRun(LOWER, 1.0), runs = [upper, lower];
  const GRID = new Map(), GC = 6, gk = (x, z) => (Math.floor(x / GC) + 4096) * 8192 + Math.floor(z / GC) + 4096;
  for (const run of runs) run.forEach((q, i) => { const k = gk(q.p.x, q.p.z); (GRID.get(k) || GRID.set(k, []).get(k)).push([run, i]); });
  // nearest point of the stream: [distance, water level, half width] or null when it is far
  const nearStream = (x, z) => {
    let best = null, bd = 1e9;
    const cx = Math.floor(x / GC), cz = Math.floor(z / GC);
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const a = GRID.get((cx + i + 4096) * 8192 + cz + j + 4096); if (!a) continue;
      for (const [run, k] of a) { const q = run[k], d = Math.hypot(x - q.p.x, z - q.p.z); if (d < bd) { bd = d; best = q; } }
    }
    return best ? [bd, best.p.y, best.w / 2] : null;
  };

  // ---------- ground: a meadow vale, rolling hills, ridges to the horizon ----------
  const samples = hole.samples.filter((_, i) => i % 2 === 0);
  const deck = (x, z) => { // [distance outside the course edge, deck height there]
    let best = 1e9, y = 0;
    for (const s of samples) { const d = Math.hypot(x - s[0], z - s[1]) - (s[3] - 0.3); if (d < best) { best = d; y = s[2]; } }
    return [best, y];
  };
  const n0 = fbm(11, 5, 4);
  const baseH = (x, z) => {
    const r = Math.hypot(x, z);
    let h = (fbm(x * 0.03 + 11, z * 0.03 + 5, 4) - n0) * 2.2 * smoothstep(4, 40, r);
    h += Math.pow(fbm(x * 0.0075 + 3, z * 0.0075 + 8, 5), 1.7) * 46 * smoothstep(30, 170, r);
    const rid = 1 - Math.abs(fbm(x * 0.0016 + 1.7, z * 0.0016 + 9.1, 4) * 2 - 1);
    h += (Math.pow(rid, 1.6) * 0.6 + fbm(x * 0.003 + 4, z * 0.003, 4) * 0.5) * 230 * smoothstep(240, 1300, r);
    h += fbm(x * 0.0008 + 5, z * 0.0008, 3) * 160 * smoothstep(700, 2000, r);
    const dp = Math.hypot(x - PLATEAU[0], z - PLATEAU[1]);          // the ledge the waterfall drops from
    h = Math.max(h, 7.4 * smoothstep(8.2, 5.4, dp) + (fbm(x * 0.4, z * 0.4, 3) - 0.5) * 0.6 * smoothstep(9, 5, dp));
    h += 6 * smoothstep(16, 8, dp) * smoothstep(5, 10, dp);         // and the rise it sits on
    return h;
  };
  const groundH = (x, z, withDeck = true) => {
    let h = gardenGround(x, z, baseH(x, z));
    const st = nearStream(x, z);
    if (st) {
      const [d, wy, hw] = st, lift = Math.max(0, h - wy);
      const bank = wy + 0.32, outer = hw + 1.4 + Math.min(lift * 1.3, 18);
      if (d < outer) h = lerp(h, Math.max(bank, Math.min(h, bank + (d - hw) * 0.6)), smoothstep(outer, hw + 1.2, d));
      if (d < hw + 0.9) h = lerp(h, wy - 0.42 - 0.25 * (1 - (d / (hw + 0.9)) ** 2), smoothstep(hw + 0.9, hw * 0.55, d));
    }
    const dpool = Math.hypot(x - POOL.x, z - POOL.z);
    if (dpool < 5.5) h = lerp(h, Math.min(h, POOL.y - 0.9 + dpool * 0.12), smoothstep(5.5, 3.2, dpool));
    if (withDeck) { const [d, y] = deck(x, z); if (d < 6) h = lerp(h, y - 0.07, smoothstep(5, 0.5, d)); }
    return h;
  };
  const waterAt = (x, z) => { const st = nearStream(x, z); if (st && st[0] < st[2] + 0.2) return st[1]; return Math.hypot(x - POOL.x, z - POOL.z) < 4.2 ? POOL.y : -Infinity; };
  const clear = (x, z) => { const st = nearStream(x, z); return Math.min(deck(x, z)[0], st ? st[0] - st[2] - 0.6 : 1e9, Math.hypot(x - POOL.x, z - POOL.z) - 4.6, gardenKeep(x, z)); };

  const SIZE = 4400, SEG = quality.terrainSeg;
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, uv = tg.attributes.uv, col = new Float32Array(tp.count * 3);
  const cMeadow = new THREE.Color(0x6f7446), cDry = new THREE.Color(0x8c8456), cLush = new THREE.Color(0x4d5a32), cWood = new THREE.Color(0x2e3a24), cRock = new THREE.Color(0x6b6862), cMud = new THREE.Color(0x3a3126), cMoss = new THREE.Color(0x4a6a2a), cc = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    let x = tp.getX(i), z = tp.getZ(i);
    const u = Math.max(Math.abs(x), Math.abs(z)) / (SIZE / 2), k = 0.012 + 0.988 * Math.pow(u, 2.6); x *= k; z *= k;
    const y = groundH(x, z); tp.setXYZ(i, x, y, z); uv.setXY(i, x / 2.4, z / 2.4);
    const n = fbm(x * 0.05 + 40, z * 0.05, 4), m = fbm(x * 0.3, z * 0.3 + 9, 2), wood = fbm(x * 0.006 + 7, z * 0.006 + 2, 4);
    cc.copy(cMeadow).lerp(cDry, smoothstep(0.5, 0.78, n)).lerp(cLush, smoothstep(0.45, 0.2, n));
    cc.lerp(cWood, smoothstep(0.5, 0.62, wood) * smoothstep(40, 120, Math.hypot(x, z)));
    const st = nearStream(x, z); if (st && st[0] < st[2] + 0.6) cc.lerp(cMud, smoothstep(st[2] + 0.6, st[2] * 0.7, st[0]) * 0.6);
    if (Math.hypot(x - PLATEAU[0], z - PLATEAU[1]) < 9 && y > 1) cc.lerp(cRock, 0.7);
    cc.lerp(cMoss, gardenMask(x, z) * (0.75 + 0.25 * fbm(x * 0.4, z * 0.4 + 3, 3)));
    cc.multiplyScalar(1.15 + (m - 0.5) * 0.45);
    col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({
    map: A.grass.map, normalMap: A.grass.normalMap, roughnessMap: A.grass.arm, aoMap: A.grass.arm, vertexColors: true, roughness: 1, metalness: 0, envMapIntensity: 0.5,
  }));
  terrain.receiveShadow = true; group.add(terrain);

  // ---------- water ----------
  const wn = waterNormal(); wn.repeat.set(0.5, 0.5);
  const waterMat = (speed, rep) => {
    const n = wn.clone(); n.needsUpdate = true; n.repeat.set(rep, rep);
    const m = new THREE.MeshStandardMaterial({ color: 0x223230, roughness: 0.03, metalness: 0.2, normalMap: n, normalScale: new THREE.Vector2(0.4, 0.4), transparent: true, opacity: 0.86, envMapIntensity: 2.4 });
    updaters.push((dt) => { n.offset.y -= speed * dt * rep; });
    return m;
  };
  const ribbon = (run, mat) => {
    const pos = [], uvs = [], idx = [];
    run.forEach((q, i) => {
      for (const s of [-1, 1]) { const p = q.p.clone().addScaledVector(q.side, s * (q.w / 2 + 0.25)); pos.push(p.x, q.p.y, p.z); uvs.push(s * q.w / 2, q.s); }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.renderOrder = 2; group.add(m); return m;
  };
  ribbon(upper, waterMat(1.1, 0.5)); ribbon(lower, waterMat(0.45, 0.5));
  const poolMat = waterMat(0.12, 0.35); poolMat.envMapIntensity = 1.3; poolMat.color.set(0x16201f); poolMat.opacity = 0.68;
  const pool = new THREE.Mesh(new THREE.CircleGeometry(4.0, 48).rotateX(-Math.PI / 2), poolMat);
  pool.position.copy(POOL).y += 0.01; pool.receiveShadow = true; pool.renderOrder = 2; group.add(pool);

  // the waterfall: two sheets of falling streaks curving off the lip, white water and spray where it lands
  {
    const out = new V3(POOL.x - LIP.x, 0, POOL.z - LIP.z).normalize(), side = new V3(-out.z, 0, out.x), W = 2.1, ROWS = 18;
    const COLS = 10;
    const sheet = (spread, speed, opacity, push) => {
      const pos = [], uvs = [], cols = [], idx = [], edge = Array.from({ length: COLS + 1 }, (_, j) => j / COLS);
      const thick = edge.map(() => 0.55 + rnd() * 0.45);
      for (let i = 0; i <= ROWS; i++) {
        const t = i / ROWS, y = lerp(LIP.y + 0.05, POOL.y, t);
        for (let j = 0; j <= COLS; j++) {
          const v = edge[j] * 2 - 1, o = push + 0.35 + (1.05 + 0.15 * Math.sin(v * 3 + push * 9)) * Math.sqrt(t) - 0.12 * v * v;
          const p = LIP.clone().addScaledVector(out, o).addScaledVector(side, v * (W / 2) * (1 + spread * t)); pos.push(p.x, y, p.z); uvs.push(edge[j] * 1.6, t * 2.2);
          const a = thick[j] * (1 - Math.pow(Math.abs(v), 3)) * (0.75 + 0.25 * Math.sin(t * 3.1)) * (1 - 0.35 * smoothstep(0.75, 1, t));
          cols.push(1, 1, 1, a);
          if (i && j) { const r0 = (i - 1) * (COLS + 1), r1 = i * (COLS + 1); idx.push(r0 + j - 1, r1 + j - 1, r0 + j, r0 + j, r1 + j - 1, r1 + j); }
        }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 4)); g.setIndex(idx); g.computeVertexNormals();
      const t = streakTex(); t.repeat.set(1, 1);
      const m = new THREE.MeshStandardMaterial({ color: 0xa9b8bd, vertexColors: true, alphaMap: t, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, roughness: 0.3, envMapIntensity: 1.4 });
      updaters.push((dt) => { t.offset.y += speed * dt; });
      const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 3; group.add(mesh);
    };
    sheet(0.15, 1.35, 0.75, 0); sheet(0.3, 1.9, 0.45, 0.12); sheet(0.05, 1.1, 0.4, -0.1);
    // a lip of white water where the stream tips over
    const lipM = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.05, 0.5).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8c4c8, alphaMap: streakTex(), transparent: true, opacity: 0.45, depthWrite: false }));
    lipM.position.copy(LIP).addScaledVector(out, 0.15).y += 0.03; lipM.rotation.y = Math.atan2(out.x, out.z); group.add(lipM);
    // foam and spray at the foot
    const puff = puffTex(), FN = 26, foam = [];
    for (let i = 0; i < FN; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: 0x9aa6ad, transparent: true, depthWrite: false, opacity: 0 }));
      s.userData = { ph: rnd() * 3, sp: 0.35 + rnd() * 0.4, ox: (rnd() - 0.5) * W * 1.3, oz: rnd() * 1.2 }; group.add(s); foam.push(s);
    }
    const foot = LIP.clone().addScaledVector(out, 1.45).setY(POOL.y);
    updaters.push((dt, time) => {
      for (const s of foam) {
        const u = s.userData, t = ((time * u.sp + u.ph) % 1);
        s.position.copy(foot).addScaledVector(side, u.ox * (1 + t * 0.4)).addScaledVector(out, u.oz + t * 1.4).y += 0.1 + t * 1.6;
        s.scale.setScalar(0.8 + t * 2.6); s.material.opacity = Math.sin(t * Math.PI) * 0.2;
      }
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 1.9, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x8e9a9e, alphaMap: streakTex(), transparent: true, opacity: 0.16, depthWrite: false }));
    ring.position.copy(foot).y += 0.02; group.add(ring); updaters.push((dt) => { ring.rotation.y += dt * 0.15; });
  }

  // ---------- rocks: the ledge, the pool, the banks, the field ----------
  const place = (piece, x, y, z, s, ry, tilt = 0) => {
    const m = new THREE.Mesh(piece.geo, piece.mat); m.position.set(x, y, z); m.scale.setScalar(s); m.rotation.set(tilt, ry, 0);
    m.castShadow = m.receiveShadow = true; group.add(m); return m;
  };
  for (const rk of hole.rocks) { const p = A.rocks[(rk.seed * 3 + 1) % A.rocks.length]; place(p, rk.pos.x, rk.pos.y - 0.03, rk.pos.z, rk.r / p.r, rk.seed * 2.1); }
  {
    const out = new V3(POOL.x - LIP.x, 0, POOL.z - LIP.z).normalize(), side = new V3(-out.z, 0, out.x);
    for (let i = 0; i < 9; i++) { // the cliff either side of the falls, and boulders breaking the face
      const sd = (i % 2 ? 1 : -1) * (1.5 + (i >> 1) * 1.3), p = LIP.clone().addScaledVector(side, sd).addScaledVector(out, -0.4 - rnd() * 0.8);
      const piece = A.rocks[i % A.rocks.length], s = (2.4 + rnd() * 1.6) / piece.r * 0.5;
      place(piece, p.x, POOL.y - 0.6 + rnd() * 1.5, p.z, s, rnd() * 6.28, (rnd() - 0.5) * 0.4);
    }
    for (let i = 0; i < 6; i++) { const p = LIP.clone().addScaledVector(side, (i % 2 ? 1 : -1) * (1.3 + rnd() * 0.5)).addScaledVector(out, -0.6 - i * 0.7); const piece = A.rocks[(i + 3) % A.rocks.length]; place(piece, p.x, groundH(p.x, p.z) - 0.3, p.z, (0.9 + rnd() * 0.8) / piece.r * 0.5, rnd() * 6.28); }
    for (let i = 0; i < 10; i++) { const a = rnd() * 6.28, r = 3.9 + rnd() * 1.3, x = POOL.x + Math.cos(a) * r, z = POOL.z + Math.sin(a) * r; if (Math.cos(a) * out.x + Math.sin(a) * out.z < -0.2) continue; const piece = A.rocks[i % A.rocks.length]; place(piece, x, groundH(x, z) - 0.2, z, (0.5 + rnd() * 0.7) / piece.r * 0.5, rnd() * 6.28); }
  }
  for (const run of runs) for (let i = 8; i < run.length; i += 9 + Math.floor(rnd() * 8)) { // stones along the banks
    const q = run[i]; if (q.p.distanceTo(center) > 90) continue;
    const s = rnd() < 0.5 ? -1 : 1, p = q.p.clone().addScaledVector(q.side, s * (q.w / 2 + 0.2 + rnd() * 0.5)), piece = A.rocks[i % A.rocks.length];
    place(piece, p.x, groundH(p.x, p.z) - 0.12, p.z, (0.25 + rnd() * 0.45) / piece.r * 0.5, rnd() * 6.28);
  }

  // ---------- trees: the garden's maples and pines where the plan puts them, a ring of woodland beyond, painted cut-outs on the hills ----------
  const presets = ['Oak Medium', 'Ash Medium', 'Aspen Medium', 'Oak Large', 'Pine Medium'];
  const protos = presets.slice(0, Math.max(2, quality.treeKinds)).map((p, i) => {
    const t = new Tree(); t.loadPreset(p); t.options.seed = 2024 + i * 77;
    if (t.options.leaves) t.options.leaves.tint = 0x9a9f78;
    t.generate();
    const h = new THREE.Box3().setFromObject(t).getSize(new V3()).y;
    updaters.push((dt, time) => t.update(time));
    return { t, h, name: p };
  });
  const special = (preset, seed, tint) => { // a maple's autumn red or a pine's dark needles, painted over the leaf texture's own green
    const t = new Tree(); t.loadPreset(preset); t.options.seed = seed; t.generate();
    const m = t.leavesMesh.material, orig = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => { orig(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>\n diffuseColor.rgb = vec3( dot( diffuseColor.rgb, vec3( 0.3, 0.59, 0.11 ) ) ) * 2.4 * ${'vec3(' + tint.map(v => v.toFixed(3)).join(',') + ')'};`); };
    m.customProgramCacheKey = () => 'leaf-' + tint.join(',');
    updaters.push((dt, time) => t.update(time));
    return { t, h: new THREE.Box3().setFromObject(t).getSize(new V3()).y };
  };
  const maple = special('Ash Medium', 811, [0.78, 0.17, 0.07]), maple2 = special('Ash Small', 812, [0.86, 0.38, 0.08]), pine = special('Pine Medium', 913, [0.2, 0.3, 0.16]);
  const putTree = (p, x, z, height, prot = p.t) => {
    const g = new THREE.Group();
    for (const m of [prot.branchesMesh, prot.leavesMesh]) { if (!m.geometry.attributes.position) continue; const c = new THREE.Mesh(m.geometry, m.material); c.castShadow = true; c.receiveShadow = true; g.add(c); }
    g.position.set(x, groundH(x, z) - 0.15, z); g.rotation.y = rnd() * 6.283; g.scale.setScalar(height / p.h * (0.9 + rnd() * 0.2)); group.add(g); return g;
  };
  PLAN.maples.forEach(([x, z, h], i) => putTree(i % 2 ? maple2 : maple, x, z, h));
  PLAN.pines.forEach(([x, z, h]) => putTree(pine, x, z, h));
  const spots = [];   // the woodland edge: a loose ring just outside the garden, thicker behind the bamboo
  for (let i = 0; i < 40 && spots.length < quality.trees; i++) {
    const a = rnd() * 6.283, r = 19 + rnd() * 16, x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    if (tended(x, z) || clear(x, z) < 2.5 || spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 6)) continue;
    spots.push([x, z]); putTree(protos[i % protos.length], x, z, 10 + rnd() * 5);
  }

  // the far trees: each kind rendered once to a picture, then stood as crossed cards across the hills
  {
    const cards = protos.map((p) => {
      const W = 256, H = 512, rt = new THREE.WebGLRenderTarget(W, H, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
      const sc = new THREE.Scene(), tr = new THREE.Group();
      for (const m of [p.t.branchesMesh, p.t.leavesMesh]) if (m.geometry.attributes.position) tr.add(new THREE.Mesh(m.geometry, m.material));
      sc.add(tr, new THREE.AmbientLight(0xb8c0d0, 1.4)); const dl = new THREE.DirectionalLight(0xffe0c0, 2.2); dl.position.set(1, 2, 2); sc.add(dl);
      const box = new THREE.Box3().setFromObject(tr), sz = box.getSize(new V3()), half = Math.max(sz.x, sz.z) / 2 * 1.02, hh = Math.max(sz.y / 2, half);
      const cam = new THREE.OrthographicCamera(-hh / 2, hh / 2, sz.y / 2 + 0.2, -sz.y / 2 - 0.2, 0.1, 500);
      cam.left = -half; cam.right = half; cam.updateProjectionMatrix();
      const cy = (box.min.y + box.max.y) / 2; cam.position.set(0, cy, 200); cam.lookAt(0, cy, 0);
      const prevT = renderer.getRenderTarget(), prevC = new THREE.Color(), prevA = renderer.getClearAlpha(); renderer.getClearColor(prevC);
      const xr = renderer.xr.enabled; renderer.xr.enabled = false;
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(sc, cam);
      renderer.setRenderTarget(prevT); renderer.setClearColor(prevC, prevA); renderer.xr.enabled = xr;
      const aspect = (2 * half) / (sz.y + 0.4);
      const q1 = new THREE.PlaneGeometry(aspect, 1).translate(0, 0.5, 0), q2 = q1.clone().rotateY(Math.PI / 2);
      const geo = new THREE.BufferGeometry().copy(q1); { const m = [q1, q2]; const pos = [], uvs = [], idx = []; let o = 0; for (const g of m) { pos.push(...g.attributes.position.array); uvs.push(...g.attributes.uv.array); idx.push(...Array.from(g.index.array, v => v + o)); o += g.attributes.position.count; }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(idx); geo.computeVertexNormals(); }
      const mat = new THREE.MeshLambertMaterial({ map: rt.texture, alphaTest: 0.5, side: THREE.DoubleSide, color: 0x8b8e80 });
      return { geo, mat };
    });
    const N = quality.farTrees, per = Math.ceil(N / cards.length), d = new THREE.Object3D();
    const ims = cards.map(c => { const im = new THREE.InstancedMesh(c.geo, c.mat, per); im.count = 0; im.castShadow = true; im.receiveShadow = false; group.add(im); return im; });
    for (let tries = 0, n = 0; n < N && tries < N * 30; tries++) {
      const a = rnd() * 6.283, r = 42 + Math.pow(rnd(), 1.6) * 760, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const wood = fbm(x * 0.006 + 7, z * 0.006 + 2, 4);
      if (wood < 0.5 && rnd() > 0.08) continue;
      if (clear(x, z) < 3) continue;
      const im = ims[n % ims.length]; if (im.count >= per) { n++; continue; }
      const h = 9 + rnd() * 9;
      d.position.set(x, groundH(x, z, false) - 0.3, z); d.rotation.set(0, rnd() * 6.283, 0); d.scale.set(h, h, h); d.updateMatrix();
      im.setMatrixAt(im.count++, d.matrix); n++;
    }
    ims.forEach(im => { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); });
  }

  // ---------- grass ----------
  const N = quality.grass, R = 40;
  const gm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  gm.onBeforeCompile = (s) => {
    s.uniforms.uTime = uTime;
    s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <project_vertex>', `
      vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
      vec2 ip = instanceMatrix[3].xz; float hh = position.y * position.y;
      float gust = sin(uTime * 0.9 + ip.x * 0.21 + ip.y * 0.17) * 0.6 + sin(uTime * 2.1 + ip.x * 1.1 - ip.y * 0.8) * 0.25 + sin(uTime * 4.3 + ip.x * 3.7 + ip.y * 2.9) * 0.1;
      float sway = (0.25 + gust * 0.5) * length(instanceMatrix[1].xyz) * 0.4;
      mvPosition.xz += vec2(0.8, 0.6) * sway * hh;
      mvPosition.y -= abs(sway) * hh * 0.25;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`);
    s.fragmentShader = s.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n normal = normalize(vNormal);');
  };
  const grass = new THREE.InstancedMesh(bladeGeometry(), gm, N);
  const d = new THREE.Object3D(), g1 = new THREE.Color(0x4e5a26), g2 = new THREE.Color(0x868a45), g3 = new THREE.Color(0xa49863);
  let n = 0;
  for (let tries = 0; n < N && tries < N * 3; tries++) {
    const a = rnd() * 6.283, r = R * Math.pow(rnd(), 0.72);
    const x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    const dd = clear(x, z); if (dd < 0.1 || tended(x, z)) continue;
    const patch = fbm(x * 0.5 + 3, z * 0.5, 3), fade = 1 - smoothstep(R * 0.6, R, r);
    const h = (0.08 + patch * 0.34 + rnd() * 0.1) * (0.45 + 0.55 * smoothstep(0.1, 1.6, dd)) * (0.35 + 0.65 * fade);
    d.position.set(x, groundH(x, z) - 0.01, z); d.rotation.set((rnd() - 0.5) * 0.5, rnd() * 6.283, 0);
    d.scale.set(0.009 + rnd() * 0.012, h, h); d.updateMatrix(); grass.setMatrixAt(n, d.matrix);
    cc.copy(g1).lerp(g2, fbm(x * 0.12, z * 0.12 + 20, 3) * 0.7 + rnd() * 0.5); if (rnd() < 0.15) cc.lerp(g3, 0.7);
    grass.setColorAt(n++, cc);
  }
  grass.count = n; grass.receiveShadow = true; grass.frustumCulled = false; group.add(grass);

  // ---------- ferns where it is damp and shaded: the stream's banks, under the maples, at the woodland's feet ----------
  const fernAt = (x, z, s = 1) => { if (clear(x, z) < 0.3) return; const p = A.ferns[(rnd() * A.ferns.length) | 0]; place(p, x, groundH(x, z) - 0.02, z, (0.55 + rnd() * 0.6) * s, rnd() * 6.283); };
  for (const [x, z] of [...spots, ...PLAN.maples]) for (let i = 0; i < 4; i++) { const a = rnd() * 6.283, r = 0.8 + rnd() * 1.8; fernAt(x + Math.cos(a) * r, z + Math.sin(a) * r); }
  for (const run of runs) for (let i = 3; i < run.length; i += 3) { const q = run[i]; if (q.p.distanceTo(center) > 40) continue; const s = rnd() < 0.5 ? -1 : 1, p = q.p.clone().addScaledVector(q.side, s * (q.w / 2 + 0.7 + rnd() * 0.6)); fernAt(p.x, p.z, 1.1); }

  // ---------- the garden itself ----------
  const glow = glowTex();
  const ridge = (() => { const dir = new V3(SUN.x, 0, SUN.z).normalize().applyAxisAngle(UP, -0.3), p = dir.multiplyScalar(300); let best = p.clone(), by = -1e9;
    for (let i = 0; i < 50; i++) { const q = p.clone().add(new V3((rnd() - 0.5) * 100, 0, (rnd() - 0.5) * 100)); const y = groundH(q.x, q.z, false); if (y > by) { by = y; best = q; } } return best.setY(by - 0.6); })();
  const garden = buildGarden({ group, groundH, rnd, mats, A, updaters, glow, lower, pool: POOL, ridgeSpot: ridge });

  // ---------- mist, fireflies ----------
  {
    const puff = puffTex(), wisps = [];
    for (let i = 0; i < quality.mist; i++) {
      const a = rnd() * 6.283, r = 6 + Math.pow(rnd(), 0.8) * 70, x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: 0xb9c2cf, transparent: true, depthWrite: false, opacity: 0.1 + rnd() * 0.12, rotation: rnd() * 6.28 }));
      const sz = 7 + rnd() * 12; s.scale.set(sz, sz * 0.45, 1);
      s.userData = { x, z, y: groundH(x, z, false) + 0.6 + rnd() * 1.6, v: 0.15 + rnd() * 0.25, ph: rnd() * 100 }; group.add(s); wisps.push(s);
    }
    updaters.push((dt, t) => { for (const s of wisps) { const u = s.userData; s.position.set(u.x + Math.sin(t * 0.05 + u.ph) * 6 + t * u.v % 30 - 15, u.y + Math.sin(t * 0.3 + u.ph) * 0.2, u.z + Math.cos(t * 0.04 + u.ph) * 5); } });
  }
  {
    const M = quality.fireflies, base = new Float32Array(M * 4), a = new Float32Array(M * 3), col = new Float32Array(M * 3);
    for (let i = 0; i < M; i++) {
      let x, z; do { const an = rnd() * 6.283, r = 3 + rnd() * 26; x = center.x + Math.cos(an) * r; z = center.z + Math.sin(an) * r; } while (clear(x, z) < 0);
      base.set([x, groundH(x, z, false) + 0.3 + rnd() * 1.8, z, rnd() * 100], i * 4);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glow, vertexColors: true, size: 0.09, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; group.add(pts);
    updaters.push((dt, t) => {
      for (let i = 0; i < M; i++) {
        const s = base[i * 4 + 3];
        a[i * 3] = base[i * 4] + Math.sin(t * 0.21 + s) * 1.3 + Math.sin(t * 0.9 + s * 2) * 0.25;
        a[i * 3 + 1] = base[i * 4 + 1] + Math.sin(t * 0.37 + s * 3) * 0.45;
        a[i * 3 + 2] = base[i * 4 + 2] + Math.cos(t * 0.19 + s) * 1.3;
        const blink = Math.max(0, Math.sin(t * (0.6 + (s % 1) * 0.5) + s * 7)) ** 6 * 3.2;
        col[i * 3] = blink * 1.6; col[i * 3 + 1] = blink * 1.45; col[i * 3 + 2] = blink * 0.45;
      }
      g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
    });
  }

  scene.add(group);
  const out = new V3(POOL.x - LIP.x, 0, POOL.z - LIP.z).normalize();
  return {
    group, sun, focus, lightHole() { },
    terrainH: (x, z) => groundH(x, z), waterAt, waterY: -1000, deer: garden.deer,
    sounds: { falls: LIP.clone().addScaledVector(out, 1.4).setY(POOL.y + 1.5), brook: lower[Math.min(lower.length - 1, 16)].p.clone() },
    update(dt, t, camPos) { uTime.value = t; if (camPos) dome.position.copy(camPos); for (const u of updaters) u(dt, t); },
    dispose() { scene.remove(group); grass.dispose(); tg.dispose(); },
  };
}
