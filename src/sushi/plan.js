// the block's plan, in the cart's metres (the cart at the origin, its stools toward -z, the street along x): the cart backs onto the tenements' fronts (NZ) on a pavement that ends at its kerb (KERB); the street, one lane between two rows of parked cars; the far kerb (FKERB) and the fronts across (FZ); an avenue across each end
export const NZ = 2.7, KERB = -3.5, FKERB = -11.5, FZ = -15.2, W0 = -26.6, E0 = 26.6, ROAD = -0.15;
export const AX0 = E0 + 4, AX1 = E0 + 22, WX1 = W0 - 4, WX0 = W0 - 22;   // First Avenue east of the block, Second Avenue west of it: kerb to kerb
export const LANES = [-2.2, -2.85];   // where people walk the cart's pavement: clear of the stools, and of the kerb's poles
export const SUB = { x0: 19.2, x1: 23.6, z0: FKERB - 1.45, z1: FKERB - 0.25 };   // the subway stair's well, in the far pavement by its kerb
export const VENT = [3.4, FKERB + 1.0];   // the steam main's manhole
