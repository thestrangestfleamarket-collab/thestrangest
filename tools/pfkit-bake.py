# ONE POLYFORK MODEL AS A KIT PIECE: fetched into .polyfork/ (never committed) and baked flat-coloured, every mesh in one, into a file KIT.decode reads
# ({name: {n, lo, sc, p, c, i, i32, tris, size}}, feet at 0, centred, forward +z). Run: python3 tools/pfkit-bake.py OUT.json name=polyfork-id[:turn degrees[:node+node (only these meshes)]] ...
import os, sys, json, time, base64, urllib.request, numpy as np
pb={}; exec(compile(open('tools/props-bake.py').read().split('OUT=json.load')[0].replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        open(f+'.part','wb').write(urllib.request.urlopen(r,timeout=120).read()); os.replace(f+'.part',f); time.sleep(.3)
    return f
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def bake(f,turn,only):
    j,_=pb['glb'](f); a=np.radians(turn); c,s=np.cos(a),np.sin(a); R=np.array([[c,0,-s],[0,1,0],[s,0,c]]).T; P=[]; Cc=[]
    for i,nd in enumerate(j['nodes']):
        if 'mesh' not in nd or only and nd.get('name') not in only: continue
        T,K=pb['from_glb'](f,i); P.append(T.reshape(-1,3)@R); Cc.append(K.reshape(-1,3))
    P=np.vstack(P); Cc=np.vstack(Cc); lo=P.min(0); hi=P.max(0); P=P-np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]); lo=P.min(0); sz=P.max(0)-lo; sc=float(sz.max())/65000
    q=(np.round((P-lo)/sc)-32500).astype(np.int16); n=len(P); big=n>65535; I=np.arange(n,dtype=np.uint32 if big else np.uint16)
    return {'n':n,'lo':[round(float(x),5) for x in lo],'sc':sc,'p':b64(q),'c':b64(np.clip(Cc,0,255).round().astype(np.uint8)),'i':b64(I),'i32':int(big),'tris':n//3,'size':[round(float(x),4) for x in sz]}
out=sys.argv[1]; O={}
for a in sys.argv[2:]:
    k,i=a.split('='); i,t,o=(i.split(':')+['',''])[:3]; O[k]=bake(get(i),float(t or 0),o.split('+') if o else None); print(k,O[k]['size'],O[k]['tris'],'tris')
O['license']='Polyfork (polyfork.dev/licensing): use in games, no reselling the files'
json.dump(O,open(out,'w'),separators=(',',':')); print(os.path.getsize(out)//1024,'KB')
