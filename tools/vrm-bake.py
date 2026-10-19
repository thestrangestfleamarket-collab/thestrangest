import base64, io, json, struct, sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else 'data/full/vroid.vrm'
MAX = 512
b = open(SRC, 'rb').read()
jl = struct.unpack('<I', b[12:16])[0]
j = json.loads(b[20:20 + jl])
B0 = 20 + jl + 8
view = lambda i: b[B0 + j['bufferViews'][i].get('byteOffset', 0):][:j['bufferViews'][i]['byteLength']]

for m in j['meshes']:
    for p in m['primitives']:
        p.pop('targets', None)
    m.pop('weights', None)
    (m.get('extras') or {}).pop('targetNames', None)
v = j['extensions']['VRMC_vrm']
v.pop('expressions', None)
v['meta'].pop('thumbnailImage', None)
for mt in j['materials']:
    mt.pop('normalTexture', None)
drop = {i for i, im in enumerate(j['images']) if im.get('name', '').endswith(('_nml', '_spe')) or im.get('name') == 'Thumbnail'}

blank = io.BytesIO(); Image.new('RGB', (1, 1), (128, 128, 255)).save(blank, 'PNG')
data = {}
for i, im in enumerate(j['images']):
    if i in drop:
        data[i] = blank.getvalue(); continue
    I = Image.open(io.BytesIO(view(im['bufferView'])))
    k = min(1, MAX / max(I.size))
    if k < 1:
        I = I.resize((max(1, round(I.size[0] * k)), max(1, round(I.size[1] * k))), Image.LANCZOS)
    o = io.BytesIO(); I.save(o, 'PNG', optimize=True); data[i] = o.getvalue()

used = set()
def mark(a):
    if a is not None and 'bufferView' in j['accessors'][a]:
        used.add(j['accessors'][a]['bufferView'])
for m in j['meshes']:
    for p in m['primitives']:
        for a in p['attributes'].values(): mark(a)
        mark(p.get('indices'))
for s in j.get('skins', []): mark(s.get('inverseBindMatrices'))
for an in j.get('animations', []):
    for s in an['samplers']: mark(s['input']); mark(s['output'])
imgv = {im['bufferView']: i for i, im in enumerate(j['images'])}

out = bytearray()
for i, bv in enumerate(j['bufferViews']):
    if i in imgv: d = data[imgv[i]]
    elif i in used: d = view(i)
    else: d = b'\0'
    while len(out) % 4: out.append(0)
    bv['byteOffset'] = len(out); bv['byteLength'] = len(d); bv.pop('byteStride', None) if i not in used else None
    out += d
while len(out) % 4: out.append(0)
j['buffers'] = [{'byteLength': len(out)}]
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + bytes(out)
json.dump({'glb': base64.b64encode(glb).decode()}, open('data/vroid.json', 'w'))
tris = sum(j['accessors'][p['indices']]['count'] // 3 for m in j['meshes'] for p in m['primitives'])
print('data/vroid.json', len(glb), 'bytes glb,', tris, 'triangles')
