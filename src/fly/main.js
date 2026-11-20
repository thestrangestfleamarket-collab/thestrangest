// Sky Aces — game bootstrap, main loop, camera rig, VR interaction, mission flow.
import * as THREE from 'three';
import { PLANES, PLANE_BY_ID, ERAS, opponentsFor, alliesFor } from './planes.js';
import { World } from './world.js';
import { Sky, atmo } from './sky.js';
import { Clouds, Particles, Tracers, Glows, Birds } from './effects.js';
import { loadTextures, loadPlane } from './assets.js';
import { Aircraft, Rocket } from './aircraft.js';
import { AI } from './ai.js';
import { Cockpit } from './cockpit.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { canvasTex, MS2KT, M2FT } from './displays.js';

const $ = id => document.getElementById(id), clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _ray = new THREE.Ray(), _e = new THREE.Euler();
const NEAR_W = 2.5, FAR_W = 260000, NEAR_L = 0.05, FAR_L = 600;
function setNearFar(cam, n, f) { const e = cam.projectionMatrix.elements; e[10] = -(f + n) / (f - n); e[14] = -2 * f * n / (f - n); cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); }

const HELP = `<table><tr><td><b>W/S, ↑/↓</b></td><td>pitch</td><td><b>A/D, ←/→</b></td><td>roll</td></tr><tr><td><b>Q/E</b></td><td>rudder</td><td><b>Shift/Ctrl, wheel</b></td><td>throttle</td></tr>
<tr><td><b>Space / LMB</b></td><td>guns</td><td><b>R</b></td><td>rocket (jets)</td></tr><tr><td><b>X</b></td><td>weapon select</td><td><b>G / F / B</b></td><td>gear / flaps / brake</td></tr>
<tr><td><b>V</b></td><td>cockpit ↔ chase</td><td><b>RMB drag</b></td><td>look around</td></tr><tr><td><b>Click canvas</b></td><td>mouse-stick (Esc frees cursor)</td><td><b>Click switches</b></td><td>operate cockpit</td></tr>
<tr><td><b>I / P / L</b></td><td>engine / autopilot / lights</td><td><b>N / T / Enter</b></td><td>next plane / time / respawn</td></tr></table>
<div style="margin-top:6px"><b>Quest 3:</b> right stick pitch/roll · left stick throttle/rudder · right trigger guns · A rocket · B weapon · X view · Y respawn (hold: next plane) · squeeze right grip to grab the stick, left grip the throttle · touch switches with your fingertip or point the left hand and pull the trigger.</div>`;

class Game {
  constructor() { this.aircraft = []; this.rockets = []; this.player = null; this.cockpit = null; this.state = 'menu'; this.view = 'cockpit'; this.kills = 0; this.wave = 1; this.night = 0; this.camPos = new THREE.Vector3(0, 1500, 0); this.time = 0; this.msgs = []; this.aiFocusPlayer = 1; this.opts = { enemies: 2, wing: 0, skill: 0.6, start: 'air', markers: true, time: 'day', quality: 1, comfort: 1 }; this.respawnT = -1; this.waveT = -1; this.fps = 60; this.score = 0; this.sunDir = new THREE.Vector3(0, 1, 0); }

  async init() {
    const canvas = $('view'); const R = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio, 1.5)); R.setSize(innerWidth, innerHeight); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0; R.autoClear = false;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.xr.enabled = true; R.xr.setReferenceSpaceType('local'); R.xr.setFoveation(1);
    this.scene = new THREE.Scene(); this.local = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, NEAR_L, FAR_W); this.camera.rotation.order = 'YXZ';
    this.rig = new THREE.Group(); this.local.add(this.rig); this.rig.add(this.camera);
    addEventListener('resize', () => { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); });
    this.input = new Input(canvas); this.audio = new Audio();
    const st = $('status'); st.textContent = 'Loading textures…';
    this.tex = await loadTextures(); st.textContent = 'Generating terrain…'; await new Promise(r => setTimeout(r, 30));
    this.world = new World(); this.world.generate(); this.world.build(this.scene, this.tex);
    this.sky = new Sky(this.scene, this.local, this.tex.noise); this.clouds = new Clouds(this.scene, 1); this.particles = new Particles(this.scene); this.tracers = new Tracers(this.scene); this.glows = new Glows(this.scene); this.birds = new Birds(this.scene, this.world);
    this.setTime('day'); this.buildOverlay(); this.buildMarkers(); this.buildVR(); this.buildNightLights();
    this.camPos.set(this.world.bases[0].x + 900, this.world.bases[0].y + 420, this.world.bases[0].z + 1900); this.rig.position.copy(this.camPos); this.rig.lookAt(this.world.bases[0].x, this.world.bases[0].y + 60, this.world.bases[0].z);
    this.buildMenu(); st.textContent = 'Ready.'; $('fly').disabled = false;
    if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then(ok => { $('vr').disabled = !ok; if (!ok) $('vr').textContent = 'VR not available'; }).catch(() => { $('vr').textContent = 'VR not available'; }); else $('vr').textContent = 'VR needs HTTPS + WebXR';
    this.clock = new THREE.Clock(); R.setAnimationLoop(() => this.frame());
  }
  applyQuality() { const q = this.opts.quality; if (q === this._q) return; this._q = q; this.world.setQuality(q); this.sky.sun.shadow.mapSize.set(q < 1 ? 1024 : 2048, q < 1 ? 1024 : 2048); this.sky.sun.shadow.map?.dispose(); this.sky.sun.shadow.map = null; this.clouds.setQuality(q); if (!this.renderer.xr.isPresenting) this.renderer.setPixelRatio(Math.min(devicePixelRatio, q < 1 ? 1 : 1.5)); }
  setTime(key) { this.opts.time = key; this.sky.setTime(key, this.renderer); this.night = this.sky.t.night; this.sunDir = atmo.uSunDir.value; this.renderer.toneMappingExposure = key === 'night' ? 1.5 : key === 'dusk' ? 1.2 : 1.0; }

  // ---------- menu ----------
  buildMenu() {
    const list = $('list'); let sel = localStorage.getItem('skyaces.plane') || 'spitfire'; if (!PLANE_BY_ID[sel]) sel = 'spitfire';
    const show = id => { sel = id; this.selected = id; localStorage.setItem('skyaces.plane', id); const p = PLANE_BY_ID[id]; for (const b of list.querySelectorAll('.plane')) b.classList.toggle('sel', b.dataset.id === id);
      $('pname').textContent = `${p.name} (${p.year})`; const pw = p.engine === 'jet' ? `${(p.thrust / 1000).toFixed(0)} kN${p.thrustAB ? ` / ${(p.thrustAB / 1000).toFixed(0)} kN afterburner` : ''}` : `${Math.round(p.power / 745.7)} hp ${p.engine}`;
      $('pstats').innerHTML = `<span>Engine</span><b>${pw}</b><span>Mass</span><b>${p.mass.toLocaleString()} kg</b><span>Wing</span><b>${p.S} m² · span ${p.b} m</b><span>Guns</span><b>${p.gun.name}</b><span>Stores</span><b>${p.rockets ? p.rockets + ' rockets' : '—'}</b><span>Cockpit</span><b>${{ ww1: 'Open, wood & brass', ww2: 'Analog six-pack, reflector sight', jet1: 'Analog, gyro gunsight', jet3: 'Analog + radar CRT + HUD', jet4: 'Glass: 3 MFDs + HUD' }[p.kit]}</b><span>Opponents</span><b>${opponentsFor(p).map(o => o.name.split(' ').slice(-2).join(' ')).join(', ')}</b>`; };
    for (const era of ERAS) { const d = document.createElement('div'); d.className = 'era'; d.innerHTML = `<h2>${era}</h2><div class="planes"></div>`; for (const p of PLANES.filter(p => p.era === era)) { const b = document.createElement('button'); b.className = 'plane'; b.dataset.id = p.id; b.innerHTML = `<b>${p.name}</b><small>${p.year} · ${p.nation}</small>`; b.onclick = () => show(p.id); d.lastChild.appendChild(b); } list.appendChild(d); }
    show(sel); $('helpInline').innerHTML = HELP; $('help').innerHTML = HELP;
    $('oTime').onchange = e => this.setTime(e.target.value);
    const read = () => { this.opts.enemies = +$('oEnemies').value; this.opts.wing = +$('oWing').value; this.opts.skill = +$('oSkill').value; this.opts.start = $('oStart').value; this.opts.markers = $('oMarkers').value === '1'; this.opts.comfort = +$('oComfort').value; this.opts.quality = +$('oQuality').value; };
    $('fly').onclick = async () => { read(); await this.audio.init(); this.start(this.selected); };
    $('vr').onclick = async () => { read(); this.opts.quality = Math.min(this.opts.quality, 0.6); this.audio.init(); try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }); this.renderer.xr.setFramebufferScaleFactor?.(0.85); await this.renderer.xr.setSession(s); s.addEventListener('end', () => { this.inXR = false; }); this.inXR = true; this.start(this.selected); } catch (err) { $('status').textContent = 'Could not start VR: ' + err.message; } };
  }

  // ---------- head-locked message panel, g-vignette, target markers ----------
  buildOverlay() {
    const o = this.panel = canvasTex(1024, 256); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.225), new THREE.MeshBasicMaterial({ map: o.t, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false })); m.position.set(0, -0.33, -1.3); m.renderOrder = 50; this.camera.add(m); this.panelMesh = m;
    const vg = this.vignette = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uC: { value: new THREE.Color(0, 0, 0) } }, transparent: true, depthTest: false, depthWrite: false, vertexShader: 'varying vec2 vU; void main(){ vU = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'uniform float uA; uniform vec3 uC; varying vec2 vU; void main(){ float r = length(vU); gl_FragColor = vec4(uC, clamp(smoothstep(1.0 - uA * 1.15, 1.25 - uA * 0.9, r * 1.6) * min(uA * 2.0, 1.0), 0.0, 1.0)); }' }));
    vg.position.z = -1.5; vg.scale.setScalar(12.5); vg.renderOrder = 60; this.camera.add(vg); this.gEff = 0;
  }
  buildMarkers() { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 5; for (const [x, y, dx, dy] of [[6, 6, 1, 1], [58, 6, -1, 1], [6, 58, 1, -1], [58, 58, -1, -1]]) { g.beginPath(); g.moveTo(x + dx * 16, y); g.lineTo(x, y); g.lineTo(x, y + dy * 16); g.stroke(); }
    const t = new THREE.CanvasTexture(c); this.markers = []; for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false, sizeAttenuation: false, transparent: true, fog: false, toneMapped: false })); s.scale.setScalar(0.045); s.visible = false; s.renderOrder = 30; this.scene.add(s); this.markers.push(s); } }
  buildNightLights() { const L = this.nightLights = []; for (const r of this.world.runways) for (let z = -1200; z <= 1200; z += 60) { L.push([r.x - 24, r.y + 0.6, r.z + z, 1, 0.9, 0.6], [r.x + 24, r.y + 0.6, r.z + z, 1, 0.9, 0.6]); }
}
  say(text, t = 4) { this.msgs.unshift({ text, t }); this.msgs.length = Math.min(this.msgs.length, 3); this.panelDirty = true; }

  // ---------- VR controllers ----------
  buildVR() {
    const R = this.renderer; this.hands = [];
    const glove = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.8 });
    for (let i = 0; i < 2; i++) { const grip = R.xr.getControllerGrip(i), ray = R.xr.getController(i); const h = { grip, ray, src: null, touched: null, touchT: 0, grab: false, btn: {} };
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.1), glove); palm.position.set(0, 0, 0.02); const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.06, 4, 8).rotateX(Math.PI / 2), glove); finger.position.set(0, 0.005, -0.06); const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.035, 4, 8).rotateZ(Math.PI / 2.4), glove); thumb.position.set(0.045, 0, 0);
      grip.add(palm, finger, thumb); h.tip = new THREE.Object3D(); h.tip.position.set(0, 0.005, -0.095); grip.add(h.tip);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: 0xffb648 })); line.visible = false; ray.add(line); h.line = line;
      ray.addEventListener('connected', e => { h.src = e.data; h.hand = e.data.handedness; }); ray.addEventListener('disconnected', () => { h.src = null; });
      this.rig.add(grip, ray); this.hands.push(h); }
    this.hi = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0022, 6, 20), new THREE.MeshBasicMaterial({ color: 0xffc04a, depthTest: false, toneMapped: false })); this.hi.visible = false; this.hi.renderOrder = 40; this.local.add(this.hi);
  }
  pulse(h, a = 0.6, ms = 35) { try { h.src?.gamepad?.hapticActuators?.[0]?.pulse(a, ms); } catch (e) { } }
  updateVR(dt) {
    const inp = this.input, pl = this.player, ck = this.cockpit; let xp = 0, xr = 0, xy = 0, fire = false, hover = null;
    for (const h of this.hands) { const gp = h.src?.gamepad; if (!gp) continue; const b = gp.buttons, ax = gp.axes, sx = ax[2] || 0, sy = ax[3] || 0, dz = v => Math.abs(v) < 0.12 ? 0 : (v - Math.sign(v) * 0.12) / 0.88, right = h.hand === 'right';
      const edge = (i, ev) => { const p = !!b[i]?.pressed; if (p && !h.btn[i]) { if (typeof ev === 'function') ev(); else inp.events.push(ev); } const was = h.btn[i]; h.btn[i] = p; return p && !was; };
      const sq = b[1]?.pressed; // grab stick / throttle
      if (sq && !h.grab) { h.grab = true; h.q0 = h.grip.quaternion.clone(); h.p0 = h.grip.position.clone(); h.thr0 = inp.throttle; this.pulse(h, 0.4, 20); } if (!sq) h.grab = false;
      if (right) { if (h.grab) { _q.copy(h.q0).invert().multiply(h.grip.quaternion); _e.setFromQuaternion(_q, 'YXZ'); xp += clamp(_e.x / 0.45, -1, 1); xr += clamp(-_e.z / 0.5, -1, 1); xy += clamp(-_e.y / 0.5, -1, 1) * 0.6; } else { xr += dz(sx); xp += dz(sy); }
        if (b[0]?.value > 0.4) fire = true; edge(4, 'rocket'); edge(5, 'weapon'); edge(3, 'flaps'); }
      else { if (h.grab) inp.setThrottle(h.thr0 + (h.p0.z - h.grip.position.z) / 0.22); else { if (Math.abs(sx) > Math.abs(sy)) xy += dz(sx); else if (Math.abs(sy) > 0.2) inp.setThrottle(inp.throttle - dz(sy) * dt * 0.8); }
        edge(4, 'view'); edge(3, 'gear'); const y = !!b[5]?.pressed; if (y) { h.yT = (h.yT || 0) + dt; if (h.yT > 1 && !h.yLong) { h.yLong = true; inp.events.push('nextPlane'); } } else { if (h.btn.y && !h.yLong) inp.events.push('respawn'); h.yT = 0; h.yLong = false; } h.btn.y = y; }
      // cockpit interaction: fingertip touch, or point + trigger with the left hand
      h.line.visible = false;
      if (ck && this.view === 'cockpit' && pl && !h.grab) { h.tip.getWorldPosition(_v); ck.group.worldToLocal(_v); let c = ck.nearest(_v, 0.022); h.touchT -= dt; if (!c && b[0]?.value > 0.5 && !h.trg) { ck.controls.forEach(k => { if (k.noTouch && k.pos.distanceTo(_v) < k.r + 0.05) c = k; }); if (c) h.touched = null; } h.trg = b[0]?.value > 0.5;
        if (c && c !== h.touched && h.touchT <= 0) { c.press(); this.pulse(h); h.touchT = 0.45; this.say(c.name + (c.state ? (c.state() ? '  ON' : '  OFF') : ''), 1.5); } h.touched = c; if (c) hover = c;
        if (!right && !c) { h.ray.getWorldPosition(_v); h.ray.getWorldDirection(_v2).negate(); ck.group.worldToLocal(_v); _v2.transformDirection(_m.copy(ck.group.matrixWorld).invert()); _ray.set(_v, _v2); const pc = ck.pick(_ray); if (pc) { hover = pc; h.line.visible = true; h.line.scale.z = pc.pos.distanceTo(_v); if (edge(0, () => { })) { pc.press(); this.pulse(h); this.say(pc.name + (pc.state ? (pc.state() ? '  ON' : '  OFF') : ''), 1.5); } } else h.btn[0] = !!b[0]?.pressed; } }
    }
    this.xrCtl = { pitch: xp, roll: xr, yaw: xy, fire }; return hover;
  }

  // ---------- mission ----------
  async start(id) {
    $('menu').style.display = 'none'; $('help').style.display = 'none'; if (!this.inXR && !this._helped) { this._helped = true; this.say('Press H for controls · V to change view · click the canvas for mouse-stick', 8); }
    this.say('Loading aircraft…', 2); this.state = 'loading'; this.applyQuality();
    if (this.cockpit) { if (this.rig.parent !== this.local) { this.rig.getWorldPosition(_v); this.local.add(this.rig); this.rig.position.copy(_v); } this.cockpit.dispose(); this.cockpit = null; } this.player = null; for (const a of this.aircraft) a.dispose(); this.aircraft.length = 0; for (const r of this.rockets) this.scene.remove(r.mesh); this.rockets.length = 0; this.kills = 0; this.wave = 1; this.score = 0; this.sorties = 1;
    const spec = PLANE_BY_ID[id]; this.selected = id; const asset = await loadPlane(id);
    const pl = this.player = new Aircraft(this, spec, asset, { player: true, team: 0 }); this.local.add(pl.group); this.aircraft.push(pl);
    this.cockpit = new Cockpit(this, pl, this.tex); pl.group.add(this.cockpit.group);
    this.spawnPlayer(); this.setView(this.view, true);
    for (let i = 0; i < this.opts.wing; i++) await this.spawnAI(alliesFor(spec), 0, i);
    await this.spawnWave(this.opts.enemies); this.state = 'fly'; this.respawnT = -1; this.waveT = -1;
    this.say(`${spec.name}${this.opts.enemies ? ` — ${this.opts.enemies} bandit${this.opts.enemies > 1 ? 's' : ''} inbound` : ' — free flight'}`, 5);
  }
  spawnPlayer() {
    const pl = this.player, b = this.world.bases[0], s = pl.spec, vs = Math.sqrt(2 * s.mass * 9.81 / (1.225 * s.S * s.CLmax));
    if (this.opts.start === 'runway') { pl.spawn(_v.set(b.x, this.world.runways[0].y - pl.fm.gearY + 0.02, b.z + 1050), 0, 0, true); this.input.setThrottle(0); this.say('Runway start: throttle up (Shift / left stick), ease back at speed', 6); }
    else { const alt = s.era === 'WW1' ? 900 : s.engine === 'jet' ? 3200 : 1900; pl.spawn(_v.set(b.x - 1500, b.y + alt, b.z + 3000), 0, s.engine === 'jet' ? Math.max(210, vs * 2.6) : vs * 2.3, false); this.input.setThrottle(0.85); }
    pl.group.visible = true; if (!pl.group.parent) this.local.add(pl.group); this.input.mouse.x = this.input.mouse.y = 0;
  }
  async spawnAI(pool, team, idx) {
    const spec = pool[Math.floor(Math.random() * pool.length)], asset = await loadPlane(spec.id), pl = this.player, a = new Aircraft(this, spec, asset, { team });
    a.ai = new AI(a, team === 1 ? this.opts.skill : 0.7); this.scene.add(a.group); this.aircraft.push(a);
    const p = pl.fm.pos, f = pl.fwd, jet = spec.engine === 'jet'; const dist = team === 1 ? (jet ? 7000 : 2800) + Math.random() * 1500 : 60 + idx * 50, side = (idx % 2 ? 1 : -1) * (team === 1 ? 500 + idx * 250 : 40 + idx * 30);
    _v.set(p.x + f.x * dist * (team === 1 ? 1 : -1) + f.z * side, 0, p.z + f.z * dist * (team === 1 ? 1 : -1) - f.x * side); _v.y = Math.max(p.y + (team === 1 ? (Math.random() - 0.3) * 400 : 20), this.world.ground(_v.x, _v.z) + 500);
    const hdg = Math.atan2(-f.x, -f.z) + (team === 1 ? Math.PI : 0); const vs = Math.sqrt(2 * spec.mass * 9.81 / (1.225 * spec.S * spec.CLmax)); a.spawn(_v, hdg, jet ? Math.max(220, vs * 2.6) : vs * 2.3); a.ai.home.copy(p); return a;
  }
  async spawnWave(n) { this.spawning = true; try { const pool = opponentsFor(this.player.spec); for (let i = 0; i < n; i++) await this.spawnAI(pool, 1, i); } finally { this.spawning = false; } }
  onKill(victim, by, crash) {
    if (victim === this.player) { if (crash) this.audio.crash(); if (this.respawnT < 0) { this.respawnT = 6; this.score = Math.max(0, this.score - 150); this.sorties++; this.say((by && by !== victim ? `Shot down by ${by.spec.name}` : 'Aircraft lost') + ` — sortie over: ${this.kills} kills, score ${this.score}`, 6); } return; }
    if (crash && !by) return; if (by === this.player && victim.team !== this.player.team && !victim.credited) { victim.credited = true; this.kills++; this.score += 100 * this.wave; this.say(this.kills === 5 ? `ACE! Five victories — ${victim.spec.name} destroyed` : `Kill! ${victim.spec.name} destroyed  (${this.kills})  +${100 * this.wave}`, 4); } else if (!victim.credited && by) { victim.credited = true; this.say(`${victim.team === 0 ? 'Wingman' : 'Bandit'} ${victim.spec.name} is down`, 3); }
  }
  demo(on = true) { const pl = this.player; if (!pl) return; pl.ai = on ? new AI(pl, 0.8) : null; if (pl.ai) pl.ai.home.copy(pl.fm.pos); } // self-flying attract / test mode
  eject() { const pl = this.player; if (!pl || !pl.alive) return; pl.alive = false; this.score = Math.max(0, this.score - 150); this.say('EJECTED — respawning', 5); this.respawnT = 5; this.particles.explosion(pl.fm.pos, pl.fm.vel, 0.3); }
  spawnRocket(owner, pos) { this.rockets.push(new Rocket(this, owner, pos)); if (owner === this.player) this.audio.play('missile', 0.8); }
  // VR: put the pilot's current head position/heading back on the design eye point
  recenter() { const cam = this.camera, pl = this.player; if (!pl || this.view !== 'cockpit') return; _e.setFromQuaternion(cam.quaternion, 'YXZ'); this.rig.quaternion.setFromEuler(_e.set(0, -_e.y, 0, 'YXZ')); _v.copy(cam.position).applyQuaternion(this.rig.quaternion); this.rig.position.copy(this.cockpit.eye).sub(_v); }
  setView(v, force) { if (v === this.view && !force) return; this.view = v; const pl = this.player, cam = this.camera; if (!pl) return;
    if (v === 'cockpit') { pl.group.add(this.rig); this.rig.position.copy(this.cockpit.eye); this.rig.quaternion.identity(); } else { this.local.add(this.rig); this.rig.position.copy(pl.fm.pos).addScaledVector(pl.fwd, -30).y += 8; }
    cam.position.set(0, 0, 0); this.input.mouse.lx = this.input.mouse.ly = 0;
    if (pl.parts?.pilot) pl.parts.pilot.visible = v !== 'cockpit'; this.cockpit.group.visible = true; if (pl.clipU) pl.clipU.uCkOn.value = v === 'cockpit' ? 1 : 0; if (pl.parts?.glass) pl.parts.glass.visible = v !== 'cockpit'; }

  handleEvents(hoverCtl) {
    const pl = this.player, fm = pl?.fm, inp = this.input;
    for (const e of inp.pop()) { if (this.state !== 'fly') { if (e === 'menu' && this.state !== 'menu') this.toMenu(); continue; }
      if (e === 'gear' && !pl.spec.fixedGear && !fm.onGround) { fm.gearDown = !fm.gearDown; this.audio.ui('gear'); this.say(fm.gearDown ? 'Gear down' : 'Gear up', 2); }
      else if (e === 'flaps') { fm.flapsTarget = fm.flapsTarget >= 0.99 ? 0 : fm.flapsTarget + 0.5; this.audio.ui('lever'); this.say(`Flaps ${Math.round(fm.flapsTarget * 100)}%`, 2); }
      else if (e === 'airbrake' && pl.spec.airbrake && !fm.onGround) { fm.airbrake = !fm.airbrake; this.say(fm.airbrake ? 'Speed brake out' : 'Speed brake in', 2); }
      else if (e === 'view') { if (this.inXR && this.opts.comfort >= 2) this.say('Cockpit only (comfort)', 2); else this.setView(this.view === 'cockpit' ? 'chase' : 'cockpit'); }
      else if (e === 'lights') { const on = !this.cockpit.sys.panelLight; pl.lights.nav = true; pl.lights.landing = on; this.cockpit.sys.panelLight = on; this.cockpit.sys.flood = on && this.night > 0.3; this.audio.ui('switch'); this.say(on ? 'Panel, flood and landing lights on' : 'Lights off', 2); }
      else if (e === 'weapon') { const w = pl.cycleWeapon(); this.audio.ui('switch'); this.say(w === 'gun' ? 'Guns' : 'Rockets', 2); }
      else if (e === 'rocket') { if (pl.spec.rockets) { pl.weapon = 'rocket'; if (!pl.fireRocket() && pl.rockets <= 0) this.say('No rockets', 2); } }
      else if (e === 'engine') { fm.engineOn = !fm.engineOn; this.say(fm.engineOn ? 'Engine start' : 'Engine cut', 2); if (fm.engineOn) this.audio.ui(pl.spec.engine === 'jet' ? 'jet_start' : 'prop_start'); }
      else if (e === 'autopilot') { fm.autopilot = !fm.autopilot; fm.apAlt = fm.alt; this.say(fm.autopilot ? 'Autopilot: altitude hold' : 'Autopilot off', 2); }
      else if (e === 'respawn') { if (!pl.alive || pl.removed) this.respawn(); else if (this.inXR) { this.recenter(); this.say('View recentered', 2); } }
      else if (e === 'nextPlane') { const i = PLANES.findIndex(p => p.id === this.selected); this.start(PLANES[(i + 1) % PLANES.length].id); return; }
      else if (e === 'time') { const k = ['day', 'golden', 'dusk', 'night']; this.setTime(k[(k.indexOf(this.opts.time) + 1) % 4]); this.say(this.sky.t.label, 2); this.cockpit.sys.panelLight = this.night > 0.3; this.cockpit.sys.flood = this.night > 0.8; }
      else if (e === 'markers') this.opts.markers = !this.opts.markers;
      else if (e === 'help') $('help').style.display = $('help').style.display === 'block' ? 'none' : 'block';
      else if (e === 'menu') this.toMenu();
      else if (e === 'click' && !this.inXR) { if (hoverCtl) { hoverCtl.press(); this.say(hoverCtl.name + (hoverCtl.state ? (hoverCtl.state() ? '  ON' : '  OFF') : ''), 1.5); } else if (!inp.mouse.locked) this.renderer.domElement.requestPointerLock?.(); } }
  }
  toMenu() { this.state = 'menu'; $('menu').style.display = 'flex'; document.exitPointerLock?.(); this.audio.stopAll?.(); this.audio.plane = null; }
  respawn() { const pl = this.player; if (!pl) return; pl.removed = false; pl.lastHitBy = null; this.spawnPlayer(); this.setView(this.view, true); this.respawnT = -1; this.say('Back in the fight', 3); for (const a of this.aircraft) if (a.ai) a.ai.home.copy(pl.fm.pos); }

  // ---------- frame ----------
  frame() { try { this.frame2(); } catch (err) { if (!this._err) { this._err = true; console.error(err); } } }
  frame2() {
    const dt = Math.min(this.clock.getDelta(), 0.05); this.fps += (1 / Math.max(dt, 1e-3) - this.fps) * 0.05; const xr = this.renderer.xr.isPresenting;
    this.tick(dt, xr); this.render(xr); this.dynRes(dt, xr);
  }
  // hold the frame rate by drawing fewer pixels: the headset's viewport scale, the screen's pixel ratio
  dynRes(dt, xr) {
    this.ft = (this.ft || dt) + (dt - (this.ft || dt)) * 0.05; this.resT = (this.resT || 0) + dt; if (this.resT < (xr ? 0.5 : 2.5) || this.state !== 'fly') return; this.resT = 0;
    const target = xr ? 1 / 72 : 1 / 50, s0 = this.resScale ?? 1; let s = s0; if (this.ft > target * 1.18) s = Math.max(0.6, s0 - 0.08); else if (this.ft < target * 1.04) s = Math.min(1, s0 + 0.04); if (s === s0) return; this.resScale = s;
    if (xr) { const f = this.renderer.xr.getFrame?.(), ref = this.renderer.xr.getReferenceSpace?.(), pose = f && ref && f.getViewerPose(ref); if (pose) for (const v of pose.views) if (typeof v.requestViewportScale === 'function') v.requestViewportScale(s); }
    else this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.opts.quality < 1 ? 1 : 1.5) * s);
  }
  // run the simulation without rendering (tests / fast-forward)
  simulate(seconds, dt = 1 / 30) { for (let t = 0; t < seconds; t += dt) this.tick(dt, false); return this.time; }
  tick(dt, xr) {
    this.time += dt; atmo.uTime.value = this.time;
    const R = this.renderer, inp = this.input, pl = this.player; inp.update(dt);
    let hover = xr ? this.updateVR(dt) : null; for (const h of this.hands) { h.grip.visible = xr && !!h.src; if (!xr) h.ray.visible = false; }
    if (!xr && this.state === 'fly' && this.view === 'cockpit' && !inp.mouse.locked && inp.mouse.cx != null) { // mouse hover over cockpit controls
      _v.set(inp.mouse.cx / innerWidth * 2 - 1, -(inp.mouse.cy / innerHeight) * 2 + 1, 0.5).unproject(this.camera); this.camera.getWorldPosition(_v2); _v.sub(_v2).normalize(); const inv = _m.copy(this.cockpit.group.matrixWorld).invert(); _v2.applyMatrix4(inv); _v.transformDirection(inv); _ray.set(_v2, _v); hover = this.cockpit.pick(_ray);
      const tip = $('tip'); if (hover) { tip.style.display = 'block'; tip.style.left = inp.mouse.cx + 14 + 'px'; tip.style.top = inp.mouse.cy + 10 + 'px'; tip.textContent = hover.name + (hover.state ? (hover.state() ? ' — ON' : ' — OFF') : ''); } else tip.style.display = 'none'; } else if (!xr) $('tip').style.display = 'none';
    if (hover && this.cockpit) { this.hi.visible = true; this.cockpit.group.localToWorld(this.hi.position.copy(hover.pos)); this.hi.quaternion.copy(this.cockpit.panel.getWorldQuaternion(_q)); this.hi.scale.setScalar(Math.max(0.8, hover.r / 0.02)); } else this.hi.visible = false;
    this.handleEvents(hover);
    this.glows.begin();
    if (this.state === 'fly' && pl) {
      const c = pl.fm.ctl, x = xr ? this.xrCtl : null;
      if (pl.alive && !pl.ai) { c.pitch = clamp(inp.pitch + (x ? x.pitch : 0), -1, 1); c.roll = clamp(inp.roll + (x ? x.roll : 0), -1, 1); c.yaw = clamp(inp.yaw + (x ? x.yaw : 0), -1, 1); if (this.opts.comfort >= 2) { c.pitch *= 0.55; c.roll *= 0.5; if (Math.abs(c.roll) < 0.08 && !pl.fm.onGround) c.roll = clamp(-Math.atan2(-pl.right.y, pl.up.y) * 1.2, -0.4, 0.4); } c.throttle = inp.throttle; c.brake = inp.brake; pl.firing = (inp.fire || (x && x.fire)) && pl.weapon === 'gun'; if ((inp.fire || (x && x.fire)) && pl.weapon === 'rocket' && !this._rk) pl.fireRocket(); this._rk = inp.fire || (x && x.fire); }
      for (const a of this.aircraft) a.update(dt);
      for (const r of this.rockets) r.update(dt); this.rockets = this.rockets.filter(r => r.alive);
      this.tracers.update(dt, (i, x0, y0, z0, x1, y1, z1) => { if (y1 < this.world.ground(x1, z1)) { if (Math.random() < 0.3) this.particles.spawn(x1, y1 + 0.5, z1, 0, 4, 0, 0.8, 0.5, 3, y1 < 0.2 ? 0.9 : 0.5, y1 < 0.2 ? 0.95 : 0.42, y1 < 0.2 ? 1 : 0.3, 0.6); return true; }
        const owner = this.tracers.owner[i]; for (const a of this.aircraft) { if (a === owner || a.removed || a.team === owner.team) continue; if (a.hitTest(x0, y0, z0, x1, y1, z1)) { a.damage(this.tracers.dmg[i], owner); this.particles.spawn(x1, y1, z1, a.fm.vel.x, a.fm.vel.y, a.fm.vel.z, 0.18, 0.4, 1.6, 8, 5, 2, 0.9, true); if (owner === pl || a === pl) this.audio.hit(); return true; } } return false; });
      // mission flow
      for (let i = this.aircraft.length - 1; i >= 0; i--) { const a = this.aircraft[i]; if (a.removed && a !== pl) { a.dispose(); this.aircraft.splice(i, 1); } }
      if (this.respawnT > 0) { this.respawnT -= dt; if (this.respawnT <= 0) this.respawn(); }
      if (this.opts.enemies > 0 && !this.spawning && !this.aircraft.some(a => a.team === 1 && a.alive) && this.waveT < 0) { this.waveT = 6; if (this.kills > 0) { this.score += 250; this.say(`Wave ${this.wave} cleared  +250`, 4); } }
      if (this.waveT > 0) { this.waveT -= dt; if (this.waveT <= 0) { this.waveT = -1; this.wave++; const n = Math.min(6, this.opts.enemies + Math.floor((this.wave - 1) / 2)); this.spawnWave(n); this.say(`Wave ${this.wave}: ${n} bandit${n > 1 ? 's' : ''}`, 4); } }
      // world boundary: gentle reminder
      if (pl.alive && Math.max(Math.abs(pl.fm.pos.x), Math.abs(pl.fm.pos.z)) > 52000 && this.time % 8 < dt) this.say('Leaving the combat area — turn back toward the island', 4);
    }
    this.particles.update(dt);
    if (this.night > 0.3) for (const l of this.nightLights) this.glows.add(l[0], l[1], l[2], 1.6, l[3] * 2.2, l[4] * 2.2, l[5] * 2.2);
    this.glows.end();
    this.updateCamera(dt, xr);
    if (this.cockpit && pl) this.cockpit.update(dt, this.state === 'fly');
    this.local.updateMatrixWorld(); this.camera.getWorldPosition(this.camPos);
    this.world.update(this.camPos, dt); this.clouds.update(dt, this.camPos); this.birds.update(dt, this.camPos, pl ? pl.fwd : _v.set(0, 0, -1)); this.sky.update(this.camPos, pl ? pl.fm.pos : this.camPos); this.sunDir = atmo.uSunDir.value;
    if (pl) { const sc = this.sky.sun.shadow.camera, s = this.view === 'cockpit' ? 3.4 : Math.max(pl.span, pl.len) * 0.75; if (sc.right !== s) { sc.left = sc.bottom = -s; sc.right = sc.top = s; sc.updateProjectionMatrix(); } }
    this.updateMarkers(); this.updateOverlay(dt, xr);
    if (pl && this.state === 'fly') this.audio.update(dt, pl, this.view === 'cockpit', this.aircraft, this.camPos);
  }

  updateCamera(dt, xr) {
    const pl = this.player, cam = this.camera, inp = this.input; if (!pl || this.state === 'menu') { if (!pl) { this.rig.rotation.y += dt * 0.02; } return; }
    if (!this.cockpit) return;
    if (pl.removed) { if (this.rig.parent !== this.local) { this.rig.getWorldPosition(_v); this.local.add(this.rig); this.rig.position.copy(_v); this.rig.position.y += 30; } if (!xr) this.rig.lookAt(pl.fm.pos); return; }
    if (this.view === 'cockpit') { if (this.rig.parent !== pl.group) this.setView('cockpit', true);
      if (!xr) { cam.rotation.set(inp.mouse.ly, inp.mouse.lx, 0); if (!inp.mouse.look) { inp.mouse.lx *= Math.exp(-dt * 6); inp.mouse.ly *= Math.exp(-dt * 6); }
        const g = clamp(pl.fm.gLoad - 1, -3, 7); cam.position.y += (-g * 0.008 - cam.position.y) * Math.min(1, dt * 5); const sh = pl.fm.stallShake * 0.004 + (pl.firing && pl.ammo > 0 ? 0.0015 : 0); cam.position.x = (Math.random() - 0.5) * sh; cam.position.z = (Math.random() - 0.5) * sh; } }
    else { const d = Math.max(pl.len, pl.span) * 1.15 + 5; _v.copy(pl.fwd); if (xr) { let yaw = Math.atan2(-_v.x, -_v.z); if (this.opts.comfort >= 1) { const S = Math.PI / 6; let d = yaw - (this.snapYaw ?? yaw); d = Math.atan2(Math.sin(d), Math.cos(d)); if (this.snapYaw == null || Math.abs(d) > S * 0.75) this.snapYaw = Math.round(yaw / S) * S; yaw = this.snapYaw; } _v.set(-Math.sin(yaw), 0, -Math.cos(yaw)); }
      if (!xr) { _v.applyAxisAngle(_v3.set(0, 1, 0), inp.mouse.lx * 2.2); if (!inp.mouse.look) { inp.mouse.lx *= Math.exp(-dt * 4); inp.mouse.ly *= Math.exp(-dt * 4); } }
      _v2.copy(pl.fm.pos).addScaledVector(_v, -d).addScaledVector(xr ? _v3.set(0, 1, 0) : pl.up, d * 0.22); if (!xr) _v2.y += -inp.mouse.ly * d * 0.9; _v2.y = Math.max(_v2.y, this.world.ground(_v2.x, _v2.z) + 2.5);
      if (xr && this.opts.comfort >= 1 && this.snapYaw !== this._snapped) { this._snapped = this.snapYaw; this.rig.position.copy(_v2); } this.rig.position.addScaledVector(pl.fm.vel, dt).lerp(_v2, 1 - Math.exp(-dt * 7)); this.rig.position.y = Math.max(this.rig.position.y, this.world.ground(this.rig.position.x, this.rig.position.z) + 1.5);
      if (xr) { this.rig.rotation.set(0, Math.atan2(-_v.x, -_v.z), 0); } else { _m.lookAt(this.rig.position, _v2.copy(pl.fm.pos).addScaledVector(pl.fwd, Math.abs(inp.mouse.lx) > 0.05 ? 0 : 30), _v3.copy(pl.up).lerp(new THREE.Vector3(0, 1, 0), 0.5).normalize()); _q.setFromRotationMatrix(_m); this.rig.quaternion.slerp(_q, 1 - Math.exp(-dt * 8)); cam.rotation.set(0, 0, 0); cam.position.set(0, 0, 0); } }
  }
  updateMarkers() { let n = 0; const pl = this.player; if (pl && this.opts.markers && this.state === 'fly') for (const a of this.aircraft) { if (a === pl || a.removed || !a.alive || n >= this.markers.length) continue; const d = a.fm.pos.distanceTo(this.camPos); if (d > 16000 || d < 40) continue; const s = this.markers[n++]; s.visible = true; s.position.copy(a.fm.pos); s.material.color.setHex(a.team === pl.team ? 0x4fc3ff : 0xff4a3a); s.material.opacity = clamp(1.4 - d / 14000, 0.35, 0.95); }
    for (; n < this.markers.length; n++) this.markers[n].visible = false; }
  updateOverlay(dt, xr) {
    const pl = this.player; for (const m of this.msgs) m.t -= dt; if (this.msgs.some(m => m.t <= 0)) { this.msgs = this.msgs.filter(m => m.t > 0); this.panelDirty = true; }
    this._ov = (this._ov || 0) + dt; const chase = this.view === 'chase' || (pl && pl.spec.kit === 'ww1' && false);
    if (xr) { if (this.panelDirty || this._ov > 0.2) { this._ov = 0; this.panelDirty = false; const g = this.panel.g; g.clearRect(0, 0, 1024, 256); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 44px system-ui, sans-serif'; g.shadowColor = '#000'; g.shadowBlur = 8; this.msgs.forEach((m, i) => { g.fillStyle = `rgba(255,255,255,${clamp(m.t, 0, 1)})`; g.fillText(m.text, 512, 50 + i * 56); });
        if (pl && chase && this.state === 'fly') { g.font = 'bold 34px ui-monospace, monospace'; g.fillStyle = '#9dffb0'; g.fillText(`${(pl.fm.ias * MS2KT).toFixed(0)} KT   ${(pl.fm.alt * M2FT).toFixed(0)} FT   THR ${(pl.fm.ctl.throttle * 100).toFixed(0)}%   ${pl.weapon === 'gun' ? 'GUN ' + pl.ammo : 'RKT ' + pl.rockets}`, 512, 226); } this.panel.t.needsUpdate = true; } this.panelMesh.visible = true; }
    else { this.panelMesh.visible = false; if (this._ov > 0.1) { this._ov = 0; $('osd').textContent = this.state === 'fly' || this.state === 'loading' ? this.msgs.map(m => m.text).join('\n') : '';
        $('bar').textContent = pl && this.state === 'fly' ? `${(pl.fm.ias * MS2KT).toFixed(0).padStart(4)} kt  ${(pl.fm.alt * M2FT).toFixed(0).padStart(6)} ft  M${pl.fm.mach.toFixed(2)}  ${pl.fm.gLoad.toFixed(1).padStart(4)} g\nTHR ${(pl.fm.ctl.throttle * 100).toFixed(0).padStart(3)}%${pl.fm.ab > 0.5 ? ' A/B' : ''}  ${pl.weapon === 'gun' ? 'GUN ' + pl.ammo : 'RKT ' + pl.rockets}  HP ${Math.max(0, pl.hp / pl.hpMax * 100).toFixed(0)}%\nScore ${this.score}  Kills ${this.kills}  Wave ${this.wave}  ${this.fps.toFixed(0)} fps   [H] help` : ''; } }
    // g-induced tunnel vision / red-out
    if (pl && this.state === 'fly' && pl.alive) { const g = pl.gForceAvg; const tgt = g > 5.5 ? (g - 5.5) / 3.5 : g < -2 ? (-g - 2) / 2 : 0; this.gEff += (clamp(tgt, 0, 1) - this.gEff) * Math.min(1, dt * (tgt > this.gEff ? 0.7 : 1.5)); const w = pl.fm.omega, turn = xr && this.opts.comfort >= 1 ? clamp((Math.hypot(w.x, w.y, w.z) - 0.3) / 1.3, 0, 1) * (this.opts.comfort >= 2 ? 0.62 : 0.5) : 0; this.cEff = (this.cEff || 0) + (turn - (this.cEff || 0)) * Math.min(1, dt * (turn > (this.cEff || 0) ? 6 : 2)); const va = Math.max(this.gEff, this.cEff);
      this.vignette.material.uniforms.uA.value = va; this.vignette.material.uniforms.uC.value.setRGB(g < 0 && this.gEff > this.cEff ? 0.5 : 0, 0, 0); this.vignette.visible = va > 0.02; } else this.vignette.visible = false;
  }

  render(xr) {
    const R = this.renderer, cam = this.camera; const cams = xr ? R.xr.getCamera().cameras : [cam];
    R.clear(); for (const c of cams) setNearFar(c, NEAR_W, FAR_W); if (!xr) setNearFar(cam, NEAR_W, FAR_W);
    R.shadowMap.autoUpdate = false; R.render(this.scene, cam);
    R.clearDepth(); for (const c of cams) setNearFar(c, NEAR_L, FAR_L); R.shadowMap.needsUpdate = true; R.render(this.local, cam);
  }
}

const game = window.game = new Game();
game.init().catch(e => { console.error(e); $('status').textContent = 'Error: ' + e.message; });
