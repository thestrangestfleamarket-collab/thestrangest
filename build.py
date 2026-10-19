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

page = ''.join(read(f) for f in src).replace('__BUILDV__', bv)
i = page.index('<script type="module">') + len('<script type="module">')
j = page.rindex('</script>')
body, ny = yields(page[i:j])
raw, page = page, data(page[:i] + body + page[j:])
os.makedirs('dist', exist_ok=True)
open('dist/market.html', 'w').write(page)

shutil.rmtree('dist/g', ignore_errors=True)
os.makedirs('dist/g')
k = raw[:i].rindex('<script>')
used = sorted(set(re.findall(r'__DATA__\("([^"]+)"\)', body)))
lazies = sorted(set(re.findall(r'__LAZY__\("([^"]+)"\)', body)))
for f in used + lazies:
    shutil.copy(f, 'dist/g/' + os.path.basename(f))
pre = 'const __DP=Object.fromEntries([' + ','.join(json.dumps(os.path.basename(f)) for f in used) + '].map(n=>[n,fetch("/g/"+n).then(r=>{ if(!r.ok)throw new Error(n+" "+r.status); return r.json(); })]));\n'
game = pre + re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>fetch("/g/"+' + json.dumps(os.path.basename(m.group(1))) + ').then(r=>r.json()))', re.sub(r'__DATA__\("([^"]+)"\)', lambda m: '(await __DP[' + json.dumps(os.path.basename(m.group(1))) + '])', body))
open('dist/g/game.js', 'w').write(data(game))
seg = raw[k + 8:i - len('<script type="module">')]
open('dist/g/rig.js', 'w').write(data(seg[:seg.index('</script>')]))
imap = seg[seg.index('</script>') + 9:]
open('dist/g/market.html', 'w').write(data(raw[:k]) + '<script src="/g/__RIG__"></script>' + imap + '<script type="module" src="/g/__GAME__"></script>' + raw[j + 9:])

open('dist/door.html', 'w').write(read('src/door/door.html'))
pages = ['dist/market.html', 'dist/door.html', 'dist/g/market.html', 'dist/g/rig.js', 'dist/g/game.js']

if os.environ.get('MIN', '1') != '0':
    if not os.path.exists('node_modules/esbuild'):
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
    subprocess.run(['node', 'tools/minify.cjs'] + pages, check=True)
def hashed(f):
    n = f[:-len(os.path.splitext(f)[1])] + '.' + hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10] + os.path.splitext(f)[1]
    os.replace(f, n)
    return os.path.basename(n)
g = read('dist/g/game.js')
for f in used + lazies:
    g = g.replace(json.dumps(os.path.basename(f)), json.dumps(hashed('dist/g/' + os.path.basename(f))))
open('dist/g/game.js', 'w').write(g)
m = read('dist/g/market.html').replace('__RIG__', hashed('dist/g/rig.js')).replace('__GAME__', hashed('dist/g/game.js'))
open('dist/g/market.html', 'w').write(m)
pages = pages[:3]
for f in pages:
    t = read(f)
    if t.count('<!--') != t.count('-->') or not t.startswith('<') or t.startswith('<!--'):
        sys.exit(f + ': broken page (an unclosed <!-- or no page at the top)')
print('built', ', '.join(pages), '+', len(os.listdir('dist/g')) - 1, 'files in dist/g,', len(src), 'files,', ny, 'breaths')
