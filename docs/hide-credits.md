# Dead End — asset credits

Everything the page loads is CC0 (public domain) except the thing's body.

| Asset | Files | Author / source | Licence |
|---|---|---|---|
| Surfaces: peeling painted wall, damaged plaster, floor tiles, old wood floor, white wall tiles, blue metal plate, worn planks, dark brick, asphalt, rusted green metal, rusty metal, dirty carpet, hessian, dirty concrete, rusty grating | `data/hide/tex/*_{d,n,a}.jpg` | Poly Haven, https://polyhaven.com/textures (the names in `tools/hide-assets.py`) | CC0 |
| Models: school desk and chairs, shelving, bookcase, cabinets, tables, stools, chalkboard, light fittings, ceiling fan, wall clock, fire alarm, extinguisher, office desk, wheelchair, microscope, burner, chemistry set, projector screen, television, sofa and the small things | `data/hide/m/*.glb` | Poly Haven, https://polyhaven.com/models (the names in `tools/hide-assets.py`) | CC0 |
| Wall posters (27) | `data/hide/art/p*.jpg` | WPA posters, 1936-43, Library of Congress; one row each in `docs/hide-posters.md` | Public domain (US government works) |
| The night sky | `data/hide/sky.jpg` | Poly Haven, https://polyhaven.com/a/rogland_moonlit_night (its tonemapped picture, 4096 px) | CC0 |
| Sounds (25) | `data/hide/snd/*.mp3` | BigSoundBank (Joseph Sardin) and OpenGameArt; one row each in `docs/hide-sounds.md` | CC0 |
| The thing's body and motion | `data/scare/brute.glb` (VESPER WARD's brute, copied at build) | see `docs/scare-credits.md` | Mixamo terms, provenance unconfirmed |

Changes made: pictures resized to 1024 px or less and re-encoded as JPEG (`tools/hide-assets.py`), posters cropped to the sheet and resized to 512 px high (`tools/hide-posters.py`), heavier models thinned (`tools/hide-slim.cjs`), sounds trimmed, levelled and in places pitched down (listed in `docs/hide-sounds.md`).

Libraries: three.js (MIT), Rapier (Apache 2.0). The walls, lockers, cupboards, stalls, doors, windows, stairs, notices, children's drawings, stains, dust and haze are made in code.
