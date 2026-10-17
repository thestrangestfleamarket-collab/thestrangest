# THE METRO (owner, 17 Oct 2026: "look in google drive for metro station" ... "lets make that the subway in the new game"): his Drive's
# Metro_PSX.rar (Metro_PSX/Models/Metro.glb, a PSX-style modular metro kit laid out in a row: four station cross-sections of track, platform,
# tiled wall and concrete ceiling; an exit piece whose sloped corridor turns into a flight up to a railed opening at the street; a subway car with
# its sliding doors, seats and railings; a ticket hall's gates, machine, vending machine, map, posters, bench, bin and ceiling light).
# Each piece's points in the kit's own metres (its node's transform applied), its texture coordinates (the textures tile, so they stay textures:
# no atlas, no colours on the points), its triangles by material; the textures shrunk toward the game's texel size (about 18 texels a metre: a
# face keeps its picture but at the world's grain) and kept as PNGs; a height map over the exit's floors (the slope, the turn, the steps) so the
# page knows the ground under you there. Into data/metro.json. Run: python3 tools/metro-bake.py <Metro.glb>
import sys, os, json, struct, base64, io, numpy as np
from PIL import Image
F=sys.argv[1]
d=open(F,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; buf=d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(buf,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(buf,ct,a['count']*n,off).reshape(a['count'],n)
def trs(n):
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=R*s; M[:3,3]=t; return M
par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
W={}
def wm(i):
    if i in W: return W[i]
    M=trs(j['nodes'][i]); W[i]=(wm(par[i])@M) if i in par else M; return W[i]
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
# the images, as they are
IMG={}
for k,im in enumerate(j['images']):
    bv=j['bufferViews'][im['bufferView']]; IMG[k]=Image.open(io.BytesIO(buf[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]))
# the materials: its texture (the image's index), its emissive texture, whether its picture has holes (alpha)
MATS=[]
for m in j['materials']:
    pbr=m.get('pbrMetallicRoughness',{}); t=pbr.get('baseColorTexture'); e=m.get('emissiveTexture')
    MATS.append({'name':m['name'],'tex':j['textures'][t['index']]['source'] if t else None,'emis':j['textures'][e['index']]['source'] if e else None,'col':[round(v,3) for v in pbr.get('baseColorFactor',[1,1,1,1])[:3]]})
for m in MATS: m['alpha']=bool(m['tex'] is not None and IMG[m['tex']].mode=='RGBA' and np.array(IMG[m['tex']])[:,:,3].min()<128)
# the node's name without Blender's suffix dots (Door.001 -> Door001), as the pieces are named
nm=lambda n:n['name'].replace('.','')
NODES={nm(n):i for i,n in enumerate(j['nodes']) if 'mesh' in n}
def mesh(i):   # one node's triangles in the kit's space: points, uvs, and (material, start, count) runs; the winding put right where its transform mirrors
    n=j['nodes'][i]; M=wm(i); flip=np.linalg.det(M[:3,:3])<0; P=[];U=[];G=[]; base=0
    for p in j['meshes'][n['mesh']]['primitives']:
        A=p['attributes']; pos=acc(A['POSITION']).astype(float); pos=(M[:3,:3]@pos.T).T+M[:3,3]; uv=acc(A['TEXCOORD_0']).astype(float)
        idx=acc(p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
        if flip: idx=idx.reshape(-1,3)[:,::-1].reshape(-1)
        P.append(pos[idx]); U.append(uv[idx]); G.append((p['material'],base,len(idx))); base+=len(idx)
    return np.vstack(P),np.vstack(U),G
# the pieces: a kit piece is one node, or several displayed together (the end wall with its door on the St piece; the exit's corridor, flight and
# door; the car with its seats, railings, windows and end doors); each door leaf of the car on its own, so the page can slide it
GROUPS={'St':['St','Estruc','Frame_01','Glass','Door_A'],'St_01':['St_01'],'St_02':['St_02'],'St_03':['St_03','Stairs','Stairs_01','Estruc001','Frame','Glass_01','Door_A_01'],'Railing':['Railing'],
  'car':['subway_car','Door014','Door015']+[k for k in NODES if k.startswith('seats') or k.startswith('Railing_V') or (k.startswith('Glass') and k not in('Glass','Glass_01'))],
  'Column':['Column'],'light':['light'],'ticket_machine':['ticket_machine'],'trash_can':['trash_can'],'Chair':['Chair'],'Vending_machine':['Vending_machine'],'metro_map':['metro_map'],
  'gate':['automatic_ticket_gate'],'gate_flap':['automatic_ticket_gate_D']}
for k in range(14): GROUPS['door%d'%k]=['Door' if k==0 else 'Door%03d'%k]
for k in range(1,9): GROUPS['Poster_%02d'%k]=['Poster_%02d'%k]
PIECES={}; TOT=0; DENS={}
for key,names in GROUPS.items():
    P=[];U=[];G=[]; base=0
    for nmn in names:
        p,u,g=mesh(NODES[nmn]); P.append(p); U.append(u); G+=[(m,s+base,c) for m,s,c in g]; base+=len(p)
    P=np.vstack(P); U=np.vstack(U)
    # the runs joined by material (one draw a material a piece)
    runs={}
    for m,s,c in G: runs.setdefault(m,[]).append((s,c))
    order=np.concatenate([np.arange(s,s+c) for m in runs for s,c in runs[m]]); P=P[order]; U=U[order]; groups=[]; at=0
    for m in runs:
        c=sum(c for s,c in runs[m]); groups.append([m,at,c]); at+=c
    # the texel density of each texture on its faces (texels a metre), for the shrink
    for m,s,c in groups:
        t=MATS[m]['tex']
        if t is None: continue
        im=IMG[t]; tw,th=im.size; a=P[s:s+c].reshape(-1,3,3); uv=U[s:s+c].reshape(-1,3,2)*[tw,th]
        wa=0.5*np.linalg.norm(np.cross(a[:,1]-a[:,0],a[:,2]-a[:,0]),axis=1); ua=0.5*np.abs((uv[:,1,0]-uv[:,0,0])*(uv[:,2,1]-uv[:,0,1])-(uv[:,2,0]-uv[:,0,0])*(uv[:,1,1]-uv[:,0,1]))
        ok=wa>1e-6; DENS.setdefault(t,[]).append((np.sqrt(ua[ok]/wa[ok]),wa[ok]))
    lo=P.min(0); hi=P.max(0); sc=max((hi-lo).max(),1e-6)/65000
    PIECES[key]={'n':len(P),'lo':np.round(lo,4).tolist(),'hi':np.round(hi,4).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'uv':b64(np.clip(np.round(U*512),-32767,32767).astype(np.int16)),'g':groups,'tris':len(P)//3}
    TOT+=len(P)//3; print('%-16s %6d tris  x %6.2f..%6.2f  y %5.2f..%5.2f  z %6.2f..%6.2f'%(key,len(P)//3,lo[0],hi[0],lo[1],hi[1],lo[2],hi[2]))
print('total',TOT)
# THE TEXTURES, shrunk toward the world's grain (about 18 texels a metre, the game's 24 a tile; by halves, never under 32 a side, never grown),
# the shrink a plain average of each block (no blur past it; nearest at run time)
TARGET=18.0; TEX={}
for t,im in IMG.items():
    dens=np.concatenate([d for d,w in DENS.get(t,[])]) if t in DENS else np.array([TARGET]); wts=np.concatenate([w for d,w in DENS.get(t,[])]) if t in DENS else np.array([1.])
    med=float(np.average(dens,weights=wts)) if len(dens) else TARGET; k=1
    while med/k>TARGET*1.5 and min(im.size)//(k*2)>=32: k*=2
    im2=im.convert('RGBA' if im.mode=='RGBA' else 'RGB')
    if k>1: im2=im2.resize((im.size[0]//k,im.size[1]//k),Image.BOX)
    bio=io.BytesIO(); im2.save(bio,'PNG',optimize=True); TEX[t]={'name':j['images'][t]['name'],'w':im2.size[0],'h':im2.size[1],'png':base64.b64encode(bio.getvalue()).decode()}
    print('%-22s %4dx%-4d  %5.1f texels/m  /%d -> %dx%d  %d bytes'%(j['images'][t]['name'],im.size[0],im.size[1],med,k,im2.size[0],im2.size[1],len(bio.getvalue())))
# THE EXIT'S FLOORS: the height under each spot of a grid (a fifth of a metre) over the exit piece, from its floor-ish faces (the slope, the
# turn, the flight's treads, the corridor's floor): the lowest face over the track bed (the ceilings and the roof lie over it); 255 where no floor is
def heightmap(keys,x0,x1,z0,z1,step=.2,ymin=1.3):
    T=[]
    for key in keys:
        p=PIECES[key]; P=(np.frombuffer(base64.b64decode(p['p']),np.int16).reshape(-1,3).astype(float)+32500)*p['sc']+p['lo']; T.append(P.reshape(-1,3,3))
    T=np.vstack(T); n=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]); ln=np.linalg.norm(n,axis=1); ok=(ln>1e-9); T=T[ok]; n=n[ok]/ln[ok][:,None]; up=np.abs(n[:,1])>.3; T=T[up]; n=n[up]
    xs=np.arange(x0,x1+1e-6,step); zs=np.arange(z0,z1+1e-6,step); H=np.full((len(zs),len(xs)),255,np.uint8)
    for jz,z in enumerate(zs):
        for ix,x in enumerate(xs):
            # the point in each triangle's plan (barycentric), its height on that plane
            a=T[:,0]; b=T[:,1]; c=T[:,2]; v0=(b-a)[:,[0,2]]; v1=(c-a)[:,[0,2]]; v2=np.array([x,z])-a[:,[0,2]]
            den=v0[:,0]*v1[:,1]-v1[:,0]*v0[:,1]; okd=np.abs(den)>1e-9; u=np.zeros(len(T)); v=np.zeros(len(T))
            u[okd]=(v2[okd,0]*v1[okd,1]-v1[okd,0]*v2[okd,1])/den[okd]; v[okd]=(v0[okd,0]*v2[okd,1]-v2[okd,0]*v0[okd,1])/den[okd]
            inside=okd&(u>=-1e-3)&(v>=-1e-3)&(u+v<=1+1e-3);
            if not inside.any(): continue
            y=a[inside,1]+u[inside]*(b[inside,1]-a[inside,1])+v[inside]*(c[inside,1]-a[inside,1]); y=y[y>=ymin]
            if not len(y): continue
            H[jz,ix]=int(round(min(254,max(0,(y.min()-1.4)/10.2*250))))
    return {'x0':x0,'z0':z0,'step':step,'nx':len(xs),'nz':len(zs),'h':b64(H)}
HF=heightmap(['St_03'],9.0,28.6,54.5,79.2)
hh=np.frombuffer(base64.b64decode(HF['h']),np.uint8).reshape(HF['nz'],HF['nx']); print('heightmap',hh.shape,'floor cells',(hh<255).sum())
for r in hh[::6]: print(''.join('.' if v==255 else chr(48+min(9,v//26)) for v in r[::2]))
OUT={'mats':MATS,'tex':TEX,'pieces':PIECES,'hf':HF}
os.makedirs('data',exist_ok=True); s=json.dumps(OUT,separators=(',',':')); open('data/metro.json','w').write(s); print('data/metro.json',len(s))
