# THE WORLD EDITOR'S PLACE MODELS (owner, 7 Nov 2026): every Polyfork model in tools/weplace-list.json fetched into .polyfork/ (never
# committed; the licence lets the game ship them baked) and baked flat-coloured, one file a category: data/weplace-<n>.json
# {key: {n: name, m: metres tall, f: the footprint on the ground [x0,z0,x1,z1] in metres (what is solid), w: footprint [x,z] in metres, b: [lo, hi], p: int16 points over b (three a face), c: uint8 colour a point}},
# its feet at 0, centred, real size. data/weplace.json is the list (category, key, name, metres) the PLACE tab shows before a category is fetched.
# SMALL BUILDINGS come 25% over Polyfork's size (owner, 7 Nov 2026: "increase the overall size of all polyfork buildings by 25%").
# Run: python3 tools/weplace-bake.py   (MAXT=6000: a model over that many faces is left out)
import os, sys, json, time, base64, urllib.request, importlib.util, numpy as np
sp=importlib.util.spec_from_file_location('pb','tools/props-bake.py'); src=open('tools/props-bake.py').read().split('OUT=json.load')[0]
pb={}; exec(compile(src.replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
C='.polyfork'; os.makedirs(C,exist_ok=True); MAXT=int(os.environ.get('MAXT','6000'))
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
L=json.load(open('tools/weplace-list.json')); LIST=[]; tot=0
for ci,(cat,ids) in enumerate(L.items()):
    OUT={}
    for i in ids:
        f=get(i)
        if not f: continue
        try: T,Cc=pb['from_glb'](f)
        except Exception as e: print('skip',i,e); continue
        if len(T)>MAXT or len(T)==0: print('skip',i,len(T),'faces'); continue
        P=T.reshape(-1,3)*(1.25 if cat=='SMALL BUILDINGS' else 1); lo=P.min(0); hi=P.max(0); P=P-[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]; lo=P.min(0); hi=P.max(0)
        h=float(hi[1]-lo[1])
        if h<.02 or h>40: print('skip',i,'height',h); continue
        q=np.round((P-lo)/np.maximum(hi-lo,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
        name=i.rsplit('-',1)[0].replace('-',' ')
        lw=P[P[:,1]<min(.6,.3*h)]; lw=lw if len(lw)>2 else P   # what stands on the ground (a tree's trunk, a lamp's post): the solid part
        f=[round(float(v),3) for v in (lw[:,0].min(),lw[:,2].min(),lw[:,0].max(),lw[:,2].max())]
        OUT[i]={'f':f,'n':name,'m':round(h,3),'w':[round(float(hi[0]-lo[0]),3),round(float(hi[2]-lo[2]),3)],'b':[round(float(x),4) for x in (*lo,*hi)],'p':b64(q),'c':b64(np.clip(Cc.reshape(-1,3),0,255).round().astype(np.uint8))}
        LIST.append([ci,i,name,round(h,2)])
    fn='data/weplace-%d.json'%ci; json.dump(OUT,open(fn,'w'),separators=(',',':')); tot+=os.path.getsize(fn); print(cat,len(OUT),os.path.getsize(fn)//1024,'KB',flush=True)
json.dump({'cats':list(L.keys()),'list':LIST,'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files'},open('data/weplace.json','w'),separators=(',',':'))
print('total',tot//1024,'KB',len(LIST),'models')
