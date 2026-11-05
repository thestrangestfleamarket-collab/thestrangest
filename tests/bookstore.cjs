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
    await pg.evaluate(() => ROOMS.enter('books')); for (let i = 0; i < 40 && !(await pg.evaluate(() => __dbg.UI.things.some(t => /LOOK CLOSER$/.test(t.name)))); i++) await pg.waitForTimeout(1000);
    await pg.waitForTimeout(2000);
    let prof = {}; for (let i = 0; i < 20; i++) { prof = await pg.evaluate(() => { return { th: __dbg.UI.things.filter(t => /LOOK CLOSER|RETURNS|SIT AND READ/.test(t.name)).map(t => t.name) }; }).catch(e => ({ err: String(e) })); if (prof.th && prof.th.length >= 20) break; await pg.waitForTimeout(1000); }
    ok(prof.th && prof.th.filter(n => /LOOK CLOSER/.test(n)).length === 16 && prof.th.some(n => /SIT AND READ/.test(n)) && prof.th.includes('RETURNS'), 'inside: sixteen cases (three floors: six, six, four) to look closer at, chairs to sit and read in, the returns (' + prof.th.filter(n => /LOOK CLOSER/.test(n)).length + ' cases; ' + JSON.stringify(prof.th) + ')');
    { const W = JSON.parse(require('fs').readFileSync('data/world.json', 'utf8')), P = W.places.find(p => p.id === 'books'); ok(P && P.merchant === 'professor' && !W.homes.professor, 'the Professor keeps the counter in the bookstore (no street spot of his own)'); }
    const c = await pg.evaluate(async () => { await LIB.open(); const n = document.querySelectorAll('#libp .bk').length, img = document.querySelector('#libp .bk img').getAttribute('src'); return { n, img, d: LIBDBG() }; });
    ok(c.n === c.d.n && c.n === 640 && c.img, 'the shelves open the catalogue: every book with its cover (' + c.n + ' books, ' + c.img + ')');
    const lk = await pg.evaluate(async () => { LIB.close(); await LIB.look(3); const a = { open: !document.querySelector('#libv').hidden, name: LIB.data.cases[3].name }; await new Promise(r => setTimeout(r, 300)); const cv = document.querySelector('#libv canvas'), bk = (() => { const L = LIB.shelfOf(LIB.data.cases[3])[0][0]; return L.b.id; })(); const R0 = cv.getBoundingClientRect(); await LIB.open(bk); const pz = +getComputedStyle(document.querySelector('#libp')).zIndex, vz = +getComputedStyle(document.querySelector('#libv')).zIndex; a.card = !document.querySelector('#libp').hidden && pz > vz; LIB.close(); await LIB.open(); const rows = LIB.shelfOf(LIB.data.cases[3]); LIB.closeLook(); return { ...a, rows: rows.map(r => r.length), fits: rows.every(r => { const L = r[r.length - 1], F = r[0]; return L.x + L.th / 2 - (F.x - F.th / 2) <= .561; }) }; });
    ok(lk.card, 'a book clicked up close opens its card over the shelf');
    ok(lk.open && lk.rows.join() === '10,10,10,10' && lk.fits, 'a case up close: four shelves of ten real books, each shelf\'s books fit inside it (' + lk.name + ')');
    const sk = await pg.evaluate(async () => { const L = LIBSTACK, g = L.geo, ST = L.ST, MW = IKIT.MW, A0 = L.A0, wait = ms => new Promise(r => setTimeout(r, ms)), lc = () => L.loc(__dbg.you().x, __dbg.you().z);
      const walk = async (u, v, T = 9000) => { const p = L.pw(u, v); __dbg.go(p[0], p[1]); for (let t = 0; t < T; t += 100) { await wait(100); const q = lc(); if (Math.hypot(q[0] - u, q[1] - v) < .12) return true; } return false; };
      const round = async (dir, turns) => { for (let i = 1; i <= turns * 12; i++) { const a = A0 - dir * i / 12 * 2 * Math.PI; await walk(g.cu + Math.cos(a) * .55, g.cv + Math.sin(a) * .55, 5000); } };
      const out = { y0: L.y0 }; await walk(g.sf - .4, 2.6); await walk(g.sf - .25, .5); await walk(g.sf + .3, .5); out.onStair = L.on;
      await round(1, 1); await walk(g.sf - .35, .5); await wait(600); out.up = { k: L.k, on: L.on, dy: (__dbg.you().y - L.y0) / MW };
      await walk(g.x0s + g.run / 2, g.GV + 1.2, 4000); out.railV = lc()[1];
      const th = n => __dbg.UI.things.find(t => t.name === LIB.data.cases[n].name + ': LOOK CLOSER'); th(13).act(); out.refused = document.querySelector("#libv").hidden; th(9).act(); await wait(300); out.opened = !document.querySelector('#libv').hidden; LIB.closeLook();
      await walk(g.sf - .4, 2.6); await walk(g.sf - .25, .5); await walk(g.sf + .3, .5); await round(-1, 1); await walk(g.sf - .35, .5); await wait(600); out.down = { k: L.k, on: L.on, dy: (__dbg.you().y - L.y0) / MW };
      await walk(g.sf + .3, .5); await round(-1, .5); out.floorWall = L.s; await walk(g.sf - .35, .5); return out; });
    ok(sk.onStair && sk.up.k === 1 && !sk.up.on && Math.abs(sk.up.dy - 2.45) < .15, 'the spiral stair: one turn round climbs to the first gallery (' + JSON.stringify(sk.up) + ')');
    ok(sk.railV < 1.3, 'the gallery\'s rail holds you on it (' + sk.railV.toFixed(2) + ')');
    ok(sk.refused && sk.opened, 'on a gallery you look closer at its own floor\'s cases, not another floor\'s');
    ok(sk.down.k === 0 && Math.abs(sk.down.dy) < .1 && sk.floorWall < .3, 'and back down to the floor; below the first step the stair goes no lower (' + JSON.stringify(sk.down) + ', ' + sk.floorWall + ')');
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
