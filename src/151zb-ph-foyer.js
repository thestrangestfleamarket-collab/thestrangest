// THE PLAYHOUSE AT WORK, THE WOODEN O (owner, 10 Nov 2026): the pay hatch in the gate passage sells a ticket (torn once a show, watching the play from a bench with one rests you), the programme reads by the gate; where its people go (the gatherer at the hatch, the book-holder in the tiring house door, a steward in each gallery) and the gallery seats for townspeople who come.
import {FORAGE, INV, ROOMS, st, USE, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {PHX} from './151b-ph-kit.js';
import {PHA} from './151c-ph-house.js';
const PLAYF={}; window.PLAYF=PLAYF;
{ FORAGE.add({names:{play_ticket:'A TICKET FOR THE PLAYHOUSE'}}); FORAGE.STOCK.push(()=>['play_ticket']);
  // where its people go, in the house's own metres (x across, z from the yard's middle to the gate)
  { const S=STORE.playFrame, R=ROOMS.off.playhouse; if(S&&R){ const D=PHA.D, PI=Math.PI, at=(x,z,hd,y)=>{ const w=S.W(x,0,z); return {x:w[0],z:w[2],hd,off:true,...(y!=null?{y:y*S.MV}:{})}; };
    R.spots={'BOX OFFICE':at(-D.GW-.5,10.6,PI/2),'BOOK-HOLDER':at(0,D.TZ+.4,0),'STEWARD, LOWER GALLERY':at(-5,7.6,PI*.75),'STEWARD, MIDDLE GALLERY':at(5,-6,PI*.25)};
    const seats=[], N=D.N, c=k=>k*2*PI/N, tan=Math.tan(PI/N); for(let k=2;k<N-1;k++){ if(D.SHUT.includes(k))continue; const a=D.A0+.9, L=2*a*tan-.6; for(const t of [-L/3,0,L/3]){ const s=Math.sin(c(k)), co=Math.cos(c(k)), x=s*a+co*t, z=co*a-s*t; seats.push(at(x,z,c(k)+PI,D.G1+.45)); } }
    R.seats=PLAYF.places=seats; } }
  PLAYF.buy=()=>IKIT.buy('play_ticket',8,'A TICKET FOR THE PLAYHOUSE. $8. IT IS IN YOUR PACK.');
  // a ticket and a bench while the play is on: an usher tears it once a show, and the show rests you
  const slot=()=>Math.floor((Date.now()/1000+60)/1800);
  VIT.mends.push(()=>{ if(!(USE.seat&&st.sit&&ROOMS.offIn&&ROOMS.offIn()==='playhouse'&&PHX.show&&PHX.show.running&&PHX.show.running()))return 0;
    if(PLAYF.torn!==slot()){ if(!(INV.items&&INV.items.play_ticket>0))return 0; FORAGE.take('play_ticket',1); PLAYF.torn=slot(); SAY('A STEWARD TEARS YOUR TICKET. ENJOY THE PLAY.','#f2c14e'); } return 1/30; });
  const PROG=[['A MIDSUMMER NIGHT\'S DREAM','ACT ONE · EVERY HOUR AND HALF HOUR'],['THE WOODEN O','A PLAYHOUSE, OPEN TO THE SKY'],['THE YARD','STAND WHERE YOU LIKE'],['THE GALLERIES','A BENCH, UP THE STAIR OR DOWN'],['THE STAGE','UNDER THE HEAVENS'],['TOTUS MUNDUS AGIT HISTRIONEM','ALL THE WORLD PLAYS THE PLAYER']];
  PLAYF.programme=()=>MINI.look('THE PROGRAMME',(g,w,h)=>{ g.fillStyle='#2a1a10'; g.fillRect(0,0,w,h); g.fillStyle='#efe2c0'; g.fillRect(16,16,w-32,h-32); g.textAlign='center'; g.textBaseline='top';
    PROG.forEach(([a,b],i)=>{ g.font=(i?'bold 13px':'bold 18px')+' Georgia,serif'; g.fillStyle=i?'#2a1a10':'#6a1a1a'; g.fillText(a,w/2,30+i*40); g.font='10px monospace'; g.fillStyle='#6a5a4a'; g.fillText(b,w/2,(i?47:52)+i*40); }); },'A ticket at the pay hatch in the gate passage.');
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.playhouse=(S,PK)=>{ '@later'; const {B,MH,MV}=S, F=IKIT.frame({x0:B.x0,y0:B.z0,x1:B.x1,y1:B.z1},(x,z)=>[S.OX+x*MH,S.OZ+z*MH]), K=IKIT.room(F,o=>scene.add(o),()=>{}), u=x=>x-B.x0, v=z=>z-B.z0, hz=h=>h*MV/MH, D=PHA.D;
    const H=PK&&PK.hatch||{x:-D.GW+.2,y:1.4,z:10.6};
    K.use('THE PAY HATCH (A TICKET, $8)',u(H.x),v(H.z),.9,hz(H.y+.6),PLAYF.buy,1.6);
    K.use('THE PROGRAMME (READ)',u(D.GW-.3),v(D.A1-1.2),.7,hz(2.2),PLAYF.programme,1.6);
    K.flush(); };
}
