# Dead End — asset credits

Everything the page loads is CC0 (public domain) except the thing's body.

| Asset | Files | Author / source | Licence |
|---|---|---|---|
| Surfaces: red brick, dark brick, asphalt, rusted green metal, rusty metal, corrugated iron, weathered planks, dirty carpet, hessian, dirty concrete | `data/hide/tex/*_{d,n,a}.jpg` | Poly Haven, https://polyhaven.com/textures (`red_brick_03`, `dark_brick_wall`, `asphalt_02`, `green_metal_rust`, `rusty_metal_02`, `corrugated_iron_02`, `weathered_planks`, `dirty_carpet`, `hessian_230`, `dirty_concrete`) | CC0 |
| Models: trash can, trash bag, cardboard box, tyre, two barrels, air-conditioning unit, utility box, wall lamp, roller-shutter door, sofa, plastic container, cement bag, wooden crate, security light, manhole cover, wheel rim | `data/hide/m/*.glb` | Poly Haven, https://polyhaven.com/models (`metal_trash_can`, `trashbag`, `cardboard_box_01`, `old_tyre`, `Barrel_01`, `barrel_03`, `exterior_aircon_unit`, `utility_box_01`, `industrial_wall_lamp`, `rollershutter_door`, `sofa_02`, `industrial_pastic_container`, `cement_bag`, `wooden_crate_02`, `security_light`, `water_manhole_cover`, `rusted_wheel_rim_01`) | CC0 |
| Sounds (25) | `data/hide/snd/*.mp3` | BigSoundBank (Joseph Sardin) and OpenGameArt; one row each in `docs/hide-sounds.md` | CC0 |
| The thing's body and motion | `data/scare/brute.glb` (VESPER WARD's brute, copied at build) | see `docs/scare-credits.md` | Mixamo terms, provenance unconfirmed |

Changes made: pictures resized to 1024 px or less and re-encoded as JPEG (`tools/hide-assets.py`), heavier models thinned (`tools/hide-slim.cjs`), sounds trimmed, levelled and in places pitched down (listed in `docs/hide-sounds.md`).

Libraries: three.js (MIT), Rapier (Apache 2.0). The dumpsters, pallets, locker, refrigerator, burnt car, drain pipe, mattress, carton, gate, street beyond the gate, mist, puddles and rain are made in code.
