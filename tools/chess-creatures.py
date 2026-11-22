# fetches what SKIRMISH TABLE's creatures and clips are baked from (all CC0; credits in docs/chess-credits.md): python3 tools/chess-creatures.py  ->  data/full/chess/characters/animations.glb, animations2.glb (Quaternius' two animation libraries, only the clips the bake names), data/full/chess/creatures/whelp/ (the dragon, its four clips, its picture), data/full/chess/creatures/tex/ (the surfaces the built creatures are painted with); then PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs
import io, json, os, struct, sys, urllib.request, zipfile
from PIL import Image

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=300).read()

MIRROR = 'https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/'   # an unchanged copy of Quaternius' packs (the packs' own Google Drive folders refuse downloads)
LIBS = {'animations': ('quaternius-universal-animation-library/3D/characters/UAL1_Standard.glb',
                       ['Sword_Idle', 'Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sword_Attack', 'Punch_Cross', 'Punch_Jab', 'Pistol_Shoot', 'Pistol_Reload', 'Spell_Simple_Shoot', 'Interact', 'Hit_Chest', 'Hit_Head', 'Death01']),
        'animations2': ('quaternius-universal-animation-library-2/3D/characters/UAL2_Standard.glb',
                        ['Idle_Shield_Loop', 'Shield_OneShot', 'Sword_Regular_B', 'Sword_Dash', 'OverhandThrow', 'Zombie_Idle_Loop', 'Zombie_Walk_Fwd_Loop', 'Zombie_Scratch', 'TreeChopping_Loop'])}
# our name: (Poly Haven's, which of its pictures)
TEX = {'stone': 'rock_boulder_cracked', 'bone': 'white_rough_plaster', 'hide': 'leather_white', 'cloth': 'rough_linen', 'fur': 'polar_fleece'}
DRAGON = 'https://opengameart.org/sites/default/files/dragon_oga.zip'   # "Cethiel's Dragon 3D" (kooow / Drummyfish, after Cethiel's 2D dragon), CC0

def trim(glb, names):   # a .glb with only its bones and the named clips
    n = struct.unpack('<I', glb[12:16])[0]; G = json.loads(glb[20:20 + n]); B = glb[28 + n:]
    G['animations'] = [a for a in G['animations'] if a['name'] in names]
    miss = set(names) - {a['name'] for a in G['animations']}
    if miss: raise SystemExit('no clip ' + ' '.join(miss))
    used = sorted({i for a in G['animations'] for s in a['samplers'] for i in (s['input'], s['output'])}); views = []; out = b''; acc = []
    for i in used:
        a = dict(G['accessors'][i]); v = G['bufferViews'][a['bufferView']]; o = v.get('byteOffset', 0) + a.pop('byteOffset', 0)
        size = a['count'] * {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']] * 4
        views.append({'buffer': 0, 'byteOffset': len(out), 'byteLength': size}); out += B[o:o + size]; a['bufferView'] = len(views) - 1; acc.append(a)
    for a in G['animations']:
        for s in a['samplers']: s['input'] = used.index(s['input']); s['output'] = used.index(s['output'])
    for k in ('meshes', 'skins', 'materials', 'textures', 'images', 'samplers'): G.pop(k, None)
    for nd in G['nodes']: nd.pop('mesh', None); nd.pop('skin', None)
    G['accessors'] = acc; G['bufferViews'] = views; G['buffers'] = [{'byteLength': len(out)}]
    J = json.dumps(G, separators=(',', ':')).encode(); J += b' ' * (-len(J) % 4); out += b'\0' * (-len(out) % 4)
    return struct.pack('<4sII', b'glTF', 2, 28 + len(J) + len(out)) + struct.pack('<I4s', len(J), b'JSON') + J + struct.pack('<I4s', len(out), b'BIN\0') + out

only = sys.argv[1:]
if not only or 'clips' in only:
    for name, (path, names) in LIBS.items():
        b = trim(get(MIRROR + path), names); open('data/full/chess/characters/' + name + '.glb', 'wb').write(b); print(name, len(names), 'clips', len(b) // 1024, 'KB', flush=True)
if not only or 'whelp' in only:
    os.makedirs('data/full/chess/creatures/whelp', exist_ok=True); z = zipfile.ZipFile(io.BytesIO(get(DRAGON)))
    for f in ('dragon.dae', 'dragon_attack.dae', 'dragon_die.dae', 'dragon_idle.dae', 'dragon_walk.dae'): open('data/full/chess/creatures/whelp/' + f, 'wb').write(z.read(f))
    Image.open(io.BytesIO(z.read('dragon.png'))).convert('RGB').resize((512, 512), Image.LANCZOS).save('data/full/chess/creatures/whelp/dragon.jpg', quality=90); print('whelp', flush=True)
if not only or 'tex' in only:
    os.makedirs('data/full/chess/creatures/tex', exist_ok=True)
    for name, s in TEX.items():
        F = json.loads(get('https://api.polyhaven.com/files/' + s))
        for part, suf in (('Diffuse', ''), ('nor_gl', '_n'), ('AO', '_ao')):
            if part not in F: continue
            Image.open(io.BytesIO(get(F[part]['1k']['jpg']['url']))).convert('RGB').resize((512, 512), Image.LANCZOS).save('data/full/chess/creatures/tex/' + name + suf + '.jpg', quality=88)
        print(name, s, flush=True)
