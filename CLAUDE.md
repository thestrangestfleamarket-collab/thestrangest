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
- **Free rotation and tilt, any zoom** (17 Oct 2026: the tilt all the way round, over the top to from underneath; Shift + drag slides the view); shadows (the SHADOWS menu: on, shaded, self, full).
- **The 3D Walker** (the game's rig, his pieces as one mesh, one hand a piece, no fingers unless close up), his moves, ragdoll, physics.
- **His characters from his models** (Meshy AI .glb): the goldfish in his raincoat and the bear in his jacket. Cut to a few thousand
  triangles, coloured face by face, soft tone shading like the Walker's, **no outlines on them** ("fish shouldnt have lines").
  **The clothes' shadows** (17 Oct 2026, his pick C, a little darker): each layer shades the one under it (coat on shirt, shirt on him, the
  hood on the fish's face), two steps, baked once at load (`rank` in `npc-map.js`).
- **Real water only** in the pool (a simulated surface, swimming, floats).
- **Loading** (17 Oct 2026: "loading should always say"): while the page loads, only the line "I took a trip to The Strangest Flea Market..." (no help panel or shadows box for that moment).
- **New characters walk the street** (owner, 17 Oct 2026: "put any new characters that go in the game into the street walking around"): every character added from now on goes onto THE MARKET's street, walking around (`NPCS`, as the skeletons and the goldfish and bear are), unless the owner places it somewhere else.
- **The view** (17 Oct 2026, `src/ui.js`): a drag turns round the point you grab, the wheel zooms toward the mouse, the tilt goes all the way round (over the top and under); the view keeps its place beside him as he walks; 0 (or RESET VIEW) puts it back on him.
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
- `data/`: the characters baked from the owner's models (`goldfish.json`, `bear.json`) and the skeletons, their gear and clips (`skel.json`). `tools/`: the
  scripts that baked them (they need the owner's .glb files and `fast-simplification`; `skeletons-bake.py` the KayKit pack, unzipped).
- `tests/`: Playwright screenshots (`mapshot.cjs`: the street; `maptour.cjs`: platform, pool, bodega, stairs, a walk down; `skelshot.cjs`: the skeletons, close). The page takes
  `?at=x,z[,height]` to start somewhere, for tests. In a cloud container rendering is software (slow, ~20 fps): run them in the background.

## Where it's going

Building it into a fuller game one piece at a time. First map done (16-17 Oct 2026): one street; the bodega and the pool room side by side;
the subway underneath, stairs down from the sidewalk. Next pieces are the owner's call. The list of what the game has that this doesn't
(places, NPCs and animals, activities, weather and time of day, multiplayer, menus) is in `README.md`.
