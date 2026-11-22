// SKIRMISH TABLE's bake, the part that runs in a browser (tools/chess-bake.cjs): each unit type as one thinned skinned mesh on one shared picture, and the clips it plays
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';

// Quaternius CC0: Modular Character Outfits - Fantasy (bodies), Universal Base Characters (heads, hair). Weapons are simple shapes made here.
const SPEC = {
  bulwark:   { body: 'Male_Ranger', hide: ['Head_Hood'], head: 'Male_Head', hair: ['Hair_Buzzed'], hairColor: 0x2a2018, tint: 0x8f98a8, gear: ['sword', 'shield'] },
  lancer:    { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_SimpleParted', 'Hair_Beard'], hairColor: 0x8a3a1a, tint: 0xb0705a, gear: ['greataxe'] },
  strider:   { body: 'Female_Ranger', head: 'Female_Head', tint: 0x4c5060, gear: ['dagger'] },
  slinger:   { body: 'Male_Ranger', head: 'Male_Head', gear: ['crossbow'] },
  ember:     { body: 'Male_Peasant', head: 'Male_Head', hair: ['Hair_Long', 'Hair_Beard'], hairColor: 0xb8b4ac, tint: 0xc04a36, gear: ['staff'] },
  mender:    { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Long'], hairColor: 0xc8a25a, tint: 0xf2efe6, gear: [] },
  hexbinder: { body: 'Female_Peasant', head: 'Female_Head', hair: ['Hair_Buns'], hairColor: 0x1c1a22, tint: 0x7d55c0, gear: ['wand'] },
};
const TRIS = { body: 1700, head: 380, hair: 200 };   // what each part of a figure is thinned to
const CLIPS = ['Sword_Idle', 'Sword_Attack', 'Idle_Loop', 'Punch_Cross', 'Pistol_Shoot', 'Spell_Simple_Shoot', 'Walk_Loop', 'Hit_Chest', 'Death01'];
// the one picture every figure is drawn from: [x, y, size] of each material's own picture in it
const W = 1024, H = 512, CELL = { MI_Peasant: [0, 0, 256], MI_Ranger: [256, 0, 256], MI_Superhero_Male: [512, 0, 256], MI_Superhero_Female: [768, 0, 256], MI_Hair_1: [0, 256, 256], MI_Hair_2: [256, 256, 256],
  MI_Regular_Male: [512, 256, 128], MI_Regular_Female: [640, 256, 128], MI_Eyes: [512, 384, 128], white: [640, 384, 128] };

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
  }
  return g;
}
// How each item sits on its bone: [bone, position, rotation (Euler XYZ)].
const HOLD = { sword: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], dagger: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], greataxe: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], staff: ['hand_l', [0, 0.09, 0.03], [Math.PI, 0, 0]],
  wand: ['hand_r', [0, 0.09, 0.03], [Math.PI, 0, 0]], crossbow: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]], shield: ['lowerarm_l', [0, 0.14, -0.07], [Math.PI / 2, 0, 0]] };

const log = [], say = (...a) => log.push(a.join(' '));
export const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const files = {}, loader = new GLTFLoader(), raw = {};
const load = async name => { raw[name] = raw[name] || await (await fetch('/full/' + name + '.glb')).arrayBuffer(); return loader.parseAsync(raw[name].slice(0), ''); };

const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d'); ctx.fillStyle = '#777'; ctx.fillRect(0, 0, W, H);
{ const [x, y, s] = CELL.white; ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s, s); }
const drawn = new Set();
function cellOf(m) {
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
  for (const kind of spec.gear) {
    const [boneName, pos, rot] = HOLD[kind], b = bones[bone(boneName)], item = makeGear(kind);
    item.position.set(...pos); item.rotation.set(...rot); b.add(item); item.updateWorldMatrix(true, true);
    item.traverse(o => { if (o.isMesh) groups.gear.push(piece(o.geometry, o.matrixWorld, CELL.white, o.userData.flat, { bone: bone(boneName) })); });
    b.remove(item);
  }
  const count = g => g.index.count / 3, parts = [], was = {}, now = {};
  for (const [k, list] of Object.entries(groups)) { if (!list.length) continue; const m = mergeGeometries(list); was[k] = count(m); const t = TRIS[k] ? thin(m, k === 'hair' ? TRIS.hair * list.length : TRIS[k]) : m; now[k] = count(t); parts.push(t); }
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
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  return { files, log };
};
