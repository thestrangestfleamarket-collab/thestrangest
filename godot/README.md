# THE STRANGEST FLEA MARKET in Godot: the map export

The owner, 25 Oct 2026: "lets work on import of our game into godot" — the whole map as the game builds it, with its characters, on its
own branch (not `main`).

## Opening it

Download **market-godot** from this branch's latest `godot` workflow run (Actions tab), unzip it, and open the folder in
Godot 4.5 (Project Manager → Import → `project.godot`). Godot imports the `.glb` files the first time. `main.tscn` is the market:
fly with the right mouse button held, WASD, Q / E, and Shift.

## What is in it

- `map/world.glb`: every mesh the game draws outdoors at 3:30 pm (the street, the blocks, the park, the castle, the station, the
  dungeon), grouped by place, the batch meshes split back into the things the game names; its lamps; one copy of each repeated thing
  under `_protos`.
- `map/world.json`, `map/world.bin`: where each repeated thing goes. `scripts/instances.gd` turns them into MultiMeshes when the
  scene opens (in the editor too).
- `map/char-<key>.glb`: each character once, with its bones and every baked clip that moves them; `main.tscn` stands each one
  where the game has it.
- `main.tscn`: the sun, the sky's fill and the background as the game has them at the hour, and a camera over the start.

## Making it again

```
SKIP=g python3 build.py
node godot/tools/export.cjs      # HOUR=21 for another hour
node godot/tools/check.cjs out   # reads it all back, pictures in out/
```

## Not yet

The game's cel look (materials are plain lit ones), the custom-shaded water (a flat stand-in), the insides of buildings (off the
map, built when you go in), the Walker, the moves of the characters the game animates in code (the toons and the owner's `.glb`
toons: rigged, no clips), collision, sound, play. Each next piece is the owner's call. Not yet opened in Godot itself: the session
that made it could not run Godot; the files were checked by reading them back with three.js.
