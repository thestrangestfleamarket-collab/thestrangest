# THE TRAFFIC'S VEHICLES (owner, 9 Nov 2026: "add all vehicles"): Polyfork's street cars, floating cars and small spacecraft fetched into .polyfork/
# (never committed) and baked flat-coloured into data/traffic.json like data/heli.json: {id: {name, fly, len, size: [x,y,z] metres, parts: {body: {b, p, c, at}}}},
# forward +z, feet at 0, centred. Spacecraft are shrunk to a car's length (len, metres): nothing massive. Nothing with wheels flies (owner, 9 Nov 2026): the rover drives.
# The police cruiser is the game's own now (tools/cruiser-bake.py). Run: python3 tools/traffic-bake.py
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
  ('hover-coupe','wheeled-city-coupe-5c381e','HOVER COUPE',1,None,0),('hover-pod','commuter-hover-pod-5b6307','HOVER POD',1,None,0),('hover-patrol','security-patrol-cruiser-b40d27','HOVER PATROL',1,None,0),
  ('sky-tender','lighter-than-air-tender-0c7361','SKY TENDER',1,None,0),('starfighter','agile-starfighter-89805f','STARFIGHTER',1,4.6,0),('interceptor','interceptor-9d2289','INTERCEPTOR',1,4.6,0),
  ('escape-pod','escape-pod-49232b','ESCAPE POD',1,2.6,0),('rover','exploration-rover-7afd91','ROVER',0,None,0),('scout-ship','scout-ship-289ccc','SCOUT SHIP',1,4.6,0),('raider','alien-raider-98249f','RAIDER',1,4.6,0)]
FWD=float(os.environ.get('FWD','1'))   # (Polyfork's front: +z; -1 turns every model round)
def bake(f,L,turn):
    T,Cc=pb['from_glb'](f); P=T.reshape(-1,3).copy(); col=Cc.reshape(-1,3)
    a=np.radians(turn); c,s=np.cos(a),np.sin(a); P=P@np.array([[c,0,-s],[0,1,0],[s,0,c]]).T
    if FWD<0: P[:,0]*=-1; P[:,2]*=-1
    lo=P.min(0); hi=P.max(0); P=P-np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]); sz=hi-lo
    if L: k=L/max(sz[0],sz[2]); P*=k; sz=sz*k
    l=P.min(0); h=P.max(0); q=np.round((P-l)/np.maximum(h-l,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
    return {'size':[round(float(x),3) for x in sz],'parts':{'body':{'b':[round(float(x),4) for x in (*l,*h)],'p':b64(q),'c':b64(np.clip(col,0,255).round().astype(np.uint8)),'at':[0,0,0]}}}
OUT={}
for k,i,nm,fly,L,turn in MODELS:
    OUT[k]={'name':nm,'fly':fly,**bake(get(i),L,turn)}
OUT['license']='Polyfork (polyfork.dev/licensing): use in games, no reselling the files'
json.dump(OUT,open('data/traffic.json','w'),separators=(',',':'))
print({k:(v['size'],len(base64.b64decode(v['parts']['body']['p']))//18) for k,v in OUT.items() if k!='license'}, os.path.getsize('data/traffic.json')//1024,'KB')
