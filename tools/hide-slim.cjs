// thins THE ALLEY's heavier models for a headset: node tools/hide-slim.cjs (after tools/hide-assets.py)  ->  data/hide/m/*.glb rewritten with fewer triangles
const fs = require('fs'), { MeshoptSimplifier: S } = require('meshoptimizer');
const MAX = { metal_trash_can: 3500, cardboard_box_01: 2500, exterior_aircon_unit: 5000, industrial_pastic_container: 3500, wooden_crate_02: 2500, trashbag: 2000, security_light: 2000, industrial_wall_lamp: 2500, utility_box_01: 2500, water_manhole_cover: 2500, rusted_wheel_rim_01: 2200, power_box_01: 3000 };
S.ready.then(() => { for (const [name, max] of Object.entries(MAX)) { const f = 'data/hide/m/' + name + '.glb', b = fs.readFileSync(f), jl = b.readUInt32LE(12), G = JSON.parse(b.slice(20, 20 + jl)); let bin = b.slice(28 + jl);
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
