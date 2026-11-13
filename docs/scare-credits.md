# Vesper Ward — asset credits

| Asset | File | Author / source | Licence |
|---|---|---|---|
| The pale figure ("Zombie") | `data/scare/pale.glb` | DJMaesen (bumstrum), https://sketchfab.com/3d-models/zombie-25c230a1e2f2462fa3de298fc8bca30a | CC BY 4.0 |
| Covered body on the beds ("Low Poly Dead Body Covered Game Ready") | `data/scare/body.glb` | Arthur.Zim, https://sketchfab.com/3d-models/low-poly-dead-body-covered-game-ready-1e6ae13f6c2e46429eaca4d22d8bdbaa | CC BY 4.0 |
| The woman ("Zombiegirl") | `data/scare/girl.glb` | Adobe Mixamo character | Mixamo terms (free to use inside a game; not to be redistributed as a standalone asset) |
| The brute (Mixamo-rigged mutant) and its animations | `data/scare/brute.glb` | Appears to be Adobe Mixamo's "Mutant"; taken from a public GitHub project with no licence file, so provenance is unconfirmed | Treat as Mixamo terms; re-download from mixamo.com before a public release |
| Motion capture (zombie idle, walk, run, attack, agonizing, scratch idle, walking, running crawl) | `data/scare/anims.glb` | Adobe Mixamo | Mixamo terms |

Changes made: textures resized and converted to WebP, the pale figure's skin desaturated, unused animations removed, animations retargeted at load time.

The Mixamo files were collected from public GitHub repositories rather than from mixamo.com directly. Before publishing the game publicly, download the same characters and animations with your own free Adobe account so the licence chain is clean.

Libraries: three.js (MIT), cannon-es (MIT). Wall, floor and ceiling textures, the weapons, props and all audio are generated in code.
