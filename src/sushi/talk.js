// the patrons' voices: every one a person Claude Haiku speaks for (POST /sushi/talk), said aloud (POST /sushi/say, else the browser's voice); no words are shown. Your own voice is always on; they hear you, see you wave, and speak first sometimes; so do the people passing in the street; and they say so when the cook hurts them (react.js)
import { G, V3, pick } from './ctx.js';
import { SEATS, RECIPES, DRINKS } from './cart.js';
import { mon as usd } from './till.js';
import { RB } from './rb.js';

const NAMES = { m: ['Tony', 'Luis', 'Marcus', 'Stan', 'Old Abe', 'Eddie', 'Wei', 'Carlos', 'Ray', 'Vinnie', 'Jerome', 'Mikhail'], f: ['Rosa', 'Denise', 'Linda', 'Yolanda', 'Old Sadie', 'Carmen', 'Soo-Jin', 'Patrice', 'Debbie', 'Gloria', 'Irina', 'Tanya'] };
const JOBS = ['a token booth clerk on the F line', 'a Con Edison meter reader', 'a legal secretary at a firm near City Hall', 'a line cook at a diner on Second Avenue', 'a painter with a loft on the Bowery', 'a doorman at a building uptown', 'a garment cutter from a shop on Canal Street', 'a public school teacher', 'a longshoreman off the Brooklyn piers', 'a bike messenger', 'a typesetter at a weekly paper', 'a night janitor at an office tower downtown', 'a drummer between gigs', 'a nurse\'s aide', 'a hot dog vendor on his day off', 'a super for three buildings on the block'];
const MOODS = ['tired but friendly', 'wound up and talkative', 'quiet and polite', 'in a hurry', 'in a good mood after good news', 'gloomy about the rent', 'curious and chatty', 'gruff but fair', 'a little lonely and glad of company'];
const STYLES = ['speaks in short, plain sentences', 'talks fast and laughs at their own jokes', 'is polite and a little shy', 'speaks slowly and thinks before answering', 'is blunt and a little loud', 'is warm and asks questions back', 'is dry and deadpan'];
const STORIES = ['Your boss chewed you out in front of everybody today.', 'Your landlord wants to raise the rent again and you are fighting it.', 'You had good news today and want to tell someone.', 'You were stuck forty minutes in a subway tunnel this morning.', 'You lost twenty dollars on the Mets.', 'You have a job interview on Monday and you are nervous.', 'You have been on your feet since six.', 'You found a five-dollar bill on the sidewalk this morning.', 'Your sister is getting married in Queens next month.', 'You only moved to this neighborhood in the summer and it is all new.', 'Your car got towed on Tuesday and you are still sore about it.', 'You just saw a movie at the theater on Second Avenue and it was terrible.'];
const QUIRKS = ['You have eaten at this cart for years.', 'This is your first time at the cart; you have never had real ramen before, only the kind in a packet.', 'You compare everything to a place in Chinatown.', 'You always ask how business is.', 'You think the neighborhood was better ten years ago.', 'You read the paper while you eat and remark on it.', 'You are particular about which stool you take.', 'You are counting your dollars carefully today.', 'You tip in quarters and apologise for it.'];
const FITS = RB; // each person's voice and age (rb.js)
const VOICES = { m: ['orion', 'perseus'], f: ['luna', 'stella'] };
// what they say when no mind answers: plain New York English of 1985, a good many lines to each kind and none said again until all of its kind have been; {hello} and {bye} are by the hour (never "Evening" at ten in the morning)
const HELLO = { morning: ['Morning.', 'Good morning.', 'Hey, good morning.', 'Morning, chef.', 'Hi, morning.', 'Hey there. Morning.'], afternoon: ['Hey.', 'Hi there.', 'Afternoon.', 'Hey, how you doing?', 'Hi.', 'Hello.', 'Hey there.', 'How\'s it going?'], evening: ['Evening.', 'Good evening.', 'Hey, evening.', 'Hi there.', 'Hey.', 'Evening, chef.', 'How you doing tonight?'], night: ['Hey.', 'Hi.', 'Hey there.', 'Hey, you\'re still open. Good.', 'Hi. Long night.', 'Hey, glad you\'re open.', 'How you doing tonight?'] };
const BYE = { morning: ['Have a good one.', 'Take care.', 'Have a good day.', 'See you.', 'Take it easy.'], afternoon: ['Have a good one.', 'Take care.', 'Have a good day.', 'See you.', 'Take it easy.', 'See you around.'], evening: ['Have a good night.', 'Take care.', 'Good night.', 'See you.', 'Take it easy.'], night: ['Good night.', 'Get home safe.', 'Take care.', 'Night.', 'Have a good one.'] };
const CANNED = {
  order: ['{hello} {Order}, please.', '{hello} Let me get a {order}.', '{hello} Can I get a {order}?', '{hello} I\'ll have the {order}.', '{hello} One {order}, please.', '{hello} Give me a {order}, would you?', '{hello} {Order} for me.', '{hello} I\'ll take a {order}.', '{hello} How about a {order}?', '{hello} A {order}, when you get a second.', '{hello} Could I get a {order}, please?', '{hello} Let me have a {order}.', '{hello} I think I\'ll have the {order}.', '{hello} A {order}, thanks.'],
  more: ['Oh, and {a drink} too, please.', 'Can I get {a drink} with that?', 'And {a drink}, please.', 'You know what, {a drink} too.', 'Let me get {a drink} with that.', 'Oh, could I have {a drink} as well?', 'And throw in {a drink}.', 'I\'ll take {a drink} too.', '{A drink} with that, if you\'ve got a cold one.', 'Also {a drink}, thanks.', 'Oh, and something to drink. {A drink}.', 'Can you add {a drink}?'],
  gotdrink: ['Thanks.', 'Thank you.', 'Great, thanks.', 'Thanks a lot.', 'Appreciate it.', 'Perfect, thanks.', 'Ah, thank you.', 'Thanks, chef.', 'Good, thanks.', 'That\'s the one. Thanks.'],
  impatient: ['Is mine coming up soon?', 'How\'s that bowl coming?', 'Sorry, is it going to be much longer?', 'I\'ve got to get going soon.', 'I\'m getting pretty hungry over here.', 'Any idea how long?', 'Did you forget about me?', 'I\'ve been here a while, you know.', 'Hey, is mine next?', 'I don\'t have all day, chef.', 'Is there a problem with my order?', 'Still waiting over here.'],
  good: ['Oh, that\'s good. Thank you.', 'Wow. That hits the spot.', 'Mm. This is great, thanks.', 'That\'s exactly what I needed.', 'Thank you. This is really good.', 'Oh man, that\'s good soup.', 'This is why I come here.', 'Perfect. Thanks, chef.', 'Now that is a bowl of noodles.', 'Thanks. Best thing I\'ve had all week.', 'Mm, that\'s the stuff.', 'Thank you. You know what you\'re doing.', 'Beautiful. Thank you.'],
  ok: ['Thanks. Not bad.', 'Thank you. It\'s all right.', 'Mm. It\'s okay.', 'Thanks. It\'ll do.', 'Not bad. Thanks.', 'Thanks. It\'s fine.', 'Okay. Thanks.', 'It\'s decent. Thank you.', 'Thanks. I\'ve had better, I\'ve had worse.', 'Pretty good. Thanks.'],
  bad: ['Hm. This isn\'t what I ordered.', 'Something\'s off with this bowl.', 'Uh, I don\'t think this is right.', 'Thanks, but this isn\'t what I asked for.', 'Hey, this is wrong.', 'This doesn\'t taste right to me.', 'I think you mixed up my order.', 'Come on, this isn\'t it.', 'Sorry, but this is not good.', 'What happened to this one?'],
  angry: ['Forget it. I can\'t wait any longer.', 'That\'s it, I\'m leaving.', 'I\'ve waited long enough. Forget it.', 'You know what? Never mind.', 'I don\'t have time for this.', 'Unbelievable. I\'m out of here.', 'Forget the whole thing.', 'I could have cooked it myself by now.'],
  reply: ['Yeah, I hear you.', 'Is that right?', 'Ha. If you say so.', 'Sure, sure.', 'You got that right.', 'No kidding.', 'Tell me about it.', 'Yeah?', 'Huh. How about that.', 'I guess so.', 'Could be.', 'That\'s what they say.', 'Well, what can you do.', 'Right.'],
  wave: ['Hey!', 'Hey, chef!', 'Hi there!', 'How you doing?', 'Hey, busy today?', 'Looking good back there!', 'Hey! Smells great.', 'Hiya!', 'Hey, how\'s it going?', 'There you are!'],
  react: ['Whoa! Everything okay back there?', 'Careful!', 'Hey, watch it!', 'You all right?', 'Ha. Butterfingers.', 'Whoa, easy!', 'Yikes.', 'That didn\'t sound good.', 'Oh boy.', 'Need a hand back there?', 'Rough day, huh?'],
  chat: ['Nice day out, at least.', 'Been busy today?', 'It smells great back there.', 'How long have you had the cart here?', 'You always set up on this block?', 'Long day. This is the best part of it.', 'You follow the Mets? They could still catch St. Louis.', 'My rent went up again. You believe that?', 'The F train took forever today.', 'My super still hasn\'t fixed the hot water.', 'You make the broth yourself?', 'I walk by here every day. Finally stopped.', 'Con Ed\'s been digging up that street for a month.', 'You ever take a day off?', 'They say it might rain tonight.', 'This neighborhood\'s changing, you notice?', 'I should bring my sister here.', 'What\'s good besides the shoyu?'],
  chatnight: ['Quiet tonight. I kind of like it.', 'Nothing like hot soup on a wet night.', 'Long shift. Glad you\'re still open.', 'The city\'s different this late, huh?', 'You stay open till morning?', 'I just got off work. First thing I\'ve eaten all day.', 'You get a lot of people this late?', 'Friday night and I\'m eating noodles alone. Could be worse.', 'The neon looks nice in the rain.', 'I couldn\'t sleep. Figured I\'d come down.', 'The bars let out soon. Watch out.', 'You hear that band at the club down the street?', 'It\'s peaceful out here, this hour.', 'Trains are running slow tonight.', 'I could smell this from down the block.', 'Can\'t beat this at two in the morning.'],
  chatkid: ['Can I watch you make it?', 'My pop says you make the best soup on the block.', 'Do you ever burn yourself?', 'Is it hard, making noodles?', 'I want a cart like this when I grow up.', 'The Mets are gonna win it all, you watch.', 'You see Kenny dancing by the subway?', 'How come the egg is brown?', 'Can I have the fish when it gets big?', 'I ran all the way here.'],
  noise: ['Sorry, what?', 'Huh? Say that again?', 'What was that?', 'I didn\'t catch that.', 'Come again?', 'Sorry?', 'One more time?', 'Hm? I couldn\'t hear you.', 'Say again?', 'Pardon?'],
  pay: ['Here you go.', 'There you are.', 'That should cover it.', 'Here, chef.', 'Here\'s what I owe you.', 'What do I owe you? Here.', 'This should do it.', 'Here you go. Keep cooking.', 'There. Thanks.', 'Let me settle up. Here.'],
  thanks: ['Thanks. {bye}', 'Thank you. {bye}', 'Thanks a lot. {bye}', 'That was great. {bye}', 'Thanks, chef. {bye}', 'All right, thank you. {bye}', 'Thanks. See you next time.', 'Thank you. I\'ll be back.', 'Thanks. {bye}', 'Good stuff. {bye}', 'Much appreciated. {bye}', 'Thanks. See you around.'],
  short: ['Hey, I think you shorted me.', 'Hold on, this isn\'t right.', 'Wait, that\'s not all my change.', 'You\'re a little short there, chef.', 'Count that again? I think it\'s short.', 'Hang on, I gave you more than that.', 'This isn\'t the right change.', 'I think you owe me a bit more.'],
  shorted: ['Forget it. Keep it.', 'Never mind.', 'Whatever. I\'m going.', 'Fine. Forget it.', 'Not worth it. Bye.', 'Keep it, then.'],
  over: ['Oh, you gave me too much. Here.', 'Hey, that\'s too much change.', 'Whoa, this is extra. Take it back.', 'You overpaid me there, chef.', 'This isn\'t mine. Here.', 'You gave me a little extra. Here you go.', 'Too much. Here.', 'I think you miscounted. Here\'s the extra.'],
  waitchange: ['Can I get my change?', 'Uh, my change?', 'I\'m still waiting on my change.', 'You owe me some change, I think.', 'Could I have my change, please?', 'Don\'t forget my change.', 'My change, chef?', 'Change, please?'],
  hurt: ['Hey! What\'s the matter with you?', 'Ow! What was that for?', 'Are you out of your mind?', 'Hey! Watch it!', 'What is wrong with you?', 'Ow! Cut it out!', 'You crazy or something?', 'Hey, hey! Knock it off!', 'What are you doing?', 'Jeez! You hit me!'],
  police: ['Hey! Step back from the counter. Now.', 'All right, what\'s going on here?', 'I saw that. Hands where I can see them.', 'Police. Put that down and step back.', 'What do you think you\'re doing, pal?', 'Okay, take it easy. What happened?'],
  greet2: ['{hello}', 'Hey.', 'Hi.', 'How you doing?', '{hello}', 'Hey there.', 'Hi, chef.', '{hello}'],
  hail: ['{hello}', 'Hey, chef!', 'How you doing?', 'Hey! Busy today?', 'Hey there!', 'Looking good!', 'Hey, how\'s business?', 'Hiya!', 'What do you say, chef?', 'Hey! Save me a bowl!'],
  hello: ['{hello}', 'Hey, chef!', 'Smells good today!', 'Hey, you\'re open!', 'How\'s it going?', 'Hey! I\'ll be by later.', 'Looking busy!', 'Hey there, chef.', 'How\'s business?', 'Don\'t work too hard!', 'Hey! Keep one warm for me.', 'Best soup downtown, right there.'],
  snub: ['Not today.', 'Forget it.', 'Don\'t talk to me.', 'Yeah, no.', 'Leave me alone.', 'After what you did? No.', 'I\'ve got nothing to say to you.'],
};
// a line of a kind: the next of its pile, shuffled; a pile used up is shuffled again (never opening on the line it closed on)
const DECK = {}, drawFrom = (key, set) => { let d = DECK[key]; if (!d || !d.length) { const last = d && d.last; d = set.map((_, i) => i); for (let i = d.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [d[i], d[j]] = [d[j], d[i]]; } if (d.length > 1 && set[d[d.length - 1]] === last) [d[0], d[d.length - 1]] = [d[d.length - 1], d[0]]; DECK[key] = d; } const s = set[d.pop()]; d.last = s; return s; };
const daypart = () => (G.clock && G.clock.daypart ? G.clock.daypart() : 'afternoon');
const DRINKNAME = { soda: 'a soda', tea: 'an iced tea' }, cap = (s) => s[0].toUpperCase() + s.slice(1);
export const canned = (kind, c) => { if ((kind === 'chat' || kind === 'chatnight') && c && c.voice && c.voice.age < 14) kind = 'chatkid'; const set = CANNED[kind] || CANNED.reply, dp = daypart(), o = c && c.order, dish = o ? o.recipe.name.toLowerCase() + ' ramen' : 'ramen', dr = DRINKNAME[o && o.drink] || 'a soda';
  return drawFrom(kind, set).replace('{hello}', () => drawFrom('hello:' + dp, HELLO[dp])).replace('{bye}', () => drawFrom('bye:' + dp, BYE[dp])).replace('{Order}', cap(dish)).replace('{order}', dish).replace('{A drink}', cap(dr)).replace('{a drink}', dr); };
export const LINES = CANNED;

export function buildTalk() {
  const talk = { live: null, tts: null, mic: 'off', diag: { hear: '-', think: '-', say: '-' } };
  G.talk = talk; talk.canned = canned; talk.lines = CANNED;
  const persona = (c) => {
    const nb = c.p.cast && c.p.cast.name ? c.p.cast : null; if (nb) { const fit = FITS[nb.style] || ['m', 'orion', 1], g = fit[0]; return { g, name: nb.name, age: nb.age, job: nb.job, mood: pick(MOODS), quirk: nb.quirk, style: pick(STYLES), story: G.block.story(nb), speaker: fit[1], pitch: fit[2] }; }
    const g = c.p.sex || 'm', fit = FITS[c.p.style] || [g, pick(VOICES[g]), 1, 24, 60, ''];
    return { g, name: pick(NAMES[g]), age: fit[3] + ((Math.random() * (fit[4] - fit[3] + 1)) | 0), job: fit[5] || pick(JOBS), mood: pick(MOODS), quirk: pick(QUIRKS), style: pick(STYLES), story: pick(STORIES), speaker: fit[1], pitch: fit[2] };
  };
  const menuText = () => { const g = G.game; if (!g) return ''; const on = g.cfg().menu.map((k) => `${RECIPES[k].name.toLowerCase()} ramen ${usd(RECIPES[k].price)}`); return `The board, cash only: ${on.join(', ')}${g.cfg().drinks ? `, a can of soda ${usd(DRINKS.soda)}, a can of iced tea ${usd(DRINKS.tea)}` : ''}.`; };
  const when = () => (G.clock ? `It is ${G.clock.time()} on Friday 4 October 1985, in the ${G.clock.daypart() === 'night' ? 'middle of the night' : G.clock.daypart()}${G.rainK > 0.02 ? '; it is raining a little' : ''}: if you greet anyone, greet them as the hour asks.` : '');
  const orderText = (o) => `${o.recipe.name.toLowerCase()} ramen${o.firm ? ', noodles firm' : ''}${o.no ? `, no ${o.no}` : ''}${o.tops.chashu === 3 ? ', extra chashu' : ''}${o.drink ? `, and ${DRINKNAME[o.drink] || 'a ' + o.drink}` : ''}`;
  // everything said and heard, with how long it took and what went wrong, sent to the site in batches (POST /sushi/log) so a night's talk can be read back
  const SID = Math.random().toString(36).slice(2, 10) + Date.now().toString(36), book = []; let bookT = 0;
  const note = (o) => { book.push({ at: Date.now(), gt: +G.t.toFixed(1), seats: G.game ? G.game.customers.filter((c) => c.state !== 'walk' && c.state !== 'leaving').length : 0, ...o }); if (book.length > 60) book.shift(); return book[book.length - 1]; };
  const flush = () => { if (!book.length) return; const lines = book.splice(0, book.length); fetch('/sushi/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: SID, lines }), keepalive: true }).catch(() => { }); };
  talk.note = note; talk.flush = flush; talk.book = book; addEventListener('pagehide', flush);
  const voiceOf = (c) => c.voice || (c.voice = c.p.cast && c.p.cast.name ? (c.p.vox ||= { ...persona(c), history: [], busy: false, gen: 0 }) : { ...persona(c), history: [], busy: false, gen: 0 }); // a regular is one voice, at the counter or passing
  const here = (c) => (c.here ? c.here() : G.game.customers.includes(c));

  // ---- one floor (owner, 16 Nov 2026: "its hard for the convo to flow because of all the stops starts and talking over"): every line goes through this director, which lets one person speak at a time, never over the cook
  const PRIO = { hurt: 5, police: 5, reply: 4, ack: 4, noise: 4, order: 3, more: 3, gotdrink: 3, good: 3, ok: 3, bad: 3, angry: 3, pay: 3, thanks: 3, short: 3, shorted: 3, over: 3, waitchange: 3, impatient: 2, greet2: 2 }, AGE = [0, 5, 10, 20, 8, 6]; // seconds a line may wait for the floor before its moment has passed
  const D = { q: [], cur: null, lastEnd: -9, gap: 0.4, cookAt: -9, cookOn: false, cookEnd: -9, lastWho: null, echo: 0.6, tm: 0, bus: null, outAn: null, outBuf: null };
  const nowS = () => performance.now() / 1000;
  talk.D = D; talk.clockS = nowS;
  let room = null;
  const wet = () => { if (room) return room; const ac = G.audio.ctx, n = (ac.sampleRate * 0.5) | 0, ir = ac.createBuffer(2, n, ac.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / n, 3.2) * (i < 260 ? i / 260 : 1); } } const cv = ac.createConvolver(), g = ac.createGain(); cv.buffer = ir; g.gain.value = 0.5; cv.connect(g); g.connect(G.audio.master); return (room = cv); };
  const bus = () => { if (D.bus) return D.bus; const ac = G.audio.ctx, b = ac.createGain(), send = ac.createGain(), an = ac.createAnalyser(); an.fftSize = 512; send.gain.value = 0.16; b.connect(G.audio.master); b.connect(send); send.connect(wet()); b.connect(an); D.outAn = an; D.outBuf = new Float32Array(512); return (D.bus = b); };
  talk.outLevel = () => { if (!D.outAn || !D.cur) return 0; D.outAn.getFloatTimeDomainData(D.outBuf); let s = 0; for (let i = 0; i < 512; i++) s += D.outBuf[i] * D.outBuf[i]; return Math.sqrt(s / 512); };
  const mouth = (c, out) => { let b = c.voice.head; if (b === undefined) { b = null; c.p.root.traverse((o) => { if (!b && o.isBone && /head/i.test(o.name)) b = o; }); c.voice.head = b; } return b ? b.getWorldPosition(out) : out.set(c.p.root.position.x, 1.3, c.p.root.position.z); };
  const _m = new V3();
  const words = (s) => (String(s).match(/[\w']+/g) || []).length;
  const later = (s) => { clearTimeout(D.tm); D.tm = setTimeout(pump, Math.max(15, s * 1000)); };
  const cookBusy = (it) => D.cookOn || (!(it && it.prio >= 5) && (EP.text || EP.pend || talk.hearing));

  // the voice is fetched the moment the words exist; ElevenLabs' comes as a stream of raw samples, played as it arrives
  const voice = (it) => {
    const v = it.v, t0 = performance.now(); it.chunks = []; it.got = 0;
    if (talk.tts === false || !G.audio.ctx) { it.tts = true; it.ready = true; return; }
    fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: it.text, speaker: v.speaker, pin: v.pin }) }).then(async (r) => {
      talk.diag.say = r.ok ? 'ok' : String(r.status); const ct = r.headers.get('content-type') || '', xv = r.headers.get('x-voice') || 'aura';
      if (!r.ok || !ct.startsWith('audio')) { if (!r.ok && r.status !== 429) talk.tts = false; throw 0; }
      talk.tts = true; it.voice = xv; it.plain = xv === 'plain'; if (!v.pin && /^eleven/.test(xv)) v.pin = xv === 'eleven-ny' ? 'ny' : 'stock'; // one voice for the night
      const ac = G.audio.ctx;
      if (ct.startsWith('audio/pcm') && r.body) {
        const rate = +r.headers.get('x-rate') || 24000, rd = r.body.getReader(); it.reader = rd; let carry = null;
        for (;;) { const { done, value } = await rd.read(); if (done || it.dead) break; let b = value; if (carry) { const m = new Uint8Array(carry.length + b.length); m.set(carry); m.set(b, carry.length); b = m; carry = null; }
          if (b.length & 1) { carry = b.slice(b.length - 1); b = b.subarray(0, b.length - 1); } const n = b.length >> 1; if (!n) continue; const dv = new DataView(b.buffer, b.byteOffset, b.length), ab = ac.createBuffer(1, n, rate), d = ab.getChannelData(0);
          for (let i = 0; i < n; i++) d[i] = dv.getInt16(i * 2, true) / 32768; it.chunks.push(ab); it.got += n / rate;
          if (!it.ready && it.got >= 0.25) { it.ready = true; it.firstMs = Math.round(performance.now() - t0); pump(); } if (it.playing) feed(it); }
        it.done = true;
      } else { it.buf = await ac.decodeAudioData(await r.arrayBuffer()); it.chunks.push(it.buf); it.got = it.buf.duration; it.done = true; }
      it.voiceMs = Math.round(performance.now() - t0); if (!it.ready) { it.ready = true; it.firstMs = it.voiceMs; } if (it.playing) feed(it); pump();
    }).catch(() => { if (it.dead) return; it.done = true; it.voiceMs = Math.round(performance.now() - t0); if (!it.got) it.tts = true; it.ready = true; if (it.playing) feed(it); pump(); });
  };
  const feed = (it) => {
    if (it.dead) return; const ac = G.audio.ctx; while (it.fed < it.chunks.length) { const ab = it.chunks[it.fed++], s = ac.createBufferSource(); s.buffer = ab; s.playbackRate.value = it.rate; s.connect(it.g); if (it.at < ac.currentTime + 0.01) it.at = ac.currentTime + 0.02; s.start(it.at); it.at += ab.duration / it.rate; it.srcs.push(s); }
    if (it.done) { clearTimeout(it.endT); it.endT = setTimeout(() => end(it), Math.max(0, (it.at - ac.currentTime) * 1000 + 30)); }
    const left = Math.max(0, it.at - ac.currentTime) + (it.done ? 0 : 0.6); it.estEnd = nowS() + left; it.c.p.talkT = left; it.v.until = G.t + left;
  };
  const enqueue = (c, text, meta = {}) => {
    if (G.muteVoices || !here(c)) return null; const v = voiceOf(c), kind = meta.kind || 'reply', it = { c, v, text, kind, prio: meta.prio || PRIO[kind] || 1, born: nowS(), gen: v.gen, live: meta.live, think: meta.think, h: meta.h, ack: meta.ack, fed: 0, srcs: [] };
    if (it.prio <= 2 && D.q.filter((x) => x.prio <= 2).length >= 1) { note({ who: v.name, kind, text, dropped: 'too many waiting to speak' }); return null; }
    c.attn = Math.max(c.attn || 0, 2 + text.length * 0.07);
    if (meta.buf) { it.chunks = [meta.buf]; it.got = meta.buf.duration; it.ready = it.done = true; it.voice = 'bank'; } else voice(it);
    D.q.push(it); pump(); return it;
  };
  talk.queue = enqueue; talk.spoken = [];
  const drop = (it, why) => { it.dead = true; try { it.reader?.cancel(); } catch (e) { /* closed */ } if (why) note({ who: it.v.name, kind: it.kind, text: it.text, dropped: why }); };
  function pump() {
    if (D.cur) return; const t = nowS();
    D.q = D.q.filter((it) => { if (!here(it.c)) { drop(it, 'they had left'); return false; } if (it.prio === 4 && it.gen !== it.v.gen) { drop(it, 'superseded by a newer answer'); return false; } if (t - it.born > AGE[it.prio]) { drop(it, 'the moment passed'); return false; } return true; });
    if (!D.q.length) return;
    if (cookBusy(D.q.find((x) => x.prio >= 5))) return later(0.1);
    D.q.sort((a, b) => b.prio - a.prio || a.born - b.born); let it = null;
    for (const x of D.q) { if (x.ready) { it = x; break; } if (x.prio >= 4) break; } // nobody jumps ahead of an answer still on its way
    if (!it) return later(0.25);
    const open = D.cookEnd > D.lastEnd ? D.cookEnd + (it.prio >= 4 ? 0.2 : 0.6) : D.lastEnd + (D.lastWho === it.c ? 0.15 : D.gap); // a breath between turns: short after the cook, shorter for the same voice going on
    if (t < open) return later(open - t);
    D.q.splice(D.q.indexOf(it), 1); start(it);
  }
  const start = (it) => {
    const c = it.c, v = it.v; D.cur = it; it.playing = true; it.t0 = nowS(); talk.spoken.push(it.log = { who: v.name, kind: it.kind, t0: it.t0 }); if (talk.spoken.length > 40) talk.spoken.shift();
    const base = { who: v.name, kind: it.kind, text: it.text, live: !!it.live, thinkMs: it.think, voiceMs: it.voiceMs, firstMs: it.firstMs, waitMs: Math.round((it.t0 - it.born) * 1000), ...(it.prio >= 4 && D.cookEnd > D.lastEnd ? { gapMs: Math.round((it.t0 - D.cookEnd) * 1000) } : {}) };
    if (it.tts || !it.chunks.length) {
      if (!window.speechSynthesis || !speechSynthesis.getVoices().length) { talk.voiceless = true; G.audio.play?.('voice'); note({ ...base, voice: 'none' }); return end(it); }
      try { const u = new SpeechSynthesisUtterance(it.text), vs = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)), want = v.g === 'f' ? /female|woman|samantha|victoria|karen|zira|susan|aria|jenny/i : /\bmale|\bman\b|daniel|alex|david|mark|fred|guy|james/i; u.voice = vs.find((x) => want.test(x.name)) || null; u.pitch = v.g === 'f' ? 1.15 : 0.7; u.rate = 1.02; u.lang = 'en-US';
        const est = 0.5 + it.text.length * 0.06; c.p.talkT = est; it.estEnd = nowS() + est; it.utt = u; note({ ...base, voice: 'browser' }); u.onend = u.onerror = () => end(it); speechSynthesis.speak(u); } catch (e) { end(it); }
      return;
    }
    const ac = G.audio.ctx, sp = G.audio.spatial('voice', null, { out: bus(), alive: () => D.cur === it }), pan = sp.pan, g = ac.createGain(); it.rate = it.plain ? (v.g === 'f' ? 1.04 : 0.8) : /^eleven|^bank/.test(it.voice || '') ? 1 : v.pitch; // a real voice is played as recorded
    mouth(c, _m); pan.positionX.value = _m.x; pan.positionY.value = _m.y; pan.positionZ.value = _m.z; g.gain.value = 2.4; g.connect(sp.input); // through the cart's one chain (audio.js spatial): distance, air, the alley's brick
    it.g = g; it.pan = pan; it.at = ac.currentTime + 0.03; it.row = note({ ...base, voice: it.plain ? 'plain' : it.voice, secs: it.done ? +(it.got / it.rate).toFixed(1) : undefined });
    feed(it); c.attn = Math.max(c.attn || 0, (it.estEnd - nowS()) + 1.5);
  };
  function end(it) {
    if (D.cur !== it) return;
    D.cur = null; D.lastWho = it.c; D.lastText = it.text; D.lastEnd = nowS(); D.gap = 0.3 + Math.random() * 0.4; if (it.log) it.log.t1 = D.lastEnd; if (it.row) it.row.secs = +(D.lastEnd - it.t0).toFixed(1); it.c.p.talkT = Math.min(it.c.p.talkT || 0, 0.2); it.v.until = 0; clearTimeout(it.endT);
    if (!it.ack && it.voice && /^eleven/.test(it.voice)) setTimeout(() => bank(it.v), 400);
    pump();
  }
  // the cook began to speak: a short line, or one nearly done, is finished; anything longer stops with a quick fade, and what was never said is not remembered as said
  const barge = () => {
    D.q = D.q.filter((x) => { if (x.prio <= 2) { drop(x, 'the cook spoke'); return false; } return true; });
    const it = D.cur; if (!it || it.prio >= 5) return; const left = (it.estEnd || 0) - nowS();
    if (left < 0.6 || words(it.text) <= 3) return;
    const said = Math.max(0, Math.min(1, (nowS() - it.t0) / Math.max(0.5, nowS() - it.t0 + left))), cutAt = Math.round(it.text.length * said), keep = it.text.slice(0, cutAt).replace(/\s+\S*$/, '');
    if (it.h) it.h.text = keep ? keep + ' —' : '—'; note({ who: it.v.name, kind: it.kind, cut: 'the cook spoke, ' + Math.round(said * 100) + '% said' }); if (it.log) it.log.cut = true;
    try { if (it.utt) speechSynthesis.cancel(); else { const ac = G.audio.ctx; it.g.gain.setTargetAtTime(0, ac.currentTime, 0.04); for (const s of it.srcs) s.stop(ac.currentTime + 0.2); } } catch (e) { /* ended */ }
    drop(it); it.done = true; clearTimeout(it.endT); it.estEnd = nowS(); end(it);
  };
  talk.barge = barge;
  talk.cookVoice = (on) => { if (!on) { D.cookOn = false; return; } D.cookAt = nowS(); if (!D.cookOn) { D.cookOn = true; if (D.cur) barge(); } };
  talk.voiceTick = () => { const it = D.cur; if (it && it.pan) { mouth(it.c, _m); const p = it.pan; p.positionX.value = _m.x; p.positionY.value = _m.y; p.positionZ.value = _m.z; } if (D.cookOn && nowS() - D.cookAt > 1.2) D.cookOn = false; if (it && nowS() > (it.estEnd || it.t0 + 8) + 3) end(it); if (!D.cur && D.q.length) pump(); }; // a stalled voice never holds the floor

  // a small bank of "mm-hm"s in each voice, made once in a quiet moment, so a slow thought can be bridged now and then
  const BANK = new Map(), ACKS = ['Mm-hm.', 'Yeah.', 'Okay.', 'Uh-huh.'];
  const bank = (v) => {
    const key = v.speaker + (v.pin || ''); if (!v.speaker || BANK.has(key) || talk.tts === false || !G.audio.ctx || D.q.length) return; const got = []; BANK.set(key, got);
    const phr = ACKS.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    (async () => { for (const text of phr) { try { const r = await fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, speaker: v.speaker, pin: v.pin }) }); if (!r.ok) return;
      const ct = r.headers.get('content-type') || '', ab = await r.arrayBuffer(), ac = G.audio.ctx;
      if (ct.startsWith('audio/pcm')) { const rate = +r.headers.get('x-rate') || 24000, n = ab.byteLength >> 1, dv = new DataView(ab), b = ac.createBuffer(1, n, rate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = dv.getInt16(i * 2, true) / 32768; got.push({ text, buf: b }); }
      else if (ct.startsWith('audio')) got.push({ text, buf: await ac.decodeAudioData(ab) }); } catch (e) { return; } } })();
  };
  const ackFor = (v) => { const b = BANK.get(v.speaker + (v.pin || '')); return b && b.length ? b[(Math.random() * b.length) | 0] : null; };
  talk.bank = BANK;

  async function say(c, kind, situation, facts, cookSaid) {
    if (c.guest) return; // a tenant from THE MARKET speaks for themself
    const v = voiceOf(c), reply = kind === 'reply' || kind === 'hurt' || kind === 'police', must = reply || kind === 'order' || kind === 'more' || kind === 'gotdrink' || kind === 'taste' || kind === 'angry' || kind === 'pay' || kind === 'short' || kind === 'over' || kind === 'thanks' || kind === 'greet2';
    if (c.p.cast && c.p.cast.name) v.story = G.block.story(c.p.cast);
    if (reply) { v.gen = (v.gen || 0) + 1; c.chatT = Math.max(c.chatT || 0, 30); talk.floorT = G.t + 6; for (const o of G.game.customers) if (o !== c) o.chatT = Math.max(o.chatT || 0, 12); }
    else if (v.busy || (v.until || 0) > G.t || (!must && (D.cur || D.q.some((x) => x.prio >= 4) || cookBusy() || G.t < (talk.floorT || 0)))) return; // nobody starts small talk while you are speaking or being answered
    const gen = v.gen, t0 = performance.now(); v.busy = true; let live = false, line = null;
    if (cookSaid) v.history.push({ who: 'cook', text: cookSaid });
    if (kind === 'reply' && cookSaid) setTimeout(() => { const a = ackFor(v); if (line === null && gen === v.gen && a && !D.cur && G.t - (v.ackT ?? -99) > 20 && Math.random() < 0.45) { v.ackT = G.t; enqueue(c, a.text, { kind: 'ack', buf: a.buf }); } }, 700); // a slow thought is bridged by a small sound, now and then
    if (talk.live !== false) {
      try {
        const r = await fetch('/sushi/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persona: { name: v.name, age: v.age, job: v.job, mood: v.mood, quirk: v.quirk, story: v.story, style: v.style }, order: c.order ? orderText(c.order) : c.passer ? 'nothing: you are passing along the sidewalk, not at the counter' : 'not ordered yet', situation, facts: [when(), facts, talk.seenText()].filter(Boolean).join(' '), say: cookSaid, history: v.history }) });
        const j = r.ok ? await r.json() : null; talk.diag.think = j && j.say ? 'ok' : j && j.why ? j.why.slice(0, 28) : String(r.status);
        if (j && j.say) { line = j.say; talk.live = true; live = true; } else if (!r.ok && r.status !== 429) talk.live = false;
      } catch (e) { talk.live = talk.live || false; }
    }
    if (gen !== v.gen) { v.busy = false; note({ who: v.name, kind, text: line || '', dropped: 'the cook spoke again before this was said' }); return; }
    if (!line) line = canned(kind, c);
    const h = { who: 'me', text: line }; v.busy = false; v.history.push(h); if (v.history.length > 10) v.history.splice(0, 2);
    if (!here(c)) return;
    talk.last = { who: v.name, line, n: (talk.lastN = (talk.lastN || 0) + 1) }; enqueue(c, line, { kind, live, h, think: Math.round(performance.now() - t0) });
  }

  talk.event = (c, kind, r) => {
    const waited = c.order ? Math.round(c.maxPatience - c.patience) : 0;
    if (kind === 'order') { say(c, 'order', 'You just sat down at the cart. Say hello and order your bowl of ramen, the way anyone does at a food cart: a hello and the order, a few plain words, nothing more. Order only the ramen now, not a drink.', `You have not been served yet. ${menuText()}`);
      if (c.order && c.order.drink) setTimeout(() => { if (c.order && c.order.drink && !c.gotDrink && (c.state === 'waiting' || c.state === 'eating')) talk.event(c, 'more'); }, 5000 + Math.random() * 4000); }   // the drink comes after, as an afterthought
    else if (kind === 'more') say(c, 'more', `You already ordered your ramen. Now, as an afterthought, ask for ${DRINKNAME[c.order.drink] || 'a ' + c.order.drink} as well, in a few plain words.`, '');
    else if (kind === 'gotdrink') say(c, 'gotdrink', `The cook just set your ${c.order.drink === 'tea' ? 'iced tea' : c.order.drink} in front of you. Thank them, a word or two.`, '');
    else if (kind === 'impatient') say(c, 'impatient', 'You have been waiting a while and your bowl has not arrived.', `You have waited about ${waited} seconds. Nothing has been served to you yet.`);
    else if (kind === 'taste') { c.p.gesture?.(r.score >= 80 ? 'nod' : r.score >= 50 ? 'shrug' : 'no'); say(c, r.score >= 80 ? 'good' : r.score >= 50 ? 'ok' : 'bad', 'The cook just set your bowl in front of you and you took your first taste. Thank them and say what you think of it, briefly, as anyone would.', `Quality ${r.score}/100. ${r.issues.length ? 'Problems with the bowl: ' + r.issues.join('; ') + '.' : 'It is exactly what you ordered, hot and well made.'} ${r.pay ? `You will pay${r.tip ? ' and leave a tip' : ', no tip'}.` : 'It is so wrong you refuse to pay.'}`); }
    else if (kind === 'wave') say(c, 'wave', 'The cook just caught your eye and waved at you from behind the counter. You wave back and say something.', c.result ? 'You have your food.' : 'You are still waiting for your food.');
    else if (kind === 'react') { c.p.gesture?.(Math.random() < 0.5 ? 'laugh' : 'no'); say(c, 'react', `Right in front of you, the cook just ${r}. You react out loud.`, ''); }
    else if (kind === 'chat' && G.clock && G.clock.phase === 'night') say(c, 'chatnight', 'It is late at night, the street lamps and the neon are lit and a light rain may be falling; the block is quiet. You are at the cart with a bowl and want to talk with the cook in an easy, unhurried way: your day, the neighborhood, the weather, the Mets, your work, someone you know.', c.result ? `Your bowl scored ${c.result.score}/100.` : 'Your bowl has not arrived yet.');
    else if (kind === 'chat') say(c, 'chat', c.state === 'eating' ? 'You are eating and want to talk: ask the cook a question or tell them something, about the food, your day, the weather, the subway or the neighborhood.' : 'You are waiting and want to talk: ask the cook a question (how they are doing, how long they have had the cart, anything this person would ask) or tell them about your day.', c.result ? `Your bowl scored ${c.result.score}/100.` : 'Your bowl has not arrived yet.');
    else if (kind === 'pay') say(c, 'pay', 'You finished your ramen and are paying the cook in cash. Say something short as you hand it over.', r);
    else if (kind === 'thanks') say(c, 'thanks', 'You have paid and are getting up to leave the cart. Say goodbye.', r);
    else if (kind === 'short') { c.p.gesture?.('no'); say(c, 'short', 'You counted the change the cook laid on the counter and it is short. Tell them, plainly.', r); }
    else if (kind === 'shorted') say(c, 'shorted', 'You are giving up on getting the rest of your change and leaving, annoyed.', r);
    else if (kind === 'over') say(c, 'over', 'You counted your change and the cook gave you too much. You hand the extra back.', r);
    else if (kind === 'waitchange') say(c, 'waitchange', 'You paid and are still waiting for your change. Ask for it.', r);
    else if (kind === 'saw') { c.p.gesture?.('no'); say(c, 'react', `Right in front of you, the cook just ${r}. You react out loud, shocked${/knife|ground/.test(r) ? ' and frightened' : ''}.`, ''); }
    else if (kind === 'hurt') say(c, 'hurt', `The cook at the ramen cart just ${r.you}. React out loud this moment, as a real person would: ${r.level >= 2 ? 'shocked, hurt, and angry or frightened' : r.level ? 'startled and annoyed' : 'surprised'}. Say plainly what they just did.`, [c.passer ? 'You were walking along the sidewalk, not at the counter.' : '', r.leave ? 'You are getting up and leaving without paying, and you are not coming back today.' : '', r.cop ? 'You are a New York City patrolman, on duty, in uniform.' : ''].filter(Boolean).join(' '));
    else if (kind === 'police') say(c, 'police', r ? `You are the patrolman who walks this beat for the Ninth Precinct. You hurried over to the ramen cart because the cook just ${r}. Speak to the cook firmly, as a New York cop of 1985 would: tell them to stop and ask what happened.` : 'You are the patrolman who walks this beat for the Ninth Precinct, and the cook at the ramen cart just attacked you. Speak to the cook firmly, as a New York cop of 1985 would.', 'You are standing at the cart, in uniform.');
    else if (kind === 'hail') say(c, 'hail', 'You are walking along the sidewalk past the ramen cart, and the cook behind its counter just waved at you. You wave back and call out something short and friendly.', 'You are not at the counter.');
    else if (kind === 'hello') say(c, 'hello', 'You are walking along the sidewalk past the ramen cart, and you know its cook. Call out a short greeting as you pass.', 'You are not at the counter.');
    else if (kind === 'story') { CANNED.story = [r.line]; delete DECK.story; say(c, 'story', r.prompt + ' Say it in a sentence or two.', 'You are not at the counter.'); }
    else if (kind === 'snub') say(c, 'snub', 'You are walking along the sidewalk past the ramen cart. The cook is trying to get your attention, but you are angry with them after what they did to you earlier. Say something short and cold.', 'You are not at the counter.');
    else if (kind === 'angry') say(c, 'angry', 'You waited far too long, never got your food, and are getting up to leave.', `You waited about ${waited} seconds and were never served.`);
  };
  // who you are speaking to: the only one at the counter; or, of several, the one you are looking at
  talk.target = () => {
    if (!G.game) return null; const cs = G.game.customers.filter((c) => c.state === 'sitting' || c.state === 'waiting' || c.state === 'eating' || c.state === 'paying'); if (!cs.length) return null; if (cs.length === 1) return cs[0];
    const cam = G.camera.getWorldPosition(new V3()), dir = G.camera.getWorldDirection(new V3()); let best = null, bd = 0.86;
    for (const c of cs) { const d = new V3(SEATS[c.seat], 1.3, -1.15).sub(cam).normalize().dot(dir); if (d > bd) { bd = d; best = c; } }
    return best;
  };
  const GREET = /^\W*(hi|hey|hello|evening|good (evening|night)|welcome|yo|how (are|is|'s)|what'?s up|howdy)\b|\b(everybody|everyone|folks|you guys|y'all)\b/i;
  talk.cookSays = (text, at) => {
    text = String(text || '').trim().slice(0, 240); if (!text || !G.game) return false; D.cookEnd = at ?? nowS(); talk.attend(6); const seated = G.game.customers.filter((x) => x.state === 'sitting' || x.state === 'waiting' || x.state === 'eating' || x.state === 'paying'), n = seated.length; let c = talk.target();
    talk.last = { who: 'THE COOK', line: text, n: (talk.lastN = (talk.lastN || 0) + 1) };
    note({ who: 'COOK', text, to: c ? voiceOf(c).name : n ? 'nobody (looking at no one, ' + n + ' seated)' : 'nobody (no one seated)' });
    { const cam = G.camera.getWorldPosition(new V3()), dir = G.camera.getWorldDirection(new V3()), pb = G.block?.addressed?.(cam, dir), cd = c ? new V3(SEATS[c.seat], 1.3, -1.15).sub(cam).normalize().dot(dir) : 0;
      if (pb && pb.k > Math.max(cd, 0.9)) { const h = pb.h, sp = h.spk; G.block.greet(h, { kind: 'reply', t: 5, w: Math.random() < 0.35 ? 0.4 : null }); note({ who: 'COOK', text, to: voiceOf(sp).name + ' (passing)' });
        say(sp, 'reply', G.block.mad[h.def.id] ? 'You are walking along the sidewalk past the ramen cart, and the cook, who wronged you earlier today, just spoke to you. Answer coldly and briefly.' : 'You are walking along the sidewalk past the ramen cart, and the cook behind its counter just spoke to you. Answer briefly; you may stop to chat or say you will come over for a bowl.', 'You are not at the counter.', text); return true; } }
    if (!c && n > 1 && GREET.test(text)) { // a greeting to the whole counter: one answers, and maybe another a moment after, never both at once
      const [a, b] = seated.slice().sort(() => Math.random() - 0.5); c = a;
      if (b && Math.random() < 0.5) setTimeout(() => { if (here(b)) say(b, 'greet2', 'The cook just greeted everyone at the counter and someone else already answered. Add a word or two of your own, or a short hello.', ''); }, 1200 + Math.random() * 1500); }
    if (!c) { if (!n) G.game.callOver?.(); return false; }
    c.p.gesture?.(Math.random() < 0.7 ? 'nod' : 'think'); const out = G.game.toldOut?.(c, text) || '';
    say(c, 'reply', c.state === 'eating' ? 'You are eating your ramen at the counter and the cook is talking to you. Answer, and keep the conversation going.' : 'You are sitting at the counter waiting for your ramen and the cook is talking to you. Answer, and keep the conversation going.', (c.result ? `Your bowl scored ${c.result.score}/100.${c.result.issues.length ? ' Problems: ' + c.result.issues.join('; ') + '.' : ''}` : 'Your bowl has not arrived yet.') + (out ? ' ' + out : '') + (c.pay ? ` You are paying: your bill is ${usd(c.pay.due)}, you handed over ${usd(c.pay.tender)}${c.pay.owed ? `, and are owed ${usd(c.pay.owed)} change` : ''}.` : ''), text);
    return true;
  };

  // ---- your voice, always on: the browser's recognition where it works, else each phrase is recorded and written down by the site (POST /holmes/hear)
  // a turn ends when you have really stopped: words are held until you have been quiet a moment, longer after a trailing "and" or "um", and the pieces of one turn are joined
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let active = false, rec = null, stream = null, lastNoise = -99;
  const EP = { text: '', pend: 0, tm: 0, first: 0 }, TRAIL = /(\b(and|but|so|or|um+|uh+|er|erm|because|cause|like|the|a|an|to|of|with|if|then|well|my|your)|,)\W*$/i;
  talk.EP = EP;
  const endpoint = () => {
    clearTimeout(EP.tm); if (!EP.text) return; const t = nowS(), need = TRAIL.test(EP.text) ? 1.4 : 0.75, quiet = t - D.cookAt;
    if ((D.cookOn || talk.hearing || EP.pend || quiet < need) && t - EP.first < 12) { EP.tm = setTimeout(endpoint, Math.max(60, (need - quiet) * 1000)); return; }
    const text = EP.text; EP.text = ''; EP.first = 0; talk.cookSays(text, D.cookAt); pump();
  };
  const echoOf = (s) => { const w = String(s).toLowerCase().match(/[\w']+/g) || [], said = D.cur ? D.cur.text : nowS() - D.lastEnd < 1.5 ? D.lastText || '' : ''; if (!w.length || !said) return false; const l = said.toLowerCase(); return w.filter((x) => l.includes(x)).length / w.length > 0.7; }; // the patron's own words come back through the microphone
  const heard = (text) => { text = String(text || '').trim(); if (!text) return; if (/guide( mode)? (on|off)/i.test(text) && text.length < 24) { G.debug?.guide?.set(/ on/i.test(text)); return; } if (/^\W*(open |show |close )?(the )?(menu|settings)\W*$/i.test(text)) { G.debug?.menu?.toggle(); return; }
    if (echoOf(text)) { note({ who: 'COOK', heard: text, problem: 'their own voice, heard back' }); return; }
    if (nowS() - D.cookAt > 4) D.cookAt = nowS(); EP.text = (EP.text ? EP.text + ' ' : '') + text; EP.text = EP.text.slice(-240); EP.first ||= nowS(); endpoint(); };
  talk.heard = heard;
  const noise = () => { talk.attend(4); if (G.t - lastNoise < 20) return; const c = talk.target(); if (!c) return; lastNoise = G.t; enqueue(c, canned('noise', c), { kind: 'noise' }); }; // heard, not understood: they ask, now and then
  let primed = null; const MIC = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } };
  talk.needPrime = async () => { if (primed || !navigator.mediaDevices) return false; try { const p = await navigator.permissions.query({ name: 'microphone' }); return p.state !== 'granted'; } catch (e) { return true; } };
  talk.micStream = () => primed || stream;
  talk.prime = async () => { try { primed = await navigator.mediaDevices.getUserMedia(MIC); talk.mic = 'ready'; return true; } catch (e) { talk.mic = 'blocked: allow the microphone'; return false; } };
  const recorder = () => {
    if (!(navigator.mediaDevices && window.MediaRecorder)) { talk.mic = 'no microphone'; active = false; return; }
    (primed ? Promise.resolve(primed) : navigator.mediaDevices.getUserMedia(MIC)).then((st) => {
      stream = st; talk.mic = 'listening'; const ac = G.audio.ctx || new AudioContext(), an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(st).connect(an);
      const buf = new Float32Array(512); let mr = null, parts = [], loud = 0, quiet = 0, t0 = 0, floor = 0.006;
      const loop = () => {
        if (!active) return; an.getFloatTimeDomainData(buf); let s2 = 0; for (let i = 0; i < 512; i++) s2 += buf[i] * buf[i]; const rms = Math.sqrt(s2 / 512), now = performance.now(), theyTalk = !!D.cur || window.speechSynthesis?.speaking, out = theyTalk ? talk.outLevel() : 0;
        if (!mr) { const th = Math.max(0.012, floor * 3), bth = Math.max(0.025, floor * 5, out * D.echo * 2.5); // over a patron's voice it takes more, and longer, to be you and not their echo
          if (!theyTalk) floor += (Math.min(rms, 0.04) - floor) * 0.02; else if (out > 0.01 && rms < bth) D.echo += (Math.min(4, rms / out) - D.echo) * 0.005;
          if (!talk.hold && rms > (theyTalk ? bth : th)) { if (++loud > (theyTalk ? 8 : 3)) { parts = []; const m = (mr = new MediaRecorder(st)); m.ondataavailable = (e) => parts.push(e.data); talk.attend(5); talk.hearing = true; talk.cookVoice(true);
              m.onstop = async () => { talk.hearing = false; const blob = new Blob(parts, { type: m.mimeType }), secs = (performance.now() - t0) / 1000; talk.sent = (talk.sent || 0) + 1; if (blob.size < 2500) return endpoint(); EP.pend++;
                try { const r = await fetch('/holmes/hear', { method: 'POST', body: blob }); EP.pend--; if (r.ok) { const j = await r.json(); talk.diag.hear = j.text ? 'ok' : j.why ? j.why.slice(0, 28) : 'no words'; talk.mic = j.why ? 'the site cannot hear' : 'listening'; if (j.text && !(secs < 2.2 && /^\W*(thank you|thanks for watching|you|bye|oh|hmm|so|uh|the)\W*$/i.test(j.text))) heard(j.text); else { note({ who: 'COOK', heard: j.text || '', problem: j.text ? 'taken for noise' : (j.why || 'no words'), secs: +secs.toFixed(1) }); if (!j.text && secs > 1.5) noise(); } } else { note({ who: 'COOK', problem: 'hearing failed ' + r.status }); talk.diag.hear = String(r.status); talk.mic = r.status === 401 ? 'needs a login' : r.status === 429 ? 'listening' : 'the site cannot hear'; noise(); } } catch (e) { EP.pend = Math.max(0, EP.pend - 1); noise(); } endpoint(); };
              m.start(); t0 = now; quiet = 0; } } else loud = 0; }
        else { const q = rms < Math.max(0.009, floor * 1.8); quiet = q ? quiet + 1 : 0; if (!q) D.cookAt = nowS(); if (quiet === 10) talk.cookVoice(false); if (quiet > 35 || now - t0 > 9000) { const m = mr; mr = null; loud = 0; talk.cookVoice(false); try { m.stop(); } catch (e) { /* stopped */ } } }
        setTimeout(loop, 20); }; loop();
    }).catch(() => { talk.mic = 'blocked: allow the microphone'; active = false; });
  };
  talk.listen = (on) => {
    if (on === active) return; active = on;
    if (!on) { talk.mic = 'off'; try { rec?.stop(); } catch (e) { /* not running */ } rec = null; if (stream && stream !== primed) stream.getTracks().forEach((x) => x.stop()); stream = null; return; }
    if (!SR || /OculusBrowser|Quest|Pico|Wolvic|VR/i.test(navigator.userAgent)) return recorder(); // a headset's browser names a recogniser it does not have
    let errs = 0, began = false; setTimeout(() => { if (active && !began && errs < 2) { errs = 2; try { rec?.abort(); } catch (e) { /* gone */ } rec = null; recorder(); } }, 3000);
    const go = () => { if (!active || errs >= 2) return; rec = new SR(); rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true; talk.mic = 'listening'; rec.onstart = () => { began = true; };
      rec.onspeechstart = () => talk.attend(5); rec.onspeechend = () => talk.cookVoice(false);
      rec.onresult = (e) => { errs = 0; for (let i = e.resultIndex; i < e.results.length; i++) { const tx = e.results[i][0].transcript; if (e.results[i].isFinal) { D.cookAt = nowS(); D.cookOn = false; heard(tx); } else if (!echoOf(tx)) { if (words(tx) >= 2) talk.cookVoice(true); else D.cookAt = nowS(); } } };
      rec.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') { errs++; if (errs >= 2 || e.error === 'not-allowed' || e.error === 'service-not-allowed') { errs = 2; rec = null; recorder(); } } }; // a headset browser may name a recogniser it does not have: record instead
      rec.onend = () => setTimeout(go, 300); try { rec.start(); } catch (e) { /* already started */ } }; go();
  };
  const log = [];
  talk.attend = (sec = 4) => { for (const c of G.game?.customers || []) c.attn = Math.max(c.attn || 0, sec); };
  talk.seen = (what) => { log.push({ t: G.t, what }); if (log.length > 5) log.shift(); };
  talk.seenText = () => { const r = log.filter((x) => G.t - x.t < 60).map((x) => x.what); return r.length ? 'In the last minute you saw the cook: ' + r.join('; ') + '.' : ''; };
  talk.update = (dt) => { talk.voiceTick(); if ((bookT += dt || 0) > 8) { bookT = 0; flush(); } };
  return talk;
}
