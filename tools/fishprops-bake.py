# THE FISH MARKET'S PROPS: the Polyfork things it stands about (trucks, barrels, bins, ice machines, a boat on its stand...) picked out of the place library (data/weplace-*.json) into data/fishprops.json, so the market fetches only these. Run: python3 tools/fishprops-bake.py
import json, glob, os
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/..'
WANT = ['box-trailer', 'semi-tractor', 'pickup-truck', 'small-fishing-boat', 'wooden-barrel', 'whiskey-barrel', 'camp-cooler', 'hotel-ice-machine', 'stainless-prep-table', 'timber-trestle-table',
        'metal-trash-can', 'roll-out-wheelie-bin', 'standing-brazier', 'site-traffic-cone', 'mooring-bollard', 'lifebuoy-on-a-post', 'race-sack', 'oil-can-rack', 'newspaper-box',
        'pay-phone-booth', 'fire-alarm-call-box', 'soda-vending-machine', 'wheeled-fire-extinguisher', 'field-barricade']
ALL = {}
for f in sorted(glob.glob(ROOT + '/data/weplace-*.json')):
    ALL.update(json.load(open(f)))
out = {}
for w in WANT:
    k = next(k for k in ALL if k.rsplit('-', 1)[0] == w)
    d = ALL[k]
    out[w] = {'n': d['n'], 'b': d['b'], 'p': d['p'], 'c': d['c']}
    print(w, [round(v, 2) for v in d['b']], d.get('f'))
out['license'] = json.load(open(ROOT + '/data/weplace.json'))['license']
json.dump(out, open(ROOT + '/data/fishprops.json', 'w'), separators=(',', ':'))
print(os.path.getsize(ROOT + '/data/fishprops.json') // 1000, 'KB')
