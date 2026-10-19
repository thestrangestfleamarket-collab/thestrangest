# THE UAL CLIPS ON THE PAWNS (owner, 17 Oct 2026: "match this same rig skeleton ... give them all the same stuff"): the UAL1 animation library's
# 43 clips (data/ual.json: the mannequin's Unreal-style rig of 65 bones) retold on the twelve pawn characters' rig (data/pawns.json: RigPawn,
# 16 bones: pelvis, spine, head, two free hands, each leg a thigh, a calf (each with a twist bone) and a foot). Each pawn bone follows one
# mannequin bone: it turns in the world as that bone turns away from its rest (both rigs rest in the same T: hands out, legs straight), put
# back under its parent; a twist bone keeps its rest. The hands, free of any arm, go where the mannequin's hands go, the distance from the
# hips scaled to the pawn's own reach; the hips bob as the mannequin's do, scaled to his height. Written into data/pawns.json as hero_m's clips
# (the twelve share one rig and one clip set), named UAL_<clip>.  Run: python3 tools/retarget-ual.py
import json, base64, numpy as np
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode(); dec=lambda s,dt:np.frombuffer(base64.b64decode(s),dt)
U=json.load(open('data/ual.json'))['ual']; PW=json.load(open('data/pawns.json')); PR=PW['hero_m']['rig']; UR=U['rig']
def q2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def m2q(R):
    tr=np.trace(R)
    if tr>0: S=np.sqrt(tr+1)*2; return np.array([(R[2,1]-R[1,2])/S,(R[0,2]-R[2,0])/S,(R[1,0]-R[0,1])/S,.25*S])
    i=int(np.argmax(np.diag(R))); j,k=(i+1)%3,(i+2)%3; S=np.sqrt(1+R[i,i]-R[j,j]-R[k,k])*2; q=[0,0,0,0]; q[i]=.25*S; q[j]=(R[j,i]+R[i,j])/S; q[k]=(R[k,i]+R[i,k])/S; q[3]=(R[k,j]-R[j,k])/S; return np.array(q)
def local(R,i,q=None,t=None):   # a bone's local matrix from its rig's rest (or the turn and place given)
    M=np.eye(4); s=np.array(R['s'][i]) if 's' in R else np.ones(3); M[:3,:3]=q2m(R['q'][i] if q is None else q)*s; M[:3,3]=R['t'][i] if t is None else t; return M
def world(R,Q=None,T=None):   # every bone's world matrix, parents first (the rigs are in tree order)
    W=[]
    for i in range(len(R['names'])): L=local(R,i,None if Q is None else Q[i],None if T is None or R['names'][i] not in T else T[R['names'][i]]); W.append(W[R['parent'][i]]@L if R['parent'][i]>=0 else L)
    return W
rot=lambda M:M[:3,:3]/np.linalg.norm(M[:3,:3],axis=0)
UI={n:i for i,n in enumerate(UR['names'])}; PI={n:i for i,n in enumerate(PR['names'])}
# which way each stands: the foot's toe from its ankle, in the world (the ball bone under the foot, or the foot bone's own y)
UW0=world(UR); PW0=world(PR)
uf=UW0[UI['ball_l']][:3,3]-UW0[UI['foot_l']][:3,3]; pf=rot(PW0[PI['DEF_foot_L']])@np.array([0,1,0])
print('facing: mannequin toe',np.round(uf,3),'pawn foot y',np.round(pf,3))
FLIP=np.eye(3) if np.sign(uf[2])==np.sign(pf[2]) or abs(pf[2])<.2 else np.diag([-1,1,-1])   # (facing the other way: the mannequin's world turned half round)
if (FLIP!=np.eye(3)).any(): print(' the mannequin turned half round to face the pawn\'s way')
MAP={'DEF_pelvis':'pelvis','DEF_spine':'spine_03','DEF_head':'Head','DEF_hand_L':'hand_l','DEF_hand_R':'hand_r','DEF_thigh_L':'thigh_l','DEF_calf_L':'calf_l','DEF_foot_L':'foot_l','DEF_thigh_R':'thigh_r','DEF_calf_R':'calf_r','DEF_foot_R':'foot_r'}
# the reach and height ratios: the hands from the hips, the hips off the ground
up=lambda W,i:W[i][:3,3]
uh=np.linalg.norm(up(UW0,UI['hand_l'])-up(UW0,UI['pelvis'])); ph=np.linalg.norm(up(PW0,PI['DEF_hand_L'])-up(PW0,PI['DEF_pelvis'])); KH=ph/uh
KY=up(PW0,PI['DEF_pelvis'])[1]/up(UW0,UI['pelvis'])[1]; print('reach ratio',round(KH,3),'height ratio',round(KY,3))
out={}
for name,C in U['clips'].items():
    n=C['n']; Q=dec(C['q'],np.int16).reshape(n,len(UR['names']),4)/32000.; P={k:dec(v,np.float32).reshape(n,3) for k,v in C['p'].items()}
    PQ=np.zeros((n,len(PR['names']),4)); PT={}
    for f in range(n):
        UW=world(UR,Q[f],{k:v[f] for k,v in P.items()}); W=[None]*len(PR['names']); T={}
        for i,bn in enumerate(PR['names']):
            p=PR['parent'][i]; Lr=local(PR,i)
            if bn in MAP:
                s=UI[MAP[bn]]; dR=FLIP@rot(UW[s])@rot(UW0[s]).T@FLIP.T   # (how the mannequin's bone has turned in the world)
                Rw=dR@rot(PW0[i]); Lm=np.linalg.inv(W[p])@np.block([[Rw,np.zeros((3,1))],[0,0,0,1]]) if p>=0 else None
                L=Lr.copy(); L[:3,:3]=rot(Lm)*np.linalg.norm(Lr[:3,:3],axis=0)
                if bn in('DEF_hand_L','DEF_hand_R'):   # (the hand: where the mannequin's is, from the hips, at the pawn's reach)
                    s0=UI['pelvis']; off=FLIP@(up(UW,s)-up(UW,s0))*KH; wp=W[PI['DEF_pelvis']][:3,3]+off
                    L[:3,3]=(np.linalg.inv(W[p])@np.r_[wp,1])[:3]; T[bn]=L[:3,3]
                elif bn=='DEF_pelvis':   # (the hips: the mannequin's bob, at the pawn's height)
                    wp=PW0[i][:3,3]+FLIP@(up(UW,s)-up(UW0,s))*KY; L[:3,3]=(np.linalg.inv(W[p])@np.r_[wp,1])[:3]; T[bn]=L[:3,3]
            else: L=Lr
            W[i]=W[p]@L if p>=0 else L; sc=np.linalg.norm(L[:3,:3],axis=0); PQ[f,i]=m2q(L[:3,:3]/sc)
            if bn in T: PT.setdefault(bn,np.zeros((n,3)))[f]=T[bn]
    for i in range(len(PR['names'])):   # (the shortest way round between frames)
        for f in range(1,n):
            if np.dot(PQ[f,i],PQ[f-1,i])<0: PQ[f,i]=-PQ[f,i]
    out['UAL_'+name]={'dur':C['dur'],'n':n,'q':b64(np.round(PQ*32000).astype(np.int16)),'p':{k:b64(v.astype(np.float32)) for k,v in PT.items() if np.ptp(v,axis=0).max()>1e-6}}
    print(name,n,'frames; moving:',list(out['UAL_'+name]['p']))
PW['hero_m']['clips'].update(out); open('data/pawns.json','w').write(json.dumps(PW,separators=(',',':')))
import os; print('data/pawns.json',os.path.getsize('data/pawns.json'),'bytes;',len(out),'UAL clips on the pawns')
