// THE BOOKSHELF CHECK: node tests/bookcase.cjs dist/market.html. A fresh apartment has its bookshelf, a few of the bookstore's books from every genre on it; double-clicking it opens the browser by genre, a book opens in the bookstore's reader, one comes off the shelf into your pack and goes back; no page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bookcase::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.route(/gutenberg\.org|\/book\//, r => r.fulfill({ status: 200, contentType: 'text/plain', body: '*** START OF THE PROJECT GUTENBERG EBOOK ***\n\nCHAPTER I.\n\n' + 'It was a bright cold day, and the clocks were striking. '.repeat(40) + '\n\nCHAPTER II.\n\nMore.\n\n*** END OF THE PROJECT GUTENBERG EBOOK ***' }));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&npcwait=99&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    let d = null; for (let i = 0; i < 40; i++) { d = await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built && window.BOOKCASEDBG ? BOOKCASEDBG() : null); if (d && d.live) break; await pg.waitForTimeout(1000); }
    const { at, Lx } = await pg.evaluate(() => BEDROOMDBG());
    const me = at.find(a => a[0] === 'BOOKSHELF');
    ok(!!me, 'a fresh apartment has its bookshelf (' + JSON.stringify(me) + ')');
    const hit = me ? await pg.evaluate(() => ROOMED.clips().map(c => c[0].kind + '/' + c[1].kind)) : ['?'];   // (it stands on the loft's upper floor: clear of what shares its floor)
    ok(!hit.length && me[1] > 0 && me[2] <= Lx + .01, 'it stands clear of the other pieces and inside the walls (' + hit + ')');
    ok(d && d.live >= 1 && d.ids >= 100 && d.genres.length === 1 && /MOST READ/.test(d.genres[0]), 'its books are the bookstore\'s MOST READ, a hundred and more (owner, 12 Nov 2026) (' + JSON.stringify(d && { n: d.ids, g: d.genres.length, all: d.all }) + ')');
    const op = await pg.evaluate(async () => { const t = __dbg.UI.things.find(t => /^BOOKSHELF/.test(t.name)); if (!t) return null; t.act(); for (let i = 0; i < 20 && document.getElementById('libp').hidden; i++) await new Promise(r => setTimeout(r, 250));
      const P = document.getElementById('libp'); return { name: t.name, open: !P.hidden, head: P.querySelector('b') && P.querySelector('b').textContent, tabs: [...P.querySelectorAll('[data-t]')].map(x => x.dataset.t), n: P.querySelectorAll('.bk').length }; });
    ok(op && op.open && /BOOKSHELF/.test(op.head) && op.n === d.ids && op.tabs.length >= 3, 'double-clicking it opens the browser of its books (' + JSON.stringify(op) + ')');
    const g = await pg.evaluate(async () => { const P = document.getElementById('libp'), T = [...P.querySelectorAll('[data-t]')][2]; T.click(); await new Promise(r => setTimeout(r, 100)); return { tab: T.dataset.t, n: P.querySelectorAll('.bk').length }; });
    ok(g.n > 0 && g.n <= d.ids, 'its shelf tab shows its books (' + JSON.stringify(g) + ')');
    const tk = await pg.evaluate(async () => { const P = document.getElementById('libp'); P.querySelector('.bk').click(); await new Promise(r => setTimeout(r, 100)); const id = P.querySelector('[data-a=take]').dataset.b; P.querySelector('[data-a=take]').click(); await new Promise(r => setTimeout(r, 100));
      const a = { id, off: BOOKCASEDBG().off, pack: __dbg.FORAGE ? __dbg.FORAGE.has('hb_' + id) : window.FORAGE && FORAGE.has('hb_' + id), put: !!P.querySelector('[data-a=put]') }; return a; });
    ok(tk.off.includes(tk.id) && tk.put, 'a book comes off the shelf (' + JSON.stringify(tk) + ')');
    const pb = await pg.evaluate(async () => { const P = document.getElementById('libp'); P.querySelector('[data-a=put]').click(); await new Promise(r => setTimeout(r, 100)); return { off: BOOKCASEDBG().off, take: !!P.querySelector('[data-a=take]') }; });
    ok(!pb.off.length && pb.take, 'and goes back on it (' + JSON.stringify(pb) + ')');
    const rd = await pg.evaluate(async () => { document.querySelector('#libp [data-a=read]').click(); for (let i = 0; i < 40 && !(LIBDBG().reading && LIBDBG().reading.paras); i++) await new Promise(r => setTimeout(r, 250)); const r = LIBDBG(); const R = document.getElementById('libr'); return { reading: r.reading, shown: !R.hidden }; });
    ok(rd.shown && rd.reading && rd.reading.id === tk.id && rd.reading.paras > 0, 'a book opens in the bookstore\'s reader (' + JSON.stringify(rd) + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  await b.close();
  if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
  console.log('all ok');
})();
