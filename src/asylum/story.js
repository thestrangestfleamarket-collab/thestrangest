// the asylum's night: what you can pick up and use, the notes, and every scripted scare in order
import { G, after, once } from './state.js';
import { W, door, roomAt, los, solidCell, GW } from './world.js';
import { M, staticFrame } from './tex.js';
import { A } from './audio.js';
import { P } from './patient.js';
import { HUD } from './hud.js';

const NOTES = {
  log: ['NIGHT LOG, FRONT DESK', '23:10  Mains dropped again. Third time this week.\n23:25  Front doors are on the mag-lock. They only release on mains power, so nobody leaves until the fuses are back in the boiler room box.\n23:40  Someone keeps pulling the fuses. Ask Dr. Finch.\n23:52  New night guard due. Ward key is in the office.'],
  memo: ['MEMO: Dr. A. Finch to all staff', 'The three mains fuses are NOT to be removed.\n\nI borrowed one for the machine in Treatment. One went down to the mortuary on a trolley by mistake. The third was found in Patient 9\'s cell. He collects things.\n\nPut them back in the boiler room and throw the lever.'],
  file: ['PATIENT 9. RESTRICTED', 'Admitted 1961. No name on record.\n\nDoes not move while observed under light. Moves when he is not. Staff are to keep a lamp on him at all times.\n\nHe will not come into a lit corridor. Lately the tubes near his cell keep failing.\n\nDo not let your batteries run down.'],
  tally: ['SCRATCHED INTO THE WALL', 'he only walks in the dark\nhe only walks in the dark\nhe only walks in the dark\n\nkeep the light on him\n\nDON\'T LOOK AWAY'],
  finch: ['CLIPBOARD: Dr. Finch', 'Session 41. Patient 9. Full current, eleven seconds.\n\nNo response. He watched me the whole time.\n\nWhen the lamp flickered he was standing. The straps were still buckled.\n\nI have put the mortuary key in my coat. I will not be going down there again.'],
  tags: ['COLD ROOM REGISTER', 'Drawer 1  empty\nDrawer 2  unknown female\nDrawer 3  empty\nDrawer 4  FINCH, Aldous, Dr. Found in boiler room. Personal effects left on the tray.\nDrawer 5  empty\n\nGurney: PATIENT 9, pronounced 02:14.\n\n(the last line has been crossed out)'],
};
const inter = []; let near = null, intro = 0, dripT = 4, bangT = 50, sqT = 0, bodyUp = 0, arch = 0, drawerOpen = 0, leverT = -1, surge = -1;
export const S = { init, update, use, kill, NOTES, state: () => ({ near: near && near.label(), obj: G.objective }) };
const D = W.dyn, key = () => G.xr ? 'TRIGGER' : G.touch ? 'USE' : 'E';
const obj = t => { if (G.objective !== t) { G.objective = t; HUD.say(t, 7); } };
const cp = (x, z, yaw) => { G.cp = { x: x ?? G.head.x, z: z ?? G.head.z, yaw: yaw ?? G.p.yaw }; };
const tubesNear = (x, z, r, st) => W.tubes.forEach(t => { if ((t.x - x) ** 2 + (t.z - z) ** 2 < r * r) t.state = st; });
const looking = (x, z, min = .7) => { const dx = x - G.head.x, dz = z - G.head.z, d = Math.hypot(dx, dz) || 1; return (dx * G.fwd.x + dz * G.fwd.z) / d > min; };

function init() {
  for (const d of W.doors) inter.push({ x: d.px, y: 1.1, z: d.pz, r: 1.9, label: () => d.id === 'exit' ? 'Front doors' : d.a > .5 ? 'Close door' : 'Open door', use: () => useDoor(d) });
  for (const it of W.items) inter.push({ x: it.x, y: it.y, z: it.z, r: 1.9, label: () => it.got || (it.id === 'f3' && drawerOpen < .9) ? null : it.kind === 'note' ? 'Read' : it.kind === 'batt' ? 'Take batteries' : it.kind === 'fuse' ? 'Take the fuse' : it.kind === 'key' ? 'Take the ward key' : 'Take the key from the coat', use: () => take(it) });
  inter.push({ x: 1.2, y: .6, z: 4.7, r: 1.9, label: () => G.flags.drawer ? null : 'Open drawer 4', use: () => { G.flags.drawer = true; A.drawer([1.5, .6, 4.7]); } });
  inter.push({ x: 31.5, y: 1.5, z: 8.8, r: 1.9, label: () => G.placed ? null : 'Fuse box', use: fusebox });
  inter.push({ x: 30.95, y: 1.4, z: 8.8, r: 1.9, label: () => G.placed && !G.power && leverT < 0 ? 'Throw the lever' : null, use: lever });
  P.onKill = kill; P.onTubeKill = () => { if (once('tk')) HUD.say('The tube by him just died.', 4); };
  door('cell8').locked = true; door('morgue').locked = true; door('ward').locked = true; door('exit').locked = true;
}
function useDoor(d) {
  const p = [d.px, 1.1, d.pz];
  if (d.id === 'exit') { if (G.power) return win(); A.rattle(p); HUD.say('Mag-locked. It only releases on mains power.', 5); if (!G.inv.key && once('o1')) after(4.5, () => { if (!G.inv.key) obj('Find the ward key. The night log says it is in the office.'); }); return; }
  if (d.locked) {
    if (d.id === 'ward' && G.inv.key) { d.locked = false; A.click(p); once('wardopen') && after(.8, () => HUD.say('Cold air. Something sour under it.', 4)); }
    else if (d.id === 'morgue' && G.inv.mkey) { d.locked = false; A.click(p); }
    else { A.rattle(p); d.shake = .25; HUD.say(d.id === 'ward' ? 'Locked. The ward key should be in the office.' : d.id === 'morgue' ? 'Locked. MORTUARY. Someone has the key.' : d.id === 'cell8' ? 'Locked. Something is leaning on it from the inside.' : 'It will not move.', 4); return; }
  }
  d.t = d.a > .5 ? 0 : 1; A.creak(p);
}
function take(it) {
  if (it.kind === 'note') { if (HUD.reading()) return; const n = NOTES[it.id]; HUD.read(n[0], n[1], key() + ' to put it down'); G.mode = 'read'; A.pickup(); return; }
  it.got = true; if (it.mesh) it.mesh.visible = false; A.pickup();
  if (it.kind === 'batt') { G.batt = Math.min(1, G.batt + .6); HUD.say('Batteries.', 2.5); }
  else if (it.kind === 'key') { G.inv.key = true; HUD.say('The ward key.', 3); obj('Through the ward door. Find the boiler room fuse box.'); }
  else if (it.kind === 'mkey') { G.inv.mkey = true; HUD.say('A cold iron key. MORTUARY on the tag.', 4); }
  else if (it.kind === 'fuse') { G.inv.fuses++; HUD.say('A mains fuse. ' + G.inv.fuses + ' of 3.', 3.5); if (G.inv.fuses === 3) obj('Three fuses. The boiler room is past the top of the ward.'); ({ f1: s3, f2: s4, f3: s5 })[it.id](); }
}
function fusebox() {
  if (G.inv.fuses < 3) { HUD.say('MAINS, 3 x 30A. All three fuses are gone. You have ' + G.inv.fuses + '.', 5); G.objective = 'Find the three mains fuses.'; return; }
  G.placed = true; D.slots.forEach((s, i) => after(i * .35, () => { s.visible = true; A.click([31.5, 1.5, 8.8]); })); after(1.2, () => HUD.say('All three are in. Throw the lever.', 4));
}
function lever() {
  leverT = 0; A.thud([31, 1.4, 8.8]); surge = 0; A.surge(); G.flags.cut = true;
  after(2.3, () => { surge = -1; G.power = true; G.red = true; W.tubes.forEach(t => { t.state = 'dead'; }); A.spark(null); A.sting(.8); A.alarm(true); D.exitSign.color.set(0x30ff60); P.hide(); P.on = false;
    for (const id of ['boiler', 'ward']) { const d = door(id); d.locked = false; d.t = 1; } door('exit').locked = false; cp(29.6, 2.5, Math.PI / 2); obj('The doors are open. RUN.'); });
  after(3.4, () => A.scream([33, 1.5, 5]));
}
function s1() { P.pose(13.5, 9.6, { track: true }); after(1.6, () => { tubesNear(13.5, 9.5, 1, 'dead'); A.spark([13.5, 2.7, 9.5]); A.sting(.5); }); after(2.0, () => { P.hide(); }); after(3.3, () => { tubesNear(13.5, 9.5, 1, 'on'); HUD.say('There was someone under that light.', 4); }); }
function s3() {
  const d = door('cell9'), p = [11.5, 1.4, 10.5]; d.t = 0; d.locked = true; d.fast = true; D.bulb9.state = 'dead'; A.spark([9.5, 2.4, 10.5]); P.hide(); P.on = false;
  for (const t of [1.6, 2.3, 3.0]) after(t, () => { A.bang(p); d.shake = .35; }); after(4.4, () => A.whisper(p));
  after(6, () => { P.pose(11.93, 10.5, { track: true, crouch: .2, jaw: 1 }); G.flags.s3 = G.t; });
}
function s4() {
  A.spark([19, 1.1, 6.55]); arch = 1.4; tubesNear(17.2, 9.6, 1, 'dead'); P.hide(); P.on = false;
  after(.7, () => { let fx = -G.fwd.x, fz = -G.fwd.z; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; let x = 16.5, z = 8.5;
    find: for (const an of [0, .7, -.7, 1.4, -1.4]) for (const r of [1.3, 1.0]) { const c = Math.cos(an), sn = Math.sin(an), tx = G.head.x + (fx * c - fz * sn) * r, tz = G.head.z + (fx * sn + fz * c) * r; if (!solidCell(Math.floor(tx), Math.floor(tz)) && roomAt(tx, tz) === 'treat' && !W.solids.some(s => tx > s[0] - .25 && tx < s[2] + .25 && tz > s[1] - .25 && tz < s[3] + .25)) { x = tx; z = tz; break find; } }
    P.pose(x, z, { track: true }); G.flags.s4 = G.t; A.whisper([x, 1.6, z]); });
}
function s5() {
  P.hide(); P.on = false; after(.6, () => { bodyUp = 1; A.creak([7.7, 1, 6.7], true); A.thud([7.7, 1, 6.7]); tubesNear(5, 4.5, 6, 'dead'); A.spark([3.6, 2.7, 5.6]); });
  after(2, () => { P.pose(9.45, 2.5, { track: true, tilt: .35 }); G.flags.s5 = G.t; });
}
function kill() {
  if (G.mode !== 'play') return; G.mode = 'dead'; G.deaths++; P.mode = 'kill'; let fx = G.fwd.x, fz = G.fwd.z; const l = Math.hypot(fx, fz) || 1; P.x = G.head.x + fx / l * .6; P.z = G.head.z + fz / l * .6; P.opt = { jaw: 1 }; P.face(G.head.x, G.head.z); P.g.visible = true;
  A.scream(null); A.sting(1.3); G.shake = .9; after(.9, () => { HUD.fadeTo = 1; });
  after(2.6, () => { P.hide(); G.warp = { ...G.cp }; G.batt = Math.max(G.batt, .45); G.lightOn = true; G.mode = 'play'; HUD.fadeTo = 0; if (G.red) { G.flags.chase = false; P.on = false; } else { P.on = true; P.respawnAt = G.t + 16; } HUD.say(G.red ? 'RUN.' : 'Keep the light on him.', 4); });
}
function win() {
  G.mode = 'end'; A.stopAll(); A.slam(null); HUD.fadeTo = 1; P.hide(); P.on = false; const s = Math.round(G.t - G.t0), mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
  after(1.6, () => { HUD.read('YOU GOT OUT', 'The doors lock again behind you.\n\nThrough the glass, at the far end of the ward, one tube comes back on. He is standing under it.\n\nTime inside: ' + mm + ':' + ss + '\nTimes he reached you: ' + G.deaths, 'HOLLOW PINES'); G.ended = true; });
}
function use() {
  if (G.mode === 'read') { HUD.close(); G.mode = 'play'; return; }
  if (G.mode === 'play' && near) near.use();
}
function update(dt) {
  const hx = G.head.x, hz = G.head.z, room = roomAt(hx, hz), ap = G.aimPos || G.head, ad = G.aimDir || G.fwd; near = null;
  if (G.mode === 'play') { let best = .9;
    for (const it of inter) { const dh = Math.hypot(it.x - hx, it.z - hz); if (dh > it.r || !it.label()) continue; const dx = it.x - ap.x, dy = it.y - ap.y, dz = it.z - ap.z, d = Math.hypot(dx, dy, dz) || 1, c = (dx * ad.x + dy * ad.y + dz * ad.z) / d; if (c > best) { best = c; near = it; } } }
  HUD.prompt(near ? '[' + key() + ']  ' + near.label() : '');
  if (intro === 0 && G.mode === 'play') { intro = 1; G.t0 = G.t; HUD.say('23:52. Hollow Pines State Hospital. Your first night shift.', 5); after(5.5, () => HUD.say('The doors locked behind you. The power is out.', 5)); after(11, () => { if (!G.objective) obj('Try the front doors. Read the night log on the desk.'); }); }
  for (const d of W.doors) { const sp = d.fast ? 9 : 2.2, pa = d.a; d.a += Math.sign(d.t - d.a) * Math.min(Math.abs(d.t - d.a), dt * sp); if (pa > 0 && d.a === 0) { d.fast ? A.slam([d.px, 1.2, d.pz]) : A.thud([d.px, 1.2, d.pz]); d.fast = false; } d.shake = Math.max(0, d.shake - dt); d.pv.rotation.y = d.base + d.a * 1.75 + (d.shake ? Math.sin(G.t * 70) * d.shake * .08 : 0); }
  if (G.mode !== 'play') return;

  if (room === 'hall' && once('hall')) { after(.6, s1); obj('Find the boiler room fuse box.'); }
  if (room === 'hall' && hz > 13.4 && hz < 15.6 && G.flags.hall && hz < 15.6 && once('c8')) { const p = [11.5, 1.3, 14.5]; A.bang(p); door('cell8').shake = .4; after(.5, () => { A.bang(p); door('cell8').shake = .4; }); after(2, () => A.whisper(p)); }
  if (G.inv.key && room === 'lobby' && once('lob')) { tubesNear(15.5, 27, 1, 'dead'); A.spark([15.5, 2.7, 27]); after(1.5, () => A.bang([13.5, 1.5, 12], .5)); }
  if (room === 'day' && once('day')) after(.9, () => { G.flags.tv = true; D.tv.material = M.static; A.click([22.3, 1, 18.5]); });
  if (G.flags.tv) { staticFrame(true); A.tv(true); D.rocker.rotation.x = Math.sin(G.t * 1.6) * .14; if (Math.hypot(hx - 21.6, hz - 18.5) < 1.5) { G.flags.tv = false; D.tv.material = M.screenOff; A.tv(false); A.click([22.3, 1, 18.5]); after(.4, () => HUD.say('The chair is still warm.', 4)); } }
  if (room === 'treat' && once('treat')) after(1, () => { A.spark([19, 1.1, 6.55]); arch = .6; });
  const wc = D.wheelchair;
  if (G.flags.hall && !G.flags.f1x && room === 'hall' && hz < 18.5 && wc.position.z > hz + 2.4 && !looking(wc.position.x, wc.position.z, .25)) { wc.position.z -= dt * 1.1; wc.position.x += (13.5 - wc.position.x) * dt; wc.rotation.y += (Math.PI - wc.rotation.y) * dt * 2; wc.userData.wheels.forEach(w => { w.rotation.x -= dt * 3.6; }); if ((sqT -= dt) < 0) { sqT = .55; A.squeak([wc.position.x, .3, wc.position.z]); } }

  if (G.flags.s3 && !G.flags.s3x && (G.t - G.flags.s3 > 7 || (G.t - G.flags.s3 > .4 && looking(11.5, 10.5, .82)))) { G.flags.s3x = G.flags.f1x = true; A.sting(1); A.bang([11.5, 1.4, 10.5], .7); G.shake = .3;
    after(1.3, () => { G.lightCut = .55; P.hide(); }); after(2.6, () => { const d = door('cell9'); d.locked = false; d.t = 1; A.creak([11.5, 1.2, 10.5], true); cp(); P.stalk(13); HUD.say('He is out of his cell. Keep the light on him.', 5); }); }
  if (G.flags.s4 && !G.flags.s4x) { const seen = looking(P.x, P.z, .5) && G.t - G.flags.s4 > .3;
    if (seen || G.t - G.flags.s4 > 12) { G.flags.s4x = true; if (seen) { A.sting(1.2); A.scream([P.x, 1.6, P.z]); P.opt = { track: true, jaw: 1, reach: 1 }; G.shake = .5; } after(seen ? .9 : .1, () => { G.lightCut = .5; P.hide(); cp(); }); } }
  if (G.flags.s4x && room === 'hall' && P.mode === 'off' && once('s4b')) { P.pose(13.5, 21.4, { track: true }); after(1.5, () => { tubesNear(13.5, 21.5, 1, 'dead'); A.spark([13.5, 2.7, 21.5]); P.pose(13.5, 17.6, { track: true }); });
    after(3, () => { tubesNear(13.5, 17.5, 1, 'dead'); A.spark([13.5, 2.7, 17.5]); A.sting(.5); P.pose(13.5, 14.4, { track: true }); P.stalk(0); HUD.say('Every tube that fails brings him closer.', 5); }); }
  if (G.flags.s5 && !G.flags.s5x && (G.t - G.flags.s5 > 9 || (looking(P.x, P.z, .6) && G.t - G.flags.s5 > .3))) { G.flags.s5x = true; A.sting(1.1); P.opt = { track: true, jaw: 1, tilt: .35 }; G.shake = .4; after(1.1, () => { G.lightCut = .6; P.hide(); bodyUp = 0; A.thud([7.7, 1, 6.7]); cp(); P.stalk(9); }); }
  if (G.red && !G.flags.chase && hx < 28 && P.mode === 'off') { G.flags.chase = true; P.chase(Math.min(33, hx + 4.2), 2.5); A.scream([P.x, 1.6, P.z]); }
  if (G.red && room === 'hall' && hz < 16.5 && once('c8b')) { const d = door('cell8'); d.locked = false; d.t = 1; d.fast = false; d.a = .5; A.slam([11.5, 1.3, 14.5]); A.sting(.6); }

  const up = D.body.userData.up; up.rotation.x += ((bodyUp ? 1.25 : 0) - up.rotation.x) * Math.min(1, dt * (bodyUp ? 7 : 3));
  if (arch > 0) { arch -= dt; D.ectBody.position.y = .9 + Math.abs(Math.sin(G.t * 38)) * .12; D.lampM.color.setHex(Math.sin(G.t * 50) > 0 ? 0xfff2c0 : 0x1c1c18); G.fx = { x: 19, y: 2, z: 8, c: 0xcfe0ff, i: Math.sin(G.t * 50) > 0 ? 14 : 0 }; } else { D.ectBody.position.y = .9; D.lampM.color.setHex(0x1c1c18); if (G.fx && G.fx.x === 19) G.fx = null; }
  if (G.flags.drawer && drawerOpen < 1) { drawerOpen = Math.min(1, drawerOpen + dt * .9); D.drawer.position.x = D.drawer.userData.x0 + drawerOpen * 1.75; if (drawerOpen >= .9 && !D.fuse3.got) D.fuse3.mesh.visible = true; }
  if (leverT >= 0 && leverT < 1) { leverT = Math.min(1, leverT + dt * 5); D.lever.rotation.x = -.9 + leverT * 1.8; }
  G.surge = surge >= 0 ? (surge += dt) : -1;
  D.fire.color.setHex(Math.sin(G.t * 11) + Math.sin(G.t * 17.3) > .2 ? 0xff7a20 : 0xc24a10);
  if ((dripT -= dt) < 0) { dripT = 2.5 + Math.random() * 6; A.drip([hx + Math.random() * 10 - 5, 0, hz + Math.random() * 10 - 5]); }
  if ((bangT -= dt) < 0) { bangT = 35 + Math.random() * 50; if (!G.red) A.bang([hx + (Math.random() < .5 ? -14 : 14), 1, hz - 10], .25); }
  const pd = P.mode === 'off' ? 99 : P.dist(); A.heart(G.red ? Math.max(.55, 1 - pd / 12) : Math.max(0, 1 - pd / 11)); A.boiler(hx > 26 && hz < 10);
}
