# Space Fleet — asset credits

Fetched and prepared by `tools/space-models.cjs` into `data/space/` (what it fetches is kept in `data/full/space/`, not in git).

## Models, CC BY 4.0 (Sketchfab, taken from Objaverse's copy)

Each is at `https://sketchfab.com/3d-models/<id>`.

| Used for | File | Title, author | Id |
|---|---|---|---|
| The mother ship | `m/mother.glb` | "D.S.S. Harbinger battle cruiser", Comrade1280 | 474f62d00ed54212b37f93ce91569c53 |
| Cruiser | `m/cruiser.glb` | "spaceship", 박용진 (easyidpyj) | 781e531c00d94c9e89dcc8ad9b967d87 |
| Frigate | `m/frigate.glb` | "Scout RS28", R-LAB (rakshaan) | 4cccb0378e474f8a8d3c7079e2e56d63 |
| Fighter | `m/fighter.glb` | "Sci-Fi Aircraft, Spaceship Fighter", valterjherson1 | 99c1d15965c74f3aa7b5999e2d4e42e1 |
| Defence turret | `m/turret.glb` | "Sci-Fi Turret", Umut Calim (UmutCalim) | 5ebad179815d44a8a8fa221d203fb383 |
| Mine | `m/mine.glb` | "Robot/Mine asset for a VR game ("edited" low)", Joan Betbe (JoanBetbe) | 609990d577c645689181a2e1fc82ab1f |
| Comms relay | `m/relay.glb` | "Satellite Toy/Model", Cameron-Main | 7a5556a83ec24141b93c7fcce82a01de |
| Asteroids (three rocks of the pack) | `m/rock1.glb`, `m/rock2.glb`, `m/rock3.glb` | "Asteroids Pack (rocky version)", SebastianSosnowski | adde1ecf129e4509be8af61b84bafa85 |
| The second fleet's mother ship | `m/mother2.glb` | "Aeriusu Drone Ship", morepolys | 1b121a8965e241ada855288eef2732ba |
| The second fleet's cruiser | `m/cruiser2.glb` | "Cargo Spaceship", blaice | a53147cc2da943e7ae07f1e0b0a31518 |
| The second fleet's frigate | `m/frigate2.glb` | "Spacecraft-03", jah3d (Jah3d) | 025fb009e24746eba87d3458fb7db7d9 |
| The second fleet's fighter | `m/fighter2.glb` | "Second Hand Star Fighter", Logan Thomas (LThomas762) | 303d3e5b8d544653bfde45189ca10c73 |
| The second fleet's gun platform | `m/turret2.glb` | "Rail_Turret", Skotchet (Skotcher) | 59b72a8e3ec24a0bb7b072cf6e130574 |
| The second fleet's mine | `m/mine2.glb` | "sea mine", AbsoluteMadLadd | 5df948888c3748479a8b83ac1c5e0066 |

Changes made: each model turned nose to +Z and top to +Y, centred, scaled so its longest side is 1, joined one mesh a material; a model with more than two materials has its pictures packed side by side into one or two; some thinned; pictures resized to 1024 px or less as JPEG.

## Sky, CC BY 4.0

| Used for | File | Source |
|---|---|---|

Changes made: resized to 4096 x 2048, darkened.

## Hull surfaces

Made here by `tools/space-detail.py` into `data/space/tex/` (`hull0_*` the Admiralty's, `hull1_*` the Corsairs'): a plating layout drawn as a height map, its normals, roughness and hollows worked from it. No outside pictures.

## Libraries

three.js (MIT).


## The sky

No picture: the stars are the Yale Bright Star Catalogue, 5th ed. (Hoffleit & Warren 1991, public domain; `data/stars.json`), and the galaxy, the far clusters and the clouds of gas are built in the page.
