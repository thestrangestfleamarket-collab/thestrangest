// the run's end at dawn (the clock's 'end'): the score card of the day and the night, BEGIN AGAIN; on a screen a card beside the morning, in the headset a board before you
import * as THREE from 'three';
import { G, V3 } from './ctx.js';
import * as T from './tex.js';
import { mon } from './till.js';

export function buildDawn(scene) {
  const D = { card: null, board: null };
  const panel = document.createElement('div'); panel.style.cssText = 'position:fixed;inset:0;display:none;z-index:20;background:rgba(4,3,3,0);color:#e8dcc8;font:16px Georgia,serif;align-items:center;justify-content:flex-start;padding-left:3vw;transition:background 2.5s'; document.body.appendChild(panel);
  const again = () => { location.href = location.pathname + location.search; };
  D.rows = () => { const g = G.game || {}, rate = g.rating ? g.rating() : 0;
    return [['Bowls served', g.served || 0], ['Walked out', g.lost || 0], ['Taken in', mon((g.money || 0) + (g.tips || 0))], ['Rating', g.scores && g.scores.length ? '★'.repeat(Math.round(rate)) + ' ' + rate.toFixed(1) : 'none'], ['Late bowls, by lantern light', g.lateServed || 0]]; };
  D.show = () => { if (D.card || G.guest) return; G.ended = true; G.guideText = ''; G.hoverText = ''; if (G.game && G.game.summary) G.game.summary.visible = false;   // (the morning is to be seen: the day's board is put away)
    const title = 'DAWN', intro = 'The street lamps go out and the block wakes.', rows = D.rows(), last = G.story && G.story.notes.length ? G.story.notes[G.story.notes.length - 1] : '';
    panel.innerHTML = ''; const box = document.createElement('div'); box.style.cssText = 'background:rgba(10,8,7,0.84);border:1px solid #6a5a48;padding:18px 28px;width:min(440px,88vw);box-sizing:border-box;text-align:center;font-size:15px'; panel.appendChild(box);
    const h = document.createElement('div'); h.style.cssText = 'font-size:34px;letter-spacing:4px;margin-bottom:10px;white-space:nowrap'; h.textContent = title; box.appendChild(h);
    const it = document.createElement('div'); it.style.cssText = 'margin-bottom:14px;opacity:.9'; it.textContent = intro; box.appendChild(it);
    const tb = document.createElement('table'); tb.style.cssText = 'margin:0 auto;border-spacing:14px 2px;font-size:15px'; for (const [k, v] of rows) { const r = tb.insertRow(); r.insertCell().textContent = k; const c = r.insertCell(); c.textContent = String(v); c.style.textAlign = 'right'; } box.appendChild(tb);
    if (last) { const e = document.createElement('div'); e.style.cssText = 'margin:10px 3px 0;font-size:14px;opacity:.7;font-style:italic'; e.textContent = last; box.appendChild(e); }
    const b = document.createElement('button'); b.textContent = 'BEGIN AGAIN'; b.style.cssText = 'margin-top:20px;font:600 18px Georgia,serif;letter-spacing:3px;padding:12px 30px;background:#1a1410;color:#e8dcc8;border:1px solid #6a5a48;cursor:pointer'; b.onclick = again; box.appendChild(b);
    panel.style.display = 'flex'; requestAnimationFrame(() => (panel.style.background = 'rgba(4,3,3,0.25)')); document.exitPointerLock?.(); D.card = { title, rows };
    if (!G.renderer.xr.isPresenting) return;
    const lines = [intro, ...rows.map(([k, v]) => `${k}: ${v}`)];
    const tex = T.canvasTex(1024, 760, (g, w, hh) => { g.fillStyle = 'rgba(8,6,6,0.94)'; g.fillRect(0, 0, w, hh); g.fillStyle = '#e8dcc8'; g.textAlign = 'center'; g.font = '56px Georgia'; g.fillText(title, w / 2, 90, w - 60); g.font = '30px Georgia'; lines.forEach((l, i) => g.fillText(l, w / 2, 160 + i * 44, w - 60)); if (last) { g.font = 'italic 26px Georgia'; g.fillText(last, w / 2, 170 + lines.length * 44, w - 60); } g.strokeStyle = '#8a7a68'; g.lineWidth = 3; g.strokeRect(w / 2 - 170, hh - 100, 340, 70); g.font = '36px Georgia'; g.fillText('BEGIN AGAIN', w / 2, hh - 52); });
    const cam = G.camera.getWorldPosition(new V3()), fw = G.camera.getWorldDirection(new V3()).setY(0).normalize();
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); bd.position.copy(cam).addScaledVector(fw, 0.75); bd.lookAt(cam.x, bd.position.y, cam.z); scene.add(bd); D.board = bd;
    const btn = { name: 'BEGIN AGAIN', r: 0.09, getPos: () => bd.localToWorld(new V3(0, -0.23, 0.01)), press: again }; bd.userData.button = btn; G.buttons.push(btn); };
  G.clock.on('end', D.show);
  G.dawn = D; return D;
}
