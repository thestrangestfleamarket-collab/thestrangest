# THE SIX FIGURES (owner, 17 Oct 2026, "lets only do the new characters": the six low-poly figures in his Drive's G folder, KASA, GEKKOU,
# DRIZZEL, KURENAI, SAMIDALE and SHOGUN, each a .zip with a .blend and a .fbx, rigged on a Mixamo skeleton, no clips, no textures: flat
# material colours), baked into data/figures.json for src/npc-figures.js.
# Run: the .fbx files first to .glb with FBX2glTF (npm's fbx2gltf: FBX2glTF --binary --input X.fbx --output glb/X.glb), then
#   python3 tools/figures-bake.py /path/to/glb
# Each figure keeps its bones (Mixamo's, in their rest pose) and weights, so src/npc-figures.js can pose them (it makes the moves itself: the
# packs have none). Written as the skeletons are (data/skel.json): points 16-bit over the figure's box, colours, each point's part, joints and
# weights, indices; plus the rig (names, parents, rest translations and turns, bind matrices). Dropped: the packs' UI rings and info circles,
# their holograms and their modelled smoke (the game makes its own smoke). Set right: the things the packs hang off the rig's root (a katana,
# a stick, a pipe) go on the hand that holds them, and the sheathed katanas (GEKKOU, SHOGUN: left at the feet by the export) on the left hip.
import sys, os, json, struct, base64, numpy as np
R=sys.argv[1]
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def quat2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def m2quat(M):   # (a rotation matrix to x,y,z,w)
    t=np.trace(M)
    if t>0: s=np.sqrt(t+1)*2; return np.array([(M[2,1]-M[1,2])/s,(M[0,2]-M[2,0])/s,(M[1,0]-M[0,1])/s,.25*s])
    i=np.argmax(np.diag(M)); jx,kx=(i+1)%3,(i+2)%3; s=np.sqrt(1+M[i,i]-M[jx,jx]-M[kx,kx])*2; q=np.zeros(4); q[i]=.25*s; q[jx]=(M[jx,i]+M[i,jx])/s; q[kx]=(M[kx,i]+M[i,kx])/s; q[3]=(M[kx,jx]-M[jx,kx])/s; return q
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    M=np.eye(4); M[:3,:3]=quat2m(q)*s; M[:3,3]=t; return M
def rotx(a): c,s=np.cos(a),np.sin(a); M=np.eye(4); M[1,1]=c; M[1,2]=-s; M[2,1]=s; M[2,2]=c; return M
def roty(a): c,s=np.cos(a),np.sin(a); M=np.eye(4); M[0,0]=c; M[0,2]=s; M[2,0]=-s; M[2,2]=c; return M
def rotz(a): c,s=np.cos(a),np.sin(a); M=np.eye(4); M[0,0]=c; M[0,1]=-s; M[1,0]=s; M[1,1]=c; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
lin2srgb=lambda c:np.round(np.clip(c,0,1)**(1/2.2)*255).astype(np.uint8)
clean=lambda n:n.replace('mixamorig:','').replace('.','_')
DROP_NODE=('UI_','Info_circle','Smoke_Geo','fake_smoke','Fake_Smoke'); DROP_MAT=('holo','smoke'); DROP_PRIM={'DRIZZLE_Geo:Material.001'}   # (DRIZZLE's pane before his face: a hologram's glass)
# where the packs' loose things go: (bone, new parent, or None to keep its place; a placing: a step from the parent and turns, in the world's axes)
HOLD={'KASA':[('Katana','LeftHand',None)],'DRIZZEL':[('Stick','RightHand',None)],'SAMIDALE':[('Pipe','LeftHand',None)],
      'GEKKOU':[('Katana','Hips',([.14,-.04,-.04],[62,0,-10]))],'SHOGUN':[('Katana','Hips',([.14,-.04,-.04],[62,0,-10]))]}
# the packs' plain grey where a colour was lost in the export (sRGB bytes); 'glow' faces are the figure's glowing part, coloured in the game
FIX={'flappy':(214,40,52),'grad':(150,160,176),'Material.001':(190,230,240),'light':(255,255,255),'cloth':(236,232,222)}
OUT={}
for key in ['KASA','GEKKOU','DRIZZEL','KURENAI','SAMIDALE','SHOGUN']:
    j,b=glb(os.path.join(R,key+'.glb')); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
    G={}
    def glob_(i):
        if i in G: return G[i]
        M=trs(j['nodes'][i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    sk=j['skins'][0]; J=list(sk['joints']); JN=[clean(j['nodes'][i]['name']) for i in J]; JI={n:k for k,n in enumerate(JN)}; IBM0=acc(j,b,sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    for s in j['skins']: assert [clean(j['nodes'][i]['name']) for i in s['joints']]==JN, key   # (one rig, every mesh)
    # the rig's tree, by name; a bone's parent outside the rig (the rig's root, the file's root) is none
    parent=[JI.get(clean(j['nodes'][par[i]]['name']),-1) if i in par else -1 for i in J]
    Gf=[glob_(i).copy() for i in J]   # (each joint's place in the world at rest; changed below for the held things)
    for bone,newp,place in HOLD.get(key,[]):
        bi,pi=JI[bone],JI[newp]; parent[bi]=pi
        if place: t,(ax,ay,az)=place; c=Gf[pi][:3,3]+t; M=np.array([[1,0,0,c[0]],[0,1,0,c[1]],[0,0,1,c[2]],[0,0,0,1]],float)@rotx(np.radians(ax))@roty(np.radians(ay))@rotz(np.radians(az)); Gf[bi]=M   # (in the world's axes, beside the parent)
    # any other bone still at the root (not the hips) hangs off the hips, where it is
    for k in range(len(J)):
        if parent[k]<0 and JN[k]!='Hips': parent[k]=JI['Hips']; print(key,'bone at the root, put under the hips:',JN[k])
    # globals again, down the tree, from the (possibly new) locals: a moved bone's children keep their own locals under it
    order=[]; seen=set()
    def walk(k):
        if k in seen: return
        if parent[k]>=0: walk(parent[k])
        seen.add(k); order.append(k)
    for k in range(len(J)): walk(k)
    L=[None]*len(J); Gn=[None]*len(J)
    for k in order:
        p=parent[k]
        if p<0: L[k]=Gf[k]; Gn[k]=Gf[k]
        else:
            moved=any(JN[k]==h[0] for h in HOLD.get(key,[])) or (k in [JI[h[0]] for h in HOLD.get(key,[])])
            L[k]=np.linalg.inv(Gn[p])@Gf[k] if (moved or parent[k]!=(JI.get(clean(j['nodes'][par[J[k]]]['name']),-1) if J[k] in par else -1)) else np.linalg.inv(glob_(J[p]))@glob_(J[k])
            Gn[k]=Gn[p]@L[k]
    # (a moved bone's children: their old locals under its new place)
    for k in order:
        p=parent[k]
        if p>=0 and not np.allclose(Gn[k],Gf[k],atol=1e-6): Gf[k]=Gn[k]
    # the rig as the game reads it: in tree order, Hips first
    ordr=order; remap={k:i for i,k in enumerate(ordr)}
    names=[JN[k] for k in ordr]; par_=[remap[parent[k]] if parent[k]>=0 else -1 for k in ordr]
    t=[]; q=[]
    for k in ordr:
        M=L[k]; s=np.linalg.norm(M[:3,:3],axis=0); Rm=M[:3,:3]/s; t.append(np.round(M[:3,3],5).tolist()); q.append(np.round(m2quat(Rm),6).tolist())
        if not np.allclose(s,1,atol=1e-3): print(key,'bone scaled',JN[k],s)
    Gfin=np.stack([Gn[k] for k in ordr]); ibm=np.linalg.inv(Gfin)
    rig={'names':names,'parent':par_,'t':t,'q':q,'ibm':b64(ibm.transpose(0,2,1).astype(np.float32))}   # (column-major, as THREE.Matrix4.fromArray reads)
    # the skin: every kept mesh's points, moved to where its bones hold them at rest; its part (node:material), its colour (the material's)
    P=[];C=[];RG=[];JJ=[];WW=[];IX=[]; parts=[]; base=0; glow=-1
    for n in j['nodes']:
        if 'mesh' not in n or any(n['name'].startswith(d) for d in DROP_NODE): continue
        Jn=j['skins'][n['skin']]['joints']; ibm0=acc(j,b,j['skins'][n['skin']]['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
        JM=np.stack([Gn[JI[clean(j['nodes'][Jn[k]]['name'])]]@ibm0[k] for k in range(len(Jn))])
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; mat=j['materials'][p['material']]; mn=mat['name']
            if mn in DROP_MAT or n['name']+':'+mn in DROP_PRIM: continue
            pos=acc(j,b,A['POSITION']).astype(float); jn=acc(j,b,A['JOINTS_0']).astype(int); w=acc(j,b,A['WEIGHTS_0']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int)
            w=w/np.maximum(1e-9,w.sum(1,keepdims=True)); Ph=np.c_[pos,np.ones(len(pos))]; out=np.zeros((len(pos),3))
            for k in range(4): out+=w[:,k:k+1]*np.einsum('nij,nj->ni',JM[jn[:,k]][:,:3,:],Ph)
            if not np.isfinite(out).all(): print(key,'skipped (no weights)',n['name'],mn); continue
            isglow=mn.startswith('glow'); part=n['name'].replace('_Geo','')+':'+mn.split('.')[0]
            if isglow: part='glow'
            if part not in parts: parts.append(part)
            if isglow: glow=parts.index(part)
            col=np.array(FIX.get(mn.split('.')[0],lin2srgb(np.array(mat['pbrMetallicRoughness']['baseColorFactor'][:3]))),np.uint8)
            jj=np.vectorize(lambda a:remap[JI[clean(j['nodes'][Jn[a]]['name'])]])(jn)
            P.append(out); C.append(np.tile(col,(len(pos),1))); RG.append(np.full(len(pos),parts.index(part))); JJ.append(jj); WW.append(w); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); RG=np.concatenate(RG); JJ=np.vstack(JJ); WW=np.vstack(WW); IX=np.concatenate(IX)
    lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    OUT[key]={'rig':rig,'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C),'r':b64(RG.astype(np.uint8)),
      'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':parts,'eye':glow,'tall':float(np.round(hi[1]-lo[1],4)),'tris':len(IX)//3}
    print(key,len(P),'points',len(IX)//3,'tris',len(names),'bones; box',np.round(lo,2),np.round(hi,2),'parts',parts)
open('data/figures.json','w').write(json.dumps(OUT,separators=(',',':'))); print('data/figures.json',os.path.getsize('data/figures.json'),'bytes')
