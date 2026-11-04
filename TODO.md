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

## Open from the windows and shops work (4 Nov 2026)

- **The lake's north end** (owner: "fix this part of the lake", his pictures at tile x 160, z 250): there the game counts you as in the water
  (air bar, blue minimap) but you stand on grass, and the water shows as a flat pale sheet with straight edges. The lake's shape says deep
  water but the ground there is not dug out. Being looked into.
- **Not yet checked in a picture**: the bar's windows from inside still showing the street and its people (after "no one outside drawn
  inside a shop"); the Boardwright's, Fix-It's and Diner's windows (only the Scanner's was pictured).
