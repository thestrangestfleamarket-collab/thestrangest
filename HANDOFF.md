# Handoff (17 Oct 2026, later: the paused work finished)

Read `CLAUDE.md` first: it holds every decision the owner has made. This note says what is live and what is still open.

## Live now (branch `claude/admiring-davinci-6bjs2l`, its build at https://claude.ai/artifact/1QpVqQujaY6D6V1F19ZmKy; the shared link PnmQqhkusfewby35tf4zo5 was being published by other sessions' branches at the time: skyline, sky dome, power grid, the city's spine)
- Everything that was paused in the first handoff is finished and merged here (the entry "The paused work finished" in CLAUDE.md): the avatar
  editor (Shift+K), the perf fixes measured and fix 5 remade (`docs/perf-audit.md`), the tree look (3, the default), the map editor's next round
  (live carries, PLACE / SAVE, RAISE / LOWER and GROW / SHRINK for the Diner and the Bar), the angular Fox, NPC lives (`src/lives.js`), the
  apartment house lit, the cigarette rack above the Fox.
- The old artifact link (X2Bk8UjQKP8yfLdLtVVn3s) belongs to the first account and can't be opened from this one; the link above is this account's.

## Known open items
- The droids (27K triangles) and the store's biggest chunk (24K) are still drawn on the street with nothing in view: their bounds touch the view's edge.
- Hitbox-walled pockets (a corner of the Diner between its chairs, behind the bar counter, a strip at the castle's drums): left as they are, closed by things' true boxes.
- RAISE / LOWER and GROW / SHRINK apply only to the Diner and the Bar; the bodega, the apartment house and Ghost Street would need their builders
  rewritten to take a height and a size.
- The live website (`bralynnb/tsfm`, `market/market.html`) is on 8.0.1. Update it only when he says "go live".
