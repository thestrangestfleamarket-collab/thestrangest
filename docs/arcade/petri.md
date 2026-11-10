# PETRI — the ninth cabinet, in the line of agar.io

Owner, 1 Nov 2026: "lets create an agar.io style clone in arcade", then "build petri". Not an 80s machine: the one new cabinet
wheeled into the room. *Where it stands (1 Nov 2026): built. §11.1 the dish, the cabinet, the check; §11.2 the whole market in one dish:
the simulation lives in `worker/dish.js` (the page gets it by the build's `__CODE__`), the `Dish` Durable Object runs it, every
player on the website is in it, the site check reaches it with two players.*

## 1. The game in a sentence

You are a cell in a dish. Eat the pellets and the cells smaller than you, split and squirt mass to catch or escape, and never let
a bigger one touch you. Everyone in the market who plays is in the same dish at the same time. No bots (owner, 10 Nov 2026): only players.

## 2. The cabinet

- Name **PETRI**. Lore: maker NODE 9, place BERLIN, year 2015, colour `#7aff6a`, tag `EAT. SPLIT. DON'T GET EATEN.`, story
  `ONE DISH FOR THE WHOLE MARKET.` / `THE BIGGEST CELL WEARS THE CROWN.` Skill trained: alch (the other cabinets each train one).
- Where: a ninth cabinet on the back wall beside the holodeck's door, facing the street door (the room has four a side; this one
  stands alone, newer and brighter). `STORE.cabs.walls` gets a third wall `b:['PETRI']`; the room's builder places it like the
  others. If the owner would rather replace a COMING SOON cabinet (KNUCKLE CITY, DRAGON POP, MONSTER ROAD), it takes that slot.
- The same window, coin ($2), title card, high-score table (initials, the best mass reached beside the score) and attract mode.

## 3. Controls

The cabinet's keys, the pad and the headset (the arcade layer's one way): **arrows / stick** steer (8 directions; the cell drifts on
when you let go, and slows as it grows), **SPACE** split, **C** eject mass, **ESC** leave. With a mouse over the screen the cell
follows the pointer, as the original.

## 4. The rules (the original's, with the numbers written down)

- **The dish**: 6000×6000 units, a grid drawn under everything, the edge a wall. 1000 pellets (mass 1 each, in the colours of the
  dish), respawning as they are eaten; 30 viruses (green spiky, mass 100).
- **A cell**: starts at mass 10. Radius = 4 + √mass × 6 (screen units at the cabinet's zoom). Speed = 2.2 × mass^−0.439 × 100 units
  a second (big is slow). Mass decays 0.2 % a second above 100.
- **Eating**: you absorb a cell or pellet when your mass is > 1.25 × its and its centre is inside your radius.
- **Split** (SPACE): every cell of yours above mass 35 splits in two, the half shot out in the steering direction at 3× speed,
  decaying to normal in 1 s; at most 16 cells; the pieces merge back after 30 s + 0.02 × mass seconds.
- **Eject** (C): each cell above 35 throws a blob of mass 13 (you lose 18) the way you steer; blobs are pellets anyone can eat, and
  feed viruses.
- **Viruses**: a cell bigger than 100 that touches one bursts into up to 16 pieces; cells smaller than the virus hide behind it.
  Seven blobs fed into a virus shoot a new virus the way they came.
- **Death**: all your cells eaten → GAME OVER, the score is the biggest total mass you reached, the card shows it and your rank.
- **The crown**: the biggest player wears a crown; the leaderboard (top 10 by mass, right of the screen) updates live.

## 5. Everyone in one dish (the essence, so built as the real thing)

- **One arena per cabinet, for the whole market**, run by the worker: a `Dish` Durable Object (partyserver, like `Block`) that
  owns the simulation at 20 ticks a second while anyone is in it and sleeps when the dish is empty. Each client sends its steering
  (a direction, and split/eject taps) 20 times a second; the server sends each client what is in its view (cells, pellets by id
  with only the changes, the leaderboard) 20 times a second. The client draws between updates by interpolation.
- **Fair by construction**: the server decides every eat, split and death; a client cannot cheat its mass. The login cookie is
  checked as for `Block`.
- **Cost**: a server tick over ≤ 60 cells + 1000 pellets is well under a millisecond; one message a client a tick, about 2 KB when
  busy. The DO costs nothing while asleep. The client: one 2D canvas at 256×224 like the other cabinets, zoomed out as you grow.
- Off the website (the single-file page the checks drive) the dish runs locally with you alone in it, the same code (`DISH.step` shared
  by server and client: one simulation, one path).

## 6. The screen

The 256×224 canvas of every cabinet: the dish scrolls with you, zoom = 1 / (1 + √mass / 20); your cells in your colour with your
initials (the high-score initials) on them, others with theirs; the leaderboard at the right; your mass and the
count of players at the top; a thin minimap bottom left.

## 7. Attract mode

No attract bot (owner, 10 Nov 2026): the cabinet's screen in the room shows the arcade's usual demo, nothing steering a cell for you.

## 8. Scoring and the table

Score = the biggest total mass you reached in the run; the sub line `MASS 1540 · 3 EATEN`. Grade steps for the skill: 200, 1000,
3000. The shared top ten as every cabinet.

## 9. Cost of the code

Its own chunk `x-petri`: client + shared simulation about 18 KB minified; the worker's `Dish` object about 6 KB. Nothing on the
start.

## 10. The check

`tests/arcade-petri.cjs`: enters the arcade, plays PETRI (alone off the website), eats pellets and grows (mass rises), SPACE
splits (cell count 2), the pieces merge back (a cheat shortens the clock), C ejects (a blob appears, mass drops), a big cell a cheat puts in
eats you → GAME OVER with the score. `tests/online.cjs` gains the `Dish` round trip: two clients in one dish see
each other's cells, the server eats the smaller one.

## 11. The build, in two pull requests

1. **The dish**: the shared simulation, the client, the cabinet, the check. Playable alone.
2. **The whole market in it**: the `Dish` Durable Object, the client's wiring to it, the online check.

## 12. Open for the owner

1. A ninth cabinet on the wall facing the door, or replace one of the three COMING SOON?
2. The whole market in one dish (the real thing, §5) — yes?
3. The name PETRI, or another?
4. The mouse steering on screen (the original's way) alongside the keys — keep?
