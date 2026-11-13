# THE DOUBLE BASS (owner, 8 Nov 2026: "add bass guitar too", then the double bass): Polyfork's Double Bass baked into data/pfbass.json, as the guitar's (tools/pfguitar-bake.py):
# points (int16 over its box, metres, Y up from the endpin's tip, the top facing +Z), colours, triangles, and what the hands play on, measured off the model:
# the bridge and the nut (y, the strings' height z there), each string's x at the nut and at the bridge (string 0, the low E, first: the -x side as the player sees it), the fingerboard's end.
# The raw .glb is fetched into .polyfork/bass/ (git-ignored, never committed). Run: python3 tools/pfbass-bake.py
import os, json, struct, base64, urllib.request, numpy as np
C='.polyfork/bass'; os.makedirs(C,exist_ok=True); F=f'{C}/double-bass.glb'
if not os.path.exists(F):
    r=urllib.request.Request('https://polyfork.dev/cdn/double-bass-5c7959.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}); open(F,'wb').write(urllib.request.urlopen(r,timeout=120).read())
d=open(F,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; b=d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    return np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
p=j['meshes'][0]['primitives'][0]; P=acc(p['attributes']['POSITION']).astype(float); Cl=acc(p['attributes']['COLOR_0']).astype(float)[:,:3]
if Cl.max()>1.5: Cl/=255
srgb=lambda c: np.where(c<=0.0031308,12.92*c,1.055*np.power(c,1/2.4)-0.055)
H=np.round(srgb(Cl)*255).astype(np.uint8); I=acc(p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(P))
near=lambda c:np.abs(H.astype(int)-np.array([int(c[i:i+2],16) for i in (0,2,4)])).sum(1)<=6
STR,EB=near('9f9b8e'),near('262325')
S=STR&(P[:,2]>-.05)&(P[:,1]>.25)   # the four strings (not the endpin's rod): thin prisms, their corners at the tailpiece, the bridge and the nut
def strx(y):
    m=S&(np.abs(P[:,1]-y)<.006); xs=np.sort(P[m,0]); g=[[xs[0]]]
    for x in xs[1:]: (g[-1].append(x) if x-g[-1][-1]<.005 else g.append([x]))
    c=sorted([float(np.mean(a)) for a in g]); assert len(c)==4,(y,c); return c,float(P[m,2].max())
lv=sorted(set(np.round(P[S,1],2))); yN=float(max(lv)); yB=float([y for y in lv if y<1][-1])
yN=float(P[S&(np.abs(P[:,1]-yN)<.006),1].mean()); yB=float(P[S&(np.abs(P[:,1]-yB)<.006),1].mean())
xb,zb=strx(yB); xn,zn=strx(yN)
fb=EB&(P[:,2]>.1)&(P[:,1]>.6); fbLo=float(P[fb,1].min())
frame={'bri':[round(yB,4),round(zb,4)],'nut':[round(yN,4),round(zn,4)],'x':[[round(a,4),round(c,4)] for a,c in zip(xn,xb)],'fb':round(fbLo,4),
       'h':round(float(P[:,1].max()),4),'w':round(float(np.abs(P[:,0]).max()),4),'d':[round(float(P[:,2].min()),4),round(float(P[:,2].max()),4)]}
lo=P.min(0); sc=(P.max(0)-lo).max()/65000; Q=np.round((P-lo)/sc-32500).astype(np.int16)
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out={'lo':[round(float(x),6) for x in lo],'sc':float(sc),'pos':b64(Q),'col':b64(H),'tri':b64(I.astype(np.uint16)),'frame':frame,
     'credit':'Double Bass by Polyfork (https://polyfork.dev/asset/double-bass-5c7959), CC BY 4.0'}
json.dump(out,open('data/pfbass.json','w'),separators=(',',':'))
print('data/pfbass.json',len(P),'points',len(I)//3,'triangles',os.path.getsize('data/pfbass.json'),'bytes'); print(json.dumps(frame))
