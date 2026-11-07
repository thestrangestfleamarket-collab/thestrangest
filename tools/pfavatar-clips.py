# THE POLYFORK AVATAR'S CLIPS (owner, 7 Nov 2026: "yes lets use mixamo"; his pick: Polyfork's 44, all of them): every clip tools/pfavatar-anim.mjs baked beyond Idle, Walk and Run
# (those stay in the body file, tools/pfavatar-pack.py), in one file a group a figure (data/pfanim-<figure>-<group>.json), fetched when a clip in it first plays.
# Run: node tools/pfavatar-anim.mjs && python3 tools/pfavatar-clips.py
import json, os
GROUPS={
 'move':['Jog','Crouch','Walk carrying','Walk formal','Hard landing'],
 'act':['Sit down','Sitting','Sitting talking','Stand up','Swimming','Treading water','Punch','Kick','Driving','Pick up','Opening','Interact'],
 'emote':['Agree','Head shake','Laughing','Talking','Phone call','Arms folded','Dance','Hip hop','Twist','Swing','Thriller','Drunk idle','Leaning on rail','Calling from rail'],
 'work':['Eating','Drinking','Chopping wood','Planting','Watering','Harvesting','Fixing','Pushing','Holding torch','Holding lantern']}
AN=json.load(open('.polyfork/anim-raw.json')); nb=len(AN['bones'])
have=set(AN['clips']['m'])-{'Idle','Walk','Run'}; listed={k for v in GROUPS.values() for k in v}
assert have==listed, ('not grouped', have-listed, 'missing', listed-have)
for f in ('m','f'):
    for g,names in GROUPS.items():
        out={}
        for k in names:
            c=AN['clips'][f][k]; n=c['n']; dur=c['dur']
            if max(abs(c['q'][(n-1)*nb*4+i]-c['q'][i]) for i in range(nb*4))<.005: n-=1; dur=dur*n/(n+1)   # (a loop's last frame repeating its first: dropped)
            step=2 if dur>1.5 else 1; fr=range(0,n,step)   # (15 frames a second for the long ones; slerped between)
            q=[round(v,3) for i in fr for v in c['q'][i*nb*4:(i+1)*nb*4]]; p=[round(v,3) for i in fr for v in c['p'][i*nb*3:(i+1)*nb*3]]
            out[k]={'n':len(fr),'dur':round(dur,4),'speed':c['speed'],'contact':c['contact'],'q':q,'p':p}
        o='data/pfanim-%s-%s.json'%(f,g); json.dump({'bones':AN['bones'],'clips':out},open(o,'w'),separators=(',',':')); print(o,round(os.path.getsize(o)/1e3),'KB')
