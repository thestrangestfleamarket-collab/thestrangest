// SKIRMISH TABLE's battlefields as data, shared by the server's rules and the page's picture: the grid, each tile's ground and height, where each side sets out, what stands on it and its light
// A tile's letter names its ground (TERRAIN below); `high` is its level, one digit a tile. Player 2 is player 1 turned half round, so every map reads the same from both seats.

// What ground does, for every unit and every attack (resolved in game.js):
//   solid  nothing stands or walks there
//   wall   a straight strike (the Berserker's axe) stops at it
//   cost   move points to step in (1 where not given)
//   cover  a shot (the Archer's) does this share of its damage to whoever stands there
//   slip   whoever stands there blocks at this share of their block
export const TERRAIN = {
  '.': { name: 'Grass' },
  d: { name: 'Dirt' },
  b: { name: 'Bridge' },
  s: { name: 'Shallows', cost: 2, slip: 0.5, info: 'Two move points to wade in; poor footing halves block.' },
  f: { name: 'Forest', cost: 2, cover: 0.5, info: 'Two move points to enter; arrows do half damage to whoever is inside.' },
  w: { name: 'Deep water', solid: true, info: 'Cannot be crossed.' },
  r: { name: 'Rock', solid: true, wall: true, info: 'Cannot be crossed; stops the axe.' },
  x: { name: 'Ruined wall', solid: true, wall: true, info: 'Cannot be crossed; stops the axe.' },
};
// Height: stepping up a level costs one more move point, two levels at once cannot be climbed,
// and anything that works at range reaches one tile further at targets below it.
export const CLIMB = 1, REACH = 1;

export const MAPS = {
  board: {
    name: 'The Board', info: 'The plain stone board: no ground rules, nine by eleven.',
    cols: 9, rows: 11, zone: 3,
  },
  river: {
    name: 'Millford Crossing', info: 'A river cuts the field in two: one bridge, two fords, a hill on each bank.',
    cols: 11, rows: 11, zone: 3,
    tiles: [
      '.....d.....',
      '.....d.....',
      '..f..d.....',
      '...ffd.r...',
      'ww...d.....',
      'wwswwbwwsww',
      '.....d...ww',
      '...r.dff...',
      '.....d..f..',
      '.....d.....',
      '.....d.....'],
    high: [
      '00000000000',
      '00000000000',
      '00000000110',
      '00000000110',
      '00000000000',
      '00000000000',
      '00000000000',
      '01100000000',
      '01100000000',
      '00000000000',
      '00000000000'],
    look: { hour: 'morning', flow: [1, 0.12], mist: 0.5, birds: 3, butterflies: 7, wind: 1 },
    props: [
      { k: 'log', x: 7.1, y: 6.6, r: 0.5 }, { k: 'log', x: 2.9, y: 3.4, r: 3.6 },
      { k: 'camp', x: -1.2, y: 8.6 }, { k: 'camp', x: 11.2, y: 1.4 },
    ],
  },
  pass: {
    name: 'Greywether Pass', info: 'A narrow way between crags, with a ledge above each mouth for whoever climbs it first.',
    cols: 9, rows: 13, zone: 3,
    tiles: [
      '.........',
      '.........',
      '.........',
      'rr....f..',
      'rrr...ddr',
      'rr.d.rr.r',
      'r..drd..r',
      'r.rr.d.rr',
      'rdd...rrr',
      '..f....rr',
      '.........',
      '.........',
      '.........'],
    high: [
      '000000000',
      '000000000',
      '000000000',
      '000000000',
      '000000110',
      '000000010',
      '000000000',
      '010000000',
      '011000000',
      '000000000',
      '000000000',
      '000000000',
      '000000000'],
    look: { hour: 'sunset', mist: 0.25, birds: 2, wind: 1.5, crag: 1 },
    props: [
      { k: 'torch', x: 5.4, y: 4.62 }, { k: 'torch', x: 2.6, y: 7.38 },
      { k: 'log', x: 4.4, y: 9.5, r: 1.2 }, { k: 'log', x: 3.6, y: 2.5, r: 4.3 },
    ],
  },
  ruins: {
    name: 'Hollowmere Ruins', info: 'Broken walls in a wood at dusk, a pond at either side.',
    cols: 11, rows: 11, zone: 3,
    tiles: [
      '.f.......f.',
      '...........',
      'f..ff...s..',
      '....xx.sw..',
      '.f.x......f',
      '...x.d.x...',
      'f......x.f.',
      '..ws.xx....',
      '..s...ff..f',
      '...........',
      '.f.......f.'],
    high: [
      '00000000000',
      '00000000000',
      '00000000000',
      '11000000000',
      '01000000000',
      '00000000000',
      '00000000010',
      '00000000011',
      '00000000000',
      '00000000000',
      '00000000000'],
    look: { hour: 'dusk', mist: 0.9, fireflies: 1, wind: 0.6, wood: 1 },
    props: [
      { k: 'wall', x: 4.5, y: 3, r: 0 }, { k: 'wall', x: 3, y: 4.5, r: 1 }, { k: 'wall', x: 5.5, y: 7, r: 2 }, { k: 'wall', x: 7, y: 5.5, r: 3 },
      { k: 'torch', x: 5.3, y: 2.7 }, { k: 'torch', x: 4.7, y: 7.3 },
      { k: 'camp', x: -1.3, y: 6.5 }, { k: 'camp', x: 11.3, y: 3.5 },
      { k: 'log', x: 8.5, y: 8.6, r: 2.2 }, { k: 'log', x: 1.5, y: 1.4, r: 5.3 },
    ],
  },
};

export const mapOf = id => MAPS[id] || MAPS.board;
export const groundAt = (m, x, y) => TERRAIN[m.tiles ? m.tiles[y][x] : '.'];
export const highAt = (m, x, y) => (m.high ? +m.high[y][x] : 0);
