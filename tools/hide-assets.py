# fetches DEAD END's pictures and models from Poly Haven (CC0): python3 tools/hide-assets.py  ->  data/hide/tex/*.jpg, data/hide/m/*.glb, data/hide/sky.jpg (credits in docs/hide-credits.md)
import io, json, os, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/hide/'
TEX = ['beige_wall_001', 'ceiling_interior', 'herringbone_parquet', 'wood_floor_worn', 'floor_tiles_06', 'concrete_floor_02', 'concrete_block_wall', 'oak_veneer_01', 'velour_velvet', 'long_white_tiles', 'dirty_carpet', 'hessian_230', 'dark_brick_wall', 'asphalt_02', 'rusty_metal_02', 'metal_grate_rusty']
MODELS = {'painted_wooden_chair_01': 512, 'steel_frame_shelves_01': 512, 'wooden_bookshelf_worn': 512, 'drawer_cabinet': 512, 'Television_01': 512, 'wooden_broom': 256, 'metal_trash_can': 512, 'trashbag': 512, 'cardboard_box_01': 1024, 'sofa_02': 1024, 'wooden_crate_02': 512, 'power_box_01': 512, 'ceiling_fan': 256, 'vintage_suitcase': 256, 'ArmChair_01': 512, 'CoffeeTable_01': 256, 'ClassicConsole_01': 512, 'ClassicNightstand_01': 256, 'GothicCommode_01': 512, 'dining_table': 512, 'dining_chair_02': 256, 'vintage_grandfather_clock_01': 512, 'modern_ceiling_lamp_01': 256, 'desk_lamp_arm_01': 256, 'electric_stove': 512, 'boombox': 256, 'standing_picture_frame_01': 256, 'ornate_mirror_01': 512, 'rubber_duck_toy': 256, 'metal_tool_chest': 256, 'Rockingchair_01': 512, 'pull_chain_light_socket': 256, 'vintage_flashlight': 256}

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
