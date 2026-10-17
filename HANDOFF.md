# Handoff (17 Oct 2026)

The owner paused all work here to carry on from his other account. Read `CLAUDE.md` first: it holds every decision he has made.
This note says what was in progress and where it is.

## Live now (on `main`, published to https://claude.ai/artifact/X2Bk8UjQKP8yfLdLtVVn3s, version 55)
- Smooth lighting is the default: no grain, soft shadows, smooth lamp glows. GRAPHICS → LIGHTING switches back to PIXEL.
- The map editor (Shift+M): drag places in 3D on a quarter-tile grid, with view controls (drag open ground or Ctrl+drag to turn and tilt, Q E Z X, T top, Y side, W A S D slide), APPLY to rebuild and EXPORT.
- Street lights and trash cans built from blocks, with a pool of light under every lamp.
- A ROOMS row in the menu's MAP tab for every room.
- Every panel has an X and can be dragged.
- The `?` list of moves.
- Real fire.
- The skeletons' weapons are back in their hands.
- Shift+R has been removed.
- The artifact link above belongs to the first account. The other account can't update it unless it's shared with edit access from its Share menu; otherwise that account publishes its own link.

## IN PROGRESS, PAUSED 17 Oct 2026: THE METRO (branch `claude/amazing-albattani-gn3kp8`, this commit)
Owner: "look in google drive for metro station" → "lets make that the subway in the new game. make sure it has an exit and its really unground.
use anything else we have that makes it flesh out and feel real." Then "lets pause, i want to pass off all work to another chat."

**Where it is**: the kit is baked and the station code is written and wired in; the page builds and loads; **it has not been looked at yet** and
has **one open bug** (below). Nothing is published to the artifact from this branch.

- **The asset**: his Drive's `Metro_PSX.rar` (id 1uW4DH7DGv8PDfxpnDOXHBEH1NFJZnQNg, 6.9 MB, in the G folder). The Drive connector's download
  choked on it (reply too large); `curl -L "https://drive.google.com/uc?export=download&id=1uW4DH7DGv8PDfxpnDOXHBEH1NFJZnQNg"` fetched it
  (link-shared). Nothing in the container opens .rar: npm `node-unrar-js` (pure JS) does. Inside: `Metro_PSX/Models/Metro.glb` (+ .fbx, .dae)
  and 26 PSX-style textures. It is a **modular kit laid out in a row for display**, not an assembled station: four station cross-sections
  (`St`, `St_01`, `St_02`, `St_03`: track bed x 5.66..10.55, platform x 10.25..18.9 at y 1.4, tiled back wall at x 18.9, concrete ceiling
  6.11..6.64, each along z), `St_03` also carries the exit (a sloped corridor x 9.5..17.9 rising to 5.59, turning east at z 73.8..78.6 into a
  flight `Stairs_01` up to y 11.31 at x 28.3, the `Railing` round the opening at the surface, the roof slab top at 11.55 = the sidewalk), a staff
  closet with a glass door at St's south end (`Estruc`, `Door_A`...), the `subway_car` (23.4 m) with 14 door leaves (`Door`..`Door.013`, pairs that
  slide apart; `Door.014/015` the end doors), seats and railings, and the hall props (`automatic_ticket_gate` + its flap `_D`, `ticket_machine`,
  `Vending_machine`, `metro_map`, `Chair` (a bench), `trash_can`, `light` (a 2 m tube, emissive), `Column`, `Poster_01..08`). Per-mesh bounds:
  run `python3 -I tools/metro-bake.py <Metro.glb>` (it prints them). The kit's walls' normals face inward; the textures tile (UVs past 0..1).
- **`tools/metro-bake.py` → `data/metro.json`** (1 MB): each piece's points in the kit's metres with its node transform applied (mirrored nodes'
  winding put right), uvs (int16, ×512), triangle runs by material; the textures shrunk by halves toward 18 texels/m and kept as PNGs (no atlas,
  they tile); `mats` (texture, emissive texture, alpha); `hf`: a 0.2 m height map of the exit's floors (lowest face ≥ 1.3 over kit x 9..28.6,
  z 54.5..79.2; 255 = no floor).
- **`src/metro.js`** (replaces `station.js`+`wsub.js` in build.py; those two stay in `src/`, unbuilt): `METRO` (module-level, declared in
  map-pre.js). The kit → the map: scale 1.15 (the characters' 1.85 → 2.2); kit x → map north (+Z), kit z → map west (-X): scene
  `X = X0 - 1.15*kz`, `Z = Z0 + 1.15*kx`, `Y = 1.15*(ky-11.55) - .03`; the opening's open end (kit x 28.4) at tile y -72, its middle (kit z
  76.25) at tile x 62 (between the apartment house, ≤56.5, and the bodega, ≥67.6), `LAY.o('subway')` added. The platform floor is at
  `METRO.DY = -11.70` (30 ft down; `STN.DY` stays -98 px for the dungeon only). Assembly in kit space: St_03 at its own place (platform z 41..58.63 +
  the hall to 78.8), St_02/St_01/St shifted south end to end → platform z -5.83..58.63 (64 m), a terminus: the track dead-ends at the hall (a buffer
  wall at z 58.63), runs south into a tunnel I build from the kit's textures (to z -64, capped), end walls at z -5.83. Props placed (kit coords):
  columns x 14.57 at z 4..44; gates x 10.9/12.9/14.9/16.9 at z 52.5 (flaps left out = open; low tiled fillers to the edge and the wall);
  ticket machine z 49.2, map 47.1, vending 8, benches 17/33/41, bins 4/25/45.5, poster pairs 12/21/30/38, all turned a quarter (`yaw π/2`,
  fronts to -x) against the back wall; tubes under the ceiling in two rows every 8 m, each a PointLight record (LITE's 8 nearest). Faces are
  bucketed by (material, use): `ceil`/`ceilH` → `OVERHEAD` (shown only from under), walls by outward direction → `cutWalls` with their own clip
  plane (foot: the platform +.3; the exit's walls: `py+.35`, a getter), the rest `body`. One Lambert material per (material, use), nearest, tiling,
  alphaTest .5, DoubleSide (the batch's program); Glass = a 2×2 white canvas map, tinted, opacity .35. `METRO.exit()` is called from
  map-post.js's `grab('stairs')`: St_03 + Railing (always shown, so the hole shows the stairs), its tubes, the railing's three sides solid on
  both levels. `MAPSTAIR` is filled in by metro.js from the Railing's bounds (`x0,x1,y0,y1` for the ground holes; `has(x,z)`: in the opening, or
  anywhere in the hall once LVL is down; `ground(x,z)`: the height map, bilinear). map-post.js: `inStair` uses `S.has`, `groundY` uses `S.ground`.
  `MODS.station={BOUND,ground:METRO.ground,DY}`. **The train**: `METRO.train` (TR): the car + 14 leaf meshes in a group; states stop 50 s →
  closing (chime) → leave (accel 1.3 m/s² to 14 m/s, hidden past 78 units east) → away 45 s → arrive (decelerating) → opening → stop; a noise
  rumble through a lowpass scaled by speed and distance (uses `SND.ctx`/`USE.ac`/its own AudioContext); ticked from the frame after `NPCS.tick`
  (build.py), idle while `MAPG.down` is hidden. The bear's lane is `METRO.lane` (behind the columns); the troublemakers' `TOP` is `MAPSTAIR.y1+.7`;
  ui.js: THE PLATFORM at `METRO.at(15,30)`, the down map's slice at `METRO.DY`, THE SUBWAY STAIRS at `y1+.7`.
- **`tests/metroshot.cjs <out>`**: five looks (opening from the street, platform iso, corridor, platform from his eyes, the gates) with MAPDBG
  and console errors. Last run: the page loads, LVL/visibility/ground right at every spot, 8 lamps lit, 20 fps, **but a shader error**:
  `THREE.WebGLProgram ... FRAGMENT ERROR: 'vNormal' : undeclared identifier` at the `gates`/eyes views. That is the lambert fragment patch in
  map-pre.js (the shade-by-facing `vNormal` line) landing in a program variant that has no vNormal: most likely the **Glass material**
  (transparent, or the canvas map) or a material with no lights... Find which material by `?look=` / by removing Glass's `transparent` or giving
  it a real kit texture; or add `#define USE_NORMAL`-independent code (the patch should read `normalize(vNormal)` only `#ifdef`'d). Fix that, then
  LOOK at the five shots (`/tmp/.../shots/metro-*.png` in that session: re-run the test), expect: wrong yaw on wall props (fronts), the
  opening's ground, the cut walls, texture flipY, z-fighting, the train's doors' slide sign.
- **Not done yet**: looking at it at all; the triangle/draw cost line; rats on the platform (`npc-creatures.js`); a "TO STREET" sign; the
  Walker riding the train; CLAUDE.md's full entry; publishing to the artifact (X2Bk8UjQKP8yfLdLtVVn3s); `README.md`.
- The game's repo must be beside this one for the build: `git clone --depth 1 https://github.com/bralynnb/tsfm /home/user/tsfm` (it was not in
  the container; `add_repo` then clone). Playwright: use the global one (`/opt/node-tools/node_modules/playwright`, 1.56) with the preinstalled
  Chromium; a local `npm i playwright` of another version won't launch.

## Paused, unfinished (branches on GitHub; each says in its last commit what's done)
| Branch | What | State |
|---|---|---|
| `map-editor` | Next round: real live moves for every building (old spot empty), raise and lower, stack on others, a PLACE button (no reload per item, one SAVE at the end), RESIZE (shrink and grow) | **not started**: the branch is the merged 3D editor. The plan: hide a batched building's faces with the batch's per-face opacity and move a copy of them, its lights following; raise, lower and resize only the bodega, the apartment house, Ghost Street, the Diner and the Bar (the subway, castle, pool and apartments have fixed depths, dungeon and water) |
| `perf-fixes` / `perf-audit` | The lag audit and his approved fixes | **Audit done at 4 spots**: `docs/perf-audit.md` on `perf-fixes`; its tools are on `perf-audit`. **Fixes 1, 2, 4, 6, 7 written, never built or tested** (`src/perf.js`, `?perfx=0` turns them off). **Fix 5 not started.** Top findings: the nearest lamp's 1024 cube shadow redraws about 1M triangles; the street's main pass is 400K triangles (budget 100K, about 81K on screen); 159K triangles of interiors are drawn from the street (the stored rooms' batch 116.6K); the Walker is 56.7K triangles (every unworn hairstyle and eye style sits folded in his mesh) and is drawn about 8 times a frame; 21-24 self-shadow renders a frame; an unidentified 106K-triangle mesh is drawn only in the shadow passes; the pool floats run everywhere |
| `npc-lives` | Off-screen characters exist only as numbers, with real daily lives by the clock (home, work or beat, meals, park, bar, sleep), shown only when near or seen | **not started**: one empty commit (c5bac2e) whose message holds the plan (`src/lives.js`, a hook in `NPCS.tick`, a `?lives=1` panel) |
| `avatar-editor` | Shift+K avatar editor: BODY sliders (feet too), LOOK, code-made TEXTURES (stripes, plaid, denim, knit, camo, dots), OUTLINE, SHADING, PRESETS | **written, never built or tested** (207721d): `src/avatar.js` plus changes in walker3d.js, editor.js, looks.js and ui.js. `build.py` doesn't include `src/avatar.js` yet: add it after looks.js and vitals.js (line ~216), then build, load check, screenshot each tab |
| `tree-look` | Smooth tree looks in `src/park.js`, `?treelook=1` (soft real shadows, the acne fixed, the oaks' shadow sways with them), `2` (gradient crown, darker underneath and inside, no shadow map on it), `3` (both, leaves letting 30% of the light through) | **built, loads, never looked at**: no sheet, no costs yet; scripts were in the old session's scratchpad. The current game's oak shadow doesn't sway with the crowns (likely part of the stripes) |
| `clouds-mockup` | Cloud mockups `?clouds=vol` and `?clouds=thick`: he disliked both ("dots everywhere"); redo smooth if wanted | done, not wanted as is |
| (none) | The Fox made more angular, like his sprite: its work was cancelled before it pushed | to redo |

A branch may not exist if its work was stopped before it pushed.

## Known open items
- The cigarette rack overlaps the Fox's head.
- Spots cut off by the strict hitboxes: a corner of the Diner, behind the bar counter, a strip of the castle.
- The apartment house's upper floors are very dark.
- The live website (`bralynnb/tsfm`, `market/market.html`) is on 8.0.1. Update it only when he says "go live".
