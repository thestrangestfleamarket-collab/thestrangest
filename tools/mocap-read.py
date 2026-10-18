# MOTION CAPTURE IN (owner, 18 Oct 2026: "look for motions or presets, best way to get all those kinds of animations and movements"; his pick:
# CMU's free library and Mixamo): a CMU recording (its skeleton .asf and its motion .amc) read into each joint's place, frame by frame, in
# metres, y up. The Walker's joints only: pelvis, hips, knees, ankles, balls, toes, the spine's three, the neck, the head, shoulders, elbows,
# wrists. tools/mocap-rig.cjs fits his rig to it.  python3 tools/mocap-read.py subject.asf clip.amc out.json [every=4] [from=0] [to=-1]
import sys, json, math
import numpy as np
def rot(ax, a):
    c, s = math.cos(a), math.sin(a)
    return {'x': np.array([[1,0,0],[0,c,-s],[0,s,c]]), 'y': np.array([[c,0,s],[0,1,0],[-s,0,c]]), 'z': np.array([[c,-s,0],[s,c,0],[0,0,1]])}[ax]
def eul(xyz):  # CMU's: static x, then y, then z
    x, y, z = [math.radians(v) for v in xyz]
    return rot('z', z) @ rot('y', y) @ rot('x', x)
def read_asf(p):
    L = [l.strip() for l in open(p)]; bones = {}; hier = {}; unit = 1.0; i = 0; mode = None
    while i < len(L):
        l = L[i]
        if l.startswith(':units'): mode = 'units'
        elif l.startswith(':bonedata'): mode = 'bones'
        elif l.startswith(':hierarchy'): mode = 'hier'
        elif l.startswith(':'): mode = None
        elif mode == 'units' and l.startswith('length'): unit = float(l.split()[1])
        elif mode == 'bones' and l == 'begin':
            b = {'dof': []}; i += 1
            while L[i] != 'end':
                t = L[i].split()
                if t[0] == 'name': b['name'] = t[1]
                elif t[0] == 'direction': b['dir'] = np.array([float(v) for v in t[1:4]])
                elif t[0] == 'length': b['len'] = float(t[1])
                elif t[0] == 'axis': b['C'] = eul([float(v) for v in t[1:4]])
                elif t[0] == 'dof': b['dof'] = t[1:]
                i += 1
            bones[b['name']] = b
        elif mode == 'hier' and l not in ('begin', 'end'):
            t = l.split(); hier.update({c: t[0] for c in t[1:]})
        i += 1
    return bones, hier, unit
def read_amc(p):
    F = []; cur = None
    for l in open(p):
        l = l.strip()
        if not l or l[0] in '#:': continue
        t = l.split()
        if t[0].isdigit(): cur = {}; F.append(cur)
        elif cur is not None: cur[t[0]] = [float(v) for v in t[1:]]
    return F
def fk(bones, hier, f):
    r = f['root']; P = {'root': np.array(r[:3])}; M = {'root': eul(r[3:6])}
    order = ['root']; todo = list(hier.keys())
    while todo:
        for b in list(todo):
            if hier[b] in P:
                B = bones[b]; v = f.get(b, []); a = {'rx': 0, 'ry': 0, 'rz': 0}
                for k, d in zip(B['dof'], v): a[k] = d
                m = M[hier[b]] @ B['C'] @ eul([a['rx'], a['ry'], a['rz']]) @ B['C'].T
                M[b] = m; P[b] = P[hier[b]] + B['len'] * (m @ B['dir']); todo.remove(b)
    return P
JOINTS = {'pelvis': 'root', 'hipL': 'lhipjoint', 'hipR': 'rhipjoint', 'kneeL': 'lfemur', 'kneeR': 'rfemur', 'ankleL': 'ltibia', 'ankleR': 'rtibia',
          'ballL': 'lfoot', 'ballR': 'rfoot', 'toeL': 'ltoes', 'toeR': 'rtoes', 'spine': 'lowerback', 'chest': 'upperback', 'neck': 'lowerneck', 'headBase': 'upperneck',
          'head': 'head', 'shoulderL': 'lclavicle', 'shoulderR': 'rclavicle', 'elbowL': 'lhumerus', 'elbowR': 'rhumerus', 'wristL': 'lradius', 'wristR': 'rradius'}
if __name__ == '__main__':
    asf, amc, out = sys.argv[1:4]; every = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    a = int(sys.argv[5]) if len(sys.argv) > 5 else 0; b = int(sys.argv[6]) if len(sys.argv) > 6 else -1
    bones, hier, unit = read_asf(asf); F = read_amc(amc); F = F[a:(b if b > 0 else len(F))][::every]
    k = 0.0254 / unit   # the file's lengths are inches x unit
    frames = [{j: [round(float(x) * k, 4) for x in fk(bones, hier, f)[c]] for j, c in JOINTS.items()} for f in F]
    json.dump({'fps': 120 / every, 'src': amc.split('/')[-1], 'frames': frames}, open(out, 'w'))
    print(len(frames), 'frames at', 120 / every, 'fps ->', out)
