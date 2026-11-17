# RAMEN's people: Microsoft Rocketbox avatars and motion (MIT) dressed for a Japanese village in the 1860s, into data/sushi/rb/ (people.json: the skeleton, the cast and the motion; <who>.bin: each body near and far; <who>.webp: its pictures in one atlas)
# Needs Blender's module: pip install bpy; python3 tools/sushi-people.py   (fetches the library's files it uses into data/full/rocketbox/ first)
import bpy, bmesh, sys, os, json, math, base64, struct, urllib.request, urllib.parse, random
import numpy as np
from mathutils import Matrix, Vector, Quaternion
from PIL import Image, ImageFilter

SRC, OUT = 'data/full/rocketbox/', 'data/sushi/rb/'
RAW = 'https://raw.' + 'githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/'
# who is who: [Rocketbox avatar, texture prefix, sex, how they are dressed]
# dress: robe (length: hip, knee, shin, ankle; colours dark/main/light; pattern), sleeve (wide, mid, tied: rolled back to the elbow), legs (momohiki: close leggings, hakama: wide trousers), hat, swords, apron, kesa (a monk's stole), obi, collar
CAST = {
  'cook': ['Adults/Male_Adult_05', 'm009', 'm', dict(robe='hip', col=(0x1c2440, 0x26355e, 0x4a5a80), pat='plain', sleeve='tied', legs='momohiki', legc=0x1a2236, obi=0x2a2018, collar=0xe8e2d4, hat='hachimaki', apron=0xe8e0cc)],
  'fishmonger': ['Professions/Business_Male_07', 'm018', 'm', dict(robe='knee', col=(0x22303e, 0x3a5468, 0x6a8494), pat='stripe', sleeve='tied', legs='momohiki', legc=0x202a36, obi=0x3a2a1a, collar=0xd8d0bc, hat='hachimaki', apron=0x7a5a38)],
  'tofu_wife': ['Professions/Medical_Female_01', 'f152', 'f', dict(robe='ankle', col=(0x2a2a3a, 0x3e4a5e, 0x6a7a8a), pat='kasuri', sleeve='mid', obi=0x6a3a2a, collar=0xe0d8c8, apron=0xd8d0b8)],
  'potter': ['Adults/Male_Adult_03', 'm004', 'm', dict(robe='shin', col=(0x2e2620, 0x564434, 0x7a6450), pat='plain', sleeve='mid', obi=0x1e1814, collar=0xb8a888)],
  'farmer': ['Adults/Male_Adult_10', 'm024', 'm', dict(robe='hip', col=(0x2a3040, 0x445470, 0x6a7890), pat='kasuri', sleeve='tied', legs='momohiki', legc=0x2c3448, obi=0x4a4030, collar=0xa89870, hat='kasa')],
  'monk': ['Professions/Business_Male_04', 'm015', 'm', dict(robe='ankle', col=(0x121214, 0x1e1e22, 0x34343a), pat='plain', sleeve='wide', obi=0x1a1a1c, collar=0xd8d0c0, kesa=0x8a6a2a)],
  'geisha': ['Adults/Female_Adult_11', 'f011', 'f', dict(robe='ankle', col=(0x3a0e1a, 0x7a1a32, 0xb84a5a), pat='flowers', sleeve='wide', obi=0xd8b050, collar=0xf0e8dc)],
  'ronin': ['Adults/Male_Adult_09', 'm017', 'm', dict(robe='hip', col=(0x1e1e24, 0x343440, 0x50505e), pat='plain', sleeve='mid', legs='hakama', legc=0x3a3428, obi=0x2a2420, collar=0xc8c0b0, swords=True)],
  'constable': ['Adults/Male_Adult_07', 'm013', 'm', dict(robe='hip', col=(0x1a1c26, 0x2a2e40, 0x464c66), pat='plain', sleeve='mid', legs='hakama', legc=0x4a4434, obi=0x6a5a3a, collar=0xd8d0bc, hat='jingasa', swords='one')],
  'boy': ['Children/Male_Child_01', 'cm001', 'm', dict(robe='knee', col=(0x2a3a4a, 0x4a6478, 0x7a94a4), pat='check', sleeve='tied', obi=0x5a3a22, collar=0xc8c0a8)],
  'old_woman': ['Adults/Female_Adult_06', 'f202', 'f', dict(robe='ankle', col=(0x24202a, 0x3a3440, 0x5a5462), pat='stripe', sleeve='mid', obi=0x2a2a20, collar=0xb8b0a0, scarf=0x2a3450)],
  'peddler': ['Adults/Male_Adult_17', 'm022', 'm', dict(robe='knee', col=(0x2a2418, 0x4a4030, 0x6e6048), pat='plain', sleeve='tied', legs='momohiki', legc=0x2a2a2a, obi=0x1e1a14, collar=0xa89870, hat='kasa')],
  'woodcutter': ['Adults/Male_Adult_08', 'm014', 'm', dict(robe='hip', col=(0x2a2e22, 0x3e4a32, 0x5e6a4a), pat='check', sleeve='tied', legs='momohiki', legc=0x262a20, obi=0x3a2a1a, collar=0xa8a080, hat='hachimaki')],
  'townswoman': ['Adults/Female_Adult_03', 'f003', 'f', dict(robe='ankle', col=(0x1e2a2a, 0x2e4a48, 0x5a7a74), pat='kasuri', sleeve='mid', obi=0x8a5a2a, collar=0xe0d8c8)],
  'maid': ['Adults/Female_Adult_05', 'f005', 'f', dict(robe='ankle', col=(0x3a2a14, 0x6a4a22, 0x9a7a4a), pat='check', sleeve='mid', obi=0x2a3a5a, collar=0xe8e0d0, apron=0xd0c8b4)],
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

def rbname(n): return n.split(' ', 1)[1] if n.startswith('Bip') else n
def logical(n):   # a Rocketbox bone to the game's: fingers to the hand, toes to the foot, the face to the head
    n = rbname(n)
    if n in RB2: return RB2[n]
    for s in ('L', 'R'):
        if n.startswith(s + ' Finger'): return 'hand' + s
        if n.startswith(s + ' Toe'): return 'shoe' + s
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

# ---- the period clothes: tubes and sleeves round the body as it was modelled, each ring weighted to the bones it should move with
def ring_pts(c, a, b, n, front_dip=0.0, ax=None):
    return [(c[0] + a * math.sin(t), c[1] - front_dip * max(0, math.cos(t)) ** 6, c[2] + b * math.cos(t)) for t in (2 * math.pi * k / n for k in range(n + 1))]

def build_clothes(o, A, d, sex, child):
    """the robe, sleeves, leggings, sandals, hat and swords: one mesh in Blender's world, joined to the body"""
    M = o.matrix_world; V = [vb(M @ v.co) for v in o.data.vertices]; grp = {g.index: logical(g.name) for g in o.vertex_groups}
    dom = []
    for v in o.data.vertices:
        w = {}
        for g in v.groups: w[grp[g.group]] = w.get(grp[g.group], 0) + g.weight
        dom.append(max(w, key=w.get) if w else 'hips')
    J = {b[0]: vb(A.matrix_world @ next(x for x in A.data.bones if rbname(x.name) == b[1]).head_local) for b in BONES}
    toe = {s: vb(A.matrix_world @ next(x for x in A.data.bones if rbname(x.name) == s + ' Toe0').head_local) for s in 'LR'}
    TRUNK = {'hips', 'spine', 'spine1', 'torso', 'neck', 'clavL', 'clavR', 'thighL', 'thighR', 'shinL', 'shinR'}
    pts = [(V[i], dom[i]) for i in range(len(V))]
    def slice_ext(y, dy, names, side=None):
        xs = [p for p, n in pts if n in names and abs(p.y - y) < dy and (side is None or (p.x > 0) == (side > 0))]
        if not xs: return None
        return min(p.x for p in xs), max(p.x for p in xs), min(p.z for p in xs), max(p.z for p in xs)
    verts, faces, uvs, wts = [], [], [], []
    def strip(rings, uv_rect, closed=True):   # rings: [[(x,y,z) * (n+1)], weights per ring or per point]; uv_rect: (u0, v0, u1, v1) in the garment quarter
        base = len(verts); nr, npr = len(rings), len(rings[0][0])
        for r, (ps, w) in enumerate(rings):
            for k, p in enumerate(ps):
                verts.append(p); uvs.append((uv_rect[0] + (uv_rect[2] - uv_rect[0]) * k / (npr - 1), 1 - (uv_rect[1] + (uv_rect[3] - uv_rect[1]) * r / (nr - 1))));   # (the picture's rows from the top; Blender's v from the bottom) wts.append(w(k) if callable(w) else w)
        for r in range(nr - 1):
            for k in range(npr - 1):
                a, b = base + r * npr + k, base + (r + 1) * npr + k; faces.append((a, b, b + 1, a + 1))
        return base
    N = 28
    neckY = J['neck'].y; hipY = J['hips'].y; kneeY = (J['shinL'].y + J['shinR'].y) / 2; ankY = (J['shoeL'].y + J['shoeR'].y) / 2; shY = (J['upperArmL'].y + J['upperArmR'].y) / 2
    hem = {'hip': hipY - 0.2 * (hipY - kneeY) - 0.06, 'knee': kneeY - 0.02, 'shin': kneeY - 0.55 * (kneeY - ankY), 'ankle': ankY + 0.035}[d['robe']]
    m = 0.022 if not child else 0.018
    # the robe: from the base of the neck to the hem, round the trunk and both legs; above the hips it moves with the spine, below with the hips and, toward the hem, the legs
    top = neckY - 0.035; ys = list(np.linspace(top, hem, 34)); prev = None; rings = []
    for i, y in enumerate(ys):
        e = slice_ext(y, 0.035, TRUNK)
        if e is None: e = prev
        x0, x1, z0, z1 = e; a = max(abs(x0), abs(x1)) + m; b = (z1 - z0) / 2 + m; cz = (z0 + z1) / 2
        if y < hipY: a = max(a, prev_a * 0.995) if prev else a; b = max(b, prev_b * 0.99) if prev else b
        if y < hipY - 0.05: a += 0.012 * (hipY - y); b += 0.03 * (hipY - y)
        if y > shY - 0.06: a = max(a, abs(J['upperArmL'].x) - 0.01) if y < shY else a
        prev, prev_a, prev_b = e, a, b
        dip = 0.07 * max(0, 1 - (top - y) / 0.09) if i < 4 else 0
        ps = ring_pts((0, y, cz), a, b, N, dip if i == 0 else 0)
        def w(k, y=y, ps=ps):
            x = ps[k][0]; zf = ps[k][2] - cz
            if y >= J['torso'].y: return {'torso': 1.0} if y > J['torso'].y + 0.06 else {'torso': 0.6, 'spine1': 0.4}
            if y >= J['spine1'].y: return {'spine1': 0.7, 'torso': 0.3}
            if y >= J['spine'].y: return {'spine': 0.6, 'spine1': 0.4}
            if y >= hipY: return {'hips': 0.5, 'spine': 0.5}
            t = min(1, (hipY - y) / max(0.05, hipY - kneeY)); s = 'L' if x > 0 else 'R'; side = min(1, abs(x) / (a * 0.6)); front = max(0, zf / b)
            leg = min(0.9, (0.25 + 0.6 * front) * side * min(1, t * 1.4) + 0.15 * t)
            if y < kneeY:
                u = min(1, (kneeY - y) / max(0.05, kneeY - ankY)); sh = leg * min(0.8, u * 1.5) * (0.4 + 0.6 * front)
                return {'hips': 1 - leg, 'thigh' + s: leg - sh, 'shin' + s: sh}
            return {'hips': 1 - leg, 'thigh' + s: leg}
        rings.append((ps, w))
    strip(rings, (0.0, 0.0, 1.0, 0.62))
    # the sleeves: from inside the shoulder to the wrist (or the elbow, rolled back), a bag hanging under the forearm for a long sleeve
    for s in 'LR':
        S, E, H = J['upperArm' + s], J['forearm' + s], J['hand' + s]; sg = 1 if s == 'L' else -1
        S0 = S + (S - J['neck']).normalized() * -0.02 * 0 + Vector((-sg * 0.05, -0.02, 0))
        L1, L2 = (E - S0).length, (H - E).length; end = 0.55 if d['sleeve'] == 'tied' else 0.97
        bag = {'wide': 0.24 if sex == 'f' else 0.16, 'mid': 0.09, 'tied': 0.0}[d['sleeve']]
        rings = []; nR = 14
        for r in range(nR + 1):
            t = end * r / nR; P = S0.lerp(E, t / 0.5) if t <= 0.5 else E.lerp(H, (t - 0.5) / 0.5)
            ax = ((E - S0) if t <= 0.5 else (H - E)).normalized(); dn = Vector((0, -1, 0)); dn = (dn - ax * dn.dot(ax)).normalized(); e1 = ax.cross(dn).normalized()
            rad = (0.085 if r == 0 else 0.075 - 0.01 * t) * (0.85 if child else 1) + (0.01 if d['sleeve'] == 'wide' else 0)
            hang = bag * min(1, max(0, (t - 0.3) / 0.25)) * (1 if d['sleeve'] != 'tied' else 0)
            ps = []
            for k in range(N + 1):
                th = 2 * math.pi * k / N; c, sn = math.cos(th), math.sin(th); dd = rad * c + (hang * max(0, c) ** 1.5 if c > 0 else 0)
                ps.append(tuple(P + dn * dd + e1 * rad * sn))
            if t < 0.12: w = {'clav' + s: 0.5, 'upperArm' + s: 0.5}
            elif t < 0.42: w = {'upperArm' + s: 1.0}
            elif t < 0.58: w = {'upperArm' + s: 0.5, 'forearm' + s: 0.5}
            else: w = {'forearm' + s: 1.0}
            rings.append((ps, w))
        strip(rings, (0.0, 0.63, 1.0, 0.8))
    # the legs: close leggings or wide hakama, hip to ankle
    if d.get('legs'):
        wide = d['legs'] == 'hakama'
        for s in 'LR':
            T, K, F = J['thigh' + s], J['shin' + s], J['shoe' + s]; rings = []; nR = 14
            for r in range(nR + 1):
                t = r / nR; P = T.lerp(K, t / 0.5) if t <= 0.5 else K.lerp(F, (t - 0.5) / 0.5)
                e = slice_ext(P.y, 0.03, {'thigh' + s, 'shin' + s}, 1 if s == 'L' else -1)
                rad = 0.07 if e is None else max(e[1] - e[0], e[3] - e[2]) / 2 + 0.012
                if wide: rad = max(rad, 0.13 + 0.05 * t)
                if r == 0: rad += 0.01
                c = Vector(((e[0] + e[1]) / 2, P.y, (e[2] + e[3]) / 2)) if e else P
                if wide: c = Vector((P.x * 1.15, P.y, P.z))
                ps = [(c.x + rad * math.sin(th), c.y, c.z + rad * math.cos(th)) for th in (2 * math.pi * k / N for k in range(N + 1))]
                w = {'thigh' + s: 1.0} if t < 0.4 else {'thigh' + s: 0.5, 'shin' + s: 0.5} if t < 0.6 else {'shin' + s: 1.0}
                if t < 0.12: w = {'hips': 0.4, 'thigh' + s: 0.6}
                rings.append((ps, w))
            strip(rings, (0.0, 0.81, 1.0, 0.9))
    # sandals and split-toed socks: a rounded block on each foot
    for s in 'LR':
        F, T = J['shoe' + s], toe[s]; fwd = Vector((T.x - F.x, 0, T.z - F.z)).normalized(); side = Vector((0, 1, 0)).cross(fwd)
        base = len(verts); L = (Vector((T.x, 0, T.z)) - Vector((F.x, 0, F.z))).length + 0.085
        prof = [(-0.07, 0.0, 0.04), (-0.07, 0.07, 0.045), (0.0, 0.085, 0.05), (L * 0.55, 0.06, 0.05), (L - 0.05, 0.045, 0.045), (L - 0.03, 0.0, 0.04)]
        rings = []
        for (f, h, wdt) in prof:
            c = Vector((F.x, 0, F.z)) + fwd * f
            ps = [tuple(c + side * (wdt * math.sin(th)) + Vector((0, 0.006 + h * (0.5 + 0.5 * math.cos(th)), 0))) for th in (2 * math.pi * k / 12 for k in range(13))]
            rings.append((ps, {'shoe' + s: 1.0}))
        strip(rings, (0.0, 0.91, 0.5, 0.95))
        sole = [(tuple(Vector((F.x, 0, F.z)) + fwd * f + side * (w0 * 1.15) + Vector((0, 0.004, 0))), tuple(Vector((F.x, 0, F.z)) + fwd * f - side * (w0 * 1.15) + Vector((0, 0.004, 0)))) for f, _, w0 in prof]
        b0 = len(verts)
        for a, b in sole: verts.extend([a, b]); uvs.extend([(0.55, 0.07), (0.95, 0.07)]); wts.extend([{'shoe' + s: 1.0}] * 2)
        for i in range(len(sole) - 1): faces.append((b0 + 2 * i, b0 + 2 * i + 2, b0 + 2 * i + 3, b0 + 2 * i + 1))
    # a hat: a straw sugegasa, a black lacquered jingasa; a twisted cloth round the head
    headTop = max((p.y for p, n in pts if n == 'head'), default=J['head'].y + 0.2); hc = J['head'] + Vector((0, 0, 0.01))
    if d.get('hat') in ('kasa', 'jingasa'):
        R0, Hh = (0.27, 0.13) if d['hat'] == 'kasa' else (0.22, 0.06)
        brim = headTop - (0.07 if d['hat'] == 'kasa' else 0.03); rings = []
        for r in range(7):
            t = r / 6; rad = R0 * t; y = brim + Hh * (1 - t) ** 1.1
            rings.append(([(hc.x + rad * math.sin(th), y, hc.z + rad * math.cos(th)) for th in (2 * math.pi * k / 24 for k in range(25))], {'head': 1.0}))
        strip(rings, (0.0, 0.96, 0.5, 1.0) if d['hat'] == 'kasa' else (0.5, 0.96, 1.0, 1.0))
    if d.get('hat') == 'hachimaki' or d.get('scarf'):
        ex = slice_ext(headTop - (0.085 if d.get('hat') else 0.07), 0.025, {'head'})
        if ex:
            a = (ex[1] - ex[0]) / 2 + 0.008; b = (ex[3] - ex[2]) / 2 + 0.008; cz = (ex[2] + ex[3]) / 2
            rings = [(ring_pts((hc.x, headTop - (0.075 if d.get('hat') else 0.03) - (0.028 if d.get('hat') else 0.09) * r, cz), a + 0.004 * r, b + 0.004 * r, 20), {'head': 1.0}) for r in range(2)]
            strip(rings, (0.5, 0.91, 1.0, 0.95))
    # swords: the long and the short at the left hip, through the sash
    if d.get('swords'):
        for (ln, off) in ([(1.0, 0.0), (0.62, 0.05)] if d['swords'] is True else [(0.62, 0.0)]):
            P0 = Vector((0.14 + off * 0.3, hipY + 0.1 + off, 0.05 - off * 0.3)); dirv = Vector((-0.25, -0.35, -1)).normalized(); rad = 0.017
            dn = Vector((0, 1, 0)).cross(dirv).normalized(); up = dirv.cross(dn).normalized(); rings = []
            for r, t in enumerate([-0.28, -0.26, 0.0, ln * 0.72]):
                c = P0 + dirv * t * (-1 if False else 1); rr = rad * (1.6 if r == 2 else 1.0)
                rings.append(([tuple(c + dn * rr * math.cos(th) + up * rr * math.sin(th)) for th in (2 * math.pi * k / 8 for k in range(9))], {'hips': 1.0}))
            strip(rings, (0.0, 0.96, 0.1, 1.0) if False else (0.25, 0.91, 0.3, 0.95))
    # into Blender's world, as one mesh with the body's groups
    me = bpy.data.meshes.new('clothes'); Ci = C3.transposed(); Mi = M.inverted()
    me.from_pydata([tuple(Mi @ (Ci @ Vector(p))) for p in verts], [], faces); me.update()
    co = bpy.data.objects.new('clothes', me); bpy.context.collection.objects.link(co); co.matrix_world = M
    uvl = me.uv_layers.new(name=o.data.uv_layers[0].name)
    for poly in me.polygons:
        for li in poly.loop_indices: uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    names = {}
    for g in o.vertex_groups: names.setdefault(logical(g.name), g.name)
    for i, w in enumerate(wts):
        for k, x in w.items():
            gn = names.get(k) or next(g.name for g in o.vertex_groups if logical(g.name) == k)
            vg = co.vertex_groups.get(gn) or co.vertex_groups.new(name=gn); vg.add([i], x, 'REPLACE')
    return co

# ---- the pictures: the body, the head, the hair cards and the clothes in one atlas (1024 px), each a 512 px quarter
def tex(path, size, alpha=False):
    im = Image.open(path); im = im.convert('RGBA' if alpha else 'RGB').resize((size, size), Image.LANCZOS); return im
def quarter(im):   # 496 px of picture, its edge carried out 8 px so the far mipmaps do not bleed
    a = np.array(im.resize((496, 496), Image.LANCZOS)); a = np.pad(a, ((8, 8), (8, 8), (0, 0)), mode='edge'); return Image.fromarray(a)
Q = {0: (0, 0), 1: (512, 0), 2: (0, 512), 3: (512, 512)}   # body, head, hair, clothes: their top-left in the atlas
def atlas_uv(q, u, v):
    x0, y0 = Q[q]; u = min(max(u - math.floor(u) if (u < -0.01 or u > 1.01) else u, 0), 1); v = min(max(v - math.floor(v) if (v < -0.01 or v > 1.01) else v, 0), 1)
    return ((x0 + 8 + u * 496) / 1024, 1 - (y0 + 8 + (1 - v) * 496) / 1024)

def cloth_tex(d, seed):   # the clothes' own picture, painted: the robe (with its obi, collar and pattern), sleeves, leggings, sandals, hat, sash
    rnd = random.Random(seed); W = 512; img = Image.new('RGB', (W, W)); px = np.zeros((W, W, 3), np.float32)
    def hexc(c): return np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255], np.float32)
    dark, mid, light = (hexc(c) for c in d['col'])
    weave = np.random.RandomState(seed).rand(W, W).astype(np.float32); weave = np.array(Image.fromarray((weave * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255
    yy, xx = np.mgrid[0:W, 0:W]; u = xx / W; v = yy / W
    robe = v < 0.62; base = np.where(robe[..., None], mid, mid)
    pat = d.get('pat', 'plain')
    if pat == 'stripe': base = np.where(((xx // 6) % 3 == 0)[..., None], dark, mid)
    elif pat == 'check': base = np.where((((xx // 14) + (yy // 14)) % 2 == 0)[..., None], mid, dark * 0.5 + mid * 0.5)
    elif pat == 'kasuri':
        m = ((xx % 22) < 4) & ((yy % 22) < 6) & (((yy // 22) % 2 == 0) == ((xx // 22) % 2 == 0)); base = np.where(m[..., None], light, mid)
    elif pat == 'flowers':
        base = mid.copy() * np.ones((W, W, 1)); r = np.random.RandomState(seed)
        for _ in range(140):
            cx, cy, rr = r.randint(0, W), r.randint(0, 320), r.randint(4, 9); m = (xx - cx) ** 2 + (yy - cy) ** 2 < rr * rr; base[m] = light if r.rand() < 0.7 else hexc(0xe8d8a0)
        base[(yy > 260) & (yy < 318)] = base[(yy > 260) & (yy < 318)] * 0.6 + dark * 0.4
    px[:] = base * (0.9 + 0.2 * weave[..., None])
    vr = lambda a, b: (v >= a) & (v < b)
    # the robe's rows (v: 0 at the collar, 0.62 at the hem): the collar band down the front, the obi at the waist
    col = hexc(d['collar']); front = np.abs(u - 0.5) < 0.5
    ang = (u - 0.5) * 2 * math.pi   # 0 at the front
    lap = np.abs(np.sin(ang / 2)) < (0.07 + np.clip(0.26 - v * 1.2, 0, 1) * 0.45)
    collar = (np.abs(np.abs(ang) - np.clip(0.55 - v * 2.6, 0.0, 1)) < 0.11) & (v < 0.24) & ~(np.abs(ang) > 2.6)
    px[collar & robe] = col
    px[(v < 0.012)] = col
    obi_y = (0.27, 0.33) if d['robe'] in ('hip',) else (0.25, 0.32)
    if d.get('apron'):
        ap = vr(obi_y[1], 0.6) & (np.abs(ang) < 0.95); px[ap] = hexc(d['apron']) * (0.92 + 0.12 * weave[ap][..., None])
    obi = vr(*obi_y); px[obi] = hexc(d['obi']) * (0.9 + 0.15 * weave[obi][..., None])
    if d.get('kesa'):
        k = (np.abs((v - 0.02) - (ang + 3.2) * 0.075) < 0.03) & robe & (v < 0.5); px[k] = hexc(d['kesa']) * (0.85 + 0.2 * weave[k][..., None])
    px[vr(0.605, 0.62)] = dark
    # sleeves (0.63-0.8) as the robe; leggings (0.81-0.9)
    sl = vr(0.63, 0.8); px[sl] = base[sl] * (0.9 + 0.2 * weave[sl][..., None])
    lg = vr(0.81, 0.9); px[lg] = hexc(d.get('legc', d['col'][0])) * (0.88 + 0.2 * weave[lg][..., None])
    if d.get('legs') == 'hakama':
        pl = lg & ((xx % 32) < 2); px[pl] *= 0.6
    # socks white, sandal straw (0.91-0.95: left half the sock, right half the sole); the cloth round the head on the right of that row
    sk = vr(0.91, 0.95) & (u < 0.5); px[sk] = np.array([226, 222, 210]) * (0.92 + 0.1 * weave[sk][..., None])
    so = vr(0.91, 0.95) & (u >= 0.5) & (u < 1); px[so] = np.array([176, 150, 96]) * (0.8 + 0.3 * weave[so][..., None])
    hb = vr(0.91, 0.95) & (u >= 0.5); band = hexc(d.get('scarf') or 0xe8e4dc); px[hb] = band * (0.9 + 0.15 * weave[hb][..., None])
    sw = vr(0.91, 0.95) & (u >= 0.25) & (u < 0.3); px[sw] = np.array([22, 18, 16]) + 30 * weave[sw][..., None]
    # hats: straw (left), black lacquer (right)
    st = vr(0.96, 1.0) & (u < 0.5); px[st] = np.array([170, 140, 84]) * (0.75 + 0.4 * ((xx[st] % 5) < 2)[..., None])
    jg = vr(0.96, 1.0) & (u >= 0.5); px[jg] = np.array([26, 22, 20]) + 25 * weave[jg][..., None]
    return Image.fromarray(np.clip(px, 0, 255).astype(np.uint8))

def recolour_scarf(head, scarf):   # her own headscarf (it is in the head's picture): white cloth to the indigo she wears in the village
    a = np.array(head, np.float32); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / np.maximum(mx, 1); lum = mx / 255
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]; m = (sat < 0.12) & (lum > 0.42) & ~((yy > h * 0.55) & (xx < w * 0.45))
    c = np.array([(scarf >> 16) & 255, (scarf >> 8) & 255, scarf & 255], np.float32); a[m] = c * (0.55 + 0.6 * lum[m][..., None]); return Image.fromarray(a.astype(np.uint8))

def skin_paint(body, o, keep_tris):   # the forearms bare: the body picture under what the forearm triangles cover painted the hand's skin
    me = o.data; uv = me.uv_layers[0].data; S = body.size[0]; a = np.array(body, np.float32)
    def tri_px(pi):
        p = me.polygons[pi]; return [(uv[li].uv[0] * S, (1 - uv[li].uv[1]) * S) for li in p.loop_indices]
    hand = [],
    hs = []
    for pi, kind in keep_tris:
        if kind == 'hand':
            for (x, y) in tri_px(pi): hs.append(a[min(S - 1, int(y)), min(S - 1, int(x))])
    if not hs: return body
    hs = np.array(hs); lum = hs.mean(1); skin = np.median(hs[(lum > np.percentile(lum, 30)) & (lum < np.percentile(lum, 85))], 0)
    from PIL import ImageDraw
    mask = Image.new('L', body.size, 0); dr = ImageDraw.Draw(mask)
    for pi, kind in keep_tris:
        if kind == 'forearm': dr.polygon(tri_px(pi), fill=255)
    mask = np.array(mask.filter(ImageFilter.MaxFilter(5))) > 0
    noise = np.random.RandomState(3).rand(*mask.shape).astype(np.float32)
    a[mask] = skin * (0.96 + 0.06 * noise[mask][..., None]); return Image.fromarray(a.astype(np.uint8))

# ---- one body: posed hands, the modern clothes taken off and the period ones put on, the pictures in one atlas, near and far
def body(key, spec, fing):
    path, pre, sex, d = spec; name = path.split('/')[-1]; child = 'Child' in name
    A = load(fetch('Avatars/' + path + '/Export/' + name + '.fbx')); o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
    T = {k: fetch('Avatars/' + path + '/Textures/' + pre + '_' + k + '_color.tga') for k in ('body', 'head')}
    try: T['opacity'] = fetch('Avatars/' + path + '/Textures/' + pre + '_opacity_color.tga')
    except Exception: pass
    O = {}; QR = {}
    for b in BONES:
        bb = next(x for x in A.data.bones if rbname(x.name) == b[1]); O[b[0]] = vb(A.matrix_world @ bb.head_local); QR[b[0]] = qb(A.matrix_world.to_3x3().normalized() @ bb.matrix_local.to_3x3())
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
    # what the clothes cover goes: every body triangle but the hands and forearms (the head's picture keeps the neck)
    grp = {g.index: logical(g.name) for g in o.vertex_groups}; me = o.data
    def dom(vi):
        w = {}
        for g in me.vertices[vi].groups: w[grp[g.group]] = w.get(grp[g.group], 0) + g.weight
        return max(w, key=w.get) if w else 'hips'
    D = [dom(i) for i in range(len(me.vertices))]
    mats = [m.name.split('_')[-1].split('.')[0] for m in me.materials]
    keep, drop = [], []
    for p in me.polygons:
        if mats[p.material_index] != 'body': continue
        ks = [D[v] for v in p.vertices]
        if all(k.startswith('hand') for k in ks): keep.append((p.index, 'hand'))
        elif all(k.startswith('hand') or k.startswith('forearm') for k in ks) and d['sleeve'] != 'wide': keep.append((p.index, 'forearm'))
        else: drop.append(p.index)
    bodyim = tex(T['body'], 1024); bodyim = skin_paint(bodyim, o, keep)
    clothes = build_clothes(o, A, d, sex, child)
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); bmesh.ops.delete(bm, geom=[bm.faces[i] for i in drop], context='FACES'); bm.to_mesh(me); bm.free()
    gm = bpy.data.materials.new(pre + '_clothes'); me.materials.append(gm); clothes.data.materials.append(gm)
    bpy.ops.object.select_all(action='DESELECT'); clothes.select_set(True); o.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.object.join()
    mats = [m.name.split('_')[-1].split('.')[0] for m in o.data.materials]
    # the atlas
    at = Image.new('RGBA', (1024, 1024), (0, 0, 0, 255))
    at.paste(quarter(bodyim.convert('RGBA')), Q[0])
    head = tex(T['head'], 1024)
    if d.get('scarf'): head = recolour_scarf(head, d['scarf'])
    at.paste(quarter(head.convert('RGBA')), Q[1])
    if 'opacity' in T: at.paste(quarter(tex(T['opacity'], 1024, True)), Q[2])
    at.paste(quarter(cloth_tex(d, hash(key) & 0xffff).convert('RGBA')), Q[3])
    at.save(OUT + key + '.webp', 'WEBP', quality=84, method=6)
    qmap = {'body': 0, 'head': 1, 'opacity': 2, 'clothes': 3}
    near = mesh_out(o, mats, qmap)
    # far: the same, a quarter of the triangles
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.ops.object.duplicate(); o2 = bpy.context.active_object
    dm = o2.modifiers.new('far', 'DECIMATE'); dm.ratio = 0.3; bpy.context.view_layer.objects.active = o2; bpy.ops.object.modifier_apply(modifier='far')
    far = mesh_out(o2, mats, qmap)
    with open(OUT + key + '.bin', 'wb') as f:
        f.write(near['buf']); f.write(far['buf'])
    top = max(p[1] for p in near['P'])
    return {'sex': sex, 'src': name, 'O': [[round(x, 4) for x in O[b[0]]] for b in BONES], 'Q': [[round(x, 5) for x in (QR[b[0]].w, QR[b[0]].x, QR[b[0]].y, QR[b[0]].z)] for b in BONES],
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
        q = qmap.get(mats[t.material_index], 0)
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
    out = {'license': 'Microsoft Rocketbox Avatar Library (MIT), github.com/microsoft/Microsoft-Rocketbox: dressed for the village here', 'bones': [b[0] for b in BONES], 'parent': [BI[b[2]] if b[2] else -1 for b in BONES], 'fps': FPS, 'clips': {}, 'bodies': {}}
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
