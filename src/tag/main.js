// SENSOR TAG: two players in one real room, each in a Quest 3 in passthrough; a sensor panel on each chest, a pistol that fires one beam a second, ten lives (rules.js)
import * as THREE from 'three';
import { Player, RULES, judge, follow, sensorAt, covered, wrap } from './rules.js';
import { Panel, Gun, Beams, TEAM } from './models.js';
import { Net } from './net.js';
import { initAudio, sfx } from '../laser/audio.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const SIM = Q.has('sim');   // the check's way in: no headset, poses set by hand

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.appendChild(renderer.domElement);
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x505050, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(1, 3, 2); scene.add(sun);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.02, 100);
scene.add(camera);
if (SIM) scene.background = new THREE.Color(0x1a1d22);

// the shared frame both headsets agree on (lining up moves it); both sensors and the other player's pistol live in it
const world = new THREE.Group(); scene.add(world);
const beams = new Beams(scene);

// head-locked words while setting up, counting down, and at the end
const note = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 400; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.156), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, toneMapped: false }));
  m.renderOrder = 999; m.position.set(0, -0.17, -0.9); camera.add(m); let key = '';
  return { set(text) { if (text === key) return; key = text; m.visible = !!text; if (!text) return; const x = c.getContext('2d'); x.clearRect(0, 0, 1024, 400);
    x.fillStyle = 'rgba(8,10,14,0.78)'; x.beginPath(); x.roundRect(0, 0, 1024, 400, 36); x.fill();
    const lines = text.split('\n'); x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => { x.fillStyle = i === 0 ? '#ffffff' : '#c3cad6'; x.font = (i === 0 ? 'bold 62px' : '38px') + ' Arial, sans-serif'; x.fillText(l, 512, 200 + (i - (lines.length - 1) / 2) * (i === 0 ? 72 : 60) + (i ? 12 : 0)); });
    tex.needsUpdate = true; } }; })();
note.set('');
// the red wash when your sensor is hit
const wash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xff1a2a, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false }));
wash.renderOrder = 998; wash.position.z = -0.3; wash.visible = false; camera.add(wash);

const me = new Player();
let mySlot = Q.has('slot') ? +Q.get('slot') : 0;
let myPanel = null, myGun = null, foePanel = null, foeGun = null;
let foe = null;
let stage = 'lobby';            // lobby | calA | calB | idle | count | play | over
let calA = null, myCal = false, myReady = false, countEnd = 0, overAt = 0, lastNote = '', bodyYaw = 0;
let presenting = false, shotId = 0, lastSt = '', stT = 0, poseT = 0;
const stats = { fired: 0, good: 0, blocked: 0, body: 0, hitsOnMe: 0 };

function makeMine() { if (myPanel && myPanel.slot === mySlot) return; myPanel?.drop(); myGun?.drop(); myPanel = new Panel(world, mySlot); myGun = new Gun(scene, mySlot); myPanel.group.visible = myGun.group.visible = false; }
makeMine();

const net = new Net({
  welcome: (m) => { mySlot = m.slot; makeMine(); for (const p of m.peers || []) setFoe(p); lobby(); },
  'peer-join': (m) => { setFoe(m); lobby(); sendSt(true); },
  'peer-leave': (m) => { if (foe && foe.id === m.id) dropFoe(); lobby(); },
  disconnect: () => { dropFoe(); lobby(); },
  full: () => { $('status').textContent = 'The game is full: two players are already in. Try again later.'; $('enter').disabled = true; },
  pose: (m) => { if (!foe || m.id !== foe.id) return; const p = m.p; foe.hp.set(p[0], p[1], p[2]); foe.yaw = p[3]; foe.gp.set(p[4], p[5], p[6]); foe.gq.set(p[7], p[8], p[9], p[10]).normalize(); foe.op.set(p[11], p[12], p[13]); foe.has = !!p[14];
    foe.seen = performance.now(); if (!foe.posed) { foe.posed = true; foe.sh.copy(foe.hp); foe.syaw = foe.yaw; foe.sg.copy(foe.gp); foe.sgq.copy(foe.gq); foe.so.copy(foe.op); } },
  st: (m) => { if (!foe || m.id !== foe.id) return; foe.view = { ph: m.ph, l: m.l, k: m.k }; foe.cal = !!m.cal; foe.rd = !!m.rd; foePanel.set(m.l); if (stage === 'play' && m.ph === 'o') endGame(); },
  fire: (m) => { if (!foe || m.id !== foe.id) return; foeShot(m); },
  go: (m) => { if (stage === 'idle' && myCal) startCount(m.in); },
});

function setFoe(p) {
  if (foe && foe.id === p.id) return;
  foePanel?.drop(); foeGun?.drop();
  foe = { id: p.id, slot: p.slot, view: { ph: 'u', l: 0, k: 0 }, cal: false, rd: false, seen: 0, posed: false, has: false, yaw: 0, syaw: 0,
    hp: new THREE.Vector3(0, 1.6, -2), gp: new THREE.Vector3(), gq: new THREE.Quaternion(), op: new THREE.Vector3(),
    sh: new THREE.Vector3(0, 1.6, -2), sg: new THREE.Vector3(), sgq: new THREE.Quaternion(), so: new THREE.Vector3() };
  foePanel = new Panel(world, p.slot); foeGun = new Gun(world, p.slot); foePanel.group.visible = foeGun.group.visible = false;
}
function dropFoe() {
  foePanel?.drop(); foeGun?.drop(); foe = null; foePanel = foeGun = null;
  if (stage === 'count' || stage === 'play' || stage === 'over') { me.reset(); stage = myCal ? 'idle' : stage; myReady = false; flashNote('THE OTHER PLAYER LEFT', 3000); }
}
const foeSeen = () => !!(foe && foePanel && foePanel.group.visible);
const foeBody = () => ({ head: foe.sh.toArray(), yaw: foe.syaw, hands: foe.has ? [foe.sg.toArray(), foe.so.toArray()] : [foe.sg.toArray()] });

function sendSt(force) {
  const v = { t: 'st', ...me.view(), cal: myCal ? 1 : 0, rd: myReady ? 1 : 0 }, k = JSON.stringify(v);
  myPanel.set(me.lives); myGun.set(me.lives);
  if (!force && k === lastSt) return; lastSt = k; net.send(v);
}

let washK = 0;
me.on = (ev) => {
  if (ev === 'hit') { stats.hitsOnMe++; sfx.tagged(); buzz(1, 500); myPanel.flash = 1; washK = 0.55; sendSt(true); flashNote('HIT\nyou ' + me.lives + '   them ' + (foe?.view.l ?? 0), 900); }
  else if (ev === 'out') { sendSt(true); endGame(); }
};

// the right controller is the pistol (its pointing ray is the barrel); the other hand, a controller or a tracked hand, can cover the sensor
const ctl = [0, 1].map((i) => { const c = renderer.xr.getController(i), g = renderer.xr.getControllerGrip(i);
  c.addEventListener('connected', (e) => { c.userData.src = e.data; }); c.addEventListener('disconnected', () => { c.userData.src = null; }); scene.add(c, g); c.userData.grip = g; return c; });
const gunHand = () => ctl.find(c => c.userData.src?.handedness === 'right' && c.userData.src.gamepad) || ctl.find(c => c.userData.src?.gamepad) || null;
const offHand = (gun) => ctl.find(c => c !== gun && c.userData.src && (c.userData.grip.visible || c.visible)) || null;
let trigWas = false, simTrig = false;
function buzz(k, ms) { try { gunHand()?.userData.src.gamepad.hapticActuators?.[0]?.pulse(k, ms); } catch { /* none */ } }
function triggerEdge() {
  let down = simTrig;
  if (presenting) { const g = gunHand(); down = !!g?.userData.src.gamepad.buttons[0]?.pressed; }
  const e = down && !trigWas; trigWas = down; return e;
}

// lining up the two headsets: both touch the muzzle to the same two spots, standing on their own side
function calibrate(A, B) {
  world.position.set((A.x + B.x) / 2, 0, (A.z + B.z) / 2);
  world.rotation.set(0, Math.atan2(-(B.z - A.z), B.x - A.x), 0);
  world.updateMatrixWorld(true);
  const z = world.worldToLocal(camera.position.clone()).z;   // ORANGE on +z, BLUE on -z: the order the spots were touched does not matter
  if (mySlot % 2 === 0 ? z < 0 : z > 0) { world.rotation.y += Math.PI; world.updateMatrixWorld(true); }
  myCal = true; stage = 'idle'; bodyYaw = headYaw(); sendSt(true);
}

const O = new THREE.Vector3(), D = new THREE.Vector3(), E = new THREE.Vector3(), V = new THREE.Vector3(), Wq = new THREE.Quaternion(), Hq = new THREE.Quaternion();
function headYaw() { world.getWorldQuaternion(Wq).invert(); V.set(0, 0, -1).applyQuaternion(Hq.copy(Wq).multiply(camera.quaternion)); return V.x * V.x + V.z * V.z < 0.04 ? bodyYaw : Math.atan2(-V.x, -V.z); }

function fire(now) {
  if (!me.pull(now)) { sfx.dry(); return; }
  stats.fired++; myGun.aim(O, D); sfx.shot(); buzz(0.6, 50);
  let r = { k: '', d: 25 };
  if (foeSeen()) { world.updateMatrixWorld(true); world.getWorldQuaternion(Wq).invert();
    r = judge(world.worldToLocal(V.copy(O)).toArray(), V.copy(D).applyQuaternion(Wq).toArray(), foeBody()); }
  beams.shoot(O.clone(), E.copy(O).addScaledVector(D, r.d), mySlot);
  const live = stage === 'play' && me.playing;
  if (r.k === 'sensor' && live) { stats.good++; me.good(); sfx.good(); buzz(1, 120); foePanel.flash = 1; }
  else if (r.k === 'hand') { stats.blocked++; if (live) flashNote('BLOCKED', 600); }
  else if (r.k === 'body') stats.body++;
  net.send({ t: 'fire', k: live ? r.k : '', d: +r.d.toFixed(2), sid: ++shotId });
}
function foeShot(m) {
  if (!foeGun) return;
  foeGun.aim(O, D); beams.shoot(O.clone(), E.copy(O).addScaledVector(D, m.d), foe.slot); sfx.shot();
  if (m.k === 'sensor' && stage === 'play') me.hit();
}

const isHost = () => !foe || mySlot < foe.slot;
function startCount(ms) { stage = 'count'; countEnd = performance.now() + ms; }
function endGame() {
  if (stage === 'over') return;
  stage = 'over'; overAt = performance.now(); myReady = false; sfx.over(); sendSt(true);
}
let noteUntil = 0, noteFlash = '';
function flashNote(t, ms) { noteFlash = t; noteUntil = performance.now() + ms; }
function noteText(now) {
  if (now < noteUntil) return noteFlash;
  const other = foe ? TEAM[foe.slot % 2].name : '';
  if (stage === 'calA') return 'LINE UP WITH THE OTHER PLAYER\nstand on your side, facing them\ntouch the pistol\'s muzzle to spot 1 and pull the trigger';
  if (stage === 'calB') return 'NOW SPOT 2\nthe same two spots for both players, at least 1 m apart\ntouch the muzzle to spot 2 and pull the trigger';
  if (stage === 'idle') {
    if (!foe) return 'WAITING FOR PLAYER 2\nyou are ' + TEAM[mySlot % 2].name + '\nanyone who opens /tag joins you';
    if (!foe.cal) return 'PLAYER 2 IS LINING UP\n' + other + ' is touching the two spots';
    return myReady ? 'READY\nwaiting for ' + other : 'PULL THE TRIGGER WHEN READY\n' + RULES.LIVES + ' lives, one shot a second\nonly the chest sensor counts';
  }
  if (stage === 'count') return 'GET READY\n' + Math.ceil((countEnd - now) / 1000);
  if (stage === 'over') return (me.lives > 0 ? 'YOU WIN' : 'YOU LOSE') + '\nyou ' + me.lives + '   ' + other.toLowerCase() + ' ' + (foe?.view.l ?? 0) + (now - overAt > 4000 ? '\npull the trigger to play again' : '');
  return '';
}

let lastBeat = 0;
const simGun = { p: new THREE.Vector3(0.18, 1.25, -0.3), q: new THREE.Quaternion() }, simOff = { p: null };
function step(now, dt) {
  const trig = triggerEdge();
  if (presenting || SIM) {
    const g = SIM ? null : gunHand();
    if (SIM) { myGun.group.position.copy(simGun.p); myGun.group.quaternion.copy(simGun.q); }
    else if (g) { g.getWorldPosition(myGun.group.position); g.getWorldQuaternion(myGun.group.quaternion); }
    const held = SIM || !!g; myGun.group.visible = held; myGun.charge(me.charge(now));
    world.updateMatrixWorld(true);
    const hl = world.worldToLocal(camera.position.clone()); bodyYaw = follow(bodyYaw, headYaw(), dt);
    const o = SIM ? null : offHand(g), op = SIM ? simOff.p : o ? (o.userData.grip.visible ? o.userData.grip : o).getWorldPosition(new THREE.Vector3()) : null;
    const ol = op ? world.worldToLocal(op.clone()) : null, gl = world.worldToLocal(myGun.group.position.clone());
    myPanel.group.visible = stage !== 'lobby'; myPanel.place(hl, bodyYaw); myPanel.cover(covered(hl.toArray(), bodyYaw, ol ? [gl.toArray(), ol.toArray()] : [gl.toArray()])); myPanel.update(dt);
    if (now - poseT > 50 && myCal && held) { poseT = now; world.getWorldQuaternion(Wq).invert(); const gq = Wq.multiply(myGun.group.quaternion), r = (v, n) => +v.toFixed(n);
      net.send({ t: 'pose', p: [r(hl.x, 3), r(hl.y, 3), r(hl.z, 3), r(bodyYaw, 3), r(gl.x, 3), r(gl.y, 3), r(gl.z, 3), r(gq.x, 4), r(gq.y, 4), r(gq.z, 4), r(gq.w, 4), ol ? r(ol.x, 3) : 0, ol ? r(ol.y, 3) : 0, ol ? r(ol.z, 3) : 0, ol ? 1 : 0] }); }
  }
  if (foe && foePanel) {
    const k = 1 - Math.exp(-dt * 18); foe.sh.lerp(foe.hp, k); foe.syaw = wrap(foe.syaw + wrap(foe.yaw - foe.syaw) * k); foe.sg.lerp(foe.gp, k); foe.sgq.slerp(foe.gq, k); foe.so.lerp(foe.op, k);
    const on = myCal && foe.cal && foe.posed && now - foe.seen < 3000; foePanel.group.visible = foeGun.group.visible = on;
    if (on) { foePanel.place(foe.sh, foe.syaw); const b = foeBody(); foePanel.cover(covered(b.head, b.yaw, b.hands)); foePanel.update(dt); foeGun.group.position.copy(foe.sg); foeGun.group.quaternion.copy(foe.sgq); foeGun.charge(1); foeGun.set(foe.view.l); }
  }

  if (stage === 'calA' && trig) { calA = tip(); sfx.beep(); buzz(0.5, 60); stage = 'calB'; }
  else if (stage === 'calB' && trig) { const B = tip(); if (B.distanceTo(calA) >= 0.8) { sfx.beep(); buzz(0.5, 60); calibrate(calA, B); } else { sfx.dry(); flashNote('TOO CLOSE\nthe two spots must be at least 1 m apart', 2000); } }
  else if (stage === 'idle') {
    if (trig) { fire(now); if (foe && !myReady) { myReady = true; sfx.beep(); } }
    if (isHost() && foe && myReady && foe.rd && foe.cal) { net.send({ t: 'go', in: 3000 }); startCount(3000); }
  } else if (stage === 'count') {
    const s = Math.ceil((countEnd - now) / 1000); if (s !== lastBeat) { lastBeat = s; if (s > 0) sfx.count(false); }
    if (now >= countEnd) { me.start(); stage = 'play'; sfx.count(true); lastBeat = 0; sendSt(true); }
  } else if (stage === 'play') { if (trig) fire(now); }
  else if (stage === 'over' && trig && now - overAt > 4000) { me.reset(); stage = 'idle'; myReady = !!foe; sendSt(true); }

  sendSt();
  if (now - stT > 1000) { stT = now; sendSt(true); }
  washK = Math.max(0, washK - dt * 1.6); wash.visible = washK > 0; wash.material.opacity = washK;
  beams.update(dt);
  const nt = noteText(now); if (nt !== lastNote) { lastNote = nt; note.set(nt); }
}
function tip() { myGun.aim(O, D); return O.clone(); }

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
    $('status').textContent = 'Sensor Tag plays in passthrough on a Quest 3, with the controllers. Open thestrangestfleamarket.com/tag in the headset\'s browser.'; return; }
  arOK = true; $('enter').disabled = false; $('enter').textContent = 'ENTER';
  net.connect({ local: Q.has('local'), slot: mySlot });
}
$('enter').onclick = async () => {
  if (!arOK) return; initAudio();
  let session; try { session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'], optionalFeatures: ['hand-tracking'] }); }
  catch (e) { $('status').textContent = 'Could not start: ' + e.message; return; }
  await renderer.xr.setSession(session);
  presenting = true; $('lobby').classList.add('hidden');
  stage = myCal ? 'idle' : 'calA';
  session.addEventListener('end', () => { presenting = false; stage = 'lobby'; myCal = false; myReady = false; me.reset(); myPanel.group.visible = myGun.group.visible = false; sendSt(true); $('lobby').classList.remove('hidden'); });
};
checkAR(); lobby();

if (SIM) { $('lobby').classList.add('hidden'); net.connect({ local: Q.has('local'), slot: mySlot }); stage = 'calA'; }
window.__tag = {
  me, net, world, camera, renderer, stats, RULES, get stage() { return stage; }, get foe() { return foe; }, get slot() { return mySlot; }, get foeSeen() { return foeSeen(); }, get myGun() { return myGun; }, get myPanel() { return myPanel; }, get foePanel() { return foePanel; },
  // head at p looking along yaw, pistol at gp aimed at a point, the other hand at off (or none)
  pose(p, yaw, gp, at, off) { camera.position.set(...p); camera.rotation.set(0, yaw, 0); camera.updateMatrixWorld(true);
    simGun.p.set(...gp); simGun.q.setFromRotationMatrix(new THREE.Matrix4().lookAt(simGun.p, new THREE.Vector3(...at), new THREE.Vector3(0, 1, 0))); simOff.p = off ? new THREE.Vector3(...off) : null; },
  pull() { simTrig = true; setTimeout(() => { simTrig = false; }, 60); },
  cal(a, b) { calibrate(new THREE.Vector3(...a), new THREE.Vector3(...b)); },
  sensor() { if (!foe) return null; world.updateMatrixWorld(true); return world.localToWorld(new THREE.Vector3(...sensorAt(foe.sh.toArray(), foe.syaw))).toArray(); },
};

let last = performance.now();
renderer.setAnimationLoop(() => {
  const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
  step(now, dt);
  renderer.render(scene, camera);
});
