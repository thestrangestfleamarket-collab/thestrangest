# PROPS FROM THE OWNER'S PACKS (owner, 17 Oct 2026: "start importing google drive assets based on most recent and import into game"): still
# low-poly things (.glb with a palette texture, or .obj with a palette image) baked flat-coloured into data/props.json for park.js and
# dressing: each its faces (three corners each, flat), each corner's colour read from the pack's palette at its texture point (so the game
# needs no texture, as the rule is), its feet at 0, 1 tall, its own height in metres kept.
# Run: python3 tools/props-bake.py out.json key=path[:palette.jpg] ...   (an .fbx first to .glb with FBX2glTF)
# The packs (his Drive's G folder): Free Shrubs Flowers and Mushrooms 3D Low Poly Pack (bushes, flowers, grass, mushrooms, stones), pots & plants
# (five pots, four plants), LowPoly-Psionic (logs, fences, mushrooms, a jetty, a bridge).
import sys, os, json, struct, base64, io, numpy as np
from PIL import Image
out=sys.argv[1]; args=sys.argv[2:]
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; Rm=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=Rm*s; M[:3,3]=t; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def sample(img,uv):   # (the palette's colour under each texture point; v runs down from the top in glTF and in an image, up in an .obj)
    H,W=img.shape[:2]; u=np.clip((uv[:,0]%1)*W,0,W-1).astype(int); v=np.clip((uv[:,1]%1)*H,0,H-1).astype(int); return img[v,u,:3]
def from_glb(f,only=None):   # (only: one node's own mesh, in place)
    j,b=glb(f); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}; G={}
    def glob_(i):
        if i in G: return G[i]
        M=trs(j['nodes'][i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    imgs=[]
    for im in j.get('images',[]):   # (a picture in the file, or beside it, or a data uri)
        if 'bufferView' in im: bv=j['bufferViews'][im['bufferView']]; raw=b[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
        elif im['uri'].startswith('data:'): raw=base64.b64decode(im['uri'].split(',',1)[1])
        else: raw=open(os.path.join(os.path.dirname(f),im['uri']),'rb').read()
        imgs.append(np.array(Image.open(io.BytesIO(raw)).convert('RGB')))
    T=[]; C=[]
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n or only is not None and ni!=only: continue
        M=glob_(ni)
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; P=acc(j,b,A['POSITION']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int); mat=j['materials'][p['material']]; pbr=mat.get('pbrMetallicRoughness',{})
            fac=np.array(pbr.get('baseColorFactor',[1,1,1,1])[:3])
            if 'COLOR_0' in A:   # (per-vertex colours, linear in glTF: to sRGB, times the factor; normalized ints read as 0..1)
                a=j['accessors'][A['COLOR_0']]; v=acc(j,b,A['COLOR_0']).astype(float)[:,:3]; v=v/{5121:255,5123:65535}.get(a['componentType'],1)
                col=np.clip(v*fac,0,1)**(1/2.2)*255
            elif 'baseColorTexture' in pbr and 'TEXCOORD_0' in A: col=sample(imgs[j['textures'][pbr['baseColorTexture']['index']]['source']],acc(j,b,A['TEXCOORD_0']).astype(float))*fac
            else: col=np.tile(np.clip(fac,0,1)**(1/2.2)*255,(len(P),1))
            W=(M[:3,:3]@P.T).T+M[:3,3]; T.append(W[idx].reshape(-1,3,3)); C.append(col[idx].reshape(-1,3,3))
    return np.vstack(T),np.vstack(C)
def from_obj(f,pal):   # (a palette image given: the colour at each texture point; else the .mtl's own colour (Kd) for each material)
    img=np.array(Image.open(pal).convert('RGB')) if pal else None; V=[]; VT=[]; T=[]; C=[]; KD={}; cur=None
    for line in open(f):
        w=line.split()
        if not w: continue
        if w[0]=='mtllib' and not pal:
            m=None
            for l in open(os.path.join(os.path.dirname(f),' '.join(w[1:]))):
                q=l.split()
                if q and q[0]=='newmtl': m=q[1]
                elif q and q[0]=='Kd' and m: KD[m]=np.clip(np.array([float(x) for x in q[1:4]]),0,1)**(1/2.2)*255
        elif w[0]=='usemtl': cur=w[1]
        elif w[0]=='v': V.append([float(x) for x in w[1:4]])
        elif w[0]=='vt': VT.append([float(w[1]),1-float(w[2])])
        elif w[0]=='f':
            vs=[(int(a.split('/')[0])-1,int(a.split('/')[1])-1 if len(a.split('/'))>1 and a.split('/')[1] else None) for a in w[1:]]
            for k in range(1,len(vs)-1):
                tri=[vs[0],vs[k],vs[k+1]]; T.append([V[i] for i,_ in tri]); C.append([sample(img,np.array([VT[t]]))[0] if (img is not None and t is not None) else KD.get(cur,[128,128,128]) for _,t in tri])
    return np.array(T,float),np.array(C,float)
OUT=json.load(open(out)) if os.path.exists(out) else {}
for a in args:
    key,path=a.split('=',1); pal=None
    if ':' in path: path,pal=path.rsplit(':',1)
    T,C=from_obj(path,pal) if path.endswith('.obj') else from_glb(path)
    lo=T.reshape(-1,3).min(0); hi=T.reshape(-1,3).max(0); h=max(1e-6,hi[1]-lo[1]); T=(T-[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2])/h
    low=T[(T[:,:,1].max(1)<.1)]; foot=float(np.round(max(1e-3,np.ptp(low.reshape(-1,3)[:,[0,2]],axis=0).max()) if len(low) else .05,4))
    OUT[key]={'p':b64(T.reshape(-1).astype(np.float32)),'c':b64(np.clip(C,0,255).round().astype(np.uint8)),'k':b64(np.zeros(len(T),np.uint8)),'tris':len(T),'metres':float(np.round(h,3)),'wide':float(np.round(max(hi[0]-lo[0],hi[2]-lo[2])/h,4)),'trunk':foot}
    print(key,len(T),'tris',round(h,2),'m, wide',OUT[key]['wide'],'foot',foot)
open(out,'w').write(json.dumps(OUT,separators=(',',':'))); print(out,os.path.getsize(out),'bytes')
