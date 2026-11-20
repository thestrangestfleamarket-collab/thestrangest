# YATAI '86 — sound credits

Every file in `data/sushi/snd/` is a real recording from OpenGameArt, each page stating its licence as CC0 (public domain, no attribution required; credited here anyway). `python3 tools/sushi-assets.py snd` fetches them (kept in `data/full/sushi/snd/`, not in git) and cuts each to mono MP3 (hits 56 kbps 44.1 kHz, peak at -1 dBFS; loops 40 kbps 32 kHz, their tail laid over their head so they run round without a seam). About 430 KB in all.

| Ours | What | From | Author |
|---|---|---|---|
| `boil`, `simmer` | the noodle pot's rolling boil, the stock pots' simmer | boilingwater01.wav, boilingwater02.wav, https://opengameart.org/content/general-household-sound-effects | bretbernhoft |
| `chop1`–`chop3` | a knife on the cutting board | kitchencuttingboard01.wav, same page | bretbernhoft |
| `ceramic1`, `ceramic2` | a bowl taken up or set down | forkonplate01.wav, same page | bretbernhoft |
| `drain` | the noodle basket lifted out, a spill | kitchensink01.wav, same page | bretbernhoft |
| `steam` | a faint hiss over the hottest pot | steam_hisses.zip, https://opengameart.org/content/steam-release-sounds | bart |
| `rain` | the rain over the alley (the bed) | amb_rain_loop_1, https://opengameart.org/content/amb-rain-loop-1 | Kresiek The Furry |
| `eaves` | rain on the cart's sheet roof, running off its edges | rain-gutter-loop, https://opengameart.org/content/rain-gutter-loop | Ogrebane |
| `drip`, `pour`, `plop1`, `plop2` | runoff into puddles; a pour; things dropped into broth | loop_rain, loop_water_02, bubble_01, bubble_03, https://opengameart.org/content/40-cc0-water-splash-slime-sfx | rubberduck |
| `clank`, `wood1`, `wood2`, `glass1`, `glass2`, `shatter`, `crash` | a pot's knock; wood, glass set down; glass and crockery breaking | sfx_breaking_and_falling.zip, https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx | rubberduck |
| `metal1`, `metal2` | a ladle, a basket, the knife | clink2.wav, clink3.wav, https://opengameart.org/content/metal-impact-sounds | BMacZero |
| `cloth1`, `cloth2`, `coin1`, `coin2` | the rag, paper, food; coins | MoreSounds.zip (Cloth, Money), https://opengameart.org/content/202-more-sound-effects | OwlishMedia |
| `ignite`, `knob` | a burner lit, a knob turned | turn_stove_on_01, switch_strength_stove_01, https://opengameart.org/content/stove-switch | TinyWorlds |
| `traffic` | the street at the alley's open end | gatve Varniu_2.ogg, https://opengameart.org/content/high-traffic-road-sounds | IgnasD |

## ElevenLabs sound effects (19 Nov 2026)

Fifteen more files are ElevenLabs sound effects (its Sound Effects v2 model, made on the owner's ElevenLabs account, whose plan licenses what it makes for use in the game). They are generated sounds, not field recordings. The originals and the words each was made from are in `data/full/sushi/snd-eleven/` and `tools/sushi-sfx.py`, which cuts them (`python3 tools/sushi-sfx.py`): about 360 KB in all, fetched after the first sounds are in. Pixabay could not be used: its site answers a program with a challenge page.

| Ours | What | Where it plays from |
|---|---|---|
| `roofrain` | gentle rain on the sheet roof | the roof overhead |
| `rainst` | gentle rain on the pavement | four places on the ground round the cart |
| `citynight` | the city late at night, far traffic | everywhere, low |
| `burner` | a gas ring's flame | under each lit pot |
| `neon` | the neon's hum | the sign on the roof, while the cart is open |
| `carwet` | a car going by on the wet | the car as it passes |
| `step1`–`step4` | footsteps on wet pavement (one walk, cut into steps) | the feet of whoever comes or goes |
| `stool` | a stool dragged | the stool sat on |
| `register` | the register's key, bell and drawer | the register |
| `sticks`, `slurp` | chopsticks on a bowl, a slurp | whoever is eating |
| `bell` | the counter bell at an order or a rush | the ticket rail |

Made in the page (`src/sushi/audio.js`): the wind, a little of a passing car's tyres, the boombox's cassette, and the alley's echo (its two brick backs' short slap and a small tail).
