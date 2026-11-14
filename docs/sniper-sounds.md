# COLD BORE (VR sniper) — sound credits

All files in `data/sniper/snd/` are real recordings, converted with ffmpeg to MP3 96 kbps CBR, 44.1 kHz,
mono, peak-normalised to about -3 dBFS (`shot_far` to -9), metadata stripped. Total about 1.2 MB.

Sources (all CC0 / public domain, no attribution required):

- **BigSoundBank** (Joseph Sardin and contributors, https://bigsoundbank.com) — every sound page used states
  "License CC0 (public domain): Free and royalty-free"; site licence page: https://bigsoundbank.com/licenses.html.
- **The Free Firearm Sound Library** (Ben Jaszczak et al., Still North Media; "Prepared SFX Library" as posted on
  OpenGameArt, https://opengameart.org/content/the-free-firearm-sound-library) — page licence CC0; the team's own
  words: "Our team holds CC0 NO RIGHTS RESERVED for this library".
- **OpenGameArt**, each page's licence shown as CC0 only: "Equipment Clicks III" by LFA,
  "Handgun reload sound effect" by zer0_sol, "Crowd shouting/speaking ambience" by StarNinjas,
  "Female High Pitched Scream SFX" by WuxiaScrub, "Female Scream 1" by Nocturnal_Vanguard (AuraVoice).

"Loop" = the tail is cross-faded into the head (equal power) so the file loops seamlessly, plus 8 ms
micro-fades at both ends so decoders that keep MP3 padding do not click.
One-shots start 4 ms before the first transient with a 3-4 ms fade-in and the fade-out noted.

| file | what it is | author / source URL | licence | edits made |
|---|---|---|---|---|
| shot.mp3 | Tikka T3 bolt-action rifle, .30-06, one shot outdoors with its echo, 2.80 s | Free Firearm Sound Library — https://opengameart.org/content/the-free-firearm-sound-library (Tikka/W_29P.wav near mic, first shot; Tikka/W_24P.wav mid-distance mic, second shot) | CC0 | the near-mic shot (attack) layered with a mid-distance-mic shot of the same rifle at 0.7 (echo tail), onsets aligned; mono, 30 Hz high-pass, +7 dB into a limiter; 0.8 s fade-out |
| shot_far.mp3 | distant rifle report, 2.40 s — made, not recorded far away | Free Firearm Sound Library — same URL (Mosin Nagant/M_26P.wav, 7.62x54R, mid-distance mic, first shot) | CC0 | low-pass 900 Hz (twice), ffmpeg `aecho` (190 ms and 430 ms), peak -9 dBFS, 0.8 s fade-out |
| bolt_open.mp3 | rifle bolt lifted and pulled back, 0.52 s | LFA — https://opengameart.org/content/equipment-clicks-iii (equipment_clicks3.wav) | CC0 | 2.60-3.12 s of the original, 0.06 s fade-out |
| bolt_close.mp3 | rifle bolt pushed forward and locked down, 0.72 s | LFA — same file | CC0 | 3.22-3.94 s of the original, 0.1 s fade-out |
| mag_out.mp3 | handgun magazine dropped, 0.32 s | zer0_sol — https://opengameart.org/content/handgun-reload-sound-effect (reload.wav) | CC0 | first event (0.1 s) cut out; 0.08 s fade-out; source peaks above full scale, gain reduced |
| mag_in.mp3 | handgun magazine inserted, 0.36 s | zer0_sol — same file | CC0 | second event (0.58 s) cut out; 0.08 s fade-out; gain reduced |
| dry.mp3 | pistol hammer click, 0.16 s | Joseph Sardin — https://bigsoundbank.com/pistol-cocking-hammer-1-s1992.html | CC0 | trimmed, 0.05 s fade-out |
| ding.mp3 | one hammer blow on a blacksmith's anvil with its ring, 1.34 s | Pablo Bergel — https://bigsoundbank.com/anvil-1-s3589.html | CC0 | blow at 11.64 s up to the next blow, 0.4 s fade-out |
| impact.mp3 | a 1-3 kg stone falling on a pile of stones (hard crack and debris), 0.50 s | Joseph Sardin — https://bigsoundbank.com/fall-of-stone-s1022.html | CC0 | second fall at 1.72 s, 0.15 s fade-out |
| crack.mp3 | a whip crack, 0.40 s | Joseph Sardin — https://bigsoundbank.com/whip-crack-3-s2951.html | CC0 | crack at 0.26 s, 0.15 s fade-out |
| wind.mp3 | strong wind outdoors, loop, 18.0 s | Joseph Sardin — https://bigsoundbank.com/strong-wind-4-s0154.html | CC0 | 15-35.5 s of the original (the steadiest part), mono mix, 30 Hz high-pass, 2.5 s cross-fade loop |
| city.mp3 | Paris at 1 am from a balcony: distant traffic hum, loop, 22.0 s | Joseph Sardin — https://bigsoundbank.com/paris-by-night-s0680.html | CC0 | 38.4-63.4 s of the original, mono mix, 40 Hz high-pass, 3 s cross-fade loop |
| sea.mp3 | medium waves on a shore with Sandwich terns calling, loop, 20.0 s | DenisChardonnet — https://bigsoundbank.com/sea-waves-and-seagulls-s0267.html | CC0 | 8-30 s of the original, mono mix, 30 Hz high-pass, 2 s cross-fade loop |
| rain.mp3 | steady heavy rain, loop, 15.0 s | Joseph Sardin — https://bigsoundbank.com/rain-and-storm-2-s0740.html | CC0 | 28-45 s of the original (thunder-free part), mono mix, soft limiter to tame single loud drops, 2 s cross-fade loop |
| heli.mp3 | helicopter rotor running steadily (between landing and take-off), loop, 8.2 s | Joseph Sardin — https://bigsoundbank.com/2-helicopters-landing-and-takeoff-1-s2734.html | CC0 | 84-93.7 s of the original, mono mix, 30 Hz high-pass, 1.5 s cross-fade loop, loop length nudged to line up the rotor beat |
| heart.mp3 | one heartbeat (lub-dub, foley), 0.63 s | DenisChardonnet — https://bigsoundbank.com/heartbeat-1-s0243.html | CC0 | trimmed, 0.12 s fade-out |
| radio.mp3 | walkie-talkie (Midland G7) end-of-transmission click, 0.22 s | Joseph Sardin — https://bigsoundbank.com/walkie-talkie-conversation-s0591.html | CC0 | the closing click at 5.35 s, 0.03 s fade-out |
| scream.mp3 | distant crowd shouting with women screaming, 3.0 s — a mix, not one recording | StarNinjas — https://opengameart.org/content/crowd-shoutingspeaking-ambience (6-9 s); WuxiaScrub — https://opengameart.org/content/female-high-pitched-scream-sfx (first three screams); Nocturnal_Vanguard — https://opengameart.org/content/female-scream-1 | CC0 | four screams laid over the crowd at 0.15, 0.6, 0.95 and 1.5 s; 250 Hz high-pass, 2.8 kHz low-pass and `aecho` to push it into the distance; 0.12 s fade-in, 0.7 s fade-out |

## Notes

- Clips were chosen by waveform/level analysis, not by ear — worth one listening pass, above all `bolt_open`/`bolt_close`
  and `scream`.
- `bolt_open`/`bolt_close`: LFA's file mixes "an actual bolt action rifle", a stapler and a tape measure without marking
  which is which; the cut is the one event with the four clicks of a full bolt cycle. If it turns out to be the wrong
  thing, the sure fallback is a pistol slide: https://bigsoundbank.com/pistol-cocking-1-s1984.html (CC0).
- `mag_out`/`mag_in` are a handgun's magazine and `dry` a pistol's hammer, not a rifle's.
- `ding` is an anvil, lower than a steel target plate: play it faster (playbackRate 1.3-1.6) for a plate.
- `crack` is a whip (truly supersonic, like a bullet's crack); `impact` is stone on stone.
- `scream`: the crowd is three siblings layered by its author to sound like a crowd; shouting, not real panic.
- The rifle recordings clip for about half a millisecond at the muzzle blast (as recorded).
- Not used: OpenGameArt "Gunshot sounds" (Mosin Nagant, SKS) — its page says CC0 but the zip's own text says CC-BY 3.0.
  BigSoundBank's "Wilhelm scream" and "Fah scream" pages carry no CC0 licence.

## Missing

Nothing from the wanted list is missing. No recording of a real distant rifle shot, a bullet on steel, a bullet
passing or a real crowd in panic was found under CC0; the stand-ins are named above.
