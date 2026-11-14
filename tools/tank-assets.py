# fetches HULL DOWN's sky, surfaces and models from Poly Haven (all CC0): python3 tools/tank-assets.py [sky|tex|m|name ...]  ->  data/tank/sky/*.jpg + sky.json, tex/*.jpg, and the models as they come into data/full/tank/ (credits in docs/tank-credits.md); then node tools/tank-bake.cjs
import io, json, os, struct, sys, math, urllib.request
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

API, OUT, RAW = 'https://api.polyhaven.com/files/', 'data/tank/', 'data/full/tank/'
SKY = 'kloppenheim_06_puresky'
TEX = {'leafy_grass': 1024, 'sparse_grass': 1024, 'farm_soil': 1024, 'green_metal_rust': 1024, 'metal_plate': 1024, 'fabric_leather_02': 512}
MODELS = {'island_tree_01': 1024, 'island_tree_02': 1024, 'island_tree_03': 1024, 'tree_small_02': 1024, 'jacaranda_tree': 1024, 'shrub_02': 512, 'rock_moss_set_01': 512,
          'industrial_caged_sconce': 512, 'modular_industrial_pipes_01': 512, 'ammo_box': 512, 'binoculars': 512}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=300).read()

def jpg(data, size, q=80):
    im = Image.open(io.BytesIO(data)); alpha = im.mode in ('RGBA', 'LA', 'P') and 'A' in im.convert('RGBA').getbands() and im.convert('RGBA').getextrema()[3][0] < 250
    im = im.convert('RGBA' if alpha else 'RGB')
    if max(im.size) > size: im = im.resize((size, size * im.size[1] // im.size[0]), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True) if alpha else im.save(b, 'JPEG', quality=q, optimize=True); return b.getvalue(), 'image/png' if alpha else 'image/jpeg'

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
        d, mime = jpg(get(inc[im['uri']]['url']), size); o = add(d); views.append({'buffer': 0, 'byteOffset': o, 'byteLength': len(d)})
        del im['uri']; im['bufferView'] = len(views) - 1; im['mimeType'] = mime
    G['bufferViews'] = views; G['buffers'] = [{'byteLength': off}]
    tris = sum(G['accessors'][p['indices']]['count'] // 3 for m in G['meshes'] for p in m['primitives'] if 'indices' in p)
    J = pad(json.dumps(G, separators=(',', ':')).encode(), b' '); B = b''.join(chunks)
    with open(RAW + slug.lower() + '.glb', 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, 28 + len(J) + len(B)) + struct.pack('<I4s', len(J), b'JSON') + J + struct.pack('<I4s', len(B), b'BIN\0') + B)
    print(slug, tris, 'tris', (28 + len(J) + len(B)) // 1024, 'KB', flush=True)

for d in (OUT + 'sky', OUT + 'tex', RAW): os.makedirs(d, exist_ok=True)
only = sys.argv[1:]
if not only or 'sky' in only:   # the sky's picture; where its sun stands and the colour at its horizon, for the light and the haze
    im = Image.open(io.BytesIO(get(json.loads(get(API + SKY))['tonemapped']['url']))).convert('RGB').resize((4096, 2048), Image.LANCZOS)
    im.crop((0, 0, 4096, 1152)).save(OUT + 'sky/sky.jpg', 'JPEG', quality=86, optimize=True); im.resize((1024, 512), Image.LANCZOS).save(OUT + 'sky/sky_s.jpg', 'JPEG', quality=84, optimize=True)
    sm = im.resize((256, 128), Image.BOX); px = sm.load(); best = (-1, 0, 0)
    for y in range(64):
        for x in range(256):
            r, g, b = px[x, y]; l = r + g + b
            if l > best[0]: best = (l, x, y)
    hz = [sum(px[x, 61][c] for x in range(256)) / 256 / 255 for c in range(3)]; top = [sum(px[x, 8][c] for x in range(256)) / 256 / 255 for c in range(3)]
    info = {'slug': SKY, 'phi': round((best[1] + 0.5) / 256 * 2 * math.pi - math.pi, 3), 'el': round((0.5 - (best[2] + 0.5) / 128) * math.pi, 3), 'hor': [round(v, 3) for v in hz], 'top': [round(v, 3) for v in top], 'cut': 1152 / 2048}
    json.dump(info, open(OUT + 'sky/sky.json', 'w')); print('sky', info, flush=True)
for s, z in TEX.items():
    if only and s not in only and 'tex' not in only: continue
    F = json.loads(get(API + s))
    for k, n in (('Diffuse', 'd'), ('nor_gl', 'n'), ('arm', 'a')):
        open(OUT + 'tex/' + s + '_' + n + '.jpg', 'wb').write(jpg(get(F[k]['1k']['jpg']['url']), z // 2 if n == 'a' else z, 78)[0])
    print(s, flush=True)
for s, z in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    try: model(s, z)
    except Exception as e: print(s, 'FAILED', e, flush=True)
