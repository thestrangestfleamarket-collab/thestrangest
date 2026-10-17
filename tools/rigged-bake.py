# A RIGGED CHARACTER WITHOUT CLIPS (owner, 17 Oct 2026: the six FBX figures in his G folder, Mixamo-rigged, flat-coloured; made .glb by fbx2gltf first:
# FBX2glTF -b -i X.fbx -o X.glb): his bones (every skin's joints as one rig), each mesh's points in bind space with its joints and weights, coloured
# by its material (flat colours, or a texture where there is one), into data/<name>.json in the skeletons' format (rig + chars[name]), no clips:
# the game moves him by his bones' names (src/npc-rigged.js). Run: python3 tools/rigged-bake.py <name> <file.glb> [more name file ...]
import sys, os, json, struct, base64, io, numpy as np
from PIL import Image
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,[d[28+ln:28+ln+bl]]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,bufs,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride'); b=bufs[bv['buffer']]
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def image(j,bufs,k):
    im=j['images'][k]; bv=j['bufferViews'][im['bufferView']]; return np.array(Image.open(io.BytesIO(bufs[bv['buffer']][bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGB'))
def bake(name,f):
    j,bufs=glb(f); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
    # the rig: every skin's joints, once each, in tree order (a parent before its children)
    J=[]; seen=set()
    for s in j['skins']:
        for i in s['joints']:
            if i not in seen: seen.add(i); J.append(i)
    order=[]; 
    def walk(i):
        if i in seen and i not in order: order.append(i)
        for c in j['nodes'][i].get('children',[]): walk(c)
    for r in j['scenes'][0]['nodes']: walk(r)
    J=order+[i for i in J if i not in order]; JI={i:k for k,i in enumerate(J)}; nm=lambda i:j['nodes'][i]['name'].replace('.','_').replace(':','_')
    IBM={}; SKT={}   # (a joint's bind matrix, the first skin's; and each skin's T: its bind frame against the first's, one matrix a skin)
    for si,s in enumerate(j['skins']):
        M=acc(j,bufs,s['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1); T=None
        for k,i in enumerate(s['joints']):
            if i in IBM:
                if T is None: T=np.linalg.inv(IBM[i])@M[k]
            else: IBM[i]=M[k] if T is None else M[k]@np.linalg.inv(T)
        SKT[si]=np.eye(4) if T is None else T
    def trs(n):
        if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
        t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); sc=np.array(n.get('scale',[1,1,1]),float)
        x,y,z,w=q; R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]); M=np.eye(4); M[:3,:3]=R*sc; M[:3,3]=t; return M
    def local(i):   # a joint's local matrix; a root joint's with its ancestors' (the armature's node, the file's root) folded in
        M=trs(j['nodes'][i]); p=par.get(i)
        while p is not None and p not in JI: M=trs(j['nodes'][p])@M; p=par.get(p)
        return M
    def tqs(M):
        sc=np.linalg.norm(M[:3,:3],axis=0); R=M[:3,:3]/sc; tr=np.trace(R)
        if tr>0: S=np.sqrt(tr+1)*2; w=S/4; x=(R[2,1]-R[1,2])/S; y=(R[0,2]-R[2,0])/S; z=(R[1,0]-R[0,1])/S
        elif R[0,0]>R[1,1] and R[0,0]>R[2,2]: S=np.sqrt(1+R[0,0]-R[1,1]-R[2,2])*2; w=(R[2,1]-R[1,2])/S; x=S/4; y=(R[0,1]+R[1,0])/S; z=(R[0,2]+R[2,0])/S
        elif R[1,1]>R[2,2]: S=np.sqrt(1+R[1,1]-R[0,0]-R[2,2])*2; w=(R[0,2]-R[2,0])/S; x=(R[0,1]+R[1,0])/S; y=S/4; z=(R[1,2]+R[2,1])/S
        else: S=np.sqrt(1+R[2,2]-R[0,0]-R[1,1])*2; w=(R[1,0]-R[0,1])/S; x=(R[0,2]+R[2,0])/S; y=(R[1,2]+R[2,1])/S; z=S/4
        return np.round(M[:3,3],5).tolist(),np.round([x,y,z,w],5).tolist(),np.round(sc,5).tolist()
    L=[tqs(local(i)) for i in J]
    rig={'names':[nm(i) for i in J],'parent':[JI.get(par[i],-1) if i in par else -1 for i in J],'t':[l[0] for l in L],'q':[l[1] for l in L],'s':[l[2] for l in L]}
    WJ={}
    def world(k):
        if k in WJ: return WJ[k]
        p=rig['parent'][k]; WJ[k]=(world(p)@local(J[k])) if p>=0 else local(J[k]); return WJ[k]
    rig['ibm']=b64(np.stack([IBM[i] for i in J]).transpose(0,2,1).astype(np.float32))
    P=[];C=[];RG=[];JJ=[];WW=[];IX=[]; parts=[]; base=0; cache={}
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n or 'skin' not in n: continue   # (an unskinned mesh, a smoke or a holo ring: an effect, left out)
        sk=j['skins'][n['skin']]; remap=np.array([JI[i] for i in sk['joints']]); T=SKT[n['skin']]
        if any(k in n['name'].lower() for k in ('smoke','holo','circle','ui_','info')): continue   # (an effect: smoke, a holo ring, a UI circle)
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; pos=acc(j,bufs,A['POSITION']).astype(float); pos=pos@T[:3,:3].T+T[:3,3]; idx=acc(j,bufs,p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
            m=j['materials'][p['material']] if 'material' in p else {}; pbr=m.get('pbrMetallicRoughness',{}); t=pbr.get('baseColorTexture')
            if t is not None:
                src=j['textures'][t['index']]['source']; TEX=cache.setdefault(src,image(j,bufs,src)); uv=acc(j,bufs,A['TEXCOORD_0'])
                u=np.clip((uv[:,0]%1)*TEX.shape[1],0,TEX.shape[1]-1).astype(int); v=np.clip((uv[:,1]%1)*TEX.shape[0],0,TEX.shape[0]-1).astype(int); c=TEX[v,u]
            else: fc=np.array(pbr.get('baseColorFactor',[.8,.8,.8,1])[:3]); c=np.tile((fc**(1/2.2)*255),(len(pos),1))   # (the factor is linear: to sRGB, as the colours ride)
            if sk is not None: jn=remap[acc(j,bufs,A['JOINTS_0']).astype(int)]; w=acc(j,bufs,A['WEIGHTS_0']).astype(float)
            else: jn=np.zeros((len(pos),4),int); w=np.zeros((len(pos),4)); w[:,0]=1
            parts.append(n['name']+'/'+m.get('name','')); P.append(pos); C.append(c); RG.append(np.full(len(pos),len(parts)-1)); JJ.append(jn); WW.append(w); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); RG=np.concatenate(RG); JJ=np.vstack(JJ); WW=np.nan_to_num(np.vstack(WW)); IX=np.concatenate(IX); lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    # how he stands: every point where his bones hold it at rest (the bones' world matrices against their bind matrices), for his height
    SK=np.stack([world(k)@IBM[J[k]] for k in range(len(J))]); R=np.zeros_like(P)
    for c in range(4): M=SK[JJ[:,c]]; R+=WW[:,c:c+1]*(np.einsum('nij,nj->ni',M[:,:3,:3],P)+M[:,:3,3])
    keep=WW.sum(1)>.01; body=rlo_body=None
    for k,pn in enumerate(parts):
        m=RG==k
        if not m.any(): continue
        rt=lambda k:k if rig['parent'][k]<0 else rt(rig['parent'][k]); roots=set(rt(k) for k in np.unique(JJ[m][WW[m]>0]))
        if (R[m,1].min()<-.3 or 0 not in roots) and R[m,1].max()<.6: keep&=~m; print('  left out (a prop resting at his feet, no hand to hang from)',pn)
    keep=keep&(RG>=0); km=np.zeros(len(P),int)-1; km[keep]=np.arange(keep.sum()); tri=IX.reshape(-1,3); tri=tri[keep[tri].all(1)]; IX=km[tri].reshape(-1)
    P=P[keep]; C=C[keep]; RG=RG[keep]; JJ=JJ[keep]; WW=WW[keep]; R=R[keep]; lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    # his points kept where the rest pose puts them, the bind matrices the rest pose's inverses: a SkinnedMesh bound without a bind matrix
    # (makeNPC's way) recomputes its inverses from the bones' rest, so the data has to be in that frame already (the file's own bind space
    # is the mesh's, a hundredth the size: it drew nothing)
    P=R; lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000; rig['ibm']=b64(np.stack([np.linalg.inv(world(k)) for k in range(len(J))]).transpose(0,2,1).astype(np.float32))
    rlo=R.min(0); rhi=R.max(0)
    glow=[k for k,pn in enumerate(parts) if 'glow' in pn.lower()]
    char={'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.clip(0,255).astype(np.uint8)),'r':b64(RG.astype(np.uint8)),
      'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16 if len(P)<65535 else np.uint32)),'i32':len(P)>=65535,'parts':parts,'eye':glow[0] if glow else -1,'tall':float(np.round(rhi[1]-rlo[1],4)),'low':float(np.round(rlo[1],4)),'tris':len(IX)//3,'size':np.round(rhi-rlo,4).tolist()}
    D={'rig':rig,'clips':{},'chars':{name:char}}; s=json.dumps(D,separators=(',',':')); os.makedirs('data',exist_ok=True); open('data/'+name+'.json','w').write(s)
    print(name,len(s),'bytes; bones',len(J),'tris',char['tris'],'tall',char['tall'],'size',char['size'],'parts',parts,'glow',glow)
a=sys.argv[1:]
for k in range(0,len(a),2): bake(a[k],a[k+1])
