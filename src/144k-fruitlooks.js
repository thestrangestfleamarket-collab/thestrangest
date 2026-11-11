// THE ORCHARD'S LOOKS: one 3D model for each kind of thing the fruit trees give (round fruit shaped by its family, berry clusters, nuts, leaves, sticks, sap buckets, bananas, cacao pods), the sapling, the palm pup, the pip or stone, and the pot, net, burlap and spile, each in its tree's own colours.
import {THREE} from './003-shx.js';
import {INSPECT} from './003b-systems.js';
import {FTREES} from './144j-fruittrees.js';
{ const CL=/^(sweetcherry|sourcherry|elder|mulberry|serviceberry|olive|date|jujube|coffee|kumquat)$/, LF=/^(tea|bay|linden)$/, LONG={mango:[.9,1.25,.85],avocado:[.8,1.25,.8],papaya:[.75,1.5,.75],pawpaw:[.75,1.3,.75],lemon:[.85,1.15,.85],quince:[.95,1.1,.95],loquat:[.8,1.05,.8],guava:[.9,1.05,.9],fuyu:[1.1,.75,1.1],persimmon:[1.05,.85,1.05],mandarin:[1.1,.85,1.1],apple:[1.05,.95,1.05],crabapple:[1.05,.95,1.05],grapefruit:[1.05,.95,1.05]};
  const SHELL={walnut:0xb89060,blackwalnut:0x4a3a2a,pecan:0x8a5a34,hazel:0xa87440,chestnut:0x6a3420,almond:0xc8a070,pistachio:0xd8c8a0,whiteoak:0x9a7040,ginkgo:0xe8dcb0};
  INSPECT.kinds.push({is:id=>{ const k=String(id).split('~')[0]; return /^(tf|sp|pp)_/.test(k)&&!!FTREES.CAT[k.slice(3)]||/^(treepot|birdnet|burlap|spile)$/.test(k); },make:id=>{ '@later'; id=String(id).split('~')[0];
    const g=new THREE.Group(), FOOD={kind:'food'}, WOOD={kind:'wood'}, MET={kind:'metal',metal:1,rough:.4}, P=(...a)=>{ const m=INSPECT.part(...a); g.add(m); return m; }, Y=(m,a)=>{ m.rotation.order='YXZ'; m.rotation.y=a; return m; };
    const stem=(y,h=.02)=>P('cyl',0x5a3a22,0,y+h/2,0,.003,h,.003,0,.15,0,WOOD), leaf=(x,y,z,c,s=.02,a=0)=>Y(P('sph',c,x,y,z,s,s*.12,s*.45,0,.3,0,FOOD),a);
    const bucket=(sap)=>{ P('cyl',0xa8aeb4,0,.09,0,.085,.18,.085,0,0,0,MET); P('tor',0x8a9096,0,.18,0,.085,.085,.03,Math.PI/2,0,0,MET); P('tor',0x6a7076,0,.2,0,.075,.09,.012,0,0,0,MET); if(sap!=null)P('cyl',sap,0,.165,0,.078,.012,.078,0,0,0,{kind:'wet'});
      P('cyl',0xc8ccd0,.105,.16,0,.008,.07,.008,0,1.2,0,MET); P('cone',0xc8ccd0,.145,.146,0,.01,.03,.01,0,-1.9,0,MET); };
    const pot=(r,h,c)=>{ P('cyl',c,0,h/2,0,r,h,r,0,0,0,{kind:'clay'}); P('tor',c,0,h,0,r*1.02,r*1.02,r*.3,Math.PI/2,0,0,{kind:'clay'}); P('cyl',0x3a2a1c,0,h-.01,0,r*.92,.012,r*.92); };
    if(id==='treepot'){ pot(.24,.4,0xb0623a); return g; }
    if(id==='spile'){ bucket(null); return g; }
    if(id==='burlap'){ P('cyl',0xb89a64,0,.07,0,.07,.36,.07,Math.PI/2,0,0,{kind:'cloth'}); for(const z of [-.1,.1])P('tor',0x7a5a34,0,.07,z,.072,.072,.02,0,0,0,WOOD); P('box',0xa88a56,.05,.012,0,.16,.008,.34,0,0,0,{kind:'cloth'}); return g; }
    if(id==='birdnet'){ P('sph',0x3a5a3a,0,.06,0,.15,.06,.11,0,0,0,{kind:'cloth'}); for(let i=0;i<5;i++)Y(P('tor',0x5a7a52,0,.06,0,.15-i*.012,.06,.02,Math.PI/2,0,0,{kind:'cloth'}),i*.63); P('tor',0x7a5a34,0,.075,0,.05,.115,.03,0,0,0,WOOD); return g; }
    const K=FTREES.CAT[id.slice(3)], k=K.k, r=.04*Math.max(.3,K.fs);
    if(id[0]==='s'){ const palm=K.c==='palm';
      P('sph',0xb08a5a,0,.09,0,.1,.09,.1,0,0,0,{kind:'cloth'}); P('tor',0x7a5a34,0,.13,0,.085,.085,.03,Math.PI/2,0,0,WOOD); P('cyl',palm?0x7a6a48:0x6a4a30,0,.36,0,palm?.018:.009,.42,palm?.014:.009,0,.04,0,WOOD);
      if(palm)for(let i=0;i<6;i++){ const a=i*1.047; Y(P('sph',K.leaf,Math.sin(a)*.1,.6-(i%2)*.03,Math.cos(a)*.1,.03,.008,.14,-.5,0,0,FOOD),a); }
      else { for(let i=0;i<3;i++){ const a=i*2.1+.4, y=.3+i*.09; Y(P('cyl',0x6a4a30,Math.sin(a)*.04,y,Math.cos(a)*.04,.004,.1,.004,.9,0,0,WOOD),a); P('ico',K.leaf,Math.sin(a)*.085,y+.035,Math.cos(a)*.085,.05,.04,.05,0,0,0,FOOD); } P('ico',K.leaf,0,.6,0,.07,.06,.07,0,0,0,FOOD); }
      return g; }
    if(id[0]==='p'){ if(K.g==='NUTS'){ for(let i=0;i<2;i++)P('sph',SHELL[k]||0x9a7040,i*.035-.017,.014,i*.01,.016,.014,.02,0,0,0,WOOD); }
      else if(K.g==='STONE'||k==='avocado'||k==='loquat'){ const s=k==='avocado'?.022:k==='mango'?.03:k==='loquat'?.01:.011*Math.max(.6,K.fs); P('sph',k==='avocado'?0x7a4a2a:0xb89468,0,s*.8,0,s*(k==='mango'?.6:.8),s*.8,s*1.25,0,0,0,WOOD); }
      else for(let i=0;i<3;i++){ const a=i*2.1; Y(P('sph',K.g==='CITRUS'?0xe8dcb8:0x4a2e1c,Math.sin(a)*.008,.003,Math.cos(a)*.008,.0028,.002,.005,0,0,0,WOOD),a); }
      return g; }
    if(K.sap){ bucket(k==='maple'?0xd8b060:0xe0e4d8); return g; }
    if(K.g==='NUTS'){ const c=SHELL[k]||0x9a7040, s=.012*Math.max(.8,K.fs*1.6); for(let i=0;i<6;i++){ const a=i*1.9, d=i?s*1.5:0; P('sph',c,Math.sin(a)*d,s*.8+(i===5?s:0),Math.cos(a)*d,s*.85,s*.8,s*(k==='pecan'||k==='almond'?1.35:1),0,0,0,WOOD).rotation.y=a; if(k==='whiteoak')P('cap',0x6a4a2a,Math.sin(a)*d,s*1.1+(i===5?s:0),Math.cos(a)*d,s*.9,s*.5,s*.9,0,0,0,WOOD); } return g; }
    if(CL.test(k)){ const n=k==='elder'||k==='coffee'||k==='serviceberry'?11:7, l=k==='date'||k==='jujube'||k==='olive'||k==='mulberry'?1.5:1; for(let i=0;i<n;i++){ const a=i*2.4, d=r*1.1*Math.sqrt(i/n)*1.6; P('sph',K.fr,Math.sin(a)*d,r*.9+(i%3)*r*.45,Math.cos(a)*d,r*.75,r*.75*l,r*.75,0,0,0,FOOD); }
      P('cyl',0x5a3a22,0,r*2.6,0,.002,r*2.4,.002,0,.1,0,WOOD); leaf(.012,r*3.6,0,K.leaf,.022,.4); return g; }
    if(LF.test(k)){ const c=k==='linden'?0xf0e080:K.leaf; for(let i=0;i<7;i++){ const a=(i-3)*.32; Y(P('sph',i%2?c:K.leaf,Math.sin(a)*.04,.006+i*.002,Math.cos(a)*.04,.018,.002,.045,0,0,0,FOOD),a); } P('tor',0x7a5a34,0,.008,-.004,.012,.012,.006,Math.PI/2,0,0,WOOD); return g; }
    if(k==='cinnamon'){ for(let i=0;i<5;i++)P('cyl',i%2?0xa8603a:0x8a4a2a,(i-2)*.013,.008+(i%2)*.012,0,.007,.14,.007,Math.PI/2,0,0,WOOD); for(const z of [-.04,.04])P('tor',0xd8c8a0,0,.014,z,.036,.02,.03,0,0,0,{kind:'cloth'}); return g; }
    if(k==='willow'){ for(let i=0;i<9;i++)P('cyl',i%2?0xb08a40:0x8a7a3a,(i%3-1)*.01,.006+Math.floor(i/3)*.01,(i%2)*.01,.003,.8,.003,Math.PI/2,(i-4)*.004,0,WOOD); for(const z of [-.25,.25])P('tor',0x7a5a34,0,.016,z,.022,.02,.03,0,0,0,WOOD); return g; }
    if(k==='cork'){ P('box',0xb0805a,0,.02,0,.16,.035,.26,0,.04,0,WOOD); P('box',0x7a5a40,0,.04,0,.15,.008,.25,0,.04,0,WOOD); return g; }
    if(k==='banana'){ P('cyl',0x6a5a2a,0,.1,-.01,.008,.03,.008,.5,0,0,WOOD); for(let i=0;i<5;i++){ const a=(i-2)*.38; for(let j=0;j<3;j++)Y(P('sph',j===2?0xc8b030:K.fr,Math.sin(a)*(.02+j*.022),.08-j*j*.014,.015+Math.cos(a)*(.02+j*.022),.014,.015,.03,.5+j*.45,0,0,FOOD),a); } return g; }
    if(k==='cacao'){ for(let i=0;i<2;i++){ const x=i*.08-.04, c=i?0xa8522a:K.fr; P('sph',c,x,.04,0,.036,.036,.085,0,0,0,FOOD); P('cyl',0x5a3a22,x,.04,-.09,.005,.02,.005,Math.PI/2,0,0,WOOD); P('cone',c,x,.04,.092,.014,.03,.014,Math.PI/2,0,0,FOOD); } return g; }
    const [sx,sy,sz]=LONG[k]||[1,1,1]; P('sph',K.fr,0,r*sy,0,r*sx,r*sy,r*sz,0,0,0,FOOD);
    if(k==='pear'){ P('sph',K.fr,0,r*1.75,0,r*.6,r*.75,r*.6,0,0,0,FOOD); stem(r*2.4); leaf(.012,r*2.5,0,K.leaf); }
    else if(k==='fig'){ P('cone',K.fr,0,r*2,0,r*.75,r*1.3,r*.75,0,0,0,FOOD); stem(r*2.5,.012); }
    else if(k==='pomegranate'){ P('cyl',K.fr,0,r*2.05,0,r*.28,r*.3,r*.34,0,0,0,FOOD); P('cone',0x8a1a24,0,r*2.25,0,r*.34,r*.2,r*.34,Math.PI,0,0,FOOD); }
    else if(k==='coconut'){ for(let i=0;i<3;i++)P('sph',0x3a2a1a,Math.sin(i*2.1)*r*.3,r*1.88,Math.cos(i*2.1)*r*.3,r*.12,r*.08,r*.12); }
    else if(k==='fuyu'||k==='persimmon'){ for(let i=0;i<4;i++)leaf(Math.sin(i*1.57)*r*.4,r*sy*2,Math.cos(i*1.57)*r*.4,0x6a7a3a,r*.5,i*1.57); stem(r*sy*2,.008); }
    else if(K.g==='CITRUS'){ P('cyl',0x4a6a2a,0,r*sy*2,0,r*.12,r*.06,r*.12); if(k==='lemon')P('cone',K.fr,0,r*.06,0,r*.3,r*.3,r*.3,Math.PI,0,0,FOOD); leaf(r*.5,r*sy*2+.004,0,K.leaf,r*.7); }
    else if(k==='avocado'||k==='mango'||k==='papaya'||k==='pawpaw'||k==='guava')stem(r*sy*2,.01);
    else { stem(r*sy*2-.004); leaf(.01,r*sy*2+.014,0,K.leaf,Math.max(.012,r*.5)); }
    return g; }}); }
