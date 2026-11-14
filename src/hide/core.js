// DEAD END's ground floor: the renderer, the scene, the physics world (Rapier), the loaders, and the makers every other file builds with
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const Q = new URLSearchParams(location.search), LOW = Q.get('q') === 'low';
const ASSET = 'hide-assets/';
// who meets whom: SOLID blocks bodies and sight, SEE blocks bodies only (wire, rails), VEIL blocks sight only (hung cloth)
const G = { SOLID: 1, SEE: 2, PLAYER: 4, MON: 8, HAND: 16, VEIL: 32 }, ALL = 0xffff;
const grp = (m, f = ALL) => ((m << 16) | f) >>> 0;
const SIGHT = grp(ALL, G.SOLID | G.VEIL);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(1);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070b); const FOGC = new THREE.Color(0x070a10); scene.fog = new THREE.FogExp2(0x0f141a, .07);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .05, 120), rig = new THREE.Group(); rig.add(camera); scene.add(rig);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const CLOCK = { t: 0 };   // the game's own seconds, so a noise's age means the same at any frame rate
const SKYTURN = -.736, MOON = new THREE.Vector3(.82, .44, .36).normalize(), STATICS = [];   // the moon in the turned sky: 31 degrees up, a little right of the alley's line, over the street
const P = { R: RAPIER, world: null, eq: null, anchor: null, things: [], byCol: new Map(), lids: {} };
async function initPhysics() { await RAPIER.init({}); P.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); P.eq = new RAPIER.EventQueue(true); P.anchor = P.world.createRigidBody(RAPIER.RigidBodyDesc.fixed()); }

const TEX = {}, MODELS = {}, texL = new THREE.TextureLoader();
const TEXN = ['beige_wall_001', 'ceiling_interior', 'herringbone_parquet', 'wood_floor_worn', 'floor_tiles_06', 'concrete_floor_02', 'concrete_block_wall', 'oak_veneer_01', 'velour_velvet', 'long_white_tiles', 'dirty_carpet', 'hessian_230', 'dark_brick_wall', 'asphalt_02', 'rusty_metal_02', 'metal_grate_rusty'];
const MODN = ['painted_wooden_chair_01', 'steel_frame_shelves_01', 'wooden_bookshelf_worn', 'drawer_cabinet', 'television_01', 'wooden_broom', 'metal_trash_can', 'trashbag', 'cardboard_box_01', 'sofa_02', 'wooden_crate_02', 'power_box_01', 'ceiling_fan', 'vintage_suitcase', 'armchair_01', 'coffeetable_01', 'classicconsole_01', 'classicnightstand_01', 'gothiccommode_01', 'dining_table', 'dining_chair_02', 'vintage_grandfather_clock_01', 'modern_ceiling_lamp_01', 'desk_lamp_arm_01', 'electric_stove', 'boombox', 'standing_picture_frame_01', 'ornate_mirror_01', 'rubber_duck_toy', 'metal_tool_chest', 'rockingchair_01', 'pull_chain_light_socket', 'vintage_flashlight', 'pale'];
const ARTN = 24, ART = [];
// what shiny things reflect is the alley itself, pictured once from its middle with its own lamps lit
function reflect() { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(scene, 0, .1, 70, { position: new THREE.Vector3(0, 1.6, -11) }).texture; scene.environmentIntensity = .28; pm.dispose(); }
async function loadAssets(onp) {
  let done = 0; const total = TEXN.length * 3 + MODN.length + 1 + ARTN, tick = v => { onp(++done / total); return v; }, L = new GLTFLoader(), aniso = Math.min(2, renderer.capabilities.getMaxAnisotropy());
  const jobs = [];
  for (const n of TEXN) for (const k of 'dna') jobs.push(texL.loadAsync(ASSET + 'tex/' + n + '_' + k + '.jpg').then(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (k === 'd') t.colorSpace = THREE.SRGBColorSpace; (TEX[n] = TEX[n] || {})[k] = t; tick(); }));
  for (let i = 0; i < ARTN; i++) jobs.push(new THREE.ImageLoader().loadAsync(ASSET + 'art/p' + String(i).padStart(2, '0') + '.jpg').then(im => { ART[i] = im; tick(); }));
  for (const n of MODN) jobs.push(L.loadAsync(ASSET + 'm/' + n + '.glb').then(g => { MODELS[n] = g; tick(); }));
  // the sky is a photograph of a real moonlit night (Poly Haven), turned so its moon stands where the moonlight comes from
  jobs.push(texL.loadAsync(ASSET + 'sky.jpg').then(t => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; scene.background = t; scene.backgroundIntensity = .16; scene.backgroundRotation.y = SKYTURN; tick(); }));
  await Promise.all(jobs);
}
// a surface from Poly Haven's three pictures; rep is metres a tile covers
function mat(name, o = {}) {
  const T = TEX[name], m = new THREE.MeshStandardMaterial({ map: T.d, normalMap: LOW ? null : T.n, roughnessMap: T.a, aoMap: T.a, metalness: o.metal ? 1 : 0, metalnessMap: o.metal ? T.a : null, roughness: o.rough ?? 1, color: o.color ?? 0xffffff, side: o.side ?? THREE.FrontSide });
  m.userData.tile = o.tile || 2; if (o.env !== undefined) m.envMapIntensity = o.env; return m;
}
// a box whose pictures keep their real size whatever the box's
function wbox(w, h, d, tile = 2) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, S = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * S[f][0] / tile, uv.getY(k) * S[f][1] / tile); }
  return g;
}
const boxMesh = (w, h, d, m) => { const o = new THREE.Mesh(wbox(w, h, d, m.userData.tile || 2), m); o.castShadow = o.receiveShadow = true; return o; };
const quat = (ry = 0, rx = 0, rz = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));

// something fixed: a box you see and cannot pass
function stat(w, h, d, x, y, z, m, o = {}) {
  const q = quat(o.ry, o.rx, o.rz); let mesh = null;
  if (m) { mesh = boxMesh(w, h, d, m); mesh.position.set(x, y, z); mesh.quaternion.copy(q); if (o.noShadow) mesh.castShadow = false; (o.parent || scene).add(mesh); if (!o.parent && !o.keep) STATICS.push(mesh); }
  if (!o.ghost) { const c = P.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z).setRotation(q).setFriction(.9).setCollisionGroups(grp(o.see ? G.SEE : o.veil ? G.VEIL : G.SOLID, o.veil ? 0x8000 : ALL)));
    P.byCol.set(c.handle, { kind: o.kind || 'stone', fixed: true }); }
  return mesh;
}
// something loose: it has weight, falls, slides, can be carried, and makes its own noise when struck
function dyn(obj, shapes, o) {
  const bd = RAPIER.RigidBodyDesc.dynamic().setTranslation(o.x, o.y, o.z).setRotation(quat(o.ry, o.rx, o.rz)).setLinearDamping(o.ld ?? .25).setAngularDamping(o.ad ?? .6).setCcdEnabled(!!o.ccd);
  if (o.asleep) bd.setSleeping(true);
  const b = P.world.createRigidBody(bd), T = { b, o: obj, kind: o.kind || 'wood', spot: o.spot || null, name: o.name || o.kind, lastHit: 0, joint: null };
  let vol = 0; for (const s of shapes) vol += s.vol;
  for (const s of shapes) { const c = P.world.createCollider(s.desc.setDensity((o.mass || 5) / vol).setFriction(o.fr ?? .8).setRestitution(o.re ?? .05).setCollisionGroups(grp(G.SOLID)).setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold((o.mass || 5) * 14), b); P.byCol.set(c.handle, T); }
  T.mass = b.mass(); T.home = { p: { ...b.translation() }, q: { ...b.rotation() } }; obj.position.copy(b.translation()); obj.quaternion.copy(b.rotation()); scene.add(obj); P.things.push(T); return T;
}
// everything fixed that shares a surface becomes one mesh: a couple of hundred draws become a dozen
function mergeStatics() { const by = new Map(); for (const m of STATICS) { const k = m.material.uuid + (m.castShadow ? 's' : 'n'); if (!by.has(k)) by.set(k, []); by.get(k).push(m); }
  for (const L of by.values()) { if (L.length < 2) continue; const gs = L.map(m => { m.updateMatrixWorld(true); return m.geometry.clone().applyMatrix4(m.matrixWorld); }), g = mergeGeometries(gs, false); if (!g) continue; const o = new THREE.Mesh(g, L[0].material); o.castShadow = L[0].castShadow; o.receiveShadow = true; scene.add(o); for (const m of L) { scene.remove(m); m.geometry.dispose(); } for (const x of gs) x.dispose(); } STATICS.length = 0; }
const sBox = (w, h, d, x = 0, y = 0, z = 0, q) => { const c = RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z); if (q) c.setRotation(q); return { desc: c, vol: w * h * d }; };
const sCyl = (r, h, x = 0, y = 0, z = 0, q) => { const c = RAPIER.ColliderDesc.cylinder(h / 2, r).setTranslation(x, y, z); if (q) c.setRotation(q); return { desc: c, vol: Math.PI * r * r * h }; };
const sBall = (r, x = 0, y = 0, z = 0) => ({ desc: RAPIER.ColliderDesc.ball(r).setTranslation(x, y, z), vol: 4.19 * r * r * r });

// a Poly Haven model stood on the ground at its centre, scaled so its longest side (or its height) is as asked
function model(name, o = {}) {
  const src = MODELS[name].scene.clone(true), bx = new THREE.Box3().setFromObject(src), sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3());
  const k = o.h ? o.h / sz.y : o.long ? o.long / Math.max(sz.x, sz.y, sz.z) : o.k || 1, g = new THREE.Group();
  src.position.set(-c.x, o.mid ? -c.y : -bx.min.y, -c.z); const inner = new THREE.Group(); inner.add(src); inner.scale.setScalar(k); g.add(inner);
  src.traverse(m => { if (m.isMesh) { m.castShadow = !o.noShadow; m.receiveShadow = true; if (o.tint) { m.material = m.material.clone(); m.material.color.multiplyScalar(o.tint); } if (LOW && m.material.normalMap) { m.material = m.material.clone(); m.material.normalMap = null; } } });
  g.userData.size = sz.multiplyScalar(k); return g;
}
const ray = (() => { let r; return (o, d, max, groups = SIGHT, notBody = null) => { r = r || new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }); r.origin.x = o.x; r.origin.y = o.y; r.origin.z = o.z; r.dir.x = d.x; r.dir.y = d.y; r.dir.z = d.z;
  const h = P.world.castRay(r, max, true, undefined, groups, undefined, notBody || undefined); return h ? { t: h.timeOfImpact ?? h.toi, col: h.collider } : null; }; })();

const fuse = gs => mergeGeometries(gs, false);
export { ART, fuse, MOON, mergeStatics, CLOCK, THREE, RAPIER, Q, LOW, ASSET, G, ALL, grp, SIGHT, clamp, lerp, rnd, renderer, scene, camera, rig, P, initPhysics, loadAssets, reflect, TEX, MODELS, mat, wbox, boxMesh, quat, stat, dyn, sBox, sCyl, sBall, model, ray };
