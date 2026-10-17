# THE PARK'S TREES AND ROCKS (owner, 17 Oct 2026: "import the low poly forest pack, and anything else you can use to build out central park
# entrance and a little bit further"): his Drive's LowpolyForestPack.zip (oaks, spruces, dead oaks, rocks, as .fbx with textures), baked into
# data/forest.json for src/park.js. Run: the .fbx files first to .glb with FBX2glTF (npm's fbx2gltf), then
#   python3 tools/forest-bake.py /path/to/glb
# Each model: its faces (three corners each, flat: the low-poly look), each coloured by its material (the pack's textures are near-flat colours:
# the texture's mean, so the game needs no texture, as the rule is), its feet at 0, 1 tall; its own height in metres kept, so park.js can
# scale it as the owner wants (trees 5 to 20 times a person).
import sys, os, json, struct, base64, numpy as np
R=sys.argv[1]
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; Rm=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=Rm*s; M[:3,3]=t; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
# the pack's textures' colours (their means, sRGB), by material
COL={'OakTreeLeaf':(107,168,67),'OakTreeTrunk':(138,109,68),'SpruceTreeLeaf':(80,122,73),'SpruceTreeTrunk':(120,92,60),'DeadOakTreeTrunk':(105,69,37),'DeadSpruceTreeTrunk':(96,72,50),'Rock':(118,118,116)}
OUT={}
for f in sorted(os.listdir(R)):
    if not f.endswith('.glb'): continue
    key=f[:-4]; j,b=glb(os.path.join(R,f)); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
    G={}
    def glob_(i):
        if i in G: return G[i]
        M=trs(j['nodes'][i]); G[i]=(glob_(par[i])@M) if i in par else M; return G[i]
    T=[]; C=[]; KIND=[]
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        M=glob_(ni)
        for p in j['meshes'][n['mesh']]['primitives']:
            P=acc(j,b,p['attributes']['POSITION']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int); mn=j['materials'][p['material']]['name']
            W=(M[:3,:3]@P.T).T+M[:3,3]; tri=W[idx].reshape(-1,3,3); T.append(tri); C.append(np.tile(np.array(COL.get(mn,(128,128,128)),np.uint8),(len(tri)*3,1))); KIND.append(np.full(len(tri),0 if 'Leaf' in mn else 1 if 'Trunk' in mn else 2))
    T=np.vstack(T); C=np.vstack(C); KIND=np.concatenate(KIND)
    lo=T.reshape(-1,3).min(0); hi=T.reshape(-1,3).max(0); h=hi[1]-lo[1]
    T=T-[ (lo[0]+hi[0])/2, lo[1], (lo[2]+hi[2])/2 ]; T=T/h
    OUT[key]={'p':b64(T.reshape(-1).astype(np.float32)),'c':b64(C),'k':b64(KIND.astype(np.uint8)),'tris':len(T),'metres':float(np.round(h,3)),'wide':float(np.round(max(hi[0]-lo[0],hi[2]-lo[2])/h,4)),'trunk':float(np.round(0,3))}
    # the trunk's girth at the foot (for where you can't walk): the spread of the lowest faces
    low=T[(T[:,:,1].max(1)<.08)]; OUT[key]['trunk']=float(np.round(max(1e-3,np.ptp(low.reshape(-1,3)[:,[0,2]],axis=0).max()) if len(low) else .05,4))
    print(key,len(T),'tris',round(h,2),'m tall, wide',OUT[key]['wide'],'foot',OUT[key]['trunk'])
open('data/forest.json','w').write(json.dumps(OUT,separators=(',',':'))); print('data/forest.json',os.path.getsize('data/forest.json'),'bytes')
