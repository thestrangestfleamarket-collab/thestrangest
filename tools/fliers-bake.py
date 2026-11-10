# THE FLIERS: retro-futuristic hover cars modelled here in code and put into data/cars.json beside the cars (the same form: tools/cars-bake.py and
# tools/cruiser-bake.py, whose mesh helpers this uses): a smooth lofted body, a glass house, gull-wing doors on hinges, lamps by name, a hover pod at
# each corner where a car has wheels, fly: 1. No words on any (owner, 10 Nov 2026); a group's m is what it is made of (paint, chrome, glass, rubber, jet),
# for the game's materials. python3 -I tools/fliers-bake.py
import json, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cz={'__file__':os.path.join(ROOT,'tools/cruiser-bake.py'),'__name__':'cruiser'}; exec(compile(open(cz['__file__']).read(),'cruiser-bake','exec'),cz)
Mesh,pack,lin,sub,cross,dot,turn=cz['Mesh'],cz['pack'],cz['lin'],cz['sub'],cz['cross'],cz['dot'],cz['turn']
CHROME=(206,211,218); DARK=(22,24,28); UNDER=(34,36,42); RED=(214,30,24); AMBER=(240,150,30); LENS=(244,242,230); JET=(120,210,255); BLACK=(16,16,18); WHITEP=(240,240,236)
def smooth(P,N,col,m,tag='',e=None):
    # a polygon with its corners' own normals (a smooth skin)
    g=m.grp(tag,e); b=len(g['p'])//3; c=lin(col); f=[0,0,0]
    for i in range(1,len(P)-1):
        x=cross(sub(P[i],P[0]),sub(P[i+1],P[0])); f=[f[0]+x[0],f[1]+x[1],f[2]+x[2]]
    if dot(f,[sum(n[k] for n in N) for k in range(3)])<0: P=P[::-1]; N=N[::-1]
    for p,n in zip(P,N): g['p'].extend(p); g['n'].extend(n); g['c'].extend(c)
    for i in range(1,len(P)-1): g['i'].extend([b,b+i,b+i+1])
def cat(P,t):
    # Catmull-Rom through rows P (each a list of numbers, the first the key z, descending), at z=t
    for i in range(len(P)-1):
        if P[i][0]>=t>=P[i+1][0]:
            a=P[max(0,i-1)]; b=P[i]; c=P[i+1]; d=P[min(len(P)-1,i+2)]; u=(b[0]-t)/((b[0]-c[0]) or 1)
            return [.5*((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u*u*u) for k in range(len(b))]
    return P[0] if t>P[0][0] else P[-1]
def sm(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def ring(S):
    # a station's half cross-section, bottom centre to top centre: [x, y]; S: z, w, y0 (bottom), yb (belt), yt (top), wr (roof's half width)
    z,w,y0,yb,yt,wr=S; k=sm((yt-yb-.05)/.26); L=lambda a,b:[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]; h=yb-y0
    return [[0,y0],[w*.72,y0+.005],[w*.95,y0+h*.14],[w,y0+h*.36],[w*.995,yb-h*.34],[w*.985,yb-h*.16],[w*.95,yb-.012],[w*.9,yb+.012],L([w*.6,yb+.035],[wr,yt-.075]),L([w*.3,yb+.046],[wr*.74,yt-.012]),[0,yb+.05+(yt-yb-.05)*k]]
SEGS=10
def loft(spec):
    # the body's skin from its stations: every strip of it painted by what it is (seg 0-1 the belly, 2 the chrome skirt, 3 the side, 4 the band, 5 the side, 6 the belt line,
    # 7 the side glass or the deck, 8-9 the roof or a screen); a door's strips are left out of the body and returned for its part
    P=spec['st']; z1,z0=P[0][0],P[-1][0]; cut=sorted({round(z,4) for z in [spec['cowl'],spec['a'],spec['b'],spec['deck'],*[q for d in spec['doors'] for q in d['z']]]})
    n=max(8,round((z1-z0)/.11)); Z=sorted({round(z1+(z0-z1)*i/n,4) for i in range(n+1)}|set(cut),reverse=True)
    Z=[z for i,z in enumerate(Z) if i==0 or abs(z-Z[i-1])>.02 or z in cut]
    R=[[ [sd*x,y,z] for x,y in ring(cat(P,z))] for z in Z for sd in (1,)]
    def nrm(i,j):
        a=R[max(0,i-1)][j]; b=R[min(len(R)-1,i+1)][j]; c=R[i][max(0,j-1)]; d=R[i][min(SEGS,j+1)]; n=cross(sub(d,c),sub(b,a)); p=R[i][j]; S=cat(P,Z[i]); o=[p[0],p[1]-(S[2]+S[4])/2,0]
        if j in (0,SEGS): n=[0,n[1],n[2]]; o=[0,-1 if j==0 else 1,0]
        if dot(n,o)<0: n=[-x for x in n]
        l=dot(n,n)**.5 or 1; return [x/l for x in n]
    N=[[nrm(i,j) for j in range(SEGS+1)] for i in range(len(R))]
    body=Mesh(); glass=Mesh(); doors=[(Mesh(),Mesh()) for d in spec['doors'] for sd in (1,-1)]
    pal=spec['paint']; band=spec.get('band')
    for i in range(len(Z)-1):
        zm=(Z[i]+Z[i+1])/2
        for j in range(SEGS):
            for sd in (1,-1):
                q=[R[i][j],R[i][j+1],R[i+1][j+1],R[i+1][j]]; qn=[N[i][j],N[i][j+1],N[i+1][j+1],N[i+1][j]]
                if sd<0: q=[[-p[0],p[1],p[2]] for p in q][::-1]; qn=[[-p[0],p[1],p[2]] for p in qn][::-1]
                screen=spec['a']<zm<spec['cowl'] or spec['deck']<zm<spec['b']; house=spec['b']<zm<spec['a']
                col=UNDER if j<2 else (UNDER if spec.get('skirt') else CHROME) if j==2 else CHROME if j==6 else pal; tgt=body; gl=False
                if j==4 and band: col=band(zm,sd) if callable(band) else band
                if j==7 and (screen or house and zm>spec.get('glassTo',-99)): gl=True
                if j>=8 and screen: gl=True
                if j>=8 and house and spec.get('roof'): col=spec['roof']
                di=next((k for k,d in enumerate(spec['doors']) if d['z'][1]<zm<d['z'][0] and d['segs'][0]<=j<=d['segs'][1]),None)
                if di is not None: tgt,gt=doors[di*2+(0 if sd>0 else 1)]
                else: gt=glass
                if gl: smooth(q,qn,DARK,gt)
                else: smooth(q,qn,col,tgt)
    # the nose and the tail closed
    for i,o in ((0,1),(len(R)-1,-1)):
        for sd in (1,-1): body.poly([[sd*p[0],p[1],p[2]] for p in R[i]],pal,[0,0,o])
    return body,glass,doors,Z,R
def pod():
    # a hover pod about its centre: a chrome ring, the jet's glow under it
    m=Mesh(); m.cyl([0,-.03,0],'y',.2,.05,CHROME,16,r2=.17,capcol=DARK); m.cyl([0,-.04,0],'y',.15,.012,JET,12,tag='jet',e=JET)
    return m
def checker(zm,sd): return None
def car(spec):
    P=spec['st']; body,glass,doors,Z,R=loft(spec); at=lambda z:cat(P,z); parts=[]; tris=0
    # chequers on the band (a taxi): two rows of small squares over it
    if spec.get('check'):
        s=.085
        for sd in (1,-1):
            z=spec['check'][0]
            while z-s>spec['check'][1]:
                for r in range(2):
                    A=ring(at(z)); B=ring(at(z-s)); la=[A[4][k]+(A[5][k]-A[4][k])*r/2 for k in (0,1)]; lb=[A[4][k]+(A[5][k]-A[4][k])*(r+1)/2 for k in (0,1)]; ma=[B[4][k]+(B[5][k]-B[4][k])*r/2 for k in (0,1)]; mb=[B[4][k]+(B[5][k]-B[4][k])*(r+1)/2 for k in (0,1)]
                    col=BLACK if (round((spec['check'][0]-z)/s)+r)%2 else WHITEP; d=.004
                    inD=next((k for k,dd in enumerate(spec['doors']) if dd['z'][1]<z-s/2<dd['z'][0]),None); tg=doors[inD*2+(0 if sd>0 else 1)][0] if inD is not None else body
                    tg.poly([[sd*(la[0]+d),la[1],z],[sd*(lb[0]+d),lb[1],z],[sd*(mb[0]+d),mb[1],z-s],[sd*(ma[0]+d),ma[1],z-s]],col,[sd,0,0])
                z-=s
    zn=P[0][0]; zt=P[-1][0]
    # the nose: round lamps in chrome rings, a chrome bumper bar, a hood spear; the tail: fins, round jet lamps, a bumper bar
    S=at(zn-.12); hy=S[2]+(S[3]-S[2])*.62
    for sd in (() if spec.get('plain') else (1,-1)):
        x=sd*S[1]*.62; body.cyl([x,hy,zn-.1],'z',.1,.13,CHROME,14,capcol=DARK); body.cyl([x,hy,zn+.03],'z',.082,.012,LENS,14,tag='head',e=LENS)
        body.cyl([sd*S[1]*.28,hy,zn-.05],'z',.045,.07,CHROME,10,capcol=DARK); body.cyl([sd*S[1]*.28,hy,zn+.02],'z',.036,.008,AMBER,10,tag='turn',e=AMBER)
    if not spec.get('plain'): body.cyl([-S[1]*.98,S[2]+.05,zn-.06],'x',.045,S[1]*1.96,CHROME,10)
    for z in spec.get('spear',()):
        q=at(z); body.box([-.02,q[3]+.046,z-.16],[.02,q[3]+.066,z+.16],CHROME)
    T=at(zt+.14); ty=T[2]+(T[3]-T[2])*.6
    for sd in (() if spec.get('plain') else (1,-1)):
        x=sd*T[1]*.66; body.cyl([x,ty,zt+.2],'z',.105,-.2,CHROME,14,capcol=DARK); body.cyl([x,ty,zt-.002],'z',.085,-.012,RED,14,tag='tail',e=RED); body.cyl([x,ty,zt-.014],'z',.03,-.03,CHROME,8)
        if spec.get('fin'):
            f0,f1,fh=spec['fin']; a=at(f0); b=at(f1); xa=a[1]*.9; xb=b[1]*.86
            for dx,o in ((.018,1),(-.018,-1)):
                body.poly([[sd*(xa+dx*0),a[3]+.01,f0],[sd*xb+sd*dx,b[3]+.01,f1],[sd*xb+sd*dx,b[3]+fh,f1-.06],[sd*(xb+.0)+sd*dx,b[3]+fh*.55,f1+.28]],spec['paint'],[sd*o,0,0])
            body.poly([[sd*xb-.018*sd,b[3]+.01,f1],[sd*xb+.018*sd,b[3]+.01,f1],[sd*xb+.018*sd,b[3]+fh,f1-.06],[sd*xb-.018*sd,b[3]+fh,f1-.06]],CHROME,[0,0,-1])
            body.cyl([sd*xb,b[3]+fh*.45,f1-.01],'z',.035,-.02,RED,10,tag='tail',e=RED)
    if not spec.get('plain'): body.cyl([-T[1]*.98,T[2]+.05,zt+.05],'x',.045,T[1]*1.96,CHROME,10)
    # the floor inside, the walls fore and aft of the cabin
    cab=spec['cab']; fl=.30+spec.get('floor',0)
    # the doors: each its strips of skin, an inner panel, hinged along the roof's edge (a gull wing) or on a post (ax y)
    k=0
    for d in spec['doors']:
        for sd,nm in ((1,'L'),(-1,'R')):
            m,g=doors[k]; k+=1; z0,z1=d['z']; A=ring(at(z0)); B=ring(at(z1)); j0,j1=d['segs']
            if d.get('ax','z')=='z': h=[sd*(A[j1+1][0]+B[j1+1][0])/2,(A[j1+1][1]+B[j1+1][1])/2,(z0+z1)/2]; op=sd*d.get('open',1.25)
            else: h=[sd*A[5][0],0,z0]; op=-sd*d.get('open',1.1)
            # the inner panel, a hand in from the skin, and the door's edges
            for zz,o in ((z0,1),(z1,-1)):
                Q=ring(at(zz)); m.poly([[sd*Q[j][0],Q[j][1],zz] for j in range(j0,min(j1,6)+1)]+[[sd*(Q[j][0]-.07),Q[j][1],zz] for j in range(min(j1,6),j0-1,-1)],spec['trim'],[0,0,o])
            zs=[z0+(z1-z0)*i/4 for i in range(5)]
            for a,b in zip(zs,zs[1:]):
                Qa=ring(at(a)); Qb=ring(at(b))
                for j in range(j0,min(j1,6)): m.poly([[sd*(Qa[j][0]-.07),Qa[j][1],a],[sd*(Qa[j+1][0]-.07),Qa[j+1][1],a],[sd*(Qb[j+1][0]-.07),Qb[j+1][1],b],[sd*(Qb[j][0]-.07),Qb[j][1],b]],spec['trim'],[-sd,0,0])
            Qm=ring(at((z0+z1)/2)); zc=(z0+z1)/2; yy=Qm[5][1]
            m.box([min(sd*(Qm[5][0]-.07),sd*(Qm[5][0]-.14)),yy-.1,zc-.22],[max(sd*(Qm[5][0]-.07),sd*(Qm[5][0]-.14)),yy-.05,zc+.2],spec['trim2']); m.box([min(sd*(Qm[5][0]-.09),sd*(Qm[5][0]-.12)),yy-.05,zc-.1],[max(sd*(Qm[5][0]-.09),sd*(Qm[5][0]-.12)),yy-.03,zc+.08],CHROME)
            m.box([min(sd*(Qm[5][0]-.004),sd*(Qm[5][0]+.016)),yy-.02,z1+.07],[max(sd*(Qm[5][0]-.004),sd*(Qm[5][0]+.016)),yy+.012,z1+.2],CHROME)   # the handle outside
            tris+=m.tris()+g.tris()
            parts.append({'n':d['n']+nm,'use':'door','seat':bool(d.get('seat')) and sd>0,'at':[round(x,4) for x in h],'ax':d.get('ax','z'),'open':round(op,3),'g':pack2(m.g,h),'gl':pack2(g.g,h)})
    return body,glass,parts,tris
MAT={CHROME:'chrome',cz['CHROME']:'chrome',DARK:'rubber',UNDER:'rubber',BLACK:'rubber'}
pack2=lambda g,move=(0,0,0):cz['pack2'](g,move,MAT)
def make(spec):
    body,glass,parts,tris=car(spec); W=pod()
    wx,wz0,wz1=spec['pods']; wy=.045; wheels=[[-wx,wy,wz0],[wx,wy,wz0],[-wx,wy,wz1],[wx,wy,wz1]]
    for bx in spec.get('boxes',()): body.box(bx[0],bx[1],bx[2])
    if spec.get('extra'): spec['extra'](body)
    P=[v for g in body.g.values() for v in g['p']]
    return {'name':spec['name'],'fly':1,'size':[round(max(P[k::3])-min(P[k::3]),3) for k in range(3)],'low':round(min(P[1::3]),3),'wheels':wheels,'r':.045,'body':pack2(body.g),'glass':pack2(glass.g),
            'cab':spec['cab'],'wheel':pack2(W.g),'parts':parts,'marks':spec['marks'],'tris':[tris+body.tris()+glass.tris(),W.tris()]}
YEL=(244,184,14); ORANGE=(232,96,28); WHITE=(242,242,238); TR=(58,52,44); TR2=(36,32,28)
# each traced from Polyfork's own hover car (its outline kept: owner, 10 Nov 2026): z, half width, bottom, belt, top, the roof's half width
SPECS={
 'taxi-coupe':{'name':'HOVER TAXI','paint':YEL,'trim':TR,'trim2':TR2,'skirt':1,'check':(1.7,-2.0),'pods':(.6,1.5,-1.6),
   'st':[[2.25,.78,.07,.46,.46,.5],[1.9,.95,.03,.62,.62,.55],[1.1,1.0,.02,.84,.86,.6],[.3,1.0,.02,.88,1.47,.67],[-1.85,1.0,.02,.88,1.49,.67],[-2.2,.97,.03,.88,1.34,.63],[-2.25,.95,.05,.84,1.22,.6]],
   'cowl':1.1,'a':.3,'b':-1.85,'deck':-2.25,'doors':[{'n':'DOOR F','z':(.28,-.72),'segs':(3,7),'seat':1,'ax':'y'},{'n':'DOOR R','z':(-.76,-1.7),'segs':(3,7),'ax':'y'}],
   'cab':{'hw':.86,'belt':.88,'z0':-1.95,'z1':1.0,'roof':1.49,'dd':.5,'seat':-.25,'rear':-1.3,'doors':1,'fl':.12},
   'marks':{'lamp':[0,1.5,-.6,.5],'decals':[{'k':'plate','at':[0,.42,-2.262],'f':'b','w':.305,'h':.155}]}},
 'taxi-pod':{'name':'HOVER CAB','paint':YEL,'trim':TR,'trim2':TR2,'skirt':1,'check':(1.8,-2.1),'pods':(.6,1.4,-1.6),
   'st':[[2.26,.6,.42,.78,.78,.45],[1.95,.9,.31,.98,1.0,.55],[1.2,.96,.28,1.03,1.5,.62],[.4,.97,.28,1.05,1.9,.64],[-1.7,.98,.28,1.05,1.92,.64],[-2.15,.97,.3,1.05,1.6,.6],[-2.26,.95,.34,1.0,1.45,.57]],
   'cowl':1.95,'a':.4,'b':-1.7,'deck':-2.26,'doors':[{'n':'DOOR F','z':(.38,-.6),'segs':(3,7),'seat':1,'ax':'y'},{'n':'DOOR R','z':(-.64,-1.6),'segs':(3,7),'ax':'y'}],
   'boxes':[([-.42,1.9,-1.4],[.42,2.06,-.2],YEL)]+[b for sd in (1,-1) for b in (([min(sd*.9,sd*1.08),.3,-2.0],[max(sd*.9,sd*1.08),.78,-1.05],YEL),([min(sd*1.08,sd*1.09),.42,-1.9],[max(sd*1.08,sd*1.09),.66,-1.2],DARK))],
   'cab':{'hw':.84,'belt':1.05,'z0':-1.8,'z1':1.5,'roof':1.92,'dd':.6,'seat':-.1,'rear':-1.15,'doors':1,'fl':.4},
   'marks':{'lamp':[0,2.07,-.8,.5],'decals':[{'k':'plate','at':[0,.6,-2.272],'f':'b','w':.305,'h':.155}]}},
 'ambulance':{'name':'HOVER AMBULANCE','paint':WHITE,'trim':(214,218,220),'trim2':(120,130,140),'skirt':1,'band':ORANGE,'glassTo':.0,'pods':(.8,1.8,-2.0),
   'st':[[2.75,.55,.4,.6,.6,.45],[2.35,1.1,.3,.93,.97,.6],[1.5,1.24,.26,1.1,1.7,.66],[.9,1.25,.26,1.12,2.13,.67],[-2.2,1.25,.26,1.12,2.13,.67],[-2.65,1.24,.3,1.12,1.75,.62],[-2.75,1.2,.34,1.05,1.6,.6]],
   'cowl':2.35,'a':.9,'b':-2.2,'deck':-2.75,'doors':[{'n':'DOOR F','z':(.88,-.05),'segs':(3,7),'seat':1,'ax':'y'},{'n':'DOOR R','z':(-.5,-1.9),'segs':(3,7),'ax':'y'}],
   'boxes':[([-.36,2.1,-.5],[.36,2.3,.5],WHITE)]+[b for sd in (1,-1) for b in (([min(sd*1.2,sd*1.36),.36,-2.4],[max(sd*1.2,sd*1.36),1.0,-1.5],WHITE),([min(sd*1.36,sd*1.37),.5,-2.3],[max(sd*1.36,sd*1.37),.86,-1.6],DARK))],
   'cab':{'hw':1.08,'belt':1.12,'z0':-2.3,'z1':1.75,'roof':2.13,'dd':.7,'seat':.3,'doors':1,'rows':1,'fl':.38},
   'marks':{'bar':[0,2.3,.0,1.0],'barcols':[0xff2416,0xf4f6ff,0xff2416],'kit':'amb','decals':[{'k':'plate','at':[0,.62,-2.762],'f':'b','w':.305,'h':.155},{'k':'star','at':[1.256,.62,-1.2],'f':'l','w':.32,'h':.32,'on':'DOOR RL'},{'k':'star','at':[-1.256,.62,-1.2],'f':'r','w':.32,'h':.32,'on':'DOOR RR'}]}},
}
PBLUE=(92,158,206)
def fighter(m):
    # the starfighter's own: swept wings with white tips and a lamp pod at each, two canted fins, the engine's nozzle and its glow, a round lamp in the nose, skids
    for sd in (1,-1):
        W=[[sd*.5,.62,.35],[sd*2.05,.56,-1.25],[sd*2.05,.56,-1.75],[sd*.5,.6,-1.85]]; t=.05
        m.poly([[p[0],p[1]+t,p[2]] for p in W],PBLUE,[0,1,0]); m.poly([[p[0],p[1]-t,p[2]] for p in W],PBLUE,[0,-1,0])
        for a,b in zip(W,W[1:]+W[:1]): m.poly([[a[0],a[1]+t,a[2]],[b[0],b[1]+t,b[2]],[b[0],b[1]-t,b[2]],[a[0],a[1]-t,a[2]]],CHROME,[sd,0,1 if a[2]>-1.5 else -1])
        m.poly([[sd*1.7,.612,-.98],[sd*2.04,.612,-1.27],[sd*2.04,.612,-1.74],[sd*1.7,.612,-1.78]],WHITE,[0,1,0])
        m.cyl([sd*2.09,.56,-1.9],'z',.07,1.0,CHROME,10,capcol=DARK); m.cyl([sd*2.09,.56,-.9],'z',.055,.012,RED if sd>0 else (40,90,255),10,tag='tail' if sd>0 else 'turn',e=RED if sd>0 else (40,90,255))
        F=[[sd*.42,.9,-1.2],[sd*.42,.9,-2.1],[sd*.78,1.72,-2.2],[sd*.7,1.72,-1.85]]
        for dx,o in ((.02,1),(-.02,-1)): m.poly([[p[0]+sd*dx,p[1],p[2]] for p in F],PBLUE,[sd*o,.3*o,0])
        m.poly([[F[0][0]+.02*sd,F[0][1],F[0][2]],[F[3][0]+.02*sd,F[3][1],F[3][2]],[F[3][0]-.02*sd,F[3][1],F[3][2]],[F[0][0]-.02*sd,F[0][1],F[0][2]]],CHROME,[0,.3,1])
        m.poly([[F[1][0]+.02*sd,F[1][1],F[1][2]],[F[2][0]+.02*sd,F[2][1],F[2][2]],[F[2][0]-.02*sd,F[2][1],F[2][2]],[F[1][0]-.02*sd,F[1][1],F[1][2]]],CHROME,[0,0,-1])
        m.poly([[sd*.705,1.5,-1.93],[sd*.775,1.5,-2.17],[sd*.80,1.7,-2.2],[sd*.72,1.7,-1.87]],WHITE,[sd,.3,0])
        m.box([min(sd*.3,sd*.36),.06,-.9],[max(sd*.3,sd*.36),.1,.9],CHROME)
        for z in (-.6,.6): m.box([min(sd*.31,sd*.35),.1,z-.03],[max(sd*.31,sd*.35),.36,z+.03],CHROME)
    m.cyl([0,.66,-2.25],'z',.4,-.42,CHROME,16,r2=.33,capcol=DARK); m.cyl([0,.66,-2.6],'z',.27,-.012,JET,14,tag='jet',e=JET)
    m.cyl([0,.5,2.2],'z',.1,.12,CHROME,12,capcol=DARK); m.cyl([0,.5,2.325],'z',.08,.012,LENS,12,tag='head',e=LENS)
SPECS['police-flier']={'name':'POLICE FLIER','paint':PBLUE,'trim':(70,98,132),'trim2':(44,62,88),'band':WHITE,'plain':1,'pods':(.33,.75,-.75),'extra':fighter,
   'st':[[2.3,.16,.4,.52,.52,.1],[1.7,.36,.33,.6,.62,.2],[1.0,.5,.3,.68,.74,.3],[.45,.56,.3,.72,1.1,.34],[-.35,.58,.3,.74,1.12,.34],[-1.0,.56,.32,.78,.92,.34],[-1.8,.5,.36,.82,.9,.3],[-2.25,.42,.4,.8,.86,.28]],
   'cowl':1.0,'a':.45,'b':-.35,'deck':-1.0,'doors':[{'n':'DOOR F','z':(.43,-.33),'segs':(5,8),'seat':1}],
   'cab':{'hw':.5,'belt':.74,'z0':-.75,'z1':.95,'roof':1.12,'dd':.34,'seat':-.2,'doors':1,'rows':1,'fl':.34},
   'marks':{'bar':[0,.93,-1.2,.62],'decals':[]}}
if __name__=='__main__':
    f=os.path.join(ROOT,'data/cars.json'); J=json.load(open(f))
    for k,s in SPECS.items(): c=make(s); J['cars'][k]=c; print(k,c['size'],'triangles',c['tris'],'parts',[p['n'] for p in c['parts']],len(json.dumps(c))//1024,'KB')
    s=json.dumps(J,separators=(',',':')); open(f,'w').write(s); print(len(s)//1024,'KB')
