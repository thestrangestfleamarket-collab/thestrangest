// THE TREES' BAKE: node tools/trees-bake.cjs grows the park's trees and bushes once (tools/treegen.cjs) and writes their recipes, and stand-in summaries for the old pack trees, to data/trees.json. Not shipped.
const THREE = require('three'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), G = require('./treegen.cjs')(THREE), r3 = v => Math.round(v * 1000) / 1000;
const src = fs.readFileSync(ROOT + '/src/060b-trees.js', 'utf8').replace('__DATA__("data/trees.json")', '{}').replace(/^import .*$/mg, '').replace(/^export .*$/mg, '');
const TREEGEN = new Function('THREE', src + ';return TREEGEN;')(THREE);
const N = 6, out = { v: 1 };
const tree = (style, seed, low) => { const t = G.tree(style, seed, low), rec = { pr: t.pr, c: t.c, kN: t.kN, tr: t.tr }, m = TREEGEN.assemble(rec), H = m.H;
  rec.sum = { cl: G.cluster(t.CL, t.K).map(q => [q[0] / H, q[1] / H, q[2] / H, q[3] / H].map(r3).concat(q.slice(4).map(Math.round))),
    lb: t.LB.map(([a, b, r]) => [a.x, a.y, a.z, b.x, b.y, b.z, r].map(v => r3(v / H))), bc: t.bc };
  return [rec, m.tris]; };
const sets = { A: ['clumps', 1000, false], C: ['bunches', 2000, false], AL: ['clumps', 4000, true], CL: ['bunches', 5000, true] };
for (const [k, [style, s0, low]] of Object.entries(sets)) { const R = [...Array(N)].map((_, i) => tree(style, s0 + i, low)); out[k] = R.map(r => r[0]); console.log(k, 'tris', R.map(r => r[1]).join(' ')); }
out.B = [0, 1, 2, 3].map(i => { const b = G.bush(3000 + i); return { pr: b.pr, c: b.c, kN: b.kN, tr: b.tr }; });
// the old pack trees' stand-ins: their leaves gathered into a few clumps, and the trunk
const F = JSON.parse(fs.readFileSync(ROOT + '/data/forest.json', 'utf8')), b64 = s => Buffer.from(s, 'base64');
out.old = {};
for (const k of Object.keys(F)) { if (/Rock/.test(k)) continue; const D = F[k], pb = b64(D.p), p = new Float32Array(pb.buffer, pb.byteOffset, pb.length / 4), c = b64(D.c), pts = []; let yl = 1;
  for (let i = 0; i < p.length; i += 9) { const g = c[i + 1] > c[i] * 1.08 && c[i + 1] > c[i + 2] * 1.08; if (!g) continue;
    const x = (p[i] + p[i + 3] + p[i + 6]) / 3, y = (p[i + 1] + p[i + 4] + p[i + 7]) / 3, z = (p[i + 2] + p[i + 5] + p[i + 8]) / 3; yl = Math.min(yl, y); pts.push([x, y, z, .04, c[i], c[i + 1], c[i + 2]]); }
  out.old[k] = { cl: G.cluster(pts, 8).map(q => [q[0], q[1], q[2], Math.max(.06, q[3] * .95)].map(r3).concat(q.slice(4).map(Math.round))), lb: [[0, 0, 0, 0, r3(Math.max(.3, yl * 1.1)), 0, r3((D.trunk || .14) * .5)]], bc: [88, 68, 48] }; }
fs.writeFileSync(ROOT + '/data/trees.json', JSON.stringify(out));
console.log('data/trees.json', fs.statSync(ROOT + '/data/trees.json').size, 'bytes; old:', Object.keys(out.old).join(' '));
