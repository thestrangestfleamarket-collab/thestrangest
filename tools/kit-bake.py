# THE KITS (owner, 17 Oct 2026, the G folder: a city street kit, a restaurant kit, the Dragon, all textured low-poly .glb/.gltf): each piece's
# points, its colours from its own texture at each point (nearest texel), its triangles, packed small (int16 over its box) as the skeletons are
# (tools/skeletons-bake.py), into data/kit.json: {name:{n,lo,sc,p,c,i,tris,size}}. The Dragon (rigged, with the pack's clips: Idle_loop,
# Walk_menacing_loop, Flying_loop, Attack, GroundToFly) into data/dragon.json as the skeletons' format (rig, clips, chars.Dragon).
# Run: python3 tools/kit-bake.py <folder of the files>
import sys, os, json, struct, base64, io, numpy as np
from PIL import Image
R=sys.argv[1]
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,[d[28+ln:28+ln+bl]]
def gltf(f):
    j=json.load(open(f)); return j,[open(os.path.join(os.path.dirname(f),b['uri']),'rb').read() for b in j['buffers']]
def load(f): return glb(f) if f.endswith('.glb') else gltf(f)
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,bufs,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride'); b=bufs[bv['buffer']]
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; Rm=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=Rm*s; M[:3,3]=t; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def image(j,bufs,f,k):   # the k-th image: embedded in the glb, or a file beside the gltf
    im=j['images'][k]
    if 'uri' in im: return np.array(Image.open(os.path.join(os.path.dirname(f),im['uri'])).convert('RGB'))
    bv=j['bufferViews'][im['bufferView']]; return np.array(Image.open(io.BytesIO(bufs[bv['buffer']][bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGB'))
def texOf(j,bufs,f,mi,cache):
    m=j['materials'][mi]; pbr=m.get('pbrMetallicRoughness',{}); t=pbr.get('baseColorTexture')
    if t is None: return None,np.array(pbr.get('baseColorFactor',[.8,.8,.8,1])[:3])*255
    src=j['textures'][t['index']]['source']
    if src not in cache: cache[src]=image(j,bufs,f,src)
    return cache[src],None
def colours(TEX,uv):
    u=np.clip((uv[:,0]%1)*TEX.shape[1],0,TEX.shape[1]-1).astype(int); v=np.clip((uv[:,1]%1)*TEX.shape[0],0,TEX.shape[0]-1).astype(int); return TEX[v,u]
# the world transform of every node (the scene's roots down)
def worlds(j):
    W={}; par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
    def w(i):
        if i in W: return W[i]
        M=trs(j['nodes'][i]); W[i]=(w(par[i])@M) if i in par else M; return W[i]
    for i in range(len(j['nodes'])): w(i)
    return W
def piece(f):
    j,bufs=load(f); W=worlds(j); cache={}; P=[];C=[];IX=[]; base=0
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        M=W[ni]
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; pos=acc(j,bufs,A['POSITION']).astype(float); pos=(M[:3,:3]@pos.T).T+M[:3,3]
            idx=acc(j,bufs,p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
            TEX,flat=texOf(j,bufs,f,p['material'],cache) if 'material' in p else (None,np.array([200,200,200.]))
            c=colours(TEX,acc(j,bufs,A['TEXCOORD_0'])) if TEX is not None and 'TEXCOORD_0' in A else np.tile(flat,(len(pos),1))
            P.append(pos); C.append(c); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); IX=np.concatenate(IX); lo=P.min(0); hi=P.max(0); sc=max((hi-lo).max(),1e-6)/65000
    return {'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.astype(np.uint8)),'i':b64(IX.astype(np.uint16 if len(P)<65535 else np.uint32)),'i32':len(P)>=65535,'tris':len(IX)//3,'size':np.round(hi-lo,4).tolist()}
KIT={}
for fn in sorted(os.listdir(R)):
    if not (fn.endswith('.glb') or fn.endswith('.gltf')) or fn.startswith('Dragon'): continue
    key=fn.rsplit('.',1)[0].replace('Meshy_AI_3D_model_of_a_1980s_c_1017024959_texture','eighties')
    try: KIT[key]=piece(os.path.join(R,fn)); print(key,KIT[key]['tris'],KIT[key]['size'])
    except Exception as e: print('SKIP',fn,e)
os.makedirs('data',exist_ok=True); s=json.dumps(KIT,separators=(',',':')); open('data/kit.json','w').write(s); print('data/kit.json',len(s))
# ---- THE DRAGON: its rig, its skin with weights, its clips (as the skeletons' format, one character)
f=os.path.join(R,'Dragon2.glb'); j,bufs=glb(f); SK=j['skins'][0]; J=SK['joints']; JN=[j['nodes'][i]['name'].replace('.','_') for i in J]; JI={n:k for k,n in enumerate(JN)}
par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
rig={'names':JN,'parent':[JI.get(j['nodes'][par[i]]['name'].replace('.','_'),-1) if i in par else -1 for i in J],
  't':[np.round(j['nodes'][i].get('translation',[0,0,0]),5).tolist() for i in J],'q':[np.round(j['nodes'][i].get('rotation',[0,0,0,1]),5).tolist() for i in J],'s':[np.round(j['nodes'][i].get('scale',[1,1,1]),5).tolist() for i in J]}
IBM=acc(j,bufs,SK['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1); rig['ibm']=b64(IBM.transpose(0,2,1).astype(np.float32))
cache={}; P=[];C=[];JJ=[];WW=[];IX=[]; base=0; W=worlds(j)
for ni,n in enumerate(j['nodes']):
    if 'mesh' not in n: continue
    for p in j['meshes'][n['mesh']]['primitives']:
        A=p['attributes']; pos=acc(j,bufs,A['POSITION']).astype(float); idx=acc(j,bufs,p['indices']).reshape(-1).astype(int)
        TEX,flat=texOf(j,bufs,f,p['material'],cache); c=colours(TEX,acc(j,bufs,A['TEXCOORD_0'])) if TEX is not None else np.tile(flat,(len(pos),1))
        if 'skin' in n: jn=acc(j,bufs,A['JOINTS_0']).astype(int); w=acc(j,bufs,A['WEIGHTS_0']).astype(float)
        else: jn=np.zeros((len(pos),4),int); w=np.zeros((len(pos),4)); w[:,0]=1
        P.append(pos); C.append(c); JJ.append(jn); WW.append(w); IX.append(idx+base); base+=len(pos)
P=np.vstack(P); C=np.vstack(C); JJ=np.vstack(JJ); WW=np.vstack(WW); IX=np.concatenate(IX); lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
# his rest pose, the bones' world matrices against the bind: to say how tall he stands (the skin is in bind space = rest here)
char={'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.astype(np.uint8)),'r':b64(np.zeros(len(P),np.uint8)),
  'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':['dragon'],'eye':-1,'tall':float(np.round(hi[1]-lo[1],4)),'low':float(lo[1]),'tris':len(IX)//3,'size':np.round(hi-lo,4).tolist()}
clips={}
for a in j['animations']:
    dur=max(float(acc(j,bufs,s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*24))+1); T=np.linspace(0,dur,nf)
    Q=np.tile(np.array(rig['q'],float),(nf,1,1)); TR={}
    for c,s in zip(a['channels'],[a['samplers'][c['sampler']] for c in a['channels']]):
        bn=j['nodes'][c['target']['node']]['name'].replace('.','_')
        if bn not in JI: continue
        k=JI[bn]; t=acc(j,bufs,s['input']).reshape(-1).astype(float); v=acc(j,bufs,s['output']).astype(float)
        if c['target']['path']=='rotation':
            for d in range(1,len(v)):
                if np.dot(v[d],v[d-1])<0: v[d]=-v[d]
            q=np.stack([np.interp(T,t,v[:,i]) for i in range(4)],1); Q[:,k]=q/np.linalg.norm(q,axis=1,keepdims=True)
        elif c['target']['path']=='translation':
            p=np.stack([np.interp(T,t,v[:,i]) for i in range(3)],1)
            if np.ptp(p,axis=0).max()>1e-4: TR[bn]=b64(p.astype(np.float32))
    clips[a['name']]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
D={'rig':rig,'clips':clips,'chars':{'Dragon':char}}; s=json.dumps(D,separators=(',',':')); open('data/dragon.json','w').write(s)
print('data/dragon.json',len(s),'bones',len(JN),'tris',char['tris'],'tall',char['tall'],'size',char['size'],{k:(v['dur'],list(v['p'])) for k,v in clips.items()})
