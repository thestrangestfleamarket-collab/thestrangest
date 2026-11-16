// the seven nights: who comes in and when, what each lets slip and to whom it matters, the choices that are yours (who you serve, cut off, warn, hide, give up or shoot), the showdown and how it ends; nothing here is scripted past what the facts allow
import * as THREE from 'three';
import { G, V3, pick, rand, clamp } from '../sushi/ctx.js';
import { PEOPLE, DRINKS } from './cast.js';
import { R } from './room.js';
import { plain, slab, pbr } from './kit.js';

// what can be known, in the words it is passed on in, and the words of yours that pass it on
export const SECRETS = {
  silver: ['Dutch Henry found a silver seam that runs under this saloon', /silver|seam|\bore\b|strike/i],
  bell: ['Jack Pike, not Cole Maddox, shot the stage guard Tom Bell', /pike.*(bell|guard|stage|husband|tom)|(bell|guard|husband).*pike/i],
  eli: ['Jack Pike shot Eli Garrett, on Silas Crowe\'s order', /pike.*(eli|uncle|garrett)|(eli|uncle|garrett).*pike|crowe.*(eli|uncle|killed)/i],
  bought: ['Sheriff Hale took Crowe\'s money to stay in his office the night Eli died', /(two hundred|bribe|bought|paid you|took.*money|stayed in.*office)/i],
  cole: ['Cole Maddox is in Perdition', /cole|maddox/i],
  cellar: ['Cole Maddox is hidden in the saloon\'s cellar', /cellar|hidden|hiding|under the bar|downstairs/i],
  piano: ['Ruby keeps the stage money inside the piano', /piano.*money|money.*piano|stage money/i],
  brothers: ['the Reverend is Cole Maddox\'s brother', /brother/i],
  spy: ['Ned sells Crowe everything he hears in this saloon', /ned.*(spy|sell|tell|crowe|rat)|(spy|rat|informer)/i],
  bullets: ['the bullets in Tom Bell and Eli Garrett were both .41 calibre, and only Pike carries a .41', /\.?41|bullet|calib|thunderer/i],
  guns: ['Crowe has hired four guns from Tombstone; they ride in Sunday', /tombstone|hired gun|four men|gunmen|riders/i],
  box: ['Big Tom hauled a locked strongbox from Crowe\'s ranch to the Tucson assay office after the robbery', /strongbox|assay/i],
  cheat: ['Pike keeps an ace up his left sleeve', /cheat|ace|sleeve/i],
  cuffs: ['Rosa washed blood out of Pike\'s cuffs the morning after Eli died', /blood|cuffs|laundry/i],
};
const NIGHT = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const OPEN = 840, CLOSE = 70;

export function buildStory(room) {
  const W = { night: 0, t: 0, phase: 'closed', facts: new Set(), know: new Set(), heard: {}, hp: 100, done: new Set(), log: [], rate: +(G.params?.get('rate') || 1), ended: null, deaths: [], takings: [] };
  const story = { W }, F = () => G.folk, has = (f) => W.facts.has(f), fact = (f) => { if (!W.facts.has(f)) { W.facts.add(f); W.log.push([W.night, Math.round(W.t), f]); } }, P = (id) => F().byId(id), here = (id) => { const p = P(id); return !!(p && p.here && p.alive); }, alive = (id) => { const p = P(id); return !p || p.alive; };
  const say = (id, text, about) => F().say(id, text, about || text), trust = (id, n) => { const p = P(id); if (p) p.trust = clamp(p.trust + n, -5, 6); return p ? p.trust : 0; };
  const later = []; const after = (s, f) => later.push({ at: W.t + s, f });
  const fade = document.getElementById('fade'); const card = (text, secs, then) => { if (fade) { fade.textContent = text; fade.style.opacity = 1; } story.cardText = text; G.cardT = secs; story.cardThen = then; };

  // you learn a thing (they tell you), or pass one on (you tell them)
  const learn = (k) => { if (!W.know.has(k)) { W.know.add(k); fact('know_' + k); } };
  const tell = (id, k, text) => { say(id, text, `you let slip to the barkeep, in your own words: ${SECRETS[k][0]}`); learn(k); };
  const knows = (id, k) => (W.heard[id] ||= new Set()).has(k);
  // what each one does with what you tell them
  const HEAR = {
    ada: { bell: () => { fact('ada_knows_pike'); trust('ada', 2); say('ada', 'Pike. All this time I have been sharpening myself for the wrong man. Thank you, barkeep. I will not forget it.'); }, cole: () => { if (!has('ada_knows_pike')) { fact('ada_hunts'); say('ada', 'Here? In Perdition? Then I know what I came into this place for.'); } }, cellar: () => { if (!has('ada_knows_pike')) { fact('ada_hunts'); fact('cellar_out'); say('ada', 'Under my feet. God forgive me for what I am going to do.'); } }, bullets: () => { fact('ada_knows_pike'); say('ada', 'A forty-one. Tom was killed with a forty-one. And that gambler wears one. I see.'); } },
    hale: { eli: () => { trust('hale', has('know_bought') ? 1 : -1); say('hale', has('know_bullets') ? 'You have the bullets and you have me. God help me, I will stand up this time.' : 'That is a hanging thing to say with nothing behind it, barkeep. Bring me something I can swear to.'); if (has('know_bullets')) fact('hale_turns'); }, bullets: () => { fact('hale_turns'); trust('hale', 2); say('hale', 'A forty-one in both men. Doc will swear it? Then I have been a coward long enough. When the time comes, I will be at your door.'); }, bought: () => { trust('hale', -1); fact('hale_shamed'); say('hale', 'Yes. Two hundred dollars. I have not slept a night since. What would you have me do about it now?'); }, cole: () => { fact('hale_hunts'); say('hale', 'Maddox, in my town. I am obliged to you. Five hundred dollars says he will not leave it.'); trust('cole', -3); trust('ruby', -3); }, cellar: () => { fact('hale_hunts'); fact('cellar_out'); say('hale', 'Your cellar. Stand away from the hatch, barkeep.'); trust('ruby', -5); }, cuffs: () => { trust('hale', 1); say('hale', 'Blood on his cuffs. It is not proof. But it is one more stone on the scale.'); }, guns: () => { say('hale', 'Four of them. Then Sunday is the day. I had better decide whose sheriff I am.'); } },
    crowe: { cole: () => { fact('crowe_knows_cole'); say('crowe', 'Is he, now. You are a useful man to know, friend.'); }, cellar: () => { fact('crowe_knows_cole'); fact('cellar_out'); say('crowe', 'Under your own floor. How neighbourly of you to mention it.'); }, silver: () => { fact('crowe_knows_silver'); say('crowe', 'Then you understand why my offer is so generous. And why it will not last.'); }, eli: () => { trust('crowe', -3); fact('crowe_warned'); say('crowe', 'That is a dangerous thing to say out loud, friend. Men have had accidents for less.'); } },
    ned: { cole: () => { fact('crowe_knows_cole'); say('ned', 'Maddox! Well, I never. I won\'t breathe a word, boss.'); }, cellar: () => { fact('crowe_knows_cole'); fact('cellar_out'); say('ned', 'In the cellar. Lord. Your secret\'s safe with me, boss.'); }, silver: () => { fact('ned_heard_silver'); say('ned', 'Silver, under us? Ha. Old Dutch and his stories.'); }, spy: () => { fact('ned_exposed'); say('ned', has('ned_paid') ? 'I... yes. Five dollars a week. I have a mother in St. Louis. I\'ll stop. I swear I\'ll stop.' : 'Me? Boss, who has been telling you such things?'); if (P('ned').trust >= 1) fact('ned_stops'); } },
    cole: { bell: () => { trust('cole', 1); say('cole', 'You know it. Then you are the second living soul who does. Pike put that guard down laughing.'); }, brothers: () => { say('cole', 'Josiah told you. Then he trusts you more than he trusts me.'); }, guns: () => { fact('ally_cole'); say('cole', 'Four guns and Pike. I can\'t leave Ruby in the middle of that. I\'ll stay.'); } },
    ruby: { spy: () => { trust('ruby', 1); say('ruby', 'Ned? Oh, sugar. And I have been telling that boy my troubles for a year.'); fact('ruby_warned'); }, piano: () => { say('ruby', 'Hush. Who told you? Don\'t look at it. Don\'t ever look at it.'); }, guns: () => { say('ruby', 'Then we have until Sunday. Cole will not run if I don\'t, and I can\'t leave you to that alone.'); } },
    josiah: { cellar: () => { trust('josiah', 2); fact('josiah_knows'); say('josiah', 'You are hiding him. Then you are a better Christian than most in my pews. He is my brother, barkeep. My little brother.'); learn('brothers'); }, guns: () => { fact('ally_josiah'); say('josiah', 'Four hired killers. I laid my guns under the pulpit and swore an oath. The Lord will have to forgive me one more Sunday.'); }, eli: () => { say('josiah', 'I buried Eli. I thought as much, standing over him. Vengeance is mine, saith the Lord. But He is slow.'); } },
    dutch: { spy: () => { fact('dutch_warned'); say('dutch', 'Ned? Ach. And I told the whole room about my silver. I am a fool. I go home by the back way tonight, ja.'); }, silver: () => { fact('dutch_warned'); say('dutch', 'Shh! Did I say that? I said that. Ach, Gott. I say nothing more. I go careful.'); } },
    tom: { cheat: () => { fact('tom_knows_cheat'); say('tom', 'An ace up his sleeve! I\'ve lost a month\'s wages to that smiling devil. Just let me catch him at it.'); }, silver: () => { say('tom', 'Under this very floor? Then God help you, friend, for Crowe will have it.'); }, guns: () => { if (P('tom').trust >= 1) { fact('ally_tom'); say('tom', 'Four of them? Against you? Not while Tom Brannigan can swing a wagon spoke. I\'ll be here.'); } else say('tom', 'Four guns. That\'s no business for a teamster, friend.'); } },
    mateo: { guns: () => { if (P('mateo').trust >= 1) { fact('ally_mateo'); say('mateo', 'Crowe pays strangers and does not pay us. I have a rifle, señor. Sunday I will bring it.'); } else say('mateo', 'I know of them. It is not my fight, señor.'); }, eli: () => { tell('mateo', 'cuffs', 'I saw Pike that night. His horse was lathered and he washed his hands at the trough a long time. Rosa saw his shirt.'); } },
    eb: { guns: () => { fact('ally_eb'); say('eb', 'He\'s takin\' my land anyhow. I\'d as soon die standin\' up in here as starve out there. I\'ll come.'); }, silver: () => { say('eb', 'So that\'s why he\'s squeezin\' the whole creek. It ain\'t cattle at all.'); } },
    doc: { bell: () => { tell('doc', 'bullets', 'You know, then. I dug a forty-one out of Tom Bell, and its twin out of your uncle. One man here carries that calibre. I was afraid to say it.'); trust('doc', 1); }, eli: () => { tell('doc', 'bullets', 'Yes. A forty-one calibre ball, in Eli and in the stage guard both. Only Pike carries one. There. I have said it.'); } },
    pike: { cheat: () => { fact('pike_called'); say('pike', 'That is an ugly word, barkeep. I would be careful where I set it down.'); trust('pike', -3); }, bell: () => { trust('pike', -4); fact('pike_marks_you'); say('pike', 'Somebody has been telling you stories. I would like very much to know who.'); }, eli: () => { trust('pike', -4); fact('pike_marks_you'); say('pike', 'Your uncle talked like that too. Right up to the end.'); } },
    rosa: { eli: () => { tell('rosa', 'cuffs', 'I washed Pike\'s shirt the next morning. Blood to the elbows. I boiled it twice and said nothing. I was afraid.'); }, guns: () => { say('rosa', 'I know. Señor Crowe\'s housekeeper told me. Mateo says he will stand with you. I told him he is a fool. I am proud of him.'); } },
    quimby: { silver: () => { say('quimby', 'Argentiferous deposits! My dear sir, say no more, the walls have auricles.'); } },
    ines: { guns: () => { say('ines', 'I have seen it in the cards three nights, mijo. Five swords, and a tower. Keep the shotgun close.'); } },
  };
  story.hear = (id, k) => { if (knows(id, k)) return false; W.heard[id].add(k); fact(id + '_heard_' + k); const f = HEAR[id] && HEAR[id][k]; if (f) f(); else say(id, pick(['Is that so.', 'Well now. I had not heard that.', 'You don\'t say.']), `the barkeep just told you: ${SECRETS[k][0]}. React as you would.`); return true; };

  // ---- the cellar hatch behind the bar
  { const H = R.hatch, lid = slab(0.8, 0.04, 0.7, pbr('planks', { tile: 0.8, color: 0x8a7a6a }), H.x, 0.021, H.z, G.scene), ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 12).rotateX(Math.PI / 2), plain(0x2a2622, { metal: 0.9, rough: 0.5 })); ring.position.set(H.x, 0.05, H.z - 0.2); G.scene.add(ring);
    const b = { name: 'the cellar hatch', r: 0.12, getPos: () => ring.position, press: () => { G.audio.play('door'); story.hatch(); } }; ring.userData.button = b; lid.userData.button = b; G.pickRoot.add(lid, ring); G.buttons.push(b); }
  story.hatch = () => { if (has('cole_asks_hide') && here('cole') && !has('cole_hidden')) { fact('cole_hidden'); trust('cole', 2); trust('ruby', 2); F().send('cole', [['hide']]); G.hint = 'Cole Maddox is in your cellar.'; } else if (has('cole_hidden') && !has('cellar_out') && W.phase !== 'open') { /* he stays */ } };

  // ---- the nights: [seconds after opening, who, what they do, if]
  const B = (n = 1) => ['bar', n], S = (t, s = 200) => ['sit', t, s], St = (s, t = 120) => ['stand', s, t];
  const dutchAlive = () => !has('dutch_dead'), coleAround = () => alive('cole') && !has('cole_taken') && !has('cole_gone');
  const NIGHTS = [
    { card: 'A month ago your uncle Eli Garrett was shot in the alley behind his own saloon.\nNobody saw. Nobody was charged.\nHe left you the deed, a shotgun and a town full of people who drink here.\n\nRing the bell on the back bar to open.',
      come: [[4, 'ned', [B(1), S('poker', 9999)]], [20, 'dutch', [B(3), S('left', 200)]], [60, 'hale', [B(2), St('board', 60)]], [130, 'ruby', [B(1), St('stage', 380), B(1)]], [150, 'doc', [B(1), St('piano', 420), B(1)]], [230, 'tom', [B(3), S('left', 220)]], [300, 'pike', [B(1), S('poker', 420)]], [380, 'crowe', [B(1)]], [470, 'eb', [B(1), S('left', 200)]], [500, 'ines', [S('stove', 9999)]], [505, 'rosa', [St('stove', 60), B(1), St('stove', 200)]], [620, 'josiah', [B(1), St('stove', 100)]]] },
    { card: 'TUESDAY\n\nThe till took in a little. The talk took in more.',
      come: [[4, 'ned', [B(1), S('poker', 9999)]], [30, 'ada', [B(1), S('middle', 500)]], [80, 'quimby', [B(2), S('middle', 300)]], [140, 'ruby', [B(1), St('stage', 300), B(1)]], [150, 'doc', [B(1), St('piano', 320)]], [200, 'dutch', [B(2), S('left', 500)], dutchAlive], [260, 'mateo', [B(1), S('left', 300)]], [270, 'rosa', [St('stove', 400)]], [340, 'tom', [B(2), St('pool', 300)]], [420, 'cole', [B(1)]], [520, 'hale', [B(1), St('board', 80)]], [560, 'pike', [B(1), S('left', 300)]]] },
    { card: 'WEDNESDAY', come: [[4, 'ned', [B(1), S('poker', 9999)]], [30, 'doc', [B(3), S('middle', 400)]], [90, 'hale', [B(2), S('middle', 200)]], [150, 'ruby', [B(1), St('stage', 300), B(1)]], [210, 'crowe', [B(1)]], [300, 'mateo', [B(2), St('pool', 200)]], [310, 'rosa', [B(1), St('stove', 300)]], [380, 'ada', [B(1), S('middle', 300)]], [450, 'eb', [B(2), S('left', 300)]], [520, 'josiah', [B(1), St('stove', 200)]], [560, 'tom', [B(2), St('darts', 200)]], [600, 'ines', [S('stove', 9999)]]] },
    { card: 'THURSDAY\n\nPoker night.', come: [[4, 'ned', [B(1), S('poker', 9999)]], [40, 'pike', [B(1), S('poker', 9999)]], [70, 'tom', [B(2), S('poker', 9999)]], [110, 'eb', [B(1), S('poker', 9999)]], [150, 'quimby', [B(2), S('middle', 500)]], [200, 'ruby', [B(1), St('stage', 300), B(1)]], [210, 'doc', [B(1), St('piano', 320)]], [330, 'josiah', [B(1), St('stove', 200)]], [400, 'hale', [B(1), St('board', 200)]], [430, 'ada', [B(1), S('middle', 300)]]] },
    { card: 'FRIDAY', come: [[4, 'ned', [B(1), S('poker', 9999)]], [40, 'ruby', [B(2), St('stage', 200), B(1)]], [100, 'crowe', [B(1), S('middle', 200)]], [160, 'rosa', [B(1), St('stove', 300)]], [170, 'mateo', [B(2), St('darts', 200)]], [240, 'quimby', [B(3), S('middle', 300)]], [320, 'doc', [B(2), St('piano', 300)]], [400, 'tom', [B(3), St('pool', 200)]], [470, 'hale', [B(1)]], [480, 'pike', [B(1)]], [600, 'ines', [S('stove', 9999)]]] },
    { card: 'SATURDAY\n\nThey ride in tomorrow.', come: [[4, 'ned', [B(1), S('poker', 9999)]], [30, 'josiah', [B(1), St('stove', 300)]], [80, 'ada', [B(1), S('middle', 400)]], [130, 'tom', [B(2), S('left', 300)]], [180, 'mateo', [B(1), S('left', 300)]], [185, 'rosa', [B(1), St('stove', 300)]], [240, 'eb', [B(1), S('left', 300)]], [300, 'pike', [B(2), S('poker', 9999)]], [330, 'ruby', [B(1), St('stage', 200), B(1)]], [340, 'doc', [B(1), St('piano', 200)]], [420, 'hale', [B(1), St('board', 400)]], [560, 'crowe', [B(1)]]] },
    { card: 'SUNDAY\n\nNobody is singing tonight.', come: [[4, 'ines', [S('stove', 9999)]], [20, 'ruby', [B(1), St('stage', 9999)]], [60, 'doc', [B(1), St('piano', 9999)]]] },
  ];
  const sched = (n) => NIGHTS[n].come.filter((c) => (!c[3] || c[3]()) && alive(c[1]) && !has(c[1] + '_gone') && !(c[1] === 'cole' && (has('cole_hidden') || !coleAround()))).map((c) => ({ at: c[0], id: c[1], plan: c[2] }));
  let queue = [];

  // ---- beats: things that happen when the facts allow, once each
  const once = (k, f) => { if (W.done.has(k)) return false; W.done.add(k); f(); return true; };
  const beat = (k, when, f) => { if (!W.done.has(k) && when()) once(k, f); };
  function beats() {
    const n = W.night, t = W.t;
    if (n === 0) {
      beat('hale_hello', () => here('hale') && P('hale').state !== 'walk' && t > 70, () => say('hale', 'So you are Eli\'s kin. Amos Hale. I was sorry about your uncle. If you see that face on my board come through those doors, Cole Maddox, five hundred dollars, you ring that bell.'));
      beat('crowe_offer1', () => here('crowe') && P('crowe').state !== 'walk' && P('crowe').act?.[0] === 'bar', () => { say('crowe', 'Silas Crowe. I knew your uncle. A stubborn man. I will give you two thousand dollars for this place, friend, tonight, in gold. Think on it. I am very patient.'); fact('offer1'); });
      beat('ines_cards', () => here('ines') && P('ines').state === 'sit' && t > 540, () => say('ines', 'Mijo. I turned three cards for you. The lovers, the hanged man, and the tower. Somebody you trust is already selling you. Watch who listens.'));
      beat('ruby_hello', () => here('ruby') && P('ruby').glass, () => say('ruby', 'So you\'re the new boss. Ruby Vale. I come with the piano, sugar. Eli let me sing for my supper and a room upstairs.'));
    }
    if (n === 1) {
      beat('ada_asks', () => here('ada') && P('ada').glass, () => say('ada', 'I am Tom Bell\'s widow. I have never set foot in a saloon. But men talk when they drink, and one of them knows where Cole Maddox is. You hear things, barkeep. I can pay.'));
      beat('cole_in', () => here('cole') && P('cole').state !== 'walk', () => { fact('cole_seen'); learn('cole'); say('cole', 'Whiskey. And don\'t say my name, friend. I can see you know it from that board.'); after(18, () => { if (here('ruby') && here('cole')) say('ruby', 'He\'s with me, sugar. He never shot that guard. Please. The sheriff comes by at this hour. The hatch behind you. Hide him.'); fact('cole_asks_hide'); G.hint = 'The cellar hatch is behind you, to your left.'; }); });
      beat('hale_sees', () => here('hale') && here('cole') && has('cole_asks_hide') && P('hale').state !== 'walk', () => { if (has('ada_hunts') || P('hale').trust < -1) { fact('hale_hunts'); say('hale', 'Maddox. Keep your hands on the bar.'); arrest(); } else { say('hale', 'Quiet tonight. Who\'s your friend at the end there? ... No matter. I\'ll take a rye.'); after(40, () => { if (here('cole') && !has('cole_hidden')) { F().leave('cole'); fact('cole_slipped'); } }); } });
      beat('pike_dutch', () => t > 640 && here('pike') && here('dutch') && has('ned_heard_silver') && !has('dutch_warned') && !has('tom_walks_dutch'), () => { say('pike', 'Dutch, old friend, you have had enough of the barkeep\'s beer. Let me walk you home. I have a bottle of the good stuff in my saddlebag.'); after(9, () => { if (here('dutch') && here('pike')) { say('dutch', 'Ach, you are a gentleman, Jack. A gentleman!'); F().leave('dutch'); F().leave('pike'); fact('dutch_doomed'); } }); });
    }
    if (n === 2) {
      beat('dutch_news', () => t > 45 && here('doc'), () => { if (has('dutch_doomed')) { fact('dutch_dead'); W.deaths.push('dutch'); const d = P('dutch'); d.alive = false; say('doc', 'They pulled Dutch Henry out of Dry Creek this morning. Drowned in a foot of water, they say. A man who never washed in his life. I signed the paper. God forgive me.'); } else if (dutchAlive()) say('doc', 'Somebody turned over Dutch Henry\'s cabin last night. Every board up. The old fool was not home, thank God.'); });
      beat('crowe_offer2', () => here('crowe') && P('crowe').act?.[0] === 'bar' && P('crowe').state !== 'walk', () => { say('crowe', has('dutch_dead') ? 'A sad thing about the old Dutchman. This is hard country for men alone. Five thousand, friend. It is the last time I will say a number.' : 'Five thousand dollars, friend. It is the last time I will say a number. After this I only say a day.'); fact('offer2'); });
      beat('eb_rifle', () => here('eb') && P('eb').drunk >= 1 && P('eb').state === 'sit', () => say('eb', 'He\'s called my note. Ten days. Four children. I been thinkin\' about my rifle and Mr Crowe\'s parlour window. Tell me I\'m wrong, barkeep.'));
    }
    if (n === 3) {
      beat('poker', () => t > 330 && here('pike') && here('eb') && P('eb').state === 'sit' && P('pike').state === 'sit', () => { say('eb', 'That\'s my seed money. That\'s every cent. Four kings don\'t lose to four aces twice in a night, mister.'); fact('poker_hot');
        after(7, () => { if (!here('pike') || !here('eb')) return; if (has('tom_knows_cheat') && here('tom')) { say('tom', 'It\'s up his sleeve! I see it! Left sleeve, ye thievin\' snake!'); fact('pike_shown'); trust('pike', -2); after(4, () => { if (here('pike')) { say('pike', 'A misunderstanding. Keep the pot, farmer. I find I am tired of this town\'s hospitality tonight.'); F().leave('pike'); trust('eb', 2); trust('tom', 1); fact('eb_saved'); } }); }
          else { say('pike', 'Are you calling me a cheat, farmer? Because that is a thing a man says with a gun in his hand.'); F().arm('pike'); F().arm('eb'); after(5, () => { if (here('pike') && here('eb') && !has('eb_saved')) { say('eb', 'I am. God help me, I am.'); F().draw('eb', 'pike'); P('eb').aimT = 2.4; F().draw('pike', 'eb'); P('pike').aimT = 0.5; fact('poker_guns'); } }); } }); });
      beat('josiah_cole', () => t > 420 && has('cole_hidden') && here('josiah'), () => { tell('josiah', 'brothers', 'Barkeep. A word, low. The man under your floor is my brother. I have not said that aloud in six years. Whatever you need of me, ask it.'); fact('josiah_knows'); trust('josiah', 1); });
    }
    if (n === 4) {
      beat('ned_sells', () => t > 30 && has('cole_hidden') && !has('ned_stops') && alive('ned') && (has('ned_heard_cellar') || P('ned').trust < 3), () => { fact('crowe_knows_cole'); fact('cellar_out'); fact('ned_betrays'); });
      beat('raid', () => t > 470 && has('cellar_out') && has('cole_hidden') && here('hale'), () => { fact('raid'); if (has('hale_turns')) { say('hale', 'Crowe has sworn a warrant for a man in your cellar. I looked. It is empty. I will tell him so. You have until Sunday, both of you.'); trust('hale', 1); } else { say('hale', 'I have a warrant, barkeep. Somebody told Mr Crowe what you keep under your floor. Open the hatch, or stand aside.'); F().arm('hale'); F().arm('pike'); fact('raid_live'); G.hint = 'Open the hatch and give him up, or stand in the way.'; after(40, () => { if (has('raid_live') && !has('raid_done')) { fact('raid_done'); fact('cole_taken'); fact('cole_gone'); trust('ruby', -2); say('hale', 'Then I open it myself. Come up, Maddox. Slow.'); } }); } });
      beat('crowe_ruby', () => here('crowe') && here('ruby') && t > 150, () => { say('crowe', 'Miss Vale. Three hundred dollars, due. Or you may come and sing at my house instead, and we will call it settled.'); after(8, () => { if (here('ruby')) say('ruby', has('cole_hidden') || coleAround() ? 'You will have your money Sunday, Mr Crowe. Every cent.' : 'I have nobody left to say no for, Mr Crowe. Give me until Sunday.'); }); });
      beat('quimby_guns', () => here('quimby') && P('quimby').drunk >= 2, () => tell('quimby', 'guns', 'I should not vouchsafe this. In Tombstone I observed four gentlemen of the pistol accept gold from Mr Crowe\'s agent. They ride for Perdition Sunday. I am leaving Saturday.'));
    }
    if (n === 5) {
      beat('ada_pike', () => t > 400 && has('ada_knows_pike') && here('ada') && here('pike') && P('pike').state === 'sit', () => { F().arm('ada'); say('ada', 'Jack Pike. My name is Ada Bell. You shot my husband on the Tucson road.'); after(3, () => { if (!here('pike') || !here('ada')) return; if (P('pike').drunk >= 3) { F().draw('ada', 'pike'); P('ada').aimT = 0.4; fact('ada_fires'); } else { F().arm('pike'); F().draw('pike', 'ada'); P('pike').aimT = 0.7; F().draw('ada', 'pike'); P('ada').aimT = 1.6; fact('ada_fires'); } }); });
      beat('wedding', () => t > 600 && has('cole_hidden') && !has('cole_taken') && here('josiah') && here('ruby') && alive('cole'), () => { fact('wedding'); say('josiah', 'Barkeep, put the lamps low and bar the door a minute. I have a wedding to do, and the groom cannot be seen in church.'); after(10, () => { F().enter('cole', [St('stage', 120), ['hide']]); after(14, () => say('josiah', 'Cole Maddox, Ruby Vale. Before God and one bartender. What He has joined, let no man put asunder. Kiss her and get back under the floor.')); }); });
      beat('crowe_day', () => here('crowe') && P('crowe').state !== 'walk' && P('crowe').act?.[0] === 'bar', () => { say('crowe', 'I said I would name a day. Tomorrow night, friend. Have the deed on the bar, signed, or I will take the place as it stands when my men are done with it.'); fact('ultimatum'); learn('guns'); });
      beat('hale_side', () => t > 500 && here('hale'), () => { if (has('hale_turns')) { fact('ally_hale'); say('hale', 'I will be here tomorrow, barkeep. Wearing this.'); } else if (P('hale').trust >= 3) { fact('ally_hale'); say('hale', 'You have stood me fair all week and never once asked what I did that night. I will be here tomorrow.'); } else say('hale', 'Tomorrow I have business out at the county line. All day. You understand me.'); });
    }
    if (n === 6) showdown(t);
    // any night: the sheriff asks after Maddox once he is hunting; whoever is drunk enough says what they hide
    for (const p of F().people) { if (!p.here || !p.alive || p.state === 'walk') continue; const full = p.drunk >= p.S.holds;
      if (p.id === 'dutch' && p.drunk >= 1.7) once('dutch_blabs', () => { tell('dutch', 'silver', 'Silver! I tell you, as thick as my arm, and it runs from my claim right under this floor, under your very boots! Ha! Dutch Henry is a rich man!'); if (here('ned')) { fact('ned_heard_silver'); } });
      if (p.id === 'doc' && full) once('doc_blabs', () => tell('doc', 'bullets', 'A forty-one. I took a forty-one calibre ball out of the stage guard and another out of Eli. Nobody in this county carries a forty-one but Jack Pike. I never said that.'));
      if (p.id === 'hale' && full) once('hale_blabs', () => tell('hale', 'bought', 'Two hundred dollars. That is what I cost. Crowe sent it over and I sat in my office with the lamp out while they killed your uncle in the alley.'));
      if (p.id === 'tom' && full) once('tom_blabs', () => tell('tom', 'box', 'I\'ll tell ye a queer thing. Week after the stage was robbed I hauled a strongbox from Crowe\'s ranch to the assay office. Paid double to forget it. An\' I had, till this beer.'));
      if (p.id === 'ned' && full) once('ned_blabs', () => { tell('ned', 'spy', 'Five dollars a week Mr Crowe gives me. Just to say who drinks with who. It ain\'t hurting anybody, boss. Is it?'); fact('ned_paid'); });
      if (p.id === 'ruby' && p.trust >= 3 && n >= 2) once('ruby_tells', () => tell('ruby', 'piano', 'I\'m going to tell you something because I have to tell somebody. Cole\'s share is inside the piano. Eight hundred dollars. If anything happens to us, it is yours.'));
      if (p.id === 'ruby' && p.trust >= 1 && n >= 3) once('ruby_cheat', () => tell('ruby', 'cheat', 'Watch Pike\'s left hand when he deals, sugar. I\'ve stood behind that table a year. There is an ace lives in that sleeve.'));
      if (p.id === 'rosa' && p.trust >= 2 && n >= 2) once('rosa_tells', () => tell('rosa', 'cuffs', 'I will tell you what I told no one. The morning after your uncle died I washed Jack Pike\'s shirt. Blood to the elbows.'));
      if (p.id === 'mateo' && p.trust >= 2 && n >= 4) once('mateo_tells', () => tell('mateo', 'guns', 'Señor. Crowe has sent to Tombstone for four pistoleros. They come Sunday. He has not paid us in two months but he has gold for that.'));
      if (p.id === 'cole' && p.trust >= 1) once('cole_tells', () => tell('cole', 'bell', 'I robbed that stage. I never fired a shot. Pike rode with us, Crowe\'s man all along. He killed the guard for the pleasure of it and took the box to Crowe.'));
    }
  }
  function arrest() { F().arm('hale'); after(6, () => { if (!here('cole')) return; if (P('cole').trust >= 2) { F().arm('cole'); F().draw('cole', 'hale'); F().draw('hale', 'cole'); } else { fact('cole_taken'); fact('cole_gone'); F().send('cole', [['leave']]); F().send('hale', [['leave']]); trust('ruby', -2); say('cole', 'I\'ll come. Not in front of her.'); } }); }

  // ---- Sunday: Crowe comes for the deed with his guns; whoever stands with you is in the room
  const FOES = ['pike', 'gun1', 'gun2', 'gun3'], side = { foes: [], friends: [] };
  Object.assign(PEOPLE, { gun1: { ...PEOPLE.cole, body: 'outlaw', name: 'a Tombstone gun', short: 'the gunman', hides: '', who: 'A hired killer.' }, gun2: { ...PEOPLE.mateo, body: 'huaso', name: 'a Tombstone gun', short: 'the gunman', hides: '', who: 'A hired killer.' }, gun3: { ...PEOPLE.tom, body: 'railway_carter', name: 'a Tombstone gun', short: 'the gunman', hides: '', who: 'A hired killer.', holds: 9 } });
  function showdown(t) {
    beat('friends', () => t > 90, () => { for (const id of ['hale', 'josiah', 'ada', 'tom', 'mateo', 'eb']) if (has('ally_' + id) && alive(id)) { F().arm(id); F().enter(id, [St(pick(['stove', 'pool', 'darts', 'stage']), 9999)]); side.friends.push(id); } if (has('cole_hidden') && !has('cole_taken') && alive('cole')) { F().arm('cole'); F().enter('cole', [St('stage', 9999)]); side.friends.push('cole'); fact('ally_cole'); }
      const who = side.friends.length; after(6, () => { const f = side.friends.find(here); if (f) say(f, who > 3 ? 'Look at this. Half of Perdition. He did not count on that.' : who ? 'It is not many. It will have to do.' : ''); }); if (!who) G.hint = 'Nobody came. The shotgun is under the bar.'; });
    beat('crowe_comes', () => t > 260, () => { F().enter('crowe', [St('door', 9999)]); F().arm('crowe'); FOES.forEach((id, i) => { if (!alive(id) || (id === 'gun3' && !has('crowe_warned') && side.friends.length < 3)) return; F().arm(id); const p = F().enter(id, [St(['pool', 'darts', 'stove', 'board'][i], 9999)]); if (p) { p.S = PEOPLE[id]; side.foes.push(id); } }); fact('showdown');
      after(12, () => say('crowe', 'Good evening, friend. I see no deed on the bar. That is a pity. I did ask nicely, three times.')); after(22, () => { if (W.ended) return; fact('fight'); G.hint = ''; for (const id of side.foes) if (here(id)) F().draw(id, target(id)); for (const id of side.friends) if (here(id)) F().draw(id, target(id)); }); });
    if (has('fight') && !W.ended) { const foes = side.foes.filter(here), fr = side.friends.filter(here);
      for (const id of [...foes, ...fr]) { const p = P(id); if (p.drawn && (!p.foe || (p.foe !== 'you' && !here(p.foe)))) { const x = target(id); if (x) F().draw(id, x); else F().holster(id); } }
      if (!foes.length) once('won', () => { fact('won'); const c = P('crowe'); if (here('crowe')) { say('crowe', 'Now, friend. Let us be reasonable men. Name your price.'); G.hint = 'Crowe is yours. The law, or the gun.'; after(25, () => { if (here('crowe') && !W.ended) { if (alive('hale') && has('ally_hale')) { say('hale', 'Silas Crowe, I arrest you for the murder of Eli Garrett and Thomas Bell. You will hang in Tucson, and I will swear to my own part.'); fact('crowe_tried'); F().send('crowe', [['leave']]); F().send('hale', [['leave']]); } else { fact('crowe_ran'); F().send('crowe', [['leave']]); } after(12, () => finish()); } }); } else after(8, () => finish()); }); }
  }
  const target = (id) => { const foe = side.foes.includes(id), L = (foe ? side.friends : side.foes).filter(here); if (foe) L.push('you', 'you'); return L.length ? pick(L) : null; };

  // ---- what the room does: orders, thanks, complaints, money, blood
  const ORDER = { whiskey: ['Whiskey.', 'Whiskey, barkeep.', 'A whiskey, and leave room in it for another.'], rye: ['Rye.', 'A rye, when you have a hand free.'], gin: ['Gin, sugar.', 'A gin, if you please.'], brandy: ['Brandy. The French, if you have it.', 'A brandy.'], beer: ['Beer!', 'A beer, barkeep.', 'Draw me a beer.'], sarsaparilla: ['A sarsaparilla, please.', 'Sarsaparilla.'] };
  story.event = (name, d) => {
    const p = d.id ? P(d.id) : null;
    if (name === 'order') say(d.id, pick(ORDER[d.drink]), `order a ${d.drink} from the barkeep${p.said ? ', another one' : ''}`);
    else if (name === 'waiting') say(d.id, d.n > 2 ? 'Have I died and nobody told me? ' + DRINKS[d.drink][0] + '!' : 'Still dry over here, barkeep.', `you have waited a long while for your ${d.drink} and say so`);
    else if (name === 'unserved') { trust(d.id, -1); say(d.id, 'I will drink at home, then.', 'you were never served; say so and give up on the drink'); }
    else if (name === 'wrong') { say(d.id, d.why === 'dirty' ? 'There is somebody else\'s mouth on this glass.' : d.why === 'froth' ? 'Half of this is air, barkeep.' : d.why === 'glass' ? 'In that? I am not a horse.' : d.why === 'wrong' ? `That is ${d.got}. I asked for ${d.want}.` : d.why === 'mixed' ? 'What have you put in this?' : 'There is nothing in it.', `the barkeep set down the wrong thing (${d.why}${d.got ? ': ' + d.got : ''}); you wanted ${d.want}`); }
    else if (name === 'served') { trust(d.id, d.short ? 0 : d.waited < 25 ? 0.5 : 0.25); if (p.house) p.house = false; else F().pays(d.id, DRINKS[d.drink][1] * (p.id === 'crowe' ? 4 : 1)); if (d.short) say(d.id, 'A short measure. Eli poured to the line.', 'the barkeep poured you a short measure'); else if (Math.random() < 0.5) say(d.id, pick(['Obliged.', 'That will do.', 'Thank you kindly.', 'To your health.']), 'thank the barkeep for the drink, briefly'); }
    else if (name === 'changed') { trust(d.id, d.over > 0 ? 0.5 : 0.1); if (d.over >= 25) say(d.id, 'You have given me too much. I will not say no.', 'the barkeep gave you more change than you were owed; you keep it, pleased'); }
    else if (name === 'changeWait') say(d.id, `I had ${d.due >= 100 ? 'a dollar and more' : d.due + ' cents'} coming back, barkeep.`, `you are still waiting for ${d.due} cents in change`);
    else if (name === 'shortchanged') { trust(d.id, -1); say(d.id, 'Short. I will remember that.', `the barkeep short-changed you by ${d.due} cents`); }
    else if (name === 'cigar') say(d.id, 'And a light, if you would.', 'you have your cigar and ask the barkeep for a light');
    else if (name === 'lit') { trust(d.id, 0.25); say(d.id, pick(['Obliged.', 'That is a fair cigar.']), 'the barkeep lit your cigar; thank him'); }
    else if (name === 'struck') { trust(d.id, -3); say(d.id, d.with === 'mallet' ? 'You hit me! With a mallet!' : 'What in hell! You threw that at me!', `the barkeep just hit you with ${d.with}`); if (p.armed && (d.with === 'mallet' || d.hard > 1)) F().draw(d.id, 'you'); else if (d.with === 'mallet' || d.hard > 0.6) F().leave(d.id); }
    else if (name === 'killed') { W.deaths.push(d.id); fact(d.id + '_dead'); if (d.by === 'you') { fact('you_killed_' + d.id); if (!FOES.includes(d.id) && d.id !== 'crowe' && !has('fight')) { fact('murder'); for (const q of F().people) if (q.alive) q.trust = Math.min(q.trust, -2); F().flee(); } }
      if (d.id === 'cole') { trust('ruby', d.by === 'you' ? -6 : -1); if (d.by === 'you') { fact('bounty'); G.bar.till += 50000; } } if (d.id === 'pike' && d.by !== 'you' && has('ada_fires')) { fact('ada_avenged'); after(4, () => { if (here('ada')) say('ada', 'It is done, Tom. Sheriff, I am here. I will not run.'); if (here('hale')) after(9, () => say('hale', 'I saw a man draw on a woman, Mrs Bell. That is what I will write.')); }); }
      if (d.id === 'eb' && has('poker_guns')) after(4, () => { if (here('pike')) { say('pike', 'You all saw him draw first. Sheriff will tell you the same.'); F().holster('pike'); } }); if (d.id === 'crowe') after(6, () => finish()); if (!has('fight') && F().crowd() > 2) after(1, () => F().flee()); }
    else if (name === 'gunfire') { if (d.by === 'you' && !has('fight') && !has('poker_guns') && !has('raid_live')) once('shot_n' + W.night, () => { for (const q of F().people) if (q.here && q.alive) q.trust -= 0.5; }); }
    else if (name === 'foeGone') { if (!has('fight')) { F().holster(d.id); if (has('poker_guns') && d.id === 'eb') { fact('eb_won'); say('eb', 'God forgive me. He drew. You all saw.'); } } }
    else if (name === 'drank') { if (['crowe', 'pike', 'tom', 'quimby', 'hale', 'doc'].includes(p.id) && !p.wantCigar && Math.random() < 0.6) { p.wantCigar = 1; say(d.id, 'And a cigar.', 'ask the barkeep for a cigar as well'); } if (p.id === 'pike' && p.drunk >= 3) fact('pike_drunk_n' + W.night); }
  };
  // what you say, to whoever you are looking at: the secrets in it are heard; and a few plain things a barkeep says
  story.told = (p, text) => {
    const s = text.toLowerCase(), out = [];
    for (const k of W.know) if (SECRETS[k][1].test(s) && story.hear(p.id, k)) out.push(k);
    if (/on the house|no charge|this one('s| is) on me|free/.test(s)) { p.house = true; trust(p.id, 0.5); out.push('house'); }
    if (/(had enough|no more|cut (you )?off|go home|last one)/.test(s)) { p.cut = true; p.want = null; p.rounds = 0; out.push('cut'); if (p.id === 'dutch') fact('dutch_cut'); }
    if (/(get out|leave|out of my (bar|saloon))/.test(s) && !/don.t leave/.test(s)) { F().leave(p.id); trust(p.id, -1); out.push('out'); }
    if (p.id === 'tom' && /(walk|see|take).*(dutch|him).*home|look after dutch/.test(s) && p.trust >= 1) { fact('tom_walks_dutch'); say('tom', 'Old Dutch? Aye, I\'ll see him to his door. He\'s in no state.'); out.push('walk'); }
    if (p.id === 'hale' && has('raid_live') && !has('raid_done') && /(empty|nobody|no one|not here|gone|look yourself|not there)/.test(s)) { fact('raid_done'); if (p.trust >= 2) { say('hale', 'Empty. That is what I will write. Good night, barkeep.'); fact('raid_lied'); } else { fact('cole_taken'); fact('cole_gone'); say('hale', 'You are a poor liar. Stand aside.'); trust('ruby', -2); } out.push('raid'); }
    if (p.id === 'crowe' && /(i.ll sell|you can have it|i accept|deal|i.ll sign|take the offer)/.test(s) && (has('offer1') || has('ultimatum'))) { fact('sold'); say('crowe', 'A sensible man at last. My lawyer will bring the papers. You will be on tomorrow\'s stage, I trust.'); after(14, () => finish()); out.push('sold'); }
    if (/(pool|billiard)/.test(s) && /(play|game|rack)/.test(s) && !G.pool?.state?.().on) { G.pool?.challenge?.(p.id, 100); F().send(p.id, [St('pool', 600)]); out.push('pool'); }
    if (/dart/.test(s) && /(play|game|throw)/.test(s) && !G.darts?.state?.().on) { G.darts?.challenge?.(p.id, 100); F().send(p.id, [St('darts', 600)]); out.push('darts'); }
    return out;
  };
  story.onGame = (game, r) => { const p = P(r.who); if (r.won) { G.bar.till += r.stake; trust(r.who, 0.5); } else { G.bar.till -= r.stake; trust(r.who, 1); } if (p && p.here) F().send(r.who, [B(1)]); };
  story.onMoney = () => { };
  story.youShot = (dmg) => { if (W.ended) return; W.hp -= dmg; G.hurtT = 1; if (W.hp <= 0) { W.hp = 0; once('died' + W.night, () => { fact('you_died'); card('You die on your own floor, beside the brass rail.\n\nThey bury you next to Eli.', 9, () => { W.facts.delete('you_died'); W.done.delete('died' + W.night); W.hp = 100; startNight(W.night, true); }); }); } };

  // ---- the night's clock
  story.bell = () => { if (W.phase === 'closed') { W.phase = 'open'; W.t = 0; queue = sched(W.night); G.bar.open = true; G.hint = ''; G.audio.piano = false; } else if (W.phase === 'open' && W.t > (W.night === 6 ? 99999 : 420)) lastCall(); };
  function lastCall() { if (W.phase !== 'open') return; W.phase = 'lastcall'; W.lc = W.t; const p = F().people.find((q) => q.here && q.alive && q.state !== 'walk'); if (p) say(p.id, 'Last call already? Then one for the road.', 'the barkeep has rung last call'); for (const q of F().people) if (q.here && q.alive && !q.drawn) { q.plan = q.plan.filter((a) => a[0] === 'bar').slice(0, 1); q.plan.push(['leave']); if (q.act && q.act[0] !== 'bar') q.t = 1e6; } }
  function startNight(n, again) { W.night = n; W.t = 0; W.phase = 'closed'; W.hp = 100; side.foes.length = 0; side.friends.length = 0; if (again) for (const k of [...W.done]) if (/^(friends|crowe_comes|won)$/.test(k)) W.done.delete(k); for (const f of ['showdown', 'fight', 'won']) W.facts.delete(f);
    F().clear(); G.bar.restock(); later.length = 0; G.audio.piano = false; card(NIGHTS[n].card, n ? 7 : 12, () => { G.hint = 'Ring the bell on the back bar to open.'; }); if (has('cole_hidden') && n < 6) G.hint = 'Cole Maddox is in your cellar.'; save(); }
  function endNight() { const took = G.bar.sweep() + (G.bar.taken - (W.takings.reduce((a, b) => a + b, 0))); W.takings.push(Math.max(0, took)); F().clear(); if (W.night >= 6) return finish(); W.phase = 'between'; const d = W.deaths.filter((x) => !W.told?.includes(x)); W.told = [...W.deaths];
    card(`${NIGHT[W.night]} NIGHT IS OVER\n\nThe till took $${(Math.max(0, took) / 100).toFixed(2)}.${d.length ? '\n\nDead tonight: ' + d.map((x) => PEOPLE[x].name).join(', ') + '.' : ''}`, 7, () => startNight(W.night + 1)); }
  function finish() { if (W.ended) return; const L = [], a = (id) => alive(id);
    if (has('sold')) L.push('You sold THE LAST CHANCE to Silas Crowe and took the morning stage.\nBy spring there was a headframe where the piano stood.');
    else if (has('won')) { L.push(has('crowe_tried') ? 'Silas Crowe hanged in Tucson in the spring. Amos Hale swore to all of it, his own part too, and kept his star.' : has('crowe_dead') ? 'Silas Crowe died on your floor. Nobody in Perdition could say who fired.' : 'Silas Crowe left the Territory that night and was not seen in it again.'); L.push('THE LAST CHANCE is yours, and what runs under it.'); }
    else L.push('THE LAST CHANCE burned on Sunday night.');
    if (a('cole') && a('ruby') && !has('cole_taken')) L.push(has('wedding') ? 'Mr and Mrs Maddox took the California road with eight hundred dollars and the Reverend\'s blessing.' : 'Cole and Ruby took the California road before dawn.'); else if (!a('cole') && a('ruby')) L.push('Ruby Vale sang one more night, in black, and left on the Tucson stage.'); else if (has('cole_taken')) L.push('Cole Maddox was taken to Yuma. Ruby writes to him every week.');
    if (has('ada_avenged') && a('ada')) L.push(a('hale') ? 'Ada Bell was never charged. She and Amos Hale were seen walking out on Sundays.' : 'Ada Bell was never charged.'); if (has('dutch_dead')) L.push('Dutch Henry lies on the hill. His claim was never proved.'); else if (a('dutch')) L.push('Dutch Henry signed you half his claim and drank the other half.');
    if (a('mateo') && a('rosa')) L.push('Mateo and Rosa were married in the clapboard church. Abuela turned a card and smiled.'); if (has('ned_betrays')) L.push(a('ned') ? 'Lucky Ned Tolliver left town on a fast horse with Crowe\'s last five dollars.' : 'Nobody claimed Lucky Ned.');
    if (has('murder')) L.push('They remember who you shot, and why they stopped drinking here.');
    W.ended = L.join('\n\n'); W.phase = 'ended'; card(W.ended + '\n\nTHE END', 1e9, null); save(); }
  const save = () => { if (G.params?.has('nopost')) return; fetch('/saloon/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ night: W.night, facts: [...W.facts].slice(0, 200), know: [...W.know], ended: !!W.ended, till: G.bar.till }) }).catch(() => { }); };

  story.begin = () => { if (story.began) return; story.began = true; const n = clamp(+(G.params?.get('night') || 1) - 1, 0, 6); for (const f of (G.params?.get('facts') || '').split(',')) if (f) { fact(f); if (f.startsWith('know_')) W.know.add(f.slice(5)); } startNight(n); };
  story.update = (dt) => {
    if (G.cardT > 0) { G.cardT -= dt; if (G.cardT <= 0) { if (fade) fade.style.opacity = 0; story.cardText = ''; const f = story.cardThen; story.cardThen = null; f && f(); } return; }
    if (G.hurtT > 0) G.hurtT -= dt; if (W.hp < 100 && !has('fight')) W.hp = Math.min(100, W.hp + dt * 3);
    if (W.phase !== 'open' && W.phase !== 'lastcall') return;
    W.t += dt * W.rate;
    while (queue.length && queue[0].at <= W.t) { const c = queue.shift(); if (W.phase === 'open') F().enter(c.id, c.plan); }
    for (let i = later.length - 1; i >= 0; i--) if (later[i].at <= W.t) { const f = later[i].f; later.splice(i, 1); f(); }
    G.audio.piano = here('doc') && P('doc').state === 'stand' && P('doc').act?.[1] === 'piano';
    beats();
    if (W.phase === 'open' && W.night < 6 && W.t > OPEN) lastCall();
    if (W.phase === 'lastcall' && (W.t > W.lc + CLOSE || F().crowd() === 0) && W.t > W.lc + 8) endNight();
  };
  Object.assign(story, { has, fact, learn, tell, startNight, endNight, lastCall, finish, NIGHTS, side });
  return story;
}
