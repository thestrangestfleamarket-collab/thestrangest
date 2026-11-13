import base64, glob, gzip, hashlib, json, os, re, shutil, subprocess, sys, time
sys.path.insert(0, 'tools')

read = lambda f: open(f).read()
src = sorted(glob.glob('src/[0-9][0-9][0-9]*-*'))
bv = str(int(time.time()))
b64 = lambda f: json.dumps('data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode())
lazy = lambda t: re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>Promise.resolve(' + read(m.group(1)) + '))', t)
files = lambda t: re.sub(r'__FILE__\("([^"]+)"\)', lambda m: json.dumps('../' + m.group(1)), t)   # a file fetched as it is (audio): beside the one-file page, it is read from data/
data = lambda t: files(re.sub(r'__B64__\("([^"]+)"\)', lambda m: b64(m.group(1)), re.sub(r'__DATA__\("([^"]+)"\)', lambda m: read(m.group(1)), lazy(t))))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10]
def hashed(f):
    n = f[:-len(os.path.splitext(f)[1])] + '.' + sha(f) + os.path.splitext(f)[1]
    os.replace(f, n)
    return os.path.basename(n)
CDN = re.compile(r"'https://cdn\.jsdelivr\.net/npm/((?:@[^/@']+/)?[^/@']+)@([^/']+)[^']*'")
def ver(p, v):
    if json.load(open('node_modules/' + p + '/package.json'))['version'] != v:
        sys.exit(p + '@' + v + ' in the code, but package.json has another version')
def npm(m):
    p, v = m.group(1), m.group(2); ver(p, v)
    return 'location.origin+"/g/__NAV__"' if p.startswith('@recast-navigation/') else json.dumps(p)
# a CDN link inside a chunk: the package is bundled as its own file (tools/bundle.cjs), named by the page's __LIBS
def lib(m):
    p, v = m.group(1), m.group(2); ver(p, v)
    return 'location.origin+"/g/"+__LIBS[' + json.dumps(p) + ']'

imp = subprocess.run(['node', '--stack-size=8000', 'tools/imports.cjs'], capture_output=True, text=True)
if imp.returncode: sys.exit(imp.stderr or imp.stdout)
# code the page shares with the worker (the dish's simulation): __CODE__("worker/x.js") puts the file in, its export line dropped
code = lambda t: re.sub(r'__CODE__\("([^"]+)"\)', lambda m: re.sub(r'^export \{[^}]*\};[ \t]*$', '', read(m.group(1)), flags=re.M), t)
page = code(subprocess.run(['node', 'tools/imports.cjs', '--join'] + src, check=True, capture_output=True, text=True).stdout).replace('__BUILDV__', bv)
i = page.index('<script type="module">') + len('<script type="module">')
j = page.rindex('</script>')
os.makedirs('dist', exist_ok=True)
open('dist/.raw.js', 'w').write(page[i:j])
ny = int(subprocess.run(['node', 'tools/yields.cjs', 'dist/.raw.js', 'dist/.body.js'], check=True, capture_output=True, text=True).stdout.strip() or 0)
os.remove('dist/.raw.js')
subprocess.run(['node', 'tools/chunks.cjs', 'dist/.body.js', 'dist/.main.js', 'dist/.chunks.json'], check=True)
body, CH = read('dist/.main.js'), json.load(open('dist/.chunks.json'))
for f in ['dist/.body.js', 'dist/.main.js', 'dist/.chunks.json']: os.remove(f)
open('dist/chunks.txt', 'w').write(''.join('%s #%d %d bytes, %d names + live %s: %s\n' % (r['name'], r['ix'], r['bytes'], r['imm'], ' '.join(r['live']), r['head']) for r in CH['report']))
for n in sorted(set(r['name'] for r in CH['report'])): print('chunk', n + ':', sum(1 for r in CH['report'] if r['name'] == n), 'functions,', sum(r['bytes'] for r in CH['report'] if r['name'] == n), 'bytes')
art = CH['rt'] + 'const __CK={' + ','.join(json.dumps(n) + ':' + c for n, c in CH['code'].items()) + '};\nconst __CLOAD=n=>Promise.resolve(__CK[n]||{}), __CSYNC=n=>__CK[n]||{};\n'
raw, page = page, data(page[:i] + art + body + page[j:])
open('dist/market.html', 'w').write(page)

open('dist/door.html', 'w').write(read('src/door/door.html'))
for f in ['app.webmanifest', 'icon-192.png', 'icon-512.png']:
    if os.path.exists('src/door/' + f): shutil.copy('src/door/' + f, 'dist/' + f)
    else: print('build: src/door/' + f + ' is missing (the installed app has no icon until it is added)')   # the installable app: its manifest and icon, handed to anyone
# the owners' map editor: its own light page (no game), the ground picture beside it (tools/topmap.cjs)
EDITOR = False  # the map editor is archived (owner, 5 Nov 2026)
shutil.rmtree('dist/edmap', ignore_errors=True)
if EDITOR:
    open('dist/editor.html', 'w').write(code(data(read('src/editor/editor.html'))).replace('__BUILDV__', bv))
    os.makedirs('dist/edmap')
    for t in json.load(open('data/topmap.json'))['tiles']:
        if os.path.exists('data/topmap/' + t): shutil.copy('data/topmap/' + t, 'dist/edmap/' + t)
else:
    pass

shutil.rmtree('dist/g', ignore_errors=True)
os.makedirs('dist/g')
k = raw[:i].rindex('<script>')
B64S = re.compile(r'^[A-Za-z0-9+/]+=*$')
def split(f):
    d, buf = json.load(open(f)), bytearray()
    def w(o):
        if isinstance(o, dict):
            if '$' in o: sys.exit(f + ': a "$" key clashes with the binary split')
            return {k: w(v) for k, v in o.items()}
        if isinstance(o, list): return [w(v) for v in o]
        if isinstance(o, str) and len(o) > 64 and len(o) % 4 == 0 and B64S.match(o):
            b = base64.b64decode(o)
            if base64.b64encode(b).decode() != o: return o
            while len(buf) % 4: buf.append(0)
            a = len(buf); buf.extend(b)
            return {'$': [a, len(b)]}
        return o
    s = w(d)
    return (json.dumps(s, separators=(',', ':')), bytes(buf)) if buf else None
names, bins = {}, {}
for f in sorted(set(re.findall(r'__(?:DATA|LAZY)__\("([^"]+)"\)', body))):
    o = 'dist/g/' + os.path.basename(f)
    sp = split(f) if f.endswith('.json') else None
    if sp:
        open(o, 'w').write(sp[0])
        open(o[:-5] + '.bin', 'wb').write(gzip.compress(sp[1], 9, mtime=0))
        bins[f] = json.dumps(hashed(o[:-5] + '.bin'))
    else:
        shutil.copy(f, o)
    names[f] = json.dumps(hashed(o))
seg = raw[k + 8:i - len('<script type="module">')]
open('dist/g/rig.js', 'w').write(data(seg[:seg.index('</script>')]))
open('dist/g/page.html', 'w').write(re.sub(r'<!doctype html>|<meta[^>]*>|<title>.*?</title>', '', raw[:k]).strip())
pages = ['dist/market.html', 'dist/door.html', 'dist/g/rig.js', 'dist/g/page.html']
if os.environ.get('MIN', '1') != '0':
    if not os.path.exists('node_modules/esbuild'):
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
    subprocess.run(['node', 'tools/minify.cjs'] + pages + (['dist/editor.html'] if EDITOR else []), check=True)
if 'g' in os.environ.get('SKIP', '').split(','):
    sys.exit(print('built', pages[0], 'and', pages[1], 'only (SKIP=g: no dist/g, no npm packages needed)'))
elif not os.path.exists('node_modules/three'):
    subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
subprocess.run(['node', 'tools/asylum.cjs'], check=True)   # Hollow Pines (src/asylum/): its own page, dist/asylum.html
subprocess.run(['node', 'tools/holo.cjs'], check=True)   # the holodeck's pages (src/holo/): dist/holo.html, dist/roam.html, dist/boarded.html
subprocess.run(['node', 'tools/wave.cjs'], check=True)   # SHARDWAVE (src/wave/): its own page, dist/wave.html
subprocess.run(['node', 'tools/cantina.cjs'], check=True)   # THE CANTINA (src/cantina/): its own page, dist/cantina.html, and its models and pictures, dist/cantina-assets/
subprocess.run(['node', 'tools/scare.cjs'], check=True)   # VESPER WARD (src/scare/): its own page, dist/scare.html, and its models, dist/scare-assets/
subprocess.run(['node', 'tools/shoot.cjs'], check=True)   # BREACHLINE (src/shoot/): its own page, dist/shoot.html
subprocess.run(['node', 'tools/golf.cjs'], check=True)   # HALCYON GREENS (src/golf/): its own page, dist/golf.html, and its pictures, dist/golf-assets/
subprocess.run(['node', 'tools/duel.cjs'], check=True)   # AR DUEL (src/duel/): its own page, dist/duel.html, and its pictures, dist/duel-assets/
for f in sorted(set(re.findall(r'__FILE__\("([^"]+)"\)', body))):
    o = 'dist/g/' + os.path.basename(f); shutil.copy(f, o); names[f] = json.dumps('/g/' + hashed(o))
body = re.sub(r'__FILE__\("([^"]+)"\)', lambda m: names[m.group(1)], body)
used = [f for f in names if '__DATA__("' + f + '")' in body]
UNB = (read('tools/recover.js') + 'const __GF=(n,k)=>__cget(n,"/g/"+n,1).then(r=>k?r.arrayBuffer():r.json());\n'
    + 'const __UNB=(j,u)=>{ const w=o=>{ for(const k in o){ const v=o[k]; if(!v||typeof v!=="object")continue; const p=v.$;'
    + ' if(Array.isArray(p)&&p.length===2&&Object.keys(v).length===1){ const a=p[0], n=p[1]; let s=null;'
    + ' if(!Object.prototype.hasOwnProperty.call(o,"$b"))Object.defineProperty(o,"$b",{value:{},enumerable:false});'
    + ' Object.defineProperty(o.$b,k,{enumerable:true,get:()=>u.slice(a,a+n)});'
    + ' Object.defineProperty(o,k,{enumerable:true,configurable:true,get(){ if(s===null){ let t=""; for(let i=a;i<a+n;i+=32768)t+=String.fromCharCode.apply(null,u.subarray(i,Math.min(i+32768,a+n))); s=btoa(t); } return s; },'
    + 'set(x){ Object.defineProperty(o,k,{value:x,writable:true,enumerable:true,configurable:true}); }}); } else w(v); } }; w(j); return j; };\n'
    + 'const __GJ=(n,b)=>Promise.all([__GF(n,0),b?__GF(b,1):null]).then(([j,u])=>u?__UNB(j,new Uint8Array(u)):j);\n')
game = ('document.body.insertAdjacentHTML("afterbegin",' + json.dumps(read('dist/g/page.html')) + ');\n'
    + 'const __RIG=new Promise((r,e)=>document.head.append(Object.assign(document.createElement("script"),{src:"/g/' + hashed('dist/g/rig.js') + '",onload:r,onerror:e})));\n'
    + UNB
    + 'const __DP=Object.fromEntries([' + ','.join('[' + names[f] + ',' + bins.get(f, 'null') + ']' for f in used) + '].map(([n,b])=>[n,__GJ(n,b)]));\n'
    + 'await __RIG;\n'
    + CH['rt'] + 'const __CU=__CHUNKURLS__, __CE=t=>(0,eval)(t); window.__CREG=m=>m; window.__LIBS=__LIBURLS__;\n'
    + 'const __CLOAD=n=>!__CU[n]?Promise.resolve({}):__STALE?new Promise(()=>{}):__cget(n,"/g/"+__CU[n],1).then(r=>r.text()).then(__CE);\n'
    + 'const __CSYNC=n=>{ const x=new XMLHttpRequest(); x.open("GET","/g/"+__CU[n],false); x.send(); if(x.status!==200){ __stale(x.status,n); throw new Error(n+" "+x.status); } return __CE(x.responseText); };\n'
    + re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>__GJ(' + names[m.group(1)] + ',' + bins.get(m.group(1), 'null') + '))', re.sub(r'__DATA__\("([^"]+)"\)', lambda m: '(await __DP[' + names[m.group(1)] + '])', body)))
os.remove('dist/g/page.html')
open('dist/g/game.js', 'w').write(CDN.sub(npm, data(game)))
for n, c in CH['code'].items(): open('dist/g/x-' + n + '.js', 'w').write('"use strict";__CREG(' + CDN.sub(lib, data(c)) + ');\n')
m = subprocess.run(['node', 'tools/bundle.cjs', 'dist/g/game.js', 'dist/g'] + ['dist/g/x-' + n + '.js' for n in CH['code']], check=True, capture_output=True, text=True).stdout.strip()
for f in os.listdir('dist/g'):
    if f.endswith('.js') and 'https://cdn.jsdelivr.net/npm/' in read('dist/g/' + f): sys.exit('dist/g/' + f + ' still asks cdn.jsdelivr.net for a package: the website bundles them')
# what the start always fetches is asked for with the page, beside the game's own file, not after that file has come and been read
pre = ''.join('<link rel=modulepreload href=/g/' + f + '>' for f in sorted(set(re.findall(r'(?:from|import)\s*"\./(c\.[0-9a-f]+\.js)"', read('dist/g/' + m))))) \
    + ''.join('<link rel=preload as=script href=/g/' + f + '>' for f in sorted(os.listdir('dist/g')) if re.match(r'rig\..*\.js$', f)) \
    + ''.join('<link rel=preload as=fetch crossorigin href=/g/' + json.loads(n) + '>' for f in used for n in [names[f], bins.get(f)] if n) \
    + ''.join('<link rel=preload as=fetch crossorigin href=/g/' + f + '>' for f in sorted(os.listdir('dist/g')) if re.match(r'x-later\..*\.js$', f))
open('dist/g/market.html', 'w').write('<!doctype html><meta name="market-build" content="' + bv + '"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><title>The Market</title><link rel=icon href="data:,"><link rel=manifest href=/app.webmanifest><link rel=apple-touch-icon href=/icon-192.png><meta name=theme-color content=#0e1016><meta name=mobile-web-app-capable content=yes>' + pre + '<body bgcolor=#0e1016><script type=module src=/g/' + m + '></script>')
pages = pages[:2] + ['dist/g/market.html'] + (['dist/editor.html'] if EDITOR else [])
for f in pages:
    t = read(f)
    if t.count('<!--') != t.count('-->') or not t.startswith('<') or t.startswith('<!--'):
        sys.exit(f + ': broken page (an unclosed <!-- or no page at the top)')
open('dist/sw.js', 'w').write(read('src/door/sw.js').replace('__KEEP__', json.dumps(sorted('/g/' + f for f in os.listdir('dist/g') if f != 'market.html'))))   # the service worker, with this build's files: what it keeps, and all it keeps
open('dist/.assetsignore', 'w').write('/market.html\n')   # the tests' single-file page: never handed out, and past the 25 MiB a Workers asset may be
if subprocess.run(['node', 'tools/map.cjs', 'docs/MAP.md'], capture_output=True).returncode:
    print('docs/MAP.md not refreshed (node tools/map.cjs failed: is acorn installed?)')
print('built', ', '.join(pages), '+', len(os.listdir('dist/g')) - 1, 'files in dist/g,', len(src), 'files,', ny, 'breaths')
