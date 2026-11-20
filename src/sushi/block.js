// the corner's own people: ten regulars who live or work round Market St by the park gate, across from the bodega, their families and friends, and a night's comings and goings; the cart's customers are these same people; they notice the cook (a wave, a word, a greeting of their own), and what the cook does to anyone (react.js) they remember all night and pass on
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';
import { buildReact } from './react.js';
import { KERB, FKERB, NZ, GATEX, XWALK, ground } from './plan.js';

// plan: 'inside s' (in the house or shop they stand at), 'stand s', 'play s' (the busker, playing where he stands), 'go place' (a spot on the corner, work, west, east, north), 'gone s' (off the corner), 'with id' / 'alone' (someone walks along)
export const COP = 'ray';   // the one who keeps the peace on the corner (react.js, the police beat)
// where they stop (plan.js SPOTS): bench the park bench east of the cart, kerb the kerb by the cart, rail the park's railings, lamp the signal post at the gate's crossing, gate the park gate and stall the mushroom stall west along the wall; across Market St bodega the bodega's door, lanes THE STRANGEST LANES, apts the Foundry Lofts' door, bar THE BAR; work off the street: east along Market St (THE ARCADE, the bookstore, the movie theatre), west past the gate (the subway stairs, the clinic, the Hudson), north through the park gate
export const CAST = [
  { id: 'hector', style: 'hotdogman', name: 'Héctor', age: 41, work: 'bodega', job: 'keeps the bodega across Market St from the ramen cart, as his father did; the family came up from Loíza in 1956', quirk: 'Gives everyone a nickname, runs a tab for half the street, follows the Mets and suffers for it.', tonight: 'minding the bodega and stepping over the street to the park wall for air',
    knows: { mei: 'who runs the laundromat under the Foundry Lofts next door; you trade change with her every day', nico: 'your son, who is supposed to be helping in the store', sal: 'the cabbie, who has bought his coffee at the bodega for twenty years', ray: 'the cop on the beat, whom you like and feed' }, plan: ['gone 60', 'go bench', 'stand 16', 'go kerb', 'stand 12', 'go work', 'gone 50', 'go rail', 'stand 10', 'go work'] },
  { id: 'mei', style: 'room_attendant', name: 'Mei', age: 44, work: 'apts', job: 'runs the laundromat under the Foundry Lofts on Market St, beside the bodega, open seven to eleven every day of the year; she came from Toisan by way of Hong Kong in 1968', quirk: 'Counts everything twice, never wastes a word, slips the street\'s kids a quarter when nobody is looking.', tonight: 'folding other people\'s wash and making change for the machines',
    knows: { hector: 'who keeps the bodega; you trade change with him every day', olena: 'the old Ukrainian lady upstairs, whose wash you do for nothing and never say so', kenny: 'your nephew, who dances in the street instead of studying', jo: 'the punk girl, who washes everything she owns in one black load' }, plan: ['inside 80', 'stand 14', 'go kerb', 'stand 12', 'go work', 'inside 70', 'go bench', 'stand 8', 'go work'] },
  { id: 'danny', style: 'game_master', name: 'Danny', age: 27, work: 'east', job: 'works the change booth at THE ARCADE, a block east along Market St, and plays bass in a band that practises in the cellar under THE BAR', quirk: 'Has an opinion on every record ever pressed and will tell you all of it.', tonight: 'making change at THE ARCADE and arguing about records with whoever stands still',
    knows: { jo: 'who sings in your band; you are a little in love with her', kenny: 'the b-boy, for whom you tape hip hop off the radio', hector: 'who lets you run a tab till Friday', ray: 'the cop, who tells you to turn it down' }, plan: ['gone 60', 'go lamp', 'stand 14', 'go bench', 'stand 10', 'go work', 'gone 50', 'go kerb', 'stand 12', 'go work'] },
  { id: 'ray', style: 'police_officer', name: 'Ray', age: 38, work: 'west', job: 'a patrolman who has walked Market St from the Hudson to the movie theatre for six years', quirk: 'Tired, fair, a dry sense of humour, takes his noodles firm.', tonight: 'walking the beat along Market St and round the park wall',
    knows: { hector: 'who keeps the bodega and never lets you pay for coffee', olena: 'the old lady, who reports every double-parked car to you', kenny: 'the kid who dances by the park gate, whom you move along and then stop to watch', sal: 'the cabbie, who talks your ear off about the Mets' }, plan: ['stand 25', 'go rail', 'stand 10', 'go east', 'gone 30', 'go lamp', 'stand 12', 'go kerb', 'stand 14', 'go work', 'gone 20'] },
  { id: 'olena', style: 'grandmother_in_a_rebozo', name: 'Olena', age: 71, work: 'apts', job: 'a Ukrainian widow who has lived in the same three rooms in the Foundry Lofts, over the laundromat, since 1948', quirk: 'Scolds everyone, feeds everyone, crosses herself when the punks go by.', tonight: 'sitting on the park bench, going home for her shawl, watching who comes and goes',
    knows: { mei: 'the laundromat lady, who is kind to you and pretends not to be', hector: 'who keeps the black bread back for you', nico: 'the boy, who carries your shopping up four flights', jo: 'the girl with the hair, whom you scold and secretly like' }, plan: ['inside 70', 'go bench', 'stand 26', 'go rail', 'stand 12', 'go work', 'inside 80', 'go bench', 'stand 18', 'go work'] },
  { id: 'kenny', style: 'teen_player', name: 'Kenny', age: 19, work: 'gate', job: 'a b-boy who dances on a sheet of cardboard by the park gate with his crew, and stocks shelves at the bodega three mornings a week', quirk: 'Never still, always practising a move, polite to his elders, big dreams.', tonight: 'dancing for change by the park gate and waiting for his crew',
    knows: { danny: 'at THE ARCADE, who tapes the new records for you', hector: 'your boss three mornings a week', mei: 'your aunt, who thinks dancing is no job', nico: 'the kid, who copies every move you make' }, plan: ['stand 30', 'go lamp', 'stand 14', 'go work', 'stand 26', 'go bench', 'stand 10', 'go work'] },
  { id: 'cora', style: 'diner_waitress', name: 'Cora', age: 36, work: 'east', job: 'a nurse on the night shift at THE CLINIC along Market St; she came from Manila in 1974 and lives in the Foundry Lofts across the street', quirk: 'Calm, notices everything, laughs easily, always a little short of sleep.', tonight: 'coming off one shift and getting ready for the next',
    knows: { mei: 'downstairs, who does your uniforms', olena: 'the old lady, whose blood pressure you check on the park bench', sal: 'the cabbie, who drives you home free when it is late', jo: 'the singer, whom you patched up after a show' }, plan: ['gone 50', 'go bench', 'stand 12', 'go apts', 'inside 40', 'go kerb', 'stand 8', 'go work', 'gone 60', 'go rail', 'stand 10', 'go work'] },
  { id: 'sal', style: 'trucker', name: 'Sal', age: 56, work: 'lamp', job: 'has driven a yellow cab for thirty years and takes his breaks by the park gate, under the signal at its crossing', quirk: 'Has a story about every street in the city and a fare who was somebody famous.', tonight: 'between fares, stretching his back under the signal and watching the flying cabs take his trade',
    knows: { hector: 'whose father sold you coffee before him', ray: 'the cop, a good kid, who has no idea about baseball', cora: 'the nurse, whom you drive home when it is late', danny: 'the arcade kid, whose music you cannot stand' }, plan: ['gone 40', 'stand 20', 'go bench', 'stand 12', 'go work', 'stand 16', 'go east', 'gone 60', 'go kerb', 'stand 10', 'go work'] },
  { id: 'jo', style: 'street_skater', name: 'Jo', age: 23, work: 'east', job: 'sings in a punk band, tears tickets at the movie theatre two nights a week, lives in a squat down by the Hudson', quirk: 'Sharp, funny, pretends not to care, never has more than five dollars.', tonight: 'killing time on the park wall until the band plays a late set at THE BAR',
    knows: { danny: 'your bass player, who looks at you too long', olena: 'the old lady, who scolds you and then gives you soup', mei: 'who lets you owe for the wash', cora: 'the nurse, who stitched your eyebrow after a show' }, plan: ['gone 50', 'go rail', 'stand 14', 'go bench', 'stand 12', 'go west', 'gone 40', 'go kerb', 'stand 12', 'go work'] },
  { id: 'nico', style: 'neighborhood_child', name: 'Nico', age: 10, work: 'bodega', job: 'Héctor\'s son, ten years old, who runs errands for the whole street', quirk: 'Asks everyone questions, wants to be a b-boy or a Met, cannot decide.', tonight: 'running errands and following Kenny about',
    knows: { hector: 'your father', kenny: 'the b-boy, your hero', olena: 'the old lady, whose bags you carry for a cookie', mei: 'the laundromat lady, who gives you quarters' }, plan: ['gone 15', 'go kerb', 'stand 12', 'go bench', 'stand 8', 'go apts', 'inside 20', 'go rail', 'stand 10', 'go work'] },
  // THE MARKET's own people, as they are there (folk.js): they come to this corner too
  { id: 'octopus', style: 'm:octobusk', market: true, slots: [5], name: 'Octopus', age: 40, work: 'busk', job: 'the octopus in the cowboy hat who busks with his guitar: by day on the subway platform under Market St, at night across the street from the ramen cart, before the bodega', quirk: 'Courtly and unhurried, plays any piece in the book without a stumble, says little and that in a few words of Spanish.', tonight: 'playing his guitar across Market St for whoever passes',
    knows: { sal: 'the cabbie, who asks for the same waltz every night', kenny: 'the b-boy, who dances to whatever you play', badger: 'who keeps THE BAR and stands you your one beer' }, plan: ['play 140', 'play 120', 'stand 12', 'play 150', 'go kerb', 'stand 10', 'go work', 'play 130'] },
  { id: 'mushroom', style: 'm:mushroom', market: true, slots: [4], name: 'Mushroom Seller', age: 60, work: 'stall', job: 'sells mushrooms from a tray and from his stall at the park wall, by the gate, a few steps west of the ramen cart; he picks them himself before dawn and will not say where', quirk: 'Soft-spoken, smells of earth, speaks of mushrooms as of old friends; his face is a bare skull under his hat and nobody remarks on it.', tonight: 'walking the park wall with his tray',
    knows: { olena: 'the old lady, who buys your chanterelles and says her mother\'s were better', hector: 'who keeps the bodega and sends people to your booth', badger: 'who keeps THE BAR and takes your morels for his kitchen' }, plan: ['gone 70', 'go rail', 'stand 16', 'go bench', 'stand 10', 'go work', 'gone 90'] },
  { id: 'badger', style: 'm:w_badger', market: true, slots: [6], name: 'Badger', age: 50, work: 'bar', job: 'keeps THE BAR across Market St, past the Foundry Lofts, and pours its drinks; when he has put the last one out he comes over the street for the last bowl of the night', quirk: 'Gruff, dry, dead on his feet, counts the night\'s takings in his head while he eats.', tonight: 'pouring at THE BAR until last call, then over the street to the cart',
    knows: { octopus: 'the busker, whom you stand one beer a night', danny: 'the arcade kid, whose band is too loud for your cellar and plays there anyway', jo: 'who sings with that band and never pays for a drink', ray: 'the cop, who looks in at closing' }, plan: ['gone 240', 'go lamp', 'stand 8', 'go work', 'gone 200'] },
];
const _v = new THREE.Vector3();
export function buildBlock(root, shops, o = {}) {
  const NEAR = o.near ?? -4.4, FAR = o.far ?? -5.4, SPLIT = o.split ?? -5, END = o.end ?? 60, WEST = o.west ?? -60, NORTH = 46, FARZ = FKERB - 2.2;
  const lane = (h) => (h && h.n % 2 ? FAR : NEAR) + (h ? mine(h) : 0);
  // each keeps a line of their own within a lane, and a spot of their own at a place, so two bound the same way are never one body
  const mine = (h) => ((h.n * 0.37) % 1 - 0.5) * 0.32, spot = (v, h) => { v.x += ((h.n % 5) - 2) * 0.45; return v; };
  const place = (kind, who) => { // a spot of that kind; the ways off the street: east along Market St, west past the park gate toward the Hudson, north through the gate into the park
    if (kind === 'east') return new THREE.Vector3(END, 0, lane(who)); if (kind === 'west') return new THREE.Vector3(WEST, 0, lane(who)); if (kind === 'north') return new THREE.Vector3(GATEX, 0, NORTH);
    const best = shops.find((s) => s.type === kind) || shops[(kind.length * 7 + who.n) % shops.length];
    return best ? spot(best.p.clone(), who) : new THREE.Vector3(END, 0, lane(who));
  };
  // which pavement a point is on: the cart's ('home'), the one across Market St ('far')
  const side = (p) => (p.z < (KERB + FKERB) / 2 ? 'far' : 'home');
  // the way from one place to another: along one's lane of the cart's pavement, over Market St at one place (XWALK), into the park through its gate
  const route = (from, to, h) => { const P = (x, z) => new THREE.Vector3(x, 0, z), out = [], lz = lane(h), a = side(from), b = side(to); let at = from;
    const along = (x, z = lz) => { if (Math.abs(at.z - z) > 0.3 && Math.abs(at.x - x) > 0.6) out.push(P(at.x, z)); out.push(at = P(x, z)); };
    if (a !== b) { if (a === 'far') { along(XWALK, FARZ); out.push(at = P(XWALK, KERB + 0.6)); }
      if (b === 'far') { along(XWALK); out.push(P(XWALK, KERB + 0.4), at = P(XWALK, FARZ)); out.push(at = P(to.x, FARZ)); } }
    if (b === 'home') { if (to.z > NZ + 1) { along(GATEX, Math.min(lz, -3)); } else along(to.x); }
    if (at.distanceTo(to) > 0.3 || !out.length) out.push(to.clone()); return out; };
  const people = CAST.map((def, n) => {
    const p = makePerson(700 + n * 13, def.style), h = { def, p, n, i: (n * 3) % def.plan.length, t: 0, path: null, hidden: true, taken: false, lead: null, crew: [], chat: null, cool: 0, at: null };
    p.root.traverse((o) => { o.userData.nopick = true; }); root.add(p.root); p.cast = def; h.spk = { p, h, passer: true, here: () => !h.taken && !h.hidden && p.root.visible }; h.at = place(def.work, h); p.root.position.copy(h.at); p.root.visible = false; h.t = 5 + n * 9; h.step = 'inside'; return h;
  });
  const by = Object.fromEntries(people.map((h) => [h.def.id, h]));
  const abed = (h) => { const hr = G.clock ? G.clock.hour : 12, a = h.def.age; return (a < 14 && hr > 21.5) || (a >= 65 && hr > 24.5 && hr < 28.5); };   // children are indoors from half past nine till the morning, the old in the small hours
  const next = (h) => { // begin the next thing on their list
    if (abed(h)) { h.step = 'inside'; h.hidden = true; h.t = 40; h.run = 0; return; }
    for (let guard = 0; guard < 8; guard++) {
      const [verb, arg] = h.def.plan[h.i = (h.i + 1) % h.def.plan.length].split(' ');
      if (verb === 'with') { const o = by[arg]; if (o && !o.taken && !o.lead && !o.crew.length) { o.lead = h; h.crew.push(o); o.hidden = h.hidden; o.p.root.position.copy(h.p.root.position); o.chat = null; } continue; }
      if (verb === 'alone') { for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; continue; }
      h.run = 0; if (verb === 'go') { const to = place(arg === 'work' ? h.def.work : arg, h); if (h.hidden) { h.hidden = false; } h.path = route(h.p.root.position, to, h); h.at = to; h.step = 'go'; h.end = arg; return; }
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
    const pos = h.p.root.position; h.path = route(pos, place(pos.x > -2 ? 'east' : 'west', h), h); h.step = 'go'; h.end = 'east'; h.run = 2.6; };
  // someone was attacked at the cart: the officer on the beat hurries over and has a word with the cook
  block.cop = COP;
  block.police = (at, them) => { const h = by[COP]; if (!h || h.taken || h.cop) return false; const pos = h.p.root.position; if (h.lead) { const L = h.lead; L.crew.splice(L.crew.indexOf(h), 1); h.lead = null; } for (const o of h.crew) { o.lead = null; o.t = 0; o.step = 'stand'; } h.crew.length = 0; if (h.chat) { h.chat.o.chat = null; h.chat = null; } h.greet = null;
    if (h.hidden || Math.abs(pos.x) > 26 || side(pos) !== 'home') { pos.set(30, 0, NEAR); h.hidden = false; } const x = Math.max(-1.6, Math.min(1.6, at.x + 0.8)); h.path = route(pos, new THREE.Vector3(x, 0, -2.05)); h.step = 'go'; h.end = 'cop'; h.run = 2.3; h.cop = { them, t: 32, said: false }; return true; };
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
      else { if (!h.hidden) { p.pose = h.step === 'play' && p.market && (G.rainK || 0) < 0.7 ? 'play' : 'stand'; if (h.at) face(h, pos.x, pos.z + (pos.z < (KERB + FKERB) / 2 ? 3 : pos.z > 0 ? -3 : pos.z < KERB + 2.5 ? 3 : -3), dt); } if ((h.t -= dt) <= 0) next(h); }
      const far = pos.x > END - 0.5 || pos.x < WEST + 0.5 || pos.z > NORTH - 0.5; pos.y = ground(pos.x, pos.z); p.root.visible = !h.hidden && !far;
      if (p.root.visible) { p.look = h.greet || h.step === 'cop' ? cam.clone().setY(cam.y - 0.05) : Math.abs(pos.x) < 5 && pos.z > -6 && pos.z < 1 && p.pose === 'walk' ? (mad(h) ? null : EYE) : h.chat ? _v.copy(h.chat.o.p.root.position).setY(1.55).clone() : null; p.update(dt, t); }
    }
    // nobody walks through anybody: two closer than an arm's length step apart, sideways when they meet head on; the cart's own customers hold their ground
    { const out = people.filter((h) => !h.taken && !h.hidden && h.p.root.visible && !h.p.reeling?.()), others = (G.game ? G.game.customers : []).filter((c) => c.p && c.p.root.visible).map((c) => c.p.root.position), GAP = 0.62, LO = FAR - 0.32, HI = NEAR + 0.4;
      const part = (a, b, i, fixed) => { const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz); if (d >= GAP) return; const ov = Math.min(GAP - d, 1.4 * dt) * (fixed ? 1 : 0.5), nx = d > 1e-3 ? dx / d : 0, nz = d > 1e-3 ? dz / d : i % 2 ? 1 : -1, side = Math.abs(nz) < 0.5 ? (i % 2 ? 1 : -1) * 0.9 : 0;
        a.x += nx * ov * 0.35; if (a.z > LO - 0.4 && a.z < HI + 0.4) a.z = Math.min(HI, Math.max(LO, a.z + (nz + side) * ov)); else a.z += nz * ov; if (!fixed) { b.x -= nx * ov * 0.35; if (b.z > LO - 0.4 && b.z < HI + 0.4) b.z = Math.min(HI, Math.max(LO, b.z - (nz + side) * ov)); else b.z -= nz * ov; } };
      for (let i = 0; i < out.length; i++) { const a = out[i].p.root.position; for (let j = i + 1; j < out.length; j++) part(a, out[j].p.root.position, i + j, false); for (const c of others) part(a, c, i, true); } }
    if ((scan -= dt) <= 0) { scan = 0.5; camAt();
      // a regular passing close greets the cook first, now and then
      if (t > hiAll) for (const h of people) { if (!free(h) || h.greet || h.chat || mad(h) || h.step !== 'go' || t < (h.hiT || 0) || flat(h) > 6) continue; h.hiT = t + 60; if (Math.random() < 0.2) { h.hiT = t + 300; hiAll = t + 60; greet(h, { kind: 'hello', w: 0.2, say: 0.4, t: 2.6, come: Math.random() < 0.2 }); break; } }
      // people who know each other stop when they meet
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) { const a = people[i], b = people[j]; if (a.taken || b.taken || a.hidden || b.hidden || a.chat || b.chat || a.lead || b.lead || a.lead === b || b.crew.includes(a) || a.crew.includes(b) || !a.def.knows[b.def.id]) continue;
        const k = i * 16 + j; if ((met.get(k) || 0) > t || a.p.root.position.distanceTo(b.p.root.position) > 2.2 || Math.abs(a.p.root.position.x) > 30) continue; met.set(k, t + 90); tell(a, b); tell(b, a); const T = 7 + Math.random() * 6; a.chat = { o: b, t: T, lead: true, say: 0.4, turn: false }; b.chat = { o: a, t: T }; if (Math.random() < 0.6) a.p.gesture?.('wave'); }
    }
    G.react?.update(dt);
  };
  // one of them comes to the cart: the game walks them from here on, and hands them back when they go
  block.take = (want) => { const free = people.filter((h) => !h.taken && !abed(h) && !h.lead && !h.crew.length && !h.chat && !h.cop && !mad(h) && !(h.wary && block.told[h.def.id]) && !h.p.reeling?.()); if (!free.length) return null; const seen = free.filter((h) => !h.hidden && Math.abs(h.p.root.position.x) < 30 && side(h.p.root.position) === 'home'), h = want ? free.find((x) => x === want) : free.find((x) => x.come) || (seen.length ? seen : free)[(Math.random() * (seen.length || free.length)) | 0]; if (!h) return null; h.come = false; h.greet = null;
    if (h.hidden || Math.abs(h.p.root.position.x) > 30 || side(h.p.root.position) !== 'home' || h.p.root.position.z > NZ) { if (Math.random() < 0.5) h.p.root.position.set(16, 0, NEAR + 0.25); else h.p.root.position.set(-16, 0, NEAR + 0.25); } h.taken = true; h.hidden = false; h.p.root.visible = true; h.p.cast = h.def; h.p.neighbour = h; return h; };
  block.give = (h) => { h.taken = false; h.hidden = false; root.add(h.p.root); h.p.pose = 'walk'; h.p.look = null; h.i = h.def.plan.findIndex((s) => s === 'go work'); if (h.i < 0) h.i = 0; h.i -= 1; next(h); };
  // who someone is to the rest of the street, for what they say at the counter
  block.story = (def) => { const rel = Object.entries(def.knows).map(([id, r]) => `${by[id].def.name.split(' ')[0]} is ${r}`).join('; '); const m = block.mad[def.id], tl = block.told[def.id]; return `You live or work on Market St by the park gate, in New York in 1985, and know the ramen cart on the sidewalk at the park's wall, across the street from the bodega. Tonight you are ${def.tonight}. ${rel}.${m ? ` Earlier tonight the cook at the cart ${m.you}; you are angry and will not eat there again.` : tl ? ` Earlier tonight ${tl.from} told you the cook at the cart ${tl.them}.` : ''}`; };
  G.react = buildReact(block);
  G.block = block; return block;
}
