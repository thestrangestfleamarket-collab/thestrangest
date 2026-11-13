// THE FISH TANK CHECK (owner, 9 Nov 2026): node tests/fishtank.cjs dist/market.html [shots-dir]. A fresh apartment's tank is built, its water surface moves (the wave sim steps), the koi swims, a double-click opens the close look and its settings (with fish food in your pack too), a setting changes the tank and is in the saved layout; FEED THE FISH in the menu feeds.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=fishtank::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const out = process.argv[3], b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const pg = await b.newPage({ viewport: { width: 1100, height: 700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const T = () => pg.evaluate(() => window.TANKDBG && TANKDBG()[0]);
    let t = null; for (let i = 0; i < 90; i++) { t = await T(); if (t && t.vis && t.fish > 0 && t.kinds.length) break; await pg.waitForTimeout(1000); }
    ok(t && t.vis && t.size[0] >= 1.5 && t.size[0] <= 1.8 && t.size[2] >= 1.2, 'the tank builds, half as long as it was (owner, 12 Nov 2026): ' + JSON.stringify(t && t.size));
    ok(t && t.kinds.includes('pfkoi'), 'the Polyfork koi is in it: ' + JSON.stringify(t && t.kinds));
    ok(t && t.kinds.filter(k => /koi/.test(k)).length >= 4 && t.kinds.includes('goldfish') && t.ways.length >= 2 && t.koiL < .2, 'koi of several colourings, half the size, with a shoal of goldfish, each kind swimming its own way (owner, 10 Nov 2026): ' + JSON.stringify([t && t.kinds, t && t.ways, t && t.koiL]));
    const a = await T(); await pg.waitForTimeout(12000); const c = await T();
    ok(c.steps > a.steps && c.wave > 0 && (c.sy !== a.sy || c.wave !== a.wave), 'the water surface moves (' + a.steps + ' -> ' + c.steps + ' steps, middle height ' + a.sy + ' -> ' + c.sy + ', highest wave ' + a.wave + ' -> ' + c.wave + ' mm)');
    ok(a.f0 && c.f0 && Math.hypot(c.f0[1] - a.f0[1], c.f0[3] - a.f0[3]) > .01, 'the koi swims: ' + JSON.stringify([a.f0, c.f0]));
    const ask = await pg.evaluate(() => { while (FORAGE.has('g_fishfood')) FORAGE.take('g_fishfood', 1); __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name)).act(); return { look: TANKV.on(), opts: [...document.querySelectorAll('#tanka:not([hidden]) button')].map(b => b.textContent) }; });
    ok(!ask.look && ['VIEW', 'FEED', 'EDIT'].every(k => ask.opts.includes(k)), 'a double-click asks VIEW, FEED or EDIT (owner, 13 Nov 2026): ' + JSON.stringify(ask));
    const vw = await pg.evaluate(async () => { TANKV.choose('view'); await new Promise(r => setTimeout(r, 300)); const r = { look: TANKV.on(), tabs: !!document.querySelector('#tankp:not([hidden]) button[data-a="tab:water"]') }; TANKV.close(); return r; });
    ok(vw.look && !vw.tabs, 'VIEW comes close on the tank without its settings: ' + JSON.stringify(vw));
    await pg.evaluate(() => { __dbg.UI.things.find(t => /FISH TANK/.test(t.name)).act(); TANKV.choose('edit'); });
    let v = false; for (let i = 0; i < 30 && !v; i++) { await pg.waitForTimeout(500); v = await pg.evaluate(() => TANKV.on() && !!document.querySelector('#tankp:not([hidden]) button[data-a="tab:water"]')); }
    ok(v, 'EDIT opens the close look and its settings');
    if (v) {
      await pg.waitForTimeout(3000); const cam = await pg.evaluate(() => ({ hold: __dbg.UI.holdCam, persp: __dbg.UI.persp }));
      ok(cam.hold === 'tank' && cam.persp, 'the camera comes close on the tank: ' + JSON.stringify(cam));
      if (out) await pg.screenshot({ path: path.join(out, 'tank-fresh.png'), timeout: 180000 });
      { const c0 = (await T()).cam; await pg.mouse.move(400, 350); await pg.mouse.down(); await pg.mouse.move(300, 300, { steps: 4 }); await pg.mouse.up(); await pg.mouse.move(400, 380); for (let i = 0; i < 4; i++) await pg.mouse.wheel(0, -300); await pg.waitForTimeout(2500); const l = await T();
        ok(l.look && Math.abs(l.look[0]) > .2 && l.look[2] > .3 && Math.hypot(l.cam[0] - c0[0], l.cam[1] - c0[1], l.cam[2] - c0[2]) > .2 && l.view, 'a drag looks round the tank and the wheel comes close (owner, 12 Nov 2026): ' + JSON.stringify(l.look));
        if (out) await pg.screenshot({ path: path.join(out, 'tank-close.png'), timeout: 180000 }); }
      for (const [t, a] of [['water', 'w:salt'], ['fish', 'f:pfclown:1'], ['decor', 'd:castle'], ['water', 'l:c:blue'], ['water', 'ws:slow'], ['tank', 'st:classic']]) { await pg.$eval('#tankp button[data-a="tab:' + t + '"]', b => b.click()); await pg.$eval('#tankp button[data-a="' + a + '"]', b => b.click()); }
      let s = null; for (let i = 0; i < 30; i++) { await pg.waitForTimeout(1000); s = await T(); if (s.kinds.includes('pfclown')) break; }
      ok(s.set.w === 'salt' && s.set.f.pfclown === 1 && s.set.d.includes('castle') && s.set.l.c === 'blue' && s.set.ws === 'slow' && s.set.style === 'classic', 'the settings change the tank, its water speed and style too (13 Nov 2026): ' + JSON.stringify(s.set));
      ok(s.kinds.includes('pfclown') && !s.kinds.includes('pfkoi'), 'in salt water the clownfish swims and the koi (fresh) waits: ' + JSON.stringify(s.kinds));
      await pg.waitForTimeout(2000); const L = await pg.evaluate(() => { const H = ROOMED.HOME.layout; return H && H.tanks; });
      ok(L && L.fishtank && L.fishtank.w === 'salt' && L.fishtank.f.pfclown === 1 && L.fishtank.ws === 'slow', 'and they are in the saved layout: ' + JSON.stringify(L));
      if (out) { await pg.waitForTimeout(3000); await pg.screenshot({ path: path.join(out, 'tank-salt.png'), timeout: 180000 }); }
      { const z=await pg.evaluate(async()=>{ const a=TANKDBG()[0].size[0]; for(const k of ['z:l','b:oak','r:steel','d:staghorn','d:skull','d:hoard','fz:pfclown:l','fc:pfclown:blue','l:b:high'])TANKV.act(k); for(let i=0;i<40&&TANKDBG()[0].pf.length<3;i++)await new Promise(r=>setTimeout(r,250)); const t=TANKDBG()[0]; return {a,b:t.size[0],set:t.set,pf:t.pf,clips:ROOMED.clips()}; });
        ok(z.b>z.a*1.3&&z.set.sz==='l'&&z.set.base==='oak'&&z.set.rim==='steel'&&z.set.fz.pfclown==='l'&&z.set.fc.pfclown==='blue'&&z.set.l.b==='high'&&['staghorn','skull','hoard'].every(k=>z.pf.includes(k)), 'its size, stand, rim, a fish\'s size and colour, the light\'s strength and Polyfork\'s coral, mossy skull and chest are settings too (owner, 12 Nov 2026): '+JSON.stringify([z.a,z.b,z.pf])); }
      { for (const k of ['f:shark:1', 'f:octopus:1', 'f:jellyfish:1', 'f:stingray:1', 'f:dolphin:1']) await pg.evaluate(k => TANKV.act(k), k); let c = null; for (let i = 0; i < 30; i++) { await pg.waitForTimeout(1000); c = await T(); if (['shark', 'octopus', 'jellyfish', 'stingray', 'dolphin'].every(k => c.kinds.includes(k))) break; }
        ok(['shark', 'octopus', 'jellyfish', 'stingray', 'dolphin'].every(k => c.kinds.includes(k)) && ['patrol', 'den', 'drift', 'glide', 'surface'].every(w => c.ways.includes(w)), 'the great white, the octopus, the jellyfish, the ray and the dolphin swim in salt water, each its own way (owner, 13 Nov 2026): ' + JSON.stringify([c.kinds, c.ways]));
        if (out) { await pg.waitForTimeout(4000); await pg.screenshot({ path: path.join(out, 'tank-sea.png'), timeout: 180000 }); }
        for (const k of ['w:fresh', 'f:x_trout:2', 'f:x_pike:1', 'f:x_catfish:1', 'f:x_sturgeon:1']) await pg.evaluate(k => TANKV.act(k), k); for (let i = 0; i < 30; i++) { await pg.waitForTimeout(1000); c = await T(); if (['x_trout', 'x_pike', 'x_catfish', 'x_sturgeon'].every(k => c.kinds.includes(k))) break; }
        ok(['x_trout', 'x_pike', 'x_catfish', 'x_sturgeon'].every(k => c.kinds.includes(k)) && !c.kinds.includes('shark') && ['station', 'lurk', 'forage'].every(w => c.ways.includes(w)), 'the trout, the pike, the catfish and the sturgeon swim in fresh water (owner, 13 Nov 2026): ' + JSON.stringify([c.kinds, c.ways]));
        if (out) { await pg.waitForTimeout(4000); await pg.screenshot({ path: path.join(out, 'tank-river.png'), timeout: 180000 }); } }
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
      ok(await pg.evaluate(() => !TANKV.on() && !__dbg.UI.holdCam), 'Esc steps back');
    }
    const y0 = (await T()).y;
    const withFood = await pg.evaluate(() => { TANKV.close(); FORAGE.give('g_fishfood', 1); const th = __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name)); th.act(); const r = { name: th.name, menu: !TANKV.on(), feedBtn: !!document.querySelector('#tanka:not([hidden]) [data-a="feed"]:not([disabled])'), food: FORAGE.has('g_fishfood') }; TANKV.choose('feed'); return r; });
    ok(withFood.menu && withFood.feedBtn && withFood.food && withFood.name === 'THE FISH TANK', 'with fish food the double-click\'s FEED is there: ' + JSON.stringify(withFood));
    let f = null; for (let i = 0; i < 40; i++) { f = await T(); if (f.y > y0 + .1) break; await pg.waitForTimeout(500); }
    ok(f.fed > 0 && f.y > y0 + .1 && !(await pg.evaluate(() => FORAGE.has('g_fishfood'))), 'FEED: the food is used and the fish rise (' + y0 + ' -> ' + f.y + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
