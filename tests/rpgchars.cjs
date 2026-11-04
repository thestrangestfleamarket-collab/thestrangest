// THE RPG TOWNSFOLK (111f-rpgfolk): the six classes load and walk the street on the player's 15-bone rig, facing where they go. Run: node tests/rpgchars.cjs
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 700, height: 560 } }); const errs = {};
  pg.on('pageerror', e => { errs[e.message] = 1; }); pg.on('console', m => { if (m.type() === 'error') { const t = m.text().slice(0, 200); if (!/scheme "file"|CORS policy|ERR_FAILED|file:\/\//.test(t)) errs[t] = 1; } });
  await pg.goto('file://' + process.cwd() + '/dist/market.html?fresh=1&hour=13', { timeout: 180000 });
  await pg.waitForFunction(() => window.__started && window.RPGNPC, { timeout: 240000 });
  const loaded = await pg.waitForFunction(() => window.RPGNPC.list && window.RPGNPC.list.length >= 6, { timeout: 60000 }).then(() => true).catch(() => false);
  ok(loaded, 'all six RPG townsfolk load after the start');
  const r = await pg.evaluate(async () => {
    const L = RPGNPC.list, out = { keys: L.map(N => N.key).sort().join(','), rig: L.every(N => !!(N.PM && N.body)), tris: L.map(N => N.body.tris()),
      notSkinned: L.every(N => N.g.children.every(c => !c.isSkinnedMesh)) };
    const face = [];
    for (const N of L) {
      N.st.hold = false; N.st.wait = 0; N.free = () => true; N.st.to = { x: N.st.x, z: N.st.z + 10 }; N.st.next = null;
      await new Promise(r => setTimeout(r, 1600));
      N.g.updateWorldMatrix(true, false); const e = N.g.matrixWorld.elements; const fx = e[8], fz = e[10], fl = Math.hypot(fx, fz) || 1;
      const mx = N.st.to.x - N.st.x, mz = N.st.to.z - N.st.z, ml = Math.hypot(mx, mz) || 1;
      face.push((fx / fl) * (mx / ml) + (fz / fl) * (mz / ml));
    }
    out.faceMin = Math.min(...face);
    return out;
  });
  ok(r.keys === 'cleric,monk,ranger,rogue,warrior,wizard', 'the six classes are present: ' + r.keys);
  ok(r.rig, 'each rides the player rig (a pose palette and a body)');
  ok(r.notSkinned, 'each is a flat rig body, not a skinned clip mesh');
  ok(r.tris.every(t => t <= 8000), 'each is within the triangle budget: ' + r.tris.join(','));
  ok(r.faceMin > 0.3, 'each faces the direction it walks (min forward dot ' + r.faceMin.toFixed(2) + ')');
  ok(Object.keys(errs).length === 0, 'no page errors' + (Object.keys(errs).length ? ': ' + Object.keys(errs).join(' | ') : ''));
  await b.close();
  console.log(fails ? fails + ' FAILED' : 'all rpgchars checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
