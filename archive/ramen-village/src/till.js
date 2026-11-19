// the coin box: a village stall in the 1860s takes coin. Copper and brass mon with their square holes, the oval hundred-mon piece and a few silver shu you pick up one by one, the wooden zeni-bako on the back counter and its lid, and how a customer pays, waits for change, counts it and tips
import * as THREE from 'three';
import { G, V3, mat, clamp } from './ctx.js';
import * as T from './tex.js';
import { Prop } from './items.js';
import { PH } from './physics.js';
import { SEATS } from './cart.js';

// what a stall could be paid with (sizes are the real ones, in metres): a shu of silver, the Tenpō hundred-mon piece, the brass four-mon with its waves, the copper one-mon
export const MONEY = {
  s1: { v: 250, w: 0.013, d: 0.021, h: 0.002, name: 'silver shu', metal: 0xd8d8d0, silver: true },
  t100: { v: 100, rx: 0.0245, rz: 0.016, h: 0.0026, name: 'hundred-mon piece', metal: 0x9a6a3a, jp: ['天', '寶', '通', '保'] },
  c4: { v: 4, r: 0.0138, h: 0.0016, name: 'four-mon coin', metal: 0xb89048, jp: ['寛', '寶', '永', '通'] },
  c1: { v: 1, r: 0.0122, h: 0.0013, name: 'one-mon coin', metal: 0x8a5a32, jp: ['寛', '寶', '永', '通'] },
};
export const KINDS = Object.keys(MONEY);
export const mon = (c) => Math.round(c) + ' mon';
const words = mon;
// fewest pieces for an amount, from the kinds allowed
export function coins(amount, kinds = KINDS) { const out = []; let left = Math.round(amount); for (const k of kinds) while (left >= MONEY[k].v) { out.push(k); left -= MONEY[k].v; } return left ? null : out; }
const sum = (list) => list.reduce((s, it) => s + it.value, 0);

// each piece's shape and its face, drawn once: a disc or oval with a square hole through it, or a little bar of silver
let GEO = null;
const looks = () => { if (GEO) return GEO; GEO = { hit: new THREE.CylinderGeometry(0.016, 0.016, 0.006, 8).translate(0, 0.003, 0), hitM: new THREE.MeshBasicMaterial({ visible: false }) };
  for (const k of KINDS) { const d = MONEY[k];
    if (d.silver) { const t = T.canvasTex(64, 96, (g, w, h) => { g.fillStyle = '#cfcfc6'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a7a72'; g.font = `bold 30px ${T.JP}`; g.textAlign = 'center'; g.fillText('一', w / 2, 34); g.fillText('朱', w / 2, 74); g.strokeStyle = '#8a8a80'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); });
      GEO[k] = { geo: new THREE.BoxGeometry(d.w, d.h, d.d).translate(0, d.h / 2 + 0.0018, 0), m: [mat({ color: d.metal }), mat({ color: d.metal }), mat({ map: t, color: 0xffffff }), mat({ map: t }), mat({ color: d.metal }), mat({ color: d.metal })] }; continue; }
    const rx = d.rx || d.r, rz = d.rz || d.r, hole = (d.rx ? 0.0042 : d.r * 0.3), s = new THREE.Shape(); s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0);
    const hp = new THREE.Path(); hp.moveTo(-hole, -hole); hp.lineTo(hole, -hole); hp.lineTo(hole, hole); hp.lineTo(-hole, hole); hp.closePath(); s.holes.push(hp);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d.h, bevelEnabled: false, curveSegments: 14 }); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.0018, 0);
    const uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * rx) + 0.5, -p.getZ(i) / (2 * rz) + 0.5);
    const face = T.canvasTex(128, 128, (g, w, h) => { const c = new THREE.Color(d.metal); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.45)'; g.font = `bold ${d.rx ? 26 : 30}px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const [a, b, c2, e] = d.jp, o = d.rx ? [0, 40] : [0, 36]; g.fillText(a, w / 2, h / 2 - o[1]); g.fillText(b, w / 2, h / 2 + o[1]); g.fillText(c2, w / 2 + (d.rx ? 30 : 36), h / 2); g.fillText(e, w / 2 - (d.rx ? 30 : 36), h / 2);
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, 7); g.stroke(); if (k === 'c4') { g.lineWidth = 2; for (let y = 20; y < h; y += 12) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * 0.2) * 3); g.stroke(); } } });
    GEO[k] = { geo, m: mat({ map: face }) }; }
  return GEO; };

// one coin or piece of silver: a weighted body like everything else at the cart
export class Cash extends Prop {
  constructor(k, x = 0, y = 0, z = 0, ry = 0) {
    const d = MONEY[k], g = new THREE.Group(), L = looks(); // drawn a hair above its body, which settles a little way into what it lies on
    const m = new THREE.Mesh(L[k].geo, L[k].m); m.castShadow = false; m.receiveShadow = true; g.add(m); g.add(new THREE.Mesh(L.hit, L.hitM)); // (a solid stand-in the hand finds, hole and all)
    g.position.set(x, y, z); g.rotation.y = ry;
    super(g, { name: d.name, col: d.silver ? { t: 'box', hx: d.w / 2, hy: Math.max(0.001, d.h / 2), hz: d.d / 2 } : d.rx ? { t: 'box', hx: d.rx * 0.9, hy: Math.max(0.001, d.h / 2), hz: d.rz * 0.9 } : { t: 'cyl', hh: Math.max(0.001, d.h / 2), r: d.r }, mass: d.silver ? 0.002 : d.rx ? 0.02 : 0.004, radius: 0.026, lift: 0.03, mat: 'coin' });
    this.kind = 'cash'; this.money = k; this.value = d.v; this.pick = true;
  }
  onLand() { G.audio.play('clink'); }
  hint() { return `${this.name} (${mon(this.value)}) → the coin box, or by a customer as change`; }
}

export function buildTill(scene, C) {
  const till = { open: false, slots: {}, float: 0, last: '' };
  G.till = till; looks();
  // the zeni-bako: a box of dark wood with iron corners on the back counter behind the cook, its lid hinged at the back, four trays inside
  const box = new THREE.Group(); box.position.set(0.2, 0.9, 1.68); box.rotation.y = Math.PI; C.group.add(box);
  const loc = (x, y, z) => new V3(x, y, z).applyAxisAngle(new V3(0, 1, 0), Math.PI).add(box.position);
  const W = 0.34, D = 0.22, H = 0.11, wood = T.surface(mat({ map: T.photo('wood_dark', () => T.woodTex('#3a2414', '#150c06', [1, 1], 5)), color: 0x8a7060 }), { grime: 0.3 }), iron = mat({ color: 0x1a1a1c }), inner = mat({ color: 0x2a1a10 });
  const part = (w, h, d, m, x, y, z, p = box) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); o.userData.keep = true; return o; };
  part(W, 0.012, D, inner, 0, 0.006, 0); part(W, H * 0.55, 0.012, wood, 0, H * 0.275, D / 2 - 0.006);   /* the front, toward the cook, low: the trays are reached over it */ part(W, H, 0.012, wood, 0, H / 2, -D / 2 + 0.006); part(0.012, H, D, wood, W / 2 - 0.006, H / 2, 0); part(0.012, H, D, wood, -W / 2 + 0.006, H / 2, 0);
  for (const x of [-W / 6, W / 6]) part(0.006, H * 0.8, D - 0.02, inner, x, H * 0.4, 0); part(W - 0.02, H * 0.8, 0.006, inner, 0, H * 0.4, 0);   // the trays' dividers
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) part(0.03, H + 0.004, 0.03, iron, x * (W / 2 - 0.01), H / 2, z * (D / 2 - 0.01));
  const lid = new THREE.Group(); lid.position.set(0, H, -D / 2); box.add(lid); part(W + 0.01, 0.016, D + 0.01, wood, 0, 0.008, D / 2, lid); part(0.08, 0.02, 0.02, iron, 0, 0.0, D + 0.004, lid);
  { const t = T.canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8c8a0'; g.font = `bold 64px ${T.JP}`; g.textAlign = 'center'; g.fillText('銭箱', w / 2, 72); }); const l = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: t, color: 0x9a9a9a })); l.position.set(0, H / 2, D / 2 + 0.001); l.userData.nopick = true; l.userData.keep = true; box.add(l); }
  till.regPos = loc(0, H + 0.05, 0);
  const btn = { getPos: () => till.regPos, r: 0.09, name: 'COIN BOX (lift / close the lid)', press: () => till.toggle() };
  G.buttons.push(btn); const outside = [...box.children, ...lid.children].filter((o) => o.isMesh && o.position.y !== 0.006 && !(o.geometry.parameters && o.geometry.parameters.width === 0.006) && o.material !== inner); outside.forEach((o) => { o.userData.button = btn; }); // the walls and the lid open it; what is inside is for the hand
  till.ready = true;
  if (PH.ready) PH.box(0.2, 0.9 + H / 2, 1.68, W / 2, H / 2, D / 2); // solid to what is set down on it
  // the trays: silver and the hundred-mon pieces at the back, the four-mon and one-mon in front (toward the cook)
  const SL = { s1: [-0.085, -0.05], t100: [0.085, -0.05], c4: [-0.085, 0.05], c1: [0.085, 0.05] };
  const slotPos = (k) => loc(SL[k][0], 0.03, SL[k][1]);
  till.slotPos = slotPos;
  const srcs = {}; // pointing at a pile takes from that pile, never from the next tray
  for (const k of KINDS) {
    const pos = slotPos(k);
    G.sources.push(srcs[k] = { pos, r: 0.035, name: `${MONEY[k].name} from the coin box`, till: k, can: () => till.open && till.slots[k] > 0, take: () => { till.slots[k]--; G.audio.play('clink'); return new Cash(k, pos.x, pos.y + 0.02, pos.z, Math.random() * 3); } });
  }
  const drawerPos = loc(0, 0.04, 0);
  till.drawerPos = drawerPos;
  G.targets.push({ getPos: () => drawerPos, r: 0.17, prio: 3, accepts: (it) => it.kind === 'cash' && till.open, receive: (it) => till.deposit(it) });
  // what is in the box, drawn as it is: a heap in each tray, one draw a kind
  const piles = {};
  { const L = looks(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (const k of KINDS) { const [x, z] = SL[k], im = new THREE.InstancedMesh(L[k].geo, L[k].m, 16);
      for (let i = 0; i < 16; i++) { e.set((i % 3 - 1) * 0.12, i * 1.7, (i % 2 - 0.5) * 0.15); q.setFromEuler(e); m4.compose(new V3(x + Math.cos(i * 2.4) * 0.03 * (i % 4) / 3, 0.012 + Math.floor(i / 4) * 0.0026, z + Math.sin(i * 2.4) * 0.022 * (i % 4) / 3), q, new V3(1, 1, 1)); im.setMatrixAt(i, m4); }
      im.count = 0; im.castShadow = false; im.userData.nobake = true; im.userData.keep = true; im.userData.source = srcs[k]; box.add(im); piles[k] = im; } }
  till.total = () => KINDS.reduce((s, k) => s + till.slots[k] * MONEY[k].v, 0);
  till.reset = () => { Object.assign(till.slots, { s1: 2, t100: 2, c4: 30, c1: 40 }); till.float = till.total(); till.show(); }; // the morning's float: what the stall keeps for change
  till.toggle = (on = !till.open) => { till.open = on; G.audio.play(on ? 'cash' : 'click'); if (on) G.talk?.seen?.('lift the lid of the coin box'); till.show(); };
  till.show = () => { for (const k in piles) piles[k].count = Math.min(16, till.slots[k] || 0); };
  till.deposit = (it) => {
    const k = it.money; it.remove(); till.slots[k]++; G.audio.play('clink');
    const game = G.game, c = it.tenderOf;
    if (it.tipOf) game.tips += it.value;
    else if (c && c.pay && !c.pay.rung) { c.pay.rung = true; game.money += c.pay.due; if (c.pay.kept) game.tips += c.pay.kept; till.last = mon(c.pay.due); G.audio.play('cash'); }
    till.show();
  };
  till.reset();

  // ---- a customer pays: their coins laid on the ledge beside their mat, the change counted back there
  const spot = (seat) => new V3(SEATS[seat] + 0.4, 1.0, seat === SEATS.length - 1 ? -0.57 : -0.64); // past their elbow, toward you: clear of their arms, the jars and the shakers
  till.spot = spot;
  const lay = (c, kinds, flag) => {
    const sp = spot(c.seat), out = []; let n = 0;
    for (const k of kinds) { const it = new Cash(k, sp.x - 0.05 + (n % 4) * 0.032, 1.003 + Math.floor(n / 4) * 0.003, sp.z + (c.seat === SEATS.length - 1 ? -0.04 : 0.04) * (Math.floor(n / 4) % 2 ? -1 : 1), Math.random() * 3); n++; it[flag] = c; it.drop(); out.push(it); }
    return out;
  };
  // what is lying by a seat that the customer did not put there
  const given = (c) => { const sp = spot(c.seat); return G.items.filter((it) => it.kind === 'cash' && !it.dead && !it.held && !it.tenderOf && !it.tipOf && !it.backOf && Math.hypot(it.obj.position.x - sp.x, it.obj.position.z - sp.z) < 0.17 && it.obj.position.y > 0.95 && it.obj.position.y < 1.15); };
  for (let i = 0; i < SEATS.length; i++) G.targets.push({ getPos: () => spot(i), r: 0.2, prio: 3, accepts: (it) => it.kind === 'cash' && !!G.game.seats[i].c,
    receive: (it) => { const sp = spot(i), n = given(G.game.seats[i].c).length; it.obj.quaternion.setFromAxisAngle(new V3(0, 1, 0), (Math.random() - 0.5) * 0.3); it.obj.position.set(sp.x - 0.03 + (n % 4) * 0.022, 1.004 + Math.floor(n / 4) * 0.0026, sp.z + ((n % 3) - 1) * 0.01); it.tenderOf = it.tipOf = it.backOf = null; it.drop(); G.audio.play('clink'); } });

  // how a customer hands it over: often the exact coins, sometimes a little over in four-mon pieces
  const tenderFor = (due, guest) => {
    if (guest) return coins(due, ['c4', 'c1']);
    const r = Math.random();
    if (r < 0.5) return coins(due, ['c4', 'c1']);
    return coins(Math.ceil(due / 4) * 4 + (r > 0.8 ? 4 : 0), ['c4']);
  };
  till.pay = (c, due, tip, given) => {
    const guest = !!c.guest; if (guest) due = Math.max(1, Math.round(due));
    tip = guest ? 0 : Math.round(tip);
    const kinds = given || tenderFor(due, guest), tender = kinds.reduce((s, k) => s + MONEY[k].v, 0);
    let owed = tender - due, kept = 0;
    if (owed > 0 && tip >= owed * 0.8 && owed <= 2) { kept = owed; owed = 0; tip = 0; } // keep the change
    c.state = 'paying'; c.p.pose = 'sit';
    c.pay = { due, tender, owed, tip, kept, kinds, items: [], phase: 'lay', t: 0, wait: 0, given: 0, settle: 0, rung: false, si: G.game.scores.length - 1 };
  };
  const facts = (c, extra) => { const P = c.pay; return `Your bill is ${mon(P.due)}. You paid with ${mon(P.tender)} in coin${P.kept ? `, and told the cook to keep the ${mon(P.kept)} change` : P.owed ? `, so you are owed ${mon(P.owed)} in change` : ', the exact amount'}. ${extra || ''}`; };
  const pocket = (list) => list.forEach((it) => it.remove());
  const finish = (c, how) => {
    const P = c.pay; P.phase = 'gone';
    if (P.tip > 0 && how !== 'short') { lay(c, coins(P.tip, ['c4', 'c1']) || [], 'tipOf'); }
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
        if (!P.shorted) { P.shorted = true; P.settle = -8; c.p.gesture?.('no'); G.talk?.event(c, 'short', facts(c, `The cook laid only ${mon(g)} as your change. You are owed ${mon(P.owed)}, so you are ${mon(P.owed - g)} short. Say so.`)); }
        else if (P.settle > 10) { pocket(list); G.talk?.event(c, 'shorted', facts(c, `You only got ${mon(g)} of your ${mon(P.owed)} change and are leaving annoyed.`)); finish(c, 'short'); }
        return;
      }
      if (g === P.owed) { pocket(list); G.talk?.event(c, 'thanks', facts(c, `The cook gave you exactly the right change, ${mon(g)}.${P.tip ? ' You leave a little extra on the counter.' : ''}`)); finish(c); return; }
      const extra = g - P.owed;
      pocket(list);
      if (Math.random() < 0.65) { lay(c, coins(extra) || [], 'backOf'); G.talk?.event(c, 'over', facts(c, `The cook gave you ${mon(g)} in change, ${mon(extra)} too much. You are honest: you give the extra back and say so.`)); }
      else G.talk?.event(c, 'thanks', facts(c, `The cook gave you ${mon(g)} in change, more than you were owed. You keep it and say nothing about it.`));
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
      if (cash && (cash.tenderOf === c || cash.tipOf)) return till.open ? ['Drop the coins in the box', `Takes ${mon(P.due)}`, drawerPos.clone().setY(drawerPos.y + 0.08)] : ['Lift the coin box lid', 'Behind you, on the back counter', till.regPos];
      if (left.length && P.phase === 'change' && !P.rung) return ['Take the coins', `${seat}: ${mon(P.tender)} for a ${mon(P.due)} bowl`, left[0].obj.position.clone().setY(1.08)];
      if (P.phase !== 'change') continue;
      const need = P.owed - P.given;
      if (need <= 0) continue;
      if (cash && !cash.tenderOf && !cash.tipOf) return [`Lay the change by ${seat.toLowerCase()}`, `Change ${mon(P.owed)} · given ${mon(P.given)}`, spot(c.seat).clone().setY(1.08)];
      if (!till.open) return ['Lift the coin box lid', `${seat} is owed ${mon(P.owed)} change`, till.regPos];
      const next = (coins(need) || [])[0]; if (next && till.slots[next] > 0) return [`Take a ${MONEY[next].name} from the box`, `Change ${mon(P.owed)} · given ${mon(P.given)}`, slotPos(next).clone().setY(slotPos(next).y + 0.06)];
    }
    if (cash) return till.open ? ['Drop the coins in the box', 'Takings go in the coin box', drawerPos.clone().setY(drawerPos.y + 0.08)] : ['Lift the coin box lid', 'Behind you, on the back counter', till.regPos];
    return null;
  };
  till.coins = coins;
  let la = 0;
  till.update = (dt) => { la += clamp((till.open ? 1 : 0) - la, -dt * 2.5, dt * 2.5); lid.rotation.x = -la * 1.9; };
  till.loose = () => G.items.filter((it) => it.kind === 'cash' && !it.dead && !it.held && (it.tipOf || it.tenderOf || it.backOf) && !(it.tenderOf && G.game.customers.includes(it.tenderOf) && it.tenderOf.pay.phase !== 'gone'));
  return till;
}
