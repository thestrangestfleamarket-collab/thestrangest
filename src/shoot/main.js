// BREACHLINE — 2-player WebXR duel. Bootstraps rendering, match flow, hit detection and networking.
import * as THREE from 'three';
import { Materials, radialTexture } from './textures.js';
import { buildMap, MAPS } from './maps.js';
import { installAtmosphere } from './world.js';
import { AudioSys } from './audio.js';
import { FX } from './fx.js';
import { Player } from './player.js';
import { Avatar, Bot, hitBody } from './avatar.js';
import { Net, makeCode } from './net.js';
import { UI } from './ui.js';
import { grenadeMesh, DEFS, TYPE_BY_ID } from './weapons.js';

const $ = (id) => document.getElementById(id);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3();
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]), A = (v) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
const EXPOSURE = [1.3, 1.15, 1.0], KILLS = 7, ROUND = 300;

class Game {
  constructor() {
    const standalone = /OculusBrowser|Quest|Pico|Android|Mobile/i.test(navigator.userAgent);
    const forced = new URLSearchParams(location.search).get('q');
    const tier = forced !== null ? +forced : standalone ? 0 : 1;
    this.q = { tier, shadow: tier ? 2048 : 1024, sunShadow: tier ? 4096 : 2048, tex: tier ? 512 : 256 };
    this.settings = { tilt: 0, smoothTurn: false, vignette: true, leftHanded: false };
    try { Object.assign(this.settings, JSON.parse(localStorage.getItem('breachline-settings') || '{}')); } catch (e) { /* storage unavailable */ }

    installAtmosphere();
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, tier ? 2 : 1.5)); r.setSize(innerWidth, innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.xr.enabled = true; r.xr.setReferenceSpaceType('local-floor'); r.xr.setFramebufferScaleFactor(tier ? 1.25 : 1.0);
    if (!tier) r.xr.setFoveation(1);
    document.body.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.03, 9000);
    this.rig = new THREE.Group(); this.rig.add(this.camera); this.scene.add(this.rig);
    addEventListener('resize', () => { if (r.xr.isPresenting) return; this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); r.setSize(innerWidth, innerHeight); });

    this.mats = new Materials(r, this.q.tex); this.mats.flameTex = radialTexture([[0, 'rgba(255,240,190,1)'], [0.25, 'rgba(255,170,60,0.8)'], [0.6, 'rgba(255,80,10,0.3)'], [1, 'rgba(255,40,0,0)']]);
    this.audio = new AudioSys();
    this.fx = new FX(this.scene, this.audio, this.q);
    this.player = new Player(this);
    this.avatar = new Avatar(this);
    this.ui = new UI(this);
    this.net = new Net(); this.bot = null; this.mode = null; this.myIndex = 0;
    this.match = { ph: 'warmup', map: 0, sc: [0, 0], tl: 0, n: 0 };
    this.playing = false; this.grenades = []; this.sendAcc = 0; this.syncAcc = 0; this.lastBeep = -1; this.time = 0;
    this.flashMat = new THREE.MeshBasicMaterial({ map: this.fx.flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });

    this.loadMap(0);
    this.player.spawn(...this.world.spawns[0]);
    this._menu();
    this.net.onStatus = (s) => { $('status').textContent = s; };
    this.net.onOpen = () => { $('status').textContent = 'Opponent connected'; this.net.send({ t: 'hi' }); this.avatar.reset(); if (this.net.isHost) this.startRound(this.match.map); };
    this.net.onClose = () => { $('status').textContent = 'Opponent disconnected'; this.avatar.reset(); this.match.ph = 'warmup'; this.match.sc = [0, 0]; this.player.locked = false; this.ui.show('OPPONENT LEFT', 'Free roam until they return', 3); };
    this.net.onMsg = (m) => this.onMsg(m);

    let last = performance.now();
    r.setAnimationLoop(() => { const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; this.update(dt); r.render(this.scene, this.camera); });
    window.game = this;
  }

  loadMap(i) {
    if (this.world) { if (this.world.index === i) return; this.world.dispose(); }
    this.fx.clear(); this.grenades.forEach((g) => this.scene.remove(g.mesh)); this.grenades.length = 0;
    this.world = buildMap(i, this.scene, this.mats, this.q);
    this.fx.world = this.world; this.match.map = i;
    this.renderer.toneMappingExposure = EXPOSURE[i];
    this.audio.setReverb(this.world.reverb); if (this.playing) this.audio.ambience(this.world.ambience);
  }

  // ---------- menu / session ----------
  _menu() {
    const S = this.settings, save = () => { try { localStorage.setItem('breachline-settings', JSON.stringify(S)); } catch (e) { /* ignore */ } };
    const maps = $('maps');
    MAPS.forEach((m, i) => { const b = document.createElement('button'); b.className = 'map' + (i === 0 ? ' on' : ''); b.innerHTML = `<b>${m.name}</b><small>${m.blurb}</small>`; b.onclick = () => { if (this.mode === 'join') return; [...maps.children].forEach((c) => c.classList.remove('on')); b.classList.add('on'); if (this.match.ph === 'warmup') { this.loadMap(i); this.player.spawn(...this.world.spawns[0]); } else if (this.mode !== 'join') this.startRound(i); }; maps.appendChild(b); });
    const chosen = (mode, text) => { this.mode = mode; $('step1').style.display = 'none'; $('step2').style.display = 'block'; $('status').textContent = text; };
    $('host').onclick = () => { const code = makeCode(); this.myIndex = 0; this.net.host(code); $('code').textContent = code; $('codebox').style.display = 'block'; chosen('host', 'Starting…'); };
    $('join').onclick = () => { const code = $('joincode').value.trim().toUpperCase(); if (code.length < 4) { $('joincode').focus(); return; } this.myIndex = 1; this.net.join(code); $('maps').style.opacity = 0.4; chosen('join', 'Connecting…'); };
    $('practice').onclick = () => { this.myIndex = 0; this.bot = new Bot(this); this.avatar.reset(); chosen('bot', 'Practice match against a bot'); };
    const begin = () => { if (this.bot && this.match.ph === 'warmup') this.startRound(this.match.map); this.playing = true; this.audio.resume(); this.audio.ambience(this.world.ambience); $('menu').style.display = 'none'; };
    $('desktop').onclick = () => { begin(); this.renderer.domElement.requestPointerLock(); };
    document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && !this.renderer.xr.isPresenting) { $('menu').style.display = 'flex'; this.player.keys = {}; this.player.mouse = [false, false, false]; } });
    const vrBtn = $('vr');
    if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { if (ok) { vrBtn.disabled = false; vrBtn.textContent = 'Enter VR'; } else vrBtn.textContent = 'No VR headset detected'; }).catch(() => { vrBtn.textContent = 'VR unavailable'; });
    else vrBtn.textContent = location.protocol === 'https:' || location.hostname === 'localhost' ? 'WebXR not supported in this browser' : 'VR needs HTTPS';
    vrBtn.onclick = async () => {
      try {
        const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
        await this.renderer.xr.setSession(session); begin();
        const sp = this.world.spawns[this.myIndex]; setTimeout(() => { if (this.match.ph === 'warmup') this.player.spawn(sp[0], sp[1]); else this._place(); }, 400);
        session.addEventListener('end', () => { $('menu').style.display = 'flex'; this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); });
      } catch (e) { $('status').textContent = 'Could not start VR: ' + e.message; }
    };
    const bind = (id, key, isNum) => { const el = $(id); if (isNum) { el.value = S[key]; el.oninput = () => { S[key] = +el.value; $('tiltv').textContent = S[key] + '°'; save(); }; $('tiltv').textContent = S[key] + '°'; } else { el.checked = S[key]; el.onchange = () => { S[key] = el.checked; save(); }; } };
    bind('tilt', 'tilt', true); bind('smooth', 'smoothTurn'); bind('vignette', 'vignette'); bind('lefty', 'leftHanded');
  }

  // ---------- match flow ----------
  send(m) { if (this.bot) this.bot.recv(m); else this.net.send(m); }
  get hasPeer() { return !!this.bot || this.net.open; }
  get authority() { return !!this.bot || this.net.isHost || !this.net.open; }
  broadcast() { if (!this.bot) this.net.send({ t: 'm', m: this.match }); }
  startRound(map) { const prev = this.match.ph; this.match = { ph: 'countdown', map, sc: [0, 0], tl: 4, n: this.match.n + 1 }; this.broadcast(); this.applyPhase(prev); }
  farSpawn(from) { const s = this.world.spawns.slice().sort((p, q) => Math.hypot(q[0] - from.x, q[1] - from.z) - Math.hypot(p[0] - from.x, p[1] - from.z)); return s[Math.floor(Math.random() * 2)]; }
  _place() { const sp = this.world.spawns[this.myIndex]; this.player.spawn(sp[0], sp[1]); if (this.bot) { const b = this.world.spawns[1]; this.bot.place(b[0], b[1]); } }
  applyPhase() {
    const m = this.match, p = this.player;
    if (m.ph === 'countdown') { this.loadMap(m.map); this._place(); p.locked = true; this.lastBeep = -1; this.ui.show('GET READY', `${MAPS[m.map].name.toUpperCase()} · first to ${KILLS}`, 3.5); [...$('maps').children].forEach((c, i) => c.classList.toggle('on', i === m.map)); }
    else if (m.ph === 'live') { p.locked = false; this.audio.beep(1320, 0.4, 0.35); this.ui.show('FIGHT', '', 1.2, '#ffd040'); }
    else if (m.ph === 'over') { p.locked = true; const me = m.sc[this.myIndex], them = m.sc[1 - this.myIndex], win = me > them; this.audio.fanfare(win); this.ui.show(me === them ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT', `${me} : ${them} · next map loading`, 7, win ? '#40ffb0' : '#ff5040'); }
    else if (m.ph === 'warmup') p.locked = false;
  }
  _flow(dt) {
    const m = this.match;
    if (m.ph === 'warmup') return;
    m.tl -= dt;
    if (m.ph === 'countdown') { const s = Math.ceil(m.tl); if (s !== this.lastBeep && s > 0 && s <= 3) { this.lastBeep = s; this.audio.beep(660, 0.12, 0.3); this.ui.show(String(s), MAPS[m.map].name.toUpperCase(), 0.9); } }
    if (!this.authority) return;
    const prev = m.ph;
    if (m.ph === 'countdown' && m.tl <= 0) { m.ph = 'live'; m.tl = ROUND; }
    else if (m.ph === 'live' && (m.tl <= 0 || m.sc[0] >= KILLS || m.sc[1] >= KILLS)) { m.ph = 'over'; m.tl = 8; }
    else if (m.ph === 'over' && m.tl <= 0) { this.startRound((m.map + 1) % MAPS.length); return; }
    if (m.ph !== prev) { m.n++; this.broadcast(); this.applyPhase(prev); }
    this.syncAcc += dt; if (this.syncAcc > 1) { this.syncAcc = 0; this.broadcast(); }
  }

  onMsg(m) {
    const p = this.player;
    if (m.t === 's') this.avatar.push(m);
    else if (m.t === 'f') this.remoteFire(m);
    else if (m.t === 'h') { if (p.alive && this.match.ph !== 'over' && this.match.ph !== 'countdown') { if (p.damage(m.dmg, m.o)) this.localDeath(); } }
    else if (m.t === 'k') { this.ui.show('ELIMINATED', '', 1.6, '#40ffb0'); this.audio.beep(990, 0.18, 0.3); if (this.authority && this.match.ph === 'live') { this.match.sc[this.myIndex]++; this.broadcast(); } }
    else if (m.t === 'g') this.spawnGrenade(V(m.p), V(m.v), m.f, false);
    else if (m.t === 'm' && !this.authority) { const prev = this.match, changed = m.m.n !== prev.n || m.m.ph !== prev.ph; this.match = m.m; if (changed) this.applyPhase(prev.ph); }
  }
  localDeath() {
    this.ui.show('YOU DIED', 'respawning…', 2.6, '#ff5040');
    this.send({ t: 'k' });
    if (this.authority && this.match.ph === 'live') { this.match.sc[1 - this.myIndex]++; this.broadcast(); }
  }

  // ---------- combat ----------
  onLocalFire(w, shot) {
    const { origin, dirs, fwd } = shot, def = w.def;
    this.audio.shot(def.sound, origin); this.fx.muzzle(origin, fwd, def.flash);
    this.send({ t: 'f', w: def.id, o: A(origin), d: dirs.map(A) });
    if (this.world.blocked(this.player.head, origin)) return; // muzzle pushed through a wall
    let total = 0, head = false;
    for (const d of dirs) {
      const wh = this.world.raycast(origin, d, 150), tw = wh ? wh.t : 150;
      const ah = this.avatar.rayHit(origin, d, tw);
      if (ah) {
        const mult = ah.part === 'head' ? 2.2 : ah.part === 'legs' ? 0.7 : 1, fall = def.pellets > 1 ? Math.max(0.3, Math.min(1, 1.25 - ah.t / 16)) : 1;
        total += def.dmg * mult * fall; head = head || ah.part === 'head';
        this.fx.impact(_a.copy(origin).addScaledVector(d, ah.t), _n.copy(d).negate(), 'body'); this.fx.tracer(origin, d, ah.t);
      } else { if (wh) this.fx.impact(_a.copy(origin).addScaledVector(d, wh.t), _n.set(wh.nx, wh.ny, wh.nz), wh.surf, def.pellets === 1 && def.id === 2); this.fx.tracer(origin, d, tw); }
    }
    if (total > 0) { this.send({ t: 'h', dmg: Math.round(total), o: A(origin) }); this.audio.hitmark(head); this.ui.hitmarker(head); this.player.hands.forEach((h) => { if (h.held && h.held.k === 'weapon') h.pulse(0.3, 20); }); }
  }
  remoteFire(m) {
    const o = V(m.o), type = TYPE_BY_ID[m.w]; if (!type) return;
    const def = DEFS[type], head = this.player.head;
    this.audio.shot(def.sound, o); this.fx.muzzle(o, _b.set(m.d[0][0], m.d[0][1], m.d[0][2]), def.flash); this.avatar.muzzleFlash(m.w, this.flashMat);
    let whiz = false;
    for (const da of m.d) {
      const d = _c.set(da[0], da[1], da[2]), wh = this.world.raycast(o, d, 150), tw = wh ? wh.t : 150;
      const bh = this.player.alive ? hitBody(head, o, d, tw) : null;
      if (bh) this.fx.tracer(o, d, bh.t);
      else { if (wh) this.fx.impact(_a.copy(o).addScaledVector(d, wh.t), _n.set(wh.nx, wh.ny, wh.nz), wh.surf); this.fx.tracer(o, d, tw); }
      const along = _a.subVectors(head, o).dot(d);
      if (!whiz && !bh && along > 1 && along < tw && _a.addScaledVector(d, -along).length() < 1.0) { whiz = true; this.audio.whiz(_a.copy(o).addScaledVector(d, along)); }
    }
  }
  throwGrenade(pos, vel, fuse) { this.spawnGrenade(pos.clone(), vel.clone(), fuse, true); this.send({ t: 'g', p: A(pos), v: A(vel), f: +fuse.toFixed(2) }); }
  spawnGrenade(p, v, fuse, mine) { const mesh = grenadeMesh(); mesh.userData.led.visible = true; mesh.position.copy(p); this.scene.add(mesh); this.grenades.push({ mesh, p, v, fuse, mine }); }
  _grenades(dt) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i]; g.fuse -= dt; g.v.y -= 9.8 * dt;
      const sp = g.v.length(), step = sp * dt;
      if (step > 1e-5) {
        _a.copy(g.v).multiplyScalar(1 / sp); const hit = this.world.raycast(g.p, _a, step + 0.04);
        if (hit) {
          g.p.addScaledVector(_a, Math.max(0, hit.t - 0.04)); _n.set(hit.nx, hit.ny, hit.nz);
          g.v.addScaledVector(_n, -1.45 * g.v.dot(_n)); const f = hit.ny > 0.5 ? 0.72 : 0.8; g.v.x *= f; g.v.z *= f;
          if (sp > 1.2) this.audio.click(g.p, 0.5, Math.min(0.6, sp * 0.08));
          if (hit.ny > 0.5 && Math.abs(g.v.y) < 0.9) g.v.y = 0;
        } else g.p.addScaledVector(_a, step);
      }
      if (g.p.y < 0.04) g.p.y = 0.04;
      g.mesh.position.copy(g.p); g.mesh.rotation.x += sp * dt * 3; g.mesh.rotation.z += sp * dt * 2;
      g.mesh.userData.led.visible = Math.sin(g.fuse * 30) > 0;
      if (g.fuse <= 0) {
        this.scene.remove(g.mesh); this.grenades.splice(i, 1);
        this.fx.explosion(g.p);
        const pl = this.player; _b.copy(pl.head); _b.y -= 0.35; _c.copy(g.p); _c.y += 0.25;
        const d = _b.distanceTo(g.p);
        if (pl.alive && d < 7 && !this.world.blocked(_c, _b) && this.match.ph !== 'countdown') { if (pl.damage(140 * Math.pow(1 - d / 7, 1.3), g.p)) this.localDeath(); }
        if (this.bot && this.match.ph === 'live') this.bot.explosion(_c);
        if (d < 14) pl.hands.forEach((h) => h.pulse(1 - d / 14, 250));
      }
    }
  }

  update(dt) {
    this.time += dt;
    const p = this.player;
    if (!this.playing) {
      // menu backdrop: slow orbit of the selected arena
      const a = this.time * 0.08; this.rig.position.set(0, 0, 0); this.rig.rotation.set(0, 0, 0);
      const [or, oh] = this.world.orbit; this.camera.position.set(Math.cos(a) * or, oh, Math.sin(a) * or); this.camera.lookAt(Math.cos(a + 2.2) * or * 1.4, oh * 0.45, Math.sin(a + 2.2) * or * 1.4);
      this.world.update(dt, this.time, this.camera.position); this.fx.update(dt); if (this.bot) this.bot.update(dt); this.avatar.update(dt); this._flow(dt);
      return;
    }
    this._flow(dt);
    if (this.bot) this.bot.update(dt);
    p.update(dt);
    if (!p.alive && p.respawnT <= 0 && (this.match.ph === 'live' || this.match.ph === 'warmup')) { const s = this.farSpawn(this.avatar.present ? this.avatar.head : _a.set(0, 0, 0)); p.spawn(s[0], s[1]); }
    this.avatar.update(dt);
    this._grenades(dt);
    this.fx.update(dt);
    this.world.update(dt, this.time, p.head);
    this.ui.update(dt);
    this.audio.listener(p.head, _a.set(0, 0, -1).applyQuaternion(p.headQ), _b.set(0, 1, 0).applyQuaternion(p.headQ));
    this.sendAcc += dt;
    if (this.sendAcc > 1 / 30 && this.net.open) { this.sendAcc = 0; this.net.send(p.snapshot()); }
  }
}

new Game();
