# THE POLICE CRUISER: a 1980s New York radio car (a Plymouth Gran Fury's size and shape: 5.2 m long, 1.84 wide, 1.4 high, 2.86 between the axles)
# modelled here in code, in the cars' own form (tools/cars-bake.py: metres, forward +z, the driver at +x) and put into data/cars.json as
# cars['police-cruiser-80s']. Beyond a kit car it has parts that open on a hinge (parts: the four doors, the hood, the trunk lid, each with
# its own glass), lamps the game lights by name (a group's t: head, tail, turn, rev), and marks: where the roof's light bar, the plates and
# the lettering go (src/150pe-carparts.js paints those). Colours are sRGB here. python3 -I tools/cruiser-bake.py
import json, struct, base64, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLUE=(92,158,206); WHITE=(238,238,232); CHROME=(198,203,210); DARK=(24,26,30); RUBBER=(18,18,20); STEEL=(58,62,70); UNDER=(30,32,36)
RED=(196,28,22); AMBER=(236,146,28); LENS=(240,238,226); TRIM=(70,98,132); TRIMD=(44,62,88); CARPET=(40,44,52); GREY=(96,100,106); ENG=(34,78,138); ORANGE=(232,104,22)
lin=lambda c:[(x/255)**2.2 for x in c]
sub=lambda a,b:[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
cross=lambda u,v:[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
dot=lambda u,v:u[0]*v[0]+u[1]*v[1]+u[2]*v[2]
class Mesh:
    # faces flat-shaded, each with its own corners; a face is turned to face `out` (a direction) when one is given
    def __init__(s): s.g={}
    def grp(s,tag,e=None,k=1): return s.g.setdefault(tag,{'e':lin(e) if e else None,'k':k,'t':tag,'p':[],'n':[],'c':[],'i':[]})
    def poly(s,P,col,out=None,tag='',e=None):
        n=[0,0,0]
        for i in range(1,len(P)-1):
            c=cross(sub(P[i],P[0]),sub(P[i+1],P[0])); n=[n[0]+c[0],n[1]+c[1],n[2]+c[2]]
        l=dot(n,n)**.5
        if l<1e-12: return
        n=[x/l for x in n]
        if out is not None and dot(n,out)<0: P=P[::-1]; n=[-x for x in n]
        g=s.grp(tag,e); b=len(g['p'])//3; c=lin(col)
        for p in P: g['p'].extend(p); g['n'].extend(n); g['c'].extend(c)
        for i in range(1,len(P)-1): g['i'].extend([b,b+i,b+i+1])
    def box(s,lo,hi,col,tag='',e=None,rot=None,skip=''):
        # rot: (axis, angle, pivot) turns the box; skip: faces left out, of x X y Y z Z (low, high)
        x0,y0,z0=lo; x1,y1,z1=hi
        F={'x':([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]),'X':([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0]),
           'y':([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]),'Y':([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0]),
           'z':([x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],[0,0,-1]),'Z':([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1])}
        for k,(a,b,c,d,n) in F.items():
            if k in skip: continue
            P=[a,b,c,d]
            if rot: P=[turn(p,*rot) for p in P]; n=turn(n,rot[0],rot[1],[0,0,0])
            s.poly(P,col,n,tag,e)
    def cyl(s,c,ax,r,h,col,n=12,caps=True,r2=None,tag='',e=None,capcol=None):
        # a cylinder (or cone, r2) from c along axis ax ('x','y','z') for h
        r2=r if r2 is None else r2
        def pt(rr,a,t):
            u,v=rr*math.cos(a),rr*math.sin(a)
            return {'x':[c[0]+t,c[1]+u,c[2]+v],'y':[c[0]+v,c[1]+t,c[2]+u],'z':[c[0]+u,c[1]+v,c[2]+t]}[ax]
        A=[2*math.pi*i/n for i in range(n+1)]; axis={'x':[1,0,0],'y':[0,1,0],'z':[0,0,1]}[ax]
        for i in range(n):
            P=[pt(r,A[i],0),pt(r,A[i+1],0),pt(r2,A[i+1],h),pt(r2,A[i],h)]; m=pt((r+r2)/2,(A[i]+A[i+1])/2,h/2); mid=pt(0,0,h/2)
            s.poly(P,col,sub(m,mid),tag,e)
        if caps:
            sg=1 if h>0 else -1
            if r>1e-6: s.poly([pt(r,a,0) for a in A[:-1]],capcol or col,[-sg*x for x in axis],tag,e)
            if r2>1e-6: s.poly([pt(r2,a,h) for a in A[:-1]],capcol or col,[sg*x for x in axis],tag,e)
    def lathe(s,prof,n,ax='x'):
        # prof: [(along the axis, radius, colour of the band up to the next point)], turned about the axis through the origin
        for j in range(len(prof)-1):
            (t0,r0,col),(t1,r1,_)=prof[j],prof[j+1]
            for i in range(n):
                a0,a1=2*math.pi*i/n,2*math.pi*(i+1)/n
                def pt(t,r,a): return [t,r*math.cos(a),r*math.sin(a)]
                P=[pt(t0,r0,a0),pt(t0,r0,a1),pt(t1,r1,a1),pt(t1,r1,a0)]
                if r0<1e-6: P=P[1:]
                elif r1<1e-6: P=P[:3]
                am=(a0+a1)/2; nrm=[-(r1-r0),(t1-t0)*math.cos(am),(t1-t0)*math.sin(am)]
                s.poly(P,col,nrm)
    def add(s,o,move=(0,0,0)):
        for tag,g in o.g.items():
            t=s.grp(tag); t['e']=g['e']; b=len(t['p'])//3
            for v in range(len(g['p'])//3): t['p'].extend([g['p'][v*3+k]+move[k] for k in range(3)])
            t['n'].extend(g['n']); t['c'].extend(g['c']); t['i'].extend(b+x for x in g['i'])
    def tris(s): return sum(len(g['i']) for g in s.g.values())//3
def turn(p,ax,a,o):
    c,s=math.cos(a),math.sin(a); x,y,z=p[0]-o[0],p[1]-o[1],p[2]-o[2]
    if ax=='x': y,z=y*c-z*s,y*s+z*c
    elif ax=='y': x,z=x*c+z*s,-x*s+z*c
    else: x,y=x*c-y*s,x*s+y*c
    return [x+o[0],y+o[1],z+o[2]]

# ---------- the measures ----------
HW=.92; SILL=.27; DOORB=.34; BELT=.93; ZF=2.50; ZB=-2.50; AXF=1.50; AXR=-1.36; WR=.335; ARCH=.425; TRACK=.775
GT=1.33                                   # the top of the side glass
FD=(.93,-.10); RD=(-.14,-.96)             # the front and rear doors, front edge to rear edge
def xs(y): t=(y-.62)/.34; return HW-.035*t*t                    # the body side, bowed
def xg(y): return .875-(y-BELT)/(GT-BELT)*.147                  # the side glass, leaning in
BANDS=[(SILL,.40,BLUE),(.40,.56,BLUE),(.56,.67,WHITE),(.67,.80,BLUE),(.80,.912,BLUE),(.912,BELT,CHROME)]
def bot(z):
    b=SILL if AXR<z<AXF else .335
    for za in (AXF,AXR):
        d=abs(z-za)
        if d<ARCH: b=max(b,WR+(ARCH*ARCH-d*d)**.5)
    return b
def stations(z0,z1,dz=.26):
    Z={round(z0,4),round(z1,4)}; n=max(1,round(abs(z1-z0)/dz))
    for i in range(n+1): Z.add(round(z0+(z1-z0)*i/n,4))
    for za in (AXF,AXR):
        for i in range(13):
            z=round(za+ARCH*math.cos(math.pi*i/12),4)
            if min(z0,z1)<z<max(z0,z1): Z.add(z)
    return sorted(Z)
def side(m,sd,z0,z1,bands=BANDS,low=None,dx=0):
    Z=stations(z0,z1); low=low or bot
    for a,b in zip(Z,Z[1:]):
        for ya,yb,col in bands:
            la,lb=min(yb,max(ya,low(a))),min(yb,max(ya,low(b)))
            if yb-la<1e-6 and yb-lb<1e-6: continue
            P=[[sd*(xs(la)+dx),la,a],[sd*(xs(lb)+dx),lb,b],[sd*(xs(yb)+dx),yb,b],[sd*(xs(yb)+dx),yb,a]]
            if yb-la<1e-6: P=P[1:]
            elif yb-lb<1e-6: P=[P[0],P[2],P[3]]
            m.poly(P,col,[sd,0,0])

def body():
    m=Mesh()
    for sd in (1,-1):
        side(m,sd,FD[0],ZF); side(m,sd,ZB,RD[1])                                    # the front fender, the rear quarter
        side(m,sd,RD[1],FD[0],[(SILL,DOORB,BLUE)])                                   # the rocker under the doors
        m.box([sd*.80 if sd>0 else -.895,SILL,RD[1]],[.895 if sd>0 else -.80,DOORB,FD[0]],CHROME,skip='y'+('X' if sd>0 else 'x'))   # the door sill
        # the wheel houses: the arch's inside and its back wall
        for za in (AXF,AXR):
            A=[math.pi*i/12 for i in range(13)]; xo=lambda y:sd*xs(max(y,SILL)); xi=sd*.50
            for a0,a1 in zip(A,A[1:]):
                p0=[za+ARCH*math.cos(a0),WR+ARCH*math.sin(a0)]; p1=[za+ARCH*math.cos(a1),WR+ARCH*math.sin(a1)]
                m.poly([[xo(p0[1]),p0[1],p0[0]],[xo(p1[1]),p1[1],p1[0]],[xi,p1[1],p1[0]],[xi,p0[1],p0[0]]],DARK,[0,WR-(p0[1]+p1[1])/2,za-(p0[0]+p1[0])/2])
            m.poly([[xi,WR+ARCH*math.sin(a),za+ARCH*math.cos(a)] for a in A],DARK,[sd,0,0])
        # the fender and quarter tops, in to the hood and the trunk lid
        for z0,z1,y0,y1 in ((1.10,2.46,.952,.925),(-2.46,-1.42,.93,.952)):
            m.poly([[sd*.80,y0,z0],[sd*.80,y1,z1],[sd*xs(BELT),BELT,z1],[sd*xs(BELT),BELT,z0]],BLUE,[0,1,0])
        m.poly([[sd*.80,.952,1.10],[sd*xs(BELT),BELT,1.10],[sd*xs(BELT),BELT,FD[0]],[sd*.875,BELT,FD[0]],[sd*.875,.95,1.0],[sd*.80,.955,1.0]],BLUE,[0,1,0])   # beside the cowl
        m.poly([[sd*.80,.952,-1.42],[sd*xs(BELT),BELT,-1.42],[sd*xs(BELT),BELT,RD[1]],[sd*.875,BELT,RD[1]],[sd*.875,.95,-1.40],[sd*.78,.965,-1.38]],BLUE,[0,1,0])   # beside the rear deck
        # the pillars and the roof's edge, white with the top
        m.poly([[sd*.875,BELT,FD[0]],[sd*.875,.95,1.0],[sd*.70,1.36,.43],[sd*xg(GT),GT,.47]],WHITE,[sd,0,.3])
        m.poly([[sd*.875,.95,1.0],[sd*.80,.955,.99],[sd*.66,1.36,.44],[sd*.70,1.36,.43]],WHITE,[sd*.5,0,1])
        m.poly([[sd*.875,BELT,RD[1]],[sd*.875,.95,-1.40],[sd*.70,1.36,-.93],[sd*xg(GT),GT,-.90]],WHITE,[sd,0,-.2])
        m.poly([[sd*.875,.95,-1.40],[sd*.78,.965,-1.38],[sd*.62,1.36,-.92],[sd*.70,1.36,-.93]],WHITE,[sd*.5,.3,-1])
        m.poly([[sd*.70,1.36,.43],[sd*.70,1.36,-.93],[sd*xg(GT),GT,-.90],[sd*xg(GT),GT,.47]],WHITE,[sd,1,0])
        m.poly([[sd*(xg(GT)+.012),GT+.012,.46],[sd*(xg(GT)+.012),GT+.012,-.91],[sd*(xg(GT)+.012),GT-.006,-.91],[sd*(xg(GT)+.012),GT-.006,.46]],CHROME,[sd,0,0])   # the drip rail
        for y0,y1 in ((BELT,GT),):                                                   # the B pillar, outside and in
            for dx,col,o in ((-.012,WHITE,sd),(-.06,TRIM,-sd)):
                m.poly([[sd*(xg(y0)+dx),y0,-.085],[sd*(xg(y0)+dx),y0,-.155],[sd*(xg(y1)+dx),y1,-.155],[sd*(xg(y1)+dx),y1,-.085]],col,[o,0,0])
            for z in (-.085,-.155):
                m.poly([[sd*(xg(y0)-.012),y0,z],[sd*(xg(y0)-.06),y0,z],[sd*(xg(y1)-.06),y1,z],[sd*(xg(y1)-.012),y1,z]],TRIM,[0,0,1 if z>-.1 else -1])
        m.box([sd*.80 if sd>0 else -.86,DOORB,-.155],[.86 if sd>0 else -.80,BELT,-.085],TRIM,skip='yY')   # the B post below the belt
        # inside: the kick panel, the quarter trim
        m.poly([[sd*.82,.30,FD[0]],[sd*.82,.30,1.0],[sd*.82,BELT,1.0],[sd*.82,BELT,FD[0]]],TRIM,[-sd,0,0])
        m.poly([[sd*.82,.30,RD[1]],[sd*.82,.30,-1.40],[sd*.82,BELT,-1.40],[sd*.82,BELT,RD[1]]],TRIM,[-sd,0,0])
        for z in (FD[0],RD[1]): m.poly([[sd*.82,.30,z],[sd*.885,.30,z],[sd*.885,BELT,z],[sd*.82,BELT,z]],BLUE,[0,0,-1 if z>0 else 1])   # the door jambs
        # the side marker lamps and the fuel door
        m.box([sd*(xs(.62)-.004) if sd>0 else sd*(xs(.62)+.008),.60,2.28],[sd*(xs(.62)+.008) if sd>0 else sd*(xs(.62)-.004),.64,2.42],AMBER,'turn',AMBER)
        m.box([sd*(xs(.62)-.004) if sd>0 else sd*(xs(.62)+.008),.60,-2.42],[sd*(xs(.62)+.008) if sd>0 else sd*(xs(.62)-.004),.64,-2.28],RED,'tail',RED)
    m.poly([[xs(.86)+.004,.73,-1.98],[xs(.86)+.004,.73,-1.80],[xs(.86)+.004,.89,-1.80],[xs(.86)+.004,.89,-1.98]],(80,144,192),[1,0,0])   # the fuel door, on the driver's side
    # the roof, crowned, and its inside edge at the screens
    X=[-.70,-.42,0,.42,.70]; Yc=[1.36,1.392,1.40,1.392,1.36]; Zr=[.43,.28,-.34,-.78,-.93]; dip=[.012,0,0,0,.012]
    for j in range(4):
        for i in range(4):
            m.poly([[X[i],Yc[i]-dip[j]*(1 if 0<i else 0),Zr[j]],[X[i+1],Yc[i+1]-dip[j]*(1 if i+1<4 else 0),Zr[j]],[X[i+1],Yc[i+1]-dip[j+1]*(1 if i+1<4 else 0),Zr[j+1]],[X[i],Yc[i]-dip[j+1]*(1 if 0<i else 0),Zr[j+1]]],WHITE,[0,1,0])
    # the cowl with its wipers, the rear deck
    m.poly([[-.80,.952,1.10],[.80,.952,1.10],[.80,.955,.99],[-.80,.955,.99]],DARK,[0,1,0])
    for x0 in (.08,-.62): m.box([x0,.972,.955],[x0+.54,.984,.975],DARK,rot=('x',-.2,[0,.978,.965]))
    for x0 in (.34,-.36): m.box([x0,.955,.99],[x0+.03,.98,1.03],DARK)
    m.poly([[-.78,.965,-1.38],[.78,.965,-1.38],[.80,.952,-1.42],[-.80,.952,-1.42]],BLUE,[0,1,0])
    # the floor pan and the firewall, the shelf under the rear window
    m.poly([[-.86,SILL,ZB+.06],[.86,SILL,ZB+.06],[.86,SILL,ZF-.06],[-.86,SILL,ZF-.06]],UNDER,[0,-1,0])
    m.poly([[-.86,SILL,1.0],[.86,SILL,1.0],[.86,.955,1.0],[-.86,.955,1.0]],DARK,[0,0,-1])
    m.poly([[-.86,.95,.94],[.86,.95,.94],[.86,.955,1.0],[-.86,.955,1.0]],DARK,[0,1,0])
    m.poly([[-.82,.94,-1.18],[.82,.94,-1.18],[.80,.96,-1.40],[-.80,.96,-1.40]],TRIMD,[0,1,0])
    m.poly([[-.86,SILL,-1.40],[.86,SILL,-1.40],[.86,.955,-1.40],[-.86,.955,-1.40]],DARK,[0,0,1])
    front(m); rear(m); engine(m); trunkwell(m)
    # the aerials: the radio's whip on the roof, the car radio's on the right fender
    m.cyl([0,1.398,-.70],'y',.028,.03,DARK,8); m.cyl([0,1.428,-.70],'y',.012,.05,CHROME,6); m.cyl([0,1.478,-.70],'y',.005,.62,DARK,5)
    m.cyl([-.84,.93,1.25],'y',.012,.02,CHROME,6); m.cyl([-.84,.95,1.25],'y',.004,.52,CHROME,4)
    return m
def lamps(m,z,face,x0,x1,y0,y1,col,tag,d=.012):
    lo,hi=(z,z+d) if face>0 else (z-d,z)
    for sd in (1,-1): m.box([min(sd*x0,sd*x1),y0,lo],[max(sd*x0,sd*x1),y1,hi],col,tag,col)
def bumper(m,z,face):
    a,b=(z-.04,z+.10) if face>0 else (z-.10,z+.04)
    m.box([-.90,.36,a],[.90,.505,b],CHROME); m.box([-.905,.418,b if face>0 else a-.008],[.905,.447,b+.008 if face>0 else a],RUBBER)
    for sd in (1,-1):
        zz=(z-.34,b) if face>0 else (a,z+.34)
        m.box([min(sd*.885,sd*.95),.36,zz[0]],[max(sd*.885,sd*.95),.505,zz[1]],CHROME)
        m.box([min(sd*.945,sd*.958),.418,zz[0]+.02],[max(sd*.945,sd*.958),.447,zz[1]-.02],RUBBER)
        g=(b,b+.045) if face>0 else (a-.045,a); m.box([sd*.34-.035,.335,g[0]],[sd*.34+.035,.56,g[1]],RUBBER)
    v=(z-.2,z) if face>0 else (z,z+.2); m.box([-.86,.30,v[0]],[.86,.37,v[1]],UNDER)
def front(m):
    z=ZF
    m.poly([[-.895,.335,z],[.895,.335,z],[.895,.925,z],[-.895,.925,z]],BLUE,[0,0,1])
    m.poly([[-.80,.925,2.46],[.80,.925,2.46],[.895,.925,z],[-.895,.925,z]],BLUE,[0,1,0])
    # the grille: a chrome surround, fine upright bars, the centre bar
    m.box([-.43,.585,z],[.43,.875,z+.008],DARK)
    for x0,y0,x1,y1 in ((-.44,.865,.44,.885),(-.44,.575,.44,.595),(-.44,.575,-.42,.885),(.42,.575,.44,.885),(-.014,.575,.014,.885),(-.44,.722,.44,.738)): m.box([x0,y0,z],[x1,y1,z+.022],CHROME)
    for i in range(1,14):
        for sd in (1,-1): x=sd*(.014+i*.029); m.box([x-.005,.595,z],[x+.005,.865,z+.016],CHROME,skip='z')
    # two square lamps a side in a chrome bezel, the parking lamps under them
    for sd in (1,-1):
        m.box([min(sd*.455,sd*.885),.69,z],[max(sd*.455,sd*.885),.875,z+.006],CHROME)
        m.box([min(sd*.455,sd*.885),.585,z],[max(sd*.455,sd*.885),.675,z+.006],CHROME)
    lamps(m,z+.006,1,.475,.66,.71,.855,LENS,'head'); lamps(m,z+.006,1,.68,.865,.71,.855,LENS,'head'); lamps(m,z+.006,1,.475,.865,.60,.66,AMBER,'turn')
    bumper(m,z,1)
def rear(m):
    z=ZB
    m.poly([[-.895,.335,z],[.895,.335,z],[.895,.86,z],[-.895,.86,z]],BLUE,[0,0,-1])
    for sd in (1,-1):
        m.box([min(sd*.30,sd*.885),.645,z-.006],[max(sd*.30,sd*.885),.835,z],CHROME)
        for y in (.70,.76): m.box([min(sd*.32,sd*.865),y+.012,z-.024],[max(sd*.32,sd*.865),y+.02,z-.006],CHROME)
    lamps(m,z-.006,-1,.47,.865,.665,.815,RED,'tail'); lamps(m,z-.006,-1,.32,.46,.665,.815,LENS,'rev')
    m.box([-.21,.655,z-.008],[.21,.825,z],DARK)                                    # the plate's recess
    for x0,y0,x1,y1 in ((-.22,.82,.22,.835),(-.22,.645,.22,.66),(-.22,.645,-.205,.835),(.205,.645,.22,.835)): m.box([x0,y0,z-.014],[x1,y1,z],CHROME)
    bumper(m,z,-1)
    m.cyl([-.56,.31,z-.07],'z',.032,.3,STEEL,8,capcol=DARK)                         # the tailpipe
def engine(m):
    # under the hood: the bay, the V8 with its air cleaner, the battery, the radiator and its fan, the washer bottle, the brake cylinder
    x,y0,z0,z1=.78,.47,1.02,2.42
    for P,o in (([[-x,y0,z0],[x,y0,z0],[x,y0,z1],[-x,y0,z1]],[0,1,0]),([[-x,y0,z0],[x,y0,z0],[x,.94,z0],[-x,.94,z0]],[0,0,1]),([[-x,y0,z1],[x,y0,z1],[x,.92,z1],[-x,.92,z1]],[0,0,-1]),
                ([[x,y0,z0],[x,y0,z1],[x,.92,z1],[x,.94,z0]],[-1,0,0]),([[-x,y0,z0],[-x,y0,z1],[-x,.92,z1],[-x,.94,z0]],[1,0,0])): m.poly(P,DARK,o)
    m.box([-.24,.47,1.22],[.24,.74,1.92],ENG)
    for sd in (1,-1): m.box([min(sd*.12,sd*.36),.70,1.26],[max(sd*.12,sd*.36),.80,1.88],STEEL,rot=('z',-sd*.5,[sd*.24,.72,0])); m.box([min(sd*.26,sd*.40),.52,1.30],[max(sd*.26,sd*.40),.60,1.84],(120,70,40))   # the heads' covers, the manifolds
    m.cyl([0,.80,1.56],'y',.215,.075,RUBBER,16,capcol=(40,44,50)); m.cyl([0,.875,1.56],'y',.19,.012,CHROME,16); m.cyl([0,.887,1.56],'y',.014,.02,CHROME,6)   # the air cleaner
    m.box([.44,.56,1.92],[.70,.76,2.10],RUBBER); m.cyl([.50,.76,1.97],'y',.014,.022,GREY,6); m.cyl([.64,.76,1.97],'y',.014,.022,RED,6)     # the battery
    m.box([-.52,.50,2.28],[.52,.90,2.36],STEEL); m.cyl([.30,.90,2.32],'y',.03,.02,CHROME,8)                                              # the radiator and its cap
    m.cyl([0,.70,2.18],'z',.21,.08,RUBBER,12,capcol=GREY)                                                                                 # the fan's shroud
    m.box([-.72,.60,1.95],[-.50,.80,2.12],(214,218,210))                                                                                  # the washer bottle
    m.box([.42,.80,1.04],[.56,.88,1.20],STEEL); m.cyl([.49,.80,1.06],'z',.05,.1,STEEL,8)                                                  # the brake master cylinder
    for sd in (1,-1): m.cyl([sd*.3,.78,1.04],'z',.03,.2,RUBBER,6)                                                                         # the heater hoses
def trunkwell(m):
    # in the trunk: the well, the spare, flares, two cones, an extinguisher, a first-aid box
    x,y0,z0,z1=.76,.50,-2.42,-1.44
    for P,o in (([[-x,y0,z0],[x,y0,z0],[x,y0,z1],[-x,y0,z1]],[0,1,0]),([[-x,y0,z1],[x,y0,z1],[x,.945,z1],[-x,.945,z1]],[0,0,-1]),([[-x,y0,z0],[x,y0,z0],[x,.86,z0],[-x,.86,z0]],[0,0,1]),
                ([[x,y0,z0],[x,y0,z1],[x,.945,z1],[x,.92,z0]],[-1,0,0]),([[-x,y0,z0],[-x,y0,z1],[-x,.945,z1],[-x,.92,z0]],[1,0,0])): m.poly(P,(52,55,60),o)
    m.cyl([-.34,.50,-1.86],'y',.33,.2,RUBBER,16,capcol=RUBBER); m.cyl([-.34,.70,-1.86],'y',.19,.012,STEEL,14); m.cyl([-.34,.71,-1.86],'y',.085,.02,CHROME,10)
    m.box([.20,.50,-1.74],[.62,.60,-1.52],RED); m.box([.24,.60,-1.70],[.58,.605,-1.56],WHITE)                       # the flare box
    for dy in (0,.07): m.box([.26,.50+dy,-2.34],[.56,.52+dy,-2.04],ORANGE); m.cyl([.41,.52+dy,-2.19],'y',.12,.34,ORANGE,10,r2=.03)   # the cones
    m.cyl([.12,.55,-2.30],'x',.055,.36,RED,10,capcol=STEEL); m.cyl([.07,.55,-2.30],'x',.02,.05,DARK,6)             # the extinguisher
    m.box([-.10,.50,-1.66],[.14,.64,-1.50],WHITE); m.box([-.01,.641,-1.62],[.05,.643,-1.54],RED); m.box([-.04,.641,-1.60],[.08,.643,-1.56],RED)   # the first-aid box
def glass():
    m=Mesh()
    m.poly([[-.80,.955,.99],[.80,.955,.99],[.66,1.36,.44],[-.66,1.36,.44]],DARK,[0,.6,1])
    m.poly([[-.78,.965,-1.38],[.78,.965,-1.38],[.62,1.36,-.92],[-.62,1.36,-.92]],DARK,[0,.6,-1])
    return m
def door(sd,zf,zr,ztop_f,ztop_r,mirror):
    # a door in the car's frame: its skin, edges and inner panel, the window's frame; its glass apart
    m=Mesh(); g=Mesh(); xi=.80
    side(m,sd,zr+.006,zf-.006,[(DOORB,.40,BLUE),(.40,.56,BLUE),(.56,.67,WHITE),(.67,.80,BLUE),(.80,.912,BLUE),(.912,BELT,CHROME)],low=lambda z:DOORB)
    for z,o in ((zf-.006,1),(zr+.006,-1)): m.poly([[sd*xi,DOORB,z],[sd*xs(DOORB),DOORB,z],[sd*xs(.62),.62,z],[sd*xs(BELT),BELT,z],[sd*xi,BELT,z]],BLUE,[0,0,o])
    m.poly([[sd*xi,DOORB,zr],[sd*xs(DOORB),DOORB,zr],[sd*xs(DOORB),DOORB,zf],[sd*xi,DOORB,zf]],BLUE,[0,-1,0])
    m.poly([[sd*xi,BELT,zr],[sd*xg(BELT),BELT,zr],[sd*xg(BELT),BELT,zf],[sd*xi,BELT,zf]],TRIMD,[0,1,0])
    # inside: the panel, its carpeted foot, the armrest and pull, the handle, the window's crank
    m.poly([[sd*xi,.50,zr],[sd*xi,.50,zf],[sd*xi,BELT,zf],[sd*xi,BELT,zr]],TRIM,[-sd,0,0]); m.poly([[sd*xi,DOORB,zr],[sd*xi,DOORB,zf],[sd*xi,.50,zf],[sd*xi,.50,zr]],CARPET,[-sd,0,0])
    L=zf-zr; zc=zr+L*.42
    m.box([min(sd*xi,sd*(xi-.065)),.66,zc-.24],[max(sd*xi,sd*(xi-.065)),.71,zc+.2],TRIMD); m.box([min(sd*(xi-.02),sd*(xi-.05)),.71,zc-.12],[max(sd*(xi-.02),sd*(xi-.05)),.735,zc+.1],CHROME)
    m.box([min(sd*xi,sd*(xi-.02)),.80,zf-.34],[max(sd*xi,sd*(xi-.02)),.83,zf-.22],CHROME)
    m.cyl([sd*xi,.60,zf-.30],'x',.022,-sd*.03,CHROME,8); m.box([min(sd*(xi-.03),sd*(xi-.045)),.59,zf-.31],[max(sd*(xi-.03),sd*(xi-.045)),.61,zf-.22],CHROME); m.cyl([sd*(xi-.045),.60,zf-.22],'x',.016,-sd*.03,DARK,6)
    m.box([min(sd*xi,sd*(xi-.004)),.52,zr+.08],[max(sd*xi,sd*(xi-.004)),.64,zr+.3],TRIMD)                       # the speaker's grille
    # outside: the handle, the lock
    m.box([min(sd*(xs(.85)-.002),sd*(xs(.85)+.016)),.835,zr+.06],[max(sd*(xs(.85)-.002),sd*(xs(.85)+.016)),.87,zr+.2],CHROME); m.cyl([sd*xs(.80),.80,zr+.1],'x',.012,sd*.008,CHROME,6)
    # the window's frame: outside, inside and the inner edge; the glass a finger inside it
    O=[[zf-.006,BELT],[ztop_f,GT],[ztop_r,GT],[zr+.006,BELT]]; w=.04
    sl=abs(ztop_f-(zf-.006))>.05; I=[[zf-.006-w*(1.8 if sl else 1),BELT],[ztop_f-w*(.7 if sl else 1),GT-w],[ztop_r+w,GT-w],[zr+.006+w,BELT]]
    P=lambda q,dx:[sd*(xg(q[1])+dx),q[1],q[0]]
    for k in range(3):
        a,b,c,d=O[k],O[k+1],I[k+1],I[k]
        m.poly([P(a,0),P(b,0),P(c,0),P(d,0)],WHITE,[sd,0,0]); m.poly([P(a,-.035),P(b,-.035),P(c,-.035),P(d,-.035)],TRIM,[-sd,0,0])
        mid=[(a[0]+b[0])/2,(a[1]+b[1])/2]; cen=[(zf+zr)/2,(BELT+GT)/2]
        m.poly([P(d,0),P(c,0),P(c,-.035),P(d,-.035)],CHROME,[0,cen[1]-mid[1],cen[0]-mid[0]])
        m.poly([P(a,0),P(b,0),P(b,-.035),P(a,-.035)],WHITE,[0,mid[1]-cen[1],mid[0]-cen[0]])
    g.poly([P(I[0],-.018),P(I[1],-.018),P(I[2],-.018),P(I[3],-.018)],DARK,[sd,0,0])
    if mirror:   # the door mirror: a chrome head on a foot
        zm=zf-.10; m.box([min(sd*.885,sd*.94),.965,zm-.02],[max(sd*.885,sd*.94),.985,zm+.02],CHROME); m.box([min(sd*.93,sd*1.05),.95,zm-.03],[max(sd*.93,sd*1.05),1.05,zm+.025],CHROME,skip='z'); m.poly([[sd*.935,.955,zm-.03],[sd*1.045,.955,zm-.03],[sd*1.045,1.045,zm-.03],[sd*.935,1.045,zm-.03]],(150,170,190),[0,0,-1])
    return m,g
def lid(z0,z1,y0,y1,zl,under):
    # the hood or the trunk lid: its top (crowned a little), the lip at its far end, a dark lining under it
    m=Mesh(); X=[-.80,-.40,0,.40,.80]; cr=[0,.008,.012,.008,0]; Z=[z0+(z1-z0)*i/3 for i in range(4)]; o=[0,0,1 if z1>z0 else -1]
    for j in range(3):
        for i in range(4):
            y=lambda z:y0+(y1-y0)*(z-z0)/(z1-z0)
            m.poly([[X[i],y(Z[j])+cr[i],Z[j]],[X[i+1],y(Z[j])+cr[i+1],Z[j]],[X[i+1],y(Z[j+1])+cr[i+1],Z[j+1]],[X[i],y(Z[j+1])+cr[i],Z[j+1]]],BLUE,[0,1,0])
    for i in range(4): m.poly([[X[i],y1+cr[i],z1],[X[i+1],y1+cr[i+1],z1],[X[i+1],.862,zl],[X[i],.862,zl]],BLUE,o)
    m.poly([[-.78,y0-.02,z0],[.78,y0-.02,z0],[.78,y1-.02,z1],[-.78,y1-.02,z1]],under,[0,-1,0])
    return m
def wheel():
    # one wheel about its axle, its face to -x: a black tyre on a black steel wheel, the small chrome cap of a police car
    m=Mesh(); T=RUBBER; W=(34,36,40)
    m.lathe([(-.108,0,CHROME),(-.112,.05,CHROME),(-.10,.088,CHROME),(-.085,.095,W),(-.07,.16,W),(-.09,.195,CHROME),(-.105,.205,T),(-.112,.25,T),(-.105,.305,T),(-.085,.335,T),(.085,.335,T),(.105,.305,T),(.105,.2,T),(.06,.19,W),(.06,0,W)],18)
    for i in range(8):   # the wheel's slots
        a=math.pi*2*i/8; c,s=math.cos(a),math.sin(a); m.box([-.082,.118,-.016],[-.076,.15,.016],DARK,rot=('x',a,[0,0,0]))
    return m
def pack(groups,move=(0,0,0)):
    out=[]
    for g in groups.values():
        if not g['i']: continue
        P=[g['p'][i]-move[i%3] for i in range(len(g['p']))]; mn=[min(P[k::3]) for k in range(3)]; mx=[max(P[k::3]) for k in range(3)]; sc=[(mx[k]-mn[k])/65534 or 1e-6 for k in range(3)]
        q=b''.join(struct.pack('<hhh',*[round((P[v*3+k]-mn[k])/sc[k])-32767 for k in range(3)]) for v in range(len(P)//3))
        nn=b''.join(struct.pack('<bbb',*[max(-127,min(127,round(x*127))) for x in g['n'][v*3:v*3+3]]) for v in range(len(P)//3))
        cc=bytes(max(0,min(255,round((x**(1/2.2))*255))) for x in g['c'])
        assert len(P)//3<65536; ii=struct.pack('<'+'H'*len(g['i']),*g['i']); e=lambda x:base64.b64encode(x).decode()
        o={'e':[round(x,3) for x in g['e']] if g['e'] else None,'k':1,'o':[round(x+32767*s,6) for x,s in zip(mn,sc)],'s':[round(x,8) for x in sc],'p':e(q),'n':e(nn),'c':e(cc),'i':e(ii)}
        if g.get('t'): o['t']=g['t']
        out.append(o)
    return out
def make():
    B=body(); G=glass(); W=wheel(); parts=[]; tris=B.tris()+G.tris()
    for sd,nm in ((1,'L'),(-1,'R')):
        for (zf,zr),tf,tr,fr in ((FD,.47,FD[1]+.006,'F'),(RD,RD[0]-.006,-.90,'R')):
            m,g=door(sd,zf,zr,tf,tr,fr=='F'); h=[sd*.875,0,zf-.006]; tris+=m.tris()+g.tris()
            parts.append({'n':'DOOR '+fr+nm,'use':'door','seat':fr=='F' and sd>0,'at':[round(x,4) for x in h],'ax':'y','open':round(-sd*1.15,3),'g':pack(m.g,h),'gl':pack(g.g,h)})
    for nm,m,h,op,bx in (('HOOD',lid(1.10,2.46,.952,.925,2.50,DARK),[0,.952,1.10],-.95,0),('TRUNK',lid(-1.42,-2.46,.952,.93,-2.50,(52,55,60)),[0,.952,-1.42],1.0,0)):
        if nm=='TRUNK': m.cyl([0,.89,-2.485],'z',.016,-.012,CHROME,8)
        tris+=m.tris(); parts.append({'n':nm,'use':nm.lower(),'at':h,'ax':'x','open':op,'g':pack(m.g,h),'gl':[]})
    P=[v for g in B.g.values() for v in g['p']]+[1.05,.5,0,-1.05,.5,0]; P[1::3]=[min(y,1.46) for y in P[1::3]]   # the body with its mirrors and light bar, not the aerials
    wy=WR; wheels=[[-TRACK,wy,AXF],[TRACK,wy,AXF],[-TRACK,wy,AXR],[TRACK,wy,AXR]]
    # where the game puts what it paints (150pe-carparts): the light bar, the plates, the lettering (on: the part it rides on; at, the way it faces, its size)
    S=lambda y:xs(y)+.005
    marks={'bar':[0,1.40,.06,1.24],'head':[.67,.78,ZF+.02],'tail':[.60,.74,ZB-.02],
      'decals':[{'k':'plate','at':[0,.43,ZF+.112],'f':'f','w':.305,'h':.155},{'k':'plate','at':[0,.74,ZB-.0085],'f':'b','w':.305,'h':.155},
        {'k':'roof','at':[0,1.403,-.28],'f':'u','w':.9,'h':.42},{'k':'trunk','at':[0,.957,-1.95],'f':'u','w':.62,'h':.2,'on':'TRUNK'},
        *[d for sd,s in ((1,'l'),(-1,'r')) for d in ({'k':'door','at':[sd*S(.79),.795,.40],'f':s,'w':.92,'h':.225,'on':'DOOR F'+s.upper()},{'k':'pct','at':[sd*S(.79),.79,-1.9],'f':s,'w':.44,'h':.11},
          {'k':'unit','at':[sd*S(.79),.79,1.02+.98],'f':s,'w':.34,'h':.11},{'k':'unit','at':[sd*.70,1.345,-1.12],'f':s,'w':.2,'h':.07,'tilt':.45})]]}
    return {'name':'POLICE CRUISER','size':[round(max(P[k::3])-min(P[k::3]),3) for k in range(3)],'low':round(min(P[1::3]),3),'wheels':wheels,'r':WR,'body':pack(B.g),'glass':pack(G.g),
            'cab':{'hw':.80,'belt':BELT,'z0':-1.30,'z1':.95,'roof':1.40,'dd':.42,'seat':-.12,'rear':-.98,'doors':1},'wheel':pack(W.g),'parts':parts,'marks':marks,'tris':[tris,W.tris()]}
if __name__=='__main__':
    f=os.path.join(ROOT,'data/cars.json'); J=json.load(open(f)); c=make(); J['cars']['police-cruiser-80s']=c
    s=json.dumps(J,separators=(',',':')); open(f,'w').write(s); print('police-cruiser-80s',c['size'],'triangles',c['tris'],'parts',[p['n'] for p in c['parts']],len(json.dumps(c))//1024,'KB of',len(s)//1024,'KB')
