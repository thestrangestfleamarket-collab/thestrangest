// THE BATH HOUSE AT WORK (still empty but for its steam, the owner's rule): THE BEDSHEET, a cloth ghost, at a small front desk by the door (a soak and a towel, $4: the steam mends you three times as fast a while), benches to sit on round the walls, the towel shelf; where its two attendants and its bathers go.
import {SHARED} from './003-shx.js';
import {INV, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
const BATHK={until:0}; window.BATHK=BATHK;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), GD=()=>SHARED.BOD.GD, now=()=>performance.now()/1000;
  // its list of where people go, on the street's rooms (no walls of its own there: its inside is built in place)
  const frame=()=>{ const G=GD(); return G&&G.r?IKIT.frame({x0:G.r[0],y0:G.r[1],x1:G.r[2],y1:G.r[3]}):null; };
  { const F=frame(), G=GD(); if(F&&G){ const {W,D}=F, sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; }, b=F.box(0,0,W,D), dp=G.door?[SHARED.BOD.X(G.door[0]),SHARED.BOD.Z(G.door[1])]:F.pw(W/2,D);
    const R={id:'dojo',name:'THE BATHS',x0:b[0],z0:b[1],x1:b[2],z1:b[3],y0:-1,y1:SHARED.BOD.Y(170),at:{x:dp[0],z:dp[1]},inside:()=>false,
      spots:{ATTENDANT:sp(W-1.1,D-2.6,-1,0),'KEEPS THE STEAM':sp(W/2,2.2,0,1)},
      seats:[sp(W*.3-.45,.75,0,1,.45),sp(W*.3+.45,.75,0,1,.45),sp(W*.7-.45,.75,0,1,.45),sp(W*.7+.45,.75,0,1,.45),sp(.75,D*.4,1,0,.45),sp(.75,D*.4+.9,1,0,.45)]};
    (STORE.rooms||(STORE.rooms=[])).push(R); BATHK.room=R; } }
  // a soak and a towel at the desk: the steam mends you faster for three minutes
  BATHK.soak=()=>{ '@later'; if(BATHK.until>now())return say('THE BEDSHEET: "YOU ARE STILL SOAKING. ENJOY THE STEAM."'); if(!INV.afford(4))return say('THE BEDSHEET: "A SOAK AND A TOWEL IS FOUR DOLLARS."','#c8a090');
    INV.pay(4); BATHK.until=now()+180; BATHK.paid=(BATHK.paid||0)+1; say('THE BEDSHEET HANDS YOU A WARM TOWEL. SIT IN THE STEAM: IT MENDS YOU FAST FOR THREE MINUTES.'); };
  VIT.mends.push(()=>{ const G=GD(); return BATHK.until>now()&&G&&G.inside&&G.inside()?1/15:0; });
  const LINES=['"WELCOME TO THE BATHS. SHOES OFF, PLEASE."','"THE STEAM IS GOOD FOR THE LIVING AND THE DEAD."','"I WAS A BEDSHEET ONCE. NOW I AM A BEDSHEET THAT WORKS."','"TOWELS ARE WITH THE SOAK. FOUR DOLLARS."'];
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.bath=()=>{ '@bath'; const F=frame(); if(!F)return; const first=!BATHK.sol; BATHK.sol=true; const {W,D}=F, K=IKIT.room(F,o=>scene.add(o),first?undefined:()=>{}), {box,cyl,ball,glow,use,seat,own,meshOf,matL}=K;
    const C={wood:0x6a4a2a,dark:0x2a2018,paper:0xf4efe0,towel:0xe8e4d8,blue:0x5a7aa0};
    // the front desk by the door, left of it as you come in: a low wooden counter, a bell, a ledger
    const d0=W/2-3.4, d1=W/2-1.6, dv=D-2.0; box(d0,dv,d1,dv+.5,0,.95,C.wood); box(d0-.02,dv-.02,d1+.02,dv+.52,.95,.99,C.dark); cyl(d0+.3,dv+.25,.06,.99,1.04,0xc8a040); box(d1-.6,dv+.1,d1-.2,dv+.4,.99,1.01,0x8a2a24); K.sol(d0,dv,d1,dv+.5);
    use('THE FRONT DESK (A SOAK AND A TOWEL $4)',(d0+d1)/2,dv+.25,1.6,1.1,BATHK.soak,1.6);
    // THE BEDSHEET behind it: a sheet over nobody, two dark eyes; it bobs as it floats
    { const gu=(d0+d1)/2, gv=dv-.6, b=own(()=>{ cyl(gu,gv,.4,.05,1.25,0xf4f4f0,.14,14); ball(gu,gv,1.38,.2,0xf4f4f0,1.1); ball(gu-.07,gv+.17,1.42,.03,0x101010); ball(gu+.07,gv+.17,1.42,.03,0x101010); }), me=meshOf(b,matL,true); me.userData.noMerge=true; BATHK.ghost=me; BATHK.g0=me.position.y;
      use('THE BEDSHEET',gu,gv,.6,1.6,()=>say('THE BEDSHEET: '+LINES[Math.floor(Math.random()*LINES.length)],'#e8e8f4'),1.6); }
    // benches round the walls, low and plain
    const bench=(u0,v0,u1,v1,spots)=>{ seat('A BENCH',own(()=>{ box(u0,v0,u1,v1,.38,.45,C.wood); for(const [a,b] of [[u0+.05,v0+.05],[u1-.1,v0+.05],[u0+.05,v1-.1],[u1-.1,v1-.1]])box(a,b,a+.05,b+.05,0,.38,C.dark); }),spots,1.0); K.sol(u0,v0,u1,v1); };
    for(const c of [W*.3,W*.7])bench(c-.9,.5,c+.9,1.0,[[c-.45,.75,.45,0,1],[c+.45,.75,.45,0,1]]);
    bench(.5,D*.4-.45,1.0,D*.4+1.35,[[.75,D*.4,.45,1,0],[.75,D*.4+.9,.45,1,0]]);
    // the towel shelf by the door, right of it
    { const u0=W-.6, u1=W-.15, v0=D-3.2, v1=D-2.0; box(u0,v0,u1,v1,0,1.6,C.wood); for(let r=0;r<3;r++)for(let i=0;i<3;i++)box(u0+.04,v0+.1+i*.38,u1-.04,v0+.42+i*.38,.3+r*.45,.42+r*.45,r===1?C.blue:C.towel); K.sol(u0,v0,u1,v1);
      use('THE TOWEL SHELF',(u0+u1)/2,(v0+v1)/2,.6,1.6,()=>say(BATHK.until>now()?'YOU TAKE A FRESH TOWEL. THE STEAM CLINGS TO IT.':'THE TOWELS COME WITH A SOAK AT THE DESK.','#c8c0b0'),1.4); }
    K.flush(); };
  SYS.add('life',()=>{ const g=BATHK.ghost; if(!g||!g.parent)return; const t=now(); g.position.y=BATHK.g0+Math.sin(t*1.3)*.05*IKIT.MW; g.rotation.y=Math.sin(t*.4)*.2; },'146zk-bath');
}
