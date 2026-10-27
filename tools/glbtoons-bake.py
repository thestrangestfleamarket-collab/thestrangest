# THE OWNER'S TOONS FROM .GLB (owner, 20 Oct 2026, ten .glb files: "lets add these to the game"): characters exported from the game's own
# RIGNPC rig (each bone's extras.at is its rest point, no rotations), skinned with weights, linear vertex colours; and still things (no skin).
# Each character: bones [name,parent,at], one indexed mesh (points as SKIN.pts reads them, sRGB colours, 4 joints and weights a point) and,
# for a see-through second mesh (the rain fish's bowl), `glass` (its points, colour, opacity, the bone it rides on).
# A still thing: its meshes, each with sRGB colours and whether it glows (emissive), its feet at 0, in the file's units.
# A textured mesh with no skin (a Tripo scan, e.g. the teddy, 27 Oct 2026): cut to `key=file.glb:tris:NAME`, its texture averaged into the colours,
# split into its layers if LAYERS names it, rigged on the biped bones below (measured off the teddy, height 1) with weights spread over the surface. An existing out.json is added to.
# Run: python3 tools/glbtoons-bake.py out.json key=file.glb[:tris:NAME] [key=file.glb ...]   (the scan needs pillow, fast-simplification)
import sys, os, io, json, struct, base64, numpy as np
out=sys.argv[1]; args=sys.argv[2:]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    x=np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
    if a.get('normalized'): x=x/float(np.iinfo(ct).max)
    return x
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
srgb=lambda c:np.where(c<=.0031308,c*12.92,1.055*np.power(np.clip(c,0,1),1/2.4)-.055)
def pts(P):
    lo=P.min(0); sc=max(float((P.max(0)-lo).max())/65000,1e-6); q=np.round((P-lo)/sc-32500).astype(np.int16)
    return {'p':b64(q),'lo':[round(float(v),5) for v in lo],'sc':sc}
def trs(n):
    t=np.array(n.get('translation',[0,0,0]),float); q=np.array(n.get('rotation',[0,0,0,1]),float); s=np.array(n.get('scale',[1,1,1]),float)
    x,y,z,w=q; R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M=np.eye(4); M[:3,:3]=R*s; M[:3,3]=t; return M
def char(j,b):
    N=j['nodes']; par={c:i for i,n in enumerate(N) for c in n.get('children',[])}; sk=j['skins'][0]; J=sk['joints']; JS=set(J)
    order=[]
    def walk(i):
        if i in JS: order.append(i)
        for c in N[i].get('children',[]): walk(c)
    for r in j['scenes'][0]['nodes']: walk(r)
    IBM=acc(j,b,sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    at={i:(N[i].get('extras',{}).get('at') or (-IBM[k][:3,3]).tolist()) for k,i in enumerate(J)}
    bones=[[N[i]['name'],N[par[i]]['name'] if par.get(i) in JS else None,[round(float(v),4) for v in at[i]]] for i in order]
    BI={i:k for k,i in enumerate(order)}
    root=[i for i in j['scenes'][0]['nodes']][0]; ch={'name':N[root].get('name','')}
    for mi,n in enumerate(N):
        if 'mesh' not in n: continue
        sj=j['skins'][n.get('skin',0)]['joints']; remap=np.array([BI[i] for i in sj],np.uint8)
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; P=acc(j,b,A['POSITION']).astype(np.float64); C=acc(j,b,A['COLOR_0']).astype(np.float64); I=acc(j,b,p['indices']).reshape(-1).astype(np.uint16)
            mat=j['materials'][p.get('material',0)]
            if mat.get('alphaMode')=='BLEND':
                JJ=acc(j,b,A['JOINTS_0']).astype(int); bone=order[int(np.bincount(remap[JJ[:,0]]).argmax())]
                ch['glass']={**pts(P),'c':[round(float(v),3) for v in srgb(C[:,:3].mean(0))],'a':round(float(C[:,3].mean()) if C.shape[1]>3 else .35,3),'i':b64(I),'bone':N[bone]['name']}
                continue
            JJ=remap[acc(j,b,A['JOINTS_0']).astype(int)]; W=acc(j,b,A['WEIGHTS_0']).astype(np.float64); W=W/W.sum(1,keepdims=True)
            Wq=np.round(W*255).astype(int); Wq[np.arange(len(Wq)),Wq.argmax(1)]+=255-Wq.sum(1); JJ[Wq==0]=0
            ch.update(pts(P)); ch.update({'c':b64(np.round(srgb(C[:,:3])*255).astype(np.uint8)),'i':b64(I),'j':b64(JJ.astype(np.uint8)),'w':b64(Wq.astype(np.uint8)),'tris':len(I)//3})
    ch['bones']=bones; return ch
def still(j,b):
    N=j['nodes']; par={c:i for i,n in enumerate(N) for c in n.get('children',[])}; G={}
    def gm(i):
        if i not in G: G[i]=(gm(par[i])@trs(N[i])) if i in par else trs(N[i])
        return G[i]
    meshes=[]; lo=None
    for i,n in enumerate(N):
        if 'mesh' not in n: continue
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; P=acc(j,b,A['POSITION']).astype(np.float64); M=gm(i); P=P@M[:3,:3].T+M[:3,3]
            C=acc(j,b,A['COLOR_0'])[:,:3].astype(np.float64); I=acc(j,b,p['indices']).reshape(-1).astype(np.uint32) if 'indices' in p else np.arange(len(P),dtype=np.uint32)
            mat=j['materials'][p.get('material',0)]; meshes.append({'name':n.get('name',''),'P':P,'c':b64(np.round(srgb(C)*255).astype(np.uint8)),'i':b64(I.astype(np.uint16)),'glow':1 if mat.get('emissiveFactor') else 0,'tris':len(I)//3})
    y0=min(m['P'][:,1].min() for m in meshes)
    for m in meshes: m['P'][:,1]-=y0; m.update(pts(m.pop('P')))
    return {'meshes':meshes}
BIPED=[['root',None,0,0,0],['hips','root',0,.33,0],['chest','hips',0,.55,0],['head','chest',0,.74,0],['earL','head',-.12,.92,0],['earR','head',.12,.92,0],
    ['armL','chest',-.19,.66,0],['elbowL','armL',-.23,.5,0],['handL','elbowL',-.24,.37,.01],['armR','chest',.19,.66,0],['elbowR','armR',.23,.5,0],['handR','elbowR',.24,.37,.01],
    ['legL','hips',-.07,.3,0],['kneeL','legL',-.07,.15,0],['footL','kneeL',-.07,.04,0],['legR','hips',.07,.3,0],['kneeR','legR',.07,.15,0],['footR','kneeR',.07,.04,0]]
def teddy(x,y,z,C):   # the teddy's layers (owner, 27 Oct 2026): bear (head, paws, feet), jacket, shirt, pants; measured off his scan, height 1
    from scipy.spatial import Delaunay
    ax=np.abs(x); r,g,b=C.T; L=np.full(len(x),1); blue=(b>r+12)&(ax<.14)&(y>.4)&(y<.76)&(z>0); bl=np.c_[x[blue],y[blue]]
    L[(Delaunay(bl[np.random.default_rng(0).choice(len(bl),min(4000,len(bl)),replace=False)]).find_simplex(np.c_[x,y])>=0)&(z>.02)&(ax<.13)]=2
    L[(y<.44)&(ax<.11)&(z>.03)&(C.mean(1)<110)]=3; L[(y<.31)&(ax<.17)]=3
    L[(((x/.17)**2+((y-.87)/.125)**2+((z+.02)/.16)**2)<1)|(y>.84)|(y<.06)|((y<.37)&(ax>.18))]=0
    return L
LAYERS={'teddy':(teddy,[['bear',.38,0,0,500],['jacket',.37,1,2,900],['shirt',.1,1,1,0],['pants',.15,0,1,400]],0)}   # each layer: name, share of the triangles, grown (+) or shrunk (-) by a voxel, rank (a higher layer shades the ones under it), fur strands; the fur colour every layer but the shirt takes
def scan(j,b,tris,nm,key):
    import fast_simplification as FS; from PIL import Image; from scipy import ndimage as ND; from scipy.spatial import cKDTree; from skimage.measure import marching_cubes
    p=j['meshes'][0]['primitives'][0]; A=p['attributes']; P0=acc(j,b,A['POSITION']).astype(float); UV=acc(j,b,A['TEXCOORD_0'])
    t=j['textures'][j['materials'][p.get('material',0)]['pbrMetallicRoughness']['baseColorTexture']['index']]; bv=j['bufferViews'][j['images'][t['source']]['bufferView']]; o=bv.get('byteOffset',0)
    T=np.asarray(Image.open(io.BytesIO(b[o:o+bv['byteLength']])).convert('RGB')); h,w=T.shape[:2]
    C0=T[np.clip((UV[:,1]*h).astype(int),0,h-1),np.clip((UV[:,0]*w).astype(int),0,w-1)].astype(float)
    H0=P0[:,1].max()-P0[:,1].min(); cx=(P0[:,0].max()+P0[:,0].min())/2
    split,lay,fur=LAYERS.get(key,(None,[['body',1,0,0,0]],None)); L0=split((P0[:,0]-cx)/H0,(P0[:,1]-P0[:,1].min())/H0,P0[:,2]/H0,C0) if split else np.zeros(len(P0),int)
    # the scan is hundreds of loose fur shells: each layer filled as voxels, its skin re-cut as one closed surface, then simplified
    lo=P0.min(0); vx=(P0.max(0)-lo).max()/180; Ps,Is,Cs,Ss,parts=[],[],[],[],[]; n0=0; rng=np.random.default_rng(7)
    for li,(ln,share,grow,rank,hairs) in enumerate(lay):
        Q=P0[L0==li]; G=np.zeros(tuple(((P0.max(0)-lo)/vx).astype(int)+7),bool); G[tuple(((Q-lo)/vx).astype(int).T+3)]=True
        G=ND.binary_fill_holes(ND.binary_dilation(G,iterations=2)); er=2-grow-(1 if split else 0)
        if er>0: G=ND.binary_erosion(G,iterations=er,border_value=0)
        V,F,_,_=marching_cubes(ND.gaussian_filter(G.astype(float),1),.5); V=(V-3)*vx+lo; F=F[:,::-1]
        v,f=FS.simplify(V.astype(np.float32),F.astype(np.int32),target_reduction=max(0,1-tris*share/len(F))); v=v.astype(float)
        _,first,inv=np.unique(np.round(v/vx*64),axis=0,return_index=True,return_inverse=True); v=v[first]; f=inv.reshape(-1)[f]; f=f[(f[:,0]!=f[:,1])&(f[:,1]!=f[:,2])&(f[:,0]!=f[:,2])]
        d,nb=cKDTree(P0[L0==li]).query(v,8); wt=1/(d+vx*.2); c=(C0[L0==li][nb]*wt[...,None]).sum(1)/wt.sum(1)[:,None]
        sv=np.arange(len(v))
        if hairs:   # fur in shape (as the coat bear's, 20 Oct 2026): the skin pushed out by fine noise along its normal, and short flat strands lying outward and down
            nf=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]]); nv=np.zeros_like(v); np.add.at(nv,f.reshape(-1),np.repeat(nf,3,0)); nv/=np.linalg.norm(nv,axis=1,keepdims=True)+1e-12
            v=v+nv*rng.uniform(-.5,1,(len(v),1))*H0*.006
            ar=np.linalg.norm(nf,axis=1); fi=rng.choice(len(f),hairs,p=ar/ar.sum()); u=rng.random((hairs,2)); u=np.where(u.sum(1,keepdims=True)>1,1-u,u)
            a,b2,c2=v[f[fi,0]],v[f[fi,1]],v[f[fi,2]]; base=a+(b2-a)*u[:,:1]+(c2-a)*u[:,1:]; n=nf[fi]/(ar[fi][:,None]+1e-12)
            side=np.cross(n,[0,1,0]); side/=np.linalg.norm(side,axis=1,keepdims=True)+1e-9; side[np.linalg.norm(side,axis=1)<.5]=[1,0,0]
            ln_=H0*rng.uniform(.022,.04,(hairs,1)); tip=base+n*ln_*.7+np.array([0,-1,0])*ln_*.6+rng.normal(0,.3,(hairs,3))*ln_*.3; wd=side*H0*.008
            hv=np.stack([base-wd,base+wd,tip],1).reshape(-1,3); src=f[fi,0]; hc=np.repeat(c[src],3,0)*np.tile([1,1,1.18],hairs)[:,None]*rng.uniform(.85,1.1,(hairs*3,1))
            hf=len(v)+np.arange(hairs*3).reshape(-1,3); sv=np.concatenate([sv,np.repeat(src,3)]); v=np.concatenate([v,hv]); f=np.concatenate([f,hf]); c=np.clip(np.concatenate([c,hc]),0,255)
        Ps.append(v); Is.append(f+n0); Cs.append(c); Ss.append(sv+n0); parts.append([ln,n0,len(v),rank]); n0+=len(v)
    if fur is not None:
        m=Cs[fur].mean(0)
        for k,(ln,*_) in enumerate(lay):
            if ln!='shirt': Cs[k]=np.clip(Cs[k]-Cs[k].mean(0)+m,0,255)
    P=np.concatenate(Ps); I=np.concatenate(Is); C=np.concatenate(Cs); SRC=np.concatenate(Ss)
    P=P.astype(float); P[:,1]-=P[:,1].min(); P[:,0]-=(P[:,0].max()+P[:,0].min())/2; H=P[:,1].max(); x,y,ax=P[:,0]/H,P[:,1]/H,np.abs(P[:,0]/H)
    name=[q[0] for q in BIPED]; K=lambda n:name.index(n); s=np.where(x<0,'L','R'); B=np.full(len(P),K('chest'))
    B=np.where(y<.45,K('hips'),B)
    leg=(y<.3)&(ax<.17); B=np.where(leg,np.where(y<.08,[K('foot'+e) for e in s],np.where(y<.2,[K('knee'+e) for e in s],[K('leg'+e) for e in s])),B)
    arm=(ax>.18)&(y>.26)&(y<.68); B=np.where(arm,np.where(y<.42,[K('hand'+e) for e in s],np.where(y<.56,[K('elbow'+e) for e in s],[K('arm'+e) for e in s])),B)
    B=np.where(y>.74,K('head'),B); B=np.where((y>.88)&(ax>.08),[K('ear'+e) for e in s],B)
    W=np.zeros((len(P),len(BIPED))); W[np.arange(len(P)),B]=1
    E=np.concatenate([I[:,[0,1]],I[:,[1,2]],I[:,[2,0]]]); E=np.concatenate([E,E[:,::-1]]); deg=np.bincount(E[:,0],minlength=len(P))+1
    for _ in range(6): S=W.copy(); np.add.at(S,E[:,0],W[E[:,1]]); W=S/deg[:,None]
    W=W[SRC]
    jj=np.argsort(-W,1)[:,:4]; ww=np.take_along_axis(W,jj,1); ww/=ww.sum(1,keepdims=True); Wq=np.round(ww*255).astype(int); Wq[:,0]+=255-Wq.sum(1); jj[Wq==0]=0
    ch={'name':nm}; ch.update(pts(P/H))
    if len(parts)>1: ch['parts']=parts; ch.update({'c':b64(np.round(C).astype(np.uint8)),'i':b64(I.reshape(-1).astype(np.uint16)),'j':b64(jj.astype(np.uint8)),'w':b64(Wq.astype(np.uint8)),'tris':len(I),
        'bones':[[q[0],q[1],[q[2],q[3],q[4]]] for q in BIPED]}); return ch
D=json.load(open(out)) if os.path.exists(out) else {'chars':{},'still':{}}
for a in args:
    k,f=a.split('=',1); f,tris,nm=(f.split(':')+['5000',k.upper()])[:3]; j,b=glb(f)
    if not j.get('skins') and j.get('textures'): D['chars'][k]=scan(j,b,int(tris),nm,k); print(k,'scan',D['chars'][k]['tris'],'tris')
    elif j.get('skins'): D['chars'][k]=char(j,b); print(k,D['chars'][k]['name'],D['chars'][k]['tris'],'tris',len(D['chars'][k]['bones']),'bones','+glass' if 'glass' in D['chars'][k] else '')
    else: D['still'][k]=still(j,b); print(k,'still',sum(m['tris'] for m in D['still'][k]['meshes']),'tris',[m['name'] for m in D['still'][k]['meshes']])
json.dump(D,open(out,'w'),separators=(',',':')); print(out)
