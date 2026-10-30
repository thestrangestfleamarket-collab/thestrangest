#!/usr/bin/env python3
# Retarget-bake: take a clip-driven skinned character (its own skeleton + skin weights)
# and bake it onto the player's 15-bone BODIES rig (same origin/rest convention as bases-bake.py),
# remapping the existing skin weights by bone name. Output per-vertex colours (vcol).
import json, base64, sys, numpy as np

BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR']

def b64(s,dt): return np.frombuffer(base64.b64decode(s),dt)

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
    F=frames(J)
    # remap per-vertex weights (src bone idx -> 15-bone bucket)
    srcmap=np.full(len(names),-1,int)
    for i,nm in enumerate(names):
        r=w_map.get(nm)
        if r is not None: srcmap[i]=BONES.index(r)
    nV=len(P); bone=np.zeros((nV,2),int); wout=np.ones(nV)
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
    out={'height':round(float(P[:,1].max()),4),'hipY':round(float(J['pelvis'][1]),4),
      'origin':[np.round(F[b][0],4).tolist() for b in BONES],
      'rest':[np.round(F[b][2].T.reshape(-1),5).tolist() for b in BONES],
      'pos':np.round(P,4).reshape(-1).tolist(),'tri':idx.reshape(-1).tolist(),
      'bone':bone.reshape(-1).tolist(),'w':np.round(wout,3).tolist(),
      'vcol':np.round(col,3).reshape(-1).tolist()}
    return out,J

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

if __name__=='__main__':
    d=json.load(open('data/rpgchars.json'))
    out={'bones':BONES,'bodies':{}}
    for key in ['warrior','cleric','monk','ranger','rogue','wizard']:
        body,J=rebake(d[key],RPG_ROLE,RPG_W)
        out['bodies'][key]=body
        print(key,'height',body['height'],'tris',len(body['tri'])//3)
    json.dump(out,open('data/rpgbodies.json','w'),separators=(',',':'))
    import os; print('data/rpgbodies.json',round(os.path.getsize('data/rpgbodies.json')/1e6,2),'MB')
