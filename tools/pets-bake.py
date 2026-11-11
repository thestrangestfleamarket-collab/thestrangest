# THE PETS (owner, 7 Nov 2026: "use polyfork cats and dogs and birds, let people choose one as pet (choose color, style) use the base models"; "all animals as pets (large animals will be tiny versions pet size)"):
# every land and air Polyfork base animal (fetched into .polyfork/pets/, never committed) baked into data/pets/<key>.json: its rig, its skin (each corner's
# colour zone in `z`), its clips at 12 a second, its colour zones with their defaults, Polyfork's presets, and each shape knob as two ends (the corners'
# and the bones' moves from the default to the knob's least and most, int8 over a scale), so the page blends any shape between them.
# Also data/pets.json: the list (key, name, kind of mover, pet size). Run: python3 tools/pets-bake.py [key ...]
import sys, os, json, time, struct, base64, urllib.request, urllib.parse, numpy as np
UA={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}
C='.polyfork/pets'; os.makedirs(C,exist_ok=True); os.makedirs('data/pets',exist_ok=True)
# [key, Polyfork id, NAME, group] — the land and air bases; the water ones (fish, rays, eels, jellies, the clam) stay out: a pet walks with you
L=[('cat','cat-base','CAT','pets'),('dog','dog-base','DOG','pets'),('xolo','xoloitzcuintli-1cd7c8','XOLO','pets'),('rabbit','rabbit-base','RABBIT','pets'),('hare','mountain-hare-base','HARE','pets'),
 ('rat','rat-base','RAT','pets'),('frog','frog-base','FROG','pets'),('parrot','parrot-base','PARROT','birds'),('pigeon','pigeon-base','PIGEON','birds'),('crow','crow-base','CROW','birds'),
 ('owl','owl-base','OWL','birds'),('gull','herring-gull-base','GULL','birds'),('duck','duck-base','DUCK','birds'),('chicken','chicken-base','CHICKEN','birds'),('penguin','penguin-base','PENGUIN','birds'),
 ('fox','fox-base','FOX','wild'),('wolf','wolf-base','WOLF','wild'),('bear','bear-base','BEAR','wild'),('deer','deer-base','DEER','wild'),('ibex','alpine-ibex-base','IBEX','wild'),('lion','lion-base','LION','wild'),
 ('crocodile','crocodile-base','CROCODILE','wild'),('beelzebufo','beelzebufo-base','GIANT FROG','wild'),
 ('horse','horse-base','HORSE','farm'),('donkey','donkey-base','DONKEY','farm'),('mule','pack-mule-base','MULE','farm'),('cow','cow-base','COW','farm'),('ox','ox-base','OX','farm'),('pig','pig-base','PIG','farm'),
 ('sheep','sheep-base','SHEEP','farm'),('goat','goat-base','GOAT','farm'),
 ('elephant','elephant-base','ELEPHANT','zoo'),('giraffe','giraffe-base','GIRAFFE','zoo'),('zebra','zebra-base','ZEBRA','zoo'),('camel','camel-base','CAMEL','zoo'),
 ('trex','tyrannosaurus-base','T. REX','dino'),('raptor','velociraptor-base','VELOCIRAPTOR','dino'),('compy','compsognathus-base','COMPSOGNATHUS','dino'),('stego','stegosaurus-base','STEGOSAURUS','dino'),
 ('trike','triceratops-base','TRICERATOPS','dino'),('anky','ankylosaurus-base','ANKYLOSAURUS','dino'),('parasaur','parasaurolophus-base','PARASAUROLOPHUS','dino'),('brachio','brachiosaurus-base','BRACHIOSAURUS','dino'),
 ('ptera','pteranodon-base','PTERANODON','dino'),('arthro','arthropleura-base','ARTHROPLEURA','dino'),
 ('rdragonling','red-fire-dragonling-base','FIRE DRAGONLING','dragons'),('pdragonling','purple-flame-dragonling-base','FLAME DRAGONLING','dragons'),('cdragonling','crystal-dragonling-base','CRYSTAL DRAGONLING','dragons'),
 ('gdragonling','green-gas-dragonling-base','GAS DRAGONLING','dragons'),('rdragon','red-fire-dragon-base','FIRE DRAGON','dragons'),('cdragon','crystal-dragon-base','CRYSTAL DRAGON','dragons'),('hivebug','alien-hive-bug-base','HIVE BUG','dragons'),
 ('bee','honeybee-base','HONEYBEE','bugs'),('bumblebee','bumblebee-queen-base','BUMBLEBEE','bugs'),('wasp','common-wasp-base','WASP','bugs'),('butterfly','butterfly-base','BUTTERFLY','bugs'),('firefly','firefly-base','FIREFLY','bugs'),
 ('ladybird','seven-spot-ladybird-base','LADYBIRD','bugs'),('beetle','stag-beetle-base','STAG BEETLE','bugs'),('mantis','praying-mantis-base','PRAYING MANTIS','bugs'),('hopper','meadow-grasshopper-base','GRASSHOPPER','bugs'),
 ('ant','wood-ant-base','WOOD ANT','bugs'),('antqueen','ant-queen-base','ANT QUEEN','bugs'),('aphid','green-aphid-base','APHID','bugs'),('spider','garden-orb-weaver-base','ORB WEAVER','bugs'),('tarantula','tarantula-base','TARANTULA','bugs'),
 ('woodlouse','pill-woodlouse-base','WOODLOUSE','bugs'),('centipede','stone-centipede-base','CENTIPEDE','bugs'),('skater','pond-skater-base','POND SKATER','bugs'),('caterpillar','swallowtail-caterpillar-base','CATERPILLAR','bugs'),
 ('worm','earthworm-base','EARTHWORM','bugs'),('slug','leopard-slug-base','LEOPARD SLUG','bugs'),('snail','snail-base','SNAIL','bugs'),
 ('hermit','hermit-crab-base','HERMIT CRAB','shore'),('shorecrab','shore-crab-base','SHORE CRAB','shore'),('reefcrab','reef-crab-base','REEF CRAB','shore')]
# how big a pet is (its height or length, whichever is more, in metres, at its middle size; the page's size slider goes half to one and a half of it): a cat, dog or bird its own
# size, a big animal a dog-sized one, a bug (Polyfork builds them huge) a small one
CAP={'pets':1.2,'birds':1.2,'wild':1.0,'farm':1.0,'zoo':1.0,'dino':1.0,'dragons':1.0,'bugs':.35,'shore':.35}
OWN={'parrot':.6,'rat':.3,'frog':.15}   # (Polyfork made these bigger than life)
def long_of(grp,size,key=None):
    if key in OWN: return OWN[key]
    m=max(size[1],size[2]); return round(CAP[grp] if grp in ('bugs','shore') else min(m,CAP[grp]),3)
def get(i,p=None):
    f=os.path.join(C,i+('' if p is None else '-'+'-'.join(f'{k}{v}' for k,v in sorted(p.items())))+('.glb'))
    if not os.path.exists(f):
        u='https://polyfork.dev/cdn/'+i+'.glb' if p is None else 'https://polyfork.dev/cdn/'+i+'-remix.glb?p='+urllib.parse.quote(json.dumps(p,separators=(',',':')))
        for k in range(5):
            try: d=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read(); assert d[:4]==b'glTF',d[:200]; open(f+'.part','wb').write(d); os.replace(f+'.part',f); break
            except Exception as e:
                if k==4: raise
                time.sleep(2**k*2)
        time.sleep(.4)
    return f
def getj(u):
    f=os.path.join(C,urllib.parse.quote(u,safe='')[-90:]+'.json')
    if not os.path.exists(f): open(f,'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()); time.sleep(.3)
    return json.load(open(f))
CT={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}; NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def glb(f):
    d=open(f,'rb').read(); ln=struct.unpack_from('<I',d,12)[0]; j=json.loads(d[20:20+ln]); bl=struct.unpack_from('<I',d,20+ln)[0]; return j,d[28+ln:28+ln+bl]
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n=NC[a['type']]; ct=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride')
    if st and st!=n*np.dtype(ct).itemsize: return np.stack([np.frombuffer(b,ct,n,off+k*st) for k in range(a['count'])])
    v=np.frombuffer(b,ct,a['count']*n,off).reshape(a['count'],n)
    if a.get('normalized') and ct!=np.float32: v=v/(255 if ct==np.uint8 else 65535)
    return v
def q2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def trs(n):
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    M=np.eye(4); M[:3,:3]=q2m(n.get('rotation',[0,0,0,1]))*np.array(n.get('scale',[1,1,1]),float); M[:3,3]=n.get('translation',[0,0,0]); return M
def m2q(Rm):
    tr=np.trace(Rm)
    if tr>0: S=np.sqrt(tr+1)*2; return np.array([(Rm[2,1]-Rm[1,2])/S,(Rm[0,2]-Rm[2,0])/S,(Rm[1,0]-Rm[0,1])/S,.25*S])
    i=int(np.argmax(np.diag(Rm))); jx,kx=(i+1)%3,(i+2)%3; S=np.sqrt(1+Rm[i,i]-Rm[jx,jx]-Rm[kx,kx])*2; q=[0,0,0,0]; q[i]=.25*S; q[jx]=(Rm[jx,i]+Rm[i,jx])/S; q[kx]=(Rm[kx,i]+Rm[i,kx])/S; q[3]=(Rm[kx,jx]-Rm[jx,kx])/S; return np.array(q)
clean=lambda n:n.replace('.','_').replace('|','_').replace(':','_')
def read(f):
    """one skinned Polyfork animal at rest: bones (tree order), its local rests, bind matrices, the skin's corners at rest (raw order), colours, joints, weights, indices, the glTF"""
    j,b=glb(f); par={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}; G={}
    def gl(i):
        if i not in G: G[i]=(gl(par[i])@trs(j['nodes'][i])) if i in par else trs(j['nodes'][i])
        return G[i]
    sk=j['skins'][0]; J=list(sk['joints']); JN=[clean(j['nodes'][i]['name']) for i in J]; JS=set(J)
    parent=[J.index(par[i]) if i in par and par[i] in JS else -1 for i in J]; order=[]; seen=set()
    def walk(k):
        if k in seen: return
        if parent[k]>=0: walk(parent[k])
        seen.add(k); order.append(k)
    for k in range(len(J)): walk(k)
    rm={k:i for i,k in enumerate(order)}; names=[JN[k] for k in order]; par_=[rm[parent[k]] if parent[k]>=0 else -1 for k in order]
    Lc=[np.linalg.inv(gl(J[parent[k]]))@gl(J[k]) if parent[k]>=0 else gl(J[k]) for k in order]
    t=np.array([M[:3,3] for M in Lc]); q=np.array([m2q(M[:3,:3]/np.linalg.norm(M[:3,:3],axis=0)) for M in Lc]); s=np.array([np.linalg.norm(M[:3,:3],axis=0) for M in Lc])
    Gf=np.stack([gl(J[k]) for k in order])
    P=[];Cc=[];JJ=[];WW=[];IX=[]; base=0
    for ni,n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        if 'skin' in n:
            S=j['skins'][n['skin']]; ib=acc(j,b,S['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1); JM=np.stack([gl(S['joints'][k])@ib[k] for k in range(len(S['joints']))]); rmap=np.array([rm[J.index(x)] for x in S['joints']])
        for p in j['meshes'][n['mesh']]['primitives']:
            A=p['attributes']; pos=acc(j,b,A['POSITION']).astype(float); idx=acc(j,b,p['indices']).reshape(-1).astype(int) if 'indices' in p else np.arange(len(pos))
            mat=j['materials'][p['material']] if 'material' in p else {}; f=np.clip(np.array(mat.get('pbrMetallicRoughness',{}).get('baseColorFactor',[1,1,1,1])[:3]),0,1)
            c=acc(j,b,A['COLOR_0']).astype(float)[:,:3] if 'COLOR_0' in A else np.ones((len(pos),3)); c=np.clip(c*f,0,1)**(1/2.2)*255
            if 'skin' in n:
                jn=acc(j,b,A['JOINTS_0']).astype(int); w=acc(j,b,A['WEIGHTS_0']).astype(float); w=w/np.maximum(1e-9,w.sum(1,keepdims=True)); Ph=np.c_[pos,np.ones(len(pos))]; out=np.zeros((len(pos),3))
                for k in range(4): out+=w[:,k:k+1]*np.einsum('nij,nj->ni',JM[jn[:,k]][:,:3,:],Ph)
                jn=rmap[jn]
            else:   # (a mesh hung on a bone, not skinned: its corners all on that bone)
                M=gl(ni); out=(np.c_[pos,np.ones(len(pos))]@M.T)[:,:3]; bi=par.get(ni); k=rm[J.index(bi)] if bi in JS else 0; jn=np.tile([k,0,0,0],(len(pos),1)); w=np.tile([1.,0,0,0],(len(pos),1))
            P.append(out); Cc.append(c); JJ.append(jn); WW.append(w); IX.append(idx+base); base+=len(pos)
    return dict(j=j,b=b,J=J,order=order,rm=rm,names=names,parent=par_,t=t,q=q,s=s,G=Gf,P=np.vstack(P),C=np.vstack(Cc),JJ=np.vstack(JJ),WW=np.vstack(WW),IX=np.concatenate(IX))
def clips(R):
    j,b=R['j'],R['b']; JI={clean(j['nodes'][i]['name']):R['rm'][k] for k,i in enumerate(R['J'])}; out={}; nb=len(R['names'])
    for a in j.get('animations',[]):
        nm=a['name'].split('|')[-1].replace(' ','_').replace('(','').replace(')',''); dur=max(float(acc(j,b,s['input']).max()) for s in a['samplers']); nf=max(2,int(round(dur*12))+1); T=np.linspace(0,dur,nf)
        Q=np.tile(R['q'],(nf,1,1)); TR={}
        for c in a['channels']:
            s=a['samplers'][c['sampler']]; bn=clean(j['nodes'][c['target']['node']]['name'])
            if bn not in JI: continue
            k=JI[bn]; tt=acc(j,b,s['input']).reshape(-1).astype(float); v=acc(j,b,s['output']).astype(float)
            if c['target']['path']=='rotation':
                for d in range(1,len(v)):
                    if np.dot(v[d],v[d-1])<0: v[d]=-v[d]
                qq=np.stack([np.interp(T,tt,v[:,i]) for i in range(4)],1); Q[:,k]=qq/np.linalg.norm(qq,axis=1,keepdims=True)
            elif c['target']['path']=='translation':
                p=np.stack([np.interp(T,tt,v[:,i]) for i in range(3)],1)
                if np.ptp(p,axis=0).max()>1e-4: TR[R['names'][k]]=b64((p-R['t'][k]).astype(np.float32))   # (a move: from the bone's rest, so a reshaped rest keeps it)
        out[nm]={'dur':round(dur,4),'n':nf,'q':b64(np.round(Q*32000).astype(np.int16)),'p':TR}
    return out
hx=lambda h:np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
def i8(D):
    s=float(np.abs(D).max())/127 or 1e-6; return b64(np.round(D/s).astype(np.int8)),round(s,8)
def bake(key,pid,name,grp):
    R=read(get(pid)); P=R['P']; n0=len(P)
    pj=getj('https://polyfork.dev/cdn/'+pid+'-params.json'); PR=pj.get('params',{})
    zones=[(k,v['default']) for k,v in PR.items() if v.get('type')=='color']
    if zones:   # each corner's zone: the default colour nearest its own
        ZC=np.stack([hx(h) for _,h in zones]); Z=np.argmin(np.abs(R['C'][:,None,:]-ZC[None]).sum(2),1)
    else: Z=np.zeros(n0,int); zones=[('body','#%02x%02x%02x'%tuple(int(x) for x in np.median(R['C'],0)))]
    K=np.c_[np.round(P,5),R['C'].round(),R['JJ'],np.round(R['WW'],3)]; _,first,inv=np.unique(K,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1)
    Pw,Cw,Jw,Ww,Zw,IX=P[first],R['C'][first],R['JJ'][first],R['WW'][first],Z[first],inv[R['IX']]
    # the shape knobs: a range knob that is not the whole animal's size, at its least and its most
    knobs=[]
    for k,v in PR.items():
        if v.get('type')!='range' or v.get('min') is None: continue
        if len(knobs)>=5: break
        if 'complete' in (v.get('describe') or '').lower() or k in ('withers','scale','size'): continue
        ends=[]
        for e in (v['min'],v['max']):
            if abs(e-v['default'])<1e-6: ends.append(None); continue
            try: E=read(get(pid,{k:e}))
            except Exception as ex: print(' skip knob',key,k,e,ex); ends=None; break
            if len(E['P'])!=n0 or E['names']!=R['names']: print(' knob changes the mesh, skipped',key,k); ends=None; break
            dp=(E['P']-P)[first]; dt=E['t']-R['t']
            if np.abs(dp).max()<1e-5 and np.abs(dt).max()<1e-5: ends.append(None); continue
            a,s=i8(dp); ends.append({'p':a,'s':s,'t':{str(i):np.round(dt[i],5).tolist() for i in range(len(dt)) if np.abs(dt[i]).max()>1e-5}})
        if ends and any(ends): knobs.append({'k':k,'label':(v.get('label') or k).upper(),'min':v['min'],'def':v['default'],'max':v['max'],'lo':ends[0],'hi':ends[1]})
    presets={}
    for pn,pv in (pj.get('presets') or {}).items():
        vals=pv.get('params',pv) if isinstance(pv,dict) else {}
        cz={zk:vals[zk] for zk,_ in zones if isinstance(vals.get(zk),str) and vals[zk].startswith('#')}
        if cz: presets[pn.upper()]=cz
    lo=Pw.min(0); hi=Pw.max(0); sc=(hi-lo).max()/65000
    rig={'names':R['names'],'parent':R['parent'],'t':np.round(R['t'],5).tolist(),'q':np.round(R['q'],6).tolist(),'ibm':b64(np.linalg.inv(R['G']).transpose(0,2,1).astype(np.float32))}
    if np.abs(R['s']-1).max()>1e-4: rig['s']=np.round(R['s'],5).tolist()
    mesh={'n':len(Pw),'lo':np.round(lo,5).tolist(),'sc':float(sc),'p':b64(np.round((Pw-lo)/sc-32500).astype(np.int16)),'c':b64(Cw.round().astype(np.uint8)),'z':b64(Zw.astype(np.uint8)),
      'j':b64(Jw.astype(np.uint8)),'w':b64(np.round(Ww*255).astype(np.uint8)),'i':b64(IX.astype(np.uint16)),'parts':['body'],'tris':len(IX)//3}
    CL=clips(R); size=(hi-lo).tolist()
    D={'key':key,'pf':pid,'name':name,'rig':rig,'mesh':mesh,'clips':CL,'zones':zones,'knobs':knobs,'presets':presets,'size':np.round(size,4).tolist(),'tall':float(round(hi[1]-lo[1],4)),
       'license':'Polyfork (polyfork.dev/licensing): use in games, no reselling the files'}
    f='data/pets/'+key+'.json'; json.dump(D,open(f,'w'),separators=(',',':'))
    print(key,len(Pw),'pts',len(IX)//3,'tris',len(R['names']),'bones',list(CL),'knobs',[x['k'] for x in knobs],'zones',len(zones),'presets',list(presets),round(os.path.getsize(f)/1e3),'KB',flush=True)
    return {'key':key,'name':name,'group':grp,'clips':list(CL),'size':D['size'],'long':long_of(grp,D['size'],key),'zones':zones,'presets':presets,'knobs':[[x['k'],x['label'],x['min'],x['def'],x['max']] for x in knobs]}
want=set(sys.argv[1:])
if want=={'index'}:   # the list again from the baked files, nothing fetched
    K=[]
    for key,pid,name,grp in L:
        f='data/pets/'+key+'.json'
        if os.path.exists(f): D=json.load(open(f)); K.append({'key':key,'name':name,'group':grp,'clips':list(D['clips']),'size':D['size'],'long':long_of(grp,D['size'],key),'zones':D['zones'],'presets':D['presets'],'knobs':[[x['k'],x['label'],x['min'],x['def'],x['max']] for x in D['knobs']]})
    json.dump({'kinds':K},open('data/pets.json','w'),separators=(',',':')); print('data/pets.json',len(K),'kinds'); sys.exit()
IDX=json.load(open('data/pets.json')) if os.path.exists('data/pets.json') else {'kinds':[]}; have={x['key']:x for x in IDX['kinds']}
for key,pid,name,grp in L:
    if want and key not in want: continue
    try: have[key]=bake(key,pid,name,grp)
    except Exception as e: print('FAILED',key,pid,repr(e),flush=True)
IDX['kinds']=[have[k] for k,*_ in L if k in have]
json.dump(IDX,open('data/pets.json','w'),separators=(',',':')); print('data/pets.json',len(IDX['kinds']),'kinds')
import subprocess; subprocess.run(['python3','tools/pets-tame.py'])   # (each kind's tame, TAMING)
