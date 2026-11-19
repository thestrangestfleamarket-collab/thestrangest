# RAMEN's people: Microsoft Rocketbox avatars and motion (MIT) as downtown New Yorkers of 1985, in their own clothes (some dyed for the year), their eyelids and jaw kept so they blink and speak, into data/sushi/rb/ (people.json: the skeleton, the cast and the motion; <who>.bin: each body near and far; <who>.webp: its pictures in one atlas)
# Needs Blender's module: pip install bpy; python3 tools/sushi-people.py [-- who ...]   (fetches the library's files it uses into data/full/rocketbox/ first)
import bpy, bmesh, sys, os, json, math, base64, struct, urllib.request, urllib.parse, random
import numpy as np
from mathutils import Matrix, Vector, Quaternion
from PIL import Image, ImageFilter, ImageDraw

SRC, OUT = 'data/full/rocketbox/', 'data/sushi/rb/'
RAW = 'https://raw.' + 'githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/'
# who is who: [Rocketbox avatar, texture prefix, sex, what is changed]
# dye: [[where (top, legs, shoes), colour, how much, keep bare skin]], scarf: a headscarf's colour (it is in the head's picture), hair: the hair's colour
CAST = {
  'cook': ['Professions/Chef_Female_01', 'f110', 'f', {}],
  'cop': ['Professions/Police_Male_01', 'm220', 'm', dict(dye=[['legs', 0x1a2136, 0.9]])],   # the NYPD's light blue shirt of the time over navy trousers
  'cabbie': ['Adults/Male_Adult_14', 'm012', 'm', dict(dye=[['top', 0x8a8468, 0.5]])],
  'punk': ['Adults/Female_Adult_07', 'f007', 'f', dict(dye=[['top', 0x17171b, 0.85, True], ['legs', 0x1c1c22, 0.8]], hair=0x16121a)],
  'suit': ['Professions/Business_Male_01', 'm005', 'm', dict(dye=[['top', 0x2c3040, 0.35], ['legs', 0x2c3040, 0.35]])],
  'nurse': ['Professions/Medical_Female_01', 'f152', 'f', {}],
  'babushka': ['Adults/Female_Adult_06', 'f202', 'f', dict(scarf=0x7a2638, dye=[['top', 0x4a4038, 0.6], ['legs', 0x4a4038, 0.6]])],
  'bboy': ['Adults/Male_Adult_10', 'm024', 'm', {}],
  'denim': ['Adults/Male_Adult_12', 'm007', 'm', {}],
  'leather': ['Adults/Female_Adult_04', 'f004', 'f', dict(dye=[['legs', 0x4a5a78, 0.7]])],
  'coned': ['Professions/Construction_Male_02', 'm101', 'm', {}],
  'kid': ['Children/Male_Child_02', 'cm012', 'm', {}],
  'grocer': ['Professions/Business_Male_07', 'm018', 'm', dict(dye=[['legs', 0x5a4a3a, 0.75]])],
  'clerk': ['Adults/Male_Adult_20', 'm027', 'm', dict(dye=[['top', 0x5a1c22, 0.7, True]])],
  'laundress': ['Adults/Female_Adult_05', 'f005', 'f', dict(dye=[['top', 0x3a7a7a, 0.6, True]])],
  'secretary': ['Professions/Business_Female_03', 'f016', 'f', dict(dye=[['top', 0x6a2a4a, 0.5], ['legs', 0x6a2a4a, 0.5]])],
  'dancer': ['Adults/Female_Party_02', 'f022', 'f', {}],
  'messenger': ['Professions/Delivery_Male_01', 'm112', 'm', {}],
  'student': ['Adults/Male_Adult_04', 'm006', 'm', dict(dye=[['top', 0x3a4a34, 0.6, True]])],
}
CLIPS = {'Idle': 'static/{s}_idle_neutral_01', 'Walk': 'xy/{s}_walk_neutral_01', 'Sitting': 'static/{s}_sit_table_idle_neutral_01', 'Talking': 'static/{s}_gestic_talk_neutral_01', 'Agree': 'static/{s}_gestic_listen_accept_01',
         'Head shake': 'static/{s}_gestic_listen_deny_01', 'Laughing': 'static/{s}_gestic_laugh_loud', 'Shrug': 'static/{s}_gestic_shrug_01', 'Thoughtful': 'static/{s}_gestic_thoughtful_01', 'Look around': 'static/{s}_idle_look_around_01', 'Wave': 'static/{s}_wave_01'}
# the skeleton the game moves (Rocketbox's own bones without the fingers, face and toes, which go with the hand, head and foot): [name, Rocketbox bone, parent]
BONES = [['hips', 'Pelvis', None], ['spine', 'Spine', 'hips'], ['spine1', 'Spine1', 'spine'], ['torso', 'Spine2', 'spine1'], ['neck', 'Neck', 'torso'], ['head', 'Head', 'neck'],
         ['clavL', 'L Clavicle', 'neck'], ['upperArmL', 'L UpperArm', 'clavL'], ['forearmL', 'L Forearm', 'upperArmL'], ['handL', 'L Hand', 'forearmL'],
         ['clavR', 'R Clavicle', 'neck'], ['upperArmR', 'R UpperArm', 'clavR'], ['forearmR', 'R Forearm', 'upperArmR'], ['handR', 'R Hand', 'forearmR'],
         ['thighL', 'L Thigh', 'spine'], ['shinL', 'L Calf', 'thighL'], ['shoeL', 'L Foot', 'shinL'], ['thighR', 'R Thigh', 'spine'], ['shinR', 'R Calf', 'thighR'], ['shoeR', 'R Foot', 'shinR']]
NB, BI = len(BONES), {b[0]: i for i, b in enumerate(BONES)}
RB2 = {b[1]: b[0] for b in BONES}
FPS = 15
CAP = {'Idle': 12, 'Sitting': 12, 'Talking': 10, 'Laughing': 4, 'Thoughtful': 6}   # seconds kept of a long take
LOOPS = {'Idle', 'Sitting', 'Talking', 'Look around', 'Walk'}
XB = ['lids', 'jaw']   # two more the game moves by itself: both upper eyelids (a blink) and the jaw (speech); the takes leave them alone
for i, n in enumerate(XB): BI[n] = NB + i
LIDS, JAW = ('LEyeBlinkTop', 'REyeBlinkTop'), ('MJaw', 'MBottomLip', 'MTongue', 'LMouthBottom', 'RMouthBottom')

def rbname(n): return n.split(' ', 1)[1] if n.startswith('Bip') else n
def logical(n):   # a Rocketbox bone to the game's: fingers to the hand, toes to the foot, the upper lids and the jaw kept, the rest of the face to the head
    n = rbname(n)
    if n in RB2: return RB2[n]
    for s in ('L', 'R'):
        if n.startswith(s + ' Finger'): return 'hand' + s
        if n.startswith(s + ' Toe'): return 'shoe' + s
    if n in LIDS: return 'lids'
    if n in JAW: return 'jaw'
    return 'hips' if n in ('', 'Footsteps') else 'head' 
def fetch(path):
    f = SRC + path
    if not os.path.exists(f) or os.path.getsize(f) == 0:
        os.makedirs(os.path.dirname(f), exist_ok=True); print('fetch', path, flush=True); urllib.request.urlretrieve(RAW + urllib.parse.quote(path), f)
    return f

C3 = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0)))   # Blender's world (z up, the face to -y) to the game's (y up, the face to +z)
def vb(v): return Vector((v.x, v.z, -v.y))
def qb(m3): return (C3 @ m3 @ C3.transposed()).to_quaternion().normalized()
def load(f):
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=f)
    return [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
def bone(A, n): return next(b for b in A.pose.bones if rbname(b.name) == n)
def wrot(A, pb): return (A.matrix_world.to_3x3().normalized() @ pb.matrix.to_3x3().normalized())

# ---- the motion: each bone's turn from its parent's frame (the root's from the body), the hips' place; any body of that sex is moved by it
def clip(name, src, s):
    folder, base = src.format(s=s).split('/')
    A = load(fetch('Animations/all_animations_max_motextr_' + folder + '/' + base + '.max.fbx'))
    act = A.animation_data.action; f0, f1 = int(act.frame_range[0]), int(act.frame_range[1]); frames = list(range(f0, f1 + 1, 30 // FPS))
    if name == 'Walk' and frames[-1] == f1: frames = frames[:-1]   # a loop: its last frame is its first
    pbs = [bone(A, b[1]) for b in BONES]; Q, P = [], []
    for fr in frames:
        bpy.context.scene.frame_set(fr); W = [qb(wrot(A, pb)) for pb in pbs]
        for i, b in enumerate(BONES):
            q = W[i] if b[2] is None else (W[BI[b[2]]].inverted() @ W[i])
            k = len(Q) - 4 * NB
            if k >= 0 and (Q[k] * q.w + Q[k + 1] * q.x + Q[k + 2] * q.y + Q[k + 3] * q.z) < 0: q = -q   # (each turn on the same side as the frame before, so they blend)
            Q.extend([q.w, q.x, q.y, q.z])
        P.extend(vb(A.matrix_world @ pbs[0].head))
    n = len(frames); P = np.array(P).reshape(n, 3); speed = 0
    cap = CAP.get(name)
    if cap and n > cap * FPS:   # a long take cut short; a loop's end eased into its start so it goes round without a jump
        m = int(cap * FPS); Qa = np.array(Q).reshape(n, NB, 4)
        if name in LOOPS:
            K = min(FPS, n - m); Qn = Qa[:m].copy(); Pn = P[:m].copy()
            for i in range(K):
                w = i / K
                for j in range(NB):
                    a, b = Quaternion(Qa[m + i, j]), Quaternion(Qa[i, j]); Qn[i, j] = tuple(a.slerp(b, w))
                Pn[i] = P[m + i] * (1 - w) + P[i] * w
            Q, P = list(Qn.reshape(-1)), Pn
        else: Q, P = list(Qa[:m].reshape(-1)), P[:m]
        n = m; frames = frames[:m]
    if name == 'Walk':   # in place: the way forward taken out, its speed kept
        bpy.context.scene.frame_set(f1); d = np.array(vb(A.matrix_world @ pbs[0].head)) - P[0]; speed = float(math.hypot(d[0], d[2]) / ((f1 - f0) / 30))
        for k in range(n): P[k, 0] -= d[0] * (frames[k] - f0) / (f1 - f0); P[k, 2] -= d[2] * (frames[k] - f0) / (f1 - f0)
    P[:, 0] -= P[0, 0]; P[:, 2] -= P[0, 2]
    return {'n': n, 'dur': round(n / FPS, 3), 'speed': round(speed, 3), 'q': b64(np.round(np.array(Q) * 32767).astype('<i2')), 'p': b64(np.round(P * 1000).astype('<i2'))}
def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()

# ---- the pictures in one atlas (1024 px): the body and its clothes across the top half, the head and the hair cards below
def tex(path, size, alpha=False):
    im = Image.open(path); im = im.convert('RGBA' if alpha else 'RGB').resize((size, size), Image.LANCZOS); return im
def place(at, im, q):   # the picture in its place (left, top, width, height), its edge carried out 8 px so the far mipmaps do not bleed
    x0, y0, w, h = q; a = np.array(im.resize((w - 16, h - 16), Image.LANCZOS)); a = np.pad(a, ((8, 8), (8, 8), (0, 0)), mode='edge'); at.paste(Image.fromarray(a), (x0, y0))
def atlas_uv(q, u, v):
    x0, y0, w, h = q; u = min(max(u - math.floor(u) if (u < -0.01 or u > 1.01) else u, 0), 1); v = min(max(v - math.floor(v) if (v < -0.01 or v > 1.01) else v, 0), 1)
    return ((x0 + 8 + u * (w - 16)) / 1024, 1 - (y0 + 8 + (1 - v) * (h - 16)) / 1024)

def hexc(c): return np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255], np.float32)
def recolour_scarf(head, scarf):   # her own headscarf (it is in the head's picture): white cloth to a colour
    a = np.array(head, np.float32); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / np.maximum(mx, 1); lum = mx / 255
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]; m = (sat < 0.12) & (lum > 0.42) & ~((yy > h * 0.8) & (xx < w * 0.37))
    a[m] = hexc(scarf) * (0.55 + 0.6 * lum[m][..., None]); return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def recolour_hair(im, hair):   # the hair (in the head's picture and on the hair cards) toward a colour, its strands' light and dark kept; skin left
    a = np.array(im.convert('RGB'), np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]; lum = a.mean(2)
    skin = (r > g) & (g > b) & (r - b > 28) & (r > 120) & (lum > 105)
    m = ~skin & (lum > 6); ref = max(40.0, float(np.median(lum[m]))) if m.any() else 80.0
    new = hexc(hair) * (lum[..., None] / ref); a[m] = a[m] * 0.25 + np.clip(new[m], 0, 255) * 0.75
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if im.mode == 'RGBA': out = out.convert('RGBA'); out.putalpha(im.getchannel('A'))
    return out
# what a body's triangles wear, by the bones they move with: the picture under each part
def regions(o, J, S):
    me = o.data; uv = me.uv_layers[0].data; grp = {g.index: logical(g.name) for g in o.vertex_groups}
    def dom(vi):
        w = {}
        for g in me.vertices[vi].groups: w[grp[g.group]] = w.get(grp[g.group], 0) + g.weight
        return max(w, key=w.get) if w else 'hips'
    D = [dom(i) for i in range(len(me.vertices))]; M = o.matrix_world
    mats = [m.name.split('_')[-1].split('.')[0] for m in me.materials]
    masks = {k: Image.new('L', (S, S), 0) for k in ('top', 'legs', 'shoes')}; dr = {k: ImageDraw.Draw(v) for k, v in masks.items()}
    hipY = J['hips'].y
    for p in me.polygons:
        if mats[p.material_index] != 'body': continue
        ks = [D[v] for v in p.vertices]; k = max(set(ks), key=ks.count)
        if k.startswith('hand') or k in ('head', 'lids', 'jaw'): continue
        if k.startswith('shoe'): r = 'shoes'
        elif k.startswith('thigh') or k.startswith('shin'): r = 'legs'
        elif k == 'hips': r = 'legs' if sum(vb(M @ me.vertices[v].co).y for v in p.vertices) / len(p.vertices) < hipY + 0.02 else 'top'
        else: r = 'top'
        dr[r].polygon([(uv[li].uv[0] * S, (1 - uv[li].uv[1]) * S) for li in p.loop_indices], fill=255)
    return {k: np.array(v.filter(ImageFilter.MaxFilter(3))) > 0 for k, v in masks.items()}
def dye(a, mask, colour, k, keep_skin=False):   # cloth toward a colour, its folds' light and dark kept
    px = a[mask]
    if not len(px): return
    lum = px.mean(1); ref = max(45.0, float(np.median(lum))); new = np.clip(hexc(colour)[None, :] * (lum / ref)[:, None], 0, 255); w = np.full(len(px), k, np.float32)
    if keep_skin:
        r, g, b = px[:, 0], px[:, 1], px[:, 2]; w[(r > g) & (g > b) & (r - b > 28) & (r > 110) & (r - b < 120)] = 0
    a[mask] = px * (1 - w[:, None]) + new * w[:, None]

# ---- one body: the hands posed at rest, its own clothes (dyed where asked), the pictures in one atlas, near and far
def body(key, spec, fing):
    path, pre, sex, d = spec; name = path.split('/')[-1]; child = 'Child' in name
    A = load(fetch('Avatars/' + path + '/Export/' + name + '.fbx')); o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
    mats = [m.name.split('_')[-1].split('.')[0] for m in o.data.materials]; T = {}
    for k in dict.fromkeys(['body'] + mats):
        try: T[k] = fetch('Avatars/' + path + '/Textures/' + pre + '_' + k + '_color.tga')
        except Exception: print('  no picture for', k, flush=True)
    O = {}; QR = {}
    for b in BONES:
        bb = next(x for x in A.data.bones if rbname(x.name) == b[1]); O[b[0]] = vb(A.matrix_world @ bb.head_local); QR[b[0]] = qb(A.matrix_world.to_3x3().normalized() @ bb.matrix_local.to_3x3())
    hd = lambda n: vb(A.matrix_world @ next(x for x in A.data.bones if rbname(x.name) == n).head_local)
    lt, lb = (hd('LEyeBlinkTop') + hd('REyeBlinkTop')) / 2, (hd('LEyeBlinkBottom') + hd('REyeBlinkBottom')) / 2
    X = {'lids': lt, 'jaw': hd('MJaw')}
    # the fingers as a hand at rest holds them (the idle motion's first frame), then the mesh kept so
    for s in 'LR':
        for f in range(5):
            for j in ('', '1', '2'):
                n = s + ' Finger' + str(f) + j
                pb = next((x for x in A.pose.bones if rbname(x.name) == n), None)
                if pb is None or n not in fing: continue
                bpy.context.view_layer.update(); par = pb.parent; Rp = par.matrix.to_3x3().normalized()
                R = Rp @ fing[n].to_matrix(); m4 = R.to_4x4(); m4.translation = pb.head.copy(); pb.matrix = m4
    bpy.context.view_layer.update()
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for md in list(o.modifiers):
        if md.type == 'ARMATURE': bpy.ops.object.modifier_apply(modifier=md.name)
    # the pictures: the body across the top; below, the head on the left and whatever else it has (hair cards, a belt's kit) down the right
    S = 1024; bodyim = tex(T['body'], S)
    if d.get('dye'):
        a = np.array(bodyim, np.float32); R = regions(o, O, S)
        for op in d['dye']: dye(a, R[op[0]], op[1], op[2], len(op) > 3 and op[3])
        bodyim = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    Rg = regions(o, O, 256); lab = np.zeros((256, 256), np.uint8); lab[Rg['top']] = 1; lab[Rg['legs']] = 2; lab[Rg['shoes']] = 3; flat_ = lab.reshape(-1); runs = []; i = 0
    while i < len(flat_):
        j = i
        while j < len(flat_) and flat_[j] == flat_[i] and j - i < 255: j += 1
        runs.extend([int(flat_[i]), j - i]); i = j
    wear = {'n': 256, 'r': base64.b64encode(bytes(runs)).decode()}
    at = Image.new('RGBA', (1024, 1024), (0, 0, 0, 255)); rect = {'body': (0, 0, 1024, 512)}; place(at, bodyim.convert('RGBA'), rect['body'])
    rest = [k for k in T if k not in ('body', 'head')]
    if 'head' in T: rect['head'] = (0, 512, 512, 512)
    for i, k in enumerate(rest): h = 512 // len(rest); rect[k] = (512, 512 + i * h, 512, h)
    for k in T:
        if k == 'body': continue
        im = tex(T[k], 1024, k == 'opacity')
        if k in ('head', 'opacity') and d.get('scarf'):
            rgb = recolour_scarf(im.convert('RGB'), d['scarf'])
            if im.mode == 'RGBA': rgb = rgb.convert('RGBA'); rgb.putalpha(im.getchannel('A'))
            im = rgb
        if k in ('head', 'opacity') and d.get('hair'): im = recolour_hair(im, d['hair'])
        place(at, im.convert('RGBA'), rect[k])
    at.save(OUT + key + '.webp', 'WEBP', quality=82, method=6)
    qmap = {k: rect.get(k, rect['body']) for k in mats}
    near = mesh_out(o, mats, qmap)
    # far: the same, three tenths of the triangles
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.ops.object.duplicate(); o2 = bpy.context.active_object
    dm = o2.modifiers.new('far', 'DECIMATE'); dm.ratio = 0.3; bpy.context.view_layer.objects.active = o2; bpy.ops.object.modifier_apply(modifier='far')
    far = mesh_out(o2, mats, qmap)
    with open(OUT + key + '.bin', 'wb') as f:
        f.write(near['buf']); f.write(far['buf'])
    top = max(p[1] for p in near['P'])
    return {'sex': sex, 'src': name, 'O': [[round(x, 4) for x in O[b[0]]] for b in BONES], 'Q': [[round(x, 5) for x in (QR[b[0]].w, QR[b[0]].x, QR[b[0]].y, QR[b[0]].z)] for b in BONES],
            'X': [[round(x, 4) for x in X[n]] for n in XB], 'wear': wear, 'blink': round(max(0.006, (lt.y - lb.y) * 0.8), 4),
            'hipY': round(O['hips'].y, 4), 'height': round(top, 3), 'lod': [{k: v for k, v in near.items() if k not in ('buf', 'P')}, {**{k: v for k, v in far.items() if k not in ('buf', 'P')}, 'at': len(near['buf'])}], 'child': child}

def mesh_out(o, mats, qmap):   # the GL vertices (a corner's place, normal, picture point and the four bones it moves with), quantised
    me = o.data; me.calc_loop_triangles(); uv = me.uv_layers[0].data; M = o.matrix_world; N3 = M.to_3x3().normalized()
    grp = {g.index: BI[logical(g.name)] for g in o.vertex_groups}
    try: cn = [Vector(n.vector) for n in me.corner_normals]
    except AttributeError: me.calc_normals_split(); cn = [Vector(l.normal) for l in me.loops]
    vw = []
    for v in me.vertices:
        w = {}
        for g in v.groups:
            if g.group in grp: w[grp[g.group]] = w.get(grp[g.group], 0) + g.weight
        top = sorted(w.items(), key=lambda x: -x[1])[:4] or [(0, 1.0)]; s = sum(x[1] for x in top) or 1; vw.append([(i, x / s) for i, x in top])
    key2i, P, Nn, U, SI, SW, I = {}, [], [], [], [], [], []
    for t in me.loop_triangles:
        q = qmap[mats[t.material_index]]
        for li in reversed(t.loops):   # (Blender's winding to the game's after the axes' turn)
            vi = me.loops[li].vertex_index; uu = atlas_uv(q, *uv[li].uv); n = vb(N3 @ cn[li]).normalized()
            k = (vi, round(uu[0], 5), round(uu[1], 5), round(n.x, 2), round(n.y, 2), round(n.z, 2))
            i = key2i.get(k)
            if i is None:
                i = key2i[k] = len(P); P.append(tuple(vb(M @ me.vertices[vi].co))); Nn.append(n); U.append(uu); w = vw[vi] + [(0, 0.0)] * (4 - len(vw[vi])); SI.append([x[0] for x in w]); SW.append([x[1] for x in w])
            I.append(i)
    P = np.array(P, np.float32); lo, hi = P.min(0), P.max(0); sc = (hi - lo) / 65535
    pq = np.round((P - lo) / sc).astype('<u2'); nq = np.round(np.array([tuple(n) for n in Nn]) * 127).astype('<i1'); nq = np.concatenate([nq, np.zeros((len(P), 1), '<i1')], 1)
    uq = np.round(np.array(U) * 65535).astype('<u2'); si = np.array(SI, '<u1'); sw = np.array(SW); swq = np.round(sw * 255).astype(int); swq[:, 0] += 255 - swq.sum(1); swq = swq.clip(0, 255).astype('<u1')
    iq = np.array(I, '<u2' if len(P) < 65536 else '<u4')
    buf = pq.tobytes() + nq.tobytes() + uq.tobytes() + si.tobytes() + swq.tobytes() + iq.tobytes()
    while len(buf) % 4: buf += b'\0'
    return {'nv': len(P), 'ni': len(I), 'lo': [round(float(x), 5) for x in lo], 'sc': [float(x) for x in sc], 'buf': buf, 'P': P.tolist()}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); only = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    out = {'license': 'Microsoft Rocketbox Avatar Library (MIT), github.com/microsoft/Microsoft-Rocketbox: as downtown New Yorkers of 1985 here', 'bones': [b[0] for b in BONES], 'extra': XB, 'parent': [BI[b[2]] if b[2] else -1 for b in BONES], 'fps': FPS, 'clips': {}, 'bodies': {}}
    old = json.load(open(OUT + 'people.json')) if only and os.path.exists(OUT + 'people.json') else None
    if not old: only = [k for k in only if k in CAST] or []
    fingers = {}
    for s in ('m', 'f'):
        out['clips'][s] = old['clips'][s] if old else {}
        for name, src in CLIPS.items():
            if old: break
            out['clips'][s][name] = clip(name, src, s); print('clip', s, name, out['clips'][s][name]['n'], 'frames', out['clips'][s][name]['speed'], flush=True)
        # the hand at rest: the fingers' turns from the idle motion's first frame
        A = load(fetch('Animations/all_animations_max_motextr_static/' + s + '_idle_neutral_01.max.fbx')); bpy.context.scene.frame_set(int(A.animation_data.action.frame_range[0])); fingers[s] = {}
        for pb in A.pose.bones:
            n = rbname(pb.name)
            if 'Finger' in n and pb.parent: fingers[s][n] = (pb.parent.matrix.to_3x3().normalized().inverted() @ pb.matrix.to_3x3().normalized()).to_quaternion()
    for key, spec in CAST.items():
        if only and key not in only:
            if old and key in old['bodies']: out['bodies'][key] = old['bodies'][key]
            continue
        out['bodies'][key] = body(key, spec, fingers[spec[2]]); b = out['bodies'][key]; print('body', key, b['src'], 'near', b['lod'][0]['ni'] // 3, 'tris, far', b['lod'][1]['ni'] // 3, flush=True)
    json.dump(out, open(OUT + 'people.json', 'w'), separators=(',', ':'))
    print('people.json', os.path.getsize(OUT + 'people.json'), 'bytes')
