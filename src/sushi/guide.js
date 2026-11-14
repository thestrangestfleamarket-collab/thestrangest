// GUIDE MODE: while it is on, a card says the next thing to do for the customer who has waited longest and an arrow hangs over the thing to touch, in the right order, the whole night
import * as THREE from 'three';
import { G, V3 } from './ctx.js';
import * as T from './tex.js';
import { TOPPINGS, TARE, BROTH } from './items.js';

export function buildGuide(scene, C) {
  const g = { on: true }, nop = (o) => { o.userData.nopick = true; return o; };
  const tex = T.panelTex(640, 300, () => { });
  const card = nop(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.216), new THREE.MeshBasicMaterial({ map: tex, color: 0xd0d0d0 }))); card.position.set(0.76, 1.42, -0.52); card.rotation.x = 0.08; scene.add(card);
  const am = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 1.6, 0.5), toneMapped: false, transparent: true, opacity: 0.9, depthTest: false });
  const arrow = nop(new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.075, 4), am)); arrow.rotation.x = Math.PI; arrow.renderOrder = 60; scene.add(arrow);
  const ring = nop(new THREE.Mesh(new THREE.RingGeometry(0.05, 0.062, 20).rotateX(-Math.PI / 2), am)); ring.renderOrder = 60; scene.add(ring);
  const bpos = new V3(0.78, 0.93, -0.07), bm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 12), new THREE.MeshBasicMaterial({ color: 0x30c060 })); bm.position.copy(bpos); C.group.add(bm);
  const lb = nop(new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.03), new THREE.MeshBasicMaterial({ map: T.labelTex(['GUIDE'], { w: 256, h: 70, fs: 44 }), color: 0xbbbbbb }))); lb.rotation.x = -Math.PI / 2; lb.position.set(0.78, 0.906, 0.0); C.group.add(lb);
  const btn = { getPos: () => bpos, r: 0.045, press: () => g.set(!g.on), name: 'GUIDE MODE' }; bm.userData.button = btn; G.buttons.push(btn);
  g.set = (on) => { g.on = on; bm.material.color.set(on ? 0x30c060 : 0x5a2020); G.audio.play('click'); last = null; };
  const held = (f) => { for (const h of G.hands) if (h.held && f(h.held)) return h.held; return null; };
  const stack = new V3(0.93, 1.16, -0.36), matP = new V3(-0.3, 1.02, -0.26), tub = new V3(0.935, 1.12, 0.91), box = new V3(-0.93, 1.05, -0.36);

  function step() {
    const game = G.game, off = C.pots.filter((p) => !p.on);
    if (off.length) return ['Turn a burner knob', `${off.length} to light — stove, on your left`, new V3(-0.67, 0.78, off[0].z)];
    if (game.state === 'prep' || game.state === 'closed') return ['Flip the OPEN switch', 'Right post, under the till', G.buttons.find((b) => b.name.startsWith('OPEN')).getPos().clone().add(new V3(0, 0.08, 0))];
    const c = game.customers.filter((x) => x.state === 'waiting').sort((a, b) => a.patience / a.maxPatience - b.patience / b.maxPatience)[0];
    if (!c) {
      const di = game.seats.findIndex((s) => s.dirty);
      if (di >= 0) { const b = game.seats[di].dirty; return b.held ? ['Drop it in the bus tub', 'Right wing, at the back', tub] : ['Clear the dirty bowl', `Seat ${di + 1}`, b.obj.position.clone().setY(1.14)]; }
      return [game.state === 'closing' ? 'Last orders are out' : 'Wait for a customer', game.customers.length ? 'Someone is on their way' : 'A quiet minute', null];
    }
    const o = c.order, r = o.recipe, head = `Seat ${c.seat + 1} · ${r.name}`; let bowl = null, bs = -1;
    for (const b of G.items) if (b.kind === 'bowl' && !b.dirty && !b.served) { const sc = (b.tare === r.tare ? 1 : 0) + (b.brothType === r.broth ? b.broth : 0) + (b.noodles ? 1 : 0) + b.toppings.length + 0.1; if (sc > bs) { bs = sc; bowl = b; } }
    if (!bowl) return ['Take a bowl', head + ' — stack, front right', stack];
    const bp = bowl.obj.position.clone(); bp.y += 0.17;
    if (bowl.held && bowl.empty) return ['Set the bowl on the mat', head, matP];
    const want = o.firm ? [9, 14] : [14, 23], bk = C.baskets.find((b) => b.noodles);
    if (!bowl.noodles && !bk) return held((x) => x.noodle) ? ['Drop the noodles in a basket', 'In the boiling pot, near left', C.baskets[0].point(C.baskets[0].cup, new V3()).setY(1.22)] : ['Start the noodles: take a portion', head + ' — wooden tray, front left', box];
    if (bowl.tare !== r.tare) { const l = G.items.find((i) => i.kind === 'ladle' && i.mode === 'tare' && i.type === r.tare); return l.held ? [`Tip the ${TARE[r.tare].label} tare over the bowl`, 'Roll your wrist', bp] : [`Take the ${TARE[r.tare].label} tare ladle`, 'Small crocks behind the mat', l.obj.position.clone().setY(l.obj.position.y + 0.08)]; }
    if (bowl.broth < 2 || bowl.brothType !== r.broth) { const l = C.brothLadles.find((x) => x.vessel.type === r.broth); if (!l.held) return [`Take the ${BROTH[r.broth].label} broth ladle`, 'Big pot on the stove', l.obj.position.clone().setY(l.obj.position.y + 0.08)]; return l.filled ? [`Pour ${BROTH[r.broth].label} broth  ${bowl.broth}/2`, 'Tip it over the bowl', bp] : ['Dip the ladle back in the pot', 'It refills', new V3(l.vessel.x, l.vessel.rimY + 0.14, l.vessel.z)]; }
    if (!bowl.noodles) { const k = bk.noodles.cook, i = C.baskets.indexOf(bk); if (k < want[0]) return [`Noodles cooking — wait for ${o.firm ? 'YELLOW' : 'GREEN'}`, `${Math.ceil(want[0] - k)} s · dial ${i + 1}`, new V3(-1.09, 1.48, -0.05 + i * 0.2)]; return bk.held ? ['Tip the noodles into the bowl', k > want[1] ? 'A little past its best' : 'Now', bp] : ['Lift the noodle basket', 'By its handle', bk.obj.position.clone().setY(bk.obj.position.y + 0.08)]; }
    const have = {}; bowl.toppings.forEach((t) => (have[t] = (have[t] || 0) + 1));
    for (const [t, n] of Object.entries(o.tops)) if ((have[t] || 0) < n) {
      const L = TOPPINGS[t].label, bin = C.bins[t], cnt = `${have[t] || 0}/${n}`;
      if (held((x) => x.topping === t)) return [`Drop the ${L} on the bowl`, cnt, bp];
      const loose = G.items.find((i) => i.kind === 'food' && i.topping === t && !i.held); if (loose) return [`Pick up the ${L}`, cnt, loose.obj.position.clone().setY(loose.obj.position.y + 0.1)];
      if (bin.stock > 0) return [`Take ${L} from its bin`, cnt, new V3(bin.x, 1.08, bin.z)];
      const ri = ['chashu', 'naruto', 'negi', 'egg'].indexOf(t); if (ri < 0) return [`Out of ${L}`, 'Serve without it', bp];
      const B = C.board; if (B.item && B.item.raw === t) return C.knife.held ? [`Chop the ${L}`, 'Bring the blade down on it', new V3(B.x - 0.05, 1.14, B.z)] : ['Pick up the knife', 'Right of the board', C.knife.obj.position.clone().setY(1.02)];
      return held((x) => x.raw === t) ? ['Set it on the cutting board', '', new V3(B.x, 1.08, B.z)] : [`Out of ${L}: take one to slice`, 'Trays on the right wing', new V3(0.925, 1.08, -0.02 + ri * 0.165)];
    }
    if (o.drink && !c.gotDrink) return held((x) => x.drink === o.drink) ? [`Set the ${o.drink} by seat ${c.seat + 1}`, '', C.seatSpots[c.seat].clone().setY(1.2)] : [`Take a ${o.drink} from the cooler`, 'Right wing, at the back', new V3(0.935, 1.28, 0.68 + (o.drink === 'beer' ? -0.055 : 0.055))];
    return bowl.held ? [`Serve seat ${c.seat + 1}`, 'Set it on their placemat', C.seatSpots[c.seat].clone().setY(1.2)] : ['Pick up the bowl and serve it', `Seat ${c.seat + 1}`, bp];
  }

  let last = null, acc = 0, cur = null;
  g.update = (dt, t) => {
    acc += dt; if (acc > 0.2) { acc = 0; try { cur = g.on ? step() : ['GUIDE MODE is off', 'Press the green button to turn it on', null]; } catch (e) { cur = null; } }
    const key = cur ? cur[0] + '|' + cur[1] : '';
    if (key !== last) { last = key; G.guideText = g.on && cur ? `${cur[0]} — ${cur[1]}` : '';
      tex.redraw((c2, w, h) => { c2.fillStyle = g.on ? '#10241a' : '#241010'; c2.fillRect(0, 0, w, h); c2.strokeStyle = g.on ? '#40e080' : '#a04040'; c2.lineWidth = 10; c2.strokeRect(5, 5, w - 10, h - 10);
        c2.fillStyle = g.on ? '#40e080' : '#e08080'; c2.font = `bold 34px ${T.MONO}`; c2.textAlign = 'left'; c2.fillText('GUIDE', 26, 52);
        if (!cur) return; c2.fillStyle = '#ffffff'; c2.font = `bold 50px ${T.JP}`; const words = cur[0].split(' '); let line = '', y = 124; for (const wd of words) { if (c2.measureText(line + wd).width > w - 52) { c2.fillText(line, 26, y); line = ''; y += 58; } line += wd + ' '; } c2.fillText(line, 26, y);
        c2.fillStyle = '#b8e8c8'; c2.font = `bold 34px ${T.JP}`; c2.fillText(cur[1], 26, Math.min(h - 28, y + 62), w - 52); }); }
    const p = g.on && cur ? cur[2] : null; arrow.visible = ring.visible = !!p;
    if (p) { arrow.position.set(p.x, p.y + 0.05 + Math.sin(t * 5) * 0.02, p.z); arrow.rotation.y = t * 2; ring.position.set(p.x, p.y - 0.04, p.z); const s = 1 + Math.sin(t * 5) * 0.15; ring.scale.set(s, 1, s); }
  };
  return g;
}
