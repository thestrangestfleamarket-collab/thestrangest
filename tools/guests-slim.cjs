// thins THE GUEST LIST's models for a headset: node tools/guests-slim.cjs (after tools/guests-assets.py)  ->  data/guests/m/*.glb rewritten with fewer triangles and only the corners they still use
const fs = require('fs'), { MeshoptSimplifier: S } = require('meshoptimizer');
const DIR = 'data/guests/m/', BIG = 9000, SMALL = 3500;
const HEAVY = new Set('chandelier_01 chandelier_02 chandelier_03 sofa_01 sofa_02 sofa_03 armchair_01 gothicbed_01 gothiccabinet_01 gothiccommode_01 vintage_cabinet_01 wooden_bookshelf_worn vintage_grandfather_clock_01 dining_table woodentable_01 woodentable_02 wooden_display_shelves_01 electric_stove large_iron_gate covered_car classicconsole_01 chinese_screen_panels gothic_statue horse_statue_01 scandinavian_masonry_heater potted_plant_01 potted_plant_02 potted_plant_04 shrub_01'.split(' '));
const N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }, BY = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
S.ready.then(() => { let before = 0, after = 0;
  for (const file of fs.readdirSync(DIR)) { const f = DIR + file, b = fs.readFileSync(f), jl = b.readUInt32LE(12), G = JSON.parse(b.slice(20, 20 + jl)), bin = b.slice(28 + jl); before += b.length;
    const prims = G.meshes.flatMap(m => m.primitives).filter(p => p.indices != null), total = prims.reduce((n, p) => n + G.accessors[p.indices].count / 3, 0), max = HEAVY.has(file.replace('.glb', '')) ? BIG : SMALL;
    if (total <= max || (G.skins || []).length) { after += b.length; continue; }
    const view = a => { const A = G.accessors[a], v = G.bufferViews[A.bufferView], n = N[A.type], sz = BY[A.componentType], st = v.byteStride || n * sz, o = (v.byteOffset || 0) + (A.byteOffset || 0); return { A, n, sz, st, o }; };
    const parts = [], views = [], accs = []; let off = 0;
    const push = (buf, target) => { const pad = (4 - buf.length % 4) % 4; views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, ...(target ? { target } : {}) }); parts.push(buf, Buffer.alloc(pad)); off += buf.length + pad; return views.length - 1; };
    const done = new Map();
    for (const p of prims) { const key = p.indices + ':' + JSON.stringify(p.attributes); if (done.has(key)) { Object.assign(p, done.get(key)); continue; }
      const I = view(p.indices), idx = new Uint32Array(I.A.count); for (let i = 0; i < idx.length; i++) idx[i] = I.sz === 4 ? bin.readUInt32LE(I.o + i * 4) : I.sz === 2 ? bin.readUInt16LE(I.o + i * 2) : bin[I.o + i];
      const P = view(p.attributes.POSITION), pos = new Float32Array(P.A.count * 3); for (let i = 0; i < P.A.count; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = bin.readFloatLE(P.o + i * P.st + k * 4);
      const want = Math.max(3, Math.floor(idx.length * max / total / 3) * 3); let ni = S.simplify(idx, pos, 3, want, .03)[0]; if (ni.length > want * 1.6) ni = S.simplifySloppy(idx, pos, 3, null, want, .08)[0];
      const map = new Int32Array(P.A.count).fill(-1), keep = []; const out = new Uint32Array(ni.length); for (let i = 0; i < ni.length; i++) { let v = ni[i]; if (map[v] < 0) { map[v] = keep.length; keep.push(v); } out[i] = map[v]; }
      const np = { indices: 0, attributes: {} };
      for (const [name, a] of Object.entries(p.attributes)) { const V = view(a), w = V.n * V.sz, buf = Buffer.alloc(keep.length * w); keep.forEach((v, i) => bin.copy(buf, i * w, V.o + v * V.st, V.o + v * V.st + w));
        const acc = { bufferView: push(buf, 34962), componentType: V.A.componentType, count: keep.length, type: V.A.type, ...(V.A.normalized ? { normalized: true } : {}) };
        if (name === 'POSITION') { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; keep.forEach(v => { for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[v * 3 + k]); hi[k] = Math.max(hi[k], pos[v * 3 + k]); } }); acc.min = lo; acc.max = hi; }
        accs.push(acc); np.attributes[name] = accs.length - 1; }
      const small = keep.length < 65536, ib = small ? Buffer.from(new Uint16Array(out).buffer) : Buffer.from(out.buffer); accs.push({ bufferView: push(ib, 34963), componentType: small ? 5123 : 5125, count: out.length, type: 'SCALAR' }); np.indices = accs.length - 1;
      done.set(key, np); Object.assign(p, np); }
    for (const im of G.images || []) if (im.bufferView != null) { const v = G.bufferViews[im.bufferView]; im.bufferView = push(bin.slice(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)); }
    G.accessors = accs; G.bufferViews = views; G.buffers = [{ byteLength: off }];
    let J = Buffer.from(JSON.stringify(G)); J = Buffer.concat([J, Buffer.alloc((4 - J.length % 4) % 4, 32)]); const B = Buffer.concat(parts);
    const h = Buffer.alloc(20); h.write('glTF'); h.writeUInt32LE(2, 4); h.writeUInt32LE(28 + J.length + B.length, 8); h.writeUInt32LE(J.length, 12); h.write('JSON', 16);
    const bh = Buffer.alloc(8); bh.writeUInt32LE(B.length, 0); bh.write('BIN\0', 4); fs.writeFileSync(f, Buffer.concat([h, J, bh, B])); after += 28 + J.length + B.length;
    console.log(file, total, '->', prims.reduce((n, p) => n + G.accessors[p.indices].count / 3, 0)); }
  console.log('models', (before / 1048576).toFixed(1), 'MB ->', (after / 1048576).toFixed(1), 'MB'); });
