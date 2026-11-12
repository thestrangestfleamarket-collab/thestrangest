# THE SUBWAY DEMON AS A PET (owner, 12 Nov 2026: "with 1 taming you can tame them and they can become pets"): the little red demon of 146hbd built again here as a pet kind,
# data/pets/demon.json (its rig, skin, zones and Idle/Walk/Run clips at 12 a second, the pets' own format) and its line in data/pets.json. Run: python3 tools/demon-bake.py
import json, base64, math, re, numpy as np
P=[];C=[];J=[];Z=[];I=[]
ZONES=[['skin','#c41a1a'],['dark','#2a0808'],['eye','#ffd23a'],['wing','#6a0e0e']]
BN=['Root','Body','Head','Arm_L','Arm_R','Leg_L','Leg_R','Tail','Wing_L','Wing_R']; PA=[-1,1-1,1,1,1,0,0,1,1,1]
AT=[[0,0,0],[0,.2,0],[0,.36,0],[.12,.29,0],[-.12,.29,0],[.05,.14,0],[-.05,.14,0],[0,.16,-.1],[.05,.3,-.09],[-.05,.3,-.09]]
def rot(e):
    x,y,z=e; cx,sx,cy,sy,cz,sz=math.cos(x),math.sin(x),math.cos(y),math.sin(y),math.cos(z),math.sin(z)
    return np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]])@np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])@np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
def add(v,f,zone,bone,at=(0,0,0),e=(0,0,0),sc=(1,1,1),shade=1):
    v=(np.array(v)*np.array(sc))@rot(e).T+np.array(at); o=len(P)
    hx=ZONES[zone][1]; col=[int(hx[k:k+2],16) for k in (1,3,5)]
    for q in v:
        k=shade*(.86+.14*min(1,max(0,(q[1]-.0)/.5)))
        P.append(list(q)); C.append([min(255,round(c*k)) for c in col]); J.append(bone); Z.append(zone)
    for t in f: I.extend([o+t[0],o+t[1],o+t[2]])
def sphere(r,n=10,m=7):
    v=[];f=[]
    for a in range(m+1):
        for b in range(n): th=math.pi*a/m; ph=2*math.pi*b/n; v.append([r*math.sin(th)*math.cos(ph),r*math.cos(th),r*math.sin(th)*math.sin(ph)])
    for a in range(m):
        for b in range(n):
            p,q,r2,s=a*n+b,a*n+(b+1)%n,(a+1)*n+b,(a+1)*n+(b+1)%n; f+= [[p,q,r2],[q,s,r2]]
    return v,f
def cyl(r0,r1,h,n=6,y0=0):   # from y0 down to y0-h, r0 at the top
    v=[];f=[]
    for b in range(n): ph=2*math.pi*b/n; v.append([r0*math.cos(ph),y0,r0*math.sin(ph)]); v.append([r1*math.cos(ph),y0-h,r1*math.sin(ph)])
    v.append([0,y0,0]); v.append([0,y0-h,0]); t=2*n; bt=2*n+1
    for b in range(n):
        a,c,d,e=2*b,2*b+1,2*((b+1)%n),2*((b+1)%n)+1; f+=[[a,d,c],[d,e,c],[t,d,a],[bt,c,e]]
    return v,f
def cone(r,h,n=6): return cyl(0.001,r,h,n,y0=h/2)
def flat(pts):   # a flat fan, both faces
    v=[[x,y,0] for x,y in pts]; n=len(pts); f=[]
    for k in range(1,n-1): f+=[[0,k,k+1],[0,k+1,k]]
    return v,f
B=.14
add(*sphere(.13),0,1,(0,B+.1,0),sc=(1,1.1,.9)); add(*sphere(.11),0,2,(0,B+.29,.02))
for s in (1,-1):
    add(*cone(.024,.1),1,2,(s*.06,B+.39,.02),(0,0,-s*.5)); add(*sphere(.022,8,5),2,2,(s*.04,B+.31,.11),sc=(1,.7,.6))
    add(*flat([(0,0),(.16*s,.1),(.14*s,.02),(.18*s,-.03),(.1*s,-.04),(.12*s,-.09),(0,-.05)]),3,8 if s>0 else 9,(s*.05,B+.16,-.09))
    add(*cyl(.02,.016,.12),0,3 if s>0 else 4,(s*.12,B+.15,0),(0,0,s*.5))
    add(*cyl(.026,.022,.13),0,5 if s>0 else 6,(s*.05,.14,0)); add(*sphere(.03,6,4),1,5 if s>0 else 6,(s*.05,.012,.02),sc=(1,.6,1.4))
add(*sphere(.05,8,4),1,2,(0,B+.25,.1),sc=(1,.25,.3))
tp=[(0,.16,-.1),(0,.13,-.2),(0,.2,-.29),(0,.29,-.32)]
for a,b in zip(tp,tp[1:]):
    d=np.array(b)-np.array(a); L=np.linalg.norm(d); ex=math.atan2(-d[2],-d[1]); add(*cyl(.013,.012,L),0,7,a,(-ex,0,0)); add(*sphere(.013,6,4),0,7,b)
add(*cone(.035,.07,4),1,7,(0,.33,-.33),(.3,0,0),sc=(1,1,.4))
P=np.array(P,dtype=np.float64); n=len(P); lo=P.min(0); sc=float((P.max(0)-lo).max()/65000)
b64=lambda a:base64.b64encode(a.tobytes()).decode()
q=np.clip(np.round((P-lo)/sc)-32500,-32768,32767).astype('<i2')
jj=np.zeros((n,4),np.uint8); jj[:,0]=J; ww=np.zeros((n,4),np.uint8); ww[:,0]=255
ibm=np.zeros((len(BN),16),'<f4')
for i,a in enumerate(AT): m=np.eye(4); m[:3,3]=-np.array(a); ibm[i]=m.T.reshape(16)
T=[[round(AT[i][c]-(AT[PA[i]][c] if PA[i]>=0 else 0),5) for c in range(3)] for i in range(len(BN))]
def qx(a): return [math.sin(a/2),0,0,math.cos(a/2)]
def qy(a): return [0,math.sin(a/2),0,math.cos(a/2)]
def qz(a): return [0,0,math.sin(a/2),math.cos(a/2)]
def clip(dur,leg,arm,flap,bob,tail,nod):
    nf=round(dur*12)+1; Q=np.zeros((nf,len(BN),4)); Q[:,:,3]=1; pb=np.zeros((nf,3),'<f4')
    for k in range(nf):
        u=2*math.pi*k/(nf-1); s=math.sin(u)
        Q[k,5]=qx(leg*s); Q[k,6]=qx(-leg*s); Q[k,3]=qx(-arm*s); Q[k,4]=qx(arm*s)
        Q[k,8]=qy(.3+flap*math.sin(2*u)); Q[k,9]=qy(-.3-flap*math.sin(2*u)); Q[k,7]=qy(tail*s); Q[k,2]=qx(nod*math.sin(u))
        pb[k]=[0,bob*abs(math.sin(u)),0]
    return {'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype('<i2')),'p':{'Body':b64(pb)}}
size=[round(float(x),4) for x in (P.max(0)-lo)]
D={'key':'demon','name':'LITTLE RED DEMON','rig':{'names':BN,'parent':PA,'t':T,'q':[[0,0,0,1]]*len(BN),'ibm':b64(ibm)},
 'mesh':{'n':n,'lo':[round(float(x),5) for x in lo],'sc':sc,'p':b64(q),'c':b64(np.array(C,np.uint8)),'r':b64(np.zeros(n,np.uint8)),'j':b64(jj),'w':b64(ww),'i':b64(np.array(I,'<u2')),'parts':['Body'],'tris':len(I)//3,'z':b64(np.array(Z,np.uint8))},
 'clips':{'Idle':clip(2,0,.08,.3,.012,.35,.06),'Walk':clip(.5,.7,.6,.45,.03,.25,0),'Run':clip(.3333,.95,.8,.6,.05,.3,0)},
 'zones':ZONES,'knobs':[],'presets':{},'size':size,'tall':size[1],'license':'made for the game (tools/demon-bake.py)'}
json.dump(D,open('data/pets/demon.json','w'),separators=(',',':'))
K=json.load(open('data/pets.json')); K['kinds']=[k for k in K['kinds'] if k['key']!='demon']
K['kinds'].append({'key':'demon','name':'LITTLE RED DEMON','group':'creatures','clips':['Idle','Walk','Run'],'size':size,'long':.5,'zones':ZONES,'presets':{},'knobs':[],'tame':{'d':1,'t':'pet','f':[]}})
json.dump(K,open('data/pets.json','w'),separators=(',',':'))
src='src/146zj-pets.js'; S=open(src).read()
if 'demon:__LAZY__' not in S: S=S.replace('const PETFILES={','const PETFILES={demon:__LAZY__("data/pets/demon.json"),',1); open(src,'w').write(S)
print('demon',n,'corners',len(I)//3,'triangles',size)
