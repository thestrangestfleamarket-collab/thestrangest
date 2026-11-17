// the village's own people: ten regulars with their work on or near the street, families and friends, and a day's and a night's comings and goings; the cart's customers are these same people; they notice the cook (a wave, a word, a greeting of their own), and what the cook does to anyone (react.js) they remember all night and pass on
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';
import { buildReact } from './react.js';

// plan: 'inside s' (in the shop they stand at), 'stand s', 'go place' (a shop kind, work, west, east), 'gone s' (off the block), 'with id' / 'alone' (someone walks along)
export const COP = 'hachiro';   // the one who keeps the peace on the street (react.js, the police beat)
export const CAST = [
  { id: 'jinbei', style: 'fishmonger', name: 'Jinbei', age: 52, work: 'office', job: 'the fishmonger, who carries the catch up from the coast every morning in two baskets on a shoulder pole', quirk: 'Loud, generous, judges every broth by its fish.', tonight: 'selling the last of the morning catch and gossiping at every door',
    knows: { okane: 'your wife, who keeps the tofu shop', tobei: 'the potter, your old drinking friend', hachiro: 'the constable, who owes you for fish', sanpei: 'the boy who runs errands for you for a few mon' }, plan: ['inside 50', 'go bar', 'stand 14', 'go kitchen', 'stand 16', 'go work', 'inside 45', 'go stoop', 'stand 12', 'go work'] },
  { id: 'okane', style: 'tofu_wife', name: 'O-Kane', age: 48, work: 'kitchen', job: 'keeps the tofu shop across from the well and makes the best fried tofu in the province', quirk: 'Mothers everyone, asks if they have eaten, misses nothing.', tonight: 'pressing tomorrow\'s tofu and taking pickles round to the neighbours',
    knows: { jinbei: 'your husband the fishmonger', oume: 'the old woman of the sake house, whom you look after', kohana: 'the young geisha from the teahouse, whom you treat like a daughter', sanpei: 'the boy, who steals your fried tofu' }, plan: ['inside 80', 'go bar', 'stand 15', 'go stage', 'stand 12', 'go work', 'inside 60', 'stand 8'] },
  { id: 'tobei', style: 'potter', name: 'Tōbei', age: 61, work: 'stoop', job: 'the potter, whose kiln smokes behind his house; he made half the bowls in the village', quirk: 'Turns every bowl over to look at the foot before he eats from it.', tonight: 'waiting for his kiln to cool and walking the street to pass the time',
    knows: { jinbei: 'the fishmonger, your drinking friend', jonen: 'the monk, with whom you play go', oume: 'the sake house\'s old woman, who sold you your first cup', hachiro: 'the constable, who is your cousin' }, plan: ['inside 60', 'stand 20', 'go bar', 'stand 12', 'go work', 'inside 50', 'go fence', 'stand 14', 'go work'] },
  { id: 'gonzo', style: 'farmer', name: 'Gonzō', age: 40, work: 'office', job: 'a rice farmer whose paddies lie just east of the village, the water up to his shins all day', quirk: 'Talks about the weather and the rice as if they were people.', tonight: 'in from the paddies, tired, wanting something hot',
    knows: { hayato: 'the ronin, who helped you dig a ditch for a meal', sanpei: 'your nephew', okane: 'from the tofu shop', jinbei: 'the fishmonger, who cheats you a little' }, plan: ['gone 40', 'go stoop', 'stand 10', 'go bar', 'stand 18', 'go work', 'gone 50', 'go kitchen', 'stand 10', 'go work'] },
  { id: 'jonen', style: 'monk', name: 'Jōnen', age: 58, work: 'fence', job: 'the monk who keeps the little temple up the steps behind the shrine gate', quirk: 'Speaks gently and slowly, quotes the sutras, likes his broth plain.', tonight: 'begging his rice along the street, then sweeping the shrine steps',
    knows: { tobei: 'the potter, your go partner', oume: 'the old woman, who brings the temple sake she should not', hayato: 'the ronin, who sometimes sleeps in the temple porch', kohana: 'the geisha, who prays at the shrine at dawn' }, plan: ['inside 70', 'go stoop', 'stand 12', 'go kitchen', 'stand 10', 'go work', 'inside 60', 'stand 15'] },
  { id: 'kohana', style: 'geisha', name: 'Kohana', age: 23, work: 'stage', job: 'a geisha of the teahouse on the street, who plays the shamisen for the guests', quirk: 'Witty, graceful, teases the men, homesick for her own village.', tonight: 'between engagements at the teahouse, stepping out for air',
    knows: { okane: 'the tofu shop\'s wife, who mothers you', hayato: 'the ronin, who looks at you a long time and says nothing', oume: 'the old woman who taught you to drink', jonen: 'the monk, who scolds you kindly' }, plan: ['inside 50', 'stand 10', 'go bar', 'stand 14', 'go work', 'inside 70', 'go stoop', 'stand 8', 'go work'] },
  { id: 'hayato', style: 'ronin', name: 'Hayato', age: 34, work: 'bar', job: 'a ronin, a masterless samurai who came to the village in spring and stayed, working for meals and sleeping where he can', quirk: 'Few words, very polite, never says what happened to his lord.', tonight: 'sitting by the sake house door, watching the road east',
    knows: { gonzo: 'the farmer you helped with his ditch', kohana: 'the geisha, whom you cannot stop looking at', jonen: 'the monk who lets you sleep in the temple porch', hachiro: 'the constable, who distrusts you' }, plan: ['stand 30', 'go fence', 'stand 20', 'go work', 'stand 25', 'go kitchen', 'stand 10', 'go work'] },
  { id: 'hachiro', style: 'constable', name: 'Hachirō', age: 41, work: 'beat', job: 'the constable who keeps the peace on the street for the domain\'s magistrate', quirk: 'Gruff, fair, writes everything down, fond of a cup.', tonight: 'walking the street and the road east, keeping an eye on strangers',
    knows: { tobei: 'the potter, your cousin', jinbei: 'the fishmonger, to whom you owe money', hayato: 'the ronin, whom you do not trust', sanpei: 'the boy, whom you chase off for mischief' }, plan: ['stand 25', 'go stoop', 'stand 10', 'go work', 'stand 20', 'go bar', 'stand 10', 'go work'] },
  { id: 'sanpei', style: 'boy', name: 'Sanpei', age: 9, work: 'stoop', job: 'a village boy, Gonzō\'s nephew, who runs errands up and down the street for a few mon', quirk: 'Never still, asks everyone questions, wants to be a samurai.', tonight: 'running errands and following the ronin about',
    knows: { gonzo: 'your uncle', hayato: 'the ronin, your hero', okane: 'the tofu woman, whose fried tofu you steal', oume: 'the old woman, who tells you ghost stories' }, plan: ['stand 15', 'go bar', 'stand 8', 'go kitchen', 'stand 10', 'go work', 'inside 40', 'go fence', 'stand 10', 'go work'] },
  { id: 'oume', style: 'old_woman', name: 'O-Ume', age: 71, work: 'bar', job: 'the old woman who has kept the sake house on the street for fifty years', quirk: 'Sharp tongue, sweet heart, remembers the famine and the great earthquake.', tonight: 'minding the sake house and sitting out on its step',
    knows: { okane: 'the tofu shop\'s wife, who fusses over you', tobei: 'the potter, who drinks on credit', kohana: 'the geisha, a wild girl you are fond of', sanpei: 'the boy you tell ghost stories to' }, plan: ['inside 70', 'stand 20', 'go kitchen', 'stand 12', 'go work', 'inside 80', 'stand 15'] },
];
const _v = new THREE.Vector3();
export function buildBlock(root, shops, o = {}) {
  const NEAR = o.near ?? -2.6, FAR = o.far ?? -12.6, SPLIT = o.split ?? -8, END = o.end ?? 44;
  const place = (kind, who) => { // a door of that kind, the nearest to the cart; the ends of the street; a shop of their own for those who work elsewhere
    if (kind === 'office' || kind === 'beat') kind = 'east'; if (kind === 'clinic') kind = 'west'; // work beyond this block
    if (kind === 'west' || kind === 'east') return new THREE.Vector3(kind === 'west' && !o.dead ? -END : END, 0, (who.n + (kind === 'west' ? 1 : 0)) % 2 ? NEAR : FAR); // a dead end has one way out
    let best = null; for (const s of shops) if (s.type === kind && (!best || Math.abs(s.p.x) < Math.abs(best.p.x))) best = s;
    if (!best && shops.length) best = shops[(kind.length * 7 + who.n) % shops.length];
    return best ? best.p.clone() : new THREE.Vector3(who.n % 2 ? END : -END, 0, NEAR);
  };
  const lane = (z) => (z < SPLIT ? FAR : NEAR);
  const route = (from, to) => { const a = lane(from.z), b = lane(to.z), out = []; if (Math.abs(from.z - a) > 0.3) out.push(new THREE.Vector3(from.x, 0, a)); if (a !== b) { const xc = from.x + (to.x - from.x) * 0.5; out.push(new THREE.Vector3(xc, 0, a), new THREE.Vector3(xc, 0, b)); } out.push(new THREE.Vector3(to.x, 0, b)); if (Math.abs(to.z - b) > 0.3) out.push(to.clone()); return out; };
  const people = CAST.map((def, n) => {
    const p = makePerson(700 + n * 13, def.style), h = { def, p, n, i: (n * 3) % def.plan.length, t: 0, path: null, hidden: true, taken: false, lead: null, crew: [], chat: null, cool: 0, at: null };
    p.root.traverse((o) => { o.userData.nopick = true; }); root.add(p.root); p.cast = def; h.spk = { p, h, passer: true, here: () => !h.taken && !h.hidden && p.root.visible }; h.at = place(def.work, h); p.root.position.copy(h.at); p.root.visible = false; h.t = 5 + n * 9; h.step = 'inside'; return h;
  });
  const by = Object.fromEntries(people.map((h) => [h.def.id, h]));
  const next = (h) => { // begin the next thing on their list
    for (let guard = 0; guard < 8; guard++) {
      const [verb, arg] = h.def.plan[h.i = (h.i + 1) % h.def.plan.length].split(' ');
      if (verb === 'with') { const o = by[arg]; if (o && !o.taken && !o.lead && !o.crew.length) { o.lead = h; h.crew.push(o); o.hidden = h.hidden; o.p.root.position.copy(h.p.root.position); o.chat = null; } continue; }
      if (verb === 'alone') { for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; continue; }
      h.run = 0; if (verb === 'go') { const to = place(arg === 'work' ? h.def.work : arg, h); if (h.hidden) { h.hidden = false; } h.path = route(h.p.root.position, to); h.at = to; h.step = 'go'; h.end = arg; return; }
      h.step = verb; h.t = +arg * (0.8 + Math.random() * 0.5); if (verb === 'inside' || verb === 'gone') h.hidden = true; else h.hidden = false; return;
    }
  };
  const walk = (h, to, dt, sp) => { const pos = h.p.root.position; _v.copy(to).sub(pos); _v.y = 0; const d = _v.length(); if (d < 0.08) return true; _v.multiplyScalar(Math.min(d, sp * dt) / d); pos.add(_v); const ty = Math.atan2(_v.x, _v.z); let dy = ty - h.p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); h.p.root.rotation.y += dy * Math.min(1, dt * 7); h.p.pose = 'walk'; h.p.speed = sp; return false; };
  const face = (h, x, z, dt) => { const pos = h.p.root.position, ty = Math.atan2(x - pos.x, z - pos.z); let dy = ty - h.p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); h.p.root.rotation.y += dy * Math.min(1, dt * 5); };
  let scan = 0, hiAll = 0; const met = new Map(), EYE = new THREE.Vector3(0, 1.6, 0.2), cam = new THREE.Vector3();
  const block = { people, by, mad: {}, told: {} }, mad = (h) => !!block.mad[h.def.id];
  const camAt = () => (G.camera ? G.camera.getWorldPosition(cam) : cam.copy(EYE));
  const flat = (h) => Math.hypot(h.p.root.position.x - cam.x, h.p.root.position.z - cam.z);
  const free = (h) => !h.taken && !h.hidden && h.p.root.visible && !h.cop && !h.p.reeling?.();
  // stop, turn to the cook, wave (or shake the head, if the cook has wronged them) and say a word: kind is what talk.js says
  const greet = (h, o) => { h.greet = { t: o.t ?? 3 + Math.random(), w: o.w ?? null, say: o.say ?? null, kind: o.kind, what: o.what, come: !!o.come && !mad(h), cross: mad(h) }; };
  block.greet = greet;
  // the cook waved: the nearest one or two who can see the cart wave back, the first says something, and one may come over for a bowl
  block.waved = () => { camAt(); const near = people.filter((h) => free(h) && !h.greet && flat(h) < 9).sort((a, b) => flat(a) - flat(b)).slice(0, 2);
    near.forEach((h, i) => greet(h, { kind: 'hail', w: 0.3 + i * 0.4 + Math.random() * 0.2, say: i ? null : 0.7, come: Math.random() < 0.35 })); return near; };
  // who the cook is talking to, of those passing: the one looked at, within earshot
  block.addressed = (eye, dir) => { let best = null, bk = 0.9; for (const h of people) { if (!free(h)) continue; _v.copy(h.p.root.position).setY(1.5).sub(eye); const d = _v.length(); if (d > 9) continue; const k = _v.normalize().dot(dir) + (d < 3 ? 0.05 : 0); if (k > bk) { bk = k; best = h; } } return best ? { h: best, k: bk } : null; };
  // hurt or frightened: they hurry off the way out
  block.scare = (h) => { if (h.taken || h.hidden) return; if (h.lead) { const L = h.lead; L.crew.splice(L.crew.indexOf(h), 1); h.lead = null; } for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; if (h.chat) { h.chat.o.chat = null; h.chat = null; } h.greet = null; h.cop = null;
    const pos = h.p.root.position; h.path = route(pos, place(o.dead || pos.x > 0 ? 'east' : 'west', h)); h.step = 'go'; h.end = 'east'; h.run = 2.6; };
  // someone was attacked at the cart: the officer on the beat hurries over and has a word with the cook
  block.cop = COP;
  block.police = (at, them) => { const h = by[COP]; if (!h || h.taken || h.cop) return false; const pos = h.p.root.position; if (h.lead) { const L = h.lead; L.crew.splice(L.crew.indexOf(h), 1); h.lead = null; } for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; if (h.chat) { h.chat.o.chat = null; h.chat = null; } h.greet = null;
    if (h.hidden || Math.abs(pos.x) > 26) { pos.set(END - 8, 0, NEAR); h.hidden = false; } const x = Math.max(-1.6, Math.min(1.6, at.x + 0.8)); h.path = route(pos, new THREE.Vector3(x, 0, -2.05)); h.step = 'go'; h.end = 'cop'; h.run = 2.3; h.cop = { them, t: 32, said: false }; return true; };
  const tell = (a, b) => { const m = block.mad[a.def.id]; if (m && !block.mad[b.def.id] && !block.told[b.def.id]) { block.told[b.def.id] = { from: a.def.name.split(' ')[0], them: m.them }; b.wary = Math.random() < 0.6; } };
  block.update = (dt, t) => {
    if (dt <= 0) return;
    for (const h of people) {
      if (h.taken) continue; const p = h.p, pos = p.root.position; h.cool -= dt;
      if (p.reeling?.()) { p.pose = 'stand'; p.root.visible = !h.hidden; if (p.root.visible) p.update(dt, t); continue; } // knocked about: no walking until they have their feet
      if (h.greet) { const g = h.greet; g.t -= dt; p.pose = 'stand'; camAt(); face(h, cam.x, cam.z, dt); if (g.w != null && (g.w -= dt) <= 0) { g.w = null; p.gesture?.(g.cross ? 'no' : 'wave'); } if (g.say != null && (g.say -= dt) <= 0) { g.say = null; G.talk?.event(h.spk, g.cross ? 'snub' : g.kind, g.what); } if (g.t <= 0) { h.greet = null; if (g.come) { h.come = true; G.game?.callOver?.(); } } }
      else if (h.lead) { const L = h.lead; h.hidden = L.hidden; if (!h.hidden) { const ry = L.p.root.rotation.y; _v.set(pos.x, 0, pos.z); const tx = L.p.root.position.x + Math.cos(ry) * 0.62 - Math.sin(ry) * 0.15, tz = L.p.root.position.z - Math.sin(ry) * 0.62 - Math.cos(ry) * 0.15; if (Math.hypot(tx - pos.x, tz - pos.z) > 0.25) walk(h, _v.set(tx, 0, tz), dt, 1.5); else { p.pose = 'stand'; face(h, L.p.root.position.x, L.p.root.position.z, dt); } } }
      else if (h.chat) { h.chat.t -= dt; p.pose = 'stand'; const o = h.chat.o; face(h, o.p.root.position.x, o.p.root.position.z, dt); if (h.chat.lead && (h.chat.say -= dt) <= 0) { h.chat.say = 2.4 + Math.random() * 1.6; const s = (h.chat.turn = !h.chat.turn) ? h : o, l = s === h ? o : h; s.p.talkT = h.chat.say - 0.3; if (Math.random() < 0.5) l.p.gesture?.(Math.random() < 0.7 ? 'nod' : 'laugh'); } if (h.chat.t <= 0) h.chat = null; }
      else if (h.step === 'go') { if (walk(h, h.path[0], dt, h.run || 1.15 + (h.n % 3) * 0.12)) { h.path.shift(); if (!h.path.length) { if (h.end === 'cop') h.step = 'cop'; else next(h); } } }
      else if (h.step === 'cop') { const k = h.cop; p.pose = 'stand'; camAt(); face(h, cam.x, cam.z, dt); if (!k.said) { k.said = true; G.talk?.event(h.spk, 'police', k.them); } if ((k.t -= dt) <= 0) { h.cop = null; h.run = 0; next(h); } }
      else { if (!h.hidden) { p.pose = 'stand'; if (h.at) face(h, pos.x, pos.z + (pos.z < SPLIT ? 3 : -3), dt); } if ((h.t -= dt) <= 0) next(h); }
      const far = Math.abs(pos.x) > END - 0.5; p.root.visible = !h.hidden && !far;
      if (p.root.visible) { p.look = h.greet || h.step === 'cop' ? cam.clone().setY(cam.y - 0.05) : Math.abs(pos.x) < 5 && pos.z > -4.5 && p.pose === 'walk' ? (mad(h) ? null : EYE) : h.chat ? _v.copy(h.chat.o.p.root.position).setY(1.55).clone() : null; p.update(dt, t); }
    }
    if ((scan -= dt) <= 0) { scan = 0.5; camAt();
      // a regular passing close greets the cook first, now and then
      if (t > hiAll) for (const h of people) { if (!free(h) || h.greet || h.chat || mad(h) || h.step !== 'go' || t < (h.hiT || 0) || flat(h) > 4.5) continue; h.hiT = t + 60; if (Math.random() < 0.35) { h.hiT = t + 240; hiAll = t + 30; greet(h, { kind: 'hello', w: 0.2, say: 0.4, t: 2.6, come: Math.random() < 0.2 }); break; } }
      // people who know each other stop when they meet
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) { const a = people[i], b = people[j]; if (a.taken || b.taken || a.hidden || b.hidden || a.chat || b.chat || a.lead || b.lead || a.lead === b || b.crew.includes(a) || a.crew.includes(b) || !a.def.knows[b.def.id]) continue;
        const k = i * 16 + j; if ((met.get(k) || 0) > t || a.p.root.position.distanceTo(b.p.root.position) > 2.2 || Math.abs(a.p.root.position.x) > 30) continue; met.set(k, t + 90); tell(a, b); tell(b, a); const T = 7 + Math.random() * 6; a.chat = { o: b, t: T, lead: true, say: 0.4, turn: false }; b.chat = { o: a, t: T }; if (Math.random() < 0.6) a.p.gesture?.('wave'); }
    }
    G.react?.update(dt);
  };
  // one of them comes to the cart: the game walks them from here on, and hands them back when they go
  block.take = () => { const free = people.filter((h) => !h.taken && !h.lead && !h.crew.length && !h.chat && !h.cop && !mad(h) && !(h.wary && block.told[h.def.id]) && !h.p.reeling?.()); if (!free.length) return null; const seen = free.filter((h) => !h.hidden && Math.abs(h.p.root.position.x) < 30), h = free.find((x) => x.come) || (seen.length ? seen : free)[(Math.random() * (seen.length || free.length)) | 0]; h.come = false; h.greet = null;
    if (h.hidden || Math.abs(h.p.root.position.x) > 30) h.p.root.position.set((Math.random() < 0.5 ? -1 : 1) * 14, 0, NEAR + 0.25); h.taken = true; h.hidden = false; h.p.root.visible = true; h.p.cast = h.def; h.p.neighbour = h; return h; };
  block.give = (h) => { h.taken = false; h.hidden = false; root.add(h.p.root); h.p.pose = 'walk'; h.p.look = null; h.i = h.def.plan.findIndex((s) => s === 'go work'); if (h.i < 0) h.i = 0; h.i -= 1; next(h); };
  // who someone is to the rest of the street, for what they say at the counter
  block.story = (def) => { const rel = Object.entries(def.knows).map(([id, r]) => `${by[id].def.name.split(' ')[0]} is ${r}`).join('; '); const m = block.mad[def.id], tl = block.told[def.id]; return `You live in this village, Japan, in the 1860s, and know the ramen stall in its street. Today you are ${def.tonight}. ${rel}.${m ? ` Earlier today the cook at the stall ${m.you}; you are angry and will not eat there again.` : tl ? ` Earlier today ${tl.from} told you the cook at the stall ${tl.them}.` : ''}`; };
  G.react = buildReact(block);
  G.block = block; return block;
}
