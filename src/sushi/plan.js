// the corner's plan, in the cart's metres (the cart at the origin, its stools toward -z, which is south; Market St along x, east the way x grows): THE MARKET's Market St and West St corner, park side (data/world.json's ramen; tools/ramen-corner.cjs reads the corner itself out of the market's page). The park's wall is behind the cart (NZ), the wide pavement ends at its kerb (KERB), Market St's road at the far kerb (FKERB), the art museum's and the bank's fronts stand across (FZ); West St's road runs north out of Market St just west of the cart (WSX0 to WSX1)
export const NZ = 2.77, KERB = -7.45, FKERB = -24.2, FZ = -30, ROAD = -0.229;
export const WSX0 = -26, WSX1 = -7.5;   // West St, kerb to kerb
export const W0 = -60, E0 = 60;   // where someone walking Market St is out of sight
export const LANES = [-4.4, -5.4];   // where people walk the cart's pavement: clear of the stools and the bench, and of the kei vans by the kerb
export const XWALK = -4.0, WXZ = -5.2;   // the crossing over Market St by the corner (its x), and the one over West St (its z)
export const KEI = { x0: -5.6, x1: 38, z0: KERB + 0.5, z1: KERB + 1.35 };   // the kei vans' band of the pavement: by the kerb, away from the wall and the cart
export const ground = (x, z) => ((z < KERB - 0.06 && z > FKERB + 0.06) || (x > WSX0 + 0.06 && x < WSX1 - 0.06 && z >= KERB - 0.06) ? ROAD : 0);   // how high the ground is: the roads lie a kerb below the pavements
export const WALK = { minX: WSX1 + 0.5, maxX: 40, minZ: KERB + 0.2, maxZ: NZ - 0.4 };   // where a visitor may walk: the cart's pavement
// where the corner's people stop: what the plans call it, where, its name
export const SPOTS = [{ type: 'bench', x: 6.5, z: NZ - 1.1, name: 'the park bench' }, { type: 'corner', x: WSX1 + 1.6, z: KERB + 1.6, name: 'the corner' }, { type: 'rail', x: -4.2, z: NZ - 0.9, name: 'the park railings' },
  { type: 'museum', x: -9, z: FZ + 2.6, name: 'the art museum' }, { type: 'bank', x: 6, z: FZ + 2.6, name: 'the bank' }, { type: 'lamp', x: 9, z: KERB + 1.9, name: 'the lamp post' }, { type: 'apts', x: WSX0 - 1.6, z: 6, name: 'the apartment house on West St' }, { type: 'busk', x: -1.2, z: FKERB - 2.6, name: 'the octopus\'s pitch across Market St' }];
export const CAT = { x: -39.8, z: -27.6 };   // where THE BIG CAT stands: by the westmost telephone pole on Market St's far pavement, as in the market
