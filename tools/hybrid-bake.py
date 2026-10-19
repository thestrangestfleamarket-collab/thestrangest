import json,base64,sys,numpy as np
S='data'
d=json.load(open('data/full/walker-pieces.json')); X=d; F=X['F']; JW={k:np.array(v) for k,v in X['J'].items()}
U=json.load(open('data/ual.json'))['ual']; R=U['rig']; N=R['names']; NI={n:i for i,n in enumerate(N)}
P=np.array(d['pos']).reshape(-1,3); I=np.array(d['idx']).reshape(-1,3); pid=np.array(d['pidx']).astype(int); C=np.array(d['c1']).reshape(-1,3)
Wp=np.zeros_like(P); Nv=np.array(d['nrm']).reshape(-1,3); Nw=np.zeros_like(P)
for k,n in enumerate(d['names']):
  o,x,y,z=[np.array(v) for v in F[n]]; m=pid==k; L=P[m].copy(); e=X['E'][k]
  if e: L=L*np.array(e['s'])
  Wp[m]=o+L[:,:1]*x+L[:,1:2]*y+L[:,2:3]*z
  Nl=Nv[m]; Nw[m]=Nl[:,:1]*x+Nl[:,1:2]*y+Nl[:,2:3]*z
fn=np.cross(Wp[I[:,1]]-Wp[I[:,0]],Wp[I[:,2]]-Wp[I[:,0]]); vs=Nw[I[:,0]]+Nw[I[:,1]]+Nw[I[:,2]]
flip=(fn*vs).sum(1)<0; I[flip]=I[flip][:,[0,2,1]]; print('flipped',int(flip.sum()),'of',len(I))
keep=np.array([not X['HIDE'][pid[t[0]]] for t in I]); I=I[keep]
SC=1.8/52.0; Wp*=SC; JW={k:v*SC for k,v in JW.items()}
def q2m(q):
  x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
T=[np.array(t,float) for t in R['t']]; Q=[np.array(q,float) for q in R['q']]
def fk(T):
  W=[]
  for i in range(len(N)):
    M=np.eye(4); M[:3,:3]=q2m(Q[i]); M[:3,3]=T[i]; p=R['parent'][i]; W.append(W[p]@M if p>=0 else M)
  return W
W0=fk(T); pos=lambda W,n:W[NI[n]][:3,3]
def setlen(n,L):
  T[NI[n]]=T[NI[n]]/np.linalg.norm(T[NI[n]])*L
ksp=np.linalg.norm(JW['neck']-JW['pelvis'])/np.linalg.norm(pos(W0,'neck_01')-pos(W0,'pelvis'))
kh=JW['hipL'][1]/pos(W0,'thigh_l')[1]
T[NI['pelvis']]=T[NI['pelvis']]*kh
for n in ['spine_01','spine_02','spine_03','neck_01','clavicle_l','clavicle_r']: T[NI[n]]=T[NI[n]]*ksp
setlen('Head',np.linalg.norm(JW['headBase']-JW['neck']))
for s,S_ in (('l','L'),('r','R')):
  setlen('upperarm_'+s,np.linalg.norm(JW['shoulder'+S_]-JW['clav'+S_]))
  setlen('lowerarm_'+s,np.linalg.norm(JW['elbow'+S_]-JW['shoulder'+S_]))
  setlen('hand_'+s,np.linalg.norm(JW['wrist'+S_]-JW['elbow'+S_]))
  kf=np.linalg.norm(JW['k23'+S_]-JW['wrist'+S_])/np.linalg.norm(pos(W0,'middle_04_leaf_'+s)-pos(W0,'hand_'+s))
  for n in N:
    if n.endswith('_'+s) and any(n.startswith(f) for f in ('index','middle','pinky','ring','thumb')): T[NI[n]]=T[NI[n]]*kf
  setlen('thigh_'+s,np.linalg.norm(JW['hip'+S_]-JW['pelvis']))
  setlen('calf_'+s,np.linalg.norm(JW['knee'+S_]-JW['hip'+S_]))
  setlen('foot_'+s,np.linalg.norm(JW['ankle'+S_]-JW['knee'+S_]))
  setlen('ball_'+s,np.linalg.norm(JW['ball'+S_]-JW['ankle'+S_]))
  setlen('ball_leaf_'+s,max(.02,np.linalg.norm(JW['toe'+S_]-JW['ball'+S_])))
W1=fk(T)
def basis(dv,h):
  x=dv/np.linalg.norm(dv); y=h-np.dot(h,x)*x; y/=np.linalg.norm(y); return np.stack([x,y,np.cross(x,y)],1)
FWD=np.array([0,0,1.]); UP=np.array([0,1.,0])
def align(bone,ws,we,us,ue):
  a=JW[we]-JW[ws]; b=(pos(W1,ue) if isinstance(ue,str) else ue)-pos(W1,us)
  h=FWD if abs(np.dot(a/np.linalg.norm(a),FWD))<.7 else UP
  Rm=basis(b,h)@basis(a,h).T
  return NI[bone],Rm,JW[ws],pos(W1,us)
MAP={}
hd=align('Head','neck','headBase','neck_01','Head'); hd=(NI['Head'],hd[1],JW['headBase'],pos(W1,'Head'))
for n in ['head','hair','eyes0']: MAP[n]=hd
MAP['neck']=align('neck_01','neck','headBase','neck_01','Head')
MAP['torso']=align('spine_03','chest','neck','spine_03','neck_01')
MAP['hips']=align('pelvis','pelvis','spine','pelvis','spine_01')
for s,S_ in (('l','L'),('r','R')):
  ua=align('upperarm_'+s,'shoulder'+S_,'elbow'+S_,'upperarm_'+s,'lowerarm_'+s)
  MAP['sleeve'+S_]=MAP['upperArm'+S_]=ua
  MAP['forearm'+S_]=align('lowerarm_'+s,'elbow'+S_,'wrist'+S_,'lowerarm_'+s,'hand_'+s)
  hn=align('hand_'+s,'wrist'+S_,'k23'+S_,'hand_'+s,'middle_04_leaf_'+s)
  MAP['hand'+S_]=hn
  for i in range(5): MAP['fing%d0%s'%(i,S_)]=hn
  MAP['thigh'+S_]=align('thigh_'+s,'hip'+S_,'knee'+S_,'thigh_'+s,'calf_'+s)
  MAP['shin'+S_]=align('calf_'+s,'knee'+S_,'ankle'+S_,'calf_'+s,'foot_'+s)
  MAP['shoe'+S_]=align('foot_'+s,'ankle'+S_,'ball'+S_,'foot_'+s,'ball_'+s)
used=np.unique(I); remap=-np.ones(len(P),int); remap[used]=np.arange(len(used))
V=np.zeros((len(used),3)); B=np.zeros(len(used),np.uint8); Cc=np.zeros((len(used),3),np.uint8)
for j,v in enumerate(used):
  n=d['names'][pid[v]]; bi,Rm,ws,us=MAP[n]; V[j]=Rm@(Wp[v]-ws)+us; B[j]=bi
  c=C[v]; c=np.where(c<=.0031308,c*12.92,1.055*np.power(np.maximum(c,1e-9),1/2.4)-.055); Cc[j]=np.clip(np.round(c*255),0,255)
idx=remap[I].astype(np.uint16)
ibm=np.concatenate([np.linalg.inv(w).T.astype(np.float32).ravel() for w in W1])
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out={'t':[list(map(float,t)) for t in T],'ibm':b64(ibm),'kp':float(kh),'p':b64(V.astype(np.float32)),'c':b64(Cc),'j':b64(B),'i':b64(idx),'tris':int(len(idx)),'tall':float(Wp[used][:,1].max())}
json.dump(out,open('data/hybrid.json','w'),separators=(',',':'))
print('tris',len(idx),'verts',len(used),'ksp',ksp,'kh',kh,'tall',out['tall'],'bbox',V.min(0).round(2),V.max(0).round(2))
