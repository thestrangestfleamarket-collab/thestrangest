// RAMEN's cars: node tools/sushi-cars.cjs  ->  data/sushi/cars.json. Polyfork's cars as Polyfork made them (owner, 19 Nov 2026: "use polyforkcars models too"): each model (polyfork.dev/cdn/<id>.glb, fetched into .polyfork/,
// never committed) whole, its flat faces and own colours, nothing thinned; in metres, wheels on y 0, centred, its nose along +x. Its windows are a part of their own (glass), and so is the coachwork the page may paint (paint; `own` is Polyfork's colour for it).
const fs = require('fs'), path = require('path'), cp = require('child_process');
const C = '.polyfork', UA = 'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)';
const get = (id) => { const f = path.join(C, id + '.glb'); if (!fs.existsSync(f) || !fs.statSync(f).size) { fs.mkdirSync(C, { recursive: true }); cp.execFileSync('curl', ['-sSf', '--retry', '4', '-A', UA, '-o', f + '.part', 'https://polyfork.dev/cdn/' + id + '.glb']); fs.renameSync(f + '.part', f); } return f; };
// key: [Polyfork's id, its name, its windows' colour (at gamma 2.2; only above 0.6 of its height), its coachwork's colour or null to leave it as it is]
const CARS = {
  cab: ['yellow-cab-8df4a0', 'Yellow Cab', [71, 83, 95], null], cruiser: ['police-cruiser-a2d25e', 'Police Cruiser', [53, 49, 48], null],
  sedan: ['boxy-sedan-70s-7d55f7', 'Boxy-sedan-70s', [32, 36, 42], [46, 61, 107]], wagon: ['station-wagon-70s-11d67b', 'Station-wagon-70s', [32, 36, 42], [173, 132, 102]],
  hatch: ['hatchback-80s-e95554', 'Hatchback-80s', [32, 36, 42], [85, 179, 176]], towncar: ['town-car-56eeb6', 'Town Car', [122, 138, 142], [53, 49, 48]],
  muscle: ['muscle-car-60s-524d46', 'Muscle-car-60s', [46, 49, 56], [220, 205, 175]], van: ['camper-van-8d10e2', 'Camper-van', [63, 65, 72], [111, 137, 76]],
  kei: ['kei-van-211ed5', 'Kei Van', [0, 0, 0], [245, 246, 247]],   // THE MARKET's kei van, a fifth its size on the pavements there (src/150pb-traffic.js)
};
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64'), toS = (x) => Math.round(Math.max(0, Math.min(1, x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)) * 255), near = (a, b) => b && Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) <= 2;
const mm = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; };
const out = { license: 'Polyfork (polyfork.dev/licensing): use in games, no reselling the files', cars: {} };
for (const [key, [id, name, glassC, paintC]] of Object.entries(CARS)) {
  const b = fs.readFileSync(get(id)), n = b.readUInt32LE(12), J = JSON.parse(b.slice(20, 20 + n).toString('utf8')), BIN = b.slice(28 + n);
  const acc = (i) => { const a = J.accessors[i], v = J.bufferViews[a.bufferView], k = { VEC4: 4, VEC3: 3, VEC2: 2, SCALAR: 1 }[a.type], T = { 5126: Float32Array, 5123: Uint16Array, 5121: Uint8Array, 5125: Uint32Array }[a.componentType];
    if (v.byteStride && v.byteStride !== T.BYTES_PER_ELEMENT * k) throw new Error('interleaved'); const o = BIN.byteOffset + (v.byteOffset || 0) + (a.byteOffset || 0); return { a: new T(BIN.buffer.slice(o, o + a.count * k * T.BYTES_PER_ELEMENT)), k, d: a.componentType === 5126 ? 1 : a.componentType === 5121 ? 255 : 65535 }; };
  const par = new Map(); J.nodes.forEach((nd, i) => (nd.children || []).forEach((c) => par.set(c, i)));
  const W = (i) => { const nd = J.nodes[i]; if (nd.rotation || nd.scale) throw new Error(id + ': a turned or scaled part'); const t = nd.translation || [0, 0, 0], m = nd.matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1]; return par.has(i) ? mm(W(par.get(i)), m) : m; };
  // every triangle in the model's own frame: three corners, its colour (sRGB)
  const T = []; J.nodes.forEach((nd, i) => { if (nd.mesh == null) return; const M = W(i); for (const pr of J.meshes[nd.mesh].primitives) { const p = acc(pr.attributes.POSITION).a, c = acc(pr.attributes.COLOR_0), ix = pr.indices != null ? acc(pr.indices).a : null, nv = ix ? ix.length : p.length / 3;
    for (let q = 0; q < nv; q += 3) { const t = { p: [], c: [] }; for (let k = 0; k < 3; k++) { const v = ix ? ix[q + k] : q + k, x = p[v * 3], y = p[v * 3 + 1], z = p[v * 3 + 2]; t.p.push([M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]); t.c.push([0, 1, 2].map((a) => toS(c.a[v * c.k + a] / c.d))); if (!k) t.g = [0, 1, 2].map((a) => Math.round(Math.pow(Math.max(0, Math.min(1, c.a[v * c.k + a] / c.d)), 1 / 2.2) * 255)); } T.push(t); } } });
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const t of T) for (const p of t.p) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], p[a]); hi[a] = Math.max(hi[a], p[a]); }
  // Polyfork's nose is +z: turned to +x, centred, wheels on the ground
  const cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2, top = hi[1] - lo[1]; for (const t of T) t.p = t.p.map(([x, y, z]) => [z - cz, y - lo[1], -(x - cx)]);
  const size = [hi[2] - lo[2], top, hi[0] - lo[0]], L = [-size[0] / 2, 0, -size[2] / 2], sc = Math.max(...size) / 65000, parts = { body: [], paint: [], glass: [] };
  for (const t of T) { const y = (t.p[0][1] + t.p[1][1] + t.p[2][1]) / 3; parts[near(t.g, glassC) && y > top * 0.6 ? 'glass' : near(t.g, paintC) ? 'paint' : 'body'].push(t); }
  const car = { name, id, size: size.map((x) => +x.toFixed(3)), lo: L.map((x) => +x.toFixed(4)), sc, own: paintC ? (paintC[0] << 16) | (paintC[1] << 8) | paintC[2] : null, parts: {} }; let tris = 0, pts = 0;
  for (const [pn, ts] of Object.entries(parts)) { if (!ts.length) continue; const seen = new Map(), pos = [], col = [], idx = [], hue = pn === 'body';
    for (const t of ts) { const id3 = t.p.map((p, k) => { const q = p.map((x, a) => Math.max(-32768, Math.min(32767, Math.round((x - L[a]) / sc) - 32500))), key2 = q.join() + (hue ? '|' + t.c[k].join() : ''); let i = seen.get(key2); if (i == null) { seen.set(key2, i = pos.length / 3); pos.push(...q); if (hue) col.push(...t.c[k]); } return i; });
      if (id3[0] !== id3[1] && id3[1] !== id3[2] && id3[0] !== id3[2]) idx.push(...id3); }
    if (pos.length / 3 > 65535) throw new Error('too many points'); car.parts[pn] = { p: b64(Int16Array.from(pos)), i: b64(Uint16Array.from(idx)), ...(hue ? { c: b64(Uint8Array.from(col)) } : {}) }; tris += idx.length / 3; pts += pos.length / 3; }
  car.tris = tris; out.cars[key] = car; console.log(key.padEnd(8), name.padEnd(18), 'metres', car.size.join(' x '), 'triangles', T.length, 'kept', tris, 'points', pts, Object.entries(parts).map(([k, v]) => k + ' ' + v.length).join(', '));
}
const s = JSON.stringify(out); fs.writeFileSync('data/sushi/cars.json', s); console.log('data/sushi/cars.json', s.length, 'bytes;', Object.keys(out.cars).length, 'cars,', Object.values(out.cars).reduce((a, c) => a + c.tris, 0), 'triangles');
