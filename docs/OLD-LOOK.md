# The old game's look: how it was done (read from bralynnb/tsfm/src, 17 Oct 2026)

The owner: "look at the actual old game code and see how it was done". This is what the old game does, with its numbers, so THE MARKET can
do the same in three.js. (Read as data only, as CLAUDE.md says of the game's code.)

## The recipe, most important first

1. **One pixel grid.** Everything is drawn at one picture pixel per art pixel, then enlarged by a whole number S (screen px per art px; default
   `round(sqrt(W*H)/400)`, about 4 at 1080p; zoom steps 2..10). Zooming only makes pixels bigger, never finer. 2:1 isometric: a tile is 48 x 24
   art px, a tile of height 24 px. Nearest filtering everywhere, no antialiasing. The walker stays at a fixed screen spot; the world slides under
   him by whole screen pixels.
2. **Three face tones, no light direction.** Every box: its top the colour as it is, its X-facing side x0.62, its Y-facing side x0.8 (brick walls
   x0.8 / x1.0). A material is 2-4 hand-picked colours (pavement `[168,163,150] [161,156,143] [173,168,155]`, seams `[131,126,115]`), with grain
   (noise cut into a few tone shifts: x0.94 / x1.03), specks, thin cracks, dark spots, 1-px darker seams and mortar.
3. **Light multiplied into the colour, in 24 steps.** Per pixel: `L = ambient*sky + sun*N.L(shadowed) + lamps*2 + room lights*2`, capped at 1.7;
   `m = max(L.r,L.g,L.b); L *= round(m*24)/24/m` (hue kept, no dither); colour = albedo * L.
4. **Lamp falloff.** `f = 1 - d/R; I = f*(.35+.65f)*(.55+.45*N.L)*1.15`, nothing if N.L <= 0. Street lamp: reach 5 tiles, 2.75 tiles high,
   `#ffd18c x1.3`; room lights reach 9, `#ffdba8 x0.9`; underground `#e6f0ff`. Walls cast lamp shadows; objects don't. Lamps switch on below 0.3
   daylight.
5. **Dark nights, lit only by sources.** Night ambient about `[.067,.073,.095]` + moon `[.10,.11,.14]` x N.L. Day ambient `[.54,.56,.63]` x sky
   visibility (0 under a roof) + sun `[.8,.72,.59]` x N.L, hard shadows. Where a floor meets a wall or a thing standing on it: x`(.72+.28*d/.35)`
   within 0.35 tile (contact shadow). Beyond the land: black.
6. **The final grade.** Night eye: `k=.8*(1-smoothstep(.06,.42,lum)); col=mix(col,lum,k)*mix(1,(.62,.87,1.31),k)` (dark things go blue-grey).
   Deep colour: `col=mix(col,#0a1030,.24*(1-lum)^2)`. A stepped glow: only what is 1.6-3x brighter than around it, blurred ~2.5 art px, cut to 8
   steps on the art grid, screen-added x1.28 at night and indoors.
7. **Edges.** Objects only: every edge pixel of a thing's own picture darkened x0.5 (a 1-px rim of its own colour, not a black line). Walls and
   floors get no outline: their edges come from the three face tones and the dark seams in their textures.
8. **The pool.** Pale tile bed `[.8,.9,.93]`, lit only by seven blue under-lamps `[.32,.68,1]`: `3.2/(1+.35d^2)*exp(-sig*d*.9)`; absorption
   `sig=[.30,.045,.03]` a tile (red dies first: clear turquoise); in-scatter glow `scat=[.04,.30,.5]*(.05,.1,.16 + sum 1.6/(1+.5d^2))`; caustics
   x`(.7+.4c)`; Fresnel `.02+.98(1-cos)^5` reflecting a near-black room, lamp glints `pow(spec,60)`; 29 levels a channel; unlit by the world (its
   own colours); the dark room round it makes it read bright; the glow blooms its lamps.
9. **Lamp halos**: radius 28 art px, `(255,214,150)`, five stepped rings `floor((1-d)^2*5)/5*.55`, added. **The walker's shadow**: a small fixed
   blob, black at .22.

Files in the old game: `20-projection-layers.js` (rasterBox: the face tones; outline), `42-lighting-1-light.js` (lights, LDEF), `42-lighting-2-webgl-1-lit-passes.js`
(the shaders: FA/FB lighting, FS3 grade, the glow), `41-time-of-day.js` (sky table), `21-world-map-2-ground.js` (grain, crack, spot, bricks),
`22-props-layers-2-pictures.js` (outline), `43-view-assembly-2-painting.js` (halos), `45-render.js` (pinning), `23-w-deep-water-*.js` and `47-pool.js` (the pool).
