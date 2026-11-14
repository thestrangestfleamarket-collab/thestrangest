// the patrons' voices: every one a person (or creature) Claude Haiku speaks for (POST /sushi/talk), said aloud (POST /sushi/say, else the browser's voice); no words are shown. Your own voice is always on; they hear you, see you wave, and speak first sometimes
import { G, V3, pick } from './ctx.js';
import { SEATS } from './cart.js';
import CAST from '../cantina/cast.json';

const NAMES = { m: ['Tanaka', 'Kenji', 'Mr. Sato', 'Hiroshi', 'Yamada', 'Old Goro', 'Daisuke', 'Mr. Kimura'], f: ['Keiko', 'Ms. Mori', 'Yumi', 'Akiko', 'Naoko', 'Ms. Hayashi', 'Sachiko', 'Emi'] };
const JOBS = ['a salaryman coming off a 14-hour day at a trading company', 'a taxi driver on a break between fares', 'a jazz-kissa record clerk', 'a nurse just off the night shift', 'a department-store elevator attendant', 'a pachinko parlor floor manager', 'a university student cramming for exams', 'a construction foreman from the new tower site', 'a bar hostess before her shift', 'a newspaper typesetter', 'a cabaret saxophonist between sets', 'an electronics engineer from an Akihabara workshop'];
const MOODS = ['tired but friendly', 'a little tipsy and talkative', 'quiet and polite', 'in a hurry for the last train', 'cheerful after good news', 'gloomy about work', 'curious and chatty', 'gruff but fair'];
const STYLES = ['speaks in short, dry sentences', 'talks fast and laughs at their own jokes', 'is formal and careful with words', 'speaks slowly, with long pauses', 'is blunt and a little loud', 'is warm and asks questions back'];
const STORIES = ['Your boss shouted at you in front of everyone today.', 'You just missed the last train and are in no hurry now.', 'Your daughter passed her entrance exam this morning.', 'You lost money at pachinko an hour ago.', 'You are meeting someone later and are nervous about it.', 'You have had a cold all week and want something hot.', 'You got paid today.', 'You have been walking in the rain for an hour to clear your head.'];
const QUIRKS = ['You have eaten at this cart for years.', 'This is your first time at this cart.', 'You compare every ramen to your mother\'s.', 'You are soaked from the rain and grateful for the steam.', 'You love talking about baseball.', 'You hum along to whatever is on the radio.', 'You are saving up for a new stereo.', 'You notice small details about how the cook works.'];
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
  const talk = { live: null, tts: null, mic: 'off' };
  G.talk = talk;
  const persona = (c) => {
    const k = c.p.cast && CAST.find((x) => x.id === c.p.cast);
    if (k) return { g: 'm', name: k.name, age: '', job: `a ${k.kind} (${k.job}), out of the bar for a late bowl`, mood: pick(MOODS), quirk: k.personality, style: k.voice, story: `Hobby: ${k.hobby}.`, pitch: c.p.pitch || 1 };
    const g = (c.p.style || '').startsWith('Female') ? 'f' : 'm';
    return { g, name: pick(NAMES[g]), age: 22 + ((Math.random() * 44) | 0), job: pick(JOBS), mood: pick(MOODS), quirk: pick(QUIRKS), style: pick(STYLES), story: pick(STORIES), pitch: (g === 'f' ? 1.1 : 0.9) + Math.random() * 0.12 };
  };
  const orderText = (o) => `${o.recipe.name.toLowerCase()} ramen${o.firm ? ', noodles firm' : ''}${o.no ? `, no ${o.no}` : ''}${o.tops.chashu === 3 ? ', extra chashu' : ''}${o.drink ? `, and a ${o.drink}` : ''}`;
  const voiceOf = (c) => c.voice || (c.voice = { ...persona(c), history: [], busy: false });

  // said aloud from where they sit: the site's voice if it will give one, else the browser's
  async function speak(c, text) {
    if (G.muteVoices) return; const v = voiceOf(c); c.attn = Math.max(c.attn || 0, 2 + text.length * 0.07);
    if (talk.tts !== false && G.audio.ctx) {
      try {
        const r = await fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        if (r.ok && (r.headers.get('content-type') || '').startsWith('audio')) {
          const ac = G.audio.ctx, buf = await ac.decodeAudioData(await r.arrayBuffer()), src = ac.createBufferSource(), pan = ac.createPanner(), g = ac.createGain();
          src.buffer = buf; src.playbackRate.value = v.pitch; pan.panningModel = 'HRTF'; pan.refDistance = 1.4; pan.positionX.value = SEATS[c.seat]; pan.positionY.value = 1.4; pan.positionZ.value = -1.1; g.gain.value = 1.8;
          src.connect(g); g.connect(pan); pan.connect(G.audio.master); src.start(); talk.tts = true; talk.speaking = G.t + buf.duration / v.pitch; return;
        }
        if (r.status !== 429) talk.tts = false;
      } catch (e) { /* fall through to the browser's voice */ }
    }
    try { if (!window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(text); u.pitch = Math.max(0.5, Math.min(1.8, v.pitch * (v.g === 'f' ? 1.1 : 0.85))); u.rate = 1.02; u.volume = 1; u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) { /* this browser has no voice */ }
  }

  async function say(c, kind, situation, facts, cookSaid) {
    const v = voiceOf(c); if (v.busy && kind !== 'reply') return; v.busy = true;
    if (cookSaid) v.history.push({ who: 'cook', text: cookSaid });
    let line = null;
    if (talk.live !== false) {
      try {
        const r = await fetch('/sushi/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persona: v, order: c.order ? orderText(c.order) : 'not ordered yet', situation, facts: [facts, talk.seenText()].filter(Boolean).join(' '), say: cookSaid, history: v.history }) });
        const j = r.ok ? await r.json() : null;
        if (j && j.say) { line = j.say; talk.live = true; } else if (!r.ok && r.status !== 429) talk.live = false;
      } catch (e) { talk.live = talk.live || false; }
    }
    if (!line) { const set = CANNED[kind] || CANNED.reply; line = pick(set).replace('{order}', c.order ? c.order.recipe.name[0] + c.order.recipe.name.slice(1).toLowerCase() + ' ramen' : 'ramen'); }
    v.busy = false; v.history.push({ who: 'me', text: line }); if (v.history.length > 10) v.history.splice(0, 2);
    if (!G.game.customers.includes(c)) return;
    talk.last = { who: v.name, line }; speak(c, line);
  }

  talk.event = (c, kind, r) => {
    const waited = c.order ? Math.round(c.maxPatience - c.patience) : 0;
    if (kind === 'order') say(c, 'order', 'You just sat down at the counter out of the rain. Greet the cook and say what you want; you may ask how their night is going.', 'You have not been served yet.');
    else if (kind === 'impatient') say(c, 'impatient', 'You have been waiting a while and your bowl has not arrived.', `You have waited about ${waited} seconds. Nothing has been served to you yet.`);
    else if (kind === 'taste') say(c, r.score >= 80 ? 'good' : r.score >= 50 ? 'ok' : 'bad', 'The cook just set your bowl in front of you and you took your first taste. Say what you think of it.', `Quality ${r.score}/100. ${r.issues.length ? 'Problems with the bowl: ' + r.issues.join('; ') + '.' : 'It is exactly what you ordered, hot and well made.'} ${r.pay ? `You will pay${r.tip ? ' and leave a tip' : ', no tip'}.` : 'It is so wrong you refuse to pay.'}`);
    else if (kind === 'wave') say(c, 'wave', 'The cook just caught your eye and waved at you from behind the counter. You wave back and say something.', c.result ? 'You have your food.' : 'You are still waiting for your food.');
    else if (kind === 'react') say(c, 'react', `Right in front of you, the cook just ${r}. You react out loud.`, '');
    else if (kind === 'chat') say(c, 'chat', c.state === 'eating' ? 'You are eating and want to talk: ask the cook a question or tell them something, about the food, your day, the weather, the radio or the neighbourhood.' : 'You are waiting and want to talk: ask the cook a question (how they are doing, how long they have had the cart, anything this person would ask) or tell them about your day.', c.result ? `Your bowl scored ${c.result.score}/100.` : 'Your bowl has not arrived yet.');
    else if (kind === 'angry') say(c, 'angry', 'You waited far too long, never got your food, and are getting up to leave.', `You waited about ${waited} seconds and were never served.`);
  };
  talk.target = () => {
    const cs = G.game.customers.filter((c) => c.state === 'waiting' || c.state === 'eating'); if (!cs.length) return null;
    const cam = G.camera.getWorldPosition(new V3()), dir = G.camera.getWorldDirection(new V3()); let best = null, bd = -2;
    for (const c of cs) { const d = new V3(SEATS[c.seat], 1.4, -1.15).sub(cam).normalize().dot(dir); if (d > bd) { bd = d; best = c; } }
    return best;
  };
  talk.cookSays = (text) => {
    text = String(text || '').trim().slice(0, 240); if (!text) return false; talk.attend(6); const c = talk.target(); if (!c) { G.game.callOver?.(); return false; }
    say(c, 'reply', c.state === 'eating' ? 'You are eating your ramen at the counter and the cook is talking to you. Answer, and keep the conversation going.' : 'You are sitting at the counter waiting for your ramen and the cook is talking to you. Answer, and keep the conversation going.', c.result ? `Your bowl scored ${c.result.score}/100.${c.result.issues.length ? ' Problems: ' + c.result.issues.join('; ') + '.' : ''}` : 'Your bowl has not arrived yet.', text);
    return true;
  };

  // ---- your voice, always on: the browser's recognition where it works, else each phrase is recorded and written down by the site (POST /holmes/hear)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let active = false, rec = null, stream = null, lastNoise = -9;
  const heard = (text) => { text = String(text || '').trim(); if (!text) return; if (/guide( mode)? (on|off)/i.test(text) && text.length < 24) { G.debug?.guide?.set(/ on/i.test(text)); return; } if (/^\W*(open |show |close )?(the )?(menu|settings)\W*$/i.test(text)) { G.debug?.menu?.toggle(); return; } talk.cookSays(text); };
  talk.heard = heard;
  const noise = () => { talk.attend(4); if (G.t - lastNoise < 9) return; const c = talk.target(); if (!c) { G.game.callOver?.(); return; } lastNoise = G.t; speak(c, pick(CANNED.noise)); }; // heard, not understood: they still answer
  const recorder = () => {
    if (!(navigator.mediaDevices && window.MediaRecorder)) { talk.mic = 'no microphone'; active = false; return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then((st) => {
      stream = st; talk.mic = 'listening'; const ac = G.audio.ctx || new AudioContext(), an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(st).connect(an);
      const buf = new Float32Array(512); let mr = null, parts = [], loud = 0, quiet = 0, t0 = 0, floor = 0.006;
      const loop = () => {
        if (!active) return; an.getFloatTimeDomainData(buf); let s2 = 0; for (let i = 0; i < 512; i++) s2 += buf[i] * buf[i]; const rms = Math.sqrt(s2 / 512), now = performance.now(), theyTalk = (talk.speaking || 0) > G.t || window.speechSynthesis?.speaking;
        if (!mr) { floor += (Math.min(rms, 0.04) - floor) * 0.02; if (!theyTalk && rms > Math.max(0.012, floor * 3)) { if (++loud > 3) { parts = []; const m = (mr = new MediaRecorder(st)); m.ondataavailable = (e) => parts.push(e.data); talk.attend(5);
              m.onstop = async () => { const blob = new Blob(parts, { type: m.mimeType }); if (blob.size < 2500) return; try { const r = await fetch('/holmes/hear', { method: 'POST', body: blob }); if (r.ok) { const j = await r.json(); talk.mic = 'listening'; if (j.text) heard(j.text); else noise(); } else { talk.mic = r.status === 401 ? 'needs a login' : r.status === 429 ? 'listening' : 'the site cannot hear'; noise(); } } catch (e) { noise(); } };
              m.start(); t0 = now; quiet = 0; } } else loud = 0; }
        else { quiet = rms < Math.max(0.009, floor * 1.8) ? quiet + 1 : 0; if (quiet > 40 || now - t0 > 8000) { const m = mr; mr = null; loud = 0; try { m.stop(); } catch (e) { /* stopped */ } } }
        setTimeout(loop, 20); }; loop();
    }).catch(() => { talk.mic = 'blocked: allow the microphone'; active = false; });
  };
  talk.listen = (on) => {
    if (on === active) return; active = on;
    if (!on) { talk.mic = 'off'; try { rec?.stop(); } catch (e) { /* not running */ } rec = null; stream?.getTracks().forEach((x) => x.stop()); stream = null; return; }
    if (!SR) return recorder();
    let errs = 0; const go = () => { if (!active || errs >= 2) return; rec = new SR(); rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = false; talk.mic = 'listening';
      rec.onspeechstart = () => talk.attend(5);
      rec.onresult = (e) => { errs = 0; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) heard(e.results[i][0].transcript); };
      rec.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') { errs++; if (errs >= 2 || e.error === 'not-allowed' || e.error === 'service-not-allowed') { errs = 2; rec = null; recorder(); } } }; // a headset browser may name a recogniser it does not have: record instead
      rec.onend = () => setTimeout(go, 300); try { rec.start(); } catch (e) { /* already started */ } }; go();
  };
  const log = [];
  talk.attend = (sec = 4) => { for (const c of G.game.customers) c.attn = Math.max(c.attn || 0, sec); };
  talk.seen = (what) => { log.push({ t: G.t, what }); if (log.length > 5) log.shift(); };
  talk.seenText = () => { const r = log.filter((x) => G.t - x.t < 60).map((x) => x.what); return r.length ? 'In the last minute you saw the cook: ' + r.join('; ') + '.' : ''; };
  talk.update = () => { };
  return talk;
}
