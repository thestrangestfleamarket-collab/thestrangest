// thins EYES DOWN's heavier models for a headset: node tools/zombie-slim.cjs (after tools/zombie-assets.py)  ->  data/zombie/m/*.glb rewritten with fewer triangles
const fs = require('fs'), { MeshoptSimplifier: S } = require('meshoptimizer');
const MAX = { old_bed_frame: 9000, potted_plant_02: 9000, book_encyclopedia_set_01: 5000, modern_wooden_cabinet: 6000, desk_lamp_arm_01: 6000, dining_chair_02: 5000, electric_stove: 7000, vintage_electric_kettle: 4000, wooden_bowl_01: 2500, ornate_mirror_01: 5000, pot_enamel_01: 3500, boombox: 6000, alarm_clock_01: 4000, round_wooden_table_01: 4000, vintage_microwave: 5000, food_apple_01: 1500 };
S.ready.then(() => { for (const [name, max] of Object.entries(MAX)) { const f = 'data/zombie/m/' + name + '.glb', b = fs.readFileSync(f), jl = b.readUInt32LE(12), G = JSON.parse(b.slice(20, 20 + jl)); let bin = b.slice(28 + jl);
  const prims = G.meshes.flatMap(m => m.primitives).filter(p => p.indices != null), total = prims.reduce((n, p) => n + G.accessors[p.indices].count / 3, 0); if (total <= max) continue;
  const done = new Map(); let out = 0;
  for (const p of prims) { const key = p.indices + ':' + p.attributes.POSITION; if (done.has(key)) { p.indices = done.get(key); continue; }
    const ia = G.accessors[p.indices], iv = G.bufferViews[ia.bufferView], io = (iv.byteOffset || 0) + (ia.byteOffset || 0), idx = new Uint32Array(ia.count);
    for (let i = 0; i < ia.count; i++) idx[i] = ia.componentType === 5125 ? bin.readUInt32LE(io + i * 4) : ia.componentType === 5123 ? bin.readUInt16LE(io + i * 2) : bin[io + i];
    const pa = G.accessors[p.attributes.POSITION], pv = G.bufferViews[pa.bufferView], po = (pv.byteOffset || 0) + (pa.byteOffset || 0), st = pv.byteStride || 12, pos = new Float32Array(pa.count * 3);
    for (let i = 0; i < pa.count; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = bin.readFloatLE(po + i * st + k * 4);
    const [ni] = S.simplify(idx, pos, 3, Math.max(3, Math.floor(ia.count * max / total / 3) * 3), .05), nb = Buffer.from(new Uint32Array(ni).buffer);
    G.bufferViews.push({ buffer: 0, byteOffset: bin.length, byteLength: nb.length, target: 34963 }); bin = Buffer.concat([bin, nb]);
    G.accessors.push({ bufferView: G.bufferViews.length - 1, componentType: 5125, count: ni.length, type: 'SCALAR' }); done.set(key, G.accessors.length - 1); p.indices = G.accessors.length - 1; out += ni.length / 3; }
  G.buffers[0].byteLength = bin.length; let J = Buffer.from(JSON.stringify(G)); J = Buffer.concat([J, Buffer.alloc((4 - J.length % 4) % 4, 32)]);
  const h = Buffer.alloc(20); h.write('glTF'); h.writeUInt32LE(2, 4); h.writeUInt32LE(28 + J.length + bin.length, 8); h.writeUInt32LE(J.length, 12); h.write('JSON', 16);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.write('BIN\0', 4); fs.writeFileSync(f, Buffer.concat([h, J, bh, bin])); console.log(name, total, '->', out); } });
// then every model drops the buffer data nothing reads any more (the old triangles)
S.ready.then(() => { for (const n of fs.readdirSync('data/zombie/m')) { const f = 'data/zombie/m/' + n, b = fs.readFileSync(f), jl = b.readUInt32LE(12), G = JSON.parse(b.slice(20, 20 + jl)), bin = b.slice(28 + jl);
  const ua = new Set(), ac = i => { if (i != null) ua.add(i); };
  for (const m of G.meshes) for (const p of m.primitives) { ac(p.indices); Object.values(p.attributes).forEach(ac); for (const t of p.targets || []) Object.values(t).forEach(ac); }
  for (const s of G.skins || []) ac(s.inverseBindMatrices); for (const a of G.animations || []) for (const sm of a.samplers) { ac(sm.input); ac(sm.output); }
  const amap = new Map(), accs = []; G.accessors.forEach((a, i) => { if (ua.has(i)) { amap.set(i, accs.length); accs.push(a); } });
  const re = i => i == null ? i : amap.get(i);
  for (const m of G.meshes) for (const p of m.primitives) { if (p.indices != null) p.indices = re(p.indices); for (const k in p.attributes) p.attributes[k] = re(p.attributes[k]); for (const t of p.targets || []) for (const k in t) t[k] = re(t[k]); }
  for (const s of G.skins || []) if (s.inverseBindMatrices != null) s.inverseBindMatrices = re(s.inverseBindMatrices); for (const a of G.animations || []) for (const sm of a.samplers) { sm.input = re(sm.input); sm.output = re(sm.output); }
  G.accessors = accs;
  const used = new Set(); for (const a of G.accessors) if (a.bufferView != null) used.add(a.bufferView); for (const im of G.images || []) if (im.bufferView != null) used.add(im.bufferView);
  const map = new Map(), parts = [], views = []; let off = 0;
  G.bufferViews.forEach((v, i) => { if (!used.has(i)) return; const d = bin.slice(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength), pad = (4 - d.length % 4) % 4; map.set(i, views.length); views.push({ ...v, byteOffset: off }); parts.push(d, Buffer.alloc(pad)); off += d.length + pad; });
  if (views.length === G.bufferViews.length) continue;
  for (const a of G.accessors) if (a.bufferView != null) a.bufferView = map.get(a.bufferView); for (const im of G.images || []) if (im.bufferView != null) im.bufferView = map.get(im.bufferView);
  G.bufferViews = views; const nb = Buffer.concat(parts); G.buffers[0].byteLength = nb.length; let J = Buffer.from(JSON.stringify(G)); J = Buffer.concat([J, Buffer.alloc((4 - J.length % 4) % 4, 32)]);
  const h = Buffer.alloc(20); h.write('glTF'); h.writeUInt32LE(2, 4); h.writeUInt32LE(28 + J.length + nb.length, 8); h.writeUInt32LE(J.length, 12); h.write('JSON', 16);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(nb.length, 0); bh.write('BIN\0', 4); fs.writeFileSync(f, Buffer.concat([h, J, bh, nb])); console.log(n, (bin.length >> 10) + ' KB ->', (nb.length >> 10) + ' KB'); } });
