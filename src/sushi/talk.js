// the patrons' voices: every one a person (or creature) Claude Haiku speaks for (POST /sushi/talk), said aloud (POST /sushi/say, else the browser's voice); no words are shown. Your own voice is always on; they hear you, see you wave, and speak first sometimes
import { G, V3, pick } from './ctx.js';
import { SEATS } from './cart.js';
import CAST from '../cantina/cast.json';
import { PF } from './pf.js';

const NAMES = { m: ['Tony', 'Mr. Goldberg', 'Eddie', 'Hector', 'Big Mike', 'Old Pete', 'Vinnie', 'Mr. Chen', 'Ray', 'Jimmy'], f: ['Linda', 'Mrs. Rivera', 'Gloria', 'Pat', 'Ms. Washington', 'Debbie', 'Aunt Ruth', 'Yolanda', 'Kim', 'Barbara'] };
const JOBS = ['a cab driver on a break between fares', 'a bike messenger done for the day', 'a doorman off a double shift on Central Park West', 'a nurse just off the night shift', 'a Broadway stagehand after the last curtain', 'a garment district cutter heading home to Brooklyn', 'a Columbia student cramming for exams', 'a short-order cook from a diner uptown', 'a session bass player between gigs', 'a court stenographer who missed the express', 'a longshoreman from the West Side piers', 'a secretary from a Midtown ad agency'];
const MOODS = ['tired but friendly', 'a little tipsy and talkative', 'quiet and polite', 'in a hurry for the last train', 'cheerful after good news', 'gloomy about work', 'curious and chatty', 'gruff but fair'];
const STYLES = ['speaks in short, dry sentences', 'talks fast and laughs at their own jokes', 'is formal and careful with words', 'speaks slowly, with long pauses', 'is blunt and a little loud', 'is warm and asks questions back'];
const STORIES = ['Your boss chewed you out in front of everyone today.', 'You just missed your train and the next one is a long wait.', 'You got good news today and want to tell someone.', 'Your landlord is raising the rent again.', 'The Mets lost and you had money on it.', 'You are meeting someone later and you are nervous.', 'You have been on your feet since six this morning.', 'You found twenty dollars on the sidewalk this morning.', 'Your kid sister is getting married on Saturday.', 'You just moved to the city and everything is new.'];
const QUIRKS = ['You have eaten at this cart for years.', 'This is your first time at the cart; you never had ramen before.', 'You compare everything to the hot dogs upstairs.', 'You always ask what is on the radio.', 'You think the subway was better ten years ago.', 'You talk with your hands.', 'You are superstitious about which seat you take.', 'You are counting your change carefully tonight.'];
const FITS = PF; // each person's voice and age (pf.js)
const VOICES = { m: ['orion', 'perseus'], f: ['luna', 'stella'] }, CREATURE_VOICE = { robot: ['arcas', 0.94], gnome: ['angus', 1.1], mariachi: ['orpheus', 1], pirate: ['zeus', 0.95], goblinmage: ['perseus', 1.12], dragonborn: ['zeus', 0.88] };
const CANNED = {
  order: ['Evening. {order}, please.', 'One {order}. It smells great tonight.', '{order} for me, thanks. How are you doing tonight?'],
  impatient: ['Is mine coming along?', 'Sorry, I do have a train to catch.', 'Getting hungry over here.'],
  good: ['Ahh. That hits the spot.', 'Perfect. Just what I needed.', 'This is why I come here.'], ok: ['Not bad. Thanks.', 'Mm. It will do.'],
  bad: ['Hm. This is not quite what I ordered.', 'Something is off with this bowl.'], angry: ['Forget it. I cannot wait any longer.'],
  reply: ['Ha. If you say so.', 'Is that right?', 'Sure, sure.'], wave: ['Evening! Busy night?', 'Hey there. How are you doing?', 'Ah, hello!'],
  react: ['Whoa. Everything all right back there?', 'Careful!', 'Ha. Butterfingers.'], chat: ['This rain will not quit. How is your night going?', 'Long day. This is the best part of it.', 'Smells wonderful tonight.', 'You been here long tonight?'],
  noise: ['Sorry? I cannot hear you over the rain.', 'Hm? Say that again?', 'What was that?'],
};

export function buildTalk() {
  const talk = { live: null, tts: null, mic: 'off', diag: { hear: '-', think: '-', say: '-' } };
  G.talk = talk;
  const persona = (c) => {
    const k = c.p.cast && CAST.find((x) => x.id === c.p.cast);
    if (k) return { g: 'm', name: k.name, age: '', job: `a ${k.kind} (${k.job}), out of the bar for a late bowl`, mood: pick(MOODS), quirk: k.personality, style: k.voice, story: `Hobby: ${k.hobby}.`, speaker: (CREATURE_VOICE[c.p.cast] || ['orion', 1])[0], pitch: (CREATURE_VOICE[c.p.cast] || ['orion', 1])[1] };
    const nb = c.p.cast && c.p.cast.name ? c.p.cast : null; if (nb) { const fit = FITS[nb.style] || ['m', 'orion', 1], g = fit[0]; return { g, name: nb.name, age: nb.age, job: nb.job, mood: pick(MOODS), quirk: nb.quirk, style: pick(STYLES), story: G.block.story(nb), speaker: fit[1], pitch: fit[2] }; }
    const g = c.p.sex || 'm', fit = FITS[c.p.style] || [g, pick(VOICES[g]), 1, 24, 60, ''];
    return { g, name: pick(NAMES[g]), age: fit[3] + ((Math.random() * (fit[4] - fit[3] + 1)) | 0), job: fit[5] || pick(JOBS), mood: pick(MOODS), quirk: pick(QUIRKS), style: pick(STYLES), story: pick(STORIES), speaker: fit[1], pitch: fit[2] };
  };
  const orderText = (o) => `${o.recipe.name.toLowerCase()} ramen${o.firm ? ', noodles firm' : ''}${o.no ? `, no ${o.no}` : ''}${o.tops.chashu === 3 ? ', extra chashu' : ''}${o.drink ? `, and a ${o.drink}` : ''}`;
  // everything said and heard, with how long it took and what went wrong, sent to the site in batches (POST /sushi/log) so a night's talk can be read back
  const SID = Math.random().toString(36).slice(2, 10) + Date.now().toString(36), book = []; let bookT = 0;
  const note = (o) => { book.push({ at: Date.now(), gt: +G.t.toFixed(1), seats: G.game ? G.game.customers.filter((c) => c.state !== 'walk' && c.state !== 'leaving').length : 0, ...o }); if (book.length > 60) book.shift(); };
  const flush = () => { if (!book.length) return; const lines = book.splice(0, book.length); fetch('/sushi/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: SID, lines }), keepalive: true }).catch(() => { }); };
  talk.note = note; talk.flush = flush; talk.book = book; addEventListener('pagehide', flush);
  const voiceOf = (c) => c.voice || (c.voice = { ...persona(c), history: [], busy: false, gen: 0 });

  // said aloud from their own mouth, one voice at a time: the site's voice if it will give one, else the browser's
  const lane = []; let now = null, room = null;
  const wet = () => { if (room) return room; const ac = G.audio.ctx, n = (ac.sampleRate * 0.5) | 0, ir = ac.createBuffer(2, n, ac.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / n, 3.2) * (i < 260 ? i / 260 : 1); } } const cv = ac.createConvolver(), g = ac.createGain(); cv.buffer = ir; g.gain.value = 0.5; cv.connect(g); g.connect(G.audio.master); return (room = cv); };
  const mouth = (c, out) => { let b = c.voice.head; if (b === undefined) { b = null; c.p.root.traverse((o) => { if (!b && o.isBone && /head/i.test(o.name)) b = o; }); c.voice.head = b; } return b ? b.getWorldPosition(out) : out.set(c.p.root.position.x, 1.3, c.p.root.position.z); };
  const _m = new V3();
  const stop = () => { if (!now) return; const n = now; now = null; try { n.src.onended = null; n.g.gain.setTargetAtTime(0, G.audio.ctx.currentTime, 0.04); n.src.stop(G.audio.ctx.currentTime + 0.15); } catch (e) { /* ended */ } talk.speaking = 0; };
  const pump = () => {
    if (now || !lane.length) return; const it = lane.shift(); if (!G.game.customers.includes(it.c)) return pump();
    if (!it.buf) { try { const u = new SpeechSynthesisUtterance(it.text), v = it.c.voice, vs = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)), want = v.g === 'f' ? /female|woman|samantha|victoria|karen|zira|susan|aria|jenny/i : /\bmale|\bman\b|daniel|alex|david|mark|fred|guy|james/i; u.voice = vs.find((x) => want.test(x.name)) || null; u.pitch = v.g === 'f' ? 1.15 : 0.7; u.rate = 1.02; u.lang = 'en-US'; it.c.p.talkT = 1 + it.text.length * 0.06; note({ who: it.c.voice.name, kind: it.kind, text: it.text, live: !!it.live, voice: 'browser', thinkMs: it.think }); now = { c: it.c, tts: true }; u.onend = u.onerror = () => { if (now && now.tts) now = null; pump(); }; speechSynthesis.speak(u); } catch (e) { now = null; } return; }
    const ac = G.audio.ctx, v = it.c.voice, src = ac.createBufferSource(), pan = ac.createPanner(), g = ac.createGain(), send = ac.createGain(), rate = it.plain ? (v.g === 'f' ? 1.04 : 0.8) : v.pitch;
    src.buffer = it.buf; src.playbackRate.value = rate; pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 1; pan.rolloffFactor = 1.3; mouth(it.c, _m); pan.positionX.value = _m.x; pan.positionY.value = _m.y; pan.positionZ.value = _m.z; g.gain.value = 2.4; send.gain.value = 0.16;
    src.connect(g); g.connect(pan); pan.connect(G.audio.master); pan.connect(send); send.connect(wet());
    note({ who: v.name, kind: it.kind, text: it.text, live: !!it.live, voice: it.plain ? 'plain' : it.voice, thinkMs: it.think, voiceMs: it.voiceMs, secs: +(it.buf.duration / rate).toFixed(1) });
    it.c.p.talkT = it.buf.duration / rate; now = { c: it.c, src, g, pan }; talk.speaking = G.t + it.buf.duration / rate; v.until = talk.speaking; it.c.attn = Math.max(it.c.attn || 0, it.buf.duration / rate + 1.5);
    src.onended = () => { if (now && now.src === src) { now = null; talk.speaking = 0; } pump(); }; src.start();
  };
  talk.voiceTick = () => { if (now && now.pan) { mouth(now.c, _m); const p = now.pan; p.positionX.value = _m.x; p.positionY.value = _m.y; p.positionZ.value = _m.z; } };
  async function speak(c, text, first, meta) {
    if (G.muteVoices) return; const v = voiceOf(c), gen = v.gen, t0 = performance.now(); c.attn = Math.max(c.attn || 0, 2 + text.length * 0.07); let it = { c, text, kind: meta && meta.kind, live: meta && meta.live, think: meta && meta.think };
    if (talk.tts !== false && G.audio.ctx) {
      try {
        const r = await fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, speaker: v.speaker }) }); talk.diag.say = r.ok ? 'ok' : String(r.status);
        if (r.ok && (r.headers.get('content-type') || '').startsWith('audio')) { it.plain = r.headers.get('x-voice') === 'plain'; it.voice = r.headers.get('x-voice') || 'aura'; it.buf = await G.audio.ctx.decodeAudioData(await r.arrayBuffer()); talk.tts = true; }
        else if (r.status !== 429) talk.tts = false;
      } catch (e) { /* the browser's voice then */ }
    }
    it.voiceMs = Math.round(performance.now() - t0);
    if (gen !== v.gen || !G.game.customers.includes(c)) { note({ who: v.name, kind: it.kind, text, dropped: gen !== v.gen ? 'superseded by a newer answer' : 'they had left' }); return; }
    if (!it.buf && (!window.speechSynthesis || !speechSynthesis.getVoices().length)) { talk.voiceless = true; G.audio.play('voice'); return; }
    if (first) { lane.length = 0; if (now && now.c !== c) { note({ who: now.c.voice.name, cut: 'stopped so ' + v.name + ' could answer the cook' }); stop(); try { speechSynthesis.cancel(); } catch (e) { /* none */ } now = null; } lane.push(it); } // an answer to you takes the floor from anyone else, but nobody talks over their own sentence
    else { if (lane.length > 1) { note({ who: v.name, kind: it.kind, text, dropped: 'too many waiting to speak' }); return; } lane.push(it); }
    pump();
  }

  async function say(c, kind, situation, facts, cookSaid) {
    if (c.guest) return; // a tenant from THE MARKET speaks for themself
    const v = voiceOf(c), reply = kind === 'reply', must = reply || kind === 'order' || kind === 'taste' || kind === 'angry';
    if (reply) { v.gen = (v.gen || 0) + 1; c.chatT = Math.max(c.chatT || 0, 30); talk.floorT = G.t + 6; for (const o of G.game.customers) if (o !== c) o.chatT = Math.max(o.chatT || 0, 12); }
    else if (v.busy || (v.until || 0) > G.t || (!must && (now || lane.length || talk.hearing || G.t < (talk.floorT || 0)))) return; // nobody starts small talk while you are speaking or being answered
    const gen = v.gen, t0 = performance.now(); v.busy = true; let live = false;
    if (cookSaid) v.history.push({ who: 'cook', text: cookSaid });
    let line = null;
    if (talk.live !== false) {
      try {
        const r = await fetch('/sushi/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persona: v, order: c.order ? orderText(c.order) : 'not ordered yet', situation, facts: [facts, talk.seenText()].filter(Boolean).join(' '), say: cookSaid, history: v.history }) });
        const j = r.ok ? await r.json() : null; talk.diag.think = j && j.say ? 'ok' : j && j.why ? j.why.slice(0, 28) : String(r.status);
        if (j && j.say) { line = j.say; talk.live = true; live = true; } else if (!r.ok && r.status !== 429) talk.live = false;
      } catch (e) { talk.live = talk.live || false; }
    }
    if (gen !== v.gen) { note({ who: v.name, kind, text: line || '', dropped: 'the cook spoke again before this was said' }); return; }
    if (!line) { const set = CANNED[kind] || CANNED.reply; line = pick(set).replace('{order}', c.order ? c.order.recipe.name[0] + c.order.recipe.name.slice(1).toLowerCase() + ' ramen' : 'ramen'); }
    v.busy = false; v.history.push({ who: 'me', text: line }); if (v.history.length > 10) v.history.splice(0, 2);
    if (!G.game.customers.includes(c)) return;
    talk.last = { who: v.name, line, n: (talk.lastN = (talk.lastN || 0) + 1) }; speak(c, line, reply, { kind, live, think: Math.round(performance.now() - t0) });
  }

  talk.event = (c, kind, r) => {
    const waited = c.order ? Math.round(c.maxPatience - c.patience) : 0;
    if (kind === 'order') say(c, 'order', 'You just ducked out of the rain and sat down at the cart in the alley. Greet the cook and say what you want; you may ask how their night is going.', 'You have not been served yet.');
    else if (kind === 'impatient') say(c, 'impatient', 'You have been waiting a while and your bowl has not arrived.', `You have waited about ${waited} seconds. Nothing has been served to you yet.`);
    else if (kind === 'taste') { c.p.gesture?.(r.score >= 80 ? 'nod' : r.score >= 50 ? 'shrug' : 'no'); say(c, r.score >= 80 ? 'good' : r.score >= 50 ? 'ok' : 'bad', 'The cook just set your bowl in front of you and you took your first taste. Say what you think of it.', `Quality ${r.score}/100. ${r.issues.length ? 'Problems with the bowl: ' + r.issues.join('; ') + '.' : 'It is exactly what you ordered, hot and well made.'} ${r.pay ? `You will pay${r.tip ? ' and leave a tip' : ', no tip'}.` : 'It is so wrong you refuse to pay.'}`); }
    else if (kind === 'wave') say(c, 'wave', 'The cook just caught your eye and waved at you from behind the counter. You wave back and say something.', c.result ? 'You have your food.' : 'You are still waiting for your food.');
    else if (kind === 'react') { c.p.gesture?.(Math.random() < 0.5 ? 'laugh' : 'no'); say(c, 'react', `Right in front of you, the cook just ${r}. You react out loud.`, ''); }
    else if (kind === 'chat') say(c, 'chat', c.state === 'eating' ? 'You are eating and want to talk: ask the cook a question or tell them something, about the food, your day, the weather, the radio or the neighbourhood.' : 'You are waiting and want to talk: ask the cook a question (how they are doing, how long they have had the cart, anything this person would ask) or tell them about your day.', c.result ? `Your bowl scored ${c.result.score}/100.` : 'Your bowl has not arrived yet.');
    else if (kind === 'angry') say(c, 'angry', 'You waited far too long, never got your food, and are getting up to leave.', `You waited about ${waited} seconds and were never served.`);
  };
  // who you are speaking to: the only one at the counter; or, of several, the one you are looking at
  talk.target = () => {
    const cs = G.game.customers.filter((c) => c.state === 'sitting' || c.state === 'waiting' || c.state === 'eating'); if (!cs.length) return null; if (cs.length === 1) return cs[0];
    const cam = G.camera.getWorldPosition(new V3()), dir = G.camera.getWorldDirection(new V3()); let best = null, bd = 0.86;
    for (const c of cs) { const d = new V3(SEATS[c.seat], 1.3, -1.15).sub(cam).normalize().dot(dir); if (d > bd) { bd = d; best = c; } }
    return best;
  };
  talk.cookSays = (text) => {
    text = String(text || '').trim().slice(0, 240); if (!text) return false; talk.attend(6); const c = talk.target(), n = G.game.customers.filter((x) => x.state === 'sitting' || x.state === 'waiting' || x.state === 'eating').length;
    talk.last = { who: 'THE COOK', line: text, n: (talk.lastN = (talk.lastN || 0) + 1) };
    note({ who: 'COOK', text, to: c ? voiceOf(c).name : n ? 'nobody (looking at no one, ' + n + ' seated)' : 'nobody (no one seated)' });
    if (!c) { if (!n) G.game.callOver?.(); return false; }
    c.p.gesture?.(Math.random() < 0.7 ? 'nod' : 'think');
    say(c, 'reply', c.state === 'eating' ? 'You are eating your ramen at the counter and the cook is talking to you. Answer, and keep the conversation going.' : 'You are sitting at the counter waiting for your ramen and the cook is talking to you. Answer, and keep the conversation going.', c.result ? `Your bowl scored ${c.result.score}/100.${c.result.issues.length ? ' Problems: ' + c.result.issues.join('; ') + '.' : ''}` : 'Your bowl has not arrived yet.', text);
    return true;
  };

  // ---- your voice, always on: the browser's recognition where it works, else each phrase is recorded and written down by the site (POST /holmes/hear)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let active = false, rec = null, stream = null, lastNoise = -9;
  const heard = (text) => { text = String(text || '').trim(); if (!text) return; if (/guide( mode)? (on|off)/i.test(text) && text.length < 24) { G.debug?.guide?.set(/ on/i.test(text)); return; } if (/^\W*(open |show |close )?(the )?(menu|settings)\W*$/i.test(text)) { G.debug?.menu?.toggle(); return; } talk.cookSays(text); };
  talk.heard = heard;
  const noise = () => { talk.attend(4); if (G.t - lastNoise < 9) return; const c = talk.target(); if (!c) { G.game.callOver?.(); return; } lastNoise = G.t; speak(c, pick(CANNED.noise)); }; // heard, not understood: they still answer
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
        if (!active) return; an.getFloatTimeDomainData(buf); let s2 = 0; for (let i = 0; i < 512; i++) s2 += buf[i] * buf[i]; const rms = Math.sqrt(s2 / 512), now = performance.now(), theyTalk = (talk.speaking || 0) > G.t || window.speechSynthesis?.speaking;
        if (!mr) { floor += (Math.min(rms, 0.04) - floor) * 0.02; if (!theyTalk && !talk.hold && rms > Math.max(0.012, floor * 3)) { if (++loud > 3) { parts = []; const m = (mr = new MediaRecorder(st)); m.ondataavailable = (e) => parts.push(e.data); talk.attend(5); talk.hearing = true;
              m.onstop = async () => { talk.hearing = false; const blob = new Blob(parts, { type: m.mimeType }), secs = (performance.now() - t0) / 1000; talk.sent = (talk.sent || 0) + 1; if (blob.size < 2500) return; try { const r = await fetch('/holmes/hear', { method: 'POST', body: blob }); if (r.ok) { const j = await r.json(); talk.diag.hear = j.text ? 'ok' : j.why ? j.why.slice(0, 28) : 'no words'; talk.mic = j.why ? 'the site cannot hear' : 'listening'; if (j.text && !(secs < 2.2 && /^\W*(thank you|thanks for watching|you|bye|okay|oh|hmm|so|uh|the)\W*$/i.test(j.text))) heard(j.text); else { note({ who: 'COOK', heard: j.text || '', problem: j.text ? 'taken for noise' : (j.why || 'no words'), secs: +secs.toFixed(1) }); noise(); } } else { note({ who: 'COOK', problem: 'hearing failed ' + r.status }); talk.diag.hear = String(r.status); talk.mic = r.status === 401 ? 'needs a login' : r.status === 429 ? 'listening' : 'the site cannot hear'; noise(); } } catch (e) { noise(); } };
              m.start(); t0 = now; quiet = 0; } } else loud = 0; }
        else { quiet = rms < Math.max(0.009, floor * 1.8) ? quiet + 1 : 0; if (quiet > 60 || now - t0 > 9000) { const m = mr; mr = null; loud = 0; try { m.stop(); } catch (e) { /* stopped */ } } }
        setTimeout(loop, 20); }; loop();
    }).catch(() => { talk.mic = 'blocked: allow the microphone'; active = false; });
  };
  talk.listen = (on) => {
    if (on === active) return; active = on;
    if (!on) { talk.mic = 'off'; try { rec?.stop(); } catch (e) { /* not running */ } rec = null; if (stream && stream !== primed) stream.getTracks().forEach((x) => x.stop()); stream = null; return; }
    if (!SR || /OculusBrowser|Quest|Pico|Wolvic|VR/i.test(navigator.userAgent)) return recorder(); // a headset's browser names a recogniser it does not have
    let errs = 0, began = false; setTimeout(() => { if (active && !began && errs < 2) { errs = 2; try { rec?.abort(); } catch (e) { /* gone */ } rec = null; recorder(); } }, 3000);
    const go = () => { if (!active || errs >= 2) return; rec = new SR(); rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = false; talk.mic = 'listening'; rec.onstart = () => { began = true; };
      rec.onspeechstart = () => talk.attend(5);
      rec.onresult = (e) => { errs = 0; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) heard(e.results[i][0].transcript); };
      rec.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') { errs++; if (errs >= 2 || e.error === 'not-allowed' || e.error === 'service-not-allowed') { errs = 2; rec = null; recorder(); } } }; // a headset browser may name a recogniser it does not have: record instead
      rec.onend = () => setTimeout(go, 300); try { rec.start(); } catch (e) { /* already started */ } }; go();
  };
  const log = [];
  talk.attend = (sec = 4) => { for (const c of G.game.customers) c.attn = Math.max(c.attn || 0, sec); };
  talk.seen = (what) => { log.push({ t: G.t, what }); if (log.length > 5) log.shift(); };
  talk.seenText = () => { const r = log.filter((x) => G.t - x.t < 60).map((x) => x.what); return r.length ? 'In the last minute you saw the cook: ' + r.join('; ') + '.' : ''; };
  talk.update = (dt) => { talk.voiceTick(); if ((bookT += dt || 0) > 8) { bookT = 0; flush(); } };
  return talk;
}
