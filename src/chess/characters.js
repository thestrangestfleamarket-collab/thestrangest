// SKIRMISH TABLE's people and creatures (CC0, docs/chess-credits.md; baked by tools/chess-bake.cjs into data/chess/units/): each unit type one thinned mesh on one shared picture, fetched only when a match has that type.
// A piece at rest is not animated at all: every resting piece of every type is drawn in one call, each as its type's standing pose. Only a piece that walks, strikes, is struck or falls has bones, for as long as it does.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// A person, and a creature built on a person's bones, plays the clips all people share (anim.glb, Quaternius' two animation libraries): which it stands in, walks with and strikes with is named here. A creature of its own (OWN) carries its five in its file: Idle, Walk, Attack, Hit, Death.
// rate: how fast its strike is played; pace: how fast its walk is played (its speed over the ground follows, so its feet never slide); run: what it crosses more than two tiles with; glide: it has no legs and drifts at this many tiles a second; sheer: it is seen through (a draw of its own).
const H = (idle, walk, attack, more) => ({ idle, walk, attack, hit: 'Hit_Chest', death: 'Death01', rate: 1.3, pace: 1.5, run: 'Jog_Fwd_Loop', ...more }), OWN = { idle: 'Idle', walk: 'Walk', attack: 'Attack', hit: 'Hit', death: 'Death', own: true, rate: 1.5, pace: 1 };
const RUN = 0.8;   // how fast the run is played
const cast = H('Idle_Loop', 'Walk_Loop', 'Spell_Simple_Shoot'), run = { pace: RUN }, slow = { run: null };
const SPEC = {
  bulwark: H('Idle_Shield_Loop', 'Walk_Loop', 'Sword_Regular_B', { rate: 1 }), lancer: H('Sword_Idle', 'Walk_Loop', 'TreeChopping_Loop'), strider: H('Idle_Loop', 'Jog_Fwd_Loop', 'Punch_Jab', run), slinger: H('Idle_Loop', 'Walk_Loop', 'Pistol_Shoot', { rate: 1 }),
  ember: cast, mender: H('Idle_Loop', 'Walk_Loop', 'Interact', { rate: 1.8 }), hexbinder: cast,
  alchemist: H('Idle_Loop', 'Walk_Loop', 'OverhandThrow', { rate: 1.5 }), necro: cast, captain: H('Sword_Idle', 'Walk_Loop', 'Sword_Attack', { rate: 1.6 }),
  ogre: H('Idle_Loop', 'Walk_Loop', 'TreeChopping_Loop', { ...slow, hit: 'Hit_Head', rate: 1.05, pace: 1.25 }), ghost: H('Zombie_Idle_Loop', 'Zombie_Idle_Loop', 'Zombie_Scratch', { ...slow, rate: 1.6, glide: 1.7, sheer: true }),
  skeleton: H('Sword_Idle', 'Walk_Loop', 'Sword_Attack', { rate: 1.6 }),
  wolf: { ...OWN, pace: 1.3 }, whelp: { ...OWN, rate: 1.8, pace: 1.4 },
};
const SCALE = 0.78;   // board units to a metre: a figure, 1.8 m, stands 1.4 tiles high
const TEAM = [0x3fa497, 0xd58a4a], REST = 0.5, MAX = 64;
const models = {}, own = {}, still = {}, asked = {}, info = {}, loader = new GLTFLoader(), team = TEAM.map(c => new THREE.Color(c));
let clips = [], notes = { speeds: {}, contact: {} }, ready = false, lit = null, live = [], sheer = null, liveSheer = [], changed = () => {};
const SHEER = 0.7;   // how solid a ghost is
export const charactersReady = () => ready;
export const typeReady = t => !!still[t];
export const typesReady = list => ready && list.every(t => still[t] || !SPEC[t]);
export const trisOf = t => (still[t] ? still[t].index.count / 3 : 0);
// what a type measures as it stands at rest on the middle of its tile, in tiles (for the check that every piece keeps to its own square)
export function sizeOf(t) {
  const g = still[t]; if (!g) return null;
  const P = g.attributes.position, C = g.attributes.color, all = [0, 0, 0], body = [0, 0, 0];
  for (let i = 0; i < P.count; i++) { const x = Math.abs(P.getX(i)) * 2 * SCALE, y = P.getY(i) * SCALE, z = Math.abs(P.getZ(i)) * 2 * SCALE, held = Math.abs(C.getW(i) - 0.38) < 0.25;   // the bake marks what is held or carried
    all[0] = Math.max(all[0], x); all[1] = Math.max(all[1], y); all[2] = Math.max(all[2], z); if (!held) { body[0] = Math.max(body[0], x); body[1] = Math.max(body[1], y); body[2] = Math.max(body[2], z); } }
  return { wide: body[0], tall: body[1], deep: body[2], all: { wide: all[0], tall: all[1], deep: all[2] } };   // its body, and with what it holds
}
export const clipsOf = t => { const s = SPEC[t]; return s ? { idle: s.idle, walk: s.walk, run: s.run, attack: s.attack, hit: s.hit, death: s.death, own: !!s.own, have: (s.own ? own[t] || [] : clips).map(c => c.name) } : null; };

// Every figure wears its side's colour: the points the bake marked (their colour's fourth number is low) are drawn in it. A resting piece's side comes with its place in the one draw; a moving piece's with its material.
function sided(m, side) {
  m.onBeforeCompile = sh => { sh.uniforms.uSide = side;
    sh.vertexShader = sh.vertexShader.replace('#include <color_pars_vertex>', '#include <color_pars_vertex>\nuniform vec3 uSide;').replace('#include <color_vertex>',
      'vColor = vec4( 1.0 );\n#ifdef USE_COLOR_ALPHA\n\tfloat own = step( 0.38, color.a );\n#else\n\tfloat own = 1.0;\n#endif\n#if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )\n\tvec3 tone = color.rgb;\n#else\n\tvec3 tone = vec3( 1.0 );\n#endif\n#ifdef USE_BATCHING_COLOR\n\tvec4 bc = getBatchingColor( getIndirectIndex( gl_DrawID ) );\n\tvColor.rgb = mix( bc.rgb, tone * bc.a, own );\n#else\n\tvColor.rgb = mix( uSide, tone, own );\n#endif'); };
  m.customProgramCacheKey = () => 'chess-sided';
  return m;
}

// The picture and the people's clips first; a type's own file when a match first has it (need).
export async function loadCharacters(renderer, onChange) {
  changed = onChange || changed;
  const jobs = [loader.loadAsync('/chess-assets/units/anim.glb').then(g => { clips = g.animations; g.scene.traverse(o => { if (o.userData && o.userData.speeds) notes = o.userData; }); })];
  jobs.push(new THREE.TextureLoader().loadAsync('/chess-assets/units/atlas.jpg').then(t => { t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    lit = sided(new THREE.MeshLambertMaterial({ map: t, vertexColors: true, side: THREE.DoubleSide }), { value: new THREE.Color(1, 1, 1) });
    live = [0, 1, 2, 3].map(i => { const m = sided(lit.clone(), { value: team[i >> 1].clone() }); if (i & 1) m.color.setScalar(REST); return m; });   // [side][rested]
    const thin = m => { m.transparent = true; m.opacity = SHEER; m.forceSinglePass = true; return m; };   // matte and seen through, one pass, its depth kept so it never sorts wrongly against itself
    sheer = thin(sided(lit.clone(), { value: new THREE.Color(1, 1, 1) })); liveSheer = live.map((m, i) => { const c = thin(sided(m.clone(), { value: team[i >> 1].clone() })); return c; }); }));
  await Promise.all(jobs);
  ready = true;
  for (const t in models) if (!still[t]) still[t] = pose(t);
  changed();
}
export function need(types) {
  const jobs = [];
  for (const t of new Set(types)) {
    if (!SPEC[t]) continue;
    asked[t] = asked[t] || loader.loadAsync(`/chess-assets/units/${t}.glb`).then(g => { models[t] = g.scene; own[t] = g.animations; info[t] = { k: 1 }; g.scene.traverse(o => { if (o.userData && o.userData.k) info[t] = o.userData; }); if (ready) { still[t] = pose(t); changed(); } }).catch(e => { delete asked[t]; throw e; });
    jobs.push(asked[t]);
  }
  return Promise.all(jobs);
}

// A unit type's standing pose as plain geometry: its idle clip's first moment, worked out once here instead of on every frame for every piece.
function pose(type) {
  const r = makeCharacter(type, true), m = r.mesh, src = m.geometry, P = src.attributes.position, N = src.attributes.normal, SI = src.attributes.skinIndex, SW = src.attributes.skinWeight;
  m.skeleton.update();
  const B = m.skeleton.boneMatrices, pos = new Float32Array(P.count * 3), nor = new Float32Array(P.count * 3), e = new Float32Array(16), v = new THREE.Vector3(), mat = new THREE.Matrix4();
  for (let i = 0; i < P.count; i++) {
    e.fill(0);
    for (let k = 0; k < 4; k++) { const w = SW.getComponent(i, k), o = SI.getComponent(i, k) * 16; if (w) for (let j = 0; j < 16; j++) e[j] += B[o + j] * w; }
    mat.fromArray(e);
    v.fromBufferAttribute(P, i).applyMatrix4(mat).toArray(pos, i * 3);
    v.fromBufferAttribute(N, i).transformDirection(mat).toArray(nor, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', src.attributes.uv); g.setAttribute('color', src.attributes.color); g.setIndex(src.index);
  return g;
}

// A piece's bones and clips, made when it first has to move. Its bones are kept out of the scene: nothing about it is worked out while it stands.
export function makeCharacter(type, force) {
  const spec = SPEC[type];
  if (!spec || !models[type] || (!force && !still[type])) return null;
  const root = SkeletonUtils.clone(models[type]);
  let mesh = null; root.traverse(o => { if (o.isSkinnedMesh) mesh = o; });
  mesh.removeFromParent();
  mesh.bindMode = THREE.DetachedBindMode; mesh.material = live[0];
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.8, 0), 2.6);   // wide enough for a strike and a fall
  mesh.scale.setScalar(SCALE); mesh.rotation.y = Math.PI;                      // the models face +Z; units face -Z
  mesh.raycast = () => {}; mesh.userData.sheer = !!spec.sheer;

  const mixer = new THREE.AnimationMixer(root), from = spec.own ? own[type] : clips, I = info[type] || { k: 1 };
  const made = new Set(), act = name => { const c = from.find(a => a.name === name), a = c ? mixer.clipAction(c) : null; if (a) made.add(a); return a; };
  const idle = act(spec.idle), walk = act(spec.walk), run = spec.run && spec.run !== spec.walk ? act(spec.run) : null;
  if (idle) { idle.timeScale = 0; idle.play(); }   // the standing pose, held still
  // its walk's own speed over the ground, tiles a second at the clip's own rate: the bake measured how fast its feet go back while they are down
  const stride = spec.glide ? 0 : (spec.own ? I.speed || 1 : (notes.speeds[spec.walk] || 1) * I.k) * SCALE, long = run ? (notes.speeds[spec.run] || 1) * I.k * SCALE : 0, contact = spec.own ? (I.contact || 0.5) : notes.contact[spec.attack] ?? 0.4;
  let base = idle, current = null, dead = false, fade = 0, hurry = 1, moving = false, gait = walk;
  mixer.addEventListener('finished', e => {
    if (dead || e.action !== current) return;
    current = null; fade = 0.22;
    if (base) base.reset().fadeIn(0.18).play();
    e.action.fadeOut(0.18);
  });
  const settle = () => { mixer.update(0); root.updateMatrixWorld(true); };
  settle();

  return {
    mesh,
    get busy() { return !!current || moving || fade > 0; },   // while this is false the piece is drawn as its type's standing pose
    // the way it will cross so many tiles (a walk, or a run for more than two), and how fast that is over the ground, tiles a second
    pick(far) { gait = run && far > 2.2 ? run : walk; return spec.glide || (gait === run ? long * RUN : stride * spec.pace); },
    lead: Math.min(0.95, Math.max(0.15, contact / spec.rate)),   // seconds from the start of its strike to the blow
    // hurry: how much faster than its usual pace this crossing is played (the main loop moves it that much faster too; the feet keep to the ground either way)
    setMoving(on, by = 1) {
      moving = !!on; hurry = by;
      const want = on && gait ? gait : idle;
      if (want !== idle) want.timeScale = (want === run ? RUN : spec.pace) * hurry;
      if (dead || want === base) return;
      if (base) base.fadeOut(0.18);
      base = want; fade = 0.22;
      if (!current && base) base.reset().fadeIn(0.18).play();
    },
    get weight() { let w = 0; for (const a of made) w += a.getEffectiveWeight(); return w; },   // how much of the pose its clips make up (the check holds it at all of it: any less shows the body as modelled, arms out)
    update(dt) { fade = Math.max(0, fade - dt); mixer.update(dt); root.updateMatrixWorld(true); },
    // name: 'attack', 'hit' or 'death'. Returns false if there is no such animation.
    once(name) {
      if (dead) return false;
      const a = act(spec[name] || name);
      if (!a) return false;
      if (name === 'death') dead = true;
      if (current && current !== a) current.fadeOut(0.1);
      if (base) base.fadeOut(0.1);
      current = a;
      a.reset().setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;   // it holds its last moment while the standing pose comes back in: a clip that simply stopped would leave the body, for that blink, as it was modelled, arms out
      a.timeScale = name === 'attack' ? spec.rate : 1;
      a.fadeIn(0.1).play();
      return true;
    },
  };
}

// Everything the pieces share: every resting piece's standing pose, whatever its type (one batched draw), every piece's base in its team's colour (one draw), and the soft shade under each (one draw).
export class Crowd {
  constructor(parent) {
    this.group = new THREE.Group(); parent.add(this.group);
    this.types = { rest: { count: 0 } }; this.batch = null; this.geo = {}; this.ids = []; this.thin = null; this.geo2 = {}; this.ids2 = [];
    const disc = new THREE.CylinderGeometry(0.36, 0.38, 0.06, 20).translate(0, 0.03, 0).toNonIndexed(), nose = new THREE.ConeGeometry(0.11, 0.2, 3).rotateX(-Math.PI / 2).translate(0, 0.06, -0.42).toNonIndexed();   // the nose points the way the unit faces
    const tone = (g, k) => g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(k), 3));
    tone(disc, 0.8); tone(nose, 1);
    const pos = new Float32Array([...disc.attributes.position.array, ...nose.attributes.position.array]), nor = new Float32Array([...disc.attributes.normal.array, ...nose.attributes.normal.array]), col = new Float32Array([...disc.attributes.color.array, ...nose.attributes.color.array]);
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.bases = this.inst(bg, new THREE.MeshLambertMaterial({ vertexColors: true }));
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 8, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    this.shade = this.inst(new THREE.PlaneGeometry(1.36, 1.36).rotateX(-Math.PI / 2).translate(0.07, 0.012, 0.03), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.5, depthWrite: false }));
    this.shade.renderOrder = 2;
    this.m = new THREE.Matrix4(); this.fig = new THREE.Matrix4().makeRotationY(Math.PI).scale(new THREE.Vector3(SCALE, SCALE, SCALE)); this.c = new THREE.Color(); this.v = new THREE.Vector4();
  }
  inst(geo, mat) {
    const m = new THREE.InstancedMesh(geo, mat, MAX);
    m.count = 0; m.frustumCulled = false; m.raycast = () => {}; m.matrixAutoUpdate = false; m.castShadow = !!this.cast && !mat.transparent; m.setColorAt(0, new THREE.Color(1, 1, 1));
    this.group.add(m); return m;
  }
  // the one draw of every standing pose: room for every type's mesh, made when the first type has arrived
  stand() {
    if (this.batch || !lit) return this.batch;
    const b = this.batch = new THREE.BatchedMesh(MAX, 100000, 280000, lit);
    b.frustumCulled = false; b.perObjectFrustumCulled = false; b.sortObjects = false; b.raycast = () => {}; b.matrixAutoUpdate = false; b.castShadow = !!this.cast;
    this.group.add(b); return b;
  }
  // the ghosts' own draw, made when the first ghost stands on the board
  ghosts() {
    if (this.thin || !sheer) return this.thin;
    const b = this.thin = new THREE.BatchedMesh(16, 4000, 12000, sheer);
    b.frustumCulled = false; b.perObjectFrustumCulled = false; b.sortObjects = false; b.raycast = () => {}; b.matrixAutoUpdate = false;
    this.group.add(b); return b;
  }
  // list: every piece's group (userData: type, owner, live, rested); a piece that is live (has its bones out) is left out of the standing draw
  sync(list) {
    let n = 0, k = 0, k2 = 0; const solid = this.stand();
    for (const g of list) {
      const u = g.userData; g.updateMatrix();
      this.bases.setMatrixAt(n, g.matrix); this.bases.setColorAt(n, this.c.setHex(TEAM[u.owner]).multiplyScalar(u.rested ? 0.6 : 1));
      this.shade.setMatrixAt(n, g.matrix); n++;
      if (u.live || !solid || !still[u.type]) continue;
      const thin = SPEC[u.type].sheer, b = thin ? this.ghosts() : solid, geo = thin ? this.geo2 : this.geo, ids = thin ? this.ids2 : this.ids, at = thin ? k2++ : k++;
      const gid = geo[u.type] ?? (geo[u.type] = b.addGeometry(still[u.type]));
      let id = ids[at]; if (id === undefined) id = ids[at] = b.addInstance(gid); else b.setGeometryIdAt(id, gid);
      b.setVisibleAt(id, true); b.setMatrixAt(id, this.m.multiplyMatrices(g.matrix, this.fig)); { const d = u.rested ? REST : 1, c = team[u.owner] || team[0]; b.setColorAt(id, this.v.set(c.r * d, c.g * d, c.b * d, d)); }   // its side's colour for the marked points, and how dim the rest is
    }
    this.types.rest.count = k + k2; if (this.thin) this.thin.visible = k2 > 0;
    for (; k < this.ids.length; k++) solid.setVisibleAt(this.ids[k], false);
    for (; k2 < this.ids2.length; k2++) this.thin.setVisibleAt(this.ids2[k2], false);
    this.bases.count = this.shade.count = n;
    for (const m of [this.bases, this.shade]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  }
  shadows(on) { this.cast = on; this.bases.castShadow = on; if (this.batch) this.batch.castShadow = on; this.shade.material.opacity = on ? 0.28 : 0.5; }
  tint(mesh, rested, owner = 0) { mesh.material = (mesh.userData.sheer ? liveSheer : live)[(owner ? 2 : 0) + (rested ? 1 : 0)]; mesh.castShadow = !!this.cast && !mesh.userData.sheer; }
}
