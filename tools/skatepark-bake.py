# THE SKATE PARK (owner, 3 Nov 2026, his Drive's Polyfork skatepark kit: "its own place you go into, all of it, put it in central park, full size"):
# the kit's composed scene (scene.glb: 1267 placements of 60 parts, Y up, metres) baked whole into data/skatepark.json:
#   mesh   every still part in world metres, welded, its own vertex colours, cut into 16 m squares {lo,sc,p int16, c uint8, i uint32} per square
#   glow   the parts' lit zones (kit.json "night": a part's colour that lights up after dusk) as their own mesh, day and night colours
#   ground a height grid (0.25 m cells, 5 cm steps) of what you can stand on: the terrain, the tiles, decks, ramps, ledges under knee height
#   solid  the cells a body can't pass (walls, rises over the knee, posts, trees, buildings), merged to rectangles
#   gate   the entrance gateway in its own frame (data/skategate.json: it stands in Central Park as the door)
#   people the 22 skaters' spots (key, x, z, heading); their bodies are rebaked onto your rig by rig-rebake.py skaters
# Run: python3 tools/skatepark-bake.py data/full/skatepark
import sys, os, json, struct, base64, numpy as np
R=sys.argv[1]; OUT=sys.argv[2] if len(sys.argv)>2 else 'data/skatepark.json'
b=open(os.path.join(R,'scene.glb'),'rb').read(); ln=struct.unpack_from('<I',b,12)[0]; g=json.loads(b[20:20+ln]); BIN=b[28+ln:]
KIT=json.load(open(os.path.join(R,'kit.json')))
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(i):
    a=g['accessors'][i]; bv=g['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(BIN,ct,n,off+k*st) for k in range(a['count'])])
    v=np.frombuffer(BIN,ct,a['count']*n,off).reshape(a['count'],n).astype(np.float64)
    if a.get('normalized'): v=v/{5121:255.,5123:65535.}.get(a['componentType'],1.)
    return v
def local(n):
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; Rm=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=Rm*s; M[:3,3]=t; return M
N=g['nodes']; WM=[None]*len(N)
def world(i,P):
    WM[i]=P@local(N[i])
    for c in N[i].get('children',[]): world(c,WM[i])
for r in g['scenes'][0]['nodes']: world(r,np.eye(4))
def prims(i):   # every primitive under node i in world metres (skinned ones at their bind pose)
    out=[]; st=[i]
    while st:
        k=st.pop(); nd=N[k]; st+=nd.get('children',[])
        if 'mesh' not in nd: continue
        for p in g['meshes'][nd['mesh']]['primitives']:
            A=p['attributes']; P=acc(A['POSITION']); C=acc(A['COLOR_0'])[:,:3] if 'COLOR_0' in A else np.full((len(P),3),.7)
            ix=acc(p['indices']).reshape(-1).astype(np.int64) if 'indices' in p else np.arange(len(P))
            Ph=np.c_[P,np.ones(len(P))]
            if 'skin' in nd:
                sk=g['skins'][nd['skin']]; IB=acc(sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1); J=acc(A['JOINTS_0']).astype(int); W=acc(A['WEIGHTS_0'])
                JM=np.stack([WM[j]@IB[q] for q,j in enumerate(sk['joints'])]); Wp=np.zeros((len(P),3))
                for k4 in range(4): Wp+=W[:,k4:k4+1]*np.einsum('nij,nj->ni',JM[J[:,k4]],Ph)[:,:3]
                Wp/=np.maximum(W.sum(1,keepdims=True),1e-9)
            else: Wp=(Ph@WM[k].T)[:,:3]
            out.append((Wp[ix],C[ix]))
    return out
part=lambda nm:nm if nm in KIT['classes'] or nm=='skatepark-terrain' else nm.rsplit('-',1)[0]
TILES={'skate-slab-tile','composite-deck-tile'}
LOOSE={'energy-drink-can','spray-paint-can','roller-skate','protective-pad','skate-helmet','wheel-scuff-decal','graffiti-wall-decal','pavement-crack-weed','fisheye-camcorder','cruiser-and-longboard'}
GLOW={}
for z in KIT['night']:
    for p in z['parts']: GLOW.setdefault(p,[]).append((np.array([int(z['from'][k:k+2],16)/255 for k in (1,3,5)])**2.2,np.array([int(z['to'][k:k+2],16)/255 for k in (1,3,5)]),z['intensity']))
root=N[g['scenes'][0]['nodes'][0]]
TP,TC,TG,TK,TN=[],[],[],[],[]   # triangle corners, colours, glow night colour (or nan), part kind (0 terrain, 1 solid part, 2 loose), night strength
people=[]
for c in root['children']:
    nm=N[c]['name']; k=part(nm); cls=KIT['classes'].get(k)
    if cls=='character':
        M=WM[c]; people.append({'key':k,'x':round(M[0,3],3),'y':round(M[1,3],3),'z':round(M[2,3],3),'hd':round(float(np.arctan2(M[0,2],M[2,2])),3)}); continue
    kind=0 if k=='skatepark-terrain' else 2 if k in LOOSE else 1
    for P,C in prims(c):
        if k in TILES:   # a floor tile drawn as its top on a flat 2 m underlay of its edge colour (its bevels read as heavy seams from above, and were half the park's triangles); stood on whole
            T=P.reshape(-1,3,3); Cq=C.reshape(-1,3,3); n0=len(T); TP.append(T); TC.append(Cq); TK.append(np.full(n0,3,np.int8)); TG.append(np.full((n0,3),np.nan)); TN.append(np.zeros(n0))
            nn=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]); ny_=nn[:,1]/np.maximum(np.linalg.norm(nn,axis=1),1e-12); top=T[:,:,1].max(); m=(ny_>.9)&(T[:,:,1].min(1)>top-.012)
            x0,z0=T.reshape(-1,3)[:,[0,2]].min(0); x1,z1=T.reshape(-1,3)[:,[0,2]].max(0); y=top-.006; ec=Cq[~m].reshape(-1,3).mean(0) if (~m).any() else Cq.reshape(-1,3).mean(0)
            U=np.array([[[x0,y,z0],[x1,y,z1],[x1,y,z0]],[[x0,y,z0],[x0,y,z1],[x1,y,z1]]]); P=np.vstack([T[m],U]).reshape(-1,3); C=np.vstack([Cq[m],np.tile(ec,(2,3,1))]).reshape(-1,3); kind=4
        n=len(P)//3; TP.append(P.reshape(n,3,3)); TC.append(C.reshape(n,3,3)); TK.append(np.full(n,kind,np.int8)); kind=0 if k=='skatepark-terrain' else 2 if k in LOOSE else 1
        G=np.full((n,3),np.nan); S=np.zeros(n)
        for fr,to,it in GLOW.get(k,[]):
            hit=(np.abs(C.reshape(n,3,3)-fr).max(2).max(1)<.02); G[hit]=to; S[hit]=it
        TG.append(G); TN.append(S)
TP=np.vstack(TP); TC=np.vstack(TC); TK=np.concatenate(TK); TG=np.vstack(TG); TN=np.concatenate(TN)
print('triangles',len(TP),'people',len(people),'glow',int((~np.isnan(TG[:,0])).sum()))
lo=TP.reshape(-1,3).min(0); hi=TP.reshape(-1,3).max(0); print('bounds',lo.round(2),hi.round(2))
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def pack(P,C):   # welded mesh: int16 over its own box, sRGB-ish uint8 colours (the file's linear colours to the screen's), uint32 triangles
    V=P.reshape(-1,3); Cc=np.clip(C.reshape(-1,3),0,1)**(1/2.2)
    key=np.c_[np.round(V*500),np.round(Cc*255)]; u,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True)
    V=V[first]; Cc=Cc[first]; I=inv.reshape(-1).astype(np.uint32)
    l=V.min(0); s=max(float((V.max(0)-l).max())/65000,1e-6)
    return {'lo':[round(float(x),4) for x in l],'sc':s,'p':b64(np.clip(np.round((V-l)/s)-32500,-32768,32767).astype(np.int16)),'c':b64(np.round(Cc*255).astype(np.uint8)),'i':b64(I),'n':len(V),'t':len(I)//3}
SQ=16.; still=np.isnan(TG[:,0])&(TK!=3); cen=TP.mean(1); sq={}
for t in np.nonzero(still)[0]:
    k=(int(np.floor(cen[t,0]/SQ)),int(np.floor(cen[t,2]/SQ))); sq.setdefault(k,[]).append(t)
mesh=[pack(TP[ix],TC[ix]) for ix in (np.array(v) for v in sq.values())]
gi=np.nonzero(~np.isnan(TG[:,0]))[0]; glow=pack(TP[gi],TC[gi]); NG=TG[gi]; glow['night']=b64(np.round(np.clip(np.repeat(NG,3,0),0,1)*255).astype(np.uint8))
# the night colour per welded corner: pack() welds by day colour, so take each corner's own by re-running its weld key
V=TP[gi].reshape(-1,3); Cc=np.clip(TC[gi].reshape(-1,3),0,1)**(1/2.2); key=np.c_[np.round(V*500),np.round(Cc*255)]; u,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True)
glow['night']=b64(np.round(np.clip(np.repeat(NG,3,0)[first],0,1)*255).astype(np.uint8)); glow['k']=float(TN[gi].mean()) if len(gi) else 0
# the ground and the walls, from the triangles themselves
CS=.25; X0=np.floor(lo[0]); Z0=np.floor(lo[2]); NX=int(np.ceil((hi[0]-X0)/CS))+1; NZ=int(np.ceil((hi[2]-Z0)/CS))+1
TER=np.full((NZ,NX),-np.inf); H=np.full((NZ,NX),-np.inf); BL=np.zeros((NZ,NX),bool); KNEE=.45; BODY=1.9; CAP=2.4; UPN=.55
nrm=np.cross(TP[:,1]-TP[:,0],TP[:,2]-TP[:,0]); nl=np.linalg.norm(nrm,axis=1); nrm=nrm/np.maximum(nl,1e-12)[:,None]; ny=np.abs(nrm[:,1])
def cover(T,fine):   # cell centres under a triangle (walkable tops), or every cell its sampled area touches (walls)
    x0,z0=T[:,[0,2]].min(0); x1,z1=T[:,[0,2]].max(0); i0=int(np.floor((x0-X0)/CS)); i1=int(np.floor((x1-X0)/CS)); j0=int(np.floor((z0-Z0)/CS)); j1=int(np.floor((z1-Z0)/CS))
    if fine:
        n=max(2,int(np.ceil(max(x1-x0,z1-z0,np.ptp(T[:,1]))/(CS*.5)))+1); u,v=np.meshgrid(np.linspace(0,1,n),np.linspace(0,1,n)); m=u+v<=1; u=u[m]; v=v[m]
        p=T[0]+np.outer(u,T[1]-T[0])+np.outer(v,T[2]-T[0]); return np.clip(np.floor((p[:,0]-X0)/CS).astype(int),0,NX-1),np.clip(np.floor((p[:,2]-Z0)/CS).astype(int),0,NZ-1),p[:,1]
    ii,jj=np.meshgrid(np.arange(i0,i1+1),np.arange(j0,j1+1)); ii=ii.ravel(); jj=jj.ravel(); px=X0+(ii+.5)*CS; pz=Z0+(jj+.5)*CS
    a,b_,c=T[:,[0,2]]; d=(b_[1]-c[1])*(a[0]-c[0])+(c[0]-b_[0])*(a[1]-c[1])
    if abs(d)<1e-12: return ii[:0],jj[:0],px[:0]
    l1=((b_[1]-c[1])*(px-c[0])+(c[0]-b_[0])*(pz-c[1]))/d; l2=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(pz-c[1]))/d; l3=1-l1-l2; m=(l1>=-1e-6)&(l2>=-1e-6)&(l3>=-1e-6)
    y=l1*T[0,1]+l2*T[1,1]+l3*T[2,1]; m&=(ii>=0)&(ii<NX)&(jj>=0)&(jj<NZ); return ii[m],jj[m],y[m]
for t in np.nonzero(TK==0)[0]:
    if ny[t]<.2: continue
    i,j,y=cover(TP[t],False); np.maximum.at(TER,(j,i),y)
TER[np.isinf(TER)]=np.nan
H=np.where(np.isnan(TER),-np.inf,TER)
walk=np.nonzero(((TK==1)|(TK==3))&(ny>=UPN))[0]
for t in walk:
    i,j,y=cover(TP[t],False); ok=y-np.nan_to_num(TER[j,i],nan=-99)<CAP; np.maximum.at(H,(j[ok],i[ok]),y[ok])
H[np.isinf(H)]=np.nan
for t in np.nonzero(((TK==1)|(TK==3))&(ny<UPN))[0]:
    i,j,y=cover(TP[t],True); h=H[j,i]; m=~np.isnan(h)&(y>h+KNEE)&(y<h+BODY); BL[j[m],i[m]]=True
# a top too high above its neighbour (a deck, a ledge over the knee) is a wall on the low side; nowhere to stand is a wall too
Hn=np.nan_to_num(H,nan=-99)
for dj,di in ((0,1),(0,-1),(1,0),(-1,0)):
    nb=np.roll(np.roll(Hn,dj,0),di,1); BL|=(nb>Hn+KNEE)
BL|=np.isnan(H)
def rects(B):   # greedy: the widest runs, grown down while the run stays whole
    B=B.copy(); out=[]
    for j in range(B.shape[0]):
        i=0
        while i<B.shape[1]:
            if not B[j,i]: i+=1; continue
            e=i
            while e+1<B.shape[1] and B[j,e+1]: e+=1
            k=j
            while k+1<B.shape[0] and B[k+1,i:e+1].all(): k+=1
            B[j:k+1,i:e+1]=False; out.append([i,j,e+1,k+1]); i=e+1
    return out
SR=rects(BL); print('ground cells',NX,'x',NZ,'walls',len(SR))
Hq=np.nan_to_num(H,nan=float(np.nanmin(H))); y0=float(np.floor(Hq.min()*20)/20); Q=np.clip(np.round((Hq-y0)/.05),0,65535).astype(np.uint16)
pj=[{'key':p['key'],'x':p['x'],'z':p['z'],'y':p['y'],'hd':p['hd']} for p in people]
D={'v':1,'kit':KIT['kit'],'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files','bounds':[round(float(x),3) for x in (*lo,*hi)],
   'mesh':mesh,'glow':glow,'ground':{'x0':float(X0),'z0':float(Z0),'cs':CS,'nx':NX,'nz':NZ,'y0':y0,'dy':.05,'h':b64(Q)},
   'solid':b64(np.array(SR,np.uint16).reshape(-1)),'people':pj}
gc=[c for c in root['children'] if N[c]['name']=='skatepark-entrance-gateway'][0]; GM=WM[gc]; IG=np.linalg.inv(GM)
D['gate']={'x':round(GM[0,3],3),'y':round(GM[1,3],3),'z':round(GM[2,3],3),'hd':round(float(np.arctan2(GM[0,2],GM[2,2])),4)}
GP=[]; GC=[]
for P,C in prims(gc): GP.append(((np.c_[P,np.ones(len(P))]@IG.T)[:,:3]).reshape(-1,3,3)); GC.append(C.reshape(-1,3,3))
gate=pack(np.vstack(GP),np.vstack(GC)); gate.update(D['gate'])
json.dump(gate,open(os.path.join(os.path.dirname(OUT),'skategate.json'),'w'),separators=(',',':')); print('gate',gate['t'],'triangles at',D['gate'])
json.dump(D,open(OUT,'w'),separators=(',',':'))
print(OUT,round(os.path.getsize(OUT)/1e6,2),'MB,',sum(m['t'] for m in mesh),'still triangles in',len(mesh),'squares')
