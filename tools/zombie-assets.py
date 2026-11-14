# fetches EYES DOWN's pictures and models from Poly Haven (CC0): python3 tools/zombie-assets.py  ->  data/zombie/tex/*.jpg, data/zombie/m/*.glb (credits in docs/zombie-credits.md)
import io, json, os, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/zombie/'
TEX = ['herringbone_parquet', 'plastered_wall_04', 'dark_paneled_wood', 'long_white_tiles', 'fabric_pattern_05', 'poly_wool_herringbone', 'rusty_painted_metal', 'interior_tiles', 'painted_plaster_wall', 'brown_leather', 'concrete_wall_006']
MODELS = {'television_02': 1024, 'vintage_microwave': 512, 'electric_stove': 1024, 'sofa_02': 1024, 'mid_century_lounge_chair': 1024, 'boombox': 512, 'desk_lamp_arm_01': 512,
          'old_bed_frame': 1024, 'ClassicNightstand_01': 512, 'alarm_clock_01': 512, 'wall_clock': 512, 'modern_ceiling_lamp_01': 512, 'throw_pillows_01': 512, 'potted_plant_02': 512,
          'round_wooden_table_01': 512, 'dining_chair_02': 512, 'pot_enamel_01': 512, 'jug_01': 512, 'long_life_food': 512, 'book_encyclopedia_set_01': 512,
          'ornate_mirror_01': 512, 'hanging_picture_frame_02': 512, 'modern_wooden_cabinet': 1024, 'food_apple_01': 256, 'wooden_bowl_01': 256, 'Ottoman_01': 512, 'cassette_player': 256, 'vintage_electric_kettle': 512, 'painted_wooden_cabinet': 512}

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
    for k, n in (('Diffuse' if 'Diffuse' in F else 'col_01', 'd'), ('nor_gl', 'n'), ('arm', 'a')):
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), 512 if n == 'a' else 1024, 78))   # roughness and shade are soft things: half the size is enough
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only: continue
    model(s, z)
