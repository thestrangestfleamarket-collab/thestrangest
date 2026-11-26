// SKIRMISH TABLE's board: a tabletop battlefield in a stone kerb, one mesh under one picture painted once from photographed grounds (grass, dirt, stone, water, lava), a faint grid and no chequer; a map's ground is painted into it and what stands on it (rocks, walls, pillars, brush) is in the same mesh (its light and shade are in the picture; nothing on it is lit or moves)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PX = 96, EDGE = 0.35, DEEP = 0.34, SW = 240;   // the picture's dots to a tile; the frame's width; the slab's depth; a swatch for what stands on the board
// a tile's mark: its fill and its rim, soft and steady
const MARK = { sel: ['rgba(226,190,116,0.42)', 'rgba(236,206,140,0.7)'], hit: ['rgba(204,104,92,0.36)', 'rgba(214,122,108,0.66)'], heal: ['rgba(112,186,140,0.34)', 'rgba(132,200,158,0.62)'], move: ['rgba(112,150,206,0.3)', 'rgba(134,168,216,0.58)'] };
// the photographed grounds the table is painted from (data/chess/, Poly Haven and ambientCG, CC0); a board made before they arrive is painted again when they do
const PICS = {}, waiting = new Set(); let soon = 0;
for (const [k, f] of Object.entries({ flag: 'dungeon/flag', lava: 'dungeon/lava', grass: 'board/grass', dirt: 'board/dirt', forest: 'board/forest', rock: 'board/rock', bed: 'board/bed', wall: 'board/wall', scorch: 'board/scorch' })) {
  const i = new Image(); i.onload = () => { PICS[k] = i; clearTimeout(soon); soon = setTimeout(() => { for (const f of waiting) f(); }, 250); }; i.src = `/chess-assets/${f}.jpg`; }
const FLAT = { flag: '#6f6a63', lava: '#a8481c', grass: '#58683a', dirt: '#6e5a42', forest: '#4a4a30', rock: '#77736c', bed: '#5c5a4c', wall: '#7a746a', scorch: '#3a322c' };
const rnd = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const picture = (canvas, renderer) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
const glowDot = (c, x, y, r, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
const spread = (c, k, x, y, w, h, size = 256) => { const p = PICS[k]; if (!p) { c.fillStyle = FLAT[k]; c.fillRect(x, y, w, h); return; } for (let j = y; j < y + h; j += size) for (let i = x; i < x + w; i += size) c.drawImage(p, i, j, size, size); };
// the ground each letter of a map's tiles lies on (maps.js TERRAIN), over the map's own bare ground (look.base)
const LAY = [['d', 'dirt'], ['rpx', 'dirt'], ['kv', 'scorch'], ['fmjt', 'forest'], ['b', 'flag'], ['sw', 'bed'], ['l', 'lava']];

// the table's picture: a tabletop battlefield of real ground with a faint grid, no chequer. The frame, the bare ground, each ground laid over it with soft edges, what is painted on a tile, the grid, then the light on it all; under it the swatches for what stands on the board
function paint(map, canvas = document.createElement('canvas')) {
  const { cols, rows } = map, tiles = map.tiles || Array(rows).fill('.'.repeat(cols)), base = (map.look && map.look.base) || 'grass';
  const W = Math.round((cols + 2 * EDGE) * PX), H = Math.round((rows + 2 * EDGE) * PX), R = rnd(7), e = EDGE * PX, bw = cols * PX, bh = rows * PX;
  canvas.width = W; canvas.height = H + 64 + SW;
  const c = canvas.getContext('2d'), at = (x, y) => (tiles[y] && tiles[y][x]) || '';
  const each = (ks, f) => { for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (ks.includes(tiles[y][x])) f(e + x * PX, e + y * PX, x, y); };
  const clip = (px, py, f, m = 0) => { c.save(); c.beginPath(); c.rect(px + m, py + m, PX - 2 * m, PX - 2 * m); c.clip(); f(); c.restore(); };
  const rim = (px, py, x, y, same, col, wide) => { for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (!same.includes(at(x + dx, y + dy) || '-')) {   // the drop at an edge where the ground changes
    const x0 = px + (dx > 0 ? PX : 0), y0 = py + (dy > 0 ? PX : 0), g = c.createLinearGradient(x0, y0, x0 - dx * wide, y0 - dy * wide); g.addColorStop(0, `rgba(${col})`); g.addColorStop(1, `rgba(${col.replace(/[\d.]+$/, '0')})`);
    c.fillStyle = g; c.fillRect(dx ? Math.min(x0, x0 - dx * wide) : px, dy ? Math.min(y0, y0 - dy * wide) : py, dx ? wide : PX, dy ? wide : PX); } };
  // the kerb and the slab's sides: stone, dark
  c.fillStyle = '#57514b'; c.fillRect(0, 0, W, H + 64); spread(c, 'flag', 0, 0, W, H + 64); c.fillStyle = 'rgba(20,18,17,0.66)'; c.fillRect(0, 0, W, H + 64);
  c.fillStyle = '#211e1c'; c.fillRect(e - 3, e - 3, bw + 6, bh + 6);
  // the bare ground
  c.save(); c.beginPath(); c.rect(e, e, bw, bh); c.clip();
  if (base === 'flag') { for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const px = e + x * PX + 1.5, py = e + y * PX + 1.5, s = PX - 3, st = PICS.flag;   // flagstones: each tile its own piece of the stone
      if (st) c.drawImage(st, R() * (st.width - 150), R() * (st.height - 150), 150, 150, px, py, s, s); else { c.fillStyle = FLAT.flag; c.fillRect(px, py, s, s); }
      c.fillStyle = `rgba(18,16,15,${0.16 + R() * 0.14})`; c.fillRect(px, py, s, s); } }
  else { spread(c, base, e, e, bw, bh); c.fillStyle = 'rgba(52,96,26,0.26)'; c.fillRect(e, e, bw, bh); }
  // each ground over it, its edges soft and uneven
  const mc = document.createElement('canvas'); mc.width = W; mc.height = H; const m = mc.getContext('2d'), Q = rnd(31);
  const lay = (cells, k, soft) => { if (!cells.length) return; m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.filter = `blur(${soft}px)`; m.fillStyle = '#000';
    for (const [x, y, r] of cells) { if (r) { m.beginPath(); m.ellipse(x, y, r, r * 0.7, Q() * 3, 0, 7); m.fill(); } else m.fillRect(x - 2, y - 2, PX + 4, PX + 4); }
    m.filter = 'none'; m.globalCompositeOperation = 'source-atop'; spread(m, k, 0, 0, W, H); c.drawImage(mc, 0, 0); };
  if (base === 'grass') { const worn = []; for (let i = 0; i < cols * rows / 7; i++) worn.push([e + Q() * bw, e + Q() * bh, 16 + Q() * 30]); lay(worn, 'dirt', 12); }   // bare patches in the grass
  else { const moss = []; for (let i = 0; i < cols * rows / 6 * ((map.look && map.look.grow) || 1); i++) moss.push([e + Q() * bw, e + Q() * bh, 12 + Q() * 26]); lay(moss, 'grass', 10); }                      // grass through the flagstones
  for (const [ks, k] of LAY) { const cells = []; each(ks, (px, py) => cells.push([px, py])); lay(cells, k, 'swl'.includes(ks[0]) ? 3 : 'rpx'.includes(ks[0]) ? 16 : 8); }
  c.restore();
  // what is painted on a tile
  each('jt', (px, py) => { glowDot(c, px + PX / 2, py + PX / 2, 0.75 * PX, '8,26,6', 0.55); });
  each('kv', (px, py) => { c.fillStyle = 'rgba(22,13,9,0.5)'; c.fillRect(px, py, PX, PX); });
  each('v', (px, py) => { const cx = px + PX / 2, cy = py + PX / 2, r = 0.2 * PX;
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#0c0a09'; c.fill(); c.clip(); c.strokeStyle = 'rgba(96,90,84,0.95)'; c.lineWidth = 3;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(cx + i * 8, cy - r); c.lineTo(cx + i * 8, cy + r); c.stroke(); } c.restore();
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.strokeStyle = 'rgba(104,97,90,0.95)'; c.lineWidth = 4; c.stroke();
    glowDot(c, cx, cy, 0.62 * PX, '214,214,208', 0.2); });
  each('m', (px, py) => clip(px, py, () => { for (let i = 0; i < 6; i++) { const x = px + 14 + Q() * (PX - 28), y = py + 14 + Q() * (PX - 28), r = 5 + Q() * 6;
    glowDot(c, x - 3, y + 3, r * 1.7, '10,12,8', 0.55);
    const g = c.createRadialGradient(x + r * 0.25, y - r * 0.25, 0, x, y, r); g.addColorStop(0, 'rgb(198,180,142)'); g.addColorStop(1, 'rgb(118,96,70)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } }, 2));
  each('sw', (px, py, x, y) => clip(px, py, () => { c.fillStyle = at(x, y) === 'w' ? 'rgba(16,44,58,0.8)' : 'rgba(30,72,84,0.5)'; c.fillRect(px, py, PX, PX); rim(px, py, x, y, 'swb', '6,14,16,0.55', 12);
    c.strokeStyle = 'rgba(176,208,208,0.16)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(px + Q() * PX, py + Q() * PX, 10 + Q() * 16, 4 + Q() * 6, 0, Q() * 3, 3 + Q() * 3); c.stroke(); } }));
  each('l', (px, py, x, y) => clip(px, py, () => { c.fillStyle = 'rgba(40,12,4,0.18)'; c.fillRect(px, py, PX, PX); rim(px, py, x, y, 'lb', '10,6,5,0.8', 14); }));
  each('b', (px, py, x, y) => { for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if ('lsw'.includes(at(x + dx, y + dy) || '-')) { const k = 9, bx = dx > 0 ? px + PX - k : px, by = dy > 0 ? py + PX - k : py;
    c.fillStyle = 'rgb(112,104,95)'; c.fillRect(bx, by, dx ? k : PX, dy ? k : PX); c.fillStyle = 'rgba(12,10,9,0.5)'; c.fillRect(dx ? (dx > 0 ? bx - 3 : bx + k) : px, dy ? (dy > 0 ? by - 3 : by + k) : py, dx ? 3 : PX, dy ? 3 : PX); } });
  each('rpxft', (px, py, x, y) => { const cx = px + PX / 2, cy = py + PX / 2; if (at(x, y) === 'f') { for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) glowDot(c, cx + sx * 0.33 * PX - 5, cy + sy * 0.33 * PX + 3, 0.24 * PX, '8,10,6', 0.55); return; }   // the shade under what stands there
    glowDot(c, cx - 0.2 * PX, cy + 0.08 * PX, 0.62 * PX, '8,6,6', 0.6); glowDot(c, cx, cy, 0.52 * PX, '8,6,6', 0.5); });
  // the grid: a faint line between tiles, as on a battle mat
  c.strokeStyle = 'rgba(16,15,11,0.3)'; c.lineWidth = 1.5; c.beginPath();
  for (let x = 1; x < cols; x++) { c.moveTo(e + x * PX, e); c.lineTo(e + x * PX, e + bh); } for (let y = 1; y < rows; y++) { c.moveTo(e, e + y * PX); c.lineTo(e + bw, e + y * PX); } c.stroke();
  each('l', (px, py) => glowDot(c, px + PX / 2, py + PX / 2, 1.3 * PX, '255,120,48', 0.1));
  for (const [x0, y0, x1, y1] of [[0, 0, 0, 1.3 * PX], [0, H, 0, H - 1.3 * PX], [0, 0, 1.3 * PX, 0], [W, 0, W - 1.3 * PX, 0]]) {   // the lava's glow, in from the moat on every side
    const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(255,120,48,0.13)'); g.addColorStop(0.3, 'rgba(255,120,48,0.08)'); g.addColorStop(1, 'rgba(255,120,48,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) glowDot(c, x, y, 3.2 * PX, '255,170,96', 0.16);                    // the embers' warmth at the corners
  { const g = c.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(10,8,8,0)'); g.addColorStop(1, 'rgba(10,8,8,0.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(8,8,12,0.1)'); g.addColorStop(1, 'rgba(255,236,210,0.05)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, H, 0, H + 64); g.addColorStop(0, 'rgba(255,110,40,0.12)'); g.addColorStop(1, 'rgba(255,110,40,0.5)'); c.fillStyle = g; c.fillRect(0, H, W, 64); }   // the slab's sides, lit from the lava below
  c.fillStyle = '#fff'; c.fillRect(W - 24, H + 36, 20, 20);
  ['rock', 'wall', 'grass'].forEach((k, i) => { spread(c, k, i * SW, H + 64, SW, SW, SW); if (k === 'grass') { c.fillStyle = 'rgba(14,34,10,0.45)'; c.fillRect(i * SW, H + 64, SW, SW); } });   // the swatches: rock, masonry, leaf
  return { canvas, W, H };
}
// a part of the one mesh: its place in the picture and its own shade at each point
function part(geo, uvOf, colorOf) {
  const g = geo.toNonIndexed(), P = g.attributes.position, N = g.attributes.normal, uv = new Float32Array(P.count * 2), col = new Float32Array(P.count * 3), v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i); const [a, b] = uvOf(v, n, g.attributes.uv, i), k = colorOf(v, n); uv[i * 2] = a; uv[i * 2 + 1] = b; col[i * 3] = k[0]; col[i * 3 + 1] = k[1]; col[i * 3 + 2] = k[2]; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}
const WHITE = [1, 1, 1];

export function makeBoard(map, { id, renderer }) {
  const { cols, rows } = map, group = new THREE.Group(), w = cols + 2 * EDGE, d = rows + 2 * EDGE;
  const { canvas, W, H } = paint(map), tex = picture(canvas, renderer), TH = H + 64 + SW;
  const parts = [part(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), v => [(v.x + w / 2) / w, 1 - (v.z + d / 2) / d * H / TH], () => WHITE)];
  for (const [len, ry, x, z] of [[w, 0, 0, d / 2], [w, Math.PI, 0, -d / 2], [d, Math.PI / 2, w / 2, 0], [d, -Math.PI / 2, -w / 2, 0]])
    parts.push(part(new THREE.PlaneGeometry(len, DEEP).rotateY(ry).translate(x, -DEEP / 2, z), (v, n, U, i) => [0.02 + U.getX(i) * 0.9, 1 - (H + 2 + (1 - U.getY(i)) * 60) / TH], () => WHITE));
  // what stands on the board, as on a printed table: rocks, lengths of wall, broken pillars and low brush, all in the one mesh, each cut from its swatch and shaded here (nothing taller than a piece's waist)
  if (map.tiles) { const Q = rnd(53), L = new THREE.Vector3(0.5, 0.75, 0.35).normalize();
    const stand = (geo, sw, cx, cz, h, tint) => parts.push(part(geo, v => { const a = Math.min(0.95, Math.max(0.05, 0.5 + (v.x - cx) * 0.7 + v.y * 0.25)), b = Math.min(0.95, Math.max(0.05, 0.5 + (v.z - cz) * 0.7 - v.y * 0.4)); return [(sw * SW + a * SW) / W, 1 - (H + 64 + b * SW) / TH]; },
      (v, n) => { const k = (0.5 + 0.62 * Math.max(0, n.dot(L))) * (0.62 + 0.38 * Math.min(1, v.y / h)); return [k * tint[0], k * tint[1], k * tint[2]]; }));
    const lump = (r, sx, sy, sz, x, y, z) => { const g = new THREE.IcosahedronGeometry(r, 1), P = g.attributes.position, seen = new Map();
      for (let i = 0; i < P.count; i++) { const key = P.getX(i).toFixed(3) + P.getY(i).toFixed(3) + P.getZ(i).toFixed(3); if (!seen.has(key)) seen.set(key, 0.82 + Q() * 0.36); const k = seen.get(key); P.setXYZ(i, P.getX(i) * k * sx, P.getY(i) * k * sy, P.getZ(i) * k * sz); }
      g.computeVertexNormals(); return g.rotateY(Q() * 6).translate(x, y, z); };
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const t = map.tiles[y][x], cx = x - (cols - 1) / 2, cz = y - (rows - 1) / 2;
      if (t === 'p') { stand(new THREE.CylinderGeometry(0.3, 0.34, 0.62, 10).translate(cx, 0.31, cz), 1, cx, cz, 0.62, [1.05, 1.02, 0.98]); stand(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 10).translate(cx, 0.05, cz), 1, cx, cz, 0.3, [0.95, 0.92, 0.88]); }
      else if (t === 'x') { stand(new THREE.BoxGeometry(0.92, 0.4, 0.46).translate(cx, 0.2, cz), 1, cx, cz, 0.4, [1, 0.97, 0.93]); stand(new THREE.BoxGeometry(0.4, 0.22, 0.46).translate(cx - 0.2, 0.51, cz), 1, cx, cz, 0.62, [1, 0.97, 0.93]); stand(lump(0.13, 1, 0.7, 1, cx + 0.3, 0.05, cz + 0.34), 0, cx, cz, 0.2, [1, 1, 1]); }
      else if (t === 'r' || t === 'c') { stand(lump(0.4, 1, 0.75, 0.95, cx, 0.2, cz), 0, cx, cz, 0.5, [1, 1, 1]); stand(lump(0.17, 1, 0.8, 1, cx + 0.3, 0.07, cz + 0.28), 0, cx, cz, 0.2, [0.95, 0.95, 0.95]); }
      else if (t === 'f') for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const r = 0.13 + Q() * 0.05; stand(lump(r, 1, 0.9, 1, cx + sx * 0.34, r * 0.7, cz + sz * 0.34), 2, cx, cz, r * 1.6, [0.95, 1.1, 0.8]); } }
  }
  // growth, on a map that has it: undergrowth to stand waist-deep in, vines on what stands there, great trees down the two sides (never before a seat); cards cut from the dungeon's leaf picture, one more draw, still
  let growth = null;
  if (map.tiles && map.tiles.some(r => /[jt]/.test(r))) { const Q = rnd(71), cards = [], IVY = [[15, 525, 255, 770], [275, 530, 480, 755], [545, 535, 730, 755], [795, 530, 1025, 760]], TREE = [[1315, 0, 1650, 260], [1735, 0, 2048, 260], [1315, 270, 1650, 520], [1725, 270, 2040, 520]];
    const card = ([x0, y0, x1, y1], cw, ch, x, y, z, ry, rx, k) => { const g = new THREE.PlaneGeometry(cw, ch).toNonIndexed(), U = g.attributes.uv, col = new Float32Array(U.count * 3);
      for (let i = 0; i < U.count; i++) { U.setXY(i, (x0 + U.getX(i) * (x1 - x0)) / 2048, 1 - (y1 - U.getY(i) * (y1 - y0)) / 1024); col[i * 3] = k * 0.8; col[i * 3 + 1] = k; col[i * 3 + 2] = k * 0.7; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); cards.push(g.rotateX(rx).rotateY(ry).translate(x, y, z)); };
    const ivy = (x, y, z, size, ry, rx) => card(IVY[Q() * 4 | 0], size, size, x, y, z, ry, rx, 0.5 + Q() * 0.4);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const t = map.tiles[y][x], cx = x - (cols - 1) / 2, cz = y - (rows - 1) / 2;
      if (t === 'j' || t === 't') for (let i = 0; i < (t === 'j' ? 9 : 5); i++) ivy(cx + (Q() - 0.5) * 0.9, 0.05 + Q() * 0.24, cz + (Q() - 0.5) * 0.9, 0.42 + Q() * 0.3, Q() * 6, -Math.PI / 2 + (Q() - 0.5) * 0.9);
      if (t === 't') { const a = Q() * 3; for (const r of [0, Math.PI / 2]) card(TREE[Q() * 4 | 0], 1.9, 1.6, cx, 0.8, cz, a + r, 0, 0.85 + Q() * 0.2); }
      if (map.look && map.look.ivy && (t === 'p' || t === 'x')) for (let i = 0; i < 5; i++) { const a = Q() * 6.283, r = t === 'p' ? 0.36 : 0.3; ivy(cx + Math.sin(a) * r * (t === 'x' ? 1.4 : 1), 0.18 + Q() * 0.34, cz + Math.cos(a) * r, 0.4 + Q() * 0.2, a, (Q() - 0.5) * 0.5); } }
    const lt = new THREE.TextureLoader().load('/chess-assets/dungeon/leaf.webp'); lt.colorSpace = THREE.SRGBColorSpace;
    growth = new THREE.Mesh(mergeGeometries(cards), new THREE.MeshBasicMaterial({ map: lt, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    growth.raycast = () => {}; growth.matrixAutoUpdate = false; group.add(growth); }
  const fires = [], glow = [];
  for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) {   // the four pits of embers on the dungeon's bank (dungeon.js): their still glow in the air
    const x = sx * (Math.max(cols, 9) / 2 + 1.48), z = sz * (Math.max(rows, 11) / 2 + 1.28);
    fires.push(new THREE.Vector3(x, 0.5, z));
    glow.push(new THREE.PlaneGeometry(0.95, 0.95).translate(x, 0.5, z), new THREE.PlaneGeometry(0.95, 0.95).rotateY(Math.PI / 2).translate(x, 0.5, z), new THREE.PlaneGeometry(1.1, 1.1).rotateX(-Math.PI / 2).translate(x, 0.3, z));
  }
  const slab = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshBasicMaterial({ map: tex, vertexColors: true }));
  slab.raycast = () => {}; slab.matrixAutoUpdate = false;
  // the embers' glow: soft still light in the air above each bowl, one mesh
  const gc = document.createElement('canvas'); gc.width = gc.height = 64; glowDot(gc.getContext('2d'), 32, 32, 32, '255,255,255', 1);
  const halo = new THREE.Mesh(mergeGeometries(glow), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), color: 0xf08c44, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  halo.raycast = () => {}; halo.matrixAutoUpdate = false; halo.renderOrder = 6;
  // what a pointer finds: one unseen sheet, a tile two of its triangles
  const pick = new THREE.Mesh(new THREE.PlaneGeometry(cols, rows, cols, rows).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ visible: false }));
  pick.userData.pickFace = f => ({ kind: 'tile', x: (f >> 1) % cols, y: Math.floor((f >> 1) / cols) }); pick.matrixAutoUpdate = false;
  // the marks: one sheet over the tiles, its picture drawn again only when a mark changes
  const mc = document.createElement('canvas'), M = 32; mc.width = cols * M; mc.height = rows * M;
  const mx = mc.getContext('2d'), mtex = picture(mc, renderer), marks = new Map();
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(cols, rows).rotateX(-Math.PI / 2).translate(0, 0.006, 0), new THREE.MeshBasicMaterial({ map: mtex, transparent: true, depthWrite: false }));
  sheet.raycast = () => {}; sheet.matrixAutoUpdate = false; sheet.visible = false; sheet.renderOrder = 1;
  let aimed = null, drawnKey = '';
  const box = (x, y, fill, rim) => { const px = x * M + 2.5, py = y * M + 2.5, s = M - 5; mx.beginPath(); mx.roundRect(px, py, s, s, 4); if (fill) { mx.fillStyle = fill; mx.fill(); } mx.lineWidth = 2; mx.strokeStyle = rim; mx.stroke(); };
  const flush = () => {
    const key = [...marks].join(';') + '|' + aimed;
    if (key === drawnKey) return;
    drawnKey = key; mx.clearRect(0, 0, mc.width, mc.height);
    for (const [k, kind] of marks) box(k % cols, Math.floor(k / cols), ...MARK[kind]);
    if (aimed !== null) box(aimed % cols, Math.floor(aimed / cols), null, 'rgba(240,226,190,0.6)');
    mtex.needsUpdate = true; sheet.visible = marks.size > 0 || aimed !== null;
  };
  const again = () => { paint(map, canvas); tex.needsUpdate = true; };
  waiting.add(again);
  group.add(slab, halo, pick, sheet);
  return {
    id, group, pick, fires, cols, rows, border: EDGE, marks, sheet, halo, slab, get aimed() { return aimed; },
    yAt: () => 0,
    clear() { marks.clear(); },
    mark(x, y, kind) { marks.set(y * cols + x, kind); },
    flush,
    aim(x, y) { const a = x == null ? null : y * cols + x; if (a !== aimed) { aimed = a; flush(); } },   // the tile a controller points at
    dispose() { waiting.delete(again); group.removeFromParent(); slab.geometry.dispose(); halo.geometry.dispose(); if (growth) { growth.geometry.dispose(); growth.material.map.dispose(); growth.material.dispose(); } tex.dispose(); mtex.dispose(); },
  };
}
