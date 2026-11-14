// EYES DOWN: New York, 1985, your apartment after eleven. Do your evening as always while black things wait where your chores make you look; never meet their eyes. This file is the night (chores, the clock, the phone, sleep), the visitors' director and mind, hunts, the signs you read, and the loop
import { THREE, Q, LOW, clamp, lerp, rnd, pick, renderer, scene, camera, rig, P, CLOCK, initPhysics, loadAssets, mergeStatics, RAPIER, ray } from './core.js';
import { CITY, build as buildCity, update as cityUpdate } from './city.js';
import { ROOM, build as buildRoom, update as roomUpdate } from './room.js';
import { THEM, build as buildThem, update as themUpdate, setSpot, away, approach, inView, head as HEAD, creep, navBuild } from './them.js';
import { PL } from './player.js';
import { A } from './sound.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = id => document.getElementById(id), keep = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
const G = { mode: 'title', night: 1, min: 0, chores: [], done: {}, hold: {}, cur: null, hunt: null, sleep: null, phone: null, events: [], log: [], notes: [], thoughts: [], composure: 100, flinches: 0, close: 0, hideMem: null, deaths: 0, why: '', t: 0, card: null, dark: 0, red: 0, paused: false, mindOK: Q.get('mind') !== 'local', mindBusy: false, mindT: 4, mindWhy: '', name: keep('eyes.name') || '' };
const NIGHTS = {
  1: { them: 1, chores: ['chain', 'cook', 'eat', 'news', 'phone', 'dishes', 'teeth', 'bed'] },
  2: { them: 2, chores: ['chain', 'milk', 'cook', 'eat', 'news', 'phone', 'dishes', 'teeth', 'bed'] },
  3: { them: 3, chores: ['chain', 'cook', 'eat', 'news', 'phone', 'dishes', 'teeth', 'alarm', 'bed'], cut: true },
  4: { them: 4, chores: ['chain', 'milk', 'cook', 'eat', 'coat', 'news', 'phone', 'dishes', 'teeth', 'alarm', 'bed'], cut: true, knock: true },
  5: { them: 6, chores: ['chain', 'milk', 'cook', 'eat', 'coat', 'news', 'phone', 'dishes', 'teeth', 'alarm', 'bed'], cut: true, knock: true, finale: true } };
// each chore: what you do, where, and for how long; where they like to wait for it
const CHORES = {
  chain: { text: 'Chain the front door', use: 'chain', spots: ['closet', 'kitchen'] },
  milk: { text: 'Get the milk out of the fridge', use: 'fridge', take: 'milk', spots: ['fridge', 'corner'] },
  cook: { text: 'Heat dinner on the stove', use: 'stove', hold: 14, near: [1.15, .9], r: 1.3, spots: ['kitchen', 'corner', 'vent'] },
  eat: { text: 'Eat at the table', use: 'table', seat: 'table', hold: 14, after: 'cook', spots: ['table', 'kitchen'] },
  news: { text: 'Watch the late news', use: 'sofa', seat: 'sofa', hold: 24, tv: true, spots: ['sofa', 'tvcorner', 'corner'] },
  phone: { text: 'Answer the telephone', use: 'phone', ring: true, spots: ['closet', 'kitchen'] },
  dishes: { text: 'Wash the dishes', use: 'sink', hold: 10, near: [1.85, .95], r: .9, after: 'eat', spots: ['vent', 'kitchen', 'fridge'] },
  teeth: { text: 'Brush your teeth', use: 'basin', hold: 12, near: [5.75, 3.85], r: .8, spots: ['mirror', 'tub'] },
  alarm: { text: 'Set the alarm clock', use: 'alarmclock', spots: ['bedfoot', 'window'] },
  coat: { text: 'Hang your coat in the closet', use: 'closet', spots: ['closet', 'tvcorner'] },
  bed: { text: 'Lights out, and go to bed', use: 'bed', last: true, spots: ['bedfoot', 'underbed', 'ceilingbed', 'window'] },
  leave: { text: 'Get up and go to work', use: 'front', spots: ['bedfoot'] } };
const LINES = { mom: ['Honey? It\'s Mom. I know it\'s late.', 'I saw the news. All those people missing in your building.', 'Are you eating? You sound tired.', 'Lock your door tonight. Promise me.', 'Okay. I love you. Goodnight.'],
  them: ['I know you\'re awake.', 'Look at me.', 'You see us.', 'Turn around.', 'We are always here.', 'Your eyes moved.', 'Don\'t you want to look?', 'Goodnight.'],
  phoneThem: ['...', 'Who\'s there with you?', 'Don\'t turn around.'] };
document.body.appendChild(renderer.domElement);

/* signs: one rides low in your sight (the time, what to do, what is said), one stands in the room (start, the end of a night) */
const sign = (w, h, pw, ph) => { const c = document.createElement('canvas'); c.width = pw; c.height = ph; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 60; return { m, g: c.getContext('2d'), t, c }; };
const hud = sign(.56, .28, 1024, 512), board = sign(1.4, .9, 1024, 660); hud.m.position.set(0, -.04, -.62); camera.add(hud.m); board.m.visible = false; scene.add(board.m);
// your eyelids: black that closes over everything
const lid = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })); lid.position.z = -.12; lid.renderOrder = 55; camera.add(lid);
const blood = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: 0x5a0000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })); blood.position.z = -.11; blood.renderOrder = 56; camera.add(blood);
const watch = sign(.11, .11, 256, 256); let watchOn = null;
function wrap(g, text, x, y, w, lh) { const words = String(text).split(' '); let line = ''; for (const wd of words) { const tl = line ? line + ' ' + wd : wd; if (g.measureText(tl).width > w && line) { g.fillText(line, x, y); y += lh; line = wd; } else line = tl; } if (line) g.fillText(line, x, y); return y + lh; }
const clockText = () => { const m = Math.floor(G.min), h = (23 + Math.floor(m / 60)) % 24, mm = m % 60, h12 = h % 12 || 12; return h12 + ':' + String(mm).padStart(2, '0') + (h >= 12 && h < 24 && h !== 0 ? ' PM' : ' AM'); };
let sub = { text: '', t: 0, who: '' }, prompt = '';
let lastHud = '';
function drawHud() {
  const xr = renderer.xr.isPresenting, live = G.mode === 'play' || G.mode === 'sleep' || G.mode === 'hunt'; hud.m.visible = xr;
  const c = CHORES[G.doing || G.cur], line = live && PL.keys.Tab ? G.chores.map(id => (G.done[id] ? '✓ ' : '· ') + CHORES[id].text).join('\n') : live && c && G.mode === 'play' ? c.text + progressText() : '', time = live ? clockText() + ' · night ' + G.night : '', said = sub.text && sub.t > 0 ? sub.text : '';
  if (!xr) { const k = [time, line, prompt, said, sub.who].join('|'); if (k !== lastHud) { lastHud = k; $('h-time').textContent = time; $('h-do').textContent = line; $('h-use').textContent = prompt; $('h-say').textContent = said; $('h-say').className = sub.who === 'them' ? 'them' : ''; } $('hud').hidden = !live; return; }
  $('hud').hidden = true; const g = hud.g, W = 1024, H = 512; g.clearRect(0, 0, W, H); if (!live) { hud.t.needsUpdate = true; return; }
  g.shadowColor = '#000'; g.shadowBlur = 8;
  if (prompt) { g.textAlign = 'center'; g.font = '500 30px ui-monospace,Menlo,monospace'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(prompt, W / 2, 300); }
  if (said) { g.textAlign = 'center'; g.font = 'italic 400 36px Georgia,serif'; g.fillStyle = sub.who === 'them' ? 'rgba(210,225,210,.85)' : 'rgba(255,240,215,.9)'; wrap(g, said, W / 2, 360, 900, 42); }
  g.shadowBlur = 0; hud.t.needsUpdate = true;
}
const progressText = () => { const id = G.doing || G.cur, c = CHORES[id]; if (!c || !c.hold) return ''; const p = (G.hold[id] || 0) / c.hold; return p > 0 ? '  ' + '■'.repeat(Math.round(p * 8)) + '□'.repeat(8 - Math.round(p * 8)) : ''; };
// a watch on your left wrist in the headset: the time and what is left to do
function drawWatch() { const g = watch.g; g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(8,10,8,.85)'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#9fffb8'; g.font = '700 46px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(clockText(), 128, 60);
  g.font = '500 19px ui-monospace,monospace'; g.textAlign = 'left'; let y = 100; for (const id of G.chores) { const d = G.done[id]; g.fillStyle = d ? 'rgba(160,255,190,.35)' : id === G.cur ? '#eaffef' : 'rgba(200,255,215,.75)'; g.fillText((d ? '✓ ' : '· ') + CHORES[id].text.slice(0, 22), 12, y); y += 22; if (y > 250) break; } watch.t.needsUpdate = true; }
function drawBoard(title, lines, foot) { const g = board.g, W = 1024, H = 660; g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(6,6,8,.92)'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,220,180,.25)'; g.strokeRect(14, 14, W - 28, H - 28);
  g.textAlign = 'center'; g.fillStyle = '#efe5d2'; g.font = '400 64px Georgia,serif'; g.fillText(title, W / 2, 110); g.font = '400 28px Georgia,serif'; g.fillStyle = 'rgba(230,220,200,.85)'; let y = 180; for (const l of lines) y = wrap(g, l, W / 2, y, 880, 38) + 6;
  if (foot) { g.font = '500 24px ui-monospace,monospace'; g.fillStyle = 'rgba(255,200,150,.8)'; g.fillText(foot, W / 2, H - 46); } board.t.needsUpdate = true; }
function showBoard(on) { board.m.visible = on; if (on) { camera.getWorldPosition(_a); camera.getWorldDirection(_b); board.m.position.copy(_a).addScaledVector(_b, 1.3); board.m.lookAt(_a); } }
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
A.onSay = (text, o) => { sub = { text: (o.whisper ? '' : '') + text, t: 2.5 + text.length * .06, who: o.who || 'them' }; };

/* the look on a screen: depth of field that finds what you look at, glow, grain, a little colour fringing; none of it in the headset */
let comp = null, bokeh = null, grain = null, focus = 2;
const FILM = { uniforms: { tDiffuse: { value: null }, t: { value: 0 }, amt: { value: .07 }, vig: { value: 1.5 }, ca: { value: .0016 }, shut: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float t, amt, vig, ca, shut; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + t*7.) * 43758.5453); }
    void main(){ vec2 d = vUv - .5; float r2 = dot(d,d); vec2 o = d * ca * (1. + r2*4.);
      vec3 c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b);
      c *= mix(1., smoothstep(.85, .1, r2 * vig * 1.6), .92); c = clamp(c, 0., 1.); float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, .75); c = max(c - .01, 0.) * 1.04; c = c * c * (3. - 2. * c) * .3 + c * .7; c += (h(vUv) - .5) * amt * (1. - l * .6); gl_FragColor = vec4(c, 1.); }` };
function post() { if (comp || Q.get('post') === '0') return; comp = new EffectComposer(renderer); comp.addPass(new RenderPass(scene, camera));
  bokeh = new BokehPass(scene, camera, { focus: 2, aperture: .0006, maxblur: .0045 }); comp.addPass(bokeh); const br = bokeh.render.bind(bokeh); bokeh.render = (...a) => { const rf = ROOM.mirror && ROOM.mirror.rf, v = rf && rf.visible; if (rf) rf.visible = false; br(...a); if (rf) rf.visible = v; };
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .16, .4, 1.0)); comp.addPass(new OutputPass()); grain = new ShaderPass(FILM); comp.addPass(grain);
  addEventListener('resize', () => comp.setSize(innerWidth, innerHeight)); }

/* physics, and what bumping sounds like */
let eq = null; const KS = { plate: 1.4, metal: 1.1, book: .8, soft: .3, wood: .9, plastic: 1.2, carton: .6 };
function physics(dt) { P.world.timestep = dt; P.world.step(eq); eq.drainContactForceEvents(e => { const T = P.byCol.get(e.collider1()) || P.byCol.get(e.collider2()); if (!T || T.fixed || CLOCK.t - (T.lastHit || 0) < .15) return; T.lastHit = CLOCK.t; const f = clamp(e.totalForceMagnitude() / (T.mass * 60), .05, 1); A.play(T.kind === 'plate' ? 'glass' : 'hit', T.b.translation(), f * (KS[T.kind] || .8)); T.plT = CLOCK.t; });
  for (const T of P.things) { const t = T.b.translation(), q = T.b.rotation(); T.o.position.set(t.x, t.y, t.z); T.o.quaternion.set(q.x, q.y, q.z, q.w); if (t.y < -2) { T.b.setTranslation(T.home.p, true); T.b.setLinvel({ x: 0, y: 0, z: 0 }, true); } } }

/* the night */
function startNight(n) {
  G.night = n; const N = NIGHTS[n]; G.chores = [...N.chores]; G.done = {}; G.hold = {}; G.min = 0; G.mode = 'play'; G.hunt = null; G.sleep = null; G.flinches = 0; G.close = 0; G.composure = 100; G.hideMem = null; G.thoughts = []; G.log = []; G.why = ''; G.t = 0; G.red = 0; G.cutDone = !N.cut; G.knockDone = !N.knock; G.stayer = null;
  G.phone = { at: rnd(40, 70), ringing: false, rings: 0, call: null, fake: false }; G.messes = {}; G.ignored = 0;
  ROOM.radio.on = false; ROOM.blender.on = false; ROOM.tap.on = false; ROOM.lights.bath.on = true;
  ROOM.power = true; ROOM.lights.main.on = true; ROOM.lights.bed.on = false; ROOM.tv.on = false; ROOM.tv.msg = ''; ROOM.fridge.open = false; ROOM.bathDoor.shut = false; ROOM.chain = false; ROOM.chainMesh.visible = false; ROOM.chainLoose.visible = true; ROOM.stove.on = false; ROOM.stove.heat = 0; ROOM.closet.want = .18;
  for (const T of P.things) { T.b.setTranslation(T.home.p, true); T.b.setRotation(T.home.q, true); T.b.setLinvel({ x: 0, y: 0, z: 0 }, true); T.b.setAngvel({ x: 0, y: 0, z: 0 }, true); }
  THEM.list.forEach((C, i) => { away(C); C.sus = 0; C.contact = 0; C.noticed = false; C.active = i < N.them; C.enterAt = 20 + i * rnd(25, 45); C.dwell = 0; C.testAt = rnd(25, 50); C.glances = C.stareSec = C.flinches = C.backs = 0; C.cool = 0; });
  PL.place(.75, 4.3, Math.PI * .9); PL.frozen = false; showBoard(false); G.cur = nextChore(); A.duck(.9);
  if (A.c) A.play('doorShut', new THREE.Vector3(.75, 1, 5));
  say(n === 1 ? 'Home. Lock up, eat, and get some sleep.' : n === 5 ? 'Friday. One more night.' : 'Another night.', { who: 'you', silent: true });
  G.log.push({ t: 0, what: 'came home' });
}
function nextChore() { return G.chores.find(id => ready(id) && !(CHORES[id].last && G.chores.some(o => o !== id && !G.done[o] && !CHORES[o].last)) && !(id === 'phone' && !G.phone.ringing)) || null; }
function say(text, o = {}) { if (o.silent) { sub = { text, t: 3 + text.length * .05, who: o.who || 'you' }; return; } A.say(text, o); }
function finish(id) { if (G.done[id]) return; G.done[id] = true; G.log.push({ t: Math.round(G.t), what: 'did: ' + CHORES[id].text }); A.play('click', PL.head, .3); G.cur = nextChore(); }
// which chore you are doing right now, if any: sitting in its seat, or standing at it with your eyes open
const ready = id => !G.done[id] && (!CHORES[id].after || G.done[CHORES[id].after]);
function busyWith() { if (PL.eyesShut) return null; for (const id of G.chores) { const c = CHORES[id]; if (!c.hold || !ready(id)) continue;
  if (c.seat && PL.seat === ROOM.seats[c.seat] && (!c.tv || (ROOM.tv.on && ROOM.power))) return id;
  if (c.near && !PL.seat && Math.hypot(PL.pos.x - c.near[0], PL.pos.z - c.near[1]) < c.r && (id !== 'cook' || ROOM.stove.on) && (ROOM.power || id !== 'news')) return id; } return null; }

// using something: what it does for your chores
PL.onUse = U => {
  if (G.mode === 'title' || G.mode === 'dead' || G.mode === 'won') return;
  const id = U.act ? U.act() : U.id;
  if (G.mode === 'hunt') { if (id === 'bed' && G.hunt.phase === 'dark') { PL.sit(ROOM.seats.bed); PL.covered = true; A.play('whoosh', PL.head, .5); } return; }
  if (id === 'chain' && ROOM.chain && G.chores.includes('chain')) finish('chain');
  if (id === 'fridge' && ROOM.fridge.open && G.chores.includes('milk') && !G.done.milk) { /* the milk is taken by hand */ }
  if (id === 'table' || id === 'sofa') { const S = ROOM.seats[id === 'table' ? 'table' : 'sofa']; PL.sit(S); if (id === 'sofa' && !ROOM.tv.on) { ROOM.tv.on = true; A.play('click', ROOM.tv.pos); } }
  if (id === 'phone') answerPhone();
  if (id === 'switch') { if (!ROOM.lights.main.on && G.mode === 'play') say('Lights out.', { silent: true, who: 'you' }); }
  if (id === 'alarmclock' && G.mode === 'sleep' && G.sleep.alarm) { G.sleep.alarm = 0; A.play('click', ROOM.alarm.b.translation()); return; }
  if (id === 'alarmclock') finish('alarm');
  if (id === 'closet' && G.chores.includes('coat') && !G.done.coat && ROOM.closet.want > 1) finish('coat');
  if (id === 'bed') { if (G.mode === 'sleep') PL.sit(ROOM.seats.bed); else goToBed(); }
  if (id === 'front' && G.cur === 'leave') { if (ROOM.chain) { say('The chain.', { silent: true, who: 'you' }); return; } winGame(); }
};
PL.onTake = T => { if (T === ROOM.milk && G.chores.includes('milk') && !G.done.milk) finish('milk'); };
PL.onStand = () => { if (PL.seat) PL.stand(); };
// the table and the sofa are used by sitting on them
ROOM.uses.push({ id: 'table', label: 'the table', pos: new THREE.Vector3(.65, .6, 2.65), r: 1.1 });
ROOM.uses.push({ id: 'alarmclock', label: 'the alarm clock', pos: new THREE.Vector3(5.5, .7, .32), r: 1.0 });

/* the phone: it rings once a night, and it is Mom; on later nights it rings again with nobody there */
function phoneTick(dt) {
  const F = G.phone; if (!F) return; if (!F.ringing && !F.call && !G.done.phone && G.t > F.at && G.mode === 'play' && Object.keys(G.done).length >= 2) { F.ringing = true; F.rt = 0; F.fake = false; G.cur = nextChore(); }
  if (F.ringing) { F.rt += dt; if ((F.rt % 4) < dt) A.play('ring', ROOM.phone.pos, 1); if (F.rt > 26) { F.ringing = false; F.at = G.t + rnd(25, 45); G.cur = nextChore(); } }
  if (F.call) { F.call.t += dt; const L = F.fake ? LINES.phoneThem : LINES.mom, i = Math.floor(F.call.t / 3.6); if (i !== F.call.i && i < L.length) { F.call.i = i; A.say(L[i], { who: F.fake ? 'them' : 'mom', whisper: F.fake, rate: F.fake ? .5 : 1.02 }); } if (F.call.t > L.length * 3.6 + .5) { F.call = null; ROOM.phone.hs.position.x = .045; if (!F.fake) finish('phone'); } }
}
function answerPhone() { const F = G.phone; if (!F.ringing) return; F.ringing = false; F.call = { t: 0, i: -1 }; ROOM.phone.hs.position.x = .3; G.log.push({ t: Math.round(G.t), what: F.fake ? 'answered the phone; nobody there' : 'answered the phone' }); }

/* bed: the light must be off; then you lie there until six, eyes shut if you like */
function goToBed() {
  if (G.mode !== 'play') return; if (G.cur !== 'bed') { say('Not yet. ' + (G.cur ? CHORES[G.cur].text + '.' : ''), { silent: true, who: 'you' }); return; }
  if (ROOM.lights.main.on && ROOM.power) { say('The big light is still on.', { silent: true, who: 'you' }); return; }
  PL.sit(ROOM.seats.bed); G.mode = 'sleep'; G.sleep = { t: 0, next: rnd(8, 14), alarm: 0, from: G.min, n: 0, alarmLeft: G.night >= 3 ? 1 : 0 }; ROOM.tv.on = false; finish('bed'); A.duck(.75);
  for (const C of THEM.list) if (C.active && C.state !== 'away' && !['bedfoot', 'underbed', 'ceilingbed', 'window'].includes(C.spot)) away(C);
}
function sleepTick(dt) {
  const S = G.sleep; S.t += dt; G.min = lerp(S.from, 420, clamp(S.t / 110, 0, 1));
  if (PL.seat !== ROOM.seats.bed && !Object.keys(G.messes).length && !S.alarm) { if (!S.warned) { S.warned = true; for (const C of THEM.list) if (C.state !== 'away') C.sus += .3; } }
  S.next -= dt; if (S.next < 0) { S.next = rnd(10, 18); S.n++; const act = THEM.list.filter(C => C.active);
    const r = Math.random(); if (S.t > 20 && !S.messed && r < .3 && act.length) { S.messed = true; const C = pick(act); mess(C, pick(['radio', 'tv', 'tap', 'bathlight', 'fridge'])); } else if (S.alarmLeft && S.t > 35) { S.alarmLeft = 0; S.alarm = 9; A.play('alarm', ROOM.alarm.b.translation(), 1); }
    else if (r < .45 && act.length) { const C = pick(act); const sp = pick(['bedfoot', 'underbed', 'ceilingbed', 'window'].filter(s => !THEM.list.some(o => o.spot === s && o.state !== 'away'))); if (sp && !seenNow(ROOM.spots[sp].pos)) { setSpot(C, sp); A.play('slither', ROOM.spots[sp].pos, .7); } }
    else if (r < .7 && act.length) { const C = pick(act); if (C.state !== 'away') A.say(pick(LINES.them), { whisper: true, pos: C.pos, cancel: true }); }
    else if (act.length && S.n > 2) { const C = pick(act); if (C.state === 'away' || C.vis === 0) { C.pos.copy(PL.head); approach(C, 6); A.play('breathe', PL.head, .8); } } }
  if (S.alarm > 0) { S.alarm -= dt; if ((S.alarm % .5) < dt) A.play('alarm', ROOM.alarm.b.translation(), .8); if (S.alarm <= 0) { for (const C of THEM.list) if (C.state !== 'away') C.sus += .45; say('Who sleeps through an alarm?', { silent: true, who: 'them' }); } }
  if (G.min >= 420) dawn();
}
function dawn() {
  const N = NIGHTS[G.night]; if (N.finale && !G.stayer) { G.stayer = THEM.list.find(C => C.active) || THEM.list[0]; for (const C of THEM.list) if (C !== G.stayer) away(C); setSpot(G.stayer, 'bedfoot'); G.mode = 'play'; G.chores.push('leave'); G.cur = 'leave'; ROOM.lights.out.hemi.color.set(0x8a8f9a); say('Six. It is still there. Get up and go.', { silent: true, who: 'you' }); return; }
  for (const C of THEM.list) away(C); G.mode = 'won'; PL.frozen = true; A.duck(.6); const grade = Math.round(clamp(G.composure, 0, 100));
  saveProgress(Math.max(G.night + 1, +keep('eyes.night') || 1)); drawBoard('6:00 AM', ['Grey light through the rain. They are gone back into the walls.', 'Composure: ' + grade + '%', ...G.thoughts.slice(-2).map(t => '"' + t + '"')], G.night < 5 ? 'NEXT NIGHT: trigger / E' : ''); showBoard(true); G.card = 'won';
}
function winGame() { for (const C of THEM.list) away(C); G.mode = 'won'; PL.frozen = true; saveProgress(1); drawBoard('Friday, 7:40 AM', ['You lock the door behind you and walk to the elevator without looking back.', 'Five nights. You never once looked them in the eye.'], 'AGAIN: trigger / E'); showBoard(true); G.card = 'end'; }

/* the visitors: where they go, what they try; Claude's orders when it is thinking, instinct otherwise */
const seenNow = p => inView(p, .7);
function director(dt) {
  const act = THEM.list.filter(C => C.active);
  for (const C of act) {
    if (C.state === 'hunt' || C.test === 'approach') continue;
    // a creeper gives up after a while, or once you have stood looking at it; it goes while you look away
    if (C.state === 'creep') { if (C.vis) C.seenFor = (C.seenFor || 0) + dt; if (!C.vis && (C.creepT > 32 || (C.seenFor || 0) > 7)) { away(C); C.seenFor = 0; C.enterAt = G.t + rnd(8, 20); } continue; }
    C.cool -= dt;
    if (C.state === 'away') { if (G.t > C.enterAt && G.mode === 'play') { const sp = C.want || choose(C); if (!C.want && (C.creepIn ?? (C.creepIn = Math.random() < .4))) { C.creepIn = undefined; creep(C); G.log.push({ t: Math.round(G.t), what: 'one came in crawling' }); continue; } if (sp && !seenNow(ROOM.spots[sp].pos)) { setSpot(C, sp); C.want = null; C.dwell = rnd(18, 40); if (Math.random() < .5) A.play('slither', ROOM.spots[sp].pos, .5); G.log.push({ t: Math.round(G.t), what: 'one came in' }); } } continue; }
    C.dwell -= dt;
    if (C.dwell < 0 || (C.want && C.want !== C.spot)) { const sp = C.want || choose(C); if (sp && sp !== C.spot && !seenNow(C.pos) && !seenNow(ROOM.spots[sp].pos)) { setSpot(C, sp); C.want = null; C.dwell = rnd(18, 40); } }
    // tests
    C.testAt -= dt; const T = C.wantTest; if ((T || C.testAt < 0) && G.mode === 'play') { C.testAt = rnd(30, 60) - C.sus * 20; C.wantTest = null; doTest(C, T || pickTest(C)); }
  }
}
function choose(C) { const cur = G.cur && CHORES[G.cur]; let opts = cur ? [...cur.spots] : ['corner', 'kitchen']; if (Math.random() < .3) opts = Object.keys(ROOM.spots).filter(s => s !== 'face');
  opts = opts.filter(s => !THEM.list.some(o => o !== C && o.spot === s && o.state !== 'away')); if (G.mode === 'play') opts = opts.filter(s => !['underbed', 'ceilingbed'].includes(s) || G.cur === 'bed'); return opts.length ? pick(opts) : null; }
function pickTest(C) { const r = Math.random(); if (r < .22) return 'creep'; if (r < .45) return 'mess'; if (r < .4) return 'move'; if (C.sus > .4 && r < .45) return 'approach'; if (r < .3) return 'drop'; if (r < .5) return 'whisper'; if (r < .62 && G.night >= 2) return 'knock'; if (r < .72 && G.night >= 2 && !G.phone.ringing && !G.phone.call && G.done.phone) return 'ring'; if (r < .8) return 'channel'; return 'approach'; }
function doTest(C, kind) {
  G.log.push({ t: Math.round(G.t), what: 'a test: ' + kind });
  if (kind === 'approach') { if (C.vis) return; C.pos.copy(PL.head).addScaledVector(PL.fwd, -1.5); approach(C, rnd(5, 8)); A.play('breathe', PL.head, .7); return; }
  if (kind === 'drop') { let best = null, bd = 2.2; for (const T of P.things) { const p = T.b.translation(), d = Math.hypot(p.x - C.pos.x, p.z - C.pos.z); if (d < bd && p.y > .4) { bd = d; best = T; } } if (best) { const m = best.mass; best.b.applyImpulse({ x: rnd(-1, 1) * m * 1.5, y: m * .8, z: rnd(-1, 1) * m * 1.5 }, true); C.flinchT = CLOCK.t; } return; }
  if (kind === 'whisper') { const line = C.line || pick(LINES.them); C.line = ''; A.say(G.name && Math.random() < .4 ? G.name + '.' : line, { whisper: true, pos: C.pos }); C.flinchT = CLOCK.t; return; }
  if (kind === 'knock') { A.play('knock', new THREE.Vector3(.75, 1.2, 5.1), 1); C.flinchT = CLOCK.t; return; }
  if (kind === 'ring') { G.phone.ringing = true; G.phone.rt = 0; G.phone.fake = true; return; }
  if (kind === 'creep') { if (!C.vis) creep(C); return; }
  if (kind === 'mess') { mess(C, C.thing || null); C.thing = null; return; }
  if (kind === 'move') { moveThing(C); return; }
  if (kind === 'channel') { if (ROOM.tv.on) { ROOM.tv.ch = 2; ROOM.tv.msg = pick(['LOOK AT IT', 'IT SEES YOU', 'EYES DOWN', 'DON\'T']); setTimeout(() => { ROOM.tv.msg = ''; ROOM.tv.ch = 0; }, 1600); C.flinchT = CLOCK.t; } return; }
}

/* their tricks: something switched on, opened, left running, the light put out, a thing of yours moved. Anyone would go and put it right; somebody who leaves it, as if they knew who did it, is noticed. They do it from beside the thing. */
function mess(C, id) {
  const ids = Object.keys(ROOM.dev).filter(k => !ROOM.dev[k].is() && !G.messes[k] && !(k === 'light' && (G.mode === 'sleep' || G.cur === 'bed')) && !(k === 'tv' && G.doing === 'news') && !(k === 'stove' && G.cur === 'cook'));
  id = id && ids.includes(id) ? id : pick(ids); if (!id) return; const D = ROOM.dev[id];
  if (C.state !== 'away' && C.spot !== D.spot && !seenNow(C.pos) && !seenNow(ROOM.spots[D.spot].pos)) setSpot(C, D.spot);
  D.set(true); G.messes[id] = { t: G.t, C }; A.play('click', D.at(), .6); if (id === 'fridge') A.play('fridgeOpen', D.at(), .8); if (id === 'closet' || id === 'bathdoor') A.play(id === 'bathdoor' ? 'doorShut' : 'doorOpen', D.at(), .8);
  G.log.push({ t: Math.round(G.t), what: 'they turned on / opened ' + D.label });
}
function moveThing(C) { const T = pick(P.things.filter(T => !seenNow(new THREE.Vector3(T.b.translation().x, T.b.translation().y, T.b.translation().z)))); if (!T) return;
  const to = pick([[3.3, .6, 2.4], [6.45, .75, 1.3], [6.6, .3, 4.3], [2.5, .6, 3.9], [.9, 1.0, 4.4], [4.5, .02, 1.5]]); const p = new THREE.Vector3(to[0], to[1], to[2]); if (seenNow(p)) return;
  T.b.setTranslation({ x: p.x, y: p.y, z: p.z }, true); T.b.setLinvel({ x: 0, y: 0, z: 0 }, true); G.log.push({ t: Math.round(G.t), what: 'they moved ' + (T.name || 'a thing') }); }
const expected = id => (id === 'tv' && G.doing === 'news') || (id === 'stove' && G.cur === 'cook') || (id === 'tap' && G.doing === 'dishes') || (id === 'light' && (G.cur === 'bed' || G.mode === 'sleep')) || (id === 'fridge' && G.cur === 'milk');
function messTick(dt) { let open = 0; for (const id in G.messes) { const M = G.messes[id]; if (!ROOM.dev[id].is() || expected(id)) { delete G.messes[id]; G.log.push({ t: Math.round(G.t), what: 'put right ' + ROOM.dev[id].label }); continue; } if (G.t - M.t > 22) open++; }
  if (open) { G.ignored += dt; for (const C of THEM.list) if (C.state === 'wait') C.sus += dt * .035 * open; } }

/* hunts: the lights die; four seconds to hide behind the bathroom door or under the covers, and keep your eyes shut */
THEM.onEvent = (kind, C) => {
  if (kind === 'notice') { A.play('wetclick', C.pos, 1); G.close++; G.composure -= 6; }
  if (kind === 'escaped') { G.log.push({ t: Math.round(G.t), what: 'looked away from its eyes just in time' }); }
  if (kind === 'flinch') { G.flinches++; G.composure -= 7; G.log.push({ t: Math.round(G.t), what: 'flinched' }); }
  if (kind === 'seen' && C.vis) G.composure -= .5;
  if ((kind === 'contact' || kind === 'suspect') && !G.hunt && (G.mode === 'play' || G.mode === 'sleep')) startHunt(C, kind);
  if (kind === 'drip' && Math.random() < .3) A.play('drip', C, .3);
  if (kind === 'touch') { A.play('breathe', PL.head, .9); C.flinchT = CLOCK.t; for (const H of PL.hands) { const a = H.src && H.src.gamepad && H.src.gamepad.hapticActuators && H.src.gamepad.hapticActuators[0]; try { a && a.pulse(.6, 300); } catch (e) {} } }
  if (kind === 'scrape') A.play(Math.random() < .5 ? 'slither' : 'step', C.pos, .3);
  if (kind === 'approachDone') { C.state = 'wait'; C.spot = null; C.dwell = -1; C.pose = 'stand'; C.pos.y = 0; C.upd = 0; if (!C.vis) away(C); }
};
function startHunt(C, why) {
  G.hunt = { C, phase: 'dark', t: 0, why, prev: G.mode }; G.mode = 'hunt'; ROOM.power = false; C.state = 'hunt'; C.test = null; C.approach = null; A.play('shriek', C.pos, 1.2); C.root.visible = true;
  G.why = why === 'contact' ? 'It saw you see it.' : 'You gave yourself away.'; G.log.push({ t: Math.round(G.t), what: 'it hunts (' + why + ')' });
  for (const o of THEM.list) if (o !== C) away(o);
}
function hidden() { const inBath = PL.pos.x > 5.12 && PL.pos.z > 3.08 && ROOM.bathDoor.shut; if (inBath) return 'bathroom'; if (PL.seat === ROOM.seats.bed && PL.covered) return 'bed'; return null; }
function huntTick(dt) {
  const H = G.hunt; H.t += dt;
  if (H.phase === 'dark') { if (H.t > 4) { const h = hidden(); H.where = h; if (!h) { H.phase = 'rush'; H.t = 0; const C = H.C; C.pose = 'stand'; C.pos.copy(PL.pos).addScaledVector(PL.fwd.clone().setY(0).normalize(), 3); C.yaw = Math.atan2(PL.pos.x - C.pos.x, PL.pos.z - C.pos.z); C.root.visible = true; C.upd = 0; }
      else { H.phase = 'search'; H.t = 0; const C = H.C; if (h === 'bathroom') { C.pose = 'stand'; C.pos.set(4.6, 0, 3.7); C.yaw = Math.PI / 2; } else { C.pose = 'stand'; C.pos.set(5.6, 0, 1.6); C.yaw = Math.PI / 2; } C.root.visible = true; C.upd = 0; H.same = G.hideMem === h; } } return; }
  if (H.phase === 'rush') { const C = H.C; _a.subVectors(PL.pos, C.pos).setY(0); const d = _a.length(); C.pos.addScaledVector(_a.normalize(), Math.min(d, dt * 3.4)); C.yaw = Math.atan2(_a.x, _a.z); if (d < .75) die(G.why); return; }
  if (H.phase === 'search') { const C = H.C, h = H.where; if ((H.t % 2.2) < dt) A.play(h === 'bathroom' ? 'knock' : 'breathe', C.pos, h === 'bathroom' ? .5 : .9);
    if (H.same && H.t > 2.5) { if (h === 'bathroom') { ROOM.bathDoor.shut = false; } C.pos.copy(PL.head); die('It looked where you hid last time.'); return; }
    if (h === 'bathroom' && !PL.eyesShut && H.t > .6 && C.vis) { die('You opened your eyes.'); return; }
    if (h === 'bed' && (PL.seat !== ROOM.seats.bed || (!PL.eyesShut && C.vis && !PL.covered))) { die('You moved.'); return; }
    if (!hidden()) { die('You came out too soon.'); return; }
    if (H.t > 8) { A.play('slither', C.pos, .6); away(C); C.sus = .35; C.cool = 30; G.hideMem = h; ROOM.power = true; G.mode = H.prev === 'sleep' ? 'sleep' : 'play'; if (G.mode === 'play' && PL.seat === ROOM.seats.bed) PL.stand(); G.hunt = null; say('It\'s gone. For now.', { silent: true, who: 'you' }); G.composure -= 15; } }
}
function die(why) {
  const C = G.hunt ? G.hunt.C : THEM.list[0]; G.mode = 'dead'; G.deaths++; PL.frozen = true; A.play('scare', PL.head, 1.4); A.hush();
  C.pose = 'face'; camera.getWorldDirection(_b); C.pos.copy(PL.head).addScaledVector(_b, .32); C.yaw = Math.atan2(-_b.x, -_b.z); C.root.visible = true; C.upd = 0; C.noticed = true; G.red = 1;
  setTimeout(() => { for (const o of THEM.list) away(o); drawBoard('NIGHT ' + G.night + ' · ' + clockText(), [why, ...(G.thoughts.length ? ['"' + G.thoughts[G.thoughts.length - 1] + '"'] : [])], 'TRY THE NIGHT AGAIN: trigger / E'); showBoard(true); G.card = 'dead'; G.lidLock = 0; }, 1500);
}

/* Claude: every few seconds the visitors' one mind is told what they saw of you, and orders each of them */
async function think() {
  if (!G.mindOK || G.mindBusy || (G.mode !== 'play' && G.mode !== 'sleep')) return; G.mindBusy = true;
  const them = THEM.list.filter(C => C.active).map(C => ({ id: 'v' + C.id, kind: C.kind, at: C.state === 'away' ? 'away' : C.spot || 'moving', suspicion: Math.round(clamp(C.sus, 0, 1) * 100) / 100, glanced_at: C.glances, stared_sec: Math.round(C.stareSec), flinches: C.flinches, backed_off: Math.round(C.backs * 10) / 10 }));
  const body = { night: G.night, clock: clockText(), sleeping: G.mode === 'sleep', chore: G.cur || 'none', done: Object.keys(G.done), room: PL.room(), seated: PL.seat ? (PL.seat === ROOM.seats.bed ? 'bed' : PL.seat === ROOM.seats.sofa ? 'sofa' : 'table') : 'standing', tv: ROOM.tv.on, them, events: G.log.slice(-8), left_on: Object.keys(G.messes) };
  try { const r = await fetch('/zombie/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) }); if (r.status === 401 || r.status === 403 || r.status === 404) { G.mindOK = false; G.mindWhy = 'instinct'; G.mindBusy = false; return; }
    const D = await r.json(); if (D.why) { G.mindWhy = D.why; } if (D.thought) G.thoughts.push(D.thought);
    for (const o of D.orders || []) { const C = THEM.list.find(c => 'v' + c.id === o.id && c.active); if (!C || C.state === 'hunt') continue; if (o.spot && ROOM.spots[o.spot]) C.want = o.spot; if (o.test && o.test !== 'none') C.wantTest = o.test; if (o.say) C.line = String(o.say).slice(0, 60); if (o.thing && ROOM.dev[o.thing]) C.thing = o.thing; }
  } catch (e) { G.mindWhy = 'instinct'; } G.mindBusy = false;
}
async function saveProgress(n) { keep('eyes.night', String(n)); try { await fetch('/zombie/save', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify({ night: n }) }); } catch (e) {} }
async function loadProgress() { let n = +keep('eyes.night') || 1; try { const r = await fetch('/zombie/save', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: '{}' }); if (r.ok) { const D = await r.json(); if (D.night) n = Math.max(n, D.night); } } catch (e) {} return clamp(n, 1, 5); }

/* the loop */
let last = 0, step = 0;
function tick(dt) {
  CLOCK.t += dt; G.t += dt; PL.update(dt); physics(dt);
  if (G.mode === 'play') { G.min = Math.min(420, G.min + dt / 1.3); if (G.min >= 360 && !G.done.bed) { die('Five in the morning and you never went to bed. They noticed.'); }
    const bw = busyWith(); PL.busy = !!bw; G.doing = bw; if (bw) { const c = CHORES[bw]; G.hold[bw] = (G.hold[bw] || 0) + dt; if (G.hold[bw] >= c.hold) { finish(bw); if (c.seat) PL.stand(); } }
    // eyes shut for long while awake and they are here: that is not how people cook dinner
    if (PL.eyesShut && !PL.covered) { G.shutFor = (G.shutFor || 0) + dt; if (G.shutFor > 2.5) for (const C of THEM.list) if (C.state === 'wait') C.sus += dt * .12; } else G.shutFor = 0;
    if (G.cur === 'cook' && ROOM.stove.on && Math.random() < dt / 3) A.play('boil', ROOM.stove.pos, .6); if (G.cur === 'dishes' && PL.busy && Math.random() < dt / 2.5) A.play('water', ROOM.stove.pos, .4); if (G.cur === 'teeth' && PL.busy && Math.random() < dt / 1.5) A.play('step', new THREE.Vector3(5.75, 1.4, 3.5), .5);
    if (!G.cutDone && G.t > 150 && Object.keys(G.done).length >= 4) { G.cutDone = true; ROOM.power = false; G.cutT = 25; say('The power\'s gone.', { silent: true, who: 'you' }); }
    if (G.cutT > 0) { G.cutT -= dt; if (G.cutT <= 0) ROOM.power = true; }
    if (!G.knockDone && G.t > 100) { G.knockDone = true; A.play('knock', new THREE.Vector3(.75, 1.2, 5.1), 1.2); setTimeout(() => A.say('Hey. It\'s Frank from 31C. You okay in there? Open up.', { who: 'them', rate: .9, pitch: .7 }), 1500); }
    phoneTick(dt); director(dt); messTick(dt);
  }
  if (G.mode === 'sleep') { PL.busy = PL.eyesShut; sleepTick(dt); director(dt); messTick(dt); }
  if (G.mode === 'hunt') huntTick(dt);
  if (G.mode === 'play' || G.mode === 'sleep' || G.mode === 'hunt') themUpdate(dt, PL);
  G.mindT -= dt; if (G.mindT < 0) { G.mindT = 6; think(); }
  cityUpdate(dt, PL.head); roomUpdate(dt, CLOCK.t);
  if (CITY.onThunder === undefined) CITY.onThunder = () => A.play('thunder', null, .9);
  const tense = Math.max(0, ...THEM.list.map(C => C.state === 'away' ? 0 : C.sus + (C.contact > 0 ? .5 : 0)), G.mode === 'hunt' ? 1 : 0); ROOM.lights.main.dip = clamp((tense - .6) * .5, 0, .35) * (Math.random() < .3 ? 1 : .4);
  A.update(dt, clamp(tense, 0, 1), ROOM.tv.on && ROOM.power, ROOM.tv.k, G.mode === 'sleep'); A.devices(dt, { radio: ROOM.radio.on && ROOM.power, blender: ROOM.blender.on && ROOM.power, tap: ROOM.tap.on }); A.listen(PL.head, PL.fwd);
  if (G.mode === 'sleep' && G.sleep) PL.busy = true;
  sub.t -= dt; prompt = ''; if (G.mode === 'play' || G.mode === 'sleep') { const U = PL.pointed(); if (U && U.label) prompt = (renderer.xr.isPresenting ? 'trigger: ' : 'E: ') + U.label; }
}
function draw(dt) {
  const shut = PL.shutK; lid.material.opacity = Math.max(shut, G.mode === 'hunt' && G.hunt && G.hunt.phase === 'search' && PL.covered ? .93 : 0, G.fade || 0); G.red = Math.max(0, G.red - dt * .5); blood.material.opacity = G.red * .6;
  drawHud(); if (renderer.xr.isPresenting) { if ((step++ % 10) === 0) drawWatch(); }
  if (comp && !renderer.xr.isPresenting) { const h = board.m.visible ? 1.3 : ray0(); focus = lerp(focus, h, 1 - Math.exp(-dt * 5)); bokeh.uniforms.focus.value = focus; bokeh.uniforms.aperture.value = PL.eyesShut ? .003 : .0006; grain.uniforms.t.value = CLOCK.t; grain.uniforms.amt.value = .07 + (G.mode === 'hunt' ? .05 : 0); comp.render(dt); }
  else renderer.render(scene, camera);
}
// what you look at, for the lens: through the window you look at the city, not the glass
function ray0() { const h = ray(PL.head, PL.fwd, 30); if (!h) return 60; const T = P.byCol.get(h.col.handle); return T && T.kind === 'glass' ? 60 : Math.max(.3, h.t); }
function frame(time) { const dt = clamp((time - last) / 1000 || .016, .001, 1 / 20); last = time; if (G.mode !== 'title' && !G.paused) tick(dt); else if (G.mode === 'title') { cityUpdate(dt, PL.head); roomUpdate(dt, CLOCK.t += dt); } draw(dt); }

// after a card: on to the next night, or again
function onCard() { if (!G.card) return false; const c = G.card; G.card = null; showBoard(false); if (c === 'dead') startNight(G.night); else if (c === 'won') startNight(Math.min(5, G.night + 1)); else if (c === 'end') startNight(1); return true; }

const _use = PL.use; PL.use = H => { if (onCard()) return; _use(H); };
renderer.xr.addEventListener('sessionstart', () => { const L = PL.hands.find(h => h.src && h.src.handedness === 'left') || PL.hands[0]; watch.m.position.set(0, .03, .05); watch.m.rotation.set(-Math.PI / 2 + .3, 0, 0); L.grip.add(watch.m); });

/* start */
async function boot() {
  const note = $('note'), bar = $('bar');
  try { await initPhysics(); eq = new RAPIER.EventQueue(true); await loadAssets(p => { bar.style.transform = 'scaleX(' + p + ')'; }); }
  catch (e) { note.textContent = 'It would not load: ' + e.message; return; }
  buildCity(); buildRoom(); buildThem(); PL.init(); mergeStatics(); navBuild(); ROOM.sfx = (n, p) => A.play(n, p, .8);
  // reflections: the room itself, pictured once from its middle with its lights on
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(scene, .02, .1, 100, { position: new THREE.Vector3(3.3, 1.5, 2.5) }).texture; scene.environmentIntensity = .12; pm.dispose();
  if (!LOW) post(); PL.place(.75, 4.3, Math.PI * .9); renderer.setAnimationLoop(frame);
  window.__zombie = { G, PL, THEM, ROOM, CITY, P, THREE, A, renderer, scene, camera, rig, startNight, startHunt, die, draw, mess, moveThing, creep, setSpot, away, approach, CHORES, NIGHTS, finish, goToBed, dawn, think, onCard,
    sim: (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); }, look: (p) => { const d = new THREE.Vector3().subVectors(p, PL.head); PL.yaw = Math.atan2(-d.x, -d.z); PL.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); } };
  G.night = await loadProgress(); $('night').textContent = G.night > 1 ? 'Continue: night ' + G.night + ' of 5' : 'Night 1 of 5';
  $('bdesk').disabled = false; $('bdesk').onclick = () => { go(); renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock(); };
  renderer.domElement.addEventListener('click', () => { if (G.mode !== 'title' && !renderer.xr.isPresenting && document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock(); });
  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)) { $('bvr').disabled = false; $('bvr').onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }); await renderer.xr.setSession(s); go(); s.addEventListener('end', () => { $('ui').hidden = false; G.mode = 'title'; }); } catch (e) { note.textContent = 'The headset would not start: ' + e.message; } }; }
  else $('vrnote').textContent = 'No headset found; play on the screen.';
  const nm = $('name'); if (nm) { nm.value = G.name; nm.oninput = () => { G.name = nm.value.trim().slice(0, 20); keep('eyes.name', G.name); }; }
  $('voices').checked = A.voice; $('voices').onchange = e => { A.voice = e.target.checked; };

}
function go() { A.init(); $('ui').hidden = true; startNight(G.night); }
boot();
