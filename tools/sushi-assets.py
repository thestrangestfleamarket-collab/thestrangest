# fetches YATAI '86's photographed surfaces and street props (all CC0, Poly Haven): python3 tools/sushi-assets.py [name ...]  ->  data/sushi/tex/*.jpg (colour only), data/sushi/m/*.glb, and the car from COLD BORE (tools/sniper-vehicles.py); credits in docs/sushi-credits.md; then node tools/hide-slim.cjs data/sushi/m (the line at the end prints it)
import io, json, os, shutil, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/sushi/'
# our name: (Poly Haven's, pixels)
TEX = {'brick_red': ('brick_wall_001', 512), 'brick_orange': ('large_red_bricks', 512), 'brick_brown': ('brown_brick_02', 512), 'brick_dark': ('brick_wall_10', 512), 'brick_painted': ('painted_worn_brick', 512),
       'plaster': ('grey_plaster_02', 512), 'plaster_worn': ('worn_plaster_wall', 512), 'concrete': ('concrete_wall_008', 512), 'concrete_dirty': ('dirty_concrete', 512),
       'asphalt': ('asphalt_02', 512), 'paving': ('concrete_pavement', 512), 'shutter': ('painted_metal_shutter', 512), 'shutter_rust': ('rusted_shutter', 256), 'corrugated': ('corrugated_iron', 512), 'rust': ('rusty_metal_02', 256),
       'wood': ('weathered_brown_planks', 512), 'wood_dark': ('dark_wooden_planks', 512), 'wood_light': ('hinoki_planks', 512), 'tile_brown': ('rectangular_facade_tiles_02', 512), 'tile_white': ('long_white_tiles', 512)}
MODELS = {'metal_trash_can': 256, 'cardboard_box_01': 256, 'potted_plant_02': 256, 'potted_plant_04': 256, 'trashbag': 256, 'plastic_crate_02': 256, 'utility_box_01': 256, 'exterior_aircon_unit': 256}
SLIM = {'metal_trash_can': 500, 'cardboard_box_01': 200, 'potted_plant_02': 900, 'potted_plant_04': 700, 'trashbag': 300, 'plastic_crate_02': 900, 'utility_box_01': 300, 'exterior_aircon_unit': 700}
MODELS['CashRegister_01'] = 512; SLIM['cashregister_01'] = 4000   # the till on the back counter (its drawer is drawn open in the model)

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=180).read()

def jpg(data, size, q=80):
    im = Image.open(io.BytesIO(data)).convert('RGB')
    if max(im.size) > size: im = im.resize((size, size * im.size[1] // im.size[0]), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return b.getvalue()

def pic(data, size):   # a model's picture: JPEG, or a small-palette PNG when it has holes (leaves, a crate's lattice)
    im = Image.open(io.BytesIO(data))
    if im.mode in ('RGBA', 'LA', 'P') and im.convert('RGBA').getchannel('A').getextrema()[0] < 200:
        b = io.BytesIO(); im.convert('RGBA').resize((size, size), Image.LANCZOS).quantize(127, method=2).save(b, 'PNG', optimize=True); return b.getvalue(), 'image/png'
    return jpg(data, size), 'image/jpeg'

def pad(b, c=b'\0'):
    return b + c * (-len(b) % 4)

def model(slug, size):   # one .glb with only its colour picture, small
    F = json.loads(get(API + slug))['gltf']['1k']['gltf']
    G = json.loads(get(F['url'])); inc = F['include']; chunks = []; off = 0
    def add(b):
        nonlocal off
        b = pad(b); chunks.append(b); o = off; off += len(b); return o
    views = G.get('bufferViews', []); bufs = [get(inc[b['uri']]['url']) for b in G['buffers']]
    start = [add(b) for b in bufs]
    for v in views: v['byteOffset'] = v.get('byteOffset', 0) + start[v['buffer']]; v['buffer'] = 0
    keep = sorted({G['textures'][m['pbrMetallicRoughness']['baseColorTexture']['index']]['source'] for m in G.get('materials', []) if 'baseColorTexture' in m.get('pbrMetallicRoughness', {})})
    for m in G.get('materials', []):
        pb = m.get('pbrMetallicRoughness', {}); pb.pop('metallicRoughnessTexture', None)
        for k in ('normalTexture', 'occlusionTexture', 'emissiveTexture'): m.pop(k, None)
        if 'baseColorTexture' in pb: pb['baseColorTexture']['index'] = keep.index(G['textures'][pb['baseColorTexture']['index']]['source'])
    ims = []
    for i in keep:
        d, mime = pic(get(inc[G['images'][i]['uri']]['url']), size); o = add(d); views.append({'buffer': 0, 'byteOffset': o, 'byteLength': len(d)}); ims.append({'bufferView': len(views) - 1, 'mimeType': mime})
    G['images'] = ims; G['textures'] = [{'source': i} for i in range(len(ims))]; G.pop('samplers', None)
    G['bufferViews'] = views; G['buffers'] = [{'byteLength': off}]
    tris = sum(G['accessors'][p['indices']]['count'] // 3 for m in G['meshes'] for p in m['primitives'] if 'indices' in p)
    J = pad(json.dumps(G, separators=(',', ':')).encode(), b' '); B = b''.join(chunks)
    with open(OUT + 'm/' + slug.lower() + '.glb', 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, 28 + len(J) + len(B)) + struct.pack('<I4s', len(J), b'JSON') + J + struct.pack('<I4s', len(B), b'BIN\0') + B)
    print(slug, tris, 'tris', (28 + len(J) + len(B)) // 1024, 'KB', flush=True)

for d in ('tex', 'm'): os.makedirs(OUT + d, exist_ok=True)
only = sys.argv[1:]
for name, (s, z) in TEX.items():
    if only and name not in only and 'tex' not in only: continue
    d = jpg(get(json.loads(get(API + s))['Diffuse']['1k']['jpg']['url']), z); open(OUT + 'tex/' + name + '.jpg', 'wb').write(d); print(name, s, len(d) // 1024, 'KB', flush=True)
for s, z in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    model(s, z)
if not only or 'car' in only:   # the parked car is COLD BORE's (nander's VW Corrado, CC0), in its own red and, at 256 px, its black paint
    shutil.copyfile('data/sniper/m/car.glb', OUT + 'm/car.glb')
    for n in (3,): Image.open('data/sniper/tex/car_%d.jpg' % n).resize((256, 256), Image.LANCZOS).save(OUT + 'tex/car_%d.jpg' % n, quality=82, optimize=True)
if not only or 'money' in only:   # the till's money: the 1985 designs of the $5, $10, $20 and the $1's back, US government pictures (public domain) from uscurrency.gov; the $1's front and the coins are kept as they are in data/sushi/money
    os.makedirs(OUT + 'money', exist_ok=True); U = 'https://www.uscurrency.gov/sites/default/files/denominations/'
    for name, f in {'b1b': '1_1963-present-back', 'b5': '5_1993-2000-front_0', 'b5b': '5_1993-2000-back_0', 'b10': '10_1990-2000-front_0', 'b10b': '10_1990-2000-back_0', 'b20': '20_1990-1998-front_0', 'b20b': '20_1990-1998-back-ver2_0'}.items():
        Image.open(io.BytesIO(get(U + f + '.jpg'))).convert('RGB').resize((320, 136), Image.LANCZOS).save(OUT + 'money/' + name + '.jpg', quality=88); print(name, f, flush=True)
print("then: node tools/hide-slim.cjs data/sushi/m '" + json.dumps(SLIM) + "'")
