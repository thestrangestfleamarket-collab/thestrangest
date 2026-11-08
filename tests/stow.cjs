// THE STOW CHECK: node tests/stow.cjs dist/market.html. In a room off the map with no window out (the arcade) the street lets go of its pictures and its shapes on the graphics card; out again, every picture is back as it was; in one whose windows look out (the bodega) the street they show stays.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=stow::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const until = async (f, a, ms = 60000) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
    await pg.waitForTimeout(8000);
    // every street picture a stow could take, with a sum of its pixels
    await pg.evaluate(() => { const L = new Map(); for (const g of __scene.children) g.traverse(o => { for (const m of [].concat(o.material || [])) for (const k in m) { const t = m[k], c = t && t.isTexture && t.image; if (c instanceof HTMLCanvasElement && c.width * c.height >= 4096 && !L.has(c)) L.set(c, null); } });
      const sum = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255) s = (s + d[i] * 3 + d[i + 1] * 5 + d[i + 2] * 7 + i) % 1e9; return s; };
      for (const c of L.keys()) L.set(c, [c.width, c.height, sum(c)]); window.__pics = L; window.__sum = sum; });
    await pg.evaluate(() => ROOMS.enter('arcade'));
    const let_go = await until(() => ROOMS.offIn() === 'arcade' && ROOMS.stowed().reduce((n, r) => n + r.pics, 0) > 20 * 1048576);
    await pg.waitForTimeout(3000);
    const S = await pg.evaluate(() => ROOMS.stowed()), shrunk = await pg.evaluate(() => { window.__out = [...__pics.keys()].filter(c => c.width === 1 && c.height === 1); return __out.length; });
    ok(shrunk > 20, shrunk + ' street pictures are let go');
    const MB = k => (S.reduce((n, r) => n + r[k], 0) / 1048576).toFixed(1);
    ok(let_go, 'in the arcade (no window out) the street lets go of its pictures: ' + MB('pics') + ' MB, and its shapes on the graphics card: ' + MB('shape') + ' MB (' + S.length + ' places)');
    ok(['parkwall', 'block', 'down', 'ghostdojo'].every(n => S.some(r => r.name === n)), 'the park wall, the block, the station and the bath house are among them: ' + S.map(r => r.name).filter(Boolean).join(' '));
    ok(await pg.evaluate(() => BATCH.at() === null), 'the painted ground is dropped there');
    await pg.evaluate(() => ROOMS.exit('arcade'));
    const back = await until(() => !ROOMS.offIn() && !FADE.busy && ROOMS.stowed().length === 0);
    const diff = await pg.evaluate(() => { const bad = []; for (const c of __out) { const [w, h, s] = __pics.get(c); if (c.width !== w || c.height !== h || __sum(c) !== s) bad.push(w + 'x' + h); } return bad; });
    ok(back && diff.length === 0, 'out again, every picture is back as it was (' + (diff.length ? diff.length + ' differ: ' + diff.slice(0, 6).join(' ') : 'all same') + ')');
    ok(await pg.evaluate(() => { let n = 0; __scene.traverse(o => { if (VIS.hidden(o, 'stow')) n++; }); return n === 0; }), 'nothing is left hidden');
    await pg.evaluate(() => ROOMS.enter('bodega'));
    await until(() => ROOMS.offIn() === 'bodega' && !FADE.busy);
    await pg.waitForTimeout(4000);
    const B = await pg.evaluate(() => ({ at: BATCH.at(), win: !!ROOMS.real(), st: ROOMS.stowed().map(r => r.name).filter(Boolean) }));
    if (B.win) ok(B.at && !B.st.includes('bodega'), 'in the bodega (windows look out) the street around it stays, its painted ground painted where it stands' + (B.st.length ? '; let go: ' + B.st.join(' ') : ''));
    else ok(B.st.includes('mainstreet') && B.st.includes('bodega'), 'in the bodega (no window out since its move to the Hudson row, 7 Nov) the street lets go as in the arcade; let go: ' + B.st.join(' '));
    await pg.evaluate(() => ROOMS.exit('bodega'));
    ok(await until(() => !ROOMS.offIn() && ROOMS.stowed().length === 0), 'out of the bodega nothing stays let go');
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
