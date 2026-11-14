# fetches COLD BORE's skies, surfaces and models (all CC0): python3 tools/sniper-assets.py [name ...]  ->  data/sniper/sky/*.jpg + sky.json, tex/*.jpg, m/*.glb (credits in docs/sniper-credits.md); then node tools/hide-slim.cjs data/sniper/m (the line at the end prints it)
import io, json, os, struct, sys, math, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/sniper/'
SKY = {'noon': 'kloofendal_48d_partly_cloudy_puresky', 'day': 'kloofendal_43d_clear_puresky', 'dusk': 'qwantani_dusk_2_puresky', 'rain': 'kloofendal_overcast_puresky', 'dawn': 'qwantani_sunrise_puresky'}
TEX = ['asphalt_02', 'rectangular_paving', 'aerial_grass_rock', 'hessian_230', 'container_side', 'corrugated_iron', 'wood_floor_deck', 'concrete_floor_02', 'painted_concrete', 'brick_wall_001', 'grey_plaster_02', 'aerial_rocks_02']
MODELS = {'ammo_box': 512, 'concrete_road_barrier': 512, 'street_lamp_01': 256, 'covered_car': 512, 'ocean_buoy': 512, 'old_military_crate': 512, 'binoculars': 512, 'Barrel_01': 256, 'wooden_crate_02': 256, 'metal_trash_can': 256, 'fire_hydrant': 256, 'potted_plant_04': 256, 'old_tyre': 256, 'metal_jerrycan_green': 256, 'painted_wooden_bench': 256, 'wooden_picnic_table': 256, 'cardboard_box_01': 256, 'propane_tank': 256}
SLIM = {'concrete_road_barrier': 700, 'street_lamp_01': 1500, 'covered_car': 4000, 'ocean_buoy': 2500, 'old_military_crate': 3000, 'binoculars': 3000, 'barrel_01': 500, 'wooden_crate_02': 300, 'metal_trash_can': 500, 'fire_hydrant': 500, 'potted_plant_04': 900, 'old_tyre': 400, 'metal_jerrycan_green': 400, 'painted_wooden_bench': 500, 'wooden_picnic_table': 500, 'cardboard_box_01': 200, 'propane_tank': 400}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=180).read()

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

for d in ('sky', 'tex', 'm'): os.makedirs(OUT + d, exist_ok=True)
only = sys.argv[1:]
info = json.load(open(OUT + 'sky/sky.json')) if os.path.exists(OUT + 'sky/sky.json') else {}
for k, s in SKY.items():   # each sky's tonemapped picture; where its sun stands and the colour at its horizon, for the light and the haze
    if only and k not in only and 'sky' not in only: continue
    im = Image.open(io.BytesIO(get(json.loads(get(API + s))['tonemapped']['url']))).convert('RGB').resize((4096, 2048), Image.LANCZOS); im.save(OUT + 'sky/' + k + '.jpg', 'JPEG', quality=84, optimize=True); im.resize((1024, 512), Image.LANCZOS).save(OUT + 'sky/' + k + '_s.jpg', 'JPEG', quality=84, optimize=True)   # the small one lights the place
    sm = im.resize((256, 128), Image.BOX); px = sm.load(); best = (-1, 0, 0)
    for y in range(64):
        for x in range(256):
            r, g, b = px[x, y]; l = r + g + b
            if l > best[0]: best = (l, x, y)
    hz = [sum(px[x, 61][c] for x in range(256)) / 256 / 255 for c in range(3)]; top = [sum(px[x, 8][c] for x in range(256)) / 256 / 255 for c in range(3)]
    info[k] = {'slug': s, 'phi': round((best[1] + 0.5) / 256 * 2 * math.pi - math.pi, 3), 'el': round((0.5 - (best[2] + 0.5) / 128) * math.pi, 3), 'hor': [round(v, 3) for v in hz], 'top': [round(v, 3) for v in top]}; print(k, info[k], flush=True)
json.dump(info, open(OUT + 'sky/sky.json', 'w'))
for s in TEX:
    if only and s not in only and 'tex' not in only: continue
    F = json.loads(get(API + s))
    for k, n in (('Diffuse', 'd'), ('nor_gl', 'n'), ('arm', 'a')):
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), 512 if n == 'a' else 1024, 78))
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    model(s, z)
print("then: node tools/hide-slim.cjs data/sniper/m '" + json.dumps(SLIM) + "'")
