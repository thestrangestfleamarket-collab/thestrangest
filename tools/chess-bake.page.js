// SKIRMISH TABLE's bake, the part that runs in a browser (tools/chess-bake.cjs): each unit type as one thinned skinned mesh on one shared picture, and the clips it plays
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';

// Quaternius CC0: Modular Character Outfits - Fantasy (bodies), Universal Base Characters (heads, hair). Weapons, shields, hats, capes and the like are simple shapes made here.
// The creatures (CRE below) are whole CC0 models with their own bones and clips: Quaternius' Ultimate Monsters (Orc, Ghost, Dragon, Goleling) and Ultimate Animated Animals (Wolf), KayKit's Skeletons (Skeleton_Minion).
const SPEC = {
  bulwark:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_Buzzed'], hairColor: 0x2a2018, tint: 0x8f98a8, gear: ['sword', 'shield'] },
  lancer:    { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x8a3a1a, tint: 0xb0705a, gear: ['greataxe'] },
  strider:   { body: 'Female_Ranger', head: 'Female_Head', tint: 0x4c5060, gear: ['dagger'] },
  slinger:   { body: 'Male_Ranger', head: 'Male_Head', gear: ['crossbow'] },
  ember:     { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Long', 'Hair_Beard'], hairColor: 0xb8b4ac, tint: 0xc04a36, gear: ['staff'] },
  mender:    { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Long'], hairColor: 0xc8a25a, tint: 0xf2efe6, gear: [] },
  hexbinder: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x1c1a22, tint: 0x7d55c0, gear: ['wand'] },
  pike:      { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Buzzed'], hairColor: 0x3a2a1c, tint: 0x8a9a4e, gear: ['pike', 'cap'] },
  warden:    { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_Buzzed', 'Hair_Beard'], hairColor: 0x1c1a18, tint: 0x5c6470, gear: ['mace', 'tower', 'cap'] },
  arbalest:  { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted'], hairColor: 0x5a3a1c, tint: 0x4f6a3a, gear: ['arbalest', 'boltcase'] },
  assassin:  { body: 'Male_Ranger', hide: ['Pauldron'], head: 'Male_Head', tint: 0x26242e, gear: ['dagger', 'dagger2', 'redcape'] },
  bard:      { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Long'], hairColor: 0x9a4a22, tint: 0xe2b93a, gear: ['lute', 'hat'] },
  alchemist: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x6a3a1c, tint: 0x4fa06a, gear: ['flask', 'bandolier', 'pack'] },
  frost:     { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Long'], hairColor: 0xdfeaf2, tint: 0x7cc4ea, gear: ['froststaff', 'icecape'] },
  necro:     { body: 'Male_Ranger', hide: ['Pauldron'], head: 'Male_Head', hair: ['Hair_Beard'], hairColor: 0x18161a, tint: 0x3d2c52, gear: ['skullstaff', 'purplecape'] },
  summoner:  { body: 'Female_Ranger', head: 'Female_Head', tint: 0x2f9a94, gear: ['ringstaff', 'peak'] },
  storm:     { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0xd8d8d0, tint: 0x3450b8, gear: ['forkstaff'] },
  captain:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x4a3018, tint: 0xa83232, gear: ['sword', 'banner', 'plume', 'goldcape'] },
};
// A creature: its file, how tall it is made (metres, standing or hovering as its maker set it), how far it is thinned, a tint, and the clips kept under the names the page plays.
const CRE = {
  wolf:     { file: 'Wolf.gltf', tall: 0.92, tris: 2000, clips: { Idle: ['Idle'], Walk: ['Gallop', 'Walk'], Attack: ['Attack'], Hit: ['Idle_HitReact1'], Death: ['Death'] } },
  ogre:     { file: 'Orc.gltf', tall: 2.25, tris: 2600, clips: { Idle: ['Idle'], Walk: ['Walk'], Attack: ['Weapon', 'Punch'], Hit: ['HitReact'], Death: ['Death'] } },
  skeleton: { file: 'Skeleton_Minion.glb', tall: 1.62, tris: 2100, clips: { Idle: ['Idle'], Walk: ['Walking_A', 'Walking_B', 'Running_A'], Attack: ['1H_Melee_Attack_Chop'], Hit: ['Hit_A'], Death: ['Death_A'] } },
  ghost:    { file: 'Ghost.gltf', tall: 1.55, tris: 2000, paint: 'pale', clips: { Idle: ['Flying_Idle'], Walk: ['Fast_Flying'], Attack: ['Headbutt', 'Punch'], Hit: ['HitReact'], Death: ['Death'] } },
  whelp:    { file: 'Dragon.gltf', tall: 1.38, tris: 2400, clips: { Idle: ['Flying_Idle'], Walk: ['Fast_Flying'], Attack: ['Headbutt', 'Punch'], Hit: ['HitReact'], Death: ['Death'] } },
  golem:    { file: 'Yeti.gltf', tall: 2.1, tris: 2500, paint: 'stone', clips: { Idle: ['Idle'], Walk: ['Walk'], Attack: ['Punch'], Hit: ['HitReact'], Death: ['Death'] } },   // no CC0 golem to hand: the pack's Yeti, its every colour turned to stone
};
// A creature's colours changed at the bake: each point takes its colour from the model's own picture, through one of these, and is then drawn from the plain white of the shared picture.
const PAINT = {
  pale: c => { const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return l > 0.6 ? c.setRGB(0.02, 0.04, 0.09) : c.setRGB(0.5 + l, 0.7 + l, 0.8 + l); },   // a pale spectre with dark eyes
  stone: c => { const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b, k = 0.3 + 0.62 * Math.sqrt(l); return c.setRGB(0.45 * k, 0.43 * k, 0.39 * k); },
};
const pixels = image => { const cv = document.createElement('canvas'); cv.width = image.width; cv.height = image.height; const x = cv.getContext('2d'); x.drawImage(image, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data, c = new THREE.Color();
  return (a, b) => { const i = (Math.min(cv.height - 1, Math.floor(b * cv.height)) * cv.width + Math.min(cv.width - 1, Math.floor(a * cv.width))) * 4; return c.setRGB(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255, THREE.SRGBColorSpace); }; };
const TRIS = { body: 1700, head: 380, hair: 200 };   // what each part of a figure is thinned to
const FIRST = new Set(['bulwark', 'lancer', 'strider', 'slinger', 'ember', 'mender', 'hexbinder']), LATER = 1500;   // the later people carry more gear: their bodies are thinned a little further, so no team of them costs more to draw than the first seven did
const CLIPS = ['Sword_Idle', 'Sword_Attack', 'Idle_Loop', 'Punch_Cross', 'Pistol_Shoot', 'Spell_Simple_Shoot', 'Walk_Loop', 'Hit_Chest', 'Death01'];
// the one picture every figure is drawn from: [x, y, size] of each material's own picture in it
const W = 1024, H = 512, CELL = { MI_Peasant: [0, 0, 256], MI_Ranger: [256, 0, 256], MI_Superhero_Male: [512, 0, 256], MI_Superhero_Female: [768, 0, 256], MI_Hair_1: [0, 256, 256], MI_Hair_2: [256, 256, 256],
  MI_Regular_Male: [512, 256, 128], MI_Regular_Female: [640, 256, 128], MI_Eyes: [512, 384, 128], white: [640, 384, 128],
  Atlas: [768, 256, 128], Material: [896, 256, 128], skeleton: [768, 384, 128] };   // the monsters' shared picture, the dragon's own, the skeleton's

const CAPE = { redcape: 0x8c1f1f, goldcape: 0xd9b24a, icecape: 0xbfe6ff, purplecape: 0x6a35a0 };
const mat = (color, glow = 0) => ({ color: new THREE.Color(color).multiplyScalar(1 + glow) });
const steel = mat(0xcfd4dc), darkWood = mat(0x4a3324), leather = mat(0x3a2a20);
const part = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial()); o.userData.flat = m.color; o.position.set(x, y, z); return o; };
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
    g.add(part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 16), mat(0x5a6f8c), 0, 0, 0), part(new THREE.SphereGeometry(0.09, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.015, 0),
      part(new THREE.TorusGeometry(0.34, 0.016, 5, 16), steel, 0, 0, 0).rotateX(Math.PI / 2));
  } else if (kind === 'dagger2') {
    g.add(part(new THREE.BoxGeometry(0.055, 0.3, 0.012), steel, 0, 0.25, 0), part(new THREE.BoxGeometry(0.16, 0.03, 0.04), steel, 0, 0.09, 0), part(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), leather, 0, 0, 0));
  } else if (kind === 'pike') {
    g.add(part(new THREE.CylinderGeometry(0.016, 0.018, 3.0, 6), darkWood, 0, 0.9, 0), part(new THREE.ConeGeometry(0.04, 0.3, 4), steel, 0, 2.55, 0), part(new THREE.BoxGeometry(0.2, 0.025, 0.025), steel, 0, 2.38, 0));
  } else if (kind === 'mace') {
    g.add(part(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), darkWood, 0, 0.18, 0), part(new THREE.IcosahedronGeometry(0.08, 0), steel, 0, 0.47, 0));
  } else if (kind === 'arbalest') {
    g.add(part(new THREE.BoxGeometry(0.06, 0.8, 0.07), darkWood, 0, 0.22, 0), part(new THREE.BoxGeometry(0.8, 0.04, 0.035), steel, 0, 0.5, 0), part(new THREE.TorusGeometry(0.06, 0.012, 4, 8), steel, 0, 0.68, 0),
      part(new THREE.BoxGeometry(0.014, 0.42, 0.014), mat(0xe8e0c8), 0, 0.34, 0.045));
  } else if (kind === 'lute') {
    const body = part(new THREE.SphereGeometry(0.17, 10, 7), mat(0xb5772e), 0, 0.12, 0); body.scale.set(1, 1.25, 0.5);
    g.add(body, part(new THREE.BoxGeometry(0.04, 0.44, 0.025), darkWood, 0, 0.5, 0), part(new THREE.BoxGeometry(0.1, 0.09, 0.03), darkWood, 0, 0.75, -0.01), part(new THREE.SphereGeometry(0.05, 8, 5), mat(0x2a1a10), 0, 0.14, 0.07));
  } else if (kind === 'flask') {
    g.add(part(new THREE.SphereGeometry(0.09, 9, 7), mat(0x58e06a, 0.2), 0, 0.15, 0), part(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 6), mat(0xcfe8d8), 0, 0.26, 0), part(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 6), darkWood, 0, 0.32, 0));
  } else if (kind === 'froststaff') {
    const ice = part(new THREE.OctahedronGeometry(0.12), mat(0x9fe0ff, 0.2), 0, 1.42, 0); ice.scale.y = 1.7;
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 6), mat(0xd8e4ec), 0, 0.45, 0), ice, part(new THREE.OctahedronGeometry(0.06), mat(0x9fe0ff, 0.2), 0.13, 1.3, 0), part(new THREE.OctahedronGeometry(0.06), mat(0x9fe0ff, 0.2), -0.13, 1.3, 0));
  } else if (kind === 'skullstaff') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 6), mat(0x1c1820), 0, 0.45, 0), part(new THREE.SphereGeometry(0.1, 9, 7), mat(0xe8e2d0), 0, 1.42, 0), part(new THREE.BoxGeometry(0.11, 0.07, 0.1), mat(0xe8e2d0), 0, 1.32, 0.02),
      part(new THREE.BoxGeometry(0.36, 0.03, 0.03), mat(0x1c1820), 0, 1.22, 0), part(new THREE.SphereGeometry(0.028, 6, 4), mat(0x2bd46a, 0.25), 0.04, 1.44, 0.085), part(new THREE.SphereGeometry(0.028, 6, 4), mat(0x2bd46a, 0.25), -0.04, 1.44, 0.085));
  } else if (kind === 'ringstaff') {
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.6, 6), darkWood, 0, 0.42, 0), part(new THREE.TorusGeometry(0.16, 0.025, 6, 14), mat(0x4fe0d0, 0.2), 0, 1.4, 0), part(new THREE.SphereGeometry(0.055, 8, 6), mat(0xffd65a, 0.2), 0, 1.4, 0));
  } else if (kind === 'forkstaff') {
    const l = part(new THREE.BoxGeometry(0.03, 0.34, 0.03), mat(0xffe24a, 0.2), -0.1, 1.4, 0), r = part(new THREE.BoxGeometry(0.03, 0.34, 0.03), mat(0xffe24a, 0.2), 0.1, 1.4, 0); l.rotation.z = 0.4; r.rotation.z = -0.4;
    g.add(part(new THREE.CylinderGeometry(0.02, 0.026, 1.7, 6), mat(0x2a2f4a), 0, 0.45, 0), l, r, part(new THREE.BoxGeometry(0.03, 0.3, 0.03), mat(0xffe24a, 0.2), 0, 1.47, 0));
  } else if (kind === 'cap') {   // from here on: things worn, set in the standing figure's own space (WORN)
    g.add(part(new THREE.SphereGeometry(0.135, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0, 0), part(new THREE.CylinderGeometry(0.19, 0.2, 0.014, 12), steel, 0, 0.005, 0));
  } else if (kind === 'hat') {
    const feather = part(new THREE.BoxGeometry(0.02, 0.3, 0.06), mat(0xd83a2a), 0.1, 0.17, -0.05); feather.rotation.x = -0.5;
    g.add(part(new THREE.CylinderGeometry(0.22, 0.23, 0.014, 12), mat(0x2f6b3a), 0, 0, 0), part(new THREE.ConeGeometry(0.13, 0.22, 8), mat(0x2f6b3a), 0, 0.11, 0), feather);
  } else if (kind === 'plume') {
    g.add(part(new THREE.SphereGeometry(0.135, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd9b24a), 0, 0, 0), part(new THREE.BoxGeometry(0.035, 0.16, 0.3), mat(0xd83a2a), 0, 0.17, -0.02));
  } else if (CAPE[kind]) {
    g.add(part(new THREE.BoxGeometry(0.58, 1.0, 0.025), mat(CAPE[kind]), 0, -0.5, 0));
  } else if (kind === 'peak') {
    g.add(part(new THREE.CylinderGeometry(0.25, 0.26, 0.014, 12), mat(0x35c2b8), 0, 0, 0), part(new THREE.ConeGeometry(0.14, 0.42, 8), mat(0x35c2b8), 0, 0.21, 0), part(new THREE.TorusGeometry(0.135, 0.016, 4, 10), mat(0xffd65a), 0, 0.02, 0).rotateX(Math.PI / 2));
  } else if (kind === 'pack') {
    g.add(part(new THREE.BoxGeometry(0.34, 0.4, 0.16), leather, 0, 0, 0), part(new THREE.CylinderGeometry(0.05, 0.06, 0.26, 7), mat(0x58e06a, 0.2), -0.09, 0.3, 0), part(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 7), mat(0xff8a3a, 0.2), 0.09, 0.33, 0),
      part(new THREE.SphereGeometry(0.06, 7, 5), mat(0x58e06a, 0.2), -0.09, 0.45, 0), part(new THREE.SphereGeometry(0.06, 7, 5), mat(0xff8a3a, 0.2), 0.09, 0.51, 0));
  } else if (kind === 'banner') {
    g.add(part(new THREE.CylinderGeometry(0.014, 0.014, 1.8, 6), darkWood, 0, 0.5, 0), part(new THREE.BoxGeometry(0.5, 0.4, 0.014), mat(0xa83232), 0.26, 1.18, 0), part(new THREE.BoxGeometry(0.5, 0.09, 0.02), mat(0xd9b24a), 0.26, 1.18, 0), part(new THREE.ConeGeometry(0.03, 0.1, 4), mat(0xd9b24a), 0, 1.45, 0));
  } else if (kind === 'boltcase') {
    g.add(part(new THREE.BoxGeometry(0.11, 0.34, 0.11), leather, 0, 0, 0), part(new THREE.BoxGeometry(0.02, 0.1, 0.02), mat(0xe8e0c8), -0.025, 0.2, 0), part(new THREE.BoxGeometry(0.02, 0.1, 0.02), mat(0xe8e0c8), 0.025, 0.2, 0.02));
  } else if (kind === 'bandolier') {
    const strap = part(new THREE.BoxGeometry(0.46, 0.045, 0.02), leather, 0, 0, 0);
    g.add(strap, part(new THREE.SphereGeometry(0.052, 7, 5), mat(0xff8a3a, 0.2), -0.13, -0.02, 0.04), part(new THREE.SphereGeometry(0.052, 7, 5), mat(0x58e06a, 0.2), 0, -0.02, 0.05), part(new THREE.SphereGeometry(0.052, 7, 5), mat(0xb070ff, 0.2), 0.13, -0.02, 0.04));
  } else if (kind === 'tower') {
    g.add(part(new THREE.BoxGeometry(0.64, 1.22, 0.045), mat(0x8c2f2f), 0, 0, 0), part(new THREE.BoxGeometry(0.68, 0.05, 0.06), steel, 0, 0.6, 0), part(new THREE.BoxGeometry(0.68, 0.05, 0.06), steel, 0, -0.6, 0),
      part(new THREE.BoxGeometry(0.05, 1.22, 0.06), steel, 0, 0, 0.005), part(new THREE.SphereGeometry(0.1, 8, 5), steel, 0, 0.1, 0.02));
  }
  return g;
}
// How each item sits on its bone: [bone, position, rotation (Euler XYZ)].
const HOLD = { sword: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], dagger: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], greataxe: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], staff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  wand: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], crossbow: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]], shield: ['lowerarm_l', [0, 0.14, -0.07], [Math.PI / 2, 0, 0]],
  dagger2: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]], pike: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], mace: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], arbalest: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]],
  lute: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]], flask: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], froststaff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]], skullstaff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  ringstaff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]], forkstaff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]] };
// Things worn: [the bone that carries it, where it sits from that bone as the figure stands at rest (the figure's left, up, its front), its turn]. 'top' is the crown of the head.
const WORN = { cap: ['Head', 'top', [0, -0.07, 0.01], [0, 0, 0]], hat: ['Head', 'top', [0, -0.05, 0.01], [0, 0, 0]], plume: ['Head', 'top', [0, -0.07, 0.01], [0, 0, 0]],
  redcape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]], goldcape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]], icecape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]], purplecape: ['spine_03', 'bone', [0, 0.14, -0.17], [0.1, 0, 0]],
  peak: ['Head', 'top', [0, -0.05, 0.01], [0, 0, 0]], pack: ['spine_03', 'bone', [0, -0.08, -0.22], [0, 0, 0]], banner: ['spine_03', 'bone', [-0.1, 0, -0.2], [0, 0, 0]],
  boltcase: ['pelvis', 'bone', [-0.21, 0.02, -0.06], [0, 0, 0.2]], bandolier: ['spine_02', 'bone', [0, 0.1, 0.16], [0, 0, 0.35]], tower: ['root', 'bone', [0.2, 0.66, 0.4], [0, 0.25, 0]] };

const log = [], say = (...a) => log.push(a.join(' '));
export const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const files = {}, loader = new GLTFLoader(), raw = {};
const load = async name => { raw[name] = raw[name] || await (await fetch(name.includes('.') ? '/creatures/' + name : '/full/' + name + '.glb')).arrayBuffer(); return loader.parseAsync(raw[name].slice(0), ''); };

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
// one piece of a figure: where each point is at rest, its normal, its place in the picture, its colour and the bones that carry it
function piece(geo, world, cell, color, skin) {
  const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv, n = P.count, g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Uint8Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  const v = new THREE.Vector3(), q = new THREE.Vector3(), c = new THREE.Color(), nm = new THREE.Matrix3().getNormalMatrix(world), [cx, cy, cs] = cell;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(P, i); if (skin.mesh) skin.mesh.applyBoneTransform(i, v); v.applyMatrix4(world); v.toArray(pos, i * 3);
    q.fromBufferAttribute(N, i).applyMatrix3(nm).normalize().toArray(nor, i * 3);
    let a = U ? U.getX(i) : 0.5, b = U ? U.getY(i) : 0.5; a -= Math.floor(a); b -= Math.floor(b);
    uv[i * 2] = (cx + 1.5 + a * (cs - 3)) / W; uv[i * 2 + 1] = (cy + 1.5 + b * (cs - 3)) / H;
    c.copy(color);   // the models' own point colours are not used (most of a body never had them)
    col[i * 4] = Math.round(Math.min(1, c.r) * 255); col[i * 4 + 1] = Math.round(Math.min(1, c.g) * 255); col[i * 4 + 2] = Math.round(Math.min(1, c.b) * 255); col[i * 4 + 3] = 255;
    if (skin.paint) { const p = skin.paint(a, b); col[i * 4] = Math.round(Math.min(1, p.r) * 255); col[i * 4 + 1] = Math.round(Math.min(1, p.g) * 255); col[i * 4 + 2] = Math.round(Math.min(1, p.b) * 255); uv[i * 2] = (cx + cs / 2) / W; uv[i * 2 + 1] = (cy + cs / 2) / H; }
    if (skin.mesh) for (let k = 0; k < 4; k++) { si[i * 4 + k] = skin.map[geo.attributes.skinIndex.getComponent(i, k)]; sw[i * 4 + k] = geo.attributes.skinWeight.getComponent(i, k); }
    else { si[i * 4] = skin.bone; sw[i * 4] = 1; }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  g.setIndex(geo.index ? Array.from(geo.index.array) : [...Array(n).keys()]);
  return g;
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

async function unit(type) {
  const spec = SPEC[type], body = (await load(spec.body)).scene;
  body.updateMatrixWorld(true);
  const skinned = []; body.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); });
  const bones = skinned[0].skeleton.bones, index = new Map(bones.map((b, i) => [b.name, i])), bone = name => { if (!index.has(name)) throw new Error(type + ': no bone ' + name); return index.get(name); };
  const white = new THREE.Color(1, 1, 1), tint = new THREE.Color(spec.tint || 0xffffff), hairColor = new THREE.Color(spec.hairColor || 0x3a2a1c), groups = { body: [], head: [], hair: [], gear: [] };
  let off = 0; const v = new THREE.Vector3(), r = new THREE.Vector3();
  for (const o of skinned) {
    if ((spec.hide || []).some(h => o.name.includes(h))) continue;
    o.skeleton.update();
    for (let i = 0; i < o.geometry.attributes.position.count; i += 37) { v.fromBufferAttribute(o.geometry.attributes.position, i); r.copy(v); o.applyBoneTransform(i, v); off = Math.max(off, v.distanceTo(r)); }
    groups.body.push(piece(o.geometry, o.matrixWorld, cellOf(o.material), o.material.name.includes('Regular') ? white : tint, { mesh: o, map: o.skeleton.bones.map(b => bone(b.name)) }));
  }
  for (const [list, names] of [['head', [spec.head]], ['hair', spec.hair || []]]) for (const name of names) {
    const s = (await load(name)).scene; s.updateMatrixWorld(true);
    s.traverse(o => { if (o.isMesh) groups[list].push(piece(o.geometry, o.matrixWorld, cellOf(o.material), o.material.name.includes('Hair') ? hairColor : white, { bone: bone('Head') })); });
  }
  let crown = 0; for (const g of groups.head) { g.computeBoundingBox(); crown = Math.max(crown, g.boundingBox.max.y); }
  for (const kind of spec.gear.filter(k => WORN[k])) {
    const [boneName, from, off, rot] = WORN[kind], b = bones[bone(boneName)], item = makeGear(kind), at = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
    if (from === 'top') at.y = crown;
    item.position.copy(at).add(new THREE.Vector3(...off)); item.rotation.set(...rot); item.updateWorldMatrix(true, true);
    item.traverse(o => { if (o.isMesh) groups.gear.push(piece(o.geometry, o.matrixWorld, CELL.white, o.userData.flat, { bone: bone(boneName) })); });
  }
  for (const kind of spec.gear.filter(k => !WORN[k])) {
    const [boneName, pos, rot] = HOLD[kind], b = bones[bone(boneName)], item = makeGear(kind);
    item.position.set(...pos); item.rotation.set(...rot); b.add(item); item.updateWorldMatrix(true, true);
    item.traverse(o => { if (o.isMesh) groups.gear.push(piece(o.geometry, o.matrixWorld, CELL.white, o.userData.flat, { bone: bone(boneName) })); });
    b.remove(item);
  }
  const count = g => g.index.count / 3, parts = [], was = {}, now = {};
  for (const [k, list] of Object.entries(groups)) { if (!list.length) continue; const m = mergeGeometries(list); was[k] = count(m); const t = TRIS[k] ? thin(m, k === 'hair' ? TRIS.hair * list.length : k === 'body' && !FIRST.has(type) ? LATER : TRIS[k]) : m; now[k] = count(t); parts.push(t); }
  const geo = mergeGeometries(parts);
  // bound again as it stands at rest, the mesh at the origin: a figure's bones can then live outside the scene
  const root = new THREE.Group(); root.name = type;
  const arm = bones[0].parent && !bones[0].parent.isBone ? bones[0].parent : bones[0]; let top = arm; while (top.parent && top.parent !== body) top = top.parent;
  for (const o of skinned) o.removeFromParent();
  root.add(top); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  geo.computeBoundingBox();
  const glb = await exportGlb(root);
  files[type + '.glb'] = b64(glb);
  say(type, 'triangles', JSON.stringify(was), '->', JSON.stringify(now), '=', count(geo), 'points', geo.attributes.position.count, 'tall', geo.boundingBox.max.y.toFixed(2), 'rest off bind', off.toExponential(1), Math.round(glb.byteLength / 1024) + ' KB');
  return { root, top };
}

// A creature: one whole model made one mesh of the same kind as a person's (the shared picture, thinned, bound as it stands at rest), with its own bones and its own few clips in its own file.
async function creature(type) {
  const spec = CRE[type], src = await load(spec.file), scene = src.scene;
  scene.updateMatrixWorld(true);
  const skinned = [], loose = []; scene.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); else if (o.isMesh) loose.push(o); });
  const bones = skinned[0].skeleton.bones, index = new Map(bones.map((b, i) => [b, i])), tint = new THREE.Color(spec.tint || 0xffffff), list = [];
  const colorOf = m => (m.map ? tint.clone() : tint.clone().multiply(m.color)), fn = PAINT[spec.paint], paints = new Map();
  const how = (m, skin) => { if (fn && m.map) { if (!paints.has(m.map)) { const px = pixels(m.map.image); paints.set(m.map, (a, b) => fn(px(a, b))); } skin.paint = paints.get(m.map); return [CELL.white, tint, skin]; } return [cellOf(m), colorOf(m), skin]; };
  for (const o of skinned) { o.skeleton.update(); list.push(piece(o.geometry, o.matrixWorld, ...how(o.material, { mesh: o, map: o.skeleton.bones.map(b => index.get(b)) }))); }
  for (const o of loose) { let b = o.parent; while (b && !index.has(b)) b = b.parent; say('  ' + type + ': ' + o.name + ' is carried by ' + (b ? b.name : 'no bone')); list.push(piece(o.geometry, o.matrixWorld, ...how(o.material, { bone: b ? index.get(b) : 0 }))); }
  const merged = mergeGeometries(list), was = merged.index.count / 3, geo = thin(merged, Math.min(was, spec.tris));
  geo.computeBoundingBox();
  const k = spec.tall / geo.boundingBox.max.y; geo.scale(k, k, k);
  let top = bones[0]; while (top.parent && top.parent !== scene) top = top.parent;
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.scale.setScalar(k);
  for (const o of [...skinned, ...loose]) o.removeFromParent();
  rig.add(top); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  const out = [];
  for (const [name, from] of Object.entries(spec.clips)) {
    const c = from.map(n => src.animations.find(a => a.name === n)).find(Boolean); if (!c) throw new Error(type + ': no clip for ' + name + ' among ' + src.animations.map(a => a.name).join(' '));
    const tracks = c.tracks.filter(t => {
      if (t.name.endsWith('.scale')) return false;
      if (t.name.endsWith('.position')) { let span = 0; for (let i = 3; i < t.values.length; i++) span = Math.max(span, Math.abs(t.values[i] - t.values[i % 3])); return span > 1e-4; }
      return true;
    });
    out.push(new THREE.AnimationClip(name, c.duration, tracks).optimize());
  }
  geo.computeBoundingBox();
  const glb = await exportGlb(root, out);
  files[type + '.glb'] = b64(glb);
  say(type, 'triangles', was, '->', geo.index.count / 3, 'points', geo.attributes.position.count, 'from', geo.boundingBox.min.y.toFixed(2), 'to', geo.boundingBox.max.y.toFixed(2), 'wide', (geo.boundingBox.max.x - geo.boundingBox.min.x).toFixed(2), 'clips', out.map(c => c.name + ' ' + c.duration.toFixed(1) + 's').join(', '), Math.round(glb.byteLength / 1024) + ' KB');
}

async function clips(root) {
  const src = (await load('animations')).animations, out = [];
  for (const name of CLIPS) {
    const c = src.find(a => a.name === name); if (!c) throw new Error('no clip ' + name);
    const tracks = c.tracks.filter(t => {
      if (t.name.endsWith('.scale')) return false;
      if (t.name.endsWith('.position')) { let span = 0; for (let i = 3; i < t.values.length; i++) span = Math.max(span, Math.abs(t.values[i] - t.values[i % 3])); return span > 1e-4; }   // a bone that never leaves its place keeps the body's own
      return true;
    });
    const k = new THREE.AnimationClip(name, c.duration, tracks).optimize(); out.push(k);
  }
  const glb = await exportGlb(root, out);
  files['anim.glb'] = b64(glb);
  say('clips', out.map(c => c.name + ' ' + c.tracks.length).join(', '), Math.round(glb.byteLength / 1024) + ' KB');
}

window.bake = async () => {
  await MeshoptSimplifier.ready;
  let last;
  for (const type of Object.keys(SPEC)) last = await unit(type);
  const bare = new THREE.Group(); bare.add(last.top); await clips(bare);
  for (const type of Object.keys(CRE)) await creature(type);
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  return { files, log };
};
