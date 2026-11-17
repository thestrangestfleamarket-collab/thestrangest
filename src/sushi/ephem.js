// the sky's sums, copied from THE MARKET's EPH (src/134bb-ephem.js: Meeus, JPL's approximate elements), over Edo instead of New York: where the Sun and the Moon stand at a moment, how much of the Moon is lit, and the sidereal time that turns the stars
const D2R = Math.PI / 180, R2D = 180 / Math.PI, sn = (x) => Math.sin(x * D2R), cs = (x) => Math.cos(x * D2R), nrm = (x) => ((x % 360) + 360) % 360, s180 = (x) => { x = nrm(x); return x > 180 ? x - 360 : x; }, cl = (v, a, b) => Math.max(a, Math.min(b, v));
export const LAT = 35.68, LON = 139.77, EPS = 23.43928;   // Edo (Nihonbashi)
const EM = [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0];
const helio = (q, T) => { const a = q[0] + q[1] * T, e = q[2] + q[3] * T, I = q[4] + q[5] * T, L = q[6] + q[7] * T, wb = q[8] + q[9] * T, O = q[10] + q[11] * T, w = wb - O, Mr = s180(L - wb) * D2R; let E = Mr + e * Math.sin(Mr);
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E)); const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E), cw = cs(w), sw = sn(w), cO = cs(O), sO = sn(O), cI = cs(I), sI = sn(I);
  return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, (sw * sI) * xp + (cw * sI) * yp]; };
const toEq = (x, y, z) => { const ye = y * cs(EPS) - z * sn(EPS), ze = y * sn(EPS) + z * cs(EPS), r = Math.hypot(x, ye, ze); return { ra: nrm(Math.atan2(ye, x) * R2D), dec: Math.asin(ze / r) * R2D, r }; };
export function where(k, jd) {
  const T = (jd - 2451545) / 36525;
  if (k === 'sun') { const E = helio(EM, T); return toEq(-E[0], -E[1], -E[2]); }
  const l = 218.32 + 481267.881 * T + 6.29 * sn(135 + 477198.87 * T) - 1.27 * sn(259.3 - 413335.36 * T) + 0.66 * sn(235.7 + 890534.22 * T) + 0.21 * sn(269.9 + 954397.74 * T) - 0.19 * sn(357.5 + 35999.05 * T) - 0.11 * sn(186.5 + 966404.03 * T) - 1.3969713 * T;
  const b = 5.13 * sn(93.3 + 483202.02 * T) + 0.28 * sn(228.2 + 960400.89 * T) - 0.28 * sn(318.3 + 6003.15 * T) - 0.17 * sn(217.6 - 407332.21 * T), p = 0.9508 + 0.0518 * cs(135 + 477198.87 * T) + 0.0095 * cs(259.3 - 413335.36 * T) + 0.0078 * cs(235.7 + 890534.22 * T) + 0.0028 * cs(269.9 + 954397.74 * T);
  const q = toEq(cs(b) * cs(l), cs(b) * sn(l), sn(b)), S = where('sun', jd), el = Math.acos(cl(sn(q.dec) * sn(S.dec) + cs(q.dec) * cs(S.dec) * cs(q.ra - S.ra), -1, 1)) * R2D;
  return { ra: q.ra, dec: q.dec, par: p, i: 180 - el, lit: (1 + cs(180 - el)) / 2, waxing: nrm(q.ra - S.ra) < 180 };
}
export const gmst = (jd) => nrm(280.46061837 + 360.98564736629 * (jd - 2451545)), lst = (jd) => nrm(gmst(jd) + LON);
export const eq2hor = (ra, dec, l) => { const H = l - ra, alt = Math.asin(cl(sn(LAT) * sn(dec) + cs(LAT) * cs(dec) * cs(H), -1, 1)) * R2D, az = nrm(Math.atan2(-cs(dec) * sn(H), sn(dec) * cs(LAT) - cs(dec) * cs(H) * sn(LAT)) * R2D); return { alt, az }; };
export function seen(k, jd) { const q = where(k, jd), h = eq2hor(q.ra, q.dec, lst(jd)); if (k === 'moon') h.alt -= q.par * cs(h.alt); return { ...q, ...h }; }
export const jdOf = (ms) => ms / 864e5 + 2440587.5;
// a direction in the village (x east, y up, z north... the street runs east-west, north is +z) from height and bearing
export const dir = (alt, az, out) => { const c = cs(alt); out.x = c * sn(az); out.y = sn(alt); out.z = c * cs(az); return out; };
