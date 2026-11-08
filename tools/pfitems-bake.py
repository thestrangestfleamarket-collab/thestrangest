# THE THINGS' POLYFORK MODELS (owner, 8 Nov 2026: "lets look for polyfork assets for anything in game and use those. add 3d models to all items"): each item in
# tools/pfitems-list.json {item id: polyfork id} fetched into .polyfork/ (never committed; the licence lets the game ship them baked) and baked flat-coloured
# in metres, its foot at 0 and centred, into data/pfitems.json {map: {item: polyfork id}, m: {polyfork id: {b: [lo, hi], p: int16 points over b (three a face), c: uint8 colour a point}}}.
# tools/pfitems-pick.py finds the matches (the polyfork.dev catalogue, every word of the item's name in the model's).
# Run: python3 tools/pfitems-bake.py   (MAXT=2500: a model over that many faces is left out)
import os, json, time, base64, urllib.request, numpy as np
src=open('tools/props-bake.py').read().split('OUT=json.load')[0]; pb={}; exec(compile(src.replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
C='.polyfork'; os.makedirs(C,exist_ok=True); MAXT=int(os.environ.get('MAXT','2500'))
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        for k in range(5):
            try: open(f+'.part','wb').write(urllib.request.urlopen(r,timeout=60).read()); os.replace(f+'.part',f); break
            except Exception as e:
                if k==4: print('skip',i,e); return None
                time.sleep(2**k*2)
        time.sleep(.3)
    return f
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
L=json.load(open('tools/pfitems-list.json')); MAP={}; OUT={}
for item,i in L.items():
    if i not in OUT:
        f=get(i)
        if not f: continue
        try: T,Cc=pb['from_glb'](f)
        except Exception as e: print('skip',i,e); continue
        if len(T)>MAXT or len(T)==0: print('skip',i,len(T),'faces'); continue
        P=T.reshape(-1,3); lo=P.min(0); hi=P.max(0); P=P-[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]; lo=P.min(0); hi=P.max(0)
        q=np.round((P-lo)/np.maximum(hi-lo,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
        OUT[i]={'b':[round(float(x),4) for x in (*lo,*hi)],'p':b64(q),'c':b64(np.clip(Cc.reshape(-1,3),0,255).round().astype(np.uint8))}
    MAP[item]=i
json.dump({'map':MAP,'m':OUT,'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files'},open('data/pfitems.json','w'),separators=(',',':'))
print(len(MAP),'items,',len(OUT),'models,',os.path.getsize('data/pfitems.json')//1024,'KB')
