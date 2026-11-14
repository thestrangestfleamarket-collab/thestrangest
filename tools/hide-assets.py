# fetches THE ALLEY's pictures and models from Poly Haven (CC0): python3 tools/hide-assets.py  ->  data/hide/tex/*.jpg, data/hide/m/*.glb (credits in docs/hide-credits.md)
import io, json, os, struct, sys, urllib.request
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/hide/'
TEX = ['red_brick_03', 'dark_brick_wall', 'asphalt_02', 'green_metal_rust', 'rusty_metal_02', 'corrugated_iron_02', 'weathered_planks', 'dirty_carpet', 'hessian_230', 'dirty_concrete']
MODELS = {'metal_trash_can': 512, 'trashbag': 512, 'cardboard_box_01': 1024, 'old_tyre': 512, 'Barrel_01': 512, 'barrel_03': 512, 'exterior_aircon_unit': 512,
          'utility_box_01': 512, 'industrial_wall_lamp': 256, 'rollershutter_door': 1024, 'sofa_02': 1024,
          'industrial_pastic_container': 512, 'cement_bag': 512, 'wooden_crate_02': 512, 'security_light': 256, 'water_manhole_cover': 512, 'rusted_wheel_rim_01': 512}

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
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), 1024, 78))
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only: continue
    model(s, z)
