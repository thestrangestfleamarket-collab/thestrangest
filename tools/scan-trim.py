import base64, json, sys
from collections import Counter, defaultdict

K = int(sys.argv[1]) if len(sys.argv) > 1 else 4
full = json.load(open('data/full/museum-scans.json'))
out = {}
for name, S in full.items():
    raw = base64.b64decode(S['runs'])
    vox = {}
    for q in range(0, len(raw) - 4, 5):
        x, y, z, L, t = raw[q:q + 5]
        for zz in range(z, z + L):
            vox[(x, y, zz)] = t
    cells = defaultdict(list)
    for (x, y, z), t in vox.items():
        cells[(x // K, y // K, z // K)].append(t)
    occ = {c: Counter(v).most_common(1)[0][0] for c, v in cells.items() if len(v) >= K * K * K / 4}
    cols = defaultdict(list)
    for (x, y, z), t in occ.items():
        cols[(x, y)].append((z, t))
    runs = bytearray()
    for (x, y), l in sorted(cols.items()):
        l.sort()
        a = None
        for z, t in l + [(None, None)]:
            if a and z == a[0] + a[1] and t == a[2]:
                a[1] += 1
                continue
            if a:
                runs += bytes([x * K, y * K, a[0] * K, a[1] * K, a[2]])
            a = [z, 1, t] if z is not None else None
    out[name] = {'W': S['W'], 'D': S['D'], 'H': S['H'], 'k': K, 'pal': S['pal'], 'runs': base64.b64encode(bytes(runs)).decode()}
    print(name, len(runs) // 5, 'boxes')
json.dump(out, open('data/museum.json', 'w'), separators=(',', ':'))
