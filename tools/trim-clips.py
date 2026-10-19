import base64, glob, json, math, re, struct

FPS = 12
code = ''.join(open(f).read() for f in glob.glob('src/*.js'))
named = lambda n: re.search(r"['\"`]" + re.escape(n) + r"['\"`]", code) is not None

def unpack(s, fmt):
    b = base64.b64decode(s)
    return list(struct.unpack('<%d%s' % (len(b) // struct.calcsize(fmt), fmt), b))

def pack(v, fmt):
    return base64.b64encode(struct.pack('<%d%s' % (len(v), fmt), *v)).decode()

def resample(C, nb):
    n, dur = C['n'], C['dur']
    m = max(2, round(dur * FPS) + 1)
    if m >= n:
        return C
    Q = unpack(C['q'], 'h')
    q = []
    for k in range(m):
        s = k * (n - 1) / (m - 1)
        a = min(int(s), n - 2)
        t = s - a
        for j in range(nb):
            A = Q[(a * nb + j) * 4:(a * nb + j) * 4 + 4]
            B = Q[((a + 1) * nb + j) * 4:((a + 1) * nb + j) * 4 + 4]
            if sum(x * y for x, y in zip(A, B)) < 0:
                B = [-x for x in B]
            v = [x + (y - x) * t for x, y in zip(A, B)]
            L = math.sqrt(sum(x * x for x in v)) or 1
            q += [round(x / L * 32000) for x in v]
    p = {}
    for bn, s in C['p'].items():
        P = unpack(s, 'f')
        o = []
        for k in range(m):
            u = k * (n - 1) / (m - 1)
            a = min(int(u), n - 2)
            t = u - a
            o += [P[a * 3 + c] + (P[(a + 1) * 3 + c] - P[a * 3 + c]) * t for c in range(3)]
        p[bn] = pack(o, 'f')
    return {**C, 'n': m, 'q': pack(q, 'h'), 'p': p}

def trim(clips, nb, label):
    keep = {k: resample(v, nb) for k, v in clips.items() if named(k)}
    print(label, len(clips), '->', len(keep), 'clips')
    return keep

def bones(C, n):
    return len(unpack(C['q'], 'h')) // 4 // n

def run(path, groups):
    d = json.load(open(path))
    for label, get, put in groups(d):
        clips = get()
        if not clips:
            continue
        c0 = next(iter(clips.values()))
        put(trim(clips, bones(c0, c0['n']), label))
    json.dump(d, open(path, 'w'), separators=(',', ':'))

def pawns(d):
    yield 'pawns', lambda: d['hero_m']['clips'], lambda v: d['hero_m'].__setitem__('clips', v)

def flat(d):
    yield 'clips', lambda: d['clips'], lambda v: d.__setitem__('clips', v)

def creatures(d):
    for k in d:
        yield k, (lambda k=k: d[k]['clips']), (lambda v, k=k: d[k].__setitem__('clips', v))

run('data/pawns.json', pawns)
run('data/skel.json', flat)
run('data/dragon.json', flat)
run('data/creatures.json', creatures)

def ual(d):
    yield 'ual', lambda: d['ual']['clips'], lambda v: d['ual'].__setitem__('clips', v)

run('data/full/ual.json', ual)
