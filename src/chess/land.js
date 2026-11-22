// SKIRMISH TABLE's landscaped battlefields: a map's data (maps.js) made into a table-top diorama: sculpted ground, flowing water, a bridge, swaying grass and trees, rocks, ruins, fires, mist, birds, and the three worlds' own ground, sheets of ice and lava and things (worlds.js), each thing the size scale.js gives it beside a figure, under a sky of drifting cloud (clouds.js)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { highAt } from './maps.js';
import { METRE, SIZES } from './scale.js';
import { CLOUD, CLOUD_GLSL, shade, setClouds, driftClouds, makeSky } from './clouds.js';
import { GROWN, makeWorld } from './worlds.js';

const S = 6, B = 2, STEP = 0.42, WATER = -0.07, DECK = 0.08, BASE = -0.3;
const ASSETS = '/chess-assets/land/';

// the hour's light: sun [colour, strength], where it stands, sky light [sky, ground, strength], haze [colour, density], the sky top to bottom, the water's reflected sky (horizon, zenith) and body (shallow, deep), grass (root, tip), cloud [how much of the sky, how dark its shade]
export const HOURS = {
  morning: { sun: [0xfff0d8, 3.1], dir: [7, 9, 3], hemi: [0xbcd6ff, 0x55633a, 0.8], fog: [0xa9bfcf, 0.011], sky: ['#5f97cf', '#b4d0e6', '#e4e0cf'], exposure: 1.02, env: 0.45,
    water: [0xc9dceb, 0x6f9fd0, 0x5f9488, 0x1f4c52], grass: [0x2f4a1a, 0x8fae45], turf: 0x6f9038, mote: 0xfff4d0, fire: 2.5, cloud: [0.5, 0.42] },
  sunset: { sun: [0xffa860, 3.3], dir: [9, 4.2, -2.5], hemi: [0xa49ac4, 0x4a3324, 0.6], fog: [0xc48a6c, 0.015], sky: ['#343b74', '#d47f5a', '#f4c58a'], exposure: 1.0, env: 0.4,
    water: [0xf0b084, 0x5a5a94, 0x5a6a5a, 0x1c2c34], grass: [0x3a4018, 0xa89a48], turf: 0x8a8a42, mote: 0xffc890, fire: 4, cloud: [0.55, 0.4] },
  dusk: { sun: [0x8fa8ff, 1.25], dir: [-6, 8, 4], hemi: [0x5c6ea4, 0x1c2622, 0.55], fog: [0x26344a, 0.026], sky: ['#0b1128', '#22304e', '#4a5672'], exposure: 1.12, env: 0.3,
    water: [0x6a7ca4, 0x1c2a48, 0x3a5c5e, 0x14282e], grass: [0x1c2c1a, 0x52703c], turf: 0x4a6a48, mote: 0xd8ff9a, fire: 6, cloud: [0.45, 0.3] },
  // the three worlds' own light: a cavern lit by what glows in it, a snowbound pass in the last light, a burnt waste under ash
  cavern: { sun: [0x8fd8e8, 0.9], dir: [3, 10, 2], hemi: [0x4a8a9a, 0x1a2430, 1.15], fog: [0x060d12, 0.034], sky: ['#02060a', '#04090e', '#060d12'], exposure: 1.18, env: 0.16,
    water: [0x1c5a60, 0x06141c, 0x0e4a52, 0x030c12], grass: [0x1c3a34, 0x3a7a6a], turf: 0x4a6a60, mote: 0x8ff0d8, fire: 5, cloud: [0, 0] },
  frost: { sun: [0xffb48a, 2.5], dir: [-9, 3.4, -3.5], hemi: [0x9ab4ec, 0x7888ac, 0.95], fog: [0x93a4c8, 0.021], sky: ['#3c4c84', '#8e94c0', '#f0bc9c'], exposure: 0.98, env: 0.5,
    water: [0xc8d0e8, 0x7484b4, 0xb4cce4, 0x7fa0c8], grass: [0x6a5a3a, 0xb8a878], turf: 0xffffff, mote: 0xffffff, fire: 5.5, cloud: [0.62, 0.3] },
  ember: { sun: [0xff9466, 1.7], dir: [8, 5, -4], hemi: [0x5c5058, 0x4a2412, 0.9], fog: [0x1c1110, 0.027], sky: ['#0a0707', '#2c1410', '#8a3418'], exposure: 1.08, env: 0.22,
    water: [0x2a1410, 0x0c0706, 0xff5a14, 0x200a04], grass: [0x161210, 0x3a3028], turf: 0xffffff, mote: 0xff9a50, fire: 5, cloud: [0.78, 0.2] },
};
// how each ground (maps.js) is drawn: how far it lies below its level (above, when less than nothing), what it is made of [worn, wooded, rock, bed], whether the sheet (water, ice or lava) lies over it, whether something grows on it
const DRAW = {
  d: { k: [1, 0, 0, 0] }, f: { k: [0, 1, 0, 0], grove: 1 }, r: { crag: 1, k: [0, 0, 1, 0] }, x: { dip: -0.03, k: [0.7, 0, 0.3, 0] },
  w: { dip: 0.42, k: [0, 0, 0, 1], wet: 1 }, b: { dip: 0.42, k: [0, 0, 0, 1], wet: 1 }, s: { dip: 0.16, k: [0, 0, 0, 1], wet: 1 },
  i: { dip: 0.2, k: [0, 0, 0, 1], wet: 1, stand: 1 }, l: { dip: 0.34, k: [0, 0, 0, 1], wet: 1 },
  n: { dip: -0.15, k: [0, 0.8, 0, 0] }, m: { k: [0, 1, 0, 0], grove: 1 }, c: { dip: -0.05, k: [0, 0, 1, 0] },
  a: { dip: -0.12, k: [0, 1, 0, 0] }, k: { k: [1, 0, 0, 0] }, v: { dip: 0.09, k: [1, 0, 0, 0] },
};
const NONE = { k: [0, 0, 0, 0] }, drawOf = g => DRAW[g] || NONE, SHEET = { water: 0, ice: 1, lava: 2 };
const MARK = { sel: [255, 190, 40, 255], hit: [255, 40, 30, 255], heal: [40, 220, 100, 255], move: [25, 85, 255, 225] };

const cache = new Map();
const once = (k, make) => { if (!cache.has(k)) cache.set(k, make()); return cache.get(k); };
const texLoader = new THREE.TextureLoader(), gltf = new GLTFLoader();
function tex(name, srgb) {
  return once('t:' + name, () => {
    const t = texLoader.load(ASSETS + 'tex/' + name + '.jpg');
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}
const model = name => once('m:' + name, () => gltf.loadAsync(ASSETS + 'm/' + name + '.glb'));

const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const sm = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
  return (hash(i, j) * (1 - a) + hash(i + 1, j) * a) * (1 - b) + (hash(i, j + 1) * (1 - a) + hash(i + 1, j + 1) * a) * b;
}
const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.3 + 5.1, y * 2.3 + 1.7) * 0.3 + vnoise(x * 5.1 + 2.2, y * 5.1 + 9.4) * 0.15;

// the marks and the tile lines, laid over whatever the material draws; vB is the board's own x,z
const DRAPE_PARS = 'uniform sampler2D tMark; uniform vec2 uGrid; varying vec2 vB;\n';
const DRAPE = `vec3 markGlow = vec3(0.);
{ vec2 tc = vB + uGrid * .5;
  if (tc.x > 0. && tc.y > 0. && tc.x < uGrid.x && tc.y < uGrid.y) {
    vec2 f = fract(tc); float e = min(min(f.x, 1. - f.x), min(f.y, 1. - f.y));
    float line = 1. - smoothstep(.012, .045, e);
    diffuseColor.rgb *= .93 + .07 * mod(floor(tc.x) + floor(tc.y), 2.);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * .4, line * .6);
    vec4 mk = texture2D(tMark, (floor(tc) + .5) / uGrid);
    float band = 1. - smoothstep(.03, .17, e);
    diffuseColor.rgb = mix(diffuseColor.rgb, mk.rgb * .8, mk.a * (.34 + .5 * band));
    markGlow = mk.rgb * mk.a * (.05 + .3 * band);
  } }
`;
function drape(mat, U, key, more) {
  mat.onBeforeCompile = s => {
    Object.assign(s.uniforms, U, more ? more.uniforms : null);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vB;\n' + (more && more.vpars || ''))
      .replace('#include <begin_vertex>', (more && more.vmain) || '#include <begin_vertex>\nvB = position.xz;');
    if (more && more.vnormal) s.vertexShader = s.vertexShader.replace('#include <beginnormal_vertex>', more.vnormal);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\n' + DRAPE_PARS + (more && more.fpars || ''))
      .replace('#include <map_fragment>', (more && more.fmap || '#include <map_fragment>') + '\n' + DRAPE)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += markGlow;');
    if (more && more.frag) s.fragmentShader = more.frag(s.fragmentShader);
  };
  mat.customProgramCacheKey = () => 'chess-' + key;
  return shade(mat);
}

function tileNoise(size, cells) {   // a tiling picture of slopes, for the water's ripples
  const g = new Float32Array(cells * cells), r = rng(77);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const at = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), c = (p, q) => g[((q % cells + cells) % cells) * cells + ((p % cells + cells) % cells)];
    return (c(i, j) * (1 - a) + c(i + 1, j) * a) * (1 - b) + (c(i, j + 1) * (1 - a) + c(i + 1, j + 1) * a) * b; };
  const h = (x, y) => at(x, y) * 0.65 + at(x * 2, y * 2) * 0.35, d = new Uint8Array(size * size * 4), k = cells / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4, e = 0.6;
    d[o] = 128 + Math.max(-127, Math.min(127, (h((x + e) * k, y * k) - h((x - e) * k, y * k)) * 900));
    d[o + 1] = 128 + Math.max(-127, Math.min(127, (h(x * k, (y + e) * k) - h(x * k, (y - e) * k)) * 900));
    d[o + 2] = h(x * k, y * k) * 255; d[o + 3] = 255;
  }
  const t = new THREE.DataTexture(d, size, size); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}

// one rock mesh of many stones -> each stone its own shape, standing on the origin, one unit wide
function stones(geo) {
  const pos = geo.attributes.position, idx = geo.index.array, n = pos.count, par = new Int32Array(n), seen = new Map();
  for (let i = 0; i < n; i++) { const k = Math.round(pos.getX(i) * 500) + ',' + Math.round(pos.getY(i) * 500) + ',' + Math.round(pos.getZ(i) * 500); if (seen.has(k)) par[i] = seen.get(k); else { seen.set(k, i); par[i] = i; } }
  const find = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  for (let i = 0; i < idx.length; i += 3) { const a = find(idx[i]), b = find(idx[i + 1]), c = find(idx[i + 2]); par[b] = a; par[c] = a; }
  const groups = new Map();
  for (let i = 0; i < idx.length; i += 3) { const r = find(idx[i]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(idx[i], idx[i + 1], idx[i + 2]); }
  const out = [];
  for (const tri of groups.values()) {
    if (tri.length < 90) continue;
    const g = geo.clone(); g.setIndex(tri); const q = g.toNonIndexed(); q.computeBoundingBox();
    const b = q.boundingBox, w = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
    q.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2); q.scale(1 / w, 1 / w, 1 / w);
    q.computeBoundingBox(); q.computeBoundingSphere(); q.userData.tall = q.boundingBox.max.y; out.push(q);
  }
  return out.sort((a, b) => b.userData.tall - a.userData.tall);
}

// a world's weather on a thing: its colour darkened, and what lies on what faces up (snow, ash)
function dress(mat, d, key) {
  if (!d) return shade(mat);
  return once('dress:' + key + mat.uuid + JSON.stringify(d), () => {
    const m2 = mat.clone(); if (d.tint) m2.color.multiply(new THREE.Color(d.tint));
    if (d.cap) { const c = new THREE.Color(d.cap[0]);
      m2.onBeforeCompile = s => { s.uniforms.uCap = { value: c }; s.uniforms.uCapK = { value: d.cap[1] };
        s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying float vCap;').replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n{ vec3 cn = objectNormal;\n#ifdef USE_INSTANCING\ncn = mat3(instanceMatrix) * cn;\n#endif\nvCap = normalize(mat3(modelMatrix) * cn).y; }');
        s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vCap; uniform vec3 uCap; uniform float uCapK;').replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uCap, uCapK * smoothstep(.3, .72, vCap));'); };
      m2.customProgramCacheKey = () => 'chess-cap'; }
    return shade(m2);
  });
}

export function makeLand(map, { fx, id }) {
  const { cols, rows } = map, look = { ...HOURS[map.look.hour], ...map.look };
  const group = new THREE.Group(), R = rng(cols * 131 + rows * 17 + map.name.length), dead = { v: false };
  const U = { tMark: { value: null }, uGrid: { value: new THREE.Vector2(cols, rows) }, uTime: { value: 0 }, uWind: { value: new THREE.Vector2(0.8, 0.45).multiplyScalar(look.wind || 1) } };
  const letter = (x, y) => map.tiles[Math.min(rows - 1, Math.max(0, y))][Math.min(cols - 1, Math.max(0, x))];
  const crag = look.crag ? 0.5 : 0.14, TX = look.tex || {}, TN = look.tint || {}, col = (v, d) => (Array.isArray(v) ? new THREE.Color().setRGB(...v) : new THREE.Color(v ?? d));
  // metres to the board's units at this map's scale; a size between two
  const KS = look.scale || 1, m = v => v * METRE * KS, span = r => m(r[0] + R() * (r[1] - r[0])), built = { tree: [], rock: [] };
  setClouds(look.cloud[0], look.cloud[1]);

  // ---- the ground's level and what it is made of, tile by tile, then smoothed between tile centres
  const L = new Float32Array(cols * rows), K = new Float32Array(cols * rows * 4);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const g = letter(x, y), i = y * cols + x;
    const dr = drawOf(g);
    L[i] = highAt(map, x, y) * STEP + (dr.crag ? crag : -(dr.dip || 0));
    K.set(dr.k, i * 4);
  }
  const smp = { h: 0, w: [0, 0, 0, 0], out: 0 };
  function sample(px, pz) {
    const u = px - 0.5, v = pz - 0.5, i = Math.floor(u), j = Math.floor(v), a = sm(0.28, 0.72, u - i), b = sm(0.28, 0.72, v - j);
    const cx = x => Math.min(cols - 1, Math.max(0, x)), cy = y => Math.min(rows - 1, Math.max(0, y));
    const i0 = cy(j) * cols + cx(i), i1 = cy(j) * cols + cx(i + 1), i2 = cy(j + 1) * cols + cx(i), i3 = cy(j + 1) * cols + cx(i + 1);
    const w0 = (1 - a) * (1 - b), w1 = a * (1 - b), w2 = (1 - a) * b, w3 = a * b;
    let h = L[i0] * w0 + L[i1] * w1 + L[i2] * w2 + L[i3] * w3;
    for (let k = 0; k < 4; k++) smp.w[k] = K[i0 * 4 + k] * w0 + K[i1 * 4 + k] * w1 + K[i2 * 4 + k] * w2 + K[i3 * 4 + k] * w3;
    const out = Math.max(0, -px, px - cols, -pz, pz - rows), land = 1 - smp.w[3], n = fbm(px * 0.9 + 3.3, pz * 0.9 + 8.1), e = sm(0, 1, out / B * 1.15);
    h += land * (0.008 + n * 0.045);
    h += land * e * ((fbm(px * 0.42 + 7, pz * 0.42 + 3) - 0.3) * (look.crag ? 0.8 : 0.5) + smp.w[2] * (0.5 + n) * 1.25);
    if (look.walls) {   // the world's walls: high at the two sides, low before each seat
      const side = sm(0.1, 1, Math.max(0, -px, px - cols) / B), end = sm(0, 1, Math.max(0, -pz, pz - rows) / B) * (1 - side), f2 = fbm(px * 0.7 + 1.3, pz * 0.7 + 4.1);
      h += land * look.walls * (side * side * (0.55 + 0.9 * f2) + end * 0.16 * f2); smp.w[2] = Math.max(smp.w[2], sm(0.25, 0.7, side) * land);
    }
    smp.h = h; smp.out = out;
    return smp;
  }
  const yAt = (x, y) => (letter(x, y) === 'b' ? DECK : drawOf(letter(x, y)).stand ? WATER + 0.012 : sample(x + 0.5, y + 0.5).h);

  // ---- the ground
  const nx = (cols + 2 * B) * S, nz = (rows + 2 * B) * S, W = nx + 1, D = nz + 1, H = new Float32Array(W * D);
  const P = new Float32Array(W * D * 3), UV = new Float32Array(W * D * 2), AW = new Float32Array(W * D * 4), idx = [];
  for (let b = 0; b < D; b++) for (let a = 0; a < W; a++) {
    const px = -B + a / S, pz = -B + b / S, s = sample(px, pz), i = b * W + a;
    H[i] = s.h; P.set([px - cols / 2, s.h, pz - rows / 2], i * 3); UV.set([px * 0.36, pz * 0.36], i * 2); AW.set(s.w, i * 4);
    if (a < nx && b < nz) idx.push(i, i + W, i + 1, i + 1, i + W, i + W + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const NR = geo.attributes.normal.array;
  for (let i = 0; i < W * D; i++) { const steep = sm(0.86, 0.6, NR[i * 3 + 1]); AW[i * 4 + 2] = Math.max(AW[i * 4 + 2], steep * (1 - AW[i * 4 + 3])); }
  geo.setAttribute('aW', new THREE.BufferAttribute(AW, 4));
  const markData = new Uint8Array(cols * rows * 4), markTex = new THREE.DataTexture(markData, cols, rows);
  markTex.magFilter = markTex.minFilter = THREE.NearestFilter; markTex.needsUpdate = true; U.tMark.value = markTex;
  const tx = (k, d, srgb = true) => (TX[k] ? tex(TX[k] + (srgb ? '_d' : '_n'), srgb) : d());
  const groundMat = drape(new THREE.MeshStandardMaterial({ map: tx('base', () => tex('grass_d', true)), normalMap: tx('base', () => tex('grass_n'), false), roughness: TN.rough || 0.96, metalness: 0 }), U, 'ground', {
    uniforms: { tDirt: { value: tx('dirt', () => tex('dirt_d', true)) }, tForest: { value: tx('forest', () => tex('forest_d', true)) }, tRock: { value: tx('rock', () => tex('rock_d', true)) }, tBed: { value: tx('bed', () => tex('bed_d', true)) }, tRockN: { value: tx('rock', () => tex('rock_n'), false) }, uTurf: { value: new THREE.Color(look.turf) },
      uTurfK: { value: TX.base ? 0 : 0.78 }, uBase: { value: col(TN.base, 0xffffff) }, uMottle: { value: TN.mottle == null ? new THREE.Color(0.8, 0.88, 0.66) : col(TN.mottle) }, uTA: { value: col(TN.dirt, 0xffffff) }, uTB: { value: TN.forest == null ? new THREE.Color(0.85, 0.85, 0.85) : col(TN.forest) },
      uTC: { value: TN.rock == null ? new THREE.Color(0.6, 0.55, 0.5) : col(TN.rock) }, uTD: { value: TN.bed == null ? new THREE.Color(0.7, 0.7, 0.7) : col(TN.bed) }, uGlow: { value: col(TN.glow ? TN.glow[0] : 0) }, uGlowW: { value: new THREE.Vector4(...(TN.glow ? TN.glow.slice(1) : [0, 0, 0, 0])) } },
    vpars: 'attribute vec4 aW; varying vec4 vW;\n', vmain: '#include <begin_vertex>\nvB = position.xz; vW = aW;',
    fpars: 'uniform sampler2D tDirt, tForest, tRock, tBed, tRockN; uniform vec3 uTurf, uBase, uMottle, uTA, uTB, uTC, uTD, uGlow; uniform vec4 uGlowW; uniform float uTurfK; varying vec4 vW;\n',
    fmap: `vec3 groundGlow = vec3(0.);
    { vec3 c = texture2D(map, vMapUv).rgb;
      c = mix(c * uBase, uTurf * dot(c, vec3(.3, .6, .1)) * 3.2, uTurfK);
      c *= mix(vec3(1.), uMottle, smoothstep(.35, .7, texture2D(tBed, vMapUv * .11).g));
      c = mix(c, texture2D(tDirt, vMapUv).rgb * uTA, vW.x); c = mix(c, texture2D(tForest, vMapUv).rgb * uTB, vW.y);
      c = mix(c, texture2D(tRock, vMapUv * .7).rgb * uTC, vW.z); vec3 bed = texture2D(tBed, vMapUv * 1.3).rgb; c = mix(c, bed * uTD, vW.w);
      diffuseColor.rgb *= c;
      groundGlow = uGlow * (dot(vW.xyz, uGlowW.xyz) * smoothstep(.3, .75, texture2D(tBed, vMapUv * .53).g) + uGlowW.w * vW.w * smoothstep(.75, .2, vW.w) * (1.3 - bed.g * 2.)); }`,
    frag: f => f.replace('totalEmissiveRadiance += markGlow;', 'totalEmissiveRadiance += markGlow + max(groundGlow, 0.);').replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replaceAll('texture2D( normalMap, vNormalMapUv ).xyz', 'mix(texture2D(normalMap, vNormalMapUv).xyz, texture2D(tRockN, vNormalMapUv * .7).xyz, clamp(vW.z + vW.w + vW.x * .5, 0., 1.))'))
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .5, vW.w);'),
  });
  const ground = new THREE.Mesh(geo, groundMat);
  ground.receiveShadow = ground.castShadow = true; ground.raycast = () => {};
  group.add(ground);

  // the cut sides of the block of land, and the board it stands on
  { const sp = [], su = [], si = [], wp = [], wi = [], hw = cols / 2 + B, hd = rows / 2 + B;
    const rim = [];
    for (let a = 0; a <= nx; a++) rim.push([a, 0]); for (let b = 1; b <= nz; b++) rim.push([nx, b]); for (let a = nx - 1; a >= 0; a--) rim.push([a, nz]); for (let b = nz - 1; b >= 1; b--) rim.push([0, b]);
    rim.push(rim[0]);
    let run = 0;
    rim.forEach(([a, b], k) => {
      const h = H[b * W + a], x = -hw + a / S, z = -hd + b / S;
      if (k) run += 1 / S;
      sp.push(x, h, z, x, BASE, z); su.push(run * 0.5, h * 0.5, run * 0.5, BASE * 0.5);
      wp.push(x, Math.max(h, WATER), z, x, h, z);
      if (k) { const o = k * 2; si.push(o - 2, o, o - 1, o - 1, o, o + 1); const p = rim[k - 1], hp = H[p[1] * W + p[0]]; if (h < WATER || hp < WATER) wi.push(o - 2, o, o - 1, o - 1, o, o + 1); }
    });
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(su, 2)); sg.setIndex(si); sg.computeVertexNormals();
    const skirt = new THREE.Mesh(sg, shade(new THREE.MeshStandardMaterial({ map: tx('dirt', () => tex('dirt_d', true)), color: TN.skirt || 0x7a6a5a, roughness: 1, side: THREE.DoubleSide })));
    skirt.receiveShadow = true; skirt.raycast = () => {}; group.add(skirt);
    if (wi.length) { const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); wg.setIndex(wi);
      const wm = new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ color: new THREE.Color(look.water[3]).lerp(new THREE.Color(look.water[2]), 0.5), transparent: !look.sheet, opacity: look.sheet ? 1 : 0.8, side: THREE.DoubleSide })); wm.raycast = () => {}; group.add(wm); }
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + 0.5, 0.1, hd * 2 + 0.5), new THREE.MeshStandardMaterial({ color: 0x2c2018, roughness: 0.7 }));
    plinth.position.y = BASE - 0.02; plinth.receiveShadow = plinth.castShadow = true; plinth.raycast = () => {}; group.add(plinth); }

  let pick;
  // what a pointer hits: one flat patch a tile, at the height a unit would stand
  { const pp = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const h = yAt(x, y) + 0.03, x0 = x - cols / 2, z0 = y - rows / 2; pp.push(x0, h, z0, x0, h, z0 + 1, x0 + 1, h, z0, x0 + 1, h, z0, x0, h, z0 + 1, x0 + 1, h, z0 + 1); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
    pick = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ visible: false }));
    pick.userData.pickFace = f => ({ kind: 'tile', x: (f >> 1) % cols, y: Math.floor((f >> 1) / cols) });
    group.add(pick); }

  // ---- water: one sheet at the river's level, drawn only where the ground is under it
  let river = null, water = null;
  const wet = []; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (drawOf(letter(x, y)).wet) wet.push([x, y]);
  if (wet.length) {
    const dd = new Uint8Array(W * D); for (let i = 0; i < W * D; i++) dd[i] = Math.max(0, Math.min(255, (WATER - H[i]) / 0.5 * 255));
    const tD = new THREE.DataTexture(dd, W, D, THREE.RedFormat); tD.magFilter = tD.minFilter = THREE.LinearFilter; tD.needsUpdate = true;
    const c = i => new THREE.Color(look.water[i]), flow = look.flow || [0.25, 0.1];
    const wu = { tDepth: { value: tD }, tNoise: { value: once('noise', () => tileNoise(128, 8)) }, uSize: { value: new THREE.Vector2(cols + 2 * B, rows + 2 * B) }, uFlow: { value: new THREE.Vector2(flow[0], flow[1]) }, uTime: U.uTime,
      uCam: { value: new THREE.Vector3(0, 8, 8) }, uSun: { value: new THREE.Vector3(...look.dir).normalize() }, uSunC: { value: new THREE.Color(look.sun[0]).multiplyScalar(look.sun[1] * 0.3) },
      uSkyH: { value: c(0) }, uSkyZ: { value: c(1) }, uShallow: { value: c(2) }, uDeep: { value: c(3) }, uFogC: { value: new THREE.Color(look.fog[0]) }, uFogD: { value: 0 }, uGrid: U.uGrid, tMark: U.tMark, uCld: CLOUD.uCld, uCl: CLOUD.uCl, uClC: CLOUD.uClC, uCloud: { value: new THREE.Color(look.sun[0]).lerp(new THREE.Color(0xffffff), 0.6).multiplyScalar(0.3 + 0.6 * Math.min(1, look.sun[1] / 3)) } };
    water = new THREE.Mesh(new THREE.PlaneGeometry(cols + 2 * B, rows + 2 * B).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: wu, transparent: true, depthWrite: false, defines: { SHEET: SHEET[look.sheet] || 0 },
      vertexShader: 'varying vec2 vP; varying float vZ; void main(){ vP = position.xz; vec4 mv = modelViewMatrix * vec4(position, 1.); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: `uniform sampler2D tDepth, tNoise, tMark; uniform vec2 uSize, uFlow, uGrid; uniform float uTime, uFogD; uniform vec3 uCam, uSun, uSunC, uSkyH, uSkyZ, uShallow, uDeep, uFogC, uCloud; varying vec2 vP; varying float vZ;
${CLOUD_GLSL}void main(){
  float depth = texture2D(tDepth, vP / uSize + .5).r * .5;
  if (depth <= .002) discard;
  vec2 fl = uFlow * uTime;
  vec4 a = texture2D(tNoise, vP * .31 - fl * .22), b = texture2D(tNoise, vP * .77 - fl * .37 + .37);
  vec2 g = (a.rg - .5) + (b.rg - .5) * .7;
  vec3 N = normalize(vec3(g.x * .9, 1., g.y * .9)), V = normalize(uCam - vec3(vP.x, ${WATER.toFixed(2)}, vP.y));
  float fres = .03 + .97 * pow(1. - max(dot(N, V), 0.), 4.);
  vec3 Rf = reflect(-V, N), sky = mix(uSkyH, uSkyZ, clamp(Rf.y * 1.4, 0., 1.));
  sky = mix(sky, uCloud, cloudAlong(Rf) * .7); float lit = 1. - uCl.w * cloudOver(vP);
  float k = smoothstep(0., .3, depth);
  vec3 col = mix(mix(uShallow, uDeep, k) * lit, sky, fres) + uSunC * lit * pow(max(dot(Rf, uSun), 0.), 70.);
  float foam = smoothstep(.05, .0, depth - (a.b - .4) * .07) * .5;
  col = mix(col, vec3(.92, .95, .97) * (uSkyH * .5 + .5), clamp(foam, 0., 1.));
  float al = max(max(mix(.3, .93, k), fres), foam) * smoothstep(.002, .02, depth);
  vec2 tc = vP + uGrid * .5;
  if (tc.x > 0. && tc.y > 0. && tc.x < uGrid.x && tc.y < uGrid.y) { vec4 mk = texture2D(tMark, (floor(tc) + .5) / uGrid); col = mix(col, mk.rgb, mk.a * .35); }
  #if SHEET == 1
  { // a frozen river: ice with its cracks and blown snow, black water where it is deep enough to have broken
    vec4 s1 = texture2D(tNoise, vP * .83 + .11), s2 = texture2D(tNoise, vP * .21 + .5);
    float open = smoothstep(.2, .23, depth + (s2.b - .5) * .2 + (s1.b - .5) * .09);
    float crack = (1. - smoothstep(0., .03, abs(s1.b - .5))) * .45 + (1. - smoothstep(0., .014, abs(s2.b - .52))) * .7;
    vec3 Ni = normalize(vec3((s2.r - .5) * .16, 1., (s2.g - .5) * .16)), Ri = reflect(-V, Ni);
    float fi = .05 + .95 * pow(1. - max(dot(Ni, V), 0.), 4.);
    vec3 ice = mix(uShallow, uDeep, smoothstep(.3, .7, s2.b) * .8 + depth * .9);
    ice = mix(ice, vec3(.93, .96, 1.), clamp(crack, 0., 1.) * .75);
    ice = mix(ice, vec3(.95, .97, 1.), max(smoothstep(.52, .7, s1.b * .45 + a.b * .55), smoothstep(.07, .0, depth)));
    vec3 ic = mix(ice * lit * (uSkyH * .45 + .62), mix(uSkyH, uSkyZ, clamp(Ri.y * 1.4, 0., 1.)), fi * .55) + uSunC * lit * pow(max(dot(Ri, uSun), 0.), 26.) * .8;
    if (tc.x > 0. && tc.y > 0. && tc.x < uGrid.x && tc.y < uGrid.y) { vec4 mk = texture2D(tMark, (floor(tc) + .5) / uGrid); vec2 f = fract(tc); float e = min(min(f.x, 1. - f.x), min(f.y, 1. - f.y));
      ic = mix(ic, ic * .55, (1. - smoothstep(.012, .045, e)) * .5); ic = mix(ic, mk.rgb * .85, mk.a * (.34 + .5 * (1. - smoothstep(.03, .17, e)))); }
    ic = mix(ic, vec3(.9, .94, 1.) * lit * (uSkyH * .45 + .62), smoothstep(.0, .5, open) * .8); col = mix(ic, mix(vec3(.012, .02, .035), mix(uSkyH, uSkyZ, clamp(Rf.y * 1.4, 0., 1.)), fres * .45), smoothstep(.5, .7, open)); al = mix(smoothstep(.002, .02, depth), al, open); }
  #elif SHEET == 2
  { // lava: plates of dark crust drifting on the glow, hottest in the seams between them
    float n = a.b * .6 + b.b * .4, crust = smoothstep(.33, .47, n + smoothstep(.12, 0., depth) * .2);
    vec3 hot = mix(vec3(1.7, .3, .03), vec3(2.4, 1.05, .2), smoothstep(.36, .12, n));
    col = mix(hot, vec3(.05, .028, .024) + vec3(.3, .04, .0) * smoothstep(.6, .46, n), crust);
    if (tc.x > 0. && tc.y > 0. && tc.x < uGrid.x && tc.y < uGrid.y) { vec2 f = fract(tc); float e = min(min(f.x, 1. - f.x), min(f.y, 1. - f.y)); col = mix(col, col * .5, (1. - smoothstep(.012, .045, e)) * .45); }
    al = smoothstep(.002, .02, depth); }
  #endif
  gl_FragColor = vec4(col, al);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogC, 1. - exp(-uFogD * uFogD * vZ * vZ));
}` }));
    water.position.y = WATER; water.raycast = () => {}; water.renderOrder = 1; group.add(water);
    const mid = wet.reduce((p, [x, y]) => { p.x += x; p.z += y; return p; }, new THREE.Vector3()).multiplyScalar(1 / wet.length);
    river = new THREE.Vector3(mid.x + 0.5 - cols / 2, 0, mid.z + 0.5 - rows / 2);
  }

  // ---- the bridge: a plank deck on stone piers, rails either side, across each bridge tile
  { const wood = [], stone = [], box = (list, w, h, d, x, y, z, ry = 0, uvs = 1) => { const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(w, d) * uvs, uv.getY(i) * Math.max(h, Math.min(w, d)) * uvs); g.rotateY(ry); g.translate(x, y, z); list.push(g); };
    const wide = Math.min(0.94, m(SIZES.bridge.wide)), rail = m(SIZES.bridge.rail); built.bridge = [wide, rail];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (letter(x, y) === 'b') {
      const sheet = g => g !== 'b' && drawOf(g).wet, along = sheet(letter(x - 1, y)) || sheet(letter(x + 1, y)) ? 0 : Math.PI / 2, cx = x + 0.5 - cols / 2, cz = y + 0.5 - rows / 2, c = Math.cos(along), s = Math.sin(along);
      const at = (u, v) => [cx + u * c + v * s, cz - u * s + v * c];   // u across the bridge, v along it
      if (look.bridge === 'stone') {   // a causeway of slabs on piers, no rail
        for (let p = 0; p < 4; p++) { const [px, pz] = at((p % 2 - 0.5) * 0.03, -0.57 + p * 0.38); box(stone, wide + 0.06 - (p % 2) * 0.05, 0.13, 0.36, px, DECK - 0.068 - (p % 2) * 0.008, pz, along + (p % 2 - 0.5) * 0.05, 0.7); }
        for (const v of [-0.5, 0, 0.5]) { const [px, pz] = at(0, v); box(stone, 0.8, 0.5, 0.2, px, DECK - 0.37, pz, along, 0.7); }
        continue;
      }
      for (let p = 0; p < 9; p++) { const [px, pz] = at(0, -0.68 + p * 0.17); box(wood, wide, 0.05, 0.155, px, DECK - 0.03 + (p % 2) * 0.004, pz, along, 0.9); }
      for (const u of [-0.5, 0.5]) { let [px, pz] = at(u * (wide - 0.08), 0); box(wood, 0.07, 0.09, 1.5, px, DECK - 0.09, pz, along, 0.6);
        [px, pz] = at(u * (wide + 0.05), 0); box(wood, 0.045, 0.045, 1.46, px, DECK + rail, pz, along, 0.6); box(wood, 0.035, 0.035, 1.46, px, DECK + rail * 0.52, pz, along, 0.6);
        for (const v of [-0.7, -0.24, 0.24, 0.7]) { [px, pz] = at(u * (wide + 0.05), v); box(wood, 0.06, rail + 0.1, 0.06, px, DECK + rail / 2 - 0.03, pz, along, 0.6); } }
      for (const v of [-0.62, 0.62]) { const [px, pz] = at(0, v); box(stone, 1.0, 0.56, 0.22, px, DECK - 0.33, pz, along, 0.7); }
      for (const v of [-0.2, 0.2]) for (const u of [-0.36, 0.36]) { const [px, pz] = at(u, v); box(wood, 0.07, 0.5, 0.07, px, DECK - 0.3, pz, along, 0.6); }
    }
    const made = [];
    if (wood.length) made.push(new THREE.Mesh(mergeGeometries(wood), drape(new THREE.MeshStandardMaterial({ map: tex('planks_d', true), normalMap: tex('planks_n'), roughness: 0.85, color: 0xb8a48c }), U, 'deck')));
    if (stone.length) made.push(new THREE.Mesh(mergeGeometries(stone), look.bridge === 'stone' ? drape(new THREE.MeshStandardMaterial({ map: tex('wall_d', true), normalMap: tex('wall_n'), roughness: 0.95, color: 0x6a6260 }), U, 'deck') : shade(new THREE.MeshStandardMaterial({ map: tex('wall_d', true), normalMap: tex('wall_n'), roughness: 0.95 }))));
    for (const m of made) { m.castShadow = m.receiveShadow = true; m.raycast = () => {}; group.add(m); } }

  // ---- grass, reeds and flowers: one blade an instance, bent by the wind in the shader
  const blades = [], heads = [];
  { const step = 0.085, thin = look.blades ?? 1, reedC = look.reed === 0 ? null : look.hour === 'frost' ? [0.62, 0.54, 0.36] : [0.34, 0.36, 0.16], FL = [[1, 0.95, 0.85], [1, 0.82, 0.25], [0.72, 0.55, 0.95], [0.95, 0.5, 0.55]], c0 = new THREE.Color(look.grass[0]), c1 = new THREE.Color(look.grass[1]);
    for (let pz = -B + 0.02; pz < rows + B; pz += step) for (let px = -B + 0.02; px < cols + B; px += step) {
      const x = px + (R() - 0.5) * step, z = pz + (R() - 0.5) * step, s = sample(x, z), w = s.w, inside = s.out === 0, r = R();
      const reed = w[3] > 0.12 && w[3] < 0.62 && s.h > WATER - 0.1;
      if (reed) { if (r > 0.3) continue; if (!reedC) { R(); R(); R(); R(); R(); continue; } blades.push(x - cols / 2, s.h, z - rows / 2, R() * 6.28, span(inside ? SIZES.reed.field : SIZES.reed.bank), R(), reedC[0] + R() * 0.1, reedC[1] + R() * 0.1, reedC[2]); continue; }
      if (thin < 1 && (hash(x * 3.1, z * 2.7) > thin * 2.5 || vnoise(x * 1.7, z * 1.7) > 0.25 + thin)) continue;   // a sparse world: tufts in patches
      if (w[3] > 0.1 || w[2] > 0.45 || r < w[0] * 0.93 || (w[1] > 0.5 && r < 0.55)) continue;
      const tall = inside ? span(SIZES.grass.field) : span(SIZES.grass.meadow) * (0.55 + 0.45 * sm(0, 1, s.out)), m = 0.75 + R() * 0.5, q = R();
      blades.push(x - cols / 2, s.h, z - rows / 2, R() * 6.28, tall, R(), (c0.r + (c1.r - c0.r) * q) * m, (c0.g + (c1.g - c0.g) * q) * m, (c0.b + (c1.b - c0.b) * q) * m);
      if (R() < (inside ? 0.006 : 0.02) && w[1] < 0.5 && (look.hour === 'morning' || look.hour === 'sunset')) { const f = FL[Math.floor(R() * FL.length)], t = tall * 1.5 + 0.05; const o = blades.length - 9; blades[o + 4] = t; heads.push(blades[o], s.h, blades[o + 2], blades[o + 3], t, blades[o + 5], f[0], f[1], f[2]); }
    } }
  const order = Array.from({ length: blades.length / 9 }, (_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const grassMat = drape(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), U, 'grass', {
    vpars: 'attribute vec3 aO; attribute vec3 aP; attribute vec3 aC; uniform float uTime; uniform vec2 uWind; varying vec3 vC;\n',
    vnormal: 'vec3 objectNormal = vec3(0., 1., 0.);',
    vmain: `float cs = cos(aP.x), sn = sin(aP.x), t = clamp(position.y, 0., 1.), wd = .5 + min(aP.y, .45);
      vec3 transformed = vec3((position.x * cs - position.z * sn) * wd, position.y * aP.y, (position.x * sn + position.z * cs) * wd);
      float gu = sin(uTime * 1.7 + aO.x * .9 + aO.z * .7 + aP.z * 6.28) * .45 + sin(uTime * .63 + aO.x * .23 - aO.z * .31) * .8 + .5;
      transformed.xz += (uWind * (.12 + .3 * gu) + vec2(cs, sn) * .18) * aP.y * t * t;
      transformed += aO; vB = aO.xz; vC = aC * (.5 + .7 * t);`,
    fpars: 'varying vec3 vC;\n', fmap: 'diffuseColor.rgb = vC;',
  });
  const tuft = (arr, list, pos, index) => {
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(index);
    const n = list ? list.length : arr.length / 9, o = new Float32Array(n * 3), p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const k = (list ? list[i] : i) * 9; o.set(arr.slice(k, k + 3), i * 3); p.set(arr.slice(k + 3, k + 6), i * 3); c.set(arr.slice(k + 6, k + 9), i * 3); }
    g.setAttribute('aO', new THREE.InstancedBufferAttribute(o, 3)); g.setAttribute('aP', new THREE.InstancedBufferAttribute(p, 3)); g.setAttribute('aC', new THREE.InstancedBufferAttribute(c, 3)); g.instanceCount = n;
    const m = new THREE.Mesh(g, grassMat); m.frustumCulled = false; m.receiveShadow = true; m.raycast = () => {}; group.add(m); return m;
  };
  const grass = tuft(blades, order, [-0.022, 0, 0, 0.022, 0, 0, -0.014, 0.55, 0, 0.014, 0.55, 0, 0, 1, 0], [0, 1, 2, 2, 1, 3, 2, 3, 4]), grassN = order.length;
  const hd = 0.045; if (heads.length) tuft(heads, null, [-hd, 1, 0, hd, 1, 0, 0, 1, -hd, 0, 1, hd, 0, 1.12, 0], [0, 4, 2, 2, 4, 1, 1, 4, 3, 3, 4, 0]);

  // ---- trees, rocks, walls, logs: real models, set out from the map
  const trees = [], spots = [], fires = [], lights = [], fliers = [];
  const kinds = look.trees || (look.wood ? ['oak', 'birch', 'fir', 'birch'] : look.crag ? ['fir'] : ['birch', 'oak']), edgeKinds = look.edgeTrees || kinds;
  const tree = (kind, x, z, key) => { const h = span(SIZES.tree[kind].tall); built.tree.push(h); return { kind, x, z, h, r: h * SIZES.tree[kind].spread / 2, key, fade: 1, want: 1 }; };
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (drawOf(letter(x, y)).grove) {
    const a = R() * 6.28; trees.push(tree(kinds[Math.floor(R() * kinds.length)], x + 0.5 + Math.cos(a) * 0.22, y + 0.5 + Math.sin(a) * 0.22, x + ',' + y));
  }
  { const far = [];   // the trees round the edge: twelve at most, spread all round
    for (let pz = -B + 0.5; pz < rows + B - 0.3; pz += 0.95) for (let px = -B + 0.5; px < cols + B - 0.3; px += 0.95) {
      const x = px + (R() - 0.5) * 0.7, z = pz + (R() - 0.5) * 0.7, s = sample(x, z);
      if (look.edge === 'sides' ? (x > -0.4 && x < cols + 0.4) || s.w[3] > 0.05 || R() > 0.55 : s.out < 0.9 || s.w[3] > 0.05 || s.w[2] > 0.3 || R() > (look.wood ? 0.7 : look.crag ? 0.25 : 0.4)) continue;   // a world's tall things stand at its two sides, before neither seat
      far.push([edgeKinds[Math.floor(R() * edgeKinds.length)], x, z]);
    }
    for (let i = far.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [far[i], far[j]] = [far[j], far[i]]; }
    for (const f of far.slice(0, 12)) trees.push(tree(f[0], f[1], f[2], null)); }
  // a tree that would hide a piece is cut down to its trunk from the top, smoothly (vFade: how much of it still stands)
  const sway = (mat, leaf, top) => {
    mat.onBeforeCompile = s => { Object.assign(s.uniforms, { uTime: U.uTime, uWind: U.uWind, uTop: { value: top }, uSnow: { value: look.snowy || 0 } });
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime, uTop; uniform vec2 uWind; attribute float aFade; varying float vFade, vTall, vSnow;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec3 ip = instanceMatrix[3].xyz; float ph = ip.x * 1.3 + ip.z * 1.7, hh = position.y;
          transformed.xz += uWind * (sin(uTime * 1.1 + ph) * .6 + sin(uTime * .43 + ph * .7) + .6) * .014 * hh * hh;
          ${leaf ? 'transformed += .006 * sin(uTime * 2.6 + position.zxy * 37. + ph) * length(uWind);' : ''} vFade = aFade; vTall = position.y / uTop; vSnow = ${leaf ? '(.25 + .75 * smoothstep(-.2, .7, normal.y)) * smoothstep(.1, .3, vTall)' : 'smoothstep(.2, .8, normal.y)'}; }`)
        .replace('#include <project_vertex>', '#include <project_vertex>\nif (aFade < .02) gl_Position = vec4(2., 2., 2., 1.);');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vFade, vTall, vSnow; uniform float uSnow;')
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vFade < .99 && vTall > .17 + vFade * .95 - .05 * fract(dot(floor(gl_FragCoord.xy), vec2(.7548776662, .56984029)))) discard;')
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(.86, .9, .97), uSnow * vSnow);'); };
    mat.customProgramCacheKey = () => 'chess-tree' + (leaf ? 1 : 0);
    return shade(mat);
  };
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V3 = new THREE.Vector3(), SC = new THREE.Vector3(), treeMeshes = [];
  let detail = 1, arMode = false, eased = 0;
  // in the headset half the trees round the edge stand down, all of them once it has had to drop its shadows (those on forest tiles always stand)
  const setTrees = () => { for (const tm of treeMeshes) for (const im of tm.ims) im.count = arMode ? tm.inside + (eased > 1 ? 0 : Math.ceil((tm.mine.length - tm.inside) / 2)) : tm.mine.length; };
  for (const kind of new Set(trees.map(t => t.kind))) (GROWN[kind] ? Promise.resolve(once('g:' + kind, GROWN[kind])) : model(kind === 'snag' ? 'deadtree' : kind)).then(g => {
    if (dead.v) return;
    let ims = null;
    const mine = trees.filter(t => t.kind === kind).sort((a, b) => (b.key ? 1 : 0) - (a.key ? 1 : 0)), fade = new THREE.InstancedBufferAttribute(new Float32Array(mine.length).fill(1), 1);
    let top = 0, crown = 0;   // the model's own height and its crown's width
    const bare = kind === 'snag', part = o => o.isMesh && !(bare && o.material.alphaTest > 0);   // a burnt tree has no leaves
    g.scene.traverse(o => { if (!part(o)) return; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; top = Math.max(top, b.max.y); if (o.material.alphaTest > 0) crown = Math.max(crown, b.max.x - b.min.x, b.max.z - b.min.z); });
    g.scene.traverse(o => {
      if (!part(o)) return;
      if (!ims) ims = [];
      const leaf = o.material.alphaTest > 0, geo2 = o.geometry.clone(); geo2.setAttribute('aFade', fade);
      const mat2 = o.material.clone(); if (bare) mat2.color.multiplyScalar(0.25);
      const im = new THREE.InstancedMesh(geo2, sway(mat2, leaf, top), mine.length);
      mine.forEach((t, i) => { const y = sample(t.x, t.z).h - 0.02; Q.setFromEuler(E.set(0, hash(t.x, t.z) * 6.28, 0)); const w = bare ? t.h / top : t.r * 2 / (crown || top); im.setMatrixAt(i, M4.compose(V3.set(t.x - cols / 2, y, t.z - rows / 2), Q, SC.set(w, t.h / top, w))); t.i = i; t.y = y; t.lx = t.x - cols / 2; t.lz = t.z - rows / 2; });
      im.castShadow = true; im.receiveShadow = !leaf; im.frustumCulled = false; im.raycast = () => {}; group.add(im); ims.push(im);
    });
    treeMeshes.push({ mine, fade, ims, inside: mine.filter(t => t.key).length }); setTrees();
  }).catch(() => {});

  const rocks = [];   // [x, z (tile space), width, height (0: the stone's own shape), which stone]
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (letter(x, y) === 'r' && !look.rock) {
    const k = SIZES.rock[look.crag ? 'crag' : 'solid'], tall = span(k.tall); built.rock.push(tall);
    rocks.push([x + 0.5 + (R() - 0.5) * 0.06, y + 0.5 + (R() - 0.5) * 0.06, Math.min(0.98, span(k.wide)), tall, Math.floor(R() * 2)]);
    for (let n = 0; n < 3; n++) rocks.push([x + 0.5 + (R() - 0.5) * 0.8, y + 0.5 + (R() - 0.5) * 0.8, span(SIZES.rock.scree), 0, 3 + Math.floor(R() * 5)]);
  }
  for (let n = 0; n < 150; n++) { const x = -B + R() * (cols + 2 * B), z = -B + R() * (rows + 2 * B), s = sample(x, z), bank = s.w[3] > 0.25 && s.w[3] < 0.8;
    if (bank || (s.out > 0.3 && s.w[3] < 0.05 && R() < (look.scree || (look.crag ? 0.6 : 0.2)))) rocks.push([x, z, span(bank ? SIZES.rock.bank : SIZES.rock.boulder), 0, Math.floor(R() * 8)]); }
  const ring = m(SIZES.camp.ring) / 2;
  for (const p of map.props || []) if (p.k === 'camp') for (let n = 0; n < 8; n++) rocks.push([p.x + Math.cos(n * 0.785) * ring, p.y + Math.sin(n * 0.785) * ring, span(SIZES.camp.stone), 0, 3 + n % 4]);
  model('rocks').then(g => {
    if (dead.v) return;
    let src = null; g.scene.traverse(o => { if (o.isMesh) src = o; });
    const parts = once('stones', () => stones(src.geometry)), rockMat = dress(src.material, look.stone, 'rock');
    parts.forEach((pg, pi) => {
      const mine = rocks.filter(r => r[4] % parts.length === pi); if (!mine.length) return;
      const im = new THREE.InstancedMesh(pg, rockMat, mine.length);
      mine.forEach((r, i) => { const s = sample(r[0], r[1]); Q.setFromEuler(E.set(0, hash(r[0], r[1]) * 6.28, 0)); im.setMatrixAt(i, M4.compose(V3.set(r[0] - cols / 2, s.h - r[2] * 0.08 + (r[5] || 0), r[1] - rows / 2), Q, SC.set(r[2], r[3] ? r[3] / pg.userData.tall : r[2], r[2]))); });
      im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.raycast = () => {}; group.add(im);
    });
  }).catch(() => {});

  const capOnly = look.stone && look.stone.cap ? { cap: look.stone.cap } : null;
  const darkWood = dress(new THREE.MeshStandardMaterial({ map: tex('planks_d', true), color: 0x5a4636, roughness: 0.9 }), capOnly, 'wood'), iron = new THREE.MeshStandardMaterial({ color: 0x26262a, metalness: 0.85, roughness: 0.5 });
  const still = m => { m.castShadow = true; m.receiveShadow = true; m.raycast = () => {}; group.add(m); return m; };
  const lamp = (x, y, z, colour, power) => { if (lights.length >= (look.lamps || 2)) return; const l = new THREE.PointLight(colour, power, 9, 1.6); l.position.set(x, y, z); l.userData.base = power; group.add(l); lights.push(l); };
  const fire = (x, y, z, size) => {
    const f = fx.flame(new THREE.Vector3(x, y, z)); f.scale.setScalar(size); spots.push(f);
    const p = new THREE.Vector3(x, y + 0.25, z); fires.push(p);
    lamp(p.x, p.y, p.z, 0xff9a4a, look.fire);
  };
  for (const p of map.props || []) {
    const lx = p.x - cols / 2, lz = p.y - rows / 2, gy = sample(p.x, p.y).h;
    if (p.k === 'wall') model('brokenwall').then(g => { if (dead.v) return; g.scene.traverse(o => { if (!o.isMesh) return; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox, w = still(new THREE.Mesh(o.geometry, dress(o.material, look.stone, 'wall'))); w.scale.set(2 * KS / (b.max.x - b.min.x), m(SIZES.wall.tall) / b.max.y, m(SIZES.wall.thick) / (b.max.z - b.min.z)); w.position.set(lx, gy - 0.03, lz); w.rotation.y = p.r * Math.PI / 2; }); }).catch(() => {});
    else if (p.k === 'log') model('deadtree').then(g => { if (dead.v) return; const h = new THREE.Group(); let top = 1; g.scene.traverse(o => { if (o.isMesh && !(o.material.alphaTest > 0)) { o.geometry.computeBoundingBox(); top = Math.max(top, o.geometry.boundingBox.max.y); const w = new THREE.Mesh(o.geometry, dress(o.material, capOnly, 'log')); w.castShadow = w.receiveShadow = true; w.raycast = () => {}; h.add(w); } });
      const k = m(SIZES.log) / top; h.scale.setScalar(k); h.rotation.set(0, p.r, Math.PI / 2 - 0.06, 'YXZ'); h.position.set(lx, gy + k * 0.45, lz); group.add(h); }).catch(() => {});
    else if (p.k === 'camp') {
      const stick = m(SIZES.camp.stick);
      for (let k = 0; k < 3; k++) { const w = still(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, stick, 7), darkWood)); w.position.set(lx, gy + stick * 0.26, lz); w.rotation.set(1.15, k * 2.1, 0, 'YXZ'); }
      fire(lx, gy + 0.05, lz, m(SIZES.camp.flame) / 0.7);
    } else if (p.k === 'torch') {
      const tall = m(SIZES.torch.tall);
      const post = still(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, tall, 7), darkWood)); post.position.set(lx, gy + tall / 2 - 0.05, lz);
      const cup = still(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.1, 9), iron)); cup.position.set(lx, gy + tall - 0.05, lz);
      fire(lx, gy + tall - 0.03, lz, m(SIZES.torch.flame) / 0.7);
    }
  }

  built.wall = m(SIZES.wall.tall); built.torch = m(SIZES.torch.tall); built.camp = ring * 2;
  // ---- what only the three worlds have: crystal, stalagmites, basalt, small fungus, their props, what falls or rises in their air, steam
  const world = makeWorld({ map, look, group, R, m, span, sample, letter, cols, rows, B, U, fx, tex, dress, still, lamp, rocks, iron, built, capOnly, noise: () => once('noise', () => tileNoise(128, 8)) });
  // ---- air: low mist, fireflies, birds overhead and butterflies over the grass, and the sky (none under the ground)
  const sky = look.sky === false ? null : makeSky(look); if (sky) group.add(sky);
  const mist = [];
  { const n = Math.round(11 * (look.mist || 0)), col = new THREE.Color(look.fog[0]).lerp(new THREE.Color(0xffffff), 0.45);
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fx.tex.smoke_07, color: col, transparent: true, opacity: 0, depthWrite: false })); const w = 4 + R() * 4;
      s.scale.set(w, w * 0.42, 1); s.position.set((R() - 0.5) * (cols + 3), 0.3 + R() * 0.35, (R() - 0.5) * (rows + 3)); s.userData = { o: 0.05 + R() * 0.06, v: 0.1 + R() * 0.12, ph: R() * 6.28 }; s.raycast = () => {}; s.renderOrder = 3; group.add(s); mist.push(s); } }
  let flies = null;
  if (look.fireflies) { const n = 46, p = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) seed.push([(R() - 0.5) * (cols + 3), 0.25 + R() * 1.3, (R() - 0.5) * (rows + 3), R() * 6.28]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    flies = new THREE.Points(g, new THREE.PointsMaterial({ map: fx.tex.circle_05, color: 0xd8ff7a, size: 0.13, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })); flies.userData = { p, seed }; flies.frustumCulled = false; flies.raycast = () => {}; group.add(flies); }
  const flier = (size, color, path) => { const g = new THREE.BufferGeometry(), a = new Float32Array([0, 0, -size * 0.5, 0, 0, size * 0.5, -size, 0, 0, 0, 0, size * 0.5, 0, 0, -size * 0.5, size, 0, 0]); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); m.raycast = () => {}; m.frustumCulled = false; group.add(m); fliers.push({ m, a, size, path, ph: R() * 6.28 }); };
  for (let i = 0; i < (look.birds || 0); i++) { const r = Math.max(cols, rows) * 0.75 + 2 + i * 1.1, h = m(17) + i * 0.9, sp = (0.22 + i * 0.04) * (i % 2 ? -1 : 1); flier(m(SIZES.bird) / 2, 0x1c1c22, (t, ph, o) => { const a = t * sp + ph; o.set(Math.cos(a) * r, h + Math.sin(t * 0.3 + ph) * 0.3, Math.sin(a) * r * 0.8); return 5 + Math.sin(t * 0.2 + ph); }); }
  for (let i = 0; i < (look.butterflies || 0); i++) { const cx = (R() - 0.5) * (cols + 2), cz = (R() - 0.5) * (rows + 2), s = sample(cx + cols / 2, cz + rows / 2); if (s.w[3] > 0.3) continue;
    flier(m(SIZES.butterfly) / 2, [0xf4efe0, 0xffd24a, 0x8fb4ff][i % 3], (t, ph, o) => { o.set(cx + Math.sin(t * 0.37 + ph) * 0.8 + Math.sin(t * 1.3 + ph) * 0.12, s.h + 0.4 + Math.sin(t * 0.9 + ph * 2) * 0.15, cz + Math.cos(t * 0.29 + ph * 1.7) * 0.8); return 7; }); }


  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), cutKeys = new Set(), cutPts = [], aimPt = [0, 0, 0, 0];
  // does the tree's crown stand across the line from the eye to this point
  const hides = (t, cam, px, py, pz) => {
    const dx = px - cam.x, dz = pz - cam.z, l2 = dx * dx + dz * dz; if (l2 < 1e-6) return false;
    const u = Math.min(1, Math.max(0, ((t.lx - cam.x) * dx + (t.lz - cam.z) * dz) / l2)), ox = cam.x + dx * u - t.lx, oz = cam.z + dz * u - t.lz, d2 = ox * ox + oz * oz;
    if (d2 > t.r * t.r) return false;
    const half = Math.sqrt((t.r * t.r - d2) / l2), a = cam.y + (py - cam.y) * Math.max(0, u - half), b = cam.y + (py - cam.y) * Math.min(1, u + half);
    return Math.max(a, b) > t.y + t.h * 0.2 && Math.min(a, b) < t.y + t.h;
  };
  return {
    id, group, pick, look, fires, lights, river, cols, rows, border: B, land: true, sky, sheet: wet.length ? look.sheet || 'water' : null,
    // what was built, in metres at this map's scale: the check's
    sizes() { const k = METRE * KS, mm = a => [Math.min(...a) / k, Math.max(...a) / k]; return { scale: KS, figure: SIZES.figure, tree: built.tree.length ? mm(built.tree) : null, rock: built.rock.length ? mm(built.rock) : null, bridge: built.bridge.map(v => v / k), wall: built.wall / k, torch: built.torch / k, camp: built.camp / k, cloud: CLOUD.uCl.value.w, world: Object.fromEntries(Object.entries(built.world || {}).map(([n, a]) => [n, mm(a)])) }; },
    woods: trees.length ? new THREE.Vector3(trees[0].x - cols / 2, 2, trees[0].z - rows / 2) : null,
    yAt, ground: (x, y) => letter(x, y),
    clear() { markData.fill(0); },
    mark(x, y, kind) { markData.set(MARK[kind], (y * cols + x) * 4); },
    flush() { markTex.needsUpdate = true; },
    // tiles whose trees must not hide what stands there
    cut(keys) { cutKeys.clear(); cutPts.length = 0; for (const k of keys) { if (cutKeys.has(k)) continue; cutKeys.add(k); const [x, y] = k.split(','); cutPts.push(+x + 0.5 - cols / 2, yAt(+x, +y) + 0.7, +y + 0.5 - rows / 2); } },
    // the tile under the pointer (null: none): nothing hides it either
    aim(x, y) { aimPt[3] = x == null ? 0 : 1; if (aimPt[3]) { aimPt[0] = x + 0.5 - cols / 2; aimPt[1] = yAt(x, y) + 0.7; aimPt[2] = y + 0.5 - rows / 2; } },
    setDetail(high, ar, lean) { detail = high ? 1 : 0.4; arMode = ar; eased = lean || 0; if (sky) { sky.visible = !ar; sky.userData.fine(high); } grass.geometry.instanceCount = Math.floor(grassN * detail * (ar ? 0.6 : 1)); for (const s of mist) s.visible = high; lights.forEach((l, i) => { l.visible = i < 2 || !(ar && eased > 1); }); world.setDetail(high, ar, eased); setTrees(); },
    setFog(d) { if (water) water.material.uniforms.uFogD.value = d; },
    stats() { let tris = 0, draws = 0; group.traverse(o => { if (!o.isMesh && !o.isPoints) return; if (o.visible === false || o === pick) return; draws++; const g = o.geometry, n = o.isPoints ? 0 : (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (o.isInstancedMesh ? o.count : g.isInstancedBufferGeometry ? g.instanceCount : 1); }); return { draws, tris: Math.round(tris), trees: trees.length, blades: grass.geometry.instanceCount }; },
    // cam: the viewer's place in the board's own space
    update(dt, now, cam) {
      U.uTime.value = now; driftClouds(dt, U.uWind.value, group.matrixWorld); if (sky) sky.position.copy(cam); world.update(dt, now);
      if (water) water.material.uniforms.uCam.value.copy(cam);
      const dC = Math.hypot(cam.x, cam.z) || 1, vx = -cam.x / dC, vz = -cam.z / dC, steepView = cam.y > dC * 2.2;
      for (const tm of treeMeshes) { let ch = false;
        for (const t of tm.mine) {
          let want = 1;
          if (t.key && cutKeys.has(t.key)) want = 0.14;
          else if (!t.key && !steepView && look.edge !== 'sides') { const px = t.lx - cam.x, pz = t.lz - cam.z, along = px * vx + pz * vz, side = Math.abs(px * vz - pz * vx); if (along > 0 && along < dC && side < Math.max(cols, rows) * 0.5 + 0.5) want = 0.12; }
          if (want === 1) { for (let i = 0; i < cutPts.length; i += 3) if (hides(t, cam, cutPts[i], cutPts[i + 1], cutPts[i + 2])) { want = 0.14; break; }
            if (want === 1 && aimPt[3] && hides(t, cam, aimPt[0], aimPt[1], aimPt[2])) want = 0.14; }
          if (cam.y < t.y + t.h + 1 && Math.hypot(t.lx - cam.x, t.lz - cam.z) < t.r + 1.2) want = 0;   // the eye is in its crown
          if (t.fade !== want) { t.fade += Math.sign(want - t.fade) * Math.min(Math.abs(want - t.fade), dt * 2.5); tm.fade.array[t.i] = t.fade; ch = true; }
        }
        if (ch) tm.fade.needsUpdate = true; }
      for (const s of mist) { s.position.x += s.userData.v * dt * U.uWind.value.x; if (s.position.x > cols / 2 + 3) s.position.x = -cols / 2 - 3; s.material.opacity = s.userData.o * (arMode ? 0.5 : 1) * (0.75 + 0.25 * Math.sin(now * 0.21 + s.userData.ph)); }
      if (flies) { const { p, seed } = flies.userData; for (let i = 0; i < seed.length; i++) { const q = seed[i]; p[i * 3] = q[0] + Math.sin(now * 0.31 + q[3]) * 0.6; p[i * 3 + 1] = q[1] + Math.sin(now * 0.47 + q[3] * 2) * 0.25; p[i * 3 + 2] = q[2] + Math.cos(now * 0.26 + q[3] * 1.3) * 0.6; } flies.geometry.attributes.position.needsUpdate = true; flies.material.opacity = 0.6 + 0.25 * Math.sin(now * 0.8); }
      for (const f of fliers) { const beat = f.path(now, f.ph, P0); f.path(now + 0.05, f.ph, P1); f.m.position.copy(P0); f.m.rotation.y = Math.atan2(P1.x - P0.x, P1.z - P0.z);
        const y = Math.sin(now * beat + f.ph) * f.size * 0.7; f.a[7] = y; f.a[16] = y; f.m.geometry.attributes.position.needsUpdate = true; }
      for (const l of lights) l.intensity = l.userData.base * (0.96 + 0.04 * Math.sin(now * 0.9 + l.position.x));
    },
    dispose() { dead.v = true; setClouds(0, 0); for (const f of spots) { f.userData.dead = true; f.parent && f.parent.remove(f); } group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); markTex.dispose(); group.parent && group.parent.remove(group); },
  };
}
