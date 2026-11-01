# The arcade's games

Eight cabinets in THE ARCADE (off the map, `src/059b-arcade.js`), four along each side wall. Each is a full arcade game in the
line of a real 80s–90s machine, built out the way the originals were (owner, 30 Oct 2026: "very similar to 80-90s arcade games.
more in depth though … fully fledged out games that are intricate and detailed and you could play for hours. dont rush it").

| wall | cabinet | in the line of | trains | file | state |
|---|---|---|---|---|---|
| east | RAINBOW RUN | Tetris | bird | `059j-game-blocks.js` | playing; to be brought up to the full original |
| east | GALAXY RAID | Galaga | sword | `059k-game-raid.js` | playing; to be brought up to the full original |
| east | MAZE | Pac-Man | prosp | `059l-game-maze.js` | playing; to be brought up to the full original |
| east | DRAGON POP | Bubble Bobble | forage | — | coming soon |
| west | ROAD 85 | OutRun | fish | `059m-game-road.js` | playing; to be brought up to the full original |
| west | KNUCKLE CITY | Final Fight | ento | — | coming soon |
| west | TORCHBEARER | Gauntlet | myco | `059n-game-torch.js` | designed: [torchbearer.md](torchbearer.md); built: all eight monsters, amulets, traps, teleporters, treasure rooms, floors 1–30 by hand and the generator beyond, the attract bot; the shared high-score table next |
| west | MONSTER ROAD | Wonder Boy in Monster Land | alch | — | coming soon |

Order of build: TORCHBEARER, then KNUCKLE CITY, DRAGON POP, MONSTER ROAD, then the four kept games up to their originals' full
feature sets. One game per pull request; each starts with its design doc here, which the owner reads before any code.

## How a game plugs in (one path)

`src/059g-arcade-games.js` is the shared cabinet layer. A game is one file after it that registers itself:

```js
STORE.cabs.add({name:'RAINBOW RUN', skill:'bird', hold:1, lore:{maker,place,year,col,tag,story:[l1,l2]},
  game:L=>{ '@blocks'; const {W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick}=L; /* the game */ return {help,grade,make}; }});
```

- `game` is its own chunk (`'@name'`, lowercase letters): on the website it is `x-name.<hash>.js`, fetched the first time that
  cabinet is played (`open` calls `LOAD` behind the title card and shows LOADING until it lands). Entering the arcade fetches none of
  the games. `tests/places.cjs` proves it for one cabinet (its chunk requested on play, never a slow fetch).
- `L` is the kit's small library (the 256×224 canvas size, text, bitmaps, beeps, grid movement helpers).
- The game returns `{help, grade, make}`: `help` the two lines under the title card, `grade` three scores that count as one, two or
  three steps of skill training, `make()` a fresh game with `step(dt,K,T)` (held keys `K`, taps `T`: L R U D F H) and `draw(c)`,
  `score`, `over`. Optional: `attract(K,g)` steers the attract-mode demo, `insert` where the blinking INSERT $2 sits, `hold:1` on the
  registration adds the H button to the touch pad.
- A cabinet whose game is not built yet registers lore only (in 059g): its card says COMING SOON and takes no money.

The layer gives every cabinet: the window over the page (ESC leaves), the $2 coin, the title card with the maker's story, the best
score per player (`OWNED`, `arcade-best`), skill training by score, the game-over card, the shared high-score table, and the attract
mode on the cabinet's screen in the room (the card, the top ten, and once a game's chunk is here, the game playing itself).

**The high-score table** (owner, 31 Oct 2026: "yes build the shared high score table"): a top ten a cabinet, shared by everyone,
kept by the worker (`POST /scores` on the `Post` Durable Object; the hundred best runs a cabinet kept, the ten best shown). A run
that makes the top ten asks for three initials on the game-over card (▲▼ letter, ◀▶ slot, SPACE enters; your last initials are
remembered); the run goes up with the game's own sub line (`g.sub`, e.g. `FLOOR 14`) and the card shows its rank. The title card's
HI-SCORE is the table's best. Off the website (the single-file page the checks drive) your own runs stand in for the table.
`tests/arcade-scores.cjs` proves the flow; `tests/site.cjs` the worker's round trip.

Planned for the layer (each a decision for the owner when its first game needs it): CONTINUE? with a 10-second count for another
$2; operator settings (difficulty, lives) per cabinet from the TENANTS tab.
