# Space Fleet — asset credits

Fetched and prepared by `tools/space-models.cjs` into `data/space/` (what it fetches is kept in `data/full/space/`, not in git).

## Models, CC BY 4.0 (Sketchfab, taken from Objaverse's copy)

Each is at `https://sketchfab.com/3d-models/<id>`.

| Used for | File | Title, author | Id |
|---|---|---|---|
| The mother ship | `m/mother.glb` | "Battleship "KORTES"", Ruslan Malovsky (malovsky) | 20f2e424303d47e4a5078f0255ef5689 |
| Cruiser | `m/cruiser.glb` | "SpaceShip "NORTEND"", Ruslan Malovsky (malovsky) | 9f99de3657234c939b58610bc99333ed |
| Frigate | `m/frigate.glb` | "Space Ship", Comrade1280 | 63ce372c1aa843e98bf1548109e055d8 |
| Fighter | `m/fighter.glb` | "Free Spaceship", Ruslan Malovsky (malovsky) | 891bb91d22ac4115a8e3c423efb44457 |
| Defence turret | `m/turret.glb` | "Sci-fi Turret 3", everlasting17th (everlastinggrey) | 28fb90b851b5454589f5170b08c8c66d |
| Mine | `m/mine.glb` | "Robot/Mine asset for a VR game ("edited" low)", Joan Betbe (JoanBetbe) | 609990d577c645689181a2e1fc82ab1f |
| Comms relay | `m/relay.glb` | "Satellite Toy/Model", Cameron-Main | 7a5556a83ec24141b93c7fcce82a01de |
| Asteroids (three rocks of the pack) | `m/rock1.glb`, `m/rock2.glb`, `m/rock3.glb` | "Asteroids Pack (rocky version)", SebastianSosnowski | adde1ecf129e4509be8af61b84bafa85 |
| The second fleet's mother ship | `m/mother2.glb` | "Mjolnir", Star Conflict (star_conflict) | c8e9020d658649238ee3cfc1c1d64a68 |
| The second fleet's cruiser | `m/cruiser2.glb` | "AJF-12 "Dvergr"", Star Conflict (star_conflict) | ecc16e103e79448faf9730f172a1d7e8 |
| The second fleet's frigate | `m/frigate2.glb` | "Rusty Spaceship", Sousinho | 502d0ff399d64eda8a7d932db619ce95 |
| The second fleet's fighter | `m/fighter2.glb` | "Second Hand Star Fighter", Logan Thomas (LThomas762) | 303d3e5b8d544653bfde45189ca10c73 |
| The second fleet's gun platform | `m/turret2.glb` | "Drone Low", xeoncat | 75cc87e9b5d54b84b91ba2439837f604 |
| The second fleet's mine | `m/mine2.glb` | "2nd Robot/Mine asset for a VR game", Joan Betbe (JoanBetbe) | 9932b325620c4d0db612671064cea986 |

Changes made: each model turned nose to +Z and top to +Y, centred, scaled so its longest side is 1, joined one mesh a material; a model with more than two materials has its pictures packed side by side into one or two; some thinned; pictures resized to 1024 px or less as JPEG.

## Sky, CC BY 4.0

| Used for | File | Source |
|---|---|---|

Changes made: resized to 4096 x 2048, darkened.

## Hull surfaces, CC0 (ambientCG)

Fetched and packed by `tools/space-detail.py` into `data/space/tex/`.

| Used for | Files | Set |
|---|---|---|
| The Admiralty's hull relief | `tex/hull0_n.jpg`, `tex/hull0_h.jpg` | MetalPlates008 |
| The Corsairs' hull relief | `tex/hull1_n.jpg`, `tex/hull1_h.jpg` | MetalPlates012 |

Changes made: resized to 1024 px; height, roughness and ambient occlusion packed into one picture's red, green and blue.

## Libraries

three.js (MIT).


## The sky

No picture: the stars are the Yale Bright Star Catalogue, 5th ed. (Hoffleit & Warren 1991, public domain; `data/stars.json`), and the galaxy, the far clusters and the clouds of gas are built in the page.
