// COLD BORE's rifle: a bolt-action .338 with a 5-25x first-focal-plane scope you really look through, turrets, a bipod, a bolt and magazines worked by hand
import * as THREE from 'three';

import { AMMO, ZERO_ANGLE, card } from './ballistics.js';
import { A } from './assets.js';

export const BORE_Y = 0.102, SCOPE_Y = BORE_Y + AMMO.sightH, MUZZLE = new THREE.Vector3(0, BORE_Y, -0.89), LENS_Z = 0.072, RELIEF = 0.09, EYE = new THREE.Vector3(0, SCOPE_Y, LENS_Z + RELIEF);
export const KNOB = new THREE.Vector3(0.05, 0.088, -0.1), MAGWELL = new THREE.Vector3(0, 0.02, -0.19), FORE = new THREE.Vector3(0, 0.06, -0.33), FOOT = new THREE.Vector3(0, -0.145, -0.415), TRAVEL = 0.09, MAG = 5;
const T_APP = Math.tan(14 * Math.PI / 180), LENS_R = RELIEF * T_APP, RANGES = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];

const LENS_V = 'varying vec3 vL; varying vec3 vE; void main(){ vL = position; vE = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }';
const LENS_F = `uniform sampler2D map, hud; uniform float zoom, T, relief, on, time, mirage; varying vec3 vL; varying vec3 vE;
float ln(float d, float w){ float a = fwidth(d) + 1e-5; return 1. - smoothstep(w - a, w + a, abs(d)); }
void main(){
  vec3 d = normalize(vL - vE); vec2 a = d.xy / max(1e-4, -d.z), q = a / T; float r = length(q);
  vec2 mq = q + vec2(sin(q.y * 70. + time * 6.) + sin(q.y * 31. - time * 4.3), sin(q.x * 50. + time * 5.) * .5) * .00022 * mirage * zoom * smoothstep(.2, -.6, q.y);
  vec3 col = texture2D(map, clamp(mq * .5 + .5, 0., 1.)).rgb * on + vec3(.004, .005, .006);
  vec2 m = a / zoom * 1000.; float wm = .0035 * T / zoom * 1000., ret = 0.;
  ret = max(ret, ln(m.y, wm) * step(.18, abs(m.x))); ret = max(ret, ln(m.x, wm) * step(.18, abs(m.y)));
  ret = max(ret, 1. - smoothstep(wm * 1.3, wm * 1.9, length(m)));
  float nx = floor(m.x + .5), ny = floor(m.y + .5);
  ret = max(ret, ln(m.x - nx, wm) * step(.5, abs(nx)) * step(abs(nx), 12.5) * step(abs(m.y), mod(nx, 5.) == 0. ? .5 : .25));
  ret = max(ret, ln(m.y - ny, wm) * step(.5, abs(ny)) * step(-20.5, ny) * step(ny, 6.5) * step(abs(m.x), mod(ny, 5.) == 0. ? .5 : .25));
  ret = max(ret, ln(m.x - (floor(m.x) + .5), wm) * step(abs(m.x), 10.) * step(abs(m.y), .1));
  ret = max(ret, ln(m.y - (floor(m.y) + .5), wm) * step(abs(m.y), 10.) * step(abs(m.x), .1));
  ret = max(ret, ln(q.y, .011) * step(.7, abs(q.x))); ret = max(ret, ln(q.x, .011) * step(.7, -q.y));
  col = mix(col, vec3(.012), ret * .96);
  vec2 hu = (q - vec2(-.44, .58)) / vec2(.88, .22); if (hu.x > 0. && hu.x < 1. && hu.y > 0. && hu.y < 1.) col += texture2D(hud, hu).rgb * .85;
  col *= smoothstep(1., .975, r);
  vec2 c = vE.xy / .012; float rho = 1.3 - max(0., abs(vE.z - relief) - .03) * 9.; col *= 1. - smoothstep(rho - .25, rho, length(q - c));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _e = new THREE.Euler();

export class Rifle {
  constructor(game) {
    this.gm = game; const g = this.g = new THREE.Group(); game.rig.add(g);
    // the rifle: Dennis Haupt's KSR-29 (CC0), turned to point down -Z with its grip in the hand; its scope, bipod and magazine are its own
    const body = A.m.ksr29.clone(true), S = 0.125; body.rotation.y = Math.PI / 2; body.scale.setScalar(S); body.position.set(0, 0.044, -0.275); g.add(body); this.body = body; body.updateMatrixWorld(true);
    body.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; o.material.envMapIntensity = 1.2; } });
    const mm = body.getObjectByName('mag'), mg = mm.geometry.clone().applyMatrix4(mm.matrixWorld); mg.computeBoundingBox(); const mc = mg.boundingBox.getCenter(new THREE.Vector3()); mg.translate(-mc.x, -mc.y, -mc.z); mm.visible = false;
    this.mag = new THREE.Group(); this.mag.position.copy(mc); MAGWELL.copy(mc); g.add(this.mag); this.magGeo = new THREE.Mesh(mg, mm.material); this.mag.add(this.magGeo);
    // the bolt handle on the right of the receiver
    const metal = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.35, metalness: 0.9 }); this.handle = new THREE.Group(); this.handle.position.set(0.02, BORE_Y, KNOB.z); g.add(this.handle);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 0.04, 8), metal); stem.rotation.z = Math.PI / 2 - 0.5; stem.position.set(0.017, -0.009, 0); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 12, 8), metal); knob.position.set(KNOB.x - 0.02, KNOB.y - BORE_Y, 0); this.handle.add(stem, knob);
    // glass: the rendered picture seen down the tube, and the objective's front
    this.zoom = 10; this.elev = 0; this.windage = 0; this.lased = 0;
    this.rt = new THREE.WebGLRenderTarget(game.q.scope, game.q.scope, { samples: game.q.tier ? 4 : 0, depthBuffer: true }); this.rt.texture.colorSpace = THREE.SRGBColorSpace;
    this.cam = new THREE.PerspectiveCamera(2, 1, 1.5, 9000); this.cam.position.set(0, SCOPE_Y, -0.33); g.add(this.cam);
    this.hudC = document.createElement('canvas'); this.hudC.width = 512; this.hudC.height = 128; this.hudT = new THREE.CanvasTexture(this.hudC); this.hudT.colorSpace = THREE.SRGBColorSpace;
    this.lensMat = new THREE.ShaderMaterial({ vertexShader: LENS_V, fragmentShader: LENS_F, fog: false, uniforms: { map: { value: this.rt.texture }, hud: { value: this.hudT }, zoom: { value: 10 }, T: { value: T_APP }, relief: { value: RELIEF }, on: { value: 0 }, time: { value: 0 }, mirage: { value: 1 } } });
    this.lens = new THREE.Mesh(new THREE.CircleGeometry(LENS_R + 0.002, 40), this.lensMat); this.lens.position.set(0, SCOPE_Y, LENS_Z); g.add(this.lens);
    const front = new THREE.Mesh(new THREE.CircleGeometry(0.029, 24), new THREE.MeshStandardMaterial({ color: 0x1a1030, roughness: 0.05, metalness: 0.9 })); front.position.set(0, SCOPE_Y, -0.317); front.rotation.y = Math.PI; g.add(front);
    // the card and the wind meter beside the scope
    this.cardC = document.createElement('canvas'); this.cardC.width = 384; this.cardC.height = 512; this.cardT = new THREE.CanvasTexture(this.cardC); this.cardT.colorSpace = THREE.SRGBColorSpace; this.cardT.anisotropy = 8;
    this.cardM = new THREE.Mesh(new THREE.PlaneGeometry(0.093, 0.124), new THREE.MeshBasicMaterial({ map: this.cardT, toneMapped: false })); this.cardM.position.set(-0.085, SCOPE_Y + 0.01, -0.1); this.cardM.rotation.set(-0.1, 0.5, 0); g.add(this.cardM);
    this.table = card(RANGES); this.flash = new THREE.PointLight(0xffc070, 0, 14); this.flash.position.copy(MUZZLE); g.add(this.flash);
    this.reset(); this.drawHud(); this.drawCard(0, 12);
  }
  reset() {
    this.rounds = MAG - 1; this.magIn = true; this.chambered = true; this.spent = false; this.b = 0; this.wasOpen = false; this.boltAnim = -1; this.reload = -1; this.kick = 0; this.kickYaw = 0; this.breath = 0; this.held = 0; this.swayT = 0;
    this.main = -1; this.off = -1; this.boltHand = -1; this.planted = true; this.ads = 0; this.mode = 'rest'; this.mag.visible = true; this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.first = true; this.lased = 0;
  }
  ready() { return this.b === 0 && this.chambered && !this.spent && this.boltAnim < 0; }
  dial(de, dw) { const e = Math.min(25, Math.max(0, Math.round((this.elev + de) * 10) / 10)), w = Math.min(8, Math.max(-8, Math.round((this.windage + dw) * 10) / 10)); if (e !== this.elev || w !== this.windage) { this.elev = e; this.windage = w; this.gm.audio.play('click'); this.drawHud(); } }
  setZoom(z) { z = Math.min(25, Math.max(5, z)); if (Math.abs(z - this.zoom) > 0.001) { if (Math.floor(z) !== Math.floor(this.zoom)) this.gm.audio.play('zoom'); this.zoom = z; this.drawHud(); } }
  drawHud() { const g = this.hudC.getContext('2d'); g.clearRect(0, 0, 512, 128); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 128); g.font = '700 44px ui-monospace, Menlo, Consolas, monospace'; g.textBaseline = 'middle'; g.fillStyle = '#ff5a30';
    g.textAlign = 'left'; g.fillText(this.lased ? this.lased.toFixed(0) + 'm' : '---m', 16, 40); g.textAlign = 'right'; g.fillText(this.zoom.toFixed(0) + 'x', 496, 40);
    g.textAlign = 'left'; g.fillStyle = '#ffb040'; g.fillText('EL ' + this.elev.toFixed(1), 16, 96); g.textAlign = 'right'; g.fillText((this.windage === 0 ? 'W ' : this.windage > 0 ? 'R ' : 'L ') + Math.abs(this.windage).toFixed(1), 496, 96);
    if (!this.gm.live) { g.textAlign = 'center'; g.fillStyle = '#40c8ff'; g.fillText('SAFE', 256, 40); } this.hudT.needsUpdate = true; }
  drawCard(speed, clock) {
    const g = this.cardC.getContext('2d'), W = 384; g.fillStyle = '#e9e4d2'; g.fillRect(0, 0, W, 512); g.fillStyle = '#1a1c1e'; g.fillRect(0, 0, W, 44); g.fillStyle = '#e9e4d2'; g.font = '700 22px ui-monospace, Menlo, Consolas, monospace'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('.338 LM 250gr  ZERO 100', W / 2, 23);
    g.fillStyle = '#5a564a'; g.font = '700 19px ui-monospace, Menlo, Consolas, monospace'; const X = [70, 160, 258, 346]; ['RANGE', 'UP', 'WIND/1', 'TOF'].forEach((s, i) => { g.textAlign = 'right'; g.fillText(s, X[i], 62); });
    g.font = '700 23px ui-monospace, Menlo, Consolas, monospace'; this.table.forEach((r, i) => { const y = 90 + i * 27; if (i % 2 === 0) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, y - 13, W, 27); } g.fillStyle = '#16181a'; [r.R, r.el.toFixed(1), r.wind.toFixed(2), r.t.toFixed(2)].forEach((s, j) => g.fillText(s, X[j], y)); });
    g.fillStyle = '#1d2b24'; g.fillRect(0, 386, W, 126); g.textAlign = 'left'; g.fillStyle = '#8ff0b0'; g.font = '700 25px ui-monospace, Menlo, Consolas, monospace'; g.fillText('WIND ' + speed.toFixed(1) + ' m/s', 14, 410); g.fillText('FROM ' + clock + " O'CLOCK", 14, 442);
    g.fillStyle = '#ffd070'; const R = this.lased; g.fillText(R ? 'LASED ' + R.toFixed(0) + ' m' : 'LASED ---', 14, 474); g.fillText(R ? 'DIAL UP ' + this.solution(R).toFixed(1) : '', 14, 500); this.cardT.needsUpdate = true;
  }
  solution(R) { const t = this.table; if (R <= 100) return 0; if (R <= t[0].R) return t[0].el * (R - 100) / (t[0].R - 100); for (let i = 1; i < t.length; i++) if (R <= t[i].R) return t[i - 1].el + (t[i].el - t[i - 1].el) * (R - t[i - 1].R) / (t[i].R - t[i - 1].R); return t[t.length - 1].el; }
  windMil(R) { const t = this.table; if (R <= t[0].R) return t[0].wind * R / t[0].R; for (let i = 1; i < t.length; i++) if (R <= t[i].R) return t[i - 1].wind + (t[i].wind - t[i - 1].wind) * (R - t[i - 1].R) / (t[i].R - t[i - 1].R); return t[t.length - 1].wind; }

  // ---------- the bolt and the magazine ----------
  boltTo(b) {
    const A = this.gm.audio, was = this.b; this.b = b;
    if (was < 0.12 && b >= 0.12) A.play('boltUp');
    if (b >= 0.95 && !this.wasOpen) { this.wasOpen = true; A.play('boltBack'); if (this.chambered) { this.gm.fx.brass(this.g.localToWorld(_v.set(0.03, BORE_Y + 0.01, -0.13)), this.g.getWorldQuaternion(_q), this.spent); this.chambered = false; this.spent = false; } }
    if (b <= 0.04 && this.wasOpen) { this.wasOpen = false; this.b = 0; A.play('boltFwd'); A.play('boltDown'); if (this.magIn && this.rounds > 0) { this.rounds--; this.chambered = true; this.spent = false; } }
    else if (b <= 0.04) this.b = 0;
  }
  cycle() { if (this.boltAnim < 0 && this.boltHand < 0) this.boltAnim = 0; }
  dropMag() { if (!this.magIn) return; this.magIn = false; this.mag.visible = false; this.gm.audio.play('magOut'); this.gm.fx.dropMag(this.mag.getWorldPosition(_v), this.g.getWorldQuaternion(_q), this.magGeo); }
  insertMag() { if (this.magIn) return; this.magIn = true; this.rounds = MAG; this.mag.visible = true; this.gm.audio.play('magIn'); }
  startReload() { if (this.reload < 0 && this.boltAnim < 0) { this.reload = 0; this.dropMag(); } }
  parts(dt) {
    if (this.boltAnim >= 0) { this.boltAnim += dt; const t = this.boltAnim; this.boltTo(t < 0.28 ? t / 0.28 : t < 0.4 ? 1 : Math.max(0, 1 - (t - 0.4) / 0.26)); if (t >= 0.66) { this.boltTo(0); this.boltAnim = -1; } }
    if (this.reload >= 0) { this.reload += dt; if (this.reload > 1.25 && !this.magIn) this.insertMag(); if (this.reload > 1.5) { this.reload = -1; if (!this.chambered) this.cycle(); } }
    const lift = Math.min(1, this.b * 7), back = Math.max(0, this.b - 0.14) / 0.86 * TRAVEL; this.handle.rotation.z = lift * 1.1; this.handle.position.z = KNOB.z + back; this.boltBack = back;
    this.kick *= Math.exp(-dt * 6.5); if (this.flash.intensity > 0) this.flash.intensity = Math.max(0, this.flash.intensity - dt * 600);
  }

  fire() {
    const G = this.gm;
    if (!G.live || !this.ready()) { if (this.b === 0) G.audio.play('dry'); return false; }
    this.spent = true; this.g.updateMatrixWorld(true);
    const dir = _v.set(this.windage / 1000, ZERO_ANGLE + this.elev / 1000, -1).normalize().transformDirection(this.g.matrixWorld), from = this.g.localToWorld(_w.copy(MUZZLE));
    G.shoot(from, dir, _x.set(0, 0, -1).transformDirection(this.g.matrixWorld)); G.audio.play('shot'); G.fx.muzzle(from, dir); this.flash.intensity = 60;
    this.kick = 1; this.kickYaw = (Math.random() - 0.5) * 0.6; return true;
  }

  // ---------- where it is: a hand on the grip, a second on the fore-end, the bipod on the rest ----------
  // hands: [{active,pos,quat,grab,grabE,relE,trig,trigE,a,b,x,y,mag}] in the rig's space; rest: {y, x0, x1, z0, z1}
  vr(dt, hands, rest, opt) {
    const A = this.gm.audio, g = this.g; g.updateMatrix(); _m.copy(g.matrix);
    const world = (p) => _v.copy(p).applyMatrix4(_m), near = (h, p, r) => h.pos.distanceTo(world(p)) < r;
    hands.forEach((h, i) => {
      if (!h.active) { if (this.main === i) this.main = -1; if (this.off === i) this.off = -1; if (this.boltHand === i) this.boltHand = -1; return; }
      if (h.grabE) {
        if (this.main < 0 && near(h, _x.set(0, -0.02, 0.01), 0.17)) { this.main = i; this.mode = 'held'; A.play('grab'); h.pulse(0.4, 30); }
        else if (this.main !== i) {
          if (near(h, _x.set(KNOB.x, KNOB.y, KNOB.z + (this.boltBack || 0)), 0.11) && this.boltAnim < 0) { this.boltHand = i; this.boltZ = _w.copy(h.pos).applyMatrix4(_m.clone().invert()).z - this.b * TRAVEL; h.pulse(0.3, 20); }
          else if (!h.mag && h.pos.distanceTo(_w.copy(h.pos).applyMatrix4(_m.clone().invert()).set(0, FORE.y, Math.min(-0.22, Math.max(-0.55, _w.z))).applyMatrix4(_m)) < 0.14) { this.off = i; A.play('grab'); h.pulse(0.3, 20); }
        }
      }
      if (h.relE) { if (this.main === i) { this.main = -1; this.mode = this.planted ? 'rest' : 'home'; } if (this.off === i) this.off = -1; if (this.boltHand === i) { this.boltHand = -1; if (this.b > 0 && this.b < 1) this.boltAnim = this.b > 0.5 && !this.wasOpen ? 0.28 * this.b : 0.4 + (1 - this.b) * 0.26; } }
      if (h.mag && !this.magIn && near(h, MAGWELL, 0.1)) { h.mag = false; this.insertMag(); h.pulse(0.6, 40); }
    });
    if (this.boltHand >= 0) { const h = hands[this.boltHand], z = _w.copy(h.pos).applyMatrix4(_m.clone().invert()).z; this.boltTo(Math.min(1, Math.max(0, (z - this.boltZ) / TRAVEL))); }
    const M = hands[this.main], O = hands[this.off]; let tau = 0.05, sway = 1.6;
    if (M) {
      if (M.trigE) { if (this.fire()) { M.pulse(1, 90); if (O) O.pulse(0.7, 70); } }
      if (M.aE) this.cycle(); if (M.bE) { if (this.magIn) this.dropMag(); else if (opt.assist) this.startReload(); }
      const other = hands[1 - this.main]; this.stick(dt, M, other && other.active ? other : M);
      if (this.planted) { _w.copy(this.F).sub(M.pos); const L = _w.length(), len = FOOT.length(); if (Math.abs(L - len) > 0.16 || Math.abs(_w.y / L + 0.33) > 0.55) { this.planted = false; A.play('bipod'); } }
      if (this.planted) { this.aimFoot(M.pos); tau = 0.17; sway = 0.22; }
      else {
        if (O) { _z.copy(M.pos).sub(O.pos).normalize(); _y.set(0, 1, 0).applyQuaternion(M.quat); _x.crossVectors(_y, _z).normalize(); _y.crossVectors(_z, _x); _m.makeBasis(_x, _y, _z); this.tq = (this.tq || new THREE.Quaternion()).setFromRotationMatrix(_m); this.tq.multiply(_q.setFromAxisAngle(_x.set(1, 0, 0), -Math.atan2(FORE.y, -FORE.z))); tau = 0.09; sway = 0.9; }
        else { this.tq = (this.tq || new THREE.Quaternion()).copy(M.quat).multiply(_q.setFromAxisAngle(_x.set(1, 0, 0), (opt.tilt || 0) * Math.PI / 180)); }
        this.tp = (this.tp || new THREE.Vector3()).copy(M.pos);
        const f = _v.copy(FOOT).applyQuaternion(this.tq).add(this.tp);
        if (rest && f.x > rest.x0 && f.x < rest.x1 && f.z > rest.z0 && f.z < rest.z1 && f.y < rest.y + 0.035 && f.y > rest.y - 0.07 && _w.set(0, 0, -1).applyQuaternion(this.tq).y > -0.5) { this.planted = true; this.F = (this.F || new THREE.Vector3()).set(f.x, rest.y, f.z); A.play('bipod'); M.pulse(0.5, 40); this.aimFoot(M.pos); }
      }
    } else if (this.mode === 'home' && rest) { this.home(rest); this.mode = 'rest'; }
    const hold = (M && O && O.trig > 0.5) || (M && !O && hands[1 - this.main] && hands[1 - this.main].active && hands[1 - this.main].trig > 0.5 && this.boltHand < 0);
    this.settle(dt, tau, sway, hold, !!M);
  }
  stick(dt, M, O) {
    if (Math.abs(O.y) > 0.5 && O !== M) this.setZoom(this.zoom * Math.exp(-O.y * dt * 1.4));
    const sx = Math.abs(M.x) > 0.6 ? Math.sign(M.x) : 0, sy = Math.abs(M.y) > 0.6 ? -Math.sign(M.y) : 0; this.rep = (this.rep || 0) - dt;
    if (!sx && !sy) { this.rep = 0; this.repN = 0; } else if (this.rep <= 0) { if (sy) this.dial(sy * 0.1, 0); else this.dial(0, sx * 0.1); this.repN = (this.repN || 0) + 1; this.rep = this.repN < 3 ? 0.22 : 0.06; }
    if (O !== M && O.aE) this.gm.lase();
  }
  // bipod feet fixed at F, the grip at the hand: the bore follows from the two
  aimFoot(H) {
    const v = _w.copy(this.F).sub(H).normalize(), al = Math.atan2(-FOOT.y, -FOOT.z); _x.crossVectors(v, _y.set(0, 1, 0)).normalize(); _z.copy(v).applyAxisAngle(_x, al).negate(); _y.crossVectors(_z, _x);
    this.tq = (this.tq || new THREE.Quaternion()).setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); this.tp = (this.tp || new THREE.Vector3()).copy(this.F).sub(_v.copy(FOOT).applyQuaternion(this.tq));
  }
  home(rest) { this.planted = true; this.F = (this.F || new THREE.Vector3()).set((rest.x0 + rest.x1) / 2, rest.y, (rest.z0 + rest.z1) / 2 - 0.02); this.aimFoot(_v.set(this.F.x, rest.y - FOOT.y - 0.015, this.F.z - FOOT.z)); this.first = true; this.main = this.off = this.boltHand = -1; }
  settle(dt, tau, sway, hold, held) {
    if (!this.tq) return;
    if (this.first) { this.pos.copy(this.tp); this.quat.copy(this.tq); this.first = false; }
    if (hold && this.breath < 9) { this.breath += dt; if (this.held === 0) this.held = 1; } else { this.breath = Math.max(0, this.breath - dt * 1.6); if (!hold) this.held = 0; }
    const calm = hold && this.breath < 9 ? (this.breath < 6.5 ? 0.22 : 0.22 + (this.breath - 6.5) * 0.5) : 1 + Math.min(1.2, this.breath * 0.12); this.calm = calm; this.holding = hold && this.breath < 9;
    if (held) { const ang = this.quat.angleTo(this.tq), t = tau * (this.holding ? 1.8 : 1) / (1 + Math.min(8, ang * 30)), k = 1 - Math.exp(-dt / t); this.quat.slerp(this.tq, k); this.pos.lerp(this.tp, 1 - Math.exp(-dt / (tau * 0.5))); }
    else { this.quat.copy(this.tq); this.pos.copy(this.tp); sway = 0; }
    this.swayT += dt; const s = sway * calm * 0.001, t = this.swayT, sx = (Math.sin(t * 1.13 + 1) * 0.6 + Math.sin(t * 2.9) * 0.25 + Math.sin(t * 7.1) * 0.1) * s, sy = (Math.sin(t * 1.9) * 0.8 + Math.sin(t * 4.3 + 2) * 0.2 + Math.sin(t * 9.3) * 0.08) * s;
    const kp = this.kick * (this.planted ? 0.011 : this.off >= 0 ? 0.028 : 0.07);
    this.g.quaternion.copy(this.quat).multiply(_q.setFromEuler(_e.set(sy + kp, sx + kp * this.kickYaw, 0, 'YXZ'))); this.g.position.copy(this.pos).add(_v.set(0, 0, this.kick * 0.022).applyQuaternion(this.quat));
  }
  // on a screen: the rifle follows the view, shouldered when you aim
  desk(dt, cam, aim, I) {
    this.ads += ((I.ads ? 1 : 0) - this.ads) * Math.min(1, dt * 9); const a = this.ads * this.ads * (3 - 2 * this.ads);
    if (I.fire) this.fire(); if (I.reload) this.startReload(); if (I.bolt) this.cycle(); if (I.lase) this.gm.lase();
    if (I.dialY) this.dial(I.dialY * 0.1, 0); if (I.dialX) this.dial(0, I.dialX * 0.1); if (I.zoom) this.setZoom(this.zoom * Math.exp(I.zoom * 0.12));
    if (this.spent && this.b === 0 && this.boltAnim < 0 && this.kick < 0.25) this.cycle();
    this.tq = (this.tq || new THREE.Quaternion()).setFromEuler(_e.set(aim.pitch, aim.yaw, 0, 'YXZ')); this.planted = true;
    _w.set(0.17, -0.2, -0.48).lerp(_x.copy(EYE).negate(), a); this.tp = (this.tp || new THREE.Vector3()).copy(cam.position).add(_w.applyQuaternion(this.tq));
    this.first = true; this.settle(dt, 0.001, this.gm.steady ? 0 : 0.2 + 0.25 * a, I.hold, true);
  }
  // draw the far end of the scope into its picture, only when an eye is behind it
  scope(renderer, scene, eyes) {
    this.g.updateMatrixWorld(true); const inv = _m.copy(this.g.matrixWorld).invert(); let best = 9;
    for (const e of eyes) { _v.copy(e).applyMatrix4(inv); const lat = Math.hypot(_v.x - EYE.x, _v.y - EYE.y), dz = _v.z - LENS_Z; if (dz > 0.01 && dz < 0.5 && lat < 0.05 + dz * 0.5) best = Math.min(best, lat); }
    const on = best < 9; this.lensMat.uniforms.on.value = on ? 1 : 0; this.scoped = on; if (!on) return;
    this.lensMat.uniforms.zoom.value = this.zoom; this.cam.fov = 2 * Math.atan(T_APP / this.zoom) * 180 / Math.PI; this.cam.updateProjectionMatrix();
    const xr = renderer.xr.enabled, tgt = renderer.getRenderTarget(); renderer.xr.enabled = false; this.lens.visible = false; this.lensMat.uniforms.time.value = this.gm.time; this.lensMat.uniforms.mirage.value = this.gm.world.env.rain ? 0.2 : 1;
    renderer.setRenderTarget(this.rt); renderer.clear(); renderer.render(scene, this.cam); renderer.setRenderTarget(tgt); renderer.xr.enabled = xr; this.lens.visible = true;
  }
}
