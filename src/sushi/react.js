// what the people make of what the cook does to them: a punch, a blow with what is in hand, a cut, soup splashed, food or a bowl thrown; their bodies take it (pf.js: a flinch, a stagger or a fall, a duck, a mark on their clothes) and so do they: a shout, anger or fear, leaving unpaid, a grudge the regulars keep all night and pass on, the beat cop called over
import { G, V3, clamp } from './ctx.js';
import { PH } from './physics.js';

const HEAD_R = 0.12, TRUNK_R = 0.17;
export function buildReact(block) {
  const R = { log: [] }, _a = new V3(), _d = new V3(), _e = new V3(), _h = new V3(), _n = new V3(), _t = new V3();
  const segD = (p, a, b) => { _e.copy(b).sub(a); const l = _e.lengthSq(), k = l ? clamp(_d.copy(p).sub(a).dot(_e) / l, 0, 1) : 0; return _d.copy(a).addScaledVector(_e, k).distanceTo(p); };
  // everyone who can be touched, with their head and trunk where they are this frame
  const bones = (p) => p._hb || (p._hb = ['hips', 'head'].map((n) => p.bones.find((b) => b.name === n)));
  const bodies = () => {
    const out = [];
    for (const c of G.game?.customers || []) if (!c.guest && c.p.hit && c.p.root.parent) out.push({ p: c.p, c, h: c.nb || null });
    for (const h of block.people) if (!h.taken && !h.hidden && h.p.root.visible && h.p.hit) out.push({ p: h.p, c: null, h });
    for (const b of out) { const [hip, hd] = bones(b.p); b.hip = hip.getWorldPosition(new V3()); b.neck = hd.getWorldPosition(new V3()); b.head = b.neck.clone().setY(b.neck.y + 0.1); }
    return out;
  };
  const touch = (b, pt, r) => (pt.distanceTo(b.head) < HEAD_R + r ? 'head' : segD(pt, b.hip, b.neck) < TRUNK_R + r ? 'body' : null);
  const nameOf = (b) => (b.p.vox && b.p.vox.name) || (b.c && b.c.voice && b.c.voice.name) || (b.p.cast && b.p.cast.name) || 'the customer';
  const colourOf = (it) => { if (it.liq && it.liq.visible && it.liq.material.color) return it.liq.material.color.getHex(); let c = null; it.obj.traverse((o) => { if (!c && o.isMesh && o.material && o.material.color) c = o.material.color.getHex(); }); return c ?? 0x8a6a3a; };
  const a = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  // what happened, in plain words, as the one it happened to hears it
  const words = (kind, part, it, thrown, down) => {
    const w = it ? it.name.replace(/^(fresh |cooked )/, '') : '', head = part === 'head';
    const s = kind === 'tap' ? 'touched you on the arm' : kind === 'punch' ? (head ? 'punched you in the face' : 'punched you') : kind === 'cut' ? 'cut you with a kitchen knife'
      : kind === 'splash' ? 'splashed soup all over your clothes' : kind === 'scald' ? 'splashed hot broth on you, and it burns'
      : kind === 'food' ? `threw ${w} at you, and it left a stain on your clothes` : thrown ? `threw ${a(w)} at you and it hit you${head ? ' in the head' : ''}` : `hit you${head ? ' on the head' : ''} with ${a(w)}`;
    return s + (down ? ', knocking you to the ground' : '');
  };
  const them = (you, name) => { let n = 0; return you.replace(/\byour\b/g, 'their').replace(/\byou\b/g, () => (n++ ? 'them' : name)); };

  // a blow lands: the body first, then the person
  const blow = (b, kind, part, dir, at, f, it, thrown) => {
    const p = b.p; if (G.t - (p.hitT || -9) < 0.35) return; p.hitT = G.t;
    if (kind !== 'tap') p.hit(dir, at, kind === 'cut' ? Math.max(f, 0.8) : kind === 'splash' || kind === 'scald' ? 0.18 : f);
    if (it && (kind === 'food' || (it.liq && it.liq.visible))) { p.stain(at, colourOf(it), kind === 'food' ? 0.045 : 0.07); if (it.kind === 'bowl' && !it.empty) it.spill?.(); }
    const down = p.down(), level = kind === 'tap' ? 0 : kind === 'food' || kind === 'splash' ? 1 : kind === 'cut' || down || f >= 1 ? 3 : 2;
    const name = nameOf(b), you = words(kind, part, it, thrown, down), they = them(you, name);
    R.log.push({ t: +G.t.toFixed(2), who: name, kind, part, level, f: +f.toFixed(2), down, seated: !!(b.c && (b.c.state === 'waiting' || b.c.state === 'eating' || b.c.state === 'sitting')) }); if (R.log.length > 20) R.log.shift();
    if (level) G.talk?.seen?.(they);
    const reg = b.h, cop = reg && reg.def.id === 'denise';
    if (reg && level) block.mad[reg.def.id] = { you, them: they };
    let leave = false;
    if (b.c) { const c = b.c; c.hurt = (c.hurt || 0) + (level ? 1 : 0); c.attn = 6; leave = level >= 2 || c.hurt >= 2; if (!leave && level) { c.patience *= 0.6; if (c.result) c.result.tip = 0; } G.talk?.event(c, 'hurt', { you, level, leave, cop }); if (leave) G.game?.flee?.(c); }
    else if (reg) { G.talk?.event(reg.spk, 'hurt', { you, level, cop }); if (level >= 2 && !cop) block.scare(reg); else block.greet(reg, { kind: 'hurt', t: level ? 2.5 : 1.8 }); }
    // those around saw it: a word from one at the counter, the frightened leave, the regulars remember
    if (level) for (const o of bodies()) { if (o.p === p || o.p.root.position.distanceTo(p.root.position) > 7) continue;
      if (o.h && !block.mad[o.h.def.id] && !block.told[o.h.def.id]) block.told[o.h.def.id] = { from: 'you saw it yourself:', them: they };
      if (o.c) { o.c.attn = 5; if (level >= 3 && !o.c.fled) { o.c.fled = true; G.talk?.event(o.c, 'saw', they); G.game?.flee?.(o.c); } else if (level >= 2 && Math.random() < 0.6) G.talk?.event(o.c, 'saw', they); }
      else if (o.h && level >= 2 && o.h.def.id !== 'denise' && Math.random() < 0.6) { o.p.gesture?.('no'); block.scare(o.h); } }
    if (level >= 2) block.police(p.root.position, cop ? null : they);
  };
  R.blow = blow;

  R.update = (dt) => {
    if (!G.game || dt <= 0) return; const list = bodies(); if (!list.length) return;
    // the cook's hands, and what they hold
    for (const h of G.hands || []) {
      if (!h.active || !h.vs) continue; const it = h.held && !h.held.dead ? h.held : null, knife = it && it.useMode === 'chop', pt = knife ? it.point(it.blade, _a) : it ? it.worldCenter(_a) : _a.copy(h.pos), sp = h.vs.length(), r = it ? Math.min(0.07, it.radius * 0.6) : 0.04;
      h.near ||= new Set();
      for (const b of list) { const part = touch(b, pt, r); if (!part) { h.near.delete(b.p); continue; } if (h.near.has(b.p)) continue; h.near.add(b.p);
        if (sp < (knife ? 0.6 : 1.5)) { if (!it && sp < 0.6) blow(b, 'tap', part, _n.set(0, 0, -1), pt, 0); continue; }
        blow(b, knife ? 'cut' : it ? 'thing' : 'punch', part, h.vs, pt.clone(), clamp((sp - 0.9) / 3.2, 0.2, 1.3), it, false); }
    }
    // what flies: they duck if they see it coming, and what hits them glances off
    for (const it of G.items) {
      if (!it.free || it.held || it.dead || it.kind === 'debris') continue; const sp = it.vel.length(); if (sp < 1.4) continue; const c = it.worldCenter(_a);
      for (const b of list) {
        it.ducked ||= new Set();
        if (!it.ducked.has(b.p)) { _h.copy(b.head).sub(c); const al = _h.dot(it.vel) / sp; if (al > 0 && al / sp < 0.4 && _t.copy(it.vel).multiplyScalar(al / sp).sub(_h).length() < 0.35) { it.ducked.add(b.p); if (Math.random() < 0.45) b.p.duck(); } }
        if (it.hitP === b.p) continue; const part = touch(b, c, Math.min(0.08, (it.radius || 0.05) * 0.6)); if (!part) continue; it.hitP = b.p;
        const food = it.kind === 'food', f = clamp((sp - 1) / 4, 0.15, 1.2) * (food ? 0.35 : it.kind === 'bowl' || it.kind === 'drink' || it.kind === 'prop' ? 1 : 0.7), dir = it.vel.clone();
        const e = PH.ready && PH.live.get(it), nv = { x: -dir.x * 0.2, y: Math.min(0, dir.y) * 0.3 - 0.4, z: -dir.z * 0.2 }; if (e) e.b.setLinvel(nv, true); else it.vel.set(nv.x, nv.y, nv.z);
        blow(b, food ? 'food' : 'thing', part, dir, c.clone(), f, it, true); break;
      }
    }
    // soup and broth: drops that reach someone wet them, mark them, and (hot) burn
    const L = G.fx && G.fx.liq; if (L) for (const d of L) { if (!d.visible) continue; const u = d.userData;
      for (const b of list) { const part = touch(b, d.position, 0.01); if (!part) continue; const p = b.p; d.visible = false; u.chain = null; d.scale.setScalar(1);
        p.wetN = (p.wetN || 0) + 1; if (u.pay && u.pay.heat > 0.5) p.wetHot = true; if (Math.round(p.wetN) % 5 === 1) p.stain(d.position, d.material.color.getHex(), 0.035);
        if (p.wetN > 6 && G.t - (p.splT || -9) > 6) { p.splT = G.t; blow(b, p.wetHot ? 'scald' : 'splash', part, u.v.clone(), d.position.clone(), 0.2, null, true); p.wetN = 0; p.wetHot = false; }
        u.pay = null; break; } }
    for (const b of list) if (b.p.wetN) b.p.wetN = Math.max(0, b.p.wetN - dt * 2);
  };
  return R;
}
