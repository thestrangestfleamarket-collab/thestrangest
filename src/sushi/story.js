// the day's story and the cook's notebook: on each stage of the run (clock.js) one of the villagers comes by and says what they know (the runner's news from the coast road, the constable's warning, the regular who came back not himself, the ronin's past, the monk's prayer, the messenger who promises help at dawn), spoken through the talk layer; the notebook on the back shelf keeps the cook's skill, the recipes learned and what was heard
import * as THREE from 'three';
import { G, V3, mat } from './ctx.js';
import * as T from './tex.js';
import { RECIPES } from './cart.js';

// [stage, who (a regular's id, else whoever is about), what they must get across, their line when no mind answers, the note the cook writes]
export const BEATS = [
  ['signs', 'jinbei', 'You have just come up the coast road with your fish baskets. Tell the cook, uneasy, that people in the fishing village are sick: feverish, not themselves, and one bit a man. You laugh it off, but you are frightened.', 'They say folk on the coast are sick. Not themselves. One bit a man!', 'Jinbei: sickness in the fishing village. Biting.'],
  ['obvious', 'hachiro', 'You are the constable. Tell the cook firmly to keep the lanterns lit and stay near the stall tonight: two strangers came along the east road and attacked a farmer, and they did not stop when struck.', 'Keep your lanterns lit tonight, cook. Something is wrong on the east road.', 'Hachirō: strangers on the east road. They do not stop when struck.'],
  ['ramp', 'okane', 'Tell the cook in a frightened voice that Gonzō the farmer came back from the paddies with a bite on his arm, and now he will not answer, he only stares.', 'Gonzō came back from the fields bitten. He only stares now. Gods help us.', 'O-Kane: Gonzō bitten in the paddies. He only stares.'],
  ['harder', 'hayato', 'You are the ronin. Tell the cook quietly that you have seen this before, in the north: your lord\'s house fell to it in one night. Only the head or fire stops them. You never speak of it; tonight you must.', 'I have seen this before, in the north. My lord\'s house fell in one night.', 'Hayato: he has seen it before. Only the head, or fire.'],
  ['hardest', 'jonen', 'You are the monk. Tell the cook the shrine is full of the frightened and you have nothing left to feed them; ask for broth or rice for them, and say a short prayer.', 'The shrine is full of frightened folk. Have you any rice for them? Namu Amida Butsu.', 'Jōnen: the shrine full of the frightened. They need food.'],
  ['winddown', 'sanpei', 'You are a village boy who ran to the castle town and back. Tell the cook breathlessly that the lord\'s men are coming: a column of samurai with torches, on the road by dawn. Hold on until first light.', 'Cook! The lord\'s men are coming! Samurai with torches, by dawn!', 'Sanpei: the domain\'s samurai on the road. Hold on till first light.'],
  ['end', null, 'Dawn is here and you can see the torches of the lord\'s men coming up the road. Tell the cook, weeping with relief.', 'Look! Torches on the road! They have come!', 'Dawn. The lord\'s men have come.'],
];

export function buildStory(scene) {
  const S = { notes: [], said: {}, skill: () => G.game?.skill || 0 };
  G.story = S;
  // who can tell it: the regular named, else whoever of the street is about and well; brought to the counter's near side to say it
  S.tell = (b) => { const [stage, id, prompt, line, note] = b; if (S.said[stage]) return; S.said[stage] = true; S.notes.push(note); S.dirty = true;
    const B = G.block; if (!B) return; const ok = (h) => h && !h.taken && !h.cop && !(B.mad && B.mad[h.def.id]) && !h.turned;
    const h = (id && ok(B.by[id]) ? B.by[id] : null) || B.people.find((x) => ok(x) && x.p.root.visible) || B.people.find(ok); if (!h) return;
    const pos = h.p.root.position; if (h.hidden || Math.abs(pos.x) > 20) { pos.set(stage === 'end' ? 6 : -6, 0, -2.6); h.hidden = false; h.p.root.visible = true; }
    h.lead = null; h.chat = null; B.greet(h, { kind: 'story', t: 6, w: 0.2, say: 0.6, what: { prompt, line } }); };
  for (const b of BEATS) G.clock.on('stage:' + b[0], () => S.tell(b));
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
  S.update = (dt) => { if ((t -= dt) > 0) return; t = 1; S.draw(); };
  S.draw();
  return S;
}
