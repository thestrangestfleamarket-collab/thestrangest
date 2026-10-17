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
- **The views** (17 Oct 2026, Display's VIEW): MAP VIEW (the free one), ISOMETRIC (a quarter turn at a time, the tilt fixed), THIRD PERSON (behind him, the wheel in and out, never under three feet), FIRST PERSON (his eyes). The tilt in the map view never under ten degrees ("cant go completely horizontal").
- **Your looks** (17 Oct 2026, `src/looks.js`: a double click on yourself, or Display's YOUR LOOKS): name; MALE / FEMALE (HIS SHAPE's bodies); five hairstyles (short, buzz, long, bun, bald) and five beards (full, short, goatee, moustache, none), made once in `walker3d.js` and folded away when not worn (`W3.HIDE`); five colours each for skin, hair, eyes, shirt, trousers, shoes; his face (eyes, brows, a mouth line); his fingers, one piece each. **His shading**: steps of light on him 2-5 and the shadows' depth (sliders here and in Display), SELF on him when lamp-lit.
- **Health and stamina** (17 Oct 2026, `src/vitals.js`; `hp`, `sta` on every character): running spends stamina, at none no running till a third is back; blows cost health, at none you faint (down as a body, up again with some back). Two small bars bottom left only while not full.
- **The dragons** (17 Oct 2026: "all green (4 shades) and 20% as big ... flying all around city and mostly park. add 10 of them. they breath large fire balls"; `src/npc-dragon.js`): ten, a fifth the size, four greens; flying mostly over the green round the street, now and then down on a ledge; now and then a fireball down ahead (glowing, lighting the ground from a pool of two lights, sparks, a burst where it lands; it hurts).
- **New characters walk the street** (owner, 17 Oct 2026: "put any new characters that go in the game into the street walking around"): every character added from now on goes onto THE MARKET's street, walking around (`NPCS`, as the skeletons and the goldfish and bear are), unless the owner places it somewhere else.
- **The view** (17 Oct 2026, `src/ui.js`): a left drag moves the map ("drag the map and change your focal point"), the point grabbed staying under the mouse; a right drag (or Shift / Alt + drag) turns round the point you grab, the wheel zooms toward the mouse, the tilt from straight down to level with the street, never under the ground (17 Oct 2026, "stop them at this angle"); the view keeps its place beside him as he walks; 0 (or RESET VIEW) puts it back on him.
- **Removed and not wanted for now**: the character editor (edit mode), the Fox.
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
- **The musician** (17 Oct 2026, `src/musician.js`): the game's guitarist brought over whole (build.py reads the game's 47-play-3-guitar-1-body, -samples.data, -2-tunes, -3-hands, and embeds `audio/guitar.mp3`; small stand-ins for the game's cast and sound): a second Walker with his finger bones, the classical guitar (its solid hull; the game's hollow one breaks up as a mesh), the book of tunes in turn, his hands solved onto every note with weight; on the sidewalk by the bodega in the street light, lit by the lamps; his recorded notes, louder as you near him, from his side (sound starts with your first click or key). A double click on him: the camera close on his hands, as sharp as the screen shows (C back).
- **Never lost in the dark; no shadow acne** (17 Oct 2026): the lamp-lit avatars (the Walker, the musician, the fish, the bear, the skeletons) carry a little light of their own (a sixth of their colour), the lamps on top; every lamp's shadow held off the surface it falls on (normalBias), the two nearest lamps' shadows finer (1024).
- **The street's characters from his models: all deleted** (owner, 17 Oct 2026: "delete the phone head character, the cheetah and the catnewspaper
  characters from game completely"; then "delete ghost with bag inside and whatever this is"): the snow leopard, the grumpy cat and his ink bottle,
  the retro cyborg terminal, the plastic-bag ghost and his tote, the pixel pantry power-up; `src/npc-street.js` and their data gone. The tools that
  made them stay (`tools/skin-bake.py`, `skin-bones.py`, `item-bake.py`, `mesh-cut.py`: a furry model into a clean skin with bones) for the next.
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
- **The imports from his Drive, by recency** (owner, 17 Oct 2026: "start importing google drive assets based on most recent and import into game, keep
  going for 3 hours"): what the Drive connection could fetch (files under 10 MB; the bigger packs and models it cannot). **The undergrowth**
  (his Free Shrubs Flowers and Mushrooms pack and LowPoly-Psionic: `tools/props-bake.py` → `data/props.json`, placed by `park.js`): bushes,
  flowers, grass, mushrooms, stones over the park's lawns, logs and bits of fence, the Psionic mushrooms; **the pots and plants** (his pots &
  plants pack) by the gate. **The creatures** (Easy Animated Enemy Pack: the rat, the frog, the snake, the spider, the wasp; Monster Pack
  Animated by Quaternius: the bat, the slime; `tools/creatures-bake.py` → `data/creatures.json`, `src/npc-creatures.js`): each with the pack's
  bones and clips, walked as the skeletons are: rats about the street and the park, frogs, a slime, a snake and spiders in the park, bats over it at
  night, wasps by day. **The boats** (his kayak and fishing boat .fbx: `src/boats.js`): afloat in the pool as bodies of the pool's physics, with
  the ball and the ring. Not yet in: the Psionic toy animals, the modular terrain collection, the kenney space kit, the plesiosaur page.
- When a request could mean more than one thing, ask with a couple of options (or a quick mockup) before building.

## THE MARKET: the one official map

**THE MARKET** (owner, 17 Oct 2026: "one official MARKET map im gona start filling in") is the game's map here: every place the owner adds goes
into it, on its street or under it (the subway's level), next to what's there; not new separate pages. It's built to `dist/market.html` and
published to its own artifact, **https://claude.ai/artifact/X2Bk8UjQKP8yfLdLtVVn3s** (update that one, keep its link; don't make new pages for
new places). A place's code is its own file in `src/`; `map-pre.js` says where each place stands (its offset, its level), `map-post.js` joins
them (the ground, the levels, what cuts away). Its first places: the bodega, the pool room, the subway station and its stairs.

**On the live website** (owner, 17 Oct 2026): THE MARKET is at **thestrangestfleamarket.com/market**, for logged-in players only (the game's
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
  - `npc-map.js`: the goldfish and the bear wandering the platform (and `makeNPC`, every character's maker). `npc-skel.js`: the four skeletons on the far sidewalk, rigged and animated.
  - `npc-dragon.js`: the Dragon on the road. `kit.js` + `dress.js`: the kits' pieces and the few on the street. `apts.js`: the apartment house (in the
    bodega's scope, after `bodbuild.js`). `npc-figures.js`: the six figures (KASA, GEKKOU, DRIZZEL, KURENAI, SAMIDALE, SHOGUN) on their Mixamo
    bones, posed here, and the effects (smoke, the blade's trail, dust). `npc-creatures.js`: the packs' small animals on their own bones and clips.
    `park.js`: Central Park's entrance past the far sidewalk (the wall and gate, the pavers, the lawns, the pack's trees and rocks, the undergrowth,
    the pots, the lamps). `boats.js`: the kayak and the fishing boat afloat in the pool.
- `data/`: the characters baked from the owner's models (`goldfish.json`, `bear.json`), the skeletons, their gear and clips (`skel.json`), the six figures (`figures.json`), the park's trees and rocks (`forest.json`), the undergrowth, pots and boats (`props.json`), the creatures (`creatures.json`), the Dragon (`dragon.json`), the kits (`kit.json`). `tools/`: the
  scripts that baked them (they need the owner's .glb files and `fast-simplification`; `skeletons-bake.py` the KayKit pack, unzipped;
  `skin-bake.py`, `skin-bones.py`, `item-bake.py`, `mesh-cut.py` the street's characters and items: `trimesh`, `scipy`, `scikit-image` too;
  `figures-bake.py` the six figures, `forest-bake.py` the park's pack, `props-bake.py` still things from .glb or .obj with a palette, `creatures-bake.py` rigged ones with their clips; the packs' .fbx made .glb with npm's fbx2gltf).
- `tests/`: Playwright screenshots (`mapshot.cjs`: the street; `maptour.cjs`: platform, pool, bodega, stairs, a walk down; `skelshot.cjs`: the skeletons, close; `streetshot.cjs` the
  street's characters over a few moments; `streetact.cjs` one of them told each move, close up; `figshot.cjs` the six figures over a few moments; `figact.cjs` one told each move; `parkshot.cjs` the park's gate, round and path; `creatshot.cjs` the creatures by day and night; `poolshot.cjs` the boats). The page takes
  `?at=x,z[,height]` to start somewhere, for tests. In a cloud container rendering is software (slow, ~20 fps): run them in the background.

## Where it's going

Building it into a fuller game one piece at a time. First map done (16-17 Oct 2026): one street; the bodega and the pool room side by side;
the subway underneath, stairs down from the sidewalk. Next pieces are the owner's call. The list of what the game has that this doesn't
(places, NPCs and animals, activities, weather and time of day, multiplayer, menus) is in `README.md`.
