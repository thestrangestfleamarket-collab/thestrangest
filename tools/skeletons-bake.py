# THE SKELETONS (owner, 17 Oct 2026, "can you add these characters into game": Kay Lousberg's KayKit Skeletons 1.1, CC0): the four
# characters (Warrior, Mage, Minion, Rogue), their gear and the rig's clips, baked from the pack's .glb/.gltf files into data/skel.json.
# Each character keeps its bones (23, the pack's Rig_Medium) and weights, so the pack's own walks and idles move it; its colours are
# sampled from the pack's palette texture at each vertex (vertical gradient swatches: so the model needs no texture, as the bear has none).
# Run: python3 tools/skeletons-bake.py /path/to/KayKit_Skeletons_1.1_FREE
import sys, os, json, struct, base64, numpy as np
from PIL import Image
R=sys.argv[1]
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,[d[28+ln:28+ln+bl]]
def gltf(f):
    j=json.load(open(f)); return j,[open(os.path.join(os.path.dirname(f),b['uri']),'rb').read() for b in j['buffers']]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,bufs,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    b=bufs[bv['buffer']]
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; Rm=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=Rm*s; M[:3,3]=t; return M
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
TEX=np.array(Image.open(os.path.join(R,'texture/skeleton_texture.png')).convert('RGB'))
def colours(uv):   # the texture's colour under each vertex (nearest texel; glTF's v runs down from the top, as the image's rows do)
    u=np.clip((uv[:,0]%1)*TEX.shape[1],0,TEX.shape[1]-1).astype(int); v=np.clip((uv[:,1]%1)*TEX.shape[0],0,TEX.shape[0]-1).astype(int); return TEX[v,u]
# ---- the rig, from the Warrior (all four and the clips share it, bone for bone)
jw,bw=glb(os.path.join(R,'characters/gltf/Skeleton_Warrior.glb')); SK=jw['skins'][0]; J=SK['joints']; JN=[jw['nodes'][i]['name'] for i in J]; JI={n:k for k,n in enumerate(JN)}
par={c:i for i,n in enumerate(jw['nodes']) for c in n.get('children',[])}
rig={'names':JN,'parent':[JI.get(jw['nodes'][par[i]]['name'],-1) if i in par else -1 for i in J],
  't':[np.round(jw['nodes'][i].get('translation',[0,0,0]),5).tolist() for i in J],'q':[np.round(jw['nodes'][i].get('rotation',[0,0,0,1]),5).tolist() for i in J]}
IBM=acc(jw,bw,SK['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)   # (column-major in the file)
rig['ibm']=b64(IBM.transpose(0,2,1).astype(np.float32))                       # (back to column-major, as THREE.Matrix4.fromArray reads)
# ---- a character: every mesh node's vertices in the skin's bind space, with its joints and weights; a part (region) a mesh
def character(name):
    j,bufs=glb(os.path.join(R,f'characters/gltf/Skeleton_{name}.glb')); P=[];C=[];RG=[];JJ=[];WW=[];IX=[]; parts=[]; base=0; eye=-1
    par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}; names=[j['nodes'][i]['name'] for i in j['skins'][0]['joints']]
    assert sorted(names)==sorted(JN), name; remap=np.array([JI[n] for n in names])   # (the same bones, in each file's own order: mapped by name)
    ibm=acc(j,bufs,j['skins'][0]['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)[np.argsort(remap)]
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        part=n['name'].split('_',2)[2]; parts.append(part)
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; pos=acc(j,bufs,A['POSITION']).astype(float); uv=acc(j,bufs,A['TEXCOORD_0']); idx=acc(j,bufs,p['indices']).reshape(-1).astype(int)
            if 'skin' in n: jn=remap[acc(j,bufs,A['JOINTS_0']).astype(int)]; w=acc(j,bufs,A['WEIGHTS_0']).astype(float)
            else:   # (a still piece hung on a bone, the helmet or the hat: its points moved into the bone's bind space, bound to it whole)
                jt=JI[j['nodes'][par[ni]]['name']]; M=np.linalg.inv(ibm[jt])@trs(n); pos=(M[:3,:3]@pos.T).T+M[:3,3]
                jn=np.zeros((len(pos),4),int); jn[:,0]=jt; w=np.zeros((len(pos),4)); w[:,0]=1
            if j['materials'][p['material']]['name']=='Glow': eye=len(parts)-1
            P.append(pos); C.append(colours(uv)); RG.append(np.full(len(pos),len(parts)-1)); JJ.append(jn); WW.append(w); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); RG=np.concatenate(RG); JJ=np.vstack(JJ); WW=np.vstack(WW); IX=np.concatenate(IX)
    lo=P.min(0); hi=P.max(0); sc=(hi-lo).max()/65000
    return {'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.astype(np.uint8)),'r':b64(RG.astype(np.uint8)),
      'j':b64(JJ.astype(np.uint8)),'w':b64(np.round(WW*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':parts,'eye':eye,'tall':float(np.round(hi[1]-lo[1],4)),'tris':len(IX)//3}
# ---- a piece of gear: a still mesh, held in a hand slot
def gear(name):
    j,bufs=gltf(os.path.join(R,f'assets/gltf/Skeleton_{name}.gltf')); P=[];C=[];IX=[]; base=0
    for n in j['nodes']:
        if 'mesh' not in n: continue
        M=trs(n)
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; pos=acc(j,bufs,A['POSITION']).astype(float); pos=(M[:3,:3]@pos.T).T+M[:3,3]; uv=acc(j,bufs,A['TEXCOORD_0']); idx=acc(j,bufs,p['indices']).reshape(-1).astype(int)
            P.append(pos); C.append(colours(uv)); IX.append(idx+base); base+=len(pos)
    P=np.vstack(P); C=np.vstack(C); IX=np.concatenate(IX); lo=P.min(0); sc=max((P.max(0)-lo).max(),1e-6)/65000
    return {'n':len(P),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(C.astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'tris':len(IX)//3}
# ---- the clips: sampled at 24 a second; every bone's turn as a quaternion (int16), the few bones that move's positions (float32)
def clips(f,want):
    j,bufs=glb(os.path.join(R,f)); out={}
    for a in j['animations']:
        if a['name'] not in want: continue
        dur=max(float(acc(j,bufs,s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*24))+1); T=np.linspace(0,dur,nf)
        Q=np.tile(np.array(rig['q'],float),(nf,1,1)); TR={}
        for c,s in zip(a['channels'],[a['samplers'][c['sampler']] for c in a['channels']]):
            bn=j['nodes'][c['target']['node']]['name']; k=JI[bn]; t=acc(j,bufs,s['input']).reshape(-1).astype(float); v=acc(j,bufs,s['output']).astype(float)
            if c['target']['path']=='rotation':
                for d in range(1,len(v)):   # (the shorter way round between keys)
                    if np.dot(v[d],v[d-1])<0: v[d]=-v[d]
                q=np.stack([np.interp(T,t,v[:,i]) for i in range(4)],1); Q[:,k]=q/np.linalg.norm(q,axis=1,keepdims=True)
            elif c['target']['path']=='translation':
                p=np.stack([np.interp(T,t,v[:,i]) for i in range(3)],1)
                if np.ptp(p,axis=0).max()>1e-4: TR[bn]=b64(p.astype(np.float32))
        out[a['name']]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
    return out
D={'rig':rig,'clips':{**clips('Animations/gltf/Rig_Medium/Rig_Medium_General.glb',['Idle_A','Idle_B']),**clips('Animations/gltf/Rig_Medium/Rig_Medium_MovementBasic.glb',['Walking_A','Walking_B','Walking_C'])},
  'chars':{n:character(n) for n in ['Warrior','Mage','Minion','Rogue']},'gear':{n:gear(n) for n in ['Blade','Shield_Small_A','Staff','Crossbow','Quiver','Axe','Shield_Large_A']}}
os.makedirs('data',exist_ok=True); s=json.dumps(D,separators=(',',':')); open('data/skel.json','w').write(s)
print('data/skel.json',len(s),'bytes'); print({n:(c['n'],c['tris'],c['parts'],c['eye'],c['tall']) for n,c in D['chars'].items()}); print({n:(g['n'],g['tris']) for n,g in D['gear'].items()}); print({n:(c['dur'],c['n'],list(c['p'])) for n,c in D['clips'].items()})
