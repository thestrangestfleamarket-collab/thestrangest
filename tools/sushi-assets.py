# fetches RAMEN's photographed surfaces and street props (all CC0, Poly Haven) and its recorded sounds (CC0, OpenGameArt): python3 tools/sushi-assets.py [name ...]  ->  data/sushi/tex/*.jpg (colour only), data/sushi/m/*.glb, data/sushi/snd/*.mp3 (only when asked: 'snd', needs ffmpeg); credits in docs/sushi-credits.md and docs/sushi-sounds.md; then node tools/hide-slim.cjs data/sushi/m (the line at the end prints it)
import io, json, os, re, shutil, struct, subprocess, sys, urllib.request, zipfile
from PIL import Image

API, OUT = 'https://api.polyhaven.com/files/', 'data/sushi/'
# our name: (Poly Haven's, pixels)
TEX = {'brick_red': ('brick_wall_001', 512), 'brick_orange': ('large_red_bricks', 512), 'brick_brown': ('brown_brick_02', 512), 'brick_dark': ('brick_wall_10', 512), 'brick_painted': ('painted_worn_brick', 512),
       'concrete': ('concrete_wall_008', 512), 'concrete_dirty': ('dirty_concrete', 512),
       'asphalt': ('asphalt_02', 512), 'paving': ('concrete_pavement', 512), 'shutter': ('painted_metal_shutter', 512), 'shutter_rust': ('rusted_shutter', 256), 'corrugated': ('corrugated_iron', 512),
       'wood': ('weathered_brown_planks', 512), 'wood_dark': ('dark_wooden_planks', 512), 'wood_light': ('hinoki_planks', 512), 'tile_white': ('long_white_tiles', 512), 'bark': ('japanese_cedar_bark', 256)}
MODELS = {'metal_trash_can': 256, 'cardboard_box_01': 256, 'trashbag': 256, 'plastic_crate_02': 256, 'utility_box_01': 256, 'exterior_aircon_unit': 256, 'Television_01': 512, 'television_02': 512, 'boombox': 512}
SLIM = {'metal_trash_can': 500, 'cardboard_box_01': 200, 'trashbag': 300, 'plastic_crate_02': 900, 'utility_box_01': 300, 'exterior_aircon_unit': 700, 'television_01': 1400, 'television_02': 1600, 'boombox': 2500}
MODELS['CashRegister_01'] = 512; SLIM['cashregister_01'] = 4000   # the till on the back counter (its drawer is drawn open in the model)
TEX.update({'wood_counter': ('wood_table_worn', 512), 'cloth': ('terry_cloth', 256)})   # the worn counter tops; the rag
MODELS.update({'propane_tank': 256}); SLIM.update({'propane_tank': 900})   # the stove's gas bottles
MODELS.update({'hanging_industrial_lamp': 256, 'wooden_cutting_board': 256, 'food_ginger_01': 128}); SLIM.update({'hanging_industrial_lamp': 600, 'wooden_cutting_board': 500, 'food_ginger_01': 300})   # the work lights' enamel shades, the board, a knob of ginger by it

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
if not only or 'money' in only:   # the till's money: the 1985 designs of the $5, $10, $20 and the $1's back, US government pictures (public domain) from uscurrency.gov; the $1's front and the coins are kept as they are in data/sushi/money
    os.makedirs(OUT + 'money', exist_ok=True); U = 'https://www.uscurrency.gov/sites/default/files/denominations/'
    for name, f in {'b1b': '1_1963-present-back', 'b5': '5_1993-2000-front_0', 'b5b': '5_1993-2000-back_0', 'b10': '10_1990-2000-front_0', 'b10b': '10_1990-2000-back_0', 'b20': '20_1990-1998-front_0', 'b20b': '20_1990-1998-back-ver2_0'}.items():
        Image.open(io.BytesIO(get(U + f + '.jpg'))).convert('RGB').resize((320, 136), Image.LANCZOS).save(OUT + 'money/' + name + '.jpg', quality=88); print(name, f, flush=True)
# the sounds: our name -> (OpenGameArt's file, the member of its zip or '', start s, length s, 'loop' or 'hit'); the downloads are kept in data/full/sushi/snd/ (not in git)
OGA = 'https://opengameart.org/sites/default/files/'
SND = {
    'boil': ('boilingwater01.wav', '', 40, 6, 'loop'), 'simmer': ('boilingwater02.wav', '', 30, 6, 'loop'), 'steam': ('steam_hisses.zip', 'steam hisses - Marker #2.wav', 0.2, 1.5, 'loop'),
    'rain': ('amb_rain_loop_1_0.mp3', '', 10, 14, 'loop'), 'eaves': ('rain-gutter-loop_0.mp3', '', 5, 12, 'loop'), 'drip': ('water-splash-slime-sfx.zip', 'loop_rain.ogg', 0, 6.5, 'loop'),
    'traffic': ('gatve%20Varniu_2.ogg', '', 10, 20, 'loop'), 'pour': ('water-splash-slime-sfx.zip', 'loop_water_02.ogg', 0, 6.5, 'loop'),
    'drain': ('kitchensink01.wav', '', 12, 2.2, 'hit'),
    'chop1': ('kitchencuttingboard01.wav', '', 1.42, 0.32, 'hit'), 'chop2': ('kitchencuttingboard01.wav', '', 6.01, 0.32, 'hit'), 'chop3': ('kitchencuttingboard01.wav', '', 8.35, 0.32, 'hit'),
    'ceramic1': ('forkonplate01.wav', '', 0.38, 0.24, 'hit'), 'ceramic2': ('forkonplate01.wav', '', 1.85, 0.24, 'hit'),
    'metal1': ('clink2.wav', '', 0, 0.26, 'hit'), 'metal2': ('clink3.wav', '', 0, 0.29, 'hit'), 'clank': ('sfx_breaking_and_falling.zip', 'bfh1_metal_hit_02.ogg', 0, 0.55, 'hit'),
    'wood1': ('sfx_breaking_and_falling.zip', 'bfh1_wood_hit_01.ogg', 0, 0.25, 'hit'), 'wood2': ('sfx_breaking_and_falling.zip', 'bfh1_wood_hit_02.ogg', 0, 0.28, 'hit'),
    'glass1': ('sfx_breaking_and_falling.zip', 'bfh1_glass_hit_01.ogg', 0, 0.3, 'hit'), 'glass2': ('sfx_breaking_and_falling.zip', 'bfh1_glass_hit_02.ogg', 0, 0.33, 'hit'),
    'shatter': ('sfx_breaking_and_falling.zip', 'bfh1_glass_breaking_06.ogg', 0, 0.92, 'hit'), 'crash': ('sfx_breaking_and_falling.zip', 'bfh1_breaking_01.ogg', 0, 1.06, 'hit'),
    'cloth1': ('MoreSounds.zip', 'Cloth/Cloth_04.wav', 0, 0.57, 'hit'), 'cloth2': ('MoreSounds.zip', 'Cloth/Cloth_05.wav', 0, 0.4, 'hit'),
    'coin1': ('MoreSounds.zip', 'Money/Money_05.wav', 0, 0.36, 'hit'), 'coin2': ('MoreSounds.zip', 'Money/Money_09.wav', 0, 0.23, 'hit'),
    'plop1': ('water-splash-slime-sfx.zip', 'bubble_01.ogg', 0, 0.7, 'hit'), 'plop2': ('water-splash-slime-sfx.zip', 'bubble_03.ogg', 0, 0.55, 'hit'),
    'ignite': ('turn_stove_on_01_0.ogg', '', 0, 0.52, 'hit'), 'knob': ('switch_strength_stove_01.ogg', '', 0, 0.51, 'hit'),
}

def ff(*a):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y'] + [str(x) for x in a], capture_output=True, text=True, check=True).stderr

def snd(name, src, member, t0, d, mode):   # one sound: mono, cut, a loop's tail laid over its head (no seam), loops to one loudness and hits to their peak, small MP3
    raw = 'data/full/sushi/snd/'; os.makedirs(raw, exist_ok=True); f = raw + src.replace('%20', '_')
    if not os.path.exists(f): open(f, 'wb').write(get(OGA + src))
    if member:
        x = raw + re.sub(r'[^\w.]+', '_', member)
        if not os.path.exists(x): z = zipfile.ZipFile(f); open(x, 'wb').write(z.read(next(n for n in z.namelist() if n.endswith(member))))
        f = x
    tmp = raw + name + '.wav'
    if mode == 'loop':
        import numpy as np
        F = min(1.0, d * 0.25); sr = 32000; n, k = int(d * sr), int(F * sr)
        a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(d + F), '-i', f, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
        if len(a) < n + k: k = max(int(0.25 * sr), min(k, len(a) // 5)); n = len(a) - k   # a short recording: the overlap comes off its end
        w =np.linspace(0, 1, k, dtype=np.float32); a[:k] = a[:k] * np.sqrt(w) + a[n:n + k] * np.sqrt(1 - w); a = a[:n]
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', tmp], input=a.tobytes(), check=True)
    else: ff('-ss', t0, '-t', d, '-i', f, '-ac', 1, '-ar', 44100, '-af', 'afade=t=in:d=0.004,afade=t=out:st=%g:d=%g' % (d * 0.7, d * 0.3), tmp)
    v = ff('-i', tmp, '-af', 'volumedetect', '-f', 'null', '-'); mx = float(re.search(r'max_volume: ([-0-9.]+)', v).group(1)); mean = float(re.search(r'mean_volume: ([-0-9.]+)', v).group(1))
    g = min(-20 - mean if mode == 'loop' else -1 - mx, -1 - mx)
    ff('-i', tmp, '-af', 'volume=%gdB' % g, '-ar', 32000 if mode == 'loop' else 44100, '-c:a', 'libmp3lame', '-b:a', '40k' if mode == 'loop' else '56k', OUT + 'snd/' + name + '.mp3'); os.remove(tmp)
    print(name, os.path.getsize(OUT + 'snd/' + name + '.mp3') // 1024, 'KB', flush=True)

if 'snd' in only or any(n in SND for n in only):
    os.makedirs(OUT + 'snd', exist_ok=True)
    for n, a in SND.items():
        if 'snd' in only or n in only: snd(n, *a)
print("then: node tools/hide-slim.cjs data/sushi/m '" + json.dumps(SLIM) + "'")
