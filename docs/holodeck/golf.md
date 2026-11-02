# THE GREENS — mini golf in the holodeck, in the line of Walkabout Mini Golf

Owner, 2 Nov 2026: "i want to add a VR golfing game into TSFM. in the holodeck"; then "only 1 hole to start. single player. do a zen
garden. look up scerenshots. very realistic, relaxing, waterfall, calm". The research behind this is in `docs/research/walkabout-mini-golf.md`
and `walkabout-mini-golf-controls.md`. *Where it stands (2 Nov 2026): built as the owner answered: one hole, single player, a zen garden at
dusk (`src/146bc-greens.js`, its own chunk `greens`, the check `tests/greens.cjs`). §5 describes what was built; §7 and §10's later pull
requests wait on him.*

## 1. The game in a sentence

A holodeck adventure: pick THE GREENS on the panel and it fades you to a mini golf course far off the map; one putter, one ball,
nine holes of stroke play against par, and in the headset the putter is your controller and the ball goes where you really swing.

## 2. Where it plugs in (one path, nothing new)

- A program in `STORE.holo.programs` like THE CATACOMB RUN (`146bb-catacomb.js`): `{name:'THE GREENS', skill:'golf', cost:10,
  offWorld:true, tool:'putter', go, run, hide}`. RUN fades you to its own off-world map `ROOMS.off.greens`, END PROGRAM or the 9th
  hole fades you back into the holodeck. Its own file `146bc-greens.js`, its own chunk `'@greens'` (`LOAD` behind the fade).
- The putter is an item in `data/items.json` (`putter`: slot hand, grants golf, value 20) and a held tool registered through
  `WIELD.kind('putter', {...})` exactly as the fishing rod is: the passport hand holds it, the pack's HOLD row wields it. `tool:` on
  the program hands you one if you have none (the holodeck's loan, as the panel already does).
- The course is one place built with `ROOMS.part` and dropped on exit; every mesh in one group; the room cull keeps its sky.
- The ball is one new small system (`GOLF.ball`, in the same file): a sphere rolling on the hole's surfaces. No library, no
  physics engine: the market has none and a rolling ball on planes, ramps and walls is forty lines.

## 3. Controls

The market has three ways to hold a tool and the putter uses all three, one swing model underneath (the ball takes the putter
head's speed and direction at contact; no power bar in the headset, as Walkabout).

| | aim | swing | warp to ball | undo (practice) |
|---|---|---|---|---|
| **Headset** | stand and address the ball; the putter is the controller (Walkabout's one-controller model) | a real swing; **grip** held makes the head solid (Grip To Putt, on by default); let go to practice through the ball | **trigger** | stick back |
| **Mouse** | move the mouse to turn the aim line round the ball | hold **left button** to draw the backswing (a bar fills), release to putt; the bar's fill is the swing speed (Walkabout's own answer for a screen, its Pocket Edition) | **right click** or **F** | **Z** |
| **Gamepad** | left stick turns the aim | hold **A** and release | **RT** | **B** |

- Teleport, walk and fly as anywhere else (the adventure changes none of the moves). A **Lock Ball** option is not needed: the ball is
  where it is and the trigger puts you behind it, facing the hole.
- The headset's part that is new: today the Walker's hands do not follow the controllers (only the controllers and tracked hands
  are drawn). The putter needs the held tool to follow the controller's pose and velocity. That becomes a rule for every held tool,
  not the putter alone: in the headset `WIELD` takes the hand from `VR` (a `VR.hand(side)` with position, quaternion and velocity),
  so the sword, the net and the rod come along for free. The ball reads the head's speed from the same vector.
- Scaled for the Walker: the hole is 1/4 tile across, the ball 1/40, the putter head sits at the ball when the controller is at hip
  height (the shaft lengthens or shortens to your hand, Walkabout's trick, so no height slider).

## 4. The rules (Walkabout's, written down)

- **Stroke play**, nine holes, par on each (2 to 4; course par 27). The hole ends when the ball drops in the cup.
- **Stroke limit** on: at par + 3 the hole is over and par + 4 is written; no limit in practice.
- **Out of bounds** (off the green, in water): the ball comes back to its last lie, no penalty stroke. Holding grip as it goes
  out keeps it alive (Walkabout's "keep ball alive").
- **A rest**: the ball is still under a small speed for half a second; then the next stroke may be taken. The ball never moves on
  its own at rest (the market's rule: things at rest stay still).
- **No ball collisions between players**, ever (Walkabout's stated rule; in multiplayer your ball passes through theirs).
- **Hole-in-one** says so (the game's line and a sound). The wristwatch is the market's HUD: hole, strokes, par, course total,
  bottom left with the log.
- **Scorecard**: the pause menu's window in the menu look: nine columns, par and your strokes, the total against par, your best
  on each hole (kept server-side in OWNED like every owned thing).

## 5. The course: one hole in a zen garden (built)

- **THE ZEN GARDEN**: a Japanese garden deep in a jungle valley, built for calm and as real as the engine allows (the owner:
  "very realistic, relaxing"; then "completely enclosed by greenery jungle ... in a deep cavern between massive hills, overcast,
  very moody lighting, foggy, eerie"): raked white gravel with the rake circling the stones, moss round their feet, a koi pond
  under a waterfall with its mist, five koi, two stone lanterns lit warm (the only warm light), two red maples, two bamboo groves,
  an arched wooden bridge over the pond's outflow, stepping stones beside the lane, a shishi-odoshi that fills, tips and knocks,
  blossom drifting on the air. Round it all, massive green hills close in on every side with jungle canopies up their slopes,
  ferns at the gravel's edge, mist lying on the ground, an overcast sky and fog that swallows the hilltops. Standard (lit, rough)
  materials with procedural textures, soft grey light with shadows: the holodeck's "more realistic simulations" (owner, 22 Oct
  2026), not the street's cel.
- **The hole**: par 2. A smooth felt lane 0.9 m wide on a curve: straight from the tee, a dog-leg right round a mossy boulder, a
  soft rise onto the green with the cup and flag. The lane's edge is a wooden rail the ball banks off; the rail is exactly where the
  physics stops the ball (the lane is the points within half its width of the centreline). A fast ball runs over the cup's lip; a slow
  one drops.
- A hole is data: the centreline points, the width, the rise. The next hole, a hard night version, or nine more are more lists on the
  same code. Only the one hole is built (owner: "only 1 hole to start").
- After the ball drops (or the stroke limit) the score is written and the ball goes back on the tee for another go; END PROGRAM
  leaves. Your best on the hole is kept with your things (server-side).

## 6. Skill, money and the market

- A new skill **GOLF** (`golf`), schema-wide: a row in `FORAGE.SK`, in YOUR SKILLS, in the item model's grants, on the holodeck's
  list. Every hole at or under par pays a point (to 60, the holodeck's cap; the holodeck's programs "pay out by how well you do").
- What GOLF does for you (one of these, the owner's call, §12): the mouse aim line grows longer with skill (a stand-in for a
  steadier hand), or nothing (pure player skill, as Walkabout) and the skill is only a score.
- The program costs $6 (one hole). Par or better pays GOLF; under par pays GOLF twice and $5 (the holodeck's prize).
- The putter is sold by the market too (the toy stall, $20) so you can own your own; the holodeck lends one.

## 7. Multiplayer (a later pull request; the owner said single player first)

Walkabout is a hangout first (55 % of its sessions are multiplayer). THE GREENS opens a room: players already in the holodeck
section see THE GREENS on the panel with "JOIN" while one is running; up to 8 on one course, everyone at their own pace with their
own ball (no collisions), the others' balls and bodies through `ONLINE` as on the street, voice as on the street, Honors order not
enforced (Walkabout: your ball waits at the next tee). Scorecard shows every player. State per player is their own; the room's
only shared state is who is in. Phase 1 is solo.

## 8. Cost

- Code: `x-greens` chunk about 22 KB minified (course data 4 KB, ball and swing 5 KB, scorecard 3 KB, the rest scenery); the
  putter's WIELD kind and the VR hand hook about 2 KB on the start (the rod's size). Nothing else on the start.
- Scene: nine holes about 18,000 triangles with the kit's props, one sky dome, two lights; well under the catrun's jungle. Drawn
  only while you are in the adventure (off the map, dropped on exit).
- Run: the ball is one body; a frame is a few dozen plane and segment tests. Nothing per other player beyond what ONLINE already
  sends.

## 9. The check

`tests/greens.cjs` on `dist/market.html`: enter the arcade, open the panel, RUN THE GREENS ($10 taken, fades off-world, the
street not drawn); the ball is at tee 1; a scripted putt rolls it and it comes to rest; a putt into water returns it to its lie
with a stroke counted; a straight putt on hole 1 drops in the cup (hole 2 begins, the card shows 1); the stroke limit ends a hole;
END PROGRAM fades back into the holodeck; `tests/places.cjs` learns the chunk. `tests/vr.cjs` gains one line: the held putter
follows the emulated controller.

## 10. Build, in pull requests

1. **The zen garden** (built, 2 Nov 2026): putter item and WIELD kind, the VR hand hook for held tools, ball physics, the one hole,
   rules, card, the GOLF skill, `tests/greens.cjs`. Playable alone, headset and screen.
2. **Together**: the room, others' balls, the shared scorecard, voice.
3. **More**: more holes, hard mode at night, a lost ball hidden on each hole (a collectible ball skin).

## 11. What is deliberately not built

A power bar in the headset, ball spin from the stroke, penalty strokes, a global leaderboard, ball collisions: Walkabout left
every one of these out on purpose and its players agree.

## 12. Open for the owner

Answered 2 Nov 2026: one hole, single player, a zen garden, realistic and calm. Still his:
1. The name: THE GREENS, or another?
2. GOLF the skill: steadies the screen aim line, or a score only (pure skill, Walkabout's way)? Built as a score only for now; the
   aim line is a fixed 2.4 m.
3. The screen swing: hold-and-release power bar (built), or a real mouse swing like the sword?
4. Grip To Putt in the headset: built as "the head only counts when it moves" (a slow nudge never putts); the grip-held version
   needs the controller's grip button read as a key, which the headset's gamepad layer does not pass through yet.
5. Multiplayer next, or more holes?
