// THE LAYOUT CHECK: node tests/layout.cjs dist/market.html. The HUD's pieces and the windows can be dragged anywhere; where you put them is saved and comes back after a reload; a plain click still works; RESET puts the HUD back.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=layout::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1200, height: 760 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=13&at=53,10';
  const start = async q => { await pg.goto(url + q, { waitUntil: 'commit' }); let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); } await pg.waitForFunction(() => { const L = document.getElementById('loading'); return !L || getComputedStyle(L).pointerEvents === 'none'; }, null, { timeout: 120000 }).catch(() => {}); await pg.waitForTimeout(2500); return st; };   // the loading screen stays over everything until the game has drawn (7 Nov 2026)
  ok(await start('&fresh=1'), 'the page starts');
  const box = id => pg.evaluate(id => { const e = document.getElementById(id); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: r.width, h: r.height }; }, id);
  const dragBy = async (x, y, dx, dy) => { await pg.mouse.move(x, y); await pg.mouse.down(); for (let i = 1; i <= 8; i++) await pg.mouse.move(x + dx * i / 8, y + dy * i / 8); await pg.mouse.up(); await pg.waitForTimeout(300); };
  const v0 = await box('vit');
  ok(!!v0, 'the health bars show');
  if (v0) { await dragBy(v0.x + 20, v0.y + 10, 400, 250); const v1 = await box('vit'); ok(v1 && Math.abs(v1.x - v0.x - 400) < 8 && Math.abs(v1.y - v0.y - 250) < 8, 'the health bars drag where you put them: ' + JSON.stringify([v0, v1])); }
  const q0 = await box('hqb');
  if (q0) { await dragBy(q0.x + q0.w - 10, q0.y + 10, -200, -300); const q1 = await box('hqb'); ok(q1 && Math.abs(q1.y - q0.y + 300) < 8, 'the hotbar drags (by an empty slot): ' + JSON.stringify([q0, q1])); }
  await pg.evaluate(() => { HUD.set(0, 'bottle'); FORAGE.give('bottle', 1); });
  const used = await pg.evaluate(() => { const s = document.querySelector('#hqb .qs'); let n = 0; const o = HUD.use; HUD.use = i => { n++; }; s.click(); HUD.use = o; return n; });
  ok(used === 1, 'a plain click on a slot still uses it');
  await pg.evaluate(() => SHOPS.open({ key: 'professor', name: 'THE PROFESSOR' })); await pg.waitForTimeout(1200);
  const s0 = await box('shopg');
  if (s0) { await dragBy(s0.x + s0.w / 2, s0.y + 40, 150, 120); const s1 = await box('shopg'); ok(s1 && Math.abs(s1.x - s0.x - 150) < 8, 'a shop window drags too: ' + JSON.stringify([s0, s1])); } else ok(false, 'a shop opens');
  const saved = await pg.evaluate(() => __dbg.SAVE.get('uipos'));
  ok(saved && /vit/.test(saved) && /hqb/.test(saved) && /shopg/.test(saved), 'the layout is saved: ' + saved);
  const before = [await box('vit'), await box('hqb')];
  await start('');
  let after = null; for (let i = 0; i < 20; i++) { after = [await box('vit'), await box('hqb')]; if (after[0] && after[1] && Math.abs(after[0].x - before[0].x) < 4 && Math.abs(after[1].y - before[1].y) < 4) break; await pg.waitForTimeout(500); }   // the HUD is put back on the UI's next look (every 0.4 s)
  ok(after[0] && after[1] && Math.abs(after[0].x - before[0].x) < 4 && Math.abs(after[0].y - before[0].y) < 4 && Math.abs(after[1].y - before[1].y) < 4, 'after a reload they are where you left them: ' + JSON.stringify([before, after]));
  await pg.evaluate(() => __dbg.ui().resetLayout());
  await pg.waitForTimeout(300);
  const r = await box('vit');
  ok(r && Math.abs(r.x - v0.x) < 4 && Math.abs(r.y - v0.y) < 4 && !(await pg.evaluate(() => __dbg.SAVE.get('uipos'))), 'RESET puts the HUD back and forgets the layout');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
