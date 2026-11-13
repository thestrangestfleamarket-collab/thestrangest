// Weapon definitions. Speeds are metres/second — deliberately slow so shots can be dodged.
export const WEAPONS = {
  pulse: {
    name: 'PULSE', hint: 'fast-firing bolt',
    speed: 7, r: 0.05, dmg: 8, cd: 0.4, life: 3, canShoot: true, orient: true, color: 0x66ffff,
  },
  orb: {
    name: 'DETONATOR', hint: 'fire again to explode it',
    speed: 2.2, r: 0.17, cd: 3, life: 7, explosive: true, blast: 1.3, blastDmg: 38,
    shootable: true, detonate: true, burn: true, color: 0xffaa33,
  },
  missile: {
    name: 'SEEKER', hint: 'homing missile - fire it wide to curve in',
    speed: 2.6, maxSpeed: 4.6, accel: 1.5, turn: 1.5, homingDelay: 0.45, homingEnd: 4.5,
    r: 0.09, cd: 4, life: 6.5, explosive: true, blast: 0.75, blastDmg: 26,
    shootable: true, homing: true, orient: true, color: 0xff66ff,
  },
  bouncer: {
    name: 'RICOCHET', hint: 'bounces off walls 3 times',
    speed: 5, r: 0.09, dmg: 12, cd: 1.1, life: 6, bounces: 3, canShoot: true, color: 0x99ff66,
  },
  wave: {
    name: 'WAVE', hint: 'wide bar - twist your wrist to tilt it',
    speed: 3.4, r: 0.05, half: 0.9, dmg: 18, cd: 2.5, life: 4, bar: true, color: 0x6699ff,
  },
  mine: {
    name: 'CRYO MINE', hint: 'floats, then freezes their launcher',
    speed: 3.2, drag: 1.2, r: 0.11, cd: 2.5, life: 25, explosive: true, blast: 1.25, blastDmg: 24,
    shootable: true, mine: true, armTime: 1.2, trigger: 0.85, sticky: true, max: 2, cryo: 2.5, color: 0x9fe4ff,
  },
};

export const ORDER = ['pulse', 'orb', 'missile', 'bouncer', 'wave', 'mine'];
