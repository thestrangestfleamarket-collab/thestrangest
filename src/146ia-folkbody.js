// THE FOLK'S BODIES: FOLK.body builds a woodland character as a body on the Walker's rig (BODIES' 15 bones): its species head and what it wears there (from FOLK.parts), a neck that bends into the chest, a shaped torso, arms with elbows and hands that grip, legs with knees and feet, its clothes, its tail and what it carries; one mesh, each point held by one or two bones. FOLK.pose turns the rig's pose into that body each frame.
import {THREE} from './003-shx.js';
import {GUARD} from './003b-systems.js';
import {BODIES} from './111a-bodies.js';
import {FOLK} from './146i-folk.js';
FOLK.body=R=>{ '@park'; const B=BODIES.BONES, b=R.bulk||1, PI=Math.PI, V=new THREE.Vector3();
  const R2={...R,_v2:1}, hp=FOLK.parts(R2), k=R2._k; const {K,f,f2,C,mix,dk,lt,vary,fur,shell,S,at,tube,lathe,quills,h3,BLACK,WHITE,PINK,WOOD,LEATH,GOLD,STEEL,BONE}=k;
  // the joints standing (height 1, facing +z, its left at +x), arms and legs straight down so each bone's rest frame is the world's
  const W=R.sp==='rhino'||R.sp==='hyena'||R.sp==='bear'||R.sp==='bull'?1.15:1, sx=.125*b*W, lx=.068*b*W;
  const J={hips:[0,.5,0],torso:[0,.64,0],head:[0,.8,0]};
  for(const [s,n] of [[1,'L'],[-1,'R']]){ J['upperArm'+n]=[s*sx,.735,0]; J['forearm'+n]=[s*sx,.575,0]; J['hand'+n]=[s*sx,.44,0]; J['thigh'+n]=[s*lx,.47,0]; J['shin'+n]=[s*lx,.26,0]; J['shoe'+n]=[s*lx,.055,0]; }
  const off={}; for(const n of B){ const p=BODIES.PARENT[n]; if(p)off[n]=[p,J[n][0]-J[p][0],J[n][1]-J[p][1],J[n][2]-J[p][2]]; }
  const binv=B.map(n=>new THREE.Matrix4().makeTranslation(-J[n][0],-J[n][1],-J[n][2]));
  const P=[], Cc=[], BI=[], BW=[], bi=n=>B.indexOf(n);
  // a shape on a bone (or blended from one bone to the next by w(x,y,z): the first bone's share)
  const put=(sh,bone,blend)=>{ const a=bi(bone), to=blend&&blend.to; let c=blend&&typeof to!=='function'?bi(to):a; for(let i=0;i<sh.P.length;i+=3){ const x=sh.P[i], y=sh.P[i+1], z=sh.P[i+2]; if(typeof to==='function')c=bi(to(x,y,z)); P.push(x,y,z); Cc.push(...sh.C.slice(i,i+3).map(v=>Math.pow(Math.max(0,v),2.2)));
      BI.push(a,c); BW.push(blend?Math.max(0,Math.min(1,blend.w(x,y,z))):1); } };
  // the head and all it wears, from the old head's frame (centre .74, size .13) to the new one on top of the neck
  const HC=[0,.885,.012], HS=.105/.13;
  for(const p of hp)for(const sh of p.of){ for(let i=0;i<sh.P.length;i+=3){ sh.P[i]=(sh.P[i])*HS+HC[0]; sh.P[i+1]=(sh.P[i+1]-.74)*HS+HC[1]; sh.P[i+2]=(sh.P[i+2])*HS+HC[2]; } put(sh,'head'); }
  const hand=['mouse','rat','rabbit','hedgehog'].includes(R.sp)?PINK:R.sp==='owl'||R.sp==='barnowl'||R.sp==='toucan'?[.62,.58,.52]:R.sp==='panda'?f2:R.sp==='frog'?lt(f,.1):dk(f,.08);
  const limbC=R.sp==='panda'?f2:f, skin=R.sp==='pangolin'?((u,hh)=>{ const r=u[1]*7+u[2]*3, q=r-Math.floor(r); return mix(dk(f,.35),lt(f,.12),q*(.7+.3*hh)); }):R.stars?((u,hh)=>hh>.92?[.95,.92,.8]:vary(f,hh)):fur(f,.12);
  const furC=c=>(x,y,z,hh)=>vary(c,hh,.12), seg=(a,c,t)=>a.map((v,i)=>v+(c[i]-v)*t);
  const cc=R.cc&&C(R.cc), c2=R.c2?C(R.c2):cc&&dk(cc), robe=R.coat==='robe', tunic=R.coat==='tunic', arm=R.coat==='armour';
  // the neck: from the chest up into the head, bending with both
  put(S(tube([[0,.73,-.005],[0,.79,0],[0,.85,.012]],[.048*W,.042*W,.04*W],12,6),furC(R.sp==='toucan'?f2:limbC)),'torso',{to:'head',w:(x,y)=>1-(y-.73)/.12});
  // the torso: rib cage and shoulders down to the belly, the chest's paler fur in front; the pelvis
  const torsoD=(p,u,v)=>{ const front=Math.max(0,Math.cos(u*PI*2)), y=p[1]; return [p[0]*b*W,y,p[2]*.82*b*W+.012*front*Math.sin(Math.max(0,(y-.6)/.15)*PI)]; };
  put(S(lathe([[.0,.545],[.098,.55],[.108,.6],[.118,.66],[.126,.71],[.112,.75],[.06,.765],[0,.77]],16,10,{d:torsoD}),(x,y,z,hh)=>z>.04&&Math.abs(x)<.06&&y<.72?vary(R.sp==='panda'?f:f2,hh,.1):skin([x,y,z],hh)),'torso',{to:'hips',w:(x,y)=>Math.min(1,(y-.545)/.06)});
  put(shell(3,{r:[.105*b*W,.085,.092*b*W],p:[0,.5,-.004],col:(u,hh)=>u[2]>.3&&u[1]>-.2?vary(R.sp==='panda'?f:f2,hh,.1):skin(u,hh),j:.002}),'hips');
  // arms: a shoulder's round, the upper arm, the elbow, the forearm, and a hand that closes round what it holds
  for(const [s,n] of [[1,'L'],[-1,'R']]){ const Sx=J['upperArm'+n], E=J['forearm'+n], Wr=J['hand'+n], x=Sx[0], cl=robe||tunic?fur(cc,.08):arm?((u,hh)=>vary(cc,hh,.16)):skin, ccol=robe||tunic?((xx,y,z,hh)=>vary(cc,hh,.12)):arm?((xx,y,z,hh)=>vary(cc,hh,.16)):furC(limbC);
    put(shell(2,{r:[.042*W,.045,.045*W],p:[x,Sx[1]-.01,0],col:cl,j:.002}),'upperArm'+n);
    put(S(tube([[x,Sx[1]-.01,0],[x+s*.004,(Sx[1]+E[1])/2,.003],[x,E[1]+.01,0]],[.036*W*b,.033*W*b,.029*W*b],10,7),ccol),'upperArm'+n,{to:'forearm'+n,w:(xx,y)=>Math.min(1,(y-E[1]+.008)/.03)});
    put(shell(1,{r:[.028*W,.028,.028*W],p:[x,E[1],-.004],col:cl}),'forearm'+n,{to:'upperArm'+n,w:()=>.5});
    put(S(tube([[x,E[1],0],[x,(E[1]+Wr[1])/2+.01,.004],[x,Wr[1]+.008,.002]],[.03*W*b,.028*W*b,.022*W*b],10,7),ccol),'forearm'+n,{to:'upperArm'+n,w:(xx,y)=>Math.min(1,(E[1]-y+.006)/.03)});
    if(robe)put(S(tube([[x,E[1]+.03,0],[x,(E[1]+Wr[1])/2,.004],[x,Wr[1]+.005,.006]],[.034,.045,.058],12,4,{d:(p,u,v)=>[p[0],p[1]-(v>.85?(h3(Math.round(u*40),3,1)-.5)*.02:0),p[2]]}),(xx,y,z,hh)=>vary(cc,hh,.12)),'forearm'+n);
    if(arm){ put(shell(2,{r:[.058*W,.04,.058*W],p:[x+s*.008,Sx[1]+.008,0],keep:u=>u[1]>-.25,col:(u,hh)=>vary(c2,hh,.14)}),'upperArm'+n); put(S(tube([[x,E[1]-.02,0],[x,Wr[1]+.015,.002]],[.033,.028],10,3),(xx,y,z,hh)=>vary(lt(cc,.1),hh,.14)),'forearm'+n); }
    // the hand: palm, four fingers curled forward round a grip, the thumb across
    const hy=Wr[1], HC2=[x,hy-.03,.008], hc=furC(hand);
    put(shell(2,{r:[.022*W,.03,.017],p:HC2,col:(u,hh)=>vary(hand,hh,.08)}),'hand'+n);
    for(let i=0;i<4;i++){ const fx=x+s*(-.012+i*.008), y0=hy-.052; put(S(tube([[fx,y0,.008],[fx,y0-.016,.016],[fx,y0-.018,.03],[fx,y0-.006,.036]],[.0062,.0058,.0052,.0045],5,6),hc),'hand'+n); }
    put(S(tube([[x-s*.016,hy-.026,.01],[x-s*.018,hy-.04,.026],[x-s*.012,hy-.05,.036]],[.0068,.006,.005],5,4),hc),'hand'+n); }
  // legs: hips into thighs, the knee, a calf, the ankle and a foot that reaches forward (clawed toes for those who have them)
  const claws=['frog','hedgehog','rat','mouse','pangolin','rhino','hyena','lizard','turtle','raccoon','badger','bear','lynx','cat','tiger','lion','fox','wolf'].includes(R.sp);
  for(const [s,n] of [[1,'L'],[-1,'R']]){ const H=J['thigh'+n], Kn=J['shin'+n], A=J['shoe'+n], x=H[0], lc=furC(R.sp==='panda'?f2:f), boot=arm?((xx,y,z,hh)=>vary(lt(cc,.05),hh,.14)):lc;
    put(S(tube([[x,H[1]+.02,0],[x,(H[1]+Kn[1])/2,.006],[x,Kn[1]+.01,.004]],[.056*W*b,.05*W*b,.038*W*b],12,7),lc),'thigh'+n,{to:'shin'+n,w:(xx,y)=>Math.min(1,(y-Kn[1]+.008)/.03)});
    put(shell(1,{r:[.036*W,.034,.036*W],p:[x,Kn[1],.006],col:(u,hh)=>vary(R.sp==='panda'?f2:f,hh,.12)}),'shin'+n,{to:'thigh'+n,w:()=>.5});
    put(S(tube([[x,Kn[1],.002],[x,Kn[1]-.06,-.008],[x,(Kn[1]+A[1])/2-.02,-.004],[x,A[1]+.015,0]],[.038*W*b,.04*W*b,.03*W*b,.024*W*b],10,8),boot),'shin'+n,{to:'thigh'+n,w:(xx,y)=>Math.min(1,(Kn[1]-y+.006)/.03)});
    const fc=(u,hh)=>vary(arm?lt(cc,.05):R.sp==='frog'?f:dk(R.sp==='panda'?f2:f,.1),hh,.12);
    put(shell(2,{r:[.034*W,.026,.068*W],p:[x,.028,.03],d:u=>[u[0]*(1+.25*Math.max(0,u[2])),u[1]*(u[1]<0?.45:1),u[2]],col:fc,j:.0015}),'shoe'+n);
    if(claws)for(let i=-1;i<=1;i++)put(S(at(new THREE.ConeGeometry(.006,.02,4),[x+i*.016,.014,.1],[90,0,0]),R.sp==='frog'?f:[.82,.78,.7]),'shoe'+n);
    if(arm)put(S(tube([[x,Kn[1]-.03,.012],[x,A[1]+.03,.02]],[.042,.034],10,3),(xx,y,z,hh)=>vary(lt(cc,.12),hh,.16)),'shin'+n); }
  // the tail from the base of the back
  if(K.tail){ const T=K.tail==='cat'?[[[0,.47,-.08],[0,.4,-.2],[0,.46,-.33],[0,.6,-.38]],[.02,.018,.016,.012]]:K.tail==='fox'?[[[0,.47,-.08],[0,.36,-.22],[0,.3,-.38],[0,.34,-.52]],[.036,.064,.064,.018]]:K.tail==='lizard'?[[[0,.46,-.07],[0,.32,-.24],[0,.18,-.42],[.04,.1,-.58]],[.056,.04,.022,.004]]:K.tail==='thin'?[[[0,.46,-.08],[0,.34,-.24],[0,.3,-.4],[0,.38,-.54],[0,.5,-.58]],[.014,.012,.01,.007,.004]]:K.tail==='ringed'?[[[0,.46,-.08],[0,.4,-.22],[0,.33,-.36],[0,.27,-.48]],[.04,.055,.05,.028]]:K.tail==='pangolin'?[[[0,.44,-.08],[0,.3,-.26],[0,.18,-.44],[0,.12,-.6]],[.075,.06,.04,.014]]:[[[0,.47,-.08],[0,.43,-.16],[0,.4,-.2]],[.028,.024,.012]];
    const tc=K.tail==='fox'?((x,y,z,hh)=>z<-.46?vary(WHITE,hh):vary(f,hh)):K.tail==='lizard'?((x,y,z,hh)=>vary(Math.sin(z*120)>.5?dk(f,.3):f,hh,.1)):K.tail==='ringed'?((x,y,z,hh)=>Math.sin(z*90)>0?vary(dk(f,R.sp==='raccoon'?.75:.45),hh):vary(R.sp==='raccoon'?lt(f,.15):f,hh)):K.tail==='thin'?((x,y,z,hh)=>vary(PINK,hh,.06)):K.tail==='pangolin'?((x,y,z,hh)=>mix(dk(f,.3),lt(f,.1),(Math.sin(z*70)+1)/2)):((x,y,z,hh)=>vary(f,hh));
    put(S(tube(T[0],T[1],10,14),tc,K.tail==='ringed'?.006:0),'hips'); }
  if(R.sp==='hedgehog')for(const q of quills(R.quill?C(R.quill):f,[0,.66,-.05],.12,52,.1,R.k.length+3))put(q,'torso');
  if(R.sp==='pangolin')for(let i=0;i<6;i++)put(shell(2,{r:[.14*b-i*.006,.045,.12*b],p:[0,.76-i*.06,-.03],keep:u=>u[1]>-.2,d:u=>[u[0],u[1]-.5*(u[0]*u[0]+u[2]*u[2]),u[2]],col:(u,hh)=>mix(dk(f,.25),lt(f,.12),(u[1]+1)/2*(.6+.4*hh)),j:.002}),i<3?'torso':'hips');
  // what they wear on the body
  const folds=(nf,a,ragg)=>(p,u,v)=>{ const t=u*PI*2, fo=a*v*(Math.sin(t*nf+2*Math.sin(t*3))+.4*Math.sin(t*nf*2.3)), r=Math.hypot(p[0],p[2])||1, kk=(r+fo)/r; return [p[0]*kk,p[1]+(v>.92&&ragg?(h3(Math.round(u*60),7,3)-.5)*ragg:0),p[2]*kk]; };
  const skirt={to:(x,y,z)=>(z>0&&y<.3?'shin':'thigh')+(x>0?'L':'R'),w:(x,y,z)=>1-Math.max(0,Math.min(1,(.5-y)/(z>0?.12:.2)))*(z>0?1:.45)}, clothF=(c,dirt=.25)=>(x,y,z,hh)=>vary(mix(c,dk(c,.5),Math.max(0,Math.min(1,(.2-y)/.2))*dirt),hh,.14);
  if(robe){ put(shell(3,{r:[.133*b*W,.13,.112*b*W],p:[0,.66,0],keep:u=>u[1]<.86,col:(u,hh)=>Math.abs(u[0]+u[1]*.2)<.06&&u[2]>.5?vary(c2,hh,.1):vary(cc,hh,.12),j:.003}),'torso');
    put(S(lathe([[.112*b*W,.58],[.13*b*W,.5],[.15*b*W,.38],[.18*b*W,.22],[.215*b*W,.06],[.225*b*W,.035]],22,12,{d:folds(10,.012,.03)}),clothF(cc)),'hips',skirt);
    put(S(at(new THREE.TorusGeometry(.118*b*W,.012,5,18),[0,.565,0],[90,0,0],[1,1.15,1]),c2),'hips'); }
  if(tunic){ put(shell(3,{r:[.134*b*W,.125,.112*b*W],p:[0,.665,0],keep:u=>u[1]<.84,col:(u,hh)=>vary(cc,hh,.12),j:.003}),'torso');
    put(S(lathe([[.112*b*W,.575],[.122*b*W,.5],[.142*b*W,.4],[.155*b*W,.34]],18,6,{d:folds(8,.008,.02)}),clothF(cc,.1)),'hips',skirt);
    put(S(at(new THREE.TorusGeometry(.118*b*W,.012,5,18),[0,.56,0],[90,0,0],[1,1.12,1]),c2||LEATH),'hips'); put(S(at(new THREE.BoxGeometry(.03,.026,.01),[0,.56,.13*b*W]),GOLD),'hips'); }
  if(arm){ put(shell(3,{r:[.138*b*W,.12,.118*b*W],p:[0,.665,.006],keep:u=>u[1]<.8,d:u=>[u[0],u[1],u[2]+.08*Math.max(0,u[2])*Math.exp(-(((u[1]-.1)/.5)**2))],col:(u,hh)=>Math.abs(u[0])<.05&&u[2]>.3?vary(lt(cc,.25),hh,.08):vary(cc,hh,.18)}),'torso');
    put(S(at(new THREE.TorusGeometry(.055,.016,5,14),[0,.745,0],[90,0,0]),c2),'torso');
    put(S(lathe([[.112*b*W,.57],[.13*b*W,.5],[.148*b*W,.42]],16,4,{d:(p,u,v)=>[p[0],p[1]+(v>.9?(Math.floor(u*14)%2)*.01:0),p[2]]}),(x,y,z,hh)=>vary(dk(cc,.12),hh,.2)),'hips',skirt);
    put(S(at(new THREE.TorusGeometry(.118*b*W,.014,5,18),[0,.56,0],[90,0,0],[1,1.12,1]),LEATH),'hips'); }
  if(R.sash)put(S(tube([[.1*b,.75,.07],[.02,.66,.115*b],[-.09*b,.56,.09]],[.014,.016,.014],5,8,{sz:.35}),(x,y,z,hh)=>vary(C(R.sash),hh,.1)),'torso');
  if(R.cape){ const kc=C(R.cape); put(S(lathe([[.1*b,.76],[.14*b,.66],[.19*b,.4],[.23*b,.1]],22,12,{d:folds(9,.014,.05),keep:u=>Math.abs(u-.5)<.24}),R.stars?((x,y,z,hh)=>hh>.9?[.95,.9,.75]:vary(kc,hh,.1)):clothF(kc,.3)),'torso');
    put(shell(2,{r:[.14*b,.03,.12*b],p:[0,.75,-.004],col:(u,hh)=>vary(kc,hh,.12),j:.004}),'torso'); }
  if(R.beads)for(let i=0;i<22;i++){ const a=i/22*PI*1.2-PI*.6; put(shell(1,{r:[.011,.01,.011],p:[Math.sin(a)*.085*b,.75-Math.cos(a)*.08,.08*b+Math.cos(a)*.03],col:(u,hh)=>vary(i%3?C('#a86a3a'):C('#7a4a2a'),hh,.2)}),'torso'); }
  if(K.shellback)put(shell(3,{r:[.17*b,.2,.12*b],p:[0,.64,-.08],keep:u=>u[2]<.2,d:u=>[u[0],u[1],u[2]-.15*Math.max(0,-u[2])],col:(u,hh)=>{ const a=Math.atan2(u[0],u[1]), r2=Math.hypot(u[0],u[1]); return vary(Math.sin(a*6)*Math.sin(r2*12)>.6?dk(C(R.shell||'#5a7a4a'),.4):C(R.shell||'#5a7a4a'),hh,.15); },j:.005}),'torso');
  if(R.pack){ const pc=R.pack, base=[0,.66,-.15*b], heap=(nn,fn)=>{ for(let i=0;i<nn;i++){ const a=h3(i,7,R.k.length)*PI*2, rr=.09*Math.sqrt(h3(i,9,3)), y=.78+.16*h3(i,5,1)*(1-rr*4); put(fn([base[0]+Math.cos(a)*rr*b,y,base[2]-.02+Math.sin(a)*rr*.7],i),'torso'); } };
    put(shell(2,{r:[.11*b,.12,.075],p:base,col:(u,hh)=>vary(C('#5a4630'),hh,.25),j:.008}),'torso');
    for(const s of [1,-1])put(S(tube([[s*.09*b,.75,.06],[s*.1*b,.77,-.07],[s*.09*b,.58,-.14]],[.009,.009,.009],4,6),LEATH),'torso');
    if(pc==='skulls')heap(14,(p,i)=>shell(2,{r:[.042,.04,.046],p,col:(u,hh)=>Math.exp(-(((Math.abs(u[0])-.38)/.18)**2+((u[1]-.08)/.18)**2))*(u[2]>.4?1:0)>.4?BLACK:vary(BONE,hh,.12)}));
    if(pc==='gems'||pc==='crystals')heap(18,(p,i)=>S(at(new THREE.OctahedronGeometry(.034+.017*h3(i,3,3)),p,[h3(i,1,2)*90,h3(i,2,1)*90,0],[1,1.6,1]),(x,y,z,hh)=>lt(pc==='gems'?[[.5,.2,.7],[.2,.5,.8],[.8,.3,.3],[.3,.7,.5],[.9,.7,.2]][i%5]:[.7,.8,.9],.15+.3*hh)));
    if(pc==='rocks')heap(16,(p,i)=>shell(1,{r:[.042,.034,.038],p,col:(u,hh)=>vary([[.4,.6,.7],[.7,.4,.6],[.5,.5,.48],[.8,.6,.4],[.3,.4,.6]][i%5],hh,.3),j:.008}));
    if(pc==='fish')heap(9,(p,i)=>shell(2,{r:[.034,.027,.085],p,rot:[0,(h3(i,1,1)-.5)*90,(h3(i,2,2)-.5)*60],col:(u,hh)=>u[2]<-.75?C('#e88a50'):u[1]>.4?C('#c84a20'):vary(C('#f08a3a'),hh,.15),d:u=>[u[0]*(1-.5*Math.max(0,-u[2])),u[1],u[2]]}));
    if(pc==='potions')heap(8,(p,i)=>S(at(lathe([[0,0],[.022,.004],[.024,.035],[.01,.052],[.01,.07]],8,5),p),(x,y,z,hh)=>y>p[1]+.048?C('#8a6a4a'):lt([[.3,.8,.4],[.9,.3,.2],[.4,.4,.95],[.9,.8,.2]][i%4],.2)));
    if(pc==='bag')put(shell(2,{r:[.09*b,.07,.06],p:[0,.8,-.16*b],col:(u,hh)=>vary(C('#6a5a3a'),hh,.25),j:.01}),'torso'); }
  if(R.shieldback)put(S(at(lathe([[0,.012],[.055,.01],[.11,.004],[.12,0]],18,4),[0,.66,-.15*b],[90,0,0]),(x,y,z,hh)=>vary(C(R.shieldback),hh,.15)),'torso');
  if(R.w==='bow')put(S(at(new THREE.CylinderGeometry(.03,.025,.26,10),[.06,.7,-.13],[20,0,-15]),(x,y,z,hh)=>vary(LEATH,hh,.15)),'torso');
  // what the hands hold: built along the hand's +z from the grip (forward when the arm hangs, up when the forearm is raised)
  const G=n=>{ const Wr=J['hand'+n]; return [Wr[0],Wr[1]-.045,.022]; }, gR=G('R'), gL=G('L'), Wc=R.wc?C(R.wc):null, glow=R.w==='glowsword';
  const along=(g,p)=>[g[0]+p[0],g[1]+p[1],g[2]+p[2]];
  const blade=(g,len,w,col)=>{ const sh=new THREE.Shape(); sh.moveTo(-w,0); sh.lineTo(w,0); sh.lineTo(w*.9,len*.82); sh.lineTo(0,len); sh.lineTo(-w*.9,len*.82); sh.closePath();
    const bg=new THREE.ExtrudeGeometry(sh,{depth:.006,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}); bg.translate(0,0,-.003); bg.rotateX(PI/2); bg.translate(g[0],g[1],g[2]+.05);
    return [S(bg,(x,y,z,hh)=>{ const e=Math.abs(x-g[0]); return glow?lt(col,e<w*.3?.55:.15):vary(e>w*.6?lt(col,.25):e<w*.18?dk(col,.2):col,hh,.06); }), S(at(new THREE.BoxGeometry(.11,.016,.016),along(g,[0,0,.042])),GOLD),
      S(tube([along(g,[0,0,-.035]),along(g,[0,0,.04])],[.011,.011],7,6),(x,y,z,hh)=>Math.sin(z*260)>0?LEATH:dk(LEATH,.35)), shell(1,{r:[.015,.015,.015],p:along(g,[0,0,-.042]),col:GOLD})]; };
  const pole=(g,z0,z1,col,r=.012,kn=0)=>S(tube([along(g,[0,0,z0]),along(g,[.005,.002,(z0+z1)/2]),along(g,[0,.004,z1])],[r*1.05,r,r*.9],7,10,{d:kn?(p,u,v)=>{ const kk=1+kn*Math.sin(v*31+Math.sin(u*6.28)*2)*.5; return [g[0]+(p[0]-g[0])*kk,p[1],p[2]]; }:null}),(x,y,z,hh)=>vary(col,hh,.18));
  const WP={
    sword:()=>blade(gR,.3,.016,Wc||[.82,.84,.88]), glowsword:()=>blade(gR,.32,.019,Wc), greatsword:()=>blade(gR,.46,.022,[.8,.82,.86]),
    spear:()=>[pole(gR,-.42,.66,WOOD,.011), S(at(lathe([[0,0],[.022,.05],[.018,.1],[0,.15]],8,8,{sx:1,sz:.25}),along(gR,[0,0,.66]),[90,0,0]),(x,y,z,hh)=>vary([.55,.57,.6],hh,.12))],
    staff:()=>[pole(gR,-.4,.62,Wc||WOOD,.015,1), shell(1,{r:[.026,.03,.026],p:along(gR,[0,0,.64]),col:Wc||WOOD})],
    orbstaff:()=>[pole(gR,-.4,.6,[.38,.34,.3],.013,1), S(at(new THREE.TorusGeometry(.045,.009,5,12),along(gR,[0,0,.62])),[.42,.38,.32]), shell(2,{r:[.042,.042,.042],p:along(gR,[0,0,.66]),col:(u,hh)=>lt(Wc,.15+.45*Math.max(0,u[2]+u[1])/2)})],
    mushstaff:()=>[pole(gR,-.4,.56,Wc||WOOD,.012,1), ...[[0,.6,0,.032],[.035,.57,.02,.025],[-.03,.58,-.02,.026]].map(([dx,z,dy,r])=>S(at(lathe([[0,.02],[r*.8,.018],[r,.004],[r*.2,0]],12,4),along(gR,[dx,dy,z]),[90,0,0]),(x,y,zz,hh)=>vary([.82,.72,.56],hh,.08)))],
    crystalstaff:()=>[pole(gR,-.42,.6,Wc||[.3,.24,.2],.014,1.2), S(at(new THREE.OctahedronGeometry(.045),along(gR,[0,0,.66]),[90,30,0],[1,1.6,1]),(x,y,z,hh)=>lt(C(R.gem||'#9ad0ff'),.15+.4*hh))],
    heartstaff:()=>{ const hs=new THREE.Shape(); hs.moveTo(0,-.045); hs.bezierCurveTo(-.07,0,-.045,.055,0,.028); hs.bezierCurveTo(.045,.055,.07,0,0,-.045); return [pole(gR,-.42,.62,[.12,.1,.1],.01), S(at(new THREE.ExtrudeGeometry(hs,{depth:.018,bevelEnabled:false}),along(gR,[0,0,.66]),[90,0,0]),C('#ff8a3a'))]; },
    starwand:()=>{ const st2=new THREE.Shape(); for(let i=0;i<10;i++){ const r=i%2?.018:.045, a=i/10*PI*2; i?st2.lineTo(Math.sin(a)*r,Math.cos(a)*r):st2.moveTo(Math.sin(a)*r,Math.cos(a)*r); } st2.closePath(); return [pole(gR,-.04,.32,[.3,.34,.42],.008), S(at(new THREE.ExtrudeGeometry(st2,{depth:.01,bevelEnabled:false}),along(gR,[0,0,.36]),[90,0,0]),(x,y,z,hh)=>vary(Wc,hh,.08))]; },
    lantern:()=>[pole(gR,-.36,.62,WOOD,.012,.6), S(at(new THREE.CylinderGeometry(.022,.027,.055,6),along(gR,[0,-.07,.6])),(x,y,z,hh)=>lt(Wc,.3)), S(at(new THREE.ConeGeometry(.032,.028,6),along(gR,[0,-.07,.64])),[.28,.28,.3])],
    axe:()=>{ const sh=new THREE.Shape(); sh.moveTo(0,-.03); sh.lineTo(.04,-.04); sh.quadraticCurveTo(.1,-.07,.12,-.09); sh.quadraticCurveTo(.135,0,.12,.07); sh.quadraticCurveTo(.08,.05,.04,.035); sh.lineTo(0,.03); sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}); g.rotateX(PI/2); g.translate(gR[0]+.01,gR[1]+.006,gR[2]+.4);
      return [pole(gR,-.06,.46,WOOD,.013), S(g,(x,y,z,hh)=>vary(x>gR[0]+.11?[.82,.84,.88]:[.32,.34,.38],hh,.12))]; },
    mace:()=>[pole(gR,-.04,.4,WOOD,.015), shell(1,{r:[.05,.05,.05],p:along(gR,[0,0,.42]),col:[.36,.38,.36]}), ...[0,1,2,3,4,5,6,7].map(i=>{ const a=i*PI/4; return S(at(new THREE.ConeGeometry(.012,.05,4),along(gR,[Math.sin(a)*.05,Math.cos(a)*.05,.42]),[0,0,-a*180/PI]),[.6,.62,.6]); })],
    bamboo:()=>[S(tube([along(gR,[0,0,-.42]),along(gR,[0,.004,.1]),along(gR,[0,.006,.66])],[.016,.015,.014],8,16,{d:(p,u,v)=>{ const kk=Math.abs(Math.sin(v*PI*7))<.08?1.18:1; return [gR[0]+(p[0]-gR[0])*kk,p[1],p[2]]; }}),(x,y,z,hh)=>vary(Math.abs(Math.sin(z*22))<.12?[.5,.42,.2]:[.68,.6,.32],hh,.12))],
    rod:()=>[S(tube([along(gR,[0,0,-.1]),along(gR,[0,.01,.4]),along(gR,[0,.05,.8]),along(gR,[0,.12,1.0])],[.011,.009,.006,.004],6,12),(x,y,z,hh)=>vary([.62,.5,.3],hh,.2))],
    bow:()=>{ const pts=[], R0=.3; for(let i=0;i<=8;i++){ const a=(i/8-.5)*PI*.8; pts.push(along(gL,[0,Math.cos(a)*R0-R0+.01,Math.sin(a)*R0])); } return [S(tube(pts,[.006,.01,.012,.014,.016,.014,.012,.01,.006],6,16),(x,y,z,hh)=>Math.abs(z-gL[2])<.03?LEATH:vary([.5,.28,.15],hh,.12)), S(tube([pts[0],along(gL,[0,-R0*.3,0]),pts[8]],[.002,.002,.002],3,4),[.85,.82,.72])]; },
    mushroom:()=>[S(tube([along(gL,[0,0,-.02]),along(gL,[0,.02,.12]),along(gL,[0,.03,.2])],[.014,.013,.012],7,6),[.92,.88,.8]), S(at(lathe([[0,.05],[.06,.045],[.11,.02],[.13,0],[.1,-.006],[0,0]],18,8),along(gL,[0,.03,.2]),[90,0,0]),(x,y,z,hh)=>vary(Wc||[.86,.66,.46],hh,.08))],
    pipe:()=>[] };
  const LEFT={bow:1,mushroom:1};
  if(R.w&&WP[R.w])for(const sh of WP[R.w]())put(sh,LEFT[R.w]?'handL':'handR');
  if(R.shield){ const kc=C(R.shield), kite=R.sp==='frog', fa=J.forearmL, sp=[fa[0]+.03,(fa[1]+J.handL[1])/2,.05]; let g;
    if(kite){ const sh=new THREE.Shape(); sh.moveTo(-.09,.1); sh.lineTo(.09,.1); sh.quadraticCurveTo(.09,-.05,0,-.17); sh.quadraticCurveTo(-.09,-.05,-.09,.1); g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:true,bevelThickness:.004,bevelSize:.006,bevelSegments:1}); g.rotateY(PI/2); g.translate(sp[0],sp[1],sp[2]); }
    else{ g=lathe([[0,.012],[.06,.01],[.11,.004],[.12,0]],20,5); g.rotateZ(-PI/2); g.translate(sp[0],sp[1],sp[2]); }
    put(S(g,(x,y,z,hh)=>vary(Math.hypot(y-sp[1],z-sp[2])>.105?dk(kc,.25):kc,hh,.12)),'forearmL'); }
  const HOLD={ map:()=>[S(at(new THREE.PlaneGeometry(.12,.1),along(gL,[0,-.01,.06]),[0,90,0]),(x,y,z,hh)=>vary(hh>.85?[.5,.36,.24]:[.9,.84,.66],hh,.06))],
    herbs:()=>[0,1,2,3,4,5].map(i=>shell(1,{r:[.026,.04,.011],p:along(gL,[Math.sin(i)*.02,(i%3)*.01,.06+Math.cos(i*1.7)*.015]),rot:[i*30,i*50,i*20],col:fur([.26+i*.02,.48,.2],.2)})),
    orb:()=>[shell(2,{r:[.04,.04,.04],p:along(gL,[0,-.01,.035]),col:(u,hh)=>lt(C(R.orb||'#5ad0ff'),.2+.4*Math.max(0,u[1]))})],
    flute:()=>[S(tube([along(gR,[0,0,-.02]),along(gR,[0,0,.2]),along(gL,[0,0,.02])],[.011,.011,.011],7,10),(x,y,z,hh)=>vary([.72,.46,.24],hh,.12))],
    skull:()=>[shell(2,{r:[.036,.034,.04],p:[.11*b,.5,.09],col:(u,hh)=>u[2]>.5&&Math.abs(Math.abs(u[0])-.35)<.15&&Math.abs(u[1]-.1)<.15?BLACK:vary([.88,.85,.78],hh,.1)})],
    stones:()=>[0,1,2].map(i=>shell(1,{r:[.026,.022,.024],p:[-.12*b+i*.02,.46+(i%2)*.025,.07],col:fur([.5,.5,.48],.2),j:.004}))};
  if(R.hold&&HOLD[R.hold])for(const sh of HOLD[R.hold]())put(sh,R.hold==='skull'||R.hold==='stones'?'hips':R.hold==='flute'?'handR':'handL');
  // one geometry: each face flat, its normal from the screen (BODIES' material), held by its bones
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  geo.setAttribute('bi',new THREE.Float32BufferAttribute(BI,2)); geo.setAttribute('bw',new THREE.Float32BufferAttribute(BW,1)); geo.computeVertexNormals(); geo.computeBoundingSphere();
  return {key:'folk:'+R.k,label:R.n,geo:()=>geo,GEO:geo,height:1,hipY:.5,off,binv,tris:()=>P.length/9}; };
// the rig's pose turned onto a folk body: its walk from the rig's own gait, its arms by what it holds, and the moves it is making
{ const D=RIG.D, lerp=(a,b,u)=>a+(b-a)*u, L2=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
  // how each kind of thing is held (degrees: upper arm and forearm, each [forward, out]); the free arm keeps the walk's swing
  const HOLDS={blade:{R:{ua:[30,12],fa:[78,4]}},pole:{R:{ua:[14,14],fa:[62,6]}},spear:{R:{ua:[10,16],fa:[55,10]}},bow:{L:{ua:[30,8],fa:[70,4]}},shield:{L:{ua:[25,22],fa:[85,-8]}},
    lhold:{L:{ua:[22,8],fa:[78,0]}},flute:{R:{ua:[40,20],fa:[90,-55]},L:{ua:[40,20],fa:[90,-55]}}};
  // a move's keys: [u, {R:{ua,fa}, L:{ua,fa}, cyaw, bend, dz}, ease] in degrees; dz moves the body forward (in the rig's units)
  const G=HOLDS.blade.R, KEYS={
    slash:[[0,{R:G}],[.35,{R:{ua:[60,75],fa:[95,100]},cyaw:38,bend:-4}],[.5,{R:{ua:[78,-25],fa:[88,-48]},cyaw:-42,bend:8,dz:1.2},'fast'],[.62,{R:{ua:[55,-40],fa:[60,-65]},cyaw:-52,bend:10,dz:1.2}],[1,{R:G}]],
    back:[[0,{R:G}],[.35,{R:{ua:[70,-35],fa:[85,-70]},cyaw:-40,bend:-4}],[.5,{R:{ua:[78,55],fa:[88,80]},cyaw:42,bend:8,dz:1.2},'fast'],[.62,{R:{ua:[55,70],fa:[60,95]},cyaw:50,bend:10,dz:1.2}],[1,{R:G}]],
    overhead:[[0,{R:G}],[.4,{R:{ua:[165,12],fa:[175,6]},bend:-10,cyaw:8}],[.55,{R:{ua:[62,6],fa:[38,2]},bend:16,dz:1.6},'fast'],[.68,{R:{ua:[45,6],fa:[20,2]},bend:18,dz:1.6}],[1,{R:G}]],
    thrust:[[0,{R:G}],[.4,{R:{ua:[22,18],fa:[62,10]},cyaw:28,dz:-1}],[.52,{R:{ua:[86,2],fa:[90,0]},cyaw:-22,bend:10,dz:2.4},'fast'],[.7,{R:{ua:[84,2],fa:[90,0]},cyaw:-22,bend:10,dz:2.4}],[1,{R:G}]],
    draw:[[0,{L:HOLDS.bow.L,R:{ua:[10,10],fa:[30,8]}}],[.15,{L:{ua:[84,4],fa:[88,4]},R:{ua:[80,-8],fa:[86,-12]},cyaw:-25}],[.55,{L:{ua:[86,4],fa:[89,4]},R:{ua:[82,62],fa:[-88,-28]},cyaw:-35}],[.62,{L:{ua:[86,4],fa:[89,4]},R:{ua:[82,62],fa:[-88,-28]},cyaw:-35}],
      [.66,{L:{ua:[86,4],fa:[89,4]},R:{ua:[80,72],fa:[-100,-6]},cyaw:-35},'fast'],[1,{L:HOLDS.bow.L,R:{ua:[10,10],fa:[30,8]}}]]};
  FOLK.MOVEP=KEYS;
  const keyAt=(K,u)=>{ let i=0; for(;i<K.length-1&&u>K[i+1][0];i++); const a=K[i], c=K[Math.min(i+1,K.length-1)], w=c[0]>a[0]?Math.min(1,(u-a[0])/(c[0]-a[0])):1, e=c[2]==='fast'?1-Math.pow(1-w,3):w*w*(3-2*w), o={};
    for(const n of ['R','L']){ const A=a[1][n], B=c[1][n]; if(A||B){ const A2=A||B, B2=B||A; o[n]={ua:L2(A2.ua,B2.ua,e),fa:L2(A2.fa,B2.fa,e)}; } }
    for(const k of ['cyaw','bend','dz'])o[k]=lerp(a[1][k]||0,c[1][k]||0,e); return o; };
  const setArm=(P,n,q,u=1)=>{ if(!q)return; P[n].ua=L2(P[n].ua,[q.ua[0]*D,q.ua[1]*D],u); P[n].fa=L2(P[n].fa,[q.fa[0]*D,q.fa[1]*D],u); };
  FOLK.drive=(N,c,dt,A,R,grip)=>{ const SR=N.SR; SR.target=c.mv>.3?1:0; RIG.step(SR,dt);
    const P=RIG.walkPose(SR,null), t=c.t;
    // what is held: blades up before you, poles planted, a bow out in front; shields and held things in the left
    const H=grip==='blade'?HOLDS.blade:grip==='pole'?(R.w==='spear'?HOLDS.spear:HOLDS.pole):grip==='bow'?HOLDS.bow:null;
    if(H){ setArm(P,'R',H.R); setArm(P,'L',H.L); if(grip==='pole'&&c.mv>.1){ P.R.ua[0]+=Math.sin(SR.ph*Math.PI*2)*8*D*c.mv; } }
    if(R.shield)setArm(P,'L',HOLDS.shield.L); if(R.hold==='map'||R.hold==='herbs'||R.hold==='orb'||R.w==='mushroom')setArm(P,'L',HOLDS.lhold.L); if(R.hold==='flute'){ setArm(P,'R',HOLDS.flute.R); setArm(P,'L',HOLDS.flute.L); }
    // breathing, a glance, the act of the moment
    P.bend+=Math.sin(t*1.7)*.012; P.look=(c.look||0)+(A.look||0); P.nod=(A.nod||0);
    const k=A.k||0, at=A.t||0;
    if(A.act==='scan'){ P.look=Math.sin(at*.7)*.8*k; P.nod=-.08*k; }
    if(A.act==='salute'){ const u=(at<.25?at/.25:at<1.4?1:Math.max(0,1-(at-1.4)/.3))*k; setArm(P,'L',{ua:[150,35],fa:[118,-70]},u); }
    if(A.act==='raise'){ const u=Math.min(1,at/.5)*Math.max(0,Math.min(1,(2.4-at)/.5))*k; setArm(P,'R',{ua:[150,12],fa:[165,6]},u); P.nod=-.15*u; }
    if(A.act==='wave'){ setArm(P,'L',{ua:[155,40],fa:[150+Math.sin(t*11)*20,-30]},k); }
    // a move under way: the keys of the swing, thrust or draw
    if(A.mv&&KEYS[A.mv.k]){ const q=keyAt(KEYS[A.mv.k],Math.min(1,A.mv.t/((GUARD.MOVE[A.mv.k]||{T:1}).T))); setArm(P,'R',q.R); setArm(P,'L',q.L); P.cyaw+=q.cyaw*D; P.bend+=q.bend*D; P.root.z+=q.dz; }
    // sitting: thighs forward, shins down, the body down onto the seat
    if(R.pose==='sit'||A.sit){ for(const n of ['L','R']){ P[n].th=[86*D,10*D]; P[n].sh=[0,4*D]; } P.root={x:P.root.x,y:P.root.y*.56,z:P.root.z}; P.bend+=.06; }
    const B=RIG.settle(RIG.build(P,null),0,false,true); BODIES.pose(B,N.FIG.PM,N.fbody); }; }
