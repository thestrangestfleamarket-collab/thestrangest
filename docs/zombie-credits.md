# Eyes Down — asset credits

Everything the page loads is CC0 (public domain).

| Asset | Files | Author / source | Licence |
|---|---|---|---|
| Surfaces: herringbone parquet, plaster, painted plaster, dark wood panelling, long white tiles, interior tiles, fabric, wool rug, painted metal, leather, concrete | `data/zombie/tex/*_{d,n,a}.jpg` | Poly Haven, https://polyhaven.com/textures (`herringbone_parquet`, `plastered_wall_04`, `painted_plaster_wall`, `dark_paneled_wood`, `long_white_tiles`, `interior_tiles`, `fabric_pattern_05`, `poly_wool_herringbone`, `rusty_painted_metal`, `brown_leather`, `concrete_wall_006`) | CC0 |
| Models: television, microwave, electric stove, sofa, lounge chair, boombox, desk lamp, bed frame, nightstand, alarm clock, wall clock, ceiling lamp, throw pillows, potted plant, round table, dining chair, enamel pot, jug, cartons and tins, encyclopedias, ornate mirror, picture frame, wooden cabinet, apple, wooden bowl, ottoman, cassette player, electric kettle, painted cabinet | `data/zombie/m/*.glb` | Poly Haven, https://polyhaven.com/models (`television_02`, `vintage_microwave`, `electric_stove`, `sofa_02`, `mid_century_lounge_chair`, `boombox`, `desk_lamp_arm_01`, `old_bed_frame`, `ClassicNightstand_01`, `alarm_clock_01`, `wall_clock`, `modern_ceiling_lamp_01`, `throw_pillows_01`, `potted_plant_02`, `round_wooden_table_01`, `dining_chair_02`, `pot_enamel_01`, `jug_01`, `long_life_food`, `book_encyclopedia_set_01`, `ornate_mirror_01`, `hanging_picture_frame_02`, `modern_wooden_cabinet`, `food_apple_01`, `wooden_bowl_01`, `Ottoman_01`, `cassette_player`, `vintage_electric_kettle`, `painted_wooden_cabinet`) | CC0 |

Changes made: pictures resized to 1024 px or less and re-encoded as JPEG (`tools/zombie-assets.py`), heavier models thinned and their unused data dropped (`tools/zombie-slim.cjs`).

Libraries: three.js (MIT), Rapier (Apache 2.0). The visitors, the city outside, the rain on the glass, the walls, kitchen, bathroom, doors, telephone, radiator and blinds are made in code; every sound is made in code; voices are the browser's own.
