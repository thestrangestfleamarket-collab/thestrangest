// SKIRMISH TABLE's jungle, the place round a table whose map asks for it (maps.js look.place 'jungle') instead of the hall: a sunken temple the forest has taken back. Real trees (HULL DOWN's willow, beech and elm, copied by the build), mossy rocks, a stone plinth, a broken colonnade down each side and a stepped tomb, undergrowth and vines, a far wall of forest in haze, shafts of light. All of it still and unlit, its light in each point's colour; nothing tall stands before a seat.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const JHAZE = 0x8a9c80;                     // the forest's far air
const A = '/chess-assets/', GROUND = -0.34, L = new THREE.Vector3(0.45, 0.8, 0.3).normalize();
const rnd = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const KINDS = ['willow', 'beech', 'elm'];
// where the trees stand: never in the way from a seat to the table (the seats are at the two ends, z)
const clear = (x, z) => Math.abs(x) < 6.6 && Math.abs(z) < 16;

export function makeJungle(renderer) {
  const group = new THREE.Group(), Q = rnd(11), haze = new THREE.Color(JHAZE), an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const still = o => { o.raycast = () => {}; o.matrixAutoUpdate = false; o.frustumCulled = false; group.add(o); return o; };
  const pic = (f, wrap) => { const t = new THREE.TextureLoader().load(A + f); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an; if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // a copy of a shape set in its place, its light and the far air in each point's colour; `uv` lays a tiled picture over it by where it is
  const v = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color();
  const bake = (geo, m, tint, { uv = 0, low = 0, top = 1 } = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    g.applyMatrix4(m); const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, col = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i);
      const d = Math.hypot(v.x, v.z), h = Math.min(0.78, Math.max(0, (d - 11) / 42)), k = (0.5 + 0.5 * Math.max(0, n.dot(L))) * (low ? Math.min(1, low + (1 - low) * (v.y - GROUND) / top) : 1);
      c.setRGB(tint[0] * k, tint[1] * k, tint[2] * k).lerp(haze, h); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      if (uv) { if (Math.abs(n.y) > 0.5) U.setXY(i, v.x / uv, v.z / uv); else U.setXY(i, (v.x + v.z) / uv, v.y / uv); } }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
  const at = (x, y, z, ry = 0, s = 1, rx = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0)), new THREE.Vector3(s, s, s));

  // the forest floor, out to the haze
  { const g = new THREE.RingGeometry(0.01, 62, 56, 16).rotateX(-Math.PI / 2);
    still(new THREE.Mesh(bake(g, at(0, GROUND, 0), [0.4, 0.47, 0.33], { uv: 3.5 }), new THREE.MeshBasicMaterial({ map: pic('board/forest.jpg', true), vertexColors: true }))); }

  // the stone: the table's plinth and its step, a colonnade down each side with a lintel left, fallen drums, the stepped tomb with its dark door
  const stone = [], pillars = [], mossy = () => { const k = 0.78 + Q() * 0.2, g = Q() * 0.12; return [k * (0.98 - g), k, k * (0.9 - g)]; };
  const block = (w, h, d, x, y, z, ry = 0, rx = 0) => stone.push(bake(new THREE.BoxGeometry(w, h, d), at(x, y, z, ry, 1, rx), mossy(), { uv: 2.2, low: 0.55, top: 3 }));
  block(12.2, 0.2, 14.2, 0, -0.24, 0); block(13.8, 0.14, 15.8, 0, -0.3, 0);
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const x = sx * 8.1, z = -7 + i * 3.5, h = [4.6, 1.3, 3.1, 4.6, 0.8][(i + (sx > 0 ? 2 : 0)) % 5];
    stone.push(bake(new THREE.CylinderGeometry(0.42, 0.48, h, 12), at(x, GROUND + h / 2, z), mossy(), { uv: 1.6, low: 0.5, top: 4 })); block(1.25, 0.3, 1.25, x, GROUND + 0.15, z); pillars.push([x, z, h]);
    if (h > 4) block(1.15, 0.34, 1.15, x, GROUND + h + 0.17, z); else stone.push(bake(new THREE.CylinderGeometry(0.42, 0.42, 1.1 + Q(), 12), at(x + sx * (1.3 + Q()), GROUND + 0.4, z + Q() - 0.5, Q() * 3, 1, Math.PI / 2), mossy(), { uv: 1.6 })); }
  block(1.1, 0.5, 4.6, -8.1, GROUND + 4.6 + 0.59, -5.25); block(1.1, 0.5, 4.6, 8.1, GROUND + 4.6 + 0.59, 1.75);
  for (let i = 0; i < 16; i++) { const a = Q() * 6.283, r = 9.5 + Q() * 8, x = Math.sin(a) * r, z = Math.cos(a) * r, s = 0.4 + Q() * 0.7; if (!clear(x, z)) block(s * 1.5, s, s, x, GROUND + s * 0.3, z, Q() * 3, (Q() - 0.5) * 0.5); }
  for (const [w, d, y] of [[7, 10, 0], [5.4, 8, 1.3], [3.8, 6, 2.6], [2.2, 4, 3.9]]) block(w, 1.3, d, -15, GROUND + y + 0.65, 0);
  stone.push(bake(new THREE.PlaneGeometry(1.5, 2.3).rotateY(Math.PI / 2), at(-11.48, GROUND + 1.15, 0), [0.05, 0.05, 0.04]));
  for (const z of [-1.05, 1.05]) block(0.5, 2.5, 0.5, -11.3, GROUND + 1.25, z); block(0.6, 0.5, 3, -11.3, GROUND + 2.7, 0);
  still(new THREE.Mesh(mergeGeometries(stone), new THREE.MeshBasicMaterial({ map: pic('board/wall.jpg', true), vertexColors: true })));

  // leaves on cards, cut from the dungeon's leaf picture: undergrowth thick on the ground, vines up the pillars and the tomb, the far trees
  { const cards = [], IVY = [[15, 525, 255, 770], [275, 530, 480, 755], [545, 535, 730, 755], [795, 530, 1025, 760]], TREE = [[1315, 0, 1650, 260], [1735, 0, 2048, 260], [1315, 270, 1650, 520], [1725, 270, 2040, 520]];
    const card = ([x0, y0, x1, y1], w, h, m, tint) => { const g = new THREE.PlaneGeometry(w, h), U = g.attributes.uv; for (let i = 0; i < U.count; i++) U.setXY(i, (x0 + U.getX(i) * (x1 - x0)) / 2048, 1 - (y1 - U.getY(i) * (y1 - y0)) / 1024);
      const b = bake(g, m, tint), C = b.attributes.color, N = b.attributes.normal; for (let i = 0; i < C.count; i++) { const k = 1 / (0.5 + 0.5 * Math.max(0, n.fromBufferAttribute(N, i).dot(L))); c.fromBufferAttribute(C, i); C.setXYZ(i, Math.min(1, c.r * k * 0.8), Math.min(1, c.g * k * 0.8), Math.min(1, c.b * k * 0.8)); } cards.push(b); };
    const leaf = () => { const k = 0.5 + Q() * 0.45; return [k * 0.78, k, k * 0.62]; };
    for (let i = 0; i < 1500; i++) { const a = Q() * 6.283, r = 7 + Q() * Q() * 20, x = Math.sin(a) * r * 0.95, z = Math.cos(a) * r * 1.1, s = 0.5 + Q() * 0.9; if (Math.abs(x) < 7 && Math.abs(z) < 8) continue;
      card(IVY[Q() * 4 | 0], s, s, at(x, GROUND + 0.08 + Q() * 0.7, z, Q() * 6, 1, -Math.PI / 2 + (Q() - 0.5) * 1.8), leaf()); }
    for (const [x, z, h] of pillars) for (let i = 0; i < 3 + h * 2.5; i++) { const a = Q() * 6.283; card(IVY[Q() * 4 | 0], 0.8, 0.8, at(x + Math.sin(a) * 0.5, GROUND + 0.3 + Q() * h, z + Math.cos(a) * 0.5, a, 1, (Q() - 0.5) * 0.4), leaf()); }
    for (let i = 0; i < 60; i++) card(IVY[Q() * 4 | 0], 1.3, 1.3, at(-11.4 - Q() * 6, GROUND + 0.6 + Q() * 4.6, (Q() - 0.5) * 9.5, Math.PI / 2 + (Q() - 0.5), 1, (Q() - 0.5) * 1.6), leaf());
    for (let i = 0; i < 70; i++) { const a = i / 70 * 6.283 + Q() * 0.08, r = 26 + Q() * 26, h = 12 + Q() * 9, x = Math.sin(a) * r, z = Math.cos(a) * r; card(TREE[Q() * 4 | 0], h * 1.25, h, at(x, GROUND + h / 2 - 0.4, z, a + Math.PI), [0.55, 0.72, 0.42]); }
    still(new THREE.Mesh(mergeGeometries(cards), new THREE.MeshBasicMaterial({ map: pic('dungeon/leaf.webp'), vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }))); }

  // the far wall of forest: trunks and gloom below, haze, pale light where the canopy thins
  { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256), R = rnd(5);
    g.addColorStop(0, '#b4c2a0'); g.addColorStop(0.35, '#8a9c80'); g.addColorStop(0.62, '#5d7058'); g.addColorStop(1, '#2c3a2a'); x.fillStyle = g; x.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 150; i++) { const px = R() * 1024, w = 2 + R() * 9, a = 0.05 + R() * 0.16; x.fillStyle = `rgba(28,38,26,${a})`; x.fillRect(px, 30 + R() * 60, w, 226); x.fillRect(px - 1024, 30, w, 226); }
    for (let i = 0; i < 260; i++) { const px = R() * 1024, py = R() * 150, r = 14 + R() * 40; const q = x.createRadialGradient(px, py, 0, px, py, r); q.addColorStop(0, `rgba(52,74,44,${0.1 + R() * 0.14})`); q.addColorStop(1, 'rgba(52,74,44,0)'); x.fillStyle = q; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
    still(new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 50, 48, 1, true).translate(0, GROUND + 24, 0), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide }))); }

  // shafts of light down through the canopy at the sides: faint, still
  { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 128);
    x.globalCompositeOperation = 'destination-in'; const f = x.createLinearGradient(0, 0, 0, 128); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = f; x.fillRect(0, 0, 64, 128);
    const rays = []; for (const [px, pz, w] of [[-10.5, -4, 2.4], [-12, 3, 3], [10, -6, 2.8], [11.5, 2, 2.2], [9.5, 7, 3], [-9.5, 8.5, 2.2]]) for (const ry of [0, 1.2]) rays.push(new THREE.PlaneGeometry(w, 17).rotateY(ry).rotateZ(0.32).translate(px + 2.6, GROUND + 8, pz));
    const m = still(new THREE.Mesh(mergeGeometries(rays), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color: 0xe8ecc0, transparent: true, opacity: 0.085, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))); m.renderOrder = 5; }

  // the real trees and the rocks, when their files come: a ring close round the temple (whole on a screen, thinned in the headset) and one further out (thinned, on a screen only)
  const near = [], far = [], hi = new THREE.Group(), lo = new THREE.Group(), deep = new THREE.Group(); group.add(hi, lo, deep); lo.visible = false;
  for (let i = 0, guard = 0; near.length < 9 && guard < 400; guard++) { const a = (near.length + Q() * 0.7) / 9 * 6.283, r = 10 + Q() * 3.5, x = Math.sin(a) * r, z = Math.cos(a) * r * 1.25; if (clear(x, z) || (x < -9.5 && Math.abs(z) < 6)) continue; near.push([x, z, 11 + Q() * 5, Q() * 6.283, i++ % 3]); }
  for (let i = 0; i < 7; i++) { const a = (i + 0.5 + Q() * 0.5) / 7 * 6.283, r = 18 + Q() * 6; far.push([Math.sin(a) * r, Math.cos(a) * r, 13 + Q() * 6, Q() * 6.283, i % 3]); }
  const load = f => new Promise((ok, no) => new GLTFLoader().load(A + 'jungle/' + f + '.glb', ok, undefined, no));
  const ready = Promise.all([...KINDS.map(k => load('tree_' + k)), ...KINDS.map(k => load('tree_' + k + '_lo')), load('rocks')]).then(all => {
    const parts = s => { const out = []; s.scene.traverse(o => { if (o.isMesh) out.push(o); }); return out; }, rocks = parts(all[6])[0];
    for (let k = 0; k < 3; k++) { const whole = parts(all[k]), thin = parts(all[k + 3]);
      whole.forEach((src, p) => { const leaves = src.material.alphaTest > 0 || src.material.transparent, mat = new THREE.MeshBasicMaterial({ map: src.material.map, vertexColors: true, alphaTest: leaves ? Math.max(0.3, src.material.alphaTest || 0.3) : 0, side: leaves ? THREE.DoubleSide : THREE.FrontSide });
        const set = (list, from, to) => { const gs = list.filter(t => t[4] === k).map(([x, z, h, ry]) => bake(from.geometry, at(x, GROUND - 0.1, z, ry, h / 0.93), leaves ? [0.62 + Q() * 0.2, 0.86 + Q() * 0.14, 0.5] : [0.8, 0.76, 0.68], { low: leaves ? 0.45 : 0.6, top: h })); if (gs.length) { const m = still(new THREE.Mesh(mergeGeometries(gs), mat)); to.add(m); } };
        set(near, src, hi); if (thin[p]) { set(near, thin[p], lo); set(far, thin[p], deep); } }); }
    const rs = []; for (const [x, z, s, ry] of [[9.8, -9.5, 0.8, 1], [-9.6, 9.8, 0.9, 4], [11.5, 9, 0.6, 2.5]]) rs.push(bake(rocks.geometry, at(x, GROUND - 0.05, z, ry, s), [0.82, 0.86, 0.74], { low: 0.6, top: 1.2 }));
    still(new THREE.Mesh(mergeGeometries(rs), new THREE.MeshBasicMaterial({ map: rocks.material.map, vertexColors: true })));
  }).catch(err => console.warn('The jungle\'s trees did not load', err));

  return { group, ready, hi, lo, haze: JHAZE, quality(xr) { hi.visible = deep.visible = !xr; lo.visible = xr; } };
}
