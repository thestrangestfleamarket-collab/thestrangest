// THE CANTINA's plan: the hall, the loft, the stair, the card tables and their seats.
export const ROOM = { w: 22, d: 16, h: 8, loft: 3.62 };
export const LOFT = { lx: -6.8, lz: -4, le: 4.2, stz: 6.5, run: 4.5, half: 0.8 };   // left loft's edge, back loft's edge, its east end, the stair's line, length and half width
export const CARD = { w: 0.064, h: 0.089, t: 0.0005 };
export const DECK_SIZE = 52;
export const SPAWN = { x: 3.4, z: 6.4 };
// top: felt height over base; rx, rz: the felt; sx, sz: where the chairs stand; free: seats a player may take; npc: seats the regulars hold
export const TABLES = [
  { x: 1.6, z: 1.2, base: 0, top: 0.78, rx: 1.22, rz: 0.39, sx: 1.95, sz: 1.12, n: 8, a0: 0.5, free: [0, 4, 7], npc: [1, 2, 3, 5, 6], headY: 1.3, deck: [-0.36, 0], btn: [[0.48, 0.16], [0.7, 0.16]] },
  { x: -3.2, z: -6.1, base: 3.62, top: 0.742, rx: 0.44, rz: 0.44, sx: 0.82, sz: 0.82, n: 4, a0: 0.5, free: [0, 1, 2, 3], npc: [], headY: 1.25, deck: [0, -0.08], btn: [[0.2, 0.12], [-0.2, 0.12]] },
];
export const seatAngle = (t, s) => ((s + TABLES[t].a0) / TABLES[t].n) * Math.PI * 2;
export function seatInfo(t, s) {
  const T = TABLES[t], a = seatAngle(t, s), x = T.x + Math.sin(a) * T.sx, z = T.z + Math.cos(a) * T.sz;
  return { x, z, y: T.base, yaw: Math.atan2(x - T.x, z - T.z), a };
}
export const tableY = (t) => TABLES[t].base + TABLES[t].top;
export const deckPos = (t) => ({ x: TABLES[t].x + TABLES[t].deck[0], y: tableY(t), z: TABLES[t].z + TABLES[t].deck[1] });
export const buttonPos = (t, which) => ({ x: TABLES[t].x + TABLES[t].btn[which][0], y: tableY(t), z: TABLES[t].z + TABLES[t].btn[which][1] });
export const onFelt = (t, x, z) => ((x - TABLES[t].x) / TABLES[t].rx) ** 2 + ((z - TABLES[t].z) / TABLES[t].rz) ** 2 < 1;
export const inLoft = (x, z) => x < LOFT.lx || (z < LOFT.lz && x < LOFT.le);
export const onStair = (x, z) => x >= LOFT.lx && x <= LOFT.lx + LOFT.run && Math.abs(z - LOFT.stz) <= LOFT.half;
export function flatQuat(yaw, faceUp) {
  const s = Math.sin(yaw / 2), c = Math.cos(yaw / 2);
  return faceUp ? [0, s, 0, c] : [s, 0, c, 0];
}
// where the n-th card dealt to a seat lands, face down
export function dealSpot(t, s, n) {
  const T = TABLES[t], si = seatInfo(t, s), k = n % 7, lat = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.03;
  const ex = Math.sin(si.a), ez = Math.cos(si.a);
  return { p: [T.x + ex * T.rx * 0.74 + ez * lat, tableY(t) + CARD.t / 2 + n * CARD.t, T.z + ez * T.rz * 0.7 - ex * lat], q: flatQuat(si.yaw + (k - 3) * 0.03, false) };
}
// the floor under a walker at (x, z) who stands at height y: the ground, the stair, or the loft
export function floorY(x, z, y) {
  if (onStair(x, z)) return ROOM.loft * (1 - (x - LOFT.lx) / LOFT.run);
  return inLoft(x, z) && y > ROOM.loft - 0.7 ? ROOM.loft : 0;
}
