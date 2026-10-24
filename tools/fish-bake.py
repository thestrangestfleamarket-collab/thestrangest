# THE FISH (owner, 24 Oct 2026, his Cute Fish Pack): the raw rest geometry from tools/fish-extract.cjs simplified to a few hundred triangles,
# centred, turned so the fish swims along +X (as the river's shoal does) with +Y up, and scaled to unit length, then packed flat-coloured into
# data/fish.json for src/066-river.js (the originals in data/full/fish.json). Colours are each part's flat material colour, kept as props-bake
# keeps them. Run: node tools/fish-extract.cjs <FBX dir> /tmp/fish-raw.json <Names...> && python3 tools/fish-bake.py /tmp/fish-raw.json
import sys, json, base64, os, numpy as np, fast_simplification as FS
RAW=sys.argv[1] if len(sys.argv)>1 else '/tmp/fish-raw.json'
TARGET=300   # triangles per fish, kept low: these are background shoal fish
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def nearest(src,dst):
    j=np.empty(len(dst),np.int64)
    for a in range(0,len(dst),256): j[a:a+256]=((dst[a:a+256,None,:]-src[None])**2).sum(2).argmin(1)
    return j
def weld(P,F,tol):   # merge coincident corners (the pack ships each part unwelded) so the surface decimates cleanly
    key=np.round(P/tol).astype(np.int64); uniq,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1)
    Pw=np.zeros((len(uniq),3)); cnt=np.zeros(len(uniq)); np.add.at(Pw,inv,P); np.add.at(cnt,inv,1); Pw/=cnt[:,None]
    Fw=inv[F]; good=(Fw[:,0]!=Fw[:,1])&(Fw[:,1]!=Fw[:,2])&(Fw[:,0]!=Fw[:,2]); return Pw,Fw[good]
R=json.load(open(RAW)); OUT={}; FULL={}
for key,D in R.items():
    P=np.array(D['P'],np.float32).reshape(-1,3); C=np.array(D['C'],np.uint8).reshape(-1,3); F=np.array(D['I'],np.int64).reshape(-1,3)
    # turn length onto +X (nose forward, as the shoal swims), keep Y up:  x'=-z, z'=x
    P=np.stack([-P[:,2],P[:,1],P[:,0]],1)
    tris=len(F)
    def pack(P,C,F):
        lo=P.min(0); hi=P.max(0); ctr=(lo+hi)/2; L=hi[0]-lo[0] or 1.0   # centre, scale to unit length along X
        Q=((P-ctr)/L).astype(np.float32)
        tri=Q[F].reshape(-1,3); col=C[F].reshape(-1,3)   # flat soup, a colour a corner
        return {'p':b64(tri.reshape(-1).astype(np.float32)),'c':b64(np.clip(col,0,255).astype(np.uint8)),'tris':len(tri)//3,
                'len':float(round(hi[0]-lo[0],4)),'tall':float(round(hi[1]-lo[1],4)),'wide':float(round(hi[2]-lo[2],4))}
    FULL[key]=pack(P,C,F)
    Pw,Fw=weld(P,F,max(P.max(0)-P.min(0))*3e-4); wtris=len(Fw)
    if wtris>TARGET:
        p2,f2=FS.simplify(Pw,Fw.astype(np.int32),target_reduction=1-TARGET/wtris)
        p2=p2.astype(np.float32); c2=C[nearest(P,p2)]
        OUT[key]=pack(p2,c2,f2.astype(np.int64)); print(key,tris,'welded',wtris,'->',OUT[key]['tris'],'tris')
    else:
        p2=Pw.astype(np.float32); OUT[key]=pack(p2,C[nearest(P,p2)],Fw); print(key,tris,'welded',wtris,'tris (kept)')
os.makedirs('data/full',exist_ok=True)
json.dump(FULL,open('data/full/fish.json','w')); json.dump(OUT,open('data/fish.json','w'))
print('wrote data/fish.json',len(OUT),'fish,',os.path.getsize('data/fish.json'),'bytes')
