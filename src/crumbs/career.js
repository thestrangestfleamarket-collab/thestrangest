// Content tables: the 30 career nights, Daily Night, Long Night, modifiers, upgrades, tutorial hints.
'use strict';
(function () {
const { V3 } = MC, G = MC.game, W = MC.world, C = MC.cook, PL = MC.player, P = MC.phys;
const A_ALL = ['toast', 'char', 'roast', 'soup', 'cheesetoast', 'cheeseplate', 'mashtoast', 'soupcrouton', 'cheesypeas', 'fondue', 'gratin'];
const B_ALL = A_ALL.concat(['noodles', 'mac']), C_ALL = B_ALL.concat(['eggtoast']);
MC.HOME_RECIPES = [A_ALL, B_ALL, C_ALL];
const R_A = ['bo', 'buzz', 'dot', 'web', 'moth', 'fidd', 'rollo', 'pinch', 'antony', 'lumen', 'joe'];
const N = (home, title, recipes, count, need, len, o = {}) => Object.assign({ home, title, recipes, count, need, len }, o);
const ev = (...a) => { const out = []; for (let i = 0; i < a.length; i += 2) out.push({ type: a[i], at: a[i + 1] }); return out; };
const NIGHTS = MC.NIGHTS = [
  N(0, 'First Shift', ['toast'], 3, 2, 210, { regulars: ['bo', 'buzz', 'dot'], tutorial: 'toast', patMul: 1.7 }),
  N(0, 'Double Toasted', ['toast', 'char'], 4, 3, 240, { regulars: R_A.slice(0, 5), tutorial: 'char', patMul: 1.3 }),
  N(0, 'Pan Handling', ['toast', 'char', 'roast'], 5, 3, 270, { regulars: R_A.slice(0, 6), tutorial: 'pan', patMul: 1.2 }),
  N(0, 'The Cheese Run', ['toast', 'roast', 'cheesetoast'], 5, 3, 300, { regulars: R_A.slice(0, 7), tutorial: 'cheese', patMul: 1.2 }),
  N(0, "Soup's On", ['toast', 'char', 'roast', 'soup', 'cheesetoast'], 6, 3, 300, { regulars: R_A.slice(0, 8), tutorial: 'pot', events: ev('snacker', 0.55) }),
  N(0, 'Sharp Work', ['toast', 'roast', 'soup', 'mashtoast', 'cheeseplate'], 6, 4, 330, { regulars: R_A.slice(0, 9), tutorial: 'blade' }),
  N(0, 'High Wire', ['toast', 'char', 'soup', 'cheesetoast', 'soupcrouton', 'cheesypeas'], 7, 4, 360, { regulars: R_A.slice(0, 10), tutorial: 'floss', floss: true, mods: ['lightsleeper'], events: ev('snacker', 0.62) }),
  N(0, 'The Critic', ['toast', 'char', 'roast', 'soup', 'cheesetoast', 'mashtoast', 'cheesypeas'], 7, 4, 360, { regulars: R_A, vip: 'feast', events: ev('storm', 0.25, 'snacker', 0.62) }),
  N(0, 'Rush Hour', A_ALL.slice(0, 9), 9, 5, 360, { regulars: R_A, mods: ['rush'], events: ev('snacker', 0.4, 'ants', 0.7) }),
  N(0, 'Dinner Party', A_ALL, 9, 5, 420, { regulars: R_A, mods: ['party'], vip: 'feast', events: ev('storm', 0.22, 'snacker', 0.6) }),
  N(1, 'New Kitchen', ['toast', 'roast', 'noodles', 'cheesetoast'], 6, 4, 330, { tutorial: 'noodle', events: ev('cat', 0.5) }),
  N(1, 'Mouse & Cheese', ['toast', 'soup', 'noodles', 'mac', 'cheesetoast'], 7, 4, 360, { events: ev('phone', 0.4) }),
  N(1, 'Fondue Night', ['toast', 'char', 'noodles', 'mac', 'fondue', 'cheesypeas'], 7, 4, 360, { patMul: 1.2, mods: ['cold'], events: ev('cat', 0.55) }),
  N(1, 'Blackout', ['toast', 'roast', 'soup', 'noodles', 'cheesetoast', 'mashtoast'], 7, 4, 360, { events: ev('outage', 0.3, 'snacker', 0.36) }),   // a snacker with a torch, in the dark
  N(1, 'Rainy Night', ['toast', 'char', 'soup', 'mac', 'cheeseplate', 'soupcrouton'], 8, 5, 390, { mods: ['rainy'], events: ev('storm', 0.3, 'cat', 0.36) }),   // the cat prowls while lightning lights you up
  N(1, 'Gratin Royale', ['toast', 'roast', 'noodles', 'fondue', 'cheesypeas', 'mashtoast'], 8, 5, 390, { vip: 'gratin', events: ev('cat', 0.35, 'snacker', 0.7) }),
  N(1, 'Sticky Situation', B_ALL.slice(0, 10), 8, 5, 390, { mods: ['sticky'], events: ev('phone', 0.3, 'snacker', 0.6, 'ants', 0.82) }),
  N(1, 'Full Moon', B_ALL.slice(2), 9, 5, 390, { mods: ['fullmoon', 'rush'], events: ev('cat', 0.3, 'cat', 0.7) }),
  N(1, 'Light Sleepers', B_ALL, 9, 6, 420, { mods: ['lightsleeper', 'crumbs'], vip: 'mac', events: ev('phone', 0.25, 'snacker', 0.55) }),
  N(1, 'Family Feast', B_ALL, 10, 6, 450, { mods: ['party'], vip: 'feast', events: ev('cat', 0.25, 'outage', 0.5, 'snacker', 0.78) }),
  N(2, 'The Bakery', ['toast', 'roast', 'soup', 'eggtoast'], 7, 4, 360, { tutorial: 'egg', events: ev('ants', 0.5) }),
  N(2, 'Sunny Side', ['toast', 'char', 'noodles', 'cheesetoast', 'eggtoast', 'mac'], 8, 5, 390, { events: ev('snacker', 0.5) }),
  N(2, 'Ant Season', ['toast', 'roast', 'soup', 'eggtoast', 'cheesypeas', 'mashtoast'], 8, 5, 390, { mods: ['crumbs'], events: ev('ants', 0.25, 'ants', 0.65) }),
  N(2, 'Cold Snap', C_ALL.slice(0, 9).concat(['eggtoast']), 8, 4, 420, { patMul: 1.25, mods: ['cold', 'lightsleeper'], vip: 'eggtoast', events: ev('cat', 0.5) }),
  N(2, 'Thunder Bake', C_ALL.slice(2), 9, 5, 420, { events: ev('storm', 0.18, 'cat', 0.24, 'outage', 0.48, 'snacker', 0.54, 'storm', 0.75) }),
  N(2, 'Slippery Slope', C_ALL, 9, 4, 420, { patMul: 1.25, mods: ['rainy', 'sticky'], events: ev('phone', 0.3, 'cat', 0.6) }),
  N(2, "Critic's Return", C_ALL, 10, 5, 450, { mods: ['rush'], vip: 'gratin', events: ev('ants', 0.3, 'snacker', 0.62) }),
  N(2, 'Full House', C_ALL, 10, 5, 450, { mods: ['party', 'fullmoon'], events: ev('cat', 0.2, 'phone', 0.45, 'snacker', 0.72) }),
  N(2, 'The Long Dark', C_ALL, 10, 6, 450, { mods: ['lightsleeper'], vip: 'feast', events: ev('outage', 0.15, 'cat', 0.42, 'ants', 0.7) }),
  N(2, 'Grand Opening', C_ALL, 12, 6, 540, { patMul: 1.2, mods: ['party', 'rush'], vip: 'feast', events: ev('storm', 0.15, 'cat', 0.36, 'snacker', 0.58, 'ants', 0.78) }),
];
// tip targets for 2 stars, calibrated at half of what the scripted test player earns on each night
MC.TARGETS = [10, 15, 20, 20, 30, 25, 45, 70, 75, 80, 35, 40, 45, 40, 35, 90, 60, 85, 85, 100, 35, 40, 50, 50, 80, 60, 55, 60, 80, 90];
MC.MODS = {
  rainy: { name: 'Rainy night', desc: 'The counter is slick: you slide.' }, party: { name: 'Dinner party leftovers', desc: 'Extra ingredients lying around, but guests are less patient.' },
  sticky: { name: 'Sticky spills', desc: 'Jam puddles slow you down and stop you hopping.' }, fullmoon: { name: 'Full moon', desc: 'Bright moonlight: easier to see, easier to be seen.' },
  cold: { name: 'Cold night', desc: 'Everything cooks slower.' }, rush: { name: 'Rush hour', desc: 'A bigger crowd that tips better.' },
  lightsleeper: { name: 'Light sleepers', desc: 'The noise meter fills faster.' }, crumbs: { name: 'Crumbs everywhere', desc: 'Loose crumbs all over the counter.' },
};
MC.EVENTS = { snacker: 'Midnight snacker', cat: 'Prowling cat', outage: 'Power cut', storm: 'Thunderstorm', phone: 'Buzzing phone', ants: 'Ant raid' };
MC.SHOP = [
  { id: 'floss', after: 7, name: 'Dental floss kit', cost: 40, desc: 'String ziplines between pushpins on any night.' },
  { id: 'pack', name: 'Second pocket', cost: 60, desc: 'One more pocket in your backpack.' },
  { id: 'paws', name: 'Soft paws', cost: 50, desc: 'Things you drop or bump make less noise.' },
  { id: 'timer', after: 3, name: 'Egg timer', cost: 35, desc: 'The pan ticks loudly before food burns.' },
  { id: 'lantern', name: 'Pub lantern', cost: 30, desc: 'A warm lantern over the bar. Cosy, and easier to see.' },
  // diner decor: cosmetic only, unlocked by career stars, bought with tips
  { id: 'bunting', look: true, stars: 20, name: 'Bunting', cost: 150, desc: 'Little paper flags strung over the bar.' },
  { id: 'cloth', look: true, stars: 35, name: 'Gingham tablecloth', cost: 250, desc: 'A checked cloth on the counter, like a proper pub.' },
  { id: 'gold', look: true, stars: 50, name: 'Golden bottle-cap plates', cost: 400, desc: 'Serve in style.' },
  { id: 'jar', look: true, stars: 65, name: 'Firefly jar', cost: 600, desc: 'A thimble lantern of glowing fireflies for the bar.' },
  { id: 'sign', look: true, stars: 80, name: 'Neon sign', cost: 900, desc: 'MIDNIGHT CRUMBS in buzzing neon. Fully earned.' },
];
MC.careerStars = () => MC.NIGHTS.reduce((a, n, i) => a + (MC.save.stars['c' + i] || 0), 0);
// upgrades you own can be switched off; all are off in Daily Night so scores compare
MC.up = id => !!MC.save.upgrades[id] && !(MC.save.upgOff || {})[id] && !(MC.game.cfg && MC.game.cfg.daily);
function prep(cfg) {
  const c = Object.assign({ regulars: Object.keys(MC.REGULARS), events: [], mods: [] }, cfg), m = c.mods;
  c.patMul = (c.patMul || 1) * (m.indexOf('party') >= 0 ? 0.85 : 1); c.tipMul = m.indexOf('rush') >= 0 ? 1.25 : 1; c.noiseMul = m.indexOf('lightsleeper') >= 0 ? 1.5 : 1; c.spotMul = m.indexOf('fullmoon') >= 0 ? 1.4 : 1;
  return c;
}
const target = c => Math.max(10, Math.round(0.45 * G.potential(c) / 5) * 5);   // ★★ = 45% of what the night could pay at an ordinary pace
MC.cfgCareer = function (i) { const n = NIGHTS[i], c = prep(Object.assign({}, n, { id: 'c' + i, career: i, seed: 101 + i * 7, title: 'Night ' + (i + 1) + ': ' + n.title })); c.target = target(c); return c; };
MC.dailyKey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
MC.cfgDaily = function (key) {
  key = key || MC.dailyKey(); const seed = MC.hashStr('daily' + key), r = MC.rng(seed), home = Math.floor(r() * 3), all = MC.HOME_RECIPES[home].slice(), recipes = ['toast'], nRec = 5 + Math.floor(r() * 4);
  while (recipes.length < nRec) { const k = MC.pick(r, all); if (recipes.indexOf(k) < 0) recipes.push(k); }
  const evs = Object.keys(MC.EVENTS), mods = Object.keys(MC.MODS), e1 = MC.pick(r, evs), e2 = MC.pick(r, evs.filter(x => x !== e1)), m1 = MC.pick(r, mods), multi = recipes.filter(k => MC.RECIPES[k].parts.length > 1);
  const mods2 = r() < 0.5 ? [m1] : [m1, MC.pick(r, mods.filter(x => x !== m1))];
  // the format itself varies by day: crowd size, length, how many events, VIP or not
  const count = 8 + Math.floor(r() * 5), len = 360 + Math.floor(r() * 4) * 40, nEv = 1 + Math.floor(r() * 3), evAt = [[0.45], [0.3, 0.66], [0.22, 0.48, 0.74]][nEv - 1], e3 = MC.pick(r, evs.filter(x => x !== e1 && x !== e2));
  const c = prep({ id: 'd' + key, daily: key, home, seed, title: 'Daily Night · ' + key, recipes, count, need: Math.ceil(count / 2), len, patMul: mods2.indexOf('cold') >= 0 ? 1.2 : 1, vip: r() < 0.7 && multi.length ? MC.pick(r, multi) : null, events: evAt.map((at, i) => ({ type: [e1, e2, e3][i], at })), mods: mods2, floss: true });
  if (recipes.indexOf('eggtoast') >= 0 && !MC.save.stars.c20) c.tutorial = 'egg'; else if (recipes.some(k => MC.RECIPES[k].parts.indexOf('boiled') >= 0) && !MC.save.stars.c10) c.tutorial = 'noodle';
  c.target = target(c); return c;
};
MC.cfgLong = function (home) { if (home == null) { const open = [0, 1, 2].filter(h => MC.unlocked(h * 10)); home = open[Math.floor(Math.random() * open.length)]; } return prep({ id: 'long', long: true, home, seed: Math.floor(Math.random() * 1e9), title: 'Long Night', recipes: MC.HOME_RECIPES[home].slice(), count: 0, need: 0, len: 1e7, target: 0, lives: 3, floss: true, intro: 'Long Night: serve until you run out of lives. A customer walking out or getting caught costs a life.' }); };

// cosmetic diner decor you have bought
function decor(cfg) {
  const s = MC.save.upgrades, d = W.st.diner, M = MC.M, cx = (d.x0 + d.x1) / 2;
  if (s.bunting) { const cols = [0xd94f4f, 0xf2c14e, 0x4f8ad9, 0x6fb043]; for (let i = 0; i < 12; i++) { const x = d.x0 + 0.2 + i * (d.x1 - d.x0 - 0.4) / 11, y = 4.3 - Math.sin(i / 11 * Math.PI) * 0.18, sh = new THREE.Shape(); sh.moveTo(-0.13, 0); sh.lineTo(0.13, 0); sh.lineTo(0, -0.28); sh.closePath(); const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), M.flat(cols[i % 4], 0.9, 0, { side: THREE.DoubleSide })); f.position.set(x, y, d.z0 + 0.1); f.castShadow = true; W.group.add(f); } }
  if (s.cloth) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(200,50,50,0.55)'; g.fillRect(0, 0, 32, 64); g.fillRect(0, 0, 64, 32); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 2); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.BoxGeometry(d.x1 - d.x0 + 0.1, 0.02, d.z1 - d.z0 + 0.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 })); m.position.set(cx, 0.915, (d.z0 + d.z1) / 2); m.receiveShadow = true; W.group.add(m); }
  if (s.gold) for (const st of W.seats) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 8, 32), M.brass); m.rotation.x = Math.PI / 2; m.position.set(st.plate.x, 0.97, st.plate.z); W.group.add(m); }
  if (s.jar) { const x = d.x0 + 0.3, j = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 20, 1, true), M.glass); j.position.set(x, 1.15, W.seats[0].plate.z); W.group.add(j); for (let i = 0; i < 5; i++) W.glow(x + (Math.random() - 0.5) * 0.25, 1.0 + Math.random() * 0.3, -4.1 + (Math.random() - 0.5) * 0.25, 0.35, 0xd6ff5a); const L = new THREE.PointLight(MC.col(0xcfff7a), 4, 8, 2); L.position.set(x, 1.3, -3.9); W.group.add(L); }
  if (s.sign) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.font = 'bold 60px "Bree Serif", Georgia, serif'; g.textAlign = 'center'; g.shadowColor = '#ff4fa0'; g.shadowBlur = 24; g.fillStyle = '#ffd0ea'; g.fillText('MIDNIGHT CRUMBS', 256, 68);
    const t = new THREE.CanvasTexture(c); const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.8), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false })); m.position.set(cx, 6.6, d.z0 - 1.45); W.group.add(m); const L = new THREE.PointLight(MC.col(0xff5fae), 6, 10, 2); L.position.set(cx, 6.2, -5.2); W.group.add(L); }
}
// world-level modifier effects, applied right after the home is built
MC.applyMods = function (cfg) {
  const m = cfg.mods || [], r = MC.rng(cfg.seed + 5), up = MC.save.upgrades;
  PL.slip = m.indexOf('rainy') >= 0; MC.audio.setLoop('rain', PL.slip ? 0.06 : 0, 1);
  C.heatMul = m.indexOf('cold') >= 0 ? 1.4 : 1; C.softPaws = MC.up('paws') ? 0.8 : 1; C.timer = MC.up('timer');
  if (m.indexOf('fullmoon') >= 0) { W.moonI = 4.4; W.hemiI = 0.14; }
  const freeSpot = () => { for (let k = 0; k < 40; k++) { const x = -14 + r() * 28, z = -1.5 + r() * 6.5, [ci, cj] = P.cellOf(x, z); if (!P.grid.g[cj * P.grid.nx + ci] && Math.hypot(x - W.spawn.x, z - W.spawn.z) > 2) return [x, z]; } return [W.spawn.x + 2, W.spawn.z + 2]; };
  if (m.indexOf('sticky') >= 0) for (let i = 0; i < 4; i++) { const [x, z] = freeSpot(); W.jam(x, z, 1.1 + r() * 0.7); }
  if (m.indexOf('crumbs') >= 0) for (let i = 0; i < 10; i++) { const [x, z] = freeSpot(); C.create('crumb', new V3(x, 0.2, z)); }
  if (m.indexOf('party') >= 0) for (let i = 0; i < 6; i++) { const [x, z] = freeSpot(); C.create(i % 2 ? 'cheese' : 'crumb', new V3(x, 0.25, z)); }
  decor(cfg);
  if (MC.up('lantern')) { const d = W.st.diner, x = (d.x0 + d.x1) / 2; const L = new THREE.PointLight(MC.col(0xffb060), 9, 16, 2); L.position.set(x, 2.9, d.z1 + 0.9); W.group.add(L); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: MC.col(0xffc070), fog: false })); b.position.set(x, 4.0, d.z0 + 0.1); W.group.add(b); W.glow(x, 4.0, d.z0 + 0.15, 1.6, 0xffa040); }
};

// ---------- tutorial hints (one persistent line; advances on game events) ----------
const T = MC.TUTOR = {
  toast: [['Your larder is the house. Go out through the mousehole in the wall, onto the kitchen counter, and find the bread slice. Click it to tear off a crumb.', 'Your larder is the house. Go out through the mousehole onto the kitchen counter, reach into the bread slice and squeeze to tear off a crumb.', 'take'],
    ['Press E to tuck it in your backpack, then carry it home through the mousehole.', 'Let go of it behind your head to tuck it in your backpack, then carry it home through the mousehole.', 'stash'],
    ['In the pub kitchen, walk to the striped towel on the toaster. Hold a mouse button on it, pull the mouse DOWN, then grab higher with the other button. Let go above the top to hop on.', 'In the pub kitchen, climb the striped towel on the toaster hand over hand, and let go above the top.', 'mantle'],
    ['Press E to take the crumb out, then click one of the dark slots.', 'Take the crumb from behind your head and drop it in a slot.', 'slotted'],
    ['Walk to the end of the toaster above the lever. Look down at the lever, hold a mouse button on it and hang on. (Riding the lever is also your way down.)', 'Grab the lever on the end of the toaster and hang on.', 'lever'],
    ['Let go. The toast pops out onto the floor. Carry it to the bar and click the plate under the ticket.', 'Let go. Carry the toast to the bar and drop it on the plate under the ticket.', 'served'],
    ['That is the job. Check the tickets, keep quiet (watch the bar candle: it flares when you are loud), close before dawn.', null, 'timeout']],
  char: [['Charred means toasted twice: send a toasted crumb through the toaster again.', null, 'served']],
  pan: [['New: the bottle-cap pan over a burner. Put a pea from the brass lid in it, wait for the ring to fill, then take it out before it burns.', null, 'cooked']],
  cheese: [['Cheese is up on the bread box. Climb its striped cloth, pinch off a bit, then melt it in the pan.', null, 'cooked']],
  pot: [['New: the thimble pot. Drop a raw pea in, wait for the ring, then click the thimble to ladle out soup.', null, 'cooked'], ['If you hear footsteps: stop moving while you are in view.', null, 'event']],
  blade: [['New: the can-lid blade on the cutting board. Hold a raw pea or a cheese bit and click the blade to cut it.', 'New: the can-lid blade. Sweep a raw pea or cheese bit through it to cut it.', 'cut']],
  floss: [['New: dental floss. Click a pushpin, then another, to string a zipline. Hold a button on the line to ride it downhill.', 'New: dental floss. Grab a pushpin, then another, to string a zipline. Grab the line to ride.', 'line']],
  noodle: [['New: spaghetti. Snap a piece off the strands on the counter and boil it in the thimble pot.', null, 'cooked']],
  egg: [['New: eggs. You cannot lift one. Click it to shove it off its box so it cracks, then fry a drop in the pan. The sponge muffles a crack… if you can get it there.', 'New: eggs. Shove one off its box so it cracks, then fry a drop in the pan.', 'egg']],
};
let steps = null, si = 0, tt = 0;
// closing notes ('timeout' steps) dismiss themselves after 12 s instead of lingering all night
MC.tutorTick = function (dt) { if (steps && si < steps.length && steps[si][2] === 'timeout') { tt += dt; if (tt > 12) { tt = 0; si++; show(); } } else tt = 0; };
function show() { G.tip = steps && si < steps.length ? (MC.isXR() && steps[si][1] ? steps[si][1] : steps[si][0]) : ''; MC.emit('tip', G.tip); }
MC.on('night:start', cfg => { steps = cfg.tutorial ? T[cfg.tutorial] : null; si = 0; show(); });
for (const evn of ['take', 'stash', 'mantle', 'slotted', 'lever', 'served', 'cooked', 'cut', 'line', 'egg', 'event']) MC.on(evn, () => { if (steps && si < steps.length && steps[si][2] === evn && G.mode === 'play') { si++; show(); } });
MC.on('night:end', () => { steps = null; G.tip = ''; MC.emit('tip', ''); });

// ---------- progression ----------
MC.unlocked = i => i === 0 || (MC.save.stars['c' + (i - 1)] || 0) >= 1 || MC.params.has('all');
MC.on('night:end', r => {
  const c = G.cfg, s = MC.save; r.news = [];
  if (r.tips > 0) s.tips += c.long ? Math.round(r.tips / 2) : r.tips;   // Long Night pays half into the wallet
  for (const o of G.tierUps || []) r.news.push(o);
  if (c.career != null) { const k = 'c' + c.career, prev = s.stars[k] || 0; if (r.stars > prev) { s.stars[k] = r.stars; if (!prev && c.career + 1 < NIGHTS.length) r.news.push('Unlocked Night ' + (c.career + 2) + ': ' + NIGHTS[c.career + 1].title); } if (c.career === 9 && !prev && r.stars) r.news.push('A new home: The Family Kitchen'); if (c.career === 19 && !prev && r.stars) r.news.push("A new home: The Baker's House"); }
  if (c.daily) { const old = s.daily[c.daily], e = old && old.best ? old : { first: old || null, best: old || null };
    if (!e.first || e.first.pending) e.first = { tips: r.tips, stars: r.stars }; if (!e.best || r.tips > e.best.tips) { if (e.best) r.news.push('New personal best for today!'); e.best = { tips: r.tips, stars: r.stars }; }
    s.daily[c.daily] = e; r.news.push('Streak: ' + MC.dailyStreak() + ' day' + (MC.dailyStreak() === 1 ? '' : 's') + ' · share code ' + MC.shareCode(c.daily, e.first)); }
  if (c.long) { if (typeof s.longBest !== 'object') s.longBest = { 0: s.longBest || 0 }; if (r.served > (s.longBest[c.home] || 0)) { s.longBest[c.home] = r.served; r.news.push('New Long Night record in ' + MC.HOMES[c.home].name + ': ' + r.served + ' served'); } }
});
// Daily Night: streak and share codes (no server, so friends trade codes and the menu ranks them)
MC.dailyStreak = function () { let n = 0; const d = new Date(); for (;;) { const k = MC.dailyKey(d); if (!MC.save.daily[k]) { if (n === 0 && k === MC.dailyKey()) { d.setDate(d.getDate() - 1); if (!MC.save.daily[MC.dailyKey(d)]) return 0; continue; } return n; } n++; d.setDate(d.getDate() - 1); } };
MC.shareCode = function (key, e) { const t = Math.max(0, e.tips | 0), s = e.stars | 0, k = key.replace(/-/g, ''), chk = MC.hashStr(k + ':' + t + ':' + s + ':crumbs') % 1000; return 'MC-' + k + '-' + t + '-' + s + '-' + String(chk).padStart(3, '0'); };
MC.readCode = function (code) { const m = /^MC-(\d{8})-(\d{1,5})-([0-3])-(\d{3})$/.exec(String(code).trim().toUpperCase()); if (!m) return null; const ok = MC.hashStr(m[1] + ':' + (+m[2]) + ':' + (+m[3]) + ':crumbs') % 1000 === +m[4]; return ok ? { day: m[1].slice(0, 4) + '-' + m[1].slice(4, 6) + '-' + m[1].slice(6), tips: +m[2], stars: +m[3] } : null; };
MC.TIERS = [[3, 'Regular'], [8, 'Friend'], [15, 'Family'], [25, 'Legend']];
MC.tierOf = n => { let t = ''; for (const [k, name] of MC.TIERS) if (n >= k) t = name; return t; };
MC.nextCfg = function () { const c = G.cfg, r = G.result; if (c.career != null && r && r.stars >= 1 && c.career + 1 < NIGHTS.length) return MC.cfgCareer(c.career + 1); return MC.lastCfg; };
})();
