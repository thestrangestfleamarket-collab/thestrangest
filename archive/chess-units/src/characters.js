// SKIRMISH TABLE's people and creatures (Quaternius and KayKit, CC0; baked by tools/chess-bake.cjs into data/chess/units/): each unit type one thinned mesh on one shared picture, fetched only when a match has that type.
// A piece at rest is not animated at all: every resting piece of every type is drawn in one call, each as its type's standing pose. Only a piece that walks, strikes, is struck or falls has bones, for as long as it does.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// A person plays the clips all people share (anim.glb): its standing and striking ones are named here. A creature (own) carries its own five in its file: Idle, Walk, Attack, Hit, Death.
const HUMAN = { walk: 'Walk_Loop', hit: 'Hit_Chest', death: 'Death01' }, OWN = { idle: 'Idle', walk: 'Walk', attack: 'Attack', hit: 'Hit', death: 'Death', own: true };
const sword = { idle: 'Sword_Idle', attack: 'Sword_Attack', ...HUMAN }, cast = { idle: 'Idle_Loop', attack: 'Spell_Simple_Shoot', ...HUMAN }, shoot = { idle: 'Idle_Loop', attack: 'Pistol_Shoot', ...HUMAN }, fist = { idle: 'Idle_Loop', attack: 'Punch_Cross', ...HUMAN };
const SPEC = {
  bulwark: sword, lancer: sword, strider: fist, slinger: shoot, ember: cast, mender: cast, hexbinder: cast,
  pike: sword, warden: sword, arbalest: shoot, assassin: fist, bard: cast, alchemist: cast, frost: cast, necro: cast, summoner: cast, storm: cast, captain: sword,
  wolf: OWN, ogre: OWN, skeleton: OWN, ghost: OWN, whelp: OWN, golem: OWN,
};
const SCALE = 0.78;   // board units to a metre: a figure, 1.8 m, stands 1.4 tiles high
const TEAM = [0x3fa497, 0xd58a4a], REST = 0.5, MAX = 64;
const models = {}, own = {}, still = {}, asked = {}, loader = new GLTFLoader();
let clips = [], ready = false, lit = null, dim = null, changed = () => {};
export const charactersReady = () => ready;
export const typeReady = t => !!still[t];
export const typesReady = list => ready && list.every(t => still[t] || !SPEC[t]);
export const trisOf = t => (still[t] ? still[t].index.count / 3 : 0);

// The picture and the people's clips first; a type's own file when a match first has it (need).
export async function loadCharacters(renderer, onChange) {
  changed = onChange || changed;
  const jobs = [loader.loadAsync('/chess-assets/units/anim.glb').then(g => { clips = g.animations; })];
  jobs.push(new THREE.TextureLoader().loadAsync('/chess-assets/units/atlas.jpg').then(t => { t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    lit = new THREE.MeshLambertMaterial({ map: t, vertexColors: true, side: THREE.DoubleSide }); dim = lit.clone(); dim.color.setScalar(REST); }));
  await Promise.all(jobs);
  ready = true;
  for (const t in models) if (!still[t]) still[t] = pose(t);
  changed();
}
export function need(types) {
  const jobs = [];
  for (const t of new Set(types)) {
    if (!SPEC[t]) continue;
    asked[t] = asked[t] || loader.loadAsync(`/chess-assets/units/${t}.glb`).then(g => { models[t] = g.scene; own[t] = g.animations; if (ready) { still[t] = pose(t); changed(); } }).catch(e => { delete asked[t]; throw e; });
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
  mesh.bindMode = THREE.DetachedBindMode; mesh.material = lit;
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.8, 0), 2.6);   // wide enough for a strike and a fall
  mesh.scale.setScalar(SCALE); mesh.rotation.y = Math.PI;                      // the models face +Z; units face -Z
  mesh.raycast = () => {};

  const mixer = new THREE.AnimationMixer(root), from = spec.own ? own[type] : clips;
  const act = name => { const c = from.find(a => a.name === name); return c ? mixer.clipAction(c) : null; };
  const idle = act(spec.idle), walk = act(spec.walk);
  if (idle) { idle.timeScale = 0; idle.play(); }   // the standing pose, held still
  let base = idle, current = null, dead = false, fade = 0;
  mixer.addEventListener('finished', e => {
    if (dead || e.action !== current) return;
    current = null; fade = 0.2;
    if (base) base.reset().fadeIn(0.15).play();
    e.action.fadeOut(0.15);
  });
  const settle = () => { mixer.update(0); root.updateMatrixWorld(true); };
  settle();

  return {
    mesh,
    get busy() { return !!current || base === walk || fade > 0; },   // while this is false the piece is drawn as its type's standing pose
    update(dt) { fade = Math.max(0, fade - dt); mixer.update(dt); root.updateMatrixWorld(true); },
    setMoving(moving) {
      const want = moving && walk ? walk : idle;
      if (dead || want === base) return;
      if (base) base.fadeOut(0.15);
      base = want; fade = 0.2;
      if (!current && base) base.reset().fadeIn(0.15).play();
    },
    // name: 'attack', 'hit' or 'death'. Returns false if there is no such animation.
    once(name) {
      if (dead) return false;
      const a = act(spec[name] || name);
      if (!a) return false;
      if (name === 'death') dead = true;
      if (current && current !== a) current.fadeOut(0.08);
      if (base) base.fadeOut(0.08);
      current = a;
      a.reset().setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = dead;
      a.timeScale = name === 'attack' ? 1.3 : 1;
      a.fadeIn(0.08).play();
      return true;
    },
  };
}

// Everything the pieces share: every resting piece's standing pose, whatever its type (one batched draw), every piece's base in its team's colour (one draw), and the soft shade under each (one draw).
export class Crowd {
  constructor(parent) {
    this.group = new THREE.Group(); parent.add(this.group);
    this.types = { rest: { count: 0 } }; this.batch = null; this.geo = {}; this.ids = [];
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
    this.m = new THREE.Matrix4(); this.fig = new THREE.Matrix4().makeRotationY(Math.PI).scale(new THREE.Vector3(SCALE, SCALE, SCALE)); this.c = new THREE.Color();
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
  // list: every piece's group (userData: type, owner, live, rested); a piece that is live (has its bones out) is left out of the standing draw
  sync(list) {
    let n = 0, k = 0; const b = this.stand();
    for (const g of list) {
      const u = g.userData; g.updateMatrix();
      this.bases.setMatrixAt(n, g.matrix); this.bases.setColorAt(n, this.c.setHex(TEAM[u.owner]).multiplyScalar(u.rested ? 0.6 : 1));
      this.shade.setMatrixAt(n, g.matrix); n++;
      if (u.live || !b || !still[u.type]) continue;
      const gid = this.geo[u.type] ?? (this.geo[u.type] = b.addGeometry(still[u.type]));
      let id = this.ids[k]; if (id === undefined) id = this.ids[k] = b.addInstance(gid); else b.setGeometryIdAt(id, gid);
      b.setVisibleAt(id, true); b.setMatrixAt(id, this.m.multiplyMatrices(g.matrix, this.fig)); b.setColorAt(id, this.c.setScalar(u.rested ? REST : 1)); k++;
    }
    this.types.rest.count = k;
    for (; k < this.ids.length; k++) b.setVisibleAt(this.ids[k], false);
    this.bases.count = this.shade.count = n;
    for (const m of [this.bases, this.shade]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  }
  shadows(on) { this.cast = on; this.bases.castShadow = on; if (this.batch) this.batch.castShadow = on; this.shade.material.opacity = on ? 0.28 : 0.5; }
  tint(mesh, rested) { mesh.material = rested ? dim : lit; mesh.castShadow = !!this.cast; }
}
