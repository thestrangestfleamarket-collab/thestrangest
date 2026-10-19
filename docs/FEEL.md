# FEEL LAB: the movement controller prototype

A character controller in the spirit of Summer Afternoon's feel, built into THE MARKET (not a separate app: the game
already had a renderer, an input loop, cameras, three-mesh-bvh and a rigged, clip-animated player, so it plugs into those).
Owner's ask, 19 Oct 2026: "create an avatar using this method for me to test in game".

## How to try it

- On the published game: open the menu's MAP, **MORE PLACES → FEEL LAB** (the test yard), or press **L** anywhere for the panel.
- Locally: `npm install` once, `python3 build.py`, open `dist/market.html?feel=1` (`&view=follow` for the behind camera).
  `?feel=1` turns the new controller on for the street too and opens the panel; `?feel=0` forces it off; `&feelpanel=0` hides the panel.
- In the yard the new controller is always on. On the street it's on when the panel's NEW CONTROLLER ON THE STREET is pressed (kept in the save).

| Key | |
| --- | --- |
| W A S D / arrows | move, relative to the camera |
| Shift | run |
| Space | jump (tap = short hop, hold = full height) |
| Right drag, Q / E, wheel | turn, zoom (the game's own camera) |
| V | isometric → behind → first person |
| L | the FEEL LAB panel |
| O | debug overlay: state, speeds, timers, clip weights, capsule, contact normals, collider wireframe, camera rays |
| T | in the yard: back to its spawn (R was already the game's "turn the view") |

## Files

| File | Job |
| --- | --- |
| `src/087b-feel.js` | settings and presets, input intent, fixed-step simulation, capsule collision (three-mesh-bvh), jump rules, camera follow and obstruction |
| `src/087c-feel-anim.js` | the animation layer: clip states, crossfades, speed-matched locomotion, lean and landing compression, footstep sounds |
| `src/087d-feel-yard.js` | the test yard and its collision mesh |
| `src/087e-feel-panel.js` | the tuning panel and the debug display |
| `src/075-main-13.js`, `src/094-ui.js`, `src/087a-avatars.js` | the hooks: the game loop hands movement to FEEL when it's on; the behind camera asks FEEL for its target and wall check; the avatar hands its mixer to FEEL |
| `tests/feelcheck.cjs` | the acceptance run (below) |
| `docs/feel-default.json` | the default settings, exported |

## Architecture

Input → intent → physics → state → animation, one way:

1. **Input** (the game's): `075-main-13.js` already turns WASD/arrows/pad into a camera-relative ground direction `(mx, mz)` from the
   camera's yaw (so steep tilts can't break it: only yaw is used). Space presses are counted as edges (`FEEL.press()`), held state read
   separately, so holding Space never re-jumps. Blur and tab-hide clear held keys and pending presses.
2. **Movement** (`FEEL.step` → `sim`): runs at a fixed 1/60 s with an accumulator capped at 6 steps (a long-hidden tab doesn't
   replay seconds). It keeps its own position and velocity in metres; the game's `pos`/`py`/`heading` are written as the interpolation
   between the last two steps. Anything else that moves you (a place jump, a seat) is noticed and adopted.
3. **Animation** (`FEEL.anim`): reads only the physics state (resolved speed, grounded, vertical speed, jump/land events).
4. Another driver (an NPC, a network peer) would set the same intent through `FEEL.input` / `FEEL.sim`.

**Units and axes**: everything in FEEL is in the game's metres (1 m = `TILE/0.84` world units across). The game draws height at 0.82 of
that (its isometric heritage), so FEEL simulates in true metres and converts at the edges (`FEEL.MH`, `FEEL.MV`). Up is +Y; the
character faces +Z at heading 0 (heading `h` faces `(sin h, 0, cos h)`), the game's convention. The player model is 2.22 game-metres
tall (the Walker was made 1.2× in October), so the capsule is sized from him, not from a 1.7 m human.

### Movement rules

- Desired velocity = input direction × (walk or run). The velocity **along** the input moves toward it at ACCELERATION (or BRAKING if
  over speed, REVERSAL BRAKING if moving backwards relative to it); the **sideways** part is removed at TURN GRIP. No input: BRAKING.
  Linear rates, so stopping distance is v²/2a (5 m/s at 40 m/s² stops in 0.31 m, 0.13 s).
- In the air: AIR CONTROL instead of acceleration, AIR DRAG instead of braking.
- Diagonals are normalised. Against a wall the into-wall part of the input is dropped, so you slide along at the input's tangential speed.
- Facing turns toward the **input** direction (not velocity), at TURN °/s (× TURN IN AIR off the ground), shortest way, clamped, so it
  anticipates a reversal and never oscillates; with no input it keeps its last heading.
- Jump: JUMP HEIGHT sets the take-off speed `sqrt(2·g·h)`, so height stays right when gravity changes. Allowed while grounded or within
  COYOTE TIME of leaving the ground, once per landing; a press up to JUMP BUFFER before landing counts. Releasing Space while rising (after
  50 ms) multiplies the rise by SHORT HOP KEEPS. Vertical position integrates exactly (average of old and new speed), so a 1 m jump peaks at 1.000 m at any frame rate.

### Collision (three-mesh-bvh 0.8.3)

- A capsule (radius, height from his model) against a static BVH: `MeshBVH.shapecast` with `closestPointToSegment`, up to 4 resolve
  passes, sub-stepped so no step moves more than half a radius.
- Each contact is sorted by its normal: **walkable** (within MAX SLOPE, or the triangle's own face is walkable and the contact agrees
  with it) is resolved straight up, so you don't creep down slopes standing still; **steep** is resolved sideways only, so gravity slides
  you off and you can't climb it; **ceiling** pushes down and cancels upward speed.
- A 1.5 cm skin counts as contact, so standing still reads as grounded without jitter.
- **Steps**: a steep face whose triangle tops out within STEP HEIGHT of your feet, met while grounded, lifts you onto its edge (riding the
  corner, no pop). A wall's triangle runs higher than that, so walls are never climbed.
- **Ground snap**: walking off a small drop (down a slope or a step) pulls you down up to GROUND SNAP; never during a jump's first 0.12 s or while rising.
- **On the street** the collider is the game's own walls (`solids`, made into a BVH of tall boxes and rebuilt when the level changes),
  and the floor is the game's ground height (`groundY`), as the old controller used; NPCs still push you; the map's bounds hold.
- **In the yard** the collider is the yard's own mesh (visual and collision built together; the collision has no spawn disc).

### Animation (UAL clips on his mannequin)

| State | Clip | Notes |
| --- | --- | --- |
| idle | Idle_Loop | with the game's "standing easy" pass |
| walk / run | Walk_Loop, Jog_Fwd_Loop, Sprint_Loop | one shared phase, so blends never restart a cycle |
| jump take-off | Jump_Start | one-shot from its push-off, started on the physics jump |
| air / falling | Jump_Loop | after the take-off, or after leaving a ledge for 0.12 s (no flicker on small drops) |
| landing | Jump_Land | weight by impact speed, short and faster if you're already moving again (never locks movement) |

- Locomotion follows the **resolved** speed (what you actually moved), with 0.3 / 0.12 m/s hysteresis, so pushing into a wall shows idle.
- Gait by speed: walk up to WALK speed, blend to jog by RUN speed, sprint only if RUN is set past the jog clip's speed.
- Each clip plays at `speed / its reference speed`, clamped to 0.55-1.7×. Reference speeds measured from the clips themselves (the
  foot on the ground's backward speed, in game metres a second, `tests/feelcheck.cjs`): **walk 1.19, jog 7.4, sprint 10.7**; defaults 1.2 / 7 / 10.7.
  So at the default walk (2 m/s) the walk plays at 1.67× and at run (5 m/s) the jog plays at 0.71×; feet are planted at those, slide a
  little only mid-blend.
- `Jump_Start` and `Jump_Land` were cut by `tools/trim-clips.py` in October; restored from the earlier `data/ual.json` (same skeleton)
  and trimmed to 12 fps with the rest (+23 KB). Their pelvis never rises above standing, so the clip never lifts him on top of the physics.
- **Body response**, on the visual model only (never the capsule): lean into acceleration, braking and turns (LEAN MAX), a small
  squash on landing; LEAN AND LANDING = 0 turns both off.

### Camera

The game's own cameras, untouched in the isometric view. In the behind view under FEEL: the target follows the body with its own
damping (FOLLOW DAMPING, separate from the movement), turning uses TURN DAMPING (frame-rate independent), DISTANCE and ANGLE are the
wheel's and the drag's, TARGET HEIGHT sets the look point. In the yard, five rays (centre and four at WALL CLEARANCE) from the target to
the camera pull it in at once when something's in the way and let it back out at RECOVER SPEED; it never goes under the floor.

## Settings

Defaults (`docs/feel-default.json`), prototype starting points, **not** Summer Afternoon's values:

walk 2, run 5 m/s · acceleration 25, braking 40, reversal 55, turn grip 40 m/s² · air control 6, air drag 2 m/s² · turn 720°/s, ×0.5 in
the air · gravity 22 m/s², jump 1 m, max fall 25 m/s, short hop keeps 0.45 · coyote 0.10 s, buffer 0.12 s · max slope 45°, step 0.25 m,
snap 0.3 m · capsule radius 0.34 m, height from him (2.18 m) · crossfade 0.15 s.

Presets: RESPONSIVE (harder acceleration and braking, heavier gravity), BALANCED (the defaults), FLOATY (soft rates, low gravity, a
higher jump). The panel: RESET DEFAULTS, SAVE (this browser), EXPORT JSON (file, clipboard, the box), IMPORT (paste or LOAD FILE;
refused whole with the reasons if anything is unknown, not a number or out of range).

## Acceptance run

`node tests/feelcheck.cjs [out-dir]` (after `python3 build.py`; headless Chromium, a few minutes). It drives the real controller in the
page. Physics checks call the simulation directly (deterministic); the animation, blur and camera checks run the real frame loop.
Results on 19 Oct 2026, all 26 pass:

| Check | Result |
| --- | --- |
| diagonal vs straight top speed | 5.00 vs 5.00 m/s |
| stop from run / walk | 0.27 m in 0.13 s / 0.03 m in 0.05 s |
| reversal at run | moving back after 0.10 s, slid 0.19 m forward, full speed back after 0.27 s |
| wall at 37° | never inside (stops 0.34 m off the face), slides at 3.0 m/s |
| inside corner | settles exactly in the corner, 0 jitter over the last second |
| outside corner | pushed round it (2.65 m from a 3.0 m face), carries on past |
| 0.9 m passage | goes through, centred |
| 14° ramp / 40° / 55° | climbed grounded every step / climbed to the top (1.68 m) / refused (never leaves the floor) |
| 0.2 m steps / 0.45 m block | all six climbed (to 1.2 m) / refused |
| ledge | falls (22 steps in the air) and lands on the floor; the biggest drop in one step 0.13 m, under the fall speed's 0.42 (no snap) |
| coyote (0.10 s) | jump at 50, 90 ms after the edge: yes; 150, 300 ms: no |
| buffer (0.12 s) | pressed 50, 100 ms before landing: jumps; 200, 400 ms: no |
| Space held 4 s | 0 extra jumps |
| jump height | 1.000 m (set 1); short hop 0.55 m |
| low ceiling | head stops at the ceiling (2.48 m), upward speed cancelled |
| 30 / 60 / 120 / 144 fps | the same 4.814 m run and stop, the same 1.000 m jump (simulated frame timing, not real displays) |
| animation | the walk's phase never jumps back; against a wall: resolved speed 0, idle, locomotion weight 0 |
| blur | held keys and input cleared |
| import | bad JSON, a word for a number, out of range, unknown key, an array: all refused with the reason; a good file round-trips |
| camera behind a wall | pulled in to 0.28 m in front of the wall |

Cost: the physics 0.017 ms a step (about 0.02 ms a frame at 60 fps) in the yard and on the street; the yard 1,238 triangles, one draw,
drawn only within 66 m of it; no lights; the debug lines only while debug is on. No new requests until FEEL is used (three-mesh-bvh
is the same module the game already loads for rays). The rest of the game's checks (`tests/datacheck.cjs`) fail the same 7 items with
and without this change.

## Summer Afternoon: what's verified and what isn't

- **Verified** (Vicente Lucendo on the three.js forum, https://discourse.threejs.org/t/summer-afternoon/46963): three-mesh-bvh is used
  for physics and collisions; it's multiplayer; a viewer describes a "blinds" transition when something is between camera and character.
- **Verified from its production code**, fetched 19 Oct 2026 (`assets/index-a62100c2.js` → `assets/App3D-baa90e0a.js`, now
  reachable): a `collisionPhysics` class shapecasts a capsule (`closestPointToSegment`, the three-mesh-bvh character-controller
  pattern); the floor is a pushed-from-below contact whose triangle normal has y > 0.7; movement adds a camera-relative acceleration
  each frame and multiplies velocity by 0.92 a frame (exponential damping, frame-time scaled, not a fixed step); facing lerps toward the
  velocity, faster at higher speed; 4 sub-steps (at least 3); a ray down decides if a jump is allowed. Its units and scale are unknown, so
  its speeds aren't comparable to ours.
- **Not done**: playing it side by side. This environment's headless browser has no GPU and runs THE MARKET at 2-7 fps, so feel can't
  be judged here. Its acceleration feel, stopping, camera, animation blending and obstruction effect are **not** reproduced; this
  controller is our own (linear rates, fixed step, explicit slope, step and ceiling rules) and makes no claim to match.

## Replacing the character or its clips

- The body comes from `087a-avatars.js` (`body()`): any skinned mesh on the UAL skeleton, its `AnimationMixer` and clips returned as
  `{g, mx, CL, relax}`. FEEL plays clips by name: `Idle_Loop`, `Walk_Loop`, `Jog_Fwd_Loop`, `Sprint_Loop`, `Jump_Start`, `Jump_Loop`,
  `Jump_Land` (`LOCO`/`ALL` at the top of `087c-feel-anim.js`). For another skeleton, give its clips these names (or change the two lists).
- Clips must be in place (the root's position track is dropped by `clipsFor`; a pelvis that rises in a jump clip should be clamped).
- Measure the new walk/jog/sprint clips' foot speed (`tests/feelcheck.cjs` prints them) and set WALK / JOG / SPRINT CLIP in the panel.
- CAPSULE HEIGHT 0 means "from his model" (`1.85 × W3.SZ − 0.04`); set it for a different body. After a re-bake, run
  `python3 tools/trim-clips.py` (it keeps the clips the code names).

## Limits

- Feel is untested on real hardware at real frame rates (see above); the frame-rate test is simulated timing.
- On the street the collision is the game's old map: walls are full-height boxes, the floor is the ground-height function, so you can't
  jump onto stalls or kerbs that aren't in `groundY`, and the behind camera's wall check there is the game's own (2D) one.
- Moves the old rig owned (roll, punches, kicks, swimming, boats, seats, ragdoll) still run on the old controller; FEEL steps aside for
  water, boats, seats, flying, the free camera and the ragdoll, and takes over again after.
- Feet slide a little while blending walk into jog, and above 1.7× a clip's own speed.
- No foot IK; no object fading for the camera (it pulls in instead).
