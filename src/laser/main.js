// LASER TAG: two players in one real room, each in a Quest 3 in passthrough; only the packs and guns are drawn, Super Charge 25 by the arena rules (rules.js)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Pack, RULES } from './rules.js';
import { Kit, Beams, TEAM } from './models.js';
import { Net } from './net.js';
import { initAudio, sfx, say } from './audio.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const SIM = Q.has('sim');   // the check's way in: no headset, poses set by hand

// ---- renderer, scene ---------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.appendChild(renderer.domElement);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;
scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(1, 3, 2); scene.add(sun);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.02, 100);
scene.add(camera);
if (SIM) scene.background = new THREE.Color(0x1a1d22);

// the shared frame both headsets agree on (calibration moves it); the other player's kit lives in it
const world = new THREE.Group(); scene.add(world);
const beams = new Beams(scene);

// head-locked words while setting up, counting down, and at the end
const note = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 400; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.156), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, toneMapped: false }));
  m.renderOrder = 999; m.position.set(0, -0.17, -0.9); camera.add(m); let key = '';
  return { mesh: m, set(text) { if (text === key) return; key = text; m.visible = !!text; if (!text) return; const x = c.getContext('2d'); x.clearRect(0, 0, 1024, 400);
    x.fillStyle = 'rgba(8,10,14,0.78)'; x.beginPath(); x.roundRect(0, 0, 1024, 400, 36); x.fill();
    const lines = text.split('\n'); x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => { x.fillStyle = i === 0 ? '#ffffff' : '#c3cad6'; x.font = (i === 0 ? 'bold 62px' : '38px') + ' Arial, sans-serif'; x.fillText(l, 512, 200 + (i - (lines.length - 1) / 2) * (i === 0 ? 72 : 60) + (i ? 12 : 0)); });
    tex.needsUpdate = true; } }; })();
note.set('');

// ---- state ------------------------------------------------------------------------------
const pack = new Pack();
let mySlot = Q.has('slot') ? +Q.get('slot') : 0;
let myKit = null, foeKit = null;
let foe = null;                 // { id, slot, view, cal, rd, seen, hp, hq, gp, gq }
let stage = 'lobby';            // lobby | calA | calB | idle | count | play | over
let calA = null, myCal = false, myReady = false, countEnd = 0, overAt = 0, lastNote = '';
let presenting = false, shotId = 0, lastSt = '', stT = 0, poseT = 0;
const stats = { fired: 0, sent: 0, tagsOnMe: 0, good: 0, cancel: 0, double: 0, blocked: 0 };

function kitFor(slot, parent) { const k = new Kit(parent, slot); return k; }
function makeMine() { if (myKit && myKit.slot === mySlot) return; if (myKit) dropKit(myKit); myKit = kitFor(mySlot, scene); myKit.visible = false; }
function dropKit(k) { for (const o of [k.vest.group, k.gun.group, k.cord, k.strap]) o.parent?.remove(o); }
makeMine();

// ---- the room ---------------------------------------------------------------------------
const net = new Net({
  welcome: (m) => { mySlot = m.slot; makeMine(); for (const p of m.peers || []) setFoe(p); lobby(); },
  'peer-join': (m) => { setFoe(m); lobby(); sendSt(true); },
  'peer-leave': (m) => { if (foe && foe.id === m.id) dropFoe(); lobby(); },
  disconnect: () => { dropFoe(); lobby(); },
  full: () => { $('status').textContent = 'The game is full: two players are already in. Try again later.'; $('enter').disabled = true; },
  pose: (m) => { if (!foe || m.id !== foe.id) return; const p = m.p; foe.hp.set(p[0], p[1], p[2]); foe.hq.set(p[3], p[4], p[5], p[6]); foe.gp.set(p[7], p[8], p[9]); foe.gq.set(p[10], p[11], p[12], p[13]); foe.seen = performance.now(); if (!foe.posed) { foe.posed = true; snapFoe(); } },
  st: (m) => { if (!foe || m.id !== foe.id) return; foe.view = { ph: m.ph, l: m.l, s: m.s, sc: m.sc, k: m.k, su: m.su }; foe.cal = !!m.cal; foe.rd = !!m.rd; foeKit.setView(foe.view);
    if (stage === 'play' && m.ph === 'o') endGame(); },
  fire: (m) => { if (!foe || m.id !== foe.id) return; foeShot(m); },
  res: (m) => { if (!foe || m.id !== foe.id || stage !== 'play') return; stats.good++; pack.good(performance.now()); },
  go: (m) => { if (stage === 'idle' && myCal) startCount(m.in); },
});

function setFoe(p) {
  if (foe && foe.id === p.id) return;
  if (foeKit) dropKit(foeKit);
  foe = { id: p.id, slot: p.slot, view: { ph: 'u', l: 0, s: 0, sc: 0, k: 0, su: 0 }, cal: false, rd: false, seen: 0, posed: false,
    hp: new THREE.Vector3(0, 1.6, -2), hq: new THREE.Quaternion(), gp: new THREE.Vector3(), gq: new THREE.Quaternion(),
    sh: new THREE.Vector3(0, 1.6, -2), sq: new THREE.Quaternion(), sg: new THREE.Vector3(), sgq: new THREE.Quaternion() };
  foeKit = kitFor(p.slot, world); foeKit.visible = false;
}
function dropFoe() {
  if (foeKit) dropKit(foeKit); foe = null; foeKit = null;
  if (stage === 'count' || stage === 'play' || stage === 'over') { pack.reset(); stage = myCal ? 'idle' : stage; myReady = false; flashNote('THE OTHER PLAYER LEFT', 3000); }
}
function snapFoe() { foe.sh.copy(foe.hp); foe.sq.copy(foe.hq); foe.sg.copy(foe.gp); foe.sgq.copy(foe.gq); }

function sendSt(force) {
  const v = { t: 'st', ...pack.view(), cal: myCal ? 1 : 0, rd: myReady ? 1 : 0 }, k = JSON.stringify(v);
  if (!force && k === lastSt) return; lastSt = k; net.send(v);
  myKit?.setView(pack.view());
}

// ---- the pack's own calls -----------------------------------------------------------------
pack.on = (ev, a) => {
  const now = performance.now();
  if (ev === 'tagged') { stats.tagsOnMe++; sfx.tagged(); buzz(1, 600); myKit.flash = 1; net.send({ t: 'res', to: foe?.id, sid: a.id }); }
  else if (ev === 'double') { stats.double++; sfx.tagged(); buzz(1, 400); net.send({ t: 'res', to: foe?.id, sid: a.id }); }
  else if (ev === 'cancel') stats.cancel++;
  else if (ev === 'shield') say('Defense shield. Active, active.');
  else if (ev === 'warning') { say('Warning! Warning!'); sfx.warn(); }
  else if (ev === 'low') say('Warning. Low on shots.');
  else if (ev === 'good') { say('Good shot!'); sfx.good(); }
  else if (ev === 'super') { say('Good shot. Well played.'); sfx.good(); sfx.whine(); }
  else if (ev === 'out') { sendSt(true); endGame(); }
  void now; sendSt();
};

// ---- controllers ------------------------------------------------------------------------
const grips = [0, 1].map((i) => { const g = renderer.xr.getControllerGrip(i); g.addEventListener('connected', (e) => { g.userData.src = e.data; }); g.addEventListener('disconnected', () => { g.userData.src = null; }); scene.add(g); return g; });
const gunHand = () => grips.find(g => g.userData.src?.handedness === 'right' && g.userData.src.gamepad) || grips.find(g => g.userData.src?.gamepad) || null;
let trigWas = false, simTrig = false;
function buzz(k, ms) { for (const g of grips) try { g.userData.src?.gamepad?.hapticActuators?.[0]?.pulse(k, ms); } catch { /* none */ } }
function triggerEdge() {
  let down = simTrig;
  if (presenting) { const g = gunHand(); down = !!g?.userData.src.gamepad.buttons[0]?.pressed; }
  const e = down && !trigWas; trigWas = down; return e;
}

// ---- lining up the two headsets: both touch the barrel tip to the same two spots, standing on their own side ----------------
function calibrate(A, B) {
  world.position.set((A.x + B.x) / 2, 0, (A.z + B.z) / 2);
  world.rotation.set(0, Math.atan2(-(B.z - A.z), B.x - A.x), 0);
  world.updateMatrixWorld(true);
  const z = world.worldToLocal(camera.position.clone()).z;           // RED on +z, GREEN on -z: the order the spots were touched does not matter
  if (mySlot % 2 === 0 ? z < 0 : z > 0) { world.rotation.y += Math.PI; world.updateMatrixWorld(true); }
  myCal = true; stage = 'idle'; sendSt(true);
}

// ---- shooting ---------------------------------------------------------------------------
const ray = new THREE.Raycaster(), O = new THREE.Vector3(), D = new THREE.Vector3(), E = new THREE.Vector3();
function fire(now) {
  const r = pack.pull(now);
  if (!r) { sfx.dry(); return; }
  if (pack.supercharged || r.n > 1) sfx.whine();
  for (let i = 0; i < r.n; i++) setTimeout(() => beam(r.reflex && i === 0), i * RULES.GAP);
  sendSt();
}
function beam(reflex) {
  stats.fired++; myKit.aim(O, D); sfx.shot();
  let k = '', d = 25;
  if (foeKit && foeKit.visible) {
    world.updateMatrixWorld(true); ray.set(O, D); ray.far = 60;
    const h = ray.intersectObjects(foeKit.hits, false)[0];
    if (h) { d = h.distance; if (h.object.userData.kind !== 'block') k = h.object.userData.kind; else stats.blocked++; }
  }
  beams.shoot(O.clone(), E.copy(O).addScaledVector(D, d), myKit.team);
  if (stage === 'play' && pack.playing) { stats.sent++; net.send({ t: 'fire', k, rf: reflex ? 1 : 0, d: +d.toFixed(2), sid: ++shotId }); }
  else net.send({ t: 'fire', k: '', rf: 0, d: +d.toFixed(2), sid: ++shotId });
}
function foeShot(m) {
  if (!foeKit) return;
  foeKit.aim(O, D); beams.shoot(O.clone(), E.copy(O).addScaledVector(D, m.d), foeKit.team); sfx.shot();
  if (m.k && stage === 'play') pack.hit(performance.now(), { reflex: !!m.rf, id: m.sid });
}

// ---- the match: both lined up and ready, the first player counts down, packs energize; out of lives is game over ----------------
const isHost = () => !foe || mySlot < foe.slot;
function startCount(ms) { stage = 'count'; countEnd = performance.now() + ms; }
function endGame() {
  if (stage === 'over') return;
  stage = 'over'; overAt = performance.now(); myReady = false;
  if (pack.phase !== 'o') { pack.phase = 'o'; pack.supercharged = false; }
  say('Game over.'); sfx.over(); sendSt(true);
}
let noteUntil = 0, noteFlash = '';
function flashNote(t, ms) { noteFlash = t; noteUntil = performance.now() + ms; }
function noteText(now) {
  if (now < noteUntil) return noteFlash;
  const other = foe ? TEAM[foe.slot % 2].name : '';
  if (stage === 'calA') return 'LINE UP WITH THE OTHER PLAYER\nstand on your side, facing them\ntouch the gun\'s barrel tip to spot 1 and pull the trigger';
  if (stage === 'calB') return 'NOW SPOT 2\nthe same two spots for both players, at least 1 m apart\ntouch the barrel tip to spot 2 and pull the trigger';
  if (stage === 'idle') {
    if (!foe) return 'WAITING FOR PLAYER 2\nyou are ' + TEAM[mySlot % 2].name + '\nanyone who opens /laser joins you';
    if (!foe.cal) return 'PLAYER 2 IS LINING UP\n' + other + ' is touching the two spots';
    return myReady ? 'READY\nwaiting for ' + other : 'PULL THE TRIGGER WHEN READY\nSuper Charge 25: 25 lives, one shot a second\nfive in a row: supercharged, every life back';
  }
  if (stage === 'count') { const s = Math.ceil((countEnd - now) / 1000); return 'ENERGIZING\n' + s; }
  if (stage === 'over') {
    const won = pack.lives > 0, sc = 'you ' + pack.score + '   ' + other.toLowerCase() + ' ' + (foe?.view.sc ?? 0);
    return (won ? 'GAME OVER: YOU WIN' : 'GAME OVER') + '\n' + sc + (now - overAt > 4000 ? '\npull the trigger to play again' : '');
  }
  return '';
}

let lastBeat = 0;
function step(now, dt) {
  const t = now / 1000, trig = triggerEdge();
  if (stage === 'calA' && trig) { calA = tip(); sfx.beep(); buzz(0.5, 60); stage = 'calB'; }
  else if (stage === 'calB' && trig) { const B = tip(); if (B.distanceTo(calA) >= 0.8) { sfx.beep(); buzz(0.5, 60); calibrate(calA, B); } else { sfx.dry(); flashNote('TOO CLOSE\nthe two spots must be at least 1 m apart', 2000); } }
  else if (stage === 'idle') {
    if (trig) { fire(now); if (foe && !myReady) { myReady = true; sfx.beep(); } }
    if (isHost() && foe && myReady && foe.rd && foe.cal) { net.send({ t: 'go', in: 5000 }); startCount(5000); }
  } else if (stage === 'count') {
    const s = Math.ceil((countEnd - now) / 1000); if (s !== lastBeat) { lastBeat = s; if (s > 0) sfx.count(false); }
    if (now >= countEnd) { pack.energize(); stage = 'play'; sfx.count(true); lastBeat = 0; sendSt(true); }
  } else if (stage === 'play') { if (trig) fire(now); }
  else if (stage === 'over' && trig && now - overAt > 4000) { pack.reset(); stage = 'idle'; myReady = !!foe; sendSt(true); }

  pack.update(now);
  sendSt();
  if (now - stT > 1000) { stT = now; sendSt(true); }

  // my kit on me, the other's kit on them
  if (presenting || SIM) {
    const g = SIM ? simGun : gunHand();
    if (g) { myKit.visible = true; const gp = SIM ? g.p : g.getWorldPosition(new THREE.Vector3()), gq = SIM ? g.q : g.getWorldQuaternion(new THREE.Quaternion()); myKit.place(camera.position, camera.quaternion, gp, gq); }
    if (now - poseT > 50 && myCal && g) { poseT = now; world.updateMatrixWorld(true);
      const inv = world.quaternion.clone().invert(), hp = world.worldToLocal(camera.position.clone()), hq = inv.clone().multiply(camera.quaternion),
        gp = world.worldToLocal(myKit.gun.group.position.clone()), gq = inv.clone().multiply(myKit.gun.group.quaternion), r = (v, n) => +v.toFixed(n);
      net.send({ t: 'pose', p: [r(hp.x, 3), r(hp.y, 3), r(hp.z, 3), r(hq.x, 4), r(hq.y, 4), r(hq.z, 4), r(hq.w, 4), r(gp.x, 3), r(gp.y, 3), r(gp.z, 3), r(gq.x, 4), r(gq.y, 4), r(gq.z, 4), r(gq.w, 4)] }); }
    myKit.lights(t); myKit.cables(t);
  }
  if (foe && foeKit) {
    const k = 1 - Math.exp(-dt * 18); foe.sh.lerp(foe.hp, k); foe.sq.slerp(foe.hq, k); foe.sg.lerp(foe.gp, k); foe.sgq.slerp(foe.gq, k);
    foeKit.visible = myCal && foe.cal && foe.posed && now - foe.seen < 3000;
    if (foeKit.visible) { foeKit.place(foe.sh, foe.sq, foe.sg, foe.sgq); foeKit.lights(t); foeKit.cables(t); }
  }
  beams.update(dt);
  const nt = noteText(now); if (nt !== lastNote) { lastNote = nt; note.set(nt); }
}
function tip() { myKit.aim(O, D); return O.clone(); }

// ---- the lobby ------------------------------------------------------------------------------
function lobby() {
  const n = net.connected ? (foe ? 2 : 1) : 0;
  $('count').textContent = net.connected ? n + ' / 2 in the game' + (foe ? '' : ' (waiting for player 2)') : 'connecting...';
  $('you').textContent = net.connected ? 'You are ' + TEAM[mySlot % 2].name + '.' : '';
}
let arOK = false;
async function checkAR() {
  if (SIM) return;
  if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar').catch(() => false))) {
    $('enter').textContent = 'Open this page in a Quest 3 headset'; $('enter').disabled = true;
    $('status').textContent = 'Laser tag plays in passthrough on a Quest 3, with the controllers. Open thestrangestfleamarket.com/laser in the headset\'s browser.'; return; }
  arOK = true; $('enter').disabled = false;
  net.connect({ local: Q.has('local'), slot: mySlot });
}
$('enter').onclick = async () => {
  if (!arOK) return; initAudio();
  let session; try { session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] }); }
  catch (e) { $('status').textContent = 'Could not start: ' + e.message; return; }
  await renderer.xr.setSession(session);
  presenting = true; $('lobby').classList.add('hidden');
  stage = myCal ? 'idle' : 'calA';
  session.addEventListener('end', () => { presenting = false; stage = 'lobby'; myCal = false; myReady = false; pack.reset(); myKit.visible = false; sendSt(true); $('lobby').classList.remove('hidden'); });
};
checkAR(); lobby();

// ---- the check's hooks: a pose by hand, the trigger by hand -------------------------------------------
const simGun = { p: new THREE.Vector3(0.18, 1.25, -0.3), q: new THREE.Quaternion() };
if (SIM) {
  $('lobby').classList.add('hidden');
  net.connect({ local: Q.has('local'), slot: mySlot });
  stage = 'calA';
}
window.__laser = {
  pack, net, world, camera, renderer, stats, RULES, get stage() { return stage; }, get foe() { return foe; }, get myKit() { return myKit; }, get foeKit() { return foeKit; }, get slot() { return mySlot; },
  // head at p looking along yaw, gun at g aimed at a point
  pose(p, yaw, gp, at) { camera.position.set(...p); camera.rotation.set(0, yaw, 0); camera.updateMatrixWorld(true);
    simGun.p.set(...gp); const m = new THREE.Matrix4().lookAt(simGun.p, new THREE.Vector3(...at), new THREE.Vector3(0, 1, 0)); simGun.q.setFromRotationMatrix(m); },
  pull() { simTrig = true; setTimeout(() => { simTrig = false; }, 60); },
  cal(a, b) { calibrate(new THREE.Vector3(...a), new THREE.Vector3(...b)); },
  sensor(name) { if (!foeKit) return null; world.updateMatrixWorld(true); const o = foeKit.hits.find(h => h.userData.kind === name); return o ? o.getWorldPosition(new THREE.Vector3()).toArray() : null; },
};

let last = performance.now();
renderer.setAnimationLoop(() => {
  const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
  step(now, dt);
  renderer.render(scene, camera);
});
