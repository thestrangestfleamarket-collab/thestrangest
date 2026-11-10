// THE CAFÉ'S GAMES (144cc–144cg): every game played to its end with the computer in every seat, for each number of players it takes; its state stays small (the online store) and its drawing and clicks never throw. No browser: node tests/tgames.cjs [game] (TGF=144ce: only that file's games)
const fs = require('fs'), vm = require('vm'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const strip = s => s.split('\n').filter(l => !/^(import |export )/.test(l)).join('\n');
const noop = () => {};
const ctx = { console, Math, JSON, Date, Object, Array, String, Number, Set, Map, Promise, setTimeout: noop, performance: { now: () => Date.now() },
  SYS: { add: noop }, ONLINE: {}, TABLES: {}, MINI: {}, THREE: {}, ROOMS: {}, st: {}, SAY: noop, INVITES: { kinds: {} } };
ctx.window = ctx; vm.createContext(ctx);
const files = fs.readdirSync(SRC).filter(f => (f === '144cc-tables.js' || /^144c[d-z]-tg-.*\.js$/.test(f)) && (f.startsWith('144cc') || !process.env.TGF || f.startsWith(process.env.TGF))).sort();
for (const f of files) vm.runInContext(strip(fs.readFileSync(path.join(SRC, f), 'utf8')) + (f.startsWith('144cc') ? '\nglobalThis.TG=TG;' : ''), ctx, { filename: f });
const TG = ctx.TG, G = TG.games();
// a canvas that draws nothing
const g = new Proxy({}, { get: (o, k) => k === 'measureText' ? (t => ({ width: String(t).length * 7 })) : k in o ? o[k] : noop, set: (o, k, v) => { o[k] = v; return true; } });
const only = process.argv[2], CAP = 4000, MAXJ = 3000;
let bad = 0, n = 0;
const fail = (id, why) => { bad++; console.log('FAIL', id, why); };
for (const [id, D] of Object.entries(G)) {
  if (only && id !== only) continue;
  for (const k of ['name', 'kind', 'min', 'max', 'help', 'init', 'moves', 'play', 'over', 'draw', 'click']) if (D[k] == null) fail(id, 'no ' + k);
  if (!['board', 'cards', 'dice'].includes(D.kind)) fail(id, 'kind ' + D.kind);
  for (let np = D.min; np <= D.max; np++) for (let run = 0; run < 3; run++) {
    n++; const s0 = { r: (run * 7919 + np * 104729 + 12345) >>> 0 };
    let S; try { S = D.init(np, TG.rng(s0)); if (S.r == null) S.r = s0.r; } catch (e) { fail(id, 'init ' + e.stack); break; }
    let ply = 0, done = null, maxJ = 0;
    try {
      for (; ply < CAP; ply++) {
        const j = JSON.stringify(S).length; maxJ = Math.max(maxJ, j); if (j > MAXJ) { fail(id, np + 'p: state ' + j + ' chars at ply ' + ply); break; }
        if (/[<>]/.test(JSON.stringify(S))) { fail(id, 'state has < or >'); break; }
        if (ply % 15 === 0) for (let v = -1; v < np; v++) { const ui = { btns: {}, mx: 100, my: 100 }; D.draw(g, S, v, ui, 520, 520); for (let c = 0; c < 4; c++) D.click(TG.clone(S), v < 0 ? 0 : v, (c * 131) % 520, (c * 197) % 520, ui); }
        done = D.over(S); if (done) break;
        if (!(S.p >= 0 && S.p < np)) { fail(id, np + 'p: S.p=' + S.p + ' at ply ' + ply); break; }
        const M = D.moves(S); if (!M.length) { fail(id, np + 'p: no moves and not over at ply ' + ply); break; }
        const m = TG.ai(D, S); if (!M.some(q => TG.eq(q, m))) { fail(id, np + 'p: ai move not legal ' + JSON.stringify(m)); break; }
        const before = JSON.stringify(S); S = D.play(TG.clone(S), m); if (JSON.stringify(S) === before) { fail(id, np + 'p: a move changed nothing ' + JSON.stringify(m)); break; }
      }
    } catch (e) { fail(id, np + 'p: ' + e.stack.split('\n').slice(0, 3).join(' | ')); continue; }
    if (!done && ply >= CAP) fail(id, np + 'p: no end in ' + CAP + ' moves');
    if (done && !Array.isArray(done.win)) fail(id, 'over() without win[]');
    if (run === 0) console.log(id.padEnd(14), np + 'p', String(ply).padStart(5), 'moves', String(maxJ).padStart(5), 'chars', done ? '→ ' + (done.text || '') : '');
  }
}
console.log(Object.keys(G).length + ' games, ' + n + ' runs, ' + (bad ? bad + ' failures' : 'all good'));
process.exit(bad ? 1 : 0);
