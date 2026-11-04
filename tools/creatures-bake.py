# THE CREATURES (owner, 17 Oct 2026, "start importing google drive assets based on most recent and import into game"): the small animated
# animals from his Drive's packs (Easy Animated Enemy Pack: the rat, the frog, the snake, the spider, the wasp; Monster Pack Animated by
# Quaternius: the bat, the slime), each a rigged .fbx with its own clips, baked into data/creatures.json for src/npc-creatures.js, as the
# skeletons are (data/skel.json): each its rig (names, parents, rest places and turns, bind matrices), its skin (points 16-bit over its box,
# colours from its materials, joints and weights, indices) and its clips (every bone's turn a quaternion at 24 a second, the bones that move).
# Polyfork models (owner, 3 Nov 2026): MERGE=1 PREFIX=1 CLIPS=Fly=Flying python3 tools/creatures-bake.py <dir> Rat=rat-base Wasp=common-wasp-12dab4
# Run: the .fbx files first to .glb with FBX2glTF, then  python3 tools/creatures-bake.py /path/to/glb Rat Frog Snake Spider Wasp Bat Slime
import sys, os, json, struct, base64, numpy as np
R=sys.argv[1]; KEYS=sys.argv[2:]
# Key=file bakes file.glb as Key; MERGE=1 keeps the file's other creatures; CLIPS=Fly=Flying,... renames clips, PREFIX=1 names them Key_Clip
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
OUTF=os.environ.get('OUT','data/creatures.json'); OUT=json.load(open(OUTF)) if os.environ.get('MERGE') else {}
CMAP=dict(x.split('=') for x in os.environ.get('CLIPS','').split(',') if x)
def colour(j,b,p,mat,n):
    f=np.clip(np.array(mat.get('pbrMetallicRoughness',{}).get('baseColorFactor',[1,1,1,1])[:3]),0,1)
    if 'COLOR_0' not in p['attributes']: return np.tile(f**(1/2.2)*255,(n,1))
    a=j['accessors'][p['attributes']['COLOR_0']]; c=acc(j,b,p['attributes']['COLOR_0']).astype(float)[:,:3]
    if a['componentType']!=5126: c=c/(255 if a['componentType']==5121 else 65535)
    return np.clip(c*f,0,1)**(1/2.2)*255
for key in KEYS:
    key,src=(key.split('=')+[key])[:2]
    j,b=glb(os.path.join(R,src+'.glb')); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}; G={}
    def glob_(i):
        if i in G: return G[i]
        M=trs(j['nodes'][i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    J=[]; [J.append(i) for sk in j['skins'] for i in sk['joints'] if i not in J]; JN=[clean(j['nodes'][i]['name']) for i in J]; JI={n:k for k,n in enumerate(JN)}   # (every skin's joints, one rig)
    # the rig in tree order (parents first), each joint's local place and turn (a joint whose parent is outside the rig keeps its world place)
    parent=[JI.get(clean(j['nodes'][par[i]]['name']),-1) if i in par else -1 for i in J]
    order=[]; seen=set()
    def walk(k):
        if k in seen: return
        if parent[k]>=0: walk(parent[k])
        seen.add(k); order.append(k)
    for k in range(len(J)): walk(k)
    remap={k:i for i,k in enumerate(order)}; names=[JN[k] for k in order]; par_=[remap[parent[k]] if parent[k]>=0 else -1 for k in order]
    L=[np.linalg.inv(glob_(J[parent[k]]))@glob_(J[k]) if parent[k]>=0 else glob_(J[k]) for k in order]
    # (a root joint keeps the armature's turn and size over it (the packs' armatures are turned a quarter and 100 times their rig), so the
    # points, the bind matrices and the bones agree; its clips' turns and moves, local to the armature, are set under it too: A below)
    A={k:glob_(par[J[k]]) for k in order if parent[k]<0 and J[k] in par}; qmul=lambda a,b:np.array([a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]])
    def m2q(Rm):
        tr=np.trace(Rm)
        if tr>0: S=np.sqrt(tr+1)*2; return np.array([(Rm[2,1]-Rm[1,2])/S,(Rm[0,2]-Rm[2,0])/S,(Rm[1,0]-Rm[0,1])/S,.25*S])
        i=int(np.argmax(np.diag(Rm))); jx,kx=(i+1)%3,(i+2)%3; S=np.sqrt(1+Rm[i,i]-Rm[jx,jx]-Rm[kx,kx])*2; qq=[0,0,0,0]; qq[i]=.25*S; qq[jx]=(Rm[jx,i]+Rm[i,jx])/S; qq[kx]=(Rm[kx,i]+Rm[i,kx])/S; qq[3]=(Rm[kx,jx]-Rm[jx,kx])/S; return np.array(qq)
    AQ={k:m2q(M[:3,:3]/np.linalg.norm(M[:3,:3],axis=0)) for k,M in A.items()}
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
    # the skin: every skinned mesh's points at rest in the world, its material's colour, joints (remapped) and weights
    P=[];C=[];RG=[];JJ=[];WW=[];IX=[]; parts=[]; base=0
    for n in j['nodes']:
        if 'mesh' not in n or 'skin' not in n: continue
        Jn=j['skins'][n['skin']]['joints']; ibm0=acc(j,b,j['skins'][n['skin']]['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
        JM=np.stack([glob_(Jn[k])@ibm0[k] for k in range(len(Jn))]); rm=np.array([remap[JI[clean(j['nodes'][Jn[k]]['name'])]] for k in range(len(Jn))])
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; mat=j['materials'][p['material']] if 'material' in p else {}; mn=mat.get('name') or n.get('name') or 'body'; pos=acc(j,b,A['POSITION']).astype(float); jn=acc(j,b,A['JOINTS_0']).astype(int); w=acc(j,b,A['WEIGHTS_0']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
            w=w/np.maximum(1e-9,w.sum(1,keepdims=True)); Ph=np.c_[pos,np.ones(len(pos))]; out=np.zeros((len(pos),3))
            for k in range(4): out+=w[:,k:k+1]*np.einsum('nij,nj->ni',JM[jn[:,k]][:,:3,:],Ph)
            bad=~np.isfinite(out).all(1); out[bad]=pos[bad]; w[bad]=[1,0,0,0]; jn[bad]=0   # (a corner no bone holds: left where it is, on the root)
            if mn not in parts: parts.append(mn)
            P.append(out); C.append(colour(j,b,p,mat,len(pos))); RG.append(np.full(len(pos),parts.index(mn))); JJ.append(rm[jn]); WW.append(w); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); RG=np.concatenate(RG); JJ=np.vstack(JJ); WW=np.vstack(WW); IX=np.concatenate(IX)
    # (corners shared by faces of one colour and one bone set made one: a flat-painted model comes with every face's own three)
    K=np.c_[np.round(P,5),C.round(),JJ,np.round(WW,3)]; _,first,inv=np.unique(K,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1)
    if len(first)<len(P): P,C,RG,JJ,WW,IX=P[first],C[first],RG[first],JJ[first],WW[first],inv[IX]
    # SIMP=0.5: the mesh made simpler (the budget: fewer, bigger faces), each kept corner taking the colour, part, bones and weights of the
    # nearest corner it came from
    SIMP=float(os.environ.get('SIMP',0))
    if SIMP>0:
        import fast_simplification as fs; from scipy.spatial import cKDTree
        P2,F2=fs.simplify(P.astype(np.float32),IX.reshape(-1,3).astype(np.int64),target_reduction=SIMP); near=cKDTree(P).query(P2)[1]
        C=C[near]; RG=RG[near]; JJ=JJ[near]; WW=WW[near]; P=P2.astype(float); IX=F2.reshape(-1).astype(int); print(' simplified to',len(P),'points',len(IX)//3,'tris')
    lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    mesh={'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.round().astype(np.uint8)),'r':b64(RG.astype(np.uint8)),'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':parts,'tris':len(IX)//3}
    # the clips, 24 a second: every bone's turn (quaternion, int16), the bones that move (float32), in the rig's order
    clips={}
    for a in j.get('animations',[]):
        nm=a['name'].split('|')[-1]; nm=CMAP.get(nm,nm).replace(' ','_'); nm=key+'_'+nm if os.environ.get('PREFIX') else nm; dur=max(float(acc(j,b,s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*24))+1); T=np.linspace(0,dur,nf)
        Q=np.tile(np.array(q,float),(nf,1,1)); TR={}
        for c in a['channels']:
            s=a['samplers'][c['sampler']]; node=j['nodes'][c['target']['node']]; bn=clean(node['name'])
            if bn not in JI: continue
            k=remap[JI[bn]]; tt=acc(j,b,s['input']).reshape(-1).astype(float); v=acc(j,b,s['output']).astype(float)
            if c['target']['path']=='rotation':
                if k in AQ: v=np.stack([qmul(AQ[k],x) for x in v])   # (a root's turn: under the armature's)
                for d in range(1,len(v)):
                    if np.dot(v[d],v[d-1])<0: v[d]=-v[d]
                qq=np.stack([np.interp(T,tt,v[:,i]) for i in range(4)],1); Q[:,k]=qq/np.linalg.norm(qq,axis=1,keepdims=True)
            elif c['target']['path']=='translation':
                if k in A: v=(A[k][:3,:3]@v.T).T+A[k][:3,3]   # (a root's move: under the armature)
                p=np.stack([np.interp(T,tt,v[:,i]) for i in range(3)],1)
                if np.ptp(p,axis=0).max()>1e-4: TR[names[k]]=b64(p.astype(np.float32))
        clips[nm]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
    OUT[key]={'rig':rig,'mesh':mesh,'clips':clips,'tall':float(np.round(hi[1]-lo[1],4)),'lo':np.round(lo,4).tolist(),'hi':np.round(hi,4).tolist()}
    print(key,len(P),'points',len(IX)//3,'tris',len(names),'bones; box',np.round(lo,2),np.round(hi,2),'clips',{k:(v['dur'],list(v['p'])) for k,v in clips.items()},'parts',parts)
open(OUTF,'w').write(json.dumps(OUT,separators=(',',':'))); print(OUTF,os.path.getsize(OUTF),'bytes')   # (OUT=data/x.json: another file, for another pack baked the same way: the UAL mannequin, data/ual.json)
