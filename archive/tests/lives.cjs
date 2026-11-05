// THE LIVES CHECK: node tests/lives.cjs dist/market.html. The rules (worker/lives.js) give every townsperson a sensible day (asleep, up, fed, at work in their hours, a habit only when it can be done); a record keeps going hour on hour and remembers who it met; in the page, those near you are at work, home or their habit, never piled on one spot, and asking "HOW'S LIFE?" tells their life.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lives::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const L = await import(path.resolve(__dirname, '../worker/lives.js')), D = require('../data/lives.json'), W = require('../data/world.json');
  const homes = new Set([...W.residences.map(r => r.id), 'house', 'subway']), bad = [];
  for (const k in D) { const c = { job: D[k] }, day = []; for (let h = 0; h < 24; h++) day.push(L.lvPlan(k, c, 2400 + h, null));
    const n = s => day.filter(d => d === s).length, odd = day.map((d, h) => L.LV_DO[d] && L.LV_DO[d].hrs && !((a, b) => a <= b ? h >= a && h < b : h >= a || h < b)(L.LV_DO[d].hrs[0], L.LV_DO[d].hrs[1])).some(Boolean);
    if (n('sleep') < 4 || n('work') < 1 || !day.some(d => L.LV_DO[d] && L.LV_DO[d].meal) || odd || !homes.has(D[k].home)) bad.push(k + ' ' + day.join(',')); }
  ok(Object.keys(D).length > 150 && !bad.length, 'every townsperson has a home and a sensible day: asleep 4+ hours, at work, fed, each habit in its own hours (' + Object.keys(D).length + ' lives' + (bad.length ? '; ' + bad.slice(0, 2).join(' | ') : '') + ')');
  const k = Object.keys(D).find(q => D[q].habits.includes('fish')), r = L.lvRun(k, { job: D[k] }, null, 5000, null), m0 = r.money, s0 = r.n.shifts;
  L.lvRun(k, { job: D[k] }, r, 5048, null); L.lvMeet(r, 'ROSA'); L.lvMeet(r, 'ROSA');
  ok(r.H === 5048 && r.n.shifts > s0 && r.money !== m0 && r.log.length > 3 && r.knows.ROSA === 2 && ['happy', 'okay', 'tired', 'hungry', 'bored', 'broke'].includes(r.mood), 'a record goes on hour by hour (shifts, money, a log, a mood) and remembers a player met twice: ' + JSON.stringify({ H: r.H, money: r.money, shifts: r.n.shifts, mood: r.mood, knows: r.knows, last: r.log.slice(-2) }));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=15&at=0,19', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30; i++) { await pg.waitForTimeout(3000); if (await pg.evaluate(() => JOBDBG().filter(j => LIVES.data[j.key]).length > 5)) break; }   // (the cast comes a place at a time)
    await pg.waitForTimeout(8000);
    const a = await pg.evaluate(() => { const J = JOBDBG().filter(j => LIVES.data[j.key]), V = new __dbg.THREE.Vector3(), at = {};
      for (const N of __dbg.npcs()) { let o = N.g, v = true; for (; o; o = o.parent) if (!o.visible) { v = false; break; } if (!v) continue; N.g.getWorldPosition(V); const q = Math.round(V.x / 2) + ',' + Math.round(V.z / 2); at[q] = (at[q] || 0) + 1; }
      return { n: J.length, homed: J.filter(j => j.home).length, goals: J.map(j => j.goal), pile: Math.max(0, ...Object.values(at)) }; });
    ok(a.n > 5 && a.homed === a.n && a.goals.every(g => g === 'work' || g === 'home' || /^off:/.test(g)) && a.pile <= 6, 'the townspeople near you each have a home and are at work, at home or at their habit; none piled on one spot: ' + JSON.stringify({ n: a.n, pile: a.pile, goals: a.goals.slice(0, 8) }));
    const t = await pg.evaluate(k => { ONLINE.feed({ t: 'lives', all: { [k]: { H: LIVES.H(), money: 77, hunger: 1, tired: 1, fun: 6, mood: 'happy', log: [[1, '09:00 caught a fish at the pier']], n: {}, knows: { [ONLINE.myName()]: 3 } } } });
      const N = { key: k, name: 'X', talk: null }, S = LIVES.talk(k, { start: 'hi', lines: { hi: { say: 'Hi.', opts: [{ t: 'GOODBYE.', go: '' }] } } });
      return { server: LIVES.server, opt: S.lines.hi.opts.map(o => o.t), life: S.lines.life && S.lines.life.say, hi: S.lines.hi.say }; }, k);
    ok(t.server && t.opt.includes("HOW'S LIFE?") && /\$77/.test(t.life) && /happy/.test(t.life) && /caught a fish/.test(t.life) && /again/.test(JSON.stringify(t.hi)), 'the server\'s record is what they tell: HOW\'S LIFE? gives what they are up to, where they live, mood, money and their last days; someone they know is greeted again: ' + JSON.stringify(t));
    ok(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
  }
  await b.close(); if (fails.length) process.exit(1);
})();
