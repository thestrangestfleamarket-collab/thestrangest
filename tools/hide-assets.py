# fetches DEAD END's pictures and models from Poly Haven (CC0): python3 tools/hide-assets.py  ->  data/hide/tex/*.jpg, data/hide/m/*.glb, data/hide/sky.jpg (credits in docs/hide-credits.md)
import io, json, os, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/hide/'
TEX = ['peeling_painted_wall', 'damaged_plaster', 'tiled_floor_001', 'old_wood_floor', 'long_white_tiles', 'blue_metal_plate', 'worn_planks', 'dark_brick_wall', 'asphalt_02', 'green_metal_rust', 'rusty_metal_02', 'dirty_carpet', 'hessian_230', 'dirty_concrete', 'metal_grate_rusty']
MODELS = {'SchoolDesk_01': 512, 'painted_wooden_chair_01': 512, 'plastic_monobloc_chair_01': 256, 'steel_frame_shelves_01': 512, 'wooden_bookshelf_worn': 512, 'painted_wooden_cabinet': 512, 'drawer_cabinet': 512,
          'Television_01': 512, 'WoodenTable_01': 512, 'wooden_table_02': 512, 'metal_stool_02': 256, 'wooden_broom': 256, 'chemistry_set': 512, 'hanging_picture_frame_02': 256,
          'SchoolChair_01': 512, 'standing_chalkboard_01': 512, 'mounted_fluorescent_lights': 256, 'wall_clock': 256, 'fire_alarm': 256, 'korean_fire_extinguisher_01': 256, 'metal_office_desk': 512, 'WetFloorSign_01': 256,
          'office_notepads': 256, 'clipboard': 256, 'projector_screen': 256, 'vintage_microscope': 256, 'bunsen_burner': 256,
          'security_camera_01': 256, 'american_football': 256, 'wheelchair_01': 512, 'ceiling_fan': 256, 'plunger': 256, 'bleach_bottle': 256, 'vintage_microwave': 256, 'marble_bust_01': 256, 'vintage_suitcase': 256, 'medical_box': 256,
          'metal_trash_can': 512, 'trashbag': 512, 'cardboard_box_01': 1024, 'sofa_02': 1024, 'industrial_pastic_container': 512, 'wooden_crate_02': 512, 'utility_box_01': 512, 'industrial_wall_lamp': 256, 'security_light': 256, 'power_box_01': 512}

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
    F = json.loads(get(API + s))
    for k, n in (('Diffuse', 'd'), ('nor_gl', 'n'), ('arm', 'a')):
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), 512 if n == 'a' else 1024, 78))   # roughness and shade are soft things: half the size is enough
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only: continue
    model(s, z)
if not only or 'sky' in only:   # the night sky: Poly Haven's rogland_moonlit_night, its tonemapped picture at 4096 px
    im = Image.open(io.BytesIO(get(json.loads(get(API + 'rogland_moonlit_night'))['tonemapped']['url']))).convert('RGB').resize((4096, 2048), Image.LANCZOS); im.save(OUT + 'sky.jpg', 'JPEG', quality=84, optimize=True); print('sky')
