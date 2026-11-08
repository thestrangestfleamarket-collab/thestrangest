# The bookstore café's Polyfork pieces: copied from the world editor's catalog (data/weplace-*.json) into data/bookstore.json in the kit's format (metres), so they load with the bookstore.
import json, base64, struct, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
PICK = {'cafecounter': 'cafe-counter-d8b226', 'bistrotable': 'bistro-table-877a6d', 'bistrochair': 'bistro-chair-7c354d',
        'chalkmenu': 'chalkboard-menu-board-a24d9d', 'sideboard': 'sideboard-dd343b', 'menuholder': 'table-menu-holder-1a61dc'}
src = {}
for i in range(13):
    d = json.load(open(os.path.join(ROOT, 'data', f'weplace-{i}.json')))
    for k, v in PICK.items():
        if v in d: src[k] = d[v]
out = json.load(open(os.path.join(ROOT, 'data', 'bookstore.json')))
for k, D in src.items():
    q = struct.unpack('<%dh' % (len(base64.b64decode(D['p'])) // 2), base64.b64decode(D['p'])); b = D['b']
    P = [b[i % 3] + (v + 32768) / 65535 * (b[i % 3 + 3] - b[i % 3]) for i, v in enumerate(q)]
    lo = [min(P[a::3]) for a in range(3)]; rng = max(max(P[a::3]) - lo[a] for a in range(3)) or 1; sc = rng / 65000
    Q = [max(-32768, min(32767, round((v - lo[i % 3]) / sc) - 32500)) for i, v in enumerate(P)]
    n = len(P) // 3; assert n < 65536
    out[k] = {'n': n, 'lo': [round(x, 5) for x in lo], 'sc': sc, 'p': base64.b64encode(struct.pack('<%dh' % len(Q), *Q)).decode(), 'c': D['c'],
              'i': base64.b64encode(struct.pack('<%dH' % n, *range(n))).decode(), 'i32': 0, 'tris': n // 3,
              'size': [round(max(P[a::3]) - lo[a], 3) for a in range(3)]}
    print(k, n, out[k]['size'])
json.dump(out, open(os.path.join(ROOT, 'data', 'bookstore.json'), 'w'), separators=(',', ':'))
