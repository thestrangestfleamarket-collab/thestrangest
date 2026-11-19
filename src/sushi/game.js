// the customers, their orders and tickets, how a bowl is judged and paid for in coin, the day's service on the run's clock (clock.js) and the day's stock
import * as THREE from 'three';
import { G, V3, rand, pick, clamp, lerp } from './ctx.js';
import * as T from './tex.js';
import { makePerson } from './avatars.js';
import { SEATS, RECIPES, DRINKS, BOWL_BROTH } from './cart.js';
import { TOPPINGS, TARE, BROTH, doneness } from './items.js';
import { buildTill, mon } from './till.js';
import { TEXT as RT } from './rush.js';

// what is on the menu (the dishes unlocked, the night's short card) is the run's (progress.js G.prog.stage); how fast customers come and how long they wait is the day's pressure (rush.js)
export const TEXT = { firm: 'NOODLES: FIRM (katame)', refund: 'Asked for half back', usual: 'THE USUAL', day: 'DAY', of: 'OF', fee: 'FEE', double: 'PAYS DOUBLE' };
const D_SAKE = 0.24, D_TEA = 0.12, X_CHASHU = 0.16, X_EGG = 0.12 * 0.84; // how often a customer asks for each
const POT = 0.965;   // a pot's level between brimful and too low to ladle
// a night's stock: what its expected customers need, and a quarter more so nothing is wasted (the pots and crocks hold the night's bowls, the kettle and jars the quarter)
export function stockPlan(cfg) {
  const E = cfg.guests, M = cfg.menu, avg = (f) => M.reduce((n, k) => n + f(RECIPES[k]), 0) / M.length, up = (x) => Math.ceil(x * 1.25 - 1e-9);
  const P = { noodles: up(E), sake: cfg.drinks ? up(E * D_SAKE) : 0, tea: cfg.drinks ? up(E * D_TEA) : 0, tops: {}, broth: {}, tare: {}, tareSpare: {} };
  for (const t of Object.keys(TOPPINGS)) P.tops[t] = up(E * (avg((r) => r.tops[t] || 0) + (cfg.mods ? (t === 'chashu' ? X_CHASHU : t === 'egg' ? X_EGG : 0) : 0)));
  const cap = Math.floor(POT / BOWL_BROTH * G.mods.pot); let over = 0;   // (what a pot cannot hold waits in the kettle)
  for (const b of Object.keys(BROTH)) { const n = Math.ceil(E * avg((r) => (r.broth === b ? 1 : 0)) - 1e-9); P.broth[b] = Math.min(cap, n); over += n - P.broth[b]; }
  P.brothSpare = Math.ceil(E * 0.25) + over;
  for (const k of Object.keys(TARE)) { const n = E * avg((r) => (r.tare === k ? 1 : 0)); P.tare[k] = Math.ceil(n - 1e-9); P.tareSpare[k] = n > 0 ? Math.ceil(n * 0.25) : 0; }
  return P;
}

export function buildGame(scene) {
  const C = G.cart;
  const game = {
    state: 'prep', skill: 0, money: 0, tips: 0, served: 0, lateServed: 0, lost: 0, scores: [], customers: [], seats: SEATS.map(() => ({ c: null, dirty: null })),
    spawnT: 4, ticketNo: 1, ledT: 0, summary: null, paused: false, extra: 0, refused: 0,
  };
  const K = G.clock;
  game.cfg = () => G.prog.stage(K.phase === 'night' || K.phase === 'dawn');
  const dayPlan = () => { const d = G.prog.stage(false), n = G.prog.stage(true); return { menu: [...new Set([...d.menu, ...n.menu])], mods: d.mods, drinks: true, guests: G.rush.expect() }; };   // what the whole run, its day and its night, is stocked for
  G.game = game;
  const till = buildTill(scene, C);
  game.restock = () => { C.restock(stockPlan(dayPlan())); till.reset(); };
  game.restock();
  // the morning again (a run begun over): the takings, the stock and the counter as they were before the first bowl
  game.newDay = () => { for (const c of [...game.customers]) { if (c.ticket) c.ticket.removeFromParent(); if (c.nb) G.block?.give(c.nb); else if (!c.guest) c.p.root.removeFromParent(); } game.customers.length = 0; game.seats.forEach((s) => { s.c = null; s.dirty = null; });
    game.money = game.tips = game.served = game.lost = game.lateServed = game.extra = game.refused = 0; game.skill = 0; game.spawnT = 4; game.scores = []; game.ticketNo = 1; if (game.summary) { game.summary.removeFromParent(); game.summary = null; } game.state = 'prep'; C.setOpen(false); game.restock(); };
  K.on('reset', game.newDay);

  // seat drop targets
  SEATS.forEach((x, i) => {
    const spot = C.seatSpots[i];
    G.targets.push({
      getPos: () => spot, r: 0.21, prio: 2,
      accepts: (it) => { const c = game.seats[i].c; if (!c) return false; if (it.kind === 'bowl') return c.state === 'waiting' && !it.dirty && !it.empty; if (it.kind === 'drink') return (c.state === 'waiting' || c.state === 'eating') && c.order.drink && !c.gotDrink; return false; },
      receive: (it) => {
        const c = game.seats[i].c;
        if (it.kind === 'bowl') { it.obj.position.set(x, 1.0, -0.71); it.upright(); serve(c, it); }
        else { it.obj.position.set(x + 0.19, 1.0, -0.66); it.upright(); it.served = true; c.bottle = it; if (G.events?.drink(c, it.drink)) { /* the night's event took it (events.js) */ } else if (it.drink === c.order.drink) { c.gotDrink = true; G.talk?.event(c, 'gotdrink'); } else c.wrongDrink = true; G.audio.play('bottle'); drawTicket(c, true); }
      },
    });
  });

  function makeOrder(want) { // want: a recipe's key (in place of one sold out), or what a tenant of THE MARKET chose from the menu ({ key, drink }, live.js)
    const w = want && typeof want === 'object' ? want : null, cfg = game.cfg(), a = C.avail(), can = cfg.menu.filter((k) => C.canMake(k, a)), key = (w ? (cfg.menu.includes(w.key) || (w.any && RECIPES[w.key]) ? w.key : null) : want) || pick(can.length ? can : cfg.menu), r = RECIPES[key], tops = { ...r.tops }, mods = []; // what the board says is sold out is not asked for
    let price = r.price, firm = false, no = null;
    if (cfg.mods && !w) {
      if (Math.random() < 0.25) { firm = true; mods.push(TEXT.firm); }
      if (Math.random() < 0.2) { no = pick(Object.keys(tops).filter((k) => k !== 'chashu')); delete tops[no]; mods.push(`NO ${TOPPINGS[no].label}`); }
      if (Math.random() < 0.16) { tops.chashu = 3; price += 8; mods.push('+ EXTRA CHASHU (x3)'); }
      else if (Math.random() < 0.12) { tops.egg = (tops.egg || 0) + 1; price += 4; mods.push(`+ EXTRA EGG (x${tops.egg})`); }
    }
    if (w && w.firm && cfg.mods) { firm = true; mods.push(TEXT.firm); } if (w && w.twice) { price *= 2; mods.push(TEXT.double); }
    const d = Math.random(); const drink = !cfg.drinks ? null : w ? w.drink || null : cfg.night ? (d < 0.4 ? 'sake' : d < 0.65 ? 'tea' : null) : d < D_SAKE ? 'sake' : d < D_SAKE + D_TEA ? 'tea' : null;
    return { key, recipe: r, tops, mods, firm, no, drink, price, no_: 0, num: game.ticketNo++ };
  }

  // The ticket is the whole recipe: every step, ticked off live against the bowl being built.
  function ticketLines(c) {
    const o = c.order, r = o.recipe, L = [];
    let best = null, bs = -1;
    const score = (b) => (b.tare === r.tare ? 1 : 0) + (b.brothType === r.broth ? b.broth : 0) + (b.noodles ? 1 : 0) + b.toppings.filter((t) => t in o.tops).length;
    for (const b of G.items) if (b.kind === 'bowl' && !b.dirty && !b.served && !b.empty) { const sc = score(b); if (sc > bs) { bs = sc; best = b; } }
    const b = best, have = {}; if (b) b.toppings.forEach((t) => (have[t] = (have[t] || 0) + 1));
    L.push({ t: `TARE  ${TARE[r.tare].label}`, ok: !!b && b.tare === r.tare && !b.mixed, bad: !!b && !!b.tare && (b.tare !== r.tare || b.mixed) });
    L.push({ t: `BROTH ${BROTH[r.broth].label} x2`, ok: !!b && b.brothType === r.broth && b.broth >= 1.6, bad: !!b && b.broth > 0.2 && b.brothType !== r.broth, part: b && b.brothType === r.broth && b.broth > 0.1 && b.broth < 1.6 ? Math.round(b.broth * 50) + '%' : '' });
    const dn = b && b.noodles ? doneness(b.noodles.cook).key : null, want = o.firm ? 'firm' : 'regular';
    L.push({ t: o.firm ? 'NOODLES FIRM (yellow)' : 'NOODLES (green zone)', ok: dn === want, bad: !!dn && dn !== want, mod: o.firm });
    for (const [t, n] of Object.entries(o.tops)) L.push({ t: `${TOPPINGS[t].label}${n > 1 ? ' x' + n : ''}`, ok: (have[t] || 0) >= n, part: have[t] && have[t] < n ? `${have[t]}/${n}` : '', bad: (have[t] || 0) > n, mod: n !== (r.tops[t] || 0), ind: true });
    if (o.no) L.push({ t: `NO ${TOPPINGS[o.no].label}`, ok: false, bad: !!have[o.no], mod: true, ind: true, ban: true });
    if (o.drink) L.push({ t: o.drink.toUpperCase() + ' (water tub)', ok: c.gotDrink, mod: false, drink: true });
    return L;
  }

  function drawTicket(c, force) {
    const o = c.order, pct = clamp(c.patience / c.maxPatience, 0, 1), L = ticketLines(c);
    const key = L.map((l) => (l.ok ? 1 : l.bad ? 2 : 0) + (l.part || '')).join('') + Math.ceil(pct * 12) + (c.tag || '');
    if (!force && key === c.ticketKey) return; c.ticketKey = key;
    c.ticketT.redraw((g, w, h) => {
      g.fillStyle = '#ece4cc'; g.fillRect(0, 0, w, h);
      { const R = T.rng(o.num * 7 + 3); for (let i = 0; i < 5; i++) { const x = R() * w, y = R() * h, r = 14 + R() * 46, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,110,50,0.28)'); gr.addColorStop(1, 'rgba(150,110,50,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.strokeStyle = 'rgba(90,80,60,0.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, h * (0.3 + R() * 0.4)); g.lineTo(w, h * (0.3 + R() * 0.4)); g.stroke(); }
      g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 30px ${T.MONO}`; g.fillText(`#${String(o.num).padStart(2, '0')}  SEAT ${c.seat + 1}`, 14, 38);
      g.textAlign = 'right'; g.fillText(mon(o.price + (o.drink ? DRINKS[o.drink] : 0)), w - 14, 38); g.textAlign = 'left';
      g.fillRect(10, 50, w - 20, 3);
      g.fillStyle = '#a01c1c'; g.font = `bold 60px ${T.JP}`; g.fillText(o.recipe.name, 14, 112, w - 150);
      g.fillStyle = '#1b1b1b'; g.font = `bold 28px ${T.JP}`; g.textAlign = 'right'; g.fillText(o.recipe.jp, w - 14, 108); g.textAlign = 'left';
      let y = 162;
      for (const l of L) {
        const x = l.ind ? 46 : 14;
        g.lineWidth = 3; g.strokeStyle = '#1b1b1b'; if (!l.ban) g.strokeRect(x, y - 24, 26, 26);
        if (l.ok) { g.strokeStyle = '#1c8a3a'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 4, y - 12); g.lineTo(x + 11, y - 3); g.lineTo(x + 26, y - 26); g.stroke(); }
        if (l.bad) { g.strokeStyle = '#c8201c'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 3, y - 22); g.lineTo(x + 23, y); g.moveTo(x + 23, y - 22); g.lineTo(x + 3, y); g.stroke(); }
        g.fillStyle = l.ok ? '#8a8a84' : l.bad ? '#c8201c' : l.mod ? '#b0400a' : l.drink ? '#1c6a2a' : '#1b1b1b';
        g.font = `bold ${l.mod ? 30 : 28}px ${T.JP}`; g.fillText(l.t + (l.part ? `  (${l.part})` : ''), x + 38, y, w - x - 48);
        if (l.mod && !l.ok) { g.fillStyle = '#ffd9a0'; g.globalAlpha = 0.45; g.fillRect(x + 34, y - 27, w - x - 44, 34); g.globalAlpha = 1; }
        y += 39;
      }
      if (c.tag) { g.fillStyle = '#7a1612'; g.fillRect(12, h - 82, w - 24, 38); g.fillStyle = '#f4ead2'; g.textAlign = 'center'; g.font = `bold 26px ${T.MONO}`; g.fillText(c.tag, w / 2, h - 54, w - 40); g.textAlign = 'left'; }
      g.fillStyle = '#d8d2c0'; g.fillRect(12, h - 36, w - 24, 22);
      g.fillStyle = pct > 0.5 ? '#2aa84a' : pct > 0.25 ? '#e8a020' : '#c8201c'; g.fillRect(12, h - 36, (w - 24) * pct, 22);
    });
  }

  function spawn(seat, guest, opt) { opt = opt || {}; // guest: a tenant of THE MARKET who sat down at the cart there (live.js): a customer like any other, but a real person
    const due = guest || opt.ev || opt.stranger ? null : G.regs?.due(), nb = due ? G.block.take(due) : null, p = guest ? guest.p : nb ? nb.p : makePerson((Math.random() * 1e6) | 0), x = SEATS[seat], side = nb ? (p.root.position.x < x ? -1 : 1) : Math.random() < 0.5 ? -1 : 1; // most who sit down are the street's own people
    if (!nb && !guest) p.root.position.set(side * 14, 0, -2.35); G.peopleRoot.add(p.root);
    p.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; });
    if (nb) G.regs.came(nb);
    const c = { p, seat, side, state: 'walk', path: [new V3(x, 0, -2.3), new V3(x, 0, -1.55)], t: 0, order: null, maxPatience: 100, patience: 0, ev: opt.ev || null, pat: opt.pat || 1, hurry: !!opt.hurry, want: nb ? G.regs.order(nb) : opt.want, line: opt.line || null, tag: '', gotDrink: false, bowl: null, bottle: null, result: null, nb, guest: guest ? guest.id : null, name: guest ? guest.name : null };
    if (guest) delete c.want; c.maxPatience = c.patience = G.rush.patience(c, 0);
    game.seats[seat].c = c; game.customers.push(c);
    return c;
  }

  function evaluate(c, bowl) {
    const o = c.order, r = o.recipe, issues = []; let s = 100;
    if (!bowl.tare) { s -= 30; issues.push('No tare — bland!'); } else if (bowl.tare !== r.tare || bowl.mixed) { s -= 28; issues.push(`Wrong tare (wanted ${r.tare})`); }
    if (!bowl.broth) { s -= 40; issues.push('No broth?!'); }
    else { if (bowl.brothType !== r.broth) { s -= 28; issues.push(`Wrong broth (wanted ${r.broth})`); } if (bowl.broth < 1.6) { s -= 10; issues.push('Not enough broth'); } if (bowl.over) { s -= 5; issues.push('Overfilled'); } if (bowl.temp < 0.45) { s -= 15; issues.push('Lukewarm'); } }
    if (!bowl.noodles) { s -= 50; issues.push('No noodles!'); }
    else {
      const d = doneness(bowl.noodles.cook).key;
      if (d === 'raw') { s -= 32; issues.push('Noodles are raw'); } else if (d === 'over') { s -= 24; issues.push('Noodles are mush'); }
      else if (d === 'soft') { s -= 12; issues.push('Noodles too soft'); }
      else if (o.firm && d !== 'firm') { s -= 10; issues.push('Asked for firm noodles'); } else if (!o.firm && d === 'firm') { s -= 6; issues.push('Noodles a bit firm'); }
    }
    const have = {}; bowl.toppings.forEach((t) => (have[t] = (have[t] || 0) + 1));
    for (const [t, n] of Object.entries(o.tops)) { const m = n - (have[t] || 0); if (m > 0) { s -= 8 * m; issues.push(`Missing ${TOPPINGS[t].label.toLowerCase()}${m > 1 ? ' x' + m : ''}`); } }
    for (const [t, n] of Object.entries(have)) { const ex = n - (o.tops[t] || 0); if (ex > 0) { const banned = !(t in o.tops) && o.mods.some((m) => m === `NO ${TOPPINGS[t].label}`); s -= (banned ? 14 : 4) * ex; issues.push(banned ? `Said NO ${TOPPINGS[t].label.toLowerCase()}!` : `Extra ${TOPPINGS[t].label.toLowerCase()}`); } }
    const slow = G.rush.late(c); if (slow > 0) { s -= slow; issues.push(`${RT.slow} (-${slow})`); }
    s = clamp(s, 0, 100);
    const pf = c.patience / c.maxPatience, pays = s >= 35, half = pays && s < 50; if (half) issues.push(TEXT.refund);
    const tip = pays ? Math.round(o.price * 0.25 * clamp((s - 55) / 45, 0, 1) * clamp(pf * 1.6, 0.2, 1) * (G.regs ? G.regs.tip(c) : 1)) : 0;
    return { score: s, issues, pay: pays ? (half ? Math.ceil(o.price / 2) : o.price) : 0, tip, verdict: s >= 95 ? 'うまい! PERFECT' : s >= 80 ? 'Delicious' : s >= 60 ? 'Pretty good' : s >= 35 ? 'Hmm…' : 'Refused to pay' };
  }

  function serve(c, bowl) {
    bowl.served = true; c.bowl = bowl; c.result = evaluate(c, bowl); game.skill = Math.min(1, game.skill + (c.result.score >= 80 ? 0.07 : c.result.score >= 60 ? 0.03 : 0)); c.state = 'eating'; c.t = 0; c.p.pose = 'eat';
    c.ticket.removeFromParent(); G.audio.play('place');
    const r = c.result;
    G.fx.popup(new V3(SEATS[c.seat] + 0.2, 1.2, -0.6), [`${r.verdict}  ${'★'.repeat(Math.round(r.score / 20))}`, r.pay ? `${mon(r.pay)}${r.tip ? '  + tip ' + mon(r.tip) : ''}` : 'no payment', ...(r.issues.length ? r.issues : ['Exactly as ordered'])], r.score >= 60);
    if (r.score < 35) G.audio.play('bad');
    if (!r.pay) game.refused++; G.events?.served(c, r);
    G.talk?.event(c, 'taste', r); if (c.guest) G.live?.tell({ r: { to: c.guest, score: r.score, pay: r.pay, verdict: r.verdict, issues: r.issues.slice(0, 3) } });
  }

  function leave(c, angry) {
    c.state = 'leaving'; c.p.pose = 'walk'; const x = SEATS[c.seat];
    c.p.root.position.set(x, 0, -1.55);
    c.path = c.nb || c.guest ? [new V3(x, 0, -2.5)] : [new V3(x, 0, -2.3), new V3(c.side * -15, 0, -2.4)];
    if (c.ticket) c.ticket.removeFromParent();
    if (c.bottle) c.bottle.remove();
    game.seats[c.seat].c = null; G.events?.left(c, angry); if (angry) G.regs?.walked(c);
    if (c.guest) G.live?.tell({ gone: { to: c.guest, angry: !!angry } });
    if (angry) { G.talk?.event(c, 'angry'); game.lost++; game.scores.push(0); G.audio.play('bad'); G.fx.popup(new V3(x + 0.2, 1.2, -0.6), ['Left angry', 'Waited too long'], false); }
  }

  game.paid = (c) => leave(c, false);
  // what a waiting customer ordered that has run out tonight
  game.outFor = (c, a = C.avail()) => {
    const o = c.order, r = o && o.recipe; if (!o || c.state !== 'waiting') return null;
    const bowls = G.items.filter((b) => b.kind === 'bowl' && !b.dirty && !b.served && !b.dead), has = (f) => bowls.some(f), have = {}; for (const b of bowls) b.toppings.forEach((t) => (have[t] = (have[t] || 0) + 1)); // what is already in a bowl being built is not out
    const dish = (a.noodles < 1 && !has((b) => b.noodles)) || (a.broth[r.broth] < 1 && !has((b) => b.brothType === r.broth && b.broth > 0.5)) || (a.tare[r.tare] < 1 && !has((b) => b.tare === r.tare));
    const out = { dish, tops: Object.keys(o.tops).filter((t) => a.tops[t] < 1 && (have[t] || 0) < o.tops[t]), drink: o.drink && !c.gotDrink && a.drinks[o.drink] < 1 ? o.drink : null };
    return out.dish || out.tops.length || out.drink ? out : null; };
  // the cook tells them something has run out: a dish, and they order another or go; a topping or a drink, and they go without
  game.toldOut = (c, text) => {
    if (!/\b(out of|ran out|run out|no more|sold out|all out|none left|we'?re out|don'?t have|do not have)\b/i.test(text)) return '';
    const out = game.outFor(c); if (!out) return ''; const o = c.order, said = [];
    if (out.dish) {
      const a = C.avail(), alt = game.cfg().menu.filter((k) => k !== o.key && C.canMake(k, a));
      if (!alt.length) { setTimeout(() => { if (c.state === 'waiting') { game.lost++; leave(c, false); } }, 4000); return `The cook told you they are out of ${o.recipe.name.toLowerCase()} ramen and there is nothing else left tonight. You say it is all right and get up to go.`; }
      const k = pick(alt), drink = o.drink, num = o.num; c.order = makeOrder(k); c.order.drink = drink; c.order.num = num; game.ticketNo--;
      c.ticketKey = null; drawTicket(c, true); return `The cook told you they are out of ${o.recipe.name.toLowerCase()} ramen. You order ${RECIPES[k].name.toLowerCase()} ramen instead.`;
    }
    for (const t of out.tops) { delete o.tops[t]; o.mods.push(`NO ${TOPPINGS[t].label} (OUT)`); said.push(TOPPINGS[t].label.toLowerCase()); }
    if (out.drink) { said.push(out.drink); o.drink = null; }
    c.ticketKey = null; drawTicket(c, true);
    return `The cook told you they are out of ${said.join(' and ')}. You say that is fine, you will go without.`;
  };
  game.guest = (g) => { if (game.state !== 'open') return null; const free = (s) => s && !s.c && !s.dirty, i = free(game.seats[g.seat]) ? g.seat : game.seats.findIndex(free); const c = i < 0 ? null : spawn(i, g); if (c) C.stools[i].visible = true; return c; };   // (the stool they chose, if it is free)
  game.guestLeaves = (id) => { const c = game.customers.find((x) => x.guest === id && x.state !== 'leaving'); if (c) leave(c, false); };
  game.toggleOpen = () => {
    if (game.state === 'prep' || game.state === 'closed') {
      if (game.summary) { game.summary.removeFromParent(); game.summary = null; }
      game.state = 'open'; game.spawnT = 3; C.setOpen(true); K.start();
    } else if (game.state === 'open') { game.state = 'closing'; C.setOpen(false); }
    else if (game.state === 'closing' && game.serving()) { game.state = 'open'; C.setOpen(true); }
  };
  game.walk = (c) => { if (c.state !== 'leaving') leave(c, false); };   // up and gone, nothing paid (a night's event gone badly)
  let lastReact = -9;
  const seated = () => game.customers.filter((c) => c.state === 'waiting' || c.state === 'eating' || c.state === 'sitting');
  game.callOver = () => { if (game.state === 'open') game.spawnT = Math.min(game.spawnT, 1.5); };
  game.onWave = () => { G.events?.waved(); G.block?.waved?.(); G.talk?.seen('wave at the customers'); G.talk?.attend(5); const cs = seated(); if (!cs.length) return game.callOver(); cs.forEach((c) => { c.p.waveT = 1.9; }); const c = cs.find((x) => x.order) || null; if (c && G.t - lastReact > 6) { lastReact = G.t; G.talk?.event(c, 'wave'); } };
  // hurt or frightened at the counter (react.js): up and gone, nothing paid
  game.flee = (c) => { if (c.state === 'leaving') return; game.lost++; game.scores.push(0); if (c.state === 'walk') { c.state = 'leaving'; game.seats[c.seat].c = null; c.path = c.nb || c.guest ? [new V3(c.p.root.position.x, 0, -2.5)] : [new V3(c.side * -15, 0, -2.4)]; return; } leave(c, false); };
  game.onMess = (what) => { G.talk?.seen(what); G.talk?.attend(4); const c = seated().find((x) => x.order); if (c && G.t - lastReact > 9) { lastReact = G.t; G.talk?.event(c, 'react', what); } };
  game.rating = () => (game.scores.length ? game.scores.reduce((a, b) => a + b, 0) / game.scores.length / 20 : 0);
  game.serving = () => K.phase !== 'dawn';   // the village comes to eat by day and at dusk, late customers and the regulars through the night; at dawn the stall closes
  const freeSeat = () => game.seats.findIndex((s, i) => i < G.mods.seats && !s.c && !s.dirty);   // (a stool not yet bought is not sat on, except by a visitor from THE MARKET)
  game.forceSpawn = (opt) => { const i = freeSeat(); return i >= 0 ? spawn(i, null, opt) : null; };
  game.special = game.forceSpawn;   // (a night's event seats its own: events.js)

  function showSummary() {
    const t = T.canvasTex(768, 640, (g, w, h) => {
      g.fillStyle = 'rgba(246,241,226,0.97)'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1612'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = '#7a1612'; g.textAlign = 'center'; g.font = `bold 64px ${T.JP}`; g.fillText(`閉店  THE DAY'S SERVICE`, w / 2, 90, w - 40);
      g.fillStyle = '#1b1b1b'; g.font = `bold 44px ${T.MONO}`; g.textAlign = 'left';
      const inTill = till.total() - till.float, os = inTill - game.money - game.tips, a = C.avail(), left = [['noodles', a.noodles], ...Object.entries(a.tops).map(([k, n]) => [TOPPINGS[k].label.toLowerCase(), n]), ['sake', a.drinks.sake], ['tea', a.drinks.tea]].filter((x) => x[1] > 0).map((x) => `${x[1]} ${x[0]}`).join(', ');
      [['Bowls served', game.served], ['Walked out', game.lost], ['Sales rung up', mon(game.money)], ['Tips', mon(game.tips)], ['In the till', mon(inTill)], ['Till over / short', (os > 0 ? '+' : os < 0 ? '-' : '') + mon(Math.abs(os))], ['Rating', '★'.repeat(Math.round(game.rating())) + ` ${game.rating().toFixed(1)}`]].forEach(([k, v], i) => { g.fillText(k, 60, 168 + i * 50); g.textAlign = 'right'; g.fillText(String(v), w - 60, 168 + i * 50); g.textAlign = 'left'; });
      g.font = `bold 24px ${T.JP}`; g.fillStyle = '#5a4a3a'; g.fillText(`Left over: ${left || 'nothing'}`, 60, 510, w - 120);
      g.fillStyle = '#12406a'; g.textAlign = 'center'; g.font = `bold 36px ${T.JP}`; g.fillText('The lanterns burn down.', w / 2, h - 84, w - 40); g.fillText('Morning comes to the village.', w / 2, h - 40, w - 40);
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xdddddd })); s.position.set(0, 1.38, -0.5); s.rotation.x = -0.15; s.userData.nopick = true;
    scene.add(s); game.summary = s; G.audio.play('done');
  }

  const seatedN = () => { let n = 0; for (const c of game.customers) if (c.state !== 'leaving') n++; return n; }, waitingN = (but) => { let n = 0; for (const c of game.customers) if (c !== but && c.state === 'waiting') n++; return n; };
  const _d = new V3(), _eye = new V3();
  game.update = (dt, t) => {
    if (game.state === 'open' && !game.serving() && !game.customers.length) { game.state = 'closing'; C.setOpen(false); }
    if (game.state === 'open' && game.serving()) {
      game.spawnT -= dt;
      if (game.spawnT <= 0) {
        const i = freeSeat();
        if (i >= 0 && !game.soldOut && !G.events?.wait && seatedN() < G.rush.max()) { spawn(i, null, { hurry: G.rush.hurry() }); game.spawnT = G.rush.gap(); } else game.spawnT = 2;
      }
    }
    if (game.state === 'closing' && !game.customers.length) { game.state = 'closed'; showSummary(); }
    till.update(dt); game.stockT = (game.stockT || 0) - dt;
    if (game.stockT <= 0) { game.stockT = 1; const a = C.avail(); game.soldOut = !game.cfg().menu.some((k) => C.canMake(k, a)); C.menuDraw(); }

    game.seats.forEach((s, i) => { if (s.dirty && (s.dirty.dead || s.dirty.held || s.dirty.obj.position.distanceTo(C.seatSpots[i]) > 0.3)) s.dirty = null; });

    const eye = G.camera.getWorldPosition(_eye);
    for (const c of [...game.customers]) {
      const p = c.p; c.attn = Math.max(0, (c.attn || 0) - dt); p.look = c.attn > 0 || (c.voice && c.voice.busy) ? eye : c.state === 'waiting' || c.state === 'sitting' ? (Math.sin(t * 0.45 + c.seat * 2.1) > -0.5 ? eye : null) : null; p.update(dt, t);
      if (c.state === 'waiting' || c.state === 'eating') { c.chatT = (c.chatT ?? rand(14, 30)) - dt; if (c.chatT <= 0 && !(c.voice && c.voice.busy)) { c.chatT = K.phase === 'night' ? rand(25, 45) : rand(35, 70); G.talk?.event(c, 'chat'); } }
      if (c.state === 'walk' || c.state === 'leaving') {
        if (p.reeling?.()) continue; p.pose = 'walk'; const wp = c.path[0]; _d.copy(wp).sub(p.root.position); const d = _d.length();
        if (d < 0.06) { c.path.shift(); if (!c.path.length) { if (c.state === 'walk') { c.state = 'sitting'; c.t = 0; p.pose = 'sit'; p.root.position.set(SEATS[c.seat], 0, -1.2); } else { if (c.nb) G.block.give(c.nb); else if (c.guest) { p.pose = 'stand'; G.live?.stood(c.guest); } else p.root.removeFromParent(); game.customers.splice(game.customers.indexOf(c), 1); } } }
        else { _d.multiplyScalar(Math.min(d, 1.35 * dt) / d); p.root.position.add(_d); const ty = Math.atan2(_d.x, _d.z); let dy = ty - p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.root.rotation.y += dy * Math.min(1, dt * 8); }
      } else if (c.state === 'sitting') {
        p.root.rotation.y *= 1 - Math.min(1, dt * 8); c.t += dt;
        if (c.t > 1.6 && (!c.guest || c.want !== undefined || c.t > 40)) { // a tenant has a while to choose
          c.state = 'waiting'; c.order = makeOrder(c.want); c.usual = !!(c.nb && c.want && c.want.usual); c.maxPatience = c.patience = G.rush.patience(c, waitingN(c)); if (!c.tag) c.tag = c.hurry ? RT.hurry : G.regs?.known(c) ? TEXT.usual : ''; if (c.guest) G.live?.ordered(c);
          c.ticketT = T.panelTex(400, 620, () => { });
          c.ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.31), new THREE.MeshBasicMaterial({ map: c.ticketT, color: 0xc4c4c4, side: THREE.DoubleSide }));
          c.ticket.position.set(SEATS[c.seat], 1.825, -0.525); c.ticket.rotation.z = rand(-0.04, 0.04); c.ticket.userData.nopick = true; scene.add(c.ticket);
          drawTicket(c, true); c.drawT = 0; G.audio.play('bell'); if (!G.talk) G.audio.play('voice'); else if (c.line) c.line(c); else if (!G.regs?.orderLine(c)) G.talk.event(c, 'order');
        }
      } else if (c.state === 'waiting') {
        if (G.prog.P.tut || game.served + game.lost > 0) c.patience -= dt; // the first day's first bowl is off the clock
        c.drawT += dt; if (c.drawT > 0.35) { c.drawT = 0; drawTicket(c); }
        if (!c.nudged && c.patience < c.maxPatience * 0.4) { c.nudged = true; G.talk?.event(c, 'impatient'); }
        if (c.patience <= 0) leave(c, true);
      } else if (c.state === 'paying') till.tick(c, dt);
      else if (c.state === 'eating') {
        const bw = c.bowl, away = bw.dead || bw.held || bw.obj.position.distanceTo(C.seatSpots[c.seat]) > 0.32; // their bowl is theirs only while it is in front of them: take it and they stop, and say so
        if (away) { c.p.pose = 'sit'; c.gone = (c.gone || 0) + dt; if (!c.took) { c.took = true; c.p.gesture?.('no'); G.talk?.event(c, 'react', bw.dead ? 'smash their bowl while they were still eating' : 'take their bowl away while they were still eating'); }
          if (bw.dead || c.gone > 16) { if (bw.eaten > 0.6) { game.served++; if (K.phase === 'night') game.lateServed++; game.scores.push(Math.max(0, c.result.score - 30)); if (c.result.pay) till.pay(c, c.result.pay, 0); else leave(c, false); } else leave(c, true); }
          continue; }
        if (c.took) { c.took = false; c.gone = 0; c.p.pose = 'eat'; }
        c.t += dt; const dur = (c.dur ??= K.phase === 'night' ? 26 : 16); c.bowl.eaten = clamp(c.t / dur, 0, 1); c.bowl.refresh();
        if (Math.random() < dt * 0.5) G.audio.play('slurp');
        if (c.t >= dur) {
          const r = c.result; let pay = r.pay, tip = r.tip;
          if (c.order.drink) { if (c.gotDrink) pay += DRINKS[c.order.drink]; else { tip = Math.round(tip / 2); G.fx.popup(new V3(SEATS[c.seat] + 0.2, 1.2, -0.6), [`Never got the ${c.order.drink}…`, 'tip halved'], false); r.score = Math.max(0, r.score - 10); } }
          game.served++; if (K.phase === 'night') game.lateServed++; game.scores.push(r.score); G.regs?.served(c, r); G.events?.done(c); if (G.events) pay = G.events.pay(c, pay);
          if (G.regs?.friend(c)) { const j = freeSeat(); if (j >= 0) spawn(j, null, { stranger: true }); }   // one who likes the stall brings a friend along
          c.bowl.makeDirty(); game.seats[c.seat].dirty = c.bowl; if (pay) till.pay(c, pay, tip); else leave(c, false); // they pay in cash, laid on the ledge, and wait for their change
        }
      }
    }

    // LED register + hints
    let potsOff = 0; for (const q of C.pots) if (!q.on) potsOff++;
    game.hintT = (game.hintT || 0) - dt; if (game.hintT <= 0) { game.hintT = 0.5; const P = G.prog.P, f = G.money.fmt;
      G.hint = G.reportMsg ? G.reportMsg : G.talk && /login|blocked|cannot|no microphone/.test(G.talk.mic || '') && !potsOff && Math.floor(G.t / 4) % 2 ? 'VOICE: ' + G.talk.mic.toUpperCase() : game.state === 'prep' ? (potsOff ? `LIGHT ${potsOff} BRAZIER${potsOff > 1 ? 'S' : ''} (LEFT)` : 'HANG THE NOREN: OPEN (RIGHT POST)') : game.state === 'closed' ? (K.phase === 'dawn' ? 'DAWN' : 'THE DAY IS DONE') : game.state === 'closing' ? 'LAST ORDERS' : game.soldOut ? 'SOLD OUT: TAKE IN THE NOREN' : potsOff && C.pots.some((q) => !q.on && (!q.type || game.cfg().menu.some((k) => RECIPES[k].broth === q.type))) ? 'A BRAZIER HAS GONE OUT!' : G.events?.name() || G.rush.name() || `${TEXT.day} ${P.day}  ${f(G.prog.taken())} ${TEXT.of} ${f(G.prog.target())}  ${TEXT.fee} ${f(G.prog.fee() + P.debt)}`; }
    game.ledT -= dt;
    if (game.ledT <= 0) {
      game.ledT = 0.5;
      C.led.redraw((g, w, h) => { // the cook's slate on the right post, chalked: the hour, open or not, the day's takings, the hint
        g.fillStyle = '#1c1a16'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a4026'; g.lineWidth = 14; g.strokeRect(0, 0, w, h); g.fillStyle = '#e8e2d0'; g.textAlign = 'left';
        g.font = `bold 50px ${T.JP}`; g.fillText(`${K.phase === 'day' || K.phase === 'dusk' ? '' : '夜 '}HOUR OF THE ${K.eto()}`, 18, 66, w - 190);
        g.textAlign = 'right'; g.font = `bold 40px ${T.JP}`; g.fillStyle = C.open ? '#9ad890' : '#d89080'; g.fillText(C.open ? 'OPEN 営業' : 'CLOSED', w - 16, 66);
        g.textAlign = 'left'; g.fillStyle = '#f0d8a0'; g.font = `bold 54px ${T.JP}`; g.fillText(mon(till.total() - till.float), 18, 146);
        g.textAlign = 'right'; g.font = `bold 42px ${T.JP}`; g.fillText(game.scores.length ? `★${game.rating().toFixed(1)}` : K.phase.toUpperCase(), w - 16, 144);
        g.textAlign = 'left'; g.fillStyle = '#e8e2d0'; g.font = `bold 30px ${T.JP}`; g.fillText(G.hint, 18, 220, w - 30);
      });
    }
  };
  return game;
}
