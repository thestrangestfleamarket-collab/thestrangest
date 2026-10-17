# THE BEAR IN HIS JACKET (the owner's model, Meshy AI "Pixel Bear Stroll": 734,670 triangles and a 2048 texture): cut to 6,000 triangles, each
# face coloured from the texture where it lies (the colours of the original's corners near it, averaged in small cubes), and sorted into parts
import numpy as np, json, base64
V=np.load('bear/V.npy'); VC=np.load('bear/VC.npy'); v=np.load('bear/v.npy'); f=np.load('bear/f.npy')
cs=0.014; key=np.floor(V/cs).astype(np.int64); K=(key[:,0]+512)*1048576+(key[:,1]+512)*1024+(key[:,2]+512)
u,inv=np.unique(K,return_inverse=True); n=len(u); S=np.zeros((n,3)); np.add.at(S,inv,VC); C=np.bincount(inv,minlength=n); M=S/C[:,None]
lut=dict(zip(u.tolist(),range(n)))
def col_at(P):
  k=np.floor(P/cs).astype(np.int64); out=np.zeros((len(P),3)); got=np.zeros(len(P),bool)
  for r in [0,1,2]:
    for dx in range(-r,r+1):
      for dy in range(-r,r+1):
        for dz in range(-r,r+1):
          if max(abs(dx),abs(dy),abs(dz))!=r: continue
          kk=((k[:,0]+dx+512)*1048576+(k[:,1]+dy+512)*1024+(k[:,2]+dz+512)).tolist()
          for i,q in enumerate(kk):
            if got[i]: continue
            j=lut.get(q)
            if j is not None: out[i]=M[j]; got[i]=True
    if got.all(): break
  return out
P=v[f]; c=P.mean(1)
samp=[c]+[c*.5+P[:,i]*.5 for i in range(3)]
col=np.mean([col_at(s) for s in samp],axis=0)
X,Y,Z=c[:,0],c[:,1],c[:,2]; lum=col@[.3,.59,.11]; blue=(col[:,2]>col[:,0]+8)
# the parts: 0 ears, 1 head, 2 muzzle, 3 eyes and nose, 4 shirt, 5 jacket, 6 paws, 7 legs, 8 feet
reg=np.full(len(f),5)
reg[Y<-0.35]=7; reg[Y<-0.82]=8
reg[(Y>-0.5)&(Y<-0.12)&(np.abs(X)>0.36)]=6
reg[(Y>-0.25)&(Y<0.42)&(np.abs(X)<0.24)&(Z>0)&(blue|(lum>150))]=4
head=Y>0.43; reg[head]=1
reg[head&(Y>0.72)&(np.abs(X)>0.2)&(lum>120)]=0
reg[head&(Z>0.18)&(lum>140)&(Y<0.72)]=2
reg[head&(Z>0.15)&(lum<45)]=3
# the fur's strokes sampled at this size are speckles: each face eased toward its neighbours of the same part (twice), so the parts keep their edges
nb=[[] for _ in range(len(f))]; vf={}
for i,t in enumerate(f):
  for q in t: vf.setdefault(int(q),[]).append(i)
for i,t in enumerate(f):
  s_=set()
  for q in t: s_.update(vf[int(q)])
  s_.discard(i); nb[i]=[k for k in s_ if reg[k]==reg[i]]
for it in range(3):
  col=np.array([col[i]*.4+np.mean(col[nb[i]],axis=0)*.6 if nb[i] else col[i] for i in range(len(f))])
# faces much darker than their part's usual colour (the inside showing through the cut-down surface) take that colour, the eyes and nose left as they are
for r in range(9):
  if r==3: continue
  m=reg==r
  if not m.any(): continue
  med=np.median(col[m],axis=0); L=col@[.3,.59,.11]; dark=m&(L<(med@[.3,.59,.11])*.72); col[dark]=med*.92
names=['ears','head','muzzle','eyes and nose','shirt','jacket','paws','legs','feet']
import collections; print(collections.Counter(reg.tolist()))
regc=[np.median(col[reg==r],axis=0).round().astype(int).tolist() if (reg==r).any() else [128,128,128] for r in range(9)]
open('bear/bear.json','w').write(json.dumps({'p':base64.b64encode(P.reshape(-1).astype(np.float32).tobytes()).decode(),
  'c':base64.b64encode(np.repeat(col.clip(0,255).round().astype(np.uint8),3,axis=0).reshape(-1).tobytes()).decode(),
  'r':base64.b64encode(np.repeat(reg.astype(np.uint8),3)).decode(),'names':names,'regc':regc,'tris':len(f)}))
print('regc',regc)
