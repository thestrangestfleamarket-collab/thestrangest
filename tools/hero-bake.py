# Bakes the superhero (data/full/superhero-male.gltf, its own skin on the UAL skeleton) into archive/data/hero.json for BODIES: the head kept,
# the body simplified, each face painted a suit colour, each corner held by its two strongest of the 15 bones. python3 tools/hero-bake.py (needs numpy, fast-simplification)
import json,numpy as np,fast_simplification as FS
SRC='data/full/superhero-male.gltf'
BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR']
MAP={'root':'hips','pelvis':'hips','spine_01':'torso','spine_02':'torso','spine_03':'torso','clavicle':'torso','neck_01':'head','Head':'head',
     'upperarm':'upperArm','lowerarm':'forearm','hand':'hand','index':'hand','middle':'hand','ring':'hand','pinky':'hand','thumb':'hand',
     'thigh':'thigh','calf':'shin','foot':'shoe','ball':'shoe'}
COLORS=['suit','red','gold','skin','hair','eye','pupil']
BODYK=.4
J=json.load(open(SRC)); BF=open('data/full/'+J['buffers'][0]['uri'],'rb').read()
def acc(i):
    a=J['accessors'][i];v=J['bufferViews'][a['bufferView']];n={'VEC4':4,'VEC3':3,'VEC2':2,'SCALAR':1,'MAT4':16}[a['type']]
    dt={5126:np.float32,5123:np.uint16,5121:np.uint8}[a['componentType']]
    return np.frombuffer(BF,dt,a['count']*n,v.get('byteOffset',0)).reshape(-1,n)
skin=J['skins'][0]; names=[J['nodes'][j]['name'] for j in skin['joints']]
def bone(n):
    k=n.split('_')[0] if n not in MAP else n
    b=MAP[k]; return BONES.index(b+(n[-1].upper() if b not in ('hips','torso','head') else ''))
JB=np.array([bone(n) for n in names])
JP={n:np.linalg.inv(M.reshape(4,4).T)[:3,3] for n,M in zip(names,acc(skin['inverseBindMatrices']))}
def part(mi):
    p=J['meshes'][mi]['primitives'][0];a=p['attributes']; P=acc(a['POSITION']).astype(float); F=acc(p['indices']).reshape(-1,3).astype(int)
    W=np.zeros((len(P),len(BONES))); jj=acc(a['JOINTS_0']); ww=acc(a['WEIGHTS_0'])
    for k in range(4): np.add.at(W,(np.arange(len(P)),JB[jj[:,k]]),ww[:,k])
    u,first,inv=np.unique(np.round(P,5),axis=0,return_index=True,return_inverse=True); F=inv.reshape(-1)[F]   # (UV seams welded)
    return P[first],F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])],W[first]
def paint(P,F):
    C=P[F].mean(1); x,y,z=np.abs(C[:,0]),C[:,1],C[:,2]; N=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]]); nz=N[:,2]/(np.linalg.norm(N,axis=1)+1e-12)
    c=np.zeros(len(F),int)
    c[(y>0.80)&(y<0.99)&(x<0.24)]=1; c[(y<0.36)|(x>0.58)]=1; c[(y>=0.99)&(y<1.05)&(x<0.24)]=2
    c[(x/0.11+np.abs(y-1.36)/0.09<1)&(z>0)&(nz>0.2)]=2
    c[y>1.555]=3; c[((y>1.715)|((y>1.62)&(z<-0.035)))&(y>1.555)]=4
    return c
def simplify(P,F,keep):
    u,inv=np.unique(F,return_inverse=True); sv=P[u]; sf=inv.reshape(-1,3)
    if keep>=1: return sv,sf,u
    v,f=FS.simplify(sv.astype(np.float32),sf.astype(np.int32),target_reduction=1-keep,preserve_border=True)
    j=np.array([((sv-q)**2).sum(1).argmin() for q in v]); return v.astype(float),f.astype(int),u[j]
VV=[];FF=[];CC=[];WW=[];o=0
P,F,W=part(2); col=paint(P,F); head=P[F].mean(1)[:,1]>1.53
for r in range(len(COLORS)):
    for h in (True,False):
        m=(col==r)&(head==h)
        if not m.any(): continue
        v,f,old=simplify(P,F[m],1 if h else BODYK); VV.append(v); FF.append(f+o); CC.append(np.full(len(f),r)); WW.append(W[old]); o+=len(v)
for mi,r in ((0,4),(1,5)):
    v,f,w=part(mi); fc=np.full(len(f),r)
    if mi==1:
        C=v[f].mean(1); side=C[:,0]>0
        for s in (True,False):
            cx,cy=v[:,0][f[side==s].ravel()].mean(),v[:,1][f[side==s].ravel()].mean(); fc[(side==s)&(np.hypot(C[:,0]-cx,C[:,1]-cy)<0.006)]=6
    VV.append(v); FF.append(f+o); CC.append(fc); WW.append(w); o+=len(v)
P=np.vstack(VV); F=np.vstack(FF); col=np.concatenate(CC); W=np.vstack(WW)
top=np.argsort(-W,1)[:,:2]; wa=W[np.arange(len(W)),top[:,0]]; wb=W[np.arange(len(W)),top[:,1]]; w=wa/np.maximum(wa+wb,1e-9)
# the 15 bones' rest: hips, torso and head upright; a limb's y up it toward its parent and its x the world's x turned with it from hanging
def hang(a,c):
    d=c-a; d/=np.linalg.norm(d); dn=np.array([0,-1.,0]); ax=np.cross(dn,d); s=np.linalg.norm(ax); co=dn@d
    if s<1e-6: R=np.eye(3)
    else: k=ax/s; K=np.array([[0,-k[2],k[1]],[k[2],0,-k[0]],[-k[1],k[0],0]]); R=np.eye(3)+s*K+(1-co)*K@K
    x=R@np.array([1.,0,0]); y=-d; return np.stack([x,y,np.cross(x,y)],1)
I3=np.eye(3); FR={'hips':(JP['pelvis'],I3),'torso':(JP['spine_01'],I3),'head':(JP['neck_01'],I3)}
for s,n in (('l','L'),('r','R')):
    for b,a,c in (('upperArm','upperarm','lowerarm'),('forearm','lowerarm','hand'),('hand','hand','middle_04_leaf'),('thigh','thigh','calf'),('shin','calf','foot')):
        FR[b+n]=(JP[a+'_'+s],hang(JP[a+'_'+s],JP[c+'_'+s]))
    FR['shoe'+n]=(JP['foot_'+s],I3)
out={'bones':BONES,'colors':COLORS,'bodies':{'hero':{
  'height':round(float(P[:,1].max()),4),'hipY':round(float(JP['pelvis'][1]),4),
  'origin':[np.round(FR[b][0],4).tolist() for b in BONES],'rest':[np.round(FR[b][1].T.reshape(-1),5).tolist() for b in BONES],
  'pos':np.round(P,4).reshape(-1).tolist(),'tri':F.reshape(-1).tolist(),'bone':top.reshape(-1).tolist(),'w':np.round(w,3).tolist(),'col':col.tolist()}}}
json.dump(out,open('archive/data/hero.json','w'),separators=(',',':'))
print('archive/data/hero.json',len(F),'triangles')
