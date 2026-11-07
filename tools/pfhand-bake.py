# THE HANDS (owner, 7 Nov 2026: "lets add real hands at all times"): Polyfork's Base Hand (a left hand on the 25 WebXR joints, rigid) baked into data/pfhand.json:
# each joint's rest frame (absolute, hand space: fingers +Z, back of the hand +Y), each corner its joint and its place in that joint's frame (int16), its colour zone (0 skin, 1 nail), the triangles.
# The raw .glb is fetched into .polyfork/hand/ (git-ignored, never committed). Run: python3 tools/pfhand-bake.py [FACETS=7] [GIRTH=1.25]
import sys, os, json, struct, base64, urllib.request, urllib.parse, numpy as np
sys.path.insert(0,os.path.dirname(__file__))
A=dict(a.split('=') for a in sys.argv[1:] if '=' in a); FAC=int(A.get('FACETS',7)); GI=float(A.get('GIRTH',1.25))   # (girth: the flesh round the same joints, to match the avatar's chunky arms)
C='.polyfork/hand'; os.makedirs(C,exist_ok=True); F=f'{C}/hand-f{FAC}-g{GI}.glb'
if not os.path.exists(F):
    u='https://polyfork.dev/cdn/base-hand-e3398a-remix.glb?p='+urllib.parse.quote(json.dumps({'facets':FAC,'girth':GI},separators=(',',':')))
    r=urllib.request.Request(u,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}); open(F,'wb').write(urllib.request.urlopen(r,timeout=120).read())
d=open(F,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; b=d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
NODES=j['nodes']; skin=j['skins'][0]; JN=skin['joints'][1:]   # (the first is the root 'hand' at identity)
NAMES=[NODES[k]['name'] for k in JN]
def mat(n):
    x,y,z,w=n.get('rotation',[0,0,0,1]); R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=R; M[:3,3]=n.get('translation',[0,0,0]); return M
REST=[mat(NODES[k]) for k in JN]
P=[];Jx=[];Z=[];T=[]; base=0
for ni,n in enumerate(NODES):
    if 'mesh' not in n: continue
    sk=j['skins'][n['skin']]; ib=acc(sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1); sj=sk['joints']
    for p in j['meshes'][n['mesh']]['primitives']:
        A=p['attributes']; pos=acc(A['POSITION']).astype(float); col=acc(A['COLOR_0']).astype(float); jt=acc(A['JOINTS_0']); wt=acc(A['WEIGHTS_0'])
        if col.max()>1.5: col/=255
        k=wt.argmax(1); jj=jt[np.arange(len(jt)),k]
        for v in range(len(pos)):
            jn=sj[jj[v]]; gi=JN.index(jn) if jn in JN else 0
            loc=np.linalg.inv(REST[gi])@np.r_[pos[v],1]; P.append(loc[:3]); Jx.append(gi)
            Z.append(1 if col[v][2]>(col[:,2].min()+col[:,2].max())/2 and col[:,2].max()-col[:,2].min()>.05 else 0)
        idx=acc(p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
        T.extend((idx+base).tolist()); base+=len(pos)
P=np.array(P); Jx=np.array(Jx); Z=np.array(Z); T=np.array(T)
K={}; keep=[]; remap=np.zeros(len(P),int)   # (corners welded: one point a joint, zone and place; the faces are flat, their normal from the screen)
for i in range(len(P)):
    k=(Jx[i],Z[i])+tuple(np.round(P[i],5))
    if k not in K: K[k]=len(keep); keep.append(i)
    remap[i]=K[k]
P=P[keep]; Jx=Jx[keep]; Z=Z[keep]; T=remap[T]
lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
Q=np.round((P-lo)/sc-32500).astype(np.int16)
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
rest=[[round(float(x),5) for x in M[:3,:3].T.reshape(-1)]+[round(float(x),5) for x in M[:3,3]] for M in REST]   # (columns x,y,z then the origin)
out={'names':NAMES,'rest':rest,'lo':[round(float(x),6) for x in lo],'sc':float(sc),'pos':b64(Q),'j':b64(np.array(Jx,np.uint8)),'z':b64(np.array(Z,np.uint8)),
     'tri':b64(np.array(T,np.uint16)),'pal':['f2d5bd','feece2'],'credit':'Base Hand by Polyfork (https://polyfork.dev/asset/base-hand-e3398a), CC BY 4.0'}
json.dump(out,open('data/pfhand.json','w'),separators=(',',':'))
print('data/pfhand.json',len(P),'points',len(T)//3,'triangles',os.path.getsize('data/pfhand.json'),'bytes')
