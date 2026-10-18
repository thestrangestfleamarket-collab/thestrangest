import base64, glob, json, os, re, subprocess, sys, time
sys.path.insert(0, 'tools')
from yields import yields

read = lambda f: open(f).read()
src = sorted(glob.glob('src/[0-9][0-9][0-9]*-*'))
one = lambda name: read(next(f for f in src if re.search(r'/\d{3}-' + name + r'\.js$', f)))
bv = str(int(time.time()))
b64 = lambda f: json.dumps('data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode())
data = lambda t: re.sub(r'__B64__\("([^"]+)"\)', lambda m: b64(m.group(1)), re.sub(r'__DATA__\("([^"]+)"\)', lambda m: read(m.group(1)), t))

page = ''.join(read(f) for f in src).replace('__BUILDV__', bv)
i = page.index('<script type="module">') + len('<script type="module">')
j = page.rindex('</script>')
body, ny = yields(page[i:j])
page = data(page[:i] + body + page[j:])
os.makedirs('dist', exist_ok=True)
open('dist/market.html', 'w').write(page)

code = '\n'.join([read('src/avatar/pre.js')] + [one(n) for n in ['walker3d', 'save', 'editor', 'animator', 'looks', 'avatar', 'avmove']] + [read('src/avatar/post.js')])
open('dist/avatar.html', 'w').write(data(read('src/avatar/page.html').replace('__RIG__', one('rig')).replace('__CODE__', code)))

if os.environ.get('MIN', '1') != '0':
    if not os.path.exists('node_modules/esbuild'):
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
    subprocess.run(['node', 'tools/minify.cjs', 'dist/market.html', 'dist/avatar.html'], check=True)
print('built dist/market.html, dist/avatar.html', len(src), 'files,', ny, 'breaths')
