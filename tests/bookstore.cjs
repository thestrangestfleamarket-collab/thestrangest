// THE BOOKSTORE CHECK: node tests/bookstore.cjs dist/market.html. Nothing of the shop's books loads at start; inside the shop the Professor keeps the counter, the shelves open the catalogue, a book is borrowed free into your pack (five at most), opens to its text (Project Gutenberg's, stubbed here), turns its pages, keeps your place, and goes back at the returns slot.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bookstore::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const TEXT = 'The Project Gutenberg eBook\n\n*** START OF THE PROJECT GUTENBERG EBOOK TEST ***\n\n' + Array.from({ length: 400 }, (_, i) => 'Paragraph ' + (i + 1) + ' of the book, a line of real words\nhard-wrapped at seventy columns, and _emphasis_ too.').join('\n\n') + '\n\n*** END OF THE PROJECT GUTENBERG EBOOK TEST ***\nThe licence.';
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
    await pg.evaluate(() => ROOMS.enter('books')); for (let i = 0; i < 40 && !(await pg.evaluate(() => __dbg.UI.things.some(t => / SHELF$/.test(t.name)))); i++) await pg.waitForTimeout(1000);
    await pg.waitForTimeout(2000);
    let prof = {}; for (let i = 0; i < 20; i++) { prof = await pg.evaluate(() => { return { th: __dbg.UI.things.filter(t => / SHELF$|RETURNS|SIT AND READ/.test(t.name)).map(t => t.name) }; }).catch(e => ({ err: String(e) })); if (prof.th && prof.th.length >= 68) break; await pg.waitForTimeout(1000); }
    ok(prof.th && prof.th.filter(n => / SHELF$/.test(n)).length === 64 && prof.th.some(n => /SIT AND READ/.test(n)) && prof.th.includes('RETURNS'), 'inside: sixteen cases round one floor (six on the back wall, five down each side), four shelves each to look closer at, chairs to sit and read in, the returns (' + prof.th.filter(n => / SHELF$/.test(n)).length + ' shelves; ' + JSON.stringify(prof.th) + ')');
    { const W = JSON.parse(require('fs').readFileSync('data/world.json', 'utf8')), P = W.places.find(p => p.id === 'books'); ok(P && P.merchant === 'professor' && !W.homes.professor, 'the Professor keeps the counter in the bookstore (no street spot of his own)'); }
    const c = await pg.evaluate(async () => { await LIB.open(); const n = document.querySelectorAll('#libp .bk').length, img = document.querySelector('#libp .bk img').getAttribute('src'); return { n, img, d: LIBDBG() }; });
    ok(c.n === c.d.n && c.n === 640 && c.img, 'the shelves open the catalogue: every book with its cover (' + c.n + ' books, ' + c.img + ')');
    const lk = await pg.evaluate(async () => { LIB.close(); await LIB.look(3); const a = { open: !document.querySelector('#libv').hidden, name: LIB.data.cases[3].name }; await new Promise(r => setTimeout(r, 300)); const cv = document.querySelector('#libv canvas'), bk = (() => { const L = LIB.shelfOf(LIB.data.cases[3])[0][0]; return L.b.id; })(); const R0 = cv.getBoundingClientRect(); await LIB.open(bk); const pz = +getComputedStyle(document.querySelector('#libp')).zIndex, vz = +getComputedStyle(document.querySelector('#libv')).zIndex; a.card = !document.querySelector('#libp').hidden && pz > vz; LIB.close(); await LIB.open(); const rows = LIB.shelfOf(LIB.data.cases[3]); LIB.closeLook(); return { ...a, rows: rows.map(r => r.length), fits: rows.every(r => { const L = r[r.length - 1], F = r[0]; return L.x + L.th / 2 - (F.x - F.th / 2) <= .941; }) }; });
    ok(lk.card, 'a book clicked up close opens its card over the shelf');
    ok(lk.open && lk.rows.join() === '10,10,10,10' && lk.fits, 'a case up close: four shelves of ten real books, each shelf\'s books fit inside it (' + lk.name + ')');
    const sh = await pg.evaluate(async () => { const t = __dbg.UI.things.find(t => / LOW SHELF$/.test(t.name)); t.act(); await new Promise(r => setTimeout(r, 600)); const a = LIBDBG().look;
      document.querySelector('#libv [data-v=up]').click(); const b = LIBDBG().look; document.querySelector('#libv [data-v=rot]').click(); document.querySelector('#libv [data-v=rot]').click(); const c = LIBDBG().look; LIB.closeLook(); return { a, b, c }; });
    ok(sh.a && sh.a.row === 1 && sh.b.row === 2 && sh.c.rot === 90 && sh.c.s > sh.a.s * 0 && sh.a.s > sh.a.caseFit, 'a shelf clicked in the shop opens close on that shelf; ▲ goes up the same case; ROTATE turns it to read across (' + JSON.stringify(sh) + ')');
    const one = await pg.evaluate(async () => { const th = n => __dbg.UI.things.find(t => t.name === LIB.data.cases[n].name + ': LOW SHELF'), out = { stack: 'LIBSTACK' in window, at: [] }; for (const n of [0, 7, 13]) { th(n).act(); await new Promise(r => setTimeout(r, 300)); out.at.push(!document.querySelector('#libv').hidden && LIBDBG().look.ci === n); LIB.closeLook(); } return out; });
    ok(!one.stack && one.at.every(Boolean), 'one floor: the back wall\'s and both side walls\' cases all open up close from the floor (' + JSON.stringify(one) + ')');
    { const fs = require('fs'), zlib = require('zlib'), L = JSON.parse(fs.readFileSync('data/library.json', 'utf8')), mb = L.cases.flatMap(c => c.books).find(b => b.txt), gz = fs.readFileSync('data/' + mb.txt).toString('base64');
      const md = await pg.evaluate(async ([id, gz]) => { await LIB.open(id); const card = document.querySelector('#libp').innerText; const u8 = Uint8Array.from(atob(gz), c => c.charCodeAt(0)); LIB.files[id + '~t'] = URL.createObjectURL(new Blob([u8])); LIB.close(); await LIB.read(id); const a = LIBDBG().reading, t = document.querySelector('#libr .scroll') && document.querySelector('#libr .scroll').innerText; LIB.closeBook(); await LIB.open(); return { card, a, t: (t || '').slice(0, 120) }; }, [mb.id, gz]);
      ok(md.a && md.a.paras > 100 && /THE TEXT: .*(public|CC|government)/i.test(md.card), 'a modern book: its card names its source and licence, and its own packed words open in the reader (' + mb.t + ', ' + JSON.stringify(md.a) + ')'); }
    const id = await pg.evaluate(() => LIB.data.books[0].id);
    const br = await pg.evaluate(id => { document.querySelector(`#libp .bk[data-b="${id}"]`).click(); document.querySelector('#libp [data-a=bor]').click(); return { d: LIBDBG(), has: FORAGE.has('lb_' + id) }; }, id);
    ok(br.d.borrowed.includes(id) && br.has === 1, 'BORROW puts it in your pack, free (' + id + ')');
    const cap = await pg.evaluate(() => { for (const b of LIB.data.books.slice(1, 8)) LIB.borrow(b.id); return LIBDBG().borrowed.length; });
    ok(cap === 5, 'five books at a time (' + cap + ')');
    const rd = await pg.evaluate(async id => { LIB.close(); await LIB.read(id); const q = s => document.querySelector('#libr ' + s), a = LIBDBG().reading, txt = q('.scroll').innerText;
      q('[data-a=nextch]').click(); q('[data-a=nextch]').click(); const b2 = LIBDBG().reading;
      q('[data-a=set]').click(); q('[data-s=fs][data-v="1"]').click(); q('[data-s=theme][data-v=night]').click(); const st = LIBDBG().reading.set, bg = getComputedStyle(document.querySelector('#libr')).backgroundColor;
      q('[data-a=mark]').click(); const mk = LIBDBG().reading.marks;
      q('[data-a=find]').click(); const inp = q('[data-k=q]'); inp.value = 'Paragraph 250 of'; inp.dispatchEvent(new Event('input', { bubbles: true })); const hits = document.querySelectorAll('#libr [data-hit]').length; document.querySelector('#libr [data-hit]').click(); const f = LIBDBG().reading;
      const sl = q('[data-k=go]'); sl.value = 0; sl.dispatchEvent(new Event('input', { bubbles: true })); const s0 = LIBDBG().reading.c; sl.value = 99; sl.dispatchEvent(new Event('input', { bubbles: true })); const s9 = LIBDBG().reading.c;
      q('[data-a=prevch]').click(); const keepC = LIBDBG().reading.c; LIB.closeBook(); await LIB.read(id); const c2 = LIBDBG().reading, col = getComputedStyle(q('.pg p')).color; q('[data-a=toc]').click(); const toc = document.querySelectorAll('#libr .side [data-ch]').length; LIB.closeBook();
      return { a, b2, st, bg, mk, hits, f, s0, s9, keepC, c2, col, toc, head: /START OF|Gutenberg/.test(txt), first: /Paragraph 1 of the book/.test(txt), under: /_emphasis_/.test(txt), txt: txt.slice(0, 200) }; }, id);
    ok(rd.a && rd.a.chapters > 3 && rd.first && !rd.head && !rd.under, 'it opens to the book\'s own words, in chapters (parts here), without Project Gutenberg\'s header (' + JSON.stringify(rd.a) + ')');
    ok(rd.b2.c === 2 && rd.toc === rd.a.chapters, 'next chapter twice; the contents list every chapter (' + [rd.b2.c, rd.toc] + ')');
    ok(rd.st.fs === 20 && rd.st.theme === 'night' && /rgb\(22, 19, 15\)/.test(rd.bg), 'Aa: bigger type and the night page (' + JSON.stringify(rd.st) + ' ' + rd.bg + ')');
    ok(rd.mk === 1, 'a bookmark is kept');
    ok(rd.hits >= 1 && rd.f.p === 249, 'search finds a phrase and goes to it (' + [rd.hits, rd.f.c, rd.f.p] + ')');
    ok(rd.s0 === 0 && rd.s9 === rd.a.chapters - 1, 'the slider goes anywhere in the book, start to end (' + [rd.s0, rd.s9] + ')');
    ok(rd.c2.c === rd.keepC && rd.c2.set.fs === 20 && /rgb\(216, 204, 180\)/.test(rd.col), 'closed and opened again: your place and your settings kept, the words readable (' + [rd.c2.c, rd.keepC, rd.col] + ')');
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
