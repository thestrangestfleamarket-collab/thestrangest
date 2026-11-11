# The mushroom seller's skull (CC0, CDmir's "Human Skull" on OpenGameArt, opengameart.org/node/88315): data/full/skull/ -> data/skull.json
# (points, texture coordinates, triangles; its colour times its shading, and its relief, each a 512 px JPEG)
import json, base64, io, os
from PIL import Image, ImageChops
D = os.path.join(os.path.dirname(__file__), '..', 'data')
F = os.path.join(D, 'full', 'skull')
V, T, P, UV, I, key = [], [], [], [], [], {}
for l in open(os.path.join(F, 'skull-Low4K.obj')):
    a = l.split()
    if not a: continue
    if a[0] == 'v': V.append([float(x) for x in a[1:4]])
    elif a[0] == 'vt': T.append([float(x) for x in a[1:3]])
    elif a[0] == 'f':
        ids = []
        for c in a[1:]:
            v, t = (int(x) - 1 for x in c.split('/')[:2])
            if (v, t) not in key:
                key[(v, t)] = len(P) // 3; P.extend(round(x, 4) for x in V[v]); UV.extend(round(x, 4) for x in T[t])
            ids.append(key[(v, t)])
        for k in range(1, len(ids) - 1): I.extend([ids[0], ids[k], ids[k + 1]])
def jpg(im, q):
    b = io.BytesIO(); im.convert('RGB').resize((512, 512), Image.LANCZOS).save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
col = Image.open(os.path.join(F, 'Skull-Low.png')).convert('RGB')
ao = Image.open(os.path.join(F, 'Skull-AO.png')).convert('RGB').resize(col.size)
out = {'src': "CDmir, Human Skull (CC0), opengameart.org/node/88315", 'p': P, 'uv': UV, 'i': I,
       'map': jpg(ImageChops.multiply(col, ao), 82), 'nmap': jpg(Image.open(os.path.join(F, 'Skull-Low-normal.png')), 85)}
json.dump(out, open(os.path.join(D, 'skull.json'), 'w'), separators=(',', ':'))
print(len(P) // 3, 'points', len(I) // 3, 'triangles', os.path.getsize(os.path.join(D, 'skull.json')), 'bytes')
