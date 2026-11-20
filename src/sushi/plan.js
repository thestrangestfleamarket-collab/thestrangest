// the street's plan, in the cart's metres (the cart at the origin, its stools toward -z, which is south; Market St along x, east the way x grows): THE MARKET's Market St, park side, across from THE BODEGA (data/world.json's ramen, owner 20 Nov 2026: "move the cart east"; tools/ramen-corner.cjs reads the street itself out of the market's page). The park's wall is behind the cart (NZ), the wide pavement ends at its kerb (KERB), Market St's road at the far kerb (FKERB), THE STRANGEST LANES', the bodega's, the Foundry Lofts' and THE BAR's fronts stand across (FZ); the park gate, its crossing and its stalls are west along the cart's own pavement (GATE, STALLS)
export const NZ = 2.77, KERB = -7.45, FKERB = -24.2, FZ = -30, ROAD = -0.229;
export const GATE = [-34.4, -26.0], GATEX = -30.2;   // the park gate's opening in the wall, and its middle: the way north into the park, and the painted crossing over Market St before it
export const STALLS = [-23.6, -10.3];   // the stalls against the park wall east of the gate (the mushroom stall, the vegetable stall, the gem stall), west end to east end
export const W0 = -60, E0 = 60;   // where someone walking Market St is out of sight
export const LANES = [-4.4, -5.4];   // where people walk the cart's pavement: clear of the stools, the stalls and the bench, and of the kei vans by the kerb
export const XWALK = 5.5;   // where the street's people step over Market St to the bodega's side: straight across, between the cars (which wait for them); the painted crossing is at the gate (GATEX)
export const KEI = { x0: -9, x1: 38, z0: KERB + 0.5, z1: KERB + 1.35 };   // the kei vans' band of the pavement: by the kerb, away from the wall and the cart
export const ground = (x, z) => (z < KERB - 0.06 && z > FKERB + 0.06 ? ROAD : 0);   // how high the ground is: the road lies a kerb below the pavements
export const WALK = { minX: -9.5, maxX: 40, minZ: KERB + 0.2, maxZ: NZ - 0.4 };   // where a visitor may walk: the cart's pavement, from short of the stalls to THE BAR's end of the street
export const BENCH = [13.1, 0.3, 15.5, 1.5];   // the park bench by the wall (x0, z0, x1, z1): walked round
// where the street's people stop: what the plans call it, where, its name
export const SPOTS = [{ type: 'bench', x: 14.3, z: NZ - 1.1, name: 'the park bench' }, { type: 'kerb', x: -5.6, z: KERB + 1.6, name: 'the kerb by the cart' }, { type: 'rail', x: -4.2, z: NZ - 0.9, name: 'the park railings' }, { type: 'lamp', x: -23.4, z: KERB + 1.8, name: 'the signal post at the gate crossing' },
  { type: 'gate', x: -26.5, z: -2.2, name: 'the park gate' }, { type: 'stall', x: -21.4, z: 0.3, name: 'the mushroom stall at the park wall' },
  { type: 'bodega', x: 3.4, z: FZ + 2.6, name: 'the bodega' }, { type: 'lanes', x: -5, z: FZ + 2.6, name: 'THE STRANGEST LANES' }, { type: 'apts', x: 19.6, z: FZ + 2.6, name: 'the Foundry Lofts' }, { type: 'bar', x: 33, z: FZ + 2.6, name: 'THE BAR' },
  { type: 'busk', x: -2.4, z: FKERB - 2.6, name: 'the octopus\'s pitch across Market St, beside the bodega' }];
export const CAT = { x: -13.5, z: -27.6 };   // where THE BIG CAT stands: on Market St's far pavement before THE STRANGEST LANES, west of the octopus
