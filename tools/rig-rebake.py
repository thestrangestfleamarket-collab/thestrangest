#!/usr/bin/env python3
# Retarget-bake: take a clip-driven skinned character (its own skeleton + skin weights)
# and bake it onto the player's 15-bone BODIES rig (the same origin/rest convention as BODIES.skeleton),
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

def rebake(char, name2role, w_map, J=None):   # J: another body's joints, so a piece worn over it shares its skeleton (the Polyfork avatar's clothes)
    rig=char['rig']; names=rig['names']; nidx={n:i for i,n in enumerate(names)}
    P,col,idx,ji,wt=char['arrays'] if 'arrays' in char else decode_mesh(char['mesh'])
    W=rig['world'] if 'world' in rig else bone_world(rig)
    jp=lambda nm: W[nidx[nm]]
    if J is None:
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
    lo=P.min(0); sc=float((P.max(0)-lo).max())/65000.0 or 1e-6
    q=np.clip(np.round((P-lo)/sc)-32500,-32768,32767).astype(np.int16)
    out={'height':round(float(P[:,1].max()),4),'hipY':round(float(J['pelvis'][1]),4),
      'origin':[np.round(F[b][0],4).tolist() for b in BONES],
      'rest':[np.round(F[b][2].T.reshape(-1),5).tolist() for b in BONES],
      'lo':[round(float(x),5) for x in lo],'sc':sc,
      'pos':enc(q),'tri':enc(idx.reshape(-1).astype(np.uint16)),
      'bone':enc(bone.reshape(-1).astype(np.uint8)),'w':enc(np.clip(np.round(wout*255),0,255).astype(np.uint8)),
      'vcol':enc(np.clip(np.round(col*255),0,255).astype(np.uint8))}
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

# --- a character-maker .glb (Mixamo-named bones, every part its own skin on one skeleton, flat faces with per-vertex colours) ---
MIXAMO_ROLE={'pelvis':'Hips','waist':'Spine','neck':'Neck',
  'shoulderL':'LeftArm','elbowL':'LeftForeArm','wristL':'LeftHand','shoulderR':'RightArm','elbowR':'RightForeArm','wristR':'RightHand',
  'hipL':'LeftUpLeg','kneeL':'LeftLeg','ankleL':'LeftFoot','hipR':'RightUpLeg','kneeR':'RightLeg','ankleR':'RightFoot'}
MIXAMO_W={'Hips':'hips','Spine':'torso','Spine1':'torso','Spine2':'torso','Neck':'head','Head':'head'}
MIXAMO_W.update({'Face_'+k:'head' for k in ('Jaw','EyeL','EyeR','LidL','LidR','BrowL','BrowR','MouthL','MouthR')})   # Polyfork's face bones ride the head (unmapped, they fell back to the hips)
for n in 'LR':
    s={'L':'Left','R':'Right'}[n]
    MIXAMO_W.update({s+'Shoulder':'torso',s+'Arm':'upperArm'+n,s+'ForeArm':'forearm'+n,s+'Hand':'hand'+n,'attach-'+s.lower()+'hand':'hand'+n,
      s+'UpLeg':'thigh'+n,s+'Leg':'shin'+n,s+'Foot':'shoe'+n,s+'ToeBase':'shoe'+n})

def read_glb(path,under=None,J=None,BF=None):   # under: only the meshes below that node (one person in a composed scene)
    import struct
    if J is None: b=open(path,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); BF=b[28+n:]
    def acc(i):
        a=J['accessors'][i]; v=J['bufferViews'][a['bufferView']]; k={'VEC4':4,'VEC3':3,'VEC2':2,'SCALAR':1,'MAT4':16}[a['type']]
        dt={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}[a['componentType']]
        return np.frombuffer(BF,dt,a['count']*k,v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,k)
    keep=None
    if under is not None:
        keep=set(); st=[under]
        while st: k=st.pop(); keep.add(k); st+=J['nodes'][k].get('children',[])
    nodes=[i for i,nd in enumerate(J['nodes']) if 'mesh' in nd and (keep is None or i in keep)]
    sk=J['skins'][J['nodes'][nodes[0]]['skin']] if under is not None else J['skins'][0]; names=[J['nodes'][j]['name'] for j in sk['joints']]
    world=np.array([np.linalg.inv(M.reshape(4,4).T)[:3,3] for M in acc(sk['inverseBindMatrices'])])
    PP=[];CC=[];JJ=[];WW=[]
    for nd in (J['nodes'][i] for i in nodes):
        assert J['skins'][nd['skin']]['joints']==sk['joints']
        for p in J['meshes'][nd['mesh']]['primitives']:
            a=p['attributes']; P=acc(a['POSITION']).astype(float); ix=acc(p['indices']).reshape(-1) if 'indices' in p else np.arange(len(P))
            PP.append(P[ix]); CC.append(acc(a['COLOR_0'])[:,:3].astype(float)[ix]); JJ.append(acc(a['JOINTS_0']).astype(int)[ix]); WW.append(acc(a['WEIGHTS_0']).astype(float)[ix])
    P=np.vstack(PP); C=np.vstack(CC); Jt=np.vstack(JJ); Wt=np.vstack(WW)
    key=np.hstack([np.round(P,5),np.round(C,3),Jt,np.round(Wt,3)])   # weld the flat faces' corners that share everything
    u,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); F=inv.reshape(-1,3)
    F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
    return {'rig':{'names':names,'world':world},'arrays':(P[first],C[first],F,Jt[first],Wt[first])}

def bake_shared(src, keys, role, wmap, outpath):
    d=json.load(open(src)); rig=d['rig']; out={'bones':BONES,'bodies':{}}
    for key in keys:
        body,J=rebake({'rig':rig,'mesh':d['chars'][key]}, role, wmap)
        out['bodies'][key]=body; print(key,'height',body['height'],'tris',len(body['tri'])//3)
    json.dump(out,open(outpath,'w'),separators=(',',':'))
    import os; print(outpath,round(os.path.getsize(outpath)/1e6,2),'MB')

if __name__=='__main__':
    import sys; which=sys.argv[1] if len(sys.argv)>1 else 'all'
    if which in ('all','rpg'):
        d=json.load(open('data/full/rpgchars.json')); out={'bones':BONES,'bodies':{}}
        for key in ['warrior','cleric','monk','ranger','rogue','wizard']:
            body,J=rebake(d[key],RPG_ROLE,RPG_W); out['bodies'][key]=body; print(key,'height',body['height'],'tris',len(body['tri'])//3)
        json.dump(out,open('data/rpgbodies.json','w'),separators=(',',':'))
        import os; print('data/rpgbodies.json',round(os.path.getsize('data/rpgbodies.json')/1e6,2),'MB')
    if which in ('all','skel'):
        bake_shared('data/skel.json',['Warrior','Mage','Minion','Rogue'],SKEL_ROLE,SKEL_W,'data/skelbodies.json')
    if which in ('all','poacher'):
        body,J=rebake(read_glb('data/full/egg-poacher.glb'),MIXAMO_ROLE,MIXAMO_W); print('poacher','height',body['height'],'tris',len(base64.b64decode(body['tri']))//6)
        json.dump({'bones':BONES,'bodies':{'poacher':body}},open('data/poacher.json','w'),separators=(',',':'))
        import os; print('data/poacher.json',round(os.path.getsize('data/poacher.json')/1e3),'KB')
    if which in ('all','skaters'):   # the skate park's 22 people, each from its own spot in the kit's composed scene (its own colours), keyed by spot
        import struct; f='data/full/skatepark/scene.glb'; b=open(f,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); BF=b[28+n:]
        root=J['nodes'][J['scenes'][0]['nodes'][0]]; out={'bones':BONES,'bodies':{}}; k=0
        for c in root['children']:
            nd=J['nodes'][c]; st=[c]; skinned=False
            while st: q=st.pop(); skinned|='skin' in J['nodes'][q]; st+=J['nodes'][q].get('children',[])
            if not skinned or nd['name'].startswith(('pavement','vinyl','shade')): continue
            body,_=rebake(read_glb(f,c,J,BF),MIXAMO_ROLE,MIXAMO_W); key='s%d'%k; k+=1; body['part']=nd['name']; out['bodies'][key]=body
            print(key,nd['name'],'height',body['height'],'tris',len(base64.b64decode(body['tri']))//6)
        used={'s%d'%q['b'] for q in json.load(open('data/skatepark.json'))['people']}; out['bodies']={k:v for k,v in out['bodies'].items() if k in used}   # only the ones the park keeps (run skatepark-bake.py first)
        json.dump(out,open('data/skaters.json','w'),separators=(',',':'))
        import os; print('data/skaters.json',round(os.path.getsize('data/skaters.json')/1e6,2),'MB')
