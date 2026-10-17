# THE STREET'S CHARACTERS, STEP 1 (owner, 17 Oct 2026; npc-street.js): a furry model (Meshy AI, a million triangles of fur strands) remade as one clean
# skin. python3 tools/skin-bake.py <name> <model.glb> <triangles> <voxels tall> <samples>  (ghost 6000 110 6e6; cheetah 8000 120 1e7; grumpycat 8000 110 1e7).
# Writes $BAKE/<name>/{v,f,col,P,PC}.npy. Needs numpy, scipy, scikit-image, trimesh, fast-simplification.
# step 2 (the furry ones): the model remade as one clean skin: millions of points sampled over its surface dropped into a voxel grid, closed and
# filled, a smooth surface pulled off it (marching cubes), cut to N triangles, each face coloured from the points near it (small cubes of averaged colour)
import sys,os,numpy as np,fast_simplification,trimesh
from scipy import ndimage
from skimage import measure
name,src,N,RES,NS=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]); D=os.environ.get('BAKE','bake')+'/'+name+'/'
s=trimesh.load(src,force='scene',process=False); g=list(s.geometry.values())[0]
V0=np.asarray(g.vertices,float); F=np.asarray(g.faces); VC=np.asarray(g.visual.to_color().vertex_colors)[:,:3].astype(float)
lo0=V0.min(0); h=(V0[:,1].max()-V0[:,1].min()); V0=(V0-lo0)/h; V0[:,0]-=(V0[:,0].max()+V0[:,0].min())/2; V0[:,2]-=(V0[:,2].max()+V0[:,2].min())/2
m=trimesh.Trimesh(V0,F,process=False); P,fi=trimesh.sample.sample_surface(m,NS); P=np.asarray(P); C=VC[F[fi]].mean(1)
print(name,'sampled',len(P))
cell=1.0/RES; lo=P.min(0)-3*cell; dims=np.ceil((P.max(0)-lo)/cell).astype(int)+4
idx=np.floor((P-lo)/cell).astype(int); occ=np.zeros(dims,bool); occ[idx[:,0],idx[:,1],idx[:,2]]=True
occ=ndimage.binary_closing(occ,iterations=2); occ=ndimage.binary_fill_holes(occ)
lab,n=ndimage.label(occ); keep=np.argmax(np.bincount(lab.ravel())[1:])+1; occ=lab==keep   # (one body: specks off)
field=ndimage.gaussian_filter(occ.astype(float),0.8)
verts,faces,_,_=measure.marching_cubes(field,0.5); verts=verts*cell+lo
print(name,'grid',dims.tolist(),'surface tris',len(faces))
v,f=fast_simplification.simplify(verts.astype(np.float32),faces.astype(np.int64),target_count=N); v=np.asarray(v,float); f=np.asarray(f)
v[:,1]-=v[:,1].min()
cs=1.5*cell; key=np.floor(P/cs).astype(np.int64)+512; K=key[:,0]*1048576+key[:,1]*1024+key[:,2]
u,inv=np.unique(K,return_inverse=True); S=np.zeros((len(u),3)); np.add.at(S,inv,C); M=S/np.bincount(inv,minlength=len(u))[:,None]
lut=dict(zip(u.tolist(),range(len(u))))
def col_at(Q):
    k=np.floor(Q/cs).astype(np.int64)+512; out=np.zeros((len(Q),3)); got=np.zeros(len(Q),bool)
    for r in range(6):
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
T=v[f]; c=T.mean(1); samp=[c]+[c*.5+T[:,i]*.5 for i in range(3)]
col=np.mean([col_at(x) for x in samp],axis=0)
np.save(D+'v.npy',v); np.save(D+'f.npy',f); np.save(D+'col.npy',col); np.save(D+'P.npy',P[::20].astype(np.float32)); np.save(D+'PC.npy',C[::20].astype(np.uint8)); print(name,'done',len(f),'tris')
