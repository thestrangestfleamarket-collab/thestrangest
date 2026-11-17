# fetches THE GARAGE's garage (all CC0, Poly Haven): python3 tools/drums-assets.py [name ...]  ->  data/drums/tex/<name>_{c,n,r}.jpg (colour, normal, roughness),
# data/drums/m/*.glb (colour, normal and roughness pictures kept); credits in docs/drums-credits.md;
# then the node tools/hide-slim.cjs line it prints
import io, json, os, struct, sys, urllib.request
from PIL import Image
exec('def get(' + open('tools/sushi-assets.py').read().split('def get(')[1].split('def model(')[0])   # get, jpg, pic, pad: the ramen cart's own
API, OUT = 'https://api.polyhaven.com/files/', 'data/drums/'
exec('def small(' + open('tools/saloon-assets.py').read().split('def small(')[1].split("for d in ('tex'")[0])   # small, model: the saloon's own
# our name: (Poly Haven's, colour pixels)
TEX = {'floor': ('garage_floor', 512), 'block': ('dark_brick_wall', 512), 'ply': ('plywood', 512), 'carpet': ('dirty_carpet', 512), 'door': ('painted_metal_shutter', 512),
       'drive': ('concrete_floor_worn_001', 512), 'paint': ('rusty_painted_metal', 512), 'fence': ('weathered_brown_planks', 512), 'brick': ('red_brick_03', 512), 'fabric': ('denim_fabric_04', 512), 'grass': ('leafy_grass', 512)}
# Poly Haven's: (picture pixels, triangles after slimming)
MODELS = {'steel_frame_shelves_01': (256, 1800), 'steel_frame_shelves_02': (256, 1800), 'metal_tool_chest': (256, 2500), 'metal_toolbox': (256, 1200), 'bench_vice_01': (256, 1500), 'Drill_01': (256, 1200),
          'adjustable_wrench': (256, 400), 'combination_wrench': (256, 300), 'cross_pein_hammer': (256, 400), 'handsaw_wood': (256, 400), 'pipe_wrench': (256, 500), 'ratchet_wrench': (256, 400),
          'boombox': (256, 2500), 'cardboard_box_01': (256, 600), 'plastic_crate_01': (256, 1200), 'plastic_crate_02': (256, 1200), 'metal_jerrycan': (256, 900), 'plastic_jerrycan': (256, 800),
          'propane_tank': (256, 1000), 'spray_paint_bottles': (256, 1200), 'lubricant_spray': (256, 400), 'small_oil_can_01': (256, 500), 'tire_pump': (256, 700), 'garden_hose_wall_mounted_01': (256, 2500),
          'korean_fire_extinguisher_01': (256, 1200), 'ladder_sectioned_01': (256, 1200), 'metal_trash_can': (256, 1200), 'trashbag': (256, 800), 'plastic_broom': (256, 600),
          'mounted_fluorescent_lights': (256, 600), 'hanging_industrial_lamp': (256, 1200), 'power_box_01': (256, 1000), 'utility_box_01': (256, 800), 'Television_01': (256, 1500), 'Sofa_01': (256, 2500),
          'wall_clock': (256, 800), 'metal_stool_01': (256, 800), 'desk_lamp_arm_01': (256, 1500), 'bleach_bottle': (256, 400), 'plastic_bottle_gallon': (256, 400), 'wooden_ladder': (256, 500),
          'watering_can_metal_01': (256, 900), 'american_football': (256, 400), 'old_military_crate': (256, 600), 'wooden_crate_02': (256, 600), 'tool_cart': (256, 2000), 'cassette_player': (256, 1000),
          'potted_plant_01': (256, 2500), 'potted_plant_04': (256, 2500), 'planter_box_01': (256, 1500), 'worn_metal_rack': (256, 1200), 'industrial_wall_lamp': (256, 900), 'can_rusted': (256, 300), 'multi_cleaner_bottle': (256, 400)}
for d in ('tex', 'm'): os.makedirs(OUT + d, exist_ok=True)
only = sys.argv[1:]
for name, (s, z) in TEX.items():
    if only and name not in only and 'tex' not in only: continue
    F = json.loads(get(API + s))
    for key, suf, px, grey in (('Diffuse', 'c', z, False), ('nor_gl', 'n', z // 2, False), ('Rough', 'r', z // 2, True)):
        if key not in F: continue
        d = small(get(F[key]['1k']['jpg']['url']), px, grey); open(OUT + 'tex/' + name + '_' + suf + '.jpg', 'wb').write(d); print(name, s, suf, len(d) // 1024, 'KB', flush=True)
for s, (z, t) in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    try: model(s, z)
    except Exception as e: print('FAILED', s, e, flush=True)
print("then: node tools/hide-slim.cjs data/drums/m '" + json.dumps({k.lower(): v[1] for k, v in MODELS.items()}) + "'")
