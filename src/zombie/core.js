// EYES DOWN's ground floor: the renderer, the scene, the physics world (Rapier), the loaders, and the makers every other file builds with
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const Q = new URLSearchParams(location.search), LOW = Q.get('q') === 'low';
const ASSET = 'zombie-assets/';
const G = { SOLID: 1, PLAYER: 4, MON: 8, HAND: 16 }, ALL = 0xffff;
const grp = (m, f = ALL) => ((m << 16) | f) >>> 0;
const SIGHT = grp(ALL, G.SOLID);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .85;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(.6);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0d0c10);
scene.fog = new THREE.FogExp2(0x1a1719, .0016);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .05, 5000), rig = new THREE.Group(); rig.add(camera); scene.add(rig);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const CLOCK = { t: 0 };
const STATICS = [];
const P = { world: null, things: [], byCol: new Map() };
async function initPhysics() { await RAPIER.init({}); P.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); }

const TEX = {}, MODELS = {}, texL = new THREE.TextureLoader();
const TEXN = ['herringbone_parquet', 'plastered_wall_04', 'dark_paneled_wood', 'long_white_tiles', 'fabric_pattern_05', 'poly_wool_herringbone', 'rusty_painted_metal', 'interior_tiles', 'painted_plaster_wall', 'brown_leather', 'concrete_wall_006'];
const MODN = ['television_02', 'vintage_microwave', 'electric_stove', 'sofa_02', 'mid_century_lounge_chair', 'boombox', 'desk_lamp_arm_01', 'old_bed_frame', 'classicnightstand_01', 'alarm_clock_01', 'wall_clock', 'modern_ceiling_lamp_01', 'throw_pillows_01', 'potted_plant_02',
  'round_wooden_table_01', 'dining_chair_02', 'pot_enamel_01', 'jug_01', 'long_life_food', 'book_encyclopedia_set_01', 'ornate_mirror_01', 'hanging_picture_frame_02', 'modern_wooden_cabinet', 'food_apple_01', 'wooden_bowl_01', 'ottoman_01', 'cassette_player', 'vintage_electric_kettle', 'painted_wooden_cabinet'];
async function loadAssets(onp) {
  let done = 0; const total = TEXN.length * 3 + MODN.length, tick = () => onp(++done / total), L = new GLTFLoader(), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy()), jobs = [];
  for (const n of TEXN) for (const k of 'dna') jobs.push(texL.loadAsync(ASSET + 'tex/' + n + '_' + k + '.jpg').then(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (k === 'd') t.colorSpace = THREE.SRGBColorSpace; (TEX[n] = TEX[n] || {})[k] = t; tick(); }));
  for (const n of MODN) jobs.push(L.loadAsync(ASSET + 'm/' + n + '.glb').then(g => { MODELS[n] = g; tick(); }));
  await Promise.all(jobs);
}
// a surface from Poly Haven's three pictures; tile is the metres one picture covers
function mat(name, o = {}) {
  const T = TEX[name], m = new THREE.MeshStandardMaterial({ map: T.d, normalMap: LOW ? null : T.n, roughnessMap: T.a, aoMap: T.a, metalness: o.metal ?? 0, roughness: o.rough ?? 1, color: o.color ?? 0xffffff, side: o.side ?? THREE.FrontSide });
  if (o.ns) m.normalScale.setScalar(o.ns); m.userData.tile = o.tile || 2; if (o.env !== undefined) m.envMapIntensity = o.env; return m;
}
// a box whose pictures keep their real size whatever the box's
function wbox(w, h, d, tile = 2) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, S = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * S[f][0] / tile, uv.getY(k) * S[f][1] / tile); }
  g.setAttribute('uv1', g.attributes.uv); return g;
}
const quat = (ry = 0, rx = 0, rz = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));
// something fixed: a box you see and cannot pass (min corner x0,y0,z0 to max x1,y1,z1)
function stat(x0, y0, z0, x1, y1, z1, m, o = {}) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0, x = (x0 + x1) / 2, y = (y0 + y1) / 2, z = (z0 + z1) / 2; let mesh = null;
  if (m) { mesh = new THREE.Mesh(wbox(w, h, d, m.userData.tile || 2), m); mesh.position.set(x, y, z); mesh.castShadow = !o.noShadow; mesh.receiveShadow = true; (o.parent || scene).add(mesh); if (!o.parent && !o.keep) STATICS.push(mesh); }
  if (!o.ghost) { const c = P.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z).setFriction(.8).setCollisionGroups(grp(G.SOLID))); P.byCol.set(c.handle, { kind: o.kind || 'wood', fixed: true }); }
  return mesh;
}
// a collider only, turned (for furniture models)
function block(w, h, d, x, y, z, ry = 0, kind = 'wood') { const c = P.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z).setRotation(quat(ry)).setFriction(.8).setCollisionGroups(grp(G.SOLID))); P.byCol.set(c.handle, { kind, fixed: true }); return c; }
// something loose: it has weight, falls, slides, can be carried, and makes its own sound when struck
function dyn(obj, shapes, o) {
  const b = P.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(o.x, o.y, o.z).setRotation(quat(o.ry, o.rx, o.rz)).setLinearDamping(.3).setAngularDamping(.6).setCcdEnabled(true));
  const T = { b, o: obj, kind: o.kind || 'wood', name: o.name || o.kind, lastHit: 0, home: null }; let vol = 0; for (const s of shapes) vol += s.vol;
  for (const s of shapes) { const c = P.world.createCollider(s.desc.setDensity((o.mass || 1) / vol).setFriction(o.fr ?? .7).setRestitution(o.re ?? .1).setCollisionGroups(grp(G.SOLID)).setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold((o.mass || 1) * 12), b); P.byCol.set(c.handle, T); }
  T.mass = b.mass(); T.home = { p: { ...b.translation() }, q: { ...b.rotation() } }; obj.position.copy(b.translation()); obj.quaternion.copy(b.rotation()); scene.add(obj); P.things.push(T); return T;
}
const sBox = (w, h, d, x = 0, y = 0, z = 0) => ({ desc: RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z), vol: w * h * d });
const sCyl = (r, h, x = 0, y = 0, z = 0) => ({ desc: RAPIER.ColliderDesc.cylinder(h / 2, r).setTranslation(x, y, z), vol: Math.PI * r * r * h });
const sBall = (r, x = 0, y = 0, z = 0) => ({ desc: RAPIER.ColliderDesc.ball(r).setTranslation(x, y, z), vol: 4.19 * r * r * r });
// everything fixed that shares a surface becomes one mesh
function mergeStatics() { const by = new Map(); for (const m of STATICS) { const k = m.material.uuid + (m.castShadow ? 's' : 'n'); if (!by.has(k)) by.set(k, []); by.get(k).push(m); }
  for (const L of by.values()) { if (L.length < 2) continue; const g = mergeGeometries(L.map(m => { m.updateMatrixWorld(true); return m.geometry.clone().applyMatrix4(m.matrixWorld); }), false); if (!g) continue;
    const o = new THREE.Mesh(g, L[0].material); o.castShadow = L[0].castShadow; o.receiveShadow = true; scene.add(o); for (const m of L) { scene.remove(m); m.geometry.dispose(); } } STATICS.length = 0; }
// a Poly Haven model stood on the floor at its centre, scaled so its height (or longest side) is as asked
function model(name, o = {}) {
  const src = MODELS[name].scene.clone(true), bx = new THREE.Box3().setFromObject(src), sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3());
  const k = o.h ? o.h / sz.y : o.long ? o.long / Math.max(sz.x, sz.y, sz.z) : o.w ? o.w / sz.x : o.k || 1, g = new THREE.Group(), inner = new THREE.Group();
  src.position.set(-c.x, o.mid ? -c.y : -bx.min.y, -c.z); inner.add(src); inner.scale.setScalar(k); g.add(inner);
  src.traverse(m => { if (m.isMesh) { m.castShadow = !o.noShadow; m.receiveShadow = true; if (LOW && m.material.normalMap) { m.material = m.material.clone(); m.material.normalMap = null; } } });
  g.userData.size = sz.multiplyScalar(k); return g;
}
function place(g, x, y, z, ry = 0, parent = scene) { g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; }
const ray = (() => { let r; return (o, d, max, groups = SIGHT, notBody) => { r = r || new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }); r.origin.x = o.x; r.origin.y = o.y; r.origin.z = o.z; r.dir.x = d.x; r.dir.y = d.y; r.dir.z = d.z;
  const h = P.world.castRay(r, max, true, undefined, groups, undefined, notBody || undefined); return h ? { t: h.timeOfImpact ?? h.toi, col: h.collider } : null; }; })();
// can a straight line from a to b pass without hitting anything solid
const _d = new THREE.Vector3();
function clear(a, b, slack = .05) { _d.subVectors(b, a); const L = _d.length(); if (L < .01) return true; _d.divideScalar(L); const h = ray(a, _d, L); return !h || h.t > L - slack; }

export { THREE, RAPIER, Q, LOW, ASSET, G, ALL, grp, SIGHT, clamp, lerp, rnd, pick, renderer, scene, camera, rig, CLOCK, P, initPhysics, TEX, MODELS, loadAssets, mat, wbox, quat, stat, block, dyn, sBox, sCyl, sBall, mergeStatics, model, place, ray, clear };
