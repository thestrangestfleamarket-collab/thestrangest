// Menus (page UI): career map, daily, long night, shop, regulars, options, help.
'use strict';
(function () {
const { $ } = MC, G = MC.game, S = MC.save;
const KEYS = MC.KEYS = '<table class="keys">' +
  '<tr><td>Move / look</td><td>WASD + mouse (click the view to capture the mouse; arrow keys also look). Space hops.</td></tr>' +
  '<tr><td>Paws</td><td>Left / right mouse button = left / right paw (or Q / F on the keyboard). Click things to pick up, use, set down, cook or serve.</td></tr>' +
  '<tr><td>Climb</td><td>Striped cloth is grippable. Hold a button on it, pull the mouse <i>down</i> to haul yourself up, grab higher with the other paw. Let go above a ledge to hop on.</td></tr>' +
  '<tr><td>Backpack</td><td>E stashes or takes out what you carry, so both paws are free to climb.</td></tr>' +
  '<tr><td>Floss</td><td>Click a pushpin, then another, to string a zipline. Hold a button on the line to ride it down.</td></tr>' +
  '<tr><td>Quiet!</td><td>The diner candle flares as the noise meter rises. Fill it and someone comes to look. When anything is watching: stop moving.</td></tr>' +
  '<tr><td>VR</td><td>Grip or trigger grabs and climbs. Left stick walks, right stick snap-turns, A hops. Let go of an item behind your head to pack it.</td></tr>' +
  '<tr><td>Other</td><td>Esc pauses · R restarts after a night · VR: X pauses · Every key can be remapped, and climb assist, toggle grip, a slower pace and more are in Options.</td></tr></table>';
const st = MC.menuState = { tab: 'career', sel: 0 };
const stars = n => { n = Math.max(0, Math.min(3, n | 0)); return '★'.repeat(n) + '☆'.repeat(3 - n); };
function cfgInfo(c) {
  const rec = c.recipes.map(k => MC.RECIPES[k].name).join(', ');
  return '<b>' + c.title + '</b><br><small>' + MC.HOMES[c.home].name + ' — ' + MC.HOMES[c.home].blurb + '</small><br>' +
    (c.long ? '' : 'Goals: ★ serve ' + c.need + ' of ' + G.countOf(c) + ' · ★★ ' + MC.money(c.target) + ' in tips · ★★★ also lose no more than ' + Math.floor(G.countOf(c) / 10) + (c.vip ? ' and serve the VIP (' + MC.RECIPES[c.vip].name + ')' : '') + '<br>') + (c.special ? 'Special of the night: <b>' + MC.RECIPES[c.special].name + '</b> (pays 1.5×)<br>' : '') +
    'Menu: ' + rec + '<br>' +
    (c.events && c.events.length ? 'Expect: ' + c.events.map(e => MC.EVENTS[e.type]).filter((v, i, a) => a.indexOf(v) === i).join(', ') + '<br>' : '') +
    (c.mods && c.mods.length ? c.mods.map(m => '<b>' + MC.MODS[m].name + '</b>: ' + MC.MODS[m].desc).join('<br>') : '');
}
const playBtns = id => '<button id="' + id + '">Open the diner</button>' + (MC.enterVR ? '<button id="' + id + '-vr" class="alt">Play in VR</button>' : '');
function bindPlay(id, mk) { $(id).onclick = () => MC.startNight(mk()); const v = $(id + '-vr'); if (v) v.onclick = () => MC.enterVR(mk()); }
const TABS = [['career', 'Career'], ['daily', 'Daily Night'], ['long', 'Long Night'], ['shop', 'Upgrades'], ['regs', 'Regulars'], ['opts', 'Options'], ['help', 'How to play']];
function render() {
  const ae = document.activeElement, keep = ae && ae.dataset ? (ae.dataset.tab ? '[data-tab="' + ae.dataset.tab + '"]' : ae.dataset.night ? '[data-night="' + ae.dataset.night + '"]' : ae.dataset.lhome ? '[data-lhome="' + ae.dataset.lhome + '"]' : ae.dataset.bind ? '[data-bind="' + ae.dataset.bind + '"]' : ae.id ? '#' + ae.id : null) : null;
  render0(); if (keep) { const el = document.querySelector(keep); if (el) el.focus(); }
}
function render0() {
  let h = '<div class="tabs">' + TABS.map(t => '<button class="sm' + (st.tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '" role="tab" aria-selected="' + (st.tab === t[0]) + '">' + t[1] + '</button>').join('') + '</div>';
  if (st.tab === 'career') {
    let last = 0; for (let i = 0; i < MC.NIGHTS.length; i++) if (MC.unlocked(i)) last = i; if (st.sel > last) st.sel = last; if (st.auto !== false) { st.sel = last; st.auto = false; }
    const total = MC.NIGHTS.reduce((a, n, i) => a + (S.stars['c' + i] || 0), 0);
    h += '<div class="info">' + cfgInfo(MC.cfgCareer(st.sel)) + '</div>' + playBtns('m-play') + '<div style="margin-top:10px"><small>Stars ' + total + ' / ' + MC.NIGHTS.length * 3 + ' · Wallet ' + MC.money(S.tips) + (() => { const nx = MC.SHOP.find(x => x.stars && total < x.stars); return nx ? ' · at ' + nx.stars + '★ the shop gets: ' + nx.name : ''; })() + '</small></div>';
    for (let hm = 0; hm < 3; hm++) {
      h += '<h3>' + MC.HOMES[hm].name + '</h3><div class="grid">';
      for (let i = hm * 10; i < hm * 10 + 10; i++) { const u = MC.unlocked(i); h += '<button class="night' + (u ? '' : ' locked') + (i === st.sel ? ' sel' : '') + '" data-night="' + i + '"' + (u ? '' : ' disabled') + ' aria-label="Night ' + (i + 1) + ', ' + (u ? (S.stars['c' + i] || 0) + ' of 3 stars' : 'locked') + '">' + (i + 1) + '<span class="st">' + (u ? stars(S.stars['c' + i] || 0) : 'locked') + '</span></button>'; }
      h += '</div>';
    }

  } else if (st.tab === 'daily' && !MC.unlocked(3)) {
    h += '<p>Daily Night opens once you have cleared <b>Night 3</b> of the career. It mixes every kitchen, event and twist, so learn the ropes first.</p>';
  } else if (st.tab === 'daily') {
    const key = MC.dailyKey(), c = MC.cfgDaily(key), raw = S.daily[key], b = raw && raw.best ? raw : raw ? { first: raw, best: raw } : null, streak = MC.dailyStreak();
    const fr = (S.friends = S.friends || {})[key] || [], board = [{ who: 'You (first try)', tips: b && b.first && !b.first.pending ? b.first.tips : (b && b.first ? 0 : -1), stars: b && b.first ? b.first.stars : 0 }].concat(fr).filter(x => x.tips >= 0).sort((x, y) => y.tips - x.tips);
    h += '<p>One kitchen, one seed, the same for everyone today. Upgrades and regulars\' memory are off, so scores compare. Your <b>first try</b> is the one that counts; replay for your best.</p><div class="info">' + cfgInfo(c) + '<br><small>' + (b && b.best ? 'First try: ' + MC.money(b.first.tips) + ' ' + stars(b.first.stars) + ' · Best: ' + MC.money(b.best.tips) + ' ' + stars(b.best.stars) : b ? 'First try abandoned: it counts as $0. Replay for your best.' : 'Not played yet today. Your first start locks in your first try.') + ' · Streak: ' + streak + ' day' + (streak === 1 ? '' : 's') + '</small></div>' + playBtns('m-play') +
      '<h3>Friends\' board</h3><p><small>No servers here: trade share codes. ' + (b && b.first ? 'Yours: <b>' + MC.shareCode(key, b.first) + '</b>' : 'Play once to get your code.') + '</small></p>' +
      '<div class="shop"><input id="d-code" placeholder="paste a friend\'s code" style="flex:1;font:16px var(--hand);padding:6px;border:2px solid #b0905a;border-radius:4px;background:#fff6dd"><input id="d-name" placeholder="name" style="width:90px;font:16px var(--hand);padding:6px;border:2px solid #b0905a;border-radius:4px;background:#fff6dd"><button class="sm" id="d-add">Add</button></div>' +
      board.map((x, i) => '<div class="shop"><span>' + (i + 1) + '. ' + x.who + '</span><span>' + MC.money(x.tips) + ' ' + stars(x.stars) + '</span></div>').join('');
  } else if (st.tab === 'long') {
    const lb = typeof S.longBest === 'object' ? S.longBest : { 0: S.longBest || 0 }; st.lhome = st.lhome == null ? 0 : st.lhome;
    h += '<p>Endless service. Customers arrive faster and faster, something goes bump more and more often, and you have three lives: one is lost whenever a customer walks out or you get caught. Every 12 served earns one back. Half your tips go to the wallet.</p><div class="grid" style="grid-template-columns:repeat(3,1fr)">' + [0, 1, 2].map(hm => { const u = MC.unlocked(hm * 10); return '<button class="night' + (u ? '' : ' locked') + (st.lhome === hm ? ' sel' : '') + '" data-lhome="' + hm + '"' + (u ? '' : ' disabled') + ' style="aspect-ratio:auto;padding:10px 0">' + MC.HOMES[hm].name + '<span class="st">' + (u ? 'best ' + (lb[hm] || 0) : 'locked') + '</span></button>'; }).join('') + '</div>' + playBtns('m-play');
  } else if (st.tab === 'shop') {
    h += '<p>Wallet: <b>' + MC.money(S.tips) + '</b>. Upgrades add options, not raw power; switch any off to replay a night the hard way. All are off in Daily Night.</p>';
    const tot = MC.careerStars(); S.upgOff = S.upgOff || {}; let dec = false;
    for (const it of MC.SHOP) { if (it.look && !dec) { dec = true; h += '<h3>Diner decor</h3><p><small>Cosmetic only. Unlocked by career stars (you have ' + tot + '★).</small></p>'; } const lock = (it.after && !(S.stars['c' + (it.after - 1)] || 0)) || (it.stars && tot < it.stars); h += '<div class="shop"><div><b>' + it.name + '</b><br><small>' + it.desc + '</small></div>' + (S.upgrades[it.id] ? (it.look ? '<small>owned</small>' : '<label><small>on</small> <input type="checkbox" data-upg="' + it.id + '"' + (S.upgOff[it.id] ? '' : ' checked') + '></label>') : lock ? '<small>' + (it.stars ? 'needs ' + it.stars + '★' : 'after Night ' + it.after) + '</small>' : '<button class="sm" data-buy="' + it.id + '"' + (S.tips < it.cost ? ' disabled' : '') + '>' + MC.money(it.cost) + '</button>') + '</div>'; }
  } else if (st.tab === 'regs') {
    h += '<p>The regulars remember you: +2% tips per visit (up to +20%), and friendship tiers at ' + MC.TIERS.map(t => t[0] + ' (' + t[1] + ')').join(', ') + ' visits. Regulars reveal their favourite dish once they are Regulars.</p>';
    for (const id in MC.REGULARS) { const R = MC.REGULARS[id], m = S.regulars[id], tier = m ? MC.tierOf(m.n) : '', nx = m ? MC.TIERS.find(t => m.n < t[0]) : null; h += '<div class="shop"><div><b>' + (m ? R.name : '???') + '</b> <small>' + (m ? 'the ' + R.kind : 'not met yet') + (tier ? ' · <b>' + tier + '</b>' : '') + '</small><br><small>' + (m ? R.quirk + (tier && R.likes[0] ? ' Favourite: ' + MC.RECIPES[R.likes[0]].name + '.' : '') : '') + '</small></div><small>' + (m ? m.n + ' served' + (nx ? ' · ' + (nx[0] - m.n) + ' to ' + nx[1] : '') : '') + '</small></div>'; }
  } else if (st.tab === 'opts') {
    const o = MC.opt, chk = (k, label) => '<label class="opt"><span>' + label + '</span><input type="checkbox" data-opt="' + k + '"' + (o[k] ? ' checked' : '') + '></label>';
    const sel = (k, label, opts) => '<label class="opt"><span>' + label + '</span><select data-optsel="' + k + '" aria-label="' + label + '">' + opts.map(([v, t]) => '<option value="' + v + '"' + (String(o[k]) === String(v) ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>';
    const rng = (k, label, a, b, st) => '<label class="opt"><span>' + label + '</span><input type="range" data-optrange="' + k + '" min="' + a + '" max="' + b + '" step="' + st + '" value="' + o[k] + '" aria-label="' + label + '"></label>';
    const KN = { fwd: 'Forward', back: 'Back', left: 'Left', right: 'Right', hop: 'Hop', pack: 'Backpack', pawL: 'Left paw (key)', pawR: 'Right paw (key)', pause: 'Pause (no-lock mode)' }, kname = c => c.replace(/^Key|^Digit/, '').replace('Space', 'Space');
    h += '<h3>Controls</h3>' + Object.keys(KN).map(k => '<div class="opt"><span>' + KN[k] + '</span><button class="sm alt" data-bind="' + k + '" aria-label="Rebind ' + KN[k] + ', currently ' + kname(o.keys[k]) + '">' + kname(o.keys[k]) + '</button></div>').join('') +
      chk('gripToggle', 'Toggle grip (press to grab, press again to let go)') + chk('climbAssist', 'Climb assist: hold Forward on a cloth to climb and hop up') + rng('climbSens', 'Climb pull speed', 0.5, 3, 0.1) + chk('vrOneHand', 'VR one-handed: right stick walks and turns') +
      '<h3>Accessibility</h3>' + sel('pace', 'Pace', [['standard', 'Standard'], ['relaxed', 'Relaxed: more patience, slower burning'], ['nowalk', 'No walk-outs']]) +
      rng('uiScale', 'Text and HUD size', 0.8, 1.8, 0.1) + chk('plainFont', 'Plain, easy-to-read font') + chk('bigCross', 'Large crosshair') + chk('cues', 'Visual sound cues (warnings, thunder, new-customer arrow)') +
      rng('shake', 'Screen shake', 0, 1, 0.1) + sel('flash', 'Lightning flashes', [['full', 'Full'], ['dim', 'Dim'], ['off', 'Off']]) + sel('captions', 'VR captions', [['left', 'Left wrist'], ['right', 'Right wrist'], ['head', 'In front of me']]) + '<h3>General</h3>';
    h += '<div class="opt"><span>Graphics quality <small>(reloads)</small></span><select id="o-q"><option value="0">Low (no shadows)</option><option value="1">Medium</option><option value="2">High</option></select></div>' +
      '<div class="opt"><span>Volume</span><input type="range" id="o-vol" min="0" max="1" step="0.05" value="' + o.volume + '"></div>' +
      '<div class="opt"><span>Mouse sensitivity</span><input type="range" id="o-sens" min="0.3" max="2.5" step="0.1" value="' + o.sens + '"></div>' +
      chk('invertY', 'Invert mouse Y') + chk('bob', 'Head bob (desktop)') + chk('music', 'Music box') +
      '<div class="opt"><span>VR turning</span><select id="o-turn"><option value="snap15">Snap 15°</option><option value="snap30">Snap 30°</option><option value="snap45">Snap 45°</option><option value="smooth">Smooth (with vignette)</option></select></div>' +
      '<div class="opt"><span>VR comfort vignette</span><select id="o-vig"><option value="0">Off</option><option value="1">Low</option><option value="2">Medium</option><option value="3">High</option></select></div>' + chk('vrHeight', 'VR: shrink me to mouse height') + '<div class="opt"><span>Save data</span><button class="sm alt" id="o-reset">Erase progress</button></div>';
  } else h += KEYS;
  $('menu-body').innerHTML = h;
  for (const b of document.querySelectorAll('[data-tab]')) b.onclick = () => { st.tab = b.dataset.tab; render(); };
  for (const b of document.querySelectorAll('[data-night]')) b.onclick = () => { st.sel = +b.dataset.night; render(); };
  for (const b of document.querySelectorAll('[data-buy]')) b.onclick = () => { const it = MC.SHOP.find(x => x.id === b.dataset.buy); if (S.tips >= it.cost) { S.tips -= it.cost; S.upgrades[it.id] = true; MC.persist(); render(); } };
  for (const b of document.querySelectorAll('[data-upg]')) b.onchange = () => { S.upgOff[b.dataset.upg] = !b.checked; MC.persist(); };
  for (const b of document.querySelectorAll('[data-opt]')) b.onchange = () => { MC.opt[b.dataset.opt] = b.checked; MC.persist(); MC.applyAccess(); };
  if (st.tab === 'career') bindPlay('m-play', () => MC.cfgCareer(st.sel));
  if (st.tab === 'daily' && $('m-play')) { bindPlay('m-play', () => MC.cfgDaily()); const add = $('d-add'); if (add) add.onclick = () => { const r = MC.readCode($('d-code').value); if (!r || r.day !== MC.dailyKey()) { $('d-code').value = ''; $('d-code').placeholder = r ? 'that code is for ' + r.day : 'not a valid code'; return; } const key = MC.dailyKey(), list = (S.friends[key] = S.friends[key] || []), raw = $('d-code').value.trim().toUpperCase(); if (list.some(x => x.code === raw)) { $('d-code').value = ''; $('d-code').placeholder = 'already on the board'; return; } list.push({ code: raw, who: ($('d-name').value || 'Friend').slice(0, 16), tips: r.tips, stars: r.stars }); MC.persist(); render(); }; }
  if (st.tab === 'long') { bindPlay('m-play', () => MC.cfgLong(st.lhome)); for (const b of document.querySelectorAll('[data-lhome]')) b.onclick = () => { st.lhome = +b.dataset.lhome; render(); }; }
  if (st.tab === 'opts') {
    $('o-turn').value = MC.opt.turn || 'snap30'; $('o-turn').onchange = e => { MC.opt.turn = e.target.value; MC.persist(); };
    $('o-vig').value = String(MC.opt.vigLevel == null ? 2 : MC.opt.vigLevel); $('o-vig').onchange = e => { MC.opt.vigLevel = +e.target.value; MC.opt.vignette = MC.opt.vigLevel > 0; MC.persist(); };
    $('o-q').value = MC.opt.quality; $('o-q').onchange = e => { MC.opt.quality = +e.target.value; MC.persist(); location.reload(); };
    $('o-vol').oninput = e => { MC.opt.volume = +e.target.value; MC.audio.setVolume(MC.opt.volume); MC.persist(); };
    $('o-sens').oninput = e => { MC.opt.sens = +e.target.value; MC.persist(); };
    for (const b of document.querySelectorAll('[data-optsel]')) b.onchange = () => { MC.opt[b.dataset.optsel] = b.value; MC.persist(); MC.applyAccess(); };
    for (const b of document.querySelectorAll('[data-optrange]')) b.oninput = () => { MC.opt[b.dataset.optrange] = +b.value; MC.persist(); MC.applyAccess(); };
    for (const b of document.querySelectorAll('[data-bind]')) b.onclick = () => { b.textContent = 'press a key…'; MC.rebinding = true; const f = e => { e.preventDefault(); removeEventListener('keydown', f, true); MC.rebinding = false; if (e.code !== 'Escape') { MC.opt.keys[b.dataset.bind] = e.code; MC.persist(); } render(); }; addEventListener('keydown', f, true); };
    $('o-reset').onclick = () => { if (confirm('Erase all progress?')) { try { localStorage.removeItem('mc_save'); } catch (e) {} location.reload(); } };
  }
}
MC.menuRender = render; render();
MC.on('menu', () => { st.auto = true; render(); });
$('pause-body').innerHTML = KEYS;
})();
