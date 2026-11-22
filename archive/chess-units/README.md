# SKIRMISH TABLE's cut unit types (owner, 22 Nov 2026: "simplify the characters down to the ones that dont just repeat each other"; "keep the wolf, make the cut")

Cut: Shieldbearer (`warden`), Pikeman (`pike`), Assassin (`assassin`), Crossbowman (`arbalest`), Storm Mage (`storm`), Frost Mage (`frost`), Summoner (`summoner`), Golem (`golem`), Bard (`bard`). The Skeleton stayed, only as what the Necromancer raises; its upgrade tree is here too.

- `src/`: the files as they stood with all 24 types. `game.js`: the nine rows of `TYPES`, their trees in `UPGRADES` (and the Skeleton's), and the rules only they used: `brace`, `shelter`, `reload` (a unit's `empty`), `leap`, `execute`, the kinds `none`, `bolt` (`chill`, a unit's `frozen`) and `chain` (`jumps`), the aura's `aMove` and `aQuick`, a summons' `life`, a strike's `scale`. `ai.js`: how the computer weighed them. `main.js`: their effects, tags and words. `characters.js`: which clips each played. `campaign.js`: the Pikeman at Greywether Pass and the Skeletons at Hollowmere.
- `tools/chess-bake.page.js`: the bake with their rows in `SPEC` and `CRE`, their gear and the stone paint.
- `data/units/`: their nine baked models (were `data/chess/units/`). `data/full/Yeti.gltf`: the Golem's original (was `data/full/chess/creatures/`).
- `tests/chess.cjs`: the check as it stood, with each one's rule.

To bring one back: its row into `TYPES` and its tree into `UPGRADES`, the rule it needs back in `game.js` and `ai.js`, its effect in `main.js`, its line in `characters.js` `SPEC`, its model into `data/chess/units/`, its check into `tests/chess.cjs`.
