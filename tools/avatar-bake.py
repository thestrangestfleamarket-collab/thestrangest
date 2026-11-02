# THE AVATAR KIT (owner, 24 Oct 2026: "make them just the base and they can choose hairstyles, clothes, skin color ... facial hair, hair color,
# height ... use what you have"): cut from the six RPG townsfolk already baked in data/full/rpgchars.json (one rig, 32 bones, same names) into
# data/avatar.json. OUTFITS: each townsperson below the neck, on its own skeleton, its weapon left out. HEAD: the monk's head with its beard
# and beads taken off is the bald base every avatar wears. HAIR and BEARD: pieces cut from the other heads by colour and place (skin is warm
# and mid-saturated; hair, hoods and beards are not; a beard sits low and in front), each fitted from its own skull's box onto the base skull
# and kept in the Head bone's own space, so it rides any outfit's head. Every point carries its role (0 skin, 1 hair, 2 hood, 3 cloth) so the
# game can recolour skin and hair. Each outfit is a BODIES body (src/111a-bodies.js), as tools/bases-bake.py makes the man and the woman: the
# rig's 15 bones fitted to its skeleton at rest (each bone's origin and rest frame; limbs' frames along the bone), its 32 bones' weights folded
# into those 15, two a point; its height to the top of the bald head (so hair never shrinks it) and the Head bone's rest matrix, which seats
# the head pieces. Run (after tools/rpgchars-bake.py): python3 tools/avatar-bake.py
import json, base64, colorsys, numpy as np
B=lambda s,t:np.frombuffer(base64.b64decode(s),t); b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
D=json.load(open('data/full/rpgchars.json')); HEADB={'Head','Neck'}; WEAPON=('Sword','Staff','Bow','Dagger')
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
BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR']
GROUP={'Root':'hips','Body':'hips','Hips':'hips','PoleTarget_L':'hips','PoleTarget_R':'hips','Abdomen':'torso','Torso':'torso','Shoulder_L':'torso','Shoulder_R':'torso','Neck':'head','Head':'head'}
for sd in 'LR':
    GROUP.update({'UpperArm_'+sd:'upperArm'+sd,'LowerArm_'+sd:'forearm'+sd,'UpperLeg_'+sd:'thigh'+sd,'LowerLeg_'+sd:'shin'+sd,'Foot_'+sd:'shoe'+sd})
    for n in ('Fist','Fist1','Fist2','Thumb1','Thumb2','Weapon'): GROUP[n+'_'+sd]='hand'+sd
def basis(y):
    y=y/np.linalg.norm(y); x=np.array([1.0,0,0]); x=x-y*x.dot(y); x/=np.linalg.norm(x); return np.stack([x,y,np.cross(x,y)],1)
def body(o,u,topY):   # the 15 bones on this skeleton, and every kept point's two of them
    at=lambda n:o['G'][o['names'].index(n)][:3,3]; gi=np.array([BONES.index(GROUP[n]) for n in o['names']])
    Wg=np.zeros((len(u),15))
    for kk in range(4): np.add.at(Wg,(np.arange(len(u)),gi[o['J'][u,kk]]),o['W'][u,kk])
    top=np.argsort(-Wg,1)[:,:2]; w0=Wg[np.arange(len(u)),top[:,0]]; w1=Wg[np.arange(len(u)),top[:,1]]; bw=w0/np.maximum(1e-9,w0+w1)
    P=o['P'][u]; J={'pelvis':at('Hips'),'waist':at('Abdomen'),'neck':at('Neck')}; J['headTop']=np.array([0,topY,J['neck'][2]])
    for sd in 'LR':
        J['shoulder'+sd]=at('UpperArm_'+sd); J['elbow'+sd]=at('LowerArm_'+sd); J['wrist'+sd]=at('Fist_'+sd); J['tip'+sd]=at('Fist2_'+sd)
        J['hip'+sd]=at('UpperLeg_'+sd); J['knee'+sd]=at('LowerLeg_'+sd)
        sh,so=BONES.index('shin'+sd),BONES.index('shoe'+sd); m=(Wg[:,sh]>.25)&(Wg[:,so]>.25)   # the ankle: where the shin's hold hands over to the foot's
        J['ankle'+sd]=P[m].mean(0) if m.sum()>3 else J['knee'+sd]+(at('Foot_'+sd)-J['knee'+sd])*.85
        f=P[Wg[:,so]>.5]; t=f[f[:,2]>f[:,2].max()-.06].mean(0); t[1]=f[:,1].min()+.03; J['toe'+sd]=t
    I3=np.eye(3); F={'hips':(J['pelvis'],I3),'torso':(J['waist'],I3),'head':(J['neck'],I3)}
    for sd in 'LR':
        for b,a,c in (('upperArm','shoulder','elbow'),('forearm','elbow','wrist'),('hand','wrist','tip'),('thigh','hip','knee'),('shin','knee','ankle')): F[b+sd]=(J[a+sd],basis(J[a+sd]-J[c+sd]))
        F['shoe'+sd]=(J['ankle'+sd],I3)
    return {'origin':[np.round(F[b][0],5).tolist() for b in BONES],'rest':[np.round(F[b][1].T.reshape(-1),6).tolist() for b in BONES],'height':round(float(topY),5),'hipY':round(float(J['pelvis'][1]),5),
            'bi':b64(top.astype(np.uint8)),'bw':b64(np.round(bw*255).astype(np.uint8))}
OUT={'bones':BONES,'outfits':{},'head':None,'hair':{},'beard':{}}
base=head('monk'); BX=box(base); f=cut(base,[0,1],True)
for k in ['monk','warrior','cleric','ranger','rogue','wizard']:   # monk first: the base outfit
    o=load(k); u,I=keep(o,tris(o,False)); C=o['C'][u]; role=np.where(skin(C),0,3); HM=o['G'][o['names'].index('Head')]
    topY=float((HM@np.c_[f['Pl'],np.ones(len(f['Pl']))].T).T[:,1].max())
    OUT['outfits'][k]=pack(o['P'][u],C,I,role,{**body(o,u,topY),'headM':np.round(HM.T.reshape(-1),7).tolist()})   # (headM column-major, as THREE.Matrix4.fromArray reads)
    print('outfit',k,len(I),'tris, height',round(topY,3),'hip',OUT['outfits'][k]['hipY'])
OUT['head']=pack(f['Pl'],f['C'],f['I'],np.where(f['cls']==0,0,1)); print('head',OUT['head']['tris'],'tris')
for name,src,cl in [('bun','warrior',[1]),('slick','cleric',[1]),('mane','wizard',[1]),('greenhood','ranger',[1]),('redhood','rogue',[1]),('long','monk',[2]),('full','wizard',[2])]:
    h=head(src); pc=cut(h,cl,False); (a0,a1)=box(h); P=(pc['Pl']-a0)/np.maximum(1e-6,a1-a0)*(BX[1]-BX[0])+BX[0]
    hood=name.endswith('hood'); d=pack(P,pc['C'],pc['I'],np.full(len(P),2 if hood else 1))
    (OUT['beard'] if cl==[2] else OUT['hair'])[name]=d; print('beard' if cl==[2] else 'hair',name,d['tris'],'tris')
# more hair from the pawns (data/pawns.json; their hair is its own part): fitted at rest from the pawn's bare head (its skin on the head
# bone) onto the monk's, then into the monk's Head space. The villager's hair and beard are one part: split under his eyes, in front.
mo=load('monk'); mh=mo['names'].index('Head'); u,_=keep(mo,tris(mo,True)); m=(headcls('monk',mo['P'][u],mo['C'][u])==0)&(mo['dom'][u]==mh)
MB=(mo['P'][u][m].min(0),mo['P'][u][m].max(0)); MINV=np.linalg.inv(mo['G'][mh]); PW=json.load(open('data/pawns.json'))
def pawn(k,skin,hair,eyes,beard=None):
    M=PW[k]['mesh']; P=(B(M['p'],np.int16).reshape(-1,3).astype(float)+32500)*M['sc']+np.array(M['lo']); C=B(M['c'],np.uint8).reshape(-1,3).astype(float)
    R=B(M['r'],np.uint8); I=B(M['i'],np.uint16).reshape(-1,3).astype(int); J=B(M['j'],np.uint8).reshape(-1,4); W=B(M['w'],np.uint8).reshape(-1,4)
    hb=PW[k]['rig']['names'].index('DEF_head'); s=np.unique(I[R[I[:,0]]==skin]); s=s[J[s,W[s].argmax(1)]==hb]; a0,a1=P[s].min(0),P[s].max(0)
    T=I[R[I[:,0]]==hair]; c=P[T].mean(1); low=(c[:,1]<P[np.unique(I[R[I[:,0]]==eyes]),1].min())&(c[:,2]>.05)
    if beard is not None: T=T[low==beard]
    q,inv=np.unique(T.reshape(-1),return_inverse=True); Pw=(P[q]-a0)/(a1-a0)*(MB[1]-MB[0])+MB[0]
    return pack((MINV@np.c_[Pw,np.ones(len(Pw))].T).T[:,:3],C[q],inv.reshape(-1,3),np.ones(len(q)))
for name,args in [('spiky',('hero_m',2,5,4)),('ponytail',('hero_f',2,4,3)),('shaggy',('villager_m',2,4,3,False)),('bob',('villager_f',3,5,4))]:
    OUT['hair'][name]=d=pawn(*args); print('hair',name,d['tris'],'tris')
OUT['beard']['short']=d=pawn('villager_m',2,4,3,True); print('beard short',d['tris'],'tris')
s=json.dumps(OUT,separators=(',',':')); open('data/avatar.json','w').write(s); print('data/avatar.json',len(s),'bytes')
