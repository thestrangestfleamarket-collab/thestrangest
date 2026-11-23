// SKIRMISH TABLE's dragon whelp, the part that runs in a browser (tools/chess-whelp.cjs): the Darwin Museum's scanned green iguana (CC0) taken off its board, thinned, and its skin baked from the scan's own photographs into one small picture
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';

const WELD = +(new URLSearchParams(location.search).get('weld') || 1.2), TRIS = 6000, PIC = 512, LIFT = +(new URLSearchParams(location.search).get('lift') || 6);   // triangles kept; the picture's side; how far above the board (the scan's own units, millimetres) a point must be to be the animal's
const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

window.cut = async () => {
  await MeshoptSimplifier.ready; const log = [];
  const g = await new GLTFLoader().loadAsync('/scan.glb'); g.scene.updateMatrixWorld(true);
  const meshes = []; g.scene.traverse(o => { if (o.isMesh) meshes.push(o); });
  let n = 0, t = 0; for (const m of meshes) { n += m.geometry.attributes.position.count; t += m.geometry.index.count; }
  const P = new Float32Array(n * 3), C = new Uint8Array(n * 3), I = new Uint32Array(t), v = new THREE.Vector3(); let vo = 0, io = 0;
  for (const m of meshes) {
    const A = m.geometry.attributes.position, U = m.geometry.attributes.uv, im = m.material.map.image, c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const k = c.getContext('2d', { willReadFrequently: true }); k.drawImage(im, 0, 0); const px = k.getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < A.count; i++) { v.fromBufferAttribute(A, i).applyMatrix4(m.matrixWorld).toArray(P, (vo + i) * 3);
      const x = Math.min(c.width - 1, Math.max(0, Math.floor((U.getX(i) % 1 + 1) % 1 * c.width))), y = Math.min(c.height - 1, Math.max(0, Math.floor((U.getY(i) % 1 + 1) % 1 * c.height))), o = (y * c.width + x) * 4; C[(vo + i) * 3] = px[o]; C[(vo + i) * 3 + 1] = px[o + 1]; C[(vo + i) * 3 + 2] = px[o + 2]; }
    const ix = m.geometry.index.array; for (let i = 0; i < ix.length; i++) I[io + i] = ix[i] + vo; vo += A.count; io += ix.length;
  }
  log.push('the scan: ' + n + ' points, ' + t / 3 + ' triangles');
  // the board it stands on: the plane most of the scan's points lie on (tried from many threes of points, then fitted)
  const pt = i => new THREE.Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]), some = []; for (let i = 0; i < n; i += Math.ceil(n / 30000)) some.push(pt(i));
  let best = null, most = 0, seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let k = 0; k < 400; k++) { const a = some[Math.floor(rnd() * some.length)], b = some[Math.floor(rnd() * some.length)], c = some[Math.floor(rnd() * some.length)], nn = b.clone().sub(a).cross(c.clone().sub(a)); if (nn.length() < 1e-3) continue; nn.normalize(); if (nn.y < 0) nn.negate();
    const d = nn.dot(a); let cnt = 0; for (const q of some) if (Math.abs(nn.dot(q) - d) < 3) cnt++; if (cnt > most) { most = cnt; best = [nn, d]; } }
  const [N, D] = best, h = i => N.x * P[i * 3] + N.y * P[i * 3 + 1] + N.z * P[i * 3 + 2] - D;
  log.push('the board: normal ' + N.toArray().map(x => x.toFixed(3)) + ', ' + (100 * most / some.length).toFixed(0) + '% of the points on it');
  // the animal: what stands clear of the board, its largest joined piece (points at one place are one point)
  const key = new Map(), to = new Uint32Array(n); for (let i = 0; i < n; i++) { const kk = Math.round(P[i * 3] / WELD) + ',' + Math.round(P[i * 3 + 1] / WELD) + ',' + Math.round(P[i * 3 + 2] / WELD); if (key.has(kk)) to[i] = key.get(kk); else { key.set(kk, i); to[i] = i; } }
  const up = new Uint8Array(n); for (let i = 0; i < n; i++) up[i] = h(i) > LIFT ? 1 : 0;
  const par = new Uint32Array(n).map((_, i) => i), find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }, keepT = [];
  for (let i = 0; i < t; i += 3) { const a = to[I[i]], b = to[I[i + 1]], c = to[I[i + 2]]; if (up[I[i]] && up[I[i + 1]] && up[I[i + 2]]) { keepT.push(i); par[find(a)] = find(b); par[find(b)] = find(c); } }
  const size = new Map(); for (const i of keepT) { const r = find(to[I[i]]); size.set(r, (size.get(r) || 0) + 1); }
  const main = [...size].sort((a, b) => b[1] - a[1])[0][0], whole = keepT.filter(i => find(to[I[i]]) === main);
  // as it will stand: the board's top the ground, its length along z, metres. The scan has the animal's forefeet on a log: everything low under its chest (the log, and its forelegs below the elbow) is left out, and what then hangs loose
  const Q = new THREE.Quaternion().setFromUnitVectors(N, new THREE.Vector3(0, 1, 0)), bb = new THREE.Box3(); for (const i of whole) for (let k = 0; k < 3; k++) bb.expandByPoint(pt(I[i + k]).applyQuaternion(Q));
  const turn = bb.max.x - bb.min.x > bb.max.z - bb.min.z, mid = bb.getCenter(new THREE.Vector3()), fin = q => { q.applyQuaternion(Q).sub(mid); q.y += mid.y - bb.min.y; if (turn) q.set(q.z, q.y, -q.x); return q.multiplyScalar(0.001); };
  const [LZ, LY] = (new URLSearchParams(location.search).get('log') || '0.33,0.135').split(',').map(Number), par2 = new Uint32Array(n).map((_, i) => i), find2 = a => { while (par2[a] !== a) { par2[a] = par2[par2[a]]; a = par2[a]; } return a; }, kept = [];
  for (const i of whole) { const c = fin(pt(I[i]).add(pt(I[i + 1])).add(pt(I[i + 2])).multiplyScalar(1 / 3)); if (c.z > LZ && c.y < LY) continue; kept.push(i); par2[find2(to[I[i]])] = find2(to[I[i + 1]]); par2[find2(to[I[i + 1]])] = find2(to[I[i + 2]]); }
  const size2 = new Map(); for (const i of kept) { const r = find2(to[I[i]]); size2.set(r, (size2.get(r) || 0) + 1); }
  const main2 = [...size2].sort((a, b) => b[1] - a[1])[0][0], tri = kept.filter(i => find2(to[I[i]]) === main2);
  log.push('clear of the board: ' + keepT.length + ' triangles in ' + size.size + ' pieces; the largest, ' + whole.length + '; without the log, ' + tri.length);
  // thinned (its places only; its skin is baked again below)
  const idx = new Uint32Array(tri.length * 3); tri.forEach((i, k) => { idx[k * 3] = to[I[i]]; idx[k * 3 + 1] = to[I[i + 1]]; idx[k * 3 + 2] = to[I[i + 2]]; });
  const [first] = MeshoptSimplifier.simplify(idx, P, 3, TRIS * 3, 0.5, ['Permissive']), [out] = first.length > TRIS * 3.3 ? MeshoptSimplifier.simplifySloppy(first, P, 3, null, TRIS * 3, 0.5) : [first];   // the scan is torn where it left the board: what the careful thinning cannot reach, the coarse one does
  log.push('thinned to ' + out.length / 3);
  // the scan's own points, to find the colour nearest any place (only the animal's)
  const CELLS = 5, grid = new Map(), gk = (x, y, z) => x + ',' + y + ',' + z, mine = new Uint8Array(n); for (const i of tri) for (let k = 0; k < 3; k++) mine[I[i + k]] = 1;
  for (let i = 0; i < n; i++) if (mine[i]) { const kk = gk(Math.floor(P[i * 3] / CELLS), Math.floor(P[i * 3 + 1] / CELLS), Math.floor(P[i * 3 + 2] / CELLS)); let a = grid.get(kk); if (!a) grid.set(kk, a = []); a.push(i); }
  const colourAt = (x, y, z) => { const cx = Math.floor(x / CELLS), cy = Math.floor(y / CELLS), cz = Math.floor(z / CELLS); let bi = -1, bd = 1e18;
    for (let r = 1; r <= 4 && bi < 0; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) for (let c = -r; c <= r; c++) { const list = grid.get(gk(cx + a, cy + b, cz + c)); if (list) for (const i of list) { const d = (P[i * 3] - x) ** 2 + (P[i * 3 + 1] - y) ** 2 + (P[i * 3 + 2] - z) ** 2; if (d < bd) { bd = d; bi = i; } } }
    return bi; };
  // a new picture: each triangle seen from the side it faces most (above, below, its two flanks), the four views one above another
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const i of out) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i * 3 + k]); hi[k] = Math.max(hi[k], P[i * 3 + k]); }
  const ext = [0, 1, 2].map(k => hi[k] - lo[k]), long = ext[0] > ext[2] ? 0 : 2, side = long === 0 ? 2 : 0, L = ext[long], rows = [ext[side], ext[1], ext[1], ext[side] * 0.5], s = Math.min(PIC / L, PIC / rows.reduce((a, b) => a + b + 6 / (PIC / L), 0)) * 0.985;
  const row0 = []; { let y = 2; for (const r of rows) { row0.push(y); y += r * s * (r === rows[3] ? 1 : 1) + 4; } }
  const pos = [], uv = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nn = new THREE.Vector3(), canvas = document.createElement('canvas'); canvas.width = canvas.height = PIC;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }), img = ctx.createImageData(PIC, PIC), filled = new Uint8Array(PIC * PIC);
  for (let i = 0; i < out.length; i += 3) {
    a.fromArray(P, out[i] * 3); b.fromArray(P, out[i + 1] * 3); c.fromArray(P, out[i + 2] * 3); nn.copy(b).sub(a).cross(v.copy(c).sub(a));
    const ny = Math.abs(nn.y), ns = Math.abs(nn.getComponent(side)), chart = ny >= ns ? (nn.y > 0 ? 0 : 3) : (nn.getComponent(side) > 0 ? 1 : 2), k = chart === 3 ? 0.5 : 1;
    const U = q => [1 + (q.getComponent(long) - lo[long]) * s * (chart === 3 ? 0.5 : 1), row0[chart] + ((chart === 0 || chart === 3) ? (q.getComponent(side) - lo[side]) * s * k : (hi[1] - q.y) * s)], ua = U(a), ub = U(b), uc = U(c);
    pos.push(...a.toArray(), ...b.toArray(), ...c.toArray()); uv.push(ua[0] / PIC, ua[1] / PIC, ub[0] / PIC, ub[1] / PIC, uc[0] / PIC, uc[1] / PIC);
    const x0 = Math.max(0, Math.floor(Math.min(ua[0], ub[0], uc[0]) - 1)), x1 = Math.min(PIC - 1, Math.ceil(Math.max(ua[0], ub[0], uc[0]) + 1)), y0 = Math.max(0, Math.floor(Math.min(ua[1], ub[1], uc[1]) - 1)), y1 = Math.min(PIC - 1, Math.ceil(Math.max(ua[1], ub[1], uc[1]) + 1));
    const den = (ub[1] - uc[1]) * (ua[0] - uc[0]) + (uc[0] - ub[0]) * (ua[1] - uc[1]); if (Math.abs(den) < 1e-9) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const px = x + 0.5, py = y + 0.5; let w0 = ((ub[1] - uc[1]) * (px - uc[0]) + (uc[0] - ub[0]) * (py - uc[1])) / den, w1 = ((uc[1] - ua[1]) * (px - uc[0]) + (ua[0] - uc[0]) * (py - uc[1])) / den, w2 = 1 - w0 - w1;
      if (w0 < -0.35 || w1 < -0.35 || w2 < -0.35) continue; const inside = w0 >= 0 && w1 >= 0 && w2 >= 0, o = y * PIC + x; if (filled[o] === 2 || (filled[o] === 1 && !inside)) continue;
      w0 = Math.max(0, w0); w1 = Math.max(0, w1); w2 = Math.max(0, w2); const sum = w0 + w1 + w2, j = colourAt((a.x * w0 + b.x * w1 + c.x * w2) / sum, (a.y * w0 + b.y * w1 + c.y * w2) / sum, (a.z * w0 + b.z * w1 + c.z * w2) / sum); if (j < 0) continue;
      img.data[o * 4] = C[j * 3]; img.data[o * 4 + 1] = C[j * 3 + 1]; img.data[o * 4 + 2] = C[j * 3 + 2]; img.data[o * 4 + 3] = 255; filled[o] = inside ? 2 : 1; }
  }
  for (let pass = 0; pass < 6; pass++) { const add = []; for (let y = 0; y < PIC; y++) for (let x = 0; x < PIC; x++) { const o = y * PIC + x; if (filled[o]) continue; let r = 0, gg = 0, bb = 0, m = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= PIC || Y >= PIC) continue; const j = Y * PIC + X; if (filled[j]) { r += img.data[j * 4]; gg += img.data[j * 4 + 1]; bb += img.data[j * 4 + 2]; m++; } } if (m) add.push([o, r / m, gg / m, bb / m]); }
    for (const [o, r, gg, bb] of add) { filled[o] = 1; img.data[o * 4] = r; img.data[o * 4 + 1] = gg; img.data[o * 4 + 2] = bb; img.data[o * 4 + 3] = 255; } }
  ctx.fillStyle = '#5a6048'; ctx.fillRect(0, 0, PIC, PIC); const tmp = document.createElement('canvas'); tmp.width = tmp.height = PIC; tmp.getContext('2d').putImageData(img, 0, 0); ctx.drawImage(tmp, 0, 0);
  // stood on the ground as the board lay, its length along z
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  { const A = geo.attributes.position; for (let i = 0; i < A.count; i++) { fin(v.fromBufferAttribute(A, i)); A.setXYZ(i, v.x, v.y, v.z); } }
  geo.computeVertexNormals(); geo.computeBoundingBox(); log.push('it measures ' + geo.boundingBox.getSize(new THREE.Vector3()).toArray().map(x => x.toFixed(3)).join(' by ') + ' m');
  const mesh = new THREE.Mesh(mergeVertices(geo), new THREE.MeshBasicMaterial()); mesh.name = 'iguana';
  const glb = await new Promise((res, rej) => new GLTFExporter().parse(mesh, res, rej, { binary: true }));
  return { glb: b64(glb), jpg: canvas.toDataURL('image/jpeg', 0.9).split(',')[1], log };
};
