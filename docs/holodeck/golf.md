# THE GREENS — mini golf in the holodeck, in the line of Walkabout Mini Golf

Owner, 2 Nov 2026: "i want to add a VR golfing game into TSFM. in the holodeck". The research behind this is in
`docs/research/walkabout-mini-golf.md` and `walkabout-mini-golf-controls.md`. *Where it stands: designed, not built. The owner reads
this first; §12 is his to answer.*

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

## 5. The course (the essence; one course now, the shape for more)

- **THE GREENS**: a garden of nine mini golf holes floating in the holodeck's sky at dusk, the market's own kit for the scenery
  (the park's lamps, benches, brick and railings, the fountain) so it is cheap and looks like ours; cel look, nothing photoreal.
  Walkabout's lesson is place first: the course is a walk with a view at every tee, the ninth hole the highlight (a ramp that
  drops the ball through a ring into the cup).
- A hole is data, not code: `{tee, cup, par, planes:[...], walls:[...], ramps:[...]}` in the file, so a second course or a hard
  night version is another list. Surfaces: green felt (rolls true), rubber bumpers (bounce), brick ramps (slope), water (OB), a
  tunnel (two cups joined), a windmill with a turning sail (the one moving thing).
- Holes 1 to 9: a straight par 2; a dog-leg; a bank shot off a bumper; a tunnel; a slope with the cup on top; a two-level
  drop; a loop round a fountain; the windmill; the ring drop. Each teaches one surface.
- **Hard mode** (night, the holes reversed, more bumpers) and **a second course** are later lists on the same code.

## 6. Skill, money and the market

- A new skill **GOLF** (`golf`), schema-wide: a row in `FORAGE.SK`, in YOUR SKILLS, in the item model's grants, on the holodeck's
  list. Every hole at or under par pays a point (to 60, the holodeck's cap; the holodeck's programs "pay out by how well you do").
- What GOLF does for you (one of these, the owner's call, §12): the mouse aim line grows longer with skill (a stand-in for a
  steadier hand), or nothing (pure player skill, as Walkabout) and the skill is only a score.
- The program costs $10 a round, $4 for practice. A round under par pays back $10, a hole-in-one $5 (the holodeck's prize).
- The putter is sold by the market too (the toy stall, $20) so you can own your own; the holodeck lends one.

## 7. Multiplayer (the second pull request)

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

1. **The greens**: putter item and WIELD kind, the VR hand hook for held tools, ball physics, nine holes, rules, scorecard,
   skill, the check. Playable alone, headset and screen.
2. **Together**: the room, others' balls, the shared scorecard, voice.
3. **More**: hard mode at night, a lost ball hidden on each hole (a collectible ball skin), a second course.

## 11. What is deliberately not built

A power bar in the headset, ball spin from the stroke, penalty strokes, a global leaderboard, ball collisions: Walkabout left
every one of these out on purpose and its players agree.

## 12. Open for the owner

1. The name: THE GREENS, or another?
2. Nine holes first (then nine more), or eighteen from the start?
3. The theme: a dusk garden in the sky from the market's own kit (cheap, ours), or something stranger?
4. GOLF the skill: steadies the screen aim line, or a score only (pure skill, Walkabout's way)?
5. The screen swing: hold-and-release power bar (recommended), or a real mouse swing like the sword (hard to control)?
6. Multiplayer in the second pull request, yes?
