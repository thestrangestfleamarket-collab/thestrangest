# THE PET STORE'S CAGES (owner, 8 Nov 2026: "the left right and back of pet stoer have cages with each animal inside"; "make sure every single type of animals,
# creatuers, etc. anything alive can be a pet"): every kind in the cages (every base animal and the creatures' breeds, the dog, cat and farm breeds staying in the
# adoption book) baked once as it stands at rest: its pet body with its first colours, posed on the first frame of its idle, simplified, sized to its cage (no bigger
# than a pet), standing on the cage floor and facing out. Writes data/petcages.json ({kinds:[{k, lo, sc, p, c, i}]}, metres). Run: python3 tools/petcages-bake.py
# (needs numpy, fast-simplification)
import json, base64, numpy as np, fast_simplification as FS
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode(); B=lambda s,t:np.frombuffer(base64.b64decode(s),t)
H2=lambda h:np.array([int(h[1:3],16),int(h[3:5],16),int(h[5:7],16)],float)
CW,CH,CD=.6,.5,.42   # the room inside a cage, metres
KEEP=.22             # what is left of a body's triangles
def q2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def world(par,T,Q,S):
    G=[]
    for i,p in enumerate(par):
        L=np.eye(4); L[:3,:3]=q2m(Q[i])*np.array(S[i]); L[:3,3]=T[i]; G.append(G[p]@L if p>=0 else L)
    return np.stack(G)
import re
def pick(names):
    f=lambda r:next((n for n in names if re.search(r,n,re.I)),None)
    return f(r'^idle(?!.*open)') or f(r'idle|rest|stand|breath') or names[0]
IDX=json.load(open('data/pets.json')); by={k['key']:k for k in IDX['kinds']}
NEWB={'pitsnake','cavebat','greenslime','blueslime','redslime','purpleslime','robin','bluejay','cardinal','oriole','starling','sparrow','mockingbird','redwing','redtail','heron','squirrel','giantrat','cavefrog','radspider','giantwasp','mourningdove'}   # (the creatures' breeds, tools/pets-more.py)
CAGED=[k for k in IDX['kinds'] if not k.get('of') or k['key'] in NEWB]
out=[]
for K in CAGED:
    of=K.get('of'); D=json.load(open('data/pets/'+(of or K['key'])+'.json')); M=D['mesh']; R=D['rig']; n=M['n']
    P=(B(M['p'],np.int16).reshape(-1,3).astype(float)+32500)*M['sc']+np.array(M['lo']); T=np.array(R['t'],float); Z=B(M['z'],np.uint8)
    if of:
        b=json.load(open('data/pets/b/'+K['key']+'.json'))
        if b.get('p'): P=P+B(b['p'],np.int8).reshape(-1,3)*b['s']
        for i,t in b.get('t',{}).items(): T[int(i)]+=t
        if b.get('z'): Z=B(b['z'],np.uint8)
    # its colours, as the page paints them: each zone's colour, each corner keeping its own shade of it
    C0=B(M['c'],np.uint8).reshape(-1,3).astype(float); Z0=np.array([H2(c) for _,c in D['zones']]); Zn=np.array([H2(c) for _,c in K['zones']])
    zb=np.minimum(Z,len(Zn)-1); lv=(C0.sum(1)+1)/(Z0[np.minimum(B(M['z'],np.uint8),len(Z0)-1)].sum(1)+1); C=np.clip(np.round(Zn[zb]*lv[:,None]),0,255)
    # posed on the idle's first frame
    S=R.get('s') or [[1,1,1]]*len(T); Gr=world(R['parent'],T,R['q'],S)
    cl=D['clips'][pick(list(D['clips']))]; nb=len(R['names']); Qc=B(cl['q'],np.int16).reshape(cl['n'],nb,4)[0]/32000; Tp=T.copy()
    for bn,v in cl.get('p',{}).items(): j=R['names'].index(bn); Tp[j]=T[j]+B(v,np.float32).reshape(-1,3)[0]
    Gp=world(R['parent'],Tp,Qc,S); Mx=np.einsum('bij,bjk->bik',Gp,np.linalg.inv(Gr))
    J=B(M['j'],np.uint8).reshape(-1,4).astype(int); W=B(M['w'],np.uint8).reshape(-1,4)/255.; W=W/np.maximum(1e-6,W.sum(1,keepdims=True)); Ph=np.c_[P,np.ones(n)]
    V=sum(W[:,k:k+1]*np.einsum('nij,nj->ni',Mx[J[:,k]][:,:3,:],Ph) for k in range(4))
    F=B(M['i'],np.uint16).reshape(-1,3).astype(np.int64)
    # simplified as a whole (each new corner takes the colour of the old one nearest it)
    if len(F)>200:
        v2,f2=FS.simplify(V.astype(np.float32),F.astype(np.int32),target_reduction=1-KEEP)
        if len(f2):
            near=np.concatenate([((V[None]-v2[a:a+256,None])**2).sum(2).argmin(1) for a in range(0,len(v2),256)]); V,F,C=v2.astype(float),f2.astype(np.int64),C[near]
    # sized: a pet's own length, no bigger than its cage; on the cage's floor, in its middle
    lo=V.min(0); hi=V.max(0); ext=hi-lo; long=K['long']; s=min(long/max(ext.max(),1e-6),CW/ext[0],CH/ext[1],CD/ext[2])
    V=(V-[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2])*s; lo=V.min(0); hi=V.max(0); sc=(hi-lo).max()/65000
    out.append({'k':K['key'],'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((V-lo)/sc-32500).astype(np.int16)),'c':b64(C.astype(np.uint8)),'i':b64(F.astype(np.uint16)),'tris':len(F)})
    print(K['key'],n,'->',len(V),'pts',len(F),'tris',np.round(hi-lo,2).tolist(),flush=True)
json.dump({'kinds':out},open('data/petcages.json','w'),separators=(',',':'))
import os; print('data/petcages.json',len(out),'kinds',os.path.getsize('data/petcages.json')//1000,'KB',sum(o['tris'] for o in out),'tris')
