// THE MENU CHECK: node tests/menus.cjs dist/market.html [folder for screenshots]. ESC opens the one menu: its sections down the left (SETTINGS, PETS, INVENTORY, MAP; ADMIN for owners, 7 Nov 2026; your look in ADMIN > AVATAR, you the paper doll, 9 Nov 2026), each section's parts as tabs along the top; MAP and BAG open their own windows; ESC shuts it.
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
    ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'set'), 'ESC opens the menu at SETTINGS');
    ok(await texts('#mnav [data-sec]') === 'SETTINGS,WHAT YOU CAN DO,PETS,INVENTORY,MAP', 'the sections down the left: SETTINGS, WHAT YOU CAN DO, PETS, INVENTORY, MAP (WHAT YOU CAN DO the ? list, 10 Nov 2026; MAP a section, 10 Nov 2026; no PROFILE: the paper doll, 9 Nov 2026; no ADMIN for a player; no PEOPLE, BBS or GUIDE)');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
    await pg.evaluate(() => DOLL.me()); ok(await until(() => !document.getElementById('doll').hidden), 'double-clicking yourself opens your paper doll');
    ok(await pg.evaluate(() => [...document.querySelectorAll('#doll [data-b]')].map(x => x.textContent).join() === 'EDIT,WEAR,WORDS,SKILLS,JOURNAL,EMOTES,PASSPORT,LOG OUT'), 'the doll has EDIT, WEAR, WORDS, SKILLS, JOURNAL, EMOTES, PASSPORT and LOG OUT');
    await pg.waitForTimeout(1500); await shot('doll');
    await pg.evaluate(() => document.querySelector('#doll [data-b="1"]').click()); ok(await until(() => !document.getElementById('looks').hidden && document.querySelector('#looks .ltabs [data-t=look]').hidden), 'its WEAR opens what you wear, with no LOOK');
    await shot('wear'); await pg.evaluate(() => { document.getElementById('looks').hidden = true; DOLL.me(); });
    await pg.keyboard.press('Escape'); await until(() => __UI.menuOpen);
    await sec('pack'); ok(await until(() => FORAGE.PACK.open && document.querySelector('#dpack #packp')), 'INVENTORY shows your skills in the menu');
    ok(await texts('#msub [data-sub]') === 'BAG,SKILLS,BOOK,FISHING,JOURNAL', 'INVENTORY: BAG, SKILLS, BOOK, FISHING, JOURNAL');
    await shot('pack');
    await sub('book'); ok(await pg.evaluate(() => FORAGE.PACK.tab === 'book'), 'BOOK');
    await sec('set'); ok((await shown()) === 'display', 'SETTINGS opens at VIEW');
    ok(await texts('#msub [data-sub]') === 'VIEW,CAMERA,SCREEN,CHAT,RESOLUTION,PS2 FILTER,TIME,WEATHER,LIGHT,SOUND,KEYS,CONTROLLER,VR,REPORT A BUG', 'SETTINGS: every setting its own tab (8 Nov 2026)');
    await shot('set-view');
    { const one = []; for (const [k, p] of [['camera', 'camera'], ['screen', 'screen'], ['chat', 'chat'], ['res', 'graphics'], ['ps2', 'ps2'], ['time', 'atmo'], ['weather', 'weather'], ['light', 'light'], ['keys', 'keys'], ['vr', 'vr']]) { await sub(k); if ((await shown()) !== p) one.push(k + ':' + (await shown())); } ok(!one.length, 'each tab shows its own one pane' + (one.length ? ': ' + one : '')); }
    await sub('ps2'); await shot('set-ps2');
    { const r = await pg.evaluate(() => { const b = document.getElementById('dps2'), on0 = PS2.on; b.click(); const off = PS2.on; b.click(); const g = document.querySelector('#dps2p [data-k="grain"]'), g0 = PS2.parts.grain; g.click(); const g1 = PS2.parts.grain; g.click(); return { on0, off, back: PS2.on, g0, g1, gb: PS2.parts.grain }; }); ok(r.on0 && !r.off && r.back && r.g0 !== r.g1 && r.gb === r.g0, 'PS2 FILTER: on and off, and each part on its own (8 Nov 2026) ' + JSON.stringify(r)); }
    { await pg.evaluate(() => { document.getElementById('dps2m').click(); const k = document.getElementById('dps2mk'); k.value = '1.5'; k.dispatchEvent(new Event('input')); }); const on = await until(() => document.getElementById('menu').closest('body>*').classList.contains('ps2m') && !!document.querySelector('#ps2mf feComponentTransfer')); await shot('ps2-menus');
      const r = await pg.evaluate(() => ({ on: PS2.menu.on, k: PS2.menu.k })); ok(await pg.evaluate(() => ['vit', 'hqb', 'hmap'].every(i => document.getElementById(i).classList.contains('ps2m')) && !document.querySelector('#stage.ps2m,#wlabels.ps2m')), 'and over the HUD (the bars, the hotbar, the map), not the game (9 Nov 2026)'); await pg.evaluate(() => document.getElementById('dps2m').click()); const off = await until(() => !document.querySelector('.ps2m'));
      { await pg.evaluate(() => { document.getElementById('dps2w').click(); const k = document.getElementById('dps2wk'); k.value = '0.5'; k.dispatchEvent(new Event('input')); }); const won = await until(() => document.getElementById('wlabels').classList.contains('ps2w') && !!document.querySelector('#ps2wf') && !!document.querySelector('#ps2mf')), wk = await pg.evaluate(() => PS2.words.k); await pg.evaluate(() => document.getElementById('dps2w').click());
        ok(won && wk === 0.5 && await until(() => !document.querySelector('.ps2w')), 'PS2 FILTER ON WORDS IN THE WORLD: on or off with its own level (9 Nov 2026)'); }
      ok(on && r.on && r.k === 1.5 && off, 'PS2 FILTER ON MENUS: on lays the filter over the open menu at its own level, off takes it away (9 Nov 2026) ' + JSON.stringify(r)); }
    await sub('bug'); ok((await shown()) === 'bug', 'REPORT A BUG');
    await pg.keyboard.press('Escape'); ok(await until(() => !__UI.menuOpen), 'ESC shuts it');
    await pg.keyboard.press('Escape'); ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'set'), 'and opens it again where you were');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
    await pg.evaluate(() => __UI.menuTab('graphics')); ok((await now()).join() === 'set,res', 'the old tab names still land in the right place');
    await pg.evaluate(() => __UI.menuTab('bug')); ok((await now()).join() === 'set,bug', 'F8 lands on REPORT A BUG');
    await pg.evaluate(() => __UI.toggleMenu());
    await pg.evaluate(() => { CINEMA.isAdmin = async () => true; });   // an owner
    await pg.keyboard.press('Escape'); ok(await until(() => !!document.querySelector('#mnav [data-sec="admin"]')), 'an owner sees ADMIN');
    await sec('admin'); ok(await texts('#msub [data-sub]') === 'BUG QUEUE,TEXT,EDITORS,AVATAR,VEHICLES,VEHICLE EDITOR,TOOLS', 'ADMIN: BUG QUEUE, TEXT, EDITORS, AVATAR, VEHICLES, VEHICLE EDITOR, TOOLS (9 Nov 2026)');
    await sub('look'); ok(await until(() => document.querySelector('#dlooks #looks') && !document.querySelector('#looks').hidden && !!document.querySelector('#dhome #cpav')), 'ADMIN > AVATAR: your look beside your live avatar'); await shot('admin-avatar');
    await sub('tools'); ok(await until(() => !!document.querySelector('#dtools #cpstat')), 'TOOLS: stats and the render inspector (no game log, 8 Nov 2026)');
    await shot('admin');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
