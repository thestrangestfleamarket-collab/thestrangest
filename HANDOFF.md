# Handoff (17 Oct 2026, paused mid-merge: "pass off all work to another chat")

Read `CLAUDE.md` first: it holds every decision the owner has made. This note says exactly where things stand.

## This branch: `claude/admiring-davinci-6bjs2l` (pushed, nothing left uncommitted)
It holds **everything**, merged (the owner: "i dont want to lose any work from any branches or chats"):
- The paused work of the first handoff, all finished: the avatar editor (Shift+K), the perf fixes measured and fix 5 remade (`docs/perf-audit.md`),
  the tree look (3, the default), the map editor's next round (live carries, PLACE / SAVE, RAISE / LOWER and GROW / SHRINK for the Diner and the Bar),
  the angular Fox, NPC lives (`src/lives.js`), the apartment house lit, the cigarette rack above the Fox.
- The other sessions' branches, merged in on top (conflicts were only in CLAUDE.md, where both sides' entries were kept, and in build.py's include
  lines, where every file was kept): `claude/awesome-noether-mba5hh` (the far: haze and skyline, `src/skyline.js`), `claude/relaxed-gauss-xerecq`
  (the sky dome and sunset, `src/sky.js`), `claude/magical-bohr-xxd7qs` (the power grid, `src/grid.js`, off until `?grid=1`),
  `claude/quirky-mendel-rvrxwx` (the city's spine: `city.js`, `residents.js`, `vehicles.js`, `civic.js`, `duties.js`; included in build.py after
  clip.js and before lives.js and perf.js).
- Two fixes made after the merge, built and syntax-checked, **not yet screenshot-tested**: NPC lives leaves the apartment house's four residents
  and anyone on a city errand to the city's spine (`resident` in lives.js, so no one has two lives); the world's facing-shade shader patch
  (map-pre.js) now compiles on flat-shaded Lambert materials (the boats and the floats had no `vNormal`: their programs failed, "VALIDATE_STATUS
  false" in the console, pre-existing on main).

## What was checked on the merged build
- The page builds, the module passes `node --check`, the street loads (`tests/mapshot.cjs`), `tests/livescheck.cjs` PASS, `tests/mapedit4.cjs`
  and `tests/avshot.cjs` passed before the other branches came in.
- **Not yet run to the end** on the merged build: the other branches' own tests (`tests/civiccheck.cjs`, `farshot.cjs`, `skyshot.cjs`,
  `gridshot.cjs`) and a look at the boats after the shader fix (`tests/poolshot.cjs`). Run those first.

## The artifact
- This branch's build (before the other branches were merged): https://claude.ai/artifact/1QpVqQujaY6D6V1F19ZmKy.
- The shared link https://claude.ai/artifact/PnmQqhkusfewby35tf4zo5 was being published by the other sessions; publish the merged build there once
  the tests above pass (the Artifact tool wants that link read first, then a publish with `url`).
- The old link X2Bk8UjQKP8yfLdLtVVn3s belongs to the first account and can't be opened from this one.

## Known open items
- The droids (27K triangles) and the store's biggest chunk (24K) are still drawn on the street with nothing in view (their bounds touch the view's edge).
- Hitbox-walled pockets (a corner of the Diner, behind the bar counter, a strip at the castle's drums): left as they are, closed by things' true boxes.
- RAISE / LOWER and GROW / SHRINK apply only to the Diner and the Bar; the bodega, the apartment house and Ghost Street would need their builders rewritten.
- `tests/clipcheck.cjs` reports 8 "THING WITHOUT A SOLID" on the Moon Shrine (opened on purpose) and its droid/mushroom pair check looks up key `droid` (the keys are droid1-4): pre-existing.
- The live website (`bralynnb/tsfm`, `market/market.html`) is on 8.0.1. Update it only when he says "go live".
