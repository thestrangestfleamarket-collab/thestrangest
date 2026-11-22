// SKIRMISH TABLE's plain board: stone tiles in a wooden frame with a brazier of embers at each corner, one mesh under one picture painted once (its light, its shade and its glow are in the picture; nothing on it is lit or moves)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PX = 96, EDGE = 0.35, DEEP = 0.34;   // the picture's dots to a tile; the frame's width; the slab's depth
// a tile's mark: its fill and its rim, soft and steady
const MARK = { sel: ['rgba(226,190,116,0.42)', 'rgba(236,206,140,0.7)'], hit: ['rgba(204,104,92,0.36)', 'rgba(214,122,108,0.66)'], heal: ['rgba(112,186,140,0.34)', 'rgba(132,200,158,0.62)'], move: ['rgba(112,150,206,0.3)', 'rgba(134,168,216,0.58)'] };
const rnd = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const picture = (canvas, renderer) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
const glowDot = (c, x, y, r, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };

// the board's picture: the frame, the tiles and the dark between them, then the light on it all
function paint(cols, rows) {
  const W = Math.round((cols + 2 * EDGE) * PX), H = Math.round((rows + 2 * EDGE) * PX), canvas = document.createElement('canvas'), R = rnd(7);
  canvas.width = W; canvas.height = H + 64;
  const c = canvas.getContext('2d'), e = EDGE * PX;
  c.fillStyle = '#5b4333'; c.fillRect(0, 0, W, H + 64);
  for (let i = 0; i < 90; i++) { c.fillStyle = R() < 0.5 ? 'rgba(30,18,10,0.06)' : 'rgba(255,220,180,0.035)'; c.fillRect(0, R() * (H + 64), W, 3 + R() * 9); }
  c.fillStyle = '#2f2b28'; c.fillRect(e - 3, e - 3, W - 2 * e + 6, H - 2 * e + 6);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = e + (x + 0.025) * PX, py = e + (y + 0.025) * PX, s = 0.95 * PX, k = ((x + y) % 2 ? 151 : 108) * (0.96 + R() * 0.08);
    c.fillStyle = `rgb(${k | 0},${k * 0.97 | 0},${k * 0.92 | 0})`; c.fillRect(px, py, s, s);
    for (const [x0, y0, x1, y1, w, h] of [[px, py, px, py + 9, s, 9], [px, py + s, px, py + s - 9, s, -9], [px, py, px + 9, py, 9, s], [px + s, py, px + s - 9, py, -9, s]]) {   // each tile sinks a little at its edges
      const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(20,16,14,0.3)'); g.addColorStop(1, 'rgba(20,16,14,0)'); c.fillStyle = g; c.fillRect(Math.min(x0, x0 + w), Math.min(y0, y0 + h), Math.abs(w), Math.abs(h)); }
  }
  c.save(); c.beginPath(); c.rect(e, e, W - 2 * e, H - 2 * e); c.clip();
  for (let i = 0; i < 260; i++) glowDot(c, R() * W, R() * H, 24 + R() * 60, R() < 0.5 ? '40,34,30' : '226,214,196', 0.05);   // the stone's own soft patches
  c.restore();
  for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) glowDot(c, x, y, 4.6 * PX, '255,170,96', 0.22);                    // the embers' warmth, strongest at the corners
  { const g = c.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(10,8,8,0)'); g.addColorStop(1, 'rgba(10,8,8,0.3)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(8,8,12,0.1)'); g.addColorStop(1, 'rgba(255,236,210,0.05)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const g = c.createLinearGradient(0, H, 0, H + 64); g.addColorStop(0, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = g; c.fillRect(0, H, W, 64); }   // the slab's sides, darker towards the table
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
const SUN = new THREE.Vector3(8, 9, 1).normalize(), WHITE = [1, 1, 1];

export function makeBoard(map, { id, renderer }) {
  const { cols, rows } = map, group = new THREE.Group(), w = cols + 2 * EDGE, d = rows + 2 * EDGE;
  const { canvas, W, H } = paint(cols, rows), tex = picture(canvas, renderer), TH = H + 64, swatch = () => [(W - 14) / W, 1 - (H + 46) / TH];
  const parts = [part(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), v => [(v.x + w / 2) / w, 1 - (v.z + d / 2) / d * H / TH], () => WHITE)];
  for (const [len, ry, x, z] of [[w, 0, 0, d / 2], [w, Math.PI, 0, -d / 2], [d, Math.PI / 2, w / 2, 0], [d, -Math.PI / 2, -w / 2, 0]])
    parts.push(part(new THREE.PlaneGeometry(len, DEEP).rotateY(ry).translate(x, -DEEP / 2, z), (v, n, U, i) => [0.02 + U.getX(i) * 0.9, 1 - (H + 2 + (1 - U.getY(i)) * 60) / TH], () => WHITE));
  const fires = [], glow = [];
  const iron = (v, n) => { const k = 0.5 + 0.7 * Math.max(0, n.dot(SUN)), t = THREE.MathUtils.smoothstep(v.y, 0.7, 1.05); return [0.03 * k + 0.1 * t, 0.03 * k + 0.035 * t, 0.036 * k + 0.008 * t]; };
  for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) {
    const x = sx * (cols / 2 + 0.75), z = sz * (rows / 2 + 0.75);
    parts.push(part(new THREE.CylinderGeometry(0.07, 0.1, 1.0, 8).translate(x, 0.4, z), swatch, iron), part(new THREE.CylinderGeometry(0.24, 0.12, 0.16, 12).translate(x, 0.95, z), swatch, iron),
      part(new THREE.CircleGeometry(0.21, 12).rotateX(-Math.PI / 2).translate(x, 1.032, z), swatch, v => { const r = Math.hypot(v.x - x, v.z - z) / 0.21; return [0.9 - 0.4 * r, 0.26 - 0.18 * r, 0.05 - 0.04 * r]; }));
    fires.push(new THREE.Vector3(x, 1.2, z));
    glow.push(new THREE.PlaneGeometry(1.1, 1.1).translate(x, 1.22, z), new THREE.PlaneGeometry(1.1, 1.1).rotateY(Math.PI / 2).translate(x, 1.22, z), new THREE.PlaneGeometry(1.2, 1.2).rotateX(-Math.PI / 2).translate(x, 1.06, z));
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
  group.add(slab, halo, pick, sheet);
  return {
    id, group, pick, fires, cols, rows, border: EDGE, marks, sheet, halo, slab, get aimed() { return aimed; },
    yAt: () => 0,
    clear() { marks.clear(); },
    mark(x, y, kind) { marks.set(y * cols + x, kind); },
    flush,
    aim(x, y) { const a = x == null ? null : y * cols + x; if (a !== aimed) { aimed = a; flush(); } },   // the tile a controller points at
    dispose() { group.removeFromParent(); slab.geometry.dispose(); halo.geometry.dispose(); tex.dispose(); mtex.dispose(); },
  };
}

// The round table under the board, on a screen only (in the headset your own table is there): one disc, its wood, the board's shade and the embers' warmth painted once.
export function makeTable(map, renderer) {
  const S = 1024, RAD = 17, canvas = document.createElement('canvas'), R = rnd(23), u = S / (2 * RAD), mid = S / 2;
  canvas.width = canvas.height = S;
  const c = canvas.getContext('2d');
  c.fillStyle = '#4a3528'; c.fillRect(0, 0, S, S);
  for (let i = 0; i < 160; i++) { c.fillStyle = R() < 0.5 ? 'rgba(24,14,8,0.07)' : 'rgba(255,214,170,0.03)'; c.fillRect(0, R() * S, S, 2 + R() * 10); }
  for (let y = 0; y < S; y += 2.3 * u) { c.fillStyle = 'rgba(20,12,8,0.2)'; c.fillRect(0, y, S, 3); }
  const w = (map.cols + 2 * EDGE) * u, d = (map.rows + 2 * EDGE) * u;
  c.save(); c.shadowColor = 'rgba(0,0,0,0.75)'; c.shadowBlur = 1.3 * u; c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(mid - w / 2, mid - d / 2, w, d); c.restore();
  for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) { const x = mid + sx * (map.cols / 2 + 0.75) * u, y = mid + sz * (map.rows / 2 + 0.75) * u; glowDot(c, x, y, 4.4 * u, '255,168,92', 0.3); glowDot(c, x, y, 0.5 * u, '0,0,0', 0.6); }
  { const g = c.createRadialGradient(mid, mid, 6.5 * u, mid, mid, 16.6 * u); g.addColorStop(0, 'rgba(13,13,16,0)'); g.addColorStop(0.55, 'rgba(13,13,16,0.72)'); g.addColorStop(1, 'rgba(13,13,16,1)'); c.fillStyle = g; c.fillRect(0, 0, S, S); }
  const table = new THREE.Mesh(new THREE.CircleGeometry(RAD, 48).rotateX(-Math.PI / 2).translate(0, -DEEP - 0.01, 0), new THREE.MeshBasicMaterial({ map: picture(canvas, renderer) }));
  table.raycast = () => {}; table.matrixAutoUpdate = false;
  return table;
}
