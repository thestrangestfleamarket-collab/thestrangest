# THE KNIGHT (owner, 10 Nov 2026): data/full/knight-plate.glb (an animated knight in plate, CC0, Patch / anymove) onto your 15-bone rig for BODIES:
# his picture read into a colour per corner, the UV seams welded, simplified to TRIS triangles, then tools/rig-rebake.py. Writes data/knight.json.
# python3 tools/knight-bake.py  (needs numpy, pillow)
import json,struct,io,heapq,importlib.util,os,numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
sp=importlib.util.spec_from_file_location('rr','tools/rig-rebake.py'); rr=importlib.util.module_from_spec(sp); sp.loader.exec_module(rr)
SRC='data/full/knight-plate.glb'; OUT='data/knight.json'; TRIS=6000
ROLE={'pelvis':'pelvis','waist':'spine1','neck':'neck'}
WMAP={'pelvis':'hips','spine1':'torso','spine2':'torso','chest':'torso','neck':'head','head':'head'}
for n in 'LR':
    ROLE.update({'shoulder'+n:'upperarm_'+n,'elbow'+n:'forearm_'+n,'wrist'+n:'hand_'+n,'hip'+n:'thigh_'+n,'knee'+n:'shin_'+n,'ankle'+n:'foot_'+n})
    WMAP.update({'clavicle_'+n:'torso','upperarm_'+n:'upperArm'+n,'forearm_'+n:'forearm'+n,'hand_'+n:'hand'+n,'thigh_'+n:'thigh'+n,'shin_'+n:'shin'+n,'foot_'+n:'shoe'+n,'toe_'+n:'shoe'+n})

b=open(SRC,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); BF=b[28+n:]
def acc(i):
    a=J['accessors'][i]; v=J['bufferViews'][a['bufferView']]; k={'VEC4':4,'VEC3':3,'VEC2':2,'SCALAR':1,'MAT4':16}[a['type']]
    dt=np.dtype({5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}[a['componentType']]); sz=dt.itemsize*k; st=v.get('byteStride',sz)
    raw=np.frombuffer(BF,np.uint8,(a['count']-1)*st+sz,v.get('byteOffset',0)+a.get('byteOffset',0))
    return np.frombuffer(raw[(np.arange(a['count'])[:,None]*st+np.arange(sz)).ravel()].tobytes(),dt).reshape(-1,k)
p=J['meshes'][0]['primitives'][0]; a=p['attributes']
P=acc(a['POSITION']).astype(float); UV=acc(a['TEXCOORD_0']).astype(float); JT=acc(a['JOINTS_0']).astype(int); WT=acc(a['WEIGHTS_0']).astype(float); F=acc(p['indices']).reshape(-1,3).astype(int)
sk=J['skins'][0]; names=[J['nodes'][j]['name'] for j in sk['joints']]
world=np.array([np.linalg.inv(M.reshape(4,4).T)[:3,3] for M in acc(sk['inverseBindMatrices'])])

# a colour per corner: the picture read at each face's middle (inside its island, clear of the seams' dark gutters), shared by its three corners
im=J['images'][J['textures'][J['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']]['source']]; v=J['bufferViews'][im['bufferView']]
T=np.asarray(Image.open(io.BytesIO(BF[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB').resize((1024,1024),Image.LANCZOS)).astype(float)/255
T=np.where(T<=.04045,T/12.92,((T+.055)/1.055)**2.4)   # sRGB to linear, like a .glb's COLOR_0
c=UV[F].mean(1); fc=T[np.clip((c[:,1]%1*1024).astype(int),0,1023),np.clip((c[:,0]%1*1024).astype(int),0,1023)]
u,first,inv=np.unique(np.round(P,5),axis=0,return_index=True,return_inverse=True); inv=inv.ravel(); NG=len(u)
G=inv[F]; ok=(G[:,0]!=G[:,1])&(G[:,1]!=G[:,2])&(G[:,0]!=G[:,2]); G=G[ok]; fc=fc[ok]
C=np.zeros((NG,3)); cn=np.zeros(NG)
for k in range(3): np.add.at(C,G[:,k],fc); np.add.at(cn,G[:,k],1)
C/=np.maximum(cn,1)[:,None]; P=P[first]; JT=JT[first]; WT=WT[first]

# simplify: quadric edge collapse onto one end (so a kept corner keeps its own colour and weights), no flipped faces
def planes(nr,d,w): q=np.concatenate([nr,d[:,None]],1); return w[:,None,None]*q[:,:,None]*q[:,None,:]
v0=P[G[:,0]]; fn=np.cross(P[G[:,1]]-v0,P[G[:,2]]-v0); ar=np.linalg.norm(fn,axis=1); fn/=np.maximum(ar,1e-20)[:,None]
Q=np.zeros((NG,4,4)); QF=planes(fn,-(fn*v0).sum(1),ar/2)
for k in range(3): np.add.at(Q,G[:,k],QF)
E=np.concatenate([G[:,[0,1]],G[:,[1,2]],G[:,[2,0]]]); fid=np.tile(np.arange(len(G)),3); ue,ei,cnt=np.unique(np.sort(E,1),axis=0,return_inverse=True,return_counts=True); bm=cnt[ei.ravel()]==1
if bm.any():
    e=E[bm]; ev=P[e[:,1]]-P[e[:,0]]; bn=np.cross(ev,fn[fid[bm]]); bn/=np.maximum(np.linalg.norm(bn,axis=1),1e-20)[:,None]; QB=planes(bn,-(bn*P[e[:,0]]).sum(1),(ev**2).sum(1)*10+1e-6)
    np.add.at(Q,e[:,0],QB); np.add.at(Q,e[:,1],QB)
T3=G.tolist(); alive=[True]*len(T3); vf=[set() for _ in range(NG)]; ver=[0]*NG; dead=[False]*NG; heap=[]
for i,t in enumerate(T3):
    for q in t: vf[q].add(i)
def push(s,d): x=np.append(P[d],1.); heapq.heappush(heap,(float(x@(Q[s]+Q[d])@x),s,d,ver[s],ver[d]))
def ring(s): return {q for f in vf[s] for q in T3[f]}-{s}
def collapse(s,d):
    keep=[f for f in vf[s] if d not in T3[f]]; gone=len(vf[s])-len(keep)
    if len(ring(s)&ring(d))>gone: return 0
    for f in keep:
        t=T3[f]; ps=[P[q] for q in t]; n0=np.cross(ps[1]-ps[0],ps[2]-ps[0]); ps[t.index(s)]=P[d]; n1=np.cross(ps[1]-ps[0],ps[2]-ps[0]); l=np.linalg.norm(n0)*np.linalg.norm(n1)
        if l<1e-20 or n0@n1<.2*l: return 0
    for f in list(vf[s]):
        if d in T3[f]:
            alive[f]=False
            for q in T3[f]: vf[q].discard(f)
        else: T3[f][T3[f].index(s)]=d; vf[d].add(f)
    vf[s]=set(); dead[s]=True; Q[d]+=Q[s]; ver[s]+=1; ver[d]+=1
    for w in ring(d): push(d,w); push(w,d)
    return gone
for s,d in ue.tolist(): push(s,d); push(d,s)
left=len(T3)
while left>TRIS and heap:
    _,s,d,vs,vd=heapq.heappop(heap)
    if not(dead[s] or dead[d] or ver[s]!=vs or ver[d]!=vd): left-=collapse(s,d)
F=np.array([t for t,al in zip(T3,alive) if al]); used,F=np.unique(F,return_inverse=True); F=F.reshape(-1,3)

body,_=rr.rebake({'rig':{'names':names,'world':world},'arrays':(P[used],C[used],F,JT[used],WT[used])},ROLE,WMAP)
json.dump({'bones':rr.BONES,'bodies':{'knight':body}},open(OUT,'w'),separators=(',',':'))
print('knight height',body['height'],'tris',len(F),'verts',len(used),OUT,round(os.path.getsize(OUT)/1e3),'KB')
