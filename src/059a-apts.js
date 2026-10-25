// THE APARTMENTS: the brownstone apartment house on the street as one painted block (brick, windows, flower boxes, ivy), its 3D fire escapes with plants and its stoop; YOUR APARTMENT inside is built off the map when you go in (its own builder).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, pos, ROOMS, st, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, cutWalls, FADE, FIX, grab, LOTX, LOTY, MODS, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
const APTS={EMPTY:true};
await grab('apts',async()=>{ const {X,Z,faceTex,bq,C}=SHARED.BOD, Yr=SHARED.BOD.Y,
  RZ=APTS.RZ=28, Y=z=>Yr(z+RZ), gbox=(b,k)=>tgbox({...b,z0:b.z0+RZ,z1:b.z1+RZ},k), R0=APTS.R0=Yr(RZ)-Yr(0), {hash}=SHARED.BOD.g, {LSEED,STORY,sh}=SHARED.BOD.K, S=STORY, ST=12, AH=ST*S, TOP=RZ+AH, W=LSEED.walk, T=.1;
  const AY=WP.apts.y1!=null?LOTY(WP.apts.y1):W, AW=WP.apts.y1!=null?{x0:LOTX(WP.apts.x0),x1:LOTX(WP.apts.x1),y0:LOTY(WP.apts.y0),y1:AY}:{x0:LOTX(WP.apts.x0),x1:LOTX(WP.apts.x1),y0:AY-14,y1:AY}, TA=TURN(AW,WP.apts.face), A=TA.L, m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, DW=.78, DH=94;
  const XZ=(x,y)=>{ const p=TA.pt(x,y); return [X(p[0]),Z(p[1])]; }, loc=(x,z)=>TA.back(x/(TILE*BLDK)+SHARED.BOD.OX,z/(TILE*BLDK)+SHARED.BOD.OY);
  const tgbox=(b,k)=>{ if(!TA.q)return SHARED.BOD.gbox(b,k); const p={boxes:[b],x0:b.x0,y0:b.y0,x1:b.x1,y1:b.y1}; SHARED.BOD.placeAt(p,TA.q,TA.cx,TA.cy,TA.cx,TA.cy); return SHARED.BOD.gbox(p.boxes[0],k); };
  const tcard=(x,y,z,w,h,kind,seed,k,cross=true)=>{ const p=TA.pt(x,y); BLOCKS.card(p[0],p[1],z,w,h,kind,seed,k,cross,!!(TA.q&1)); };
  const tbox4=(x0,y0,x1,y1)=>{ const r=TA.box(x0,y0,x1,y1), a=X(r.x0), b=X(r.x1), c=Z(r.y0), d=Z(r.y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  APTS.A=AW; APTS.AL=A; APTS.T=TA; APTS.H=H; APTS.floors=ST; APTS.DX=m;
  const TN=SHARED.BOD.g.hash, vn=BLOCKS.vn, gr=(x,y,k,s=1)=>(vn(x/(5*s),y/(5*s),k)*3+vn(x/(1.7*s),y/(1.7*s),k+2)*2+vn(x*2.3/s,y*2.3/s,k+4))/6;
  const rock=(base,sd,bw=.6,bh=9,mid)=>{ const P=(a,z,f)=>{ const ui=a*24, bc=Math.floor(z/bh), p=ui+(bc&1)*bw*12, bi=Math.floor(p/(bw*24)), fx=p-bi*bw*24, fy=z-bc*bh;
      if(fy<1||fx<1)return sh(base,f*.7); let k=(.9+.16*TN(bi,bc,sd))*(1+.14*(gr(ui/24,z/24,sd+4,1)-.5))*(z<5?.8+.04*z:1); if(fy>=bh-1)k*=1.08; return sh(base,f*k); };
    return {fs:(nx,ny,X_,Y_,z,f)=>P(nx?Y_:X_,z,f),top:(x,y)=>{ let k=1+.12*(gr(x,y,sd+10,.5)-.5); if(mid)k*=1+.1*Math.max(0,1-Math.abs(x-mid[0])/mid[1]); return sh(base,k); }}; };

  const FWU=[3.25,9.75], DU=6.5, DI=.85, DO=1.65, RD=5.3, steel=[34,36,40], WINA=Math.round(S*.12), WINB=Math.round(S*.88), WDH=1.5;
  const feats=[]; let seed=3; const win=(side,a,z0,z1,o={})=>{ seed++; feats.push({side,a0:a-.55,a1:a+.55,z0,z1,lit:hash(seed,1,9)<.45,seed,box:!o.door&&hash(seed,4,9)<.78,...o}); };
  for(const [side] of [['f'],['b']])for(let lv=0;lv<ST;lv++){ const z=RZ+lv*S; for(const u of FWU)win(side,A.x0+u,z+42,z+94); if(lv)win(side,A.x0+DU,z+3,z+94,{door:true,lit:false}); }
  feats.push({side:'f',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,arch:true,lit:false,seed:41},{side:'b',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,lit:false,seed:43});
  for(const [side,a0,a1] of [['w',A.y0,A.y1],['e',A.y0,A.y1]])for(let lv=1;lv<ST;lv++)for(const k of [.22,.5,.78])win(side,a0+(a1-a0)*k,RZ+lv*S+42,RZ+lv*S+94,{box:false});
  const ivy=[{side:'f',a0:A.x0,a1:A.x0+2.4,h:RZ+S*1.7,seed:5,fall:.6},{side:'f',a0:A.x1-2,a1:A.x1,h:RZ+S*2.4,seed:7,fall:.6},{side:'w',a0:A.y1-4.5,a1:A.y1,h:RZ+S*2.2,seed:9,fall:.8},{side:'e',a0:A.y0+4,a1:A.y1-.4,h:RZ+S*2.1,seed:11},{side:'b',a0:A.x0+10,a1:A.x1,h:RZ+S*1.4,seed:13,fall:.6}];
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*4),Math.floor(y*4),61), e=Math.min(x-A.x0,A.x1-x,y-A.y0,A.y1-y); return e<.25?sh([118,50,38],e<.1?.8:1.05):n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const PAINT=APTS.paint=BLOCKS.facade({feats,ivy,top:TOP,wall:BLOCKS.brick([138,60,44]),trim:[118,50,38],base:{z1:RZ,paint:BLOCKS.brick([120,52,40])}}), BB=BLOCKS.make({...AW,z0:0,z1:TOP,kind:'A',turn:TA,roof:(x,y)=>roofCol(...TA.back(x,y)),paint:PAINT});   // the house on the street is a solid painted block (floors 1-9 just a block); your floor-10 apartment is built off the map
  { const CN=[118,50,38]; tgbox({x0:A.x0-.3,x1:A.x1+.3,y0:A.y0-.3,y1:A.y1+.3,z0:TOP-12,z1:TOP,c:CN,...rock(CN,61,.9,14)},'A'); }

  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  const U=u=>A.x0+u, V=v=>A.y0+v; APTS.U=U; APTS.V=V;
  const ESC=[{yf:A.y1,o:1,lx:11.9,k:'A'},{yf:A.y0,o:-1,lx:1.1,k:'E'}].map(F=>({...F,ua:.8,ub:12.6}));
  const ESCB=(F,lvs,h0,h1,keep)=>{ const Yd=d=>F.yf+F.o*d, B=(u0,u1,d0,d1,z0,z1,top)=>gbox({x0:U(u0),x1:U(u1),y0:Math.min(Yd(d0),Yd(d1)),y1:Math.max(Yd(d0),Yd(d1)),z0,z1,c:steel,foot:0,top:top?(x,y)=>(Math.floor(x*10)+Math.floor(y*10))&1?sh(steel,.6):steel:null},F.k);
    const rs=(lv,u0,u1,d0,d1)=>{ if(!keep)return; SOLS[lv].push(tbox4(U(u0),Yd(d0),U(u1),Yd(d1))); };
    const rail=(lv,u0,u1,d0,d1)=>{ rs(lv,u0,u1,d0,d1); const z=lv*S, al=u1-u0>d1-d0, L=al?u1-u0:d1-d0, n=Math.max(1,Math.round(L/.36));
      B(u0,u1,d0,d1,z+30,z+33); B(u0,u1,d0,d1,z+14,z+16); for(let i=0;i<=n;i++){ const t=i/n*L; al?B(u0+t-.02,u0+t+.02,d0,d1,z,z+30):B(u0,u1,d0+t-.02,d0+t+.02,z,z+30); } };
    for(const lv of lvs){ const z=lv*S; B(F.ua,F.ub,0,DI,z-3,z,1);
      B(F.ua,F.lx-.4,DI,DO,z-3,z,1); B(F.lx+.4,F.ub,DI,DO,z-3,z,1);
      B(F.ua,F.ub,DO-.06,DO,z-9,z); for(let u=F.ua+.3;u<F.ub;u+=2.4)B(u,u+.06,0,DO,z-12,z-3);
      rail(lv,F.ua,F.ub,DO-.05,DO); rail(lv,F.ua,F.ua+.05,0,DO); rail(lv,F.ub-.05,F.ub,0,DO);
      const sp=[F.ua+.45,F.ua+1.5,F.ua+2.6,F.ub-2.4,F.ub-1.4,F.ub-.45].filter(u=>Math.abs(u-F.lx)>.7&&Math.abs(u-DU)>.95), K=['pot','flower','fern','tall','flower'];
      sp.forEach((u,i)=>{ const h=hash(lv,i,F.o+5); if(h<.25)return; const kd=K[Math.floor(hash(lv,i,F.o+7)*K.length)]; tcard(U(u),Yd(DO-.3),RZ+z,.7,kd==='tall'?54:kd==='fern'?40:46,kd,lv*13+i*7+F.o,F.k); });
      for(const [du,j] of [[-1.05,0],[1.05,1]])tcard(U(DU+du),Yd(.4),RZ+z,.6,hash(lv,j,F.o+13)<.5?34:44,K[Math.floor(hash(lv,j+8,F.o)*K.length)],lv*17+j*5+F.o+29,F.k);
      if(hash(lv,3,F.o+9)<.6)tcard(U(DU+(hash(lv,4,F.o)<.5?-1.3:1.3)),Yd(DO-.2),RZ+z+33,1.1,12,'flower',lv*5+F.o+17,F.k,false);
      if((lv<ST-1||!keep)&&hash(lv,5,F.o+11)<.7)tcard(U(F.ua+.6+hash(lv,6,F.o)*(F.ub-F.ua-1.2)),Yd(DO-.35),RZ+z+S-58,.6,46,'hang',lv*9+F.o+3,F.k); }
    const l=F.lx, H1=Math.min(h1,AH+38); for(const u of [l-.24,l+.2]){ for(let h=h0;h<H1;h+=S)B(u,u+.04,DI+.03,DI+.07,h,Math.min(H1,h+S)); if(h1>=AH){ B(u,u+.04,-.35,DI+.07,AH+34,AH+38); B(u,u+.04,-.39,-.35,AH,AH+38); } }
    for(let h=h0+10;h<Math.min(h1,AH+32);h+=12)B(l-.2,l+.2,DI+.04,DI+.06,h,h+2); };
  for(const F of ESC)ESCB(F,Array.from({length:ST-1},(_,i)=>i+1),-RZ,AH+38,true);
  Object.assign(APTS,{ESC,DU,DI,DO,S,ST,TOP,escape:(F,lvs,h0,h1)=>ESCB(F,lvs,h0,h1,false)});

  const ST0={x0:m-DW-.25,x1:m+DW+.25,y0:A.y1,land:.85,tr:.42,n:3}; ST0.y1=A.y1+ST0.land+ST0.n*ST0.tr; APTS.ST0=ST0;
  { const BS=[98,95,90], NO=[136,131,122], CH=[86,84,80], IRN=[28,30,34], top=i=>(RZ+1)*(ST0.n-i)/(ST0.n+1), MID=[(ST0.x0+ST0.x1)/2,(ST0.x1-ST0.x0)/2], g=b=>tgbox(b.c===IRN?b:{...b,...rock(b.c,b.c===CH?67:63,.7,9,b.c===CH?null:MID)},'A');
    g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+1,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0+ST0.land-.06,y1:ST0.y0+ST0.land,z0:RZ-1,z1:RZ+1,c:NO});
    for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, h=top(i); g({x0:ST0.x0,x1:ST0.x1,y0,y1:y0+ST0.tr,z0:0,z1:h,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:y0+ST0.tr-.06,y1:y0+ST0.tr,z0:h-2,z1:h,c:NO}); }
    for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ g({x0:c0,x1:c1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+7,c:CH});
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr; g({x0:c0,x1:c1,y0,y1:y0+ST0.tr,z0:0,z1:top(i)+7,c:CH}); }
      const xm=(c0+c1)/2, rail=(y0,y1,z)=>g({x0:xm-.03,x1:xm+.03,y0,y1,z0:z,z1:z+2,c:IRN}), post=(y,z0,z1)=>g({x0:xm-.025,x1:xm+.025,y0:y-.025,y1:y+.025,z0,z1,c:IRN});
      rail(ST0.y0,ST0.y0+ST0.land,RZ+7+26); for(let y=ST0.y0+.12;y<ST0.y0+ST0.land;y+=.18)post(y,RZ+7,RZ+7+26);
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, z=top(i)+7; rail(y0,y0+ST0.tr,z+26); post(y0+ST0.tr*.3,z,z+26); post(y0+ST0.tr*.75,z,z+26); }
      g({x0:xm-.06,x1:xm+.06,y0:ST0.y1-.12,y1:ST0.y1,z0:top(ST0.n-1)+7,z1:top(ST0.n-1)+7+34,c:IRN}); }
    tcard(ST0.x0+.22,ST0.y0+.5,RZ+1,.4,34,'tall',71,'A'); tcard(ST0.x1-.22,ST0.y0+.5,RZ+1,.4,26,'flower',73,'A'); }

  const WPL=APTS.WPL=Object.fromEntries(['Wf','Wb','Ww','We'].map(k=>[k,new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]));   // your apartment's four walls, each cut down in the isometric view when it stands between you and the camera
  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...(WPL[k]?{clippingPlanes:[WPL[k]]}:{})});
  APTS.MKA=MKA; BATCH.build(MKA); const AM=Object.values(BATCH.meshes); APTS.back=BATCH.all(BATCH.meshes,'E'); BATCH.meshes={}; APTS.meshes=AM; for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }

  const SY=APTS.SY=Y(S)-Y(0), TOL=Y(24)-Y(0);
  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const BLK=tbox4(A.x0,A.y0,A.x1,A.y1); SOL.up.push(BLK); FIX.up.push([BLK[0],BLK[1],0,BLK[2],BLK[3],Yr(TOP)]);
  for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ const r=tbox4(c0,ST0.y0,c1,ST0.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],.05]); }
  const EDGE=[tbox4(A.x0,A.y1-T,A.x1,A.y1),tbox4(A.x0,A.y0,A.x1,A.y0+T),tbox4(A.x0,A.y0,A.x0+T,A.y1),tbox4(A.x1-T,A.y0,A.x1,A.y1)];
  const LAD={F:null,y:0}, LV=38, LAND=Array.from({length:ST-1},(_,i)=>(i+1)*S), LS_=[-RZ,...LAND,AH], RFY=R0+SY*(ST-.3);
  const EG=(x,z)=>{ if(!window.POSOK||Math.abs(x-pos.x)+Math.abs(z-pos.z)>.5*TILE)return null; if(LAD.F)return Y(LAD.y); const [lx,ly]=loc(x,z), u=lx-A.x0;
    for(const F of ESC){ const d=(ly-F.yf)*F.o; if(d<0||d>DO||u<F.ua||u>F.ub)continue; let b=null; for(const c of LAND)if(Y(c)<=SHARED.py+TOL&&(b==null||c>b))b=c; return b==null?null:Y(b); }
    return null; };
  APTS.stoop=(x,z)=>{ const [u,v]=loc(x,z); if(u<ST0.x0||u>ST0.x1||v<ST0.y0||v>=ST0.y1)return EG(x,z); const t=v-ST0.y0; if(t<ST0.land)return Y(1);
    const i=Math.floor((t-ST0.land)/ST0.tr); return Yr((RZ+1)*(ST0.n-i)/(ST0.n+1)); };
  const HIT=new THREE.MeshBasicMaterial({visible:false}), bx=(w,h,d,mt)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);
  const reg=o=>{ o.ghost=1; const f=()=>{ try{ UI.thing(o); }catch(e){ setTimeout(f,400); } }; setTimeout(f,0); };
  const lpt=(F,d)=>XZ(U(F.lx),F.yf+F.o*d);
  for(const F of ESC)for(const y of LS_){ const [x,z]=lpt(F,y===AH?-.6:1.1), hb=bx(.5*TILE,Y(60)-Y(0),.5*TILE,HIT); hb.position.set(x,Y(y+30),z); scene.add(hb);
    reg({name:'FIRE ESCAPE LADDER',obj:hb,reach:.6*TILE,near:2.2*TILE,tall:1*TILE,act:()=>{ if(!LAD.F&&Math.abs(SHARED.py-Y(y))<SY*.3)lgo(F,y); }}); }
  APTS.inside=(x,z)=>x>BLK[0]&&x<BLK[2]&&z>BLK[1]&&z<BLK[3];
  APTS.lvY=lv=>R0+lv*SY; APTS.lvOf=y=>Math.max(0,Math.min(ST-1,Math.floor((y-R0)/SY+.08)));
  APTS.floor=()=>window.POSOK?APTS.lvOf(SHARED.py):0;
  const lpos=F=>{ const [x,z]=lpt(F,1.3); pos.x=x; pos.z=z; SHARED.heading=TA.hd(F.o>0?Math.PI:0); };
  const lgo=(F,y)=>{ LAD.F=F; LAD.y=y; lpos(F); st.climb={z:0,ph:y}; SHARED.target=null; };
  const loff=top=>{ const F=LAD.F, [x,z]=lpt(F,top?-1:.45); LAD.F=null; st.climb=null; pos.x=x; pos.z=z; };
  APTS.lad=(dt,up,dn,off)=>{ if(!window.POSOK||SHARED.LVL!=='up')return false;
    if(!LAD.F){ if(!(up||dn))return false; for(const F of ESC){ const [lx,ly]=loc(pos.x,pos.z), u=lx-A.x0, d=(ly-F.yf)*F.o; if(Math.abs(u-F.lx)>.5)continue;
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
  const EB=ESC.map(F=>tbox4(U(F.ua-.05),F.yf,U(F.ub+.05),F.yf+F.o*(DO+.05))), ovl=(s,b)=>s[0]<b[2]&&s[2]>b[0]&&s[1]<b[3]&&s[3]>b[1];
  APTS.in=false; APTS.esc=false; let was=-1;
  APTS.tick=()=>{ const ib=APTS.inside(pos.x,pos.z), roof=ib&&window.POSOK&&SHARED.py>RFY, eg=!ib&&SHARED.LVL==='up'&&EG(pos.x,pos.z)!=null, lv=APTS.floor();
    APTS.in=!!APTS.inReal; APTS.esc=eg;
    const key=(eg?2:0)+(roof?16:0)+lv*4; if(key!==was){ was=key; return eg?SOL.up.filter(s=>s===BLK||!EB.some(b=>ovl(s,b))).concat(SOLS[lv]):roof?SOL.up.filter(s=>s!==BLK).concat(EDGE):SOL[SHARED.LVL]||SOL.up; } return null; };
  window.HOUSEAT=(dy=0)=>XZ(m,A.y1+dy); APTS.doorAt=XZ(m,A.y1); APTS.doorHd=TA.hd(0);
  window.APTSDBG=()=>({in:APTS.in,esc:APTS.esc,floor:APTS.floor(),py:SHARED.py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],door:+X(m).toFixed(1),lad:LAD.F?+LAD.y.toFixed(1):null,block:BB});

  const AW_=+(A.x1-A.x0).toFixed(3), AD_=+(A.y1-A.y0).toFixed(3), AR={x0:994,y0:20,x1:994+AW_,y1:20+AD_}, AX=(AR.x0+AR.x1)/2, WH=S, MY=APTS.my=ST-1, DC=AR.x0+DU; APTS.R=AR; APTS.fw=[DC,AR.y0]; const BED=APTS.BED={x0:AR.x0+7.75,y0:AR.y0,x1:AR.x1,y1:AR.y0+5,H:WH};   // the bedroom's corner (front right): its own walls, things and light (150a-bedroom)   // off-map in the empty sky; footprint and one-storey height match the real building exactly (1:1)
  const FURN=[], DYN={win:[],bar:[],cur:[],flame:[]}; let PA=null, AS=[], AF=[], AG=null;
  APTS.furnish=(lv,fn)=>{ FURN.push(fn); if(PA){ const Q=ROOMS.part(AG,fn); for(const k of ['objs','things','cuts','lights'])PA[k].push(...Q[k]); } };
  const build=()=>{ '@apts'; const K=SHARED.BOD.K, n0=K.PROPS.length, l0=SHARED.BOD.STOREK.LAMPS.length; AG=new THREE.Group(); AG.name='apts-in'; scene.add(AG); AS=[];
    const sol=(x0,y0,x1,y1,h)=>{ const r=box4(x0,y0,x1,y1); AS.push(r); SOL.up.push(r); if(h!=null){ const f=[r[0],r[1],Yr(0),r[2],r[3],Yr(h)]; AF.push(f); FIX.up.push(f); } }; APTS.solid=sol;
    const boards=(x,y)=>{ const i=Math.floor(y*6), j=Math.floor(x*.6+i*.37), n=hash(j,i,41); return sh([150,112,76],.86+.22*n+(y*6-i<.1?-.2:0)); };
    const plaster=(u,z,f)=>{ if(z<5)return sh([96,70,48],f*(z<1?.7:1.1)); if(z<38)return sh(z>35?[186,176,150]:[120,138,112],f*(z>35?1.08:(Math.floor(u*8)&1)?.92:1)); if(z>WH-6)return sh([224,218,206],f*.9);
      const n=hash(Math.floor(u*24),Math.floor(z),33); return sh(n<.04?[206,200,186]:[218,210,192],f); };
    PA=ROOMS.part(AG,()=>{
      bq([X(AR.x0),Yr(.15),Z(AR.y1)],[X(AR.x1),Yr(.15),Z(AR.y1)],[X(AR.x1),Yr(.15),Z(AR.y0)],[X(AR.x0),Yr(.15),Z(AR.y0)],faceTex((AR.x1-AR.x0)*24,(AR.y1-AR.y0)*24,(i,j)=>C(boards(AR.x0+(i+.5)/24,AR.y1-(j+.5)/24))),'A');
      for(const [k,nx,nz] of [['Wf',0,1],['Wb',0,-1],['Ww',1,0],['We',-1,0]])cutWalls.push({pl:WPL[k],nx,nz,foot:Yr(1),me:null,when:()=>!!APTS.inReal});
      const wall=(ax,at,a0,a1,f,P,k='A')=>{ bq(P(a0,0),P(a1,0),P(a1,WH),P(a0,WH),faceTex((a1-a0)*24,WH,(i,j)=>C(plaster(a0+(i+.5)/24,WH-j-.5,f))),k); ax==='x'?sol(a0,at-.1,a1,at+.1):sol(at-.1,a0,at+.1,a1); };
      const px=(at,o)=>(a,z)=>[X(a),Yr(z),Z(at+o)], py=(at,o)=>(a,z)=>[X(at+o),Yr(z),Z(a)];
      wall('y',AR.x0,AR.y0,AR.y1,.68,py(AR.x0,0),'Ww'); wall('y',AR.x1,BED.y1,AR.y1,.68,py(AR.x1,0),'We');   // side party walls stay solid (the bedroom builds its own piece)
      const HOL=FWU.map(u=>[AR.x0+u-.62,AR.x0+u+.62]), WZ0=WINA, WZ1=WINB;   // two window openings per face at the facade's own window heights (1:1), real holes onto the sky
      const strip=(a0,a1,z0,z1,f,P,k='A')=>{ if(a1-a0<.02||z1-z0<.02)return; const W=Math.max(1,Math.round((a1-a0)*24)), Hh=Math.max(1,Math.round(z1-z0)); bq(P(a0,z0),P(a1,z0),P(a1,z1),P(a0,z1),faceTex(W,Hh,(i,j)=>C(plaster(a0+(i+.5)/W*(a1-a0),z1-(j+.5)/Hh*(z1-z0),f))),k); };
      const wallH=(at,f,P,end,kd)=>{ const H=HOL.filter(h=>h[1]<=end), b=[AR.x0]; for(const [h0,h1] of H)b.push(h0,h1); b.push(end); for(let k=0;k<b.length;k+=2)strip(b[k],b[k+1],0,WH,f,P,kd); for(const [h0,h1] of H){ strip(h0,h1,0,WZ0,f,P,kd); strip(h0,h1,WZ1,WH,f,P,kd); } sol(AR.x0,at-.1,end,at+.1); };
      wallH(AR.y0,.84,px(AR.y0,0),BED.x0,'Wf'); wallH(AR.y1,.84,px(AR.y1,0),AR.x1,'Wb');   // front & back: plaster around two open windows
      const pane=(P,a,z0,z1,lit,sd,door)=>SHARED.BOD.window([P(a-.55,z0),P(a+.55,z0),P(a+.55,z1),P(a-.55,z1)],1.1,z1-z0,lit,sd,'Wf',door);
      pane(px(AR.y0,.03),AR.x0+DU,3,WINB,false,7,true);
      { const d0=DC-.78, d1=DC+.78, Wd=Math.round((d1-d0)*24), WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84];
        const dp=(ii,jj)=>{ const z=DH-jj, q=(ii+.5)/Wd; if(ii<2||ii>=Wd-2||z>DH-2)return WK; if(q>.82&&q<.9&&Math.abs(z-DH*.42)<2)return BR; const tp=z>DH*.55; if(q>.16&&q<.84&&(tp?z>DH*.6&&z<DH*.92:z>DH*.1&&z<DH*.48))return (ii+jj)%7?WL:WD; return WD; };
        const P=px(AR.y1,-.03); bq(P(d0,0),P(d1,0),P(d1,DH),P(d0,DH),faceTex(Wd,DH,(ii,jj)=>C(dp(ii,jj))),'Wb'); APTS.door=[(d0+d1)/2,AR.y1]; }
      const put=(k,x,y,r=0,solid=true)=>{ const f=K.CATALOG[k]; if(!f)return null; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; SHARED.BOD.place(p,r); for(const b of p.boxes)SHARED.BOD.gbox(b,'A');
        const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(solid&&!p.walk&&!p.high&&bs.length)sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1))); p.kind=k; made.push(p); return p; };
      APTS.put=put;
      const x0=AR.x0, y0=AR.y0, x1=AR.x1, y1=AR.y1, made=APTS.made=[];
      put('patterned rug',x0+3,y0+5,0,false); put('sofa',x0+.7,y0+5,1); put('coffee table',x0+2.6,y0+5); put('TV on a low stand',x0+5.1,y0+5,3); put('floor lamp',x0+.4,y0+6.2);
      put('fiddle-leaf fig',x1-.5,y0+8.6); put('bookcase',x0+.35,y0+2.2,1); put('plant pot',x0+1.7,y0+.5);
      put('home computer',x0+5,y0+.9,0); put('office chair',x0+5,y0+2); put('wall phone',x0+.03,y0+3.2,0,false);
      put('bath',x0+1.3,y1-.6,0); put('toilet',x0+2.7,y1-.6,0); put('bathroom sink',x0+2.3,y1-1.7,0);
      put('sink and counter',x1-2.2,y1-.45,2); put('stove',x1-3.6,y1-.45,2); put('fridge',x1-.6,y1-.5,2); put('dining table',x1-2.4,y1-2.8); put('pothos shelf',x0+.2,y0+7.2,1,false);
      put('hanging pothos',x0+.5,y0+4.5,1,false); put('stack of books with a candle',x0+5.1,y0+6.2);
      for(const [lx,ly] of [[x0+3,y0+5],[x1-2.6,y0+7.5]]){ const L=new THREE.PointLight(0xffe2b8,5,7*TILE,1.6); L.position.set(X(lx),Yr(WH-14),Z(ly)); scene.add(L); }
      { // cozy fittings: daylight through the glass, venetian slats, drifting sheer curtains, the sun's slats on the floor, and candlelight — all keyed to the live sun
        const FR=px(AR.y0,.02), BK=px(AR.y1,-.02), flY=Yr(.17), AU=Math.abs(X(AR.x0+1)-X(AR.x0));
        const addm=(p3,mat,ro=4)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(p3),3)); g.computeVertexNormals(); const m=new THREE.Mesh(g,mat); m.renderOrder=ro; m.frustumCulled=false; scene.add(m); return m; };
        const QD=(a,b,c,d)=>[a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]];
        const slatM=fw=>new THREE.MeshBasicMaterial({color:0x15120d,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[fw>0?WPL.Wf:WPL.Wb]});
        const curM=fw=>new THREE.MeshBasicMaterial({color:0xf4e8d2,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide,fog:false,clippingPlanes:[fw>0?WPL.Wf:WPL.Wb]});
        for(const [P,fw] of [[FR,1],[BK,-1]])for(const u of FWU){ const a=AR.x0+u; if(fw>0&&a>BED.x0)continue;
          DYN.win.push(addm(QD(P(a-.62,WINA),P(a+.62,WINA),P(a+.62,WINB+2),P(a-.62,WINB+2)),new THREE.MeshBasicMaterial({color:0xffeccb,side:THREE.BackSide,fog:false,transparent:true,clippingPlanes:[fw>0?WPL.Wf:WPL.Wb]}),3));
          { const sl=[]; for(let z=WINB-18;z<WINB;z+=4.4)sl.push(...QD(P(a-.57,z),P(a+.57,z),P(a+.57,z+2.4),P(a-.57,z+2.4))); addm(sl,slatM(fw),6); }   // blinds raised to the top of the glass so you can see out
          for(const s of [-1,1]){ const cols=3, rows=4, w=s*.55, top=WINB+2, h=WINB-WINA, seg=[], node=(i,j)=>P(a+s*.6+(i/cols)*w, top-(j/rows)*h);
            for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)seg.push(...QD(node(i,j),node(i+1,j),node(i+1,j+1),node(i,j+1)));
            const cm=addm(seg,curM(fw),7), bs=Float32Array.from(cm.geometry.attributes.position.array); let y0=1e9,y1=-1e9; for(let k=1;k<bs.length;k+=3){ y0=Math.min(y0,bs[k]); y1=Math.max(y1,bs[k]); }
            DYN.cur.push({m:cm,base:bs,y0,y1,fw,ph:u+s*1.7}); }
          if(fw>0){ const bars=[]; for(let k=0;k<6;k++){ const b0=AR.y0+.6+k*1.2, b1=b0+.55; bars.push(...QD([X(a-.62),flY,Z(b0)],[X(a+.62),flY,Z(b0)],[X(a+.62),flY,Z(b1)],[X(a-.62),flY,Z(b1)])); }
            DYN.bar.push(addm(bars,new THREE.MeshBasicMaterial({color:0xffdf9a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),8)); }
        }
        const candle=(wx,wy,z0,h=7)=>{ const cx=X(wx), cz=Z(wy), yb=Yr(z0), hh=Yr(z0+h)-yb, r=.12*AU, fh=Yr(z0+h+5)-Yr(z0+h);
          const wax=new THREE.Mesh(new THREE.BoxGeometry(r*2,hh,r*2),new THREE.MeshLambertMaterial({color:0xefe4c8})); wax.position.set(cx,yb+hh/2,cz); wax.castShadow=true; scene.add(wax);
          const fm=new THREE.Mesh(new THREE.ConeGeometry(.16*AU,fh,6),new THREE.MeshBasicMaterial({color:0xffcf7a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); fm.position.set(cx,Yr(z0+h)+fh/2,cz); fm.renderOrder=9; scene.add(fm);
          const L=new THREE.PointLight(0xffb45a,5,4.5*TILE,2); L.position.set(cx,Yr(z0+h)+fh,cz); scene.add(L); DYN.flame.push({L,fm,i0:5,fy:fm.position.y}); };
        candle(AR.x0+FWU[0],AR.y0+.35,WINA); candle(AR.x0+FWU[0],AR.y1-.35,WINA); candle(AR.x0+2.6,AR.y0+5,16,5); candle(AR.x0+.4,AR.y0+2.2,30,5);
      }
      for(const f of FURN)f(); },MKA);
    K.PROPS.length=n0; SHARED.BOD.STOREK.LAMPS.length=l0;
    { const g=new THREE.PlaneGeometry(Math.abs(X(AR.x1)-X(AR.x0)),Math.abs(Z(AR.y1)-Z(AR.y0))); g.rotateX(Math.PI/2);   // the ceiling: there, but hidden while you look in from outside (iso); seen in first person when you look up
      const ceil=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xe0dace,side:THREE.DoubleSide})); ceil.position.set((X(AR.x0)+X(AR.x1))/2,Yr(WH),(Z(AR.y0)+Z(AR.y1))/2); ceil.visible=false; AG.add(ceil); APTS.ceil=ceil;
      const roof=new THREE.Mesh(g,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:THREE.DoubleSide})); roof.position.copy(ceil.position); roof.position.y+=.02; roof.castShadow=true; roof.renderOrder=-9; AG.add(roof); }   // the sun reaches in only through the windows
    return PA; };
  const unbuild=()=>{ for(const r of AS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } AS=[]; for(const f of AF){ const i=FIX.up.indexOf(f); if(i>=0)FIX.up.splice(i,1); } AF=[]; PA=null; for(const k in DYN)DYN[k].length=0; if(AG){ AG.removeFromParent(); AG=null; } };
  SYS.add('places',()=>{ if(!APTS.in&&!APTS.inReal)return; const t=performance.now()/1000, e=CLOCK.elev(), day=Math.max(0,Math.min(1,(e+2)/10)), sv=CLOCK.sunV;   // the apartment breathes with the live sun: daylight at the glass, slats creeping over the floor, candle flames guttering
    for(const m of DYN.win)m.material.opacity=(.06+.14*day)*.5;   // faint bloom only; the real sky shows through the open window
    for(const m of DYN.bar){ m.material.opacity=day*.5*(.62+.38*Math.sin(t*.22)); m.position.set(sv.x*day*3,0,sv.z*day*3); }
    for(const c of DYN.cur){ const b=c.base, p=c.m.geometry.attributes.position.array, span=Math.max(.1,c.y1-c.y0);
      for(let k=0;k<p.length;k+=3){ const by=b[k+1], f=(c.y1-by)/span, g=f*f+.05; p[k+2]=b[k+2]+Math.sin(t*1.6+by*.05+c.ph)*.5*c.fw*g; p[k]=b[k]+Math.cos(t*1.3+by*.04+c.ph)*.3*g; } c.m.geometry.attributes.position.needsUpdate=true; }
    for(const f of DYN.flame){ const fl=.7+.3*Math.sin(t*11+f.fy)+.15*Math.sin(t*23.3+f.fy*2); f.L.intensity=f.i0*(.6+.4*fl); f.fm.scale.set(1,.85+.3*fl,1); f.fm.material.opacity=.72+.24*fl; f.fm.position.y=f.fy+Math.sin(t*7+f.fy)*.3; }
  },'059a-apts');
  APTS.spawn=[X(DC),Z(AR.y1-1.3),0,Math.PI];   // the apartment is entered off the map (not a clipped ROOMS room), so the live sky shows through its open windows
  APTS.doorW=(d=>[d[0],Y(0),d[1]])(XZ(m,A.y1+.25)); APTS.exitW=[X(DC),0,Z(AR.y1-.25)];
  APTS.num=(()=>{ try{ return localStorage.getItem('market-apt')||null; }catch(e){ return null; } })();
  APTS.loadNum=async()=>{ try{ const SB='https://jvcetttmqseoteidfggn.supabase.co', KEY='sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik', raw=localStorage.getItem('sb-jvcetttmqseoteidfggn-auth-token'); if(!raw)return; const s=JSON.parse(raw); if(!s||!s.access_token)return;
    const uid=JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub, r=await fetch(SB+'/rest/v1/players?select=apt&id=eq.'+uid,{headers:{apikey:KEY,Authorization:'Bearer '+s.access_token}}); if(!r.ok)return; const a=await r.json(), n=a&&a[0]&&a[0].apt;
    if(n!=null&&String(n)!==APTS.num){ APTS.num=String(n); try{ localStorage.setItem('market-apt',APTS.num); }catch(e){} if(window.FIREV&&FIREV.setPlaque)FIREV.setPlaque(); } }catch(e){} };
  APTS.loadNum();
  // YOUR APARTMENT: entered off the map (the street never draws here), the live sky showing through the open windows with the far city hidden, so you look out on nothing but sky and clouds (owner, 23 Oct 2026)
  { APTS.inReal=false;
    const hideFar=()=>{ const F=window.FAR3; if(F){ if(F.mesh)F.mesh.visible=false; if(F.panels)F.panels.visible=false; if(F.trees)F.trees.visible=false; if(F.FU)F.FU.uMK.value=0; if(F.fog&&scene.fog===F.fog)scene.fog=null; } };
    APTS.enterReal=async()=>{ if(FADE.busy)return; await FADE.run('YOUR APARTMENT',async()=>{ if(!PA){ if(window.LOAD)await LOAD('apts','later'); build(); } if(AG)AG.visible=true; APTS.inReal=true; hideFar(); UI.goTo(X((AR.x0+AR.x1)/2),Z((AR.y0+AR.y1)/2),Yr(0)); SHARED.heading=0; },{hold:200}); };
    APTS.exitReal=async()=>{ if(FADE.busy)return; await FADE.run('OUT TO THE STREET',async()=>{ APTS.inReal=false; if(AG)AG.visible=false; const d=XZ(m,A.y1+.9); UI.goTo(d[0],d[1],Yr(1)); SHARED.heading=TA.hd(0); },{hold:200}); };
    let hbMade=false; const mkHB=()=>{ if(hbMade||!UI.thing)return; hbMade=true; const hb=(p,name,act)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(1.3*TILE,2.4*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); o.position.set(p[0],p[1]+1.2*TILE,p[2]); scene.add(o); UI.thing({name,ghost:1,obj:o,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act}); };
      hb(APTS.doorW,'YOUR APARTMENT',()=>APTS.enterReal()); hb(APTS.exitW,'OUT TO THE STREET',()=>APTS.exitReal()); };   // the front door on the street, and the way back out from inside
    const inR=(x,z)=>{ const a=X(AR.x0),b=X(AR.x1),c=Z(AR.y0),d=Z(AR.y1); return x>Math.min(a,b)-3&&x<Math.max(a,b)+3&&z>Math.min(c,d)-3&&z<Math.max(c,d)+3; };
    const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>APTS.inReal&&inR(x,z)?Yr(0):sg0?sg0(x,z):null;
    SYS.add('places',()=>{ mkHB(); if(APTS.inReal)hideFar(); if(APTS.ceil)APTS.ceil.visible=APTS.inReal&&!!UI.persp; },'059a-aptsky');   // ceiling only in first person; gone when you view the room from outside
    window.ENTERAPT=()=>APTS.enterReal(); window.EXITAPT=()=>APTS.exitReal();
    APTS.REALDBG=()=>({inReal:APTS.inReal,built:!!PA}); }
  MODS.apts=APTS; });
