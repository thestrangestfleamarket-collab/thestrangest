# RAMEN credits

- People and their motion (`data/sushi/cast.json`, from `node tools/sushi-cast.cjs`): Polyfork, https://polyfork.dev, its licence (use in games, no reselling the files): each person's own model (the id in `data/characters.json`) and Polyfork's recorded clips. Who is who is in `src/sushi/cast.js`; the nurse is its diner waitress with her dress dyed white in the page.
- The cars (`data/sushi/cars.json`, from `node tools/sushi-cars.cjs`): Polyfork's, the same licence: Yellow Cab (`yellow-cab-8df4a0`), Police Cruiser (`police-cruiser-a2d25e`), Boxy-sedan-70s (`boxy-sedan-70s-7d55f7`), Station-wagon-70s (`station-wagon-70s-11d67b`), Hatchback-80s (`hatchback-80s-e95554`), Town Car (`town-car-56eeb6`), Muscle-car-60s (`muscle-car-60s-524d46`), Camper-van (`camper-van-8d10e2`); each at `https://polyfork.dev/asset/<id>`. The five Sketchfab cars they replaced are in `archive/ramen-cars/`.
- The goldfish is Polyfork's koi (`data/sushi/koi.json`), gilded in the page.
- The street's trees and pay phone (`data/sushi/m/`, from `node tools/sushi-models.cjs`: sized, thinned; the originals kept in `data/full/sushi/src/`, not in git): Sketchfab, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), taken from Objaverse's copy; each is at `https://sketchfab.com/3d-models/<id>`.

| What | File | Title, author | Id |
|---|---|---|---|
| Street trees (leaves coloured for October in the page) | `tree_elm.glb`, `tree_elm_lo.glb` | "Elm tree", evolveduk | f36443d3e59946bfa38b3f5cb90ea5fa |
| Pay phone | `payphone.glb` | "Pay Phone", Víctor Hernández | a0339aa975e54bb7ac65982ca3cc5802 |

- The hydrant and the manhole covers (`data/sushi/m/fire_hydrant.glb`, its paint taken out for the page's black and silver, and `manhole.glb`; `tools/sushi-models.cjs`): Poly Haven, CC0: Fire Hydrant, Gonçalo Felício, https://polyhaven.com/a/fire_hydrant; Water Manhole Cover, Raunox, https://polyhaven.com/a/water_manhole_cover.
- The boombox's stations are real ones streamed live, each by its own public stream: WBGO 88.3 (Newark), WWOZ 90.7 (New Orleans), WQXR 105.9 (New York), and SomaFM's Seven Inch Soul and Underground 80s (somafm.com, listener-supported). Its cassette (when no station will play) is made in the page.
- The cart's television and the repair shop's window sets play THE LATE MOVIE (`data/sushi/films.json`): Night of the Living Dead (1968, public domain; the Internet Archive's `night_of_the_living_dead_dvd`), a small copy of our own (`tools/sushi-film.sh`).
- The television's other channels (`data/sushi/films.json` `market.take`) are THE MARKET's own (`data/tv.json`, each programme's Internet Archive item and file there), streamed from the Internet Archive (`https://archive.org/cors/<item>/<file>`), nothing copied; all 157 files were found there on 20 Nov 2026:

| Channel | What | Source | Licence |
|---|---|---|---|
| 2 BOOP TV | 33 Betty Boop cartoons, Fleischer Studios, 1932-1939 | Internet Archive items `bb_*` | public domain (copyright not renewed) |
| 4 SATURDAY MORNING | 18 cartoons: Popeye, Noveltoons, Little Audrey, Little Lulu and others, Famous Studios and friends, 1941-1957 | Internet Archive | public domain |
| 6 THE MAN OF STEEL | 10 Superman cartoons, Fleischer and Famous Studios, 1941-1943 | Internet Archive items `superman_*` | public domain |
| 7 ODD REELS | 33 advertising, school and safety films, 1935-1963 | the Prelinger Archives at the Internet Archive | public domain |
| 9 OLD TIME TOONS | 7 cartoons, 1930-1948 | Internet Archive | public domain |
| 11 PRIME TIME | 33 episodes: Bonanza, Dragnet, The Beverly Hillbillies, One Step Beyond, The Lone Ranger, 1949-1963 | Internet Archive | public domain (these episodes' copyrights not renewed) |
| 13 MISSION CONTROL | 23 NASA films, 1959-1975 | NASA, at the Internet Archive | public domain (US government work) |
- The street's and the cart's surfaces and the things left on the pavement: Poly Haven, CC0 (`tools/sushi-assets.py`; colour pictures only, made 512 or 256 px JPEG; the models thinned with `tools/hide-slim.cjs`, their pictures 256 px):

| What | File | Author, source | Licence |
|---|---|---|---|
| Brick Wall 001 | `data/sushi/tex/brick_red.jpg` | Rob Tuytel, Dimitrios Savva, https://polyhaven.com/a/brick_wall_001 | CC0 |
| Large Red Bricks | `data/sushi/tex/brick_orange.jpg` | Rob Tuytel, https://polyhaven.com/a/large_red_bricks | CC0 |
| Brown Brick 02 | `data/sushi/tex/brick_brown.jpg` | Rob Tuytel, https://polyhaven.com/a/brown_brick_02 | CC0 |
| Brick Wall 10 | `data/sushi/tex/brick_dark.jpg` | Dimitrios Savva, https://polyhaven.com/a/brick_wall_10 | CC0 |
| Painted Worn Brick | `data/sushi/tex/brick_painted.jpg` | Dimitrios Savva, https://polyhaven.com/a/painted_worn_brick | CC0 |
| Concrete Wall 008 | `data/sushi/tex/concrete.jpg` | Dario Barresi, Charlotte Baglioni, https://polyhaven.com/a/concrete_wall_008 | CC0 |
| Dirty Concrete | `data/sushi/tex/concrete_dirty.jpg` | Rob Tuytel, https://polyhaven.com/a/dirty_concrete | CC0 |
| Asphalt 02 | `data/sushi/tex/asphalt.jpg` | Rob Tuytel, https://polyhaven.com/a/asphalt_02 | CC0 |
| Asphalt Pit Lane (the street) | `data/sushi/tex/asphalt_road.jpg` | Dimitrios Savva, https://polyhaven.com/a/asphalt_pit_lane | CC0 |
| Aerial Asphalt 01 (its old patches) | `data/sushi/tex/asphalt_old.jpg` | Rob Tuytel, https://polyhaven.com/a/aerial_asphalt_01 | CC0 |
| Concrete Pavement | `data/sushi/tex/paving.jpg` | Charlotte Baglioni, https://polyhaven.com/a/concrete_pavement | CC0 |
| Painted Metal Shutter | `data/sushi/tex/shutter.jpg` | Dario Barresi, Rico Cilliers, Charlotte Baglioni, https://polyhaven.com/a/painted_metal_shutter | CC0 |
| Rusted Shutter | `data/sushi/tex/shutter_rust.jpg` | Dimitrios Savva, https://polyhaven.com/a/rusted_shutter | CC0 |
| Corrugated Iron | `data/sushi/tex/corrugated.jpg` | Jenelle van Heerden, Dimitrios Savva, https://polyhaven.com/a/corrugated_iron | CC0 |
| Long White Tiles | `data/sushi/tex/tile_white.jpg` | Jenelle van Heerden, Sergej Majboroda, https://polyhaven.com/a/long_white_tiles | CC0 |
| Japanese Cedar Bark (the street trees) | `data/sushi/tex/bark.jpg` | Charlotte Baglioni, https://polyhaven.com/a/japanese_cedar_bark | CC0 |
| Weathered Brown Planks | `data/sushi/tex/wood.jpg` | Dimitrios Savva, Rico Cilliers, https://polyhaven.com/a/weathered_brown_planks | CC0 |
| Dark Wooden Planks | `data/sushi/tex/wood_dark.jpg` | Amal Kumar, https://polyhaven.com/a/dark_wooden_planks | CC0 |
| Hinoki Planks | `data/sushi/tex/wood_light.jpg` | Charlotte Baglioni, https://polyhaven.com/a/hinoki_planks | CC0 |
| Wood Table Worn (the worn counter tops) | `data/sushi/tex/wood_counter.jpg` | Dimitrios Savva, Rico Cilliers, https://polyhaven.com/a/wood_table_worn | CC0 |
| Terry Cloth | `data/sushi/tex/cloth.jpg` | colormass, Rico Cilliers, https://polyhaven.com/a/terry_cloth | CC0 |
| Metal Trash Can | `data/sushi/m/metal_trash_can.glb` | GurJas Studios, https://polyhaven.com/a/metal_trash_can | CC0 |
| Cardboard Box 01 | `data/sushi/m/cardboard_box_01.glb` | Rahul Chaudhary, https://polyhaven.com/a/cardboard_box_01 | CC0 |
| Trashbag | `data/sushi/m/trashbag.glb` | Benny Weimer, https://polyhaven.com/a/trashbag | CC0 |
| Plastic Crate 02 | `data/sushi/m/plastic_crate_02.glb` | Fabi_G, https://polyhaven.com/a/plastic_crate_02 | CC0 |
| Utility Box 01 | `data/sushi/m/utility_box_01.glb` | James Ray Cock, https://polyhaven.com/a/utility_box_01 | CC0 |
| Exterior Aircon Unit | `data/sushi/m/exterior_aircon_unit.glb` | Monsta3D, https://polyhaven.com/a/exterior_aircon_unit | CC0 |
| Television 01 (the cart's set, the shop window's) | `data/sushi/m/television_01.glb` | Gabriel Radić, https://polyhaven.com/a/Television_01 | CC0 |
| Television 02 (the shop window's) | `data/sushi/m/television_02.glb` | Benny Weimer, https://polyhaven.com/a/television_02 | CC0 |
| Boombox | `data/sushi/m/boombox.glb` | Thomas Paul Mouilleron, https://polyhaven.com/a/boombox | CC0 |
| Cash Register 01 (the till on the back counter) | `data/sushi/m/cashregister_01.glb` | Joe Seabuhr, https://polyhaven.com/a/CashRegister_01 | CC0 |
| Hanging Industrial Lamp (the work lights' shades) | `data/sushi/m/hanging_industrial_lamp.glb` | Poly Haven, https://polyhaven.com/a/hanging_industrial_lamp | CC0 |
| Wooden Cutting Board | `data/sushi/m/wooden_cutting_board.glb` | Kuutti Siitonen, https://polyhaven.com/a/wooden_cutting_board | CC0 |
| Ginger (by the board) | `data/sushi/m/food_ginger_01.glb` | Oliver Harries, https://polyhaven.com/a/food_ginger_01 | CC0 |
| Propane Tank (the stove's gas bottles) | `data/sushi/m/propane_tank.glb` | Poly Haven, https://polyhaven.com/a/propane_tank | CC0 |

- The till's money (`data/sushi/money/`): United States government pictures, public domain. The $5, $10 and $20 (their 1985 designs) and the $1's back: the Bureau of Engraving and Printing's, https://www.uscurrency.gov (`tools/sushi-assets.py money`; its specimen pictures, faintly overprinted SPECIMEN). The $1's front and the quarter, dime and penny: Bureau of Engraving and Printing and United States Mint pictures from Wikimedia Commons.
- The sounds (`data/sushi/snd/`): recordings from OpenGameArt, CC0, and fifteen ElevenLabs sound effects (generated on the owner's account, 19 Nov 2026; `tools/sushi-sfx.py`), all listed in `docs/sushi-sounds.md`.
- Everything else (the cart, the tenements and their shopfronts, the rooms behind their glass, signs, murals and graffiti, the subway stair, the street's furniture, the avenues' houses, the skyline, the food, the other sounds) is made in the page's own code.
- Archived: the 1860s village (`archive/ramen-village/`), the outbreak (`archive/ramen-outbreak/`), the Polyfork cast (`archive/ramen-polyfork/`), YATAI '86's unused street things (`archive/ramen-yatai/`).
- The street (`data/sushi/corner.json`, `corner.bin`): THE MARKET's own Market St and West St corner, read out of the market's page (`tools/ramen-corner.cjs`); what the market credits there applies. The market's own people (`data/sushi/folk.json`, `tools/ramen-folk.cjs`): the market's bodies; the mushroom seller's skull is the market's scanned one (`data/skull.json`). The kei van: Polyfork's (`kei-van-211ed5`, `tools/sushi-cars.cjs`).
- The octopus's piece (`data/sushi/snd/busker.mp3`): Twelve Monferrine: No. 9, F. Knjze, from the Mutopia Project (Public Domain), https://www.mutopiaproject.org/ftp/KnjzeF/knjze12monferI/knjze12monferI.mid, played by the market's own guitar (FreePats' Spanish classical guitar, CC0) and recorded from it.
- Archived: the East 1st Street block (`archive/ramen-east-1st/`).
