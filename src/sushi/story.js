// the block's day and night, told by its people: at its moments on the run's clock (clock.js) one of the regulars comes by and says what they know (the Mets and the Cardinals, a film crew on Avenue A, the rent strike's meeting, a band's late set, the cop's rounds, the cabbie's night, the old woman's weather, the morning papers), spoken through the talk layer; the notebook on the back shelf keeps the cook's skill, the recipes learned and what was heard
import * as THREE from 'three';
import { G, V3, mat } from './ctx.js';
import * as T from './tex.js';
import { RECIPES } from './cart.js';

// [share of the run, who (a regular's id, else whoever is about), what they must get across, their line when no mind answers, the note the cook writes]
export const BEATS = [
  [0.12, 'hector', 'You have stepped out of your bodega. Tell the cook the Mets are two games behind St. Louis with three left to play, all at Shea against Montreal, starting tonight: they have to win every one and hope the Cardinals lose. You are hopeful and already suffering.', 'Mets and Expos tonight at Shea! Two games back, three to play. We need all three, my friend.', 'Héctor: the Mets at Shea tonight. Two back, three to play.'],
  [0.22, 'mei', 'Tell the cook a film crew has been on Avenue A since morning with trucks and lights, making a movie, and half the block has gone to watch. Ask, practically, whether they will come down here to eat.', 'They are making a movie on Avenue A. Trucks, lights, everything. Maybe they come eat here, good for you.', 'Mei: a film crew on Avenue A all day.'],
  [0.33, 'olena', 'Tell the cook the tenants\' meeting is tonight at seven in the church basement, about the landlord and the heat, and that you will be in the front row. Ask whether the cook has heat where they live.', 'Tenants\' meeting tonight, seven o\'clock, the church basement. No heat since Tuesday! I will tell them.', 'Olena: the tenants\' meeting at seven, about the heat.'],
  [0.43, 'jo', 'It is evening. Tell the cook your band plays a late set at a club on the Bowery tonight, one in the morning, three dollars at the door, and that the cook should come if they ever close. You are pretending not to be nervous.', 'We play the Bowery tonight. One a.m., three bucks at the door. Come by if you ever close this thing.', 'Jo: her band plays the Bowery at one. Three dollars.'],
  [0.55, 'ray', 'You are the patrolman on your night rounds. Tell the cook the block is quiet: a car alarm on Avenue A and somebody locked out on East 2nd, that is all. Remind them to keep the cash drawer shut and to shout if they need you.', 'Quiet night. A car alarm on A, a guy locked out on Second Street. Keep that drawer shut, and holler if you need me.', 'Ray: a quiet night. Keep the drawer shut.'],
  [0.67, 'sal', 'You are the cabbie, on your break in the small hours. Tell the cook the Mets won tonight at Shea, you heard it on the cab radio, but the Cardinals won in Chicago too: still two games back, two to play. You are philosophical about it.', 'You hear? Mets won tonight. But St. Louis won too. Still two back, two to play. That\'s the Mets for you.', 'Sal: the Mets won, and so did St. Louis. Two back, two to play.'],
  [0.8, 'cora', 'You are the nurse, on your break from the night shift. Tell the cook it has been a quiet night at the hospital for once, and that the rain is supposed to clear by morning: you can feel the air changing.', 'Quiet night on the ward, for once. And the rain\'s clearing, I can feel it. Morning should be nice.', 'Cora: a quiet night at the hospital. Clearing by morning.'],
  [0.93, 'nico', 'It is dawn. You are the boy from the bodega, up early carrying in the morning papers, and excited: the Mets won last night and it is all over the back page, and the bakery truck gave you a roll. Say good morning to the cook.', 'Good morning! The Mets won, it\'s on the back page! And the bread truck guy gave me a roll!', 'Dawn. The morning papers are in. The Mets won.'],
];

export function buildStory(scene) {
  const S = { notes: [], said: {}, skill: () => G.game?.skill || 0 };
  G.story = S;
  // who can tell it: the regular named, else whoever of the street is about and well; brought to the counter's near side to say it
  S.tell = (b, i) => { const [f, id, prompt, line, note] = b; if (S.said[i]) return; S.said[i] = true; S.notes.push(note); S.dirty = true;
    const B = G.block; if (!B) return; const ok = (h) => h && !h.taken && !h.cop && !(B.mad && B.mad[h.def.id]);
    const h = (id && ok(B.by[id]) ? B.by[id] : null) || B.people.find((x) => ok(x) && x.p.root.visible) || B.people.find(ok); if (!h) return;
    const pos = h.p.root.position; if (h.hidden || Math.abs(pos.x) > 20) { pos.set(f > 0.9 ? 6 : -6, 0, -2.6); h.hidden = false; h.p.root.visible = true; }
    h.lead = null; h.chat = null; B.greet(h, { kind: 'story', t: 6, w: 0.2, say: 0.6, what: { prompt, line } }); };
  G.clock.on('reset', () => { S.notes.length = 0; S.said = {}; S.dirty = true; });
  // the notebook: a bound book open on the back shelf, its two pages redrawn as they fill
  const pages = T.panelTex(768, 512, () => { }), book = new THREE.Group(); book.position.set(0.42, 1.637, 1.72); book.rotation.set(-0.35, Math.PI, 0); G.cart.group.add(book);
  const cover = mat({ color: 0x3a2418 }); { const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.2), cover); c.position.y = -0.006; book.add(c); }
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.19), new THREE.MeshLambertMaterial({ map: pages })); pm.rotation.x = -Math.PI / 2; pm.position.y = 0.001; pm.userData.nopick = true; book.add(pm); book.traverse((o) => { o.userData.nopick = true; o.userData.keep = true; });
  let key = '', t = 0;
  S.draw = () => { const g0 = G.game, sk = S.skill(), on = g0 ? g0.cfg().menu : ['shoyu'], k = [Math.round(sk * 20), on.join(), g0 ? g0.served : 0, S.notes.length].join('|'); if (k === key) return; key = k;
    pages.redraw((g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(w / 2 - 2, 0, 4, h); g.fillStyle = '#1c1612'; g.textAlign = 'left';
      g.font = `bold 34px ${T.JP}`; g.fillText('THE COOK\'S BOOK', 20, 44, w / 2 - 30);
      g.font = `bold 24px ${T.JP}`; g.fillText(`Bowls served: ${g0 ? g0.served : 0}`, 20, 92); g.fillText(`Skill: ${['new at it', 'getting there', 'steady hand', 'old hand', 'master'][Math.min(4, Math.floor(sk * 5))]}`, 20, 126);
      g.fillStyle = '#5a3a1c'; g.fillRect(20, 138, 300, 14); g.fillStyle = '#a0281c'; g.fillRect(20, 138, 300 * sk, 14); g.fillStyle = '#1c1612';
      g.fillText('Recipes learned:', 20, 190); on.forEach((r, i) => g.fillText(`・${RECIPES[r].name} ${RECIPES[r].jp}`, 30, 226 + i * 34, w / 2 - 50));
      g.font = `bold 28px ${T.JP}`; g.fillText('What I heard today', w / 2 + 20, 44); g.font = `22px ${T.JP}`;
      let y = 86; for (const n of S.notes.slice(-6)) { const words = n.split(' '); let line = ''; for (const wd of words) { if (g.measureText(line + wd).width > w / 2 - 50) { g.fillText(line, w / 2 + 20, y); y += 28; line = ''; } line += wd + ' '; } g.fillText(line, w / 2 + 20, y); y += 40; } }); };
  S.update = (dt) => { if ((t -= dt) > 0) return; t = 1; const K = G.clock; if (K.running || K.over) BEATS.forEach((b, i) => { if (K.frac >= b[0] && K.frac < b[0] + 0.05) S.tell(b, i); }); S.draw(); };   // (a beat long past, after a jump of the clock, is not told late)
  S.draw();
  return S;
}
