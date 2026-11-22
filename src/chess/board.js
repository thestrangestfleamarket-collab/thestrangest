// SKIRMISH TABLE's board: worn flagstones in a stone kerb, one mesh under one picture painted once from a photographed stone (its light, its shade, the lava's glow at its rim and the embers' at its corners are in the picture; nothing on it is lit or moves)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PX = 96, EDGE = 0.35, DEEP = 0.34;   // the picture's dots to a tile; the frame's width; the slab's depth
// a tile's mark: its fill and its rim, soft and steady
const MARK = { sel: ['rgba(226,190,116,0.42)', 'rgba(236,206,140,0.7)'], hit: ['rgba(204,104,92,0.36)', 'rgba(214,122,108,0.66)'], heal: ['rgba(112,186,140,0.34)', 'rgba(132,200,158,0.62)'], move: ['rgba(112,150,206,0.3)', 'rgba(134,168,216,0.58)'] };
// the photographed stone the tiles are cut from and the cavern floor under the table (data/chess/dungeon/, Poly Haven, CC0); a board made before they arrive is painted again when they do
const PICS = {}, waiting = new Set();
for (const k of ['flag', 'floor']) { const i = new Image(); i.onload = () => { PICS[k] = i; for (const f of waiting) f(k); }; i.src = `/chess-assets/dungeon/${k}.jpg`; }
const rnd = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const picture = (canvas, renderer) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
const glowDot = (c, x, y, r, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };

// the board's picture: the frame, the tiles and the dark between them, then the light on it all
function paint(cols, rows, canvas = document.createElement('canvas')) {
  const W = Math.round((cols + 2 * EDGE) * PX), H = Math.round((rows + 2 * EDGE) * PX), R = rnd(7), stone = PICS.flag;
  canvas.width = W; canvas.height = H + 64;
  const c = canvas.getContext('2d'), e = EDGE * PX;
  c.fillStyle = '#57514b'; c.fillRect(0, 0, W, H + 64);
  if (stone) { for (let y = 0; y < H + 64; y += 256) for (let x = 0; x < W; x += 256) c.drawImage(stone, x, y, 256, 256); c.fillStyle = 'rgba(20,18,17,0.66)'; c.fillRect(0, 0, W, H + 64); }   // the kerb and the slab's sides: the same stone, darker
  c.fillStyle = '#211e1c'; c.fillRect(e - 3, e - 3, W - 2 * e + 6, H - 2 * e + 6);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = e + (x + 0.025) * PX, py = e + (y + 0.025) * PX, s = 0.95 * PX, light = (x + y) % 2, k = (light ? 151 : 108) * (0.96 + R() * 0.08);
    if (stone) { const q = 150, sx = R() * (stone.width - q), sy = R() * (stone.height - q); c.drawImage(stone, sx, sy, q, q, px, py, s, s); c.fillStyle = light ? `rgba(236,226,208,${0.18 + R() * 0.06})` : `rgba(18,16,15,${0.46 + R() * 0.07})`; c.fillRect(px, py, s, s); }   // each tile its own piece of the stone, then light or dark
    else { c.fillStyle = `rgb(${k | 0},${k * 0.97 | 0},${k * 0.92 | 0})`; c.fillRect(px, py, s, s); }
    for (const [x0, y0, x1, y1, w, h] of [[px, py, px, py + 9, s, 9], [px, py + s, px, py + s - 9, s, -9], [px, py, px + 9, py, 9, s], [px + s, py, px + s - 9, py, -9, s]]) {   // each tile sinks a little at its edges
      const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(14,11,10,0.42)'); g.addColorStop(1, 'rgba(14,11,10,0)'); c.fillStyle = g; c.fillRect(Math.min(x0, x0 + w), Math.min(y0, y0 + h), Math.abs(w), Math.abs(h)); }
  }
  for (const [x0, y0, x1, y1] of [[0, 0, 0, 1.3 * PX], [0, H, 0, H - 1.3 * PX], [0, 0, 1.3 * PX, 0], [W, 0, W - 1.3 * PX, 0]]) {   // the lava's glow, in from the moat on every side
    const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(255,120,48,0.13)'); g.addColorStop(0.3, 'rgba(255,120,48,0.08)'); g.addColorStop(1, 'rgba(255,120,48,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) glowDot(c, x, y, 3.2 * PX, '255,170,96', 0.16);                    // the embers' warmth at the corners
  { const g = c.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(10,8,8,0)'); g.addColorStop(1, 'rgba(10,8,8,0.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(8,8,12,0.1)'); g.addColorStop(1, 'rgba(255,236,210,0.05)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, H, 0, H + 64); g.addColorStop(0, 'rgba(255,110,40,0.12)'); g.addColorStop(1, 'rgba(255,110,40,0.5)'); c.fillStyle = g; c.fillRect(0, H, W, 64); }   // the slab's sides, lit from the lava below
  c.fillStyle = '#fff'; c.fillRect(W - 24, H + 36, 20, 20);
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
  const { canvas, W, H } = paint(cols, rows), tex = picture(canvas, renderer), TH = H + 64;
  const parts = [part(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), v => [(v.x + w / 2) / w, 1 - (v.z + d / 2) / d * H / TH], () => WHITE)];
  for (const [len, ry, x, z] of [[w, 0, 0, d / 2], [w, Math.PI, 0, -d / 2], [d, Math.PI / 2, w / 2, 0], [d, -Math.PI / 2, -w / 2, 0]])
    parts.push(part(new THREE.PlaneGeometry(len, DEEP).rotateY(ry).translate(x, -DEEP / 2, z), (v, n, U, i) => [0.02 + U.getX(i) * 0.9, 1 - (H + 2 + (1 - U.getY(i)) * 60) / TH], () => WHITE));
  const fires = [], glow = [];
  for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) {   // the four pits of embers on the dungeon's bank (dungeon.js): their still glow in the air
    const x = sx * (cols / 2 + 1.48), z = sz * (rows / 2 + 1.28);
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
  const again = k => { if (k === 'flag') { paint(cols, rows, canvas); tex.needsUpdate = true; } };
  waiting.add(again);
  group.add(slab, halo, pick, sheet);
  return {
    id, group, pick, fires, cols, rows, border: EDGE, marks, sheet, halo, slab, get aimed() { return aimed; },
    yAt: () => 0,
    clear() { marks.clear(); },
    mark(x, y, kind) { marks.set(y * cols + x, kind); },
    flush,
    aim(x, y) { const a = x == null ? null : y * cols + x; if (a !== aimed) { aimed = a; flush(); } },   // the tile a controller points at
    dispose() { waiting.delete(again); group.removeFromParent(); slab.geometry.dispose(); halo.geometry.dispose(); tex.dispose(); mtex.dispose(); },
  };
}

// The cavern's floor under it all, on a screen only (in the headset your own table is there): one disc, the photographed rock, the lava's and the embers' warmth and the dark beyond painted once.
export function makeTable(map, renderer) {
  const S = 1024, RAD = 17, canvas = document.createElement('canvas'), u = S / (2 * RAD), mid = S / 2, tex = picture(canvas, renderer);
  canvas.width = canvas.height = S;
  const draw = () => { const c = canvas.getContext('2d');
    c.fillStyle = '#2b2927'; c.fillRect(0, 0, S, S);
    if (PICS.floor) { for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 128) c.drawImage(PICS.floor, x, y, 128, 128); c.fillStyle = 'rgba(12,11,12,0.6)'; c.fillRect(0, 0, S, S); }
    glowDot(c, mid, mid, 11.5 * u, '255,128,60', 0.2);
    { const g = c.createRadialGradient(mid, mid, 8 * u, mid, mid, 16.6 * u); g.addColorStop(0, 'rgba(13,13,16,0)'); g.addColorStop(0.5, 'rgba(13,13,16,0.75)'); g.addColorStop(1, 'rgba(13,13,16,1)'); c.fillStyle = g; c.fillRect(0, 0, S, S); }
    tex.needsUpdate = true; };
  draw();
  const again = k => { if (k === 'floor') draw(); }; waiting.add(again);
  const table = new THREE.Mesh(new THREE.CircleGeometry(RAD, 48).rotateX(-Math.PI / 2).translate(0, -DEEP - 0.01, 0), new THREE.MeshBasicMaterial({ map: tex }));
  table.raycast = () => {}; table.matrixAutoUpdate = false; table.userData.free = () => waiting.delete(again);
  return table;
}
