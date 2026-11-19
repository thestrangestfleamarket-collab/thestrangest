// the night's events (owner, 19 Nov 2026): two to four a night, chosen by the day and the stall's reputation, each needing something of the cook and ending well or badly (reputation, money, a regular's regard). One schema (EVENTS: who may come, what going well or badly is worth) and one runner; what each asks of the cook is in RUN
import { G, pick, rand } from './ctx.js';
import { COP } from './block.js';
import { RECIPES, DAYDISH, DRINKS } from './cart.js';

// every word of this file a player hears or reads, and what the talking mind is told
export const TEXT = {
  drunk: { name: 'ONE TOO MANY', hint: (soft, strong) => `They have had enough: give them ${soft}, not ${strong}`, line: (strong) => `A bowl! And ${strong}. The strong stuff. Keep it coming.`, who: 'You have had far too much to drink tonight and are loud and cheerful about it.', well: 'Sobered up, fed and grateful', badly: 'A scene at the counter' },
  lost: { name: 'A LOST TRAVELLER', hint: 'Tell them the way (speak, T to type, or wave them on) and serve the bowl', line: 'I have lost my way. Where can a stranger sleep tonight? And the cheapest bowl you have.', who: 'You are a traveller, lost and tired, who does not know this street. You asked the cook the way to somewhere to sleep.', well: 'Fed and shown the way', badly: 'Went off still lost' },
  crowd: { name: 'A CROWD COMING THROUGH', hint: (n) => `A crowd is coming: feed ${n} of them before they move on`, soon: 'A CROWD IS COMING DOWN THE STREET', line: 'Quick as you can, please. We are moving on.', who: 'You are passing through with a crowd and cannot stay long.', well: 'The crowd fed: word gets round', badly: 'The crowd moved on hungry' },
  cop: { name: 'THE ROUNDS', hint: (s) => `The rounds: clear every dirty bowl and wipe the counter (${s} s)`, line: 'Evening rounds. Let me see that you keep a clean stall.', prompt: 'You are on your evening rounds and have stopped at the ramen stall to see that it is kept clean. Tell the cook so, in a sentence.', well: 'A clean stall: a nod and on they go', badly: (fine) => `A dirty counter: fined ${fine}` },
  special: { name: 'OFF THE MENU', hint: (dish) => `Not on tonight's board: ${dish}, made right, pays double`, line: (dish) => `It is not on your board tonight, I know. Would you make me ${dish}? I will pay double.`, who: 'You asked the cook for a dish that is not on tonight\'s menu, and offered to pay double for it.', well: 'Made right: paid double', badly: 'Not what they asked for' },
  short: { name: 'SHORT OF MONEY', hint: (n) => `They can only pay ${n}: serve them anyway, or let them go`, line: (n) => `I have only ${n} on me. Could I still get a bowl?`, who: 'You are hungry and short of money: you told the cook exactly how little you have.', well: 'Fed for what they had: people saw', badly: 'Turned away hungry: people saw' },
  tag: 'TONIGHT',
};
// who may come (from which day, at what reputation) and what it is worth: rep to the stall's reputation, tip a bonus and fine a loss in bowls of the first dish
export const EVENTS = [
  { id: 'drunk', day: 1, rep: 0, well: { rep: 1, tip: 0.5 }, badly: { rep: -1 } },
  { id: 'lost', day: 1, rep: 0, well: { rep: 1, tip: 0.5 }, badly: { rep: 0 } },
  { id: 'crowd', day: 2, rep: 0, well: { rep: 2 }, badly: { rep: -1 } },
  { id: 'cop', day: 2, rep: 0, well: { rep: 1 }, badly: { rep: -1, fine: 3 } },
  { id: 'short', day: 2, rep: 0, well: { rep: 1 }, badly: { rep: -1 } },
  { id: 'special', day: 3, rep: 58, well: { rep: 1 }, badly: { rep: -1 } },
];
export const NIGHT = { first: 2, most: 4, from: 0.06, span: 0.8, cop: 35, crowd: 3, lead: 15 };   // how many on day one and at most, where in the night they fall, the rounds' seconds, the crowd's size and its warning

export function buildEvents() {
  const E = { list: [], cur: [], log: [], rep: 0 }, K = G.clock, U = RECIPES[DAYDISH[0]].price; G.events = E;
  const drinks = Object.keys(DRINKS).sort((a, b) => DRINKS[b] - DRINKS[a]), strong = drinks[0], soft = drinks[drinks.length - 1];
  const dish = (k) => { const r = RECIPES[k]; return r.name[0] + r.name.slice(1).toLowerCase(); }, fmt = (n) => G.money.fmt(n);
  const say = (c, T, line) => G.talk?.event(c, 'told', { as: 'ev', prompt: T.who + ' Say so to the cook in a sentence.', lines: [line] });
  const seat = (ev, o) => { const c = G.game.special({ ...o, ev }); if (c) { ev.c = c; c.tag = TEXT[ev.id].name; } return c; };
  // what each asks: start(ev) (false: not now), then whichever of tick, drink, served, done, left, said, waved it needs, each answering 'well', 'badly' or nothing yet
  const RUN = {
    drunk: { start: (ev) => !!seat(ev, { want: { key: G.game.cfg().menu[0], drink: strong }, pat: 1.3, line: (c) => say(c, TEXT.drunk, TEXT.drunk.line(strong)) }),
      hint: () => TEXT.drunk.hint(soft, strong),
      drink: (ev, c, k) => { if (k === strong && soft !== strong) { for (const o of G.game.customers) if (o !== c && o.state === 'waiting') o.patience *= 0.75; G.game.walk(c); return 'badly'; } c.order.drink = k; c.gotDrink = true; },
      done: () => 'well', left: () => 'badly' },
    lost: { start: (ev) => { const m = G.game.cfg().menu, k = m.slice().sort((a, b) => RECIPES[a].price - RECIPES[b].price)[0]; return !!seat(ev, { want: { key: k, drink: null }, line: (c) => say(c, TEXT.lost, TEXT.lost.line) }); },
      hint: () => TEXT.lost.hint, said: (ev) => { ev.told = true; }, waved: (ev) => { ev.told = true; },
      done: (ev) => (ev.told ? 'well' : 'badly'), left: () => 'badly' },
    crowd: { start: (ev) => { ev.t = NIGHT.lead; ev.n = 0; ev.fed = 0; ev.gone = 0; ev.tries = 0; ev.want = NIGHT.crowd; G.fx.popup(G.cart.seatSpots[1].clone().setY(1.5), [TEXT.crowd.soon], true); G.audio.play('bell'); return true; },
      hint: (ev) => TEXT.crowd.hint(Math.max(1, Math.ceil(ev.want * 2 / 3))),
      tick: (ev, dt) => { if ((ev.t -= dt) > 0) return; ev.t = 4;
        if (ev.n < ev.want) { const c = G.game.special({ ev, pat: 0.8, line: (c2) => say(c2, TEXT.crowd, TEXT.crowd.line) }); if (c) { ev.n++; c.tag = TEXT.crowd.name; } else if (++ev.tries >= 10) ev.want = ev.n; return; }
        if (!ev.n) return 'off'; if (ev.fed + ev.gone >= ev.n) return ev.fed >= Math.ceil(ev.n * 2 / 3) ? 'well' : 'badly'; },
      served: (ev) => { ev.fed++; }, left: (ev, c) => { if (!c.result) ev.gone++; } },
    cop: { start: (ev) => { const B = G.block, h = B && B.by[COP]; if (!h || h.taken || h.cop || B.mad[COP]) return false; const pos = h.p.root.position; if (h.hidden || Math.abs(pos.x) > 12) { pos.set(5, 0, -2.6); h.hidden = false; h.p.root.visible = true; } h.lead = null; h.chat = null; ev.t = NIGHT.cop;
        B.greet(h, { kind: 'story', t: 9, w: 0.3, say: 0.8, what: { prompt: TEXT.cop.prompt, line: TEXT.cop.line } }); return true; },
      hint: (ev) => TEXT.cop.hint(Math.max(0, Math.ceil(ev.t))),
      tick: (ev, dt) => { if ((ev.t -= dt) > 0) return; return E.mess() ? 'badly' : 'well'; } },
    special: { start: (ev) => { const g = G.game, m = g.cfg().menu, a = G.cart.avail(), off = DAYDISH.filter((k) => !m.includes(k) && G.cart.canMake(k, a)), k = off.length ? pick(off) : m[m.length - 1]; ev.key = k; return !!seat(ev, { want: { key: k, drink: null, any: true, twice: true }, pat: 1.3, line: (c) => say(c, TEXT.special, TEXT.special.line(dish(k))) }); },
      hint: (ev) => TEXT.special.hint(dish(ev.key)),
      served: (ev, c, r) => { if (r.score >= 75) { if (!G.prog.P.recipes.includes(ev.key)) G.prog.P.asks[ev.key] = (G.prog.P.asks[ev.key] | 0) + 1; return 'well'; } return 'badly'; }, left: () => 'badly' },
    short: { start: (ev) => { const m = G.game.cfg().menu, k = m[m.length - 1]; ev.pay = Math.max(1, Math.round(RECIPES[k].price / 2)); return !!seat(ev, { want: { key: k, drink: null }, line: (c) => say(c, TEXT.short, TEXT.short.line(fmt(ev.pay))) }); },
      hint: (ev) => TEXT.short.hint(fmt(ev.pay)), pay: (ev) => ev.pay, done: () => 'well', left: () => 'badly' },
  };
  E.mess = () => G.game.seats.filter((s) => s.dirty).length + (G.fx.splats && G.fx.splats.length > 2 ? 1 : 0);
  const settle = (ev, how) => { if (ev.how) return; ev.how = how; const o = ev.def[how] || {}, T = TEXT[ev.id], fine = (o.fine || 0) * U, tip = Math.round((o.tip || 0) * U); E.rep += o.rep || 0; G.game.extra += tip - fine;
    const text = typeof T[how] === 'function' ? T[how](fmt(fine)) : T[how]; E.cur.splice(E.cur.indexOf(ev), 1); E.log.push({ id: ev.id, how, name: T.name, text }); if (ev.c) ev.c.tag = '';
    G.fx.popup(G.cart.seatSpots[ev.c ? ev.c.seat : 1].clone().setY(1.45), [T.name, text, ...(tip ? ['+ ' + fmt(tip)] : [])], how === 'well'); G.audio.play(how === 'well' ? 'done' : 'bad'); G.story?.notes.push(`${T.name}: ${text}.`); if (G.story) G.story.dirty = true; };
  const call = (ev, k, ...a) => { const f = RUN[ev.id][k]; if (!f || ev.how) return; const how = f(ev, ...a); if (how === 'well' || how === 'badly') settle(ev, how); else if (how === 'off') { ev.how = how; E.cur.splice(E.cur.indexOf(ev), 1); } return how; };
  const of = (c) => (c && c.ev && !c.ev.how ? c.ev : null);
  // the game's side: a drink set by them (true: the event took it), a bowl served, the meal done, gone, the cook spoke to them, the cook waved, what they can pay
  E.drink = (c, k) => { const ev = of(c); if (!ev || !RUN[ev.id].drink) return false; call(ev, 'drink', c, k); return true; };
  E.served = (c, r) => { const ev = of(c); if (ev) call(ev, 'served', c, r); };
  E.done = (c) => { const ev = of(c); if (ev) call(ev, 'done', c); };
  E.left = (c, angry) => { const ev = of(c); if (ev) call(ev, 'left', c, angry); };
  E.said = (c) => { const ev = of(c) || E.cur.find((e) => RUN[e.id].said); if (ev) call(ev, 'said', c); };
  E.waved = () => { for (const ev of [...E.cur]) call(ev, 'waved'); };
  E.pay = (c, pay) => { const ev = c.ev; return ev && RUN[ev.id].pay ? Math.min(pay, RUN[ev.id].pay(ev)) : pay; };
  E.facts = (c) => (c.ev && TEXT[c.ev.id].who) || '';
  E.hint = () => { const ev = E.cur[0]; return ev ? `${TEXT[ev.id].name}: ${RUN[ev.id].hint(ev)}` : ''; };
  E.name = () => (E.cur[0] ? TEXT[E.cur[0].id].name : '');
  E.fire = (id) => { const def = EVENTS.find((x) => x.id === id); if (!def || G.game.state !== 'open') return null; const ev = { id, def, how: '' }; if (!RUN[id].start(ev)) return null; E.cur.push(ev); return ev; };
  // tonight's: chosen as the night begins
  E.plan = () => { const P = G.prog.P, can = EVENTS.filter((e) => P.day >= e.day && P.rep >= e.rep).sort(() => Math.random() - 0.5), n = Math.min(can.length, NIGHT.most, P.day === 1 ? NIGHT.first : 2 + Math.floor((P.day - 1) / 2) + (P.rep >= 65 ? 1 : 0));
    E.list = can.slice(0, n).map((def, i) => ({ id: def.id, at: NIGHT.from + (i + 0.3 + rand(0, 0.4)) / n * NIGHT.span, tries: 0 })); return E.list; };
  K.on('night', E.plan);
  K.on('reset', () => { E.list = []; E.cur.length = 0; E.log = []; E.rep = 0; });
  let t = 0;
  E.update = (dt) => { for (let i = E.cur.length - 1; i >= 0; i--) { const ev = E.cur[i]; if (RUN[ev.id].tick) call(ev, 'tick', dt); }
    if ((t -= dt) > 0) return; t = 1; if (K.phase !== 'night' || G.game.state !== 'open' || E.cur.length || G.guest) return;
    const due = E.list.find((x) => !x.done && K.pfrac >= x.at); if (!due) return; if (E.fire(due.id) || ++due.tries > 20) due.done = true; };
  return E;
}
