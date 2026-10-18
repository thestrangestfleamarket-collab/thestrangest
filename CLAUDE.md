# The Strangest Flea Market in 3D (three.js): start here

A separate project from the game: the owner (Bralynn) is building **a new version of The Strangest Flea Market in three.js**, one
piece at a time. It is **not** the live game and never ships to it. The live game is the repo `bralynnb/tsfm` (thestrangestfleamarket.com);
this repo is `bralynnbell/thestrangest`.

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
- **The land** (17 Oct 2026): flat grass all round the map (`MODS.land` in `map-post.js`), open over the road, the stairs and the pool's basin. **How far out**: the zoom stops at some 34 tiles across (`UI.MAXW`), and the view can't slide far past the map's edges. **Never under the ground**: the tilt stops level with the street.
- **The musician's arm** (17 Oct 2026, "his elbow is lifted unnatural"; again, "fix the guitarist arm"): the game's guitar sat high on his chest, so
  the strumming forearm could only cross it from an upper arm held out level (measured: the elbow at his shoulder's height, 7 of his units ahead).
  Now the guitar hangs lower on its strap, the neck up a little more, the right wrist over the lower bout's upper edge, the elbow down by his side
  (5.7 under the shoulder, 4 ahead, 2 out), his fingertips as near their notes as before (`MUS.hold` in `musician.js`, `GTWR`; `tests/gthold.cjs`).
- **Ghost Street** (17 Oct 2026, "bring in ghost street from old map"): the old game's own makers of the kit's wooden shop (`23-w-ghost-street.js`, read by build.py, in a block of its own), "Preset Ghost Street 1" without the row houses and the pole: the shop, its upper floor, the tiled roof, the eave with its sign and cooler, the bay window, the door curtain, the drinks machine, the planted beds and lanterns; east of the apartment building, its front and paved forecourt to the street (`GHOSTST` in `bodega.js`). Its six ghosts: to come.
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
- **Edit the world** (17 Oct 2026, `src/worldedit.js`): Shift+E; a double click picks a thing (every face is tagged with its thing as it's built: `BATCH.tag`, `OBJS` in `batch.js`; so far the shop's things and the station's benches, columns, signs, signals, train); move (drag, arrows, up/down), turn, size (all, width, height, depth), colour tint, see-through (dithered), delete, back as it was; DESCRIBE A CHANGE asks Claude through the artifact's `sample` capability (publish with `capabilities: {sample:{}}`) and applies the same edits. Kept in the browser. Not yet: lamps and what he bumps into follow a moved thing.
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
- **Smooth light, the default now** (owner, 17 Oct 2026, of the grainy cloud and tree mockups: "i dont like any of those mockups, they all look like dots everywhere, i want smooth realistic shadows and lighting like gradient radial etc"; it supersedes the grain and the 24 steps above): `SMOOTH` in `map-pre.js`: no grain, the light not cut into steps, soft shadow edges (PCFSoftShadowMap), the lamps' pools smooth radial gradients; GRAPHICS' LIGHTING switches back to PIXEL (`market-lighting`), `?look=pixel|smooth`.

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
  `N.reshape` / `N.recolour` by part, `N.B` the bones. `?toonhold=1` stands the five in a row; `tests/toonshot.cjs <out> [hour] [zoom]`.

- **The opening view and V, again** (owner, 17 Oct 2026, his picture of the dojo: "i want the game to always start you this distance and at this
  isometric angle, q & e to rotate, v wlil take you in 3rd person view over their shoulders and they can look around 360 and up and down. press v
  again and in full free view 1st person view"): ISOMETRIC opens at the half turn from the angle before, 1.5 times in (0.7 of the 2.2 before;
  `UI.setView` in `ui.js`); Q / E jump between its four angles; V: BEHIND, the camera over his right shoulder (0.45 m out), a drag looks all round
  and up and down, the camera brought in before any wall between his head and it (the solids he walks into); V again FIRST PERSON (a drag looks
  anywhere); V again back to isometric. `tests/startshot.cjs <out> [place] [view] [w] [h] [keys]`.

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

- **No DESCRIBE, no DOWNLOAD; nothing of the world inside** (owner, 18 Oct 2026: "remove describe and download buttons. anytime someone is in
  interior rest of world should always vanish"): the world editor has no DESCRIBE A CHANGE (no call to Claude, no `sample` capability); HIS SHAPE,
  MOVES and the avatar editor have no DOWNLOAD (LOAD stays). Inside a room the rest is gone: the civic tower is a room (`rooms.js`), and what
  draws with its own shader and so isn't cut by the room's planes hides itself while you're in one (the sky dome already; now the force field,
  the river and its bank, `ring.js`). A doorway still cuts nothing until all of you is half a tile in (17 Oct's rule).
## THE MARKET: the one official map

**THE MARKET** (owner, 17 Oct 2026: "one official MARKET map im gona start filling in") is the game's map here: every place the owner adds goes
into it, on its street or under it (the subway's level), next to what's there; not new separate pages. It's built to `dist/market.html` and
published to its own artifact, **https://claude.ai/artifact/X2Bk8UjQKP8yfLdLtVVn3s** (update that one, keep its link; don't make new pages for
new places). (Another session published to PnmQqhkusfewby35tf4zo5 for a while, a link the owner's main session can't open or update: 17 Oct 2026, version 47 back on X2Bk.) (17 Oct 2026, later: X2Bk could not be opened from this session's account, so the tomato and his friends and the opening view went to **PnmQqhkusfewby35tf4zo5**, version 15; try X2Bk first, then PnmQ.) A place's code is its own file in `src/`; `map-pre.js` says where each place stands (its offset, its level), `map-post.js` joins
them (the ground, the levels, what cuts away). Its first places: the bodega, the pool room, the subway station and its stairs.

**Not updated any more** (owner, 17 Oct 2026: "stop updating tsfm im not working there anymore"): nothing goes to `bralynnb/tsfm` from here; the copy there stays as it was last merged (version 8.0.1: at his word, "pull in all merges and go live", [bralynnb/tsfm#801](https://github.com/bralynnb/tsfm/pull/801); before it 8.0.0, [bralynnb/tsfm#800](https://github.com/bralynnb/tsfm/pull/800), 7.9.9, [bralynnb/tsfm#799](https://github.com/bralynnb/tsfm/pull/799), and 7.9.8, [bralynnb/tsfm#798](https://github.com/bralynnb/tsfm/pull/798)); ask before each update there. The artifact link is where THE MARKET is played. What follows is the old way, for the record.

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
  - `station.js` + `wsub.js`: the subway station (the game's West End station). `pool.js` + `water3d.js` + `floats.js`: the pool room,
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
