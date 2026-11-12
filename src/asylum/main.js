// the asylum's page: the renderer, the lights that follow you, walking by keys, touch or a headset, and the loop
import * as T from 'three';
import { G, runTimers } from './state.js';
import { W, build, collide, tubeLit, door, roomAt, grid } from './world.js';
import { toon, glow } from './tex.js';
import { A } from './audio.js';
import { P } from './patient.js';
import { HUD } from './hud.js';
import { S } from './story.js';

const quest = /OculusBrowser|Quest|Pico/i.test(navigator.userAgent), $ = id => document.getElementById(id);
const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = !quest; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.xr.enabled = true;
document.body.prepend(renderer.domElement);
const scene = new T.Scene(); scene.background = new T.Color(0x010202); scene.fog = new T.FogExp2(0x020404, .075);
scene.add(new T.AmbientLight(0x2a3438, .22));
build(scene); scene.add(P.g); S.init();
const rig = new T.Group(), camera = new T.PerspectiveCamera(72, 1, .04, 60); camera.rotation.order = 'YXZ'; rig.add(camera); scene.add(rig); camera.add(HUD.mesh, HUD.fade);
const torch = new T.Group(), tbody = new T.Group(); torch.add(tbody);
{ const b = new T.Mesh(new T.CylinderGeometry(.018, .018, .15, 10), toon(0x1a1a1a)); b.rotation.x = Math.PI / 2; b.position.z = .02; const h = new T.Mesh(new T.CylinderGeometry(.03, .02, .05, 10), toon(0x2a2a2a)); h.rotation.x = Math.PI / 2; h.position.z = -.075; const l = new T.Mesh(new T.CircleGeometry(.026, 12), glow(0xfff4d8)); l.rotation.y = Math.PI; l.position.z = -.101; tbody.add(b, h, l); torch.userData.lens = l; }
const spot = new T.SpotLight(0xfff0d2, 0, 22, .44, .55, 1.3); spot.castShadow = !quest; spot.shadow.mapSize.set(1024, 1024); spot.shadow.camera.near = .2; spot.shadow.camera.far = 22; spot.shadow.bias = -.002; spot.position.set(0, 0, -.11); spot.target.position.set(0, 0, -6); torch.add(spot, spot.target);
const desk = () => { camera.add(torch); torch.position.set(.24, -.22, -.38); torch.rotation.set(.04, .05, 0); }; desk();
const pool = [0, 1, 2, 3].map(() => { const l = new T.PointLight(0xbcd8e8, 0, 11, 2); scene.add(l); return l; });
const fx = new T.PointLight(0xffffff, 0, 9, 2), tvL = new T.PointLight(0x8fa8c8, 0, 7, 2), moon = new T.PointLight(0x35557f, 5, 9, 2), fire = new T.PointLight(0xff6a18, 0, 8, 2);
tvL.position.set(21.9, 1, 18.5); moon.position.set(13.5, 2, 29.2); fire.position.set(33.3, .9, 7.3); scene.add(fx, tvL, moon, fire);

const keys = {}, stick = { x: 0, y: 0 }, tl = { id: -1, x: 0, y: 0 }, tr = { id: -1, x: 0, y: 0 }; let locked = false, stepD = 0, bob = 0, vel = { x: 0, z: 0 }, snap = false, last = performance.now(), paused = false;
const xr = { right: null, left: null, src: [] }, v = new T.Vector3(), q = new T.Quaternion(), tubeM = [0x141a1c, 0xe6f4ff];
addEventListener('keydown', e => { keys[e.code] = 1; if (G.mode === 'title' || paused) return; if (e.code === 'KeyE') S.use(); if (e.code === 'KeyF') light(); });
addEventListener('keyup', e => { keys[e.code] = 0; });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === renderer.domElement; if (!locked && !G.touch && !G.xr && G.mode !== 'title' && !G.ended) pause(true); });
addEventListener('mousemove', e => { if (!locked) return; G.p.yaw -= e.movementX * .0022; G.p.pitch = Math.max(-1.45, Math.min(1.45, G.p.pitch - e.movementY * .0022)); });
renderer.domElement.addEventListener('mousedown', () => { if (G.touch || G.mode === 'title') return; if (!locked) { renderer.domElement.requestPointerLock?.(); return; } S.use(); });
function light() { if (G.batt <= 0) { HUD.say('The batteries are dead.', 3); return; } G.lightOn = !G.lightOn; A.click(null); }
function pause(p) { paused = p; $('pause').hidden = !p; A.mute(p); }
$('pause').addEventListener('click', () => { pause(false); renderer.domElement.requestPointerLock?.(); });
const touchAt = (t, o) => { o.id = t.identifier; o.x = t.clientX; o.y = t.clientY; };
renderer.domElement.addEventListener('touchstart', e => { e.preventDefault(); for (const t of e.changedTouches) touchAt(t, t.clientX < innerWidth / 2 ? tl : tr); }, { passive: false });
renderer.domElement.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) { if (t.identifier === tl.id) { stick.x = Math.max(-1, Math.min(1, (t.clientX - tl.x) / 50)); stick.y = Math.max(-1, Math.min(1, (t.clientY - tl.y) / 50)); }
  if (t.identifier === tr.id) { G.p.yaw -= (t.clientX - tr.x) * .005; G.p.pitch = Math.max(-1.45, Math.min(1.45, G.p.pitch - (t.clientY - tr.y) * .005)); tr.x = t.clientX; tr.y = t.clientY; } } }, { passive: false });
const tend = e => { for (const t of e.changedTouches) { if (t.identifier === tl.id) { tl.id = -1; stick.x = stick.y = 0; } if (t.identifier === tr.id) tr.id = -1; } };
renderer.domElement.addEventListener('touchend', tend); renderer.domElement.addEventListener('touchcancel', tend);
$('buse').addEventListener('click', () => S.use()); $('blight').addEventListener('click', light);
function size() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', () => { if (!renderer.xr.isPresenting) size(); }); size();

function begin(vr) {
  A.init(); $('title').hidden = true; G.mode = 'play'; G.touch = !vr && matchMedia('(pointer: coarse)').matches; $('touch').hidden = !G.touch; $('vig').hidden = false;
  if (!vr && !G.touch) renderer.domElement.requestPointerLock?.();
}
$('play').addEventListener('click', () => begin(false));
$('again').addEventListener('click', () => location.reload());
if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then(ok => { $('vr').hidden = !ok; }).catch(() => {});
$('vr').addEventListener('click', async () => {
  try { A.init(); const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] }); renderer.xr.setReferenceSpaceType('local-floor'); await renderer.xr.setSession(s); renderer.xr.setFoveation?.(1);
    G.xr = true; camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0); rig.position.set(G.p.x, 0, G.p.z); HUD.mesh.position.set(0, -.12, -1.25); if (G.mode === 'title') begin(true); pause(false);
    s.addEventListener('end', () => { G.xr = false; xr.right = xr.left = null; desk(); HUD.mesh.position.set(0, -.04, -1.1); size(); if (!G.ended) pause(true); });
  } catch (e) { $('vr').textContent = 'VR did not start'; }
});
[0, 1].forEach(i => { const c = renderer.xr.getController(i); rig.add(c);
  const hand = new T.Mesh(new T.BoxGeometry(.06, .025, .09), toon(0x6f6a5c)); hand.position.z = .03; hand.visible = false; c.add(hand);
  c.addEventListener('connected', e => { c.userData.hand = e.data.handedness; if (e.data.handedness === 'left') { xr.left = c; hand.visible = true; } else { xr.right = c; c.add(torch); torch.position.set(0, 0, -.04); torch.rotation.set(0, 0, 0); } });
  c.addEventListener('disconnected', () => { hand.visible = false; if (xr.right === c) { xr.right = null; desk(); } if (xr.left === c) xr.left = null; });
  c.addEventListener('selectstart', () => { if (G.mode !== 'title') S.use(); }); c.addEventListener('squeezestart', () => { if (c.userData.hand !== 'left') light(); });
});

function move(dt) {
  let mx = 0, mz = 0, run = !!(keys.ShiftLeft || keys.ShiftRight), turn = 0;
  if (G.xr) { const s = renderer.xr.getSession(); if (s) for (const src of s.inputSources) { const gp = src.gamepad; if (!gp) continue; const ax = gp.axes.length >= 4 ? [gp.axes[2], gp.axes[3]] : [gp.axes[0] || 0, gp.axes[1] || 0];
    if (src.handedness === 'left') { mx = Math.abs(ax[0]) > .15 ? ax[0] : 0; mz = Math.abs(ax[1]) > .15 ? ax[1] : 0; run = run || !!(gp.buttons[3] && gp.buttons[3].pressed) || Math.hypot(ax[0], ax[1]) > .95; } else turn = ax[0]; }
    if (Math.abs(turn) > .6) { if (!snap) { snap = true; const a = -Math.sign(turn) * Math.PI / 6, hx = G.head.x - rig.position.x, hz = G.head.z - rig.position.z, c = Math.cos(a), s2 = Math.sin(a); rig.position.x = G.head.x - (hx * c + hz * s2); rig.position.z = G.head.z - (-hx * s2 + hz * c); G.p.yaw += a; } } else if (Math.abs(turn) < .3) snap = false;
  } else { mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x; mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + stick.y; if (G.touch && Math.hypot(stick.x, stick.y) > .95) run = true; }
  if (G.red && (G.xr || G.touch)) run = true;
  if (G.mode !== 'play') mx = mz = 0;
  const l = Math.hypot(mx, mz), sp = (run ? 3.8 : 2.2) * Math.min(1, l), fy = Math.atan2(-G.fwd.x, -G.fwd.z), c = Math.cos(fy), s = Math.sin(fy);
  const tx = l ? (mx * c + mz * s) / l * sp : 0, tz = l ? (-mx * s + mz * c) / l * sp : 0, k = Math.min(1, dt * 10); vel.x += (tx - vel.x) * k; vel.z += (tz - vel.z) * k;
  const np = { x: G.head.x + vel.x * dt, z: G.head.z + vel.z * dt }; collide(np, G.xr ? .24 : .3);
  const moved = Math.hypot(np.x - G.head.x, np.z - G.head.z); G.p.speed = moved / Math.max(dt, 1e-4);
  if (G.xr) { rig.position.x += np.x - G.head.x; rig.position.z += np.z - G.head.z; rig.rotation.y = G.p.yaw; }
  else { G.p.x = np.x; G.p.z = np.z; rig.position.set(np.x, 0, np.z); rig.rotation.y = G.p.yaw; bob += moved * 4.2; const sh = G.shake > 0 ? (Math.random() - .5) * G.shake * .12 : 0; camera.position.set(0, 1.65 + Math.sin(bob * 2) * .022 * Math.min(1, G.p.speed / 2), 0); camera.rotation.set(G.p.pitch + sh, sh, sh * .5); }
  stepD += moved; if (stepD > (run ? 1.05 : .78)) { stepD = 0; A.step(run); }
}
function lights(dt) {
  const hx = G.head.x, hz = G.head.z, near = []; let lit = [];
  for (const tb of W.tubes) { tb.lit = !G.red && (G.surge >= 0 ? true : tubeLit(tb, G.t)); tb.mat.color.setHex(G.red ? 0x2a0504 : tb.lit ? (tb.col === 0xffb060 ? 0xffd9a0 : tubeM[1]) : tubeM[0]); tb.d = Math.hypot(tb.x - hx, tb.z - hz); if (tb.lit || G.red) near.push(tb); }
  near.sort((a, b) => a.d - b.d); lit = near.filter(t => t.lit && t.d < 9).slice(0, 3);
  pool.forEach((l, i) => { const tb = near[i]; if (!tb) { l.intensity = 0; return; } l.position.set(tb.x, tb.y, tb.z); const f = Math.max(0, Math.min(1, (12 - tb.d) / 3));
    if (G.red) { l.color.setHex(0xff1a10); l.intensity = 7 * f * (.55 + .45 * Math.sin(G.t * 7)); } else { l.color.setHex(tb.col); l.intensity = tb.I * f * (G.surge >= 0 ? 1 + G.surge * 1.5 : 1); } });
  A.buzz(lit);
  if (G.lightCut > 0) G.lightCut -= dt; if (G.lightOn) { G.batt -= dt / 270; if (G.batt <= 0) { G.batt = 0; G.lightOn = false; HUD.say('The batteries are dead.', 4); } }
  const on = G.lightOn && G.lightCut <= 0, fl = G.batt < .15 ? (Math.sin(G.t * 37) + Math.sin(G.t * 11.3) > .1 ? 1 : .15) : Math.sin(G.t * 13.7) > .985 ? .5 : 1;
  spot.intensity = on ? 75 * fl * (.45 + .55 * Math.min(1, G.batt * 3)) : 0; torch.userData.lens.material.color.setHex(on ? 0xfff4d8 : 0x1a1814);
  torch.getWorldPosition(G.lightPos); torch.getWorldQuaternion(q); G.lightDir.set(0, 0, -1).applyQuaternion(q);
  tvL.intensity = G.flags.tv ? 5 + Math.random() * 5 : 0; fire.intensity = 6 + Math.sin(G.t * 11) * 1.5 + Math.sin(G.t * 17.3);
  if (G.fx) { fx.position.set(G.fx.x, G.fx.y, G.fx.z); fx.color.setHex(G.fx.c); fx.intensity = G.fx.i; } else fx.intensity = 0;
}
function sim(dt) {
  G.t += dt; runTimers();
  if (G.warp) { const w = G.warp; G.warp = null; G.p.x = w.x; G.p.z = w.z; G.p.yaw = w.yaw; G.p.pitch = 0; vel.x = vel.z = 0; if (G.xr) { rig.rotation.y = w.yaw; rig.updateMatrixWorld(true); camera.getWorldPosition(v); rig.position.x += w.x - v.x; rig.position.z += w.z - v.z; } else rig.position.set(w.x, 0, w.z); rig.updateMatrixWorld(true); camera.getWorldPosition(G.head); }
  move(dt); rig.updateMatrixWorld(true); camera.getWorldPosition(G.head); camera.getWorldDirection(G.fwd);
  if (G.xr && xr.right) { G.aimPos = xr.right.getWorldPosition(G.aimPos || new T.Vector3()); xr.right.getWorldQuaternion(q); G.aimDir = (G.aimDir || new T.Vector3()).set(0, 0, -1).applyQuaternion(q); } else G.aimPos = G.aimDir = null;
  if (G.shake > 0) G.shake -= dt;
  lights(dt); S.update(dt); P.update(dt); HUD.tick(dt); A.listener(G.head, G.fwd);
  if (G.ended && !G.xr && $('again').hidden) { $('again').hidden = false; document.exitPointerLock?.(); }
}
renderer.setAnimationLoop(() => {
  const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
  if (G.mode !== 'title' && !paused && !ASY.hold) sim(dt); else if (G.mode === 'title') { G.t += dt; lights(dt); rig.position.set(13.5, 0, 28.5); camera.position.y = 1.65; camera.rotation.set(0, Math.sin(G.t * .2) * .25, 0); rig.updateMatrixWorld(true); camera.getWorldPosition(G.head); camera.getWorldDirection(G.fwd); HUD.tick(dt); }
  renderer.render(scene, camera);
});
const ASY = window.ASY = { G, P, W, S, HUD, A, door, roomAt, grid, hold: false, begin, light, scene, camera, renderer,
  sim(sec, step = 1 / 30) { for (let t = 0; t < sec; t += step) sim(step); },
  tp(x, z, yaw = G.p.yaw) { G.warp = { x, z, yaw }; sim(1 / 30); },
  look(x, z, y = 1.65) { G.p.yaw = Math.atan2(-(x - G.head.x), -(z - G.head.z)); G.p.pitch = Math.atan2(y - 1.65, Math.hypot(x - G.head.x, z - G.head.z)); sim(1 / 30); } };
