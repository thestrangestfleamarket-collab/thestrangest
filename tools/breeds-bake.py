# THE BREEDS (owner, 7 Nov 2026: "add all variants possible through all possible methods. try to add every breed possible"): every dog and cat breed as its own
# kind on the Polyfork base dog or cat: Polyfork's own knobs (muzzle, ears, tail carriage ... its 15%), then the breed's body reshaped bone by bone (legs, trunk,
# neck, head, snout, ears dropped, tails curled or docked, fur), its coat pattern (which colour zone each corner takes: solid, saddle, spots, merle, brindle, tabby,
# points, tuxedo, calico ...), its colours and colour varieties, its real size and the base's shape knobs set. Writes data/pets/b/<key>.json (only what differs from
# the base: the corners' moves, the bones' moves, the zone map) and the kinds into data/pets.json. Run: python3 tools/breeds-bake.py [key ...] [--png folder]
import sys, os, json, math
SRC=open(os.path.join(os.path.dirname(__file__),'pets-bake.py')).read(); exec(SRC[:SRC.index('want=set(sys.argv[1:])')])
sys.path.insert(0,os.path.dirname(__file__)); from breeds_list import DOGS, CATS
os.makedirs('data/pets/b',exist_ok=True)
BASE={'dog':'dog-base','cat':'cat-base'}
KNOBS={'dog':['build','length','width','legs','crest'],'cat':['build','legs','crest','neck','head']}
MARK={'dog':{'mark':'#141210','mark2':'#7a4a2a'},'cat':{'mark':'#2e2622','mark2':'#c07838'}}
LEG=('FrontUpLeg','FrontElbow','FrontLeg','FrontFoot','HindUpLeg','HindLeg','HindHock','HindFoot')

def rot(axis,deg):
    a=np.array(axis,float); a/=np.linalg.norm(a); c,s=math.cos(math.radians(deg)),math.sin(math.radians(deg)); x,y,z=a
    return np.array([[c+x*x*(1-c),x*y*(1-c)-z*s,x*z*(1-c)+y*s],[y*x*(1-c)+z*s,c+y*y*(1-c),y*z*(1-c)-x*s],[z*x*(1-c)-y*s,z*y*(1-c)+x*s,c+z*z*(1-c)]])

class Base:
    """the base animal at rest: its corners deduplicated as the pet bake did, which bone leads each, its zones"""
    def __init__(s,sp):
        s.sp=sp; s.pid=BASE[sp]; s.R=read(get(s.pid)); R=s.R
        s.D=json.load(open('data/pets/'+sp+'.json')); s.PR=getj('https://polyfork.dev/cdn/'+s.pid+'-params.json')['params']
        s.zones=[k for k,v in s.PR.items() if v.get('type')=='color']; ZC=np.stack([hx(s.PR[z]['default']) for z in s.zones]); s.Z=np.argmin(np.abs(R['C'][:,None,:]-ZC[None]).sum(2),1)
        K=np.c_[np.round(R['P'],5),R['C'].round(),R['JJ'],np.round(R['WW'],3)]; _,s.first,inv=np.unique(K,axis=0,return_index=True,return_inverse=True); s.inv=inv.reshape(-1)
        assert len(s.first)==s.D['mesh']['n'],(len(s.first),s.D['mesh']['n'])
        s.names=R['names']; s.bi={n:i for i,n in enumerate(s.names)}; s.lead=R['JJ'][np.arange(len(R['P'])),np.argmax(R['WW'],1)]
        s.IX=s.inv[R['IX']].reshape(-1,3)

def reshape(B,E,sh):
    """E (a read() of the base or a Polyfork remix of it) reshaped: each bone's flesh scaled along it (len) and across it (girth), turned (bend), the children
    moved with it; the head's snout shortened or lengthened; then stood back on the ground. Returns the corners and each bone's new local rest move."""
    P=E['P'].copy(); G=E['G']; nb=len(E['names']); par=E['parent']; p=np.array([g[:3,3] for g in G]); Rg=[g[:3,:3]/np.linalg.norm(g[:3,:3],axis=0) for g in G]
    W=E['WW']; J=E['JJ']; bi=B.bi; hd=bi['Head']; jw=bi['Jaw']
    # the snout: corners of the head and jaw ahead of the stop, pulled in or out along the face (and narrowed or widened)
    sn=sh.get('snout',1); snw=sh.get('snoutw',1)
    if sn!=1 or snw!=1:
        hw=(W*((J==hd)|(J==jw)|(J==bi['LeftEar'])|(J==bi['RightEar']))).sum(1); ew=(W*((J==bi['LeftEar'])|(J==bi['RightEar']))).sum(1)
        head=hw>.5; zmax=P[head,2].max(); zs=p[hd,2]+(zmax-p[hd,2])*sh.get('stop',.35); cy=p[hd,1]-.25*(zmax-p[hd,2])
        def snf(q,k=1.0):
            q=q.copy(); m=q[...,2]>zs; f=(q[...,2]-zs)
            q[...,2]=np.where(m,zs+f*sn,q[...,2]); q[...,0]=np.where(m,q[...,0]*(1+(snw-1)*np.clip(f/(zmax-zs),0,1)),q[...,0]); q[...,1]=np.where(m,cy+(q[...,1]-cy)*(1+(snw-1)*.6*np.clip(f/(zmax-zs),0,1)),q[...,1]); return q
        P[head&(ew<.5)]=snf(P[head&(ew<.5)]); p[jw]=snf(p[jw][None])[0]
    # the chest's ruff (the base dog is a rough collie): pulled back toward the front legs, the lower neck with it, unless the breed keeps its ruff
    rf=sh.get('ruff',.35 if B.sp=='dog' else 1)
    if rf!=1:
        ft=np.isin(B.lead,[i for i,n in enumerate(E['names']) if 'Front' in n]); zl=np.percentile(P[ft,2],92); yn=p[bi['Neck'],1]+.35*(p[hd,1]-p[bi['Neck'],1])
        m=np.isin(B.lead,[bi['Chest'],bi['Neck'],bi['Spine']])&(P[:,2]>zl)&(P[:,1]<yn); f=np.clip((yn-P[:,1])/(.15*(yn-P[:,1].min())),0,1)*m
        P[:,2]=np.where(m,P[:,2]-(P[:,2]-zl)*(1-rf)*f,P[:,2])
    # the ears (mostly the head's own corners above the ear's root): scaled, then dropped outward and forward about the root
    ea=sh.get('ear',1); dr=sh.get('drop',0); ew_=sh.get('earw',1)
    if ea!=1 or dr or ew_!=1 or sh.get('dropf'):
        top=P[:,1].max()
        for e,sx in (('LeftEar',1),('RightEar',-1)):
            k=bi[e]; pe=p[k]; hgt=top-pe[1]; ew=(W*(J==k)).sum(1)>0; E0=P[ew]
            near=np.array([np.min(np.linalg.norm(E0-v,axis=1)) for v in P]) if ew.any() else np.full(len(P),9.)
            m=ew|(np.isin(B.lead,[hd,k])&(near<.45*hgt)&(P[:,0]*sx>abs(pe[0])*.5))
            f=np.clip((P[:,1]-(pe[1]-.05*hgt))/(.2*hgt),0,1)*m
            Rm=rot([0,0,1],-sx*dr)@rot([1,0,0],sh.get('dropf',20*min(1,dr/90)))
            S=np.diag([ew_*ea,ea,ew_*ea]); q=(P-pe)@(Rm@S).T+pe; P=P+(q-P)*f[:,None]
    ch=[[c for c in range(nb) if par[c]==k] for k in range(nb)]
    d=np.zeros((nb,3))
    for k in range(nb):
        v=(np.mean([p[c] for c in ch[k]],0)-p[k]) if ch[k] else (p[k]-p[par[k]] if par[k]>=0 else np.array([0,0,1.]))
        if k==hd or E['names'][k] in('Hips','Spine','Chest'): v=np.array([0,0,1.])   # (the trunk widens about the spine's line, never pushing the chest out)
        d[k]=v/max(1e-9,np.linalg.norm(v))
    L=np.ones(nb); g=np.ones(nb); u=np.ones(nb); Rk=[np.eye(3) for _ in range(nb)]
    def bones(sel): return [i for i,n in enumerate(E['names']) if sel(n)]
    fl=sh.get('fluff',1)
    for i in bones(lambda n:any(n.endswith(x) for x in LEG)): L[i]*=sh.get('leg',1); g[i]*=sh.get('legw',1)*fl
    for i in bones(lambda n:n in('Spine','Chest','Hips')): L[i]*=sh.get('body',1); g[i]*=sh.get('bodyw',1)*fl
    L[bi['Neck']]*=sh.get('neck',1); g[bi['Neck']]*=sh.get('neckw',1)*fl
    u[hd]*=sh.get('head',1); u[jw]*=sh.get('head',1)
    for i in bones(lambda n:n.startswith('Tail')): L[i]*=sh.get('tail',1); g[i]*=sh.get('tailw',1)*fl
    if sh.get('curl'): Rk[bi['Tail']]=rot([1,0,0],sh['curl']*.55); Rk[bi['TailTip']]=rot([1,0,0],sh['curl']*.45)
    if sh.get('tailup'): Rk[bi['Tail']]=rot([1,0,0],sh['tailup'])@Rk[bi['Tail']]
    M=[None]*nb; C=[None]*nb; pn=p.copy()
    for k in range(nb):
        C[k]=(C[par[k]] if par[k]>=0 else np.eye(3))@Rk[k]
        S=(g[k]*(np.eye(3)-np.outer(d[k],d[k]))+L[k]*np.outer(d[k],d[k]))*u[k]
        if E['names'][k] in('Hips','Spine','Chest'): S=np.diag([g[k],1+(g[k]-1)*.45,L[k]])*u[k]   # (a wider trunk, not a deeper chest)
        if k in(hd,jw) and sh.get('headw',1)!=1: S=S@np.diag([sh['headw'],1,1])
        M[k]=C[k]@S
        if par[k]>=0: pn[k]=pn[par[k]]+M[par[k]]@(p[k]-p[par[k]])
    out=np.zeros_like(P)
    for c in range(4):
        jj=J[:,c]; w=W[:,c:c+1]; Mj=np.stack(M)[jj]; out+=w*(pn[jj]+np.einsum('nij,nj->ni',Mj,P-p[jj]))
    dy=E['P'][:,1].min()-out[:,1].min(); out[:,1]+=dy; pn[:,1]+=dy
    t=np.array([pn[k] if par[k]<0 else Rg[par[k]].T@(pn[k]-pn[par[k]]) for k in range(nb)])
    return out,t

def noise3(P,f,seed):
    rng=np.random.default_rng(seed); out=np.zeros(len(P))
    for o in range(3):
        k=rng.normal(size=(6,3))*f*(2**o); ph=rng.uniform(0,6.28,6); out+=np.sin(P@k.T+ph).sum(1)/(1.6**o)
    return out/np.abs(out).max()

def pattern(B,pat,seed=1):
    """which zone each raw corner takes for a coat pattern (the base's own zones where the pattern leaves them)"""
    R=B.R; Z=B.Z.copy(); zi={z:i for i,z in enumerate(B.zones)}; zi['mark']=len(B.zones); zi['mark2']=len(B.zones)+1; P=R['P']/np.ptp(R['P'][:,2])*1.2; nm=B.names; ld=np.array([nm[k] for k in B.lead])
    if not pat or pat=='base': return Z
    legs=np.array([any(n.endswith(x) for x in LEG) for n in ld]); low=np.array([n.endswith(('Foot','FrontLeg','HindHock')) for n in ld]); tail=np.char.startswith(ld,'Tail')
    head=np.isin(ld,['Head','Jaw']); ears=np.char.endswith(ld,'Ear'); h=P[:,1]; top=h>np.percentile(h[~legs&~tail&~head&~ears],55)
    hz=P[head,2]; face=head&(P[:,2]>hz.min()+(hz.max()-hz.min())*.55)
    ps=[x for x in pat.split('+')]
    if B.sp=='dog':
        body={zi['coat'],zi['white'],zi['tan']}; isb=np.isin(Z,list(body))
        for q in ps:
            if q=='base': pass
            elif q=='solid': Z[isb]=zi['coat']
            elif q=='bicolor': Z[Z==zi['tan']]=zi['coat']
            elif q=='blacktan': Z[Z==zi['white']]=zi['tan']
            elif q=='tanpoints': Z[isb]=zi['coat']; Z[isb&(low|(face&(P[:,1]<np.percentile(P[head,1],45))))]=zi['tan']; Z[isb&~top&~legs&~head&~tail&(P[:,2]>.05*abs(P[:,2]).max())]=zi['tan']
            elif q=='saddle': Z[isb]=zi['tan']; Z[isb&top&~head&~legs]=zi['coat']
            elif q=='whitefeet': Z[isb&low]=zi['white']
            elif q=='whitechest': Z[isb&~top&~legs&~head&~tail&(P[:,2]>0)]=zi['white']
            elif q=='blaze': Z[isb&face&(np.abs(P[:,0])<.35*np.abs(P[head,0]).max())]=zi['white']
            elif q=='whitetail': Z[isb&tail&(P[:,2]<np.percentile(P[tail,2],35))]=zi['white']
            elif q=='mask': Z[isb&face]=zi['mark']
            elif q=='tanface': Z[isb&(face|ears)]=zi['tan']
            elif q=='earscol': Z[isb&ears]=zi['tan']
            elif q=='headcol': Z[isb&(head|ears)]=zi['tan']
            elif q=='white': Z[isb]=zi['white']
            elif q=='spots': n=noise3(P,38,seed); Z[isb]=zi['white']; Z[isb&(n>.42)]=zi['mark']
            elif q=='patches': n=noise3(P,9,seed); Z[isb&(n>.25)]=zi['coat']; Z[isb&(n<=.25)]=zi['white']
            elif q=='tanpatches': n=noise3(P,9,seed+3); Z[isb&(n>.3)&(Z!=zi['white'])]=zi['tan']
            elif q=='merle': n=noise3(P,22,seed); Z[isb&(Z==zi['coat'])&(n>.25)]=zi['mark']
            elif q=='brindle': n=noise3(P,6,seed); s=np.sin(P[:,2]*120+P[:,1]*40+n*4); Z[isb&(Z==zi['coat'])&(s>.35)]=zi['mark']
            elif q=='ticked': n=noise3(P,60,seed); Z[isb&(Z==zi['white'])&(n>.3)]=zi['coat']
            elif q=='roan': n=noise3(P,70,seed); Z[isb&(n>.15)]=zi['white']
            elif q=='sable': Z[isb&top]=zi['coat']; Z[isb&~top&(Z==zi['coat'])]=zi['tan']
            else: raise ValueError('dog pattern '+q)
    else:
        body={zi['coat'],zi['belly']}; isb=np.isin(Z,list(body)); st=zi['mark']
        for q in ps:
            if q=='solid': Z[isb]=zi['coat']
            elif q=='tabby': n=noise3(P,5,seed); s=np.sin(P[:,2]*55+n*3); Z[isb&(Z==zi['coat'])&(s>.3)]=st; Z[isb&(head|legs|tail)&(np.sin(P[:,1]*70+n*2)>.45)&(Z==zi['coat'])]=st
            elif q=='mackerel': n=noise3(P,4,seed); s=np.sin(P[:,2]*80+n*2); Z[isb&(Z==zi['coat'])&(s>.45)]=st; Z[isb&(legs|tail)&(np.sin(P[:,1]*80)>.5)]=st
            elif q=='spotted': n=noise3(P,55,seed); Z[isb&(Z==zi['coat'])&(n>.35)]=st
            elif q=='marbled': n=noise3(P,14,seed); Z[isb&(Z==zi['coat'])&(np.abs(n)<.18)]=st
            elif q=='points': Z[isb]=zi['coat']; Z[isb&(face|ears|low|tail|(legs&(h<np.percentile(h[legs],50))))]=st
            elif q=='mitted': Z[isb&low]=zi['belly']
            elif q=='tuxedo': Z[isb]=zi['coat']; Z[isb&((~top&~legs&~tail&~head&(P[:,2]>0))|low|(face&(P[:,1]<np.percentile(P[head,1],40))))]=zi['belly']
            elif q=='bicolor': n=noise3(P,7,seed); Z[isb]=zi['belly']; Z[isb&top&(n>-.35)]=zi['coat']; Z[isb&(tail|(ears))]=zi['coat']; Z[isb&head&(P[:,1]>np.percentile(P[head,1],55))]=zi['coat']
            elif q=='van': Z[isb]=zi['belly']; Z[isb&(tail|ears)]=zi['coat']; Z[isb&head&(P[:,1]>np.percentile(P[head,1],70))]=zi['coat']
            elif q=='calico': n=noise3(P,9,seed); m=noise3(P,9,seed+7); Z[isb]=zi['belly']; Z[isb&(n>-.1)]=zi['coat']; Z[isb&(n>-.1)&(m>.2)]=zi['mark2']
            elif q=='tortie': n=noise3(P,16,seed); Z[isb]=zi['coat']; Z[isb&(n>.05)]=st
            elif q=='white': Z[isb]=zi['belly']
            elif q=='smoke': Z[isb&~top]=zi['belly']
            else: raise ValueError('cat pattern '+q)
    return Z

def paintc(B,Z,cols):
    """each deduplicated corner's colour, as the page paints it"""
    C0=B.R['C'][B.first]; Z0=B.Z[B.first]; Zn=Z[B.first]; base=np.stack([hx(B.PR[z]['default']) for z in B.zones]); new=np.stack([hx(cols.get(z,B.PR[z]['default'] if z in B.PR else MARK[B.sp][z])) for z in B.zones+['mark','mark2']])
    lv=(C0.sum(1)+1)/(base[Z0].sum(1)+1); return np.clip(new[Zn]*lv[:,None],0,255)

def png(f,Pw,IX,col,title="",az=-55):
    from PIL import Image, ImageDraw
    Wd,Hd=360,300; a=math.radians(az); ca,sa=math.cos(a),math.sin(a); el=math.radians(14)
    X=Pw[:,0]*ca-Pw[:,2]*sa; Z=Pw[:,0]*sa+Pw[:,2]*ca; Y=Pw[:,1]*math.cos(el)-Z*math.sin(el); Dp=Z*math.cos(el)+Pw[:,1]*math.sin(el)
    s=min(Wd/(np.ptp(X)+1e-6),(Hd-30)/(np.ptp(Y)+1e-6))*.9; sx=(X-X.min())*s+(Wd-np.ptp(X)*s)/2; sy=Hd-10-(Y-Y.min())*s
    im=Image.new('RGB',(Wd,Hd),(225,232,220)); dr=ImageDraw.Draw(im); T=IX
    n=np.cross(Pw[T[:,1]]-Pw[T[:,0]],Pw[T[:,2]]-Pw[T[:,0]]); n/=np.linalg.norm(n,axis=1,keepdims=True)+1e-12; li=np.clip(np.abs(n@np.array([.4,.8,.45])),0,1)*.6+.45
    for i in np.argsort(Dp[T].mean(1)):
        c=tuple(int(x) for x in np.clip(col[T[i]].mean(0)*li[i],0,255)); dr.polygon([(sx[j],sy[j]) for j in T[i]],fill=c)
    dr.text((6,4),title,fill=(20,20,20)); im.save(f)

def knobv(B,pf):
    """the base's shape knobs (0..100) at the breed's values"""
    out=[]
    for kb in B.D['knobs']:
        v=pf.get(kb['k'],kb['def']); out.append(int(round((v-kb['min'])/max(1e-9,kb['max']-kb['min'])*100)))
    return out

def bake(B,b):
    key=b['key']; pf={k:v for k,v in b.get('pf',{}).items() if k not in KNOBS[B.sp]}
    for k,v in pf.items(): r=B.PR[k]; pf[k]=round(min(r['max'],max(r['min'],v)),3)
    E=read(get(B.pid,pf)) if pf else B.R
    assert len(E['P'])==len(B.R['P']) and E['names']==B.names,(key,'remix changed the mesh')
    Pn,t=reshape(B,E,b.get('sh',{}))
    Z=pattern(B,b.get('pat'),b.get('seed',1))
    first=B.first; dp=(Pn-B.R['P'])[first]; dt=t-B.R['t']; a,s=i8(dp)
    Pw=Pn[first]; lo=Pw.min(0); hi=Pw.max(0)
    rec={'key':key,'of':B.sp,'p':a,'s':s,'t':{str(i):np.round(dt[i],5).tolist() for i in range(len(dt)) if np.abs(dt[i]).max()>1e-5},'size':np.round(hi-lo,4).tolist(),'tall':float(round(hi[1]-lo[1],4))}
    Zf=Z[first];
    if (Zf!=B.Z[first]).any(): rec['z']=b64(Zf.astype(np.uint8))
    json.dump(rec,open('data/pets/b/'+key+'.json','w'),separators=(',',':'))
    cols=b['cols'][0][1] if b.get('cols') else {}
    zones=[[z,cols.get(z,B.PR[z]['default'])] for z in B.zones]
    used=set(np.unique(Zf).tolist()); nz=2 if len(B.zones)+1 in used else 1 if len(B.zones) in used else 0
    for z in ('mark','mark2')[:nz]: zones.append([z,cols.get(z,MARK[B.sp][z])])
    presets={n.upper():c for n,c in b.get('cols',[])[1:]}
    if presets and b.get('cols'): presets={b['cols'][0][0].upper():b['cols'][0][1],**presets}
    K={'key':key,'name':b['name'],'group':b['grp'],'of':B.sp,'clips':list(B.D['clips']),'size':rec['size'],'long':round(min(1.2,b['m']),3),'zones':zones,'presets':presets,
       'knobs':[[x['k'],x['label'],x['min'],x['def'],x['max']] for x in B.D['knobs']],'s0':knobv(B,b.get('pf',{}))}
    return K,Pw,Zf

if __name__=='__main__':
    args=[a for a in sys.argv[1:]]; PNG=None
    if '--png' in args: i=args.index('--png'); PNG=args[i+1]; del args[i:i+2]; os.makedirs(PNG,exist_ok=True)
    want=set(args); bases={}; kinds=[]
    for sp,L in (('dog',DOGS),('cat',CATS)):
        for b in L:
            if want and b['key'] not in want: continue
            B=bases.get(sp) or bases.setdefault(sp,Base(sp))
            try: K,Pw,Zf=bake(B,b)
            except Exception as e: print('FAILED',b['key'],repr(e),flush=True); raise
            kinds.append(K); print(b['key'],K['long'],'m',os.path.getsize('data/pets/b/'+b['key']+'.json')//1000,'KB',flush=True)
            if PNG: png(os.path.join(PNG,b['key']+'.png'),Pw,B.IX,paintc(B,pattern(B,b.get('pat'),b.get('seed',1)),{z:c for z,c in K['zones']}),b['name'])
    if not PNG or not want:
        IDX=json.load(open('data/pets.json')); have={k['key']:k for k in IDX['kinds']}
        for K in kinds: have[K['key']]=K
        order=[k['key'] for k in IDX['kinds'] if not k.get('of')]+[b['key'] for b in DOGS+CATS]
        IDX['kinds']=[have[k] for k in order if k in have]; json.dump(IDX,open('data/pets.json','w'),separators=(',',':')); print('data/pets.json',len(IDX['kinds']),'kinds')
