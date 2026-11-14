// COLD BORE — a sniper's contracts in a headset or on a screen. Starts the renderer, reads the hands or the mouse, flies the rounds, runs the contract
import * as THREE from 'three';
import { World, Kit, rng } from './world.js';
import { AudioSys } from './audio.js';
import { FX } from './fx.js';
import { Crowd } from './people.js';
import { Rifle, EYE, SCOPE_Y } from './rifle.js';
import { Board } from './ui.js';
import { MISSIONS } from './missions.js';
import { AMMO, SOUND, ZERO_ANGLE, step, solve } from './ballistics.js';
import { A, loadAssets, sky } from './assets.js';

const $ = (id) => document.getElementById(id), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const SUB = 1 / 240;

class Game {
  constructor() {
    const P = new URLSearchParams(location.search), standalone = /OculusBrowser|Quest|Pico|Android|Mobile/i.test(navigator.userAgent), tier = P.get('q') !== null ? +P.get('q') : standalone ? 0 : 1;
    this.q = { tier, shadow: tier ? 2048 : 1024, scope: tier ? 1024 : 640 }; this.missions = MISSIONS; this.time = 0; this.state = 'menu'; this.live = false; this.bullets = []; this.timers = []; this.gen = 0; this.shots = 0; this.mi = 0; this.vr = false;
    this.settings = { assist: false, toggle: false, voice: true, lefty: false, tilt: -20 }; this.save = { done: {} };
    try { const s = JSON.parse(localStorage.getItem('coldbore') || '{}'); Object.assign(this.settings, s.settings || {}); Object.assign(this.save, s.save || {}); } catch (e) { /* no storage */ }
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); r.setPixelRatio(Math.min(devicePixelRatio, tier ? 2 : 1.5)); r.setSize(innerWidth, innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.xr.enabled = true; r.xr.setReferenceSpaceType('local-floor'); r.xr.setFramebufferScaleFactor(tier ? 1.3 : 1.1); if (!tier) r.xr.setFoveation(0.6); document.body.prepend(r.domElement);
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.04, 9000); this.camera.position.set(0, 1.58, 0); this.rig = new THREE.Group(); this.rig.add(this.camera); this.scene.add(this.rig);
    addEventListener('resize', () => { if (r.xr.isPresenting) return; this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); r.setSize(innerWidth, innerHeight); });
    this.audio = new AudioSys(); this.audio.voice = this.settings.voice; this.ready = this.init(); }
  async init() {
    const r = this.renderer; await loadAssets((k) => { $('status').textContent = 'Loading ' + Math.round(k * 100) + '%'; });
    this.A = A; this.world = new World(this); this.crowd = new Crowd(this); this.fx = new FX(this); this.rifle = new Rifle(this); this.board = new Board(this);
    this.ray = new THREE.Raycaster(); this.ray.firstHitOnly = true; this.wind = new THREE.Vector3(); this.windDir = new THREE.Vector3(1, 0, 0); this.aim = { yaw: 0, pitch: 0 }; this.keys = {}; this.I = { zoom: 0 }; this.hp = 0;
    this.fadeM = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshBasicMaterial({ color: 0, side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); this.fadeM.renderOrder = 999; this.fadeM.frustumCulled = false; this.camera.add(this.fadeM); this.fadeV = 0; this.fadeT = 0; this.red = 0;
    this.buildNest(); this.buildHands(); this.bind();
    await this.setup(0, true); $('status').textContent = ''; $('desktop').disabled = false; this.up = true; r.setAnimationLoop((t, frame) => this.frame(t));
  }
  saveAll() { this.audio.voice = this.settings.voice; try { localStorage.setItem('coldbore', JSON.stringify({ settings: this.settings, save: this.save })); } catch (e) { /* no storage */ } }

  // the sandbag rest in front of you and the ammunition either side of it
  buildNest() {
    const k = new Kit(), n = this.nest = new THREE.Group(), B = [0.52, 0.45, 0.32]; this.rest = { y: 1.22, x0: -0.8, x1: 0.8, z0: -0.8, z1: -0.4 };
    for (let row = 0; row < 6; row++) for (let i = 0; i < 4; i++) { const top = row === 0; const v = 0.8 + Math.random() * 0.15; k.bag('sand', -0.66 + i * 0.44 + (row % 2) * 0.22 + (Math.random() - 0.5) * 0.03, -0.085 - row * 0.165, -0.6 + (Math.random() - 0.5) * 0.03, 0.25, [v * 0.82, v * 0.88, v * 0.9], top ? 0.34 : 0.37, 0.9, 0.95, 7); }
    const ms = k.build(this.world.mats, n, null); for (const m of ms) { m.castShadow = true; }
    const put = (name, x, y, z, ry, s = 1) => { const o = A.m[name].clone(true); o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); o.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } }); n.add(o); return o; };
    for (const s of [-1, 1]) { put('ammo_box', s * 0.56, 0.02, -0.56, 0.2 * s); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(this.rifle.magGeo.geometry, this.rifle.magGeo.material); m.position.set(s * 0.56 + (i - 1) * 0.045, 0.2, -0.56); m.rotation.y = 1.57; n.add(m); } }
    put('old_military_crate', 1.5, -this.rest.y, 0.3, 0.5); put('binoculars', -0.3, 0.055, -0.5, 2.4);
    this.rig.add(n); this.setRest(1.22);
  }
  setRest(y) { this.rest.y = y; this.nest.position.y = y; this.nest.updateMatrixWorld(true); this.supply = [new THREE.Vector3(-0.56, y + 0.2, -0.56), new THREE.Vector3(0.56, y + 0.2, -0.56)]; }

  buildHands() {
    const r = this.renderer, skin = new THREE.MeshStandardMaterial({ color: 0x2a2d2a, roughness: 0.85 });
    this.hands = [0, 1].map((i) => { const h = { i, active: false, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), grab: false, held: false, raw: false, trig: 0, trigD: false, aD: false, bD: false, x: 0, y: 0, mag: false, src: null,
      pulse(v, ms) { const g = this.src && this.src.gamepad, a = g && g.hapticActuators; if (a && a[0] && a[0].pulse) a[0].pulse(Math.min(1, v), ms).catch(() => {}); else if (g && g.vibrationActuator) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: Math.min(1, v), weakMagnitude: Math.min(1, v) }).catch(() => {}); } };
      return h; });
    this.ctrl = [0, 1].map((i) => { const c = { ray: r.xr.getController(i), grip: r.xr.getControllerGrip(i), src: null }; this.rig.add(c.ray, c.grip);
      c.ray.addEventListener('connected', (e) => { c.src = e.data; }); c.ray.addEventListener('disconnected', () => { c.src = null; });
      const glove = new THREE.Group(), palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.032, 0.105), skin), thumb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.06), skin), fingers = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.028, 0.06), skin);
      palm.position.set(0, 0, 0.02); thumb.position.set(0.045, 0.005, -0.02); fingers.position.set(0, -0.022, -0.045); fingers.rotation.x = 0.7; glove.add(palm, thumb, fingers); glove.traverse((q) => { q.castShadow = true; }); c.grip.add(glove); c.glove = glove; c.thumb = thumb;
      c.magM = new THREE.Mesh(this.rifle.magGeo.geometry, this.rifle.magGeo.material); c.magM.position.set(0, 0.0, -0.03); c.magM.visible = false; c.grip.add(c.magM);
      c.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -2.2)]), new THREE.LineBasicMaterial({ color: 0xff6a30, transparent: true, opacity: 0.7, fog: false })); c.line.visible = false; c.ray.add(c.line); return c; });
  }

  bind() {
    const cv = this.renderer.domElement, I = this.I;
    this.audio.load('sniper-assets/snd/');
    $('desktop').onclick = () => { this.audio.start(); this.vr = false; $('menu').style.display = 'none'; document.body.classList.add('play'); this.toMissions(); };
    const vb = $('vr'); if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { vb.disabled = !ok; vb.textContent = ok ? 'Enter VR' : 'No headset found'; }).catch(() => { vb.textContent = 'No headset found'; }); else vb.textContent = 'No headset found';
    vb.onclick = async () => { this.audio.start(); try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }); await this.renderer.xr.setSession(s); this.vr = true; $('menu').style.display = 'none'; document.body.classList.remove('play'); this.restAt = 0.6; this.toMissions();
      s.addEventListener('end', () => { this.vr = false; this.live = false; this.setRest(1.22); this.rifle.home(this.rest); $('menu').style.display = ''; document.body.classList.remove('play', 'locked'); this.camera.position.set(0, 1.58, 0); this.camera.fov = 70; this.camera.updateProjectionMatrix(); }); } catch (e) { $('status').textContent = 'Could not start VR: ' + e.message; } };
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === cv; document.body.classList.toggle('locked', this.locked); if (!this.locked && !this.vr && this.state === 'live') this.board.show('live'); });
    this.lock = () => { try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* no pointer lock */ } };
    cv.addEventListener('click', () => { if (!this.vr && this.state !== 'menu' && !this.locked) this.lock(); });
    document.addEventListener('mousemove', (e) => { if (!this.locked) return; const s = 0.0021 * (I.ads ? 1.7 / this.rifle.zoom : 1); this.aim.yaw -= e.movementX * s; this.aim.pitch = Math.max(-1.2, Math.min(1.2, this.aim.pitch - e.movementY * s)); });
    document.addEventListener('mousedown', (e) => { if (!this.locked) return; if (e.button === 0) I.fire = true; if (e.button === 2) I.ads = true; });
    document.addEventListener('mouseup', (e) => { if (e.button === 2) I.ads = false; }); document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('wheel', (e) => { if (this.locked) I.zoom += e.deltaY < 0 ? 1 : -1; }, { passive: true });
    document.addEventListener('keydown', (e) => { if (!this.locked) return; const k = e.code; this.keys[k] = true; if (e.repeat && !/Arrow|Key[WASD]/.test(k)) return;
      if (k === 'KeyR') I.reload = true; else if (k === 'KeyE') I.lase = true; else if (k === 'KeyB') I.bolt = true; else if (k === 'KeyQ') I.ads = !I.ads; else if (k === 'ArrowUp' || k === 'KeyW') I.dialY = 1; else if (k === 'ArrowDown' || k === 'KeyS') I.dialY = -1; else if (k === 'ArrowRight' || k === 'KeyD') I.dialX = 1; else if (k === 'ArrowLeft' || k === 'KeyA') I.dialX = -1;
      if (k === 'Tab') e.preventDefault(); });
    document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
  }

  // ---------- the contract ----------
  eye() { return this.camera.getWorldPosition(new THREE.Vector3()); }
  later(s, fn) { this.timers.push({ t: s, fn, gen: this.gen }); }
  objective(t) { this.objectiveText = t; $('obj').textContent = t; if (this.board.screen === 'live' && this.mission) this.board.draw(); }
  say(t) { this.board.say(t); $('spot').textContent = t; this.spotT = 6; this.audio.say(t); }
  fade(v) { this.fadeT = v; return new Promise((res) => { const iv = setInterval(() => { if (Math.abs(this.fadeV - v) < 0.02) { clearInterval(iv); res(); } }, 30); }); }
  async setup(i, quiet) {
    const def = this.missions[i]; this.mi = i; this.gen++; this.timers = []; this.mission = null; this.live = false; this.crowd.clear(); this.fx.clear(); for (const b of this.bullets) b.dead = true; this.bullets = []; this.audio.quiet(); if (window.speechSynthesis) speechSynthesis.cancel();
    const tex = await sky(def.env); if (this.skyTex && this.skyTex !== tex) { this.skyTex.bg.dispose(); this.skyTex.env.dispose(); } this.skyTex = tex;
    const S = this.world.build(def.site, def.env, def.seed), n = S.nest; this.rig.position.copy(n); this.rig.rotation.y = Math.atan2(-(def.look[0] - n.x), -(def.look[2] - n.z)); this.rig.updateMatrixWorld(true);
    this.world.setEnv(def.env, tex, this.rig.rotation.y); this.lookD = Math.hypot(def.look[0] - n.x, def.look[1] - n.y - 1.5, def.look[2] - n.z);
    const a = def.wind.from * Math.PI / 180; this.windDir.set(-Math.sin(a), 0, Math.cos(a)).applyQuaternion(this.rig.quaternion); this.windA = a;
    this.shots = 0; this.hits = 0; this.far = 0; this.tof = 0; this.zone = ''; this.mt = 0; this.hp = def.hp || 0; this.outT = 0; this.board.log = []; this.aim.yaw = 0; this.aim.pitch = -Math.atan2(n.y + 1.5 - def.look[1], Math.hypot(def.look[0] - n.x, def.look[2] - n.z));
    this.rifle.reset(); this.rifle.elev = 0; this.rifle.windage = 0; this.rifle.home(this.rest); this.rifle.drawHud(); for (const h of this.hands) h.mag = false;
    this.mission = def.setup(this, S, rng(def.seed * 7 + 1)); this.mission.def = def; this.floorY = n.y; this.crowd.update(0);
    if (!quiet) { this.state = 'brief'; this.board.show('brief', { m: def }); this.audio.say(def.brief[0]); }
  }
  async load(i) { if (this.loading) return; this.loading = true; if (document.pointerLockElement) document.exitPointerLock(); await this.fade(1); await this.setup(i); if (this.vr) this.restAt = 0.3; await new Promise(r => setTimeout(r, 60)); this.fade(0); this.loading = false; }
  begin() { if (this.state !== 'brief') return; this.state = 'live'; this.live = true; this.mt = 0; this.rifle.drawHud(); this.board.show('live'); if (window.speechSynthesis) speechSynthesis.cancel(); if (!this.vr) this.lock(); }
  toMissions() { this.state = 'board'; this.live = false; this.rifle.drawHud(); if (document.pointerLockElement) document.exitPointerLock(); this.board.show('missions'); }
  end(win, text) {
    if (this.state !== 'live') return; this.state = 'debrief'; this.live = false; this.rifle.drawHud(); const def = this.mission.def, stars = !win ? 0 : this.shots <= def.par ? 3 : this.shots <= def.par + 2 ? 2 : 1;
    if (win) { const old = this.save.done[def.id]; if (!old || stars > old.stars || (stars === old.stars && this.shots < old.shots)) this.save.done[def.id] = { stars, shots: this.shots }; this.saveAll(); }
    this.audio.play(win ? 'win' : 'fail'); this.audio.say(text); $('spot').textContent = text; this.spotT = 8;
    this.board.show('debrief', { win, text, stars, shots: this.shots, hits: this.hits, time: this.mt, far: this.far, tof: this.tof, zone: this.zone }); if (document.pointerLockElement) this.later(1.6, () => document.exitPointerLock());
  }
  win(t) { this.end(true, t); } fail(t) { this.end(false, t); }

  // ---------- rounds ----------
  shoot(from, dir, los) {
    this.shots++; const b = { p: [from.x, from.y, from.z], v: [dir.x * AMMO.mv, dir.y * AMMO.mv, dir.z * AMMO.mv], t: 0, from: from.clone(), trace: this.fx.trace(), fi: -1, fd: 0, miss: null };
    const F = this.mission.focus(); let best = 0.06; F.forEach((f, i) => { const to = _a.copy(f).sub(from), d = to.length(), ang = to.normalize().angleTo(los || dir); if (ang < best) { best = ang; b.fi = i; b.fd = d; } });
    this.fx.tracePoint(b.trace, b.p); this.bullets.push(b); if (this.mission.shot) this.mission.shot(); if (this.board.screen === 'live') this.board.draw();
  }
  flight(dt) {
    const M = this.mission, W = [this.wind.x, 0, this.wind.z];
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]; let n = Math.max(1, Math.ceil(dt / SUB)), h = dt / n, done = null;
      for (let s = 0; s < n && !done; s++) {
        _a.set(b.p[0], b.p[1], b.p[2]); step(b, h, W); b.t += h; _b.set(b.p[0], b.p[1], b.p[2]); const len = _a.distanceTo(_b), dir = _c.copy(_b).sub(_a).divideScalar(len);
        let best = 2, kind = null, info = null; const ph = this.crowd.hit(_a, _b); if (ph) { best = ph.s; kind = 'person'; info = ph; }
        const th = M.hitTest && M.hitTest(_a, _b); if (th && th.s < best) { best = th.s; kind = 'plate'; info = th; }
        this.ray.set(_a, dir); this.ray.far = len; const wh = this.ray.intersectObjects(this.world.solids, false)[0]; if (wh && wh.distance / len < best) { best = wh.distance / len; kind = 'world'; info = wh; }
        if (!kind && this.world.site.PY !== undefined && _b.y < 0) { best = _a.y / (_a.y - _b.y); kind = 'sea'; }
        if (b.fi >= 0 && !b.miss && _b.distanceTo(b.from) >= b.fd) { const f = M.focus()[b.fi]; if (f) { const k = Math.min(1, Math.max(0, (b.fd - _a.distanceTo(b.from)) / len)); b.miss = this.off(b, _d.copy(_a).lerp(_b, k), f); } }
        if (kind) { const at = _a.clone().lerp(_b, best), dist = at.distanceTo(b.from); this.fx.tracePoint(b.trace, [at.x, at.y, at.z]); done = kind;
          if (kind === 'person') { this.hits++; if (dist > this.far) { this.far = dist; this.tof = b.t; } this.zone = info.zone; this.fx.impact(at, dir.clone().negate(), 'flesh'); this.audio.play('thud', dist / SOUND, dist); const st = this.state; M.person(info.p, info.zone, dir.clone()); if (this.state === st && st === 'live' && info.p.alive) this.say('Hit, ' + info.zone + '.'); }
          else if (kind === 'plate') { this.hits++; if (dist > this.far) { this.far = dist; this.tof = b.t; } M.struck(info); }
          else { const nrm = kind === 'world' && info.face ? info.face.normal.clone().transformDirection(info.object.matrixWorld) : new THREE.Vector3(0, 1, 0); const sf = kind === 'sea' ? 'water' : info.object.userData.surf; this.fx.impact(at, nrm, sf === 'dirt' ? 'dirt' : sf === 'metal' ? 'metal' : sf === 'water' ? 'water' : 'stone'); this.audio.play('thud', dist / SOUND, dist); if (M.impact) M.impact(at); if (!b.miss && b.fi >= 0) { const f = M.focus()[b.fi]; if (f) b.miss = this.off(b, at, f); } this.call(b); }
        } else this.fx.tracePoint(b.trace, b.p);
      }
      if (done || b.t > 6 || b.dead) { if (!done && !b.dead) this.call(b); b.trace.dead = 0.001; this.bullets.splice(i, 1); }
    }
  }
  // where a round passed or landed against what it was sent at, as the shooter sees it, in mils
  off(b, at, f) { const o = b.from, az = (p) => Math.atan2(p.x - o.x, -(p.z - o.z)), el = (p) => Math.atan2(p.y - o.y, Math.hypot(p.x - o.x, p.z - o.z)); let r = az(at) - az(f); r = Math.atan2(Math.sin(r), Math.cos(r)); return { r: r * 1000 * Math.cos(el(f)), u: (el(at) - el(f)) * 1000 }; }
  // the spotter's correction for a round that did not connect
  call(b) {
    if (this.state !== 'live') return; const m = b.miss; if (!m) return this.say('Miss. Did not see it.'); const u = m.u, r = m.r, f = (v, a, c) => Math.abs(v) < 0.1 ? '' : (v > 0 ? a : c) + ' ' + Math.abs(v).toFixed(1);
    if (Math.abs(u) > 40 || Math.abs(r) > 40) return this.say('Miss. Way off.'); const parts = [f(u, 'high', 'low'), f(r, 'right', 'left')].filter(Boolean); this.say(parts.length ? 'Miss. ' + parts.join(', ') + ' mil.' : 'Just off him. Send it again.');
  }
  lase() {
    const R = this.rifle; R.g.updateMatrixWorld(true); const o = R.cam.getWorldPosition(_a), d = _b.set(0, 0, -1).transformDirection(R.g.matrixWorld), far = 2400; let best = far;
    this.ray.set(o, d); this.ray.far = far; const wh = this.ray.intersectObjects(this.world.solids, false)[0]; if (wh) best = wh.distance;
    const e = _c.copy(o).addScaledVector(d, far), ph = this.crowd.hit(o, e); if (ph) best = Math.min(best, ph.s * far); const th = this.mission.hitTest && this.mission.hitTest(o, e); if (th) best = Math.min(best, th.s * far);
    R.lased = best < far ? best : 0; R.drawHud(); this.cardT = 0; this.audio.play('laser');
  }
  enemyShot(from, pHit) {
    const eye = this.eye(), d = from.distanceTo(eye), tof = d / 780, gen = this.gen;
    this.later(tof, () => { if (this.state !== 'live') return; if (Math.random() < pHit) { this.hp--; this.red = 0.7; this.audio.play('hurt'); for (const h of this.hands) h.pulse(1, 300); if (this.hp <= 0) this.fail('The other rifle found you first.'); else this.say('You are hit! One more and it is over.'); }
      else { this.audio.play('crack'); const at = _a.set((Math.random() - 0.5) * 2.4, this.rest.y + (Math.random() - 0.3) * 0.5, -0.7 - Math.random() * 0.4).applyMatrix4(this.rig.matrixWorld).clone(); this.fx.impact(at, new THREE.Vector3(0, 1, 0), 'stone'); for (const h of this.hands) h.pulse(0.5, 60); } });
    this.later(d / SOUND, () => this.audio.play('report', 0, d));
  }
  // the check's aim: point the rifle so a round sent now lands on a point (wind and drop solved)
  aimAt(to) {
    for (let i = 0; i < 3; i++) { this.rifle.desk(0, this.camera, this.aim, {}); this.rifle.g.updateMatrixWorld(true); const from = this.rifle.g.localToWorld(new THREE.Vector3(0, 0.102, -0.89)), d = solve([from.x, from.y, from.z], [to.x, to.y, to.z], [this.wind.x, 0, this.wind.z]);
      const l = _a.set(d[0], d[1], d[2]).applyQuaternion(_q.copy(this.rig.quaternion).invert()); this.aim.pitch = Math.asin(l.y) - ZERO_ANGLE - this.rifle.elev / 1000; this.aim.yaw = Math.atan2(-l.x, -l.z) + this.rifle.windage / 1000; }
  }

  // ---------- each frame ----------
  readXR() {
    const S = this.settings; this.hands.forEach(h => { h.active = false; });
    for (const c of this.ctrl) {
      const src = c.src; if (!src || !src.gamepad || src.handedness === 'none') { c.glove.visible = false; continue; } const h = this.hands[src.handedness === 'left' ? 0 : 1], gp = src.gamepad, b = gp.buttons; h.src = src; h.active = true; h.c = c; c.glove.visible = true;
      h.pos.copy(c.grip.position); h.quat.copy(c.ray.quaternion); const tr = b[0] ? b[0].value : 0, raw = b[1] ? b[1].value > 0.5 : false, was = h.grab;
      if (S.toggle) { if (raw && !h.raw) h.held = !h.held; } else h.held = raw; h.raw = raw; h.grab = h.held; h.grabE = h.grab && !was; h.relE = !h.grab && was;
      h.trigE = tr > 0.6 && !h.trigD; h.trigD = tr > 0.6 ? true : tr < 0.35 ? false : h.trigD; h.trig = tr; const a = !!(b[4] && b[4].pressed), bb = !!(b[5] && b[5].pressed); h.aE = a && !h.aD; h.bE = bb && !h.bD; h.aD = a; h.bD = bb;
      h.x = gp.axes[2] || 0; h.y = gp.axes[3] || 0; c.magM.visible = h.mag; c.thumb.position.x = src.handedness === 'left' ? 0.045 : -0.045;
    }
  }
  frame() {
    const now = performance.now() / 1000, dt = Math.min(0.05, this.last ? now - this.last : 0.016); this.last = now; this.time += dt; const R = this.rifle, xr = this.renderer.xr.isPresenting, I = this.I;
    // wind: a steady set with slow gusts
    if (this.mission) { const w = this.mission.def.wind, t = this.time, sp = Math.max(0, w.speed + w.gust * (Math.sin(t * 0.23) + Math.sin(t * 0.61 + 1.3) * 0.6 + Math.sin(t * 1.7) * 0.2) / 1.8), wob = Math.sin(t * 0.17) * 0.12; this.windSp = sp; this.wind.copy(this.windDir).applyAxisAngle(_a.set(0, 1, 0), wob).multiplyScalar(sp);
      this.cardT = (this.cardT || 0) - dt; if (this.cardT <= 0) { this.cardT = 0.6; this.audio.loop('city', this.world.site.T ? 0.5 : 0); this.audio.loop('sea', this.world.site.PY !== undefined ? 0.5 : 0); let hr = Math.round(((this.windA - wob) * 180 / Math.PI) / 30) % 12; if (hr <= 0) hr += 12; R.drawCard(sp, hr); this.audio.loop('wind', 0.012 + sp * 0.009, 260 + sp * 45, 0.6); if (this.world.env.rain) this.audio.loop('rain', 0.07, 3200, 0.3); } }
    if (xr) {
      this.readXR(); const head = this.camera.position.y;
      if (this.restAt > 0) { this.restAt -= dt; if (this.restAt <= 0 && head > 0.5) { this.setRest(Math.min(1.3, Math.max(0.45, head - 0.42))); R.home(this.rest); this.board.mesh.position.y = Math.max(0.9, head - 0.2); } }
      R.vr(dt, this.hands, this.rest, this.settings);
      let any = false; this.hands.forEach((h, i) => { const c = h.c; if (!h.active) return; const free = R.main !== i && R.off !== i && R.boltHand !== i && !h.mag; c.line.visible = false;
        if (h.grabE && free) { for (const s of this.supply) if (h.pos.distanceTo(s) < 0.17) { h.mag = true; this.audio.play('grab'); h.pulse(0.4, 30); } }
        if (h.relE && h.mag) { h.mag = false; this.fx.dropMag(c.magM.getWorldPosition(_a), c.magM.getWorldQuaternion(_q), R.magGeo); }
        if (S_free(R, i, h)) { c.ray.updateMatrixWorld(true); const o = _a.setFromMatrixPosition(c.ray.matrixWorld), d = _b.set(0, 0, -1).transformDirection(c.ray.matrixWorld); if (this.board.aim(o, d)) { any = true; c.line.visible = true; if (h.trigE) this.board.click(); } } });
      if (!any) { this.board.dot.visible = false; if (this.board.hover >= 0) this.board.point(-1, -1); }
    } else {
      this.camera.rotation.set(this.aim.pitch, this.aim.yaw, 0, 'YXZ'); I.hold = !!(this.keys.ShiftLeft || this.keys.ShiftRight || this.keys.Space); const fov = 70 - 38 * R.ads; if (Math.abs(fov - this.camera.fov) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
      if (this.steady) { R.swayT = 0; R.kick = 0; } R.desk(dt, this.camera, this.aim, this.state === 'menu' ? {} : I); I.fire = I.reload = I.lase = I.bolt = false; I.dialX = I.dialY = 0; I.zoom = 0;
    }
    R.parts(dt); this.board.mesh.visible = xr;
    if (R.holding) { this.beat = (this.beat || 0) - dt; if (this.beat <= 0) { this.beat = R.breath > 6 ? 0.55 : 0.95; this.audio.play('heart', R.breath > 6 ? 1 : 0.5); } }
    for (let i = this.timers.length - 1; i >= 0; i--) { const t = this.timers[i]; t.t -= dt; if (t.t <= 0) { this.timers.splice(i, 1); if (t.gen === this.gen) t.fn(); } }
    if (this.mission) { if (this.state === 'live') this.mt += dt; if (this.state === 'live' || this.state === 'debrief') { this.mission.update(dt); this.crowd.update(dt); } this.flight(dt);
      if (this.state === 'live' && this.shots >= this.mission.def.rounds && !this.bullets.length) { this.outT += dt; if (this.outT > 2.5) this.fail('Out of ammunition.'); } }
    this.world.update(dt, this.wind); this.fx.update(dt, this.wind, this.floorY || 0);
    this.fadeV += (this.fadeT - this.fadeV) * Math.min(1, dt * 9); this.red = Math.max(0, this.red - dt * 0.6); const fm = this.fadeM.material; fm.opacity = Math.max(this.fadeV, this.red); fm.color.setRGB(this.red > this.fadeV ? 0.6 : 0, 0, 0); this.fadeM.visible = fm.opacity > 0.01;
    if (!xr) { if (this.spotT > 0) { this.spotT -= dt; if (this.spotT <= 0) $('spot').textContent = ''; }
      this.hudT = (this.hudT || 0) - dt; if (this.hudT <= 0) { this.hudT = 0.12; $('ammo').innerHTML = `<b>${R.chambered ? (R.spent ? '○' : '●') : '–'} ${R.magIn ? R.rounds : '–'}</b><span>${this.live ? '' : 'SAFE · '}EL ${R.elev.toFixed(1)} · ${R.windage === 0 ? 'W 0.0' : (R.windage > 0 ? 'R ' : 'L ') + Math.abs(R.windage).toFixed(1)} · ${R.zoom.toFixed(0)}x</span><small>${R.holding ? 'holding breath' : R.breath > 0.5 ? 'breathing' : ''}${this.hp ? ' · armour ' + this.hp : ''}</small>`; } }
    // the scope's own picture, then the world
    const eyes = []; if (xr) { const xc = this.renderer.xr.getCamera(); for (const c of xc.cameras) eyes.push(new THREE.Vector3().setFromMatrixPosition(c.matrix).applyMatrix4(this.rig.matrixWorld)); } else if (R.ads > 0.6) eyes.push(this.camera.getWorldPosition(new THREE.Vector3()));
    this.rig.updateMatrixWorld(true); R.scope(this.renderer, this.scene, eyes);
    this.renderer.render(this.scene, this.camera);
  }
}
const S_free = (R, i, h) => R.main !== i && R.off !== i && R.boltHand !== i && !h.mag;

window.game = new Game();
