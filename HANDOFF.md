# Handoff (17 Oct 2026)

The owner paused all work here to carry on from his other account. Read `CLAUDE.md` first: it holds every decision he has made.
This note says what was in progress and where it is.

## The sky and the sunset (17 Oct 2026, branch `claude/relaxed-gauss-xerecq`; read the CLAUDE.md entry "The sky and the sunset")
- **Live** on https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5 (version 12): the sky dome (`src/sky.js`: gradient, sun and moon discs, stars,
  the clouds' undersides at sunset), the clock's evening stops, and the far (haze and skyline, `src/skyline.js`, merged in from
  `claude/awesome-noether-mba5hh`; the haze now takes the dome's horizon colour). Looked at from every evening hour: `tests/skyshot.cjs`.
- **Written, built, syntax-checked, never looked at** (the last commit on the branch, the owner's "1-3"): the evening's moods (FIRE and SOFT
  palettes mixed by the calendar day and the cloud: `MOOD` in sky.js, `?mood=fire|soft|clear`, `?day=N`), the warm-and-cool grade riding the
  clock at dusk (`LOOK.cool` set from sky.js), the street lights and lamp posts coming on one by one as the sun goes down (`DRESS.tick` in
  dress.js, `P.on` a lamp). To finish: `node tests/skyshot.cjs <out> 17.9,18.1,18.3 ` and the same with `?mood=fire` / `?mood=soft`
  (add `&mood=` to the test's URL), check the lamps light in turn and nothing is dark by day that shouldn't be, then publish to the link above.
- The publish warned that the page uses the world editor's `sample` capability without declaring it (predates this; DESCRIBE A CHANGE only).
- Not built: the guards' night watch (they keep their beats day and night).

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
