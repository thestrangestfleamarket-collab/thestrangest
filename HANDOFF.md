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

## Paused, unfinished (branches on GitHub; each says in its last commit what's done)
| Branch | What | State |
|---|---|---|
| `map-editor` | Next round: real live moves for every building (old spot empty), raise and lower, stack on others, a PLACE button (no reload per item, one SAVE at the end), RESIZE (shrink and grow) | **not started**: the branch is the merged 3D editor. The plan: hide a batched building's faces with the batch's per-face opacity and move a copy of them, its lights following; raise, lower and resize only the bodega, the apartment house, Ghost Street, the Diner and the Bar (the subway, castle, pool and apartments have fixed depths, dungeon and water) |
| `perf-fixes` / `perf-audit` | The lag audit (report: `docs/perf-audit.md` if it got written) and his approved fixes 5, 6, 1, 2, 4, 7: merge draw calls, smaller shadow maps, build interiors on first entry and never draw them from outside, one shadow pass instead of one per character, cull off-screen things, pause unseen sims | in progress when paused |
| `npc-lives` | Off-screen characters exist only as numbers, with real daily lives by the clock (home, work or beat, meals, park, bar, sleep), shown only when near or seen | in progress when paused |
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
