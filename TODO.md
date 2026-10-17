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
- Needs, when it's built:
  - an ElevenLabs account and API key, and a choice of voices;
  - a small server to hold the keys and make the calls (never in the page): on the live site the game's Cloudflare worker, which already sits
    beside `/market`;
  - somewhere to keep the lines, their audio and the log (the game's Supabase, or Cloudflare storage);
  - a way to match a moment to a line already said (what was asked, by whom, the mood), so reuse sounds right;
  - on the artifact page, the AI part can run through the page's own "ask Claude" (as the world editor's DESCRIBE does); the voices need the
    server either way.
