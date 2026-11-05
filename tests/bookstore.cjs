// THE BOOKSTORE CHECK: node tests/bookstore.cjs dist/market.html. Nothing of the hundred loads at start; inside the shop the Professor keeps the counter, the shelves open the catalogue, a book is borrowed free into your pack (five at most), opens to its text (Project Gutenberg's, stubbed here), turns its pages, keeps your place, and goes back at the returns slot.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bookstore::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const TEXT = 'The Project Gutenberg eBook\n\n*** START OF THE PROJECT GUTENBERG EBOOK TEST ***\n\n' + Array.from({ length: 400 }, (_, i) => 'Paragraph ' + (i + 1) + ' of the book, a line of real words\nhard-wrapped as Gutenberg does it, and _emphasis_ too.').join('\n\n') + '\n\n*** END OF THE PROJECT GUTENBERG EBOOK TEST ***\nThe licence.';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [], got = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  pg.on('request', r => { const u = r.url(); if (/books\.json|data\/books\/|gutenberg|\/book\//.test(u)) got.push(u); });
  await pg.route(/gutenberg\.org\/cache\/epub\/\d+\/pg\d+\.txt/, r => r.fulfill({ status: 200, contentType: 'text/plain', body: TEXT }));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const d0 = await pg.evaluate(() => LIBDBG());
    ok(!d0.data && !got.length && d0.shop, 'the bookstore stands on West St and nothing of its books is fetched at start (' + got.length + ' requests)');
    await pg.evaluate(() => ROOMS.enter('books')); for (let i = 0; i < 40 && !(await pg.evaluate(() => __dbg.UI.things.some(t => /^THE SHELVES/.test(t.name)))); i++) await pg.waitForTimeout(1000);
    await pg.waitForTimeout(2000);
    const prof = await pg.evaluate(() => { return { th: __dbg.UI.things.filter(t => /SHELVES|RETURNS|READING CHAIR|NEW ARRIVALS/.test(t.name)).map(t => t.name) }; }).catch(e => ({ err: String(e) }));
    ok(prof.th && prof.th.length >= 4, 'inside: the shelves, the new arrivals, the reading chair and the returns slot (' + JSON.stringify(prof.th) + ')');
    { const W = JSON.parse(require('fs').readFileSync('data/world.json', 'utf8')), P = W.places.find(p => p.id === 'books'); ok(P && P.merchant === 'professor' && !W.homes.professor, 'the Professor keeps the counter in the bookstore (no street spot of his own)'); }
    const c = await pg.evaluate(async () => { await LIB.open(); const n = document.querySelectorAll('#libp .bk').length, img = document.querySelector('#libp .bk img').getAttribute('src'); return { n, img, d: LIBDBG() }; });
    ok(c.n === c.d.n && c.n >= 90 && c.img, 'the shelves open the catalogue: every book with its cover (' + c.n + ' books, ' + c.img + ')');
    const id = await pg.evaluate(() => LIB.data.books[0].id);
    const br = await pg.evaluate(id => { document.querySelector(`#libp .bk[data-b="${id}"]`).click(); document.querySelector('#libp [data-a=bor]').click(); return { d: LIBDBG(), has: FORAGE.has('lb_' + id) }; }, id);
    ok(br.d.borrowed.includes(id) && br.has === 1, 'BORROW puts it in your pack, free (' + id + ')');
    const cap = await pg.evaluate(() => { for (const b of LIB.data.books.slice(1, 8)) LIB.borrow(b.id); return LIBDBG().borrowed.length; });
    ok(cap === 5, 'five books at a time (' + cap + ')');
    const rd = await pg.evaluate(async id => { LIB.close(); await LIB.read(id); const a = LIBDBG().reading; const txt = document.querySelector('#libr').innerText;
      document.querySelector('#libr [data-a=next]').click(); document.querySelector('#libr [data-a=next]').click(); const b2 = LIBDBG().reading; LIB.closeBook(); await LIB.read(id); const c2 = LIBDBG().reading; LIB.closeBook(); return { a, b2, c2, head: /START OF|Gutenberg/.test(txt), first: /Paragraph 1 of the book/.test(txt), under: /_emphasis_/.test(txt) }; }, id);
    ok(rd.a && rd.a.pages > 10 && rd.first && !rd.head && !rd.under, 'it opens to the book\'s own words, laid out in pages, without Project Gutenberg\'s header (' + JSON.stringify(rd.a) + ')');
    ok(rd.b2 && rd.b2.i === 4 && rd.c2.i === 4, 'pages turn two at a time and your place is kept when you open it again (' + [rd.b2 && rd.b2.i, rd.c2 && rd.c2.i] + ')');
    ok(got.some(u => /gutenberg/.test(u)) && got.filter(u => /gutenberg/.test(u)).length === 1, 'the text was fetched once, only on opening (' + got.filter(u => /gutenberg/.test(u)).length + ')');
    const rt = await pg.evaluate(async () => { const t = __dbg.UI.things.find(t => t.name === 'RETURNS'); t.act(); await new Promise(r => setTimeout(r, 300)); return { d: LIBDBG(), any: Object.keys(INV.items || {}).filter(k => /^lb_/.test(k) && INV.items[k] > 0) }; });
    ok(!rt.d.borrowed.length && !rt.any.length, 'the returns slot takes them all back (' + JSON.stringify(rt.any) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bookstore checks passed');
  process.exit(fails.length ? 1 : 0);
})();
