# Skatepark kit

**Building with this? Read `API.md` (one paragraph: the whole API of kit.mjs, stage.mjs and clips.mjs) and stop.**
Three lines build the place: `import { buildKit } from './kit.mjs'; const place = await buildKit({ folder: './' }); scene.add(place.group);`. The rest of this file is reference.

https://polyfork.dev/kit/skatepark-0922a9

60 of 60 parts, packed 2026-10-31.
Kits fill up over time: if this says fewer parts than the site does, re-download.

## What is in this folder

Every part twice: `<part>.glb` for any engine, `<part>.mjs` as a drop-in three.js
module with its options. `scene.glb` is the composed kit scene, the whole thing
arranged as one file.

BUILD THE WHOLE PLACE IN ONE CALL. `kit.mjs` in this folder does it:

```js
import { buildKit } from './kit.mjs';          // serve this folder over http
const place = await buildKit({ folder: './' });   // all 1267 placements, merged to a few draw calls
scene.add(place.group);                        // then place.tick(elapsedSeconds) in your loop
```

You get `place.bounds`, `place.boxes()` (a Box3 per placement tall enough to walk into),
`place.of(key)`, `place.terrain` with `place.groundAt(x, z)`, and the placed people idling.
LIGHT IT WITH `stage.mjs`, not with ACES tone mapping at exposure 1: these colours are authored for
no tone mapping under a hemisphere, a warm key and a cool rim, and the usual tutorial rig turns them
muddy. `const look = stage(renderer, scene, { time: 'day' }); look.shadows(place.group);
look.ground(place); await place.surround(); look.follow(player);` then `look.update()` each frame.
`look.setTime(0..1)` runs day to night. `place.surround()` scatters the kit's own trees past its edge.

`clips.mjs` makes any of the humanoids walk: `const anim = await animate(character);
anim.locomotion(metresPerSecond)`. The page needs an import map for `three` and `three/addons/`.

`LAYOUT.json` is the composition: 1267 placements of 61 parts, the arrangement
every picture of this kit was taken in. Each row is a part key, a position in
metres (`x`,`y`,`z`, Y up), rotations in degrees (`ry` about Y, and `rx`/`rz` where
present, applied in XYZ order: an upright turn can be written rx = rz = 180 with ry),
an optional scale `s`, and `params` — the knob values
that placement was built with, where they differ from the part's defaults.

```js
for (const p of LAYOUT) {
  const o = createAsset({ THREE, ...(p.params || {}) });   // from `${p.part}.mjs`
  o.position.set(p.x, p.y, p.z);
  const D = Math.PI / 180;   // all three, XYZ order (three.js's default): some upright rows say rx = rz = 180
  o.rotation.set((p.rx || 0) * D, (p.ry || 0) * D, (p.rz || 0) * D);
  if (p.s) o.scale.setScalar(p.s);
  scene.add(o);
}
```

The row whose part is `_terrain` is the ground rather than a model: it carries a
`module` and the knobs `terrain.mjs` was generated with.

## The ground

`terrain.mjs` generates this kit's own ground; `TERRAIN.json` holds the knob values
it is composed and photographed at. It is a program, not a mesh, so it rebuilds at
any size and the parts sit on it at the same scale they were built for.

```js
import { createAsset as terrain } from './terrain.mjs';
scene.add(terrain(await (await fetch('./TERRAIN.json')).json()));
```

## Using them together

The kit agrees on the knobs below. Knobs not listed here are local to one part, vary them freely.

- **`colorway`** (59 of 60 parts): 51 different option sets. Every part has this knob and its values are curated for that part, so a
  value from one part is not valid on another. Each `.mjs` lists its own in the header.

Snap positions to the 2m grid and rotate in 90 degree steps: tiles are whole 2m modules with flush edges, so copies butt seamlessly. The floor and ground tiles sit ON y=0 and their walkable top is at y=0.05 m (their own thickness), so stand what goes on them at y=0.05, and at y=0 where there is no tile. The scene editor at https://polyfork.dev/editor snaps to this automatically.

**Scale.** Everything snaps to a 2m grid: ground tiles are exactly 2x2m on a 0.05m slab, every obstacle and building footprint is a whole number of 2m modules in both axes with flat faces on the footprint edge, skateable deck and coping heights come only from the 0.3/0.6/1.2/1.8m ladder so ledges, stairs, banks and ramp decks meet flush, buildings use 3m floors and 2.1m doors, and an adult skater stands about 1.75m tall.

**Palette.** `#edebe8`, `#e0dfda`, `#96928a`, `#6a6761`, `#45443f`, `#2f2f33`, `#1c1c1f`, `#e4e7e9`, `#8d969e`, `#5c646b`, `#b3643b`, `#7c4a2e`, `#e6ca97`, `#c7a06a`, `#a4462f`, `#6f2f22`, `#b0a39c`, `#f3f0e9`, `#2d8fbf`, `#1f5f9e`, `#ff4f8b`, `#ff7a1f`, `#f4c430`, `#9bd23c`, `#3ec7c1`, `#7d4cc9`, `#d2383a`, `#4f6b3a`, `#86a84e`, `#f9f6f0`

## Parts

60 parts. `PARTS.json` beside this file lists each one on one line: file, size, knobs with their options and defaults, colour zones, rig nodes, lit zones. `grep '"<key>"' PARTS.json` rather than opening its `.mjs`.

Every part also has its own page with renders and live options:
https://polyfork.dev/kit/skatepark-0922a9

## Building this with an AI agent?

Point it at https://polyfork.dev/prompt.txt. The same assembly contract above is
machine-readable at https://polyfork.dev/api/kits/skatepark-0922a9 (the `usage` field), and it
updates as the kit fills up, which this file does not.
