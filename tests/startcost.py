import base64, glob, json, re, sys
sys.path.insert(0, 'tools')
t = open('tools/yields.py').read().replace("out.append(CHECK)", "out.append('__YP(%d);'%i+CHECK)")
g = {}; exec(compile(t, 'y', 'exec'), g)
read = lambda f: open(f).read()
src = sorted(glob.glob('src/[0-9][0-9][0-9]*-*'))
b64 = lambda f: json.dumps('data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode())
lazy = lambda t: re.sub(r'__LAZY__\("([^"]+)"\)', lambda m: '(()=>Promise.resolve(' + read(m.group(1)) + '))', t)
data = lambda t: re.sub(r'__B64__\("([^"]+)"\)', lambda m: b64(m.group(1)), re.sub(r'__DATA__\("([^"]+)"\)', lambda m: read(m.group(1)), lazy(t)))
page = ''.join(read(f) for f in src).replace('__BUILDV__', '1234567890')
i = page.index('<script type="module">') + len('<script type="module">')
j = page.rindex('</script>')
body, ny = g['yields'](page[i:j])
body = "window.__YPM={};let __YPP=-1,__YPT=performance.now();window.__YP0=__YPT;const __YP=p=>{ const n=performance.now(); window.__YPM[__YPP]=(window.__YPM[__YPP]||0)+n-__YPT; __YPP=p; __YPT=n; };\n" + body
open('dist/market-prof.html', 'w').write(data(page[:i] + body + page[j:]))
off, b = [], 0
for f in src:
    off.append([b - i, f.split('/')[-1]]); b += len(read(f))
json.dump(off, open('dist/prof-offsets.json', 'w'))
print('prof', ny)
