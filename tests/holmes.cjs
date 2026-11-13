// THE SPECKLED BAND CHECK: node tests/holmes.cjs [dist/holmes.html] [shots dir]. The book's cut (every paragraph in one step); worker/holmes.js with a stand-in for Claude (no network, no key): a turn off the book, who is told what, the day's limit, a refusal, the end. The page: the book's road start to finish with nothing asked, a move of your own asked and shown, the story off the road, no login; then an emulated Quest 3.
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=holmes::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const fake = replies => { const sent = []; return { sent, messages: { create: async q => { sent.push(JSON.parse(JSON.stringify(q))); const r = replies.shift(); if (r instanceof Error) throw r; return r; } } }; };
const mem = () => { let v = null; return { get: async () => v && JSON.parse(JSON.stringify(v)), put: async x => { v = JSON.parse(JSON.stringify(x)); return true; }, peek: () => v }; };
const says = t => ({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '', signature: 's' }, { type: 'text', text: typeof t === 'string' ? t : JSON.stringify(t) }] });
const D = o => ({ narration: 'Holmes held out his hand for a fee, and I saw the lady shrink.', speakers: [{ who: 'helen', name: '', cue: 'Hurt and ashamed; she has no money until she marries.' }, { who: 'watson', name: '', cue: 'Shocked at his friend.' }], changed: ['Holmes asked Miss Stoner for his fee in advance'], next: 1, place: 'baker', would: '', others: [], end_title: '', end_text: '', ...o });
(async () => {
  const { BAND } = await import(pathToFileURL(path.join(__dirname, '..', 'src', 'holmes', 'band.js')).href), { HOLMES } = await import(pathToFileURL(path.join(__dirname, '..', 'worker', 'holmes.js')).href);
  const seen = new Array(BAND.P.length).fill(0); for (const b of BAND.BEATS) { if (b.pre) for (let n = b.pre[0]; n <= b.pre[1]; n++) seen[n]++; for (let n = b.from; n <= b.to; n++) seen[n]++; }
  ok(BAND.P.length === 251 && BAND.WHO.length === 251 && seen.every(n => n === 1), 'the whole book is there, every paragraph in exactly one step');
  ok(BAND.BEATS.every(b => b.sum && b.alts.length === 2 && BAND.PLACES[b.place] && b.cast.every(w => BAND.CAST[w])), 'every step has the book\'s move, two others, a place and its people');
  ok(/\[249\] /.test(HOLMES.STAGE) && /swamp adder/.test(HOLMES.STAGE) && /never write anyone's speech/.test(HOLMES.STAGE), 'the stage manager holds the whole book');
  ok(/swamp adder/.test(HOLMES.actor('roylott', '', 8)) && !/swamp adder|snake/i.test(HOLMES.actor('helen', '', 14)) && !/snake/i.test(HOLMES.actor('watson', '', 8)), 'only Dr Roylott knows of the snake');
  ok(/It is fear, Mr. Holmes/.test(HOLMES.actor('helen', '', 2)) && !/speckled band!/i.test(HOLMES.actor('helen', '', 2).split('LIVED THROUGH')[1]) && !/LIVED THROUGH/.test(HOLMES.actor('helen', '', 1)), 'a person is given only what they have lived through before this step');

  const S = mem(), C = fake([says(D()), says('"Sir, I have nothing to give you until I am married."'), says('Holmes, this is not like you.')]);
  const a = await HOLMES.turn({}, S, { i: 1, last: 1, did: 'Ask for your fee in advance.', changed: [], log: [], place: 'baker' }, C);
  ok(a.tale && a.said.length === 2 && a.said[0].who === 'helen' && a.said[0].name === 'Miss Stoner' && a.said[0].say === 'Sir, I have nothing to give you until I am married.' && a.next === 1 && a.changed.length === 1 && !a.end && a.left === HOLMES.DAY - 1, 'a move of his own: what happens, who answers, how the story has changed');
  const q = C.sent[0];
  ok(q.model === 'claude-haiku-5-5' && q.system[0].cache_control && q.output_config.format.type === 'json_schema' && /STEP NOW: 1, at baker/.test(q.messages[0].content) && /HOLMES NOW: Ask for your fee in advance\./.test(q.messages[0].content) && /in nothing/.test(q.messages[0].content), 'Claude Haiku gets the step, the move and that nothing had changed; the book is cached');
  ok(/playing Miss Stoner/.test(C.sent[1].system) && /Hurt and ashamed/.test(C.sent[1].messages[0].content) && /playing Dr Watson/.test(C.sent[2].system) && /Miss Stoner: Sir, I have nothing/.test(C.sent[2].messages[0].content), 'each person is their own Claude, with their cue; the second hears the first');
  const C2 = fake([says(D({ speakers: [], next: 2, changed: ['Holmes asked Miss Stoner for his fee in advance'] }))]);
  const b2 = await HOLMES.turn({}, S, { i: 1, last: 1, did: '', changed: ['Holmes asked Miss Stoner for his fee in advance'], log: [{ did: 'Ask for your fee in advance.', tale: 'x', said: [{ name: 'Miss Stoner', say: 'y' }], seen: ['helen'] }], place: 'baker' }, C2);
  ok(b2.next === 2 && /does exactly as the book's Holmes does/.test(C2.sent[0].messages[0].content) && /- Holmes asked Miss Stoner for his fee/.test(C2.sent[0].messages[0].content) && /LATELY PASSED/.test(C2.sent[0].messages[0].content), 'the book\'s move in a changed story is asked too, with what has changed and what lately passed');
  const off = await HOLMES.turn({}, S, { i: -1, last: 6, did: 'Call a cab for Scotland Yard.', changed: ['x'], log: [], place: 'elsewhere' }, fake([says(D({ speakers: [{ who: 'other', name: 'Inspector Lestrade', cue: 'Sceptical.' }], next: -1, place: 'elsewhere', would: 'Wire to Miss Stoner at once.', others: ['Go home.', 'Take the next train.'] })), says('A whistle in the night, Mr Holmes?')]));
  ok(off.next === -1 && off.would && off.others.length === 2 && off.said[0].name === 'Inspector Lestrade' && off.place === 'elsewhere', 'off the book\'s road: where he is, what Holmes would do, two other things, a stranger answers');
  const e = await HOLMES.turn({}, S, { i: 14, last: 14, did: 'Take her away to Harrow tonight.', changed: [], log: [], place: 'lawn' }, fake([says(D({ speakers: [], next: -1, end_title: 'The Empty Room', end_text: 'We took Miss Stoner to Harrow that night, and the truth of her sister\'s death was never proved.' }))]));
  ok(e.end && e.end.title === 'The Empty Room' && /Harrow/.test(e.end.text), 'a story can end where the book\'s did not');
  ok(/will not play that/.test((await HOLMES.turn({}, S, { i: 1, did: 'x' }, fake([{ stop_reason: 'refusal', content: [] }]))).why), 'a refusal is said plainly');
  ok(/lost the thread/.test((await HOLMES.turn({}, S, { i: 1, did: 'x' }, fake([says('not json')]))).why), 'a muddled answer says try again');
  const n0 = S.peek().n; ok((await HOLMES.turn({}, S, { i: 1, did: 'x' }, fake([new Error('down')]))).why === 'Claude could not be reached' && S.peek().n === n0, 'a failed call says why and counts nothing');
  const L = mem(); await L.put({ day: new Date().toISOString().slice(0, 10), n: 3 });
  ok(/3 turns with you today/.test((await HOLMES.turn({ HOLMES_DAILY: '3' }, L, { i: 1, did: 'x' }, fake([]))).why), 'the day\'s limit stops it');
  ok((await HOLMES.turn({}, S, { i: 99, did: 'x' }, fake([]))).why === 'no such step' && (await HOLMES.turn({}, S, { i: -1, did: '' }, fake([]))).why === 'nothing done', 'a bad step or an empty move is not sent');

  const FILE = process.argv[2] || 'dist/holmes.html', OUT = process.argv[3];
  if (fs.existsSync(FILE)) {
    const { chromium } = require('playwright'), url = 'file://' + path.resolve(FILE);
    const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }), errs = []; pg.on('pageerror', x => errs.push(x.message.slice(0, 300)));
    await pg.addInitScript(() => { window.__asked = []; window.__reply = []; window.__spoke = []; const F = window.fetch; window.fetch = (u, o) => String(u) === '/holmes' ? (__asked.push(JSON.parse(o.body)), Promise.resolve({ json: async () => __reply.shift() })) : F(u, o);
      try { Object.defineProperty(window, 'speechSynthesis', { value: { speak: u => __spoke.push(u.text), cancel() {}, getVoices: () => [] } }); } catch (x) {} });
    await pg.goto(url); await pg.waitForFunction(() => window.__holmes); ok(await pg.isVisible('#title') && /You are Holmes/.test(await pg.textContent('#title')), 'the title says what this is');
    const thru = () => pg.evaluate(() => { let k = 0; while (__holmes.ui.kind === 'read' && k++ < 60) __holmes.press('next'); return __holmes.ui.kind; });
    const st = () => pg.evaluate(() => ({ kind: __holmes.ui.kind, head: __holmes.ui.head, text: __holmes.text(), i: __holmes.S.i, changed: __holmes.S.changed.length, place: __holmes.place(), people: __holmes.people(), btns: __holmes.ui.btns.map(x => x.label) }));
    await pg.click('#play'); await pg.waitForTimeout(600); let s = await st();
    ok(s.kind === 'read' && /On glancing over my notes/.test(s.text) && s.place === 'baker', 'it opens on the book\'s first words, in Baker Street');
    ok(await thru() === 'choose' && (s = await st()) && /Wake Watson/.test(s.text) && s.btns.length === 4 && /BOOK/.test(s.btns[0]), 'then what Holmes does in the book, two other things, and your own words');
    await pg.evaluate(() => __holmes.press('book')); s = await st(); ok(s.kind === 'read' && /Very sorry to knock you up, Watson/.test(s.text) && await pg.evaluate(() => __spoke.length > 0), 'do as the book does and the book\'s own passage is read, aloud too');
    await thru(); s = await st(); ok(s.i === 1 && s.people.includes('helen') && await pg.evaluate(() => __asked.length === 0), 'on to the next step, Miss Stoner in the room, and nobody was asked');
    if (OUT) { await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, 'choose.png') }); }
    await pg.evaluate(r => { __reply.push(r); __holmes.press('alt0'); }, { tale: 'Holmes held out his hand for a fee, and I saw the lady shrink.', said: [{ who: 'helen', name: 'Miss Stoner', say: 'Sir, I have nothing to give you.' }], changed: ['Holmes asked for his fee'], next: 1, place: 'baker', would: '', others: [], end: null }); await pg.waitForTimeout(300); s = await st();
    const q = await pg.evaluate(() => __asked[0]); ok(q && q.i === 1 && /fee in advance/.test(q.did) && q.changed.length === 0 && s.kind === 'read' && /saw the lady shrink/.test(s.text) && /MISS STONER/.test(s.text) && /nothing to give you/.test(s.text), 'another move is sent to the others and their answer is read (' + (q && q.did) + ')');
    if (OUT) { await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, 'answer.png') }); }
    await thru(); s = await st(); ok(s.kind === 'choose' && s.i === 1 && s.changed === 1, 'back at the step, the story now changed');
    await pg.evaluate(r => { __reply.push(r); __holmes.press('book'); }, { tale: 'She left us without another word.', said: [], changed: ['Miss Stoner has left Baker Street unheard'], next: -1, place: 'elsewhere', would: 'Go after her to Waterloo.', others: ['Let her go.', 'Send Watson after her.'], end: null }); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => __asked.length === 2 && __asked[1].did === '' && __asked[1].changed.length === 1 && __asked[1].log.length === 1), 'in a changed story even the book\'s move is asked, with what passed');
    await thru(); s = await st(); ok(s.i === -1 && /Go after her to Waterloo/.test(s.text) && /BEHIND YOU/.test(s.head) && s.btns[1] === 'Let her go.' && s.place === 'elsewhere', 'off the book\'s road it offers what Holmes would do');
    await pg.evaluate(() => __holmes.press('own')); await pg.keyboard.type('I shrug.'); s = await st(); ok(s.kind === 'type' && await pg.evaluate(() => __holmes.ui.field) === 'I shrug.' && s.btns.includes('Q'), 'your own words: typed on a keyboard, or on the page\'s own keys');
    await pg.evaluate(() => { __holmes.press('kO'); __holmes.press('kH'); }); ok(await pg.evaluate(() => __holmes.ui.field) === 'I shrug.oh', 'the page\'s keys write too');
    await pg.evaluate(r => { __reply.push(r); }, { tale: 'So it ended.', said: [], changed: ['x'], next: -1, place: 'elsewhere', would: '', others: [], end: { title: 'An Unheard Client', text: 'We never learned what became of her.' } }); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300); await thru(); s = await st();
    ok(s.kind === 'end' && /AN UNHEARD CLIENT/.test(s.text) && /never learned/.test(s.text), 'a story can end its own way');
    await pg.evaluate(() => __holmes.press('again')); await thru(); await pg.evaluate(r => { __reply.push(r); __holmes.press('alt1'); }, { why: 'login' }); await pg.waitForTimeout(300); s = await st();
    ok(s.kind === 'note' && /Log in at thestrangestfleamarket\.com/.test(s.text), 'without a login it says so, and the book\'s road stays open'); await pg.evaluate(() => __holmes.press('ok'));
    const n = await pg.evaluate(() => __asked.length), walk = await pg.evaluate(() => { const H = __holmes, places = new Set(); let k = 0; while (H.ui.kind !== 'end' && k++ < 900) { places.add(H.place()); H.press(H.ui.kind === 'read' ? 'next' : 'book'); } return { kind: H.ui.kind, text: H.text(), places: [...places], k }; });
    ok(walk.kind === 'end' && /exactly as Dr Watson set it down/.test(walk.text) && await pg.evaluate(() => __asked.length) === n, 'the whole book, start to finish, with nobody asked (' + walk.k + ' presses)');
    ok(['baker', 'lane', 'lawn', 'bedroom', 'roylott', 'inn', 'vigil', 'train'].every(p => walk.places.includes(p)), 'through every place: ' + walk.places.join(', '));
    ok(!errs.length, 'no page errors ' + errs.join(' | ')); await pg.close();

    const vr = await b.newPage({ viewport: { width: 960, height: 600 } }), verr = []; vr.on('pageerror', x => verr.push(x.message.slice(0, 300)));
    await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
    await vr.goto(url); await vr.waitForFunction(() => window.__holmes); await vr.waitForTimeout(600);
    await vr.click('#vr', { noWaitAfter: true }); let on = false; for (let i = 0; i < 40 && !on; i++) { await vr.waitForTimeout(500); on = await vr.evaluate(() => __holmes.xr() && __holmes.ui.kind === 'read'); }
    ok(on, 'the headset session starts and the book opens'); await vr.waitForTimeout(1500);
    const at = await vr.evaluate(() => __holmes.pageAt()); ok(at[1] > .8 && at[1] < 1.3 && at[2] < -.6 && at[2] > -1.3, 'the page stands before you like a book on a stand (' + at.map(x => x.toFixed(2)).join(', ') + ')');
    const point = async id => { await vr.evaluate(id => { const from = [.25, 1.25, -.15], q = __holmes.aimAt(id, from), c = __xrd.controllers.right; c.position.set(...from); c.quaternion.set(...q); }, id); await vr.waitForTimeout(700); };
    await point('next'); ok(await vr.evaluate(() => __holmes.ui.hover) === 'next', 'point a hand at a button and it lights');
    const r0 = await vr.evaluate(() => __holmes.reading().n); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await vr.waitForTimeout(700); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await vr.waitForTimeout(400);
    ok(await vr.evaluate(() => __holmes.reading().n) === r0 + 1, 'the trigger presses it: the page turns');
    if (OUT) await vr.screenshot({ path: path.join(OUT, 'vr.png') });
    ok(!verr.length, 'no page errors in the headset ' + verr.join(' | ')); await b.close();
  } else console.log('(no page at ' + FILE + ': the book and the worker only)');
  console.log(fails.length ? fails.length + ' FAILED' : 'holmes: all passed'); process.exit(fails.length ? 1 : 0);
})();
