// THE SLOW TURN, the director of RAMEN's one day and night: normal at first; then small signs (a cough at the counter, a far bell and shouting, a runner with news of a sickness); then plain ones (fewer people, doors shut, a dog barks and goes quiet) and a regular collapses at the counter and rises wrong; panic, the numbers grow, groups at the barricades, the worst of it, then fewer and slower while help is announced, and at dawn the domain's samurai come with torches. The cart is your fort (its shutters, crates, a barrel, a door, all bodies they push through); villagers shelter with you (fed, they stay calm and help hold; panicked, they are loud); you can die. One page in the alley runs it (share.js), the rest follow
import * as THREE from 'three';
import { G, V3, Q, clamp, rand, pick, mat } from './ctx.js';
import { Prop } from './items.js';
import { makePerson } from './avatars.js';
import * as T from './tex.js';
import { buildInfected, CART } from './infected.js';
import { buildWeapons } from './weapons.js';
import { buildGore } from './gore.js';
import { buildArsenal, Thrown, Bow, Gun, Kusari, Lantern } from './arsenal.js';
import { PH } from './physics.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// the run's stages (the owner's, 16 Nov 2026) over the whole of one run, 0..1
export const STAGES = [['normal', 0], ['signs', 0.2], ['obvious', 0.3], ['ramp', 0.4], ['harder', 0.5], ['hardest', 0.6], ['winddown', 0.7], ['end', 0.9]];
const RUN = 2400; // seconds a run lasts on the stand-in clock (?fast: twenty times quicker)
const stageAt = (f) => { let s = STAGES[0][0]; for (const [n, a] of STAGES) if (f >= a) s = n; return s; };
const local = (f, s) => { const i = STAGES.findIndex((x) => x[0] === s), a = STAGES[i][1], b = i + 1 < STAGES.length ? STAGES[i + 1][1] : 1; return clamp((f - a) / (b - a), 0, 1); };
// a stand-in for the run's clock until the real one (clock.js) is there: the same shape, frac 0..1, the stage, stage events; it gives way the moment G.clock is another's
function standIn() {
  const q = new URLSearchParams(location.search), C = { stub: true, t: 0, frac: 0, stage: 'normal', phase: 'day', speed: q.has('fast') ? 20 : 1, fns: {} };
  C.on = (n, fn) => { (C.fns[n] ||= []).push(fn); return C; };
  C.set = (f) => { C.t = clamp(f, 0, 1) * RUN; C.tick(0); };
  C.tick = (dt) => { C.t = Math.min(RUN, C.t + dt * C.speed); C.frac = C.t / RUN; const s = stageAt(C.frac); C.phase = C.frac < 0.25 ? 'day' : C.frac < 0.35 ? 'dusk' : C.frac < 0.9 ? 'night' : 'dawn'; if (s !== C.stage) { C.stage = s; for (const f of C.fns['stage:' + s] || []) f(); } };
  return C;
}
const SIDES = ['front', 'left', 'right', 'back'];
// where each side's barricade stands: [x0, z0, x1, z1]
const ZONE = { left: [-1.85, -0.62, -1.17, 1.88], right: [1.17, -0.62, 1.85, 1.88], back: [-1.25, 1.84, 1.25, 2.5] };

export function buildOutbreak(scene) {
  if (!G.clock) G.clock = standIn();
  const gore = buildGore(scene), I = buildInfected(), W = buildWeapons(), AR = buildArsenal(scene);
  W.kinds = { kunai: Thrown, shuriken: Thrown, boshuriken: Thrown, ya: Thrown, yumi: Bow, teppo: Gun, kusarigama: Kusari };
  const O = { stop: false, pace: 1, shelter: [], guests: new Map(), noises: [], events: [], fired: new Set(), lit: () => !!(G.cart && G.cart.open) && !(G.arsenal && G.arsenal.smoke > 0), log: [], dead: false, won: false, stage: 'normal', f: 0 };
  G.outbreak = O; const clk = () => G.clock, lead = () => !G.live?.share || G.live.share.lead, cam = new V3();
  const camAt = () => (G.camera ? G.camera.getWorldPosition(cam) : cam.set(0, 1.6, 0.3));
  const at = (x, y, z) => new V3(x, y, z);
  // what happened tonight, for the score
  O.found = (w) => { if (!w.foundT) { w.foundT = G.t; if (O.f >= 0.3) O.note(`you took up the ${w.def.name}`); } };
  O.note = (what, kind) => { if (what) O.events.push({ f: +(clk().frac || 0).toFixed(3), what }); if (kind === 'kill') O.kills = (O.kills || 0) + 1; };

  // ---------- sounds of the night, from where they happen; each is also a noise they hear
  const S = (p, fn, wet) => { const A = G.audio; if (!A || !A.ready) return; const e = A.spatial('voice', p.clone ? p.clone() : p, { wet }); setTimeout(e.free, 9000); fn(A, e.input); };
  O.sound = (name, p) => {
    const loud = { groan: 0, bite: 0.5, sever: 0.4, bell: 1, alarm: 1, shout: 0.8, door: 0.5, bark: 0.6, yelp: 0.5, crash: 0.9, temple: 1 }[name] ?? 0.4; if (loud) O.noise(p, loud);
    S(p, (A, d) => {
      if (name === 'groan') { A.tone(rand(78, 104), rand(0.9, 1.4), { type: 'sawtooth', vol: 0.05, to: rand(55, 70), dest: d }); A.burst(rand(380, 520), 0.9, { vol: 0.05, q: 6, to: 240, dest: d }); }
      else if (name === 'bite') { A.burst(1600, 0.14, { vol: 0.35, q: 1.5, dest: d }); A.burst(500, 0.3, { vol: 0.25, q: 2, to: 300, delay: 0.05, dest: d }); }
      else if (name === 'sever') { A.burst(900, 0.18, { vol: 0.3, q: 0.8, to: 300, dest: d }); A.tone(110, 0.2, { vol: 0.15, to: 60, dest: d }); }
      else if (name === 'alarm') for (let i = 0; i < 14; i++) { A.tone(880, 0.6, { vol: 0.07, delay: i * 0.32, dest: d }); A.tone(2420, 0.25, { vol: 0.03, delay: i * 0.32, dest: d }); }   // a village's fire bell, struck fast, far off
      else if (name === 'temple') for (let i = 0; i < 3; i++) for (const r of [0, 9]) { A.tone(98, 6, { vol: 0.16, delay: r + i * 2.6, dest: d }); A.tone(270, 4, { vol: 0.05, delay: r + i * 2.6, dest: d }); A.tone(529, 2.5, { vol: 0.03, delay: r + i * 2.6, dest: d }); }   // the temple's bell in threes: the signal that help is coming
      else if (name === 'shout') for (let i = 0; i < 6; i++) A.burst(rand(550, 900), rand(0.3, 0.6), { vol: 0.12, q: 5, to: rand(350, 500), delay: i * rand(0.2, 0.5), dest: d });
      else if (name === 'door') { A.shot('wood1', p, 1, 0.55); A.burst(140, 0.25, { vol: 0.35, type: 'lowpass', dest: d }); }
      else if (name === 'bark') for (let i = 0; i < 5; i++) { A.tone(rand(480, 620), 0.13, { type: 'sawtooth', vol: 0.09, to: 300, delay: i * 0.45 + rand(0, 0.1), dest: d }); A.burst(900, 0.1, { vol: 0.08, q: 2, delay: i * 0.45, dest: d }); }
      else if (name === 'yelp') { A.tone(900, 0.35, { type: 'triangle', vol: 0.08, to: 1400, dest: d }); }
      else if (name === 'crash') A.shot('crash', p, 1, 0.8);
      else if (name === 'heart') { A.tone(52, 0.13, { vol: 0.14, dest: A.master }); A.tone(48, 0.11, { vol: 0.1, delay: 0.22, dest: A.master }); }
    }, name === 'alarm' || name === 'temple' ? 2 : 1);
  };
  // ---------- what they hear: every knock and break the cart makes (audio.js), a shout, the bell; as loud as it was
  O.noise = (p, loud) => { O.noises.push({ x: p.x, z: p.z, loud, t: G.t }); if (O.noises.length > 24) O.noises.shift(); };
  O.heard = (P) => { let best = null, bk = 0.5; for (const n of O.noises) { const age = G.t - n.t; if (age > 8) continue; const k = (n.loud * 8) / (1 + Math.hypot(n.x - P.x, n.z - P.z)) * (1 - age / 8); if (k > bk) { bk = k; best = n; } } return best; };
  { const A = G.audio, touch = A.touch.bind(A), play = A.play.bind(A); A.touch = (it, pos, k) => { const p = pos || (it && it.obj && it.obj.position); if (k > 0.25 && p) O.noise(p, Math.min(1, k)); return touch(it, pos, k); };
    A.play = (name, p, k) => { if (/^(shatter|crash|clank|break|bell)$/.test(name)) O.noise(p && p.obj ? p.obj.position : p && p.isVector3 ? p : camAt(), name === 'bell' ? 0.5 : 0.9); return play(name, p, k); }; }
  if (G.talk) { const says = G.talk.cookSays; G.talk.cookSays = (text, a) => { O.noise(camAt(), /!|help|here|hey|come/i.test(text || '') ? 0.9 : 0.5); return says(text, a); }; }
  const cry = (p, situation, lines) => { if (!p) return; G.talk?.event({ p, passer: true, here: () => !!p.root.parent }, 'cry', { situation, lines }); };

  // ---------- you: hurt by grabs and bites, shown softly (the edges darken, a heartbeat, the world dims), never a flash
  const me = O.me = { me: true, cart: true, hp: 100, dead: false, hurtT: -99, x: () => camAt().x, z: () => cam.z, y: () => cam.y,
    harm(n) { if (me.dead || O.won) return; me.hp -= n; me.hurtT = G.t; if (me.hp <= 0) { me.hp = 0; die(); } },
    grabbed(z, dt) { me.harm(5 * dt); }, bite() { me.harm(26); O.note('you were bitten'); } };
  const dark = document.createElement('div'); dark.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 38%, rgba(18,0,0,0.92) 100%)'; document.body.appendChild(dark);
  const vg = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: T.canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.5); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(14,0,0,1)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }), transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false }));
  vg.position.set(0, 0, -0.12); vg.renderOrder = 999; vg.userData.nopick = true; vg.frustumCulled = false; G.camera.add(vg);
  let shown = 0, beat = 0;
  const panel = document.createElement('div'); panel.style.cssText = 'position:fixed;inset:0;display:none;z-index:20;background:rgba(4,3,3,0);color:#e8dcc8;font:16px Georgia,serif;align-items:center;justify-content:center;flex-direction:column;text-align:center;transition:background 2.5s'; document.body.appendChild(panel);
  const again = () => { location.href = location.pathname + location.search; };
  const card = (title, lines) => { panel.innerHTML = ''; const h = document.createElement('div'); h.style.cssText = 'font-size:34px;letter-spacing:4px;margin-bottom:18px'; h.textContent = title; panel.appendChild(h); for (const l of lines) { const p = document.createElement('div'); p.style.cssText = 'margin:4px;opacity:.85'; p.textContent = l; panel.appendChild(p); } const b = document.createElement('button'); b.textContent = 'BEGIN AGAIN'; b.style.cssText = 'margin-top:26px;font:600 18px Georgia,serif;letter-spacing:3px;padding:12px 30px;background:#1a1410;color:#e8dcc8;border:1px solid #6a5a48;cursor:pointer'; b.onclick = again; panel.appendChild(b); panel.style.display = 'flex'; requestAnimationFrame(() => (panel.style.background = 'rgba(4,3,3,0.9)')); document.exitPointerLock?.();
    // in the headset: the same words on a board before you, the button under them
    if (!G.renderer.xr.isPresenting) return;
    const tex = T.canvasTex(1024, 640, (g, w, hh) => { g.fillStyle = 'rgba(8,6,6,0.94)'; g.fillRect(0, 0, w, hh); g.fillStyle = '#e8dcc8'; g.textAlign = 'center'; g.font = '56px Georgia'; g.fillText(title, w / 2, 110); g.font = '30px Georgia'; lines.slice(0, 9).forEach((l, i) => g.fillText(l, w / 2, 190 + i * 44, w - 60)); g.strokeStyle = '#8a7a68'; g.lineWidth = 3; g.strokeRect(w / 2 - 170, hh - 110, 340, 74); g.font = '36px Georgia'; g.fillText('BEGIN AGAIN', w / 2, hh - 60); });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); camAt(); const fw = G.camera.getWorldDirection(new V3()).setY(0).normalize(); bd.position.copy(cam).addScaledVector(fw, 0.75); bd.lookAt(cam.x, bd.position.y, cam.z); scene.add(bd); O.board = bd;
    const btn = { name: 'BEGIN AGAIN', r: 0.09, getPos: () => bd.localToWorld(new V3(0, -0.17, 0.01)), press: again }; bd.userData.button = btn; G.buttons.push(btn); };
  const die = () => { if (me.dead) return; me.dead = true; O.dead = true; O.note('you died'); for (const h of G.hands || []) if (h.held) { h.held.held = null; h.held = null; }
    if (G.guest) { const b = document.createElement('div'); b.style.cssText = 'position:fixed;left:0;right:0;top:40%;text-align:center;z-index:20;color:#e8dcc8;font:28px Georgia,serif;letter-spacing:3px;pointer-events:none;text-shadow:0 0 12px #000'; b.textContent = 'YOU FELL. YOU WATCH THE REST OF THE NIGHT.'; document.body.appendChild(b); return; }   // (a guest who dies stays, and watches)
    setTimeout(() => card('THE NIGHT TOOK YOU', [`You held out till ${clockWords()}.`, `${O.kills || 0} of them put down. ${O.shelter.filter((s) => !s.dead && !s.bitten).length} still sheltering at the cart.`, ...O.events.slice(-4).map((e) => e.what)]), 2600); };
  const clockWords = () => { const f = clk().frac; return f < 0.3 ? 'the afternoon' : f < 0.4 ? 'dusk' : f < 0.6 ? 'the middle of the night' : f < 0.9 ? 'the small hours' : 'first light'; };

  // ---------- the cart's defences: its shutters, and what is stacked at its sides
  const sides = { front: { bar: 0, max: 120 }, left: { bar: 0 }, right: { bar: 0 }, back: { bar: 0 } }; O.sides = sides;
  O.side = (n) => sides[n] || { bar: 0 };
  const props = []; const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const model = (n, g, s = 1) => loader.loadAsync('/sushi-assets/m/' + n + '.glb').then((m) => { m.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map }); o.castShadow = true; } }); m.scene.scale.setScalar(s); g.add(m.scene); g.children[0].visible = false; }).catch(() => { });
  const wood = () => T.surface(mat({ map: T.photo('wood'), color: 0x9a8a72 }), { bomb: 0, grime: 0.3 });
  const stackable = (kind, p, ry = 0) => { const g = new THREE.Group(); let o;
    if (kind === 'crate') { g.add(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.4).translate(0, 0.16, 0), wood())); model('wooden_crate_01', g); o = { name: 'crate', col: { t: 'box', hx: 0.41, hy: 0.165, hz: 0.2 }, mass: 9, radius: 0.35, mat: 'wood' }; }
    else if (kind === 'barrel') { g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.87, 14).translate(0, 0.435, 0), wood())); model('wine_barrel_01', g); o = { name: 'barrel', col: { t: 'cyl', hh: 0.435, r: 0.3 }, mass: 30, radius: 0.32, mat: 'wood' }; }
    else { const dm = wood(); g.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.75, 0.86).translate(0, 0.875, 0), dm)); o = { name: 'an old door', col: { t: 'box', hx: 0.03, hy: 0.875, hz: 0.43 }, mass: 18, radius: 0.45, mat: 'wood' }; }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); g.position.copy(p); g.rotation.y = ry; const it = new Prop(g, o); it.pick = true; it.bar = it.barMax = { crate: 40, barrel: 70, door: 55 }[kind]; it.stack = kind; props.push(it); if (PH.ready) PH.rest(it); return it; };
  // the shutters: boards hinged under the roof's front edge, propped up as an awning by day, let down over the counter at night (a cord to pull)
  const sh = new THREE.Group(); sh.position.set(0, 1.97, CART.z0 - 0.05); scene.add(sh); { const m = wood(); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.92, 0.025).translate(0, -0.46, 0), m); b.position.x = -0.98 + i * 0.392; b.castShadow = true; sh.add(b); } sh.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.06, 0.04).translate(0, -0.84, 0.02), m), { castShadow: true })); }
  sh.traverse((o) => { o.userData.nopick = true; }); let shutA = -1.42; sh.rotation.x = shutA; sides.front.down = false;
  O.shutters = (down) => { sides.front.down = down ?? !sides.front.down; if (sides.front.down && sides.front.bar <= 0 && !sides.front.broke) sides.front.bar = sides.front.max; G.audio?.play('set', at(0, 1.4, CART.z0)); O.noise(at(0, 1.4, CART.z0), 0.5); };
  { const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 5), mat({ color: 0xc8b890 })), knot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), mat({ color: 0x7a2a1a })); cord.position.set(0.98, 1.7, CART.z0 + 0.12); knot.position.set(0.98, 1.44, CART.z0 + 0.12); scene.add(cord, knot);
    const btn = { name: 'the shutters\' cord', r: 0.05, getPos: () => knot.position, press: () => O.shutters() }; knot.userData.button = btn; cord.userData.button = btn; G.buttons.push(btn); }
  O.wear = (side, n, z) => { const s = sides[side]; if (!s) return;
    if (side === 'front') { s.bar -= n * (1 - helpers() * 0.2); if (Math.random() < n * 0.4) { G.audio?.play('set', z.p.root.position); O.noise(z.p.root.position, 0.4); } if (s.bar <= 0 && !s.broke) { s.broke = true; s.bar = 0; O.sound('crash', at(0, 1.4, CART.z0)); O.note('the shutters gave way'); } return; }
    let best = null, bd = 9; for (const it of props) if (it.side === side && it.bar > 0) { const d = it.obj.position.distanceTo(z.p.root.position); if (d < bd) { bd = d; best = it; } }
    if (!best) return; best.bar -= n * (1 - helpers() * 0.2); if (Math.random() < n * 0.5) G.audio?.play('set', best.obj.position);
    if (best.bar <= 0) { const P = best.obj.position, out = side === 'left' ? -1 : side === 'right' ? 1 : 0; best.drop(new V3(out ? -out * 0.6 : rand(-0.4, 0.4), 1.2, side === 'back' ? -0.6 : rand(-0.3, 0.3)), new V3(rand(-2, 2), rand(-1, 1), rand(-2, 2))); O.sound('crash', P); O.note(`the ${best.stack} at the ${side} went over`); } };
  const zoneOf = (p) => { for (const k in ZONE) { const [x0, z0, x1, z1] = ZONE[k]; if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) return k; } return null; };
  O.barricade = () => { if (props.length) return; for (const [k, p, r] of [['crate', at(-1.5, 0, 0.0), Math.PI / 2], ['crate', at(-1.5, 0.33, 0.0), Math.PI / 2], ['door', at(-1.5, 0, 1.15), 0], ['crate', at(1.5, 0, 0.1), Math.PI / 2], ['barrel', at(1.5, 0, 1.0), 0], ['crate', at(-0.45, 0, 2.15), 0], ['crate', at(0.45, 0, 2.15), 0], ['crate', at(0, 0.33, 2.15), 0]]) stackable(k, p, r); O.note(null); };

  // ---------- villagers: who is out on the street, who shelters with you, who is caught
  const B = () => G.block;
  O.street = () => { const out = []; if (!B() || O.f < 0.3) return out; for (const h of B().people) if (!h.taken && !h.hidden && h.p.root.visible) out.push(h.prey ||= { h, x: () => h.p.root.position.x, z: () => h.p.root.position.z, y: () => 1.5, dead: false, grabbed() { h.held = 1; }, bite: (z) => caught(h) }); return out; };
  const caught = (h) => { if (h.taken) return; h.taken = true; h.prey.dead = true; const p = h.p; p.fall?.(p.root.position.clone().sub(camAt()).setY(0)); p.stay = true; O.note(`${h.def.name.split(' ')[0]} was caught in the street`); setTimeout(() => { if (!O.won) I.turn(p, { rise: 0, from: 'street' }); }, rand(7000, 12000) / (clk().speed || 1)); };
  // one comes running to the cart: in behind the counter, and stays
  const shelter = (h) => { if (!h || h.taken || O.shelter.length >= 3) return null; h.taken = true; h.hidden = false; const p = h.p, i = O.shelter.length, x = [-0.38, 0.38, 0][i];
    const s = { h, p, calm: 0.5, eat: 0, dead: false, bitten: 0, cart: true, x: () => p.root.position.x, z: () => p.root.position.z, y: () => 1.1, grabbed() { s.calm = 0; }, bite: (z) => { if (s.bitten) return; s.bitten = G.t; O.note(`${h.def.name.split(' ')[0]} was bitten`); } };
    p.root.position.set(x, 0, 1.32); p.root.rotation.y = Math.PI; p.pose = 'sit'; p.look = null; G.peopleRoot?.add(p.root); O.shelter.push(s); O.note(`${h.def.name.split(' ')[0]} came to shelter at the cart`);
    cry(p, 'The dead are walking in the village. You ran to the ramen cart and the cook let you in behind the counter. Say something frightened and grateful, short.', ['Let me in, please, let me in!', 'Thank you, thank you. They are everywhere.', 'Bless you. I will keep quiet, I swear it.']);
    G.targets.push({ getPos: () => new V3(p.root.position.x, 0.95, p.root.position.z - 0.3), r: 0.35, prio: 3, accepts: (it) => !s.dead && !s.bitten && it.kind === 'bowl' && !it.dirty && !it.empty && !!it.noodles, receive: (it) => { it.obj.position.set(p.root.position.x, 0.92, p.root.position.z - 0.3); it.upright(); it.served = true; s.calm = 1; s.eat = 16; p.pose = 'eat'; s.bowl = it; O.note(`${h.def.name.split(' ')[0]} ate a bowl and steadied`); } });
    return s; };
  const helpers = () => Math.min(2, O.shelter.filter((s) => !s.dead && !s.bitten && s.calm > 0.5).length);
  const updShelter = (dt) => { for (const s of O.shelter) { if (s.dead) continue; const p = s.p;
      if (s.bitten && G.t - s.bitten > 20 / (clk().speed > 1 ? 4 : 1)) { s.dead = true; p.pose = 'stand'; const z = I.turn(p, { rise: 1.5, from: 'shelter' }); if (z) { z.inside = true; O.note(`${s.h.def.name.split(' ')[0]} turned, inside the cart`); } continue; }
      if (s.eat > 0) { s.eat -= dt; if (s.eat <= 0) { p.pose = 'sit'; s.bowl?.makeDirty?.(); } }
      s.calm = Math.max(0, s.calm - dt / 140 * (I.alive().length ? 1.5 : 0.5)); p.look = camAt().clone();
      if (s.calm < 0.3 && (s.cry = (s.cry || 6) - dt) <= 0) { s.cry = rand(6, 11); O.noise(p.root.position, 0.7); O.sound('shout', p.root.position.clone().setY(1.2)); }
      p.update(dt, G.t); } };

  // ---------- the night's beats, in order, each once: [stage, how far into it, what]
  const BEATS = [['signs', 0.12, 'cough'], ['signs', 0.42, 'alarm'], ['signs', 0.72, 'runner'], ['obvious', 0.02, 'fewer'], ['obvious', 0.1, 'doors'], ['obvious', 0.2, 'dog'], ['obvious', 0.28, 'stack'], ['obvious', 0.4, 'collapse'], ['obvious', 0.55, 'panic'], ['obvious', 0.75, 'sickle'],
    ['ramp', 0.25, 'axe'], ['ramp', 0.5, 'shelter'], ['ramp', 0.65, 'bow'], ['ramp', 0.85, 'straw'], ['harder', 0.1, 'spears'], ['harder', 0.3, 'shinobi'], ['harder', 0.6, 'shelter'], ['harder', 0.75, 'kusari'], ['hardest', 0.25, 'ronin'], ['hardest', 0.6, 'teppo'], ['winddown', 0.15, 'messenger'], ['winddown', 0.45, 'yari'], ['winddown', 0.5, 'naginata'], ['winddown', 0.6, 'gather'], ['end', 0.0, 'rescue'], ['end', 0.55, 'won']];
  const free = () => (B() ? B().people.filter((h) => !h.taken && !h.hidden) : []);
  const someone = () => { const f = free(); return f.length ? pick(f) : null; };
  const runner = (lines, situation, to = -1) => { const h = someone(), p = h ? h.p : makePerson((Math.random() * 1e6) | 0); if (h) h.taken = true; if (!p.root.parent) G.peopleRoot.add(p.root); p.root.position.set(to * -16, 0, -2.6); p.root.visible = true; O.runners.push({ p, h, to: to * 18, sp: 2.6, said: false, lines, situation }); return p; };
  O.runners = [];
  const toss = (kind, from, to) => { const w = W.make(kind, from); w.obj.lookAt(to.x, from.y, to.z); w.drop(to.clone().sub(from).setY(0).multiplyScalar(1.1).setY(2.2)); O.sound('door', to); return w; };
  const DO = {
    cough: () => { O.cough = true; const c = G.game?.customers.find((x) => x.state === 'waiting' || x.state === 'eating' || x.state === 'sitting'); if (c) mark(c.p); },
    alarm: () => { O.sound('alarm', at(-60, 8, -40)); O.sound('shout', at(-45, 2, -30)); O.note('a fire bell rang far off, and shouting'); },
    runner: () => { runner(['The next village, they say a sickness came in the night. People are not themselves.', 'Have you heard? There is a sickness over the hill. Bar your doors tonight!'], 'You are running through the village at dusk with bad news: the next village has a strange sickness, people there have gone wrong. Call it out to the ramen cook as you hurry past.'); O.note('a runner brought news of a sickness in the next village'); },
    fewer: () => { for (const h of free()) if (Math.random() < 0.5) { h.hidden = true; h.p.root.visible = false; h.step = 'inside'; h.t = 9999; } },
    doors: () => { for (let i = 0; i < 4; i++) setTimeout(() => O.sound('door', at(rand(-14, 14), 1, pick([-5.4, 3.2]))), i * rand(900, 1700)); O.note('doors shut up and down the street'); },
    dog: () => { const p = at(-12, 0.4, -4.5); O.sound('bark', p); setTimeout(() => O.sound('bark', p), 3000); setTimeout(() => O.sound('yelp', p), 6500); O.note('a dog barked, and went quiet'); },
    stack: () => { O.barricade(); O.stop = true; const l = new Lantern(); l.obj.position.set(0.45, 1.645, 1.72); if (PH.ready) PH.rest(l); },
    bow: () => { const b = W.make('yumi', at(0.05, 0.93, 1.58), new Q().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))); O.note('a hunter running by left his bow and quiver at the cart'); },
    straw: () => { AR.straw(); AR.straw(); O.note('straw soaked in the water barrel, by the brazier'); },
    shinobi: () => { for (let i = 0; i < 4; i++) W.make('shuriken', at(0.8 + (i % 2) * 0.16, 0.905, 0.05 + (i >> 1) * 0.16)); for (let i = 0; i < 3; i++) W.make('boshuriken', at(1.0, 0.905, 0.42 + i * 0.05), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))); W.make('kunai', at(0.86, 0.91, 0.62), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))); O.note('a stranger in black dropped a pouch of shuriken and a kunai on the counter and ran on'); },
    kusari: () => { W.make('kusarigama', at(-0.4, 0.93, 1.55), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2))); O.note('a kusarigama, its chain and weight, left at the back'); },
    teppo: () => { W.make('teppo', at(0.35, 0.96, 1.64), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))); O.note('a fallen foot soldier\'s matchlock, loaded, its match still lit'); },
    naginata: () => { W.make('naginata', at(0, 0.95, 1.72), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2))); O.note('a naginata laid over the back of the cart'); },
    collapse: () => { const cs = (G.game?.customers || []).filter((c) => c.state === 'waiting' || c.state === 'eating' || c.state === 'sitting'); let p, from = null; const c = cs.find((x) => x.p.cough) || cs[0];
      if (c) { p = G.game.take(c); from = c; } else { const h = someone(); if (h) { h.taken = true; p = h.p; } else p = makePerson((Math.random() * 1e6) | 0); p.root.position.set(rand(-0.6, 0.6), 0, -1.35); G.peopleRoot.add(p.root); }
      p.pose = 'stand'; p.root.position.y = 0; const z = I.turn(p, { rise: 6 / Math.sqrt(clk().speed || 1), from: 'counter', dir: new V3(rand(-0.4, 0.4), 0, -1) }); O.first = z; O.sound('crash', p.root.position.clone().setY(0.9)); O.stop = true;
      for (const o of G.game?.customers || []) if (o !== from) G.game.flee?.(o); O.note('a regular collapsed at the counter'); },
    panic: () => { for (const h of free()) { if (Math.random() < 0.45) { h.hidden = true; h.p.root.visible = false; h.t = 9999; h.step = 'inside'; } else B().scare(h); } O.sound('shout', at(4, 1.6, -3)); O.note('panic in the street'); },
    sickle: () => { toss('kama', at(-3, 1.4, -2.4), at(0.2, 1.05, -0.45)); O.note('a farmer running past threw his sickle onto the counter'); },
    axe: () => { W.make('axe', at(1.42, 0.62, 1.25), new Q().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0.2))); O.sound('door', at(1.4, 0.6, 1.2)); O.note('a woodcutter\'s axe left on the woodpile'); },
    spears: () => { toss('takeyari', at(-4, 1.6, 3.5), at(0, 1.0, 1.6)); setTimeout(() => toss('bo', at(4, 1.6, 3.5), at(0.3, 1.0, 1.62)), 900); O.note('a bamboo spear and a staff were thrown over to the cart'); },
    shelter: () => { const h = free().sort((a, b) => a.p.root.position.length() - b.p.root.position.length())[0]; if (h) shelter(h); },
    ronin: () => { const p = makePerson((Math.random() * 1e6) | 0); p.root.position.set(0.1, 0, -1.5); G.peopleRoot.add(p.root); p.stay = true; p.fall?.(new V3(0, 0, -1)); G.gore.pool(p.root.position, 0.5); O.ronin = p; W.make('katana', at(-0.2, 0.935, -0.42), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2))); W.make('wakizashi', at(0.35, 0.935, -0.36), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2))); W.make('tanto', at(0.62, 0.935, -0.42), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2)));
      cry(p, 'You are a masterless samurai, bitten and dying, who fought your way to the ramen cart. Tell the cook to take your sword.', ['Take it... my sword. Use it well.']); O.note('a ronin fell at the counter; his katana lay on it'); setTimeout(() => { if (!O.won && p.root.parent) { p.stay = false; I.turn(p, { rise: 0, from: 'ronin' }); } }, 40000 / (clk().speed || 1)); },
    messenger: () => { runner(['The lord\'s men are coming! Hold on till first light!', 'Samurai from the castle, at dawn! Hold out!'], 'You are a messenger from the domain\'s castle running through the village in the night. Shout that the lord\'s samurai are coming at first light and to hold out.', 1); O.sound('temple', at(30, 10, -30)); O.note('a messenger and the temple bell: help comes at dawn'); },
    yari: () => { W.make('yari', at(0, 0.93, 1.62), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2))); O.note('a yari leaned against the back of the cart'); },
    gather: () => { for (const s of O.shelter) s.calm = Math.max(s.calm, 0.7); const h = free()[0]; if (h) shelter(h); },
    rescue: () => { column(); O.note('the domain\'s samurai came with torches'); },
    won: () => { if (me.dead) return; O.won = true; const alive = O.shelter.filter((s) => !s.dead && !s.bitten).length;
      card('DAWN', ['You lived to see the dawn.', `${alive} of those who sheltered with you lived.`, `${O.kills || 0} of them put down, ${gore.cuts} cut apart.`, ...O.events.filter((e) => !/came to shelter/.test(e.what)).slice(-5).map((e) => e.what)]); },
  };
  const mark = (p) => { p.cough = true; G.gore?.wound(p, p.bones?.find((b) => b.name === 'forearmL')?.getWorldPosition(new V3()) || p.root.position.clone().setY(1.1), 0.03);
    cry(p, 'You have a bad cough tonight and a bandage on your arm where a stray dog bit you on the road. Mention it briefly to the cook, then cough.', ['Forgive me... this cough. A dog bit me on the road, it will not stop aching.', 'Excuse me. I have not been well since that bite.']); O.note('a customer with a cough and a bandaged arm'); };
  // the domain's samurai: two files with torches up the street; what they meet they cut down
  const troop = [];
  const column = () => { const fl = new THREE.PointLight(0xffa040, 6, 14, 1.6); fl.position.set(16, 2.2, -2.6); scene.add(fl); O.torch = fl;
    for (let i = 0; i < 8; i++) { const p = makePerson(900 + i); p.root.position.set(18 + (i >> 1) * 1.3, 0, -2.2 - (i & 1) * 0.9); p.root.rotation.y = -Math.PI / 2; G.peopleRoot.add(p.root); p.pose = 'walk'; p.root.traverse((o) => { o.userData.nopick = true; });
      const t = new THREE.Group(), st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.7, 6), mat({ color: 0x3a2a1a })), fl2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glowTex(), color: 0xffa040, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })); st.position.y = 0.35; fl2.position.y = 0.75; fl2.scale.set(0.35, 0.5, 1); t.add(st, fl2); p.root.add(t); t.position.set(-0.28, 1.0, 0.25); t.rotation.z = 0.25; troop.push({ p, x: 1.1 + (i >> 1) * 0.9 }); } };
  const updTroop = (dt) => { for (const s of troop) { const p = s.p, P = p.root.position; if (P.x > s.x + 0.9) { P.x -= 1.1 * dt; p.pose = 'walk'; } else { p.pose = 'stand'; p.root.rotation.y += (Math.atan2(-P.x, 0.3 - P.z) - p.root.rotation.y) * Math.min(1, dt * 2); }
      for (const z of I.list) if (!z.dead && z.p.root.position.distanceTo(P) < 2.2) { G.gore.spray(z.p.root.position.clone().setY(1.4), new V3(-1, 0.3, 0), 1); I.kill(z, 'cut down by the samurai', new V3(-1, 0, 0)); } p.update(dt, G.t); }
    if (O.torch && troop[0]) O.torch.position.set(troop[0].p.root.position.x, 2.2, -2.6); };

  // ---------- how many of them, by the stage
  const want = () => { const s = O.stage, k = local(O.f, s); return s === 'ramp' ? 2 + Math.round(k * 2) : s === 'harder' ? 4 + Math.round(k * 2) : s === 'hardest' ? 7 + Math.round(k * 2) : s === 'winddown' ? Math.max(1, Math.round(4 - k * 3)) : s === 'obvious' && O.first ? 1 : 0; };
  let spawnT = 4;
  const grow = (dt) => { if ((spawnT -= dt * (clk().speed > 1 ? 4 : 1)) > 0) return; spawnT = O.stage === 'hardest' ? 5 : O.stage === 'harder' ? 7 : 10; const n = I.alive().length, w = want(); if (n >= w) return;
    const k = O.stage === 'harder' || O.stage === 'hardest' ? 2 : 1; for (let i = 0; i < Math.min(k, w - n); i++) { const sideX = O.stage === 'hardest' ? pick([-1, 1]) : Math.random() < 0.6 ? 1 : -1, z = I.spawn(at(sideX * rand(13, 18), 0, rand(-4.2, -1.8) + (O.stage === 'hardest' && Math.random() < 0.35 ? 5.2 : 0))); if (z) z.heard = { x: 0, z: -1, loud: 1, t: G.t }; } };

  // ---------- the run
  // their one mind (worker/outbreak.js), now and then on the leading page once there are enough of them; without it, instinct
  let mindT = 6, mindOff = false;
  const askMind = () => { const al = I.alive(); if (mindOff || al.length < 2) return; const f = G.camera.getWorldDirection(new V3()), faces = Math.abs(f.x) > Math.abs(f.z) ? (f.x < 0 ? 'left' : 'right') : f.z < 0 ? 'front' : 'back';
    fetch('/sushi/mind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: O.stage, them: al.map((z) => ({ id: z.id, side: z.side || 'street', d: +Math.hypot(z.p.root.position.x, z.p.root.position.z).toFixed(1), legs: z.legs, arms: z.arm.L + z.arm.R })), bars: Object.fromEntries(SIDES.map((k) => [k, Math.round(sides[k].bar)])), faces, hurt: 1 - me.hp / 100, lit: O.lit(), shelter: O.shelter.length }) })
      .then((r) => (r.ok ? r.json() : (mindOff = true, null))).then((j) => { if (j && j.focus) I.mind = { focus: j.focus, t: G.t, hold: j.hold || [] }; }).catch(() => { mindOff = true; }); };
  O.update = (dt) => {
    if (dt <= 0) return; if (lead()) { guestPrey(); if (O.f >= 0.4 && O.f < 0.9 && (mindT -= dt) <= 0) { mindT = 8; askMind(); } } const C = clk(); if (C.stub && G.mode !== 'menu' && !O.dead && !O.won) C.tick(dt);
    O.f = C.frac || 0; O.stage = C.stage || stageAt(O.f); O.pace = O.stage === 'winddown' ? 0.7 : O.stage === 'end' ? 0.5 : 1;
    if (lead() && !O.quiet) { for (const [s, k, what] of BEATS) { const id = s + ':' + what + ':' + k; if (O.fired.has(id)) continue; const i = STAGES.findIndex((x) => x[0] === s); if (O.f > STAGES[i][1] + k * ((STAGES[i + 1]?.[1] ?? 1) - STAGES[i][1]) - 1e-9) { O.fired.add(id); DO[what]?.(); } } if (O.f >= 0.4 && O.f < 0.9) grow(dt); }
    if (O.cough && G.game) for (const c of G.game.customers) if (!c.p.cough && c.state === 'sitting' && O.stage === 'signs' && !O.coughed) { O.coughed = true; mark(c.p); }
    for (let i = O.runners.length - 1; i >= 0; i--) { const r = O.runners[i], P = r.p.root.position; r.p.pose = 'walk'; r.p.speed = r.sp; const dx = Math.sign(r.to - P.x); P.x += dx * r.sp * dt; r.p.root.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2; if (!r.said && Math.abs(P.x) < 4) { r.said = true; r.p.look = camAt().clone(); cry(r.p, r.situation, r.lines); O.sound('shout', P.clone().setY(1.6)); } r.p.update(dt, G.t); if (Math.abs(P.x - r.to) < 0.5) { if (r.h) { r.h.hidden = true; r.h.taken = false; r.h.p.root.visible = false; r.h.t = 9999; } else r.p.root.removeFromParent(); O.runners.splice(i, 1); } }
    // the shutters swing to where they are set
    const want0 = sides.front.down && !sides.front.broke ? 0 : sides.front.broke ? -0.35 : -1.42; shutA += (want0 - shutA) * Math.min(1, dt * 4); sh.rotation.x = shutA; sh.rotation.z = sides.front.broke ? 0.12 : 0; if (!sides.front.down) sides.front.bar = 0;
    for (const k of ['left', 'right', 'back']) sides[k].bar = 0; for (const it of props) { if (it.dead) continue; if (it.held) it.side = null; else { const z = it.free ? null : zoneOf(it.obj.position); if (z && it.side !== z) { it.side = z; if (it.bar <= 0) it.bar = it.barMax * 0.6; } else if (!z) it.side = null; if (it.side && it.bar > 0) sides[it.side].bar += it.bar; } }
    if (lead() && (O.stage === 'winddown' || O.stage === 'end')) { const al = I.alive().filter((z) => !z.leave && !z.inside), over = al.length - (O.stage === 'end' ? 0 : want()); if (over > 0) al.sort((a, b) => b.p.root.position.length() - a.p.root.position.length()).slice(0, over).forEach((z) => (z.leave = true)); }   // fewer and slower: the rest drift off
    I.update(dt); I.sweep(); W.update(dt); AR.update(dt); gore.update(dt); updShelter(dt); updTroop(dt);
    // how you are: the edges and the world darken with hurt and ease back; a heartbeat when low
    if (!me.dead && G.t - me.hurtT > 8 && me.hp < 100) me.hp = Math.min(100, me.hp + dt * 1.5);
    const hurt = me.dead ? (G.guest ? 0.45 : 1) : clamp((100 - me.hp) / 100 + Math.max(0, 1 - (G.t - me.hurtT) / 1.2) * 0.25, 0, 1); shown += (hurt - shown) * Math.min(1, dt * 2.5);
    dark.style.opacity = (shown * 0.95).toFixed(3); vg.material.opacity = shown * 0.9; vg.visible = shown > 0.01; if (G.mode === 'desktop') G.renderer.domElement.style.filter = shown > 0.02 ? `brightness(${(1 - shown * 0.35).toFixed(3)}) saturate(${(1 - shown * 0.5).toFixed(3)})` : '';
    if (!me.dead && me.hp < 55 && (beat -= dt) <= 0) { beat = 0.55 + me.hp / 100; O.sound('heart', camAt()); }
    for (let i = O.noises.length - 1; i >= 0; i--) if (G.t - O.noises[i].t > 10) O.noises.splice(i, 1);
    if (O.stage !== 'normal' && O.stage !== 'signs' && G.hint !== undefined && !me.dead) G.outHint = !sides.front.down && I.alive().length ? 'PULL THE SHUTTERS\' CORD (RIGHT OF THE COUNTER)' : '';
  };
  // ---------- in a shared alley: the page that leads says where the turned are and what they do; the rest draw them
  const ST = ['walk', 'push', 'grab', 'climb', 'rise', 'dead'];
  O.out = () => { if (O.f < 0.3) return null; return { s: O.f, z: I.list.slice(-14).map((z) => [z.id, z.style, +z.p.root.position.x.toFixed(2), +z.p.root.position.z.toFixed(2), +z.p.root.rotation.y.toFixed(2), Math.max(0, ST.indexOf(z.st)), [...(z.p.lost || [])].join(',')]), b: SIDES.map((k) => Math.round(sides[k].bar)), bite: O.bites.splice(0) }; };
  O.bites = []; O.hits = []; const drawn = new Map();
  // the others in the alley (guests from THE MARKET) are prey too: a bite goes to their page in the word; their own blows come back in theirs
  const guestPrey = () => { const W0 = G.live?.watchers; if (!W0) return; for (const [id, w] of W0) { let g = O.guests.get(id); if (!g) O.guests.set(id, g = { id, hp: 100, dead: false, x: () => w.p.root.position.x, z: () => w.p.root.position.z, y: () => 1.5, grabbed() { }, bite() { g.hp -= 26; O.bites.push([id, 26]); if (g.hp <= 0) { g.dead = true; O.note('a guest in the alley fell'); } } }); } for (const id of [...O.guests.keys()]) if (!W0.has(id)) O.guests.delete(id); };
  O.guestHits = (from, list) => { for (const e of Array.isArray(list) ? list : []) { const z = I.list.find((y) => y.id === (e[0] | 0)); if (!z || z.dead) continue; const seg = String(e[2] || 'torso'), at = z.p.root.position.clone().setY(seg === 'head' ? 1.6 : 1.2), dir = z.p.root.position.clone().sub(camAt()).setY(0).normalize(); I.cut(z, { seg, at, dir, sp: 4, J: 6, cut: 0, crush: 1, pierce: 0, dmg: clamp(+e[1] || 0, 0, 40), sever: null }); } };
  // a guest's own staff: a click strikes the nearest of them in front, within reach; a dead guest only watches
  if (G.guest) addEventListener('mousedown', (e) => { if (e.button !== 0 || me.dead || G.mode !== 'desktop') return; const P = G.guestRole?.at || camAt(), yaw = G.guestRole?.yaw ?? 0; let best = null, bd = 1.9; for (const z of I.list) { if (z.dead) continue; const d = z.p.root.position.distanceTo(P), dx = (z.p.root.position.x - P.x) / (d || 1), dz = (z.p.root.position.z - P.z) / (d || 1); if (d < bd && dx * -Math.sin(yaw) + dz * -Math.cos(yaw) > 0.3) { bd = d; best = z; } } if (best) { O.hits.push([best.id, 22, Math.random() < 0.3 ? 'head' : 'torso']); G.audio?.play('set', best.p.root.position); } });
  O.follow = (o) => { if (!o || lead()) return; if (G.clock.stub) G.clock.set(+o.s || 0);
    const seen = new Set(); for (const e of Array.isArray(o.z) ? o.z : []) { const id = e[0]; seen.add(id); let d = drawn.get(id); if (!d) { const p = makePerson(id, String(e[1] || '') || undefined); d = { p, z: I.turn(p, { at: at(+e[2], 0, +e[3]) }) }; d.z.remote = true; drawn.set(id, d); }
      const P = d.p.root.position; P.lerp(at(+e[2], 0, +e[3]), 0.35); d.p.root.rotation.y = +e[4] || 0; d.z.st = ST[e[5] | 0]; if (e[5] === 5 && !d.z.dead) I.kill(d.z, 'cut down'); for (const n of String(e[6] || '').split(',')) if (n && !d.p.lost?.has(n)) d.p.sever?.(n); }
    for (const [id, d] of drawn) if (!seen.has(id)) { d.p.root.removeFromParent(); I.list.splice(I.list.indexOf(d.z), 1); drawn.delete(id); }
    for (const [to, n] of Array.isArray(o.bite) ? o.bite : []) if (String(to) === G.live?.me) me.harm(+n || 0); };
  return O;
}
