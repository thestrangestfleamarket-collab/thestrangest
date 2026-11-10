// THE APARTMENTS: the brownstone apartment house on the street as one painted block (brick, windows, flower boxes, ivy; the back blank: the halls), its 3D fire escapes with plants, its stoop and the stair head on the roof; YOUR APARTMENT and its hall (stairs, elevator) inside are built off the map when you go in (their own builders).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CLOCK, FAR3, FORAGE, pos, ROOMS, st, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {BLDK, FADE, FIX, grab, LEVEL, LOTX, LOTY, MODS, OFFDX, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BLOCKS} from './038zb-blocks.js';
import {FACADES} from './038zc-facades.js';
const APTS={EMPTY:true};
// the flats (owner, 6 Nov 2026: "Free flat at first login"; 8 Nov 2026: "1 large apartment that has any many floors as we need"): a flat number maps to a floor and a side of the one tower, two flats a floor, no top floor
APTS.PER=Infinity; APTS.flatOf=n=>{ n=Math.floor(+n); if(!(n>0))return {house:0,floor:null,side:0,pent:false}; return {house:0,floor:1+Math.floor((n-1)/2),side:(n-1)%2,pent:false}; };
APTS.num=OWNED.me&&OWNED.me.apt!=null?String(OWNED.me.apt):null;   // the number the server gave you (/owned), none on the single-file page
await grab('apts',async()=>{ const HOUSES=[WP.apts,...LEVEL.places.filter(p=>/^house\d+$/.test(p.id)).sort((a,b)=>a.x0-b.x0||a.y0-b.y0)].filter(Boolean), FL=APTS.flatOf(APTS.num), MINE=HOUSES[Math.min(FL.house,HOUSES.length-1)];
  APTS.houses=HOUSES.map(p=>p.id); APTS.mine=MINE.id; APTS.flat=FL;
  for(let hi=0;hi<HOUSES.length;hi++){ await house(HOUSES[hi],HOUSES[hi]===MINE,FL,hi); }
  MODS.apts=APTS; });
async function house(HP,mine,FL,HI){ const APTS0=APTS; { const APTS=mine?APTS0:{}; const {X,Z,faceTex,bq,C}=SHARED.BOD, Yr=SHARED.BOD.Y,
  RZ=APTS.RZ=28, Y=z=>Yr(z+RZ), gbox=(b,k)=>tgbox({...b,z0:b.z0+RZ,z1:b.z1+RZ},k), R0=APTS.R0=Yr(RZ)-Yr(0), {hash}=SHARED.BOD.g, {LSEED,STORY,sh}=SHARED.BOD.K, S=STORY*1.25, ST=10, AH=ST*S, TOP=RZ+AH, W=LSEED.walk, T=.1, HALL=APTS.HALL=2.75;
  const AY=HP.y1!=null?LOTY(HP.y1):W, AW=HP.y1!=null?{x0:LOTX(HP.x0),x1:LOTX(HP.x1),y0:LOTY(HP.y0),y1:AY}:{x0:LOTX(HP.x0),x1:LOTX(HP.x1),y0:AY-14,y1:AY}, TA=TURN(AW,HP.face), A=TA.L, m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, DW=.78, DH=94;
  const XZ=(x,y)=>{ const p=TA.pt(x,y); return [X(p[0]),Z(p[1])]; }, loc=(x,z)=>TA.back(x/(TILE*BLDK)+SHARED.BOD.OX,z/(TILE*BLDK)+SHARED.BOD.OY);
  let FLAT=false;   // the fire escape view builds the house unturned
  const tgbox=(b,k)=>{ if(!TA.q||FLAT)return SHARED.BOD.gbox(b,k); const p={boxes:[b],x0:b.x0,y0:b.y0,x1:b.x1,y1:b.y1}; SHARED.BOD.placeAt(p,TA.q,TA.cx,TA.cy,TA.cx,TA.cy); return SHARED.BOD.gbox(p.boxes[0],k); };
  const tcard=(x,y,z,w,h,kind,seed,k,cross=true)=>{ const p=FLAT?[x,y]:TA.pt(x,y); BLOCKS.card(p[0],p[1],z,w,h,kind,seed,k,cross,!FLAT&&!!(TA.q&1)); };
  const tbox4=(x0,y0,x1,y1)=>{ const r=TA.box(x0,y0,x1,y1), a=X(r.x0), b=X(r.x1), c=Z(r.y0), d=Z(r.y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const FWD=13, NF=Math.max(1,Math.round((A.x1-A.x0)/FWD)), OFF=mine&&FL.side?Math.min(NF-1,FL.side)*FWD:0;   // two flats a floor across the front; yours from OFF
  APTS.A=AW; APTS.AL={...A,x0:A.x0+OFF,x1:A.x0+OFF+FWD}; APTS.T=TA; APTS.H=H; APTS.floors=ST; APTS.DX=m;
  const TN=SHARED.BOD.g.hash, vn=BLOCKS.vn, gr=(x,y,k,s=1)=>(vn(x/(5*s),y/(5*s),k)*3+vn(x/(1.7*s),y/(1.7*s),k+2)*2+vn(x*2.3/s,y*2.3/s,k+4))/6;
  const rock=(base,sd,bw=.6,bh=9,mid)=>{ const P=(a,z,f)=>{ const ui=a*24, bc=Math.floor(z/bh), p=ui+(bc&1)*bw*12, bi=Math.floor(p/(bw*24)), fx=p-bi*bw*24, fy=z-bc*bh;
      if(fy<1||fx<1)return sh(base,f*.7); let k=(.9+.16*TN(bi,bc,sd))*(1+.14*(gr(ui/24,z/24,sd+4,1)-.5))*(z<5?.8+.04*z:1); if(fy>=bh-1)k*=1.08; return sh(base,f*k); };
    return {fs:(nx,ny,X_,Y_,z,f)=>P(nx?Y_:X_,z,f),top:(x,y)=>{ let k=1+.12*(gr(x,y,sd+10,.5)-.5); if(mid)k*=1+.1*Math.max(0,1-Math.abs(x-mid[0])/mid[1]); return sh(base,k); }}; };

  const FWU=[3.25,9.75], SIDE=[.22,.5,.78], WHW=.775, WZ=[24,87], DU=6.5, DI=.85, DO=3.09, RD=5.3, steel=[34,36,40], WINA=Math.round(S*.12), WINB=Math.round(S*.88), WDH=1.5;
  const feats=[]; let seed=3; const win=(side,a,z0,z1,o={})=>{ seed++; feats.push({side,a0:a-(o.hw||.55),a1:a+(o.hw||.55),z0,z1,lit:hash(seed,1,9)<.45,seed,box:!o.door&&hash(seed,4,9)<.78,...o}); };
  for(let lv=0;lv<ST;lv++){ const z=RZ+lv*S; for(let f=0;f<NF;f++){ for(const u of FWU)win('f',A.x0+f*FWD+u,z+WZ[0],z+WZ[1],{hw:WHW}); if(lv)win('f',A.x0+f*FWD+DU,z+3,z+94,{door:true,lit:false}); } }
  feats.push({side:'f',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,arch:true,lit:false,seed:41},{side:'b',a0:m-DW,a1:m+DW,z0:RZ,z1:RZ+DH,door:true,lit:false,seed:43});
  const AD=A.y1-A.y0-HALL, sideAt=APTS.sideAt=k=>A.y1-AD*(1-k);   // the side windows sit on the apartments' depth, measured from the front: none on the halls at the back
  for(const side of ['w','e'])for(let lv=1;lv<ST;lv++)for(const k of SIDE)win(side,sideAt(k),RZ+lv*S+WZ[0],RZ+lv*S+WZ[1],{box:false,hw:WHW});
  const ivy=[{side:'f',a0:A.x0,a1:A.x0+2.4,h:RZ+S*1.7,seed:5,fall:.6},{side:'f',a0:A.x1-2,a1:A.x1,h:RZ+S*2.4,seed:7,fall:.6},{side:'w',a0:A.y1-4.5,a1:A.y1,h:RZ+S*2.2,seed:9,fall:.8},{side:'e',a0:A.y0+4,a1:A.y1-.4,h:RZ+S*2.1,seed:11},{side:'b',a0:A.x0+10,a1:A.x1,h:RZ+S*1.4,seed:13,fall:.6}];
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*4),Math.floor(y*4),61), e=Math.min(x-A.x0,A.x1-x,y-A.y0,A.y1-y); return e<.25?sh([118,50,38],e<.1?.8:1.05):n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const PAINT=APTS.paint=BLOCKS.facade({feats,ivy,top:TOP,wall:BLOCKS.brick([138,60,44]),trim:[118,50,38],base:{z1:RZ,paint:BLOCKS.brick([120,52,40])}}), BB=(FACADES.make({id:'apts',L:A,pt:TA.pt,z1:TOP,wall:[138,60,44],trim:[200,170,150],frame:[40,34,32],seed:61,ground:RZ,door:{u:m,w:1.1,h:100},glass:true,sign:{text:'THE TOWER',color:[255,226,170],bg:[30,22,20],u:m}}),{x0:X(AW.x0),z0:Z(AW.y0),x1:X(AW.x1),z1:Z(AW.y1)});   // the house on the street is a solid painted block (floors 1-9 just a block); your floor-10 apartment is built off the map
  { const CN=[118,50,38]; tgbox({x0:A.x0-.3,x1:A.x1+.3,y0:A.y0-.3,y1:A.y1+.3,z0:TOP-12,z1:TOP,c:CN,...rock(CN,61,.9,14),top:roofCol},'A');
    const tk=loc(X(AW.x0+5),Z(AW.y0+2.4)), bx_=m+(tk[0]<m?3.2:-3.2), BH=APTS.BH={x0:bx_-1.4,x1:bx_+1.4,y0:A.y0+.5,y1:A.y0+3.3,cx:bx_}, rk=rock(CN,69,.9,14); tgbox({...BH,z0:TOP,z1:TOP+72,c:CN,fs:(nx,ny,X_,Y_,z,f)=>!nx&&Math.abs(X_-bx_)<.45&&z<TOP+62?sh([44,32,26],f):rk.fs(nx,ny,X_,Y_,z,f),top:rk.top},'A'); }   // the stair head at the back of the roof, clear of the roof kit's water tank (148)

  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  const U=u=>A.x0+OFF+u, V=v=>A.y0+v; APTS.U=U; APTS.V=V;   // (from your flat's edge)
  const ESC=Array.from({length:NF},(_,f)=>f*FWD-OFF).sort((a,b)=>Math.abs(a)-Math.abs(b)).map(d=>({yf:A.y1,o:1,k:'A',lx:11.9+d,ua:.8+d,ub:12.6+d,du:DU+d}));   // a fire escape for each flat across the front, yours first
  const ESCB=(F,lvs,h0,h1,keep)=>{ const Yd=d=>F.yf+F.o*d, B=(u0,u1,d0,d1,z0,z1,top)=>gbox({x0:U(u0),x1:U(u1),y0:Math.min(Yd(d0),Yd(d1)),y1:Math.max(Yd(d0),Yd(d1)),z0,z1,c:steel,foot:0,top:top?(x,y)=>(Math.floor(x*10)+Math.floor(y*10))&1?sh(steel,.6):steel:null},F.k);
    const pl=(x,y,z,w,h,kind,seed,k,cross=true)=>{ if(FLAT)APTS.escPlants.push({x,y,z,w,h,kind:cross===false?'box':kind,seed}); else tcard(x,y,z,w,h,kind,seed,k,cross); };   // the views (your landing, out of your windows) have real pots; the street keeps flat cards
    const stone=(u0,u1,d0,d1,z0,z1)=>gbox({x0:U(u0),x1:U(u1),y0:Math.min(Yd(d0),Yd(d1)),y1:Math.max(Yd(d0),Yd(d1)),z0,z1,c:[150,138,124],foot:0},F.k);
    const rs=(lv,u0,u1,d0,d1)=>{ if(!keep)return; SOLS[lv].push(tbox4(U(u0),Yd(d0),U(u1),Yd(d1))); };
    const rail=(lv,u0,u1,d0,d1)=>{ rs(lv,u0,u1,d0,d1); const z=lv*S, al=u1-u0>d1-d0, L=al?u1-u0:d1-d0, n=Math.max(1,Math.round(L/.36));
      B(u0,u1,d0,d1,z+30,z+33); B(u0,u1,d0,d1,z+14,z+16); for(let i=0;i<=n;i++){ const t=i/n*L; al?B(u0+t-.02,u0+t+.02,d0+.01,d1-.01,z,z+30):B(u0+.01,u1-.01,d0+t-.02,d0+t+.02,z,z+30); } };
    for(const lv of lvs){ const z=lv*S; B(F.ua,F.ub,0,DI,z-3,z,1);
      B(F.ua,F.lx-.4,DI,DO,z-3,z,1); B(F.lx+.4,F.ub,DI,DO,z-3,z,1);
      B(F.ua,F.ub,DO-.06,DO,z-9,z-3); for(let u=F.ua+.3;u<F.ub;u+=2.4)B(u,u+.06,0,DO-.01,z-12,z-3.2);
      rail(lv,F.ua,F.ub,DO-.05,DO); rail(lv,F.ua,F.ua+.05,0,DO-.05); rail(lv,F.ub-.05,F.ub,0,DO-.05); B(F.ua,F.ub,DO-.16,DO+.02,z+33,z+35,1);   // a flat ledge along the top rail to set things on
      if(FLAT)for(const u of FWU)stone(u-WHW-.07,u+WHW+.07,0,.26,z+WZ[0]-2.5,z+WZ[0]);   // the windows' stone sills, deep enough for a pot
      const sp=[F.ua+.45,F.ua+1.5,F.ua+2.6,F.ub-2.4,F.ub-1.4,F.ub-.45].filter(u=>Math.abs(u-F.lx)>.7&&Math.abs(u-F.du)>.95), K=['pot','flower','fern','tall','flower'];
      sp.forEach((u,i)=>{ const h=hash(lv,i,F.o+5); if(h<.25)return; const kd=K[Math.floor(hash(lv,i,F.o+7)*K.length)]; pl(U(u),Yd(DO-.3),RZ+z,.7,kd==='tall'?54:kd==='fern'?40:46,kd,lv*13+i*7+F.o,F.k); });
      for(const [du,j] of [[-1.05,0],[1.05,1]])pl(U(F.du+du),Yd(.4),RZ+z,.6,hash(lv,j,F.o+13)<.5?34:44,K[Math.floor(hash(lv,j+8,F.o)*K.length)],lv*17+j*5+F.o+29,F.k);
      if(hash(lv,3,F.o+9)<.6)pl(U(F.du+(hash(lv,4,F.o)<.5?-1.3:1.3)),Yd(DO-.08),RZ+z+35,1.1,12,'flower',lv*5+F.o+17,F.k,false);
      if((lv<ST-1||!keep)&&hash(lv,5,F.o+11)<.7)pl(U(F.ua+.6+hash(lv,6,F.o)*(F.ub-F.ua-1.2)),Yd(DO-.35),RZ+z+S-58,.6,46,'hang',lv*9+F.o+3,F.k); }
    const l=F.lx, H1=Math.min(h1,AH+38); for(const u of [l-.24,l+.2]){ for(let h=h0;h<H1;h+=S)B(u,u+.04,DI+.03,DI+.07,h,Math.min(H1,h+S)); if(h1>=AH){ B(u,u+.04,-.35,DI+.03,AH+34,AH+38); B(u,u+.04,-.39,-.35,AH,AH+38); } }
    for(let h=h0+10;h<Math.min(h1,AH+32);h+=12)B(l-.2,l+.2,DI+.04,DI+.06,h,h+2); };
  for(const F of ESC)ESCB(F,Array.from({length:ST-1},(_,i)=>i+1),-RZ,AH+38,true);
  Object.assign(APTS,{ESC,DU,DI,DO,S,ST,TOP,FWU,escape:(F,lvs,h0,h1)=>{ APTS.escPlants=[]; FLAT=true; try{ ESCB(F,lvs,h0,h1,false); }finally{ FLAT=false; } }});
  // a real pot and plant (or a hanging basket, or a planter box for a ledge), w across and h tall in world units, standing on its base
  { const PM={}, pm=(k,c,o={})=>PM[k]||(PM[k]=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb('+c.join(',')+')'),...o}));
    APTS.plant3D=(kind,seed,w,h)=>{ '@later'; const g=new THREE.Group(), r=i=>hash(seed,i,77), add=(geo,m,x,y,z)=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
      const G=[pm('g1',[70,128,58]),pm('g2',[96,150,70]),pm('g3',[52,104,50])], FL=[[230,90,120],[245,200,70],[200,110,220],[240,240,235],[240,130,60]], terr=pm('terr',[176,92,58]);
      if(kind==='box'){ const L=w, d=w*.22, bh=h*.9; add(new THREE.BoxGeometry(L,bh,d),pm('wood',[120,78,46]),0,bh/2,0); for(let i=0;i<9;i++){ const x=(i/8-.5)*L*.9; add(new THREE.IcosahedronGeometry(d*.45,0),G[i%3],x,bh+d*.2,(r(i)-.5)*d*.3); add(new THREE.IcosahedronGeometry(d*.18,0),pm('f'+(i%5),FL[(seed+i)%5]),x+(r(i+9)-.5)*d*.3,bh+d*.55,(r(i+5)-.5)*d*.3); } return g; }
      if(kind==='hang'){ const bR=w*.35, by=h*.5; add(new THREE.SphereGeometry(bR,12,6,0,Math.PI*2,Math.PI/2,Math.PI/2),pm('bask',[150,110,70],{side:THREE.DoubleSide}),0,by+bR,0); add(new THREE.CylinderGeometry(w*.012,w*.012,h-by-bR,4),pm('chain',[40,40,44]),0,(h+by+bR)/2,0);
        for(let i=0;i<11;i++){ const a=i/11*Math.PI*2, L=h*(.2+r(i)*.3); add(new THREE.BoxGeometry(w*.06,L,w*.06),G[i%3],Math.cos(a)*bR*.8,by+bR-L/2,Math.sin(a)*bR*.8); } return g; }
      const pH=Math.min(h*.32,w*.55), pR=w*.3; add(new THREE.CylinderGeometry(pR,pR*.76,pH,12),terr,0,pH/2,0); add(new THREE.CylinderGeometry(pR*1.1,pR*1.1,pH*.16,12),terr,0,pH*.94,0); add(new THREE.CylinderGeometry(pR*.95,pR*.95,.01,12),pm('soil',[60,40,28]),0,pH*.99,0);
      if(kind==='pot'){ for(let i=0;i<6;i++){ const s=w*(.18+r(i)*.12); add(new THREE.IcosahedronGeometry(s,0),G[i%3],(r(i+9)-.5)*w*.3,pH+s*.7+r(i+3)*h*.18,(r(i+5)-.5)*w*.3); } }
      else if(kind==='flower'){ for(let i=0;i<4;i++)add(new THREE.IcosahedronGeometry(w*.18,0),G[i%3],(r(i)-.5)*w*.3,pH+w*.1,(r(i+4)-.5)*w*.3); for(let i=0;i<7;i++){ const x=(r(i+11)-.5)*w*.5, z=(r(i+21)-.5)*w*.5, y=pH+h*(.22+r(i+31)*.3); add(new THREE.CylinderGeometry(w*.015,w*.015,y-pH,4),G[2],x,(y+pH)/2,z); add(new THREE.IcosahedronGeometry(w*.075,0),pm('f'+(i%5),FL[(seed+i)%5]),x,y,z); } }
      else if(kind==='fern'){ for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+r(i), L=h*(.35+r(i+9)*.25), fr=add(new THREE.ConeGeometry(w*.07,L,4),G[i%3],Math.cos(a)*L*.28,pH+L*.32,Math.sin(a)*L*.28); fr.rotation.z=-Math.cos(a)*.9; fr.rotation.x=Math.sin(a)*.9; } }
      else { add(new THREE.CylinderGeometry(w*.03,w*.04,h*.18,5),pm('trunk',[96,66,40]),0,pH+h*.09,0); add(new THREE.ConeGeometry(w*.3,h*.6,8),G[0],0,pH+h*.45,0); add(new THREE.ConeGeometry(w*.24,h*.36,8),G[1],0,pH+h*.68,0); }
      return g; };
    APTS.plantName={pot:'POTTED PLANT',flower:'FLOWER POT',fern:'FERN',tall:'CYPRESS',box:'FLOWER BOX',hang:'HANGING BASKET'}; }
  // a fire escape's levels as meshes of their own (unturned), for the view of it from inside your apartment
  APTS.escapeMeshes=(F,lvs,h0,h1)=>{ const keep=BATCH.items.splice(0), km=BATCH.meshes, kc=BATCH.cast; BATCH.meshes={}; BATCH.cast=true;
    try{ APTS.escape(F,lvs,h0,h1); BATCH.build(APTS.MKA); return Object.values(BATCH.meshes||{}); } finally { BATCH.cast=kc; BATCH.meshes=km; BATCH.items=keep; } };

  const ST0={x0:m-DW-.25,x1:m+DW+.25,y0:A.y1,land:.85,tr:.42,n:3}; ST0.y1=A.y1+ST0.land+ST0.n*ST0.tr; APTS.ST0=ST0;
  { const BS=[98,95,90], NO=[136,131,122], CH=[86,84,80], IRN=[28,30,34], top=i=>(RZ+1)*(ST0.n-i)/(ST0.n+1), MID=[(ST0.x0+ST0.x1)/2,(ST0.x1-ST0.x0)/2], g=b=>tgbox(b.c===IRN?b:{...b,...rock(b.c,b.c===CH?67:63,.7,9,b.c===CH?null:MID)},'A');
    g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+1,c:BS}); g({x0:ST0.x0-.01,x1:ST0.x1+.01,y0:ST0.y0+ST0.land-.06,y1:ST0.y0+ST0.land+.01,z0:RZ-1,z1:RZ+1.25,c:NO});
    for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, h=top(i); g({x0:ST0.x0,x1:ST0.x1,y0,y1:y0+ST0.tr,z0:0,z1:h,c:BS}); g({x0:ST0.x0-.01,x1:ST0.x1+.01,y0:y0+ST0.tr-.06,y1:y0+ST0.tr+.01,z0:h-2,z1:h+.25,c:NO}); }
    for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ g({x0:c0,x1:c1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+7,c:CH});
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr; g({x0:c0,x1:c1,y0,y1:y0+ST0.tr,z0:0,z1:top(i)+7,c:CH}); }
      const xm=(c0+c1)/2, rail=(y0,y1,z)=>g({x0:xm-.03,x1:xm+.03,y0,y1,z0:z,z1:z+2,c:IRN}), post=(y,z0,z1)=>g({x0:xm-.025,x1:xm+.025,y0:y-.025,y1:y+.025,z0,z1,c:IRN});
      rail(ST0.y0,ST0.y0+ST0.land,RZ+7+26); for(let y=ST0.y0+.12;y<ST0.y0+ST0.land;y+=.18)post(y,RZ+7,RZ+7+26);
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, z=top(i)+7; rail(y0,y0+ST0.tr,z+26); post(y0+ST0.tr*.3,z,z+26); post(y0+ST0.tr*.75,z,z+26); }
      g({x0:xm-.06,x1:xm+.06,y0:ST0.y1-.12,y1:ST0.y1+.01,z0:top(ST0.n-1)+7,z1:top(ST0.n-1)+7+34,c:IRN}); }
    tcard(ST0.x0+.22,ST0.y0+.5,RZ+1,.4,34,'tall',71,'A'); tcard(ST0.x1-.22,ST0.y0+.5,RZ+1,.4,26,'flower',73,'A'); }

  const WPL=APTS.WPL=Object.fromEntries(['Wf','Wb','Ww','We'].map(k=>[k,new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]));   // your apartment's four walls, each cut down in the isometric view when it stands between you and the camera
  { const P=()=>new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); APTS.OUTP={tops:{Wf:P(),Wb:P(),Ww:P()},bot:P(),side:{Wf:[P(),P()],Wb:[P(),P()],Ww:[P(),P()]},far:P()}; }   // what is outside a windowed wall shows only through it in the isometric view (150a sets them each frame)
  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...(WPL[k]?{clippingPlanes:[WPL[k]]}:{})});
  APTS.MKA=MKA; BATCH.build(MKA); const AM=Object.values(BATCH.meshes); APTS.back=BATCH.all(BATCH.meshes,'E'); BATCH.meshes={}; APTS.meshes=AM; for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }

  const SY=APTS.SY=Y(S)-Y(0), TOL=Y(24)-Y(0);
  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const BLK=tbox4(A.x0,A.y0,A.x1,A.y1); SOL.up.push(BLK); (APTS0.blocks||(APTS0.blocks=[])).push({id:HP.id,box:BLK,top:Yr(TOP),mine}); FIX.up.push([BLK[0],BLK[1],0,BLK[2],BLK[3],Yr(TOP)]);
  const BHR=tbox4(APTS.BH.x0,APTS.BH.y0,APTS.BH.x1,APTS.BH.y1); FIX.up.push([BHR[0],BHR[1],Yr(TOP),BHR[2],BHR[3],Yr(TOP+72)]);
  for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ const r=tbox4(c0,ST0.y0,c1,ST0.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],.05]); }
  const EDGE=[tbox4(A.x0,A.y1-T,A.x1,A.y1),tbox4(A.x0,A.y0,A.x1,A.y0+T),tbox4(A.x0,A.y0,A.x0+T,A.y1),tbox4(A.x1-T,A.y0,A.x1,A.y1)];
  if(!mine){ const d=XZ(m,A.y1+.25), o=new THREE.Mesh(new THREE.BoxGeometry(1.3*TILE,2.4*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); o.position.set(d[0],Yr(RZ)+1.2*TILE,d[1]); scene.add(o);   // another house's door: its lobby is for its own tenants
    const nm='APARTMENTS '+(HI+1), mineNo=APTS0.houses?APTS0.houses.indexOf(APTS0.mine)+1:1, reg2=()=>{ try{ UI.thing({name:nm,ghost:1,obj:o,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>UI.log(nm+': A TENANT\'S KEY OPENS THIS LOBBY. YOUR FLAT IS IN APARTMENTS '+mineNo+'.','#c8a090')}); }catch(e){ setTimeout(reg2,400); } }; setTimeout(reg2,0); return; }
  const LAD={F:null,y:0}, LV=38, LAND=Array.from({length:ST-1},(_,i)=>(i+1)*S), LS_=[-RZ,...LAND,AH], RFY=R0+SY*(ST-.3);
  const EG=(x,z)=>{ if(!MODS.posok||Math.abs(x-pos.x)+Math.abs(z-pos.z)>.5*TILE)return null; if(LAD.F)return Y(LAD.y); const [lx,ly]=loc(x,z), u=lx-U(0);
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
  APTS.floor=()=>MODS.posok?APTS.lvOf(SHARED.py):0;
  const lpos=F=>{ const [x,z]=lpt(F,1.3); pos.x=x; pos.z=z; SHARED.heading=TA.hd(F.o>0?Math.PI:0); };
  const lgo=(F,y)=>{ LAD.F=F; LAD.y=y; lpos(F); st.climb={z:0,ph:y}; SHARED.target=null; };
  const loff=top=>{ const F=LAD.F, [x,z]=lpt(F,top?-1:.45); LAD.F=null; st.climb=null; pos.x=x; pos.z=z; };
  APTS.lad=(dt,up,dn,off)=>{ if(!MODS.posok||SHARED.LVL!=='up')return false;
    if(!LAD.F){ if(!(up||dn))return false; for(const F of ESC){ const [lx,ly]=loc(pos.x,pos.z), u=lx-U(0), d=(ly-F.yf)*F.o; if(Math.abs(u-F.lx)>.5)continue;
        if(d>DI&&d<DO)for(const y of [-RZ,...LAND])if(Math.abs(SHARED.py-Y(y))<SY*.25&&(up||y>S)){ lgo(F,y); return true; }
        if(dn&&d<0&&d>-1.5&&SHARED.py>RFY){ lgo(F,AH); return true; } } return false; }
    const [x,z]=lpt(LAD.F,1.3); if(Math.hypot(pos.x-x,pos.z-z)>1.5*TILE){ LAD.F=null; st.climb=null; return false; }
    const at=LS_.find(y=>Math.abs(LAD.y-y)<4);
    if(at!=null&&off&&!up&&!dn){ loff(at===AH); return false; }
    const K=FORAGE.climbK?FORAGE.climbK():1, r0=Math.floor(LAD.y/12);   // the CLIMBING skill sets the pace; every rung reached works it
    if(up){ if(LAD.y>=AH-22){ loff(1); RIG.act(st,'mantle'); return false; } LAD.y=Math.min(AH,LAD.y+LV*K*dt); }
    else if(dn){ if(LAD.y<=-RZ){ loff(0); return false; } LAD.y=Math.max(-RZ,LAD.y-LV*K*dt); }
    if(Math.floor(LAD.y/12)!==r0&&FORAGE.climbed)FORAGE.climbed();
    if(st.climb)st.climb.ph=LAD.y;
    else { const n=LS_.reduce((p,q)=>Math.abs(q-LAD.y)<Math.abs(p-LAD.y)?q:p); if(Math.abs(n-LAD.y)<10)LAD.y+=(n-LAD.y)*Math.min(1,dt*8); }
    lpos(LAD.F); return true; };
  APTS.ground=(x,z)=>!MODS.posok?R0:SHARED.py>RFY?R0+SY*ST:R0;
  const EB=ESC.map(F=>tbox4(U(F.ua-.05),F.yf,U(F.ub+.05),F.yf+F.o*(DO+.05))), ovl=(s,b)=>s[0]<b[2]&&s[2]>b[0]&&s[1]<b[3]&&s[3]>b[1];
  APTS.in=false; APTS.esc=false; let was=-1;
  APTS.tick=()=>{ const ib=APTS.inside(pos.x,pos.z), roof=ib&&MODS.posok&&SHARED.py>RFY, eg=!ib&&SHARED.LVL==='up'&&EG(pos.x,pos.z)!=null, lv=APTS.floor();
    APTS.in=!!APTS.inReal; APTS.esc=eg;
    const key=(eg?2:0)+(roof?16:0)+lv*4; if(key!==was){ was=key; return eg?SOL.up.filter(s=>s===BLK||!EB.some(b=>ovl(s,b))).concat(SOLS[lv]):roof?SOL.up.filter(s=>s!==BLK).concat(EDGE,[BHR]):SOL[SHARED.LVL]||SOL.up; } return null; };
  window.HOUSEAT=(dy=0)=>XZ(m,A.y1+dy); APTS.doorAt=XZ(m,A.y1); APTS.doorHd=TA.hd(0);
  window.APTSDBG=()=>({in:APTS.in,esc:APTS.esc,floor:APTS.floor(),py:SHARED.py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],door:+X(m).toFixed(1),lad:LAD.F?+LAD.y.toFixed(1):null,block:BB});

  const AW_=FWD, AD_=+(A.y1-A.y0-HALL).toFixed(3), AR={x0:994+OFFDX/BLDK,y0:20,x1:994+OFFDX/BLDK+AW_,y1:20+AD_}, HR=APTS.HR={x0:AR.x0,y0:AR.y1,x1:AR.x1,y1:+(AR.y1+HALL).toFixed(3)}, IN=APTS.IN={x0:AR.x0,y0:AR.y0,x1:AR.x1,y1:HR.y1}, AX=(AR.x0+AR.x1)/2, WH=S, MY=APTS.my=FL.floor!=null?Math.min(ST-1,FL.floor):ST-1, RB=APTS.RB=RZ+Math.min(MY,ST-2)*S, Yh=z=>Yr(RB+z), DC=AR.x0+DU; APTS.R=AR; APTS.fw=[DC,AR.y0]; APTS.WIN={FWU,SIDE,WHW,WZ,WINA,WINB,DU,DC,DH};
  // real window glass: clear looked through straight, the sky's sheen at a slant, the sun's glint
  APTS.glassMat=(o={})=>{ '@later'; const m=new THREE.MeshPhongMaterial({color:0xa8bccb,specular:0xffffff,shininess:160,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,...o});
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n float fr=pow(1.-abs(dot(normalize(normal),normalize(vViewPosition))),3.); gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.72,.82,.92),fr*.5); gl_FragColor.a=mix(gl_FragColor.a,.55,fr);'); };
    m.customProgramCacheKey=()=>'aptglass'; return m; }; const BED=APTS.BED={x0:AR.x0+7.75,y0:AR.y0,x1:AR.x1,y1:AR.y0+5,H:WH};   // the bedroom's corner (front right): its own walls, things and light (150a-bedroom)   // off-map in the empty sky; footprint and one-storey height match the real building exactly (1:1)
  const FURN=[], DYN={win:[],bar:[],cur:[],flame:[]}; let PA=null, AS=[], AF=[], AG=null;
  const DG=.5, ED=APTS.escDoor={open:false,sol:null,set:o=>{ ED.open=!!o; if(!APTS.solid)return; if(ED.open&&ED.sol){ APTS.unsolid(ED.sol); ED.sol=null; } else if(!ED.open&&!ED.sol)ED.sol=APTS.solid(DC-DG,AR.y0-.4,DC+DG,AR.y0,WH); }};   // the door to the fire escape: open, you walk through; shut, it is wall
  const FD=APTS.frontDoor={open:false,sol:null,set:o=>{ FD.open=!!o; if(!APTS.solid)return; if(FD.open&&FD.sol){ APTS.unsolid(FD.sol); FD.sol=null; } else if(!FD.open&&!FD.sol)FD.sol=APTS.solid(DC-DG,AR.y1,DC+DG,AR.y1+.4,WH); }}; APTS.floorY=Yh(0);   // your front door, onto the hall
  APTS.inside=()=>APTS.inReal&&AG?{x0:Math.min(X(AR.x0),X(AR.x1)),x1:Math.max(X(AR.x0),X(AR.x1)),z0:Math.min(Z(AR.y0),Z(AR.y1)),z1:Math.max(Z(AR.y0),Z(AR.y1)),y:Yh(0),sol:AS,fix:AF}:null;   // your room's floor, its solids and the tops of what stands in it (your pets at home)
  APTS.furnish=(lv,fn)=>{ FURN.push(fn); if(PA){ const Q=ROOMS.part(AG,fn); for(const k of ['objs','things','cuts','lights'])PA[k].push(...Q[k]); } };
  const build=()=>{ '@apts'; const K=SHARED.BOD.K, n0=K.PROPS.length, l0=SHARED.BOD.STOREK.LAMPS.length; AG=new THREE.Group(); AG.name='apts-in'; scene.add(AG); AS=[];
    const sol=(x0,y0,x1,y1,h)=>{ const r=box4(x0,y0,x1,y1); AS.push(r); SOL.up.push(r); let f=null; if(h!=null){ f=[r[0],r[1],Yh(0),r[2],r[3],Yh(h)]; AF.push(f); FIX.up.push(f); } return {r,f}; }; APTS.solid=sol;
    APTS.shelf=(x0,y0,x1,y1,b,t)=>{ const r=box4(x0,y0,x1,y1), f=[r[0],r[1],b,r[2],r[3],t]; AF.push(f); FIX.up.push(f); return {r:null,f}; };   // a surface off the floor (a shelf) for loose things to rest on
    APTS.unsolid=h=>{ const rm=(L,x)=>{ const i=L.indexOf(x); if(i>=0)L.splice(i,1); }; if(h.r){ rm(AS,h.r); rm(SOL.up,h.r); } if(h.f){ rm(AF,h.f); rm(FIX.up,h.f); } };   // a piece moved in the room editor lifts its old solid
    PA=ROOMS.part(AG,()=>{
      // the shell (brick walls, the windows and doors, the planks) is your room's own build (150a-bedroom); here only what you walk into
      sol(AR.x0-.4,AR.y0-.4,DC-DG,AR.y0,WH); sol(DC+DG,AR.y0-.4,AR.x1+.4,AR.y0,WH); ED.sol=null; ED.set(ED.open); sol(AR.x0-.4,AR.y1,DC-DG,AR.y1+.4,WH); sol(DC+DG,AR.y1,AR.x1+.4,AR.y1+.4,WH); FD.sol=null; FD.set(FD.open); sol(AR.x0-.4,HR.y1,AR.x1+.4,HR.y1+.4,WH); sol(AR.x0-.4,AR.y0,AR.x0,HR.y1,WH); sol(AR.x1,AR.y0,AR.x1+.4,HR.y1,WH); APTS.door=[DC,AR.y1];   // the walls stand outside the room's faces, so no loose thing starts inside one (the physics leaves out any wall a thing overlaps), floor to ceiling
      const put=(k,x,y,r=0,solid=true)=>{ const f=K.CATALOG[k]; if(!f)return null; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; SHARED.BOD.place(p,r); for(const b of p.boxes)SHARED.BOD.gbox({...b,z0:b.z0+RB,z1:b.z1+RB},'A');
        const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(solid&&!p.walk&&!p.high&&bs.length)sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1))); p.kind=k; made.push(p); return p; };
      APTS.put=put; const made=APTS.made=[];
      for(const f of FURN)f(); },MKA);
    K.PROPS.length=n0; SHARED.BOD.STOREK.LAMPS.length=l0;
    { const g=new THREE.PlaneGeometry(Math.abs(X(AR.x1)-X(AR.x0)),Math.abs(Z(HR.y1)-Z(AR.y0))); g.rotateX(Math.PI/2);   // the ceiling: there, but hidden while you look in from outside (iso); seen in first person when you look up
      const ceil=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xe0dace,side:THREE.DoubleSide})); ceil.position.set((X(AR.x0)+X(AR.x1))/2,Yh(WH),(Z(AR.y0)+Z(HR.y1))/2); ceil.visible=false; AG.add(ceil); APTS.ceil=ceil;
      const roof=new THREE.Mesh(g,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:THREE.DoubleSide})); roof.position.copy(ceil.position); roof.position.y+=.02; roof.castShadow=true; roof.renderOrder=-9; AG.add(roof); }   // the sun reaches in only through the windows
    return PA; };
  const unbuild=()=>{ ED.sol=null; FD.sol=null; for(const r of AS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } AS=[]; for(const f of AF){ const i=FIX.up.indexOf(f); if(i>=0)FIX.up.splice(i,1); } AF=[]; PA=null; for(const k in DYN)DYN[k].length=0; if(AG){ AG.removeFromParent(); AG=null; } };
  SYS.add('places',()=>{ if(!APTS.in&&!APTS.inReal)return; const t=performance.now()/1000, e=CLOCK.elev(), day=Math.max(0,Math.min(1,(e+2)/10)), sv=CLOCK.sunV;   // the apartment breathes with the live sun: daylight at the glass, slats creeping over the floor, candle flames guttering
    for(const m of DYN.win)m.material.opacity=(.06+.14*day)*.5;   // faint bloom only; the real sky shows through the open window
    for(const m of DYN.bar){ m.material.opacity=day*.5*(.62+.38*Math.sin(t*.22)); m.position.set(sv.x*day*3,0,sv.z*day*3); }
    for(const c of DYN.cur){ const b=c.base, p=c.m.geometry.attributes.position.array, span=Math.max(.1,c.y1-c.y0);
      for(let k=0;k<p.length;k+=3){ const by=b[k+1], f=(c.y1-by)/span, g=f*f+.05; p[k+2]=b[k+2]+Math.sin(t*1.6+by*.05+c.ph)*.5*c.fw*g; p[k]=b[k]+Math.cos(t*1.3+by*.04+c.ph)*.3*g; } c.m.geometry.attributes.position.needsUpdate=true; }
    for(const f of DYN.flame){ const fl=.7+.3*Math.sin(t*11+f.fy)+.15*Math.sin(t*23.3+f.fy*2); f.L.intensity=f.i0*(.6+.4*fl); f.fm.scale.set(1,.85+.3*fl,1); f.fm.material.opacity=.72+.24*fl; f.fm.position.y=f.fy+Math.sin(t*7+f.fy)*.3; }
  },'059a-apts');
  APTS.spawn=[X((AR.x0+AR.x1)/2),Z((AR.y0+AR.y1)/2),0,Math.PI];   // in the middle of your rooms (owner, 7 Nov 2026: "yuo spawn in the middle of you apartment")   // the apartment is entered off the map (not a clipped ROOMS room), so the live sky shows through its open windows
  APTS.doorW=(d=>[d[0],Y(0),d[1]])(XZ(m,A.y1+.25));
  // YOUR APARTMENT: entered off the map (the street never draws here), the live sky showing through the open windows with the far city hidden, so you look out on nothing but sky and clouds (owner, 23 Oct 2026)
  { APTS.inReal=false;
    const hideFar=()=>{ const F=FAR3; if(F){ if(F.mesh)F.mesh.visible=false; if(F.panels)F.panels.visible=false; if(F.trees)F.trees.visible=false; if(F.FU)F.FU.uMK.value=0; if(F.fog&&scene.fog===F.fog)scene.fog=null; } };
    APTS.enterReal=async(at,label)=>{ if(FADE.busy)return; await FADE.run(label||'YOUR APARTMENT',async()=>{ if(!PA){ if(window.LOAD)await LOAD('apts','later'); build(); } if(MODS.firev&&STORE.offGo)await STORE.offGo(MODS.firev.name); if(AG)AG.visible=true; APTS.inReal=true; hideFar(); if(typeof at==='function')at=at(); if(at){ UI.goTo(at[0],at[1],at[2]); SHARED.heading=at[3]; } else { UI.goTo(X((AR.x0+AR.x1)/2),Z((AR.y0+AR.y1)/2),Yh(0)); SHARED.heading=0; } },{hold:200}); };   // your rooms and their fire escape are one place, built together
    APTS.exitReal=async(label='OUT TO THE STREET')=>{ if(FADE.busy)return; await FADE.run(label,async()=>{ APTS.inReal=false; if(AG)AG.visible=false; const d=XZ(m,A.y1+.9); UI.goTo(d[0],d[1],Yr(1)); SHARED.heading=TA.hd(0); },{hold:200}); };   // the elevator and the stairs down land you at the stoop (the lobby and the other floors are not built)
    APTS.roofGo=async()=>{ if(FADE.busy)return; await FADE.run('UP TO THE ROOF',async()=>{ APTS.inReal=false; if(AG)AG.visible=false; const d=XZ(APTS.BH.cx,APTS.BH.y1+1.2); UI.goTo(d[0],d[1],Yr(TOP)); SHARED.heading=TA.hd(0); },{hold:200}); };   // the stairs up come out of the stair head on the roof
    let hbMade=false; const mkHB=()=>{ if(hbMade||!UI.thing)return; hbMade=true; const hb=(p,name,act)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(1.3*TILE,2.4*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); o.position.set(p[0],p[1]+1.2*TILE,p[2]); scene.add(o); UI.thing({name,ghost:1,obj:o,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act}); };
      hb(APTS.doorW,'YOUR APARTMENT',()=>APTS.enterReal()); const r=XZ(APTS.BH.cx,APTS.BH.y1+.4); hb([r[0],Yr(TOP),r[1]],'STAIRS DOWN',()=>{ if(SHARED.py>RFY)APTS.enterReal(()=>APTS.hallSpawn); }); };   // the front door on the street; the stair head on the roof (down into your hall)
    const inR=(x,z)=>{ const a=X(AR.x0),b=X(AR.x1),c=Z(AR.y0),d=Z(HR.y1); return x>Math.min(a,b)-3&&x<Math.max(a,b)+3&&z>Math.min(c,d)-4&&z<Math.max(c,d)+3; };
    APTS.inR=inR; APTS.bound=()=>{ const a=X(AR.x0),b=X(AR.x1),c=Z(AR.y0),d=Z(HR.y1); return {x0:Math.min(a,b)-8,x1:Math.max(a,b)+8,z0:Math.min(c,d)-8,z1:Math.max(c,d)+8}; };   // walking in your rooms is bounded by them, not by the street's edge   // a saved spot inside the apartment (off the map): rebuild and re-enter it on reload, else you land in the empty sky
    const inH=(x,z)=>{ const a=X(HR.x0),b=X(HR.x1),c=Z(HR.y0),d=Z(HR.y1); return x>Math.min(a,b)&&x<Math.max(a,b)&&z>Math.min(c,d)&&z<Math.max(c,d); }; APTS.inHall=()=>!!APTS.inReal&&inH(pos.x,pos.z); APTS.HPL=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); APTS.CUTH=Yh(0)+Yr(45)-Yr(0);   // in the hall the isometric view cuts the hall's walls to waist height (your rooms' walls stay whole)
    APTS.offAt=async(x,z,lv)=>{ if(lv==='down')return false; const F=MODS.firev, u=x/(TILE*BLDK)+SHARED.BOD.OX, v=z/(TILE*BLDK)+SHARED.BOD.OY; if(inR(x,z)){ if(!APTS.inReal)await APTS.enterReal(); return [x,z,Yh(0)]; }   // your rooms and their fire escape are all on one floor
      if(F&&F.out&&Math.abs(u-F.CX)<10&&Math.abs(v-F.WY-1)<4){ await F.out(); return [pos.x,pos.z,SHARED.py]; } return false; };   // a spot saved where the fire escape used to stand: your landing
    const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>APTS.inReal&&inR(x,z)?((APTS.hallY&&APTS.hallY(x,z))??Yh(0)):sg0?sg0(x,z):null;   // the hall's stairs step you down and up
    SYS.add('places',()=>{ mkHB(); if(APTS.inReal&&(SHARED.LVL!=='up'||!inR(pos.x,pos.z)&&!(MODS.firev&&MODS.firev.onL&&MODS.firev.onL(pos.x,pos.z)))){ APTS.inReal=false; if(AG)AG.visible=false; }   // left by any way (menu, stairs, a door, a saved spot), not only your own door
      if(APTS.inReal)hideFar(); if(APTS.ceil)APTS.ceil.visible=APTS.inReal&&!!UI.persp; const hc=APTS.inHall()&&!UI.persp?APTS.CUTH:1e6; APTS.HPL.constant=hc; WPL.Wb.constant=hc; },'059a-aptsky');   // ceiling only in first person; gone when you view the room from outside
    window.ENTERAPT=()=>APTS.enterReal(); window.EXITAPT=()=>APTS.exitReal();
    APTS.REALDBG=()=>({inReal:APTS.inReal,built:!!PA}); }
  } }
export {APTS};
