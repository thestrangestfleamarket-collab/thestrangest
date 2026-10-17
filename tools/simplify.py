# SIMPLER MODELS (owner, 17 Oct 2026: "simplify into logical shapes that are the same but just dont need to be so complex. i still want the
# things to look the same, just not so detailed"; "lets do less simplification on the faces of characters, leave them as complex as they are,
# change rest of body to medium"; "go"): every model in data/ with fewer triangles and the same look, no holes:
#  - characters (the skeletons, the six figures, the creatures, the dragon, the bear, the goldfish): the head (the head bone and every bone under
#    it; the bear's head, muzzle, eyes and ears) kept exactly as it is, the rest of the body to half;
#  - things (the park's plants, toys, trees, rocks, the kit, the skeletons' gear): the small marks that stand out in colour (eyes, noses, spots)
#    kept exactly with a ring round them, the plain rest to a third.
# Each part (a colour region, the head, the rest) is simplified on its own with its edge held, so nothing cracks; a new corner takes its colour,
# region and bones from the nearest old one. The originals are kept in data/full/ (not built into the page); this reads from there, so it can
# be run again with other amounts. Run: python3 tools/simplify.py   (needs numpy, fast-simplification)
import json,base64,os,shutil,sys,numpy as np,fast_simplification as FS
from collections import defaultdict
B=lambda s,t:np.frombuffer(base64.b64decode(s),t); E=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
BODY,THING=.5,.33
FILES=['props','forest','kit','figures','creatures','skel','dragon','bear','goldfish']
os.makedirs('data/full',exist_ok=True)
for f in FILES:
    if not os.path.exists(f'data/full/{f}.json'): shutil.copy(f'data/{f}.json',f'data/full/{f}.json')

def nearest(src,dst):
    j=np.empty(len(dst),np.int64)
    for a in range(0,len(dst),256): j[a:a+256]=((dst[a:a+256,None,:]-src[None])**2).sum(2).argmin(1)
    return j
def piece(V,F,keep):   # one part: kept as it is, or simplified to `keep` with its edge held; returns its points, faces, and each new point's old one
    u,inv=np.unique(F,return_inverse=True); sv=V[u]; sf=inv.reshape(-1,3)
    if keep>=1 or len(sf)<16: return sv,sf,u
    v,f=FS.simplify(sv.astype(np.float32),sf.astype(np.int32),target_reduction=1-keep,preserve_border=True)
    if len(f)==0: return sv,sf,u
    return v.astype(float),f.astype(np.int64),u[nearest(sv,v)]
def details(F,FC,thr=60):   # faces whose colour stands out from their neighbours' (an eye, a nose, a spot), with a ring round them
    vf=defaultdict(list)
    for i,t in enumerate(F):
        for x in t: vf[x].append(i)
    nb=[np.unique(np.concatenate([vf[x] for x in t])) for t in F]; FC=FC.astype(float); lum=FC@[.3,.55,.15]
    d=np.array([abs(lum[i]-np.median(lum[n]))>thr*.5 or np.abs(FC[i]-np.median(FC[n],0)).max()>thr for i,n in enumerate(nb)])
    return d|np.array([d[n].any() for n in nb])
def run(V,F,groups):   # groups: (face index list, how much to keep); returns the new points (with each one's old point) and faces
    VV=[];FF=[];OO=[];o=0
    for m,k in groups:
        if not len(m): continue
        v,f,old=piece(V,F[m],k); VV.append(v); FF.append(f+o); OO.append(old); o+=len(v)
    V2=np.vstack(VV); F2=np.vstack(FF); O2=np.concatenate(OO)
    # weld: the same point with the same old point (the edges between parts) back into one corner, so the shading has no seams
    key={}; remap=np.empty(len(V2),np.int64); keepv=[]
    for i,(p,ol) in enumerate(zip(map(tuple,np.round(V2,6)),O2)):
        kk=(p,ol)
        if kk not in key: key[kk]=len(keepv); keepv.append(i)
        remap[i]=key[kk]
    F2=remap[F2]; F2=F2[(F2[:,0]!=F2[:,1])&(F2[:,1]!=F2[:,2])&(F2[:,0]!=F2[:,2])]
    return V2[keepv],F2,O2[keepv]

# ---- INDEXED meshes (the kit, the gear, the rigged characters): n, lo, sc, p (u16 x3), c (u8 x3), [r u8], [j u8 x4, w u8 x4], i (u16 or u32)
def indexed(M,head=None,keepk=THING):
    n=M['n']; V=np.array(M['lo'])+B(M['p'],np.uint16).reshape(-1,3).astype(float)*M['sc']; C=B(M['c'],np.uint8).reshape(-1,3)
    big=M.get('i32') or n>65535; F=B(M['i'],np.uint32 if big else np.uint16).reshape(-1,3).astype(np.int64)
    R=B(M['r'],np.uint8) if 'r' in M else np.zeros(n,np.uint8); J=B(M['j'],np.uint8).reshape(-1,4) if 'j' in M else None; W=B(M['w'],np.uint8).reshape(-1,4) if 'w' in M else None
    # (corners stored twice at a colour seam are joined first, or every triangle's edge would count as an edge to hold and nothing would simplify;
    # each joined corner keeps the first copy's colour and bones)
    u,first,inv=np.unique(np.round(V,6),axis=0,return_index=True,return_inverse=True); V=u; F=inv.reshape(-1)[F]; C=C[first]; R=R[first]
    if J is not None: J=J[first]; W=W[first]
    n=len(V); F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
    fr=R[F[:,0]]; groups=[]
    if head is not None and J is not None:   # a character: the head kept, the body to half; the glowing part (eye region) kept too
        dom=J[np.arange(n),W.argmax(1)]; hv=np.isin(dom,list(head)); hf=hv[F].any(1)|(fr==M.get('eye',-1))
        for r in np.unique(fr): groups+= [(np.where((fr==r)&hf)[0],1),(np.where((fr==r)&~hf)[0],keepk)]
    else:   # a thing: its marks kept, the rest to a third
        dt=details(F,C[F].mean(1))
        for r in np.unique(fr): groups+= [(np.where((fr==r)&dt)[0],1),(np.where((fr==r)&~dt)[0],keepk)]
    V2,F2,O=run(V,F,groups)
    lo=V2.min(0); sc=max((V2.max(0)-lo).max()/65535,1e-9); q=np.clip(np.round((V2-lo)/sc),0,65535).astype(np.uint16)
    N=dict(M); N.update(n=len(V2),lo=[round(float(x),5) for x in lo],sc=sc,p=E(q),c=E(C[O]),tris=len(F2))
    big2=len(V2)>65535; N['i']=E(F2.astype(np.uint32 if big2 else np.uint16));
    if 'i32' in M or big2: N['i32']=bool(big2)
    if 'r' in M: N['r']=E(R[O])
    if J is not None: N['j']=E(J[O]); N['w']=E(W[O])
    return N
def headset(rig,match):   # the head bone(s) and every bone under them
    names=rig['names']; par=rig['parent']; S={i for i,nm in enumerate(names) if match(nm)}
    ch=True
    while ch:
        ch=False
        for i,p in enumerate(par):
            if p in S and i not in S: S.add(i); ch=True
    return S

# ---- SOUP meshes (props, forest, the bear, the goldfish): p (f32, three corners a triangle), c (u8 a corner), [k u8 a triangle], [r u8 a corner]
def soup(M,keepregs=None,keepk=THING):
    P=B(M['p'],np.float32).reshape(-1,3).astype(float); C=B(M['c'],np.uint8).reshape(-1,3); nt=len(P)//3
    V,inv=np.unique(np.round(P,5),axis=0,return_inverse=True); F=inv.reshape(-1,3); FC=C.reshape(nt,3,3).mean(1)
    K=B(M['k'],np.uint8)[:nt] if 'k' in M else None; R=B(M['r'],np.uint8).reshape(nt,3)[:,0] if 'r' in M else np.zeros(nt,np.uint8)
    # (a soup's corners each have their own colour: the parts are split by colour region and kind, so each keeps its own)
    lab=R.astype(np.int64)*256+(K.astype(np.int64) if K is not None else 0); groups=[]
    if keepregs is not None: dt=np.isin(R,list(keepregs))
    else: dt=details(F,FC)
    for g in np.unique(lab): groups+= [(np.where((lab==g)&dt)[0],1),(np.where((lab==g)&~dt)[0],keepk)]
    # simplified per part; a new face takes the colour, kind and region of the old face nearest its middle, within its part
    VV=[];FF=[];FCn=[];Kn=[];Rn=[]
    for m,k in groups:
        if not len(m): continue
        v,f,_=piece(V,F[m],k); cen=V[F[m]].mean(1); j=m[nearest(cen,v[f].mean(1))]
        VV.append(v[f].reshape(-1,3)); FCn.append(FC[j]); Kn.append(K[j] if K is not None else None); Rn.append(R[j])
    P2=np.vstack(VV); FC2=np.vstack(FCn); nt2=len(P2)//3
    N=dict(M); N['p']=E(P2.astype(np.float32)); N['c']=E(np.repeat(np.round(FC2).astype(np.uint8),3,axis=0)); N['tris']=nt2
    if K is not None: N['k']=E(np.concatenate(Kn).astype(np.uint8))
    if 'r' in M: N['r']=E(np.repeat(np.concatenate(Rn).astype(np.uint8),3))
    return N

def load(f): return json.load(open(f'data/full/{f}.json'))
def save(f,d): s=json.dumps(d,separators=(',',':')); open(f'data/{f}.json','w').write(s); return len(s)
tot0=tot1=0; t0=t1=0
def report(name,a,b): global t0,t1; t0+=a; t1+=b; print(f'  {name:28s} {a:6d} -> {b:6d} triangles')
for f in ['props','forest']:
    d=load(f); out={}
    for k,M in d.items():
        if isinstance(M,dict) and 'p' in M: out[k]=soup(M); report(k,M['tris'] if 'tris' in M else len(B(M['p'],np.float32))//9,out[k]['tris'])
        else: out[k]=M
    print(f,save(f,out))
d=load('kit'); used=set()
for s in os.listdir('src'):
    if s.endswith('.js'): txt=open('src/'+s).read(); used|={k for k in d if "'"+k+"'" in txt}
out={k:indexed(M) for k,M in d.items() if k in used}; [report('kit '+k,d[k]['tris'],out[k]['tris']) for k in out]
print('kit (unused pieces dropped:',sorted(set(d)-used),')',save('kit',out))
HEAD=lambda nm:nm.lower() in ('head',) or nm in ('Head','Head_001')
d=load('figures')
for k,M in d.items(): hs=headset(M['rig'],lambda nm:nm=='Head'); N=indexed(M,hs,BODY); report('figure '+k,M['tris'],N['tris']); d[k]=N
print('figures',save('figures',d))
d=load('creatures')
for k,D in d.items(): hs=headset(D['rig'],lambda nm:nm=='Head'); N=indexed(D['mesh'],hs,BODY); report('creature '+k,D['mesh']['tris'],N['tris']); D['mesh']=N
print('creatures',save('creatures',d))
d=load('skel'); hs=headset(d['rig'],lambda nm:nm=='head')
for k,M in d['chars'].items(): N=indexed(M,hs,BODY); report('skeleton '+k,M['tris'],N['tris']); d['chars'][k]=N
for k,M in d['gear'].items(): N=indexed(M); report('gear '+k,M['tris'],N['tris']); d['gear'][k]=N
print('skel',save('skel',d))
d=load('dragon'); hs=headset(d['rig'],lambda nm:nm=='Head')
for k,M in d['chars'].items(): N=indexed(M,hs,BODY); report('dragon '+k,M['tris'],N['tris']); d['chars'][k]=N
print('dragon',save('dragon',d))
d=load('bear'); nm=d['names']; N=soup(d,{i for i,x in enumerate(nm) if x in ('ears','head','muzzle','eyes and nose')},BODY); report('bear',d['tris'],N['tris']); print('bear',save('bear',N))
d=load('goldfish'); N=soup(d,None,BODY); report('goldfish',d['tris'],N['tris']); print('goldfish',save('goldfish',N))
print(f'ALL MODELS: {t0} -> {t1} triangles')
