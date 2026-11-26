# Skirmish Table: sounds

Every sound is a recording, CC0. `python3 tools/chess-sounds.py` cuts, levels and writes the ones below into `data/chess/sfx/` (mono MP3, no peak above -4 dB); which piece makes which is in `src/chess/voices.js`. The first thirty-five (select, end, turn, win, lose, heal, step, swing, bow, drop, flesh, armor, block, thud, fall, boom, rumble, snare) are Kenney's, as `docs/chess-credits.md` says. Nobody has listened to these: each was checked by its length, its peak and that it is not silent (`tests/chess.cjs`), and the cuts from long recordings were chosen by loudness alone.

Kenney (kenney.nl), CC0, from an unchanged copy of the packs (the `series-ai/jam-ready-assets` repository on GitHub):

| file | pack, its file | used for |
|---|---|---|
| paw0-2 | Impact Sounds, footstep_carpet_000-002 | the wolf's and the dragon's feet |
| bone0-3 | Impact Sounds, impactWood_light_000-003, played faster | the skeleton's steps, blows on it, its fall, the necromancer's raising |
| glass0-1 | Impact Sounds, impactGlass_heavy_000, impactGlass_medium_000 | a flask breaking |
| cloth0-1 | RPG Audio, cloth1-2 | the ghost's robe, a throw |
| drip0-2 | Foley Sounds, Water: drip1-3 | the room, now and then |
| woosh0-3 | Foley Sounds, Woosh: woosh1-4 | swings, throws, casts |
| chop | RPG Audio, chop | the berserker's axe |
| punch0-1 | Impact Sounds, impactPunch_heavy_000-001 | the ogre's club landing |
| scrape | Foley Sounds, Swords: swordStone1 | the skeleton's sword |

The USC Optical Sound Effects Library on the Internet Archive (archive.org, items `SSE_Library_*`), every item CC0; the loudest stretch of the length given is kept:

| file | item, recording | cut | used for |
|---|---|---|---|
| growl | ANIMALS, "Dog barking viciously" | 0.7 s, slowed | the wolf's bite |
| whine | ANIMALS, "Dog whines; whimpers; snarls" | 0.8 s | the wolf struck, falling |
| roar | CREATURES, "Dragon spits flame" | 1.4 s, quickened | the dragon's breath |
| screech | CREATURES, "Half grown monster screaming" | 0.9 s, quickened | the dragon struck, falling |
| grunt | CREATURES, "Mythical beast groans and screams" | 0.9 s | the ogre |
| groan | CREATURES, "Mastodon growls; dinosaur" | 1.4 s | the ogre falling |
| wail | MAGIC, "Spooky eerie ghost wind; synthesized tape" | 1.8 s | the ghost |
| moan | WIND, "Spooky singing ghost wind" | 1.5 s | the ghost moving, struck |
| flare | FIRE, "Flare whoosh" | 1.3 s | the fire mage, the dragon |
| burn | FIRE, "Heavy fire crackle" | 1.2 s from its second second | fire landing |
| arrow | WEAPONS, "Hard arrow thud into wooden po" | all | a bolt or an arrow landing |
| bodyfall | FIGHT, "Body hit and crash" | 1.1 s | the ogre falling |
| shimmer | MAGIC, "Genie appearing from and returning to a bottle" | 1.5 s | the necromancer's raising |
| tone | WIND, "Steady wind" | 10 s, slowed, muffled, its ends folded together | the room, low and unplaced |
| jungle | AMBIENCE, "Jungle background 1" | 24 s, its ends folded together | the Catacomb's jungle, all round, fetched when that table is shown |
| falls | WATER, "River rapids" | 10 s, muffled, its ends folded together | the Greyveil across the gorge, at its place, quiet |
| cry0, cry1 | BIRDS, "Eagle squawks & calls" | 1.3 s each | a bird of prey far off, now and then |
