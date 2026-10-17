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

## This branch: `claude/quirky-mendel-rvrxwx` (the city run by bots; paused 17 Oct 2026, handed off)
Everything is committed and pushed; the build of this branch is at https://claude.ai/artifact/HkTZPr3szpVZmu4g2QDsP3 (published with
`capabilities: {sample: {}}` for the world editor's DESCRIBE). `origin/main` is merged in (the 3D map editor, smooth light). Build: `python3 build.py`
with the game's repo cloned beside this one (`../tsfm`). Every piece is described in CLAUDE.md under "The city's spine", "The residents" and
"The city's services, minimal".
- **Done and checked** (each a Playwright test; in the cloud's software rendering each takes minutes): `src/city.js` the spine (addresses,
  A* routes over the hitboxes, errands walked, the job board, the clock's schedule; `tests/worldcheck.cjs`); `src/residents.js` four pawns
  living in the apartment house by the clock (`tests/rescheck.cjs`); `src/civic.js` + `src/duties.js` + `src/vehicles.js` the civic row,
  the staff in uniform, the Drive's car pack as the vehicles, the ledger, mail, public works (trash, deliveries, power), fire, the medic,
  the police, the menu's CITY tab with TRY buttons (`tests/civiccheck.cjs`: all six legs passed on the merged build).
- **Data**: `data/vehicles.json` (the five cars + the trash bag and pile, cut to a third; originals in `data/full/`), baked by
  `OUT=data/vehicles.json python3 tools/kit-bake.py <folder of glb>` then `python3 tools/simplify.py vehicles`. The Drive's .rar packs open
  with the npm package `node-unrar-js` (nothing else here opens .rar); .fbx become .glb with the npm package `fbx2gltf`.
- **Not done, in order of the plan**: the subway's train on a timetable (the train is a batched thing; the world editor's move code is the way
  to slide it); cells at the precinct (an arrest only logs); door leaves; wet roads and snow lying; the player's own hunger; persistence
  (Supabase: the owner said not yet); residents are only ever on the ground floor (no flights of stairs in the house).
- **Known faults**: the pool's boats and floats are flat shaded against the world's Lambert shading patch, so their shader fails to compile
  whenever the menu's map draws everything (console error; predates this branch). A pawn set down in the subway stairs' margin can't step by
  his own rule; the spine eases such a one clear. The civic row stands on grass with no lamps (the 8-lamp budget), dark at night.
- **The shared artifact link** (PnmQqhkusfewby35tf4zo5) was being published by other sessions' branches at the time, so this branch kept its
  own link; once the branches are merged, one publish to the shared link.

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
