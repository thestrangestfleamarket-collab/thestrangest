// THE MOVIE THEATRE, FURNISHED: a concession stand on the back wall beside the screen, run by THE RACCOON (popcorn from the machine, nachos, candy, soda), its menu board, aisle lights on the steps; watching a film from a recliner rests you; where the doorman, the usher and the moviegoers (the twelve recliners) go.
import {SHARED} from './003-shx.js';
import {CINEMA, FORAGE, SHOPS, st, USE, VIT, WORKERS} from './003b-systems.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const THEATRE={}; window.THEATRE=THEATRE;
{ FORAGE.add({names:{f_popcorn:'A TUB OF POPCORN',f_nachos:'A TRAY OF NACHOS',f_candybox:'A BOX OF CANDY'},does:{f_popcorn:()=>FORAGE.feed(.15),f_nachos:()=>FORAGE.feed(.3),f_candybox:()=>{ FORAGE.feed(.1); VIT.sta=Math.min(1,VIT.sta+.2); }}});
  const BOD=SHARED.BOD, TM=.924;   // a theatre tile in metres
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='theatre');
  // the room in metres: u east from the screen wall, v south from the back wall to the street front
  const frameOf=B=>IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1});
  const geo=B=>{ const cy=(B.y0+B.y1)/2, FX=B.x0+5.35, P=1.45, NR=Math.min(4,Math.floor((B.x1-.1-FX-1.2)/P)); return {cy,FX,P,NR,RISE:19,BN:[B.y0+1.2,cy-.55],BS:[cy+.55,B.y1-1.75],TX:FX+NR*P}; };   // the tiers as 059-street lays them
  // where its people go: the doorman by the door, the usher on the landing, the raccoon behind the stand; the moviegoers in the recliners (facing the screen), two waiting at the stand
  const place=R=>{ const B=R.B; { const G=geo(B), W=(x,y)=>({x:BOD.X(x),z:BOD.Z(y)}), at=(x,y,hd,h)=>({...W(x,y),hd,...(h!=null?{y:h}:{})});
    R.spots={'DOORMAN, TICKETS WITH THE TICKET FOX':at(B.x0+3.3,B.y1-2.2,Math.PI/2),USHER:at(G.TX+.8,G.cy,-Math.PI/2),CONCESSIONS:at(B.x0+2.6,B.y0+.5,0)};
    const S=[]; for(let i=0;i<G.NR;i++){ const xb=G.FX+(i+1)*G.P, h=(i+1)*G.RISE; for(const [a,b] of [G.BN,G.BS]){ const w=(b-a)/2; for(let s=0;s<2;s++)S.push(at(xb-.72,a+(s+.5)*w,-Math.PI/2,BOD.Y(14))); } }
    R.seats=THEATRE.places=[...S,at(B.x0+2.0,B.y0+2.2,Math.PI),at(B.x0+3.2,B.y0+2.2,Math.PI)]; } };
  // the street lays the theatre out after this file: its lists go in as soon as it is there
  { let done=false; const go=()=>{ if(done)return; const R=room(); if(R&&R.B){ place(R); done=true; } }; go(); SYS.add('life',go,'146zf-theatre'); }
  // a film watched from a recliner rests you
  VIT.mends.push(()=>USE.seat&&st.sit&&STORE.here&&STORE.here('theatre')&&CINEMA.playing&&CINEMA.playing()?1/40:0);
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.theatre=B=>{ '@later'; const F=frameOf(B), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,pic,words,sol,use,MW}=K, G=geo(B);
    const U=x=>(x-B.x0-.1)*TM, V=y=>(y-B.y0-.1)*TM, PX=px=>BOD.Y(px)/MW, C={steel:0xa8acb0,red:0xa81c28,dark:0x1c1a20,glass:0xcfe3ea,gold:0xc8a040,white:0xf2f2f0};
    // the stand: a long counter on the back wall's west end, the raccoon between it and the wall
    const u0=U(B.x0+1.3), u1=U(B.x0+4.1), v0=V(B.y0+.75), v1=V(B.y0+1.35);
    box(u0,v0,u1,v1,0,.95,C.red); box(u0-.03,v0-.03,u1+.03,v1+.03,.95,1.0,C.dark); glow(()=>box(u0+.05,v1+.03,u1-.05,v1+.04,.85,.9,0xffc860)); sol(u0,v0,u1,v1);
    // the popcorn machine: a glass box of popcorn under a red hood
    const pu=u0+.45, pv=(v0+v1)/2; box(pu-.3,pv-.22,pu+.3,pv+.22,1.0,1.08,C.red); box(pu-.28,pv-.2,pu+.28,pv+.2,1.08,1.55,C.glass); for(let i=0;i<18;i++)ball(pu-.22+(i%6)*.088,pv-.12+Math.floor(i/6)*.12,1.12+.04*(i%3),.05,0xfff0b0); box(pu-.32,pv-.24,pu+.32,pv+.24,1.55,1.68,C.red); glow(()=>box(pu-.26,pv-.18,pu+.26,pv+.18,1.54,1.55,0xfff4c0));
    // the soda fountain, the nacho warmer, the candy case
    const su=u0+1.25; box(su-.25,pv-.2,su+.25,pv+.2,1.0,1.5,C.dark); for(let i=0;i<3;i++)box(su-.18+i*.14,pv+.2,su-.12+i*.14,pv+.24,1.2,1.3,C.steel); glow(()=>box(su-.2,pv+.201,su+.2,pv+.202,1.32,1.45,0x40a0ff));
    const nu=u0+1.85; box(nu-.2,pv-.18,nu+.2,pv+.18,1.0,1.25,C.steel); glow(()=>box(nu-.17,pv+.181,nu+.17,pv+.182,1.05,1.2,0xff9030)); for(let i=0;i<6;i++)ball(nu-.12+(i%3)*.12,pv-.06+Math.floor(i/3)*.1,1.08,.035,0xf0c040,.4);
    const cu=u1-.45; box(cu-.4,v0+.02,cu+.4,v0+.3,.55,.93,C.glass); for(let i=0;i<10;i++)box(cu-.36+(i%5)*.15,v0+.06,cu-.26+(i%5)*.15,v0+.12,.6+Math.floor(i/5)*.17,.74+Math.floor(i/5)*.17,[0xd02030,0x2050c0,0xf0c020,0x30a040,0x8030a0][i%5]);
    for(let i=0;i<5;i++)cyl(u1-.15,pv-.1,.08,1.0+i*.11,1.1+i*.11,0xe02030,.09);   // a stack of popcorn tubs
    // the menu board and the CONCESSIONS neon on the back wall
    const MENU=IKIT.tex(128,48,(g,w,h)=>{ g.fillStyle='#120c10'; g.fillRect(0,0,w,h); g.font='9px monospace'; g.textBaseline='top'; [['POPCORN','$3'],['NACHOS','$4'],['CANDY','$2'],['SODA','$3']].forEach(([a,b],i)=>{ g.fillStyle='#ffd070'; g.textAlign='left'; g.fillText(a,8,6+i*10); g.textAlign='right'; g.fillStyle='#f4ecd8'; g.fillText(b,w-8,6+i*10); }); });
    pic((u0+u1)/2,.11,1.75,1.6,.6,0,1,MENU,true); pic((u0+u1)/2,.11,2.45,1.8,.3,0,1,IKIT.tex(96,16,(g,w,h)=>{ g.fillStyle='#0a0608'; g.fillRect(0,0,w,h); g.font='bold 11px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor='#ff3a5a'; g.shadowBlur=5; g.fillStyle='#ffc0d0'; g.fillText('CONCESSIONS',w/2,h/2); }),true);
    use('THE CONCESSION STAND (ORDER)',(u0+u1)/2+.3,(v0+v1)/2,1.0,1.2,()=>SHOPS.open({key:'w_raccoon',name:'THE CONCESSION STAND'}),1.8);
    use('THE POPCORN MACHINE (A TUB $3)',pu,pv,.6,1.7,()=>IKIT.buy('f_popcorn',3,'A TUB OF POPCORN, BUTTERED. $3.'),1.8);
    use('THE MENU BOARD',(u0+u1)/2-.5,.3,.6,2.4,()=>MINI.look('CONCESSIONS',MENU),2.4);
    // aisle lights: a small warm light on the front edge of every aisle step
    for(let i=0;i<G.NR;i++){ const xf=G.FX+i*G.P, xm=xf+G.P/2, h=(i+1)*G.RISE; for(const [x,hp] of [[xf,h-G.RISE/2],[xm,h]])glow(()=>{ for(const y of [G.cy-.5,G.cy+.5])box(U(x)-.04,V(y)-.05,U(x),V(y)+.05,PX(hp)-.05,PX(hp)-.02,0xffd890); }); }
    K.flush();
    // the raccoon goes to its spot once the street has put the theatre on its list (this build can come first)
    const mk=(n=0)=>{ const R=room(); if(R&&R.B){ if(!R.spots)place(R); WORKERS.make('theatre'); } else if(n<120)setTimeout(()=>mk(n+1),500); }; mk(); };
}
