// The current build ships a single, carefully dressed hole.
// (The earlier 18-hole set lives in /archive.)
// Paths are [x, y, z, width] control points in hole-local space, tee end first.
export const COURSES = [
  {
    name: 'Lilienstein Meadow', blurb: 'One hole in a quiet meadow at golden hour.', difficulty: 'Par 3',
    env: { kind: 'alpine', green: 0x4c9a52, wall: 0xffffff, under: 0xcfc6ba, accent: 0xb5482f, flag: 0xe8432e },
    holes: [
      { name: 'The Meander', par: 3, at: [0, 0, 0], rot: 0,
        path: [[0, 0, 5.2, 1.4], [0, 0, 2.6, 1.4], [1.3, 0.16, 0.7, 1.7], [1.6, 0, -1.3, 1.8], [0.2, 0, -3.2, 1.5], [0, 0, -5.2, 1.7]],
        obstacles: [{ type: 'rock', t: 0.47, v: -0.3, r: 0.2 }, { type: 'rock', t: 0.72, v: 0.45, r: 0.15 }, { type: 'rock', t: 0.86, v: -0.5, r: 0.12 }] },
    ],
  },
];
