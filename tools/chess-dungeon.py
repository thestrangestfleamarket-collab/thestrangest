# fetches SKIRMISH TABLE's dungeon (all CC0: Poly Haven's surfaces and models, ambientCG's lava and ivy leaves): python3 tools/chess-dungeon.py  ->  data/full/chess/dungeon/ (tex/*.jpg, ivy.png, m/*.glb); then the thinning line it prints, then PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs dungeon bakes data/chess/dungeon/; credits in docs/chess-credits.md
import io, json, os, struct, sys, urllib.request, zipfile
from PIL import Image
exec('def get(' + open('tools/sushi-assets.py').read().split('def get(')[1].split("for d in ('tex', 'm')")[0])   # get, jpg, pic, pad, model: the ramen cart's own

API, OUT = 'https://api.polyhaven.com/files/', 'data/full/chess/dungeon/'
# our name: (Poly Haven's, pixels)
TEX = {'flag': ('medieval_blocks_03', 1024), 'brick': ('castle_brick_broken_06', 1024), 'wall': ('mossy_stone_wall', 1024), 'moat': ('rock_wall_08', 512), 'floor': ('mossy_rock', 1024), 'kerb': ('medieval_blocks_05', 512)}
# Poly Haven's model: (picture pixels, triangles after thinning)
MODELS = {'rock_face_01': (512, 900), 'rock_face_02': (512, 900), 'namaqualand_boulder_02': (256, 220), 'rock_moss_set_01': (512, 500),
          'stone_fire_pit': (512, 500), 'large_iron_gate': (512, 900), 'treasure_chest': (256, 500)}
ACG = 'https://ambientcg.com/get?file='

for d in ('tex', 'm'): os.makedirs(OUT + d, exist_ok=True)
only = sys.argv[1:]
for name, (s, z) in TEX.items():
    if only and name not in only: continue
    F = json.loads(get(API + s))
    open(OUT + 'tex/' + name + '.jpg', 'wb').write(jpg(get(F['Diffuse']['1k']['jpg']['url']), z, 86)); print(name, s, flush=True)
if not only or 'lava' in only:
    z = zipfile.ZipFile(io.BytesIO(get(ACG + 'Lava001_1K-JPG.zip')))
    for part, suf in (('Color', ''), ('Emission', '_glow')):
        open(OUT + 'tex/lava' + suf + '.jpg', 'wb').write(jpg(z.read('Lava001_1K-JPG_' + part + '.jpg'), 512, 86))
    print('lava Lava001', flush=True)
if not only or 'ivy' in only:
    z = zipfile.ZipFile(io.BytesIO(get(ACG + 'LeafSet029_1K-JPG.zip'))); n = z.namelist()
    col = Image.open(io.BytesIO(z.read([f for f in n if f.endswith('_Color.jpg')][0]))).convert('RGB'); a = Image.open(io.BytesIO(z.read([f for f in n if f.endswith('_Opacity.jpg')][0]))).convert('L')
    col.putalpha(a); col.resize((512, 512), Image.LANCZOS).save(OUT + 'ivy.png', optimize=True); print('ivy LeafSet029', flush=True)
for s, (z, t) in MODELS.items():
    if only and s not in only and 'm' not in only: continue
    model(s, z)
print("node tools/hide-slim.cjs data/full/chess/dungeon/m '" + json.dumps({s.lower(): t for s, (z, t) in MODELS.items()}) + "'")
