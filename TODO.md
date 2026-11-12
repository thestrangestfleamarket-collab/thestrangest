# To do

Everything still to do, shared by every chat. Sorted by area, each line tagged; the order of work comes first.
Cleaned 9 Nov 2026: done lines taken out (they're in HISTORY and git), lines made moot by the archive and the new map taken out, what was
left of a done line kept as its own line.

**How to use**: before starting a line, write `[taking: <your branch>, <date>]` after it and get that onto `main` with your work (or on its
own); tick it `[x]` in the pull request that finishes it, with anything left as a new line. Ticked lines are cleared now and then.
Add new lines in their area with the owner's words and date, tagged like the rest.
Grep `docs/HISTORY.md` before starting: a newer owner decision wins over a line here.

**Tags**: **P1** blocks work or hurts players now · **P2** soon · **P3** polish · **P4** only if the owner wants it.
Size (the code part): **S** under an hour · **M** half a day · **L** a day or more · **XL** several days.
Kind: **pick** (the owner chooses first) · **look** (the owner tries it live) · **code** · **check** (tests, CI, measuring) · **find** (look into it).
Risk is noted only when it isn't low.

## The order of work

1. **Keep the checks honest**: a full run that finishes (core, loop, riders and skills pass, 9 Nov).
2. **The owner's look session** (one sitting on the live site): every **look** line, listed under "For the owner" below.
3. **The owner's picks** (one batch of questions): every **pick** line, listed under "For the owner" below.
4. **Performance, measured first**: the render inspector's "undefined ×16", the subway station at the start, the start-up and frame-time
   comparison, the stalls after the start, the wind.
5. **The server chain, in this order**: catches decided on the server → login cookie with the self-hosted libraries → split the `Home`
   object (art in its own). Live data: one migration window, after the checks run.
6. **Then the grouped polish passes** (each one pull request): the park's grounds, the Hudson row, one tree pass, the skate park in
   Section B, the shop insides with their windows, the moves.

## For the owner

**To try on the live site** (one sitting; each line is in its area below):
HOLLOW PINES at `/asylum` (12 Nov: play it through on the screen and in the Quest 3; it has only been run in an emulated headset) · everything merged since 7 Nov that "waits for his look and yes" (the new layout and fronts, the bar, the gym, the pets and pet shops, the
fish market (9 Nov), the farm, the guitar and instruments, the traffic, the skate pit, the telescope and microscope, the far view) · the merges without a green
check (below) · phones and tablets · the moves · the cars, their insides and the radio · the menus, the start spot, the map and GO TO ·
the HUD margin on his screen · the bath house on the island and a ghost's revival · the fluffy grass · the castle at night ·
VR on the Quest 3 (and the painter in it), last.

**To pick** (one batch; each line is in its area below):
whole-map layouts A–F · the broken set piece · the companion drone · the economy's sinks and loops · keepers for the pet shops ·
tree crowns (A–F) and trees by distance · the castle's torches · the jets follow-ups · the avatar follow-ups · the `Home` split (which
objects, the live migration).
After the beta: photos in trade · the bow · birds, dragons' clips and more human clips · VR hand-walking, hand models, filters in the
headset · NPC voices.

## CI, checks and tools

CI runs only on pull requests and by hand (the workflow has no push trigger), so `main` itself is checked only when someone starts it.
- [ ] **Faces still sharing a place** (owner, 11 Nov 2026: "a permanent solutino for this issue that applies everywhere") · P2 · M · code. `PW_CHROMIUM=/opt/pw-browsers/chromium ZWHY=1 node tests/zfight.cjs dist/market.html` (40 min; or give spots `x,z`) lists them; 266 small pairs on 11 Nov (181 m² in all, from some 5,000): the park wall's queued pieces, the fish market against the bodega's ground, the street's prop kinds, shop window frames, the loop tunnels under far cars, the ring trees. Once it passes, add it to the workflow.
- [ ] **`tools/row-lay.cjs` is stale** · P2 · S · code. Its place list is the 8 Nov layout; running it writes that over `data/world.json` (found 9 Nov). Bring it up to date or remove it.
- [x] **Tests failing on `main`** · P2 · S · check. Done 9 Nov: the loop's station A followed the subway's move (trains stop at the platform
  again: `loop.cjs`, `riders.cjs`); `skills.cjs` checks only what isn't archived.
- [x] **Core fails on `main`: the overhead view** · done 9 Nov: the check now follows the 8 Nov rule (some part of you, feet to head,
  on screen), not your middle inside the screen; the game was right.
- [ ] **The full GitHub run doesn't finish inside 75 minutes** · P2 · S · check. No full run on `main` has passed since 4 Nov.
- [ ] **Bodega register test**: clicking dog food doesn't add it to the basket (live game) · P2 · S · find.
- [ ] **Merged without a green check or re-run, look at them live** · P2 · look. Skate pit #877, floating eyes #869, haze #858, shop
  freeze #868, magic carpet #884, telescope #882, phone door #896, empty theatre #895, instruments #893, park perf #898.
- [ ] **Branch `claude/game-sim-week-30-players-whmgrg`** pushed with no pull request (its week simulation merged as #897): delete it or
  open one · S · check.
- [ ] **`tests/loosecheck.cjs`: two street failures, and the bodega part** · P3 · M · find. The milk crates fly when shoved, land, sleep
  and can be picked up, but **walking into them doesn't push them** (moved 0.00) and **a shoved thing's old place still blocks you a
  little** (pushed out 0.12): the game or the test? The bodega part looks for an office chair that isn't there now (pick another loose
  thing). The apartment and dungeon parts weren't reached. Not run by CI (add it to the physx step once it passes).

## The map and the park
- [ ] **The falls, the owner's look** · P2 · S · look. Owner, 10 Nov ("1 yes 2 all no name just a spot on map"): try the falls live (swim, the jump rock, the stairs, the rope swing, night); its spot is west of the brook's mouth, not east (no room there).
- [ ] **The falls in the map editor** · P3 · S · code. Its spot and size from data/world.json parkPlaces.falls (cairns and bats done 10 Nov).

- [ ] **The fronts, for his look** · P2 · look. Built 8–9 Nov (the rows modelled, `src/038zc-facades.js`; brick, shopfronts, pet shop
  signs). Left: his look and yes.
- [ ] **The park's grounds** · P2 · XL · code · risk med. The six grasses as grounds, a glade each, our bushes (the trees done 8 Nov).
- [ ] **The Hudson row** · P2 · L · pick + code. Its buildings, corner grass, sparse trees, townsfolk routes; a second fishing shop west
  of the west flea lot (owner asked for both sides; only Fishing & Scuba stands); stall keepers; the lost shrubs and small trees.
- [ ] **The apartment house** · P2 · L · code. The lobbies and the other floors (only your own flat is built).
- [x] **West St out of our section** (10 Nov, claude/fervent-hawking-wkq7zv). Left: the brochure's subtitle still says WEST ST (with the sections re-plan).
- [ ] **The eight sections on the new ring** · P1 · XL · code · risk high. Owner, 10 Nov ("Yes go" of the lettered mockup): A mid-Hudson side with C and E, B and G on the ends, D F H along the back. `sections.grid`/`ring`, the Loop's tracks and stations (end stations need a west/east side), the subway map, section B's skate park and pit.
- [ ] **Whole-map layouts A–F** · pick. Mocked up (A Ring + F Stack recommended), waiting on the owner.
- [ ] **One set piece broken after the lanyard/shop removals**: bring its two items back, or archive it too? · pick.
- [ ] **Large trees from Market St**: fix 1 merged 9 Nov (from #778); fixes 2 onward not seen · look.
- [ ] **Small things after the new layout** · P3 · S · code. The lighting tint on the modelled buildings; the Tower's sign behind its
  stoop; "X Z Y indexes lined up" (asked 8 Nov, not answered).
- [ ] **Not seen in game** · look. The bath house on its island, the moon, the 12 new giants, the 10-storey Tower, the concrete behind
  the rows, the cloud see-through circle.

## Performance

- [x] **"undefined ×16" in the render inspector**, about 129k triangles in the park: find what it is · P1 · S · find. Found 9 Nov (claude/beautiful-einstein-i82dp0): the backdrop park trees, four instanced meshes drawn whole; now drawn by cell.
- [x] **The street walkers' cost ("dress", 15 ms a frame in the render inspector, 10 Nov)** · P1 · S · code. Their rig step and pose worked out every finger (they have no finger bones), at 120 steps a second; now without fingers, and where they stand checked only when they move.
- [x] **Far trees drawn when off screen** (10 Nov) · P2 · S · code. The park ring's and the big trees' far shapes were never culled; now culled tree by tree like the rest. The render inspector also counted every piece of a culled batch as drawn (fixed). Cloud trees: none placed yet.
- [x] **The far bodega, falls and wall drawn from inside the park** (10 Nov) · P1 · S · code. In the park they, and the cars, are not drawn past 100 tiles from you.
- [x] **The river drew the whole town a second time** (10 Nov) · P1 · S · code. Its see-through picture now skipped when no water was drawn lately, and drawn with only what is in or by the river.
- [x] **The far backdrop drawn when unseen** (10 Nov) · P2 · S · code. The far city was never culled; backdrop pieces its own shader shrinks away were still drawn. Now culled piece by piece and left out past that distance.
- [x] **Too many draw calls** (10 Nov) · P1 · S · code. Far cars (traffic and parked) in a few merged pieces; the lake and its bed in 3×3 chunks. Up the street about 1,070 → 850 draws; facing the park 557 → 304.
- [x] **Big meshes built after the start drawn whole for ~100 s; the lawn's 5×5 built in one stall** (11 Nov) · P1 · S · code. The cull splits them a few ms a frame, not one a second; the lawn round you is one shot from above, not 25 (same picture, 5–10× faster), and no longer redraws the sun's shadows.
- [ ] **The subway station is built and painted at the start** (15 MB): build it on the way down · P2 · M · code.
- [ ] **The park shop animals**: all 179 download at the start; measure the start on a real connection · P2 · S · check.
- [ ] **The start-up and frame-time comparison** · P1 · M · check. Never finished (2 Nov, `tests/startprof.cjs`). Redo it on today's main
  with `tests/budget.cjs` (CI "measure" check). Feeds every line in this area.
- [ ] **Two more stalls at the start** · P1 · M · find. Measured 4 Nov in the test browser (`?fresh=1`): about 8 s as the start ends and
  3.7–4.5 s about 10 s later (shader compiles, `BATCH` painting, the first lights?). Re-measure: the shops' insides are built at the start
  since 9 Nov. (9 Nov: the first is the shader warm-up, behind the loading screen; it now waits without blocking where the browser can. The shops are no longer built at the start.)
- [ ] **Does the wind bring the lag back?** · P2 · S · check. Wind on for trees, plants and grass (owner, 2 Nov: "Both, with wind"); not
  measured (`TUFTS.wind`, `PARK.windK`). Measure with the comparison; if it costs, a WIND row in GRAPHICS, with the owner's yes.

## Server, security and money

In order: catches decided on the server → login cookie with the self-hosted libraries → split `Home` (art in its own object). Live-data
steps go in one window, after the checks run on `main`, and end with the owner trying it live.

- [ ] **Voice's relay key** (11 Nov 2026) · P2 · S · look. Cloudflare dashboard → Realtime → TURN: make a key, then on the worker
  `wrangler secret put TURN_KEY_ID` and `TURN_KEY_TOKEN`; without them voice uses STUN only (some networks won't connect). Then try it live with two people.
- [ ] **A modified client can still add to its own save** (up to $2,400 and 1,800 items an hour) · P1 · L · code · risk high. Money is
  a server bucket with a ledger since 9 Nov, but the game still decides what you catch: decide the catches on the server.
- [ ] **Login cookie HttpOnly** · P2 · M · code · risk med-high (live auth). `src/door/door.html` sets the Supabase token as a JS-readable
  cookie (`tsfm-pass`); the game reads it too (`111d-online`, `136c-tenants`; `136a-bugs` uses it as the Supabase bearer and rewrites it).
  Fix: the worker sets it `HttpOnly` on `/enter` (plus a `/renew`), a non-secret "logged in" marker for online and tenants, another token
  source for bugs. The session also sits in `localStorage`. Test login on the site before merge. With the CDN libs.
- [ ] **Self-host the CDN libs** · P2 · M · code · risk med. From jsdelivr with no integrity: supabase-js (door), partysocket (111d,
  059o), html-to-image (162c), three-mesh-bvh (087b, 137), rapier (090), tweakpane (087dz), recast-navigation (153), satellite.js (150fg).
  Bundle them into `dist/g/` as hashed files (recast and rapier carry wasm). three.js stays on the CDN on purpose.
- [ ] **Split the global `Home` Durable Object** · P2 · L · pick + code · risk high (live migration). `homeOf` (`worker/door.js`,
  `idFromName("homes")`) holds every home, owned save, passport and painting: one object for the whole game. Fix: one per player, a small
  passport-counter object, art in its own object. Migrate live data once, before access widens.
- [ ] **Money, the rest** · P2 · M · code + look. The money log has no TENANTS button; stall goods not shown on tables; try stall renting
  and a two-player trade live.
- [ ] **The economy's picks** · pick. From the week's simulation (`docs/research/week-sim-2026-11-09.md`): money sinks (93% earned is never
  spent), the busking/fairy ring/dungeon loops (92% of income), safe zones, more stalls.
- [ ] **Draft #834 (Double Bass)** waits for review. From its 7-day test: sword resale profit, the day count resets on reload, mushrooms
  never spawn, skills cap in 2 days, the fishing bot can't fish, no hunger · P2 · M · code.

## Places and insides

- [x] **The play on the Wooden O's stage** (owner, 10 Nov 2026: "bring the play back on the stage") · P2 · M · code + look [taking: claude/laughing-curie-ui41fc, 10 Nov]
- [x] **The playhouse as THE WOODEN O** (owner, 10 Nov 2026: "redesign it", picked B) · P2 · M · code + look [taking: claude/laughing-curie-ui41fc, 10 Nov]
- [x] **The movie theatre as THE STARLITE** (owner, 11 Nov 2026: "lets replace our movie t heatre in game with this") · P2 · M · code + look [done: claude/hopeful-faraday-grs9o0, 12 Nov]
- [ ] **The Starlite, for his look** · P2 · look. The inside from his page, the reel between films, the house lights switch, the STARLITE neon.
- [x] **The movie theatre as THE FLEA PIT** (owner, 10 Nov 2026: "i want to redsesign the movie theater", picked B) · P2 · M · code + look. Front, dark inside, box office, seats [taking: claude/laughing-curie-ui41fc, 10 Nov]
- [ ] **The fish market** · P2 · M · look. Owner, 9 Nov 2026: waits for his look and yes. Not yet: the workers keep no hours (the jobs system is archived), the editor's ground picture (`tools/topmap.cjs`) not re-made, the minimap does not draw the sheds.
- [ ] **The fish market's sheds** · P3 · S · pick. The two sheds stand on the row, not on the water side as the real ones did (the quay stays open for fishing); say if they should cross the street.
- [x] **Fossil digs** (owner, 10 Nov 2026: "do 1-8") · code. [done: worktree-agent-a66213ee845b8a10a, 10 Nov]
- [ ] **Fossil digs, for his look** · P2 · look. The three sites in the park, the bones and skeletons (simple shapes, Polyfork's brush and the
  bones lying at the sites), the hall in the Art Museum's atrium.
- [ ] **Where the fossil hall stands** · P3 · S · pick. In the Art Museum's atrium (the Professor curates there) while the Museum of Earth is
  away; one line moves it once that museum is back.
- [ ] **The telescope** · P3 · S · code. The firsts board on no wall; GO TO Betelgeuse failed once. (10 Nov: satellite passes follow the
  real hour and the aurora is in the street's own sky.)
- [x] **The public observatory** (owner, 10 Nov 2026: "Both") · P2 · L · code. A dome in the park with one big shared telescope, deeper than
  the others (`SCOPE.site`); star parties there. Options or a mockup first.
- [ ] **The night sky, left over** (10 Nov) · P3 · M · code. The editor's ground picture has no observatory until `tools/topmap.cjs` is run again. A solar eclipse in the street's sky (the eyepiece has it); other players don't
  see your field telescope's tripod; the names and STARGAZE's lines are not in the VR headset; photographs for the other 100 Messier objects.
- [ ] **The shop insides: walk in and out** · P2 · S (check) · find. Owner, 3 Nov: "you get sent to a middle area where you cant walk in
  or out". Since then the Hudson shops are walk-in and the shops' insides built at the start (9 Nov). Left: go into the bar, the Art
  Museum and the bank and check you land in the room and can walk back out; prove it in `tests/places.cjs`.
- [ ] **Live windows not yet checked in a picture** · P3 · S · check. Each shop's window its own live picture since 9 Nov; the bar's glass
  from inside must still show the street. Same visit as the insides.
- [ ] **The bath house on the island** · P3 · S · look. The steam spilling from its door (his mockup B, 4 Nov) not built; the ghosts
  inside (out, 7 Nov) and the revival in its steam never seen live.
- [x] **The dungeon's baked torchlight** (owner, 11 Nov 2026: "do the baked torchlight", "yes go") · P2 · M · code + look [taking: claude/affectionate-bell-ftu5zz, 11 Nov]. `src/062e-dunlight.js`, `tests/dunground.cjs`. Waits for his look and yes.
- [ ] **The castle at night** · P3 · S · look + pick. At the night gate it still looked dark (2 Nov): brighter torches? More light costs
  frames at night.

## Skate park (Section B)

- [ ] **The minimap doesn't draw it** · P3 · S · code. `UI.mapPlan` (`src/094-ui.js`) only labels it.
- [ ] **Look into the bowl** · P3 · S · check. `?sec=B`: no picture confirms the grass doesn't show in the bowl (third person).
- [ ] **The places tour can't load Section B** · P3 · S · find. `tests/skate.cjs` covers it when skate files or `data/world.json` change.

## Characters and the street

- [ ] **Keepers for the new pet shops** · P3 · S · pick. Every unarchived character fitting is working elsewhere.
- [ ] **Where the barn's kinds are sold** · P3 · S · pick. The barn is gone (10 Nov 2026); farm, zoo and wild animals, horses, chickens and ducks are pets in the data but sold nowhere.
- [ ] **The gym, next if wanted** · P4 · pick. A sparring bot in the ring, a trainer, bets on fights.
- [ ] **The owner's nine (9 Nov 2026: "Violin, flute, trumpet, Dances CMU motion-capture library, Painting copies, sign language, juggling, ade animal taming as skill, fossil digs, bar games, implants")** · one pull request each, in this order:
  - [x] **Violin, flute, trumpet** · P2 · L · code. [taking: claude/blissful-goodall-udydlj, 9 Nov]
  - [x] **The piano, harp and drums as Polyfork models** · P3 · M · code. [done 10 Nov, with the trumpet's valves moving] Owner, 10 Nov: "Use very realistic instruments models and textures" (his pick: Polyfork); their keys, strings and heads move, so each needs fitting.
  - [ ] **Violin, flute, trumpet, seen live** · look. How each is held and sounds; the tunes are the piano pieces' top line.
  - [ ] **Dances** · P2 · L · code. Learnt by band like songs, from the CMU motion-capture library; performed for tips.
  - [ ] **Painting copies** · P2 · L · code. Copy open-collection masterworks by difficulty; hang or sell them.
  - [ ] **Sign language** · P2 · L · code. Owner: "Both": what you type is signed by your hands as far as your skill reaches, and some townsfolk only sign.
  - [ ] **Juggling** · P3 · M · code. Patterns by band, street performing.
  - [ ] **Animal taming, a skill** · P2 · XL · pick + code. Owner: "everything" (wildlife as pets, monsters that fight beside you, mounts): options first.
  - [ ] **Fossil digs** · P3 · L · code. Dig bones, assemble skeletons for the museum.
  - [ ] **Bar games** · P2 · XL · pick + code. Owner's picks: darts (the archived 301), pool, bowling (needs its own place: options first).
  - [x] **Implants** · P3 · L · pick + code. Owner: "Both" (stat boosts and new abilities), fitted at a clinic. Done 10 Nov: THE CLINIC (`src/146zkc-clinic.js`, EQUIP's implants in `src/146c-equip.js`), `tests/implants.cjs`.
  - [x] **Bar games** · P2 · XL · pick + code. Owner's picks: darts (the archived 301), pool, bowling. Bowling done 10 Nov: THE STRANGEST LANES (`src/146zkb-bowling.js`, `worker/lanes.js`, `tests/bowling.cjs`).
  - [ ] **The bowling alley, seen live** · look. The lanes, pins and hook in a real browser; the longboarder at the counter; two players on the website.
  - [ ] **Implants** · P3 · L · pick + code. Owner: "Both" (stat boosts and new abilities), fitted at a clinic.
- [ ] **The instruments, seen and heard live** · look. The 10 Nov feel and fuller recordings (and the recorded guitar): does it still sound like MIDI?
- [x] **The piano's 88-key panel** (owner, 11 Nov 2026) · P2 · S · code. [done 11 Nov] A display under the book, lighting with the piece (book-only).
- [ ] **The instruments, the rest** · P3 · S · code. The bar's piano and kit playable in place; a bandstand for the park guitar.
- [ ] **Companion drone NPC**: mockup done, waiting on "go" · pick.
- [ ] **PIP the flying bot** (owner, 11 Nov 2026) · look. Built 11 Nov (`src/111dd-flybot.js`, `worker/flybot.js`, `tests/flybot.cjs`). Needs the `ANTHROPIC_API_KEY` secret on the worker; his yes on the look, the name and the daily limit (`BOT_DAILY`, 150). Model: Haiku 5.5 (owner, 12 Nov).
- [x] **Your AI double** (owner, 9 Nov 2026; done 9 Nov) · P2 · M · code. `src/162gb-twin.js`, `worker/twin.js`, `tests/twin.cjs`. Removed 10 Nov 2026 with all the bots.
- [ ] **Flight with the cape** · P2 · M · look + code. Its moves check times out, the cape isn't cloth, clouds hide you; DRIFTCAP lasts 5 min.
- [ ] **Not seen** · look. The floating-eyes fix side on, the paper doll live, clothing layers at night under lamps (#654), the delivery
  drone with two real players.
- [ ] **Winged creatures' flapping and the character styling options**: chats still running on 9 Nov, check where they stopped · find.
- [ ] **After the archive (5 Nov)** · P2 · code. The archived cast's bodies still ship in the cast data (hidden by ARCH).
- [ ] **Climbing the puff trees; placing them** · P3 · pick.
- [ ] **Ragdolls for today's bodies** · P3 · L · pick + code. Owner, 7 Nov ("go with your recommendations"): knock-overs stay dormant until
  today's cast's bodies get a ragdoll; `tests/physx.cjs` checks them again then. When they come: stand up where they fell, not where they were.

## Apartments
- [ ] **The four apartment houses on West St** (owner, 10–11 Nov 2026, `mockups/apartments.html` option B) · P2 · L · code. West St's road back from Market St for four lots; four house blocks, each its own brick (walk-up, brownstone, pre-war, cast-iron loft); the Tower goes. [taking: claude/trusting-fermat-sybm7o, 11 Nov]
- [ ] **Four sizes of flat, buy up** (owner, 11 Nov 2026: "Start small, buy up", "Comes along") · P2 · L · code. Small, medium, big, big with a half floor; everyone starts in No. 1 and buys up; the layout comes along, what no longer fits goes to PUT AWAY. [taking: claude/trusting-fermat-sybm7o, 11 Nov]
- [ ] **DECORATE's catalog lamps give no light; seven restored books share one name** (found in the 10 Nov 2026 audit) · P3 · S · code. The catalog's floor lamp, desk lamp, bare bulb, neon signs and lanterns are painted without their light; the books all read A RESTORED BOOK.
- [x] **Pets** (owner, 7 Nov 2026: "use polyfork cats and dogs and birds, let people choose one as pet (choose color, style) use the base models"; done 7 Nov) · P2 · L · code. `src/146zj-pets.js`, `tools/pets-bake.py`, `tests/pets.cjs`. Waits for his look and yes.
- [x] **Every breed, the permapet, PETS in the menu** (owner, 8 Nov 2026: "try to add every breed possible"; "player can pick their main pet when they start"; "add PETS menu in esc menu"; done 8 Nov) · P2 · L · code. `tools/breeds-bake.py`, `tools/breeds_list.py`, `src/146zj-pets.js`, `src/162g-firstday.js`, `tests/pets.cjs`. Waits for his look and yes.
- [x] **Pets, the rest** (owner, 8 Nov 2026: "1-6"; done 8 Nov) · P2 · L · code. Breeds for every farm and pet animal, better dog bases, dog food back, pets at home, stats at work. Waits for his look and yes.
- [x] **The park's animals to the pet store's cages; every living thing a pet; THE AQUARIUM** (owner, 8 Nov 2026: "hudson lot, apartment tank only, birds ok, go"; done 8 Nov) · P2 · L · code. `src/146zj-pets.js`, `src/146zjb-aquarium.js`, `tools/pets-more.py`, `tools/petcages-bake.py`, `tests/petstore.cjs`. Waits for his look and yes.
- [x] **THE AQUARIUM's one tank** (owner, 11 Nov 2026: "one large fish tank that has all the fish in it"; done 11 Nov) · P2 · M · code. `src/146zjb-aquarium.js`, `tests/petstore.cjs`. Waits for his look.
- [x] **The pet shops split; the park farm and its barn** (owner, 8 Nov 2026: "separate buildings, recommendations, big liz, A, yes go"; done 8 Nov) · P2 · L · code. `src/146zj-pets.js`, `src/059i-mshops.js`, `tools/pets-more.py`, `tools/petcages-bake.py`, `tests/petstore.cjs`. Waits for his look and yes.
- [x] **The farm deeper in the park, gate shut, its animals living** (owner, 9 Nov 2026; done 9 Nov) · P2 · M · code. `src/086a-farm.js`, `tests/farm.cjs`. Waits for his look and yes.
- [x] **Animal taming** (owner, 9-10 Nov 2026: "animal taming as skill", "One skill, three tiers", "do 1-8"; done 10 Nov) · P2 · L · code · look. `src/146zjd-taming.js`, `tests/taming.cjs`. Left: skeletons and ogres are not tameable (people, not creatures); a fighter fights only the dungeon's monsters; the owner's look at the deer back in the woods and the deer under a saddle.
- [x] **The rules of the street: bots and walkers off the road, across at crosswalks, on WALK; a wandering bot visits real things** (owner, 9 Nov 2026; done 9 Nov) · P2 · M · code. `src/076-npc-map.js`, `src/162g-bots.js`, `worker/folk.js`. Next: the bots' goals (options given to the owner).
- [x] **Flying pets flap and perch; ground pets wait below** (owner, 9 Nov 2026: "winged creatures should always be flapping wings. birds and flying creatuers can land on your shoulder or head depending on size"; "pets that cant fly should not fly up with you"; "you can choose in pet properties where they sit"; done 9 Nov) · P2 · S · code. `src/146zj-pets.js`, `tests/perch.cjs`. Waits for his look and yes.
- [x] **Flying pets fly and land behind you; no shoulder perches; your pet's E prompt only when you face it** (owner, 10 Nov 2026; done 10 Nov) · P2 · S · code. `src/146zj-pets.js`, `tests/perch.cjs`. Waits for his look and yes.
- [ ] **Keepers for the new pet shops** · P3 · S · pick. Every unarchived character fitting is working elsewhere; the owner names who (from the archive or new).
- [x] **Your pet at home** (owner, 9 Nov 2026: "in your apartment's living room and bedroom, wandering by findPath, jumping or flying up onto things, idling, asleep"; done 9 Nov) · P2 · M · code. `src/146zj-pets.js`, `tests/pethome.cjs`. Waits for his look and yes.

- [ ] **Start in your apartment after logout, faster load** (#891): ready, not merged; the whole street still builds before you appear ·
  P1 · M · code.
- [ ] **The car radio unconfirmed** (cars parked past the map edge) · look.

## Physics and vehicles
- [x] **The Hudson's OCEAN look** · P3 · M · look. Owner, 11 Nov 2026 ("try 1 and 4 on the hudson"): Ultra-Water's FFT waves as a fifth way on the Hudson, things afloat riding the drawn waves. done 11 Nov: the default.
- [x] **Glitched slab on Market St; three road cars out** · P1 · S · fix. Done 10 Nov: the subway train no longer shows on the street; boxy sedan, 80s hatchback and yellow cab gone from the traffic.
- [x] **Vehicle editor follow-ups** · P3 · S · look. Done 10 Nov: a resized car or kart drives at its size, the traffic's models have their parts, the horse is in (colours and size), the train shows before you go down, the horse's COAT picker.

- [ ] **The vehicles, the rest of the owner's list** (12 Nov 2026) · P2 · XL · look + code. Taken by the vehicles chat. Still to build: the ghost wagon floating when parked and driven; the convertible's octopus driver (twice the size, tentacles on the wheel); the hospital on West St (Polyfork) with the hover ambulance waiting in its garage for an emergency; the rover sentient, picking up trash and mending the park; the moored fishing boat twice the size with a crew (Polyfork people, fuzzy, purple skin); the town car a limousine twice as long; the go-kart and rowboat bigger and more real.
- [ ] **Jets follow-ups** · P3 · S · pick. Fires and ice are worked out on each player's page (where a stream lands matches, how a fire
  spreads may not); characters burn and freeze but do not run from the fire.
- [ ] **The physics extras (#512) never tried in a real game** · P3 · M · look + check. The bar's dartboard (beside its darts 301 game:
  ask whether the physics one stays), an upright trash can taking small things, hanging plants and lanterns swaying, glass breaking.
  Add cases to `tests/physx.cjs`.
- [ ] **STAND ON THINGS only rose halfway in the test** · P3 · S-M · check. 0.10 of a 0.20 block; the test's bar was lowered to pass.
- [x] **The go-kart** · set down in front of you and got in there; a wall at speed throws you out (owner, 10 Nov 2026: "Throw you out"). Left: held, it shows as a little kart in your hands (owner: keep or change?); the Boardwright's wall is archived (the Skate Shop's shelves show it).
- [ ] **The hover cars and the police flier, for the owner** (10 Nov 2026) · P2 · S · look. Two taxis, the ambulance, the police flier: their shapes against Polyfork's, the shine by day and night, flying them (SPACE, SHIFT), where they park (West St).
- [ ] **The submersible, for the owner** (10 Nov 2026) · P2 · S · look. How it reads deep in the dark Hudson (its lamps, the hull), where it is moored; it passes through the pirate wreck (no walls for it yet); no dive check in `tests/cars.cjs` (the river is not built at the test's start).
- [ ] **The lake wreck, for the owner** (10 Nov 2026) · P2 · S · look. Its look under water by day and night, the way in, the hold; the follow camera crowds it in its narrow basin. (The airship's captain built 10 Nov; he can be seen only from far below.)
- [x] **The convertible drivable** (owner, 10 Nov 2026: "make this car drivable by players. you can choose the color of interior, exterior ... 1st person view") · P2 · M · code. Parked in the park on West St's line, PAINT outside and in (shared), first person in any car (V).
- [ ] **The convertible, for the owner** (10 Nov 2026) · P2 · S · look. Its spot (West St's line, x -27.5, y 56), the eight colours each side, the seat and eye in first person; first person in the other cars uses their cabins' eye.
- [ ] **The police cruiser, for the owner** (9 Nov 2026) · P2 · S · look. Its shape and paint against real 80s photos, the roof lights by night, the siren and horn by ear, where it is parked (West St); the other six cars have no opening parts yet.
- [ ] **The cars, in game, for the owner** · P2 · S · look. The insides, the cars 40% bigger next to the buildings, the radio by ear
  (loudness, the muffle outside, the four stations, starting at the shared moment).
- [ ] **Physics is only on your own screen** · P4 · XL · pick + code · risk high. Other players don't see karts, flying loose things or
  broken glass; broken and binned things come back on reload. The shared ground (`drop:<key>` records) is the pattern.
- [ ] **Walls and ground are still boxes to the physics** · P4 · L / XL · code · risk high. The kerb is done (a slope, owner 10 Nov 2026: "Just the kerb"; the corners' arcs too); the rest stays boxes; Rapier's deterministic build waits for shared physics.

## Trees and grass

One tree pass (more leaves mean more shadow triangles).
- [ ] **Fluffy crown + real leaves** · P3 · L · pick + code · risk med. Options at https://claude.ai/artifact/D7mg8a17ZmWbz5Q88GJrov
  (A–F). Suggested: D for close trees, C for showpieces. Keep the 2 Nov rule: a big tree's crown is open inside.
- [ ] **Trees by distance** · P2 · L · pick + code. The nine looks at https://claude.ai/artifact/TQ1obJhoEbEzv3cquPxwfC. The park's trees
  became whole only near you, a crown on a trunk far off (8 Nov): check what's left to pick.
- [ ] **Look at the fluffy grass in game** · P3 · S · look. The tufts and the grass in five heights (8 Nov).
- [ ] **Fruit trees: the picks left open** · P3 · S · pick. Of `mockups/fruit-trees.html` (10 Nov): making things (a cider press, an olive press, a sugar shack: where?) and who may pick (only the keeper for now).
- [ ] **Fruit trees: look at them in game** · P3 · S · look. The orchard by the farm and a big pot at home (10 Nov).

## Clothes and the avatar

- [ ] **Avatar follow-ups** · P3 · M · pick. Worn gear's own shapes on the avatar (rack clothes only dye it); ages (kid, teen, old:
  Polyfork has them); the 3 MB a figure could shrink if a build were dropped.
- [ ] **The bench is cut off at the sides in the editor's 360 view** · P3 · S · code.

## Things

- [x] **The ESC wheel, five rarities, the item card, walk-over pickup, appraisal, emote extras, pockets** (owner, 11 Nov 2026: "go with all your picks, build in that order") · done 11 Nov.
- [ ] **The owner tries them live and approves** · P2 · S · look. The bag's size (60/80/100, not the picked 24/36/48: a new player starts with 49 kinds); what the trainers teach (existing moves: HARVEST, PLANT A SEED, CAST A LINE, WATER THE FLOWERS, HARD LABOUR, BIG SWING, HOOK); the item card's lines (data/examine.json).
- [ ] **Appraising: where now?** · P2 · S · pick. Antiques & Pawn is gone (11 Nov); rough stones are off until the owner picks who names them (the exchange machines' eye?).

## Moves

- [ ] **The owner tries the moves live and approves** · P2 · S · look. #557, #561 and the Mixamo clips (7 Nov): emotes, kick and dodge,
  eating, crafting, planting, mining, sitting down, the fishing cast and pull, the sword or net swing, the dragons' fire breath and naps.
- [x] **More animals rest** (done 10 Nov 2026) · P3 · M · code. Done: dog, fox, wolf, horse, wild horse, mule, cow, pig (the fox's Sleep, `tools/m2m-bake.cjs farm`); the other fox-rig animals are not in the game.
- [x] **Dances and juggling** (owner, 9 Nov 2026: "Dances CMU motion-capture library", "juggling") · done 10 Nov: two PERFORMANCE skills, each a book of 50.
- [ ] **The owner tries dancing and juggling live** · P2 · S · look. The dance book (EMOTES > DANCE BOOK), juggling from a ball or club in the bag; the CMU loops' look.
- [x] **Sign language** (owner, 9 Nov 2026: "sign language", "Both") · done 10 Nov: a SIGN LANGUAGE skill (LANGUAGE), signed chat, two townsfolk who only sign.
- [ ] **The owner looks at the signs** · P2 · S · look. The handshapes and motions are hand-authored and simplified; which townsfolk sign (the diner waitress, the village gardener); the 60% gate.
- [ ] **More animals rest** · P3 · M · code. Done: dog, fox, wolf, horse, wild horse, mule; the others on the fox's rig (`tools/m2m-bake.cjs`).
- [ ] **Standing up from a seat** · P3 · M · code · risk med. `stand()` in `src/100-use.js` puts you off the seat at once: play the
  stand-up first, then move you off, without blocking movement.
- [x] **Fishing from the rowboat has no body move** · done 10 Nov: sat in the boat the rod is held and swung to cast and reel (a seat with `hold`).
- [ ] **Birds glide** (after the beta) · P4 · M-L · pick + code. Mesh2Motion's `bird` rig onto the crows and owls.
- [ ] **The dragons' unused clips** (after the beta) · P4 · S-M · pick. Land, Roar, Walk (Glide stays unused: always flapping).
- [ ] **Bow draw and shoot** (after the beta) · P4 · M / L · pick. No bow in the game: the owner decides on one first.
- [ ] **More of the 222 human clips** (after the beta) · P4 · L · pick. Crouch-walk, sword combos, ground pound, death falls.

## Paintings and trade

- [ ] **Paintings in the item editor** · P3 · S · code. Each painting shows as its own entry; editing one does nothing (class `painting`,
  `src/140b-items.js`). Hide `pt_`/`wip_` ids from its list. Same pull request as the next.
- [ ] **A painting sold to THE TRADER leaves its title and thumbnail in your save** · P3 · S · code. Only trade calls `PAINTINGS.gave`.
- [ ] **Trade: photos can't be traded** (after the beta) · P4 · M · pick. "photos and the passport stay yours" (4 Nov); if yes, after the
  `Home` split, into the art store.
- [ ] **The painter, not yet tried for real** · P3 · S · look. Pinch to zoom and pen pressure, in VR, the easel showing your latest
  unfinished painting.
- [x] **Painting copies** (10 Nov 2026) · the masterworks by band, the guide over the canvas, a copy scored; `tests/copies.cjs`.
- [ ] **Painting copies: the owner's look** · P3 · S · look. The 50 works' order (measured from the pictures: dark plain-ground portraits
  come out easy, Bruegel and engravings hard), the pass marks (40% to 85%), what a copy is worth; the score is the player's own browser's.

## Menus, map, HUD and phones

- [ ] **Try live** · P2 · S · look. The menus, where you start, the map and GO TO.
- [x] **The ? menu redone** (owner, 10 Nov 2026: "list every single thing you can do in game caterogized so you can see the specific moves for each"; merged 10 Nov) · P2 · M · code.
- [x] **The map in the menus' green look** (owner, 10 Nov 2026: "B, go"; done 10 Nov) · P2 · M · code. `src/141e-map.js`, `tests/brochure.cjs`. Waits for his look and yes.
- [ ] **The brochures** · P2 · S · look. Twelve, each in its own style, from three street racks (10 Nov): the styles, the photographs, where the racks stand, $2 and the $50 full set. Re-shoot a brochure's photographs and fix its words when its activity changes (`tools/brochure-shots.cjs`). START lends each kit (10 Nov): which items, where it starts you, when the loan goes back.
- [ ] **The HUD's 24px margin on the owner's own screen** · P3 · S · look. His pick A (4 Nov); checked locally only.
- [ ] **Phones** · P2 · L · look + code. Login on a phone never tried (the door lets them in since 9 Nov); the touch pad; menus fitted to
  phone screens, home-screen install, lighter graphics.
- [ ] **Notifications** · P4 · M · pick. Owner, 9 Nov (batch 2). The service worker is in; needs his picks (what notifies: a letter, the night
  market; where the player says yes) and a push key set as a secret on the worker.
- [ ] **The browser's extras** · P3 · S · look. The mouse look in first person, 3D sound, the app's icon and home-screen install, the
  lock-screen radio (9 Nov): wait for his look and yes.

## Sound

Owner, 9 Nov 2026: "real sounds". Each batch is named by the owner first.
- [ ] **P2 M pick** Real recordings in place of the code-made effects, a batch at a time (footsteps, doors, cars, weather, day and night, fights done, 10 Nov): animals, other vehicles, fire, the places' own sounds.
- [ ] **P3 S look** Listen to the footsteps, doors and cars live: the takes were picked by measurement, not by ear (the car pack is phone-recorded, low quality).
- [ ] **P3 S code** The sound editor's uploads stay in the shared store after their takes are deleted (the server has no delete yet).
- [ ] **P3 S code** After baking the editor's export into the code, clear the live set (or it keeps overriding the next bake's changes).
- [ ] **P3 S find** The wind is still made in code: the only CC0 wind found (OpenGameArt) is mostly low rumble. The effects file is 750 KB, all fetched at the first click (the ambience is its own file): split it further by place if it grows.
- [ ] **P3 S code** Fights: no bow twang or arrow hit yet (the guardians' arrows still blip), golems and dungeon creatures still use the made sounds; other players don't hear your blows, only their own.
- [ ] **P3 S check** `tests/instruments.cjs`' owner-kit line fails on main (the bag gets no instruments from `FORAGE.ownerKit()` there).
- [ ] **P2 S check** `tests/datacheck.cjs` is broken on main: it calls the archived `SNDED.open`, the Hudson's `bell` has no recipe in its table, `data/drums-samples.mp3` has no provenance record.
- [ ] **P3 S code** No crash or skid sound for the cars yet, and the karts, helicopter and flying traffic are silent (no CC0 recordings found yet).
- [ ] **P3 M code** Footsteps know only stone, grass and wood: the park's paths, sand, water's edge, metal stairs and carpet still sound as those three.
- [ ] **P2 M code** Other players heard: their footsteps, hits and doors from where they stand, fading with distance.
- [ ] **P3 S pick** The bodega's counter radio still plays its code-made tune: give it the market's stations like the apartments'?

## VR

Last (owner, 7 Nov 2026: "we will do VR checks last"): every check and look line here waits until the rest is done.
- [ ] **Try it on the Quest 3; the owner to approve** · P2 · S (him) · look · risk med. Only tested on an emulated Quest 3
  (`tests/vr.cjs`). Waiting on him: the snap turn, the buttons, the menu panel, the hands, your real moves (8 Nov).
- [ ] **No walking with hands only** (after the beta) · P3 · M · pick + code. Point-and-pinch to teleport, pinch-and-pull, or a wrist button.
- [ ] **The menu panel's picture can lag behind the window** · P3 · S-M · code. A press goes to what the picture showed: hit-test live,
  or hold presses until the picture is fresh. Before typing in chat.
- [ ] **No typing in chat in the headset** · P3 · L · code (mockup first). A keyboard drawn on the panel.
- [ ] **The hands are plain joint dots** (after the beta) · P4 · M · pick + code. A real hand model (self-hosted): ask first.
- [ ] **The PS2 filter, distance fog and colour grade aren't drawn in the headset** (after the beta) · P4 · L-XL · find, then pick ·
  risk high. Per-eye passes would cost on the Quest: measure first.

## Big features

### NPCs that really talk (owner, 17 Oct 2026) · P3 · XL · pick + code · risk high

> "give all npcs real ai connection and elevenlabs to speak for real. anything they say will be saved and logged and anything that can be
> reused will be reused until they have up to 100 things they can say."

- Every NPC talks with a real AI (its own character), speaks with an ElevenLabs voice; everything said is saved and logged; a line
  already said is reused when it fits, a new one only when nothing fits, up to 100 lines.
- Today: the line pools (`src/092-lines.js`) and the scripted talk window (`src/159da-talk.js`). No AI or voice code yet.
- Needs: an ElevenLabs account, key and voices; the worker holds the keys and makes the calls; storage for lines, audio and log; a
  budget.
