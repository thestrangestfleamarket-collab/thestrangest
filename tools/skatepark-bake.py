# THE SKATE PARK (owner, 3 Nov 2026, his Drive's Polyfork skatepark kit: "its own place you go into, all of it, put it in central park, full size"):
# the kit's composed scene (scene.glb: 1267 placements of 60 parts, Y up, metres) baked whole into data/skatepark.json:
#   mesh   every still part in world metres, welded, its own vertex colours, cut into 16 m squares {lo,sc,p int16, c uint8, i uint32} per square
#   glow   the parts' lit zones (kit.json "night": a part's colour that lights up after dusk) as their own mesh, day and night colours
#   ground a height grid (0.25 m cells, 5 cm steps) of what you can stand on: the terrain, the tiles, decks, ledges under knee height, and the ramps and bowl
#          up their curves however steep (no step wall on or beside a ramp: they are ridden)
#   solid  the cells a body can't pass (walls, rises over the knee, posts, trees, buildings), merged to rectangles
#   rails  the grind lines [x0,y0,z0,x1,y1,z1,kind 0 rail 1 ledge 2 coping]
#   lamps  the floodlights' heads (the park's lights after dark)
#   board  the skaters' board (data/skateboard.json: the kit's cruiser, ridden by the board skaters)
#   rides  the scooter and the BMX (data/skaterides.json: ridden by the scooter kid and the BMX rider)
#   gate   where the entrance gateway stands (the park's height is measured from it)
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
GRIND={'steel-skate-rail':'rail','concrete-skate-ledge':'ledge','plywood-grind-box':'ledge','granite-plaza-block':'ledge','concrete-seat-wall-run':'ledge','skated-jersey-barrier':'ledge',
  'concrete-transition-module':'coping','plywood-ramp-module':'coping','galvanised-prefab-ramp':'coping','red-brick-bank':'coping','concrete-stair-set':'coping'}   # what you can grind or slide
RAMPS={'concrete-transition-module','plywood-ramp-module','galvanised-prefab-ramp','asphalt-pump-track-section','red-brick-bank','concrete-skate-bump'}   # ridden up their curves: ground however steep
LOOSE={'energy-drink-can','spray-paint-can','roller-skate','protective-pad','skate-helmet','wheel-scuff-decal','graffiti-wall-decal','pavement-crack-weed','fisheye-camcorder','cruiser-and-longboard'}
GLOW={}
for z in KIT['night']:
    for p in z['parts']: GLOW.setdefault(p,[]).append((np.array([int(z['from'][k:k+2],16)/255 for k in (1,3,5)])**2.2,np.array([int(z['to'][k:k+2],16)/255 for k in (1,3,5)]),z['intensity']))
root=N[g['scenes'][0]['nodes'][0]]
# HALF THE PARK (owner, 3 Nov 2026: "lets make the park 50% smaller, lose any duplicate spots"; his picks: half the area at full size, one of each kind):
# the kept placements (by their order in the scene) moved as whole features onto one level; the rest dropped; the kit's terrain dropped and the
# floor re-tiled under the new footprint. KEEP: placement -> (dx, dz, dy) in metres; a feature moves by whole 2 m tiles so the floor's grid meets it.
KEEP={}
def keep(ix,dx,dz,dy=0.):
    for i in ix: KEEP[i]=(dx,dz,dy)
keep([1203,*range(1204,1213),1213,1214],-4,-10)                                                  # the gate, its fence, banner and rules board
keep([*range(1180,1187),1187,1188,1189,1246,1247],-6,-4)                                         # the pump track, its bike stand, scooter, BMX, rider and kid
keep([*range(1139,1159),1190,1191,1192,1193,1256,1237,1238,1239,1240,1258,1260],-8,-2)           # the vert ramp on its decks; the shade sail, seats, kiosk, filmer, roller skater
keep([1115,1116,1117,1119,1263,1264,1265],12,-2)                                                 # the skate shop, its van, owner, longboarder
keep([1088,1091,1099,1100,1101,1105,1106],2,0)                                                   # one hall bay and its mini ramp
keep([1114],-18,-4)                                                                              # the wallride
keep([*range(1021,1028)],8,-2); keep([1015],16,-2)                                               # the terrace funbox (transitions, stairs, rail), one brick bank
keep([*range(1038,1046),1233],-2,4,-1.2)                                                         # the bowl and the pool veteran
keep([1046,1215,1231],2,-2,-1.2)                                                                 # the clubhouse, a floodlight, a tree
keep([1063,1064,1066,1067,1068,1069,1071,1079,1081,1249,1086],8,8,-1.2)                          # one overpass span, a full pipe, the graffiti artist
KEEP[1072]=(3,1.5,-1.2)                                                                          # one jersey barrier
KEEP[1216]=(-26.5,-17,-1.2); KEEP[1217]=(1.5,16,0); KEEP[1218]=(-9.9,9.4,0)   # the floodlights: four columns (owner, 3 Nov 2026: "Bring back 4 columns"), lit after dark
keep([1123],9,5.5); keep([1122],16,9.5); keep([1125],2,13.5); keep([1131],2,12); keep([1137],-4,4)   # one ledge, rail, granite block, grind box, bump
keep([1177],-32,-26); keep([1135,1136],0,-13); keep([1232],5.3,8.2); keep([1241,1242,1243],0,0); keep([1037],1,1.4)
keep([1049],31.8,24.2,-1.65)                                                                     # the filmer's camcorder, at his feet
KIDS=[c for c in root['children']]; TILE0=next(i for i,c in enumerate(KIDS) if N[c]['name'].startswith('skate-slab-tile') and abs(WM[c][1,3])<.01)
NOFLOOR={'concrete-transition-module','asphalt-pump-track-section','plywood-ramp-module','composite-deck-tile','skate-hall-bay','skatepark-clubhouse','skate-shop','container-snack-kiosk',
  'overpass-pier','concrete-full-pipe','red-brick-bank','concrete-stair-set','galvanised-prefab-ramp','concrete-skate-bump','wallride-wall'}
BIG={'skate-shop','skatepark-clubhouse','skate-hall-bay','container-snack-kiosk'}   # the park's buildings (owner, 7 Nov 2026: "increase the overall size of all polyfork buildings by 25%")
FOOT=(-24,-34,24,34)   # the new footprint, x0 z0 x1 z1
TP,TC,TG,TK,TN=[],[],[],[],[]   # triangle corners, colours, glow night colour (or nan), part kind (0 terrain, 1 solid part, 2 loose), night strength
people=[]; ITEMS=[]; RAILS=[]; COVER={}   # floor cells a part covers from above: True when the part is sunk (no tile there)
SLAB=prims(KIDS[TILE0]); S0=WM[KIDS[TILE0]][:3,3]; boxes=[]; ci=0; chars=0
def placed():   # the kept placements with their moves, then the new floor's tiles (copies of one slab tile)
    global chars
    for i,c in enumerate(KIDS):
        nm=N[c]['name']; k=part(nm); ch=KIT['classes'].get(k)=='character'
        if ch: chars+=1
        if i in KEEP: yield c,nm,k,KEEP[i],(chars-1 if ch else None)
for c,nm,k,(dx,dz,dy),bi in list(placed()):
    if bi is not None:
        M=WM[c]; people.append({'key':k,'b':bi,'x':round(M[0,3]+dx,3),'y':round(M[1,3]+dy,3),'z':round(M[2,3]+dz,3),'hd':round(float(np.arctan2(M[0,2],M[2,2])),3)}); continue
    o=WM[c][:3,3]; sc=1.25 if k in BIG else 1.   # (the buildings 25% over the kit's size, grown from where each stands)
    pr=[(o+(P-o)*sc+np.array([dx,dy,dz]),C) for P,C in prims(c)]
    if k in GRIND:   # its grind lines: a rail's top centre, a ledge's or box's two long top edges, a ramp's coping (the top edge over its high side)
        IW=np.linalg.inv(WM[c]); L=np.vstack([(np.c_[P-np.array([dx,dy,dz]),np.ones(len(P))]@IW.T)[:,:3] for P,C in pr]); lo_,hi_=L.min(0),L.max(0); top=hi_[1]
        ax=0 if hi_[0]-lo_[0]>=hi_[2]-lo_[2] else 2; ox=2-ax; segs=[]
        def side(a,v): m=np.abs(L[:,a]-v)<.15; return L[m,1].max() if m.any() else 0
        if GRIND[k]=='rail': segs=[(lo_[ox]+hi_[ox])/2]
        elif GRIND[k]=='ledge': segs=[lo_[ox],hi_[ox]]
        else:
            T_=L[L[:,1]>top-.03]
            for a in (0,2):   # a coping is where the flat top stops short of a side whose face stays low: the lip over the curve
                t0,t1=T_[:,a].min(),T_[:,a].max()
                if t1<hi_[a]-.3 and side(a,hi_[a])<top*.5 and hi_[2-a]-lo_[2-a]>=.9: segs.append((a,t1))
                if t0>lo_[a]+.3 and side(a,lo_[a])<top*.5 and hi_[2-a]-lo_[2-a]>=.9: segs.append((a,t0))
        for sg in segs:
            a_,v=(ax,sg) if not isinstance(sg,tuple) else (2-sg[0],sg[1])
            o=2-a_; e0=np.zeros(3); e1=np.zeros(3); e0[1]=e1[1]=top; e0[a_]=lo_[a_]; e1[a_]=hi_[a_]; e0[o]=e1[o]=v
            if not isinstance(sg,tuple): pass
            else: e0[2-a_]=e1[2-a_]=v; e0[a_]=lo_[a_]; e1[a_]=hi_[a_]
            W0=(WM[c]@np.r_[e0,1])[:3]+[dx,dy,dz]; W1=(WM[c]@np.r_[e1,1])[:3]+[dx,dy,dz]
            if np.linalg.norm(W1-W0)>=.9: RAILS.append([round(float(q),3) for q in (*W0,*W1)]+[{'rail':0,'ledge':1,'coping':2}[GRIND[k]]])
    if k in NOFLOOR:
        Q=np.vstack([P for P,C in pr]); boxes.append((Q[:,0].min(),Q[:,2].min(),Q[:,0].max(),Q[:,2].max(),Q[:,1].min(),(dx,dz,dy)))
        for P,C in pr:
            T=P.reshape(-1,3,3); nn=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]); T=T[np.abs(nn[:,1])>.2*np.linalg.norm(nn,axis=1)]
            for t in T:   # the floor's 2 m cells whose middle this part covers from above
                a_,b_,c_=t[:,[0,2]]; d=(b_[1]-c_[1])*(a_[0]-c_[0])+(c_[0]-b_[0])*(a_[1]-c_[1])
                if abs(d)<1e-9: continue
                for x in np.arange(np.floor((t[:,0].min()-1)/2)*2+1,t[:,0].max()+1,2.):
                    for z in np.arange(np.floor((t[:,2].min()-1)/2)*2+1,t[:,2].max()+1,2.):
                        l1=((b_[1]-c_[1])*(x-c_[0])+(c_[0]-b_[0])*(z-c_[1]))/d; l2=((c_[1]-a_[1])*(x-c_[0])+(a_[0]-c_[0])*(z-c_[1]))/d
                        if l1>=-1e-6 and l2>=-1e-6 and 1-l1-l2>=-1e-6: COVER[(round(x),round(z))]=COVER.get((round(x),round(z)),False) or Q[:,1].min()<-.5
    ITEMS.append((nm,k,pr))
SUNK={}   # a sunken feature (the bowl): its whole box, and how deep; an uncovered cell inside it is floored at its bottom
for b in boxes:
    if b[4]<-.5: q=SUNK.setdefault(b[5],[1e9,1e9,-1e9,-1e9,0]); q[:]=[min(q[0],b[0]),min(q[1],b[1]),max(q[2],b[2]),max(q[3],b[3]),min(q[4],b[4])]
for x in np.arange(FOOT[0]+1,FOOT[2],2.):
    for z in np.arange(FOOT[1]+1,FOOT[3],2.):
        cv=COVER.get((round(x),round(z)))
        if cv: continue
        y=next((q[4]-.05 for q in SUNK.values() if q[0]<x<q[2] and q[1]<z<q[3]),-.03 if cv is False else 0.)   # under a part a tile sits 3 cm low, never flush with its base
        ITEMS.append(('skate-slab-tile','skate-slab-tile',[(P+np.array([x-S0[0],y-S0[1],z-S0[2]]),C) for P,C in SLAB]))
LAMPS=[]   # each floodlight's head: the middle of its top half metre
for nm,k,pr in ITEMS:
    if k=='skatepark-floodlight-column': Q=np.vstack([P for P,C in pr]); top=Q[Q[:,1]>Q[:,1].max()-.6]; LAMPS.append([round(float(v),3) for v in top.mean(0)])
for nm,k,pr in ITEMS:
    kind=0 if k=='skatepark-terrain' else 2 if k in LOOSE else 5 if k in RAMPS else 1
    for P,C in pr:
        if k in TILES:   # a floor tile drawn as its top on a flat 2 m underlay of its edge colour (its bevels read as heavy seams from above, and were half the park's triangles); stood on whole
            T=P.reshape(-1,3,3); Cq=C.reshape(-1,3,3); n0=len(T); TP.append(T); TC.append(Cq); TK.append(np.full(n0,3,np.int8)); TG.append(np.full((n0,3),np.nan)); TN.append(np.zeros(n0))
            nn=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]); ny_=nn[:,1]/np.maximum(np.linalg.norm(nn,axis=1),1e-12); top=T[:,:,1].max(); m=(ny_>.9)&(T[:,:,1].min(1)>top-.012)
            x0,z0=T.reshape(-1,3)[:,[0,2]].min(0); x1,z1=T.reshape(-1,3)[:,[0,2]].max(0); y=top-.006; ec=Cq[~m].reshape(-1,3).mean(0) if (~m).any() else Cq.reshape(-1,3).mean(0)
            U=np.array([[[x0,y,z0],[x1,y,z1],[x1,y,z0]],[[x0,y,z0],[x0,y,z1],[x1,y,z1]]]); P=np.vstack([T[m],U]).reshape(-1,3); C=np.vstack([Cq[m],np.tile(ec,(2,3,1))]).reshape(-1,3); kind=4
        n=len(P)//3; TP.append(P.reshape(n,3,3)); TC.append(C.reshape(n,3,3)); TK.append(np.full(n,kind,np.int8)); kind=0 if k=='skatepark-terrain' else 2 if k in LOOSE else 5 if k in RAMPS else 1
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
RUP=.15; walk=np.nonzero((((TK==1)|(TK==3))&(ny>=UPN))|((TK==5)&(ny>=RUP)))[0]
for t in walk:
    i,j,y=cover(TP[t],False); ok=y-np.nan_to_num(TER[j,i],nan=0.)<CAP; np.maximum.at(H,(j[ok],i[ok]),y[ok])
H[np.isinf(H)]=np.nan
for t in np.nonzero((((TK==1)|(TK==3))&(ny<UPN))|((TK==5)&(ny<RUP)))[0]:
    i,j,y=cover(TP[t],True); h=H[j,i]; m=~np.isnan(h)&(y>h+KNEE)&(y<h+BODY); BL[j[m],i[m]]=True
# a top too high above its neighbour (a deck, a ledge over the knee) is a wall on the low side; nowhere to stand is a wall too
RC=np.zeros((NZ,NX),bool)
for t in np.nonzero((TK==5)&(ny>=RUP))[0]:
    i,j,y=cover(TP[t],False); RC[j,i]=True
Hn=np.nan_to_num(H,nan=-99)
for dj,di in ((0,1),(0,-1),(1,0),(-1,0)):
    nb=np.roll(np.roll(Hn,dj,0),di,1); nr=np.roll(np.roll(RC,dj,0),di,1); BL|=(nb>Hn+KNEE)&~RC&~nr
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
def lip(r):   # a coping has its deck on one side (at its height) and a drop on the other
    x0,y0,z0,x1,y1,z1=r[:6]; dx,dz=x1-x0,z1-z0; l=np.hypot(dx,dz); nx,nz=-dz/l,dx/l; hs=[]
    for sg in (-1,1):
        v=[]
        for t in (.25,.5,.75):
            px,pz=x0+dx*t+nx*sg*.45,z0+dz*t+nz*sg*.45; i,j=int((px-X0)/CS),int((pz-Z0)/CS)
            if 0<=i<NX and 0<=j<NZ and not np.isnan(H[j,i]): v.append(H[j,i])
        hs.append(np.median(v) if v else -99)
    return max(hs)>y0-.15 and min(hs)<y0-.3
RAILS=[r for r in RAILS if r[6]!=2 or lip(r)]
SR=rects(BL); print('ground cells',NX,'x',NZ,'walls',len(SR))
Hq=np.nan_to_num(H,nan=float(np.nanmin(H))); y0=float(np.floor(Hq.min()*20)/20); Q=np.clip(np.round((Hq-y0)/.05),0,65535).astype(np.uint16)
pj=[{'key':p['key'],'b':p['b'],'x':p['x'],'z':p['z'],'y':p['y'],'hd':p['hd']} for p in people]
D={'v':1,'kit':KIT['kit'],'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files','bounds':[round(float(x),3) for x in (*lo,*hi)],
   'mesh':mesh,'glow':glow,'ground':{'x0':float(X0),'z0':float(Z0),'cs':CS,'nx':NX,'nz':NZ,'y0':y0,'dy':.05,'h':b64(Q)},
   'solid':b64(np.array(SR,np.uint16).reshape(-1)),'people':pj,'lamps':LAMPS,'rails':RAILS}
gc=[c for c in root['children'] if N[c]['name']=='skatepark-entrance-gateway'][0]; GM=WM[gc].copy(); GM[0,3]+=KEEP[KIDS.index(gc)][0]; GM[2,3]+=KEEP[KIDS.index(gc)][1]
D['gate']={'x':round(GM[0,3],3),'y':round(GM[1,3],3),'z':round(GM[2,3],3),'hd':round(float(np.arctan2(GM[0,2],GM[2,2])),4)}
bc=KIDS[1265]; IB=np.linalg.inv(WM[bc]); BP=[]; BC=[]   # the skaters' board (the kit's cruiser): its own frame, along z, wheels on y=0
for P,C in prims(bc): BP.append((np.c_[P,np.ones(len(P))]@IB.T)[:,:3].reshape(-1,3,3)); BC.append(C.reshape(-1,3,3))
BP=np.vstack(BP); BP[:,:,1]-=BP[:,:,1].min(); board=pack(BP,np.vstack(BC)); board['top']=round(float(BP[:,:,1].max()),3)
json.dump(board,open(os.path.join(os.path.dirname(OUT),'skateboard.json'),'w'),separators=(',',':'));
RIDES={}   # the scooter kid's scooter and the BMX rider's bike (the kit's own, parked in the park): each in metres, its front along +z, wheels on y=0
for nm,ix in (('scooter',1187),('bmx',1189)):
    c=KIDS[ix]; IB=np.linalg.inv(WM[c]); VP=[]; VC=[]
    for P,C in prims(c): VP.append((np.c_[P,np.ones(len(P))]@IB.T)[:,:3].reshape(-1,3,3)); VC.append(C.reshape(-1,3,3))
    VP=np.vstack(VP); VP[:,:,1]-=VP[:,:,1].min(); RIDES[nm]=pack(VP,np.vstack(VC))
json.dump(RIDES,open(os.path.join(os.path.dirname(OUT),'skaterides.json'),'w'),separators=(',',':')); print('rides',{k:v['t'] for k,v in RIDES.items()})
print('board',board['t'],'triangles, deck top',board['top'])
json.dump(D,open(OUT,'w'),separators=(',',':'))
print(OUT,round(os.path.getsize(OUT)/1e6,2),'MB,',sum(m['t'] for m in mesh),'still triangles in',len(mesh),'squares')
