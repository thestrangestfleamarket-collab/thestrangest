// THE GUEST LIST's ground floor: the renderer, the scene, the loaders, the physics world (Rapier, for bodies and thrown things), the plan's grid (where you can walk and see) and the makers every other file builds with
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const Q = new URLSearchParams(location.search), LOW = Q.get('q') === 'low', TEST = Q.has('test');
const ASSET = 'guests-assets/';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
// one seeded dice for the whole night, so a test's night is the same night twice
let seed = (+Q.get('seed') || (Date.now() % 1e9)) >>> 0;
const rand = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rnd = (a = 1, b) => b === undefined ? rand() * a : a + rand() * (b - a), pick = a => a[Math.floor(rand() * a.length)], chance = p => rand() < p;
const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
const angd = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(LOW ? 1 : Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(.7);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070b); scene.fog = new THREE.FogExp2(0x0a0d12, .006);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .06, 400), rig = new THREE.Group(); rig.add(camera); scene.add(rig);
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .16; pm.dispose(); }

// the screen's lens: glow off the lamps, dark corners, grain (a headset draws plain)
let composer = null;
const LENS = { uniforms: { tDiffuse: { value: null }, t: { value: 0 }, dark: { value: 0 }, red: { value: 0 } }, vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float t,dark,red; varying vec2 v; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))+t)*43758.5453); } void main(){ vec2 d=v-.5; float r=dot(d,d); vec3 c=vec3(texture2D(tDiffuse,v+d*r*.004).r,texture2D(tDiffuse,v).g,texture2D(tDiffuse,v-d*r*.004).b); c*=1.-r*(1.05+dark*2.); c+=(h(v*900.)-.5)*.035; c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(1.,.25,.2),red*r*2.2); gl_FragColor=vec4(c*(1.-dark),1.); }' };
let lens = null;
if (!LOW) { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .22, .6, .9)); composer.addPass(new OutputPass()); lens = new ShaderPass(LENS); composer.addPass(lens); }
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); });
const FX = { dark: 0, red: 0 };
function draw(t) { if (composer && !renderer.xr.isPresenting) { lens.uniforms.t.value = t % 10; lens.uniforms.dark.value = FX.dark; lens.uniforms.red.value = FX.red; composer.render(); } else renderer.render(scene, camera); }

const CLOCK = { t: 0, dt: 0 };
const P = { world: null, R: RAPIER };
async function initPhysics() { await RAPIER.init({}); P.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); P.world.timestep = 1 / 60; }
const GRP = { WORLD: 1, BODY: 2, ITEM: 4 }, grp = (m, f) => ((m << 16) | f) >>> 0;
function solid(x0, y0, z0, x1, y1, z1) { return P.world.createCollider(RAPIER.ColliderDesc.cuboid((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2).setTranslation((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2).setFriction(.9).setCollisionGroups(grp(GRP.WORLD, 0xffff))); }

const TEX = {}, MODELS = {}, texL = new THREE.TextureLoader(), gltfL = new GLTFLoader();
async function loadAssets(TEXN, MODN, onp) {
  let done = 0; const total = TEXN.length * 3 + MODN.length, tick = () => onp(++done / total), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy()), jobs = [];
  for (const n of TEXN) for (const k of 'dna') jobs.push(texL.loadAsync(ASSET + 'tex/' + n + '_' + k + '.jpg').then(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (k === 'd') t.colorSpace = THREE.SRGBColorSpace; (TEX[n] = TEX[n] || {})[k] = t; tick(); }));
  for (const n of MODN) jobs.push(gltfL.loadAsync(ASSET + 'm/' + n + '.glb').then(g => { MODELS[n] = norm(g.scene); tick(); }, () => { console.warn('no model', n); tick(); }));
  await Promise.all(jobs);
}
// a model put on its own feet: centred, base on the floor, its real size known
function norm(o) { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), g = new THREE.Group(); o.position.sub(new THREE.Vector3(c.x, b.min.y, c.z)); g.add(o); g.userData.size = b.getSize(new THREE.Vector3());
  o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.material) { m.material.envMapIntensity = 1; if (m.material.map) m.material.map.anisotropy = 4; } } }); return g; }
const MATS = new Map();
// a surface from Poly Haven's three pictures; tile is the metres one picture covers
function mat(name, o = {}) {
  const key = name + JSON.stringify(o); if (MATS.has(key)) return MATS.get(key);
  const T = TEX[name], m = new THREE.MeshStandardMaterial({ map: T.d, normalMap: T.n, roughnessMap: T.a, aoMap: T.a, metalnessMap: o.metal ? T.a : null, metalness: o.metal ?? 0, roughness: o.rough ?? 1, color: o.color ?? 0xffffff, side: o.side ?? THREE.FrontSide });
  if (o.ns) m.normalScale.setScalar(o.ns); m.userData.tile = o.tile || 2; m.shadowSide = THREE.DoubleSide; MATS.set(key, m); return m;
}
const flat = (color, o = {}) => { const key = 'flat' + color + JSON.stringify(o); if (!MATS.has(key)) MATS.set(key, new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? .6, metalness: o.metal ?? 0, emissive: o.glow ?? 0, emissiveIntensity: o.gi ?? 1, transparent: !!o.alpha, opacity: o.alpha ?? 1, side: o.side ?? THREE.FrontSide })); return MATS.get(key); };

// THE BUILDER: every fixed surface is gathered by place and material and welded into one mesh each
const BUILD = { parts: new Map(), groups: new Map() };
function group(place) { let g = BUILD.groups.get(place); if (!g) { g = new THREE.Group(); g.name = place; scene.add(g); BUILD.groups.set(place, g); } return g; }
function gather(place, m, geo, o = {}) { const k = place + '|' + m.uuid + '|' + (o.noShadow ? 1 : 0); let p = BUILD.parts.get(k); if (!p) BUILD.parts.set(k, p = { place, m, geos: [], noShadow: o.noShadow }); if (!geo.attributes.uv1 && geo.attributes.uv) geo.setAttribute('uv1', geo.attributes.uv); p.geos.push(geo.index ? geo.toNonIndexed() : geo); }
// a box whose pictures keep their real size; min corner to max corner
function box(place, m, x0, y0, z0, x1, y1, z1, o = {}) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0, t = m.userData.tile || 2, g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, S = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * S[f][0] / t + (o.u || 0), uv.getY(k) * S[f][1] / t); }
  if (o.ry) g.rotateY(o.ry); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); gather(place, m, g, o);
}
// a flat sheet between four corners (a, b, c, d going round), pictures at their real size along u (a->b) and v (a->d)
function quad(place, m, a, b, c, d, o = {}) {
  const t = m.userData.tile || 2, U = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / t, V = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]) / t, u0 = o.u0 || 0, v0 = o.v0 || 0, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([u0, v0, u0 + U, v0, u0 + U, v0 + V, u0, v0, u0 + U, v0 + V, u0, v0 + V], 2)); g.computeVertexNormals(); gather(place, m, g, o);
}
function weld() { for (const p of BUILD.parts.values()) { const g = mergeGeometries(p.geos, false); g.computeBoundingSphere(); const mesh = new THREE.Mesh(g, p.m); mesh.castShadow = !p.noShadow; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; group(p.place).add(mesh); } BUILD.parts.clear(); }

// THE PLAN'S GRID: 0.2 m cells over the whole estate. solid = cannot be walked through, dark = cannot be seen through
const GR = { x0: -34, z0: -34, c: .2, w: 520, h: 420 }; GR.solid = new Uint8Array(GR.w * GR.h); GR.dark = new Uint8Array(GR.w * GR.h);
const gi = (x, z) => { const i = Math.floor((x - GR.x0) / GR.c), j = Math.floor((z - GR.z0) / GR.c); return i < 0 || j < 0 || i >= GR.w || j >= GR.h ? -1 : j * GR.w + i; };
// mark a turned rectangle (centre, half sizes, turn) as solid and/or dark; v = 1 sets, 0 clears
function mark(cx, cz, hw, hd, ry, o = {}) { const c = Math.cos(ry || 0), s = Math.sin(ry || 0), R = Math.hypot(hw, hd) + GR.c, v = o.clear ? 0 : 1;
  for (let z = cz - R; z <= cz + R; z += GR.c) for (let x = cx - R; x <= cx + R; x += GR.c) { const dx = x - cx, dz = z - cz, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) <= hw + .001 && Math.abs(lz) <= hd + .001) { const k = gi(x, z); if (k < 0) continue; if (o.solid !== false) GR.solid[k] = v; if (o.dark) GR.dark[k] = v; } } }
const blocked = (x, z) => { const k = gi(x, z); return k < 0 || GR.solid[k] === 1; };
// can a body of radius r stand here
function free(x, z, r = .25) { for (let a = 0; a < 8; a++) if (blocked(x + Math.cos(a * .785) * r, z + Math.sin(a * .785) * r)) return false; return !blocked(x, z); }
// slide a circle through the grid: try the whole step, then each axis
function slide(p, dx, dz, r = .25) { const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .08)); dx /= n; dz /= n; for (let i = 0; i < n; i++) { if (free(p.x + dx, p.z + dz, r)) { p.x += dx; p.z += dz; } else if (free(p.x + dx, p.z, r)) p.x += dx; else if (free(p.x, p.z + dz, r)) p.z += dz; } }
// can one point see another over the plan (walls, shut doors and tall furniture stop it)
function sees(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / (GR.c * .7)); for (let i = 1; i < n; i++) { const t = i / n, k = gi(ax + (bx - ax) * t, az + (bz - az) * t); if (k < 0 || GR.dark[k]) return false; } return true; }

// THE WALKERS' MAP: 0.4 m cells, each free only if a body fits; A* over it, then the path pulled straight
const NAV = { c: .4, w: 260, h: 210, ok: null, stamp: 0 };
function bakeNav() { NAV.ok = new Uint8Array(NAV.w * NAV.h); for (let j = 0; j < NAV.h; j++) for (let i = 0; i < NAV.w; i++) NAV.ok[j * NAV.w + i] = free(GR.x0 + (i + .5) * NAV.c, GR.z0 + (j + .5) * NAV.c, .27) ? 1 : 0; NAV.stamp++; }
const ni = (x, z) => { const i = Math.floor((x - GR.x0) / NAV.c), j = Math.floor((z - GR.z0) / NAV.c); return i < 0 || j < 0 || i >= NAV.w || j >= NAV.h ? -1 : j * NAV.w + i; };
function nearFree(x, z) { let k = ni(x, z); if (k >= 0 && NAV.ok[k]) return k; for (let r = 1; r < 12; r++) for (let a = 0; a < r * 8; a++) { const an = a / (r * 8) * 6.283; k = ni(x + Math.cos(an) * r * NAV.c, z + Math.sin(an) * r * NAV.c); if (k >= 0 && NAV.ok[k]) return k; } return -1; }
const walkable = (ax, az, bx, bz) => { const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .2); for (let i = 0; i <= n; i++) { const t = n ? i / n : 0, k = ni(ax + (bx - ax) * t, az + (bz - az) * t); if (k < 0 || !NAV.ok[k]) return false; } return true; };
const gS = new Float32Array(NAV.w * NAV.h), cameFrom = new Int32Array(NAV.w * NAV.h), mk = new Uint32Array(NAV.w * NAV.h), done = new Uint32Array(NAV.w * NAV.h); let mkN = 0;
function path(ax, az, bx, bz) {
  const s = nearFree(ax, az), e = nearFree(bx, bz); if (s < 0 || e < 0) return null; if (s === e) return [{ x: bx, z: bz }];
  mkN++; const W = NAV.w, ex = e % W, ez = (e / W) | 0, heap = [], hs = [], push = (k, f) => { let i = heap.length; heap.push(k); hs.push(f); while (i > 0) { const p = (i - 1) >> 1; if (hs[p] <= f) break; heap[i] = heap[p]; hs[i] = hs[p]; heap[p] = k; hs[p] = f; i = p; } },
    pop = () => { const top = heap[0], k = heap.pop(), f = hs.pop(); if (heap.length) { let i = 0; const n = heap.length; for (;;) { let c = i * 2 + 1; if (c >= n) break; if (c + 1 < n && hs[c + 1] < hs[c]) c++; if (hs[c] >= f) break; heap[i] = heap[c]; hs[i] = hs[c]; i = c; } heap[i] = k; hs[i] = f; } return top; };
  gS[s] = 0; mk[s] = mkN; cameFrom[s] = -1; push(s, 0); let found = false, guard = 0;
  while (heap.length && guard++ < 400000) { const k = pop(); if (k === e) { found = true; break; } if (done[k] === mkN) continue; done[k] = mkN; const x = k % W, z = (k / W) | 0;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dz) continue; const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= W || nz >= NAV.h) continue; const n = nz * W + nx; if (!NAV.ok[n]) continue; if (dx && dz && (!NAV.ok[z * W + nx] || !NAV.ok[nz * W + x])) continue;
      const g = gS[k] + (dx && dz ? 1.414 : 1); if (mk[n] === mkN && g >= gS[n]) continue; gS[n] = g; mk[n] = mkN; cameFrom[n] = k; push(n, g + Math.hypot(nx - ex, nz - ez)); } }
  if (!found) return null; const cells = []; for (let k = e; k >= 0; k = cameFrom[k]) cells.push(k); cells.reverse();
  const pts = cells.map(k => ({ x: GR.x0 + (k % W + .5) * NAV.c, z: GR.z0 + (((k / W) | 0) + .5) * NAV.c })); pts[0] = { x: ax, z: az }; if (walkable(pts[pts.length - 1].x, pts[pts.length - 1].z, bx, bz)) pts.push({ x: bx, z: bz });
  const out = []; let i = 0; while (i < pts.length - 1) { let j = Math.min(pts.length - 1, i + 40); while (j > i + 1 && !walkable(pts[i].x, pts[i].z, pts[j].x, pts[j].z)) j--; out.push(pts[j]); i = j; } return out;
}

// the ground's height by place (the cellar and its stair, the garden's steps); set by the house
const HGT = { ramps: [] };
function height(x, z) { for (const r of HGT.ramps) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) { if (r.y !== undefined) return r.y; const t = r.ax === 'x' ? (x - r.x0) / (r.x1 - r.x0) : (z - r.z0) / (r.z1 - r.z0); return lerp(r.ya, r.yb, clamp(t, 0, 1)); } return 0; }

// THE THINGS YOU CAN USE: each {x, y, z, r, label(), act(who), room}; the nearest one you face is offered
const USE = { all: [], add(u) { u.r = u.r || .9; this.all.push(u); return u; }, drop(u) { const i = this.all.indexOf(u); if (i >= 0) this.all.splice(i, 1); } };
const BUS = { on: {}, hear(k, f) { (this.on[k] = this.on[k] || []).push(f); }, say(k, ...a) { for (const f of this.on[k] || []) f(...a); } };

export { THREE, RAPIER, Q, LOW, TEST, ASSET, clamp, lerp, rand, rnd, pick, chance, dist2, angd, renderer, scene, camera, rig, draw, FX, CLOCK, P, initPhysics, GRP, grp, solid, TEX, MODELS, gltfL, loadAssets, norm, mat, flat, BUILD, group, gather, box, quad, weld,
  GR, gi, mark, blocked, free, slide, sees, NAV, bakeNav, path, walkable, HGT, height, USE, BUS };
