# Cold Bore — asset credits

Everything the page loads is CC0 (public domain).

| Asset | Files | Author / source | Licence |
|---|---|---|---|
| The rifle (KSR-29: body, scope, bipod, magazine, its colour and relief pictures) | `data/sniper/m/ksr29.glb` | Dennis Haupt, https://opengameart.org/content/sniper-rifle-ksr-29 | CC0 |
| Skies (five hours: noon, day, dusk, overcast, sunrise) | `data/sniper/sky/*.jpg` | Poly Haven: kloofendal_48d_partly_cloudy_puresky, kloofendal_43d_clear_puresky, qwantani_dusk_2_puresky, kloofendal_overcast_puresky, qwantani_sunrise_puresky | CC0 |
| Surfaces (asphalt, paving, grass and rock, hessian, container side, corrugated iron, deck, concrete, painted concrete, brick, plaster) | `data/sniper/tex/*_d.jpg`, `_n.jpg`, `_a.jpg` | Poly Haven, https://polyhaven.com/textures | CC0 |
| Trees (a fir and a broadleaf, drawn from the scans into cards) | `data/sniper/tex/fir.png`, `leaf.png` | Poly Haven: fir_sapling_medium, island_tree_01 | CC0 |
| Props (ammunition box, military crate, binoculars, street lamp, road barrier, covered car, buoy, barrel, crate, bin, hydrant, plant, tyre, jerrycan, bench, picnic table, cardboard box, gas bottle) | `data/sniper/m/*.glb` | Poly Haven, https://polyhaven.com/models | CC0 |
| Sounds (18) | `data/sniper/snd/*.mp3` | one row each in `docs/sniper-sounds.md` | CC0 |

Changes made: pictures resized to 1024 px or less and re-encoded as JPEG, skies to 4096 px (and 1024 px for the light) (`tools/sniper-assets.py`); heavier models thinned (`tools/hide-slim.cjs`); the rifle taken out of its .blend with one material (`tools/sniper-rifle.py`); the trees rendered side-on with Blender and cropped (`tools/sniper-trees.py`).

Libraries: three.js (MIT), three-mesh-bvh (MIT). Made in code: the land, the buildings and their rooms, the people, cars, boats, the helicopter, flags, the reticle and the range card.
