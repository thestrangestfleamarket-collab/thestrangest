# THE GOLDFISH IN HIS RAINCOAT (the owner's model, Meshy AI, no colours of its own): cut to 5,000 triangles and coloured face by face from his picture
import numpy as np, json, base64
v=np.load('fish/v.npy'); f=np.load('fish/f.npy'); P=v[f]; c=P.mean(1); n=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]); n/=np.linalg.norm(n,axis=1,keepdims=True)+1e-12
X,Y,Z=c[:,0],c[:,1],c[:,2]
ORANGE=np.array([232,112,38]); ORL=np.array([246,150,70]); EYE=np.array([14,14,18]); RIM=np.array([230,226,220]); LIP=np.array([236,160,150]); CHIN=np.array([238,216,204])
COAT=np.array([218,158,26]); COATD=np.array([168,116,18]); FIN=np.array([226,166,52]); HOOD=np.array([242,156,96])
col=np.tile(COAT,(len(f),1)).astype(float)
collar=0.12-0.06*np.abs(X)
head=Y>collar
col[head]=ORANGE
col[head&(Y>0.62)&(n[:,2]>0.2)]=ORL                                   # the light on his brow
hood=head&((n[:,2]<-0.15)|((n[:,1]>0.55)&(Z<0.35)))                    # the clear hood: over his crown and down his back
col[hood]=HOOD
for ex,ey in [(-0.315,0.556),(0.278,0.556)]:
  d=np.hypot(X-ex,Y-ey); front=Z>0.2
  col[front&(d<0.105)]=RIM; col[front&(d<0.085)]=EYE
for ex,ey in [(-0.35,0.33),(0.3,0.33)]:
  col[(Z>0.2)&(np.hypot(X-ex,Y-ey)<0.06)]=ORL                           # the little nub on each cheek
mouth=(Z>0.3)&(np.abs(X+0.04)<0.17)&(np.abs(Y-0.44)<0.07); col[mouth]=LIP
chin=(Z>0.3)&(np.abs(X+0.02)<0.2)&(Y>collar)&(Y<0.37); col[chin]=CHIN
# the coat's creases, its zip down the front, its pockets' edges: darker where the faces turn away
coat=~head; col[coat&(n[:,1]<-0.4)]=COATD; col[coat&(np.abs(X)<0.03)&(Z>0)]=COATD
fins=(~head)&((np.abs(X)>0.47)|(Y<-0.78)|(Z<-0.62)); col[fins]=FIN
# each face's part (for his shading's tones and the outlines between parts): 0 eye, 1 its rim, 2 head, 3 hood, 4 lips, 5 chin, 6 coat, 7 fins
reg=np.full(len(f),6); reg[head]=2; reg[hood]=3
for k,C in [(0,EYE),(1,RIM),(4,LIP),(5,CHIN),(7,FIN)]: reg[(col==C).all(1)]=k
REGC=[EYE,RIM,ORANGE,HOOD,LIP,CHIN,COAT,FIN]
open('fish/goldfish.json','w').write(json.dumps({'p':base64.b64encode(P.reshape(-1).astype(np.float32).tobytes()).decode(),'c':base64.b64encode(np.repeat(col.clip(0,255).astype(np.uint8),3,axis=0).reshape(-1).tobytes()).decode(),'tris':len(f),'r':base64.b64encode(np.repeat(reg.astype(np.uint8),3)).decode(),'regc':[c.tolist() for c in REGC]}))
print('tris',len(f),'head',head.sum(),'eyes',(col==EYE).all(1).sum(),'hood',hood.sum())
