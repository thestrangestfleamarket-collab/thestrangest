// THE MENU CHECK: node tests/menus.cjs dist/market.html [folder for screenshots]. ESC opens the one menu: its sections down the left (YOU, PACK, MAP, PEOPLE, BBS, GUIDE, SET; ADMIN for owners), each section's parts as tabs along the top; MAP and BAG open their own windows; ESC shuts it.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=menus::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true }); let n = 0;
  const shot = async name => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 180000 }); };
  const until = async (f, ms = 20000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  const now = () => pg.evaluate(() => __UI.menuNow());
  const sec = s => pg.evaluate(k => document.querySelector('#mnav [data-sec="' + k + '"]').click(), s);
  const sub = s => pg.evaluate(k => document.querySelector('#msub [data-sub="' + k + '"]').click(), s);
  const shown = () => pg.evaluate(() => [...document.querySelectorAll('#menu .panes>[data-p]')].filter(p => !p.hidden).map(p => p.dataset.p).join());
  const texts = q => pg.evaluate(s => [...document.querySelectorAll(s)].map(x => x.firstChild.textContent).join(), q);
  if (st) {
    ok(!(await pg.evaluate(() => !!document.getElementById('hh'))), 'the pager is gone');
    await pg.keyboard.press('Escape');
    ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'you'), 'ESC opens the menu at YOU');
    ok(await texts('#mnav [data-sec]') === 'YOU,PACK,MAP,PEOPLE,BBS,GUIDE,SET', 'the sections down the left (no ADMIN for a player)');
    ok(await texts('#msub [data-sub]') === 'LOOK,WEAR,WORDS', 'YOU has LOOK, WEAR and WORDS');
    ok(await until(() => document.querySelector('#dlooks #looks') && !document.querySelector('#looks').hidden), 'your look sits beside your avatar');
    ok(await pg.evaluate(() => [...document.querySelectorAll('#cpbtns button')].map(x => x.firstChild.textContent).join() === 'PASSPORT,RESURRECT,LOG OUT'), 'YOU keeps PASSPORT, RESURRECT and LOG OUT');
    await pg.waitForTimeout(800); await shot('you');
    await sub('wear'); ok((await now())[1] === 'wear', 'WEAR is a tab');
    await sec('pack'); ok(await until(() => FORAGE.PACK.open && document.querySelector('#dpack #packp')), 'PACK shows your skills in the menu');
    ok(await texts('#msub [data-sub]') === 'BAG,SKILLS,BOOK,FISHING,JOURNAL', 'PACK: BAG, SKILLS, BOOK, FISHING, JOURNAL (no CRAFT)');
    await shot('pack');
    await sub('book'); ok(await pg.evaluate(() => FORAGE.PACK.tab === 'book'), 'BOOK');
    await sec('people'); ok((await now())[0] === 'people' && (await shown()) === 'people', 'PEOPLE');
    await sec('bbs'); ok(await until(() => window.DRONEDBG && DRONEDBG().on && DRONEDBG().page === 'shop' && document.querySelectorAll('#dbbs [data-buy]').length > 0), 'BBS: the bodega to order from');
    await shot('bbs');
    { const c0 = await pg.evaluate(() => INV.cash); await pg.evaluate(() => document.querySelector('#dbbs [data-buy]').click());
      ok(await until(() => DRONEDBG().page === 'orders' && INV.cash < 1e12) && await pg.evaluate(c => INV.cash < c, c0), 'BUY orders it and YOUR ORDERS shows it'); }
    await sec('guide'); ok((await shown()) === 'guide', 'GUIDE opens at its chapters');
    await sub('keys'); ok(await until(() => document.querySelector('#dmoves').textContent.includes('WALK')), 'ALL THE KEYS lists the keys');
    ok(await pg.evaluate(() => !/EDITOR|SHIFT \+ E/.test(document.querySelector('#dmoves').textContent)), 'no editor keys');
    await sub('bug'); ok((await shown()) === 'bug', 'REPORT A BUG');
    await sec('set'); ok((await shown()) === 'display', 'SET opens at VIEW');
    await shot('set-view');
    await sub('picture'); ok((await shown()) === 'atmo,graphics' || (await shown()) === 'graphics,atmo', 'PICTURE: graphics and atmosphere');
    await shot('set-picture');
    await sub('controls'); ok(/^keys,(sound,)?vr$/.test(await shown()), 'CONTROLS: keys, sound and VR');
    await pg.keyboard.press('Escape'); ok(await until(() => !__UI.menuOpen), 'ESC shuts it');
    await pg.keyboard.press('Escape'); ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'set'), 'and opens it again where you were');
    await sec('map'); ok(await until(() => !__UI.menuOpen), 'MAP opens the map on its own');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    await pg.evaluate(() => __UI.menuTab('graphics')); ok((await now()).join() === 'set,picture', 'the old tab names still land in the right place');
    await pg.evaluate(() => __UI.menuTab('bug')); ok((await now()).join() === 'guide,bug', 'F8 lands on REPORT A BUG');
    await pg.evaluate(() => __UI.toggleMenu());
    await pg.evaluate(() => { CINEMA.isAdmin = async () => true; });   // an owner
    await pg.keyboard.press('Escape'); ok(await until(() => !!document.querySelector('#mnav [data-sec="admin"]')), 'an owner sees ADMIN');
    await sec('admin'); ok(await texts('#msub [data-sub]') === 'BUG QUEUE,TENANTS,TOOLS', 'ADMIN: BUG QUEUE, TENANTS, TOOLS');
    await sub('tools'); ok(await until(() => document.querySelectorAll('#dtools ul li').length > 10 && !!document.querySelector('#dtools #cpstat')), 'TOOLS: stats, the render inspector and the game log');
    await shot('admin');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
