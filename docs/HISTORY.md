# The Strangest Flea Market in 3D (three.js): start here

A separate project from the game: the owner (Bralynn) is building **a new version of The Strangest Flea Market in three.js**, one
piece at a time. It is **not** the live game and never ships to it. The live game is the repo `bralynnb/tsfm` (thestrangestfleamarket.com);
this repo is `bralynnb/thestrangest` (once `bralynnbell/thestrangest`, the owner's old GitHub name).

## The game's repo: data only, never the rules

- **Read the game's code as data only**: its objects' makers, their colours, sizes and layouts, the Walker's rig, the physics. That is why
  the build reads it (a checkout of `bralynnb/tsfm` beside this one, or `GAME_SRC`).
- **Don't use it when making decisions.** Treat the game's code, its CLAUDE.md, its rules, its DECISIONS.md and its ways of doing things as
  **old, outdated and bad unless the owner says otherwise.** Its rules (pixel-pinned, four angles, its engine's budgets, its review steps,
  its mail, its version numbers) do not apply here.
- **Do it the best three.js way** (owner: "i dont want you to copy the game engine in places that you could do a better job ... if there are
  better ways of doing thing in 3js just do that ... i trust you to build it like that"; "dont follow the pixel pinned rule or anything
  else that makes it more difficult"; "Don't copy how the other system does it just make it look the same. Use whatever method is smartest").

## The budget: render only what's needed (owner, 17 Oct 2026; read before adding anything)

The owner: "i want simple pixelated graphics so i dont want to render a bunch of needless stuff and not even use it. lets render what is only
absolutely needed at the most basic levels and i will tell you when to improve each. dont assume i want anything looking nice. this is the best
graphics the game should ever look" (his screenshot: the pool room at night, dark, flat, chunky pixels). Every session keeps to these:

1. **His screenshot is the ceiling.** No glow or bloom, no soft shading, no screen effects, nothing "nicer" unless he asks for that one thing.
2. **Triangles: the whole screen under 100,000.** A model is made simpler at bake time, never drawn heavy: the same shapes with fewer, bigger
   faces, no holes (`tools/simplify.py`, the originals kept in `data/full/`). Characters: the head (the head bone and all under it) exactly as
   it is, the rest of the body to half ("leave the faces as complex as they are, change rest of body to medium"); things (plants, toys, trees,
   rocks, the kit, gear): the small marks that stand out in colour (eyes, noses, spots) kept, the plain rest to a third. The Walker and the
   guitarist (built in code, `walker3d.js`): the head, hair and eyes as they were, every other piece about half.
3. **Lights: at most 8 lamps light anything** (the nearest you); the rest only glow. **Shadows: the sun's and one lamp's at most.**
4. **Draw and run only what's near or seen**: other rooms not drawn; far characters neither drawn nor moved; the pool's water only steps near it.
5. **As few shader programs as possible**: what differs only by a number is a uniform, not a new program; shaders are compiled while the loading
   line shows.
6. **Never sharper than the opening** (`RESMAX`). The opening NORMAL (the art 1x the game's, `RESI` 2; owner, 17 Oct 2026: "1 less than it is now"), one step finer once zoomed in to 6 screen pixels a pixel (`ZUPX`: "when you zoom in to this level i want it to be this resolution", his picture, 1.5x); the menu's SHARP (1.5x) the ceiling (`RESMAX` 3).
7. **Load**: nothing fetched that isn't needed at start (Rapier only when the physics body is switched on); no data for things not in the game.
   **Never freeze the page while it loads** (17 Oct 2026, the artifact said "isn't responding": one 52 s freeze in the cloud's software
   graphics): the build puts a breath every 40 ms between the module's statements (`tools/yields.py`: plain blocks, if / for / while bodies and
   the places' builders, `grab`, now awaited); what isn't needed at the first moment is built after the game runs, a piece a moment (the rooms
   stacked on the apartments: `STORE.later`, `STORE.ensure` when you go to one first); a face is painted straight into an ImageData and the
   batch copies it into its atlas (no canvas a face); a Walker-built body samples only round each piece and works each shared corner once.
   Measure a change with a long-task observer (the longest freeze, the moment the loading line goes).
8. **At rest, at rest, like a 2D game** ("when something stops it doesnt keep moving slightly and gradually. lets have things rest in place more
   when they stop so not as much stuff is going on"): water goes flat and stops when nothing moves in it; floats and boats stop; he stands still
   the moment he stops; nothing creeps toward a target forever. Only the deliberate stays: characters' idle moves, a flame's flicker.
9. **The old game's look** (owner, 17 Oct 2026, "look at the actual old game code and see how it was done", "go all"; its recipe with its
   numbers: `docs/OLD-LOOK.md`): the world's faces their fixed shades by facing (top as it is, x0.62 / x0.8 by side), light multiplied in and cut to
   24 steps (`map-pre.js`); dark nights lit by the lamps; one final pass (`src/oldlook.js`): the night eye, the deep navy, and a glow in 8 hard
   steps (the one glow allowed, the owner's word). The pool clear turquoise, lit from inside. **No blur** (tried, then "remove all the blur work
   for now": not to come back unless he asks).
10. **Every new thing says its cost** (triangles, lights, milliseconds a frame) and fits the budget; if it can't, say so before adding it.

## What the owner has decided so far (keep these)

- **The game's own look**: its colours and patterns, drawn by the game's own painters (24 texels a tile). **No photo textures, shader packs,
  "realism" filters or looks** (owner, 16 Oct 2026: "lets stop the textures and shaders packs", "delete all of them"; "no shaders or textures").
- **Pixels grow with the zoom** (his pick): a tile is always the same number of pixels; zooming makes them bigger by whole screen pixels.
  `=` makes the art finer, up to one screen pixel each (`-` coarser).
  **Never sharper zoomed out** (17 Oct 2026, again with his picture: "no matter how far you zoom out"): zooming out, a pixel stops shrinking at
  the opening zoom's size (for the sharpness chosen) and takes in more of the world; only `=` makes the picture finer. **All the way in**: the
  zoom to 80 times, and past 8 screen pixels a pixel the art gets finer (each finger close up).
- **Free rotation and tilt, any zoom** (the tilt from straight down to level, never under the ground); shadows (the SHADOWS menu: on, shaded, self, full).
- **The 3D Walker** (the game's rig, his pieces as one mesh, one hand a piece, no fingers unless close up), his moves, ragdoll, physics.
- **His characters from his models** (Meshy AI .glb): the goldfish in his raincoat and the bear in his jacket. Cut to a few thousand
  triangles, coloured face by face, soft tone shading like the Walker's, **no outlines on them** ("fish shouldnt have lines").
  **The clothes' shadows** (17 Oct 2026, his pick C, a little darker): each layer shades the one under it (coat on shirt, shirt on him, the
  hood on the fish's face), two steps, baked once at load (`rank` in `npc-map.js`).
- **Real water only** in the pool (a simulated surface, swimming, floats).
- **Loading** (17 Oct 2026: "loading should always say"): while the page loads, only the line "I took a trip to The Strangest Flea Market..." (no help panel or shadows box for that moment).
- **The street cleared** (17 Oct 2026: "remove the awning and coffee sign from bodega, remove trash can and all street items ... all will be replaced"): no awning, no COFFEE sign, no ice box, papers, crates, standpipe or street light (`STREET` in `bodega.js` stays, empty, for what replaces them).
- **Sizes** (17 Oct 2026): the skeletons half their size; the Walker a fifth bigger (`W3.SZ`, his physics body and reach with him); the buildings (the bodega, the pool room) a tenth bigger every way from the middle of their fronts (`BLDK`: `BOD.X/Y/Z` the building, `BOD.XS/YS/ZS` the street as it was); doors 1.3 times (1.56 wide, 94 px high).
- **The blue day and the weather** (owner, 17 Oct 2026: "make the sky blue, add cumulus clouds, real sun that effects the brightness level (only
  source of light during day besides others on map)"; "put the clouds lower, bring in weather system from old game, only essential, not (temp,
  humidity, etc)"; "go"): the day's sky blue (pale at dawn, deep at noon; sunset, the blue hour and night as before), the sun the day's only light
  (the shade lit by lamps alone; `?sky=1` a little sky fill, `?sky=0` the old dim day: `clock.js`). `src/weather.js`: the old game's simulation
  (41-weather.js's sums, the same for everyone by the calendar day and the hour), only what shows: CLOUD (forty low-poly cumulus round the map
  toward the horizon, as many shown as the sky's cloud, greyer in rain; the sky greys, the sun dims), RAIN (streaks round you, slanting with the
  wind), a STORM (a darker sky, lightning flashes), SNOW (in a cold spell), FOG (the sky and the far going grey), WIND (the clouds' drift, the
  rain's slant, the oaks' sway: `PARK.windK`). Nothing falls indoors or underground. The menu's WEATHER (DISPLAY): NATURAL, or one held (CLEAR,
  CLOUDY, RAIN, STORM, SNOW, FOG); `?wx=rain` for a test. Cost: one draw for the clouds (some 20,000 triangles at most, far off), one for rain,
  one for snow; no new lights. Not yet: wet ground, snow lying.
- **The clock** (17 Oct 2026, `src/clock.js`): the hour, noon when the game opens (owner, 17 Oct 2026: "day always starts at noon"; 7pm before); the sun over New York in mid-October (its height, its way round, its shadows), the sky and the open air's light by it, the moon at night; DISPLAY's TIME (the hour, STOPPED / RUNNING, a day in 2 min to 24 h); N noon / 7pm.
- **The guards** (17 Oct 2026: "patrol the streets as guards and really protect us"; his picks: patrol routes, fight threats; `src/npc-skel.js`): each skeleton marches his beat (the Warrior the shops' sidewalk, the Rogue the far one, the Mage and the Minion the road), on guard at each end. **Troublemakers** (small hooded figures: the Rogue gone dark, red eyes) come up the subway stairs after dark, one or two now and then, and go for you on the street (a punch shoves you back, no harm); every guard near comes running and fights his own way (blade, fists, crossbow bolt, spell), the troublemaker falls, gets up and runs back down; a cheer, and back to the beat. The pack's own combat clips (KayKit Skeletons 1.0 on GitHub, CC0: `tools/skeletons-clips.py`).
- **The apartment building** (17 Oct 2026, his plan from a mockup, "a fifth bigger"; `src/pool.js`, `POOLR` in `map-pre.js`): the pool room's building made the apartments' ground floor, 27.3 x 16.8 tiles: the right third the lobby (the front door) and the office behind it; the left two thirds a hallway through the middle to the stairs and the lift at its far end, the pool in front of it (across, left to right, all one depth, deep, a small diving board at its west end), the gym behind it. Inner walls cut to their foot while you're inside (`always` cut walls). The roof meets the walls' tops.
- **The land** (17 Oct 2026): flat grass all round the map (`MODS.land` in `map-post.js`), open over the road, the stairs and the pool's basin. **How far out**: the zoom stops at some 19 tiles across (`UI.MAXW`; 34 till 18 Oct 2026, his third picture: "make this 3rd pic the max zoom out level"), and the view can't slide far past the map's edges. **Never under the ground**: the tilt stops level with the street.
- **The musician's arm** (17 Oct 2026, "his elbow is lifted unnatural"; again, "fix the guitarist arm"): the game's guitar sat high on his chest, so
  the strumming forearm could only cross it from an upper arm held out level (measured: the elbow at his shoulder's height, 7 of his units ahead).
  Now the guitar hangs lower on its strap, the neck up a little more, the right wrist over the lower bout's upper edge, the elbow down by his side
  (5.7 under the shoulder, 4 ahead, 2 out), his fingertips as near their notes as before (`MUS.hold` in `musician.js`, `GTWR`; `tests/gthold.cjs`).
- **Ghost Street** (17 Oct 2026, "bring in ghost street from old map"): the old game's own makers of the kit's wooden shop (`23-w-ghost-street.js`, read by build.py, in a block of its own), "Preset Ghost Street 1" without the row houses and the pole: the shop, its upper floor, the tiled roof, the eave with its sign and cooler, the bay window, the door curtain, the drinks machine, the planted beds and lanterns; east of the apartment building, its front and paved forecourt to the street (`GHOSTST` in `bodega.js`). Its ghosts: the four sheet ghosts (below, 18 Oct 2026).
- **The Dragon, calm** (17 Oct 2026: "flying around, and perching on the ledges of buildings. calm"; `src/npc-dragon.js`): he sits a long while on a building's front ledge (the apartment house's, the bodega's, the apartment building's), then lifts off and glides in slow banking turns over the roofs, then settles on another ledge; he snaps at no one.
- **The apartment house emptied** (17 Oct 2026: "empty out the new building completely of furniture and stairs and items. only leave the building doors and fire escapes"; `src/apts.js`): no furniture, no flights of stairs, nothing on its walls or roof, no stoop; its walls, floors, windows, doors, fire escapes and the rooms' ceiling lights stay.
- **Only the room you're in** (17 Oct 2026, `src/rooms.js`): inside a building only your room is drawn (six clip planes round it for every material), the rest black, the characters outside it hidden; the pool's water too.
- **The neon's glow** (17 Oct 2026: "still a blur and vanishes from certain angles"): a halo in the world (square pixels, three steps, dithered, facing you, added over what's behind), not the screen's bloom; the bloom (GLOW) off unless chosen.
- **Overhead lights** (17 Oct 2026: "dont show over head lights in any view unless looking up at them"): the bodega's tubes, the apartment building's ceiling panels shown only with the camera under them (`OVERHEAD`).
- **The views** (17 Oct 2026, Display's VIEW): MAP VIEW (the free one), ISOMETRIC (eight angles, an eighth turn at a time: drag, Q / E or R; the tilt fixed), THIRD PERSON (behind him, the wheel in and out, never under three feet), FIRST PERSON (his eyes). The tilt in the map view never under ten degrees ("cant go completely horizontal").
- **Your looks** (17 Oct 2026, `src/looks.js`: a double click on yourself, or Display's YOUR LOOKS): name; MALE / FEMALE (HIS SHAPE's bodies); five hairstyles (short, buzz, long, bun, bald) and five beards (full, short, goatee, moustache, none), made once in `walker3d.js` and folded away when not worn (`W3.HIDE`); five colours each for skin, hair, eyes, shirt, trousers, shoes; his face (eyes, brows, a mouth line); his fingers, one piece each. **His shading**: steps of light on him 2-5 and the shadows' depth (sliders here and in Display), SELF on him when lamp-lit.
- **Health and stamina** (17 Oct 2026, `src/vitals.js`; `hp`, `sta` on every character): running spends stamina, at none no running till a third is back; blows cost health, at none you faint (down as a body, up again with some back). Two small bars bottom left only while not full.
- **The dragons** (17 Oct 2026: "all green (4 shades) and 20% as big ... flying all around city and mostly park. add 10 of them. they breath large fire balls"; `src/npc-dragon.js`): ten, a fifth the size, four greens; flying mostly over the green round the street, now and then down on a ledge; now and then a fireball down ahead (glowing, lighting the ground from a pool of two lights, sparks, a burst where it lands; it hurts).
- **No beards, no buzz cut** (17 Oct 2026: "remove the beard and buzzcut from game completely"): no beard piece on any Walker (him, the musician); hairstyles short, long, bun, ponytail, bald. **A nose** on every Walker's head ("give all playable characters noses"). **Looking about** when he stands still. **His build**: hips a little narrower, a touch fuller (+5 lb) as default sizes. **His feet**: a darker sole. **His own shadow** from the light really on him (the sun, or the nearest lamp), a finer map; four steps of light by default.
- **The start and V** (owner, 17 Oct 2026: "start the game always in this view 1st", then BEHIND, then FIRST PERSON, "each time you press v it
  changes"): the game opens in ISOMETRIC every time; V cycles isometric, behind, first person (map and third person in DISPLAY's VIEW). **In
  isometric** ("left click to drag your screen around, not your angle, q,e will rotate your angle back and forth, only between 4 isometric
  angles"): a left drag slides the screen; Q / E (and R) turn it a quarter onto its four diagonal angles; a drag never turns it.
- **GRAPHICS** (owner, 17 Oct 2026: "add resolution and other graphics settings into menu"; a tab of its own in the menu, `ui.js`): RESOLUTION
  (COARSEST, COARSE, NORMAL, SHARP: the art 0.5, 0.75, 1, 1.5 times the game's), SHADOWS, GLOW AND NIGHT LOOK (oldlook.js's pass, on or off),
  LIGHT ON THEM, OUTLINE, SHADE STEPS and SHADOW DEPTH.
- **V changes the view** (map, third person, first person, isometric); the wave is on B. (Superseded: V now cycles isometric, behind, first.) **The dragons** darker green, a third the speed, longer in the air and on the ledges, beating then gliding (wings held at their widest), nose up climbing, head into a turn, tail trailing; a faint glow at night.
- **Every character shaded as you are** (owner, 17 Oct 2026: "make sure all chars have same shadowing as main player"): the same steps of light
  and depth (`W3.GP`, YOUR LOOKS' STEPS and DEPTH, for everyone), the same little light of their own, and each one's own shadow on himself
  (SELF, his own shadow map, `N.sm`; not the ten dragons, small and many) by the same amount as yours (`W3.uSelf`); the musician the same steps.
- **Eyes and bodies** (owner, 17 Oct 2026, of the mockups: "use all"): YOUR LOOKS' EYES, six styles (dots, whites, big with a glint,
  half-lidded, lashes, smiling arcs; `eyes0`-`eyes5` in `walker3d.js`, folded away when not chosen); its BODY (`BUILDS` in `looks.js`, his pieces'
  sizes and his height `W3.BH`): **two only** (owner, 17 Oct 2026: "make female slim the only female avatar option, and him as the only male
  option, make the males hips 10% smaller"): MALE (him, hips a tenth narrower) and FEMALE (the slim one); the eight builds before are gone.
- **17 Oct 2026, the evening's asks**: **the park** (`park.js`): an all-green lawn with sprouts and weeds (noise-cut greens, dithered); two straight
  ways 7.2 tiles wide, one from the gate to the back, one end to end, crossing at the round in the park's middle (the gate moved along the wall to
  meet it); the trees further back, the biggest at the back, fewer, the undergrowth thinner; the lamps thin poles 7 tiles high with small
  lanterns along the ways; the plesiosaur skeleton removed ("remove the dinosaur bones from game"). **The ground locked to the pixels** (map and
  isometric views: the camera stands on the picture's pixel grid, so nothing flickers as you run). **Never finer than the opening** ("dont let
  the game get any higher res than this at any time, at any zoom level": `RESMAX`, and zoomed in the art's pixels only grow). **Lamplight in
  steps** (every lamp's light on the world falls off in hard steps, two a halving: `map-pre.js`). **His face**: eyes only (no brows, no mouth),
  round, a tenth smaller. **Standing still**, a look round every six to fourteen seconds. **Rooms** cut only once all of you is half a tile
  inside (nothing cut in a doorway). **BEHIND** (a view: the third person's camera kept at his back as he turns; V cycles map, third, behind,
  first, isometric); **R** turns the view a quarter onto the four isometric angles (the roll moved to Y).
- **Ghost Street, its dojo and its guards** (17 Oct 2026: "have all the samurai & shogun standing guard by the ghost street building in front of
  it. make the ghost street building 33% taller, with bigger door, and the inside should look like the dojo (from other map)"): the building a
  third taller (its roof made at the new height), a doorway two tiles wide and 100 px high, and inside the old West End dojo's hall from the
  game's own makers (`23-w-west-dojo-1-hall.js`, embedded by build.py): tatami in polished boards, shoji walls, round windows, the alcove, the
  sword rack, paper lanterns by the door, a candle in each corner (lit, flickering in steps, only while you're in), incense; its own room
  (`src/ghostdojo.js`). The six figures stand on guard in a line before its door, facing the street (`npc-figures.js`).
  **No dithering, nothing vanishing** ("dont dither anything when walking ... no dithering and vanishing anything"): the trees' cut round you
  gone; the park's big trees stand in the middle of its four lawns, clear of the ways, the tallest at the back.
- **No trees** (owner, 17 Oct 2026: "remove all the trees from game for now, i want to start clean - delete all trees from map and game files"): the forest pack's oaks, spruces and dead trees and the terrain collection's cedars are out of the park (`park.js`) and out of the data (`data/forest.json` and `data/full/forest.json` keep only the rocks; `props.json` has no cedars). The next trees are drawn fresh at his word (his picks from the mockups: smooth green hills, one tree about 10 m with branches, softer radial shadows).
- **The Moon Shrine opened** (owner, 17 Oct 2026: "steps and gap", the strict hitboxes having closed it): a gap in its east parapet (the middle
  piece left out) toward the park's round; the plaza, the steps and the terrace floors you stand on (`STORE.shrineGround`: the steps a slope up),
  the gate's two posts solid and the way under it open, the terrace's front beside the steps a drop (`STORE.shrineFix`, run after the hitboxes).
- **The castle and its dungeon** (owner, 17 Oct 2026: "lets bring back ... the castle, the dungeon under the castle (only 1 level)", "expand central park but the castle on the left back end"; `src/castle.js`, `CASTLE` in `map-pre.js`): the park twice as deep (`PARK.y1` -5); the old game's castle from its own makers (23-w-dungeon-3-castle-1-stone, -2-pieces, embedded by build.py word for word, `BOD.KC`; the gatehouse turned to stand out toward the street) in the park's back-left corner: the curtain wall between four drums, the gatehouse in its front, the bailey's grass, the gravel to the stairwell, its rim, the well. Under the bailey, at the subway's depth, one dungeon: the old castle's great hall (its walls and cobbles by 23-w-dungeon-1-room's painters, its things from 23-w-dungeon-2-things: the arcade, columns, brazier, barrels, crates, straw, bones, skulls), down twelve steps from the bailey (`CASTLE.stair`, the second stair in `STAIRS`, map-post.js); the torches' flames live ones (fire.js, below), the mice and the dust left out. The menu's PLACES has THE CASTLE and THE DUNGEON. **A fix found on the way**: the park's lawn painter was mirrored front to back (row 0 of a painted ground is y0, as gbox's tops are); the dojo's floor painter (`ghostdojo.js`) has the same mirror, untouched.
- **The park's grass everywhere** (owner, 17 Oct 2026: "i want the same grass in park to extend everywhere there isnt something else (instead of the brown green stuff"): the land round the map (`MODS.land`, map-post.js) is painted with the park's lawn painter (`PARK.lawn`: the all-green noise-cut lawn with its sprouts and weeds), no longer the game's grainy grass.
- **Every character built here is made in parts** (owner, 17 Oct 2026: "i always want to import them as different parts where possible. wings, hat,
  antennas, jacket, body, head, beard, hair, boots, hands, etc. so that i can reshape and change if needed"; `src/npc-parts.js`): a character made
  in code is a list of named parts (each a few plain shapes with its colour and its layer), packed into one mesh for `makeNPC` but each part kept
  apart so it can be reshaped or recoloured after (`N.reshape('hat',{scale,move})`, `N.recolour`, `RESHAPE(key,part,scale,move)` in the console).
  A character from a model file keeps its parts the same way (`names`, `reg`).
- **The moth man: deleted** (owner, 17 Oct 2026: "delete the moth man"; he had been built in parts from his sticker, rounded, in a shader-woven denim).
  What stays of him for the next: the parts builder's rounded shapes (capsules, shells, clumps) and the denim twill (`fab` on a part, `DENIM_GLSL` in
  `npc-map.js`), used by no one now.
- **The goldfish on the street** (owner, 17 Oct 2026: "bring in the raincoat fish"): up from the platform, walking the whole street as the others do (`npc-map.js`); the bear stays on the platform.
- **A stacked room's menu spot is just inside its door** (owner, 17 Oct 2026: "when i try to go to herb cottage i end up in the pool"): the spot outside the door has no floor up there (`lift` in `store.js`).
- **The vending machines before the dojo** (owner, 17 Oct 2026: "pull in vending machines with real depth from old game, put them in front of ghost
  street dojo"): the market lounge's two, white and dark red, from the game's own makers word for word (the lounge's kit, 23-w-y-market-lounge-2-bar,
  and the machine from -4-street, through build.py; `vending machine, white` and `, red` in the catalog): a cabinet of sides, back and top round a
  hollow, the window real glass over three lit shelves of cans (each can its own box, two rows deep), the button panel and buttons raised, the coin
  slot, the pickup flap a real dark hollow under a hanging flap, a lamp in the glass. In a row east of the dojo's door against its front with the
  kit's teal machine (west of the door the bay window juts out), their windows to the street, solid (`STREET` in `bodega.js`).
- **YOUR LOOKS tidied, the hair alive** (owner, 17 Oct 2026: "have all the colors for things to change in a dropdown not always on screen. add
  more levels of depth and steps to the scroll bar option. look through hairstyles from multiple angles and clean up, make more realistic, make
  sure they have real physics"): the six colour rows fold under a COLOURS dropdown (`looks.js`); SHADE STEPS 2 to 12 and SHADOW DEPTH .02 to .98
  in finer steps (`W3.setShade`, both panels). **The hair** (`walker3d.js`): the long hair a mane over the ears, narrowing as it falls, in locks,
  its ends uneven; the ponytail a full bundle from its knot, clear of the cap, a tuft at its end; the bun out where it shows, twisted. **Real
  physics**: the long hair's fall and the ponytail's tail are pieces hung from a pivot on the head and swung each frame as a pendulum in the
  world (`swing`: gravity, his motion through the pivot, the hair's stiffness back to its hang, drag; never past its most, into his back); a
  steady walk carries them along with no trail, a start, stop, turn or the bob of a step swings them; at rest they settle and stop. Looked at
  from four angles, walking and stopped: `tests/hairshot.cjs <out> 0,1,2,3,4`.
- **The mushroom seller** (owner, 17 Oct 2026, his picture: a felted skeleton in a mottled rust robe, long tan hair, a hat crowned with mushrooms,
  a rope strap and woven bag, a tray of mushrooms held out; "add this is a 3d character in the game"; `src/npc-mushroom.js`): built in code from plain
  shapes (no model file), one mesh of about 2,500 triangles, through `makeNPC` like the rest (lamp-lit, the clothes' shadows, SELF; his sockets, nose
  and teeth pure black, lit by nothing); he walks the whole street, rocking a little under his tray, and turns to you when you come near.
- **New characters walk the street** (owner, 17 Oct 2026: "put any new characters that go in the game into the street walking around"): every character added from now on goes onto THE MARKET's street, walking around (`NPCS`, as the skeletons and the goldfish and bear are), unless the owner places it somewhere else.
- **The view** (17 Oct 2026, `src/ui.js`): a left drag moves the map ("drag the map and change your focal point"), the point grabbed staying under the mouse; a right drag (or Shift / Alt + drag) turns round the point you grab, the wheel zooms toward the mouse, the tilt from straight down to level with the street, never under the ground (17 Oct 2026, "stop them at this angle"); the view keeps its place beside him as he walks; 0 (or RESET VIEW) puts it back on him.
- **Removed and not wanted for now**: the character editor (edit mode). (The Fox is back: below.)
- **The Fox, the bodega's merchant** (owner, 17 Oct 2026: "add the fox back as the bodega merchant"; `src/npc-fox.js`): the old game's Fox (its
  sprite, CHARS[1] in 10-characters.data) made 3D in his parts: a white fox's head with tall ears tan inside, an orange crown patch, the black
  mask and dark-red eyes under fierce brows, a black nose; a blue roll collar, a puffy orange jacket flecked blue and cream, navy gloves, wide
  cream trousers in folds; some 3,500 triangles. He stands on the mat behind the long counter (owner: "put behind counter, we need to avoid
  clipping": this shop's counter, not the game's spot, which was in a shelf), facing the aisle, turning toward you only 35 degrees (the space
  behind the counter is narrower than he is wide); he never wanders.
- **Free view and his eyes** (owner, 17 Oct 2026): in THIRD PERSON and BEHIND a drag looks round him freely ("if in 3rd person view, allow free
  view"), from under his chin to overhead; BEHIND swings back to his back only once he walks (`UI.look`). **Running any way** ("take off the limitation of running in directions when in 3rd person view"): sideways or back (S, A, D, the
  arrows) BEHIND's camera stays put, so he runs where you press instead of circling; it swings behind him only as he runs forward or walks somewhere. FIRST PERSON looks from his own eyes
  where his head is this moment (`W3.eyeAt`: "make sure 1st person view is angle from eyeview of actual avatar").
- **The mushroom seller white and taller** (owner, 17 Oct 2026: "the mushroom skeleton is white, and taller, and diff char" from the gold
  skeleton): his bones white, 2.2 m.
- **Getting around and the menu** (17 Oct 2026, `src/ui.js`): a free camera (C), drag with any button to turn round him (a click still walks; a double click puts the view back), fly through walls (G, Space up, Shift down); Escape opens the menu (MAP: each level from above, click to go there, the places; DISPLAY: sharpness, zoom, tilt, shadows, help and stats; KEYS: every control, changeable). Nothing stays on screen but the game: the help panel, the stats and the shadows box start hidden (the menu has them).
- **His shape and the outline** (17 Oct 2026, `src/editor.js`): the outline round the Walker is off unless turned on (Display); EDIT HIS SHAPE (Display) gives SIZES (each piece's length, width, thickness), SCULPT (push, pull, smooth, mirrored) and PIECES (move, scale, turn a piece); the skeleton never changes; kept in the browser, DOWNLOAD / LOAD as a file.
- **Stopping and clicking** (17 Oct 2026): he stops the moment you let go (the rig's snap, no sliding); a single click does nothing; a double click walks there, or on a thing (the `UI.thing` list: so far the goldfish and the bear, who get a wave) walks up to it and interacts.
- **Neon and glow** (17 Oct 2026): a neon sign is its letters as glowing tube blocks with depth (readable from any side), its light at the glass casting shadows (walls keep it in); every glow (bloom) is stepped and dithered in square blocks, never a soft haze.
- **Lights checked** (17 Oct 2026): every lamp tested against a copy where all cast shadows; only the subway stairs' two lamps leaked through a wall, now shadowed (drawn once). A lamp whose reach crosses a wall gets shadows.
- **Water on its own clock** (17 Oct 2026, it spiked after a jump in on the owner's machine): 180 steps a second whatever the frame rate, a little viscosity at the finest ripples, heights and speeds held to what water does, anything broken reset to calm.
- **The skeletons** (17 Oct 2026, "can you add these characters into game": Kay Lousberg's KayKit Skeletons 1.1, CC0): the Warrior, the Mage, the
  Minion and the Rogue walk the street (17 Oct 2026: "should be on street walking around"), anywhere on it, the sidewalks and the road, never into a wall, the stairs or the musician, armed as the pack arms them. The first rigged characters:
  each keeps the pack's bones and walks and idles with the pack's own clips (`tools/skeletons-bake.py` → `data/skel.json`, `src/npc-skel.js`);
  coloured from the pack's palette at each point (no texture), shaded as the fish and the bear are, eyes glowing. `makeNPC` (`npc-map.js`) now
  takes a level, a lane and a ground, and a rigged mesh, so any character can go anywhere on the map.
- **His body in a physics engine** (17 Oct 2026, `src/physbody.js`, owner's pick): Rapier (free, from jsDelivr) runs fifteen parts of the Walker joined at his joints; his moves are targets each part is pulled toward with give (LOOSE in Display), so he sways and settles, and falls as a body when he goes down; PHYSICS BODY ON/OFF in Display. Next: the moves he asked for (parkour, hand gestures, full dance routines, gymnastics, boxing, fighting, martial arts, ballet, wrestling, fishing, climbing, falling, meditate, everyday, athletic, water, social), fighting and gymnastics first on the rig's own; dance, ballet and wrestling want motion capture (CMU's free library is the candidate: ask the owner first).
- **His moves, editable** (17 Oct 2026, `src/animator.js`, his picks: all three): HIS SHAPE has MOVES (the walk's and the run's dials: step length and time, lean, bounce, arm swing, elbow, hip sway, twist, knee lift, stance width; the jump's: height, time in the air, crouch, landing, gravity; the strikes' speed) and ANIMATE (any move on a timeline; a part clicked and dragged, or its sliders, makes a key at that moment, added onto the move wherever he does it; mirror, copy and paste; NEW MOVE: a name, a length, a key (B I L M O P T U Y, 1-9), posed from standing). The rig's hook: `OVL.fn` in `pose()`. Kept in the browser, DOWNLOAD / LOAD MOVES.
- **Bodies** (17 Oct 2026, his pick: a switch, as the mockup): BODY in HIS SHAPE's SIZES: CURRENT, MALE (broader shoulders, chest, arms, neck; narrower hips), FEMALE (narrower shoulders and arms, wider hips and thighs, smaller hands and feet, longer hair, no beard); his proportions and skeleton kept; set as piece sizes (`BODIES` in `editor.js`), still editable after.
- **The avatars lit by the lamps** (17 Oct 2026: "they are same shade all time"): the Walker, the goldfish and the bear are lit by the scene's own lights in three hard steps (toon), walls' shadows on them; LIGHT ON THEM: LAMPS / FLAT in Display.
- **The glow, his pick** (17 Oct 2026: "the light looks like a bubble"): GLOW in Display: OFF, SOFT (the default, the smooth glow), STEPPED (the stepped one). The neon's stepped-glow rule above is now the STEPPED option.
- **The physics body keeps up** (17 Oct 2026, "my body behind my legs when i walk"): every part is handed his walk's speed, and pulled to its place, so only the give lags.
- **How far, how fast** (17 Oct 2026): a double click more than six units away, he runs, walking the last stretch; nearer, he walks.
- **Edit the world** (17 Oct 2026, `src/worldedit.js`): Shift+E; a double click picks a thing (every face is tagged with its thing as it's built: `BATCH.tag`, `OBJS` in `batch.js`; so far the shop's things and the station's benches, columns, signs, signals, train); move (drag, arrows, up/down), turn, size (all, width, height, depth), colour tint, see-through (dithered), delete, back as it was; (DESCRIBE A CHANGE, asking Claude through the artifact's `sample` capability: taken out, owner 18 Oct 2026, "delete".) Kept in the browser. Not yet: lamps and what he bumps into follow a moved thing.
- **Using things** (owner, 17 Oct 2026: "double click on things uses them or activates", his pick "common things first"; `src/use.js`): a double
  click on a thing of the world walks him up to it and it does what it's for (the first face along the ray: `BATCH.tag`'s things, a cut-away
  wall's faces not counted; the nearer of it and a character wins). Seats (the station's benches, the office chair, the diner's and the bar's
  stools, sofas and armchairs, the bus stop's bench, the park's sitting log): he sits (the rig's own sitting, `st.sit`; its back says which way
  he faces) till a move or a walk gets him up (the view's keys don't). Lamps (the park's lamps, lanterns, wall lights, the desk lamp, the
  tubes): off and on, the light (`L.userData.off`, LITE leaves it out) and the glow (its glowing faces dimmed: the batch's tint now on the
  glow too). The drinks fridges: the door swings open and shut (the diner's and the bar's their own door faces on their hinge; the bodega's,
  which the game gives glass but no leaf here, a framed glass leaf). Ghost Street's drinks machine: a can drops at its foot, a clunk, a blink.
  The bodega's radio: a little tune on and off, quieter as you go. No new lights; costs nothing while nothing moves. Not done: doors (the
  buildings have doorways, no leaves; the diner's doors are pictures on its wall), fire (candles, torches, the campfire, the brazier), the
  street kit's street light (no light in it), the neon signs, the TVs; an open fridge door doesn't block his way; the bodega's tubes are shown
  (so clickable) only from under them; the radio is small on the counter, a click on it often lands on the counter. Stopped short by
  something in the way but still near (`near` on a thing), it happens anyway. Sitting needed the rig to keep its own sitting pose (the walk
  laid itself over it: `swimming` in `pose()` now counts `st.sit`).
- **The glow's amount** (17 Oct 2026, "30% between off and glow"): the soft glow at 0.3 to begin with; AMOUNT slider beside GLOW.
- **Feature list**: `TODO.md` (the owner's asks for later: NPCs that talk with a real AI and ElevenLabs voices, their lines saved and reused).
- **The musician** (17 Oct 2026, `src/musician.js`): the game's guitarist brought over whole (build.py reads the game's 47-play-3-guitar-1-body, -samples.data, -2-tunes, -3-hands, and embeds `audio/guitar.mp3`; small stand-ins for the game's cast and sound): a second Walker with his finger bones, the classical guitar (its solid hull; the game's hollow one breaks up as a mesh), the book of tunes in turn, his hands solved onto every note with weight; on the stored bar's stage (owner, 17 Oct 2026: "move him to the bar"; `STORE.bar.gtr`), lit by the lamps; his recorded notes, louder as you near him, from his side, with the bar's echo (sound starts with your first click or key). A double click on him: the camera close on his hands (16 times in, the wheel closer still) with the SHARPEN bar (owner, 17 Oct 2026: "zoom in all the way and add a sharpen bar to adjust to the level i want": the art from coarsest to one screen pixel each, past the menu's ceiling here only, the level kept in the browser; C back, the sharpness as it was).
- **Never lost in the dark; no shadow acne** (17 Oct 2026): the lamp-lit avatars (the Walker, the musician, the fish, the bear, the skeletons) carry a little light of their own (a sixth of their colour), the lamps on top; every lamp's shadow held off the surface it falls on (normalBias), the two nearest lamps' shadows finer (1024).
- **The street's characters from his models: all deleted** (owner, 17 Oct 2026: "delete the phone head character, the cheetah and the catnewspaper
  characters from game completely"; then "delete ghost with bag inside and whatever this is"): the snow leopard, the grumpy cat and his ink bottle,
  the retro cyborg terminal, the plastic-bag ghost and his tote, the pixel pantry power-up; `src/npc-street.js` and their data gone. The tools that
  made them stay (`tools/skin-bake.py`, `skin-bones.py`, `item-bake.py`, `mesh-cut.py`: a furry model into a clean skin with bones) for the next.
- **The newest characters from the drive** (17 Oct 2026, "start pulling in any new characters you see in the drive"): **the six Mixamo-rigged
  figures** (DRIZZLE, GEKKOU, KASA, KURENAI, SAMIDALE, SHOGUN: .fbx in the G folder, turned to .glb with FBX2glTF; `tools/rigged-bake.py` keeps
  each one's own bones and skin in its rest frame (a SkinnedMesh bound makeNPC's way recomputes its inverses from the rest), every mesh in one
  bind frame, the smoke, holo rings and UI circles left out, a katana resting under his feet (no hand to hang from) left out; `data/<name>.json`;
  `src/npc-rigged.js`): they have no clips of their own, so the page poses their Mixamo bones itself (idle, walk, wave, jump, written in the
  figure's frame and turned into each bone's own; the arms brought down from the file's T- or A-pose), through `makeNPC` like the rest, lamp-lit,
  walking both sidewalks of the street. **The cyborg and the teddy: deleted** (owner, 17 Oct 2026: "remove the cyborg + black bear characters";
  `src/npc-street.js`, `data/cyborg.json`, `teddy.json` gone; the tools that made them stay). What follows is how they were: **The Meshy cyborg** (his right arm held out before him) and **the black teddy bear** with the glowing
  eyes: remade as clean skins and cut into bones like the ghost was (`tools/skin-bake.py`, `skin-bones.py`: the `cyborg` and `teddy` tables;
  `data/cyborg.json`, `teddy.json`), bipeds in `src/npc-street.js` (back, for them, with the kinds' moves and the Rapier bodies; the ghost and the
  items stay deleted). The voxel zips there (Star Marine Trooper, RedFighter, MicroRecon) are spaceships, not characters: left. A test's look at
  one: `node tests/townshot.cjs "npc:<key>&npcwait=99&hour=13" out -1` (the Walker a step beside him).
- **The street dressed, the Dragon, the apartment house** (17 Oct 2026: "start fleshing it out with our available assets to make it come to life. fill in
  everything automatically"; then "delete everything you added except for the new building, street lights, and trash can and bus stop"): THE KITS
  from his G folder (a city street kit, a restaurant kit: `tools/kit-bake.py` → `data/kit.json`, `src/kit.js`: a piece is its points coloured from
  its texture, lit by the lamps, `KIT.put` sets it on the ground, solid when it should be); of them on the street (`src/dress.js`): trash cans at
  the kerb, the bus stop with its bench, a street light. Taken out again at his word ("dont remove the dragon either"): dumpsters, bags, bollards, the
  traffic light, cones, hoardings, fences, barriers, his 1980s model, the pigeons, and the subway's New York repaint. THE DRAGON stays (his
  Dragon2.glb, rigged with its own clips, `data/dragon.json`, `src/npc-dragon.js`): he keeps the road with his menacing walk, snaps at you when
  you come close, flies a loop now and then. **The apartment house** (his words: "the apartment
  building from the last old tsfm repo ... fire escapes on back and front windows. 2 apartments per floor. real textures and nyc design, lived
  in"; `src/apts.js`, in the bodega's scope): the old game's walk-up (its plan and its studio furniture through the game's catalog) rebuilt as a
  five-storey New York tenement on the lot west of the subway stairs, in the owner's brick texture (`data/textures.json`: his jpgs shrunk to the
  game's texels, the one photo texture allowed because he asked for "real textures"), fire escapes front and back on every floor up, lit windows
  behind curtains, the door with its stoop, lamp and number, the roof's water tower, bulkhead, vents; inside, the entrance passage, the stair hall
  with a straight flight each floor (switching back), two furnished apartments a floor (railroad flats: the door into the kitchen, the living room
  across the windows, the bathroom, the bedroom), warm lights on while you're in; the floors above you and the roof cut away inside, the walls
  cut to their feet the bodega's way; the floor under you is yours (`MODS.apts.ground`, the stairs carry you up; the solids switch floor by floor).
- **The six figures: removed** (owner, 17 Oct 2026: "lets remove all the samurai characters"): KASA, GEKKOU, DRIZZEL, KURENAI, SAMIDALE and SHOGUN,
  their guard before Ghost Street, `src/npc-figures.js`, `src/npc-rigged.js` and their data gone; the effects they made (smoke, dust, a blade's
  trail) kept in `src/fx.js` for the campfire and what comes; the bake tools stay. What follows is how they were.
- **The six figures** (owner, 17 Oct 2026, "lets only do the new characters": the six low-poly figures in his Drive's G folder, KASA, GEKKOU, DRIZZEL,
  KURENAI, SAMIDALE, SHOGUN, each a .blend and a .fbx on a Mixamo rig, no clips, no textures; `tools/figures-bake.py` → `data/figures.json`,
  `src/npc-figures.js`): each keeps the pack's bones and weights and is posed by moves made here in his own axes (a stance, a walk, a run, a
  breath, a wave back, a hop, and his own thing: KASA's sword flourish, SAMIDALE's pipe, GEKKOU's and KURENAI's smoke, DRIZZEL's lean on his
  staff, SHOGUN's bow); his glowing parts (a visor, a blade, a halo, an ember) glow. They walk the whole street. **The effects** (owner: "use the
  sfx as references to make your own rendered fx", his Brackeys VFX bundle the reference, never its pictures): smoke in puffs of blocks, the
  blade's trail of glowing blocks, the dust of a landing; one pool of blocks in two meshes (`FX` in `npc-figures.js`), the game's hard-edged look.
- **Central Park's entrance** (owner, 17 Oct 2026: "import the low poly forest pack, and anything else you can use to build out central park
  entrance and a little bit further. make the trees to scale (5-20 times bigger than people)"; `src/park.js`, `tools/forest-bake.py` →
  `data/forest.json` from his Drive's LowpolyForestPack.zip): past the far sidewalk, the park's stone wall the street's length with its gate
  opposite the bodega, the hexagonal pavers in to a round and on north-east, lawns (the game's grass), the pack's oaks, spruces, a dead oak and a
  dead spruce at 9 to 30 metres (a person 1.8), its rocks as outcrops, the park's lamps; one mesh the trees, one the rocks, flat colours (the pack's
  textures' means), the sun's and the lamps' shadows. The menu's PLACES has CENTRAL PARK.
- **The storeroom** (owner, 17 Oct 2026: "brng back diner and bar with all musicians, the moonshrine, the herb cottage, the octopus tank, castle keep,
  butterflies ... dont add them to the map yet just bring to this new game and all items"; `src/store.js`, `build.py`): the game's own rooms, built
  by the game's own makers (their files read word for word into the kit: the Diner, the Bar's three files and the music things, the Moon
  Shrine's two, the page rooms' kit and the Herb Cottage's two, the octopus room, the dungeon's two and the keep's two from the game's archive,
  the butterflies and the living rooms' mood pieces), set out far east of the map on one dark concrete floor, out of sight of it: THE DINER
  (Preset Diner 1 in its room), THE BAR (as 26-zzz-bar sets it out, at night: candles only; the grand and the drum kit on its stage), THE MOON
  SHRINE (on grass, its koi pond real water), THE HERB COTTAGE (its own walls and roof), THE OCTOPUS TANK (its room, the tank real water behind
  glass), THE KEEP (the great tower from the archive, its stone, turrets and parapet, the dungeon's walls and things inside, the cross wall's
  arches), THE BUTTERFLIES (the butterfly house with its pair, six more over the shrine: `src/butterflies.js`, the game's kinds and pictures
  flying perch to perch). Each room's walls built as the bodega's (cut to their foot when between you and the camera), its roof hidden while
  you're in, its lamps LITE's as any room's (a lamp in a room lights only it). The menu's
  STORED row takes you to each; the view and his walk are bounded by the store while he's there. The water now runs as more than one body
  (`waterBody` in `water3d.js`: the pool's, the pond's, the tank's). **The bar's musicians** (`src/pianist.js`, `src/singer.js`, `src/drummer.js`,
  each the game's own files word for word, built as the musician is): the pianist in his tuxedo at the grand (the 88 keys his, the real grand's
  recordings, his book of three pieces), the singer in the red gown at the microphone (the cord real physics, her voice made as a voice is, wordless
  over the songbook's chords), the octopus drummer at the kit (his set on the kit's physics engine, the AudioWorklet; his cigar and his glass).
  The guitarist is on the stage with them now. **One on the stage at a time** (owner, 17 Oct 2026: "only 1 musician on stage at once"; `src/bandstand.js`):
  a set each (three minutes, `?set=` seconds for a test), the guitarist, the pianist, the singer, the drummer in turn; the others not drawn, not run,
  silent; each comes on from the start of a piece; the clock runs only while you're near the stage. **The people are the player's avatar** (owner,
  17 Oct 2026: "reset all npcs to same exact avatar as main player", his pick: the people): the guitarist, the pianist and the singer are built from
  the player's own pieces (`musBody` in `musician.js`: `W3.pcs`, his hair and eyes, his build's sizes `W3.E` each frame, his size `W3.SZ`, `W3.BH`), only
  their fingers a piece a bone for playing; their clothes their own colours (the tuxedo). **The singer's gown back** (owner, 17 Oct 2026: "yes"): on the player's FEMALE
  body (YOUR LOOKS' sizes and height, `LOOKS.BUILDS`), the gown's own skirt to the floor and its strapless bodice in the gown's red, no sleeves,
  her legs bare under it; her mic cord clears the skirt again (the game's `cordStep` keeps out of that shape); some 27,500 triangles. One mesh maker for them all (`figureMesh`, shared shapes made once, one set of shader programs). **Their cost**
  (measured): the guitarist 30,300 triangles (was 64,200), the pianist 22,600 (was 140,100: each key now a plain box, the keys were 112,000), the
  singer 27,000 (was 62,000); one on the stage, so at most 30,300 where the bar's three were 202,000 together. Not found in the game: "raincoast" (asked back).
- **The creatures' animations fixed** (owner, 17 Oct 2026, "fix the animals animations. check each one"): the packs' armatures stand a quarter turned
  and 100 times their rigs (the rat's 39.5), and the bake dropped that from each rig's root, so every creature's skin collapsed to a hundredth of
  itself as soon as its bones moved it; the root now keeps the armature's size and turn (`rig.s`, `creatures-bake.py`), its clips set under it.
  Each checked close up (`tests/creatact.cjs`: one of each kind, walking then standing): the rat scurries nose first, the frog hops (it moves only
  while in the air, `hop`), the slime wobbles, the snake slithers (the pack's bunch and stretch), the spider creeps, the wasp hovers, the bat flaps;
  the wasp and the slime face their packs' x, turned to face their way (`turn`); the slime basketball-sized.
- **The imports from his Drive, by recency** (owner, 17 Oct 2026: "start importing google drive assets based on most recent and import into game, keep
  going for 3 hours"): what the Drive connection could fetch (files under 10 MB; the bigger packs and models it cannot). **The undergrowth**
  (his Free Shrubs Flowers and Mushrooms pack and LowPoly-Psionic: `tools/props-bake.py` → `data/props.json`, placed by `park.js`): bushes,
  flowers, grass, mushrooms, stones over the park's lawns, logs and bits of fence, the Psionic mushrooms; **the pots and plants** (his pots &
  plants pack) by the gate. **The creatures** (Easy Animated Enemy Pack: the rat, the frog, the snake, the spider, the wasp; Monster Pack
  Animated by Quaternius: the bat, the slime; `tools/creatures-bake.py` → `data/creatures.json`, `src/npc-creatures.js`): each with the pack's
  bones and clips, walked as the skeletons are: rats about the street and the park, frogs, a slime, a snake and spiders in the park, bats over it at
  night, wasps by day. **The boats** (his kayak and fishing boat .fbx: `src/boats.js`): afloat in the pool as bodies of the pool's physics, with
  the ball and the ring. **The stalls at the gate** (the flea market's own: a toy stall with the TOYS-Psionic animals, an oddities stall with the
  Psionic crate, gems and gold), **the park's monument** (the terrain collection's ruined pillars), **its flower beds, cedars, a campfire** by a
  sitting log with the game's own smoke and a flickering light (`park.js`). Not fetched (the Drive connection's limit, or .rar files, which
  nothing here opens): the kenney space kit, Stylized Trees, Laundry, the Village interiors, and everything over 10 MB. **The plesiosaur skeleton**
  (his PointNemo pack, three.js code, not a model: `tools/nemo-bake.cjs` builds it once in a headless browser and keeps its faces, cut down) stands
  on its base between the pillars at the round's north.
- When a request could mean more than one thing, ask with a couple of options (or a quick mockup) before building.
- **A new character's sheet** (owner, 17 Oct 2026: "when adding new characters show them in black void, close up, spreading arms and limbs out
  pose so we can see them fully"; "show in full res in screenshots"): show every new character as `tests/sheet.cjs <key>` does (the page's
  `?sheet=key`: out on the land in a black void, the camera on him close, his limbs spread, at the screen's own pixels with `?fullres=8`), from
  the front, the side and the back, beside the owner's picture. Not on the street, not in a field, not at the game's coarse pixels.
- **The security droids** (owner, 17 Oct 2026, his Drive's UAL1_Standard.glb, the UAL1 animation library's standard body: an Unreal-style rig of
  65 bones with 43 clips; "make them security droids, they protect the market"; `src/npc-droids.js`, `data/ual.json` by `tools/creatures-bake.py`
  with `OUT=` and `SIMP=0.5`, the mesh cut to half, 6,872 triangles): four droids, the body gunmetal, the joints lit cyan (the glowing part, uEye),
  each marching a beat (the shops' sidewalk's two halves, the far sidewalk, the road's middle) at the formal walk, on guard at each end; a
  troublemaker up the stairs after dark and every droid near sprints to him and stuns him with a cyan beam from his hand (the guards' bolts,
  `GUARDX` from `npc-skel.js`), a jab up close, a word on the radio after, back to the beat. `?ualclip=<name>` holds them in a clip; `?sheet=droid1`.
- **The twelve pawns** (owner, 17 Oct 2026, the twelve .fbx characters at the root of his Drive, chibi figures on one rig, RigPawn, 16 bones with
  free-floating hands, 58 clips of their own: hero_m/f, villager_m/f, ogre, ogre_mage, ogre_guard_light/heavy, skeleton_mage, skeleton_reaper,
  skeleton_guard_light/heavy; `data/pawns.json`, one rig and one clip set shared, `src/npc-pawns.js`): walking the whole street, 1.35 m. **The UAL
  clips on them** ("match this same rig skeleton ... give them all the same stuff"): `tools/retarget-ual.py` retells all 43 UAL clips on the pawn
  rig (each pawn bone turns in the world as its mannequin bone does, the free hands go where the mannequin's go at the pawn's reach, the hips bob
  at his height), as `UAL_<name>`; they walk on UAL_Walk_Loop and stand on UAL_Idle_Loop. `?pawnclip=<name>`, `?pawnwalk=`, `?pawnidle=`, `?sheet=<key>`.
  **The Drive's files**: a file over the connection's size for its reply is still saved to disk by the tool (the 5.5 MB .fbx came through that way).
- **THE MARKET's artifact** (17 Oct 2026, "you decide, push"): the old link (X2Bk8UjQKP8yfLdLtVVn3s) can't be opened from this account, so THE MARKET
  is now published at **https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5** (update that one, keep its link). The droids stay the mannequins (not the
  pawn guards); the twelve pawns stay plain street walkers at 1.35 m.
- **The gold skeleton** (owner, 17 Oct 2026, his picture of a gilded clockwork skeleton with a white skull face: "put this character in game, use
  the other skeletons as guides for character design"; "make him 2x bigger"): the KayKit Minion's bones and body gilded at load (`gild` in
  `npc-skel.js`: gold by each bone's own light and shade, the face under the eyes and the jaw bone-white, the neck a steel spring, the eye sockets
  black with no glow, no cloak), 1.4 m (twice the others), unarmed, strolling the whole street as they do. **The weapons back in their hands** (owner, 17 Oct 2026: "their weapons aren't in their hands anymore"): `tools/simplify.py` read
  and wrote the bakes' packed points as uint16 where every bake and every reader in `src/` uses int16 +32500 (/65000), so every simplified mesh came
  back slid round its own box: the gear far off its hand slots, the Minion and the Rogue 2.2 units ahead of their bones (the load-time move back
  that hid it is gone). Fixed in `simplify.py` (now `python3 tools/simplify.py skel` runs one model alone); `data/skel.json` simplified again from
  `data/full/`. The kit, the creatures and the dragon went through the same bug and are not yet redone.
- **Strict hitboxes** (owner, 17 Oct 2026, the Fox found standing in a shelf: "we need to avoid clipping. all objects and characters need hitboxes.
  strictly"; `src/clip.js`, run once everything's built and again when the stacked rooms are): every thing on a floor is solid from its own faces
  (the batch's tagged things, `OBJS`; the park's props and the kits' pieces, `CLIPX`): its faces reaching above the knee (0.45 m) and starting
  under the chest (1.2 m) are sampled across the plan, and what no solid held becomes boxes on that floor's list (the street's, the station's, a
  stacked room's), for you, every character and the physics. Open still: mats, rugs, steps, kerbs (under the knee), what hangs higher (the
  cigarette rack over the Fox), grass and flowers, dust in the air. Every character is checked at load against his floor's solids and the
  others, and one standing in either is moved to the nearest clear spot he can reach (never through a wall; `N.home` for one his mind holds in
  place) with a console warning `CLIP: ...`; walking, a character keeps out of solids (makeNPC's default `free`) and never steps into another,
  standing or walking (a step away from one he's touching is let through, so two who meet don't stick: the goldfish inside the mushroom seller).
  The Fox on the mat's middle (x 4.51), his radius his depth (.27). Checked by `tests/clipcheck.cjs` (every thing held, every character clear,
  the goldfish and the mushroom seller sent at each other, no room's door closed; spots now walled off listed as notes). `?clip=0` leaves it off.
- **Fire, real** (owner, 17 Oct 2026, of the dojo's candle, a white block with a block flame: "can we start using real elements like fire? i dont
  want blocky animations"; `src/fire.js`, `FLAME`): every flame a live one, grown each frame by one shader from a noise rising and churning in
  three dimensions (never repeating): a white-yellow core, orange body, red tongues tearing off; a candle's teardrop with its blue foot, a torch's
  ragged tongues, a bed of coals' many, a fireball's churning ball; embers up from the big ones, a little smoke (dithered, no blending), the
  incense's thin curl. Each a card turned to the camera, all of them (flames, embers, puffs) one instanced mesh: one program, one draw, two
  triangles a card (some 25-45 near you), the CPU 0.03-0.05 ms a frame (measured here). Its light the place's own lamp (no new light), flickering
  smoothly with it. Where: the dojo's four candles (their wax no longer glowing white: cream, lit through under the flame, a wick), the dungeon's
  torches and brazier, the store's candles, torches and brazier (`FLAME.props` turns the game's own flame boxes into live flames, each with the
  lamp over it; they ride a stacked room's lift), the park's campfire, the dragons' fireballs and their sparks. The lanterns (paper, electric)
  stay as they were. A look: `tests/fireshot.cjs` (first person, aimed at the flame).

- **The goldfish deleted** (owner, 17 Oct 2026: "delete the fish raincoat character"): out of the street (`npc-map.js`) and the data (`data/goldfish.json`, `data/full/goldfish.json`); `tools/goldfish-paint.py` stays.
- **? lists what you can do** (owner, 17 Oct 2026: "pressing ? should give me list of all possible actions and moves for my player"; `UI.moves`, `ui.js`): every key's action as KEYS has them, the fighting moves and their chains, his own moves (ANIMATE), the mouse and the double click's uses.
- **Shift+R taken out** (owner, 17 Oct 2026: "resolution is fine as it is, take away shift+r option"): no table of resolution by zoom; the rule above stands (`RESI`, `ZUPX`).
- **NPC lives** (17 Oct 2026, the paused plan built; `src/lives.js`, after `clip.js` in build.py, `LIVES.init()` after `CLIP.run()`): every street
  walker who isn't a guard, a troublemaker, a dragon or a creature has a day by the clock (`CLOCK.h`), his hours shifted a little from the next's:
  asleep at home till seven (the apartment house's hall, the apartment building's lobby or hallway; the skeleton pawns in the dungeon, the gold one on
  the platform), breakfast at the Diner, work (the bodega, the dojo, the stalls, the park, the castle, the platform), lunch, work, the evening on the
  street or in the park (the street as full at seven as before), a few to the Bar, home by eleven. **Far** (out of the picture and more than four
  tiles from you, indoors where you aren't, on a level not shown: `NPCS.tick`, `LIVES.hidden`) a character is neither drawn nor his rig run: his
  numbers walk him four times a second along the street's lanes and each place's way in (its door, its room), a sidestep round what blocks him,
  down a stair with his level and group switched halfway; in the picture again his own tick takes over where his numbers are (one state, `st`, no
  pop). A far one blocks no one (`makeNPC`'s walk, `collide`, `clip.js`). The guards go end to end of their beats when far, the creatures and the
  bear wander on. Not done: a pose for sitting or sleeping (they stand, idle); the apartment house's upper floors (no stairs); the stacked rooms
  (no way in on foot). `?lives=1` lists everyone; `?lives=0` the old rule (frozen when far). `tests/livescheck.cjs` (its cost figures at the head of lives.js).
- **The grain, not halftone** (owner, 17 Oct 2026: "i want to avoid these types of shadows and grids half tone, can we do the shadows style i mentioned earlier"): the light's steps broken by a noise fixed to the world's art pixels, on by default (16 steps; `DITH` in `map-pre.js`; GRAPHICS' LIGHT GRAIN: on, strong 12, fine 24, off); no 4x4 ordered (Bayer) grid anywhere: the characters' shading, the see-through and the neon's halo take a grain instead.

- **Every panel closes and moves** (owner, 17 Oct 2026: "make sure menus have way to exit out, allow all menus to be draggable"; the end of `ui.js`): an X in each panel's corner (the menu, HIS SHAPE, YOUR LOOKS, the world editor, the ? list, Shift+R's, the SHARPEN bar, the help, stats and shadows boxes) and a drag by any plain part of it (not its buttons, sliders, fields or the map). A new panel joins by its id in `PANS`.
- **The simplified models put right** (17 Oct 2026): `tools/simplify.py` had read the bakes' packed points wrong (as plain uint16 /65535, not int16 +32500), sliding every indexed model round inside its box: the skeletons' weapons out of their hands, the creatures, the Dragon and the street kit off their places. Fixed, and the skel, kit, creatures and dragon data cut again from `data/full/` (`python3 tools/simplify.py <names>`).

- **The bus stop and its bench removed** (owner, 17 Oct 2026: "remove the bus stop and bus bench"; `dress.js`): the street keeps its trash cans and street light.

- **Street lights and lamp posts** (owner, 17 Oct 2026: "lets add a street light and lamp posts where they would go"; `dress.js`): the kit's tall street lights at both kerbs, staggered, about every 30 m, the arm over the road, a lit lamp under each head; cast-iron lamp posts (a post and a lantern) along the park's side of the far sidewalk, a pair at the gate, every 14 m; each a warm light (LITE's 8 nearest), solid at its foot. Cost: some 2,000 triangles, no new shadow lights.

- **Every room a button** (owner, 17 Oct 2026: "make sure every room and location on map has a button to jump there"; the menu's MAP, `ui.js`): PLACES, then ROOMS (the shop and the back room, the gym, the hallway, the lobby, the office, the dojo, each floor of the apartment house: its only way up now, the top of the subway stairs), then STORED; a jump puts the view back on him.

- **Pixel art, not 3D, on the street** (owner, 17 Oct 2026, of the kit street light's smooth smeared foot: "i dont want things to look so 3d and glitchy, more pixel art vibes"): the street lights and the trash cans built from flat-coloured blocks in `dress.js` (one draw), the kit's models no longer on the street. **Every lamp's pool**: a stepped warm disc on the ground under each street light and lamp post at night ("some dont glow": only 8 lamps light for real). **Clouds never over the street**: the clouds on the camera's side of you are left out (`WX.cloudCut`, weather.js).
- **The city's spine** (owner, 17 Oct 2026, after the gameplan for a world "fully functional ... police, fire, government, mail and delivery handled
  by bots": "1 - minimal on map only bare minimum required"; `src/city.js`, `CITY`): the four things every service will need, at their least,
  nothing drawn. ADDRESSES (`CITY.places()`: each place with the spot a tile before its door: the bodega, the apartments' lobby, the apartment
  house, the dojo, the park's gate, the castle's gatehouse, the top of the subway stairs, the platform; the stored rooms as stacked, no way on
  foot). WAYS (`CITY.route(lv,a,b)`: A* over half-tile cells of the level's ground, each cell tested with the hitboxes' own test as first looked
  at, the found path pulled straight; some 2-20 ms a route). WALKING (`CITY.send(N,spot,{v,then})`: a character without a mind of his own walked
  along a route by the rig's own steps; out of sight, not drawn, he's moved along it all the same; held up again and again, the way found
  afresh). THE BOARD (`CITY.post(kind,place|spot,data)`, `CITY.take(kind,by,from)` the nearest open job, `CITY.done`). THE SCHEDULE
  (`CITY.at(hour,fn)`, each day as the clock passes it). Doors stay doorways. `?errand=villager_m,bodega` (or `CITY.errand(key,place,tiles/s)`)
  sends a pawn to a door as a look. Checked by `tests/worldcheck.cjs`. Next, on this: mail and delivery (the plan).
- **The residents** (owner, 17 Oct 2026: "2 - residents in the apartment house, bare minimum"; `src/residents.js`, `CITY.residents`): four pawns
  live in the apartment house, a flat each (hero_m 1A, hero_f 1B, villager_m 2A, villager_f 2B), each with his hours (out 7:30 to 9:18, home
  18:12 to 20:24, staggered): out of the front door in the morning onto an errand of the day (the bodega, the park's gate, the diner, the bar,
  Ghost Street, by the spine's routes), a while there, then back to the street walking as the others do; at his hour he walks home and goes
  in (inside: hidden and still, `N.mode` 'hidden'; no flights of stairs yet, so not up to the flat). Set by the hour at the start (7pm: two
  home, two about to walk home) and at each of his hours as the clock passes; a jump of the clock put right at the next tick. `RESDBG()`;
  `tests/rescheck.cjs`.
- **The city's services, minimal** (owner, 17 Oct 2026: "lets add the rest except for supabase, look in the google drive for assets to use for
  anything new you add first before making it for yourself. lets do minimal for now to get started"): **from the Drive** (looked first): his
  Designersoup Low Poly Car Pack (five cars, .fbx; fbx2gltf, `tools/kit-bake.py` with `OUT=data/vehicles.json`, cut to a third by
  `tools/simplify.py vehicles`) and his trash bag piece; nothing there is a station, a mailbox or a hydrant, so those are built of blocks the
  street's way. **The civic row** (`src/civic.js`): six block-built station houses on the land past the street's east end (the precinct,
  the firehouse, the post office, the depot, city hall, the clinic), addresses of the spine, the view's bounds widened to them; no new lights.
  **The staff**: eight pawns in uniform (a tint, `UNIFORM` in `npc-pawns.js`), at their doors when free. **The vehicles** (`src/vehicles.js`):
  the patrol car, the fire truck, the works van, the ambulance (the pack's cars tinted, light bars that flash on a call), driving the road's two
  lanes to an x, a rider hidden aboard and out at the kerb. **The ledger**: the treasury, rent ($30 a day, notices at 8, due at 9), wages at 17,
  the shops' tax at 18, the shops' stock and tills (a resident buys when he arrives), the residents' cash and hunger (food resets it; hungry, his
  errand is for food), a log of everything. **The duties** (`src/duties.js`): the mail round at 9:30 (letters are records; your box is the
  apartments' lobby's, read in the menu); public works (the trash round at 6:30, deliveries when a shop is low, the power crew when lightning
  trips a stretch of lamps); the fire department (a live flame that grows at a trash can, Ghost Street's forecourt or the park's gate, by
  lightning, a small chance each hour, or TRY; it burns anyone close; hosed out with steam); the medic (you faint, he brings you round); the
  police (the two officers on the beat; a troublemaker is a call; taken in or seen off; curfew noted). **The menu's CITY tab**: all of it, with
  TRY buttons (a fire, an outage, a full can, a letter to you, you faint). Not done: the train's timetable, cells at the precinct, doors, wet
  roads, the player's own hunger, persistence (Supabase, at his word). `tests/civiccheck.cjs`; `CIVDBG()`, `VEHDBG()`.
  **This branch's build** (17 Oct 2026, the shared link PnmQ being published by other sessions' branches at the time): https://claude.ai/artifact/HkTZPr3szpVZmu4g2QDsP3; once the branches are merged, one publish to the shared link. **Found on the way**: the pool's boats and floats are flat shaded (`boats.js`, `floats.js`) against the world's Lambert shading patch (`map-pre.js`, which reads `vNormal`), so their program fails to compile whenever the menu's map draws everything at once (a console shader error; weather.js's clouds avoid flatShading for that reason). Not fixed here.
- **The map editor** (owner, 17 Oct 2026: "build a map editor that allows me to move buildings and land around easily"; then "the shift+m map
  layout editor needs full 360 draggable view to move things. they should snap in place to a very small grid"; `src/mapedit.js`): Shift+M (or MAP
  EDITOR in the menu's MAP tab). In the game's own view: the map view, turned all the way round (a right drag or Shift + drag) and tilted, slid
  (a left drag on nothing), zoomed far out (the wheel; `UI.MAXW` 240 tiles while it's on); the rooms' cut-away off while it's on. A left drag on a
  place picks it and carries it over the ground on a **quarter-tile grid** (a faint grid of them on the ground under it): a box of its footprint and
  height follows the mouse (its built spot a faint box), the other places faint boxes; the park, the castle and its dungeon, the apartments with the
  pool, the subway (stairs and station) and the land's sheet move their own meshes live (their own groups, `MAPG`); the bodega, the apartment house,
  Ghost Street, the Diner and the Bar are in the shared batches, so only their box moves till APPLY. The park's and the land's edges drag (snapped
  too). A small plan in the panel (the Market from above, taken as it opens; drag there as well), the arrows a quarter tile (Shift a tile), RESET THIS
  / RESET ALL; APPLY keeps it in the browser (`market-layout`) and loads the page again; closing without it puts the live moves back. Each place's
  code reads its move from `LAY` (`map-pre.js`) where it sets itself out, so its faces, solids, lights, rooms, ground, stairs and lanes all go with
  it: the bodega (its things, front, neon, the Fox), the apartment house, the apartments with the pool (and the rooms stacked on them), Ghost Street
  with its dojo and machines, the Diner, the Bar (its musicians), Central Park (the shrine with it; edges too), the castle (its dungeon with it), the
  subway (stairs and station together), the land's sheet (edges). EXPORT gives `LAYOUT {...}`: when he sends it, put it in `LAYOUT0` in `map-pre.js`
  (the game's own). Not possible: turning a place (every place is built on walls along the map's axes); the street itself stays. `?layout=0` the
  game's own layout alone, `?layout={...}` one for a test. Nothing made or run while it's off (its boxes and grid made as it opens, thrown away as it
  closes). Checked by `tests/mapedit3d.cjs` (and `tests/mapedit.cjs`, the plan).

- **The sky and the sunset** (owner, 17 Oct 2026: "look for ideas on how we could do the best sunset / sky", "go"; `src/sky.js`): a dome
  painted by one shader in place of the one flat colour: a gradient by height (horizon, middle, zenith), the horizon warmed on the sun's side
  and pinked on the side away from it (the Belt of Venus), its colours by the sun's height in stops close round the horizon (`P` in sky.js), so
  golden hour, the sunset, the afterglow and the blue hour each look their own; the sun a hard-edged disc (1.6° across high up, 3° at the
  horizon; deep red-orange low, cream high: `SUN`), a small halo round it, never bloom; the moon a disc; stars fixed to the sky from the end of
  the blue hour; the weather's grey and the fog laid over it as before (weather.js); the cumulus's undersides lit in the sunset's colour while
  the sun is low (`uUnder`, weather.js). The clock's light table (`K` in clock.js) has the same stops (10°, 3°, -2°, -6°, -12°), and the clock
  gives the sun's and the moon's real directions (`CLOCK.sunV`, `CLOCK.moonV`). PIXEL lighting cuts the gradient into 24 bands, SMOOTH leaves
  it smooth. The distance haze (skyline.js) takes the dome's horizon colour (between its two sides), so the skyline fades into the sky it stands against. Cost: one box of 12 triangles round the camera drawn where nothing covers it, one program, no light. Hidden underground and in a
  room. Not shown in the isometric and map views (they look down on the land) except past the land's edge. Seen in `tests/skyshot.cjs <out>
  [hours] [weather]` (first person, toward the sun and away from it, each hour; then from behind him). **The evening's mood** (owner, "1-3"): two more
  palettes for the stops round the horizon, FIRE (red, pink, magenta) and SOFT (grey-teal, one thin warm line), mixed into the clear one by
  weights the calendar day sets (`MOOD`, `W0` in sky.js; every evening its own, the same for everyone), SOFT the more the sky is clouded; `?mood=fire|soft|clear`
  holds one, `?day=N` another day. **The light at dusk**: the lit side warmer, the shade cooler and bluer as the sun drops (oldlook.js's
  warm-and-cool grade riding the clock, most at 3°, gone by night and high day; outdoors only). **The street lights on one by one** (`dress.js`):
  each street light and lamp post comes on at its own moment between the sun at 1.5° and 2.5° under (its lamp lit, its light and its pool with
  it), off again at dawn; by day they're dark and light nothing. The guards keep their beats day and night as before (nothing changed there).
- **(SUPERSEDED 18 Oct 2026 by CEL, ALWAYS below: no smooth light ever)** **Smooth light, the default now** (owner, 17 Oct 2026, of the grainy cloud and tree mockups: "i dont like any of those mockups, they all look like dots everywhere, i want smooth realistic shadows and lighting like gradient radial etc"; it supersedes the grain and the 24 steps above): `SMOOTH` in `map-pre.js`: no grain, the light not cut into steps, soft shadow edges (PCFSoftShadowMap), the lamps' pools smooth radial gradients; GRAPHICS' LIGHTING switches back to PIXEL (`market-lighting`), `?look=pixel|smooth`.

- **The far** (owner, 17 Oct 2026, his picture of a mountain fading blue into the sky: "how can i make things look realistically far away like
  this mountain? in my game? (it would be buildings)"; "go"; `src/skyline.js`): what makes the far look far is the air between. **A haze**, always on
  out in the open: the scene's fog in the horizon's colour (the sky's, bluer and paler by day, the deep navy at night; the weather's own FOG, thicker
  and grey, takes over when it comes), measured from where he stands (not from the camera, which the map views hold 300 units back): clear to 22
  tiles out, the full colour at 360; the isometric street barely touched, the far end of the park and the skyline going blue from his eyes. **A
  skyline**: two rows of flat buildings round the land's edge, silhouettes only (plain blocks, dull blue-greys, no windows, no lights, no shadows,
  nothing solid), the back row taller with a few towers; one instanced draw, some 3,000 triangles. The world's one lit shader carries the fog (no new
  program); the water and the characters' own shaders don't fog (they're near). GRAPHICS' DISTANCE HAZE ON / OFF; `?far=0` off, `?far=N` its full
  distance in tiles; `tests/farshot.cjs <out> [query] [name]` (his eyes down the street by day and at seven, the opening, third person).

- **Everyone roams the whole map, nobody minds you** (owner, 17 Oct 2026: "stop having chars stay around and be interested in player. have them
  roam around the entire map"; `ROAM` in `npc-map.js`): no character turns to you or waits for you any more (makeNPC's `near` is gone; a mind of
  its own, a troublemaker's, still may); every free walker (the gold skeleton, the mushroom seller, the twelve pawns) wanders the street's whole
  run and all of Central Park behind it (`STLANE` is now the whole map, `stfree` keeps them out of the stairs' holes, the solids and every
  building's inside: ROOMS' boxes, the apartment house, the castle's bailey): mostly a stroll of a few tiles, now and then a walk anywhere on the
  map, through the park's gate when the wall is between (`st.to` the gate, `st.next` the rest). The guards and the droids keep their beats, the
  Fox his counter, the bear his platform, the animals their own grounds. **The gold skeleton carries nothing** (owner: "should not have anything
  on them like mushrooms etc. just the skeleton"): he never did; he and the mushroom seller started on the same tile, so the seller's hat and tray
  stood over him; he starts on the far sidewalk now (and the pawns' row starts east of the stairs' hole, where one stood stuck in its margin).
- **Where you left off** (owner, 17 Oct 2026: "leaves off exactly where your character was last"; `src/where.js`): where he stands (x, z, the
  height of his floor) and the way he faces are kept in the browser (`market-where`) every two seconds as he moves and as the page is left, and
  he is put back there when the game opens (a stacked room finished first). A test's start (`?at`, `?place`, `?sheet`, `?npcat`) wins over it;
  `?fresh=1` forgets it. The day still starts at noon.
- **The guitarist in his apartment** (owner, 17 Oct 2026: "move the musician into an apartment top floor"; `musician.js`): he plays all the
  time in the apartment house's top-floor front living room (the middle of the room, facing its door), heard as you come near, the room's
  echo small; shown only from that floor (rooms.js's `show` now takes his height). The bar's stage keeps its turns without him: the pianist, the
  singer, the drummer (`bandstand.js`).
- **Nobody drawn who isn't seen** (owner, 17 Oct 2026: "dont render anyone not visible (they still exist just dont show them until you must)";
  `NPCS.tick` and `NPCS.cull` in `npc-map.js`): every character out of the picture (the camera's frustum) is not drawn, whoever he is, but he still
  lives: near you he is moved and thinks; farther than 25 tiles and unseen he is neither (as before). The hiding is done only round the picture's
  drawing (`NPCS.cull(true)` after `ROOMS.tick`, `NPCS.cull(false)` after the composer), so each one's own visibility (his mind's, rooms.js's, the
  stage's) is never overwritten. The bar's three and the guitarist join through `NPCS.extra`. Measured on the street at noon: 4 of 51 drawn.
- **The headless simulation and UI SCALE** (owner, 17 Oct 2026: "lets add the headless simulations, use their UI settings"; from the physician game's full_playthrough and verify scripts, and its theme settings): `tests/simrun.cjs` plays THE MARKET by script and checks the budget and the rules as it runs (above, under tests); DISPLAY's ON SCREEN has UI SCALE (SMALL .9, MEDIUM, LARGE 1.1: every panel and label zoomed, the picture untouched; kept in the save). **What the first runs found** (17 Oct 2026, to be dealt with at the owner's word): the street draws some 450,000 triangles in the camera's frustum against the budget's 100,000 (the batch's big meshes are one piece each, never culled: a bodega batch of 116,610, two of 56,723 and 38,400, the pool's 32,706); in the cloud's software rendering the first visit to a room freezes the page 2 to 5 s (shader programs compiled on first use with the room's clip planes).
- **The sound editor** (owner, 17 Oct 2026: "add a game sound editor to change levels perm"; `src/sndedit.js`): Shift+S, or SOUND EDITOR in DISPLAY's SOUND row: every effect's level (0 to 200%, PLAY to hear it), the ambience's three loops, the gap between its sounds, the voice blips; each change at once and kept for good (the save's `sndmix`); RESET ALL; EXPORT gives the mix as text for `SNDMIX0` in `sfx.js` (the game's own, under the save's).
- **From the owner's physician game** (17 Oct 2026, his recovered Godot scripts: "take all that apply to my game and can fit in seamlessly"; what
  fit, rewritten for the page, none of its medical content or Godot UI): **sounds made in code** (`src/sfx.js`: every effect a recipe grown from
  sines and filtered noise into a buffer the first time it's wanted, no sound file; his footsteps, a lamp's click, the fridge's latch and shut, the
  can's clunk, a seat's creak, a blow on you, a fireball's boom; quieter with distance, panned to its side); **the ambience** (`src/ambience.js`:
  a low hush under everything, the rain's hiss and the wind's breath from the weather, muffled indoors, none underground; every 7 to 16 s one
  small sound by weight, never the same kind twice running, nearer together with company: by day a car passing, a bird, a horn, the subway's
  rumble, a dog; by night crickets, a dog, a siren; indoors creaks; underground drips, the rumble, a train; thunder after a storm's flash);
  **what they say** (`src/lines.js`: pools of lines, a blank unfilled drops the line, the last fourteen said set aside, a word typed over the
  speaker's head with voice blips from a hash of his name; a character waved to answers, a guard cheers, a droid reports, the Fox greets you at
  his counter, a troublemaker taunts; the hundred last lines logged: the start of TODO.md's talking characters); **one save** (`src/save.js`:
  everything kept in the browser under `market-save` as {v, name: value}, the old scattered `market-*` keys gathered once; a migrate hook by
  version; `SAVE.get/set/del`); **a data check** (`tests/datacheck.cjs`: the save's gathering, every sound recipe finite and audible, the
  ambience's names, the pools' blanks and freshness, every menu place on ground, a wave without error). The menu's DISPLAY has SOUND: EFFECTS,
  AMBIENCE, VOLUME. Cost: three looping sources, at most two one-shots at a time, 0.007 ms a frame for the ambience's tick; nothing fetched.
  Not taken: its money and reputation curves (nothing sells yet), its day scheduler (no daily cast), its languages, its blur shader (no blur).

- **Interiors only near a door** (owner, 17 Oct 2026: "only load the parts of the interior that you can see from outside, and only load the
  interior when you are close enough to enter a door area ... within 5 blocks of any entrance"; `src/interiors.js`): every still face sits in a
  few batched meshes, so a building's inside was drawn from everywhere (the bodega's shelves from the castle: 116K of the 450K triangles in view
  there). Each interior (the bodega's shop and back room, the apartment building's rooms, the dojo, the apartment house, the Diner, the Bar, every
  stored room with walls) owns the faces inside its walls: those within 3 tiles of its door always drawn (what shows through it), the rest put
  into the meshes' index only within 5 tiles of a door or inside (a tile more to leave); the apartment house's inner wall meshes hidden the same
  way; the pool's water with the pool hall. The index is rebuilt only when an interior comes or goes. `?interiors=0` draws all. Measured at the
  castle: 1.12M to 0.76M triangles a frame (all passes); the street 1.25M to 0.89M.
- **`?trees=0`** hides the park's oaks (owner, 17 Oct 2026, for screenshots: "hide all trees on map so you dont get blocked").

- **The tour's fixes** (owner, 17 Oct 2026, "fix", after a run through twenty spots): the shade by day gets a little sky (`clock.js`, the fill
  .15 where it was .05: the buildings' backs were black boxes at 1pm; the sun still the light); the apartment house's lights three times as
  strong, hung at half the storey and reaching 8 tiles (`apts.js`: the hall's one lamp of 3 at the ceiling lit nothing), and its inner walls
  cut by the side you're on (an inner wall has a room on both sides); the dungeon's torches and fill brighter (`castle.js`); the water's own
  glow fades with daylight outdoors (`WATER.glowK`, `clock.js`: the pond glowed green at noon); a stored room's menu spot just inside its door
  (the Diner's stood outside behind a street light), a room without a door at its middle (the shrine's stood behind its wall). Not done: the
  Walker's 56,700 triangles (every unworn hairstyle folded in his mesh, drawn in every pass) and the apartment house's 600 wall draw calls.
- **THE MARKET IN ORDER: MOCKUP 1 (owner, 17 Oct 2026: "go through and try to make the map make sense, place things logical, organize the buildings and
  stacks of rooms in a way that would be logical, keep it on that side of the street"; then "have the street on right side go up and fill the right side
  of that street with places as well. pull from old game"; of three mockups, "mockup 1"; the mockups: https://claude.ai/artifact/UYDHWQFnYRe3cUMN7YmMVe)**:
  **one block, shoulder to shoulder**, homes at both ends and the shops between, west to east (`LAYOUT0` in `map-pre.js`, the moves in the map's tiles):
  the apartment house | THE COMMUNITY GARDEN on the lot the subway stairs stand before (the herb cottage at its west, the butterfly garden at its
  east, a wooden fence with an open gate on the sidewalk: `STORE.garden` in `store.js`, the fence in `dress.js`; the menu's THE GARDEN) | the bodega
  (+8.75) | the Diner (-24.75) | THE AQUARIUM (the octopus tank's room, a storefront with its door on the sidewalk, 28.2 to 44.4) | the Bar (-8) | Ghost
  Street (-8.75) | the apartment building with its pool at the east end (+59), **nothing on its roof** (the stack is gone, and with it `lift`, the
  stacked floors' ground and solids). **The keep in the castle's bailey** (its west half, behind the dungeon's stairwell, its door toward the
  gatehouse; the bailey four tiles wider west, `CASTLE.b` 46, the park's west edge with it, its well moved east). **The street runs on east** to x 100
  (`BOD.MAP.x1` 172), a crosswalk at the park's gate and two at the Avenue's mouth, **a back alley** behind the whole row (worn asphalt, y -101 to -96).
  **THE AVENUE** (`AVE` in `map-pre.js`: street tiles 152 to 166.5, north to y 49): a cross street north from the main street's east end, the main
  street's width (two sidewalks of 3.2, a road of 7.7, a kerb down, its own hole in the land), the park's new east wall along its west sidewalk with
  THE PARK'S EAST GATE opposite the museum (`PARK.egate`), lamp posts up its park side, the lawn north of the park open; its east side **the old game's
  row, as shells for now** (`AVR` in `store.js`: the row's brick, windows and a door on the Avenue, a plain room under one lamp, a roof), south to north:
  MARKET · LOUNGE on the corner, MUSEUM OF EARTH facing the gate, LUCKY 7, THE YELLOW AWNING, an alley, MOVIE THEATRE · ARCADE, PLAYHOUSE, 221B BAKER
  STREET; each in the menu's STORED row. Not yet: the old game's insides of those seven (each built to face the main street: a quarter turn per
  place as it's set out is new code), Cherry Station at the Avenue's north end, characters on the Avenue, the museum's window and the aquarium's,
  the cross street at the west end. **The budget, kept**: everything new is built after the game opens with the four rooms (`STEPS`, `STORE.later`),
  nothing at the loading line; one lamp a shell (LITE's pool); the only-your-room rule covers them.
- **The paused work finished** (17 Oct 2026, "lets finish those paused ones, go"; the branches in HANDOFF.md, all merged here):
  **The avatar editor** (Shift+K, DISPLAY's AVATAR EDITOR, a double click on yourself; `src/avatar.js`): one panel, six tabs: BODY (MALE / FEMALE,
  height, a slider a region, the sides together or apart, the feet and TOES round / pointed / square, the sculpting brush, HIS SHAPE's pieces, moves
  and animation a button away), LOOK (name, hair, eyes, every colour: five swatches and a picker each), TEXTURES (a pattern woven in his shader on the
  shirt, the trousers, the shoes: stripes, plaid, denim, knit, camo, dots, its scale and two colours), OUTLINE (on, its colour, 1-4 pixels), SHADING
  (smooth or stepped, steps, depth, SELF, a rim light, lamps or flat), PRESETS (named looks in the browser, RESET, DOWNLOAD / LOAD). `tests/avshot.cjs`.
  **The perf fixes** (`src/perf.js`, `docs/perf-audit.md` with the numbers; `?perfx=0` all off, `?perfx=-5` one off): the rooms' insides split off and
  drawn only from inside, self-shadows for you and the two nearest, real bounds on everything, the lamp's cube 512, the floats and butterflies only
  near them, the musicians hidden past 18; and fix 5 remade: the Walker indexed to what he wears (57K to 15K triangles), the batches cut into map chunks
  of 16 tiles for the frustum, the bodega's own mesh split by room, the pool's water not drawn from the street. The street by day: 1.71M to 410K
  triangles a frame; the main pass 1.60M to 397K. **The trees' look**: the round crown lit in one gradient with soft shadows letting a little light
  through (`?treelook=3`, now the game's; 0 the old, 1 and 2 the others; `tests/treeshot.cjs`): +4 shader programs, no frame cost measured.
  **The map editor's next round** (`src/mapedit.js`): every building moves live (the bodega, the apartment house, Ghost Street, the Diner and the Bar
  carried: their batched faces hidden where they were, a copy with the drag, their unbatched meshes and lamps along, the old spot empty); PLACE keeps a
  place where it's put and picks up the next, one SAVE (RELOADS) at the end; RAISE / LOWER (a quarter tile, Shift a tile; a stack, the Diner on the
  Bar) and GROW / SHRINK (5%, about the middle of the front) for the Diner and the Bar only, built lifted as the stacked rooms are (their floor, solids
  and ground with them; the musicians' stage rides the Bar's lift) and sized (`LAY.h`, `LAY.s` in `map-pre.js`; EXPORT carries them); the bodega, the
  house and Ghost Street move only (their builders set their own heights and sizes). `tests/mapedit4.cjs`. **The Fox angular**, like his sprite
  (CHARS[1] in the game's 10-characters.data, read as data): boxy head, wedge muzzle, pyramid ears, a chunky quilted puffer, block mitts, flared legs,
  588 triangles (was 3,532); `tbox` and a part's `flat` in `npc-parts.js`. **The apartment house lit**: brighter lamps, the hall lit end to end, a
  floor's lamps light its rooms (`userData.in` on a lamp, LITE in map-post.js); **the cigarette rack** hung 42 px higher, above the Fox's head.
  **The hitbox-walled spots** (a corner of the Diner between its chairs, behind the bar counter, a strip at the castle's drums) are left as they are:
  pockets between things, closed by their true boxes, that no one needs.
- **THE MARKET's artifact, from this account** (17 Oct 2026): X2Bk8UjQKP8yfLdLtVVn3s can't be opened from here, so THE MARKET is published at
  **https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5** (update that one from here).
  **This branch's build** (17 Oct 2026, the paused work finished, while other sessions were publishing their own branches to that link): https://claude.ai/artifact/1QpVqQujaY6D6V1F19ZmKy; once the branches are merged, one publish to the link above.
- **The power grid, built to apply later** (owner, 17 Oct 2026, after a video tracing every wire in Red Dead Redemption 2 to one power plant: "i want to
  use real power lines in the game"; his picks: "a power house as a new place", "i want it graphed to make real lights work. if the line is broken,
  that section of the map goes dark", "set it up so that if the map is changing in another chat it wont make you redo everything", "create the
  system that can be applied later"; `src/grid.js`, after dress.js in build.py): **off until applied** (`?grid=1`, or `market-grid` 1 in the browser; a
  GRAPHICS switch to come). A graph: THE POWER HOUSE (brick, two stacks, a lamp over its door, the wires leaving by a high window on its east
  wall) past the street's west end on the near kerb's side (moved by the layout as any place: `LAY.o('power')`); the street lights' poles its
  nodes, a crossarm with three insulators on each and a transformer can on every third; trunk wires pole to pole along each kerb, both kerbs fed from
  the house; a wire from the nearest far pole to each lamp post; a service drop from the nearest pole to every building's wall near its roof; the
  subway fed down the stairs (no wire drawn). **Nothing placed by hand**: when switched on it derives itself from whatever stands on the map then
  (the poles dress.js made, every building's box from where the layout put it, every lamp LITE collected), so the map moved or added to elsewhere
  needs nothing redone: a building not yet known gets its drop by its box (`GRID.serve(key,{box})`), an unregistered lamp hangs on the nearest pole.
  **Power** runs from the house over every whole wire; a node no whole wire reaches is dark, and with it its lamps (left out of LITE, their pools
  gone, a street light's or post's head dimmed), the buildings it feeds (their lit windows, signs and shelf lamps dimmed: the batch's glowing
  faces in the box, found by sampling each face's picture), the subway's lamps. A cut wire hangs in two halves from its poles. Flames (candles,
  torches, the campfire, fireballs) are never on the grid. `GRID.cut(i)`, `GRID.mend(i)`, `GRID.cutNear(x,z)`, `GRID.cutDrop(key)`, `GRID.mendAll()`,
  `GRID.state()`; `?cut=1,5` for a test; `tests/gridshot.cjs <out> [cuts]`. Cost (on): some 1,000 triangles the wires (one draw, one small program of
  their own: a wire never thinner than a picture pixel), some 100 the hardware (one instanced draw), one lamp record (the house's door), nothing a
  frame but a quarter-second check. Not yet: what cuts a wire in play (a dragon's fireball, the world editor), mending it, the GRAPHICS switch, the
  map editor's handle on the house, smoke from its stacks.

- **You are the mannequin** (owner, 17 Oct 2026: "let me play as the animation model we are using as a framework", "lets make that the main
  avatar and i will sculpt it how i want"; then "make him look human ... (no face)"; "his base model no clothes just underwear, and then put
  jeans and shoes and hair on him as sep items"; `src/playas.js`): the UAL1 standard body (data/ual.json, the droids' body) is the player. The
  game's rig still runs you (keys, moves, physics, camera); he stands where you stand and plays his own clips for what you do (idle, walk,
  jog, sprint by speed; jump, punch, roll, fall, sit, swim). His base body is skin with briefs, no face; HAIR, SHIRT, JEANS, SHOES are items,
  each its own skinned mesh made from the body's own faces pushed out by the cloth's thickness and bent by the same bones (`PLAYAS.wear`,
  `PLAYAS.colour`; GRAPHICS' buttons; kept in the browser, `market-wear`); the body's faces under a worn item aren't drawn. GRAPHICS' AVATAR
  switches back to the Walker (`?avatar=walker`). The earlier mockups (a dozen soft shapes, the traced sprite) were not taken.
- **The tomato and his friends** (owner, 17 Oct 2026, his pictures: a tomato-headed mascot in a yellow apron, "simple graphics, like the character
  on right (the old game's deer sprite), a little more complex but not much": of three mockups (A the sprite's level, B, C) he took C's look; then
  "lets do the same thing with them. simpel designed characters. each part its own so it can be animated. give it physics and animations for
  walking, each item separate thing (newspaper, motorcycle) use same style as the tomato guy"; `src/npc-rig.js`, `src/npc-toons.js`): THE TOMATO
  (freckles, leaves and a curled stem, the apron), THE CAT IN THE RAINCOAT (the newspaper under his arm, opened to read when he stops, its page
  turned now and then; the ink jar in his hand, set down by his foot while he reads), THE TV CAT (a rusty TV on four furry legs, its screen his
  face, glowing a little, blinking; the cable trailing), THE FROG ON HIS SCOOTER (the scooter his own: fork on its spring, wheels turning as he
  rolls, the box on the rack, a lean into turns, the cape lifted by his going), THE SHARK (the hood's fin, its jaw snapping now and then, the trench
  coat's skirt). **Their complexity** (of a ladder of the tomato at 1 to 5, the owner: "#1 but with #2s arms"): the deer sprite's level (a few
  plain shapes in flat colours, round things in few faces, flat eyes), only the arms the second level's (a sleeve to the wrist, a glove with its
  thumb and cuff). Built in code from plain shapes; **every part on a bone of its own** (`RIGNPC.make`: one mesh, one draw, each point carried
  rigidly by its part's bone), the things they carry their own parts on their own bones. Each frame the bones go back to rest, the character's
  pose moves them (walk, idle look round, what he does with his things), then **springs** add the give (what hangs or stands lags behind his
  starts, stops and turns, and swings back; at rest it settles and stops; a bump from you sets them going): no Rapier, no new loads. Some
  700-1,600 triangles each (5,250 the five), no lights, one shadow map each (SELF) as every character. They walk the whole street.
  `N.reshape` / `N.recolour` by part, `N.B` the bones. `?toonhold=1` stands the five in a row; `tests/toonshot.cjs <out> [hour] [zoom]`; `tests/toonwalk.cjs <tomato|cat|tv|frog|shark> <out> [zoom]` one walking, the free camera on him. The frog's key is `scooterfrog` (`frog` is the park's creatures').

- **The opening view and V, again** (owner, 17 Oct 2026, his picture of the dojo: "i want the game to always start you this distance and at this
  isometric angle, q & e to rotate, v wlil take you in 3rd person view over their shoulders and they can look around 360 and up and down. press v
  again and in full free view 1st person view"): ISOMETRIC opens at the half turn from the angle before, 1.5 times in (0.7 of the 2.2 before;
  `UI.setView` in `ui.js`); Q / E jump between its four angles; V: BEHIND, the camera over his right shoulder (0.45 m out), a drag looks all round
  and up and down, the camera brought in before any wall between his head and it (the solids he walks into); V again FIRST PERSON (a drag looks
  anywhere); V again back to isometric. `tests/startshot.cjs <out> [place] [view] [w] [h] [keys]` (`HOUR=13` for day).
  **Each place its own angle** (owner, 18 Oct 2026, his pick: his dojo angle out of doors put the camera behind the shop row, the buildings' backs
  over him): out of doors the one facing the shop fronts, in a room (`ROOMS.cur`) his dojo picture's; straight onto it as you go in or out
  (`UI.isoTo`, `UI.isoPlace`). **Nothing between the camera and the nearest ground on screen** (isometric only: the ortho camera's near plane
  just past it, `build.py`), so the castle at the park's far end or a building far behind you never stands in front of you.

- **Nimble** (owner, 17 Oct 2026: "lets make him super nimble, he can run jump roll grab things and swing, full actionable and fun to play";
  `src/playas.js`'s NIMBLE): he runs a third faster (`PLAYAS.K`); Space is his own jump (about 1.6 m, carrying his run); in the air he
  catches a bar in reach of his hands and hangs and swings (W / S pump, A / D along it, Space lets go with the swing's speed), or a ledge (the
  top of a wall or fence a man's height or so, not a post: Space vaults to the far side, S drops); a low thing run at with Space he vaults
  outright. The camera rises with him. A playground just inside the park's wall west of the gate (monkey bars, a high bar, a low bar) gives
  him bars to catch. Roll is Y, punch J, kick K (the rig's).

- **The park grown, its ways in the middle** (owner, 17 Oct 2026: "put the paths that cross through central park directly in the middle,
  expand central park by 25%, space things out logically"; `park.js`): the park's back at y 12.5 (a quarter more lawn, north); the round, the
  street's gate and the Avenue's gate at its very middle (`P.round` from its bounds); what stood by the old round (rocks, monument, campfire,
  logs, flower beds) the same way off the new one (`RX`, `RY`); the lamps along both ways every 13 and 16 tiles; the 22 oaks set by rule (clear
  of the ways, the castle, the shrine, the gate and the playground, 9 tiles apart); the castle moved 16.5 tiles north to the new back-left
  corner (`LAYOUT0.castle`).

- **The loop, the Hudson, the force field** (owner, 17 Oct 2026: "lets loop the street all the way around the park and back again ... use force
  field to block anyone from leaving outside of the city block loop ... add the hudson behind the buildings on main street, it goes all the way
  up and down map"; `RING` in map-pre.js, `bodega.js`'s grounds and kerbs, `src/ring.js`): the main street runs on west to a WEST STREET along
  the park's west side and a NORTH STREET along its back, both built as the Avenue is (sidewalks, kerbs, the road a kerb down, crosswalks at the
  park's gates); the Avenue's road ends at the north street (its east sidewalk on to the shells' last door). The park walled on all four sides,
  a gate where each middle way meets a wall, the castle's own wall its corner. THE FORCE FIELD round the loop and the buildings on its outer
  side: solid for everyone, the map's walking bound, seen only near (faint cyan). THE HUDSON just past the row's back alley, the land's whole
  width: a stone bank, a flat surface (not the pool's water) tinted by the sky with drifting glints.

- **The loop's subway and power lines** (owner, 17 Oct 2026: "have the subway follow the same path but underneath", "have the power lines go
  around the block"; `src/sub.js`, `dress.js`, `grid.js`): a tunnel at the station's depth under the middle of the loop's four roads (cream
  walls, a track round its middle, a lamp every 18 tiles), a three-car train going round it and stopping by each stair, two stairs down
  (`RING.stairs`: the west street's outer sidewalk, the Avenue's east one in the gap between its shells, each a short way into the tunnel);
  underground the background black. Street lights on both kerbs of all four sides; the power grid on by default (`?grid=0` off), each kerb's
  poles one ring round the loop, fed from the power house.
- **The civic tower and its droids** (owner, 17 Oct 2026: "take all the civic buildings and stack them on top of each other. all the jobs for civics will be done by the security drones. (but drone for each dept. fire dept drones will shoot water, etc)"; `src/civic.js`, `duties.js`): the six houses one tower of six floors past the north street, east of the park's north gate (map x 120-130, y 27.6-33.6), inside the force field: the firehouse at the street, the clinic, the precinct, the post office, the depot, city hall at the top, each floor's band its colour across the front; one door for all. The staff are UAL droids, one a department, in its colours (the body tinted, the joints lit): the fire droid throws a jet of water onto a fire (`CIVIC.jet`, 60 drops, one draw), the medic a healing beam to you, the police droid patrols the whole city and stuns a troublemaker (the guards' bolt), the mail droid carries the bag, the works droid his crate and kneels at a fault, the clerk keeps the books. The pawns no longer wear uniforms: they walk the city as themselves. Cost: the tower 492 triangles, one draw; six droids at 6,872 each where seen; the jet 720; no new lights. The tower takes the sky's light by day as the skyline does (its front is away from the sun).
- **A lived-in town** (owner, 17 Oct 2026: "have people walking through park, exploring the city ... i want it to feel lived in. give different characters different walking speeds, types of walks, behaviors, places to be, etc. randomize for now"; `src/walkers.js`, `npc-pawns.js`): twelve more townspeople (three more of each of the four people pawns, each in clothes of his own: every non-skin part turned round the colour wheel); every pawn who isn't a resident drawn a way of life at random as the game opens: PARKGOER (spots in the park, long stays, sitting on the grass), EXPLORER (anywhere in the loop), SHOPPER (the shops' doors, chatting), JOGGER (round the loop's four corners at a jog or a run), LOITERER (a spot of his own and short hops round it), COMMUTER (back and forth between two places); each his own walk (the pack's two walks, the UAL walk, the formal walk, a jog, a run: `N.gait`), his own pace, idle and stay; two who stop near each other turn and talk. Walked by the spine's routes (`CITY.send`), so LIVES leaves them be. `?walkers=0` off; `WALKDBG()`. Cost: about 1,400 triangles a townsperson, only where seen; no lights, no programs.

- **The guitarist walks the street; the lamp shadow handed over gradually** (owner, 18 Oct 2026: "the musician should only play if you ask him
  to play, walks up and down street stop occasiaonnly"; "shadows completely vanish and appear suddenly once you are in range instead of
  gradually"): the guitarist (`musician.js`) walks the shops' sidewalk on the rig's own walk, the guitar slung on his back, stopping a few
  seconds now and then, turned back where `STFREE` says the way is blocked; a double click asks for a tune: he faces you, plays it through (the
  close-up on his hands as before) and walks on, or as soon as you go. The one lamp shadow (`LITE`, `map-post.js`) thins to nothing as a second
  lamp comes nearly as near you as the nearest and grows in on the next after the handover (the nearest lamp's light split between its
  shadowed self and an unshadowed copy in the last of the eight slots: `LITE.w`); no new light, no new shadow.
- **No flicker on a character under a light** (owner, 18 Oct 2026, his screenshot under a lamp at night: "record yourself walking under a light and you wil see it flickers on your character really glitchy ... its rapidly changing and it looks like stuttering"): recorded sliding under a street light (old build against new). Standing still nothing changed; moving, the hard edges of light and shade on him crawled a pixel every frame, because the map and isometric views hold the camera on the picture's pixel grid but the characters glided between its pixels. **The characters on the pixel grid** (`PXSNAP` in `npc-map.js`): just before the picture is drawn, every character shown (you, the mannequin, the street's, the musicians) is moved less than half a pixel onto the grid, his own shadow's camera with him, and put back after (measured: the light on him changing between frames about a third less, steady stretches at nearly nothing). With it: the self-shadow cameras never aim along their up (a lamp overhead spun their roll), the light on him eased toward a new lamp, LITE's lamps held in their slots (the shadow's lamp changes only for one a third nearer, merged with the other session's gradual handover), and its shadow map redrawn every frame something moves near it (it was every other frame, stale on alternate frames) and not at all at rest. The perspective views (BEHIND, FIRST PERSON) aren't on a pixel grid, so not snapped.

- **No DESCRIBE, no DOWNLOAD; nothing of the world inside** (owner, 18 Oct 2026: "remove describe and download buttons. anytime someone is in
  interior rest of world should always vanish"): the world editor has no DESCRIBE A CHANGE (no call to Claude, no `sample` capability); HIS SHAPE,
  MOVES and the avatar editor have no DOWNLOAD (LOAD stays). Inside a room the rest is gone: the civic tower is a room (`rooms.js`), and what
  draws with its own shader and so isn't cut by the room's planes hides itself while you're in one (the sky dome already; now the force field,
  the river and its bank, `ring.js`). A doorway still cuts nothing until all of you is half a tile in (17 Oct's rule).
- **The avatar editor, standalone, on the game's own Walker** (owner, 18 Oct 2026: "create standalone avatar editor have the character have default
  poses yuo can push button to do, spread all limbs out, etc. allow to sculpt the character, rotate 360, tilt, export, give as many presets as
  possible"; then, of a first try built from new shapes, "i want it based on our new walker and our game"): `python3 build.py` also makes
  **`dist/avatar.html`**, a page of its own with the game's own Walker and the game's own editors: the rig lifted from the game page's head exactly
  as built, `walker3d.js` with the game's own patch (`W3PATCH` in build.py, used for both pages), `save.js`, `editor.js`, `animator.js`, `looks.js`,
  `avatar.js`, `avmove.js` word for word (the body types' table read from `playas.js`); what they take from the game page stood in for by
  `src/avatar-pre.js`; `src/avatar-page.html` the shell; `src/avatar-post.js` the rest. The game's avatar editor is open for good at the right (its
  DONE back to it). At the left: POSE (40 poses as keys of the rig's own, made whole by `RIG.mkMove`, eased between, kept on the floor by the rig's
  FLOOR radii; SPREAD OUT for the character sheet; a stool to sit on; every part turned by hand, poses kept), MOVES (the rig's own moves on the
  spot, once or round and round; the walk, the run), VIEW (12 places to look from, a turntable, the game's view or a lens, five pixel sizes, seven
  backdrops, his shadows), LOOKS (MALE / FEMALE, the six body types, 22 outfits and 7 shadings made of the game's own looks, patterns and outline,
  laid on with `AV.put`; what an outfit set beyond the clothes undone before the next), FILES (the game's own avatar file, his shape and his moves,
  each loading in the game's own editor; a posed GLB and OBJ in metres, zipped; a picture; the sheet: front, side, back, spread out on black at full
  pixels). Turn and tilt all the way round on the foot's sliders, a right drag, Q / E, T the turntable. `AV.whole` / `AV.put` exported from avatar.js
  for it. Published at **https://claude.ai/artifact/YQSBj2G7oqgHQA2jXohrQi** (its own link, the `downloads` capability). Tests: `tests/avpage.cjs <out>
  "POSE,move:wave,wear:CAMO,view:FRONT"`, `tests/avposes.cjs <out>` + `tests/avposes.py <out>` (every pose on one sheet), `tests/avpagefunc.cjs <out>`
  (the game's brush through real drags, every outfit and shading, every file, a file back in, a reload). In the headless shell at phone width, the
  panel's first paint lingers over the picture (the canvas's own frame is right: seen with `AVE.after`); not seen on a desktop width.
- **The Hudson, real water** (owner, 18 Oct 2026, of his Deep Water mockup and his picture of it, "exactly liek this, clear, see through, blue", "cmopleteyl fluid dynamics"; `src/river.js`): the river south of the row is water you can see into and swim in: the bed 1.3 m at the walls down to 8 m, its caustics, sea grass, fish, buoys; the quay with its railing, ladders every 20 tiles and a pier on posts at every third; the force field past the far bank. Four ways, four looks to compare: FLAT (the sheet as it was), SWELL (waves on the graphics card, murk by alpha), FLUID (the default: a wave simulation 48 tiles round you, fed by the sea at its open sides, slowed over the shallows, sent back off the quay and round the posts), FULL (waves plus ripples); three waters (HARBOR, OPEN SEA, CLEAR COVE: the default); smooth or 24 steps. **A double click on the water brings the options up** (X closes them). The bed, the quay's wall and its things carry a little light of their own (the row's shade at midday leaves them black otherwise). Cost: some 12,000 triangles, one more scene pass while FLUID or FULL shows the river, no lamps. `tests/rivershot.cjs`.
## ONE LINE OF WORK: read before you publish (owner, 18 Oct 2026: "why is everything getting reverted that i fix!?!?")

Several chats work on THE MARKET at once, each on its own branch, and all publish to the same link; whichever publishes last replaces the game
with its own copy, so a chat that hadn't taken in the others' work undid it. Every session, every time:

1. **Start from `main`** (`git fetch origin main` and branch from it, or merge it into your branch first).
2. **Just before you build to publish**, `git fetch origin` and merge `origin/main` into your branch; build and publish only from that.
3. **The link is https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5** (X2Bk8UjQKP8yfLdLtVVn3s is the first account's: this account can't open or
   update it, and it stays at 17 Oct). If the publish is refused because another session published newer, don't overwrite it: merge that
   session's branch (the newest pushed `claude/*` branch) into yours, rebuild, publish.
4. **Right after you publish**, push and open a pull request to `main` with the same work, and say so to the owner: the next chat starts from
   `main`, so work left on a side branch gets lost to it. Never leave a published change only on a side branch.

- **Main street: three buildings, the rest off the map** (owner, 18 Oct 2026: "i want this to be the main apartment building. the inside is
  completely empty (no walls, furn, doors etc) - i want main street to only have this building, the bodega and ghost street building on it. put all
  other buildings that are on main now off map for me to pull from later. i dont want any other buildings or rooms on map"; of the castle, "the
  tower shouldnt be inside the castle, it should be off map"): on the main street only **the apartment house** (`apts.js`, now THE main
  apartment building: `HOLLOW`, its brick, windows, fire escapes and front door as they were, inside one floor of boards and two lamps, no rooms'
  walls, doors, upper floors or ceilings; the menu's ROOMS has its ground only), **the bodega** and **Ghost Street** (its dojo and the vending
  machines). **Off the map, kept in the code** (`AWAY0` / `AWAY` in `map-pre.js`): `apartments` (the apartment building with the pool: too woven
  into the page to leave out, so built `AWAYLOT` 1000 tiles east, past the force field, never reached or drawn), `diner`, `bar` (and its band:
  the pianist, the singer, the drummer not built; the guitarist still walks the street), `aquarium`, `garden` (the herb cottage, the butterfly
  house, its fence), `avenue` (the seven shells), `keep`, `civic` (the tower; its six droids keep a row on the sidewalk east of the bodega, their
  departments' addresses there), `power` (the power house, and with it the grid off). Each place's own code asks `AWAY.has(key)` where it's set
  out; whatever leans on one skips it (lives, residents, walkers, jobs, mail: your box a flat in the apartment house; the menu's buttons, the map
  editor, the dragons' ledges, the view's bounds). **To bring one back**: `?bring=diner,bar` (or `?bring=all`) for a look; for good, take its key
  out of `AWAY0`; the map editor then moves it as before. The Moon Shrine stays in the park (the menu's MORE PLACES).
- **The castle for the woodland creatures** (owner, 18 Oct 2026: "the castle should be half height. it is for the woodlan creatuers who live
  here, not normal size charaters"; "same rulse apply for the castle, when you walk in the walls fall at bottom so you can see yuorself"):
  `castle.js` builds every piece at half its height (`CYS` .5: the curtain, the drums, the gatehouse and its arch, the rim, the well; each side's
  picture half the rows, so its pixels stay square; the solids with it), its footprint as it was; the stair down and the dungeon as they were.
  Each side's pieces (its curtain, its drums, the gatehouse with the front) are a mesh of their own, cut to their foot while you're half a tile
  inside the bailey (`cutWalls`, `MODS.castleIn`). The keep is off the map (above).
- **The main street twice as long, its far sidewalk twice as deep** (owner, 18 Oct 2026: "double th size of the street of main (left and right
  diretions) and double the size of the siewalk on the central park side. move the tress back away frmo the street further into the park"):
  `MAINX` in `map-pre.js`: the street run on 70 tiles each way (`BOD.MAP` x -38.5 to 242), the west street, the park's west wall and the castle
  70 west (`LAYOUT0.castle` x -70), the Avenue, the park's east wall and the force field's east side 70 east; the park twice as wide between them
  (its round, ways, gates and crosswalks at its new middle); the far sidewalk 6 tiles (`BOD.MAP.y1` FAR+6), the park, the north street and the
  force field's north side 3 north with it (`NORTHY`); the three buildings where they were. **The oaks** no nearer the park's front wall than 12
  tiles, crowns and all (`TREEY`, `park.js`). **The park's lawn is the land's sheet** (the same painter, `lawnCol`): only its two ways and the
  round are painted (twice as wide, the lawn's picture would have passed the atlas's 8192 rows), and its long walls are built in 40-tile lengths.
- **Found on the way** (18 Oct 2026): the page had stopped loading (`kerbFace is not defined`, then `cvNoise`: two of the game kit's painters
  used outside the bodega's scope, `bodbuild.js`'s kerbs and `park.js`'s pavers); both now through `BOD.g`. `tests/clipcheck.cjs` fails the
  same 8 Moon Shrine things it failed before this change (its parapets, terrace, gate and blossoms, after `STORE.shrineFix`): not fixed here.
- **The version notice, mended** (owner, 18 Oct 2026: "it DOESNT GIVE THAT DAMN MESSAGE EVER AND HASNT IN DAYS"): the artifact's `db` is null when the
  page is opened on its own (not inside claude.ai's viewer), so `meta/build` was never heard. Every build now also writes its moment into the page's
  head (`<meta name="market-build">`, build.py), and every open page reads the first bytes of its own address every 90 s and when the tab comes back
  (`peek` in `version.js`): a newer build there shows A NEW VERSION IS READY. The `db` way stays as well.
- **The grass by place, the mushrooms deeper** (owner, 18 Oct 2026: "i want just flat and tufts on the main side street, only the lush grass is in
  central park, the mushrooms hsould be deeper into the park and more rare in harder lpaces to find"): outside the park's walls the lawn's kinds are
  folded to FLAT and TUFT only (`WEEDS.inPark`, weeds.js); the crowns and rolls only inside. Mushrooms come up only 10 tiles or more in from the
  park's walls, at two fifths the odds (forage.js).
- **The roofs' things gone indoors** (owner, 18 Oct 2026: "the corner tops and roofs should also always vanish when inside a store"): rooftops.js's
  three draws (parapets, leaders, the roofs' things) hidden while `ROOMS.cur`.
- **The park wall's cope in stones** (owner, 18 Oct 2026: "need more lines on top of the brick walls too, doesnt look natural"): the top of the
  park's walls painted as coping stones, a joint every 14-22 texels, each stone's own tone, rims lit and shaded, a crack now and then (park.js).
- **Butterflies and ENTOMOLOGY** (owner, 18 Oct 2026: "add butterflies to the game (look in old game for crafting and butterflies info) lets
  implement all of hat ( in line with our current mushrooms, fishing, gems, etc)"; `src/bfly.js`): the old game's (its archive's 47-butterflies:
  New York's twelve by how often seen, one of the world's twenty rarest now and then deep in the park; a net for one on the wing, hands for one
  settled; caught it's unknown till known). By day, over the lawns round you (weeds.js's chunks), most in Central Park, a few outside, the rare ones
  10 tiles or more inside; afresh every two hours of the clock; roosting at night, in rain, snow or a gale. A double click walks up and tries
  (ENTOMOLOGY, a seventh skill: the cap 450). THE MUSHROOM SELLER sells the BUTTERFLY NET $12 and SPECIMEN FRAMES $4 and buys butterflies
  ($3-14 common, $40-250 rare, unknown at half, a mounted one 2.5 times); in THE PACK: IDENTIFY, MOUNT (a frame), RELEASE. The old game's own
  crafting design (DECISIONS.md: 1985 New York skills, items and prices the owner's) was on the shelf; this follows the town's UO way instead.
  `BFLYDBG()`. Cost: some 10-25 butterflies near you, 4 triangles each, an invisible box each; no light, no program.
- **The sidewalk's slabs twice as big** (owner, 18 Oct 2026, his photos of New York sidewalks: "make the sidewalk look more like this (bigger
  squares) keep same stylishing of grout and tufts, grass, etc."): each slab two tiles square, each row slid along its own amount (`SLB`,
  `slabCol` in gamekit.js); the grout, bevels, weeds and cracks as before.
- **Lamp posts at the kerb** (owner, 18 Oct 2026: "lamps and light posts only near curbs"): the park side's lamp posts and the Avenue's moved from
  out by the wall to the kerb (0.95 m in), none within 2.6 m of a street light (dress.js).
- **Street trees and the house's planters** (owner, 18 Oct 2026: "add a couple small trees on the apartment side, 1 in front of aparment"; "the
  apartments should have stpes like this , plants in front"): three small street trees in granite-edged pits by the near kerb (one before the
  apartment house, two east), and two brownstone planter boxes under iron railings, heaped with plants and flowers, west of the house's door
  (dress.js).
- **The stoop, the house raised** (owner, 18 Oct 2026: "1 yes raise it"; `apts.js`): the whole apartment house stands 28 art px (about 1 m) up
  (`APTS.RZ`; `APTS.R0` its height in the world: its `Y` and `gbox` add it, so its floors, walls, stairs, lift, flats, lights and furniture rise
  together; every height read from it elsewhere adds R0: clip.js, drone.js, residents.js, rooftops.js, rooms.js, ui.js), a brownstone plinth under
  it, and before the door a stoop: a landing and three steps down to the sidewalk (four equal risers, lit noses), a cheek wall each side (solid)
  with an iron railing, balusters at each tread and a newel at the foot. The ground on it (`APTS.stoop`, read by map-post.js's `groundY`) steps
  up to the lobby's floor. Cost: some 70 boxes in the house's batch; no light, no program.
- **The roads three times wider** (owner, 18 Oct 2026: "the street lanes are too narrow, need to be 3x wider"; `WID` 14 in `map-pre.js`): the main
  street's road 7 tiles to 21 (its far kerb `LSEED.grass` 14 north, everything north of it with `NORTHY` 23, the castle with it), the west street's,
  the north street's and the Avenue's each 14 wider outward (`RING.wx0`, `RING.ny1`, `AVE.x1`, the main street's east end `BOD.MAP.x1`); the spots set by
  number on the far side moved with it (the skeleton guards' lane and beat, the gold skeleton, the pawns' row, the creatures, the joggers' corners,
  the blue mailboxes). **The batch's atlas in pages** (`batch.js`): a page closes at 8,192 rows (`BATCH.MAXH`) and the rest goes on a new atlas of
  its own (its meshes `k~1`, ...), so the wider street's pictures no longer overflow what software rendering allows; `BATCH.stats.pages`.
- **The storm drains like his photo** (owner, 18 Oct 2026: "drains in road like this"): the gutter's grate a cast-iron frame, four rows of six long
  black slots, worn and rusty iron, ragged darker asphalt round it with weeds in its cracks, now and then a scrap of paper (bodega.js's `drain`).
- **The striped wall: the cottage's cabinet through it** (owner, 18 Oct 2026, two pictures of the house's front in vertical stripes with a cabinet on
  it): the cottage's apothecary cabinet, set against the east wall, reached out through it over the street; now every cottage piece (but the
  windows' rods and drapes) is slid back inside the walls if it reaches past them, and the house's wall pictures have mip levels (still nearest,
  never blended), so the brick photo seen small no longer shimmers into stripes (apts.js).
- **The cottage's things kept to their floor** (owner, 18 Oct 2026, from the lobby: "shouldnt see things on other floors"): the cottage's pieces had
  gone into the street's batch, unclipped, so they hung over the lobby; now a batch of the house's own under its ceiling cut (apts.js).
- **Real arms on the pawns** (owner, 18 Oct 2026: "help me improve the avatars for the skeletons and rock golems. right now their arms just float
  because they dont have arms, lets make sure everyone has real limbs in game"; `armsOf` / `armsSolve` in `src/npc-pawns.js`): the pawns' rig
  (RigPawn) has free hands and no arm, so all 24 pawns (the townspeople, the twelve rock golems, the four ogres, the four skeleton pawns) get an
  upper arm and a forearm a side: four bones added to the rig (outside the clips), a tapered six-sided tube a segment with a ball at the shoulder
  and the elbow, skinned into his one mesh; each time his pose is worked out (ASTEP's steps) the arm is solved from the shoulder on his chest to
  his hand's wrist, the elbow bending out, down and back by his chest's turn, stretched only if a clip throws the hand past its reach. The upper
  arm his chest's colour, the forearm his hand's; the skeletons' thin and bone white, the ogres' thick; the golems' carved in stone with the rest.
  The KayKit skeletons, the gold one and every other character already had arms. `?sheet=` now works for the dungeon's pawns and the golems (they
  stay out on the land for it). Cost: some 100 triangles a pawn, no light, no program.
- **The golems in real stone** (owner, 18 Oct 2026: "make the rock golems look like rock texture like boulder, rock, etc? their texture looks like
  triangles right now"; "avatars dont need to be so strict on triangles, they need to look right is #1"): the stone carved in the shader (`rock`
  in `npc-map.js`, fab 2.x on a point, its fraction his seed; one branch in the characters' two existing programs, no new one): in his body's own
  space, so it rides his bones and ignores the faces: boulders (a 3D Voronoi, four greys, warm or cool), dark cracks between them, a grain,
  lichen on the odd stone, moss low; flat colours. His shape a heap of stones (`boulder` in `npc-pawns.js`): each face cut in four, each piece
  rounded (Taubin smoothing over welded points) and lumped by a noise along its normal; his arms stone-thick. **Characters may spend
  triangles to look right** (the owner's word above): some 6,800 a golem (was 1,700), about 82,000 for all twelve together in the cave.
## THE MARKET: the one official map

**THE MARKET** (owner, 17 Oct 2026: "one official MARKET map im gona start filling in") is the game's map here: every place the owner adds goes
into it, on its street or under it (the subway's level), next to what's there; not new separate pages. It's built to `dist/market.html` and
published to its own artifact, **https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5** (18 Oct 2026: the one link; update that one, keep its link;
don't make new pages for new places; the old X2Bk8UjQKP8yfLdLtVVn3s can't be updated from this account). (Another session published to PnmQqhkusfewby35tf4zo5 for a while, a link the owner's main session can't open or update: 17 Oct 2026, version 47 back on X2Bk.) (17 Oct 2026, later: X2Bk could not be opened from this session's account, so the tomato and his friends and the opening view went to **PnmQqhkusfewby35tf4zo5**, version 15; try X2Bk first, then PnmQ.) A place's code is its own file in `src/`; `map-pre.js` says where each place stands (its offset, its level), `map-post.js` joins
them (the ground, the levels, what cuts away). Its first places: the bodega, the pool room, the subway station and its stairs.

**No more tsfm** (owner, 18 Oct 2026: "ok lets not use /tsfm anymore", then "merge 803, then stop"): [bralynnb/tsfm#803](https://github.com/bralynnb/tsfm/pull/803) was already merged (15:36, by him), so THE MARKET is live at thestrangestfleamarket.com/ as version 8.0.3. After that, nothing from here reads, copies to or opens pull requests on `bralynnb/tsfm`; the copy there stays as it is. (A website run from this repo itself, its own `thestrangest` worker, is a separate step.)

**The live website, again** (owner, 18 Oct 2026: "lets publish the site to thestrangestfleamarket.com"; "i dont want to use /play or /market, just have the game at the root domain"): THE MARKET goes to the game's repo as `market/market.html` by pull request ([bralynnb/tsfm#803](https://github.com/bralynnb/tsfm/pull/803), version 8.0.3, his to merge: merging publishes), and its door (`worker/door.js`) now serves it at **thestrangestfleamarket.com/** itself to a checked login, the door (login or code) to anyone else; `/play` and `/market` send on to `/`. What follows is how it stood before.

**Not updated any more** (owner, 17 Oct 2026: "stop updating tsfm im not working there anymore"): nothing goes to `bralynnb/tsfm` from here; the copy there stays as it was last merged (version 8.0.2, the reorganized map, at his word "go live" on 18 Oct 2026: [bralynnb/tsfm#802](https://github.com/bralynnb/tsfm/pull/802), his to merge; before it 8.0.1: at his word, "pull in all merges and go live", [bralynnb/tsfm#801](https://github.com/bralynnb/tsfm/pull/801); before it 8.0.0, [bralynnb/tsfm#800](https://github.com/bralynnb/tsfm/pull/800), 7.9.9, [bralynnb/tsfm#799](https://github.com/bralynnb/tsfm/pull/799), and 7.9.8, [bralynnb/tsfm#798](https://github.com/bralynnb/tsfm/pull/798)); ask before each update there. The artifact link is where THE MARKET is played. What follows is the old way, for the record.

**On the live website** (owner, 17 Oct 2026, stopped since): THE MARKET is at **thestrangestfleamarket.com/market**, for logged-in players only (the game's
door checks the login, as for the game). The live copy lives in the game's repo as `market/market.html`; the game's build publishes it. To
update it: build here, copy `dist/market.html` over `market/market.html` in `bralynnb/tsfm` (keep the `<!doctype html>` and the note at its
top), and open a pull request there (the game's rules apply to that repo: set its menu's version to the pull request's number; merging is
the owner's call, and merging publishes). The artifact link above is the quick way to try a change before that.

## What's here

- `build.py` builds `dist/market.html` (THE MARKET: one page; three.js r160 from jsdelivr). Run: `python3 build.py` (with `../tsfm` checked out, or
  `GAME_SRC=/path/to/tsfm/src`). Publish the page as an artifact for the owner to play.
- `src/` the pieces:
  - `flea-market-3d.html`: the base page (renderer, camera, input, the Walker's rig, physics, ragdoll, the loop); `build.py` patches it.
  - `walker-rig-mock.js` (the game's rig, adapted), `walker3d.js` (the Walker as a 3D mesh, his shading, outline, self shadow).
  - `map-pre.js` / `map-post.js`: **the map**: places, their positions, the two levels (street, underground), ground heights, the
    subway's stairs, the pool's outside, which walls cut away when you're inside.
  - `metro.js`: the subway (the Metro_PSX kit, data/metro.json). `station.js` + `wsub.js`: the game's West End station, off the map (`?bring=station`). `pool.js` + `water3d.js` + `floats.js`: the pool room,
    its water, its floats. `bodega.js` (the bodega's plan from the game's code, via `gamekit.js` stand-ins and `goods-defs.js`) +
    `bodbuild.js` (built in 3D). `batch.js`: every still face packed into one texture and a few meshes (fast).
  - `musician.js` (the guitarist, and `musBody` / `figureMesh` for every Walker-built musician), `pianist.js`, `singer.js`, `drummer.js`: the bar's
    musicians; `bandstand.js`: their turns on the stage.
  - `city.js`: the city's spine (addresses, routes over the ground, errands walked, the job board, the clock's schedule; nothing drawn).
  - `residents.js`: the four pawns who live in the apartment house, their hours and errands.
  - `civic.js`: the civic row, the staff, the ledger, the CITY tab; `duties.js`: the services at work; `vehicles.js`: the Drive's cars as the city's.
  - `npc-map.js`: the goldfish on the street and the bear wandering the platform (and `makeNPC`, every character's maker). `npc-skel.js`: the four skeletons on the far sidewalk, rigged and animated, and the gold skeleton (the Minion gilded).
  - `npc-street.js`: the cyborg and the teddy on the street (bones, moves, bodies in Rapier, minds). `npc-rigged.js`: the six figures made a second way (kept, not built: `npc-figures.js` is used).
  - `npc-dragon.js`: the Dragon on the road. `kit.js` + `dress.js`: the kits' pieces and the few on the street. `apts.js`: the apartment house (in the
    bodega's scope, after `bodbuild.js`).
  - `npc-dragon.js`: the Dragon on the road. `kit.js` + `dress.js`: the kits' pieces and the few on the street. `apts.js`: the apartment house (in the
    bodega's scope, after `bodbuild.js`). `npc-figures.js`: the six figures (KASA, GEKKOU, DRIZZEL, KURENAI, SAMIDALE, SHOGUN) on their Mixamo
    bones, posed here, and the effects (smoke, the blade's trail, dust). `npc-creatures.js`: the packs' small animals on their own bones and clips. `npc-parts.js`: the parts builder; `npc-mushroom.js`: the mushroom seller, built in code in his parts. `npc-rig.js`: characters in parts on bones with springs; `npc-toons.js`: the tomato, the cat in the raincoat, the TV cat, the frog on his scooter, the shark.
    `park.js`: Central Park's entrance past the far sidewalk (the wall and gate, the pavers, the lawns, the pack's trees and rocks, the undergrowth,
    the pots, the lamps). `boats.js`: the kayak and the fishing boat afloat in the pool.
- `data/`: the characters baked from the owner's models (`goldfish.json`, `bear.json`), the skeletons, their gear and clips (`skel.json`), the six figures (`figures.json`), the park's trees and rocks (`forest.json`), the undergrowth, pots and boats (`props.json`), the creatures (`creatures.json`), the Dragon (`dragon.json`), the kits (`kit.json`). `tools/`: the
  scripts that baked them (they need the owner's .glb files and `fast-simplification`; `skeletons-bake.py` the KayKit pack, unzipped;
  `skin-bake.py`, `skin-bones.py`, `item-bake.py`, `mesh-cut.py` the street's characters and items: `trimesh`, `scipy`, `scikit-image` too;
  `figures-bake.py` the six figures, `forest-bake.py` the park's pack, `props-bake.py` still things from .glb or .obj with a palette, `creatures-bake.py` rigged ones with their clips; the packs' .fbx made .glb with npm's fbx2gltf).
- **Screenshots of other characters never show his avatar** (owner, 17 Oct 2026: "stop showing my avatar in screenshots of other characters"): a test looking at a character opens the page with `?hideme=1` (the Walker not drawn, `W3.hideMe` in `walker3d.js`).
- `tests/`: Playwright screenshots (`fireshot.cjs`: the live flames close up; `mapshot.cjs`: the street; `maptour.cjs`: platform, pool, bodega, stairs, a walk down; `skelshot.cjs`: the skeletons, close; `mushshot.cjs`: a character built in parts (the mushroom seller; another with its debug hook's name as the last argument), close, by day or night; `hairshot.cjs`: his hairstyles from four angles, walking and stopped; `sheet.cjs <key>`: a character's sheet (black void, close, limbs spread, full res: `?sheet=key&fullres=8`; `?npcat=key,field` stands one out on the land); `streetshot.cjs` the
  street's characters over a few moments; `streetact.cjs` one of them told each move, close up; `figshot.cjs` the six figures over a few moments; `figact.cjs` one told each move; `parkshot.cjs` the park's gate, round and path; `creatshot.cjs` the creatures by day and night; `poolshot.cjs` the boats; `gtshot.cjs` the guitarist close, `gthold.cjs` his holds tried, `bandshot.cjs` the stage's turns and who is heard, `pnshot.cjs` the pianist or the singer close; `modcheck.cjs` the page's module out for `node --check`; `datacheck.cjs` the data check (the save, the sounds, the lines, the places, the code's names against the tables); `simrun.cjs [minutes]` the headless simulation (the game played through by a script: every place, walking and running, the weather held in turn, the clock at a day a minute then a day in 2 s; the budget and the rules checked every two seconds: triangles on screen, lamps lit, no NaN, vitals, the clock, the level, the save, freezes, the hitboxes' audit; `SIM_TRIS=n` a bar other than 100,000); `citysim.cjs <out>` the civic droids called out and the town's walkers tracked (none stuck); `policesim.cjs` the police droid at night; `trisby.cjs <out> "PLACE|PLACE"` the triangles in the picture by what draws them; `mapedit.cjs <out>` the map editor's plan: two places moved, their walls and lights with them; `mapedit3d.cjs <out>` the editor in the world: drags from two angles, the grid, the live park, APPLY). The page takes
  `?at=x,z[,height]` to start somewhere, for tests. In a cloud container rendering is software (slow, ~20 fps): run them in the background.

## Where it's going

Building it into a fuller game one piece at a time. First map done (16-17 Oct 2026): one street; the bodega and the pool room side by side;
the subway underneath, stairs down from the sidewalk. Next pieces are the owner's call. The list of what the game has that this doesn't
(places, NPCs and animals, activities, weather and time of day, multiplayer, menus) is in `README.md`.
- **Speeds, body types, standing easy, the rooms' near side, the zoom** (owner, 18 Oct 2026): **SPEED** (the avatar editor's new tab, `src/avmove.js`: "i need to be able to change my characters speed of walking, running, animation speeds"): WALK and RUN speed (his pace, his legs as quick as it: `st.wk`, `st.rk` in the rig's `tick`), ANIMATION speed (his steps, moves and idle quicker or slower, his pace as set: `st.anim`), 0.25 to 3, and STROLL / NORMAL / QUICK / ZOOM; yours alone (the street's Walkers keep theirs), kept in `market-speed`; `SPEED({wk:2})` in the console. **BODY TYPE** (top of BODY: "create preset body types based on the current avatar ... add 6 common body types"): AVERAGE, SLIM, ATHLETIC, HEAVY, STOCKY, TALL, laid over MALE / FEMALE (the Walker's piece sizes from his build's, and his height; the mannequin reshaped at its bind pose by the same table, `PLAYAS.BT`); `market-bodytype`. **The Walker the default again** ("i want to switch back to the regular avatar that has man and woman, make that the default"): `?avatar=mannequin` or GRAPHICS' AVATAR for the mannequin (its switch kept in `market-avatarpick`: `market-avatar` is the avatar editor's own settings, and read as the switch it had put everyone on the mannequin). **Standing easy** ("normal standing like the walker and not like he is ready for battle, this is casual gaming"): the mannequin's guarded Idle_Loop laid over, while he stands, with his arms down by his sides, legs straight, back up (`PLAYAS.relax`). **The rooms** ("when walking into a room dont auto switch view. by default the walls nearest view go down so you can see yourself. hide anything that covers the room view. you shouldnt see anything on this wall when its hidden"): going in or out no longer turns the view (`UI.isoPlace` does nothing); in a room, in the isometric and map views, everything more than 0.6 tile toward the camera from you and above your knee (0.45 m) is cut (two planes on each material, `clipIntersection`, given at the first room entered: `NEAR` in `rooms.js`): the near walls, the shelves and counters before you, the neon and its glow on those walls; the floor kept, the characters never cut, the shadows as they were. **The street light and its wires** ("showing up as i come into range"): the isometric near plane (nothing between the camera and the nearest ground on screen) now keeps whole what stands a street light's height (6.6 m, `UI.NEARH`) on the ground just off the screen's foot. **The zoom out** stops at about 19 tiles across, his third picture; the wheel can't overshoot it any more (it ran past while the zoom eased).
- **Less flat, real-looking pixel textures, the asks of 18 Oct 2026 (this session; branch `claude/gracious-goldberg-dk02ym`)**: **the light** ("everything looks flat"; his "do A-D"):
  the game opens at 3:30 pm (`CLOCK.h`, noon's overhead sun flattened everything; 4:30 put the street in the row's shadow), the shade's sky fill .08
  (`clock.js`, between .05's black boxes and .15's flatness), the sun a little stronger, soft bands under smooth light (`SOFT`, 7, each edge eased,
  the darkest band left smooth: `map-pre.js`; `?soft=0` off), the cloud shadows and the warm sun / cool shade on by default (`LFX` default `cs,cool`;
  `?fx=none` off). **Textures** ("bricks arent really textured ... the tiled sidewalk doesnt have real grout ... weeds betwen cracks, uneven lines";
  his pick: detailed pixel art, not photo textures): the pavement's slabs on wandering seams, two-texel grout, bevelled rims, each slab tilted its
  own way, chipped corners, weeds and moss in seams and cracks (`slabCol`, `gamekit.js`); granite kerbs in lengths with joints, their faces lit at
  the top and grimy at the foot (`kerbCol`, `kerbFace`); the brick's mortar set back, each brick toned, lit on top, chipped, burnt or pale here and
  there, grime from the foot (`facade`, `bodega.js`); the park's pavers bevelled with moss in their seams; the lawn's blades and hollows. **The
  sidewalk's streaks**: a ground picture over 2048 texels (85 tiles) ran over into the atlas's next rows; grounds and kerb faces now built in
  80-tile pieces (`bodbuild.js`), `BATCH` warns of any wider. **Round things round** (`dress.js`): poles, feet, collars and the trash cans eight-sided,
  flat-faced, one instanced draw. **The camera's near cut taken out** ("poles form in real time", "everything stop as cut off point"): the isometric
  near plane is .1 again (`build.py`); nothing is sliced by the camera (the other session's `UI.NEARH` no longer used). **SOUND its own tab** in the
  menu ("remove the shift+s shortcut"): EFFECTS, AMBIENCE, VOLUME and every level of the sound editor in the tab (`SNDED.into`); no Shift+S.
  **The campfire** ("flat at bottom and isnt causing any lights or shadows"): its flames' foot rounded and ragged (`fire.js`), its light 26 strong
  to 9 tiles from the flames' middle and first for the one lamp shadow when near (`userData.fire` counts half as far in `LITE`). **The creatures
  patterned** ("all 1 solid color"): each face its own colour from its kind's pattern (`PAINT` in `npc-creatures.js`): the spider's banded legs
  and chevrons, the frog's blotched back and cream belly, the rat's mottled fur, the snake's diamonds, the wasp's stripes and veined wings, the
  bat's leather and veins, the slime's bubbles; darker underneath. **The rock golems** ("these people ... rock golems ... hang out together in
  middle of central park"): the twelve townspeople carved in stone (`golem` in `npc-pawns.js`: four greys, dark seams, lit chips, lichen) with a
  way of life of their own (`golem` in `walkers.js`: round the park's round, long stays, talking, sitting). **The droids** ("walk faster ... 3
  shades of grey ... patrol all around the edges of the map"): three greys face by face, nothing glowing, a little over twice the pace, one round
  of the loop's outer sidewalks, a quarter apart (`npc-droids.js`). **The Walker the player** ("go back to regular new walker"; merged with the
  other session's same change, `market-avatarpick`). Test hooks: `CAMAT(x,y,z,k)`, `SCN()`, `SUNV()`, `FLAMES`. **Open**: the player in other
  things' shadows (asked, not reproduced cleanly here); hills, curved paths and rounded kerbs; the main street's reorganization, the doubled
  street, the castle at half height with its walls cut inside and the keep off map (a helper on it); the Metro in place of the station; a pond in
  the park.
- **A new version, said** (owner, 18 Oct 2026: "when youre playing it hsould check for new versions and let you knwo when one is vailable so you can
  refresh"; `src/version.js`): every build carries its moment (`BUILDV`, build.py); THE MARKET's artifact declares the `db` capability, keeps the
  newest build opened in `meta/build` (`{v}`), and an open page newer than it writes it; every open page listens and, when a newer build is
  there, shows A NEW VERSION IS READY with REFRESH at the screen's foot. **After every publish**: `ArtifactData set meta/build {v: <BUILDV of the
  build published>}` (grep `const BUILDV=` in dist/market.html), so open copies hear of it at once; publish without `capabilities` to keep `db`.
- **The mushroom seller's booth** (owner, 18 Oct 2026: "give the mushroom skeletong his own booth in the entrance of central park, his table is full
  of mushrooms"; `npc-mushroom.js`): inside the park's gate east of the toy stall, a trestle table under a red and cream striped awning, heaped with
  some 70 mushrooms and three baskets; he stands behind it facing the gate, held there (no roaming, no life of lives.js); built once the park is.
- **THE METRO on the map, the old station off it** (owner, 18 Oct 2026: "i want to bring the metro into the map and move the current subway station
  off map"; and from the platform, "there is as building in the subway"): the Metro_PSX kit from his Drive (`src/metro.js`, `data/metro.json` by
  `tools/metro-bake.py`; the paused branch `claude/amazing-albattani-gn3kp8` ported onto the reorganized street) is THE subway: its railed opening
  on the lot between the apartment house and the bodega (tiles x 59.4-64.6, its top on the sidewalk's back edge, y -76.9, the whole opening behind
  it so the sidewalk stays clear), a flight down, the corridor turning and sloping, the ticket gates, a 64 m platform 30 ft down (`METRO.DY`
  -11.7) running east under the bodega and Ghost Street, the car coming and going (doors on the platform's side only; cut to its floor like a
  wall when the camera's on the track's side), tube lights (16, LITE's eight nearest), columns, benches, bins, posters, the map, the machines.
  `MAPSTAIR` is its opening (`has(x,z,lv)`, `ground(x,z,lv)`: the flight and corridor from the kit's height map); `MODS.station` gives its
  floor inside its footprint and the loop's tunnel depth (`STN.DY`) outside it, and `plat` (THE PLATFORM, the city's address, lives' way in),
  `path` (the way down for a character), `DY`. **The West End station off the map** (`AWAY0` 'station', map-pre.js): `station.js`, `wsub.js` and the
  old stairs stay in the page, built only with `?bring=station` (then instead of the Metro: they share the spot). **The loop's tunnel and its two
  stairs** (sub.js) stay as they were, 8 units higher than the Metro and not joined to it (a ramp between the two depths is not built).
  **The building in the subway**: things set straight in the scene after the places' groups (the street lights and their pools, the power lines,
  the land's sheet, what's built after the game opens) were never hidden underground; now every top-level thing lying wholly above the street's
  depth is taken off the camera's layer while you're more than a unit down (`UNDER` in map-post.js; the places' groups, the stairs, lights,
  characters and the fire left alone). **Found on the way**: every ground picture was painted mirrored front to back (`flat0` in bodbuild.js
  painted row 0 at y1, bq lays it at y0), so the holes for the stairs down were in the wrong place (grass over the Metro's flight); fixed, every
  ground now the right way round. The kit's walls' cut sides were reversed in the branch (fixed: cutWalls take the inward facing). The branch's
  open shader error (`vNormal`) does not occur on main (its lambert patch already handles flat shading); none seen. Cost: some 22,000 triangles
  underground (the car 9,200, its doors 2,500), the batch's Lambert program, 21 lamp records and no new light or shadow. `tests/metroshot.cjs <out>`.
  Not done: sitting on its benches (`use.js` knows the old station's), rats on the platform, a TO STREET sign, riding the car; the bear it
  names is long deleted.
- **Guards out of sight walk their beats** (18 Oct 2026, found with the droids standing still): lives.js's far stepper calls `N.pick()`, which
  makeNPC never gave; it does now.
- **Lightning Fast VCR Repair, off the map** (owner, 18 Oct 2026, his photo: "add this as a new building mockup for game", the mockup
  https://claude.ai/artifact/RqccsVVLmsmXFPhs4P9NDx (`mockups/vcr-repair.html`), then "off map"; `store.js`): a one-storey block 14 x 10 tiles,
  270 px high, on its own asphalt lot far east of the map where the storeroom stood (bodega tiles x 380-394, y -92 to -82; the view bounded to
  the store while you're there); the menu's STORED row has VCR REPAIR. The front speckled tan stucco between brown pilasters (boxes), the band
  and coping, two white-framed windows, the light box of a sign (glowing; its words painted once from a canvas), the doorway with 3110 over it;
  sides and back grey concrete block, the gooseneck lamp (lit, the side yard's one light), a camera, the meter; the side yard's chain-link fence
  and gate with barbed wire (the mesh cut out); the bed along the front, its curb, mulch and five bare shrubs. **Inside** (owner: "yes"): a vinyl
  checker floor; the counter across the front room (the till's green screen, a deck, a stack of tapes), the way behind it on the door's side; three
  steel shelving units along the back wall full of VCRs (black, silver, grey, each with its slot and a light, some gaps, some stacked); the repair
  bench on the west wall (an old TV showing static, a deck open on its green board, the iron, a bench lamp with its own small light), a stool;
  cardboard boxes, a poster. Some 3,000 triangles in all, three lamps (the room's, the bench's, the gooseneck's), no new program.
  **Its atmosphere** (owner, 18 Oct 2026, his picture of a rainy magenta night: "can we add atmopshere to it like this"; his picks: the lot
  only, the haze, the rain, neon, the skyline and wires; `store.js`): while you're out on the lot (not inside, not elsewhere) a purple haze
  closes in (a third of it already where you stand; lavender by day, deep magenta at night, the sky with it: its own `THREE.Fog`, so the far
  haze and the weather's fog step aside) and the rain is held on (`WX.at` answers rain there: the streaks, the clouds' grey, the ambience's
  hiss). VHS in pink neon tubes on the east wall, OPEN in cyan in the second window, each with a coloured lamp on the ground. Towers in the haze
  with a scatter of lit windows, two wooden poles and sagging cables (one unlit vertex-coloured mesh, cut on the camera's side of you as the
  clouds are, so a tower never stands between the camera and you), a searchlight sweeping from the tallest (an additive cone), a plain dark
  ground out to the view's edges. Cost: some 2,500 triangles more, four draws, two programs, two lamps (the neon's). The lot is four pieces round the shop (one piece whose middle fell
  inside it was taken for the interior and drawn only near the door: interiors.js). `tests/vcrshot.cjs <out>` (front, wide, side yard, inside).
- **The near side's cut fixed to the room** (owner, 18 Oct 2026, two screenshots of a room's things half cut: "why is still vanshing liek this
  when i walk around?"): the near-side cut (`NEAR` in `rooms.js`) had its line half a tile toward the camera from him, so as he walked it swept
  through the desk, the sink, the boxes, and they came and went. Now it's the room's own: above his knee and within 1.1 tiles of either of the
  room's two walls on the camera's side (the walls and what stands against them), fixed while he's in the room; everything else whole wherever
  he walks. Two near walls make an L, which three's clipping (all planes or any plane) can't hold, so its `clipping_planes_fragment` chunk is
  patched once in rooms.js: a material's own planes cut where the first says and any one of the rest says (two planes as before). No new
  program beyond the rooms' own, no cost a frame. `tests/roomwalk.cjs <out> [room]` (three spots in a room, the same things standing in each).
- **Libraries for what was hand-written** (owner, 18 Oct 2026: "is there another game engine that makes more sense" — no, three.js stays; then
  "lets start installing libraries for thinsg weve hand written"): **three-mesh-bvh** (0.8.3 from jsDelivr, `src/bvh.js`) for every ray (a double
  click, the drag's pivot, the world and map editors' picks): fetched 2.5 s after the game runs, its trees built in the background a mesh a moment
  ('indirect', so faceIndex and interiors.js's index swaps stay as they were; a mesh that keeps changing keeps three's own), and a hidden mesh (or
  one in a hidden group) no longer looked at by any ray. `?bvh=0` the old rays. `tests/bvhcheck.cjs`: 169 rays over the street, every hit the same,
  2.5 s to 0.34 s (software rendering). **recast-navigation** (0.43.1, `src/nav.js`; owner, "do the other 2 now") for `CITY.route`: a navigation
  mesh a level (and the street walkers' own, STFREE's) made in a worker 4 s after the game runs (some 1 s each, never on the page's thread), made
  again when the solids grow; every route it finds checked leg by leg with the walker's own test, the A* when that fails or no mesh yet (and for a
  walker held up again and again). Measured over 182 routes between the places: 10.1 ms to 0.5 ms a route, the most 162 to 30. `?nav=0` the A*
  alone, `NAV.stats()`. **BatchedMesh** (three r160's own, no upgrade): the park's things (`mesh()` in `park.js`: rocks, undergrowth, the stalls,
  the campfire, pillars, pots) each a piece of one BatchedMesh, culled piece by piece; `?bm=0` the old. **The water culled**: every water body
  (`waterBody`, water3d.js) had `frustumCulled=false`, so the pool (1000 tiles off) and the ponds were drawn from everywhere; now bounds with room
  for the waves. Measured (`tests/tricompare.cjs`, all passes): the park 548,600 to 451,000 triangles, the bodega 611,200 to 504,500, Ghost Street
  292,700 to 257,500, the castle 184,900 to 163,300; draws 3-18% fewer; the pictures the same.
- **Lived in: weeds, bricks, the dark side, the toys alive** (owner, 18 Oct 2026): **weeds** at the foot of everything solid out of doors (`src/weeds.js`, after `clip.js`: every FIX box's edges sampled every 0.2 tile, thick where a broad noise says neglected, none where swept, now and then a dandelion; crossed cards swaying in the park's wind; chunks of 32 tiles; some 14,000 tufts, 4 triangles each, one program, no lights). **The bushes** sway as the oaks do and their leaves are mottled (`park.js`). **One brick pattern** ("just make a brick pattern that you can reuse": `BRICKS` in `gamekit.js`, global): `BRICKS.face` (courses of 6 texels, stones 8-12 long each its own length, a tone and a warm / cool / sandy tint each, top edge lit, foot shaded, worn corners, hairline cracks, moss low in the joints), `BRICKS.one` a single brick, `BRICKS.quoins` a post's corner bricks each its own box (long and short in turn, each out its own hair, a notch between: the corner's edge steps "up and down" brick by brick); the park's walls and posts use it, the posts a fifth of a tile larger each way. **Nothing black** ("nothing should be black like this even at darkest give it 5-20%"): every world face keeps at least a fifth of its own colour however unlit (`FLOOR` in `map-pre.js`, `?floor=N`). **The toys alive** ("all the toys should be sentient real characters, not objects. get rid of the table"; `src/npc-toys.js`): the stall's table gone; the six toys (bear, monkey, penguin, pig, sheep, bunny) each cut into head, body, arms, legs on bones (RIGNPC), walking the town with a toy's waddle, and standing, now and then a thing of their own (wave, hop, dance, sit, spin, sniff); some 6,700 triangles the six.
- **The sun's shadows still as he walks** (owner, 18 Oct 2026: "the lighting still looks glitchy when i walk, its changing pixels to quick and too fast. needs smooth shadow movements not so jumpy"; `clock.js`): the sun's shadow camera followed him to the hair, so its texels slid over the world and every shadow's edge crawled as he walked; it now moves only by whole texels of its map along the sun's own axes (the standard texel snap), so the shadows lie still on the ground, and it's redrawn every frame (every other frame had left moving shadows a frame behind on alternate frames). Measured walking east at 3:30 pm, the picture's slide taken out: 7,080 pixels changed a frame to 5,745, the rest the walkers, their shadows and the weeds' sway; at 9 pm the world's light was already still (only the characters change). Cost: the sun's shadow pass every frame instead of every other.
- **The bearded Walker** (owner, 18 Oct 2026, the old game's Walker sprite in six turns: "lets add this to the game as a new walker, 3d"; then "make
  his feet flat, give him hands and fingers, normal size nose, smaller head, jawline, normal posture", "give me 6 mockups of possible", "allow to
  edit all the face and body properties in editor" (his pick: both, with a switch), "need diff head shapes"; `src/npc-walker2.js`, `BWK`): a Walker
  built as the guitarist is (the player's shapes, `figureMesh`), in the sprite's colours (materials of his own, `bw_*`, so YOUR LOOKS never change
  him), short hair, a beard (the one Walker that wears one: the sprite has it), round eyes, the player's hands and fingers, flat soles, his head sat
  back over his neck; he roams the whole map on the rig's walk (`ROAM.pick`, `stfree`). His face and body are `BWK.F` and `BWK.EB`, kept in the save
  (`bwk`), his head made again from them (`BWK.remake`). **The avatar editor edits both** (`src/avatar.js`): BODY's WHO (YOU / THE BEARDED WALKER;
  him held a step to your left, facing the view, while he's edited), HEAD SHAPE (ROUND, OVAL, SQUARE, LONG, WIDE, HEART, PEAR: `ED.HEADS` in
  `editor.js`, the head, hair and eyes together), FACE (nose size and length, jaw width and square, chin, ears, eyes), BEARD and the six mockups' looks
  (his only), HEIGHT and every region slider. Yours: `ED.face` reshapes your head and eyes from their first shape as a sculpt does (kept, undone;
  the save's `face`). The mockups: `?bwk=1..6`. His sheet: `?sheet=walker2`. Cost: some 17,000 triangles, one draw a pass, no lights, no new program.
- **CEL, ALWAYS: NO SMOOTH LIGHT, A HARD RULE** (owner, 18 Oct 2026, his picture of a pixel-art face: "i want this kind of shading at all times ...
  solid colors, but pixelated, not gradient, i dont want gradients ever in the game beacuse it stops looking pixelated"; of the mockups,
  https://claude.ai/artifact/1epa3LR2QUYZmCWyfmyUjz: "3-5 flat as option in menu - do not use smooth light under any circumstances hard rule"):
  every face's light cut into 3, 4 or 5 flat bands (`CEL` in `map-pre.js`; GRAPHICS' LIGHT BANDS, the save's `bands`, 4 the default; `?cel=N`),
  no grain, no blend; each band down a little cooler and bluer (`HUE`, the warm-lit, cool-shadow shift of his picture); hard shadow edges
  (`BasicShadowMap`, always); the characters' light in the same flat steps with the same cool shadows (`W3.setShade` never smooth, its steps the
  bands, the avatar editor's SMOOTH button gone); the lamps' pools flat rings; the sky in flat bands; the haze (every material's fog) in 8 flat
  steps; the river's water in its steps only. `SMOOTH` stays in the code as `false` for what still asks it. **Never bring back smooth light,
  soft shadows or gradients without his word.**
- **The street's works** (owner, 18 Oct 2026: "rounded"; "add bike lines, (if not in already)"; "make sidewalk on central park side 2x bigger";
  "make sure they have curbs and drains and sewers in right spots"; "put one large tall street light on corner. lighst in both directions, functions
  correctly"; `bodega.js`'s street works, `bodbuild.js`, `map-post.js`, `dress.js`, `grid.js`): **rounded kerbs**: every corner where two of the
  loop's roads meet a quarter circle of 1.6 tiles (`KR`, `CORN`): the six where a sidewalk's corner stands out on the road (the main street at the
  west street's and the Avenue's mouths, both sides; the park's two back corners) cut back, the two where the outer sidewalks wrap round the north
  street's ends filled out; one test of the road (`ROADAT`) for the pictures, `groundY` (a step down the kerb follows the curve) and the land's
  holes (two outlines round the curves, `BOD.roadPolys`); the curves' kerb faces six straight pieces each (`BOD.kerbArcs`). **Kerbs everywhere**: the
  granite top painted along every sidewalk edge that meets a road (`SW`: the far sidewalk's ends at the west street and the Avenue had none), the
  straight faces trimmed to the curves, the main street's two road ends given faces. **Bike lanes** (there were none): along both kerbs of every
  road of the loop, green from a hand off the kerb, 1.2 tiles wide, a white line on the road side, a white bike stencilled every 22 tiles; dashed
  past a side street's mouth, stopped at the curves and the crossings (`LN`). The crossings by a curve set back past it (`XW`). **Drains**: a storm
  drain every 28 tiles along each kerb and just before each curve (not on a crossing): a grate in the gutter and the inlet's dark mouth in the kerb's
  face (`BOD.kerbFaceAt`); **sewers**: a round iron cover (frame, waffle, ring, rust) in the traffic lanes every 40 tiles and in the middle of each
  crossing of two roads (55 drains, 19 covers); all painted into the ground's and kerbs' pictures. **The park-side sidewalk 12 tiles** (`BOD.MAP.y1`
  FAR+12), the park, the castle (`LAYOUT0.castle` y 25.5), the north street and the force field 6 more north (`NORTHY` 9); the gate, crosswalks and
  lamp posts follow. **The corner's light**: on the park's corner of the main street and the Avenue, just in from the curve: a cast foot, a pole a third
  taller than the others, two arms (one over each road) with braces, a head and a lit lamp at each end; two of LITE's lamps (55, 16 tiles), on at dusk
  with the rest, each its pool; solid at its foot; one pole of the grid's inner ring with both lamps (`L2`, `h2`); no other light within four of it
  and none on a curve's road. **Cost**: some 110 triangles of kerb curves and corner squares, the light's 16 instanced pieces, 2 lamp records (no new
  light slot, no shadow, no program); the street's atlas 7,014 to 7,606 rows (the wider sidewalk; the cap is the GPU's texture size, 8,192 in software
  rendering: little room left there). `STREETQ()` a test's look. Not done: a kerb ramp at the crossings; the NW corner not looked at (a block in the
  shot's way).
- **The lawn's tufts** (owner, 18 Oct 2026: "lets add the tuft grass from grasslab into the game"; the Grass Lab's option 4, https://claude.ai/artifact/VYHdVVsXc5nufH6ptqGg8X; `WEEDS.lawnInit` in `src/weeds.js`): over every lawn in sight (the land's sheet and the park's hills, only where one of them is the top surface: never on a way, sidewalk, plaza or floor), tufts of two crossed cards painted with fourteen blades, each its own size, turn and green, swaying in the park's wind, lit in the flat bands. Made only round you in chunks of 8 tiles (a tiny top-down picture of the chunk says which half-tile squares are lawn and their height: two draws and a read back, some 15 ms a chunk, one a moment), dropped 3 chunks off; each chunk one instanced draw with its own bounds. Measured: 25 chunks round you, 6,548 tufts (4 triangles each); the whole screen 48,100 triangles in the park.
- **The golems' cave and the gem trade** (owner, 18 Oct 2026: "make a cave in central park where the golems live, they buy any kind of rare gem
  or crystal, etc."; `src/cave.js`, `src/gems.js`): a rocky outcrop on the park's north-west lawn (21 tiles west and 15 north of the round, clear of
  the ways, the shrine, the castle, the pond and the park's big rock; placed from PARK at run time, `GCAVE.keep`, which park.js's hills, oaks and
  bushes keep off), its mouth east toward the round: a low dome of rough grey stone on a rounded-square footprint (10 x 10 tiles, 3.7 m high,
  every face its own grey, moss low, lichen), boulders round its foot, jambs and a lintel at the mouth. Inside: a dark stone floor, crystal clusters
  glowing violet, cyan and rose along the walls (unlit, they're the light), THE TRADING STONE at the back, four sitting stones, beds of moss, a heap
  of geodes; its light one lamp record (LITE, `userData.both`: it lights the cave and spills out of the mouth at night). Its own room for rooms.js
  (only the cave drawn inside; its crown above the room's top cut so you see in). Built a moment after the game runs. **The golems live there**
  (walkers.js's `golem`: `GCAVE.haunt`): all twelve together, in the cave at night (21:00 to 7:00), by day mostly at the round, an hour now and
  then at the mouth or inside (the same hour for all); the cave's box is theirs (every other walker keeps out of a room). **THE GOLEMS BUY**: a
  double click on a golem or on the trading stone opens the panel (X, drag: `gemp` in PANS): ten stones and their prices (quartz crystal $6,
  amethyst $14, geode $18, fossil amber $24, moonstone $30, opal $45, emerald $70, sapphire $85, ruby $100, star meteorite $150), what you carry,
  SELL and SELL ALL. **Your pockets** (`INV`): your cash is your mailbox's (`MAIL.you.cash`, one purse with the rent and the bills; its own $100
  with `?mail=0`), your gems in the save (`inv`). **Where gems come from for now**: the four glints on the cave's floor (a double click: a gem at
  random, the rarer the less often; each back when the day turns) and THE ODDITIES STALL by the gate (a gem of the day). The golems' lines
  (`golem` in lines.js). Cost: the dome some 310 triangles, its boulders and stones about 50 instances of 36 (one draw), the crystals and glints
  about 50 of 8 (one draw, one unlit instanced program), the floor 120; one lamp record, no shadow, no new light. `GEMDBG()`.
- **The squirrel's tower and its knight** (owner, 18 Oct 2026: "remove the tower from the dungeon/castle area, make it 3x small put it in corner
  of central park near main, small squirel in knight armor with sword on top"; `src/tower.js`, `src/npc-squirrel.js`): the keep stays off the map
  (nothing of it in the castle; `?bring=keep` still sets the full one in the bailey for a look); in the park's front-left corner, inside the walls
  by the main street, the keep made again at a third of its size: 3.2 x 3 tiles, 173 px (5 m), its four corner turrets a little higher, a
  crenellated parapet round its lead roof, its faces the keep's own painter (keepOutWall) read three of its pixels to one (the darkest of three,
  so the mortar, slits, windows and string courses stay), its door a squirrel's; solid, no way in. **THE SQUIRREL KNIGHT** on its roof, 0.55 m,
  built in parts on bones in the tomato's style (npc-rig.js): grey-brown fur, cream muzzle, ears up through a steel helmet, its visor on a hinge
  (lifted now and then), a red plume on a spring, breastplate, pauldrons, a belt, a small sword held up before him, his bushy tail in three
  pieces on springs; on guard, turning to look out over the street, the corners or the park every 6 to 15 s, his head looking about between.
  `?sheet=squirrel`; `SQDBG()`. The menu's MORE PLACES has THE GOLEMS' CAVE and THE SQUIRREL'S TOWER. Cost: the tower some 120 faces in its own
  batch (one draw), the squirrel some 1,660 triangles, his own shadow map as every character; no light.
- **New York's markings and signs** (owner, 18 Oct 2026: "Not green bike lanes. Use NYC markings and steermt signs etc everywhere"; `bodega.js`'s
  street works, `bodbuild.js`): **the bike lanes** bare asphalt (no green anywhere), the solid white line, every 22 tiles the white bicycle with two
  chevrons ahead of it pointing traffic's way; **the double yellow** down every road's middle, broken at crossings and junctions; **stop bars**
  across the half of the road whose traffic comes to each crossing; **the crossings** NYC's ladder (two rails across the road, wide rungs along the
  traffic). **The signs** (`BOD.signs`, drawn into the street's pictures as thin boxes, words in a 3x5 pixel letter read from either side, cut out by
  the batch's alpha test): a galvanized post at every corner with the two streets' green name blades crossed (MARKET ST, WEST ST, NORTH ST, THE AVE;
  two more across the main street from the side streets' mouths), STOP where the west street and the Avenue come down to the main street, and along
  every kerb every 24 tiles a NO PARKING plate (every third a SPEED LIMIT 25), each .75 tile in from the kerb, clear of the street lights' feet.
  66 signs. Cost: some 1,600 triangles in the street's batch, no lights, no programs. Not done: a traffic light (the owner took the kit's out).
- **(SUPERSEDED the same day: "Literally make the grass like treetops", below)** **Never leafy grass** (owner, 18 Oct 2026, of the grass mockups https://claude.ai/artifact/WfQ5tdKVCmb1jJEAeAEXL5: "No leafy grass never"):
  grass is never made of leaf clumps, little crowns or the trees' leaf mottle. The grass he's weighing is blocky blades: thick straight square
  posts of flat colour (a darker foot, a lit top) flowing in one smooth wind; his picks so far "1 and 2" (short blocks with chunky tufts) and
  a flat one (long blades lying nearly down, swaying in waves). **His pick: "Only swaying smooth"** (the flat one, in the game: below).
- **The lawn's grass flat and swaying** (owner, 18 Oct 2026: "Only swaying smooth"; `WEEDS.lawnInit` in `src/weeds.js`, in place of the card
  tufts): over every lawn in sight, clumps of four long thick blades of flat colour lying nearly down (tips 6-14 degrees up), combed one way, in
  the lawn's own four greens; one smooth wind rolls over them in waves (a slow swell and a cross ripple by where each clump stands, `PARK.windK`
  its strength), sliding and lifting the tips, the roots still. Same chunks as before (8 tiles, made round you, dropped 3 off). Measured in the
  park at 3:30: 39,840 triangles in the picture (93,440 in all the chunks round you; the old tufts some 15-20,000 in the picture), one program,
  no light, a chunk 15-17 ms to make.
- **Everyone's cottage, the start** (owner, 18 Oct 2026: "make it anyone's cottage who starts ... fill entire floor of apartment"; his picks: one big cottage room, the game's pixel style, the first visit only; `apts.js`, `where.js`): the apartment house's ground floor is the old game's Herb Cottage, its own pieces from its own makers ("Preset Herb Cottage 1": the fig, the tables, the red bookshelf, the long table on its roots with the lamp and candles, the rugs, the writing desk, the wood stove, the stump with pumpkins, the shelves, the garland, the portrait, the clock, the screen, the cabinet...) spread over the floor's 7.5 x 14 tiles (a piece against a wall keeps that wall; the cabinet, the screen, the print, the clock and a shelf moved off the windows and the door), the window's branch rod with its hanging pothos and the green drapes at all five of the floor's windows, the inside walls the cottage's moss plaster, its candles live flames, its six strongest lamps the floor's own (lit only while you're in). A new player (nothing kept in `market-where`, or `?fresh=1`) starts in it (`MODS.apts.home`); after that, where you left off.
- **The computer and the delivery drone** (owner, 18 Oct 2026: "bring back pc with drone delivery you can view 1st person"; his pick: the bodega's goods; `src/drone.js`): an old beige computer on the cottage's writing desk (its screen green); a double click opens DRONE LINK (the bodega's shelf with prices, your money: the mail's purse; ORDER; DRONE CAM). The drone (a little quadcopter of blocks, its light green at home, red out) is parked on the bodega's door frame, rotors still; an order sends it up over the street to the house's middle front window, where it turns to face in, hovers, and the parcel drops inside on the floor; then home, parked. DRONE CAM looks from just behind it (the room's cut-away and the house's ceiling cut lifted while it's on: rooms.js, `APTS.HP`), the HUD's frame and LEAVE DRONE CAM; a double click on the parcel opens it (the thing left on the floor). The bodega's stock and till take the sale. `?dronek=N` flies it N times as fast (a test's); `DRONEDBG()`. Cost: the computer some 60 triangles, the drone some 150, a parcel 12; no lamp; nothing a frame while it's parked.
- **The grass made like the treetops** (owner, 18 Oct 2026: "Literally make the grass like treetops", then, asked whether that meant the first
  mockup's LEAF CARPET over his earlier "no leafy grass never": "Yes, like treetops"; `WEEDS.lawnInit` in `src/weeds.js`, in place of the flat
  blades): over every lawn in sight a low carpet of the oaks' own stuff: faceted leaf clumps (a flattened icosahedron each, 20 triangles, a half
  tile square apiece, its own size and turn), each lit as one round shape like a crown (normals four fifths out from its middle), the crowns' leaf
  mottle in the world over them (park.js's treeLook numbers), a step darker at the foot, the lawn's four greens; a smooth wind rolls over them in
  waves, the tops leaning, the feet still. Same chunks (8 tiles, made round you, dropped 3 off; the characters left out of the chunk's lawn
  check, so no bare patch where someone stood). Measured in the park at 3:30: some 24,600 triangles in the picture (58,000 in all the chunks
  round you), one program, no light, a chunk 15-18 ms to make. Its leaf mottle hashes cells wrapped to 256 first (far from the middle sin() ran
  out of digits and the mottle drew streaks).
- **The apartment house's floors, from the old game** (owner, 18 Oct 2026: "bring back entrance lobby elevator stairs and hallway from 1st game
  and make it fit in new apartment 1st floor"; his pick "cottage on every floor"; `LOBBY` in `src/apts.js`, superseding `HOLLOW`): the ground
  floor the old lobby (black and white tiles, mailboxes, a bench, a plant, the directory), a hall back to the core; the core at the back-west
  corner: U stairs (two flights of ten steps a storey, a landing between: `APTS.ground` gives their slope) and the freight elevator in its
  shaft (a cabin you stand in and ride at a lift's pace, steel leaves on every floor, a call button by each door (double click), the floor
  buttons in its panel while you're in it with the doors open; `ELV`, `ELVDBG()`); the 2nd floor the herb cottage (everyone's start room, the
  PC and the drone's window with it: `APTS.cotLv`, `drone.js`); floors 3 to 5 a carpeted hall with two numbered doors each (shut). Fire escapes
  front and back as before. Cost: some 6,000 triangles the floors and walls, one lamp in the lobby's hall, one in the core and two in each
  upper hall (LITE's eight nearest), no new program.
- **The newsstand** (owner, 18 Oct 2026: "Newsstand with newspaper cat character already in game. He runs it. Drones deliver newspapers every
  morning. Realistic stand with real inventory / NYC style / Give him all the animations he will need"; his pick: by the subway entrance;
  `src/newsstand.js`): a green New York kiosk (2.6 m) on the main street's sidewalk east of the Metro's opening, its back to the empty lot:
  NEWS on its lit header, LOTTO, the overhang's tube, the roll-down shutter, papers on a stepped rack (THE DAILY ODDITY, METRO HERALD, THE
  FLEA TIMES, MORNING BUGLE: each stack as high as its stock), magazines up the posts and on both sides, candy and gum on the counter, snacks
  on the back shelves, the drinks cooler. THE CAT IN THE RAINCOAT runs it, held on a crate behind the counter (`npc-toons.js`'s `c.extra` and
  `c.busy`): reads, waves as you come up, serves and counts change, tidies the magazines, stretches, yawns, dozes in the afternoon lull,
  opens the shutter at 5:45 and pulls it down at 10 pm, dozing behind it at night. At 5:30 two delivery drones bring four bundles; he heaves
  each up, cuts its twine, a stack grows by 25. A double click: stock, prices, the purse (`DRONE.purse`), BUY; a paper shows its front page.
  `NEWSDBG()`, `NEWS.deliver()`, `?newsk=8` the drones faster. Cost: some 2,100 triangles, the drones 300 while they fly; no lamp, no program.
- **The buildings' outsides** (owner, 18 Oct 2026: "realistic exterior like pipes going up on corners, rooftops being realistic"; his pick:
  all three on main; `src/rooftops.js`, superseding 17 Oct's "nothing on its roof"): leaders up the corners (scupper, leader head, brackets,
  shoe; the house's dark, the bodega's galvanized, Ghost Street's copper); parapets with coping on the flat roofs; on the house the water tank
  on its stand, the stair bulkhead, the elevator's machine room, chimneys, vents, soil stacks, a TV antenna; on the bodega an AC unit, an
  exhaust fan, a skylight, vents. Cost: 2,500 triangles, three instanced draws; no lamp, no program.
- **Kerb ramps at the crossings** (owner, 18 Oct 2026, "go all" to the street's open items; `bodega.js`'s street works, `bodbuild.js`, `map-post.js`):
  where each crossing (`XW`) meets a kerb, New York's pedestrian ramp: the kerb cut down to the road in a slope 0.75 tile into the sidewalk, as wide
  as the crossing's middle (2.4 tiles at most) and only along a straight kerb (beside a curve it keeps off the curve), the yellow warning pad of
  raised domes at its foot (`BOD.ramps`: 18 of them). The sidewalk's picture and the kerb's face open there, the slope its own face (wound up, so
  snow lies on it), two triangles of kerb face its sides, `groundY` down it (no step), the land's sheet holed under it. The gate's blue collection
  box moved east off its ramp (`mail.js`). Cost: 18 slopes, 36 side triangles in the street's batch; no light, no program.
- **The traffic lights** (owner, 18 Oct 2026, "go all": "a traffic light"; `dress.js`'s `TLX`): at the main street's two junctions (the west
  street's mouth and the Avenue's), each on the outer corner by both crossings, of blocks the street's way: a grey pole, a mast arm over the main
  street with two heads back to back, a head up the side street on the pole, two WALK / DON'T WALK signals (the orange hand, the white walking man,
  5 x 7 glyphs of blocks) across the two crossings. The lit lamp a bright unlit block, the others dark (no real light); a 44 s cycle, the main
  street green 18, amber 3, all red 2, the side street 16, 3, 2; the people beside the moving traffic WALK, the hand flashing before the change.
  The corner's street-name blades now ride its pole above the heads, and the two STOP signs at those junctions are gone (the light rules there).
  Nothing drives the roads now (the city's vehicles are gone), so nothing stops for it. `TLX.phase(t)`, `TLX.at`. Cost: some 70 blocks in the
  street's block draw, about 110 lamp and glyph blocks in one instanced draw (MeshBasic, the lanterns' program), some 1,300 triangles; colours
  rewritten only when a lamp changes.
- **Wet ground and lying snow** (owner, 18 Oct 2026, "go all": the weather's "not yet: wet ground, snow lying"; `map-pre.js`, `lookfx.js`): how wet
  and how snowed on (`lookfx.js`: wet in half a minute of rain, dry over four minutes or two of the clock's hours; snow lies over a minute and a
  half, melts over five or three hours, rain melts it in one; at the start what the last three hours' weather left, `WX.at`; 0 inside or
  underground) go to LFX.env's last row, and the world's one lit shader reads them on every face facing up, before the cel bands: WET, a third
  darker (grass less) with still puddles (fixed hard-edged blobs on paving and road, not on grass, not above knee height) of the sky's colour laid
  flat over after the bands; SNOW, white patches growing from a fixed noise till all is covered, roofs and the tops of things too, melting back
  the same way; the lawn's grass and the weeds hidden while it's deep. `LFX.shade` is now always on (the ?fx= switches each their own part; the
  old `?fx=wet` look replaced by this). `?wx=rain`, `?wx=snow`; `WETQ({wet,snow})` a test's look and set. Cost: no program, no texture, no light; a
  few instructions a fragment. Not done: puddles on floors seen through a doorway from outside can show (they're under 0.4 m and face up).
- **The apartment house tried and lived in** (owner, 18 Oct 2026, "go all" to the open items; `apts.js`, `residents.js`, `newsstand.js`, `rooftops.js`):
  **Tried**: the lift ridden from the 2nd floor to the 5th and walked out of; the U stairs climbed from the 2nd to the 5th and into a flat (both fine).
  **Found and fixed**: on the stairs' landing and in the lift (against the back wall, inside a room's half-tile margin) you weren't "in a room", so
  the whole world and the river drew round you: above the ground floor the house is all one room to its walls (`rooms.js`); a character on
  another floor held up a walker under him (makeNPC's "you're in my way" now counts your height, `npc-map.js`); the cottage's candles weren't live
  flames (the call was HOLLOW's only: 19 flames to 46). **One quad a wall side**: every wall that cuts away is one picture a side with its holes
  clear (the alpha test), where it was a piece between every hole: the house's draws on the 5th floor 651 to 245. **THE FLATS**: twelve on the 3rd
  to 5th floors (3A-5D: A and B west of the hall, C and D east, the back one first; a wall between each side's two), each a small studio from the
  game's studio set (`put`, the catalog): fridge and sink and counter along its back wall with a shelf and a plant, a table and a stool, the single
  bed along the outer wall under a poster, the wardrobe by the door's wall, a floor lamp, a vacuum in some, a TV in the long east-back ones; a warm
  lamp record each (LITE's eight nearest, lit only while you're in). Its door a leaf on its hinge with a knob, a brass number over it on the hall's
  side: it swings in as you come up to it (or one who lives there), a double click holds it open (`UI.thing` DOOR 3A ...), the doorway blocks while
  it's shut (`APTS.flats`, `APTS_F()`). The mail's flats are these twelve (`mail.js`). **THE RESIDENTS GO UP**: hero_m 3B, hero_f 3D, villager_m 4A,
  villager_f 5C; home in the evening he walks in at the front door, through the lobby and hall, up the U stairs a storey at a time, along his hall,
  through his door, and stands in his flat (`APTS.way`, `APTS.gnd`: the floor at his own height); in the morning the same way down and out to his
  errand; a home at the game's start is in his flat already. Seen only while you're in the house on his floor (`N.mode` 'indoor' / 'hidden'); you in
  his way in a hall, he squeezes past. **NEWSSTAND CUSTOMERS** (`NEWS.call`, `NEWS.customer`): a few times an hour while it's open (six an hour
  before ten, two and a half after) one of the town's walkers standing about within thirty tiles (not a golem, not on a job) comes to the
  counter's front, the cat serves him and counts his change, a paper off its stack, he looks it over a moment and walks on (`NEWSDBG().sold`).
  **GHOST STREET'S ROOF** (`rooftops.js`, read off its roof's own slices): a brick chimney with a stone cap and a pot through the back slope by the
  east gable, a lead vent pipe with its collar and hood on the front slope, a copper lightning rod with a glass ball on the ridge's west end, its
  cable down the gable. **Cost**: the flats some 5,000 triangles on the 5th floor's screen (136K to 141K there, already over the 100K before them),
  12 lamp records, 12 leaves and knobs (one program); the roof's bits about 20 more instances; a resident indoors his rig as before. Not done: the
  lift for residents (they take the stairs); sitting or sleeping in the flats; a resident reading a paper he bought (he looks it over standing).
- **The Metro's benches are seats** (owner, 18 Oct 2026, "go all", the Metro's open items; `metro.js`, `use.js`): a double click on one of the
  platform's three benches walks him up and sits him on it, facing the platform, till a key or a walk gets him up (the kit's benches aren't the
  batch's, so each has a hidden box to be clicked by, in the level under the street's group, and its seat found from the kit's faces round it,
  as the park's sitting log's: `METRO.seats`, `METRO.things`). Cost: three invisible boxes, nothing a frame. **Found on the way** (`rooms.js`):
  the first room entered (a fresh start is in the cottage) gave every material the near-side cut's two planes in place of its own, so every cut
  wall (the Metro's, the castle's, the stored rooms') stopped cutting for good; a material with planes of its own now keeps them.
- **Rats in the Metro** (owner, 18 Oct 2026, "go all"; `npc-creatures.js`): three of the street's rats (the pack's rat, its clips and its
  mottled fur) under it: two over the platform between the track's edge and the back wall, one along the tactile strip at the edge; on the level
  under the street (its group: drawn only from down there; unseen, neither drawn nor run, as every character), on the platform's ground, out of its
  solids, never past the gates or over the edge. Cost: 2,196 triangles a rat where seen, no light, no program.
- **The Metro's way out signed** (owner, 18 Oct 2026, "go all"; `metro.js`): a black sign hung from the platform's ceiling before the gates,
  TO STREET with an arrow ahead on its platform side and TO TRAINS on the gates' side, in the street signs' white 3x5 pixel letters (painted once
  into a 49 x 11 picture, the kit's 18 texels a metre, lit a little from inside), on two dark rods; not overhead-hidden, so it reads from the
  isometric view. Cost: 36 triangles, two small pictures, materials made as the kit's (no new program), no light.
- **Riding the Metro's car** (owner, 18 Oct 2026, "go all"; `metro.js`, `build.py`): standing in the car (through its open doors on the
  platform's side) when its doors shut, you ride: it pulls out east into the tunnel, waits a few seconds in the dark (6 s with you aboard, 45
  without), comes back out, slows to the platform and opens; you walk out through a door. Carried by the car's own move each frame, before you
  walk and are drawn (the train's clock now runs first in the frame); a double click's spot goes with the car. Its solids follow it (`lay`): at
  the stop with doors open, the track's box round the car, its far side, its platform side between the three pairs of doors (a gap each); shut,
  its side whole; gone, the track whole again; the map's bound reaches along the tunnel only while you ride. Inside it (riding or not) the car is
  cut to its floor as a room's walls are, and while riding the tunnel's walls cut and its roof overhead, so the isometric view finds you; the
  perspective views see the car's inside (seats, poles, windows). A lamp in it lit only while you ride (one of LITE's eight). Tested in the
  headless page: walked in, rode out and back, couldn't walk through either long side while moving, walked out through a door at the stop.
  Not done: its seats and poles aren't solid (you walk through them), no sitting in it; the cab door stays shut. Cost: 2 tunnel quads now their
  own meshes, 6 solid boxes reused, one lamp record; nothing a frame but the boxes set when the car moves or its doors change.
  **Found on the way** (`apts.js`): leaving the apartment house handed back the street's solids whatever level you were on, so a jump from the
  house to the Metro by the menu (or a fresh start then THE PLATFORM) left the street's solids under the platform: you walked through its
  benches, columns and the car; now the level you're on's.
- **The grass still till someone walks through it, half as tall** (owner, 18 Oct 2026: "i only want the grass moving when someone is walking
  through it or disrupting it. make it 50% les tall over all"; `src/weeds.js`): no wind on the lawn's grass or the weeds; up to eight walkers
  near you (you first, `WEEDS.movers`) part the blades round their feet, tips pushed out and pressed down (`WEEDS.PART`, one loop in the same
  programs), standing back up behind them. The lawn's blades and the weeds' tufts half as tall; the dandelions lower with them, eight faces each
  and in the tufts' chunks (they were one mesh of 1,125 twenty-face balls over the whole map, the lots off the map too: nothing's made for
  what's off the map now). **The clouds** twenty faces a puff (`weather.js`: 38,400 to 9,600). Measured (tests/trisby.cjs, 11 am): the street
  204,070 to 180,602 triangles in the picture, the park 243,596 to 212,904. **Still over the 100,000**: the walking guitarist 30,300 (his
  fingers and guitar whole), the player 15,000, the batches' street and buildings, the river 8,100, the oaks 11,000.
- **The treetop grass flat** (owner, 18 Oct 2026: "I don't want the grass round ... flat and covering ground. Imagine the treetop exactly";
  `WEEDS.lawnInit`): each leaf clump a low flat canopy (its height a sixth of its width, the middle facing up, the rim turning down as a crown's
  edge does), more than twice as wide as its half-tile square so they overlap and no ground shows: the lawn reads as the top of one tree seen
  from above; the wind a gentle lift and slide. The chunk's lawn check now skips invisible hit boxes and toon-lit character pieces (both had
  left a bare patch where you stood). Cost as before: some 19,700 triangles in the picture, one program, no light.
- **The treetop grass in a variety** (owner, 18 Oct 2026, of the mockup https://claude.ai/artifact/Mj4zkmdHJhGk6ZKsPsC4Rr: "Imagine way bigger
  trees", then "Do a variety all over the park"; `KIND` in `WEEDS.lawnInit`): the lawns cut into patches some 24 tiles across (each half-tile
  square takes its nearest patch's seed), each patch one kind: the flat canopy, the rolling canopy, little crowns, big crowns (4-5 m), giant
  crowns (6-8 m), big crowns pressed flat, and (owner: "lets do tuft too") the Grass Lab's card tufts, two to a square, the lawn's picture between
  (the weeds' own program, a second instanced draw in the chunk). A crown kind lays a grid of crowns (each its own place, size and green), every square's clump domed
  by how near its crown's middle it is, its rim a step darker and lower: the treetops of a forest seen from high above. Every lawn, not only the
  park's. Still one clump a square, the cost as before (some 20,000-25,000 triangles in the picture), one program, no light.
- **Mushrooms, foraging and the crafts, UO's way** (owner, 18 Oct 2026: "lets do flat, tuft and the other kinds but spread out more naturally. each
  type of grass will have better chances of growing certain types of mushrooms. place the mushroom vendor by the main street with his booth of
  mushrooms. lets start on the crafting and skill system based around mushrooms. i want it basd on UO style"; his picks: FORAGING, ALCHEMY, COOKING,
  MYCOLOGY; classic UO gains; potions, food, selling, ingredients; the vendor on the park's sidewalk by the gate; `src/forage.js`, after weeds.js):
  **the grass kinds spread naturally** (`WEEDS.kindAt` in weeds.js: the patches' grid bent by two noises, their borders mingled a few tiles deep, islands
  of tufts in the other kinds and of flat in the tufts, the commoner kinds more of the lawn). **The mushrooms** come up on the lawns each day (a
  few a lawn chunk, from the chunk's squares: `WEEDS.onAdd` / `onDrop`), eight kinds, each grass its own odds (`GROWS`): MEADOW BUTTON, PUFFBALL,
  CHANTERELLE, RED CAP (poison raw), SHAGGY INK CAP, KING BOLETE, MOREL, MOONGLOW (glowing, poison raw); a forager sees one only up to 15 past his
  skill. A double click walks to one and picks it (FORAGING; a fail may crumble it); MYCOLOGY says what it is, or it's a STRANGE MUSHROOM to
  IDENTIFY later (half price, eaten at your risk). **The skills** (UO's): 0 to 100 each, tenths, the chance from where the skill stands between a
  task's min and max, a gain likelier low in the skill and on a task near your level (none from one you can't fail or can't do), 300 the total
  cap, each skill's arrow ▲ raise / ▼ lower (at the cap a rise takes from these) / ■ locked; the start 20, 20, 20, 15; the journal's lines bottom
  left ("YOUR SKILL IN FORAGING HAS INCREASED..."). **The crafts**: ALCHEMY anywhere (your mortar and pestle, a bottle a potion: REFRESH, HEAL,
  STRENGTH, KEEN EYE, CURE, GREATER HEAL), COOKING by a flame (a fire, a candle, a torch: ROASTED MUSHROOMS, PUFFBALL FRITTERS, MUSHROOM SKEWER,
  BOLETE SOUP, MOREL FRY); a failure loses the mushrooms. **Hunger** falls over some 45 minutes (hungry: stamina back at half; starving: no
  running); the buffs (poison, strength, keen, swift, regen) with their seconds. **THE PACK** (I; PACK, SKILLS, CRAFT tabs, X and drag: `packp`).
  **The mushroom seller** (his booth moved out onto the park's sidewalk east of the gate, its front to the street, `npc-mushroom.js`): a double
  click on him opens his shop (`shopp`): he buys every mushroom (a strange one at half), potion and dish, sells bottles ($2) and a mortar; the
  golems take morels ($34) and moonglow ($90) too. One purse (INV's); kept in the save (`forage`). Cost: three instanced draws (caps, stems, the
  glowing caps; some 20-40 mushrooms near you, 48 triangles each), an invisible box each to click, no light, nothing a frame but a day check.
  `FORDBG()`. Not yet: a hunger bar outside the pack, ingredients for crafts beyond these, mushrooms indoors or in the cave.
- **Ghost Street's ghosts: four sheets over invisible basketballs** (owner, 18 Oct 2026: "i want to add ghost in the game just floating sheets,
  realistic phyics, see through, they hang aruond the ghost street dojo, inside and outside, never strayig too far"; "smaller cuter"; "create the
  ghost by placing an invisible basketball in the air and the dropping a sheet over it, then let the basketball float around like a ghost - show
  mockups"; of the mockups https://claude.ai/artifact/JEzpXVT5rSUWGJNcKfva6T: "lets put those 4 ghosts as the main ghosts and keep those names and
  sizes"; `src/ghosts.js`, `GHOSTS.init()` after the rooftops): THE HAND TOWEL (round, 68 cm), THE PILLOWCASE (round, 104 cm), THE NAPKIN (square,
  72 cm), THE BEDSHEET (square, 124 cm, its corners trailing on the ground); each an invisible 24 cm ball floating at about half a metre with a
  real cloth dropped over it as the game opens (Verlet points, threads hard to stretch and easy to bunch, ten passes a step at 120 a second; the
  cloth grips the ball where it touches, so the ball carries it and the rest trails and swings; the ground stops it; anyone walking through
  pushes it aside); two dark eyes and a small mouth on the front, a little see-through (the world's Lambert in its bands, opacity .8). They
  drift between spots in the dojo's hall and its forecourt, bobbing, lingering and peeking your way, through walls if their way runs there; a
  double click says the name. Simulated only within 45 tiles on the street. Cost: 1,256 triangles the four, one program, no light. `GHOSTDBG()`.
- **Fishing on the Hudson and a rowboat** (owner, 18 Oct 2026: "lets adding fishing (off the hudson and in boats off shore)"; his picks: UO
  style, a rowboat to rent; `src/fishing.js`): BAIT & BOATS, a self-serve stand (an honesty box) on the quay at the pier nearest the Metro, its
  counter to the walk: a rod $15, a rowboat $5 a trip, and it buys your catch. With a rod, a double click on the river within nine tiles casts
  (else the river's options as before): the line and the bobber, three to eight seconds, a dip, and FISHING (a new skill, forage.js) decides;
  what bites goes by the bed's depth under the bobber (`RIVER.depthAt`): sunfish, white perch and blue crabs by the wall, catfish, flounder and
  shad further out, bluefish and striped bass deep, the Atlantic sturgeon deepest, eels twice as often at night; now and then an old boot, a tin
  can, a message in a bottle, a sunken chest (a gem and $10-40). Move off and you reel in. Fish dishes by a flame (FISH FRY, SMOKED EEL, GRILLED
  STRIPED BASS, FISH CHOWDER, STURGEON STEAK); raw fish edible, risky. THE ROWBOAT: you sit at its thwart (the rig's sitting), WASD rows (it turns
  toward the way you press, glides, stops still), anywhere inside the force field, never through a pier; STEP ASHORE at a ladder or pier (the
  boat goes back). build.py's three hooks: the steer before the walk, carried instead of swimming, its height for yours (`BOAT`). Cost: the stand
  some 30 boxes (one draw) and its sign, the boat 14 boxes, the line and bobber while fishing; no lights. `FISHDBG()`.
- **The deep mines under Central Park** (owner, 18 Oct 2026: "gems and finding them in in deep cave mines"; his picks: on the map, entrances in
  the park and "like a tunnel you take through the subway tunnel", every layout, every sci-fi tool, no pickaxe; `src/mines.js`): one network on
  a 2.5-tile grid under the park inside the loop, cut through rock at the loop tunnel's depth and stepping down further in (some 6 m deeper at
  the far ends). FOUR WAYS IN: a gap in the loop tunnel's inner wall on the main street's leg (`RING.mine`, sub.js; walk in), a steel hatch on the
  park's lawn east of the round with a lift, a crack in the golems' cave's floor with a stone lift, and THE DAY'S HATCH at the end of that day's
  deepest branch. The spine joining the fixed ways in is the same every day; eight branches are cut afresh each day (the calendar day's seed),
  each ending in a cavern. SEAMS of the golems' ten stones hidden in the rock faces, rarer the deeper, unseen till scanned; a mined seam stays
  mined till the day turns. THE DEPOT (a terminal at each way in's foot) sells the RESONANCE SCANNER $40 (P or SCAN: a ping lights the seams in its
  reach for a minute, the rarer ones only for a skilled prospector), the CUTTER BEAM $60 (at the seam, a beam and sparks), the SONIC EXTRACTOR $90
  (a pulse frees every lit seam near you, loose on the floor; some shatter), the EXTRACTION DRONE $150 (sent from up to 14 tiles, the surest).
  PROSPECTING the skill (forage.js; the cap 400 with six skills). The mine's bar (depth, SCAN, the tool in hand) only down there; the rock nearer
  the camera than you cut above your knee so you see yourself. Cost (underground only): the rock some 450 boxes and the floors some 490 (one
  draw each), the lit seams one draw, 26 lamp records, no new light or shadow; built a few seconds after the game runs (nothing at the loading
  line) and again when the day turns while you're up top. `MINEDBG()`. Not yet: creatures down there, a map of the mine, the golems mining.
- **The swimming pool removed, the whole room** (owner, 18 Oct 2026: "when i jump into the hudson it puts me in the swimming pool? lets remoev the
  swimming pool from the game for now entire room"): while `apartments` is in `AWAY0` the apartment building is no longer built at all (not
  even at the far lot): no room, no pool, no pool water, no floats, no outside (`build.py`'s `wrap('pool')` sets only `POOLR`'s measures,
  empty `ROOMS`, `inBasin` null; `poolout` in `map-post.js`, `floats.js`, `WATER.feed`, the roof and the interiors all skip it). **The cause**:
  swimming, the page held you inside the pool's box whenever the river didn't claim you that frame (the moment a jump lands, before
  `RIVER.swim` turns on), and the pool stood 1000 tiles east; that clamp now needs you over the pool's basin. To bring the pool back: take
  `apartments` out of `AWAY0`.
- **The mist, the whole game's look** (owner, 18 Oct 2026, his picture of a misty autumn forest: "show me screenshots of how my game could look
  like this"; of the shots (`tests/moodshot.cjs`), the park by the cave at 5:24 pm, low: "i like the exact look entier game (no fireflies) just the
  foggyh misty haze ... in distance, perfect"; `FAR3.mist` in `src/skyline.js`): out of doors a teal mist, starting 3 tiles before him (toward the
  camera) and the full colour 12 past him, in the fog's flat steps; no sky dome in it, the background the mist's own colour, so the far melts away
  (the skyline gone in it). The shot's teal at dusk (0x3a6e68), a little paler at high noon, dark at night. GRAPHICS' DISTANCE HAZE: MIST, FAR (the
  old far haze and the sky), OFF; `?mist=0` the far haze, `?mist=near,far` in tiles. The weather's FOG takes over when it comes; nothing indoors or
  underground. Cost: none (the same fog). Not taken: the shots' autumn treetops and the embers / fireflies. `tests/mistshot.cjs`.
- **The newsstand smaller, newspapers only** (owner, 18 Oct 2026: "smaller newspaper booth, only real newspaper items inside, nothing else. show me
  mockups"; of `mockups/newsstand-small.html` (https://claude.ai/artifact/Dat98V8RVP9Ddx7xXkKSzh), "1": THE GREEN BOX; `src/newsstand.js`): the kiosk
  cut to 2.8 x 1.5 tiles and 2.3 m (was 4.8 x 2, 2.6 m), the same green steel, NEWS header, counter and shutter; the papers on three stepped tiers
  before the counter (the four titles, each tier's stacks its share of the stock), five front pages pegged on a line across the window's top (above
  the cat's head), three spare bundles in twine at his feet. No magazines, candy, gum, snacks, drinks cooler, change tray or LOTTO; the stand sells
  the four papers only. Cost: some 1,500 triangles (was 2,100). `tests/newsshot.cjs <out>`.
  2.5 s to 0.34 s (software rendering). Looked at and **not** taken: recast-navigation for `CITY.route` (the A* there judges each walker's way by
  his own test of a spot, which a navmesh can't; routes are 2-20 ms already); BatchedMesh's per-object culling (needs three past r160, and
  map-pre.js patches r160's shader chunks by their text).
- **The Godot rebuild: archived, not part of the game** (owner, 18 Oct 2026: "i want to remove the godot test for now - archive it not part of
  this game at all"): the Godot 4.5.1 test (the bodega, the Walker, the oaks and the grass baked from THE MARKET; its artifact
  https://claude.ai/artifact/A11ZoF3QuZ75dsdbdyQUyh) is out of `main`; the whole of it, `godot/` and its README, kept on the branch
  **`archive/godot-test`**. Nothing in THE MARKET's build ever read it. Don't bring it back without his word. Found on the way, still open in
  THE MARKET: the oaks aren't drawn on `main` (the park's reorganization, 5b3dd53, lost `PARK.trees=mesh(TREES...)`).
- **The toys and the droids deleted; the tomato's veggie stand; the Fox and his counter; the menu; running freely** (owner, 18 Oct 2026):
  **The toys** ("remove the toy charcters from ame completely"): the six (bear, monkey, penguin, pig, sheep, bunny) out of the game and the data
  (`src/npc-toys.js` gone, their models out of `data/props.json` and `data/full/props.json`, park.js's hand-off, the newsstand's headline).
  **The droids** ("remoev these droids from game completely"): the four security droids (`npc-droids.js` gone) and the six civic department
  droids (`civic.js`'s staff: none now); the UAL body's kit kept as `src/ual-kit.js` (`UALK`) for the playable mannequin only. Every duty waits
  without its droid: a fire burns itself out in four minutes, the post and the works' jobs wait, a faint comes round by itself.
  **THE TOMATO'S VEGGIE STAND** ("give the tomato merchant his own veggie stand by the mushroom vendor, he buys and sells veggies"; `src/veggies.js`):
  on the park's sidewalk just east of the mushroom booth, its front to the street: a green stand, three tilted crates heaped with nine vegetables,
  pumpkins at its foot, a green and cream awning, a slate; the tomato held behind it (his roaming and life off). A double click on him: his shop
  (`vegp`): ten vegetables to buy, any of yours bought back at a little over half; one purse (INV's). Raw food each; four dishes by a flame (ROAST
  CORN, VEGETABLE STEW, STUFFED PEPPER, PUMPKIN SOUP: forage.js's COOKING). Two instanced draws, some 2,600 triangles, no light. `VEGDBG()`.
  **The Fox a quarter taller** ("fox should be 25% taller": `metres` 2.0), **the counter a quarter lower** ("counter should be 25%shorter": its
  boxes at three quarters of their heights, the lottery machine and the candy jar brought down with its top; `bodega.js`); the shop's radio,
  which had slipped into a comment and wasn't placed, back on the counter's end. **The menu's map** ("map cant be seen in menu"): framed on the
  street when the apartment building is off the map (it was a strip reaching 1,000 tiles east to it). **GO TO** ("make all the locations to jump
  to in 1 dropdown"): one dropdown of every place, room and more place under the map (the old button rows still made, hidden, for the tests).
  **Every dragged panel stays in the window and scrolls** ("i cant see all the items in menu": a drag let the avatar editor's bottom go).
  **FREE** ("lets take off any preloading rules or hiding rules, just let the user run freely around full map ... let me freely run around n and out
  of rooms"; `FREE` in `map-pre.js`, `?free=0` the old rules): no world vanishing inside a room (no room clip planes, no black, the characters,
  river and force field outside it kept), no interior drawn only near its door (`interiors.js` off unless `?interiors=1`) or only from inside
  (`perf.js`'s 1st off unless `?perfx=+1`); the near-side cut kept (you're seen inside) but its planes put on every material at the warm-up
  (`ROOMS.nearAll`), so walking in moves them and never recompiles. Kept: walls toward the camera cut to their foot, the roof hidden while in,
  the batches' map chunks culled by the camera, characters out of the picture not drawn and far ones not run. Measured (tests/trisby.cjs,
  11 am, all on screen): the street 165,000 to 284,000 triangles (the bodega's shelves seen through its windows), the shop 141,000 to 288,000,
  the park 172,000 to 128,000. `tests/freewalk.cjs <out> [query]`, `tests/vegshot.cjs <out>`.
- **The skeletons in the dungeon; one mailbox a street; the street light whole; the view back on you; the stalls' mockups** (owner, 18 Oct 2026):
  **The skeletons** ("i want all the skeleton warriors and skeletons to be underneath the castle in the dungeon"): the four KayKit guards (their
  street beats left), the gold skeleton and the four skeleton pawns (mage, reaper, guard light and heavy) live in the castle's great hall, walking
  about it (`DUN()` in `npc-map.js`: the level under the street, the dungeon's group and floor, its solids; out of walkers.js's and lives.js's ways
  of life). The troublemakers (the Rogue gone dark: skeletons too) don't come up the stairs any more (`?trouble=1` brings them back). The
  mushroom seller, a skeleton, stays at his stall. **The collection boxes** ("lets only have 1 mail box per street"): four, one on each road's
  park-side kerb clear of the gates (`mail.js`). **The street light** ("the lamppost doesnt connect"): its arm had floated a third of a metre over
  the pole's top; the pole now runs up to it under a cap (`dress.js`). **Back on you** ("anytime youve scrolled away off screen from your
  character and then you stat to move again, it should snap back to focus on you"): any frame he moves while the view's slid off him and he's off
  the picture, the view is put back on him (`UI.follow`, `ui.js`). **The stalls without tents** ("i dont want these stripped tenst ... rows and rows
  of diff mushrooms, standing between three tables in u shape ... show me mockups"): `mockups/market-stalls.html`,
  https://claude.ai/artifact/ET6bXTLDgHdTfyAsyG4MTn (A trays, B stepped tiers, C heaps and overflow); his pick to come.
- **The Metro made plain** (owner, 18 Oct 2026: "simplify the subway station layout, stairs go down to the platform, one big room with tunnels,
  etc. too many random walls and things going on"; `src/metro.js`): the kit's four cross-sections, its exit corridor, the gates, the staff closet
  and the lower ceilings are gone; the station is laid out in the page from plain quads in the kit's own textures: **one hall** 84 m long (the
  track down its south side, the platform 8 m deep along it, a tiled back wall and far wall, one ceiling), **one straight flight** of 24 tiled
  steps from the railed opening on the lot (where it was) down through the back wall onto the platform's middle (its walls rising to the street
  under the opening, a low parapet each side in the hall), and **the tunnels**: the track out of each end wall into the dark (60 m east, the car's
  way out and back, 40 m west). The car stops opposite the stairs; one row of columns (none before the stairs), the ticket machine and map by the
  stairs, the vending machine, four benches (seats), two bins, four pairs of posters, eight tube lights, a TO STREET sign each side. The rats, the
  platform's spot, the way down for characters, the ride all moved with it (`METRO.CZ`, `METRO.plat`, `METRO.Z_S/Z_N`). The data lost the kit's
  cross-sections, gates and the exit's height map (1.03 MB to 0.92 MB). Cost: the hall some 300 triangles where it was some 3,000; the screen
  underground about the same as before (the car the bulk); 11 lamp records (was 22), no new program. `tests/metroshot.cjs <out>`.
- **Standing is still** (owner, 18 Oct 2026, of the mushroom seller at his booth: "the grain shadow on the mushroom merchant is constantly glitchy
  looking beacause it tries to chnge too fast"; `npc-map.js`): a character made of parts (the mushroom seller, the Fox) had a standing "breath",
  a sway of a degree and a 1% stretch, that slid his own shadow's stepped edge across his robe every frame; standing he is now still (the walk's
  rock and bob as before). Measured close on him at his booth (`tests/mushstill.cjs <out>`): 8,580 of his pixels changed a quarter second to 0.
  https://claude.ai/artifact/ET6bXTLDgHdTfyAsyG4MTn (A trays, B stepped tiers, C heaps and overflow); **his pick, "B with C's overflow"**: `src/stalls.js` (`STALL.build`, for both: three plank tables in a U open to the street, the seller in its middle, each table three crate risers stepping up toward him with a row of heaps a step, one kind a heap, a basket now and then on the top step; round it two crates high, baskets on the ground, sacks and pumpkins (his) or a mushroom log (the seller's); the old awnings gone). Cost: some 13,700 triangles the mushroom seller's, 13,100 the tomato's (the goods a third over life size so fewer show as full), six instanced draws each, no light; solid at the tables and the overflow. `tests/stallshot.cjs <out>`.
- **The roof out of sight, the mist back, the weather held, the old Fox, the sun's stripes** (owner, 18 Oct 2026): **the roof** ("it looks like the
  roof is vanishes and lets real light ... dont change lighting in interiors jsut beacuse you walk in the room"): a roof hidden while you're in (the
  bodega's, the stored rooms', the roof bits of rooftops.js) is taken off the camera's layer onto layer 3, which every shadow camera sees (`SEEN` in
  `map-pre.js`), so it still keeps the sun out: the light inside is the same from in and out. **The mist** ("what happened to the green haze"): his
  browser had DISTANCE HAZE saved at FAR; the key is now `market-haze2`, so everyone starts in the MIST again. **The skyline in the mist** ("where
  did the distance skyline of buildings go?"): in the mist it's faint silhouettes (mixed 80% toward the mist's colour, a little more the further,
  in three steps; its own, not the scene's fog), in FAR as before. **The weather held** ("set a default time and atmosphere and stay at the time";
  his pick "Teal mist + clouds"): CLOUDY from the start (`WX.hold`, weather.js; `?wx=natural` the simulation); the clock stays STOPPED at 5:24 pm
  (`CLOCK.h` 17.4; his pick of the mockups, https://claude.ai/artifact/FNh426aeu5GPJcdBj4KvqX: "golden hour"). **The old Fox** ("use the old fox avatar not the new one"): the
  rounded one before the angular (`npc-fox.js` from before 1c9b71f), 2 m. **The sun's stripes** ("glitchy shadows": a wall the sun grazes striped
  and arced with its own shadow): the sun's normalBias .04 to .12 (`clock.js`; `?snb=` a test's).
- **Every page of the batch's atlas** (18 Oct 2026, found publishing): since the atlas was cut into pages (the roads three times wider), a kind
  can span pages (its later meshes `k~1`, `k~2`), and only the first page's mesh was hooked up: the bodega's walls on the second page never cut
  away, its tubes showed from outside, part of its roof stayed. `BATCH.all(M,k)` gives every page's mesh of a kind; bodbuild.js, castle.js, store.js
  and ghostdojo.js use it for their cut walls, roofs, tubes and shadows.
- **Every character checked standing still** (owner, 18 Oct 2026: "now check other characters"; `tests/stillcheck.cjs <out> [keys] [query]`: one of
  each brought beside you and held, 12 frames a quarter second apart, the pixels in his box that change): still already, the cat in the raincoat,
  the TV cat, the frog on his scooter, the bearded Walker (0), the shark but for his jaw's snap; **the pawns** (the townspeople, the ogres, the golems,
  the skeleton pawns) 2-3% of their pixels a frame on their breathing idle (`UAL_Idle_Loop`, `idle_a`, `idle_b`, `sit_floor_idle_a`): now held still,
  playing only into its fade and for a 1.5 s shift of weight every 7 to 15 s (`STILLC`, npc-pawns.js), the talking, cheering and found-it idles as
  before; measured 0 between shifts. **The dungeon's KayKit skeletons** the same on their pack's idle (npc-skel.js; the guard's alert stance and his
  blows as before; not seen close in the check, the dungeon's walls in the camera's way). **Left moving** (deliberate, to ask): the animals' idles
  (the wasp's hover, the bat's wings, the slime's wobble, the spider's, the frog's, the rat's, the snake's), 1-4% of their pixels a frame.
- **The bodega's goods, real** (owner, 18 Oct 2026: "did you take away the phsyics from the game? i want every item in the bodega to be real";
  the old game had them as bodies, 47-physics-5-goods; `src/goodsphys.js`, `GPH`): all 208 goods on the shelves, in the coolers and on the counter
  are rigid bodies in Rapier (physbody.js's build, fetched only once you're within 4 tiles of the bodega). Each starts asleep where its shelf put it;
  the fixtures' boxes are solid to them (but a box a good stands inside, the coolers' cases), the floor and the walls (doorways open). You push
  what you walk into (your body a capsule); a punch or a kick (J, K and their kin) sends what's before you flying (never through the shop's walls);
  a double click on a good walks you up and takes it in your hand (the rig's carry), and holding one a double click anywhere throws it there.
  Still for a third of a second, a good sleeps where it lies. A moving good rewrites only its own corners in the goods mesh (`BOD.goods`, its
  vertex range, bodbuild.js). Cost: no triangles, light or program more; the world steps at 120 a second only near the bodega. Not done: the goods
  back on their shelves (a reload puts them back), the Fox or the townspeople pushing them, the coolers' doors opening onto real goods.
  `GOODSDBG()`, `GOODSHIT(k,r)`, `GOODSGRAB()`, `GOODSTHROW(dx,dz)` (tests).
- **Central Park's edge and gate, A** (owner, 18 Oct 2026: "make central park entrance bigger and metal dark gate, styled like real entrance, gate goes
  all the way around the park"; "i want the mushroom vendor and tomato vendor on both sides of the entance, make them 15% larger"; of the mockups
  https://claude.ai/artifact/9wgLdJb3pa59RWxJCRFwFn (`mockups/park-gate.html`), "A, just make sure it looks natural like the sidewalk, stones, edges,
  depth, tufts, lived in"; `park.js`): the brick walls gone; all the way round a knee-high wall (16 px) of grey granite in courses (`ashlar`: each
  stone its own length and tone, lit rims, dark joints, grime toward the foot, moss low in the joints, lichen, ivy where it's been let go) under
  the cope's stones, and on it an iron spear railing a metre high (a picket every 0.16 m, a few rusted, a few leaning, now and then one gone; two
  rails; a post with a knob every 2.4 m); at each gate two granite piers 3.2 m (big ashlar, a plinth, a cap) with an iron lantern each (its glass lit
  after dark, dim by day; no lamp record), and two iron gate leaves (2.2 m, three bars, a ring row) folded back inside along the railing, solid. The
  main street's gate 10 tiles wide (`P.gate`, was 7). The weeds and tufts come up along the wall's foot by themselves (weeds.js reads its solid).
  **The stalls either side of the gate**: the mushroom seller's west of it, the tomato's east; **both sellers 15% bigger** (2.53 m, 1.84 m); the
  stalls their size. Cost: the iron instanced in 16-tile pieces (some 57,000 triangles round the whole park, a few thousand in sight), the
  lanterns' glass one unlit draw; no light, no new program. `tests/gateshot.cjs <out>`.
- **The mist on the town's outskirts** (owner, 18 Oct 2026, his shot down the street gone teal in straight bands a few tiles off: "the haze should
  not be straight lines and should be on the outskirts of town", "game is unplayable"; then "it should get darker further away. more clouds and life
  in distance"; `map-pre.js`'s fog chunks, `skyline.js`, `ring.js`, `weather.js`): the mist goes by how far a point lies past the town's edge (the
  force field's box, `MISTB`, set by ring.js), not by its depth from the camera: the town clear wherever you stand, the mist starting 4 tiles past the
  edge and full 26 past it, in the fog's 8 flat steps whose edges a world-fixed noise bends into tongues (never straight lines); further out the
  mist's colour steps darker (four steps, to half), the background the darkest, the skyline mixed toward a darker mist. The box and the switch
  (`MISTE`) are plain objects every built-in material's uniforms share; `?mist=near,far` in tiles past the edge. **Clouds**: eighty (the second forty
  out to 245 tiles), not fogged, tinted half toward the mist while it's on; 19,200 triangles. **Life**: a tenth of the skyline's windows lit even by
  day, each going on and off now and then. Cost: a few instructions a fragment; the clouds' 9,600 more triangles, far off.
- **Into the subway and out** (owner, 18 Oct 2026, of the flight and the hall seen down the opening: "this part shouldnt show. lets not ever load the
  subway or underground until you enter it ... "Entering Subway" or "Leaving Subway" while each loads ... seamless ... when you enter the subway you
  should be in this spot and at this angle as you fade in"; "you should still see the steps down but when you go down a few steps it triggers the
  subway scene"; `METRO.door` at the end of `metro.js`, `MAPLV` in map-post.js): from the street the top of the flight shows and a black lid six treads
  down hides the rest (the hall, its walls and lights not drawn while you're up: `MAPG.down` only on the level below, the Metro's flight excepted);
  three treads down the screen fades to black with ENTERING SUBWAY, you're set at the flight's foot on the platform, the isometric view on his
  picture's angle (`METRO.YAW`: the track lower left, the stairs rising to the right; `?subyaw=0..3`), three frames drawn under the black (the
  hall's programs made then), and it fades in; five treads up the flight, LEAVING SUBWAY, and you're on the sidewalk before the opening at the
  street's angle. The castle's and the loop's stairs as before. Not done: the hall is still built at the start (in the loading's background), only
  never drawn till you go down. Cost: one quad, a div. `SUBGO(x,z,lv)` a test's jump.
- **The game in a frame** (owner, 18 Oct 2026: "i want the game screen to be in a rounded frame covering 75% of window, black background";
  `FRAMEK` in `flea-market-3d.html`'s resize): the picture centred, .866 of each side (three quarters of the window's area), its corners rounded
  18 px, black round it; `?frame=1` the whole window.
- **The thick grass further in, the mushrooms in their spots** (owner, 18 Oct 2026: "the thicker grass should be further back into the park. tufts and
  plain grass at start mostly. mushrooms shouldnt be everywhere in park, just certain parts they grow"; `weeds.js`, `forage.js`): within 14 tiles of the
  park's walls (the line bent by a noise) only flat and tufts, to 28 the low kinds, past it all (`WEEDS.deep`); mushrooms only where a broad noise
  says (about a sixth of the lawn, `WEEDS.mushAt`), four times the odds there.
- **The ogres to the dungeon, the golems in their cave, his Walker reset** (owner, 18 Oct 2026: "make sure these skel knights are in dungon, and the
  golems are in the rock cave", his picture of the ogre pawns at the newsstand; "my avatars is bald now and disappearing ... please refresh my new
  walker back to normal"): the four ogre pawns live in the castle's great hall with the skeletons (`npc-pawns.js`, DUN); the twelve golems are set in
  the cave once it's built and stay about it day and night (`GCAVE.haunt`, cave.js); the save's version 2 (`save.js`) puts his own Walker back as the
  game makes him, once: his looks, shape, face, body type, speeds, the avatar editor's settings and the avatar switch.
- **Posing him, in a void** (owner, 18 Oct 2026: "the avatar editor needs to have a section where i can pose the avatar and pull his limbs all around.
  i want to be able to pick his standing pose"; then "avatar should not be in game when editing. pull into empty void. full 360 rotate and tilt, full
  editing. very minimal and inituive GUI"; `src/avatar.js`, `src/studio.js`, `R.ANIMX` in `animator.js`): **the avatar editor's tabs cut to six in
  one row** (BODY, POSE, LOOK with its patterns, STYLE the outline and shading, SAVE the presets, MOVE the speeds). **POSE**: drag any part of him
  (an arm, a forearm, a leg, a shin, a foot, his body, his head, his hips; the part named as you grab it) and that's how he stands whenever he
  stands still in the game (the animator's `stand` overlay, one key); twelve standing poses to start from (RELAXED, HANDS ON HIPS, ARMS CROSSED,
  HANDS IN POCKETS, HANDS BEHIND, CONFIDENT, WEIGHT ON ONE LEG, SLOUCH, SHY, ONE HAND ON HIP, THINKING, AT EASE), MY POSES (named, kept in the
  save's `standposes`), mirror either side onto the other, undo. **THE STUDIO** (`STUDIO`): while the editor is open the camera sees only him
  (his pieces and the editor's highlight on layer 7, the camera on that layer alone) against a plain dark void, no fog, no world, lit by the
  studio's own sky and sun (on layer 7 only: the world's lamps never reach him there, the studio's never reach the world), no SELF shadow; a drag
  off him turns him all the way round and tilts from under his feet to over his head, the wheel nearer or further, a double click back before
  him; him in the middle of what the panel leaves; one line of help at the foot. Closed, the game's view, background and shading come back.
  Cost: nothing while closed; open, his triangles alone and two lights (his programs made once more for them the first time). `STUDIODBG()`,
  `STUDIOTURN(yaw,pitch,dist)`, `AVPOSE(name)` (tests).
- **ONE RULE FOR EVERY CHARACTER: AT REST, AND STEPPED** (owner, 18 Oct 2026: "are you just patching each character or applying an overall fix that
  fixes the root issues?"; of the two parts offered, "both"; `ASTEP` in `map-pre.js`): the root of the crawling shadows is that the light on a
  character is cut in hard bands and his own shadow is hard-edged, so motion under a pixel flips edge pixels every frame. **REST**: standing, every
  character's animation clock is held (his mixer's timeScale 0: the pawns, the dungeon's skeletons, the animals), after half a second to settle,
  but for a 1.5 s shift of weight every 7 to 15 s; only what his own file says is deliberate goes on (`N.restless()`: a pawn talking with someone,
  cheering or finding a thing he stopped for; a guard on alert or mid-blow; a flyer's wings; the dragons). One place, makeNPC's tick (npc-map.js),
  so a character added later is still at rest without being told. The per-character patches before it are gone (npc-pawns.js keeps only `STILLC`,
  its plain idles). **STEPPED**: every character's pose is worked out `ASTEP.fps` times a second (10 by default) and held between, as a sprite's
  frames are; where he stands moves every frame (`ASTEP.gate`; what his pose sets of his height, a flyer's, kept between). In makeNPC's tick for
  everyone it makes, and in their own frames for you (`ASTEP.you`; your strikes judged from pose to pose, the ragdoll's blend and the animator's
  pose every frame), the bearded Walker and the guitarist walking (his playing every frame). GRAPHICS' ANIMATION: STEPPED 8 / 10 / 12, EVERY FRAME
  (the save's `animfps`); `?animfps=N` (0 every frame), `?still=0` the rest rule off. Checked: `tests/stillcheck.cjs` (standing: 0 changed pixels for
  every kind but the deliberate: the wasp's wings, the shark's jaw, the cat's page), `tests/stepcheck.cjs` (walking: the pose every 0.1 s of game
  time, the place every frame; in the cloud's software graphics the page ran 2-3 frames a second, the game's frame capped at 0.05 s, so this is
  game time: not seen at a real frame rate here). Cost: less than before (poses worked out a tenth as often at 60 fps).
- **The sky's depth, the city on and on, the park's own edge, the oaks back** (owner, 18 Oct 2026: "the sky needs distance in it and depth, it
  just falls flat after a certain point. more variety of skyline based on real nyc 1980s, more clouds covering sky"; then "the buildings should keep
  going and going in distance and get blurrier and blurrier the further away they are, lets also add the trees back to the park (large, more towards
  middle. the closest buildings on other side of park should look more like this", his picture of the pre-war houses over Central Park's trees):
  **the sky** in the mist is the dome again (`sky.js`, `uMistK`): darkest at the horizon, lighter up through the mist, deeper overhead, and a deck of
  clouds over most of it on a plane above (so they crowd toward the horizon), lit above and a step darker under, drifting, its flat bands cut in the
  screen's colour (in linear every dark teal fell in one band). **The skyline** (`skyline.js`): the 1980s landmarks on the park's side (the Twin
  Towers, the Empire State, the Chrysler, Citicorp, Woolworth, 70s steel slabs, a steel curtain-wall front), low-rise with water towers; four more
  rows out past the land, further and taller; **the park's own edge** just past the force field: pre-war apartment houses shoulder to shoulder, 12 to
  24 storeys, limestone, cream and tan brick, set-back tops, twin-towered crowns now and then, water towers. Every front less distinct the further
  past the town's edge (`pastK`: its windows fade into its wall in four steps, its colour into the mist in six). Not a blur: the no-blur rule
  stands; "blurrier" is detail lost in flat steps. **The oaks** back (`PARK.trees`, lost in the park's reorganization): 24, 12 to 22 m, in the middle
  seven tenths of the park, 12 tiles apart; `?trees=0` hides them. Cost: the skyline some 600 more instances (about 7,000 triangles, one draw), the
  sky's clouds in its one fragment shader, the oaks some 11,000 triangles.
- **His feet planted** (owner, 18 Oct 2026: "they dont seem to be really walking ... cant we just apply real walking physics ... so there feet are
  actually moving around realistically?"; "lets just work on our character for now"; his picks: his pace kept with quicker steps, his pose every
  frame while he moves): the rig had him go 2.4 times as far as his feet carried him walking and 1.46 running (`RIGT.slip0/slip1`, 14 Oct's "he
  walks too slow"), so a planted foot skated forward half his speed walking, a sixth running. The slip is gone: he goes exactly what his feet
  carry, times his drawn size (`W3.SZ`, the player's `go` in build.py as the musician's and the bearded Walker's already were); his pace kept
  (2.4 tiles a second walking, 4.9 running) by his steps: the walk's step 18 (was 14.67), stance .58, 0.583 s a stride (206 steps a minute: his
  legs are a third of his height, so at this pace a body his shape walks quick and short), the run's 0.461 s (`WALK`, `RUN` in
  walker-rig-mock.js and build.py's copy). The avatar editor's ANIMATION speed now shortens or lengthens his step instead of sliding him. A MOVES
  dial saved before (stride, step time) is dropped once (`GAITV`, animator.js). His pose is worked out every frame while he walks or runs (ASTEP's
  10 a second only standing and in moves). Measured (`node tests/footslip.cjs`, the rig alone, no drawing): the planted foot's slide 32 to 0.3
  units a second walking, 22.5 to 0.5 running. With it, the musician and the bearded Walker (the same rig) plant their feet too, and walk a sixth
  slower (they were carried 1.2 times further than the player). Cost: nothing; his pose built every frame while moving (some 0.1 ms).
  Next, at his word: foot locking for the clip-driven characters.
- **The distance look, his to set** (owner, 18 Oct 2026: "make the buildings more logical, and they shouldnt be as visible, depth of field, blur,
  haze, etc, real distance"; "way too much, needs to look realistic, check other video game references"; "give me mockups of diff styles, with
  ranges i can select and change to get the right look and save it"; `skyline.js`, `sky.js`, map-pre.js's `MISTF`): the skyline laid out by
  sense: low near the town, taller further out, the landmarks in their clusters far back (Midtown 75 tiles past the land, Downtown 170). **Blur**
  (the no-blur rule lifted for the distance only, at his word): the skyline and the sky drawn on their own before the picture, blurred both ways,
  laid behind everything as the background; the near world sharp; none when BLUR is 0. **GRAPHICS' DISTANCE LOOK** (`FAR3.panel`, `?farlook=1`
  opens it): five styles (GAME, CLEAR AIR, HAZY, DREAMY, DUSK CITY) and sixteen sliders (where the mist starts and how deep, how much darker far,
  the buildings' haze near and far and where it's full, its steps, how far windows show, lit windows by night and day, blur and its coarseness,
  cloud cover and brightness, the sky overhead and at the horizon), live; SAVE keeps them (the save's `farlook`), RESET the game's own, EXPORT
  gives `FARLOOK {...}`: when he sends it, put it in `FL0` in skyline.js. Cost: with blur on, the skyline and the sky drawn again (a few thousand
  triangles) and two blur passes at the picture's size over the coarseness squared.
- **His body reset and lined up** (owner, 18 Oct 2026: "the shoulders and body seems off at the root"; of the mockups, C, then C1's legs, then S2's
  shoulders: "it looks like he is wearing shoulder pads for football"; "his arms look too droopy"; "reset his entire body, t pose all side, line up
  things that dont make sense, completeley fix"; `BODY` in `walker-rig-mock.js`, `S2F` the default, `?body=A|B|C|D|C1|C2|C3|S1|S2|S3|S2F` the
  mockups): his shoulder joints 7.1 out (6.3 had his upper arms half inside a round chest), the joints 2.5 over the chest so the shoulders slope, the
  sleeve just over the arm and the bar and collar thin (no pads); the chest flatter front to back (.72) and the waist in; the hips over the feet (3.4
  out, the legs had slanted in to the ankles), the thighs tapering into the knee, a little calf; flat-soled shoes, high at the heel, low over the toes
  (`shoeBox`). Standing, his arms eased 6° off his sides and the elbows soft (`walkPose`, at rest only). The save's v3 puts every browser's body,
  shape, face and body type back to the game's once (his looks and kept poses stay). Not changed: his head (a third of his height) and his legs'
  length (the moves' keys hold the hips at 18). `tests/tpose.cjs <out> [body] [tag]` (every side, his joints), `tests/bodymock.cjs`,
  `tests/posemock.cjs`; the sheets in `mockups/body-*.png` (not kept in git).
- **Into a turn, and the stop** (owner, 18 Oct 2026: "add the lean into turns and weight shift when stopping"; `walkPose` and `tick` in
  walker-rig-mock.js): **the lean**: as he turns (the page hands the rig his heading's turn a second, `st.yr`, build.py) his whole body tips
  over his planted feet toward the turn's middle, as far as a body his speed round that turn would (tan = speed x turn / gravity), at most 9
  degrees walking and 18 running, eased in and out (`st.bank`), the hips carried in and a little lower so the outside leg still reaches its foot,
  the shoulders tipping with him, the head a little nearer level; at nothing exactly once he's straight. **The stop**: let go from a walk or a
  run, his weight carries on once: the body tips forward (10 degrees, more from a run), the hips go 2 units ahead and dip a pixel as the weight
  lands, the arms swing on, then it comes back a little past upright and settles; over at 1 s, exactly at rest (`st.stop`), anything else (a
  step, a move) ends it. His pose is worked out every frame through it (ASTEP). The same for every Walker on the rig (the musician and the bearded
  Walker stop the same way; they don't lean, nothing hands them a turn). Checked: `node tests/turnstop.cjs` (the lean's size, the feet still
  planted leaning, the stop's curve, 0 frames changing after it); in the page, turning one way tips his head that way. Cost: nothing.
- **The menu's map drawn as a map; the root fixes, "fix all 1-8"** (owner, 18 Oct 2026: "the map in menu should show entire map and not the real
  thing, just map showing where eveything is, map like"; then, of a list of patches made in place of fixing their causes, "fix all 1-8"):
  **THE MAP** (`plan()` in `ui.js`): the street level drawn as a plan from the places' own measures, the whole loop inside the force field, north
  (the park) up: the roads (`BOD.road.at`), sidewalks and alley (`BOD.grounds`), the park's lawn and ways (`PARK.path`), the river, the buildings
  and places as blocks in their colours with their names (none over another), the force field's line; two pixels a tile, painted once; your dot;
  a click goes there. Underground is still the view from above. `tests/menumap.cjs`. **1, OUT** (`map-pre.js`): one rule for what's out of doors,
  `OUT.add(thing,'open'|'world')`, checked once a frame after the rooms (rooms.js), in place of each outdoor thing's own `ROOMS.cur` check (the sky,
  birds, force field, river, roofs' things, lamps' pools, the weather's and haze's reads); hidden by SEEN, so a roof's shadow stays.
  `tests/outcheck.cjs`. **2, the light on a character in steps** (`looks.js`): its way handed on only after it turns 7 degrees (`?lstep=`); and the
  player's placement (`W3.place`) no longer set it back to his fixed light every frame (`W3.realL`), which had kept the easing toward a lamp from
  ever holding. Walking under a street light at night the light on him changed on 6 of 60 steps (60 of 60 before). `tests/lampwalk.cjs`.
  **3, SHX** (`src/shx.js`, right after three's import): every onBeforeCompile wrapped once; a shader edit whose text isn't in the shader is
  reported (`SHADER EDIT MISSED`, `SHX.miss`); found one (the batch's glow tint on unlit materials, made explicit). `tests/shxcheck.cjs` (none now).
  **4**: nothing off the map is built (the pool's removal); `AWAY.has` is the register. **5, a kind on one page** (`batch.js`): each kind's
  pictures packed together, a new page started before one that won't fit; only the street's ground (bigger than a page) spans two
  (`BATCH.log`, `tests/batchlog.cjs`). **6**: the oaks (lost in 5b3dd53) came back on main the same day; the dojo's floor painted the right way round; the
  creatures, dragon and kit had already been cut again (c24f751). **7, the house's floors** (`APTS.lvY(lv)`, `APTS.lvOf(y)`, its plinth in them) for
  the hitboxes, the drone, the residents, the rooms, the roof and the menu (the same picture, `tests/aptfloors.cjs`). **8, triangles**: not solved; a
  cull of what lay past a mist round him was built and taken out again when main's mist (the town's outskirts only) came in. `tests/mistcull.cjs`
  measures one whole frame (every pass). **THE HAZE FADES GRADUALLY** (owner, of the mist's bands: "i dont want hard lines like that, needs to be cel
  shaded shadows and gardual chanegs in haze tarnspacency"): the fog's 8 flat steps gone, the outskirts' darkening and the skyline's steps smooth;
  the light and shadows keep their cel bands. `tests/mistviews.cjs`.
- **His feet on the ground, not on him** (owner, 18 Oct 2026: "are we just patching again instead of fixing root? or maybe we are handwriting
  something that is already available"; his yes to world-space foot locking; `footLock` in walker-rig-mock.js, build.py's three hooks):
  the rig had planted a foot only in his own frame, so a standing foot swung round with him as he turned (up to 540 degrees a second), and
  starting and stopping snapped both feet to their places. Now, for the player (`st.world`, set by the page before his pose; the musician and
  the bearded Walker as before): a heel that lands is locked at its spot in the world, and its way (`fyaw`, the foot kept flat and pointing where
  it landed; past 50 degrees from him it pivots with him on the spot), and the leg reaches back to it till the foot lifts; a swing starts from
  where the foot really was and lands where his going puts it; a foot a fast turn leaves out of reach takes a quick step back under him (0.16 s);
  stopped, a foot left out of its place takes a short settling step (0.2 s) to stand by the other, one at a time (`st.fstep`); every foot on the
  ground where it stands, the highest under its heel, ankle and toe (stairs, kerbs, the stoop: `W.gnd` is the page's groundY), his floor no higher
  than a foot he has on the ground (the page's py) and the rig's settle told of a lower one (`st.fdn`), his hips lowered in whole pixels as far as a
  leg needs. Measured (`node tests/footworld.cjs`: the rig played as the page plays him through eleven cases, no drawing): a foot on the ground
  moves 0 in the world walking, running, round a circle, stopping, starting and on stairs up and down; a quarter turn 0.67 (hundredths of a world
  unit a second, one quick step), a U-turn 3.2 (its pivots); on flat ground and stairs a planted foot within about a pixel of its ground. In the
  page: no errors, and after a stop every piece of him the same frame to frame. **Found on the way** (`pose()`): since 17 Oct (the sitting change)
  the line that keeps his arms clear of his body, lays the walk fresh and puts signing over it had sat inside a comment and never ran; out again.
  Not done: the foot's own turn on the knee (the knee still points his way when a foot is turned); the clip-driven characters (pawns, skeletons:
  their own foot lock is the next at his word); a pivot on the ball (the pivot is about the ground under the ankle). Cost: some 0.05 ms a frame.
- **His walk even frame to frame** (owner, 18 Oct 2026: "test the walk to see if its smooth, right now its super choppy and jumpy"; `step` in
  walker-rig-mock.js): the rig stepped in fixed 1/120 s ticks and carried the rest of a frame's time to the next, so a frame moved him one tick
  and the next two: at 144 Hz his speed swung 45% frame to frame, 23% with uneven frames. Now each frame's whole time is cut into even steps of
  at most 1/120 s: 0% at 60, 144, uneven and 30 Hz (`node tests/walksmooth.cjs [run]`, which also counts his hips' jolts). **Found, not
  changed**: his hips drop 2 pixels and back each step (17, 16, 15, 16, 17) at 3.4 steps a second; a smoother, shallower wave was tried and his
  legs can't reach the ground from it (footLock lowered him back to the same dip): at his pace his short legs need long steps, and long steps
  bring the hips down. A calmer walk is his call: slower and fewer steps, or longer legs.
- **Ghost Street made again** (owner, 18 Oct 2026: "lets make the building realistic like we did sidewalks with natural shapes, edges, depth, lived in,
  ivy growing around it, make sure the outside matches inside layout, make it 1.5 bigger, remoev vending machines out front, put another window
  there, lights shining out strong, rays, reflections, etc moody"; `src/ghostdojo.js`, superseding the kit's shop pieces and the vending machines):
  the whole building drawn there, half as big again about the middle of its front (13.6 x 6 tiles; the ground floor 168 art px, the floor above to
  300, the tiled roof to about 400): a stone plinth, weathered cedar boards (each board its own width, tone, grain, knots, nails at the rail,
  rain-dark at the foot, moss), dark posts and beams standing out of them, the floor above lime plaster (stains, a crack, a patch to the lath) with lit
  lattice windows and the indigo signboard with gold characters, a pent roof on rafters over the front, the main roof in clay tile courses (moss,
  lichen, a broken tile), its gables set in under the overhang, the ridge and end tiles. Ivy from roots at the corners and the west side, painted and in
  clumps standing out. The front as the inside is: the bay window (lit pink) west of the door, the door with its noren and two red lanterns, a lattice
  window east of it where the machines stood; the round windows lit outside where the hall has them. Its light out: five lamp records before the
  openings (always on), light shafts down onto the forecourt through each gap (flat additive quads, two steps along each, stronger toward night, hidden
  while you're in), the puddles under the windows with streaks of their colour. The forecourt its own painter (`BOD.GDK.court`): raked gravel with moss,
  a drip edge of dark pebbles, granite flags to the door, puddles. Lived in: fire buckets, an umbrella stand, a broom, glazed pots, a bench under the
  window (a seat), crates of empties, a rain barrel, three planted beds with lanterns (the kit's beds were only soil in 3D). Inside, the dojo half as
  big again (10 x 4 mats, three cushions), its walls' windows where the outside's are. The floor above, the roofs and the ceiling hidden while you're
  in (SEEN). Cost: some 1,200 triangles more in the street's view, 5 lamp records, the shafts some 40 quads in 4 draws (MeshBasic), no new shader.
  `GSDBG()`, `GSLOOK(dx,dy,zoom,yaw)`, `GSGO(dx,dy)`; `LOOKAT(x,z,zoom)` and `LOOKYAW(deg)` a test's camera anywhere; `tests/lookshot.cjs`.
- **CLUB STATIC, off the map** (owner, 18 Oct 2026, after a video on video game nightclubs: "lets try to build a nightclub off map following all
  these rules"; `src/club.js`, after store.js, its room through `STORE.kit`): a one-storey club on the dark lot east of the VCR shop (bodega tiles x
  432-456, y -98 to -80; the store's bound to x 472); MORE PLACES has CLUB STATIC. Real townspeople (`PAWNNEW` in npc-pawns.js:
  dancers on the pack's dance, talkers at the bar and high tables, the coat check); Hitman's queue behind a red rope with a bouncer (the first goes in
  now and then, another joins the back); its music made in code (124 a minute: kick, hats, clap, bass, a stab), muffled through the walls and
  outside, open in the hall, the RATTLE just after each kick louder where it's muffled; a double click on the DJ booth: two bars of riser, then the
  drop (the floor strobing white, the dancers quicker, a crash and cheers); U dances (the rig's own, `RIG.MOVES.dance`); the floor's 70 tiles lit in the
  beat's patterns, the lamps magenta, cyan, violet, amber by the bar (LITE's records recoloured, not a filter). Inside: the DJ's riser, booth, light
  wall and speaker stacks, the bar down the west wall with its lit back bar and eight stools (seats), sofas, high tables, glasses and bottles on every
  top, the lobby's coat check, the bathroom's stalls, sinks and cracked mirror; outside black-painted brick chipped to the red, tags, posters, STATIC
  in pink tubes, CLUB in cyan, the door's light, a fire exit, a dumpster. Its own night air while you're near (the town's mist would swallow it; the
  skyline hidden there). Cost: the view inside some 59,000 triangles in all; 8 lamp records; one program (the floor's). **No cardboard cutouts** (owner, 18 Oct 2026: "remove the cardboard cutouts from nightclub and game, forget that part"): GoldenEye's flat crowd was built and taken out; don't bring it back. `CLUBDBG()`,
  `CLUBGO(dx,dy)`, `CLUBLOOK(dx,dy,zoom,yaw)`, `CLUB.dropIt()`. **Found on the way**: with the outline on, every frame threw (the shape editor's
  selection undefined: `OUTL.hidden`), fixed in walker3d.js; `tests/datacheck.cjs` still fails the newsstand's `thanks` pool and the save's version, as on main.

## 18 Oct 2026: the smallest download, no comments
- **No recordings** (owner: "remove any recordings from game for now"): the guitar's and the piano's mp3s no longer in the page; the guitarist and the pianist play silently.
- **The mannequin removed completely** (owner: "remove mannequin completely from game"): its body, its 43 clips, its code and the GRAPHICS switch; the six body types stay for the Walker (`BODYTYPES`, avmove). With it went NIMBLE (the jump, bars, swings: the mannequin's only).
- **Animations reduced** (owner: "reduce animations from others"): only the clips the code names kept, at 12 frames a second (the game shows 10): pawns 101 to 16, skeletons 20 to 16, dragon 6 to 4, creatures 31 to 13 (`tools/trim-clips.py`).
- **No comments, numbered files** (owner: "i dont want any comments in code, only the minimal to make the game work, smallest download"; "structure same way with files [as the old game], most logical structure, minimal files"): the build's 145 text patches folded in; `src/` is 165 numbered files joined in order; the old game's makers copied in (the build no longer reads bralynnb/tsfm); every comment gone (code, shaders, HTML, CSS), proved by minifying the old and new pages without renaming: identical; the page minified by esbuild. The old Walker's 2D sprite frames (never drawn) dropped. CLAUDE.md cut to a short guide; this file is its old text.
- The download: 12.3 MB to 5.8 MB.

## 18 Oct 2026: from claude/jolly-ride-t5vb78 (merged into the new layout)
- **A recorded jump, and the walk a fifth slower** (owner, 18 Oct 2026: "when jumping make the legs more natural ... look for motions or presets,
  best way to get all those kinds of animations and movements"; his picks: CMU's free library and Mixamo; of the walk's quick bob, "both, a bit of
  each"): **recorded motion onto the Walker**: `tools/mocap-read.py` reads a CMU recording (its .asf skeleton and .amc motion, from
  mocap.cs.cmu.edu: free, some 2,600 clips, over a hundred jumps) into each joint's place a frame; `tools/mocap-rig.cjs` fits his rig to it with the
  rig's own conventions (the pelvis's turn, the spine, the head's nod, each arm's two angles, each leg's thigh and shin, the foot's tilt; on the
  ground the ankles handed to his leg solver so the feet plant; sized by his legs against the actor's; arms, pelvis and flying legs fitted to 0
  degrees off, the legs on the ground within 4) and lays a jump's crouch, flight and landing on the rig's own jump (`jumpMove`: its physics, carried
  speed, air punches and kicks, dives, the MOVES sliders; the recording's rise left out in the air, the arc his). `data/moves.json` (13 KB: CMU
  subject 13, trial 39), put into the rig by build.py (`MOCAP`); the hand-made jump stays as the fallback. `node tests/jumpcheck.cjs` (standing and
  running: no NaN, both feet leave at 0.27 s and land at 0.83 s about hip-width apart, 13.9 units up, still after). Mixamo's clips (his Adobe login)
  go the same way once a reader for .fbx/.glb is added. **The walk**: 0.729 s a stride (was 0.583), 165 steps a minute, 1.9 tiles a second
  (`GAITV` 3 drops a saved MOVES dial again). **The legs a quarter longer: not done** (his pick, with the slower walk): his standing hip height, 18,
  is written into the hand-made moves as a fixed number in 34 places (crouches, the guard, the hang, the climbs), so longer legs mean reworking
  those; next, at his word.
- **The far city baked, no static** (owner, 18 Oct 2026, two shots down the street: "the distant buildings constantly change every pixel every
  single frame ... likes like static"; "we need to bake the distance into the smallest perm files to use over and over, they dont need to be
  generated, just small low res that we can view"; "cut it in half and just reuse it tile"; `skyline.js`): the cause, every far front's 16 x 10
  window pattern read one texel a pixel with nothing averaging it: a storey smaller than a pixel picked a different texel each time the view moved
  a hair (and his eyes move with his head). **Baked**: every skyline building 40 tiles or more past the land's edge (431 blocks: the far rows, the
  landmarks, Downtown) is photographed once from the middle of town at a man's eyes, two of the four ways, the band from 2 degrees under the horizon
  to 30 over, 5 pixels a degree (`node tests/farbake.cjs`, the page's `?farbake=1`, `FAR3.bake`): `data/far-day.png` (900 x 138, 8 KB, at the held
  5:24 pm), `data/far-night.png` (10 KB, its lit windows; its alpha how far past the town's edge, for the mist), `data/far.json`; build.py puts them
  in the page (`FARIMG`). Shown on four flat panels round the town just inside where those blocks stood (one draw, 8 triangles, nearest pixels),
  the two halves each used twice (a building and its double face opposite ways), day and night blended by the clock, the mist over them as over the
  blocks, in the distance blur's pass as the blocks were. Run the bake again only when the far rows change. `?farbaked=0` the blocks as before.
  **Kept as blocks**: the nearer rows, the low-rise and the park's own edge (seen near enough that a flat picture would show as he walks), now each
  front's pattern giving way to its own average colour and its share of lit windows as its texels grow smaller than a pixel (what mipmaps do, by
  hand: `fwidth` in its shader). Not now: DISTANCE LOOK's window and haze-step dials no longer reach the far panels (the mist's two do); the
  baked light is the held golden hour's, at noon too. Found on the way: the rooms' near-side cut (`ROOMS.nearAll`, on every material) slices
  whatever it covers at the knee, the bake included (off for the bake). `tests/farlook4.cjs <out>` (his eyes the four ways, the opening view),
  `tests/farstatic.cjs <out>` (a hair's turn).

- **The apartment house in stone; ATMOSPHERE in the menu** (owner, 18 Oct 2026, his picture of a dark limestone corner house at night, arched lit
  windows over a balustrade: "i want the aparmtnet builing to look more like this. also let me change time of day and weather atompsher sttings in
  menu"; `054-apts.js`, `129-clock.js`, `131-weather.js`, `132-sky.js`, `094-ui.js`): **the front** limestone ashlar in place of the brick (`stone`): the ground floor
  rusticated (deep channels, staggered blocks) under a belt, smooth courses above with a string course each storey, quoins up the corners; each window
  in a stone architrave with a sill: the 2nd floor's (the cottage) arched, a half-round fanlight over it (lit with the window) in voussoirs and a
  keystone, the 3rd to 5th under cornice heads, the ground floor's under flat arches; the door under a lit fanlight; the frieze and dentils painted
  under a projecting cornice; every sash a dark frame with a mullion, a transom and three lights over it (`glass`); the sides blind windows painted
  the same way, some lit (no holes: the rooms inside keep their walls). In depth (the house's batch): the belt, **the 2nd floor's balustrade** on its
  ledge and corbels (pedestals between the windows, a baluster every fifth of a tile, its rail), **the cornice** round all four on modillions. The
  plinth and stoop granite (were brownstone). **The front fire escapes gone** (his picture has none; the back's stay: put back by the `escape(A.y1...`
  line). Cost: some 220 boxes, about 2,600 triangles; no light, no program. **ATMOSPHERE** (a menu tab of its own, after DISPLAY, which had TIME and
  WEATHER buried in it): TIME OF DAY (the slider; DAWN, MORNING, NOON, AFTERNOON, GOLDEN HOUR, SUNSET, BLUE HOUR, NIGHT, MIDNIGHT; STOPPED / RUNNING;
  a day in 2 min to 24 h), WEATHER (NATURAL or one held), SKY's EVENING COLOURS (BY THE DAY, CLEAR, FIRE, SOFT: `SKY.moodHold`), HAZE (DISTANCE HAZE
  MIST / FAR / OFF and DISTANCE LOOK: they had stopped showing anywhere, GRAPHICS' `#dgrain` they hung on being gone). All kept in the save (`clock` {h, run, speed}, `wx`, `mood`): the game opens at the hour and weather he chose (the
  game's own, 5:24 pm stopped and CLOUDY, till he picks); `?hour=`, `?wx=`, `?mood=` still win for a test. `HOUSEAT(dy)` and `LOOKPITCH(deg)` test hooks.
- **The block and its neon alley** (owner, 18 Oct 2026, his photo of a Korean alley at dusk: "build an alley in game that looks like this"; then
  "a row of buildings on main facing central park, (apartments, bodega, dojo) then behind them is an alley that looks liek this. the other side
  facing the hudson is anotehr row of storefronts. use small filler empty buildings for now. total of 6 buildig on each side (leave ones there now)
  add etra room and move hudson further away"; of the mockups https://claude.ai/artifact/KW2So2YsHrCFarhBDRHNxX (`mockups/neon-alley.html`) and
  https://claude.ai/artifact/KFFGpr45Vu5XZFyZdfWD6M (`mockups/main-block.html`), "U call": B (the back row's shops open on the alley too), the
  alley 7 wide, Hangul; `BLOCK` in `006-map-pre.js`, `src/069a-block.js`): **the main row**: the apartment house, the bodega and Ghost Street as
  they were, three empty fillers (x 87-101 and 103.5-117.5 between the bodega and Ghost Street, 145.5-159.5 east of it), brick of `BRICKS.face`
  (two swatches painted once and tiled, a tint each), roll-down shutters, a blank sign band, a few lit windows. **The alley** right behind the row
  (y -99.4 to -92.4, the 'alley' ground). **The back row**: six empty storefronts (x 48 to 159.5, y -111.4 to -99.4), to the Hudson a shutter and
  an awning each, to the alley a shopfront (glass between brick piers, a lit counter) under a lit sign (국수, 만두, 찻집, 라멘, 고기, 빵집). **The
  promenade** (y -119 to -111.4, 'prom') and **the Hudson's bank 15 tiles further out** (`RING.river` from `BLOCK.river`; the force field, the
  mist's box, the fishing stand and the piers follow it). **The alley's look, after the photo**: the fish restaurant's light box (바다의 파도) with
  its canopy of bent tube lights and menu boards, the squid house's white neon (오징어집) and REST plate, the pink neon squid on a bracket, blades
  over the lane (도매액세서리, 안과안경점, 분식, 노래방, PC방, 바), the chicken bar's tall sign on its post (치킨호프맥주, the mascot top and
  bottom), the fish-bun neon (붕어빵), AC units, crates, a delivery scooter, wires sagging across; neon as cut tubes with a dark backing and a halo
  in three hard steps; the Hangul in Black Han Sans and Do Hyeon from Google Fonts, fetched as the block is built (painted first in what the page
  has, again when they come). **Seen from above**: in the isometric and map views, in the alley or on the promenade, everything on the camera's
  side is cut at your knee as a room's near side is (`BLK.band`, `130-rooms.js`), and the main row's own walls (cutWalls) to their foot. Cost:
  some 1,500 triangles (nine boxes, 24 signs, two instanced draws of 62 boxes, one line draw), 9 lamp records (LITE's eight nearest light), no
  shadow lamp, no new program. The fillers are solid boxes, no way in. `BLOCKDBG()`. Not yet: insides, names on the back row's river side,
  characters walking the alley and the promenade. Found on the way: `build.py`'s glob took only `NNN-` names, so an inserted `NNNa-` file (as
  CLAUDE.md suggests) was never built; it takes `NNN*-` now.

- **A controller, as the old game had it** (owner, 19 Oct 2026: "add the controller abilities from the old game to this game (allow
  controllers to paly) all same tusff we had"; `162a-pad.js`, from the old game's `47-gamepad.js`): a standard (Xbox or PlayStation) pad
  plays as the keyboard does, its buttons sent as the very keys (as they are bound in KEYS), read once a frame only while one is plugged in.
  Left stick walks any way at all (`PAD.mv`), right stick looks round (BEHIND, FIRST) or spins the view (ISOMETRIC); A jump, dive; B back,
  closes a box; X uses what you face or stand by (`UI.useNear`: the double click's things), else punches; Y kick; LB / RB turn the view
  (Q / E); LT roll; RT held run, and with the D-pad up / down zoom; L3 the next view (V); R3 resets the view (0); VIEW / CREATE what you can do
  (?); START the menu; D-pad right the pack (I). In a menu or a box the stick or D-pad moves a highlight between its controls, A presses, A takes
  hold of a slider (left / right moves it), left / right steps a list, LB / RB the tabs, B back; nothing walks. The buttons rebind in KEYS (THE
  CONTROLLER, with a pad plugged in; kept as `padkeys`), use and punch share X. A PlayStation pad shows its own names and face-button pictures.
  The old game's card for things in reach and L3's nameplates have no match here yet. Cost: nothing drawn, no lights, nothing run without a pad.
  `tests/padcheck.cjs` (a made-up pad).

- **Free 360, no snapping** (owner, 19 Oct 2026: "i want full 360 view no snapping to views when free view. if y ou press q or e it will
  cut to that shot, (not rotate)", his pick "Isometric drag spins 360", then "in 3rd person view no snapping at all", "in 1st person view no
  snapping at all either"): in ISOMETRIC a right drag (or Shift + drag, or the controller's right stick) spins the view freely all the way
  round, staying where you leave it; Q / E (and R) cut straight to the next of the four angles from wherever it is (`UI.isoStep`), no turn.
  BEHIND no longer swings back to his back when he walks (the 17 Oct "swings back once he walks" is gone): the camera stays where you
  turned it. FIRST PERSON never swung on its own; it stays as it was. Entering a place still sets that place's own angle.

- **The avatar editor in its own menu tab** (owner, 19 Oct 2026: "get rid of shortcut for avater editor, just put it in tab in menu"):
  Shift+K no longer does anything; the menu has an AVATAR tab (before KEYS) with OPEN THE AVATAR EDITOR, EDIT HIS SHAPE and YOUR
  LOOKS (moved there from DISPLAY's HIM row). A double click on yourself still opens your looks.

## The website moves here (18 Oct 2026)

**The white screen** (owner, 18 Oct 2026: "https://thestrangestfleamarket.com/ is just shownig white screen now"): the copy of THE MARKET
in `bralynnb/tsfm` (`market/market.html`, from [bralynnb/tsfm#808](https://github.com/bralynnb/tsfm/pull/808)) had a note pasted on top that
opened `<!--` and never closed it, so the whole page was a comment. Our `dist/market.html` was fine; the hand copy broke it.

**One repo for the site** (owner, 18 Oct 2026: "i want to change the framwork completely", then "1. go 3. after"): this repo becomes the
whole website, so nothing is copied by hand. The door page (`src/door/door.html`, from `tsfm/door/door.html`, comments taken out) and
the door's server (`worker/door.js`: `/`, `/enter`, `/join/check`, `/join`, from `tsfm/worker/door.js`; the multiplayer room and the
sound files left behind, THE MARKET uses neither) live here, with `wrangler.jsonc` (a new Cloudflare worker, `thestrangest`). `build.py`
writes `dist/door.html` too and stops on an unclosed `<!--`. `tests/site.cjs` runs the real worker locally and checks the door shows, a
login gets THE MARKET and it starts, and no file is handed out by itself; `.github/workflows/site.yml` runs it on every push and pull
request. Still to do, the owner's: the deploy step (Cloudflare token), moving the domain from the `tsfm` worker to `thestrangest`.
Next after this: the code as ordinary modules (option 3).

**The site in files, like the old game** (owner, 18 Oct 2026: "the page is stlil showing all the source code and is not using any pulls
from. js or anything else like the old game structure, its insanely large"; chose "split it like the old game"): THE MARKET was one 5.9 MB
page (1.9 MB compressed: about 4 MB of baked models, 1.9 MB of code). The website now gets `dist/g/`: a 4 KB `market.html`, the rig and
the game as their own `.js` files, and each model file as its own `.json`, all named by their contents so a browser keeps them until they
change (an update re-downloads only what changed; the models rarely do). The worker (`worker/door.js`) gives `/g/` files only to a
checked login (remembered 5 minutes), and nothing to anyone else. The code is still readable by whoever plays: anything a browser runs
can be opened; minified as before. The game module stays one file (its source files run into each other, one shared scope).
The artifact keeps the one-page `dist/market.html`. Next: models loaded when first needed (the metro, the creatures), which changes
the game's code.

**Straight in** (owner, 18 Oct 2026: "remove the start up message of game and fade in text, delays, etc. just start game as soon as can"):
the game's loading line ("I took a trip to The Strangest Flea Market...") and its 6 s hold and fade are gone (`000-page.html`,
`094-ui.js`): a plain dark screen until the world is built, then the game at once. The door shows at once too (no font wait, no 1.6 s fade).

**Hunger off for now** (owner, 18 Oct 2026: "turn off hunger and running being disabled ever for now"): food stays full, no hungry or
starving messages, and nothing stops you running (`141-forage.js`; `103-vitals.js`: tired never stops a run).

**Old saves cleared once** (owner, 19 Oct 2026, his avatar vanishing a few steps in on his own browser only, not for another player:
"its just beacuse something is cached"): `SAVE` goes to version 4 (`005-save.js`); the first time a browser opens it, everything the game
kept there from older versions (`market-*`, `isowalk-*`: the saved game, its settings, recorded moves, the look) is cleared and it starts
clean. The login is kept.

**Physics: Rapier, extended** (owner, 19 Oct 2026: "i want to put the physics in the game back like the old game"; of the options, "1."
(stay on Rapier); first "push and throw things, bodies bump each other, your body on by default"):
- **Your physics body on by default** (`090-physbody.js`, saved as `physbody3` so everyone starts with it on; DISPLAY still turns it off).
  Cost: Rapier (0.76 MB compressed from jsDelivr, cached after) loads in the background as the game starts, not blocking it.
- **Bodies bump** (`076-npc-map.js`, `N.push`): walking into a character shares the overlap (he gives way part of it, more the faster you
  come, never into a wall), and running into one shoves him back a step (a push that dies away in a fraction of a second). No new cost.

**Zoom** (owner, 18 Oct 2026: "allow me to zoom out 2 more levels. also when i try to zoom out and i cant anymore it skips instead of just
not letting me"): `UI.MAXW` 19 to 30 tiles; at the limit the wheel does nothing (no zoom-to-cursor shift, `094-ui.js`).

**The sun was gone** (owner, 18 Oct 2026: "no matter what time i make it its staying dark"): the comment strip of 18 Oct (no comments in
src) took `scene.add(sunL,sunL.target)` with it, as it sat after a `//` note on its line, so the sun never lit anything and every hour
looked like night. Back in `129-clock.js`.

**Never into other floors** (owner, 19 Oct 2026: "you should never see the interiors of other floors"): inside the apartment house the
floors above were already cut at your ceiling (`APTS.HP`); now everything of the house below your floor is cut too (`APTS.LP`, a second
clip plane on the house's materials, at your floor), so from a flat's balcony the lobby isn't seen. No new cost.
## 18 Oct 2026: only the corner walkable, the rest into the mist
- **The corner** (owner: "i want to change the map to only make this walkable. the roads going up and right should look like they keep going (central park is huge and this is only 1 corner)"; of the mockups https://claude.ai/artifact/W5rQsTCsnMvrJkBtPEVZHg, "lets do the mist"): walkable from the west street to 8 tiles short of the park's east wall, from the river to 8 tiles short of its north wall (`RING.cf`, `065-ring.js`): the same solid walls, now invisible (no cyan field). The mist starts right at that edge and is full 8 tiles past it, so the park's far walls, the north street and the Avenue stay hidden and the roads run on into it. The skyline keeps the old town box (`RINGX.town`). Characters pick spots and routes only inside it (`stfree`, `STLANE`); the joggers run out and back up West St and along Market St. The menu map shows the corner. A saved DISTANCE LOOK drops its mist start and depth once (`corner` in `farlook`).
- **Loose things: push and throw** (owner, 19 Oct 2026: physics like the old game, "push and throw things"; he chose all of: small
  clutter, light furniture, street things, and "everything not fixed", heavy ones barely budge, nothing bolted down; building
  structure stays fixed). `150-loose.js` (was `150-goodsphys.js`; still `GPH`, on the physics body's one Rapier load):
  - What is loose: every placed thing whose name is furniture or clutter (chairs, stools, bar stools, office chairs, tables, desks,
    benches, barrels, crates, boxes, bags, bottles, jars, pots and potted plants, radios, TVs, lamps that stand, vacuums, newspaper
    rack, fridges, wardrobes, beds, sofas, bookshelves, cabinets, chests, speaker stacks, dumpster, bins), the street's trash cans,
    and the bodega's 208 goods as before. Fixed: walls, floors, doors, windows, stairs, columns, fences, counters and bars, shelves
    and coolers, sinks, signs and neon, anything on a wall, lamp posts and park lamps, rugs and mats, planted beds, the castle.
    Boxes, crates, glasses, bottles, tapes, bones split into one body each; any other thing is one body.
  - Bodies only within 12 tiles of you and on your floor (asleep until touched; frozen and taken out of the world past 15 tiles);
    fixed colliders streamed around you from the walking solids, the fixed boxes, the ground (4-tile blocks) and, near the bodega,
    its shelves and walls. Walking into a light thing shoves it (a body that follows you, pushing with a person's force), so a
    heavy one (over 30 kg: wardrobes, fridges, beds, sofas) barely moves and still blocks you where it now stands; a light one's
    walking solid is gone once it is a body. Punches and kicks send things flying (heavy ones a little). Click a light thing to pick
    it up, click again to throw it (SHIFT+click for a seat or a lamp, whose click is still sit or switch). Things sleep when still.
  - Cost: no triangles or lights added (a moved thing's faces are moved out of the batched mesh into its own small mesh: one draw
    call for each thing that has ever moved); about 350 fixed colliders near you. In the cloud's software rendering: 1.6 ms a frame
    with everything asleep in the bodega (180 bodies), 4.7 ms with 100 awake.

## 19 Oct 2026: the Day 1 station in place of the Metro
- **The very first station** (owner: "lets replace the subway station with the very 1st one with security drones, passport machine, etc.";
  his pick "Station + machine + drones", no arrival scene: you still start where you did; the old game read once for it, read-only):
  the Metro (`010-metro.js`, `data/metro.json`, its car ride) is gone; the Day 1 station of the old game (its 11 Oct room, the owner's
  `subway-station-target.webp`, plus the 10 Oct look of `23-pack-objects-4-station.js`) is THE subway, built always (`012-wsub.js` its
  painters, `013-main-3.js` the room, `013a-day1.js` the stairs, the way in and the drones). One storey down as in the old game (the
  platform at the loop tunnel's depth, `STN.DY`), the room 25.5 x 10.4 tiles under the lot running east-west, the track's tunnels 12 tiles
  past each end. **The stairs**: the street opening where the Metro's was (tiles x 60-64, its top on the sidewalk's back edge), 12 concrete
  steps with yellow nosings 6 tiles down to the platform's back wall, tiled sides, green railings round it at the street (`MAPSTAIR`).
  Three treads down ENTERING SUBWAY and you're at the stairs' foot (`METRO.door`, as the Metro's; `?subyaw=0..3`), five treads up from the
  foot LEAVING SUBWAY. **In the room**: the tiled back wall (posters, two MARKET ST name plates, red cables on brackets, all cut with the
  wall), the curved far wall with its three big posters, two tiled columns with dome cameras and amber boards (PLEASE MIND THE GAP / TRAIN
  ARRIVING / 14:03), four steel benches facing the track (double click to sit), two bins, TO STREET hung over the stairs' foot (reads from
  both sides now), a NO ENTRY gate in each end wall, the arched tunnel mouths with a red signal in each, the old car parked at the platform,
  the steps down to the track at each end, eight cool lamps. **The passport machine** (steel cabinet, lit screen, slot) against the back
  wall beside the stairs, **two security drones** perched on it (silver balls, a dark band, a green lens, a rotor: made in parts). The first
  time you come within 4 tiles of the machine in a visit they lift off (a chirp), float to your right and left at head height, scan you
  (a green ring sweeping shoes to head and back, a beam from each lens, a code-made `scan` sound in `091-sfx.js`), the first says THANK YOU
  FOR YOUR COOPERATION. in the speech style (`LINES.say`), and both go back and sit still. They run only while you're down there.
  Hooked as the Metro was: `MODS.station` (ground, plat, path, lane), THE PLATFORM / THE SUBWAY STAIRS, lives' way down, the rats (now on
  this platform, `METRO.rats`), the newsstand untouched. **Cost**: the station 1,784 triangles, its stairs 532, the drones 312 (the beams and ring 80 more while
  scanning); the platform's whole screen about 80,000 with you and the rats (the Metro's 130,000); 10 lamp records (was 11; LITE's eight
  nearest light), no new program; a frame the same as before with the drones home (they move only while out); the page 0.93 MB smaller (`metro.json` dropped). `tests/day1shot.cjs <out>`. **Found on the way**
  (`161-perf.js`): `PERFX.bounds` gave the walker a fixed bounding sphere at the world's middle, so far from it (here, the new platform) you
  vanished from some angles; the walker is never culled now. **Left out**: the black card, the train arriving, the force field and passport
  form (not wanted); riding a train (the car is parked); `tools/metro-bake.py` kept in case the Metro comes back.
## 19 Oct 2026: three new avatars on standard bones

**Three new avatars, the Walker untouched** (owner, 19 Oct 2026: "is there a total package we could use that gives me the character,
movements, etc all in one?"; his mockups, https://claude.ai/artifact/9938S4GnmWdHACvY5PmAMG; "lets make all 3 options in game";
"dont change the current avatar, add those as 3 new ones"): GRAPHICS gets an AVATAR row: WALKER (the default, as he was), WALKER ON CLIPS,
MANNEQUIN, VROID; `?avatar=clips|mannequin|vroid`; kept in the save (`avatar`). `src/087a-avatars.js`. Each new one is its own body
standing where you stand (the Walker hidden while it's chosen, nothing of his changed); the game's rig still moves you, and the body plays
the standard animation library's clips for what you're doing (standing easy, walk / jog / sprint by your pace, a jump, the punches, roll,
crouch, sit, swim, dance, falling). All three share one skeleton layout, so any clip library made for it (Mixamo, Quaternius, CMU) can be
baked in for all three.
- **WALKER ON CLIPS**: a copy of the Walker as the game draws him (his pieces and paint, read out of the built page by
  `tools/hybrid-probe.cjs`, `tools/hybrid-bake.py` → `data/hybrid.json`) set on the standard skeleton sized to his proportions. A copy:
  the avatar editor's changes reach him only when re-baked. 14,870 triangles (as the Walker).
- **MANNEQUIN**: the animation library's own body (`data/ual.json`, back from 18 Oct), in skin, briefs, jeans, shirt, shoes and hair as
  on 17 Oct. About 7,000 triangles.
- **VROID**: a VRoid Studio character (pixiv's free sample, `data/full/vroid.vrm`; `tools/vrm-bake.py` drops the face expressions,
  bump maps and thumbnail, textures to 512 px → `data/vroid.json`, 2.5 MB). Loaded only when first chosen (`__LAZY__` in build.py:
  inline in the artifact, fetched on demand on the website), with three-vrm from the CDN. 36,470 triangles, its own toon shading.
- The library's clips trimmed to the 17 the code names, at 12 fps (`tools/trim-clips.py`).

**The Walker on clips replaces the Walker** (owner, 19 Oct 2026: "can you send this avatar shape to the main game?"; his picks: WALKER ON
CLIPS, "Replace the Walker"; then, his shot of his own bald, plainer Walker on the clips: "I sill look like this"): you are the WALKER ON
CLIPS body itself, the copy of the default Walker with his hair and paint (`data/hybrid.json`, `BUILD.walker` in `087a-avatars.js`), on
the standard skeleton and its clips, from the start; the hand-animated Walker is hidden (still drawn while the avatar editor is open, so
the editor has someone to show). AVATAR: WALKER, MANNEQUIN, VROID. The avatar editor's looks don't reach this body until it is baked again
(`node tools/hybrid-probe.cjs && python3 tools/hybrid-bake.py`, after a `MIN=0` build). 14,870 triangles, as the Walker.

## 19 Oct 2026: REPORT A BUG and the owner's queue

**Report a bug** (owner, 19 Oct 2026: "add a report bug feature that lets users report a bug and send screen shot and it autotmatically
goes to you"; asked where and how fast: "1 . all 2 .instantly , just queue them all for now", "build queue for me to approve"): the menu's
last tab, REPORT A BUG, and F8 anywhere (`136a-bugs.js`). Opening it takes the picture of the game behind the menu (the next frame read off
the canvas, so nothing costs a frame while playing; JPEG, under 300 KB), and a box asks what went wrong. SEND stores the words, the picture
and where it happened (position, level, nearest place, hour, view, build, screen, browser, the page's last errors) at once:
- on the website: Supabase's `bug_reports` (the old game's table, reused) and `bug_shots` (new: the picture as text, so a session can read
  it with SQL); a player sends only their own, only admins (`admins`) read and mark them. The login is the door's (cookie `tsfm-pass`,
  renewed from the door's saved session when it runs out).
- on the claude.ai link: the page's `db`, `bugs/<id>` and `bugshots/<id>` (published with `{db:{}, user:{}}`; `user` tells the owner).
**The queue** is under the report box for the owner only (an admin on the website, the artifact's owner on claude.ai): NEW, APPROVED, LATER,
FIXED, NO, each report with its words, where, PICTURE and GO THERE (puts you at the spot, facing the same way, at the same hour).
For now nothing is fixed on its own: every report waits in NEW for the owner to APPROVE. A session asked to "work the queue" takes the
APPROVED ones (see CLAUDE.md), fixes each, and marks it FIXED. The 16 reports already in `bug_reports` are from the old 2D game.
`tests/bugcheck.cjs art|site` sends one with a stand-in store and approves it.

## 19 Oct 2026: the apartment house becomes an empty hotel

**The hotel** (owner, 19 Oct 2026, his picture of the house's corner and stoop at night: "make the texture and depth style, etc more
realistic on this building. like we did with the bricks on sidewalk, central park ... not just straight lines with no lived in realness.
give each thing realistic textures. i want to change this into a hotel. all floors empty. no people have apartments assigned anymore.
everyone starts where they logged off"; his picks: "Everything bare", new players start in "Central Park", apartment 1 / mail / rent /
residents "Remove all of it", "No sign"): `054-apts.js`:
- **Bare inside**: every floor just its floor, the stairs and the elevator: the lobby's mailboxes, bench, plant and directory, the side
  rooms, the cottage floor and its furniture (and with it the computer and the delivery drone, which stood on the cottage's desk), the
  flats' walls, doors and furniture are gone.
- **The stone weathered**: every block of the limestone its own tone and tint (`BRICKS.TINT`), grain, a lit top and shaded foot, chipped
  corners and pits, hairline cracks; the rusticated ground floor rough-faced with deep joints; grime streaks run down from every sill and
  from under the cornice, the foot darker with rising damp and moss in the lowest course (`blk`, `weather`, `rock`; the file's own small
  noise, `vn`/`gr`/`ck`). The stoop, its cheek walls, the house's base, the cornice and balustrade in jointed, grained stone (`rock`), the
  treads worn paler down the middle. The two planters built of brownstone blocks, each its own shade (`069-dress.js`).
- **The start**: someone new starts in Central Park (`135-where.js`, `UI.goPlace`); everyone else where they logged off, as before.
- **No homes in the house** (his pick, "Remove all of it"): the four residents are gone (`154-residents.js` removed; their pawns walk
  the street like the others); your mailbox, its panel, the welcome letter and the rent every third day are gone, and rent, the
  RESIDENTS list and GO TO YOUR MAILBOX are off the CITY tab. Workers live only over their own workplace; with none they stay out at night;
  nobody sleeps in the house. Your money (`MAIL.you`), the shops' and the tower's mail and the street's mailboxes stay.

## 19 Oct 2026: you are a stick figure

**The avatars gone, you a stick figure for now** (owner, 19 Oct 2026: "lets get rid of player avatars completely. keep the physics and
animations and just make the character play as a stick figure for now"; his picks: delete it all, just you (the street's Walkers, pawns
and creatures as they were), solid 3D sticks, the current clips): you are a stick figure built in code (`087a-avatars.js`): round sticks
for the spine, neck, shoulders, arms, hips and legs, small balls at the joints and hands, a ball head, all in one dark colour, cel-shaded
and casting a shadow like the rest; on the standard skeleton, playing the same clips as before (standing easy, walk / jog / sprint by your
pace, jump, punches, roll, crouch, sit, swim, dance, falling). The game's rig still moves you (the physics unchanged). 644 triangles (the
Walker on clips was 14,870). Gone: WALKER / MANNEQUIN / VROID and GRAPHICS' AVATAR row, the menu's AVATAR tab, the avatar editor (its
shape, looks, animate, speed and body-type tabs, the posing void) and the standalone `avatar.html`; `data/hybrid.json`, `data/vroid.json`
(and `full/vroid.vrm`), the mannequin's mesh out of `data/ual.json` (its skeleton and clips kept), their bake tools and tests. Clicking
yourself opens YOU: your name, health and stamina. The hand-made Walker still runs unseen under you (his rig is the physics) and the
bearded Walker keeps the head shapes he borrowed from the editor (`ED.HEADS`, `097-editor.js`).

**His mannequin, not the stick** (owner, 19 Oct 2026, his shot of the stick figure: "why is he standing like that? ... he has his
shoulders lifted high"; then his `Humanoid.fbx`, "make it my body"): the stick's shoulder bars ran up from mid-chest to the shoulders,
so he looked shrugged. You are now his mannequin (`data/full/humanoid.fbx`, Blender, no bones: `tools/humanoid-bake.cjs` →
`data/humanoid.json`, 6 KB), sized to the UAL skeleton (it matches it: height, hips, shoulders, arm length within 3 cm). It stands in an
A-pose, so the skeleton's arms are lowered to it before binding; each corner weighted in code to its nearest one or two bones. One flat
light colour, cel-shaded, casting a shadow; the same clips. 402 triangles.

**His mannequin moved by his own rig** (owner, 19 Oct 2026: "is this using all the other techniques we added earlier where he is actually
touching ground, can run in circles, lean, etc."; his pick of two: drive the mannequin from the rig): the clips are gone from you; every
time the rig works out his pose (`ASTEP`), each of the mannequin's bones takes the turn of the rig's piece it stands for (hips, torso, neck,
head, upper arm, forearm, hand, thigh, shin, foot: the piece's axis from its joints, its twist from the piece's own frame), measured from
the rig's rest to the mannequin standing the same way. His hips go where the rig's go, as high as the rig's are of theirs; each leg
reaches (two-bone) for where the rig's ball of the foot is in the world, so a locked foot stays locked. So he has all of it: feet planted
in the world (straight, running, round a circle, turning, stopping, the settling steps, stairs), the lean into turns, the weight carried
on at a stop, the jump, the moves, sitting, swimming and the ragdoll (`ragPose`). Not followed: the PHYSICS BODY option's own jiggle
(it moves the old Walker's pieces, not the pose). Measured (in the page, the rig played as `tests/footworld.cjs` plays it, 60 fps): a
planted foot moves under 1 cm a second walking, running, round a circle, stopping and on stairs (2.8 through a sharp quarter turn, where
the rig's own pivots); flat on its ground within half a centimetre (3-4 on stairs). The page no longer carries `data/ual.json` (its
skeleton now in `data/humanoid.json`, 16 KB): 260 KB less. Cost: some 60 bones set when his pose changes, a fraction of a millisecond.

**His movement audited, fluid first** (owner, 19 Oct 2026: "walks terrible"; then "do a complete audit of his stance and movements make
sure it makes sense, quick turn, leaning runs, i want him fully mobile like tomb raider. fluid. its #1 priority"): every move filmed
side-on and from behind on its own (a page of the rig lifted from the build and the shipped 087a: stand, walk, run, start, stop, run-stop,
U-turn, a running circle, jump, running jump, roll, kick). Found and fixed:
- **Crouched walk, lunging run**: his hips had been the rig's height scaled up, and the short-legged rig drops its hips to reach its steps.
  Now his hips stand as high as his own legs reach both feet (straight at rest), lowered further only by what the rig crouches beyond its
  own legs' reach past its soft-kneed "standing easy" (sitting, landing, ducking). Off his feet (in the air, rolling, flipping, falling)
  his hips follow the rig's (lower: in proportion; higher: the jump's true height), the two blended by how upright he is and how far his
  feet are off the ground. Jumps no longer fold his legs back; the roll stays above the ground.
- **Hips behind his feet**: the ball of his (longer) foot is pinned where the rig's is; his hips are set back by the difference, in his own
  frame (so it doesn't drift in a circle).
- **Boxer's arms running**: the elbow follows the rig's bend at 70%.
- **Choppy moves**: your pose is now worked out every frame always (it was 10 a second standing and in moves, `ASTEP`); the street's
  characters keep their steps (GRAPHICS' setting).
- **Turns snapping**: your heading eases to where you steer (two thirds of the way in about 80 ms), at most 540 degrees a second as before.
The lean into turns is the rig's own: 15 degrees round a running circle (he leans 14). Measured: a planted foot moves 1 to 4 cm a second
(walk, run, circles, stops, stairs), 4 through a sharp quarter turn.

**Built like the Walker; knees only bend forward** (owner, 19 Oct 2026: "run left and right and see how it looks (not good)"; then "make
him built more like shape of the other avatar, short, stocky, bigger head, less realistic"; then, of a running frame, "legs bending
backwards?"): the mannequin is reshaped, once, when he is made, to the Walker's own rest skeleton (`RIG.restOf()`): each joint where the
Walker's is (short legs, the hips at his, the arms to mid-thigh), each bone's flesh carried with it, stretched along the bone to its new
length and thickened across it (legs 1.5, arms 1.4, hands and feet 1.35, neck 1.5, body 1.25); the bones re-bound there. His own head is
folded away inside a round one the Walker's size (an icosphere, 320 triangles, smooth, on the head bone). With the rig's proportions his
moves fit him: the run, the reversals left and right, the jump. Also: the run's flight (both feet a little up) no longer counts as being
off his feet (only more than 6 of the rig's units does), so he no longer drops to a kneel after a reversal; moving, only 15% of the rig's
extra hip dip is passed on (all of it standing: sitting, crouching); the run's elbows are the rig's again. **Knees**: the rig itself
bends a knee backwards in some run frames (37 in 4 s); each knee now bends toward the way his hips face (none backwards, walking or
running). Planted feet: under 1 cm a second (walk, run, circles, stops, stairs). 722 triangles.

## 19 Oct 2026: lighter skeletons for a pixel game

**The heaviest characters cut** (owner, 19 Oct 2026: "since we are do a pixel style game do we really need such high quality chracter
mesh?"; his pick 1 of three: cut only the outliers, aiming at about 1,000-1,200 triangles). By `tools/simplify.py skel pawns`, the
heads kept exactly as they are (17 Oct) and the rest of the body to a fifth, so they land a little above the aim: the four skeleton
pawns 4,128/3,478/3,252/3,816 → 2,334/1,684/1,458/2,022 (mage, reaper, guard light, guard heavy), the four KayKit skeletons
3,706/2,784/2,982/3,218 → 2,364/1,698/1,596/1,986 (Warrior, Mage, Minion, Rogue; theirs from `data/full/skel.json`). The pawns are made
of coloured parts: each part kept its own (so the guard's dark eye sockets and the belts keep their colour and edge) and the small ones
(belts, buckles, pads: under a fifth of the faces) kept whole; cut to a fifth they broke. Checked side by side on their sheets.
The pawns' full meshes now kept in `data/full/pawns.json`. `data/pawns.json` 1.62 MB → 0.96 MB, `data/skel.json` 375 → 274 KB.
