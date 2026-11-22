// SKIRMISH TABLE's solo campaign as data, shared by the server and the page: the overland map, its battles in order, each one's battlefield, enemy force and words
// A battle opens when every battle in its `needs` is won. Winning adds its `gain` to the points you may field. Fallen units come back for the next battle.

export const CAMPAIGN = {
  name: 'The Cold Beacon',
  intro: 'The beacon above Tarn Vale has been dark for nine nights. You lead a free company up the valley road to find out why, and to light it again.',
  start: 28,
  // the overland map: the same ground letters as a battlefield (maps.js), drawn by the same code, with a banner at each battle
  map: {
    name: 'Tarn Vale', cols: 15, rows: 11, zone: 0,
    tiles: [
      'rr.....ff....rr',
      'r...f..f..dd..r',
      '..ff....ddd....',
      '.fff..ddd....f.',
      '.....dd.rr...ff',
      'wwswwbwwww.....',
      '....dd...www...',
      '.f.dd......wwww',
      '..dd...ff......',
      '.dd....f...r...',
      'dd.............'],
    high: [
      '000000000001110',
      '000000000000110',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000',
      '000000000000000'],
    look: { hour: 'morning', flow: [1, 0.1], mist: 0.6, birds: 3, butterflies: 5, wind: 1, scale: 0.6 },   // a map of a country: everything on it at six tenths, taller than its banners
    props: [{ k: 'camp', x: 0.6, y: 9.4 }, { k: 'torch', x: 11.5, y: 0.6 }, { k: 'wall', x: 12, y: 1.5, r: 1 }, { k: 'log', x: 7.5, y: 6.5, r: 0.8 }],
  },
  nodes: [
    { id: 'toll', name: 'The Toll at Millford', at: [4, 7], map: 'river', level: 'easy', gain: 3, needs: [],
      text: 'Deserters have strung a chain across Millford bridge and take a toll from anyone going north. They will not take yours.',
      won: 'The chain is in the river. The road north is open.',
      enemy: [['bulwark', 5, 2], ['lancer', 4, 2], ['strider', 7, 2], ['slinger', 3, 1], ['slinger', 6, 0], ['mender', 5, 0]] },
    { id: 'ford', name: 'The Drowned Ford', at: [2, 5], map: 'marsh', level: 'easy', gain: 3, needs: ['toll'], optional: true,
      text: 'A ferryman swears the toll-men keep their takings on the far side of the marsh ford, under a guard that hates wet boots.',
      won: 'A strongbox, and inside it enough coin to hire another blade.',
      enemy: [['bulwark', 4, 1], ['bulwark', 6, 1], ['slinger', 2, 0], ['slinger', 8, 0], ['slinger', 5, 0], ['hexbinder', 5, 1], ['strider', 9, 1]] },
    { id: 'ruins', name: 'Hollowmere', at: [6, 4], map: 'ruins', level: 'hard', gain: 3, needs: ['toll'],
      text: 'The old priory at Hollowmere should be empty. Tonight there are fires in it, and sentries who do not answer a hail.',
      won: 'Among their packs: the beacon-keeper\'s seal, and orders to hold the pass until the first snow.',
      enemy: [['bulwark', 4, 2], ['bulwark', 6, 2], ['lancer', 5, 2], ['strider', 2, 1], ['slinger', 3, 0], ['slinger', 7, 0], ['ember', 5, 0], ['mender', 6, 1]] },
    { id: 'wolfwood', name: 'The Charcoal Camp', at: [12, 4], map: 'board', level: 'hard', gain: 3, needs: ['ruins'], optional: true,
      text: 'East of the road the charcoal burners have been driven off their own clearing. They offer what they have for its return.',
      won: 'The burners keep their word, and two of their sons take up spears beside you.',
      enemy: [['lancer', 3, 2], ['lancer', 5, 2], ['strider', 1, 2], ['strider', 7, 2], ['bulwark', 4, 2], ['ember', 4, 1], ['hexbinder', 2, 0], ['mender', 6, 0], ['slinger', 4, 0]] },
    { id: 'pass', name: 'Greywether Pass', at: [8, 2], map: 'pass', level: 'hard', gain: 3, needs: ['ruins'],
      text: 'The pass is a throat of rock with a ledge above each mouth. Whoever holds the ledges holds the road. They got here first.',
      won: 'From the top of the pass you can see the beacon tower, and no light in it.',
      enemy: [['bulwark', 3, 2], ['bulwark', 5, 2], ['lancer', 4, 2], ['slinger', 2, 1], ['slinger', 6, 1], ['slinger', 4, 0], ['ember', 3, 0], ['hexbinder', 5, 0], ['mender', 4, 1]] },
    { id: 'beacon', name: 'The Cold Beacon', at: [11, 1], map: 'keep', level: 'hard', gain: 0, needs: ['pass'], last: true,
      text: 'The keep under the beacon is held by the captain who put it out. She has every reason to keep it dark, and the best of her company around her.',
      won: 'The beacon burns. Down the whole length of Tarn Vale, one after another, the lesser fires answer it.',
      enemy: [['bulwark', 4, 2], ['bulwark', 6, 2], ['bulwark', 5, 2], ['lancer', 4, 1], ['lancer', 6, 1], ['strider', 1, 2], ['strider', 9, 2], ['slinger', 3, 0], ['slinger', 7, 0], ['ember', 5, 0], ['hexbinder', 4, 0], ['mender', 6, 0]] },
  ],
};
export const nodeOf = id => CAMPAIGN.nodes.find(n => n.id === id) || null;
const won = done => (Array.isArray(done) ? done : []).filter(id => typeof id === 'string' && nodeOf(id));
// The points you may field: the company you set out with, and what each won battle added.
export const budgetFor = done => [...new Set(won(done))].reduce((n, id) => n + nodeOf(id).gain, CAMPAIGN.start);
export const isOpen = (id, done) => { const n = nodeOf(id), d = won(done); return !!n && n.needs.every(q => d.includes(q)); };
export const finished = done => won(done).includes(CAMPAIGN.nodes.find(n => n.last).id);
