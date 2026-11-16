// a bug report from inside the headset: X or A (or the menu) takes a picture of what you see and listens to you; press again (or wait) and the picture, your words and the game's state go to the owners' queue (POST /sushi/report)
import * as THREE from 'three';
import { G } from './ctx.js';

export function buildReport(scene, camera, renderer, talk) {
  const R = { busy: false }; let rec = null, parts = [], shot = '', t0 = 0, latch = false, msgT = 0;
  const say = (m, sec = 4) => { G.reportMsg = m; msgT = sec; };
  function snap() { // one more look at the scene from your eyes, into a picture (the headset's own picture cannot be read back)
    const W = 960, H = 540, rt = new THREE.WebGLRenderTarget(W, H), cam = new THREE.PerspectiveCamera(86, W / H, 0.03, 600), xr = renderer.xr, was = xr.enabled, keep = renderer.getRenderTarget();
    rt.texture.colorSpace = THREE.SRGBColorSpace; camera.getWorldPosition(cam.position); camera.getWorldQuaternion(cam.quaternion); cam.updateMatrixWorld(true);
    const buf = new Uint8Array(W * H * 4); xr.enabled = false;
    try { renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf); } finally { renderer.setRenderTarget(keep); xr.enabled = was; rt.dispose(); }
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
    for (let y = 0; y < H; y++) im.data.set(buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
    g.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.72);
  }
  const b64 = (blob) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] || ''); fr.readAsDataURL(blob); });
  async function send(blob) {
    say('REPORT: SENDING…', 20);
    const ctx = { t: Math.round(G.t), mode: G.mode, state: G.game.state, night: G.game.night, served: G.game.served, frameMs: Math.round(G.emaMs || 0), shadows: G.quality < 1, mic: talk.mic, voice: talk.diag, guide: G.guideText || '', hint: G.hint, holding: G.hands.map((h) => (h.held ? h.held.name : '')).filter(Boolean), patrons: G.game.customers.map((c) => (c.p.cast || c.p.style) + ':' + c.state), items: G.items.length, ua: navigator.userAgent.slice(0, 160) };
    try { const r = await fetch('/sushi/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jpg: shot, audio: blob && blob.size > 1500 ? await b64(blob) : '', mime: blob ? blob.type.split(';')[0] : '', context: ctx }) }), j = r.ok ? await r.json() : null;
      if (j && j.ok) { say('REPORT SENT' + (j.said ? ': "' + j.said.slice(0, 40) + '"' : ''), 6); G.audio.play('done'); } else say(r.status === 401 ? 'REPORT NEEDS A LOGIN' : 'REPORT NOT SENT', 6); } catch (e) { say('REPORT NOT SENT', 6); }
    R.busy = false; talk.hold = false;
  }
  R.press = () => {
    if (rec) { try { rec.stop(); } catch (e) { /* stopped */ } return; }
    if (R.busy) return; R.busy = true; G.audio.play('click');
    try { shot = snap(); } catch (e) { shot = ''; }
    const st = talk.micStream && talk.micStream(); talk.hold = true;
    if (!st || !window.MediaRecorder) return send(null);
    parts = []; const m = (rec = new MediaRecorder(st)); t0 = G.t; m.ondataavailable = (e) => parts.push(e.data); m.onstop = () => { rec = null; send(new Blob(parts, { type: m.mimeType })); }; m.start();
    say('REPORT: PICTURE TAKEN. SAY WHAT IS WRONG, THEN PRESS X OR A', 20);
  };
  R.update = (dt) => {
    if (msgT > 0) { msgT -= dt; if (msgT <= 0) G.reportMsg = ''; }
    if (rec && G.t - t0 > 15) { try { rec.stop(); } catch (e) { /* stopped */ } }
    const ses = renderer.xr.getSession?.(); let down = false; if (ses) for (const s of ses.inputSources) if (s.gamepad && s.gamepad.buttons[4] && s.gamepad.buttons[4].pressed) down = true;
    if (down && !latch) R.press(); latch = down;
  };
  addEventListener('keydown', (e) => { if (e.code === 'F8') { e.preventDefault(); R.press(); } });
  return R;
}
