# THE LAKE WRECK: the red interceptor at five times its size (23 m), crashed a thousand years ago (owner, 9 Nov 2026), modelled here in code to Polyfork's
# interceptor's outline (traced from its old data/traffic.json) and baked into data/lakewreck.json. Two meshes: ship (metres, forward +z, the deck's floor
# at 0; the game rolls and pitches it) and bed (laid flat round it, on the bed: its broken-off wing, plates, an engine, silt). Both hull skins are torn
# open (a side, the canopy, the tail), so you swim in. marks: the swimmer's walls (x0, z0, x1, z1, ship metres), its chests, its glow. A group's m names
# its surface for the game: paint (faded, flaking to rust), metal, gold, glow. python3 -I tools/lakewreck-bake.py
import json, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cz={'__file__':os.path.join(ROOT,'tools/cruiser-bake.py'),'__name__':'cruiser'}; exec(compile(open(cz['__file__']).read(),'cruiser-bake','exec'),cz)
Mesh,lin,sub,cross,dot,turn=cz['Mesh'],cz['lin'],cz['sub'],cz['cross'],cz['dot'],cz['turn']
RED=(150,40,34); RED2=(118,34,30); GREY=(88,90,94); DGREY=(54,56,60); BLUEG=(110,112,138); INNER=(70,72,76); DECK=(60,58,54); GOLD=(214,168,60); CRYS=(90,220,230); SILT=(92,86,68); WOOD=(80,60,40)
MAT={RED:'paint',RED2:'paint',GREY:'paint',DGREY:'paint',BLUEG:'paint',INNER:'paint',DECK:'paint',WOOD:'paint',SILT:'silt',GOLD:'gold'}
def h(a,b,c=0):
    s=math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-math.floor(s)
# the interceptor's outline, five times over: z (m, nose +z) -> half width, bottom, top of the hull
TR=[(-11.5,2.85,1.25,3.65),(-9.6,3.6,.85,5.3),(-7.65,3.9,.4,5.7),(-5.75,3.9,.7,6.4),(-3.85,3.7,.65,6.3),(-1.9,3.4,.4,5.85),(0,3.3,.25,5.15),(1.9,3.3,.15,4.75),(3.85,3.25,.15,4.65),(5.75,3.2,.1,4.45),(7.65,2.95,.15,4.35),(9.6,2.65,.2,4.05),(11.5,1.4,.45,2.4)]
def prof(z):
    for (z0,*a),(z1,*b) in zip(TR,TR[1:]):
        if z0<=z<=z1: t=(z-z0)/(z1-z0); t=t*t*(3-2*t); return [x+(y-x)*t for x,y in zip(a,b)]
    return TR[0][1:] if z<TR[0][0] else TR[-1][1:]
N=24; Y0=1.1   # points round a section; the deck's height over the hull's bottom at the middle
def ring(z,inset=0):
    w,y0,y1=prof(z); w-=inset; yc=(y0+y1)/2; hh=(y1-y0)/2-inset; out=[]
    for i in range(N+1):
        a=2*math.pi*i/N; c,s=math.cos(a),math.sin(a); p=2.6
        out.append([w*math.copysign(abs(c)**(2/p),c),yc+hh*math.copysign(abs(s)**(2/p),s)-Y0,z])
    return out
def hole(z,i):
    # where the skins are gone: a tear down the port side amidships, the canopy over the cockpit, the very tail; their edges ragged
    a=2*math.pi*(i+.5)/N; c,s=math.cos(a),math.sin(a); j=.35*(h(round(z*2),i,1)-.5)
    if c<-.5 and abs(z-.5)<3.2+j*3 and -.55<s+j<.65: return True
    if s>.6+j*.5 and 4.2+j*2<z<8.6+j: return True
    if z<-10.6+j*2: return True
    return False
def skin(m,inset,col,lo_col,o):
    Z=[-11.5+i*.5 for i in range(47)]
    R=[ring(z,inset) for z in Z]
    for k in range(len(Z)-1):
        for i in range(N):
            if hole(Z[k]+.25,i): continue
            q=[R[k][i],R[k][i+1],R[k+1][i+1],R[k+1][i]]; a=2*math.pi*(i+.5)/N; s=math.sin(a)
            cc=col(Z[k],s) if callable(col) else col
            mid=[(q[0][0]+q[2][0])/2,(q[0][1]+q[2][1])/2,(q[0][2]+q[2][2])/2]; w,y0,y1=prof(Z[k]); out=[mid[0]*o,(mid[1]-((y0+y1)/2-Y0))*o,0]
            m.poly(q,cc,out)
def hullcol(z,s):
    if s<-.35: return DGREY
    if -.12<s<.02: return GREY
    return RED if (round(z*1.3)%7) else RED2   # its plates, one in seven a shade darker
def bulkhead(m,z,door=True):
    # a wall across the hull at z, a doorway through it; small squares kept inside the section, out of the door
    R=ring(z,.2); xs=[p[0] for p in R]; ys=[p[1] for p in R]; S=.55
    def inside(x,y):
        n=0
        for a,b in zip(R,R[1:]):
            if (a[1]>y)!=(b[1]>y) and x<a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]): n+=1
        return n%2==1
    y=min(ys)
    while y<max(ys):
        x=min(xs)
        while x<max(xs):
            cx,cy=x+S/2,y+S/2
            if inside(cx,cy) and not (door and abs(cx)<.75 and -.05<cy<2.15) and cy>-.05:
                m.poly([[x,y,z],[x+S,y,z],[x+S,y+S,z],[x,y+S,z]],INNER,[0,0,1])
            x+=S
        y+=S
def ship():
    m=Mesh()
    skin(m,0,hullcol,None,1); skin(m,.14,INNER,None,-1)
    # the deck: a floor plate the length of the hull, its grating's bars, the bilge under it dark
    for z in [ -10.5+i*.5 for i in range(42)]:
        w=prof(z)[0]-.5
        if w<.6: continue
        bro=h(round(z*2),5)>.86
        if bro: continue   # a few plates gone through to the bilge
        m.poly([[-w,0,z],[w,0,z],[w,0,z+.5],[-w,0,z+.5]],DECK,[0,1,0])
        for x in (-w*.6,0,w*.6): m.box([x-.03,0,z],[x+.03,.04,z+.5],DGREY)
    # its ribs: a band round the inside every metre and a half, a few broken in the tear
    for k in range(15):
        z=-10.2+k*1.5; R=ring(z,.14); Ri=ring(z,.3)
        for i in range(N):
            if hole(z,i) and h(k,i)>.3: continue
            q=[R[i],R[i+1],Ri[i+1],Ri[i]]
            m.poly(q,DGREY,[0,0,1])
    bulkhead(m,4.0); bulkhead(m,-4.2)
    # overhead: conduits along the ceiling, one torn down hanging into the corridor
    for x,r in ((-.9,.09),(.8,.12),(.2,.06)):
        top=lambda z:prof(z)[2]-Y0-.55
        m.cyl([x,top(0),-9.5],'z',r,6.2,DGREY,8); m.cyl([x,top(0),.5],'z',r,3.2,DGREY,8)
    m.cyl([.8,1.6,-3.3],'z',.12,3.6,DGREY,8)
    # the cockpit: the pilot's seat and the gunner's (fallen), the console under the shattered canopy, its dark screens, two sticks
    m.box([-1.1,0,7.6],[1.1,1.1,8.6],BLUEG); m.box([-1.15,1.1,7.5],[1.15,1.16,8.7],DGREY,rot=('x',-.35,[0,1.1,7.6]))
    for x in (-.6,0,.6): m.box([x-.25,1.0,7.62],[x+.25,1.32,7.64],(20,24,26),rot=('x',-.3,[x,1.0,7.6]))
    m.box([-.4,0,5.6],[.4,.45,6.2],DGREY); m.box([-.4,.45,5.55],[.4,1.4,5.7],RED2,rot=('x',-.2,[0,.45,5.6])); m.cyl([0,.45,6.6],'y',.03,.6,DGREY,6)
    m.box([.7,0,4.5],[1.5,.18,5.4],RED2,rot=('z',1.2,[1.1,.1,4.9]))
    for x in (-1.0,1.0): m.box([x-.03,0,7.1],[x+.03,.9,7.15],DGREY)
    # the canopy's frame where its glass was: bars over the opening
    for z in (4.6,5.8,7.0,8.2):
        R=ring(z,0); top=[p for p in R if p[1]>max(q[1] for q in R)-1.0]
        for a,b in zip(top,top[1:]): m.box([min(a[0],b[0])-.04,min(a[1],b[1])-.04,z-.05],[max(a[0],b[0])+.04,max(a[1],b[1])+.04,z+.05],DGREY)
    # the corridor: lockers down the starboard wall, two hanging open, a fallen rack
    for k in range(6):
        z=-3.6+k*1.25; w=prof(z)[0]-.75
        m.box([w-.5,0,z],[w,2.1,z+1.1],GREY)
        if k in (1,4): m.box([w-.95,0,z+.05],[w-.9,2.0,z+1.0],GREY,rot=('y',.9,[w-.5,0,z+.05]))
        else: m.box([w-.52,.2,z+.5],[w-.5,1.9,z+.52],DGREY)
    m.box([-2.0,0,-1.5],[-.6,.3,1.2],DGREY,rot=('z',.25,[-1.3,0,0]))
    # the hold: crates stove in, gold bars stacked and spilled, coins everywhere, the glowing shards of its cargo, the reactor's drum fallen off its mount
    for k in range(9):
        x=(h(k,1)-.5)*4.2; z=-9.2+h(k,2)*4.4; s=.5+.5*h(k,3); a=h(k,4)*1.4
        m.box([x-s,0,z-s*.7],[x+s,s*1.1,z+s*.7],WOOD if k%3 else GREY,rot=('y',a,[x,0,z]))
    for k in range(5):
        x0=-2.1+k*.9; z0=-6.4+h(k,7)*.6
        for r in range(3):
            for c in range(3-r): m.box([x0+c*.24+r*.12,r*.1,z0],[x0+c*.24+r*.12+.2,r*.1+.09,z0+.42],GOLD,rot=('y',h(k,8)*.5,[x0,0,z0]))
    for k in range(36):
        x=(h(k,11)-.5)*5; z=-9.6+h(k,12)*6.4; m.cyl([x,.01,z],'y',.07,.02,GOLD,6,caps=False); m.poly([[x+.07*math.cos(a),.03,z+.07*math.sin(a)] for a in [i*math.pi/3 for i in range(6)]],GOLD,[0,1,0])
    for k in range(9):
        x=(h(k,21)-.5)*4.6; z=-9.4+h(k,22)*5.4; r=.08+.08*h(k,23); hh=.5+.9*h(k,24)
        m.cyl([x,0,z],'y',r,hh,CRYS,5,r2=0,tag='glow',e=CRYS)
    m.cyl([-1.0,1.1,-10.3],'x',.95,2.4,GREY,16,capcol=DGREY); m.cyl([-1.0,1.1,-10.3],'x',1.0,.12,DGREY,16)
    # outside: the port wing, swept and whole, its gun pod; the starboard wing's stump; two canted fins; the engines and their dark nozzles
    def wing(sd,stump):
        root=prof(-6)[0]-.2; P=[[sd*root,.9,-2.4],[sd*(root if stump else 7.4),.9 if stump else .45,-3.4 if stump else -7.2],[sd*(root if stump else 7.6),.9 if stump else .4,-4.6 if stump else -9.8],[sd*root,.9,-9.8]]
        if stump: P=[[sd*root,.9,-2.4],[sd*(root+1.3),.85,-3.4],[sd*(root+1.0),.8,-6.2],[sd*(root+1.6),.85,-8.0],[sd*root,.9,-9.8]]
        for dy,o in ((.14,1),(-.14,-1)): m.poly([[p[0],p[1]+dy,p[2]] for p in P],RED if dy>0 else DGREY,[0,o,0])
        for a,b in zip(P,P[1:]+P[:1]): m.poly([[a[0],a[1]+.14,a[2]],[b[0],b[1]+.14,b[2]],[b[0],b[1]-.14,b[2]],[a[0],a[1]-.14,a[2]]],GREY,[sd,0,0])
        if not stump: m.cyl([sd*7.55,.42,-10.2],'z',.22,4.4,GREY,10,capcol=DGREY); m.cyl([sd*7.55,.42,-5.8],'z',.08,1.6,DGREY,6)
    wing(-1,False); wing(1,True)
    for sd in (1,-1):
        top=prof(-9)[2]-Y0
        P=[[sd*1.1,top-.2,-7.4],[sd*1.1,top-.2,-11.0],[sd*2.6,top+2.6,-11.8],[sd*2.5,top+2.6,-10.2]]
        for dx,o in ((.08,1),(-.08,-1)): m.poly([[p[0]+dx*sd,p[1],p[2]] for p in P],RED,[sd*o,.4*o,0])
        m.cyl([sd*1.7,1.2,-11.6],'z',1.0,2.4,GREY,16,capcol=DGREY); m.cyl([sd*1.7,1.2,-11.65],'z',.78,.1,(14,14,16),16)
    m.cyl([0,1.2,11.5],'z',.5,.6,GREY,12,capcol=DGREY)
    return m
def bed():
    # flat on the bed round the ship (metres, the ship's middle at 0, the bed at 0): its starboard wing broken off, torn plates, a fallen engine, silt banked against the hull
    m=Mesh(); sd=1
    P=[[0,0,0],[4.6,0,-2.2],[4.8,0,-4.6],[.4,0,-5.0]]
    def plate(P,cx,cz,a,y,col,tilt=0):
        Q=[turn([p[0]+cx,p[1]+y,p[2]+cz],'y',a,[cx,y,cz]) for p in P]
        Q=[turn(q,'z',tilt,[cx,y,cz]) for q in Q]
        for dy,o in ((.14,1),(-.14,-1)): m.poly([[q[0],q[1]+dy,q[2]] for q in Q],RED if o>0 else DGREY,[0,o,0])
        for a_,b_ in zip(Q,Q[1:]+Q[:1]): m.poly([[a_[0],a_[1]+.14,a_[2]],[b_[0],b_[1]+.14,b_[2]],[b_[0],b_[1]-.14,b_[2]],[a_[0],a_[1]-.14,a_[2]]],GREY,[1,0,0])
    plate(P,7.5,-1.0,.5,.35,RED,.12); m.cyl([12.0,.3,-4.5],'z',.22,4.2,GREY,10,capcol=DGREY)
    for k in range(9):
        cx=(h(k,31)-.5)*26; cz=(h(k,32)-.5)*34
        if abs(cx)<5 and abs(cz)<13: cx+=math.copysign(6,cx or 1)
        s=.6+1.2*h(k,33); plate([[-s,0,-s*.6],[s,0,-s*.8],[s*.8,0,s*.7],[-s*.7,0,s*.5]],cx,cz,h(k,34)*6,.12,RED,(h(k,35)-.5)*.5)
    m.cyl([-7.5,1.0,-14.5],'x',1.0,2.4,GREY,16,capcol=DGREY)
    for k in range(26):   # silt banked against the hull and drifted round its debris
        z=-12+k; side=1 if k%2 else -1; w=prof(min(11.5,max(-11.5,z)))[0]
        x=side*(w+.2+.6*h(k,41)); r=1.0+1.0*h(k,42)
        m.lathe([(-r*.0,0,SILT),(0,r,SILT)],10) if False else None
        for i in range(10):
            a0,a1=2*math.pi*i/10,2*math.pi*(i+1)/10
            m.poly([[x,r*.45,z],[x+r*math.cos(a0),0,z+r*math.sin(a0)*1.4],[x+r*math.cos(a1),0,z+r*math.sin(a1)*1.4]],SILT,[0,1,0])
    return m
def make():
    S=ship(); B=bed(); pk=lambda g:cz['pack2'](g,(0,0,0),MAT)
    for g in (S,B):
        for t in g.g.values():
            if t.get('t')=='glow': pass
    walls=[]
    for z in [-11.0+i*.5 for i in range(45)]:
        w=prof(z+.25)[0]-.15
        port=not (abs(z+.25-.5)<3.0)
        if port: walls.append([-w-.2,z,-w+.15,z+.5])
        walls.append([w-.15,z,w+.2,z+.5])
    for zb in (4.0,-4.2):
        w=prof(zb)[0]-.2; walls+= [[-w,zb-.1,-.8,zb+.1],[.8,zb-.1,w,zb+.1]]
    walls.append([-1.2,7.5,1.2,8.7])
    chests=[[1.2,-7.8],[-1.6,-5.0],[.6,6.8],[-1.5,-.8]]
    return {'len':23,'deck':Y0,'ship':pk(S.g),'bed':pk(B.g),'walls':[[round(v,2) for v in w] for w in walls],'chests':chests,'glow':[[round((h(k,21)-.5)*4.6,2),.6,round(-9.4+h(k,22)*5.4,2)] for k in range(0,9,3)],'tris':[S.tris(),B.tris()]}
if __name__=='__main__':
    o=make(); s=json.dumps(o,separators=(',',':')); open(os.path.join(ROOT,'data/lakewreck.json'),'w').write(s); print('lake wreck: triangles',o['tris'],'walls',len(o['walls']),len(s)//1024,'KB')
