# Handoff from session claude/fervent-babbage-uj6s3z (17 Oct 2026, evening)

Everything this session made is committed and pushed on branch **`claude/fervent-babbage-uj6s3z`** (nothing uncommitted, nothing local-only).
The branch holds, on top of `main`: its own work (below), plus merges of `claude/vibrant-pasteur-lpq1xi` (the sound work: SAVE, SFX, ambience,
lines, the sound editor) and `claude/keen-meitner-37e6es` (THE MARKET in order, mockup 1, the Avenue). Its build is live at
https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5 (version 10). `main` itself has not moved: merge this branch into `main` first, so the
other sessions stop stacking on the old HANDOFF commit and overwriting each other's publishes (three sessions republished the same link within an hour).

## Done this session (each in CLAUDE.md with its reasons)
- The day opens at noon (`clock.js`).
- Where you left off is kept and restored (`where.js`; `?fresh=1` forgets it).
- The guitarist plays in the apartment house's top-floor front living room; the bar's stage rotates the other three (`musician.js`, `bandstand.js`).
- Nobody out of the camera's view is drawn; near ones still live and think (`NPCS.tick` / `NPCS.cull`, `npc-map.js`).
- Interiors drawn only within 5 tiles of a door or inside; the 3 tiles by the door always (`interiors.js`; `?interiors=0`).
- `?trees=0` hides the oaks for screenshots.
- The tour's fixes: sky fill in the shade by day, the apartment house lit and its inner walls cut by your side, the dungeon brighter,
  the water's glow by the dark, the stored rooms' spots inside their doors.
- Debug handles on `window.__dbg` for tests: renderer, scene, THREE, camera, MAPG, LITE, lamps, INTERIORS, CLOCK, WHERE, ROOMS.

## Measured, not fixed (the next job, in this order)
1. The Walker is 56,700 triangles, drawn in every pass (shadow, self-shadow, the picture): every unworn hairstyle and eye style is folded
   into his mesh. Build him from the worn pieces only; rebuild on a looks change. The biggest single win.
2. The nearest lamp's 1024 cube shadow redraws the scene six times a frame.
3. The apartment house is 600 to 700 draw calls inside (a mesh per wall segment): batch its walls.
The street draws about 450,000 triangles in view and 900,000 a frame with the passes, against the 100,000 budget. Numbers from the
tour scripts in this session's scratchpad (not in the repo): a Playwright page with `?fresh=1&npcwait=99&hour=13&trees=0`,
`renderer.info.autoReset=false`, reset, wait, divide by frames.

## Loose ends
- CLAUDE.md names two artifact links as official (X2Bk8UjQKP8yfLdLtVVn3s and PnmQqhkusfewby35tf4zo5); pick one.
- CLAUDE.md's "No trees" note is stale: the oaks are back in `park.js`.
- The page's DOWNLOAD links and the world editor's DESCRIBE A CHANGE need the `downloads` and `sample` capabilities declared on publish.
- The dojo doorway and the apartment house's door frames stay in front of you when their walls cut away (the frames are batched, not cut).
- The yields scanner (`tools/yields.py`) stops the build on an unbalanced bracket: a `//` comment put mid-line swallows the rest of the line.

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

## The map put in order (17 Oct 2026, "mockup 1", branch `claude/keen-meitner-37e6es`)
- Done: the row reordered (CLAUDE.md's "THE MARKET IN ORDER"), the four stacked rooms down on the ground, the keep in the bailey, the street run
  east, the alley, the crosswalks, the garden's fence, the Avenue's ground, its park wall and gate, its lamp posts, the seven shells of the old
  game's buildings along its east side, the menu's THE GARDEN and THE AVENUE.
- Next, in order: (1) a quarter turn for a place as it's set out (every old-game interior is built facing the main street; the Avenue's face west),
  then each shell's inside from the old game's own files through build.py as the Diner and the Bar were (the market lounge's four files, the museum's
  six, the arcade and the theatre's, the two awnings', 221B's); (2) Cherry Station's stairs at the Avenue's north end, its station joined to the West
  End's under the main street; (3) a window on the street for the aquarium and the museum's portico; (4) characters on the Avenue (the npc-lives
  plan: numbers until near); (5) the cross street at the west end.
- The map editor's boxes don't know the new places yet (the garden, the aquarium, the Avenue's row): they can't be dragged there.

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
