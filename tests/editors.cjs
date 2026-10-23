// THE EDITORS CHECK: node tests/editors.cjs dist/market.html. Opens every editor through the EDITORS launcher and exercises its controls; deep-checks the landscape editor (modes, brush, the plant/rock dropdown, erase).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=editors::' : 'FAIL ') + m); } else console.log('ok   ' + m); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');

  if (st) {
    await pg.waitForTimeout(2000);
    const cleanup = () => pg.evaluate(() => {
      try { if (window.WE && window.WE.on) window.WE.toggle(); } catch (e) {}
      try { if (window.GAMEED && window.GAMEED.open) window.GAMEED.toggle(); } catch (e) {}
      const mp = document.getElementById('maped'); if (mp) mp.style.display = 'none';
      try { if (window.CHARED && window.CHARED.on && window.CHARED.show) window.CHARED.show(false); } catch (e) {}
      for (const id of ['lnd', 'led', 'ited']) { const p = document.getElementById(id); if (p && !p.hidden) { const d = p.querySelector('[id="ldone"]'); if (d) d.click(); else p.hidden = true; } }
      const m = document.getElementById('menu'); if (m && !m.hidden) { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (e) {} m.hidden = true; }
    });
    const poll = async (test, ms) => { for (let i = 0; i < ms / 200; i++) { if (await pg.evaluate(test).catch(() => false)) return true; await pg.waitForTimeout(200); } return false; };

    // every editor opens through the launcher (shift+0 menu, shift+1..9)
    const editors = [
      [1, 'WORLD', `!!(window.WE && window.WE.on)`],
      [2, 'MAP', `(() => { const e = document.getElementById('maped'); return !!(window.GAMEED && window.GAMEED.open) && !!e && e.style.display !== 'none'; })()`],
      [3, 'CHARACTER', `(() => { const e = document.getElementById('chared'); return !!e && e.style.display === 'flex'; })()`],
      [4, 'ATMOSPHERE', `(() => { const e = document.getElementById('menu'); return !!e && !e.hidden; })()`],
      [5, 'LIGHTING', `(() => { const e = document.getElementById('led'); return !!e && !e.hidden; })()`],
      [6, 'SOUND', `(() => { const e = document.getElementById('menu'); return !!e && !e.hidden; })()`],
      [7, 'ITEM', `(() => { const e = document.getElementById('ited'); return !!e && !e.hidden; })()`],
      [8, 'BEHAVIOUR', `(() => { const e = document.getElementById('chared'); return !!e && e.style.display === 'flex'; })()`],
      [9, 'LANDSCAPE', `(() => { const e = document.getElementById('lnd'); return !!e && !e.hidden; })()`],
    ];
    for (const [k, name, test] of editors) {
      const before = errs.length;
      try { await pg.evaluate(d => window.EDITORS.key(d), k); } catch (e) { errs.push('open ' + name + ': ' + e.message); }
      const open = await poll(test, k === 2 ? 9000 : 2500); // the map editor fetches and builds its chunk
      ok(open && errs.length === before, 'the ' + name + ' editor opens' + (errs.length > before ? ' (' + errs.slice(before).join('; ') + ')' : ''));
      await cleanup(); await pg.waitForTimeout(500);
    }

    // the landscape editor: all modes and their controls, the plant/rock dropdown
    const before = errs.length;
    const land = await pg.evaluate(() => {
      const r = {}, $ = s => document.querySelector(s), click = s => { const e = $(s); if (e) e.click(); return !!e; };
      window.EDITORS.key(9);
      r.panel = !!$('#lnd') && !$('#lnd').hidden;
      // DRAW (free brush): size controls + ground palette
      click('#lmdraw'); r.draw = !!$('#lbrsm') && !!$('#lbrbg') && !!$('.types');
      const size0 = ($('#lbrsm') ? $('#lbrsm').parentNode.querySelector('.dim').textContent : '');
      click('#lbrbg'); const size1 = ($('#lbrbg') ? $('#lbrbg').parentNode.querySelector('.dim').textContent : '');
      r.brushSize = size0 !== size1;
      // BORDER
      click('#lmbord'); r.border = !!$('#lfin') && !!$('#lcancel');
      // PLANTS: the dropdown of plants/rocks
      click('#lmplant'); const sel = $('#lsel');
      r.plantSel = !!sel && sel.querySelectorAll('optgroup').length >= 4 && sel.querySelectorAll('option').length >= 20;
      r.plantSize = !!$('#lpsm') && !!$('#lpbg') && !!$('#lprot');
      if (sel && sel.options.length) { sel.value = sel.options[sel.options.length - 1].value; sel.dispatchEvent(new Event('change', { bubbles: true })); r.plantPick = true; }
      // ERASE
      click('#lmerase'); r.erase = /remove/i.test($('#lnd').textContent);
      // BOX + pick a ground type
      click('#lmbox'); const types = document.querySelectorAll('#lnd .t');
      r.box = types.length >= 8; // grass variants + sidewalk + cobble + dirt + gravel + slab + sand
      if (types[2]) { types[2].click(); r.typePick = document.querySelectorAll('#lnd .t[aria-pressed="true"]').length === 1; }
      // undo/clear/export buttons present
      r.actions = !!$('#lundo') && !!$('#lclear') && !!$('#lexp');
      click('[id="ldone"]'); // close
      return r;
    }).catch(e => ({ err: e.message }));
    ok(land.panel, 'LANDSCAPE: the panel opens');
    ok(land.draw, 'LANDSCAPE: DRAW mode shows the free-brush size controls and ground palette');
    ok(land.brushSize, 'LANDSCAPE: the brush size changes with SIZE +');
    ok(land.border, 'LANDSCAPE: BORDER mode shows FINISH / CANCEL');
    ok(land.plantSel, 'LANDSCAPE: PLANTS mode lists plants & rocks in a grouped dropdown');
    ok(land.plantSize && land.plantPick, 'LANDSCAPE: a plant can be picked and sized');
    ok(land.erase, 'LANDSCAPE: ERASE mode is available');
    ok(land.box && land.typePick, 'LANDSCAPE: BOX mode offers the ground types and one selects');
    ok(land.actions, 'LANDSCAPE: UNDO / CLEAR / EXPORT are present');
    ok(errs.length === before, 'LANDSCAPE: no errors driving the controls' + (errs.length > before ? ' (' + errs.slice(before).join('; ') + ')' : ''));

    ok(errs.length === 0, 'no page errors across all editors' + (errs.length ? ' (' + errs.join(' | ') + ')' : ''));
  }

  await b.close();
  if (fails.length) { console.log('\n' + fails.length + ' editor check(s) failed'); process.exit(1); }
  console.log('\nall editor checks passed');
})();
