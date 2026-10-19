# THE PARK'S OWN TREES (owner, 19 Oct 2026, from the six trunk mockups: "add 2, 5, and 6 but only 1 each in diff parts of the park.
# use 4 and the current tree as common trees in park"): Elder1/Elder2 (the gnarled elder, two shapes), Spruce1, Willow1, Giant1, built
# here in the forest pack's own form (flat faces, one colour per part, feet at 0, 1 tall) and added to data/forest.json beside the oaks.
# Run: python3 tools/trees-bake.py
import json, base64, numpy as np
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
class M:
    def __init__(s,seed): s.T=[]; s.K=[]; s.rng=np.random.default_rng(seed)
    def tri(s,a,b,c,k): s.T.append([a,b,c]); s.K.append(k)
    def seg(s,c0,c1,r0,r1,n=6,k=1,tw=0):
        c0=np.array(c0,float); c1=np.array(c1,float); d=c1-c0; d/=np.linalg.norm(d); u=np.cross(d,[0,0,1.]) if abs(d[2])<.9 else np.cross(d,[1.,0,0]); u/=np.linalg.norm(u); v=np.cross(d,u)
        ring=lambda c,r,o:[c+r*(np.cos(a)*u+np.sin(a)*v) for a in np.arange(n)*2*np.pi/n+o]
        A=ring(c0,r0,tw); B=ring(c1,r1,tw+.3)
        for i in range(n):
            j=(i+1)%n; s.tri(A[i],B[i],A[j],k); s.tri(A[j],B[i],B[j],k)
        if r1>.004:
            for i in range(n): s.tri(B[i],c1+0,B[(i+1)%n],k)
    def blob(s,c,r,sy=.8,k=0):
        t=(1+5**.5)/2; V=np.array([[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]],float)
        V/=np.linalg.norm(V,axis=1)[:,None]; V*=1+s.rng.uniform(-.16,.16,(12,1)); V*=[r,r*sy,r]; V+=c
        F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]
        for a,b,cc in F: s.tri(V[a],V[b],V[cc],k)
    def cone(s,y0,y1,r,n=7,k=0,o=0):
        ap=np.array([0,y1,0.]); R=[np.array([r*np.cos(a),y0,r*np.sin(a)]) for a in np.arange(n)*2*np.pi/n+o]; inn=np.array([0,y0+(y1-y0)*.28,0.])
        for i in range(n):
            j=(i+1)%n; R[i]=R[i]*[1+s.rng.uniform(-.1,.1),1,1+s.rng.uniform(-.1,.1)]
        for i in range(n):
            j=(i+1)%n; s.tri(R[i],ap,R[j],k); s.tri(R[j],inn,R[i],k)
    def strand(s,top,bot,w,k=0):
        top=np.array(top,float); bot=np.array(bot,float); out=np.array([top[0],0,top[2]]); out/=np.linalg.norm(out)+1e-9; t=np.cross(out,[0,1.,0])*w
        s.tri(top-t,bot,top+t,k); s.tri(top-t,top+t*.2+out*w*.6+[0,-(top[1]-bot[1])*.45,0],top+t,k)
    def out(s,leaf,trunk,foot):
        T=np.array(s.T,float); K=np.array(s.K,np.uint8); lo=T.reshape(-1,3).min(0); hi=T.reshape(-1,3).max(0); h=hi[1]
        T=T-[(lo[0]+hi[0])/2,0,(lo[2]+hi[2])/2]; T/=h; C=np.array([leaf if k==0 else trunk for k in K for _ in range(3)],np.uint8)
        return {'p':b64(T.reshape(-1).astype(np.float32)),'c':b64(C),'k':b64(K),'tris':len(T),'metres':1.0,'wide':float(round(max(hi[0]-lo[0],hi[2]-lo[2])/h,4)),'trunk':float(round(foot*2/h,4))}
def roots(m,n,r,c=(0,0),y=.035,ln=.13,o=0,k=1):
    for i in range(n):
        a=o+i*2*np.pi/n+m.rng.uniform(-.3,.3); L=ln*m.rng.uniform(.75,1.2); m.seg([c[0]+np.cos(a)*r*.3,y,c[1]+np.sin(a)*r*.3],[c[0]+np.cos(a)*(r+L),.0,c[1]+np.sin(a)*(r+L)],r*.55,.006,4,k)
def elder(seed,lean):
    m=M(seed); P=[(0,0,0),(-.07*lean,.17,.02),(.06*lean,.34,-.02),(-.02*lean,.5,.01)]; R=[.075,.052,.043,.034]
    for i in range(3): m.seg(P[i],P[i+1],R[i],R[i+1],6,1,i*.5)
    roots(m,4,.07,o=seed)
    m.blob([-.075*lean,.18,.03],.03,1,1); m.blob([.065*lean,.33,-.04],.024,1,1)
    top=np.array(P[3]); B=[(-.32*lean,.6,.05),(.3*lean,.63,-.06),(.0,.76,.0),(-.1*lean,.66,-.24)]
    for b in B: m.seg(top,b,.026,.012,4)
    m.seg(P[2],(.22*lean,.44,.08),.02,.008,4); m.seg(B[0],(-.42*lean,.56,.1),.012,.006,4)
    for c,r in [((-.34*lean,.66,.05),.17),((.31*lean,.69,-.06),.17),((0,.84,0),.19),((-.12*lean,.72,-.25),.14),((.14*lean,.8,.16),.14),((.24*lean,.47,.09),.07),((-.43*lean,.59,.1),.09)]: m.blob(c,r,.68)
    return m.out((112,150,64),(112,84,58),.075)
def spruce():
    m=M(7); m.seg((0,0,0),(0,.42,0),.034,.026,6); m.seg((0,.42,0),(0,.97,0),.026,.004,6,1,.4)
    roots(m,3,.034,ln=.07,o=1)
    for y,a,l in [(.11,.4,.09),(.17,2.6,.08),(.23,4.5,.1),(.29,1.6,.07)]: m.seg((0,y,0),(np.cos(a)*l,y-.03,np.sin(a)*l),.009,.003,3)
    for i,(y0,y1,r) in enumerate([(.3,.52,.25),(.43,.64,.205),(.56,.76,.16),(.68,.87,.115),(.8,1.0,.07)]): m.cone(y0,y1,r,7,0,i*.45)
    return m.out((76,122,70),(118,90,60),.034)
def willow():
    m=M(11); m.seg((0,0,0),(0,.36,0),.07,.048,6); roots(m,4,.07,ln=.12,o=.5)
    L=[(-.26,.66,.04),(.02,.78,-.02),(.25,.65,-.05),(-.04,.7,.24),(.06,.68,-.24)]
    for b in L: m.seg((0,.34,0),b,.03,.014,4)
    for c,r in [((-.26,.7,.04),.17),((.25,.69,-.05),.17),((0,.84,0),.2),((-.05,.74,.24),.16),((.07,.72,-.25),.16)]: m.blob(c,r,.55)
    n=30
    for i in range(n):
        a=i*2*np.pi/n+m.rng.uniform(-.08,.08); R=.33+m.rng.uniform(-.03,.05); y=.66+m.rng.uniform(-.03,.05); d=m.rng.uniform(.28,.5)
        m.strand([np.cos(a)*R,y,np.sin(a)*R],[np.cos(a)*(R+.03),y-d,np.sin(a)*(R+.03)],.028)
    for i in range(12):
        a=i*2*np.pi/12+.2; R=.2; y=.6; m.strand([np.cos(a)*R,y,np.sin(a)*R],[np.cos(a)*R,y-.18,np.sin(a)*R],.022)
    return m.out((128,166,72),(110,84,58),.07)
def giant():
    m=M(13); P=[(0,0,0),(0,.3,0),(.01,.56,0),(0,.8,.01)]; R=[.06,.044,.032,.02]
    for i in range(3): m.seg(P[i],P[i+1],R[i],R[i+1],7,1,i*.4)
    for i in range(5):
        a=i*2*np.pi/5+.3; m.seg([np.cos(a)*.02,.13,np.sin(a)*.02],[np.cos(a)*.14,0,np.sin(a)*.14],.05,.008,4)
    for y,a,l in [(.42,.5,.11),(.55,3.4,.1)]:
        e=(np.cos(a)*l,y+.04,np.sin(a)*l); m.seg((0,y,0),e,.014,.007,4); m.blob(e,.06,.75)
    top=np.array(P[3]); B=[(-.2,.85,.04),(.2,.86,-.04),(0,.92,0),(.03,.86,.2),(-.03,.85,-.2)]
    for b in B: m.seg(top-[0,.03,0],b,.018,.009,4)
    for c,r in [((-.21,.87,.04),.14),((.21,.88,-.04),.14),((0,.94,0),.16),((.03,.89,.2),.13),((-.03,.88,-.2),.13),((0,.83,0),.12)]: m.blob(c,r,.6)
    return m.out((92,146,62),(118,90,60),.06)
D=json.load(open('data/forest.json'))
for k,v in [('Elder1',elder(3,1)),('Elder2',elder(5,-1)),('Spruce1',spruce()),('Willow1',willow()),('Giant1',giant())]:
    D[k]=v; print(k,v['tris'],'tris, wide',v['wide'],'foot',v['trunk'])
open('data/forest.json','w').write(json.dumps(D,separators=(',',':')))
