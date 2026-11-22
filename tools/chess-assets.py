# fetches SKIRMISH TABLE's photographed ground (CC0, Poly Haven) and copies the models and sound its maps share with HULL DOWN: python3 tools/chess-assets.py [names]  ->  data/chess/land/tex/<name>_{d,n}.jpg (colour, and for some the normal; 512 px), data/chess/land/m/*.glb, data/chess/land/snd/*.mp3
import io, json, os, shutil, urllib.request
from PIL import Image
API, OUT = 'https://api.polyhaven.com/files/', 'data/chess/land/'
# our name: Poly Haven's
TEX = {'grass': 'leafy_grass', 'forest': 'forrest_ground_01', 'dirt': 'brown_mud_leaves_01', 'rock': 'rock_boulder_dry', 'bed': 'river_small_rocks', 'planks': 'weathered_brown_planks', 'wall': 'castle_wall_slates'}
# the three worlds' ground (Glimmerdeep, the Rimewater, Cinderscar): fetched by the page only when that world is on the table
TEX.update({'snow': 'snow_02', 'cave': 'rocks_ground_05', 'ash': 'burned_ground_01', 'scorch': 'mud_cracked_dry_03'})
NORMAL = ('grass', 'rock', 'planks', 'wall', 'snow', 'cave', 'ash')   # the ones drawn with their relief
import sys
ONLY = sys.argv[1:]   # names to fetch again alone
# HULL DOWN's files (data/tank/, credits in docs/tank-credits.md): the trees, the fallen tree, the mossy rocks, the ruin's walls, the birds
COPY = {'m/tree_birch.glb': 'm/birch.glb', 'm/tree_oak.glb': 'm/oak.glb', 'm/tree_fir.glb': 'm/fir.glb', 'm/deadtree.glb': 'm/deadtree.glb', 'm/rocks.glb': 'm/rocks.glb', 'm/brokenwall.glb': 'm/brokenwall.glb', 'snd/birds.mp3': 'snd/birds.mp3', 'snd/fire.mp3': 'snd/fire.mp3'}
# and the sounds of COLD BORE (docs/sniper-sounds.md) and DEAD END (docs/hide-sounds.md): the frozen pass's wind, the cavern's drip
OTHER = {'data/sniper/snd/wind.mp3': 'snd/wind.mp3', 'data/hide/snd/drip.mp3': 'snd/drip.mp3'}
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'asset-fetch'}), timeout=120).read()
def small(data, size=512, q=80):
    im = Image.open(io.BytesIO(data)).convert('RGB').resize((size, size), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return b.getvalue()
for d in ('tex', 'm', 'snd'): os.makedirs(OUT + d, exist_ok=True)
for name, slug in TEX.items():
    if ONLY and name not in ONLY: continue
    F = json.loads(get(API + slug)); col = F.get('Diffuse') or F.get('diff') or F.get('Color'); nor = F.get('nor_gl')
    open(OUT + 'tex/' + name + '_d.jpg', 'wb').write(small(get(col['1k']['jpg']['url'])))
    if name in NORMAL: open(OUT + 'tex/' + name + '_n.jpg', 'wb').write(small(get(nor['1k']['jpg']['url']), q=84))
    print(name, slug)
for a, b in COPY.items(): shutil.copyfile('data/tank/' + a, OUT + b)
for a, b in OTHER.items(): shutil.copyfile(a, OUT + b)
print('''then: node tools/hide-slim.cjs data/chess/land/m '{"birch":2400,"oak":3000,"fir":2200}' ''')
