# THE TABLET: bakes the owner's rugged tablet (.glb, Draco, vertex colours) into data/tablet.json: each colour region cut down on its own,
# corners quantised to 16 bits over its box (metres), faces as indices, one palette colour per face. Run: python3 tools/tablet-bake.py tablet.glb
# (needs DracoPy, fast-simplification)
import sys,json,struct,base64,numpy as np,DracoPy,fast_simplification as FS
KEEP=float(sys.argv[2]) if len(sys.argv)>2 else .3
b=open(sys.argv[1],'rb').read(); L=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+L]); B=b[28+L:]
bv=j['bufferViews'][j['meshes'][0]['primitives'][0]['extensions']['KHR_draco_mesh_compression']['bufferView']]; o=bv.get('byteOffset',0)
m=DracoPy.decode(B[o:o+bv['byteLength']]); v=np.array(m.points,np.float64).reshape(-1,3)+np.array(j['nodes'][0].get('translation',[0,0,0])); f=np.array(m.faces).reshape(-1,3)
col=np.round(np.clip(np.array(m.colors)[:,:3],0,1)**(1/2.2)*255).astype(np.int32); fc=col[f[:,0]]
pal,fi=np.unique(fc,axis=0,return_inverse=True); fi=fi.reshape(-1)
V,F,C=[],[],[]; n0=0
for k in range(len(pal)):
    ff=f[fi==k]; u,inv=np.unique(ff,return_inverse=True); vv=v[u]; ff2=inv.reshape(-1,3)
    if len(ff2)>150:
        try: vv,ff2=FS.simplify(vv.astype(np.float32),ff2.astype(np.int32),1-KEEP)
        except Exception: pass
    V.append(vv); F.append(ff2+n0); C.append(np.full(len(ff2),k)); n0+=len(vv)
V=np.concatenate(V); F=np.concatenate(F); C=np.concatenate(C)
lo=V.min(0); hi=V.max(0); q=np.round((V-lo)/(hi-lo)*65535).astype(np.uint16)
E=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out={'lo':lo.round(5).tolist(),'hi':hi.round(5).tolist(),'p':E(q),'i':E(F.astype(np.uint16 if n0<65536 else np.uint32)),'f':E(C.astype(np.uint8)),'pal':['%02x%02x%02x'%tuple(c) for c in pal]}
open('data/tablet.json','w').write(json.dumps(out,separators=(',',':'))); print(len(f),'->',len(F),'tris',n0,'corners',len(pal),'colours',len(json.dumps(out))//1024,'KB')
