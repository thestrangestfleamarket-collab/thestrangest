# THE PARK'S POLYFORK PLACES (owner, 7 Nov 2026: "add all of them into central park"; mockups/park-polyfork.svg): writes data/world.json's things with
# k 'p:<key>' (benches every 4 m, lamps every 13 m and a low railing along the park's wobbling paths, the gates, the Round, the playground, the big
# lake's shore, the garden corner ...) and the brook's course from the big lake to the pond. Needs data/parkpf.json (tools/park-pf-bake.py).
# Run: python3 tools/park-pf-place.py
import json, math, sys
W=json.load(open('data/world.json')); PP=W['parkPlaces']; PK=W['park']
PF=json.load(open('data/parkpf.json'))
G=json.load(open('data/garden.json'))
OLD=[(g['k'],(g['x']+81.36)/1.13,(g['z']-87.01)/1.13) for g in G]
OLD=[o for o in OLD if PK['x0']<=o[1]<=PK['x1'] and PK['y0']<=o[2]<=PK['y1']]
T=lambda m:m/.84
ID={ # short key -> polyfork id
 'parkbench':'park-bench-dc8b62','ironbench':'cast-iron-plaza-bench-b4096d','campusbench':'campus-bench-0d6036','logbench':'split-log-bench-289780','b2bbench':'back-to-back-promenade-8c153b','amphi':'amphitheatre-bench-row-d72422',
 'globelamp':'globe-lamp-346cb6','jlamp':'street-lamp-29f365','colonial':'colonial-lamp-post-eb85f8','campuslamp':'campus-lamp-post-579291','sealamp':'seafront-lamp-post-28bada','stringlights':'string-light-run-01ba14',
 'bowtop':'bow-top-park-railing-6b4cce','arearail':'area-railing-a771da','campusrail':'campus-railing-run-2ceb3e','ironfence':'iron-cemetery-fence-run-cb78a9','picket':'picket-fence-run-9310c1',
 'archbridge':'arched-foot-bridge-0da34f','creekbridge':'creek-footbridge-d35cf7','woodbridge':'wooden-bridge-9d2308','logbridge':'log-plank-bridge-a5f74f','trestle':'timber-trestle-bridge-c3cd88',
 'maingate':'main-gate-arch-with-738ddb','welcomearch':'town-welcome-arch-d2af7d','yardgate':'yard-fence-gate-bay-eb6a30','torii':'torii-gate-402f30',
 'plazafountain':'plaza-fountain-5a5f6e','campusfountain':'campus-plaza-fountain-a0cab1','drink':'park-drinking-fountain-b1c25b','birdbath':'garden-birdbath-9671de',
 'founder':'founder-s-statue-71c269','lion':'guardian-lion-statue-5bde18',
 'picnicshelter':'park-picnic-shelter-9548a3','promshelter':'promenade-shelter-788f46',
 'boatshed':'boat-shed-74c94f','dock':'lake-dock-run-f5380e','launch':'boat-launch-ramp-dbde11','raft':'swim-raft-6aefb5','canoe':'camp-canoe-c65d2a','kayak':'lake-kayak-930d0b','skiff':'lake-rowing-skiff-4916e7','lifebuoy':'lifebuoy-on-a-post-57421b',
 'slide':'playground-slide-8b764c','swings':'backyard-swing-set-38637e','teeter':'teeter-totter-ee9c62','roundabout':'playground-roundabout-e4d43b','spring':'spring-rider-c8b8d8','sandbox':'sandbox-224517',
 'icecream':'ice-cream-kiosk-on-40a568','hotdog':'hot-dog-cart-115192','newsstand':'newsstand-6dfd65','refresh':'refreshment-kiosk-406f65','coffee':'campus-coffee-kiosk-ec2395','seatoilet':'seafront-toilet-block-c3f643','toilet':'toilet-block-da51a4',
 'basket':'wire-trash-basket-269c1c','trashcan':'metal-trash-can-f57043','bikerack':'bike-rack-a1e7c3','trailhead':'trailhead-sign-aa29e1','trailmap':'trail-map-kiosk-be8618','wayfind':'seafront-wayfinding-post-67fc84',
 'library':'little-free-library-post-755dd2','birdhouse':'birdhouse-post-66d6c1','beehive':'beehive-2e70bf','hammock':'hammock-on-posts-7d5c47','picnictable':'heavy-timber-picnic-table-1ac060',
 'planter':'flower-planter-550bfb','planterbox':'campus-planter-box-10970a','bollard':'sidewalk-bollard-c2567e','sphere':'concrete-sphere-bollard-d99a57',
 'conservatory':'glass-conservatory-a938d5','greenhouse':'greenhouse-53ab6d','koi':'japanese-koi-pond-78d204','zen':'zen-sand-garden-79a828','lookout':'splay-leg-lookout-tower-6fae7e','bunting':'bunting-run-2ac207',
 'duck':'duck-base','pigeon':'pigeon-base','horse':'horse-base'}
P=[]  # (key, x, y, rot) rot: radians the front turns from +y
def put(k,x,y,r=0): P.append((k,round(x,2),round(y,2),r))
def clear(x,y,d=3.0):
    return all(math.hypot(x-o[1],y-o[2])>d for o in OLD) and all(math.hypot(x-q[1],y-q[2])>d*.8 for q in P if q[0] not in('bowtop','campusrail','arearail','picket','ironfence'))
R=PP['round']; RX,RY,RR=R['x'],R['y'],R['r']; HW=W['pathWidth']/2
def lineup(*a,**kw): return lineup_(*a,**kw)
def lineup_(poly,step,off,kinds,skip=lambda x,y:False,alt=False,need=3.0,rotf=0):
    if len(poly)==2 and not isinstance(poly[0][0],tuple) and isinstance(poly[1],tuple) and len(poly)==2: pass
    out=0
    for i,(px,py,ux,uy) in enumerate(walk(poly,step)):
        nx,ny=-uy,ux
        for s in ((1,-1) if not alt else ((1,) if i%2 else (-1,))):
            x=px+nx*off*s; y=py+ny*off*s
            if skip(x,y) or not clear(x,y,need): continue
            k=kinds[(i//2)%len(kinds)] if isinstance(kinds,list) else kinds
            put(k,x,y,math.atan2(-nx*s,-ny*s)); out+=1
    return out
nearRound=lambda x,y:math.hypot(x-RX,y-RY)<RR+6
nearJ=lambda x,y:abs(x-43)<6 and abs(y-59.5)<6 or abs(y-25)<8 and abs(x-112)<6
gates=lambda x,y:y<-30 or x<-17 or y>172 or x>255 or (174<x<205 and 50<y<69)
def wob(a,b,axis):
    L=math.hypot(b[0]-a[0],b[1]-a[1]); k=round(L/70); N=int(L*4)
    if axis=='x': return [(a[0]-3*math.sin(2*math.pi*k*(i/N*L)/L),a[1]+i/N*L) for i in range(N+1)]
    return [(a[0]+i/N*L,a[1]+3*math.sin(2*math.pi*k*(i/N*L)/L)) for i in range(N+1)]
mall=wob((112,-37),(112,180),'x'); cross=wob((-23,59.5),(261,59.5),'y'); p5=[(112,25),(140.5,12)]; p6=wob((43,59.5),(43,110.6),'x')
def walk(poly,step):
    # points every `step` along a polyline: (x,y,ux,uy)
    out=[]; acc=step; 
    for (x0,y0),(x1,y1) in zip(poly,poly[1:]):
        l=math.hypot(x1-x0,y1-y0); ux,uy=(x1-x0)/l,(y1-y0)/l; d=step-acc
        while d<=l: out.append((x0+ux*d,y0+uy*d,ux,uy)); d+=step
        acc=l-(d-step)
    return out
B=T(4)
# benches every 4 m both sides (the Mall's every 8 m: owner, 9 Nov 2026: "reduce benches in central park by 50%"): the Mall park benches, the cross walk cast-iron, the side paths campus benches
lineup(mall,2*B,HW+.9,'parkbench',lambda x,y:nearRound(x,y) or gates(x,y) or nearJ(x,y))
lineup(cross,B,HW+.9,'ironbench',lambda x,y:nearRound(x,y) or gates(x,y) or nearJ(x,y) or abs(x-112)<6)
lineup(p5,B,HW+.9,'campusbench',lambda x,y:math.hypot(x-112,y-25)<6)
lineup(p6,B,HW+.9,'campusbench',lambda x,y:y<66)
# a basket by every third bench
bs=[q for q in P if 'bench' in q[0]]
for i,q in enumerate(bs):
    if i%3==1: put('basket',q[1]+(.0 if abs(math.sin(q[3]))>.5 else 1.4),q[2]+(1.4 if abs(math.sin(q[3]))>.5 else 0),0)
# lamps every ~13 m, alternating sides
L13=T(13)
lineup(mall,L13,HW+2.1,'globelamp',lambda x,y:nearRound(x,y) or gates(x,y),alt=True,need=1.5)
lineup(cross,L13,HW+2.1,'colonial',lambda x,y:nearRound(x,y) or gates(x,y),alt=True,need=1.5)
lineup(p5,L13*.8,HW+2.1,'campuslamp',alt=True,need=1.5); lineup(p6,L13*.8,HW+2.1,'campuslamp',alt=True,need=1.5)
# low railings along the path edges (runs end to end)
def rail(poly,k,skip):
    st=T(PF[k]['size'][0])
    for (px,py,ux,uy) in walk(poly,st):
        nx,ny=-uy,ux
        for s in (1,-1):
            x=px+nx*(HW+3.0)*s; y=py+ny*(HW+3.0)*s
            if not skip(x,y): put(k,x,y,math.atan2(-uy,ux))
rail(mall,'bowtop',lambda x,y:nearRound(x,y) or gates(x,y) or nearJ(x,y))
rail(cross,'campusrail',lambda x,y:nearRound(x,y) or gates(x,y) or abs(x-43)<5 or abs(x-112)<6 or abs(x-189)<6)
for a in range(0,360,12):  # area railing round the Round
    t=math.radians(a)
    if min(abs(((a-d+180)%360)-180) for d in (0,90,180,270))>14: put('arearail',RX+(RR+.6)*math.sin(t),RY+(RR+.6)*math.cos(t),t)
# the Round: plaza fountain, planter boxes, back-to-back benches, pigeons
put('plazafountain',RX,RY)
for d in (45,135,225,315):
    t=math.radians(d); put('planterbox',RX+(RR-1.6)*math.sin(t),RY+(RR-1.6)*math.cos(t)); put('b2bbench',RX+(RR-3.6)*math.sin(t),RY+(RR-3.6)*math.cos(t),t)
for i in range(6): put('pigeon',RX-5+2*i,RY-4.5+(i%2))
# south gate (the Mall's foot, on Market St)
put('maingate',112,-34.5); put('lion',104.5,-33,math.pi); put('lion',119.5,-33,math.pi); put('campusfountain',112,-22)
for x in (100,124): put('planter',x,-26); put('planter',x,-19)
put('hotdog',103.5,-29,math.pi/2); put('newsstand',121,-29,-math.pi/2); put('trailmap',104,-14); put('bikerack',95,-34); put('bikerack',129,-34)
for x in (108,110.5,113.5,116): put('bollard',x,-37)
put('horse',98,-30); put('trashcan',101.5,-26); put('trashcan',123,-25.5)
put('founder',112,22,math.pi); put('drink',106,30)
put('icecream',104.5,46,math.pi/2); put('trashcan',104.5,42)
# west gate (apartment street)
put('welcomearch',-21,59.5,-math.pi/2); put('coffee',-12,53,0); put('trailmap',-12,66); put('bikerack',-18,52); 
for y in (55.5,57.5,61.5,63.5): put('sphere',-23.5,y)
# the brook's bridges (where the paths and trails cross it)
# THE BIG LAKE: centred on the park's north-east corner, a quarter inside Section A, the rest past the forcefield (seen, never walked)
BL=(262,181,110,85); inBL=lambda x,y,m=0:((x-BL[0])/(BL[2]+m))**2+((y-BL[1])/(BL[3]+m))**2<1
def shore(t,m=0): return BL[0]+(BL[2]+m)*math.cos(t), BL[1]+(BL[3]+m)*math.sin(t)
# the brook's bridges (where the paths and trails cross it; it runs out of the big lake to the pond)
put('jlamp',173,55); put('jlamp',206,64)
BR=PP['brook']['pts']
def across(x,y):
    i=min(range(len(BR)-1),key=lambda i:math.hypot((BR[i][0]+BR[i+1][0])/2-x,(BR[i][1]+BR[i+1][1])/2-y)); dx,dy=BR[i+1][0]-BR[i][0],BR[i+1][1]-BR[i][1]; L=math.hypot(dx,dy); return -dy/L,dx/L
for k,x,y in (('archbridge',160,27),('creekbridge',196.5,97),('woodbridge',184,46),('logbridge',171,38.5)): ax,ay=across(x,y); put(k,x,y,math.atan2(-ay,ax))
ax,ay=across(205.4,81.5); put('trestle',205.4,81.5,math.atan2(ax,ay))   # the long trestle where the brook's banks are clearest
put('wayfind',200,62); put('wayfind',43,64); put('wayfind',116,64); put('drink',196,55); put('drink',47,64)
# the big lake's shore: the boat shed and its dock, launch, raft and boats; lifebuoys, lamps, log benches, hammocks, the lookout
face=lambda t:math.atan2(-math.cos(t),-math.sin(t))
t=math.radians(222); bx,by=shore(t,12); put('boatshed',bx,by,face(t))
for m in (1,-1.6): x,y=shore(t,m); put('dock',x,y,face(t))
x,y=shore(t-.07,-1.5); put('launch',x,y,face(t)); x,y=shore(t+.05,-14); put('raft',x,y)
for k,d in (('canoe',-.065),('kayak',0),('skiff',.055)): x,y=shore(t+d,-5); put(k,x,y,face(t)+math.pi/2)   # (a clear length of water between them)
for i in range(6): x,y=shore(t+.12+.03*i,-10); put('duck',x,y)
for d in (190,205,240,255): x,y=shore(math.radians(d),1.2); put('lifebuoy',x,y,face(math.radians(d)))
for d in (184,198,212,232,246,262): x,y=shore(math.radians(d),6.5); put('sealamp',x,y)
for d in (192,208,237,252): x,y=shore(math.radians(d),9); put('logbench',x,y,face(math.radians(d)))
x,y=shore(math.radians(200),9); put('trailhead',x,y,face(math.radians(200))+math.pi); put('lookout',150,122)
put('hammock',176,118,math.pi/2); put('hammock',183,112,math.pi/2)
# the pond (today's THE LAKE): ducks, two lamps, a bench
LX,LY,LR=PP['lake']['x'],PP['lake']['y'],PP['lake']['r']
for i in range(4): put('duck',LX-1+1.6*i,LY+3-(i%2))
for d in (230,90): t=math.radians(d); put('sealamp',LX+(LR+2.5)*math.sin(t),LY+(LR+2.5)*math.cos(t))
t=math.radians(250); put('logbench',LX+(LR+4)*math.sin(t),LY+(LR+4)*math.cos(t),t+math.pi)
# the bandstand's lawn (bandstand already at 245,8): amphitheatre rows, bunting, refreshment kiosk
for i in range(4): put('amphi',245,-6-2.6*i,0)
put('stringlights',239,-2,0); put('stringlights',251,-2,0); put('bunting',239,-2,0); put('bunting',251,-2,0); put('refresh',232,-14,math.pi/2); put('seatoilet',255,-30,0); put('trashcan',232,-19)
# the playground (open lawn west of the Mall, south of the cross walk), picket-fenced, gate on the Mall side
PX0,PX1,PY0,PY1=60,90,-8,16
st=T(PF['picket']['size'][0])
x=PX0+st/2
while x<PX1: put('picket',x,PY0,0); put('picket',x,PY1,0); x+=st
y=PY0+st/2
while y<PY1:
    put('picket',PX0,y,math.pi/2)
    if abs(y-4)>2.5: put('picket',PX1,y,math.pi/2)
    y+=st
put('yardgate',PX1,4,math.pi/2)
put('slide',66,10); put('swings',75,11,math.pi/2); put('teeter',84,10); put('roundabout',68,-1); put('spring',76,-3); put('spring',79,-3); put('sandbox',84,0)
for y in (-5,3,11): put('campusbench',92.5,y,-math.pi/2)
put('seatoilet',96,-12); put('drink',93,16); put('trashcan',92.5,7)
# the picnic lawn beside it: shelter, tables, string lights, library, grills none
put('picnicshelter',40,4); 
for x,y in ((30,-4),(36,-6),(44,-6),(50,-4),(30,12),(50,12)): put('picnictable',x,y)
put('stringlights',36,14); put('stringlights',44,14); put('library',54,2); put('trashcan',40,-9)
# the promenade shelter mid cross walk (east half)
put('promshelter',150,65,math.pi); put('promshelter',75,54,0)
# the glades (hangouts' meadows): birdbath, birdhouse, hives
for (gx,gy,gr) in W['hangouts']['meadow']['areas']:
    put('birdbath',gx,gy); put('birdhouse',gx+gr*.7,gy+gr*.5); put('beehive',gx-gr*.6,gy-gr*.4); put('beehive',gx-gr*.6+1.6,gy-gr*.4)
# the garden corner (north-west, by the conservatory): greenhouse, Japanese garden with torii and its own lions
put('greenhouse',48,170,math.pi); put('conservatory',66,170,math.pi)
put('torii',84,150,0); put('koi',84,160); put('zen',96,160); put('lion',81,147,math.pi); put('lion',87,147,math.pi); put('jlamp',80,154); put('jlamp',100,154)
for x in (78,88,98): put('planter',x,145)
# the north end of the Mall (tower2): a toilet block and a kiosk; extend the cemetery's iron fence
put('toilet',122,165); put('trashcan',105,165)
st=T(PF['ironfence']['size'][0])
for i in range(6): put('ironfence',-21.6,140+st*(i+.5),math.pi/2)
BROOK=[[201,102]]+[p for p in PP['brook']['pts'] if not inBL(p[0],p[1],8) and p!=[190,104]]
KEEP={'parkbench','campusrail','trashcan','picnictable','drink','archbridge','creekbridge','woodbridge','logbridge','trestle','canoe','kayak','skiff','zen','greenhouse','torii','duck','pigeon','horse'}   # (owner, 7 Nov 2026: "remove all the assets except for: park bench, duck, campusrail, trashcan, picnic table, j lamp, drink, bridges, boats, zen, greenhouse, torii - and animals")
FLOAT={'raft','canoe','kayak','skiff','duck'}
W=json.load(open('data/world.json'))
W['things']=[t for t in W['things'] if not str(t['k']).startswith('p:')]
FL=FLOAT
for k,x,y,r in P:
    # no Polyfork lamps: the park's one lamp post is its own (061-park.js; owner, 9 Nov 2026: "should only be 1 kind of lamp post")
    if k not in KEEP: continue
    o={'k':'p:'+k,'x':round(x,2),'y':round(y,2)}
    if abs(r)>1e-4: o['rot']=round(r,3)
    if k in FL: o['float']=1
    W['things'].append(o)
W['parkPlaces']['brook']['pts']=BROOK
t=json.dumps(W,indent=1,ensure_ascii=False); lines=t.split('\n'); res=[]; i=0; inth=False
while i<len(lines):
    l=lines[i]
    if l==' "things": [': inth=True; res.append(l); i+=1; continue
    if inth and l.startswith('  {'):
        j=i
        while not lines[j].startswith('  }'): j+=1
        obj=json.loads('\n'.join(lines[i:j+1]).rstrip(','))
        res.append('  '+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+(',' if lines[j].endswith(',') else '')); i=j+1; continue
    if inth and l.startswith(' ]'): inth=False
    res.append(l); i+=1
t='\n'.join(res)+'\n'; json.loads(t); open('data/world.json','w').write(t); print('things',len(W['things']))
