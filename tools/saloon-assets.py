# fetches THE LAST CHANCE's photographed surfaces, furniture and light (all CC0, Poly Haven): python3 tools/saloon-assets.py [name ...]  ->  data/saloon/tex/<name>_{c,n,r}.jpg (colour, normal, roughness), data/saloon/m/*.glb (colour, normal and roughness pictures kept), data/saloon/saloon.hdr (a photographed saloon's light); credits in docs/saloon-credits.md; then node tools/hide-slim.cjs data/saloon/m (the line at the end prints it)
import io, json, os, struct, sys, urllib.request
from PIL import Image
exec('def get(' + open('tools/sushi-assets.py').read().split('def get(')[1].split('def model(')[0])   # get, jpg, pic, pad: the ramen cart's own

API, OUT = 'https://api.polyhaven.com/files/', 'data/saloon/'
# our name: (Poly Haven's, colour pixels)
TEX = {'floor': ('old_wood_floor', 1024), 'wall': ('wood_plank_wall', 1024), 'planks': ('weathered_brown_planks', 1024), 'dark': ('dark_wooden_planks', 1024), 'walnut': ('european_walnut_veneer_04', 512),
       'paper': ('decrepit_wallpaper', 1024), 'velvet': ('velour_velvet', 512), 'leather': ('brown_leather', 512), 'dirt': ('dirt', 1024), 'rust': ('rusty_metal_02', 512), 'plate': ('metal_plate', 512), 'plaster': ('worn_plaster_wall', 512), 'siding': ('weathered_plank_siding', 1024)}
# Poly Haven's: (picture pixels, triangles after slimming)
MODELS = {'round_wooden_table_01': (512, 1400), 'WoodenTable_02': (512, 1500), 'WoodenChair_01': (512, 1100), 'wooden_stool_01': (512, 800), 'lantern_chandelier_01': (512, 2600), 'vintage_oil_lamp': (512, 1300),
          'Lantern_01': (512, 1500), 'wine_barrel_01': (512, 1100), 'wooden_crate_01': (512, 700), 'dartboard': (1024, 1200), 'ornate_mirror_01': (512, 2400), 'fancy_picture_frame_01': (512, 938),
          'hanging_picture_frame_01': (512, 800), 'vintage_grandfather_clock_01': (512, 3000), 'CashRegister_01': (512, 4000), 'wooden_bucket_01': (512, 700), 'brass_candleholders': (512, 1500), 'jug_01': (512, 800),
          'barrel_stove': (512, 2000), 'Rockingchair_01': (512, 2000), 'painted_wooden_bench': (512, 630), 'brass_pot_01': (256, 700), 'mantel_clock_01': (512, 1500), 'wooden_display_shelves_01': (512, 1500), 'hatchet': (256, 600)}

def small(data, size, grey=False):
    im = Image.open(io.BytesIO(data)).convert('L' if grey else 'RGB')
    if max(im.size) > size: im = im.resize((size, size * im.size[1] // im.size[0]), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=82, optimize=True); return b.getvalue()

def model(slug, size):   # one .glb with its colour, normal and roughness pictures, small
    F = json.loads(get(API + slug))['gltf']['1k']['gltf']
    G = json.loads(get(F['url'])); inc = F['include']; chunks = []; off = 0
    def add(b):
        nonlocal off
        b = pad(b); chunks.append(b); o = off; off += len(b); return o
    views = G.get('bufferViews', []); bufs = [get(inc[b['uri']]['url']) for b in G['buffers']]
    start = [add(b) for b in bufs]
    for v in views: v['byteOffset'] = v.get('byteOffset', 0) + start[v['buffer']]; v['buffer'] = 0
    src = lambda t: G['textures'][t['index']]['source']
    keep = []
    for m in G.get('materials', []):
        pb = m.get('pbrMetallicRoughness', {})
        for k in ('occlusionTexture', 'emissiveTexture'): m.pop(k, None)
        for t in (pb.get('baseColorTexture'), pb.get('metallicRoughnessTexture'), m.get('normalTexture')):
            if t:
                s = src(t)
                if s not in keep: keep.append(s)
                t['index'] = keep.index(s)
    ims = []
    for i in keep:
        raw = get(inc[G['images'][i]['uri']]['url'])
        d, mime = pic(raw, size if 'diff' in G['images'][i]['uri'].lower() or 'col' in G['images'][i]['uri'].lower() else max(256, size // 2))
        o = add(d); views.append({'buffer': 0, 'byteOffset': o, 'byteLength': len(d)}); ims.append({'bufferView': len(views) - 1, 'mimeType': mime})
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
    F = json.loads(get(API + s))
    for key, suf, px, grey in (('Diffuse', 'c', z, False), ('nor_gl', 'n', z // 2, False), ('Rough', 'r', z // 2, True)):
        if key not in F: continue
        d = small(get(F[key]['1k']['jpg']['url']), px, grey); open(OUT + 'tex/' + name + '_' + suf + '.jpg', 'wb').write(d); print(name, s, suf, len(d) // 1024, 'KB', flush=True)
for s, (z, t) in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    model(s, z)
if not only or 'hdr' in only:
    d = get(json.loads(get(API + 'cowboy_town_saloon'))['hdri']['1k']['hdr']['url']); open(OUT + 'saloon.hdr', 'wb').write(d); print('saloon.hdr', len(d) // 1024, 'KB')
print("then: node tools/hide-slim.cjs data/saloon/m '" + json.dumps({k.lower(): v[1] for k, v in MODELS.items()}) + "'")
