// bakes Perdition's street things for THE LAST CHANCE: node tools/saloon-town-bake.cjs  ->  data/saloon/town.json. Polyfork's frontier-town kit (polyfork.dev, fetched into .polyfork/, never committed), each prop as flat triangles, 16-bit in its own box, a colour a corner.
const fs = require('fs'), { execFileSync } = require('child_process');
const PROPS = { stagecoach: 'stagecoach-94db88', buckboard: 'buckboard-wagon-59ec16', horse: 'saddled-horse-da86d3', tower: 'water-tower-on-a-dbc730', windmill: 'windmill-pump-2993a4', trough: 'plank-trough-baf3d5', hitch: 'hitching-rail-run-fc2f66', telegraph: 'telegraph-pole-line-95e382',
  saguaro: 'saguaro-cactus-6b27eb', sage: 'sagebrush-700b03', tumbleweed: 'tumbleweed-2caa1a', cottonwood: 'dead-cottonwood-edbde8', barrel: 'whiskey-barrel-7bb83f', lamp: 'street-oil-lamp-d246ea', corral: 'corral-fence-run-163ad7', freight: 'freight-crate-and-sack-f49cbb', wanted: 'wanted-poster-board-ccbeb1', saddle: 'saddle-on-a-rack-f034cd', rocker: 'porch-rocking-chair-89b2d7', barrow: 'ore-barrow-3e2464' };
const C = '.polyfork'; fs.mkdirSync(C, { recursive: true });
const get = (id) => { const f = `${C}/${id}.glb`; if (!fs.existsSync(f)) { execFileSync('curl', ['-sSf', '--retry', '4', '-A', 'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)', '-o', f + '.part', `https://polyfork.dev/cdn/${id}.glb`]); fs.renameSync(f + '.part', f); } return fs.readFileSync(f); };
const N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }, RD = { 5126: ['readFloatLE', 4, 1], 5123: ['readUInt16LE', 2, 65535], 5121: ['readUInt8', 1, 255], 5125: ['readUInt32LE', 4, 1] };
const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
const trs = (n) => { if (n.matrix) return n.matrix; const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], t = n.translation || [0, 0, 0];
  return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0, 2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0, 2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, t[0], t[1], t[2], 1]; };
function flat(b) {
  const jl = b.readUInt32LE(12), G = JSON.parse(b.slice(20, 20 + jl)), bin = b.slice(28 + jl), P = [], Cc = [];
  const acc = (i, norm) => { const a = G.accessors[i], v = G.bufferViews[a.bufferView], [fn, sz, mx] = RD[a.componentType], n = N[a.type], st = v.byteStride || sz * n, o = (v.byteOffset || 0) + (a.byteOffset || 0), out = [];
    for (let k = 0; k < a.count; k++) { const r = []; for (let c = 0; c < n; c++) r.push(bin[fn](o + k * st + c * sz) / (norm ? mx : 1)); out.push(r); } return out; };
  const walk = (ni, M) => { const n = G.nodes[ni], W = n.skin != null ? M : mul(M, trs(n));
    if (n.mesh != null) for (const p of G.meshes[n.mesh].primitives) { const pos = acc(p.attributes.POSITION), col = p.attributes.COLOR_0 != null ? acc(p.attributes.COLOR_0, true) : null, base = (G.materials?.[p.material]?.pbrMetallicRoughness?.baseColorFactor) || [1, 1, 1], idx = p.indices != null ? acc(p.indices).map((r) => r[0]) : pos.map((_, i) => i);
      for (const i of idx) { const [x, y, z] = pos[i]; P.push(W[0] * x + W[4] * y + W[8] * z + W[12], W[1] * x + W[5] * y + W[9] * z + W[13], W[2] * x + W[6] * y + W[10] * z + W[14]); const c = col ? col[i] : [1, 1, 1]; for (let a = 0; a < 3; a++) Cc.push(Math.round(255 * Math.pow(Math.min(1, Math.max(0, c[a] * base[a])), 1 / 2.2))); } }
    for (const c of n.children || []) walk(c, W); };
  for (const r of G.scenes[G.scene || 0].nodes) walk(r, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i++) { lo[i % 3] = Math.min(lo[i % 3], P[i]); hi[i % 3] = Math.max(hi[i % 3], P[i]); }
  const q = new Int16Array(P.length); for (let i = 0; i < P.length; i++) { const a = i % 3; q[i] = Math.round((P[i] - lo[a]) / Math.max(1e-9, hi[a] - lo[a]) * 65535) - 32768; }
  return { b: [...lo, ...hi].map((v) => +v.toFixed(4)), p: Buffer.from(q.buffer).toString('base64'), c: Buffer.from(Uint8Array.from(Cc)).toString('base64'), n: P.length / 9 };
}
const out = { license: 'Polyfork (polyfork.dev/licensing): use in games, no reselling the files', props: {} };
for (const [k, id] of Object.entries(PROPS)) { const f = flat(get(id)); console.log(k, f.n, 'tris', f.b.join(' ')); delete f.n; out.props[k] = f; }
const s = JSON.stringify(out); fs.writeFileSync('data/saloon/town.json', s); console.log('data/saloon/town.json', s.length, 'bytes');
