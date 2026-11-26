// FOURTH & LONG's playbooks as data: formations, routes, offensive and defensive plays (f = yards upfield of the line, s = yards to the offense's right)
// a route is legs from where the player lines up: [upfield, outside] (outside = toward his own sideline); stop: he settles at the end
export const ROUTES = {
  go: { w: [[45, 0]] }, slant: { w: [[3, 0], [15, -13]] }, out: { w: [[6, 0], [6, 10]], stop: 1 }, in: { w: [[10, 0], [10, -18]] },
  curl: { w: [[11, 0], [9, -1.5]], stop: 1 }, post: { w: [[12, 0], [38, -13]] }, corner: { w: [[12, 0], [32, 13]] }, flat: { w: [[1, 5], [3, 13]], stop: 1 },
  drag: { w: [[2, 0], [5, -24]] }, comeback: { w: [[15, 0], [12, 3]], stop: 1 }, swing: { w: [[2, 6], [9, 11]] }, wheel: { w: [[2, 7], [30, 9]] }, hitch: { w: [[5, 0], [4, -1]], stop: 1 },
};
export const HOT = ['go', 'slant', 'out', 'in', 'curl', 'post', 'block'];

const OL = [['C', 0, 0], ['LG', 0, -1.6], ['RG', 0, 1.6], ['LT', -0.3, -3.2], ['RT', -0.3, 3.2]];
// the five skill players of each formation: [role, f, s]
const FORM = {
  iform: { qb: -1.2, sk: [['WR', 0, -19], ['WR', -1, 19], ['TE', 0, 4.9], ['FB', -4.2, 0], ['HB', -7, 0]] },
  single: { qb: -1.2, sk: [['WR', 0, -19], ['WR', -1, 19], ['WR', -1, -10], ['TE', 0, 4.9], ['HB', -6.5, 0]] },
  gun: { qb: -5, sk: [['WR', 0, -19], ['WR', 0, 19], ['WR', -1, -10], ['WR', -1, 10], ['HB', -5, 2.2]] },
  goal: { qb: -1.2, sk: [['TE', 0, -4.9], ['TE', 0, 4.9], ['WR', -1, 15], ['FB', -3.8, 0], ['HB', -6.5, 0]] },
  kick: { qb: -14, sk: [['TE', 0, -4.9], ['TE', 0, 4.9], ['WR', 0, -8], ['WR', 0, 8], ['FB', -6, 1.5]] },
};
export const formation = (name) => { const F = FORM[name]; return [...OL, ['QB', F.qb, 0], ...F.sk].map(([role, f, s]) => ({ role, f, s })); };

// an offensive play: form, cat, drop (how far the QB sets up behind the line), sk: one job for each of the five skill players, in the formation's order:
//   a route name, 'block', or { run: legs from where he stands, ho: seconds until the handoff }
const B = 'block';
export const OFFENSE = [
  { name: 'HB DIVE', cat: 'RUN', form: 'iform', sk: [B, B, B, B, { run: [[8, 1]], ho: 0.75 }] },
  { name: 'OFF TACKLE', cat: 'RUN', form: 'iform', sk: [B, B, B, B, { run: [[5, 6.5], [10, 7]], ho: 0.8 }] },
  { name: 'TOSS SWEEP', cat: 'RUN', form: 'single', sk: [B, B, B, B, { run: [[1, 10], [7, 17]], ho: 0.45 }] },
  { name: 'DRAW', cat: 'RUN', form: 'gun', drop: 7, sk: ['go', 'go', 'out', 'out', { run: [[7, -2]], ho: 1.3 }] },
  { name: 'QB SNEAK', cat: 'RUN', form: 'goal', sneak: 1, sk: [B, B, B, B, B] },
  { name: 'SLANTS', cat: 'SHORT', form: 'gun', drop: 6.5, sk: ['slant', 'slant', 'flat', 'slant', B] },
  { name: 'CURLS', cat: 'SHORT', form: 'single', drop: 5, sk: ['curl', 'curl', 'in', 'hitch', 'swing'] },
  { name: 'QUICK OUTS', cat: 'SHORT', form: 'gun', drop: 6.5, sk: ['hitch', 'out', 'out', 'slant', B] },
  { name: 'MESH', cat: 'SHORT', form: 'gun', drop: 7, sk: ['drag', 'drag', 'corner', 'in', 'swing'] },
  { name: 'TE DRAG', cat: 'SHORT', form: 'iform', drop: 5, sk: ['post', 'comeback', 'drag', 'flat', B] },
  { name: 'FOUR VERTICALS', cat: 'DEEP', form: 'gun', drop: 8, sk: ['go', 'go', 'go', 'go', B] },
  { name: 'POST CORNER', cat: 'DEEP', form: 'single', drop: 7, sk: ['post', 'go', 'corner', 'in', B] },
  { name: 'PA DEEP POST', cat: 'DEEP', form: 'iform', drop: 8, pa: 1, sk: ['post', 'go', 'out', B, B] },
  { name: 'FLOOD', cat: 'DEEP', form: 'single', drop: 7, sk: ['post', 'corner', 'drag', 'out', 'flat'] },
  { name: 'PUNT', cat: 'KICK', form: 'kick', kick: 'punt', sk: [B, B, B, B, B] },
  { name: 'FIELD GOAL', cat: 'KICK', form: 'kick', kick: 'fg', sk: [B, B, B, B, B] },
];
export const OCATS = ['RUN', 'SHORT', 'DEEP', 'KICK'];

// a defensive play: jobs for DE DT DT DE | OLB MLB OLB | CB CB | FS SS. 'rush', 'man', or a zone [f, s] (yards upfield of the line, to the offense's right)
const R = 'rush', M = 'man';
export const DEFENSE = [
  { name: 'COVER 2', cat: 'ZONE', jobs: [R, R, R, R, [8, -10], [9, 0], [8, 10], [5, -19], [5, 19], [17, -12], [17, 12]] },
  { name: 'COVER 3', cat: 'ZONE', jobs: [R, R, R, R, [6, -16], [8, -4], [8, 6], [16, -19], [16, 19], [19, 0], [6, 16]] },
  { name: 'COVER 4', cat: 'ZONE', jobs: [R, R, R, R, [7, -13], [8, 0], [7, 13], [16, -20], [16, 20], [18, -7], [18, 7]] },
  { name: 'COVER 1 MAN', cat: 'MAN', jobs: [R, R, R, R, M, [7, 0], M, M, M, [19, 0], M] },
  { name: 'COVER 2 MAN', cat: 'MAN', jobs: [R, R, R, R, M, M, M, M, M, [18, -12], [18, 12]] },
  { name: 'LB BLITZ', cat: 'BLITZ', jobs: [R, R, R, R, R, R, M, M, M, [18, 0], M] },
  { name: 'ALL OUT BLITZ', cat: 'BLITZ', jobs: [R, R, R, R, R, R, R, M, M, M, M] },
  { name: 'GOAL LINE', cat: 'BLITZ', tight: 1, jobs: [R, R, R, R, R, R, M, M, M, M, M] },
];
export const DCATS = ['ZONE', 'MAN', 'BLITZ'];
export const DROLES = ['DE', 'DT', 'DT', 'DE', 'OLB', 'MLB', 'OLB', 'CB', 'CB', 'FS', 'SS'];
// where the defense lines up: [f, s]; the corners and the strong safety shade to the receivers at the lineup
export const DALIGN = [[1, -4.6], [1, -1.5], [1, 1.5], [1, 4.6], [4.5, -5.5], [4.5, 0], [4.5, 5.5], [6, -19], [6, 19], [14, -7], [11, 8]];
