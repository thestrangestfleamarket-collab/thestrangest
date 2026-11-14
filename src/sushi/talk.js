// the customers' voices at the cart: each a person Claude Haiku speaks for (POST /sushi/talk, worker/sushi.js, a login's), set lines otherwise; a bubble, the browser's voice, and what you say back
import * as THREE from 'three';
import { G, V3, pick, clamp } from './ctx.js';
import * as T from './tex.js';
import { SEATS } from './cart.js';

const NAMES = { m: ['Tanaka', 'Kenji', 'Mr. Sato', 'Hiroshi', 'Yamada', 'Old Goro', 'Daisuke', 'Mr. Kimura'], f: ['Keiko', 'Ms. Mori', 'Yumi', 'Akiko', 'Naoko', 'Ms. Hayashi', 'Sachiko', 'Emi'] };
const JOBS = ['a salaryman coming off a 14-hour day at a trading company', 'a taxi driver on a break between fares', 'a jazz-kissa record clerk', 'a nurse just off the night shift', 'a department-store elevator attendant', 'a pachinko parlor floor manager', 'a university student cramming for exams', 'a construction foreman from the new tower site', 'a bar hostess before her shift', 'a newspaper typesetter', 'a cabaret saxophonist between sets', 'an electronics engineer from an Akihabara workshop'];
const MOODS = ['tired but friendly', 'a little tipsy and talkative', 'quiet and polite', 'in a hurry for the last train', 'cheerful after good news', 'gloomy about work', 'curious and chatty', 'gruff but fair'];
const QUIRKS = ['You have eaten at this cart for years.', 'This is your first time at this cart.', 'You compare every ramen to your mother\'s.', 'You are soaked from the rain and grateful for the steam.', 'You love talking about baseball.', 'You hum along to whatever is on the radio.', 'You are saving up for a new stereo.', 'You notice small details about how the cook works.'];
const CANNED = {
  order: ['Evening. {order}, please.', 'One {order}. It smells great tonight.', '{order} for me, thanks.'],
  impatient: ['Is mine coming along?', 'Sorry, I do have a train to catch…', 'Getting hungry over here.'],
  good: ['Ahh. That hits the spot.', 'Perfect. Just what I needed.', 'This is why I come here.'],
  ok: ['Not bad. Thanks.', 'Mm. It will do.'],
  bad: ['Hm. This is not quite what I ordered.', 'Something is off with this bowl.'],
  angry: ['Forget it. I cannot wait any longer.'],
  reply: ['Ha. If you say so.', 'Mm.', 'Sure, sure.'],
};

export function buildTalk(scene) {
  const talk = { live: null, model: null, bubbles: [] };
  G.talk = talk;

  const persona = (c) => { const g = (c.p.style || '').startsWith('Female') ? 'f' : 'm'; return { g, name: pick(NAMES[g]), age: 22 + ((Math.random() * 44) | 0), job: pick(JOBS), mood: pick(MOODS), quirk: pick(QUIRKS) }; };
  const orderText = (o) => `${o.recipe.name.toLowerCase()} ramen${o.firm ? ', noodles firm' : ''}${o.no ? `, no ${o.no}` : ''}${o.tops.chashu === 3 ? ', extra chashu' : ''}${o.drink ? `, and a ${o.drink}` : ''}`;

  function bubble(c, text) {
    const t = T.canvasTex(640, 256, (g, w, h) => {
      g.fillStyle = 'rgba(250,246,232,0.96)'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 56, 26); g.fill();
      g.beginPath(); g.moveTo(w / 2 - 22, h - 50); g.lineTo(w / 2, h - 8); g.lineTo(w / 2 + 22, h - 50); g.fill();
      g.fillStyle = '#7a1612'; g.font = `bold 26px ${T.JP}`; g.textAlign = 'left'; g.fillText(c.voice.name, 30, 46);
      g.fillStyle = '#1b1b1b'; g.font = `600 31px ${T.JP}`;
      const words = text.split(' '); let line = '', y = 88;
      for (const wd of words) { if (g.measureText(line + wd).width > w - 64) { g.fillText(line, 30, y); line = ''; y += 38; if (y > h - 66) break; } line += wd + ' '; }
      if (y <= h - 66) g.fillText(line, 30, y);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.userData.nopick = true; s.renderOrder = 45;
    s.scale.set(0.62, 0.248, 1); s.position.set(SEATS[c.seat], 1.83, -1.12); scene.add(s);
    for (const b of talk.bubbles) if (b.c === c) b.life = Math.min(b.life, 0.2);
    talk.bubbles.push({ s, c, life: 3.2 + text.length * 0.055 });
  }
  function speak(c, text) {
    try { if (!window.speechSynthesis || G.muteVoices) return; const u = new SpeechSynthesisUtterance(text); u.pitch = c.voice.g === 'f' ? 1.25 : 0.8; u.rate = 1.02; u.volume = 0.85; u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) { /* no TTS on this browser */ }
  }

  async function say(c, kind, situation, facts, cookSaid) {
    if (!c.voice) c.voice = { ...persona(c), history: [], busy: false };
    const v = c.voice; if (v.busy && kind !== 'reply') return; v.busy = true;
    if (cookSaid) v.history.push({ who: 'cook', text: cookSaid });
    let line = null;
    if (talk.live !== false) {
      try {
        const r = await fetch('/sushi/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persona: v, order: c.order ? orderText(c.order) : 'not ordered yet', situation, facts, say: cookSaid, history: v.history }) });
        const j = r.ok ? await r.json() : null;
        if (j && j.say) { line = j.say; talk.live = true; } else if (!r.ok && r.status !== 429) talk.live = false;
      } catch (e) { talk.live = talk.live || false; }
    }
    if (!line) { const set = CANNED[kind] || CANNED.reply; line = pick(set).replace('{order}', c.order ? c.order.recipe.name[0] + c.order.recipe.name.slice(1).toLowerCase() + ' ramen' : 'ramen'); }
    v.busy = false; v.history.push({ who: 'me', text: line }); if (v.history.length > 10) v.history.splice(0, 2);
    if (!G.game.customers.includes(c)) return;
    bubble(c, line); speak(c, line);
  }

  // ---- game events
  talk.event = (c, kind, r) => {
    const waited = c.order ? Math.round(c.maxPatience - c.patience) : 0;
    if (kind === 'order') say(c, 'order', 'You just sat down at the counter out of the rain and are telling the cook what you want.', 'You have not been served yet.');
    else if (kind === 'impatient') say(c, 'impatient', 'You have been waiting a while and your bowl has not arrived.', `You have waited about ${waited} seconds. Nothing has been served to you yet.`);
    else if (kind === 'taste') say(c, r.score >= 80 ? 'good' : r.score >= 50 ? 'ok' : 'bad', 'The cook just set your bowl in front of you and you took your first taste.', `Quality ${r.score}/100. ${r.issues.length ? 'Problems with the bowl: ' + r.issues.join('; ') + '.' : 'It is exactly what you ordered, hot and well made.'} ${r.pay ? `You will pay${r.tip ? ' and leave a tip' : ', no tip'}.` : 'It is so wrong you refuse to pay.'}`);
    else if (kind === 'angry') say(c, 'angry', 'You waited far too long, never got your food, and are getting up to leave.', `You waited about ${waited} seconds and were never served.`);
  };
  // ---- the cook speaks: to the customer being looked at
  talk.target = () => {
    const cs = G.game.customers.filter((c) => c.state === 'waiting' || c.state === 'eating'); if (!cs.length) return null;
    const cam = G.camera.getWorldPosition(new V3()), dir = G.camera.getWorldDirection(new V3()); let best = null, bd = -2;
    for (const c of cs) { const d = new V3(SEATS[c.seat], 1.4, -1.15).sub(cam).normalize().dot(dir); if (d > bd) { bd = d; best = c; } }
    return best;
  };
  talk.cookSays = (text) => {
    text = String(text || '').trim().slice(0, 240); const c = talk.target(); if (!text || !c) return false;
    say(c, 'reply', c.state === 'eating' ? 'You are eating your ramen at the counter and the cook is talking to you.' : 'You are sitting at the counter waiting for your ramen and the cook is talking to you.', c.result ? `Your bowl scored ${c.result.score}/100.${c.result.issues.length ? ' Problems: ' + c.result.issues.join('; ') + '.' : ''}` : 'Your bowl has not arrived yet.', text);
    return true;
  };

  // desktop: T opens a text box. Anywhere speech recognition exists: hold V (desktop) or A/X (VR controller) to speak.
  const box = document.getElementById('say');
  if (box) {
    addEventListener('keydown', (e) => {
      if (G.mode !== 'desktop') return;
      if (e.code === 'KeyT' && document.activeElement !== box) { e.preventDefault(); document.exitPointerLock?.(); box.style.display = 'block'; box.value = ''; box.focus(); }
      else if (document.activeElement === box && (e.code === 'Enter' || e.code === 'Escape')) { if (e.code === 'Enter') talk.cookSays(box.value); box.blur(); box.style.display = 'none'; }
    });
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec = null, listening = false;
  talk.canListen = !!SR;
  const listen = (on) => {
    if (!SR || on === listening) return; listening = on;
    try {
      if (on) { rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.onresult = (e) => talk.cookSays(e.results[0][0].transcript); rec.onerror = () => { }; rec.start(); G.audio.play('click'); }
      else rec?.stop();
    } catch (e) { listening = false; }
  };
  addEventListener('keydown', (e) => { if (e.code === 'KeyV' && G.mode === 'desktop' && e.target.tagName !== 'INPUT') listen(true); });
  addEventListener('keyup', (e) => { if (e.code === 'KeyV') listen(false); });

  talk.update = (dt) => {
    for (let i = talk.bubbles.length - 1; i >= 0; i--) { const b = talk.bubbles[i]; b.life -= dt; b.s.material.opacity = clamp(b.life * 3, 0, 1); if (b.life <= 0 || !G.game.customers.includes(b.c)) { b.s.removeFromParent(); b.s.material.map.dispose(); b.s.material.dispose(); talk.bubbles.splice(i, 1); } }
    const ses = G.renderer.xr.getSession?.();
    if (ses && SR) { let held = false; for (const src of ses.inputSources) if (src.gamepad?.buttons[4]?.pressed) held = true; listen(held); }
  };
  return talk;
}
