// Aircraft database. Real-world figures (mass, wing area, span, power/thrust) drive the flight model.
// Units: SI. mass kg, S m^2, b m, power W, thrust N, speeds m/s.
const HP = 745.7;

const GUNS = {
  vickers: { name: '2x Vickers .303', n: 2, rof: 8, v0: 740, dmg: 5, ammo: 500, snd: 'mg_light', spread: 0.004 },
  spandau: { name: '2x LMG 08/15', n: 2, rof: 8, v0: 890, dmg: 5, ammo: 1000, snd: 'mg_light', spread: 0.004 },
  brit303: { name: '8x Browning .303', n: 8, rof: 19, v0: 740, dmg: 4, ammo: 2800, snd: 'mg_light', spread: 0.005 },
  mg151: { name: 'MG 151 + 2x MG 17', n: 3, rof: 14, v0: 800, dmg: 10, ammo: 1200, snd: 'mg_heavy', spread: 0.003 },
  m2x6: { name: '6x M2 .50 cal', n: 6, rof: 13, v0: 880, dmg: 8, ammo: 1880, snd: 'mg_heavy', spread: 0.004 },
  type99: { name: '2x Type 99 20mm + 2x 7.7', n: 4, rof: 9, v0: 620, dmg: 11, ammo: 1100, snd: 'mg_heavy', spread: 0.004 },
  m3x6: { name: '6x M3 .50 cal', n: 6, rof: 20, v0: 880, dmg: 8, ammo: 1800, snd: 'mg_heavy', spread: 0.003 },
  nr23: { name: 'N-37 + 2x NR-23', n: 3, rof: 9, v0: 690, dmg: 34, ammo: 200, snd: 'mg_heavy', spread: 0.003 },
  m61: { name: 'M61 Vulcan 20mm', n: 1, rof: 100, v0: 1050, dmg: 14, ammo: 640, snd: 'vulcan', spread: 0.0025 },
  gsh23: { name: 'GSh-23L 23mm', n: 1, rof: 55, v0: 715, dmg: 17, ammo: 200, snd: 'vulcan', spread: 0.003 },
  gsh301: { name: 'GSh-30-1 30mm', n: 1, rof: 28, v0: 860, dmg: 34, ammo: 150, snd: 'mg_heavy', spread: 0.002 },
};

// cockpit: kit = ww1 | ww2 | jet1 (early jet, analog) | jet3 (cold war, analog + CRT) | jet4 (glass)
// eye: pilot eye point in model space (metres, x right, y up, z back). null = derive from model metadata.
export const PLANES = [
  { id: 'camel', name: 'Sopwith Camel F.1', year: 1917, era: 'WW1', nation: 'UK', side: 0,
    engine: 'rotary', mass: 660, S: 21.5, b: 8.53, power: 130 * HP, propEff: 0.74, CD0: 0.0378, e: 0.72, CLmax: 1.25, gLimit: 6.5, mcrit: 0.6,
    gun: GUNS.vickers, kit: 'ww1', eye: [0, 0.78, 0.18], fixedGear: true, gyro: 0.9, snd: 'rotary_loop', sndPitch: 1.0 },
  { id: 'dr1', name: 'Fokker Dr.I', year: 1917, era: 'WW1', nation: 'DE', side: 1,
    engine: 'rotary', mass: 586, S: 18.7, b: 7.19, power: 110 * HP, propEff: 0.72, CD0: 0.046, e: 0.78, CLmax: 1.45, gLimit: 6.5, mcrit: 0.6,
    gun: GUNS.spandau, kit: 'ww1', eye: [0, 1.05, -0.58], fixedGear: true, gyro: 0.7, snd: 'rotary_loop', sndPitch: 0.92 },

  { id: 'spitfire', name: 'Supermarine Spitfire Mk I', year: 1938, era: 'WW2', nation: 'UK', side: 0,
    engine: 'piston', mass: 2700, S: 22.5, b: 11.23, power: 1175 * HP, propEff: 0.82, CD0: 0.0205, e: 0.86, CLmax: 1.36, gLimit: 8, mcrit: 0.82,
    gun: GUNS.brit303, kit: 'ww2', eye: null, snd: 'prop_loop', sndPitch: 1.0 },
  { id: 'bf109', name: 'Messerschmitt Bf 109 F-2', year: 1941, era: 'WW2', nation: 'DE', side: 1,
    engine: 'piston', mass: 2750, S: 16.1, b: 9.92, power: 1160 * HP, propEff: 0.82, CD0: 0.0225, e: 0.8, CLmax: 1.42, gLimit: 8, mcrit: 0.78,
    gun: GUNS.mg151, kit: 'ww2', eye: null, snd: 'prop_loop', sndPitch: 0.94 },
  { id: 'p51', name: 'North American P-51D Mustang', year: 1944, era: 'WW2', nation: 'US', side: 0,
    engine: 'piston', mass: 4175, S: 21.8, b: 11.28, power: 1720 * HP, propEff: 0.84, CD0: 0.0166, e: 0.84, CLmax: 1.35, gLimit: 8, mcrit: 0.8,
    vne: 235, gun: GUNS.m2x6, kit: 'ww2', eye: [0, 0.72, -0.35], snd: 'prop_loop', sndPitch: 1.06 },
  { id: 'zero', name: 'Mitsubishi A6M3 Zero', year: 1942, era: 'WW2', nation: 'JP', side: 1,
    engine: 'piston', mass: 2540, S: 21.5, b: 11.0, power: 1130 * HP, propEff: 0.8, CD0: 0.0215, e: 0.84, CLmax: 1.5, gLimit: 7, mcrit: 0.72,
    gun: GUNS.type99, kit: 'ww2', eye: null, snd: 'radial_loop', sndPitch: 1.0 },

  { id: 'f86', name: 'North American F-86F Sabre', year: 1952, era: 'Korea', nation: 'US', side: 0,
    engine: 'jet', mass: 6900, S: 29.1, b: 11.3, thrust: 26300, CD0: 0.0135, e: 0.8, CLmax: 1.2, gLimit: 7.3, mcrit: 0.88, wave: 0.05,
    gun: GUNS.m3x6, kit: 'jet1', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 1.0 },
  { id: 'mig15', name: 'Mikoyan-Gurevich MiG-15bis', year: 1950, era: 'Korea', nation: 'USSR', side: 1,
    engine: 'jet', mass: 5000, S: 20.6, b: 10.08, thrust: 26500, CD0: 0.0165, e: 0.78, CLmax: 1.15, gLimit: 8, mcrit: 0.86, wave: 0.06,
    gun: GUNS.nr23, kit: 'jet1', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 0.95 },

  { id: 'f4', name: 'McDonnell Douglas F-4E Phantom II', year: 1967, era: 'Cold War', nation: 'US', side: 0,
    engine: 'jet', mass: 18800, S: 49.2, b: 11.7, thrust: 105000, thrustAB: 159000, CD0: 0.0215, e: 0.7, CLmax: 1.05, gLimit: 7.3, mcrit: 0.92, wave: 0.03, supersonic: true,
    gun: GUNS.m61, rockets: 16, kit: 'jet3', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 0.9, engines: 2 },
  { id: 'mig21', name: 'Mikoyan-Gurevich MiG-21bis', year: 1972, era: 'Cold War', nation: 'USSR', side: 1,
    engine: 'jet', mass: 8700, S: 23, b: 7.15, thrust: 40200, thrustAB: 69600, CD0: 0.02, e: 0.62, CLmax: 1.0, gLimit: 8.5, mcrit: 0.93, wave: 0.028, supersonic: true,
    gun: GUNS.gsh23, rockets: 8, kit: 'jet3', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 1.05 },
  { id: 'f14', name: 'Grumman F-14A Tomcat', year: 1974, era: 'Cold War', nation: 'US', side: 0,
    engine: 'jet', mass: 24500, S: 52.5, b: 15.5, thrust: 110000, thrustAB: 186000, CD0: 0.021, e: 0.82, CLmax: 1.5, gLimit: 7.5, mcrit: 0.93, wave: 0.026, supersonic: true,
    gun: GUNS.m61, rockets: 16, kit: 'jet3', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 0.88, engines: 2 },

  { id: 'f15', name: 'McDonnell Douglas F-15C Eagle', year: 1979, era: 'Modern', nation: 'US', side: 0,
    engine: 'jet', mass: 20200, S: 56.5, b: 13.05, thrust: 130000, thrustAB: 211000, CD0: 0.019, e: 0.78, CLmax: 1.35, gLimit: 9, mcrit: 0.94, wave: 0.025, supersonic: true,
    gun: GUNS.m61, rockets: 16, kit: 'jet4', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 0.92, engines: 2 },
  { id: 'f16', name: 'General Dynamics F-16C Fighting Falcon', year: 1984, era: 'Modern', nation: 'US', side: 0,
    engine: 'jet', mass: 12000, S: 27.9, b: 9.96, thrust: 76300, thrustAB: 127000, CD0: 0.0175, e: 0.8, CLmax: 1.45, gLimit: 9, mcrit: 0.94, wave: 0.027, supersonic: true, fbw: true,
    gun: GUNS.m61, rockets: 12, kit: 'jet4', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 1.05 },
  { id: 'mig29', name: 'Mikoyan MiG-29 Fulcrum', year: 1983, era: 'Modern', nation: 'USSR', side: 1,
    engine: 'jet', mass: 15000, S: 38, b: 11.36, thrust: 100000, thrustAB: 163000, CD0: 0.0205, e: 0.8, CLmax: 1.5, gLimit: 9, mcrit: 0.94, wave: 0.026, supersonic: true,
    gun: GUNS.gsh301, rockets: 12, kit: 'jet4', eye: [0, 0.82, -3.55], airbrake: true, snd: 'jet_ext', sndPitch: 1.0, engines: 2 },
  { id: 'su27', name: 'Sukhoi Su-27 Flanker', year: 1985, era: 'Modern', nation: 'USSR', side: 1,
    engine: 'jet', mass: 23400, S: 62, b: 14.7, thrust: 150000, thrustAB: 245000, CD0: 0.02, e: 0.8, CLmax: 1.6, gLimit: 9, mcrit: 0.94, wave: 0.025, supersonic: true, fbw: true,
    gun: GUNS.gsh301, rockets: 16, kit: 'jet4', eye: [0, 1.35, -5.2], airbrake: true, snd: 'jet_ext', sndPitch: 0.86, engines: 2 },
  { id: 'f22', name: 'Lockheed Martin F-22A Raptor', year: 2005, era: 'Modern', nation: 'US', side: 0,
    engine: 'jet', mass: 26000, S: 78, b: 13.56, thrust: 232000, thrustAB: 312000, CD0: 0.0165, e: 0.8, CLmax: 1.7, gLimit: 9, mcrit: 0.96, wave: 0.021, supersonic: true, fbw: true, tvc: true,
    gun: GUNS.m61, rockets: 16, kit: 'jet4', eye: null, airbrake: true, snd: 'jet_ext', sndPitch: 0.84, engines: 2 },
];

export const PLANE_BY_ID = Object.fromEntries(PLANES.map(p => [p.id, p]));
export const ERAS = ['WW1', 'WW2', 'Korea', 'Cold War', 'Modern'];

// Unguided rocket (jets): a fast straight-flying projectile with a blast radius
export const ROCKET = { burn: 1.6, accel: 420, life: 9, dmg: 120, blast: 14 };

export function opponentsFor(plane) {
  let c = PLANES.filter(p => p.era === plane.era && p.side !== plane.side);
  if (!c.length) c = PLANES.filter(p => p.era === plane.era && p.id !== plane.id);
  return c;
}
export function alliesFor(plane) { return PLANES.filter(p => p.era === plane.era && p.side === plane.side); }
