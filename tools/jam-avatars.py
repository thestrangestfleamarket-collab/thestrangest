#!/usr/bin/env python3
# STADIUM JAM's avatars: eight Polyfork looks out of the baked wardrobe (data/pfavatar*.json), each one welded mesh on the 15-bone rig
# with its colours, into data/jam/avatars.json. Run: python3 tools/jam-avatars.py
import json, base64
import numpy as np
D = 'data'
I = json.load(open(f'{D}/pfavatar.json'))
META = {p['n']: p for p in I['pieces']}
chunks = {}
def piece(fig, n):
    c = META[n]['c'][fig]
    key = (fig, c)
    if key not in chunks:
        chunks[key] = {p['n']: p for p in json.load(open(f'{D}/pfavatar-{fig}-{c:02d}.json'))['pieces']}
    return chunks[key][n]

b64 = base64.b64decode
rgb = lambda h: [int(h[i:i + 2], 16) for i in (0, 2, 4)]
SKINS = ['d9a984', 'c08a64', 'f3d5bd', '7e4c2f', 'e6b892', 'a26a45', '5c3622', 'e6b892']
B = 1  # medium build

def culled(has):
    A = has('arms') and has('hands')
    return [has('trunk') and has('waist'), has('waist') and has('seat'), has('briefs'),
            has('legs') and (not has('shins') or has('feet')), has('feet'), A,
            has('upperArms') and has('hands') and not A,
            has('upperArms') and has('armCut') and not has('hands') and not has('arms'), has('ears'), has('eyes')]

def build(outfit, skin):
    fig = outfit['f']
    F = json.load(open(f'{D}/pfavatar-{fig}.json'))
    hair = outfit.get('hair') or '3b2a1e'
    worn = []
    for slot, (n, colour) in outfit['w'].items():
        if slot in ('righthand', 'lefthand', 'back'):
            continue  # props: hands stay free for sticks and strings
        worn.append((slot, piece(fig, n), colour))
    cov = set(c for _, p, _ in worn for c in p['covers'])
    hide = culled(lambda c: c in cov)
    hat = any(s == 'hat' for s, _, _ in worn)
    coat = next((p for s, p, _ in worn if s == 'coat'), None)
    parts = [(F['body']['v'][B], F['body']['zones'], F['body']['pal'], None, '', 'body')]
    for slot, p, colour in worn:
        if slot == 'hair' and 'hair' in cov:
            continue
        alt = (slot == 'hair' and hat or slot == 'top' and coat and 'sleeves' in coat['covers']) and p.get('alt') and p['alt'][B]
        v = alt or p['v'][B]
        if v:
            parts.append((v, p['zones'], p['pal'], p.get('main'), colour, slot))
    P, C, BN, W, T, base = [], [], [], [], [], 0
    for v, zones, pal, main, colour, slot in parts:
        q = np.frombuffer(b64(v['pos']), dtype='<i2').reshape(-1, 3).astype(np.float64)
        pos = (q + 32500) * v['sc'] + np.array(v['lo'])
        tri = np.frombuffer(b64(v['tri']), dtype='<u2').reshape(-1, 3).astype(np.int64)
        zone = np.frombuffer(b64(v['zone']), dtype=np.uint8)
        if v.get('reg'):
            reg = np.frombuffer(b64(v['reg']), dtype=np.uint8)
            keep = np.array([not (r < 255 and hide[r]) for r in reg])
            tri = tri[keep]
        cols = []
        for zi, z in enumerate(zones):
            c = pal[zi][1:]
            if z.startswith('=#'): c = z[2:]
            elif z == 'skin': c = skin
            elif z.startswith('hair') or z == 'brow': c = hair
            if colour and main and zi in main: c = colour
            cols.append(rgb(c))
        cols = np.array(cols, dtype=np.uint8)
        P.append(pos); C.append(cols[zone]); T.append(tri + base)
        BN.append(np.frombuffer(b64(v['bone']), dtype=np.uint8).reshape(-1, 2))
        W.append(np.frombuffer(b64(v['w']), dtype=np.uint8))
        base += len(pos)
    e = lambda a, t: base64.b64encode(np.ascontiguousarray(np.concatenate(a)).astype(t).tobytes()).decode()
    return {'name': outfit['t'], 'fig': fig, 'pos': e(P, '<f4'), 'col': e(C, np.uint8), 'bone': e(BN, np.uint8),
            'w': e(W, np.uint8), 'tri': e(T, '<u4'), 'verts': base}

want = ['STREET SKATER', 'VERT SKATER', 'LOUNGE CROONER', 'ROLLER SKATER', 'VETERAN POOL SKATER']
by = {o['t']: o for o in I['outfits']}
picks = [by[t] for t in want if t in by]
for g in ('CITY', 'CAFE', 'BOARDWALK', 'UNIVERSITY', 'NEIGHBOURHOOD'):
    for o in I['outfits']:
        if o['g'] == g and o not in picks and len(picks) < 8 and 'KID' not in o['t'] and 'top' in o['w']:
            picks.append(o); break
looks = [build(o, SKINS[i % len(SKINS)]) for i, o in enumerate(picks)]
skel = {f: json.load(open(f'{D}/pfavatar-{f}.json'))['skel'] for f in 'mf'}
json.dump({'credit': 'Polyfork (polyfork.dev)', 'skel': skel, 'looks': looks},
          open('data/jam/avatars.json', 'w'), separators=(',', ':'))
print([(l['name'], l['fig'], l['verts']) for l in looks])
