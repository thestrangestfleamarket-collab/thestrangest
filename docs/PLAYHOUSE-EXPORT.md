# The Playhouse: everything in the game

An export of everything the game has about the playhouse, the play, the acting, Sherlock Holmes, the voices and the settings. Made 2 Nov 2026 from both repos: the old 2D game (`bralynnb/tsfm`) and the 3D game (`thestrangestfleamarket-collab/thestrangest`).

**Contents**

1. What there is
2. The owner's decisions, in his words
3. The play: THE HOUND OF THE BASKERVILLES (cast, voices, marks, sounds, timetable, full script)
4. How the show runs (settings)
5. 221B: Holmes, Watson and Mortimer acting out chapter one
6. The playhouse building
7. Other voices in the game
8. Where everything lives
9. Appendix: the full source of every file

---

## 1. What there is

- **The play.** THE HOUND OF THE BASKERVILLES, the game's own short telling of Conan Doyle's story (public domain). It has five scenes, six actors, a hound and a curtain call, and runs about 7 minutes 44 seconds.
- **The voices.** Every line was voiced by ElevenLabs (model `eleven_v3`), one ElevenLabs voice per character. Every sound was made by ElevenLabs' sound effects from a written prompt. Everything is mixed into one track, `audio/hound.mp3` in the old game (3.2 MB).
- **The show.** It starts when someone sits in the playhouse. Online, the room server keeps the start time so everyone sees the same moment, and late arrivals join mid-show. Admins can restart it for everyone.
- **The staging.** The actors walk to marks on the stage, turn to whoever they speak to, and gesture (wave, crouch, fall, block). The scenery swaps in the dark between scenes: Baker Street, Baskerville Hall, the moor, and the moor in fog. The hound runs on, leaps at Sir Henry and flees into the Mire. The stage is lit by candles, with a lighting cue per scene.
- **The 221B scene.** This is a separate piece: chapter one of the book, "Mr. Sherlock Holmes", in the book's own words, cut to about two and a half minutes. Holmes, Watson, Dr. Mortimer and his spaniel act it out live in a full 221B sitting room. They use the same jointed avatar as the player, with real props: the walking stick, the lens, the Medical Directory and a cigarette. The camera cuts in close three times. The lines show as captions, and the scene loops. The Walker plays guitar for half a minute before it starts. You can walk among the actors, and they wait for you and glance at you. If you punch them, they react a little.
- **In the 3D game now.** The playhouse stands on West St. Its Victorian front, its spotlight, the velvet drapes and one row of plush seats are all built. The play's script, timetable, lighting cues and staging were copied in. The 3D version shows lines as captions and swaps the recordings for the game's own sounds. **The show is switched off.** On 19 Oct 2026 the owner asked for "nothing blocking stage just completely empty stage", so the code is kept but returns before it runs.

## 2. The owner's decisions, in his words

**The playhouse and the play (old game)**
- 14 Oct 2026: "a small play theater where you can watch plays". He picked option C, past the pool.
- 14 Oct 2026: "hound of baskervilles". Voices and sound "to match what they would sound like". "make it really atmospheric".
- 14 Oct 2026: "npcs with new walker real physics engine".
- 14 Oct 2026: "the play start when you sit", for everyone in the room.
- 14 Oct 2026: "remove curtain", "lights off on stage", "small lights on side of walls", "shorter ceiling, more intimate", "a few candles on stage". The stage is lit only by its candles, with no curtain and no stage lights.
- 14 Oct 2026: an admin button to restart the playhouse play.

**221B and the acting (old game)**
- 14 Oct 2026: "create a scene from hound of the baskervilles using my game engine, new walker, but use the characters from the book sherlock, etc dressed appropriately. have them act out one of the scenes in the room".
- 14 Oct 2026: "this is real characters in a room, you could interact with them. i just want them to be NPC controlled new walks, using full range of motion of physics".
- 14 Oct 2026: "recreate as accurate as possible. cut to close ups of characters and angles for dramatic story telling, but only a few times, make sure it doesnt lag". His picks were the walking stick, chapter 1, a 221B of its own, and "loop it".
- 14 Oct 2026: "make it in 1 room not real world map", "make the stage bigger taller more elaborate, higher stage production".
- 14 Oct 2026: "make the faces bigger in close ups", "increase resolution of characters at that level", "weird pixelation on face".
- 15 Oct 2026: "i want the npcs to all have the same exact avatar as the player does, fingers, etc."
- 15 Oct 2026: "if i punch a character they will react real physics, make it understated (they shouldn't go fly off) but it should effect them slightly like a real punch or kick".
- 16 Oct 2026: 221B taken off the street (his pick B).

**The playhouse in the 3D game**
- 19 Oct 2026: "lets put the arcade, movie theater, playhouse, holodeck, back into the game. put them on main street, using the empty building spots." He picked mockup A.
- 19 Oct 2026: "nothing blocking stage just completely empty stage". The proscenium, the masking legs, the candles and every set were removed, and the play no longer runs.
- 19 Oct 2026: "only 1 row of seats in theater and playhouse for now".
- 19 Oct 2026: "the playhouse should have a spotlight on the stage. walls taaller, back of room is velvet drapes, large curshier seats."
- 21 and 22 Oct 2026: "all interiors could be off map and buildings can be blocks". The playhouse front became a solid painted block, and its inside is built when you double-click the door.
- 22 and 23 Oct 2026: moved to West St, facing east.
- 23 Oct 2026: the playhouse lot is solid from the start. The 100-pawn soak test found a pawn sealed inside.
- 28 Oct 2026: the inside was moved next to section A. The front stays full, with the marquee and posters.
- 29 Oct 2026: GO TO for the playhouse lands you on the street outside its door.
- Jobs: a STAGE MANAGER works the playhouse from 14:00 to 22:00.
- The guide says: "The museum and the playhouse are open to walk around."

## 3. The play: THE HOUND OF THE BASKERVILLES

Holmes's voice is ElevenLabs' "Daniel", the same voice the old game's market news anchor uses. The other five voices are stored only as ElevenLabs voice IDs; look each ID up in the ElevenLabs voice library to see its name.

### The cast

| Part | ElevenLabs voice ID | Shirt | Trousers | Hair | Skin | Shoes | Hat |
|---|---|---|---|---|---|---|---|
| Sherlock Holmes (`holmes`) | `onwK4e9ZLuTAKqWW03F9` | #3a3d44 | #2b2c31 | #1e1a18 | #e2c2ac | #221a14 | deerstalker #7a6a50 |
| Dr. Watson (`watson`) | `JBFqnCBsd6RMkjVDRZzb` | #6a5440 | #4a3e34 | #6e5236 | #e6c4b0 | #3a2a1c | bowler #25211e |
| Dr. Mortimer (`mortimer`) | `Zlb1dXrM653N07WRdFW3` | #2c3a32 | #3c3c3a | #8a7a62 | #eccab6 | #2a2420 | top #1c1c1e |
| Sir Henry Baskerville (`henry`) | `TX3LPaxmHKxFdv7VOQHJ` | #8a6a3e | #5a4630 | #a0682c | #e8c0a0 | #4a3020 | wide #5a4a36 |
| Jack Stapleton (`stapleton`) | `N2lVS1w4EtoT3dr4eOWO` | #7a7a5a | #5e5a46 | #c4a870 | #e4c2a8 | #4a3c2a | straw #d8c48a |
| Barrymore (`barrymore`) | `CYw3kZ02Hs0563khs1Fj` | #141416 | #141416 | #2a2420 | #d8b8a0 | #0c0c0c | none |

### The stage marks

In tiles from the middle of the stage's front edge: across (negative is stage left, the audience's right), back (0 at the footlights).

| Mark | Meaning | Across | Back |
|---|---|---|---|
| DL | down left | -3 | 0.5 |
| DC | down centre | 0 | 0.5 |
| DR | down right | 3 | 0.5 |
| L | left | -3 | 1.8 |
| C | centre | 0 | 1.8 |
| R | right | 3 | 1.8 |
| UL | up left | -3 | 3.1 |
| UC | up centre | 0 | 3.1 |
| UR | up right | 3 | 3.1 |
| OL | off left (wings) | -5.3 | 1.9 |
| OR | off right (wings) | 5.3 | 1.9 |
| CHAIRL | the left armchair | -2.2 | 1.5 |
| CHAIRR | the right armchair | 1.6 | 1.5 |
| WINDOW | the window | 3.4 | 2.6 |
| FIRE | the fireplace | -0.4 | 2.5 |
| TOR | the tor | 0.6 | 3.1 |
| ROCK | the rock | -2.4 | 0.8 |
| MIRE | the Mire | -4.1 | 3 |
| PATH | the path | 3.2 | 2.4 |

### The sounds (ElevenLabs sound-effect prompts)

| Key | Prompt | Seconds |
|---|---|---|
| bell | a small brass theatre bell rung three times in an old playhouse lobby | 3 |
| overture | a mysterious Victorian overture, solo violin and low cello, gothic and slow, a quiet theatre | 14 |
| fire | a coal fire crackling softly in a Victorian sitting room grate | 20 |
| clock | a slow mantel clock ticking in a quiet room | 12 |
| knock | three firm knocks on a heavy wooden door | 2 |
| street | a horse and carriage passing on cobbles outside a window, distant London street | 8 |
| reading | a low ominous drone under a spoken legend, faint distant wind | 14 |
| howlfar | a single long hound howl far away across an open moor at night, echoing | 6 |
| sting | a sharp dramatic solo violin sting, suspense | 3 |
| violin | a melancholy solo violin phrase, Victorian, played in a room | 8 |
| wind | bleak wind moaning over an open moor at night, gusts in the heather | 22 |
| hallwind | wind moaning outside an old stone manor, a draughty hall, a clock far off | 20 |
| sob | a woman quietly sobbing far away down a stone corridor at night | 5 |
| door | a heavy old oak door creaking shut, echoing hall | 3 |
| mire | thick bog mud bubbling and sucking, a pony crying out as it sinks | 6 |
| owl | an owl hooting twice on a moor at night | 3 |
| fog | eerie still night air on a foggy moor, very quiet wind, distant water dripping | 20 |
| paws | a huge dog running fast over heather and stones, panting | 3 |
| snarl | a huge hound snarling and baying savagely, close, terrifying | 4 |
| howlnear | a huge hound howling in pain and fury, very close | 4 |
| splash | a heavy animal plunging into deep bog mud, thrashing, then bubbling and silence | 5 |

### The timetable

Total length 7:44 (464.56 s). Walk speed 1.5 tiles a second; the lights take 3 s to come up on a scene and 3 s to go down. The bell rings at 0:00, the overture starts at 0:02, the first scene at 0:12.

| Scene | Starts | Ends |
|---|---|---|
| 1. 221B Baker Street | 0:12 | 2:11 |
| 2. Baskerville Hall | 2:17 | 3:31 |
| 3. The Moor at Dusk | 3:37 | 5:14 |
| 4. The Moor at Night | 5:20 | 6:50 |
| 5. 221B Baker Street, Evening | 6:57 | 7:24 |
| Curtain call (two bows) | 7:30 | 7:39 |

### The full script, as staged

Times are from the moment someone sits. Words in [brackets] are ElevenLabs v3 delivery tags.

#### Scene 1: 221B Baker Street

*Set: baker. Lighting: warm. Sound under the scene: fire, clock.*

*At rise: Sherlock Holmes at the window, facing right; Dr. Watson at the left armchair, facing centre.*

`0:15` *SOUND: street (a horse and carriage passing on cobbles outside a window, distant London street), the next line starts over it.*

`0:15` **DR. WATSON** *(gesture: wave)*: Holmes, our visitor of last night forgot his walking stick. What do you make of it?

`0:20` **SHERLOCK HOLMES** *(faces Dr. Watson)*: [amused] How did you know what I was doing? I believe you have eyes in the back of your head.

`0:25` **DR. WATSON**: I have, at least, a well-polished coffee pot in front of me.

`0:29` **SHERLOCK HOLMES** *(moves to centre)*: Then tell me, Watson. What do you read in our visitor's stick?

`0:34` **DR. WATSON** *(faces Sherlock Holmes)*: An elderly country doctor. Well esteemed. One who walks a great deal.

`0:39` **SHERLOCK HOLMES** *(faces the audience, gesture: wave)*: [laughs softly] Splendid, Watson. Wrong in almost every particular! A young man, amiable, unambitious, absent-minded, and the owner of a favourite dog. Larger than a terrier, and smaller than a mastiff.

`0:56` *SOUND: knock (three firm knocks on a heavy wooden door).*

`0:58` **SHERLOCK HOLMES** *(faces off right (wings))*: And here, unless I am mistaken, is the man himself.

`1:03` *Dr. Mortimer enters from off right (wings) to right.*

`1:05` **DR. MORTIMER** *(faces Sherlock Holmes)*: Mr. Sherlock Holmes? Doctor James Mortimer. I have come about a death on Dartmoor. And about a legend.

`1:13` **SHERLOCK HOLMES** *(moves to the right armchair, faces Dr. Mortimer)*: Pray, sit down, Doctor. Watson, the lamp.

`1:16` *Dr. Watson walks to the fireplace.*

`1:18` *SOUND: reading (a low ominous drone under a spoken legend, faint distant wind), the next line starts over it.*

`1:18` **DR. MORTIMER** *(moves to centre, faces the audience)*: [reading slowly, low] Know then, that in the time of the Great Rebellion, Hugo Baskerville, a wild and godless man, hunted a maiden across the moor by night. And there stood over him a foul thing. A great black beast, shaped like a hound, yet larger than any hound that ever mortal eye has rested upon.

`1:39` *SOUND: howlfar (a single long hound howl far away across an open moor at night, echoing), the next line starts over it.*

`1:39` **DR. MORTIMER**: Three weeks ago, Sir Charles Baskerville was found dead at the end of the yew alley. There was no mark upon him. But his face. His face was twisted with terror.

`1:51` **DR. WATSON** *(faces Dr. Mortimer)*: [quietly] Good heavens.

`1:53` **DR. MORTIMER** *(faces Sherlock Holmes)*: There were footprints near the body, Mr. Holmes.

`1:56` **SHERLOCK HOLMES** *(faces Dr. Mortimer)*: A man's, or a woman's?

`1:59` **DR. MORTIMER** *(gesture: wave)*: [whispers] Mr. Holmes. They were the footprints of a gigantic hound!

`2:06` *SOUND: sting (a sharp dramatic solo violin sting, suspense).*

`2:09` *A pause of 1.2 s.*


#### Scene 2: Baskerville Hall

*Set: hall. Lighting: hall. Sound under the scene: hallwind.*

*At rise: Sir Henry Baskerville at up left, facing centre; Dr. Watson at left, facing centre; Barrymore at up right, facing Sir Henry Baskerville.*

`2:20` *SOUND: door (a heavy old oak door creaking shut, echoing hall).*

`2:23` **BARRYMORE** *(moves to right)*: [gravely] Welcome to Baskerville Hall, Sir Henry. Dinner is laid in the hall, sir.

`2:29` **SIR HENRY BASKERVILLE** *(moves to centre, faces Barrymore)*: Some welcome. It's not a cheerful place, is it, Barrymore? I don't wonder my uncle got a little jumpy, living here alone.

`2:36` **DR. WATSON** *(faces Sir Henry Baskerville)*: Mr. Holmes has sent me to see that you are never left alone, Sir Henry. Especially after dark.

`2:42` **SIR HENRY BASKERVILLE** *(faces Dr. Watson, gesture: wave)*: [laughs] A ghost dog! I've lived in the West, Doctor Watson. I've heard wolves at night. I'll not be frightened off by a story.

`2:50` *SOUND: sob (a woman quietly sobbing far away down a stone corridor at night).*

`2:55` **DR. WATSON** *(faces up right)*: [hushed] Listen. Did you hear that? A woman, crying.

`3:00` **SIR HENRY BASKERVILLE** *(faces Barrymore)*: Barrymore. Who is that?

`3:03` **BARRYMORE** *(faces Sir Henry Baskerville)*: [hesitating] There are only two women in the house, sir. The scullery maid sleeps in the far wing, and my wife. And I can answer for it, sir, it was not my wife.

`3:13` **SIR HENRY BASKERVILLE**: Then who?

`3:14` **BARRYMORE** *(faces the audience)*: [uneasy] The wind, sir. The wind on the moor does strange things. Good night, sir.

`3:20` *Barrymore exits to off right (wings).*

`3:21` **DR. WATSON** *(moves to down centre, faces the audience)*: [quietly, to himself] It was not the wind.

`3:23` *SOUND: howlfar (a single long hound howl far away across an open moor at night, echoing).*

`3:29` *A pause of 1 s.*


#### Scene 3: The Moor at Dusk

*Set: moor. Lighting: dusk. Sound under the scene: wind.*

*At rise: Dr. Watson at down left, facing right.*

`3:40` *Dr. Watson walks to left.*

`3:41` *A pause of 1.5 s.*

`3:43` *Jack Stapleton enters from off right (wings) to right.*

`3:45` **JACK STAPLETON** *(faces Dr. Watson, gesture: wave)*: [cheerfully] Doctor Watson! Forgive the liberty. Stapleton, of Merripit House. I chase butterflies on the moor.

`3:53` **DR. WATSON** *(faces Jack Stapleton)*: A lonely place for it.

`3:55` **JACK STAPLETON** *(moves to centre, faces the Mire)*: A wonderful place! But take care where you walk, Doctor. That bright green patch is the great Grimpen Mire. A false step there means death, to man or beast.

`4:10` *SOUND: mire (thick bog mud bubbling and sucking, a pony crying out as it sinks).*

`4:16` **JACK STAPLETON**: [softly] There. A moor pony. Two in a week. The Mire has them, and it does not let go.

`4:24` *SOUND: howlfar (a single long hound howl far away across an open moor at night, echoing), the next line starts over it.*

`4:24` **DR. WATSON** *(faces up left)*: [uneasy] What on earth is that?

`4:26` **JACK STAPLETON** *(faces Dr. Watson)*: [lightly] The peasants say it is the Hound of the Baskervilles, calling for its prey.

`4:31` **DR. WATSON**: And you, a man of science, believe that?

`4:35` **JACK STAPLETON** *(faces the audience)*: [smiling] I believe in getting home before dark, Doctor. Good evening.

`4:40` *Jack Stapleton exits to off right (wings).*

`4:44` *A pause of 1.2 s.*

`4:45` *Sherlock Holmes enters from off left (wings) to the tor.*

`4:49` **SHERLOCK HOLMES** *(faces Dr. Watson)*: It is a lovely evening, my dear Watson.

`4:52` **DR. WATSON** *(faces Sherlock Holmes, gesture: block)*: [startled] Holmes! You, here? I thought you were in London!

`4:56` **SHERLOCK HOLMES** *(moves to centre, faces the audience)*: That was what I wished you to think. Our naturalist is no stranger to that hound, Watson. Tonight we set a trap. And Sir Henry, I am afraid, must be the bait.

`5:09` *SOUND: sting (a sharp dramatic solo violin sting, suspense).*

`5:12` *A pause of 1 s.*


#### Scene 4: The Moor at Night

*Set: fog. Lighting: night. Sound under the scene: fog, wind.*

*At rise: Sherlock Holmes at the rock, facing right; Dr. Watson at left, facing right.*

`5:23` *Sherlock Holmes: crouch. Dr. Watson walks to down left.*

`5:24` **SHERLOCK HOLMES** *(faces Dr. Watson)*: [whispers] Keep down. Sir Henry leaves Merripit House at ten. He must cross the moor alone.

`5:32` **DR. WATSON** *(faces right)*: [whispers] The fog, Holmes. It is rolling in from the Mire.

`5:36` **SHERLOCK HOLMES** *(faces right)*: [whispers, tense] The one thing on earth that could have spoiled my plans.

`5:40` *SOUND: owl (an owl hooting twice on a moor at night).*

`5:43` *Sir Henry Baskerville enters from off right (wings) to the path.*

`5:45` *A pause of 1.5 s.*

`5:46` *Sir Henry Baskerville walks to centre.*

`5:49` *SOUND: paws (a huge dog running fast over heather and stones, panting), the next line starts over it.*

`5:49` *THE HOUND: enter from off right (wings).*

`5:52` *SOUND: snarl (a huge hound snarling and baying savagely, close, terrifying), the next line starts over it.*

`5:52` *THE HOUND: leap at Sir Henry Baskerville.*

`5:53` **SIR HENRY BASKERVILLE** *(gesture: fall)*: [screams] Holmes! Watson! Help me!

`5:58` **SHERLOCK HOLMES** *(moves to right, gesture: block)*: [shouting] Now, Watson! The lantern!

`6:00` *Dr. Watson walks to centre.*

`6:03` *SOUND: howlnear (a huge hound howling in pain and fury, very close), the next line starts over it.*

`6:03` *THE HOUND: flee into the Mire.*

`6:06` *SOUND: splash (a heavy animal plunging into deep bog mud, thrashing, then bubbling and silence).*

`6:11` **DR. WATSON** *(faces the Mire)*: [breathless] It is gone. Into the Mire!

`6:14` **SHERLOCK HOLMES** *(faces Dr. Watson)*: Did you see its jaws, Watson? Phosphorus. A cunning preparation. It was a living dog, painted to look like a fiend from hell.

`6:23` **SIR HENRY BASKERVILLE** *(moves to centre, faces Sherlock Holmes)*: [shaken] Then who? Who would do such a thing?

`6:27` **SHERLOCK HOLMES** *(faces the audience)*: Stapleton. A Baskerville himself, Sir Henry, hidden under another name, and next in line for your fortune. He has fled into the fog. The Mire will judge him now.

`6:42` *SOUND: mire (thick bog mud bubbling and sucking, a pony crying out as it sinks).*

`6:49` *A pause of 1 s.*


#### Scene 5: 221B Baker Street, Evening

*Set: baker. Lighting: evening. Sound under the scene: fire, clock.*

*At rise: Sherlock Holmes at the right armchair, facing the audience; Dr. Watson at the left armchair, facing Sherlock Holmes.*

`7:00` **DR. WATSON**: A dreadful business, Holmes. And yet you saw it all from the first.

`7:04` **SHERLOCK HOLMES** *(faces Dr. Watson)*: [warmly] The world is full of obvious things, Watson, which nobody by any chance ever observes.

`7:10` **SHERLOCK HOLMES** *(moves to the window, faces the audience)*: Come. Dinner, I think. And afterwards, a little music.

`7:15` *SOUND: violin (a melancholy solo violin phrase, Victorian, played in a room).*

`7:23` *A pause of 0.5 s.*


#### Curtain call

The whole cast in a line (Stapleton, Mortimer, Watson, Holmes, Sir Henry, Barrymore), two bows at 7:34 and 7:36, then the house lights come up.

## 4. How the show runs (settings)

**Starting and syncing**
- Sitting in a playhouse seat starts the show if none is on. Online, the game sends `{t:'show', len}` to the room server, and the server answers everyone with the start time.
- The server keeps the start time in memory only, because a show lasts minutes. Whoever joins mid-show is told where it has got to.
- Sitting while a show is on changes nothing. Each player can send one start every 2 seconds. The server clamps the show length to between 10 and 3,600 seconds, with 600 as the default.
- An admin's restart sends `restart:1` and starts it from the top for everyone. Offline, the show is your own.
- Tests can freeze the show at any moment with `window.PLAYAT = seconds`.

**Timing rules** (the tool computes them once; the stage only reads them back)

| Setting | Value |
|---|---|
| Walk speed | 1.5 tiles a second |
| Quiet after each line | 0.45 s |
| Lights coming up on a scene | 3 s |
| Lights going down | 3 s |
| Dark between scenes | 3.5 s |
| Bell, then overture | 0:00 and 0:02.5; first scene at 0:12 |
| A sound marked "over" | the next line starts 0.5 s after it |
| Stage business | the longest walk, or 1 s for a gesture, plus 0.3 s |
| The hound | enter 2.2 s, leap 1.1 s, flee 2.6 s |
| Curtain call | lights up, a bow at +1 s and another at +3.5 s, end at +6.5 s |

**ElevenLabs settings** (`tools/playhouse-audio.mjs` in the old game)
- Voices: `POST https://api.elevenlabs.io/v1/text-to-speech/<voice>?output_format=mp3_44100_128`, model `eleven_v3`. Delivery tags such as [whispers] go inline in the text.
- Sounds: `POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128`, using the prompt, its seconds, and `prompt_influence` 0.45.
- Each line and sound is requested once and cached in `.playhouse-cache/`, which is not committed. Changing one line re-requests only that line.
- The key comes from `ELEVENLABS_API_KEY` and is never written down. The tool needs ffmpeg. To run it:

```bash
ELEVENLABS_API_KEY=... node tools/playhouse-audio.mjs
```

**The mix**
- Every line is evened to the same loudness, a target RMS of 0.11.
- Sound volumes: knock 0.8, street 0.35, reading 0.4, howlfar 0.55, sting 0.6, violin 0.6, sob 0.45, door 0.7, mire 0.6, owl 0.5, paws 0.8, snarl 0.95, howlnear 0.9, splash 0.8, bell 0.7, overture 0.55.
- Sounds under each scene loop for the whole scene and fade in and out over 2.5 s. Their volumes: fire 0.22, clock 0.12, wind 0.3, hallwind 0.26, fog 0.3.
- Master chain: ffmpeg `acompressor=threshold=-26dB:ratio=3:attack=8:release=250,loudnorm=I=-20:TP=-1.5:LRA=14`.
- Output: mono, 24 kHz, MP3 at 56 kbps, written to `audio/hound.mp3`. The times go to `src/47-playhouse-1-times.data.js`.
- In the game the track plays at the show's moment through the room's echo, and sounds muffled through the walls outside.

**Lighting cues** (3D game `PLCUE`, as RGB multipliers per light group)

| Cue | House | Lobby | Wall lights | Candles | Practical (set lamp) |
|---|---|---|---|---|---|
| house | 1, .86, .62 | 1, .86, .62 | .8, .52, .26 | .9, .6, .28 | |
| preshow | .3, .26, .2 | .6, .5, .36 | .6, .4, .2 | 1, .66, .3 | |
| warm (Baker St) | | .15, .12, .08 | .32, .21, .1 | 1.2, .78, .36 | 1.2, .6, .24 |
| hall | | .15, .12, .08 | .32, .21, .1 | 1, .64, .28 | .7, .48, .22 |
| dusk | | .15, .12, .08 | .32, .21, .1 | .95, .6, .28 | |
| night | | .15, .12, .08 | .32, .21, .1 | .8, .5, .24 | |
| evening | | .15, .12, .08 | .32, .21, .1 | 1, .64, .3 | 1.3, .66, .26 |
| between scenes | | .15, .12, .08 | .32, .21, .1 | .18, .12, .06 | |
| curtain call | .4, .34, .25 | .15, .12, .08 | .6, .4, .2 | 1.2, .8, .38 | |

Cues cross-fade over 1.5 s in five steps. Between scenes the candles dim to a glimmer while the scenery is swapped in the dark.

**The sets** (`47-playhouse-3-sets.js`)
- **221B Baker Street**: the fireplace with a flickering coal fire, two leather armchairs, a lamp on a little table, the bookcase, the window and the rug.
- **Baskerville Hall**: oak panelling, Sir Hugo's portrait, the long table, a candelabra and the long-case clock.
- **The moor**: low hills against the sky cloth, a granite tor, a rock to hide behind, heather, a dead thorn tree, and reeds at the Mire's edge in the wings.
- **The moor in fog**: the moor with three drifting layers of dithered fog.
- **The hound**: a huge black dog whose legs swing as it runs, with glowing jaws and eyes from the phosphorus.

**In the 3D game**
- Each actor is a rigged pawn recoloured to the cast's look: Holmes, Henry and Stapleton use `hero_m`, the others `villager_m`. Hats are built from the hat kind: top, bowler, deerstalker, wide or straw.
- Gestures map to animation clips: wave becomes cheer, crouch and fall become sitting on the floor, and block becomes found-item. The rest is walk, talking idle or idle.
- The hound is a recoloured creature: black, with green-glowing jaws and eyes.
- Lines show as a caption at the foot of the screen, such as "SHERLOCK HOLMES: ...", with the [tags] removed.
- Recordings are replaced by game sounds: knock as door, door as creak, howls and snarl as bark, paws as step, mire and splash as drip, owl as chirp, sting as boom, bell as latch.

## 5. 221B: Holmes, Watson and Mortimer acting out chapter one

This is the old game's live scene in its own 221B sitting room.

**The room.** It is 10.4 by 8.6 tiles inside. It has oxblood damask paper over a dark panelled dado, a bow window onto Baker Street in yellow fog, and velvet curtains. The fireplace is cast iron with green tiles and a gilt overmantel mirror, and there are gas brackets. The V.R. is shot into the wall in bullet-pocks, and portraits of General Gordon and Henry Ward Beecher hang over the settee. The floor has a Turkey carpet and a bearskin hearthrug, and the stair goes down to the landing. Every object in the room is a physics body: the breakfast table with its coffee-pot, cups and toast rack, the chairs and armchairs, the settee, the basket chair, and Watson's medical shelf with the Medical Directory.

**The cast** (dressed as in the book; since 15 Oct they wear the player's own avatar in their colours)
- **Holmes**: over six feet and lean, black hair, a hawk's nose; a purple dressing-gown with its cord, dark trousers.
- **Watson**: brown hair and a moustache, a tweed jacket, waistcoat and watch-chain, a dark tie, brown boots.
- **Mortimer**: very tall and thin, with a beak-like nose and gold-rimmed glasses. His frock-coat is dingy, his trousers frayed, his back bowed and his head thrust forward.
- **The spaniel**: curly-haired, liver and white with a white blaze, long curly ears and a docked tail. It trots after Mortimer and sits or lies at his feet.
- **Props**: the walking stick (a "Penang lawyer" with a bulbous head, a silver band and an iron ferrule), the convex lens, the Medical Directory shut and open, a lit cigarette, and a cigarette paper.
- **Poses**: stand, behind, folded, gesture, point, offer, bendDown, examine, holdUp, lens, read, carry, smoke, peer, skull, sit, sitTable, sitCup, sitBack, sitRoll, sitStick, lie, hold.

**How they act**
- They walk on the rig's own gait, so their feet never slide.
- They blend between poses, and their hands reach exactly where they must, for example to the stick or the cup.
- They breathe, turn their heads to whoever they look at, and move their mouths and hands as they speak.
- If you stand in their way they stop and look at you. The scene waits up to about 4 to 6 seconds, then they walk round you.
- When you come close they glance at you, at most once every 7 seconds for 1.6 seconds.
- A punch or kick knocks their waist, neck and knees on damped springs, and they recover in about half a second. A hard hit shoves them back a few inches. Nothing knocks them down.
- The camera cuts in close three times: on the stick's inscription, on "Come in!", and on Mortimer and Holmes's skull. Black bars show top and bottom, and the cut ends if you move.
- You hear footsteps on the boards, the fire crackling, and the bell at the street door.
- At the start, Holmes is at breakfast with his back to the hearth and Watson is on the hearthrug. Mortimer and the spaniel are out of sight on the stair.

**The scene, line by line** (seconds from the start; the book's own words, "…" where words are cut)

`0:00.0` *(WATSON looks; HOLMES looks)*

`0:00.3` *(WATSON walks)*

`0:02.2` *(WATSON: bendDown)*

`0:02.8` *(WATSON picks up a thing)*

`0:03.3` *(WATSON: examine; WATSON walks)*

`0:04.0` *(caption)* "To James Mortimer, M.R.C.S., from his friends of the C.C.H."  1884 *(CAMERA: cut in close)*

`0:07.8` **HOLMES**: Well, Watson, what do you make of it?

`0:10.3` **WATSON**: How did you know what I was doing? I believe you have eyes in the back of your head. *(WATSON looks)*

`0:14.2` **HOLMES**: I have, at least, a well-polished, silver-plated coffee-pot in front of me. *(HOLMES: sitCup)*

`0:17.7` **WATSON**: I think that Dr. Mortimer is a successful, elderly medical man, well-esteemed since those who know him give him this mark of their appreciation. *(WATSON walks; WATSON: holdUp)*

`0:22.8` **HOLMES**: Good! Excellent! *(HOLMES: sitTable)*

`0:24.5` **WATSON**: … a country practitioner who does a great deal of his visiting on foot. … The "C.C.H." … I should guess that to be the Something Hunt. *(WATSON: carry)*

`0:29.6` *(a chair pushed back)*

`0:30.2` *(HOLMES stands)*

`0:31.1` **HOLMES**: Really, Watson, you excel yourself. … It may be that you are not yourself luminous, but you are a conductor of light. *(HOLMES: smoke; HOLMES looks)*

`0:33.4` *(HOLMES: stand; HOLMES walks)*

`0:34.4` *(WATSON: offer; WATSON looks)*

`0:35.6` *(HOLMES: reach)*

`0:36.1` *(WATSON hands it to HOLMES; HOLMES: holdUp; WATSON: stand)*

`0:37.6` *(HOLMES walks; HOLMES: carryL; WATSON looks)*

`0:44.4` *(HOLMES: lens)*

`0:45.6` **HOLMES**: Interesting, though elementary.

`0:47.6` *(HOLMES walks; HOLMES: carryL)*

`0:47.8` **WATSON**: Has anything escaped me? I trust that there is nothing of consequence which I have overlooked? *(WATSON: folded)*

`0:51.5` **HOLMES**: I am afraid, my dear Watson, that most of your conclusions were erroneous.

`0:53.0` *(HOLMES sits)*

`0:55.0` **HOLMES**: … a presentation to a doctor is more likely to come from a hospital than from a hunt, and … the words "Charing Cross" very naturally suggest themselves.

`1:00.1` **HOLMES**: … a young fellow under thirty, amiable, unambitious, absent-minded, and the possessor of a favourite dog, which I should describe roughly as being larger than a terrier and smaller than a mastiff.

`1:06.4` **WATSON**: Ha! … at least it is not difficult to find out a few particulars about the man's age and professional career. *(WATSON: stand; HOLMES looks)*

`1:07.2` *(WATSON walks)*

`1:12.1` *(WATSON: reach; WATSON looks)*

`1:12.7` *(WATSON picks up a thing; WATSON: carry)*

`1:13.2` *(WATSON: read)*

`1:13.8` **WATSON**: "Mortimer, James, M.R.C.S., 1882, Grimpen, Dartmoor, Devon. House-surgeon, from 1880 to 1884, at Charing Cross Hospital. …"

`1:18.9` **HOLMES**: No mention of that local hunt, Watson, but a country doctor, as you very astutely observed. *(HOLMES looks; WATSON: carry)*

`1:19.2` *(WATSON walks)*

`1:24.3` *(WATSON: reach)*

`1:24.8` *(WATSON puts it down; WATSON: stand)*

`1:25.0` **WATSON**: And the dog?

`1:26.5` *(HOLMES stands)*

`1:27.0` **HOLMES**: Has been in the habit of carrying this stick behind his master. Being a heavy stick the dog has held it tightly by the middle, and the marks of his teeth are very plainly visible. *(HOLMES walks)*

`1:33.6` **HOLMES**: It may have been—yes, by Jove, it is a curly-haired spaniel. *(HOLMES looks; WATSON looks)*

`1:37.0` **WATSON**: My dear fellow, how can you possibly be so sure of that?

`1:39.8` **HOLMES**: For the very simple reason that I see the dog himself on our very door-step, and there is the ring of its owner.

`1:41.5` *(sound: bell)*

`1:41.8` *(MORTIMER walks; THE SPANIEL walks)*

`1:44.4` **HOLMES**: Don't move, I beg you, Watson. … Now is the dramatic moment of fate, Watson, when you hear a step upon the stair which is walking into your life, and you know not whether for good or ill. *(HOLMES looks; WATSON: folded)*

`1:50.8` *(HOLMES walks; HOLMES: stand)*

`1:51.8` **HOLMES**: Come in! *(HOLMES looks; CAMERA: cut in close)*

`1:53.0` *(MORTIMER walks; THE SPANIEL walks; WATSON looks; MORTIMER: peer; MORTIMER looks)*

`1:53.6` **MORTIMER**: I am so very glad. I was not sure whether I had left it here or in the Shipping Office. I would not lose that stick for the world.

`1:58.4` *(HOLMES: offer; MORTIMER: reach)*

`1:59.1` *(HOLMES hands it to MORTIMER; HOLMES: behind; MORTIMER: carry; THE SPANIEL looks)*

`1:59.4` **HOLMES**: A presentation, I see.

`2:01.1` **MORTIMER**: Yes, sir.

`2:02.1` **HOLMES**: From Charing Cross Hospital?

`2:03.9` **MORTIMER**: From one or two friends there on the occasion of my marriage.

`2:07.0` **HOLMES**: Dear, dear, that's bad!

`2:09.0` **HOLMES**: And now, Dr. James Mortimer—

`2:10.8` **MORTIMER**: Mister, sir, Mister—a humble M.R.C.S. *(MORTIMER: peer)*

`2:13.4` **MORTIMER**: I had hardly expected so dolichocephalic a skull or such well-marked supra-orbital development. Would you have any objection to my running my finger along your parietal fissure? *(MORTIMER: skull; CAMERA: cut in close)*

`2:19.6` **HOLMES**: You are an enthusiast in your line of thought, I perceive, sir, as I am in mine. … Have no hesitation in lighting one. *(HOLMES: wave; HOLMES looks; MORTIMER: carry)*

`2:20.6` *(MORTIMER walks; THE SPANIEL walks)*

`2:22.4` *(HOLMES: behind; HOLMES looks)*

`2:25.6` *(MORTIMER sits; THE SPANIEL looks)*

`2:27.2` *(caption)* He had long, quivering fingers as agile and restless as the antennae of an insect. *(MORTIMER: sitRoll; MORTIMER puts it down; WATSON looks)*


## 6. The playhouse building

**Old game** (`26-z-the-playhouse.js`)
- A small Victorian theatre front drawn by hand in brick and cream stucco. The doors sit under an iron canopy. The lit PLAYHOUSE board is ringed with bulbs and shows the play's name and start times, with a poster on each side.
- Inside are six rows of red velvet seats in one central block, a lobby of tiles at the door, and small wall lights on each side.
- The raised wooden stage is lit only by its candles. It has a gilded proscenium arch, black masking legs in the wings and a pale cloth cyclorama at the back.

**3D game** (`039-bodega.js` kit and `059-street.js` builder)
- The same Victorian front with TAKE A SEAT over the PLAYHOUSE board. It is a painted block on West St, facing east, at x −67.9 to −52.5 and y 77 to 91, 150 high in the map editor, described as "red brick, marquee".
- Inside, the walls are 190 high. Deep red velvet drapes with real pleats hang behind the audience and behind the stage, with a red valance edged in gold.
- A spotlight hangs on a pipe batten. It throws a hard-edged warm pool onto the stage and a faint beam, both shown only while you are inside.
- One row of five big plush velvet armchairs is sittable.
- The stage is empty, at the owner's request.
- The inside is built off the map next to section A when you double-click the door. You leave by the inside door.

## 7. Other voices in the game

- **The market news** (old game, `worker/news.js`): Claude writes the hour's 30-second bulletin and ElevenLabs voices it. The voice is "Daniel", `onwK4e9ZLuTAKqWW03F9`, with model `eleven_multilingual_v2`.
- **The bar singer** (old and 3D games): a synthesized voice rather than recordings. It uses a buzz at the note's pitch, three vowel formants, breath and vibrato, and sings wordless melodies over the songbook's chords.

## 8. Where everything lives

**Old game, `bralynnb/tsfm`**

| File | What it is |
|---|---|
| `src/47-playhouse-1-script.js` | The play: cast, voices, marks, sounds, every line |
| `src/47-playhouse-1-times.data.js` | The play's timetable, generated |
| `src/47-playhouse-2-show.js` | The show: clock, sync, staging, lights, sound |
| `src/47-playhouse-3-sets.js` | The scenery and the hound |
| `src/26-z-the-playhouse.js` | The playhouse building |
| `tools/playhouse-audio.mjs` | Makes the voices and sounds with ElevenLabs and mixes the track |
| `audio/hound.mp3` | The finished track, 3.2 MB |
| `worker/room.js` | Syncs the show for everyone online |
| `src/47-play-1-cast.js` | 221B's actors, their bodies, poses, props and hits |
| `src/47-play-2-scene.js` | 221B's chapter-one scene and its camera cuts |
| `src/23-w-sitting-room-221b.js` | The 221B room's look |
| `src/47-physics-7-sitting-room.js` | 221B's objects |

**3D game, `thestrangestfleamarket-collab/thestrangest`**

| File | What it is |
|---|---|
| `src/039-bodega.js` (the `PLAY` block) | The script, timetable, lighting cues, stage, front and seats, copied in |
| `src/059-street.js` (the playhouse part) | The building, drapes, spotlight and the switched-off show |
| `data/world.json` | The playhouse's place on the map |
| `src/159-jobs.js` | The stage manager's hours |

The full source of each file follows, as of 2 Nov 2026.

---

## 9. Appendix: full source


### 9.1 Old game: src/47-playhouse-1-script.js

The play's script, cast and voices.

````js
// =====================================================================================
// THE PLAYHOUSE'S PLAY (owner, 14 Oct 2026: "a small play theater where you can watch plays", "hound of baskervilles", voices and sound
// "to match what they would sound like", "make it really atmospheric"): THE HOUND OF THE BASKERVILLES, our own short telling of Conan
// Doyle's story (public domain), in five scenes. This is the script the show runs from (47-playhouse-2-show) and the voices and sounds
// are made from (tools/playhouse-audio.mjs: ElevenLabs, into audio/hound.mp3 and the times in 47-playhouse-1-times.data.js).
// The cast: each one's voice (ElevenLabs' own voices), colours (the jointed walker's materials, as a passport's look) and hat.
// Where they stand: marks on the stage, [across, back] in tiles from the middle of its front edge (across: less is stage left, the
// audience's right; back: 0 at the footlights). Off stage: OL and OR, in the wings behind the proscenium.
// A beat: {w: who speaks, s: the words (in [brackets] how: ElevenLabs' tags), go: a mark they walk to as they start, f: who or where they
// face ('out': the audience), a: a move (12-walker-rig's: wave, crouch, fall, block)}; {do: [[who, 'go', mark], [who, 'face', at],
// [who, 'a', move], [who, 'enter', from, to], [who, 'exit', to]]} stage business between lines; {x: a sound, over: true if the next line
// starts with it}; {p: seconds of quiet}; {hound: 'enter'|'leap'|'flee', ...} the hound's part (47-playhouse-3-hound).
// =====================================================================================
const PLAY={title:'THE HOUND OF THE BASKERVILLES',
  marks:{DL:[-3,.5],DC:[0,.5],DR:[3,.5],L:[-3,1.8],C:[0,1.8],R:[3,1.8],UL:[-3,3.1],UC:[0,3.1],UR:[3,3.1],OL:[-5.3,1.9],OR:[5.3,1.9],
    CHAIRL:[-2.2,1.5],CHAIRR:[1.6,1.5],WINDOW:[3.4,2.6],FIRE:[-.4,2.5],TOR:[.6,3.1],ROCK:[-2.4,.8],MIRE:[-4.1,3],PATH:[3.2,2.4]},
  cast:{
    holmes:{name:'Sherlock Holmes',voice:'onwK4e9ZLuTAKqWW03F9',look:{shirt:'#3a3d44',pants:'#2b2c31',hair:'#1e1a18',skin:'#e2c2ac',shoes:'#221a14'},hat:'deerstalker',hatC:'#7a6a50'},
    watson:{name:'Dr. Watson',voice:'JBFqnCBsd6RMkjVDRZzb',look:{shirt:'#6a5440',pants:'#4a3e34',hair:'#6e5236',skin:'#e6c4b0',shoes:'#3a2a1c'},hat:'bowler',hatC:'#25211e'},
    mortimer:{name:'Dr. Mortimer',voice:'Zlb1dXrM653N07WRdFW3',look:{shirt:'#2c3a32',pants:'#3c3c3a',hair:'#8a7a62',skin:'#eccab6',shoes:'#2a2420'},hat:'top',hatC:'#1c1c1e'},
    henry:{name:'Sir Henry Baskerville',voice:'TX3LPaxmHKxFdv7VOQHJ',look:{shirt:'#8a6a3e',pants:'#5a4630',hair:'#a0682c',skin:'#e8c0a0',shoes:'#4a3020'},hat:'wide',hatC:'#5a4a36'},
    stapleton:{name:'Jack Stapleton',voice:'N2lVS1w4EtoT3dr4eOWO',look:{shirt:'#7a7a5a',pants:'#5e5a46',hair:'#c4a870',skin:'#e4c2a8',shoes:'#4a3c2a'},hat:'straw',hatC:'#d8c48a'},
    barrymore:{name:'Barrymore',voice:'CYw3kZ02Hs0563khs1Fj',look:{shirt:'#141416',pants:'#141416',hair:'#2a2420',skin:'#d8b8a0',shoes:'#0c0c0c'},hat:null}},
  // the sounds (ElevenLabs' sound effects, made from these words: [what, seconds])
  sounds:{bell:['a small brass theatre bell rung three times in an old playhouse lobby',3],
    overture:['a mysterious Victorian overture, solo violin and low cello, gothic and slow, a quiet theatre',14],
    fire:['a coal fire crackling softly in a Victorian sitting room grate',20], clock:['a slow mantel clock ticking in a quiet room',12],
    knock:['three firm knocks on a heavy wooden door',2], street:['a horse and carriage passing on cobbles outside a window, distant London street',8],
    reading:['a low ominous drone under a spoken legend, faint distant wind',14], howlfar:['a single long hound howl far away across an open moor at night, echoing',6],
    sting:['a sharp dramatic solo violin sting, suspense',3], violin:['a melancholy solo violin phrase, Victorian, played in a room',8],
    wind:['bleak wind moaning over an open moor at night, gusts in the heather',22], hallwind:['wind moaning outside an old stone manor, a draughty hall, a clock far off',20],
    sob:['a woman quietly sobbing far away down a stone corridor at night',5], door:['a heavy old oak door creaking shut, echoing hall',3],
    mire:['thick bog mud bubbling and sucking, a pony crying out as it sinks',6], owl:['an owl hooting twice on a moor at night',3],
    fog:['eerie still night air on a foggy moor, very quiet wind, distant water dripping',20], paws:['a huge dog running fast over heather and stones, panting',3],
    snarl:['a huge hound snarling and baying savagely, close, terrifying',4], howlnear:['a huge hound howling in pain and fury, very close',4],
    splash:['a heavy animal plunging into deep bog mud, thrashing, then bubbling and silence',5]},
  scenes:[
    {name:'221B Baker Street',set:'baker',lt:'warm',bed:['fire','clock'],cast:{holmes:'WINDOW',watson:'CHAIRL'},face:{holmes:'R',watson:'C'},beats:[
      {x:'street',over:true},
      {w:'watson',s:'Holmes, our visitor of last night forgot his walking stick. What do you make of it?',a:'wave'},
      {w:'holmes',s:'[amused] How did you know what I was doing? I believe you have eyes in the back of your head.',f:'watson'},
      {w:'watson',s:'I have, at least, a well-polished coffee pot in front of me.'},
      {w:'holmes',s:'Then tell me, Watson. What do you read in our visitor\'s stick?',go:'C'},
      {w:'watson',s:'An elderly country doctor. Well esteemed. One who walks a great deal.',f:'holmes'},
      {w:'holmes',s:'[laughs softly] Splendid, Watson. Wrong in almost every particular! A young man, amiable, unambitious, absent-minded, and the owner of a favourite dog. Larger than a terrier, and smaller than a mastiff.',a:'wave',f:'out'},
      {x:'knock'},
      {w:'holmes',s:'And here, unless I am mistaken, is the man himself.',f:'OR'},
      {do:[['mortimer','enter','OR','R']]},
      {w:'mortimer',s:'Mr. Sherlock Holmes? Doctor James Mortimer. I have come about a death on Dartmoor. And about a legend.',f:'holmes'},
      {w:'holmes',s:'Pray, sit down, Doctor. Watson, the lamp.',go:'CHAIRR',f:'mortimer'},
      {do:[['watson','go','FIRE']]},
      {x:'reading',over:true},
      {w:'mortimer',s:'[reading slowly, low] Know then, that in the time of the Great Rebellion, Hugo Baskerville, a wild and godless man, hunted a maiden across the moor by night. And there stood over him a foul thing. A great black beast, shaped like a hound, yet larger than any hound that ever mortal eye has rested upon.',go:'C',f:'out'},
      {x:'howlfar',over:true},
      {w:'mortimer',s:'Three weeks ago, Sir Charles Baskerville was found dead at the end of the yew alley. There was no mark upon him. But his face. His face was twisted with terror.'},
      {w:'watson',s:'[quietly] Good heavens.',f:'mortimer'},
      {w:'mortimer',s:'There were footprints near the body, Mr. Holmes.',f:'holmes'},
      {w:'holmes',s:'A man\'s, or a woman\'s?',f:'mortimer'},
      {w:'mortimer',s:'[whispers] Mr. Holmes. They were the footprints of a gigantic hound!',a:'wave'},
      {x:'sting'},{p:1.2}]},
    {name:'Baskerville Hall',set:'hall',lt:'hall',bed:['hallwind'],cast:{henry:'UL',watson:'L',barrymore:'UR'},face:{henry:'C',watson:'C',barrymore:'henry'},beats:[
      {x:'door'},
      {w:'barrymore',s:'[gravely] Welcome to Baskerville Hall, Sir Henry. Dinner is laid in the hall, sir.',go:'R'},
      {w:'henry',s:'Some welcome. It\'s not a cheerful place, is it, Barrymore? I don\'t wonder my uncle got a little jumpy, living here alone.',go:'C',f:'barrymore'},
      {w:'watson',s:'Mr. Holmes has sent me to see that you are never left alone, Sir Henry. Especially after dark.',f:'henry'},
      {w:'henry',s:'[laughs] A ghost dog! I\'ve lived in the West, Doctor Watson. I\'ve heard wolves at night. I\'ll not be frightened off by a story.',f:'watson',a:'wave'},
      {x:'sob'},
      {w:'watson',s:'[hushed] Listen. Did you hear that? A woman, crying.',f:'UR'},
      {w:'henry',s:'Barrymore. Who is that?',f:'barrymore'},
      {w:'barrymore',s:'[hesitating] There are only two women in the house, sir. The scullery maid sleeps in the far wing, and my wife. And I can answer for it, sir, it was not my wife.',f:'henry'},
      {w:'henry',s:'Then who?'},
      {w:'barrymore',s:'[uneasy] The wind, sir. The wind on the moor does strange things. Good night, sir.',f:'out'},
      {do:[['barrymore','exit','OR']]},
      {w:'watson',s:'[quietly, to himself] It was not the wind.',go:'DC',f:'out'},
      {x:'howlfar'},{p:1}]},
    {name:'The Moor at Dusk',set:'moor',lt:'dusk',bed:['wind'],cast:{watson:'DL'},face:{watson:'R'},beats:[
      {do:[['watson','go','L']]},{p:1.5},
      {do:[['stapleton','enter','OR','R']]},
      {w:'stapleton',s:'[cheerfully] Doctor Watson! Forgive the liberty. Stapleton, of Merripit House. I chase butterflies on the moor.',f:'watson',a:'wave'},
      {w:'watson',s:'A lonely place for it.',f:'stapleton'},
      {w:'stapleton',s:'A wonderful place! But take care where you walk, Doctor. That bright green patch is the great Grimpen Mire. A false step there means death, to man or beast.',go:'C',f:'MIRE'},
      {x:'mire'},
      {w:'stapleton',s:'[softly] There. A moor pony. Two in a week. The Mire has them, and it does not let go.'},
      {x:'howlfar',over:true},
      {w:'watson',s:'[uneasy] What on earth is that?',f:'UL'},
      {w:'stapleton',s:'[lightly] The peasants say it is the Hound of the Baskervilles, calling for its prey.',f:'watson'},
      {w:'watson',s:'And you, a man of science, believe that?'},
      {w:'stapleton',s:'[smiling] I believe in getting home before dark, Doctor. Good evening.',f:'out'},
      {do:[['stapleton','exit','OR']]},{p:1.2},
      {do:[['holmes','enter','OL','TOR']]},
      {w:'holmes',s:'It is a lovely evening, my dear Watson.',f:'watson'},
      {w:'watson',s:'[startled] Holmes! You, here? I thought you were in London!',f:'holmes',a:'block'},
      {w:'holmes',s:'That was what I wished you to think. Our naturalist is no stranger to that hound, Watson. Tonight we set a trap. And Sir Henry, I am afraid, must be the bait.',go:'C',f:'out'},
      {x:'sting'},{p:1}]},
    {name:'The Moor at Night',set:'fog',lt:'night',bed:['fog','wind'],cast:{holmes:'ROCK',watson:'L'},face:{holmes:'R',watson:'R'},beats:[
      {do:[['holmes','a','crouch'],['watson','go','DL']]},
      {w:'holmes',s:'[whispers] Keep down. Sir Henry leaves Merripit House at ten. He must cross the moor alone.',f:'watson'},
      {w:'watson',s:'[whispers] The fog, Holmes. It is rolling in from the Mire.',f:'R'},
      {w:'holmes',s:'[whispers, tense] The one thing on earth that could have spoiled my plans.',f:'R'},
      {x:'owl'},
      {do:[['henry','enter','OR','PATH']]},{p:1.5},
      {do:[['henry','go','C']]},
      {x:'paws',over:true},{hound:'enter',from:'OR'},
      {x:'snarl',over:true},{hound:'leap',at:'henry'},
      {w:'henry',s:'[screams] Holmes! Watson! Help me!',a:'fall'},
      {w:'holmes',s:'[shouting] Now, Watson! The lantern!',go:'R',a:'block'},
      {do:[['watson','go','C']]},
      {x:'howlnear',over:true},{hound:'flee',to:'MIRE'},
      {x:'splash'},
      {w:'watson',s:'[breathless] It is gone. Into the Mire!',f:'MIRE'},
      {w:'holmes',s:'Did you see its jaws, Watson? Phosphorus. A cunning preparation. It was a living dog, painted to look like a fiend from hell.',f:'watson'},
      {w:'henry',s:'[shaken] Then who? Who would do such a thing?',go:'C',f:'holmes'},
      {w:'holmes',s:'Stapleton. A Baskerville himself, Sir Henry, hidden under another name, and next in line for your fortune. He has fled into the fog. The Mire will judge him now.',f:'out'},
      {x:'mire'},{p:1}]},
    {name:'221B Baker Street, Evening',set:'baker',lt:'evening',bed:['fire','clock'],cast:{holmes:'CHAIRR',watson:'CHAIRL'},face:{holmes:'out',watson:'holmes'},beats:[
      {w:'watson',s:'A dreadful business, Holmes. And yet you saw it all from the first.'},
      {w:'holmes',s:'[warmly] The world is full of obvious things, Watson, which nobody by any chance ever observes.',f:'watson'},
      {w:'holmes',s:'Come. Dinner, I think. And afterwards, a little music.',go:'WINDOW',f:'out'},
      {x:'violin'},{p:.5}]}]};
````

### 9.2 Old game: src/47-playhouse-1-times.data.js

The generated timetable.

````js
// DATA ONLY: the play's times (tools/playhouse-audio.mjs makes it from the script and the voices; never edited by hand)
const PLAYT={"walk":1.5,"open":3,"close":3,"scenes":[{"S":12,"E":131.06},{"S":137.56,"E":211.23},{"S":217.73,"E":314.13},{"S":320.63,"E":410.51},{"S":417.01,"E":444.56}],"beats":[[15,0,0],[15.5,0,1],[20.99,0,2],[25.92,0,3],[29.65,0,4],[34.1,0,5],[39.83,0,6],[56.68,0,7],[58.88,0,8],[63.41,0,9],[65.24,0,10],[73.29,0,11],[76.78,0,12],[78.46,0,13],[78.96,0,14],[99.33,0,15],[99.83,0,16],[111.56,0,17],[113.69,0,18],[116.78,0,19],[119.55,0,20],[126.16,0,21],[129.36,0,22],[140.56,1,0],[143.76,1,1],[149.25,1,2],[156.26,1,3],[162.23,1,4],[170.04,1,5],[175.24,1,6],[180.89,1,7],[183.74,1,8],[193.15,1,9],[194.32,1,10],[200.05,1,11],[201.88,1,12],[203.53,1,13],[209.73,1,14],[220.73,2,0],[221.9,2,1],[223.4,2,2],[225.23,2,3],[233.12,2,4],[235.41,2,5],[250.18,2,6],[256.38,2,7],[264.19,2,8],[264.69,2,9],[266.82,2,10],[271.99,2,11],[275.16,2,12],[280.49,2,13],[284.33,2,14],[285.53,2,15],[289.84,2,16],[292.53,2,17],[296.5,2,18],[309.43,2,19],[312.63,2,20],[323.63,3,0],[324.93,3,1],[332.58,3,2],[336.31,3,3],[340.52,3,4],[343.72,3,5],[345.46,3,6],[346.96,3,7],[349.43,3,8],[349.93,3,9],[352.13,3,10],[352.63,3,11],[353.73,3,12],[358.1,3,13],[360.71,3,14],[363.19,3,15],[363.69,3,16],[366.29,3,17],[371.49,3,18],[374.34,3,19],[383.91,3,20],[387.16,3,21],[402.81,3,22],[409.01,3,23],[420.01,4,0],[424.3,4,1],[430.59,4,2],[435.36,4,3],[443.56,4,4]],"lines":[[15.5,5.04,0,1],[20.99,4.48,0,2],[25.92,3.28,0,3],[29.65,4,0,4],[34.1,5.28,0,5],[39.83,16.4,0,6],[58.88,4.08,0,8],[65.24,7.6,0,10],[73.29,3.04,0,11],[78.96,19.92,0,14],[99.83,11.28,0,16],[111.56,1.68,0,17],[113.69,2.64,0,18],[116.78,2.32,0,19],[119.55,6.16,0,20],[143.76,5.04,1,1],[149.25,6.56,1,2],[156.26,5.52,1,3],[162.23,7.36,1,4],[175.24,5.2,1,6],[180.89,2.4,1,7],[183.74,8.96,1,8],[193.15,0.72,1,9],[194.32,5.28,1,10],[201.88,1.2,1,12],[225.23,7.44,2,3],[233.12,1.84,2,4],[235.41,14.32,2,5],[256.38,7.36,2,7],[264.69,1.68,2,9],[266.82,4.72,2,10],[271.99,2.72,2,11],[275.16,4.88,2,12],[289.84,2.24,2,16],[292.53,3.52,2,17],[296.5,12.48,2,18],[324.93,7.2,3,1],[332.58,3.28,3,2],[336.31,3.76,3,3],[353.73,3.92,3,12],[358.1,2.16,3,13],[371.49,2.4,3,18],[374.34,9.12,3,19],[383.91,2.8,3,20],[387.16,15.2,3,21],[420.01,3.84,4,0],[424.3,5.84,4,1],[430.59,4.32,4,2]],"sounds":[{"k":"bell","at":0,"vol":0.7},{"k":"overture","at":2.5,"vol":0.55},{"k":"street","at":15,"vol":0.35},{"k":"knock","at":56.68,"vol":0.8},{"k":"reading","at":78.46,"vol":0.4},{"k":"howlfar","at":99.33,"vol":0.55},{"k":"sting","at":126.16,"vol":0.6},{"k":"fire","at":10.5,"vol":0.22,"bed":1,"until":134.06},{"k":"clock","at":10.5,"vol":0.12,"bed":1,"until":134.06},{"k":"door","at":140.56,"vol":0.7},{"k":"sob","at":170.04,"vol":0.45},{"k":"howlfar","at":203.53,"vol":0.55},{"k":"hallwind","at":136.06,"vol":0.26,"bed":1,"until":214.23},{"k":"mire","at":250.18,"vol":0.6},{"k":"howlfar","at":264.19,"vol":0.55},{"k":"sting","at":309.43,"vol":0.6},{"k":"wind","at":216.23,"vol":0.3,"bed":1,"until":317.13},{"k":"owl","at":340.52,"vol":0.5},{"k":"paws","at":349.43,"vol":0.8},{"k":"snarl","at":352.13,"vol":0.95},{"k":"howlnear","at":363.19,"vol":0.9},{"k":"splash","at":366.29,"vol":0.8},{"k":"mire","at":402.81,"vol":0.6},{"k":"fog","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"wind","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"violin","at":435.36,"vol":0.6},{"k":"fire","at":415.51,"vol":0.22,"bed":1,"until":447.56},{"k":"clock","at":415.51,"vol":0.12,"bed":1,"until":447.56}],"call":{"S":450.06,"bow":[454.06,456.56],"E":459.56},"len":464.56};
````

### 9.3 Old game: src/47-playhouse-2-show.js

The show.

````js
// =====================================================================================
// THE SHOW (owner, 14 Oct 2026: "a small play theater where you can watch plays", "npcs with new walker real physics engine", "make it
// really atmospheric"; then "the play start when you sit", for everyone in the room): THE HOUND OF THE BASKERVILLES (the script:
// 47-playhouse-1-script; its times: -1-times) played in the playhouse (26-z-the-playhouse) from the moment someone sits in its seats
// (47-sit), the same moment for everyone: the room (worker/room.js) keeps when it began and tells everyone, and whoever comes in later
// joins it where it's got to (offline, it's your own). Everything is worked out from how far into the show it is (plState), never kept:
// the house lights going down, the stage lit only by its candles (no curtain, no stage lights: owner, 14 Oct 2026; between scenes the
// candles dim to a glimmer, and the scenery is swapped in the dark, 47-playhouse-3-sets), the players (the jointed walker, 12-walker-rig, each in their costume's colours and hat, walking to their marks, turning to who
// they speak to, their moves), the hound, the fog rolling across the moor, and the sound: one track (audio/hound.mp3, the voices and
// sounds made with ElevenLabs: tools/playhouse-audio.mjs) played at the show's moment, through the room's echo, dull through the walls
// outside. Drawn among the things that move over the world (PLAYDRAW, 45); only near the playhouse.
// =====================================================================================
var PLAYDRAW=null;
const PLL=PLAYT.len, plEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
// how far into the show it is (seconds), or -1 with none on. PLSHOW.t0: when it began (this page's clock); sat: whether you were sat
// in the house last frame (sitting down starts it: plStart)
const PLSHOW={t0:null,sat:false};
function plClock(){ if(window.PLAYAT!=null)return {t:+window.PLAYAT,next:0};   // (the checks: a moment of the show)
  if(PLSHOW.t0==null)return {t:-1,next:0}; const t=(performance.now()-PLSHOW.t0)/1000; return {t:t<PLL?t:-1,next:0}; }
// someone sat down: the show starts if none is on. Online the room starts it, for everyone (it answers with when: plShowGot); offline, yours
function plStart(){ if(plClock().t>=0)return; const ws=ONLINE.ws; if(ws&&ONLINE.state==='in'&&ws.readyState===1)ws.send(JSON.stringify({t:'show',len:PLL})); else PLSHOW.t0=performance.now(); }
// the admin world tab's 'restart the playhouse play' (owner, 14 Oct 2026): from the top, for everyone in the room (offline, yours)
function plRestart(){ const ws=ONLINE.ws; if(ws&&ONLINE.state==='in'&&ws.readyState===1)ws.send(JSON.stringify({t:'show',len:PLL,restart:1})); else PLSHOW.t0=performance.now(); }
{ const b=document.getElementById('plre'); if(b)b.onclick=()=>plRestart(); }
function plShowGot(m){ if(Number.isFinite(m.at)&&Number.isFinite(m.now))PLSHOW.t0=performance.now()-(m.now-m.at); }   // (from the room: 48-online)
// ---- THE SCRIPT AS MOVES IN TIME: for each scene, each player's way across the stage ([t0, t1, from, to]), when they come on and go
// off, who or where they face from when, their moves; the hound's runs and its leap
const plAt=m=>plMark(PLAY.marks[m]);
const PLTR=PLAY.scenes.map((sc,si)=>{ const A={}, pos={}, H=[], get=w=>A[w]||(A[w]={walks:[],faces:[],acts:[],talk:[],in:-1e9,out:1e9,p0:null});
  for(const [w,m] of Object.entries(sc.cast)){ const a=get(w); pos[w]=plAt(m); a.p0=pos[w].slice(); a.faces.push([-1e9,(sc.face||{})[w]||'out']); }
  const walk=(w,to,t)=>{ const a=get(w), p=pos[w], q=plAt(to), d=Math.hypot(q[0]-p[0],q[1]-p[1]); if(d<.01)return t; const t1=t+d/PLAYT.walk; a.walks.push([t,t1,p[0],p[1],q[0],q[1]]); a.faces.push([t1,{dir:[q[0]-p[0],q[1]-p[1]]}]); pos[w]=q; return t1; };
  const dur=new Map(PLAYT.lines.filter(l=>l[2]===si).map(l=>[l[3],l[1]]));
  for(const [t0,s,bi] of PLAYT.beats){ if(s!==si)continue; const b=sc.beats[bi];
    if(b.w){ const a=get(b.w); const te=b.go?walk(b.w,b.go,t0):t0; if(b.f)a.faces.push([te,b.f]); if(b.a)a.acts.push([t0+.3,b.a]); a.talk.push([t0,t0+(dur.get(bi)||1)]); }
    if(b.do)for(const [w,what,m1,m2] of b.do){ const a=get(w);
      if(what==='go')walk(w,m1,t0); else if(what==='face')a.faces.push([t0,m1]); else if(what==='a')a.acts.push([t0,m1]);
      else if(what==='enter'){ a.in=t0; pos[w]=plAt(m1); a.p0=pos[w].slice(); walk(w,m2,t0); }
      else if(what==='exit')a.out=walk(w,m1,t0); }
    if(b.hound==='enter'){ const p=plAt(b.from), q=pos.henry, d=Math.hypot(q[0]-p[0],q[1]-p[1]), k=Math.max(0,(d-1.3)/d); H.push([t0,t0+2.2,p[0],p[1],p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,0]); }
    if(b.hound==='leap'){ const p=H[H.length-1], q=pos.henry; H.push([t0,t0+1.1,p[4],p[5],q[0]+.45,q[1]-.15,1]); }
    if(b.hound==='flee'){ const p=H[H.length-1], q=plAt(b.to), r=plAt('OL'); H.push([t0,t0+1.9,p[4],p[5],q[0],q[1],0],[t0+1.9,t0+2.6,q[0],q[1],r[0],r[1]+1,0]); } }
  for(const a of Object.values(A)){ a.faces.sort((p,q)=>p[0]-q[0]); }
  return {A,H}; });
// the curtain call: the whole cast in a line across the front, facing out
const PLCALL=(()=>{ const ws=['stapleton','mortimer','watson','holmes','henry','barrymore'], A={};
  ws.forEach((w,i)=>{ const x=PLMID+(i-2.5)*1.45, y=PLS.CY+1.1; A[w]={walks:[],faces:[[-1e9,'out']],acts:PLAYT.call.bow.map(t=>[t,'crouch']),talk:[],in:-1e9,out:1e9,p0:[x,y]}; }); return {A,H:[]}; })();
// a player at time t: where, walking or not, facing (a world direction), or null if off stage
function plPos(a,t){ if(t<a.in||t>a.out)return null; let x=a.p0[0], y=a.p0[1], mv=null;
  for(const w of a.walks){ if(t<w[0])break; if(t>=w[1]){ x=w[4]; y=w[5]; continue; } const k=(t-w[0])/(w[1]-w[0]); x=w[2]+(w[4]-w[2])*k; y=w[3]+(w[5]-w[3])*k; mv=[w[4]-w[2],w[5]-w[3]]; break; }
  return {x,y,mv}; }
function plPlayer(a,t,TR){ const p=plPos(a,t); if(!p)return null; const {x,y,mv}=p;
  let f=null; for(const e of a.faces)if(e[0]<=t)f=e[1];
  const at=typeof f==='string'&&f!=='out'?(TR.A[f]?plPos(TR.A[f],t):PLAY.marks[f]?(m=>({x:m[0],y:m[1]}))(plAt(f)):null):null;   // (who they face: where that one is, not where they face: two facing each other)
  const dir=mv||(f&&f.dir)||(at?[at.x-x,at.y-y]:[0,-1]);
  return {x,y,walking:!!mv,dir}; }
// ---- THE STATE OF THE SHOW at t: which scene (or the call), how far it's up (c: 0 dark, 1 lit: the candles), the scenery, the lights' cue
function plState(t){ const SC=PLAYT.scenes, C=PLAYT.call, cur=(S,E)=>t<S?0:t<S+PLAYT.open?plEase((t-S)/PLAYT.open):t<E?1:plEase(1-(t-E)/PLAYT.close);
  if(t<0||t>=PLL)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:'house'};
  for(let i=0;i<SC.length;i++){ const {S,E}=SC[i]; if(t>=S&&t<E+PLAYT.close)return {si:i,c:cur(S,E),set:PLAY.scenes[i].set,lt:PLAY.scenes[i].lt}; }
  if(t>=C.S&&t<C.E+PLAYT.close)return {si:-2,c:cur(C.S,C.E),set:PLAY.scenes[SC.length-1].set,lt:'call'};
  if(t<SC[0].S)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:t<SC[0].S-6?'house':'preshow'};
  if(t>=C.E+PLAYT.close)return {si:-1,c:0,set:PLAY.scenes[SC.length-1].set,lt:'house'};
  let n=SC.findIndex(s=>s.S>t); return {si:-1,c:0,set:PLAY.scenes[n<0?SC.length-1:n].set,lt:'between'}; }
// ---- THE LIGHTS (made last of all the lights, so every other keeps its number, 42): the house's three over the seats and the lobby's;
// the small wall lights left and right along the house; on the stage only its candles (owner, 14 Oct 2026: "lights off on stage", "a few
// candles on stage": PLCANDLES, 26-z) and the scene's own (the fire, the candelabra: where its set has them); outside, the canopy's
// downlights and the board's glow at night. Each cue is a colour for each (PLCUE); a change fades over a second and a half in a few
// steps (each one relights the room: vary, 42). Between scenes, and as one opens and closes, the candles go down to a glimmer and the
// scene's own out (lv: how far up, in quarters: no fade, a step each)
const PLL_={}; { const B=PLB, n=LAMPS.length, inn={own:1,day:true,vary:true,in:[B.x0,B.y0,B.x1,B.y1]}, L=(k,x,y,z,r,o=inn)=>{ const l={x,y,z,r,c:[0,0,0],...o,pl:k}; LAMPS.push(l); (PLL_[k]=PLL_[k]||[]).push(l); };
  L('house',PLMID-2.4,-53.5,110,7); L('house',PLMID+2.4,-53.5,110,7); L('house',PLMID,-50.5,110,6); L('lobby',PLMID,-57.2,90,4.5);
  for(const x of [B.x0+T+.35,B.x1-T-.35])for(const y of PLWALLS)L('wall',x,y,68,3.2);
  for(const [x,y,h] of PLCANDLES)L('candle',x,y,PLS.SZ+h+3,3.6); L('prac',PLMID-.4,-42.9,30,3.4);
  const fr={own:1,vary:true}; L('front',PLMID-1.3,B.y0-.9,74,4,fr); L('front',PLMID+1.3,B.y0-.9,74,4,fr); L('front',PLMID,B.y0-.6,100,3.6,fr);
  for(const l of LAMPS.slice(n)){ l.kind=LKIND(l); l.base={r:l.r,z:l.z,c:l.c}; } applyLights(); }
const W_=[1,.86,.62], LOB=[.15,.12,.08], WL=[.32,.21,.1], PLCUE={house:{house:W_,lobby:W_,wall:[.8,.52,.26],candle:[.9,.6,.28]},preshow:{house:[.3,.26,.2],lobby:[.6,.5,.36],wall:[.6,.4,.2],candle:[1,.66,.3]},
  warm:{lobby:LOB,wall:WL,candle:[1.2,.78,.36],prac:[1.2,.6,.24]},hall:{lobby:LOB,wall:WL,candle:[1,.64,.28],prac:[.7,.48,.22]},dusk:{lobby:LOB,wall:WL,candle:[.95,.6,.28]},
  night:{lobby:LOB,wall:WL,candle:[.8,.5,.24]},evening:{lobby:LOB,wall:WL,candle:[1,.64,.3],prac:[1.3,.66,.26]},between:{lobby:LOB,wall:WL,candle:[.18,.12,.06]},
  call:{house:[.4,.34,.25],lobby:LOB,wall:[.6,.4,.2],candle:[1.2,.8,.38]}};
const PLPRAC={baker:[PLMID-.4,-42.75,30],hall:[PLMID-.2,PLS.CY+.5+2.6,62],moor:null,fog:null};
const PLLT={cue:null,from:null,to:null,t0:0,step:-1,set:null,lv:1,nightOut:-1};
function plLights(cue,set,now,lv=1){ const L=PLLT;
  if(cue!==L.cue||set!==L.set||lv!==L.lv){ const fade=cue!==L.cue||set!==L.set; L.from=fade?L.to:null; L.cue=cue; L.set=set; L.lv=lv; L.t0=now; L.step=-1; L.to={};
    for(const k in PLL_){ const c=PLCUE[cue][k]||[0,0,0], m=k==='candle'?.15+.85*lv:k==='prac'?lv:1; L.to[k]=k==='front'?null:(k==='prac'&&!PLPRAC[set]?[0,0,0]:c.map(v=>v*m)); }
    const p=PLPRAC[set]; if(p)for(const l of PLL_.prac){ l.x=p[0]; l.y=p[1]; l.z=l.base.z=p[2]; } }
  const k=Math.min(1,(now-L.t0)/1500), step=L.from?Math.round(k*5):5; if(step===L.step)return; L.step=step;
  for(const g in PLL_){ if(g==='front')continue; const a=L.from&&L.from[g]||L.to[g], b=L.to[g]; for(const l of PLL_[g]){ l.c=l.base.c=a.map((v,i)=>+(v+(b[i]-v)*step/5).toFixed(3)); } }
  dirty=true; }
// the front's lights: on as the street lamps are (their photocell, 42), the board warmer
function plFrontLights(){ const on=(SKYNOW&&SKYNOW.lamp||0)>.05?1:0; if(on===PLLT.nightOut)return; PLLT.nightOut=on; PLL_.front.forEach((l,i)=>{ l.c=l.base.c=on?(i<2?[1.1,.9,.62]:[1.2,.8,.4]):[0,0,0]; }); dirty=true; }
// ---- THE SCENERY ON THE STAGE: a room of fixed things (47-physics-3's way: lit, drawn when they change), its things the scene's set
const PLPHY={bld:'lplay',x0:PLS.x0,x1:PLS.x1,y0:PLS.SY,y1:PLS.back,near:16,on:false,away:true,bodies:[],hang:[],fix:[],st:[],acc:0,t:0,env:null,envAt:-1e9,night:1,stamp:0,bounce:[.1,.1,.11],
  sets:{},set:null,build:()=>{ PLPHY.envAt=-1e9; PLPHY.envK=null; PLPHY.stamp++; },name:'the playhouse\'s'};
PHYROOMS.push(PLPHY);
function plSetOn(set,hound){ const R=PLPHY, f=R.sets[set]||(R.sets[set]=PLSETS[set]()), want=hound?[...f,PLHOUND]:f; if(R.set===set&&R.fix.length===want.length)return; R.set=set; R.fix=want; for(const b of want)b.litV=-1; R.envAt=-1e9; dirty=true; }
// ---- THE CANDLES' FLAMES (the candles: 26-z): each a flame of a few pixels that leans and flickers on its own, a tiny picture of its own
// painted again about eight times a second (unlit: they're the light)
const PLFL=PLCANDLES.map(()=>({cv:null,n:0,f:-1}));
function plFlames(t){ const out=[]; PLCANDLES.forEach(([x,y,h],i)=>{ const F=PLFL[i], f=Math.floor(t*8+i*3);
  if(f!==F.f){ F.f=f; F.n++; const cv=F.cv||(F.cv=Object.assign(document.createElement('canvas'),{width:5,height:9})), g=cv.getContext('2d'), im=g.createImageData(5,9), d=im.data;
    const tall=6+Math.floor(hash(f,i,931)*3), lean=hash(f,i,937)<.25?-1:hash(f,i,937)>.75?1:0;
    for(let r=0;r<tall;r++){ const yy=8-r, k=r/tall, w=k<.3?1:k<.7?1:0, cx=2+(k>.5?lean:0);
      for(let c=cx-w;c<=cx+w;c++){ if(c<0||c>4)continue; if(w&&c!==cx&&k>.6)continue; const col=r<2?[255,250,220]:k<.55?[255,214,110]:[240,140,50], j=(yy*5+c)*4; d[j]=col[0]; d[j+1]=col[1]; d[j+2]=col[2]; d[j+3]=255; } }
    g.putImageData(im,0,0); }
  const [sx,sy]=toS(...vw(x,y)), X=Math.round(sx)-2, Y=Math.round(sy-PLS.SZ-h)-9, [u,v]=vw(x,y);
  out.push({n:'flame',cv:F.cv,key:'pfl'+i+F.n,u,v,u0:u-.04,v0:v-.04,u1:u+.04,v1:v+.04,box:[X,Y,X+5,Y+9]}); }); return out; }
// ---- THE FOG on the moor (the fourth scene): banks of it across the stage, low on the boards, drifting with the night's air, thick and
// thin in a noise; dithered (pixel art), lit by the stage's light; painted ten times a second while it's out
const PLFOG=[{y:PLS.CY+.9},{y:PLS.CY+2.4},{y:PLS.CY+3.7}];
const plNoise=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j, s=t=>t*t*(3-2*t), h=(a,b)=>hash(a,b,613), a=h(i,j)+(h(i+1,j)-h(i,j))*s(fx), b=h(i,j+1)+(h(i+1,j+1)-h(i,j+1))*s(fx); return a+(b-a)*s(fy); };
function plFog(t,thick,env,now){ const out=[]; if(thick<=0)return out; const S=PLS, x0=S.PRX0+.2, x1=S.PRX1-.2, H=40, B=[[0,0,1,0],[2,3,0,1]]; let one=false;   // (one bank painted a frame, each still ten times a second: the three in turn, not all in one frame)
  for(let f=0;f<PLFOG.length;f++){ const F=PLFOG[f], y=F.y;
    if(!F.Lat||now-F.Lat>700){ F.Lat=now; F.L=env?lightAt(env,PLMID,y,(S.SZ+20)/24,null).map(v=>Math.max(v,.12)):[1,1,1]; }
    const pts=[[x0,S.SZ],[x1,S.SZ],[x0,S.SZ+H],[x1,S.SZ+H]].map(([x,z])=>{ const [sx,sy]=toS(...vw(x,y)); return [sx,sy-z]; }), X0=Math.floor(Math.min(...pts.map(p=>p[0])))-1, Y0=Math.floor(Math.min(...pts.map(p=>p[1])))-1,
      X1=Math.ceil(Math.max(...pts.map(p=>p[0])))+1, Y1=Math.ceil(Math.max(...pts.map(p=>p[1])))+1;
    if(!F.at||F.rot!==ROT||now-F.at>100&&!one){ one=true; F.at=now; F.rot=ROT; F.n=(F.n||0)+1; const w=X1-X0, hh=Y1-Y0, cv=F.cv||(F.cv=document.createElement('canvas')); if(cv.width!==w||cv.height!==hh){ cv.width=w; cv.height=hh; F.im=null; }
      const g=cv.getContext('2d'), im=F.im||(F.im=g.createImageData(w,hh)), d=im.data, col=[176*F.L[0],190*F.L[1],204*F.L[2]].map(v=>Math.min(255,v)); d.fill(0);   // (its pixels kept, cleared: not a new picture's worth each time)
      for(let i=0,n=Math.ceil((x1-x0)*24);i<=n;i++){ const x=x0+(x1-x0)*i/n, [sx,sy]=toS(...vw(x,y)), c=Math.round(sx)-X0; if(c<0||c>=w)continue;
        for(let z=0;z<H;z++){ const r=Math.round(sy-S.SZ-z)-Y0; if(r<0||r>=hh)continue; const e=Math.min(1,(x-x0)/1.4,(x1-x)/1.4), q=(plNoise(x*.7+t*.14+f*7,z/14-t*.03+f*3)*.7+plNoise(x*2.2-t*.22+f*5,z/6+f)*.3)*1.6*e-.5-z/H*1.1+.25*thick;
          const lv=Math.max(0,Math.min(3,Math.floor(q*4*thick+B[r&1][c&3]/4))); if(!lv)continue; const j=(r*w+c)*4; d[j]=col[0]; d[j+1]=col[1]; d[j+2]=col[2]; d[j+3]=[0,46,88,130][lv]; } }
      g.putImageData(im,0,0); }
    const [ua,va]=vw(x0,y), [ub,vb]=vw(x1,y), [u,v]=vw(PLMID,y);
    out.push({n:'fog',cv:F.cv,key:'pf'+f+F.n,u,v,u0:Math.min(ua,ub),v0:Math.min(va,vb),u1:Math.max(ua,ub)+.05,v1:Math.max(va,vb)+.05,box:[X0,Y0,X1,Y1]}); }
  return out; }
// ---- THE PLAYERS: each the jointed walker (47-you-jointed's rig, its cloud of points shared), in their costume's colours, a hat over
// it, lit where they stand, their shadow under them; drawn again only while something of them moves (30 a second at most), as the
// other players online are (48-online's othRig)
const PLAYERS={}, PLKEY={wave:'V',crouch:'C',fall:'F',block:'B'};
// THE PLAYERS' OWN WALKER: the player's pieces (PH.cloud, 47-you-jointed) are the avatar model now (#587), so the players are baked from the
// rig themselves, as 221B's cast and the bar's people are (47-play-1-cast): once, 4 ms a frame, again when the rig changes (RIG.RIGGEN, the
// old drawn till then); finer through castCloud, as theirs (PCA #587: they had become the model, their costumes' colours gone)
const PLW={cloud:null,baker:null,gen:-1};
function plWalker(){ if(PLW.cloud&&PLW.gen===RIG.RIGGEN)return true; const t0=performance.now(); PLW.baker=PLW.baker||RIG.baker(.5,1);
  while(performance.now()-t0<4){ const x=PLW.baker.next(); if(x.done){ PLW.cloud=x.value; PLW.baker=null; PLW.gen=RIG.RIGGEN; PLW.res=null; break; } }
  if(PERF)PERF.add('the playhouse: its players baked (once)',performance.now()-t0); return !!PLW.cloud; }
function plHat(D,IW,AX0,AY0,B,hd,kind,col,r=1){ if(!kind)return; const p=RIG.project(B.J.headTop,hd), cx=Math.round(AX0+p[0]*r), top=Math.round(AY0+p[1]*r), c=[1,3,5].map(j=>parseInt(col.slice(j,j+2),16)), dk=c.map(v=>v*.6), lt=c.map(v=>Math.min(255,v*1.25));
  const px=(x,y,k)=>{ if(x<0||x>=IW||y<0)return; const i=(y*IW+x)*4; if(i+3>=D.length)return; D[i]=k[0]; D[i+1]=k[1]; D[i+2]=k[2]; D[i+3]=255; }, row=(y,a,b,k)=>{ for(let j=0;j<r;j++)for(let x=a*r;x<(b+1)*r;x++)px(cx+x,top+y*r+j,k); };   // (r: drawn finer, its pixels r of the picture's)
  // [brim's half width, crown's half width, crown's height]; the brim on the brow, four pixels under the top of the head, the crown over the hair
  const [bw,cw,chh]={top:[6,4,10],bowler:[6,4,6],deerstalker:[5,4,6],wide:[7,4,6],straw:[6,4,4]}[kind], by=4;
  row(by,-bw,bw,dk); for(let k=1;k<=chh;k++){ const y=by-k, r=kind==='bowler'&&k===chh?cw-1:kind==='deerstalker'&&k===chh?cw-1:cw; row(y,-r,r,k===chh?lt:kind==='deerstalker'&&(y+cx)%2?dk:c); }
  if(kind==='straw'||kind==='top')row(by-1,-cw,cw,kind==='straw'?[90,40,40]:[60,60,64]);
  if(kind==='deerstalker'){ row(by+1,-bw-1,-bw+1,dk); row(by+1,bw-1,bw+1,dk); } }
function plDrawPlayer(w,p,t,now,env,t0){ const C=PLAY.cast[w], R=PLAYERS[w]||(PLAYERS[w]={st:RIG.create(),hd:null,t:now,drawn:-1e9,n:0,im:null,cv:null,g:null,acted:t,held:null,Lat:-1e9,L:[1,1,1],key:''});
  const st=R.st, dt=Math.min(.25,(now-R.t)/1000), [u,v]=vwV(p.dir[0],p.dir[1]), want=Math.atan2(u-v,u+v); if(R.hd==null)R.hd=want;
  let dd=want-R.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); const hd0=R.hd; R.hd+=Math.max(-3*Math.PI*dt,Math.min(3*Math.PI*dt,dd));
  st.target=p.walking?1:0; st.runTarget=.57;
  for(const [ta,mv] of p.acts){ if(ta>R.acted&&ta<=t&&t-ta<1.5){ const k=PLKEY[mv]; if(k){ RIG.act(st,k); R.held=[k,mv==='crouch'?ta+2.4:ta+.8]; } } } R.acted=t;
  if(R.held&&t>R.held[1]){ RIG.release(st,R.held[0]); R.held=null; }
  if(now-R.Lat>400&&env){ R.Lat=now; R.L=lightAt(env,p.x,p.y,(PLS.SZ+30)/24,null).map(v=>Math.max(Math.round(v*16)/16,CHARMIN)); }
  const look=R.L.join()+'|'+DET+'|'+RIG.shade()+JSON.stringify(RIG.outline())+'|'+!!(PLW.res&&PLW.res[DET]&&PLW.res[DET].c), moving=!R.im||p.walking||st.w>1e-3||st.move||st.up||st.out||R.hd!==hd0||look!==R.key;
  if(moving&&plWalker()&&now-R.drawn>=33&&performance.now()-t0<4){ const r0=charRes(S), cl=r0>1?castCloud(PLW,r0):null, r=cl?r0:1, IW=112*r, IH=200*r, AX0=56*r, AY0=120*r; RIG.step(st,dt); R.drawn=now; R.key=look;   // (at the world's detail, as everyone: 47-you-jointed's charRes)
    if(!R.cv){ R.cv=document.createElement('canvas'); R.g=R.cv.getContext('2d'); } if(R.cv.width!==IW||R.cv.height!==IH){ R.cv.width=IW; R.cv.height=IH; R.im=R.g.createImageData(IW,IH); R.buf=new Uint32Array(R.im.data.buffer); } R.r=r; R.buf.fill(0);
    const B=RIG.pose(st,false), D=R.im.data; RIG.draw(B,cl||PLW.cloud,R.hd,R.buf,IW,IH,AX0,AY0,r,false,lookRamp(C.look)); plHat(D,IW,AX0,AY0,B,R.hd,C.hat,C.hatC||'#202020',r);
    for(let i=0;i<D.length;i+=4)if(D[i+3]){ D[i]*=R.L[0]; D[i+1]*=R.L[1]; D[i+2]*=R.L[2]; }
    for(let j=-2*r;j<=2*r;j++)for(let x=-9*r;x<=9*r;x++){ if(x*x/(81*r*r)+j*j/(4*r*r)>1)continue; const i=((AY0+j)*IW+AX0+x)*4; if(D[i+3])continue; D[i+3]=60; }
    R.g.putImageData(R.im,0,0); R.n++; }
  if(!moving||R.drawn===now)R.t=now;   // (still: nothing to do; waiting to be drawn: the time kept, so he steps all of it when he is)
  const [sx,sy]=toS(...vw(p.x,p.y)), X=Math.round(sx*S)/S-56, Y=Math.round((sy-PLS.SZ)*S)/S-120, [pu,pv]=vw(p.x,p.y);
  return R.cv?{n:'player',cv:R.cv,key:'pp'+w+R.n,K:R.r||1,u:pu,v:pv,u0:pu-.2,v0:pv-.2,u1:pu+.2,v1:pv+.2,box:[X,Y,X+112,Y+200]}:null; }
// ---- THE HOUND at t: running in, the leap at Sir Henry, away into the Mire
function plHoundAt(H,t){ if(!H.length||t<H[0][0]||t>=H[H.length-1][1])return null; let s=H[0]; for(const q of H)if(q[0]<=t)s=q;
  const run=t<s[1], k=run?(t-s[0])/(s[1]-s[0]):1, x=s[2]+(s[4]-s[2])*k, y=s[3]+(s[5]-s[3])*k, a=Math.atan2(s[5]-s[3],s[4]-s[2]);   // (between its leap and its flight it stands over him, snarling)
  return plHoundPose(x,y,a,run?(t*2.6)%1:.12+.03*Math.sin(t*9),s[6]&&run?Math.sin(k*Math.PI)*.7:0); }
// ---- THE SOUND: the show's track (a media element, so it streams rather than sits decoded in memory) through the room's echo (a
// convolver: a second and a half of a small hall's tail) to the game's sound; played only near the playhouse, kept to the show's moment
// (sought again if it drifts by more than a third of a second), dull and quiet outside its walls
const PLSND={el:null,g:null,lp:null,pan:null,failed:false};
function plSound(t,inside,d,sx){ const c=SND.ctx; if(!c||!SND.on||c.state!=='running'||PLSND.failed){ if(PLSND.el&&!PLSND.el.paused)PLSND.el.pause(); return; }
  const want=t>=0&&t<PLL&&d<18;
  if(!want){ if(PLSND.el&&!PLSND.el.paused){ PLSND.el.pause(); } return; }
  if(!PLSND.el){ const el=PLSND.el=new Audio('audio/hound.mp3'); el.preload='auto'; el.onerror=()=>{ PLSND.failed=true; };
    try{ const src=c.createMediaElementSource(el), g=PLSND.g=c.createGain(), lp=PLSND.lp=c.createBiquadFilter(), pan=PLSND.pan=c.createStereoPanner(), cv=c.createConvolver(), wet=c.createGain();
      const n=Math.floor(c.sampleRate*1.5), ir=c.createBuffer(2,n,c.sampleRate); for(let ch=0;ch<2;ch++){ const a=ir.getChannelData(ch); for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)*(i<c.sampleRate*.012?0:1); }
      cv.buffer=ir; wet.gain.value=.22; lp.type='lowpass'; lp.frequency.value=16000; src.connect(lp); src.connect(cv); cv.connect(wet); wet.connect(lp); lp.connect(g); g.connect(pan); pan.connect(SND.out); g.gain.value=0; }
    catch(e){ PLSND.failed=true; return; } }
  const el=PLSND.el, T=c.currentTime; if(el.paused)el.play().catch(()=>{});
  if(el.readyState>=1&&Math.abs(el.currentTime-t)>.35)el.currentTime=t;
  PLSND.g.gain.setTargetAtTime(t<1.6?0:inside?1:Math.max(0,1-d/18)*.4,T,t<1.6?.02:.3); PLSND.lp.frequency.setTargetAtTime(inside?16000:450,T,.3); PLSND.pan.pan.setTargetAtTime(inside?0:Math.max(-1,Math.min(1,sx/400)),T,.2); }   // (the track's first second and a half silent: its "theatre bell" came out as a screech when you sat down, owner 16 Oct 2026; the overture comes in clean)
// ---- EACH FRAME (from the game's loop, tick in 51, after the world is drawn): near the playhouse only
function playFrame(now){ const t0=performance.now(), B=PLB, {t}=plClock(), st=plState(t);
  if(LEVEL===0)plFrontLights();
  const d=Math.max(0,Math.max(B.x0-P.x,P.x-B.x1,0)+Math.max(B.y0-P.y,P.y-B.y1,0)), inside=LEVEL===0&&P.x>=B.x0&&P.x<B.x1&&P.y>=B.y0&&P.y<B.y1;
  const sat=!!(inside&&typeof SIT!=='undefined'&&SIT.on); if(sat&&!PLSHOW.sat)plStart(); PLSHOW.sat=sat;   // (sitting down in the house: the play starts)
  const [pu,pv]=vw(P.x,P.y), [cu,cv]=vw(PLMID,(B.y0+B.y1)/2); plSound(t,inside,inside?d:99,toS(cu,cv)[0]-toS(pu,pv)[0]);   // (heard only inside: owner, 15 Oct 2026)
  if(!inside){ if(PLAYDRAW){ PLAYDRAW=null; dirty=true; } return; }   // (and nothing of the show runs or is drawn from outside: owner, 15 Oct 2026, "i dont want anything rendered when im outside")
  plWalker();   // (the players' pieces baked from when you come in, so they're ready when the show starts: nothing once done)
  plLights(st.lt,st.set,now,st.si===-1?1:Math.round(st.c*4)/4); plT.t=t; const TR=st.si>=0?PLTR[st.si]:st.si===-2?PLCALL:null, ht=TR&&TR.H.length?plHoundAt(TR.H,t):null;
  plSetOn(st.set,!!ht); const seen=(HERE&&HERE.bldg==='lplay'&&!V.roof)||CUTB.has('lplay');
  if(!seen||!V_RECTS.some(r=>r.x1>B.x0&&r.x0<B.x1&&r.y1>B.y0&&r.y0<B.y1)){ if(PLAYDRAW){ PLAYDRAW=null; dirty=true; } return; }
  const env=PLPHY.env, draw=plFlames(now/1000);
  if(TR&&st.c>0)for(const [w,a] of Object.entries(TR.A)){ const p=plPlayer(a,t,TR); if(!p)continue; p.acts=a.acts; const o=plDrawPlayer(w,p,t,now,env,t0); if(o)draw.push(o); }
  if(st.set==='fog'&&st.si>=0){ const sc=PLAYT.scenes[st.si]; draw.push(...plFog(t,Math.min(1,(t-sc.S)/14),env,now)); }
  const sig=d=>d.map(o=>o.key+'@'+o.box[0]+','+o.box[1]).join('|'); if(!PLAYDRAW||sig(draw)!==sig(PLAYDRAW))dirty=true; PLAYDRAW=draw;
  if(PERF)PERF.add('playhouse: the show (players, flames, fog)',performance.now()-t0); }
// for the checks: the show's moment and state, the lights' colours now
window.TSFM_PLAY={clock:plClock,startAt:t=>{ PLSHOW.t0=performance.now()-t*1000; },state:t=>plState(t),lights:()=>Object.fromEntries(Object.entries(PLL_).map(([k,a])=>[k,a.map(l=>l.c)])),cue:()=>PLLT.cue,env:(x,y)=>{ const e=lightEnv(x-.5,y-.5,x+.5,y+.5,false,0); return {key:e.key,lights:e.lights.map(l=>[l.p.map(v=>+v.toFixed(2)),l.c.map(v=>+v.toFixed(2)),l.r])}; },drawn:()=>PLAYDRAW?PLAYDRAW.map(o=>o.n):null};
````

### 9.4 Old game: src/47-playhouse-3-sets.js

The scenery and the hound.

````js
// =====================================================================================
// THE PLAYHOUSE'S SCENERY AND THE HOUND (owner, 14 Oct 2026: "make it really atmospheric"): what stands on the stage in each scene, made
// as the physics' things are (47-physics-1's bodies, fixed: drawn and lit as the rest, never moved, so the stage's lights fall on them),
// and swapped in the dark between scenes (47-playhouse-2-show): 221B Baker Street (the fireplace, its coal fire flickering, two leather
// armchairs, a lamp on a little table, the bookcase, the window, the rug), Baskerville Hall (oak panelling, Sir Hugo's portrait, the long
// table, a candelabra, the long-case clock), the moor (low hills against the sky cloth, a granite tor, a rock to hide behind, heather,
// a dead thorn tree, reeds at the Mire's edge in the wings). THE HOUND: a huge black dog of the same shapes, its legs swinging as it runs,
// its jaws and eyes glowing (the phosphorus); posed each frame by the show.
// =====================================================================================
const PLZ=PLS.SZ/24, PLC=PLS.CY+.5, plT={t:0};   // (the stage's floor, tiles; the marks' 0 line; the show's clock for the flicker)
// a fixed thing on the stage at (x, y), turned rot about the upright
const plFix=(parts,x,y,rot=0,o={})=>{ const b=phyBody({parts,m:20,at:[x,y,PLZ],q:qAxis([0,0,1],rot),...o}); b.fixed=true; return b; };
const plDot=(q,k,s=60)=>hash(Math.floor(q[0]*s),Math.floor(q[1]*s)+Math.floor(q[2]*s)*7,k);
const plWood=(c,k=17)=>(q,n)=>{ const g=Math.floor((Math.abs(n[0])>.5?q[1]:q[0])*30+plDot(q,k,8)*2); return sh(c,.9+.14*hash(g,0,k)); };
const plFire=q=>{ const f=Math.sin(plT.t*9+q[0]*30)*.5+Math.sin(plT.t*23+q[0]*70)*.5, h=q[2]*8-f*.4; return brLit(h<.2?[255,214,120]:h<.5?[250,150,50]:[200,70,24]); };
const PLSETS={
  baker:()=>{ const M=[46,42,40], Wd=[96,58,36], Lt=[120,30,28], o=[];
    o.push(plFix([brB(-.75,-.12,0,-.42,.12,.95,brL(M)),brB(.42,-.12,0,.75,.12,.95,brL(M)),brB(-.42,.02,0,.42,.12,.95,brL([12,10,10],{},false)),
      brB(-.85,-.18,.95,.85,.16,1.05,brL(Wd)),brB(-.8,-.38,0,.8,.12,.04,brL([90,86,80])),brB(-.26,-.1,.04,.26,.04,.14,()=>(q,n)=>plFire(q)),
      brE(-.1,-.03,.22,[.09,.06,.1],plFire),brE(.08,-.04,.2,[.08,.06,.08],plFire),
      brB(-.45,.06,1.32,.45,.12,1.9,brL([186,150,70],{yn:(c,r)=>c<5||c>38||r<5||r>22?[186,150,70]:r<10?[44,58,44]:hash(c>>2,r>>2,77)<.4?[70,96,104]:[96,124,128]}))],PLMID-.4,-44.48,0,{frame:()=>Math.floor(plT.t*8)}));
    for(const [x,r] of [[PLMID-2.2,.35],[PLMID+1.6,-.35]])o.push(plFix([brB(-.36,-.34,.28,.36,.34,.48,brL(Lt)),brB(-.36,.2,.48,.36,.36,1.25,brL(Lt,{yn:(c,rr)=>rr%9<1?sh(Lt,.7):Lt})),
      brB(-.4,-.34,.48,-.27,.28,.74,brL(Lt)),brB(.27,-.34,.48,.4,.28,.74,brL(Lt)),...[[-.3,-.28],[.3,-.28],[-.3,.3],[.3,.3]].map(([a,b])=>brB(a-.03,b-.03,0,a+.03,b+.03,.28,brL(Wd,{},false)))],x,PLC+1.95,r));
    o.push(plFix([brC(0,0,.6,.64,.24,brRound(()=>Wd,()=>sh(Wd,1.1))),brC(0,0,0,.6,.04,brRound(()=>Wd,()=>Wd)),brC(0,0,.64,.7,.08,brRound(()=>[176,140,70],()=>[176,140,70])),
      brE(0,0,.82,[.07,.07,.11],()=>brLit([255,226,160])),brC(0,0,.92,1.02,.03,brRound(()=>[220,226,230],()=>[220,226,230]))],PLMID-.3,PLC+2.15));
    o.push(plFix([brB(-.7,-.15,0,.7,.15,1.95,brL(Wd,{yn:(c,r)=>{ const s=Math.floor(r/16); if(r%16<2)return Wd; const b=Math.floor((c+s*7)/3); return [[120,30,30],[40,60,90],[60,80,50],[140,110,60],[80,40,70]][Math.floor(hash(b,s,91)*5)]; }}))],PLMID-3.4,-44.32));
    o.push(plFix([brB(-.7,-.04,.3,.7,.04,1.9,brL([226,220,206],{yn:(c,r)=>c%22<3||r%26<3||c<4||c>63||r<4||r>72?[226,220,206]:[40,52,78],yp:()=>[200,196,186]}))],PLMID+3.5,PLC+2.95,-.55));
    o.push(plFix([brB(-1.15,-.7,0,1.15,.7,.015,brL([110,34,36],{t:(c,r)=>c<6||c>104||r<6||r>62?[176,140,70]:((c>>3)+(r>>3))&1?[110,34,36]:[44,52,92]},false))],PLMID-.3,PLC+1.7));
    return o; },
  hall:()=>{ const Ok=[64,44,30], OkD=[46,30,20], o=[], pan=brL(Ok,{yn:(c,r)=>c%30<3||r%34<3?OkD:sh(Ok,.95+.1*hash(c>>3,r>>2,31))});
    for(const x of [PLMID-4.1,PLMID-2.85,PLMID+2.85,PLMID+4.1])o.push(plFix([brB(-.62,-.05,0,.62,.05,2.2,pan)],x,-42.3));
    o.push(plFix([brB(-.8,-.05,0,.8,.05,2.2,pan),brB(-.5,-.1,.95,.5,-.05,2,brL([190,152,70],{yn:(c,r)=>{ if(c<4||c>43||r<4||r>46)return [190,152,70]; const x=(c-24)/14, y=(r-26)/18;
      return Math.hypot(x,(y-.35)*1.3)<.32?[220,190,160]:Math.abs(x)<.5&&y>-.1&&y<.2?[240,236,226]:Math.abs(x)<.75&&y<-.05?[120,26,30]:[28,24,22]; }}))],PLMID,-44.3));
    o.push(plFix([brB(-1.1,-.36,.7,1.1,.36,.78,brL(Ok)),...[[-1,-.3],[1,-.3],[-1,.3],[1,.3]].map(([a,b])=>brB(a-.05,b-.05,0,a+.05,b+.05,.7,brL(OkD,{},false))),
      brC(0,0,.78,1.15,.03,brRound(()=>[200,170,90],()=>[200,170,90])),brB(-.32,-.03,1.12,.32,.03,1.16,brL([200,170,90],{},false)),
      ...[-.3,0,.3].flatMap(a=>[brC(a,0,1.16,1.34,.025,brRound(()=>[238,232,214],()=>[238,232,214])),brE(a,0,1.39,[.025,.025,.05],q=>brLit(Math.sin(plT.t*11+a*40+q[2]*90)>.6?[255,240,180]:[255,206,120]))])],PLMID-.2,PLC+2.6,0,{frame:()=>Math.floor(plT.t*6)}));
    o.push(plFix([brB(-.26,-.18,0,.26,.18,2.05,brL(OkD,{yn:(c,r)=>Math.hypot(c-12.5,r-82)<8?(Math.hypot(c-12.5,r-82)<7?[226,218,190]:[190,152,70]):r>30&&r<64&&c>6&&c<19?[30,22,16]:OkD}))],PLMID+3.5,-44.55));
    return o; },
  moor:()=>{ const o=[], heath=q=>{ const n=plDot(q,401,30); return n<.3?[66,74,56]:n<.6?[84,90,62]:n<.8?[92,74,88]:[104,96,74]; }, gr=q=>{ const n=plDot(q,403,40); return n<.4?[132,128,120]:n<.75?[150,146,136]:[110,108,102]; };
    for(const [x,r,h] of [[PLMID-3.6,1.3,.7],[PLMID-1.3,1.4,.95],[PLMID+1.2,1.3,.6],[PLMID+3.6,1.35,.85]])o.push(plFix([{...brE(0,0,0,[r,.45,h],heath),clip:0}],x,-44.55));
    o.push(plFix([brE(0,0,.3,[.6,.45,.42],gr),brE(-.15,.05,.75,[.42,.35,.34],gr),brE(.3,-.1,.5,[.3,.28,.3],gr)],PLMID+.7,-42.75));
    o.push(plFix([brE(0,0,.18,[.46,.3,.3],gr),brE(.2,.05,.38,[.24,.2,.18],gr)],PLMID-2.3,PLC+.35));
    for(const [x,y] of [[-1.2,1.1],[1.8,.7],[2.6,2.2],[-3.1,2.6],[.2,.4],[3.4,1.3]])o.push(plFix([brE(0,0,.08,[.22,.18,.12],q=>plDot(q,409,50)<.4?[150,92,150]:[104,84,70]),brE(.12,.06,.06,[.14,.12,.09],q=>plDot(q,411,50)<.5?[178,110,168]:[96,78,64])],PLMID+x,PLC+y));
    const bark=()=>(q,n)=>sh([58,50,44],.9+.2*plDot(q,421,40));
    o.push(plFix([brC(0,0,0,1.5,.07,bark())],PLMID+3.9,-43.1),plFix([brB(-.03,-.03,0,.03,.03,.7,()=>bark())],PLMID+3.9,-43.1,0,{q:qAxis([1,0,0],.7)}),
      plFix([brB(-.025,-.025,0,.025,.025,.55,()=>bark())],PLMID+3.85,-43.1,0,{q:qAxis([0,1,0],-.8)}));
    for(let i=0;i<7;i++)o.push(plFix([brC(0,0,0,.5+hash(i,1,431)*.3,.012,brRound(()=>hash(i,2,433)<.5?[118,104,62]:[84,90,52],()=>hash(i,2,433)<.5?[118,104,62]:[84,90,52]))],PLMID-4.3+hash(i,3,437)*.7,PLC+2.6+hash(i,4,439)*.8));
    return o; }};
// fixed things that are lifted off the floor (the dead tree's branches): moved up their trunk
{ const f=PLSETS.moor; PLSETS.moor=PLSETS.fog=()=>{ const o=f(); for(const b of o)if(b.q[0]<.999)b.x[2]+=1.05; return o; }; }
// THE HOUND: about a metre at the shoulder, black, short-coated, the jaws and eyes of a cold yellow-green fire; its parts in tiles, its
// four legs (and its tail) moved as it runs (a gallop: the fore and hind pairs half a stride apart), its body rising and falling with them
const PLHOUND=(()=>{ const blk=(q,n)=>{ const d=plDot(q,501,70), up=n?n[2]:0; if(up>.45&&d<.4||d<.06)return brLit(d<.03?[150,214,96]:[88,138,64]); return d<.15?[34,34,36]:d<.9?[18,18,20]:[44,42,42]; },   // (black, its hackles and its back aflicker with the phosphorus)
    glow=()=>brLit([200,255,120]), eye=()=>brLit([240,255,160]);
  const parts=[brE(0,0,1.02,[.62,.24,.26],blk),brE(.42,0,1.06,[.3,.24,.3],blk),brE(.72,0,1.32,[.18,.15,.2],blk),brE(.9,0,1.42,[.2,.15,.15],blk),
    brB(1.02,-.08,1.28,1.24,.08,1.42,()=>(q,n)=>plDot(q,503,60)<.5?brLit([180,240,110]):brLit([120,190,80])),brE(1.22,0,1.34,[.05,.06,.04],glow),
    brE(1.04,-.09,1.48,[.035,.03,.03],eye),brE(1.04,.09,1.48,[.035,.03,.03],eye),brE(.82,-.12,1.58,[.06,.04,.09],blk),brE(.82,.12,1.58,[.06,.04,.09],blk),
    ...[[.45,-.14],[.45,.14],[-.42,-.14],[-.42,.14]].map(([a,b])=>({...brC(a,b,.05,.85,.06,blk),leg:[a,b]})),{...brE(-.66,0,1.12,[.22,.05,.05],blk),tail:1}];
  const b=phyBody({parts,m:50,at:[0,0,PLZ],q:[1,0,0,0]}); b.fixed=true; b.home0=parts.map(p=>p.c.slice()); b.cm0=v3s(b.x,[0,0,PLZ]); return b; })();
// the hound posed: at (x, y) on the stage, heading a (radians, 0 along +x), its stride's phase s (0..1), up: how far it is off the floor
function plHoundPose(x,y,a,s,up=0){ const H=PLHOUND, ph=s*Math.PI*2;
  H.parts.forEach((p,i)=>{ const c0=H.home0[i]; if(p.leg){ const fore=p.leg[0]>0, side=p.leg[1]>0, w=Math.sin(ph+(fore?0:Math.PI)+(side?.4:0))*.16; p.c=[c0[0]+w,c0[1],c0[2]+Math.max(0,-Math.cos(ph+(fore?0:Math.PI)+(side?.4:0)))*.08]; }
    else if(p.tail)p.c=[c0[0],c0[1]+Math.sin(ph)*.05,c0[2]+.04*Math.cos(ph)]; else p.c=[c0[0],c0[1],c0[2]+Math.sin(ph*2)*.025]; });
  H.q=qAxis([0,0,1],a); H.m3=qMat(H.q); H.x=v3a([x,y,PLZ+up],mV(H.m3,H.cm0)); return H; }
````

### 9.5 Old game: src/26-z-the-playhouse.js

The building.

````js
// =====================================================================================
// THE PLAYHOUSE (owner, 14 Oct 2026: "a small play theater where you can watch plays", his pick C, past the pool; LBLD 'lplay',
// 21-world-map-5-land): a small Victorian theatre. Its front drawn by hand as one picture (PFRONT: brick and cream stucco, the doors
// under an iron canopy, the lit PLAYHOUSE board ringed with bulbs, the play's name and the times it starts, a poster each side);
// inside, the house (one block of red velvet seats in the middle, six rows, sat in as the cinema's are: 47-sit; the lobby's tiles at the
// door; small wall lights left and right) and the stage: a raised wooden stage lit only by its candles (owner, 14 Oct 2026: "remove
// curtain", "lights off on stage", "small lights on side of walls", "shorter ceiling, more intimate", "a few candles on stage"), the
// gilded proscenium arch, black masking legs in the wings to hide who waits there, and at the back the cyclorama, a pale cloth. What
// moves on it, the scenery, the players and the hound, is the show's (47-playhouse-2-show). (A 26 file after every other: the game's own things keep their numbers,
// which world edits are kept by, 22; its lights are made last, 47-playhouse-2-show.)
// =====================================================================================
const PLB=LBLD.find(b=>b.id==='lplay'), PLMID=(PLB.x0+PLB.x1)/2;
// the stage's measures (tiles; z art px): its front edge (SY), the proscenium (PRY, its opening PRX0..PRX1 up to PRZ), the line the curtain hung on
// (CY, the marks' 0: 47-playhouse-1-script), its floor's height (SZ), the masking legs (LEGS: y of each pair)
const PLS={x0:PLB.x0+.1,x1:PLB.x1-.1,SY:-48.3,PRY:-47.4,PRX0:PLMID-4.3,PRX1:PLMID+4.3,PRZ:90,CY:-46.8,SZ:22,back:PLB.y1-.1,LEGS:[-45.4,-43.9],legW:1.6,
  rows:[-49.6,-50.7,-51.8,-52.9,-54,-55.1],SX0:PLMID-2.5,SX1:PLMID+2.5,lobby:PLB.y0+1.8};   // (SX0..SX1: the block of seats, in the middle)
// the wall lights' places along the side walls (y), the candles' ([x, y, height art px over the stage])
const PLWALLS=[-50.2,-52.6,-55], PLCANDLES=[[PLMID-3.5,-48.05,20],[PLMID-1.4,-48.05,14],[PLMID+1.4,-48.05,14],[PLMID+3.5,-48.05,20],[PLMID+3.9,-45.2,24]];
// a mark on the stage ([across, back] from the curtain line's middle: 47-playhouse-1-script) in the world
const plMark=m=>[PLMID+m[0],PLS.CY+.5+m[1]];
// ---- the floor: the lobby's small black and white tiles inside the doors, the house's dark boards, a red carpet up the aisle
function playFloorCol(x,y){ if(y<PLS.lobby)return lobbyCol(x,y);
  { const a=Math.abs(x-PLMID); if(a>PLS.SX1-PLMID+.15&&a<PLS.SX1-PLMID+1.25&&y<PLS.SY)return mt('carpet',speck(a<PLS.SX1-PLMID+.22||a>PLS.SX1-PLMID+1.18?[150,118,58]:[128,26,34],x,y,23)); }   // (the aisles either side of the seats)
  const r=Math.floor(x*4), b=Math.floor(y/1.5+hash(r,0,41)*3), c=[[86,58,40],[78,52,36],[92,62,42]][Math.floor(hash(b,r,43)*3)];
  return mt('wood',(x*4-r)<.08?sh(c,.7):c); }
// ---- the walls inside: the house deep red over a dark wainscot with a gilt rail; behind the proscenium all black (a stage's walls),
// but the back wall: the cyclorama, a pale cloth taking whatever colour the stage lights throw on it
function playWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X;
  if(ny<0&&Math.abs(Y-PLB.y1)<.3&&z>=PLS.SZ){ const s=1-.05*((u*24|0)%7===0)-.03*Math.abs(Math.sin(u*2.1)); return sh(z>PLB.h-16?[30,30,34]:[196,202,208],f*s); }   // (faint seams; dark above the cloth)
  if(Y>PLS.PRY+.05)return sh(z<PLS.SZ&&ny?[60,46,34]:[20,20,22],f);
  if(z<6)return sh([40,26,20],f);
  if(z<40)return sh(z%10<1?[52,32,24]:[74,46,32],f);
  if(z<44)return sh([186,150,72],f*1.1);
  const d=hash(Math.floor(u*24/6),Math.floor(z/8),57)<.5, m=((u*24|0)+(z|0))%12<2;
  return sh(m&&d?[112,34,40]:[98,26,32],f); }
// ---- the front (on the wall at y0, and nothing built out from it): u along it from x0, z up
const PFONT={...THFONT,D:'####.#...##...##...##...##...#####.',F:'######....#....####.#....#....#....',L:'#....#....#....#....#....#....#####',V:'#...##...##...##...##...#.#.#..#...',
  Y:'#...##...#.#.#..#....#....#....#...',0:'.###.#...##..###.#.###..##...#.###.',1:'..#...##....#....#....#....#...###.',2:'.###.#...#....#...#...#...#...#####',
  4:'...#...##..#.#.#..#.#####...#....#.',6:'..##..#...#....####.#...##...#.###.',8:'.###.#...##...#.###.#...##...#.###.'};
const PFRONT=(()=>{ let o=null; const build=()=>{ const W=Math.round((PLB.x1-PLB.x0)*24), H=PLB.h, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
  const box=(c0,z0,c1,z1,col)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++)px(c,z,col); }, U=x=>(x-PLB.x0)*24, lit=c=>{ const o=c.slice(); o.e=1; return o; };
  const text=(s,c,z,k,col,ol)=>{ for(const pass of ol?[0,1]:[1])[...s].forEach((ch,i)=>{ const g=PFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#'){
      if(pass)box(c+(i*6+q)*k,z+(6-j)*k,c+(i*6+q+1)*k,z+(7-j)*k,col); else for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])box(c+(i*6+q)*k+dx,z+(6-j)*k+dz,c+(i*6+q+1)*k+dx,z+(7-j)*k+dz,ol); } }); };
  const tw=(s,k)=>(s.length*6-1)*k;
  const CREAM=[226,214,186], CREAMD=[188,174,146], GREEN=[34,58,48], GILT=[198,160,76], BULB=lit([255,226,150]);
  for(let z=0;z<H;z++)for(let c=0;c<W;c++){ const r=Math.floor(z/3), cc=c+(r&1)*3; px(c,z,z%3===0||cc%6===0?[92,38,32]:hash(Math.floor(cc/6),r,871)<.3?[132,58,48]:[118,50,44]); }   // dark red brick
  box(0,0,W,8,[150,146,136]); box(0,7,W,9,[124,120,112]);                              // the stone plinth
  for(const [c0,c1] of [[0,12],[W-12,W]]){ box(c0,8,c1,H-14,CREAM); for(let z=14;z<H-14;z+=10)box(c0,z,c1,z+1,CREAMD); }   // the stucco quoins at the corners
  box(0,H-14,W,H,CREAM); box(0,H-14,W,H-12,CREAMD); for(let c=4;c<W;c+=10)box(c,H-10,c+5,H-6,CREAMD);   // the cornice and its dentils
  // the doors' frame (the glass is the wall's: 21-world-map-5-land) and the windows' (lit from inside by the lobby)
  const d0=U(PLMID-1.2), d1=U(PLMID+1.2); box(d0-4,0,d1+4,76,GREEN); box(d0-2,72,d1+2,76,GILT);
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0)-3,25,U(x1)+3,72,CREAM); box(U(x0)-4,24,U(x1)+4,26,CREAMD); }
  // the iron canopy over the doors, bulbs along its edge, the play's name lit along its fascia
  const cw=96; box(W/2-cw,74,W/2+cw,86,[30,40,36]); box(W/2-cw,84,W/2+cw,87,GILT); for(let c=W/2-cw+2;c<W/2+cw;c+=6)px(c,75,BULB);
  const nm='THE HOUND OF THE BASKERVILLES'; text(nm,(W-tw(nm,1))/2,77,1,lit([240,226,180]));
  // the board over it under the cornice: PLAYHOUSE in red on cream, bulbs down its sides, and under the name what to do (the play starts
  // when someone sits: 47-playhouse-2-show)
  const bw=tw('PLAYHOUSE',2)+18, b0=(W-bw)/2; box(b0,90,b0+bw,114,CREAM); box(b0-2,88,b0+bw+2,90,GILT); box(b0-2,114,b0+bw+2,116,GILT);
  for(let z=92;z<113;z+=5){ px(b0+2,z,BULB); px(b0+bw-3,z,BULB); }
  text('PLAYHOUSE',b0+9,100,2,[150,28,34],[90,16,20]); const ts='TAKE A SEAT'; text(ts,(W-tw(ts,1))/2,91,1,[120,90,40]);
  // a poster each side, in its glass case: the hound's head black on green fog, its eyes lit
  for(const c0 of [14,W-14-30]){ box(c0-2,16,c0+32,72,GILT); box(c0,18,c0+30,70,[46,74,62]);
    for(let z=18;z<70;z++)for(let c=c0;c<c0+30;c++)if(hash(c,z,881)<.12)px(c,z,[70,104,88]);
    for(let z=26;z<58;z++)for(let c=c0+4;c<c0+26;c++){ const x=(c-c0-15)/10, y=(z-40)/14; if(x*x+y*y<1||(Math.abs(x)<.5&&y>-1.5&&y<-.5)||(Math.abs(x+.55)<.22&&y>.7&&y<1.4)||(Math.abs(x-.55)<.22&&y>.7&&y<1.4))px(c,z,[14,16,14]); }
    px(c0+11,44,lit([250,236,120])); px(c0+19,44,lit([250,236,120])); px(c0+12,44,lit([250,236,120])); px(c0+18,44,lit([250,236,120]));
    text('HOUND',c0+1,61,1,lit([236,222,176])); }
  return {W,H,a}; }; return {get W(){ return (o||(o=build())).W; },get H(){ return (o||(o=build())).H; },get a(){ return (o||(o=build())).a; }}; })();   // (built when first asked, not at load)
function playFront(X,z,f){ const P=PFRONT, c=P.W-1-Math.floor((X-PLB.x0)*24),   // (read from the street: the front faces -y, so its left is the building's east end; drawn the other way it read backwards, owner 16 Oct 2026)
  zz=Math.floor(z); if(c<0||c>=P.W||zz<0||zz>=P.H)return null; const o=P.a[zz*P.W+c]; if(!o)return null; if(o.e)return o; return sh(o,f); }
// ---- the stage and the house: what never moves (props: painted once, lit by the stage's lights)
{ const S=PLS, B=PLB, wood=(x,y)=>{ const r=Math.floor(x*5), c=[[150,108,66],[140,100,60],[158,116,72]][Math.floor(hash(r,Math.floor(y/2),61)*3)]; return mt('wood',(x*5-r)<.07?sh(c,.72):c); };
  const BLK=[22,22,24], blk={c:BLK,top:()=>[30,30,32],fi:()=>[18,18,20],fj:()=>[24,24,26]}, GILT=[200,162,78], RED=[132,28,34];
  // the stage: its boards, its front face dark with a gilt edge, the footlights' trough along it, a small step at each end for the players
  PNAME='stage'; prop([{x0:S.x0,y0:S.SY,x1:S.x1,y1:S.back,z0:0,z1:S.SZ,c:[120,86,54],top:wood,fi:(y,z)=>sh(z>S.SZ-3?GILT:[46,30,24],.62),fj:(x,z)=>sh(z>S.SZ-3?GILT:[52,34,26],.8)}
  ]);   // (no footlights: owner, 14 Oct 2026, "lights off on stage"; the candles light it, below)
  // the proscenium: two gilded pillars and the arch's header over the opening, deep red between its gilt mouldings
  PNAME='proscenium'; const PT=B.h-8, ph=PT-S.PRZ, pil=(x0,x1)=>({x0,y0:S.PRY,x1,y1:S.PRY+.4,z0:S.SZ,z1:PT,c:RED,top:()=>GILT,fi:(y,z)=>sh(Math.abs(y-S.PRY-.2)<.12?GILT:RED,.62),fj:(x,z)=>sh((x-x0)%.5<.08||z%26<2?GILT:RED,.8)});
  prop([pil(S.x0,S.PRX0),pil(S.PRX1,S.x1),{x0:S.PRX0,y0:S.PRY,x1:S.PRX1,y1:S.PRY+.4,z0:S.PRZ,z1:PT,foot:0,c:RED,top:()=>GILT,fi:()=>sh(RED,.62),
    fj:(x,z)=>{ const k=z-S.PRZ; return sh(k<3||k>ph-4?GILT:Math.hypot((x-PLMID)*24,k-ph/2)<ph/2-5?[226,190,96]:RED,.8); }}],null,{high:true});   // (a storey high now: the crest a gilt boss in the middle)
  // the masking legs: black cloth flats each side, one behind another, hiding the wings
  PNAME='masking legs'; prop(S.LEGS.flatMap(y=>[{x0:S.x0,y0:y,x1:S.x0+S.legW,y1:y+.08,z0:S.SZ,z1:B.h-6,foot:1,...blk},{x0:S.x1-S.legW,y0:y,x1:S.x1,y1:y+.08,z0:S.SZ,z1:B.h-6,foot:1,...blk}]));
  // the seats: rows of tip-up seats in red velvet, wooden arms, cast iron ends; the aisle down the middle
  // (owner, 14 Oct 2026: "remove half side of seats, place rest in middle": one block of seven a row, sat in as the cinema's are, 47-sit)
  const seat=(x0,x1,y)=>{ const o=[], seats=[], n=Math.round((x1-x0)/.72), w=(x1-x0)/n, V=[150,32,40], Vd=[112,22,30], IR=[36,34,36];
    for(let i=0;i<n;i++){ const a=x0+i*w; o.push({x0:a+.05,y0:y-.18,x1:a+w-.05,y1:y+.22,z0:10,z1:13,c:V,top:()=>V,fi:()=>sh(Vd,.9),fj:()=>sh(V,.8)},
      {x0:a+.05,y0:y-.3,x1:a+w-.05,y1:y-.18,z0:10,z1:32,c:V,top:()=>sh(V,1.06),fi:()=>sh(Vd,.9),fj:(xx,z)=>sh(z>29?V:Vd,.85)});
      seats.push({x:a+w/2,y:y+.02,z:13,f:[0,1],stand:[a+w/2,y+.52]}); }
    for(let i=0;i<=n;i++){ const a=x0+i*w; o.push({x0:a-.04,y0:y-.3,x1:a+.04,y1:y+.24,z0:0,z1:17,c:IR,top:()=>[118,82,52],fi:()=>sh(IR,.62),fj:()=>sh(IR,.8)}); }
    return [o,seats]; };
  PNAME='theatre seats'; for(const y of S.rows){ const [o,seats]=seat(S.SX0,S.SX1,y), p=prop(o,null,{seats}); p.kind='playhouse seats'; }
  // the wall lights: a small brass plate and a glass shell each side, along the house (their light: 47-playhouse-2-show's 'wall')
  for(const [x,nx] of [[B.x0+T,1],[B.x1-T,-1]])for(const y of PLWALLS)theatreSconce(x,y,[nx,0]).kind='wall light';
  // the candles on the stage (owner: "a few candles on stage", the only light the players have): five tall church candles in brass
  // sticks along the front and up the sides; their flames move (47-playhouse-2-show draws them), their light is the show's 'candle'
  PNAME='stage candles'; prop(PLCANDLES.flatMap(([x,y,h])=>[{x0:x-.07,y0:y-.07,x1:x+.07,y1:y+.07,z0:S.SZ,z1:S.SZ+2,foot:1,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:S.SZ+2,z1:S.SZ+h-6,foot:0,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:S.SZ+h-6,z1:S.SZ+h-5,foot:0,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.035,y0:y-.035,x1:x+.035,y1:y+.035,z0:S.SZ+h-5,z1:S.SZ+h,foot:0,c:[238,230,206],top:()=>[244,238,218],fi:()=>[206,198,176],fj:()=>[230,222,198]}])).kind='candles'; }
````

### 9.6 Old game: tools/playhouse-audio.mjs

The ElevenLabs voice, sound and mix tool.

````js
// THE PLAYHOUSE'S SOUND (owner, 14 Oct 2026): the play's voices and sounds made with ElevenLabs from the script (src/47-playhouse-1-script.js),
// timed and mixed into one track the show plays (audio/hound.mp3), and the times the stage follows (src/47-playhouse-1-times.data.js).
//   ELEVENLABS_API_KEY=... node tools/playhouse-audio.mjs        make what isn't made yet, then time and mix it all
// Every line and sound is asked for once and kept in .playhouse-cache/ (not committed): running it again after changing a line asks only
// for that line. The key is never written anywhere. Needs ffmpeg.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'), cache=join(root,'.playhouse-cache'); mkdirSync(cache,{recursive:true}); mkdirSync(join(root,'audio'),{recursive:true});
const PLAY=vm.runInNewContext(readFileSync(join(root,'src','47-playhouse-1-script.js'),'utf8')+';PLAY');
const KEY=process.env.ELEVENLABS_API_KEY, RATE=24000, MODEL='eleven_v3';
const hash=s=>createHash('sha1').update(s).digest('hex').slice(0,16);
async function get(file,url,body){ if(existsSync(file))return file; if(!KEY)throw new Error('no ELEVENLABS_API_KEY, and '+file+' is not made yet');
  for(let i=0;i<4;i++){ const r=await fetch(url,{method:'POST',headers:{'xi-api-key':KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(r.ok){ writeFileSync(file,Buffer.from(await r.arrayBuffer())); console.log('made',file.split('/').pop(),body.text.slice(0,60)); return file; }
    const t=await r.text(); if(r.status!==429&&r.status<500)throw new Error(r.status+' '+t); await new Promise(z=>setTimeout(z,2000*2**i)); }
  throw new Error('ElevenLabs kept failing'); }
const line=(voice,text)=>get(join(cache,'v-'+hash(voice+'|'+MODEL+'|'+text)+'.mp3'),'https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',{text,model_id:MODEL});
const sound=(k,[text,sec])=>get(join(cache,'s-'+k+'-'+hash(text+'|'+sec)+'.mp3'),'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',{text,duration_seconds:sec,prompt_influence:.45});
// a clip as samples (mono, RATE a second)
const pcm=f=>{ const b=execFileSync('ffmpeg',['-v','error','-i',f,'-ac','1','-ar',String(RATE),'-f','f32le','-'],{maxBuffer:1<<30}); return new Float32Array(b.buffer,b.byteOffset,b.length/4); };
const rms=a=>{ let s=0; for(const v of a)s+=v*v; return Math.sqrt(s/a.length); };

// ---- make every line and sound (one at a time: ElevenLabs' limit on requests at once)
const LINES=[]; for(const sc of PLAY.scenes)for(const b of sc.beats)if(b.w)LINES.push(b);
const clip=new Map();
for(const b of LINES){ const f=await line(PLAY.cast[b.w].voice,b.s); const a=pcm(f); clip.set(b,a); }
const SND={}; for(const [k,v] of Object.entries(PLAY.sounds))SND[k]=pcm(await sound(k,v));

// ---- the times: the same rules the stage keeps (47-playhouse-2-show reads only the times, never works them out again)
const WALK=1.5, GAP=.45, OPEN=3, CLOSE=3, BETWEEN=3.5;   // (a walk's speed, tiles a second; the quiet after a line; the curtain's opening and closing; dark between scenes)
const M=PLAY.marks, dist=(a,b)=>Math.hypot(M[a][0]-M[b][0],M[a][1]-M[b][1]), sec=a=>a.length/RATE;
const T={walk:WALK,open:OPEN,close:CLOSE,scenes:[],beats:[],lines:[],sounds:[]}; let t=0;
const put=(k,at,vol,o={})=>T.sounds.push({k,at:+at.toFixed(2),vol,...o});
put('bell',0,.7); put('overture',2.5,.55); t=12;
PLAY.scenes.forEach((sc,si)=>{ const S=t, at={...sc.cast}; t+=OPEN;
  sc.beats.forEach((b,bi)=>{ const t0=t;
    if(b.w){ const d=sec(clip.get(b)); if(b.go&&at[b.w])at[b.w]=b.go; T.lines.push([+t0.toFixed(2),+d.toFixed(2),si,bi]); t+=d+GAP; }
    else if(b.do){ let w=0; for(const [who,what,a1,a2] of b.do){ if(what==='go'){ w=Math.max(w,dist(at[who],a1)/WALK); at[who]=a1; } else if(what==='enter'){ w=Math.max(w,dist(a1,a2)/WALK); at[who]=a2; }
        else if(what==='exit'){ w=Math.max(w,dist(at[who],a1)/WALK); delete at[who]; } else if(what==='a')w=Math.max(w,1); else w=Math.max(w,.4); }
      t+=w+.3; }
    else if(b.x){ const d=sec(SND[b.x]); put(b.x,t0,{knock:.8,street:.35,reading:.4,howlfar:.55,sting:.6,violin:.6,sob:.45,door:.7,mire:.6,owl:.5,paws:.8,snarl:.95,howlnear:.9,splash:.8}[b.x]??.6); t+=b.over?.5:d+.2; }
    else if(b.p)t+=b.p;
    else if(b.hound)t+={enter:2.2,leap:1.1,flee:2.6}[b.hound];
    T.beats.push([+t0.toFixed(2),si,bi]); });
  const E=t+.5; for(const k of sc.bed)put(k,S-1.5,{fire:.22,clock:.12,wind:.3,hallwind:.26,fog:.3}[k]??.25,{bed:1,until:+(E+CLOSE).toFixed(2)});
  T.scenes.push({S:+S.toFixed(2),E:+E.toFixed(2)}); t=E+CLOSE+BETWEEN; });
// the curtain call: the curtain opens on the whole cast in a line, they bow twice, it closes; the house lights come up after
T.call={S:+(t-1).toFixed(2),bow:[+(t-1+OPEN+1).toFixed(2),+(t-1+OPEN+3.5).toFixed(2)],E:+(t-1+OPEN+6.5).toFixed(2)};
T.len=+(T.call.E+CLOSE+2).toFixed(2);

// ---- the mix: the lines evened out, the sounds at their loudness, the beds looped under their scene, faded in and out
const out=new Float32Array(Math.ceil(T.len*RATE)), add=(a,at,vol,len=a.length,fi=0,fo=0)=>{ const o=Math.round(at*RATE);
  for(let i=0;i<len;i++){ const j=o+i; if(j<0||j>=out.length)continue; let g=vol; if(fi&&i<fi)g*=i/fi; if(fo&&i>len-fo)g*=(len-i)/fo; out[j]+=a[i%a.length]*g; } };
for(const [at,,si,bi] of T.lines){ const a=clip.get(PLAY.scenes[si].beats[bi]); add(a,at,.11/Math.max(.02,rms(a))); }
for(const s of T.sounds){ const a=SND[s.k], r=.11/Math.max(.01,rms(a)); if(s.bed)add(a,s.at,s.vol*r,Math.round((s.until-s.at)*RATE),RATE*2.5,RATE*2.5); else add(a,s.at,s.vol*r,a.length,0,Math.min(a.length,RATE*.3)); }
let pk=0; for(const v of out)pk=Math.max(pk,Math.abs(v)); const g=pk>.95?.95/pk:1; for(let i=0;i<out.length;i++)out[i]*=g;
const raw=join(cache,'mix.f32'); writeFileSync(raw,Buffer.from(out.buffer));
execFileSync('ffmpeg',['-v','error','-y','-f','f32le','-ar',String(RATE),'-ac','1','-i',raw,'-af','acompressor=threshold=-26dB:ratio=3:attack=8:release=250,loudnorm=I=-20:TP=-1.5:LRA=14','-ar',String(RATE),'-c:a','libmp3lame','-b:a','56k',join(root,'audio','hound.mp3')]);
writeFileSync(join(root,'src','47-playhouse-1-times.data.js'),'// DATA ONLY: the play\'s times (tools/playhouse-audio.mjs makes it from the script and the voices; never edited by hand)\nconst PLAYT='+JSON.stringify(T)+';\n');
console.log('the play: '+T.len.toFixed(1)+' s, '+T.lines.length+' lines, '+T.sounds.length+' sounds; audio/hound.mp3, src/47-playhouse-1-times.data.js');
````

### 9.7 Old game: worker/room.js, lines 275 to 285

How the room server syncs the show.

````js
  // THE PLAYHOUSE'S SHOW (owner, 14 Oct 2026: "the play start when you sit", for everyone in the room; src/47-playhouse-2-show.js): the
  // first to sit starts it; the room keeps when it began (not stored: a show is minutes long) and tells everyone, and whoever joins while
  // it's on is told too, so all see the same moment. Sitting while one is on changes nothing; len: the show's length (seconds), kept sane.
  showMsg() { return { t: "show", at: this.showAt, now: Date.now() }; }
  showOn(now) { return !!this.showAt && now - this.showAt < this.showLen * 1000; }
  show(ws, s, msg, now) {
    if (this.showOn(now) && !(msg.restart && s.admin)) return this.send(ws, this.showMsg());   // (an admin's restart: from the top, for everyone)
    if (now - (s.showAt || 0) < 2000) return; s.showAt = now;
    this.showAt = now; this.showLen = Number.isFinite(msg.len) ? Math.max(10, Math.min(3600, msg.len)) : 600;
    this.toAll(this.showMsg());
  }
````

### 9.8 Old game: src/47-play-1-cast.js

221B's actors.

````js
// =====================================================================================
// THE PLAYERS, 1: THE CAST (owner, 14 Oct 2026: "create a scene from hound of the baskervilles using my game engine, new walker, but use
// the characters from the book sherlock, etc dressed appropriately. have them act out one of the scenes in the room"; "this is real
// characters in a room, you could interact with them. i just want them to be NPC controlled new walks, using full range of motion of
// physics"): Sherlock Holmes, Dr. Watson and Dr. James Mortimer, each the jointed walker (12-walker-rig) with his own pieces (dressed:
// cos, baked a piece a frame when you're near) and colours, moving by the rig's own gait, its poses and their blends, standing, walking,
// sitting, holding things (his hands put where they must be: armIK); and Mortimer's curly-haired spaniel, his own pieces on his own small
// skeleton. Each is drawn as another player is (48-online's othRig: his own small picture, painted again only while something of him
// moves, lit where he stands, his shadow), among the movers (ACTDRAW, 45). The scene they play: 47-play-2-scene.
//  Holmes: over six feet and lean, black hair, a hawk's nose; his purple dressing-gown, its cord, the shirt under it, dark trousers.
//  Watson: brown hair and moustache, a tweed jacket, waistcoat and watch-chain, a dark tie, brown boots.
//  Mortimer (as the book has him): very tall and thin, a long nose like a beak, gold-rimmed glasses, his frock-coat dingy and his
//  trousers frayed, his long back already bowed, his head thrust forward.
// =====================================================================================
const CV=RIG.V;
// ---- THE SAME AVATAR AS YOURS (owner, 15 Oct 2026: "i want the npcs to all have the same exact avatar as the player does, fingers,
// etc."): every one of them is the Walker's own pieces, nothing changed or added but the things he holds (as the Walker on the carpet with
// his guitar, 47-play-3-guitar), in his own colours (look: his skin, hair, shirt, trousers, shoes). The dresser below (castDress) is kept
// but worn by no one now: the coats, noses and pixel faces were their own look before.
const castOwn=(J,base)=>base.concat(PROPS3D);
// ---- THE COSTUMES (worn by no one since 15 Oct 2026, above): his own pieces, changed and added to (12-walker-rig-3's baker, cos: his rest skeleton J, his own pieces)
// (his nose drawn as part of the head, grp: no outline round it)
const castDress=o=>(J,base)=>{ const {add,sub,mul,len,rcone,ell,box}=RIG, V=CV, H=J.head, by={}, out=[]; for(const p of base)by[p.n]=p;
  const keep=(n,ch)=>out.push(Object.assign({},by[n],ch||{})), put=p=>out.push(p), k=o.wide||1, thin=(d,c)=>p=>d(V(c+(p.x-c)/k,p.y,p.z))*Math.min(1,k);
  keep('head'); keep('neck');
  keep('hair',o.slick?{d:p=>Math.max(by.hair.d(p),-ell(p,add(H,V(0,3.2,5.9)),V(1.8,1.5,1.9)))}:{});   // (slicked back: no tuft)
  put({n:'beard',on:'head',grp:'head',m:'hair',d:()=>99,bb:[0,0,0,0,0,0]});   // (his own beard off: a moustache, the eyes, the mouth and the glasses are pixels, castFace)
  put({n:'nose',on:'head',grp:'head',m:'skin',d:p=>Math.min(ell(p,add(H,V(0,-1.0,6.0+o.nose[1]*.55)),V(o.nose[0],1.5,o.nose[1])),ell(p,add(H,V(0,.6,6.1)),V(.7,1.2,.8))),bb:[-2,2,39,46,6.5,13]});
  // the coat: over the shirt (the torso), a V at the front for what's under (the gown: a shawl collar over the shirt, its cord round the waist)
  const tor=thin(by.torso.d,0), fr=p=>p.z>1.4, ax=p=>Math.abs(p.x);
  const paint=o.coat=='gown'?p=>{ if(p.y>18.3&&p.y<19.6)return 'tie'; if(!fr(p))return null; const w=(p.y-18.5)*.34; if(p.y>31.3&&ax(p)<2.4)return 'linen'; if(ax(p)<w-1)return p.y>24?'linen':null; if(ax(p)<w+.2)return 'vest'; return null; }
    :p=>{ if(!fr(p))return null; if(p.y>31.4&&ax(p)<2.4)return 'linen'; if(ax(p)<.9&&p.y>27.4&&p.y<31.4)return 'tie'; if(ax(p)<(p.y-27)*.5&&p.y>27)return 'linen';
      if(ax(p)<(p.y-20.5)*.48&&p.y>20.5){ if(o.chain&&ax(p)>.5&&ax(p)<3.4&&Math.abs(p.y-(23+.25*ax(p)))<.32)return 'gold'; if(ax(p)<.35&&(p.y*1.4|0)%2===0)return 'gold'; return 'vest'; } return null; };
  keep('torso',{m:'coat',d:tor,paint});
  keep('hips',{d:thin(by.hips.d,0)});
  const sq=(p,c,f)=>V(p.x,p.y,c.z+(p.z-c.z)/f), P0=J.pelvis;
  // below the waist: a jacket to the hip, a frock-coat's skirts to the knee (open at the front), a dressing-gown to the shin (closed)
  const hipR=o.coat=='jacket'?4.5:3.6, hipC=p=>rcone(sq(p,P0,.86),add(P0,V(0,2.4,0)),add(P0,V(0,-hipR,0)),6.0*k,6.4*k);
  put({n:'coatHips',on:'hips',m:'coat',d:o.coat=='gown'?hipC:p=>Math.max(Math.abs(hipC(p))-.35,p.z-2.4),bb:[-8,8,12,22,-8,8]});
  for(const n of 'LR'){ const s=n=='L'?1:-1, Hp=J['hip'+n], Kn=J['knee'+n], A=J['ankle'+n], S=J['shoulder'+n], E=J['elbow'+n], W=J['wrist'+n];
    if(o.coat=='frock')put({n:'skirt'+n,on:'thigh'+n,m:'coat',d:p=>Math.max(Math.abs(rcone(p,add(Hp,V(0,1.5,0)),add(Kn,V(0,-1.2,0)),4.4*k,4.9*k))-.35,-s*p.x-.1,p.z-1.2),bb:[-6,8,8,20,-7,7].map((v,i)=>i<2&&s<0?-[-6,8][1-i]:v)});
    if(o.coat=='gown'){ put({n:'skirt'+n,on:'thigh'+n,m:'coat',d:p=>Math.max(rcone(p,add(Hp,V(0,1.5,0)),Kn,4.4*k,4.7*k),-s*p.x-.05),bb:[-6,9,9,20,-7,7].map((v,i)=>i<2&&s<0?-[-6,9][1-i]:v)});
      put({n:'gown'+n,on:'shin'+n,m:'coat',d:p=>Math.max(rcone(p,add(Kn,V(0,1,0)),add(Kn,mul(sub(A,Kn),.62)),4.7*k,5.0*k),-s*p.x-.05),bb:[-6,9,5,13,-7,7].map((v,i)=>i<2&&s<0?-[-6,9][1-i]:v)}); }
    const cuff=o.coat=='gown'?'vest':'linen', wd=o.coat=='gown'?.3:0;
    keep('sleeve'+n,{m:'coat',d:p=>rcone(p,S,add(S,mul(sub(E,S),.35)),2.75,2.6)});
    keep('upperArm'+n,{m:'coat',d:p=>rcone(p,S,E,2.45,2.3+wd)});
    keep('forearm'+n,{m:'coat',d:p=>rcone(p,E,W,2.3+wd,2.05+wd),paint:p=>len(sub(p,W))<1.3?cuff:null});
    keep('hand'+n); for(let i=0;i<5;i++)for(let j=0;j<3;j++)keep('fing'+i+j+n); keep('thigh'+n,{d:thin(by['thigh'+n].d,s*3.2)});
    keep('shin'+n,o.frayed?{paint:p=>p.y<A.y+.5&&hash(Math.floor(p.x*3),Math.floor(p.z*3),1251)<.5?'linen':null}:{}); keep('shoe'+n); }
  return out.concat(PROPS3D); };
// THE THINGS THEY HOLD, as pieces of his (on 'prop': each in its own frame, given with the pose: castProps): the stick (the Penang lawyer: a
// bulbous head, the silver band under it, the iron ferrule), the convex lens, the Medical Directory shut and open, a cigarette (its end
// alight), a cigarette paper
const PROPS3D=(()=>{ const {rcone,ell,box}=RIG, V=CV;
  return [{n:'stick',on:'prop',m:'wood',d:p=>Math.min(rcone(p,V(0,.6,0),V(0,25.4,0),.5,.62),ell(p,V(0,26.3,0),V(1.25,1.45,1.25))),paint:p=>p.y>23.5&&p.y<24.6?'metal':p.y<1.6?'tie':null,bb:[-2,2,-1,29,-2,2]},
    {n:'lens',on:'prop',m:'wood',d:p=>Math.min(rcone(p,V(0,0,0),V(0,3,0),.45,.45),Math.hypot(Math.hypot(p.x,p.y-4.7)-1.5,p.z)-.32,ell(p,V(0,4.7,0),V(1.3,1.3,.16))),paint:p=>Math.hypot(p.x,p.y-4.7)<1.25&&p.y>3.2?'glass':p.y>3.1?'gold':null,bb:[-2.5,2.5,-1,7,-1,1]},
    {n:'book',on:'prop',m:'cover',d:p=>box(p,V(0,0,0),V(.95,2.8,2.0)),paint:p=>Math.abs(p.x)<.75&&(Math.abs(p.y)>2.55||p.z>1.8)?'paper':null,bb:[-1.6,1.6,-3.4,3.4,-2.6,2.6]},
    {n:'bookO',on:'prop',m:'cover',d:p=>Math.min(box(p,V(2.05,0,0),V(2.0,.3,2.8)),box(p,V(-2.05,0,0),V(2.0,.3,2.8))),paint:p=>p.y>.05?'paper':null,bb:[-4.6,4.6,-1,1,-3.4,3.4]},
    {n:'cig',on:'prop',m:'linen',d:p=>rcone(p,V(0,0,0),V(0,2.2,0),.3,.3),paint:p=>p.y>1.9?'ember':null,bb:[-1,1,-1,3,-1,1]},
    {n:'cpaper',on:'prop',m:'paper',d:p=>box(p,V(0,0,0),V(1.4,.12,.9)),bb:[-2,2,-1,1,-1.5,1.5]}]; })();
// ---- THE SPANIEL: his pieces, each about its own joint (on 'prop': his skeleton places them, castDog): the body and chest, the head and its
// muzzle (liver, a white blaze), the long curly ears, four legs, the docked tail; liver and white, curly
const DOG3D=(()=>{ const {rcone,ell}=RIG, V=CV, curl=(p,k)=>hash(Math.floor(p.x*1.6+k),Math.floor(p.y*1.6)+Math.floor(p.z*1.6)*7,1253);
  const leg=(n,r0)=>({n,on:'prop',m:'fur',d:p=>rcone(p,V(0,0,0),V(0,-6.5,.3),r0,.75),paint:p=>p.y>-3.4&&curl(p,3)<.6?'fur2':null,bb:[-2,2,-8,2,-2,2]});
  return [{n:'dBody',on:'prop',m:'fur',d:p=>Math.min(ell(p,V(0,0,0),V(2.7,3.0,5.8)),ell(p,V(0,1.7,4.2),V(2.4,2.7,2.6))),paint:p=>(p.y>.6&&p.z<2.5&&curl(p,0)<.75)||p.z<-2&&curl(p,1)<.5?'fur2':null,bb:[-4,4,-4,5,-7,7.5]},
    {n:'dHead',on:'prop',m:'fur2',d:p=>Math.min(ell(p,V(0,1.4,1.2),V(2.0,2.2,2.2)),ell(p,V(0,.4,3.4),V(1.15,1.05,1.6))),paint:p=>p.z>4.7&&p.y>.2?'hair':Math.abs(p.x)<.75&&p.z>2.2&&p.y>.6?'fur':p.z>1.8&&p.y>2.3&&Math.abs(Math.abs(p.x)-1.1)<.45?'hair':null,bb:[-3,3,-2,4,-1.5,5.5]},
    {n:'dEarL',on:'prop',m:'fur2',d:p=>ell(p,V(0,-2.3,0),V(.65,2.7,1.35)),bb:[-1.2,1.2,-5.5,1,-2,2]},{n:'dEarR',on:'prop',m:'fur2',d:p=>ell(p,V(0,-2.3,0),V(.65,2.7,1.35)),bb:[-1.2,1.2,-5.5,1,-2,2]},
    leg('dLegFL',1.0),leg('dLegFR',1.0),leg('dLegBL',1.25),leg('dLegBR',1.25),
    {n:'dTail',on:'prop',m:'fur',d:p=>rcone(p,V(0,0,0),V(0,1.1,-2.3),.85,.6),paint:p=>curl(p,5)<.5?'fur2':null,bb:[-1.5,1.5,-1,2.5,-3.5,1]}]; })();
// ---- WHO THEY ARE: the Walker's own pieces (own: his own face too, no pixels put on it), their colours (a material's middle colour:
// 12's ramp32; shirt: what was the coat's), how tall (the passport's heights, as ppTall)
const CAST={
  holmes:{name:'Sherlock Holmes',face:{},tall:73,own:true,cos:castOwn,
    look:{skin:'#e6c8b2',hair:'#1e1c20',shirt:'#5a3050',coat:'#5a3050',vest:'#7a5070',tie:'#c09048',linen:'#ece6d6',pants:'#3a3a42',shoes:'#1e1a1a',wood:'#6e4222',metal:'#d4d8dc',gold:'#c8a040',glass:'#dfe8ec',ember:'#ffb050',paper:'#f0e8d0',cover:'#963224'}},
  watson:{name:'Dr. Watson',face:{tache:true},tall:69,own:true,cos:castOwn,
    look:{skin:'#e4b89c',hair:'#7a5638',shirt:'#7c6448',coat:'#7c6448',vest:'#5c4c3a',tie:'#2c3858',linen:'#efe9da',pants:'#6c5c48',shoes:'#3c2818',gold:'#d8b450',wood:'#6e4222',metal:'#d4d8dc',paper:'#f0e8d0',cover:'#963224'}},
  mortimer:{name:'Dr. Mortimer',face:{specs:true},tall:74,own:true,cos:castOwn,
    look:{skin:'#e8ccb6',hair:'#5c4634',shirt:'#363438',coat:'#363438',vest:'#2c2a2e',tie:'#1c1c20',linen:'#e2dccb',pants:'#605c58',shoes:'#1e1a1a',gold:'#e0c060',wood:'#6e4222',metal:'#d4d8dc',paper:'#f4ecd8',ember:'#ffb050'}},
  dog:{name:'the spaniel',dog:true,cos:()=>DOG3D,look:{fur:'#f0eae0',fur2:'#7a3c22',hair:'#1c1412'}}};
for(const k in CAST){ const c=CAST[k]; c.id=k; c.ramp=RIG.ramp32(c.look); c.dens=c.tall?Math.round(52*c.tall*.0254/1.75)/52:1; c.cloud=null; c.baker=null; }
// baked a piece at a time while you're near (each piece a few ms; 4 ms a frame at most): true once all are ready
// THEIR FINER PICTURE (owner, 14 Oct 2026: "increase resolution of characters at that level"): once they're dressed, each is baked again
// twice as fine (points half as far apart, c.fine) and drawn from then on at two of his pixels to an art pixel (castDraw's r)
function castBake(){ const t0=performance.now(); let all=true;
  for(const c of Object.values(CAST)){ if(c.cloud)continue; all=false; c.baker=c.baker||RIG.baker(.5,1,null,null,null,c.cos);
    while(performance.now()-t0<4){ const r=c.baker.next(); if(r.done){ c.cloud=r.value; c.baker=null; break; } } if(performance.now()-t0>=4)break; }
  if(all)for(const c of Object.values(CAST)){ if(c.fine)continue; c.fbaker=c.fbaker||RIG.baker(.25,2,null,null,null,c.cos);
    while(performance.now()-t0<4){ const r=c.fbaker.next(); if(r.done){ c.fine=r.value; c.fbaker=null; break; } } if(performance.now()-t0>=4)break; }
  if(PERF)PERF.add('221B: dressing the players (once)',performance.now()-t0); return all&&Object.values(CAST).every(c=>c.cloud); }
// ---- POSES (12-walker-rig's keys: degrees, ik: an ankle planted; hands: where his hands go, in his body: armIK). Standing ones from his
// standing; sitting ones with his seat under him (the chair's: his place is its seat, his feet a step forward)
const POSES={
  stand:{}, easy:{root:[.5,RIG.STAND-.15,0],pyaw:3,side:-1.5,L:{ik:[RIG.FOOTX+.5,RIG.ANKLE,1.2]},R:{ik:[-RIG.FOOTX,RIG.ANKLE,-.5]}},
  behind:{L:{ua:[-22,14],fa:[-62,-30]},R:{ua:[-22,14],fa:[-62,-30]},nod:-3},                                          // hands clasped behind (Holmes, thinking)
  folded:{hands:{L:[-3.2,26.4,5.6],R:[3.2,26.8,5.9]}},                                                               // arms folded
  gesture:{R:{ua:[28,16],fa:[84,8]}}, open:{L:{ua:[24,24],fa:[70,20]},R:{ua:[24,24],fa:[70,20]}},                    // a hand out as he talks; both
  point:{R:{ua:[78,6],fa:[84,4]}}, wave:{R:{ua:[48,46],fa:[52,52]},cyaw:-10},                                        // pointing; waving one into a chair
  offer:{R:{ua:[52,10],fa:[64,6]}}, reach:{R:{ua:[64,8],fa:[70,4]},bend:8},                                          // holding out; reaching for
  bendDown:{bend:42,nod:-14,root:[0,RIG.STAND-2.4,-1.5],R:{ua:[70,4],fa:[78,2]},L:{ua:[20,10],fa:[30,10]}},           // stooping to pick something up
  examine:{hands:{L:[4.6,27.2,9.4],R:[-4.6,27.2,9.4]},nod:20},                                                       // the stick across both hands
  holdUp:{hands:{R:[-2.6,33,10.5]},nod:8},                                                                           // the stick held up to the eye
  lens:{hands:{R:[-1.6,41,8.2],L:[2.6,33.5,11]},nod:6,bend:6},                                                       // the lens to his eye, the stick in the other hand
  read:{hands:{L:[3.4,28.5,10],R:[-3.4,28.5,10]},nod:22},                                                            // reading the book open in his hands
  carry:{R:{ua:[14,10],fa:[40,8]}}, carryL:{L:{ua:[14,10],fa:[40,8]}},                                                // a thing in one hand at his side
  smoke:{hands:{R:[-1.2,38.6,8.4]},nod:-2},                                                                          // the cigarette at his lips
  peer:{bend:16,nod:-12,root:[0,RIG.STAND-.6,0]},                                                                    // Mortimer: peering, his head thrust forward
  skull:{bend:20,nod:-14,root:[0,RIG.STAND-.8,0],hands:{R:[-1,44,15]}},                                               // a finger out toward Holmes's skull
  sit:{root:[0,15,0],bend:-3,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,7]},R:{ik:[-RIG.FOOTX-.4,RIG.ANKLE,7]},hands:{L:[4.6,17.6,7.2],R:[-4.6,17.6,7.2]}},
  sitTable:{root:[0,15,0],bend:6,nod:6,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,7]},R:{ik:[-RIG.FOOTX-.4,RIG.ANKLE,7]},hands:{L:[3.6,21.6,11.5],R:[-3.6,21.6,11.5]}},
  sitCup:{root:[0,15,0],bend:4,nod:2,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,7]},R:{ik:[-RIG.FOOTX-.4,RIG.ANKLE,7]},hands:{L:[3.6,21.6,11.5],R:[-1.4,36.5,8.6]}},
  sitBack:{root:[0,14.6,-1.2],bend:-12,nod:-12,L:{ik:[RIG.FOOTX+1.2,RIG.ANKLE,9.5]},R:{ik:[-RIG.FOOTX,RIG.ANKLE,6.5]},hands:{L:[6,20.5,1],R:[-1.2,38,8.4]}},
  sitRoll:{root:[0,15,0],bend:10,nod:14,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,7]},R:{ik:[-RIG.FOOTX-.4,RIG.ANKLE,7]},hands:{L:[1.3,23,9.6],R:[-1.3,23,9.6]}},
  sitStick:{root:[0,15,0],bend:4,L:{ik:[RIG.FOOTX+.8,RIG.ANKLE,7]},R:{ik:[-RIG.FOOTX-.8,RIG.ANKLE,7]},hands:{L:[.8,26.5,10.6],R:[-.8,25.4,10.6]}},
  lie:{}, trot:{}, dsit:{}};   // (the spaniel's: castDog)
// HIS HANDS WHERE THEY MUST BE: an arm reaching a point (in his upper body, from his feet: as the shoulder sees it), the elbow out, down and
// back as an arm's goes; the upper arm's and the forearm's directions as the pose's angles (12's limb, inverted)
function armIK(P,n,T){ const {V,sub,add,mul,len,nrm,cross,dot}=RIG, s=n=='L'?1:-1, U=7.4, F=6.3, S=V(s*6.8,13.3,0), d0=sub(T,add(S,V(0,RIG.STAND,0)));
  let L=Math.min(U+F-.05,Math.max(Math.abs(U-F)+.5,len(d0))); const u=nrm(d0), a=(U*U-F*F+L*L)/(2*L), h=Math.sqrt(Math.max(0,U*U-a*a));
  let pole=V(s*.45,-1,-.35); pole=nrm(sub(pole,mul(u,dot(pole,u)))); const E=add(mul(u,a),mul(pole,h)), Wr=mul(u,L), fa=nrm(sub(Wr,E)), ua=nrm(E);
  const ang=v=>[Math.atan2(v.z,-v.y),Math.asin(Math.max(-1,Math.min(1,s*v.x)))]; P[n].ua=ang(ua); P[n].fa=ang(fa); }
// a pose from its keys, his hands put (the root's height counts: sitting, his shoulders are lower)
const POSEC=new Map();
function castPose(name){ let P=POSEC.get(name); if(P)return P; const k=POSES[name]||{}, {hands,...c}=k; P=RIG.apply(castStand(),c);
  if(hands)for(const n in hands){ const T=hands[n], r=P.root; armIK(P,n,CV(T[0]-r.x,T[1]-(r.y-RIG.STAND),T[2]-r.z)); }
  P.hands=!!hands||!!(k.L&&k.L.ua)||!!(k.R&&k.R.ua); POSEC.set(name,P); return P; }
let CASTSTAND=null; const castStand=()=>CASTSTAND||(CASTSTAND=RIG.apply(RIG.walkPose({ph:0,w:0,run:0},null),RIG.STANDK));   // (standing, his feet planted)
// ---- A PLAYER: where he is (x, y on the floor, tiles; hd: which way he faces, the world's angle), his walk (12's state), the pose he's
// in and the one he's going to (blended over T seconds), his place (a seat: sitting), what he holds in which hand and how, whom he looks
// at, whether he's speaking; his picture
function castNew(id,x,y,hd){ const c=CAST[id]; return {id,c,x,y,hd,st:RIG.create(),d0:0,path:null,pose:c.dog?'stand':'stand',from:null,to:null,bt:1,bT:.6,P:null,
  hold:{},look:null,say:0,slide:null,cv:document.createElement('canvas'),im:null,buf:null,key:0,drawn:-1e9,light:'',lightAt:-1e9,Lc:null,box:null,ph:0,t:0,dog:c.dog?{mode:'stand',ph:0,w:0,lay:0}:null,
  sig:''}; }
// which way is his left, in the world (his heading turned a quarter, the way the view shows it: 12's x is his left)
const castLeft=hd=>{ const [u,v]=vwV(Math.cos(hd),Math.sin(hd)); return wvV(v,-u); };
// a point of his (12's units: x his left, y up, z ahead, from his feet) in the world: [x, y, z] tiles
function castWorld(a,p){ const [lx,ly]=castLeft(a.hd), fx=Math.cos(a.hd), fy=Math.sin(a.hd), k=1/POOLU*(a.c.dens||1);
  return [a.x+(p.z*fx+p.x*lx)*k,a.y+(p.z*fy+p.x*ly)*k,p.y/24*(a.c.dens||1)]; }
// a point in the world in his frame (his units): for looking at it
function castLocal(a,w){ const [lx,ly]=castLeft(a.hd), fx=Math.cos(a.hd), fy=Math.sin(a.hd), dx=(w[0]-a.x)*POOLU, dy=(w[1]-a.y)*POOLU; return CV(dx*lx+dy*ly,(w[2]||0)*24,dx*fx+dy*fy); }
// a held thing's frame (12's draw: P.props), from his hand: how he holds it (mode)
function castProps(a,B){ const {V,add,sub,mul,nrm,cross}=RIG, J=B.J, out={}, fr=(o,y,zr)=>{ y=nrm(y); let x=cross(y,zr||V(0,0,1)); if(RIG.len(x)<.2)x=cross(y,V(1,0,0)); x=nrm(x); return {o,x,y,z:cross(x,y)}; };
  for(const n in a.hold){ const h=a.hold[n]; if(!h)continue; const W=J['wrist'+n], Pm=J['palm'+n], f=nrm(sub(J['fingers'+n],W));
    if(h.p=='stick'){ let ax, at;
      if(h.m=='across'){ const A=J.palmL, Bp=J.palmR; ax=nrm(sub(A,Bp)); out.stick=fr(sub(mul(add(A,Bp),.5),mul(ax,13.5)),ax); continue; }
      if(h.m=='up'){ ax=V(.15,.8,.55); at=8; } else if(h.m=='out'){ ax=f; at=5; } else if(h.m=='knees'){ ax=V(0,1,-.12); at=25; } else { ax=V(0,-.42,1); at=16; }
      ax=nrm(ax); out.stick=fr(sub(Pm,mul(ax,at)),ax); }
    else if(h.p=='lens')out.lens=fr(sub(Pm,mul(f,1.2)),f,V(0,0,-1));
    else if(h.p=='book')out.book=fr(add(Pm,mul(f,1.6)),V(0,1,0));
    else if(h.p=='bookO'){ const m=mul(add(J.palmL,J.palmR),.5); out.bookO=fr(add(m,V(0,1.2,0)),V(0,.75,-.65),V(1,0,0)); }
    else if(h.p=='cig')out.cig=fr(sub(J['fingers'+n],mul(f,.3)),add(f,V(0,.6,0)));
    else if(h.p=='cpaper')out.cpaper=fr(add(Pm,mul(f,1.2)),V(0,1,0)); }
  return out; }
// ---- EACH FRAME, A PLAYER: his walk along his path (12's gait: his feet move him, so they never slide; he turns on the spot first), his
// slide into or out of a seat, his pose (the walk's legs under it while he walks; the blend into a new one), what's alive in him (his
// breath, his head turning to whom he looks at, his hand and head as he speaks, his mouth), then his skeleton and what he holds
function castStep(a,dt,now){ const st=a.st; a.t+=dt;
  if(a.dog)return castDogStep(a,dt);
  let go=false;
  if(a.path&&a.path.length){ const [tx,ty]=a.path[0], dx=tx-a.x, dy=ty-a.y, d=Math.hypot(dx,dy);
    if(d<.05){ a.path.shift(); if(!a.path.length){ a.path=null; if(a.end!=null)a.face=a.end; } }
    else{ const want=Math.atan2(dy,dx); let dd=want-a.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); const turn=2.6*Math.PI*dt; a.hd+=Math.max(-turn,Math.min(turn,dd));
      const block=a.blocked&&a.blocked(); go=Math.abs(dd)<.35&&!block; if(block)a.look={who:'you'}; } }
  else if(a.face!=null){ let dd=a.face-a.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); const turn=2*Math.PI*dt; a.hd+=Math.max(-turn,Math.min(turn,dd)); if(Math.abs(dd)<.01)a.face=null; }
  st.target=go?1:0; st.runTarget=a.hurry?.25:0; RIG.step(st,dt);
  const gone=(st.dist-a.d0)/POOLU*a.c.dens; a.d0=st.dist;
  if(go&&gone>0){ const [tx,ty]=a.path[0], left=Math.hypot(tx-a.x,ty-a.y), g=Math.min(gone,left); a.x+=Math.cos(a.hd)*g; a.y+=Math.sin(a.hd)*g; }
  if(a.slide){ const s=a.slide; s.t+=dt; const u=Math.min(1,s.t/s.T), e=u*u*(3-2*u); a.x=s.x0+(s.x1-s.x0)*e; a.y=s.y0+(s.y1-s.y0)*e; if(u>=1)a.slide=null; }
  // the pose: blending into the one asked for
  if(a.to!==a.pose||!a.P){ a.from=a.P?JSON.parse(JSON.stringify(a.P)):null; a.to=a.pose; a.bt=0; }
  a.bt+=dt; const T=castPose(a.pose), u=a.from?Math.min(1,a.bt/a.bT):1, e=u*u*(3-2*u); let P=u<1?RIG.mix(a.from,T,e):JSON.parse(JSON.stringify(T));
  // walking: his legs and his body from the walk, his arms too unless they hold something up
  const k=Math.min(1,st.w*2.4); if(k>0){ const W=RIG.walkPose(st,{L:6*RIG.D,R:6*RIG.D}), keep=T.hands?{L:P.L,R:P.R}:null; P=RIG.mix(P,W,k); if(keep){ P.L.ua=keep.L.ua; P.L.fa=keep.L.fa; P.R.ua=keep.R.ua; P.R.fa=keep.R.fa; } }
  // alive: breathing; looking at whom he looks at (his head, then his shoulders if it's far round); speaking (a nod, the hand that's free)
  P.bend+=Math.sin(a.t*1.6)*.5*RIG.D;
  let lk=0, nd=0; if(a.look){ const w=castLookAt(a.look); if(w){ const l=castLocal(a,w), hy=(P.root.y+25)*(a.c.dens||1); lk=Math.atan2(l.x,Math.max(.5,l.z)); if(l.z<0)lk=Math.sign(l.x)*Math.PI*.6; nd=-Math.atan2(l.y-hy,Math.hypot(l.x,l.z))*.6;
      if(Math.abs(lk)>1.15&&!a.path&&!a.seat&&!a.slide&&a.face==null&&a.turnTo!==false)a.face=Math.atan2(w[1]-a.y,w[0]-a.x); } }
  a.lk=(a.lk||0)+(Math.max(-1.1,Math.min(1.1,lk))-(a.lk||0))*Math.min(1,dt*5); a.nd=(a.nd||0)+(Math.max(-.4,Math.min(.4,nd))-(a.nd||0))*Math.min(1,dt*5);
  P.look+=a.lk*.75; P.cyaw+=a.lk*.25; P.nod+=a.nd;
  if(a.say>0){ a.say-=dt; P.nod+=Math.sin(a.t*6.5)*2.2*RIG.D*Math.min(1,a.say); if(!T.hands&&!a.hold.R&&k<.2&&a.talkHand!==false){ const g=castPose('gesture'), w=(.5+.5*Math.sin(a.t*1.9))*Math.min(1,a.say*2)*.8; P.R.ua=RIG.mix(P,g,w).R.ua; P.R.fa=RIG.mix(P,g,w).R.fa; } }
  if(a.fingers){ const w=Math.sin(a.t*9)*3*RIG.D; P.L.fa[0]+=w; P.R.fa[0]-=w; }   // (rolling a cigarette: his long quivering fingers)
  castHit(a,P,dt,now);
  a.P=P; const B=RIG.settle(RIG.build(P,null),0); B.head=B.J.head; B.props=castProps(a,B); a.B=B;
  a.mouth=a.say>0&&Math.sin(a.t*17)+Math.sin(a.t*7.3)>.2; }
// ---- HIT (owner, 15 Oct 2026: "if i punch a character they will react real physics, make it understated (they shouldn't go fly off)
// but it should effect them slightly like a real punch or kick"): your strikes (47-ragdoll's ragStrikes: your fists and feet while they
// move fast, PHYOU.strikes, world tiles) landing in him. The blow goes into his joints as damped springs (his waist and neck knocked the
// way it went, his knees giving under a low one or a kick), which spring him back to what he was doing in about half a second; a kick or
// a hard punch shoves him back a few inches on his feet (never out of a seat); he looks at you for a moment. Nothing knocks him down: the
// eleven-body ragdoll (47-ragdoll) is yours alone, and off.
const HITK=140, HITC=21;   // the springs: stiffness and damping, near critical (one rock back and he's back)
function castHit(a,P,dt,now){ const h=a.hit||(a.hit={b:0,bv:0,s:0,sv:0,n:0,nv:0,l:0,lv:0,k:0,kv:0,vx:0,vy:0,at:-1e9});
  const S=typeof PHYOU!=='undefined'&&PHYOU.strikes;
  if(S&&S.length&&now-h.at>300){ const dn=a.c.dens||1, [lx,ly]=castLeft(a.hd), fx=Math.cos(a.hd), fy=Math.sin(a.hd);
    for(const s of S){ const dx=s.p[0]-a.x, dy=s.p[1]-a.y; if(Math.hypot(dx,dy)>.3+s.r)continue; const y=s.p[2]*RT/dn; if(y<0||y>58)continue;   // (RT: the strikes' heights are in the ragdoll's metric: 47-ragdoll)
      const sp=Math.hypot(s.v[0],s.v[1]); if(sp<1e-3)continue; const ux=s.v[0]/sp, uy=s.v[1]/sp, kx=ux*lx+uy*ly, kz=ux*fx+uy*fy, w=Math.min(1,sp/7), kick=s.r>.095, head=y>44, low=y<24, v=(kick?5.5:4.2)*w;   // (kx, kz: the way the blow went, across him and along him)
      h.at=now; h.bv+=kz*v*(head?.5:1); h.sv-=kx*v*(head?.5:1); h.nv+=kz*v*(head?2.2:.8); h.lv+=kx*v*(head?1.4:.3); if(low||kick)h.kv+=3.5*w;
      if(!a.seat&&!a.slide){ const sh=(kick?.11:.06)*w*8; h.vx+=ux*sh; h.vy+=uy*sh; }
      if(!(a.look&&a.look.hit)){ a.hitLook=a.look||null; a.look={who:'you',hit:true}; } a.hitT=2.5; break; } }
  for(let left=dt;left>0;left-=.02){ const e=Math.min(.02,left); for(const [x,v] of [['b','bv'],['s','sv'],['n','nv'],['l','lv'],['k','kv']]){ h[v]+=(-HITK*h[x]-HITC*h[v])*e; h[x]+=h[v]*e; } }
  if(Math.abs(h.vx)+Math.abs(h.vy)>1e-4){ a.x+=h.vx*dt; a.y+=h.vy*dt; const f=Math.exp(-9*dt); h.vx*=f; h.vy*=f; }
  P.bend+=h.b; P.side+=h.s; P.nod+=h.n; P.look+=h.l; if(h.k>0)P.root=RIG.V(P.root.x,P.root.y-Math.min(6,h.k*4),P.root.z);
  if(a.hitT>0){ a.hitT-=dt; if(a.hitT<=0&&a.look&&a.look.hit){ a.look=a.hitLook; a.hitLook=null; } } }
// whom (or what) he looks at: another of them (his head), you, a point
function castLookAt(o){ if(o.who=='you')return [P.x,P.y,(P.h-LVZ(LEVEL)+P.z)/24+1.9]; if(o.who){ const b=PLAYA[o.who]; return b?[b.x,b.y,b.dog?.6:(b.seat?1.5:1.95)*(b.c.dens||1)]:null; } return o.at||null; }
// ---- THE SPANIEL'S SKELETON: his body and head, four legs swinging in a trot (the diagonal pairs together), his ears and his tail; standing,
// sitting or lying at his master's feet; he follows Mortimer
function castDogStep(a,dt){ const D=a.dog, {V,add}=RIG; let go=false;
  if(a.path&&a.path.length){ const [tx,ty]=a.path[0], dx=tx-a.x, dy=ty-a.y, d=Math.hypot(dx,dy);
    if(d<.06){ a.path.shift(); if(!a.path.length){ a.path=null; if(a.end!=null)a.face=a.end; } }
    else{ const want=Math.atan2(dy,dx); let dd=want-a.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); a.hd+=Math.max(-6*dt,Math.min(6*dt,dd)); go=Math.abs(dd)<.6;
      if(go){ const sp=Math.min(d,(a.hurry?1.5:.85)*dt); a.x+=Math.cos(a.hd)*sp; a.y+=Math.sin(a.hd)*sp; } } }
  else if(a.face!=null){ let dd=a.face-a.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); a.hd+=Math.max(-4*dt,Math.min(4*dt,dd)); if(Math.abs(dd)<.02)a.face=null; }
  D.w+=((go?1:0)-D.w)*Math.min(1,dt*6); D.ph=(D.ph+dt*(a.hurry?3.2:2.4)*(.3+.7*D.w))%1;
  const want=a.pose=='lie'?1:a.pose=='dsit'?.5:0; D.lay+=(want-D.lay)*Math.min(1,dt*2.5);
  const tw=Math.PI*2, swing=(o)=>Math.sin((D.ph+o)*tw)*.55*D.w, lie=Math.max(0,D.lay*2-1), sit=Math.min(1,D.lay*2)*(1-lie);
  const by=8-lie*4.4-sit*1.5+Math.abs(Math.sin(D.ph*tw*2))*.25*D.w, pitch=-sit*.45, rx=(t)=>({y:V(0,Math.cos(t),Math.sin(t)),z:V(0,-Math.sin(t),Math.cos(t))});
  const bodyF={o:V(0,by,0),x:V(1,0,0),...rx(pitch)}, at=(p)=>add(bodyF.o,add(add(mul3(bodyF.x,p.x),mul3(bodyF.y,p.y)),mul3(bodyF.z,p.z)));
  const fr={}, legF=(n,j,t)=>{ const r=rx(t+pitch); fr[n]={o:at(j),x:V(1,0,0),y:r.y,z:r.z}; };
  const fold=lie*-1.45, fsit=sit;
  legF('dLegFL',V(1.5,-.6,4),swing(0)+fold); legF('dLegFR',V(-1.5,-.6,4),swing(.5)+fold); legF('dLegBL',V(1.7,-.3,-4),swing(.5)-fsit*1.3+lie*1.5); legF('dLegBR',V(-1.7,-.3,-4),swing(0)-fsit*1.3+lie*1.5);
  fr.dBody=bodyF;
  const look=a.look?castLookAt(a.look):null, l=look?castLocal(a,look):null, hy=l?Math.max(-.6,Math.min(.6,Math.atan2(l.x,Math.max(1,l.z)))):0;
  const hp=-.1-sit*.1+lie*.25+Math.sin(a.t*1.3)*.04, c=Math.cos(hy), s=Math.sin(hy), hx=V(c,0,-s), hz0=V(s,0,c), hy0=V(0,1,0), hyv=add(mul3(hy0,Math.cos(hp)),mul3(hz0,Math.sin(hp))), hzv=add(mul3(hz0,Math.cos(hp)),mul3(hy0,-Math.sin(hp)));
  const ho=at(V(0,2.8,5.6)); fr.dHead={o:ho,x:hx,y:hyv,z:hzv}; const hat=p=>add(ho,add(add(mul3(hx,p.x),mul3(hyv,p.y)),mul3(hzv,p.z)));
  const ew=Math.sin(a.t*3+D.ph*tw)*.18*(.3+D.w); for(const [n,sx] of [['dEarL',1],['dEarR',-1]]){ const t=ew*sx; fr[n]={o:hat(V(sx*1.85,2.3,.9)),x:hx,y:add(mul3(hyv,Math.cos(t)),mul3(hzv,Math.sin(t))),z:add(mul3(hzv,Math.cos(t)),mul3(hyv,-Math.sin(t)))}; }
  const wag=Math.sin(a.t*(lie?6:13))*(lie?.25:.6), wc=Math.cos(wag), ws=Math.sin(wag); fr.dTail={o:at(V(0,1.3,-5.5)),x:V(wc,0,-ws),y:bodyF.y,z:V(ws,0,wc)};
  a.B={props:fr}; a.sig=[Math.round(D.ph*24),Math.round(D.lay*20),Math.round(hy*20),Math.round(wag*8),Math.round(ew*10),Math.round(a.hd*60)].join(); }
const mul3=(v,k)=>CV(v.x*k,v.y*k,v.z*k);
// ---- DRAWING ONE: into his own picture (12's draw), at his height, turned to the way he faces as the view shows it, the pieces he isn't
// holding left out, his mouth open or shut; lit where he stands (the light looked up about once a second, in steps), his shadow under him;
// painted again only when he's changed, at most 30 times a second (CASTMS a frame for all of them; one kept waiting is drawn anyway)
const CASTMS=4, CIW=88, CIH=104, CAX=44, CAY=94;
function castDraw(a,now,t0){ if(!a.B||!a.c.cloud)return false;
  const [u,v]=vwV(Math.cos(a.hd),Math.sin(a.hd)), yawA=a.watch?(a.c.watchYaw??MUSYAW):Math.atan2(u-v,u+v);   // (watched playing: turned a little, the view that shows both hands and every finger: 47-zz-bar)
  if(now-a.lightAt>1000){ a.lightAt=now-Math.random()*300; const env=envNear(a.x,a.y), L=env?lightAt(env,a.x,a.y,30/24,null):null; a.light=L?L.map(v=>Math.round(v*12)).join():''; a.Lc=L?(m=>L.map(v=>Math.min(1.15,Math.max(Math.round((v*.55+m*.45)*12)/12,CHARMIN))))((L[0]+L[1]+L[2])/3):null; }   // (half the light's colour: the fire's doesn't turn him orange)
  const hide={}; for(const n of ['stick','lens','book','bookO','cig','cpaper'])hide[n]=true; for(const n in a.hold)if(a.hold[n])hide[a.hold[n].p]=false;
  const sig=a.dog?a.sig:JSON.stringify(a.P,(k,v)=>typeof v=='number'?Math.round(v*100):v)+Object.keys(a.B.props).join()+a.mouth+(a.sigx||''), key=sig+'|'+yawA.toFixed(3)+'|'+a.light+'|'+(a.watch?3:npcShade());   // (his shadows at the npcs' level: the admin menu's row, 44)   // (to a hundredth: a breath shows now and then, not every frame)
  // (r: his pixels to an art pixel: the world's detail, one resolution for everything (44, 47-you-jointed's charRes), once his pieces are baked
  // that fine (castCloud: each resolution once, a little each frame: 4 ms, or most of the frame while he's watched and it isn't done,
  // so the watch is sharp in a second or two rather than blocky for a minute, owner, 15 Oct 2026); till then the finest he has)
  const want=a.watch?Math.max(musR(a.c),charRes(S)):charRes(S), cl=castCloud(a.c,want,a.watch?24:4), r=cl?want:a.c.fine&&want>=2?2:1; if(r!==a.r){ a.r=r; a.im=null; a.lastKey=null; }   // (a.watch: watched playing, MUSR of his pixels to an art pixel: 47-zz-bar's musWatch)
  if(key===a.lastKey||now-a.drawn<33||performance.now()-t0>CASTMS&&now-a.drawn<200)return false;
  a.lastKey=key; a.drawn=now; const W=(a.c.W||CIW)*r, H=(a.c.H||CIH)*r, AX=(a.c.AX||CAX)*r, AY=(a.c.AY||CAY)*r;   // (his own picture's size, when a cast member has one)
  if(!a.im){ a.cv.width=W; a.cv.height=H; a.im=a.cv.getContext('2d').createImageData(W,H); a.buf=new Uint32Array(a.im.data.buffer); }
  const shd=RIG.shade(), sft=RIG.soft(); RIG.shade(a.watch?3:npcShade()); RIG.soft(a.watch?MUSSOFT:null); RIG.draw(a.B,cl&&r===want?cl:r>1?a.c.fine:a.c.cloud,yawA,a.buf,W,H,AX,AY,a.c.dens*r,false,a.c.ramp,hide); RIG.shade(shd); RIG.soft(sft); if(!a.dog&&!a.c.own)castFace(a,yawA,r); if(a.id==='walker'&&!a.watch)gtStrings(a,yawA,r); if(a.draw2)a.draw2(a,yawA,r);   // (drawn with the npcs' shadows, yours put back; watched, his hands without outlines, shaded only; the Walker his own face; his guitar's strings: 47-play-3-guitar; watched, the window draws them finer)
  const D=a.im.data, Lc=a.Lc||[1,1,1]; for(let i=0;i<D.length;i+=4)if(D[i+3]){ D[i]*=Lc[0]; D[i+1]*=Lc[1]; D[i+2]*=Lc[2]; }
  const rx=Math.round((a.dog?7:9)*r), ry=(a.dog?1.6:2)*r; for(let j=-Math.round(2*r);j<=Math.round(2*r);j++)for(let x=-rx;x<=rx;x++){ if(x*x/(rx*rx)+j*j/(ry*ry)>1)continue; const i=((AY+j)*W+AX+x)*4; if(D[i+3])continue; D[i+3]=55; }   // his shadow
  a.cv.getContext('2d').putImageData(a.im,0,0); a.key++; return true; }   // (its time on the caller's row: 221B's players, the bar's people, 47-play-2-scene, 47-zz-bar)
function castCloud(c,r,ms=4){ if(r<=1)return c.cloud; if(r===2&&c.fine)return c.fine; if(c.shared)return null; const R=c.res||(c.res={}), w=R[r]||(R[r]={c:null,b:null}); if(w.c)return w.c; if(!c.cloud)return null;   // (shared: a costume baked once for all who wear it, no finer than twice)
  const t0=performance.now(); w.b=w.b||RIG.baker(0.5/r,r,null,r>2&&c.watchOnly||null,null,c.cos); /* (watchOnly: finer than twice, only what the close-up shows: its pieces, a test by name) */ while(performance.now()-t0<ms){ const x=w.b.next(); if(x.done){ w.c=x.value; w.b=null; break; } }
  if(PERF)PERF.add('characters: baked finer (once)',performance.now()-t0); return w.c; }
// HIS FACE IN PIXELS (owner, 14 Oct 2026: "weird pixelation on face"): at his size an eye is one pixel, so the eyes, the mouth (open now and
// then as he speaks), Watson's moustache and Mortimer's gold-rimmed glasses are put down as exact pixels where the head he's drawn with
// has them (its frame, 12's frameOf), each only when its side of the face is toward you and nothing of him is in front of it (his depth)
function castFace(a,yawA,r=1){ const B=a.B, F=RIG.frameOf('head',B), {add,mul}=RIG, V=CV, k=a.c.dens*r, W=(a.c.W||CIW)*r, H=(a.c.H||CIH)*r, CAX=a.c.AX||44, CAY=a.c.AY||94, dep=RIG.depth(W*H), buf=a.buf, R=a.c.ramp, M=RIG.MATS, f=a.c.face||{};
  const at=v=>add(F.o,add(add(mul(F.x,v.x),mul(F.y,v.y)),mul(F.z,v.z))), dir=v=>add(add(mul(F.x,v.x),mul(F.y,v.y)),mul(F.z,v.z));
  const put=(v,n,c,dx=0,dy=0)=>{ const p=RIG.project(at(v),yawA); if(RIG.project(dir(n),yawA)[2]>-.2)return;   // (turned away from you)
    const x=Math.floor(CAX*r+p[0]*k)+dx, y=Math.floor(CAY*r+p[1]*k)+dy; if(x<0||y<0||x>=W||y>=H)return; const i=y*W+x; if(!buf[i]||dep[i]<p[2]-1.4)return; buf[i]=c; };   // (finer: a feature a pixel of his, half an art pixel)
  const col=(m,t)=>R[M.indexOf(m)][t], eye=0xff1c1416, lip=col('skin',3), hair=col('hair',2), gold=col('gold',1);
  for(const s of [1,-1]){ const n=V(s*.55,0,1), e=V(s*2.4,.6,6.2); put(e,n,eye); if(r>1)put(e,n,eye,0,1); if(f.specs){ put(e,n,gold,s*r,0); put(e,n,gold,s*r,1); put(e,n,gold,0,-1); put(e,n,gold,-s,-1); } }   // (finer: an eye two of his pixels tall)
  if(f.specs)put(V(0,.9,6.3),V(0,0,1),gold);
  const mo=V(0,-4.6,6.1), n0=V(0,0,1); put(mo,n0,lip); if(r>1){ put(mo,n0,lip,-1,0); put(mo,n0,lip,1,0); } if(a.mouth){ put(mo,n0,eye); put(mo,n0,eye,0,1); if(r>1){ put(mo,n0,eye,-1,0); put(mo,n0,eye,1,0); put(mo,n0,eye,0,2); } }
  if(f.tache)for(let x=-1.8;x<=1.81;x+=r>1?.6:1.8)put(V(x,-3.4,6.2-Math.abs(x)*.18),V(x*.3,0,1),hair); }````

### 9.9 Old game: src/47-play-2-scene.js

221B's chapter-one scene.

````js
// =====================================================================================
// THE PLAYERS, 2: THE SCENE (owner, 14 Oct 2026: "have them act out one of the scenes in the room. recreate as accurate as possible. cut
// to close ups of characters and angles for dramatic story telling, but only a few times, make sure it doesnt lag"; his picks: the
// walking stick, chapter 1, in a 221B of its own, "loop it"). The Hound of the Baskervilles, chapter 1, "Mr. Sherlock Holmes", in the
// book's own words (cut to about two minutes; "…" where words are left out), played live in the room by the cast (47-play-1-cast)
// whenever you're there: from the start when you come in, then again and again (a fade to black between). You're in the room with them:
// you walk among them, they can't walk through you (they wait, look at you, and the scene waits with them), they glance at you when
// you come close, you're solid to them and they to you (PHYSOLID, 30-walking). The book's lines at the foot of the screen; three times the
// camera cuts in close (CAMCUT, 44: the view in on them, black bars top and bottom, back to yours when it's done or the moment you move).
// Their footsteps, the fire's crackle, the door's bell (47-sound's bursts). Everything runs only while you're there (SRM's tick: 47-physics-7).
// =====================================================================================
var ACTDRAW=null;   // the players' pictures this frame (45's movers)
const PLAYA={};     // the players by who they are
const PLAY221={t:0,started:false,seen:-1e9,wait:0,i:0,cut:null,line:null,lineEnd:0,END:152,fade:false,lastCast:0,glance:{}};
const PX221=u=>SR221.x0+u, PY221=v=>SR221.y0+v, PW=(u,v)=>[PX221(u),PY221(v)];
const A0=0, A90=Math.PI/2, A180=Math.PI, A270=-Math.PI/2;
// ---- THE LINES AT THE FOOT OF THE SCREEN, and the bars
const subEl=document.createElement('div'); subEl.id='sub221'; subEl.hidden=true; subEl.innerHTML='<b></b><span></span>'; document.body.appendChild(subEl);
const barEls=['top','bot'].map(k=>{ const e=document.createElement('div'); e.className='bar221 '+k; document.body.appendChild(e); return e; });
function playLine(who,text,dur){ const a=who&&PLAYA[who], [n,t]=subEl.children; n.textContent=a?a.c.name:''; t.textContent=text; subEl.classList.toggle('cap',!a); subEl.hidden=false;
  PLAY221.lineEnd=PLAY221.t+dur; if(a){ a.say=dur; for(const b of Object.values(PLAYA))if(b!==a&&!b.lookHold)b.look={who}; } }
const playBars=on=>{ for(const e of barEls)e.classList.toggle('on',on); };
// ---- THE CAMERA, CUT IN CLOSE: the view zoomed in (the detail held where it was, so nothing is painted again) and moved so what's
// filmed is in the middle of the screen; while it's on, the camera's own following is off (CAMCUT, 44)
// (owner, 14 Oct 2026: "make the faces bigger in close ups": the cut's zoom by the screen's height, h art px of him filling about half of
// it (a head and shoulders: 28), past the wheel's zooms; your zoom itself untouched)
function playCut(at,h,dur){ if(PLAY221.cut)playCutEnd(); if(P.moving)return;
  PLAY221.cut={at,end:PLAY221.t+dur,det:DETSET,px:PX,py:PY,S:Math.min(28,Math.max(ZOOM+2,Math.round(RH*.5/h)))}; DETSET=DET; CAMCUT=PLAY221.cut; layout(); playBars(true); playCutAim(); }
function playCutAim(){ const c=PLAY221.cut, w=c.at(); if(!w)return; const [sx,sy]=toS(...vw(w[0],w[1])), [px,py]=toS(...vw(P.x,P.y)), dz=w[2]*24-(P.h-LVZ(LEVEL)+P.z);
  const x=Math.round(-(sx-px)*S), y=Math.round(Math.floor(ch/2)-FY-(sy-py-dz)*S); if(x!==PX||y!==PY){ PX=x; PY=y; const [,,ax,ay]=dims(); man.style.transform=slide(FX+PX-ax*S,FY+PY-ay*S); dirty=true; checkView(); } }
function playCutEnd(){ const c=PLAY221.cut; if(!c)return; PLAY221.cut=null; CAMCUT=null; DETSET=c.det; if(CAM.mode==='current')[PX,PY]=[c.px,c.py]; layout(); playBars(false); }   // (the current camera: back where you'd dragged it)
// ---- SOUND: their footsteps on the boards (fainter the farther), the fire, the bell at the street door below
function playSnd(k,a){ const c=SND.ctx; if(!c||!SND.on||c.state!=='running')return; const d=a?Math.hypot(a.x-P.x,a.y-P.y):2, v=Math.max(0,1-d/12);
  if(k==='step')sndBurst('bandpass',(a.dog?1700:700)*(.9+Math.random()*.2),1.4,a.dog?.04:.07,(a.dog?.05:.16)*v,.003);
  else if(k==='fire')sndBurst('highpass',2200+Math.random()*2000,.8,.03+Math.random()*.05,.04*v*Math.random(),.002);
  else if(k==='bell'){ const T=c.currentTime; for(let i=0;i<5;i++)for(const f of [1310,1748]){ const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0,T+i*.14); g.gain.linearRampToValueAtTime(.05,T+i*.14+.005); g.gain.exponentialRampToValueAtTime(.001,T+i*.14+.5); o.connect(g); g.connect(SND.out); o.start(T+i*.14); o.stop(T+i*.14+.55); } } }
// ---- THE THINGS THEY PICK UP AND PUT DOWN: a thing of the room's (47-physics-7's named bodies) taken into a hand (out of the room's
// bodies: it's his to draw now), put down where it goes (back among them, awake: it falls, settles, tips as it will)
function playTake(who,n,body,prop,mode){ const a=PLAYA[who], b=SRM.named[body], i=b?SRM.bodies.indexOf(b):-1; if(i>=0){ SRM.bodies.splice(i,1); srGroups(); } a.hold[n]={p:prop,m:mode}; dirty=true; }
function playPut(who,n,body,u,v,zpx,q){ const a=PLAYA[who], b=SRM.named[body]; a.hold[n]=null; if(!b)return; b.x=[PX221(u),PY221(v),zpx/24]; b.q=q||[1,0,0,0]; b.m3=qMat(b.q); b.v=[0,0,0]; b.w=[0,0,0];
  if(!SRM.bodies.includes(b))SRM.bodies.push(b); phyWake(b); b.host=undefined; srGroups(); dirty=true; }
const playGive=(from,to,n,prop,mode)=>{ const h=PLAYA[from].hold[n]; PLAYA[from].hold[n]=null; PLAYA[to].hold.R={p:prop||h.p,m:mode||h.m}; };
// ---- MOVING THEM: walking a path (u, v in the room; he ends facing f); sitting down (his back to the seat, he lowers himself onto it: his
// place slides back onto the seat as his pose bends); standing up (the other way)
const playWalk=(who,pts,f,hurry)=>{ const a=PLAYA[who]; a.path=pts.map(([u,v])=>PW(u,v)); a.end=f; a.face=null; a.hurry=!!hurry; };
function playSit(who,u,v,f,pose,T=.9){ const a=PLAYA[who], [x,y]=PW(u,v); a.slide={x0:a.x,y0:a.y,x1:x,y1:y,t:0,T}; a.face=f; a.hd=f; a.seat=true; a.pose=pose||'sit'; a.bT=T; }
function playStand(who,pose,T=.8){ const a=PLAYA[who], [fx,fy]=[Math.cos(a.hd)*.2,Math.sin(a.hd)*.2]; a.slide={x0:a.x,y0:a.y,x1:a.x+fx,y1:a.y+fy,t:0,T}; a.seat=false; a.pose=pose||'stand'; a.bT=T; }
const playPose=(who,p,T=.6)=>{ const a=PLAYA[who]; a.pose=p; a.bT=T; };
const playLook=(who,o,hold)=>{ const a=PLAYA[who]; a.look=o; a.lookHold=!!hold; };
const playHead=(who,u,v,z)=>({at:[PX221(u),PY221(v),z]});
// a chair pushed back (Holmes rising from breakfast): moved along the floor as he pushes, then left to the physics
function playPush(body,du,dv,T){ const b=SRM.named[body]; if(b)PLAY221.push={b,du,dv,T,t:0}; }
// ---- THE SCRIPT: [when (seconds), what happens]. The book's words; who looks at whom; where they go; what they hold
const PLAYSCRIPT=[
  [0,()=>{ playLook('watson',{at:[PX221(.32),PY221(5.85),.5]},true); playLook('holmes',playHead(4.04,4.25,.95),true); }],
  [.3,()=>playWalk('watson',[[.95,5.55]],2.7)],
  [2.2,()=>playPose('watson','bendDown',.5)],
  [2.8,()=>{ playTake('watson','R','stick','stick','out'); }],
  [3.3,()=>{ PLAYA.watson.hold={R:{p:'stick',m:'across'}}; playPose('watson','examine',.7); playWalk('watson',[[2.1,4.75]],A0); PLAYA.watson.look=null; PLAYA.watson.lookHold=false; }],
  [4,()=>{ playLine(null,'"To James Mortimer, M.R.C.S., from his friends of the C.C.H."  1884',3.6); playCut(()=>{ const a=PLAYA.watson, J=a.B&&a.B.J; return J?castWorld(a,RIG.mul(RIG.add(J.palmL,J.palmR),.5)):null; },22,3.6); }],
  [7.8,()=>{ playLine('holmes','Well, Watson, what do you make of it?',2.4); PLAYA.holmes.talkHand=false; }],
  [10.3,()=>{ playLine('watson','How did you know what I was doing? I believe you have eyes in the back of your head.',3.8); playLook('watson',{who:'holmes'}); }],
  [14.2,()=>{ playLine('holmes','I have, at least, a well-polished, silver-plated coffee-pot in front of me.',3.4); playPose('holmes','sitCup',.8); }],
  [17.7,()=>{ playLine('watson','I think that Dr. Mortimer is a successful, elderly medical man, well-esteemed since those who know him give him this mark of their appreciation.',5); playWalk('watson',[[2.75,3.55]],.3); playPose('watson','holdUp'); PLAYA.watson.hold={R:{p:'stick',m:'up'}}; }],
  [22.8,()=>{ playLine('holmes','Good! Excellent!',1.6); playPose('holmes','sitTable'); }],
  [24.5,()=>{ playLine('watson','… a country practitioner who does a great deal of his visiting on foot. … The "C.C.H." … I should guess that to be the Something Hunt.',5); playPose('watson','carry'); PLAYA.watson.hold={R:{p:'stick',m:'out'}}; }],
  [29.6,()=>{ playPush('chairH',-.28,0,.6); const a=PLAYA.holmes, [x,y]=PW(3.33,4.3); a.slide={x0:a.x,y0:a.y,x1:x,y1:y,t:0,T:.6}; }],
  [30.2,()=>playStand('holmes','stand')],
  [31.1,()=>{ PLAYA.holmes.hold={R:{p:'cig',m:''}}; playPose('holmes','smoke',.5); playLine('holmes','Really, Watson, you excel yourself. … It may be that you are not yourself luminous, but you are a conductor of light.',5); PLAYA.holmes.lookHold=false; playLook('holmes',{who:'watson'}); }],
  [33.4,()=>{ playPose('holmes','stand'); playWalk('holmes',[[3.2,3.75]],A180+.4); PLAYA.holmes.hold={L:{p:'cig',m:''}}; }],
  [34.4,()=>{ playPose('watson','offer',.5); playLook('watson',{who:'holmes'}); }],
  [35.6,()=>playPose('holmes','reach',.3)],
  [36.1,()=>{ playGive('watson','holmes','R','stick','up'); PLAYA.holmes.hold={L:{p:'cig',m:''},R:{p:'stick',m:'up'}}; playPose('holmes','holdUp',.4); playPose('watson','stand'); PLAYA.holmes.look=null; }],
  [37.6,()=>{ playWalk('holmes',[[3.7,2.4],[5.2,1],[5.2,-.5]],A270); PLAYA.holmes.hold={L:{p:'stick',m:'up'}}; playPose('holmes','carryL'); playLook('watson',{who:'holmes'}); }],
  [44.4,()=>{ PLAYA.holmes.hold={L:{p:'stick',m:'up'},R:{p:'lens',m:''}}; playPose('holmes','lens',.6); }],
  [45.6,()=>playLine('holmes','Interesting, though elementary.',2)],
  [47.6,()=>{ playWalk('holmes',[[5.6,.95],[7.75,.95],[7.75,.75]],A90); PLAYA.holmes.hold={L:{p:'stick',m:'out'}}; playPose('holmes','carryL'); }],
  [47.8,()=>{ playLine('watson','Has anything escaped me? I trust that there is nothing of consequence which I have overlooked?',3.6); playPose('watson','folded'); }],
  [51.5,()=>playLine('holmes','I am afraid, my dear Watson, that most of your conclusions were erroneous.',3.4)],
  [53,()=>{ playSit('holmes',7.75,.55,A90,'sitBack',1); PLAYA.holmes.hold={L:{p:'stick',m:'out'},R:{p:'cig',m:''}}; }],
  [55,()=>playLine('holmes','… a presentation to a doctor is more likely to come from a hospital than from a hunt, and … the words "Charing Cross" very naturally suggest themselves.',5)],
  [60.1,()=>playLine('holmes','… a young fellow under thirty, amiable, unambitious, absent-minded, and the possessor of a favourite dog, which I should describe roughly as being larger than a terrier and smaller than a mastiff.',6.2)],
  [66.4,()=>{ playLine('watson','Ha! … at least it is not difficult to find out a few particulars about the man\'s age and professional career.',3.8); playPose('watson','stand'); playLook('holmes',{at:[PX221(7.75),PY221(2.5),4.6]},true); }],
  [67.2,()=>playWalk('watson',[[2.6,1.2],[1.5,.78]],A270)],
  [72.1,()=>{ playPose('watson','reach',.4); playLook('watson',playHead(1.5,.2,.9),true); }],
  [72.7,()=>{ playTake('watson','R','book','book',''); playPose('watson','carry',.4); }],
  [73.2,()=>{ PLAYA.watson.face=.1; PLAYA.watson.hold={L:{p:'bookO',m:''}}; playPose('watson','read',.6); PLAYA.watson.look=null; PLAYA.watson.lookHold=false; }],
  [73.8,()=>{ playLine('watson','"Mortimer, James, M.R.C.S., 1882, Grimpen, Dartmoor, Devon. House-surgeon, from 1880 to 1884, at Charing Cross Hospital. …"',5); PLAYA.watson.talkHand=false; }],
  [78.9,()=>{ playLine('holmes','No mention of that local hunt, Watson, but a country doctor, as you very astutely observed.',3.6); PLAYA.holmes.lookHold=false; playLook('holmes',{who:'watson'}); PLAYA.watson.hold={R:{p:'book',m:''}}; playPose('watson','carry'); }],
  [79.2,()=>playWalk('watson',[[3,2.2],[3.75,3.62]],A90)],
  [84.3,()=>playPose('watson','reach',.3)],
  [84.8,()=>{ playPut('watson','R','book',4.0,3.95,20.4,qAxis([0,1,0],Math.PI/2)); playPose('watson','stand'); }],
  [85,()=>{ playLine('watson','And the dog?',1.4); PLAYA.watson.face=-.55; PLAYA.watson.talkHand=true; }],
  [86.5,()=>{ playStand('holmes','stand'); PLAYA.holmes.hold={R:{p:'stick',m:'out'}}; }],
  [87,()=>{ playLine('holmes','Has been in the habit of carrying this stick behind his master. Being a heavy stick the dog has held it tightly by the middle, and the marks of his teeth are very plainly visible.',5.8); playWalk('holmes',[[6.6,1.9],[5.2,1],[5.2,-.5]],A270); }],
  [93.6,()=>{ playLine('holmes','It may have been—yes, by Jove, it is a curly-haired spaniel.',3.2); playLook('holmes',{at:[PX221(5.2),PY221(-4),0]},true); playLook('watson',{who:'holmes'}); }],
  [97,()=>playLine('watson','My dear fellow, how can you possibly be so sure of that?',2.6)],
  [99.8,()=>playLine('holmes','For the very simple reason that I see the dog himself on our very door-step, and there is the ring of its owner.',4.4)],
  [101.5,()=>playSnd('bell')],
  [101.8,()=>{ playWalk('mortimer',[[6,10.15],[6,9.2],[6,8.1]],A270); playWalk('dog',[[5.6,10.5],[5.6,9.3],[5.7,8.3]],A270); }],
  [104.4,()=>{ playLine('holmes','Don\'t move, I beg you, Watson. … Now is the dramatic moment of fate, Watson, when you hear a step upon the stair which is walking into your life, and you know not whether for good or ill.',6.2);
    PLAYA.holmes.lookHold=false; playLook('holmes',{who:'watson'}); playPose('watson','folded'); }],
  [110.8,()=>{ playWalk('holmes',[[5.2,1.3]],A90); playPose('holmes','stand'); }],
  [111.8,()=>{ playLine('holmes','Come in!',1.8); playLook('holmes',{who:'mortimer'}); playCut(()=>{ const a=PLAYA.holmes; return [a.x,a.y,1.72*a.c.dens]; },26,2.4); }],
  [113,()=>{ playWalk('mortimer',[[6.6,6.4],[5.4,2.15]],A270,true); playWalk('dog',[[6.9,6.2],[5.85,2.4]],A270,true); playLook('watson',{who:'mortimer'}); playPose('mortimer','peer'); playLook('mortimer',{who:'holmes'}); }],
  [113.6,()=>playLine('mortimer','I am so very glad. I was not sure whether I had left it here or in the Shipping Office. I would not lose that stick for the world.',4.6)],
  [118.4,()=>{ playPose('holmes','offer',.5); playPose('mortimer','reach',.5); }],
  [119.1,()=>{ playGive('holmes','mortimer','R','stick','out'); playPose('holmes','behind',.7); playPose('mortimer','carry',.6); PLAYA.dog.pose='dsit'; playLook('dog',{who:'holmes'}); }],
  [119.4,()=>playLine('holmes','A presentation, I see.',1.6)],
  [121.1,()=>playLine('mortimer','Yes, sir.',.9)],
  [122.1,()=>playLine('holmes','From Charing Cross Hospital?',1.7)],
  [123.9,()=>playLine('mortimer','From one or two friends there on the occasion of my marriage.',3)],
  [127,()=>{ playLine('holmes','Dear, dear, that\'s bad!',1.8); PLAYA.holmes.shake=1.4; }],
  [129,()=>playLine('holmes','And now, Dr. James Mortimer—',1.7)],
  [130.8,()=>{ playLine('mortimer','Mister, sir, Mister—a humble M.R.C.S.',2.4); playPose('mortimer','peer'); }],
  [133.4,()=>{ playLine('mortimer','I had hardly expected so dolichocephalic a skull or such well-marked supra-orbital development. Would you have any objection to my running my finger along your parietal fissure?',6); playPose('mortimer','skull',1.2);
    playCut(()=>{ const a=PLAYA.holmes, b=PLAYA.mortimer; return [(a.x+b.x)/2,(a.y+b.y)/2,1.72*a.c.dens]; },34,6); }],
  [139.6,()=>{ playLine('holmes','You are an enthusiast in your line of thought, I perceive, sir, as I am in mine. … Have no hesitation in lighting one.',4.8); playPose('holmes','wave',.5); playLook('holmes',{at:[PX221(5.9),PY221(6.4),.5]}); playPose('mortimer','carry',.6); }],
  [140.6,()=>{ playWalk('mortimer',[[6.55,4.6],[5.71,6.45]],2.88,true); playWalk('dog',[[6.8,4.4],[5.45,6.95]],A180); PLAYA.dog.pose='stand'; }],
  [142.4,()=>{ playPose('holmes','behind',.8); playLook('holmes',{who:'mortimer'}); }],
  [145.6,()=>{ playSit('mortimer',5.9,6.4,2.88,'sitStick'); PLAYA.mortimer.hold={R:{p:'stick',m:'knees'}}; PLAYA.dog.pose='lie'; playLook('dog',{who:'mortimer'}); }],
  [147.2,()=>{ PLAYA.mortimer.hold={L:{p:'cpaper',m:''}}; playPose('mortimer','sitRoll',.8); PLAYA.mortimer.fingers=true; PLAYA.mortimer.look=null; playPut('mortimer','R','stick',6.25,6.05,0,qAxis([1,1,0],.18));
    playLine(null,'He had long, quivering fingers as agile and restless as the antennae of an insect.',4); playLook('watson',{who:'mortimer'}); }]];
// ---- WHERE THEY START (each time): Holmes at breakfast, his back to the hearth; Watson on the hearthrug; Mortimer and his spaniel not yet
// come up the stair (on the landing's top step, out of sight below it)
function playReset(){ SRM.build(); srGroups(); for(const k in PLAYA)delete PLAYA[k];
  const mk=(id,u,v,hd)=>{ const [x,y]=PW(u,v); return PLAYA[id]=castNew(id,x,y,hd); };
  const h=mk('holmes',3.6,4.3,A0); h.seat=true; h.pose='sitTable'; mk('watson',2.15,4.95,A90+.9);
  const m=mk('mortimer',.5,10.15,A0); m.hide=true; const d=mk('dog',.3,10.5,A0); d.hide=true;
  PLAY221.t=0; PLAY221.i=0; PLAY221.lineEnd=0; PLAY221.push=null; subEl.hidden=true; PLAY221.started=true;
  gtStart(); }   // (and first the Walker on the carpet with his guitar, for half a minute: 47-play-3-guitar)
// ---- EACH FRAME, while you're in the room (SRM's tick, 47-physics-7): the players dressed (once), the scene's clock (it waits while you're
// in someone's way), what happens now, each player stepped, posed and drawn, the camera's cut aimed, the floor's footprints, the sound
function playTick(dt,now){ const t0=performance.now();
  PLAY221.seen=now;
  if(!castBake())return;
  if(!PLAY221.started)playReset();
  // you in their way: the one walking stops, looks at you; the scene waits a while (then they go round you)
  let blocked=false; for(const a of Object.values(PLAYA)){ a.blocked=null; if(!a.path||a.hide)continue; const [tx,ty]=a.path[0], d=Math.hypot(tx-a.x,ty-a.y)||1, ax=(tx-a.x)/d, ay=(ty-a.y)/d, px=P.x-a.x, py=P.y-a.y, ah=px*ax+py*ay, side=Math.abs(px*ay-py*ax);
    if(ah>0&&ah<.6&&side<.3&&LEVEL===0){ a.waited=(a.waited||0)+dt; if(a.waited<4){ a.blocked=()=>true; blocked=true; } else if(!a.detour){ a.detour=true; const s=(px*ay-py*ax)>0?-1:1; a.path.unshift([a.x+ax*.3+ay*s*.55,a.y+ay*.3-ax*s*.55]); } }
    else{ a.waited=0; a.detour=false; } }
  const pre=gtPrelude(dt);   // (the Walker playing: the scene waits for him)
  if(!pre&&(!blocked||(PLAY221.wait+=dt)>6))PLAY221.t+=dt; if(!blocked)PLAY221.wait=0;
  while(!pre&&PLAY221.i<PLAYSCRIPT.length&&PLAYSCRIPT[PLAY221.i][0]<=PLAY221.t){ const [t,f]=PLAYSCRIPT[PLAY221.i++]; try{ f(); }catch(e){ console.warn('221B',t,e); } }
  if(PLAY221.t>=PLAY221.lineEnd&&!subEl.hidden)subEl.hidden=true;
  if(PLAY221.cut&&(PLAY221.t>=PLAY221.cut.end||P.moving||P.tx!=null))playCutEnd();
  if(PLAY221.t>=PLAY221.END&&!PLAY221.fade){ PLAY221.fade=true; const go=()=>{ PLAY221.fade=false; playReset(); }; if(HERE&&HERE.bldg==='l221b')fadeTo(go,900); else go(); }
  // the chair Holmes pushes back
  const pu=PLAY221.push; if(pu){ const b=pu.b, k=Math.min(dt,Math.max(0,pu.T-pu.t))/pu.T; pu.t+=dt; b.x[0]+=pu.du*k; b.x[1]+=pu.dv*k; b.v=[pu.du/pu.T,pu.dv/pu.T,0]; phyWake(b); if(pu.t>=pu.T)PLAY221.push=null; }
  // each of them: Mortimer and the dog shown once they're on the stair; you near: a glance now and then; stepped, posed, drawn
  const t1=performance.now(), draw=[], foot=[];
  for(const a of Object.values(PLAYA)){ if(a.hide&&a.path)a.hide=false; if(a.hide)continue;
    const near=Math.hypot(P.x-a.x,P.y-a.y)<1.3, g=PLAY221.glance[a.id]||(PLAY221.glance[a.id]={at:-1e9,until:0,was:null});
    if(near&&now-g.at>7000&&a.say<=0&&!a.lookHold){ g.at=now; g.until=now+1600; g.was=a.look; a.look={who:'you'}; } else if(g.until&&now>g.until){ g.until=0; if(a.look&&a.look.who==='you')a.look=g.was; }
    if(a.shake>0){ a.shake-=dt; }
    const ph0=a.dog?a.dog.ph:a.st.ph; (a.id==='walker'?gtStep:castStep)(a,dt,now); if(a.shake>0&&a.P){ a.P.look+=Math.sin(a.t*14)*.35*Math.min(1,a.shake); const B=RIG.settle(RIG.build(a.P,null),0); B.head=B.J.head; B.props=castProps(a,B); a.B=B; }
    const ph=a.dog?a.dog.ph:a.st.ph, w=a.dog?a.dog.w:a.st.w; if(w>.3&&(Math.floor(ph*2)!==Math.floor(ph0*2)))playSnd('step',a); }
  PERF.add('221B: the players stepped and posed',performance.now()-t1);
  const t2=performance.now(); for(const a of Object.values(PLAYA)){ if(a.hide)continue;
    if(castDraw(a,now,t2))dirty=true;
    if(!a.cv.width)continue; const [sx,sy]=toS(...vw(a.x,a.y)), X=Math.round(sx*S)/S-CAX, Y=Math.round(sy*S)/S-CAY, [u,v]=vw(a.x,a.y);
    draw.push({cv:a.cv,key:a.key,u,v,box:[X,Y,X+CIW,Y+CIH],K:a.r||1});   // (K: his pixels to an art pixel)
    const r=a.dog?.16:.17; foot.push({fp:[a.x-r,a.y-r,a.x+r,a.y+r],b:a,sr:1}); }
  PERF.add('221B: the players (posing, drawing)',performance.now()-t2);   // (castDraw's own row once: the bar's people drawn by it too were read as 221B's, 51)
  const sig=d=>d?d.map(o=>o.key+'@'+o.box[0]+','+o.box[1]).join('|'):''; if(sig(draw)!==sig(ACTDRAW))dirty=true; ACTDRAW=draw;
  PHYSOLID=(PHYSOLID||[]).filter(s=>!s.sr).concat(srFoot().map(s=>({...s,sr:1})),foot);
  if(PLAY221.cut){ playCutAim(); }
  if(Math.random()<dt*2.2)playSnd('fire',{x:SR221.x0+.5,y:(SR221.j0+SR221.j1)/2});
  PERF.add('221B: the scene (its clock, the players stepped)',performance.now()-t0-(performance.now()-t1)); }
// leaving (the room no longer run: 47-physics-3's phyTick): the lines, the bars and the cut put away, the players no longer drawn (they wait for you to come back: from the start)
setInterval(()=>{ if(!SRM.on&&(PLAY221.started||ACTDRAW&&!ACTDRAW.bar&&!ACTDRAW.busk)){   /* (the busker's are his own: PCA #677) */ PLAY221.started=false; gtStop(); if(PLAY221.cut)playCutEnd(); /* (their finer clouds are kept now: owner, 15 Oct 2026, baked once) */   /* (their finer clouds, baked for a close-up, let go: baked again when one is asked for) */ subEl.hidden=true; playBars(false); if(ACTDRAW&&!ACTDRAW.bar){ ACTDRAW=null; dirty=true; } } },500);   // (bar: the bar's people, 47-zz-bar: theirs to put away)
// for the checks and the screenshots (52's ISOWALK.play): the scene run ahead to t seconds, a thirtieth at a time
function playSeek(t){ let now=PLAY221.seen; PLAY221.seeking=true; while(PLAY221.t<t){ now+=1000/30; playTick(1/30,now); } PLAY221.seeking=false; for(const a of Object.values(PLAYA))a.drawn=a.lightAt=-1e9; return PLAY221.t; }   // (then drawn again on the real clock)
// the admin world tab's 'restart 221B' (owner, 14 Oct 2026): the scene from the top (yours: it's played for each player)
{ const b=document.getElementById('pl221'); if(b)b.onclick=()=>{ if(PLAY221.cut)playCutEnd(); PLAY221.started=false; }; }
````

### 9.10 Old game: src/23-w-sitting-room-221b.js

The 221B room's look.

````js
// =====================================================================================
// 221B BAKER STREET, THE SITTING ROOM (owner, 14 Oct 2026: "create a scene from hound of the baskervilles using my game engine ... recreate
// as accurate as possible", "make it in 1 room not real world map", "make the stage bigger taller more elaborate, higher stage production"):
// Holmes and Watson's sitting room on the first floor, as the stories have it, a place of its own (LBLD 'l221b', 21-world-map-5-land; on
// the row east of the bar since 15 Oct 2026, its front door into the landing; the map tab's jump list goes there too), 10.4 x 8.6 inside and 120 art px high. Here its look: the walls, an oxblood damask paper over
// a dark panelled dado, a picture rail, a smoke-browned frieze, a plaster cornice; the bow window, a recess out of the back wall with three
// tall sashes onto Baker Street (the houses across the way in a morning's yellow fog: painted, they glow, it's daylight), velvet curtains
// drawn back either side of it under a pelmet; the chimney breast on the left wall, its fireplace (cast iron, green tiles; the fire itself
// is a thing that moves: 47-physics-7), the gilt overmantel mirror, the gas brackets; the patriotic V.R. done in bullet-pocks on the right
// wall ("The Musgrave Ritual"); the portraits of General Gordon and Henry Ward Beecher ("The Cardboard Box") over the settee; the floor,
// dark boards, the Turkey carpet, the bearskin hearthrug, the hearth's stone; the landing outside the door, the stair down (painted: the
// seventeen steps go down out of sight). Its things: 47-physics-7-sitting-room; the scene played in it: 47-play.
// =====================================================================================
const SR221=(B=>{ const y0=B.y0+1.2, m=y0+8.7;
  return {b:B,x0:B.x0+T,y0,x1:B.x1-T,y1:m-T,m,ly0:m+T,ly1:B.y1-T,rb:B.y0+T,rx0:B.x0+3.5,rx1:B.x0+7.1,jx:.45,j0:y0+3,j1:y0+5.6,d0:B.x0+T+5.5,d1:B.x0+T+6.5,wz:[20,104],H:B.h-4}; })(LBLD.find(b=>b.id==='l221b'));
// the walls' paper and wood (c along the wall, q up it: fine pixels, 48 a tile, 2 an art pixel)
const SRC={skirt:[52,34,24],rail:[104,66,40],railL:[132,88,54],dado:[84,56,38],dadoL:[96,64,44],paper:[112,40,38],paperD:[88,30,30],paperG:[156,104,58],
  frieze:[178,150,106],friezeD:[160,132,92],corn:[226,216,190],cornD:[176,164,140],land:[94,104,84],landD:[80,90,72],frame:[214,206,186],frameD:[150,142,124],iron:[42,40,42],ironL:[70,68,70]};
function srPaper(c,q,land){ c=Math.floor(c); q=Math.floor(q);
  if(q<10)return q>=8?SRC.railL:SRC.skirt;                                             // the skirting
  if(q<66){ const p=c%60; if(p<2||q===11||q===64)return SRC.dado; if((p===6||p===54)&&q>16&&q<58||(q===16||q===58)&&p>6&&p<54)return SRC.railL; return hash(c>>1,q>>1,1201)<.04?sh(SRC.dadoL,.95):SRC.dadoL; }   // the dado's raised panels
  if(q<72)return q>=69?SRC.railL:SRC.rail;                                             // the dado rail
  if(q>=194&&q<200)return q>=197?SRC.railL:SRC.rail;                                   // the picture rail
  if(q>=224){ const k=(q-224)>>1, a=(c>>1)%6; if(k<2||k>5)return SRC.corn; return k<4?(a<3?SRC.corn:SRC.cornD):(a===0||a===3?SRC.cornD:SRC.corn); }   // the cornice: egg and dart
  if(q>=200)return hash(c>>2,q>>2,1203)<.25?SRC.friezeD:SRC.frieze;                    // the frieze, browned by the gas and the fire
  if(land)return (c>>1)%6===0?SRC.landD:SRC.land;                                      // the landing's paper: a plain stripe
  // the damask: a diamond lattice, a darker fleur in each, a gold dot where the lattice crosses (an art pixel at a time)
  const a=(c>>1)%14, b=((q-72)>>1)%18, dx=Math.abs(a-7), dy=Math.abs(b-9);
  if(dx+dy*7/9>6.5&&dx+dy*7/9<7.6)return (a===0||a===13)&&(b===0||b===17)?SRC.paperG:SRC.paperD;
  if(dx<=1&&dy<=4||dy<=1&&dx<=2||dx+dy<=2)return SRC.paperD;
  return SRC.paper; }
const srGlow=c=>{ const o=c.slice(); o.e=1; return o; };
// A SASH WINDOW into a wall's picture (c0..c1 along it, the view of the houses across the way (vx: where along the street it looks), a white
// frame of two panes over two, the meeting rail, the sill)
function srSash(g,c0,c1,vx){ const [z0,z1]=SR221.wz, q0=z0*2, q1=z1*2, w=c1-c0;
  for(let q=q0;q<q1;q++)for(let c=c0;c<c1;c++){ const t=(q-q0)/(q1-q0), cx=c+vx; let col;
    if(t>.8){ col=[208,202,178]; if(t<.88&&(cx+3)%26<4&&t>.82)col=[96,84,76]; }                              // the fog, a chimney pot or two
    else if(t>.74)col=[150,136,108];                                                                    // the cornice across the way
    else{ const wx=(cx+4)%28, wq=(q-q0)%46; col=hash(cx>>1,q>>1,1207)<.3?[170,146,102]:[182,158,112];     // their brick, smoked yellow
      if(wx>=6&&wx<21&&wq>=12&&wq<38)col=wq<14?[226,220,204]:wx===13?[200,194,180]:[54,54,60];             // their windows: a sill, a glazing bar, the dark inside
      if(t<.12)col=[176,168,146]; }                                                                     // the haze down by the street
    g.px(c,q,srGlow(sh(col,.98))); }
  g.frame(c0,q0,c1,q1,3,SRC.frame); g.box(c0,q0+(q1-q0)/2-2,c1,q0+(q1-q0)/2+2,SRC.frame); g.box(c0+w/2-1,q0,c0+w/2+1,q1,SRC.frame);
  g.box(c0-2,q0-4,c1+2,q0,SRC.frameD); g.box(c0-3,q0-6,c1+3,q0-4,SRC.frame); g.box(c0-3,q1,c1+3,q1+3,SRC.frame); }
// velvet curtains in folds from the pelmet to the floor (c0..c1 along a wall), the pelmet and its gold fringe over the window's way
function srDrape(g,c0,c1){ for(let c=c0;c<c1;c++){ const f=.8+.2*Math.sin((c-c0)*.9); for(let q=10;q<SR221.wz[1]*2+16;q++)g.px(c,q,sh([46,78,58],f*(q<16?.8:1))); } }
const srPelmet=(g,c0,c1)=>{ const q=SR221.wz[1]*2+14; g.box(c0,q,c1,q+12,[60,44,30]); g.box(c0,q-2,c1,q,[176,140,64]); for(let c=c0;c<c1;c+=3)g.px(c,q-3,[176,140,64]); };
const R221W=Math.ceil((SR221.x1-SR221.x0)*48), R221H=Math.ceil(SR221.H*2)+8;
// THE BACK WALL (the blocks' faces either side of the recess): the curtains drawn back, the pelmet, the portraits over the settee (General
// Gordon, Henry Ward Beecher), the medical shelf's corner
const SRBACK=bedCanvas(R221W,R221H,g=>{ const a=(SR221.rx0-SR221.x0)*48, b=(SR221.rx1-SR221.x0)*48; srDrape(g,a-30,a); srDrape(g,b,b+30); srPelmet(g,a-34,b+34);
  for(const [u,beard] of [[7.9,false],[9.0,true]]){ const c=u*48;
    g.box(c-16,112,c+16,156,[40,28,20]); g.box(c-14,114,c+14,154,[204,184,140]); g.disc(c,136,8,10,[120,92,62]); g.disc(c,139,6,7,[176,142,106]);
    g.box(c-10,114,c+10,124,[70,52,38]); if(beard)g.disc(c,130,5,3,[96,80,66]); else g.box(c-3,134,c+3,135,[96,74,56]);
    for(let q=156;q<196;q++)g.px(c+(q-156)*.2,q,[150,116,60]); } });
// THE RECESS: its back (two sashes) and its sides (one each), the view along the street as it would fall
const SRREC=bedCanvas(Math.ceil((SR221.rx1-SR221.rx0)*48),R221H,g=>{ const W=(SR221.rx1-SR221.rx0)*48; srSash(g,Math.round(W*.12),Math.round(W*.45),0); srSash(g,Math.round(W*.55),Math.round(W*.88),60); });
const SRRECS=bedCanvas(Math.ceil((SR221.y0-SR221.rb)*48),R221H,g=>{ const W=(SR221.y0-SR221.rb)*48; srSash(g,Math.round(W*.2),Math.round(W*.8),130); });
// THE CHIMNEY BREAST'S FACE: the fireplace (a cast-iron arch round a black firebox, green tiled cheeks, the fire and its grate drawn as a
// thing: 47-physics-7), the gilt overmantel mirror (the mantel shelf a thing too), a brass gas bracket either side of it, lit
const SRJOG=bedCanvas(Math.ceil((SR221.j1-SR221.j0)*48),R221H,g=>{ const W=Math.ceil((SR221.j1-SR221.j0)*48), m=W/2;
  g.box(m-38,0,m+38,72,SRC.iron); g.box(m-38,70,m+38,74,SRC.ironL);                                   // the iron surround
  for(let q=0;q<62;q++)for(let c=m-34;c<m+34;c++){ if(Math.abs(c-m)<23&&q<50)continue; const k=(Math.floor((c-m+34)/6)+Math.floor(q/6))%2;
    g.px(c,q,k?[64,108,88]:[84,130,104]); if((c-m+34)%6===0||q%6===0)g.px(c,q,[40,64,52]); }         // the tiled cheeks
  for(let q=0;q<50;q++)for(let c=m-23;c<m+23;c++){ const r=Math.hypot((c-m)/23,(q-32)/20); if(q>32&&r>1)continue; g.px(c,q,q<4?[34,30,28]:[16,12,12]); }   // the firebox, arched
  for(let q=84;q<196;q++)for(let c=m-46;c<m+46;c++){ const e=c<m-41||c>=m+41||q<89||q>=190, top=q>=184&&Math.abs(c-m)<12+(196-q)*2; if(e||top){ g.px(c,q,(c+q)%5===0?[214,182,96]:[176,140,64]); continue; }
    g.px(c,q,(c-m+q)%46<3?[150,160,164]:q>140?[104,110,112]:[118,126,128]); }                         // the overmantel's mirror
  for(const c of [m-56,m+56]){ g.box(c-1,140,c+1,156,[170,136,70]); g.box(c-3,154,c+3,158,[190,156,84]); g.box(c-2,158,c+2,168,srGlow([255,236,180])); } });   // the gas brackets, lit
// THE RIGHT WALL: V.R., Victoria Regina, in bullet-pocks (Holmes's "patriotic" target practice), over his desk
const SRVR=(()=>{ const s=new Set(), put=(c,q)=>{ s.add((c>>1)+','+(q>>1)); s.add(((c+1)>>1)+','+(q>>1)); };
  const L=(x0,y0,x1,y1,n)=>{ for(let i=0;i<=n;i++)put(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n)); };
  const c0=3.6*48-34, q0=128;   // (V then R, about 36 fine pixels high, over the desk)
  L(c0,q0+36,c0+11,q0,9); L(c0+11,q0,c0+22,q0+36,9);
  L(c0+34,q0,c0+34,q0+36,10); L(c0+34,q0+36,c0+48,q0+34,5); L(c0+48,q0+34,c0+50,q0+24,4); L(c0+50,q0+24,c0+36,q0+19,5); L(c0+38,q0+19,c0+52,q0,7);
  return (c,q)=>s.has((Math.floor(c)>>1)+','+(Math.floor(q)>>1)); })();
// THE PARTITION's room side: a landscape in a heavy frame (a Dartmoor-ish moor, grey and brown), coat hooks by the door
const SRPART=bedCanvas(R221W,R221H,g=>{ const c=2.6*48; g.box(c-44,104,c+44,170,[150,116,60]); g.box(c-40,108,c+40,166,[120,124,112]);
  for(let q=108;q<166;q++)for(let x=c-40;x<c+40;x++){ const t=(q-108)/58; g.px(x,q,t>.55?(t>.6?[176,176,168]:[140,140,132]):hash(x>>2,q>>2,1261)<.3?[96,84,62]:[118,104,74]); }
  for(const x of [8.6*48,8.9*48])g.box(x-1,130,x+2,134,[176,140,64]); });
// a wall's colour inside (facadeCol, 22): q the building, the face's normal, the point, z from the floor, f its shade
function srWall(q,nx,ny,X,Y,z,f){ const R=SR221, e=.06, Q=z*2;
  if(z<0)return sh(SRC.skirt,f);
  if(ny>0&&Math.abs(Y-R.rb)<e&&X>R.rx0-e&&X<R.rx1+e){ const c=(X-R.rx0)*48, w=SRREC(c,Q); if(w)return w.e?w:sh(w,f); return sh(srPaper(c,Q),f); }   // the recess's back: its two sashes
  if(nx&&Y<R.y0+e&&(Math.abs(X-R.rx0)<e||Math.abs(X-R.rx1)<e)){ const c=(Y-R.rb)*48, w=SRRECS(c,Q); if(w)return w.e?w:sh(w,f); return sh(srPaper(c,Q),f); }   // its sides
  if(ny>0&&Math.abs(Y-R.y0)<e){ const c=(X-R.x0)*48, w=SRBACK(c,Q); return sh(w||srPaper(c,Q),f); }                                // the back wall
  if(nx>0&&Math.abs(X-R.x0-R.jx)<e&&Y>R.j0-e&&Y<R.j1+e){ const a=SRJOG((Y-R.j0)*48,Q); return a&&a.e?a:sh(a||srPaper((Y-R.j0)*48,Q),f); }   // the chimney breast's face
  if(nx<0&&Math.abs(X-R.x1)<e&&Y<R.m){ const c=(Y-R.y0)*48; if(SRVR(c,Q))return sh([34,20,18],f); return sh(srPaper(c,Q),f); }   // the right wall: V.R.
  if(ny<0&&Math.abs(Y-R.m+T)<e){ const c=(X-R.x0)*48, a=SRPART(c,Q);                                                              // the partition, the room's side
    if(X>R.d0-.12&&X<R.d1+.12&&Q<180)return sh(SRC.frame,f*.92);                                                                 // the door's architrave
    return sh(a||srPaper(c,Q),f); }
  const land=Y>R.m;                                                                                                             // the landing's walls
  if(land&&X>R.d0-.12&&X<R.d1+.12&&ny>0&&Q<180)return sh(SRC.frame,f*.92);
  return sh(srPaper(nx?(Y-R.y0)*48:(X-R.x0)*48,Q,land),f); }
// THE FLOOR: dark boards along x (each 0.16 wide, its own shade, the ends staggered); the Turkey carpet (a madder red field, a navy and ivory
// border, a medallion of rows of little guls); the bearskin before the fire (its head toward the room, the fur in two browns); the hearth's
// stone; on the landing a runner up the middle and the stair going down at its far end, step under step into the dark, brass rods on the runner
const SRCARPET={u0:2.3,u1:8.7,v0:1.25,v1:7.45};
function srFloorCol(x,y){ const R=SR221, u=x-R.x0, v=y-R.y0;
  if(y>R.m){ const lv=y-R.ly0;   // the landing
    if(u<1.9&&lv>.55){ const s=Math.floor((1.9-u)/.22), f=Math.pow(.74,s+1), run=lv>.75&&lv<1.95, e=(1.9-u)-s*.22<.03;   // the stair down: each step lower and darker
      return sh(run?(e?[190,156,70]:[118,36,34]):e?[120,92,64]:[96,66,44],f); }
    if(lv>.75&&lv<1.95)return Math.abs(lv-.75)<.03||Math.abs(lv-1.95)<.03?[150,116,58]:[124,38,36];                           // the runner
    return srBoards(x,y); }
  const jm=(R.j0+R.j1)/2-R.y0;
  if(u<.95&&u>.45&&y>R.j0+.3&&y<R.j1-.3)return speck([128,124,116],x,y,1211);                                                   // the hearth's stone
  // the bearskin: a rounded hide, its legs out, its head toward the room (+x), two browns, a darker muzzle, the eyes
  { const cu=1.55, cv=jm, a=(u-cu)/.55, b=(v-cv)/.7, r=a*a+b*b, hd=Math.hypot((u-2.25)/.18,(v-cv)/.16);
    const leg=[[.7,-.7],[.7,.7],[-.48,-.74],[-.48,.74]].some(([du,dv])=>Math.hypot(u-cu-du,v-cv-dv)<.15);
    if(hd<1){ const n=Math.hypot((u-2.38)/.06,(v-cv)/.06); return n<1?[40,26,20]:Math.hypot(u-2.27,Math.abs(v-cv)-.07)<.025?[16,12,10]:[120,84,52]; }
    if(r<1||leg){ const n=hash(Math.floor(x*40),Math.floor(y*40),1213); return n<.3?[92,62,38]:n<.7?[110,76,46]:[132,94,58]; } }
  const C=SRCARPET; if(u>C.u0&&u<C.u1&&v>C.v0&&v<C.v1){ const du=Math.min(u-C.u0,C.u1-u), dv=Math.min(v-C.v0,C.v1-v), d=Math.min(du,dv);   // the carpet
    if(d<.05)return [190,170,132];                                                                                                // its fringe and edge
    if(d<.36){ const k=Math.floor((du<dv?v:u)*12)%3; return d<.1||d>.31?[40,46,84]:k===0?[214,196,150]:k===1?[150,40,38]:[40,46,84]; }   // the border
    const mu=(C.u0+C.u1)/2, mv=(C.v0+C.v1)/2, md=Math.abs(u-mu)/1.9+Math.abs(v-mv)/1.7;
    if(md<1&&md>.93)return [214,196,150]; if(md<.45){ const g=(Math.floor(u*8)+Math.floor(v*8))%2; return g?[40,46,84]:[214,166,90]; }   // the medallion
    const gx=(u-C.u0)%.6, gy=(v-C.v0)%.6, gd=Math.abs(gx-.3)+Math.abs(gy-.3); if(gd<.12)return gd<.05?[214,196,150]:[40,46,84];   // the little guls
    return hash(Math.floor(x*24),Math.floor(y*24),1215)<.06?[132,34,32]:[150,40,38]; }
  return srBoards(x,y); }
function srBoards(x,y){ const u=x-SR221.x0, v=y-SR221.y0, j=Math.floor(v/.16), L=1.2+hash(j,0,1217)*.9, o=hash(j,1,1217)*L, k=Math.floor((u+o)/L);
  if(v-j*.16<1/48)return mt('wood',[54,36,24]);
  if((u+o)-k*L<1/48)return mt('wood',[62,40,26]);
  const n=hash(j,k,1219); return mt('wood',speck(n<.33?[96,62,38]:n<.66?[88,56,34]:[104,68,42],x,y,1221)); }
````

### 9.11 Old game: src/47-physics-7-sitting-room.js

221B's objects.

````js
// =====================================================================================
// PHYSICS, 7: 221B'S THINGS (owner, 14 Oct 2026: the Hound of the Baskervilles' first chapter in Holmes and Watson's sitting room, "recreate as
// accurate as possible"; the room: 23-w-sitting-room-221b). Everything in it is a body (47-physics-1), drawn by hand as the bedroom's are
// (47-physics-4-bedroom's helpers), made to the Walker's own measure (a chair's seat as high as his knee) so the players sit in them: the
// breakfast table in its white cloth and all on it (the silver-plated coffee-pot Holmes sees Watson in, the cups, the plates, the toast
// rack, the milk jug), three balloon-backed chairs, Holmes's leather armchair and Watson's velvet one either side of the fire, the settee
// (Holmes's favourite corner), the basket chair, Watson's "small medical shelf" and its books (the Medical Directory among them, a real
// one), the acid-stained deal-topped chemistry table and its retorts and test-tubes, the mantel (the clock, the Persian slipper with the
// tobacco in its toe, the pipe rack, the letters transfixed by a jack-knife), the fender, the fire irons, the coal-scuttle and its cigars,
// the sideboard with the tantalus and the gasogene, the violin on Holmes's chair, his desk (the
// papers, the documents in red tape, the inkstand, the green-shaded lamp), the oil lamp by his chair, the brass candlesticks, the gasolier
// over the table, a palm, the banister, the hat-and-coat stand and the umbrella stand on the landing; and Dr. Mortimer's stick,
// the Penang lawyer, leaning by the fire where he left it last night. The fire burns (its flames a thing that moves by itself). The heavy
// furniture stands in your way as the bedroom's does. Built again from the start each time the scene does (47-play-2-scene: SRM.build).
// =====================================================================================
const SRM={bld:'l221b',x0:SR221.x0,x1:SR221.x1,y0:SR221.rb,y1:SR221.ly1,near:7,on:false,away:true,bodies:[],hang:[],fix:[],st:[],acc:0,t:0,env:null,envAt:-1e9,night:1,stamp:0,
  named:{},solids:[],build:()=>srBuild(),tick:(dt,now)=>srTick(dt,now),name:'221B\'s'};
PHYROOMS.push(SRM);
// THE ROOM'S LIGHTS (made last of all the lights, so every other keeps its number): the morning through the bow window's sashes, the room's
// own light off the walls and the ceiling, the gasolier over the table (lit: a London fog), the fire, the gas brackets either side of the
// mirror, the green-shaded lamp on Holmes's desk, the oil lamp by his chair, the landing's (they light only the building: in)
{ const B=SR221.b, n=LAMPS.length, o={own:1,room:1,day:true,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T]}, X=u=>SR221.x0+u, Y=v=>SR221.y0+v, jm=(SR221.j0+SR221.j1)/2;
  LAMPS.push({x:X(5.2),y:Y(-.5),z:80,r:9,c:[1.25,1.22,1.14],...o},{x:X(5.2),y:Y(1.4),z:70,r:7,c:[.9,.9,.86],...o},{x:X(5),y:Y(4.3),z:110,r:12,c:[.9,.85,.76],...o},
    {x:X(4.4),y:Y(4.3),z:76,r:6.5,c:[1.1,.86,.52],...o},{x:X(.75),y:jm,z:8,r:4,c:[1.3,.66,.3],...o},{x:X(.6),y:jm-1.17,z:80,r:2.6,c:[1,.8,.48],...o},{x:X(.6),y:jm+1.17,z:80,r:2.6,c:[1,.8,.48],...o},
    {x:X(9.7),y:Y(3.1),z:30,r:3,c:[.86,.9,.5],...o},{x:X(.85),y:Y(1.4),z:28,r:3,c:[1.1,.86,.5],...o},{x:X(5.2),y:(SR221.ly0+SR221.ly1)/2,z:110,r:7,c:[.62,.58,.5],...o});
  for(const l of LAMPS.slice(n)){ l.kind=LKIND(l); l.base={r:l.r,z:l.z,c:l.c}; } applyLights(); }
// a box (47-physics-4-bedroom's brB), its look a box's (brL) or one colour all over (brFlat)
const srB=(x0,y0,z0,x1,y1,z1,L,o)=>{ const b=brB(x0,y0,z0,x1,y1,z1,L,o); if(Array.isArray(b.mat)){ const c=b.mat; b.mat=()=>c; } return b; };
// THE FIRE (moving by itself, as the lava lamp does): coals glowing in the grate, flames that lick up and die back, a frame of it about 8 a second
const SRFIRE={t:0,f:0};
const srFlame=(k)=>(q)=>{ const t=SRFIRE.t, h=Math.max(0,Math.min(1,(q[2]+.06)/.14)), w=.5+.5*Math.sin(t*9+k*2.1+q[1]*40)*Math.sin(t*5.3+k);
  return h>.75*w+.2?null:brLit(h<.3?[255,236,150]:h<.6?[255,176,60]:[230,96,30]); };
const srCoal=(q)=>{ const n=hash(Math.floor(q[0]*90),Math.floor(q[1]*90)+Math.floor(SRFIRE.t*3),1241); return n<.35?brLit([255,120,40]):n<.55?brLit([210,70,24]):[40,30,28]; };
function srBuild(){ const R=SR221, X=u=>R.x0+u, Y=v=>R.y0+v, B=[], F=[], Z=[0,0,1], px=brPX, solids=[], N={}, hv={solid:true,mu:.9,e:.02};
  // a body at (u, v) in the room, its foot z art px up; yaw: which way its +x faces
  const body=(parts,m,u,v,z,yaw,o)=>{ const b=phyBody({parts,m,at:[X(u),Y(v),px(z||0)],q:qAxis(Z,yaw||0),mu:.6,e:.08,...o}); B.push(b); if(o&&o.solid)solids.push(b); return b; };
  const fixed=(parts,u,v,z,yaw)=>{ const b=phyBody({parts,m:1,at:[X(u),Y(v),px(z||0)],q:qAxis(Z,yaw||0)}); F.push(b); return b; };
  const t=.1, jm=(R.j0+R.j1)/2-R.y0, W5=5;
  // what they rest on and stop against: the walls, the back wall either side of the recess and the recess's back, the chimney breast, the
  // wall to the landing (its door open)
  const st=[[R.x0-t,R.rb,0,R.rx0,R.y0,W5],[R.rx1,R.rb,0,R.x1+t,R.y0,W5],[R.rx0-t,R.rb-t,0,R.rx1+t,R.rb,W5],[R.x0-t,R.rb-t,0,R.x0,R.ly1+t,W5],[R.x1,R.rb-t,0,R.x1+t,R.ly1+t,W5],
    [R.x0-t,R.ly1,0,R.x1+t,R.ly1+t,W5],[R.x0,R.j0,0,R.x0+R.jx,R.j1,W5],[R.x0-t,R.m-T,0,R.d0,R.m+T,W5],[R.d1,R.m-T,0,R.x1+t,R.m+T,W5]];
  const wood=[92,46,30], woodT=[110,58,38], W=brL(wood,{t:woodT},sh(wood,.5)), Wn=brL(wood,{t:woodT},false);
  // books on a shelf (a row from u0 to u1 along x, or along y: alongY; facing: +1 or -1 out), each a body (47-physics-4-books' look); the
  // Medical Directory where it's asked for (red, a little fatter)
  const books=(a0,a1,o,zb,alongY,face,seed,dir)=>{ let a=a0+.04; for(let i=0;a<a1-.08&&i<18;i++){ const r=hash(seed,i,61), r2=hash(seed,i,67);
      if(r<.06){ a+=.06; continue; } const isD=dir===i, h0=isD?[.05,.11,.15]:[.03+.025*r2,.1+.03*r,.12+.06*hash(seed,i,71)], c=isD?[150,36,30]:BOOKC[Math.floor(hash(seed+3,i,73)*BOOKC.length)];
      if(a+2*h0[0]>a1-.04)break;
      const bk=body([{t:'box',c:[0,0,0],h:h0,mat:bookMat(h0,c,1)}],.3+h0[2]*(isD?3:1),alongY?o+h0[1]:a+h0[0],alongY?a+h0[0]:o+h0[1],0,alongY?-Math.PI/2:0,{mu:.6,e:.05}); bk.x[2]=zb+h0[2]+.002; bk.home.x=bk.x.slice(); if(isD)N.book=bk;   // (along y: turned, its spine to the room)
      a+=2*h0[0]+.004; } };
  // ---- THE BREAKFAST TABLE: a square of mahogany on turned legs under a white damask cloth that falls a hand's width all round
  const TU=4.4, TV=4.3;
  { const L=brL([236,232,220],{t:(c,r)=>(Math.floor(c/6)+Math.floor(r/6))%2?[238,234,222]:[228,224,212]},false), H=.5, z=px(20);
    const parts=[srB(-H,-H,z-px(1),H,H,z,L)], sk=brL([232,228,216],{},false); for(const s of [-1,1]){ const a=s<0?-H-.01:H-.002, b=s<0?-H+.002:H+.01; parts.push(srB(-H-.01,a,z-px(6),H+.01,b,z-px(1),sk),srB(a,-H,z-px(6),b,H,z-px(1),sk)); }   // (the cloth's fall)
    for(const [a,b] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])parts.push(brC(a,b,0,z-px(6),.03,brRound(()=>wood,()=>wood)));
    N.table=body(parts,18,TU,TV,0,0,{...hv,give:.2}); }
  // on it: the coffee-pot (silver-plate, polished: Holmes sees Watson in it), two cups in saucers (drunk: nothing painted in them, the owner's
  // rule, real liquids only), two plates, the toast rack, the milk jug
  { const sv=(q,n)=>{ const b=Math.floor((q[2]+.2)*90)%5; return n[2]>.5?[226,228,230]:b===0?[250,250,252]:b===1?[160,164,170]:[206,210,214]; }, z=20;
    N.pot=body([brC(0,0,0,px(7),.05,sv),{t:'ball',c:[0,0,px(7.4)],r:.042,mat:sv},{t:'ball',c:[0,0,px(8.6)],r:.012,mat:()=>[60,40,30]},srB(.05,-.008,px(3),.09,.008,px(6.5),brFlat([200,204,208])),srB(-.08,-.01,px(2),-.05,.01,px(6),brFlat([60,40,30]))],1.1,TU-.36,TV-.05,z,Math.PI);
    for(const [u,v] of [[TU-.32,TV+.32],[TU+.32,TV-.3]]){ body([brC(0,0,0,px(.3),.055,brRound(()=>[236,234,228],()=>[236,234,228])),brC(0,0,px(.3),px(2.6),.03,brRound(()=>[244,242,236],()=>[214,210,200])),srB(.03,-.006,px(1),.045,.006,px(2.2),brFlat([236,234,228]))],.3,u,v,z,0); }
    for(const [u,v] of [[TU-.32,TV+.08],[TU+.3,TV-.05]])body([brC(0,0,0,px(.4),.085,brRound(()=>[240,238,232],()=>[226,222,212]))],.4,u,v,z,0);
    body([srB(-.08,-.04,0,.08,.04,px(.5),brFlat([200,204,208])),...[-.06,-.02,.02,.06].map(a=>srB(a-.004,-.035,px(.5),a+.004,.035,px(3),brFlat([206,210,214]))),
      ...[-.04,0,.04].map(a=>srB(a-.012,-.03,px(.5),a+.012,.03,px(2.8),brL([214,170,110],{},[150,100,60])))],.3,TU,TV+.25,z,.4);
    body([brC(0,0,0,px(3),.03,brRound(()=>[244,242,236],()=>[244,242,236])),srB(-.045,-.006,px(1),-.03,.006,px(2.5),brFlat([244,242,236]))],.2,TU+.15,TV-.2,z,0); }
  // ---- THE CHAIRS: balloon-backed mahogany, an oxblood leather seat (Holmes's at the table, Watson's pushed back, the spare); light: they move
  const chair=(u,v,yaw)=>{ const s=brL([110,40,32],{t:[124,48,38]},[60,20,16]), parts=[srB(-.21,-.21,px(9.5),.21,.21,px(10.5),s)];
    for(const [a,b] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])parts.push(srB(a-.018,b-.018,0,a+.018,b+.018,px(9.5),Wn));
    for(const b of [-.17,.17])parts.push(srB(-.21,b-.02,px(10.5),-.17,b+.02,px(27),Wn));
    parts.push(srB(-.21,-.18,px(24),-.17,.18,px(28),Wn),srB(-.21,-.15,px(16),-.18,.15,px(18),Wn));
    return body(parts,4,u,v,0,yaw); };
  N.chairH=chair(TU-.8,TV,0); N.chairW=chair(TU,TV+.82,-Math.PI/2); N.chairS=chair(TU+.8,TV,Math.PI);
  // ---- THE ARMCHAIRS either side of the fire: Holmes's in worn red-brown leather, Watson's in green velvet; deep seats, arms, high backs
  const arm=(u,v,yaw,c)=>{ const L=brL(c,{t:sh(c,1.12)},sh(c,.5)), parts=[srB(-.32,-.32,0,.32,.32,px(10),L),srB(-.36,-.36,0,-.24,.36,px(30),L)];
    for(const s of [-1,1])parts.push(srB(-.36,s*.3-.06,0,.32,s*.3+.06,px(16),L));
    return body(parts,26,u,v,0,yaw,{...hv,give:.15}); };
  N.armH=arm(1.55,jm-1.7,Math.PI/2,[122,56,40]); N.armW=arm(1.55,jm+1.7,-Math.PI/2,[60,88,62]);
  body([{t:'ell',c:[0,0,.012],r:[.11,.05,.012],mat:()=>[150,72,30]},srB(.1,-.008,0,.2,.008,px(.6),brFlat([30,20,16])),srB(-.12,.03,0,.16,.036,px(.3),brFlat([90,60,36]))],.5,1.6,jm-1.65,10,.6);   // the violin on Holmes's
  // a little round table by Holmes's chair, the oil lamp on it lit (its glass chimney, its globe glowing)
  fixed([brC(0,0,px(17),px(18),.22,brRound(()=>wood,()=>woodT)),brC(0,0,0,px(17),.03,brRound(()=>wood,()=>wood)),brC(0,0,0,px(1),.14,brRound(()=>wood,()=>wood)),
    brC(0,0,px(18),px(21),.06,brRound(()=>[176,140,64],()=>[200,160,72])),{t:'ball',c:[0,0,px(24)],r:.075,mat:()=>brLit([255,232,170])},brC(0,0,px(26),px(29),.02,brRound(()=>brLit([255,246,220]),()=>[200,200,200]))],.85,1.4,0,0);
  st.push([X(.6),Y(1.15),0,X(1.1),Y(1.65),px(18)]);
  // ---- THE SETTEE against the back wall by the window, facing the room: horsehair in buttoned oxblood, its arms rolled; Holmes's corner
  // at the window's end; the portraits over it (23-w-sitting-room-221b)
  { const c=[96,40,34], L=brL(c,{t:(a,r)=>((Math.floor(a/9)+Math.floor(r/9))%2&&(a%9|0)===4&&(r%9|0)===4)?[60,24,20]:sh(c,1.1)},sh(c,.5));
    N.settee=body([srB(-1,-.32,0,1,.32,px(10),L),srB(-1.04,.2,0,1.04,.38,px(26),L),srB(-1.04,-.34,0,-.88,.38,px(16),L),srB(.88,-.34,0,1.04,.38,px(16),L)],40,8.4,.42,0,Math.PI,{...hv,give:.1}); }
  // ---- THE BASKET CHAIR (wicker, a cushion): where Dr. Mortimer is waved
  { const wk=(q,n)=>(Math.floor(q[2]*90)+Math.floor((q[0]+q[1])*90))%3===0?[150,112,62]:[196,160,100];
    N.chairB=body([srB(-.26,-.26,0,.26,.26,px(9.5),wk),srB(-.24,-.24,px(9.5),.24,.24,px(10.5),brL([120,90,60],{t:[140,104,70]})),srB(-.3,-.28,0,-.2,.28,px(26),wk),
      srB(-.3,-.3,0,.26,-.22,px(15),wk),srB(-.3,.22,0,.26,.3,px(15),wk)],5,5.9,6.4,0,Math.PI*.92); }
  // ---- WATSON'S MEDICAL SHELF (on the back wall by the corner): a mahogany case, three shelves; its books real, the Medical Directory the
  // red one on the middle shelf
  { const u0=.95, u1=2.05, d=.32, Hc=px(56), cx=(u0+u1)/2, parts=[srB(-.55,-d/2,0,.55,-d/2+.03,Hc,W),srB(-.55,-d/2,0,-.51,d/2,Hc,W),srB(.51,-d/2,0,.55,d/2,Hc,W),srB(-.55,-d/2,Hc-px(1.5),.55,d/2,Hc,W)];
    const zs=[0,18,36]; for(const z of zs)parts.push(srB(-.51,-d/2,px(z),.51,d/2,px(z+1.5),W));
    N.shelf=fixed(parts,cx,d/2+.02,0,0); st.push([X(u0),Y(0),0,X(u1),Y(.05),Hc],[X(u0),Y(0),0,X(u0+.04),Y(d+.04),Hc],[X(u1-.04),Y(0),0,X(u1),Y(d+.04),Hc]);
    zs.forEach((z,row)=>{ st.push([X(u0),Y(.02),0,X(u1),Y(d+.02),px(z+1.5)]); books(u0,u1,.06,px(z+1.5),false,1,221+row,row===1?4:-1); }); }
  // ---- HOLMES'S BOOKCASE in the alcove by the fire: tall, five shelves of his commonplace books and indexes, facing the room (+x)
  // (Holmes's bookcase of commonplace books stood in the alcove by the fire; removed: owner, 15 Oct 2026, "remove this book shelf, doesnt even make sense")
  // ---- THE CHEMISTRY TABLE (acid-stained deal) in the other alcove, its test-tubes in a rack, two retorts, a spirit lamp, bottles
  { const top=(c,r)=>hash(Math.floor(c/3),Math.floor(r/3),1243)<.12?[150,120,80]:hash(Math.floor(c/5),Math.floor(r/5),1245)<.08?[110,90,70]:[206,178,128], cu=.4, cv=7.1;
    const parts=[srB(-.3,-.62,px(19),.3,.62,px(20),brL([196,168,120],{t:top},[140,112,74]))]; for(const [a,b] of [[-.26,-.58],[.26,-.58],[-.26,.58],[.26,.58]])parts.push(srB(a-.02,b-.02,0,a+.02,b+.02,px(19),brL([170,140,96],{},false)));
    fixed(parts,cu,cv,0,0); st.push([X(cu-.3),Y(cv-.62),0,X(cu+.3),Y(cv+.62),px(20)]);
    const z=20, glass=(c)=>(q,n)=>n[2]>.5?sh(c,1.2):c;
    body([srB(-.03,-.08,0,.03,.08,px(.5),brFlat([120,90,60])),srB(-.03,-.08,px(3),.03,.08,px(3.5),brFlat([120,90,60])),...[-.06,-.03,0,.03,.06].map((a,i)=>brC(0,a,px(.5),px(5),.009,glass([210,226,230])))],.3,.25,cv-.35,z,0);
    for(const [v,c] of [[cv+.05,[204,222,228]],[cv+.3,[204,222,228]]])body([{t:'ball',c:[0,0,px(1.6)],r:.035,mat:glass(c)},srB(-.006,-.006,px(2.6),.006,.006,px(6),brFlat(c)),srB(-.005,.006,px(5.4),.005,.08,px(6.2),brFlat(c))],.3,.42,v,z,.8);
    body([brC(0,0,0,px(1.5),.025,brRound(()=>[180,200,210],()=>[160,150,140])),brC(0,0,px(1.5),px(2.2),.006,brFlat([240,240,230]))],.2,.2,cv+.5,z,0);
    for(const [u,v,c] of [[.5,cv-.45,[90,60,40]],[.55,cv-.2,[60,90,120]],[.25,cv+.2,[40,70,40]]])body([brC(0,0,0,px(3.4),.022,glass(c)),brC(0,0,px(3.4),px(4.2),.009,brFlat([220,214,200]))],.3,u,v,z,0); }
  // ---- THE MANTEL: a shelf of dark marble on the chimney breast; on its front Holmes's unanswered letters transfixed by a jack-knife
  { const mar=[48,44,46], L2=(R.j1-R.j0)/2, front=brCan(Math.ceil((R.j1-R.j0-.16)*48),8,g=>{ const W=Math.ceil((R.j1-R.j0-.16)*48), m=W/2; g.box(0,0,W,8,[58,54,56]); for(let k=0;k<4;k++)g.box(m-8+k*3,0,m-2+k*3,8-k,[236,230,212]); g.box(m-2,2,m+6,4,[170,174,180]); g.box(m+6,1,m+11,5,[70,46,30]); });
    fixed([srB(-.15,-L2+.04,px(37),.15,L2-.04,px(38.5),brL(mar,{t:[70,66,68],xp:[64,60,62]},[30,28,30])),srB(-.02,-L2+.08,px(33),.02,L2-.08,px(37),brL(mar,{xp:front},false))],R.jx+.15,jm,0,0);
    st.push([X(R.jx-.01),R.j0+.04,0,X(R.jx+.3),R.j1-.04,px(38.5)]);
    const z=38.5;
    body([srB(-.03,-.06,0,.03,.06,px(5),brL([70,40,26],{xp:brCan(6,10,g=>{ g.box(0,0,6,10,[70,40,26]); g.disc(3,6,2.5,2.5,[236,226,196]); g.px(3,6,[20,20,20]); g.px(3,7,[20,20,20]); g.px(4,6,[20,20,20]); })},[40,24,16]))],.8,R.jx+.14,jm,z,0);   // the clock
    body([{t:'ell',c:[0,0,.03],r:[.035,.08,.03],mat:q=>q[2]>.045?[110,80,50]:(Math.floor(q[1]*90)%3===0?[226,180,70]:[170,40,40])}],.2,R.jx+.14,jm+.62,z,.2);   // the Persian slipper, tobacco in its toe
    body([srB(-.02,-.1,0,.02,.1,px(1),brFlat([90,56,34])),srB(-.02,-.1,px(4),.02,.1,px(5),brFlat([90,56,34])),...[-.07,-.02,.03,.08].map(a=>srB(-.012,a-.006,px(.5),.012,a+.006,px(6),brFlat([40,28,22])))],.4,R.jx+.14,jm-.64,z,0);   // the pipe rack
    for(const v of [jm-1.05,jm+1.05])body([brC(0,0,0,px(1),.03,brRound(()=>[200,160,72],()=>[200,160,72])),brC(0,0,px(1),px(5),.008,brRound(()=>[200,160,72],()=>[200,160,72])),brC(0,0,px(5),px(7),.012,brRound(()=>[244,240,226],()=>brLit([255,220,140])))],.3,R.jx+.12,v,z,0); }   // two brass candlesticks
  // ---- THE FIRE: the iron basket grate in the firebox, the coals glowing, the flames; the brass fender round the hearth; the fire irons;
  // the coal-scuttle (Holmes keeps his cigars in it)
  N.fire=fixed([srB(-.08,-.28,px(2),.08,.28,px(3),brFlat([30,28,28])),...[-.22,-.11,0,.11,.22].map(a=>srB(.06,a-.01,px(2),.08,a+.01,px(9),brFlat([36,34,34]))),
    {t:'ell',c:[0,0,px(4)],r:[.07,.24,.05],mat:srCoal},...[-.16,-.05,.06,.17].map((a,k)=>({t:'ell',c:[0,a,px(7.5)],r:[.045,.065,.09],mat:srFlame(k)}))],R.jx+.06,jm,0,0);
  N.fire.frame=()=>SRFIRE.f; N.fire.see=true;   // (see: where no flame is, you see the firebox behind)
  { const br=brFlat([196,156,70]); fixed([srB(-.01,-.68,0,.01,.68,px(2.5),br),srB(-.3,-.69,0,.01,-.67,px(2.5),br),srB(-.3,.67,0,.01,.69,px(2.5),br)],R.jx+.55,jm,0,0); }
  fixed([brC(0,0,0,px(.5),.05,brFlat([60,56,56])),srB(-.004,-.004,px(.5),.004,.004,px(16),brFlat([60,56,56])),srB(-.03,-.004,px(4),.03,.004,px(16),brFlat([150,150,156])),srB(-.004,-.03,px(5),.004,.03,px(15),brFlat([120,120,126]))],R.jx+.14,jm-1.48,0,0);
  body([brC(0,0,0,px(6),.11,brRound(z=>z>px(5.2)?[200,160,72]:[60,56,58],()=>[200,160,72])),{t:'ell',c:[0,0,px(6.4)],r:[.09,.09,.03],mat:q=>hash(Math.floor(q[0]*120),Math.floor(q[1]*120),1247)<.4?[120,80,50]:[40,36,36]}],8,R.jx+.3,jm+1.55,0,0);
  // ---- THE GASOLIER over the table: a brass rod down from the ceiling, its bowl, three arms, a glass globe on each, lit
  { const br=q=>[200,160,72], parts=[srB(-.02,-.02,px(76),.02,.02,px(R.H),brFlat([180,144,66])),{t:'ball',c:[0,0,px(75)],r:.06,mat:br}];
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3, x=Math.cos(a)*.26, y=Math.sin(a)*.26; parts.push(srB(Math.min(0,x)-.008,Math.min(0,y)-.008,px(74.5),Math.max(0,x)+.008,Math.max(0,y)+.008,px(75.5),brFlat([180,144,66])),{t:'ball',c:[x,y,px(77)],r:.05,mat:()=>brLit([255,226,160])}); }
    fixed(parts,TU,TV,0,0); }
  // ---- HOLMES'S DESK (the right wall): a mahogany pedestal desk, its green leather top; the papers, a bundle in red tape, the inkstand, the
  // green-shaded lamp lit; his chair at it
  { const dc=9.78, dv=3.6, top=(c,r)=>c>4&&c<30&&r>4&&r<68?[46,78,58]:[110,58,38], parts=[srB(-.34,-.72,px(20),.34,.72,px(21.5),brL(wood,{t:top},sh(wood,.5))),srB(-.32,-.7,0,.32,-.32,px(20),W),srB(-.32,.32,0,.32,.7,px(20),W)];
    fixed(parts,dc,dv,0,0); st.push([X(dc-.34),Y(dv-.72),0,X(dc+.34),Y(dv+.72),px(21.5)]);
    const z=21.5; body([srB(-.12,-.16,0,.12,.16,px(.6),brFlat([236,230,210])),srB(-.1,-.15,px(.6),.1,.14,px(1),brFlat([226,220,198]))],.3,dc-.08,dv+.32,z,.2);   // the papers
    body([srB(-.1,-.07,0,.1,.07,px(2.4),brL([210,200,170],{t:(c,r)=>Math.abs(c-4.8)<.8||Math.abs(r-3.4)<.8?[180,40,36]:[214,204,176]},false))],.4,dc+.05,dv-.3,z,-.3);   // documents tied in red tape
    body([srB(-.08,-.12,0,.08,.12,px(.8),brFlat([40,30,24])),brC(0,-.05,px(.8),px(2.2),.025,brRound(()=>[30,30,40],()=>[20,20,20])),brC(0,.05,px(.8),px(2.2),.025,brRound(()=>[30,30,40],()=>[20,20,20])),srB(-.004,-.11,px(.8),.004,.11,px(1.2),brFlat([236,232,214]))],.6,dc+.2,dv,z,0);   // the inkstand, a pen
    body([brC(0,0,0,px(1),.05,brRound(()=>[176,140,64],()=>[200,160,72])),brC(0,0,px(1),px(9),.008,brFlat([176,140,64])),{t:'ell',c:[0,0,px(9.2)],r:[.07,.07,.04],mat:(q,n)=>n[2]<-.2?brLit([255,236,170]):[40,96,60],clip:-.005}],.8,dc-.1,dv-.55,z,0);   // the green-shaded lamp
    N.chairD=chair(dc-.68,dv,0); }
  // ---- THE SIDEBOARD (the right wall, further down): the tantalus, its three decanters (empty glass: no painted liquid); the gasogene, two
  // glass globes in their wire
  { const su=R.x1-R.x0-.22, sv=6.4; fixed([srB(-.2,-.6,0,.2,.6,px(22),brL(wood,{t:woodT,xn:brCan(19,52,g=>{ g.box(0,0,19,52,[92,46,30]); g.box(2,2,17,24,[80,40,26]); g.box(2,28,17,50,[80,40,26]); g.box(8,22,11,24,[200,160,70]); g.box(8,48,11,50,[200,160,70]); })},sh(wood,.5)))],su,sv,0,0);
    st.push([R.x1-.42,Y(sv-.6),0,R.x1,Y(sv+.6),px(22)]);
    body([srB(-.08,-.12,0,.08,.12,px(1),brFlat([70,40,26])),...[-.08,0,.08].map(a=>brC(0,a,px(1),px(6),.03,(q,n)=>n[2]>.5?[226,232,234]:[196,210,214])),srB(-.08,-.12,px(6),.08,.12,px(6.6),brFlat([200,160,70]))],1.5,su,sv-.35,22,0);
    body([{t:'ball',c:[0,0,px(2)],r:.07,mat:q=>(Math.floor((q[0]+q[2])*120)%4===0)?[90,90,96]:[200,214,220]},{t:'ball',c:[0,0,px(5.4)],r:.05,mat:q=>(Math.floor((q[1]+q[2])*120)%4===0)?[90,90,96]:[200,214,220]},srB(-.008,-.008,px(6.6),.008,.008,px(8.4),brFlat([180,180,184])),srB(0,-.006,px(7.8),.05,.006,px(8.4),brFlat([180,180,184]))],1.2,su-.02,sv+.35,22,0); }
  // ---- A PALM in a glazed pot in the corner by the settee: fronds arching out
  { const parts=[brC(0,0,0,px(9),.17,brRound(z=>z>px(8)?[60,90,110]:[46,74,96],()=>[70,50,34])),srB(-.012,-.012,px(9),.012,.012,px(26),brFlat([96,80,46]))];
    for(let k=0;k<7;k++){ const a=k*.9, r=.18+.1*(k%3); parts.push({t:'ell',c:[Math.cos(a)*r,Math.sin(a)*r,px(24+(k%3)*3)],r:[.16,.05,.03],mat:brLeaf()}); }
    fixed(parts,R.x1-R.x0-.45,.5,0,0); }
  // ---- MORTIMER'S STICK: a fine, thick piece of wood, bulbous-headed, a Penang lawyer; a broad silver band an inch under the head ("To James
  // Mortimer, M.R.C.S., from his friends of the C.C.H. 1884"); the iron ferrule worn down; leaning against the wall by the fire
  { const L=1.04, wd=(q)=>q[2]>L/2-.09&&q[2]<L/2-.06?[214,218,222]:q[2]<-L/2+.05?[70,70,74]:(Math.floor(q[2]*60)%7===0?[96,58,32]:[122,74,40]);
    const a=.26, s=phyBody({parts:[brC(0,0,0,L,.02,wd,{}),{t:'ball',c:[0,0,L+.02],r:.04,mat:()=>[110,66,34]}],m:.6,at:[X(.32),R.j1+.25,0],q:qMul(qAxis([0,1,0],-a),[1,0,0,0]),mu:1,e:.02});
    B.push(s); N.stick=s; }
  // ---- THE LANDING: the banister down the stair's open side, its newel post at the top; the hat-and-coat stand by the door (Watson's bowler
  // and his coat on it), an umbrella stand
  { const lv=R.ly0-R.y0+.55, parts=[srB(-.04,-.04,0,.04,.04,px(42),W),srB(-1.9,-.02,px(36),0,.02,px(38),W)];
    for(let a=-1.75;a<0;a+=.16)parts.push(srB(a-.008,-.008,0,a+.008,.008,px(36),Wn));
    fixed(parts,1.9,lv,0,0); st.push([X(0),Y(lv-.03),0,X(1.95),Y(lv+.03),px(38)]);
    const hu=8.2, hv2=R.ly1-R.y0-.25; fixed([brC(0,0,0,px(1),.12,brRound(()=>wood,()=>woodT)),srB(-.015,-.015,px(1),.015,.015,px(56),Wn),...[0,1,2,3].map(k=>srB(Math.cos(k*1.57)*.09-.01,Math.sin(k*1.57)*.09-.01,px(50),Math.cos(k*1.57)*.09+.01,Math.sin(k*1.57)*.09+.01,px(52),Wn)),
      {t:'ell',c:[0,.05,px(38)],r:[.1,.07,.16],mat:()=>[70,60,50]},brC(.07,0,px(53),px(56),.06,brRound(()=>[30,28,30],()=>[24,22,24])),brC(.07,0,px(52.5),px(53),.09,brRound(()=>[30,28,30],()=>[30,28,30]))],hu,hv2,0,0);
    fixed([brC(0,0,0,px(10),.07,brRound(()=>[60,70,80],()=>[30,30,30])),srB(-.01,-.01,px(6),.01,.01,px(20),brFlat([30,30,34])),srB(.03,-.01,px(4),.05,.01,px(18),brFlat([110,70,40]))],hu+.5,hv2,0,0); }
  SRM.bodies=B; SRM.fix=F; SRM.st=st; SRM.hang=[]; SRM.envAt=-1e9; SRM.envK=null; SRM.stamp++; SRM.named=N; SRM.solids=solids; srGroups(); }
// THINGS ON THINGS (as the bedroom's, brGroups): each light thing standing on a piece of furniture is painted with it (with), so a cup on the
// table isn't a picture of its own until it's knocked off or picked up
function srGroups(){ const C=[...SRM.solids,...SRM.fix].map(b=>{ let a=[1e9,1e9,1e9,-1e9,-1e9,-1e9]; for(const p of b.parts){ if(p.t==='ell')continue; const e=p.t==='box'?p.h:p.t==='ball'?[p.r,p.r,p.r]:[p.r,p.r,p.hh];
      for(const i of [-1,1])for(const j of [-1,1])for(const k of [-1,1]){ const w=phyW(b,v3a(p.c,[i*e[0],j*e[1],k*e[2]])); for(let d=0;d<3;d++){ a[d]=Math.min(a[d],w[d]); a[d+3]=Math.max(a[d+3],w[d]); } } }
    b.with=[]; return {b,a,s:(a[3]-a[0])*(a[4]-a[1])}; });
  for(const m of SRM.bodies){ m.inside=false; if(SRM.solids.includes(m)||m.frame)continue; let best=null;
    for(const c of C){ const a=c.a, x=m.x; if(x[0]>a[0]-.02&&x[0]<a[3]+.02&&x[1]>a[1]-.02&&x[1]<a[4]+.02&&x[2]>a[2]&&x[2]<a[5]+1.2&&(!best||c.s<best.s))best=c; }
    if(best){ best.b.with.push(m); m.inside=true; } } }
// the heavy things' footprints for walking (PHYSOLID, 30-walking), with the players' (47-play-1-cast): while you're here
function srFoot(extra){ const o=SRM.solids.map(b=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of b.parts){ if(p.t==='ell')continue; const e=p.t==='box'?p.h:[p.r,p.r,p.hh];
    for(const i of [-1,1])for(const j of [-1,1]){ const w=phyW(b,v3a(p.c,[i*e[0],j*e[1],0])); x0=Math.min(x0,w[0]); x1=Math.max(x1,w[0]); y0=Math.min(y0,w[1]); y1=Math.max(y1,w[1]); } }
    return {fp:[x0,y0,x1,y1],b}; }); return extra?o.concat(extra):o; }
// EACH FRAME, near it (phyRoomTick, 47-physics-3): the fire, a shove from you (as the bedroom's), the groups kept up
function srTick(dt,now){ const t0=performance.now(); SRFIRE.t+=dt; SRFIRE.f=Math.floor(SRFIRE.t*8)%16;   // (sixteen frames, two seconds, then round again: painted once each and kept, 47-physics-3)
  const S=PHYSHOVE; if(S&&now-S.t<80&&SRM.bodies.includes(S.b)){ const d=Math.hypot(S.dx,S.dy)||1, sp=Math.min(.6,9/S.b.m)*dt; phyWake(S.b); S.b.you=.3; S.b.x[0]+=S.dx/d*sp; S.b.x[1]+=S.dy/d*sp; S.b.v[0]=S.dx/d*sp/dt; S.b.v[1]=S.dy/d*sp/dt; }
  if(SRM.bodies.some(b=>b.awake))srGroups();
  PERF.add('221B: the fire, shoves',performance.now()-t0);
  playTick(dt,now); }   // (the scene played in it: 47-play-2-scene)
````

### 9.12 3D game: src/039-bodega.js, lines 621 to 831

The play kit as copied into the 3D game: script, timetable, lighting cues, stage, front, seats and sets.

````js
}
{
const PLAY={title:'THE HOUND OF THE BASKERVILLES',
  marks:{DL:[-3,.5],DC:[0,.5],DR:[3,.5],L:[-3,1.8],C:[0,1.8],R:[3,1.8],UL:[-3,3.1],UC:[0,3.1],UR:[3,3.1],OL:[-5.3,1.9],OR:[5.3,1.9],
    CHAIRL:[-2.2,1.5],CHAIRR:[1.6,1.5],WINDOW:[3.4,2.6],FIRE:[-.4,2.5],TOR:[.6,3.1],ROCK:[-2.4,.8],MIRE:[-4.1,3],PATH:[3.2,2.4]},
  cast:{
    holmes:{name:'Sherlock Holmes',look:{shirt:'#3a3d44',pants:'#2b2c31',hair:'#1e1a18',skin:'#e2c2ac',shoes:'#221a14'},hat:'deerstalker',hatC:'#7a6a50'},
    watson:{name:'Dr. Watson',look:{shirt:'#6a5440',pants:'#4a3e34',hair:'#6e5236',skin:'#e6c4b0',shoes:'#3a2a1c'},hat:'bowler',hatC:'#25211e'},
    mortimer:{name:'Dr. Mortimer',look:{shirt:'#2c3a32',pants:'#3c3c3a',hair:'#8a7a62',skin:'#eccab6',shoes:'#2a2420'},hat:'top',hatC:'#1c1c1e'},
    henry:{name:'Sir Henry Baskerville',look:{shirt:'#8a6a3e',pants:'#5a4630',hair:'#a0682c',skin:'#e8c0a0',shoes:'#4a3020'},hat:'wide',hatC:'#5a4a36'},
    stapleton:{name:'Jack Stapleton',look:{shirt:'#7a7a5a',pants:'#5e5a46',hair:'#c4a870',skin:'#e4c2a8',shoes:'#4a3c2a'},hat:'straw',hatC:'#d8c48a'},
    barrymore:{name:'Barrymore',look:{shirt:'#141416',pants:'#141416',hair:'#2a2420',skin:'#d8b8a0',shoes:'#0c0c0c'},hat:null}},
  scenes:[
    {name:'221B Baker Street',set:'baker',lt:'warm',cast:{holmes:'WINDOW',watson:'CHAIRL'},face:{holmes:'R',watson:'C'},beats:[
      {x:'street',over:true},
      {w:'watson',s:'Holmes, our visitor of last night forgot his walking stick. What do you make of it?',a:'wave'},
      {w:'holmes',s:'[amused] How did you know what I was doing? I believe you have eyes in the back of your head.',f:'watson'},
      {w:'watson',s:'I have, at least, a well-polished coffee pot in front of me.'},
      {w:'holmes',s:'Then tell me, Watson. What do you read in our visitor\'s stick?',go:'C'},
      {w:'watson',s:'An elderly country doctor. Well esteemed. One who walks a great deal.',f:'holmes'},
      {w:'holmes',s:'[laughs softly] Splendid, Watson. Wrong in almost every particular! A young man, amiable, unambitious, absent-minded, and the owner of a favourite dog. Larger than a terrier, and smaller than a mastiff.',a:'wave',f:'out'},
      {x:'knock'},
      {w:'holmes',s:'And here, unless I am mistaken, is the man himself.',f:'OR'},
      {do:[['mortimer','enter','OR','R']]},
      {w:'mortimer',s:'Mr. Sherlock Holmes? Doctor James Mortimer. I have come about a death on Dartmoor. And about a legend.',f:'holmes'},
      {w:'holmes',s:'Pray, sit down, Doctor. Watson, the lamp.',go:'CHAIRR',f:'mortimer'},
      {do:[['watson','go','FIRE']]},
      {x:'reading',over:true},
      {w:'mortimer',s:'[reading slowly, low] Know then, that in the time of the Great Rebellion, Hugo Baskerville, a wild and godless man, hunted a maiden across the moor by night. And there stood over him a foul thing. A great black beast, shaped like a hound, yet larger than any hound that ever mortal eye has rested upon.',go:'C',f:'out'},
      {x:'howlfar',over:true},
      {w:'mortimer',s:'Three weeks ago, Sir Charles Baskerville was found dead at the end of the yew alley. There was no mark upon him. But his face. His face was twisted with terror.'},
      {w:'watson',s:'[quietly] Good heavens.',f:'mortimer'},
      {w:'mortimer',s:'There were footprints near the body, Mr. Holmes.',f:'holmes'},
      {w:'holmes',s:'A man\'s, or a woman\'s?',f:'mortimer'},
      {w:'mortimer',s:'[whispers] Mr. Holmes. They were the footprints of a gigantic hound!',a:'wave'},
      {x:'sting'},{p:1.2}]},
    {name:'Baskerville Hall',set:'hall',lt:'hall',cast:{henry:'UL',watson:'L',barrymore:'UR'},face:{henry:'C',watson:'C',barrymore:'henry'},beats:[
      {x:'door'},
      {w:'barrymore',s:'[gravely] Welcome to Baskerville Hall, Sir Henry. Dinner is laid in the hall, sir.',go:'R'},
      {w:'henry',s:'Some welcome. It\'s not a cheerful place, is it, Barrymore? I don\'t wonder my uncle got a little jumpy, living here alone.',go:'C',f:'barrymore'},
      {w:'watson',s:'Mr. Holmes has sent me to see that you are never left alone, Sir Henry. Especially after dark.',f:'henry'},
      {w:'henry',s:'[laughs] A ghost dog! I\'ve lived in the West, Doctor Watson. I\'ve heard wolves at night. I\'ll not be frightened off by a story.',f:'watson',a:'wave'},
      {x:'sob'},
      {w:'watson',s:'[hushed] Listen. Did you hear that? A woman, crying.',f:'UR'},
      {w:'henry',s:'Barrymore. Who is that?',f:'barrymore'},
      {w:'barrymore',s:'[hesitating] There are only two women in the house, sir. The scullery maid sleeps in the far wing, and my wife. And I can answer for it, sir, it was not my wife.',f:'henry'},
      {w:'henry',s:'Then who?'},
      {w:'barrymore',s:'[uneasy] The wind, sir. The wind on the moor does strange things. Good night, sir.',f:'out'},
      {do:[['barrymore','exit','OR']]},
      {w:'watson',s:'[quietly, to himself] It was not the wind.',go:'DC',f:'out'},
      {x:'howlfar'},{p:1}]},
    {name:'The Moor at Dusk',set:'moor',lt:'dusk',cast:{watson:'DL'},face:{watson:'R'},beats:[
      {do:[['watson','go','L']]},{p:1.5},
      {do:[['stapleton','enter','OR','R']]},
      {w:'stapleton',s:'[cheerfully] Doctor Watson! Forgive the liberty. Stapleton, of Merripit House. I chase butterflies on the moor.',f:'watson',a:'wave'},
      {w:'watson',s:'A lonely place for it.',f:'stapleton'},
      {w:'stapleton',s:'A wonderful place! But take care where you walk, Doctor. That bright green patch is the great Grimpen Mire. A false step there means death, to man or beast.',go:'C',f:'MIRE'},
      {x:'mire'},
      {w:'stapleton',s:'[softly] There. A moor pony. Two in a week. The Mire has them, and it does not let go.'},
      {x:'howlfar',over:true},
      {w:'watson',s:'[uneasy] What on earth is that?',f:'UL'},
      {w:'stapleton',s:'[lightly] The peasants say it is the Hound of the Baskervilles, calling for its prey.',f:'watson'},
      {w:'watson',s:'And you, a man of science, believe that?'},
      {w:'stapleton',s:'[smiling] I believe in getting home before dark, Doctor. Good evening.',f:'out'},
      {do:[['stapleton','exit','OR']]},{p:1.2},
      {do:[['holmes','enter','OL','TOR']]},
      {w:'holmes',s:'It is a lovely evening, my dear Watson.',f:'watson'},
      {w:'watson',s:'[startled] Holmes! You, here? I thought you were in London!',f:'holmes',a:'block'},
      {w:'holmes',s:'That was what I wished you to think. Our naturalist is no stranger to that hound, Watson. Tonight we set a trap. And Sir Henry, I am afraid, must be the bait.',go:'C',f:'out'},
      {x:'sting'},{p:1}]},
    {name:'The Moor at Night',set:'fog',lt:'night',cast:{holmes:'ROCK',watson:'L'},face:{holmes:'R',watson:'R'},beats:[
      {do:[['holmes','a','crouch'],['watson','go','DL']]},
      {w:'holmes',s:'[whispers] Keep down. Sir Henry leaves Merripit House at ten. He must cross the moor alone.',f:'watson'},
      {w:'watson',s:'[whispers] The fog, Holmes. It is rolling in from the Mire.',f:'R'},
      {w:'holmes',s:'[whispers, tense] The one thing on earth that could have spoiled my plans.',f:'R'},
      {x:'owl'},
      {do:[['henry','enter','OR','PATH']]},{p:1.5},
      {do:[['henry','go','C']]},
      {x:'paws',over:true},{hound:'enter',from:'OR'},
      {x:'snarl',over:true},{hound:'leap',at:'henry'},
      {w:'henry',s:'[screams] Holmes! Watson! Help me!',a:'fall'},
      {w:'holmes',s:'[shouting] Now, Watson! The lantern!',go:'R',a:'block'},
      {do:[['watson','go','C']]},
      {x:'howlnear',over:true},{hound:'flee',to:'MIRE'},
      {x:'splash'},
      {w:'watson',s:'[breathless] It is gone. Into the Mire!',f:'MIRE'},
      {w:'holmes',s:'Did you see its jaws, Watson? Phosphorus. A cunning preparation. It was a living dog, painted to look like a fiend from hell.',f:'watson'},
      {w:'henry',s:'[shaken] Then who? Who would do such a thing?',go:'C',f:'holmes'},
      {w:'holmes',s:'Stapleton. A Baskerville himself, Sir Henry, hidden under another name, and next in line for your fortune. He has fled into the fog. The Mire will judge him now.',f:'out'},
      {x:'mire'},{p:1}]},
    {name:'221B Baker Street, Evening',set:'baker',lt:'evening',cast:{holmes:'CHAIRR',watson:'CHAIRL'},face:{holmes:'out',watson:'holmes'},beats:[
      {w:'watson',s:'A dreadful business, Holmes. And yet you saw it all from the first.'},
      {w:'holmes',s:'[warmly] The world is full of obvious things, Watson, which nobody by any chance ever observes.',f:'watson'},
      {w:'holmes',s:'Come. Dinner, I think. And afterwards, a little music.',go:'WINDOW',f:'out'},
      {x:'violin'},{p:.5}]}]};
const PLAYT={"walk":1.5,"open":3,"close":3,"scenes":[{"S":12,"E":131.06},{"S":137.56,"E":211.23},{"S":217.73,"E":314.13},{"S":320.63,"E":410.51},{"S":417.01,"E":444.56}],"beats":[[15,0,0],[15.5,0,1],[20.99,0,2],[25.92,0,3],[29.65,0,4],[34.1,0,5],[39.83,0,6],[56.68,0,7],[58.88,0,8],[63.41,0,9],[65.24,0,10],[73.29,0,11],[76.78,0,12],[78.46,0,13],[78.96,0,14],[99.33,0,15],[99.83,0,16],[111.56,0,17],[113.69,0,18],[116.78,0,19],[119.55,0,20],[126.16,0,21],[129.36,0,22],[140.56,1,0],[143.76,1,1],[149.25,1,2],[156.26,1,3],[162.23,1,4],[170.04,1,5],[175.24,1,6],[180.89,1,7],[183.74,1,8],[193.15,1,9],[194.32,1,10],[200.05,1,11],[201.88,1,12],[203.53,1,13],[209.73,1,14],[220.73,2,0],[221.9,2,1],[223.4,2,2],[225.23,2,3],[233.12,2,4],[235.41,2,5],[250.18,2,6],[256.38,2,7],[264.19,2,8],[264.69,2,9],[266.82,2,10],[271.99,2,11],[275.16,2,12],[280.49,2,13],[284.33,2,14],[285.53,2,15],[289.84,2,16],[292.53,2,17],[296.5,2,18],[309.43,2,19],[312.63,2,20],[323.63,3,0],[324.93,3,1],[332.58,3,2],[336.31,3,3],[340.52,3,4],[343.72,3,5],[345.46,3,6],[346.96,3,7],[349.43,3,8],[349.93,3,9],[352.13,3,10],[352.63,3,11],[353.73,3,12],[358.1,3,13],[360.71,3,14],[363.19,3,15],[363.69,3,16],[366.29,3,17],[371.49,3,18],[374.34,3,19],[383.91,3,20],[387.16,3,21],[402.81,3,22],[409.01,3,23],[420.01,4,0],[424.3,4,1],[430.59,4,2],[435.36,4,3],[443.56,4,4]],"lines":[[15.5,5.04,0,1],[20.99,4.48,0,2],[25.92,3.28,0,3],[29.65,4,0,4],[34.1,5.28,0,5],[39.83,16.4,0,6],[58.88,4.08,0,8],[65.24,7.6,0,10],[73.29,3.04,0,11],[78.96,19.92,0,14],[99.83,11.28,0,16],[111.56,1.68,0,17],[113.69,2.64,0,18],[116.78,2.32,0,19],[119.55,6.16,0,20],[143.76,5.04,1,1],[149.25,6.56,1,2],[156.26,5.52,1,3],[162.23,7.36,1,4],[175.24,5.2,1,6],[180.89,2.4,1,7],[183.74,8.96,1,8],[193.15,0.72,1,9],[194.32,5.28,1,10],[201.88,1.2,1,12],[225.23,7.44,2,3],[233.12,1.84,2,4],[235.41,14.32,2,5],[256.38,7.36,2,7],[264.69,1.68,2,9],[266.82,4.72,2,10],[271.99,2.72,2,11],[275.16,4.88,2,12],[289.84,2.24,2,16],[292.53,3.52,2,17],[296.5,12.48,2,18],[324.93,7.2,3,1],[332.58,3.28,3,2],[336.31,3.76,3,3],[353.73,3.92,3,12],[358.1,2.16,3,13],[371.49,2.4,3,18],[374.34,9.12,3,19],[383.91,2.8,3,20],[387.16,15.2,3,21],[420.01,3.84,4,0],[424.3,5.84,4,1],[430.59,4.32,4,2]],"sounds":[{"k":"bell","at":0,"vol":0.7},{"k":"overture","at":2.5,"vol":0.55},{"k":"street","at":15,"vol":0.35},{"k":"knock","at":56.68,"vol":0.8},{"k":"reading","at":78.46,"vol":0.4},{"k":"howlfar","at":99.33,"vol":0.55},{"k":"sting","at":126.16,"vol":0.6},{"k":"fire","at":10.5,"vol":0.22,"bed":1,"until":134.06},{"k":"clock","at":10.5,"vol":0.12,"bed":1,"until":134.06},{"k":"door","at":140.56,"vol":0.7},{"k":"sob","at":170.04,"vol":0.45},{"k":"howlfar","at":203.53,"vol":0.55},{"k":"hallwind","at":136.06,"vol":0.26,"bed":1,"until":214.23},{"k":"mire","at":250.18,"vol":0.6},{"k":"howlfar","at":264.19,"vol":0.55},{"k":"sting","at":309.43,"vol":0.6},{"k":"wind","at":216.23,"vol":0.3,"bed":1,"until":317.13},{"k":"owl","at":340.52,"vol":0.5},{"k":"paws","at":349.43,"vol":0.8},{"k":"snarl","at":352.13,"vol":0.95},{"k":"howlnear","at":363.19,"vol":0.9},{"k":"splash","at":366.29,"vol":0.8},{"k":"mire","at":402.81,"vol":0.6},{"k":"fog","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"wind","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"violin","at":435.36,"vol":0.6},{"k":"fire","at":415.51,"vol":0.22,"bed":1,"until":447.56},{"k":"clock","at":415.51,"vol":0.12,"bed":1,"until":447.56}],"call":{"S":450.06,"bow":[454.06,456.56],"E":459.56},"len":464.56};
const PLL=PLAYT.len, plEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
const W_=[1,.86,.62], LOB=[.15,.12,.08], WL=[.32,.21,.1], PLCUE={house:{house:W_,lobby:W_,wall:[.8,.52,.26],candle:[.9,.6,.28]},preshow:{house:[.3,.26,.2],lobby:[.6,.5,.36],wall:[.6,.4,.2],candle:[1,.66,.3]},
  warm:{lobby:LOB,wall:WL,candle:[1.2,.78,.36],prac:[1.2,.6,.24]},hall:{lobby:LOB,wall:WL,candle:[1,.64,.28],prac:[.7,.48,.22]},dusk:{lobby:LOB,wall:WL,candle:[.95,.6,.28]},
  night:{lobby:LOB,wall:WL,candle:[.8,.5,.24]},evening:{lobby:LOB,wall:WL,candle:[1,.64,.3],prac:[1.3,.66,.26]},between:{lobby:LOB,wall:WL,candle:[.18,.12,.06]},
  call:{house:[.4,.34,.25],lobby:LOB,wall:[.6,.4,.2],candle:[1.2,.8,.38]}};
function lobbyCol(x,y){ const i=Math.floor(x*3),j=Math.floor(y*3);
  return mt('tiles',(x*3-i)<.05||(y*3-j)<.05?[118,116,110]:((i+j)&1?[206,202,192]:[58,58,60])); }
const PFONT={...STOREK.theatre.THFONT,D:'####.#...##...##...##...##...#####.',F:'######....#....####.#....#....#....',L:'#....#....#....#....#....#....#####',V:'#...##...##...##...##...#.#.#..#...',
  Y:'#...##...#.#.#..#....#....#....#...',0:'.###.#...##..###.#.###..##...#.###.',1:'..#...##....#....#....#....#...###.',2:'.###.#...#....#...#...#...#...#####',
  4:'...#...##..#.#.#..#.#####...#....#.',6:'..##..#...#....####.#...##...#.###.',8:'.###.#...##...#.###.#...##...#.###.'};
const PLAYK=PLB=>{ const PLMID=(PLB.x0+PLB.x1)/2, SY=PLB.y0+7.9, ay=a=>SY+(a+48.3)*6/6.2;
const PLS={x0:PLB.x0+.1,x1:PLB.x1-.1,SY,PRY:ay(-47.4),PRX0:PLMID-4.3,PRX1:PLMID+4.3,PRZ:90,CY:ay(-46.8),SZ:22,back:PLB.y1-.1,LEGS:[ay(-45.4),ay(-43.9)],legW:1.6,
  rows:[2.4].map(d=>SY-d),SPOT:[PLMID,SY+2.7,1.6],SX0:PLMID-2.5,SX1:PLMID+2.5,lobby:PLB.y0+1.6};
const PLWALLS=[SY-1.9,SY-4.3], PLCANDLES=[[PLMID-3.5,SY+.25,20],[PLMID-1.4,SY+.25,14],[PLMID+1.4,SY+.25,14],[PLMID+3.5,SY+.25,20],[PLMID+3.9,ay(-45.2),24]];
const plMark=m=>[PLMID+m[0],PLS.CY+.5+m[1]], PLC=PLS.CY+.5;
function playFloorCol(x,y){ '@later'; if(y<PLS.lobby)return lobbyCol(x,y);
  { const a=Math.abs(x-PLMID); if(a>PLS.SX1-PLMID+.15&&a<PLS.SX1-PLMID+1.25&&y<PLS.SY)return mt('carpet',speck(a<PLS.SX1-PLMID+.22||a>PLS.SX1-PLMID+1.18?[150,118,58]:[128,26,34],x,y,23)); }
  const r=Math.floor(x*4), b=Math.floor(y/1.5+hash(r,0,41)*3), c=[[86,58,40],[78,52,36],[92,62,42]][Math.floor(hash(b,r,43)*3)];
  return mt('wood',(x*4-r)<.08?sh(c,.7):c); }
function playWall(q,nx,ny,X,Y,z,f){ '@later'; const u=nx?Y:X;
  if(ny<0&&Math.abs(Y-PLB.y1)<.3||ny>0&&Math.abs(Y-PLB.y0)<.3)return sh((u*24|0)%9<4?[96,14,26]:[74,10,20],f);
  if(Y>PLS.PRY+.05)return sh(z<PLS.SZ&&ny?[60,46,34]:[20,20,22],f);
  if(z<6)return sh([40,26,20],f);
  if(z<40)return sh(z%10<1?[52,32,24]:[74,46,32],f);
  if(z<44)return sh([186,150,72],f*1.1);
  const d=hash(Math.floor(u*24/6),Math.floor(z/8),57)<.5, m=((u*24|0)+(z|0))%12<2;
  return sh(m&&d?[112,34,40]:[98,26,32],f); }
const PFRONT=(()=>{ let o=null; const build=()=>{ const W=Math.round((PLB.x1-PLB.x0)*24), H=PLB.h, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
  const box=(c0,z0,c1,z1,col)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++)px(c,z,col); }, U=x=>(x-PLB.x0)*24, lit=c=>{ const o=c.slice(); o.e=1; return o; };
  const text=(s,c,z,k,col,ol)=>{ for(const pass of ol?[0,1]:[1])[...s].forEach((ch,i)=>{ const g=PFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#'){
      if(pass)box(c+(i*6+q)*k,z+(6-j)*k,c+(i*6+q+1)*k,z+(7-j)*k,col); else for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])box(c+(i*6+q)*k+dx,z+(6-j)*k+dz,c+(i*6+q+1)*k+dx,z+(7-j)*k+dz,ol); } }); };
  const tw=(s,k)=>(s.length*6-1)*k;
  const CREAM=[226,214,186], CREAMD=[188,174,146], GREEN=[34,58,48], GILT=[198,160,76], BULB=lit([255,226,150]);
  for(let z=0;z<H;z++)for(let c=0;c<W;c++){ const r=Math.floor(z/3), cc=c+(r&1)*3; px(c,z,z%3===0||cc%6===0?[92,38,32]:hash(Math.floor(cc/6),r,871)<.3?[132,58,48]:[118,50,44]); }
  box(0,0,W,8,[150,146,136]); box(0,7,W,9,[124,120,112]);
  for(const [c0,c1] of [[0,12],[W-12,W]]){ box(c0,8,c1,H-14,CREAM); for(let z=14;z<H-14;z+=10)box(c0,z,c1,z+1,CREAMD); }
  box(0,H-14,W,H,CREAM); box(0,H-14,W,H-12,CREAMD); for(let c=4;c<W;c+=10)box(c,H-10,c+5,H-6,CREAMD);
  const d0=U(PLMID-1.2), d1=U(PLMID+1.2); box(d0-4,0,d1+4,76,GREEN); box(d0-2,72,d1+2,76,GILT);
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0)-3,25,U(x1)+3,72,CREAM); box(U(x0)-4,24,U(x1)+4,26,CREAMD); }
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0),27,U(x1),70,lit([236,196,120])); box((U(x0)+U(x1))/2-1,27,(U(x0)+U(x1))/2+1,70,CREAM); box(U(x0),47,U(x1),49,CREAM); }
  const cw=96; box(W/2-cw,74,W/2+cw,86,[30,40,36]); box(W/2-cw,84,W/2+cw,87,GILT); for(let c=W/2-cw+2;c<W/2+cw;c+=6)px(c,75,BULB);
  const nm='THE HOUND OF THE BASKERVILLES'; text(nm,(W-tw(nm,1))/2,77,1,lit([240,226,180]));
  const bw=tw('PLAYHOUSE',2)+18, b0=(W-bw)/2; box(b0,90,b0+bw,114,CREAM); box(b0-2,88,b0+bw+2,90,GILT); box(b0-2,114,b0+bw+2,116,GILT);
  for(let z=92;z<113;z+=5){ px(b0+2,z,BULB); px(b0+bw-3,z,BULB); }
  text('PLAYHOUSE',b0+9,100,2,[150,28,34],[90,16,20]); const ts='TAKE A SEAT'; text(ts,(W-tw(ts,1))/2,91,1,[120,90,40]);
  for(const c0 of [14,W-14-30]){ box(c0-2,16,c0+32,72,GILT); box(c0,18,c0+30,70,[46,74,62]);
    for(let z=18;z<70;z++)for(let c=c0;c<c0+30;c++)if(hash(c,z,881)<.12)px(c,z,[70,104,88]);
    for(let z=26;z<58;z++)for(let c=c0+4;c<c0+26;c++){ const x=(c-c0-15)/10, y=(z-40)/14; if(x*x+y*y<1||(Math.abs(x)<.5&&y>-1.5&&y<-.5)||(Math.abs(x+.55)<.22&&y>.7&&y<1.4)||(Math.abs(x-.55)<.22&&y>.7&&y<1.4))px(c,z,[14,16,14]); }
    px(c0+11,44,lit([250,236,120])); px(c0+19,44,lit([250,236,120])); px(c0+12,44,lit([250,236,120])); px(c0+18,44,lit([250,236,120]));
    text('HOUND',c0+1,61,1,lit([236,222,176])); }
  return {W,H,a}; }; return {get W(){ return (o||(o=build())).W; },get H(){ return (o||(o=build())).H; },get a(){ return (o||(o=build())).a; }}; })();
const plAt=m=>plMark(PLAY.marks[m]);
const PLTR=PLAY.scenes.map((sc,si)=>{ const A={}, pos={}, H=[], get=w=>A[w]||(A[w]={walks:[],faces:[],acts:[],talk:[],in:-1e9,out:1e9,p0:null});
  for(const [w,m] of Object.entries(sc.cast)){ const a=get(w); pos[w]=plAt(m); a.p0=pos[w].slice(); a.faces.push([-1e9,(sc.face||{})[w]||'out']); }
  const walk=(w,to,t)=>{ const a=get(w), p=pos[w], q=plAt(to), d=Math.hypot(q[0]-p[0],q[1]-p[1]); if(d<.01)return t; const t1=t+d/PLAYT.walk; a.walks.push([t,t1,p[0],p[1],q[0],q[1]]); a.faces.push([t1,{dir:[q[0]-p[0],q[1]-p[1]]}]); pos[w]=q; return t1; };
  const dur=new Map(PLAYT.lines.filter(l=>l[2]===si).map(l=>[l[3],l[1]]));
  for(const [t0,s,bi] of PLAYT.beats){ if(s!==si)continue; const b=sc.beats[bi];
    if(b.w){ const a=get(b.w); const te=b.go?walk(b.w,b.go,t0):t0; if(b.f)a.faces.push([te,b.f]); if(b.a)a.acts.push([t0+.3,b.a]); a.talk.push([t0,t0+(dur.get(bi)||1)]); }
    if(b.do)for(const [w,what,m1,m2] of b.do){ const a=get(w);
      if(what==='go')walk(w,m1,t0); else if(what==='face')a.faces.push([t0,m1]); else if(what==='a')a.acts.push([t0,m1]);
      else if(what==='enter'){ a.in=t0; pos[w]=plAt(m1); a.p0=pos[w].slice(); walk(w,m2,t0); }
      else if(what==='exit')a.out=walk(w,m1,t0); }
    if(b.hound==='enter'){ const p=plAt(b.from), q=pos.henry, d=Math.hypot(q[0]-p[0],q[1]-p[1]), k=Math.max(0,(d-1.3)/d); H.push([t0,t0+2.2,p[0],p[1],p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,0]); }
    if(b.hound==='leap'){ const p=H[H.length-1], q=pos.henry; H.push([t0,t0+1.1,p[4],p[5],q[0]+.45,q[1]-.15,1]); }
    if(b.hound==='flee'){ const p=H[H.length-1], q=plAt(b.to), r=plAt('OL'); H.push([t0,t0+1.9,p[4],p[5],q[0],q[1],0],[t0+1.9,t0+2.6,q[0],q[1],r[0],r[1]+1,0]); } }
  for(const a of Object.values(A)){ a.faces.sort((p,q)=>p[0]-q[0]); }
  return {A,H}; });
const PLCALL=(()=>{ const ws=['stapleton','mortimer','watson','holmes','henry','barrymore'], A={};
  ws.forEach((w,i)=>{ const x=PLMID+(i-2.5)*1.45, y=PLS.CY+1.1; A[w]={walks:[],faces:[[-1e9,'out']],acts:PLAYT.call.bow.map(t=>[t,'crouch']),talk:[],in:-1e9,out:1e9,p0:[x,y]}; }); return {A,H:[]}; })();
function plPos(a,t){ '@later'; if(t<a.in||t>a.out)return null; let x=a.p0[0], y=a.p0[1], mv=null;
  for(const w of a.walks){ if(t<w[0])break; if(t>=w[1]){ x=w[4]; y=w[5]; continue; } const k=(t-w[0])/(w[1]-w[0]); x=w[2]+(w[4]-w[2])*k; y=w[3]+(w[5]-w[3])*k; mv=[w[4]-w[2],w[5]-w[3]]; break; }
  return {x,y,mv}; }
function plPlayer(a,t,TR){ '@later'; const p=plPos(a,t); if(!p)return null; const {x,y,mv}=p;
  let f=null; for(const e of a.faces)if(e[0]<=t)f=e[1];
  const at=typeof f==='string'&&f!=='out'?(TR.A[f]?plPos(TR.A[f],t):PLAY.marks[f]?(m=>({x:m[0],y:m[1]}))(plAt(f)):null):null;
  const dir=mv||(f&&f.dir)||(at?[at.x-x,at.y-y]:[0,-1]);
  return {x,y,walking:!!mv,dir}; }
function plState(t){ const SC=PLAYT.scenes, C=PLAYT.call, cur=(S,E)=>t<S?0:t<S+PLAYT.open?plEase((t-S)/PLAYT.open):t<E?1:plEase(1-(t-E)/PLAYT.close);
  if(t<0||t>=PLL)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:'house'};
  for(let i=0;i<SC.length;i++){ const {S,E}=SC[i]; if(t>=S&&t<E+PLAYT.close)return {si:i,c:cur(S,E),set:PLAY.scenes[i].set,lt:PLAY.scenes[i].lt}; }
  if(t>=C.S&&t<C.E+PLAYT.close)return {si:-2,c:cur(C.S,C.E),set:PLAY.scenes[SC.length-1].set,lt:'call'};
  if(t<SC[0].S)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:t<SC[0].S-6?'house':'preshow'};
  if(t>=C.E+PLAYT.close)return {si:-1,c:0,set:PLAY.scenes[SC.length-1].set,lt:'house'};
  let n=SC.findIndex(s=>s.S>t); return {si:-1,c:0,set:PLAY.scenes[n<0?SC.length-1:n].set,lt:'between'}; }
function playFront(X,z,f){ const P=PFRONT, c=Math.floor((X-PLB.x0)*24),
  zz=Math.floor(z); if(c<0||c>=P.W||zz<0||zz>=P.H)return null; const o=P.a[zz*P.W+c]; if(!o)return null; if(o.e)return o; return sh(o,f); }
const props=()=>{ const S=PLS, B=PLB, wood=(x,y)=>{ const r=Math.floor(x*5), c=[[150,108,66],[140,100,60],[158,116,72]][Math.floor(hash(r,Math.floor(y/2),61)*3)]; return mt('wood',(x*5-r)<.07?sh(c,.72):c); };
  const BLK=[22,22,24], blk={c:BLK,top:()=>[30,30,32],fi:()=>[18,18,20],fj:()=>[24,24,26]}, GILT=[200,162,78], RED=[132,28,34];
  SHARED.PNAME='stage'; prop([{x0:S.x0,y0:S.SY,x1:S.x1,y1:S.back,z0:0,z1:S.SZ,c:[120,86,54],top:wood,fi:(y,z)=>sh(z>S.SZ-3?GILT:[46,30,24],.62),fj:(x,z)=>sh(z>S.SZ-3?GILT:[52,34,26],.8)}
  ]);
  const n=Math.round((S.SX1-S.SX0)/1), w=(S.SX1-S.SX0)/n, V=[150,30,42], Vd=[100,16,28], Vh=[186,54,64], Wd=[52,30,22], G=[190,150,70];
  const vel=(c0,top)=>({c:c0,top:()=>top||sh(c0,1.12),fi:()=>sh(c0,.68),fj:()=>sh(c0,.86)});
  const arm=(a,y)=>[{x0:a-.08,y0:y-.42,x1:a+.08,y1:y+.36,z0:0,z1:20,c:Wd,top:()=>Wd,fi:()=>sh(Wd,.7),fj:(x,z)=>z<3?sh(G,.8):Wd},
    {x0:a-.11,y0:y-.4,x1:a+.11,y1:y+.42,z0:20,z1:25,foot:0,...vel(V,Vh),fj:(x,z)=>sh(z>23?Vh:V,.86)}];
  for(const y of S.rows)for(let i=0;i<n;i++){ const a=S.SX0+i*w, b=a+w; SHARED.PNAME='playhouse chair'; prop([
    {x0:a+.1,y0:y-.4,x1:b-.1,y1:y+.3,z0:0,z1:5,c:Wd,top:()=>Wd,fi:()=>sh(Wd,.7),fj:()=>sh(Wd,.85)},
    {x0:a+.1,y0:y-.24,x1:b-.1,y1:y+.44,z0:5,z1:13,foot:0,...vel(V),fj:(x,z)=>sh(z>10?Vh:V,.86)},
    {x0:a+.16,y0:y-.2,x1:b-.16,y1:y+.38,z0:13,z1:16,foot:0,...vel(V,Vh),fj:()=>sh(Vh,.86)},
    {x0:a+.1,y0:y-.48,x1:b-.1,y1:y-.24,z0:5,z1:40,foot:0,...vel(Vd),fj:(x,z)=>sh(z<7?G:Vd,.86)},
    {x0:a+.17,y0:y-.48,x1:b-.17,y1:y-.24,z0:40,z1:44,foot:0,...vel(Vd,sh(Vd,1.2))},
    {x0:a+.28,y0:y-.48,x1:b-.28,y1:y-.24,z0:44,z1:46,foot:0,...vel(Vd,sh(Vd,1.2))},
    {x0:a+.17,y0:y-.24,x1:b-.17,y1:y-.1,z0:16,z1:39,foot:0,...vel(V,Vh),fj:(x,z)=>{ const q=(x-a-.17)/(w-.34)*3%1; return sh(z>36?Vh:q<.08||q>.92?Vd:V,.9); }},
    ...arm(a,y),...(i===n-1?arm(b,y):[])]); }
  for(const [x,nx] of [[B.x0+T,1],[B.x1-T,-1]])for(const y of PLWALLS)STOREK.bar.theatreSconce(x,y,[nx,0]);
  };
function plHoundAt(H,t){ '@later'; if(!H.length||t<H[0][0]||t>=H[H.length-1][1])return null; let s=H[0]; for(const q of H)if(q[0]<=t)s=q;
  const run=t<s[1], k=run?(t-s[0])/(s[1]-s[0]):1, x=s[2]+(s[4]-s[2])*k, y=s[3]+(s[5]-s[3])*k, a=Math.atan2(s[5]-s[3],s[4]-s[2]);
  return {x,y,a,s:run?(t*2.6)%1:.12+.03*Math.sin(t*9),up:s[6]&&run?Math.sin(k*Math.PI)*.7:0,run}; }
const PLPRAC={baker:[PLMID-.4,ay(-42.75),30],hall:[PLMID-.2,PLC+2.6,62],moor:null,fog:null};
const M=[46,42,40], Wd=[96,58,36], Lt=[120,30,28], FI=[250,150,50], Ok=[64,44,30], OkD=[46,30,20], GO=[200,170,90], HE=[84,90,62], GR=[140,136,128], BA=[58,50,44];
const SETS={baker:[],hall:[],moor:[]};
SETS.fog=SETS.moor;
return {PLS,PLMID,PLWALLS,PLCANDLES,PFRONT,playFront,playFloorCol,playWall,props,PLTR,PLCALL,plState,plPlayer,plHoundAt,SETS,PLPRAC,plMark}; };
STOREK.play={PLAY,PLAYT,PLL,PLCUE,PLAYK};
}
````

### 9.13 3D game: src/059-street.js, lines 80 to 178

The 3D playhouse building, drapes, spotlight, actors and the switched-off show.

````js
  // the playhouse lot is solid from the start; only its painting waits for its step (the soak found a pawn sealed in when the step landed)
  { const LW=lot('play',190), TP=TURN(LW,WP.play.face); if(TP.q){ const a=X(LW.x0), b=X(LW.x1), c=Z(LW.y0), d=Z(LW.y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),Y(TP.L.h)]); } }
  STEPS.push(()=>{ const LW=lot('play',190), TP=TURN(LW,WP.play.face), OX=TP.q?760+OFFDX/BLDK-TP.cx:0, B=TP.q?{...TP.L,x0:TP.L.x0+OX,x1:TP.L.x1+OX}:LW, cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2, P=PY.PLAYK(B), mx=x=>2*cx-x, my=y=>2*cy-y, L=[];
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=P.playFront(Xw,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[118,50,44]); };
    const R=room('playhouse','PLAYHOUSE',B,{floor:(x,y)=>P.playFloorCol(mx(x),y),in:(q,nx,ny,X_,Y_,z,f)=>P.playWall(q,-nx,-ny,mx(X_),my(Y_),z,f),out,cope:[226,214,186]},{w:'f',a:cx,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, S=P.PLS, lam=(k,x,y,z,r,c)=>{ const l={x,y,z,r,c}; LAMPS.push(l); L.push([k,l,null]); };
      P.props();
      for(const s of [-1,1]){ lam('house',P.PLMID+s*2.4,S.SY-3.2,110,7,[1,.86,.62]); lam('wall',s<0?B.x0+T+.35:B.x1-T-.35,S.SY-3.1,68,3.2,[.8,.52,.26]); lam('front',P.PLMID+s*1.3,B.y0-.9,74,4,[1.1,.9,.62]); }
      lam('lobby',P.PLMID,B.y0+.8,90,4.5,[1,.86,.62]);
      LAMPS.push({x:S.SPOT[0],y:S.SPOT[1],z:S.SZ+66,r:3.4,c:[1.25,1.14,.92]});
      turn(B,n0,l0); });
    if(TP.q){ const L=TP.L, br=[118,50,44], fc=(nx,ny,u,z,f)=>facade(nx,ny,u,u,z,f,B.h,br);
      BLOCKS.make({...LW,z0:0,z1:B.h,kind:'Rplayhouse',turn:TP,roof:()=>[58,57,57],paint:(sd,u,z,f)=>sd==='f'?(P.playFront(u+OX,z,f)||fc(0,1,u,z,f)):fc(sd==='w'||sd==='e'?1:0,sd==='f'||sd==='b'?1:0,u,z,f)});
      const m=(L.x0+L.x1)/2; STORE.streetDoor.playhouse={door:TP.pt(m,L.y1+.35),out:[...TP.pt(m,L.y1+1.4),TP.hd(0)]};
      STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); }
    const PAT={books:(c,r)=>{ const s=Math.floor(r/16); if(r%16<2)return [96,58,36]; return [[120,30,30],[40,60,90],[60,80,50],[140,110,60],[80,40,70]][Math.floor(hs(Math.floor((c+s*7)/3),s,91)*5)]; },
      window:(c,r)=>c%22<3||r%26<3||c<4||r<4?[226,220,206]:[40,52,78], panel:(c,r)=>c%30<3||r%34<3?[46,30,20]:sh([64,44,30],.95+.1*hs(c>>3,r>>2,31)),
      portrait:(c,r,w,h)=>{ if(c<4||c>w-5||r<4||r>h-5)return [190,152,70]; const x=(c-w/2)/14, y=(r-h*.45)/18; return Math.hypot(x,(y-.35)*1.3)<.32?[220,190,160]:Math.abs(x)<.5&&y>-.1&&y<.2?[240,236,226]:Math.abs(x)<.75&&y<-.05?[120,26,30]:[28,24,22]; },
      clock:(c,r,w,h)=>Math.hypot(c-w/2,r-h+12)<8?(Math.hypot(c-w/2,r-h+12)<7?[226,218,190]:[190,152,70]):r>h*.2&&r<h*.6&&c>3&&c<w-4?[30,22,16]:[46,30,20],
      rug:(c,r,w,h)=>c<6||c>w-7||r<6||r>h-7?[176,140,70]:((c>>3)+(r>>3))&1?[110,34,36]:[44,52,92]};
    const SETM={}; for(const [name,list] of Object.entries(P.SETS)){ if(name==='fog')continue; BATCH.tag=OBJ('store:playhouse','scenery');
      for(const [x,y,parts] of list)for(const [a0,b0,z0,a1,b1,z1,c,e] of parts){ const col=e===1?lit(c):c, pat=typeof e==='string'?PAT[e]:null, X0=mx(x+a1), X1=mx(x+a0), Y0=my(y+b1), Y1=my(y+b0), Z0=P.PLS.SZ+z0*24, Z1=P.PLS.SZ+z1*24, w=(X1-X0)*24, h=Z1-Z0;
        gbox({x0:X0,x1:X1,y0:Y0,y1:Y1,z0:Z0,z1:Z1,c:col,em:e===1?1:0,top:e==='rug'?(X_,Y_)=>pat((X_-X0)*24|0,(Y_-Y0)*24|0,w,(Y1-Y0)*24):()=>col,fs:(nx,ny,X_,Y_,z,k)=>e===1?col:pat&&ny>0?sh(pat((X_-X0)*24|0,z|0,w,h),k):sh(col,k)},'Pset:'+name); } }
    BATCH.tag=null;
    const fogT=(()=>{ const cv=document.createElement('canvas'); cv.width=96; cv.height=12; const g=cv.getContext('2d'), im=g.createImageData(96,12), B4=[0,8,2,10,12,4,14,6];
      for(let j=0;j<12;j++)for(let i=0;i<96;i++){ const v=(Math.sin(i*.21)+Math.sin(i*.07+2)+Math.sin(i*.43+j))*.25+.55-j/14, a=v*16>B4[(i&3)+((j&1)<<2)]+2?150:0, o=(j*96+i)*4; im.data[o]=180; im.data[o+1]=194; im.data[o+2]=210; im.data[o+3]=a; }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.wrapS=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const fog=[0,1,2].map(i=>{ const t=fogT.clone(); t.needsUpdate=true; const m=new THREE.Mesh(new THREE.PlaneGeometry(X(P.PLS.PRX1)-X(P.PLS.PRX0),Y(40)-Y(0)),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));
      m.position.set(X(cx),Y(P.PLS.SZ+20),Z(my(P.PLS.CY+.9+i*1.4))); m.visible=false; scene.add(m); return m; });
    const rig=()=>{ '@later'; const S=P.PLS, H=B.h, g=new THREE.Group(), V=(x,y,z)=>new THREE.Vector3(X(x),Y(z),Z(y)), col=(r,g_,b)=>new THREE.Color().setRGB(r/255,g_/255,b/255,THREE.SRGBColorSpace);
      const drape=(yw,s,x0,x1,z0,gaps,nz)=>{ const pts=[], cs=[], tri=(a,b,c,k)=>{ for(const q of [a,b,c]){ pts.push(q.x,q.y,q.z); cs.push(k.r,k.g,k.b); } }, quad=(a,b,c,d,k)=>{ tri(a,b,c,k); tri(a,c,d,k); };
        const A=col(124,20,36), Bc=col(84,10,24), Rv=col(110,16,30), Gd=col(196,156,70), p=.36, zt=H-28;
        let x=x0, k=0; while(x<x1-.01){ const xn=Math.min(x1,x+p/2), m=(x+xn)/2; if(!gaps.some(([a,b])=>m>a&&m<b)){ const d0=k%2?.2:.04, d1=k%2?.04:.2, f0=k%2?.3:.06, f1=k%2?.06:.3;
          quad(V(x,yw+s*f0,z0),V(xn,yw+s*f1,z0),V(xn,yw+s*d1,zt),V(x,yw+s*d0,zt),k%2?Bc:A); } x=xn; k++; }
        const box=(xa,xb,ya,yb,za,zb,c)=>{ const p8=[[xa,ya],[xb,ya],[xb,yb],[xa,yb]]; for(let i=0;i<4;i++){ const [u0,v0]=p8[i], [u1,v1]=p8[(i+1)%4]; quad(V(u0,v0,za),V(u1,v1,za),V(u1,v1,zb),V(u0,v0,zb),c); } quad(V(xa,ya,za),V(xb,ya,za),V(xb,yb,za),V(xa,yb,za),c); };
        const ya=yw, yb=yw+s*.34; box(x0,x1,Math.min(ya,yb),Math.max(ya,yb),zt-6,H-4,Rv); box(x0,x1,Math.min(ya,yb+s*.02),Math.max(ya,yb+s*.02),zt-6,zt-3,Gd);
        const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); ge.setAttribute('color',new THREE.Float32BufferAttribute(cs,3)); ge.computeVertexNormals();
        const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), me=new THREE.Mesh(ge,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[pl]})); me.receiveShadow=true; g.add(me);
        cutWalls.push({pl,nx:0,nz,foot:Y(8),me,when:()=>R.inside(pos.x,pos.z)}); return pts.length/9; };
      const t0=drape(B.y0+.1,1,B.x0+.1,B.x1-.1,S.SZ,[],1)+drape(B.y1-.1,-1,B.x0+.1,B.x1-.1,0,[[cx-.95,cx+.95]],-1);
      const pc=[mx(S.SPOT[0]),my(S.SPOT[1])], fy=my(S.SY-1.2), fz=H-22, F=V(cx,fy,fz), Q=V(pc[0],pc[1],S.SZ), dir=Q.clone().sub(F).normalize(), up=new THREE.Vector3(0,1,0), dk=new THREE.MeshLambertMaterial({color:0x221e1c});
      const pipe=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(B.x1-.1)-X(B.x0+.1)),Y(3)-Y(0),Math.abs(Z(.1)-Z(0))),dk); pipe.position.copy(V(cx,fy-.25,H-12)); g.add(pipe);
      const hang=new THREE.Mesh(new THREE.BoxGeometry(Y(2)-Y(0),Y(10)-Y(0),Y(2)-Y(0)),dk); hang.position.copy(V(cx,fy-.25,H-17)); g.add(hang);
      const L=Y(22)-Y(0), can=new THREE.Mesh(new THREE.CylinderGeometry(Y(7)-Y(0),Y(5.5)-Y(0),L,8),dk); can.quaternion.setFromUnitVectors(up,dir); can.position.copy(F).addScaledVector(dir,-L/2); g.add(can);
      const lens=new THREE.Mesh(new THREE.CircleGeometry(Y(6)-Y(0),8),new THREE.MeshBasicMaterial({color:0xfff0c8})); lens.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir); lens.position.copy(F).addScaledVector(dir,.002); g.add(lens);
      const add=(o,a)=>new THREE.MeshBasicMaterial({color:new THREE.Color(1,.9,.66),transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending,side:a?THREE.DoubleSide:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2});
      const ring=(r,z)=>{ const o=[]; for(let i=0;i<=20;i++){ const a=i/20*Math.PI*2; o.push(V(pc[0]+Math.cos(a)*r,pc[1]+Math.sin(a)*r,z)); } return o; };
      const fan=(c,rg)=>{ const a=[]; for(let i=0;i<20;i++)a.push(c.x,c.y,c.z,rg[i+1].x,rg[i+1].y,rg[i+1].z,rg[i].x,rg[i].y,rg[i].z); const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(a,3)); return ge; };
      const r0=S.SPOT[2], beam=new THREE.Mesh(fan(F,ring(r0,S.SZ+.3)),add(.07,1)), pool=new THREE.Mesh(fan(V(pc[0],pc[1],S.SZ+.3),ring(r0,S.SZ+.3)),add(.2)), core=new THREE.Mesh(fan(V(pc[0],pc[1],S.SZ+.4),ring(r0*.62,S.SZ+.4)),add(.16));
      for(const m of [pool,core])m.renderOrder=2; beam.renderOrder=3; g.add(beam,pool,core); scene.add(g); MS.play.spot=[beam,pool,core];
      MS.play.rigN=t0; };
    unplace('PLAYHOUSE'); MS.play={R,P,B,cx,cy,mx,my,L,SETM,fog,SH:{t0:null,cue:null,set:null,lv:-1,from:null,to:null,tc:0,step:-1,last:-1,cap:''},FIG:{},hound:null,up:0}; { const I=STORE.inside.playhouse; if(I){ const go=I.go; I.go=()=>{ go(); rig(); }; } else rig(); } });


  STEPS.push(()=>{ const V=new THREE.Vector3(), MAT={}, mat=c=>MAT[c]||(MAT[c]=new THREE.MeshLambertMaterial({color:new THREE.Color(c)}));
    const KINDS={holmes:'hero_m',watson:'villager_m',mortimer:'villager_m',henry:'hero_m',stapleton:'hero_m',barrymore:'villager_m'}, CLIP={wave:'cheer_idle_a',crouch:'sit_floor_idle_a',fall:'sit_floor_idle_a',block:'found_item_idle_a'};
    const HAT={top:[.1,.065,.12],bowler:[.095,.065,.06],deerstalker:[.085,.066,.065],wide:[.125,.066,.05],straw:[.115,.068,.035]}, rgb=h=>{ const v=parseInt(h.slice(1),16); return [v>>16&255,v>>8&255,v&255]; };
    const dress=(N,L)=>N.g.traverse(m=>{ const g=m.isMesh&&m.geometry; if(!g||!g.attributes.reg)return; const c=g.attributes.color.array, R=g.attributes.reg.array, P=g.attributes.position.array, n=R.length, S={}; let y0=1e9, y1=-1e9;
      for(let i=0;i<n;i++){ const y=P[i*3+1]; y0=Math.min(y0,y); y1=Math.max(y1,y); const s=S[R[i]]||(S[R[i]]=[0,0,0,0,0]); s[0]+=c[i*3]; s[1]+=c[i*3+1]; s[2]+=c[i*3+2]; s[3]+=y; s[4]++; }
      for(const r in S){ const s=S[r], a=s[0]/s[4], b=s[1]/s[4], d=s[2]/s[4], h=(s[3]/s[4]-y0)/(y1-y0); s.l=a*.3+b*.59+d*.11; s.k=a>107&&a>b&&b>d&&a-d>30&&b/a>.55&&b/a<.92?null:h<.1?'shoes':h<.45?'pants':h>.8?'hair':'shirt'; }
      for(let i=0;i<n;i++){ const s=S[R[i]]; if(!s.k)continue; const q=rgb(L[s.k]), f=.65+.35*Math.min(1.6,(c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11)/(s.l||1)); for(let j=0;j<3;j++)c[i*3+j]=Math.min(255,q[j]*f); }
      g.attributes.color.needsUpdate=true; });
    const hold={free:()=>true,roam:false,brain:(dt,you,st)=>{ st.to=null; st.hold=true; }};
    const mkFig=(w,M)=>{ '@later'; const C=PY.PLAY.cast[w], N=window.PAWNNEW&&PAWNNEW(KINDS[w],'play_'+w,{npc:{...hold,x:X(M.cx),z:Z(M.cy),ground:()=>Y(M.P.PLS.SZ)}}); if(!N)return null;
      dress(N,C.look); N.walker={talk:true}; let head=null; N.g.traverse(b=>{ if(b.isBone&&b.name==='DEF_head')head=b; });
      const h=HAT[C.hat], H=N.H||TILE*2.4, hat=new THREE.Group(); if(h){ const m=mat(C.hatC); hat.add(new THREE.Mesh(new THREE.CylinderGeometry(h[0]*H,h[0]*H,.012*H,12),m),new THREE.Mesh(new THREE.CylinderGeometry(h[1]*H*(C.hat==='bowler'?.85:1),h[1]*H,h[2]*H,12).translate(0,h[2]*H/2,0),m)); hat.traverse(o=>o.castShadow=true); }
      hat.visible=false; scene.add(hat); return {N,head,hat,H,hd:null}; };
    const mkHound=M=>{ '@later'; const N=window.CREATNEW&&CREATNEW('Rat','hound',.8,{paint:g=>{ const c=g.attributes.color.array, R=g.attributes.reg.array; for(let i=0;i<R.length;i++)for(let j=0;j<3;j++)c[i*3+j]=R[i]?[150,230,100][j]:Math.min(255,c[i*3+j]*.16+8); return g; },
      npc:{...hold,x:X(M.cx),z:Z(M.cy),eye:1,eyeC:'.7,1.,.45',ground:()=>Y(M.P.PLS.SZ+(M.up||0))}}); if(N)N.g.visible=false; return N; };
    const cap=document.createElement('div'); cap.id='plcap'; cap.style.cssText='position:fixed;left:50%;bottom:9%;transform:translateX(-50%);max-width:min(70ch,90vw);padding:6px 12px;background:rgba(8,6,10,.78);color:#f0e4c4;font:14px/1.4 monospace;letter-spacing:1px;text-align:center;pointer-events:none;z-index:40;display:none'; document.body.appendChild(cap);
    const SFXK={knock:'door',door:'creak',howlfar:'bark',howlnear:'bark',snarl:'bark',paws:'step',mire:'drip',splash:'drip',owl:'chirp',sting:'boom',bell:'latch'};
    const recOf=l=>{ const x=X(l.x), y=Y(l.z), z=Z(l.y); return LITE.recs.find(L=>Math.abs(L.position.x-x)+Math.abs(L.position.y-y)+Math.abs(L.position.z-z)<1e-3)||null; };
    const cue=(M,cu,set,lv,now)=>{ '@later'; const S=M.SH, C=PY.PLCUE;
      if(cu!==S.cue||set!==S.set||lv!==S.lv){ const fade=cu!==S.cue||set!==S.set; S.from=fade?S.to:null; S.cue=cu; S.set=set; S.lv=lv; S.tc=now; S.step=-1; S.to={};
        for(const k of ['house','lobby','wall','candle','prac']){ const c=C[cu][k]||[0,0,0], m=k==='candle'?.15+.85*lv:k==='prac'?lv:1; S.to[k]=k==='prac'&&!M.P.PLPRAC[set]?[0,0,0]:c.map(v=>v*m); }
        const p=M.P.PLPRAC[set]; if(p)for(const e of M.L)if(e[0]==='prac'&&e[2])e[2].position.set(X(M.mx(p[0])),Y(p[2]),Z(M.my(p[1]))); }
      const k=Math.min(1,(now-S.tc)/1500), step=S.from?Math.round(k*5):5; if(step===S.step)return; S.step=step;
      for(const [g,l,L] of M.L){ if(g==='front'||!L)continue; const a=S.from&&S.from[g]||S.to[g], b=S.to[g], c=a.map((v,i)=>v+(b[i]-v)*step/5), cm=Math.max(...c); if(cm>0)L.color.setRGB(c[0]/cm,c[1]/cm,c[2]/cm); L.intensity=cm>0?7*cm*Math.min(1.2,l.r/5):0; } };
    const show=(dt,now)=>{ const M=MS.play; if(!M||!M.P)return; const {R,P,SH}=M, inside=SHARED.LVL==='up'&&R.inside(pos.x,pos.z), LL=PY.PLL;
      if(M.spot)for(const m of M.spot)m.visible=inside;
      if(!M.SETM.baker&&STORE.meshes&&BATCH.all(STORE.meshes,'Pset:baker').length)for(const n of ['baker','hall','moor'])M.SETM[n]=BATCH.all(STORE.meshes,'Pset:'+n);
      for(const e of M.L)if(!e[2])e[2]=recOf(e[1]);
      if(inside&&USE.seat&&!(SH.t0!=null&&(now-SH.t0)/1000<LL))SH.t0=now;
      const t=window.PLAYAT!=null?+window.PLAYAT:SH.t0!=null&&(now-SH.t0)/1000<LL?(now-SH.t0)/1000:-1, st=P.plState(t);
      const sets=n=>{ for(const k in M.SETM)for(const me of M.SETM[k])me.visible=k===(n==='fog'?'moor':n); };
      { sets('baker'); for(const f of Object.values(M.FIG))if(f){ f.N.g.visible=false; f.hat.visible=false; } if(M.hound)M.hound.g.visible=false; for(const f of M.fog)f.visible=false; cap.style.display='none'; SH.last=-1; return; }
      cue(M,st.lt,st.set,st.si===-1?1:Math.round(st.c*4)/4,now); sets(st.set);
      const TR=st.si>=0?P.PLTR[st.si]:st.si===-2?P.PLCALL:null, seen=new Set();
      if(TR&&st.c>0)for(const [w,a] of Object.entries(TR.A)){ const p=P.plPlayer(a,t,TR); if(!p)continue; const F=w in M.FIG?M.FIG[w]:(M.FIG[w]=mkFig(w,M)); if(!F)continue; seen.add(w);
        const N=F.N, want=Math.atan2(-p.dir[0],-p.dir[1]); if(F.hd==null)F.hd=want; let dd=want-F.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); F.hd+=Math.max(-3*Math.PI*dt,Math.min(3*Math.PI*dt,dd));
        N.st.x=X(M.mx(p.x)); N.st.z=Z(M.my(p.y)); N.st.h=F.hd; N.g.position.set(N.st.x,Y(P.PLS.SZ),N.st.z); N.g.rotation.y=F.hd; N.g.visible=true;
        let act=null; for(const [ta,mv] of a.acts)if(ta<=t&&t<ta+(mv==='crouch'?2.4:mv==='fall'?2:1.2))act=mv; const talk=a.talk.some(([t0,t1])=>t>=t0&&t<t1);
        N.dwell=p.walking?'UAL_Walk_Formal_Loop':act?CLIP[act]:talk?'UAL_Idle_Talking_Loop':'UAL_Idle_Loop';
        if(F.head&&F.hat.children.length){ F.head.getWorldPosition(V); F.hat.position.set(V.x,V.y+F.H*.1,V.z); F.hat.rotation.y=N.g.rotation.y; F.hat.visible=act!=='fall'&&act!=='crouch'; } }
      for(const [w,F] of Object.entries(M.FIG))if(F&&!seen.has(w)){ F.N.g.visible=false; F.hat.visible=false; }
      const ht=TR&&TR.H.length?P.plHoundAt(TR.H,t):null; if(ht&&M.hound===null)M.hound=mkHound(M)||0;
      if(M.hound){ const N=M.hound; N.g.visible=!!ht; if(ht){ M.up=ht.up*24; N.st.x=X(M.mx(ht.x)); N.st.z=Z(M.my(ht.y)); N.st.h=Math.atan2(-Math.cos(ht.a),-Math.sin(ht.a)); N.g.position.set(N.st.x,Y(P.PLS.SZ+M.up),N.st.z); N.g.rotation.y=N.st.h; N.clip=ht.run?'Rat_Run':'Rat_Idle'; } }
      M.fog.forEach((f,i)=>{ f.visible=st.set==='fog'&&st.si>=0; if(f.visible){ f.material.map.offset.x=(t*.012*(i%2?-1:1)+i*.3)%1; f.material.opacity=Math.min(1,(t-PY.PLAYT.scenes[3].S)/14); } });
      let line=''; if(t>=0)for(const [t0,d,si,bi] of PY.PLAYT.lines)if(t>=t0&&t<t0+d){ const b=PY.PLAY.scenes[si].beats[bi]; line=PY.PLAY.cast[b.w].name.toUpperCase()+': '+b.s.replace(/\[[^\]]*\]\s*/g,''); }
````
