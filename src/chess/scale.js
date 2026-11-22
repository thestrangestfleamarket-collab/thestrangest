// SKIRMISH TABLE's scale: how big each thing on a landscaped map really is, in metres, beside a figure; one table for every map (a map's `look.scale` shrinks all of it alike: the campaign's map of a country)
export const METRE = 0.78;   // board units to a metre: a figure, 1.8 m, stands 1.4 tiles high and a tile is 1.28 m

export const SIZES = {
  figure: 1.8,
  // a tree's height, and its crown's width as a share of that height
  tree: { birch: { tall: [8, 11], spread: 0.55 }, oak: { tall: [9, 13], spread: 0.62 }, fir: { tall: [10, 15], spread: 0.42 } },
  log: 3.6,                                                     // a fallen tree's length
  grass: { field: [0.12, 0.28], meadow: [0.3, 0.6] },           // grazed short where pieces stand, knee-high round the edge
  reed: { field: [0.5, 0.9], bank: [1.2, 2] },
  bridge: { wide: 1.2, rail: 1 },
  wall: { tall: 2.8, thick: 0.55 },                             // a ruined wall; its length is its two tiles
  rock: { solid: { wide: [1.15, 1.25], tall: [1.3, 1.7] }, crag: { wide: [1.15, 1.25], tall: [1.5, 2] }, scree: [0.3, 0.55], bank: [0.13, 0.4], boulder: [0.3, 1.1] },
  camp: { ring: 0.8, stone: [0.14, 0.18], stick: 0.5, flame: 0.7 },
  torch: { tall: 2.1, flame: 0.45 },
  bird: 0.8, butterfly: 0.1,                                    // wing tip to wing tip
};
