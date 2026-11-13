# THE THINGS' POLYFORK MODELS (owner, 8 Nov 2026: "lets look for polyfork assets for anything in game and use those. add 3d models to all items"): each item in
# tools/pfitems-list.json {item id: polyfork id} fetched into .polyfork/ (never committed; the licence lets the game ship them baked) and baked flat-coloured
# in metres, its foot at 0 and centred, into data/pfitems.json {map: {item: model key}, m: {model key: {b: [lo, hi], p: int16 points over b (three a face), c: uint8 colour a point}}}.
# An entry may instead be {id, preview, parts: [node names], drop: [node names], cut: [[x0,y0,z0,x1,y1,z1], ...]} (the model key then id@item): each named part (its node and all under it) baked apart
# as parts[name] = {b, p, c, at: its node's place, q: its node's turn} (its points in the node's own frame, so the game can move it: a valve, a pedal, a cymbal); dropped nodes and
# faces whose middles lie in a cut box (the model's own coordinates) left out; preview: from the site's preview file (<id>-preview.glb), where the moving parts are in place.
# tools/pfitems-pick.py finds the matches (the polyfork.dev catalogue, every word of the item's name in the model's).
# Run: python3 tools/pfitems-bake.py   (MAXT=2500: a model over that many faces is left out)
# The apartment's plants (150fi) the same way, their originals kept: LIST=tools/pfplants-list.json OUT=data/pfplants.json CACHE=data/full/pfplants python3 tools/pfitems-bake.py
import os, json, time, base64, struct, urllib.request, numpy as np
src=open('tools/props-bake.py').read().split('OUT=json.load')[0]; pb={}; exec(compile(src.replace('out=sys.argv[1]; args=sys.argv[2:]',''),'props-bake','exec'),pb)
LST=os.environ.get('LIST','tools/pfitems-list.json'); OUTF=os.environ.get('OUT','data/pfitems.json')
C=os.environ.get('CACHE','.polyfork'); os.makedirs(C,exist_ok=True); MAXT=int(os.environ.get('MAXT','2500'))
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
def named(i):   # (the preview file: the same nodes, its moving parts' places kept, which the main file loses; its names from the main file's)
    f=os.path.join(C,i+'-named.glb')
    if os.path.exists(f): return f
    a=get(i); b=get(i+'-preview')
    if not a or not b: return None
    ja,_=pb['glb'](a); jb,bb=pb['glb'](b)
    if len(ja['nodes'])!=len(jb['nodes']): print('skip',i,'preview differs'); return None
    for na,nb in zip(ja['nodes'],jb['nodes']):
        if 'name' in na: nb['name']=na['name']
    J=json.dumps(jb).encode(); J+=b' '*(-len(J)%4); bb=bytes(bb)+b'\0'*(-len(bb)%4)
    open(f,'wb').write(struct.pack('<III',0x46546C67,2,28+len(J)+len(bb))+struct.pack('<II',len(J),0x4E4F534A)+J+struct.pack('<II',len(bb),0x004E4942)+bb); return f
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def pack(T,Cc):
    P=T.reshape(-1,3); lo=P.min(0); hi=P.max(0); q=np.round((P-lo)/np.maximum(hi-lo,1e-6)*65535-32768).clip(-32768,32767).astype(np.int16)
    return {'b':[round(float(x),4) for x in (*lo,*hi)],'p':b64(q),'c':b64(np.clip(Cc.reshape(-1,3),0,255).round().astype(np.uint8))}
def quat(R):   # (a turn's quaternion, x y z w)
    R=R/np.linalg.norm(R,axis=0); w=np.sqrt(max(0,1+R[0,0]+R[1,1]+R[2,2]))/2
    if w>1e-4: return [(R[2,1]-R[1,2])/(4*w),(R[0,2]-R[2,0])/(4*w),(R[1,0]-R[0,1])/(4*w),w]
    i=int(np.argmax(np.diag(R))); j,k=(i+1)%3,(i+2)%3; s=np.sqrt(max(0,1+R[i,i]-R[j,j]-R[k,k]))*2; q=[0,0,0,0]; q[i]=s/4; q[j]=(R[j,i]+R[i,j])/s; q[k]=(R[k,i]+R[i,k])/s; q[3]=(R[k,j]-R[j,k])/s; return q
def model(f,o):   # (the whole model flat, or with its parts apart, its dropped nodes and cut faces left out)
    if not o: T,Cc=pb['from_glb'](f); return T,Cc,{}
    j,_=pb['glb'](f); N=j['nodes']; par={c:i for i,n in enumerate(N) for c in n.get('children',[])}; G={}
    def glob_(i):
        if i not in G: G[i]=(glob_(par[i])@pb['trs'](N[i])) if i in par else pb['trs'](N[i])
        return G[i]
    def under(i,names):
        while True:
            if N[i].get('name') in names: return N[i]['name']
            if i not in par: return None
            i=par[i]
    PN={n.get('name'):i for i,n in enumerate(N)}; parts=o.get('parts',[]); miss=[p for p in parts+o.get('drop',[]) if p not in PN]
    if miss: raise Exception('no node '+','.join(miss))
    cut=[np.array(b,float) for b in o.get('cut',[])]; out={'':([],[])}; out.update({p:([],[]) for p in parts})
    for i,n in enumerate(N):
        if 'mesh' not in n or under(i,o.get('drop',[])): continue
        T,Cc=pb['from_glb'](f,i); m=T.mean(1); keep=np.ones(len(T),bool)
        for b in cut: keep&=~np.all((m>=b[:3])&(m<=b[3:]),1)
        k=under(i,parts) or ''; out[k][0].append(T[keep]); out[k][1].append(Cc[keep])
    R={k:(np.vstack(a),np.vstack(c)) for k,(a,c) in out.items() if a}; P={}
    for p in parts:
        M=glob_(PN[p]); P[p]=(M[:3,3].copy(),M[:3,:3]/np.linalg.norm(M[:3,:3],axis=0))
    return R[''][0],R[''][1],{p:(R[p][0],R[p][1],P[p][0],P[p][1]) for p in parts if p in R}
L=json.load(open(LST)); MAP={}; OUT={}
for item,e in L.items():
    o=e if isinstance(e,dict) else None; i=o['id'] if o else e; key=i+'@'+item if o else i
    if key not in OUT:
        f=named(i) if o and o.get('preview') else get(i)
        if not f: continue
        try: T,Cc,parts=model(f,o)
        except Exception as ex: print('skip',key,ex); continue
        n=len(T)+sum(len(v[0]) for v in parts.values())
        if n>MAXT or len(T)==0: print('skip',key,n,'faces'); continue
        A=np.vstack([T.reshape(-1,3)]+[v[0].reshape(-1,3) for v in parts.values()]); lo=A.min(0); hi=A.max(0); off=np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2])
        OUT[key]=pack(T-off,Cc)
        if parts:
            OUT[key]['parts']={}
            for p,(Tp,Cp,t,Rm) in parts.items():
                Lp=((Tp.reshape(-1,3)-t)@Rm).reshape(-1,3,3); q=pack(Lp,Cp); q['at']=[round(float(x),4) for x in t-off]; q['q']=[round(float(x),5) for x in quat(Rm)]; OUT[key]['parts'][p]=q
    MAP[item]=key
json.dump({'map':MAP,'m':OUT,'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files'},open(OUTF,'w'),separators=(',',':'))
print(len(MAP),'items,',len(OUT),'models,',os.path.getsize(OUTF)//1024,'KB')
