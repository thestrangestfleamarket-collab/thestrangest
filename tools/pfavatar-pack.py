#!/usr/bin/env python3
# THE POLYFORK AVATAR, step 2: .polyfork/avatar-raw.json (tools/pfavatar-bake.mjs) onto the Walker's 15-bone rig (tools/rig-rebake.py, every piece on the
# base body's skeleton), welded, a zone per vertex (its colour comes from the wearer's choices), into data/pfavatar-m.json and data/pfavatar-f.json (lazy).
# data/pfavatar.json is the small index in the page (skeletons, slots, piece names); a piece's n is its place in the bake's WARDROBE: add new ones at the end.
# Run: python3 tools/pfavatar-pack.py
import json, os, importlib.util, numpy as np
sp=importlib.util.spec_from_file_location('rr','tools/rig-rebake.py'); rr=importlib.util.module_from_spec(sp); sp.loader.exec_module(rr)
RAW=json.load(open('.polyfork/avatar-raw.json'))
# the collarbone (the rig has none) half the chest's, half the upper arm's, so a raised arm takes its shoulder with it (owner, 5 Nov 2026: "my shoulder vanishes when i raise my arm too high")
PFW=dict(rr.MIXAMO_W); PFW.update({s+'Shoulder':[('torso',.55),('upperArm'+n,.45)] for n,s in (('L','Left'),('R','Right'))})

def weld(v,extra=None):
    P=np.array(v['P'],float).reshape(-1,3); J=np.array(v['J'],int).reshape(-1,4); W=np.array(v['W'],float).reshape(-1,4); Z=np.array(v['Z'],int); F=np.array(v['F'],int).reshape(-1,3)
    key=np.hstack([np.round(P,5),J,np.round(W,3),Z[:,None]]); u,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1); F=inv[F]
    ok=(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])
    return P[first],J[first],W[first],Z[first],F[ok],(np.array(extra)[ok] if extra is not None else None)

def pack(v,rig,Jb,zmap,extra=None):
    P,J,W,Z,F,X=weld(v,extra); P=reshape(P,J,W,rig['names'],*rig['prop'])
    out,_=rr.rebake({'rig':rig,'arrays':(P,np.zeros((len(P),3)),F,J,W)},rr.MIXAMO_ROLE,PFW,J=Jb)
    Zg=np.array([zmap[v['zones'][z]] for z in Z],np.uint8)
    o={k:out[k] for k in ('lo','sc','pos','tri','bone','w')}; o['zone']=rr.enc(Zg)
    if X is not None: o['reg']=rr.enc(X.astype(np.uint8))
    assert len(P)<65536
    return o

# the proportions (owner, 5 Nov 2026: "legs should be 15% shorter, head should be 10% bigger, make sure all hair + hats head dressings grow too"): in the bind (arms down, legs
# straight), a thigh's points close toward its hip, a shin's toward its knee, a foot moves up whole (shoes keep their shape); whatever rides the head (face, hair, hats, glasses,
# beards) grows about the head; then all of it drops so the feet stand on the ground. tools/pfavatar-anim.mjs bakes the clips on the same shortened legs (LEG, its hips).
LEG=0.85; HEAD=1.10
def proportions(names,world):
    W=np.array(world,float); ix={n:i for i,n in enumerate(names)}; out=W.copy(); legs={}
    for s in ('Left','Right'):
        H,K,A=W[ix[s+'UpLeg']],W[ix[s+'Leg']],W[ix[s+'Foot']]; Ky=H[1]-(H[1]-K[1])*LEG; Ay=Ky-(K[1]-A[1])*LEG
        legs[s]=(H[1],K[1],Ky,A[1],Ay); out[ix[s+'Leg']][1]=Ky; out[ix[s+'Foot']][1]=Ay
        if s+'ToeBase' in ix: out[ix[s+'ToeBase']][1]+=Ay-A[1]
    drop=legs['Left'][4]-legs['Left'][3]; out[:,1]-=drop
    return out,legs,drop,W[ix['Head']]
def reshape(P,J,Wt,names,legs,drop,head):
    P=P.copy(); dy=np.zeros(len(P)); dh=np.zeros(len(P))
    for b,nm in enumerate(names):
        w=(Wt*(J==b)).sum(1)
        if not w.any(): continue
        for s in ('Left','Right'):
            Hy,Ky,Ky2,Ay,Ay2=legs[s]
            if nm==s+'UpLeg': dy+=w*(Hy-P[:,1])*(1-LEG)
            elif nm==s+'Leg': dy+=w*(Ky2-Ky+(Ky-P[:,1])*(1-LEG))
            elif nm in (s+'Foot',s+'ToeBase'): dy+=w*(Ay2-Ay)
        if nm=='Head' or nm.startswith('Face_'): dh+=w
    P=P+(P-head)*((HEAD-1)*dh)[:,None]; P[:,1]+=dy-drop
    return P

def joints(rig,P):
    W=np.array(rig['world']); nidx={n:i for i,n in enumerate(rig['names'])}; R=rr.MIXAMO_ROLE; jp=lambda nm:W[nidx[R[nm]]]; top=P[:,1].max(); J={}
    J['pelvis']=jp('pelvis'); J['waist']=jp('waist'); J['neck']=jp('neck'); J['headTop']=jp('neck')+np.array([0,top-jp('neck')[1],0])
    for n in 'LR':
        for k in ('shoulder','elbow','wrist','hip','knee','ankle'): J[k+n]=jp(k+n)
        a=J['wrist'+n]-J['elbow'+n]; J['tip'+n]=J['wrist'+n]+a/(np.linalg.norm(a) or 1)*0.1*top; J['toe'+n]=J['ankle'+n]+np.array([0,0,0.12*top])
    return J

IDX={'skel':{},'builds':RAW['builds'],'pieces':[{'n':n,'slot':p['slot'],'label':p['label'],'figs':''.join(f for f in 'mf' if any(p['v'][f]))} for n,p in enumerate(RAW['pieces'])]}
for f in ('m','f'):
    FG=RAW['figs'][f]; W0=np.array(FG['bones']['world']); W1,legs,drop,head=proportions(FG['bones']['names'],W0)
    rig={'names':FG['bones']['names'],'world':W1,'prop':(legs,drop,head)}
    b0=FG['bodies'][1]
    P,J,W,Z,F,_=weld(b0); H0=float(P[:,1].max()); P=reshape(P,J,W,rig['names'],legs,drop,head); Jb=joints(rig,P); sk,_=rr.rebake({'rig':rig,'arrays':(P,np.zeros((len(P),3)),F,J,W)},rr.MIXAMO_ROLE,PFW,J=Jb)
    bz=b0['zones']; bmap={z:i for i,z in enumerate(bz)}
    sk['height']=round(H0,4)   # (sized as before the proportions: the torso keeps its size, you are shorter)
    D={'bones':rr.BONES,'builds':RAW['builds'],'regions':RAW['regions'],'skel':{k:sk[k] for k in ('height','hipY','origin','rest')},
       'body':{'zones':bz,'pal':b0['pal'],'v':[pack(b,rig,Jb,bmap,b['region']) for b in FG['bodies']]},'pieces':[]}
    IDX['skel'][f]=D['skel']
    for n,p in enumerate(RAW['pieces']):
        V=p['v'][f]
        if not any(V): continue
        names=[]; cnt={}
        for v in V+(p.get('alt',{}).get(f) or []):
            if not v: continue
            for i,z in enumerate(v['zones']):
                if z not in names: names.append(z)
            for z,c in zip(*np.unique(v['Z'],return_counts=True)): cnt[v['zones'][z]]=cnt.get(v['zones'][z],0)+int(c)
        pal={}
        for v in V:
            if v:
                for z,h in zip(v['zones'],v['pal']): pal.setdefault(z,h)
        zmap={z:i for i,z in enumerate(names)}
        e={'n':n,'slot':p['slot'],'label':p['label'],'covers':p.get('covers',[]),'zones':names,'pal':[pal.get(z,'#888888') for z in names],
           'main':sorted(range(len(names)),key=lambda i:-cnt.get(names[i],0))[:2],'v':[pack(v,rig,Jb,zmap) if v else None for v in V]}
        A=(p.get('alt') or {}).get(f)
        if A: e['alt']=[pack(v,rig,Jb,zmap) if v else None for v in A]
        D['pieces'].append(e)
    # the walk (tools/pfavatar-anim.mjs): Polyfork's Idle, Walk and Run as each bone's move from the bind, a quaternion and a place (metres) a bone a frame
    if os.path.exists('.polyfork/anim-raw.json'):
        AN=json.load(open('.polyfork/anim-raw.json')); D['anim']={'bones':AN['bones'],'clips':{}}
        for k in ('Idle','Walk','Run'):
            c=AN['clips'][f][k]; nb=len(AN['bones']); n=c['n']; dur=c['dur']
            if max(abs(c['q'][(n-1)*nb*4+i]-c['q'][i]) for i in range(nb*4))<.005: n-=1; dur=dur*n/(n+1)   # (a loop's last frame repeating its first: dropped, or the loop stalls there)
            step=2 if k=='Idle' else 1; fr=range(0,n,step)
            q=[round(v,4) for i in fr for v in c['q'][i*nb*4:(i+1)*nb*4]]; pp=[round(v,4) for i in fr for v in c['p'][i*nb*3:(i+1)*nb*3]]
            D['anim']['clips'][k]={'n':len(fr),'dur':round(dur,4),'speed':c['speed'],'contact':c['contact'],'q':q,'p':pp}
    out='data/pfavatar-'+f+'.json'; json.dump(D,open(out,'w'),separators=(',',':'))
    print(out,len(D['pieces']),'pieces',round(os.path.getsize(out)/1e6,2),'MB')
json.dump(IDX,open('data/pfavatar.json','w'),separators=(',',':')); print('data/pfavatar.json',round(os.path.getsize('data/pfavatar.json')/1e3,1),'KB')
