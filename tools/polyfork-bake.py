# THE POLYFORK MODELS (owner, 3 Nov 2026, his Drive glb folder: "replace current things in game first with these better versions"): one
# Polyfork .glb (flat colours in COLOR_0, Y up, nose toward +Z) read at rest and packed into the format of the data file it replaces.
#   fish  <glb> <key>  data/fish.json: a flat soup, nose on +X, unit length (src/141f-fishes.js swims it)
#   kit   <glb> <key>  data/kit.json: int16 over its box, colours, indices (src/068-kit.js)
# Run: python3 tools/polyfork-bake.py fish ~/dl/yellow-tang-base.glb yellowtang [TRIS=600]
import sys, os, json, struct, base64, numpy as np
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    M=np.eye(4)
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    x,y,z,w=n.get('rotation',[0,0,0,1]); R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M[:3,:3]=R*np.array(n.get('scale',[1,1,1])); M[:3,3]=n.get('translation',[0,0,0]); return M
def load(f):
    """every mesh at rest in the scene: points, sRGB colours 0-255, triangles"""
    j,b=glb(f); P=[];C=[];F=[]; base=0
    def walk(i,M):
        nonlocal base; n=j['nodes'][i]; M=M@trs(n)
        if 'mesh' in n:
            Mm=np.eye(4) if 'skin' in n else M   # (a skinned mesh's points are already where its bones put them at rest)
            for p in j['meshes'][n['mesh']]['primitives']:
                A=p['attributes']; pos=acc(j,b,A['POSITION']).astype(float); mat=j['materials'][p['material']] if 'material' in p else {}
                f=np.clip(np.array(mat.get('pbrMetallicRoughness',{}).get('baseColorFactor',[1,1,1,1])[:3]),0,1)
                if 'COLOR_0' in A:
                    a=j['accessors'][A['COLOR_0']]; c=acc(j,b,A['COLOR_0']).astype(float)[:,:3]
                    if a['componentType']!=5126: c=c/(255 if a['componentType']==5121 else 65535)
                else: c=np.ones((len(pos),3))
                idx=acc(j,b,p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
                P.append((np.c_[pos,np.ones(len(pos))]@Mm.T)[:,:3]); C.append(np.clip(c*f,0,1)**(1/2.2)*255); F.append(idx.reshape(-1,3)+base); base+=len(pos)
        for c in n.get('children',[]): walk(c,M)
    for r in j['scenes'][j.get('scene',0)]['nodes']: walk(r,np.eye(4))
    return np.vstack(P),np.vstack(C),np.vstack(F)
def weld(P,C,F):
    K=np.c_[np.round(P,5),np.round(C)]; _,first,inv=np.unique(K,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1); return P[first],C[first],inv[F]
def simplify(P,C,F,target):
    if len(F)<=target: return P,C,F
    import fast_simplification as fs
    # (the shape decimated on welded points, each kept triangle then painted the colour of the source face under its centre)
    key=np.round(P/(np.ptp(P,0).max()*2e-4)).astype(np.int64); _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1)
    Fw=inv[F]; ok=(Fw[:,0]!=Fw[:,1])&(Fw[:,1]!=Fw[:,2])&(Fw[:,0]!=Fw[:,2])
    p2,f2=fs.simplify(P[first].astype(np.float32),Fw[ok].astype(np.int32),target_reduction=1-target/ok.sum())
    from scipy.spatial import cKDTree
    fc=cKDTree(P[F].mean(1)).query(p2[f2].mean(1))[1]; col=C[F[fc,0]]
    return p2[f2].reshape(-1,3).astype(float),np.repeat(col,3,0),np.arange(len(f2)*3).reshape(-1,3)
mode,f,key=sys.argv[1:4]; TRIS=int(os.environ.get('TRIS',0))
P,C,F=load(f)
if mode=='fish':
    P=np.stack([P[:,2],P[:,1],-P[:,0]],1)   # nose from +Z onto +X, Y up
    if TRIS: P,C,F=simplify(P,C,F,TRIS)
    lo=P.min(0); hi=P.max(0); L=hi[0]-lo[0]; Q=((P-(lo+hi)/2)/L).astype(np.float32)
    rec={'p':b64(Q[F].reshape(-1)),'c':b64(np.clip(C[F].reshape(-1,3).round(),0,255).astype(np.uint8)),'tris':len(F),'len':float(round(L,4)),'tall':float(round(hi[1]-lo[1],4)),'wide':float(round(hi[2]-lo[2],4))}
    out='data/fish.json'
elif mode=='kit':
    if TRIS: P,C,F=simplify(P,C,F,TRIS)
    P,C,F=weld(P,C,F); lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    I=F.reshape(-1); big=len(P)>65535
    rec={'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.round().astype(np.uint8)),'i':b64(I.astype(np.uint32 if big else np.uint16)),'i32':int(big),'tris':len(F),'size':np.round(hi-lo,4).tolist()}
    out='data/kit.json'
else: sys.exit('mode: fish | kit')
out=os.environ.get('OUT',out); D=json.load(open(out)); D[key]=rec; open(out,'w').write(json.dumps(D,separators=(',',':')))
print(key,'->',out,rec['tris'],'tris',os.path.getsize(out),'bytes')
