// the till: a cart in 1985 takes cash only. Real bills and coins you pick up one by one, the cash register on the back counter and its drawer, and how a customer pays, waits for change, counts it and tips
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { G, V3, mat, pick, clamp } from './ctx.js';
import * as T from './tex.js';
import { Prop } from './items.js';
import { PH } from './physics.js';
import { SEATS } from './cart.js';

// what a cart could be paid with: notes of the 1985 designs, and the coins (sizes are the real ones, in metres)
export const MONEY = {
  b20: { v: 2000, bill: true, name: 'twenty-dollar bill' }, b10: { v: 1000, bill: true, name: 'ten-dollar bill' }, b5: { v: 500, bill: true, name: 'five-dollar bill' }, b1: { v: 100, bill: true, name: 'dollar bill' },
  c25: { v: 25, r: 0.01213, h: 0.00175, name: 'quarter', metal: 0xb8babe }, c10: { v: 10, r: 0.00896, h: 0.00135, name: 'dime', metal: 0xb8babe }, c1: { v: 1, r: 0.0095, h: 0.00152, name: 'penny', metal: 0xa8683a },
};
export const KINDS = Object.keys(MONEY);
export const usd = (c) => '$' + (Math.round(c) / 100).toFixed(2);
const words = (c) => (c % 100 ? usd(c) : `${c / 100} dollar${c === 100 ? '' : 's'}`);
// fewest pieces for an amount, from the kinds allowed
export function coins(amount, kinds = KINDS) { const out = []; let left = Math.round(amount); for (const k of kinds) while (left >= MONEY[k].v) { out.push(k); left -= MONEY[k].v; } return left ? null : out; }
const sum = (list) => list.reduce((s, it) => s + it.value, 0);

let PICS = null;
const pics = () => { if (PICS) return PICS; const L = new THREE.TextureLoader(), t = (f) => { const x = L.load('/sushi-assets/money/' + f + '.jpg'); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4; return x; }; PICS = {};
  for (const k of KINDS) { const d = MONEY[k]; if (d.bill) { const paper = mat({ color: 0xd8d6c4 }); PICS[k] = [paper, paper, mat({ map: t(k) }), mat({ map: t(k + 'b') }), paper, paper]; }
    else { const face = mat({ map: t(k) }); PICS[k] = [mat({ color: d.metal }), face, face]; } }
  return PICS; };

// one bill or coin: a weighted body like everything else at the cart
export class Cash extends Prop {
  constructor(k, x = 0, y = 0, z = 0, ry = 0) {
    const d = MONEY[k], g = new THREE.Group(), P = pics(); // drawn a hair above its body, which settles a little way into what it lies on
    const m = new THREE.Mesh(d.bill ? new THREE.BoxGeometry(0.156, 0.0012, 0.0663).translate(0, 0.0028, 0) : new THREE.CylinderGeometry(d.r, d.r, d.h, 20).translate(0, d.h / 2 + 0.0018, 0), P[k]); m.castShadow = false; m.receiveShadow = true; g.add(m);
    g.position.set(x, y, z); g.rotation.y = ry;
    super(g, { name: d.name, col: d.bill ? { t: 'box', hx: 0.078, hy: 0.001, hz: 0.033 } : { t: 'cyl', hh: Math.max(0.001, d.h / 2), r: d.r }, mass: d.bill ? 0.012 : 0.02, radius: d.bill ? 0.05 : 0.018, lift: 0.03 });
    this.kind = 'cash'; this.money = k; this.value = d.v; this.pick = true;
  }
  onLand() { if (!MONEY[this.money].bill) G.audio.play('clink'); }
  hint() { return `${this.name} (${usd(this.value)}) → the register's drawer, or by a customer as change`; }
}

export function buildTill(scene, C) {
  const till = { open: false, slots: {}, float: 0, last: '' };
  G.till = till; pics(); // the money's pictures asked for now, so the first bill laid down is not blank
  // the register: Poly Haven's CashRegister_01 (CC0), small, on the back counter behind the cook, its drawer toward you
  const S = 0.68, reg = new THREE.Group(); reg.position.set(0.2, 0.9, 1.68); reg.rotation.y = Math.PI; reg.scale.setScalar(S); C.group.add(reg);
  const loc = (x, y, z) => new V3(x, y, z).multiplyScalar(S).applyAxisAngle(new V3(0, 1, 0), Math.PI).add(reg.position);
  const OPEN = 0.1835; let drawer = null, dz = 0;
  till.regPos = loc(0.03, 0.42, 0.1);
  const btn = { getPos: () => till.regPos, r: 0.09, name: 'CASH REGISTER (open / close the drawer)', press: () => till.toggle() };
  G.buttons.push(btn);
  const disp = T.panelTex(256, 64, () => { }), dm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.045), new THREE.MeshBasicMaterial({ map: disp, color: 0xcccccc })); dm.position.set(-0.023, 0.588, -0.028); dm.userData.nopick = true; dm.userData.keep = true; reg.add(dm);
  new GLTFLoader().loadAsync('/sushi-assets/m/cashregister_01.glb').then((g) => {
    g.scene.traverse((o) => { if (o.isMesh) { const m = o.material; o.material = mat({ map: m.map, color: m.name && /glass/i.test(m.name) ? 0x8a8f90 : 0xb0aca4, transparent: !!(m.name && /glass/i.test(m.name)), opacity: m.name && /glass/i.test(m.name) ? 0.35 : 1 }); o.castShadow = true; o.receiveShadow = true; o.userData.button = btn; } if (/drawer/i.test(o.name)) drawer = o; });
    reg.add(g.scene); till.ready = true; if (drawer) { drawer.traverse((o) => { if (o.isMesh) o.userData.button = undefined; }); drawer.position.z = dz; fill(drawer); }
  }).catch(() => { });
  if (PH.ready) PH.box(0.2 - 0.075 * S, 0.9 + 0.17, 1.68 - 0.045 * S, 0.3 * S, 0.17, 0.215 * S); // solid to what is set down on it
  // the drawer: bills under their clips at the back, coins in the cups in front (the model's own layout)
  const SL = { b1: [-0.13, 0.085], b5: [-0.03, 0.085], b10: [0.07, 0.085], b20: [0.17, 0.085], c25: [-0.13, 0.18], c10: [-0.03, 0.18], c1: [0.07, 0.18] };
  const slotPos = (k) => loc(SL[k][0], 0.1, SL[k][1] + OPEN);
  till.slotPos = slotPos;
  for (const k of KINDS) {
    const pos = slotPos(k);
    G.sources.push({ pos, r: MONEY[k].bill ? 0.03 : 0.022, name: `${MONEY[k].name} from the drawer`, till: k, can: () => till.open && till.slots[k] > 0, take: () => { till.slots[k]--; G.audio.play(MONEY[k].bill ? 'grab' : 'clink'); return new Cash(k, pos.x, pos.y, pos.z, Math.PI / 2); } });
  }
  const drawerPos = loc(-0.03, 0.08, 0.1 + OPEN);
  till.drawerPos = drawerPos;
  G.targets.push({ getPos: () => drawerPos, r: 0.17, prio: 3, accepts: (it) => it.kind === 'cash' && till.open, receive: (it) => till.deposit(it) });
  // what is in the drawer, drawn as it is: a pile in each cup and under each clip (the notes' far ends run on under the register), one draw a kind
  const piles = {};
  const fill = (dr) => { const P = pics(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (const k of KINDS) { const d = MONEY[k], [x, z] = SL[k], geo = d.bill ? new THREE.BoxGeometry(0.156 / S, 0.0012 / S, 0.0663 / S) : new THREE.CylinderGeometry(d.r / S, d.r / S, d.h / S, 16), im = new THREE.InstancedMesh(geo, d.bill ? P[k][2] : P[k][1], 8);
      for (let i = 0; i < 8; i++) { e.set(0, d.bill ? Math.PI / 2 + (i % 3 - 1) * 0.03 : i * 1.7, 0); q.setFromEuler(e); m4.compose(new V3(x + (d.bill ? (i % 2) * 0.004 : Math.cos(i * 2.4) * 0.018), (d.bill ? 0.052 : 0.046) + i * (d.bill ? 0.0022 : 0.0014) / S, z + (d.bill ? -0.075 : Math.sin(i * 2.4) * 0.018)), q, new V3(1, 1, 1)); im.setMatrixAt(i, m4); }
      im.count = 0; im.castShadow = false; im.userData.nobake = true; dr.add(im); piles[k] = im; }
    till.show(); };
  till.total = () => KINDS.reduce((s, k) => s + till.slots[k] * MONEY[k].v, 0);
  till.reset = () => { Object.assign(till.slots, { b20: 0, b10: 1, b5: 3, b1: 10, c25: 12, c10: 10, c1: 15 }); till.float = till.total(); till.show(); }; // the night's float, as the bank gave it
  till.toggle = (on = !till.open) => { till.open = on; G.audio.play(on ? 'cash' : 'click'); if (on) G.talk?.seen?.('ring the register open'); till.show(); };
  till.show = (txt) => { for (const k in piles) piles[k].count = Math.min(8, till.slots[k] || 0); const s = txt || till.last || (till.open ? 'NO SALE' : ''); disp.redraw((g, w, h) => { g.fillStyle = '#121410'; g.fillRect(0, 0, w, h); g.fillStyle = '#f0e4b8'; g.font = `bold 40px ${T.MONO}`; g.textAlign = 'right'; g.fillText(s, w - 10, 46, w - 16); }); };
  till.deposit = (it) => {
    const k = it.money; it.remove(); till.slots[k]++; G.audio.play(MONEY[k].bill ? 'grab' : 'clink');
    const game = G.game, c = it.tenderOf;
    if (it.tipOf) game.tips += it.value;
    else if (c && c.pay && !c.pay.rung) { c.pay.rung = true; game.money += c.pay.due; if (c.pay.kept) game.tips += c.pay.kept; till.last = usd(c.pay.due); G.audio.play('cash'); }
    till.show();
  };
  till.reset();

  // ---- a customer pays: their money laid on the ledge beside their mat, the change counted back there
  const spot = (seat) => new V3(SEATS[seat] + 0.4, 1.0, seat === SEATS.length - 1 ? -0.57 : -0.64); // past their elbow, toward you: clear of their arms, the jars, the shakers and the far seat's newspaper
  till.spot = spot;
  const lay = (c, kinds, flag) => {
    const sp = spot(c.seat), out = []; let nb = 0, nc = 0;
    for (const k of kinds) {
      const bill = MONEY[k].bill, it = bill ? new Cash(k, sp.x + nb * 0.004, 1.003 + nb * 0.0016, sp.z + nb * 0.003, (Math.random() - 0.5) * 0.15) : new Cash(k, sp.x - 0.045 + (nc % 4) * 0.028, 1.003 + Math.floor(nc / 4) * 0.003, sp.z + (c.seat === SEATS.length - 1 ? -0.05 : 0.05)); // the coins in a row beside the notes
      bill ? nb++ : nc++; it[flag] = c; it.drop(); out.push(it);
    }
    return out;
  };
  // what is lying by a seat that the customer did not put there
  const given = (c) => { const sp = spot(c.seat); return G.items.filter((it) => it.kind === 'cash' && !it.dead && !it.held && !it.tenderOf && !it.tipOf && !it.backOf && Math.hypot(it.obj.position.x - sp.x, it.obj.position.z - sp.z) < 0.17 && it.obj.position.y > 0.95 && it.obj.position.y < 1.15); };
  for (let i = 0; i < SEATS.length; i++) G.targets.push({ getPos: () => spot(i), r: 0.2, prio: 3, accepts: (it) => it.kind === 'cash' && !!G.game.seats[i].c,
    receive: (it) => { const sp = spot(i), n = given(G.game.seats[i].c).length; it.obj.quaternion.setFromAxisAngle(new V3(0, 1, 0), (Math.random() - 0.5) * 0.3); it.obj.position.set(sp.x - 0.03 + (n % 4) * 0.02, 1.004 + n * 0.0018, sp.z + ((n % 3) - 1) * 0.008); it.tenderOf = it.tipOf = it.backOf = null; it.drop(); G.audio.play(MONEY[it.money].bill ? 'grab' : 'clink'); } });

  // how a customer hands it over: often the next note up, sometimes exact
  const tenderFor = (due, guest) => {
    if (guest) return coins(due, ['b20', 'b10', 'b5', 'b1']);
    const r = Math.random();
    if (r < 0.35) return coins(due, ['b20', 'b10', 'b5', 'b1', 'c25']);
    const up = [100, 500, 1000, 2000].find((v) => v >= due && (v > due || r < 0.5));
    if (up && !(r > 0.85 && due <= 1000)) return coins(up, ['b20', 'b10', 'b5', 'b1']);
    const notes = Math.ceil(due / 100) * 100; return coins(notes, ['b20', 'b10', 'b5', 'b1']);
  };
  till.pay = (c, due, tip, given) => {
    const guest = !!c.guest; if (guest) due = Math.max(1, Math.round(due / 100)) * 100;
    tip = guest ? 0 : Math.round(tip / 25) * 25;
    const kinds = given || tenderFor(due, guest), tender = kinds.reduce((s, k) => s + MONEY[k].v, 0);
    let owed = tender - due, kept = 0;
    if (owed > 0 && tip >= owed * 0.8 && owed <= 100) { kept = owed; owed = 0; tip = 0; } // keep the change
    c.state = 'paying'; c.p.pose = 'sit';
    c.pay = { due, tender, owed, tip, kept, kinds, items: [], phase: 'lay', t: 0, wait: 0, given: 0, settle: 0, rung: false, si: G.game.scores.length - 1 };
  };
  const facts = (c, extra) => { const P = c.pay; return `Your bill is ${usd(P.due)}. You paid with ${usd(P.tender)} in cash${P.kept ? `, and told the cook to keep the ${usd(P.kept)} change as a tip` : P.owed ? `, so you are owed ${usd(P.owed)} in change` : ', the exact amount'}. ${extra || ''}`; };
  const pocket = (list) => list.forEach((it) => it.remove());
  const finish = (c, how) => {
    const P = c.pay; P.phase = 'gone';
    if (P.tip > 0 && how !== 'short') { lay(c, coins(P.tip, ['b5', 'b1', 'c25']) || [], 'tipOf'); }
    if (how === 'short' || how === 'none') { const i = P.si; if (i >= 0) G.game.scores[i] = Math.max(0, G.game.scores[i] - 25); }
    G.game.paid(c);
  };
  till.tick = (c, dt) => {
    const P = c.pay; if (!P || P.phase === 'gone') return; P.t += dt;
    if (P.phase === 'lay') { if (P.t < 1.2) return; P.items = lay(c, P.kinds, 'tenderOf'); P.phase = P.owed > 0 ? 'change' : 'exact'; P.t = 0; G.talk?.event(c, 'pay', facts(c, P.owed ? `You lay ${words(P.tender)} on the counter and wait for your change.` : 'You lay it on the counter.')); return; }
    if (P.phase === 'exact') { if (P.t > 3.5) { G.talk?.event(c, 'thanks', facts(c, 'You are leaving now.')); finish(c); } return; }
    P.wait += dt;
    const list = given(c), g = sum(list);
    if (g !== P.given) { P.given = g; P.settle = 0; } else P.settle += dt;
    if (g > 0 && P.settle > (g === P.owed ? 1.2 : 3)) {
      if (g < P.owed) {
        if (!P.shorted) { P.shorted = true; P.settle = -8; c.p.gesture?.('no'); G.talk?.event(c, 'short', facts(c, `The cook laid only ${usd(g)} as your change. You are owed ${usd(P.owed)}, so you are ${usd(P.owed - g)} short. Say so.`)); }
        else if (P.settle > 10) { pocket(list); G.talk?.event(c, 'shorted', facts(c, `You only got ${usd(g)} of your ${usd(P.owed)} change and are leaving annoyed.`)); finish(c, 'short'); }
        return;
      }
      if (g === P.owed) { pocket(list); G.talk?.event(c, 'thanks', facts(c, `The cook gave you exactly the right change, ${usd(g)}.${P.tip ? ' You leave a tip on the counter.' : ''}`)); finish(c); return; }
      const extra = g - P.owed;
      pocket(list);
      if (Math.random() < 0.65) { lay(c, coins(extra) || [], 'backOf'); G.talk?.event(c, 'over', facts(c, `The cook gave you ${usd(g)} in change, ${usd(extra)} too much. You are honest: you give the extra back and say so.`)); }
      else G.talk?.event(c, 'thanks', facts(c, `The cook gave you ${usd(g)} in change, more than you were owed. You keep it and say nothing about it.`));
      finish(c); return;
    }
    if (!P.nudged && P.wait > 30) { P.nudged = true; G.talk?.event(c, 'waitchange', facts(c, `You have waited ${Math.round(P.wait)} seconds for your change and the cook has not given it.`)); }
    if (P.wait > 80) { pocket(list); G.talk?.event(c, 'shorted', facts(c, 'You never got your change and are leaving annoyed.')); finish(c, 'none'); }
  };
  // what the guide should point at for the money, if anything
  till.step = (held) => {
    const cs = G.game.customers.filter((c) => c.pay && (c.pay.phase === 'change' || c.pay.phase === 'exact'));
    const cash = held((x) => x.kind === 'cash');
    for (const c of cs) {
      const P = c.pay, seat = `Seat ${c.seat + 1}`, left = P.items.filter((it) => !it.dead && !it.held && it.obj.position.distanceTo(spot(c.seat)) < 0.25);
      if (cash && (cash.tenderOf === c || cash.tipOf)) return till.open ? ['Drop the money in the drawer', `Rings up ${usd(P.due)}`, drawerPos.clone().setY(drawerPos.y + 0.08)] : ['Ring the register open', 'Behind you, on the back counter', till.regPos];
      if (left.length && P.phase === 'change' && !P.rung) return ['Take the money', `${seat}: ${usd(P.tender)} for a ${usd(P.due)} bill`, left[0].obj.position.clone().setY(1.08)];
      if (P.phase !== 'change') continue;
      const need = P.owed - P.given;
      if (need <= 0) continue;
      if (cash && !cash.tenderOf && !cash.tipOf) return [`Lay the change by ${seat.toLowerCase()}`, `Change ${usd(P.owed)} · given ${usd(P.given)}`, spot(c.seat).clone().setY(1.08)];
      if (!till.open) return ['Ring the register open', `${seat} is owed ${usd(P.owed)} change`, till.regPos];
      const next = (coins(need) || [])[0]; if (next && till.slots[next] > 0) return [`Take a ${MONEY[next].name} from the drawer`, `Change ${usd(P.owed)} · given ${usd(P.given)}`, slotPos(next).clone().setY(slotPos(next).y + 0.06)];
    }
    if (cash) return till.open ? ['Drop the money in the drawer', 'Takings go in the till', drawerPos.clone().setY(drawerPos.y + 0.08)] : ['Ring the register open', 'Behind you, on the back counter', till.regPos];
    return null;
  };
  till.coins = coins;
  till.update = (dt) => { dz += clamp((till.open ? OPEN : 0) - dz, -dt * 0.9, dt * 0.9); if (drawer) drawer.position.z = dz; };
  till.loose = () => G.items.filter((it) => it.kind === 'cash' && !it.dead && !it.held && (it.tipOf || it.tenderOf || it.backOf) && !(it.tenderOf && G.game.customers.includes(it.tenderOf) && it.tenderOf.pay.phase !== 'gone'));
  return till;
}
