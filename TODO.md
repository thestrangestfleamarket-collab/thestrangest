# Feature list (to do)

The owner's list of features to build, newest last. Each line is his ask; the notes under it are what building it will need.

## NPCs that really talk (owner, 17 Oct 2026)

> "give all npcs real ai connection and elevenlabs to speak for real. anything they say will be saved and logged and anything that can be
> reused will be reused until they have up to 100 things they can say."

- **Every NPC talks with a real AI** (each with its own character: who they are, how they talk, what they know about the Market), when you
  walk up and double-click them, or when they meet each other.
- **They speak out loud with ElevenLabs voices** (a voice picked for each NPC: the goldfish, the bear, and every NPC to come).
- **Everything they say is saved and logged** (who said it, to whom, when, where, what it was answering).
- **Reused before made new**: each NPC keeps a library of its lines (the text and its recorded ElevenLabs audio). When something it already
  said fits, it says that again (no new AI call, no new voice cost); a new line is made only when nothing fits, until it has **up to 100
  lines**; from then on it only reuses.
- **Begun** (17 Oct 2026, `src/lines.js`, from his physician game's line pools): each character says a line from a pool when waved to (and the
  guards, droids, the Fox and the troublemakers at their moments), typed over his head with voice blips made in code; the last fourteen said are
  set aside so lines don't repeat; the hundred last said are logged (`LINES.log`: who, which pool, the text, when, the hour). The AI, the voices
  and the saved library of up to 100 lines a character come next on this base (`LINES.add(pool, lines)` takes new ones).
- Needs, when it's built:
  - an ElevenLabs account and API key, and a choice of voices;
  - a small server to hold the keys and make the calls (never in the page): on the live site the game's Cloudflare worker, which already sits
    beside `/market`;
  - somewhere to keep the lines, their audio and the log (the game's Supabase, or Cloudflare storage);
  - a way to match a moment to a line already said (what was asked, by whom, the mood), so reuse sounds right;
  - on the artifact page, the AI part can run through the page's own "ask Claude" (as the world editor's DESCRIBE does); the voices need the
    server either way.

## A fountain terrace and a big lake in the park (owner, 18 Oct 2026)

> "I want to add a large fountain in the top right area of central park on the current map. use this entrance exactly. and put a large lake
> towards the top (map doesnt have full lake in it just the bottom part), show me some mockups of possibel layouts" ... "queue that"

- **His three photos**: the entrance is Central Park's Mall gate: two tall carved brownstone piers with urn finials, carved shield panels on
  each face, low stone walls running off to the sides, two black bollards in the opening, a paved path straight in between black iron railings
  and lawns, under big elms. The fountain is Bethesda: a round stone basin with a two-tier bronze fountain and a winged angel on top, on a
  wide brick-paved terrace laid in rings, low balustrade walls at the back, the lake right behind it. The lake: wide, still green water with
  grey rocks at the near shore, thick trees all round, towers rising behind.
- **Where**: the fountain terrace in the park's top-right area, entered through that gate; a large lake towards the top of the park
  (today only its bottom part is on the map), the terrace's back wall on its shore.
- **First step: mockups** of a few possible layouts (where the gate, the path, the terrace and the lake go) for him to pick, before building.
- Built the game's way: CEL light, the game's own painters and colours, no photo textures; it states its cost (triangles, lamps, ms).
- **Done 19 Oct 2026** (his pick A, "no walkway to fountain yet, make it 20% smaller"): the terrace (46 tiles across, "like the mockup, -20%"),
  the fountain and the lake are in, the park's north edge pushed 36 tiles north for them (`src/060a-fount.js`, see docs/HISTORY.md). **Still to do**: the walkway to the terrace and the Mall gate entrance (the gate from his photo).

## Open from chats (shared; any chat adds, takes and ticks lines here)

How to use: before starting a line, write `[taking: <your branch>, <date>]` after it and get that onto `main` with your work (or on its own);
tick it `[x]` in the pull request that finishes it. Add new lines at the end with the owner's words and date. Grep `docs/HISTORY.md` before
starting: a newer owner decision wins over a line here.

- [ ] **Shop insides on the street: same problem as the old bath house?** Owner, 3 Nov 2026 (his shot of the bath house): "when entering
  buildings like the bathhouse you dont go all the way in, you get sent to a middle area where you cant walk in or out, and you can still
  see npcs players outside area, makes no sense."
  - What happened since: the bath was first moved off the map (#521, 2 Nov), then on 4 Nov the owner asked for an open door you walk
    through, its inside built in place when near (`src/059e-ghostdojo.js`, HISTORY 4 Nov "the bath house's door open"). So the bath is done.
  - Still to check: the bar, Museum of Earth, Art Museum, bank, theatre and playhouse. They build their insides in place behind the fade
    on a double-click of the door (`STORE.enter` / `STORE.exit` in `src/058-store.js`, `STORE.inside[id]`). Go in each one (`?at=x,z` near its
    door, double-click it) and look for: landing short of the inside (between the door and the room), not able to walk further in or back
    out, the street's NPCs and players still visible through it.
  - If one is broken, ask the owner which fix he wants before building it (a request that could mean more than one thing): the open walk-in
    door like the bath's, or off the map like the arcade and apartments (`ROOMS.off[id]` in `src/130-rooms.js`: `box`, `build` via
    `ROOMS.part`, `spawn`, `out`, `door`, `exit`; the street is hidden while you are in). Prove it in `tests/places.cjs`.
  - `docs/INTERIORS.md` (4 Nov) is the plan for those same insides (seats, staff spots, things to do): work with it, not around it.
- [ ] **Freeze about 20 s after the start** (seen 3 Nov, not asked for by the owner: get his go first). `WINDOWS.first` in
  `src/130a-windows.js` (lines ~72–75) runs 4 s after the start and, for each off-map inside with windows looking in, builds the whole inside
  (`ROOMS.offBuild`), takes its window pictures (`WINDOWS.bake`), saves them in `localStorage` and drops the inside again, all in one go on
  the main thread: the page stalls for seconds (worst on a fresh visit, with nothing saved). It made `tests/online.cjs` flaky (it now waits
  for 3 s of calm frames). Likely fix: take the pictures a piece per frame, nearest first, the way `BATCH.tick` paints far things, or only
  when you first come near the building. Check: frame gaps in the first 30 s with `?fresh=1`.
- [ ] **Park animals: what's left** (from the 4 Nov 2026 chat, owner: "lets work on making animals that live in park behave like the real
  animals and realistic sizes and amounts"; HISTORY 4 Nov):
  - The slime's size: asked, no answer yet; it stays the fantasy size until the owner says.
  - Checks still missing: the hawk scattering the small birds, feathers on the ground, rats at the bins, garden pests and slugs, bees flying
    from a hive to its flowers (`src/144b-birds.js`, `087-npc-creatures.js`, `144a-garden.js`, `141-forage.js`, `147a-bees.js`; add to
    `tests/wild.cjs`).
  - `tests/bnet.cjs` times out waiting for butterflies at the start (on `main` too): find why none show up near the start, then run it to
    the end.
  - Owner's approval of how they look: screenshots of the spiders in their webs, frogs, bats, fireflies and squirrels (third- or
    first-person, open ground) for him to see. Only the wasp has been shown.
