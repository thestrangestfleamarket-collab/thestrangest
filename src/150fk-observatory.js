// THE PUBLIC OBSERVATORY'S INSIDE AND ITS TELESCOPE: OBSV furnishes the park observatory's dome room (MSHOP.kit.observatory; its outside 059ia) and runs THE GREAT TELESCOPE, a 400 mm reflector everyone shares: the first to step up steers and shares the eyepiece (the star party, 150fh), whoever steps up after sees what they see and can ask for the tube.
import {THREE} from './003-shx.js';
import {ONLINE, ROOMS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
import {SCOPE} from './150fd-scope.js';
import {ASTRO} from './150fh-astro.js';
const OBSV={site:{ap:400,dark:1.2,max:400,name:'THE GREAT TELESCOPE (400 MM)',field:true,obs:true}}; window.OBSV=OBSV;
{ const say=(t,c)=>SAY(t,c||'#c8e0ff'); let keep=null, tube=null;
  const here=()=>ROOMS.offIn&&ROOMS.offIn()==='observatory';
  // who has the tube now: another player whose shared view was heard within the last few seconds
  OBSV.op=()=>{ const o=ASTRO.obsOp; return o&&performance.now()-o.t<3000?o:null; };
  OBSV.use=async()=>{ if(SCOPE.isOpen())return; if(!keep)keep=SCOPE.site; SCOPE.site=OBSV.site; const o=OBSV.op();
    if(o){ await ASTRO.watch(o.id,o.name,true); return; }
    ASTRO.share(true); await SCOPE.open(); say('YOU HAVE THE GREAT TELESCOPE. WHOEVER STEPS UP AFTER YOU SEES WHAT YOU SEE.'); };
  SCOPE.ext.push({close:()=>{ if(SCOPE.site!==OBSV.site)return; SCOPE.site=keep||SCOPE.site; keep=null; if(SCOPE.mag>SCOPE.zmax())SCOPE.mag=50; }});
  // the tube follows whoever steers; nobody at it, it rests pointing up the slit
  // whoever had the tube walks off: after a moment with nobody steering, a watcher still at the eyepiece has it (each waits a different while, so one of them takes it)
  let idleT=0; const turn=()=>{ let h=0; for(const c of String(ONLINE.me||''))h=(h*31+c.charCodeAt(0))%5; return 1500+h*700; };
  SYS.add('places',()=>{ const on=SCOPE.isOpen()&&SCOPE.site===OBSV.site; if(on&&!here()){ SCOPE.close(); return; }
    if(on){ const P=ASTRO.party(); if(P.on||P.watching||OBSV.op())idleT=0; else if(!idleT)idleT=performance.now(); else if(performance.now()-idleT>turn()){ idleT=0; ASTRO.share(true); say('THE TUBE IS YOURS NOW.'); SCOPE.view.panel(); } } else idleT=0;
    if(!tube)return;
    const  alt=on?Math.max(5,SCOPE.alt):62, az=on?SCOPE.az:180, k=.08; tube.rotation.y+=((((-az*Math.PI/180-tube.rotation.y)%6.2832)+9.4248)%6.2832-3.1416)*k; tube.rotation.x+=(-alt*Math.PI/180-tube.rotation.x)*k; },'150fk-observatory');
  MSHOP.kit.observatory=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, K=IKIT.room(F,o=>A.add(o),()=>{}), {box,cyl,ball,glow,pic,words,use,seat,own}=K, W=F.W, D=F.D, tm=D/(R.y1-R.y0), HT=A.WH/24*tm, cu=W/2, cv=D/2;
    const sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm);
    // the floor: stone flags, a brass ring round the pier; the walls: dark plaster over a panelled dado
    A.floor((x,y)=>{ const u=(x-R.x0)*tm-cu, v=(y-R.y0)*tm-cv, r=Math.hypot(u,v), i=Math.floor((u+40)*1.25), j=Math.floor((v+40)*1.25), s=.86+.14*A.hs(i,j,5), seam=((u+40)*1.25%1<.05||(v+40)*1.25%1<.05)?.72:1;
      if(Math.abs(r-2.2)<.06||Math.abs(r-5.6)<.05)return [176,140,70]; if(r<2.2)return [70,74,84].map(c=>c*s); return [112,110,106].map(c=>c*s*seam); });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<5)return [34,36,44]; if(z<26){ const pn=a*1.4%1; return (pn<.06||z<8||z>23?[74,62,50]:[92,76,58]).map(c=>c*(.94+.06*A.hs(Math.floor(a*10),Math.floor(z/3),4))); } if(z<28)return [150,120,70];
      return [40,46,62].map(c=>c*(.9+.1*A.hs(Math.floor(a*6),Math.floor(z/10),7))); });
    // the pier and the fork; the tube on its own so it can turn
    cyl(cu,cv,.75,0,.25,0x5a5e68); cyl(cu,cv,.5,.25,1.7,0x8a8e98,.42); sol(cu-.6,cv-.6,cu+.6,cv+.6);
    for(const s of [-1,1])box(cu+s*.62-.08,cv-.22,cu+s*.62+.08,cv+.22,1.5,3.1,0x3a4050); box(cu-.7,cv-.25,cu+.7,cv+.25,1.5,1.75,0x3a4050);
    { const lam=c=>new THREE.MeshLambertMaterial({color:c}), g=new THREE.Group(), p=F.pw(cu,cv), m=(geo,c,z,y=0)=>{ const o=new THREE.Mesh(geo,lam(c)); o.rotation.x=Math.PI/2; o.position.set(0,y,z); g.add(o); return o; };
      m(new THREE.CylinderGeometry(.42*MW,.42*MW,4.2*MW,20),0xeceae4,.7*MW); m(new THREE.CylinderGeometry(.46*MW,.46*MW,.5*MW,20),0x2a2e38,2.6*MW); m(new THREE.CylinderGeometry(.46*MW,.46*MW,.35*MW,20),0x2a2e38,-1.3*MW);
      m(new THREE.CylinderGeometry(.07*MW,.07*MW,1.1*MW,10),0x2a2e38,1.2*MW,.52*MW); m(new THREE.CylinderGeometry(.05*MW,.06*MW,.4*MW,10),0xb08a40,-1.65*MW);
      g.rotation.order='YXZ'; g.rotation.set(-62*Math.PI/180,Math.PI,0); g.position.set(p[0],2.9*MW,p[1]); A.add(g); tube=g; }
    use('THE GREAT TELESCOPE (LOOK)',cu,cv+1.3,1.6,2,()=>OBSV.use(),2.4);
    // the slit overhead, lit by the sky; benches along the side walls; the boards by the door
    glow(()=>box(cu-.6,.6,cu+.6,D-.6,HT-.04,HT-.02,0x24365a));
    for(const u of [.5,W-.5])for(const v of [D*.3,D*.62]){ seat('A BENCH',own(()=>{ box(u-.25,v-.9,u+.25,v+.9,.4,.46,0x6a4a2a); for(const e of [-.8,.8])box(u-.22,v+e-.05,u+.22,v+e+.05,0,.4,0x3a2a1a); }),[[u,v-.4,.46,u<cu?1:-1,0],[u,v+.4,.46,u<cu?1:-1,0]],1.0); sol(u-.25,v-.9,u+.25,v+.9); }
    pic(cu-3,D-.03,1.5,2.6,1.5,0,-1,words(208,120,'#1c2030',[['THE GREAT TELESCOPE',104,6,'#f2c14e',12,'center'],['A 400 MM REFLECTOR, FREE TO ALL.',104,26,'#e6e2d6',8,'center'],['THE FIRST TO STEP UP STEERS.',104,42,'#e6e2d6',8,'center'],['EVERYONE AFTER SEES THE SAME',104,54,'#e6e2d6',8,'center'],['VIEW AND MAY ASK FOR THE TUBE.',104,66,'#e6e2d6',8,'center'],['THE FAINT MESSIER OBJECTS',104,86,'#c8e0ff',8,'center'],['SHOW HERE AND NOWHERE ELSE.',104,98,'#c8e0ff',8,'center']]),true);
    { const T=(ASTRO.tonight?ASTRO.tonight():[]).slice(0,8).map(r=>String(r[0]||'').slice(0,34)); pic(cu+3,D-.03,1.5,2.6,1.5,0,-1,words(208,120,'#1c2030',[["TONIGHT'S SKY",104,6,'#f2c14e',12,'center'],...T.map((t,i)=>[t,8,26+i*11,'#e6e2d6',8])]),true); }
    for(const [u,v] of [[1.2,1.2],[W-1.2,1.2],[1.2,D-1.2],[W-1.2,D-1.2]]){ cyl(u,v,.04,0,1.5,0x2a2e38); glow(()=>ball(u,v,1.56,.09,0xff5a40)); }   // red lamps: they keep your night eyes
    A.lamp(R.x0+cu/tm,R.y0+cv/tm,(HT-1.5)/tm,0xff8a68,3.4,14); A.add(new THREE.HemisphereLight(0xa88a90,0x3a2c34,1.5));
    K.flush(); };
  MSHOP.kit.observatory.drop=()=>{ tube=null; };
}
