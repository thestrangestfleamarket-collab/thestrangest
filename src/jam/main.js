// STADIUM JAM: play guitar or drums to a full stadium, in VR or on a screen, with others (/jam): the page's loop, lobby, controls and wiring
import * as THREE from 'three';
import { buildStadium, SLOTS } from './stadium.js';
import { AudioEngine, GuitarVoice, DrumVoice, PADS, TONE_NAMES } from './audio.js';
import { buildKit, buildStick, DrumPlayer } from './drums.js';
import { buildGuitar, GuitarPlayer } from './guitar.js';
import { Input } from './input.js';
import { Net } from './net.js';
import { RemotePlayer, Avatar, loadAvatars, PLAYER_COLORS, nameSprite } from './avatars.js';
import { makeTextures } from './textures.js';
import { Fx } from './fx.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const params = new URLSearchParams(location.search);
const low = params.has('low') || (!params.has('high') && /OculusBrowser|Quest|Pico|Android|Mobile/i.test(navigator.userAgent));
const $ = (id) => document.getElementById(id);

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.04, 1500);
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);
const T = makeTextures(low);
loadAvatars();
const stadium = buildStadium(scene, renderer, T, { low, density: Math.max(0.02, Math.min(1.5, parseFloat(params.get('crowd')) || 1)) });
const input = new Input(renderer, rig, camera, renderer.domElement);
const fx = new Fx(scene, low, (delay) => { audio?.firework(delay); audio?.crowd.cheer(0.25); });

// Bloom on the flat-screen view (WebXR renders straight to the headset, so no post-processing there).
let composer = null;
if (!low && !params.has('nobloom')) {
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.6, 0.9));
  composer.addPass(new OutputPass());
}

window.addEventListener('resize', () => {
  if (renderer.xr.isPresenting) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer?.setSize(window.innerWidth, window.innerHeight);
});

// ---------- local player ----------
const me = { id: 0, slot: 0, name: 'Player', inst: 'drums', tone: 1, ky: 0 };
const station = new THREE.Group(); // everything that stays at my spot on stage
scene.add(station);
let kit, guitar, drumPlayer, guitarPlayer, myBody;
let audio = null, drumVoice = null, guitarVoice = null;
let started = false, energy = 0, time = 0;
const remotes = new Map();
const castShadows = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = !low; } });

function buildLocalInstruments() {
  const color = PLAYER_COLORS[me.slot % PLAYER_COLORS.length];
  if (kit) station.remove(kit.group);
  if (guitar) scene.remove(guitar.group);
  if (myBody) scene.remove(myBody.group);
  myBody = new Avatar(me.slot, { headless: true, shadows: true });
  scene.add(myBody.group);
  kit = buildKit(color, T);
  guitar = buildGuitar(color, T);
  station.add(kit.group);
  scene.add(guitar.group);
  castShadows(kit.group);
  castShadows(guitar.group);
  drumPlayer = new DrumPlayer(kit);
  guitarPlayer = new GuitarPlayer(guitar);
}

// hand visuals (sticks for drums, small markers for guitar)
const handVis = ['left', 'right'].map(() => {
  const g = new THREE.Group();
  const stick = buildStick(T);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, emissive: 0x40e0ff, emissiveIntensity: 0.6 }));
  g.add(stick);
  scene.add(g, ball);
  castShadows(g);
  return { g, stick, ball };
});

// ---------- in-world HUD and touch buttons ----------
const hudCanvas = document.createElement('canvas');
hudCanvas.width = 1024; hudCanvas.height = 512;
const hudTex = new THREE.CanvasTexture(hudCanvas);
hudTex.colorSpace = THREE.SRGBColorSpace;
const hud = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: hudTex, fog: false }));
hud.position.set(-1.2, 0.5, -0.9);
hud.rotation.set(-0.5, 0.75, 0, 'YXZ');
station.add(hud);
let hudKey = '';

function drawHud() {
  const drums = me.inst === 'drums';
  const key = [me.inst, me.tone, guitarPlayer?.chord, remotes.size, net.connected, me.room].join('|');
  if (key === hudKey) return;
  hudKey = key;
  const g = hudCanvas.getContext('2d');
  g.fillStyle = '#0b0d14';
  g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = '#40e0ff';
  g.lineWidth = 6;
  g.strokeRect(3, 3, 1018, 506);
  g.fillStyle = '#40e0ff';
  g.font = '700 64px system-ui, sans-serif';
  g.fillText(drums ? 'DRUMS' : `GUITAR  ${guitarPlayer.chord}`, 40, 84);
  g.fillStyle = '#9aa3b8';
  g.font = '500 34px system-ui, sans-serif';
  g.textAlign = 'right';
  g.fillText(net.connected ? `room ${me.room} · ${remotes.size + 1} on stage` : 'solo (offline)', 984, 78);
  g.textAlign = 'left';
  g.fillStyle = '#e8ebf2';
  g.font = '500 38px system-ui, sans-serif';
  const lines = drums
    ? ['Hit the drums and cymbals with the sticks', 'Trigger (or pinch) = kick drum', 'Hold left grip = open hi-hat', 'Left stick click = recentre', 'Touch the orbs on your right to switch']
    : ['Left hand on the neck picks the fret', 'Strum across the strings with your right', 'Left trigger / pinch = minor   grip = power chord', `Amp: ${TONE_NAMES[me.tone]}  (A button or tone orb)`, 'Touch the orbs on your right to switch'];
  lines.forEach((l, i) => g.fillText(l, 40, 170 + i * 66));
  hudTex.needsUpdate = true;
  $('chord').textContent = drums ? '' : `${guitarPlayer.chord} · ${TONE_NAMES[me.tone]}`;
  $('status').textContent = net.connected ? `Room "${me.room}" · ${remotes.size + 1} on stage` : 'Solo (not connected)';
}

function makeOrb(label, color, z) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: color, emissiveIntensity: 1.6, roughness: 0.3 }));
  const s = nameSprite(label);
  s.scale.set(0.42, 0.08, 1);
  s.position.y = 0.13;
  g.add(m, s);
  g.position.set(1.0, 1.0, z);
  station.add(g);
  return { g, m, inside: false, w: new THREE.Vector3() };
}
const orbInst = makeOrb('SWITCH INSTRUMENT', 0xff3070, 0.0);
const orbTone = makeOrb('AMP TONE', 0x30a0ff, 0.38);

function touchOrb(orb, hands) {
  if (!orb.g.visible) return false;
  orb.g.getWorldPosition(orb.w);
  let inside = false;
  for (const h of [hands.left, hands.right]) {
    if (h.active && (h.tip.distanceTo(orb.w) < 0.1 || h.pick.distanceTo(orb.w) < 0.1)) inside = true;
  }
  const fired = inside && !orb.inside;
  orb.inside = inside;
  if (fired) { hands.left.pulse(0.6, 40); hands.right.pulse(0.6, 40); }
  return fired;
}

// ---------- networking ----------
const sendState = () => net.send({ t: 'state', inst: me.inst, tone: me.tone, ky: Math.round(me.ky * 100) / 100 });
const net = new Net({
  welcome(m) {
    me.id = m.id;
    me.room = m.room;
    for (const r of remotes.values()) r.dispose();
    remotes.clear();
    if (m.slot !== me.slot) { me.slot = m.slot; placeAtSlot(true); }
    for (const p of m.peers) remotes.set(p.id, new RemotePlayer(p, scene, audio, T, !low));
    sendState();
    hudKey = '';
  },
  'peer-join'(m) {
    remotes.get(m.id)?.dispose();
    remotes.set(m.id, new RemotePlayer(m, scene, audio, T, !low));
    bump(0.15);
    audio.crowd.cheer(0.6);
  },
  'peer-leave'(m) {
    remotes.get(m.id)?.dispose();
    remotes.delete(m.id);
  },
  pose(m) { remotes.get(m.id)?.setPose(m.p); },
  state(m) { remotes.get(m.id)?.applyState(m); },
  note(m) {
    const r = remotes.get(m.id);
    if (!r) return;
    r.onNote(m);
    if (m.k === 'd' && m.pad === 6) bigHit(m.v);
    if (m.k !== 'x') bump(m.k === 'd' ? 0.03 + 0.03 * m.v : 0.012 + 0.015 * m.v);
  },
  full() { $('status').textContent = 'That room is full (8 players) — playing solo.'; },
  disconnect() {
    for (const r of remotes.values()) r.dispose();
    remotes.clear();
  },
});

// ---------- playing ----------
const stats = { drums: 0, plucks: 0 };
const bump = (v) => { energy = Math.min(1, energy + v); };

// A crash is a moment: blinders on the crowd, a cheer, and pyro if the place is already going off.
let lastPyro = -99;
function bigHit(vel) {
  if (vel < 0.45) return;
  stadium.blinder(vel);
  audio.crowd.cheer(0.25 * vel);
  if (energy > 0.55 && time - lastPyro > 6) { lastPyro = time; fx.gerbs(1.5); }
}

function playDrum(i, vel, side, ox, oz) {
  const open = i === 2 && kit.hatOpen;
  stats.drums++;
  drumVoice.hit(PADS[i], vel, open);
  kit.hit(i, vel, ox, oz);
  if (i === 6) bigHit(vel);
  net.send({ t: 'note', k: 'd', pad: i, v: Math.round(vel * 100) / 100, o: open ? 1 : 0 });
  bump(0.03 + 0.03 * vel);
  if (side) input.hands[side].pulse(0.3 + vel * 0.7, 30);
}

function guitarEvent(ev) {
  if (ev.k === 'g') {
    stats.plucks++;
    guitarVoice.pluck(ev.s, ev.m, ev.v);
    bump(0.012 + 0.015 * ev.v);
  } else guitarVoice.damp(0.12);
  net.send({ t: 'note', ...ev });
}

function setTone(i) {
  me.tone = ((i % 3) + 3) % 3;
  guitarVoice.setTone(me.tone);
  sendState();
}

function setInstrument(inst) {
  me.inst = inst;
  const drums = inst === 'drums';
  kit.group.visible = drums;
  guitar.group.visible = !drums;
  orbTone.g.visible = !drums;
  guitarVoice?.damp(0.05);
  guitarPlayer.pos = null;
  if (!renderer.xr.isPresenting) {
    me.ky = 0;
    camera.position.set(0, drums ? 1.25 : 1.66, drums ? 0.12 : 0);
  }
  kit.group.position.y = me.ky;
  kit.updateWorld();
  sendState();
  $('help-drums').hidden = !drums;
  $('help-guitar').hidden = drums;
}

function placeAtSlot(rebuild) {
  const [x, z] = SLOTS[me.slot % SLOTS.length];
  station.position.set(x, 0, z);
  if (rebuild) { buildLocalInstruments(); setInstrument(me.inst); }
  if (renderer.xr.isPresenting) recenter();
  else { rig.position.set(x, 0, z); rig.rotation.y = 0; }
  kit.updateWorld();
}

const _f = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const yawOf = (q) => { _f.set(0, 0, -1).applyQuaternion(q); return Math.atan2(-_f.x, -_f.z); };

// Put the VR player at their station facing the crowd, wherever they stand in their room.
function recenter() {
  const [x, z] = SLOTS[me.slot % SLOTS.length];
  rig.rotation.y = -yawOf(camera.quaternion);
  _f.set(camera.position.x, 0, camera.position.z).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
  rig.position.set(x - _f.x, 0, z - _f.z);
  me.ky = Math.max(-0.25, Math.min(0.7, camera.position.y - 1.22));
  kit.group.position.y = me.ky;
  orbInst.g.position.y = orbTone.g.position.y = Math.max(0.8, camera.position.y - 0.35);
  kit.updateWorld();
  guitarPlayer.pos = null;
  sendState();
}

// ---------- desktop controls ----------
const DRUM_KEYS = { Space: 0, KeyK: 0, KeyS: 1, KeyA: 2, KeyD: 3, KeyF: 4, KeyG: 5, KeyH: 6, KeyJ: 7 };
const STRING_KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH'];
const FRET_KEYS = ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'];
const deskHit = { left: { t: 9, pad: 1 }, right: { t: 9, pad: 1 } };
const deskShape = () => (input.isDown('KeyX') ? 'power' : input.isDown('KeyZ') ? 'minor' : 'major');

input.onKey((code, down) => {
  if (!started || renderer.xr.isPresenting) return;
  if (down && code === 'Tab') { setInstrument(me.inst === 'drums' ? 'guitar' : 'drums'); return true; }
  if (me.inst === 'drums') {
    if (code === 'ShiftLeft' || code === 'ShiftRight') { kit.hatOpen = down; return true; }
    if (down && code in DRUM_KEYS) {
      const i = DRUM_KEYS[code];
      playDrum(i, 0.6 + Math.random() * 0.3);
      if (i > 0) {
        const side = kit.pads[i].group.position.x < 0.03 ? 'left' : 'right';
        deskHit[side] = { t: 0, pad: i };
      }
      return true;
    }
  } else {
    if (code === 'KeyZ' || code === 'KeyX') { guitarPlayer.setChord(guitarPlayer.fret, deskShape(), guitarEvent); return true; }
    if (!down) return;
    const fret = FRET_KEYS.indexOf(code);
    if (fret >= 0) { guitarPlayer.setChord(fret, deskShape(), guitarEvent); return true; }
    if (code === 'ArrowLeft' || code === 'ArrowRight') { guitarPlayer.setChord(guitarPlayer.fret + (code === 'ArrowRight' ? 1 : -1), deskShape(), guitarEvent); return true; }
    if (code === 'Space' || code === 'ArrowDown') { guitarPlayer.strum(true, 0.8, guitarEvent); return true; }
    if (code === 'ArrowUp') { guitarPlayer.strum(false, 0.7, guitarEvent); return true; }
    const s = STRING_KEYS.indexOf(code);
    if (s >= 0) { guitarPlayer.pick(s, 0.75, guitarEvent); return true; }
    if (code === 'KeyV') { setTone(me.tone + 1); return true; }
  }
});

// Desktop players get animated sticks / hands so others see them play.
const _rest = new THREE.Vector3(), _tip = new THREE.Vector3();
function desktopHands(dt) {
  const H = input.hands;
  for (const side of ['left', 'right']) {
    const h = H[side], sx = side === 'left' ? -1 : 1;
    h.active = true;
    h.isHand = false;
    if (me.inst === 'drums') {
      const a = deskHit[side];
      a.t += dt;
      const pulse = Math.max(0, 1 - a.t / 0.16);
      _rest.set(sx * 0.2, 0.92 + me.ky, -0.48).add(station.position);
      _tip.copy(kit.pads[a.pad].wc).lerp(_rest, 1 - pulse * pulse);
      h.pos.set(sx * 0.07, 0.11, 0.28).normalize().multiplyScalar(0.31).add(_tip);
      h.quat.setFromRotationMatrix(_m.lookAt(h.pos, _tip, THREE.Object3D.DEFAULT_UP));
      h.tip.copy(_tip);
    } else {
      guitarPlayer.deskHand(side, h.pos, dt);
      h.quat.copy(guitar.group.quaternion);
      h.tip.copy(h.pos);
    }
    h.pick.copy(h.tip);
  }
}

// ---------- main loop ----------
const headPos = new THREE.Vector3(), headQuat = new THREE.Quaternion(), up = new THREE.Vector3();
let last = 0, poseTimer = 0, fireworkIn = 1;
const wrist = [new THREE.Vector3(), new THREE.Vector3()], seat = new THREE.Vector3();
const r3 = (v) => Math.round(v * 1000) / 1000;
const pushPose = (out, p, q) => out.push(r3(p.x), r3(p.y), r3(p.z), r3(q.x), r3(q.y), r3(q.z), r3(q.w));

function update(dt) {
  const xr = renderer.xr.isPresenting;
  const H = input.hands;
  if (xr) {
    rig.updateMatrixWorld(true);
    input.updateXR();
  } else {
    input.applyDesktopLook();
    rig.updateMatrixWorld(true);
  }
  camera.getWorldPosition(headPos);
  camera.getWorldQuaternion(headQuat);
  const drums = me.inst === 'drums';

  if (!drums) guitarPlayer.wear(headPos, yawOf(headQuat), dt);
  if (!xr) desktopHands(dt);

  if (xr) {
    if (H.left.down.thumb) recenter();
    if (drums) {
      kit.hatOpen = H.left.squeeze;
      drumPlayer.update(H, dt, time, playDrum);
      for (const side of ['left', 'right']) {
        if (H[side].down.trigger || H[side].down.pinch) playDrum(0, 0.85, side);
      }
    } else {
      guitarPlayer.update(H, dt, guitarEvent);
      if (H.right.down.a) setTone(me.tone + 1);
    }
    if (touchOrb(orbInst, H)) { setInstrument(drums ? 'guitar' : 'drums'); recenter(); }
    if (touchOrb(orbTone, H)) setTone(me.tone + 1);
  }

  // hand visuals
  ['left', 'right'].forEach((side, i) => {
    const h = H[side], v = handVis[i];
    v.g.visible = h.active && drums && !h.isHand;
    v.ball.visible = h.active && !drums && !h.isHand && xr;
    v.g.position.copy(h.pos);
    v.g.quaternion.copy(h.quat);
    v.ball.position.copy(h.pick);
  });

  // my own body, posed from head and hands
  const yaw = yawOf(headQuat);
  ['left', 'right'].forEach((side, i) => {
    const h = H[side];
    if (h.active) wrist[i].copy(h.pos);
    else wrist[i].set(i ? 0.24 : -0.24, -0.62, -0.08).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw).add(headPos);
  });
  seat.set(station.position.x, 0.66 + me.ky, station.position.z + 0.05);
  myBody.pose(headPos, headQuat, wrist[0], wrist[1], drums ? seat : null, dt);
  myBody.setHandsVisible(!(xr && (H.left.isHand || H.right.isHand))); // tracked hand meshes replace the avatar's own
  if (myBody.ready && !myBody.skinned) { myBody.skinned = true; input.setSkin(myBody.skin); }

  // sustained hype sets off fireworks
  if (energy > 0.7 && (fireworkIn -= dt) < 0) { fx.firework(); fireworkIn = 0.5 + Math.random() * 2.5 * (1.4 - energy); }

  kit.update(dt, time);
  guitar.update(dt, time);
  for (const r of remotes.values()) r.update(dt, time);
  drawHud();

  poseTimer += dt;
  if (poseTimer > 1 / 15 && net.connected) {
    poseTimer = 0;
    const p = [];
    pushPose(p, headPos, headQuat);
    pushPose(p, H.left.pos, H.left.quat);
    pushPose(p, H.right.pos, H.right.quat);
    pushPose(p, guitar.group.position, guitar.group.quaternion);
    net.send({ t: 'pose', p });
  }

  energy *= Math.exp(-dt * 0.22);
  _f.set(0, 0, -1).applyQuaternion(headQuat);
  up.set(0, 1, 0).applyQuaternion(headQuat);
  audio.setListener(headPos, _f, up);
  audio.crowd.setEnergy(energy);
}

const minFrame = params.has('maxfps') ? 1000 / Math.max(1, parseFloat(params.get('maxfps'))) : 0; // optional frame cap
renderer.setAnimationLoop((ms) => {
  if (minFrame && !renderer.xr.isPresenting && ms - last < minFrame) return;
  const dt = Math.min(minFrame ? 0.3 : 0.05, (ms - last) / 1000 || 0.016);
  last = ms;
  time += dt;
  if (started) update(dt);
  else {
    // lobby fly-by
    camera.position.set(Math.sin(time * 0.1) * 6, 3.2, 3);
    camera.lookAt(0, 2, -40);
    energy = 0.45 + 0.25 * Math.sin(time * 0.4);
    if ((fireworkIn -= dt) < 0) { fx.firework(); fireworkIn = 1.5 + Math.random() * 3; }
    headPos.copy(camera.position);
  }
  stadium.update(time, energy, dt, fx.update(dt, headPos));
  if (composer && !renderer.xr.isPresenting) composer.render();
  else renderer.render(scene, camera);
});

// ---------- lobby ----------
let xrSupported = false;
navigator.xr?.isSessionSupported('immersive-vr').then((ok) => {
  xrSupported = ok;
  $('enter-vr').disabled = !ok;
  $('vr-note').textContent = ok ? '' : 'No VR headset detected in this browser — you can still play on desktop.';
  $('vr-button').hidden = !ok;
}).catch(() => {});
if (!navigator.xr) $('vr-note').textContent = 'WebXR is not available in this browser — you can still play on desktop.';

$('room').value = params.get('room') || '';
$('name').value = localStorage.getItem('sj-name') || '';
let lobbyInst = 'drums';
for (const b of document.querySelectorAll('[data-inst]')) {
  b.addEventListener('click', () => {
    lobbyInst = b.dataset.inst;
    document.querySelectorAll('[data-inst]').forEach((o) => o.classList.toggle('on', o === b));
  });
}

async function enterVR() {
  const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
  if (low) renderer.xr.setFoveation(1);
  await renderer.xr.setSession(session);
}
renderer.xr.addEventListener('sessionstart', () => {
  camera.position.set(0, 1.6, 0);
  camera.rotation.set(0, 0, 0);
  setTimeout(recenter, 700); // wait for the first tracked pose
});
renderer.xr.addEventListener('sessionend', () => {
  me.ky = 0;
  orbInst.g.position.y = orbTone.g.position.y = 1.0;
  setInstrument(me.inst);
  placeAtSlot(false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function start(vr) {
  if (!started) {
    audio = new AudioEngine({ low });
    audio.loadSamples().then((ok) => { me.samples = ok; });
    const channel = audio.createChannel(false);
    drumVoice = new DrumVoice(audio, channel);
    guitarVoice = new GuitarVoice(audio, channel, { hum: true });
    me.name = $('name').value.trim() || 'Player';
    me.room = $('room').value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24) || 'main';
    me.inst = lobbyInst;
    try { localStorage.setItem('sj-name', me.name); } catch {}
    history.replaceState(null, '', `?room=${encodeURIComponent(me.room)}${low && params.has('low') ? '&low' : ''}`);
    camera.rotation.set(0, 0, 0);
    buildLocalInstruments();
    setInstrument(me.inst);
    placeAtSlot(false);
    net.connect(() => ({ room: me.room, name: me.name, inst: me.inst }));
    started = true;
    energy = 0.5; // the crowd greets you
    $('lobby').hidden = true;
    $('overlay').hidden = false;
  }
  audio.resume();
  if (vr) enterVR().catch((e) => { $('status').textContent = `Could not start VR: ${e.message}`; });
}
$('enter-vr').addEventListener('click', () => start(true));
$('vr-button').addEventListener('click', () => start(true));
$('play-desktop').addEventListener('click', () => start(false));
renderer.domElement.addEventListener('pointerdown', () => audio?.resume());

// test / debug hook
window.__jam = { stats, station, me, remotes, input, net, fx, stadium, playDrum, get audio() { return audio; }, get myBody() { return myBody; }, get energy() { return energy; }, get kit() { return kit; }, get guitarPlayer() { return guitarPlayer; }, renderer, camera, rig, recenter };
