// THE TURNED: the village's own people (pf.js), greyed and wounded, on a stagger walk; drawn by what they hear (the night's sounds and how loud) and by sight of the living close by, lost in the dark; a lunge up close, a grab and a bite; the bitten turn after a while (a villager, one hiding at the cart), the cook dies of it; their bodies take every blow on their limbs (limbs.js): the head stops them, the legs slow them, an arm cut off cannot grab
import * as THREE from 'three';
import { G, V3, clamp, rand, pick } from './ctx.js';
import { makePerson } from './avatars.js';

// the cart in its own metres: what they walk round, the sides they come at it from, how far a reach goes
export const CART = { x0: -1.22, x1: 1.22, z0: -0.66, z1: 1.86 }, REACH = 1.05, INREACH = 0.72;
const ROUND = 0.3; // how far round the cart's corners they keep
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3();
let INF = null; // one material for every turned body: their own colours, drained grey-green
const infMat = (m) => { if (INF) return INF; INF = m.clone(); INF.onBeforeCompile = (s) => { s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11))), 0.72) * vec3(0.78, 0.86, 0.78);'); }; INF.customProgramCacheKey = () => 'turned'; return INF; };
const inCart = (x, z, m = 0) => x > CART.x0 - m && x < CART.x1 + m && z > CART.z0 - m && z < CART.z1 + m;
// a way to a point that keeps off the cart: round its nearest corners
function route(from, to) {
  const m = ROUND, X0 = CART.x0 - m, X1 = CART.x1 + m, Z0 = CART.z0 - m, Z1 = CART.z1 + m, out = [];
  const hits = (a, b) => { for (let k = 1; k < 12; k++) { const t = k / 12, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t; if (inCart(x, z, 0.12)) return true; } return false; };
  if (!hits(from, to)) return [to.clone()];
  const corners = [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]].map(([x, z]) => new V3(x, 0, z)), near = (p) => corners.map((c, i) => [c.distanceTo(p), i]).sort((a, b) => a[0] - b[0]);
  const a = near(from)[0][1], b = near(to)[0][1]; out.push(corners[a]); if (a !== b) { if ((b - a + 4) % 4 === 2) { const c1 = corners[(a + 1) % 4], c3 = corners[(a + 3) % 4]; out.push(c1.distanceTo(to) < c3.distanceTo(to) ? c1 : c3); } out.push(corners[b]); } out.push(to.clone()); return out;
}
export function buildInfected() {
  const I = { list: [], kills: 0, seq: 0, bites: 0, mind: null };
  const O = () => G.outbreak;
  // someone turns: wounds, the grey, the walk; rise: seconds lying before they get up wrong
  I.turn = (p, o = {}) => {
    if (!p || p.turned) return null; p.turned = true; if (p.mesh && p.mesh.material) p.mesh.material = infMat(p.mesh.material);
    if (!p.root.parent) (G.peopleRoot || G.scene).add(p.root); if (o.at) p.root.position.copy(o.at); p.pose = 'stand'; p.look = null; p.talkT = 0; p.root.traverse((x) => { x.userData.nopick = true; });
    p.root.updateMatrixWorld(true); for (const k of [0.25, 0.55, 0.9]) { const b = pick(p.bones || []); if (b && G.gore) G.gore.wound(p, b.getWorldPosition(new V3()).add(new V3(rand(-0.05, 0.05), rand(-0.05, 0.05), 0.08)), 0.03 + k * 0.02); }
    const z = { id: ++I.seq, p, style: p.style || '', st: o.rise != null ? 'rise' : 'walk', t: 0, riseAt: o.rise ?? 0, hp: 100, head: 40, legs: 1, arm: { L: 1, R: 1 }, prey: null, side: null, inside: false, lunge: 0, cool: 0, wait: 0, heard: null, groan: rand(2, 7), wob: rand(6), think: 0, path: null, goal: new V3(), from: o.from || 'street', hands: { L: new V3(), R: new V3() } };
    if (z.st === 'rise') { p.stay = true; p.fall?.(o.dir || new V3(rand(-1, 1), 0, rand(-1, 1))); }
    I.list.push(z); O()?.note?.(o.from === 'counter' ? 'the first of them rose at the counter' : null); return z;
  };
  I.spawn = (at, style) => { const p = makePerson((Math.random() * 1e6) | 0, style); const z = I.turn(p, { at, from: 'street' }); if (z) p.root.rotation.y = Math.atan2(-at.x, -at.z); return z; };
  // a blade or haft held across the way turns a grab aside and shoves them back
  I.guard = (z, q, at) => { const w = q.me && G.weapons?.guards(_c.copy(z.p.root.position).setY(1.35), at); if (!w) return false; z.st = 'walk'; z.t = 0; z.cool = 1.4; z.p.push?.('torso', _d.copy(z.p.root.position).sub(at).setY(0).setLength(3.2), _c.clone()); I.blocks = (I.blocks || 0) + 1; G.audio?.play('set', at); if (w.held) w.held.pulse?.(0.8, 60); return true; };
  I.alive = () => I.list.filter((z) => !z.dead);

  // what they can see and want: the living, nearest first; the cook only where there is light enough
  const preyList = () => { const out = [], o = O(); if (!o) return out;
    if (o.me && !o.me.dead) out.push(o.me); for (const s of o.shelter) if (!s.dead && !s.bitten) out.push(s); for (const g of o.guests.values()) if (!g.dead) out.push(g);
    for (const v of o.street()) out.push(v); return out; };
  const sees = (z, q, lit) => { const d = Math.hypot(q.x() - z.p.root.position.x, q.z() - z.p.root.position.z); return d < (q.cart ? (G.arsenal?.smoke > 0 ? 1.1 : lit ? 7 : 2.4) : lit ? 6 : 2.8); };   // (in the brazier's smoke they lose you)
  // where to stand to get at someone inside the cart: the side nearest, and whether something stands in the way there
  const spotFor = (z, q) => { const o = O(), qx = q.x(), qz = q.z(), P = z.p.root.position, S = [];
    for (const side of ['front', 'left', 'right', 'back']) { const b = o.side(side), up = b.bar > 0, n = I.list.filter((y) => y !== z && !y.dead && y.side === side && !y.inside).length;
      const s = side === 'front' ? new V3(clamp(qx + (n - 1) * 0.45, -0.85, 0.85), 0, CART.z0 - (up ? 0.36 : 0.3)) : side === 'back' ? new V3(clamp(qx + (n - 1) * 0.45, -0.75, 0.75), 0, CART.z1 + (up ? 0.72 : 0.28)) : new V3((side === 'left' ? -1 : 1) * (CART.x1 + (up ? 0.72 : 0.17)), 0, clamp(qz + (n - 1) * 0.4, -0.4, 1.6));
      S.push({ side, s, d: s.distanceTo(P) + n * 0.8 + (up ? 0.6 : 0) + (I.mind && I.mind.focus === side && G.t - I.mind.t < 20 ? -3 : 0), up }); }
    S.sort((a, b) => a.d - b.d); return S[0]; };
  const head = (q) => _d.set(q.x(), q.y ? q.y() : 1.5, q.z());

  I.update = (dt) => {
    const o = O(); if (!o) return; const lit = o.lit(), all = preyList(), t = G.t;
    for (const z of I.list) {
      const p = z.p, P = p.root.position; z.t += dt; z.cool -= dt;
      if (z.dead) { if (!z.pooled && z.t > 1.2) { z.pooled = true; G.gore?.pool(_a.copy(P).add(new V3(0, 0, 0)), rand(0.35, 0.6)); } p.update(dt, t); continue; }
      if (z.remote) { p.update(dt, t); continue; }   // (drawn from the leading page's word)
      if (z.burn > 0) { z.burn -= dt; z.hp -= 14 * dt; if (z.hp <= 0) { I.kill(z, 'burnt'); continue; } }
      if (z.st === 'rise') { if (z.t > z.riseAt) { p.stay = false; if (z.t > z.riseAt + 1.9) { z.st = 'walk'; z.t = 0; o.sound?.('groan', P); } } p.update(dt, t); continue; }
      if ((z.groan -= dt) <= 0) { z.groan = rand(4, 9); o.sound?.('groan', P); }
      if (z.leave && !z.inside) { if (Math.abs(P.x) > 17) { z.gone = true; continue; } if (!z.path || !z.path.length || z.st !== 'walk') { z.st = 'walk'; z.prey = null; z.side = null; z.path = route(P, new V3(Math.sign(P.x || 1) * 18, 0, -2.8)); } z.think = 1; }   // (drifting off as the night wanes)
      // think: who, or what was heard, or wander toward the light
      if ((z.think -= dt) <= 0) { z.think = 0.3 + Math.random() * 0.2;
        let best = null, bd = 1e9; for (const q of all) { if (!sees(z, q, lit) && !(z.prey === q && G.t - (z.seenT || 0) < 3)) continue; const d = Math.hypot(q.x() - P.x, q.z() - P.z) + (q === z.prey ? -0.8 : 0); if (d < bd) { bd = d; best = q; } }
        if (best) { if (best !== z.prey) { z.prey = best; z.path = null; z.wait = 0; } z.seenT = G.t; }
        else if (z.prey && G.t - (z.seenT || 0) > 3) { z.prey = null; z.path = null; }
        if (!z.prey) { const n = o.heard(P); if (n && (!z.heard || n.t > z.heard.t)) { z.heard = n; z.path = null; } }
        if (z.prey && z.prey.cart && !z.inside) { const sp = spotFor(z, z.prey); if (sp.side !== z.side || !z.path || z.goal.distanceTo(sp.s) > 0.3) { z.side = sp.side; z.goal.copy(sp.s); z.path = route(P, z.goal); } }
        else if (z.prey) { z.side = null; z.goal.set(z.prey.x(), 0, z.prey.z()); z.path = z.inside ? [z.goal.clone()] : route(P, z.goal); }
        else if (z.heard && G.t - z.heard.t < 12) { z.side = null; if (!z.path) { z.goal.set(z.heard.x, 0, z.heard.z); z.path = route(P, z.goal); } }
        else if (!z.path || !z.path.length) { z.side = null; z.goal.set(clamp(P.x + rand(-4, 4), -14, 14), 0, clamp(-2.6 + rand(-1.2, 0.8), -4.4, -1.6)); z.path = route(P, z.goal); } }
      // the arms: out ahead, unless a hand is on someone or on what is in the way
      const fw = _a.set(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y)), rt = _b.set(fw.z, 0, -fw.x);
      z.hands.L.copy(P).addScaledVector(fw, 0.5).addScaledVector(rt, 0.2).setY(1.32 + Math.sin(z.t * 1.7) * 0.04); z.hands.R.copy(P).addScaledVector(fw, 0.5).addScaledVector(rt, -0.2).setY(1.3 + Math.sin(z.t * 1.5 + 1) * 0.04);
      let speed = 0, face = null;
      const q = z.prey, at = q ? head(q).clone() : null, dq = q ? Math.hypot(at.x - P.x, at.z - P.z) : 9, reach = z.inside ? INREACH : REACH, arms = z.arm.L + z.arm.R;
      if (z.st === 'grab') { if (!q || q.dead || dq > reach + 0.25 || (z.inside ? false : z.side && o.side(z.side).bar > 0)) { z.st = 'walk'; z.t = 0; }
        else { face = at; for (const s of ['L', 'R']) z.hands[s].copy(at).add(_c.set(s === 'L' ? 0.14 : -0.14, -0.22, 0)); q.grabbed?.(z, dt); if (z.t > 1.15) { z.st = 'walk'; z.t = 0; z.cool = 1.6; I.bites++; o.sound?.('bite', at); q.bite?.(z); } } }
      else if (z.st === 'push') { const b = o.side(z.side); if (!b || b.bar <= 0 || !q) { z.st = 'walk'; z.t = 0; } else { face = _c.copy(P).setY(1.2).add(z.side === 'front' ? _d.set(0, 0, 1) : z.side === 'back' ? _d.set(0, 0, -1) : _d.set(z.side === 'left' ? 1 : -1, 0, 0)).clone(); for (const s of ['L', 'R']) z.hands[s].copy(P).lerp(face, 0.9).setY(1.15 + (s === 'L' ? 0.05 : 0)); o.wear(z.side, dt * (2.2 + arms * 1.6), z); } }
      else if (z.st === 'climb') { face = _c.set(clamp(P.x, -0.4, 0.4), 1.2, clamp(P.z, 0, 1.2)).clone(); P.y = Math.min(0.85, z.t * 0.4); if (z.t > 2.4) { z.inside = true; z.st = 'walk'; z.t = 0; P.set(clamp(P.x, -0.45, 0.45), 0, clamp(P.z, -0.05, 1.25)); z.path = null; o.note?.('one of them climbed into the cart'); } }
      else if (z.path && z.path.length) {
        const w = z.path[0]; _c.copy(w).sub(P); _c.y = 0; const d = _c.length();
        if (d < 0.12) { z.path.shift(); if (!z.path.length && z.heard && !q) z.heard = null; }
        else { speed = (0.5 + 0.22 * Math.sin(z.t * 1.3 + z.wob)) * z.legs * (o.pace || 1); if (q && dq < 1.7 && z.cool <= 0 && !z.side) { z.lunge = 0.55; z.cool = 3; } if (z.lunge > 0) { z.lunge -= dt; speed = 1.9 * z.legs; } face = _d.copy(P).add(_c).setY(1.4).clone(); const s = Math.min(d, speed * dt); P.addScaledVector(_c.normalize(), s); }
      }
      // at the cart, or at whom they want: through what is in the way, a grab, or over the counter
      if (q && z.st === 'walk' && !p.reeling?.()) {
        if (z.inside || !q.cart) { if (dq < reach && z.cool <= 0 && (arms > 0 || dq < 0.5)) { z.st = 'grab'; z.t = 0; I.guard(z, q, at); } }
        else if (z.side && z.goal.distanceTo(P) < 0.3) { const b = o.side(z.side); face = at;
          if (b.bar > 0) { z.st = 'push'; z.t = 0; } else if (dq < reach && z.cool <= 0 && arms > 0) { z.st = 'grab'; z.t = 0; I.guard(z, q, at); } else if ((z.wait += dt) > 5 && z.legs > 0.5 && I.list.filter((y) => y.inside && !y.dead).length < 2) { z.st = 'climb'; z.t = 0; z.wait = 0; } } }
      if (z.inside) { P.x = clamp(P.x, -0.5, 0.5); P.z = clamp(P.z, -0.08, 1.28); } else if (inCart(P.x, P.z, 0.1) && z.st !== 'climb') { const dx = Math.min(P.x - CART.x0, CART.x1 - P.x), dz = Math.min(P.z - CART.z0, CART.z1 - P.z); if (dx < dz) P.x = P.x < 0 ? CART.x0 - 0.1 : CART.x1 + 0.1; else P.z = P.z < 0.6 ? CART.z0 - 0.1 : CART.z1 + 0.1; }   // (never through the cart's body)
      if (face) { const ty = Math.atan2(face.x - P.x, face.z - P.z) + Math.sin(z.t * 2.3 + z.wob) * 0.12; let dy = ty - p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.root.rotation.y += dy * Math.min(1, dt * 5); }
      p.pose = speed > 0.05 ? 'walk' : 'stand'; p.speed = Math.max(0.6, speed * 1.4); p.look = at || null;
      p.hands = {}; for (const s of ['L', 'R']) if (z.arm[s] && !p.lost?.has('forearm' + s)) p.hands[s] = z.hands[s];
      if (p.reeling?.()) p.hands = null;
      p.update(dt, t);
    }
  };

  // a blow that is not a blade's (a fist, a thrown thing, a staff): it knocks them about and, hard on the head, can stop them
  I.sweep = () => { for (let i = I.list.length - 1; i >= 0; i--) if (I.list[i].gone) { I.list[i].p.root.removeFromParent(); I.list.splice(i, 1); } };
  I.blow = (z, s) => { if (z.dead) return; const p = z.p, J = s.J || 0, seg = s.seg.mid ? (s.at.y > 1.45 ? 'head' : 'torso') : s.seg.name; if (G.t - (p.hitT || -9) < 0.25) return; p.hitT = G.t;
    p.push?.(seg, s.dir.clone().setLength(J * 0.8), s.at); if (z.st === 'grab' || z.st === 'push') { z.st = 'walk'; z.t = 0; z.cool = 1; }
    if (seg === 'head' && J > 2.2) { z.head -= J * 7; G.gore?.spray(s.at, s.dir, J / 8); if (z.head <= 0) I.kill(z, 'struck down', s.dir); } else if (J > 3) z.hp -= J * 2; if (z.hp <= 0) I.kill(z, 'struck down', s.dir); };
  // a blade's cut, judged by weapons.js: { seg, at, dir, sp, J, cut (edge's share), sever, crush }
  I.cut = (z, h) => {
    if (z.dead && !h.sever) { G.gore?.spray(h.at, h.dir, 0.5); return; } const p = z.p, seg = h.seg, side = seg.slice(-1);
    G.gore?.spray(h.at, h.dir, clamp(h.dmg / 30, 0.3, 1.5)); if (h.cut > 0.5) G.gore?.wound(p, h.at, 0.03 + Math.min(0.04, h.dmg / 900));
    p.push?.(seg, h.dir.clone().setLength(Math.min(6, h.J * 0.5)), h.at); if (z.st === 'grab' || z.st === 'push' || z.st === 'climb') { z.st = 'walk'; z.t = 0; z.cool = 1.2; if (z.p.root.position.y > 0) z.p.root.position.y = 0; }
    if (h.sever) { const part = h.sever, it = G.gore?.sever(p, part, h.dir, h.sp); if (it) { O()?.note?.(part === 'head' ? 'a head came off' : 'a limb came off'); G.react?.limbs?.refresh(p); O()?.sound?.('sever', h.at); }
      if (part === 'head') return I.kill(z, 'beheaded', h.dir); if (/^(forearm|hand)/.test(part)) z.arm[side] = 0; if (/^shin/.test(part)) z.legs = Math.min(z.legs, 0.3); }
    else if (seg === 'head') { z.head -= h.dmg; if (z.head <= 0) return I.kill(z, 'a blow to the head', h.dir); }
    else if (/^(thigh|shin)/.test(seg)) z.legs = Math.max(0.35, z.legs - h.dmg / 90);
    else if (/^(upperArm|forearm|hand)/.test(seg)) { if (h.dmg > 45) z.arm[side] = 0; }
    z.hp -= h.dmg * (seg === 'torso' ? 0.6 : 0.3); if (z.hp <= 0) I.kill(z, 'cut down', h.dir);
  };
  I.kill = (z, how, dir) => { if (z.dead) return; z.dead = true; z.how = how; z.t = 0; z.st = 'dead'; const p = z.p; p.hands = null; p.look = null; p.pose = 'stand'; p.stay = true; p.root.position.y = 0; p.fall?.(dir || new V3(rand(-1, 1), 0, rand(-1, 1))); I.kills++; O()?.note?.(null, 'kill');
    const dead = I.list.filter((y) => y.dead); if (dead.length > 14) { const old = dead[0]; old.p.root.removeFromParent(); I.list.splice(I.list.indexOf(old), 1); } };
  I.clear = () => { for (const z of I.list) z.p.root.removeFromParent(); I.list.length = 0; };
  G.infected = I; return I;
}
