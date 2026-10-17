# A PLAIN MODEL CUT DOWN (the items): python3 tools/mesh-cut.py <name> <model.glb> <triangles>; writes $BAKE/<name>/{v,f,col}.npy for item-bake.py
# step 1: each model loaded, its texture read onto its corners, cut down to N triangles, each face coloured from the corners near it; saved as npy
import sys,os,numpy as np,trimesh,fast_simplification
name,src,N=sys.argv[1],sys.argv[2],int(sys.argv[3]); out=os.environ.get('BAKE','bake')+'/'+name; os.makedirs(out,exist_ok=True)
s=trimesh.load(src,force='scene',process=False); g=list(s.geometry.values())[0]
V=np.asarray(g.vertices,float); F=np.asarray(g.faces)
try: VC=np.asarray(g.visual.to_color().vertex_colors)[:,:3].astype(float)
except Exception as e: print('no colour',e); VC=np.full((len(V),3),160.0)
# normalised: feet at y=0, 1 unit tall
V=V-V.min(0); h=V[:,1].max(); V=V/h; V[:,0]-=(V[:,0].max()+V[:,0].min())/2; V[:,2]-=(V[:,2].max()+V[:,2].min())/2
print(name,'tris',len(F),'height unit; width',V[:,0].max()-V[:,0].min(),'depth',V[:,2].max()-V[:,2].min())
v,f=fast_simplification.simplify(V.astype(np.float32),F.astype(np.int64),target_count=N)
v=np.asarray(v,float); f=np.asarray(f)
# colour: each original corner's colour averaged in small cubes; each new face takes the cubes at its middle and toward its corners
cs=0.012; key=np.floor(V/cs).astype(np.int64)+512; K=key[:,0]*1048576+key[:,1]*1024+key[:,2]
u,inv=np.unique(K,return_inverse=True); S=np.zeros((len(u),3)); np.add.at(S,inv,VC); M=S/np.bincount(inv,minlength=len(u))[:,None]
lut=dict(zip(u.tolist(),range(len(u))))
def col_at(P):
    k=np.floor(P/cs).astype(np.int64)+512; out=np.zeros((len(P),3)); got=np.zeros(len(P),bool)
    for r in range(4):
        for dx in range(-r,r+1):
            for dy in range(-r,r+1):
                for dz in range(-r,r+1):
                    if max(abs(dx),abs(dy),abs(dz))!=r: continue
                    kk=((k[:,0]+dx)*1048576+(k[:,1]+dy)*1024+(k[:,2]+dz)).tolist()
                    for i,q in enumerate(kk):
                        if got[i]: continue
                        j=lut.get(q)
                        if j is not None: out[i]=M[j]; got[i]=True
        if got.all(): break
    return out
P=v[f]; c=P.mean(1); samp=[c]+[c*.5+P[:,i]*.5 for i in range(3)]
col=np.mean([col_at(x) for x in samp],axis=0)
np.save(out+'/v.npy',v); np.save(out+'/f.npy',f); np.save(out+'/col.npy',col)
print(name,'done',len(f),'tris')
