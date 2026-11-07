# THE BOOKSTORE'S MODERN BOOKS (owner, 7 Nov 2026: "use the most modern books possible first", "include the non-commercial ones too"): free modern
# guides (US government works, Creative Commons) put first on each skill's case, the old Gutenberg books filling the rest of its forty.
# Each book's words (PDF, HTML or text) become data/books/text/<id>.txt.gz (gzip; the reader unpacks it), its first page the cover; the book
# keeps its source (`src`), licence (`lic`) and page (`page`) for its card. The list: data/full/books-modern.json {skill: [{t,a,y,url,page,format,licence,...}]}.
# Downloads are cached in .cache/modern/ (never committed). Then: python3 tools/library-files.py. Run: python3 tools/library-modern.py
import json, re, os, gzip, subprocess, html, hashlib, urllib.request, collections
from html.parser import HTMLParser
from PIL import Image
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}
CACHE = '.cache/modern'; os.makedirs(CACHE, exist_ok=True); os.makedirs('data/books/text', exist_ok=True)
MAXMB = 120
def fetch(u):
    f = os.path.join(CACHE, hashlib.sha1(u.encode()).hexdigest()[:16])
    if not os.path.exists(f):
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=300); n = int(r.headers.get('content-length') or 0)
        if n > MAXMB * 2**20: raise Exception(f'too big ({n >> 20} MB)')
        open(f + '.part', 'wb').write(r.read()); os.replace(f + '.part', f)
    return f
class Text(HTMLParser):
    BLOCK = {'p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'section', 'article', 'blockquote', 'pre', 'figcaption', 'dt', 'dd'}
    def __init__(s): super().__init__(); s.out = []; s.skip = 0
    def handle_starttag(s, t, a):
        if t in ('script', 'style', 'nav', 'header', 'footer', 'noscript', 'svg'): s.skip += 1
        elif t in s.BLOCK: s.out.append('\n\n')
    def handle_endtag(s, t):
        if t in ('script', 'style', 'nav', 'header', 'footer', 'noscript', 'svg'): s.skip = max(0, s.skip - 1)
        elif t in s.BLOCK: s.out.append('\n\n')
    def handle_data(s, d):
        if not s.skip: s.out.append(d)
def from_pdf(f):
    t = subprocess.run(['pdftotext', '-enc', 'UTF-8', f, '-'], capture_output=True, timeout=600).stdout.decode('utf8', 'replace')
    pages = t.split('\f'); cnt = collections.Counter(l.strip() for p in pages for l in set(p.split('\n')) if 0 < len(l.strip()) < 80)
    rep = {l for l, n in cnt.items() if n > max(3, len(pages) * .3)}   # running heads and feet: a short line on a third of the pages
    out = []
    for p in pages:
        for l in p.split('\n'):
            s = l.strip()
            if s in rep or re.fullmatch(r'[\divxlcIVXLC\-–— .]{1,8}', s or 'x'): continue
            out.append(l.rstrip())
        out.append('')
    return '\n'.join(out), len(pages)
def tidy(t):
    t = t.replace('\r', '').replace('­', ''); t = re.sub(r'(\w)-\n(\w)', r'\1\2', t)   # words broken over a line
    t = re.sub(r'[ \t]+', ' ', t); t = re.sub(r'\n{3,}', '\n\n', t)
    return '\n'.join(l.strip() for l in t.split('\n')).strip() + '\n'
def cover(f, fmt, id_):
    o = f'data/books/covers/bk-{id_}.jpg'
    if fmt != 'pdf': return None
    subprocess.run(['pdftoppm', '-f', '1', '-l', '1', '-jpeg', '-r', '60', f, '/tmp/mcover'], capture_output=True, timeout=120)
    p = next((x for x in ['/tmp/mcover-1.jpg', '/tmp/mcover-01.jpg', '/tmp/mcover-001.jpg'] if os.path.exists(x)), None)
    if not p: return None
    im = Image.open(p).convert('RGB'); os.remove(p); im = im.resize((300, round(im.height * 300 / im.width)), Image.LANCZOS); im.save(o, 'JPEG', quality=80); return o[5:]
def slug(t, ids):
    w = [x for x in re.sub(r'[^a-z0-9 ]', '', t.lower()).split() if x not in ('the', 'a', 'an', 'of', 'and')]; s = 'm-' + '-'.join(w[:3]); s2, n = s, 2
    while s2 in ids: s2 = f'{s}-{n}'; n += 1
    ids.add(s2); return s2
L = json.load(open('data/library.json')); M = json.load(open('data/full/books-modern.json'))
RANK = json.load(open(os.environ['RANK'])) if os.environ.get('RANK') else {}   # Gutenberg number -> downloads, to choose which old books stay
ids = {b['id'] for c in L['cases'] for b in c['books']}; cases = {c['id']: c for c in L['cases']}; done = {}
for sk, books in M.items():
    if sk not in cases: continue
    new = []
    for m in books:
        try:
            f = fetch(m['url']); raw = open(f, 'rb').read(); fmt = 'pdf' if raw[:5] == b'%PDF-' else 'html' if b'<html' in raw[:3000].lower() or b'<!doctype' in raw[:200].lower() else 'txt'
            if fmt == 'pdf': txt, np_ = from_pdf(f)
            elif fmt == 'html': p = Text(); p.feed(raw.decode('utf8', 'replace')); txt, np_ = html.unescape(''.join(p.out)), None
            else: txt, np_ = raw.decode('utf8', 'replace'), None
            txt = tidy(txt)
            if len(txt) < 15000: raise Exception(f'only {len(txt)} characters of text')
            id_ = slug(m['t'], ids); gz = f'data/books/text/{id_}.txt.gz'; open(gz, 'wb').write(gzip.compress(txt.encode(), 9, mtime=0))
            b = {'id': id_, 't': m['t'], 'a': m['a'], 'y': m.get('y'), 'pg': None, 'txt': gz[5:], 'pages': m.get('pages') or np_ or max(10, round(len(txt) / 2000 / 10) * 10),
                 'col': '#2c3e3a', 'cover': cover(f, fmt, id_), 'spine': None, 'ed': None, 'src': m.get('src') or m['a'], 'lic': m['licence'], 'page': m.get('page') or m['url']}
            new.append(b); print('ok', sk, id_, fmt, len(txt), os.path.getsize(gz), flush=True)
        except Exception as e: print('skip', sk, m['t'][:50], e, flush=True)
    done[sk] = new
    old = [b for b in cases[sk]['books'] if not b.get('txt')]
    keep = sorted(old, key=lambda b: -RANK.get(str(b['pg']), 0))[:max(0, 40 - len(new))]   # the old books most read stay
    cases[sk]['books'] = new + sorted(keep, key=lambda b: old.index(b))   # the modern first; the old after, shelved as they were
with open('data/library.json', 'w') as f:
    f.write('{"note":' + json.dumps(L['note']) + ',"cases":[\n' + ',\n'.join('{"id":' + json.dumps(c['id']) + ',"name":' + json.dumps(c['name']) + ',"books":[\n' + ',\n'.join(json.dumps(b, ensure_ascii=False) for b in c['books']) + ']}' for c in L['cases']) + '\n]}\n')
print({k: len(v) for k, v in done.items()})
