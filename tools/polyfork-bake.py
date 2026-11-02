# POLYFORK: free low-poly models from polyfork.dev (no credit needed; their licence lets the game ship them baked but not keep the raw files, so they are fetched into .polyfork/, git-ignored, never committed): the stalls and street furniture baked by props-bake.py into data/polyfork.json, the vendors re-baked onto your rig by rig-rebake.py into data/vendors.json.
# Run: python3 tools/polyfork-bake.py
import os, sys, json, base64, subprocess, urllib.request, importlib.util
PROPS={'mstall':'market-stall-94937d','mercado':'mercado-stall-6e6ba3','fruitstand':'fruit-stand-4cc7d7','bookstall':'platform-bookstall-8598bf','hotdog':'hot-dog-cart-115192',
  'ftable':'folding-dining-table-7b68ce','scrate':'salvage-crate-3a7e1d','sacks':'freight-crate-and-sack-f49cbb',
  'meter':'parking-meter-e9cf71','payphone':'payphone-stand-f97728','basket':'wire-trash-basket-269c1c','bikerack':'bike-rack-a1e7c3','shelter':'bus-shelter-f786b4',
  'bench':'park-bench-dc8b62','aboard':'sandwich-board-sign-cb5e7c','signpole':'street-sign-pole-1e9551'}
VENDORS={'hotdogman':'street-vendor-139de3','fruitseller':'shopkeeper-be5547','trader':'merchant-6f606b','junkman':'cove-trader-0f94a6','flowerlady':'flower-vendor-bc708b'}
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        open(f,'wb').write(urllib.request.urlopen(r).read())
    return f
out='data/polyfork.json'
if os.path.exists(out): os.remove(out)
subprocess.run([sys.executable,'tools/props-bake.py',out]+[k+'='+get(i) for k,i in PROPS.items()],check=True)
sp=importlib.util.spec_from_file_location('rr','tools/rig-rebake.py'); rr=importlib.util.module_from_spec(sp); sp.loader.exec_module(rr)
B={}
for k,i in VENDORS.items():
    body,J=rr.rebake(rr.read_glb(get(i)),rr.MIXAMO_ROLE,rr.MIXAMO_W); B[k]=body; print(k,'height',body['height'],'tris',len(base64.b64decode(body['tri']))//6)
json.dump({'bones':rr.BONES,'bodies':B},open('data/vendors.json','w'),separators=(',',':')); print('data/vendors.json',round(os.path.getsize('data/vendors.json')/1e3),'KB')
