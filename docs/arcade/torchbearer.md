# TORCHBEARER — design

*HALCYON GAMES · CHICAGO · 1985. In the line of Gauntlet (Atari, 1985) and Gauntlet II. Trains MYCOLOGY.*

A top-down dungeon hack. Pick one of four heroes and go down. Monsters pour out of generators in hordes; your health is a clock
that only food stops. Keys open doors, potions clear the screen, treasure is score, and somewhere on every floor is the way down —
sometimes one floor, sometimes four, sometimes eight. There are a hundred floors and no lives: when the health hits zero, that's the
run. The best run is the deepest floor, then the score.

This is the design the owner reads before any code. Numbers here are the starting tuning; the balance pass at the end moves them.

## 1. Controls

| key | touch | does |
|---|---|---|
| arrows / WASD | ◀ ▲ ▼ ▶ | move, eight ways (two keys = diagonal) |
| SPACE / Z / X / ENTER | ● | fire in the facing direction; **held, it locks your facing**, so you can back away from a horde while shooting into it |
| C / SHIFT | H | use a potion (magic): hits everything on screen |
| ESC | ✕ | leave the cabinet (the run ends) |

Walking into a monster is a melee hit (slower than shots, no ammo). Nothing else: the whole game is move, shoot, magic.

## 2. The screen

256×224, the cabinets' size. A top strip of 16 px, a play window of 256×200 (32×25 tiles of 8 px) and a message line of 8 px.

- **Top strip**: the hero's colour square and name · `HEALTH 1870` (yellow; red under 500; blinking under 200) · `KEYS ×2` ·
  `POTS ×1` · `FLOOR 14` · `SCORE 46210` right-aligned.
- **Play window**: the map scrolls to keep the hero inside a centre box (6 tiles wide, 5 tall); the map is bigger than the window on
  every floor (24×20 at the smallest, 64×48 at the biggest).
- **Message line**: the announcer (§9), one line at a time for 2.5 s, a queue of at most 3.
- **Floor start**: a 2-second `FLOOR 14` in big letters over the darkened map, the hero already placed.

Palette by depth, five themes of twenty floors: 1–19 grey stone · 20–39 mossy green (mushroom caps on the walls: the mycology
floors) · 40–59 flooded blue · 60–79 crypt bone · 80–100 ember red. Only the colours and the wall decoration change; the rules don't.

## 3. The heroes

| | WARRIOR | VALKYRIE | WIZARD | ELF |
|---|---|---|---|---|
| colour | red | blue | yellow | green |
| health at start | 2000 | 2000 | 2000 | 2000 |
| armour (damage taken ×) | 1.0 | 0.8 | 1.2 | 1.0 |
| shot damage (hits) | 3 | 2 | 2 | 1 |
| shot speed (tiles/s) | 10 | 12 | 14 | 18 |
| shots a second | 4 | 4 | 4 | 6 |
| move speed (tiles/s) | 5 | 6 | 5 | 7 |
| melee damage (hits) | 3 | 2 | 1 | 1 |
| potion power (hits to all) | 2 | 3 | 5 | 3 |

"Hits" are the unit of damage; a level-n monster or generator takes n hits (§5). So the Warrior one-shots everything, the Elf needs
three shots for a level-3 grunt but fires and runs faster than anything in the dungeon, the Wizard's potion wipes the screen, the
Valkyrie lasts longest in a crush. Chosen on a CHOOSE YOUR HERO screen after the coin (◀ ▶ then SPACE), with each hero's four bars
shown. Health is capped at 9999.

*Owner's call*: keep the archetype names, or give them the market's own (KNIGHT, SHIELDMAIDEN, ALCHEMIST, RANGER)?

## 4. Health, food and death

- Health drains **1 a second** from the moment the floor starts. A 2000-health hero with no food and no fights lasts 33 minutes;
  with fights, far less. This is the clock that makes every floor a question of how long to stay.
- Food restores: plate **+100**, cider **+100**. Poison cider **−100**: it looks like cider but its bubbles rise green. A shot
  destroys food ("DON'T SHOOT THE FOOD").
- At 0 health the run is over: GAME OVER, the skill trained by the score, the best kept. **CONTINUE?** counts down from 10;
  another $2 puts 700 health into the hero where they stand (the coin, as in the original). The score carries on, but the run is
  marked continued (a `*` beside it on the board); the one-credit run is the honest one. *Owner's call* whether CONTINUE is in.

## 5. The monsters and their generators

Eight kinds. Most come from **generators** (a bone pile, a demon skull, a lobber mound…) in three levels; a level-n generator
makes level-n monsters, and each hit a generator takes knocks it down a level (3 → 2 → 1 → gone). A generator spawns every
2.5 / 2 / 1.5 s (by level) while fewer than 6 of its monsters stand near it; at most 60 monsters live at once on a floor (the cost cap).

| monster | hits to kill (lv 1/2/3) | damage | speed (tiles/s) | behaviour | points (lv 1/2/3) |
|---|---|---|---|---|---|
| GHOST | 1 / 1 / 1 | 50 / 100 / 150 on touch, then it's gone | 4 / 5 / 6 | straight at you in swarms; the one that dies by hitting you | 10 / 20 / 30 |
| GRUNT | 1 / 2 / 3 | club: 10 / 20 / 30 every half second while next to you | 3 / 3.5 / 4 | walks at you, stops adjacent, swings; the crush is made of grunts | 20 / 40 / 60 |
| DEMON | 1 / 2 / 3 | fireball 20 / 40 / 60; bite 20 | 3 | fires when roughly in line within 8 tiles, then closes | 30 / 60 / 90 |
| LOBBER | 1 / 2 / 3 | lobbed rock 20 / 40 / 60 (goes over walls) | 3 | keeps 4–6 tiles off and throws; backs away when you close | 30 / 60 / 90 |
| SORCERER | 1 / 2 / 3 | 30 / 60 / 90 on touch | 4 | blinks: 1 s solid, 1 s gone (can't be hit while gone) | 40 / 80 / 120 |
| THIEF | 1 | none | 7 | runs at you, takes one thing (key, then potion, then amulet), runs for the edge and vanishes; shoot him on the way and it drops | 100 |
| DEATH | immune to shots | drains 10 a tick on contact until he has taken 200, then dies | 2.5 | no generator; placed, from floor 6; only magic kills him (1000 pts) | 1000 |
| ACID PUDDLE | immune to shots | 40 a second on contact | 1 | no generator; drifts; from floor 15; only magic kills it | 200 |

Movement is on the grid with smooth sub-tile motion. Each monster steps toward the hero by the eight-way direction that shortens
the distance most, sliding along a wall when blocked, and monsters never overlap (so hordes pack into the classic wall). Monsters
further than 20 tiles from the hero stand still (they still get drawn if on screen; they don't spawn or think). No pathfinding: the
levels are made so that greedy works, and corners that trap monsters are a tactic.

Shots (yours and theirs) stop at walls; yours break breakable walls (§6). A shot that hits food destroys it, a shot that hits a
potion on the floor sets it off at power 1 (a waste).

## 6. The tiles

| tile | | rule |
|---|---|---|
| floor | `.` | |
| wall | `#` | solid, forever |
| breakable wall | `%` | three hits of any shot; cracks at one and two |
| door | `D` | solid until a key is used on it; one key opens the whole connected run of door tiles; doors stay open |
| exit | `1` `4` `8` | stairs down 1, 4 or 8 floors; the number is painted on it; `1` is on every floor, `4` and `8` on some, further off and guarded |
| treasure-room exit | `*` | into the floor's treasure room (§8), then down one |
| teleporter | `T` (pairs `a`…`d`) | step on, come out of its twin; from floor 12 |
| trap | `^` | step on it and every trap wall (`-`) on the floor vanishes — a shortcut, or a horde let loose |
| trap wall | `-` | solid until a trap is stepped on |
| stun tile | `S` | freezes you for 2 s; from floor 45 |
| invisible wall | `I` | solid, drawn as floor; shows when you walk into it or when a potion flashes; from floor 35 |
| generator | `g` `u` `n` `l` `z` | ghost / grunt / demon / lobber / sorcerer generator at the floor's level (each floor's header gives it); a capital is one level higher |
| placed monster | `H` thief, `X` death, `A` acid | where a loose monster starts |
| key `k` · potion `p` · plate `f` · cider `c` · poison `x` · chest `$` (100) · bag `b` (50) · amulet `m` · hero start `h` | | |

Keys and potions are carried: up to 9 of each.

## 7. Items of power

**Amulets** (`m`; from floor 4; 20 s each, shown as a small icon under the health with its clock): EXTRA SHOT POWER (+1 hit) ·
EXTRA ARMOUR (×0.5) · EXTRA SPEED (+2) · INVISIBILITY (monsters wander) · REPULSIVENESS (monsters flee) · INVULNERABILITY (10 s,
nothing hurts). One kind per amulet, drawn when the floor is made.

**Permanent gifts**: in the treasure rooms of floors 23, 42, 73 and 90 sit one each of SHOT POWER +1, ARMOUR −0.1, SPEED +1, SHOT
SPEED +4 — for the whole run.

## 8. The floors

A hundred, then more.

- **Floors 1–30 are laid by hand** (text maps inside the game's own file and chunk, about 3 KB, so they cost the start nothing and
  reach the page only with the game): floor 1 is the lesson (one grunt generator,
  food in plain view, a key and a door, the exit visible), the first ten teach one thing each (ghost swarms, the demon's line,
  the lobber over a wall, the thief, the door choice, Death on 6, the 4-exit's bargain on 8, the first treasure room on 7, the trap
  on 20…), and 11–30 are the real game with the themes turning at 20.
- **Floors 31–100 are generated** by rules from the same tile vocabulary, with the floor number as the seed, so floor 57 is the same
  floor for every player and the board is fair. Rooms and corridors on a grid up to 64×48; generators 2 + floor/8 of them, their
  levels weighted toward 3 as the floor rises; keys at least as many as door runs; food max(2, 6 − floor/15) pieces; exits placed
  far from the start (`4` from floor 10 on a third of floors, `8` from floor 20 on a fifth); one teleporter pair from 12; traps from
  20; invisible walls from 35; stun tiles from 45; Death 1 + floor/25 of them from 6; acid from 15.
- **Treasure rooms** (`*` exits) on floors 7, 15, 23, 31, 42, 56, 73, 90: thirty seconds of treasure and no monsters (gold piled in
  the pattern of that room), then the stairs; when the clock runs out you go down anyway. Taking one is worth more than the floor it
  skips.
- **After 100**: the hardest rules, forever, for the score chasers; the card shows the deepest floor reached.

Monster speed climbs 5% every 10 floors (to +50% at 100). Hero speed never changes. Difficulty, in short: more generators, higher
levels, less food, more of the things only magic kills, more of the floor that lies to you.

## 9. The announcer

The message line, in the original's manner:

| when | says |
|---|---|
| floor 1 starts | `WELCOME, WARRIOR.` then `REMEMBER: DON'T SHOOT THE FOOD.` |
| health < 500, every 20 s | `WARRIOR NEEDS FOOD.` |
| health < 200, every 10 s | `WARRIOR NEEDS FOOD — BADLY.` |
| health < 100 | `WARRIOR IS ABOUT TO DIE.` |
| your shot destroys food | `WARRIOR SHOT THE FOOD.` |
| your shot sets off a potion | `DON'T SHOOT THE POTION.` |
| Death first seen on a floor | `USE MAGIC TO KILL DEATH.` |
| the thief took something | `THE THIEF HAS YOUR KEY.` / `POTION.` / `AMULET.` |
| you kill the thief in time | `YOUR KEY IS BACK.` |
| a treasure room | `TREASURE ROOM! 30 SECONDS.` |
| you take an exit | `DOWN TO FLOOR 15.` / `DOWN FOUR FLOORS!` / `DOWN EIGHT FLOORS!` |
| an amulet | `EXTRA ARMOUR.` (its name) |
| the 100th floor | `THE LAST FLOOR. OR IS IT.` |

Text only; the lib's beeps for sound (shot, hit, pickup, door, exit fanfare, generator breaking, a low heartbeat under 500 health).
*Owner's call* whether to add a spoken voice later (the browser's speech synthesis, no download).

## 10. Scoring

Kills and generators as in §5 (a generator is worth 100 × its level each time it is knocked down a level); chest 100, bag 50; an
exit is worth floor × 50 / 150 / 300 for a 1 / 4 / 8; a treasure room pays its gold; Death 1000 by potion. Health is not score.
The run's record is the score, with the deepest floor beside it.

**High scores**: this is the first cabinet for the shared table of the arcade layer (a top 10 with three initials, on the server,
shown in attract mode on the cabinet in the room) — built with it if the owner agrees; until then the per-player best like the other
cabinets. A continued run shows with `*`.

## 11. The hero's shot and the feel

- Shots are 8-way, fired from the hero's centre, 4 a second (Elf 6), travelling until a wall; at most 12 of yours in flight.
- Held FIRE locks your facing: back away down a corridor firing into the horde following you — the move the game is built around.
- Melee: walking into a monster strikes it every half second for your melee damage; you take its touch damage meanwhile.
- A potion goes off instantly, a white flash: every monster on screen takes your potion power in hits; generators too; invisible
  walls show for 3 s.
- The hero is 8×8 px, two frames of walk in each of four facings (diagonals use the nearest), a flash when hurt.

## 12. Attract mode

The lib's random-input demo would just die in a corner, so TORCHBEARER gives the kit `attract(K,g)`: a tiny bot that walks toward
the nearest food or exit, faces the nearest monster and fires. It plays until it dies or 30 s pass, then the card. In the room the
cabinet shows the card until the game's chunk is first fetched (a play), then the demo.

## 13. Cost

- Its own chunk `x-torch`: engine, drawing, the generator and the announcer, about 45 KB minified / 15 KB gzipped; the thirty
  hand-laid floors about 3 KB. Fetched on the first play of this cabinet only; nothing added to the start or to the arcade chunk
  beyond the card's lore (already there).
- Running: one 2D canvas of 256×224 repainted each frame; at most 60 monsters, 12 + 20 shots; monsters more than 20 tiles away
  asleep. Under a millisecond a frame on a laptop; nothing on the 3D side changes while the window is up.

## 14. The check

`tests/arcade-torch.cjs` drives `dist/market.html`: enters THE ARCADE, plays TORCHBEARER with real key presses (coin, WARRIOR,
start); asserts floor 1 is up with 2000 health; finds its own way on the game's map (`TORCHDBG().map`: to a key avoiding doors, then
through a door to the stairs), walks it with the arrow keys and asserts floor 2; asserts health fell by the seconds elapsed; asserts a
shot killed a level-1 grunt and the Warrior's shot took a level-3 generator out; sets health to 1 through the debug hook and asserts
GAME OVER; ESC leaves. From the third pull request on it also asserts the generated floor 57's tiles hash to the committed constant
(so the board stays fair across builds). `tests/places.cjs` has TORCHBEARER as a cabinet whose chunk must be fetched on play.

## 15. The build, in three pull requests

1. **The engine, playable end to end**: tiles and scrolling, CHOOSE YOUR HERO with the four, move / shoot / melee, grunts and
   ghosts and their generators, keys and doors, food and poison, treasure, the three exits, the HUD, the announcer, floors 1–5, the
   check. You play it and we tune the feel before anything else is added.
2. **The rest of the dungeon**: all eight monsters and Death, potions, amulets, the permanent gifts, breakable walls, teleporters,
   traps, invisible walls, stun tiles, treasure rooms, floors 6–30, the five themes, CONTINUE if approved.
3. **The deep**: the generator for 31–100 and beyond, the attract bot, the balance pass with the owner playing, and the shared
   high-score table for all eight cabinets.

## 16. Open for the owner

1. Hero names: the archetypes, or the market's own?
2. CONTINUE for $2 (700 health, run marked `*`): in or out?
3. The shared high-score table (server-side, initials, attract mode) — build it with this game?
4. A spoken announcer later, yes or no?
5. Anything in the numbers above you want different before the engine is built.
