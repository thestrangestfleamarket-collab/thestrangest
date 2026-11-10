# THE BOOKSTORE'S COVERS (owner, 7 Nov 2026: "add real covers for the new books"): for every book in data/library.json without a cover, the earliest
# library scan on archive.org (published 1930 or before, the same title and author) gives its front board, resized to 300 px wide (JPEG q80) as
# data/books/covers/bk-<id>.jpg; the book's `cover` and `ed` are set and its source recorded in data/full/books-sources.json.
# Then run python3 tools/library-files.py. Run: python3 tools/library-covers.py [id ...]
import json, re, sys, io, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageFilter, ImageStat
UA = {'User-Agent': 'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}
SKIPC = {'opensource', 'community', 'opensource_media', 'test_collection', 'additional_collections'}
STOP = {'the', 'a', 'an', 'of', 'and', 'or', 'on', 'in', 'to', 'its', 'with', 'for', 'being', 'by'}
def get(u, t=60):
    for k in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t).read()
        except Exception:
            if k == 3: raise
            time.sleep(2 * 2 ** k)
def words(t): return [w for w in re.sub(r'[^a-z0-9 ]', ' ', t.lower().replace('&', ' and ')).split() if w not in STOP]
def surname(a):
    a = re.sub(r'\(.*?\)|\b(jr|sr)\.?', '', a.split(' and ')[0].split(',')[0]).strip()
    return a.split()[-1].lower() if a and a.lower() not in ('anonymous', 'various', 'unknown') else ''
def find(b):
    tw = words(b['t'])[:3]; sn = surname(b['a'])
    if not tw: return None
    q = 'title:(' + ' '.join(tw) + ')' + (' AND creator:(' + sn + ')' if sn else '') + ' AND mediatype:texts AND date:[1000-01-01 TO 1930-12-31]'
    u = 'https://archive.org/advancedsearch.php?' + urllib.parse.urlencode([('q', q), ('fl[]', 'identifier'), ('fl[]', 'title'), ('fl[]', 'date'), ('fl[]', 'creator'), ('fl[]', 'collection'), ('fl[]', 'publisher'), ('fl[]', 'downloads'), ('fl[]', 'imagecount'), ('rows', '60'), ('output', 'json')])
    docs = json.loads(get(u))['response']['docs']; out = []
    for d in docs:
        col = d.get('collection', []); col = col if isinstance(col, list) else [col]
        if any(c in SKIPC for c in col) or not d.get('imagecount') or re.match(r'(bwb_|isbn_)', d['identifier']) or '0000' in d['identifier']: continue   # (modern lending copies: a modern printing's cover)
        at = words(d.get('title', '') if isinstance(d.get('title'), str) else d.get('title', [''])[0])
        if at[:len(tw)] != tw: continue   # the same title, word for word at its start
        cr = ' '.join(d.get('creator', [])) if isinstance(d.get('creator'), list) else d.get('creator', '')
        if sn and sn not in cr.lower(): continue
        y = int(str(d.get('date', '9999'))[:4]) if str(d.get('date', ''))[:4].isdigit() else 9999
        if b.get('y') and y < b['y']: continue   # (a date before the book was written is the catalogue's mistake)
        out.append((y, -int(d.get('downloads') or 0), d))
    return sorted(out, key=lambda r: r[:2])[:8]
def one(b):
    try:
        best = None
        for y, _, d in find(b) or []:   # the earliest decorated board (a plain rebound board says nothing; a title page only if no board will do)
            pages = ['n1', 'n2'] if d['identifier'].endswith('goog') else ['cover']   # (Google's scans open on its notice; the board follows)
            im = None
            for pgn in pages:
                try: im = Image.open(io.BytesIO(get('https://archive.org/download/' + d['identifier'] + '/page/' + pgn + '_w800.jpg', 120))).convert('RGB')
                except Exception: continue
                g0 = im.convert('L').resize((60, 90)); m0 = ImageStat.Stat(g0).mean[0]
                if m0 < 225: break
            if im is None: continue
            if im.width < 200: continue
            g = im.convert('L').resize((150, 225)); m = ImageStat.Stat(g).mean[0]; e = ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).mean[0]
            if e >= 12 and m < 140: best = (y, d, im); break
            if not best and e >= 10 and m < 225: best = (y, d, im)
        if not best: return b['id'], None
        y, d, im = best
        im = im.resize((300, round(im.height * 300 / im.width)), Image.LANCZOS); f = 'data/books/covers/bk-' + b['id'] + '.jpg'; im.save(f, 'JPEG', quality=80)
        pub = d.get('publisher', ''); pub = (pub[0] if isinstance(pub, list) else pub).strip(' .;:,')
        ed = pub if str(y) in pub else (pub + ', ' + str(y) if pub else 'the ' + str(y) + ' edition')
        return b['id'], {'file': f, 'source': 'https://archive.org/details/' + d['identifier'], 'original': 'https://archive.org/download/' + d['identifier'] + '/page/cover_w800.jpg',
                         'credit': 'Internet Archive (' + ', '.join((d.get('collection') if isinstance(d.get('collection'), list) else [d.get('collection', '')])[:2]) + ')',
                         'licence': 'Public domain (edition published ' + str(y) + ', pre-1931)', 'licence_url': 'https://archive.org/details/' + d['identifier'], 'edition': ed}
    except Exception as e:
        print('fail', b['id'], e, flush=True); return b['id'], None
L = json.load(open('data/library.json')); SRC = json.load(open('data/full/books-sources.json'))
todo = [b for c in L['cases'] for b in c['books'] if (b['id'] in sys.argv[1:]) if sys.argv[1:]] or [b for c in L['cases'] for b in c['books'] if not b.get('cover')]
PROG = 'data/full/covers-progress.jsonl'   # (each book's answer as it comes, so a stopped run picks up where it was)
got, seen = {}, set()
try:
    for l in open(PROG): i, r = json.loads(l); seen.add(i); got.update({i: r} if r else {})
except FileNotFoundError: pass
todo = [b for b in todo if b['id'] not in seen]
with ThreadPoolExecutor(8) as ex:
    for n, (i, r) in enumerate(ex.map(one, todo)):
        if r: got[i] = r
        open(PROG, 'a').write(json.dumps([i, r]) + '\n')
        if n % 50 == 0: print(n, len(todo), len(got), flush=True)
for c in L['cases']:
    for b in c['books']:
        if b['id'] in got: b['cover'] = got[b['id']]['file'][5:]; b['ed'] = got[b['id']]['edition']
SRC['files'] = [x for x in SRC['files'] if x['file'] not in {g['file'] for g in got.values()}] + list(got.values())
with open('data/library.json', 'w') as f:
    f.write('{"note":' + json.dumps(L['note']) + ',"cases":[\n' + ',\n'.join('{"id":' + json.dumps(c['id']) + ',"name":' + json.dumps(c['name']) + ',"books":[\n' + ',\n'.join(json.dumps(b, ensure_ascii=False) for b in c['books']) + ']}' for c in L['cases']) + '\n]}\n')
json.dump(SRC, open('data/full/books-sources.json', 'w'), indent=1, ensure_ascii=False)
import os; os.remove(PROG) if os.path.exists(PROG) else None
print('covers', len(got), 'of', len(todo), '; still without:', [b['id'] for b in todo if b['id'] not in got])
