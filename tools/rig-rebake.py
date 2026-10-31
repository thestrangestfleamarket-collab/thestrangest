#!/usr/bin/env python3
# Retarget-bake: take a clip-driven skinned character (its own skeleton + skin weights)
# and bake it onto the player's 15-bone BODIES rig (same origin/rest convention as bases-bake.py),
# remapping the existing skin weights by bone name. Output per-vertex colours (vcol).
import json, base64, sys, numpy as np

BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR']

def b64(s,dt): return np.frombuffer(base64.b64decode(s),dt)
def enc(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()

def decode_mesh(M):
    p=b64(M['p'],np.int16).reshape(-1,3).astype(float)
    P=np.empty_like(p)
    for c in range(3): P[:,c]=(p[:,c]+32500)*M['sc']+M['lo'][c]
    col=b64(M['c'],np.uint8).reshape(-1,3).astype(float)/255.0
    idx=b64(M['i'],np.uint16).reshape(-1,3).astype(int)
    ji=b64(M['j'],np.uint8).reshape(-1,4).astype(int)
    wt=b64(M['w'],np.uint8).reshape(-1,4).astype(float)/255.0
    return P,col,idx,ji,wt

def bone_world(rig):
    # world bind position of each bone = translation of inverse(ibm)
    ibm=b64(rig['ibm'],np.float32).reshape(-1,16)
    pos=[]
    for e in ibm:
        M=e.reshape(4,4).T          # column-major -> row-major 4x4
        inv=np.linalg.inv(M)
        pos.append(inv[:3,3])
    return np.array(pos)

def basis(y):
    y=y/ (np.linalg.norm(y) or 1); x=np.array([1.0,0,0]); x=x-y*x.dot(y)
    n=np.linalg.norm(x); x=x/n if n>1e-6 else np.array([0.0,1,0]); return np.stack([x,y,np.cross(x,y)],1)

def frames(J):
    I=np.eye(3)
    F={'hips':(J['pelvis'],J['waist'],I),'torso':(J['waist'],J['neck'],I),'head':(J['neck'],J['headTop'],I)}
    for n in 'LR':
        for b,a,c in (('upperArm','shoulder','elbow'),('forearm','elbow','wrist'),('hand','wrist','tip'),('thigh','hip','knee'),('shin','knee','ankle')):
            F[b+n]=(J[a+n],J[c+n],basis(J[a+n]-J[c+n]))
        F['shoe'+n]=(J['ankle'+n],J['toe'+n],I)
    return F

def rebake(char, name2role, w_map):
    rig=char['rig']; names=rig['names']; nidx={n:i for i,n in enumerate(names)}
    P,col,idx,ji,wt=decode_mesh(char['mesh'])
    W=bone_world(rig)
    jp=lambda nm: W[nidx[nm]]
    J={}
    J['pelvis']=jp(name2role['pelvis']); J['waist']=jp(name2role['waist']); J['neck']=jp(name2role['neck'])
    J['headTop']=jp(name2role['neck'])+np.array([0,(P[:,1].max()-jp(name2role['neck'])[1]),0])
    for n in 'LR':
        J['shoulder'+n]=jp(name2role['shoulder'+n]); J['elbow'+n]=jp(name2role['elbow'+n]); J['wrist'+n]=jp(name2role['wrist'+n])
        J['hip'+n]=jp(name2role['hip'+n]); J['knee'+n]=jp(name2role['knee'+n]); J['ankle'+n]=jp(name2role['ankle'+n])
        armdir=J['wrist'+n]-J['elbow'+n]; J['tip'+n]=J['wrist'+n]+armdir/ (np.linalg.norm(armdir) or 1)*0.1*(P[:,1].max())
        J['toe'+n]=J['ankle'+n]+np.array([0,0,0.12*(P[:,1].max())])
    bone,wout=remap_weights(names,ji,wt,w_map)
    return encode_body(P,idx,bone,wout,col,J),J

def remap_weights(names,ji,wt,w_map):
    srcmap=np.full(len(names),-1,int)
    for i,nm in enumerate(names):
        r=w_map.get(nm)
        if r is not None: srcmap[i]=BONES.index(r)
    nV=ji.shape[0]; bone=np.zeros((nV,2),int); wout=np.ones(nV)
    for v in range(nV):
        acc={}
        for k in range(4):
            bi=srcmap[ji[v,k]]; wv=wt[v,k]
            if bi>=0 and wv>0: acc[bi]=acc.get(bi,0)+wv
        if not acc: acc={0:1.0}
        top=sorted(acc.items(),key=lambda x:-x[1])
        a=top[0][0]; c=top[1][0] if len(top)>1 else a
        wa=top[0][1]; wc=top[1][1] if len(top)>1 else 0.0
        bone[v]=[a,c]; wout[v]=wa/((wa+wc) or 1)
    return bone,wout

def encode_body(P,idx,bone,wout,col,J):
    F=frames(J); lo=P.min(0); sc=float((P.max(0)-lo).max())/65000.0 or 1e-6
    q=np.clip(np.round((P-lo)/sc)-32500,-32768,32767).astype(np.int16)
    return {'height':round(float(P[:,1].max()),4),'hipY':round(float(J['pelvis'][1]),4),
      'origin':[np.round(F[b][0],4).tolist() for b in BONES],
      'rest':[np.round(F[b][2].T.reshape(-1),5).tolist() for b in BONES],
      'lo':[round(float(x),5) for x in lo],'sc':sc,
      'pos':enc(q),'tri':enc(idx.reshape(-1).astype(np.uint16)),
      'bone':enc(bone.reshape(-1).astype(np.uint8)),'w':enc(np.clip(np.round(wout*255),0,255).astype(np.uint8)),
      'vcol':enc(np.clip(np.round(col*255),0,255).astype(np.uint8))}

# --- RPG townsfolk (Quaternius) map ---
RPG_ROLE={'pelvis':'Hips','waist':'Torso','neck':'Neck',
  'shoulderL':'UpperArm_L','elbowL':'LowerArm_L','wristL':'Fist_L',
  'shoulderR':'UpperArm_R','elbowR':'LowerArm_R','wristR':'Fist_R',
  'hipL':'UpperLeg_L','kneeL':'LowerLeg_L','ankleL':'Foot_L',
  'hipR':'UpperLeg_R','kneeR':'LowerLeg_R','ankleR':'Foot_R'}
RPG_W={'Root':'hips','Body':'hips','Hips':'hips','Abdomen':'torso','Torso':'torso','Neck':'head','Head':'head',
  'Shoulder_L':'upperArmL','UpperArm_L':'upperArmL','LowerArm_L':'forearmL','Fist_L':'handL','Fist1_L':'handL','Fist2_L':'handL','Thumb1_L':'handL','Thumb2_L':'handL',
  'Shoulder_R':'upperArmR','UpperArm_R':'upperArmR','LowerArm_R':'forearmR','Fist_R':'handR','Fist1_R':'handR','Fist2_R':'handR','Thumb1_R':'handR','Thumb2_R':'handR','Weapon_R':'handR',
  'UpperLeg_L':'thighL','LowerLeg_L':'shinL','Foot_L':'shoeL','UpperLeg_R':'thighR','LowerLeg_R':'shinR','Foot_R':'shoeR'}

# --- Dungeon skeletons / guards (KayKit) map: one shared rig, per-char mesh ---
SKEL_ROLE={'pelvis':'hips','waist':'chest','neck':'head',
  'shoulderL':'upperarm.l','elbowL':'lowerarm.l','wristL':'wrist.l',
  'shoulderR':'upperarm.r','elbowR':'lowerarm.r','wristR':'wrist.r',
  'hipL':'upperleg.l','kneeL':'lowerleg.l','ankleL':'foot.l',
  'hipR':'upperleg.r','kneeR':'lowerleg.r','ankleR':'foot.r'}
SKEL_W={'root':'hips','hips':'hips','spine':'torso','chest':'torso','head':'head',
  'upperarm.l':'upperArmL','lowerarm.l':'forearmL','wrist.l':'handL','hand.l':'handL','handslot.l':'handL',
  'upperarm.r':'upperArmR','lowerarm.r':'forearmR','wrist.r':'handR','hand.r':'handR','handslot.r':'handR',
  'upperleg.l':'thighL','lowerleg.l':'shinL','foot.l':'shoeL','toes.l':'shoeL',
  'upperleg.r':'thighR','lowerleg.r':'shinR','foot.r':'shoeR','toes.r':'shoeR'}

def bake_shared(src, keys, role, wmap, outpath):
    d=json.load(open(src)); rig=d['rig']; out={'bones':BONES,'bodies':{}}
    for key in keys:
        body,J=rebake({'rig':rig,'mesh':d['chars'][key]}, role, wmap)
        out['bodies'][key]=body; print(key,'height',body['height'],'tris',len(body['tri'])//3)
    json.dump(out,open(outpath,'w'),separators=(',',':'))
    import os; print(outpath,round(os.path.getsize(outpath)/1e6,2),'MB')

# --- Pawns (KayKit/UAL): their rig has NO arm bones (hands float in a T-pose); we generate arm tubes between a derived shoulder and the hand. ---
PAWN_W={'root':'hips','DEF_pelvis':'hips','DEF_spine':'torso','DEF_head':'head','DEF_hand_L':'handL','DEF_hand_R':'handR',
  'DEF_thigh_L':'thighL','DEF_thigh_L_001':'thighL','DEF_calf_L':'shinL','DEF_calf_L_001':'shinL','DEF_foot_L':'shoeL',
  'DEF_thigh_R':'thighR','DEF_thigh_R_001':'thighR','DEF_calf_R':'shinR','DEF_calf_R_001':'shinR','DEF_foot_R':'shoeR'}
def seg(aP,aC,aB,aI, A,B, ra,rb, bi, color):
    d=B-A; L=np.linalg.norm(d)
    if L<1e-6: return
    d=d/L; up=np.array([0,1.0,0.0]) if abs(d[1])<0.9 else np.array([1.0,0,0])
    x=np.cross(up,d); x/=(np.linalg.norm(x) or 1); z=np.cross(d,x)
    o=len(aP)
    for (C,r) in [(A,ra),(B,rb)]:
        for a in range(6):
            t=a/6*2*np.pi; aP.append(C+(np.cos(t)*r)*x+(np.sin(t)*r)*z); aC.append(color); aB.append([bi,bi])
    for a in range(6):
        a1=(a+1)%6; aI.append([o+a,o+6+a,o+a1]); aI.append([o+a1,o+6+a,o+6+a1])
def build_pawn(c, r):
    rig=c['rig']; names=rig['names']; nidx={n:i for i,n in enumerate(names)}
    P,col,idx,ji,wt=decode_mesh(c['mesh']); W=bone_world(rig); jp=lambda nm:W[nidx[nm]]
    dom=np.array([ji[v][int(np.argmax(wt[v]))] for v in range(len(P))])
    sp=nidx['DEF_spine']; hli={'L':nidx['DEF_hand_L'],'R':nidx['DEF_hand_R']}
    shy=1.72; tv=P[(dom==sp)&(np.abs(P[:,1]-shy)<0.13)]; sx=float(np.abs(tv[:,0]).max()) if len(tv) else 0.22
    def meancol(mask,dflt): return col[mask].mean(0) if mask.any() else np.array(dflt)
    tcol=meancol((dom==sp)&(np.abs(P[:,1]-shy)<0.16),[0.5,0.5,0.55])
    J={'pelvis':jp('DEF_pelvis'),'waist':jp('DEF_spine'),'neck':jp('DEF_head')}
    J['headTop']=J['neck']+np.array([0,float(P[:,1].max())-J['neck'][1],0])
    aP=[]; aC=[]; aB=[]; aI=[]
    for n,sg in (('L',1),('R',-1)):
        Wr=jp('DEF_hand_'+n); S=np.array([sg*sx*0.95, shy, Wr[2]]); E=(S+Wr)/2
        J['shoulder'+n]=S; J['elbow'+n]=E; J['wrist'+n]=Wr
        J['hip'+n]=jp('DEF_thigh_'+n); J['knee'+n]=jp('DEF_calf_'+n); J['ankle'+n]=jp('DEF_foot_'+n)
        ad=Wr-E; J['tip'+n]=Wr+ad/(np.linalg.norm(ad) or 1)*0.1*float(P[:,1].max()); J['toe'+n]=J['ankle'+n]+np.array([0,0,0.12])
        hc=meancol(dom==hli[n],[0.8,0.6,0.5])
        seg(aP,aC,aB,aI, S,E, r,r*0.92, BONES.index('upperArm'+n), tcol)
        seg(aP,aC,aB,aI, E,Wr, r*0.92,r*0.8, BONES.index('forearm'+n), hc)
    bone,wout=remap_weights(names,ji,wt,PAWN_W)
    if aP:
        base=len(P); P=np.vstack([P,np.array(aP)]); col=np.vstack([col,np.array(aC)])
        bone=np.vstack([bone,np.array(aB,int)]); wout=np.concatenate([wout,np.ones(len(aP))]); idx=np.vstack([idx,np.array(aI,int)+base])
    return P,idx,bone,wout,col,J
def stonify(P, col, seed):   # gray mottled stone with a few dark cracks (the rock golems, cel)
    l=(col[:,0]*0.3+col[:,1]*0.59+col[:,2]*0.11)
    base=np.array([0.52,0.51,0.49])
    nz=np.abs(np.sin(P[:,0]*17.1+P[:,1]*13.3+P[:,2]*23.7+seed*2.3))
    crack=(np.sin(P[:,1]*55+P[:,0]*22+seed)>0.95).astype(float)*0.4
    return np.clip(base[None,:]*(0.5+0.6*l)[:,None]*(0.8+0.32*nz)[:,None]*(1-crack)[:,None],0.04,1.0)
def bake_pawns(outpath):
    d=json.load(open('data/pawns.json'))
    kinds=['hero_m','hero_f','villager_m','villager_f','ogre','ogre_mage','ogre_guard_light','ogre_guard_heavy','skeleton_mage','skeleton_reaper','skeleton_guard_light','skeleton_guard_heavy']
    people=['hero_m','hero_f','villager_m','villager_f']
    out={'bones':BONES,'bodies':{}}
    for key in kinds:
        r=0.12 if key.startswith('ogre') else (0.05 if key.startswith('skeleton') else 0.085)
        P,idx,bone,wout,col,J=build_pawn(d[key], r)
        out['bodies'][key]=encode_body(P,idx,bone,wout,col,J); print(key,'verts',len(P))
    for key in people:   # rock golems: the people bodies turned to stone
        P,idx,bone,wout,col,J=build_pawn(d[key], 0.1)
        out['bodies'][key+'_golem']=encode_body(P,idx,bone,wout,stonify(P,col,7),J); print(key+'_golem','verts',len(P))
    json.dump(out,open(outpath,'w'),separators=(',',':')); import os; print(outpath,round(os.path.getsize(outpath)/1e6,2),'MB')

if __name__=='__main__':
    import sys; which=sys.argv[1] if len(sys.argv)>1 else 'all'
    if which in ('all','rpg'):
        d=json.load(open('data/rpgchars.json')); out={'bones':BONES,'bodies':{}}
        for key in ['warrior','cleric','monk','ranger','rogue','wizard']:
            body,J=rebake(d[key],RPG_ROLE,RPG_W); out['bodies'][key]=body; print(key,'height',body['height'],'tris',len(body['tri'])//3)
        json.dump(out,open('data/rpgbodies.json','w'),separators=(',',':'))
        import os; print('data/rpgbodies.json',round(os.path.getsize('data/rpgbodies.json')/1e6,2),'MB')
    if which in ('all','skel'):
        bake_shared('data/skel.json',['Warrior','Mage','Minion','Rogue'],SKEL_ROLE,SKEL_W,'data/skelbodies.json')
    if which in ('all','pawn'):
        bake_pawns('data/pawnbodies.json')
