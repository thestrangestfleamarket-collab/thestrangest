// the run's end at dawn (the clock's 'end'): the card of the day and the night (the takings against the target, the fee, the reputation), the shop for the cart (shop.js), NEXT DAY and START OVER; on a screen a card beside the morning, in the headset a board before you to read and poke
import * as THREE from 'three';
import { G, V3 } from './ctx.js';
import * as T from './tex.js';
import { RECIPES } from './cart.js';
import { TEXT as ST } from './shop.js';
import { dateOf } from './clock.js';

export const TEXT = { title: 'DAWN', intro: 'The street lamps go out and the block wakes.', day: 'Day', served: 'Bowls served', lost: 'Walked out', taken: 'Taken in', of: 'of', fee: 'Permit fee due at dawn', paid: 'paid', unpaid: 'UNPAID', rating: 'Rating', rep: 'Reputation', late: 'Late bowls, under the neon', savings: 'Savings', dish: 'New on the menu', extras: 'special requests', next: 'NEXT DAY', over: 'START OVER', sure: 'SURE? START OVER', keep: 'Log in to keep your progress.', kept: 'Progress saved.', out: 'Three fees unpaid: the vending permit is pulled.', met: 'target met' };

export function buildDawn(scene) {
  const D = { card: null, board: null, btns: [] };
  const panel = document.createElement('div'); panel.style.cssText = 'position:fixed;inset:0;display:none;z-index:20;background:rgba(4,3,3,0);color:#e8dcc8;font:16px Georgia,serif;align-items:center;justify-content:flex-start;padding-left:3vw;transition:background 2.5s'; document.body.appendChild(panel);
  const fmt = (n) => G.money.fmt(n);
  const hide = () => { panel.style.display = 'none'; panel.style.background = 'rgba(4,3,3,0)'; panel.innerHTML = ''; if (D.board) { D.board.removeFromParent(); D.board = null; } if (D.rec) { G.boards.drop(D.rec); D.rec = null; } for (const b of D.btns) { const i = G.buttons.indexOf(b); if (i >= 0) G.buttons.splice(i, 1); } D.btns.length = 0; D.card = null; };
  const next = () => { hide(); G.prog.next(); }, over = () => { hide(); G.prog.over(); };
  D.rows = (R) => { const rate = R.rating;
    return [[TEXT.day, `${R.day}: ${dateOf(R.day).short}`], [TEXT.served, R.served], [TEXT.lost, R.lost], [TEXT.taken, `${fmt(R.taken)} ${TEXT.of} ${fmt(R.target)}${R.met ? ' ✓' : ''}`], [TEXT.fee, R.short ? `${fmt(R.fee + R.owed)}: ${fmt(R.short)} ${TEXT.unpaid}` : `${fmt(R.fee + R.owed)} ${TEXT.paid}`],
      [TEXT.rating, R.served + R.lost ? '★'.repeat(Math.round(rate)) + ' ' + rate.toFixed(1) : 'none'], [TEXT.rep, `${R.rep} (${R.rep >= R.repWas ? '+' : ''}${R.rep - R.repWas})`], [TEXT.late, R.late],
      ...(R.dish || R.extras ? [[TEXT.dish, R.dish ? RECIPES[R.dish].name : TEXT.extras]] : []), ...(G.events ? G.events.log.map((e) => [e.name, e.text]) : [])]; };
  D.show = () => { if (D.card || G.guest) return; G.ended = true; G.guideText = ''; G.hoverText = ''; if (G.game && G.game.summary) G.game.summary.visible = false;   // (the morning is to be seen: the day's board is put away)
    const R = G.prog.close(), title = TEXT.title, intro = R.out ? TEXT.out : TEXT.intro, rows = D.rows(R), last = G.story && G.story.notes.length ? G.story.notes[G.story.notes.length - 1] : '';
    panel.innerHTML = ''; const wrap = document.createElement('div'); wrap.style.cssText = 'background:rgba(10,8,7,0.88);border:1px solid #6a5a48;padding:12px 22px;width:min(800px,94vw);max-height:96vh;overflow:auto;box-sizing:border-box;font-size:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:4px 26px;align-items:start'; panel.appendChild(wrap);
    const box = document.createElement('div'), side = document.createElement('div'); box.style.textAlign = 'center'; wrap.appendChild(box); wrap.appendChild(side); { const st = document.getElementById('stat'); if (st) st.textContent = ''; }   // (the card on the left, the shop beside it)
    const h = document.createElement('div'); h.style.cssText = 'font-size:30px;letter-spacing:4px;margin-bottom:6px;white-space:nowrap'; h.textContent = title; box.appendChild(h);
    const it = document.createElement('div'); it.style.cssText = 'margin-bottom:8px;opacity:.9'; it.textContent = intro; box.appendChild(it);
    const tb = document.createElement('table'); tb.style.cssText = 'margin:0 auto;border-spacing:12px 1px;font-size:14px'; for (const [k, v] of rows) { const r = tb.insertRow(); r.insertCell().textContent = k; const c = r.insertCell(); c.textContent = String(v); c.style.textAlign = 'right'; } box.appendChild(tb);
    if (last) { const e = document.createElement('div'); e.style.cssText = 'margin:6px 3px 0;font-size:13px;opacity:.7;font-style:italic'; e.textContent = last; box.appendChild(e); }
    if (!R.out) G.shop.dom(side);
    const note = document.createElement('div'); note.style.cssText = 'margin-top:8px;font-size:12px;opacity:.75'; note.textContent = G.prog.saved ? TEXT.kept : TEXT.keep; box.appendChild(note); G.prog.saving.then((ok) => { note.textContent = ok ? TEXT.kept : TEXT.keep; });
    const bs = 'margin:10px 6px 0;font:600 17px Georgia,serif;letter-spacing:3px;padding:10px 24px;background:#1a1410;color:#e8dcc8;border:1px solid #6a5a48;border-radius:0;cursor:pointer';
    if (!R.out) { const b = document.createElement('button'); b.textContent = TEXT.next; b.style.cssText = bs; b.onclick = next; box.appendChild(b); }
    { const b = document.createElement('button'); b.textContent = TEXT.over; b.style.cssText = bs + (R.out ? '' : ';font-size:12px;padding:6px 12px;opacity:.75'); b.onclick = () => { if (R.out || b.dataset.sure) over(); else { b.dataset.sure = 1; b.textContent = TEXT.sure; } }; box.appendChild(b); }
    panel.style.display = 'flex'; requestAnimationFrame(() => (panel.style.background = 'rgba(4,3,3,0.25)')); document.exitPointerLock?.(); D.card = { title, rows, result: R };
    if (G.renderer.xr.isPresenting) D.vr(R, rows, intro, last); };
  // in the headset: one board, the card on its left, the shop on its right, every box on it a thing to poke
  D.vr = (R, rows, intro, last) => { const W = 1.1, H = 0.8, PW = 1100, PH = 800, items = () => G.shop.items(), rowY = (i) => 150 + i * 62;
    const draw = (g, w, hh) => { g.fillStyle = 'rgba(8,6,6,0.96)'; g.fillRect(0, 0, w, hh); g.strokeStyle = '#8a7a68'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, hh - 4); g.fillStyle = '#e8dcc8'; g.textAlign = 'center'; g.font = '52px Georgia'; g.fillText(TEXT.title, w * 0.26, 70); g.font = '24px Georgia'; g.fillText(intro, w * 0.26, 108, w * 0.5 - 30);
      g.font = '27px Georgia'; rows.forEach(([k, v], i) => { g.textAlign = 'left'; g.fillText(String(k), 30, 160 + i * 40, w * 0.26); g.textAlign = 'right'; g.fillText(String(v), w * 0.5 - 16, 160 + i * 40, w * 0.25); });
      if (last) { g.textAlign = 'center'; g.font = 'italic 22px Georgia'; g.fillText(last, w * 0.26, 180 + rows.length * 40, w * 0.5 - 30); }
      g.textAlign = 'left'; g.font = 'bold 30px Georgia'; g.fillText(ST.title, w * 0.52, 70); g.textAlign = 'right'; g.fillText(`${ST.savings} ${fmt(G.prog.P.money)}`, w - 24, 70); g.fillStyle = '#6a5a48'; g.fillRect(w * 0.5, 30, 2, hh - 60);
      if (!R.out) items().forEach((it, i) => { const y = rowY(i); g.globalAlpha = it.owned ? 0.5 : 1; g.fillStyle = '#e8dcc8'; g.textAlign = 'left'; g.font = 'bold 26px Georgia'; g.fillText(it.name, w * 0.52, y, w * 0.28); g.font = '20px Georgia'; g.fillText(it.what, w * 0.52, y + 26, w * 0.28);
        g.strokeStyle = it.can ? '#40e080' : '#6a5a48'; g.lineWidth = 3; g.strokeRect(w * 0.82, y - 28, w * 0.16, 52); g.textAlign = 'center'; g.font = 'bold 24px Georgia'; g.fillText(it.owned ? ST.owned : fmt(it.price), w * 0.9, y + 6, w * 0.15); g.globalAlpha = 1; });
      g.strokeStyle = '#40e080'; g.lineWidth = 4; g.fillStyle = '#e8dcc8'; g.textAlign = 'center'; if (!R.out) { g.strokeRect(w * 0.56, hh - 110, w * 0.26, 76); g.font = 'bold 38px Georgia'; g.fillText(TEXT.next, w * 0.69, hh - 58, w * 0.25); }
      g.strokeStyle = '#8a7a68'; g.strokeRect(w * 0.06, hh - 96, w * 0.2, 56); g.font = '24px Georgia'; g.fillText(D.sure ? TEXT.sure : TEXT.over, w * 0.16, hh - 60, w * 0.19); };
    const tex = T.panelTex(PW, PH, draw), cam = G.camera.getWorldPosition(new V3()), fw = G.camera.getWorldDirection(new V3()).setY(0).normalize(); D.sure = false;
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); bd.position.copy(cam).addScaledVector(fw, 0.8); bd.lookAt(cam.x, bd.position.y, cam.z); bd.userData.nopick = true; scene.add(bd); bd.updateMatrixWorld(true); D.board = bd; if (G.boards) { D.rec = G.boards.add('dawn', bd, W, H, { keep: false }); G.boards.summon(D.rec, 0.8, 0); }
    const at = (px, py) => new V3((px / PW - 0.5) * W, (0.5 - py / PH) * H, 0.01), add = (name, px, py, press, r = 0.045) => { const l0 = at(px, py), l = new V3(), b = { name, r, getPos: () => bd.localToWorld(l.copy(l0)), press: () => { press(); if (D.board === bd) tex.redraw(draw); } }; G.buttons.push(b); D.btns.push(b); return b; };
    if (!R.out) { items().forEach((it, i) => add(it.name, PW * 0.9, rowY(i), () => G.shop.buy(it.id), 0.035)); bd.userData.button = add(TEXT.next, PW * 0.69, PH - 72, next, 0.07); }
    add(TEXT.over, PW * 0.16, PH - 68, () => { if (R.out || D.sure) over(); else D.sure = true; }, 0.05); };
  G.clock.on('end', D.show);
  G.dawn = D; return D;
}
