import base64, glob, hashlib, json, os, re, shutil, subprocess, sys, time
sys.path.insert(0, 'tools')
from yields import yields

read = lambda f: open(f).read()
src = sorted(glob.glob('src/[0-9][0-9][0-9]*-*'))
one = lambda name: read(next(f for f in src if re.search(r'/\d{3}-' + name + r'\.js$', f)))
bv = str(int(time.time()))
b64 = lambda f: json.dumps('data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode())
lazy = lambda t: re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>Promise.resolve(' + read(m.group(1)) + '))', t)
data = lambda t: re.sub(r'__B64__\("([^"]+)"\)', lambda m: b64(m.group(1)), re.sub(r'__DATA__\("([^"]+)"\)', lambda m: read(m.group(1)), lazy(t)))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10]
def hashed(f):
    n = f[:-len(os.path.splitext(f)[1])] + '.' + sha(f) + os.path.splitext(f)[1]
    os.replace(f, n)
    return os.path.basename(n)
def npm(m):
    p, v = m.group(1), m.group(2)
    if json.load(open('node_modules/' + p + '/package.json'))['version'] != v:
        sys.exit(p + '@' + v + ' in the code, but package.json has another version')
    return 'location.origin+"/g/__NAV__"' if p.startswith('@recast-navigation/') else json.dumps(p)

page = ''.join(read(f) for f in src).replace('__BUILDV__', bv)
i = page.index('<script type="module">') + len('<script type="module">')
j = page.rindex('</script>')
body, ny = yields(page[i:j])
raw, page = page, data(page[:i] + body + page[j:])
os.makedirs('dist', exist_ok=True)
open('dist/market.html', 'w').write(page)

open('dist/door.html', 'w').write(read('src/door/door.html'))

shutil.rmtree('dist/g', ignore_errors=True)
os.makedirs('dist/g')
k = raw[:i].rindex('<script>')
names = {}
for f in sorted(set(re.findall(r'__(?:DATA|LAZY)__\("([^"]+)"\)', body))):
    shutil.copy(f, 'dist/g/' + os.path.basename(f))
    names[f] = json.dumps(hashed('dist/g/' + os.path.basename(f)))
seg = raw[k + 8:i - len('<script type="module">')]
open('dist/g/rig.js', 'w').write(data(seg[:seg.index('</script>')]))
open('dist/g/page.html', 'w').write(re.sub(r'<meta[^>]*>|<title>.*?</title>', '', raw[:k]).strip())
pages = ['dist/market.html', 'dist/door.html', 'dist/g/rig.js', 'dist/g/page.html']
if os.environ.get('MIN', '1') != '0':
    if not os.path.exists('node_modules/esbuild'):
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
    subprocess.run(['node', 'tools/minify.cjs'] + pages, check=True)
elif not os.path.exists('node_modules/three'):
    subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
used = [f for f in names if '__DATA__("' + f + '")' in body]
game = ('document.body.insertAdjacentHTML("afterbegin",' + json.dumps(read('dist/g/page.html')) + ');\n'
    + 'const __RIG=new Promise((r,e)=>document.head.append(Object.assign(document.createElement("script"),{src:"/g/' + hashed('dist/g/rig.js') + '",onload:r,onerror:e})));\n'
    + 'const __DP=Object.fromEntries([' + ','.join(names[f] for f in used) + '].map(n=>[n,fetch("/g/"+n).then(r=>{ if(!r.ok)throw new Error(n+" "+r.status); return r.json(); })]));\n'
    + 'await __RIG;\n'
    + re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>fetch("/g/"+' + names[m.group(1)] + ').then(r=>r.json()))', re.sub(r'__DATA__\("([^"]+)"\)', lambda m: '(await __DP[' + names[m.group(1)] + '])', body)))
os.remove('dist/g/page.html')
open('dist/g/game.js', 'w').write(re.sub(r"'https://cdn\.jsdelivr\.net/npm/((?:@[^/@']+/)?[^/@']+)@([^/']+)[^']*'", npm, data(game)))
m = subprocess.run(['node', 'tools/bundle.cjs', 'dist/g/game.js', 'dist/g'], check=True, capture_output=True, text=True).stdout.strip()
open('dist/g/market.html', 'w').write('<!doctype html><meta name="market-build" content="' + bv + '"><title>The Market</title><body bgcolor=#0e1016><script type=module src=/g/' + m + '></script>')
pages = pages[:2] + ['dist/g/market.html']
for f in pages:
    t = read(f)
    if t.count('<!--') != t.count('-->') or not t.startswith('<') or t.startswith('<!--'):
        sys.exit(f + ': broken page (an unclosed <!-- or no page at the top)')
print('built', ', '.join(pages), '+', len(os.listdir('dist/g')) - 1, 'files in dist/g,', len(src), 'files,', ny, 'breaths')
