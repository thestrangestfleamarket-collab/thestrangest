# Handoff (17 Oct 2026, evening: the far, the roaming, the sky; paused to carry on in another chat)

Branch `claude/awesome-noether-mba5hh` (pushed, everything committed) carries, on top of `main`:
- **The far** (`src/skyline.js`): a sky-tinted haze from where he stands (not the camera) and a ring of silhouette buildings round the land's edge;
  GRAPHICS' DISTANCE HAZE; `tests/farshot.cjs`. The owner asked for it from a Zelda screenshot ("make things look realistically far away").
- **Everyone roams the whole map, nobody minds you** (`ROAM` in `npc-map.js`): the gold skeleton, the mushroom seller and the twelve pawns wander
  the street and all of Central Park (through the gate); makeNPC's `near` (turning to you, waiting for you) is gone; guards, droids, the Fox, the
  bear and the animals as they were. The gold skeleton starts on the far sidewalk (he carried nothing; the seller stood over him at start).
- **Merged in from `origin/claude/relaxed-gauss-xerecq`** (the owner's other session): `src/sky.js`, a painted sky dome (sunset phases, sun and moon
  discs, stars), the clock's evening stops, the clouds' lit undersides; the haze now takes the dome's horizon colour.
- Built and published: https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5 (version 13). The X2Bk link can't be opened from this account.

**Open question for the owner** (asked, not answered): he said "the gold skeleton should not have anything on them like mushrooms etc. just the
skeleton". The gold one never carried anything (his sheet: `node tests/sheet.cjs Gold`); the mushroom seller (white, 2.2 m, the hat and tray of
mushrooms) had been standing on his tile. If he meant the mushroom seller should be a bare skeleton too, strip `npc-mushroom.js`'s hat mushrooms,
tray, strap and bag parts.

Not merged into `main` yet: this branch. Not done: nothing else was in progress.
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
# Handoff (17 Oct 2026, later: the paused work finished)

Read `CLAUDE.md` first: it holds every decision the owner has made. This note says what is live and what is still open.

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

## The map put in order (17 Oct 2026, "mockup 1", branch `claude/keen-meitner-37e6es`)
- Done: the row reordered (CLAUDE.md's "THE MARKET IN ORDER"), the four stacked rooms down on the ground, the keep in the bailey, the street run
  east, the alley, the crosswalks, the garden's fence, the Avenue's ground, its park wall and gate, its lamp posts, the seven shells of the old
  game's buildings along its east side, the menu's THE GARDEN and THE AVENUE.
- **Paused mid-way (17 Oct 2026, "pause, pass off to another chat")**: groundwork for the Avenue's interiors is committed, nothing of it is used yet:
  `BOD.placeAt(p,rot,cx,cy,ncx,ncy)` in bodega.js turns a thing's boxes and solids about any middle onto any other (`place` now calls it); `facade`
  takes an 8th argument, a building's own brick colour; `AVE.y1` is 57.5 (the Avenue runs to z 134.5, room for the real market's length).
  **The plan for the turn, worked out and ready to write** (store.js): a helper `turned(B,B2,k)` where B is the room's box in the old game's frame,
  B2 its box on the Avenue, k quarter turns counter-clockwise (the old game's `place` convention: (x,y) to (-y,x) per step). It gives: `fw`/`bw`
  (a point old to new and back, about the two middles), `fn`/`bn` (a normal), `wall(w)` (an old side f/b/w/e to its new side), and maps the door,
  the window holes and the inner walls (`o.xw`) the same way; `look` wraps the painters so they are asked in the old frame (`in(B,...bn(nx,ny),
  ...bw(X,Y))`, `floor(...bw(x,y))`, `out` likewise); after `set()` runs in the old frame, every prop made is turned with `placeAt(p,r,cx,cy,ncx,
  ncy)` and every lamp made is moved with `fw` (lamps once, not per prop). `room()` needs two additions: `o.holes` ({f,b,w,e: [{a0,a1,z0,z1}]},
  merged into each wall's holes; a hole with z0 0 opens the solids as a door does) and upstairs things: a prop tagged `p.lv=1` has its boxes
  `zShift`ed by STORY and its solids kept on the room's own upper list with the walls' solids; a floor slab drawn at STORY in the new frame; and
  the stacked-floor ground and solids brought back for upper floors (the old `STORE.stackGround` / `STORE.stackTick` hooks are still called by
  map-post.js and build.py: a record {x0,z0,x1,z1,fy,solids} per upper floor; the ground the highest whose footprint you are on with fy <=
  py+.35*TILE; the tick swaps `solids` for the floor's own). Upper floors are reached from the menu (a place with its height as the 4th field,
  which goTo takes), as the apartment house's are: no stairs for now.
  **Which way each building turns**: MARKET · LOUNGE k=2 (a half turn: its shop front was on its east face in the old game, toward a cross
  street; here that face goes west onto the Avenue, its back door and bollards onto the main street's side, its lounge window north). The
  awnings' row buildings, the Desk Room, 221B, the Playhouse, the Theatre, the Museum all had their fronts on the main street (+y): k=1 puts
  them onto the Avenue (west).
  **The market, exactly**: old box 10.5 x 20.4 (LSEED.mkt), two storeys (h 260), its own dark navy brick [40,44,66]; measures MLB (21-world-map-
  5-land line 257): door (the back door on +y) B.x1-2.2, mdoor (the glass door on +x) B.y0+4, mwin B.y0+6, awn [B.y0+.8,B.y0+8.8], win (the
  lounge's, on -y) B.x1-2.6, mezz {x1:B.x0+T+5.5,y1:B.y0+T+7.4,z:70}; holes: +y back door a0 door-.6..+.6 z 0..72; +x glass door (the room's
  door, 1.56 x 94) and window mwin+-.7 z 22..84; -y window win+-.8 z STORY+34..+106. Things (26-zz-market-lounge): the market downstairs (door mat,
  counter, two 'shelf of goods', three 'shop shelf', two drinks fridges: the bodega's kinds, in the kit already); outside on the +x face the
  'market awning and sign', planters, the two vending machines, the bin bag; on +y the hydrant, spray cans, wall ladder, 'steel door, open', four
  bollards at F+3.75, weeds; the lounge upstairs is empty in the old code (it moved to the square's lobby): lay it out from the file's own
  comment (fridge and five PC desks along the west wall, the bar two tiles in from the front with its end counter and seven stools, two arcade
  cabinets with red stools facing the front wall, the sofa, coffee table, TV, pizza boxes, paper bag, backpack, small fridge, the palm and
  boxes under the back window, the floor grille, the mezzanine with its long desk and gaming chair (those two zShifted 70 more), the ducting).
  Its kit: 23-w-y-market-lounge-1-walls (MLC, mlSoot, mlOutside, mlWall, mlMarketFloor, mlLoungeFloor), -2-bar (MLK: already embedded once in
  its own block for the vending machines), -3-lounge, -4-street (the catalog table, lines 76-98: every kind's name). Embed all four in one
  `gblock` with a prelude: `const KIND_OF={}, rlf=(c,t)=>{ if(t)c.t=t; return c; };` an 'lmarket' record pushed into LBLD (x0 0, y0 0, x1 10.5,
  y1 20.4) and `const MLB=` as land.js line 257 builds it (ex0 0); out: `STOREK.ml={MLB,MLC,mlOutside,mlWall,mlMarketFloor,mlLoungeFloor,MLK}`.
  Its outside painter: `mlOutside(B,...)||facade(...,[40,44,66])`.
  **The others' files**: the Museum: 23-x-museum-0..6 (82 KB of scans data; its walls' plan MUS in -1-building; placed by 26-zzzzzzz-museum.js;
  the land's inner walls at 21-world-map-5-land lines 420-428); the Theatre and Arcade: 23-w-arcade.js, 26-theatre-front.js, 26-y-theatre-inside.js
  (the bar's sconce came from it); the Playhouse: 26-z-the-playhouse.js, 47-playhouse-1..3 (its show); Lucky 7 and the Yellow Awning: 23-w-west-
  awnings-1-dining, -2-gamer, placed by 26-zzzzzzzzzzzz-west-awnings.js, their boxes in WEND.row (21-world-map-5-0-west-plan: 9 x 11, two storeys,
  the rooms upstairs); the Desk Room: 23-w-west-desk-1-room, -2-crt (8 x 8); 221B: 23-w-sitting-room-221b.js (placed by 26-zzzzzzzzzzz-lived-in.js;
  10.6 x 12.5); Cherry Station: 23-w-cherry-station.js (29 KB), 26-zzzz-cherry-station.js. Sizes in AVR (store.js) are guesses: replace each with
  the real box as it comes in and move the ones after it north (AVE.y1 with them).
- Next, in order: (1) a quarter turn for a place as it's set out (every old-game interior is built facing the main street; the Avenue's face west),
  then each shell's inside from the old game's own files through build.py as the Diner and the Bar were (the market lounge's four files, the museum's
  six, the arcade and the theatre's, the two awnings', 221B's); (2) Cherry Station's stairs at the Avenue's north end, its station joined to the West
  End's under the main street; (3) a window on the street for the aquarium and the museum's portico; (4) characters on the Avenue (the npc-lives
  plan: numbers until near); (5) the cross street at the west end.
- The map editor's boxes don't know the new places yet (the garden, the aquarium, the Avenue's row): they can't be dragged there.
- Seen while checking, not changed: the Avenue's row faces west and the day's shade is lit by lamps alone (the owner's rule, a 0.05 sky), so its
  fronts are black most of the day (checked with the shadow map off: the same), as the keep's north face is; `?sky=1` lights the shade a little.
  His call whether the Avenue wants that. `tests/clipcheck.cjs` reports 8 things without a solid, all the Moon Shrine's opened pieces (the
  terrace, steps, gate, parapet, ferns): the same 8 on the unchanged build. A "vNormal undeclared" shader warning shows in some headless runs
  on the unchanged build too.

## Paused, unfinished (branches on GitHub; each says in its last commit what's done)
| Branch | What | State |
|---|---|---|
| `map-editor` | Next round: real live moves for every building (old spot empty), raise and lower, stack on others, a PLACE button (no reload per item, one SAVE at the end), RESIZE (shrink and grow) | **not started**: the branch is the merged 3D editor. The plan: hide a batched building's faces with the batch's per-face opacity and move a copy of them, its lights following; raise, lower and resize only the bodega, the apartment house, Ghost Street, the Diner and the Bar (the subway, castle, pool and apartments have fixed depths, dungeon and water) |
| `perf-fixes` / `perf-audit` | The lag audit and his approved fixes | **Merged into `claude/loving-johnson-l3chjz` and measured** (17 Oct 2026, on a patched copy of the published page, the game's source not reachable from that container): about 37% fewer triangles a frame on the street, the bodega door and the dojo; one bug found and fixed (fix 7 left the floats at the world's origin); the pool, the bar and the 512 lamp map's look not yet checked; the stats line now shows draws and triangles. `docs/perf-audit.md` has the numbers. **Fix 5 not started.** Top findings: the nearest lamp's 1024 cube shadow redraws about 1M triangles; the street's main pass is 400K triangles (budget 100K, about 81K on screen); 159K triangles of interiors are drawn from the street (the stored rooms' batch 116.6K); the Walker is 56.7K triangles (every unworn hairstyle and eye style sits folded in his mesh) and is drawn about 8 times a frame; 21-24 self-shadow renders a frame; an unidentified 106K-triangle mesh is drawn only in the shadow passes; the pool floats run everywhere |
| `npc-lives` | Off-screen characters exist only as numbers, with real daily lives by the clock (home, work or beat, meals, park, bar, sleep), shown only when near or seen | **not started**: one empty commit (c5bac2e) whose message holds the plan (`src/lives.js`, a hook in `NPCS.tick`, a `?lives=1` panel) |
| `avatar-editor` | Shift+K avatar editor: BODY sliders (feet too), LOOK, code-made TEXTURES (stripes, plaid, denim, knit, camo, dots), OUTLINE, SHADING, PRESETS | **written, never built or tested** (207721d): `src/avatar.js` plus changes in walker3d.js, editor.js, looks.js and ui.js. `build.py` doesn't include `src/avatar.js` yet: add it after looks.js and vitals.js (line ~216), then build, load check, screenshot each tab |
| `tree-look` | Smooth tree looks in `src/park.js`, `?treelook=1` (soft real shadows, the acne fixed, the oaks' shadow sways with them), `2` (gradient crown, darker underneath and inside, no shadow map on it), `3` (both, leaves letting 30% of the light through) | **built, loads, never looked at**: no sheet, no costs yet; scripts were in the old session's scratchpad. The current game's oak shadow doesn't sway with the crowns (likely part of the stripes) |
| `clouds-mockup` | Cloud mockups `?clouds=vol` and `?clouds=thick`: he disliked both ("dots everywhere"); redo smooth if wanted | done, not wanted as is |
| (none) | The Fox made more angular, like his sprite: its work was cancelled before it pushed | to redo |

A branch may not exist if its work was stopped before it pushed.
## Live now (branch `claude/admiring-davinci-6bjs2l`, its build at https://claude.ai/artifact/1QpVqQujaY6D6V1F19ZmKy; the shared link PnmQqhkusfewby35tf4zo5 was being published by other sessions' branches at the time: skyline, sky dome, power grid, the city's spine)
- Everything that was paused in the first handoff is finished and merged here (the entry "The paused work finished" in CLAUDE.md): the avatar
  editor (Shift+K), the perf fixes measured and fix 5 remade (`docs/perf-audit.md`), the tree look (3, the default), the map editor's next round
  (live carries, PLACE / SAVE, RAISE / LOWER and GROW / SHRINK for the Diner and the Bar), the angular Fox, NPC lives (`src/lives.js`), the
  apartment house lit, the cigarette rack above the Fox.
- The old artifact link (X2Bk8UjQKP8yfLdLtVVn3s) belongs to the first account and can't be opened from this one; the link above is this account's.

## How the perf work was measured, to carry on (17 Oct 2026)
- No game source in that container: `git clone` of `bralynnb/tsfm` needs a login there. With it beside this repo, `python3 build.py` builds `dist/market.html` with the fixes (build.py's hooks on `src/perf.js`).
- Without it: the published page (artifact PnmQqhkusfewby35tf4zo5, `index.html`) is the game as built; the fixes were patched into a copy of it by string replacement of build.py's anchors (the page's breath markers `if(performance.now()-__YT>40)await __Y();` sit between statements) and `window.__PERFX=PERFX` exposed after `CLIP.run()`.
- `tests/perfstat.cjs "<query>" [wait]` prints the stats line and takes a screenshot; `?perfx=0` is the before. Screenshots are compared by pixel difference.
- Open for the next: the pool with fix 7 on, the bar with the musicians' hiding, the 512 lamp map's look close up, then a build and the owner's own stats line before and after. Fix 5 (fewer draws) and the Walker's folded hair and eyes (56.7K triangles drawn about 8 times) not started.

## Known open items
- The droids (27K triangles) and the store's biggest chunk (24K) are still drawn on the street with nothing in view: their bounds touch the view's edge.
- Hitbox-walled pockets (a corner of the Diner between its chairs, behind the bar counter, a strip at the castle's drums): left as they are, closed by things' true boxes.
- RAISE / LOWER and GROW / SHRINK apply only to the Diner and the Bar; the bodega, the apartment house and Ghost Street would need their builders
  rewritten to take a height and a size.
- The live website (`bralynnb/tsfm`, `market/market.html`) is on 8.0.1. Update it only when he says "go live".
