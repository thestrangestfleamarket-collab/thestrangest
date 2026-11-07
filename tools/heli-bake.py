# THE HELIPAD'S MODELS (owner, 7 Nov 2026): Polyfork's utility helicopter, air ambulance, rooftop helipad deck and windsock fetched into .polyfork/
# (never committed) and baked flat-coloured into data/heli.json, each model's moving parts apart (rotors, doors, the sock) with the point they turn on:
# {model: {size: [x,y,z] metres, parts: {name: {b: [lo, hi], p: int16 points over b (three a face), c: uint8 colour a point, at: [x,y,z] its pivot}}}}, real size, feet at 0.
# Run: python3 tools/heli-bake.py
import os, json, time, base64, urllib.request, numpy as np
pb={}; exec(compile(open('tools/props-bake.py').read().split('OUT=json.load')[0].replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
_trs=pb['trs']; pb['trs']=lambda n:np.array(n['matrix'],float).reshape(4,4).T if 'matrix' in n else _trs(n)   # (props-bake's reader takes TRS only; these files give a node's place as a matrix)
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        open(f+'.part','wb').write(urllib.request.urlopen(r,timeout=60).read()); os.replace(f+'.part',f); time.sleep(.3)
    return f
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
# each model: its id and the parts that move (node name -> part name); everything else is its body
MODELS={'utility':('helicopter-9d1986',{'rotor-main':'rotor','rotor-tail':'tail','door-left':'doorL','door-right':'doorR'}),
        'amb':('air-ambulance-helicopter-ed9acc',{'rotor':'rotor','tail-fan':'tail','door-r':'doorR'}),
        'deck':('rooftop-helipad-deck-24e53c',{}),
        'sock':('windsock-d5df79',{'swivel':'sock'})}
def bake(f,moving):
    j,b=pb['glb'](f); N=j['nodes']; par={c:i for i,n in enumerate(N) for c in n.get('children',[])}; G={}
    def glob_(i):
        if i in G: return G[i]
        M=pb['trs'](N[i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    def part(i):
        while i is not None:
            nm=N[i].get('name','')
            if nm in moving: return moving[nm],i
            i=par.get(i)
        return 'body',None
    # (from_glb's own loop, a node at a time, each node's faces to its part)
    full_T,full_C=pb['from_glb'](f); T={}; Cc={}; piv={}
    k=0
    for ni,n in enumerate(N):
        if 'mesh' not in n: continue
        nf=sum(len(pb['acc'](j,b,p['indices']))//3 for p in j['meshes'][n['mesh']]['primitives'])
        nm,pi=part(ni); T.setdefault(nm,[]).append(full_T[k:k+nf]); Cc.setdefault(nm,[]).append(full_C[k:k+nf]); k+=nf
        if pi is not None: piv[nm]=glob_(pi)[:3,3]
    assert k==len(full_T)
    allP=full_T.reshape(-1,3); lo=allP.min(0); hi=allP.max(0); shift=np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2])
    out={'size':[round(float(x),3) for x in hi-lo],'parts':{}}
    for nm in T:
        P=np.vstack(T[nm]).reshape(-1,3)-shift; col=np.vstack(Cc[nm]).reshape(-1,3); a=(piv[nm]-shift) if nm in piv else np.zeros(3)
        if nm in piv and np.allclose(piv[nm],0): a=(P.min(0)+P.max(0))/2   # (a part placed by its points, not its node: turn it on its middle)
        P=P-a; l=P.min(0); h=P.max(0)
        q=np.round((P-l)/np.maximum(h-l,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
        out['parts'][nm]={'b':[round(float(x),4) for x in (*l,*h)],'p':b64(q),'c':b64(np.clip(col,0,255).round().astype(np.uint8)),'at':[round(float(x),4) for x in a]}
    return out
OUT={k:bake(get(i),mv) for k,(i,mv) in MODELS.items()}
OUT['license']='Polyfork (polyfork.dev/licensing): use in games, no reselling the files'
json.dump(OUT,open('data/heli.json','w'),separators=(',',':')); print({k:(v['size'],{p:len(base64.b64decode(q['p']))//18 for p,q in v['parts'].items()}) for k,v in OUT.items() if k!='license'}, os.path.getsize('data/heli.json')//1024,'KB')
