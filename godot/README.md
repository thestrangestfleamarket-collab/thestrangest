# Forest Walk (Godot 4)

A first-person walk through a low-poly forest, built from the nature pack in `assets/nature/`. Separate from the three.js market; nothing there reads this folder.

## Run

1. Install Godot 4.3 or newer (standard build, not .NET).
2. Godot → Import → pick `godot/project.godot`.
3. The first open imports the 57 models, which takes a moment. Then press F5.

**Controls:** WASD / arrows to move, Shift to run, Space to jump, mouse to look, Esc to free the mouse (click to grab it again).

## What's here

- `scenes/main.tscn` holds the sky, sun, fog and the player. `scripts/forest.gd` builds the world at start: the ground, a winding dirt path with stepping stones, trees and rocks you bump into, and grass, ferns, flowers, mushrooms and pebbles you walk through. A fixed seed means the forest is the same every run.
- `scenes/player.tscn` + `scripts/player.gd` are the walker.
- Tune it in the Inspector on `Main`: `world_seed`, `half_size` (forest size), `path_width`, `cover_density`, `cover_draw_distance`. The tree and plant counts are in `GROUPS` at the top of `forest.gd`.

## Textures

The pack's `.mtl` files pointed at textures on the author's PC (`C:/Leaf_Pine_C.png` …), and none came with the folder. For now every material is a flat colour (see `PALETTE` in `forest.gd`). If you have the pack's textures, drop the PNGs in `assets/nature/textures/` and they're used automatically, with alpha cut-out on leaves and flowers:

`Bark_NormalTree.png`, `Bark_NormalTree_Normal.png`, `Bark_DeadTree.png`, `Bark_DeadTree_Normal.png`, `Leaf_Pine_C.png`, `Leaves.png`, `Flowers.png`, `Grass.png`, `Mushrooms.png`, `Rocks_Diffuse.png`, `PathRocks_Diffuse.png`, and for the trees whose `.mtl` was missing: `Bark_TwistedTree.png`, `Leaves_TwistedTree.png`, `Leaves_NormalTree.png` (or the same names ending `_C.png`).
