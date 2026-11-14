// the platform's own people: ten regulars with work in or near the station, families and friends, and a night's comings and goings; the cart's customers are these same people
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';

// plan: 'inside s' (in the shop they stand at), 'stand s', 'go place' (a shop kind, work, west, east), 'gone s' (off the block), 'with id' / 'alone' (someone walks along)
export const CAST = [
  { id: 'sal', style: 'Male_Adult_03', name: 'Sal Moretti', age: 64, work: 'newsstand', job: 'owner of the newsstand on this subway platform, thirty years selling papers, candy and cigars', quirk: 'Has an opinion on the Mets, the Mayor and everything in the paper.', tonight: 'keeping the newsstand open for the late crowd and stretching your legs between trains',
    knows: { rose: 'your wife, who runs the stand with you', walt: 'the token booth clerk, your pinochle partner of twenty years', carol: 'the singer who busks by the stairs, who buys your coffee', denise: 'the transit cop on this beat' }, plan: ['inside 55', 'stand 14', 'go booth', 'stand 16', 'go work', 'inside 45', 'stand 9', 'go bench', 'stand 14', 'go work'] },
  { id: 'rose', style: 'Female_Adult_02', name: 'Rose Moretti', age: 61, work: 'newsstand', job: 'runs the newsstand on this platform with your husband Sal and bakes for half the station', quirk: 'Mothers everyone and asks if they are eating properly.', tonight: 'counting the till, then taking cookies round to the regulars',
    knows: { sal: 'your husband of forty years', maria: 'the young waitress from the diner upstairs, whom you treat like a granddaughter', denise: 'the transit cop, your friend', angela: 'the young nurse who buys a paper before her night shift' }, plan: ['inside 80', 'go booth', 'stand 15', 'go busk', 'stand 12', 'go work', 'inside 60', 'stand 8'] },
  { id: 'walt', style: 'Male_Adult_13', name: 'Walt Kowalski', age: 51, work: 'booth', job: 'the token booth clerk at this station; your father worked the same booth', quirk: 'Gives directions and advice nobody asked for, kindly.', tonight: 'on the late shift in the token booth, stepping out between rushes',
    knows: { sal: 'the newsstand owner, your pinochle partner, who usually beats you', denise: 'the transit cop on this beat, your cousin', angela: 'a nurse at Roosevelt Hospital, a regular at your window', luis: 'the station cleaner, whose bad back you keep nagging him about' }, plan: ['inside 70', 'stand 20', 'inside 50', 'go newsstand', 'stand 14', 'go work', 'inside 40', 'stand 12'] },
  { id: 'denise', style: 'Female_Adult_09', name: 'Denise Carter', age: 42, work: 'beat', job: 'a Transit Police officer who walks this platform at night', quirk: 'Dry, watchful, recommends a book for every situation.', tonight: 'walking your beat up and down the platform until the last train',
    knows: { walt: 'your cousin in the token booth', rose: 'from the newsstand, who feeds you cookies', danny: 'a young broker who once got his wallet lifted here', sal: 'the newsstand owner' }, plan: ['go west', 'stand 12', 'go newsstand', 'stand 14', 'go east', 'stand 10', 'go booth', 'stand 16', 'go edge', 'stand 12'] },
  { id: 'frank', style: 'Male_Adult_07', name: 'Frank Russo', age: 36, work: 'office', job: 'a broker at a Wall Street firm, on the way home to Queens', quirk: 'Talks about the Dow and interest rates whether or not anyone asked.', tonight: 'out late with your junior Danny after a fourteen-hour day, in no hurry to catch the train',
    knows: { danny: 'your junior at the firm, whom you are mentoring and ribbing', carol: 'the singer by the stairs, in whose case you always drop a dollar', luis: 'the station cleaner, your old schoolmate from Astoria' }, plan: ['gone 25', 'with danny', 'go busk', 'stand 30', 'go newsstand', 'stand 14', 'go bench', 'stand 40', 'alone', 'go east', 'gone 50', 'go edge', 'stand 14'] },
  { id: 'danny', style: 'Male_Adult_08', name: 'Danny Flynn', age: 24, work: 'office', job: 'first-year junior at a Wall Street firm, under Frank Russo', quirk: 'Eager, a little clumsy, apologises too much.', tonight: 'out with your boss Frank, hoping to slip away and meet Maria after her shift',
    knows: { frank: 'Frank Russo, your boss, who keeps you out late', maria: 'your girlfriend, a waitress at the diner upstairs', denise: 'the transit cop who got your wallet back last winter' }, plan: ['gone 20', 'go bench', 'stand 14', 'with maria', 'go newsstand', 'stand 20', 'go edge', 'stand 16', 'alone', 'go west', 'gone 40'] },
  { id: 'maria', style: 'Female_Adult_04', name: 'Maria Santos', age: 23, work: 'diner', job: 'waitress at the diner upstairs on Columbus Circle, saving up for a guitar', quirk: 'Knows every song on the radio and hums along.', tonight: 'just off a double shift at the diner, waiting for Danny',
    knows: { danny: 'your boyfriend, a junior broker who is always tired', angela: 'your roommate, a nurse', rose: 'from the newsstand, who slips you free cookies' }, plan: ['gone 30', 'go bench', 'stand 30', 'go newsstand', 'stand 12', 'go phone', 'stand 20', 'go bench', 'stand 25', 'go west', 'gone 40'] },
  { id: 'angela', style: 'Female_Adult_11', name: 'Angela Brooks', age: 27, work: 'clinic', job: 'nurse on the night shift at Roosevelt Hospital, two blocks from this station', quirk: 'Calm and dry-humoured; has seen everything.', tonight: 'on your way to the night shift, with a paper to buy first',
    knows: { maria: 'your roommate from the diner', walt: 'the token clerk, who fusses over how little you sleep', rose: 'from the newsstand, your paper before every shift' }, plan: ['gone 30', 'go booth', 'stand 10', 'go newsstand', 'stand 16', 'go edge', 'stand 20', 'go east', 'gone 70', 'go phone', 'stand 12', 'go west'] },
  { id: 'luis', style: 'Male_Adult_02', name: 'Luis Ortega', age: 33, work: 'sweep', job: 'the station cleaner, sweeping and mopping this platform every night', quirk: 'Cheerful, complains about his back, knows all the gossip.', tonight: 'working your way down the platform with the broom before the last train',
    knows: { carol: 'the singer by the stairs, whom you are sweet on', frank: 'your old schoolmate from Astoria, now a big-shot broker', walt: 'the token clerk who nags you about your back' }, plan: ['go west', 'stand 14', 'go bench', 'stand 12', 'go busk', 'stand 16', 'go edge', 'stand 14', 'go east', 'stand 14', 'go newsstand', 'stand 10'] },
  { id: 'carol', style: 'Female_Adult_14', name: 'Carol Novak', age: 34, work: 'busk', job: 'a singer who busks by the stairs on this platform, with a club date on weekends', quirk: 'Warm, sharp-tongued, remembers what everyone hums.', tonight: 'singing for the late crowd by the stairs, taking a breather when your voice needs it',
    knows: { luis: 'the station cleaner, who lingers by your pitch longer than sweeping needs', frank: 'a broker who always drops a dollar in your case', sal: 'the newsstand owner, whose coffee you drink', rose: 'from the newsstand' }, plan: ['stand 70', 'go newsstand', 'stand 16', 'go work', 'stand 60', 'go bench', 'stand 20', 'go work', 'stand 50'] },
];
const _v = new THREE.Vector3();
export function buildBlock(root, shops, o = {}) {
  const NEAR = o.near ?? -2.6, FAR = o.far ?? -12.6, SPLIT = o.split ?? -8, END = o.end ?? 44;
  const place = (kind, who) => { // a door of that kind, the nearest to the cart; the ends of the street; a shop of their own for those who work elsewhere
    if (kind === 'office' || kind === 'beat') kind = 'east'; if (kind === 'clinic' || kind === 'diner' || kind === 'sweep') kind = 'west'; // work beyond the ends of the platform
    if (kind === 'west' || kind === 'east') return new THREE.Vector3(kind === 'west' ? -END : END, 0, who.n % 2 ? NEAR : FAR);
    let best = null; for (const s of shops) if (s.type === kind && (!best || Math.abs(s.p.x) < Math.abs(best.p.x))) best = s;
    if (!best && shops.length) best = shops[(kind.length * 7 + who.n) % shops.length];
    return best ? best.p.clone() : new THREE.Vector3(who.n % 2 ? END : -END, 0, NEAR);
  };
  const lane = (z) => (z < SPLIT ? FAR : NEAR);
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
      else { if (!h.hidden) { p.pose = 'stand'; if (h.at) face(h, pos.x, pos.z + (pos.z < SPLIT ? 3 : -3), dt); } if ((h.t -= dt) <= 0) next(h); }
      const far = Math.abs(pos.x) > END - 0.5; p.root.visible = !h.hidden && !far;
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
  block.story = (def) => { const rel = Object.entries(def.knows).map(([id, r]) => `${by[id].def.name.split(' ')[0]} is ${r}`).join('; '); return `You are a regular on this subway platform and know the ramen cart. Tonight you are ${def.tonight}. ${rel}.`; };
  G.block = block; return block;
}
