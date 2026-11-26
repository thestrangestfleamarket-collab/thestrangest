// FOURTH & LONG's playbooks as data: formations, routes, offensive and defensive plays (f = yards upfield of the line, s = yards to the offense's right)
// a route is legs from where the player lines up: [upfield, outside] (outside = toward his own sideline); stop: he settles at the end
export const ROUTES = {
  go: { w: [[45, 0]] }, slant: { w: [[3, 0], [15, -13]] }, out: { w: [[6, 0], [6, 10]], stop: 1 }, in: { w: [[10, 0], [10, -18]] },
  curl: { w: [[11, 0], [9, -1.5]], stop: 1 }, post: { w: [[12, 0], [38, -13]] }, corner: { w: [[12, 0], [32, 13]] }, flat: { w: [[1, 5], [3, 13]], stop: 1 },
  drag: { w: [[2, 0], [5, -24]] }, comeback: { w: [[15, 0], [12, 3]], stop: 1 }, swing: { w: [[2, 6], [9, 11]] }, wheel: { w: [[2, 7], [30, 9]] }, hitch: { w: [[5, 0], [4, -1]], stop: 1 },
  fade: { w: [[4, 2], [32, 3.5]] }, screen: { w: [[-1.5, 7]], stop: 1 }, bubble: { w: [[-1, 6]], stop: 1 }, stopgo: { w: [[8, 0], [7, -0.6], [40, 1]] }, angle: { w: [[2, 5], [10, -7]] }, cross: { w: [[8, 0], [17, -27]] }, whip: { w: [[4, -3], [4, 7]], stop: 1 },
};
export const HOT = ['go', 'slant', 'out', 'in', 'curl', 'post', 'block'];

const OL = [['C', 0, 0], ['LG', 0, -1.6], ['RG', 0, 1.6], ['LT', -0.3, -3.2], ['RT', -0.3, 3.2]];
// the five skill players of each formation: [role, f, s]
const FORM = {
  iform: { qb: -1.2, sk: [['WR', 0, -19], ['WR', -1, 19], ['TE', 0, 4.9], ['FB', -4.2, 0], ['HB', -7, 0]] },
  single: { qb: -1.2, sk: [['WR', 0, -19], ['WR', -1, 19], ['WR', -1, -10], ['TE', 0, 4.9], ['HB', -6.5, 0]] },
  gun: { qb: -5, sk: [['WR', 0, -19], ['WR', 0, 19], ['WR', -1, -10], ['WR', -1, 10], ['HB', -5, 2.2]] },
  goal: { qb: -1.2, sk: [['TE', 0, -4.9], ['TE', 0, 4.9], ['WR', -1, 15], ['FB', -3.8, 0], ['HB', -6.5, 0]] },
  trips: { qb: -5, sk: [['WR', 0, -19], ['WR', 0, 19], ['WR', -1, 13.5], ['WR', -1, 8.5], ['HB', -5, -2.2]] },
  pistol: { qb: -4, sk: [['WR', 0, -19], ['WR', -1, 19], ['TE', 0, 4.9], ['WR', -1, -10], ['HB', -7.5, 0]] },
  empty: { qb: -5, sk: [['WR', 0, -20], ['WR', 0, 20], ['WR', -1, -12], ['WR', -1, 12], ['HB', -1, 6.5]] },
  kick: { qb: -14, sk: [['TE', 0, -4.9], ['TE', 0, 4.9], ['WR', 0, -8], ['WR', 0, 8], ['FB', -6, 1.5]] },
};
export const formation = (name) => { const F = FORM[name]; return [...OL, ['QB', F.qb, 0], ...F.sk].map(([role, f, s]) => ({ role, f, s })); };

// an offensive play: form, cat, drop (how far the QB sets up behind the line), sk: one job for each of the five skill players, in the formation's order:
//   a route name, 'block', or { run: legs from the ball, ho: seconds until the handoff }; qbrun: the quarterback keeps it and runs those legs
const B = 'block';
export const OFFENSE = [
  { name: 'HB DIVE', cat: 'RUN', form: 'iform', sk: [B, B, B, B, { run: [[8, 1]], ho: 0.5 }] },
  { name: 'OFF TACKLE', cat: 'RUN', form: 'iform', sk: [B, B, B, B, { run: [[5, 6.5], [10, 7]], ho: 0.55 }] },
  { name: 'TOSS SWEEP', cat: 'RUN', form: 'single', sk: [B, B, B, B, { run: [[1, 10], [7, 17]], ho: 0.32 }] },
  { name: 'DRAW', cat: 'RUN', form: 'gun', drop: 7, sk: ['go', 'go', 'out', 'out', { run: [[7, -2]], ho: 1.05 }] },
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
  { name: 'KNEEL', cat: 'KICK', form: 'goal', kneel: 1, sk: [B, B, B, B, B] },
  { name: 'SPIKE', cat: 'KICK', form: 'gun', spike: 1, sk: [B, B, B, B, B] },
  { name: 'COUNTER', cat: 'RUN', form: 'iform', sk: [B, B, B, B, { run: [[2, -5], [9, -7]], ho: 0.65 }] },
  { name: 'STRETCH', cat: 'RUN', form: 'single', sk: [B, B, B, B, { run: [[1, -9], [8, -15]], ho: 0.35 }] },
  { name: 'POWER', cat: 'RUN', form: 'goal', sk: [B, B, B, B, { run: [[4, 4], [9, 5]], ho: 0.5 }] },
  { name: 'FB DIVE', cat: 'RUN', form: 'iform', sk: [B, B, B, { run: [[7, -1]], ho: 0.3 }, B] },
  { name: 'QB DRAW', cat: 'RUN', form: 'gun', qbrun: [[-3, 0.5], [7, 1.5]], sk: ['go', 'go', 'out', 'out', B] },
  { name: 'REVERSE', cat: 'RUN', form: 'gun', drop: 6, sk: [B, { run: [[2, -10], [10, -17]], ho: 1.35 }, B, B, B] },
  { name: 'HB SCREEN', cat: 'SHORT', form: 'gun', drop: 8, sk: ['go', 'go', 'in', 'go', 'screen'] },
  { name: 'STICK', cat: 'SHORT', form: 'trips', drop: 5.5, sk: ['hitch', 'go', 'out', 'hitch', 'swing'] },
  { name: 'SMASH', cat: 'SHORT', form: 'single', drop: 6, sk: ['hitch', 'hitch', 'corner', 'corner', 'swing'] },
  { name: 'SPACING', cat: 'SHORT', form: 'empty', drop: 5.5, sk: ['curl', 'curl', 'hitch', 'hitch', 'flat'] },
  { name: 'BUBBLE SCREEN', cat: 'SHORT', form: 'trips', drop: 5.5, sk: ['go', B, B, 'bubble', B] },
  { name: 'TEXAS', cat: 'SHORT', form: 'pistol', drop: 6, sk: ['go', 'comeback', 'in', 'out', 'angle'] },
  { name: 'MILLS', cat: 'DEEP', form: 'single', drop: 7.5, sk: ['post', 'in', 'in', 'go', B] },
  { name: 'HAIL MARY', cat: 'DEEP', form: 'empty', drop: 9, sk: ['go', 'go', 'fade', 'fade', 'go'] },
  { name: 'DOUBLE MOVE', cat: 'DEEP', form: 'gun', drop: 8, sk: ['stopgo', 'stopgo', 'in', 'out', B] },
  { name: 'Y CROSS', cat: 'DEEP', form: 'pistol', drop: 7, sk: ['go', 'post', 'cross', 'curl', 'swing'] },
  { name: 'WHEEL', cat: 'DEEP', form: 'gun', drop: 7.5, sk: ['in', 'post', 'drag', 'corner', 'wheel'] },
  { name: 'FADE', cat: 'DEEP', form: 'goal', drop: 3, sk: ['flat', 'drag', 'fade', B, B] },
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
  { name: 'TAMPA 2', cat: 'ZONE', jobs: [R, R, R, R, [8, -10], [15, 0], [8, 10], [5, -19], [5, 19], [18, -13], [18, 13]] },
  { name: 'COVER 6', cat: 'ZONE', jobs: [R, R, R, R, [7, -12], [8, 0], [6, 14], [16, -20], [5, 19], [18, -6], [18, 12]] },
  { name: 'PREVENT', cat: 'ZONE', jobs: [R, R, R, [14, 0], [14, -14], [20, 0], [14, 14], [22, -20], [22, 20], [26, -9], [26, 9]] },
  { name: 'ZONE BLITZ', cat: 'BLITZ', jobs: [[5, -6], R, R, R, R, R, [7, 6], [14, -19], [14, 19], [18, 0], [6, -14]] },
  { name: 'CORNER BLITZ', cat: 'BLITZ', jobs: [R, R, R, R, M, [7, 0], M, R, M, [17, -8], M] },
  { name: 'SAFETY BLITZ', cat: 'BLITZ', jobs: [R, R, R, R, M, M, M, M, M, [18, 0], R] },
  { name: 'GOAL LINE', cat: 'BLITZ', tight: 1, jobs: [R, R, R, R, R, R, M, M, M, M, M] },
];
export const DCATS = ['ZONE', 'MAN', 'BLITZ'];
export const DROLES = ['DE', 'DT', 'DT', 'DE', 'OLB', 'MLB', 'OLB', 'CB', 'CB', 'FS', 'SS'];
// where the defense lines up: [f, s]; the corners and the strong safety shade to the receivers at the lineup
export const DALIGN = [[1, -4.6], [1, -1.5], [1, 1.5], [1, 4.6], [4.5, -5.5], [4.5, 0], [4.5, 5.5], [6, -19], [6, 19], [14, -7], [11, 8]];
