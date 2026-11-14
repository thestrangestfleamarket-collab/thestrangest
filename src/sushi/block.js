// the block's own people: ten neighbours with work on this street, families and friends, and a night's errands between its doors; the cart's customers are these same people
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';

// plan: 'inside s' (in the shop they stand at), 'stand s', 'go place' (a shop kind, work, west, east), 'gone s' (off the block), 'with id' / 'alone' (someone walks along)
export const CAST = [
  { id: 'goro', style: 'Male_Adult_03', name: 'Goro Tanabe', age: 64, work: 'kissa', job: 'owner of the kissa, the coffee shop on this street, thirty years behind its counter', quirk: 'Notices everything on the street and has an opinion on it.', tonight: 'closing the coffee shop late and stretching your legs between pots',
    knows: { fumiko: 'your wife, who runs the kissa with you', hideo: 'the pharmacist, your shogi partner of twenty years', mariko: 'the izakaya mama, who buys your coffee beans', keiko: "Hideo's sister, who has the bookshop" }, plan: ['inside 55', 'stand 14', 'go pharmacy', 'stand 16', 'go work', 'inside 45', 'stand 9', 'go liquor', 'inside 14', 'go work'] },
  { id: 'fumiko', style: 'Female_Adult_02', name: 'Fumiko Tanabe', age: 61, work: 'kissa', job: 'runs the kissa on this street with your husband Goro and bakes its cakes', quirk: 'Mothers everyone and asks if they are eating properly.', tonight: 'doing the till, then taking the day\'s leftover cake to the neighbours',
    knows: { goro: 'your husband of forty years', yumi: 'the girl from the record shop, whom you treat like a granddaughter', keiko: 'the bookshop owner, your friend', naoko: 'the young nurse who buys coffee before her night shift' }, plan: ['inside 80', 'go books', 'stand 15', 'go records', 'stand 12', 'go work', 'inside 60', 'stand 8'] },
  { id: 'hideo', style: 'Male_Adult_13', name: 'Hideo Mori', age: 51, work: 'pharmacy', job: 'the pharmacist on this street; the shop was your father\'s', quirk: 'Gives health advice nobody asked for, kindly.', tonight: 'open late for the night-shift people, stepping out between customers',
    knows: { goro: 'the kissa owner, your shogi partner, who usually beats you', keiko: 'your younger sister, who owns the bookshop', naoko: 'a nurse at the clinic, a regular at your counter', daisuke: 'the liquor shop\'s delivery man, whose bad back you keep treating' }, plan: ['inside 70', 'stand 20', 'inside 50', 'go books', 'stand 14', 'go work', 'inside 40', 'stand 12'] },
  { id: 'keiko', style: 'Female_Adult_09', name: 'Keiko Mori', age: 42, work: 'books', job: 'owner of the second-hand bookshop on this street', quirk: 'Recommends a book for every situation.', tonight: 'pricing a box of old paperbacks and closing when the street goes quiet',
    knows: { hideo: 'your older brother, the pharmacist', fumiko: 'from the kissa, who brings you cake', kenta: 'a young salaryman who buys detective novels', goro: 'the kissa owner' }, plan: ['inside 90', 'stand 12', 'go kissa', 'inside 30', 'go work', 'inside 70', 'stand 10', 'go pharmacy', 'stand 12', 'go work'] },
  { id: 'shinji', style: 'Male_Adult_07', name: 'Shinji Okada', age: 36, work: 'office', job: 'section chief at a trading company two streets over', quirk: 'Talks about the yen and the stock market whether or not anyone asked.', tonight: 'out drinking with your junior Kenta after a fourteen-hour day, missing the last train on purpose',
    knows: { kenta: 'your junior at the company, whom you are mentoring and teasing', mariko: 'the izakaya mama, who keeps your bottle behind the bar', daisuke: 'the liquor delivery man, your old classmate' }, plan: ['gone 25', 'with kenta', 'go izakaya', 'inside 70', 'stand 10', 'go liquor', 'inside 14', 'go izakaya', 'inside 60', 'alone', 'go east', 'gone 50', 'go izakaya', 'stand 12'] },
  { id: 'kenta', style: 'Male_Adult_08', name: 'Kenta Sato', age: 24, work: 'office', job: 'first-year salaryman at a trading company, under section chief Okada', quirk: 'Eager, a little clumsy, apologises too much.', tonight: 'out with your boss Okada, hoping to slip away and meet Yumi after her shift',
    knows: { shinji: 'section chief Okada, your boss, who keeps you out late', yumi: 'your girlfriend, who works at the record shop here', keiko: 'the bookshop owner, who saves detective novels for you' }, plan: ['gone 20', 'go records', 'stand 14', 'with yumi', 'go kissa', 'inside 40', 'go books', 'stand 12', 'alone', 'go west', 'gone 40'] },
  { id: 'yumi', style: 'Female_Adult_04', name: 'Yumi Hara', age: 23, work: 'records', job: 'clerk at the record shop on this street, saving up for a guitar', quirk: 'Knows every song on the radio and hums along.', tonight: 'on the late shift at the record shop, waiting for Kenta',
    knows: { kenta: 'your boyfriend, a salaryman who is always tired', naoko: 'your flatmate, a nurse', fumiko: 'from the kissa, who slips you free cake' }, plan: ['inside 80', 'stand 12', 'inside 60', 'go kissa', 'inside 25', 'go work', 'inside 50', 'stand 10'] },
  { id: 'naoko', style: 'Female_Adult_11', name: 'Naoko Ishii', age: 27, work: 'clinic', job: 'nurse on the night shift at the clinic past the end of this street', quirk: 'Calm and dry-humoured; has seen everything.', tonight: 'on your way to the night shift, with errands at the pharmacy first',
    knows: { yumi: 'your flatmate from the record shop', hideo: 'the pharmacist, who fusses over how little you sleep', fumiko: 'from the kissa, your coffee before every shift' }, plan: ['gone 30', 'go pharmacy', 'inside 30', 'go kissa', 'inside 35', 'go records', 'stand 14', 'go east', 'gone 70', 'go pharmacy', 'stand 8', 'go west'] },
  { id: 'daisuke', style: 'Male_Adult_02', name: 'Daisuke Kondo', age: 33, work: 'liquor', job: 'delivery man for the liquor shop on this street, carrying crates to every bar in the neighbourhood', quirk: 'Cheerful, complains about his back, knows all the gossip.', tonight: 'running cases of beer between the liquor shop and the izakaya before last orders',
    knows: { mariko: 'the izakaya mama, your best customer, whom you are sweet on', shinji: 'your old classmate, now a big-shot section chief', hideo: 'the pharmacist who treats your back' }, plan: ['inside 25', 'go izakaya', 'inside 20', 'stand 10', 'go work', 'inside 20', 'go izakaya', 'inside 16', 'go work', 'stand 14', 'go grocer', 'inside 15', 'go work'] },
  { id: 'mariko', style: 'Female_Adult_14', name: 'Mariko Endo', age: 34, work: 'izakaya', job: 'the mama of the izakaya on this street, which you took over from your aunt', quirk: 'Warm, sharp-tongued, remembers what everyone drinks.', tonight: 'run off your feet at the izakaya, stepping out for air when you can',
    knows: { daisuke: 'the liquor delivery man, who lingers longer than deliveries need', shinji: 'a regular who keeps a bottle behind your bar', goro: 'the kissa owner, whose beans you buy', fumiko: 'from the kissa' }, plan: ['inside 70', 'stand 16', 'inside 60', 'go grocer', 'inside 16', 'go work', 'inside 50', 'stand 12'] },
];
const NEAR = -2.6, FAR = -12.6, _v = new THREE.Vector3();
export function buildBlock(root, shops) {
  const place = (kind, who) => { // a door of that kind, the nearest to the cart; the ends of the street; a shop of their own for those who work elsewhere
    if (kind === 'office') kind = 'east'; if (kind === 'clinic') kind = 'west'; // work beyond the ends of this street
    if (kind === 'west' || kind === 'east') return new THREE.Vector3(kind === 'west' ? -44 : 44, 0, who.n % 2 ? NEAR : FAR);
    let best = null; for (const s of shops) if (s.type === kind && (!best || Math.abs(s.p.x) < Math.abs(best.p.x))) best = s;
    if (!best && shops.length) best = shops[(kind.length * 7 + who.n) % shops.length];
    return best ? best.p.clone() : new THREE.Vector3(who.n % 2 ? 44 : -44, 0, NEAR);
  };
  const lane = (z) => (z < -8 ? FAR : NEAR);
  const route = (from, to) => { const a = lane(from.z), b = lane(to.z), out = []; if (Math.abs(from.z - a) > 0.3) out.push(new THREE.Vector3(from.x, 0, a)); if (a !== b) { const xc = from.x + (to.x - from.x) * 0.5; out.push(new THREE.Vector3(xc, 0, a), new THREE.Vector3(xc, 0, b)); } out.push(new THREE.Vector3(to.x, 0, b)); if (Math.abs(to.z - b) > 0.3) out.push(to.clone()); return out; };
  const people = CAST.map((def, n) => {
    const p = makePerson(700 + n * 13, def.style), h = { def, p, n, i: (n * 3) % def.plan.length, t: 0, path: null, hidden: true, taken: false, lead: null, crew: [], chat: null, cool: 0, at: null };
    p.root.traverse((o) => { o.userData.nopick = true; }); root.add(p.root); h.at = place(def.work, h); p.root.position.copy(h.at); p.root.visible = false; h.t = 5 + n * 9; h.step = 'inside'; return h;
  });
  const by = Object.fromEntries(people.map((h) => [h.def.id, h]));
  const next = (h) => { // begin the next thing on their list
    for (let guard = 0; guard < 8; guard++) {
      const [verb, arg] = h.def.plan[h.i = (h.i + 1) % h.def.plan.length].split(' ');
      if (verb === 'with') { const o = by[arg]; if (o && !o.taken && !o.lead && !o.crew.length) { o.lead = h; h.crew.push(o); o.hidden = h.hidden; o.p.root.position.copy(h.p.root.position); o.chat = null; } continue; }
      if (verb === 'alone') { for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; continue; }
      if (verb === 'go') { const to = place(arg === 'work' ? h.def.work : arg, h); if (h.hidden) { h.hidden = false; } h.path = route(h.p.root.position, to); h.at = to; h.step = 'go'; h.end = arg; return; }
      h.step = verb; h.t = +arg * (0.8 + Math.random() * 0.5); if (verb === 'inside' || verb === 'gone') h.hidden = true; else h.hidden = false; return;
    }
  };
  const walk = (h, to, dt, sp) => { const pos = h.p.root.position; _v.copy(to).sub(pos); _v.y = 0; const d = _v.length(); if (d < 0.08) return true; _v.multiplyScalar(Math.min(d, sp * dt) / d); pos.add(_v); const ty = Math.atan2(_v.x, _v.z); let dy = ty - h.p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); h.p.root.rotation.y += dy * Math.min(1, dt * 7); h.p.pose = 'walk'; h.p.speed = sp; return false; };
  const face = (h, x, z, dt) => { const pos = h.p.root.position, ty = Math.atan2(x - pos.x, z - pos.z); let dy = ty - h.p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); h.p.root.rotation.y += dy * Math.min(1, dt * 5); };
  let scan = 0; const met = new Map(), EYE = new THREE.Vector3(0, 1.6, 0.2);
  const block = { people, by };
  block.update = (dt, t) => {
    if (dt <= 0) return;
    for (const h of people) {
      if (h.taken) continue; const p = h.p, pos = p.root.position; h.cool -= dt;
      if (h.lead) { const L = h.lead; h.hidden = L.hidden; if (!h.hidden) { const ry = L.p.root.rotation.y; _v.set(pos.x, 0, pos.z); const tx = L.p.root.position.x + Math.cos(ry) * 0.62 - Math.sin(ry) * 0.15, tz = L.p.root.position.z - Math.sin(ry) * 0.62 - Math.cos(ry) * 0.15; if (Math.hypot(tx - pos.x, tz - pos.z) > 0.25) walk(h, _v.set(tx, 0, tz), dt, 1.5); else { p.pose = 'stand'; face(h, L.p.root.position.x, L.p.root.position.z, dt); } } }
      else if (h.chat) { h.chat.t -= dt; p.pose = 'stand'; const o = h.chat.o; face(h, o.p.root.position.x, o.p.root.position.z, dt); if (h.chat.lead && (h.chat.say -= dt) <= 0) { h.chat.say = 2.4 + Math.random() * 1.6; const s = (h.chat.turn = !h.chat.turn) ? h : o, l = s === h ? o : h; s.p.talkT = h.chat.say - 0.3; if (Math.random() < 0.5) l.p.gesture?.(Math.random() < 0.7 ? 'nod' : 'laugh'); } if (h.chat.t <= 0) h.chat = null; }
      else if (h.step === 'go') { if (walk(h, h.path[0], dt, 1.15 + (h.n % 3) * 0.12)) { h.path.shift(); if (!h.path.length) next(h); } }
      else { if (!h.hidden) { p.pose = 'stand'; if (h.at) face(h, pos.x, pos.z + (pos.z < -8 ? 3 : -3), dt); } if ((h.t -= dt) <= 0) next(h); }
      const far = Math.abs(pos.x) > 40; p.root.visible = !h.hidden && !far;
      if (p.root.visible) { p.look = Math.abs(pos.x) < 5 && pos.z > -4.5 && p.pose === 'walk' ? EYE : h.chat ? _v.copy(h.chat.o.p.root.position).setY(1.55).clone() : null; p.update(dt, t); }
    }
    if ((scan -= dt) <= 0) { scan = 0.5; // people who know each other stop when they meet
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) { const a = people[i], b = people[j]; if (a.taken || b.taken || a.hidden || b.hidden || a.chat || b.chat || a.lead || b.lead || a.lead === b || b.crew.includes(a) || a.crew.includes(b) || !a.def.knows[b.def.id]) continue;
        const k = i * 16 + j; if ((met.get(k) || 0) > t || a.p.root.position.distanceTo(b.p.root.position) > 2.2 || Math.abs(a.p.root.position.x) > 30) continue; met.set(k, t + 90); const T = 7 + Math.random() * 6; a.chat = { o: b, t: T, lead: true, say: 0.4, turn: false }; b.chat = { o: a, t: T }; if (Math.random() < 0.6) a.p.gesture?.('wave'); }
    }
  };
  // one of them comes to the cart: the game walks them from here on, and hands them back when they go
  block.take = () => { const free = people.filter((h) => !h.taken && !h.lead && !h.crew.length && !h.chat); if (!free.length) return null; const seen = free.filter((h) => !h.hidden && Math.abs(h.p.root.position.x) < 30), h = (seen.length ? seen : free)[(Math.random() * (seen.length || free.length)) | 0];
    if (h.hidden || Math.abs(h.p.root.position.x) > 30) h.p.root.position.set((Math.random() < 0.5 ? -1 : 1) * 14, 0, NEAR + 0.25); h.taken = true; h.hidden = false; h.p.root.visible = true; h.p.cast = h.def; h.p.neighbour = h; return h; };
  block.give = (h) => { h.taken = false; h.hidden = false; root.add(h.p.root); h.p.pose = 'walk'; h.p.look = null; h.i = h.def.plan.findIndex((s) => s === 'go work'); if (h.i < 0) h.i = 0; h.i -= 1; next(h); };
  // who someone is to the rest of the street, for what they say at the counter
  block.story = (def) => { const rel = Object.entries(def.knows).map(([id, r]) => `${by[id].def.name.split(' ')[0]} is ${r}`).join('; '); return `You live or work on this very street and know the yatai. Tonight you are ${def.tonight}. ${rel}.`; };
  G.block = block; return block;
}
