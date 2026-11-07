// THE MENU CHECK: node tests/menus.cjs dist/market.html [folder for screenshots]. ESC opens the one menu: its sections down the left (PROFILE, SETTINGS, INVENTORY; ADMIN for owners, 7 Nov 2026), each section's parts as tabs along the top; MAP and BAG open their own windows; ESC shuts it.
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
    ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'you'), 'ESC opens the menu at PROFILE');
    ok(await texts('#mnav [data-sec]') === 'PROFILE,SETTINGS,INVENTORY', 'the sections down the left: PROFILE, SETTINGS, INVENTORY (no ADMIN for a player; no MAP, PEOPLE, BBS or GUIDE)');
    ok(await texts('#msub [data-sub]') === 'LOOK,WEAR,WORDS', 'PROFILE has LOOK, WEAR and WORDS');
    ok(await until(() => document.querySelector('#dlooks #looks') && !document.querySelector('#looks').hidden), 'your look sits beside your avatar');
    ok(await pg.evaluate(() => [...document.querySelectorAll('#cpbtns button')].map(x => x.firstChild.textContent).join() === 'PASSPORT,RESURRECT,LOG OUT'), 'PROFILE keeps PASSPORT, RESURRECT and LOG OUT');
    await pg.waitForTimeout(800); await shot('you');
    await sub('wear'); ok((await now())[1] === 'wear', 'WEAR is a tab');
    await sec('pack'); ok(await until(() => FORAGE.PACK.open && document.querySelector('#dpack #packp')), 'INVENTORY shows your skills in the menu');
    ok(await texts('#msub [data-sub]') === 'BAG,SKILLS,BOOK,FISHING,JOURNAL', 'INVENTORY: BAG, SKILLS, BOOK, FISHING, JOURNAL');
    await shot('pack');
    await sub('book'); ok(await pg.evaluate(() => FORAGE.PACK.tab === 'book'), 'BOOK');
    await sec('set'); ok((await shown()) === 'display', 'SETTINGS opens at VIEW');
    ok(await texts('#msub [data-sub]') === 'VIEW,PICTURE,CONTROLS,REPORT A BUG', 'SETTINGS: VIEW, PICTURE, CONTROLS, REPORT A BUG');
    await shot('set-view');
    await sub('picture'); ok((await shown()) === 'atmo,graphics' || (await shown()) === 'graphics,atmo', 'PICTURE: graphics and atmosphere');
    await shot('set-picture');
    await sub('controls'); ok(/^keys,(sound,)?vr$/.test(await shown()), 'CONTROLS: keys, sound and VR');
    await sub('bug'); ok((await shown()) === 'bug', 'REPORT A BUG');
    await pg.keyboard.press('Escape'); ok(await until(() => !__UI.menuOpen), 'ESC shuts it');
    await pg.keyboard.press('Escape'); ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'set'), 'and opens it again where you were');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
    await pg.evaluate(() => __UI.menuTab('graphics')); ok((await now()).join() === 'set,picture', 'the old tab names still land in the right place');
    await pg.evaluate(() => __UI.menuTab('bug')); ok((await now()).join() === 'set,bug', 'F8 lands on REPORT A BUG');
    await pg.evaluate(() => __UI.toggleMenu());
    await pg.evaluate(() => { CINEMA.isAdmin = async () => true; });   // an owner
    await pg.keyboard.press('Escape'); ok(await until(() => !!document.querySelector('#mnav [data-sec="admin"]')), 'an owner sees ADMIN');
    await sec('admin'); ok(await texts('#msub [data-sub]') === 'BUG QUEUE,TENANTS,TEXT,TOOLS', 'ADMIN: BUG QUEUE, TENANTS, TEXT, TOOLS');
    await sub('tools'); ok(await until(() => document.querySelectorAll('#dtools ul li').length > 10 && !!document.querySelector('#dtools #cpstat')), 'TOOLS: stats, the render inspector and the game log');
    await shot('admin');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
