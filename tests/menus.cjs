// THE MENU CHECK: node tests/menus.cjs dist/market.html [folder for screenshots]. ESC opens the wheel (11 Nov 2026), its SETTINGS the one menu: its sections down the left (SETTINGS, PETS, INVENTORY, MAP; ADMIN for owners, 7 Nov 2026; your look in ADMIN > AVATAR, you the paper doll, 9 Nov 2026), each section's parts as tabs along the top; MAP and BAG open their own windows; ESC shuts it.
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
    await pg.keyboard.press('Escape'); ok(await until(() => HUB.on && document.querySelectorAll('#hub path').length >= 13), 'ESC opens the wheel: the menus on top, your things by kind below (11 Nov 2026)');
    { const r = await pg.evaluate(() => ({ top: [...document.querySelectorAll('#hub text:not(.s)')].slice(0, 5).map(t => t.textContent.replace(/\s/g, '')).join(), kinds: ITEMS.GROUPS.length })); ok(r.top === 'SETTINGS,WHATYOUCANDO,PETS,MAP,EMOTES' && r.kinds === 8, 'the wheel: SETTINGS, WHAT YOU CAN DO, PETS, MAP, EMOTES and eight kinds of things ' + JSON.stringify(r)); }
    await pg.keyboard.press('Escape'); ok(await until(() => !HUB.on), 'ESC shuts the wheel');
    await pg.keyboard.press('Escape'); await until(() => HUB.on); await pg.evaluate(() => document.querySelector('#hub path[data-i="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    ok(await until(() => __UI.menuOpen && __UI.menuNow()[0] === 'set' && !HUB.on), 'its SETTINGS opens the menu at SETTINGS');
    ok(await texts('#mnav [data-sec]') === 'SETTINGS,WHAT YOU CAN DO,PETS,INVENTORY,MAP,GUIDE,PEOPLE', 'the sections down the left: SETTINGS, WHAT YOU CAN DO, PETS, INVENTORY, MAP, GUIDE, PEOPLE (WHAT YOU CAN DO the ? list, 10 Nov 2026; MAP a section, 10 Nov 2026; no PROFILE: the paper doll, 9 Nov 2026; no ADMIN for a player; no BBS; GUIDE and PEOPLE back, 11 Nov 2026)');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
    await pg.evaluate(() => DOLL.me()); ok(await until(() => !document.getElementById('doll').hidden), 'double-clicking yourself opens your paper doll');
    ok(await pg.evaluate(() => [...document.querySelectorAll('#doll [data-b]')].map(x => x.textContent).join() === 'EDIT,WEAR,WORDS,SKILLS,JOURNAL,EMOTES,PASSPORT,LOG OUT'), 'the doll has EDIT, WEAR, WORDS, SKILLS, JOURNAL, EMOTES, PASSPORT and LOG OUT');
    await pg.waitForTimeout(1500); await shot('doll');
    await pg.evaluate(() => document.querySelector('#doll [data-b="1"]').click()); ok(await until(() => !document.getElementById('looks').hidden && document.querySelector('#looks .ltabs [data-t=look]').hidden), 'its WEAR opens what you wear, with no LOOK');
    await shot('wear'); await pg.evaluate(() => { document.getElementById('looks').hidden = true; DOLL.me(); });
    await pg.keyboard.press('Escape'); await until(() => HUB.on); await pg.evaluate(() => document.querySelector('#hub path[data-i="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))); await until(() => __UI.menuOpen);
    await sec('pack'); ok(await until(() => BAG.inMenu() && document.querySelector('#dbag #bagp .bgr')), 'INVENTORY opens at BAG, your things in the menu (10 Nov 2026)'); await pg.evaluate(() => document.querySelector('#msub [data-sub="skills"]').click()); ok(await until(() => FORAGE.PACK.open && document.querySelector('#dpack #packp')), 'INVENTORY shows your skills in the menu');
    ok(await texts('#msub [data-sub]') === 'BAG,SKILLS,BOOK,FISHING,JOURNAL', 'INVENTORY: BAG, SKILLS, BOOK, FISHING, JOURNAL');
    await shot('pack');
    await sub('book'); ok(await pg.evaluate(() => FORAGE.PACK.tab === 'book'), 'BOOK');
    await sec('set'); ok((await shown()) === 'display', 'SETTINGS opens at VIEW');
    ok(await texts('#msub [data-sub]') === 'VIEW,CAMERA,SCREEN,CHAT,RESOLUTION,TIME,WEATHER,LIGHT,SOUND,KEYS,CONTROLLER,VR,REPORT A BUG', 'SETTINGS: every setting its own tab (8 Nov 2026)');
    await shot('set-view');
    { const one = []; for (const [k, p] of [['camera', 'camera'], ['screen', 'screen'], ['chat', 'chat'], ['res', 'graphics'], ['time', 'atmo'], ['weather', 'weather'], ['light', 'light'], ['keys', 'keys'], ['vr', 'vr']]) { await sub(k); if ((await shown()) !== p) one.push(k + ':' + (await shown())); } ok(!one.length, 'each tab shows its own one pane' + (one.length ? ': ' + one : '')); }
    await sub('bug'); ok((await shown()) === 'bug', 'REPORT A BUG');
    await pg.keyboard.press('Escape'); ok(await until(() => !__UI.menuOpen), 'ESC shuts it');
    await pg.keyboard.press('Escape'); await until(() => HUB.on); await pg.evaluate(() => document.querySelector('#hub path[data-i="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))); ok(await until(() => __UI.menuOpen && __UI.menuNow().join() === 'set,bug'), 'and the wheel opens it again where you were');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
    await pg.evaluate(() => __UI.menuTab('graphics')); ok((await now()).join() === 'set,res', 'the old tab names still land in the right place');
    await pg.evaluate(() => __UI.menuTab('bug')); ok((await now()).join() === 'set,bug', 'F8 lands on REPORT A BUG');
    await pg.evaluate(() => __UI.toggleMenu());
    await pg.evaluate(() => { CINEMA.isAdmin = async () => true; });   // an owner
    await pg.keyboard.press('Escape'); ok(await until(() => HUB.on && /ADMIN/.test(document.getElementById('hub').textContent)), 'an owner sees ADMIN on the wheel'); await pg.keyboard.press('Escape'); await until(() => !HUB.on);
    await pg.evaluate(() => __UI.menuTab('set')); ok(await until(() => !!document.querySelector('#mnav [data-sec="admin"]')), 'an owner sees ADMIN');
    await sec('admin'); ok(await texts('#msub [data-sub]') === 'BUG QUEUE,TEXT,EDITORS,AVATAR,VEHICLES,VEHICLE EDITOR,SOUND EDITOR,TOOLS', 'ADMIN: BUG QUEUE, TEXT, EDITORS, AVATAR, VEHICLES, VEHICLE EDITOR, SOUND EDITOR, TOOLS (10 Nov 2026)');
    await sub('look'); ok(await until(() => document.querySelector('#dlooks #looks') && !document.querySelector('#looks').hidden && !!document.querySelector('#dhome #cpav')), 'ADMIN > AVATAR: your look beside your live avatar'); await shot('admin-avatar');
    await sub('tools'); ok(await until(() => !!document.querySelector('#dtools #cpstat')), 'TOOLS: stats and the render inspector (no game log, 8 Nov 2026)');
    await shot('admin');
    await pg.keyboard.press('Escape'); await until(() => !__UI.menuOpen);
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
