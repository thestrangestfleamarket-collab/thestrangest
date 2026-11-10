# THE TRAFFIC'S VEHICLES (owner, 9 Nov 2026: "add all vehicles"): Polyfork's street cars, floating cars and small spacecraft fetched into .polyfork/
# (never committed) and baked flat-coloured into data/traffic.json like data/heli.json: {id: {name, fly, len, size: [x,y,z] metres, parts: {NAME: {b, p, c, at}}}},
# one part for each mesh (owner, 10 Nov 2026: "Yes, with parts"), named from its node (BODY, WHEEL FL, DOOR L...), its points about its pivot `at`; forward +z, feet at 0, centred. Spacecraft are shrunk to a car's length (len, metres): nothing massive. Nothing with wheels flies (owner, 9 Nov 2026): the rover drives.
# The police cruiser, the hover cars and the police flier are the game's own now (tools/cruiser-bake.py, tools/fliers-bake.py); the scout ship and the raider are gone (owner, 9 Nov 2026). Run: python3 tools/traffic-bake.py
import os, json, time, base64, urllib.request, numpy as np
pb={}; exec(compile(open('tools/props-bake.py').read().split('OUT=json.load')[0].replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
_trs=pb['trs']; pb['trs']=lambda n:np.array(n['matrix'],float).reshape(4,4).T if 'matrix' in n else _trs(n)
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        open(f+'.part','wb').write(urllib.request.urlopen(r,timeout=60).read()); os.replace(f+'.part',f); time.sleep(.3)
    return f
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
# [key, Polyfork id, name, flies, length in metres (None: as made), turned (degrees about up, to face +z)]
MODELS=[('town-car','town-car-56eeb6','TOWN CAR',0,None,0),('hatchback','compact-hatchback-386417','HATCHBACK',0,None,0),('yellow-cab','yellow-cab-8df4a0','YELLOW CAB',0,None,0),
  ('boxy-sedan','boxy-sedan-70s-7d55f7','BOXY SEDAN',0,None,0),('hatchback-80s','hatchback-80s-e95554','80S HATCHBACK',0,None,0),
  ('suv','family-crossover-suv-42027f','CROSSOVER',0,None,0),('minivan','family-minivan-924de0','MINIVAN',0,None,0),('pickup','pickup-truck-a34bf2','PICKUP',0,None,0),('kei-van','kei-van-211ed5','KEI VAN',0,None,0),
  
  ('sky-tender','lighter-than-air-tender-0c7361','SKY TENDER',1,None,0),('interceptor','interceptor-9d2289','INTERCEPTOR',1,4.6,0),
  ('escape-pod','escape-pod-49232b','ESCAPE POD',1,2.6,0),('rover','exploration-rover-7afd91','ROVER',0,None,0)]
FWD=float(os.environ.get('FWD','1'))   # (Polyfork's front: +z; -1 turns every model round)
def name(j,par,i):   # (a part's name: its node's, else the nearest named group it sits in; the model's own root is its BODY)
    while i in par:
        n=j['nodes'][i].get('name')
        if n: return ' '.join(w for w in n.upper().split('-') if w!='MESH')
        i=par[i]
    return 'BODY'
def bake(f,L,turn):
    j,_=pb['glb'](f); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
    W=lambda i:W(par[i])@pb['trs'](j['nodes'][i]) if i in par else pb['trs'](j['nodes'][i])
    a=np.radians(turn); c,s=np.cos(a),np.sin(a); R=np.array([[c,0,-s],[0,1,0],[s,0,c]]).T; F=np.array([-1,1,-1]) if FWD<0 else np.ones(3)
    parts=[]; n={}
    for i,nd in enumerate(j['nodes']):
        if 'mesh' not in nd: continue
        T,Cc=pb['from_glb'](f,i); nm=name(j,par,i); n[nm]=n.get(nm,0)+1
        parts.append([nm,n[nm],(T.reshape(-1,3)@R)*F,Cc.reshape(-1,3),(W(i)[:3,3]@R)*F])
    A=np.vstack([p[2] for p in parts]); lo=A.min(0); hi=A.max(0); o=np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]); sz=hi-lo; k=L/max(sz[0],sz[2]) if L else 1
    out={}
    for nm,m,P,col,piv in parts:   # (each about its own pivot, quantized in its own box)
        piv=np.round((piv-o)*k,4); P=(P-o)*k-piv; l=P.min(0); h=P.max(0)
        q=np.round((P-l)/np.maximum(h-l,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
        out[nm+(' '+str(m) if n[nm]>1 else '')]={'b':[round(float(x),4) for x in (*l,*h)],'p':b64(q),'c':b64(np.clip(col,0,255).round().astype(np.uint8)),'at':[float(x) for x in piv]}
    return {'size':[round(float(x),3) for x in sz*k],'parts':out}
OUT={}
for k,i,nm,fly,L,turn in MODELS:
    OUT[k]={'name':nm,'fly':fly,**bake(get(i),L,turn)}
OUT['license']='Polyfork (polyfork.dev/licensing): use in games, no reselling the files'
json.dump(OUT,open('data/traffic.json','w'),separators=(',',':'))
print({k:(v['size'],sum(len(base64.b64decode(q['p']))//18 for q in v['parts'].values()),list(v['parts'])) for k,v in OUT.items() if k!='license'}, os.path.getsize('data/traffic.json')//1024,'KB')
