// Animated 3D characters built from Quaternius CC0 packs: Modular Character Outfits - Fantasy (bodies),
// Universal Base Characters (heads, hair) and Universal Animation Library (animations).
// Weapons are simple meshes made here. Each unit type picks a body, head, hair, tint, gear and attack clip.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { METRE } from './scale.js';
import { shade } from './clouds.js';

const SPEC = {
  bulwark:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_Buzzed'], hairColor: 0x2a2018, tint: 0x8f98a8, metal: 0.55, idle: 'Sword_Idle', attack: 'Sword_Attack', gear: ['sword', 'shield'] },
  lancer:    { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x8a3a1a, tint: 0xb0705a, idle: 'Sword_Idle', attack: 'Sword_Attack', gear: ['greataxe'] },
  strider:   { body: 'Female_Ranger', head: 'Female_Head', tint: 0x4c5060, idle: 'Idle_Loop', attack: 'Punch_Cross', gear: ['dagger'] },
  slinger:   { body: 'Male_Ranger', head: 'Male_Head', idle: 'Idle_Loop', attack: 'Pistol_Shoot', gear: ['crossbow'] },
  ember:     { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Long', 'Hair_Beard'], hairColor: 0xb8b4ac, tint: 0xc04a36, idle: 'Idle_Loop', attack: 'Spell_Simple_Shoot', gear: ['staff'] },
  mender:    { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Long'], hairColor: 0xc8a25a, tint: 0xf2efe6, idle: 'Idle_Loop', attack: 'Spell_Simple_Shoot', gear: [] },
  hexbinder: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x1c1a22, tint: 0x7d55c0, idle: 'Idle_Loop', attack: 'Spell_Simple_Shoot', gear: ['wand'] },
};
const SCALE = METRE; // the models are made 1.8 m tall
const models = {};
let clips = [];
let ready = false;

export function loadCharacters() {
  const loader = new GLTFLoader();
  const files = new Set();
  for (const s of Object.values(SPEC)) { files.add(s.body); files.add(s.head); (s.hair || []).forEach(h => files.add(h)); }
  const jobs = [...files].map(f => loader.loadAsync(`/chess-assets/characters/${f}.glb`).then(g => { models[f] = g; }));
  jobs.push(loader.loadAsync('/chess-assets/characters/animations.glb').then(g => { clips = g.animations; }));
  return Promise.all(jobs).then(() => { ready = true; });
}

// ---- weapons (grip at the origin, pointing along +Y; the holder rotates them into the hand)
const steel = new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 0.95, roughness: 0.25 });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.8 });
const leather = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.9 });
const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.raycast = () => {}; return m; };

function makeGear(kind) {
  const g = new THREE.Group();
  if (kind === 'sword' || kind === 'dagger') {
    const len = kind === 'sword' ? 0.85 : 0.3;
    const blade = part(new THREE.BoxGeometry(0.055, len, 0.012), steel, 0, 0.1 + len / 2, 0);
    const tip = part(new THREE.ConeGeometry(0.03, 0.08, 4), steel, 0, 0.1 + len + 0.04, 0);
    tip.scale.z = 0.25;
    g.add(blade, tip, part(new THREE.BoxGeometry(0.2, 0.03, 0.04), steel, 0, 0.09, 0), part(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), leather, 0, 0, 0));
  } else if (kind === 'greataxe') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), darkWood, 0, 0.45, 0));
    const head = part(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 20, 1, false, 0, Math.PI), steel, 0, 1.05, 0);
    head.rotation.x = Math.PI / 2;
    g.add(head, part(new THREE.ConeGeometry(0.03, 0.16, 6), steel, 0, 1.28, 0));
  } else if (kind === 'staff') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 8), darkWood, 0, 0.45, 0));
    g.add(part(new THREE.SphereGeometry(0.075, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffa23a, emissive: 0xff5a1f, emissiveIntensity: 1.6 }), 0, 1.36, 0));
  } else if (kind === 'wand') {
    g.add(part(new THREE.CylinderGeometry(0.008, 0.016, 0.42, 6), darkWood, 0, 0.15, 0));
    g.add(part(new THREE.OctahedronGeometry(0.04), new THREE.MeshStandardMaterial({ color: 0xc08bff, emissive: 0x7a3fd0, emissiveIntensity: 1.4 }), 0, 0.39, 0));
  } else if (kind === 'crossbow') {
    g.add(part(new THREE.BoxGeometry(0.05, 0.6, 0.05), darkWood, 0, 0.2, 0));
    const bow = part(new THREE.TorusGeometry(0.3, 0.014, 6, 14, Math.PI * 0.7), steel, 0, 0.18, 0);
    bow.rotation.z = Math.PI * 0.15;
    g.add(bow);
  } else if (kind === 'shield') {
    const disc = part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 24), new THREE.MeshStandardMaterial({ color: 0x5a6f8c, metalness: 0.6, roughness: 0.4 }), 0, 0, 0);
    const boss = part(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.015, 0);
    g.add(disc, boss, part(new THREE.TorusGeometry(0.34, 0.016, 6, 24), steel, 0, 0, 0).rotateX(Math.PI / 2));
  }
  return g;
}

// How each item sits on its bone: [bone, position, rotation (Euler XYZ)].
const HOLD = {
  sword: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  dagger: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  greataxe: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  staff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  wand: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  crossbow: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]],
  shield: ['lowerarm_l', [0, 0.14, -0.07], [Math.PI / 2, 0, 0]],
};

// A body comes as many skinned pieces (arms, legs, belts...). Pieces that share a material are joined into one,
// so a unit is one or two draws and one skeleton instead of up to ten. Made once per body and set of hidden pieces.
const bodies = {};
function bodyOf(spec) {
  const key = spec.body + '|' + (spec.hide || []).join(',');
  if (bodies[key]) return bodies[key];
  const scene = SkeletonUtils.clone(models[spec.body].scene);
  scene.updateMatrixWorld(true);
  const groups = new Map(), drop = [];
  scene.traverse(o => {
    if (!o.isSkinnedMesh) return;
    if ((spec.hide || []).some(h => o.name.includes(h))) { drop.push(o); return; }
    if (!groups.has(o.material)) groups.set(o.material, []);
    groups.get(o.material).push(o);
  });
  const inv = new THREE.Matrix4();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const first = list[0];
    inv.copy(first.matrixWorld).invert();
    const names = Object.keys(first.geometry.attributes).filter(n => list.every(m => m.geometry.attributes[n]));
    const parts = list.map(m => {
      const g = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
      for (const n of Object.keys(g.attributes)) if (!names.includes(n)) g.deleteAttribute(n);
      return g;
    });
    const merged = mergeGeometries(parts);
    if (!merged) continue; // pieces that cannot be joined stay as they are
    first.geometry = merged;
    drop.push(...list.slice(1));
  }
  for (const o of drop) o.removeFromParent();
  return (bodies[key] = scene);
}

// Hair textures are greyscale, so each character tints them with its own hair colour.
function staticClone(name, hairColor) {
  const o = models[name].scene.clone(true);
  o.traverse(m => {
    if (!m.isMesh) return;
    m.castShadow = true; m.raycast = () => {};
    if (m.material.name.includes('Hair')) { m.material = m.material.clone(); m.material.color.setHex(hairColor); }
    shade(m.material);
  });
  return o;
}

// Returns null until the models have loaded (the caller then draws a simple stand-in).
export function makeCharacter(type) {
  const spec = SPEC[type];
  if (!ready || !spec) return null;
  const object = new THREE.Group();
  const body = SkeletonUtils.clone(bodyOf(spec));
  object.add(body);
  const mats = new Map();
  body.traverse(o => {
    if (!o.isMesh) return;
    if ((spec.hide || []).some(h => o.name.includes(h))) o.visible = false;
    if (!mats.has(o.material)) { // own copy per unit so tinting/dimming one unit doesn't affect the rest
      const m = o.material.clone();
      if (!m.name.includes('Regular')) { // clothing, not skin
        if (spec.tint) m.color.multiply(new THREE.Color(spec.tint));
        if (spec.metal) { m.metalness = spec.metal; m.roughness = 0.45; m.metalnessMap = null; }
      }
      mats.set(o.material, shade(m));
    }
    o.material = mats.get(o.material);
    o.castShadow = true;
    o.frustumCulled = false; // animated poses leave the rest-pose bounds
    o.raycast = () => {};
  });
  // Head, hair and gear are rigid pieces: place them in the rest pose, then hand them to a bone.
  object.updateMatrixWorld(true);
  const bone = name => body.getObjectByName(name);
  for (const name of [spec.head, ...(spec.hair || [])]) {
    const piece = staticClone(name, spec.hairColor || 0x3a2a1c);
    object.add(piece);
    piece.updateMatrixWorld(true);
    const head = bone('Head');
    if (head) head.attach(piece);
  }
  for (const kind of spec.gear || []) {
    const [boneName, pos, rot] = HOLD[kind];
    const b = bone(boneName);
    if (!b) continue;
    const item = makeGear(kind);
    item.position.set(...pos);
    item.rotation.set(...rot);
    b.add(item);
  }
  object.scale.setScalar(SCALE);
  object.rotation.y = Math.PI; // models face +Z; units face -Z

  const mixer = new THREE.AnimationMixer(body);
  const act = name => { const c = clips.find(a => a.name === name); return c ? mixer.clipAction(c) : null; };
  const idle = act(spec.idle), walk = act('Walk_Loop');
  if (idle) { idle.play(); idle.time = Math.random() * 2; }
  let base = idle, current = null, dead = false;
  mixer.addEventListener('finished', e => {
    if (dead || e.action !== current) return;
    current = null;
    if (base) base.reset().fadeIn(0.15).play();
    e.action.fadeOut(0.15);
  });

  return {
    object,
    update: dt => mixer.update(dt),
    setMoving(moving) {
      const want = moving && walk ? walk : idle;
      if (dead || want === base) return;
      if (base) base.fadeOut(0.15);
      base = want;
      if (!current && base) base.reset().fadeIn(0.15).play();
    },
    // name: 'attack', 'hit', 'death', or a clip name. Returns false if there is no such animation.
    once(name) {
      if (dead) return false;
      const a = act({ attack: spec.attack, hit: 'Hit_Chest', death: 'Death01' }[name] || name);
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
