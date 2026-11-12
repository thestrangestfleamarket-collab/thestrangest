// THE ARCADE, FURNISHED: round the owner's cabinets and the holodeck door, what a real arcade has: skee-ball, air hockey, a claw machine and two pinball tables (each a game, free play), the token machine (tickets won at the games traded for market tokens, 10 for 1), a soda machine, stools at the cabinets; where its staff and its crowd stand or sit.
import {THREE} from './003-shx.js';
import {FORAGE, INV, ROOMS, UI, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {PIN} from './146zcz-pinball.js';
const ARCADE={}; window.ARCADE=ARCADE;
{ FORAGE.add({names:{arc_token:'A MARKET TOKEN',prize_yoyo:'A YO-YO',prize_ring:'A PLASTIC RING'}});   // the prize tickets and plushes are the fair's (ptix, plush_*)
  const say=(t,c)=>SAY(t,c||'#f2c14e');
  // free play; tickets come out of the games and the token machine trades them, 10 for a market token
  const tok=()=>INV.items.arc_token||0, needTok=()=>'', payTok=()=>true;   // free play (owner, 5 Nov 2026)
  const win=n=>{ if(n>0){ INV.add('ptix',n); say(`${n} TICKET${n===1?'':'S'} COME OUT.`); } };
  ARCADE.skee=()=>MINI.open(GAMES.skee({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'skee',score:S.score,tickets:S.tickets||0}; win(S.tickets||0); }}));
  ARCADE.claw=()=>MINI.open(GAMES.claw({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'claw',won:!!S.won}; if(S.won){ INV.add('plush_bear',1); say('A PLUSH BEAR. IT IS IN YOUR PACK.'); } }}));
  ARCADE.hockey=()=>MINI.open(GAMES.hockey({can:needTok,pay:payTok,end:S=>{ ARCADE.last={game:'hockey',won:!!S.won,score:S.score}; win(S.won?5:S.score); }}));
  ARCADE.trade=()=>{ const have=INV.items.ptix||0, n=Math.floor(have/10); if(!n)return say(`YOU HAVE ${have} TICKET${have===1?'':'S'}. TEN MAKE A TOKEN.`,'#c8a090'); FORAGE.take('ptix',n*10); INV.add('arc_token',n); say(`${n*10} TICKETS IN, ${n} MARKET TOKEN${n===1?'':'S'} OUT. YOU HAVE ${tok()}.`); return n; };
  // where its people go: the floor man by the middle, the crowd on stools at the side cabinets, at PETRI, the lanes, the hockey table, the claw
  { const o=ROOMS.off.arcade; if(o&&o.ar){ const F=IKIT.frame(o.ar), W=F.W, sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; }, YS=[2.03,4.34,6.66,8.97];
    o.spots={'RUNS THE FLOOR':sp(8.6,8.2,-1,0)};
    o.seats=ARCADE.places=[...YS.map(v=>sp(1.55,v,-1,0,.62)),...YS.map(v=>PIN.TABLES.some(t=>t[1]===v)?sp(W-PIN.U-PIN.STAND,v-.75,1,0):sp(W-1.55,v,1,0,.62)),sp(10.72,1.6,0,-1),sp(3.55,7.0,0,-1),sp(4.45,7.0,0,-1),sp(10.2,3.2,0,1),sp(10.2,6.1,0,-1),sp(11.65,10.4,0,1),sp(6.2,7.6,-1,0)]; } }
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.arcade=()=>{ '@later'; const o=ROOMS.off.arcade, F=IKIT.frame(o.ar), {W,D}=F, K=IKIT.room(F,m=>scene.add(m),o.addSol), {box,cyl,ball,glow,pic,words,sol,seat}=K, MW=K.MW, T=TILE;
    const C={chrome:0xc0c4c8,black:0x141418,purple:0x4a2a7a,teal:0x2ab8b0,glass:0xa8c8d8,red:0xc02838,wood:0x8a5a2a};
    const thing=(name,u,v,w,h,act)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,w*MW),new THREE.MeshBasicMaterial({visible:false})), p=F.pw(u,v); hb.position.set(p[0],h/2*MW,p[1]); scene.add(hb); UI.thing({name,obj:hb,reach:1.5*T,near:2.6*T,tall:h*MW,act}); };
    // the claw machine by the door
    box(11.2,10.9,12.1,11.8,0,.85,C.red); box(11.2,10.9,12.1,11.8,.85,1.75,C.glass); box(11.2,10.9,12.1,11.8,1.75,1.95,C.red); glow(()=>{ box(11.25,10.89,12.05,10.9,1.8,1.9,0xfff0b0); box(11.25,10.95,12.05,11.75,1.74,1.745,0xfff0e0); }); for(let i=0;i<9;i++)ball(11.35+(i%3)*.3,11.05+Math.floor(i/3)*.3,.98,.1,[0xc87a4a,0xe8a0c8,0x80c8f0][i%3]); cyl(11.65,11.35,.01,1.45,1.75,C.chrome); box(11.58,11.28,11.72,11.42,1.38,1.45,C.chrome); sol(11.2,10.9,12.1,11.8);
    thing('THE CLAW (1 TOKEN)',11.65,11.35,.9,1.95,ARCADE.claw);
    // the token machine and a soda machine on the east wall
    box(W-.45,10.0,W,10.6,0,1.5,0x30343a); glow(()=>box(W-.46,10.15,W-.45,10.45,1.1,1.3,0x60ff90)); pic(W-.455,10.3,.7,.5,.3,-1,0,words(32,18,'#20242a',[['TOKENS',16,5,'#f2c14e',7,'center']]),true); sol(W-.45,10.0,W,10.6); thing('TOKEN MACHINE (10 TICKETS = 1 TOKEN)',W-.22,10.3,.6,1.5,ARCADE.trade); 
    box(W-.75,10.8,W,11.65,0,1.85,0xc02028); glow(()=>box(W-.76,10.9,W-.75,11.55,.9,1.7,0xfff0e0)); sol(W-.75,10.8,W,11.65); 
    // skee-ball: two lanes rising to their rings at the back
    for(const u0 of [3.2,4.1]){ box(u0,3.0,u0+.7,6.6,0,.75,0x6a3a1a); box(u0+.08,3.2,u0+.62,6.5,.75,.78,0xd8b878); box(u0,2.6,u0+.7,3.0,.75,1.6,0x2a2a32); for(const [r,h] of [[.2,1.05],[.13,1.25],[.07,1.42]])cyl(u0+.35,2.99,r,h-.02,h,0xf2c14e,r,16); glow(()=>{ box(u0+.05,2.62,u0+.65,2.64,1.55,1.6,0xff4fa0); for(const e of [u0,u0+.66])box(e,3.0,e+.04,6.6,.74,.78,0x40e0ff); box(u0+.1,6.58,u0+.6,6.61,.5,.6,0xf2c14e); }); sol(u0,2.6,u0+.7,6.6);
      thing('SKEE-BALL (1 TOKEN)',u0+.35,6.3,.7,1.0,ARCADE.skee); }
    // air hockey
    box(9.6,3.6,10.8,5.7,0,.78,C.black); box(9.62,3.62,10.78,5.68,.78,.8,0xe8f0f4); box(9.6,4.63,10.8,4.67,.8,.805,C.red); cyl(10.2,4.2,.04,.8,.83,C.red); cyl(10.2,5.2,.04,.8,.83,0x2060c0); glow(()=>{ for(const e of [3.6,5.66])box(9.6,e,10.8,e+.04,.6,.66,0xff4fa0); for(const e of [9.6,10.76])box(e,3.6,e+.04,5.7,.6,.66,0x40e0ff); }); sol(9.6,3.6,10.8,5.7); thing('AIR HOCKEY (1 TOKEN)',10.2,4.65,1.2,.9,ARCADE.hockey);
    // stools at the side cabinets
    for(const v of [2.03,4.34,6.66,8.97])for(const u of [1.55,W-1.55])if(u<W/2||!PIN.TABLES.some(t=>t[1]===v))seat('STOOL',K.own(()=>{ cyl(u,v,.16,0,.04,C.chrome); cyl(u,v,.03,.04,.56,C.chrome); cyl(u,v,.18,.56,.62,C.purple,.17); }),[[u,v,.62,u<W/2?-1:1,0]],.8);
    // the pinball tables on the west wall, past its cabinets
    PIN.won=win; PIN.build(F,sol,(name,u,v,w,h,act)=>thing(name,u,v,w,h,act));
    K.flush();
    for(const [u,v,c,i,r] of [[4.0,4.8,0xff6ac0,5,6],[10.2,4.6,0x60c8ff,5,6],[11.6,11.0,0xfff0d0,3,4]]){ const L=new THREE.PointLight(c,i,r*T,1.6), p=F.pw(u,v); L.position.set(p[0],2.5*MW,p[1]); scene.add(L); }
    WORKERS.make('arcade'); };
  window.ARCADEDBG=()=>({places:(ARCADE.places||[]).length,spots:Object.keys((ROOMS.off.arcade||{}).spots||{}),last:ARCADE.last||null});
}
