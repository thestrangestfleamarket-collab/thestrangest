// THE ARCADE, FURNISHED: round the owner's cabinets and the holodeck booth, what a real arcade has: skee-ball, HOOP FEVER (basketball), air hockey, a claw machine and two pinball tables (each a game, free play), the token machine (tickets won at the games traded for market tokens, 10 for 1), a soda machine, stools at the cabinets; where its staff and its crowd stand or sit.
import {THREE} from './003-shx.js';
import {FORAGE, INV, ROOMS, UI, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {SKEE} from './146yz-skee.js';
import {HOOPS} from './146yza-hoops.js';
import {AIRH} from './146zcz-airhockey.js';
import {PIN} from './146zcz-pinball.js';
const ARCADE={}; window.ARCADE=ARCADE;
{ FORAGE.add({names:{arc_token:'A MARKET TOKEN',prize_yoyo:'A YO-YO',prize_ring:'A PLASTIC RING'}});   // the prize tickets and plushes are the fair's (ptix, plush_*)
  const say=(t,c)=>SAY(t,c||'#f2c14e');
  // free play; tickets come out of the games and the token machine trades them, 10 for a market token
  const tok=()=>INV.items.arc_token||0, needTok=()=>'', payTok=()=>true;   // free play (owner, 5 Nov 2026)
  const win=n=>{ if(n>0){ INV.add('ptix',n); say(`${n} TICKET${n===1?'':'S'} COME OUT.`); } };
  ARCADE.skee=()=>MINI.open(SKEE.game({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'skee',score:S.score,tickets:S.tickets||0}; win(S.tickets||0); }}));
  ARCADE.hoops=()=>MINI.open(HOOPS.game({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'hoops',score:S.score,tickets:S.tickets||0}; win(S.tickets||0); }}));
  ARCADE.claw=()=>MINI.open(GAMES.claw({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'claw',won:!!S.won}; if(S.won){ INV.add('plush_bear',1); say('A PLUSH BEAR. IT IS IN YOUR PACK.'); } }}));
  ARCADE.hockey=()=>AIRH.play({end:S=>{ ARCADE.last={game:'hockey',won:!!S.won,score:S.score,level:S.level}; win(S.score); }});
  ARCADE.trade=()=>{ const have=INV.items.ptix||0, n=Math.floor(have/10); if(!n)return say(`YOU HAVE ${have} TICKET${have===1?'':'S'}. TEN MAKE A TOKEN.`,'#c8a090'); FORAGE.take('ptix',n*10); INV.add('arc_token',n); say(`${n*10} TICKETS IN, ${n} MARKET TOKEN${n===1?'':'S'} OUT. YOU HAVE ${tok()}.`); return n; };
  // where its people go: the floor man by the middle, the crowd on stools at the side cabinets, at PETRI, the lanes, the hockey table, the claw
  { const o=ROOMS.off.arcade; if(o&&o.ar){ const F=IKIT.frame(o.ar), W=F.W, du=W-14.8, dv=F.D-12.02, sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; }, YS=[2.4,5.36,8.32,11.28];
    o.spots={'RUNS THE FLOOR':sp(8.6,8.2,-1,0)};
    o.seats=ARCADE.places=[...YS.map(v=>sp(1.55,v,-1,0,.62)),...YS.map(v=>PIN.TABLES.some(t=>t[1]===v)?sp(W-PIN.U-PIN.STAND,v-.75,1,0):sp(W-1.55,v,1,0,.62)),sp(W/2+3.33,1.6,0,-1),sp(3.55,7.0,0,-1),sp(4.45,7.0,0,-1),sp(10.2+du,3.0,0,1),sp(9.2+du,4.65,1,0),sp(11.65+du/2,10.4+dv,0,1),sp(6.2,7.6,-1,0)]; } }
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.arcade=()=>{ '@later'; const o=ROOMS.off.arcade, F=IKIT.frame(o.ar), pw0=F.pw, OF=[0,0], at=(u,v)=>{ OF[0]=u; OF[1]=v; }; F.pw=(u,v)=>pw0(u+OF[0],v+OF[1]); const {W,D}=F, du=W-14.8, dv=D-12.02, K=IKIT.room(F,m=>scene.add(m),o.addSol), {glow,words,seat}=K, MW=K.MW, T=TILE, m2=f=>(a,b,...r)=>f(a+OF[0],b+OF[1],...r), m4=f=>(a,b,c,d,...r)=>f(a+OF[0],b+OF[1],c+OF[0],d+OF[1],...r), box=m4(K.box), sol=m4(K.sol), cyl=m2(K.cyl), ball=m2(K.ball), pic=m2(K.pic);
    const C={chrome:0xc0c4c8,black:0x141418,purple:0x4a2a7a,teal:0x2ab8b0,glass:0xa8c8d8,red:0xc02838,wood:0x8a5a2a};
    const thing=(name,u,v,w,h,act)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,w*MW),new THREE.MeshBasicMaterial({visible:false})), p=F.pw(u,v); hb.position.set(p[0],h/2*MW,p[1]); scene.add(hb); UI.thing({name,obj:hb,reach:1.5*T,near:2.6*T,tall:h*MW,act}); };
    // the claw machine by the door (laid out for the first, smaller room; each group moves with the walls it stood by)
    at(du/2,dv); box(11.2,10.9,12.1,11.8,0,.85,C.red); box(11.2,10.9,12.1,11.8,.85,1.75,C.glass); box(11.2,10.9,12.1,11.8,1.75,1.95,C.red); glow(()=>{ box(11.25,10.89,12.05,10.9,1.8,1.9,0xfff0b0); box(11.25,10.95,12.05,11.75,1.74,1.745,0xfff0e0); }); for(let i=0;i<9;i++)ball(11.35+(i%3)*.3,11.05+Math.floor(i/3)*.3,.98,.1,[0xc87a4a,0xe8a0c8,0x80c8f0][i%3]); cyl(11.65,11.35,.01,1.45,1.75,C.chrome); box(11.58,11.28,11.72,11.42,1.38,1.45,C.chrome); sol(11.2,10.9,12.1,11.8);
    thing('THE CLAW (1 TOKEN)',11.65,11.35,.9,1.95,ARCADE.claw);
    // the token machine and a soda machine on the east wall
    at(0,dv); box(W-.45,10.0,W,10.6,0,1.5,0x30343a); glow(()=>box(W-.46,10.15,W-.45,10.45,1.1,1.3,0x60ff90)); pic(W-.455,10.3,.7,.5,.3,-1,0,words(32,18,'#20242a',[['TOKENS',16,5,'#f2c14e',7,'center']]),true); sol(W-.45,10.0,W,10.6); thing('TOKEN MACHINE (10 TICKETS = 1 TOKEN)',W-.22,10.3,.6,1.5,ARCADE.trade); 
    box(W-.75,10.8,W,11.65,0,1.85,0xc02028); glow(()=>box(W-.76,10.9,W-.75,11.55,.9,1.7,0xfff0e0)); sol(W-.75,10.8,W,11.65); 
    // skee-ball: two lanes rising to their rings at the back
    at(0,0); for(const u0 of [3.2,4.1]){ box(u0,3.0,u0+.7,6.6,0,.75,0x6a3a1a); box(u0+.08,3.2,u0+.62,6.5,.75,.78,0xd8b878); box(u0,2.6,u0+.7,3.0,.75,1.6,0x2a2a32); for(const [r,h] of [[.2,1.05],[.13,1.25],[.07,1.42]])cyl(u0+.35,2.99,r,h-.02,h,0xf2c14e,r,16); glow(()=>{ box(u0+.05,2.62,u0+.65,2.64,1.55,1.6,0xff4fa0); for(const e of [u0,u0+.66])box(e,3.0,e+.04,6.6,.74,.78,0x40e0ff); box(u0+.1,6.58,u0+.6,6.61,.5,.6,0xf2c14e); }); sol(u0,2.6,u0+.7,6.6);
      thing('SKEE-BALL (1 TOKEN)',u0+.35,6.3,.7,1.0,ARCADE.skee); }
    // HOOP FEVER: a netted cage, its ramp rising to the hoop at the back, the console and marquee at the front
    { const u0=5.15, u1=6.19, uc=(u0+u1)/2, vb=3.3, vf=6.6, R=0xff2233, ICE=0xcfeaff;
      box(u0,vf-.45,u1,vf,0,.97,C.black); box(u0,vb,u1,vf-.45,0,1.05,0x0e0e12); box(u0+.04,vb,u1-.04,vf-.45,1.05,1.1,0x14151b);
      for(const e of [u0,u1-.045])for(const v of [vb,vf-.5])box(e,v,e+.045,v+.045,1.05,2.9,0x1a1a20); for(const e of [u0,u1-.04])box(e,vb,e+.04,vf-.45,2.86,2.9,0x1a1a20); box(u0,vb,u1,vb+.04,2.86,2.9,0x1a1a20); box(u0,vf-.5,u1,vf-.46,2.86,2.9,0x1a1a20);
      box(u0,vb-.04,u1,vb,1.05,2.9,0x22242c); box(uc-.3,vb,uc+.3,vb+.03,1.75,2.4,0xf2f2ee); box(uc-.12,vb+.03,uc+.12,vb+.035,1.83,2.0,R); cyl(uc,vb+.25,.16,1.84,1.86,0xe0431a); cyl(uc,vb+.25,.11,1.73,1.84,0xf4f4f4,.16,10);
      box(uc-.4,vb,uc+.4,vb+.04,2.48,2.76,C.black); pic(uc,vb+.045,2.62,.76,.24,0,1,words(48,16,'#060508',[['00',24,3,'#ff2d3d',10,'center']]),true);
      pic(uc,vf+.005,.5,.86,.86,0,1,words(48,48,'#101a36',[['HOOP',24,14,'#ffffff',12,'center'],['FEVER',24,28,'#8fd8ff',10,'center']]),true);
      glow(()=>{ for(const e of [u0-.01,u1-.004])box(e,vb+.03,e+.014,vb+.044,1.5,2.88,R); box(u0,vb+.03,u1,vb+.044,2.84,2.86,R); box(u0,vf-.45,u1,vf-.44,1.04,1.06,ICE); for(const e of [u0-.02,u1+.006])box(e,vf,e+.014,vf+.014,.05,.95,ICE); box(u0,vf,u1,vf+.014,.94,.96,R); });
      sol(u0,vb-.04,u1,vf); thing('HOOP FEVER (1 TOKEN)',uc,vf-.2,1.0,1.2,ARCADE.hoops); }
    // air hockey
    at(0,0); AIRH.put(F,K,10.2+du,4.65,m=>scene.add(m)); thing('AIR HOCKEY',10.2+du,4.65,1.2,.9,ARCADE.hockey);
    // stools at the side cabinets
    at(0,0); for(const v of [2.4,5.36,8.32,11.28])for(const u of [1.55,W-1.55])if(u<W/2||!PIN.TABLES.some(t=>t[1]===v))seat('STOOL',K.own(()=>{ cyl(u,v,.16,0,.04,C.chrome); cyl(u,v,.03,.04,.56,C.chrome); cyl(u,v,.18,.56,.62,C.purple,.17); }),[[u,v,.62,u<W/2?-1:1,0]],.8);
    // the pinball tables on the west wall, past its cabinets
    PIN.won=win; PIN.build(F,sol,(name,u,v,w,h,act)=>thing(name,u,v,w,h,act));
    K.flush();
    for(const [u,v,c,i,r] of [[4.0,4.8,0xff6ac0,5,6],[10.2+du,4.6,0x60c8ff,5,6],[11.6+du/2,11.0+dv,0xfff0d0,3,4]]){ const L=new THREE.PointLight(c,i,r*T,1.6), p=F.pw(u,v); L.position.set(p[0],2.5*MW,p[1]); scene.add(L); }
    WORKERS.make('arcade'); };
  window.ARCADEDBG=()=>({places:(ARCADE.places||[]).length,spots:Object.keys((ROOMS.off.arcade||{}).spots||{}),last:ARCADE.last||null});
}
