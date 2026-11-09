// The power mushrooms (owner, 9 Nov 2026): each is named for what it does, the Mushroom Seller sells it, and eating it does that.
const { chromium } = require('playwright'), path = require('path');
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const r = await pg.evaluate(async () => {
      const wait = ms => new Promise(f => setTimeout(f, ms)), o = {}, S = FORAGE.S, W3 = __dbg.W3 || window.W3;
      const N = { shroom_invis: 'INVISIBILITY', shroom_str: 'STRENGTH', shroom_swift: 'SPEED', shroom_fly: 'FLIGHT', airshroom: 'BREATH', glowcap: 'NIGHT VISION', shroom_keen: 'KEEN EYE', shroom_heal: 'HEALING', shroom_cure: 'CURE POISON', shroom_jump: 'JUMP', shroom_luck: 'LUCK', shroom_fire: 'FIREPROOF', shroom_small: 'SHRINK', shroom_big: 'GROW' };
      o.names = Object.entries(N).filter(([id, n]) => FORAGE.name(id) !== n + ' MUSHROOM').map(([id]) => id);
      o.sold = Object.keys(N).filter(id => !FORAGE.SELLS.some(s => s[0] === id));
      o.kit = Object.keys(N).filter(id => !FORAGE.POWER.includes(id) || !FORAGE.KIT[id]);
      const eat = id => { FORAGE.give(id, 1); FORAGE.eat(id); };
      eat('shroom_keen'); eat('shroom_heal'); eat('shroom_jump'); eat('shroom_luck'); eat('shroom_fire');
      o.fx = ['keen', 'regen', 'jump', 'luck', 'fire'].filter(k => !(S.fx[k] > 0));
      await wait(300);
      o.flags = { fire: !__dbg.VIT.burns('lava') && __dbg.VIT.burns('dragon'), luck: SHARED.luck, hi: __dbg.ST.hi };
      S.fx.poison = 30; eat('shroom_cure'); o.cured = !S.fx.poison;
      const sz0 = W3.SZ, settle = async to => { for (let i = 0; i < 120 && Math.abs(W3.SZ / sz0 - to) > .02; i++) await wait(250); return W3.SZ / sz0; };   // it eases in over frames, slow under software drawing
      eat('shroom_big'); o.big = await settle(2);
      eat('shroom_small'); o.small = await settle(.4); o.bigGone = !S.fx.big;
      S.fx.small = .01; o.back = await settle(1);
      return o;
    });
    ok(!r.names.length, 'every power mushroom is named for what it does' + (r.names.length ? ': ' + r.names : ''));
    ok(!r.sold.length, 'the Mushroom Seller sells every one' + (r.sold.length ? ': ' + r.sold : ''));
    ok(!r.kit.length, 'every one is in the kits' + (r.kit.length ? ': ' + r.kit : ''));
    ok(!r.fx.length, 'keen eye, healing, jump, luck and fireproof take hold' + (r.fx.length ? ': missing ' + r.fx : ''));
    ok(r.flags.fire === true && r.flags.luck === 2 && r.flags.hi === 2.5, 'fireproof covers lava (heat 50) but never dragonfire (100); luck and jump reach the systems that read them ' + JSON.stringify(r.flags));
    ok(r.cured, 'the cure poison mushroom takes the poison away');
    ok(Math.abs(r.big - 2) < .03 && Math.abs(r.small - .4) < .03 && r.bigGone && Math.abs(r.back - 1) < .03, 'grow doubles you, shrink takes you to two-fifths and undoes grow, and you come back to your size ' + JSON.stringify([r.big, r.small, r.back]));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(bad ? 1 : 0);
})();
