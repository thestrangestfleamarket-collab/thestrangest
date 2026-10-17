# THE SKELETONS' FIGHTING MOVES (owner, 17 Oct 2026: "make the skels patrol the streets as guards and really protect us"): the pack's own
# combat, running, hit and fall clips, from KayKit's Skeletons 1.0 on GitHub (CC0; github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0,
# its Characters/gltf/Skeleton_Warrior.glb carries every clip, on the same bones as 1.1's Rig_Medium, rest pose for rest pose), added to
# data/skel.json beside the idles and walks tools/skeletons-bake.py put there, sampled the same way (24 a second, int16 turns).
# Run: python3 tools/skeletons-clips.py /path/to/Skeleton_Warrior.glb
import sys, json, struct, base64, numpy as np
WANT=['Idle_Combat','Running_A','Running_B','1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Diagonal','Block','1H_Ranged_Shoot','Spellcast_Shoot',
      'Unarmed_Melee_Attack_Punch_A','Unarmed_Melee_Attack_Kick','Hit_A','Death_A','Lie_StandUp','Taunt','Cheer']
d=open(sys.argv[1],'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; buf=d[28+ln:28+ln+bl]
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    return np.frombuffer(buf,ct,a['count']*n,off).reshape(a['count'],n)
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
D=json.load(open('data/skel.json')); rig=D['rig']; JI={n:k for k,n in enumerate(rig['names'])}
for a in j['animations']:
    if a['name'] not in WANT: continue
    dur=max(float(acc(s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*24))+1); T=np.linspace(0,dur,nf)
    Q=np.tile(np.array(rig['q'],float),(nf,1,1)); TR={}
    for c in a['channels']:
        s=a['samplers'][c['sampler']]; bn=j['nodes'][c['target']['node']]['name']
        if bn not in JI: continue   # (the 1.0 rig's IK and control bones: not in the skin)
        k=JI[bn]; t=acc(s['input']).reshape(-1).astype(float); v=acc(s['output']).astype(float)
        if c['target']['path']=='rotation':
            for q in range(1,len(v)):
                if np.dot(v[q],v[q-1])<0: v[q]=-v[q]
            q=np.stack([np.interp(T,t,v[:,i]) for i in range(4)],1); Q[:,k]=q/np.linalg.norm(q,axis=1,keepdims=True)
        elif c['target']['path']=='translation':
            p=np.stack([np.interp(T,t,v[:,i]) for i in range(3)],1)
            if np.ptp(p,axis=0).max()>1e-4: TR[bn]=b64(p.astype(np.float32))
    D['clips'][a['name']]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
s=json.dumps(D,separators=(',',':')); open('data/skel.json','w').write(s)
print('data/skel.json',len(s),'bytes',{n:(c['dur'],list(c['p'])) for n,c in D['clips'].items()})
