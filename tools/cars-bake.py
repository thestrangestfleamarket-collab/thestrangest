# THE CARS: bakes the six cars of the racing-cars kit (data/full/racing-cars-kit.glb, CC0) into data/cars.json: each car's body in its own frame
# (metres, forward +z), one wheel shared by its four corners, where those corners are, and each part's colours by material (vertex colours; a lit part
# keeps its glow). Positions as int16 over the part's box, normals int8, colours uint8, indices uint16, each base64. python3 -I tools/cars-bake.py
import json, struct, base64, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# each car's glass: these colours (sRGB, as the kit paints them) above half its height are its windows, baked as their own part so the game can make them see-through
GLASS={'muscle-car-60s':[(46,49,56)],'wedge-coupe-80s':[(46,49,56)],'station-wagon-70s':[(32,36,42)],'pickup-truck-70s':[(103,107,113)],'convertible-60s':[(79,117,145)],'camper-van':[(63,65,72),(32,36,42)]}
CARS={'muscle-car-60s':'MUSCLE CAR','convertible-60s':'CONVERTIBLE','station-wagon-70s':'STATION WAGON','pickup-truck-70s':'PICKUP TRUCK','wedge-coupe-80s':'WEDGE COUPE','camper-van':'CAMPER VAN'}
b=open(os.path.join(ROOT,'data/full/racing-cars-kit.glb'),'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); BIN=b[20+n+8:]
N,A,BV,MS,MT=J['nodes'],J['accessors'],J['bufferViews'],J['meshes'],J['materials']
CT={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def acc(i):
    a=A[i]; v=BV[a['bufferView']]; f,s=CT[a['componentType']]; c=NC[a['type']]; o=v.get('byteOffset',0)+a.get('byteOffset',0); st=v.get('byteStride',s*c); out=[]
    for k in range(a['count']):
        r=list(struct.unpack_from('<'+f*c,BIN,o+k*st))
        if a.get('normalized'): r=[x/(255 if f=='B' else 65535 if f=='H' else 1) for x in r]
        out.append(r)
    return out
def mat4(nd): return nd.get('matrix',[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])
def mul(m,p,w=1): return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12]*w, m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13]*w, m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]*w]
def mm(a,b): return [sum(a[r+4*k]*b[k+4*c] for k in range(4)) for c in range(4) for r in range(4)]
def gather(i,M,groups):
    nd=N[i]; M=mm(M,mat4(nd))
    if 'mesh' in nd:
        for pr in MS[nd['mesh']]['primitives']:
            mt=MT[pr.get('material',0)] if 'material' in pr else {}; em=mt.get('emissiveFactor'); k=json.dumps([round(x,3) for x in em]) if em and max(em)>0 else ''
            g=groups.setdefault(k,{'e':em if k else None,'k':(mt.get('extensions',{}).get('KHR_materials_emissive_strength',{}).get('emissiveStrength',1)),'p':[],'n':[],'c':[],'i':[]})
            P=acc(pr['attributes']['POSITION']); Nn=acc(pr['attributes']['NORMAL']); Cc=acc(pr['attributes']['COLOR_0']) if 'COLOR_0' in pr['attributes'] else [[.8,.8,.8]]*len(P)
            I=acc(pr['indices']) if 'indices' in pr else [[x] for x in range(len(P))]; base=len(g['p'])//3
            for p in P: g['p'].extend(mul(M,p))
            for q in Nn: v=mul(M,q,0); l=sum(x*x for x in v)**.5 or 1; g['n'].extend([x/l for x in v])
            for c in Cc: g['c'].extend(c[:3])
            g['i'].extend(base+x[0] for x in I)
    for c in nd.get('children',[]): gather(c,M,groups)
def split_glass(groups,cols):
    top=max(max(g['p'][1::3]) for g in groups.values()); out={}; gl={'e':None,'k':1,'p':[],'n':[],'c':[],'i':[]}
    srgb=lambda c:tuple(max(0,min(255,round((x**(1/2.2))*255))) for x in c)
    for key,g in groups.items():
        keep={'e':g['e'],'k':g['k'],'p':g['p'],'n':g['n'],'c':g['c'],'i':[]}
        for t in range(0,len(g['i']),3):
            tri=g['i'][t:t+3]; v=tri[0]; col=srgb(g['c'][v*3:v*3+3]); cy=sum(g['p'][q*3+1] for q in tri)/3
            if any(max(abs(col[j]-c[j]) for j in range(3))<=2 for c in cols) and cy>top*.5:
                b=len(gl['p'])//3
                for q in tri: gl['p'].extend(g['p'][q*3:q*3+3]); gl['n'].extend(g['n'][q*3:q*3+3]); gl['c'].extend(g['c'][q*3:q*3+3])
                gl['i'].extend([b,b+1,b+2])
            else: keep['i'].extend(tri)
        out[key]=keep
    return out,({'glass':gl} if gl['i'] else {})
def clip_poly(poly,keep):
    # Sutherland-Hodgman: keep(p)>=0 inside; poly a list of (pos,normal,colour) vertices
    out=[]
    for i in range(len(poly)):
        a,b=poly[i],poly[(i+1)%len(poly)]; fa,fb=keep(a[0]),keep(b[0])
        if fa>=0: out.append(a)
        if (fa>=0)!=(fb>=0):
            t=fa/(fa-fb); out.append(tuple([x+(y-x)*t for x,y in zip(a[j],b[j])] for j in range(3)))
    return out
CAB=[None]
def hollow(groups,glass):
    # the cabin made hollow: the solid body's flat faces at the window line, over the cabin, cut away (the hood and trunk around it kept)
    G=glass['glass']; P=G['p']; side=[]
    for t in range(0,len(G['i']),3):   # the side windows (glass facing sideways) give the cabin: its length, its sides, its window line
        tri=[P[q*3:q*3+3] for q in G['i'][t:t+3]]; u=[tri[1][j]-tri[0][j] for j in range(3)]; v=[tri[2][j]-tri[0][j] for j in range(3)]; n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; l=sum(x*x for x in n)**.5 or 1
        if abs(n[0]/l)>.6 and sum(q[1] for q in tri)/3>max(P[1::3])*.6: side.extend(tri)
    if not side: return groups
    xs=[p[0] for p in side]; ys=[p[1] for p in side]; zs=[p[2] for p in side]
    hw=max(-min(xs),max(xs))-.06; belt=min(ys); gz=P[2::3]; z0,z1=max(min(gz),min(zs)-.3),min(max(gz),max(zs)+.3)
    CAB[0]={'hw':round(hw,3),'belt':round(belt,3),'z0':round(z0,3),'z1':round(z1,3),'roof':round(max(P[1::3]),3)}; print('   cabin',CAB[0])
    out={}
    for key,g in groups.items():
        ng={'e':g['e'],'k':g['k'],'p':[],'n':[],'c':[],'i':[]}
        def add(poly):
            b=len(ng['p'])//3
            for v in poly: ng['p'].extend(v[0]); ng['n'].extend(v[1]); ng['c'].extend(v[2])
            for k in range(1,len(poly)-1): ng['i'].extend([b,b+k,b+k+1])
        for t in range(0,len(g['i']),3):
            tri=[(g['p'][q*3:q*3+3],g['n'][q*3:q*3+3],g['c'][q*3:q*3+3]) for q in g['i'][t:t+3]]
            u=[tri[1][0][j]-tri[0][0][j] for j in range(3)]; v=[tri[2][0][j]-tri[0][0][j] for j in range(3)]; n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; l=sum(x*x for x in n)**.5 or 1
            cy=sum(p[0][1] for p in tri)/3
            if abs(n[1]/l)<.9 or abs(cy-belt)>.14: add(tri); continue
            for planes in [[lambda p:-hw-p[0]],[lambda p:p[0]-hw],[lambda p:p[0]+hw,lambda p:hw-p[0],lambda p:z0-p[2]],[lambda p:p[0]+hw,lambda p:hw-p[0],lambda p:p[2]-z1]]:   # what's outside the cabin, one plane at a time
                q=tri
                for pl in planes:
                    q=clip_poly(q,pl)
                    if len(q)<3: break
                if len(q)>=3: add(q)
        out[key]=ng
    return out
def pack(groups):
    out=[]
    for g in groups.values():
        P=g['p']; mn=[min(P[k::3]) for k in range(3)]; mx=[max(P[k::3]) for k in range(3)]; sc=[(mx[k]-mn[k])/65534 or 1e-6 for k in range(3)]
        q=b''.join(struct.pack('<hhh',*[round((P[v*3+k]-mn[k])/sc[k])-32767 for k in range(3)]) for v in range(len(P)//3))
        nn=b''.join(struct.pack('<bbb',*[max(-127,min(127,round(x*127))) for x in g['n'][v*3:v*3+3]]) for v in range(len(P)//3))
        cc=bytes(max(0,min(255,round((x**(1/2.2))*255))) for x in g['c'])
        assert len(P)//3<65536; ii=struct.pack('<'+'H'*len(g['i']),*g['i'])
        e=lambda x:base64.b64encode(x).decode()
        out.append({'e':[round(x,3) for x in g['e']] if g['e'] else None,'k':g['k'],'o':[round(x+32767*s,6) for x,s in zip(mn,sc)],'s':[round(x,8) for x in sc],'p':e(q),'n':e(nn),'c':e(cc),'i':e(ii)})
    return out
root=N[J['scenes'][0]['nodes'][0]]; R={}; tris=0
for i in root['children']:
    nm=N[i].get('name')
    if nm not in CARS or nm in R: continue
    I4=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; body={}; wheel={}; corners={}
    for c in N[i]['children']:
        cn=N[c].get('name') or ''
        if cn.startswith('steer-') or cn.startswith('wheel-'):
            m=mat4(N[c]); corners[cn.split('-')[1]]=[round(m[12],4),round(m[13],4),round(m[14],4)]
            if cn.endswith('fl'): gather(c,[1,0,0,0,0,1,0,0,0,0,1,0,-m[12],-m[13],-m[14],1],wheel)   # its own matrix is applied in gather: the wheel about its centre
        else: gather(c,I4,body)
    body,glass=split_glass(body,GLASS.get(nm,[]))
    CAB[0]=None
    if glass and nm!='convertible-60s': body=hollow(body,glass)
    tb=sum(len(g['i']) for g in body.values())//3; tw=sum(len(g['i']) for g in wheel.values())//3; tris+=tb+tw*4
    P=[v for g in body.values() for v in g['p']]
    R[nm]={'name':CARS[nm],'size':[round(max(P[k::3])-min(P[k::3]),3) for k in range(3)],'low':round(min(P[1::3]),3),'wheels':[corners[k] for k in ('fl','fr','rl','rr')],
           'r':round(max(abs(v) for v in [x for g in wheel.values() for x in g['p'][1::3]]),3),'body':pack(body),'glass':pack(glass) if glass else [],'cab':CAB[0],'wheel':pack(wheel),'tris':[tb,tw]}
cz={'__file__':os.path.join(ROOT,'tools/cruiser-bake.py'),'__name__':'cruiser'}; exec(compile(open(cz['__file__']).read(),'cruiser-bake','exec'),cz); R['police-cruiser-80s']=cz['make']()
fz={'__file__':os.path.join(ROOT,'tools/fliers-bake.py'),'__name__':'fliers'}; exec(compile(open(fz['__file__']).read(),'fliers-bake','exec'),fz); R.update({k:fz['make'](v) for k,v in fz['SPECS'].items()})   # the hover cars   # the game's own police cruiser, modelled in code
s=json.dumps({'src':'racing-cars-kit (CC0)','cars':R},separators=(',',':')); open(os.path.join(ROOT,'data/cars.json'),'w').write(s)
print(len(R),'cars,',tris,'triangles drawn,',len(s)//1024,'KB'); [print(' ',k,v['name'],v['size'],v['tris'],'wheels',v['wheels'],'r',v['r']) for k,v in R.items()]
