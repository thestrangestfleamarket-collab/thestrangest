// the customers, their orders and tickets, how a bowl is judged, the night's clock and its nights
import * as THREE from 'three';
import { G, V3, rand, pick, clamp, lerp } from './ctx.js';
import * as T from './tex.js';
import { makePerson } from './avatars.js';
import { SEATS, RECIPES } from './cart.js';
import { TOPPINGS, TARE, BROTH, doneness } from './items.js';

const START = 21 * 60, END = 25 * 60, MIN_PER_SEC = 0.5;
// The menu grows one idea per night so nothing has to be explained up front.
const NIGHTS = [
  { menu: ['shoyu'], mods: false, drinks: false, max: 1, pat: 1.7, note: 'SHOYU ONLY - TAKE YOUR TIME', next: 'shio + miso ramen, and drinks' },
  { menu: ['shoyu', 'shio', 'miso'], mods: false, drinks: true, max: 2, pat: 1.35, note: '+ SHIO, MISO, DRINKS', next: 'tonkotsu broth and special requests' },
  { menu: ['shoyu', 'shio', 'miso', 'tonkotsu'], mods: true, drinks: true, max: 3, pat: 1.15, note: '+ TONKOTSU, SPECIAL REQUESTS', next: 'a busier counter' },
  { menu: ['shoyu', 'shio', 'miso', 'tonkotsu'], mods: true, drinks: true, max: 3, pat: 1.0, note: 'FULL MENU, FULL HOUSE', next: 'more of the same, faster' },
];
const yen = (n) => '¥' + Math.round(n).toLocaleString('en-US');

export function buildGame(scene) {
  const C = G.cart;
  const game = {
    state: 'prep', night: 1, clock: START, money: 0, tips: 0, served: 0, lost: 0, scores: [], customers: [], seats: SEATS.map(() => ({ c: null, dirty: null })),
    spawnT: 4, ticketNo: 1, ledT: 0, summary: null, paused: false,
  };
  game.cfg = () => NIGHTS[Math.min(game.night, NIGHTS.length) - 1];
  G.game = game;

  // seat drop targets
  SEATS.forEach((x, i) => {
    const spot = C.seatSpots[i];
    G.targets.push({
      getPos: () => spot, r: 0.21, prio: 2,
      accepts: (it) => { const c = game.seats[i].c; if (!c) return false; if (it.kind === 'bowl') return c.state === 'waiting' && !it.dirty && !it.empty; if (it.kind === 'drink') return (c.state === 'waiting' || c.state === 'eating') && c.order.drink && !c.gotDrink; return false; },
      receive: (it) => {
        const c = game.seats[i].c;
        if (it.kind === 'bowl') { it.obj.position.set(x, 1.0, -0.71); it.upright(); serve(c, it); }
        else { it.obj.position.set(x + 0.19, 1.0, -0.66); it.upright(); it.locked = true; c.bottle = it; if (it.drink === c.order.drink) c.gotDrink = true; else c.wrongDrink = true; G.audio.play('bottle'); drawTicket(c, true); }
      },
    });
  });

  function makeOrder() {
    const cfg = game.cfg(), key = pick(cfg.menu), r = RECIPES[key], tops = { ...r.tops }, mods = [];
    let price = r.price, firm = false, no = null;
    if (cfg.mods) {
      if (Math.random() < 0.25) { firm = true; mods.push('NOODLES: FIRM (katame)'); }
      if (Math.random() < 0.2) { no = pick(Object.keys(tops).filter((k) => k !== 'chashu')); delete tops[no]; mods.push(`NO ${TOPPINGS[no].label}`); }
      if (Math.random() < 0.16) { tops.chashu = 3; price += 100; mods.push('+ EXTRA CHASHU (x3)'); }
      else if (Math.random() < 0.12) { tops.egg = (tops.egg || 0) + 1; price += 80; mods.push(`+ EXTRA EGG (x${tops.egg})`); }
    }
    const d = Math.random(); const drink = !cfg.drinks ? null : d < 0.24 ? 'beer' : d < 0.36 ? 'cola' : null;
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
    L.push({ t: `BROTH ${BROTH[r.broth].label} x2`, ok: !!b && b.brothType === r.broth && b.broth >= 2, bad: !!b && !!b.broth && b.brothType !== r.broth, part: b && b.brothType === r.broth && b.broth === 1 ? '1/2' : '' });
    const dn = b && b.noodles ? doneness(b.noodles.cook).key : null, want = o.firm ? 'firm' : 'regular';
    L.push({ t: o.firm ? 'NOODLES FIRM (yellow)' : 'NOODLES (green zone)', ok: dn === want, bad: !!dn && dn !== want, mod: o.firm });
    for (const [t, n] of Object.entries(o.tops)) L.push({ t: `${TOPPINGS[t].label}${n > 1 ? ' x' + n : ''}`, ok: (have[t] || 0) >= n, part: have[t] && have[t] < n ? `${have[t]}/${n}` : '', bad: (have[t] || 0) > n, mod: n !== (r.tops[t] || 0), ind: true });
    if (o.no) L.push({ t: `NO ${TOPPINGS[o.no].label}`, ok: false, bad: !!have[o.no], mod: true, ind: true, ban: true });
    if (o.drink) L.push({ t: o.drink.toUpperCase() + ' (cooler)', ok: c.gotDrink, mod: false, drink: true });
    return L;
  }

  function drawTicket(c, force) {
    const o = c.order, pct = clamp(c.patience / c.maxPatience, 0, 1), L = ticketLines(c);
    const key = L.map((l) => (l.ok ? 1 : l.bad ? 2 : 0) + (l.part || '')).join('') + Math.ceil(pct * 12);
    if (!force && key === c.ticketKey) return; c.ticketKey = key;
    c.ticketT.redraw((g, w, h) => {
      g.fillStyle = '#ece4cc'; g.fillRect(0, 0, w, h);
      { const R = T.rng(o.num * 7 + 3); for (let i = 0; i < 5; i++) { const x = R() * w, y = R() * h, r = 14 + R() * 46, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,110,50,0.28)'); gr.addColorStop(1, 'rgba(150,110,50,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.strokeStyle = 'rgba(90,80,60,0.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, h * (0.3 + R() * 0.4)); g.lineTo(w, h * (0.3 + R() * 0.4)); g.stroke(); }
      g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 30px ${T.MONO}`; g.fillText(`#${String(o.num).padStart(2, '0')}  SEAT ${c.seat + 1}`, 14, 38);
      g.textAlign = 'right'; g.fillText(yen(o.price + (o.drink ? (o.drink === 'beer' ? 300 : 120) : 0)), w - 14, 38); g.textAlign = 'left';
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
      g.fillStyle = '#d8d2c0'; g.fillRect(12, h - 36, w - 24, 22);
      g.fillStyle = pct > 0.5 ? '#2aa84a' : pct > 0.25 ? '#e8a020' : '#c8201c'; g.fillRect(12, h - 36, (w - 24) * pct, 22);
    });
  }

  function spawn(seat) {
    const p = makePerson((Math.random() * 1e6) | 0), side = Math.random() < 0.5 ? -1 : 1, x = SEATS[seat];
    p.root.position.set(side * 14, 0, -2.35); G.peopleRoot.add(p.root);
    p.root.traverse((o) => { o.userData.nopick = true; });
    const prog = clamp((game.clock - START) / (END - START), 0, 1);
    const c = { p, seat, side, state: 'walk', path: [new V3(x, 0, -2.3), new V3(x, 0, -1.55)], t: 0, order: null, maxPatience: (lerp(170, 125, prog) + rand(0, 35)) * game.cfg().pat, patience: 0, gotDrink: false, bowl: null, bottle: null, result: null };
    c.patience = c.maxPatience;
    game.seats[seat].c = c; game.customers.push(c);
    return c;
  }

  function evaluate(c, bowl) {
    const o = c.order, r = o.recipe, issues = []; let s = 100;
    if (!bowl.tare) { s -= 30; issues.push('No tare — bland!'); } else if (bowl.tare !== r.tare || bowl.mixed) { s -= 28; issues.push(`Wrong tare (wanted ${r.tare})`); }
    if (!bowl.broth) { s -= 40; issues.push('No broth?!'); }
    else { if (bowl.brothType !== r.broth) { s -= 28; issues.push(`Wrong broth (wanted ${r.broth})`); } if (bowl.broth < 2) { s -= 10; issues.push('Not enough broth'); } if (bowl.over) { s -= 5; issues.push('Overfilled'); } if (bowl.temp < 0.45) { s -= 15; issues.push('Lukewarm'); } }
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
    s = clamp(s, 0, 100);
    const pf = c.patience / c.maxPatience, pays = s >= 35;
    const tip = pays ? Math.round((o.price * 0.35 * clamp((s - 55) / 45, 0, 1) * clamp(pf * 1.6, 0.2, 1)) / 10) * 10 : 0;
    return { score: s, issues, pay: pays ? o.price : 0, tip, verdict: s >= 95 ? 'うまい! PERFECT' : s >= 80 ? 'Delicious' : s >= 60 ? 'Pretty good' : s >= 35 ? 'Hmm…' : 'Refused to pay' };
  }

  function serve(c, bowl) {
    bowl.locked = true; bowl.served = true; c.bowl = bowl; c.result = evaluate(c, bowl); c.state = 'eating'; c.t = 0; c.p.pose = 'eat';
    c.ticket.removeFromParent(); G.audio.play('place');
    const r = c.result;
    G.fx.popup(new V3(SEATS[c.seat], 1.42, -0.56), [`${r.verdict}  ${'★'.repeat(Math.round(r.score / 20))}`, r.pay ? `${yen(r.pay)}${r.tip ? '  + tip ' + yen(r.tip) : ''}` : 'no payment', ...(r.issues.length ? r.issues : ['Exactly as ordered'])], r.score >= 60);
    if (r.score < 35) G.audio.play('bad');
    G.talk?.event(c, 'taste', r);
  }

  function leave(c, angry) {
    c.state = 'leaving'; c.p.pose = 'walk'; const x = SEATS[c.seat];
    c.p.root.position.set(x, 0, -1.55);
    c.path = [new V3(x, 0, -2.3), new V3(c.side * -15, 0, -2.4)];
    if (c.ticket) c.ticket.removeFromParent();
    if (c.bottle) c.bottle.remove();
    game.seats[c.seat].c = null;
    if (angry) { G.talk?.event(c, 'angry'); game.lost++; game.scores.push(0); G.audio.play('bad'); G.fx.popup(new V3(x, 1.42, -0.56), ['Left angry', 'Waited too long'], false); }
  }

  game.toggleOpen = () => {
    if (game.state === 'prep' || game.state === 'closed') {
      if (game.state === 'closed') { game.night++; game.clock = START; game.money = game.tips = game.served = game.lost = 0; game.scores = []; }
      if (game.summary) { game.summary.removeFromParent(); game.summary = null; }
      game.state = 'open'; game.spawnT = 3; C.setOpen(true);
    } else if (game.state === 'open') { game.state = 'closing'; C.setOpen(false); }
    else if (game.state === 'closing' && game.clock < END) { game.state = 'open'; C.setOpen(true); }
  };
  game.rating = () => (game.scores.length ? game.scores.reduce((a, b) => a + b, 0) / game.scores.length / 20 : 0);
  game.forceSpawn = () => { const i = game.seats.findIndex((s) => !s.c && !s.dirty); return i >= 0 ? spawn(i) : null; };

  function showSummary() {
    const t = T.canvasTex(768, 640, (g, w, h) => {
      g.fillStyle = 'rgba(246,241,226,0.97)'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1612'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = '#7a1612'; g.textAlign = 'center'; g.font = `bold 64px ${T.JP}`; g.fillText(`閉店  NIGHT ${game.night} CLOSED`, w / 2, 90, w - 40);
      g.fillStyle = '#1b1b1b'; g.font = `bold 44px ${T.MONO}`; g.textAlign = 'left';
      [['Bowls served', game.served], ['Walked out', game.lost], ['Sales', yen(game.money)], ['Tips', yen(game.tips)], ['TOTAL', yen(game.money + game.tips)], ['Rating', '★'.repeat(Math.round(game.rating())) + ` ${game.rating().toFixed(1)}`]].forEach(([k, v], i) => { g.fillText(k, 60, 190 + i * 62); g.textAlign = 'right'; g.fillText(String(v), w - 60, 190 + i * 62); g.textAlign = 'left'; });
      g.fillStyle = '#12406a'; g.textAlign = 'center'; g.font = `bold 36px ${T.JP}`; g.fillText(`Tomorrow adds: ${game.cfg().next}`, w / 2, h - 84, w - 40); g.fillText('Flip the OPEN switch to start the next night', w / 2, h - 40, w - 40);
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xdddddd })); s.position.set(0, 1.38, -0.5); s.rotation.x = -0.15; s.userData.nopick = true;
    scene.add(s); game.summary = s; G.audio.play('done');
  }

  const _d = new V3();
  game.update = (dt, t) => {
    if ((game.state === 'open' || game.state === 'closing') && !(game.night === 1 && game.served + game.lost === 0 && game.state === 'open')) game.clock += dt * MIN_PER_SEC;
    if (game.state === 'open' && game.clock >= END) { game.state = 'closing'; C.setOpen(false); }
    if (game.state === 'open') {
      game.spawnT -= dt;
      if (game.spawnT <= 0) {
        const free = game.seats.map((s, i) => (!s.c && !s.dirty ? i : -1)).filter((i) => i >= 0);
        const prog = clamp((game.clock - START) / (END - START), 0, 1);
        if (free.length && game.customers.filter((c) => c.state !== 'leaving').length < game.cfg().max) { spawn(pick(free)); game.spawnT = lerp(26, 13, prog) + rand(0, 10); } else game.spawnT = 3;
      }
    }
    if (game.state === 'closing' && !game.customers.length) { game.state = 'closed'; showSummary(); }

    game.seats.forEach((s, i) => { if (s.dirty && (s.dirty.dead || s.dirty.held || s.dirty.obj.position.distanceTo(C.seatSpots[i]) > 0.3)) s.dirty = null; });

    for (const c of [...game.customers]) {
      const p = c.p; p.update(dt, t);
      if (c.state === 'walk' || c.state === 'leaving') {
        p.pose = 'walk'; const wp = c.path[0]; _d.copy(wp).sub(p.root.position); const d = _d.length();
        if (d < 0.06) { c.path.shift(); if (!c.path.length) { if (c.state === 'walk') { c.state = 'sitting'; c.t = 0; p.pose = 'sit'; p.root.position.set(SEATS[c.seat], 0, -1.2); } else { p.root.removeFromParent(); game.customers.splice(game.customers.indexOf(c), 1); } } }
        else { _d.multiplyScalar(Math.min(d, 1.35 * dt) / d); p.root.position.add(_d); const ty = Math.atan2(_d.x, _d.z); let dy = ty - p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.root.rotation.y += dy * Math.min(1, dt * 8); }
      } else if (c.state === 'sitting') {
        p.root.rotation.y *= 1 - Math.min(1, dt * 8); c.t += dt;
        if (c.t > 1.6) {
          c.state = 'waiting'; c.order = makeOrder();
          c.ticketT = T.panelTex(400, 620, () => { });
          c.ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.31), new THREE.MeshBasicMaterial({ map: c.ticketT, color: 0xc4c4c4, side: THREE.DoubleSide }));
          c.ticket.position.set(SEATS[c.seat] - 0.34, 1.575, -0.525); c.ticket.rotation.z = rand(-0.04, 0.04); c.ticket.userData.nopick = true; scene.add(c.ticket);
          drawTicket(c, true); c.drawT = 0; G.audio.play('bell'); G.talk ? G.talk.event(c, 'order') : G.audio.play('voice');
        }
      } else if (c.state === 'waiting') {
        if (!(game.night === 1 && game.served + game.lost === 0)) c.patience -= dt; // the very first bowl is off the clock
        c.drawT += dt; if (c.drawT > 0.35) { c.drawT = 0; drawTicket(c); }
        if (!c.nudged && c.patience < c.maxPatience * 0.4) { c.nudged = true; G.talk?.event(c, 'impatient'); }
        if (c.patience <= 0) leave(c, true);
      } else if (c.state === 'eating') {
        c.t += dt; const dur = 16; c.bowl.eaten = clamp(c.t / dur, 0, 1); c.bowl.refresh();
        if (Math.random() < dt * 0.5) G.audio.play('slurp');
        if (c.t >= dur) {
          const r = c.result; let pay = r.pay, tip = r.tip;
          if (c.order.drink) { if (c.gotDrink) pay += c.order.drink === 'beer' ? 300 : 120; else { tip = Math.round(tip / 2); G.fx.popup(new V3(SEATS[c.seat], 1.42, -0.56), [`Never got the ${c.order.drink}…`, 'tip halved'], false); r.score = Math.max(0, r.score - 10); } }
          game.money += pay; game.tips += tip; game.served++; game.scores.push(r.score); if (pay) G.audio.play('cash');
          c.bowl.makeDirty(); game.seats[c.seat].dirty = c.bowl; leave(c, false);
        }
      }
    }

    // LED register + hints
    const potsOff = C.pots.filter((p) => !p.on).length;
    G.hint = game.state === 'prep' ? (potsOff ? `TURN ON ${potsOff} BURNER KNOB${potsOff > 1 ? 'S' : ''} (LEFT)` : 'FLIP THE OPEN SWITCH (BELOW)') : game.state === 'closed' ? 'FLIP SWITCH: NEXT NIGHT' : game.state === 'closing' ? 'LAST ORDERS' : potsOff ? 'A BURNER IS OFF!' : game.served + game.lost === 0 ? `NIGHT ${game.night}: ${game.cfg().note}` : `SERVED ${game.served}  LOST ${game.lost}`;
    game.ledT -= dt;
    if (game.ledT <= 0) {
      game.ledT = 0.5;
      const m = Math.floor(game.clock) % (24 * 60), hh = Math.floor(m / 60), h12 = ((hh + 11) % 12) + 1, mm = String(m % 60).padStart(2, '0');
      C.led.redraw((g, w, h) => {
        g.fillStyle = '#0a0202'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff2a10'; g.shadowBlur = 14; g.fillStyle = '#ff3a1c'; g.textAlign = 'left';
        g.font = `bold 74px ${T.MONO}`; g.fillText(`${h12}:${mm}${hh >= 12 && hh < 24 ? 'PM' : 'AM'}`, 18, 78);
        g.textAlign = 'right'; g.font = `bold 40px ${T.MONO}`; g.fillStyle = C.open ? '#3aff6a' : '#ff3a1c'; g.shadowColor = g.fillStyle; g.fillText(C.open ? 'OPEN' : 'CLOSED', w - 16, 70);
        g.textAlign = 'left'; g.fillStyle = '#ffb020'; g.shadowColor = '#ffb020'; g.font = `bold 58px ${T.MONO}`; g.fillText(yen(game.money + game.tips), 18, 150);
        g.textAlign = 'right'; g.font = `bold 44px ${T.MONO}`; g.fillText(game.scores.length ? `★${game.rating().toFixed(1)}` : `NIGHT ${game.night}`, w - 16, 148);
        g.textAlign = 'left'; g.fillStyle = '#ffe9a8'; g.shadowColor = '#ffe9a8'; g.shadowBlur = 8; g.font = `bold 30px ${T.MONO}`; g.fillText(G.hint, 18, 220, w - 30);
      });
    }
  };
  return game;
}
