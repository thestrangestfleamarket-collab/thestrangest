// SKIRMISH TABLE's sounds by who makes them: each type's footfall by its body (boot, paw, stone, bone, none), its weapon's sound, its voice when it strikes, is struck and falls. Every one is a recording (docs/chess-sounds.md), played at the piece.
// a cue: [file ('x*' any of its takes), how loud, how fast it is played, seconds later]
const BLADE = [['swing*', 0.8]], CAST = [['woosh*', 0.4, 1.3]];
const WHO = {
  bulwark: { strike: BLADE }, captain: { strike: BLADE }, strider: { strike: [['swing*', 0.6, 1.3]] }, assassin: { strike: [['swing*', 0.6, 1.3], ['swing*', 0.5, 1.4, 0.12]] },
  lancer: { strike: [['woosh*', 0.7, 0.75], ['chop', 0.8, 1, 0.12]] }, pike: { strike: [['woosh*', 0.6, 1.2], ['swing*', 0.5, 0.9, 0.05]] }, warden: { strike: [['woosh*', 0.6, 0.8], ['mace*', 0.5, 1, 0.14]], ability: [['block*', 0.7, 0.8], ['clash', 0.4]] },
  slinger: { strike: [['bow', 0.8, 1.4], ['woosh*', 0.3, 1.5, 0.05]] }, arbalest: { strike: [['xbow', 0.8], ['latch', 0.5]], reload: [['creak', 0.7], ['latch', 0.6, 0.9, 0.35]] },
  ember: { strike: [['flare', 0.7]] }, frost: { strike: [['woosh*', 0.5, 1.4], ['glass1', 0.25, 1.6, 0.05]] }, storm: { strike: [['zap', 0.6], ['thunder', 0.45, 1, 0.1]] }, hexbinder: { strike: [['snare*', 0.6]] }, mender: { strike: [['heal*', 0.8]] },
  bard: { strike: [['lute0', 0.7], ['lute1', 0.7, 1, 0.14], ['lute0', 0.6, 1.5, 0.28]] }, alchemist: { strike: [['woosh*', 0.5, 0.9], ['cloth*', 0.3]] },
  necro: { strike: [['shimmer', 0.6, 0.8], ['bone*', 0.5, 1, 0.3], ['bone*', 0.5, 0.9, 0.42], ['bone*', 0.4, 1.1, 0.5]] }, summoner: { strike: [['shimmer', 0.6], ['howl', 0.5, 1, 0.3]] },
  wolf: { step: 'paw', strike: [['growl', 0.8]], hurt: [['whine', 0.6]], fall: [['whine', 0.7, 0.8], ['fall*', 0.5, 1.2, 0.3]] },
  whelp: { step: 'paw', pitch: 0.8, strike: [['roar', 0.75], ['flare', 0.5, 1, 0.25]], hurt: [['screech', 0.5]], fall: [['screech', 0.6, 0.8], ['fall*', 0.6, 1, 0.5]] },
  ogre: { step: 'heavy', strike: [['grunt', 0.7], ['woosh*', 0.7, 0.6, 0.1]], hurt: [['grunt', 0.45, 1.25]], fall: [['groan', 0.8], ['bodyfall', 0.8, 0.8, 0.5]] },
  golem: { step: 'stone', strike: [['drag', 0.5, 1.2], ['woosh*', 0.6, 0.5, 0.15], ['slam*', 0.8, 1, 0.3]], hurt: [['rock*', 0.8]], fall: [['rockfall', 0.9], ['stone*', 0.6, 0.8, 0.5]] },
  skeleton: { step: 'bone', strike: [['bone*', 0.5], ['swing*', 0.7, 1, 0.05], ['scrape', 0.3, 1, 0.1]], hurt: [['bone*', 0.8], ['bone*', 0.6, 1.2, 0.07]], fall: [['bone*', 0.8], ['bone*', 0.8, 0.8, 0.12], ['bone*', 0.7, 1.2, 0.22], ['bone*', 0.6, 0.9, 0.36], ['drop', 0.4, 1, 0.3]] },
  ghost: { step: 'none', strike: [['wail', 0.6], ['cloth*', 0.4, 0.8]], hurt: [['moan', 0.5, 1.2]], fall: [['wail', 0.6, 0.75], ['moan', 0.4, 0.8, 0.4]] },
};
// a body's footfall: [file, how loud, how fast it is played]
const STEP = { boot: ['step*', 1, 1], paw: ['paw*', 0.8, 1], heavy: ['step*', 1.3, 0.62], stone: ['stone*', 0.7, 0.7], bone: ['bone*', 0.6, 1.5] };
const cues = (sound, list, pos, at = 0) => { for (const [name, vol = 1, rate = 1, delay = 0] of list || []) sound.play(name, { pos, vol, rate, delay: at + delay }); };

// A walk of so many seconds: its footfalls at its gait; a ghost has none, only its robe; the golem drags.
export function stepSound(sound, type, pos, seconds, ground = [1, 0.5]) {
  const w = WHO[type] || {}, kind = w.step || 'boot';
  if (kind === 'none') { sound.play('cloth*', { pos, vol: 0.35, rate: 0.7 }); sound.play('moan', { pos, vol: 0.22, delay: 0.1 }); return 0; }
  const [file, vol, rate] = STEP[kind], n = Math.max(2, Math.min(9, Math.round(seconds * (kind === 'paw' ? 4.5 : kind === 'stone' || kind === 'heavy' ? 1.7 : 2.4))));
  for (let i = 0; i < n; i++) sound.play(file, { pos, vol: vol * ground[1] * (kind === 'boot' ? 1 : 1.2), rate: rate * (w.pitch || 1) * (kind === 'boot' ? ground[0] : 1), delay: (i + 0.3) * seconds / n });
  if (kind === 'stone') sound.play('drag', { pos, vol: 0.3 });
  return n;
}
// A piece acts: its weapon and its voice, when the blow or the cast goes out.
export function strikeSound(sound, type, kind, pos) { const w = WHO[type] || {}; cues(sound, kind === 'reload' ? w.reload || [['creak', 0.6], ['latch', 0.5, 1, 0.3]] : w.strike || (kind === 'melee' || kind === 'line' ? BLADE : CAST), pos); }
export function abilitySound(sound, type, pos) { cues(sound, (WHO[type] || {}).ability || [['block*', 0.6, 0.8]], pos); }
// What a blow, a bolt or a spell sounds like where it lands (by its kind), then the struck one's own voice.
const LAND = { ranged: [['arrow', 0.8]], bolt: [['ice', 0.7], ['glass0', 0.3, 1.5]], chain: [['zap', 0.5, 1.3]], cone: [['burn', 0.5]], blast: [['burn', 0.4]], burn: [['burn', 0.45]], flask: [['burn', 0.4]] };
export function hitSound(sound, type, kind, armored, pos) {
  const w = WHO[type] || {};
  cues(sound, LAND[kind] || (w.step === 'stone' ? [['stone*', 0.8]] : w.step === 'bone' ? [] : armored ? [['armor*', 0.9]] : [['flesh*', 0.9]]), pos);
  cues(sound, w.hurt, pos, 0.04);
}
export const fallSound = (sound, type, pos) => cues(sound, (WHO[type] || {}).fall || [['fall*', 0.9], ['drop', 0.45, 1, 0.25]], pos);
export const shatterSound = (sound, pos) => cues(sound, [['glass*', 0.6], ['burn', 0.35, 1, 0.05]], pos);
// every file these name, for the check that each exists (tests/chess.cjs)
export const NAMED = [...new Set([...Object.values(WHO).flatMap(w => [w.strike, w.hurt, w.fall, w.ability, w.reload].filter(Boolean).flat()), ...Object.values(LAND).flat(), ...Object.values(STEP), ['cloth*'], ['moan'], ['drag'], ['creak'], ['latch'], ['glass*'], ['fall*'], ['drop'], ['flesh*'], ['armor*'], ['block*'], ['swing*'], ['woosh*']].map(c => c[0]))];
export const TYPES = Object.keys(WHO);
// what a type is heard to do, for the check: the files of its footfall, its strike, its voice when struck, its fall
export const heardOf = type => { const w = WHO[type] || {}, names = l => (l || []).map(c => c[0]); return { step: w.step === 'none' ? ['cloth*'] : [STEP[w.step || 'boot'][0]], strike: names(w.strike), hurt: names(w.hurt), fall: names(w.fall || [['fall*']]) }; };
