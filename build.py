import base64, glob, gzip, hashlib, json, os, re, shutil, subprocess, sys, time
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
os.makedirs('dist', exist_ok=True)
open('dist/.body.js', 'w').write(body)
subprocess.run(['node', 'tools/chunks.cjs', 'dist/.body.js', 'dist/.main.js', 'dist/.chunks.json'], check=True)
body, CH = read('dist/.main.js'), json.load(open('dist/.chunks.json'))
for f in ['dist/.body.js', 'dist/.main.js', 'dist/.chunks.json']: os.remove(f)
open('dist/chunks.txt', 'w').write(''.join('%s #%d %d bytes, %d names + live %s: %s\n' % (r['name'], r['ix'], r['bytes'], r['imm'], ' '.join(r['live']), r['head']) for r in CH['report']))
for n in sorted(set(r['name'] for r in CH['report'])): print('chunk', n + ':', sum(1 for r in CH['report'] if r['name'] == n), 'functions,', sum(r['bytes'] for r in CH['report'] if r['name'] == n), 'bytes')
art = CH['rt'] + 'const __CK={' + ','.join(json.dumps(n) + ':' + c for n, c in CH['code'].items()) + '};\nconst __CLOAD=n=>Promise.resolve(__CK[n]||{}), __CSYNC=n=>__CK[n]||{};\n'
raw, page = page, data(page[:i] + art + body + page[j:])
open('dist/market.html', 'w').write(page)

open('dist/door.html', 'w').write(read('src/door/door.html'))

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
open('dist/g/page.html', 'w').write(re.sub(r'<meta[^>]*>|<title>.*?</title>', '', raw[:k]).strip())
pages = ['dist/market.html', 'dist/door.html', 'dist/g/rig.js', 'dist/g/page.html']
if os.environ.get('MIN', '1') != '0':
    if not os.path.exists('node_modules/esbuild'):
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
    subprocess.run(['node', 'tools/minify.cjs'] + pages, check=True)
elif not os.path.exists('node_modules/three'):
    subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], check=True)
used = [f for f in names if '__DATA__("' + f + '")' in body]
UNB = ('const __GF=(n,k)=>fetch("/g/"+n).then(r=>{ if(!r.ok)throw new Error(n+" "+r.status); return k?r.arrayBuffer():r.json(); });\n'
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
    + CH['rt'] + 'const __CU=__CHUNKURLS__, __CE=t=>(0,eval)(t); window.__CREG=m=>m;\nconst __CLOAD=n=>!__CU[n]?Promise.resolve({}):fetch("/g/"+__CU[n]).then(r=>{ if(!r.ok)throw new Error(n+" "+r.status); return r.text(); }).then(__CE);\n'
    + 'const __CSYNC=n=>{ const x=new XMLHttpRequest(); x.open("GET","/g/"+__CU[n],false); x.send(); if(x.status!==200)throw new Error(n+" "+x.status); return __CE(x.responseText); };\n'
    + re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>__GJ(' + names[m.group(1)] + ',' + bins.get(m.group(1), 'null') + '))', re.sub(r'__DATA__\("([^"]+)"\)', lambda m: '(await __DP[' + names[m.group(1)] + '])', body)))
os.remove('dist/g/page.html')
open('dist/g/game.js', 'w').write(re.sub(r"'https://cdn\.jsdelivr\.net/npm/((?:@[^/@']+/)?[^/@']+)@([^/']+)[^']*'", npm, data(game)))
for n, c in CH['code'].items(): open('dist/g/x-' + n + '.js', 'w').write('"use strict";__CREG(' + c + ');\n')
m = subprocess.run(['node', 'tools/bundle.cjs', 'dist/g/game.js', 'dist/g'] + ['dist/g/x-' + n + '.js' for n in CH['code']], check=True, capture_output=True, text=True).stdout.strip()
open('dist/g/market.html', 'w').write('<!doctype html><meta name="market-build" content="' + bv + '"><title>The Market</title><body bgcolor=#0e1016><script type=module src=/g/' + m + '></script>')
pages = pages[:2] + ['dist/g/market.html']
for f in pages:
    t = read(f)
    if t.count('<!--') != t.count('-->') or not t.startswith('<') or t.startswith('<!--'):
        sys.exit(f + ': broken page (an unclosed <!-- or no page at the top)')
print('built', ', '.join(pages), '+', len(os.listdir('dist/g')) - 1, 'files in dist/g,', len(src), 'files,', ny, 'breaths')
