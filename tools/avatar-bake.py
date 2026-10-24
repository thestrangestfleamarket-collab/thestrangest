# THE AVATAR KIT (owner, 24 Oct 2026: "make them just the base and they can choose hairstyles, clothes, skin color ... facial hair, hair color,
# height ... use what you have"): cut from the six RPG townsfolk already baked in data/rpgchars.json (one rig, 32 bones, same names) into
# data/avatar.json. OUTFITS: each townsperson below the neck, on its own skeleton, its weapon left out. HEAD: the monk's head with its beard
# and beads taken off is the bald base every avatar wears. HAIR and BEARD: pieces cut from the other heads by colour and place (skin is warm
# and mid-saturated; hair, hoods and beards are not; a beard sits low and in front), each fitted from its own skull's box onto the base skull
# and kept in the Head bone's own space, so it rides any outfit's head. Every point carries its role (0 skin, 1 hair, 2 hood, 3 cloth) so the
# game can recolour skin and hair. Run (after tools/rpgchars-bake.py): python3 tools/avatar-bake.py
import json, base64, colorsys, numpy as np
B=lambda s,t:np.frombuffer(base64.b64decode(s),t); b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
D=json.load(open('data/rpgchars.json')); HEADB={'Head','Neck'}; WEAPON=('Sword','Staff','Bow','Dagger')
def load(k):
    v=D[k]; M=v['mesh']; R=v['rig']
    P=(B(M['p'],np.int16).reshape(-1,3).astype(float)+32500)*M['sc']+np.array(M['lo'])
    G=np.linalg.inv(B(R['ibm'],np.float32).reshape(-1,4,4).transpose(0,2,1).astype(float))
    W=B(M['w'],np.uint8).reshape(-1,4).astype(float)/255; W/=np.maximum(1e-9,W.sum(1,keepdims=True)); J=B(M['j'],np.uint8).reshape(-1,4).astype(int)
    return dict(v=v,P=P,C=B(M['c'],np.uint8).reshape(-1,3).astype(float),R=B(M['r'],np.uint8),J=J,W=W,I=B(M['i'],np.uint16).reshape(-1,3).astype(int),
                names=R['names'],parts=M['parts'],G=G,dom=J[np.arange(len(J)),W.argmax(1)])
def tris(o,head):   # triangles on the head (Head/Neck the dominant bone of two corners or more) or off it; weapons never
    nm=np.array(o['names']); h=np.isin(nm[o['dom'][o['I']]],list(HEADB)).sum(1)>=2
    weap=np.array([any(w in p for w in WEAPON) for p in o['parts']])[o['R'][o['I'][:,0]]]
    return (h if head else ~h)&~weap
def keep(o,tm):
    I=o['I'][tm]; u,inv=np.unique(I.reshape(-1),return_inverse=True); return u,inv.reshape(-1,3)
def hsv(C): return np.array([colorsys.rgb_to_hsv(*(c/255)) for c in C])
def skin(C):
    H=hsv(C); hue=H[:,0]*360; return (hue>14)&(hue<44)&(H[:,1]>.24)&(H[:,1]<.7)&(H[:,2]>.38)
def headcls(k,P,C):   # 0 skin, 1 hair (or hood), 2 beard, 3 left out (the monk's beads)
    sk=skin(C); H=hsv(C); v=H[:,2]; lo=P.min(0); hi=P.max(0); yn=(P[:,1]-lo[1])/(hi[1]-lo[1]); zn=(P[:,2]-lo[2])/(hi[2]-lo[2])
    if k=='cleric': return np.where((H[:,1]<.06)&(v>.55),1,0)   # its white slicked hair; the rest its stone-grey face
    c=np.where(sk,0,1)
    if k=='wizard': c[(~sk)&(yn<.6)&(zn>.4)]=2
    if k=='monk': c[(~sk)&(yn<.62)]=2; c[(~sk)&(yn<.45)&(v<.32)]=3
    return c
def head(k):   # a head's points in its Head bone's own space, their colours and classes, and its triangles
    o=load(k); hb=o['names'].index('Head'); u,I=keep(o,tris(o,True)); P=o['P'][u]
    Pl=(np.linalg.inv(o['G'][hb])@np.c_[P,np.ones(len(P))].T).T[:,:3]
    return dict(Pl=Pl,C=o['C'][u],I=I,cls=headcls(k,P,o['C'][u]))
def cut(h,cl,strict):   # the triangles whose corners are in classes cl (all three, or two of three)
    ok=np.isin(h['cls'],cl)[h['I']].sum(1)>=(3 if strict else 2); u,inv=np.unique(h['I'][ok].reshape(-1),return_inverse=True)
    return dict(Pl=h['Pl'][u],C=h['C'][u],I=inv.reshape(-1,3),cls=h['cls'][u])
def box(h):
    m=np.isin(h['cls'],[0,1]); return h['Pl'][m].min(0),h['Pl'][m].max(0)
def pack(P,C,I,role,extra=None):   # the skin format (points 16-bit over their box), plus each point's role
    lo=P.min(0); hi=P.max(0); sc=max((hi-lo).max(),1e-6)/65000
    d={'n':len(P),'lo':np.round(lo,6).tolist(),'sc':float(sc),'p':b64(np.round((P-lo)/sc-32500).astype(np.int16)),'c':b64(np.clip(C,0,255).round().astype(np.uint8)),
       'i':b64(I.reshape(-1).astype(np.uint16)),'k':b64(role.astype(np.uint8)),'tris':int(len(I))}
    if extra: d.update(extra)
    return d
OUT={'outfits':{},'head':None,'hair':{},'beard':{}}
for k in ['monk','warrior','cleric','ranger','rogue','wizard']:   # monk first: the base outfit
    o=load(k); u,I=keep(o,tris(o,False)); C=o['C'][u]
    role=np.where(skin(C),0,3); v=o['v']
    mesh=pack(o['P'][u],C,I,role,{'r':b64(np.zeros(len(u),np.uint8)),'j':b64(o['J'][u].astype(np.uint8)),'w':b64(np.round(o['W'][u]*255).astype(np.uint8)),'parts':['body']})
    OUT['outfits'][k]={'rig':v['rig'],'mesh':mesh,'clips':v['clips'],'tall':v['tall']}
    print('outfit',k,mesh['tris'],'tris')
base=head('monk'); BX=box(base); f=cut(base,[0,1],True)
OUT['head']=pack(f['Pl'],f['C'],f['I'],np.where(f['cls']==0,0,1)); print('head',OUT['head']['tris'],'tris')
for name,src,cl in [('bun','warrior',[1]),('slick','cleric',[1]),('mane','wizard',[1]),('greenhood','ranger',[1]),('redhood','rogue',[1]),('long','monk',[2]),('full','wizard',[2])]:
    h=head(src); pc=cut(h,cl,False); (a0,a1)=box(h); P=(pc['Pl']-a0)/np.maximum(1e-6,a1-a0)*(BX[1]-BX[0])+BX[0]
    hood=name.endswith('hood'); d=pack(P,pc['C'],pc['I'],np.full(len(P),2 if hood else 1))
    (OUT['beard'] if cl==[2] else OUT['hair'])[name]=d; print('beard' if cl==[2] else 'hair',name,d['tris'],'tris')
s=json.dumps(OUT,separators=(',',':')); open('data/avatar.json','w').write(s); print('data/avatar.json',len(s),'bytes')
