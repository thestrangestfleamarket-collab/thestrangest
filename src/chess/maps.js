// SKIRMISH TABLE's battlefields as data, shared by the server's rules and the page's picture: the grid, each tile's ground and height, where each side sets out, what stands on it and its light
// A tile's letter names its ground (TERRAIN below); `high` is its level, one digit a tile. Player 2 is player 1 turned half round, so every map reads the same from both seats.

// What ground does, for every unit and every attack (resolved in game.js):
//   solid  nothing stands or walks there
//   wall   a straight strike (the Berserker's axe) stops at it
//   cost   move points to step in (1 where not given)
//   cover  a shot (the Archer's) does this share of its damage to whoever stands there
//   slip   whoever stands there blocks at this share of their block
// `foot` is what a step on it sounds like (the page's; a map's `look.foot` says what its own bare ground is)
export const TERRAIN = {
  '.': { name: 'Grass', foot: 'grass' },
  d: { name: 'Dirt', foot: 'dirt' },
  b: { name: 'Bridge', foot: 'wood' },
  s: { name: 'Shallows', foot: 'water', cost: 2, slip: 0.5, info: 'Two move points to wade in; poor footing halves block.' },
  f: { name: 'Forest', foot: 'leaves', cost: 2, cover: 0.5, info: 'Two move points to enter; arrows do half damage to whoever is inside.' },
  w: { name: 'Deep water', solid: true, info: 'Cannot be crossed.' },
  r: { name: 'Rock', solid: true, wall: true, info: 'Cannot be crossed; stops the axe.' },
  x: { name: 'Ruined wall', solid: true, wall: true, info: 'Cannot be crossed; stops the axe.' },
  i: { name: 'Ice', slip: 0.5, foot: 'ice', info: 'A frozen river bears your weight at walking pace; poor footing halves block.' },
  n: { name: 'Deep snow', cost: 2, foot: 'snow', info: 'Two move points to wade in.' },
  m: { name: 'Giant fungus', cost: 2, cover: 0.5, foot: 'moss', info: 'Two move points to enter; arrows do half damage to whoever is under the caps.' },
  c: { name: 'Crystal', solid: true, wall: true, info: 'Cannot be crossed; stops the axe.' },
  l: { name: 'Lava', solid: true, info: 'Cannot be crossed.' },
  a: { name: 'Ash drift', cost: 2, foot: 'ash', info: 'Two move points to wade in.' },
  k: { name: 'Cinder', foot: 'cinder' },
  v: { name: 'Steam vent', cover: 0.5, foot: 'cinder', info: 'Arrows do half damage to whoever stands in the steam.' },
};
// What is poured or lit on a tile for a while lies over its ground (game.js `ground`): the same properties as above, and
//   burn   whoever stands there when their side's turn ends takes this much, through no armour (nothing, if spells do not touch them)
export const POOLS = {
  fire: { name: 'Burning ground', burn: 6, info: 'Whoever stands here when their turn ends takes 6 damage.' },
  pitch: { name: 'Burning pitch', burn: 6, cost: 2, slip: 0.5, info: 'Whoever stands here when their turn ends takes 6 damage; two move points to enter; poor footing halves block.' },
};
// Height: stepping up a level costs one more move point, two levels at once cannot be climbed,
// and anything that works at range reaches one tile further at targets below it.
export const CLIMB = 1, REACH = 1;

export const MAPS = {
  board: {
    name: 'The Board', info: 'The plain stone board: no ground rules, nine by eleven.',
    cols: 9, rows: 11, zone: 3,
  },
};

export const mapOf = id => MAPS[id] || MAPS.board;
export const groundAt = (m, x, y) => TERRAIN[m.tiles ? m.tiles[y][x] : '.'];
export const highAt = (m, x, y) => (m.high ? +m.high[y][x] : 0);
