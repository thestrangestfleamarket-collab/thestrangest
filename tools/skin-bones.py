# STEP 2: his bones, every corner's weights, the game's data file: python3 tools/skin-bones.py <cheetah|grumpycat|ghost> (reads $BAKE/<name>, writes data/).
# The cat's ink bottle is cut out here (bottle_T.npy, for item-bake.py); his base plate dropped.
# step 3: each character's bones (a tree of segments in his own frame: feet at 0, 1 tall), every corner weighted to the nearest two, his faces' colours;
# written as the game's data (data/<name>.json): p (positions, 3 corners a face), c (colours), r (each corner's main bone), w (two bones and their weights), bones
import sys,os,json,base64,numpy as np
from PIL import Image
name=sys.argv[1]; D=os.environ.get('BAKE','bake')+'/'+name+'/'
v=np.load(D+'v.npy'); f=np.load(D+'f.npy'); col=np.load(D+'col.npy'); T=v[f]; c=T.mean(1)
# bones: name, parent, head, tail (the segment the skin follows); the first is the root
if name=='cheetah':
  B=[('hips',None,(0,.42,0),(0,.50,0)),('chest','hips',(0,.50,0),(0,.70,0)),('head','chest',(0,.70,0),(0,.86,.02)),('hair','head',(0,.86,0),(0,1,0)),
     ('armL','chest',(-.12,.67,0),(-.14,.56,0)),('foreL','armL',(-.14,.56,0),(-.13,.46,.03)),
     ('armR','chest',(.11,.66,.02),(.11,.61,.16)),('foreR','armR',(.11,.61,.16),(.11,.60,.33)),
     ('thighL','hips',(-.06,.42,0),(-.06,.22,0)),('shinL','thighL',(-.06,.22,0),(-.06,.05,0)),('footL','shinL',(-.06,.05,0),(-.06,.02,.08)),
     ('thighR','hips',(.06,.42,0),(.06,.22,0)),('shinR','thighR',(.06,.22,0),(.06,.05,0)),('footR','shinR',(.06,.05,0),(.06,.02,.08)),
     ('tail1','hips',(0,.40,-.10),(0,.26,-.20)),('tail2','tail1',(0,.26,-.20),(0,.10,-.30)),('tail3','tail2',(0,.10,-.30),(0,.03,-.36))]
  keep=np.ones(len(f),bool)
elif name=='grumpycat':
  B=[('hips',None,(0,.12,0),(0,.30,0)),('chest','hips',(0,.30,0),(0,.62,0)),('head','chest',(0,.62,0),(0,.95,-.05)),
     ('armL','chest',(-.30,.52,.05),(-.28,.38,.25)),('handL','armL',(-.28,.38,.25),(-.14,.48,.40)),
     ('armR','chest',(.30,.52,.05),(.28,.38,.25)),('handR','armR',(.28,.38,.25),(.14,.48,.40)),
     ('paper','handR',(0,.46,.42),(0,.60,.46)),
     ('footL','hips',(-.15,.06,.15),(-.18,.04,.40)),('footR','hips',(.15,.06,.15),(.18,.04,.40)),
     ('earL','head',(-.20,.80,0),(-.32,.98,0)),('earR','head',(.20,.80,0),(.32,.98,0))]
  bottle=(c[:,0]<-.22)&(c[:,1]<.30)&(c[:,2]>.12); base=(c[:,1]<.025)&(~bottle); keep=~bottle&~base
  Tb=T[bottle]; np.save(D+'bottle_T.npy',Tb); np.save(D+'bottle_c.npy',col[bottle]); print('bottle faces',bottle.sum(),'base faces',base.sum())
elif name in ('cyborg','teddy'):
  # on two legs, arms at the sides (the cyborg's right arm held out before him): the same tree, each one's measurements
  C={'cyborg':dict(hip=.45,chest=.5,neck=.8,top=1,leg=.08,knee=.22,ankle=.05,sh=.25,shY=.72,elb=.58,hand=.46,fwd=(.1,.2,.28)),'teddy':dict(hip=.27,chest=.3,neck=.62,top=1,leg=.1,knee=.14,ankle=.04,sh=.26,shY=.52,elb=.4,hand=.3,fwd=None)}[name]
  B=[('hips',None,(0,C['hip'],0),(0,C['chest'],0)),('chest','hips',(0,C['chest'],0),(0,C['neck'],0)),('head','chest',(0,C['neck'],0),(0,C['top'],0)),
     ('armL','chest',(-C['sh'],C['shY'],0),(-C['sh']-.02,C['elb'],0)),('foreL','armL',(-C['sh']-.02,C['elb'],0),(-C['sh']-.02,C['hand'],.03)),
     ('armR','chest',(C['sh'],C['shY'],0),(C['sh']+.02,C['elb'],0)),('foreR','armR',(C['sh']+.02,C['elb'],0),(C['sh']+.02,C['hand'],.03)),
     ('thighL','hips',(-C['leg'],C['hip'],0),(-C['leg'],C['knee'],0)),('shinL','thighL',(-C['leg'],C['knee'],0),(-C['leg'],C['ankle'],0)),('footL','shinL',(-C['leg'],C['ankle'],0),(-C['leg'],.02,.08)),
     ('thighR','hips',(C['leg'],C['hip'],0),(C['leg'],C['knee'],0)),('shinR','thighR',(C['leg'],C['knee'],0),(C['leg'],C['ankle'],0)),('footR','shinR',(C['leg'],C['ankle'],0),(C['leg'],.02,.08))]
  if C['fwd']: x,y,z=C['fwd']; B[5]=('armR','chest',(C['sh'],C['shY'],0),(x,y+.05,z*.6)); B[6]=('foreR','armR',(x,y+.05,z*.6),(x,y,z))
  keep=np.ones(len(f),bool)
elif name=='ghost':
  B=[('hips',None,(0,.25,0),(0,.50,0)),('chest','hips',(0,.50,0),(0,.72,0)),('head','chest',(0,.72,0),(0,1,0)),
     ('armL','chest',(-.18,.48,0),(-.34,.42,0)),('armR','chest',(.18,.48,0),(.33,.42,0)),('hem','hips',(0,.25,0),(0,0,0))]
  keep=np.ones(len(f),bool)
names=[b[0] for b in B]; par=[names.index(b[1]) if b[1] else -1 for b in B]; H=np.array([b[2] for b in B],float); E=np.array([b[3] for b in B],float)
T=T[keep]; col=col[keep]; P=T.reshape(-1,3)
def segd(P,a,b):
    ab=b-a; t=np.clip(((P-a)@ab)/max(1e-9,ab@ab),0,1)[:,None]; return np.linalg.norm(P-(a+t*ab),axis=1)
Dm=np.stack([segd(P,H[i],E[i]) for i in range(len(B))],1)
if name in ('cyborg','teddy'):
  for n in ['thighL','shinL','footL']: Dm[:,names.index(n)][P[:,0]>0]+=1
  for n in ['thighR','shinR','footR']: Dm[:,names.index(n)][P[:,0]<0]+=1
  for n in ['armL','foreL']: Dm[:,names.index(n)][P[:,0]>-.12]+=.08
  for n in ['armR','foreR']: Dm[:,names.index(n)][P[:,0]<.12]+=.08
if name=='cheetah':
  # the legs are told apart by side, the hanging arm from the chest by being outside it, the tail by being behind
  Dm[:,names.index('thighL')][P[:,0]>0]+=1; Dm[:,names.index('shinL')][P[:,0]>0]+=1; Dm[:,names.index('footL')][P[:,0]>0]+=1
  Dm[:,names.index('thighR')][P[:,0]<0]+=1; Dm[:,names.index('shinR')][P[:,0]<0]+=1; Dm[:,names.index('footR')][P[:,0]<0]+=1
  for n in ['tail1','tail2','tail3']: Dm[:,names.index(n)][P[:,2]>-.12]+=1
  Dm[:,names.index('armL')][P[:,0]>-.10]+=.05; Dm[:,names.index('foreL')][P[:,0]>-.10]+=.05
  for n in ['armR','foreR']: Dm[:,names.index(n)][P[:,2]<.10]+=.06
if name=='grumpycat':
  Dm[:,names.index('paper')][(P[:,2]<.36)|(P[:,1]<.38)]+=1
  for n in ['footL','footR']: Dm[:,names.index(n)][(P[:,1]>.14)|(P[:,2]<.15)]+=1
  for n in ['earL','earR']: Dm[:,names.index(n)][P[:,1]<.78]+=1
if name=='ghost':
  Dm[:,names.index('armL')][P[:,0]>-.2]+=.3; Dm[:,names.index('armR')][P[:,0]<.2]+=.3
o=np.argsort(Dm,1)[:,:2]; d0=np.take_along_axis(Dm,o[:,:1],1)[:,0]; d1=np.take_along_axis(Dm,o[:,1:2],1)[:,0]
# the weight slides to the second bone only where both are near (within a blend band): a soft joint, never a mash
band=0.05; w1=np.clip((band-(d1-d0))/band*0.5,0,0.5); w0=1-w1
reg=o[:,0]
# a look at the parts
PAL=np.array([[230,60,60],[60,200,60],[60,90,230],[230,200,40],[200,60,220],[40,210,210],[240,140,40],[120,120,120],[255,255,255],[140,80,40],[80,140,200],[200,120,160],[90,200,120],[250,90,160],[160,160,40],[40,120,90],[220,220,160]])
np.save(D+'reg.npy',reg.reshape(-1,3)[:,0]); np.save(D+'v.npy',P); np.save(D+'f.npy',np.arange(len(P)).reshape(-1,3)); np.save(D+'col.npy',col)
out={'p':base64.b64encode(P.astype(np.float32).tobytes()).decode(),'c':base64.b64encode(np.repeat(col.clip(0,255).round().astype(np.uint8),3,axis=0).reshape(-1).tobytes()).decode(),
     'r':base64.b64encode(reg.astype(np.uint8).tobytes()).decode(),'w':base64.b64encode(np.stack([o[:,0],o[:,1]],1).astype(np.uint8).tobytes()).decode(),
     'wt':base64.b64encode(np.stack([w0,w1],1).astype(np.float32).tobytes()).decode(),'tris':len(T),'bones':[[b[0],par[i],list(map(float,H[i])),list(map(float,E[i]))] for i,b in enumerate(B)]}
open('data/'+{'cheetah':'leopard','grumpycat':'cat','ghost':'ghost','cyborg':'cyborg','teddy':'teddy'}[name]+'.json','w').write(json.dumps(out))
import collections; print(name,'tris',len(T),collections.Counter(names[r] for r in reg[::3]))
