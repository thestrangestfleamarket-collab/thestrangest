// SWIVEL: you are the gunner in the ball turret on a gunship's back; ships come from every side, so you turn (a swivel chair is ideal) and shoot. A headset or a screen; the fight is sim.js, the picture view.js
import * as THREE from 'three';
import { Sim } from './sim.js';
import { World } from './view.js';
import { Sound } from './audio.js';

const $ = id => document.getElementById(id), EYE = 1.2;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation(1);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 9000), rig = new THREE.Group();
rig.add(camera); scene.add(rig);
const home = () => { rig.position.set(0, -EYE, 0); rig.rotation.set(0, 0, 0); camera.position.set(0, EYE, 0); camera.rotation.set(0, 0, 0, 'YXZ'); }; home();
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const sim = new Sim((Math.random() * 1e9) | 0), world = new World(scene, camera, renderer), snd = new Sound();
try { sim.best = +localStorage.getItem('swivel-best') || 0; } catch { }
let mode = '', held = false, overAt = 0, barrel = 0, yaw = 0, pitch = 0.15, centre = 0, aimHand = 1, alarmT = 0, last = 0, ready = false;
const keys = new Set(), aim = { o: new THREE.Vector3(), d: new THREE.Vector3(0, 0, -1) }, _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion();

// ---- the headset's hands: either trigger fires and makes that hand the aim, a grip sends a missile, a thumbstick turns you if your chair cannot ----
const hands = [0, 1].map(i => { const c = renderer.xr.getController(i), h = { c, src: null, trig: false, stick: 0 }; rig.add(c);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.13, 10).rotateX(Math.PI / 2.6).translate(0, -0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0x1b1f26, metalness: 0.5, roughness: 0.6 })); c.add(grip);
  h.ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.05), new THREE.Vector3(0, 0, -1.6)]), new THREE.LineBasicMaterial({ color: 0x7dffd8, transparent: true, opacity: 0.35 })); c.add(h.ray);
  c.addEventListener('connected', e => { h.src = e.data; if (e.data.handedness === 'right' && !hands.some(x => x.trig)) aimHand = i; }); c.addEventListener('disconnected', () => { h.src = null; h.trig = false; });
  c.addEventListener('selectstart', () => { h.trig = true; aimHand = i; press(); }); c.addEventListener('selectend', () => { h.trig = false; });
  c.addEventListener('squeezestart', () => { missile(c); }); return h; });
const buzz = (i, power, ms) => { try { const g = hands[i].src && hands[i].src.gamepad, a = g && (g.hapticActuators && g.hapticActuators[0] || g.vibrationActuator); if (a && a.pulse) a.pulse(power, ms); } catch { } };
// keep the head where it is in the world while the rig turns or is set
function pinHead(x, y, z) { _a.copy(camera.position).applyQuaternion(rig.quaternion); rig.position.set(x - _a.x, y - _a.y, z - _a.z); }
function turn(a) { camera.getWorldPosition(_b); const p = _b.clone(); rig.rotation.y += a; rig.updateMatrixWorld(); pinHead(p.x, p.y, p.z); }

function press() { snd.start(); if (!ready) return; if (sim.state === 'ready' || sim.state === 'over' && performance.now() - overAt > 2500) { sim.start(); world.say('', '', 0); } }
function missile(from) {
  let o, d; if (from) { o = from.getWorldPosition(_a); d = _b.set(0, 0, -1).applyQuaternion(from.getWorldQuaternion(_q)); } else { o = aim.o; d = aim.d; }
  if (sim.missile([o.x, o.y - 0.4, o.z], [d.x, d.y, d.z])) return; if (sim.state === 'play' && sim.msl < 1) snd.play('ui_deny', 0.5);
}

// ---- a screen: the mouse looks and fires (click to hold the pointer), right click or F a missile; touch drags to look and fires while held ----
const cv = renderer.domElement; cv.style.touchAction = 'none';
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => { if (mode !== 'screen') return; if (e.pointerType === 'mouse') { if (document.pointerLockElement !== cv) { try { const p = cv.requestPointerLock(); p && p.catch && p.catch(() => { }); } catch { } } if (e.button === 2) return missile(); } held = true; press(); });
addEventListener('pointerup', () => { held = keys.has('Space'); });
addEventListener('pointermove', e => { if (mode !== 'screen' || !(document.pointerLockElement === cv || e.pointerType !== 'mouse' && e.buttons)) return; look(yaw - e.movementX * 0.0022, pitch - e.movementY * 0.0022); });
addEventListener('keydown', e => { keys.add(e.code); if (mode !== 'screen') return; if (e.code === 'Space' || e.code === 'Enter') { held = e.code === 'Space'; press(); e.preventDefault(); } if (e.code === 'KeyF') missile(); });
addEventListener('keyup', e => { keys.delete(e.code); if (e.code === 'Space') held = false; });
function look(y, p) { yaw = y; pitch = Math.max(-0.35, Math.min(1.45, p)); }

// ---- what the fight did: sound, the feel in the hands, words ----
function tell(e) {
  world.fx(e);
  if (e.t === 'fire') { snd.play('gun', 0.2); buzz(aimHand, 0.4, 22); }
  else if (e.t === 'foefire') snd.play(e.heavy ? 'cannon' : 'gun2', e.heavy ? 1 : 0.6, e.p);
  else if (e.t === 'hit') snd.play('hit', 0.6, e.p);
  else if (e.t === 'shield') { snd.play('hit2', 0.6); buzz(0, 0.6, 60); buzz(1, 0.6, 60); }
  else if (e.t === 'hull') { snd.play('boom_s', 0.9); buzz(0, 1, 160); buzz(1, 1, 160); }
  else if (e.t === 'boom') { snd.play({ cruiser: 'boom_xl', bomber: 'boom_l', fighter: 'boom_m', ace: 'boom_m', pod: 'boom_m' }[e.type] || 'boom_s', 1.6, e.p); if (e.type === 'cruiser') { world.say('CRUISER DESTROYED', '', 3); snd.play('win', 0.7); } }
  else if (e.t === 'torp') { snd.play('alarm', 0.45); if (world.said !== 'CRUISER INBOUND') world.say('TORPEDO', 'shoot it down', 1.6); }
  else if (e.t === 'missile') { snd.play('thrust', 0.7); buzz(aimHand, 0.8, 90); }
  else if (e.t === 'overheat') snd.play('ui_deny', 0.8);
  else if (e.t === 'wave') { world.say(e.boss ? 'CRUISER INBOUND' : 'WAVE ' + e.wave, e.boss ? 'its pods are its guns' : e.wave === 1 ? 'they come from every side: turn and shoot' : '', 3.5); snd.play('order', 0.8); }
  else if (e.t === 'clear') world.say('WAVE CLEAR', 'hull patched', 2);
  else if (e.t === 'over') { overAt = performance.now(); try { localStorage.setItem('swivel-best', sim.best); } catch { } snd.play('lose', 0.8); snd.play('boom_l', 1); world.say('SHIP LOST', 'score ' + e.score + '   wave ' + e.wave + '   best ' + sim.best, 1e9); }
}

renderer.setAnimationLoop((now, frame) => {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; const xr = renderer.xr.isPresenting;
  if (xr) {
    // the seat: wherever your head is when you come in becomes the middle of the turret (press a thumbstick in to set it again)
    if (centre) { const ps = frame && frame.getViewerPose(renderer.xr.getReferenceSpace()), p = ps && ps.transform.position; if (p) { centre = 0; rig.rotation.set(0, 0, 0); rig.position.set(-p.x, -p.y, -p.z); rig.updateMatrixWorld(true); } }
    for (const h of hands) { const g = h.src && h.src.gamepad; if (!g) continue; const x = g.axes.length > 2 ? g.axes[2] : g.axes[0] || 0, s = x > 0.6 ? 1 : x < -0.6 ? -1 : 0; if (s && s !== h.stick) turn(-s * Math.PI / 6); h.stick = s;
      const b = g.buttons[3] && g.buttons[3].pressed; if (b && !h.b3) centre = 1; h.b3 = b; }
    const c = hands[aimHand].c.visible ? hands[aimHand].c : hands[1 - aimHand].c.visible ? hands[1 - aimHand].c : null;
    if (c) { c.getWorldPosition(aim.o); aim.d.set(0, 0, -1).applyQuaternion(c.getWorldQuaternion(_q)); } else { camera.getWorldPosition(aim.o); camera.getWorldDirection(aim.d); }
    hands.forEach((h, i) => { h.ray.visible = i === aimHand; }); held = hands.some(h => h.trig);
  } else {
    const k = (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0) - (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0), u = (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0); if (k || u) look(yaw + k * 1.9 * dt, pitch + u * 1.2 * dt);
    camera.rotation.set(pitch, yaw, 0, 'YXZ'); camera.updateMatrixWorld(); camera.getWorldPosition(aim.o); camera.getWorldDirection(aim.d);
  }
  if (held && sim.state === 'play') { world.muzzle(barrel, _a); _b.copy(aim.o).addScaledVector(aim.d, 500).sub(_a).normalize(); if (sim.fire([_a.x, _a.y, _a.z], [_b.x, _b.y, _b.z])) barrel++; }
  const n = dt > 0.02 ? 2 : 1; for (let i = 0; i < n; i++) sim.step(dt / n);
  for (const e of sim.events.splice(0)) tell(e);
  if (sim.state === 'play' && sim.hull < 30 && now - alarmT > 2600) { alarmT = now; snd.play('alarm', 0.3); }
  world.sync(sim, dt, aim, camera);
  camera.getWorldPosition(_a); camera.getWorldDirection(_b); snd.hear(_a, _b, camera.up);
  renderer.render(scene, camera);
});

// ---- the way in ----
const lobby = $('lobby'), bvr = $('vr'), bsc = $('screen'), status = $('status');
function go(m) { mode = m; lobby.classList.add('hidden'); snd.start(); if (sim.state === 'ready') world.say('SWIVEL', m === 'vr' ? 'pull a trigger to start' : 'click to start', 1e9); }
bsc.onclick = () => go('screen');
bvr.onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking'] }); await renderer.xr.setSession(s); centre = 1; go('vr');
  s.addEventListener('end', () => { mode = ''; held = false; hands.forEach(h => { h.trig = false; }); home(); lobby.classList.remove('hidden'); }); } catch (e) { status.textContent = 'The headset would not start: ' + (e && e.message || e); } };
world.load(f => { status.textContent = 'loading the ships ' + Math.round(f * 100) + '%'; }).then(async () => {
  ready = true; status.textContent = ''; bsc.disabled = false; bsc.textContent = 'PLAY ON THIS SCREEN';
  const ok = navigator.xr && await navigator.xr.isSessionSupported('immersive-vr').catch(() => false); bvr.disabled = !ok; bvr.textContent = ok ? 'ENTER THE TURRET (VR)' : 'No headset found';
}, e => { status.textContent = 'The ships would not load: ' + (e && e.message || e); });

window.__turret = { sim, world, renderer, scene, camera, rig, hands, aim, look, go, get mode() { return mode; }, get held() { return held; }, set held(v) { held = v; } };
