# THE GUITAR (owner, 7 Nov 2026: "add the guitar back into game. use the polyfork assets"): Polyfork's Guitar (its plain remix, no ribbons) baked into data/pfguitar.json:
# points (int16 over its box, metres, Y up the neck, the top facing +Z), colours (RGB bytes), triangles, and what the hands play on, measured off the model:
# the saddle and the nut (y, the strings' height z there), each string's x at the nut and at the saddle (string 1, the high E, first: the +x side), the fingerboard's top and the soundhole.
# The raw .glb is fetched into .polyfork/guitar/ (git-ignored, never committed). Run: python3 tools/pfguitar-bake.py
import os, json, struct, base64, urllib.request, urllib.parse, numpy as np
C='.polyfork/guitar'; os.makedirs(C,exist_ok=True); F=f'{C}/guitar-plain.glb'
if not os.path.exists(F):
    u='https://polyfork.dev/cdn/guitar-b013ee-remix.glb?p='+urllib.parse.quote(json.dumps({'ribbon':False},separators=(',',':')))
    r=urllib.request.Request(u,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}); open(F,'wb').write(urllib.request.urlopen(r,timeout=120).read())
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
hx=lambda h:'%02x%02x%02x'%tuple(int(v) for v in h)
near=lambda h,c:np.abs(H.astype(int)-np.array([int(c[i:i+2],16) for i in (0,2,4)])).sum(1)<=6
STR,BONE,RW,HOLE=near(H,'dedbde'),near(H,'d3bda0'),near(H,'402b23'),near(H,'2d2019')
# the saddle and the nut: the bone pieces the strings cross, the lowest and the next up the neck
Sy=P[STR,1]; ys=sorted(set(np.round(P[BONE,1],3)))
sad=[y for y in ys if y<=Sy.min()+.01]; nut=[y for y in ys if y>.6 and np.abs(P[BONE&(np.round(P[:,1],3)==y),0]).max()<.03]
ySad=float(np.mean(sad[:2])) if sad else float(Sy.min()); yNut=float(np.mean(nut[:2]))
def strx(y):   # the six strings' centres at height y along the neck (each a thin prism: its corners' x grouped)
    m=STR&(np.abs(P[:,1]-y)<.012); xs=np.sort(P[m,0]); g=[[xs[0]]]
    for x in xs[1:]:
        (g[-1].append(x) if x-g[-1][-1]<.004 else g.append([x]))
    c=sorted([float(np.mean(a)) for a in g],reverse=True); assert len(c)==6,(y,c); z=float(P[m,2].mean()); return c,z
xn,zn=strx(yNut+.004); xs_,zs=strx(ySad+.004)
fb=RW&(P[:,1]>.4); hole=P[HOLE]
frame={'sad':[round(ySad,4),round(zs,4)],'nut':[round(yNut,4),round(zn,4)],'x':[[round(a,4),round(b,4)] for a,b in zip(xn,xs_)],
       'fb':[round(float(P[fb,1].min()),4),round(float(P[fb,2].max()),4)],'top':round(float(np.median(P[near(H,'b58760'),2])),4),
       'hole':[round(float(hole[:,1].mean()),4),round(float(np.abs(hole[:,0]).max()),4)],'w':round(float(np.abs(P[:,0]).max()),4),'d':round(float(np.abs(P[:,2]).max()),4)}
lo=P.min(0); sc=(P.max(0)-lo).max()/65000; Q=np.round((P-lo)/sc-32500).astype(np.int16)
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out={'lo':[round(float(x),6) for x in lo],'sc':float(sc),'pos':b64(Q),'col':b64(H),'tri':b64(I.astype(np.uint16)),'frame':frame}
json.dump(out,open('data/pfguitar.json','w'),separators=(',',':'))
print('data/pfguitar.json',len(P),'points',len(I)//3,'triangles',os.path.getsize('data/pfguitar.json'),'bytes'); print(json.dumps(frame))
