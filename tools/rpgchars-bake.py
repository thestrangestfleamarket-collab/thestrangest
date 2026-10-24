# THE RPG TOWNSFOLK (owner, 24 Oct 2026, his RPG Characters pack, "both"): six Quaternius classes (Cleric, Monk, Ranger, Rogue, Warrior,
# Wizard), each a rigged .fbx with its own clips (Walk, Run, Idle, ...), baked into data/rpgchars.json for src/NNN-npc-rpg.js the way the
# creatures are (rig + skinned mesh + clips, the armature's 100x and quarter-turn folded into the root bone). Unlike the creatures their
# colour is sampled from the pack's per-character texture at each vertex (so the model ships no texture, as the rule is); the face and
# shoulder pads are still meshes hung on their bone (bound to it whole), and the held weapon is dropped — these are passers-by, not fighters.
# Run: the .fbx first to .glb with FBX2glTF, then  python3 tools/rpgchars-bake.py <glb dir> <textures dir> Warrior Cleric Monk Ranger Rogue Wizard
import sys, os, json, struct, base64, numpy as np
from PIL import Image
R=sys.argv[1]; TEXDIR=sys.argv[2]; KEYS=sys.argv[3:]
TARGET=2200   # triangles per character after simplification (street passers-by, seen from afar)
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def quat2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    M=np.eye(4); M[:3,:3]=quat2m(q)*s; M[:3,3]=t; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
clean=lambda n:n.replace('.','_').replace('|','_').replace(':','_')
def nearest(src,dst):
    j=np.empty(len(dst),np.int64)
    for a in range(0,len(dst),256): j[a:a+256]=((dst[a:a+256,None,:]-src[None])**2).sum(2).argmin(1)
    return j
OUT={}
for key in KEYS:
    j,b=glb(os.path.join(R,key+'.glb')); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}; G={}
    TEX=np.array(Image.open(os.path.join(TEXDIR,key+'_Texture.png')).convert('RGB'))
    def colours(uv):   # the texture's colour under each vertex (nearest texel; glTF's v runs down from the top, as the image rows do)
        u=np.clip((uv[:,0]%1)*TEX.shape[1],0,TEX.shape[1]-1).astype(int); v=np.clip((uv[:,1]%1)*TEX.shape[0],0,TEX.shape[0]-1).astype(int); return TEX[v,u]
    def glob_(i):
        if i in G: return G[i]
        M=trs(j['nodes'][i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    J=[]; [J.append(i) for sk in j['skins'] for i in sk['joints'] if i not in J]; JN=[clean(j['nodes'][i]['name']) for i in J]; JI={n:k for k,n in enumerate(JN)}
    parent=[JI.get(clean(j['nodes'][par[i]]['name']),-1) if i in par else -1 for i in J]
    order=[]; seen=set()
    def walk(k):
        if k in seen: return
        if parent[k]>=0: walk(parent[k])
        seen.add(k); order.append(k)
    for k in range(len(J)): walk(k)
    remap={k:i for i,k in enumerate(order)}; names=[JN[k] for k in order]; par_=[remap[parent[k]] if parent[k]>=0 else -1 for k in order]
    L=[np.linalg.inv(glob_(J[parent[k]]))@glob_(J[k]) if parent[k]>=0 else glob_(J[k]) for k in order]
    t=[]; q=[]; sc_=[]
    for M in L:
        s=np.linalg.norm(M[:3,:3],axis=0); Rm=M[:3,:3]/s; tr=np.trace(Rm); sc_.append(np.round(s,5).tolist())
        if tr>0: S=np.sqrt(tr+1)*2; qq=[(Rm[2,1]-Rm[1,2])/S,(Rm[0,2]-Rm[2,0])/S,(Rm[1,0]-Rm[0,1])/S,.25*S]
        else:
            i=int(np.argmax(np.diag(Rm))); jx,kx=(i+1)%3,(i+2)%3; S=np.sqrt(1+Rm[i,i]-Rm[jx,jx]-Rm[kx,kx])*2; qq=[0,0,0,0]; qq[i]=.25*S; qq[jx]=(Rm[jx,i]+Rm[i,jx])/S; qq[kx]=(Rm[kx,i]+Rm[i,kx])/S; qq[3]=(Rm[kx,jx]-Rm[jx,kx])/S
        t.append(np.round(M[:3,3],5).tolist()); q.append(np.round(qq,6).tolist())
    Gf=np.stack([glob_(J[k]) for k in order]); ibm=np.linalg.inv(Gf)
    rig={'names':names,'parent':par_,'t':t,'q':q,'ibm':b64(ibm.transpose(0,2,1).astype(np.float32))}
    if any(abs(np.array(x)-1).max()>1e-4 for x in sc_): rig['s']=sc_
    MAIN=key+'_Texture'   # the body/face/pads; everything else (the weapon's own texture) is dropped
    # the skin: body skinned by its weights; the face and shoulder pads bound whole to the bone they hang on; all at rest in the world
    P=[];C=[];RG=[];JJ=[];WW=[];IX=[]; parts=[]; base=0
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        skinned='skin' in n
        if skinned:
            Jn=j['skins'][n['skin']]['joints']; ibm0=acc(j,b,j['skins'][n['skin']]['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
            JM=np.stack([glob_(Jn[k])@ibm0[k] for k in range(len(Jn))]); rm=np.array([remap[JI[clean(j['nodes'][Jn[k]]['name'])]] for k in range(len(Jn))])
        else:
            pj=JI.get(clean(j['nodes'][par[ni]]['name'])) if ni in par else None
            if pj is None: continue   # a mesh on no bone: skip
            kr=remap[pj]; GM=glob_(ni)
        pn=clean(n['name'])
        for p in j['meshes'][n['mesh']]['primitives']:
            mn=j['materials'][p['material']]['name']
            if mn!=MAIN: continue   # drop the held weapon (its own texture)
            A=p['attributes']; pos=acc(j,b,A['POSITION']).astype(float); uv=acc(j,b,A['TEXCOORD_0']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int)
            if skinned:
                jn=acc(j,b,A['JOINTS_0']).astype(int); w=acc(j,b,A['WEIGHTS_0']).astype(float); w=w/np.maximum(1e-9,w.sum(1,keepdims=True))
                Ph=np.c_[pos,np.ones(len(pos))]; out=np.zeros((len(pos),3))
                for k in range(4): out+=w[:,k:k+1]*np.einsum('nij,nj->ni',JM[jn[:,k]][:,:3,:],Ph)
                bad=~np.isfinite(out).all(1); out[bad]=pos[bad]; w[bad]=[1,0,0,0]; jn[bad]=0; jj=rm[jn]
            else:
                out=(GM[:3,:3]@pos.T).T+GM[:3,3]; jj=np.zeros((len(pos),4),int); jj[:,0]=kr; w=np.zeros((len(pos),4)); w[:,0]=1
            if pn not in parts: parts.append(pn)
            P.append(out); C.append(colours(uv)); RG.append(np.full(len(pos),parts.index(pn))); JJ.append(jj); WW.append(w); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); RG=np.concatenate(RG); JJ=np.vstack(JJ); WW=np.vstack(WW); IX=np.concatenate(IX)
    if len(IX)//3>TARGET:
        import fast_simplification as fs
        P2,F2=fs.simplify(P.astype(np.float64),IX.reshape(-1,3).astype(np.int32),target_reduction=1-TARGET/(len(IX)//3)); near=nearest(P,P2.astype(np.float32))
        C=C[near]; RG=RG[near]; JJ=JJ[near]; WW=WW[near]; P=P2.astype(float); IX=F2.reshape(-1).astype(int)
    lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    mesh={'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.round().astype(np.uint8)),'r':b64(RG.astype(np.uint8)),'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':parts,'tris':len(IX)//3}
    # the clips, 24 a second: every bone's turn (quaternion int16), the bones that move (float32), the armature folded into the roots
    A={k:glob_(par[J[k]]) for k in order if parent[k]<0 and J[k] in par}; qmul=lambda a,bq:np.array([a[3]*bq[0]+a[0]*bq[3]+a[1]*bq[2]-a[2]*bq[1],a[3]*bq[1]-a[0]*bq[2]+a[1]*bq[3]+a[2]*bq[0],a[3]*bq[2]+a[0]*bq[1]-a[1]*bq[0]+a[2]*bq[3],a[3]*bq[3]-a[0]*bq[0]-a[1]*bq[1]-a[2]*bq[2]])
    def m2q(Rm):
        tr=np.trace(Rm)
        if tr>0: S=np.sqrt(tr+1)*2; return np.array([(Rm[2,1]-Rm[1,2])/S,(Rm[0,2]-Rm[2,0])/S,(Rm[1,0]-Rm[0,1])/S,.25*S])
        i=int(np.argmax(np.diag(Rm))); jx,kx=(i+1)%3,(i+2)%3; S=np.sqrt(1+Rm[i,i]-Rm[jx,jx]-Rm[kx,kx])*2; qq=[0,0,0,0]; qq[i]=.25*S; qq[jx]=(Rm[jx,i]+Rm[i,jx])/S; qq[kx]=(Rm[kx,i]+Rm[i,kx])/S; qq[3]=(Rm[kx,jx]-Rm[jx,kx])/S; return np.array(qq)
    AQ={k:m2q(M[:3,:3]/np.linalg.norm(M[:3,:3],axis=0)) for k,M in A.items()}
    clips={}
    for a in j.get('animations',[]):
        nm=a['name'].split('|')[-1]; dur=max(float(acc(j,b,s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*24))+1); T=np.linspace(0,dur,nf)
        Q=np.tile(np.array(q,float),(nf,1,1)); TR={}
        for c in a['channels']:
            s=a['samplers'][c['sampler']]; node=j['nodes'][c['target']['node']]; bn=clean(node['name'])
            if bn not in JI: continue
            k=remap[JI[bn]]; tt=acc(j,b,s['input']).reshape(-1).astype(float); v=acc(j,b,s['output']).astype(float)
            if c['target']['path']=='rotation':
                if k in AQ: v=np.stack([qmul(AQ[k],x) for x in v])
                for d in range(1,len(v)):
                    if np.dot(v[d],v[d-1])<0: v[d]=-v[d]
                qq=np.stack([np.interp(T,tt,v[:,i]) for i in range(4)],1); Q[:,k]=qq/np.linalg.norm(qq,axis=1,keepdims=True)
            elif c['target']['path']=='translation':
                if k in A: v=(A[k][:3,:3]@v.T).T+A[k][:3,3]
                p=np.stack([np.interp(T,tt,v[:,i]) for i in range(3)],1)
                if np.ptp(p,axis=0).max()>1e-4: TR[names[k]]=b64(p.astype(np.float32))
        clips[nm]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
    OUT[key.lower()]={'rig':rig,'mesh':mesh,'clips':clips,'tall':float(np.round(hi[1]-lo[1],4)),'lo':np.round(lo,4).tolist(),'hi':np.round(hi,4).tolist()}
    print(key,mesh['tris'],'tris',len(names),'bones; box',np.round(lo,2),np.round(hi,2),'clips',list(clips),'parts',parts)
OUTF=os.environ.get('OUT','data/rpgchars.json'); open(OUTF,'w').write(json.dumps(OUT,separators=(',',':'))); print(OUTF,os.path.getsize(OUTF),'bytes')
