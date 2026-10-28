# THE MEGAKIT WALLS: shrinks the Downtown City MegaKit's wall textures into one small atlas and pulls its add-ons (the AC unit, the planter) out of their glTF.
# Run: python3 tools/megakit-walls.py <folder with T_*_BaseColor.png, Prop_ACUnit.gltf/.bin, Prop_Planter_Single.gltf/.bin>  → data/megakit.png, data/megakit.json
import json, struct, sys, os
from PIL import Image

D = sys.argv[1] if len(sys.argv) > 1 else '.'
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
im = lambda n: Image.open(os.path.join(D, 'T_%s_BaseColor.png' % n)).convert('RGB')
A = Image.new('RGB', (512, 256))
T = {}
def put(name, img, box, x, y, w, h):
    A.paste(img.crop(box).resize((w, h), Image.LANCZOS), (x, y)); T[name] = [x, y, w, h]
def bricks(n):   # half the sheet as a small pixel tile: the bricks' colour box-filtered, the mortar kept as lines wherever any of it falls
    src = im('RedBrick').crop((0, 0, 1024, 1024)); g = src.convert('HSV').split()[1].point(lambda v: 255 if v < 40 else 0)
    col = src.resize((n, n), Image.BOX); m = g.resize((n, n), Image.BOX).point(lambda v: 255 if v > 30 else 0)
    return Image.composite(Image.new('RGB', (n, n), (58, 52, 50)), col, m)
A.paste(bricks(64), (0, 0)); T['brick'] = [0, 0, 64, 64]
put('concrete', im('Concrete'), (0, 0, 2048, 2048), 256, 0, 128, 128)
put('mconc', im('MetalConcrete'), (0, 840, 2048, 2048), 384, 0, 64, 64)
put('dirt', im('Dirt'), (0, 0, 2048, 2048), 448, 0, 64, 64)
put('orn', im('Ornaments'), (0, 0, 2048, 2048), 256, 128, 128, 128)
put('stone', im('Trim'), (0, 0, 2048, 940), 384, 64, 128, 56)
put('wood', im('Trim'), (0, 950, 2048, 1176), 384, 120, 128, 8)
put('metal', im('MetalConcrete'), (0, 0, 2048, 830), 384, 128, 128, 52)
A = A.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
A.save(os.path.join(R, 'data/megakit.png'), optimize=True)

def mesh(name):
    g = json.load(open(os.path.join(D, name + '.gltf'))); b = open(os.path.join(D, g['buffers'][0]['uri']), 'rb').read()
    def acc(i):
        a = g['accessors'][i]; v = g['bufferViews'][a['bufferView']]; o = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]; f = {5126: 'f', 5123: 'H', 5125: 'I'}[a['componentType']]
        return list(struct.unpack_from('<%d%s' % (a['count'] * n, f), b, o))
    out = []
    for p in g['meshes'][0]['primitives']:
        out.append({'mat': g['materials'][p['material']]['name'], 'p': [round(v, 3) for v in acc(p['attributes']['POSITION'])],
                    'uv': [round(v, 4) for v in acc(p['attributes']['TEXCOORD_0'])], 'i': acc(p['indices'])})
    return out
B = {'small': {'w': 12, 'd': 12, 'h': 17}, 'medium': {'w': 14, 'd': 12, 'h': 25}, 'large': {'w': 20, 'd': 16, 'h': 28}}   # the kit's three buildings' sizes in metres: the fronts keep their heights
json.dump({'aw': 512, 'ah': 256, 't': T, 'b': B, 'ac': mesh('Prop_ACUnit'), 'planter': mesh('Prop_Planter_Single')}, open(os.path.join(R, 'data/megakit.json'), 'w'), separators=(',', ':'))
print('data/megakit.png', os.path.getsize(os.path.join(R, 'data/megakit.png')), 'data/megakit.json', os.path.getsize(os.path.join(R, 'data/megakit.json')))
