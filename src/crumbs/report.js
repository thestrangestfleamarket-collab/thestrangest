// A picture of what you see, sent to the makers: hold both triggers for three seconds in a headset (with nothing gripped), or press
'use strict';
// F8 on a screen. The picture and the game's state go to the website's report queue (POST /crumbs/report, a login's).
(function () {
const G = MC.game, PL = MC.player, R = MC.renderer;
const Rp = MC.report = { url: /^https?:/.test(location.protocol) ? '/crumbs/report' : null, hold: 0, cool: 0, busy: false };
let rt = null; const cam = new THREE.PerspectiveCamera(80, 16 / 9, 0.05, 220);
// what the eyes see, drawn once more to a small picture (in a headset: from the head, one eye's worth)
Rp.shot = function () {
  const W = 960, H = 540; if (!rt) rt = new THREE.WebGLRenderTarget(W, H);
  const src = MC.isXR() ? R.xr.getCamera() : MC.camera; src.updateMatrixWorld(true); src.matrixWorld.decompose(cam.position, cam.quaternion, cam.scale); cam.scale.set(1, 1, 1); cam.updateMatrixWorld(true);
  const xr = R.xr.enabled, was = R.getRenderTarget(); R.xr.enabled = false; R.setRenderTarget(rt); R.render(MC.scene, cam); const px = new Uint8Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, px); R.setRenderTarget(was); R.xr.enabled = xr;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
  const lin = v => { v /= 255; v = v / (1 + v * 0.6) * 1.6; return Math.round(255 * Math.pow(Math.min(1, Math.max(0, v)), 1 / 2.2)); };   // the target is linear light: bring it to a screen's
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((H - 1 - y) * W + x) * 4, d = (y * W + x) * 4; im.data[d] = lin(px[s]); im.data[d + 1] = lin(px[s + 1]); im.data[d + 2] = lin(px[s + 2]); im.data[d + 3] = 255; }
  g.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.8);
};
const note = t => { if (MC.isXR()) PL.wristNote(t); else MC.say(t, 3); };
Rp.send = async function () {
  if (Rp.busy) return; Rp.busy = true; let jpg = ''; try { jpg = Rp.shot(); } catch (e) { }
  const p = MC.rig.position, a = MC.events.active, ctx = { night: G.cfg && G.cfg.title, mode: G.mode, clock: G.clockText ? G.clockText() : '', served: G.served, tips: G.tips, noise: Math.round(G.noise), at: [p.x, p.y, p.z].map(v => +v.toFixed(2)), yaw: +PL.yaw.toFixed(2), xr: MC.isXR(), event: a ? a.type : '', home: MC.world.home && MC.world.home.name, hands: PL.hands.map(h => h.item ? h.item.type : h.grip ? 'grip' : '-'), room: MC.net && MC.net.room || '', ua: navigator.userAgent.slice(0, 120) };
  MC.audio.init && MC.sfx && MC.sfx.coin && MC.sfx.coin(PL.head); PL.buzz && PL.buzz(null, 0.8, 120);
  if (!Rp.url || !jpg) { Rp.last = jpg; Rp.msg = jpg ? 'Picture taken (not sent: this copy of the game is not on the website).' : 'The picture could not be taken.'; Rp.msgT = 4; Rp.busy = false; return; }
  try { const r = await fetch(Rp.url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jpg, context: ctx }) }), j = r.ok ? await r.json() : null;
    Rp.msg = j && j.ok ? 'Picture sent to the makers.' : r.status === 401 ? 'Log in on the website to send pictures.' : 'The picture did not go through.'; } catch (e) { Rp.msg = 'The picture did not go through.'; }
  Rp.msgT = 4; Rp.busy = false;
};
const tick0 = MC.tick; MC.tick = function (dt) {
  tick0(dt);
  if (Rp.msgT > 0) { Rp.msgT -= dt; note(Rp.msg); }
  if (Rp.cool > 0) { Rp.cool -= dt; return; }
  if (!MC.isXR()) return; const s = R.xr.getSession(); if (!s) return; let n = 0;
  for (const src of s.inputSources) if (src.gamepad && src.gamepad.buttons[0] && src.gamepad.buttons[0].pressed) n++;
  if (n >= 2 && !PL.hands.some(h => h.grip)) { Rp.hold += dt; if (Rp.hold > 0.8) PL.wristNote('Keep holding both triggers: taking a picture in ' + Math.max(1, Math.ceil(3 - Rp.hold)) + '…'); if (Rp.hold >= 3) { Rp.hold = 0; Rp.cool = 6; Rp.send(); } } else Rp.hold = 0;
};
window.addEventListener('keydown', e => { if (e.code === 'F8' && !Rp.busy && Rp.cool <= 0) { e.preventDefault(); Rp.cool = 2; Rp.send(); } });
})();
