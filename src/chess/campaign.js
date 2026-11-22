// SKIRMISH TABLE's solo campaign as data, shared by the server and the page: its battles in order, each one's enemy force, level and words (every battle is on the plain board for now; its overland map and each battle's own battlefield are in archive/chess-levels/)
// A battle opens when every battle in its `needs` is won. Winning adds its `gain` to the points you may field. Fallen units come back for the next battle.

export const CAMPAIGN = {
  name: 'The Cold Beacon',
  intro: 'The beacon above Tarn Vale has been dark for nine nights. You lead a free company up the valley road to find out why, and to light it again.',
  start: 28,
  nodes: [
    { id: 'toll', name: 'The Toll at Millford', map: 'board', level: 'easy', gain: 3, needs: [],
      text: 'Deserters have strung a chain across Millford bridge and take a toll from anyone going north. They will not take yours.',
      won: 'The chain is in the river. The road north is open.',
      enemy: [['bulwark', 4, 2], ['lancer', 3, 2], ['strider', 6, 2], ['slinger', 2, 1], ['slinger', 5, 0], ['mender', 4, 0]] },
    { id: 'ford', name: 'The Drowned Ford', map: 'board', level: 'easy', gain: 3, needs: ['toll'], optional: true,
      text: 'A ferryman swears the toll-men keep their takings on the far side of the marsh ford, under a guard that hates wet boots.',
      won: 'A strongbox, and inside it enough coin to hire another blade.',
      enemy: [['bulwark', 3, 1], ['bulwark', 5, 1], ['slinger', 1, 0], ['slinger', 7, 0], ['slinger', 4, 0], ['hexbinder', 4, 1], ['strider', 8, 1]] },
    { id: 'ruins', name: 'Hollowmere', map: 'board', level: 'hard', gain: 3, needs: ['toll'],
      text: 'The old priory at Hollowmere should be empty. Tonight there are fires in it, and sentries who do not answer a hail.',
      won: 'Among their packs: the beacon-keeper\'s seal, and orders to hold the pass until the first snow.',
      enemy: [['bulwark', 3, 2], ['bulwark', 5, 2], ['lancer', 4, 2], ['strider', 1, 1], ['slinger', 2, 0], ['slinger', 6, 0], ['ember', 4, 0], ['mender', 5, 1]] },
    { id: 'wolfwood', name: 'The Charcoal Camp', map: 'board', level: 'hard', gain: 3, needs: ['ruins'], optional: true,
      text: 'East of the road the charcoal burners have been driven off their own clearing. They offer what they have for its return.',
      won: 'The burners keep their word, and two of their sons take up spears beside you.',
      enemy: [['lancer', 3, 2], ['lancer', 5, 2], ['wolf', 1, 2], ['wolf', 7, 2], ['bulwark', 4, 2], ['ember', 4, 1], ['hexbinder', 2, 0], ['mender', 6, 0], ['slinger', 4, 0]] },
    { id: 'pass', name: 'Greywether Pass', map: 'board', level: 'hard', gain: 3, needs: ['ruins'],
      text: 'The pass is a throat of rock with a ledge above each mouth. Whoever holds the ledges holds the road. They got here first.',
      won: 'From the top of the pass you can see the beacon tower, and no light in it.',
      enemy: [['bulwark', 3, 2], ['bulwark', 5, 2], ['lancer', 4, 2], ['slinger', 2, 1], ['slinger', 6, 1], ['slinger', 4, 0], ['ember', 3, 0], ['hexbinder', 5, 0], ['mender', 4, 1]] },
    { id: 'beacon', name: 'The Cold Beacon', map: 'board', level: 'hard', gain: 0, needs: ['pass'], last: true,
      text: 'The keep under the beacon is held by the captain who put it out. She has every reason to keep it dark, and the best of her company around her.',
      won: 'The beacon burns. Down the whole length of Tarn Vale, one after another, the lesser fires answer it.',
      enemy: [['bulwark', 3, 2], ['bulwark', 5, 2], ['captain', 4, 2], ['lancer', 3, 1], ['lancer', 5, 1], ['wolf', 0, 2], ['strider', 8, 2], ['slinger', 2, 0], ['slinger', 6, 0], ['ember', 4, 0], ['hexbinder', 3, 0], ['mender', 5, 0]] },
  ],
};
export const nodeOf = id => CAMPAIGN.nodes.find(n => n.id === id) || null;
const won = done => (Array.isArray(done) ? done : []).filter(id => typeof id === 'string' && nodeOf(id));
// The points you may field: the company you set out with, and what each won battle added.
export const budgetFor = done => [...new Set(won(done))].reduce((n, id) => n + nodeOf(id).gain, CAMPAIGN.start);
export const isOpen = (id, done) => { const n = nodeOf(id), d = won(done); return !!n && n.needs.every(q => d.includes(q)); };
export const finished = done => won(done).includes(CAMPAIGN.nodes.find(n => n.last).id);
