# SKIRMISH TABLE's levels, set aside (owner, 22 Nov 2026: "remove all levels for now, use the regular chess board")

- `src/levels.js`: the eight landscaped maps' rows, as they were in `src/chess/maps.js` `MAPS` (river, pass, ruins, marsh, keep, deep, rime, scar).
- `src/land.js`, `worlds.js`, `clouds.js`, `scale.js`, `procedural.js`, `board.js`: how they and the old board were drawn. `src/campaign.js`: the campaign with its overland map and each battle's own battlefield.
- `data/land/`: their pictures, models and sounds (were `data/chess/land/`). `tools/chess-assets.py`: fetched them.
- `tests/chess.cjs`: the check as it stood, with the maps' own page checks.

To bring one back: its row into `MAPS`, the drawing files and `data/land/` back in place, `main.js` to build a map with `tiles` through `makeLand`.
