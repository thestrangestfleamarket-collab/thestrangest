#!/usr/bin/env python3
# THE MESSIER CATALOGUE: python3 tools/messier-bake.py [wikitext]  (the raw text of en.wikipedia.org "Messier object"; without it, data/full/messier.json as last parsed)
# writes data/full/messier.json (all 110: place, brightness, size, kind) and lays them into data/scope.json's sky list, keeping the entries that have pictures.
import json, re, sys, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL = os.path.join(R, 'data/full/messier.json')
def clean(s):
    s = re.sub(r'<ref[^>]*/>', '', s); s = re.sub(r'<ref.*?</ref>', '', s, flags=re.S)
    s = re.sub(r'\{\{shy\|([^}]*)\}\}', lambda m: m.group(1).replace('|', ''), s)
    s = re.sub(r'\{\{dsv\|[^}]*\}\}\s*\|', '', s); s = re.sub(r'\{\{sdash[^}]*\}\}', '', s); s = re.sub(r'\{\{wbr\}\}', '', s)
    s = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', s); s = re.sub(r'\[\[([^\]]*)\]\]', r'\1', s)
    return s.replace("''", '').replace('&nbsp;', ' ').strip()
def kind(t):
    t = t.lower()
    if 'globular' in t: return 'globular'
    if 'open cluster' in t or 'asterism' in t or 'star cloud' in t or 'double star' in t or 'cluster' in t: return 'cluster'
    if 'galaxy' in t: return 'galaxy'
    if 'planetary' in t: return 'planetary'
    return 'nebula'
def size(t):   # the longest side, degrees
    best = 0
    for v, u in re.findall(r'([\d.]+)\s*([°′″\'"])', t):
        best = max(best, float(v) * {'°': 1, '′': 1/60, "'": 1/60, '″': 1/3600, '"': 1/3600}[u])
    return best
def parse(txt):
    out = []
    for row in txt.split('\n|-')[1:]:
        m = re.search(r'\|M(\d+)\]\]', row)
        ra = re.search(r'\{\{RA\|([^}]*)\}\}', row); de = re.search(r'\{\{DEC\|([^}]*)\}\}', row)
        if not (m and ra and de): continue
        hms = lambda t: sum(float(x.replace('−', '-').lstrip('+-')) / 60 ** i for i, x in enumerate(t.split('|')[:3]))
        c = [clean(x) for x in re.split(r'\n\|(?!\-)', row)[1:]]
        mag = re.search(r'-?[\d.]+', c[6].replace('−', '-'))
        out.append({'n': int(m.group(1)), 'ngc': c[0], 'name': c[1], 'type': c[3], 'kly': c[4], 'con': c[5], 'mag': float(mag.group(0)) if mag else None, 'size': round(size(c[7]), 4),
                    'ra': round(hms(ra.group(1)) * 15, 3), 'dec': round((-1 if de.group(1).strip()[0] in '-−' else 1) * hms(de.group(1)), 3)})
    return sorted(out, key=lambda o: o['n'])
if len(sys.argv) > 1:
    L = parse(open(sys.argv[1], encoding='utf8').read())
    assert len(L) == 110, len(L)
    json.dump({'note': 'The 110 Messier objects: places (J2000), brightness, size and kind, from the table of en.wikipedia.org/wiki/Messier_object (facts; text CC BY-SA 4.0). Made by tools/messier-bake.py.', 'list': L}, open(FULL, 'w'), indent=1, ensure_ascii=False)
L = json.load(open(FULL, encoding='utf8'))['list']
P = os.path.join(R, 'data/scope.json'); D = json.load(open(P, encoding='utf8'))
have = {t['id']: t for t in D['sky']}; keep = [t for t in D['sky'] if t.get('ra') is None]
KN = {'globular': 'a globular cluster: hundreds of thousands of old stars in a ball', 'cluster': 'an open cluster: young stars born together', 'galaxy': 'a galaxy: billions of stars, far outside our own', 'planetary': 'a planetary nebula: the shell a dying star blew off', 'nebula': 'a nebula: a cloud of gas and dust'}
for o in L:
    i = 'm%d' % o['n']; t = dict(have.get(i, {})); nm = o['name'].upper()
    t.setdefault('id', i); t['m'] = o['n']
    t['name'] = t.get('name') if i in have else ('M%d' % o['n'] + (' · ' + nm if nm else ''))
    if i in have and not t['name'].startswith('M%d' % o['n']): t['name'] = 'M%d · %s' % (o['n'], t['name'])
    t['kind'] = t.get('kind') if i in have and t.get('kind') in ('nebula', 'galaxy', 'cluster') and o['n'] != 13 else kind(o['type'])
    if kind(o['type']) in ('globular', 'planetary'): t['kind'] = kind(o['type'])
    t['ra'] = o['ra']; t['dec'] = o['dec']; t['mag'] = o['mag']; t['con'] = o['con'].upper()
    if 'fov_deg' not in t: t['fov_deg'] = max(.02, o['size'] or .1)
    if 'about' not in t: t['about'] = ('M%d in %s, %s' % (o['n'], o['con'], KN[t['kind']]) + (', about %s thousand light-years away.' % o['kly'].replace('–', ' to ') if re.match(r'^[\d.,–]+$', o['kly']) else '.'))
    keep.append(t)
D['sky'] = keep
json.dump(D, open(P, 'w'), indent=1, ensure_ascii=False)
print(len(L), 'Messier objects;', sum(1 for t in keep if t.get('file')), 'sky entries with a picture;', os.path.getsize(P), 'bytes')
