# THE REST OF THE PETS (owner, 8 Nov 2026: "make sure every single type of animals, creatuers, etc. anything alive can be a pet"): the creatures Polyfork has no
# base for, made pets the way the bases and breeds are. The snake, the bat and the slime come from the game's own creatures (data/creatures.json) as new bases
# (data/pets/<key>.json: their rig, skin with a colour zone a corner, clips as moves from rest); the park's songbirds, the heron and the hawk, the squirrel and the
# cave and dungeon kinds are breeds of a base (data/pets/b/<key>.json: their colours, size, and for the squirrel its bushy tail held up). Adds them to data/pets.json
# and writes the page's list of pet files (src/146zj-pets.js). Run: python3 tools/pets-more.py
import json, base64, os, re, numpy as np
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode(); B=lambda s,t:np.frombuffer(base64.b64decode(s),t)
hx=lambda c:'#%02x%02x%02x'%tuple(int(v) for v in c)
def q2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def world(R):
    G=[]
    for i,p in enumerate(R['parent']):
        L=np.eye(4); L[:3,:3]=q2m(R['q'][i])*np.array((R.get('s') or [[1,1,1]]*len(R['t']))[i]); L[:3,3]=R['t'][i]; G.append(G[p]@L if p>=0 else L)
    return np.stack(G)
def pts(M): return (B(M['p'],np.int16).reshape(-1,3).astype(float)+32500)*M['sc']+np.array(M['lo'])

# ---------- new bases from the game's creatures ----------
# key, creature, NAME, its zones (name for each of the model's colours, most corners first)
NEW=[('snake','Snake','GARTER SNAKE',['coat','stripe','belly','mouth','tongue','eye','scale']),
     ('bat','Bat','BAT',['coat','dark','eye','ear','fang']),
     ('slime','Slime','PARK SLIME',['eye','body'])]
# how each first looks (the park's and the dungeon's paint), over the model's own colours
LOOK={'snake':dict(coat='#d8c860',stripe='#3e5a2e',belly='#d6c896'),'bat':dict(coat='#4e3a40',ear='#8a6a60'),'slime':dict(body='#5aa848')}
CR=json.load(open('data/creatures.json'))
def base(key,src,name,zn):
    C=CR[src]; M=dict(C['mesh']); R=C['rig']; c=B(M['c'],np.uint8).reshape(-1,3)
    u,inv,n=np.unique(c,axis=0,return_inverse=True,return_counts=True); order=np.argsort(-n); rank=np.empty_like(order); rank[order]=np.arange(len(order))
    M['z']=b64(rank[inv.reshape(-1)].astype(np.uint8)); zones=[[zn[i] if i<len(zn) else 'tone%d'%i,hx(u[order[i]])] for i in range(len(u))]
    clips={}
    for cn,cl in C['clips'].items():
        p={bn:b64((B(v,np.float32).reshape(-1,3)-np.array(R['t'][R['names'].index(bn)])).astype(np.float32)) for bn,v in cl['p'].items()}
        clips[cn.split('_',1)[1] if '_' in cn else cn]={**cl,'p':p}
    P=pts(M); lo=P.min(0); hi=P.max(0)
    D={'key':key,'name':name,'rig':{k:R[k] for k in ('names','parent','t','q','s','ibm') if k in R},'mesh':M,'clips':clips,'zones':zones,'knobs':[],'presets':{},
       'size':np.round(hi-lo,4).tolist(),'tall':float(round(hi[1]-lo[1],4)),'license':'from the game\'s creatures (data/creatures.json)'}
    json.dump(D,open('data/pets/'+key+'.json','w'),separators=(',',':'))
    return D

# ---------- breeds: a base's colours and size (and the squirrel's tail) ----------
def pg(**c): return c
BR=[ # key, NAME, base, group, type, metres, colours by zone, shape
 ('robin','AMERICAN ROBIN','pigeon','birds','SONGBIRD',.25,pg(plumage='#6b6058',head='#2e2a28',green='#2e2a28',sheen='#2e2a28',wine='#c85a26',breast='#d0642c',belly='#d8743a',wing='#6b6058',bar='#5a5048',flight='#4a4440',rump='#6b6058',bill='#e0b030',cere='#e0b030'),None),
 ('bluejay','BLUE JAY','pigeon','birds','SONGBIRD',.3,pg(plumage='#4f7fc4',head='#5a86c8',green='#1e2230',sheen='#f0f0f2',wine='#e8e8ec',breast='#e6e6ea',belly='#f4f4f4',wing='#3f6fc0',bar='#1e2a40',flight='#2f5bb0',rump='#6a90cc',bill='#1e1e22',cere='#1e1e22'),None),
 ('cardinal','NORTHERN CARDINAL','pigeon','birds','SONGBIRD',.22,pg(plumage='#c8202a',head='#d02430',green='#c8202a',sheen='#c8202a',wine='#c8202a',breast='#d02430',belly='#c02028',wing='#a81c24',bar='#a81c24',flight='#8c1820',rump='#c8202a',bill='#f07030',cere='#1a1414'),None),
 ('oriole','BALTIMORE ORIOLE','pigeon','birds','SONGBIRD',.2,pg(plumage='#f08a1c',head='#1a1614',green='#1a1614',sheen='#1a1614',wine='#1a1614',breast='#f08a1c',belly='#f5a030',wing='#1a1614',bar='#f0f0f0',flight='#1a1614',rump='#f08a1c',bill='#5a5a60',cere='#5a5a60'),None),
 ('starling','EUROPEAN STARLING','pigeon','birds','SONGBIRD',.22,pg(plumage='#2a2a30',head='#2c2a34',green='#2f5a40',sheen='#4a3a6a',wine='#4a2a4a',breast='#2c2a32',belly='#32303a',wing='#2a2a30',bar='#5a5048',flight='#202024',rump='#2a2a30',bill='#e8c040',cere='#e8c040'),None),
 ('sparrow','HOUSE SPARROW','pigeon','birds','SONGBIRD',.16,pg(plumage='#8a6a48',head='#7a6a5a',green='#b8a890',sheen='#2a2420',wine='#b8a890',breast='#b8b0a0',belly='#d0c8b8',wing='#7a5a3a',bar='#f0e8d8',flight='#5a4030',rump='#8a7a62',bill='#3a3430',cere='#3a3430'),None),
 ('mockingbird','NORTHERN MOCKINGBIRD','pigeon','birds','SONGBIRD',.25,pg(plumage='#8a8a88',head='#8a8a88',green='#9a9a98',sheen='#9a9a98',wine='#c8c8c4',breast='#d8d8d4',belly='#e8e8e4',wing='#5a5a58',bar='#f0f0f0',flight='#3a3a3a',rump='#8a8a88',bill='#2a2a2a',cere='#2a2a2a'),None),
 ('redwing','RED-WINGED BLACKBIRD','crow','birds','SONGBIRD',.22,pg(plumage='#141414',belly='#141414',sheen='#202024',covert='#d82020',flight='#141414',beak='#202020'),None),
 ('redtail','RED-TAILED HAWK','crow','birds','HAWK',.55,pg(plumage='#7a5232',belly='#ecdcc0',sheen='#8a6040',covert='#6a4428',flight='#5a3a22',beak='#303030',legs='#e8c040',eye='#3a2010'),None),
 ('heron','GREAT BLUE HERON','gull','birds','HERON',.9,pg(plumage='#9aa8b8',mantle='#6e7f94',dark='#2a2e34',bill='#d8b040',red='#9aa8b8',feet='#3a3a30'),None),
 ('squirrel','EASTERN GREY SQUIRREL','rat','wild','SQUIRREL',.45,pg(coat='#8a8580',skin='#8a8580',outer='#6e6862',inner='#c8b8b0',nose='#4a3a38',whisker='#d8d0c8'),'bushy'),
 ('giantrat','GIANT RAT','rat','creatures','RAT',.6,pg(coat='#3a3230',skin='#6a5452',outer='#4a3c3a',inner='#7a605a'),None),
 ('cavefrog','CAVE FROG','frog','creatures','FROG',.15,pg(coat='#b8c0a8',belly='#f0eee4',toe='#c8c8b0',pad='#d8d4c0',iris='#d04030',tympanum='#8a9078'),None),
 ('radspider','RADIOACTIVE SPIDER','spider','creatures','SPIDER',.35,pg(abdomen='#40d040',folium='#2a8a2a',marks='#d0ff60',carapace='#50b040',legs='#308a30',mottle='#206020',bands='#103010',tips='#0a200a',eyes='#ff3030'),None),
 ('giantwasp','GIANT WASP','wasp','creatures','WASP',.4,pg(black='#1c1a20',yellow='#e0a020',tarsi='#c08a20',brown='#8a4a1a'),None),
 ('pitsnake','PIT SNAKE','snake','creatures','SNAKE',.7,pg(coat='#3a2c20',stripe='#7a6448',belly='#c8b896',scale='#5a4a36'),None),
 ('cavebat','CAVE BAT','bat','creatures','BAT',.3,pg(coat='#8a8078',dark='#3a3430',ear='#b09a90'),None),
 ('greenslime','GREEN SLIME','slime','creatures','SLIME',.4,pg(body='#3ad040'),None),
 ('blueslime','BLUE SLIME','slime','creatures','SLIME',.4,pg(body='#4a8aff'),None),
 ('redslime','RED SLIME','slime','creatures','SLIME',.4,pg(body='#e8443a'),None),
 ('purpleslime','PURPLE SLIME','slime','creatures','SLIME',.4,pg(body='#a85ae8'),None),
 # the lizards from the crocodile (owner, 8 Nov 2026: "lizards"): a short snout, long legs, slim; and BIG LIZ, the giant city lizard from the T. rex, back plates up her spine
 ('gecko','LEOPARD GECKO','crocodile','reptiles','LIZARD',.22,pg(coat='#e8c860',flank='#f0d880',belly='#f4ecd8',scute='#3a3028',iris='#2a2420'),('lizard',.45)),
 ('iguana','GREEN IGUANA','crocodile','reptiles','LIZARD',.9,pg(coat='#5aa040',flank='#78b850',belly='#a8c880',scute='#3a6a2a',iris='#c8a030'),('lizard',.6)),
 ('monitor','MONITOR LIZARD','crocodile','reptiles','LIZARD',1.0,pg(coat='#4a4a38',flank='#6a6448',belly='#c8c0a0',scute='#2a2a20',iris='#c8b040'),('lizard',.7)),
 ('chameleon','CHAMELEON','crocodile','reptiles','LIZARD',.3,pg(coat='#58c060',flank='#e8a040',belly='#d8e8a0',scute='#2a8a8a',iris='#e8d040'),('lizard',.4)),
 ('beardie','BEARDED DRAGON','crocodile','reptiles','LIZARD',.45,pg(coat='#c8945a',flank='#d8a870',belly='#ecd8b0',scute='#8a5a30',iris='#3a2a18'),('lizard',.5)),
 ('bigliz','BIG LIZ','trex','reptiles','GIANT CITY LIZARD',1.2,pg(coat='#4a5448',back='#3a4238',stripe='#2a302a',belly='#6a7462',crown='#323a30',pale='#7a8470',claw='#1e1e1e',dark='#141414'),('ridge',.12))]

def lead_of(D):
    M=D['mesh']; n=M['n']; j=B(M['j'],np.uint8).reshape(-1,4); w=B(M['w'],np.uint8).reshape(-1,4); return j[np.arange(n),np.argmax(w,1)]
def lizard(D,snout):
    """a lizard's head from a crocodile's: the face ahead of the eyes pulled back to `snout` of its length (the head bone keeps its place)"""
    P=pts(D['mesh']); G=world(D['rig']); nm=D['rig']['names']; L=lead_of(D); hd=[nm.index(x) for x in ('Head','Jaw') if x in nm]; h=G[nm.index('Head')][:3,3]
    m=np.isin(L,hd); f=P[m,2]>h[2]; Q=P.copy(); q=Q[m]; q[f,2]=h[2]+(q[f,2]-h[2])*snout; Q[m]=q; return Q-P
def ridge(D,amp):
    """BIG LIZ's back plates: the top of her spine and tail raised in a row of points"""
    P=pts(D['mesh']); G=world(D['rig']); nm=D['rig']['names']; L=lead_of(D); sp=[i for i,x in enumerate(nm) if x in ('Hips','Spine','Chest','Neck') or x.startswith('Tail')]
    by=np.array([G[i][1,3] for i in range(len(nm))]); H=P[:,1].max()-P[:,1].min(); m=np.isin(L,sp)&(np.abs(P[:,0])<H*.05)&(P[:,1]>by[L]+H*.02)
    Q=P.copy(); z=P[m,2]; Q[m,1]+=H*amp*np.maximum(0,np.sin(z/H*38))**.6; return Q-P
def bushy(D):
    """a squirrel's tail from a rat's: the tail's corners pushed out round it (thick at the middle) and the whole tail swung up over the back"""
    M=D['mesh']; R=D['rig']; P=pts(M); n=len(P); G=world(R); nm=R['names']; tb=[i for i,x in enumerate(nm) if x.startswith('Tail')]
    j=B(M['j'],np.uint8).reshape(-1,4); w=B(M['w'],np.uint8).reshape(-1,4); lead=j[np.arange(n),np.argmax(w,1)]; m=np.isin(lead,tb)
    line=np.array([G[i][:3,3] for i in tb]); seg=np.cumsum(np.r_[0,np.linalg.norm(np.diff(line,axis=0),axis=1)]); L=seg[-1]
    Q=P.copy()
    for k in np.where(m)[0]:
        p=P[k]; best=(1e9,0,None)
        for a in range(len(line)-1):
            d=line[a+1]-line[a]; t=np.clip(np.dot(p-line[a],d)/max(1e-9,np.dot(d,d)),0,1); c=line[a]+d*t; e=np.linalg.norm(p-c)
            if e<best[0]: best=(e,(seg[a]+t*(seg[a+1]-seg[a]))/L,c)
        _,s,c=best; Q[k]=c+(p-c)*(4+9*np.sin(np.pi*min(1,.15+s*.95)))
    root=line[0]; ix=np.where(m)[0]
    def swing(sg):
        out=Q.copy()
        for k in ix:
            v=Q[k]-root; s=np.clip(np.linalg.norm(v)/L,0,1); a=np.radians(70+50*s)*sg; c,sn=np.cos(a),np.sin(a); out[k]=root+np.array([v[0],v[1]*c-v[2]*sn,v[1]*sn+v[2]*c])
        return out
    A,Bq=swing(1),swing(-1); Q=A if A[ix,1].mean()>Bq[ix,1].mean() else Bq   # (up over the back, whichever way that turns)
    return Q-P

KINDS=json.load(open('data/pets.json')); have={k['key']:k for k in KINDS['kinds']}; bases={}
for key,src,name,zn in NEW:
    D=base(key,src,name,zn); bases[key]=D; big=max(D['size'])
    have[key]={'key':key,'name':name,'group':'creatures','clips':list(D['clips']),'size':D['size'],'long':{'snake':.6,'bat':.3,'slime':.4}[key],'zones':[[z,LOOK[key].get(z,c)] for z,c in D['zones']],'presets':{},'knobs':[]}
    print(key,D['mesh']['n'],'pts',list(D['clips']),D['zones'])
os.makedirs('data/pets/b',exist_ok=True)
for key,name,of,grp,typ,m,cols,shape in BR:
    D=bases.get(of) or bases.setdefault(of,json.load(open('data/pets/'+of+'.json'))); K0=have[of]
    rec={'key':key,'of':of,'t':{}}
    dp=bushy(D) if shape=='bushy' else lizard(D,shape[1]) if shape and shape[0]=='lizard' else ridge(D,shape[1]) if shape and shape[0]=='ridge' else None
    if dp is not None:
        s=float(np.abs(dp).max()/127) or 1.0; rec['p']=b64(np.round(dp/s).astype(np.int8)); rec['s']=round(s,8); Pn=pts(D['mesh'])+dp
    else: Pn=pts(D['mesh'])
    lo=Pn.min(0); hi=Pn.max(0); rec['size']=np.round(hi-lo,4).tolist(); rec['tall']=float(round(hi[1]-lo[1],4))
    json.dump(rec,open('data/pets/b/'+key+'.json','w'),separators=(',',':'))
    zones=[[z,cols.get(z,c)] for z,c in D['zones']]; bad=set(cols)-{z for z,_ in D['zones']}; assert not bad,(key,bad)
    have[key]={'key':key,'name':name,'group':grp,'of':of,'type':typ,'clips':K0['clips'],'size':rec['size'],'long':m,'zones':zones,'presets':{},'knobs':K0['knobs'],**({'s0':K0['s0']} if 's0' in K0 else {}),**({'s0':[50,30,100,40,0]} if shape and shape[0]=='lizard' else {})}
    print(key,'of',of,m,'m')
new=[k for k,*_ in NEW]; nb=[b[0] for b in BR]
order=[k['key'] for k in KINDS['kinds'] if not k.get('of') and k['key'] not in new]+new+[k['key'] for k in KINDS['kinds'] if k.get('of') and k['key'] not in nb]+nb
KINDS['kinds']=[have[k] for k in order]
# where each is sold (owner, 8 Nov 2026: "(dogs & cats) (lizards, dragons, godzilla, dinosaurs) (birds) (butterflies), lets put a small farm in central park with barn you can buy the farm animals there inside"; his picks: the wild and zoo animals at the barn, the crabs at the aquarium, rabbits and rats with the dogs and cats, the other bugs with the butterflies, slimes, bats and the giant rat with the lizards, chickens and ducks at the farm)
def shop(K):
    b=K.get('of') or K['key']; g=K['group']
    if g in ('dogs','cats','rabbits'): return 'pets'
    if b=='frog' or b=='cavefrog': return 'reptiles'
    if g=='pets': return 'pets'
    if b in ('chicken','duck'): return 'barn'
    if g in ('birds','parrots','poultry'): return 'birdshop'
    if b in ('crocodile','beelzebufo'): return 'reptiles'
    if g in ('farm','horses','livestock','zoo','wild'): return 'barn'
    if g=='bugs' or b in ('spider','wasp'): return 'butterflies'
    if g=='shore': return 'aquarium'
    return 'reptiles'
for K in KINDS['kinds']: K['shop']=shop(K)
# which breeds stand in the shops' cages beside every base animal (the rest are in the adoption books)
CAGE=set('''chihuahua pomeranian pug jackrussell beagle dachshund corgi frenchie bulldog husky shiba poodle dalmatian bordercollie labrador golden boxer greatdane domestic siamese persian mainecoon ragdoll bengal sphynx blackcat calico tuxedo ginger russianblue scottishfold hollandlop lionhead netherland angora
 robin bluejay cardinal oriole starling sparrow mockingbird redwing redtail heron mourningdove whitedove fantail scarletmacaw blueandgold hyacinth africangrey cockatoo cockatiel budgie lovebird sunconure eclectus
 gecko iguana monitor chameleon beardie bigliz cavefrog pitsnake cavebat greenslime blueslime redslime purpleslime giantrat radspider giantwasp
 clydesdale shetland minidonkey highland holstein potbelly merino pygmy silkie'''.split())
for K in KINDS['kinds']:
    K.pop('cage',None)
    if not K.get('of') or K['key'] in CAGE: K['cage']=1
import collections; print(collections.Counter(K['shop'] for K in KINDS['kinds']))
json.dump(KINDS,open('data/pets.json','w'),separators=(',',':')); print('data/pets.json',len(KINDS['kinds']),'kinds')
# the page's list of pet files, one lazy load a file
src='src/146zj-pets.js'; S=open(src).read()
pf=','.join('%s:__LAZY__("data/pets/%s.json")'%(k['key'],k['key']) for k in KINDS['kinds'] if not k.get('of'))
bf=','.join('%s:__LAZY__("data/pets/b/%s.json")'%(k['key'],k['key']) for k in KINDS['kinds'] if k.get('of'))
S=re.sub(r'const PETFILES=\{[^}]*\};','const PETFILES={'+pf+'};',S,count=1); S=re.sub(r'const BREEDF=\{[^}]*\};','const BREEDF={'+bf+'};',S,count=1); open(src,'w').write(S)
