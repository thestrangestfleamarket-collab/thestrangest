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
- **The clock** (17 Oct 2026, `src/clock.js`): the hour, 7pm when the game opens; the sun over New York in mid-October (its height, its way round, its shadows), the sky and the open air's light by it, the moon at night; DISPLAY's TIME (the hour, STOPPED / RUNNING, a day in 2 min to 24 h); N noon / 7pm.
- **The guards** (17 Oct 2026: "patrol the streets as guards and really protect us"; his picks: patrol routes, fight threats; `src/npc-skel.js`): each skeleton marches his beat (the Warrior the shops' sidewalk, the Rogue the far one, the Mage and the Minion the road), on guard at each end. **Troublemakers** (small hooded figures: the Rogue gone dark, red eyes) come up the subway stairs after dark, one or two now and then, and go for you on the street (a punch shoves you back, no harm); every guard near comes running and fights his own way (blade, fists, crossbow bolt, spell), the troublemaker falls, gets up and runs back down; a cheer, and back to the beat. The pack's own combat clips (KayKit Skeletons 1.0 on GitHub, CC0: `tools/skeletons-clips.py`).
- **The apartment building** (17 Oct 2026, his plan from a mockup, "a fifth bigger"; `src/pool.js`, `POOLR` in `map-pre.js`): the pool room's building made the apartments' ground floor, 27.3 x 16.8 tiles: the right third the lobby (the front door) and the office behind it; the left two thirds a hallway through the middle to the stairs and the lift at its far end, the pool in front of it (across, left to right, all one depth, deep, a small diving board at its west end), the gym behind it. Inner walls cut to their foot while you're inside (`always` cut walls). The roof meets the walls' tops.
- **The land** (17 Oct 2026): flat grass all round the map (`MODS.land` in `map-post.js`), open over the road, the stairs and the pool's basin. **How far out**: the zoom stops at some 34 tiles across (`UI.MAXW`), and the view can't slide far past the map's edges. **Never under the ground**: the tilt stops level with the street.
- **The musician's arm** (17 Oct 2026, "his elbow is lifted unnatural"): his strumming elbow hangs by his side (`GTPOLE.R` in `musician.js`).
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
- **The castle and its dungeon** (owner, 17 Oct 2026: "lets bring back ... the castle, the dungeon under the castle (only 1 level)", "expand central park but the castle on the left back end"; `src/castle.js`, `CASTLE` in `map-pre.js`): the park twice as deep (`PARK.y1` -5); the old game's castle from its own makers (23-w-dungeon-3-castle-1-stone, -2-pieces, embedded by build.py word for word, `BOD.KC`; the gatehouse turned to stand out toward the street) in the park's back-left corner: the curtain wall between four drums, the gatehouse in its front, the bailey's grass, the gravel to the stairwell, its rim, the well. Under the bailey, at the subway's depth, one dungeon: the old castle's great hall (its walls and cobbles by 23-w-dungeon-1-room's painters, its things from 23-w-dungeon-2-things: the arcade, columns, brazier, barrels, crates, straw, bones, skulls), down twelve steps from the bailey (`CASTLE.stair`, the second stair in `STAIRS`, map-post.js); the torches' flames are blocks with flickering lights (the game's moving pictures don't run), the mice and the dust left out. The menu's PLACES has THE CASTLE and THE DUNGEON. **A fix found on the way**: the park's lawn painter was mirrored front to back (row 0 of a painted ground is y0, as gbox's tops are); the dojo's floor painter (`ghostdojo.js`) has the same mirror, untouched.
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
  view"), from under his chin to overhead; BEHIND swings back to his back only once he walks (`UI.look`). FIRST PERSON looks from his own eyes
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
- **The glow's amount** (17 Oct 2026, "30% between off and glow"): the soft glow at 0.3 to begin with; AMOUNT slider beside GLOW.
- **Feature list**: `TODO.md` (the owner's asks for later: NPCs that talk with a real AI and ElevenLabs voices, their lines saved and reused).
- **The musician** (17 Oct 2026, `src/musician.js`): the game's guitarist brought over whole (build.py reads the game's 47-play-3-guitar-1-body, -samples.data, -2-tunes, -3-hands, and embeds `audio/guitar.mp3`; small stand-ins for the game's cast and sound): a second Walker with his finger bones, the classical guitar (its solid hull; the game's hollow one breaks up as a mesh), the book of tunes in turn, his hands solved onto every note with weight; on the sidewalk by the bodega in the street light, lit by the lamps; his recorded notes, louder as you near him, from his side (sound starts with your first click or key). A double click on him: the camera close on his hands (16 times in, the wheel closer still) with the SHARPEN bar (owner, 17 Oct 2026: "zoom in all the way and add a sharpen bar to adjust to the level i want": the art from coarsest to one screen pixel each, past the menu's ceiling here only, the level kept in the browser; C back, the sharpness as it was).
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
  The guitarist stays on the bodega's sidewalk (the game had him busk outside too). Not found in the game: "raincoast" (asked back).
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
- **The gold skeleton** (owner, 17 Oct 2026, his picture of a gilded clockwork skeleton with a white skull face: "put this character in game, use
  the other skeletons as guides for character design"; "make him 2x bigger"): the KayKit Minion's bones and body gilded at load (`gild` in
  `npc-skel.js`: gold by each bone's own light and shade, the face under the eyes and the jaw bone-white, the neck a steel spring, the eye sockets
  black with no glow, no cloak), 1.4 m (twice the others), unarmed, strolling the whole street as they do. The Minion's and the Rogue's meshes
  came out of the bake 2.2 rig units ahead of their bones (the pack's files lay them there); `npc-skel.js` moves them back at load, so those two
  guards and the troublemakers now draw where they stand.

## THE MARKET: the one official map

**THE MARKET** (owner, 17 Oct 2026: "one official MARKET map im gona start filling in") is the game's map here: every place the owner adds goes
into it, on its street or under it (the subway's level), next to what's there; not new separate pages. It's built to `dist/market.html` and
published to its own artifact, **https://claude.ai/artifact/X2Bk8UjQKP8yfLdLtVVn3s** (update that one, keep its link; don't make new pages for
new places). A place's code is its own file in `src/`; `map-pre.js` says where each place stands (its offset, its level), `map-post.js` joins
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
  - `npc-map.js`: the goldfish on the street and the bear wandering the platform (and `makeNPC`, every character's maker). `npc-skel.js`: the four skeletons on the far sidewalk, rigged and animated, and the gold skeleton (the Minion gilded).
  - `npc-street.js`: the cyborg and the teddy on the street (bones, moves, bodies in Rapier, minds). `npc-rigged.js`: the six figures made a second way (kept, not built: `npc-figures.js` is used).
  - `npc-dragon.js`: the Dragon on the road. `kit.js` + `dress.js`: the kits' pieces and the few on the street. `apts.js`: the apartment house (in the
    bodega's scope, after `bodbuild.js`).
  - `npc-dragon.js`: the Dragon on the road. `kit.js` + `dress.js`: the kits' pieces and the few on the street. `apts.js`: the apartment house (in the
    bodega's scope, after `bodbuild.js`). `npc-figures.js`: the six figures (KASA, GEKKOU, DRIZZEL, KURENAI, SAMIDALE, SHOGUN) on their Mixamo
    bones, posed here, and the effects (smoke, the blade's trail, dust). `npc-creatures.js`: the packs' small animals on their own bones and clips. `npc-parts.js`: the parts builder; `npc-mushroom.js`: the mushroom seller, built in code in his parts.
    `park.js`: Central Park's entrance past the far sidewalk (the wall and gate, the pavers, the lawns, the pack's trees and rocks, the undergrowth,
    the pots, the lamps). `boats.js`: the kayak and the fishing boat afloat in the pool.
- `data/`: the characters baked from the owner's models (`goldfish.json`, `bear.json`), the skeletons, their gear and clips (`skel.json`), the six figures (`figures.json`), the park's trees and rocks (`forest.json`), the undergrowth, pots and boats (`props.json`), the creatures (`creatures.json`), the Dragon (`dragon.json`), the kits (`kit.json`). `tools/`: the
  scripts that baked them (they need the owner's .glb files and `fast-simplification`; `skeletons-bake.py` the KayKit pack, unzipped;
  `skin-bake.py`, `skin-bones.py`, `item-bake.py`, `mesh-cut.py` the street's characters and items: `trimesh`, `scipy`, `scikit-image` too;
  `figures-bake.py` the six figures, `forest-bake.py` the park's pack, `props-bake.py` still things from .glb or .obj with a palette, `creatures-bake.py` rigged ones with their clips; the packs' .fbx made .glb with npm's fbx2gltf).
- **Screenshots of other characters never show his avatar** (owner, 17 Oct 2026: "stop showing my avatar in screenshots of other characters"): a test looking at a character opens the page with `?hideme=1` (the Walker not drawn, `W3.hideMe` in `walker3d.js`).
- `tests/`: Playwright screenshots (`mapshot.cjs`: the street; `maptour.cjs`: platform, pool, bodega, stairs, a walk down; `skelshot.cjs`: the skeletons, close; `hairshot.cjs`: his hairstyles from four angles, walking and stopped; `mushshot.cjs`: a character built in parts (the mushroom seller; another with its debug hook's name as the last argument), close, by day or night; `sheet.cjs <key>`: a character's sheet (black void, close, limbs spread, full res: `?sheet=key&fullres=8`; `?npcat=key,field` stands one out on the land); `streetshot.cjs` the
  street's characters over a few moments; `streetact.cjs` one of them told each move, close up; `figshot.cjs` the six figures over a few moments; `figact.cjs` one told each move; `parkshot.cjs` the park's gate, round and path; `creatshot.cjs` the creatures by day and night; `poolshot.cjs` the boats). The page takes
  `?at=x,z[,height]` to start somewhere, for tests. In a cloud container rendering is software (slow, ~20 fps): run them in the background.

## Where it's going

Building it into a fuller game one piece at a time. First map done (16-17 Oct 2026): one street; the bodega and the pool room side by side;
the subway underneath, stairs down from the sidewalk. Next pieces are the owner's call. The list of what the game has that this doesn't
(places, NPCs and animals, activities, weather and time of day, multiplayer, menus) is in `README.md`.
