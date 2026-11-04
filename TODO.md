# To do

Everything still to do, shared by every chat. Sorted by area, each line tagged; the order of work comes first.
Audited 4 Nov 2026 against the code, HISTORY and git (every line was still open; stale parts are marked).

**How to use**: before starting a line, write `[taking: <your branch>, <date>]` after it and get that onto `main` with your work (or on its
own); tick it `[x]` in the pull request that finishes it. Add new lines in their area with the owner's words and date, tagged like the rest.
Grep `docs/HISTORY.md` before starting: a newer owner decision wins over a line here.

**Tags**: **P1** blocks work or hurts players now · **P2** soon · **P3** polish · **P4** only if the owner wants it.
Size (the code part): **S** under an hour · **M** half a day · **L** a day or more · **XL** several days.
Kind: **pick** (the owner chooses first) · **look** (the owner tries it live) · **code** · **check** (tests, CI, measuring) · **find** (look into it).
Risk is noted only when it isn't low.

## The order of work

1. **Keep the checks honest** (CI area): run the full checks on `main` once (it settles six lines); restore the lost HISTORY entry; give
   the long checks their own time limits. Everything else merges on these checks.
2. **The owner's look session** (one sitting on the live site): every **look** line, listed under "For the owner" below.
3. **The owner's picks** (one batch of questions): every **pick** line, listed under "For the owner" below.
4. **Performance, measured first**: the start-up and frame-time comparison, then the freeze after the start, the tree shadows, the wind,
   then the draw-distance picks. The owner's lag complaints come first among code work.
5. **The server chain, in this order**: RLS SQL → login cookie with the self-hosted libraries → painting takedown → split the `Home`
   object (art in its own) → money on the server → trade checked on the server. Live data: one migration window, after the checks run.
6. **Then the grouped polish passes** (each one pull request): the bath room, the clothes, one tree pass, the skate park in Section B,
   the shop insides with their windows, the moves.

## For the owner

**To try on the live site** (one sitting; each line is in its area below):
the Mesh2Motion moves · the jeans · the cars, their insides and the radio · the menus, the start spot, the map and GO TO (#563, #571, #576) ·
the HUD margin on his screen · the fair's fence · a ghost's revival in the bath · the egg poacher · the fluffy grass · the castle at night ·
the cinema's titles ·
VR on the Quest 3 (and the painter in it).

**To pick** (one batch; each line is in its area below):
draw distance (one control or two, and the default) · tree shadows (option 1, 2 or 3, after the re-measure) · tree crowns (A–F) and trees
by distance · the park's edge ring as elms · the iso view under the canopy · the bath ghosts in or out · the shoes key · the tee in one
piece · the egg poacher's tint (confirm he said "tintable") · who stands on Market St (fix it or not; visitors take turns) · the referee's
habits · the arcade games and the civic tower in GO TO · THE GREENS' five questions · the castle's torches · the fountain and the Mall gate
(back or dropped) · the freeze fix (his go) · money on the server and the `Home` split (which objects, the live migration) · clearing the
parked cars · photos in trade · the bow · birds, dragons' clips and more human clips · VR hand-walking, hand models, filters in the headset ·
the physics extras (darts now twice at the bar) · the long checks' time limits · `docs/MAP.md` out of git · NPC voices (lifts the
19 Oct "no sound" rule) · the easel mockup (update or leave).

## CI, checks and tools

CI runs only on pull requests and by hand (the workflow has no push trigger), so `main` itself is checked only when someone starts it.
- [ ] **Run the full checks on `main` once** · P1 · S · check. Start the workflow on `main` with `full`. No full run exists since 4 Nov:
  #576 and other merges went in after the last `main` run (6dfc80f5, 16:05 UTC), and the skate park's tricks (#552) passed CI only on
  their pull request. The run also confirms lines that look fixed (close each if it passes):
  - "GitHub's checks get no machine": over (failed 15:05–15:34 UTC on 4 Nov; runs pass again since 16:05);
  - the cast check at 11:00 and 2:30 (`tests/jobsim.cjs`): rewritten in a7268617 to compare each person with their day; passed 11 times since;
  - the navigation wasm aborts: the playhouse `Aborted()` was recast out of memory, fixed in 95795b7f (#518); `src/153-nav.js:36-42` falls
    back to A* anyway; no places failure since;
  - `tests/fishing.cjs` at random: steadied in ef15d2f1 (3 Nov), passed three times since;
  - `tests/cars.cjs` flaky: b56ea1db lets go of W after two tiles; the "beside another check" case is local only (CI runs steps one at a time).
- [ ] **Restore #512's lost HISTORY entry** · P1 · S · code. "2 Nov 2026: more of Rapier, each one a PHYSICS setting in GRAPHICS" (owner:
  "lets add them all, add them as toggles in graphics…") was added in 6b3c9deb and dropped in the merges caee19fb/116b27da. Put it back.
- [ ] **The long checks need their own time limits** · P2 · S · pick + check. The job's limit was raised to 350 minutes (c460f80a, 4 Nov) and
  was still hit: the headset (VR) step hung 08:29–13:43 UTC in run 41795287054. Steps have no limits of their own, and a hang burns
  Actions minutes (they ran out on 20 and 28 Oct). Add `timeout-minutes` to the long steps (VR, catacomb run, room editor) or split them
  into their own job; the owner says yes to 350 or a new number.
- [ ] **`docs/MAP.md` conflicts on nearly every merge** · P2 · S · pick. It is written by the build; 58 commits since 3 Nov touch it, and
  open pull requests keep editing it. Options: stop keeping it in git (CLAUDE.md tells chats to grep it, so that line changes too), or the
  cheap one, `docs/MAP.md merge=ours` in `.gitattributes` and let the build rewrite it. `TODO.md merge=union` would help this file the same way.
- [ ] **"chunk later was not loaded before use" on the lawn** · P2 · S · code. Seen at `?at=40,150` on 2 Nov (as #371, #372; the numbers
  change every build). Rebuild, open the spot, read the warning's number in `dist/chunks.txt`, add the missing `LOAD`. With: the fluffy grass.
- [ ] **The black-void sheet view doesn't show rig bodies** · P2 · S-M · code. `?sheet=poacher` showed only ground, the camera not on it
  (`?sheet=` is handled per maker, `src/111a-bodies.js:113,122`; the poacher doesn't reach it); `tests/sheet.cjs:9` crashes on `hud`/`stat`,
  no longer globals. Every new character's look-over goes through it: do before the egg poacher's look and pictures of the moves.
- [ ] **`tests/loosecheck.cjs` fails on `main`** · P3 · S · check. Its start spot (`at=-2.2,3.2`, lines 17 and 52) has no loose things near
  it any more; nothing runs it (not in `site.yml`). Fix the spot and add it to the physx step. With: the physics extras and STAND ON THINGS.
- [ ] **The cinema's video titles** · P3 · S · find. YouTube refuses `youtube.com/oembed` from CI since 2 Nov (`src/059f-cinema.js:202`,
  fails quietly: no title, nothing breaks); from elsewhere it answers, so players likely get titles. Check on the live site; if not, fetch
  the title through the worker.
- [x] **#501 (THE CATACOMB RUN in VR) was merged on a red build check**: read 4 Nov. Run 41477704509 failed only in places (the dungeon's
  page error was YouTube's 403); the VR and catacomb steps passed; 97ceb8aa (2 Nov) made places ignore other sites' refusals.

## Performance

- [ ] **The start-up and frame-time comparison** · P1 · M · check. Never finished (2 Nov: `tests/startprof.cjs` on the base, main and the
  clothes branch, stopped part way). Redo it on today's main with `tests/budget.cjs` (CI "measure" check). The baseline moved since: three
  r160→r186 (8e7626d4), the BatchedMesh cull (8bc04ece), the Drive models' shadows only near. Isolate the freeze below first; it skews the
  start-up numbers. Feeds every line in this area.
- [ ] **Freeze about 20 s after the start** · P1 · M · code (owner's go first: he never asked) · risk med. `WINDOWS.first` in
  `src/130a-windows.js:72–75` runs 4 s after the start and, for each off-map inside with windows looking in, builds the whole inside
  (`ROOMS.offBuild`), takes its window pictures (`WINDOWS.bake`), saves them in `localStorage` and drops the inside, all at once on the main
  thread: seconds of stall on a fresh visit. Likely worse since the merchant shops got glass both ways (4 Nov). Fix: a piece per frame,
  nearest first (like `BATCH.tick`), or only when you first come near (shops already build live when near since 4 Nov). Check: frame gaps in
  the first 30 s with `?fresh=1`. Makes `tests/online.cjs` flaky. With: "Live windows" (same file).
- [ ] **Tree shadows: the lag in the owner's render-inspector shot** · P1 · M · pick + code · risk med. Owner, 2 Nov: "extremely laggy.",
  Market St near 32,25 at night, 10 FPS. Measured then: the park's leaf-card trees (about 148k triangles) and the street oaks (about 23k)
  cast shadows, and every shadow refresh (the street lamp's point cube 512x6, the sun and moon maps) draws them again: about 1,000 calls and
  750k triangles that frame. A quarter of the trees use the fine-leaf look (1.8× the cards, `TREEGEN.cards` in `src/060b-trees.js`). The
  lamp shadow still redraws every 0.2 s (`src/064-map-post.js:27`); moving loose things force near lamp shadows too (`reshade`,
  `src/150-loose.js:119`). Options for the owner: **1** cast shadows from the trees' lite card set (recommended: nearly the same look for a
  third of the cost; a shadow-only caster on its own layer; `lite` exists, 060b:67), **2** no tree shadows from street lamps (sun and moon
  kept), **3** fewer cards on the fine-leaf trees. Re-measure first (the baseline moved). Check: render inspector at `?at=32.5,25.2&hour=21`,
  `tests/startprof.cjs`, `tests/budget.cjs`. Before the tree look lines (they add shadow triangles).
- [ ] **Does the wind bring the lag back?** · P2 · S · check. Wind on again for trees, plants and grass by the owner's 2 Nov pick ("Both,
  with wind"; he had turned it off on 30 Oct for lag). Not measured: `TUFTS.wind` (`src/140a-tufts.js:65`), `PARK.windK` (`src/061-park.js:262`).
  Measure in the same run as the comparison; if it costs, a WIND row in GRAPHICS (like the PHYSICS rows), with the owner's yes.
- [ ] **Two draw-distance controls: keep both or make one?** · P2 · S · pick. Left from #549 (owner, 4 Nov: "add a draw distance for far
  buildings"). DRAW DISTANCE in GRAPHICS (each player's own, `src/161a-cull.js:56`) and DRAW TO RANGE / DRAW ALL on the fog in ATMOSPHERE
  (the owner's global look, `src/134e-distfog.js:65`) both limit what's drawn; the nearer wins. Ask with the default below; keep both
  editors in sync.
- [ ] **DRAW DISTANCE's default** · P2 · S · pick. 120 tiles, picked by Claude, not the owner; far buildings vanish at that edge with no fog
  (the haze is off by default since 3 Nov). Ask: keep, change, or ALL. Sets the baseline for the tree-by-distance and shadow lines.

## Server, security and money

In order (each step builds on the one before): RLS SQL → login cookie with the self-hosted libraries → painting takedown → split `Home`
(art in its own object) → money on the server → trade checked on the server. Live-data steps go in one window, after the checks run on
`main`, and end with the owner trying it live.

- [ ] **Commit the Supabase RLS SQL** · P1 · S · pick + code. 1 Nov review §B9. `players`, `admins`, `invite_codes`, `bug_reports` (and
  `join_beta`, the `bugs` bucket's policies) live only in the dashboard. Add them under `supabase/` beside `apartments.sql`/`cinema.sql`.
  The owner pastes the current policies, or OKs reading them with the Supabase tools; review before applying anything.
- [ ] **Login cookie HttpOnly** · P2 · M · code · risk med-high (live auth). 1 Nov review §B8. `src/door/door.html:44` sets the Supabase
  token as a JS-readable cookie, so an injected script can lift the session. **The game reads it too**: `src/111d-online.js:177` and
  `src/136c-tenants.js:57` look for `tsfm-pass`, `src/136a-bugs.js:13-16` uses it as the Supabase bearer and rewrites it on refresh. Fix:
  the worker sets it `HttpOnly` on `/enter` (plus a `/renew`), a non-secret "logged in" marker for online and tenants, another token source
  for bugs. The session and refresh token also sit in `localStorage` (door.html `persistSession:true`). Test login on the site before merge.
  With: "Self-host the CDN libs" (both touch door.html).
- [ ] **Self-host the CDN libs** · P2 · M · code · risk med. 1 Nov review §B8 (supply chain). From jsdelivr by dynamic `import()`, no
  integrity: `@supabase/supabase-js` (door.html:39), `partysocket` (111d:152, 059o:18), `html-to-image` (162c:74; HISTORY says the website
  build bundles it: verify), and also three-mesh-bvh (087b, 137), rapier (090), tweakpane (087dz), @recast-navigation (153). Bundle them into
  `dist/g/` as hashed files (the `+esm` bundles chain more CDN imports; recast and rapier carry wasm). three.js stays on the CDN on purpose.
  With: the login cookie, VR hand models.
- [ ] **Painting: a way to take a painting down** · P2 · S-M · code. From #564. The TENANTS panel can't hide or remove a player's
  painting. An ART tab in `src/136c-tenants.js` and an owner-only `/admin` `do:"artoff"` in `worker/door.js` (`artDel` at :477 lets only the
  painter remove unfinished work). Decide what a hung or packed painting shows once removed (a blank frame, or the item goes). Ships on
  today's `Home`; the split below carries it over.
- [ ] **Split the global `Home` Durable Object** · P2 · L · pick + code · risk high (live migration). `homeOf` (`worker/door.js:336`,
  `idFromName("homes")`) is one object holding every home, owned save, passport and painting (each painter up to 96 MB): one single-threaded
  object for the whole game, against "build for many". Fix: one object per player (`idFromName(id)`), a small passport-counter object
  (stays unique), and art in its own object (anyone reads a finished painting by id). Visits (`body.who`) read another player's object.
  Migrate live data once; do it before access widens. Fold the money migration below into the same window if the owner agrees.
- [ ] **Money on the server** · P2 · XL · pick + code · risk high. From the 1 Nov review (its #1; owner: add to TODO, 4 Nov). Cash is a
  client-held string in `/owned` (`worker/door.js:80-84`), so any logged-in player can set their balance; shops and the BBS spend it.
  `INV.cash` is written at about 50 places in 27 files, mostly earnings (fishing, forage, arcade, fair, gems), so a buy/sell ledger
  priced from `data/items.json` isn't enough: earnings need a rule each, or a capped "earn" call. `/owned` stops taking cash; migrate each
  balance once. Owner decides first: which object, how to migrate. (`docs/REVIEW-2026-11-01.md` §B6.)
- [ ] **Trade: the server trusts each game's offer** · P3 · M (cash) / XL (items) · code · risk high. From #564: `trade()`
  (`worker/door.js:283-306`) only clamps shapes; each game applies the swap itself (`src/159i-trade.js:43-45`). Cash checked server-side
  needs the money ledger; items need a server-held pack (no line for that yet). Low on its own today (anyone can set anything in `/owned`),
  high once money is on the server.
- [ ] **Shared-world writes aren't checked** · P3 · M · code. Found in the 4 Nov audit: review §B7 (anyone may write any `world` key on the
  block, including `add` counters) has no line. The shared ground and pouches (4 Nov) also trust the client's item records. Decide the rules
  with the trade line.

## Places and insides

- [ ] **Shop insides: can you walk in and out?** · P2 · S (check) · find, then pick. Owner, 3 Nov (his shot of the bath house): "when
  entering buildings like the bathhouse you dont go all the way in, you get sent to a middle area where you cant walk in or out, and you can
  still see npcs players outside area, makes no sense." Done since: the bath has an open walk-in door (4 Nov); no one outside is drawn
  inside the bank, bar, museum, theatre or art museum and the void past the walls is black (#577); the playhouse is off the map now
  (`ROOMS.off.playhouse`). Left: go into the bar, Museum of Earth, Art Museum, bank and theatre (`?at=x,z` near the door, double-click;
  `STORE.enter`/`exit`, `src/058-store.js:244/247`) and check you land in the room and can walk in and back out. If one is broken, ask the
  owner: an open walk-in door like the bath's (against the 21 Oct "doors never move" rule) or off the map like the arcade. Prove it in
  `tests/places.cjs`. Work with `docs/INTERIORS.md`. With: "Live windows".
- [ ] **Live windows not yet checked in a picture** · P3 · S · check. The bar's glass from inside must still show the street and its people
  (after #577's "no one outside drawn inside a shop"); the Boardwright's, Fix-It's and Diner's glass never pictured. Third- or first-person
  view. Same visit as the shop insides.
- [ ] **The bath room: ghosts, steam and the dark bar** · P3 · M · pick + code. One room, one pull request, one look:
  - the ghosts: THE HAND TOWEL and THE NAPKIN still wander inside (`src/149-ghosts.js`, `spot(g%2===0)`); owner, 4 Nov: "empty except the
    fog"; 2 Nov: "the bath ghosts that lived inside stay inside". Ask whether they go. Mind `docs/INTERIORS.md` §2 (a ghost's front desk) and
    the bath staff in `data/lives.json` (lifeguard, room attendant);
  - steam spilling out of the open door (his picked mockup B, 4 Nov): not built; the steam is a box fog inside (`SHARED.steam`,
    `059e-ghostdojo.js:235`, drawn by `134e-distfog.js`), so it needs a second box out of the doorway or particles; drawn only near; in the
    headset it waits on "VR filters";
  - a thin dark bar on the floor near the front wall, seen from one overhead angle: the board seams (059e:205), the door's light-shaft quad
    (219-222) or the front wall's left-out face (200).
- [ ] **A ghost's revival at the end of the bath countdown** · P3 · S · look. The countdown and its reset on stepping out work; the moment at
  zero (`back()` in `src/103a-death.js:30`, alive where you stand) was never seen. Die, walk in, wait 10 s on the live site; or add the
  step to `tests/places.cjs`, which enters the bath.
- [ ] **The road along the Hudson from Market St** · P3 · S (check) / M (lay it) · find. Owner, 4 Nov: "why isnt the hudson showing,
  missing road". The water and quay show within 60 tiles now (9ec872d3); no road code exists there. Picture it; if a road is missing, lay it.
- [ ] **The apartment house's two thin pipes hide early** · P4 · S · code. On its far side, they're cut a few steps before the house when
  you walk away (each piece cut by its own footprint, `src/161a-cull.js:44–61`): give them the house's footprint. Re-test (the cull became
  a BatchedMesh on 4 Nov). With: the draw-distance picks.
- [ ] **The castle at night** · P3 · S · look + pick. His pick after the move (2 Nov): at the night gate it still looked dark. Ask whether the
  torches should be brighter, and whether the spot, path and drawbridge height are right. More light costs frames at night.
- [ ] **The fair's fence** · P3 · S · look. Fixed in a8b78e5c (#570: it stands where the lot is drawn; one wall had shoved you off the start
  of Market St); the owner hasn't seen it. Optional: a fence step in `tests/fair.cjs`.

## Skate park (Section B)

One pass, one pull request.
- [ ] **The map editor and its ground picture for Section B** · P3 · L · code · risk med. Placed by `sections.places` in `data/world.json`
  (owner, 4 Nov: "option 1, open air, remove the gate in A"). The owners' editor (`src/editor/editor.html:54`) still reads the old
  `parkPlaces.skatepark`; nothing in it or in `src/096-mapedit.js` reads `sections.places`; it edits one section (`SID`, editor.html:116);
  `tools/topmap.cjs` has no section option and its picture stops at y 209 (the skate park is at 328). Also stale in the ground picture since
  its last run (7e53fae6): the skate park's move, the fair, the caverns' removal, the lake corner. Re-run it (40 minutes) in a pull
  request of its own (the tiles conflict), after other map changes land.
- [ ] **The minimap doesn't draw it** · P3 · S · code. `UI.mapPlan` (`src/094-ui.js` ~250–289) only labels it; nothing draws its outline;
  the plan is built once and cached. After open PR #596 (the brochure map, same file).
- [ ] **Look into the bowl** · P3 · S · check. `?sec=B`: the checks prove the ground is cut round it; no picture confirms the grass doesn't
  show in the bowl. A third-person shot (the 4 Nov screenshot rule: never overhead).
- [ ] **The places tour no longer visits it** · P3 · S-M · check. `tests/places.cjs` can't load Section B (why is unknown); `tests/skate.cjs`
  covers it but runs only when skate files change. Cheaper: add `data/world.json|src/006-map-pre` to the skate trigger in `site.yml`.

## Characters and the street

- [ ] **Who stands on Market St, and why** · P2 · M · pick + code · risk med. Owner, 4 Nov: "list all the characters and why im seeing each
  one on the street"; he has not said yes to fixing these. The Hudson crew (6–7) stand stacked on one spot at about (45.4, 1.1) while "at
  work" (`CREW.spot`, `src/111fb-fleamarket.js:30,49`). The park crew (22) and the depot crew (8) have no JOBS records (`src/159-jobs.js`),
  so they walk main street. All seven visitor groups (43) come every day: should they take turns? JOBS also run on the server
  (`worker/lives.js`). With: the cast check, the referee, the fair's staff (4 Nov: "keep them as fair workers for now").
- [ ] **The referee's habits** · P3 · S · pick. The merge of #567 and #570: `data/lives.json` `referee` is the fair's kart-track marshal with
  habits `drink, fish, movies` (the fair's `gamble` lost to the interiors' `movies`). Ask the owner.
- [ ] **The egg poacher** · P3 · S · look + code. Never looked at on the live site since #511 (2 Nov). His colours aren't tintable: HISTORY
  records only "Keep its colours"; "tintable" is only here, so confirm the pick. If yes, an opt-in jitter field on `BODIES.rebaked`
  (`src/111a-bodies.js:162-170`, shared by the RPG folk, the crew, the merchant, the skaters), not a poacher-only hack. After the sheet view.
- [ ] **Ragdolls only on the townsfolk** · P3 · M (stand up where they fell) / L (street characters) · code. `knockNear` loops only
  `NPCS.extra` (`src/150o-physmore.js:56`); street characters (`076-npc-map`) aren't on the rig yet. Ragdolls stand up where they were, not
  where they fell (`N.rag=null` without moving `N.st`). Seen only on your screen (see shared physics).

## Physics and vehicles

- [ ] **The physics extras (#512) never tried in a real game** · P3 · M · look + check. The bar's dartboard scoring a throw (the bar now also
  has a darts 301 game, 8999ffd2: two ways to score, ask whether the physics one stays), an upright trash can taking small things, hanging
  plants, lanterns and bulbs swaying, glass breaking. `src/150-loose.js`, `src/150o-physmore.js`; add cases to `tests/physx.cjs`.
- [ ] **STAND ON THINGS only rose halfway in the test** · P3 · S-M · check. 0.10 of a 0.20 block; the test's bar was lowered to pass
  (`tests/physx.cjs`, autostep `src/150-loose.js:185`). Try it at full speed; likely the slow test frame rate.
- [ ] **The go-kart** · P3 · M · code + pick. Gets in where you stand, not where you set it down (the fair's rentals already board where they
  stand: `kartKind(V,{world:true})`, `src/150t-fair-karts.js:19`, reuse it); held, it shows as a little kart in your hands; not on the
  Boardwright's wall though `data/characters.json` sells it; a wall at speed just stops it (owner: should it throw you out?). Shares VEH
  with the cars and the fair: run `tests/cars.cjs` and `tests/fair.cjs`.
- [ ] **The cars, in game, for the owner** · P2 · S · look. Only seen in test pictures: the insides (too dark or bright? seats, belts, dash),
  the cars 40% bigger next to the buildings, the driver a little smaller in the muscle car and wedge coupe, the radio by ear (loudness, the
  muffle outside, the four stations). Then the parked-cars line.
- [ ] **Cars parked before they got bigger** · P2 · S · pick + code. A parked car keeps its spot in the block's world (`car:<id>`,
  `worker/door.js:244`, applied at `src/150p-cars.js:89`); at the new size it may touch the kerb or another car, and Rapier shoves it onto the
  pavement. Fix: clear the saved `car:*` spots once on the server (owner first), after his look at the cars. Run `tests/cars-server.cjs`.
- [ ] **The radio on the live site** · P2 · S · look. The stations (`/g/<station>.<hash>.mp3`, with Range) were only streamed by the checks:
  play one on the site and check it starts at the shared moment. The diner's jukebox reuses it.
- [ ] **Physics is only on your own screen** · P4 · XL · pick + code · risk high. Other players don't see karts, ragdolls, flying loose things
  or broken glass; broken and binned things come back on reload. Player ragdolls and cars are already shared; the new shared ground
  (`drop:<key>` records, 757ff104) is the pattern for broken and binned things. Networking, authority and storage in the block's object.
- [ ] **Walls and ground are still boxes to the physics** · P4 · L (shapes) / XL (deterministic) · code · risk high. Only loose things got
  real shapes; Rapier's deterministic build, to keep physics the same between players, waits for shared physics. A kerb as a box is why
  cars get shoved onto the pavement.

## Trees, grass and the park

One tree pass after the tree-shadow pick (more leaves mean more shadow triangles).
- [ ] **Fluffy crown + real leaves** · P3 · L · pick + code · risk med. Options at https://claude.ai/artifact/D7mg8a17ZmWbz5Q88GJrov:
  A fluffy crown (now), B single leaves, C ball-lit leaves, D fluffy core with a leaf edge, E leafy cards, F leaves on the sunny top.
  Suggested: D for close trees, C for showpieces (the cherry, the Mall elms). Keep the 2 Nov rule: a big tree's crown is open inside.
- [ ] **Trees by distance** · P2 · L · pick + code. The nine looks at https://claude.ai/artifact/TQ1obJhoEbEzv3cquPxwfC. Suggested: leaf
  dabs at middle distance; the "picture past the haze" part is stale (the haze is off by default since 3 Nov and the park now draws trees
  out to the draw distance, `src/061-park.js:380`). After the draw-distance picks; base: the 30 Oct LOD rule (25 tiles whole, cards beyond).
- [ ] **The park's edge ring and the rows past the north wall** · P3 · M · pick + code. Owner, 4 Nov: "add these to TODO.md". Only the inner
  trees and the entrance rows became elms; the ring (`row(...)`, kinds `TK`, `src/061-park.js:304`, baked low so it hides the wall) and
  `TREES.back` (061-park.js:375) kept the pack's oaks, elders, giant, spruce and willow. Ask whether "shaped exactly the same" includes them
  (his 27 Oct rule: trees outside "barely bigger than other trees, and need to be same new tree style"); the elms are 26–31 m, so check
  from Market St that the wall still hides. Check `tests/parktrees.cjs`, `tests/treeshot.cjs`.
- [ ] **Isometric view under the entrance canopy** · P3 · S-M · pick + code. You see the ground only in the peek disc; beyond it the
  underside of the leaves (`PEEK` in `src/008-batch.js`). Options: leave it, or hide every crown over you in the iso and map views (through
  the cull's BatchedMesh since 4 Nov; the trunk goes too unless cards and limbs are split, the same split as shadow option 1). Keep the 2
  Nov rule: the leaves over you open fully round you.
- [ ] **Look at the fluffy grass in game** · P3 · S · look. #508: the tufts' dark root, light tip and tip patches never seen; the standing
  grass didn't show in the test browser. With the chunk bug on the lawn.
- [ ] **The fountain terrace and the Mall gate** · P4 · M (gate) / L (all) · pick. See "A fountain terrace and a big lake" below: the
  fountain was removed on 22 Oct (owner: "lets remove the fountain for now", `FOUNT.on:false`, `src/060a-fount.js:6`), so the walkway has
  nothing to lead to; the Mall gate was never built. Ask: drop it, or bring the fountain back with the gate.

## Clothes and the Walker

One clothes review for the owner, then one pull request; portraits with `node tests/clothes.cjs dist/market.html <dir>`.
- [ ] **The jeans in play** · P2 · S · look. #495 and its walking fix #523: live, waiting for his look and yes. The tee waits on it.
- [ ] **The shoes key M sits next to the map (Shift+M)** · P2 · S · pick. 2 Nov: his feet went bare, likely from pressing M for the map
  (barefoot matters for foraging). `shoes:'m'` in `src/094-ui.js:25`, `LOOKS.shoes` in `src/102-looks.js`. Offered to move it; he picks the
  key. Update the keys list with it.
- [ ] **Clothes leftovers** · P3 · M · code · risk med. Crouching, seen from the side, a patch of her grey briefs at the back of the thigh (the
  jeans' seat back stays with the hips, `ks` in `MAKE.pants`, `src/072b-garb.js:159`); his forearm passes through the jeans at the hip when
  his arm swings behind him; stray pixels near the hips on some walking frames. The new Mesh2Motion poses may show more.
- [ ] **The tee in one piece, like the jeans** · P4 · L · pick + code. His pick, 2 Nov: "1", one continuous garment; the tee is still a body
  tube with set-in sleeves that overlap at the shoulder (`MAKE.shirt`, `src/072b-garb.js:128`). Only if he wants it (no seam showed in any
  portrait), and after the jeans' yes.

## Moves (Mesh2Motion)

- [ ] **The owner tries the moves live and approves** · P2 · S · look. #557, #561 (4 Nov; owner: "everything else in game that is needed
  to do like using a net, fishing, sitting, etc.", emotes, work moves, fight moves). Never seen in a picture in the game: H emotes, L kick /
  O dodge, eating, crafting, planting, mining, sitting down, the fishing cast and pull, the sword or net body swing, the dragons' fire breath
  and naps, the dungeon spiders, the park dogs, foxes, wolves and horses resting. Pictures need the sheet view fixed. The follow-ons below
  wait on his yes.
- [ ] **More park animals rest** · P3 · M · code. His "Yes, idle variety" (4 Nov); done: dog, fox, wolf, horse, wild horse, mule. The cat,
  black cat, deer, cow, pig, lion, zebra and others share the fox's 26-bone rig (`fox` in `tools/m2m-bake.cjs`, `rest:` in
  `src/087-npc-creatures.js`). One bake pass with the two below.
- [ ] **Birds glide** · P4 · M-L · pick + code. Mesh2Motion's `bird` rig (flap, glide) onto the crows and owls (`data/fauna.json`, 46 / 21
  bones with feathers) needs its own map. Check the 28 Oct "always flapping" rule (it was about the dragons) doesn't cover birds.
- [ ] **The dragons' unused clips** · P4 · S-M · pick. In `data/full/dragon.json`: Land (in place of the hover at a perch), Roar, Walk. Glide
  stays unused (owner, 28 Oct: always flapping).
- [ ] **Standing up from a seat** · P3 · M · code · risk med. `stand()` in `src/100-use.js:30` puts you off the seat at once, so
  `sitting-exit` would start in the air: play the stand-up first, then move you off, without blocking movement. With the INTERIORS seats.
- [ ] **Fishing from the rowboat has no body move** · P3 · M · code. The rod and arm are hidden while seated (`free()`, `src/146a-wield.js:45`),
  so no cast or pull. With the fishing check's flaky steps and the stand-up (both seated poses).
- [ ] **Bow draw and shoot** · P4 · M (moves) / L (a bow) · pick. Mesh2Motion's `bow-pull`, `bow-pull-hold`, `bow-release` (his fight-moves
  pick, 4 Nov). There is no bow in the game: the owner decides on one first (a ranged weapon in WIELD and the brawl). Fit with
  `tools/m2m-moves.cjs`, play through `MOTION`.
- [ ] **More of the 222 human clips** · P4 · L · pick. Ladder and wall climbing in place of `climbPose` (`src/001-rig.js:462`; other players and
  collision depend on it), crouch-walk, sword combos (with the brawl), ground pound, death falls (with the ragdolls). Wood chopping, digging
  and lying in bed have no action in the game yet.

## Paintings and trade

- [ ] **Paintings in the item editor** · P3 · S · code. Each painting shows as its own entry; editing one does nothing (the class `painting`
  sets them all, `ITEMS.cls`, `src/140b-items.js:15-16,31`). Hide `pt_`/`wip_` ids from its list. Same pull request as the next.
- [ ] **A painting sold to THE TRADER leaves its title and thumbnail in your save** · P3 · S · code. `OWNED 'paint'`, a few KB each; only
  trade calls `PAINTINGS.gave` (159i:43). Drop them when the pack no longer has it and it isn't hung.
- [ ] **Trade: photos can't be traded** · P4 · M · pick. A photo's picture lives in its owner's own save (`OWNED 'photos'`), so they're kept
  out (`SWAP.no`, `src/159i-trade.js:5`). The owner's rule (4 Nov, trade): "photos and the passport stay yours", so this is his call. If yes,
  after the `Home` split, into the art store.
- [ ] **The painter, not yet tried for real** · P3 · S · look. Pinch to zoom and pen pressure (code at `src/159g-paint.js:140,169`; never on a
  phone, tablet or pen), in VR (never; with the Quest session), and the easel showing your latest unfinished painting (never pictured).
- [ ] **The easel mockup is out of date** · P4 · S · pick. `mockups/easel.html` (https://claude.ai/artifact/MzbB331ZcnwQf6P2H6b92P) shows
  the skills and dealers he turned down ("not an easel subgame"). Update to the painter as built, or leave it.

## Menus, map and HUD

- [ ] **Try live, once deployed** · P2 · S · look. The menus (#563: one ADMIN window), where you start (#571: back where you left off within
  the hour, else the platform; gone for everyone at once on log out) and the map and GO TO (#576, merged on local checks only).
- [ ] **The HUD's 24px margin on the owner's own screen** · P3 · S · look. His pick A (4 Nov); checked locally only; his live shot sat tighter
  than the local layout predicted (`--fx`/`--fy`, `src/004-main.js:28`). Same sitting as "Try live".
- [ ] **The arcade's games in GO TO** · P4 · S · pick. #576: the Catacomb Run, the Greens and Roam are left out (reached through the arcade).
- [ ] **The civic tower in GO TO** · P4 · S · pick. Listed only when it stands on the map; today it's away, stacked behind the bodega.
  Nothing to do unless the owner wants it back on the street.

## VR

One session on the owner's Quest 3 settles most of these.
- [ ] **Try it on the Quest 3; the owner to approve** · P2 · S (him) · look · risk med (real hardware). Owner, 27 Oct: "make sure that the
  controls in game match the quest 3 controllers, also add hand tracking in game so i can use my hands to use the menus". Only tested on an
  emulated Quest 3 (`tests/vr.cjs`). Waiting on him: the 30° snap turn, the button layout, the menu panel's size and distance, how the
  hands look. Collect his picks for the lines below in the same session.
- [ ] **No walking with hands only** · P3 · M · pick + code. Hands point and pinch at menus; walking needs the sticks (teleport is
  controller-only, `src/162c-vr.js:136`). He picks: point-and-pinch to teleport, pinch-and-pull, or a wrist button.
- [ ] **The menu panel's picture can lag behind the window** · P3 · S-M · code. `html-to-image`, a few hundred ms; a press goes to what the
  picture showed (`PN.hits`, 162c:73-83): hit-test live, or hold presses until the picture is fresh. Before typing in chat.
- [ ] **No typing in chat in the headset** · P3 · L · code (mockup first). No keyboard in an immersive session: a keyboard drawn on the panel.
  Needs the panel lag fixed.
- [ ] **The hands are plain joint dots** · P4 · M · pick + code. `JM` in `src/162c-vr.js:62`. A real hand model (three's
  XRHandModelFactory, models from `@webxr-input-profiles`) is a reuse: ask first; self-host the models (the site asks nothing of a CDN).
- [ ] **The PS2 filter, distance fog and colour grade aren't drawn in the headset** · P4 · L-XL · find, then pick · risk high. Screen
  passes; `VR.draw` renders the scene straight to the headset (the cel outline and LOOK passes too). Per-eye passes would cost on the
  Quest: measure first. Below CLAUDE.md's "cel is the quality floor" in the headset meanwhile.

## Big features

### NPCs that really talk (owner, 17 Oct 2026) · P3 · XL · pick + code · risk high

> "give all npcs real ai connection and elevenlabs to speak for real. anything they say will be saved and logged and anything that can be
> reused will be reused until they have up to 100 things they can say."

- **Every NPC talks with a real AI** (each with its own character: who they are, how they talk, what they know about the Market), when you
  walk up and double-click them, or when they meet each other.
- **They speak out loud with ElevenLabs voices** (a voice picked for each NPC).
- **Everything they say is saved and logged** (who said it, to whom, when, where, what it was answering).
- **Reused before made new**: each NPC keeps a library of its lines (the text and its recorded audio); a line it already said is said again
  when it fits (no new AI call, no new voice cost); a new one only when nothing fits, up to **100 lines**; then it only reuses.
- **Today**: the line pools (`src/092-lines.js`: `LINES.add`, a log of the last 100 in memory only, voice blips in code) and the scripted
  talk window (`src/159da-talk.js`, 28 Oct). No AI or voice code in `src/` or `worker/` yet.
- **Needs**: an ElevenLabs account, key and voices; the worker to hold the keys and make the calls (never the page); somewhere to keep the
  lines, audio and log (Supabase or Cloudflare storage); a way to match a moment to a line already said; a budget. The 19 Oct "no sound"
  rule must be lifted for voices (only the car radio is an exception so far; INTERIORS says "Sound: none"). Do it with the playhouse play's
  ElevenLabs voices (4 Nov: "he will provide them later"). The old "artifact page ask Claude" path is gone (no claude.ai copy since 20 Oct).

### A fountain terrace and a big lake in the park (owner, 18 Oct 2026)

> "I want to add a large fountain in the top right area of central park on the current map. use this entrance exactly. and put a large lake
> towards the top (map doesnt have full lake in it just the bottom part), show me some mockups of possibel layouts" ... "queue that"

- **His three photos**: the entrance is Central Park's Mall gate (two tall carved brownstone piers with urn finials, carved shield panels,
  low stone walls, two black bollards, a paved path between black iron railings and lawns, under big elms); the fountain is Bethesda (a
  round stone basin, a two-tier bronze fountain, a winged angel, a brick terrace in rings, low balustrade walls, the lake behind); the
  lake: wide, still green water, grey rocks at the near shore, trees all round, towers behind.
- **Done 19 Oct** (his pick A, "no walkway to fountain yet, make it 20% smaller"): the terrace, the fountain and the lake, the park's north
  edge pushed 36 tiles north (`src/060a-fount.js`).
- **Removed 22 Oct** (owner: "lets remove the fountain for now"): `FOUNT.on:false`; the lake's shore closes over the terrace. Since then the
  entrance walk got the Mall's elms (2 Nov) and the park redesign was shelved (28/29 Oct).
- **Left, if he brings it back**: the walkway to the terrace and the Mall gate from his photo (the line in "Trees, grass and the park").
  Built the game's way: CEL light, the game's own painters and colours, no photo textures; it states its cost.
