// Boot, main loop, menus, XR session, pause.
'use strict';
(function () {
const { V3, $ } = MC, W = MC.world, PL = MC.player, G = MC.game, C = MC.cook, P = MC.phys, E = MC.events, U = MC.ui;
// Rapier loads its WebAssembly first; the kitchen is built once it is ready
MC.ready = P.ready.then(() => { W.build(0, 7); PL.init(); C.reset(); PL.reset(); MC.booted = true; MC.emit('booted'); });
let dripT = 2, tickT = 1, menuT = 0;
MC.paused = false;
MC.tick = function (dt) {
  if (!MC.booted) return;
  if (G.mode === 'menu') { // slow establishing shot behind the menu
    menuT += dt; const a = Math.sin(menuT * 0.07) * 0.5; MC.rig.position.set(1 + Math.sin(menuT * 0.05) * 5, 0.6, 5.2); MC.rig.rotation.y = a * 0.5; MC.camera.position.set(0, 1.4, 0); MC.camera.rotation.set(0.16, 0, 0);
    PL.head.copy(MC.toWorld(MC.camera.position)); for (const h of PL.hands) { h.paw.g.visible = h.paw.arm.visible = false; }
    P.step(dt); C.update(dt);
  } else {
    PL.update(dt); P.step(dt); C.update(dt); G.update(dt); E.update(dt); if (G.mode === 'play') MC.tutorTick(dt);
    const sk = E.shake * (MC.opt.shake == null ? 1 : MC.opt.shake); if (!MC.isXR() && sk > 0.001) { MC.camera.position.x += (Math.random() - 0.5) * sk; MC.camera.position.y += (Math.random() - 0.5) * sk; }
  }
  W.update(dt, PL.head); U.update(dt);
  if (W.st.pub) { const inPub = PL.head.z < -8; MC.audio.setLoop('murmur', G.mode === 'menu' ? 0 : inPub ? 0.05 : 0.012, 0.6); if (MC.audio.ctx && !MC.murmurAt) { MC.murmurAt = 1; MC.audio.loopPos('murmur', new V3(-14, 2, -17)); } }
  MC.audio.update(dt, (E.active || E.bg) && (E.active || E.bg).type, { sizzle: C.sizzle || 0, boil: C.boil || 0, panPos: W.st.pan && W.st.pan.pos, potPos: W.st.pot && W.st.pot.pos, busy: G.orders.filter(o => o.state === 'wait').length }); MC.audio.listener(PL.head, PL.fwdFull);
  if (W.st.tap && G.mode !== 'menu') { dripT -= dt; if (dripT <= 0) { dripT = 4 + Math.random() * 7; W.drip(); if (Math.random() < 0.2) setTimeout(() => W.drip(), 260); } }
  tickT -= dt; if (tickT <= 0) { tickT = 1; if (!W.clockDead && W.st.clock) MC.sfx.clock(W.st.clock); }
  // the room changes when the big light is on: drier reverb, ambience pulled down, the bulb buzzes
  const lit = W.lit > 0.5; if (lit !== MC.wasLit) { MC.wasLit = lit; MC.audio.setWet(lit ? 0.4 : 0.55); MC.audio.setAmbBase(lit ? 0.5 : 1); MC.audio.setLoop('bulb', lit ? 0.012 : 0, 0.1); }
  // pre-dawn: birds at the window, the fridge settles
  if (G.mode === 'play' && MC.clock.phase === 'predawn' && G.t < 45) { MC.birdT = (MC.birdT || 0) - dt; if (MC.birdT <= 0) { MC.birdT = 1.5 + Math.random() * 4 * (G.t / 45 + 0.2); MC.sfx.bird(new V3(2 + Math.random() * 6, 11, -9)); } }
  MC.audio.setLoop('hum', G.mode === 'play' && G.cfg && !G.cfg.long && G.t < 60 ? 0.08 * Math.max(0.35, G.t / 60) : (W.power === 0 ? 0 : 0.08), 1);
};
MC.advance = function (sec, step = 1 / 60) { const n = Math.round(sec / step); for (let i = 0; i < n; i++) MC.tick(step); };
const clock = new THREE.Clock();
let xPrev = false;
function vrPauseButton() {   // left controller X toggles pause in VR
  const s = MC.renderer.xr.getSession && MC.renderer.xr.getSession(); if (!s) return; let x = false; for (const src of s.inputSources) if (src.handedness === 'left' && src.gamepad && src.gamepad.buttons[4]) x = src.gamepad.buttons[4].pressed;
  if (x && !xPrev && G.mode === 'play') MC.paused = !MC.paused; xPrev = x; if (MC.paused) PL.wristNote('Paused. Press X to resume.');
}
MC.renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), 0.05); if (MC.isXR()) vrPauseButton(); if (!MC.paused && !MC.manual) MC.tick(dt); if (MC.draw) MC.draw(); else MC.renderer.render(MC.scene, MC.camera); });

// ---------- flow ----------
MC.startNight = function (cfg) {
  if (!MC.booted) { MC.ready.then(() => MC.startNight(cfg)); return; }
  MC.audio.init(); MC.lastCfg = cfg; G.start(cfg); MC.paused = false;
  U.show('menu', false); U.show('end', false); U.show('pause', false);
  if (!MC.isXR()) PL.lockMouse();
};
MC.toMenu = function () { G.mode = 'menu'; E.reset(); for (const o of G.orders) W.group.remove(o.bug.root); G.orders = []; for (const s of W.seats) s.order = null; C.reset(); PL.reset(); MC.paused = false; U.show('end', false); U.show('pause', false); U.show('menu', true); if (document.exitPointerLock) document.exitPointerLock(); MC.emit('menu'); };
MC.on('night:end', r => {
  if (MC.isXR()) return;
  if (document.exitPointerLock) document.exitPointerLock();
  setTimeout(() => { if (G.mode !== 'dawn') return; $('e-stars').innerHTML = [0, 1, 2].map(i => '<i class="' + (i < r.stars ? 'on' : '') + '"></i>').join(''); $('e-title').textContent = G.cfg.long ? 'Long Night over: ' + r.served + ' served' : r.stars ? 'Dawn. Closing time.' : 'Dawn. A rough night.'; if (G.cfg.long) $('e-stars').innerHTML = '';
    const why = [];
    if (!G.cfg.long) { if (r.served < r.need) why.push('★ needs ' + r.need + ' served (you served ' + r.served + ').'); else if (r.tips < r.target) why.push('★★ needs ' + MC.money(r.target) + ' in tips. Serve faster: patience left = bigger tips.'); else if (r.vip === false) why.push('★★★ needs the VIP dish served.'); else if (r.vip == null && r.lost) why.push('★★★ needs nobody walking out.');
      if (r.lost) why.push(r.lost + ' customer' + (r.lost > 1 ? 's' : '') + ' walked out. Keep an eye on the patience bars.'); if (r.caught) why.push('Caught ' + r.caught + '×. When anything is watching, stand still.'); }
    $('e-sum').innerHTML = (MC.endSummary ? MC.endSummary(r) : (G.cfg.long ? 'Tips <b>' + MC.money(r.tips) + '</b> · best in ' + MC.HOMES[G.cfg.home].name + ': ' + ((typeof MC.save.longBest === 'object' ? MC.save.longBest[G.cfg.home] : MC.save.longBest) || 0) + ' served' : 'Served <b>' + r.served + '</b> of ' + r.total + ' (needed ' + r.need + ') · Tips <b>' + MC.money(r.tips) + '</b> (target ' + MC.money(r.target) + ')' + (r.vip == null ? '' : ' · VIP ' + (r.vip ? 'served' : 'missed'))) + '<br><small>Wallet: ' + MC.money(MC.save.tips) + '</small>') + (why.length ? '<div class="why">' + why.join('<br>') + '</div>' : '');
    $('e-extra').innerHTML = (r.news || []).map(n => '★ ' + n).join('<br>'); const nx = MC.nextCfg && MC.nextCfg() !== MC.lastCfg; $('b-next').hidden = !nx; $('b-again').className = nx ? 'alt' : '';
    U.show('end', true); }, 4000);   // let the sunrise and the dawn cadence play before the receipt
});
// the dawn chorus starts with the pre-dawn phase
MC.on('phase', p => { if (p === 'predawn' && G.mode === 'play') MC.say('The sky is greying. Not long till the humans wake.', 4); });
MC.on('vr:continue', () => { if (G.result && G.mode === 'dawn') MC.startNight(MC.nextCfg ? MC.nextCfg() : MC.lastCfg); });
MC.on('lock', on => { if (!on && G.mode === 'play' && !PL.noLock && !MC.isXR()) { MC.paused = true; U.show('pause', true); setTimeout(() => $('b-resume').focus(), 0); } });
MC.resume = () => { MC.paused = false; U.show('pause', false); PL.lockMouse(); };
MC.on('key', code => { if (code === 'KeyR' && G.mode === 'dawn' && MC.lastCfg) MC.startNight(MC.lastCfg); if (code === MC.opt.keys.pause && G.mode === 'play' && PL.noLock) { MC.paused = !MC.paused; U.show('pause', MC.paused); } });
$('b-resume').onclick = () => MC.resume();
$('b-quit').onclick = () => MC.toMenu();
$('b-again').onclick = () => MC.startNight(MC.lastCfg);
$('b-next').onclick = () => MC.startNight(MC.nextCfg());
$('b-menu').onclick = () => MC.toMenu();
if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then(ok => {
  if (!ok) return; setTimeout(() => MC.menuRender && MC.menuRender(), 0);
  MC.enterVR = cfg => navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }).then(s => {
    MC.renderer.xr.setFramebufferScaleFactor(0.6); MC.renderer.xr.setFoveation(1); MC.renderer.xr.setSession(s); MC.startNight(cfg); MC.xrPerf(); MC.rig.scale.setScalar(1);
    // height calibration: a standing player should see the counter from mouse height, not 1.6 m up
    setTimeout(() => { if (!MC.isXR() || !MC.opt.vrHeight) return; const xc = MC.renderer.xr.getCamera(MC.camera); xc.updateMatrixWorld(true); const hh = (xc.matrixWorld.elements[13] - MC.rig.position.y) / MC.rig.scale.x; if (hh > 0.3) MC.rig.scale.setScalar(MC.clamp(PL.EYE / hh, 0.55, 1.4)); }, 1200); s.addEventListener('visibilitychange', () => { if (s.visibilityState !== 'visible' && G.mode === 'play') MC.paused = true; }); s.addEventListener('end', () => { MC.furLOD(false); MC.rig.scale.setScalar(1); MC.camera.position.set(0, PL.EYE, 0); MC.resize(); if (G.mode !== 'menu') MC.toMenu(); });
  });
}).catch(() => {});
// headsets get a lighter shadow setup: one 2048 moon map, no point-light shadow
// fur level of detail: in a headset every other shell is dropped (the alpha ramp keeps the look, half the overdraw)
MC.furLOD = function (xr) { MC.scene.traverse(o => { if (o.userData.furLayer) o.visible = !xr || o.userData.furLayer % 2 === 0; }); };
MC.xrPerf = function () { if (!MC.isXR() && !MC.renderer.xr.getSession()) return; MC.furLOD(true); const c = W.candle && W.candle.light; if (c) c.castShadow = false; if (W.roomSpot) W.roomSpot.castShadow = false; if (W.nightLight) W.nightLight.castShadow = false; for (const L of [W.moon, W.ceil]) if (L && L.shadow && L.shadow.mapSize.x > 2048) { L.shadow.mapSize.set(2048, 2048); if (L.shadow.map) { L.shadow.map.dispose(); L.shadow.map = null; } } };
MC.on('world:built', () => { if (MC.renderer.xr.getSession && MC.renderer.xr.getSession()) MC.xrPerf(); });
// customers and the cat are built after the world: in a headset, thin their fur too
MC.on('furAdded', () => { if (MC.isXR()) MC.furLOD(true); });
window.__mc = MC;
})();
