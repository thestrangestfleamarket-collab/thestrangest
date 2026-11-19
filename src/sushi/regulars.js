// the regulars who matter (owner, 19 Nov 2026): each of the street's named people (block.js's CAST, whoever they are) has a usual order and usual hours (one or two visits a day), remembers what you served last and whether it was right, likes the stall more or less for it (tips, friends brought along), asks for a dish not yet on the menu, and has a small story told a beat at a time over several days; what they remember goes to their talk (talk.js facts) and is kept with the run (progress.js)
import { G, clamp } from './ctx.js';
import { CAST, COP } from './block.js';
import { RECIPES, DAYDISH, DRINKS } from './cart.js';

// every word of this file a player hears or reads, and what the talking mind is told
export const TEXT = {
  usual: 'THE USUAL',
  order: { prompt: 'You just sat down at the stall where you are a regular. Say hello and ask for your usual, in a few plain words.', lines: ['Hello again. The usual, please.', 'My usual, if you would.', 'The usual for me.'] },
  ask: { prompt: (dish) => `You enjoyed that. Ask the cook, warmly and in one sentence, whether they might put ${dish} on the menu one day: it is your favourite.`, lines: (dish) => [`Do you ever think of making ${dish}? I would come twice as often.`] },
  tale: (line) => `While you eat, tell the cook this about your own life, in your own words, in a sentence or two: "${line}"`,
  facts: { n: (n) => `You are a regular at this stall: you have eaten here ${n} time${n === 1 ? '' : 's'} before.`, last: (dish, ok) => `Last time you had the ${dish} and it was ${ok ? 'just right' : 'not right'}.`, fond: 'You have grown fond of this cook.', sore: 'This stall has let you down lately.', usual: 'This is your usual order; you can just call it "the usual".', settle: (dish) => `What you really wanted is ${dish}, which is not on the menu; you settled for this.` },
  asked: (name, dish) => `${name} asked for ${dish}.`,
};
// each regular's small story: a beat is told when they like the stall enough, at most one a day. [what they tell, the cook's note]
export const ARCS = [
  [['Someone owes me money and keeps putting me off. I lie awake over it.', 'is owed money and cannot sleep.'], ['They paid me half of it. Half! I nearly fell over.', 'got half the debt back.'], ['It is settled, every coin. The first thing I did was come here.', 'was paid in full, and came here first.']],
  [['My sister writes that she may come and live near us.', 'has a sister who may move here.'], ['She is coming, it is decided. I am finding her a room.', 'is finding the sister a room.'], ['She is here. I will bring her by for a bowl.', 'the sister has arrived.'], ['She says your broth is better than our mother\'s. Do not tell our mother.', 'the sister likes the broth.']],
  [['My hands are not what they were. I wonder how long I can keep at my work.', 'worries about their hands.'], ['I have taken on a young helper. Clumsy, but willing.', 'took on a helper.'], ['The helper did a whole day alone. I sat and watched. Imagine that.', 'the helper managed a day alone.']],
  [['It has been a thin season. I count every coin twice.', 'is having a thin season.'], ['Things are turning. I may come out even.', 'may come out even.'], ['A good season after all. Tonight I can pay for someone else\'s bowl too.', 'had a good season after all.']],
  [['Tomorrow it is a year since my mother died. She would have liked this place.', 'lost their mother a year ago.'], ['I went to her grave. I told her about your broth.', 'visited the grave.'], ['I planted something where she is buried. It took.', 'planted something on the grave.']],
  [['I think about going home. I have been away too long.', 'thinks of going home.'], ['I wrote home. No answer yet.', 'wrote home.'], ['They wrote back: come when you can. Next year, maybe. Not yet.', 'heard from home.'], ['I sent them a little money. It felt like being there.', 'sent money home.']],
  [['I do not say much about where I was before. It ended badly.', 'has a past that ended badly.'], ['There was someone I worked for, and I let them down. That is all of it.', 'let someone down once.'], ['I have been offered steady work here. I think I will stay.', 'means to stay.']],
  [['An old friend of mine is ill. I sit with her most afternoons.', 'sits with a sick friend.'], ['She ate a little today. She asked for soup like yours.', 'the friend is eating again.'], ['She is up and scolding everyone. That is how I know she is well.', 'the friend is well.']],
];
const ARC_COP = [['Someone has been taking small things from doorsteps. I am watching.', 'is watching for a doorstep thief.'], ['I know who it is. A hungry kid, that is all.', 'found the thief: a hungry kid.'], ['I found the kid a place to work. No more thefts.', 'found the kid work.']];
const ARC_KID = [['I am learning to read! I know nine of them already.', 'is learning to read.'], ['I read your whole board today. Nearly all of it.', 'read the menu board.'], ['I wrote my own name. I left it at home, but I did.', 'wrote their own name.']];
// their usual hours, as shares of the run: morning, midday, afternoon, dusk, the evening, late, the small hours
export const SLOTS = [[0.02, 0.11], [0.13, 0.22], [0.24, 0.3], [0.31, 0.39], [0.42, 0.58], [0.6, 0.71], [0.73, 0.87]];
export const LIKE = { great: 85, good: 70, bad: 50, up: 1, half: 0.5, down: -1, walked: -2, wronged: 3, tip: 0.06, friend: 4, friendP: 0.35, beat: 1.5, ask: 1 };   // how a bowl's score moves their affection (-5..10), what affection does
const hash = (a, b, c) => { const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return x - Math.floor(x); };

export function buildRegulars() {
  const R = { today: {}, asked: {} }, K = G.clock; G.regs = R;
  const drinks = Object.keys(DRINKS).sort((a, b) => DRINKS[b] - DRINKS[a]), strong = drinks[0], soft = drinks[drinks.length - 1];
  const kid = (def) => def.age < 14;
  R.plan = (n) => { const def = CAST[n], a = n % 7, b = (n * 3 + 4) % 7, s = kid(def) ? [a % 4, b % 4] : [a, b]; return s[0] === s[1] ? [s[0]] : s; };
  R.usual = (n) => { const def = CAST[n], d = [strong, null, soft][n % 3]; return { key: DAYDISH[n % DAYDISH.length], drink: d === strong && def.age < 18 ? soft : d, firm: n % 4 === 1 }; };
  R.arc = (n) => (CAST[n].id === COP ? ARC_COP : kid(CAST[n]) ? ARC_KID : ARCS[n % ARCS.length]);
  R.at = (n, s) => SLOTS[s][0] + hash(n, s, G.prog.P.day) * (SLOTS[s][1] - SLOTS[s][0]) * 0.7;
  // who is due at the counter now: their hour has come, they have not been in this slot today, and not twice already
  R.due = () => { const B = G.block; if (!B) return null; const f = K.frac;
    for (const h of B.people) { const t = R.today[h.n] || 0; if ((t & 255) >= 2 || h.taken || B.mad[h.def.id]) continue; for (const s of R.plan(h.n)) if (!(t & (256 << s)) && f >= R.at(h.n, s) && f < SLOTS[s][1]) { R.slot = s; return h; } } return null; };
  R.came = (h) => { R.today[h.n] = ((R.today[h.n] || 0) + 1) | (256 << R.slot); };
  R.visits = (n) => (R.today[n] || 0) & 255;
  // what they will have: the usual if it is on the menu now, else something that is
  R.order = (h) => { const u = R.usual(h.n), menu = G.game.cfg().menu, on = menu.includes(u.key); return { key: on ? u.key : menu[h.n % menu.length], drink: u.drink, firm: on && u.firm, usual: on }; };
  const rec = (c) => G.prog.reg(c.nb.def.id);
  R.known = (c) => !!(c.nb && c.usual && rec(c).n >= 1);
  R.tip = (c) => (c.nb ? 1 + clamp(rec(c).a, -5, 10) * LIKE.tip : 1);
  R.friend = (c) => !!c.nb && rec(c).a >= LIKE.friend && Math.random() < LIKE.friendP;
  const dish = (k) => { const r = RECIPES[k]; return r ? r.name[0] + r.name.slice(1).toLowerCase() : k; };
  // the meal is done: they remember it, and like the stall more or less for it
  R.served = (c, r) => { if (!c.nb) return; const m = rec(c), s = r.score; m.n++; m.k = c.order.key; m.d = c.order.drink || ''; m.ok = s >= 80 ? 1 : 0; m.a = clamp(m.a + (s >= LIKE.great ? LIKE.up : s >= LIKE.good ? LIKE.half : s < LIKE.bad ? LIKE.down : 0), -5, 10);
    const want = R.usual(c.nb.n).key, id = c.nb.def.id; if (!G.prog.P.recipes.includes(want) && s >= LIKE.good && m.a >= LIKE.ask && !R.asked[id]) { R.asked[id] = 1; G.prog.P.asks[want] = (G.prog.P.asks[want] | 0) + 1; G.story?.notes.push(TEXT.asked(c.nb.def.name, dish(want))); G.talk?.event(c, 'told', { as: 'ask', prompt: TEXT.ask.prompt(dish(want)), lines: TEXT.ask.lines(dish(want)) }); } };
  R.walked = (c) => { if (c.nb) { const m = rec(c); m.a = clamp(m.a + LIKE.walked, -5, 10); } };
  // what the talking mind is told about them and this stall
  R.facts = (c) => { if (!c.nb || c.passer) return ''; const m = rec(c), F = TEXT.facts, u = R.usual(c.nb.n); return [m.n ? F.n(m.n) : '', m.k ? F.last(dish(m.k), m.ok) : '', m.a >= LIKE.friend ? F.fond : m.a <= -2 ? F.sore : '', c.order ? (c.usual ? F.usual : F.settle(dish(u.key))) : ''].filter(Boolean).join(' '); };
  R.orderLine = (c) => { if (!R.known(c) || !G.talk) return false; G.talk.event(c, 'told', { as: 'usual', prompt: TEXT.order.prompt, lines: TEXT.order.lines }); return true; };
  // a beat of their story, while they eat: when they like the stall enough, one a day
  let t = 0;
  R.update = (dt) => { if ((t -= dt) > 0) return; t = 1; const g = G.game; if (!g) return;
    for (const c of g.customers) { if (!c.nb || c.state !== 'eating' || c.taled || c.t < 5) continue; c.taled = true; const m = rec(c), arc = R.arc(c.nb.n), b = arc[m.b]; if (!b || m.a < LIKE.up + m.b * LIKE.beat || m.bd >= G.prog.P.day) continue;
      m.b++; m.bd = G.prog.P.day; G.story?.notes.push(`${c.nb.def.name} ${b[1]}`); if (G.story) G.story.dirty = true; R.told = { id: c.nb.def.id, beat: m.b }; G.talk?.event(c, 'told', { as: 'tale', prompt: TEXT.tale(b[0]), lines: [b[0]] }); } };
  // a new day: yesterday's grudges are over on the street, but whoever the cook wronged thinks less of the stall
  K.on('reset', () => { R.today = {}; R.asked = {}; const B = G.block; if (!B) return; for (const id in B.mad) { const m = G.prog.reg(id); m.a = clamp(m.a - LIKE.wronged, -5, 10); delete B.mad[id]; } for (const id in B.told) delete B.told[id]; });
  return R;
}
