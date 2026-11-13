// Meadow world: photographic HDRI sky + image-based light, PBR ground, wind-blown
// instanced grass, generated trees, scanned rocks / ferns (Poly Haven, CC0).
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tree } from '@dgreenheck/ez-tree';
import { fbm, mulberry32, smoothstep, lerp } from './util.js';

const V3 = THREE.Vector3;
// Sun direction measured from the HDRI (brightest pixel), so shadows match the sky.
const SUN = new V3(0.752, 0.357, 0.554).normalize();

export async function loadAssets(renderer, onProgress = () => { }) {
  let done = 0; const total = 10;
  const tick = (p) => p.then((v) => { onProgress(++done / total); return v; });
  const tl = new THREE.TextureLoader(), gl = new GLTFLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (url, srgb, rep = 1) => tick(tl.loadAsync(url)).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = Math.min(16, maxAniso);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  const [hdr, sky, gd, gn, ga, wd, wn, wa, rocks, fern, stump] = await Promise.all([
    tick(fetch('golf-assets/sky/lilienstein_1k.hdr.txt').then(r => r.text()).then((b64) => {
      // The HDR ships base64-encoded in a text file so any static host will serve it.
      const bin = atob(b64.trim()), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const d = new HDRLoader().parse(buf.buffer);
      const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
      t.colorSpace = THREE.LinearSRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = true; t.needsUpdate = true;
      return t;
    })),
    tl.loadAsync('golf-assets/sky/lilienstein_4k.jpg'),
    tex('golf-assets/tex/leafy_grass_diff.jpg', true), tex('golf-assets/tex/leafy_grass_nor.jpg'), tex('golf-assets/tex/leafy_grass_arm.jpg'),
    tex('golf-assets/tex/wood_planks_diff.jpg', true, 0.6), tex('golf-assets/tex/wood_planks_nor.jpg', false, 0.6), tex('golf-assets/tex/wood_planks_arm.jpg', false, 0.6),
    tick(gl.loadAsync('golf-assets/models/rock_moss_set_01/rock_moss_set_01.json')),
    tick(gl.loadAsync('golf-assets/models/fern_02/fern_02.json')),
    tick(gl.loadAsync('golf-assets/models/tree_stump_01/tree_stump_01.json')),
  ]);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(hdr).texture; pm.dispose(); hdr.dispose();
  sky.colorSpace = THREE.SRGBColorSpace; sky.anisotropy = Math.min(8, maxAniso);
  // Split a glTF into individual meshes, each re-centred so its base sits on the origin.
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
  return { env, sky, grass: { map: gd, normalMap: gn, arm: ga }, wood: { map: wd, normalMap: wn, arm: wa }, rocks: pieces(rocks), ferns: pieces(fern), stump: pieces(stump) };
}

function bladeGeometry() {
  const SEG = 4, pos = [], col = [], nor = [], idx = [];
  for (let i = 0; i <= SEG; i++) {
    const y = i / SEG, hw = 0.5 * (1 - Math.pow(y, 1.6) * 0.92), z = 0.32 * y * y;
    const c = 0.3 + 0.7 * Math.pow(y, 0.8);
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

export function buildEnvironment(e, renderer, scene, holes, mats, quality, A) {
  const group = new THREE.Group();
  const rnd = mulberry32(4242);
  const updaters = [];
  const uTime = { value: 0 };

  // ---------- sky + light ----------
  const domeGeo = new THREE.SphereGeometry(2500, 64, 32); domeGeo.scale(-1, 1, 1);
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ map: A.sky, toneMapped: false, fog: false, depthWrite: false, side: THREE.DoubleSide }));
  dome.rotation.y = Math.PI; dome.renderOrder = -100; dome.frustumCulled = false; group.add(dome);
  scene.environment = A.env; scene.environmentIntensity = 0.75;
  scene.fog = new THREE.FogExp2(0xc6d0d4, 0.0042);
  renderer.toneMappingExposure = 1.05;

  const sun = new THREE.DirectionalLight(0xffe2b8, 3.4);
  sun.castShadow = quality.shadows;
  sun.shadow.mapSize.setScalar(quality.shadowSize * 2);
  const SB = 17; Object.assign(sun.shadow.camera, { left: -SB, right: SB, top: SB, bottom: -SB, near: 1, far: 140 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  group.add(sun, sun.target);
  group.add(new THREE.HemisphereLight(0xc4d8f0, 0x6b7740, 1.0));
  const focus = (c) => { sun.target.position.copy(c); sun.position.copy(c).addScaledVector(SUN, 70); sun.target.updateMatrixWorld(); };

  // ---------- terrain ----------
  const samples = holes.flatMap(h => h.samples).filter((_, i) => i % 2 === 0);
  const deck = (x, z) => { // [distance outside the hole edge, deck height there]
    let best = 1e9, y = 0;
    for (const s of samples) { const d = Math.hypot(x - s[0], z - s[1]) - (s[3] - 0.3); if (d < best) { best = d; y = s[2]; } }
    return [best, y];
  };
  const n0 = fbm(11, 5, 4);
  const rawH = (x, z) => {
    const r = Math.hypot(x, z);
    return (fbm(x * 0.028 + 11, z * 0.028 + 5, 4) - n0) * 3.2 * smoothstep(3, 30, r) + smoothstep(90, 210, r) * (2 + 7 * fbm(x * 0.012 + 3, z * 0.012 + 8, 3));
  };
  const terrainH = (x, z) => { const [d, y] = deck(x, z); return d > 6 ? rawH(x, z) : lerp(rawH(x, z), y - 0.07, smoothstep(5, 0.5, d)); };

  const SIZE = 440, SEG = quality.terrainSeg;
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, uv = tg.attributes.uv, col = new Float32Array(tp.count * 3);
  const cA = new THREE.Color(0xa8b46a), cB = new THREE.Color(0xd9d39a), cC = new THREE.Color(0x7f9a55), cc = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    let x = tp.getX(i), z = tp.getZ(i);
    const u = Math.max(Math.abs(x), Math.abs(z)) / (SIZE / 2), k = 0.3 + 0.7 * u * u; x *= k; z *= k;
    tp.setXYZ(i, x, terrainH(x, z), z); uv.setXY(i, x / 2.4, z / 2.4);
    const n = fbm(x * 0.06 + 40, z * 0.06, 4), m = fbm(x * 0.35, z * 0.35 + 9, 2);
    cc.copy(cA).lerp(cB, smoothstep(0.45, 0.75, n)).lerp(cC, smoothstep(0.5, 0.2, n)).multiplyScalar(1.25 + (m - 0.5) * 0.5);
    col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({
    map: A.grass.map, normalMap: A.grass.normalMap, roughnessMap: A.grass.arm, aoMap: A.grass.arm, vertexColors: true, roughness: 1, metalness: 0, envMapIntensity: 0.6,
  }));
  terrain.receiveShadow = true; group.add(terrain);

  // ---------- trees ----------
  const presets = ['Oak Medium', 'Ash Medium', 'Aspen Medium', 'Oak Large', 'Ash Large'];
  const protos = presets.slice(0, quality.treeKinds).map((p, i) => {
    const t = new Tree(); t.loadPreset(p); t.options.seed = 2024 + i * 77; t.generate();
    const h = new THREE.Box3().setFromObject(t).getSize(new V3()).y;
    updaters.push((dt, time) => t.update(time));
    return { t, h };
  });
  const spots = [[6, 13.5, 0, 11], [-8.5, -3.5, 1, 9], [-7, 10, 2, 10], [12, -9, 3, 13], [-14.5, 5, 0, 10], [4.5, -14, 1, 11], [-4, -18, 3, 14],
    [17, 3, 2, 12], [20, 27, 4, 14], [-21, -11, 4, 15], [-25, 13, 0, 12], [8, 23, 3, 15], [-11, 25, 1, 11], [27, -15, 0, 12], [-30, -2, 2, 13],
    [0, -30, 4, 16], [31, 27, 1, 13], [-19, -27, 0, 12], [15, -32, 2, 14], [38, 4, 3, 16], [-38, 19, 4, 15], [-3, 36, 0, 13], [44, -22, 1, 14], [-44, -20, 3, 16]];
  const treeSpots = spots.slice(0, quality.trees);
  for (const [x, z, k, height] of treeSpots) {
    const p = protos[k % protos.length], g = new THREE.Group();
    for (const m of [p.t.branchesMesh, p.t.leavesMesh]) { const c = new THREE.Mesh(m.geometry, m.material); c.castShadow = true; c.receiveShadow = true; g.add(c); }
    g.position.set(x, terrainH(x, z) - 0.15, z); g.rotation.y = rnd() * 6.283; g.scale.setScalar(height / p.h * (0.9 + rnd() * 0.2));
    group.add(g);
  }

  // ---------- grass ----------
  const N = quality.grass, R = 30;
  const center = holes[0].center;
  const gm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  gm.onBeforeCompile = (s) => {
    s.uniforms.uTime = uTime;
    s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <project_vertex>', `
      vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
      vec2 ip = instanceMatrix[3].xz; float hh = position.y * position.y;
      float gust = sin(uTime * 1.3 + ip.x * 0.31 + ip.y * 0.23) * 0.6 + sin(uTime * 2.7 + ip.x * 1.1 - ip.y * 0.8) * 0.25 + sin(uTime * 5.3 + ip.x * 3.7 + ip.y * 2.9) * 0.1;
      float sway = (0.35 + gust * 0.65) * length(instanceMatrix[1].xyz) * 0.45;
      mvPosition.xz += vec2(0.8, 0.6) * sway * hh;
      mvPosition.y -= abs(sway) * hh * 0.25;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`);
    s.fragmentShader = s.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n normal = normalize(vNormal);');
  };
  const grass = new THREE.InstancedMesh(bladeGeometry(), gm, N);
  const d = new THREE.Object3D(), g1 = new THREE.Color(0x5f8a2c), g2 = new THREE.Color(0x9bb04a), g3 = new THREE.Color(0xcbbd6e);
  let n = 0;
  for (let tries = 0; n < N && tries < N * 3; tries++) {
    const a = rnd() * 6.283, r = R * Math.pow(rnd(), 0.72);
    const x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    const dd = deck(x, z)[0]; if (dd < 0.1) continue;
    const patch = fbm(x * 0.5 + 3, z * 0.5, 3), fade = 1 - smoothstep(R * 0.6, R, r);
    const h = (0.07 + patch * 0.3 + rnd() * 0.08) * (0.45 + 0.55 * smoothstep(0.1, 1.6, dd)) * (0.35 + 0.65 * fade);
    d.position.set(x, terrainH(x, z) - 0.01, z); d.rotation.set((rnd() - 0.5) * 0.5, rnd() * 6.283, 0);
    d.scale.set(0.009 + rnd() * 0.012, h, h); d.updateMatrix(); grass.setMatrixAt(n, d.matrix);
    cc.copy(g1).lerp(g2, fbm(x * 0.12, z * 0.12 + 20, 3) * 0.7 + rnd() * 0.5); if (rnd() < 0.12) cc.lerp(g3, 0.7);
    grass.setColorAt(n++, cc);
  }
  grass.count = n; grass.receiveShadow = true; grass.frustumCulled = false; group.add(grass);

  // ---------- rocks, ferns, stump ----------
  const place = (piece, x, y, z, s, ry, tilt = 0) => {
    const m = new THREE.Mesh(piece.geo, piece.mat); m.position.set(x, y, z); m.scale.setScalar(s); m.rotation.set(tilt, ry, 0);
    m.castShadow = m.receiveShadow = true; group.add(m); return m;
  };
  for (const h of holes) for (const rk of h.rocks) { // rocks that are in play on the green
    const p = A.rocks[(rk.seed * 3 + 1) % A.rocks.length];
    place(p, rk.pos.x, rk.pos.y - 0.03, rk.pos.z, rk.r / p.r, rk.seed * 2.1);
  }
  let placed = 0;
  for (let i = 0; placed < 26 && i < 400; i++) {
    const a = rnd() * 6.283, r = 3 + rnd() * 26, x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    const p = A.rocks[i % A.rocks.length], s = (0.35 + rnd() * rnd() * 1.1) * (r > 14 ? 1.6 : 1);
    if (deck(x, z)[0] < 0.5 + p.r * s * 1.3) continue;
    place(p, x, terrainH(x, z) - p.h * s * 0.22, z, s, rnd() * 6.283); placed++;
  }
  const fernAt = (x, z) => { const p = A.ferns[(rnd() * A.ferns.length) | 0]; place(p, x, terrainH(x, z) - 0.02, z, 0.55 + rnd() * 0.6, rnd() * 6.283); };
  for (const [x, z] of treeSpots.slice(0, 12)) for (let i = 0; i < 5; i++) { const a = rnd() * 6.283, r = 0.7 + rnd() * 2.2; fernAt(x + Math.cos(a) * r, z + Math.sin(a) * r); }
  for (let i = 0; i < 24; i++) { const a = rnd() * 6.283, r = 4 + rnd() * 16, x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r; if (deck(x, z)[0] > 0.8) fernAt(x, z); }
  for (const [x, z, s] of [[-3.6, 2.2, 1], [5.5, -6.5, 1.25]]) if (A.stump[0]) place(A.stump[0], x, terrainH(x, z) - 0.06, z, s, x);

  // ---------- drifting pollen in the low sun ----------
  {
    const M = 260, base = new Float32Array(M * 4), a = new Float32Array(M * 3);
    for (let i = 0; i < M; i++) base.set([center.x + (rnd() - 0.5) * 30, 0.3 + rnd() * 4, center.z + (rnd() - 0.5) * 30, rnd() * 100], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff1c9, size: 0.018, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; group.add(pts);
    updaters.push((dt, t) => {
      for (let i = 0; i < M; i++) {
        const s = base[i * 4 + 3];
        a[i * 3] = base[i * 4] + ((t * 0.25 + s) % 6) - 3 + Math.sin(t * 0.7 + s) * 0.3;
        a[i * 3 + 1] = base[i * 4 + 1] + Math.sin(t * 0.4 + s * 3) * 0.35;
        a[i * 3 + 2] = base[i * 4 + 2] + ((t * 0.18 + s * 1.7) % 6) - 3;
      }
      g.attributes.position.needsUpdate = true;
    });
  }

  scene.add(group);
  return {
    group, sun, terrainH, waterY: -1000, focus, lightHole() { },
    update(dt, t, camPos) { uTime.value = t; if (camPos) dome.position.copy(camPos); for (const u of updaters) u(dt, t); },
    dispose() { scene.remove(group); grass.dispose(); tg.dispose(); },
  };
}
