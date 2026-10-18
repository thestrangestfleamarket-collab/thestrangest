# THE STRANGEST FLEA MARKET in Godot: the first test

The owner, 18 Oct 2026: "lets start on a rebuild using godot. i dont want any sort of godot splash screen i want it completely hidden. build out
a test small game with just one building and my walker on godot. match graphics exactly."

**What it is**: the bodega and the ground round it (the sidewalk, the kerb, the road, the lawn), the Walker, THE MARKET's opening isometric view,
3:30 pm. Godot 4.5.1, the Compatibility renderer (the one that runs in a browser).

**No Godot splash**: `project.godot` shows no boot image (`boot_splash/show_image=false`, the background THE MARKET's loading colour); the page
round it (`shell.html`) has no Godot logo or progress bar: only THE MARKET's line "I took a trip to The Strangest Flea Market...", gone once the
first picture is up.

## How it matches

Nothing is redrawn by hand: **everything comes from the three.js game itself** (`tools/bake.cjs` opens `dist/market.html` headless and takes it
from the running page):

- **The world**: every face of the bodega (and the ground's faces round it) with its atlas, its emissive atlas, its colour; the bodega's lamps
  (LITE's records); the solids (`SOL.up`), the ground's height on a quarter-unit grid; the sun, the sky's fill, the background and the haze
  every half hour of the clock.
- **The Walker**: his mesh as THE MARKET builds it (the worn pieces, his own colours, one mesh), and his moves sampled from the game's own rig
  (`RIG.step`, `RIG.pose`, `W3.place`): the idle by the clock (16 s at 30 a second), the walk and the run by the distance walked (their frames
  go by his feet, as the rig's do), each frame the 30 pieces' frames.
- **The look**, ported as shaders: `world.gdshader` (map-pre.js: the faces' fixed shades by facing, x0.62 / x0.8; the light multiplied in and
  eased into seven soft bands, capped at 1.7), `walker.gdshader` (walker3d.js's toon: every light through his smooth gradient, depth .78, the
  sky's fill, 0.16 of his own colour, SELF from his own shadow map, `walker_depth.gdshader`), `look.gdshader` (oldlook.js: the stepped glow,
  the warm sun and cool shade, the night eye, the deep).
- **The pixels**: drawn at the art's own 30 pixels a world unit into a small picture, enlarged by whole screen pixels (THE MARKET's
  `vpu / art / pxS / rppu`); the camera on the picture's pixel grid and he on it with it (PXSNAP).
- **Lights** as three.js's: Godot's light colour comes in as colour x energy x PI, so the lights are given three.js's intensities and the
  shaders divide; Godot's omni falloff is three.js's (range = distance, attenuation = decay). Godot's Compatibility renderer takes ALBEDO and
  EMISSION as sRGB and reads textures as stored, so the shaders put three.js's linear colours through the exact sRGB curve (measured).
- **Winding**: three.js's front faces are counter-clockwise, Godot's clockwise: turned at load.

## Playing it

WASD or the arrows walk (the way the screen faces), Shift runs, Q / E turn the view a quarter, the wheel zooms (pixels grow; never finer than
the opening zoomed out), `[` and `]` the clock half an hour back and on. Walk into the bodega: only its room is drawn, the near side cut
above his knee (rooms.js).

## Building

```
python3 build.py                           # THE MARKET (the source of the data)
node godot/tools/bake.cjs                  # godot/data/ from the running game (NODE_PATH to playwright)
godot --path godot                         # play it on the desktop
python3 godot/tools/pack_web.py            # dist/godot/: the web build, the .wasm and .pck gzipped for an artifact
node godot/tools/refshot.cjs 9.9,1.6 out.png   # THE MARKET's picture at a spot, to set beside Godot's
xvfb-run -a godot --path godot --rendering-driver opengl3 --resolution 800x600 -- --shot=out.png [--at=x,z] [--hour=h] [--hold=w,shift] [--frames=n]
```

Godot 4.5.1 with its web templates (`web_nothreads_release.zip`) in `~/.local/share/godot/export_templates/4.5.1.stable/`.

## Not yet

The street's things outside the bodega (the street lights, the mailbox, the fences, the power lines), the characters, the neon's halo (its own
shader), the clouds' shadows, the cut walls outside a room, sound, the menus. Each next piece is the owner's call.
