# THE MICROSCOPE'S POND LIFE FACTS: python3 tools/life-bake.py: each live kind's scientific name and a short summary from iNaturalist (its Wikipedia text) and GBIF's match, into data/scope.json under "life"; the raw answers kept in data/full/life/.
import json, os, re, time, urllib.request, urllib.parse, urllib.error, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data/full/life'); os.makedirs(RAW, exist_ok=True)
KINDS = {'paramecium': 'Paramecium', 'euglena': 'Euglena', 'amoeba': 'Amoeba proteus', 'rotifer': 'Rotifera', 'volvox': 'Volvox', 'diatom': 'Bacillariophyceae', 'daphnia': 'Daphnia', 'tardigrade': 'Tardigrada'}
def get(url, name):
    f = os.path.join(RAW, name)
    if os.path.exists(f): return json.load(open(f))
    for i in range(8):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'thestrangestfleamarket.com life-bake'}), timeout=30)
            d = json.load(r); json.dump(d, open(f, 'w')); time.sleep(2); return d
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(15 * (i + 1))
    raise SystemExit('refused too often: ' + url)
def short(t, n=260):
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', t or ''))).strip()
    while '(/' in t:
        a = t.index('(/'); d = 0
        for b in range(a, len(t)):
            d += (t[b] == '(') - (t[b] == ')')
            if d == 0: break
        t = (t[:a].rstrip() + t[b + 1:]).strip()
    t = t.replace(' ,', ',')
    if len(t) <= n: return t
    ends = [m.end() - 1 for m in re.finditer(r'[a-z0-9\)]{3}\. ', t[:n + 1])]
    return t[:ends[-1]] if ends and ends[-1] > 80 else t[:n].rsplit(' ', 1)[0] + '…'
life = {}
for k, sci in KINDS.items():
    s = get('https://api.inaturalist.org/v1/taxa?' + urllib.parse.urlencode({'q': sci, 'per_page': 5}), k + '-search.json')
    t = next((r for r in s['results'] if r['name'].lower() == sci.lower()), s['results'][0])
    d = get('https://api.inaturalist.org/v1/taxa/%d' % t['id'], k + '-taxon.json')['results'][0]
    g = get('https://api.gbif.org/v1/species/match?' + urllib.parse.urlencode({'name': sci}), k + '-gbif.json')
    life[k] = {'sci': d['name'], 'rank': d.get('rank', ''), 'common': (d.get('preferred_common_name') or '').upper(), 'about': short(d.get('wikipedia_summary')),
               'kingdom': g.get('kingdom', ''), 'phylum': g.get('phylum', ''), 'credit': 'iNaturalist (Wikipedia, CC BY-SA) · GBIF'}
    print(k, life[k]['sci'], life[k]['about'][:60])
p = os.path.join(ROOT, 'data/scope.json'); D = json.load(open(p)); D['life'] = life
open(p, 'w').write(json.dumps(D, ensure_ascii=False, indent=1))
