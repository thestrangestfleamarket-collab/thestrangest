// THE APARTMENTS: the brownstone apartment house on the street as one painted block (brick, windows, flower boxes, ivy), its 3D fire escapes with plants and its stoop; YOUR APARTMENT inside is built off the map when you go in (its own builder).
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, st, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, FIX, grab, LOTX, MODS, SOL, TILE, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
const APTS={EMPTY:true};
await grab('apts',async()=>{ const {X,Z,faceTex,bq,C}=SHARED.BOD, Yr=SHARED.BOD.Y,
  RZ=APTS.RZ=28, Y=z=>Yr(z+RZ), gbox=(b,k)=>SHARED.BOD.gbox({...b,z0:b.z0+RZ,z1:b.z1+RZ},k), R0=APTS.R0=Yr(RZ)-Yr(0), {hash}=SHARED.BOD.g, {LSEED,STORY,sh}=SHARED.BOD.K, S=STORY, ST=5, AH=ST*S, TOP=RZ+AH, W=LSEED.walk, T=.1;
  const A={x0:LOTX(WP.apts.x0),x1:LOTX(WP.apts.x1),y0:W-14,y1:W}, m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, DW=.78, DH=94;
  APTS.A=A; APTS.H=H; APTS.floors=ST; APTS.DX=m;
  const TN=SHARED.BOD.g.hash, vn=BLOCKS.vn, gr=(x,y,k,s=1)=>(vn(x/(5*s),y/(5*s),k)*3+vn(x/(1.7*s),y/(1.7*s),k+2)*2+vn(x*2.3/s,y*2.3/s,k+4))/6;
  const rock=(base,sd,bw=.6,bh=9,mid)=>{ const P=(a,z,f)=>{ const ui=a*24, bc=Math.floor(z/bh), p=ui+(bc&1)*bw*12, bi=Math.floor(p/(bw*24)), fx=p-bi*bw*24, fy=z-bc*bh;
      if(fy<1||fx<1)return sh(base,f*.7); let k=(.9+.16*TN(bi,bc,sd))*(1+.14*(gr(ui/24,z/24,sd+4,1)-.5))*(z<5?.8+.04*z:1); if(fy>=bh-1)k*=1.08; return sh(base,f*k); };
    return {fs:(nx,ny,X_,Y_,z,f)=>P(nx?Y_:X_,z,f),top:(x,y)=>{ let k=1+.12*(gr(x,y,sd+10,.5)-.5); if(mid)k*=1+.1*Math.max(0,1-Math.abs(x-mid[0])/mid[1]); return sh(base,k); }}; };

  const FWU=[3.25,9.75], DU=6.5, DI=.85, DO=1.65, RD=5.3, steel=[34,36,40];
  const feats=[]; let seed=3; const win=(side,a,z0,z1,o={})=>{ seed++; feats.push({side,a0:a-.55,a1:a+.55,z0,z1,lit:hash(seed,1,9)<.45,seed,box:!o.door&&hash(seed,4,9)<.78,...o}); };
  for(const [side] of [['f'],['b']])for(let lv=0;lv<ST;lv++){ const z=RZ+lv*S; for(const u of FWU)win(side,A.x0+u,z+42,z+94); if(lv)win(side,A.x0+DU,z+3,z+94,{door:true,lit:false}); }
  feats.push({side:'f',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,arch:true,lit:false,seed:41},{side:'b',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,lit:false,seed:43});
  for(const [side,a0,a1] of [['w',A.y0,A.y1],['e',A.y0,A.y1]])for(let lv=1;lv<ST;lv++)for(const k of [.22,.5,.78])win(side,a0+(a1-a0)*k,RZ+lv*S+42,RZ+lv*S+94,{box:false});
  const ivy=[{side:'f',a0:A.x0,a1:A.x0+2.4,h:RZ+S*1.7,seed:5,fall:.6},{side:'f',a0:A.x1-2,a1:A.x1,h:RZ+S*2.4,seed:7,fall:.6},{side:'w',a0:A.y1-4.5,a1:A.y1,h:RZ+S*2.2,seed:9,fall:.8},{side:'e',a0:A.y0+4,a1:A.y1-.4,h:RZ+S*2.1,seed:11},{side:'b',a0:A.x0+10,a1:A.x1,h:RZ+S*1.4,seed:13,fall:.6}];
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*4),Math.floor(y*4),61), e=Math.min(x-A.x0,A.x1-x,y-A.y0,A.y1-y); return e<.25?sh([118,50,38],e<.1?.8:1.05):n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const PAINT=APTS.paint=BLOCKS.facade({feats,ivy,top:TOP,wall:BLOCKS.brick([138,60,44]),trim:[118,50,38],base:{z1:RZ,paint:BLOCKS.brick([120,52,40])}}), BB=BLOCKS.make({...A,z0:0,z1:TOP,kind:'A',roof:roofCol,paint:PAINT});
  { const CN=[118,50,38]; SHARED.BOD.gbox({x0:A.x0-.3,x1:A.x1+.3,y0:A.y0-.3,y1:A.y1+.3,z0:TOP-12,z1:TOP,c:CN,...rock(CN,61,.9,14)},'A'); }

  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  const U=u=>A.x0+u, V=v=>A.y0+v; APTS.U=U; APTS.V=V;
  const ESC=[{yf:A.y1,o:1,lx:11.9,k:'A'},{yf:A.y0,o:-1,lx:1.1,k:'E'}].map(F=>({...F,ua:.8,ub:12.6}));
  const ESCB=(F,lvs,h0,h1,keep)=>{ const Yd=d=>F.yf+F.o*d, B=(u0,u1,d0,d1,z0,z1,top)=>gbox({x0:U(u0),x1:U(u1),y0:Math.min(Yd(d0),Yd(d1)),y1:Math.max(Yd(d0),Yd(d1)),z0,z1,c:steel,foot:0,top:top?(x,y)=>(Math.floor(x*10)+Math.floor(y*10))&1?sh(steel,.6):steel:null},F.k);
    const rs=(lv,u0,u1,d0,d1)=>{ if(!keep)return; const a=Z(Yd(d0)), b=Z(Yd(d1)); SOLS[lv].push([X(U(u0)),Math.min(a,b),X(U(u1)),Math.max(a,b)]); };
    const rail=(lv,u0,u1,d0,d1)=>{ rs(lv,u0,u1,d0,d1); const z=lv*S, al=u1-u0>d1-d0, L=al?u1-u0:d1-d0, n=Math.max(1,Math.round(L/.36));
      B(u0,u1,d0,d1,z+30,z+33); B(u0,u1,d0,d1,z+14,z+16); for(let i=0;i<=n;i++){ const t=i/n*L; al?B(u0+t-.02,u0+t+.02,d0,d1,z,z+30):B(u0,u1,d0+t-.02,d0+t+.02,z,z+30); } };
    for(const lv of lvs){ const z=lv*S; B(F.ua,F.ub,0,DI,z-3,z,1);
      B(F.ua,F.lx-.4,DI,DO,z-3,z,1); B(F.lx+.4,F.ub,DI,DO,z-3,z,1);
      B(F.ua,F.ub,DO-.06,DO,z-9,z); for(let u=F.ua+.3;u<F.ub;u+=2.4)B(u,u+.06,0,DO,z-12,z-3);
      rail(lv,F.ua,F.ub,DO-.05,DO); rail(lv,F.ua,F.ua+.05,0,DO); rail(lv,F.ub-.05,F.ub,0,DO);
      const sp=[F.ua+.45,F.ua+1.5,F.ua+2.6,F.ub-2.4,F.ub-1.4,F.ub-.45].filter(u=>Math.abs(u-F.lx)>.7&&Math.abs(u-DU)>.95), K=['pot','flower','fern','tall','flower'];
      sp.forEach((u,i)=>{ const h=hash(lv,i,F.o+5); if(h<.25)return; const kd=K[Math.floor(hash(lv,i,F.o+7)*K.length)]; BLOCKS.card(U(u),Yd(DO-.3),RZ+z,.7,kd==='tall'?54:kd==='fern'?40:46,kd,lv*13+i*7+F.o,F.k); });
      for(const [du,j] of [[-1.05,0],[1.05,1]])BLOCKS.card(U(DU+du),Yd(.4),RZ+z,.6,hash(lv,j,F.o+13)<.5?34:44,K[Math.floor(hash(lv,j+8,F.o)*K.length)],lv*17+j*5+F.o+29,F.k);
      if(hash(lv,3,F.o+9)<.6)BLOCKS.card(U(DU+(hash(lv,4,F.o)<.5?-1.3:1.3)),Yd(DO-.2),RZ+z+33,1.1,12,'flower',lv*5+F.o+17,F.k,false);
      if((lv<ST-1||!keep)&&hash(lv,5,F.o+11)<.7)BLOCKS.card(U(F.ua+.6+hash(lv,6,F.o)*(F.ub-F.ua-1.2)),Yd(DO-.35),RZ+z+S-58,.6,46,'hang',lv*9+F.o+3,F.k); }
    const l=F.lx, H1=Math.min(h1,AH+38); for(const u of [l-.24,l+.2]){ for(let h=h0;h<H1;h+=S)B(u,u+.04,DI+.03,DI+.07,h,Math.min(H1,h+S)); if(h1>=AH){ B(u,u+.04,-.35,DI+.07,AH+34,AH+38); B(u,u+.04,-.39,-.35,AH,AH+38); } }
    for(let h=h0+10;h<Math.min(h1,AH+32);h+=12)B(l-.2,l+.2,DI+.04,DI+.06,h,h+2); };
  for(const F of ESC)ESCB(F,Array.from({length:ST-1},(_,i)=>i+1),-RZ,AH+38,true);
  Object.assign(APTS,{ESC,DU,DI,DO,S,ST,TOP,escape:(F,lvs,h0,h1)=>ESCB(F,lvs,h0,h1,false)});

  const ST0={x0:m-DW-.25,x1:m+DW+.25,y0:A.y1,land:.85,tr:.42,n:3}; ST0.y1=A.y1+ST0.land+ST0.n*ST0.tr; APTS.ST0=ST0;
  { const BS=[98,95,90], NO=[136,131,122], CH=[86,84,80], IRN=[28,30,34], top=i=>(RZ+1)*(ST0.n-i)/(ST0.n+1), MID=[(ST0.x0+ST0.x1)/2,(ST0.x1-ST0.x0)/2], g=b=>SHARED.BOD.gbox(b.c===IRN?b:{...b,...rock(b.c,b.c===CH?67:63,.7,9,b.c===CH?null:MID)},'A');
    g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+1,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0+ST0.land-.06,y1:ST0.y0+ST0.land,z0:RZ-1,z1:RZ+1,c:NO});
    for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, h=top(i); g({x0:ST0.x0,x1:ST0.x1,y0,y1:y0+ST0.tr,z0:0,z1:h,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:y0+ST0.tr-.06,y1:y0+ST0.tr,z0:h-2,z1:h,c:NO}); }
    for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ g({x0:c0,x1:c1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+7,c:CH});
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr; g({x0:c0,x1:c1,y0,y1:y0+ST0.tr,z0:0,z1:top(i)+7,c:CH}); }
      const xm=(c0+c1)/2, rail=(y0,y1,z)=>g({x0:xm-.03,x1:xm+.03,y0,y1,z0:z,z1:z+2,c:IRN}), post=(y,z0,z1)=>g({x0:xm-.025,x1:xm+.025,y0:y-.025,y1:y+.025,z0,z1,c:IRN});
      rail(ST0.y0,ST0.y0+ST0.land,RZ+7+26); for(let y=ST0.y0+.12;y<ST0.y0+ST0.land;y+=.18)post(y,RZ+7,RZ+7+26);
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, z=top(i)+7; rail(y0,y0+ST0.tr,z+26); post(y0+ST0.tr*.3,z,z+26); post(y0+ST0.tr*.75,z,z+26); }
      g({x0:xm-.06,x1:xm+.06,y0:ST0.y1-.12,y1:ST0.y1,z0:top(ST0.n-1)+7,z1:top(ST0.n-1)+7+34,c:IRN}); }
    BLOCKS.card(ST0.x0+.22,ST0.y0+.5,RZ+1,.4,34,'tall',71,'A'); BLOCKS.card(ST0.x1-.22,ST0.y0+.5,RZ+1,.4,26,'flower',73,'A'); }

  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})});
  APTS.MKA=MKA; BATCH.build(MKA); const AM=Object.values(BATCH.meshes); APTS.back=BATCH.all(BATCH.meshes,'E'); BATCH.meshes={}; APTS.meshes=AM; for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }

  const SY=APTS.SY=Y(S)-Y(0), ix=x=>x/(TILE*BLDK)+SHARED.BOD.OX, iy=z=>z/(TILE*BLDK)+SHARED.BOD.OY, TOL=Y(24)-Y(0);
  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const BLK=box4(A.x0,A.y0,A.x1,A.y1); SOL.up.push(BLK); FIX.up.push([BLK[0],BLK[1],0,BLK[2],BLK[3],Yr(TOP)]);
  for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ const r=box4(c0,ST0.y0,c1,ST0.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],.05]); }
  const EDGE=[box4(A.x0,A.y1-T,A.x1,A.y1),box4(A.x0,A.y0,A.x1,A.y0+T),box4(A.x0,A.y0,A.x0+T,A.y1),box4(A.x1-T,A.y0,A.x1,A.y1)];
  const LAD={F:null,y:0}, LV=38, LAND=Array.from({length:ST-1},(_,i)=>(i+1)*S), LS_=[-RZ,...LAND,AH], RFY=R0+SY*(ST-.3);
  const EG=(x,z)=>{ if(!window.POSOK||Math.abs(x-pos.x)+Math.abs(z-pos.z)>.5*TILE)return null; if(LAD.F)return Y(LAD.y); const u=ix(x)-A.x0;
    for(const F of ESC){ const d=(iy(z)-F.yf)*F.o; if(d<0||d>DO||u<F.ua||u>F.ub)continue; let b=null; for(const c of LAND)if(Y(c)<=SHARED.py+TOL&&(b==null||c>b))b=c; return b==null?null:Y(b); }
    return null; };
  APTS.stoop=(x,z)=>{ const u=ix(x), v=iy(z); if(u<ST0.x0||u>ST0.x1||v<ST0.y0||v>=ST0.y1)return EG(x,z); const t=v-ST0.y0; if(t<ST0.land)return Y(1);
    const i=Math.floor((t-ST0.land)/ST0.tr); return Yr((RZ+1)*(ST0.n-i)/(ST0.n+1)); };
  const HIT=new THREE.MeshBasicMaterial({visible:false}), bx=(w,h,d,mt)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);
  const reg=o=>{ o.ghost=1; const f=()=>{ try{ UI.thing(o); }catch(e){ setTimeout(f,400); } }; setTimeout(f,0); };
  const lpt=(F,d)=>[X(U(F.lx)),Z(F.yf+F.o*d)];
  for(const F of ESC)for(const y of LS_){ const [x,z]=lpt(F,y===AH?-.6:1.1), hb=bx(.5*TILE,Y(60)-Y(0),.5*TILE,HIT); hb.position.set(x,Y(y+30),z); scene.add(hb);
    reg({name:'FIRE ESCAPE LADDER',obj:hb,reach:.6*TILE,near:2.2*TILE,tall:1*TILE,act:()=>{ if(!LAD.F&&Math.abs(SHARED.py-Y(y))<SY*.3)lgo(F,y); }}); }
  APTS.inside=(x,z)=>x>BLK[0]&&x<BLK[2]&&z>BLK[1]&&z<BLK[3];
  APTS.lvY=lv=>R0+lv*SY; APTS.lvOf=y=>Math.max(0,Math.min(ST-1,Math.floor((y-R0)/SY+.08)));
  APTS.floor=()=>window.POSOK?APTS.lvOf(SHARED.py):0;
  const lpos=F=>{ const [x,z]=lpt(F,1.3); pos.x=x; pos.z=z; SHARED.heading=Math.atan2(0,Math.sign(Z(F.yf)-z)||1); };
  const lgo=(F,y)=>{ LAD.F=F; LAD.y=y; lpos(F); st.climb={z:0,ph:y}; SHARED.target=null; };
  const loff=top=>{ const F=LAD.F, [x,z]=lpt(F,top?-1:.45); LAD.F=null; st.climb=null; pos.x=x; pos.z=z; };
  APTS.lad=(dt,up,dn,off)=>{ if(!window.POSOK||SHARED.LVL!=='up')return false;
    if(!LAD.F){ if(!(up||dn))return false; for(const F of ESC){ const u=ix(pos.x)-A.x0, d=(iy(pos.z)-F.yf)*F.o; if(Math.abs(u-F.lx)>.5)continue;
        if(d>DI&&d<DO)for(const y of [-RZ,...LAND])if(Math.abs(SHARED.py-Y(y))<SY*.25&&(up||y>S)){ lgo(F,y); return true; }
        if(dn&&d<0&&d>-1.5&&SHARED.py>RFY){ lgo(F,AH); return true; } } return false; }
    const [x,z]=lpt(LAD.F,1.3); if(Math.hypot(pos.x-x,pos.z-z)>1.5*TILE){ LAD.F=null; st.climb=null; return false; }
    const at=LS_.find(y=>Math.abs(LAD.y-y)<4);
    if(at!=null&&off&&!up&&!dn){ loff(at===AH); return false; }
    if(up){ if(LAD.y>=AH-22){ loff(1); RIG.act(st,'mantle'); return false; } LAD.y=Math.min(AH,LAD.y+LV*dt); }
    else if(dn){ if(LAD.y<=-RZ){ loff(0); return false; } LAD.y=Math.max(-RZ,LAD.y-LV*dt); }
    if(st.climb)st.climb.ph=LAD.y;
    else { const n=LS_.reduce((p,q)=>Math.abs(q-LAD.y)<Math.abs(p-LAD.y)?q:p); if(Math.abs(n-LAD.y)<10)LAD.y+=(n-LAD.y)*Math.min(1,dt*8); }
    lpos(LAD.F); return true; };
  APTS.ground=(x,z)=>!window.POSOK?R0:SHARED.py>RFY?R0+SY*ST:R0;
  const EB=ESC.map(F=>box4(U(F.ua-.05),F.yf,U(F.ub+.05),F.yf+F.o*(DO+.05))), ovl=(s,b)=>s[0]<b[2]&&s[2]>b[0]&&s[1]<b[3]&&s[3]>b[1];
  APTS.in=false; APTS.esc=false; let was=-1;
  APTS.tick=()=>{ const ib=APTS.inside(pos.x,pos.z), roof=ib&&window.POSOK&&SHARED.py>RFY, eg=!ib&&SHARED.LVL==='up'&&EG(pos.x,pos.z)!=null, lv=APTS.floor();
    APTS.in=!!ROOMS.offIn&&ROOMS.offIn()==='apt'; APTS.esc=eg;
    const key=(eg?2:0)+(roof?16:0)+lv*4; if(key!==was){ was=key; return eg?SOL.up.filter(s=>s===BLK||!EB.some(b=>ovl(s,b))).concat(SOLS[lv]):roof?SOL.up.filter(s=>s!==BLK).concat(EDGE):SOL[SHARED.LVL]||SOL.up; } return null; };
  window.HOUSEAT=(dy=0)=>[X(m),Z(A.y1+dy)];
  window.APTSDBG=()=>({in:APTS.in,esc:APTS.esc,floor:APTS.floor(),py:SHARED.py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],door:+X(m).toFixed(1),lad:LAD.F?+LAD.y.toFixed(1):null,block:BB});

  const AR={x0:1300,y0:-100,x1:1312,y1:-91}, AX=(AR.x0+AR.x1)/2, WH=S-10, MY=APTS.my=ST-1, DC=AR.x0+3.98; APTS.R=AR; APTS.fw=[AX,AR.y0];
  const FURN=[]; let PA=null, AS=[], AG=null;
  APTS.furnish=(lv,fn)=>{ FURN.push(fn); if(PA){ const Q=ROOMS.part(AG,fn); for(const k of ['objs','things','cuts','lights'])PA[k].push(...Q[k]); } };
  const build=()=>{ '@apts'; const K=SHARED.BOD.K, n0=K.PROPS.length, l0=SHARED.BOD.STOREK.LAMPS.length; AG=new THREE.Group(); AG.name='apts-in'; scene.add(AG); AS=[];
    const sol=(x0,y0,x1,y1)=>{ const r=box4(x0,y0,x1,y1); AS.push(r); SOL.up.push(r); };
    const boards=(x,y)=>{ const i=Math.floor(y*6), j=Math.floor(x*.6+i*.37), n=hash(j,i,41); return sh([150,112,76],.86+.22*n+(y*6-i<.1?-.2:0)); };
    const plaster=(u,z,f)=>{ if(z<5)return sh([96,70,48],f*(z<1?.7:1.1)); if(z<38)return sh(z>35?[186,176,150]:[120,138,112],f*(z>35?1.08:(Math.floor(u*8)&1)?.92:1)); if(z>WH-6)return sh([224,218,206],f*.9);
      const n=hash(Math.floor(u*24),Math.floor(z),33); return sh(n<.04?[206,200,186]:[218,210,192],f); };
    PA=ROOMS.part(AG,()=>{
      bq([X(AR.x0),Yr(.15),Z(AR.y1)],[X(AR.x1),Yr(.15),Z(AR.y1)],[X(AR.x1),Yr(.15),Z(AR.y0)],[X(AR.x0),Yr(.15),Z(AR.y0)],faceTex((AR.x1-AR.x0)*24,(AR.y1-AR.y0)*24,(i,j)=>C(boards(AR.x0+(i+.5)/24,AR.y1-(j+.5)/24))),'A');
      const wall=(ax,at,a0,a1,f,P)=>{ bq(P(a0,0),P(a1,0),P(a1,WH),P(a0,WH),faceTex((a1-a0)*24,WH,(i,j)=>C(plaster(a0+(i+.5)/24,WH-j-.5,f))),'A'); ax==='x'?sol(a0,at-.1,a1,at+.1):sol(at-.1,a0,at+.1,a1); };
      const px=(at,o)=>(a,z)=>[X(a),Yr(z),Z(at+o)], py=(at,o)=>(a,z)=>[X(at+o),Yr(z),Z(a)];
      wall('x',AR.y0,AR.x0,AR.x1,.84,px(AR.y0,0)); wall('x',AR.y1,AR.x0,AR.x1,.84,px(AR.y1,0)); wall('y',AR.x0,AR.y0,AR.y1,.68,py(AR.x0,0)); wall('y',AR.x1,AR.y0,AR.y1,.68,py(AR.x1,0));
      const pane=(P,a,z0,z1,lit,sd,door)=>SHARED.BOD.window([P(a-.55,z0),P(a+.55,z0),P(a+.55,z1),P(a-.55,z1)],1.1,z1-z0,lit,sd,'A',door);
      pane(px(AR.y0,.03),AR.x0+2.75,42,94,false,5); pane(px(AR.y0,.03),AR.x1-2.75,42,94,false,6); pane(px(AR.y0,.03),AX,3,94,false,7,true);
      pane(px(AR.y1,-.03),AR.x0+1.6,42,94,false,8); pane(px(AR.y1,-.03),AR.x1-2.4,42,94,false,9); pane(py(AR.x0,.03),AR.y0+4.5,42,94,false,10);
      { const d0=DC-.78, d1=DC+.78, Wd=Math.round((d1-d0)*24), WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84];
        const dp=(ii,jj)=>{ const z=DH-jj, q=(ii+.5)/Wd; if(ii<2||ii>=Wd-2||z>DH-2)return WK; if(q>.82&&q<.9&&Math.abs(z-DH*.42)<2)return BR; const tp=z>DH*.55; if(q>.16&&q<.84&&(tp?z>DH*.6&&z<DH*.92:z>DH*.1&&z<DH*.48))return (ii+jj)%7?WL:WD; return WD; };
        const P=px(AR.y1,-.03); bq(P(d0,0),P(d1,0),P(d1,DH),P(d0,DH),faceTex(Wd,DH,(ii,jj)=>C(dp(ii,jj))),'A'); APTS.door=[(d0+d1)/2,AR.y1]; }
      const put=(k,x,y,r=0,solid=true)=>{ const f=K.CATALOG[k]; if(!f)return null; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; SHARED.BOD.place(p,r); for(const b of p.boxes)SHARED.BOD.gbox(b,'A');
        const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(solid&&!p.walk&&!p.high&&bs.length)sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1))); return p; };
      const x0=AR.x0, y0=AR.y0, x1=AR.x1, y1=AR.y1;
      put('patterned rug',x0+3,y0+5,0,false); put('sofa',x0+.7,y0+5,1); put('coffee table',x0+2.6,y0+5); put('TV on a low stand',x0+5.1,y0+5,3); put('floor lamp',x0+.5,y0+7.6);
      put('single bed',x1-1.2,y0+1.7,0); put('fiddle-leaf fig',x1-.5,y0+4); put('bookcase',x0+.35,y0+2.2,1); put('plant pot',x0+4.5,y0+.5);
      put('sink and counter',x1-2.2,y1-.45,2); put('stove',x1-3.6,y1-.45,2); put('fridge',x1-.6,y1-.5,2); put('dining table',x1-2.4,y1-2.8); put('pothos shelf',x0+.2,y0+7.2,1,false);
      put('hanging pothos',x1-2.75,y0+.5,0,false); put('hanging pothos',x0+.5,y0+4.5,1,false); put('stack of books with a candle',x0+5.1,y0+6.2);
      for(const [lx,ly] of [[x0+3,y0+5],[x1-2.6,y0+3]]){ const L=new THREE.PointLight(0xffe2b8,5,7*TILE,1.6); L.position.set(X(lx),Yr(WH-14),Z(ly)); scene.add(L); }
      for(const f of FURN)f(); },MKA);
    K.PROPS.length=n0; SHARED.BOD.STOREK.LAMPS.length=l0; return PA; };
  const unbuild=()=>{ for(const r of AS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } AS=[]; PA=null; if(AG){ AG.removeFromParent(); AG=null; } };
  const wb=box4(AR.x0-.2,AR.y0-.2,AR.x1+.2,AR.y1+.2);
  ROOMS.off.apt={name:'YOUR APARTMENT',box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Yr(S)},need:()=>LOAD('apts','later'),build,unbuild,spawn:[X(DC),Z(AR.y1-1.3),0,Math.PI],out:[X(m),Z(A.y1+.7),Y(1),0],
    door:[X(m),Y(0),Z(A.y1+.25)],exit:[X(DC),0,Z(AR.y1-.25)],exitName:'OUT TO THE STREET'};
  APTS.spawn=ROOMS.off.apt.spawn;
  MODS.apts=APTS; });
