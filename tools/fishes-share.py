#!/usr/bin/env python3
# THE FISH FILES' SHARED BODIES: python3 tools/fishes-share.py, after any fish bake (fishes-bake.cjs, goldfish-paint.py, fish-bake.py). In data/fishes.json a
# fish whose body (p, u, i) is another's keeps only its skin and says whose body it is ('of': the koi's colours and the goldfish are the koi, the bluegill the
# sunfish); data/fish.json drops the fish that data/fishes.json already has (the page draws that one). Run twice, it changes nothing.
import json, os
A = json.load(open('data/fishes.json')); B = json.load(open('data/fish.json')); seen = {}; n = 0
for k, v in A.items():
    if 'of' in v: continue
    key = (v['p'], v.get('u'), v['i'])
    if key in seen:
        for f in ('p', 'u', 'i'): v.pop(f, None)
        v['of'] = seen[key]; n += 1
    else: seen[key] = k
gone = [k for k in list(B) if k in A]
for k in gone: del B[k]
json.dump(A, open('data/fishes.json', 'w'), separators=(',', ':')); json.dump(B, open('data/fish.json', 'w'), separators=(',', ':'))
print(n, 'bodies shared;', 'dropped from fish.json:', ', '.join(gone) or 'none;', os.path.getsize('data/fishes.json') // 1024, 'KB and', os.path.getsize('data/fish.json') // 1024, 'KB')
