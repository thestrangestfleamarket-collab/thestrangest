// the block's own people: ten regulars with their work on or near East 1st Street, families and friends, and a day's and a night's comings and goings; the cart's customers are these same people; they notice the cook (a wave, a word, a greeting of their own), and what the cook does to anyone (react.js) they remember all night and pass on
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';
import { buildReact } from './react.js';

// plan: 'inside s' (in the shop they stand at), 'stand s', 'go place' (a shop kind, work, west, east), 'gone s' (off the block), 'with id' / 'alone' (someone walks along)
export const COP = 'ray';   // the one who keeps the peace on the block (react.js, the police beat)
// where they stop (alley.js shops): bar the bodega's door, kitchen the laundromat's, stage the record shop's, corner the subway stair, stoop a stoop up the block, fence the pay phone; work off the block: office and beat east (the avenue), clinic west
export const CAST = [
  { id: 'hector', style: 'denim', name: 'Héctor', age: 41, work: 'bar', job: 'keeps Bodega La Esperanza, three doors along from the cart, as his father did; the family came up from Loíza in 1956', quirk: 'Gives everyone a nickname, runs a tab for half the block, follows the Mets and suffers for it.', tonight: 'minding the bodega and stepping out to stand in its door and watch the street',
    knows: { mei: 'who runs the laundromat; you trade change with her every day', nico: 'your son, who is supposed to be helping in the store', sal: 'the cabbie, who has bought his coffee at the bodega for twenty years', ray: 'the cop on the beat, whom you like and feed' }, plan: ['inside 70', 'stand 16', 'go kitchen', 'stand 12', 'go work', 'inside 60', 'go corner', 'stand 10', 'go work'] },
  { id: 'mei', style: 'laundress', name: 'Mei', age: 44, work: 'kitchen', job: 'runs the laundromat on the block, open seven to eleven every day of the year; she came from Toisan by way of Hong Kong in 1968', quirk: 'Counts everything twice, never wastes a word, slips the block\'s kids a quarter when nobody is looking.', tonight: 'folding other people\'s wash and making change for the machines',
    knows: { hector: 'who keeps the bodega; you trade change with him every day', olena: 'the old Ukrainian lady, whose wash you do for nothing and never say so', kenny: 'your nephew, who dances in the street instead of studying', jo: 'the punk girl, who washes everything she owns in one black load' }, plan: ['inside 80', 'stand 14', 'go bar', 'stand 12', 'go work', 'inside 70', 'stand 8'] },
  { id: 'danny', style: 'clerk', name: 'Danny', age: 27, work: 'stage', job: 'works the counter at Downtown Records and plays bass in a band that practises in a basement on Avenue B', quirk: 'Has an opinion on every record ever pressed and will tell you all of it.', tonight: 'pricing used LPs and arguing with customers about them',
    knows: { jo: 'who sings in your band; you are a little in love with her', kenny: 'the b-boy, for whom you tape hip hop off the radio', hector: 'who lets you run a tab till Friday', ray: 'the cop, who tells you to turn it down' }, plan: ['inside 60', 'stand 14', 'go bar', 'stand 10', 'go work', 'inside 50', 'go corner', 'stand 12', 'go work'] },
  { id: 'ray', style: 'cop', name: 'Ray', age: 38, work: 'beat', job: 'a patrolman out of the Ninth Precinct on East 5th Street who has walked this beat for six years', quirk: 'Tired, fair, a dry sense of humour, takes his noodles firm.', tonight: 'walking the beat between First Avenue and Avenue A',
    knows: { hector: 'who keeps the bodega and never lets you pay for coffee', olena: 'the old lady, who reports every double-parked car to you', kenny: 'the kid who dances by the subway, whom you move along and then stop to watch', sal: 'the cabbie, who talks your ear off about the Mets' }, plan: ['stand 25', 'go stoop', 'stand 10', 'go work', 'gone 30', 'go bar', 'stand 12', 'go corner', 'stand 14', 'go work'] },
  { id: 'olena', style: 'babushka', name: 'Olena', age: 71, work: 'stoop', job: 'a Ukrainian widow who has lived in the same three rooms on this block since 1948', quirk: 'Scolds everyone, feeds everyone, crosses herself when the punks go by.', tonight: 'sitting on her stoop, going down to the bodega for bread, watching who comes and goes',
    knows: { mei: 'the laundromat lady, who is kind to you and pretends not to be', hector: 'who keeps the black bread back for you', nico: 'the boy, who carries your shopping up four flights', jo: 'the girl with the hair, whom you scold and secretly like' }, plan: ['inside 70', 'stand 22', 'go bar', 'stand 12', 'go work', 'stand 18', 'inside 80', 'stand 15'] },
  { id: 'kenny', style: 'bboy', name: 'Kenny', age: 19, work: 'corner', job: 'a b-boy from Mott Street who dances on a sheet of cardboard by the subway stair with his crew, and stocks shelves at the bodega three mornings a week', quirk: 'Never still, always practising a move, polite to his elders, big dreams.', tonight: 'dancing for change at the corner and waiting for his crew',
    knows: { danny: 'at the record shop, who tapes the new records for you', hector: 'your boss three mornings a week', mei: 'your aunt, who thinks dancing is no job', nico: 'the kid, who copies every move you make' }, plan: ['stand 30', 'go stage', 'stand 14', 'go work', 'stand 26', 'go bar', 'stand 10', 'go work'] },
  { id: 'cora', style: 'nurse', name: 'Cora', age: 36, work: 'clinic', job: 'a nurse on the night shift at the hospital up First Avenue; she came from Manila in 1974 and lives over the laundromat', quirk: 'Calm, notices everything, laughs easily, always a little short of sleep.', tonight: 'coming off one shift and getting ready for the next',
    knows: { mei: 'downstairs, who does your uniforms', olena: 'the old lady, whose blood pressure you check on her stoop', sal: 'the cabbie, who drives you home free when it is late', jo: 'the singer, whom you patched up after a show' }, plan: ['gone 50', 'go kitchen', 'stand 12', 'go stoop', 'stand 10', 'go work', 'gone 60', 'go bar', 'stand 10', 'go work'] },
  { id: 'sal', style: 'cabbie', name: 'Sal', age: 56, work: 'fence', job: 'has driven a yellow cab for thirty years and takes his breaks on this block, by the pay phone', quirk: 'Has a story about every street in Manhattan and a fare who was somebody famous.', tonight: 'between fares, calling his dispatcher from the pay phone and stretching his back',
    knows: { hector: 'whose father sold you coffee before him', ray: 'the cop, a good kid, who has no idea about baseball', cora: 'the nurse, whom you drive home when it is late', danny: 'the record shop kid, whose music you cannot stand' }, plan: ['gone 40', 'stand 20', 'go bar', 'stand 12', 'go work', 'stand 16', 'gone 60', 'go corner', 'stand 10', 'go work'] },
  { id: 'jo', style: 'punk', name: 'Jo', age: 23, work: 'stage', job: 'sings in a punk band, works the register at the record shop two days a week, lives in a squat on East 3rd Street', quirk: 'Sharp, funny, pretends not to care, never has more than five dollars.', tonight: 'hanging round the record shop until the band plays a late set at a club on the Bowery',
    knows: { danny: 'your bass player, who looks at you too long', olena: 'the old lady, who scolds you and then gives you soup', mei: 'who lets you owe for the wash', cora: 'the nurse, who stitched your eyebrow after a show' }, plan: ['inside 50', 'stand 14', 'go stoop', 'stand 12', 'go work', 'inside 60', 'go corner', 'stand 12', 'go work'] },
  { id: 'nico', style: 'kid', name: 'Nico', age: 10, work: 'bar', job: 'Héctor\'s son, ten years old, who runs errands for the whole block', quirk: 'Asks everyone questions, wants to be a b-boy or a Met, cannot decide.', tonight: 'running errands and following Kenny about',
    knows: { hector: 'your father', kenny: 'the b-boy, your hero', olena: 'the old lady, whose bags you carry for a cookie', mei: 'the laundromat lady, who gives you quarters' }, plan: ['stand 15', 'go corner', 'stand 12', 'go stoop', 'stand 8', 'go work', 'inside 40', 'go kitchen', 'stand 10', 'go work'] },
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
  const abed = (h) => { const hr = G.clock ? G.clock.hour : 12, a = h.def.age; return (a < 14 && hr > 21.5 && hr < 29.2) || (a >= 65 && hr > 24.5 && hr < 28.5); };   // children and the old are indoors in the small hours
  const next = (h) => { // begin the next thing on their list
    if (abed(h)) { h.step = 'inside'; h.hidden = true; h.t = 40; h.run = 0; return; }
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
      if (t > hiAll) for (const h of people) { if (!free(h) || h.greet || h.chat || mad(h) || h.step !== 'go' || t < (h.hiT || 0) || flat(h) > 4.5) continue; h.hiT = t + 60; if (Math.random() < 0.2) { h.hiT = t + 300; hiAll = t + 60; greet(h, { kind: 'hello', w: 0.2, say: 0.4, t: 2.6, come: Math.random() < 0.2 }); break; } }
      // people who know each other stop when they meet
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) { const a = people[i], b = people[j]; if (a.taken || b.taken || a.hidden || b.hidden || a.chat || b.chat || a.lead || b.lead || a.lead === b || b.crew.includes(a) || a.crew.includes(b) || !a.def.knows[b.def.id]) continue;
        const k = i * 16 + j; if ((met.get(k) || 0) > t || a.p.root.position.distanceTo(b.p.root.position) > 2.2 || Math.abs(a.p.root.position.x) > 30) continue; met.set(k, t + 90); tell(a, b); tell(b, a); const T = 7 + Math.random() * 6; a.chat = { o: b, t: T, lead: true, say: 0.4, turn: false }; b.chat = { o: a, t: T }; if (Math.random() < 0.6) a.p.gesture?.('wave'); }
    }
    G.react?.update(dt);
  };
  // one of them comes to the cart: the game walks them from here on, and hands them back when they go
  block.take = () => { const free = people.filter((h) => !h.taken && !abed(h) && !h.lead && !h.crew.length && !h.chat && !h.cop && !mad(h) && !(h.wary && block.told[h.def.id]) && !h.p.reeling?.()); if (!free.length) return null; const seen = free.filter((h) => !h.hidden && Math.abs(h.p.root.position.x) < 30), h = free.find((x) => x.come) || (seen.length ? seen : free)[(Math.random() * (seen.length || free.length)) | 0]; h.come = false; h.greet = null;
    if (h.hidden || Math.abs(h.p.root.position.x) > 30) h.p.root.position.set((Math.random() < 0.5 ? -1 : 1) * 14, 0, NEAR + 0.25); h.taken = true; h.hidden = false; h.p.root.visible = true; h.p.cast = h.def; h.p.neighbour = h; return h; };
  block.give = (h) => { h.taken = false; h.hidden = false; root.add(h.p.root); h.p.pose = 'walk'; h.p.look = null; h.i = h.def.plan.findIndex((s) => s === 'go work'); if (h.i < 0) h.i = 0; h.i -= 1; next(h); };
  // who someone is to the rest of the street, for what they say at the counter
  block.story = (def) => { const rel = Object.entries(def.knows).map(([id, r]) => `${by[id].def.name.split(' ')[0]} is ${r}`).join('; '); const m = block.mad[def.id], tl = block.told[def.id]; return `You live or work on this block of East 1st Street, downtown New York, in 1985, and know the ramen cart on its sidewalk. Today you are ${def.tonight}. ${rel}.${m ? ` Earlier today the cook at the cart ${m.you}; you are angry and will not eat there again.` : tl ? ` Earlier today ${tl.from} told you the cook at the cart ${tl.them}.` : ''}`; };
  G.react = buildReact(block);
  G.block = block; return block;
}
