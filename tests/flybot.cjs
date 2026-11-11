// THE FLYING BOT CHECK: node tests/flybot.cjs [dist/market.html]. worker/flybot.js with a stand-in for Claude (no network, no key): a question and its answer, the memory, the day's limit, a refusal, a bad key. With the page: the bot called from the menu flies beside you, a chat line with @ is asked, its answer is shown, spoken and sent on; another player's bot is drawn and heard only when near.
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=flybot::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const fake = replies => { const sent = []; return { sent, beta: { messages: { create: async q => { sent.push(JSON.parse(JSON.stringify(q))); const r = replies.shift(); if (r instanceof Error) throw r; return r; } } } }; };
const mem = () => { let v = null; return { get: async () => v && JSON.parse(JSON.stringify(v)), put: async x => { v = JSON.parse(JSON.stringify(x)); return true; }, peek: () => v }; };
(async () => {
  const { FLYBOT } = await import(pathToFileURL(path.join(__dirname, '..', 'worker', 'flybot.js')).href);
  const M = FLYBOT.mind(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'guide.json'), 'utf8')));
  ok(/GETTING STARTED/.test(M.SYSTEM) && /read aloud/.test(M.SYSTEM), 'its mind holds the guide book and knows it is heard, not read');
  const S = mem(), C = fake([
    { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '', signature: 's' }, { type: 'text', text: 'That bright one is **Jupiter**.' }] },
    { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Four big ones.' }] },
    { stop_reason: 'refusal', content: [] }]);
  const a = await M.ask({}, S, { say: 'what is that bright star?', name: 'ROSA', state: 'the player is near THE PARK' }, C);
  ok(a.say === 'That bright one is Jupiter.' && a.left === FLYBOT.DAY - 1, 'a question is answered in plain words (' + a.say + ')');
  const q = C.sent[0];
  ok(q.model === FLYBOT.MODEL && q.fallbacks === 'default' && q.system[0].cache_control && /ROSA asks: what is that bright star\?/.test(q.messages[0].content) && /near THE PARK/.test(q.messages[0].content), 'Claude gets the question, who asked and where they are; the guide is cached');
  await M.ask({}, S, { say: 'how many moons?', name: 'ROSA' }, C);
  ok(C.sent[1].messages.length === 3 && C.sent[1].messages[1].content === 'That bright one is Jupiter.' && !/near THE PARK/.test(C.sent[1].messages[0].content), 'it remembers the talk (words only)');
  ok((await M.ask({}, S, { say: 'x' }, C)).say === "I can't help with that one.", 'a refusal is said plainly');
  const L = mem(); await L.put({ hist: [], day: new Date().toISOString().slice(0, 10), n: 3 });
  const lim = await M.ask({ BOT_DAILY: '3' }, L, { say: 'one more?' }, fake([]));
  ok(lim.why && /3 questions today/.test(lim.why), 'the day\'s limit stops it (' + lim.why + ')');
  const E = mem(), bad = await M.ask({}, E, { say: 'hi' }, fake([new Error('down')]));
  ok(bad.why === 'Claude could not be reached' && !E.peek(), 'a failed call says why and counts nothing');
  ok((await M.ask({}, E, { say: '  ' }, fake([]))).why === 'nothing to answer', 'an empty question is not sent');

  const page = process.argv[2] || 'dist/market.html';
  if (fs.existsSync(page)) {
    const { chromium } = require('playwright');
    const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
    await pg.goto('file://' + path.resolve(page) + '?fresh=1&hour=13&at=49,10', { waitUntil: 'commit' });
    let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
    ok(st, 'the page starts');
    if (st) {
      await pg.waitForTimeout(2000);
      await pg.evaluate(() => { window.__sent = []; ONLINE.send = m => __sent.push(m); window.__spoke = []; window.__asked = [];
        window.speechSynthesis = window.speechSynthesis || {}; try { Object.defineProperty(window, 'speechSynthesis', { value: { speak: u => __spoke.push([u.text, u.volume]), cancel() {}, getVoices: () => [] } }); } catch (e) { speechSynthesis.speak = u => __spoke.push([u.text, u.volume]); }
        const F = window.fetch; window.fetch = (u, o) => String(u) === '/bot' ? (__asked.push(JSON.parse(o.body)), Promise.resolve({ json: async () => ({ say: 'Double-click the bench to sit.' }) })) : F(u, o); });
      ok(await pg.evaluate(() => !FLYBOTDBG().on && !FLYBOTDBG().bots.length && !!document.querySelector('#dflybot')), 'no bot until you call it; the menu\'s CHAT has FLYING BOT');
      await pg.evaluate(() => document.querySelector('#dflybot').click());
      await pg.waitForTimeout(2500);
      const d = await pg.evaluate(() => { const D = FLYBOTDBG(), B = D.bots[0], P = __dbg.you(), TILE = D.tile; return B && { d: Math.hypot(B.x - P.x, B.z - P.z) / TILE, up: (B.y - SHARED.py) / TILE, say: B.say, key: __dbg.ui().keyOf('ask') }; });
      ok(d && d.d > .3 && d.d < 1.2 && d.up > 1.5 && d.up < 2.2, 'called, it flies beside your head (' + JSON.stringify(d) + ')');
      ok(d && /Ask me anything/.test(d.say) && d.key === '/' && await pg.evaluate(() => __spoke.length === 1), 'it says hello aloud and how to ask');
      await pg.evaluate(() => { const D = FLYBOTDBG(); D.me.x += 6 * D.tile; });
      await pg.waitForTimeout(2500);
      const f = await pg.evaluate(() => { const D = FLYBOTDBG(), B = D.bots[0]; return Math.hypot(B.x - D.me.x, B.z - D.me.z) / D.tile; });
      ok(f < 1.3, 'it follows you (' + f.toFixed(2) + ' tiles away after you move 6)');
      await pg.evaluate(() => ONLINE.bot.heard('hello everyone'));
      await pg.evaluate(() => ONLINE.bot.heard('@ how do I sit down?'));
      await pg.waitForTimeout(600);
      const r = await pg.evaluate(() => ({ asked: __asked, sent: __sent.filter(m => m.t === 'bot'), spoke: __spoke.slice(1), say: FLYBOTDBG().bots[0].say, me: ONLINE.mine.ab() }));
      ok(r.asked.length === 1 && r.asked[0].say === 'how do I sit down?' && /near /.test(r.asked[0].state), 'only a chat line with @ is asked, with where you are (' + (r.asked[0] && r.asked[0].state) + ')');
      ok(r.say === 'Double-click the bench to sit.' && r.spoke.length === 1 && r.spoke[0][0] === r.say && r.sent.length === 1 && r.sent[0].text === r.say && r.me === 1, 'its answer is shown over it, spoken, and sent to the players near you');
      // another player with a bot, near and then far
      await pg.evaluate(() => { const P = __dbg.you(), TILE = FLYBOTDBG().tile; ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', x: { ab: 1 }, at: [P.x + 3 * TILE, P.z, SHARED.py, 0, SHARED.LVL, ''] }] }); });
      await pg.waitForTimeout(2000);
      await pg.evaluate(() => { __spoke.length = 0; ONLINE.feed({ t: 'bot', id: 'a', text: 'Vega is the bright blue one.' }); });
      await pg.waitForTimeout(300);
      const o = await pg.evaluate(() => ({ bots: FLYBOTDBG().bots.filter(x => x.id === 'a'), spoke: __spoke.slice() }));
      ok(o.bots.length === 1 && o.bots[0].seen && o.bots[0].say === 'Vega is the bright blue one.' && o.spoke.length === 1 && o.spoke[0][1] < 1 && o.spoke[0][1] > .5, 'a player near you has their bot too, heard quieter with distance (' + (o.spoke[0] && o.spoke[0][1].toFixed(2)) + ')');
      await pg.evaluate(() => { const P = __dbg.you(), TILE = FLYBOTDBG().tile; __spoke.length = 0; for (let i = 0; i < 3; i++) ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + 40 * TILE, P.z, SHARED.py, 0, SHARED.LVL, ''] }); });
      await pg.waitForTimeout(2500);
      await pg.evaluate(() => ONLINE.feed({ t: 'bot', id: 'a', text: 'Too far to hear.' }));
      await pg.waitForTimeout(300);
      ok(await pg.evaluate(() => __spoke.length === 0), 'a bot 40 tiles away is not heard');
      await pg.evaluate(() => document.querySelector('#dflybot').click());
      await pg.waitForTimeout(500);
      ok(await pg.evaluate(() => !FLYBOTDBG().bots.some(x => x.id === 'me') && ONLINE.mine.ab() === null), 'sent off from the menu, it is gone');
      if (process.argv[3]) { await pg.evaluate(() => { document.querySelector('#dflybot').click(); __dbg.ui().setView('third'); }); await pg.waitForTimeout(3000); await pg.screenshot({ path: process.argv[3] }); }
    }
    ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await b.close();
  } else console.log('(no page at ' + page + ': the mind only)');
  console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})();
