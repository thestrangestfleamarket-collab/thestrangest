# POLYFORK: free low-poly models from polyfork.dev (no credit needed; their licence lets the game ship them baked but not keep the raw files, so they are fetched into .polyfork/, git-ignored, never committed): the stalls, street furniture and diner baked by props-bake.py into data/polyfork.json; every character in data/characters.json with a pf id re-baked onto your rig by rig-rebake.py into data/cast/<its group>.json.
# Bodies you can play as (YOU's BODY row) get their own file: data/<key>.json.
# Run: python3 tools/polyfork-cast-bake.py
import time, os, sys, json, base64, subprocess, urllib.request, importlib.util
PROPS={'mstall':'market-stall-94937d','mercado':'mercado-stall-6e6ba3','fruitstand':'fruit-stand-4cc7d7','bookstall':'platform-bookstall-8598bf','hotdog':'hot-dog-cart-115192',
  'ftable':'folding-dining-table-7b68ce','scrate':'salvage-crate-3a7e1d','sacks':'freight-crate-and-sack-f49cbb',
  'meter':'parking-meter-e9cf71','payphone':'payphone-stand-f97728','basket':'wire-trash-basket-269c1c','bikerack':'bike-rack-a1e7c3','shelter':'bus-shelter-f786b4',
  'bench':'park-bench-dc8b62','aboard':'sandwich-board-sign-cb5e7c','signpole':'street-sign-pole-1e9551',
  'dbooth':'diner-booth-d804ce','dcounter':'diner-counter-run-d15517','dstool':'counter-stool-73553a','piecase':'pie-display-case-d74cf6','shake':'milkshake-mixer-838947'}
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        for k in range(5):
            try: open(f+'.part','wb').write(urllib.request.urlopen(r).read()); os.replace(f+'.part',f); break
            except Exception as e:
                if k==4: raise
                time.sleep(2**k*2)
        time.sleep(.5)
    return f
out='data/polyfork.json'
if os.path.exists(out): os.remove(out)
subprocess.run([sys.executable,'tools/props-bake.py',out]+[k+'='+get(i) for k,i in PROPS.items()],check=True)
sp=importlib.util.spec_from_file_location('rr','tools/rig-rebake.py'); rr=importlib.util.module_from_spec(sp); sp.loader.exec_module(rr)
G={}
for k,v in json.load(open('data/characters.json')).items():
    if v.get('pf'): G.setdefault(v['group'],[]).append((k,v['pf']))
os.makedirs('data/cast',exist_ok=True)
for g,L in sorted(G.items()):
    B={}
    for k,i in L:
        try: f=get(i)
        except Exception as e: print('SKIP',k,i,e); continue
        body,J=rr.rebake(rr.read_glb(f),rr.MIXAMO_ROLE,rr.MIXAMO_W); B[k]=body
    f='data/cast/'+g+'.json'; json.dump({'bones':rr.BONES,'bodies':B},open(f,'w'),separators=(',',':')); print(f,len(B),round(os.path.getsize(f)/1e3),'KB')
PLAYABLE={'merchant':'merchant-6f606b'}
for k,i in PLAYABLE.items():
    body,J=rr.rebake(rr.read_glb(get(i)),rr.MIXAMO_ROLE,rr.MIXAMO_W); f='data/'+k+'.json'
    json.dump({'bones':rr.BONES,'bodies':{k:body}},open(f,'w'),separators=(',',':')); print(f,round(os.path.getsize(f)/1e3),'KB')
