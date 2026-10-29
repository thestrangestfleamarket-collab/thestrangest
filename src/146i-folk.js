// THE FOLK: FOLK.parts builds a woodland character from its recipe (data/guardians.json) as sculpted parts for one rig: a head shaped from a deformed sphere for its species (skull, muzzle, brow, cheeks, eyes, ears, markings), a body, cloth with folds and ragged hems, plate, and a worked weapon.
import {THREE} from './003-shx.js';
import {PARTSNPC} from './080-npc-parts.js';
const FOLK={}; window.FOLK=FOLK;
FOLK.Q=2;
FOLK.parts=R=>{ '@park'; const Q=FOLK.Q, tube=(a,r,nu,nv,o)=>PARTSNPC.T.tube(a,r,Math.max(4,Math.round(nu*Q)),Math.max(2,Math.round(nv*Q)),o), lathe=(a,nu,nv,o)=>PARTSNPC.T.lathe(a,Math.max(5,Math.round(nu*Q)),Math.max(2,Math.round(nv*Q)),o), PI=Math.PI, V=new THREE.Vector3(), b=R.bulk||1, HC=[0,.74,0], HR=.13;
  const h3=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const gss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2)), sm=(a,c,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(c-a))); return t*t*(3-2*t); };
  const C=h=>{ const n=parseInt(String(h||'#888888').slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; };
  const mix=(a,c,t)=>a.map((v,i)=>v+(c[i]-v)*t), dk=(c,t=.35)=>mix(c,[0,0,0],t), lt=(c,t=.35)=>mix(c,[1,1,1],t), vary=(c,h,a=.12)=>c.map(v=>Math.max(0,v*(1-a/2+a*h)));
  const f=C(R.f), f2=C(R.f2||R.f), BONE=[.88,.85,.78], BLACK=[.03,.03,.035], WHITE=[.94,.93,.9], PINK=[.86,.6,.58], WOOD=[.4,.28,.18], LEATH=[.36,.23,.14], GOLD=[.84,.66,.28], STEEL=[.6,.63,.68];
  // any geometry as a part's shape: points jittered alike wherever they meet (no cracks), each face one colour from its centre
  const S=(g,col,j=0)=>{ g=g.index?g.toNonIndexed():g; const p=g.attributes.position, n=p.count, P=new Float32Array(n*3), Cc=new Float32Array(n*3);
    for(let i=0;i<n;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); if(j){ const kx=Math.round(x*900), ky=Math.round(y*900), kz=Math.round(z*900); x+=(h3(kx,ky,kz)-.5)*j; y+=(h3(ky,kz,kx+3)-.5)*j; z+=(h3(kz+7,kx,ky)-.5)*j; } P[i*3]=x; P[i*3+1]=y; P[i*3+2]=z; }
    for(let q=0;q<n;q+=3){ const cx=(P[q*3]+P[q*3+3]+P[q*3+6])/3, cy=(P[q*3+1]+P[q*3+4]+P[q*3+7])/3, cz=(P[q*3+2]+P[q*3+5]+P[q*3+8])/3, c=typeof col==='function'?col(cx,cy,cz,h3(Math.round(cx*700),Math.round(cy*700),Math.round(cz*700))):col; for(let k=0;k<3;k++)Cc.set(c,(q+k)*3); }
    return {P,C:Cc}; };
  const at=(g,p,rot,sc)=>{ if(sc)g.scale(...sc); if(rot)g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot.map(a=>a*PI/180)))); g.translate(...p); return g; };
  // a sculpted shell: the unit sphere's points moved by d(u), scaled by r, turned, placed; col(u of the face's centre, hash)
  const ICO=[]; const shell=(det0,{d,r=[1,1,1],p=[0,0,0],rot,keep,col,j=0})=>{ const det=det0>=2&&Q>1?det0+1:det0>=2&&Q<1?det0-1:det0, sp=ICO[det]||(ICO[det]=new THREE.IcosahedronGeometry(1,det).attributes.position), M=rot&&new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot.map(a=>a*PI/180))), P=[], Cc=[];
    const put=u=>{ const q=d?d(u):u; V.set(q[0]*r[0],q[1]*r[1],q[2]*r[2]); if(M)V.applyMatrix4(M); let x=V.x+p[0], y=V.y+p[1], z=V.z+p[2]; if(j){ const k=u.map(v=>Math.round(v*600)); x+=(h3(...k)-.5)*j; y+=(h3(k[1],k[2],k[0]+5)-.5)*j; z+=(h3(k[2]+9,k[0],k[1])-.5)*j; } return [x,y,z]; };
    for(let q=0;q<sp.count;q+=3){ const us=[0,1,2].map(i=>{ const x=sp.getX(q+i), y=sp.getY(q+i), z=sp.getZ(q+i), l=Math.hypot(x,y,z); return [x/l,y/l,z/l]; }), m=[0,1,2].map(k=>us[0][k]+us[1][k]+us[2][k]), ml=Math.hypot(...m), cu=m.map(v=>v/ml);
      if(keep&&!keep(cu))continue; const c=typeof col==='function'?col(cu,h3(...cu.map(v=>Math.round(v*500)))):col; for(const u of us){ P.push(...put(u)); Cc.push(...c); } }
    return {P:new Float32Array(P),C:new Float32Array(Cc)}; };
  const fur=(c,a=.14)=>(u,h)=>vary(c,h,a), cloth=(c)=>(x,y,z,h)=>vary(c,h,.1);
  const pt=(name,bone,of,rank=1)=>({name,rank,bone,of}), pair=fn=>[-1,1].map(fn);

  // the species: skull scale, muzzle [length, width, height, y], cheeks, brow, eye [x,y,z on the skull, radius, iris], nose, ears, markings
  const SP={
    mouse:{sk:[1,.94,1.02],mz:[.6,.32,.26,-.2],ch:.07,eye:[.42,.14,.8,.027],nose:[.018,PINK],ear:{k:'round',s:.078,dir:[.62,.74,-.12],tilt:14},tail:'thin'},
    rat:{sk:[.95,.9,1.05],mz:[.95,.3,.25,-.22],ch:.04,eye:[.4,.13,.82,.022],nose:[.018,PINK],ear:{k:'round',s:.055,dir:[.6,.72,-.2],tilt:14},tail:'thin'},
    owl:{sk:[1.12,1.02,.98],mz:[0,0,0,0],ch:.12,eye:[.36,.1,.88,.034,[.92,.62,.16]],face:'disc',beak:[.03,.06,[.86,.74,.36]],ear:{k:'tuft',s:.09,dir:[.55,.8,-.05],tilt:26}},
    barnowl:{sk:[1.05,1.02,.95],mz:[0,0,0,0],ch:.1,eye:[.3,.08,.92,.022],face:'heart',beak:[.022,.05,[.9,.84,.72]]},
    frog:{sk:[1.28,.7,1.08],mz:[.12,.7,.5,-.15],ch:.04,eye:[.52,.62,.55,.04,[.78,.58,.14]],bulge:1,mouth:1},
    redpanda:{sk:[1.04,.96,1],mz:[.38,.3,.24,-.24],ch:.12,eye:[.4,.12,.84,.022],nose:[.02,BLACK],ear:{k:'point',s:.065,dir:[.66,.66,-.18],tilt:22,w:1.2},mark:'redpanda',tail:'ringed'},
    panda:{sk:[1.06,1,1],mz:[.32,.34,.26,-.24],ch:.16,eye:[.4,.12,.84,.014,[.5,.55,.66]],nose:[.02,BLACK],ear:{k:'round',s:.05,dir:[.62,.72,-.14],tilt:10,thick:1},mark:'panda'},
    raccoon:{sk:[1.04,.95,1],mz:[.55,.3,.24,-.22],ch:.12,eye:[.4,.12,.84,.021],nose:[.022,BLACK],ear:{k:'point',s:.06,dir:[.64,.68,-.2],tilt:20},mark:'raccoon',tail:'ringed'},
    lynx:{sk:[1.04,.96,1],mz:[.3,.34,.26,-.24],ch:.18,eye:[.4,.14,.86,.024,[.86,.6,.16]],nose:[.017,[.55,.34,.3]],ear:{k:'point',s:.07,dir:[.6,.74,-.15],tilt:10,tuft:1},mark:'lynx',ruff:1,tail:'stub'},
    hyena:{sk:[1.02,.98,1.05],mz:[.75,.36,.3,-.22],ch:.06,eye:[.42,.18,.8,.02,[.95,.8,.2]],nose:[.026,BLACK],ear:{k:'round',s:.068,dir:[.64,.7,-.22],tilt:22},mark:'hyena',mane:1,tail:'stub'},
    pangolin:{sk:[.78,.72,.9],mz:[1.3,.22,.2,-.3],eye:[.45,.08,.8,.012],nose:[.012,[.3,.24,.22]],mark:'scales',tail:'pangolin'},
    rhino:{sk:[1.2,1,1.15],mz:[.9,.5,.42,-.26],ch:.06,eye:[.62,.18,.7,.016,[.66,.3,.26]],ear:{k:'point',s:.05,dir:[.62,.74,-.25],tilt:30},horn:1},
    rabbit:{sk:[.98,.95,1],mz:[.35,.32,.26,-.22],ch:.14,eye:[.44,.14,.8,.03,[.38,.12,.1]],nose:[.014,PINK],ear:{k:'long',s:.07,dir:[.38,.9,-.12],tilt:16},horns:1},
    hedgehog:{sk:[.9,.88,1],mz:[.7,.26,.24,-.24],ch:.06,eye:[.44,.14,.8,.019],nose:[.017,[.4,.22,.24]],ear:{k:'round',s:.03,dir:[.62,.62,-.1],tilt:6,thick:1},quills:1},
    batear:{sk:[1,.96,1],mz:[.3,.3,.24,-.24],ch:.12,eye:[.4,.12,.84,.02],nose:[.014,BLACK],ear:{k:'point',s:.1,dir:[.7,.6,-.12],tilt:38,len:1.15,w:1.9}},
    toucan:{sk:[.95,1.05,.95],mz:[0,0,0,0],eye:[.6,.18,.66,.017],ring:[.3,.62,.95],bill:1,mark:'toucan'},
    shark:{sk:[1.05,.95,1.25],mz:[.25,.6,.4,-.1],eye:[.72,.12,.55,.017],mark:'shark',fin:1,mouth:2},
    cat:{sk:[1.04,.95,.98],mz:[.22,.3,.22,-.26],ch:.15,eye:[.4,.13,.86,.028,[.72,.66,.26]],nose:[.014,[.82,.52,.5]],ear:{k:'point',s:.075,dir:[.6,.74,-.12],tilt:12,w:1.1},mark:'tabby',tail:'cat'},
    tiger:{sk:[1.08,.98,1],mz:[.3,.36,.26,-.25],ch:.22,eye:[.4,.14,.86,.026,[.86,.62,.18]],nose:[.02,[.78,.42,.38]],ear:{k:'round',s:.055,dir:[.62,.72,-.14],tilt:12},mark:'tiger',ruff:1,tail:'cat'},
    lion:{sk:[1.1,1,1.02],mz:[.36,.38,.28,-.26],ch:.18,eye:[.4,.14,.86,.024,[.9,.56,.14]],nose:[.024,[.12,.1,.1]],ear:{k:'round',s:.05,dir:[.62,.74,-.16],tilt:12},mark:'lionmask',bigmane:1,tail:'cat'},
    fox:{sk:[1.02,.94,1],mz:[.8,.3,.22,-.26],ch:.14,eye:[.4,.14,.84,.026],nose:[.016,BLACK],ear:{k:'point',s:.09,dir:[.6,.74,-.14],tilt:22,w:1.25,len:1.3},mark:'fox',tail:'fox'},
    wolf:{sk:[1.02,.96,1.02],mz:[.85,.32,.26,-.25],ch:.1,eye:[.42,.16,.82,.022,[.86,.7,.3]],nose:[.02,BLACK],ear:{k:'point',s:.075,dir:[.62,.72,-.16],tilt:14,len:1.2},mark:'fox',tail:'fox'},
    lizard:{sk:[.95,.8,1.1],mz:[.75,.48,.32,-.22],eye:[.6,.3,.62,.026,[.9,.5,.12]],mouth:3,mark:'lizard',tail:'lizard',brow:1},
    turtle:{sk:[1,.88,1.05],mz:[.45,.44,.32,-.22],eye:[.55,.18,.72,.022,[.3,.26,.16]],mouth:3,mark:'lizard',shellback:1},
    bull:{sk:[1.12,1,1.08],mz:[.6,.5,.42,-.32],ch:.08,eye:[.52,.16,.76,.02],nose:[.04,[.74,.52,.5]],ear:{k:'point',s:.06,dir:[.85,.42,-.1],tilt:70,w:1.3},bhorns:1},
    bear:{sk:[1.08,1,1],mz:[.38,.34,.28,-.26],ch:.18,eye:[.38,.12,.86,.019],nose:[.024,BLACK],ear:{k:'round',s:.052,dir:[.6,.74,-.12],tilt:12,thick:1}},
    goat:{sk:[.96,.98,1],mz:[.75,.3,.28,-.25],ch:.06,eye:[.48,.16,.78,.022,[.82,.66,.2]],nose:[.018,[.4,.36,.36]],ear:{k:'point',s:.06,dir:[.86,.4,-.12],tilt:75,w:1.1},rhorns:1,goatee:1},
    elephant:{sk:[1.08,1.05,1],mz:[0,0,0,0],ch:.1,eye:[.44,.18,.8,.02,[.36,.56,.86]],trunk:1,ear:{k:'round',s:.11,dir:[.9,.1,-.1],tilt:80,flat:1}},
    badger:{sk:[1,.92,1.02],mz:[.7,.28,.24,-.24],ch:.08,eye:[.42,.12,.82,.018],nose:[.02,BLACK],ear:{k:'round',s:.035,dir:[.62,.66,-.18],tilt:8,thick:1},mark:'badger'},
    spirit:{sk:[1,1,1],mz:[0,0,0,0],eye:[.36,.06,.88,.04,[1,.62,.18]],shag:1,shorns:1,glow:1},
    caterpillar:{sk:[1,.92,.95],mz:[.12,.5,.3,-.2],ch:.18,eye:[.36,.3,.82,.034,[.95,.62,.12]],nose:[0],ant:1,mark:'cheeks'}};
  const K=SP[R.sp]||SP.mouse, EYE=K.eye, cat=R.sp==='caterpillar', hc=cat?[0,.92,.04]:HC;
  const hd=u=>{ let [x,y,z]=u; const s=K.sk; x*=s[0]; y*=s[1]; z*=s[2]; const fr=Math.max(0,u[2]);
    if(K.mz[0]){ const m=gss(u[0],u[1],0,K.mz[3],K.mz[1],K.mz[2])*sm(.1,.85,u[2]); z+=K.mz[0]*m; x*=1-.35*m*sm(0,1,K.mz[0]); y-=.06*m; }
    if(K.ch)x+=Math.sign(x)*K.ch*(gss(u[0],u[1],.55,-.22,.3,.24)+gss(u[0],u[1],-.55,-.22,.3,.24));
    z+=fr*(.05*(gss(u[0],u[1],EYE[0],EYE[1]+.16,.18,.06)+gss(u[0],u[1],-EYE[0],EYE[1]+.16,.18,.06))-.06*(gss(u[0],u[1],EYE[0],EYE[1],.13,.1)+gss(u[0],u[1],-EYE[0],EYE[1],.13,.1)));
    if(K.face==='disc'||K.face==='heart'){ if(u[2]>.35)z=.35+(z-.35)*.45; z+=.07*gss(Math.abs(u[0]),u[1],.5,0,.12,.5)*fr; }
    if(K.bulge){ y+=.55*(gss(u[0],u[1],EYE[0],EYE[1],.22,.22)+gss(u[0],u[1],-EYE[0],EYE[1],.22,.22))*sm(-.2,.4,u[2]); }
    if(K.brow)y+=.12*Math.max(0,u[1])*sm(.2,.8,u[2]); if(K.shag){ x*=1.05; y*=1.1; }
    if(R.sp==='shark'){ y+=.08*gss(u[0],u[2],0,-.4,.25,.4)*Math.max(0,u[1]); }
    return [x,y,z]; };
  const onHead=u=>{ const l=Math.hypot(...u), q=hd(u.map(v=>v/l)); return [hc[0]+q[0]*HR,hc[1]+q[1]*HR,hc[2]+q[2]*HR]; };
  // the markings: colour of the head's face at u
  const MARK={
    redpanda:u=>{ if(gss(u[0],u[1],0,-.35,.3,.2)*sm(.3,.8,u[2])>.4)return WHITE; if(gss(Math.abs(u[0]),u[1],.55,-.2,.18,.2)*sm(0,.5,u[2])>.45)return WHITE; if(gss(Math.abs(u[0]),u[1],.32,.36,.08,.06)*sm(.4,.8,u[2])>.4)return WHITE; if(u[1]<-.55)return dk(f,.55); if(gss(Math.abs(u[0]),u[1],.42,-.05,.07,.25)*sm(.4,.8,u[2])>.5)return dk(f,.35); return null; },
    panda:u=>{ if(gss(Math.abs(u[0]),u[1],EYE[0],EYE[1]-.02,.14,.16)*sm(.3,.7,u[2])>.35)return f2; return null; },
    raccoon:u=>{ if(gss(u[0],u[1],0,-.32,.3,.18)*sm(.3,.8,u[2])>.4)return WHITE; if(Math.abs(u[1]-EYE[1]+.02)<.13&&u[2]>.25&&Math.abs(u[0])<.85)return gss(u[0],u[1],0,EYE[1],.07,.15)>.6?lt(f,.5):[.08,.07,.07]; if(gss(Math.abs(u[0]),u[1],.3,.38,.12,.06)*sm(.4,.8,u[2])>.4)return WHITE; return null; },
    lynx:u=>{ if(u[1]<-.35&&u[2]>.1)return f2; const s=Math.sin(u[1]*16+Math.abs(u[0])*6); if(u[1]>.2&&s>.7&&u[2]>-.2)return dk(f,.45); if(u[2]>.4&&Math.abs(u[0])>.45&&Math.sin(u[1]*20)>.6)return dk(f,.45); return null; },
    hyena:u=>{ if(gss(u[0],u[1],0,-.3,.26,.26)*sm(.4,.9,u[2])>.35)return f2; if(Math.sin(u[0]*22)*Math.sin(u[1]*19)*Math.sin(u[2]*17)>.45)return dk(f,.5); return null; },
    scales:(u,h)=>{ const r=u[1]*7+Math.abs(u[0])*3+u[2]*2, k=r-Math.floor(r); return mix(dk(f,.35),lt(f,.12),k*(.7+.3*h)); },
    toucan:u=>u[1]<-.25&&u[2]>-.1?WHITE:null,
    shark:u=>u[1]<-.12&&u[2]>-.6?f2:null,
    tabby:u=>{ if(gss(u[0],u[1],0,-.32,.26,.2)*sm(.3,.8,u[2])>.4)return lt(f,.45); if(Math.sin(u[0]*14+Math.abs(u[1])*3)>.75&&u[1]>.25)return dk(f,.4); if(u[2]>.3&&Math.abs(u[0])>.55&&Math.sin(u[1]*18)>.55)return dk(f,.4); return null; },
    tiger:u=>{ if(gss(u[0],u[1],0,-.3,.36,.22)*sm(.3,.8,u[2])>.35||gss(Math.abs(u[0]),u[1],.32,.3,.12,.07)*sm(.4,.8,u[2])>.5)return WHITE; if(Math.sin(Math.abs(u[0])*11+u[1]*2.5+u[2]*3)>.72&&u[1]>-.2)return BLACK; if(Math.sin(u[1]*14-Math.abs(u[0])*4)>.8&&Math.abs(u[0])>.5)return BLACK; return null; },
    lionmask:u=>{ if(u[2]>.35&&u[1]>-.5&&u[1]<.55&&Math.abs(u[0])<.62)return gss(u[0],u[1],0,-.15,.2,.4)>.55?C('#6a4a2a'):C('#141214'); return null; },
    fox:u=>{ if(gss(u[0],u[1],0,-.38,.32,.18)*sm(.25,.8,u[2])>.35||gss(Math.abs(u[0]),u[1],.55,-.3,.2,.16)*sm(0,.6,u[2])>.4)return R.sp==='wolf'?lt(f,.5):WHITE; if(u[2]>.85&&u[1]<-.1)return dk(f,.6); return null; },
    lizard:(u,h)=>{ const r=u[1]*9+Math.abs(u[0])*4+u[2]*3; return Math.sin(r*3)*Math.sin(u[0]*30+u[2]*20)>.5?vary(dk(f,.3),h,.1):u[1]<-.3&&u[2]>0?vary(f2,h,.1):null; },
    badger:u=>{ if(Math.abs(u[0])<.13&&u[2]>-.2)return WHITE; if(Math.abs(Math.abs(u[0])-.45)<.13&&u[2]>.2&&u[1]>-.35)return WHITE; if(u[2]>.25&&Math.abs(u[0])>.2&&Math.abs(u[0])<.32)return [.08,.08,.08]; return null; },
    cheeks:u=>gss(Math.abs(u[0]),u[1],.6,-.2,.15,.15)*sm(.2,.6,u[2])>.4?f2:null };
  const headCol=(u,h)=>{ const m=MARK[K.mark]&&MARK[K.mark](u,h); if(m)return vary(m,h,.08);
    if(K.face==='disc'&&u[2]>.35)return vary(gss(Math.abs(u[0]),u[1],.33,.1,.22,.3)>.4?lt(f2,.2):f2,h,.08);
    if(K.face==='heart'){ if(u[2]>.38)return vary(WHITE,h,.05); if(u[2]>.25)return vary(f2,h,.08); }
    if(R.stars&&h>.92)return [.95,.92,.8]; if(K.mouth===1&&Math.abs(u[1]+.18)<.035&&u[2]>.15)return dk(f,.6); if(K.mouth===2&&Math.abs(u[1]+.12-u[2]*.05)<.03&&u[2]>.55)return [.45,.15,.17]; if(K.mouth===3&&Math.abs(u[1]+.28-u[2]*.08)<.028&&u[2]>.3)return dk(f,.65); if(K.shag)return vary(WHITE,h,.1); return vary(f,h); };
  const L=[];
  L.push(pt('head','head',[shell(3,{d:hd,r:[HR,HR,HR],p:hc,col:headCol,j:K.mark==='scales'?.004:.0025})],2));
  // eyes: a glossy ball set into its socket, an iris for some, a glint
  { const er=EYE[3], E=[]; for(const sx of [-1,1]){ const s=onHead([sx*EYE[0],EYE[1],EYE[2]]), n=[s[0]-hc[0],s[1]-hc[1],s[2]-hc[2]], l=Math.hypot(...n), q=n.map(v=>v/l), c=s.map((v,i)=>v-q[i]*er*.35);
      E.push(S(at(new THREE.SphereGeometry(er,12,9),c),R.glow||K.glow?(()=>lt(C(R.glow||'#ffa030'),.35)):EYE[4]?((x,y,z)=>{ const d=Math.hypot(x-c[0]-q[0]*er,y-c[1]-q[1]*er,z-c[2]-q[2]*er); return d<er*.55?BLACK:d<er*1.05?EYE[4]:BLACK; }):BLACK));
      E.push(S(at(new THREE.SphereGeometry(er*.25,5,4),[c[0]+q[0]*er*.9+er*.25,c[1]+q[1]*er*.9+er*.35,c[2]+q[2]*er*.9]),WHITE));
      if(K.ring)E.push(S(at(new THREE.TorusGeometry(er*1.5,er*.45,6,14),c,[0,sx*50,0]),K.ring)); }
    L.push(pt('eyes','head',E,4)); }
  if(K.nose&&K.nose[0]){ const n=onHead([0,K.mz[3]+.04,1]); L.push(pt('nose','head',[shell(2,{r:[K.nose[0]*1.3,K.nose[0],K.nose[0]],p:[n[0],n[1],n[2]-K.nose[0]*.3],col:(u,h)=>u[1]>.3?lt(K.nose[1],.25):K.nose[1]})],3)); }
  if(K.beak){ const n=onHead([0,-.05,1]), [r,l,c]=K.beak; L.push(pt('beak','head',[S(at(lathe([[r*.9,0],[r,l*.15],[r*.6,l*.6],[0,l]],10,8),[n[0],n[1]+.005,n[2]-r*.4],[115,0,0],[1,1,.8]),(x,y,z,h)=>vary(c,h,.08))],4)); }
  if(K.bill){ const n=onHead([0,0,1]); L.push(pt('bill','head',[S(at(lathe([[.04,0],[.05,.05],[.042,.14],[.022,.22],[0,.26]],12,10),[n[0],n[1]-.005,n[2]-.02],[96,0,0],[.75,1,1]),(x,y,z,h)=>z>n[2]+.17?BLACK:y>n[1]+.012?vary([.98,.55,.12],h,.06):vary([.94,.36,.1],h,.06))],3)); }
  if(K.fin){ const n=onHead([0,1,-.25]); L.push(pt('fin','head',[S(at(new THREE.ConeGeometry(.05,.13,4,1),[n[0],n[1]+.05,n[2]-.01],[-22,45,0],[.25,1,1]),(x,y,z,h)=>vary(f,h,.08))],3)); }
  if(K.horn){ const n=onHead([0,K.mz[3]+.2,1]), n2=onHead([0,.2,.95]); L.push(pt('horns','head',[S(tube([[n[0],n[1],n[2]-.02],[n[0],n[1]+.06,n[2]+.02],[n[0],n[1]+.14,n[2]-.01]],[.035,.022,0],8,6),(x,y,z,h)=>vary([.88,.84,.74],h,.1)),
    S(tube([[n2[0],n2[1]-.01,n2[2]-.02],[n2[0],n2[1]+.05,n2[2]],[n2[0],n2[1]+.08,n2[2]-.01]],[.024,.014,0],8,5),(x,y,z,h)=>vary([.84,.8,.7],h,.1))],3)); }
  if(K.horns)L.push(pt('horns','head',pair(sx=>{ const n=onHead([sx*.22,.85,.35]); return S(tube([n,[n[0]+sx*.01,n[1]+.07,n[2]+.01],[n[0]+sx*.025,n[1]+.15,n[2]-.01],[n[0]+sx*.03,n[1]+.2,n[2]-.03]],[.011,.009,.006,0],6,8,{d:(p,u,v)=>{ const w=.004*Math.sin(v*40+u*6.28); return [p[0]+w,p[1],p[2]+w]; }}),(x,y,z,h)=>vary([.3,.26,.22],h,.15)); }),3));
  if(K.ant)L.push(pt('antennae','head',pair(sx=>{ const n=onHead([sx*.3,.9,.2]); return S(tube([n,[n[0]+sx*.01,n[1]+.05,n[2]],[n[0]+sx*.02,n[1]+.1,n[2]-.01]],[.012,.016,.01],7,5),(x,y,z,h)=>vary([.82,.36,.2],h,.1)); }),3));
  if(K.ruff)L.push(pt('ruff','head',[shell(2,{r:[.15,.07,.1],p:[0,.655,.03],keep:u=>u[1]<.5,col:fur(f2,.2),j:.012,d:u=>[u[0],u[1]-.3*Math.abs(Math.sin(Math.atan2(u[0],u[2])*7))*Math.max(0,-u[1]),u[2]]})],3));
  if(K.mane)L.push(pt('mane','head',[shell(2,{r:[.07,.12,.1],p:[0,.72,-.08],keep:u=>u[2]<.3,col:fur(dk(f,.5),.25),j:.02})],1));
  if(R.beard)L.push(pt('beard','head',[shell(2,{r:[.075,.12,.05],p:[0,.62,.09],keep:u=>u[2]>-.3,col:fur(WHITE,.15),j:.012,d:u=>[u[0]*(1-.5*Math.max(0,-u[1])),u[1]-.4*Math.max(0,-u[1])*(1+.3*Math.sin(u[0]*20)),u[2]]})],3));
  if(R.hair)L.push(pt('hair','head',[shell(2,{r:[.11,.07,.1],p:[0,.835,-.015],keep:u=>u[1]>-.3,col:fur(C(R.hair),.2),j:.03})],4));
  if(K.bigmane)L.push(pt('mane','head',[shell(3,{r:[.22,.23,.17],p:[0,.72,-.07],keep:u=>!(u[2]>-.05&&Math.abs(u[0])<.66&&u[1]>-.78&&u[1]<.72),col:(u,h)=>vary(mix(C(R.mane||'#8a5a30'),dk(C(R.mane||'#8a5a30'),.4),h3(...u.map(v=>Math.round(v*9)))),h,.2),j:.03,d:u=>{ const k=1+.28*Math.abs(Math.sin(Math.atan2(u[0],u[1])*9+u[2]*4)); return [u[0]*k,u[1]*k-.2*Math.max(0,-u[1]),u[2]]; }})],1));
  if(K.shag)L.push(pt('shag','head',[shell(3,{r:[.17,.2,.16],p:[0,.71,-.01],keep:u=>!(u[2]>.55&&Math.abs(u[0])<.5&&u[1]>-.25&&u[1]<.3),col:(u,h)=>vary(WHITE,h,.12),j:.03,d:u=>[u[0]*(1+.2*Math.max(0,-u[1])),u[1]-.7*Math.max(0,-u[1])*(1+.4*Math.abs(Math.sin(u[0]*14+u[2]*9))),u[2]]})],2));
  if(K.goatee)L.push(pt('goatee','head',[shell(2,{r:[.05,.1,.04],p:[0,.6,.13],col:fur(C(R.f2||'#c8c0b0'),.18),j:.012,d:u=>[u[0]*(1-.6*Math.max(0,-u[1])),u[1]-.5*Math.max(0,-u[1]),u[2]]})],3));
  if(K.trunk){ const n=onHead([0,-.2,1]); L.push(pt('trunk','head',[S(tube([[n[0],n[1]+.02,n[2]-.04],[n[0],n[1]-.03,n[2]+.03],[n[0],n[1]-.12,n[2]+.05],[n[0]+.01,n[1]-.2,n[2]+.04],[n[0]+.02,n[1]-.26,n[2]+.07]],[.045,.04,.032,.024,.02],10,12,{d:(p,u,v)=>[p[0],p[1]+.003*Math.sin(v*80),p[2]]}),(x,y,z,h)=>vary(Math.sin(y*260)>.6?dk(f,.15):f,h,.08))],3)); }
  if(K.rhorns||K.shorns||K.bhorns)L.push(pt('horns','head',pair(sx=>{ let path;
      if(K.rhorns){ const a=onHead([sx*.35,.8,.1]); path=[]; for(let i=0;i<=10;i++){ const t=i/10, th=t*Math.PI*1.6, rr=.1*(1-t*.45); path.push([a[0]+sx*(.03+Math.sin(th)*rr*.6+t*.06),a[1]+Math.cos(th)*rr*.7-rr*.7+.04*t,a[2]-Math.sin(th*.5)*rr*.9+.05*Math.sin(th)]); } return S(tube(path,path.map((_,i)=>.032*(1-i/11)+.004),8,20,{d:(p,u,v)=>{ const k=1+.12*Math.abs(Math.sin(v*90)); return p; }}),(x,y,z,h)=>vary(Math.sin((x+y+z)*240)>.5?C('#a8946a'):C('#c8b48a'),h,.1)); }
      if(K.shorns){ const a=onHead([sx*.3,.9,.0]); path=[a,[a[0]+sx*.02,a[1]+.08,a[2]-.02],[a[0]+sx*.01,a[1]+.18,a[2]-.06],[a[0]-sx*.02,a[1]+.27,a[2]-.06]]; return S(tube(path,[.022,.018,.012,0],8,12),(x,y,z,h)=>vary(C('#1a1616'),h,.2)); }
      const a=onHead([sx*.55,.62,-.05]); path=[a,[a[0]+sx*.07,a[1]+.0,a[2]+.01],[a[0]+sx*.14,a[1]+.04,a[2]+.03],[a[0]+sx*.18,a[1]+.1,a[2]+.04]]; return S(tube(path,[.026,.022,.015,0],8,12),(x,y,z,h)=>vary(y>a[1]+.07?C('#5a4a3a'):C('#d8ccb0'),h,.1)); }),3));
  if(R.mask==='metal'){ const E=[]; E.push(shell(2,{r:[.1,.11,.06],p:[0,.73,.085],keep:u=>u[2]>-.1,col:(u,h)=>gss(Math.abs(u[0]),u[1],.42,.15,.12,.12)>.5?BLACK:vary([.66,.68,.7],h,.18),d:u=>[u[0],u[1],u[2]*.6]})); for(let i=0;i<10;i++){ const a=onHead([(i%5-2)*.18,i<5?.45:-.1,.95]); E.push(shell(0,{r:[.008,.008,.008],p:[a[0],a[1],a[2]+.03],col:[.4,.4,.42]})); } L.push(pt('mask','head',E,5)); }
  if(R.patch){ const s0=onHead([EYE[0],EYE[1],EYE[2]]); L.push(pt('patch','head',[S(at(new THREE.CircleGeometry(EYE[3]*1.4,12),[s0[0],s0[1],s0[2]+.012],[0,20,0]),BLACK), S(tube([onHead([-1,EYE[1]+.25,0]),onHead([0,EYE[1]+.3,1]).map((v,i)=>i===2?v+.02:v),onHead([1,EYE[1]-.05,0])],[.005,.005,.005],4,10),BLACK)],5)); }
  if(!R._v2&&R.beads)L.push(pt('beads','hips',Array.from({length:22},(_,i)=>{ const a=i/22*Math.PI*1.2-Math.PI*.6; return shell(1,{r:[.014,.012,.014],p:[Math.sin(a)*.1*b,.6-Math.cos(a)*.09,.08*b+Math.cos(a)*.035],col:(u,h)=>vary(i%3?C('#a86a3a'):C('#7a4a2a'),h,.2)}); }),3));
  if(K.quills)L.push(pt('quills','head',quills(R.quill?C(R.quill):f,hc,.11,30,.085,R.k.length),3));
  // ears: a cup turned out from the skull, the inside paler
  if(K.ear){ const E=K.ear, inC=['mouse','rat','rabbit','rhino','hedgehog'].includes(R.sp)?[.86,.6,.56]:R.sp==='hyena'?dk(f,.5):R.sp==='redpanda'||R.sp==='raccoon'?WHITE:R.sp==='panda'?f2:lt(f,.3), ouC=R.sp==='panda'?f2:R.sp==='batear'?[.32,.29,.3]:f;
    for(const sx of [-1,1]){ const base=onHead([sx*E.dir[0],E.dir[1],E.dir[2]]), s=E.s, ln=E.len||1, k=E.k;
      const d=k==='round'?u=>[u[0],u[1],u[2]*(E.thick?.6:.22)-(u[2]>0?.35*(1-u[0]*u[0]-u[1]*u[1]):0)]:u=>{ const t=(u[1]+1)/2, w=(1-.85*t)*(E.w||1); return [u[0]*w,u[1]*(k==='long'?2.6:k==='tuft'?1:1.3*ln),u[2]*.22*w-(u[2]>0?.25*(1-u[0]*u[0])*(1-t):0)]; };
      const off=k==='round'?.7:k==='long'?2.2:1.0*ln, g=shell(2,{d,r:[s,s,s],p:[0,s*off,0],rot:[k==='round'?-10:-14,sx*(k==='tuft'?0:-12),sx*-E.tilt],col:(u,h)=>u[2]>.1&&Math.hypot(u[0],(u[1]-.1))<.7&&k!=='tuft'?vary(inC,h,.1):vary(k==='tuft'?(R.stars?f:f):ouC,h,.12),j:.002});
      for(let i=0;i<g.P.length;i+=3){ g.P[i]+=base[0]; g.P[i+1]+=base[1]-s*.15; g.P[i+2]+=base[2]; }
      const of=[g]; if(E.tuft)of.push(S(at(new THREE.ConeGeometry(.007,.06,4),[base[0]+sx*.012,base[1]+s*2.2,base[2]],[0,0,sx*-E.tilt]),BLACK));
      L.push(pt('ear '+sx,sx<0?'earL':'earR',of,3)); } }

  if(!R._v2){
  // the body
  const sk=R.sp==='frog'||R.sp==='rhino'||R.sp==='shark'||R.sp==='toucan'?fur(f,.1):R.sp==='pangolin'?((u,h)=>MARK.scales(u,h)):R.stars?((u,h)=>h>.92?[.95,.92,.8]:vary(f,h)):fur(f), lim=R.sp==='panda'?f2:f;
  const hand=['mouse','rat','rabbit','hedgehog'].includes(R.sp)?PINK:R.sp==='owl'||R.sp==='barnowl'?[.62,.58,.52]:R.sp==='panda'?f2:R.sp==='frog'?lt(f,.1):dk(lim,.1);
  if(cat){ const seg=[[0,.56,-.05,.1],[0,.67,-.03,.1],[0,.78,0,.095],[0,.5,-.18,.088],[0,.43,-.3,.078],[0,.33,-.36,.068],[0,.21,-.37,.058]];
    L.push(pt('mushroom','root',[S(lathe([[.07,0],[.08,.2],[.07,.38],[.1,.43]],14,6),(x,y,z,h)=>vary([.9,.88,.82],h,.08)), shell(3,{r:[.34,.09,.34],p:[0,.47,0],d:u=>[u[0],u[1]<0?u[1]*.4:u[1],u[2]],col:(u,h)=>u[1]<-.1?vary([.78,.68,.52],h,.06):h>.9?[.95,.9,.8]:vary([.74,.38,.16],h,.08)})],0),
      pt('body','hips',seg.map(([x,y,z,r])=>shell(2,{r:[r,r*.88,r],p:[x,y,z],col:(u,h)=>Math.abs(u[1])<.18?vary(dk(f,.3),h):vary(f,h,.12),j:.003})),1),
      ...pair(sx=>pt('arm '+sx,sx<0?'armL':'armR',[S(tube([[sx*.08,.73,.04],[sx*.09,.67,.1],[sx*.06,.62,.14]],[.03,.026,.024],8,5),fur(f))],2)),
      pt('hookah','root',[S(at(lathe([[.05,0],[.06,.04],[.03,.08],[.015,.14],[.022,.16],[0,.17]],12,8),[.13,.52,.17]),(x,y,z,h)=>y>.6?vary([.86,.66,.3],h,.06):vary([.86,.4,.18],h,.06)),
        S(tube([[.13,.68,.17],[.13,.74,.2],[.08,.78,.2],[.03,.86,.15]],[.005,.005,.005,.005],5,8),[.62,.5,.3])],2)); }
  else{
    L.push(pt('body','hips',[shell(2,{r:[.135*b,.165,.118*b],p:[0,.45,0],d:u=>{ const w=1+.14*Math.max(0,-u[1])-.28*Math.max(0,u[1]-.5); return [u[0]*w,u[1],u[2]*w+.12*gss(u[0],u[1],0,-.2,.5,.4)*Math.max(0,u[2])]; },col:(u,h)=>gss(u[0],u[1],0,-.1,.4,.45)*sm(.2,.7,u[2])>.4?vary(f2===f?lt(f,.2):f2,h,.12):sk(u,h),j:.003})],0));
    for(const sx of [-1,1]){ const s=sx<0?'L':'R', sh=[sx*.145*b,.565,0], el=[sx*.18*b,.465,-.01], wr=[sx*.192*b,.375,.035];
      L.push(pt('arm '+s,'arm'+s,[S(tube([sh,el,wr],R.coat==='armour'?[.042,.036,.032]:[.038,.032,.027],8,6),R.coat&&R.coat!=='armour'?cloth(C(R.cc)):R.coat==='armour'?((x,y,z,h)=>vary(C(R.cc),h,.12)):(x,y,z,h)=>vary(lim,h))],1));
      if(R.coat==='robe')L.push(pt('sleeve '+s,'arm'+s,[S(tube([[sx*.15*b,.55,0],[sx*.18*b,.46,-.01],[sx*.2*b,.385,.035]],[.046,.052,.066],10,5,{d:(p,u,v)=>[p[0],p[1]-(v>.9?(h3(Math.round(u*40),3,1)-.5)*.02:0),p[2]]}),cloth(C(R.cc)))],2));
      L.push(pt('paw '+s,'arm'+s,[shell(1,{r:[.026,.032,.026],p:[wr[0],wr[1]-.022,wr[2]+.005],col:fur(hand,.08),d:u=>[u[0],u[1],u[2]+.25*Math.max(0,-u[1])*Math.max(0,u[2])]}), ...[-1,0,1].map(k=>S(tube([[wr[0]+k*.011,wr[1]-.04,wr[2]+.012],[wr[0]+k*.012,wr[1]-.055,wr[2]+.022],[wr[0]+k*.011,wr[1]-.06,wr[2]+.03]],[.006,.005,.003],5,3),fur(hand,.05))) ,S(tube([[wr[0]-sx*.02,wr[1]-.025,wr[2]+.02],[wr[0]-sx*.026,wr[1]-.035,wr[2]+.035]],[.007,.004],5,3),fur(hand,.05))],2));
      const fx=sx*.088*b, legC=R.sp==='panda'?f2:f;
      L.push(pt('leg '+s,'leg'+s,[shell(2,{r:[.064*b,.115,.076],p:[fx,.18,0],col:(u,h)=>vary(legC,h,.12),j:.002})],0));
      L.push(pt('foot '+s,'leg'+s,[shell(2,{r:[.048*Math.sqrt(b),.032,.078],p:[fx,.035,.05],d:u=>[u[0]*(1+.2*Math.max(0,u[2])),u[1]*(u[1]<0?.5:1),u[2]],col:(u,h)=>vary(R.sp==='frog'?f:dk(legC,.1),h,.12),j:.002}), ...(['frog','hedgehog','rat','mouse','pangolin','rhino','hyena'].includes(R.sp)?[-1,0,1].map(k=>S(at(new THREE.ConeGeometry(.007,.022,4),[fx+k*.018,.022,.13],[90,0,0]),R.sp==='frog'?f:[.8,.76,.68])):[])],1)); }
    if(R.sp==='hedgehog')L.push(pt('back quills','hips',quills(R.quill?C(R.quill):f,[0,.47,-.03],.13,44,.1,R.k.length+3),2));
    if(R.sp==='pangolin')L.push(pt('plates','hips',[0,1,2,3,4].map(i=>shell(2,{r:[.15*b-i*.008,.05,.13*b],p:[0,.62-i*.07,-.015],keep:u=>u[1]>-.2,d:u=>[u[0],u[1]-.5*(u[0]*u[0]+u[2]*u[2]),u[2]],col:(u,h)=>mix(dk(f,.25),lt(f,.12),(u[1]+1)/2*(.6+.4*h)),j:.002})),2));
    if(K.tail){ const T=K.tail==='cat'?[[[0,.3,-.1],[0,.24,-.22],[0,.3,-.36],[0,.44,-.42]],[.022,.02,.018,.014]]:K.tail==='fox'?[[[0,.3,-.1],[0,.2,-.24],[0,.16,-.4],[0,.2,-.54]],[.04,.07,.07,.02]]:K.tail==='lizard'?[[[0,.3,-.08],[0,.18,-.25],[0,.08,-.45],[.05,.04,-.62]],[.06,.045,.025,.005]]:K.tail==='thin'?[[[0,.3,-.1],[0,.2,-.26],[0,.16,-.42],[0,.24,-.56],[0,.36,-.6]],[.016,.013,.01,.007,.004]]:K.tail==='ringed'?[[[0,.3,-.1],[0,.24,-.24],[0,.18,-.38],[0,.12,-.5]],[.045,.06,.055,.03]]:K.tail==='pangolin'?[[[0,.28,-.1],[0,.16,-.28],[0,.07,-.46],[0,.03,-.62]],[.08,.065,.045,.015]]:[[[0,.3,-.1],[0,.26,-.18],[0,.22,-.22]],[.03,.026,.012]];
      const tc=K.tail==='fox'?((x,y,z,hh)=>z<-.48?vary(WHITE,hh):vary(f,hh)):K.tail==='lizard'?((x,y,z,hh)=>vary(Math.sin(z*120)>.5?dk(f,.3):f,hh,.1)):K.tail==='ringed'?((x,y,z,h)=>Math.sin(z*90)>0?vary(dk(f,R.sp==='raccoon'?.75:.45),h):vary(R.sp==='raccoon'?lt(f,.15):f,h)):K.tail==='thin'?((x,y,z,h)=>vary(PINK,h,.06)):K.tail==='pangolin'?((x,y,z,h)=>mix(dk(f,.3),lt(f,.1),(Math.sin(z*70)+1)/2)):((x,y,z,h)=>vary(f,h));
      const g=S(tube(T[0],T[1],8,12),tc,K.tail==='ringed'?.008:0), n=T[0].length; L.push(pt('tail','tail1',[g],1)); } }

  if(K.shellback)L.push(pt('shell','hips',[shell(3,{r:[.19*b,.21,.14*b],p:[0,.46,-.09],keep:u=>u[2]<.2,d:u=>[u[0],u[1],u[2]-.15*Math.max(0,-u[2])],col:(u,h)=>{ const a=Math.atan2(u[0],u[1]), r2=Math.hypot(u[0],u[1]); const k=Math.sin(a*6)*Math.sin(r2*12); return vary(k>.6?dk(C(R.shell||'#5a7a4a'),.4):C(R.shell||'#5a7a4a'),h,.15); },j:.006})],2));
  if(R.pack){ const pc=R.pack, base=[0,.48,-.16*b], B=[]; B.push(shell(2,{r:[.13*b,.14,.09],p:base,col:(u,h)=>vary(C('#5a4630'),h,.25),j:.01}), S(tube([[.1*b,.6,.06],[.12*b,.62,-.08],[.11*b,.4,-.16]],[.01,.01,.01],4,6),LEATH), S(tube([[-.1*b,.6,.06],[-.12*b,.62,-.08],[-.11*b,.4,-.16]],[.01,.01,.01],4,6),LEATH));
    const heap=(n,fn)=>{ for(let i=0;i<n;i++){ const a=h3(i,7,R.k.length)*PI*2, rr=.1*Math.sqrt(h3(i,9,3)), y=.6+.18*h3(i,5,1)*(1-rr*4); B.push(fn([base[0]+Math.cos(a)*rr*b,y,base[2]-.02+Math.sin(a)*rr*.7],i)); } };
    if(pc==='skulls')heap(14,(p,i)=>shell(2,{r:[.05,.047,.055],p,rot:[0,h3(i,1,1)*360,0],col:(u,h)=>gss(Math.abs(u[0]),u[1],.38,.08,.18,.18)*sm(.3,.7,u[2])>.4?BLACK:vary(BONE,h,.12)}));
    if(pc==='gems'||pc==='crystals')heap(18,(p,i)=>S(at(new THREE.OctahedronGeometry(.04+.02*h3(i,3,3)),p,[h3(i,1,2)*90,h3(i,2,1)*90,0],[1,1.6,1]),(x,y,z,h)=>lt(pc==='gems'?[[.5,.2,.7],[.2,.5,.8],[.8,.3,.3],[.3,.7,.5],[.9,.7,.2]][i%5]:[.7,.8,.9],.15+.3*h)));
    if(pc==='rocks')heap(16,(p,i)=>shell(1,{r:[.05,.04,.045],p,col:(u,h)=>vary([[.4,.6,.7],[.7,.4,.6],[.5,.5,.48],[.8,.6,.4],[.3,.4,.6]][i%5],h,.3),j:.01}));
    if(pc==='fish')heap(9,(p,i)=>shell(2,{r:[.04,.032,.1],p,rot:[0,(h3(i,1,1)-.5)*90,(h3(i,2,2)-.5)*60],col:(u,h)=>u[2]<-.75?C('#e88a50'):u[1]>.4?C('#c84a20'):vary(C('#f08a3a'),h,.15),d:u=>[u[0]*(1-.5*Math.max(0,-u[2])),u[1],u[2]]}));
    if(pc==='potions')heap(8,(p,i)=>S(at(lathe([[.0,0],[.025,.005],[.028,.04],[.012,.06],[.012,.08]],8,5),p),(x,y,z,h)=>y>p[1]+.055?C('#8a6a4a'):lt([[.3,.8,.4],[.9,.3,.2],[.4,.4,.95],[.9,.8,.2]][i%4],.2)));
    if(pc==='bag')B.push(shell(2,{r:[.1*b,.08,.07],p:[0,.66,-.17*b],col:(u,h)=>vary(C('#6a5a3a'),h,.25),j:.012}));
    L.push(pt('pack','hips',B,2)); }
  if(R.shieldback)L.push(pt('shieldback','hips',[S(at(lathe([[0,.012],[.06,.01],[.12,.004],[.13,0]],18,4),[0,.48,-.16*b],[90,0,0]),(x,y,z,h)=>{ const r2=Math.hypot(x,y-.48); return vary(r2<.03?[.5,.48,.44]:Math.sin(r2*140)>.7?[.42,.4,.36]:C(R.shieldback),h,.15); })],2));
  // the coat
  const cc=R.cc&&C(R.cc), c2=R.c2?C(R.c2):cc&&dk(cc);
  const folds=(n,a,ragg)=>(p,u,v)=>{ const t=u*PI*2, fo=a*v*(Math.sin(t*n+2*Math.sin(t*3))+.4*Math.sin(t*n*2.3)), r=Math.hypot(p[0],p[2])||1, k=(r+fo)/r; return [p[0]*k,p[1]+(v>.92&&ragg?(h3(Math.round(u*60),7,3)-.5)*ragg:0),p[2]*k]; };
  const clothF=(c,dirt=.25)=>(x,y,z,h)=>{ const g=sm(.22,0,y)*dirt; return vary(mix(c,dk(c,.5),g),h,.14); };
  if(R.coat==='robe'&&!cat)L.push(pt('robe','hips',[S(lathe([[.125*b,.5],[.14*b,.4],[.16*b,.28],[.19*b,.14],[.215*b,.02]],18,10,{d:folds(9,.014,.035)}),clothF(cc)), shell(2,{r:[.142*b,.155,.126*b],p:[0,.46,0],col:(u,h)=>Math.abs(u[0]+u[1]*.2)<.06&&u[2]>.5?vary(c2,h,.1):vary(cc,h,.12),j:.004}), S(at(new THREE.TorusGeometry(.13*b,.012,5,16),[0,.365,0],[90,0,0],[1,1.15,1]),c2)],2));
  if(R.coat==='tunic')L.push(pt('tunic','hips',[shell(2,{r:[.145*b,.16,.128*b],p:[0,.45,0],col:(u,h)=>vary(cc,h,.12),j:.004}), S(lathe([[.125*b,.38],[.14*b,.32],[.165*b,.24]],16,5,{d:folds(7,.01,.025)}),clothF(cc,.1)), S(at(new THREE.TorusGeometry(.13*b,.013,5,16),[0,.37,0],[90,0,0]),c2||LEATH), S(at(new THREE.BoxGeometry(.03,.026,.01),[0,.37,.13*b]),GOLD)],2));
  if(R.coat==='armour'){ const m=(x,y,z,h)=>vary(cc,h,.16); L.push(pt('armour','hips',[shell(2,{r:[.148*b,.15,.132*b],p:[0,.47,.012],d:u=>[u[0],u[1],u[2]+.08*Math.max(0,u[2])*gss(u[0],u[1],0,.1,.3,.5)],col:(u,h)=>Math.abs(u[0])<.05&&u[2]>.3?vary(lt(cc,.25),h,.08):vary(cc,h,.18)}),
    ...pair(sx=>shell(2,{r:[.075*b,.05,.07],p:[sx*.15*b,.575,0],keep:u=>u[1]>-.3,col:(u,h)=>vary(c2,h,.16)})), ...pair(sx=>shell(2,{r:[.068*b,.045,.064],p:[sx*.16*b,.545,0],keep:u=>u[1]>-.2,col:m})),
    S(lathe([[.13*b,.38],[.15*b,.31],[.165*b,.25]],14,4,{d:(p,u,v)=>[p[0],p[1]+(v>.9?(Math.floor(u*14)%2)*.01:0),p[2]]}),(x,y,z,h)=>vary(dk(cc,.15),h,.2)), S(at(new THREE.TorusGeometry(.134*b,.014,5,16),[0,.375,0],[90,0,0]),LEATH),
    S(at(new THREE.TorusGeometry(.07,.016,5,14),[0,.62,0],[90,0,0]),c2)],2)); }
  if(R.sash)L.push(pt('sash','hips',[S(at(new THREE.TorusGeometry(.128*b,.015,5,16),[0,.37,0],[90,0,0]),cloth(C(R.sash))), S(tube([[.1*b,.56,.08],[.03,.47,.13*b],[-.08*b,.38,.1]],[.014,.016,.014],5,6,{sx:1,sz:.35}),cloth(C(R.sash)))],3));
  if(R.cape){ const k=C(R.cape); L.push(pt('cape','cape',[S(lathe([[.1*b,.62],[.15*b,.5],[.2*b,.28],[.24*b,.04]],20,10,{d:folds(8,.016,.05),keep:(u)=>Math.abs(u-.5)<.23}),R.stars?((x,y,z,h)=>h>.9?[.95,.9,.75]:vary(k,h,.1)):clothF(k,.3)), shell(2,{r:[.15*b,.04,.13*b],p:[0,.6,-.005],col:(u,h)=>vary(k,h,.12),j:.006})],2)); }
  }
  if(R.hood){ const k=C(R.hood); L.push(pt('hood','head',[shell(2,{r:[.158,.16,.15],p:[0,.755,-.01],keep:u=>!(u[2]>.25&&u[1]<.62&&u[1]>-.8&&Math.abs(u[0])<.72),d:u=>[u[0],u[1]+.12*Math.max(0,u[1]-.6)*(u[2]<0?1:0),u[2]-.06*Math.max(0,-u[2])],col:(u,h)=>vary(Math.abs(u[0])>.6&&u[2]>.2?dk(k,.25):k,h,.12),j:.006}),
    shell(2,{r:[.16*b,.06,.14*b],p:[0,.63,-.005],col:(u,h)=>vary(k,h,.12),j:.008})],5)); }
  if(R.hat){ const k=C(R.hc); const H={
      helm:()=>[shell(2,{r:[.148,.15,.152],p:[0,.765,-.005],keep:u=>u[1]>-.05||u[2]<-.3||(Math.abs(u[0])>.7&&u[1]>-.55),col:(u,h)=>Math.abs(u[0])<.06&&u[1]>0?vary(lt(k,.2),h,.08):vary(k,h,.16)}), S(at(new THREE.TorusGeometry(.148,.01,5,18),[0,.758,0],[90,0,0]),dk(k,.2)), S(at(new THREE.BoxGeometry(.016,.075,.016),[0,.745,.15]),dk(k,.15))],
      straw:()=>[S(at(lathe([[0,.13],[.08,.1],[.18,.04],[.27,0]],20,6),[0,R.sp==='frog'?.875:.825,0]),(x,y,z,h)=>vary(Math.sin(Math.atan2(x,z)*30+Math.hypot(x,z)*80)>0?k:dk(k,.18),h,.08))],
      wizard:()=>[S(at(lathe([[.22,0],[.13,.01],[.1,.06],[.06,.17],[.02,.27],[0,.3]],18,10,{d:(p,u,v)=>[p[0]-.05*v*v,p[1],p[2]-.04*v*v*v]}),[0,.835,0]),(x,y,z,h)=>vary(k,h,.12)), S(at(new THREE.TorusGeometry(.105,.012,5,16),[0,.85,0],[90,0,0]),dk(k,.3))],
      circlet:()=>[S(at(new THREE.TorusGeometry(.128,.012,5,18),[0,.81,0],[90,0,0]),k), S(at(new THREE.OctahedronGeometry(.02),[0,.82,.128],null,[1,1.4,.5]),[.5,.6,.95])],
      crown:()=>[S(at(new THREE.TorusGeometry(.105,.011,5,16),[0,.83,0],[90,0,0]),k), ...[0,1,2,3,4,5,6].map(i=>S(at(new THREE.ConeGeometry(.012,.045,4),[Math.sin(i*.9)*.105,.85,Math.cos(i*.9)*.105]),k)), S(at(new THREE.OctahedronGeometry(.016),[0,.84,.11]),[.7,.3,.8])]};
    L.push(pt('hat','head',H[R.hat](),5)); }
  if(R.eyes==='goggles'){ const E=[]; for(const sx of [-1,1]){ const s=onHead([sx*EYE[0],EYE[1],EYE[2]]); E.push(S(at(new THREE.TorusGeometry(.03,.009,6,14),[s[0],s[1],s[2]+.004],[0,sx*20,0]),[.6,.36,.2])); E.push(S(at(new THREE.CircleGeometry(.029,12),[s[0],s[1],s[2]+.006],[0,sx*20,0]),R.k==='gd_captain'?[.06,.06,.08]:[.12,.1,.09])); }
    E.push(S(tube([onHead([-.95,EYE[1],0]),onHead([0,EYE[1]+.05,-1]),onHead([.95,EYE[1],0])].map(p=>[p[0]*1.06,p[1],p[2]*1.06]),[.006,.006,.006],4,10),[.36,.22,.14])); L.push(pt('goggles','head',E,5)); }

  if(!R._v2){
  // the weapon, held as it is used
  const H=[.192*b,.33,.05], HL=[-.192*b,.33,.05], W=R.wc?C(R.wc):null, glow=R.w==='glowsword';
  const blade=(len,w,col)=>{ const sh=new THREE.Shape(); sh.moveTo(-w,0); sh.lineTo(w,0); sh.lineTo(w*.92,len*.82); sh.lineTo(0,len); sh.lineTo(-w*.92,len*.82); sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:.007,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}); g.translate(0,0,-.0035); g.rotateX(PI/2); g.rotateY(PI/2); g.translate(H[0],H[1],H[2]+.07);
    return [S(g,(x,y,z,hh)=>{ const e=Math.abs(y-H[1]); return glow?lt(col,e<w*.3?.55:.15):vary(e>w*.6?lt(col,.25):e<w*.18?dk(col,.2):col,hh,.06); }),
      S(tube([[H[0],H[1]-.055,H[2]+.065],[H[0],H[1]-.01,H[2]+.075],[H[0],H[1]+.01,H[2]+.075],[H[0],H[1]+.055,H[2]+.065]],[.007,.009,.009,.007],6,6),GOLD),
      S(tube([[H[0],H[1],H[2]-.03],[H[0],H[1],H[2]+.07]],[.011,.011],7,6),(x,y,z,hh)=>Math.sin(z*260)>0?LEATH:dk(LEATH,.35)), shell(1,{r:[.016,.016,.016],p:[H[0],H[1],H[2]-.04],col:GOLD})]; };
  const pole=(y0,y1,col,r=.012,kn=0)=>S(tube([[H[0],y0,H[2]],[H[0]+.006,(y0+y1)/2,H[2]+.01],[H[0],y1,H[2]+.02]],[r*1.05,r,r*.9],7,10,{d:kn?(p,u,v)=>{ const k=1+kn*Math.sin(v*31+Math.sin(u*6.28)*2)*.5; return [H[0]+(p[0]-H[0])*k+kn*.01*Math.sin(v*13),p[1],H[2]+(p[2]-H[2])*k]; }:null}),(x,y,z,hh)=>vary(col,hh,.18));
  const WEAP={
    sword:()=>blade(.3,.016,W||[.82,.84,.88]), glowsword:()=>blade(.32,.019,W), greatsword:()=>blade(.46,.022,[.8,.82,.86]),
    spear:()=>[pole(.0,1.1,WOOD,.011), S(at(lathe([[0,0],[.022,.05],[.018,.1],[0,.15]],8,8,{sx:1,sz:.25}),[H[0],1.1,H[2]+.02]),(x,y,z,hh)=>vary([.55,.57,.6],hh,.12)), S(at(new THREE.CylinderGeometry(.014,.014,.03,8),[H[0],1.1,H[2]+.02]),dk(STEEL,.3))],
    staff:()=>[pole(.0,1.0,W||WOOD,.015,1), S(tube([[H[0],1.0,H[2]+.02],[H[0]+.02,1.06,H[2]+.02],[H[0]+.05,1.06,H[2]+.02],[H[0]+.055,1.02,H[2]+.02]],[.015,.014,.012,.008],7,8),(x,y,z,hh)=>vary(W||WOOD,hh,.18))],
    orbstaff:()=>[pole(.0,1.0,[.38,.34,.3],.013,1), ...[0,1,2].map(i=>S(tube([[H[0],.98,H[2]+.02],[H[0]+Math.sin(i*2.1)*.05,1.04,H[2]+.02+Math.cos(i*2.1)*.05],[H[0]+Math.sin(i*2.1)*.035,1.11,H[2]+.02+Math.cos(i*2.1)*.035]],[.007,.006,.004],5,6),[.42,.38,.32])), shell(2,{r:[.045,.045,.045],p:[H[0],1.06,H[2]+.02],col:(u,hh)=>lt(W,.15+.45*Math.max(0,u[1]+u[2])/2)})],
    mushstaff:()=>[pole(.0,.94,W||WOOD,.012,1), ...[[0,1.0,0,.034],[.04,.96,.02,.026],[-.035,.98,-.02,.028],[.02,1.035,-.03,.02]].map(([dx,y,dz,r])=>S(at(lathe([[0,.02],[r*.8,.018],[r,.004],[r*.2,0]],12,4),[H[0]+dx,y,H[2]+dz]),(x,yy,z,hh)=>vary(yy>y+.01?[.82,.72,.56]:[.92,.88,.8],hh,.08)))],
    starwand:()=>{ const st=new THREE.Shape(); for(let i=0;i<10;i++){ const r=i%2?.02:.05, a=i/10*PI*2; i?st.lineTo(Math.sin(a)*r,Math.cos(a)*r):st.moveTo(Math.sin(a)*r,Math.cos(a)*r); } st.closePath();
      return [pole(.22,.86,[.3,.34,.42],.008), S(at(new THREE.ExtrudeGeometry(st,{depth:.012,bevelEnabled:false}),[H[0],.92,H[2]+.015]),(x,y,z,hh)=>vary(W,hh,.08))]; },
    lantern:()=>[pole(.0,1.0,WOOD,.012,.6), S(tube([[H[0],1.0,H[2]+.02],[H[0],1.04,H[2]+.06],[H[0],1.0,H[2]+.11]],[.006,.006,.006],5,6),[.3,.3,.32]), S(at(new THREE.CylinderGeometry(.024,.03,.06,6),[H[0],.95,H[2]+.11]),(x,y,z,hh)=>lt(W,.3)), S(at(new THREE.ConeGeometry(.035,.03,6),[H[0],.995,H[2]+.11]),[.28,.28,.3]), ...[0,1,2,3,4,5].map(i=>S(at(new THREE.BoxGeometry(.004,.06,.004),[H[0]+Math.sin(i*1.05)*.028,.95,H[2]+.11+Math.cos(i*1.05)*.028]),[.25,.25,.27]))],
    axe:()=>{ const sh=new THREE.Shape(); sh.moveTo(0,-.03); sh.lineTo(.04,-.04); sh.quadraticCurveTo(.1,-.07,.12,-.09); sh.quadraticCurveTo(.135,0,.12,.07); sh.quadraticCurveTo(.08,.05,.04,.035); sh.lineTo(0,.03); sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}); g.translate(H[0]+.01,.82,H[2]+.014);
      return [pole(.05,.9,WOOD,.013), S(g,(x,y,z,hh)=>vary(x>H[0]+.11?[.82,.84,.88]:[.32,.34,.38],hh,.12))]; },
    mace:()=>[pole(.18,.66,WOOD,.015), shell(1,{r:[.05,.05,.05],p:[H[0],.7,H[2]+.02],col:[.36,.38,.36]}), ...[0,1,2,3,4,5,6,7].map(i=>{ const a=i*PI/4; return S(at(new THREE.ConeGeometry(.012,.05,4),[H[0]+Math.sin(a)*.05,.7+(i%2?.025:-.02),H[2]+.02+Math.cos(a)*.05],[Math.cos(a)*90,0,-Math.sin(a)*90]),[.6,.62,.6]); })],
    bow:()=>{ const pts=[], R0=.3; for(let i=0;i<=8;i++){ const a=(i/8-.5)*PI*.8; pts.push([HL[0],HL[1]+Math.sin(a)*R0,HL[2]+Math.cos(a)*R0-R0+.01]); }
      return [S(tube(pts,[.006,.01,.012,.014,.016,.014,.012,.01,.006],6,16),(x,y,z,hh)=>Math.abs(y-HL[1])<.03?LEATH:vary([.5,.28,.15],hh,.12)), S(tube([pts[0],[HL[0],HL[1],HL[2]-R0*.32],pts[8]],[.002,.002,.002],3,4),[.85,.82,.72])]; },
    mushroom:()=>[S(tube([[HL[0],HL[1],HL[2]],[HL[0],HL[1]+.12,HL[2]+.02],[HL[0],HL[1]+.22,HL[2]+.03]],[.015,.014,.012],7,6),[.92,.88,.8]), S(at(lathe([[0,.05],[.06,.045],[.11,.02],[.13,0],[.1,-.006],[0,0]],18,8),[HL[0],HL[1]+.22,HL[2]+.03]),(x,y,z,hh)=>y<HL[1]+.225?vary([.86,.74,.58],hh,.06):vary(W||[.86,.66,.46],hh,.08))],
    pipe:()=>[],
    crystalstaff:()=>[pole(.0,.98,W||[.3,.24,.2],.014,1.2), S(at(new THREE.OctahedronGeometry(.05),[H[0],1.06,H[2]+.02],[0,30,0],[1,1.6,1]),(x,y,z,hh)=>lt(C(R.gem||'#9ad0ff'),.15+.4*hh)), ...[0,1,2].map(i=>S(tube([[H[0],.96,H[2]+.02],[H[0]+Math.sin(i*2.1)*.04,1.02,H[2]+.02+Math.cos(i*2.1)*.04],[H[0]+Math.sin(i*2.1)*.02,1.08,H[2]+.02+Math.cos(i*2.1)*.02]],[.008,.007,.004],5,6),W||[.3,.24,.2]))],
    heartstaff:()=>{ const hs=new THREE.Shape(); hs.moveTo(0,-.05); hs.bezierCurveTo(-.08,0,-.05,.06,0,.03); hs.bezierCurveTo(.05,.06,.08,0,0,-.05); return [pole(.0,1.02,[.12,.1,.1],.01), S(at(new THREE.ExtrudeGeometry(hs,{depth:.02,bevelEnabled:false}),[H[0],1.08,H[2]+.01]),C('#ff8a3a')), ...[0,1,2,3].map(i=>S(at(new THREE.ConeGeometry(.012,.06,4),[H[0]+(i-1.5)*.03,1.15,H[2]+.02],[0,0,(i-1.5)*.4]),[.12,.1,.1]))]; },
    rod:()=>[S(tube([[H[0],.0,H[2]],[H[0]+.01,.6,H[2]+.02],[H[0]+.04,1.15,H[2]+.06],[H[0]+.09,1.35,H[2]+.12]],[.012,.01,.007,.004],6,12),(x,y,z,hh)=>vary([.62,.5,.3],hh,.2)), S(tube([[H[0]+.09,1.35,H[2]+.12],[H[0]+.12,1.0,H[2]+.14],[H[0]+.12,.7,H[2]+.14]],[.002,.002,.002],3,6),[.8,.8,.75])],
    bamboo:()=>[S(tube([[H[0],.0,H[2]],[H[0],.6,H[2]+.01],[H[0],1.15,H[2]+.02]],[.017,.016,.015],8,16,{d:(p,u,v)=>{ const k=Math.abs(Math.sin(v*PI*7))<.08?1.18:1; return [H[0]+(p[0]-H[0])*k,p[1],H[2]+(p[2]-H[2])*k]; }}),(x,y,z,hh)=>vary(Math.abs(Math.sin(y*22))<.12?[.5,.42,.2]:[.68,.6,.32],hh,.12))] };
  const WB={bow:'armL',mushroom:'armL'};
  if(R.w&&WEAP[R.w]){ const g=WEAP[R.w](); if(g.length)L.push(pt(R.w,WB[R.w]||'armR',g,2)); }
  if(R.w==='bow')L.push(pt('quiver','hips',[S(at(new THREE.CylinderGeometry(.032,.026,.27,10),[.06,.5,-.13],[20,0,-15]),(x,y,z,hh)=>vary(LEATH,hh,.15)), ...[0,1,2,3].map(i=>S(at(new THREE.ConeGeometry(.012,.05,3),[.03+i*.016,.66+(i%2)*.01,-.08],[0,0,0],[1,1,.2]),[.82,.76,.6]))],2));
  if(R.shield){ const k=C(R.shield), kite=R.sp==='frog'; let g;
    if(kite){ const sh=new THREE.Shape(); sh.moveTo(-.09,.1); sh.lineTo(.09,.1); sh.quadraticCurveTo(.09,-.05,0,-.17); sh.quadraticCurveTo(-.09,-.05,-.09,.1); g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:true,bevelThickness:.004,bevelSize:.006,bevelSegments:1}); g.translate(HL[0]-.02,HL[1]+.02,HL[2]+.08); }
    else{ g=lathe([[0,.012],[.06,.01],[.11,.004],[.12,0]],20,5); g.rotateX(PI/2); g.translate(HL[0]-.02,HL[1]+.02,HL[2]+.08); }
    L.push(pt('shield','armL',[S(g,(x,y,z,hh)=>{ const r=Math.hypot(x-HL[0]+.02,y-HL[1]-.02); return vary(r>.105?dk(k,.25):Math.sin(r*120+Math.atan2(y,x)*3)>.6?lt(k,.15):k,hh,.12); }), shell(1,{r:[.022,.022,.016],p:[HL[0]-.02,HL[1]+.02,HL[2]+.095],col:dk(k,.3)})],3)); }
  const HOLD={
    map:()=>[S(at(lathe([[.012,0],[.012,.12]],8,1),[HL[0]+.02,HL[1]+.0,HL[2]+.07],[0,0,90]),[.86,.8,.62]), S(at(new THREE.PlaneGeometry(.12,.1,4,1),[HL[0]+.02,HL[1]+.05,HL[2]+.075],[-30,20,0]),(x,y,z,hh)=>vary(hh>.85?[.5,.36,.24]:[.9,.84,.66],hh,.06))],
    herbs:()=>[...[0,1,2,3,4,5].map(i=>shell(1,{r:[.03,.045,.012],p:[HL[0]+Math.sin(i)*.025,HL[1]+.07+(i%3)*.012,HL[2]+.06+Math.cos(i*1.7)*.02],rot:[i*30,i*50,i*20],col:fur([.26+i*.02,.48,.2],.2)})), S(tube([[HL[0],HL[1]-.02,HL[2]+.05],[HL[0],HL[1]+.06,HL[2]+.06]],[.012,.012],5,3),[.4,.5,.25])],
    skull:()=>[shell(2,{r:[.04,.04,.045],p:[.12*b,.31,.1],d:u=>[u[0]*(u[1]<-.2?.75:1),u[1],u[2]],col:(u,hh)=>gss(Math.abs(u[0]),u[1],.38,.1,.18,.18)*sm(.3,.7,u[2])>.4||(u[1]<-.45&&u[2]>.5&&Math.sin(u[0]*40)>.2)?BLACK:vary([.88,.85,.78],hh,.1)}), shell(2,{r:[.06,.07,.05],p:[.15*b,.27,-.03],col:fur([.6,.54,.42],.18),j:.006})],
    orb:()=>[shell(2,{r:[.045,.045,.045],p:[HL[0],HL[1]+.03,HL[2]+.07],col:(u,hh)=>lt(C(R.orb||'#5ad0ff'),.2+.4*Math.max(0,u[1]))})],
    flute:()=>[S(tube([[-.2*b,.42,.12],[0,.4,.14],[.22*b,.43,.12]],[.012,.012,.012],7,10),(x,y,z,hh)=>Math.abs(Math.sin(x*80))<.1?C('#6a3a1a'):vary([.72,.46,.24],hh,.12))],
    stones:()=>[0,1,2].map(i=>shell(1,{r:[.03,.026,.028],p:[-.13*b+i*.022,.27+(i%2)*.03,.08],col:fur([.5,.5,.48],.2),j:.004}))};
  if(R.hold&&HOLD[R.hold])L.push(pt(R.hold,R.hold==='skull'||R.hold==='stones'||R.hold==='flute'?'hips':'armL',HOLD[R.hold](),2));
  }
  if(R._v2)R._k={K,EYE,f,f2,C,mix,dk,lt,vary,fur,cloth,shell,S,at,tube,lathe,quills,pt,pair,h3,gss,sm,BLACK,WHITE,PINK,WOOD,LEATH,GOLD,STEEL,BONE,Q};
  return L;
  function quills(c,o,r,n,len,seed){ const out=[]; for(let i=0;i<n;i++){ const a=(i*2.399+seed)%(PI*2), u=((i*.618+seed*.1)%1), d=[Math.sin(a)*.9,.25+.6*u,-.55-.45*Math.abs(Math.cos(a))], l=Math.hypot(...d), q=d.map(v=>v/l), g=new THREE.ConeGeometry(.008,len*(.7+.6*((i*.37)%1)),4);
      g.translate(0,len/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...q))); g.translate(o[0]+q[0]*r*.75,o[1]+q[1]*r*.75,o[2]+q[2]*r*.75); out.push(S(g,(x,y,z,hh)=>hh>.6?lt(c,.45):vary(c,hh,.2))); } return out; } };
export {FOLK};
