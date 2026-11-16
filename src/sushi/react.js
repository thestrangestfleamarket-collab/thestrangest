// what the people make of what the cook does to them: a touch, a punch, a blow with what is in hand, a cut, soup splashed, food or a bowl thrown, each as hard as the impulse measured on their limbs (limbs.js); their bodies take it (pf.js: the struck limb knocked about, a step back or a fall, a duck, a mark on their clothes) and so do they: a shout, anger or fear, leaving unpaid, a grudge the regulars keep all night and pass on, the beat cop called over
import { G, V3 } from './ctx.js';
import { PH } from './physics.js';
import { buildLimbs } from './limbs.js';

const TAP_J = 0.9, LIGHT_J = 0.35, FALL_J = 4; // N s: below TAP a touch, below LIGHT a thrown thing only brushes them, FALL floors someone standing
export function buildReact(block) {
  const R = { log: [], limbs: null }, _h = new V3(), _t = new V3(), _c = new V3();
  // everyone who can be touched, with their head and trunk where they are this frame
  const bones = (p) => p._hb || (p._hb = ['hips', 'head'].map((n) => p.bones.find((b) => b.name === n)));
  const bodies = () => {
    const out = [];
    for (const c of G.game?.customers || []) if (!c.guest && c.p.hit && c.p.root.parent) out.push({ p: c.p, c, h: c.nb || null });
    for (const h of block.people) if (!h.taken && !h.hidden && h.p.root.visible && h.p.hit) out.push({ p: h.p, c: null, h });
    for (const z of G.infected?.list || []) if (z.p.root.parent && z.p.root.visible && z.p.hit) out.push({ p: z.p, c: null, h: null, z });   // the turned (infected.js): their own way of taking a blow
    for (const b of out) { const [hip, hd] = bones(b.p); b.hip = hip.getWorldPosition(new V3()); b.neck = hd.getWorldPosition(new V3()); b.head = b.neck.clone().setY(b.neck.y + 0.1); }
    return out;
  };
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
  const blow = (b, kind, part, dir, at, J, it, thrown, bone) => {
    if (b.z) return; const p = b.p; if (G.t - (p.hitT || -9) < 0.35) return; p.hitT = G.t; const f = J / FALL_J;
    p.push(bone || (part === 'head' ? 'head' : 'torso'), dir.clone().setLength(J), at);
    if (it && (kind === 'food' || (it.liq && it.liq.visible))) { p.stain(at, colourOf(it), kind === 'food' ? 0.045 : 0.07); if (it.kind === 'bowl' && !it.empty) it.spill?.(); }
    const down = p.down(), level = kind === 'tap' ? 0 : kind === 'food' || kind === 'splash' ? 1 : kind === 'cut' || down || f >= 1 ? 3 : f >= 0.4 || kind === 'scald' ? 2 : 1;
    const name = nameOf(b), you = words(kind, part, it, thrown, down), they = them(you, name);
    R.log.push({ t: +G.t.toFixed(2), who: name, kind, part, bone: bone || part, level, J: +J.toFixed(2), down, seated: !!(b.c && (b.c.state === 'waiting' || b.c.state === 'eating' || b.c.state === 'sitting')) }); if (R.log.length > 20) R.log.shift();
    if (level) G.talk?.seen?.(they);
    const reg = b.h, cop = reg && reg.def.id === G.block.cop;
    if (reg && level) block.mad[reg.def.id] = { you, them: they };
    let leave = false;
    if (b.c) { const c = b.c; c.hurt = (c.hurt || 0) + (level ? 1 : 0); c.attn = 6; leave = level >= 2 || c.hurt >= 2; if (!leave && level) { c.patience *= 0.6; if (c.result) c.result.tip = 0; } G.talk?.event(c, 'hurt', { you, level, leave, cop }); if (leave) G.game?.flee?.(c); }
    else if (reg) { G.talk?.event(reg.spk, 'hurt', { you, level, cop }); if (level >= 2 && !cop) block.scare(reg); else block.greet(reg, { kind: 'hurt', t: level ? 2.5 : 1.8 }); }
    // those around saw it: a word from one at the counter, the frightened leave, the regulars remember
    if (level) for (const o of bodies()) { if (o.p === p || o.p.root.position.distanceTo(p.root.position) > 7) continue;
      if (o.h && !block.mad[o.h.def.id] && !block.told[o.h.def.id]) block.told[o.h.def.id] = { from: 'you saw it yourself:', them: they };
      if (o.c) { o.c.attn = 5; if (level >= 3 && !o.c.fled) { o.c.fled = true; G.talk?.event(o.c, 'saw', they); G.game?.flee?.(o.c); } else if (level >= 2 && Math.random() < 0.6) G.talk?.event(o.c, 'saw', they); }
      else if (o.h && level >= 2 && o.h.def.id !== G.block.cop && Math.random() < 0.6) { o.p.gesture?.('no'); block.scare(o.h); } }
    if (level >= 2) block.police(p.root.position, cop ? null : they);
  };
  R.blow = blow;

  R.update = (dt) => {
    if (!G.game || dt <= 0) return; const list = bodies();
    if (PH.ready && !R.limbs) R.limbs = buildLimbs();
    const hits = R.limbs ? R.limbs.update(dt, list) : []; if (!list.length) return;
    // what really met them, and how hard
    for (const s of hits) { const b = s.rec.x, it = s.it, head = s.seg.name === 'head' || (s.seg.mid && s.at.y > b.neck.y), part = head ? 'head' : 'body', bone = s.seg.mid ? (head ? 'head' : 'torso') : s.seg.name;
      if (b.z) { if (!(it && it.weapon && s.src === 'held')) G.infected?.blow(b.z, s); continue; }   // (a blade's cut is judged by weapons.js)
      let kind;
      if (s.src === 'hand') kind = s.J < TAP_J ? 'tap' : 'punch';
      else if (s.src === 'held') kind = it.useMode === 'chop' && s.sp >= 0.5 ? 'cut' : s.J < TAP_J ? 'tap' : 'thing';
      else if (it.kind === 'debris') continue;
      else if (it.kind === 'food') kind = 'food';
      else if (s.J < LIGHT_J) continue; else kind = 'thing';
      blow(b, kind, part, s.dir, s.at, s.J, it, s.src === 'thrown', bone); }
    // what flies at them: they duck if they see it coming
    for (const it of G.items) {
      if (!it.free || it.held || it.dead || it.kind === 'debris') continue; const sp = it.vel.length(); if (sp < 1.4) continue; const c = it.worldCenter(_c); it.ducked ||= new Set();
      for (const b of list) if (!b.z && !it.ducked.has(b.p)) { _h.copy(b.head).sub(c); const al = _h.dot(it.vel) / sp; if (al > 0 && al / sp < 0.4 && _t.copy(it.vel).multiplyScalar(al / sp).sub(_h).length() < 0.35) { it.ducked.add(b.p); if (Math.random() < 0.45) b.p.duck(); } }
    }
    // soup and broth: drops that reach someone's real space wet them, mark them, and (hot) burn
    const L = G.fx && G.fx.liq; if (L && R.limbs) for (const d of L) { if (!d.visible) continue; const u = d.userData, at = R.limbs.at(d.position, 0.01); if (!at) continue;
      const b = at.rec.x, p = b.p, part = at.seg.name === 'head' ? 'head' : 'body'; d.visible = false; u.chain = null; d.scale.setScalar(1);
      p.wetN = (p.wetN || 0) + 1; if (u.pay && u.pay.heat > 0.5) p.wetHot = true; if (Math.round(p.wetN) % 5 === 1) p.stain(d.position, d.material.color.getHex(), 0.035);
      if (p.wetN > 6 && G.t - (p.splT || -9) > 6) { p.splT = G.t; blow(b, p.wetHot ? 'scald' : 'splash', part, u.v.clone(), d.position.clone(), 0.2, null, true, at.seg.mid ? 'torso' : at.seg.name); p.wetN = 0; p.wetHot = false; }
      u.pay = null; }
    for (const b of list) if (b.p.wetN) b.p.wetN = Math.max(0, b.p.wetN - dt * 2);
  };
  return R;
}
