// THE SPECKLED BAND: you are Sherlock Holmes. The page before you shows what Holmes does in the book; do it and the book runs as written, do otherwise and the others (worker/holmes.js) answer. On a screen and in a headset.
import * as T from 'three';
import { BAND } from './band.js';
import { PLACE, figure, SPOTS } from './stage.js';
import { AIR } from './air.js';

const $ = id => document.getElementById(id), { P, WHO, BEATS, CAST } = BAND, LAST = BEATS.length - 1;
const renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.xr.enabled = true; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.toneMapping = T.ACESFilmicToneMapping; document.body.prepend(renderer.domElement);
const scene = new T.Scene(), camera = new T.PerspectiveCamera(60, 1, .05, 400), rig = new T.Group(); rig.add(camera); scene.add(rig); camera.position.set(0, 1.6, 0);
const look = { yaw: 0, pitch: -.2 }; let inXR = false, t = 0;
const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fitPage(); };

// ---- the page: one canvas, drawn as a sheet; buttons are rects on it ----
const CW = 1400, CH = 1000, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d'), ptx = new T.CanvasTexture(cv); ptx.colorSpace = T.SRGBColorSpace; ptx.anisotropy = 8;
const page = new T.Mesh(new T.PlaneGeometry(1.4, 1), new T.MeshBasicMaterial({ map: ptx, fog: false, toneMapped: false })); page.renderOrder = 10;
const INK = '#1d1a14', PAPER = '#ece3cc', RED = '#7a1f1a', DIM = '#6f6550', SERIF = 'Georgia,"Times New Roman",serif';
const ui = { kind: '', head: '', lines: [], btns: [], big: '', field: '', hover: null, dirty: true };
function fitPage() { if (inXR) return; camera.add(page); const vh = 2 * Math.tan(camera.fov * Math.PI / 360), vw = vh * camera.aspect, w = Math.min(1.02, vw * .96), s = w / 1.4; page.scale.setScalar(s); page.rotation.set(0, 0, 0); page.position.set(0, -vh / 2 + s * .5 + .012, -1); }
function standPage() { scene.add(page); page.scale.setScalar(.78); page.position.set(0, 1.02, -.92); page.rotation.set(-.62, 0, 0); }
const wrap = (text, font, w) => { g.font = font; const out = []; for (const para of String(text).split('\n')) { let line = ''; for (const word of para.split(' ')) { const s = line ? line + ' ' + word : word; if (g.measureText(s).width > w && line) { out.push(line); line = word; } else line = s; } out.push(line); } return out; };
const btn = (id, label, x, y, w, h, o = {}) => ({ id, label, x, y, w, h, ...o });
function draw() {
  ui.dirty = false; g.fillStyle = PAPER; g.fillRect(0, 0, CW, CH); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(14, 14, CW - 28, CH - 28); g.lineWidth = 1.5; g.strokeRect(26, 26, CW - 52, CH - 52);
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = RED; g.font = `bold 27px ${SERIF}`; g.fillText(ui.head, 60, 72);
  g.textAlign = 'right'; g.fillStyle = DIM; g.font = `italic 25px ${SERIF}`; g.fillText(S.i < 0 ? 'off the book\'s road' : `step ${S.i + 1} of ${BEATS.length}${S.changed.length ? ', the story changed' : ', as written'}`, CW - 60, 72);
  g.fillStyle = INK; g.fillRect(60, 100, CW - 120, 2);
  g.textAlign = 'left';
  if (ui.kind === 'type') { g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(60, 124, CW - 120, 190); const ls = wrap(ui.field + (Math.floor(t * 2) % 2 ? '|' : ' '), `36px ${SERIF}`, CW - 170).slice(-4); g.fillStyle = INK; g.font = `36px ${SERIF}`; ls.forEach((l, i) => g.fillText(l, 84, 160 + i * 44)); if (!ui.field) { g.fillStyle = DIM; g.font = `italic 30px ${SERIF}`; g.fillText('Say it or do it, in your own words. A keyboard works too.', 110, 160); } }
  else { let y = ui.top || 150; for (const l of ui.lines) { g.font = l.font; g.fillStyle = l.col || INK; g.fillText(l.text, 64 + (l.x || 0), y); y += l.lh; } }
  for (const b of ui.btns) { const hot = ui.hover === b.id, dark = b.main ? !hot : hot; g.fillStyle = dark ? (hot ? RED : INK) : PAPER; g.fillRect(b.x, b.y, b.w, b.h); g.strokeStyle = INK; g.lineWidth = b.key ? 1.5 : 2.5; g.strokeRect(b.x, b.y, b.w, b.h);
    g.fillStyle = dark ? PAPER : INK; const f = b.key ? `34px ${SERIF}` : b.small ? `27px ${SERIF}` : `bold 28px ${SERIF}`, ls = b.wrap ? wrap(b.label, f, b.w - 50) : [b.label]; g.font = f; g.textAlign = b.wrap ? 'left' : 'center';
    ls.slice(0, 2).forEach((l, i) => g.fillText(l, b.wrap ? b.x + 26 : b.x + b.w / 2, b.y + b.h / 2 + (i - (Math.min(ls.length, 2) - 1) / 2) * 36)); g.textAlign = 'left'; }
  ptx.needsUpdate = true;
}
const hit = (x, y) => { for (const b of ui.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id; return null; };

// ---- the story's state ----
// i: the step now (-1 off the road); last: the last step on the road; changed: how this telling differs; log: what lately passed off the road; turns: times the others were asked
const S = { i: 0, last: 0, changed: [], log: [], place: 'baker', off: null, turns: 0, strayed: 0, begun: false };
let reading = null, voiceOn = true, busy = false, cur = null, people = {};
const TAGS = { H: 'holmes', W: 'watson', S: 'helen', R: 'roylott', D: 'other', N: 'tale' };
const canon = (a, b) => { const out = []; for (let n = a; n <= b; n++) out.push({ who: TAGS[WHO[n]], text: P[n] }); return out; };

function setPlace(id, cast, names = {}) { S.place = id; if (!cur || cur.id !== id) { drop(); if (cur) scene.remove(cur.g); cur = PLACE(id); scene.add(cur.g); scene.background = cur.bg; scene.fog = cur.fog || null; renderer.toneMappingExposure = cur.exposure || 1; AIR.set(cur.sound); }
  for (const k in people) people[k].removeFromParent(); people = {};
  cast.forEach(w => { const f = figure(w, names[w] || CAST[w].name), sp = (cur.spots && cur.spots[w]) || SPOTS[w] || SPOTS.other, u = f.userData; f.position.set(sp[0], 0, sp[1]); u.sit = sp[2] === 'sit'; if (u.sit) { f.rotation.y = sp[3] || 0; u.person.play('Sitting', true, 0); } else f.lookAt(0, 0, 0); people[w] = f; cur.g.add(f); }); }

// read blocks ({who, name, text}) a page at a time, then go on
function read(blocks, head, then) { const pages = []; let pg = { lines: [], who: new Set(), say: [] }; const LH = 49, MAX = 15, F = `37px ${SERIF}`;
  const push = () => { if (pg.lines.length) pages.push(pg); pg = { lines: [], who: new Set(), say: [] }; };
  for (const b of blocks) { const ls = wrap(b.text, F, CW - 130), lab = b.name ? 1 : 0; let k = 0;
    while (k < ls.length) { if (pg.lines.length + lab + 1 > MAX) push(); if (pg.lines.length) pg.lines.push({ text: '', font: F, lh: 20 }); if (lab && k === 0) pg.lines.push({ text: b.name.toUpperCase(), font: `bold 25px ${SERIF}`, col: RED, lh: 40 });
      const room = MAX - pg.lines.length, part = ls.slice(k, k + room); part.forEach(l => pg.lines.push({ text: l, font: F, lh: LH })); pg.who.add(b.who); pg.say.push({ who: b.who, text: part.join(' ') }); k += part.length; if (k < ls.length) push(); } }
  push(); reading = { pages, n: 0, head, then }; showPage(); }
function showPage() { const R = reading, pg = R.pages[R.n]; ui.kind = 'read'; ui.head = R.head; ui.lines = pg.lines; ui.top = 150;
  ui.btns = [btn('next', R.n < R.pages.length - 1 ? `ON  (${R.n + 1} of ${R.pages.length})` : 'ON', CW - 60 - 420, 880, 420, 82, { main: true }), btn('voice', voiceOn ? 'VOICE ON' : 'VOICE OFF', 60, 880, 230, 82, { small: true })];
  if (R.n > 0) ui.btns.push(btn('back', 'BACK', 310, 880, 180, 82, { small: true }));
  for (const k in people) people[k].userData.speaks = pg.who.has(k); ui.dirty = true; speak(pg.say); }

function choose() { reading = null; const B = S.i >= 0 ? BEATS[S.i] : null, sum = B ? B.sum : S.off.would, alts = (B ? B.alts : S.off.others) || [];
  ui.kind = 'choose'; ui.head = B ? 'IN THE BOOK, HOLMES NOW' : 'THE BOOK IS BEHIND YOU. HOLMES WOULD NOW'; ui.top = 160;
  ui.lines = wrap(sum, `italic 40px ${SERIF}`, CW - 140).map(l => ({ text: l, font: `italic 40px ${SERIF}`, lh: 54 }));
  let y = 462; ui.btns = [btn('book', B ? 'DO AS THE BOOK DOES' : 'DO THAT', 60, y, CW - 120, 96, { main: true })];
  alts.forEach((a, n) => { y += 110; ui.btns.push(btn('alt' + n, a, 60, y, CW - 120, 96, { wrap: true, small: true })); });
  y += 110; if (canHear) { ui.btns.push(btn('own', 'TYPE SOMETHING ELSE', 60, y, (CW - 140) / 2, 96, { small: true }), btn('say', 'SAY IT ALOUD', 60 + (CW - 140) / 2 + 20, y, (CW - 140) / 2, 96, { small: true })); } else ui.btns.push(btn('own', 'SOMETHING ELSE, IN YOUR OWN WORDS', 60, y, CW - 120, 96, { small: true }));
  for (const k in people) people[k].userData.speaks = false; ui.dirty = true; hush(); }

// ---- your own voice: the browser's own recognition where it has one, else a recording sent to the worker (POST /holmes/hear) ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition, canRec = !!(navigator.mediaDevices && window.MediaRecorder), canHear = !!(SR || canRec); let ear = null;
function listen() { hush(); AIR.duck(true); ui.kind = 'listen'; ui.head = 'LISTENING'; ui.top = 300; ui.field = ''; const F = `italic 40px ${SERIF}`, show = (a, b) => { ui.lines = [...wrap(a, F, CW - 160), '', ...wrap(b || '', `40px ${SERIF}`, CW - 160)].map(l => ({ text: l, font: l && b && !a.includes(l) ? `40px ${SERIF}` : F, lh: 56, x: 16 })); ui.dirty = true; };
  ui.btns = [btn('cancel', 'BACK', 60, 860, 260, 96, { small: true }), btn('heard', 'THAT IS WHAT I SAID', CW - 60 - 560, 860, 560, 96, { main: true })]; show('Say what Holmes says or does.', '');
  const done = text => { stopEar(); ui.field = (text || ui.field || '').trim().slice(0, 400); typing(); };
  if (SR) { const r = new SR(); r.lang = 'en-GB'; r.interimResults = true; r.continuous = true; let fin = ''; r.onresult = e => { let live = ''; for (let i = e.resultIndex; i < e.results.length; i++) (e.results[i].isFinal ? (fin += e.results[i][0].transcript + ' ') : (live += e.results[i][0].transcript)); ui.field = (fin + live).trim(); show('Say what Holmes says or does.', ui.field); };
    r.onerror = e => { if (ui.kind === 'listen' && e.error !== 'no-speech' && e.error !== 'aborted') { stopEar(); note('Your voice could not be heard (' + e.error + '). Allow the microphone for this page, or type it.', typing); } }; ear = { stop: () => { try { r.stop(); } catch (e) {} }, done: () => done() }; try { r.start(); } catch (e) {} }
  else navigator.mediaDevices.getUserMedia({ audio: true }).then(st => { if (ui.kind !== 'listen') return st.getTracks().forEach(x => x.stop()); const rec = new MediaRecorder(st), parts = []; rec.ondataavailable = e => parts.push(e.data); rec.start();
    ear = { stop: () => { try { rec.stop(); } catch (e) {} st.getTracks().forEach(x => x.stop()); }, done: () => { rec.onstop = async () => { busy = true; show('Writing down what you said.', ''); let R; try { R = await (await fetch('/holmes/hear', { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: new Blob(parts, { type: rec.mimeType }) })).json(); } catch (e) { R = { why: 'the worker could not be reached' }; } busy = false; if (R && R.text) done(R.text); else note('Your voice could not be written down: ' + ((R && R.why) || 'no answer') + '. Type it instead.', typing); }; ear.stop(); } }; }).catch(() => note('The microphone is not allowed for this page. Type it instead.', typing)); }
function stopEar() { AIR.duck(false); if (ear) { const e = ear; ear = null; e.stop(); } }

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL\'', 'ZXCVBNM,.?'];
function typing() { ui.kind = 'type'; ui.head = 'WHAT DOES HOLMES SAY OR DO?'; ui.lines = []; ui.btns = [];
  ROWS.forEach((r, j) => [...r].forEach((c, k) => ui.btns.push(btn('k' + c, c, 60 + k * 128, 340 + j * 118, 120, 108, { key: true }))));
  if (canHear) ui.btns.push(btn('say', 'SAY IT AGAIN', 60, 830, 360, 96, { small: true })); ui.btns.push(btn('cancel', 'BACK', 60, 700, 220, 108, { small: true }), btn('k ', 'SPACE', 300, 700, 560, 108, { small: true }), btn('del', 'RUB OUT', 880, 700, 220, 108, { small: true }), btn('done', 'DO IT', 1120, 700, 220, 108, { main: true })); ui.dirty = true; }
function note(text, then) { ui.kind = 'note'; ui.head = 'A WORD'; ui.top = 190; ui.lines = wrap(text, `38px ${SERIF}`, CW - 140).map(l => ({ text: l, font: `38px ${SERIF}`, lh: 52 })); ui.btns = [btn('ok', 'BACK TO THE STORY', CW / 2 - 260, 860, 520, 90, { main: true })]; reading = null; note.then = then; ui.dirty = true; }
function wait() { ui.kind = 'wait'; ui.head = 'A MOMENT'; ui.top = 420; ui.lines = [{ text: 'The others consider what you have done.', font: `italic 44px ${SERIF}`, lh: 60, x: 250 }]; ui.btns = []; ui.dirty = true; }
function end(e) { S.ended = true; hush(); const F = `36px ${SERIF}`; ui.kind = 'end'; ui.head = 'THE END'; ui.top = 170;
  ui.lines = [{ text: e.title.toUpperCase(), font: `bold 52px ${SERIF}`, col: RED, lh: 90 }, ...wrap(e.text, F, CW - 140).slice(0, 12).map(l => ({ text: l, font: F, lh: 48 }))];
  ui.btns = [btn('again', 'BEGIN AGAIN', CW / 2 - 220, 870, 440, 86, { main: true })]; ui.dirty = true; speak([{ who: 'tale', text: e.text }]); }

// come to step i: its lead-in first when the book has run as written (a turn's own telling has already carried the story here)
function arrive(i, told) { S.i = i; S.last = i; S.off = null; const B = BEATS[i]; setPlace(told ? S.place : B.place, B.cast);
  if (B.pre && !told) read(canon(B.pre[0], B.pre[1]), i ? 'DR WATSON\'S ACCOUNT' : 'THE ADVENTURE OF THE SPECKLED BAND', choose); else choose(); }
const asWritten = () => ({ title: 'As it was written', text: S.strayed ? `So the case of the speckled band ended as Dr Watson set it down, though you left his road ${S.strayed === 1 ? 'once' : S.strayed + ' times'} along the way and found it again.` : 'So the case of the speckled band ended, exactly as Dr Watson set it down: at every step you did as Mr Sherlock Holmes did.' });

async function act(did) { if (busy) return; const B = S.i >= 0 ? BEATS[S.i] : null, own = did || (B ? '' : S.off.would);
  if (!own && B && !S.changed.length) return read(canon(B.from, B.to), 'AS THE BOOK HAS IT', () => S.i === LAST ? end(asWritten()) : arrive(S.i + 1, false));
  busy = true; wait(); let R;
  try { const r = await fetch('/holmes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ i: S.i, last: S.last, did: own, changed: S.changed, log: S.log, place: S.place }) }); R = await r.json(); } catch (e) { R = { why: 'the others could not be reached' }; }
  busy = false;
  if (!R || R.why || !R.tale) return note(R && R.why === 'login' ? 'The others answer only a tenant of the market. Log in at thestrangestfleamarket.com, then come back to this page. The book\'s own road is open to anyone.' : 'The others cannot answer just now: ' + ((R && R.why) || 'no answer') + '.', choose);
  S.turns++; if (own && B && !S.changed.length) S.strayed++;
  const seen = [...new Set([...(B ? B.cast : []), ...R.said.map(s => s.who)])], names = {}; R.said.forEach(s => names[s.who] = s.name);
  S.log = [...S.log, { did: own || B.sum, tale: R.tale, said: R.said.map(s => ({ name: s.name, say: s.say })), seen }].slice(-8); S.changed = R.changed || [];
  const cast = [...new Set([...(R.next >= 0 ? BEATS[R.next].cast : []), ...R.said.map(s => s.who)])]; setPlace(R.place, cast.length ? cast : ['watson'], names);
  read([{ who: 'tale', text: R.tale }, ...R.said.map(s => ({ who: s.who, name: s.name, text: s.say }))], 'WHAT CAME OF IT', () => {
    if (R.end) return end(R.end); if (R.next >= 0) return arrive(R.next, true);
    S.i = -1; S.off = { would: R.would || 'Take stock, and decide what is to be done.', others: R.others || [] }; choose(); });
}
function begin() { Object.assign(S, { i: 0, last: 0, changed: [], log: [], off: null, turns: 0, strayed: 0, ended: false, begun: true }); arrive(0, false); }

function press(id) { if (!id || busy) return;
  if (ui.kind === 'read') { const R = reading; if (id === 'voice') { voiceOn = !voiceOn; if (!voiceOn) hush(); showPage(); } else if (id === 'back' && R.n > 0) { R.n--; showPage(); } else if (id === 'next') { if (R.n < R.pages.length - 1) { R.n++; showPage(); } else { reading = null; hush(); R.then(); } } }
  else if (ui.kind === 'choose') { if (id === 'book') act(''); else if (id === 'own') { ui.field = ''; typing(); } else if (id === 'say') listen(); else if (id.startsWith('alt')) act(ui.btns.find(b => b.id === id).label); }
  else if (ui.kind === 'type') { if (id === 'cancel') choose(); else if (id === 'say') listen(); else if (id === 'del') { ui.field = ui.field.slice(0, -1); ui.dirty = true; } else if (id === 'done') { if (ui.field.trim()) act(ui.field.trim()); } else if (id[0] === 'k' && id.length === 2 && ui.field.length < 400) { const c = id.slice(1); ui.field += ui.field && !/[.?!] $/.test(ui.field) ? c.toLowerCase() : c; ui.dirty = true; } }
  else if (ui.kind === 'listen') { if (id === 'cancel') { stopEar(); choose(); } else if (id === 'heard' && ear) ear.done(); }
  else if (ui.kind === 'note') note.then();
  else if (ui.kind === 'end' && id === 'again') begin(); }

// ---- voices: the browser's own, a pitch a person ----
const SY = () => window.speechSynthesis; let voice = null;
const hush = () => { try { SY() && SY().cancel(); } catch (e) {} };
function speak(parts) { const sy = SY(); if (!sy || !voiceOn || !window.SpeechSynthesisUtterance) return; hush();
  if (!voice) { const vs = sy.getVoices ? sy.getVoices() : []; voice = vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; }
  for (const p of parts) { const u = new SpeechSynthesisUtterance(p.text), c = CAST[p.who]; if (voice) u.voice = voice; u.lang = 'en-GB'; u.pitch = c ? c.pitch : p.who === 'holmes' ? 1.05 : .9; u.rate = c ? c.rate : 1; try { sy.speak(u); } catch (e) {} } }

// ---- holding loose things: a ray picks one, it follows the hand, and flies when let go ----
let held = null; const hv = new T.Vector3(), hp2 = new T.Vector3();
const pick = () => { if (!cur) return null; const h = ray.intersectObjects(cur.things.map(x => x.piv), true)[0]; if (h && h.distance < 7) { let o = h.object; while (o && !o.userData.thing) o = o.parent; if (o) return { th: o.userData.thing, d: h.distance }; }
  const r = cur.tugs && ray.intersectObjects(cur.tugs, false)[0]; if (r) r.object.userData.tug(); return null; };
const grab = (th, from) => { held = { th, from }; th.body.wakeUp(); th.body.angularDamping = .95; };
function drop() { if (held) { held.th.body.angularDamping = .4; held = null; } }
function holdStep(dt) { if (!held) return; const b = held.th.body; held.from(hp2); hv.copy(hp2).sub(b.position).multiplyScalar(14); if (hv.length() > 9) hv.setLength(9); b.velocity.set(hv.x, hv.y, hv.z); }

// ---- hands, mouse, keys ----
const ray = new T.Raycaster(), v2 = new T.Vector2(), m4 = new T.Matrix4();
const at = () => { const h = ray.intersectObject(page)[0]; return h && h.uv ? hit(h.uv.x * CW, (1 - h.uv.y) * CH) : null; };
const mouseAt = e => { v2.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v2, camera); return { on: !!ray.intersectObject(page)[0], id: at() }; };
let drag = null;
const hover = id => { if (id !== ui.hover) { ui.hover = id; ui.dirty = true; renderer.domElement.style.cursor = id ? 'pointer' : ''; } };
renderer.domElement.addEventListener('pointerdown', e => { if (!S.begun || inXR) return; AIR.start(); const m = mouseAt(e); if (m.on) return press(m.id); const p = pick(); if (p) { const d = Math.min(p.d, 1.1) ; grab(p.th, v => { ray.setFromCamera(v2, camera); v.copy(ray.ray.origin).addScaledVector(ray.ray.direction, d); }); } else drag = { x: e.clientX, y: e.clientY }; });
addEventListener('pointermove', e => { if (!S.begun || inXR) return; if (held) { v2.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); return; } if (drag) { look.yaw -= (e.clientX - drag.x) * .004; look.pitch = Math.max(-1, Math.min(.7, look.pitch - (e.clientY - drag.y) * .004)); drag = { x: e.clientX, y: e.clientY }; } else hover(mouseAt(e).id); });
addEventListener('pointerup', () => { drag = null; drop(); });
addEventListener('keydown', e => { if (!S.begun || e.metaKey || e.ctrlKey) return;
  if (ui.kind === 'type') { if (e.key === 'Enter') press('done'); else if (e.key === 'Escape') press('cancel'); else if (e.key === 'Backspace') press('del'); else if (e.key.length === 1 && ui.field.length < 400) { ui.field += e.key; ui.dirty = true; } e.preventDefault(); return; }
  if (e.key === 'Enter' || e.key === ' ') press(ui.kind === 'read' ? 'next' : ui.kind === 'note' ? 'ok' : ui.kind === 'end' ? 'again' : null);
  else if (ui.kind === 'choose' && e.key >= '1' && e.key <= '5') { const b = ui.btns[+e.key - 1]; if (b) press(b.id); } else if (e.key === 'ArrowLeft') press('back'); });
const hands = [0, 1].map(n => { const c = renderer.xr.getController(n); rig.add(c);
  const line = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3(0, 0, -1)]), new T.LineBasicMaterial({ color: 0xece3cc, transparent: true, opacity: .7, fog: false })); line.scale.z = 1.6; line.visible = false; c.add(line);
  c.addEventListener('connected', () => line.visible = true); c.addEventListener('disconnected', () => line.visible = false);
  const aim = () => { m4.identity().extractRotation(c.matrixWorld); ray.ray.origin.setFromMatrixPosition(c.matrixWorld); ray.ray.direction.set(0, 0, -1).applyMatrix4(m4); return at(); };
  c.addEventListener('selectstart', () => { if (!S.begun) return; AIR.start(); const id = aim(); if (id) press(id); else if (!ray.intersectObject(page)[0]) pick(); });
  c.addEventListener('squeezestart', () => { if (!S.begun) return; aim(); const p = pick(); if (p) grab(p.th, v => { c.getWorldPosition(v); m4.identity().extractRotation(c.matrixWorld); v.add(hv.set(0, 0, -.12).applyMatrix4(m4)); }); }); c.addEventListener('squeezeend', drop); return { c, aim, line }; });

// ---- going in ----
let vrOk = false; if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then(ok => vrOk = ok).catch(() => {});
function start() { AIR.start(); $('title').hidden = true; if (!S.begun) begin(); }
$('play').onclick = start;
$('vr').onclick = async () => { const no = m => { $('vrmsg').textContent = m; $('vrmsg').hidden = false; };
  if (!navigator.xr || !(vrOk || await navigator.xr.isSessionSupported('immersive-vr').catch(() => false))) return no('No headset found by this browser. Put the headset on and open this same address in its browser.');
  try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }); renderer.xr.setReferenceSpaceType('local-floor'); await renderer.xr.setSession(s);
    inXR = true; camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0); standPage(); start();
    s.addEventListener('end', () => { inXR = false; camera.position.set(0, 1.6, 0); fitPage(); ui.dirty = true; }); } catch (e) { no('The headset would not start: ' + (e && e.message || e)); } };

addEventListener('resize', () => { if (!renderer.xr.isPresenting) size(); }); size();
const eye = new T.Vector3();
setPlace('baker', []); const clock = new T.Clock(); let blink = 0;
renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), .1); t += dt;
  if (!inXR) camera.rotation.set(look.pitch, look.yaw, 0, 'YXZ'); else { let h = null; for (const k of hands) if (k.line.visible) h = h || k.aim(); hover(h); }
  if (cur) { for (const f of cur.ticks) f(t, dt); cur.world.step(1 / 60, dt, 3); holdStep(dt);
    for (const th of cur.things) { const b = th.body; if (b.position.y < -3) { b.position.set(...th.home); b.velocity.set(0, 0, 0); b.angularVelocity.set(0, 0, 0); } th.piv.position.copy(b.position); th.piv.quaternion.copy(b.quaternion); } }
  camera.getWorldPosition(eye); let talker = null; for (const k in people) if (people[k].userData.speaks) talker = people[k];
  for (const k in people) { const f = people[k], u = f.userData, p = u.person, sp = u.speaks; if (sp !== u.was) { u.was = sp; p.play(u.sit ? (sp ? 'Sitting talking' : 'Sitting') : (sp ? 'Talking' : 'Idle')); p.speaking(sp); u.glance = 0; }
    u.glance = (u.glance || 0) - dt; if (u.glance < -5) u.glance = 1.2 + Math.random();   // a listener watches whoever speaks, with a glance at you now and then
    p.update(dt, talker && talker !== f && !(u.glance > 0) ? talker.userData.person.head : eye); u.lift = (u.lift || 0) + ((sp ? 1 : 0) - (u.lift || 0)) * Math.min(1, dt * 5); u.plate.material.opacity = .25 + .75 * u.lift; }
  AIR.tick(t, dt);
  if (ui.kind === 'type' && Math.floor(t * 2) !== blink) { blink = Math.floor(t * 2); ui.dirty = true; }
  if (ui.dirty && S.begun) draw();
  page.visible = S.begun; renderer.render(scene, camera); });

const aimAt = (id, from) => { const b = ui.btns.find(x => x.id === id); if (!b) return null; page.updateWorldMatrix(true, false); const to = new T.Vector3((b.x + b.w / 2) / CW * 1.4 - .7, .5 - (b.y + b.h / 2) / CH, 0).applyMatrix4(page.matrixWorld), p = new T.Vector3(...from); return new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, -1), to.sub(p).normalize()).toArray(); };
window.__holmes = { S, ui, press, act, aimAt, xr: () => inXR && renderer.xr.isPresenting, pageAt: () => page.getWorldPosition(new T.Vector3()).toArray(), type: s => { ui.field = s; ui.dirty = true; }, text: () => ui.lines.map(l => l.text).join(' ').replace(/\s+/g, ' ').trim(), people: () => Object.keys(people), things: () => cur.things.map(x => ({ name: x.name, y: x.body.position.y, x: x.body.position.x, z: x.body.position.z })), person: k => { const p = people[k].userData.person; return { clip: p.clip(), head: p.head.toArray() }; }, hold: n => { const th = cur.things.find(x => x.name === n); if (th) grab(th, v => v.set(0, 1.5, -.8)); return !!th; }, drop, canHear, place: () => cur && cur.id, reading: () => reading && { n: reading.n, of: reading.pages.length } };
