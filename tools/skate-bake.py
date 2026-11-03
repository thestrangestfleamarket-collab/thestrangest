# THE SKATEPARK (owner, 3 Nov 2026, his Drive glb folder's Polyfork skatepark kit: "figure out a place for everything"): every part of the kit
# baked as tools/polyfork-bake.py bakes a placed model (kit format, metres) and the kit's LAYOUT.json packed as [part, x, y, z, ry, rx, rz, s]
# (metres, degrees), into data/skatepark.json for src/089c-skatepark.js. The kit's raised terrain is not kept: a placement on its 1.2 m tier is
# set down on the ground. A part the folder did not give (the Drive hands small files only inline) is stood in by a plain shape of its size.
# Run: python3 tools/skate-bake.py <folder with the kit's .glb files and LAYOUT.json>
import sys, os, json, numpy as np
R=sys.argv[1]; PB={}; A=sys.argv; sys.argv=['x','-','-','-']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'polyfork-bake.py')).read().split("if mode=='props':")[0],PB); sys.argv=A
load, simplify, kit = PB['load'], PB['simplify'], PB['kit']
def boxes(spec):
    # plain stand-ins: [(x0,y0,z0,x1,y1,z1,colour)] to one coloured mesh
    P=[];C=[];F=[]
    for x0,y0,z0,x1,y1,z1,c in spec:
        v=np.array([[x,y,z] for x in (x0,x1) for y in (y0,y1) for z in (z0,z1)],float); b=len(P)*0
        q=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]
        for a,bq,cq,d in q:
            k=sum(len(p) for p in P); P.append(v[[a,bq,cq,d]]); C.append(np.tile(c,(4,1))); F+= [[k,k+1,k+2],[k,k+2,k+3]]
    return np.vstack(P),np.vstack(C).astype(float),np.array(F)
G=[150,148,140]; LG=[189,185,176]; ST=[120,124,128]; PK=[176,140,130]
def ramp(w,d,h,n=10):
    # a quarter pipe: its curve rising toward -z, flat deck behind
    S=[]
    for i in range(n):
        a0=i/n*np.pi/2; a1=(i+1)/n*np.pi/2; z0=d/2-np.sin(a0)*d*.8; z1=d/2-np.sin(a1)*d*.8; y0=(1-np.cos(a0))*h; y1=(1-np.cos(a1))*h
        S.append((-w/2,0,min(z0,z1),w/2,max(y0,y1),max(z0,z1),G))
    S.append((-w/2,0,-d/2,w/2,h,d/2-d*.8,G)); S.append((-w/2,h,-d/2,w/2,h+.05,-d/2+.15,ST)); return S
STAND={'skate-slab-tile':[(-1,-.06,-1,1,0,1,LG)],
  'concrete-skate-ledge':[(-1,0,-.25,1,.42,.25,G),(-1,.42,-.25,1,.45,.25,ST)],
  'concrete-stair-set':[(-1,0,-2+i*.5,1,1.5-i*1.5/8,-1.5+i*.5,G) for i in range(8)],
  'granite-plaza-block':[(-1,0,-.3,1,.45,.3,PK)],
  'overpass-pier':[(-.6,0,-.6,.6,5.2,.6,G),(-4,5.2,-1,4,6,1,G)],
  'wallride-wall':[(-2,0,-.2,2,2.4,.2,[110,150,150])],
  'concrete-transition-module':ramp(2,4,1.8)}
L=json.load(open(os.path.join(R,'LAYOUT.json')))
parts={}
for k in sorted({p['part'] for p in L if p['part']!='_terrain'}):
    f=os.path.join(R,k+'.glb')
    if os.path.exists(f):
        P,C,F=load(f); tr=2000 if len(F)>3000 else 1500
        if len(F)>tr: P,C,F=simplify(P,C,F,tr)
    elif k in STAND: P,C,F=boxes(STAND[k])
    else: print('no part',k); continue
    parts[k]=kit(P,C,F)
lay=[]
for p in L:
    if p['part'] not in parts: continue
    y=p.get('y',0); y=y-1.25 if y>1.1 else y   # (off the kit's tier, onto the ground)
    lay.append([p['part'],round(p['x'],3),round(max(0,y),3),round(p['z'],3),round(p.get('ry',0),2),round(p.get('rx',0),2),round(p.get('rz',0),2),round(p.get('s',1),3)])
out='data/skatepark.json'; json.dump({'parts':parts,'layout':lay},open(out,'w'),separators=(',',':'))
print(len(parts),'parts',len(lay),'placements',os.path.getsize(out),'bytes')
