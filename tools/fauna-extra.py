#!/usr/bin/env python3
# THE ROAMING ANIMALS' EXTRAS: python3 tools/fauna-extra.py. The park's and the dungeon's animals are drawn from the pet store's files (data/pets/<kind>.json);
# this writes data/fauna-extra.json with only what those lack, read from the full bake (data/full/fauna.json): which pet file each is, the clips a pet has not
# (Sleep, Sit, Bark, Howl, Graze), its part names and colours where they differ, and the three animals with a body of their own (BlackCat, Horse, WildHorse).
import json, os
F = json.load(open('data/full/fauna.json')); ALIAS = {'woodant': 'ant', 'crab': 'hermit'}
out = {'pet': {}, 'clips': {}, 'parts': {}, 'c': {}, 'own': {}}
for k, v in F.items():
    pk = ALIAS.get(k.lower(), k.lower()); p = 'data/pets/' + pk + '.json'; P = json.load(open(p)) if os.path.exists(p) else None
    if not P or any(P['mesh'][f] != v['mesh'][f] for f in ('n', 'p', 'i', 'j', 'w')) or P['rig']['names'] != v['rig']['names']: out['own'][k] = v; continue
    out['pet'][k] = pk
    ex = {n.split('_', 1)[1]: c for n, c in v['clips'].items() if n.split('_', 1)[1] not in P['clips']}
    if ex: out['clips'][k] = ex
    if v['mesh']['parts'] != P['mesh']['parts']: out['parts'][k] = v['mesh']['parts']
    if v['mesh']['c'] != P['mesh']['c']: out['c'][k] = v['mesh']['c']
json.dump(out, open('data/fauna-extra.json', 'w'), separators=(',', ':'))
print('data/fauna-extra.json', os.path.getsize('data/fauna-extra.json') // 1024, 'KB;', len(out['pet']), 'from pet files,', len(out['own']), 'of their own:', ', '.join(out['own']))
