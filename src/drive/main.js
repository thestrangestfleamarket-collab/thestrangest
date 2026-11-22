// Game entry: renderer, input, local player (seated / on foot / VR), own car physics, remote players, HUD.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { World } from './world.js';
import { Vehicle, SPEC } from './vehicle.js';
import { Car, loadCarAssets, SEATS } from './car.js';
import { AudioSys } from './audio.js';
import { Net } from './net.js';
import { Traffic, DEF_MPH } from './traffic.js';
import { People } from './people.js';
import { makeBody } from './body.js';

const $ = (id) => document.getElementById(id);
const UA = navigator.userAgent; const isQuest = /OculusBrowser|Quest/i.test(UA); const isTouch = 'ontouchstart' in window && !isQuest;
const QUALITY = {
  high: { lod: 'hi', viewDist: 900, shadows: true, spotShadows: true, lampLights: 8, lampIntensity: 260, bloom: true, camRes: 384, pr: 1.5, aniso: 8, rainDrops: 2600, parallelLoads: 4, camsPerFrame: 1, leafCards: 34, vegDist: 700, ao: true, grassCount: 4200, grassRadius: 16, traffic: 46, people: 16 },
  medium: { lod: 'hi', viewDist: 650, shadows: false, spotShadows: false, lampLights: 4, lampIntensity: 260, bloom: true, camRes: 256, pr: 1, aniso: 4, rainDrops: 1500, parallelLoads: 3, camsPerFrame: 1, leafCards: 22, vegDist: 450, grassCount: 2000, grassRadius: 11, traffic: 30, people: 10 },
  low: { lod: 'lo', viewDist: 380, shadows: false, spotShadows: false, lampLights: 2, lampIntensity: 260, bloom: false, camRes: 192, pr: 1, aniso: 2, rainDrops: 600, parallelLoads: 2, camsPerFrame: 0.34, lightCount: 1, leafCards: 12, vegDist: 220, grassCount: 600, grassRadius: 6, traffic: 14, people: 5 },
};
const params = new URLSearchParams(location.search);
$('quality').value = params.get('q') || (isQuest || isTouch ? 'low' : 'high'); if (params.get('room')) $('room').value = params.get('room'); if (params.get('name')) $('name').value = params.get('name'); if (params.get('time')) $('time').value = params.get('time');
try { const sv = JSON.parse(localStorage.getItem('drivesim') || '{}'); if (sv.name && !params.get('name')) $('name').value = sv.name; if (sv.color) $('color').value = sv.color; } catch { }

let traffic = null, people = null, body = null, hoverPerson = null; const law = { cites: [], cool: {}, speedT: 0, lastSig: null, stop: null, last: '' }; let Q, renderer, scene, camera, rig, composer, bloom, world, audio = new AudioSys(), net = new Net();
let myCar, veh, carMeta, carGltf; const cars = new Map(); const remotes = new Map();
const me = { mode: 'seat', carId: 0, seat: 0, yaw: 0, pitch: 0, foot: new THREE.Vector3(), belt: false, cam: 'cockpit', fov: 68, orbitYaw: 0, orbitPitch: 0.22, stepAcc: 0, chase: new THREE.Vector3() };
const keys = new Set(); const ctl = { steer: 0, throttle: 0, brake: 0, handbrake: false, horn: false };
let started = false, locked = false, hover = null, hoverCar = null, mapScale = 1.6, lastSend = 0, instT = 0, centerT = 0, camAcc = 0, frame = 0, fpsT = 0, fpsN = 0, beltWarnT = 0, doorWarnT = 0;
const xr = { active: false, controllers: [], yaw: 0, base: new THREE.Vector3(), label: null, hoverByHand: [null, null] };
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _m = new THREE.Matrix4(), Y = new THREE.Vector3(0, 1, 0);

function status(p, text) { $('bar').firstElementChild.style.width = Math.round(p * 100) + '%'; $('status').textContent = text; }
function toast(text, ms = 2600) { const t = $('toast'); t.textContent = text; t.style.opacity = 1; clearTimeout(toast.t); toast.t = setTimeout(() => t.style.opacity = 0, ms); if (xr.active) xrLabel(text); }

// ------------------------------------------------------------------ boot
$('start').disabled = false; $('start').textContent = 'Start'; status(0, 'Ready. About 30–80 MB is downloaded depending on graphics quality.');
$('start').onclick = async () => {
  if (started) return enter();
  $('start').disabled = true; $('start').textContent = 'Loading…';
  try { localStorage.setItem('drivesim', JSON.stringify({ name: $('name').value, color: $('color').value })); } catch { }
  try { await boot(); } catch (e) { console.error(e); status(0, 'Failed to load: ' + e.message); return; }
  started = true; $('start').disabled = false; $('start').textContent = 'Drive'; status(1, 'Ready — click Drive. Mouse is captured for looking around; press Esc to release.');
  if (params.get('auto')) enter();
};
if (params.get('auto')) setTimeout(() => $('start').click(), 50);

async function boot() {
  Q = { ...QUALITY[$('quality').value] };
  if (params.get('vd')) Q.viewDist = Math.max(120, +params.get('vd')); // smaller streaming radius for automated tests on small machines
  const canvas = $('gl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !Q.bloom, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pr)); renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = Q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local');
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(me.fov, window.innerWidth / window.innerHeight, 0.04, 5000); rig = new THREE.Group(); rig.add(camera); scene.add(rig);
  if (Q.bloom) { composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })); composer.addPass(new RenderPass(scene, camera)); if (Q.ao) { try { const ao = new GTAOPass(scene, camera, window.innerWidth, window.innerHeight); ao.blendIntensity = 0.85; ao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12 }); composer.addPass(ao); } catch (e) { console.warn('ambient occlusion unavailable', e); } } bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.42, 0.55, 0.92); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(window.innerWidth, window.innerHeight); }
  window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); if (composer) composer.setSize(window.innerWidth, window.innerHeight); });

  status(0.05, 'Loading map data…');
  world = new World(scene, renderer, Q); await world.load((p, t) => status(0.05 + p * 0.2, t));
  status(0.3, 'Loading the car…');
  [carMeta, carGltf] = await loadCarAssets(Q.lod, (p) => status(0.3 + p * 0.3, 'Loading the car… ' + Math.round(p * 100) + '%'));
  status(0.62, 'Connecting…');
  const online = await net.connect($('room').value || 'main', $('name').value || 'Driver', $('color').value);
  if (online) world.clockOffset = net.offset;
  // own car
  myCar = new Car(carMeta, carGltf, { color: $('color').value, spotShadows: Q.spotShadows, shadows: Q.shadows, camRes: Q.camRes, lightCount: Q.lightCount });
  scene.add(myCar.root); veh = new Vehicle(world); me.carId = net.id; cars.set(net.id, { id: net.id, car: myCar, veh, name: $('name').value });
  const sp = world.meta.spawn; const slot = net.slot || 0; const off = (slot % 2 ? 1 : -1) * Math.ceil(slot / 2) * 9; // park along the street
  veh.place(sp.x - Math.sin(sp.yaw) * off, sp.z - Math.cos(sp.yaw) * off, sp.yaw);
  myCar.ensureCams(); wireCar(myCar, true); net.sit(net.id, 0);
  world.setTime($('time').value); traffic = new Traffic(world, scene, Q.traffic); people = new People(world, scene, traffic, Q.people); body = makeBody(scene);
  setupInput(); setupNet(); setupXR();
  // prime the scene so the first frame is not empty
  status(0.7, 'Streaming the neighbourhood…');
  syncCar(); const focus = myCar.root.position;
  await new Promise((res) => { const t0 = performance.now(); const tick = () => { world.update(camera, 0.3, focus); const n = world.loaded.size; status(0.7 + Math.min(0.28, n / 40 * 0.28), 'Streaming the neighbourhood… ' + n + ' tiles'); if ((world.nearReady && n > 6) || performance.now() - t0 > 60000) res(); else setTimeout(tick, 120); }; tick(); });
  await audio.init().catch(() => { });
  renderer.setAnimationLoop(loop);
}
function enter() {
  $('overlay').style.display = 'none'; $('hud').style.display = 'block'; audio.resume();
  if (isTouch) $('touch').style.display = 'block'; else if (!xr.active) { try { const r = $('gl').requestPointerLock?.(); if (r && r.catch) r.catch(() => { }); } catch { } }
  if (!enter.done) { enter.done = true; toast('You are in the driver seat on ' + (world.meta.spawn.street || 'the street') + '. Press I (or click the POWER button), then 4 for Drive.', 7000); }
}

function wireCar(car, mine) {
  car.onBlink = (on) => { if (insideCar() === car) audio.play(on ? 'indicator_tick' : 'indicator_tock', 0.5) || (on && audio.play('indicator_tick', 0.5)); };
  car.onWiper = () => { if (insideCar() === car) audio.play('wiper', 0.5); };
}
function insideCar() { return me.mode === 'seat' ? cars.get(me.carId)?.car : null; }

// ------------------------------------------------------------------ actions
function setGear(g) {
  if (!veh.power) return toast('Power is off — press I or the POWER button'); if (g === veh.gear) return;
  const v = veh.fwdSpeed; if ((g === 'P' && Math.abs(v) > 1) || (g === 'R' && v > 2) || (g === 'D' && v < -2)) { audio.play('warning_beep', 0.5); return toast('Stop the car first'); }
  veh.gear = g; audio.play('button_click', 0.6); myCar.press(g === 'P' || g === 'R' ? 'btn_gear_a' : 'btn_gear_b'); if (g === 'D' || g === 'R') { if (veh.epb) veh.epb = false; } toast('Gear: ' + g, 1200);
}
function setPower(on) { if (on === veh.power) return; if (!on && Math.abs(veh.fwdSpeed) > 1) return toast('Stop before switching off'); veh.power = on; myCar.lights.power = on; myCar.press('btn_start'); audio.play(on ? 'start_chime' : 'button_click', 0.6); if (!on) { veh.gear = 'P'; veh.epb = true; } toast(on ? 'Power on — select D (4) or R (2)' : 'Power off', 2200); }
function toggleDoor(ent, i, fromNet) {
  if (ent.id !== net.id && !fromNet) { net.event({ k: 'door', car: ent.id, i }); return; }
  const c = ent.car; const open = c.target.doors[i] < 0.5; c.target.doors[i] = open ? 1 : 0; const near = ent.car.root.position.distanceTo(camera.getWorldPosition(_v)) < 25;
  if (near) { if (open) audio.play('door_open', 0.8); else setTimeout(() => audio.play('door_close', 0.9), 520); }
}
function toggleWindow(i) { const c = myCar; c.target.windows[i] = c.target.windows[i] > 0.5 ? 0 : 1; audio.play('switch_click', 0.5); }
function cycleLights() { const L = myCar.lights; L.head = (L.head + 1) % 3; audio.play('switch_click', 0.6); toast('Headlights: ' + ['off', 'parking lights', 'low beam'][L.head], 1400); }
function setSignal(s) { const L = myCar.lights; if (s === 'L') { L.sigL = !L.sigL; L.sigR = false; } else if (s === 'R') { L.sigR = !L.sigR; L.sigL = false; } else if (s === 'cycle') { if (L.sigL) { L.sigL = false; L.sigR = true; } else if (L.sigR) L.sigR = false; else L.sigL = true; } else { L.sigL = L.sigR = false; } audio.play('switch_click', 0.5); }
function act(h, ent) {
  const car = ent.car; const mine = ent.id === net.id; const driver = mine && me.mode === 'seat' && me.seat === 0 && me.carId === net.id;
  switch (h.id) {
    case 'door': return toggleDoor(ent, h.arg);
    case 'seat': return sitIn(ent, h.arg);
  }
  if (!mine) return toast('Only the owner can operate that');
  const L = car.lights;
  switch (h.id) {
    case 'window': return toggleWindow(h.arg);
    case 'start': return setPower(!veh.power);
    case 'gear': return setGear(h.arg);
    case 'epb': veh.epb = !veh.epb; car.press('btn_epb'); audio.play('button_click', 0.6); return toast('Parking brake ' + (veh.epb ? 'on' : 'off'), 1200);
    case 'mode': veh.sport = !veh.sport; car.press('btn_mode'); audio.play('button_click', 0.6); return toast('Drive mode: ' + (veh.sport ? 'Sport' : 'Normal'), 1200);
    case 'pedalmode': veh.singlePedal = !veh.singlePedal; audio.play('button_click', 0.6); return toast('Single-pedal control ' + (veh.singlePedal ? 'on' : 'off'), 1400);
    case 'horn': ctl.hornClick = 0.45; return;
    case 'lights': return cycleLights();
    case 'signal': return setSignal('cycle');
    case 'highbeam': L.high = !L.high; audio.play('switch_click', 0.5); return;
    case 'wiper': L.wiper = (L.wiper + 1) % 4; audio.play('switch_click', 0.5); return toast('Wipers: ' + ['off', 'intermittent', 'low', 'high'][L.wiper], 1200);
    case 'hazard': L.hazard = !L.hazard; audio.play('button_click', 0.6); return;
    case 'dome': L.dome = !L.dome; audio.play('button_click', 0.5); return;
    case 'glovebox': car.target.glovebox = car.target.glovebox ? 0 : 1; audio.play('switch_click', 0.5); return;
    case 'visor': car.target.visors[h.arg] = car.target.visors[h.arg] ? 0 : 1; audio.play('switch_click', 0.3); return;
    case 'hood': car.target.hood = car.target.hood ? 0 : 1; audio.play(car.target.hood ? 'door_open' : 'trunk_close', 0.7) || audio.play('door_close', 0.7); return;
    case 'tailgate': car.target.tailgate = car.target.tailgate ? 0 : 1; audio.play(car.target.tailgate ? 'door_open' : 'trunk_close', 0.7) || audio.play('door_close', 0.7); return;
    case 'belt': me.belt = !me.belt; audio.play('seatbelt_click', 0.7); return toast('Seat belt ' + (me.belt ? 'fastened' : 'released'), 1200);
    case 'volume': return radioNext();
    case 'screen': mapScale = mapScale > 2.5 ? 0.8 : mapScale * 1.6; audio.play('button_click', 0.3); return;
    case 'lock': case 'click': case 'mirrordim': audio.play('button_click', 0.5); return;
  }
}
async function radioNext() { await audio.initRadio(); if (!audio.radio) return toast('Radio unavailable'); const n = audio.radio.stations.length; const i = audio.radio.i + 1 >= n ? -1 : audio.radio.i + 1; const st = audio.radioTune(i, world.now()); audio.play('button_click', 0.5); toast(st ? 'Radio: ' + st.call + ' · ' + st.name : 'Radio off', 1800); }
function seatWorld(ent, i, out) { return out.fromArray(SEATS[i].eye).applyMatrix4(ent.car.root.matrixWorld); }
function sitIn(ent, seat) {
  if (seat === 0 && ent.id !== net.id) return toast('The driver seat belongs to the car\'s owner');
  const occ = net.seatOwner(ent.id, seat); if (occ && occ !== net.id) return toast('That seat is taken');
  if (ent.veh && Math.abs(ent.veh.fwdSpeed) > 2 && me.mode === 'foot') return toast('The car is moving');
  const wasFoot = me.mode === 'foot'; me.mode = 'seat'; me.carId = ent.id; me.seat = seat; me.yaw = 0; me.pitch = 0; me.belt = false; me.cam = 'cockpit'; net.sit(ent.id, seat);
  if (ent.id === net.id) { /* own car */ }
  if (wasFoot) { const di = seat; if (ent.car.target.doors[di] < 0.5) { toggleDoor(ent, di); setTimeout(() => { if (ent.car.target.doors[di] > 0.5) toggleDoor(ent, di); }, 1300); } }
  toast(SEATS[seat].name + (ent.id !== net.id ? ' — ' + (ent.name || 'friend') + '\'s car' : ''), 1500); xrRecenter();
}
function getOut() {
  const ent = cars.get(me.carId); if (!ent) return; const sp = ent.veh ? Math.abs(ent.veh.fwdSpeed) : (ent.speed || 0); if (sp > 1.5) return toast('Stop the car before getting out');
  const s = SEATS[me.seat]; const di = me.seat; if (ent.car.target.doors[di] < 0.5) toggleDoor(ent, di); setTimeout(() => { if (ent.car.target.doors[di] > 0.5 && me.mode === 'foot') toggleDoor(ent, di); }, 1600);
  _v.fromArray(s.exit).applyMatrix4(ent.car.root.matrixWorld); me.foot.set(_v.x, world.surfaceY(_v.x, _v.z, _v.y + 1), _v.z);
  _e.setFromQuaternion(ent.car.root.quaternion, 'YXZ'); me.yaw = _e.y + (s.exit[0] < 0 ? -Math.PI / 2 : Math.PI / 2); me.pitch = 0; me.mode = 'foot'; net.sit(0, -1);
  if (ent.id === net.id) { ctl.throttle = 0; }
}
function getIn() { // nearest seat of the nearest car
  let best = null, bd = 3.2; for (const ent of cars.values()) for (let i = 0; i < 4; i++) { if (i === 0 && ent.id !== net.id) continue; const occ = net.seatOwner(ent.id, i); if (occ && occ !== net.id) continue; _v.fromArray(SEATS[i].exit).applyMatrix4(ent.car.root.matrixWorld); const d = Math.hypot(_v.x - me.foot.x, _v.z - me.foot.z); if (d < bd) { bd = d; best = [ent, i]; } }
  if (best) sitIn(best[0], best[1]); else toast('Walk up to a car door first');
}
function resetCar() { const p = veh.pos; const nr = world.nearestRoad(p.x, p.z, 400); if (!nr) return; const s = nr.seg; const dx = s.bx - s.ax, dz = s.bz - s.az; const l = Math.hypot(dx, dz) || 1; const mx = (s.ax + s.bx) / 2 + (-dz / l) * (s.r.o ? 0 : s.hw * 0.45), mz = (s.az + s.bz) / 2 + (dx / l) * (s.r.o ? 0 : s.hw * 0.45);
  if (s.br) veh.placeOnSurface(mx, (s.ya + s.yb) / 2, mz, Math.atan2(-dx, -dz)); else veh.place(mx, mz, Math.atan2(-dx, -dz)); toast('Car reset to ' + (s.r.n || 'the road'), 1500); }

// ------------------------------------------------------------------ input
function setupInput() {
  const canvas = $('gl');
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (!locked && started && !xr.active && !isTouch) { $('overlay').style.display = 'flex'; $('start').textContent = 'Resume'; } });
  document.addEventListener('mousemove', (e) => { if (!locked) return; const k = 0.0021 * (me.fov / 68); if (me.mode === 'seat' && me.cam === 'chase') { me.orbitYaw -= e.movementX * k; me.orbitPitch = Math.max(-0.1, Math.min(1.3, me.orbitPitch + e.movementY * k)); } else { me.yaw -= e.movementX * k; me.pitch = Math.max(-1.45, Math.min(1.45, me.pitch - e.movementY * k)); if (me.mode === 'seat') me.yaw = Math.max(-2.9, Math.min(2.9, me.yaw)); } });
  canvas.addEventListener('mousedown', (e) => { if (!locked) return; if (e.button === 0 && hover) act(hover, hoverCar); else if (e.button === 0 && hoverPerson) { camera.getWorldPosition(_v); const f = hoverPerson; const r = people.talk(f, world.dark, Math.atan2(_v.x - f.g.position.x, _v.z - f.g.position.z)); toast(r.name + ': “' + r.line + '”', 4200); } });
  canvas.addEventListener('wheel', (e) => { me.fov = Math.max(22, Math.min(95, me.fov + Math.sign(e.deltaY) * 4)); camera.fov = me.fov; camera.updateProjectionMatrix(); }, { passive: true });
  window.addEventListener('keydown', (e) => { if (e.code === 'F1') { e.preventDefault(); document.exitPointerLock?.(); return; } if (!started || $('overlay').style.display !== 'none') return; if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); if (e.repeat) return; keys.add(e.code); onKey(e.code); });
  window.addEventListener('keyup', (e) => keys.delete(e.code)); window.addEventListener('blur', () => keys.clear());
  if (isTouch) setupTouch();
}
function onKey(c) {
  const driving = me.mode === 'seat' && me.carId === net.id && me.seat === 0; const L = myCar.lights;
  switch (c) {
    case 'KeyF': return me.mode === 'seat' ? getOut() : getIn();
    case 'KeyC': if (me.mode === 'seat') { me.cam = me.cam === 'cockpit' ? 'chase' : 'cockpit'; me.orbitYaw = 0; } return;
    case 'KeyT': { const o = ['night', 'dawn', 'day', 'dusk', 'live']; world.setTime(o[(o.indexOf(world.time) + 1) % o.length]); return toast('Time: ' + (world.time === 'live' ? 'the real time in Fort Worth' : world.time), 1600); }
    case 'KeyY': { const o = ['auto', 'clear', 'rain']; world.setWeather(o[(o.indexOf(world.weather.mode) + 1) % 3]); return toast('Weather: ' + (world.weather.mode === 'auto' ? 'changing by the hour' : world.weather.mode), 1600); }
    case 'KeyU': world.timeRate = world.timeRate > 1 ? 1 : 240; return toast(world.timeRate > 1 ? 'Time-lapse: four minutes a second' : 'Time at normal speed', 1600);
    case 'KeyM': mapScale = mapScale > 2.5 ? 0.8 : mapScale * 1.6; return;
  }
  if (!driving) return;
  switch (c) {
    case 'KeyI': return setPower(!veh.power);
    case 'Digit1': return setGear('P'); case 'Digit2': return setGear('R'); case 'Digit3': return setGear('N'); case 'Digit4': return setGear('D');
    case 'KeyG': return setGear(veh.gear === 'D' ? 'R' : 'D');
    case 'KeyQ': return setSignal('L'); case 'KeyE': return setSignal('R');
    case 'KeyX': L.hazard = !L.hazard; return audio.play('button_click', 0.6);
    case 'KeyL': return cycleLights(); case 'KeyK': L.high = !L.high; return audio.play('switch_click', 0.5);
    case 'KeyV': L.wiper = (L.wiper + 1) % 4; return toast('Wipers: ' + ['off', 'intermittent', 'low', 'high'][L.wiper], 1200);
    case 'KeyO': L.dome = !L.dome; return audio.play('button_click', 0.5);
    case 'KeyB': me.belt = !me.belt; audio.play('seatbelt_click', 0.7); return toast('Seat belt ' + (me.belt ? 'fastened' : 'released'), 1200);
    case 'KeyR': return resetCar();
    case 'KeyN': return radioNext();
    case 'KeyP': veh.singlePedal = !veh.singlePedal; return toast('Single-pedal control ' + (veh.singlePedal ? 'on' : 'off'), 1400);
  }
}
const touch = { l: false, r: false, b: false, g: false };
function setupTouch() { const bind = (id, k) => { const el = $(id); el.addEventListener('touchstart', (e) => { e.preventDefault(); touch[k] = true; }); el.addEventListener('touchend', (e) => { e.preventDefault(); touch[k] = false; }); }; bind('tL', 'l'); bind('tR', 'r'); bind('tB', 'b'); bind('tG', 'g');
  let last = null; const c = $('gl'); c.addEventListener('touchstart', (e) => { last = e.touches[0]; touch.moved = 0; }); c.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (last) { me.yaw -= (t.clientX - last.clientX) * 0.005; me.pitch = Math.max(-1.4, Math.min(1.4, me.pitch - (t.clientY - last.clientY) * 0.005)); touch.moved += Math.abs(t.clientX - last.clientX) + Math.abs(t.clientY - last.clientY); } last = t; e.preventDefault(); }, { passive: false });
  c.addEventListener('touchend', (e) => { if (touch.moved < 8 && last) { const ndc = new THREE.Vector2(last.clientX / innerWidth * 2 - 1, -(last.clientY / innerHeight) * 2 + 1); const rc = new THREE.Raycaster(); rc.setFromCamera(ndc, camera); const r = pickAll(rc.ray.origin, rc.ray.direction); if (r) act(r[0], r[1]); } last = null; }); }
function readControls(dt) {
  const driving = me.mode === 'seat' && me.carId === net.id && me.seat === 0; let thr = 0, brk = 0, st = 0, analog = false, hb = false, horn = false;
  if (driving) {
    if (keys.has('KeyW') || keys.has('ArrowUp') || touch.g) thr = 1; if (keys.has('KeyS') || keys.has('ArrowDown') || touch.b) brk = 1; if (keys.has('KeyA') || keys.has('ArrowLeft') || touch.l) st -= 1; if (keys.has('KeyD') || keys.has('ArrowRight') || touch.r) st += 1; hb = keys.has('Space'); horn = keys.has('KeyH');
    const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(g => g && g.connected && g.mapping === 'standard') : null;
    if (gp && !xr.active) { const ax = gp.axes[0] || 0; if (Math.abs(ax) > 0.06) { st = Math.sign(ax) * Math.pow(Math.abs(ax), 1.6); analog = true; } thr = Math.max(thr, gp.buttons[7]?.value || 0); brk = Math.max(brk, gp.buttons[6]?.value || 0); hb = hb || gp.buttons[0]?.pressed; horn = horn || gp.buttons[2]?.pressed; }
    if (xr.active) { const x = xrInput(); if (x) { thr = Math.max(thr, x.thr); brk = Math.max(brk, x.brk); if (Math.abs(x.steer) > 0.08) { st = Math.sign(x.steer) * Math.pow(Math.abs(x.steer), 1.5); analog = true; } } }
  }
  // speed-sensitive steering: full lock when parking, a few degrees at highway speed
  const v = Math.abs(veh.fwdSpeed); const lim = 1 / (1 + (v / 11) ** 2 * 1.2); const target = st * Math.max(lim, 0.05);
  const rate = analog ? 5 : (Math.sign(target - ctl.steer) === Math.sign(ctl.steer) || ctl.steer === 0 ? 1.5 : 3.2) * (0.6 + lim * 0.8);
  ctl.steer += Math.max(-rate * dt, Math.min(rate * dt, target - ctl.steer));
  ctl.throttle += (thr - ctl.throttle) * Math.min(1, dt * (thr > ctl.throttle ? 5 : 9)); ctl.brake += (brk - ctl.brake) * Math.min(1, dt * (brk > ctl.brake ? 8 : 12)); ctl.handbrake = hb;
  ctl.hornClick = Math.max(0, (ctl.hornClick || 0) - dt); ctl.horn = horn || ctl.hornClick > 0;
  if (!driving) { ctl.throttle = 0; ctl.brake = veh.gear === 'P' ? 0 : 0.4; }
}

// ------------------------------------------------------------------ multiplayer
function packFlags(c, v) { const L = c.lights, t = c.target; let f = 0; f |= L.power ? 1 : 0; f |= (L.head & 3) << 1; f |= L.high ? 8 : 0; f |= L.sigL ? 16 : 0; f |= L.sigR ? 32 : 0; f |= L.hazard ? 64 : 0; f |= L.brake ? 128 : 0; f |= L.reverse ? 256 : 0; f |= L.dome ? 512 : 0; for (let i = 0; i < 4; i++) { if (t.doors[i] > 0.5) f |= 1 << (10 + i); if (t.windows[i] > 0.5) f |= 1 << (14 + i); } f |= t.tailgate > 0.5 ? 1 << 18 : 0; f |= t.hood > 0.5 ? 1 << 19 : 0; f |= (L.wiper & 3) << 20; f |= ['P', 'R', 'N', 'D'].indexOf(v.gear) << 22; return f; }
function unpackFlags(c, f) { const L = c.lights, t = c.target; L.power = !!(f & 1); L.head = (f >> 1) & 3; L.high = !!(f & 8); L.sigL = !!(f & 16); L.sigR = !!(f & 32); L.hazard = !!(f & 64); L.brake = !!(f & 128); L.reverse = !!(f & 256); L.dome = !!(f & 512); for (let i = 0; i < 4; i++) { t.doors[i] = (f >> (10 + i)) & 1; t.windows[i] = (f >> (14 + i)) & 1; } t.tailgate = (f >> 18) & 1; t.hood = (f >> 19) & 1; L.wiper = (f >> 20) & 3; return ['P', 'R', 'N', 'D'][(f >> 22) & 3]; }
const r3 = (x) => Math.round(x * 1000) / 1000;
function sendState() {
  const p = myCar.root.position, q = myCar.root.quaternion; camera.getWorldPosition(_v);
  const s = { m: me.mode === 'seat' ? 1 : 0, c: me.carId, k: me.seat, p: [r3(me.mode === 'foot' ? me.foot.x : _v.x), r3(me.mode === 'foot' ? me.foot.y : _v.y), r3(me.mode === 'foot' ? me.foot.z : _v.z)], y: r3(me.yaw + xr.yaw), x: r3(me.pitch),
    v: [r3(p.x), r3(p.y), r3(p.z), r3(q.x), r3(q.y), r3(q.z), r3(q.w), r3(veh.steer), r3(veh.fwdSpeed), ...veh.wheels.map(w => r3(w.comp)), packFlags(myCar, veh), r3(veh.soc)] };
  net.sendState(s);
}
function makeAvatar(color, name) {
  const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(0x445566), 0.35), roughness: 0.8 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9b9a0, roughness: 0.7 })); head.position.y = 0; g.add(head);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), mat); torso.position.y = -0.47; g.add(torso);
  const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.62, 4, 8), new THREE.MeshStandardMaterial({ color: 0x1c2430, roughness: 0.9 })); legs.position.y = -1.18; g.add(legs); g.userData.legs = legs;
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = '600 30px Helvetica, Arial'; x.textAlign = 'center'; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 8, 256, 44); x.fillStyle = '#fff'; x.fillText(name, 128, 41);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false })); sp.scale.set(0.9, 0.225, 1); sp.position.y = 0.32; g.add(sp); g.userData.label = sp; return g;
}
function addRemote(p) {
  if (remotes.has(p.id)) return; const car = new Car(carMeta, carGltf, { remote: true, color: p.color, lightCount: 1, tailLight: false, lightScale: 0.8 }); scene.add(car.root); wireCar(car, false);
  const sp = world.meta.spawn; const off = (p.slot % 2 ? 1 : -1) * Math.ceil(p.slot / 2) * 9; car.root.position.set(sp.x - Math.sin(sp.yaw) * off, world.surfaceY(sp.x, sp.z, 1e9), sp.z - Math.cos(sp.yaw) * off); car.root.quaternion.setFromAxisAngle(Y, sp.yaw);
  const av = makeAvatar(p.color, p.name); scene.add(av); const ent = { id: p.id, car, veh: null, name: p.name, speed: 0, wheels: [0, 1, 2, 3].map(() => ({ comp: 0, spin: 0, steer: 0 })), steer: 0, gear: 'P', soc: 0.8 };
  cars.set(p.id, ent); remotes.set(p.id, { p, ent, av }); updatePlayers();
}
function removeRemote(p) { const r = remotes.get(p.id); if (!r) return; scene.remove(r.ent.car.root); scene.remove(r.av); if (r.fig) scene.remove(r.fig.g); r.ent.car.dispose(); remotes.delete(p.id); cars.delete(p.id); if (me.mode === 'seat' && me.carId === p.id) { me.mode = 'foot'; camera.getWorldPosition(_v); me.foot.set(_v.x, world.surfaceY(_v.x, _v.z, _v.y), _v.z); toast('The driver left — you are on foot'); } updatePlayers(); }
function setupNet() {
  for (const p of net.players.values()) addRemote(p);
  net.on('joined', (p) => { addRemote(p); toast(p.name + ' joined'); }); net.on('left', (p) => { removeRemote(p); toast(p.name + ' left'); });
  net.on('seats', (m) => { if (m.by === net.id && m.ok === false) { toast('That seat is taken'); if (me.mode === 'seat' && me.carId !== net.id) getOutForced(); } });
  net.on('ev', (id, e) => { if (e.k === 'door' && e.car === net.id) toggleDoor(cars.get(net.id), e.i, true); if (e.k === 'horn') { const r = remotes.get(id); if (r) r.horn = e.on; } });
  net.on('status', (ok) => { if (!ok) toast('Multiplayer disconnected — driving solo'); updatePlayers(); });
  updatePlayers();
}
function getOutForced() { me.mode = 'foot'; camera.getWorldPosition(_v); me.foot.set(_v.x + 1.5, world.surfaceY(_v.x, _v.z, _v.y), _v.z); }
function updatePlayers() { const names = [$('name').value + ' (you)', ...[...net.players.values()].map(p => p.name)]; $('players').innerHTML = (net.connected ? 'Room “' + net.room + '” · ' + names.length + ' online<br>' : 'Solo (no server)<br>') + names.map(n => n.replace(/[<>&]/g, '')).join('<br>'); }
function updateRemotes(dt) {
  veh.extraCircles.length = 0;
  for (const r of remotes.values()) {
    const sm = net.sample(r.p); const ent = r.ent, car = ent.car; if (!sm) { car.update(dt, null); continue; }
    const [a, b, t] = sm; const va = a.v, vb = b.v;
    if (va && vb) { car.root.position.set(va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t, va[2] + (vb[2] - va[2]) * t); _q.set(va[3], va[4], va[5], va[6]); _q2.set(vb[3], vb[4], vb[5], vb[6]); car.root.quaternion.copy(_q).slerp(_q2, Math.min(1, t)).normalize();
      ent.steer = va[7] + (vb[7] - va[7]) * t; ent.speed = va[8] + (vb[8] - va[8]) * t; ent.gear = unpackFlags(car, vb[13]); ent.soc = vb[14];
      const d = -ent.steer * SPEC.maxSteer; ent.wheels.forEach((w, i) => { w.comp = va[9 + i] + (vb[9 + i] - va[9 + i]) * t; w.spin += ent.speed / SPEC.wheelR * dt; w.steer = i < 2 ? d : 0; });
      car.root.updateMatrixWorld(true); car.update(dt, { wheels: ent.wheels, steer: ent.steer, throttle: 0, brake: car.lights.brake ? 0.5 : 0 });
      for (const lz of [-1.1, 0, 1.1]) { _v.set(0, 0.5, lz).applyMatrix4(car.root.matrixWorld); veh.extraCircles.push([_v.x, _v.z, 0.92, _v.y]); } }
    // avatar: a real person once the people have loaded (seated in the car, or walking), the plain figure until then
    if (people && people.ready && !r.fig) { r.fig = people.make(people.names[r.p.id % people.names.length]); scene.add(r.fig.g); scene.remove(r.av); }
    if (r.fig) { const s2 = b, f = r.fig; if (s2.m === 1) { const host = cars.get(s2.c); if (host) { seatWorld(host, s2.k, _v); _e.setFromQuaternion(host.car.root.quaternion, 'YXZ'); f.g.position.set(_v.x - Math.sin(_e.y) * -0.12, _v.y - 0.97, _v.z - Math.cos(_e.y) * -0.12); f.g.rotation.y = _e.y + Math.PI; people.pose(f, 'sit'); f.g.visible = !(me.mode === 'seat' && me.carId === s2.c && me.seat === s2.k); } }
      else { const pa = a.p, pb = b.p; const x = pa[0] + (pb[0] - pa[0]) * t, z = pa[2] + (pb[2] - pa[2]) * t; const moving = Math.hypot(pb[0] - pa[0], pb[2] - pa[2]) > 0.03; f.g.position.set(x, pa[1] + (pb[1] - pa[1]) * t + 0.03, z); f.g.rotation.y = (s2.y || 0) + Math.PI; people.pose(f, moving ? 'walk' : 'idle'); f.g.visible = true; }
      f.mixer.update(dt); continue; }
    const av = r.av; const s = b; if (s.m === 1) { const host = cars.get(s.c); if (host) { seatWorld(host, s.k, _v); av.position.copy(_v); _e.setFromQuaternion(host.car.root.quaternion, 'YXZ'); av.rotation.set(0, _e.y + (s.y || 0), 0); av.userData.legs.visible = false; av.userData.label.visible = false; av.visible = !(me.mode === 'seat' && me.carId === s.c && me.seat === s.k); } }
    else { const pa = a.p, pb = b.p; av.position.set(pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t + 1.62, pa[2] + (pb[2] - pa[2]) * t); av.rotation.set(0, s.y || 0, 0); av.userData.legs.visible = true; av.userData.label.visible = true; av.visible = true; }
  }
}

// ------------------------------------------------------------------ VR
function setupXR() {
  if (!navigator.xr) return; const btn = $('vr');
  navigator.xr.isSessionSupported('immersive-vr').then((ok) => { if (!ok) return; btn.style.display = 'block';
    btn.onclick = async () => { if (xr.active) return renderer.xr.getSession()?.end(); try { const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking'] }); await renderer.xr.setSession(session); audio.resume(); $('overlay').style.display = 'none'; $('hud').style.display = 'block'; } catch (e) { toast('VR failed: ' + e.message); } }; }).catch(() => { });
  renderer.xr.addEventListener('sessionstart', () => { xr.active = true; $('vr').textContent = 'Exit VR'; renderer.xr.setFoveation?.(1); setTimeout(xrRecenter, 400); });
  renderer.xr.addEventListener('sessionend', () => { xr.active = false; $('vr').textContent = 'Enter VR'; camera.position.set(0, 0, 0); camera.quaternion.identity(); camera.fov = me.fov; camera.updateProjectionMatrix(); });
  for (let i = 0; i < 2; i++) { const c = renderer.xr.getController(i); const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.6 })); line.scale.z = 1.2; c.add(line); c.userData.line = line; rig.add(c);
    c.addEventListener('connected', (e) => { c.userData.hand = e.data.handedness; c.userData.src = e.data; }); c.addEventListener('disconnected', () => { c.userData.src = null; });
    c.addEventListener('squeezestart', () => { const h = c.userData.hover; if (h) act(h[0], h[1]); });
    c.addEventListener('selectstart', () => { const driving = me.mode === 'seat' && me.carId === net.id && me.seat === 0; if (driving) return; const h = c.userData.hover; if (h) act(h[0], h[1]); });
    xr.controllers.push(c); }
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 64; const tx = new THREE.CanvasTexture(cv); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); sp.scale.set(0.32, 0.04, 1); sp.renderOrder = 10; sp.visible = false; xr.label = { cv, tx, sp, t: 0 }; scene.add(sp);
}
function xrLabel(text, at) { const L = xr.label; if (!L) return; const g = L.cv.getContext('2d'); g.clearRect(0, 0, 512, 64); g.fillStyle = 'rgba(8,12,18,.8)'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#fff'; g.font = '28px Helvetica, Arial'; g.textAlign = 'center'; g.fillText(text.slice(0, 34), 256, 42); L.tx.needsUpdate = true; L.sp.visible = true; L.t = 2.5; if (at) L.sp.position.copy(at); else { camera.getWorldPosition(_v); camera.getWorldDirection(_v2); L.sp.position.copy(_v).addScaledVector(_v2, 0.6).add(_v2.set(0, -0.12, 0)); } }
function xrRecenter() { if (!xr.active) return; const xc = renderer.xr.getCamera(); xr.base.copy(camera.position); _e.setFromQuaternion(camera.quaternion, 'YXZ'); xr.headYaw = _e.y; }
let xrBtnPrev = {};
function xrInput() {
  const s = renderer.xr.getSession(); if (!s) return null; const o = { thr: 0, brk: 0, steer: 0, moveX: 0, moveY: 0, turn: 0 };
  for (const src of s.inputSources) { const gp = src.gamepad; if (!gp) continue; const h = src.handedness; const sx = gp.axes[2] || 0, sy = gp.axes[3] || 0; const pressed = (i) => gp.buttons[i]?.pressed; const edge = (name, i) => { const p = !!pressed(i); const was = xrBtnPrev[h + name]; xrBtnPrev[h + name] = p; return p && !was; };
    if (h === 'right') { o.thr = gp.buttons[0]?.value || 0; o.turn = sx; if (edge('a', 4)) onKey(me.mode === 'seat' && me.seat === 0 && me.carId === net.id ? (veh.power ? 'KeyG' : 'KeyI') : 'KeyF'); if (edge('b', 5)) xrRecenter(); }
    if (h === 'left') { o.brk = gp.buttons[0]?.value || 0; o.steer = sx; o.moveX = sx; o.moveY = sy; if (edge('x', 4)) onKey('KeyF'); if (edge('y', 5)) onKey('KeyL'); } }
  return o;
}

// ------------------------------------------------------------------ per-frame
function syncCar() { myCar.root.position.copy(veh.modelPos.lengthSq() ? veh.modelPos : veh.pos.clone().sub(SPEC.com)); myCar.root.quaternion.copy(veh.quat); myCar.root.updateMatrixWorld(true); }
function pickAll(origin, dir) { let best = null; const seated = me.mode === 'seat'; for (const ent of cars.values()) { if (ent.car.root.position.distanceToSquared(origin) > 64) continue; const inside = seated && me.carId === ent.id; const h = ent.car.pick(origin, dir, inside ? 1.5 : 3.0, inside && me.cam === 'cockpit', inside ? me.seat : -1); if (h) { best = [h, ent]; if (inside) break; } } return best; }
function updateFoot(dt) {
  let fx = 0, fz = 0; if (keys.has('KeyW') || keys.has('ArrowUp')) fz -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) fz += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) fx -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) fx += 1; let yaw = me.yaw;
  if (xr.active) { const x = xrInput(); if (x) { fx = x.moveX; fz = x.moveY; if (Math.abs(x.turn) > 0.7) { if (!xr.turned) { xr.yaw -= Math.sign(x.turn) * Math.PI / 6; xr.turned = true; } } else xr.turned = false; } _e.setFromQuaternion(camera.quaternion, 'YXZ'); yaw = xr.yaw + _e.y; }
  const l = Math.hypot(fx, fz); if (l > 0.1) { const sp = (keys.has('ShiftLeft') ? 4.6 : 1.7) * Math.min(1, l); const s = Math.sin(yaw), c = Math.cos(yaw); const dx = (fx * c + fz * s) / l * sp * dt, dz = (-fx * s + fz * c) / l * sp * dt; me.foot.x += dx; me.foot.z += dz; me.stepAcc += Math.hypot(dx, dz); if (me.stepAcc > 0.78) { me.stepAcc = 0; audio.play('footstep', 0.35, 0.9 + Math.random() * 0.2, true); } }
  const hits = updateFoot.h || (updateFoot.h = []); const n = world.collideCircle(me.foot.x, me.foot.z, 0.3, me.foot.y + 0.2, me.foot.y + 1.7, hits); for (let i = 0; i < n; i++) { me.foot.x += hits[i].nx * hits[i].depth; me.foot.z += hits[i].nz * hits[i].depth; }
  for (const ent of cars.values()) { _m.copy(ent.car.root.matrixWorld).invert(); _v.set(me.foot.x, me.foot.y + 0.6, me.foot.z).applyMatrix4(_m); const hx = SPEC.halfW + 0.28, z0 = SPEC.front - 0.28, z1 = SPEC.rear + 0.28; if (Math.abs(_v.x) < hx && _v.z > z0 && _v.z < z1 && Math.abs(_v.y - 0.6) < 1.4) { const px = hx - Math.abs(_v.x), pz = Math.min(_v.z - z0, z1 - _v.z); if (px < pz) _v.x = Math.sign(_v.x || 1) * hx; else _v.z = (_v.z - z0 < z1 - _v.z) ? z0 : z1; _v.applyMatrix4(ent.car.root.matrixWorld); me.foot.x = _v.x; me.foot.z = _v.z; } }
  const lim = world.meta.half - 12; me.foot.x = Math.max(-lim, Math.min(lim, me.foot.x)); me.foot.z = Math.max(-lim, Math.min(lim, me.foot.z));
  const gy = world.surfaceY(me.foot.x, me.foot.z, me.foot.y + 0.6); me.foot.y += (gy - me.foot.y) * Math.min(1, dt * 12);
}
function updateCamera(dt) {
  if (window.__dbgCam) { const d = window.__dbgCam; rig.position.set(d[0], d[1], d[2]); rig.quaternion.identity(); camera.position.set(0, 0, 0); _m.lookAt(rig.position, _v.set(d[3], d[4], d[5]), Y); camera.quaternion.setFromRotationMatrix(_m); return; }
  if (me.mode === 'foot') { rig.position.set(me.foot.x, me.foot.y + (xr.active ? 1.62 - Math.min(1.62, 0) : 1.66), me.foot.z); if (xr.active) { rig.position.y = me.foot.y + 1.62; rig.quaternion.setFromAxisAngle(Y, xr.yaw); rig.position.sub(_v.copy(xr.base).applyQuaternion(rig.quaternion)); } else { rig.quaternion.identity(); _e.set(me.pitch, me.yaw, 0); camera.quaternion.setFromEuler(_e); camera.position.set(0, 0, 0); } return; }
  const ent = cars.get(me.carId); if (!ent) { me.mode = 'foot'; return; } const root = ent.car.root;
  if (me.cam === 'chase' && !xr.active) { const sp = ent.veh ? ent.veh.speed : 0; _e.setFromQuaternion(root.quaternion, 'YXZ'); const yaw = _e.y + me.orbitYaw; const dist = 6.2 + sp * 0.05, h = 1.2 + Math.sin(me.orbitPitch) * dist; const d = Math.cos(me.orbitPitch) * dist; _v.set(root.position.x + Math.sin(yaw) * d, root.position.y + h, root.position.z + Math.cos(yaw) * d); const gy = world.height(_v.x, _v.z) + 0.4; if (_v.y < gy) _v.y = gy;
    if (me.chase.distanceToSquared(_v) > 900) me.chase.copy(_v); me.chase.lerp(_v, Math.min(1, dt * 7)); rig.position.copy(me.chase); rig.quaternion.identity(); camera.position.set(0, 0, 0); _m.lookAt(me.chase, _v2.copy(root.position).add(_v.set(0, 1.0, 0)), Y); camera.quaternion.setFromRotationMatrix(_m); return; }
  const eye = SEATS[me.seat].eye; _v.fromArray(eye); if (ent.veh && !xr.active) { _v.x -= ent.veh.accelG.x * 0.012; _v.z += ent.veh.accelG.z * 0.014; }
  rig.quaternion.copy(root.quaternion); rig.position.copy(_v).applyMatrix4(root.matrixWorld);
  if (xr.active) { _q.setFromAxisAngle(Y, -(xr.headYaw || 0)); rig.quaternion.multiply(_q); rig.position.sub(_v.copy(xr.base).applyQuaternion(rig.quaternion)); }
  else { _e.set(me.pitch, me.yaw, 0); camera.quaternion.setFromEuler(_e); camera.position.set(0, 0, 0); }
}
// traffic law for the player: speed limits, red lights, stop signs, collisions with other road users
function cite(kind, text) { const now = performance.now(); if (law.cool[kind] && now - law.cool[kind] < 20000) return; law.cool[kind] = now; law.cites.push(text); law.last = text; audio.play('warning_beep', 0.6, 0.8); toast('Citation ' + law.cites.length + ': ' + text, 5000); }
function checkLaws(dt) {
  const driving = me.mode === 'seat' && me.carId === net.id && me.seat === 0; if (!driving) return; const p = veh.pos; _v.set(0, 0, -1).applyQuaternion(veh.quat); const fx = _v.x, fz = _v.z; const v = veh.fwdSpeed, mph = Math.abs(v) * 2.23694;
  const nr = world.nearestRoad(p.x, p.z, 8); const limit = nr ? (nr.seg.r.s || DEF_MPH[nr.seg.r.c] || 30) : 0; law.limit = limit;
  if (limit && mph > limit + 7) { law.speedT += dt; if (law.speedT > 3) { cite('speed', 'Speeding, ' + Math.round(mph) + ' mph in a ' + limit + ' mph zone'); law.speedT = 0; } } else law.speedT = 0;
  const sig = v > 0.5 ? world.signalAhead(p.x, p.z, fx, fz) : null; if (law.lastSig && law.lastSig.dist < 7 && law.lastSig.state === 0 && (!sig || sig.dist > law.lastSig.dist + 12) && v > 2.5) cite('red', 'Ran a red light'); if (sig || v > 0.5) law.lastSig = sig;
  const ctl = v > 0.3 ? world.controlAhead(p.x, p.z, fx, fz, 30) : null; if (ctl && ctl.kind === 0) { if (!law.stop || law.stop.id !== ctl.id) law.stop = { id: ctl.id, min: 99, near: false }; if (ctl.dist < 14) { law.stop.near = true; law.stop.min = Math.min(law.stop.min, Math.abs(v)); } } else if (law.stop) { if (law.stop.near && law.stop.min > 1.4 && v > 1.5) cite('stop', 'Did not stop at a stop sign'); if (!ctl || ctl.kind !== 0) law.stop = null; }
  if (Math.abs(v) < 0.2 && law.stop) law.stop.min = 0;
  if (veh.impact > 2.2 && veh.extraCircles.length) { let hit = false; for (const c of veh.extraCircles) if (Math.hypot(c[0] - p.x, c[1] - p.z) < 3.6) hit = true; if (hit) cite('crash', 'Collision with another road user'); }
}
// sparks and dust: small bursts where the car hits something or slides on loose ground
const fx = { n: 260, i: 0, pts: null, vel: null, life: null };
function fxBurst(x, y, z, count, spread, up, r, g, b, life) { if (!fx.pts) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fx.n * 3).fill(-9999), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(fx.n * 3), 3)); fx.pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true })); fx.pts.frustumCulled = false; scene.add(fx.pts); fx.vel = new Float32Array(fx.n * 3); fx.life = new Float32Array(fx.n); fx.col = new Float32Array(fx.n * 4); }
  const p = fx.pts.geometry.attributes.position.array; for (let k = 0; k < count; k++) { const i = fx.i++ % fx.n; p[i * 3] = x + (Math.random() - 0.5) * 0.4; p[i * 3 + 1] = y + Math.random() * 0.2; p[i * 3 + 2] = z + (Math.random() - 0.5) * 0.4; fx.vel[i * 3] = (Math.random() - 0.5) * spread; fx.vel[i * 3 + 1] = Math.random() * up; fx.vel[i * 3 + 2] = (Math.random() - 0.5) * spread; fx.life[i] = life * (0.5 + Math.random() * 0.5); fx.col[i * 4] = r; fx.col[i * 4 + 1] = g; fx.col[i * 4 + 2] = b; fx.col[i * 4 + 3] = fx.life[i]; } }
function updateFx(dt) {
  _v.set(0, 0, -1).applyQuaternion(veh.quat);
  if (veh.impact > 2.2) { const k = Math.min(1, veh.impact / 9); fxBurst(veh.pos.x + _v.x * 1.9, veh.pos.y + 0.1, veh.pos.z + _v.z * 1.9, Math.round(10 + 26 * k), 5 + 6 * k, 3 + 3 * k, 6, 3.2, 0.8, 0.5); fxBurst(veh.pos.x + _v.x * 1.9, veh.pos.y, veh.pos.z + _v.z * 1.9, 10, 2.5, 1.2, 0.45, 0.42, 0.38, 1.4); }
  veh.wheels.forEach((w) => { if (!w.onGround) return; if (w.type === 2 && veh.speed > 1) { _v2.copy(w.local).applyQuaternion(veh.quat).add(veh.pos); world.markTrack(_v2.x, _v2.z); if ((w.skid > 0.15 || veh.speed > 9) && Math.random() < 0.35) fxBurst(_v2.x, w.surf.y + 0.05, _v2.z, 1, 1.2, 0.9, 0.36, 0.31, 0.24, 1.1); } });
  if (!fx.pts) return; const p = fx.pts.geometry.attributes.position.array, c = fx.pts.geometry.attributes.color.array; for (let i = 0; i < fx.n; i++) { if (fx.life[i] <= 0) continue; fx.life[i] -= dt; const dust = fx.col[i * 4] < 1; fx.vel[i * 3 + 1] -= (dust ? 1.2 : 9.8) * dt; p[i * 3] += fx.vel[i * 3] * dt; p[i * 3 + 1] += fx.vel[i * 3 + 1] * dt; p[i * 3 + 2] += fx.vel[i * 3 + 2] * dt; const k = Math.max(0, fx.life[i] / fx.col[i * 4 + 3]); c[i * 3] = fx.col[i * 4] * k; c[i * 3 + 1] = fx.col[i * 4 + 1] * k; c[i * 3 + 2] = fx.col[i * 4 + 2] * k; if (fx.life[i] <= 0) p[i * 3 + 1] = -9999; }
  fx.pts.geometry.attributes.position.needsUpdate = true; fx.pts.geometry.attributes.color.needsUpdate = true;
}
// tyre marks: a ring buffer of dark strips laid where a tyre is sliding
const skid = { max: 900, n: 0, last: [null, null, null, null], mesh: null };
function updateSkid() {
  if (!skid.mesh) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(skid.max * 18), 3)); g.setDrawRange(0, 0); skid.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -7, polygonOffsetUnits: -7 })); skid.mesh.frustumCulled = false; skid.mesh.renderOrder = 2; scene.add(skid.mesh); }
  const arr = skid.mesh.geometry.attributes.position.array; let dirty = false; _q.copy(veh.quat);
  veh.wheels.forEach((w, i) => { if (!(w.onGround && w.skid > 0.3 && w.type !== 2)) { skid.last[i] = null; return; } _v.copy(w.local).applyQuaternion(_q).add(veh.pos); const p = [_v.x, w.surf.y + 0.02, _v.z]; const l = skid.last[i]; if (!l) { skid.last[i] = p; return; } const dx = p[0] - l[0], dz = p[2] - l[2]; const d = Math.hypot(dx, dz); if (d < 0.2) return; if (d > 3) { skid.last[i] = p; return; }
    const nx = -dz / d * 0.1, nz = dx / d * 0.1; const o = (skid.n % skid.max) * 18; const q4 = [[l[0] - nx, l[1], l[2] - nz], [l[0] + nx, l[1], l[2] + nz], [p[0] + nx, p[1], p[2] + nz], [p[0] - nx, p[1], p[2] - nz]]; let k = 0; for (const vi of [0, 1, 2, 0, 2, 3]) { arr[o + k++] = q4[vi][0]; arr[o + k++] = q4[vi][1]; arr[o + k++] = q4[vi][2]; } skid.n++; skid.last[i] = p; dirty = true; });
  if (dirty) { skid.mesh.geometry.attributes.position.needsUpdate = true; skid.mesh.geometry.setDrawRange(0, Math.min(skid.n, skid.max) * 6); }
}
// your own body: seated with hands on the wheel and feet at the pedals, or walking under you
const _bo = { pos: new THREE.Vector3(), head: new THREE.Vector3(), fwd: new THREE.Vector3(), hands: [null, null], moved: 0, low: 0, seat: null }, _bs = { pelvis: new THREE.Vector3(), feet: [new THREE.Vector3(), new THREE.Vector3()] }, _hl = new THREE.Vector3(), _hr = new THREE.Vector3(), _bl = new THREE.Vector3();
function updateBody(dt) {
  if (!body) return; const first = me.mode === 'foot' || me.cam === 'cockpit'; body.g.visible = first && !window.__dbgCam; if (!body.g.visible) return;
  camera.getWorldPosition(_bo.head); _bo.hands[0] = _bo.hands[1] = null; _bo.seat = null; _bo.low = 0;
  if (xr.active) xr.controllers.forEach((c) => { if (c.userData.src && (c.userData.hand === 'left' || c.userData.hand === 'right')) { const v = c.userData.hand === 'left' ? _hl : _hr; c.getWorldPosition(v); _bo.hands[c.userData.hand === 'left' ? 0 : 1] = v; } });
  if (me.mode === 'seat') { const ent = cars.get(me.carId); if (!ent) return; const root = ent.car.root, eye = SEATS[me.seat].eye; const M = root.matrixWorld; _bo.fwd.set(0, 0, -1).transformDirection(M); _bo.fwd.y = 0; _bo.fwd.normalize();
    _bs.pelvis.set(eye[0], 0.62, eye[2] + 0.14).applyMatrix4(M); const front = me.seat < 2; const fz = eye[2] - (front ? 0.95 : 0.62), fy = front ? 0.44 : 0.4;
    if (me.seat === 0) { _bs.feet[0].set(eye[0] - 0.17, 0.43, fz + 0.05).applyMatrix4(M); _bs.feet[1].set(-0.158, 0.47 - 0.04 * ctl.throttle, -0.79 - 0.04 * ctl.throttle).applyMatrix4(M); if (ctl.brake > 0.1) _bs.feet[1].set(-0.289, 0.47 - 0.03 * ctl.brake, -0.80 - 0.03 * ctl.brake).applyMatrix4(M); }
    else { _bs.feet[0].set(eye[0] - 0.11, fy, fz).applyMatrix4(M); _bs.feet[1].set(eye[0] + 0.11, fy, fz).applyMatrix4(M); }
    _bo.seat = _bs; _bo.pos.copy(_bs.pelvis); _bo.pos.y -= 0.5; _bo.moved = 0;
    if (me.seat === 0 && me.carId === net.id && !xr.active) { // hands at nine and three on the wheel, turning with it
      const g = carMeta.groups.steering; const ax = _v.fromArray(g.axis); const ang = Math.max(-1.25, Math.min(1.25, -ctl.steer * SPEC.steerRatioTurns * Math.PI)); _q.setFromAxisAngle(ax, ang); const up = _v2.set(0, 1, 0).addScaledVector(ax, -ax.y).normalize(); const right = _bl.crossVectors(up, ax).normalize();
      _hl.copy(right).multiplyScalar(-0.172).applyQuaternion(_q).add(_v.fromArray(g.pivot)).addScaledVector(_v2.fromArray(g.axis), 0.02).applyMatrix4(M); _hr.copy(right).multiplyScalar(0.172).applyQuaternion(_q).add(_v.fromArray(g.pivot)).addScaledVector(_v2.fromArray(g.axis), 0.02).applyMatrix4(M); _bo.hands[0] = _hl; _bo.hands[1] = _hr; } }
  else { const yaw = xr.active ? xr.yaw + _e.setFromQuaternion(camera.quaternion, 'YXZ').y : me.yaw; _bo.fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); _bo.moved = _bl.set(me.foot.x - (updateBody.lx ?? me.foot.x), 0, me.foot.z - (updateBody.lz ?? me.foot.z)).length(); updateBody.lx = me.foot.x; updateBody.lz = me.foot.z; _bo.pos.copy(me.foot); }
  body.update(_bo, dt);
}
function compass(yaw) { const d = ((-yaw * 180 / Math.PI) % 360 + 360) % 360; return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(d / 45) % 8] + ' ' + Math.round(d) + '°'; }
function screenData(ent) {
  const c = ent.car, mine = ent.id === net.id; const sp = mine ? veh.fwdSpeed : ent.speed; const p = c.root.position; _e.setFromQuaternion(c.root.quaternion, 'YXZ'); const nr = world.nearestRoad(p.x, p.z, 14); const now = new Date(new Date(world.gameMs()).toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return { power: c.lights.power, mph: sp * 2.23694, gear: mine ? veh.gear : ent.gear, powerKw: mine ? veh.powerKw : 0, soc: mine ? veh.soc : ent.soc, blink: c.blink, sigL: c.lights.sigL, sigR: c.lights.sigR, hazard: c.lights.hazard, head: c.lights.head, high: c.lights.high, dome: c.lights.dome, epb: mine ? (veh.epb || veh.gear === 'P') : false, doorOpen: c.anim.doors.some(d => d > 0.02) || c.anim.tailgate > 0.02, belt: mine ? me.belt || me.seat !== 0 || me.carId !== net.id : true, abs: mine && veh.absActive, tc: mine && veh.tcActive, singlePedal: mine && veh.singlePedal, sport: mine && veh.sport,
    clock: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), dateStr: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }), odo: mine ? 18240000 + veh.odo : 0, trip: mine ? veh.trip : 0, limit: law.limit || (nr && nr.seg.r.s ? nr.seg.r.s : 0), street: nr ? (nr.seg.r.n || (nr.seg.r.c === 0 ? 'Driveway' : 'Unnamed road')) : '', x: p.x, z: p.z, yaw: _e.y, heading: compass(_e.y), night: world.dark, mapScale, temp: Math.round(58 + 22 * (world.dayK || 0)) + '°F', weather: world.weather.rain > 0.3 ? 'Rain' : world.weather.cloud > 0.55 ? 'Cloudy' : world.weather.mist > 0.4 ? 'Mist' : 'Clear', players: net.players.size + 1, room: net.connected ? 'Room: ' + net.room : 'Offline', doors: c.anim.doors, windows: c.anim.windows, tailgate: c.anim.tailgate, hood: c.anim.hood, radio: audio.radioNow(world.now()), tip: law.cites.length ? 'Citations: ' + law.cites.length + ' · ' + law.last : 'Clean record · limit ' + (law.limit || '--') + ' mph', limitNow: law.limit };
}

function loop(time) {
  const now = time / 1000; const dt = Math.min(0.05, Math.max(0.001, now - (loop.last || now))); loop.last = now; frame++;
  readControls(dt);
  // own car physics + visuals
  if (!window.__testDrive) veh.update(dt, ctl); syncCar();
  const L = myCar.lights; L.brake = ctl.brake > 0.04 || (veh.motorTorque < -25 && veh.fwdSpeed > 2); L.reverse = veh.power && veh.gear === 'R';
  if (veh.impact > 1.2) { audio.play(veh.impact > 6 ? 'crash_heavy' : 'crash_light', Math.min(1, veh.impact / 8), 1, false); }
  myCar.update(dt, { wheels: veh.wheels, steer: ctl.steer, throttle: ctl.throttle, brake: ctl.brake });
  updateSkid(); updateFx(dt); if (world.rain > 0) { loop.th = (loop.th === undefined ? 12 : loop.th) - dt; if (loop.th <= 0) { audio.play('thunder', 0.5 + Math.random() * 0.4, 0.85 + Math.random() * 0.3, true); loop.th = 18 + Math.random() * 40; } }
  if (ctl.horn !== loop.horn) { loop.horn = ctl.horn; net.event({ k: 'horn', on: ctl.horn }); }
  updateRemotes(dt);
  if (traffic) { const pp = myCar.root.position; const cs = traffic.update(dt, { x: pp.x, z: pp.z, speed: Math.max(0, veh.fwdSpeed) }, world.dark); for (const c of cs) veh.extraCircles.push(c); let pb = 0, ps = 0; for (const c of traffic.cars) { const d = Math.hypot(c.x - rig.position.x, c.z - rig.position.z); if (d < 60 && c.v > 1) { const g = Math.min(1, 9 / Math.max(3, d)) ** 2 * Math.min(1, c.v / 12); if (g > pb) { pb = g; ps = c.v; } } } law.passby = pb; law.passSpeed = ps;
    if (people) for (const c of people.update(dt, { x: pp.x, z: pp.z, speed: Math.abs(veh.fwdSpeed), cam: rig.position })) veh.extraCircles.push(c); checkLaws(dt); }
  if (me.mode === 'foot') updateFoot(dt);
  updateCamera(dt); rig.updateMatrixWorld(true); updateBody(dt);
  const focus = window.__dbgCam ? _v2.set(window.__dbgCam[0], 0, window.__dbgCam[2]).clone() : me.mode === 'foot' ? me.foot : cars.get(me.carId)?.car.root.position || me.foot;
  world._rvx = veh.vel.x; world._rvz = veh.vel.z; world.update(xr.active ? renderer.xr.getCamera() : camera, dt, focus);
  // hover / interaction ray
  const hostCar = insideCar();
  if (xr.active) { let any = null; for (const c of xr.controllers) { if (!c.userData.src) continue; c.getWorldPosition(_v); _v2.set(0, 0, -1).transformDirection(c.matrixWorld); const h = pickAll(_v, _v2); c.userData.hover = h; c.userData.line.material.opacity = h ? 1 : 0.35; if (h && (!any)) { any = h; if (xr.lastHover !== h[0]) { xr.lastHover = h[0]; xrLabel(h[0].label, _v.addScaledVector(_v2, 0.25).add(_v2.set(0, 0.06, 0))); } } } if (!any) xr.lastHover = null; if (xr.label.t > 0) { xr.label.t -= dt; if (xr.label.t <= 0) xr.label.sp.visible = false; } }
  else if (frame % 2 === 0) { camera.getWorldPosition(_v); camera.getWorldDirection(_v2); const h = (locked || isTouch) ? pickAll(_v, _v2) : null; hover = h ? h[0] : null; hoverCar = h ? h[1] : null; hoverPerson = !hover && people && people.ready && (locked || isTouch) ? people.lookAt(_v, _v2) : null; const el = $('hint'); if (hover) { el.textContent = hover.label; el.style.display = 'block'; } else if (hoverPerson) { el.textContent = 'Talk to ' + (hoverPerson.who ? hoverPerson.who.name : 'this person'); el.style.display = 'block'; } else el.style.display = 'none'; }
  // warnings
  const driving = me.mode === 'seat' && me.carId === net.id && me.seat === 0;
  if (driving && veh.power && !me.belt && Math.abs(veh.fwdSpeed) > 7) { beltWarnT -= dt; if (beltWarnT <= 0) { audio.play('warning_beep', 0.4); beltWarnT = 6; } } else beltWarnT = 1.5;
  if (driving && Math.abs(veh.fwdSpeed) > 2 && (myCar.anim.doors.some(d => d > 0.05) || myCar.anim.tailgate > 0.05)) { doorWarnT -= dt; if (doorWarnT <= 0) { audio.play('warning_beep', 0.5, 1.2); doorWarnT = 1.5; } } else doorWarnT = 0.5;
  // screens
  if (hostCar) { const ent = cars.get(me.carId); instT += dt; centerT += dt; if (instT > 0.066) { instT = 0; hostCar.drawInstrument(screenData(ent)); } if (centerT > 0.3) { centerT = 0; hostCar.drawCenter(screenData(ent), world); }
    hostCar.ensureCams(); camAcc += Q.camsPerFrame; if (camAcc >= 1 && me.cam === 'cockpit') { camAcc -= 1; hostCar.renderCams(renderer, scene, 1); } }
  // audio
  const inside = !!hostCar && me.cam === 'cockpit'; const hc = hostCar; const open = hc ? Math.min(1, Math.max(...hc.anim.windows) * 0.8 + Math.max(...hc.anim.doors, hc.anim.tailgate)) : 1; const ent = cars.get(me.carId); const spd = hostCar ? (ent.veh ? ent.veh.speed : Math.abs(ent.speed)) : 0; const own = hostCar === myCar;
  const windowMoving = myCar.anim.windows.some((w, i) => Math.abs(w - myCar.target.windows[i]) > 0.01);
  audio.update({ inside, openness: open, speed: hostCar ? spd : veh.speed * 0.3, torque: own ? veh.motorTorque / SPEC.motorTorque : 0, rpm: own ? veh.motorRpm : spd / SPEC.wheelR * SPEC.gearRatio * 9.55, skid: own || !hostCar ? veh.skid * (hostCar ? 1 : 0.4) : 0, surface: own ? veh.surfaceType : 0, rain: world.rain, horn: ctl.horn || [...remotes.values()].some(r => r.horn && r.ent.car.root.position.distanceTo(rig.position) < 60), windowMoving, power: veh.power, night: world.dark, passby: law.passby || 0, passSpeed: law.passSpeed || 0 });
  // network
  if (net.connected && now - lastSend > 1 / 15) { lastSend = now; sendState(); }
  // HUD
  const showSpd = me.mode === 'seat' && me.cam === 'chase'; $('speedo').style.display = showSpd ? 'block' : 'none'; if (showSpd && frame % 6 === 0) { $('spd').textContent = Math.round(Math.abs(veh.fwdSpeed) * 2.23694); $('gearTxt').textContent = veh.gear + ' · mph'; }
  $('dot').style.display = locked ? 'block' : 'none';
  fpsN++; if (now - fpsT > 1) { $('fps').textContent = fpsN + ' fps · ' + world.loaded.size + ' tiles' + (world.pendingCount ? ' (+' + world.pendingCount + ' loading)' : ''); fpsN = 0; fpsT = now; }
  if (composer && !xr.active) composer.render(dt); else renderer.render(scene, camera);
}
window.__sim = { get veh() { return veh; }, get me() { return me; }, get world() { return world; }, get myCar() { return myCar; }, get camera() { return camera; }, get cars() { return cars; }, get net() { return net; }, get traffic() { return traffic; }, get people() { return people; }, get audio() { return audio; }, law, ctl, keys, onKey, act, setPower, setGear, toast, get renderer() { return renderer; } };
