// SKIRMISH TABLE's bake, the part that runs in a browser (tools/chess-bake.cjs): each unit type as one thinned skinned mesh on one shared picture, and the clips it plays
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';

// Quaternius CC0: Modular Character Outfits - Fantasy (bodies), Universal Base Characters (heads, hair). Weapons, shields, hats, capes and the like are simple shapes made here.
// Three creatures are built on the people's own body and bones, so they stand and move as the people do (BUILD below): the Ogre (a person made big and heavy), the Ghost (a hooded robe with no legs), the Skeleton (bones, each carried by one bone).
// Two are whole CC0 models with their own bones and clips (CRE): Quaternius' Wolf and the dragon after Cethiel's.
const SPEC = {
  bulwark:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_Buzzed'], hairColor: 0x2a2018, tint: 0x8f98a8, gear: ['sword', 'shield'] },
  lancer:    { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x8a3a1a, tint: 0xb0705a, gear: ['greataxe'] },
  strider:   { body: 'Female_Ranger', head: 'Female_Head', tint: 0x4c5060, gear: ['dagger'] },
  slinger:   { body: 'Male_Ranger', head: 'Male_Head', gear: ['crossbow'] },
  ember:     { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Long', 'Hair_Beard'], hairColor: 0xb8b4ac, tint: 0xc04a36, gear: ['staff'] },
  mender:    { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Long'], hairColor: 0xc8a25a, tint: 0xf2efe6, gear: [] },
  hexbinder: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x1c1a22, tint: 0x7d55c0, gear: ['wand'] },
  alchemist: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x6a3a1c, tint: 0x4fa06a, gear: ['flask', 'bandolier', 'pack'] },
  necro:     { body: 'Male_Ranger', hide: ['Pauldron'], head: 'Male_Head', hair: ['Hair_Beard'], hairColor: 0x18161a, tint: 0x3d2c52, gear: ['skullstaff', 'purplecape'] },
  captain:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x4a3018, tint: 0xa83232, gear: ['sword', 'banner', 'plume', 'goldcape'] },
  // the creatures on the people's bones. k: how much larger than a person; aim: which way what it holds points as it stands in that clip (the figure's left, up, its front); skin: its skin's colour; wear: false for none of the people's own collar and belt; only: the parts of the body kept; build: its own pieces (BUILD); shape: its points moved
  ogre:      { body: 'Male_Peasant', head: 'Male_Head', hair: [], tint: 0x8a6c50, skin: 0xa9b884, k: 1.3, gear: ['club'], aim: ['Idle_Loop', [0.1, 1, 0.12]], build: 'ogre', shape: 'heavy', wear: ['belt'] },
  ghost:     { body: 'Male_Ranger', only: ['Ranger_Body', 'Ranger_Arms', 'Head_Hood'], hide: ['Belt', 'Bracer'], tint: 0xdfe6e6, skin: 0xcfd8d8, cloth: true, gear: [], build: 'ghost', wear: ['collar'], fade: true },
  skeleton:  { body: 'Male_Peasant', only: [], tint: 0xffffff, gear: ['rustsword'], build: 'skeleton', wear: [] },
};
// A creature of its own: its file(s), how long it is made (metres), how far it is thinned, the surface it is painted with, its tail's bones turned so it is no longer than its square (the wolf's carried low, the dragon's curled round), stride: its walk's leg swings made that many times wider (the dragon's own walk barely leaves the spot), where its collar sits, and the clips kept under the names the page plays.
const CRE = {
  wolf:  { file: 'Wolf.gltf', long: 1.16, tris: 2000, lay: 'fur', tail: [['Tail1', [1, 0, 0], -1.05]], collar: ['Neck2', 0.3, 0.07, [0, -0.02, 0], 1.25], clips: { Idle: ['Idle'], Walk: ['Gallop'], Attack: ['Attack'], Hit: ['Idle_HitReact1'], Death: ['Death'] } },
  whelp: { file: 'whelp/dragon.dae', long: 1.12, tris: 2000, pic: 'whelp/dragon.jpg', gain: 1.9, tail: [['tail1', [0, 1, 0], 0.85], ['tail2', [0, 1, 0], 0.95], ['tail3', [0, 1, 0], 0.8]], collar: ['neck2', 0.075, 0.018, [0, 0, 0], 0.5], stride: [/^leg_/, 3], clips: { Idle: 'whelp/dragon_idle.dae', Walk: 'whelp/dragon_walk.dae', Attack: 'whelp/dragon_attack.dae', Death: 'whelp/dragon_die.dae' }, flinch: ['neck1', 'neck2', 'back1'] },
};
const TRIS = { body: 1570, head: 380, hair: 200 };   // what each part of a figure is thinned to (its collar and belt, 128 triangles, came out of its body's share)
const FIRST = new Set(['bulwark', 'lancer', 'strider', 'slinger', 'ember', 'mender', 'hexbinder']), LATER = 1370;   // the later people carry more gear: their bodies are thinned a little further, so no team of them costs more to draw than the first seven did
const CLIPS = ['Sword_Idle', 'Idle_Loop', 'Idle_Shield_Loop', 'Zombie_Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sword_Attack', 'Sword_Regular_B', 'TreeChopping_Loop', 'Punch_Jab',
  'Pistol_Shoot', 'Spell_Simple_Shoot', 'Interact', 'OverhandThrow', 'Zombie_Scratch', 'Hit_Chest', 'Hit_Head', 'Death01'];
const WALKS = ['Walk_Loop', 'Jog_Fwd_Loop'], STRIKES = ['Sword_Attack', 'Sword_Regular_B', 'TreeChopping_Loop', 'Punch_Jab', 'Pistol_Shoot', 'Spell_Simple_Shoot', 'Interact', 'OverhandThrow', 'Zombie_Scratch'], FPS = 15;
// the one picture every figure is drawn from: [x, y, size] of each material's own picture in it; the lower half is the creatures' surfaces
const W = 1024, H = 1024, CELL = { MI_Peasant: [0, 0, 256], MI_Ranger: [256, 0, 256], MI_Superhero_Male: [512, 0, 256], MI_Superhero_Female: [768, 0, 256], MI_Hair_1: [0, 256, 256], MI_Hair_2: [256, 256, 256],
  MI_Regular_Male: [512, 256, 128], MI_Regular_Female: [640, 256, 128], MI_Eyes: [512, 384, 128], white: [640, 384, 128],
  stone: [0, 512, 256], bone: [256, 512, 256], hide: [512, 512, 256], cloth: [768, 512, 256], fur: [0, 768, 256], dragon: [256, 768, 256] };
// a surface (Poly Haven, data/full/chess/creatures/tex/): how bright it is made, how deep its relief is painted in, how much of its colour is taken out
const SURF = { stone: [0.6, 1.1, 0.75], bone: [0.86, 1.1, 0.2], hide: [0.7, 0.9, 0], cloth: [0.82, 1, 0.5], fur: [0.78, 1.2, 0.85] };

const CAPE = { goldcape: 0xd9b24a, purplecape: 0x6a35a0 };
const mat = (color, glow = 0) => ({ color: new THREE.Color(color).multiplyScalar(1 + glow) });
const TEAM = { color: new THREE.Color(1, 1, 1), trim: true };   // drawn in its side's colour by the page (the point colour's fourth number is 0)
const steel = mat(0xcfd4dc), darkWood = mat(0x4a3324), leather = mat(0x3a2a20);
const part = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial()); o.userData.flat = m.color; o.userData.trim = !!m.trim; o.userData.lay = m.lay ? m : null; o.position.set(x, y, z); return o; };
function makeGear(kind) {   // grip at the origin, pointing along +Y
  const g = new THREE.Group();
  if (kind === 'sword' || kind === 'dagger') {
    const len = kind === 'sword' ? 0.85 : 0.3, tip = part(new THREE.ConeGeometry(0.03, 0.08, 4), steel, 0, 0.1 + len + 0.04, 0);
    tip.scale.z = 0.25;
    g.add(part(new THREE.BoxGeometry(0.055, len, 0.012), steel, 0, 0.1 + len / 2, 0), tip, part(new THREE.BoxGeometry(0.2, 0.03, 0.04), steel, 0, 0.09, 0), part(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), leather, 0, 0, 0));
  } else if (kind === 'greataxe') {
    const head = part(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 12, 1, false, 0, Math.PI), steel, 0, 1.05, 0);
    head.rotation.x = Math.PI / 2;
    g.add(part(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), darkWood, 0, 0.45, 0), head, part(new THREE.ConeGeometry(0.03, 0.16, 6), steel, 0, 1.28, 0));
  } else if (kind === 'staff') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 6), darkWood, 0, 0.45, 0), part(new THREE.SphereGeometry(0.075, 10, 7), mat(0xffa23a, 0.25), 0, 1.36, 0));
  } else if (kind === 'wand') {
    g.add(part(new THREE.CylinderGeometry(0.008, 0.016, 0.42, 6), darkWood, 0, 0.15, 0), part(new THREE.OctahedronGeometry(0.04), mat(0xc08bff, 0.2), 0, 0.39, 0));
  } else if (kind === 'crossbow') {
    const bow = part(new THREE.TorusGeometry(0.3, 0.014, 5, 10, Math.PI * 0.7), steel, 0, 0.18, 0);
    bow.rotation.z = Math.PI * 0.15;
    g.add(part(new THREE.BoxGeometry(0.05, 0.6, 0.05), darkWood, 0, 0.2, 0), bow);
  } else if (kind === 'shield') {
    g.add(part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 16), TEAM, 0, 0, 0), part(new THREE.SphereGeometry(0.09, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.015, 0),
      part(new THREE.TorusGeometry(0.34, 0.016, 5, 16), steel, 0, 0, 0).rotateX(Math.PI / 2));
  } else if (kind === 'flask') {
    g.add(part(new THREE.SphereGeometry(0.09, 9, 7), mat(0x58e06a, 0.2), 0, 0.15, 0), part(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 6), mat(0xcfe8d8), 0, 0.26, 0), part(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 6), darkWood, 0, 0.32, 0));
  } else if (kind === 'skullstaff') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 6), mat(0x1c1820), 0, 0.45, 0), part(new THREE.SphereGeometry(0.1, 9, 7), mat(0xe8e2d0), 0, 1.42, 0), part(new THREE.BoxGeometry(0.11, 0.07, 0.1), mat(0xe8e2d0), 0, 1.32, 0.02),
      part(new THREE.BoxGeometry(0.36, 0.03, 0.03), mat(0x1c1820), 0, 1.22, 0), part(new THREE.SphereGeometry(0.028, 6, 4), mat(0x2bd46a, 0.25), 0.04, 1.44, 0.085), part(new THREE.SphereGeometry(0.028, 6, 4), mat(0x2bd46a, 0.25), -0.04, 1.44, 0.085));
  } else if (kind === 'plume') {   // from here on: things worn, set in the standing figure's own space (WORN)
    g.add(part(new THREE.SphereGeometry(0.135, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd9b24a), 0, 0, 0), part(new THREE.BoxGeometry(0.035, 0.16, 0.3), mat(0xd83a2a), 0, 0.17, -0.02));
  } else if (CAPE[kind]) {
    g.add(part(new THREE.BoxGeometry(0.58, 1.0, 0.025), mat(CAPE[kind]), 0, -0.5, 0));
  } else if (kind === 'pack') {
    g.add(part(new THREE.BoxGeometry(0.34, 0.4, 0.16), leather, 0, 0, 0), part(new THREE.CylinderGeometry(0.05, 0.06, 0.26, 7), mat(0x58e06a, 0.2), -0.09, 0.3, 0), part(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 7), mat(0xff8a3a, 0.2), 0.09, 0.33, 0),
      part(new THREE.SphereGeometry(0.06, 7, 5), mat(0x58e06a, 0.2), -0.09, 0.45, 0), part(new THREE.SphereGeometry(0.06, 7, 5), mat(0xff8a3a, 0.2), 0.09, 0.51, 0));
  } else if (kind === 'banner') {
    g.add(part(new THREE.CylinderGeometry(0.014, 0.014, 1.8, 6), darkWood, 0, 0.5, 0), part(new THREE.BoxGeometry(0.5, 0.4, 0.014), TEAM, 0.26, 1.18, 0), part(new THREE.BoxGeometry(0.5, 0.09, 0.02), mat(0xd9b24a), 0.26, 1.18, 0), part(new THREE.ConeGeometry(0.03, 0.1, 4), mat(0xd9b24a), 0, 1.45, 0));
  } else if (kind === 'bandolier') {
    const strap = part(new THREE.BoxGeometry(0.46, 0.045, 0.02), leather, 0, 0, 0);
    g.add(strap, part(new THREE.SphereGeometry(0.052, 7, 5), mat(0xff8a3a, 0.2), -0.13, -0.02, 0.04), part(new THREE.SphereGeometry(0.052, 7, 5), mat(0x58e06a, 0.2), 0, -0.02, 0.05), part(new THREE.SphereGeometry(0.052, 7, 5), mat(0xb070ff, 0.2), 0.13, -0.02, 0.04));
  } else if (kind === 'club') {
    g.add(part(new THREE.CylinderGeometry(0.05, 0.026, 0.95, 7), darkWood, 0, 0.36, 0), rock(V(0, 0.84, 0), 0.115, 0.13, 0.115, { color: new THREE.Color(0xd8d2c6), lay: 'stone', metres: 0.5, facet: true }, 91, 1, new THREE.Quaternion()), part(new THREE.CylinderGeometry(0.058, 0.058, 0.04, 7), steel, 0, 0.68, 0));
  } else if (kind === 'rustsword') {
    const rust = mat(0x8f6e54);
    g.add(part(new THREE.BoxGeometry(0.05, 0.7, 0.012), rust, 0, 0.45, 0), part(new THREE.BoxGeometry(0.18, 0.03, 0.035), rust, 0, 0.09, 0), part(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), leather, 0, 0, 0));
  }
  return g;
}
// How each item sits on its bone: [bone, position, rotation (Euler XYZ)].
const HOLD = { sword: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], dagger: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], greataxe: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], staff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  wand: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], crossbow: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]], shield: ['lowerarm_l', [0, 0.14, -0.07], [Math.PI / 2, 0, 0]],
  flask: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], skullstaff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]] , club: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], rustsword: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]] };
// Things worn: [the bone that carries it, where it sits from that bone as the figure stands at rest (the figure's left, up, its front), its turn]. 'top' is the crown of the head.
const WORN = { plume: ['Head', 'top', [0, -0.07, 0.01], [0, 0, 0]],
  goldcape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]], purplecape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]],
  pack: ['spine_03', 'bone', [0, -0.08, -0.22], [0, 0, 0]], banner: ['spine_03', 'bone', [-0.1, 0, -0.2], [0, 0, 0]],
  bandolier: ['spine_02', 'bone', [0, 0.1, 0.16], [0, 0, 0.35]] };


const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const hash = (x, y, z, s = 0) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 13.37) * 43758.5453; return h - Math.floor(h); };
// the built creatures' pieces: a bar from a to b, a ball, a boulder (a faceted lump, squared off, every point pushed in or out a little)
function bar(a, b, r0, r1, m, sides = 6) { const d = b.clone().sub(a), len = d.length(), o = part(new THREE.CylinderGeometry(r1, r0, len, sides, 1), m, 0, 0, 0); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; }
function ball(at, rx, ry, rz, m, w = 8, h = 6) { const o = part(new THREE.SphereGeometry(1, w, h), m, at.x, at.y, at.z); o.scale.set(rx, ry, rz); return o; }
function rock(at, rx, ry, rz, m, seed, detail = 1, q) {
  const g = new THREE.IcosahedronGeometry(1, detail), P = g.attributes.position, v = V();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const k = 0.84 + 0.3 * hash(Math.round(v.x * 50), Math.round(v.y * 50), Math.round(v.z * 50), seed);
    v.set(Math.sign(v.x) * Math.abs(v.x) ** 0.7, Math.sign(v.y) * Math.abs(v.y) ** 0.7, Math.sign(v.z) * Math.abs(v.z) ** 0.7).multiplyScalar(k); P.setXYZ(i, v.x, v.y, v.z); }
  const o = part(g, m, at.x, at.y, at.z); o.scale.set(rx, ry, rz); if (q) o.quaternion.copy(q); else o.rotation.set(hash(seed, 1, 2) * 0.5 - 0.25, hash(seed, 3, 4) * 0.8, hash(seed, 5, 6) * 0.5 - 0.25); return o;
}
const along = (a, b, r, m, seed, grow = 1) => { const d = b.clone().sub(a), len = d.length(); return rock(a.clone().addScaledVector(d, 0.5), r, len / 2 * grow, r, m, seed, 1, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); };
const ring = (at, r, tube, m, axis, squash = 1, sides = 12) => { const o = part(new THREE.TorusGeometry(r, tube, 4, sides), m, at.x, at.y, at.z); o.quaternion.setFromUnitVectors(V(0, 0, 1), axis.clone().normalize()); o.scale.set(1, squash, 1); return o; };

// What each built creature is made of, on the people's bones: P(bone) is where that bone is as the figure stands; each piece is [what, the bone that carries it].
const BUILD = {
  skeleton(P) {
    const B = { color: new THREE.Color(0xf4ead2), lay: 'bone', metres: 0.45 }, D = mat(0x14100c), RAG = { color: new THREE.Color(0x6a5644), lay: 'cloth', metres: 0.6 }, out = [], add = (o, bone) => out.push([o, bone]);
    for (const [s, sx] of [['l', 1], ['r', -1]]) {
      const sh = P('upperarm_' + s), el = P('lowerarm_' + s), ha = P('hand_' + s), th = P('thigh_' + s), kn = P('calf_' + s), an = P('foot_' + s), bl = P('ball_' + s), toe = P('ball_leaf_' + s), fore = ha.clone().sub(el).normalize(), off = V(0, 0, 0.014);
      add(bar(P('clavicle_' + s), sh, 0.016, 0.014, B, 5), 'clavicle_' + s);
      add(bar(sh, el, 0.024, 0.02, B), 'upperarm_' + s); add(ball(sh, 0.04, 0.04, 0.04, B, 6, 4), 'upperarm_' + s);
      add(bar(el.clone().add(off), ha.clone().add(off), 0.015, 0.012, B, 5), 'lowerarm_' + s); add(bar(el.clone().sub(off), ha.clone().sub(off), 0.013, 0.011, B, 5), 'lowerarm_' + s); add(ball(el, 0.032, 0.032, 0.032, B, 6, 4), 'lowerarm_' + s);
      add(bar(ha, ha.clone().addScaledVector(fore, 0.12), 0.032, 0.02, B, 4), 'hand_' + s);
      add(bar(th, kn, 0.03, 0.026, B), 'thigh_' + s); add(ball(th, 0.046, 0.046, 0.046, B, 6, 4), 'thigh_' + s);
      add(bar(kn, an, 0.025, 0.018, B), 'calf_' + s); add(bar(kn.clone().add(V(sx * 0.024, 0, -0.012)), an.clone().add(V(sx * 0.02, 0, -0.012)), 0.011, 0.009, B, 4), 'calf_' + s); add(ball(kn, 0.044, 0.044, 0.044, B, 6, 4), 'calf_' + s);
      add(ball(an, 0.034, 0.034, 0.034, B, 6, 4), 'foot_' + s); add(bar(an, bl, 0.03, 0.026, B, 5), 'foot_' + s); add(bar(bl, toe, 0.028, 0.014, B, 5), 'ball_' + s);
      const sc = ball(V(sx * 0.085, P('spine_03').y + 0.1, P('spine_03').z - 0.085), 0.055, 0.075, 0.012, B, 6, 4); sc.rotation.y = -sx * 0.3; add(sc, 'spine_03');   // shoulder blade
      const hip = ball(V(sx * 0.078, P('pelvis').y + 0.035, P('pelvis').z - 0.005), 0.078, 0.088, 0.034, B, 8, 5); hip.rotation.y = sx * 0.55; add(hip, 'pelvis');
    }
    const chain = ['pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head'];
    for (let i = 0; i < chain.length - 1; i++) { const a = P(chain[i]), b = P(chain[i + 1]), n = Math.max(1, Math.round(a.distanceTo(b) / 0.048));
      for (let j = 0; j < n; j++) { const c = a.clone().lerp(b, (j + 0.5) / n); add(part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), B, c.x, c.y, c.z - (i < 3 ? 0.035 : 0.01)), chain[i]); } }
    const lo = P('spine_01').y + 0.07, hi = P('neck_01').y - 0.06, cz = P('spine_02').z + 0.012, R = [0.1, 0.128, 0.145, 0.15, 0.14, 0.112];
    R.forEach((r, i) => { const y = lo + (hi - lo) * i / (R.length - 1), o = part(new THREE.TorusGeometry(r, 0.0115, 4, 12), B, 0, y, cz); o.rotation.x = Math.PI / 2 + 0.2; o.scale.set(1, 0.74, 1); add(o, y < P('spine_03').y ? 'spine_02' : 'spine_03'); });
    add(part(new THREE.BoxGeometry(0.036, (hi - lo) * 0.62, 0.014), B, 0, lo + (hi - lo) * 0.66, cz + 0.108), 'spine_03');
    add(part(new THREE.BoxGeometry(0.075, 0.085, 0.04), B, 0, P('pelvis').y, P('pelvis').z - 0.045), 'pelvis');
    const hd = P('Head'), c = V(0, hd.y + 0.118, hd.z + 0.012);
    add(ball(c, 0.088, 0.097, 0.104, B, 10, 7), 'Head');
    const jaw = part(new THREE.BoxGeometry(0.1, 0.07, 0.085), B, 0, c.y - 0.09, c.z + 0.04); add(jaw, 'Head');
    add(part(new THREE.BoxGeometry(0.115, 0.03, 0.05), B, 0, c.y - 0.045, c.z + 0.062), 'Head');   // cheekbones
    for (const sx of [-1, 1]) add(ball(V(sx * 0.036, c.y - 0.012, c.z + 0.083), 0.027, 0.029, 0.024, D, 6, 4), 'Head');
    add(part(new THREE.ConeGeometry(0.016, 0.034, 3), D, 0, c.y - 0.05, c.z + 0.094), 'Head');
    add(part(new THREE.BoxGeometry(0.078, 0.011, 0.012), D, 0, c.y - 0.086, c.z + 0.08), 'Head');
    add(part(new THREE.BoxGeometry(0.21, 0.27, 0.016), RAG, 0, P('pelvis').y - 0.13, P('pelvis').z + 0.075), 'pelvis'); add(part(new THREE.BoxGeometry(0.21, 0.23, 0.016), RAG, 0, P('pelvis').y - 0.11, P('pelvis').z - 0.085), 'pelvis');
    const nk = P('neck_01'); add(ring(V(0, nk.y - 0.005, nk.z), 0.062, 0.03, TEAM, V(0, 1, 0.1), 1, 10), 'spine_03');   // a torn scarf in its side's colour
    add(part(new THREE.BoxGeometry(0.07, 0.24, 0.014), TEAM, 0.03, nk.y - 0.14, nk.z + 0.1), 'spine_03');
    return out;
  },
  ogre(P) {
    const HIDE = { color: new THREE.Color(0x8a6a4c), lay: 'hide', metres: 0.8 }, FUR = { color: new THREE.Color(0x7a6450), lay: 'fur', metres: 0.7 }, TUSK = mat(0xe8dfc4), out = [], add = (o, bone) => out.push([o, bone]);
    const hd = P('Head'), s3 = P('spine_03'), hp = P('pelvis');
    for (const sx of [-1, 1]) { const t = part(new THREE.ConeGeometry(0.014, 0.06, 5), TUSK, sx * 0.034, hd.y + 0.062, hd.z + 0.098); t.rotation.x = -0.25; add(t, 'Head'); }
    const mantle = ball(V(0, s3.y + 0.185, s3.z - 0.035), 0.27, 0.075, 0.17, FUR, 10, 5); add(mantle, 'spine_03');
    add(part(new THREE.BoxGeometry(0.3, 0.3, 0.02), HIDE, 0, hp.y - 0.12, hp.z + 0.14), 'pelvis'); add(part(new THREE.BoxGeometry(0.3, 0.28, 0.02), HIDE, 0, hp.y - 0.12, hp.z - 0.13), 'pelvis');
    for (const s of ['l', 'r']) { const el = P('lowerarm_' + s), ha = P('hand_' + s); add(ring(el.clone().lerp(ha, 0.55), 0.052, 0.02, TEAM, ha.clone().sub(el), 1, 10), 'lowerarm_' + s); }
    return out;
  },
  ghost(P) {
    const CLOTH = { color: new THREE.Color(0xdfe6e6), lay: 'cloth', metres: 1.3 }, D = mat(0x080b10), GLINT = mat(0xbfe9f2), out = [], add = (o, bone) => out.push([o, bone]);
    const hp = P('pelvis'), hd = P('Head'), top = hp.y + 0.1, low = 0.1, g = new THREE.CylinderGeometry(0.19, 0.27, top - low, 16, 5, true), A = g.attributes.position;
    for (let i = 0; i < A.count; i++) if (A.getY(i) < -(top - low) / 2 + 0.01) { const k = hash(Math.round(A.getX(i) * 40), 3, Math.round(A.getZ(i) * 40), 9); A.setY(i, A.getY(i) + k * 0.3 - 0.03); A.setX(i, A.getX(i) * (0.85 + k * 0.3)); A.setZ(i, A.getZ(i) * (1.1 - k * 0.3)); }   // a ragged hem
    g.computeVertexNormals();
    add(part(g, CLOTH, 0, (top + low) / 2, hp.z), 'pelvis');
    add(ball(V(0, hd.y + 0.1, hd.z + 0.03), 0.08, 0.095, 0.075, D, 8, 6), 'Head');   // nothing under the hood
    for (const sx of [-1, 1]) add(ball(V(sx * 0.03, hd.y + 0.11, hd.z + 0.097), 0.012, 0.008, 0.008, GLINT, 5, 3), 'Head');
    return out;
  },
};
// a figure's points moved after it is put together: [x, y, z] and its normal, in metres, the figure standing at the origin
const SHAPE = {
  heavy(p, n) { const belly = Math.exp(-(((p.y - 1.08) / 0.2) ** 2)); p.x = p.x * 1.13 + n.x * 0.018; p.z = p.z * 1.1 + n.z * 0.018 + (p.z > -0.02 && Math.abs(p.x) < 0.22 ? belly * 0.085 : 0); },
};

const log = [], say = (...a) => log.push(a.join(' '));
export const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const files = {}, loader = new GLTFLoader(), raw = {};
const load = async name => { raw[name] = raw[name] || await (await fetch(name.includes('.') ? '/creatures/' + name : '/full/' + name + '.glb')).arrayBuffer(); return loader.parseAsync(raw[name].slice(0), ''); };
const picture = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('no picture ' + src)); i.src = src; });

const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d'); ctx.fillStyle = '#777'; ctx.fillRect(0, 0, W, H);
{ const [x, y, s] = CELL.white; ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s, s); }
const drawn = new Set();
function cellOf(m) {
  if (!m.map) return CELL.white;
  const c = CELL[m.name]; if (!c) throw new Error('no place in the picture for ' + m.name);
  if (!drawn.has(m.name)) { drawn.add(m.name); ctx.drawImage(m.map.image, c[0], c[1], c[2], c[2]); }
  return c;
}
// A surface painted into the picture with its relief in it (the page lights these flat): its colour, darkened in its hollows (its occlusion picture) and lit from the upper left along its bumps (its normal picture).
async function surface(name) {
  const [x, y, s] = CELL[name], [bright, deep, grey] = SURF[name], px = async suf => { const c = document.createElement('canvas'); c.width = c.height = s; const k = c.getContext('2d'); k.drawImage(await picture('/creatures/tex/' + name + suf + '.jpg'), 0, 0, s, s); return k.getImageData(0, 0, s, s); };
  const d = await px(''), n = await px('_n'), ao = await px('_ao'), o = d.data; let sum = 0;
  for (let i = 0; i < o.length; i += 4) {
    const nx = n.data[i] / 127.5 - 1, ny = n.data[i + 1] / 127.5 - 1, nz = n.data[i + 2] / 127.5 - 1, lit = Math.max(0.25, Math.min(1.5, 1 + deep * (-0.55 * nx + 0.65 * ny) + (nz - 1) * 0.3)), k = lit * (ao.data[i] / 255) ** deep;
    const l = 0.2126 * o[i] + 0.7152 * o[i + 1] + 0.0722 * o[i + 2]; for (let c = 0; c < 3; c++) o[i + c] = (o[i + c] + (l - o[i + c]) * grey) * k; sum += 0.2126 * o[i] + 0.7152 * o[i + 1] + 0.0722 * o[i + 2];
  }
  const gain = bright * 255 / (sum / (o.length / 4)); for (let i = 0; i < o.length; i += 4) for (let c = 0; c < 3; c++) o[i + c] = Math.min(255, o[i + c] * gain);
  ctx.putImageData(d, x, y);
}
// one piece of a figure: where each point is at rest, its normal, its place in the picture, its colour and the bones that carry it
function piece(geo, world, cell, color, skin) {
  const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv, n = P.count, g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Uint8Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  const v = new THREE.Vector3(), q = new THREE.Vector3(), c = new THREE.Color(), nm = new THREE.Matrix3().getNormalMatrix(world), [cx, cy, cs] = cell;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(P, i); if (skin.mesh) skin.mesh.applyBoneTransform(i, v); v.applyMatrix4(world); v.toArray(pos, i * 3);
    q.fromBufferAttribute(N, i).applyMatrix3(nm).normalize().toArray(nor, i * 3);
    let a = U ? U.getX(i) : 0.5, b = U ? U.getY(i) : 0.5; a -= Math.floor(a); b -= Math.floor(b); if (skin.flipV) b = 1 - b;
    uv[i * 2] = (cx + 1.5 + a * (cs - 3)) / W; uv[i * 2 + 1] = (cy + 1.5 + b * (cs - 3)) / H;
    c.copy(color);   // the models' own point colours are not used (most of a body never had them)
    col[i * 4] = Math.round(Math.min(1, c.r) * 255); col[i * 4 + 1] = Math.round(Math.min(1, c.g) * 255); col[i * 4 + 2] = Math.round(Math.min(1, c.b) * 255); col[i * 4 + 3] = (skin.trim ? 0 : 255) + (skin.held ? (skin.trim ? 64 : -127) : 0);   // 0 and 64: the page draws this point in its side's colour; 64 and 128: something held or carried, not the body (the check of each piece's footprint leaves it out)
    if (skin.mesh) for (let k = 0; k < 4; k++) { si[i * 4 + k] = skin.map[geo.attributes.skinIndex.getComponent(i, k)]; sw[i * 4 + k] = geo.attributes.skinWeight.getComponent(i, k); }
    else { si[i * 4] = skin.bone; sw[i * 4] = 1; }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  g.setIndex(geo.index ? Array.from(geo.index.array) : [...Array(n).keys()]);
  return g;
}
// A piece laid onto a surface that has no place for it of its own: each triangle flat along the way it faces, the whole piece inside the surface's picture (span: the metres one picture covers, or the piece if it is larger). facet: its faces flat, as a broken stone's are.
let laid = 0;
function lay(g, cell, span = 1, facet = false) {
  const s = g.index ? g.toNonIndexed() : g, P = s.attributes.position, U = s.attributes.uv, N = s.attributes.normal, [cx, cy, cs] = cell, p = [V(), V(), V()], e = V(), f = V(), seed = ++laid;
  s.computeBoundingBox(); const lo = s.boundingBox.min.toArray(), size = s.boundingBox.getSize(V()).toArray(), w = Math.max(span, ...size), off = [0, 1, 2].map(k => hash(seed, k, 5) * (1 - size[k] / w));
  for (let t = 0; t < P.count; t += 3) {
    for (let k = 0; k < 3; k++) p[k].fromBufferAttribute(P, t + k);
    f.copy(p[1]).sub(p[0]).cross(e.copy(p[2]).sub(p[0])).normalize();
    const ax = Math.abs(f.x) > Math.abs(f.y) && Math.abs(f.x) > Math.abs(f.z) ? 0 : Math.abs(f.y) > Math.abs(f.z) ? 1 : 2, ua = ax === 0 ? 2 : 0, va = ax === 1 ? 2 : 1;
    for (let k = 0; k < 3; k++) { const a = (p[k].getComponent(ua) - lo[ua]) / w + off[ua], b = 1 - ((p[k].getComponent(va) - lo[va]) / w + off[va]);
      U.setXY(t + k, (cx + 1.5 + a * (cs - 3)) / W, (cy + 1.5 + b * (cs - 3)) / H); if (facet) N.setXYZ(t + k, f.x, f.y, f.z); }
  }
  s.setIndex([...Array(P.count).keys()]);
  return s;
}
// fewer triangles, and only the points they still use
export function thin(g, tris) {
  { // points at one place with one place in the picture become one point (its normal their sum): the models are faceted, which would stop the thinning
    const P = g.attributes.position.array, U = g.attributes.uv.array, N = g.attributes.normal.array, seen = new Map(), to = new Uint32Array(P.length / 3);
    for (let i = 0; i < to.length; i++) { const k = Math.round(P[i * 3] * 2e4) + ',' + Math.round(P[i * 3 + 1] * 2e4) + ',' + Math.round(P[i * 3 + 2] * 2e4) + ',' + Math.round(U[i * 2] * 4096) + ',' + Math.round(U[i * 2 + 1] * 4096);
      if (seen.has(k)) { const j = seen.get(k); to[i] = j; for (let c = 0; c < 3; c++) N[j * 3 + c] += N[i * 3 + c]; } else { seen.set(k, i); to[i] = i; } }
    const v = new THREE.Vector3(); for (let i = 0; i < to.length; i++) if (to[i] === i) v.fromArray(N, i * 3).normalize().toArray(N, i * 3);
    g.setIndex(Array.from(g.index.array, i => to[i]));
  }
  const idx = new Uint32Array(g.index.array), before = idx.length / 3;
  const [out] = MeshoptSimplifier.simplify(idx, g.attributes.position.array, 3, tris * 3, 0.05, ['Prune', 'Permissive']), used = new Map(), keep = [];
  const ni = Array.from(out, i => { if (!used.has(i)) { used.set(i, keep.length); keep.push(i); } return used.get(i); }), o = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries(g.attributes)) { const arr = new a.array.constructor(keep.length * a.itemSize); keep.forEach((src, d) => { for (let k = 0; k < a.itemSize; k++) arr[d * a.itemSize + k] = a.array[src * a.itemSize + k]; }); o.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize, a.normalized)); }
  o.setIndex(ni);
  return o;
}
export const exportGlb = (scene, animations = []) => new Promise((res, rej) => new GLTFExporter().parse(scene, res, rej, { binary: true, animations }));
// a clip as the page plays it: FPS keys a second (the page blends between them), nothing that never moves
function resample(c, name = c.name) {
  const n = Math.max(2, Math.round(c.duration * FPS) + 1), times = Float32Array.from({ length: n }, (_, i) => c.duration * i / (n - 1));
  const tracks = c.tracks.map(t => { const size = t.getValueSize(), it = t.createInterpolant(new Float32Array(size)), v = new Float32Array(n * size); times.forEach((tm, i) => v.set(it.evaluate(tm), i * size)); return new t.constructor(t.name, times, v); });
  return new THREE.AnimationClip(name, c.duration, tracks).optimize();
}
const moving = t => { if (t.name.endsWith('.scale')) return false; if (t.name.endsWith('.position')) { let span = 0; for (let i = 3; i < t.values.length; i++) span = Math.max(span, Math.abs(t.values[i] - t.values[i % 3])); return span > 1e-4; } return true; };   // a bone that never leaves its place keeps the body's own
// How fast a figure must cross the ground for its walk's feet not to slide (metres a second): at each moment the lowest point of its feet is the one bearing it, and the speed that point goes backwards at is the speed the body must go forwards; the middle one of those over the cycle (moments with nothing on the ground left out).
function stride(root, mesh, clip) {
  const P = mesh.geometry.attributes.position, bb = mesh.geometry.boundingBox, tall = bb.max.y - bb.min.y, feet = [], v = V(), mixer = new THREE.AnimationMixer(root), act = mixer.clipAction(clip); act.play();
  for (let i = 0; i < P.count; i++) if (P.getY(i) < bb.min.y + tall * 0.06) feet.push(i);
  const N = 96, at = [];
  for (let k = 0; k <= N; k++) { mixer.setTime(clip.duration * k / N); root.updateMatrixWorld(true); mesh.skeleton.update(); at.push(feet.map(i => { v.fromBufferAttribute(P, i); mesh.applyBoneTransform(i, v); return [v.y, v.z]; })); }
  const floor = Math.min(...at.map(f => Math.min(...f.map(q => q[0])))), vel = [];
  for (let k = 0; k < N; k++) { let j = 0; for (let i = 1; i < feet.length; i++) if (at[k][i][0] < at[k][j][0]) j = i; if (at[k][j][0] < floor + tall * 0.02 && at[k + 1][j][0] < floor + tall * 0.02) vel.push((at[k][j][1] - at[k + 1][j][1]) / (clip.duration / N)); }
  act.stop(); mixer.uncacheRoot(root); mixer.setTime(0); root.updateMatrixWorld(true); mesh.skeleton.update();
  vel.sort((a, b) => a - b);
  if (vel.length >= N / 8 && vel[vel.length >> 1] > 0) return +vel[vel.length >> 1].toFixed(3);
  // a bounding gait is hardly ever on the ground at its lowest: the mean speed its low points go backwards at instead
  const lo = at.map(f => f.reduce((m, q) => Math.min(m, q[0]), 1e9)), top = Math.max(...at.map(f => Math.max(...f.map(q => q[0])))); let sum = 0, n = 0;
  for (let k = 0; k < N; k++) for (let i = 0; i < feet.length; i++) { const d = (at[k][i][1] - at[k + 1][i][1]) / (clip.duration / N); if (d > 0 && Math.max(at[k][i][0], at[k + 1][i][0]) < floor + (top - floor) * 0.3) { sum += d; n++; } }
  return n ? +(sum / n).toFixed(3) : 0;
}

// When a strike lands: the moment in its clip the figure reaches furthest forward (seconds).
function reach(root, mesh, clip) {
  const P = mesh.geometry.attributes.position, v = V(), mixer = new THREE.AnimationMixer(root), act = mixer.clipAction(clip), N = Math.max(8, Math.round(clip.duration * 30)); act.play(); let best = -1e9, at = 0;
  for (let k = 0; k <= N; k++) { mixer.setTime(clip.duration * k / N); root.updateMatrixWorld(true); mesh.skeleton.update(); let z = -1e9; for (let i = 0; i < P.count; i += 3) { v.fromBufferAttribute(P, i); mesh.applyBoneTransform(i, v); z = Math.max(z, v.z); } if (z > best + 1e-4) { best = z; at = clip.duration * k / N; } }
  act.stop(); mixer.uncacheRoot(root); mixer.setTime(0); root.updateMatrixWorld(true); mesh.skeleton.update();
  return +at.toFixed(2);
}

async function unit(type) {
  const spec = SPEC[type], body = (await load(spec.body)).scene, K = spec.k || 1;
  body.updateMatrixWorld(true);
  const skinned = []; body.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); });
  const bones = skinned[0].skeleton.bones, index = new Map(bones.map((b, i) => [b.name, i])), bone = name => { if (!index.has(name)) throw new Error(type + ': no bone ' + name); return index.get(name); };
  const P = name => new THREE.Vector3().setFromMatrixPosition(bones[bone(name)].matrixWorld);
  const white = new THREE.Color(1, 1, 1), tint = new THREE.Color(spec.tint || 0xffffff), skinTint = new THREE.Color(spec.skin || 0xffffff), hairColor = new THREE.Color(spec.hairColor || 0x3a2a1c), groups = { body: [], head: [], hair: [], gear: [] };
  let off = 0; const v = new THREE.Vector3(), r = new THREE.Vector3();
  for (const o of skinned) {
    if ((spec.hide || []).some(h => o.name.includes(h)) || (spec.only && !spec.only.some(h => o.name.includes(h)))) continue;
    o.skeleton.update();
    for (let i = 0; i < o.geometry.attributes.position.count; i += 37) { v.fromBufferAttribute(o.geometry.attributes.position, i); r.copy(v); o.applyBoneTransform(i, v); off = Math.max(off, v.distanceTo(r)); }
    const g = piece(o.geometry, o.matrixWorld, cellOf(o.material), o.material.name.includes('Regular') ? skinTint : tint, { mesh: o, map: o.skeleton.bones.map(b => bone(b.name)) });
    groups.body.push(spec.cloth ? lay(g, CELL.cloth, 1.3) : g);
  }
  for (const [list, names] of [['head', spec.head ? [spec.head] : []], ['hair', spec.hair || []]]) for (const name of names) {
    const s = (await load(name)).scene; s.updateMatrixWorld(true);
    s.traverse(o => { if (o.isMesh) groups[list].push(piece(o.geometry, o.matrixWorld, cellOf(o.material), o.material.name.includes('Hair') ? hairColor : o.material.name.includes('Superhero') ? skinTint : white, { bone: bone('Head') })); });
  }
  let crown = P('Head').y + 0.21; for (const g of groups.head) { g.computeBoundingBox(); crown = Math.max(crown, g.boundingBox.max.y); }
  const built = [], take = (o, boneName, to = built) => { o.updateWorldMatrix(true, true); o.traverse(m => { if (!m.isMesh) return; const u = m.userData, g = piece(m.geometry, m.matrixWorld, CELL.white, u.flat, { bone: bone(boneName), trim: u.trim, held: to !== built }); to.push(u.lay ? lay(g, CELL[u.lay.lay], u.lay.metres, u.lay.facet) : g); }); };
  // every piece wears its side's colour: a mantle round the shoulders and a belt (wear: which of them; a built creature has its own)
  const nk = P('neck_01'), hp = P('pelvis');
  for (const w of spec.wear || ['collar', 'belt']) take(w === 'collar' ? ring(V(0, nk.y - 0.03, nk.z - 0.01), 0.1, 0.04, TEAM, V(0, 1, 0), 0.9, 8) : ring(V(0, hp.y + 0.075, hp.z + 0.005), 0.15, 0.03, TEAM, V(0, 1, 0), 0.8, 8), w === 'collar' ? 'spine_03' : 'pelvis');
  if (spec.build) for (const [o, boneName] of BUILD[spec.build](P)) take(o, boneName);
  for (const kind of spec.gear.filter(k => WORN[k])) {
    const [boneName, from, off, rot] = WORN[kind], b = bones[bone(boneName)], item = makeGear(kind), at = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
    if (from === 'top') at.y = crown;
    item.position.copy(at).add(new THREE.Vector3(...off)); item.rotation.set(...rot); take(item, boneName, groups.gear);
  }
  for (const kind of spec.gear.filter(k => !WORN[k])) {
    const [boneName, pos, rot] = HOLD[kind], b = bones[bone(boneName)], item = makeGear(kind);
    item.position.set(...pos); item.rotation.set(...rot);
    if (spec.aim) { const clip = (await load('animations')).animations.find(c => c.name === spec.aim[0]), mixer = new THREE.AnimationMixer(body), a = mixer.clipAction(clip); a.play(); mixer.setTime(0); body.updateMatrixWorld(true);
      item.quaternion.copy(b.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(...spec.aim[1]).normalize()))); a.stop(); mixer.uncacheRoot(body); body.updateMatrixWorld(true); }
    b.add(item); take(item, boneName, groups.gear);
    b.remove(item);
  }
  const count = g => g.index.count / 3, parts = [], was = {}, now = {}, shape = SHAPE[spec.shape];
  if (built.length) groups.built = built;
  for (const [k, list] of Object.entries(groups)) { if (!list.length) continue; const m = mergeGeometries(list.map(g => (g.index ? g : g.setIndex([...Array(g.attributes.position.count).keys()])))); was[k] = count(m); const t = TRIS[k] ? thin(m, k === 'hair' ? TRIS.hair * list.length : k === 'body' && !FIRST.has(type) ? LATER : TRIS[k]) : m; now[k] = count(t);
    if (shape && k !== 'gear') { const A = t.attributes.position, B = t.attributes.normal, p = V(), n = V(); for (let i = 0; i < A.count; i++) { p.fromBufferAttribute(A, i); n.fromBufferAttribute(B, i); shape(p, n); A.setXYZ(i, p.x, p.y, p.z); } }
    parts.push(t); }
  const geo = mergeVertices(mergeGeometries(parts));
  if (spec.fade) { const A = geo.attributes.position, C = geo.attributes.color; for (let i = 0; i < A.count; i++) { const k = Math.min(1, 0.3 + 0.7 * A.getY(i) / 1.0); if (C.getW(i) > 0.9) C.setXYZ(i, C.getX(i) * k * k, C.getY(i) * k * (0.5 + 0.5 * k), C.getZ(i) * k); } }   // the robe goes dark and blue toward its hem
  geo.scale(K, K, K);
  // bound again as it stands at rest, the mesh at the origin: a figure's bones can then live outside the scene
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.scale.setScalar(K);
  const arm = bones[0].parent && !bones[0].parent.isBone ? bones[0].parent : bones[0]; let top = arm; while (top.parent && top.parent !== body) top = top.parent;
  for (const o of skinned) o.removeFromParent();
  rig.add(top); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  geo.computeBoundingBox(); const bb = geo.boundingBox;
  root.userData = { k: K, tall: +bb.max.y.toFixed(3), wide: +(bb.max.x - bb.min.x).toFixed(3), deep: +(bb.max.z - bb.min.z).toFixed(3) };
  const glb = await exportGlb(root);
  files[type + '.glb'] = b64(glb);
  say(type, 'triangles', JSON.stringify(was), '->', JSON.stringify(now), '=', count(geo), 'points', geo.attributes.position.count, 'tall', bb.max.y.toFixed(2), 'wide', (bb.max.x - bb.min.x).toFixed(2), 'deep', (bb.max.z - bb.min.z).toFixed(2), 'rest off bind', off.toExponential(1), Math.round(glb.byteLength / 1024) + ' KB');
  return { root, top, mesh };
}

// A creature of its own: one whole model made one mesh of the same kind as a person's (the shared picture, thinned, bound as it stands at rest), with its own bones and its own few clips in its own file.
async function creature(type) {
  const spec = CRE[type], anims = {}; let scene;
  if (spec.file.endsWith('.dae')) {
    const get = async f => { const d = new ColladaLoader().parse(await (await fetch('/creatures/' + f)).text(), '/creatures/none/'), names = new Map(); d.scene.traverse(o => names.set(o.uuid, o.name));
      for (const c of d.scene.animations || []) for (const t of c.tracks) { const i = t.name.lastIndexOf('.'); t.name = names.get(t.name.slice(0, i)) + t.name.slice(i); } return d.scene; };
    scene = await get(spec.file); for (const [name, f] of Object.entries(spec.clips)) anims[name] = (await get(f)).animations[0];
  } else { const src = await load(spec.file); scene = src.scene; for (const [name, from] of Object.entries(spec.clips)) anims[name] = from.map(n => src.animations.find(a => a.name === n)).find(Boolean); }
  for (const [name, c] of Object.entries(anims)) if (!c) throw new Error(type + ': no clip for ' + name);
  scene.updateMatrixWorld(true);
  const skinned = [], loose = []; scene.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); else if (o.isMesh) loose.push(o); });
  const bones = skinned[0].skeleton.bones, index = new Map(bones.map((b, i) => [b, i])), byName = n => { const b = bones.find(b => b.name === n); if (!b) throw new Error(type + ': no bone ' + n); return b; }, list = [];
  const turn = (b, angle, axis = [1, 0, 0]) => { const p = b.parent.getWorldQuaternion(new THREE.Quaternion()); return p.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(V(...axis), angle)).multiply(p); };   // a turn about one of the figure's own lines (side to side unless told), as that bone's own
  for (const [bn, axis, angle] of spec.tail || []) {   // in the rest pose and in every clip
    const b = byName(bn), q = turn(b, angle, axis); b.quaternion.premultiply(q); scene.updateMatrixWorld(true);
    for (const c of Object.values(anims)) for (const t of c.tracks) if (t.name === b.name + '.quaternion') { const k = new THREE.Quaternion(); for (let i = 0; i < t.values.length; i += 4) k.fromArray(t.values, i).premultiply(q).toArray(t.values, i); }
  }
  if (spec.stride) {   // each leg bone's turn away from where it is on average, made larger
    const [which, amp] = spec.stride, q = new THREE.Quaternion(), m = new THREE.Quaternion(), ax = V();
    for (const t of anims.Walk.tracks) { if (!t.name.endsWith('.quaternion') || !which.test(t.name)) continue;
      const v = t.values, sum = [0, 0, 0, 0]; for (let i = 0; i < v.length; i += 4) { const sg = v[i] * v[0] + v[i + 1] * v[1] + v[i + 2] * v[2] + v[i + 3] * v[3] < 0 ? -1 : 1; for (let c = 0; c < 4; c++) sum[c] += v[i + c] * sg; }
      m.fromArray(sum).normalize();
      for (let i = 0; i < v.length; i += 4) { q.fromArray(v, i); const d = m.clone().invert().multiply(q); if (d.w < 0) d.set(-d.x, -d.y, -d.z, -d.w); const ang = 2 * Math.acos(Math.min(1, d.w)), sn = Math.sqrt(1 - Math.min(1, d.w * d.w));
        if (sn > 1e-5) { ax.set(d.x / sn, d.y / sn, d.z / sn); d.setFromAxisAngle(ax, ang * amp); } m.clone().multiply(d).toArray(v, i); } }
  }
  let cell = null; if (spec.pic) { cell = CELL.dragon; ctx.drawImage(await picture('/creatures/' + spec.pic), cell[0], cell[1], cell[2], cell[2]); const d = ctx.getImageData(cell[0], cell[1], cell[2], cell[2]); for (let i = 0; i < d.data.length; i++) if (i % 4 !== 3) d.data[i] = Math.min(255, d.data[i] * spec.gain); ctx.putImageData(d, cell[0], cell[1]); }   // its picture is dark for a dungeon: made brighter
  const how = (m, skin) => (cell ? [cell, new THREE.Color(1, 1, 1), Object.assign(skin, { flipV: true })] : [CELL.white, m.color.clone(), skin]);
  for (const o of skinned) { o.skeleton.update(); const g = piece(o.geometry, o.matrixWorld, ...how(o.material, { mesh: o, map: o.skeleton.bones.map(b => index.get(b)) })); list.push(spec.lay ? lay(g, CELL[spec.lay], 1) : g); }
  for (const o of loose) { let b = o.parent; while (b && !index.has(b)) b = b.parent; list.push(piece(o.geometry, o.matrixWorld, ...how(o.material, { bone: b ? index.get(b) : 0 }))); }
  let geo = mergeGeometries(list); const was = geo.index.count / 3; if (was > spec.tris) geo = thin(geo, spec.tris);
  if (spec.collar) { const [bn, rad, tube, offs, squash] = spec.collar, b = byName(bn), at = V().setFromMatrixPosition(b.matrixWorld), kid = b.children.find(c => c.isBone), dir = kid ? V().setFromMatrixPosition(kid.matrixWorld).sub(at) : V(0, 0, 1);
    const o = ring(at.add(V(...offs)), rad, tube, TEAM, dir, squash, 12); o.updateWorldMatrix(true, true); geo = mergeGeometries([geo, piece(o.geometry, o.matrixWorld, CELL.white, TEAM.color, { bone: index.get(b), trim: true })]); }
  geo = mergeVertices(geo); geo.computeBoundingBox();
  const bb = geo.boundingBox, k = spec.long / (bb.max.z - bb.min.z), lift = -bb.min.y * k, mid = -(bb.max.z + bb.min.z) / 2 * k; geo.scale(k, k, k); geo.translate(0, lift, mid);
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.scale.setScalar(k); rig.position.set(0, lift, mid);
  for (const o of [...skinned, ...loose]) o.removeFromParent();
  rig.add(scene); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  const out = [];
  for (const [name, c] of Object.entries(anims)) out.push(resample(new THREE.AnimationClip(name, c.duration, c.tracks.filter(moving)), name));
  if (spec.flinch) {   // no struck clip came with it: a short one made here, its neck and back thrown back and let go
    const tracks = spec.flinch.map((n, i) => { const b = byName(n), q0 = b.quaternion.clone(), q1 = q0.clone().premultiply(turn(b, -0.22 + i * 0.05)); return new THREE.QuaternionKeyframeTrack(n + '.quaternion', [0, 0.1, 0.24, 0.5], [...q0.toArray(), ...q1.toArray(), ...q0.clone().slerp(q1, 0.35).toArray(), ...q0.toArray()]); });
    out.push(new THREE.AnimationClip('Hit', 0.5, tracks));
  }
  geo.computeBoundingBox(); const nb = geo.boundingBox, speed = stride(root, mesh, out.find(c => c.name === 'Walk'));
  root.userData = { k: 1, speed, contact: reach(root, mesh, out.find(c => c.name === 'Attack')), tall: +nb.max.y.toFixed(3), wide: +(nb.max.x - nb.min.x).toFixed(3), deep: +(nb.max.z - nb.min.z).toFixed(3) };
  const glb = await exportGlb(root, out);
  files[type + '.glb'] = b64(glb);
  say(type, 'triangles', was, '->', geo.index.count / 3, 'points', geo.attributes.position.count, 'tall', nb.max.y.toFixed(2), 'wide', (nb.max.x - nb.min.x).toFixed(2), 'long', (nb.max.z - nb.min.z).toFixed(2), 'walks at', speed, 'm/s, strikes at', root.userData.contact, 's; clips', out.map(c => c.name + ' ' + c.duration.toFixed(1) + 's').join(', '), Math.round(glb.byteLength / 1024) + ' KB');
}

async function clips(first) {
  const src = [...(await load('animations')).animations, ...(await load('animations2')).animations], out = [], speeds = {}, contact = {};
  for (const name of CLIPS) {
    const c = src.find(a => a.name === name); if (!c) throw new Error('no clip ' + name);
    out.push(resample(new THREE.AnimationClip(name, c.duration, c.tracks.filter(t => moving(t) && !/thumb|index|middle|ring|pinky/.test(t.name) && t.name !== 'root.position'))));   // the fingers stay as the body has them; nobody is carried off its tile
  }
  for (const name of WALKS) speeds[name] = stride(first.root, first.mesh, out.find(c => c.name === name));
  for (const name of STRIKES) contact[name] = reach(first.root, first.mesh, out.find(c => c.name === name));
  const bare = new THREE.Group(); bare.name = 'clips'; bare.userData = { speeds, contact }; bare.add(first.top);
  const glb = await exportGlb(bare, out);
  files['anim.glb'] = b64(glb);
  say('clips', out.map(c => c.name + ' ' + c.duration.toFixed(2) + 's').join(', '), '| walking speeds', JSON.stringify(speeds), '| strikes land at', JSON.stringify(contact), Math.round(glb.byteLength / 1024) + ' KB');
}

window.bake = async () => {
  await MeshoptSimplifier.ready;
  for (const name of Object.keys(SURF)) await surface(name);
  let first;
  for (const type of Object.keys(SPEC)) { const u = await unit(type); first = first || u; }
  await clips(first);
  for (const type of Object.keys(CRE)) await creature(type);
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  return { files, log };
};
