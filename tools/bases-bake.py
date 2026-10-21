# Bakes the two low-poly base bodies (data/full/low-poly-mesh-bases-v2.glb, CC-BY-4.0, justice2free on Sketchfab) into data/bases.json:
# their faces, a skeleton fitted to each (the 15 bones the rig moves) and every vertex's two bones and weight. python3 tools/bases-bake.py
import json,struct,numpy as np
SRC='data/full/low-poly-mesh-bases-v2.glb'
BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR']
PARENT={'torso':'hips','head':'torso','upperArmL':'torso','upperArmR':'torso','forearmL':'upperArmL','forearmR':'upperArmR','handL':'forearmL','handR':'forearmR','thighL':'hips','thighR':'hips','shinL':'thighL','shinR':'thighR','shoeL':'shinL','shoeR':'shinR'}
def load():
    d=open(SRC,'rb').read();jl=struct.unpack('<I',d[12:16])[0];J=json.loads(d[20:20+jl]);B=d[20+jl+8:]
    def acc(i):
        a=J['accessors'][i];v=J['bufferViews'][a['bufferView']];n={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a['componentType']];o=v.get('byteOffset',0)+a.get('byteOffset',0)
        arr=np.frombuffer(B,dt,a['count']*n,o);return arr.reshape(-1,n) if n>1 else arr
    out={}
    def walk(i,M):
        n=J['nodes'][i];M2=M@(np.array(n['matrix']).reshape(4,4).T if 'matrix' in n else np.eye(4))
        if 'mesh' in n:
            p=J['meshes'][n['mesh']]['primitives'][0];P=acc(p['attributes']['POSITION']).astype(float);P=(np.c_[P,np.ones(len(P))]@M2.T)[:,:3]
            P[:,0]-=(P[:,0].min()+P[:,0].max())/2; out['woman' if 'Female' in n['name'] else 'man']=(P,acc(p['indices']).reshape(-1,3).astype(int))
        for c in n.get('children',[]):walk(c,M2)
    walk(0,np.eye(4)); return out,J['asset'].get('extras',{})
def joints(P):
    J={}; zc=lambda m: float(np.median(P[m][:,2])) if m.sum() else 0.0
    band=lambda y0,y1,c: (P[:,1]>=y0)&(P[:,1]<y1)&c
    H=P[:,1].max()
    for s,n in ((1,'L'),(-1,'R')):
        side=P[:,0]*s>0; A=P[side&(np.abs(P[:,0])>0.2)&(P[:,1]>0.75)&(P[:,1]<1.62)]; L=P[side&(P[:,1]<0.95)&(np.abs(P[:,0])<0.22)]
        at=lambda X,y,dy: X[np.abs(X[:,1]-y)<dy].mean(0)
        J['shoulder'+n]=np.array([0.17*s,1.6,zc(band(1.5,1.65,side&(np.abs(P[:,0])>0.12)))])
        J['elbow'+n]=at(A,1.26,.05); J['wrist'+n]=at(A,0.98,.04); J['tip'+n]=A[A[:,1]<A[:,1].min()+0.04].mean(0)
        J['knee'+n]=at(L,0.55,.06); J['ankle'+n]=at(L,0.1,.04); t=L[L[:,2]>L[:,2].max()-0.04].mean(0); t[1]=0.03; J['toe'+n]=t
    J['pelvis']=np.array([0,1.0,zc(band(0.95,1.08,np.abs(P[:,0])<0.12))]); J['waist']=np.array([0,1.12,zc(band(1.0,1.6,np.abs(P[:,0])<0.15))])
    J['neck']=np.array([0,1.68,zc(band(1.64,1.72,np.abs(P[:,0])<0.08))]); J['headTop']=np.array([0,H,zc(band(H-.15,H,P[:,1]>0))])
    for s,n in ((1,'L'),(-1,'R')): J['hip'+n]=np.array([0.1*s,0.98,J['pelvis'][2]])
    return J
def frames(J):
    def basis(y):
        y=y/np.linalg.norm(y); x=np.array([1.0,0,0]); x=x-y*x.dot(y); x/=np.linalg.norm(x); return np.stack([x,y,np.cross(x,y)],1)
    I=np.eye(3); F={'hips':(J['pelvis'],J['waist'],I),'torso':(J['waist'],J['neck'],I),'head':(J['neck'],J['headTop'],I)}
    for n in 'LR':
        for b,a,c in (('upperArm','shoulder','elbow'),('forearm','elbow','wrist'),('hand','wrist','tip'),('thigh','hip','knee'),('shin','knee','ankle')):
            F[b+n]=(J[a+n],J[c+n],basis(J[a+n]-J[c+n]))
        F['shoe'+n]=(J['ankle'+n],J['toe'+n],I)
    return F
RAD={'hips':.14,'torso':.2,'head':.11,'upperArm':.05,'forearm':.04,'hand':.04,'thigh':.08,'shin':.06,'shoe':.05}
def weights(P,F):
    D=np.zeros((len(P),len(BONES)))
    for i,n in enumerate(BONES):
        a,b,_=F[n]; ab=b-a; t=np.clip(((P-a)@ab)/(ab@ab),0,1); D[:,i]=np.linalg.norm(P-(a+np.outer(t,ab)),axis=1)/RAD[n.rstrip('LR')]
        if n[-1] in 'LR': D[P[:,0]*(1 if n[-1]=='L' else -1)<-0.02,i]=1e9
        if n.startswith(('thigh','shin','shoe')): D[P[:,1]>1.08,i]=1e9
        if n.startswith(('upperArm','forearm','hand')): D[np.abs(P[:,0])<0.15,i]=1e9
        if n=='head': D[P[:,1]<1.6,i]=1e9
        if n in ('torso','hips'): D[np.abs(P[:,0])>0.21,i]=1e9
    NEAR=[[BONES.index(m) for m in BONES if PARENT.get(m)==n or PARENT.get(n)==m] for n in BONES]
    p=np.argmin(D,1); o=np.zeros((len(P),2),int); w=np.ones(len(P))
    for v in range(len(P)):
        a=p[v]; c=min(NEAR[a],key=lambda j:D[v,j]); o[v]=[a,c]; da,dc=max(D[v,a],1e-3),D[v,c]
        w[v]=1.0 if dc>2.5*da else (1/da**6)/((1/da**6)+(1/dc**6))
    return o,w
def paint(P,I,key):
    C=P[I].mean(1); c=np.zeros(len(I),int)
    shorts=(C[:,1]>0.86)&(C[:,1]<1.08)&(np.abs(C[:,0])<0.22); c[shorts]=1
    if key=='woman': c[(C[:,1]>1.36)&(C[:,1]<1.5)&(np.abs(C[:,0])<0.17)]=1
    return c
meshes,credit=load(); out={'credit':{'title':credit.get('title'),'author':credit.get('author'),'license':credit.get('license'),'source':credit.get('source')},'bones':BONES,'colors':['skin','under'],'bodies':{}}
for key,(P,I) in meshes.items():
    J=joints(P); F=frames(J); o,w=weights(P,F)
    out['bodies'][key]={'height':round(float(P[:,1].max()),4),'hipY':round(float(J['pelvis'][1]),4),
      'origin':[np.round(F[b][0],4).tolist() for b in BONES],'rest':[np.round(F[b][2].T.reshape(-1),5).tolist() for b in BONES],
      'pos':np.round(P,4).reshape(-1).tolist(),'tri':I.reshape(-1).tolist(),'bone':o.reshape(-1).tolist(),'w':np.round(w,3).tolist(),'col':paint(P,I,key).tolist()}
json.dump(out,open('data/bases.json','w'),separators=(',',':'))
print('data/bases.json',sum(len(b['tri'])//3 for b in out['bodies'].values()),'triangles')
