# fetches THE GUEST LIST's pictures and models from Poly Haven (CC0): python3 tools/guests-assets.py [name ...]  ->  data/guests/tex/*.jpg, data/guests/m/*.glb (credits in docs/guests-credits.md)
import io, json, os, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/guests/'
TEX = ['herringbone_parquet', 'old_wood_floor', 'marble_tiles', 'floor_tiles_06', 'monastery_stone_floor', 'slate_floor_02', 'dirty_carpet', 'velour_velvet', 'quatrefoil_jacquard_fabric', 'decrepit_wallpaper', 'fabric_pattern_07', 'dark_paneled_wood', 'wooden_panels', 'painted_plaster_wall', 'plastered_wall_04', 'beige_wall_001', 'castle_brick_07', 'large_sandstone_blocks', 'roof_slates_02', 'gravel_floor_02', 'brown_mud_leaves_01', 'leafy_grass', 'ceiling_interior', 'white_plaster_02', 'square_tiled_wall', 'marble_mosaic_tiles', 'dark_wood', 'rosewood_veneer1', 'fine_grained_wood', 'brown_leather', 'leather_red_02', 'marble_01', 'rusty_metal_02', 'cobblestone_floor_04', 'wood_table_worn']
MODELS = {'Chandelier_01': 1024, 'Chandelier_02': 1024, 'Chandelier_03': 1024, 'Sofa_01': 1024, 'sofa_02': 1024, 'sofa_03': 1024, 'ArmChair_01': 1024, 'GothicBed_01': 1024, 'GothicCabinet_01': 1024, 'GothicCommode_01': 1024, 'vintage_cabinet_01': 1024, 'wooden_bookshelf_worn': 1024, 'vintage_grandfather_clock_01': 1024, 'dining_table': 1024, 'WoodenTable_01': 1024, 'WoodenTable_02': 1024, 'wooden_display_shelves_01': 1024, 'electric_stove': 1024, 'large_iron_gate': 1024, 'covered_car': 1024, 'ClassicConsole_01': 1024, 'chinese_screen_panels': 1024, 'fancy_picture_frame_01': 1024, 'fancy_picture_frame_02': 1024, 'marble_bust_01': 1024, 'gothic_statue': 1024, 'horse_statue_01': 1024, 'wine_barrel_01': 1024, 'scandinavian_masonry_heater': 1024, 'lantern_chandelier_01': 512, 'GreenChair_01': 512, 'Ottoman_01': 512, 'Rockingchair_01': 512, 'WoodenChair_01': 512, 'dining_chair_02': 512, 'WoodenTable_03': 512, 'CoffeeTable_01': 512, 'gothic_coffee_table': 512, 'coffee_table_round_01': 512, 'round_wooden_table_01': 512, 'side_table_01': 512, 'side_table_tall_01': 512, 'ClassicNightstand_01': 512, 'Shelf_01': 512, 'mantel_clock_01': 512, 'ornate_mirror_01': 512, 'hanging_picture_frame_01': 512, 'hanging_picture_frame_02': 512, 'hanging_picture_frame_03': 512, 'standing_picture_frame_01': 512, 'bull_head': 512, 'lion_head': 512, 'antique_ceramic_vase_01': 512, 'ceramic_vase_01': 512, 'ceramic_vase_02': 512, 'ceramic_vase_03': 512, 'brass_vase_01': 512, 'brass_vase_03': 512, 'brass_candleholders': 512, 'wooden_candlestick': 512, 'brass_goblets': 512, 'tea_set_01': 512, 'chess_set': 512, 'book_encyclopedia_set_01': 512, 'decorative_book_set_01': 512, 'vintage_oil_lamp': 512, 'Lantern_01': 512, 'desk_lamp_arm_01': 512, 'potted_plant_01': 512, 'potted_plant_02': 512, 'potted_plant_04': 512, 'planter_pot_clay': 512, 'wine_bottles_01': 512, 'wooden_barrels_01': 512, 'Barrel_01': 512, 'wooden_crate_01': 512, 'wooden_crate_02': 512, 'treasure_chest': 512, 'vintage_suitcase': 512, 'wicker_basket_01': 512, 'carrot_cake': 512, 'strawberry_chocolate_cake': 512, 'croissant': 512, 'food_apple_01': 512, 'bananas': 512, 'lemon': 512, 'wooden_bowl_01': 512, 'brass_pan_01': 512, 'brass_pot_01': 512, 'pot_enamel_01': 512, 'wooden_cutting_board': 512, 'fish_knife': 512, 'wooden_spoon': 512, 'jug_01': 512, 'metal_jug': 512, 'vintage_telephone_wall_clock': 512, 'cigarette_case': 512, 'vintage_lighter': 512, 'pocket_watch': 512, 'magnifying_glass_01': 512, 'antique_estoc': 512, 'katana_stand_01': 512, 'antique_katana_01': 512, 'ornate_medieval_dagger': 512, 'ornate_medieval_mace': 512, 'kite_shield': 512, 'bolt_action_rifle_7_62': 512, 'hatchet': 512, 'wooden_axe': 512, 'cross_pein_hammer': 512, 'crowbar_01': 512, 'rusted_spade_01': 512, 'watering_can_metal_01': 512, 'wooden_bucket_01': 512, 'street_lamp_01': 512, 'painted_wooden_bench': 512, 'concrete_cat_statue': 512, 'stone_fire_pit': 512, 'vintage_binocular': 512, 'round_spectacles': 512, 'planter_box_01': 512, 'shrub_01': 512, 'wooden_ladder_02': 512, 'metal_toolbox': 512, 'plunger': 512, 'throw_pillows_01': 512, 'modern_arm_chair_01': 512, 'chinese_tea_table': 512, 'brass_pot_02': 512, 'horse_head': 512, 'wooden_stool_01': 512, 'medical_box': 512}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'asset-fetch'}), timeout=120).read()

def jpg(data, size, q=80):
    im = Image.open(io.BytesIO(data)).convert('RGB')
    if max(im.size) > size: im = im.resize((size, size * im.size[1] // im.size[0]), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return b.getvalue()

def pad(b, c=b'\0'):
    return b + c * (-len(b) % 4)

def model(slug, size):
    F = json.loads(get(API + slug))['gltf']['1k']['gltf']
    G = json.loads(get(F['url'])); inc = F['include']; chunks = []; off = 0
    def add(b):
        nonlocal off
        b = pad(b); chunks.append(b); o = off; off += len(b); return o
    views = G.get('bufferViews', []); bufs = [get(inc[b['uri']]['url']) for b in G['buffers']]
    start = [add(b) for b in bufs]
    for v in views: v['byteOffset'] = v.get('byteOffset', 0) + start[v['buffer']]; v['buffer'] = 0
    for im in G.get('images', []):
        d = jpg(get(inc[im['uri']]['url']), size); o = add(d); views.append({'buffer': 0, 'byteOffset': o, 'byteLength': len(d)})
        del im['uri']; im['bufferView'] = len(views) - 1; im['mimeType'] = 'image/jpeg'
    G['bufferViews'] = views; G['buffers'] = [{'byteLength': off}]
    tris = sum(G['accessors'][p['indices']]['count'] // 3 for m in G['meshes'] for p in m['primitives'] if 'indices' in p)
    J = pad(json.dumps(G, separators=(',', ':')).encode(), b' '); B = b''.join(chunks)
    with open(OUT + 'm/' + slug.lower() + '.glb', 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, 28 + len(J) + len(B)) + struct.pack('<I4s', len(J), b'JSON') + J + struct.pack('<I4s', len(B), b'BIN\0') + B)
    print(slug, tris, 'tris', (28 + len(J) + len(B)) // 1024, 'KB', flush=True)

os.makedirs(OUT + 'tex', exist_ok=True); os.makedirs(OUT + 'm', exist_ok=True)
only = sys.argv[1:]
for s in TEX:
    if only and s not in only: continue
    try: F = json.loads(get(API + s))
    except Exception as e: print('FAILED', s, e, flush=True); continue
    dk = next((k for k in ('Diffuse', 'col_01', 'col_1', 'diff', 'coll1_01') if k in F), None) or next(k for k in F if k.lower().startswith(('col', 'diff')))
    if os.path.exists(OUT + 'tex/' + s + '_a.jpg') and not only: continue
    for k, n in ((dk, 'd'), ('nor_gl', 'n'), ('arm', 'a')):
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), 512 if n == 'a' else 1024, 78))   # roughness and shade are soft things: half the size is enough
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only: continue
    if os.path.exists(OUT + 'm/' + s.lower() + '.glb') and not only: continue
    try: model(s, z)
    except Exception as e: print('FAILED', s, e, flush=True)
