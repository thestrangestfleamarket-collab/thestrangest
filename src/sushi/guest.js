// A GUEST IN THE ALLEY: a tenant of THE MARKET come down THE DARK ALLEY as themselves (146bg sends them here, /holo?g=sushi&as=guest; on its own /sushi?guest=1): on a screen they walk it in third or first person, in a headset as they stand; their own figure (its standing, walking and sitting baked in THE MARKET) is drawn here and sent to everyone else in the alley; a stool to sit on and be served at, the bowl paid from their own money; the street's end, or LEAVE, back to THE MARKET at the alley's mouth
import * as THREE from 'three';
import { G, BOUNDS, clamp } from './ctx.js';
import { SEATS, RECIPES } from './cart.js';
import { tenantFigure } from './tenant.js';
import { makePerson } from './avatars.js';
import { mon as usd } from './till.js';
import * as T from './tex.js';
import { NZ, KERB, W0, E0 } from './plan.js';

const SEATZ = -1.16, STOOLZ = -1.62, START = [1.4, -2.6], MOUTH = 25.2, WALK = 1.45;   // where a guest sits and stands to sit; where they come in; the street's end
// what a guest walks round: the cart, the dumpsters and pallets, in the cart's own metres [x0, z0, x1, z1]
const SOLID = [[-1.95, -1.4, 1.95, NZ], [-19.6, KERB, -18.8, KERB + 0.85], [-16.2, NZ - 1.5, -14.2, NZ], [-23.8, NZ - 1.5, -21.8, NZ]];   // the cart, the pay phone, the stoops

export function buildGuest(live) {
  const card = (() => { try { return JSON.parse(sessionStorage.getItem('holo') || 'null') || {}; } catch (e) { return {}; } })(), Y = card.yatai || {};
  const me = { seat: -1, cook: '', sat: false, ask: null, askT: 0, menu: null, drink: '', paid: 0, cash: Math.max(0, +Y.cash || 0), view: 'third', yaw: 0, at: new THREE.Vector3(START[0], 0, START[1]), moved: 0, since: live.share ? live.share.since : Date.now(), ph: 0, near: -1, nearCook: null };
  G.guestRole = me; G.hint = 'WASD WALK · MOUSE LOOK · V FIRST / THIRD PERSON · E SIT AT A STOOL · M SETTINGS · THE STREET\'S END OR LEAVE: BACK TO THE MARKET';
  Object.assign(BOUNDS, { minX: W0 + 1.1, maxX: E0 - 0.2, minZ: KERB + 0.15, maxZ: NZ - 0.35 });
  // nothing on the cart is theirs to touch: its things, knobs and switch are the cook's
  for (const it of G.items) it.locked = true; G.sources.length = 0; if (G.cart) G.cart.group.traverse((o) => { o.userData.nopick = true; }); G.itemRoot.userData.nopick = true;
  G.game.toggleOpen = () => { }; G.game.callOver = () => { };

  // their own figure, posed from what THE MARKET baked (standing, a walk of eight steps, sitting), else a stand-in
  const fig = Y.fig && Y.fig.D ? (() => { try { return JSON.parse(Y.fig.D); } catch (e) { return null; } })() : null, clips = Y.clips || null;
  let av = null; try { if (fig) { av = tenantFigure(fig, 1); av.key = Y.fig.k; } } catch (e) { console.warn('the guest figure', e); av = null; }
  const stand = av ? null : makePerson(7, 'student_with_backpack'); if (stand) stand.root.traverse((o) => { o.userData.nopick = true; });
  const body = av ? av.root : stand.root; (G.peopleRoot || G.scene).add(body); body.position.copy(me.at);
  const poseK = Y.fig && Y.fig.k ? String(Y.fig.k).slice(0, String(Y.fig.k).lastIndexOf(':')) : '';
  const frame = (L, f) => { const n = L.length, a = Math.floor(f) % n, b = (a + 1) % n, x = f - Math.floor(f), A = L[a], B = L[b], o = new Array(A.length); for (let i = 0; i < A.length; i++) o[i] = A[i] + (B[i] - A[i]) * x; return o; };
  let M = null; const posed = (how) => { if (!clips) return null; const L = how === 'sit' ? clips.sit : how === 'walk' ? clips.walk : clips.stand; if (!Array.isArray(L) || !L.length) return null; return Array.isArray(L[0]) ? frame(L, me.ph * L.length) : L; };

  // a word to the alley: where they are (in the cart's metres, and in THE MARKET's for the voices), their figure when asked, its bones ten times a second
  const F = Array.isArray(Y.f) && Y.f.length >= 6 ? Y.f.map(Number) : null, mk = (x, z) => (F ? [+(F[0] + F[2] * x + F[4] * z).toFixed(2), +(F[1] + F[3] * x + F[5] * z).toFixed(2)] : null);
  let sending = null, sendT = 0, poseT = 0, gT = 0, mvT = 0, lastMv = '';
  me.want = () => { if (!Y.fig || !Y.fig.D || (sending && sending.k === Y.fig.k)) return; sending = { k: Y.fig.k, D: Y.fig.D, N: Math.ceil(Y.fig.D.length / 9000), i: 0 }; };
  const stepSend = () => { if (!sending) return; const now = performance.now(); if (now - sendT < 50) return; sendT = now; const i = sending.i++; live.send({ t: 'yt', d: { a: { k: sending.k, i, n: sending.N, d: sending.D.slice(i * 9000, (i + 1) * 9000) } } }); if (sending.i >= sending.N) sending = null; };
  const r2 = (v) => Math.round(v * 100) / 100, here = () => [r2(me.at.x), r2(me.at.z), r2(me.yaw)];
  const tellAll = (dt) => { const now = performance.now(); stepSend();
    if (now >= poseT && M) { poseT = now + 100; const m = []; for (let i = 0; i < M.length; i++) m.push(Math.round(M[i] * (i % 12 < 9 ? 1e4 : 10)) / (i % 12 < 9 ? 1e4 : 10)); live.send({ t: 'yt', d: { b: { k: poseK, m, p: here() } } }); }
    if (now >= gT) { gT = now + 500; live.send({ t: 'yt', d: { g: { p: here(), s: me.since, ...(Array.isArray(Y.w) ? { w: Y.w } : {}), ...(F ? { f: F } : {}) } } }); }
    if (now >= mvT && F) { mvT = now + 500; const p = mk(me.at.x, me.at.z), hd = Math.atan2(F[2] * Math.sin(me.yaw) + F[4] * Math.cos(me.yaw), F[3] * Math.sin(me.yaw) + F[5] * Math.cos(me.yaw)), at = [p[0], p[1], 0, +hd.toFixed(2), 'up', 'alley'], k = JSON.stringify(at); if (k !== lastMv) { lastMv = k; live.send({ t: 'mv', at }); } }
    if (me.ask && now - me.askT > 2000) { me.askT = now; live.send({ t: 'yt', d: me.ask }); } };   // (asked again till the cook answers: a word can be lost on a busy line)

  // a line on the screen (and before the eyes in a headset) for what happens at the cart; nobody's speech is written
  const toast = document.createElement('div'); toast.style.cssText = 'position:fixed;left:50%;bottom:9%;transform:translateX(-50%);max-width:80vw;font:600 15px var(--ui);color:#ffd9a0;background:rgba(10,8,12,.82);padding:8px 14px;border-radius:6px;pointer-events:none;z-index:6;display:none;text-align:center'; document.body.appendChild(toast);
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.09), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false })); note.renderOrder = 9; note.visible = false; note.userData.nopick = true; note.position.set(0, -0.22, -0.8); G.camera.add(note);
  let toastT = 0; const say = (t) => { me.lastSaid = t; toast.textContent = t; toast.style.display = G.mode === 'desktop' ? 'block' : 'none'; toastT = 5; if (note.material.map) note.material.map.dispose(); note.material.map = T.labelTex([t.slice(0, 60), t.slice(60, 120)].filter(Boolean), { w: 1024, h: 180, fs: 44, bg: 'rgba(10,8,12,0.85)', fg: '#ffd9a0' }); note.material.needsUpdate = true; note.visible = G.mode === 'vr'; };

  // the cart's menu on a little board over the counter, for the one on the stool: point and click, or poke it
  const MW = 0.46, MH = 0.4, mtex = T.panelTex(560, 488, () => { }), board = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshBasicMaterial({ map: mtex, side: THREE.DoubleSide })); board.visible = false; G.pickRoot.add(board);
  const far = new THREE.Vector3(0, -99, 0), _p = new THREE.Vector3(); let rows = [];
  const drawMenu = () => { const R = rows; mtex.redraw((g, w, h) => { g.fillStyle = '#0b0d13'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1612'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#ffb040'; g.font = `bold 32px ${T.MONO}`; g.textAlign = 'left'; g.fillText('THE RAMEN CART · MENU', 22, 46);
    const rh = (h - 70) / Math.max(1, R.length); R.forEach((r, i) => { const y = 64 + rh * i; g.fillStyle = r.on ? '#7a1612' : '#2a0e0c'; g.fillRect(18, y + 4, w - 36, rh - 8); g.strokeStyle = '#ff4a2a'; g.lineWidth = 2; g.strokeRect(18, y + 4, w - 36, rh - 8); g.fillStyle = '#f4ead2'; g.font = `bold 26px ${T.MONO}`; g.fillText(r.t, 30, y + rh / 2 + 9, w - 160); g.textAlign = 'right'; g.fillStyle = '#ffb040'; g.fillText(r.p || '', w - 30, y + rh / 2 + 9); g.textAlign = 'left'; }); }); };
  const menuOn = (M0) => { me.menu = M0; G.buttons.splice(0, G.buttons.length, ...G.buttons.filter((b) => !b.guestMenu)); if (!M0) { board.visible = false; rows = []; return; }
    rows = [...M0.r.map((r) => ({ t: String(r[1]).toUpperCase() + ' RAMEN', p: usd(r[2]), k: r[0] })), ...M0.d.map((d) => ({ t: 'AND A ' + String(d[1]).toUpperCase(), p: d[2] != null ? usd(d[2]) : '', d: d[0] })), { t: "THE COOK'S CHOICE", k: '' }];
    const x = (me.cookX || 0) + SEATS[me.seat]; board.position.set(x, 1.34, -0.64); board.rotation.set(-0.25, Math.PI, 0); board.visible = true; board.updateMatrixWorld(true);
    const rh = (MH - MH * 70 / 488) / rows.length; rows.forEach((r, i) => { const local = new THREE.Vector3(0, MH / 2 - MH * 64 / 488 - rh * (i + 0.5), 0.004); G.buttons.push({ guestMenu: true, r: 0.03, name: r.t, getPos: () => (board.visible ? board.localToWorld(_p.copy(local)).clone() : far), press: () => choose(r) }); }); drawMenu(); };
  const choose = (r) => { if (!me.menu) return; if (r.d != null && r.k == null) { me.drink = me.drink === r.d ? '' : r.d; rows.forEach((q) => { if (q.d != null) q.on = q.d === me.drink; }); drawMenu(); return; }
    me.ask = { g: { pick: { k: r.k, d: me.drink || '' }, to: me.cook } }; me.askT = performance.now(); live.send({ t: 'yt', d: me.ask }); menuOn(null); say(r.k ? 'YOU POINT AT THE MENU.' : 'YOU LEAVE IT TO THE COOK.'); };

  // a stool: ask the cook working that cart for it; up again, and they hear of it
  const cookAt = (x) => { let best = null, bd = 1.6; for (const N of live.cooks.values()) { if (!N.d || G.t - N.t > 8) continue; const d = Math.abs(N.x - x); if (d < bd) { bd = d; best = N; } } return best; };
  const stoolNear = () => { let best = null, bd = 0.75; for (const N of live.cooks.values()) for (let i = 0; i < SEATS.length; i++) { const d = Math.hypot(N.x + SEATS[i] - me.at.x, STOOLZ - me.at.z); if (d < bd) { bd = d; best = { N, i }; } }
    if (!best) for (let i = 0; i < SEATS.length; i++) { const d = Math.hypot(SEATS[i] - me.at.x, STOOLZ - me.at.z); if (d < bd) { bd = d; best = { N: null, i }; } } return best; };
  me.sit = () => { if (me.seat >= 0 || me.cook) { me.up(true); return true; } const s = stoolNear(); if (!s) return false; const N = s.N || cookAt(SEATS[s.i]); if (!N) { say('NOBODY IS WORKING THE RAMEN CART.'); return true; }
    me.cook = N.id; me.cookX = N.x; me.ask = { g: { sit: 1, to: N.id, seat: s.i } }; me.askT = performance.now(); live.send({ t: 'yt', d: me.ask }); say("YOU WAIT TO CATCH THE COOK'S EYE."); return true; };
  me.up = (tell) => { if (tell && me.cook) live.send({ t: 'yt', d: { g: { stand: 1, to: me.cook } } }); const was = me.sat; me.cook = ''; me.seat = -1; me.sat = false; me.ask = null; menuOn(null); me.drink = ''; if (was) { me.at.set(me.at.x, 0, STOOLZ - 0.35); place(); } };
  const cash = (y) => Math.max(1, Math.round((+y || 0) / 100));
  const keepPaid = () => { try { const h = JSON.parse(sessionStorage.getItem('holo') || '{}'); h.yatai = { ...(h.yatai || {}), paid: me.paid }; sessionStorage.setItem('holo', JSON.stringify(h)); } catch (e) { /* not kept */ } };
  me.heard = (from, e) => { const id = live.me; if (!e || typeof e !== 'object') return; const to = (k) => e[k] && String(e[k].to) === id;
    if (to('ok')) { me.ask = null; me.cook = from; me.seat = e.ok.seat | 0; const N = live.cooks.get(from); me.cookX = N ? N.x : 0; me.sat = true; me.at.set(me.cookX + SEATS[me.seat], 0, SEATZ); me.yaw = 0; place(); if (G.desk) { G.desk.yaw = Math.PI; G.desk.pitch = -0.3; } say('YOU TAKE A STOOL AT THE RAMEN CART. THE COOK HAS SEEN YOU.'); const M0 = e.ok.menu; if (M0 && Array.isArray(M0.r) && M0.r.length) menuOn({ r: M0.r.filter(Array.isArray).slice(0, 6), d: Array.isArray(M0.d) ? M0.d.filter(Array.isArray).slice(0, 3) : [] }); }
    else if (to('no')) { me.up(false); say('NO SEAT AT THE CART: ' + String(e.no.why || '').toUpperCase() + '.'); }
    else if (to('ord')) { menuOn(null); me.ask = null; me.price = cash(e.ord.price); say((e.ord.chose ? 'THE COOK TAKES YOUR ORDER: ' : 'YOU ORDER ') + String(e.ord.text || 'RAMEN').toUpperCase() + '. IT WILL BE $' + me.price + '.'); }
    else if (to('r')) { const pay = e.r.pay ? cash(e.r.pay) : 0, can = pay && me.cash - me.paid >= pay; if (can) { me.paid += pay; keepPaid(); } say('YOUR BOWL: ' + String(e.r.verdict || '').toUpperCase() + ' (' + (e.r.score | 0) + '/100). ' + (pay ? (can ? 'YOU PAY $' + pay + '.' : 'YOU CANNOT COVER THE $' + pay + '.') : 'YOU DO NOT PAY FOR THAT.')); }
    else if (to('gone')) { me.up(false); say(e.gone.angry ? 'YOU GIVE UP WAITING AND LEAVE THE CART.' : 'YOU GET UP FROM THE CART.'); } };

  // back to THE MARKET, at the alley's mouth; or behind the cart, to work it
  me.leave = () => { if (me.left) return; me.left = true; if (me.cook) me.up(true); if (live.framed) try { window.parent.postMessage({ yataiLeave: 1 }, location.origin); } catch (e) { /* alone */ } else location.assign(card.back || '/'); };
  me.work = () => { if (live.framed) try { window.parent.postMessage({ yataiCook: 1 }, location.origin); } catch (e) { /* alone */ } else location.assign('/sushi'); };
  addEventListener('keydown', (e) => { if (G.mode !== 'desktop' || e.repeat || (e.target && e.target.tagName === 'INPUT')) return; if (e.code === 'KeyV') me.view = me.view === 'third' ? 'first' : 'third'; else if (e.code === 'KeyE') { if (!me.sit() && behind()) me.work(); } });
  const behind = () => Math.abs(me.at.x) < 1.6 && me.at.z > 2.3;

  // where they stand: the rig moves them (WASD, the stick); never inside the cart or a dumpster; seated, on the stool
  const _c = new THREE.Vector3(), _d = new THREE.Vector3(); let xrF = 0;
  const out = (x, z) => { for (const [x0, z0, x1, z1] of SOLID) { if (x > x0 && x < x1 && z > z0 && z < z1) { const m = [x - x0, x1 - x, z - z0, z1 - z], k = m.indexOf(Math.min(...m)); if (k === 0) x = x0; else if (k === 1) x = x1; else if (k === 2) z = z0; else z = z1; } } return [x, z]; };
  const place = () => { const rig = G.rig; if (G.renderer.xr.isPresenting) { rig.updateMatrixWorld(true); G.camera.getWorldPosition(_c); rig.position.x += me.at.x - _c.x; rig.position.z += me.at.z - _c.z; } else rig.position.set(me.at.x, 0, me.at.z); };
  me.start = () => { me.at.set(START[0], 0, START[1]); place(); if (G.desk) { G.desk.yaw = 2.73; G.desk.pitch = -0.12; } };
  const HINT = G.hint;
  me.update = (dt) => { G.hint = G.dayLine ? G.dayLine + ' · ' + HINT : HINT; G.guideText = ''; if (G.mode === 'menu') return; const xr = G.renderer.xr.isPresenting, cam = G.camera;
    if (xr && ++xrF === 8) { G.rig.rotation.y = Math.PI * 0.85; me.at.set(START[0], 0, START[1]); place(); }   // (once the headset is placed at the cart, out in front of it)
    if (!xr) xrF = 0;
    const prev = _d.copy(me.at); if (me.sat) { if (xr) { G.rig.updateMatrixWorld(true); cam.getWorldPosition(_c); if (Math.hypot(_c.x - me.at.x, _c.z - me.at.z) > 0.6) me.up(true); } else { const k = G.desk && G.desk.keys; if (k && (k.KeyW || k.KeyA || k.KeyS || k.KeyD)) me.up(true); else G.rig.position.set(me.at.x, 0, me.at.z); } }
    if (!me.sat) { if (xr) { G.rig.updateMatrixWorld(true); cam.getWorldPosition(_c); const [x, z] = out(clamp(_c.x, BOUNDS.minX, BOUNDS.maxX), clamp(_c.z, BOUNDS.minZ, BOUNDS.maxZ)); me.at.set(x, 0, z); G.rig.position.x += x - _c.x; G.rig.position.z += z - _c.z; }
      else { const [x, z] = out(G.rig.position.x, G.rig.position.z); G.rig.position.x = x; G.rig.position.z = z; me.at.set(x, 0, z); } }
    const step = Math.hypot(me.at.x - prev.x, me.at.z - prev.z), sp = step / Math.max(dt, 1e-3); me.moved = me.moved * 0.8 + sp * 0.2;
    cam.getWorldDirection(_c); if (me.sat) me.yaw = 0; else if (me.moved > 0.25 && step > 1e-4) me.yaw = Math.atan2(me.at.x - prev.x, me.at.z - prev.z); else if (xr || me.view === 'first') me.yaw = Math.atan2(_c.x, _c.z);
    me.ph = (me.ph + step / WALK) % 1;
    const how = me.sat ? 'sit' : me.moved > 0.25 ? 'walk' : 'stand'; me.how = how;
    if (av) { M = posed(how); if (M) av.pose(M); av.update(dt * 2); } else { stand.pose = how; stand.speed = Math.max(0.6, me.moved); stand.update(dt, G.t); }
    body.position.set(me.at.x, 0, me.at.z); body.rotation.y += Math.atan2(Math.sin(me.yaw - body.rotation.y), Math.cos(me.yaw - body.rotation.y)) * Math.min(1, dt * 10); body.visible = !xr && me.view === 'third';
    if (!xr && G.mode === 'desktop') { const eye = me.sat ? 1.2 : 1.62; cam.position.set(0, eye, 0); if (me.view === 'third') { cam.updateMatrixWorld(true); cam.getWorldDirection(_c); const back = me.sat ? 1.7 : 2.6, wz = clamp(me.at.z - _c.z * back, BOUNDS.minZ, BOUNDS.maxZ), k = Math.abs(_c.z) > 0.05 ? Math.max(0.35, Math.min(1, (wz - me.at.z) / (-_c.z * back))) : 1; cam.position.set(-_c.x * back * k, eye + 0.35 - _c.y * back * 0.5 + (1 - k) * 0.5, -_c.z * back * k); } }   // (against a wall the camera comes in closer, and up)
    // what they could do here, said on the screen
    const s = !me.sat && !me.cook ? stoolNear() : null; G.hoverText = me.menu ? 'POINT AT THE MENU AND CLICK' : me.sat ? 'E OR A STEP: GET UP' : s ? 'E: SIT AT THE COUNTER' : behind() ? 'E: WORK THE CART' : '';
    if (xr && !me.sat) for (const h of G.hands || []) if (h.xr && h.useDown && s) { me.sit(); break; }
    if (me.at.x > MOUTH) me.leave();
    if (toastT > 0 && (toastT -= dt) <= 0) { toast.style.display = 'none'; note.visible = false; }
    if (live.framed || live.net().on) tellAll(dt); };
  me.state = () => ({ at: [r2(me.at.x), r2(me.at.z)], yaw: r2(me.yaw), how: me.how, seat: me.seat, cook: me.cook, sat: me.sat, paid: me.paid, cash: me.cash, menu: rows.map((r) => r.t), said: me.lastSaid || '', fig: !!av, view: me.view });
  return me;
}
