# Dead End — asset credits

Everything the page loads is CC0 (public domain) except the thing's body, which is CC BY 4.0 and credited here.

| Asset | Files | Author / source | Licence |
|---|---|---|---|
| Surfaces: plaster wall, ceiling, herringbone parquet, worn floorboards, kitchen floor tiles, concrete floor, concrete block, oak veneer, velvet, white wall tiles, carpet, hessian, brick, asphalt, rusted metal, rusty grating | `data/hide/tex/*_{d,n,a}.jpg` | Poly Haven, https://polyhaven.com/textures (the names in `tools/hide-assets.py`) | CC0 |
| Models: sofa, armchair, coffee table, consoles, nightstand, commode, dining table and chairs, grandfather clock, ceiling and desk lamps, stove, radio, mirror, bookcase, drawers, shelving, television, fan, rocking chair, tool chest, torch and the small things | `data/hide/m/*.glb` | Poly Haven, https://polyhaven.com/models (the names in `tools/hide-assets.py`) | CC0 |
| Pictures on the walls (24) | `data/hide/art/p*.jpg` | The Metropolitan Museum of Art, Open Access; one row each in `docs/hide-art.md` | Public domain (CC0) |
| The night sky | `data/hide/sky.jpg` | Poly Haven, https://polyhaven.com/a/rogland_moonlit_night (its tonemapped picture, 4096 px) | CC0 |
| Sounds (25) | `data/hide/snd/*.mp3` | BigSoundBank (Joseph Sardin) and OpenGameArt; one row each in `docs/hide-sounds.md` | CC0 |
| The thing's body and its walk ("Zombie") | `data/scare/pale.glb` (VESPER WARD's pale figure, copied at build) | DJMaesen (bumstrum), https://sketchfab.com/3d-models/zombie-25c230a1e2f2462fa3de298fc8bca30a | CC BY 4.0 |

Changes made: pictures resized to 1024 px or less and re-encoded as JPEG (`tools/hide-assets.py`, `tools/hide-art.py`), heavier models thinned (`tools/hide-slim.cjs`), sounds trimmed, levelled and in places pitched down (listed in `docs/hide-sounds.md`); the thing's skin greyed, its eyes lit red, its own walk cycle cut from its animation.

Libraries: three.js (MIT), Rapier (Apache 2.0). The walls, stairs, doors, windows, wardrobes, cupboards, beds, bath, curtains, lamps' light, rain, lightning, dust and the sounds of the television, radio, fans and music box are made in code.
