// Pure game rules, shared by the server (authoritative) and the client (highlights).
import { MAPS, TERRAIN, POOLS, CLIMB, REACH, mapOf, groundAt, highAt } from './maps.js';
export { MAPS, TERRAIN, POOLS, mapOf };
export const COLS = 9;
export const ROWS = 11;
export const TURN_SECONDS = 120;
export const MAX_PASSES = 4; // consecutive passes (both players) before a draw
export const QUIET = 100;     // turns with no wound dealt before a draw (two sides that cannot hurt each other)
export const GRAVES = 12;     // how many tiles where a piece fell are remembered

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

// A team is picked under a point budget: each unit has a cost, and a limit on how many of it a team may field.
export const BUDGET = 40, TEAM_MAX = 12;
// group: where the team picker lists it. kind: melee | line | ranged | blast | heal | snare | bolt | chain | cone | flask | summon | none
// What a unit may carry beyond the plain numbers, each read by the one rule that deals with it (never by the unit's name):
//   school   what its attack is, when not what its kind says (schoolOf)          takes    the share it takes of each school of attack ({ shot: 0.5 }; 0 is immune)
//   brace    it strikes first (this many times its power) at whoever walks up to strike it, unless from behind
//   shelter  an ally right behind it, as the attacker sees them, takes this share of a shot or a spell
//   reload   after it acts it is empty, and must spend an act reloading   execute  it kills outright from behind a target at or under this share of its health
//   leap     how many pieces it may pass in a move     hop  it passes any number     fly  it also crosses any ground at one point a tile
//   aura     how far its allies are lent aMove (move points), aQuick (a turn less rest), aPow (a share more power), aBlock (block)
//   lasts    turns the ground it hits stays as its pool (tar: the slowing kind)     chill  turns its bolt holds a piece in place     jumps  how often its lightning leaps on
//   summon   the type it sets on an empty tile (grave: only where a piece fell; life: for how many of its turns; cap: how many at once)
//   pack     a share more damage for each other pack hunter of its side beside the target     regen  health back each of its turns     shove  it knocks what it hits back a tile
//   fall     when it dies its side loses this many turns (never the match)
export const GROUPS = { fighter: 'Fighters', caster: 'Casters', creature: 'Creatures', leader: 'Leader' };
export const TYPES = {
  bulwark:  { name: 'Knight', group: 'fighter', cost: 5, limit: 4,      hp: 50, pow: 18, armor: 25, block: 80, move: 3, rec: 1, kind: 'melee',  min: 1, max: 1,
              info: 'Armoured front-liner. Very hard to hurt from the front.' },
  lancer:   { name: 'Berserker', group: 'fighter', cost: 4, limit: 4,   hp: 36, pow: 20, armor: 10, block: 40, move: 4, rec: 1, kind: 'line',   min: 1, max: 2,
              info: 'Drives a great axe two tiles in a straight line, hitting everything in it.' },
  strider:  { name: 'Rogue', group: 'fighter', cost: 4, limit: 4,       hp: 28, pow: 18, armor: 0,  block: 60, move: 6, rec: 1, kind: 'melee',  min: 1, max: 1, backstab: 1.5,
              info: 'Fast flanker. +50% damage when striking from behind.' },
  slinger:  { name: 'Archer', group: 'fighter', cost: 4, limit: 4,      hp: 26, pow: 16, armor: 0,  block: 30, move: 3, rec: 2, kind: 'ranged', min: 2, max: 5,
              info: 'Lobbed shots at range 2-5. Cannot hit adjacent tiles.' },
  ember:    { name: 'Fire Mage', group: 'caster', cost: 4, limit: 2,   hp: 24, pow: 14, armor: 0,  block: 0,  move: 3, rec: 3, kind: 'blast',  min: 1, max: 4,
              info: 'Unblockable burst on a unit and the 4 tiles around it. Burns allies too.' },
  mender:   { name: 'Cleric', group: 'caster', cost: 3, limit: 2,      hp: 24, pow: 14, armor: 0,  block: 20, move: 3, rec: 2, kind: 'heal',   min: 1, max: 3,
              info: 'Restores 14 health to an ally within 3 tiles. Cannot attack.' },
  hexbinder:{ name: 'Enchanter', group: 'caster', cost: 3, limit: 2,   hp: 22, pow: 0,  armor: 0,  block: 20, move: 3, rec: 3, kind: 'snare',  min: 1, max: 3, snare: 2,
              info: 'Snares an enemy for 2 of its turns: it cannot move, act or block.' },
  pike:     { name: 'Pikeman', group: 'fighter', cost: 4, limit: 4, hp: 34, pow: 16, armor: 10, block: 50, move: 3, rec: 1, kind: 'line', min: 1, max: 2, brace: 1,
              info: 'Thrusts two tiles in a straight line. Strikes first at anyone who walks up to strike him, unless from behind.' },
  warden:   { name: 'Shieldbearer', group: 'fighter', cost: 4, limit: 4, hp: 46, pow: 10, armor: 30, block: 85, move: 3, rec: 1, kind: 'melee', min: 1, max: 1, shelter: 0.5,
              info: 'A weak blow behind a tower shield. An ally right behind him takes half damage from arrows and spells.' },
  arbalest: { name: 'Crossbowman', group: 'fighter', cost: 5, limit: 4, hp: 26, pow: 26, armor: 0, block: 20, move: 3, rec: 1, kind: 'ranged', min: 2, max: 6, reload: 1,
              info: 'A heavy bolt at range 2-6. After each shot he must spend an act reloading (tap him).' },
  assassin: { name: 'Assassin', group: 'fighter', cost: 5, limit: 2, hp: 24, pow: 16, armor: 0, block: 50, move: 5, rec: 1, kind: 'melee', min: 1, max: 1, leap: 1, execute: 0.4,
              info: 'Leaps over one piece as she moves. From behind, kills outright a target at or under 40% of its health.' },
  bard:     { name: 'Bard', group: 'fighter', cost: 3, limit: 2, hp: 22, pow: 0, armor: 0, block: 30, move: 4, rec: 1, kind: 'none', min: 0, max: 0, aura: 1, aMove: 1, aQuick: 1,
              info: 'No attack. Allies beside him move one tile further and rest one turn less.' },
  alchemist:{ name: 'Alchemist', group: 'fighter', cost: 4, limit: 2, hp: 24, pow: 10, armor: 0, block: 20, move: 3, rec: 2, kind: 'flask', min: 2, max: 4, lasts: 4,
              info: 'Throws a flask at any tile 2-4 away: it burns whoever stands there and the ground burns for four turns.' },
  frost:    { name: 'Frost Mage', group: 'caster', cost: 4, limit: 2, hp: 22, pow: 8, armor: 0, block: 0, move: 3, rec: 2, kind: 'bolt', min: 1, max: 4, chill: 1,
              info: 'A cold bolt, unblockable: little damage, but the target is frozen in place for its next turn: it cannot move or turn.' },
  necro:    { name: 'Necromancer', group: 'caster', cost: 5, limit: 2, hp: 22, pow: 0, armor: 0, block: 10, move: 3, rec: 3, kind: 'summon', min: 1, max: 3, summon: 'skeleton', grave: 1, cap: 3,
              info: 'Raises a Skeleton for his side on an empty tile where a piece fell, within 3 tiles. Three at most at once.' },
  summoner: { name: 'Summoner', group: 'caster', cost: 4, limit: 2, hp: 22, pow: 0, armor: 0, block: 10, move: 3, rec: 3, kind: 'summon', min: 1, max: 2, summon: 'wolf', life: 3, cap: 2,
              info: 'Calls a Wolf onto an empty tile within 2. It fades after three of your turns. Two at most at once.' },
  storm:    { name: 'Storm Mage', group: 'caster', cost: 5, limit: 2, hp: 22, pow: 13, armor: 0, block: 0, move: 3, rec: 3, kind: 'chain', min: 1, max: 4, jumps: 2,
              info: 'Unblockable lightning that leaps on to the next piece beside each one it hits, friend or foe, twice, weaker each time.' },
  wolf:     { name: 'Wolf', group: 'creature', cost: 3, limit: 3, hp: 20, pow: 10, armor: 0, block: 20, move: 6, rec: 1, kind: 'melee', min: 1, max: 1, pack: 0.3,
              info: 'Fast and weak. +30% damage for each other wolf of its side beside the target.' },
  ogre:     { name: 'Ogre', group: 'creature', cost: 7, limit: 2, hp: 70, pow: 22, armor: 10, block: 10, move: 2, rec: 1, kind: 'melee', min: 1, max: 1, regen: 4, shove: 1,
              info: 'Big and slow. Heals 4 each of its turns; its blow knocks the target back a tile.' },
  skeleton: { name: 'Skeleton', group: 'creature', cost: 2, limit: 4, hp: 14, pow: 10, armor: 0, block: 20, move: 3, rec: 1, kind: 'melee', min: 1, max: 1, takes: { shot: 0.5 },
              info: 'Cheap fodder. Arrows and bolts do half damage to it.' },
  ghost:    { name: 'Ghost', group: 'creature', cost: 5, limit: 2, hp: 18, pow: 10, armor: 0, block: 0, move: 4, rec: 1, kind: 'melee', min: 1, max: 1, school: 'spell', hop: 1, takes: { blade: 0, shot: 0 },
              info: 'Passes through pieces. Blades, arrows and bolts cannot touch it: only spells and fire hurt it. Its chill touch counts as a spell.' },
  whelp:    { name: 'Dragon Whelp', group: 'creature', cost: 13, limit: 1, hp: 44, pow: 16, armor: 10, block: 0, move: 5, rec: 2, kind: 'cone', min: 1, max: 2, fly: 1,
              info: 'Flies over pieces and any ground. Breathes fire in a cone: the tile ahead and the three beyond it, unblockable, friend or foe.' },
  golem:    { name: 'Golem', group: 'creature', cost: 7, limit: 2, hp: 60, pow: 22, armor: 40, block: 0, move: 2, rec: 2, kind: 'melee', min: 1, max: 1, takes: { spell: 0 },
              info: 'Very slow, very hard. Spells, snares, frost and fire do nothing to it.' },
  captain:  { name: 'Captain', group: 'leader', cost: 6, limit: 1, hp: 44, pow: 18, armor: 20, block: 60, move: 3, rec: 1, kind: 'melee', min: 1, max: 1, aura: 2, aPow: 0.2, aBlock: 10, fall: 1,
              info: 'One at most. Allies within 2 tiles hit 20% harder and block 10 better. If the Captain falls, your side loses its next turn.' },
};
// What an attack is: a blade (melee, line), a shot (ranged) or a spell (everything else), unless its type says.
export const schoolOf = t => t.school || (t.kind === 'melee' || t.kind === 'line' ? 'blade' : t.kind === 'ranged' ? 'shot' : 'spell');

// Player 0 deploys on the bottom rows (facing N); player 1 is the mirror image.
const LAYOUT = [
  ['strider', 1, 8], ['bulwark', 3, 8], ['lancer', 4, 8], ['bulwark', 5, 8], ['strider', 7, 8],
  ['slinger', 2, 9], ['ember', 4, 9], ['slinger', 6, 9],
  ['hexbinder', 3, 10], ['mender', 5, 10],
];

// Experience and upgrades. A unit type earns experience in battles (earned), which makes levels (levelOf); each level is one point to spend
// in that type's tree. An upgrade is only numbers added to the unit's own (`up`), so every rule that reads a number reads the upgrade too.
// Beyond the plain numbers a unit may carry: flank (the share of its block that holds against a blow from the side, half unless raised),
// leech (the share of the damage it deals that it takes back as health), chain (it does not rest after a kill), pierce (its shots ignore cover),
// spare (its blast passes over its own side), cleanse (its healing also breaks a snare), sting (damage its snare does, unblockable).
export const LEVELS_XP = [30, 90, 180];
export const levelOf = xp => LEVELS_XP.filter(n => (+xp || 0) >= n).length;
export const UPGRADES = {
  bulwark: [
    { id: 'plate', tier: 1, name: 'Tempered plate', info: '+8 health', up: { hp: 8 } },
    { id: 'edge', tier: 1, name: 'Whetted edge', info: '+3 power', up: { pow: 3 } },
    { id: 'march', tier: 2, name: 'Forced march', info: '+1 move', up: { move: 1 } },
    { id: 'mail', tier: 2, name: 'Double mail', info: '+10% armour', up: { armor: 10 } },
    { id: 'wall', tier: 3, name: 'Shield wall', info: 'Blocks blows from the side as well as from the front', up: { flank: 0.5 } },
  ],
  lancer: [
    { id: 'hide', tier: 1, name: 'Thick hide', info: '+6 health', up: { hp: 6 } },
    { id: 'heft', tier: 1, name: 'Heavier head', info: '+3 power', up: { pow: 3 } },
    { id: 'haft', tier: 2, name: 'Long haft', info: 'The axe reaches a third tile', up: { max: 1 } },
    { id: 'stride', tier: 2, name: 'Long stride', info: '+1 move', up: { move: 1 } },
    { id: 'blood', tier: 3, name: 'Bloodlust', info: 'Takes back a third of the damage it deals as health', up: { leech: 0.34 } },
  ],
  strider: [
    { id: 'wiry', tier: 1, name: 'Wiry', info: '+5 health', up: { hp: 5 } },
    { id: 'feint', tier: 1, name: 'Feint', info: '+15 block', up: { block: 15 } },
    { id: 'fleet', tier: 2, name: 'Fleet', info: '+1 move', up: { move: 1 } },
    { id: 'kidney', tier: 2, name: 'Kidney strike', info: 'Backstab does double damage', up: { backstab: 0.5 } },
    { id: 'chain', tier: 3, name: 'Slip away', info: 'Does not rest after a kill', up: { chain: 1 } },
  ],
  slinger: [
    { id: 'jerkin', tier: 1, name: 'Padded jerkin', info: '+5 health', up: { hp: 5 } },
    { id: 'draw', tier: 1, name: 'Heavy draw', info: '+3 power', up: { pow: 3 } },
    { id: 'eye', tier: 2, name: 'Long eye', info: '+1 range', up: { max: 1 } },
    { id: 'nock', tier: 2, name: 'Quick nock', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'pierce', tier: 3, name: 'Bodkin points', info: 'Arrows ignore the cover of a forest', up: { pierce: 1 } },
  ],
  ember: [
    { id: 'ward', tier: 1, name: 'Warded robe', info: '+5 health', up: { hp: 5 } },
    { id: 'heat', tier: 1, name: 'White heat', info: '+3 power', up: { pow: 3 } },
    { id: 'lob', tier: 2, name: 'High lob', info: '+1 range', up: { max: 1 } },
    { id: 'kindle', tier: 2, name: 'Quick kindling', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'spare', tier: 3, name: 'Tamed flame', info: 'The burst passes over its own side', up: { spare: 1 } },
  ],
  mender: [
    { id: 'hale', tier: 1, name: 'Hale', info: '+5 health', up: { hp: 5 } },
    { id: 'balm', tier: 1, name: 'Strong balm', info: 'Heals 5 more', up: { pow: 5 } },
    { id: 'reachm', tier: 2, name: 'Far hand', info: '+1 range', up: { max: 1 } },
    { id: 'calm', tier: 2, name: 'Steady hands', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'cleanse', tier: 3, name: 'Unbinding', info: 'Healing also breaks a snare', up: { cleanse: 1 } },
  ],
  hexbinder: [
    { id: 'veil', tier: 1, name: 'Veil', info: '+5 health', up: { hp: 5 } },
    { id: 'guardh', tier: 1, name: 'Quick step', info: '+20 block', up: { block: 20 } },
    { id: 'knot', tier: 2, name: 'Tighter knot', info: 'The snare holds one turn longer', up: { snare: 1 } },
    { id: 'haste', tier: 2, name: 'Ready word', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'sting', tier: 3, name: 'Thorned snare', info: 'The snare also does 8 damage', up: { sting: 8 } },
  ],
  pike: [
    { id: 'gambeson', tier: 1, name: 'Gambeson', info: '+6 health', up: { hp: 6 } },
    { id: 'point', tier: 1, name: 'Bodkin head', info: '+3 power', up: { pow: 3 } },
    { id: 'long', tier: 2, name: 'Long pike', info: 'The pike reaches a third tile', up: { max: 1 } },
    { id: 'drill', tier: 2, name: 'Drilled', info: '+1 move', up: { move: 1 } },
    { id: 'set', tier: 3, name: 'Set to receive', info: 'His first strike at a charger does half again as much', up: { brace: 0.5 } },
  ],
  warden: [
    { id: 'oak', tier: 1, name: 'Oak boards', info: '+8 health', up: { hp: 8 } },
    { id: 'boss', tier: 1, name: 'Iron boss', info: '+10% armour', up: { armor: 10 } },
    { id: 'pace', tier: 2, name: 'Steady pace', info: '+1 move', up: { move: 1 } },
    { id: 'pavise', tier: 2, name: 'Pavise', info: 'The ally behind him takes a third, not half', up: { shelter: -0.17 } },
    { id: 'lock', tier: 3, name: 'Locked shields', info: 'Blocks blows from the side as well as from the front', up: { flank: 0.5 } },
  ],
  arbalest: [
    { id: 'brig', tier: 1, name: 'Brigandine', info: '+5 health', up: { hp: 5 } },
    { id: 'steel', tier: 1, name: 'Steel prod', info: '+4 power', up: { pow: 4 } },
    { id: 'sight', tier: 2, name: 'Notched sight', info: '+1 range', up: { max: 1 } },
    { id: 'legs', tier: 2, name: 'Light kit', info: '+1 move', up: { move: 1 } },
    { id: 'quarrel', tier: 3, name: 'Square quarrels', info: 'Bolts ignore the cover of a forest', up: { pierce: 1 } },
  ],
  assassin: [
    { id: 'lithe', tier: 1, name: 'Lithe', info: '+5 health', up: { hp: 5 } },
    { id: 'parry', tier: 1, name: 'Parrying blade', info: '+15 block', up: { block: 15 } },
    { id: 'dash', tier: 2, name: 'Dash', info: '+1 move', up: { move: 1 } },
    { id: 'mark', tier: 2, name: 'Marked for death', info: 'Kills outright from behind at half health or under', up: { execute: 0.1 } },
    { id: 'vanish', tier: 3, name: 'Vanish', info: 'Does not rest after a kill', up: { chain: 1 } },
  ],
  bard: [
    { id: 'cloak', tier: 1, name: 'Travelling cloak', info: '+6 health', up: { hp: 6 } },
    { id: 'nimble', tier: 1, name: 'Nimble', info: '+20 block', up: { block: 20 } },
    { id: 'road', tier: 2, name: 'Road legs', info: '+1 move', up: { move: 1 } },
    { id: 'carry', tier: 2, name: 'Carrying voice', info: 'His song reaches allies two tiles away', up: { aura: 1 } },
    { id: 'anthem', tier: 3, name: 'War song', info: 'Allies in earshot also hit 15% harder', up: { aPow: 0.15 } },
  ],
  alchemist: [
    { id: 'apron', tier: 1, name: 'Leather apron', info: '+5 health', up: { hp: 5 } },
    { id: 'brew', tier: 1, name: 'Stronger brew', info: '+3 power', up: { pow: 3 } },
    { id: 'sling', tier: 2, name: 'Sling arm', info: '+1 range', up: { max: 1 } },
    { id: 'stock', tier: 2, name: 'Ready stock', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'pitch', tier: 3, name: 'Burning pitch', info: 'The burning ground also slows: two move points to enter, and it halves block', up: { tar: 1 } },
  ],
  frost: [
    { id: 'furs', tier: 1, name: 'Furs', info: '+5 health', up: { hp: 5 } },
    { id: 'bite', tier: 1, name: 'Bitter cold', info: '+3 power', up: { pow: 3 } },
    { id: 'gale', tier: 2, name: 'Far gale', info: '+1 range', up: { max: 1 } },
    { id: 'breath', tier: 2, name: 'Quick breath', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'deep', tier: 3, name: 'Deep frost', info: 'The frost holds one turn longer', up: { chill: 1 } },
  ],
  necro: [
    { id: 'shroud', tier: 1, name: 'Shroud', info: '+5 health', up: { hp: 5 } },
    { id: 'wary', tier: 1, name: 'Wary', info: '+20 block', up: { block: 20 } },
    { id: 'call', tier: 2, name: 'Long call', info: '+1 range', up: { max: 1 } },
    { id: 'rite', tier: 2, name: 'Short rite', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'host', tier: 3, name: 'A greater host', info: 'Two more Skeletons at once', up: { cap: 2 } },
  ],
  summoner: [
    { id: 'charm', tier: 1, name: 'Charm', info: '+5 health', up: { hp: 5 } },
    { id: 'circle', tier: 1, name: 'Circle', info: '+20 block', up: { block: 20 } },
    { id: 'bond', tier: 2, name: 'Strong bond', info: 'The Wolf stays one turn longer', up: { life: 1 } },
    { id: 'whistle', tier: 2, name: 'Quick whistle', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'pair', tier: 3, name: 'A third wolf', info: 'One more Wolf at once', up: { cap: 1 } },
  ],
  storm: [
    { id: 'oilskin', tier: 1, name: 'Oilskin', info: '+5 health', up: { hp: 5 } },
    { id: 'charge', tier: 1, name: 'Charged air', info: '+3 power', up: { pow: 3 } },
    { id: 'reachs', tier: 2, name: 'Long arc', info: '+1 range', up: { max: 1 } },
    { id: 'gather', tier: 2, name: 'Quick gathering', info: 'Rests one turn less', up: { rec: -1 } },
    { id: 'fork', tier: 3, name: 'Forked lightning', info: 'The lightning leaps once more', up: { jumps: 1 } },
  ],
  wolf: [
    { id: 'pelt', tier: 1, name: 'Thick pelt', info: '+5 health', up: { hp: 5 } },
    { id: 'fang', tier: 1, name: 'Long fangs', info: '+2 power', up: { pow: 2 } },
    { id: 'lope', tier: 2, name: 'Lope', info: '+1 move', up: { move: 1 } },
    { id: 'dodge', tier: 2, name: 'Sidestep', info: '+15 block', up: { block: 15 } },
    { id: 'packs', tier: 3, name: 'Pack hunters', info: '+20% more for each other wolf beside the target', up: { pack: 0.2 } },
  ],
  ogre: [
    { id: 'bulk', tier: 1, name: 'Bulk', info: '+10 health', up: { hp: 10 } },
    { id: 'club', tier: 1, name: 'Studded club', info: '+3 power', up: { pow: 3 } },
    { id: 'knit', tier: 2, name: 'Knitting flesh', info: 'Heals 2 more each turn', up: { regen: 2 } },
    { id: 'hidet', tier: 2, name: 'Warty hide', info: '+10% armour', up: { armor: 10 } },
    { id: 'lumber', tier: 3, name: 'Long legs', info: '+1 move', up: { move: 1 } },
  ],
  skeleton: [
    { id: 'wired', tier: 1, name: 'Wired bones', info: '+4 health', up: { hp: 4 } },
    { id: 'rust', tier: 1, name: 'Rusty edge', info: '+2 power', up: { pow: 2 } },
    { id: 'buckler', tier: 2, name: 'Buckler', info: '+20 block', up: { block: 20 } },
    { id: 'rattle', tier: 2, name: 'Rattling run', info: '+1 move', up: { move: 1 } },
    { id: 'bound', tier: 3, name: 'Iron bound', info: '+20% armour', up: { armor: 20 } },
  ],
  ghost: [
    { id: 'linger', tier: 1, name: 'Lingering', info: '+4 health', up: { hp: 4 } },
    { id: 'chillt', tier: 1, name: 'Grave chill', info: '+3 power', up: { pow: 3 } },
    { id: 'drift', tier: 2, name: 'Drift', info: '+1 move', up: { move: 1 } },
    { id: 'flicker', tier: 2, name: 'Flicker', info: '+25 block', up: { block: 25 } },
    { id: 'drain', tier: 3, name: 'Draining touch', info: 'Takes back half the damage it deals as health', up: { leech: 0.5 } },
  ],
  whelp: [
    { id: 'scales', tier: 1, name: 'Hard scales', info: '+8 health', up: { hp: 8 } },
    { id: 'furnace', tier: 1, name: 'Hot belly', info: '+3 power', up: { pow: 3 } },
    { id: 'wing', tier: 2, name: 'Strong wings', info: '+1 move', up: { move: 1 } },
    { id: 'plates', tier: 2, name: 'Belly plates', info: '+10% armour', up: { armor: 10 } },
    { id: 'lungs', tier: 3, name: 'Deep lungs', info: 'Rests one turn less', up: { rec: -1 } },
  ],
  golem: [
    { id: 'mass', tier: 1, name: 'More stone', info: '+10 health', up: { hp: 10 } },
    { id: 'fists', tier: 1, name: 'Flint fists', info: '+3 power', up: { pow: 3 } },
    { id: 'granite', tier: 2, name: 'Granite', info: '+10% armour', up: { armor: 10 } },
    { id: 'forearm', tier: 2, name: 'Raised forearm', info: '+20 block', up: { block: 20 } },
    { id: 'stir', tier: 3, name: 'Stirred to life', info: '+1 move', up: { move: 1 } },
  ],
  captain: [
    { id: 'harness', tier: 1, name: 'Fine harness', info: '+8 health', up: { hp: 8 } },
    { id: 'blade', tier: 1, name: 'Named blade', info: '+3 power', up: { pow: 3 } },
    { id: 'voice', tier: 2, name: 'Parade voice', info: 'Leads allies three tiles away', up: { aura: 1 } },
    { id: 'hold', tier: 2, name: 'Hold the line', info: 'Allies near block 10 better still', up: { aBlock: 10 } },
    { id: 'glory', tier: 3, name: 'For the banner', info: 'Allies near hit 10% harder still', up: { aPow: 0.1 } },
  ],
};
// The upgrades a type may hold: ones its tree has, no more than its level, none above its level's tier, a higher tier only on top of a lower one.
export function tidyUps(ups, xp) {
  const out = {};
  for (const type of Object.keys(UPGRADES)) {
    const lvl = levelOf(xp && xp[type]), got = [];
    for (const id of Array.isArray(ups && ups[type]) ? ups[type] : []) {
      const u = UPGRADES[type].find(q => q.id === id);
      if (!u || got.includes(id) || got.length >= lvl || u.tier > lvl) continue;
      if (u.tier > 1 && !got.some(g => UPGRADES[type].find(q => q.id === g).tier === u.tier - 1)) continue;
      got.push(id);
    }
    if (got.length) out[type] = got;
  }
  return out;
}
// The numbers a side's upgrades add, type by type: { type: { stat: amount } }.
export function upsOf(ups) {
  const out = {};
  for (const [type, ids] of Object.entries(ups || {})) { const o = {}; for (const id of ids) { const u = (UPGRADES[type] || []).find(q => q.id === id); if (u) for (const k in u.up) o[k] = (o[k] || 0) + u.up[k]; } if (Object.keys(o).length) out[type] = o; }
  return out;
}
// What a side's unit types earned in a finished match: for being fielded, for a win, for each kill.
export function earned(s, owner) {
  const out = {};
  if (s.winner === null || !s.fielded) return out;
  for (const type of s.fielded[owner] || []) out[type] = 10 + (s.winner === owner ? 10 : 0) + 4 * ((s.tally && s.tally[owner][type]) || 0);
  return out;
}

// A unit's numbers: its type's, changed by whatever it carries (u.up: { stat: amount }); every rule reads them here.
export function stats(u) {
  const t = TYPES[u.type];
  if (!u.up) return t;
  const o = { ...t };
  for (const k in u.up) o[k] = Math.max(0, (typeof t[k] === 'number' ? t[k] : k === 'flank' ? 0.5 : 0) + u.up[k]);
  o.armor = Math.min(80, o.armor); o.block = Math.min(95, o.block);
  return o;
}
export const stat = (u, k) => stats(u)[k];
// The share of an attack of that school this unit takes (0: it is immune).
export const takes = (u, school) => { const k = stats(u).takes; return k && k[school] !== undefined ? k[school] : 1; };
// What the allies in earshot lend a unit (their aura): the best of each, never its own, nothing from a snared one.
export function lent(s, u) {
  const o = { move: 0, quick: 0, pow: 0, block: 0 };
  for (const v of s.units) {
    if (v.owner !== u.owner || v.id === u.id || v.snare > 0) continue;
    const t = stats(v); if (!t.aura || Math.abs(u.x - v.x) + Math.abs(u.y - v.y) > t.aura) continue;
    o.move = Math.max(o.move, t.aMove || 0); o.quick = Math.max(o.quick, t.aQuick || 0); o.pow = Math.max(o.pow, t.aPow || 0); o.block = Math.max(o.block, t.aBlock || 0);
  }
  return o;
}
// A unit's numbers as it stands on the board: its own, and what its allies lend it.
export function eff(s, u) {
  const t = stats(u), l = lent(s, u);
  if (!l.move && !l.pow && !l.block) return t;
  return { ...t, move: t.move + l.move, pow: t.pow * (1 + l.pow), block: Math.min(95, t.block + l.block) };
}
const piece = (id, type, owner, x, y, up) => { const u = { id, type, owner, x, y, facing: owner === 0 ? 'N' : 'S', hp: TYPES[type].hp, rec: 0, snare: 0 }; if (up) { u.up = up; u.hp = stats(u).hp; } return u; };
// The standing line-up (it costs exactly the budget). It is written for the board; on a wider or deeper map it keeps its place in the middle of the last rows.
export function defaultTeam(map, owner) {
  const m = mapOf(map), ox = Math.floor((m.cols - COLS) / 2), oy = m.rows - ROWS;
  return LAYOUT.map(([type, lx, ly]) => ({ type, x: owner === 0 ? lx + ox : m.cols - 1 - lx - ox, y: owner === 0 ? ly + oy : m.rows - 1 - ly - oy }));
}
// A match starts in play with the standing line-ups; with setup, each side first picks and places its own (setTeam), then begin().
export function newGame(map = 'board', { setup = false, budget = BUDGET } = {}) {
  if (!MAPS[map]) map = 'board';
  const m = MAPS[map], units = [];
  for (const owner of [0, 1]) defaultTeam(map, owner).forEach((u, i) => units.push(piece(owner * 100 + i + 1, u.type, owner, u.x, u.y)));
  return { map, cols: m.cols, rows: m.rows, phase: setup ? 'setup' : 'play', budget, units, turn: 0, turnNo: 1, active: null, passes: 0, winner: null };
}

export const inBounds = (s, x, y) => x >= 0 && y >= 0 && x < s.cols && y < s.rows;
// The ground at a tile: the map's, changed by whatever was poured or lit on it for a while (s.pools: [{ x, y, k, n turns left }], maps.js POOLS).
export const poolAt = (s, x, y) => (s.pools && s.pools.find(p => p.x === x && p.y === y)) || null;
export const ground = (s, x, y) => { const g = groundAt(mapOf(s.map), x, y), p = s.pools && s.pools.length ? poolAt(s, x, y) : null; return p ? { ...g, ...POOLS[p.k] } : g; };
export const high = (s, x, y) => highAt(mapOf(s.map), x, y);
// A side sets out on its own rows: the last ones for player 0, the first for player 1.
export const inZone = (s, owner, y) => (owner === 0 ? y >= s.rows - mapOf(s.map).zone : y < mapOf(s.map).zone);
export const teamCost = team => team.reduce((n, m) => n + (TYPES[m.type] ? TYPES[m.type].cost : 0), 0);
// What is wrong with a team [{type, x, y}] for this side on this map, or null when it may be fielded.
export function checkTeam(s, owner, team) {
  if (!Array.isArray(team) || team.length < 1 || team.length > TEAM_MAX) return `A team is 1 to ${TEAM_MAX} units`;
  const count = {}, seen = new Set();
  for (const m of team) {
    const t = m && typeof m.type === 'string' && Object.hasOwn(TYPES, m.type) ? TYPES[m.type] : null;
    if (!t) return 'Unknown unit';
    if (!Number.isInteger(m.x) || !Number.isInteger(m.y) || !inBounds(s, m.x, m.y) || !inZone(s, owner, m.y)) return 'Units go on your own rows';
    if (ground(s, m.x, m.y).solid) return 'Nothing can stand there';
    if (seen.has(m.x + ',' + m.y)) return 'Two units on one tile';
    seen.add(m.x + ',' + m.y);
    count[m.type] = (count[m.type] || 0) + 1;
    if (count[m.type] > t.limit) return `At most ${t.limit} of the ${t.name}`;
  }
  if (teamCost(team) > (s.budget ?? BUDGET)) return `Over the budget of ${s.budget ?? BUDGET} points`;
  return null;
}
// Before the match starts: replace this side's units with a checked team. Returns the error, or null.
// `ups` is what that side's upgrades add, by type (upsOf), or nothing in a fair match.
export function setTeam(s, owner, team, ups) {
  if (s.phase !== 'setup') return 'The match has started';
  const e = checkTeam(s, owner, team);
  if (e) return e;
  s.units = s.units.filter(u => u.owner !== owner);
  team.forEach((m, i) => s.units.push(piece(owner * 100 + i + 1, m.type, owner, m.x, m.y, ups && ups[m.type])));
  return null;
}
// A side set out as written, unchecked: the computer's force in a battle of the campaign.
export function placeTeam(s, owner, team) {
  s.units = s.units.filter(u => u.owner !== owner);
  team.forEach((m, i) => s.units.push(piece(owner * 100 + i + 1, m.type, owner, m.x, m.y)));
}
export function begin(s) {
  s.phase = 'play';
  s.fielded = [0, 1].map(o => [...new Set(s.units.filter(u => u.owner === o).map(u => u.type))]);
  s.tally = [{}, {}];
}

// Move points to step from one tile onto the next one, or Infinity where the ground forbids it.
export function stepCost(s, fx, fy, x, y) {
  const g = ground(s, x, y), up = high(s, x, y) - high(s, fx, fy);
  if (g.solid || up > 1) return Infinity;
  return (g.cost || 1) + (up > 0 ? CLIMB : 0);
}
// How far a unit that works at range reaches at this tile: one further at ground below it.
export const reach = (s, u, x, y) => { const t = stats(u); return t.max + (t.kind !== 'melee' && t.kind !== 'line' && high(s, u.x, u.y) > high(s, x, y) ? REACH : 0); };
export const unitAt = (s, x, y) => s.units.find(u => u.x === x && u.y === y) || null;
export const unitById = (s, id) => s.units.find(u => u.id === id) || null;
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Can this player pick this unit to move/act right now?
export function canUse(s, player, u) {
  if (!u || s.winner !== null || s.turn !== player || u.owner !== player) return false;
  if (u.rec > 0 || u.snare > 0) return false;
  return !s.active || s.active.id === u.id;
}

// Every tile the unit can end on, the cheapest way there within its move points (ground and climbs cost more).
// A piece that leaps may pass that many pieces on the way, one that hops or flies any number; a flyer crosses any ground at one point a tile. None ends on a piece or on ground nothing stands on.
export function reachable(s, u) {
  if (u.frozen > 0) return [];
  const t = eff(s, u), move = t.move, hops = t.fly || t.hop ? 99 : t.leap || 0, out = [], seen = new Set(), best = new Map([[u.x + ',' + u.y + ',0', 0]]);
  let frontier = [{ x: u.x, y: u.y, h: 0, c: 0 }];
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      if (best.get(p.x + ',' + p.y + ',' + p.h) !== p.c) continue;
      for (const [dx, dy] of Object.values(DIRS)) {
        const x = p.x + dx, y = p.y + dy;
        if (!inBounds(s, x, y)) continue;
        const v = unitAt(s, x, y), h = p.h + (v ? 1 : 0);
        if (v && (v.id === u.id || h > hops)) continue;
        const c = p.c + (t.fly ? 1 : stepCost(s, p.x, p.y, x, y)), k = x + ',' + y + ',' + h;
        if (c > move || (best.has(k) && best.get(k) <= c)) continue;
        best.set(k, c); next.push({ x, y, h, c });
        if (!v && !ground(s, x, y).solid && !seen.has(x + ',' + y)) { seen.add(x + ',' + y); out.push({ x, y }); }
      }
    }
    frontier = next;
  }
  return out;
}

// The tiles a breath of fire covers from a unit looking that way: the tile ahead and the three beyond it.
export const coneTiles = (u, dx, dy) => [[dx, dy], [2 * dx, 2 * dy], [2 * dx + dy, 2 * dy + dx], [2 * dx - dy, 2 * dy - dx]].map(([a, b]) => ({ x: u.x + a, y: u.y + b }));
// Tiles this unit may target from where it stands. A target tile holds a unit, except: its own tile to reload, the tile ahead for a cone, any ground in reach for a flask, an empty tile for a summons.
export function targets(s, u) {
  const t = stats(u), sc = schoolOf(t);
  const out = [];
  if (t.kind === 'none') return out;
  if (t.reload && u.empty) return [{ x: u.x, y: u.y }];
  if (t.kind === 'line') {
    for (const [dx, dy] of Object.values(DIRS)) {
      for (let i = 1; i <= t.max; i++) {
        const x = u.x + dx * i, y = u.y + dy * i;
        if (!inBounds(s, x, y) || ground(s, x, y).wall) break;
        const v = unitAt(s, x, y);
        if (v && v.owner !== u.owner) { out.push({ x: v.x, y: v.y }); break; }
      }
    }
    return out;
  }
  if (t.kind === 'cone') {
    for (const [dx, dy] of Object.values(DIRS)) {
      if (!inBounds(s, u.x + dx, u.y + dy)) continue;
      if (coneTiles(u, dx, dy).some(p => { const v = unitAt(s, p.x, p.y); return v && v.owner !== u.owner && takes(v, sc) > 0; })) out.push({ x: u.x + dx, y: u.y + dy });
    }
    return out;
  }
  if (t.kind === 'flask' || t.kind === 'summon') {
    if (t.kind === 'summon' && s.units.filter(v => v.owner === u.owner && v.sum === u.type).length >= t.cap) return out;
    for (let y = 0; y < s.rows; y++) for (let x = 0; x < s.cols; x++) {
      const d = Math.abs(x - u.x) + Math.abs(y - u.y);
      if (d < t.min || d > reach(s, u, x, y) || ground(s, x, y).solid) continue;
      if (t.kind === 'summon' && (unitAt(s, x, y) || (t.grave && !(s.graves || []).some(g => g.x === x && g.y === y)))) continue;
      out.push({ x, y });
    }
    return out;
  }
  for (const v of s.units) {
    if (v.id === u.id) continue;
    const d = dist(u, v);
    if (d < t.min || d > reach(s, u, v.x, v.y)) continue;
    const enemy = v.owner !== u.owner;
    if (t.kind === 'heal') { if (!enemy && (v.hp < stats(v).hp || (t.cleanse && v.snare > 0))) out.push({ x: v.x, y: v.y }); }
    else if (t.kind === 'blast') out.push({ x: v.x, y: v.y });
    else if (enemy && takes(v, sc) > 0) out.push({ x: v.x, y: v.y });
  }
  return out;
}

// Which side of the target is the attack coming from?
export function sideOf(target, fromX, fromY) {
  const [fx, fy] = DIRS[target.facing];
  const vx = fromX - target.x, vy = fromY - target.y;
  const dot = vx * fx + vy * fy, cross = Math.abs(vx * fy - vy * fx);
  if (dot > 0 && dot >= cross) return 'front';
  if (dot < 0 && -dot >= cross) return 'back';
  return 'side';
}

// What a strike that lands does: power (and what allies lend), the rogue's backstab, the pack, the forest's cover against arrows, a shield-bearer in the way of a shot or a spell,
// the share the target takes of that school (nothing: 0), then armour; from behind, an executioner finishes a target that is low enough.
export function damage(s, attacker, target, scale = 1) {
  const at = eff(s, attacker), tt = stats(target), side = sideOf(target, attacker.x, attacker.y), sc = schoolOf(at), take = takes(target, sc);
  if (take === 0) return 0;
  let pow = at.pow * scale;
  if (at.backstab && side === 'back') pow *= at.backstab;
  if (at.pack) pow *= 1 + at.pack * s.units.filter(v => v.owner === attacker.owner && v.id !== attacker.id && stats(v).pack && dist(v, target) === 1).length;
  if (at.kind === 'ranged' && !at.pierce) pow *= ground(s, target.x, target.y).cover ?? 1;
  if (sc !== 'blade') {
    const dx = attacker.x - target.x, dy = attacker.y - target.y, sx = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0, sy = sx ? 0 : Math.sign(dy), w = unitAt(s, target.x + sx, target.y + sy);
    if (w && w.owner === target.owner && w.id !== attacker.id && w.id !== target.id && !(w.snare > 0) && stats(w).shelter) pow *= stats(w).shelter;
  }
  const dmg = Math.max(1, Math.round(pow * take * (100 - tt.armor) / 100));
  return at.execute && side === 'back' && target.hp <= tt.hp * at.execute ? Math.max(dmg, target.hp) : dmg;
}

// A piece leaves the board for good: where it fell is remembered (unless it was summoned), and a leader's fall costs its side a turn.
function fell(s, target, events) {
  s.units = s.units.filter(u => u.id !== target.id);
  events.push({ t: 'die', id: target.id });
  if (!target.sum) s.graves = [...(s.graves || []).filter(g => g.x !== target.x || g.y !== target.y), { x: target.x, y: target.y }].slice(-GRAVES);
  const lost = stats(target).fall;
  if (lost) { s.skip = s.skip || [0, 0]; s.skip[target.owner] = lost; events.push({ t: 'rout', owner: target.owner }); }
}
// Damage done: the wound, the kill (counted for the attacker's type), and what a leeching attacker takes back. Fire on the ground has no attacker.
function harm(s, attacker, target, dmg, side, events) {
  target.hp -= dmg; s.quiet = 0;
  events.push({ t: 'hit', id: target.id, dmg, side });
  const leech = attacker && stats(attacker).leech;
  if (leech && attacker.id !== target.id && attacker.owner !== target.owner && attacker.hp > 0) {
    const amt = Math.min(Math.round(dmg * leech), stats(attacker).hp - attacker.hp);
    if (amt > 0) { attacker.hp += amt; events.push({ t: 'heal', id: attacker.id, amt }); }
  }
  if (target.hp <= 0) {
    fell(s, target, events);
    if (attacker && attacker.owner !== target.owner) { if (s.tally) s.tally[attacker.owner][attacker.type] = (s.tally[attacker.owner][attacker.type] || 0) + 1; if (s.active && s.active.id === attacker.id) s.active.killed = true; }
  }
}

// One strike. Returns whether it wounded. A target that takes nothing of that school is untouched; a blow that shoves knocks a standing target back a tile if the tile behind is free.
function strike(s, attacker, target, blockable, rand, events, scale = 1) {
  const tt = eff(s, target);
  const side = sideOf(target, attacker.x, attacker.y);
  const dmg = damage(s, attacker, target, scale);
  if (dmg === 0) { events.push({ t: 'immune', id: target.id }); return false; }
  if (blockable && !(target.snare > 0)) {
    const chance = (side === 'front' ? tt.block : side === 'side' ? tt.block * Math.min(1, tt.flank ?? 0.5) : 0) * (ground(s, target.x, target.y).slip ?? 1);
    if (rand() * 100 < chance) { events.push({ t: 'block', id: target.id }); return false; }
  }
  harm(s, attacker, target, dmg, side, events);
  if (stats(attacker).shove && target.hp > 0) {
    const dx = target.x - attacker.x, dy = target.y - attacker.y, sx = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0, sy = sx ? 0 : Math.sign(dy), x = target.x + sx, y = target.y + sy;
    if (inBounds(s, x, y) && !unitAt(s, x, y) && stepCost(s, target.x, target.y, x, y) < Infinity) { target.x = x; target.y = y; events.push({ t: 'push', id: target.id, x, y }); }
  }
  return true;
}

function checkWinner(s, events) {
  const alive = [0, 1].map(p => s.units.some(u => u.owner === p));
  if (alive[0] && alive[1]) return;
  s.winner = alive[0] ? 0 : alive[1] ? 1 : -1;
  events.push({ t: 'over', winner: s.winner });
}

// The turn passes. For the side whose turn ends: rest and holds run down (a turn faster in a bard's earshot), the ogre mends, burning ground burns whoever stands on it, a summoned piece's time runs out.
function endTurn(s, events, skipped) {
  const p = s.turn;
  for (const u of [...s.units]) {
    if (u.owner !== p) continue;
    if (u.rec > 0) u.rec--;
    if (u.rec > 0 && lent(s, u).quick) u.rec--;
    if (u.snare > 0) u.snare--;
    if (u.frozen > 0) u.frozen--;
    const t = stats(u), burn = ground(s, u.x, u.y).burn;
    if (t.regen && u.hp < t.hp) { const amt = Math.min(t.regen, t.hp - u.hp); u.hp += amt; events.push({ t: 'heal', id: u.id, amt }); }
    if (burn && takes(u, 'spell') > 0) harm(s, null, u, Math.max(1, Math.round(burn * takes(u, 'spell'))), 'burn', events);
    if (u.hp > 0 && u.life > 0 && --u.life === 0) { s.units = s.units.filter(q => q.id !== u.id); events.push({ t: 'fade', id: u.id }); }
  }
  if (s.pools) s.pools = s.pools.filter(q => --q.n > 0);
  if (s.active) {
    const u = unitById(s, s.active.id);
    if (u) {
      const t = stats(u), rec = t.rec;
      u.rec = s.active.acted ? (s.active.free || (t.chain && s.active.killed) ? 0 : rec) : s.active.moved ? Math.floor(rec / 2) : 0;
    }
    s.passes = 0;
  } else if (!skipped) {
    s.passes++;
  }
  s.active = null;
  s.quiet = (s.quiet || 0) + 1;
  if (s.winner === null) checkWinner(s, events);
  if (s.winner !== null) return;
  if (s.quiet >= QUIET) { s.winner = -1; events.push({ t: 'over', winner: -1 }); return; }
  if (s.winner === null && s.passes >= MAX_PASSES) {
    s.winner = -1;
    events.push({ t: 'over', winner: -1 });
    return;
  }
  s.turn = 1 - p;
  s.turnNo++;
  events.push({ t: 'turn', player: s.turn });
  if (s.skip && s.skip[s.turn] > 0) { s.skip[s.turn]--; events.push({ t: 'skip', player: s.turn }); endTurn(s, events, true); }   // a side that lost its leader stands leaderless for a turn
}

// Apply one action for `player`. Mutates `s`. Returns { ok, events } or { ok:false, error }.
// Actions: {type:'move',unit,x,y} {type:'act',unit,x,y} {type:'end',unit?,facing?} {type:'surrender'}
export function apply(s, player, a, rand = Math.random) {
  const fail = error => ({ ok: false, error });
  const events = [];
  if (!a || typeof a !== 'object') return fail('bad action');
  if (s.winner !== null) return fail('game is over');
  if (s.phase === 'setup') return fail('the match has not started');
  if (a.type === 'surrender') {
    if (player !== 0 && player !== 1) return fail('not a player');
    s.winner = 1 - player;
    events.push({ t: 'over', winner: s.winner, surrender: true });
    return { ok: true, events };
  }
  if (s.turn !== player) return fail('not your turn');

  if (a.type === 'end') {
    if (a.facing !== undefined && !DIRS[a.facing]) return fail('bad facing');
    if (a.facing) {
      const u = s.active ? unitById(s, s.active.id) : unitById(s, a.unit);
      // The acting unit may be dead (caught in its own blast); otherwise it must be usable.
      if (u) {
        if (!s.active && !canUse(s, player, u)) return fail('unit cannot turn');
        if (u.frozen > 0 && a.facing !== u.facing) return fail('frozen: it cannot turn');
        u.facing = a.facing;
        events.push({ t: 'face', id: u.id, facing: a.facing });
      }
    }
    endTurn(s, events);
    return { ok: true, events };
  }

  const u = unitById(s, a.unit);
  if (!canUse(s, player, u)) return fail('unit not available');
  const hasTile = list => list.some(p => p.x === a.x && p.y === a.y);

  if (a.type === 'move') {
    if (s.active && s.active.moved) return fail('already moved');
    if (!hasTile(reachable(s, u))) return fail('cannot move there');
    const dx = a.x - u.x, dy = a.y - u.y;
    u.x = a.x; u.y = a.y;
    u.facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
    s.active = { id: u.id, moved: true, acted: s.active ? s.active.acted : false };
    events.push({ t: 'move', id: u.id, x: a.x, y: a.y });
    return { ok: true, events };
  }

  if (a.type === 'act') {
    if (s.active && s.active.acted) return fail('already acted');
    if (!hasTile(targets(s, u))) return fail('invalid target');
    const t = stats(u), moved = !!(s.active && s.active.moved);
    const dx = a.x - u.x, dy = a.y - u.y;
    if (t.reload && u.empty) {   // an act spent reloading: no rest after it
      u.empty = 0; s.active = { id: u.id, moved, acted: true, free: true };
      events.push({ t: 'act', id: u.id, kind: 'reload', x: a.x, y: a.y });
      return { ok: true, events };
    }
    if (!(u.frozen > 0)) u.facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
    s.active = { id: u.id, moved, acted: true, killed: false };
    events.push({ t: 'act', id: u.id, kind: t.kind, x: a.x, y: a.y });
    if (t.reload) u.empty = 1;
    const target = unitAt(s, a.x, a.y);
    // a braced piece strikes first at whoever walked up to strike it with a blade, unless from behind; true if the attacker still stands
    const braced = v => {
      const b = v && stats(v).brace;
      if (!b || !moved || v.owner === u.owner || dist(u, v) !== 1 || v.snare > 0 || schoolOf(t) !== 'blade' || sideOf(v, u.x, u.y) === 'back') return true;
      events.push({ t: 'brace', id: v.id }); strike(s, v, u, true, rand, events, b);
      return u.hp > 0;
    };
    if (t.kind === 'melee' || t.kind === 'ranged') {
      if (braced(target)) strike(s, u, target, true, rand, events);
    } else if (t.kind === 'bolt') {
      if (strike(s, u, target, false, rand, events) && target.hp > 0 && t.chill) { target.frozen = t.chill; events.push({ t: 'frozen', id: target.id }); }
    } else if (t.kind === 'chain') {
      const hit = new Set([u.id]); let v = target, k = 1;
      for (let i = 0; v && i <= t.jumps; i++, k *= 0.7) {
        const from = { x: v.x, y: v.y }; hit.add(v.id); strike(s, u, v, false, rand, events, k); v = null;
        for (const [ax, ay] of Object.values(DIRS)) { const q = unitAt(s, from.x + ax, from.y + ay); if (q && !hit.has(q.id)) { v = q; break; } }
        if (v && i < t.jumps) events.push({ t: 'arc', id: v.id, fx: from.x, fy: from.y });
      }
    } else if (t.kind === 'cone') {
      for (const p of coneTiles(u, Math.sign(dx), Math.sign(dy))) { const v = unitAt(s, p.x, p.y); if (v && v.id !== u.id) strike(s, u, v, false, rand, events); }
    } else if (t.kind === 'flask') {
      if (target) strike(s, u, target, false, rand, events);
      const k = t.tar ? 'pitch' : 'fire';
      s.pools = [...(s.pools || []).filter(q => q.x !== a.x || q.y !== a.y), { x: a.x, y: a.y, k, n: t.lasts }];
      events.push({ t: 'pool', x: a.x, y: a.y, k });
    } else if (t.kind === 'summon') {
      s.seq = (s.seq || 0) + 1;
      const m = piece(1000 + s.seq, t.summon, u.owner, a.x, a.y);
      m.facing = u.facing; m.sum = u.type; m.rec = 1; if (t.life) m.life = t.life + 1;
      if (t.grave) s.graves = s.graves.filter(g => g.x !== a.x || g.y !== a.y);
      s.units.push(m); events.push({ t: 'summon', id: m.id, type: m.type, x: a.x, y: a.y });
    } else if (t.kind === 'line') {
      const sx = Math.sign(dx), sy = Math.sign(dy);
      for (let i = 1; u.hp > 0 && i <= t.max; i++) {
        if (i === 1 && !braced(unitAt(s, u.x + sx, u.y + sy))) break;
        const x = u.x + sx * i, y = u.y + sy * i;
        if (!inBounds(s, x, y) || ground(s, x, y).wall) break;
        const v = unitAt(s, x, y);
        if (v) strike(s, u, v, true, rand, events);
      }
    } else if (t.kind === 'blast') {
      const area = [[0, 0], ...Object.values(DIRS)];
      for (const [ax, ay] of area) {
        const v = unitAt(s, a.x + ax, a.y + ay);
        if (v && !(t.spare && v.owner === u.owner)) strike(s, u, v, false, rand, events);
      }
    } else if (t.kind === 'heal') {
      const amt = Math.min(t.pow, stats(target).hp - target.hp);
      target.hp += amt;
      if (amt > 0 || !t.cleanse) events.push({ t: 'heal', id: target.id, amt });
      if (t.cleanse && target.snare > 0) { target.snare = 0; events.push({ t: 'free', id: target.id }); }
    } else if (t.kind === 'snare') {
      target.snare = t.snare;
      events.push({ t: 'snare', id: target.id });
      if (t.sting) harm(s, u, target, Math.max(1, Math.round(t.sting * (100 - stats(target).armor) / 100)), sideOf(target, u.x, u.y), events);
    }
    checkWinner(s, events);
    return { ok: true, events };
  }
  return fail('unknown action');
}
