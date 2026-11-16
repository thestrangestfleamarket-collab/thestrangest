# SPACE FLEET — sound credits

All files in `data/space/snd/` are made by `python3 tools/space-sounds.py` from real recordings: MP3, 44.1 kHz, mono,
112 kbps (loops 96 kbps), peak-normalised to about -2 dBFS (`ambience` -3), metadata stripped. 24 files, about 0.8 MB.
The recordings as fetched are kept in `data/full/space/snd/` (about 420 MB, not in git).

**Source (every file): the USC Optical Sound Effects Library** on the Internet Archive — the Sunset Editorial (SSE),
Gold and Red libraries, film-studio effects recordings digitised by Craig Smith for the USC School of Cinematic Arts,
https://archive.org/details/usc-sound-effect-archive. Each item's page states **CC0 1.0** (public domain, no attribution
required). A recording below is at `https://archive.org/download/<item>/<file>`; the exact path of each is in the script's `SRC`.

Nothing is synthesised. A sci-fi weapon has no field recording, so each is built as film sound builds it: cuts of recordings,
played faster or slower (which also raises or lowers them), filtered, shaped and layered, then pushed into a soft limiter.
"Glide" = the playing speed slides during the cut. One-shots start 3 ms before the first transient and end in a fade-out.
"Loop" = the tail is cross-faded into the head (equal power).

| file | what it is | recordings (USC library item: file) | licence | edits made |
|---|---|---|---|---|
| gun.mp3 | fighter pulse-gun shot, 0.25 s | SSE_Library_GUNS: Very sharp small rifle fire, Cannon shot; SSE_Library_ELECTRICITY: Tesla coil sparking and humming, Machine made electrical lightning explosions | CC0 | rifle crack (350 Hz high-pass) + tesla sparks gliding 1.5x to 0.45x + electric zap gliding down + cannon below 220 Hz; fast decay |
| gun2.mp3 | variant, 0.27 s | same rifle (second shot, 0.88x) and zap (another discharge); SSE_Library_ELECTRICITY: Huge hissing electric sparks nearby; SSE_Library_GUNS: Big optical gun shot; close | CC0 | as `gun`, lower and with a different spark and low end |
| cannon.mp3 | frigate / turret cannon, 0.62 s | SSE_Library_GUNS: squad firing 37mm anti tank guns, 6 inch navel cannon fired up close; SSE_Library_ELECTRICITY: Machine made electrical lightning explosions; SSE_Library_WEAPONS: Whip crack | CC0 | 37 mm shot + electric discharge gliding 1.25x to 0.7x + whip crack + naval gun below 180 Hz; limiter |
| beam.mp3 | capital ship's heavy beam discharge, 1.25 s | SSE_Library_ELECTRICITY: Huge electrical arcs, Machine made electrical lightning explosions, Huge hissing electric sparks nearby, Tesla coil hum; SSE_Library_WEATHER: Thunderclap; strong but dull | CC0 | arcs held 0.75 s gliding down + discharge crack at the start + sparks + tesla hum at 0.75x to 0.5x and thunder below 160 Hz for the body |
| hit.mp3 | shot striking hull metal, 0.42 s | SSE_Library_METAL: Metal hits against metal; SSE_Library_EXPLOSIONS: Grenade explodes; sparks as above | CC0 | metal hit at 0.8x + grenade (900 Hz low-pass, 1.4x) + a spark |
| hit2.mp3 | variant, 0.42 s | SSE_Library_METAL: Large hard metal crash; optical; Red_Library_Metal: R16-31 Metal Clank and Ring; SSE_Library_EXPLOSIONS: Heavy sharp explosion with reverb | CC0 | crash + clank at 0.7x + explosion thump (700 Hz low-pass) |
| boom_s.mp3 | small craft exploding, 1.2 s | SSE_Library_EXPLOSIONS: Heavy sharp explosion with reverb; metal crash and sparks as above | CC0 | explosion at 1.1x + metal crash + sparks |
| boom_m.mp3 | medium ship exploding, 2.05 s | SSE_Library_EXPLOSIONS: Single heavy explosions 1, Grenade explodes; SSE_Library_METAL: Large hard metal crash, Steel girders wrench and tear | CC0 | two blasts layered, crash at 0.6x, girders under the tail |
| boom_l.mp3 | capital ship breaking up, 3.6 s | SSE_Library_EXPLOSIONS: Explosion; good, Large explosion with debris, Dynamite explosion; girders and thunderclap as above | CC0 | blasts slowed to 0.85x / 0.7x / 0.75x (the third 0.9 s late), girders at 0.6x, thunder at 0.7x; limiter |
| boom_xl.mp3 | the mothership's death, 6.2 s | SSE_Library_EXPLOSIONS: Atomic bomb explosion then rumble, Dynamite explosion, Large explosion with debris, Explosion; good, Single heavy explosions 1; Red_Library_Explosions: R09-53 Huge Explosion; zap, girders, crash, thunder as above | CC0 | six blasts at 0.6x-0.9x entering at 0, 0.55, 1.5, 2.3 and 2.8 s over the rumble, girders at 0.5x, thunder at 0.55x; hard limiter; 2.4 s fade |
| mine.mp3 | a mine's sharp blast, 1.5 s | Red_Library_Explosions: R30-06 Big Crisp Explosions; grenade, whip crack, clank as above | CC0 | first explosion at 1.15x + grenade above 400 Hz + whip crack + faint metal ring |
| engine.mp3 | deep steady ship-engine rumble, loop, 6 s | SSE_Library_SCIFI: Power drone for space ship interior; GOLD_TAPE_45_Submarine_Effects: G45-24 Submarine Interior Engine Room; SSE_Library_DESIGNED: Background ominous rumble | CC0 | three layers mixed, 1.2 s cross-fade loop |
| thrust.mp3 | brighter thruster roar, loop, 4 s | GOLD_TAPE_08_09_10_11_Aircraft-Jets: G09-19 Jet Engine Starts and Stops (running), G08-20 Constant Jet Noise; SSE_Library_AIR: Carbon dioxide fire extinguisher | CC0 | jet engine + jet roar + a little hiss, 1 s cross-fade loop |
| ambience.mp3 | dark deep-space bed, loop, 20 s | GOLD_TAPE_45_Submarine_Effects: G45-17 Hum in Conning Tower; Power drone and Tesla coil hum as above; SSE_Library_COMMUNICATIONS: Intersteller radio interference; GOLD_TAPE_32_Electricity: G32-19 Short Wave Radio | CC0 | hum at 0.7x (700 Hz low-pass), drone at 0.6x, coil hum at 0.5x, the two radio layers band-passed, very low and slowly swelling; 3 s cross-fade loop |
| ui_click.mp3 | metal click, 0.1 s | SSE_Library_MECHANICAL: Metal clicks; several takes | CC0 | one click cut out |
| ui_deny.mp3 | low electric buzzer, 0.26 s | GOLD_TAPE_19_20_Bells_Buzzers: G20-36 Short Buzz | CC0 | 0.26 s of one buzz at 0.8x |
| select.mp3 | soft tactical blip, 0.16 s | GOLD_TAPE_45_Submarine_Effects: G45-08 Sonar Blips | CC0 | one sonar blip at 1.25x, shortened |
| order.mp3 | radio squelch and acknowledge chirp, 0.36 s | SSE_Library_COMMUNICATIONS: Shortwave radio with electrical noises; sonar blip and metal click as above | CC0 | static burst and key click, sonar blip at 1.8x, static tail |
| build.mp3 | ship launched from the dock: clamp release and whoosh, 1.22 s | GOLD_TAPE_45_Submarine_Effects: G45-30 Submarine Hatch Opening; CO2 extinguisher, jet noise, metal click as above | CC0 | hatch clunk at 0.85x, then a gas blast and jet roar swelling and gliding down |
| alarm.mp3 | base-under-attack klaxon, two cycles, 1.6 s | GOLD_TAPE_45_Submarine_Effects: G45-15 Hornlike Sub Alarm | CC0 | two of its own cycles (0.70 s each) cut dip to dip and played at 0.88x; 3 kHz low-pass |
| capture.mp3 | relay coming online: power-up, 1.22 s | SSE_Library_ELECTRICITY: Tesla coil hum, Tesla coil sparking and humming; GOLD_TAPE_32_Electricity: G32-15 Force Field; metal click | CC0 | hums gliding up (0.6x to 2.6x, 0.45x to 1.5x) while swelling, relay click at the top |
| lost.mp3 | relay lost: power-down, 1.22 s | Tesla coil hum, Force Field, sparks as above; Red_Library_Sci-Fi: R20-48 Noise Slows to Full Stop | CC0 | spark, then hums gliding down (2.2x to 0.4x) while dying away |
| win.mp3 | low triumphant swell, 3.1 s | GOLD_TAPE_37_Horns: G37-08 Ship Horn; Red_Library_Music: R05-02 Gong Hit | CC0 | one horn note held and played at 0.5x, 1x, 1.5x, 2x, 2.5x and 3x (a major chord) entering one after another, gong struck as the chord completes |
| lose.mp3 | falling swell, 3.1 s | Ship Horn and Gong Hit as above; thunderclap | CC0 | the horn note as a minor chord (0.5x, 1x, 1.2x, 1.5x) sliding down to 0.62x and fading, gong at half speed, thunder under |

## Notes

- Cuts and mixes were chosen by waveform, level and spectrum analysis, not by ear: worth one listening pass, above all
  `gun`, `gun2`, `order`, `win` and `lose`. Every recipe is one line in the script.
- These are optical film recordings: little above 6 kHz, some film hiss. They are weighty rather than crisp.
- `engine` and `ambience` are mostly below 500 Hz; a headset's small speakers will give only their upper part.
- Not used, on purpose: the library's files named after Star Trek, the TV Batmobile and War of the Worlds
  (studio effects whose CC0 label is doubtful), and its ray gun / laser zap files.
- No CC0 brass fanfare was found; `win` and `lose` are chords built from a recorded ship's horn.
