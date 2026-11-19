// the village's day and night, told by its people: at its moments on the run's clock (clock.js) one of the villagers comes by and says what they know (the morning's catch and a ship off the cape, the shrine festival, a traveller from Edo, the monk's evening bell, the constable's rounds, the potter's kiln, the old woman's weather, the dawn), spoken through the talk layer; the notebook on the back shelf keeps the cook's skill, the recipes learned and what was heard
import * as THREE from 'three';
import { G, V3, mat } from './ctx.js';
import * as T from './tex.js';
import { RECIPES } from './cart.js';

// [share of the run, who (a regular's id, else whoever is about), what they must get across, their line when no mind answers, the note the cook writes]
export const BEATS = [
  [0.12, 'jinbei', 'You are just up from the coast with your fish baskets. Tell the cook the morning catch was good, and the talk on the shore: a foreign ship, black smoke from its chimney, was seen far off the cape. You are more curious than worried.', 'Good catch this morning! And they say a black ship was seen off the cape, smoke and all.', 'Jinbei: a good catch. A black ship seen off the cape.'],
  [0.22, 'okane', 'Tell the cook the shrine\'s summer festival is in two days: the lanterns are going up along the street and there will be dancing. Ask, kindly, whether the stall will stay open late for it.', 'The festival is in two days! Will you keep the stall open late for the dancing?', 'O-Kane: the shrine festival in two days. Lanterns going up.'],
  [0.33, 'kohana', 'Tell the cook a traveller came to the teahouse this afternoon: a print seller from Edo with pictures of the kabuki actors, who says Edo talks of nothing but the foreigners at Yokohama. You bought a print.', 'A print seller came up from Edo today. All anyone talks of there is the foreigners at Yokohama!', 'Kohana: a print seller from Edo. Talk of Yokohama.'],
  [0.43, 'jonen', 'You are the monk. The temple\'s evening bell has just rung. Wish the cook a quiet night and say a short evening prayer for the stall and the village, gently.', 'The evening bell has rung. May your fire stay warm tonight. Namu Amida Butsu.', 'Jōnen: the evening bell. A prayer for the stall.'],
  [0.55, 'hachiro', 'You are the constable on your night rounds. Tell the cook the street is quiet: only a lost pilgrim asking the way to the inn, and Tōbei\'s kiln still smoking. Remind them to mind the braziers if the wind gets up.', 'All quiet tonight. A pilgrim lost his way to the inn, that is all. Mind your braziers in the wind.', 'Hachirō: a quiet street. A lost pilgrim; mind the braziers.'],
  [0.67, 'tobei', 'You are the potter, waiting up while your kiln cools. Tell the cook you will open it at first light, and if the bowls came out well you will bring the stall a new one.', 'The kiln is cooling. At first light I open it. If they came out well, you shall have a new bowl.', 'Tōbei: the kiln opens at first light. A new bowl, perhaps.'],
  [0.8, 'oume', 'You are the old woman of the sake house, out late on its step. Tell the cook your knee says the rain will clear by morning, and how the night stalls looked when you were a girl.', 'My knee says the rain clears by morning. When I was a girl there were three stalls on this street at night.', 'O-Ume: the rain will clear by morning, her knee says.'],
  [0.93, 'sanpei', 'It is dawn. You are the village boy, up early and excited: Tōbei has opened his kiln and the bowls came out fine, and the festival lanterns are hung all down the street. Say good morning to the cook.', 'Good morning, cook! Tōbei opened the kiln, the bowls are fine! And the lanterns are all up!', 'Dawn. Tōbei\'s kiln is open. The festival lanterns are up.'],
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
      g.font = `bold 34px ${T.JP}`; g.fillText('料理帳 THE COOK\'S BOOK', 20, 44, w / 2 - 30);
      g.font = `bold 24px ${T.JP}`; g.fillText(`Bowls served: ${g0 ? g0.served : 0}`, 20, 92); g.fillText(`Skill: ${['novice', 'apprentice', 'steady hand', 'craftsman', 'master'][Math.min(4, Math.floor(sk * 5))]}`, 20, 126);
      g.fillStyle = '#5a3a1c'; g.fillRect(20, 138, 300, 14); g.fillStyle = '#a0281c'; g.fillRect(20, 138, 300 * sk, 14); g.fillStyle = '#1c1612';
      g.fillText('Recipes learned:', 20, 190); on.forEach((r, i) => g.fillText(`・${RECIPES[r].name} ${RECIPES[r].jp}`, 30, 226 + i * 34, w / 2 - 50));
      g.font = `bold 28px ${T.JP}`; g.fillText('What I heard today', w / 2 + 20, 44); g.font = `22px ${T.JP}`;
      let y = 86; for (const n of S.notes.slice(-6)) { const words = n.split(' '); let line = ''; for (const wd of words) { if (g.measureText(line + wd).width > w / 2 - 50) { g.fillText(line, w / 2 + 20, y); y += 28; line = ''; } line += wd + ' '; } g.fillText(line, w / 2 + 20, y); y += 40; } }); };
  S.update = (dt) => { if ((t -= dt) > 0) return; t = 1; const K = G.clock; if (K.running || K.over) BEATS.forEach((b, i) => { if (K.frac >= b[0] && K.frac < b[0] + 0.05) S.tell(b, i); }); S.draw(); };   // (a beat long past, after a jump of the clock, is not told late)
  S.draw();
  return S;
}
